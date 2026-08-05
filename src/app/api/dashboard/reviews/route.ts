import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { authenticateDashboard } from "@/lib/dashboard-auth";

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateDashboard(request);
    const supabase = getSupabaseAdmin();
    const { reviews } = await request.json();

    if (!Array.isArray(reviews)) {
      return NextResponse.json({ error: "reviews must be an array" }, { status: 400 });
    }

    // Atomic replace: delete + insert run in one transaction inside the RPC.
    const { data, error } = await supabase.rpc("replace_reviews", {
      p_practice_id: auth.practiceId,
      p_rows: reviews,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reviews: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
