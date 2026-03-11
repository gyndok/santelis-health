import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { authenticateDashboard } from "@/lib/dashboard-auth";

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateDashboard(request);
    const supabase = getSupabaseAdmin();
    const { providers } = await request.json();

    if (!Array.isArray(providers)) {
      return NextResponse.json({ error: "providers must be an array" }, { status: 400 });
    }

    // Delete existing providers and re-insert
    await supabase.from("providers").delete().eq("practice_id", auth.practiceId);

    if (providers.length > 0) {
      const rows = providers.map((p: Record<string, unknown>, i: number) => ({
        practice_id: auth.practiceId,
        first_name: p.first_name || "",
        last_name: p.last_name || "",
        credentials: p.credentials || "",
        title: p.title || null,
        bio: p.bio || "",
        photo_url: p.photo_url || null,
        education: p.education || [],
        board_certifications: p.board_certifications || [],
        languages: p.languages || [],
        display_order: i,
      }));

      const { error } = await supabase.from("providers").insert(rows);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    const { data } = await supabase
      .from("providers")
      .select("*")
      .eq("practice_id", auth.practiceId)
      .order("display_order");

    return NextResponse.json({ providers: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
