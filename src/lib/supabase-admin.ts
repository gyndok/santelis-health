import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

/**
 * Server-side Supabase client using the service role key.
 * Bypasses RLS — use only in API routes / server actions.
 * Lazily initialized to avoid crashing during build when env vars are absent.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.",
      );
    }

    _client = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return _client;
}
