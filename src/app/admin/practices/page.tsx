"use client";

import { useState, useEffect } from "react";
import { Building2, ExternalLink, Pencil, Loader2 } from "lucide-react";

interface Practice {
  id: string;
  practice_name: string;
  subdomain: string;
  specialty: string;
  status: string;
  plan: string;
  owner_email: string | null;
  created_at: string;
}

export default function AdminPracticesPage() {
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPractices();
  }, []);

  async function fetchPractices() {
    try {
      const res = await fetch("/api/admin/practices");
      if (!res.ok) throw new Error("Failed to fetch practices");
      const data = await res.json();
      setPractices(data.practices || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Practices</h1>
          </div>
          <a
            href="/admin/prospects"
            className="text-sm text-blue-600 hover:underline"
          >
            Prospects &rarr;
          </a>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && practices.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No practices found.
          </div>
        )}

        {!loading && practices.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Practice
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialty
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {practices.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {p.practice_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {p.subdomain}.santelishealth.com
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {p.specialty}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {p.owner_email || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          p.status === "live"
                            ? "bg-green-100 text-green-800"
                            : p.status === "preview"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                      {p.plan}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/dashboard?practiceId=${p.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </a>
                        <a
                          href={`/demo/${p.subdomain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
