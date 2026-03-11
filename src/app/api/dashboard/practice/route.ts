import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { authenticateDashboard } from "@/lib/dashboard-auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateDashboard(request);
    const supabase = getSupabaseAdmin();

    const { data: practice, error } = await supabase
      .from("practices")
      .select("*")
      .eq("id", auth.practiceId)
      .single();

    if (error || !practice) {
      return NextResponse.json({ error: "Practice not found" }, { status: 404 });
    }

    // Also fetch related data
    const [providers, services, locations, reviews] = await Promise.all([
      supabase.from("providers").select("*").eq("practice_id", auth.practiceId).order("display_order"),
      supabase.from("services").select("*").eq("practice_id", auth.practiceId).order("display_order"),
      supabase.from("locations").select("*").eq("practice_id", auth.practiceId),
      supabase.from("reviews").select("*").eq("practice_id", auth.practiceId).order("review_date", { ascending: false }),
    ]);

    return NextResponse.json({
      practice,
      providers: providers.data || [],
      services: services.data || [],
      locations: locations.data || [],
      reviews: reviews.data || [],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    if (message === "No practice found") {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateDashboard(request);
    const supabase = getSupabaseAdmin();
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.specialty !== undefined) updateData.specialty = body.specialty;
    if (body.sub_specialties !== undefined) updateData.sub_specialties = body.sub_specialties;
    if (body.insurances_accepted !== undefined) updateData.insurances_accepted = body.insurances_accepted;
    if (body.seo_config !== undefined) updateData.seo_config = body.seo_config;

    const { data, error } = await supabase
      .from("practices")
      .update(updateData)
      .eq("id", auth.practiceId)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ practice: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
