import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { authenticateDashboard } from "@/lib/dashboard-auth";

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateDashboard(request);
    const supabase = getSupabaseAdmin();
    const { services } = await request.json();

    if (!Array.isArray(services)) {
      return NextResponse.json({ error: "services must be an array" }, { status: 400 });
    }

    await supabase.from("services").delete().eq("practice_id", auth.practiceId);

    if (services.length > 0) {
      const rows = services.map((s: Record<string, unknown>, i: number) => ({
        practice_id: auth.practiceId,
        title: s.title || "",
        description: s.description || "",
        icon: s.icon || null,
        featured: s.featured ?? false,
        link_url: s.link_url || null,
        display_order: i,
      }));

      const { error } = await supabase.from("services").insert(rows);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("practice_id", auth.practiceId)
      .order("display_order");

    return NextResponse.json({ services: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
