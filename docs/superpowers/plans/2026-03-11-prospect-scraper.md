# Prospect Scraper Pipeline — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a prospect discovery and qualification system that finds doctors via Google Maps, scrapes their websites with Firecrawl, scores them as leads, and provides an admin UI to review and trigger demo site generation.

**Architecture:** Service layer (pure business logic) → API routes (thin HTTP wrappers) → Admin UI (Next.js pages with password protection). All prospect data stored in the existing `prospects` Supabase table. Demo generation reuses the existing `/api/generate` endpoint.

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase (via service role key), Google Maps Places API (New), Firecrawl SDK, Google PageSpeed Insights API, Tailwind CSS, Lucide React icons.

---

## File Structure

### New Files

| File | Responsibility |
|---|---|
| `src/services/prospect-discovery.ts` | Google Maps Places API search, extract practice data |
| `src/services/prospect-scraper.ts` | Firecrawl website scraping, structured data extraction |
| `src/services/prospect-scorer.ts` | PageSpeed fetch + qualification scoring algorithm |
| `src/services/prospect-pipeline.ts` | Orchestrates discover → scrape → score → save |
| `src/app/api/prospects/discover/route.ts` | POST — search by location |
| `src/app/api/prospects/scrape/route.ts` | POST — scrape single URL |
| `src/app/api/prospects/route.ts` | GET — list prospects with filters |
| `src/app/api/prospects/[id]/generate-demo/route.ts` | POST — trigger demo generation |
| `src/app/admin/prospects/page.tsx` | Admin dashboard UI |
| `src/app/admin/login/page.tsx` | Admin login page |
| `src/middleware.ts` | Password protection for /admin/* routes |

### Modified Files

| File | Change |
|---|---|
| `src/types/index.ts` | Add `no-website` to Prospect outreach status, add `ScrapedWebsiteData` type |
| `supabase/schema.sql` | Add `no-website` to outreach_status CHECK constraint |
| `.env.local` | Add `ADMIN_PASSWORD` |
| `.env.example` | Add `ADMIN_PASSWORD` placeholder |

---

## Chunk 1: Foundation — Types, DB Migration, Dependencies

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Firecrawl SDK**

```bash
cd /Users/gyndok/Developer/santelis-health && npm install @mendable/firecrawl-js
```

- [ ] **Step 2: Verify install**

```bash
cd /Users/gyndok/Developer/santelis-health && node -e "require('@mendable/firecrawl-js')"
```

Expected: No error output.

- [ ] **Step 3: Commit**

```bash
cd /Users/gyndok/Developer/santelis-health && git add package.json package-lock.json && git commit -m "chore: add firecrawl SDK dependency"
```

### Task 2: Update types

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Add `no-website` to Prospect outreach status and add ScrapedWebsiteData type**

In `src/types/index.ts`, update the `Prospect` interface's `outreachStatus` union to include `"no-website"` and add a new `ScrapedWebsiteData` interface:

```typescript
// Add to the outreachStatus union in Prospect:
outreachStatus: "discovered" | "no-website" | "qualified" | "demo-generated" | "emailed" | "opened" | "clicked" | "signed-up" | "converted" | "opted-out";

// Add after the Prospect interface:
export interface ScrapedWebsiteData {
  providerNames: string[];
  services: string[];
  aboutText: string;
  contactInfo: {
    phone?: string;
    email?: string;
    fax?: string;
    address?: string;
  };
  officeHours: string[];
  metaTags: {
    title?: string;
    description?: string;
    viewport?: string;
  };
  hasSSL: boolean;
  hasStructuredData: boolean;
  hasViewportMeta: boolean;
  rawMarkdown: string;
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/gyndok/Developer/santelis-health && git add src/types/index.ts && git commit -m "feat: add no-website status and ScrapedWebsiteData type"
```

### Task 3: Update DB schema

**Files:**
- Modify: `supabase/schema.sql`

- [ ] **Step 1: Update the CHECK constraint in schema.sql**

Update the `outreach_status` CHECK constraint in the `prospects` table to include `'no-website'`:

```sql
CHECK (outreach_status IN (
  'discovered', 'no-website', 'qualified', 'demo-generated', 'emailed',
  'opened', 'clicked', 'signed-up', 'converted', 'opted-out'
))
```

- [ ] **Step 2: Run migration in Supabase SQL editor**

The user must run this SQL in Supabase dashboard → SQL Editor:

```sql
ALTER TABLE prospects DROP CONSTRAINT IF EXISTS prospects_outreach_status_check;
ALTER TABLE prospects ADD CONSTRAINT prospects_outreach_status_check
  CHECK (outreach_status IN (
    'discovered', 'no-website', 'qualified', 'demo-generated', 'emailed',
    'opened', 'clicked', 'signed-up', 'converted', 'opted-out'
  ));
```

- [ ] **Step 3: Commit**

```bash
cd /Users/gyndok/Developer/santelis-health && git add supabase/schema.sql && git commit -m "feat: add no-website to prospect outreach_status"
```

---

## Chunk 2: Service Layer — Discovery, Scraping, Scoring

### Task 4: Build prospect discovery service

**Files:**
- Create: `src/services/prospect-discovery.ts`

- [ ] **Step 1: Create the discovery service**

```typescript
// src/services/prospect-discovery.ts

interface PlaceResult {
  displayName: string;
  formattedAddress: string;
  nationalPhoneNumber?: string;
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  location?: { latitude: number; longitude: number };
}

interface DiscoveryResult {
  practiceName: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  websiteUrl: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
}

/**
 * Search Google Maps Places API (New) for doctors in a location.
 * Returns up to 20 results per query.
 */
