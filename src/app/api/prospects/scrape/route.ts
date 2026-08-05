import { NextRequest, NextResponse } from "next/server";
import { scrapeUrl, scrapeAndScoreProspect } from "@/services/prospect-pipeline";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
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
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Scrape error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Scrape failed" },
      { status: 500 },
    );
  }
}
