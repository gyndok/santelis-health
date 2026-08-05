# Santelis Health

A website-generation platform for medical practices. Practices get a fast, SEO-tuned marketing site (providers, services, reviews, appointment requests) generated from structured data, plus a dashboard to manage their content. An admin pipeline discovers prospective practices via Google Places, scrapes and scores their existing websites, and generates demo sites for outreach.

## Stack

- **Next.js 16** (App Router) + React 19 + Tailwind CSS 4
- **Supabase** — Postgres, auth (Google OAuth / magic link), storage
- **Resend** — appointment-request email notifications
- **Stripe** — subscription billing (not yet live; onboarding shows "coming soon")
- **Anthropic API** — content generation (bios, meta descriptions, blog posts)
- **Firecrawl + Google Places + PageSpeed** — prospect discovery pipeline
- **Vitest** — unit tests for pure helpers

## Architecture notes

- **All data access flows through server-side API routes using the Supabase service-role key.** Row Level Security is default-deny (zero policies); client-side Supabase is used for auth only. If you ever add client-side table reads, write narrowly-scoped policies first — see `supabase/schema.sql`.
- Admin-only routes (`/admin/*`, prospect + generate APIs) are gated by `requireAdmin()` against the `ADMIN_EMAILS` allowlist and **fail closed** when it is unset.
- Practice-owner dashboard routes resolve the practice by the authenticated user's email (`owner_email`).
- Dashboard bulk saves (providers/services/reviews) use atomic Postgres RPCs (`replace_*` in `supabase/migrations/`).

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Public anon key (auth only) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Server-side data access (never expose to the client) |
| `ADMIN_EMAILS` | ✅ | Comma-separated admin allowlist; admin surfaces fail closed without it |
| `RESEND_API_KEY` | for email | Appointment-request notifications |
| `GOOGLE_MAPS_API_KEY` | for prospecting | Google Places discovery |
| `FIRECRAWL_API_KEY` | for prospecting | Website scraping |
| `PAGESPEED_API_KEY` | optional | Raises PageSpeed API rate limits |
| `ANTHROPIC_API_KEY` | for AI content | Bio/meta/blog generation |
| `STRIPE_SECRET_KEY` + `STRIPE_*_PRICE_ID` | for billing | Not yet wired into the UI |

Copy `.env.example` to `.env.local` and fill in values.

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm test           # vitest unit tests
npm run lint       # eslint
npx tsc --noEmit   # typecheck
npm run build      # production build
```

## Database

`supabase/schema.sql` creates the full schema for a fresh project. Incremental changes live in `supabase/migrations/` and are applied to the live project via the Supabase MCP connector or `supabase db push`.

## Key routes

| Route | What it is |
|---|---|
| `/` | Marketing landing page |
| `/demo/[slug]` | Generated practice site (DB-backed, mock fallback) |
| `/onboard` | Practice onboarding wizard (currently "coming soon") |
| `/dashboard` | Practice-owner content dashboard |
| `/admin/prospects` | Prospect discovery/scraping/demo pipeline (admin) |
| `/admin/practices` | All practices overview (admin) |
