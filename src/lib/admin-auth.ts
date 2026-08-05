import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export function parseAdminEmails(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(
  email: string | null | undefined,
  adminEmails: string[],
): boolean {
  if (!email || adminEmails.length === 0) return false;
  return adminEmails.includes(email.trim().toLowerCase());
}

/**
 * Gate an API route to ADMIN_EMAILS members. Returns the admin's email.
 * Throws Error("Unauthorized") for anonymous users, non-admins, and
 * when ADMIN_EMAILS is unset (fail closed).
 */
export async function requireAdmin(request: NextRequest): Promise<string> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminEmail(user?.email, parseAdminEmails(process.env.ADMIN_EMAILS))) {
    throw new Error("Unauthorized");
  }
  return user!.email!;
}
