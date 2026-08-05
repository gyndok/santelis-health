import type { ScrapedWebsiteData } from "@/types";

interface PageSpeedResult {
  performanceScore: number; // 0-100
}

/**
 * Fetch Google PageSpeed Insights score for a URL.
 * Unkeyed access is heavily rate-limited; set PAGESPEED_API_KEY for volume.
 */
export async function getPageSpeedScore(url: string): Promise<PageSpeedResult> {
  const key = process.env.PAGESPEED_API_KEY;
  const apiUrl =
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&strategy=mobile` +
    (key ? `&key=${key}` : "");

  // PSI regularly takes 30-60s; without a timeout a hung call stalls the
  // whole scrape-and-score request.
  const response = await fetch(apiUrl, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) {
    throw new Error(`PageSpeed API error: ${response.status}`);
  }

  const data = await response.json();
  const raw = data.lighthouseResult?.categories?.performance?.score;
  if (typeof raw !== "number") {
    // A missing score must not read as "0 = terrible site" — that awards
    // qualification points for what is actually a failed measurement.
    throw new Error("PageSpeed response missing performance score");
  }

  return { performanceScore: Math.round(raw * 100) };
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
