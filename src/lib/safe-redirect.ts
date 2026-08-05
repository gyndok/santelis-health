/**
 * Validate a user-supplied redirect target. Only same-origin absolute
 * paths are allowed; anything else returns the fallback.
 */
export function safeRedirectPath(raw: string | null, fallback: string): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) {
    return fallback;
  }
  return raw;
}
