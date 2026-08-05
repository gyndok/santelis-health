import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

/**
 * Lazily initialized Anthropic client (mirrors supabase-admin.ts) so that
 * importing this module never crashes a build/boot when the key is unset.
 */
function getAnthropic(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("Missing ANTHROPIC_API_KEY environment variable.");
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

/** Extract the text block from a response, throwing on refusals/empty output. */
function textOf(response: Anthropic.Message): string {
  if (response.stop_reason === "refusal") {
    throw new Error("Model declined to generate content for this request.");
  }
  const block = response.content.find((b) => b.type === "text");
  if (!block || !block.text.trim()) {
    throw new Error("Model returned no text content.");
  }
  return block.text;
}

/** Generate a professional bio from provider credentials */
export async function generateBio(provider: {
  firstName: string;
  lastName: string;
  credentials: string;
  education: { institution: string; degree: string; honors?: string }[];
  boardCertifications: { board: string; specialty: string }[];
  specialty: string;
}): Promise<string> {
  const response = await getAnthropic().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: `Write a professional, warm 2-paragraph bio for a medical practice website. Use third person.

Provider: ${provider.firstName} ${provider.lastName}, ${provider.credentials}
Specialty: ${provider.specialty}
Education: ${provider.education.map((e) => `${e.degree} from ${e.institution}${e.honors ? ` (${e.honors})` : ""}`).join("; ")}
Board Certifications: ${provider.boardCertifications.map((c) => `${c.board} — ${c.specialty}`).join("; ")}

Keep it professional but approachable. No bullet points. Include all credentials naturally.`,
      },
    ],
  });

  return textOf(response);
}

/** Generate SEO-optimized meta description for a page */
export async function generateMetaDescription(input: {
  practiceName: string;
  specialty: string;
  city: string;
  state: string;
  pageName: string;
}): Promise<string> {
  const response = await getAnthropic().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `Write a single SEO meta description (max 155 characters) for the ${input.pageName} page of a medical practice website.

Practice: ${input.practiceName}
Specialty: ${input.specialty}
Location: ${input.city}, ${input.state}

Include the location and specialty. Make it compelling for patients searching Google. Respond with the meta description only — no preamble.`,
      },
    ],
  });

  return textOf(response);
}

const BLOG_POST_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    content: { type: "string", description: "The blog post body in markdown" },
    metaDescription: { type: "string", description: "SEO meta description, max 155 chars" },
  },
  required: ["title", "content", "metaDescription"],
  additionalProperties: false,
} as const;

/** Generate a blog post on a health topic */
export async function generateBlogPost(input: {
  topic: string;
  specialty: string;
  providerName: string;
  targetKeywords: string[];
}): Promise<{ title: string; content: string; metaDescription: string }> {
  // Structured output guarantees schema-valid JSON — no fence-stripping or
  // parse retries needed.
  const response = await getAnthropic().messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4000,
    output_config: {
      format: { type: "json_schema", schema: BLOG_POST_SCHEMA },
    },
    messages: [
      {
        role: "user",
        content: `Write a patient-friendly blog post for a ${input.specialty} practice website.

Topic: ${input.topic}
Author: ${input.providerName}
Target SEO keywords: ${input.targetKeywords.join(", ")}

Requirements:
- 500-800 words
- Written at an 8th grade reading level
- Include the SEO keywords naturally (don't stuff)
- Use H2 and H3 subheadings in the markdown content
- End with a brief call-to-action to schedule an appointment
- Do NOT include medical disclaimers (we add those automatically)`,
      },
    ],
  });

  if (response.stop_reason === "max_tokens") {
    throw new Error("Blog post generation was truncated; increase max_tokens.");
  }

  return JSON.parse(textOf(response));
}
