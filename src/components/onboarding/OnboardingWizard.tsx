"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import StepIndicator from "./StepIndicator";
import { specialtyConfigs } from "@/config/specialties";
import type {
  Specialty,
  PracticeConfig,
  Service,
  Education,
  BoardCertification,
  OfficeHours,
  ColorPalette,
} from "@/types";

// ----------------------------------------------------------------
// Palette presets helper
// ----------------------------------------------------------------

function generatePaletteVariations(base: ColorPalette): { name: string; palette: ColorPalette }[] {
  return [
    { name: "Default", palette: base },
    {
      name: "Soft",
      palette: {
        ...base,
        primary: lightenHex(base.primary, 20),
        primaryDark: base.primary,
      },
    },
    {
      name: "Bold",
      palette: {
        ...base,
        primary: darkenHex(base.primary, 15),
        primaryDark: darkenHex(base.primaryDark, 15),
        neutralDark: "#111111",
      },
    },
    {
      name: "Warm Neutral",
      palette: {
        primary: "#6B7280",
        primaryDark: "#4B5563",
        accent: "#F3F4F6",
        neutral: "#9CA3AF",
        neutralDark: "#1F2937",
      },
    },
  ];
}

function lightenHex(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function darkenHex(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((num >> 16) & 0xff) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// ----------------------------------------------------------------
// Types for form state
// ----------------------------------------------------------------

interface FormState {
  // Step 1
  practiceName: string;
  specialty: Specialty | "";
  providerFirstName: string;
  providerLastName: string;
  credentials: string;
  city: string;
  state: string;
  phone: string;
  email: string;

  // Step 2
  services: (Omit<Service, "id"> & { selected: boolean })[];
  customServices: { title: string; description: string }[];
  featuredServiceIndex: number | null;

  // Step 3
  bio: string;
  education: Education[];
  boardCertifications: BoardCertification[];

  // Step 4
  address: string;
  locationCity: string;
  locationState: string;
  zip: string;
  hours: OfficeHours;
  googleMapsEmbedUrl: string;

  // Step 5
  selectedPaletteIndex: number;
  tagline: string;
  logoFile: File | null;
  heroFile: File | null;
}

const DAYS: (keyof OfficeHours)[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_LABELS: Record<keyof OfficeHours, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const DEFAULT_HOURS: OfficeHours = {
  monday: "8:00 AM - 5:00 PM",
  tuesday: "8:00 AM - 5:00 PM",
  wednesday: "8:00 AM - 5:00 PM",
  thursday: "8:00 AM - 5:00 PM",
  friday: "8:00 AM - 5:00 PM",
  saturday: "Closed",
  sunday: "Closed",
};

// ----------------------------------------------------------------
// Component
// ----------------------------------------------------------------

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    practiceName: "",
    specialty: "",
    providerFirstName: "",
    providerLastName: "",
    credentials: "",
    city: "",
    state: "",
    phone: "",
    email: "",

    services: [],
    customServices: [],
    featuredServiceIndex: null,

    bio: "",
    education: [],
    boardCertifications: [],

    address: "",
    locationCity: "",
    locationState: "",
    zip: "",
    hours: { ...DEFAULT_HOURS },
    googleMapsEmbedUrl: "",

    selectedPaletteIndex: 0,
    tagline: "",
    logoFile: null,
    heroFile: null,
  });

  // Convenience
  const specialtyConfig = form.specialty ? specialtyConfigs[form.specialty] : null;

  // ---- helpers ----

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSpecialtyChange(value: string) {
    const spec = value as Specialty;
    const config = specialtyConfigs[spec];
    if (!config) {
      updateField("specialty", "" as Specialty);
      updateField("services", []);
      return;
    }
    updateField("specialty", spec);
    const svcs = config.defaultServices.map((s) => ({ ...s, selected: true }));
    updateField("services", svcs);
    // Reset featured index to the config default
    const featIdx = svcs.findIndex((s) => s.featured);
    updateField("featuredServiceIndex", featIdx >= 0 ? featIdx : null);
    // Also reset palette
    updateField("selectedPaletteIndex", 0);
  }

  // ---- navigation ----

  function nextStep() {
    if (step < 6) setStep(step + 1);
  }

  function prevStep() {
    if (step > 1) setStep(step - 1);
  }

  // ---- build PracticeConfig summary for review ----

  function buildSummary(): Partial<PracticeConfig> {
    const palettes = specialtyConfig ? generatePaletteVariations(specialtyConfig.palette) : [];
    const selectedPalette = palettes[form.selectedPaletteIndex]?.palette ?? {
      primary: "#0D9488",
      primaryDark: "#0F766E",
      accent: "#F0FDFA",
      neutral: "#64748B",
      neutralDark: "#1E293B",
    };

    const allServices: Service[] = [];
    form.services.forEach((s, i) => {
      if (s.selected) {
        allServices.push({
          id: `svc-${i}`,
          title: s.title,
          description: s.description,
          icon: s.icon,
          featured: form.featuredServiceIndex === i,
        });
      }
    });
    form.customServices.forEach((s, i) => {
      if (s.title.trim()) {
        const globalIdx = form.services.length + i;
        allServices.push({
          id: `custom-${i}`,
          title: s.title,
          description: s.description,
          featured: form.featuredServiceIndex === globalIdx,
        });
      }
    });

    return {
      practiceName: form.practiceName,
      specialty: (form.specialty || "family-medicine") as Specialty,
      providers: [
        {
          id: "provider-1",
          firstName: form.providerFirstName,
          lastName: form.providerLastName,
          credentials: form.credentials,
          bio: form.bio,
          education: form.education,
          boardCertifications: form.boardCertifications,
          languages: [],
        },
      ],
      services: allServices,
      locations: [
        {
          address: form.address,
          city: form.locationCity || form.city,
          state: form.locationState || form.state,
          zip: form.zip,
          phone: form.phone,
          email: form.email,
          hours: form.hours,
          googleMapsEmbedUrl: form.googleMapsEmbedUrl || undefined,
        },
      ],
      branding: {
        colorPalette: selectedPalette,
        tagline: form.tagline || undefined,
      },
    };
  }

  // ----------------------------------------------------------------
  // Shared input styles
  // ----------------------------------------------------------------

  const inputCls =
    "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";
  const sectionTitle = "text-lg font-semibold text-slate-900 mb-4";
  const cardCls = "bg-white rounded-2xl border border-gray-200 p-6 sm:p-8";

  // ----------------------------------------------------------------
  // Step renderers
  // ----------------------------------------------------------------

  function renderStep1() {
    return (
      <div className={cardCls}>
        <h2 className={sectionTitle}>Practice Basics</h2>
        <p className="text-sm text-gray-500 mb-6">Tell us about your practice and primary provider.</p>

        <div className="space-y-5">
          <div>
            <label className={labelCls}>Practice Name</label>
            <input
              type="text"
              placeholder="e.g., Klein's Women's Care"
              className={inputCls}
              value={form.practiceName}
              onChange={(e) => updateField("practiceName", e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>Primary Specialty</label>
            <select
              className={`${inputCls} bg-white`}
              value={form.specialty}
              onChange={(e) => handleSpecialtyChange(e.target.value)}
            >
              <option value="">Select a specialty...</option>
              {Object.entries(specialtyConfigs).map(([key, cfg]) => (
                <option key={key} value={key}>
                  {cfg.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Provider First Name</label>
              <input
                type="text"
                placeholder="Geffrey"
                className={inputCls}
                value={form.providerFirstName}
                onChange={(e) => updateField("providerFirstName", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Provider Last Name</label>
              <input
                type="text"
                placeholder="Klein"
                className={inputCls}
                value={form.providerLastName}
                onChange={(e) => updateField("providerLastName", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Credentials</label>
            <input
              type="text"
              placeholder="e.g., MD, FACOG"
              className={inputCls}
              value={form.credentials}
              onChange={(e) => updateField("credentials", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>City</label>
              <input
                type="text"
                placeholder="Webster"
                className={inputCls}
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>State</label>
              <input
                type="text"
                placeholder="TX"
                className={inputCls}
                value={form.state}
                onChange={(e) => updateField("state", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Office Phone</label>
            <input
              type="tel"
              placeholder="(281) 557-0300"
              className={inputCls}
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>Email</label>
            <input
              type="email"
              placeholder="office@yourpractice.com"
              className={inputCls}
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  }

  // ---- Step 2: Services ----

  function renderStep2() {
    if (!specialtyConfig) {
      return (
        <div className={cardCls}>
          <h2 className={sectionTitle}>Services</h2>
          <p className="text-gray-500 text-sm">
            Please go back and select a specialty first to see recommended services.
          </p>
        </div>
      );
    }

    return (
      <div className={cardCls}>
        <h2 className={sectionTitle}>Services</h2>
        <p className="text-sm text-gray-500 mb-6">
          These are the default services for {specialtyConfig.label}. Uncheck any you do not offer, or add your own below.
        </p>

        {/* Default services */}
        <div className="space-y-3 mb-8">
          {form.services.map((svc, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                svc.selected ? "border-teal-200 bg-teal-50/50" : "border-gray-200 bg-gray-50"
              }`}
            >
              <input
                type="checkbox"
                checked={svc.selected}
                onChange={() => {
                  const updated = [...form.services];
                  updated[i] = { ...updated[i], selected: !updated[i].selected };
                  updateField("services", updated);
                }}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-800">{svc.icon} {svc.title}</span>
                  {form.featuredServiceIndex === i && (
                    <span className="text-xs bg-teal-600 text-white px-2 py-0.5 rounded-full">Featured</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{svc.description}</p>
              </div>
              <button
                type="button"
                onClick={() => updateField("featuredServiceIndex", form.featuredServiceIndex === i ? null : i)}
                className={`text-xs px-2 py-1 rounded border whitespace-nowrap ${
                  form.featuredServiceIndex === i
                    ? "border-teal-600 text-teal-600"
                    : "border-gray-300 text-gray-400 hover:text-teal-600 hover:border-teal-400"
                }`}
              >
                {form.featuredServiceIndex === i ? "Unfeatured" : "Feature"}
              </button>
            </div>
          ))}
        </div>

        {/* Custom services */}
        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Custom Services</h3>
          {form.customServices.map((cs, i) => (
            <div key={i} className="flex gap-3 mb-3">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="Service title"
                  className={inputCls}
                  value={cs.title}
                  onChange={(e) => {
                    const updated = [...form.customServices];
                    updated[i] = { ...updated[i], title: e.target.value };
                    updateField("customServices", updated);
                  }}
                />
                <input
                  type="text"
                  placeholder="Short description"
                  className={inputCls}
                  value={cs.description}
                  onChange={(e) => {
                    const updated = [...form.customServices];
                    updated[i] = { ...updated[i], description: e.target.value };
                    updateField("customServices", updated);
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const updated = form.customServices.filter((_, idx) => idx !== i);
                  updateField("customServices", updated);
                }}
                className="self-start text-red-400 hover:text-red-600 text-sm mt-2"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              updateField("customServices", [...form.customServices, { title: "", description: "" }])
            }
            className="text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            + Add Custom Service
          </button>
        </div>
      </div>
    );
  }

  // ---- Step 3: Provider Details ----

  function renderStep3() {
    return (
      <div className={cardCls}>
        <h2 className={sectionTitle}>Provider Details</h2>
        <p className="text-sm text-gray-500 mb-6">
          Tell patients about{" "}
          {form.providerFirstName
            ? `Dr. ${form.providerLastName || form.providerFirstName}`
            : "your provider"}
          .
        </p>

        {/* Bio */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <label className={labelCls}>Bio</label>
            <button
              type="button"
              disabled
              className="text-xs bg-gray-100 text-gray-400 px-3 py-1 rounded-lg cursor-not-allowed"
              title="Coming soon"
            >
              Generate with AI
            </button>
          </div>
          <textarea
            rows={5}
            placeholder="Write a short biography for your provider..."
            className={inputCls}
            value={form.bio}
            onChange={(e) => updateField("bio", e.target.value)}
          />
        </div>

        {/* Education */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Education</h3>
          {form.education.map((edu, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 mb-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Institution</label>
                  <input
                    type="text"
                    placeholder="University of Texas"
                    className={inputCls}
                    value={edu.institution}
                    onChange={(e) => {
                      const updated = [...form.education];
                      updated[i] = { ...updated[i], institution: e.target.value };
                      updateField("education", updated);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Year</label>
                  <input
                    type="number"
                    placeholder="2005"
                    className={inputCls}
                    value={edu.year ?? ""}
                    onChange={(e) => {
                      const updated = [...form.education];
                      updated[i] = {
                        ...updated[i],
                        year: e.target.value ? parseInt(e.target.value) : undefined,
                      };
                      updateField("education", updated);
                    }}
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs text-gray-500 mb-1">Degree</label>
                <input
                  type="text"
                  placeholder="Doctor of Medicine (MD)"
                  className={inputCls}
                  value={edu.degree}
                  onChange={(e) => {
                    const updated = [...form.education];
                    updated[i] = { ...updated[i], degree: e.target.value };
                    updateField("education", updated);
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const updated = form.education.filter((_, idx) => idx !== i);
                  updateField("education", updated);
                }}
                className="text-xs text-red-400 hover:text-red-600 mt-2"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              updateField("education", [
                ...form.education,
                { institution: "", degree: "", year: undefined },
              ])
            }
            className="text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            + Add Education
          </button>
        </div>

        {/* Board Certifications */}
        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Board Certifications</h3>
          {specialtyConfig && specialtyConfig.boardBodies.length > 0 && (
            <p className="text-xs text-gray-400 mb-3">
              Suggestions: {specialtyConfig.boardBodies.map((b) => b.abbreviation).join(", ")}
            </p>
          )}
          {form.boardCertifications.map((cert, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 mb-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Board</label>
                  <input
                    type="text"
                    placeholder={specialtyConfig?.boardBodies[0]?.abbreviation ?? "ABMS"}
                    className={inputCls}
                    value={cert.board}
                    onChange={(e) => {
                      const updated = [...form.boardCertifications];
                      updated[i] = { ...updated[i], board: e.target.value };
                      updateField("boardCertifications", updated);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Specialty</label>
                  <input
                    type="text"
                    placeholder={specialtyConfig?.label ?? "Specialty"}
                    className={inputCls}
                    value={cert.specialty}
                    onChange={(e) => {
                      const updated = [...form.boardCertifications];
                      updated[i] = { ...updated[i], specialty: e.target.value };
                      updateField("boardCertifications", updated);
                    }}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const updated = form.boardCertifications.filter((_, idx) => idx !== i);
                  updateField("boardCertifications", updated);
                }}
                className="text-xs text-red-400 hover:text-red-600 mt-2"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              updateField("boardCertifications", [
                ...form.boardCertifications,
                { board: "", specialty: "", verificationUrl: "" },
              ])
            }
            className="text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            + Add Certification
          </button>
        </div>
      </div>
    );
  }

  // ---- Step 4: Location & Hours ----

  function renderStep4() {
    return (
      <div className={cardCls}>
        <h2 className={sectionTitle}>Location & Hours</h2>
        <p className="text-sm text-gray-500 mb-6">Where can patients find you?</p>

        <div className="space-y-5 mb-8">
          <div>
            <label className={labelCls}>Street Address</label>
            <input
              type="text"
              placeholder="123 Medical Parkway, Suite 200"
              className={inputCls}
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>City</label>
              <input
                type="text"
                placeholder={form.city || "City"}
                className={inputCls}
                value={form.locationCity}
                onChange={(e) => updateField("locationCity", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>State</label>
              <input
                type="text"
                placeholder={form.state || "ST"}
                className={inputCls}
                value={form.locationState}
                onChange={(e) => updateField("locationState", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>ZIP</label>
              <input
                type="text"
                placeholder="77598"
                className={inputCls}
                value={form.zip}
                onChange={(e) => updateField("zip", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Google Maps Embed URL (optional)</label>
            <input
              type="url"
              placeholder="https://www.google.com/maps/embed?..."
              className={inputCls}
              value={form.googleMapsEmbedUrl}
              onChange={(e) => updateField("googleMapsEmbedUrl", e.target.value)}
            />
          </div>
        </div>

        {/* Office Hours */}
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Office Hours</h3>
        <div className="space-y-3">
          {DAYS.map((day) => {
            const value = form.hours[day] ?? "Closed";
            const isClosed = value === "Closed";

            return (
              <div key={day} className="flex items-center gap-3">
                <span className="w-24 text-sm text-gray-700 font-medium">{DAY_LABELS[day]}</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!isClosed}
                    onChange={() => {
                      const updated = { ...form.hours };
                      updated[day] = isClosed ? "8:00 AM - 5:00 PM" : "Closed";
                      updateField("hours", updated);
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-xs text-gray-500">{isClosed ? "Closed" : "Open"}</span>
                </label>
                {!isClosed && (
                  <input
                    type="text"
                    className={`${inputCls} max-w-[200px]`}
                    value={value}
                    onChange={(e) => {
                      const updated = { ...form.hours };
                      updated[day] = e.target.value;
                      updateField("hours", updated);
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ---- Step 5: Branding ----

  function renderStep5() {
    const basePalette = specialtyConfig?.palette ?? {
      primary: "#0D9488",
      primaryDark: "#0F766E",
      accent: "#F0FDFA",
      neutral: "#64748B",
      neutralDark: "#1E293B",
    };
    const palettes = generatePaletteVariations(basePalette);

    return (
      <div className={cardCls}>
        <h2 className={sectionTitle}>Branding</h2>
        <p className="text-sm text-gray-500 mb-6">Choose your colors and add personality to your site.</p>

        {/* Color palettes */}
        <div className="mb-8">
          <label className={labelCls}>Color Palette</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
            {palettes.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => updateField("selectedPaletteIndex", i)}
                className={`rounded-lg border-2 p-3 transition-all ${
                  form.selectedPaletteIndex === i
                    ? "border-teal-600 ring-2 ring-teal-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex gap-1 mb-2">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: p.palette.primary }}
                  />
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: p.palette.primaryDark }}
                  />
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: p.palette.accent }}
                  />
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: p.palette.neutral }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-600">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tagline */}
        <div className="mb-8">
          <label className={labelCls}>Tagline</label>
          <input
            type="text"
            placeholder="e.g., Compassionate care for every stage of life"
            className={inputCls}
            value={form.tagline}
            onChange={(e) => updateField("tagline", e.target.value)}
          />
        </div>

        {/* Logo upload placeholder */}
        <div className="mb-6">
          <label className={labelCls}>Practice Logo</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="logo-upload"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                updateField("logoFile", file);
              }}
            />
            <label htmlFor="logo-upload" className="cursor-pointer">
              {form.logoFile ? (
                <p className="text-sm text-teal-600 font-medium">{form.logoFile.name}</p>
              ) : (
                <>
                  <p className="text-sm text-gray-500">Click to upload your logo</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, or SVG (max 2MB)</p>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Hero image upload placeholder */}
        <div>
          <label className={labelCls}>Hero Image</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="hero-upload"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                updateField("heroFile", file);
              }}
            />
            <label htmlFor="hero-upload" className="cursor-pointer">
              {form.heroFile ? (
                <p className="text-sm text-teal-600 font-medium">{form.heroFile.name}</p>
              ) : (
                <>
                  <p className="text-sm text-gray-500">Click to upload a hero banner image</p>
                  <p className="text-xs text-gray-400 mt-1">Recommended 1920x600 or wider</p>
                </>
              )}
            </label>
          </div>
        </div>
      </div>
    );
  }

  // ---- Step 6: Review & Generate ----

  function renderStep6() {
    const summary = buildSummary();
    const provider = summary.providers?.[0];
    const location = summary.locations?.[0];
    const branding = summary.branding;

    return (
      <div className={cardCls}>
        <h2 className={sectionTitle}>Review & Generate</h2>
        <p className="text-sm text-gray-500 mb-6">
          Review your information below, then generate your website preview.
        </p>

        {/* Practice Info */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-2 uppercase tracking-wide text-teal-600">
            Practice
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
            <p>
              <span className="text-gray-500">Name:</span>{" "}
              <span className="text-slate-800 font-medium">{summary.practiceName || "—"}</span>
            </p>
            <p>
              <span className="text-gray-500">Specialty:</span>{" "}
              <span className="text-slate-800">
                {form.specialty ? specialtyConfigs[form.specialty].label : "—"}
              </span>
            </p>
            <p>
              <span className="text-gray-500">Phone:</span>{" "}
              <span className="text-slate-800">{form.phone || "—"}</span>
            </p>
            <p>
              <span className="text-gray-500">Email:</span>{" "}
              <span className="text-slate-800">{form.email || "—"}</span>
            </p>
          </div>
        </div>

        {/* Provider */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-teal-600 mb-2">
            Provider
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
            <p>
              <span className="text-gray-500">Name:</span>{" "}
              <span className="text-slate-800 font-medium">
                {provider?.firstName} {provider?.lastName}
                {provider?.credentials ? `, ${provider.credentials}` : ""}
              </span>
            </p>
            <p>
              <span className="text-gray-500">Bio:</span>{" "}
              <span className="text-slate-800">
                {provider?.bio ? `${provider.bio.substring(0, 120)}${provider.bio.length > 120 ? "..." : ""}` : "—"}
              </span>
            </p>
            <p>
              <span className="text-gray-500">Education:</span>{" "}
              <span className="text-slate-800">
                {provider?.education.length
                  ? provider.education.map((e) => `${e.degree}, ${e.institution}`).join("; ")
                  : "—"}
              </span>
            </p>
            <p>
              <span className="text-gray-500">Certifications:</span>{" "}
              <span className="text-slate-800">
                {provider?.boardCertifications.length
                  ? provider.boardCertifications.map((c) => `${c.board} — ${c.specialty}`).join("; ")
                  : "—"}
              </span>
            </p>
          </div>
        </div>

        {/* Services */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-teal-600 mb-2">
            Services ({summary.services?.length ?? 0})
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            {summary.services && summary.services.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {summary.services.map((svc) => (
                  <span
                    key={svc.id}
                    className={`text-xs px-3 py-1 rounded-full ${
                      svc.featured
                        ? "bg-teal-100 text-teal-700 font-semibold"
                        : "bg-white border border-gray-200 text-gray-700"
                    }`}
                  >
                    {svc.title}
                    {svc.featured && " *"}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No services selected</p>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-teal-600 mb-2">
            Location
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
            <p>
              <span className="text-gray-500">Address:</span>{" "}
              <span className="text-slate-800">
                {[location?.address, location?.city, location?.state, location?.zip]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </span>
            </p>
            <p>
              <span className="text-gray-500">Hours:</span>{" "}
              <span className="text-slate-800">
                {location?.hours
                  ? Object.entries(location.hours)
                      .filter(([, v]) => v && v !== "Closed")
                      .length + " days/week open"
                  : "—"}
              </span>
            </p>
          </div>
        </div>

        {/* Branding */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-teal-600 mb-2">
            Branding
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
            <p>
              <span className="text-gray-500">Tagline:</span>{" "}
              <span className="text-slate-800 italic">{branding?.tagline || "—"}</span>
            </p>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Palette:</span>
              {branding?.colorPalette && (
                <div className="flex gap-1">
                  {Object.values(branding.colorPalette).map((c, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full border border-gray-200"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              )}
            </div>
            <p>
              <span className="text-gray-500">Logo:</span>{" "}
              <span className="text-slate-800">{form.logoFile ? form.logoFile.name : "Not uploaded"}</span>
            </p>
            <p>
              <span className="text-gray-500">Hero:</span>{" "}
              <span className="text-slate-800">{form.heroFile ? form.heroFile.name : "Not uploaded"}</span>
            </p>
          </div>
        </div>

        {/* Error message */}
        {generateError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{generateError}</p>
          </div>
        )}

        {/* Generate button */}
        <button
          type="button"
          disabled={isGenerating}
          onClick={async () => {
            setGenerateError(null);
            setIsGenerating(true);
            try {
              const summary = buildSummary();
              const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(summary),
              });
              const data = await res.json();
              if (!res.ok) {
                setGenerateError(data.error || "Something went wrong. Please try again.");
                return;
              }
              router.push(`/demo/${data.slug}`);
            } catch {
              setGenerateError("Network error. Please check your connection and try again.");
            } finally {
              setIsGenerating(false);
            }
          }}
          className={`w-full font-semibold py-3.5 rounded-lg transition-colors text-lg ${
            isGenerating
              ? "bg-teal-400 cursor-not-allowed text-white/80"
              : "bg-teal-600 hover:bg-teal-700 text-white"
          }`}
        >
          {isGenerating ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating your website...
            </span>
          ) : (
            "Generate My Website"
          )}
        </button>
      </div>
    );
  }

  // ---- Step router ----

  function renderCurrentStep() {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      case 6:
        return renderStep6();
      default:
        return null;
    }
  }

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-3xl">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* Header */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
          Let&apos;s build your website
        </h1>
        <p className="text-gray-600 mb-8 text-sm sm:text-base">
          Tell us about your practice and we&apos;ll generate a preview in minutes.
        </p>

        {/* Step indicator */}
        <StepIndicator currentStep={step} />

        {/* Current step content */}
        {renderCurrentStep()}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 6 && (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium text-sm transition-colors"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
