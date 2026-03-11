import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { specialtyConfigs } from "@/config/specialties";
import type { Specialty } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    // Fetch the prospect
    const { data: prospect, error } = await supabase
      .from("prospects")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !prospect) {
      return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    }

    if (prospect.demo_slug) {
      return NextResponse.json({
        slug: prospect.demo_slug,
        message: "Demo already generated",
      });
    }

    // Map scraped data to PracticeConfig
    const scrapedData = prospect.scraped_data || {};
    const specialty = (prospect.specialty || "family-medicine") as Specialty;
    const specConfig = specialtyConfigs[specialty] || specialtyConfigs["family-medicine"];

    // Build the practice config for /api/generate
    const providerName = prospect.provider_name || prospect.practice_name;
    const practiceConfig = {
      practiceName: prospect.practice_name,
      specialty,
      providers: [
        {
          firstName: providerName.split(" ")[0] || "",
          lastName: providerName.split(" ").slice(1).join(" ") || "",
          credentials: "MD",
          bio: scrapedData.aboutText || `Welcome to ${prospect.practice_name}. We provide quality ${specConfig.label.toLowerCase()} care.`,
          education: [],
          boardCertifications: [],
          languages: ["English"],
        },
      ],
      services: (scrapedData.services || specConfig.defaultServices)
        .slice(0, 8)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((s: any, i: number) => ({
          id: `svc-${i}`,
          title: typeof s === "string" ? s : s.title,
          description: typeof s === "string" ? "" : s.description,
          featured: i < 3,
        })),
      locations: [
        {
          address: prospect.address || "",
          city: prospect.city || "",
          state: prospect.state || "",
          zip: "",
          phone: prospect.phone || scrapedData.contactInfo?.phone || "",
          email: prospect.email || scrapedData.contactInfo?.email || "",
          hours: {},
        },
      ],
      branding: {
        colorPalette: specConfig.palette,
        tagline: `Quality ${specConfig.label} Care in ${prospect.city || "Your Area"}`,
      },
    };

    // Call the existing generate endpoint internally
    const generateResponse = await fetch(
      new URL("/api/generate", request.url).toString(),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(practiceConfig),
      },
    );

    if (!generateResponse.ok) {
      const errData = await generateResponse.json();
      throw new Error(errData.error || "Demo generation failed");
    }

    const { slug } = await generateResponse.json();

    // Update prospect with demo slug
    await supabase
      .from("prospects")
      .update({
        demo_slug: slug,
        outreach_status: "demo-generated",
      })
      .eq("id", id);

    return NextResponse.json({ slug, demoUrl: `/demo/${slug}` });
  } catch (err) {
    console.error("Generate demo error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Demo generation failed" },
      { status: 500 },
    );
  }
}
