import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { authenticateDashboard } from "@/lib/dashboard-auth";

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateDashboard(request);
    const supabase = getSupabaseAdmin();
    const body = await request.json();

    // Update or insert the first location
    const { data: existing } = await supabase
      .from("locations")
      .select("id")
      .eq("practice_id", auth.practiceId)
      .limit(1)
      .maybeSingle();

    const locationData = {
      practice_id: auth.practiceId,
      name: body.name || null,
      address: body.address || "",
      city: body.city || "",
      state: body.state || "",
      zip: body.zip || "",
      phone: body.phone || "",
      fax: body.fax || null,
      email: body.email || null,
      hours: body.hours || {},
      google_maps_embed_url: body.google_maps_embed_url || null,
    };

    if (existing) {
      const { error } = await supabase
        .from("locations")
        .update(locationData)
        .eq("id", existing.id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      const { error } = await supabase.from("locations").insert(locationData);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    const { data } = await supabase
      .from("locations")
      .select("*")
      .eq("practice_id", auth.practiceId);

    return NextResponse.json({ locations: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
