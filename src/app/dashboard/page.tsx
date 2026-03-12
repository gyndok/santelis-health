"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  Users,
  Stethoscope,
  MapPin,
  Palette,
  Star,
  Shield,
  Calendar,
  Loader2,
  ExternalLink,
  LogOut,
  Check,
} from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PracticeData {
  practice: Record<string, unknown>;
  providers: Record<string, unknown>[];
  services: Record<string, unknown>[];
  locations: Record<string, unknown>[];
  reviews: Record<string, unknown>[];
}

type TabId = "practice" | "providers" | "services" | "location" | "branding" | "reviews" | "insurance" | "requests";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "practice", label: "Practice Info", icon: <Building2 className="w-4 h-4" /> },
  { id: "providers", label: "Providers", icon: <Users className="w-4 h-4" /> },
  { id: "services", label: "Services", icon: <Stethoscope className="w-4 h-4" /> },
  { id: "location", label: "Location & Hours", icon: <MapPin className="w-4 h-4" /> },
  { id: "branding", label: "Branding", icon: <Palette className="w-4 h-4" /> },
  { id: "reviews", label: "Reviews", icon: <Star className="w-4 h-4" /> },
  { id: "insurance", label: "Insurance", icon: <Shield className="w-4 h-4" /> },
  { id: "requests", label: "Requests", icon: <Calendar className="w-4 h-4" /> },
];

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <DashboardContent />
    </Suspense>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const practiceIdParam = searchParams.get("practiceId");

  const [data, setData] = useState<PracticeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("practice");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const params = practiceIdParam ? `?practiceId=${practiceIdParam}` : "";
      const res = await fetch(`/api/dashboard/practice${params}`);
      if (!res.ok) {
        const err = await res.json();
        if (res.status === 404 && err.error === "No practice found") {
          window.location.href = "/dashboard/login?error=no_practice";
          return;
        }
        throw new Error(err.error || "Failed to load");
      }
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load practice data");
    } finally {
      setLoading(false);
    }
  }, [practiceIdParam]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSave(endpoint: string, body: unknown) {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const params = practiceIdParam ? `?practiceId=${practiceIdParam}` : "";
      const res = await fetch(`/api/dashboard/${endpoint}${params}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Save failed");
      }
      await fetchData();
      setPreviewKey((k) => k + 1);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    window.location.href = "/dashboard/login";
  }

  if (loading) return <LoadingScreen />;
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-2">
          <p className="text-red-600">{error}</p>
          <a href="/dashboard/login" className="text-blue-600 underline text-sm">
            Back to login
          </a>
        </div>
      </div>
    );
  }
  if (!data) return null;

  const practice = data.practice;
  const subdomain = practice.subdomain as string;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0">
        <div>
          <h1 className="font-bold text-gray-900">{practice.name as string}</h1>
          <p className="text-xs text-gray-500">{subdomain}.santelishealth.com</p>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-green-600 text-sm flex items-center gap-1">
              <Check className="w-4 h-4" /> Saved
            </span>
          )}
          <a
            href={`/demo/${subdomain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open site
          </a>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main content: sidebar + editor + preview */}
      <div className="flex flex-1 overflow-hidden">
        {/* Tab sidebar */}
        <div className="w-48 bg-white border-r shrink-0 overflow-y-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm text-left transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Editor panel */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl">
            {activeTab === "practice" && (
              <PracticeInfoTab practice={practice} onSave={(body) => handleSave("practice", body)} saving={saving} />
            )}
            {activeTab === "providers" && (
              <ProvidersTab providers={data.providers} onSave={(body) => handleSave("providers", body)} saving={saving} />
            )}
            {activeTab === "services" && (
              <ServicesTab services={data.services} onSave={(body) => handleSave("services", body)} saving={saving} />
            )}
            {activeTab === "location" && (
              <LocationTab location={data.locations[0] || {}} onSave={(body) => handleSave("location", body)} saving={saving} />
            )}
            {activeTab === "branding" && (
              <BrandingTab branding={(practice.branding || {}) as Record<string, unknown>} onSave={(body) => handleSave("branding", body)} saving={saving} />
            )}
            {activeTab === "reviews" && (
              <ReviewsTab reviews={data.reviews} onSave={(body) => handleSave("reviews", body)} saving={saving} />
            )}
            {activeTab === "insurance" && (
              <InsuranceTab insurances={(practice.insurances_accepted || []) as string[]} onSave={(body) => handleSave("practice", body)} saving={saving} />
            )}
            {activeTab === "requests" && <RequestsTab practiceIdParam={practiceIdParam} />}
          </div>
        </div>

        {/* Preview panel */}
        <div className="w-[45%] border-l bg-gray-100 shrink-0 hidden lg:block">
          <div className="h-full">
            <iframe
              key={previewKey}
              src={`/demo/${subdomain}?preview=true`}
              className="w-full h-full border-0"
              title="Site Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Save Button Component
// ---------------------------------------------------------------------------

function SaveButton({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
    >
      {saving && <Loader2 className="w-4 h-4 animate-spin" />}
      Save
    </button>
  );
}

// ---------------------------------------------------------------------------
// Practice Info Tab
// ---------------------------------------------------------------------------

function PracticeInfoTab({
  practice,
  onSave,
  saving,
}: {
  practice: Record<string, unknown>;
  onSave: (body: unknown) => void;
  saving: boolean;
}) {
  const [name, setName] = useState((practice.name as string) || "");
  const [specialty, setSpecialty] = useState((practice.specialty as string) || "");
  const branding = (practice.branding || {}) as Record<string, unknown>;
  const [tagline, setTagline] = useState((branding.tagline as string) || "");

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-gray-900">Practice Info</h2>
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Practice Name</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Specialty</span>
          <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {["obgyn","family-medicine","dermatology","orthopedics","pediatrics","internal-medicine","med-spa","cardiology","urology","ent"].map(s => (
              <option key={s} value={s}>{s.replace("-"," ").replace(/\b\w/g,c=>c.toUpperCase())}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Tagline</span>
          <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Compassionate care in your community" />
        </label>
      </div>
      <SaveButton saving={saving} onClick={() => onSave({ name, specialty, branding: { ...branding, tagline } })} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Providers Tab
// ---------------------------------------------------------------------------

function ProvidersTab({
  providers: initialProviders,
  onSave,
  saving,
}: {
  providers: Record<string, unknown>[];
  onSave: (body: unknown) => void;
  saving: boolean;
}) {
  const [providers, setProviders] = useState(initialProviders);

  function updateProvider(index: number, field: string, value: unknown) {
    const updated = [...providers];
    updated[index] = { ...updated[index], [field]: value };
    setProviders(updated);
  }

  function addProvider() {
    setProviders([...providers, { first_name: "", last_name: "", credentials: "MD", bio: "", education: [], board_certifications: [], languages: ["English"] }]);
  }

  function removeProvider(index: number) {
    setProviders(providers.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Providers</h2>
        <button onClick={addProvider} className="text-sm text-blue-600 hover:underline">+ Add provider</button>
      </div>
      {providers.map((p, i) => (
        <div key={i} className="bg-white border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Provider {i + 1}</span>
            {providers.length > 1 && (
              <button onClick={() => removeProvider(i)} className="text-xs text-red-500 hover:underline">Remove</button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" value={(p.first_name as string) || ""} onChange={(e) => updateProvider(i, "first_name", e.target.value)} placeholder="First name" className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="text" value={(p.last_name as string) || ""} onChange={(e) => updateProvider(i, "last_name", e.target.value)} placeholder="Last name" className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" value={(p.credentials as string) || ""} onChange={(e) => updateProvider(i, "credentials", e.target.value)} placeholder="Credentials (MD, DO)" className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="text" value={(p.title as string) || ""} onChange={(e) => updateProvider(i, "title", e.target.value)} placeholder="Title" className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <textarea value={(p.bio as string) || ""} onChange={(e) => updateProvider(i, "bio", e.target.value)} placeholder="Bio" rows={3} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      ))}
      <SaveButton saving={saving} onClick={() => onSave({ providers })} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Services Tab
// ---------------------------------------------------------------------------

function ServicesTab({
  services: initialServices,
  onSave,
  saving,
}: {
  services: Record<string, unknown>[];
  onSave: (body: unknown) => void;
  saving: boolean;
}) {
  const [services, setServices] = useState(initialServices);

  function updateService(index: number, field: string, value: unknown) {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  }

  function addService() {
    setServices([...services, { title: "", description: "", featured: false }]);
  }

  function removeService(index: number) {
    setServices(services.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Services</h2>
        <button onClick={addService} className="text-sm text-blue-600 hover:underline">+ Add service</button>
      </div>
      {services.map((s, i) => (
        <div key={i} className="bg-white border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!s.featured} onChange={(e) => updateService(i, "featured", e.target.checked)} className="rounded" />
              Featured
            </label>
            <button onClick={() => removeService(i)} className="text-xs text-red-500 hover:underline">Remove</button>
          </div>
          <input type="text" value={(s.title as string) || ""} onChange={(e) => updateService(i, "title", e.target.value)} placeholder="Service name" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <textarea value={(s.description as string) || ""} onChange={(e) => updateService(i, "description", e.target.value)} placeholder="Description" rows={2} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      ))}
      <SaveButton saving={saving} onClick={() => onSave({ services })} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Location & Hours Tab
// ---------------------------------------------------------------------------

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

function LocationTab({
  location: initialLocation,
  onSave,
  saving,
}: {
  location: Record<string, unknown>;
  onSave: (body: unknown) => void;
  saving: boolean;
}) {
  const [loc, setLoc] = useState(initialLocation);
  const hours = (loc.hours || {}) as Record<string, string | undefined>;

  function update(field: string, value: unknown) {
    setLoc({ ...loc, [field]: value });
  }

  function updateHour(day: string, value: string) {
    setLoc({ ...loc, hours: { ...hours, [day]: value || undefined } });
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-gray-900">Location & Hours</h2>
      <div className="space-y-3">
        <input type="text" value={(loc.address as string) || ""} onChange={(e) => update("address", e.target.value)} placeholder="Address" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <div className="grid grid-cols-3 gap-3">
          <input type="text" value={(loc.city as string) || ""} onChange={(e) => update("city", e.target.value)} placeholder="City" className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="text" value={(loc.state as string) || ""} onChange={(e) => update("state", e.target.value)} placeholder="State" className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="text" value={(loc.zip as string) || ""} onChange={(e) => update("zip", e.target.value)} placeholder="Zip" className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input type="text" value={(loc.phone as string) || ""} onChange={(e) => update("phone", e.target.value)} placeholder="Phone" className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="text" value={(loc.fax as string) || ""} onChange={(e) => update("fax", e.target.value)} placeholder="Fax" className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <input type="email" value={(loc.email as string) || ""} onChange={(e) => update("email", e.target.value)} placeholder="Email" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <h3 className="text-sm font-semibold text-gray-700 mt-4">Office Hours</h3>
      <div className="space-y-2">
        {DAYS.map((day) => (
          <div key={day} className="flex items-center gap-3">
            <span className="w-24 text-sm text-gray-600 capitalize">{day}</span>
            <input type="text" value={hours[day] || ""} onChange={(e) => updateHour(day, e.target.value)} placeholder="e.g. 8:00 AM - 5:00 PM or Closed" className="flex-1 px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        ))}
      </div>
      <SaveButton saving={saving} onClick={() => onSave(loc)} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Branding Tab
// ---------------------------------------------------------------------------

function BrandingTab({
  branding: initialBranding,
  onSave,
  saving,
}: {
  branding: Record<string, unknown>;
  onSave: (body: unknown) => void;
  saving: boolean;
}) {
  const [branding, setBranding] = useState(initialBranding);
  const palette = (branding.colorPalette || {}) as Record<string, string>;

  function updatePalette(key: string, value: string) {
    setBranding({ ...branding, colorPalette: { ...palette, [key]: value } });
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-gray-900">Branding</h2>
      <label className="block">
        <span className="text-sm font-medium text-gray-700">Tagline</span>
        <input type="text" value={(branding.tagline as string) || ""} onChange={(e) => setBranding({ ...branding, tagline: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </label>
      <div>
        <span className="text-sm font-medium text-gray-700">Color Palette</span>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {["primary", "primaryDark", "accent", "neutral", "neutralDark"].map((key) => (
            <label key={key} className="flex items-center gap-2">
              <input type="color" value={palette[key] || "#000000"} onChange={(e) => updatePalette(key, e.target.value)} className="w-8 h-8 rounded cursor-pointer border" />
              <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
            </label>
          ))}
        </div>
      </div>
      <SaveButton saving={saving} onClick={() => onSave(branding)} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reviews Tab
// ---------------------------------------------------------------------------

function ReviewsTab({
  reviews: initialReviews,
  onSave,
  saving,
}: {
  reviews: Record<string, unknown>[];
  onSave: (body: unknown) => void;
  saving: boolean;
}) {
  const [reviews, setReviews] = useState(initialReviews);

  function updateReview(index: number, field: string, value: unknown) {
    const updated = [...reviews];
    updated[index] = { ...updated[index], [field]: value };
    setReviews(updated);
  }

  function addReview() {
    setReviews([...reviews, { author_name: "", rating: 5, text: "", source: "manual" }]);
  }

  function removeReview(index: number) {
    setReviews(reviews.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
        <button onClick={addReview} className="text-sm text-blue-600 hover:underline">+ Add review</button>
      </div>
      {reviews.map((r, i) => (
        <div key={i} className="bg-white border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rating:</span>
              <select value={(r.rating as number) || 5} onChange={(e) => updateReview(i, "rating", parseInt(e.target.value))} className="px-2 py-1 border rounded text-sm">
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n} star{n !== 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>
            <button onClick={() => removeReview(i)} className="text-xs text-red-500 hover:underline">Remove</button>
          </div>
          <input type="text" value={(r.author_name as string) || ""} onChange={(e) => updateReview(i, "author_name", e.target.value)} placeholder="Author name" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <textarea value={(r.text as string) || ""} onChange={(e) => updateReview(i, "text", e.target.value)} placeholder="Review text" rows={2} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      ))}
      <SaveButton saving={saving} onClick={() => onSave({ reviews })} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Insurance Tab
// ---------------------------------------------------------------------------

const COMMON_INSURERS = [
  "Aetna", "Blue Cross Blue Shield", "Cigna", "United Healthcare",
  "Medicare", "Medicaid", "Humana", "Kaiser Permanente", "Tricare",
  "Anthem", "Molina", "Centene", "Ambetter", "Oscar Health",
];

function InsuranceTab({
  insurances: initial,
  onSave,
  saving,
}: {
  insurances: string[];
  onSave: (body: unknown) => void;
  saving: boolean;
}) {
  const [insurances, setInsurances] = useState<string[]>(initial);
  const [newInsurer, setNewInsurer] = useState("");

  function addInsurer(name: string) {
    if (name && !insurances.includes(name)) {
      setInsurances([...insurances, name]);
    }
    setNewInsurer("");
  }

  function removeInsurer(index: number) {
    setInsurances(insurances.filter((_, i) => i !== index));
  }

  const suggestions = COMMON_INSURERS.filter(
    (ins) => !insurances.includes(ins) && ins.toLowerCase().includes(newInsurer.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-gray-900">Insurance Accepted</h2>
      <div className="flex flex-wrap gap-2">
        {insurances.map((ins, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
            {ins}
            <button onClick={() => removeInsurer(i)} className="text-blue-400 hover:text-blue-600">&times;</button>
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          type="text"
          value={newInsurer}
          onChange={(e) => setNewInsurer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addInsurer(newInsurer);
            }
          }}
          placeholder="Type to add insurer..."
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {newInsurer && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
            {suggestions.map((ins) => (
              <button
                key={ins}
                onClick={() => addInsurer(ins)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
              >
                {ins}
              </button>
            ))}
          </div>
        )}
      </div>
      <SaveButton saving={saving} onClick={() => onSave({ insurances_accepted: insurances })} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Requests Tab
// ---------------------------------------------------------------------------

function RequestsTab({ practiceIdParam }: { practiceIdParam: string | null }) {
  const [appointments, setAppointments] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAppointments() {
      const params = practiceIdParam ? `?practiceId=${practiceIdParam}` : "";
      const res = await window.fetch(`/api/dashboard/appointments${params}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
      setLoading(false);
    }
    fetchAppointments();
  }, [practiceIdParam]);

  async function updateStatus(id: string, status: string) {
    const params = practiceIdParam ? `?practiceId=${practiceIdParam}` : "";
    await window.fetch(`/api/dashboard/appointments${params}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  }

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800",
    contacted: "bg-yellow-100 text-yellow-800",
    scheduled: "bg-green-100 text-green-800",
    dismissed: "bg-gray-100 text-gray-800",
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }

  if (appointments.length === 0) {
    return <div className="text-center py-12 text-gray-500">No appointment requests yet.</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Appointment Requests</h3>
      <div className="space-y-3">
        {appointments.map((apt) => (
          <div key={apt.id as string} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium text-gray-900">{apt.patient_name as string}</div>
                <div className="text-sm text-gray-500">{String(apt.email)}{apt.phone ? ` · ${String(apt.phone)}` : ""}</div>
                {apt.preferred_date ? (
                  <div className="text-sm text-gray-500 mt-1">
                    Preferred: {String(apt.preferred_date)}{apt.preferred_time ? ` (${String(apt.preferred_time)})` : ""}
                  </div>
                ) : null}
                {apt.reason ? (
                  <div className="text-sm text-gray-600 mt-1">{String(apt.reason)}</div>
                ) : null}
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(apt.created_at as string).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
                  })}
                </div>
              </div>
              <select
                value={apt.status as string}
                onChange={(e) => updateStatus(apt.id as string, e.target.value)}
                className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer ${statusColors[(apt.status as string) || "new"]}`}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="scheduled">Scheduled</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
