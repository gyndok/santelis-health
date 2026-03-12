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
  googleBusinessProfileId?: string;
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

export interface Prospect {
  id: string;
  practiceName: string;
  providerName: string;
  specialty: string;
  websiteUrl: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email?: string;
  googleRating?: number;
  googleReviewCount?: number;
  currentPageSpeed?: number;
  qualificationScore: number;
  scrapedData?: Record<string, unknown>;
  demoSlug?: string;
  outreachStatus: "discovered" | "no-website" | "qualified" | "demo-generated" | "emailed" | "opened" | "clicked" | "signed-up" | "converted" | "opted-out";
  emailSentAt?: string;
  createdAt: string;
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
