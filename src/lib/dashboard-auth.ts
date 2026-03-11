import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseAdmin } from "./supabase-admin";

interface DashboardAuth {
  practiceId: string;
  userEmail: string;
  isAdmin: boolean;
}

/**
 * Authenticate a dashboard API request and resolve the practice ID.
 * - Checks Supabase auth session
 * - If practiceId query param + user is admin → use that practice
 * - Otherwise, find practice by owner_email
 * - Throws if unauthorized or no practice found
 */
export async function authenticateDashboard(
  request: NextRequest,
): Promise<DashboardAuth> {
  // Create a Supabase client from the request cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // Read-only in API routes for auth check
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    throw new Error("Unauthorized");
  }

  const userEmail = user.email;
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim()) || [];
  const isAdmin = adminEmails.includes(userEmail);

  // Admin impersonation: use practiceId from query param
  const { searchParams } = new URL(request.url);
  const practiceIdParam = searchParams.get("practiceId");

  if (practiceIdParam && isAdmin) {
    return { practiceId: practiceIdParam, userEmail, isAdmin };
  }

  // Find practice by owner_email
  const admin = getSupabaseAdmin();
  const { data: practice, error } = await admin
    .from("practices")
    .select("id")
    .eq("owner_email", userEmail)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  if (!practice) {
    throw new Error("No practice found");
  }

  return { practiceId: practice.id, userEmail, isAdmin };
}
