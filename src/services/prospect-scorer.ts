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
