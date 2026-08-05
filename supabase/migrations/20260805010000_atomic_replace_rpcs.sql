-- ============================================================
-- Atomic replace RPCs (2026-08-05 batch two)
-- ============================================================
-- The dashboard "save" endpoints previously deleted all rows for a
-- practice and re-inserted from the client payload as two separate
-- statements — a failed insert lost the practice's data. Each function
-- below runs delete + insert in a single transaction. Called via the
-- service role only (RLS is default-deny for other roles).
-- ============================================================

CREATE OR REPLACE FUNCTION replace_providers(p_practice_id uuid, p_rows jsonb)
RETURNS SETOF providers
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  DELETE FROM providers WHERE practice_id = p_practice_id;

  INSERT INTO providers (
    practice_id, first_name, last_name, credentials, title, bio,
    photo_url, education, board_certifications, languages, display_order
  )
  SELECT
    p_practice_id,
    coalesce(r->>'first_name', ''),
    coalesce(r->>'last_name', ''),
    coalesce(r->>'credentials', ''),
    r->>'title',
    coalesce(r->>'bio', ''),
    r->>'photo_url',
    coalesce(r->'education', '[]'::jsonb),
    coalesce(r->'board_certifications', '[]'::jsonb),
    coalesce(
      (SELECT array_agg(x) FROM jsonb_array_elements_text(r->'languages') AS x),
      '{}'::text[]
    ),
    (idx - 1)::int
  FROM jsonb_array_elements(p_rows) WITH ORDINALITY AS t(r, idx);

  RETURN QUERY
    SELECT * FROM providers
    WHERE practice_id = p_practice_id
    ORDER BY display_order;
END;
$$;

CREATE OR REPLACE FUNCTION replace_services(p_practice_id uuid, p_rows jsonb)
RETURNS SETOF services
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  DELETE FROM services WHERE practice_id = p_practice_id;

  INSERT INTO services (
    practice_id, title, description, icon, featured, link_url, display_order
  )
  SELECT
    p_practice_id,
    coalesce(r->>'title', ''),
    coalesce(r->>'description', ''),
    r->>'icon',
    coalesce((r->>'featured')::boolean, false),
    r->>'link_url',
    (idx - 1)::int
  FROM jsonb_array_elements(p_rows) WITH ORDINALITY AS t(r, idx);

  RETURN QUERY
    SELECT * FROM services
    WHERE practice_id = p_practice_id
    ORDER BY display_order;
END;
$$;

CREATE OR REPLACE FUNCTION replace_reviews(p_practice_id uuid, p_rows jsonb)
RETURNS SETOF reviews
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  DELETE FROM reviews WHERE practice_id = p_practice_id;

  INSERT INTO reviews (
    practice_id, author_name, rating, text, review_date, source
  )
  SELECT
    p_practice_id,
    coalesce(r->>'author_name', ''),
    coalesce((r->>'rating')::int, 5),
    coalesce(r->>'text', ''),
    NULLIF(r->>'review_date', '')::date,
    coalesce(r->>'source', 'manual')
  FROM jsonb_array_elements(p_rows) AS t(r);

  RETURN QUERY
    SELECT * FROM reviews
    WHERE practice_id = p_practice_id
    ORDER BY review_date DESC NULLS LAST;
END;
$$;
