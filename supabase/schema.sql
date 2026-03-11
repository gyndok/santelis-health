-- ============================================================
-- Santelis Health — Database Schema
-- ============================================================
-- Run this against a fresh Supabase project to create all tables,
-- indexes, and RLS policies.
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. practices — core practice configuration
-- ============================================================
CREATE TABLE practices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  specialty         TEXT NOT NULL,              -- 'obgyn', 'family-medicine', etc.
  sub_specialties   TEXT[] DEFAULT '{}',
  subdomain         TEXT NOT NULL,              -- {slug}.santelishealth.com
  domain            TEXT,                       -- optional custom domain
  plan              TEXT NOT NULL DEFAULT 'starter'
                      CHECK (plan IN ('starter', 'professional', 'practice', 'enterprise')),
  status            TEXT NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft', 'preview', 'live')),
  stripe_customer_id TEXT,
  branding          JSONB DEFAULT '{}',         -- logo, colors, hero, tagline, font
  seo_config        JSONB DEFAULT '{}',         -- title, description, keywords, og, structured data
  integrations      JSONB DEFAULT '{}',         -- booking, forms, portals, social
  insurances_accepted TEXT[] DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_practices_subdomain ON practices (subdomain);
CREATE UNIQUE INDEX idx_practices_domain    ON practices (domain) WHERE domain IS NOT NULL;

-- ============================================================
-- 2. providers — linked to practices
-- ============================================================
CREATE TABLE providers (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id          UUID NOT NULL REFERENCES practices (id) ON DELETE CASCADE,
  first_name           TEXT NOT NULL,
  last_name            TEXT NOT NULL,
  credentials          TEXT NOT NULL,            -- 'MD', 'DO', 'NP', 'PA'
  title                TEXT,                     -- 'Board Certified Obstetrician & Gynecologist'
  bio                  TEXT NOT NULL DEFAULT '',
  photo_url            TEXT,
  education            JSONB DEFAULT '[]',       -- array of { institution, degree, year?, honors? }
  board_certifications JSONB DEFAULT '[]',       -- array of { board, specialty, verificationUrl, badgeImageUrl? }
  languages            TEXT[] DEFAULT '{}',
  display_order        INTEGER NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_providers_practice_id ON providers (practice_id);

-- ============================================================
-- 3. services — linked to practices
-- ============================================================
CREATE TABLE services (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id   UUID NOT NULL REFERENCES practices (id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  icon          TEXT,
  featured      BOOLEAN NOT NULL DEFAULT false,
  link_url      TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_services_practice_id ON services (practice_id);

-- ============================================================
-- 4. locations — linked to practices
-- ============================================================
CREATE TABLE locations (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id          UUID NOT NULL REFERENCES practices (id) ON DELETE CASCADE,
  name                 TEXT,                     -- for multi-location practices
  address              TEXT NOT NULL,
  city                 TEXT NOT NULL,
  state                TEXT NOT NULL,
  zip                  TEXT NOT NULL,
  phone                TEXT NOT NULL,
  fax                  TEXT,
  email                TEXT,
  hours                JSONB DEFAULT '{}',       -- { monday?: string, ... sunday?: string }
  google_maps_embed_url TEXT,
  lat                  DOUBLE PRECISION,
  lng                  DOUBLE PRECISION,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_locations_practice_id ON locations (practice_id);

-- ============================================================
-- 5. reviews — linked to practices
-- ============================================================
CREATE TABLE reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id   UUID NOT NULL REFERENCES practices (id) ON DELETE CASCADE,
  author_name   TEXT NOT NULL,
  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text          TEXT NOT NULL DEFAULT '',
  review_date   DATE,
  source        TEXT NOT NULL DEFAULT 'manual'
                  CHECK (source IN ('google', 'healthgrades', 'manual')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_practice_id ON reviews (practice_id);

-- ============================================================
-- 6. prospects — outreach engine
-- ============================================================
CREATE TABLE prospects (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_name        TEXT NOT NULL,
  provider_name        TEXT NOT NULL,
  specialty            TEXT NOT NULL,
  website_url          TEXT,
  address              TEXT,
  city                 TEXT,
  state                TEXT,
  phone                TEXT,
  email                TEXT,
  google_rating        NUMERIC(2,1),
  google_review_count  INTEGER,
  current_page_speed   INTEGER,
  qualification_score  INTEGER NOT NULL DEFAULT 0,
  scraped_data         JSONB DEFAULT '{}',
  demo_slug            TEXT,
  outreach_status      TEXT NOT NULL DEFAULT 'discovered'
                         CHECK (outreach_status IN (
                           'discovered', 'qualified', 'demo-generated', 'emailed',
                           'opened', 'clicked', 'signed-up', 'converted', 'opted-out'
                         )),
  email_sent_at        TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_prospects_demo_slug       ON prospects (demo_slug) WHERE demo_slug IS NOT NULL;
CREATE INDEX        idx_prospects_outreach_status  ON prospects (outreach_status);

-- ============================================================
-- 7. blog_posts — linked to practices
-- ============================================================
CREATE TABLE blog_posts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id      UUID NOT NULL REFERENCES practices (id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL,
  content          TEXT NOT NULL DEFAULT '',
  meta_description TEXT,
  status           TEXT NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft', 'published', 'archived')),
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX  idx_blog_posts_practice_id ON blog_posts (practice_id);
CREATE UNIQUE INDEX idx_blog_posts_slug  ON blog_posts (practice_id, slug);

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_practices_updated_at
  BEFORE UPDATE ON practices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE practices  ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE services   ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews    ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects  ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------
-- practices: authenticated users can read all, but only
-- modify rows they own (via a future user-practice mapping).
-- For now, authenticated users have full access.
-- The service_role key bypasses RLS entirely.
-- ---------------------------------------------------------

-- Public read for live practices (used by the rendered sites)
CREATE POLICY "Public can read live practices"
  ON practices FOR SELECT
  USING (status = 'live');

-- Authenticated users can do everything (admin dashboard)
CREATE POLICY "Authenticated users full access to practices"
  ON practices FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ---------------------------------------------------------
-- Child tables: public read when parent practice is live,
-- authenticated users get full access.
-- ---------------------------------------------------------

-- providers
CREATE POLICY "Public can read providers of live practices"
  ON providers FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM practices WHERE practices.id = providers.practice_id AND practices.status = 'live'
  ));

CREATE POLICY "Authenticated users full access to providers"
  ON providers FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- services
CREATE POLICY "Public can read services of live practices"
  ON services FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM practices WHERE practices.id = services.practice_id AND practices.status = 'live'
  ));

CREATE POLICY "Authenticated users full access to services"
  ON services FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- locations
CREATE POLICY "Public can read locations of live practices"
  ON locations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM practices WHERE practices.id = locations.practice_id AND practices.status = 'live'
  ));

CREATE POLICY "Authenticated users full access to locations"
  ON locations FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- reviews
CREATE POLICY "Public can read reviews of live practices"
  ON reviews FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM practices WHERE practices.id = reviews.practice_id AND practices.status = 'live'
  ));

CREATE POLICY "Authenticated users full access to reviews"
  ON reviews FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- blog_posts
CREATE POLICY "Public can read published posts of live practices"
  ON blog_posts FOR SELECT
  USING (
    status = 'published'
    AND EXISTS (
      SELECT 1 FROM practices WHERE practices.id = blog_posts.practice_id AND practices.status = 'live'
    )
  );

CREATE POLICY "Authenticated users full access to blog_posts"
  ON blog_posts FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- prospects (admin-only, no public access)
CREATE POLICY "Authenticated users full access to prospects"
  ON prospects FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