export async function discoverByLocation(params: {
  city: string;
  state: string;
  specialty?: string;
}): Promise<DiscoveryResult[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("Missing GOOGLE_MAPS_API_KEY");

  const searchTerm = params.specialty
    ? `${params.specialty} doctor in ${params.city} ${params.state}`
    : `doctor in ${params.city} ${params.state}`;

  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.websiteUri,places.location",
      },
      body: JSON.stringify({
        textQuery: searchTerm,
        maxResultCount: 20,
      }),
    },
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Places API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const places: PlaceResult[] = (data.places || []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p: any) => ({
      displayName: p.displayName?.text || "",
      formattedAddress: p.formattedAddress || "",
      nationalPhoneNumber: p.nationalPhoneNumber || "",
      rating: p.rating ?? null,
      userRatingCount: p.userRatingCount ?? null,
      websiteUri: p.websiteUri || null,
      location: p.location || null,
    }),
  );

  return places.map((p) => {
    const { city, state } = parseAddress(p.formattedAddress);
    return {
      practiceName: p.displayName,
      address: p.formattedAddress,
      city,
      state,
      phone: p.nationalPhoneNumber || "",
      websiteUrl: p.websiteUri || null,
      googleRating: p.rating,
      googleReviewCount: p.userRatingCount,
    };
  });
}

/** Extract city and state from a formatted address like "123 Main St, Houston, TX 77001, USA" */
function parseAddress(address: string): { city: string; state: string } {
  const parts = address.split(",").map((s) => s.trim());
  if (parts.length >= 3) {
    const city = parts[parts.length - 3] || "";
    const stateZip = parts[parts.length - 2] || "";
    const state = stateZip.split(" ")[0] || "";
    return { city, state };
  }
  return { city: "", state: "" };
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/gyndok/Developer/santelis-health && git add src/services/prospect-discovery.ts && git commit -m "feat: add prospect discovery service (Google Maps Places)"
```

### Task 5: Build prospect scraper service

**Files:**
- Create: `src/services/prospect-scraper.ts`

- [ ] **Step 1: Create the scraper service**

```typescript
// src/services/prospect-scraper.ts

import FirecrawlApp from "@mendable/firecrawl-js";
import type { ScrapedWebsiteData } from "@/types";

let firecrawl: FirecrawlApp | null = null;

function getFirecrawl(): FirecrawlApp {
  if (!firecrawl) {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) throw new Error("Missing FIRECRAWL_API_KEY");
    firecrawl = new FirecrawlApp({ apiKey });
  }
  return firecrawl;
}

