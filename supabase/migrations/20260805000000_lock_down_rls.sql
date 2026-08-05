-- ============================================================
-- Lock down RLS (2026-08-05 security review)
-- ============================================================
-- All application data access flows through server-side API routes
-- using the service role key, which bypasses RLS entirely. Client-side
-- Supabase is used for auth only. Therefore no anon/authenticated
-- policies are needed at all: default-deny.
--
-- The dropped "Authenticated users full access" policies let ANY
-- signed-up user read/modify every practice's data. The dropped
-- appointment_requests policy had no TO clause, so it granted
-- anon/authenticated full read-write access to patient PII.
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users full access to practices"  ON practices;
DROP POLICY IF EXISTS "Authenticated users full access to providers"  ON providers;
DROP POLICY IF EXISTS "Authenticated users full access to services"   ON services;
DROP POLICY IF EXISTS "Authenticated users full access to locations"  ON locations;
DROP POLICY IF EXISTS "Authenticated users full access to reviews"    ON reviews;
DROP POLICY IF EXISTS "Authenticated users full access to blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users full access to prospects"  ON prospects;

-- Public read policies expose all columns (including stripe_customer_id
-- and owner_email on practices) via the anon REST API. Site rendering
-- uses the service role, so these are unnecessary.
DROP POLICY IF EXISTS "Public can read live practices"                    ON practices;
DROP POLICY IF EXISTS "Public can read providers of live practices"      ON providers;
DROP POLICY IF EXISTS "Public can read services of live practices"       ON services;
DROP POLICY IF EXISTS "Public can read locations of live practices"      ON locations;
DROP POLICY IF EXISTS "Public can read reviews of live practices"        ON reviews;
DROP POLICY IF EXISTS "Public can read published posts of live practices" ON blog_posts;

-- The service role needs no policy; it bypasses RLS.
DROP POLICY IF EXISTS "Service role full access to appointment_requests" ON appointment_requests;

-- The live table was created with RLS disabled — enable it (idempotent).
ALTER TABLE appointment_requests ENABLE ROW LEVEL SECURITY;

-- Align with every other child table: cascade on practice deletion.
ALTER TABLE appointment_requests
  DROP CONSTRAINT IF EXISTS appointment_requests_practice_id_fkey;
ALTER TABLE appointment_requests
  ADD CONSTRAINT appointment_requests_practice_id_fkey
  FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE;
