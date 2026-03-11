"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Globe,
  RefreshCw,
  ExternalLink,
  Star,
  Zap,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Prospect {
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
  outreach_status: string;
  created_at: string;
}

type StatusFilter = "all" | "no-website" | "discovered" | "qualified" | "demo-generated";

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: "All",
  "no-website": "No Website",
  discovered: "Discovered",
  qualified: "Qualified",
  "demo-generated": "Demo Generated",
};

const STATUS_COLORS: Record<string, string> = {
  "no-website": "bg-red-100 text-red-700",
  discovered: "bg-gray-100 text-gray-700",
  qualified: "bg-green-100 text-green-700",
  "demo-generated": "bg-blue-100 text-blue-700",
  emailed: "bg-purple-100 text-purple-700",
};

const SPECIALTIES = [
  { value: "all", label: "All Specialties" },
  { value: "obgyn", label: "OB/GYN" },
  { value: "family-medicine", label: "Family Medicine" },
  { value: "dermatology", label: "Dermatology" },
  { value: "orthopedics", label: "Orthopedics" },
  { value: "pediatrics", label: "Pediatrics" },
  { value: "internal-medicine", label: "Internal Medicine" },
  { value: "med-spa", label: "Med Spa" },
  { value: "cardiology", label: "Cardiology" },
  { value: "urology", label: "Urology" },
  { value: "ent", label: "ENT" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminProspectsPage() {
  // Data
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Discovery form
  const [discoverCity, setDiscoverCity] = useState("");
  const [discoverState, setDiscoverState] = useState("");
  const [discoverSpecialty, setDiscoverSpecialty] = useState("all");
  const [discovering, setDiscovering] = useState(false);
  const [discoverResult, setDiscoverResult] = useState<string | null>(null);

  // URL scrape form
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scrapeSpecialty, setScrapeSpecialty] = useState("all");
  const [scraping, setScraping] = useState(false);

  // Row actions
  const [actionLoading, setActionLoading] = useState<Record<string, string>>({});
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Status counts
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  // ---------------------------------------------------------------------------
  // Fetch prospects
  // ---------------------------------------------------------------------------

  const fetchProspects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("limit", "50");

      const res = await fetch(`/api/prospects?${params.toString()}`);
      const data = await res.json();
      setProspects(data.prospects || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch prospects:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const fetchStatusCounts = useCallback(async () => {
    const statuses = ["no-website", "discovered", "qualified", "demo-generated"];
    const counts: Record<string, number> = {};

    // Fetch all to get total
    const allRes = await fetch("/api/prospects?limit=1");
    const allData = await allRes.json();
    counts.all = allData.total || 0;

    await Promise.all(
      statuses.map(async (status) => {
        const res = await fetch(`/api/prospects?status=${status}&limit=1`);
        const data = await res.json();
        counts[status] = data.total || 0;
      }),
    );

    setStatusCounts(counts);
  }, []);

  useEffect(() => {
    fetchProspects();
  }, [fetchProspects]);

  useEffect(() => {
    fetchStatusCounts();
  }, [fetchStatusCounts]);

  // ---------------------------------------------------------------------------
  // Discover by location
  // ---------------------------------------------------------------------------

  async function handleDiscover(e: React.FormEvent) {
    e.preventDefault();
    if (!discoverCity || !discoverState) return;

    setDiscovering(true);
    setDiscoverResult(null);

    try {
      const res = await fetch("/api/prospects/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: discoverCity,
          state: discoverState,
          specialty: discoverSpecialty !== "all" ? discoverSpecialty : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setDiscoverResult(
          `Found ${data.total} practices. ${data.new} new, ${data.skipped} duplicates skipped.`,
        );
        fetchProspects();
        fetchStatusCounts();
      } else {
        setDiscoverResult(`Error: ${data.error}`);
      }
    } catch (err) {
      setDiscoverResult(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setDiscovering(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Scrape by URL
  // ---------------------------------------------------------------------------

  async function handleScrapeUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!scrapeUrl) return;

    setScraping(true);
    try {
      const res = await fetch("/api/prospects/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: scrapeUrl,
          specialty: scrapeSpecialty !== "all" ? scrapeSpecialty : undefined,
        }),
      });

      if (res.ok) {
        setScrapeUrl("");
        fetchProspects();
        fetchStatusCounts();
      } else {
        const data = await res.json();
        alert(`Scrape failed: ${data.error}`);
      }
    } catch (err) {
      alert(`Scrape failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setScraping(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Row actions
  // ---------------------------------------------------------------------------

  async function handleScrapeProspect(id: string) {
    setActionLoading((prev) => ({ ...prev, [id]: "scraping" }));
    try {
      const res = await fetch("/api/prospects/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectId: id }),
      });

      if (res.ok) {
        fetchProspects();
        fetchStatusCounts();
      } else {
        const data = await res.json();
        alert(`Scrape failed: ${data.error}`);
      }
    } catch (err) {
      alert(`Scrape failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  }

  async function handleGenerateDemo(id: string) {
    setActionLoading((prev) => ({ ...prev, [id]: "generating" }));
    try {
      const res = await fetch(`/api/prospects/${id}/generate-demo`, {
        method: "POST",
      });

      if (res.ok) {
        fetchProspects();
        fetchStatusCounts();
      } else {
        const data = await res.json();
        alert(`Demo generation failed: ${data.error}`);
      }
    } catch (err) {
      alert(`Demo generation failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function scoreColor(score: number): string {
    if (score >= 60) return "text-green-600 font-bold";
    if (score >= 40) return "text-yellow-600 font-semibold";
    return "text-gray-400";
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Prospect Pipeline</h1>
        <p className="text-sm text-gray-500 mt-1">
          Discover, scrape, and qualify doctor practices
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Search Forms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Location Discovery */}
          <form
            onSubmit={handleDiscover}
            className="bg-white rounded-xl p-5 shadow-sm border space-y-3"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Search className="w-4 h-4" />
              Discover by Location
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="City"
                value={discoverCity}
                onChange={(e) => setDiscoverCity(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="State (TX)"
                value={discoverState}
                onChange={(e) => setDiscoverState(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={2}
                required
              />
              <select
                value={discoverSpecialty}
                onChange={(e) => setDiscoverSpecialty(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SPECIALTIES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={discovering}
              className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {discovering ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Discover Doctors"
              )}
            </button>
            {discoverResult && (
              <p className="text-sm text-gray-600">{discoverResult}</p>
            )}
          </form>

          {/* URL Scrape */}
          <form
            onSubmit={handleScrapeUrl}
            className="bg-white rounded-xl p-5 shadow-sm border space-y-3"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Globe className="w-4 h-4" />
              Scrape by URL
            </div>
            <input
              type="url"
              placeholder="https://doctorwebsite.com"
              value={scrapeUrl}
              onChange={(e) => setScrapeUrl(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <select
              value={scrapeSpecialty}
              onChange={(e) => setScrapeSpecialty(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SPECIALTIES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={scraping}
              className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {scraping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scraping...
                </>
              ) : (
                "Scrape & Score"
              )}
            </button>
          </form>
        </div>

        {/* Status Filter Bar */}
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(STATUS_LABELS) as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                statusFilter === status
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border hover:bg-gray-50"
              }`}
            >
              {STATUS_LABELS[status]}
              {statusCounts[status] !== undefined && (
                <span className="ml-1.5 text-xs opacity-75">
                  ({statusCounts[status]})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Prospects Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : prospects.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No prospects found. Use the search forms above to discover doctors.
            </div>
          ) : (
            <>
              <div className="px-5 py-3 border-b text-sm text-gray-500">
                {total} prospect{total !== 1 ? "s" : ""}
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">Practice</th>
                    <th className="text-left px-3 py-3 font-medium">Location</th>
                    <th className="text-left px-3 py-3 font-medium">Specialty</th>
                    <th className="text-center px-3 py-3 font-medium">Rating</th>
                    <th className="text-center px-3 py-3 font-medium">PageSpeed</th>
                    <th className="text-center px-3 py-3 font-medium">Score</th>
                    <th className="text-center px-3 py-3 font-medium">Status</th>
                    <th className="text-right px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {prospects.map((p) => (
                    <ProspectRow
                      key={p.id}
                      prospect={p}
                      expanded={expandedRow === p.id}
                      onToggleExpand={() =>
                        setExpandedRow(expandedRow === p.id ? null : p.id)
                      }
                      actionLoading={actionLoading[p.id]}
                      onScrape={() => handleScrapeProspect(p.id)}
                      onGenerateDemo={() => handleGenerateDemo(p.id)}
                      scoreColor={scoreColor}
                    />
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Prospect Row Component
// ---------------------------------------------------------------------------

function ProspectRow({
  prospect: p,
  expanded,
  onToggleExpand,
  actionLoading,
  onScrape,
  onGenerateDemo,
  scoreColor,
}: {
  prospect: Prospect;
  expanded: boolean;
  onToggleExpand: () => void;
  actionLoading?: string;
  onScrape: () => void;
  onGenerateDemo: () => void;
  scoreColor: (score: number) => string;
}) {
  return (
    <>
      <tr
        className="hover:bg-gray-50 cursor-pointer"
        onClick={onToggleExpand}
      >
        <td className="px-5 py-3">
          <div className="font-medium text-gray-900">{p.practice_name}</div>
          {p.provider_name && (
            <div className="text-xs text-gray-500">{p.provider_name}</div>
          )}
        </td>
        <td className="px-3 py-3 text-gray-600">
          {[p.city, p.state].filter(Boolean).join(", ")}
        </td>
        <td className="px-3 py-3 text-gray-600 capitalize">
          {p.specialty.replace("-", " ")}
        </td>
        <td className="px-3 py-3 text-center">
          {p.google_rating ? (
            <span className="inline-flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              {p.google_rating}
              {p.google_review_count && (
                <span className="text-xs text-gray-400">
                  ({p.google_review_count})
                </span>
              )}
            </span>
          ) : (
            <span className="text-gray-300">—</span>
          )}
        </td>
        <td className="px-3 py-3 text-center">
          {p.current_page_speed !== null ? (
            <span
              className={
                p.current_page_speed < 50
                  ? "text-red-600 font-semibold"
                  : p.current_page_speed <= 70
                    ? "text-yellow-600"
                    : "text-green-600"
              }
            >
              {p.current_page_speed}
            </span>
          ) : (
            <span className="text-gray-300">—</span>
          )}
        </td>
        <td className="px-3 py-3 text-center">
          <span className={scoreColor(p.qualification_score)}>
            {p.qualification_score}
          </span>
        </td>
        <td className="px-3 py-3 text-center">
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
              STATUS_COLORS[p.outreach_status] || "bg-gray-100 text-gray-600"
            }`}
          >
            {p.outreach_status}
          </span>
        </td>
        <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-end gap-2">
            {p.outreach_status === "discovered" && (
              <button
                onClick={onScrape}
                disabled={!!actionLoading}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 disabled:opacity-50"
              >
                {actionLoading === "scraping" ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                Scrape
              </button>
            )}
            {(p.outreach_status === "qualified" || p.outreach_status === "no-website") && (
              <button
                onClick={onGenerateDemo}
                disabled={!!actionLoading}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50"
              >
                {actionLoading === "generating" ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Zap className="w-3 h-3" />
                )}
                Generate Demo
              </button>
            )}
            {p.demo_slug && (
              <a
                href={`/demo/${p.demo_slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
              >
                <ExternalLink className="w-3 h-3" />
                View Demo
              </a>
            )}
            {p.website_url && (
              <a
                href={p.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600"
                title="Visit website"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </td>
      </tr>

      {/* Expanded detail */}
      {expanded && (
        <tr>
          <td colSpan={8} className="bg-gray-50 px-5 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Contact Info</h4>
                <div className="space-y-1 text-gray-600">
                  <div>Address: {p.address || "—"}</div>
                  <div>Phone: {p.phone || "—"}</div>
                  <div>Email: {p.email || "—"}</div>
                  <div>
                    Website:{" "}
                    {p.website_url ? (
                      <a
                        href={p.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {p.website_url}
                      </a>
                    ) : (
                      "None"
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Scraped Data</h4>
                {p.scraped_data ? (
                  <ScrapedDataSummary data={p.scraped_data as Record<string, unknown>} />
                ) : (
                  <div className="text-gray-400">Not yet scraped</div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Scraped Data Summary
// ---------------------------------------------------------------------------

function ScrapedDataSummary({ data }: { data: Record<string, unknown> }) {
  const providers = Array.isArray(data.providerNames)
    ? (data.providerNames as string[]).join(", ")
    : null;
  const services = Array.isArray(data.services)
    ? (data.services as string[]).slice(0, 5).join(", ")
    : null;
  const about = typeof data.aboutText === "string"
    ? data.aboutText.slice(0, 200)
    : null;

  return (
    <div className="space-y-1 text-gray-600">
      {providers && <div>Providers: {providers}</div>}
      {services && <div>Services: {services}</div>}
      {about && <div>About: {about}...</div>}
      {!providers && !services && !about && (
        <div className="text-gray-400">No extractable data</div>
      )}
    </div>
  );
}
