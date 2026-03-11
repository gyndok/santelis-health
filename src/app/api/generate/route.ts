import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { PracticeConfig, Service } from "@/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Turn a practice name into a URL-safe subdomain slug. */
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, "")           // remove apostrophes / smart quotes
    .replace(/[^a-z0-9]+/g, "-")    // non-alphanum -> hyphen
    .replace(/^-+|-+$/g, "");       // trim leading/trailing hyphens
}

/** Ensure the subdomain is unique. If taken, append -2, -3, etc. */
async function uniqueSubdomain(base: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  let candidate = base;
  let suffix = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data } = await supabase
      .from("practices")
      .select("id")
      .eq("subdomain", candidate)
      .maybeSingle();

    if (!data) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

/** Generate basic SEO config from practice data. */
function buildSeoConfig(
  practiceName: string,
  specialty: string,
  city: string,
  state: string,
  tagline?: string,
) {
  const specialtyLabel = specialty
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const locationStr = [city, state].filter(Boolean).join(", ");

  const siteTitle = locationStr
    ? `${practiceName} | ${specialtyLabel} in ${locationStr}`
    : `${practiceName} | ${specialtyLabel}`;

  const siteDescription =
    tagline ||
    `${practiceName} provides expert ${specialtyLabel.toLowerCase()} care${locationStr ? ` in ${locationStr}` : ""}. Book an appointment today.`;

  const keywords = [
    practiceName,
    specialtyLabel.toLowerCase(),
    ...(city ? [`${specialtyLabel.toLowerCase()} ${city}`] : []),
    ...(city ? [`doctor ${city}`] : []),
    ...(locationStr ? [locationStr] : []),
  ];

  return {
    siteTitle,
    siteDescription,
    keywords,
    structuredData: {},
  };
}

// ---------------------------------------------------------------------------
// POST /api/generate
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = (await request.json()) as Partial<PracticeConfig>;

    // --- Validate required fields ------------------------------------------
    if (!body.practiceName || !body.specialty) {
      return NextResponse.json(
        { error: "Practice name and specialty are required." },
        { status: 400 },
      );
    }

    // --- Derive subdomain --------------------------------------------------
    const baseSlug = toSlug(body.practiceName);
    if (!baseSlug) {
      return NextResponse.json(
        { error: "Could not generate a valid subdomain from the practice name." },
        { status: 400 },
      );
    }
    const subdomain = await uniqueSubdomain(baseSlug);

    // --- Resolve location city/state for SEO --------------------------------
    const firstLocation = body.locations?.[0];
    const city = firstLocation?.city ?? "";
    const state = firstLocation?.state ?? "";

    // --- Build SEO config --------------------------------------------------
    const seoConfig = buildSeoConfig(
      body.practiceName,
      body.specialty,
      city,
      state,
      body.branding?.tagline,
    );

    // -----------------------------------------------------------------------
    // 1. Insert practice
    // -----------------------------------------------------------------------
    const { data: practice, error: practiceError } = await supabase
      .from("practices")
      .insert({
        name: body.practiceName,
        specialty: body.specialty,
        subdomain,
        status: "preview",
        plan: "starter",
        branding: body.branding ?? {},
        seo_config: seoConfig,
        integrations: {},
        insurances_accepted: [],
        owner_email: body.ownerEmail ?? null,
      })
      .select("id")
      .single();

    if (practiceError || !practice) {
      console.error("Failed to insert practice:", practiceError);
      return NextResponse.json(
        { error: "Failed to create practice." },
        { status: 500 },
      );
    }

    const practiceId: string = practice.id;

    // -----------------------------------------------------------------------
    // 2. Insert provider
    // -----------------------------------------------------------------------
    const provider = body.providers?.[0];
    if (provider) {
      const { error: providerError } = await supabase
        .from("providers")
        .insert({
          practice_id: practiceId,
          first_name: provider.firstName,
          last_name: provider.lastName,
          credentials: provider.credentials || "",
          title: provider.title ?? null,
          bio: provider.bio || "",
          photo_url: provider.photoUrl ?? null,
          education: provider.education ?? [],
          board_certifications: provider.boardCertifications ?? [],
          languages: provider.languages ?? [],
          display_order: 0,
        });

      if (providerError) {
        console.error("Failed to insert provider:", providerError);
        // Non-fatal — we still return the slug so the user sees something
      }
    }

    // -----------------------------------------------------------------------
    // 3. Insert services (with display_order)
    // -----------------------------------------------------------------------
    if (body.services && body.services.length > 0) {
      const serviceRows = body.services.map((svc: Service, idx: number) => ({
        practice_id: practiceId,
        title: svc.title,
        description: svc.description || "",
        icon: svc.icon ?? null,
        featured: svc.featured ?? false,
        link_url: svc.linkUrl ?? null,
        display_order: idx,
      }));

      const { error: servicesError } = await supabase
        .from("services")
        .insert(serviceRows);

      if (servicesError) {
        console.error("Failed to insert services:", servicesError);
      }
    }

    // -----------------------------------------------------------------------
    // 4. Insert location
    // -----------------------------------------------------------------------
    if (firstLocation) {
      const { error: locationError } = await supabase
        .from("locations")
        .insert({
          practice_id: practiceId,
          name: firstLocation.name ?? null,
          address: firstLocation.address || "",
          city: firstLocation.city || "",
          state: firstLocation.state || "",
          zip: firstLocation.zip || "",
          phone: firstLocation.phone || "",
          fax: firstLocation.fax ?? null,
          email: firstLocation.email ?? null,
          hours: firstLocation.hours ?? {},
          google_maps_embed_url: firstLocation.googleMapsEmbedUrl ?? null,
          lat: firstLocation.coordinates?.lat ?? null,
          lng: firstLocation.coordinates?.lng ?? null,
        });

      if (locationError) {
        console.error("Failed to insert location:", locationError);
      }
    }

    // -----------------------------------------------------------------------
    // 5. Return the subdomain slug
    // -----------------------------------------------------------------------
    return NextResponse.json({ slug: subdomain }, { status: 201 });
  } catch (err) {
    console.error("Unhandled error in /api/generate:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
