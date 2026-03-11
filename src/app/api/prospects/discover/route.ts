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
