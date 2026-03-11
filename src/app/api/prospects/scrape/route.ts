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
