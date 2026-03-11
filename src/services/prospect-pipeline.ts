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
    let duplicateQuery = supabase.from("prospects").select("id");

    if (result.websiteUrl) {
      duplicateQuery = duplicateQuery.or(
        `website_url.eq.${result.websiteUrl},and(practice_name.eq.${result.practiceName},city.eq.${result.city})`,
      );
    } else {
      duplicateQuery = duplicateQuery
        .eq("practice_name", result.practiceName)
        .eq("city", result.city);
    }

    const { data: existing } = await duplicateQuery.limit(1);

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
        provider_name: "",
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

  if (prospect.website_url) {
    try {
      scrapedData = await scrapeWebsite(prospect.website_url);
    } catch (err) {
      console.error(`Scrape failed for ${prospect.website_url}:`, err);
    }

    try {
      const psResult = await getPageSpeedScore(prospect.website_url);
      pageSpeed = psResult.performanceScore;
    } catch (err) {
      console.error(`PageSpeed failed for ${prospect.website_url}:`, err);
    }
  }

  const qualificationScore = calculateQualificationScore({
    hasWebsite: !!prospect.website_url,
    pageSpeedScore: pageSpeed ?? undefined,
    scrapedData: scrapedData ?? undefined,
    googleRating: prospect.google_rating ?? undefined,
    googleReviewCount: prospect.google_review_count ?? undefined,
  });

  const outreachStatus =
    qualificationScore >= QUALIFICATION_THRESHOLD ? "qualified" : prospect.outreach_status;

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

  const { data: existing } = await supabase
    .from("prospects")
    .select("id")
    .eq("website_url", params.url)
    .limit(1);

  if (existing && existing.length > 0) {
    throw new Error("This URL has already been scraped");
  }

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

  const result = await scrapeAndScoreProspect(prospect.id);

  return {
    id: prospect.id,
    qualificationScore: result.qualificationScore,
    outreachStatus: result.outreachStatus,
  };
}
