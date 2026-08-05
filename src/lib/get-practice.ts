import { createClient } from "@supabase/supabase-js";
import type {
  PracticeConfig,
  Provider,
  Service,
  OfficeLocation,
  Review,
  Specialty,
  Branding,
  SEOConfig,
  Integrations,
} from "@/types";

// ---------------------------------------------------------------------------
// Server-side Supabase client (created fresh per request)
// ---------------------------------------------------------------------------

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  return createClient(url, key);
}

// ---------------------------------------------------------------------------
// Fetch a PracticeConfig from Supabase by subdomain (slug)
// ---------------------------------------------------------------------------

export async function getPracticeBySlug(
  slug: string,
): Promise<PracticeConfig | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    // 1. Fetch the practice row by subdomain
    // Explicit columns: never expose stripe_customer_id / owner_email to
    // page rendering. Drafts are not publicly viewable; demos use 'preview'.
    const { data: practice, error: practiceError } = await supabase
      .from("practices")
      .select(
        "id, name, specialty, sub_specialties, subdomain, domain, plan, status, branding, seo_config, integrations, insurances_accepted, created_at, updated_at",
      )
      .eq("subdomain", slug)
      .in("status", ["preview", "live"])
      .single();

    if (practiceError || !practice) return null;

    const practiceId: string = practice.id;

    // 2. Fetch related tables in parallel
    const [providersRes, servicesRes, locationsRes, reviewsRes] =
      await Promise.all([
        supabase
          .from("providers")
          .select("*")
          .eq("practice_id", practiceId)
          .order("display_order", { ascending: true }),
        supabase
          .from("services")
          .select("*")
          .eq("practice_id", practiceId)
          .order("display_order", { ascending: true }),
        supabase
          .from("locations")
          .select("*")
          .eq("practice_id", practiceId),
        supabase
          .from("reviews")
          .select("*")
          .eq("practice_id", practiceId)
          .order("review_date", { ascending: false }),
      ]);

    // 3. Map database rows → PracticeConfig shape
    const providers: Provider[] = (providersRes.data ?? []).map((p) => ({
      id: p.id,
      firstName: p.first_name,
      lastName: p.last_name,
      credentials: p.credentials,
      title: p.title ?? undefined,
      bio: p.bio,
      photoUrl: p.photo_url ?? undefined,
      education: p.education ?? [],
      boardCertifications: p.board_certifications ?? [],
      languages: p.languages ?? [],
    }));

    const lucideIconNames = new Set([
      "Baby", "Scissors", "Heart", "Users", "Scale", "Microscope",
      "Stethoscope", "Brain", "Eye", "Syringe", "Pill", "Activity",
      "Shield", "Bone", "Ear", "Smile", "HeartPulse", "Monitor",
      "Thermometer",
    ]);

    const services: Service[] = (servicesRes.data ?? []).map((s) => {
      const iconValue = s.icon ?? undefined;
      // If the icon value looks like a Lucide icon name, use iconName instead
      const isLucideName = iconValue && lucideIconNames.has(iconValue);
      return {
        id: s.id,
        title: s.title,
        description: s.description,
        icon: isLucideName ? undefined : iconValue,
        iconName: isLucideName ? iconValue : undefined,
        featured: s.featured,
        linkUrl: s.link_url ?? undefined,
      };
    });

    const locations: OfficeLocation[] = (locationsRes.data ?? []).map((l) => ({
      name: l.name ?? undefined,
      address: l.address,
      city: l.city,
      state: l.state,
      zip: l.zip,
      phone: l.phone,
      fax: l.fax ?? undefined,
      email: l.email ?? undefined,
      hours: l.hours ?? {},
      googleMapsEmbedUrl: l.google_maps_embed_url ?? undefined,
      coordinates:
        l.lat != null && l.lng != null
          ? { lat: l.lat, lng: l.lng }
          : undefined,
    }));

    const reviews: Review[] = (reviewsRes.data ?? []).map((r) => ({
      authorName: r.author_name,
      rating: r.rating,
      text: r.text,
      date: r.review_date ?? "",
      source: r.source as Review["source"],
    }));

    const branding: Branding = practice.branding ?? { colorPalette: {} };
    const seo: SEOConfig = practice.seo_config ?? {
      siteTitle: practice.name,
      siteDescription: "",
      keywords: [],
      structuredData: {},
    };
    const integrations: Integrations = practice.integrations ?? {};

    const config: PracticeConfig = {
      id: practice.id,
      practiceName: practice.name,
      specialty: practice.specialty as Specialty,
      subSpecialties: practice.sub_specialties ?? [],
      providers,
      services,
      locations,
      reviews,
      integrations,
      branding,
      insurancesAccepted: practice.insurances_accepted ?? [],
      subdomain: practice.subdomain,
      domain: practice.domain ?? undefined,
      seo,
      createdAt: practice.created_at,
      updatedAt: practice.updated_at,
      status: practice.status as PracticeConfig["status"],
      plan: practice.plan as PracticeConfig["plan"],
    };

    return config;
  } catch (err) {
    // Caller falls back to mock data, but the failure must not be invisible
    console.error(`getPracticeBySlug(${slug}) failed:`, err);
    return null;
  }
}