/**
 * Scrape a prospect's website using Firecrawl and extract structured data.
 */
export async function scrapeWebsite(url: string): Promise<ScrapedWebsiteData> {
  const fc = getFirecrawl();

  const result = await fc.scrapeUrl(url, {
    formats: ["markdown", "html"],
  });

  if (!result.success) {
    throw new Error(`Firecrawl scrape failed: ${result.error || "unknown error"}`);
  }

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
```

- [ ] **Step 2: Commit**

```bash
cd /Users/gyndok/Developer/santelis-health && git add src/services/prospect-scraper.ts && git commit -m "feat: add prospect scraper service (Firecrawl)"
```

### Task 6: Build prospect scorer service

**Files:**
- Create: `src/services/prospect-scorer.ts`

- [ ] **Step 1: Create the scorer service**

```typescript
// src/services/prospect-scorer.ts

import type { ScrapedWebsiteData } from "@/types";

interface PageSpeedResult {
  performanceScore: number; // 0-100
}

/**
 * Fetch Google PageSpeed Insights score for a URL.
 * No API key needed for low volume.
 */
export async function getPageSpeedScore(url: string): Promise<PageSpeedResult> {
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&strategy=mobile`;

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`PageSpeed API error: ${response.status}`);
  }

  const data = await response.json();
  const score = Math.round(
    (data.lighthouseResult?.categories?.performance?.score ?? 0) * 100,
  );

  return { performanceScore: score };
}

/**
 * Calculate qualification score based on scraped data and PageSpeed results.
 * Higher score = better lead (worse current website).
 */
export function calculateQualificationScore(params: {
  hasWebsite: boolean;
  pageSpeedScore?: number;
  scrapedData?: ScrapedWebsiteData;
  googleRating?: number;
  googleReviewCount?: number;
}): number {
  let score = 0;

  // No website at all — best lead
  if (!params.hasWebsite) {
    score += 50;
  }

  // PageSpeed scoring
  if (params.pageSpeedScore !== undefined) {
    if (params.pageSpeedScore < 50) {
      score += 30;
    } else if (params.pageSpeedScore <= 70) {
      score += 15;
    }
  }

  if (params.scrapedData) {
    // No SSL
    if (!params.scrapedData.hasSSL) {
      score += 20;
    }

    // No mobile responsive meta tag
    if (!params.scrapedData.hasViewportMeta) {
      score += 15;
    }

    // No structured data
    if (!params.scrapedData.hasStructuredData) {
      score += 10;
    }
  }

  // Good practice with bad site (high Google rating)
  if (params.googleRating && params.googleRating >= 4.0) {
    score += 10;
  }

  // Many reviews = established practice
  if (params.googleReviewCount && params.googleReviewCount >= 20) {
    score += 5;
  }

  return score;
}

/** Threshold for a prospect to be considered "qualified" */
export const QUALIFICATION_THRESHOLD = 40;
```

- [ ] **Step 2: Commit**

```bash
cd /Users/gyndok/Developer/santelis-health && git add src/services/prospect-scorer.ts && git commit -m "feat: add prospect scorer service (PageSpeed + qualification)"
```

### Task 7: Build prospect pipeline orchestrator

**Files:**
- Create: `src/services/prospect-pipeline.ts`

- [ ] **Step 1: Create the pipeline service**

```typescript
// src/services/prospect-pipeline.ts

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { discoverByLocation } from "./prospect-discovery";
import { scrapeWebsite } from "./prospect-scraper";
import {
  getPageSpeedScore,
  calculateQualificationScore,
  QUALIFICATION_THRESHOLD,
} from "./prospect-scorer";

interface DiscoverParams {
  city: string;
  state: string;
  specialty?: string;
}

interface DiscoverResult {
  total: number;
  new: number;
  skipped: number;
  prospects: Array<{ id: string; practiceName: string; outreachStatus: string }>;
}

/**
 * Discover prospects via Google Maps, save to DB, skip duplicates.
 */
export async function discoverProspects(
  params: DiscoverParams,
): Promise<DiscoverResult> {
  const supabase = getSupabaseAdmin();
  const results = await discoverByLocation(params);

  let newCount = 0;
  let skippedCount = 0;
  const savedProspects: Array<{
    id: string;
    practiceName: string;
    outreachStatus: string;
  }> = [];

  for (const result of results) {
    // Check for duplicates by website URL or practice name + city
    const { data: existing } = await supabase
      .from("prospects")
      .select("id")
      .or(
        result.websiteUrl
          ? `website_url.eq.${result.websiteUrl},and(practice_name.eq.${result.practiceName},city.eq.${result.city})`
          : `and(practice_name.eq.${result.practiceName},city.eq.${result.city})`,
      )
      .limit(1);

    if (existing && existing.length > 0) {
      skippedCount++;
      continue;
    }

    const status = result.websiteUrl ? "discovered" : "no-website";
    const qualScore = result.websiteUrl
      ? 0
      : calculateQualificationScore({
          hasWebsite: false,
          googleRating: result.googleRating ?? undefined,
          googleReviewCount: result.googleReviewCount ?? undefined,
        });

    const { data: prospect, error } = await supabase
      .from("prospects")
      .insert({
        practice_name: result.practiceName,
        provider_name: "", // filled later by scraping
        specialty: params.specialty || "unknown",
        website_url: result.websiteUrl,
        address: result.address,
        city: result.city,
        state: result.state,
        phone: result.phone,
        google_rating: result.googleRating,
        google_review_count: result.googleReviewCount,
        qualification_score: qualScore,
        outreach_status: qualScore >= QUALIFICATION_THRESHOLD ? "qualified" : status,
      })
      .select("id, practice_name, outreach_status")
      .single();

    if (error) {
      console.error(`Failed to insert prospect ${result.practiceName}:`, error);
      continue;
    }

    newCount++;
    savedProspects.push({
      id: prospect.id,
      practiceName: prospect.practice_name,
      outreachStatus: prospect.outreach_status,
    });
  }

  return {
    total: results.length,
    new: newCount,
    skipped: skippedCount,
    prospects: savedProspects,
  };
}

/**
 * Scrape and score a single prospect by ID.
 */
export async function scrapeAndScoreProspect(prospectId: string): Promise<{
  qualificationScore: number;
  outreachStatus: string;
  pageSpeed: number | null;
}> {
  const supabase = getSupabaseAdmin();

  // Fetch the prospect
  const { data: prospect, error } = await supabase
    .from("prospects")
    .select("*")
    .eq("id", prospectId)
    .single();

  if (error || !prospect) {
    throw new Error(`Prospect not found: ${prospectId}`);
  }

  let scrapedData = null;
  let pageSpeed: number | null = null;

  // Scrape website if URL exists
  if (prospect.website_url) {
    try {
      scrapedData = await scrapeWebsite(prospect.website_url);
    } catch (err) {
      console.error(`Scrape failed for ${prospect.website_url}:`, err);
    }

    // Get PageSpeed score
    try {
      const psResult = await getPageSpeedScore(prospect.website_url);
      pageSpeed = psResult.performanceScore;
    } catch (err) {
      console.error(`PageSpeed failed for ${prospect.website_url}:`, err);
    }
  }

  // Calculate qualification score
  const qualificationScore = calculateQualificationScore({
    hasWebsite: !!prospect.website_url,
    pageSpeedScore: pageSpeed ?? undefined,
    scrapedData: scrapedData ?? undefined,
    googleRating: prospect.google_rating ?? undefined,
    googleReviewCount: prospect.google_review_count ?? undefined,
  });

  const outreachStatus =
    qualificationScore >= QUALIFICATION_THRESHOLD ? "qualified" : prospect.outreach_status;

  // Update prospect in DB
  const updateData: Record<string, unknown> = {
    qualification_score: qualificationScore,
    outreach_status: outreachStatus,
  };
  if (scrapedData) updateData.scraped_data = scrapedData;
  if (pageSpeed !== null) updateData.current_page_speed = pageSpeed;
  if (scrapedData?.providerNames?.[0]) {
    updateData.provider_name = scrapedData.providerNames[0];
  }
  if (scrapedData?.contactInfo?.email) {
    updateData.email = scrapedData.contactInfo.email;
  }

  await supabase.from("prospects").update(updateData).eq("id", prospectId);

  return { qualificationScore, outreachStatus, pageSpeed };
}

/**
 * Scrape a single URL directly (not from discovery).
 * Creates prospect, scrapes, scores, saves.
 */
export async function scrapeUrl(params: {
  url: string;
  specialty?: string;
}): Promise<{ id: string; qualificationScore: number; outreachStatus: string }> {
  const supabase = getSupabaseAdmin();

  // Check for duplicate
  const { data: existing } = await supabase
    .from("prospects")
    .select("id")
    .eq("website_url", params.url)
    .limit(1);

  if (existing && existing.length > 0) {
    throw new Error("This URL has already been scraped");
  }

  // Create prospect stub
  const { data: prospect, error } = await supabase
    .from("prospects")
    .insert({
      practice_name: new URL(params.url).hostname.replace("www.", ""),
      provider_name: "",
      specialty: params.specialty || "unknown",
      website_url: params.url,
      outreach_status: "discovered",
    })
    .select("id")
    .single();

  if (error || !prospect) {
    throw new Error(`Failed to create prospect: ${error?.message}`);
  }

  // Scrape and score
  const result = await scrapeAndScoreProspect(prospect.id);

  return {
    id: prospect.id,
    qualificationScore: result.qualificationScore,
    outreachStatus: result.outreachStatus,
  };
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/gyndok/Developer/santelis-health && git add src/services/prospect-pipeline.ts && git commit -m "feat: add prospect pipeline orchestrator"
```

---

## Chunk 3: API Routes

### Task 8: Create prospect discovery API route

**Files:**
- Create: `src/app/api/prospects/discover/route.ts`

- [ ] **Step 1: Create the route**

```typescript
// src/app/api/prospects/discover/route.ts

import { NextRequest, NextResponse } from "next/server";
import { discoverProspects } from "@/services/prospect-pipeline";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.city || !body.state) {
      return NextResponse.json(
        { error: "city and state are required" },
        { status: 400 },
      );
    }

    const result = await discoverProspects({
      city: body.city,
      state: body.state,
      specialty: body.specialty || undefined,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Discovery error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Discovery failed" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/gyndok/Developer/santelis-health && git add src/app/api/prospects/discover/route.ts && git commit -m "feat: add POST /api/prospects/discover route"
```

### Task 9: Create prospect scrape API route

**Files:**
- Create: `src/app/api/prospects/scrape/route.ts`

- [ ] **Step 1: Create the route**

```typescript
// src/app/api/prospects/scrape/route.ts

import { NextRequest, NextResponse } from "next/server";
import { scrapeUrl, scrapeAndScoreProspect } from "@/services/prospect-pipeline";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Scrape by URL (new prospect)
    if (body.url) {
      const result = await scrapeUrl({
        url: body.url,
        specialty: body.specialty || undefined,
      });
      return NextResponse.json(result);
    }

    // Scrape existing prospect by ID
    if (body.prospectId) {
      const result = await scrapeAndScoreProspect(body.prospectId);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Either url or prospectId is required" },
      { status: 400 },
    );
  } catch (err) {
    console.error("Scrape error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Scrape failed" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/gyndok/Developer/santelis-health && git add src/app/api/prospects/scrape/route.ts && git commit -m "feat: add POST /api/prospects/scrape route"
```

### Task 10: Create prospect list API route

**Files:**
- Create: `src/app/api/prospects/route.ts`

- [ ] **Step 1: Create the route**

```typescript
// src/app/api/prospects/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const minScore = searchParams.get("minScore");
    const specialty = searchParams.get("specialty");
    const sortBy = searchParams.get("sortBy") || "qualification_score";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("prospects")
      .select("*", { count: "exact" })
      .order(sortBy as string, { ascending: sortOrder === "asc" })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("outreach_status", status);
    }
    if (minScore) {
      query = query.gte("qualification_score", parseInt(minScore));
    }
    if (specialty && specialty !== "all") {
      query = query.eq("specialty", specialty);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Supabase query error: ${error.message}`);
    }

    return NextResponse.json({ prospects: data, total: count });
  } catch (err) {
    console.error("List prospects error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list prospects" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/gyndok/Developer/santelis-health && git add src/app/api/prospects/route.ts && git commit -m "feat: add GET /api/prospects list route"
```

### Task 11: Create demo generation API route

**Files:**
- Create: `src/app/api/prospects/[id]/generate-demo/route.ts`

- [ ] **Step 1: Create the route**

```typescript
// src/app/api/prospects/[id]/generate-demo/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { specialtyConfigs } from "@/config/specialties";
import type { Specialty } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    // Fetch the prospect
    const { data: prospect, error } = await supabase
      .from("prospects")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !prospect) {
      return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    }

    if (prospect.demo_slug) {
      return NextResponse.json({
        slug: prospect.demo_slug,
        message: "Demo already generated",
      });
    }

    // Map scraped data to PracticeConfig
    const scrapedData = prospect.scraped_data || {};
    const specialty = (prospect.specialty || "family-medicine") as Specialty;
    const specConfig = specialtyConfigs[specialty] || specialtyConfigs["family-medicine"];

    // Build the practice config for /api/generate
    const practiceConfig = {
      practiceName: prospect.practice_name,
      specialty,
      providers: [
        {
          firstName: (prospect.provider_name || prospect.practice_name).split(" ")[0] || "",
          lastName: (prospect.provider_name || prospect.practice_name).split(" ").slice(1).join(" ") || "",
          credentials: "MD",
          bio: scrapedData.aboutText || `Welcome to ${prospect.practice_name}. We provide quality ${specConfig.label.toLowerCase()} care.`,
          education: [],
          boardCertifications: [],
          languages: ["English"],
        },
      ],
      services: (scrapedData.services || specConfig.defaultServices)
        .slice(0, 8)
        .map((s: string | { title: string; description: string }, i: number) => ({
          id: `svc-${i}`,
          title: typeof s === "string" ? s : s.title,
          description: typeof s === "string" ? "" : s.description,
          featured: i < 3,
        })),
      locations: [
        {
          address: prospect.address || "",
          city: prospect.city || "",
          state: prospect.state || "",
          zip: "",
          phone: prospect.phone || scrapedData.contactInfo?.phone || "",
          email: prospect.email || scrapedData.contactInfo?.email || "",
          hours: {},
        },
      ],
      branding: {
        colorPalette: specConfig.palette,
        tagline: `Quality ${specConfig.label} Care in ${prospect.city || "Your Area"}`,
      },
    };

    // Call the existing generate endpoint internally
    const generateResponse = await fetch(
      new URL("/api/generate", request.url).toString(),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(practiceConfig),
      },
    );

    if (!generateResponse.ok) {
      const errData = await generateResponse.json();
      throw new Error(errData.error || "Demo generation failed");
    }

    const { slug } = await generateResponse.json();

    // Update prospect with demo slug
    await supabase
      .from("prospects")
      .update({
        demo_slug: slug,
        outreach_status: "demo-generated",
      })
      .eq("id", id);

    return NextResponse.json({ slug, demoUrl: `/demo/${slug}` });
  } catch (err) {
    console.error("Generate demo error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Demo generation failed" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/gyndok/Developer/santelis-health && git add src/app/api/prospects/\\[id\\]/generate-demo/route.ts && git commit -m "feat: add POST /api/prospects/[id]/generate-demo route"
```

---

## Chunk 4: Admin Auth & UI

### Task 12: Add admin password middleware

**Files:**
- Create: `src/middleware.ts`
- Modify: `.env.local`
- Modify: `.env.example`

- [ ] **Step 1: Add ADMIN_PASSWORD to env files**

Add to `.env.local`:
```
ADMIN_PASSWORD=santelis2026
```

Add to `.env.example`:
```
# Admin
ADMIN_PASSWORD=
```

- [ ] **Step 2: Create middleware**

```typescript
// src/middleware.ts

import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Only protect /admin routes
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow the login page itself
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Allow the login API
  if (request.nextUrl.pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  // Check for auth cookie
  const authCookie = request.cookies.get("admin_auth")?.value;
  const password = process.env.ADMIN_PASSWORD;

  if (!password || authCookie !== password) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

- [ ] **Step 3: Create login API route**

```typescript
// src/app/api/admin/login/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const correctPassword = process.env.ADMIN_PASSWORD;

  if (!correctPassword || password !== correctPassword) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_auth", password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return response;
}
```

- [ ] **Step 4: Commit**

```bash
cd /Users/gyndok/Developer/santelis-health && git add src/middleware.ts src/app/api/admin/login/route.ts .env.example && git commit -m "feat: add admin password middleware and login API"
```

### Task 13: Create admin login page

**Files:**
- Create: `src/app/admin/login/page.tsx`

- [ ] **Step 1: Create login page**

```tsx
// src/app/admin/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin/prospects");
      } else {
        setError("Invalid password");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm space-y-4"
      >
        <h1 className="text-xl font-bold text-gray-900">Admin Access</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Checking..." : "Enter"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/gyndok/Developer/santelis-health && git add src/app/admin/login/page.tsx && git commit -m "feat: add admin login page"
```

### Task 14: Create admin prospects dashboard

**Files:**
- Create: `src/app/admin/prospects/page.tsx`

- [ ] **Step 1: Create the admin dashboard**

This is the main UI file — a client component with:
- Location search form (city, state, optional specialty dropdown)
- URL scrape form
- Prospect table with sorting, filtering, status badges
- Actions: Scrape, Generate Demo, View Demo
- Expandable row detail showing scraped data

The component should:
- Fetch prospects on mount via `GET /api/prospects`
- Call `POST /api/prospects/discover` for location search
- Call `POST /api/prospects/scrape` for URL scraping and re-scraping
- Call `POST /api/prospects/[id]/generate-demo` for demo generation
- Show loading states during API calls
- Display count badges for each status filter
- Sort by qualification_score desc by default

Key UI elements:
- Top section: two search forms side by side (location + URL)
- Filter bar: All | No Website | Discovered | Qualified | Demo Generated (with counts)
- Table columns: Practice Name, City/State, Specialty, Rating, PageSpeed, Score, Status, Actions
- Score shown with color coding: green (60+), yellow (40-59), gray (<40)
- Status badges with colored pills
- "Scrape" button appears when status is `discovered`
- "Generate Demo" button appears when status is `qualified`
- "View Demo" link appears when status is `demo-generated`

Full implementation with Tailwind CSS, Lucide icons, and all the API integrations.

- [ ] **Step 2: Commit**

```bash
cd /Users/gyndok/Developer/santelis-health && git add src/app/admin/prospects/page.tsx && git commit -m "feat: add admin prospects dashboard"
```

---

## Chunk 5: Env Setup & Deploy

### Task 15: Add ADMIN_PASSWORD to Vercel

- [ ] **Step 1: User action — add to Vercel env vars**

Go to Vercel → santelis-health → Settings → Environment Variables and add:
- `ADMIN_PASSWORD` = (choose a password)

### Task 16: Run DB migration

- [ ] **Step 1: User action — run SQL in Supabase**

Go to Supabase → SQL Editor and run:

```sql
ALTER TABLE prospects DROP CONSTRAINT IF EXISTS prospects_outreach_status_check;
ALTER TABLE prospects ADD CONSTRAINT prospects_outreach_status_check
  CHECK (outreach_status IN (
    'discovered', 'no-website', 'qualified', 'demo-generated', 'emailed',
    'opened', 'clicked', 'signed-up', 'converted', 'opted-out'
  ));
```

### Task 17: Push to GitHub and verify deployment

- [ ] **Step 1: Push**

```bash
cd /Users/gyndok/Developer/santelis-health && git push origin main
```

- [ ] **Step 2: Verify deployment**

After Vercel auto-deploys:
1. Go to `santelishealth.com/admin/prospects` — should redirect to login
2. Enter password — should show dashboard
3. Search for a location — should find doctors
4. Click Scrape on a result — should scrape and score
5. If score >= 40, click Generate Demo — should create demo site

---
