// ============================================================
// Santelis Health — Core Types
// ============================================================

/** Medical specialties supported by the platform */
export type Specialty =
  | "obgyn"
  | "family-medicine"
  | "dermatology"
  | "orthopedics"
  | "pediatrics"
  | "internal-medicine"
  | "med-spa"
  | "cardiology"
  | "urology"
  | "ent";

/** A single healthcare provider */
export interface Provider {
  id: string;
  firstName: string;
  lastName: string;
  credentials: string; // "MD", "DO", "NP", "PA"
  title?: string; // "Board Certified Obstetrician & Gynecologist"
  bio: string;
  photoUrl?: string;
  education: Education[];
  boardCertifications: BoardCertification[];
  languages: string[];
}

export interface Education {
  institution: string;
  degree: string;
  year?: number;
  honors?: string;
}

export interface BoardCertification {
  board: string; // "ABOG", "ABOM", "ABIM"
  specialty: string;
  verificationUrl: string; // "https://www.abog.org"
  badgeImageUrl?: string;
}

/** A medical service offered by the practice */
export interface Service {
  id: string;
  title: string;
  description: string;
  icon?: string;
  /** Lucide icon name (e.g. "Baby", "Heart", "Scissors") — preferred over emoji icon */
  iconName?: string;
  featured: boolean;
  linkUrl?: string;
}

/** Practice office location */
export interface OfficeLocation {
  name?: string; // for multi-location practices
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  fax?: string;
  email?: string;
  hours: OfficeHours;
  googleMapsEmbedUrl?: string;
  coordinates?: { lat: number; lng: number };
}

export interface OfficeHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

/** Patient review */
export interface Review {
  authorName: string;
  rating: number; // 1-5
  text: string;
  date: string;
  source: "google" | "healthgrades" | "manual";
}

/** Integration configuration */
export interface Integrations {
  appointmentBooking?: {
    type: "native" | "intakeq" | "zocdoc" | "calendly" | "custom";
    url?: string;
  };
  intakeForms?: IntakeForm[];
  consentForms?: ConsentForm[];
  patientPortalUrl?: string;
  telemedicineUrl?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    twitter?: string;
    linkedin?: string;
  };
  /** Community section — e.g. Facebook group CTA */
  community?: {
    heading: string;
    description: string;
    ctaText: string;
    ctaUrl: string;
    features?: { label: string }[];
  };
  googleBusinessProfileId?: string;
  /** Direct "leave a review" URL; takes precedence over the profile-id-derived link */
  googleReviewUrl?: string;
}

export interface IntakeForm {
  name: string;
  url: string;
  description?: string;
}

export interface ConsentForm {
  name: string;
  url: string;
}

/** Branding / design configuration */
export interface Branding {
  logoUrl?: string;
  colorPalette: ColorPalette;
  heroImageUrl?: string;
  tagline?: string;
  fontFamily?: string;
}

export interface ColorPalette {
  primary: string;
  primaryDark: string;
  accent: string;
  neutral: string;
  neutralDark: string;
  /** Optional extended palette — clients can fine-tune these */
  heroGradientStart?: string;
  heroGradientEnd?: string;
  sectionAltBg?: string;       // alternating section background (default: accent at 20%)
  cardShadow?: string;         // e.g. "0 4px 20px -2px rgba(74,109,124,0.1)"
  cardHoverShadow?: string;    // e.g. "0 8px 30px -4px rgba(74,109,124,0.2)"
  buttonPrimaryBg?: string;    // override for primary button bg
  buttonPrimaryText?: string;  // override for primary button text
  buttonSecondaryBorder?: string;
  buttonSecondaryText?: string;
  footerBg?: string;           // override for footer background
  footerText?: string;         // override for footer text
}

/** Full practice configuration — the core data model */
export interface PracticeConfig {
  id: string;
  practiceName: string;
  specialty: Specialty;
  subSpecialties: string[];
  providers: Provider[];
  services: Service[];
  locations: OfficeLocation[];
  reviews: Review[];
  integrations: Integrations;
  branding: Branding;
  insurancesAccepted: string[];
  domain?: string;
  subdomain: string; // {slug}.santelishealth.com
  seo: SEOConfig;
  createdAt: string;
  updatedAt: string;
  status: "draft" | "preview" | "live";
  stripeCustomerId?: string;
  plan: "starter" | "professional" | "practice" | "enterprise";
  ownerEmail?: string;
}

export interface SEOConfig {
  siteTitle: string;
  siteDescription: string;
  keywords: string[];
  ogImageUrl?: string;
  structuredData: Record<string, unknown>;
}

// ============================================================
// Prospect / Outreach Types
// ============================================================

export type OutreachStatus =
  | "discovered"
  | "no-website"
  | "qualified"
  | "demo-generated"
  | "emailed"
  | "opened"
  | "clicked"
  | "signed-up"
  | "converted"
  | "opted-out";

/** A row from the `prospects` table (snake_case, matching the DB schema). */
export interface Prospect {
  id: string;
  practice_name: string;
  provider_name: string;
  specialty: string;
  website_url: string | null;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  current_page_speed: number | null;
  qualification_score: number;
  scraped_data: Record<string, unknown> | null;
  demo_slug: string | null;
  outreach_status: OutreachStatus;
  email_sent_at: string | null;
  created_at: string;
}

export interface ScrapedWebsiteData {
  providerNames: string[];
  services: string[];
  aboutText: string;
  contactInfo: {
    phone?: string;
    email?: string;
    fax?: string;
    address?: string;
  };
  officeHours: string[];
  metaTags: {
    title?: string;
    description?: string;
    viewport?: string;
  };
  hasSSL: boolean;
  hasStructuredData: boolean;
  hasViewportMeta: boolean;
  rawMarkdown: string;
}

// ============================================================
// Appointment Request Types
// ============================================================

export interface AppointmentRequest {
  id: string;
  practiceId: string;
  patientName: string;
  email: string;
  phone?: string;
  preferredDate?: string;
  preferredTime?: string;
  reason?: string;
  status: "new" | "contacted" | "scheduled" | "dismissed";
  createdAt: string;
}
