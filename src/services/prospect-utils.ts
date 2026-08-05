/** Pure helpers for the prospect pipeline — kept separate for unit testing. */

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const IMAGE_EXT_PATTERN = /\.(png|jpe?g|gif|webp|svg|ico|avif)$/i;

/**
 * Normalize a URL for storage and dedup: validates it, lowercases
 * scheme/host (URL does this), strips the fragment, and drops a bare
 * trailing slash. Throws on invalid or non-http(s) input.
 */
export function normalizeUrl(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new Error(`Invalid URL: ${raw}`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`Unsupported URL scheme: ${url.protocol}`);
  }
  url.hash = "";
  let normalized = url.toString();
  if (url.pathname === "/" && !url.search) {
    normalized = normalized.replace(/\/$/, "");
  }
  return normalized;
}

function siteDomain(siteUrl?: string): string | null {
  if (!siteUrl) return null;
  try {
    return new URL(siteUrl).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Pick the best contact email from a scraped page.
 * Preference: mailto: links (explicit contact intent) over text matches;
 * within each, addresses on the site's own domain first. Filters out
 * image filenames like logo@2x.png that the naive regex used to match.
 */
export function pickContactEmail(
  markdown: string,
  html: string,
  siteUrl?: string,
): string | undefined {
  const mailtos = [...html.matchAll(/mailto:([^"'\s?&>]+)/gi)].map((m) => m[1]);
  const textMatches = [...markdown.matchAll(new RegExp(EMAIL_PATTERN, "g"))].map(
    (m) => m[0],
  );

  const clean = (list: string[]) =>
    list
      .map((e) => e.trim().toLowerCase())
      .filter((e) => EMAIL_PATTERN.test(e) && !IMAGE_EXT_PATTERN.test(e));

  const domain = siteDomain(siteUrl);
  const onDomain = (e: string) => (domain ? e.endsWith(`@${domain}`) : false);

  for (const pool of [clean(mailtos), clean(textMatches)]) {
    if (pool.length === 0) continue;
    return pool.find(onDomain) ?? pool[0];
  }
  return undefined;
}
