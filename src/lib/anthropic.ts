import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/** Generate a professional bio from provider credentials */
export async function generateBio(provider: {
  firstName: string;
  lastName: string;
  credentials: string;
  education: { institution: string; degree: string; honors?: string }[];
  boardCertifications: { board: string; specialty: string }[];
  specialty: string;
}): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
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

  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}

/** Generate SEO-optimized meta description for a page */
export async function generateMetaDescription(input: {
  practiceName: string;
  specialty: string;
  city: string;
  state: string;
  pageName: string;
}): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: `Write a single SEO meta description (max 155 characters) for the ${input.pageName} page of a medical practice website.

Practice: ${input.practiceName}
Specialty: ${input.specialty}
Location: ${input.city}, ${input.state}

Include the location and specialty. Make it compelling for patients searching Google.`,
      },
    ],
  });

  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}

/** Generate a blog post on a health topic */
export async function generateBlogPost(input: {
  topic: string;
  specialty: string;
  providerName: string;
  targetKeywords: string[];
}): Promise<{ title: string; content: string; metaDescription: string }> {
  const response = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2000,
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
- Use H2 and H3 subheadings
- End with a brief call-to-action to schedule an appointment
- Do NOT include medical disclaimers (we add those automatically)

Return as JSON: { "title": "...", "content": "...(markdown)...", "metaDescription": "...(max 155 chars)..." }`,
      },
    ],
  });

  const block = response.content[0];
  if (block.type === "text") {
    return JSON.parse(block.text);
  }
  throw new Error("Unexpected response format");
}

export default anthropic;
