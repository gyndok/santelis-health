import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { PracticeConfig } from "@/types";
import { specialtyConfigs } from "@/config/specialties";
import GeneratedSite from "@/components/generated-site/GeneratedSite";
import { getPracticeBySlug } from "@/lib/get-practice";

// ---------------------------------------------------------------------------
// Mock data — fallback when Supabase is unavailable
// ---------------------------------------------------------------------------

const obgynPalette = specialtyConfigs.obgyn.palette;

const mockConfigs: Record<string, PracticeConfig> = {
  "kleins-womens-care": {
    id: "demo-kleins-womens-care",
    practiceName: "Klein's Women's Care",
    specialty: "obgyn",
    subSpecialties: [
      "Obstetrics",
      "Gynecologic Surgery",
      "Obesity Medicine",
      "Minimally Invasive Surgery",
    ],
    providers: [
      {
        id: "dr-klein",
        firstName: "Geffrey",
        lastName: "Klein",
        credentials: "MD, FACOG",
        title: "Board Certified Obstetrician & Gynecologist",
        bio: "Dr. Geffrey Klein is a board-certified obstetrician and gynecologist serving the Webster, TX and greater Houston Bay Area community. With a passion for comprehensive women's health, Dr. Klein provides personalized care ranging from routine well-woman exams and obstetric care to advanced gynecologic surgery and medical weight loss.\n\nDr. Klein is fellowship-trained in minimally invasive gynecologic surgery and is certified by the American Board of Obesity Medicine, allowing him to offer a unique combination of surgical expertise and evidence-based weight management programs. He believes every patient deserves compassionate, individualized care backed by the latest medical advances.",
        education: [
          {
            institution: "University of Texas Medical Branch (UTMB)",
            degree: "Doctor of Medicine (MD)",
            year: 2010,
          },
          {
            institution: "UTMB Department of OB/GYN",
            degree: "Residency in Obstetrics & Gynecology",
            year: 2014,
          },
          {
            institution: "University of Florida",
            degree: "Bachelor of Science",
            year: 2006,
            honors: "Cum Laude",
          },
        ],
        boardCertifications: [
          {
            board: "ABOG",
            specialty: "Obstetrics & Gynecology",
            verificationUrl: "https://www.abog.org",
          },
          {
            board: "ACOG",
            specialty: "Fellow, ACOG",
            verificationUrl: "https://www.acog.org",
          },
          {
            board: "ABOM",
            specialty: "Obesity Medicine",
            verificationUrl: "https://www.abom.org",
          },
        ],
        languages: ["English", "Spanish"],
      },
    ],
    services: specialtyConfigs.obgyn.defaultServices.map((s, i) => ({
      ...s,
      id: `svc-${i}`,
    })),
    locations: [
      {
        name: "Main Office",
        address: "400 Medical Center Blvd, Suite 300",
        city: "Webster",
        state: "TX",
        zip: "77598",
        phone: "(281) 557-0300",
        fax: "(281) 557-0301",
        email: "info@kleinswomenscare.com",
        hours: {
          monday: "8:00 AM - 5:00 PM",
          tuesday: "8:00 AM - 5:00 PM",
          wednesday: "8:00 AM - 5:00 PM",
          thursday: "8:00 AM - 5:00 PM",
          friday: "8:00 AM - 12:00 PM",
          saturday: undefined,
          sunday: undefined,
        },
        googleMapsEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3474.123!2d-95.119!3d29.537!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjnCsDMyJzEzLjIiTiA5NcKwMDcnMDguNCJX!5e0!3m2!1sen!2sus!4v1",
      },
    ],
    reviews: [
      {
        authorName: "Sarah M.",
        rating: 5,
        text: "Dr. Klein is the most thorough and caring OB I've ever had. He took the time to explain everything during my pregnancy and made me feel completely at ease. His staff is wonderful too!",
        date: "2025-11-15",
        source: "google",
      },
      {
        authorName: "Jessica R.",
        rating: 5,
        text: "I've been a patient of Dr. Klein for years. He performed my surgery and the recovery was so much easier than expected. I can't recommend him enough for anyone needing gynecologic care.",
        date: "2025-09-22",
        source: "google",
      },
      {
        authorName: "Maria L.",
        rating: 5,
        text: "The weight loss program changed my life. Dr. Klein's medical approach to weight management was exactly what I needed after years of struggling on my own.",
        date: "2025-08-10",
        source: "google",
      },
      {
        authorName: "Amanda T.",
        rating: 4,
        text: "Great experience overall. Wait times can be a little long during busy seasons, but the quality of care more than makes up for it. Dr. Klein is very knowledgeable.",
        date: "2025-06-05",
        source: "google",
      },
    ],
    integrations: {
      appointmentBooking: {
        type: "custom",
        url: "https://www.kleinswomenscare.com/appointment",
      },
      socialMedia: {
        facebook: "https://facebook.com/kleinswomenscare",
        instagram: "https://instagram.com/kleinswomenscare",
      },
    },
    branding: {
      colorPalette: obgynPalette,
      tagline: "Compassionate Women's Health Care in the Houston Bay Area",
    },
    insurancesAccepted: [
      "Aetna",
      "Blue Cross Blue Shield",
      "Cigna",
      "United Healthcare",
      "Medicare",
      "Medicaid",
      "Humana",
    ],
    subdomain: "kleins-womens-care",
    seo: {
      siteTitle: "Klein's Women's Care | OBGYN in Webster, TX",
      siteDescription:
        "Dr. Geffrey Klein, MD, FACOG — Board-certified OB/GYN in Webster, TX offering obstetric care, gynecologic surgery, and medical weight loss. Accepting new patients.",
      keywords: [
        "OBGYN Webster TX",
        "gynecologist near me",
        "Dr Klein OB GYN",
        "women's health Webster",
        "weight loss doctor Houston",
      ],
      structuredData: {},
    },
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2026-03-10T00:00:00Z",
    status: "preview",
    plan: "professional",
  },
};

// ---------------------------------------------------------------------------
// Helper — fetch from Supabase, fall back to mock data
// ---------------------------------------------------------------------------

async function getConfig(slug: string): Promise<PracticeConfig | undefined> {
  const dbConfig = await getPracticeBySlug(slug);
  if (dbConfig) return dbConfig;
  return mockConfigs[slug];
}

// ---------------------------------------------------------------------------
// Next.js page
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const config = await getConfig(slug);
  if (!config) return { title: "Not Found" };

  return {
    title: config.seo.siteTitle,
    description: config.seo.siteDescription,
    keywords: config.seo.keywords,
    openGraph: {
      title: config.seo.siteTitle,
      description: config.seo.siteDescription,
      type: "website",
    },
  };
}

export default async function DemoPage({ params }: PageProps) {
  const { slug } = await params;
  const config = await getConfig(slug);

  if (!config) {
    notFound();
  }

  return (
    <>
      {/* Preview Banner */}
      <div
        className="fixed top-0 left-0 right-0 z-[100] text-center py-2 px-4 text-sm font-medium"
        style={{
          backgroundColor: config.branding.colorPalette.neutralDark,
          color: "#ffffff",
        }}
      >
        This is a preview site powered by{" "}
        <Link href="/" className="underline font-bold" style={{ color: config.branding.colorPalette.accent }}>
          Santelis Health
        </Link>
        .{" "}
        <Link
          href="/onboard"
          className="underline font-bold"
          style={{ color: config.branding.colorPalette.accent }}
        >
          Get yours &rarr;
        </Link>
      </div>

      {/* Offset for the fixed banner */}
      <div className="pt-9">
        <GeneratedSite config={config} />
      </div>
    </>
  );
}
