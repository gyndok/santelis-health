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

    await supabase.from("reviews").delete().eq("practice_id", auth.practiceId);

    if (reviews.length > 0) {
      const rows = reviews.map((r: Record<string, unknown>) => ({
        practice_id: auth.practiceId,
        author_name: r.author_name || "",
        rating: r.rating || 5,
        text: r.text || "",
        review_date: r.review_date || null,
        source: r.source || "manual",
      }));

      const { error } = await supabase.from("reviews").insert(rows);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("practice_id", auth.practiceId)
      .order("review_date", { ascending: false });

    return NextResponse.json({ reviews: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
