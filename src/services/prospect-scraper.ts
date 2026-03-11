import Firecrawl from "@mendable/firecrawl-js";
import type { ScrapedWebsiteData } from "@/types";

let firecrawl: Firecrawl | null = null;

function getFirecrawl(): Firecrawl {
  if (!firecrawl) {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) throw new Error("Missing FIRECRAWL_API_KEY");
    firecrawl = new Firecrawl({ apiKey });
  }
  return firecrawl;
}

/**
 * Scrape a prospect's website using Firecrawl and extract structured data.
 */
export async function scrapeWebsite(url: string): Promise<ScrapedWebsiteData> {
  const fc = getFirecrawl();

  const result = await fc.scrape(url, {
    formats: ["markdown", "html"],
  });

  const markdown = result.markdown || "";
  const html = result.html || "";
  const metadata = result.metadata || {};

  return {
    providerNames: extractProviderNames(markdown),
    services: extractServices(markdown),
    aboutText: extractAboutText(markdown),
    contactInfo: extractContactInfo(markdown),
    officeHours: extractOfficeHours(markdown),
    metaTags: {
      title: metadata.title || undefined,
      description: metadata.description || undefined,
      viewport: extractViewportMeta(html),
    },
    hasSSL: url.startsWith("https://"),
    hasStructuredData: html.includes("schema.org") || html.includes("application/ld+json"),
    hasViewportMeta: html.includes("viewport"),
    rawMarkdown: markdown.slice(0, 10000), // cap storage size
  };
}

// --- Extraction helpers ---

function extractProviderNames(markdown: string): string[] {
  const patterns = [
    /(?:Dr\.?\s+)([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g,
    /([A-Z][a-z]+\s+[A-Z][a-z]+),?\s*(?:MD|DO|NP|PA|FACOG|FACS|FAAP)/g,
  ];
  const names = new Set<string>();
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(markdown)) !== null) {
      names.add(match[1].trim());
    }
  }
  return Array.from(names);
}

function extractServices(markdown: string): string[] {
  const serviceKeywords = [
    "annual exam", "well-woman", "prenatal", "obstetric", "gynecolog",
    "minimally invasive", "weight loss", "weight management", "dermatolog",
    "cosmetic", "botox", "filler", "skin", "orthopedic", "joint replacement",
    "sports medicine", "physical therapy", "pediatric", "vaccination",
    "immunization", "cardiology", "heart", "internal medicine", "primary care",
    "family medicine", "urgent care", "telemedicine", "telehealth",
  ];
  const lines = markdown.split("\n");
  const services: string[] = [];
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (serviceKeywords.some((kw) => lower.includes(kw)) && line.trim().length < 100) {
      const cleaned = line.replace(/^[#\-*•]+\s*/, "").trim();
      if (cleaned.length > 3 && cleaned.length < 80) {
        services.push(cleaned);
      }
    }
  }
  return [...new Set(services)].slice(0, 20);
}

function extractAboutText(markdown: string): string {
  const aboutPatterns = [/(?:about|bio|meet|our doctor|our provider|our team)[^\n]*\n([\s\S]{50,500}?)(?:\n#|\n\n\n)/i];
  for (const pattern of aboutPatterns) {
    const match = pattern.exec(markdown);
    if (match) return match[1].trim();
  }
  // Fallback: grab the first substantial paragraph
  const paragraphs = markdown.split("\n\n").filter((p) => p.length > 100);
  return paragraphs[0]?.slice(0, 500) || "";
}

function extractContactInfo(markdown: string): ScrapedWebsiteData["contactInfo"] {
  const phoneMatch = markdown.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const emailMatch = markdown.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const faxMatch = markdown.match(/[Ff]ax[:\s]*\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);

  return {
    phone: phoneMatch?.[0],
    email: emailMatch?.[0],
    fax: faxMatch?.[0]?.replace(/[Ff]ax[:\s]*/, ""),
  };
}

function extractOfficeHours(markdown: string): string[] {
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const lines = markdown.split("\n");
  const hours: string[] = [];
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (days.some((d) => lower.includes(d)) && /\d/.test(line)) {
      hours.push(line.replace(/^[|*\-#]+\s*/, "").trim());
    }
  }
  return hours;
}

function extractViewportMeta(html: string): string | undefined {
  const match = html.match(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']+)["']/i);
  return match?.[1];
}
