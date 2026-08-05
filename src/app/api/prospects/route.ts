import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-auth";

const SORTABLE_COLUMNS = new Set([
  "qualification_score",
  "created_at",
  "practice_name",
  "city",
  "outreach_status",
]);

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const minScore = searchParams.get("minScore");
    const specialty = searchParams.get("specialty");
    const sortByParam = searchParams.get("sortBy") || "qualification_score";
    const sortBy = SORTABLE_COLUMNS.has(sortByParam) ? sortByParam : "qualification_score";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("prospects")
      .select("*", { count: "exact" })
      .order(sortBy, { ascending: sortOrder === "asc" })
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
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("List prospects error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list prospects" },
      { status: 500 },
    );
  }
}
