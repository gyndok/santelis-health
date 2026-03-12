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
    practiceName: "Women's Specialists of Clear Lake",
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
        title: "Board Certified Obstetrics & Gynecology | Board Certified Obesity Medicine",
        bio: "Geffrey Klein, MD, FACOG is a highly qualified obstetrician and gynecologist with years of experience. He received his medical degree and residency in OBGYN from Baylor College of Medicine, where he served as OB/GYN Administrative Chief Resident. Dr. Klein graduated with honors from the University of Texas at Austin with a Bachelor of Arts in Biology.\n\nHe is Board Certified with the American Board of Obstetrics and Gynecology, a Fellow of the American College of Obstetricians and Gynecologists, and Board Certified with the American Board of Obesity Medicine.",
        education: [
          {
            institution: "University of Texas at Austin",
            degree: "Bachelor of Arts in Biology",
            honors: "With Honors",
          },
          {
            institution: "Baylor College of Medicine",
            degree: "Doctor of Medicine (MD)",
            honors: "Southern Medical Association Scholarship, Honors in the Basic Sciences, Alpha Omega Alpha, Outstanding Medical Student in OB/GYN",
          },
          {
            institution: "Baylor College of Medicine",
            degree: "Residency in Obstetrics & Gynecology",
            honors: "OB/GYN Administrative Chief Resident",
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
    services: [
      {
        id: "svc-0",
        title: "Obstetric Care",
        description: "Prenatal care, high-risk pregnancies, vaginal delivery, C-section, VBAC, postpartum care.",
        icon: "👶",
        featured: false,
      },
      {
        id: "svc-1",
        title: "Gynecologic Surgery",
        description: "Robotic assisted Da Vinci surgery, hysterectomy, endometrial ablation (NovaSure), bilateral salpingectomy, LEEP, diagnostic laparoscopy.",
        icon: "⚕️",
        featured: false,
      },
      {
        id: "svc-2",
        title: "Women's Health",
        description: "Annual well-woman exams, pap smears, mammography screening, hormone replacement therapy, menopause care.",
        icon: "❤️",
        featured: false,
      },
      {
        id: "svc-3",
        title: "Family Planning",
        description: "Birth control counseling, IUD placement and removal, contraceptive implants, infertility evaluation, tubal ligation.",
        icon: "👨‍👩‍👧‍👦",
        featured: false,
      },
      {
        id: "svc-4",
        title: "Weight Loss Clinic",
        description: "Board certified obesity medicine. Personalized weight management programs, anti-obesity medications including GLP-1 receptor agonists, and telemedicine options.",
        icon: "⚖️",
        featured: true,
        linkUrl: "https://geffreyklein.com/weight-loss",
      },
      {
        id: "svc-5",
        title: "Specialized Treatments",
        description: "Endometriosis treatment, uterine fibroids, cervical dysplasia, STD testing and treatment, suction D&C.",
        icon: "🩺",
        featured: false,
      },
    ],
    locations: [
      {
        name: "Main Office",
        address: "400 Medical Center Blvd, Suite 300",
        city: "Webster",
        state: "TX",
        zip: "77598",
        phone: "(281) 557-0300",
        fax: "(281) 557-3301",
        email: "info@kleinswomenscare.com",
        hours: {
          monday: "8:30 AM - 11:00 AM, 1:30 PM - 4:00 PM",
          tuesday: "8:30 AM - 11:00 AM, 1:30 PM - 4:00 PM",
          wednesday: "8:30 AM - 11:00 AM, 1:30 PM - 4:00 PM",
          thursday: "8:30 AM - 11:00 AM, 1:30 PM - 4:00 PM",
          friday: "8:30 AM - 11:00 AM",
          saturday: undefined,
          sunday: undefined,
        },
        googleMapsEmbedUrl:
          "https://maps.google.com/maps?q=Women%27s+Specialists+of+Clear+Lake+400+Medical+Center+Blvd+Suite+300+Webster+TX+77598&t=&z=15&ie=UTF8&iwloc=&output=embed",
      },
    ],
    reviews: [
      {
        authorName: "Sarah M.",
        rating: 5,
        text: "Dr. Klein is an exceptional physician who truly cares about his patients. His expertise in both OBGYN and obesity medicine is outstanding.",
        date: "2026-01-15",
        source: "google",
      },
      {
        authorName: "Jennifer L.",
        rating: 5,
        text: "The best doctor I've ever had! The staff is wonderful and Dr. Klein takes time to listen and answer all questions.",
        date: "2025-12-10",
        source: "google",
      },
      {
        authorName: "Maria R.",
        rating: 5,
        text: "Highly recommend Dr. Klein and his team. Professional, compassionate, and knowledgeable. The office is always clean and welcoming.",
        date: "2025-11-08",
        source: "google",
      },
      {
        authorName: "Amanda T.",
        rating: 5,
        text: "Dr. Klein helped me through my pregnancy journey with exceptional care. I couldn't have asked for a better doctor.",
        date: "2025-10-05",
        source: "google",
      },
    ],
    integrations: {
      appointmentBooking: {
        type: "intakeq",
        url: "https://geffreyklein.com/appointment",
      },
      socialMedia: {
        facebook: "https://www.facebook.com/groups/64781863202",
        youtube: "https://www.youtube.com/channel/UCFquFEcz5gwZQNVEyRGdkbg",
      },
    },
    branding: {
      colorPalette: {
        primary: "#62929E",
        primaryDark: "#4A6D7C",
        accent: "#C6C5B9",
        neutral: "#475657",
        neutralDark: "#393A10",
      },
      tagline: "Taking care of women through all stages of life",
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
      siteTitle: "Dr. Geffrey Klein | OBGYN & Obesity Medicine | Webster, TX",
      siteDescription:
        "Board-certified OBGYN and obesity medicine specialist providing comprehensive women's health and weight management in Clear Lake and Webster, Texas.",
      keywords: [
        "OBGYN Webster TX",
        "gynecologist near me",
        "Dr Klein OB GYN",
        "women's health Webster",
        "weight loss doctor Houston",
        "obesity medicine Clear Lake",
        "robotic surgery Webster TX",
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Physician",
        "name": "Dr. Geffrey H. Klein, MD, FACOG",
        "url": "https://geffreyklein.com",
        "medicalSpecialty": ["Obstetrics", "Gynecology", "Obesity Medicine"],
        "telephone": "+1-281-557-0300",
      },
    },
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2026-03-11T00:00:00Z",
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
