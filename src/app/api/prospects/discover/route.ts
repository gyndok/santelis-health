import { NextRequest, NextResponse } from "next/server";
import { discoverProspects } from "@/services/prospect-pipeline";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
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
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Discovery error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Discovery failed" },
      { status: 500 },
    );
  }
}
