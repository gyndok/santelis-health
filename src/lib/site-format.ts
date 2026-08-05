import type { OfficeHours } from "@/types";

const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Render weekly hours as display lines, grouping consecutive days that
 * share identical hours ("Mon–Thu: 8am–5pm"). Unset days show "Closed".
 * Returns [] when no day has hours at all (caller hides the block).
 */
export function formatOfficeHours(hours: OfficeHours): string[] {
  const values = DAY_KEYS.map((k) => hours[k]?.trim() || "Closed");
  if (values.every((v) => v === "Closed")) return [];

  const lines: string[] = [];
  let start = 0;
  for (let i = 1; i <= values.length; i++) {
    if (i === values.length || values[i] !== values[start]) {
      const label =
        i - 1 === start ? DAY_LABELS[start] : `${DAY_LABELS[start]}–${DAY_LABELS[i - 1]}`;
      lines.push(`${label}: ${values[start]}`);
      start = i;
    }
  }
  return lines;
}

/** "★★★★☆" from a numeric average, rounded to the nearest whole star. */
export function starString(avgRating: number): string {
  const filled = Math.min(5, Math.max(0, Math.round(avgRating)));
  return "★".repeat(filled) + "☆".repeat(5 - filled);
}

const PHYSICIAN_CREDENTIALS = /\b(MD|DO|MBBS|DPM|DDS|DMD)\b/i;

/**
 * "Dr. Jane Smith" for physician credentials; otherwise the credentials
 * are shown as a suffix ("Ann Lee, NP") so NPs/PAs aren't mislabeled.
 */
export function providerDisplayName(p: {
  firstName: string;
  lastName: string;
  credentials: string;
}): string {
  const name = `${p.firstName} ${p.lastName}`.trim();
  if (PHYSICIAN_CREDENTIALS.test(p.credentials)) return `Dr. ${name}`;
  return p.credentials ? `${name}, ${p.credentials}` : name;
}

/** Uppercase initials, safe on empty or missing names. */
export function initials(first?: string, last?: string): string {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

/**
 * Format an ISO date (YYYY-MM-DD) as "Feb 2026", parsing as a LOCAL
 * date — `new Date("2026-02-01")` is UTC midnight and shifts a day
 * backward in US timezones.
 */
export function formatReviewDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return "";
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}
