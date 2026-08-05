# Batch Two: Reliability & Rendering Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the data-loss risk in dashboard saves, the wrong-information rendering bugs on generated sites (office hours, star ratings, provider prefixes), the crash on empty providers/locations, silent dashboard failures, and the discarded onboarding uploads.

**Architecture:** Pure display logic moves into unit-tested helpers (`src/lib/site-format.ts`). Dashboard bulk saves move from client-orchestrated delete-then-insert to atomic Postgres RPCs. Wizard file uploads go through a new admin-gated API route into a Supabase Storage bucket.

**Tech Stack:** Existing stack + Supabase Storage, plpgsql RPCs.

## Global Constraints

- Branch `fix/batch-two` (created off merged `main`; commit `1d9f842` holds the user's pre-existing WIP — do not touch its content).
- One commit per task; stage only files the task touches.
- Verify each task with `npx vitest run`; end with `npm run build`.
- DB migrations are written to `supabase/migrations/` AND applied to live project `cwbhzwiyorptebqgkhxf` (additive DDL only — user authorized batch two including its infrastructure).

---

### Task 1: `site-format.ts` helpers (hours, stars, provider names, initials)

**Files:**
- Create: `src/lib/site-format.ts`
- Test: `src/lib/__tests__/site-format.test.ts`

**Interfaces (produced):**
- `formatOfficeHours(hours: OfficeHours): string[]` — groups consecutive days with identical values ("Mon–Thu: 8am–5pm", "Fri: 8am–12pm"); omitted/empty days render "Closed"; returns `[]` if no day is set.
- `starString(avgRating: number): string` — `Math.round`-filled stars, e.g. 4 → "★★★★☆".
- `providerDisplayName(p: {firstName, lastName, credentials}): string` — "Dr. Jane Smith" only for physician credentials (MD/DO/etc.), otherwise "Jane Smith, NP".
- `initials(first?: string, last?: string): string` — safe on empty strings.
- `formatReviewDate(iso: string): string` — parses YYYY-MM-DD as a local date (no UTC day-shift).

- [ ] Write failing tests covering: grouping (uniform week, split days, closed gaps), star rounding (3.8→4 filled, 5, 0), NP vs MD prefix, empty-name initials, date "2026-02-01" renders February 1.
- [ ] Implement; run to green.
- [ ] Commit: `feat: add tested site formatting helpers`

### Task 2: Wire helpers into generated-site components

**Files:** Modify `SiteContact.tsx` (hours block), `SiteReviews.tsx` (stars at ~line 52, date at ~line 82, author initial), `SiteProviders.tsx` (initials, display name), `SiteAbout.tsx` (display name + remove dead ternary at line 15).

- [ ] Replace hardcoded Mon–Thu block with `formatOfficeHours(location.hours).map(...)`.
- [ ] Replace `★★★★★` literal with `starString(avgRating)`; use `formatReviewDate`; guard initials.
- [ ] Replace hardcoded "Dr." with `providerDisplayName`.
- [ ] Commit: `fix: render office hours, star ratings, and provider names from data`

### Task 3: GeneratedSite guards for empty providers/locations

**Files:** Modify `GeneratedSite.tsx`, `src/app/demo/[slug]/page.tsx` (verify it can pass configs through unchanged).

- [ ] Make `primaryProvider`/`primaryLocation` possibly-undefined; conditionally render SiteAbout/SiteProviders/SiteContact sections that require them; site header/hero/services/footer still render.
- [ ] Commit: `fix: render generated sites without crashing when providers or locations are empty`

### Task 4: Atomic bulk saves via RPC

**Files:**
- Create: `supabase/migrations/20260805010000_atomic_replace_rpcs.sql` (functions `replace_providers(p_practice_id uuid, p_rows jsonb)`, `replace_services(...)`, `replace_reviews(...)` — DELETE + INSERT + RETURN QUERY inside one function = one transaction).
- Modify: `src/app/api/dashboard/providers/route.ts`, `services/route.ts`, `reviews/route.ts` to call `supabase.rpc(...)` instead of delete-then-insert.

- [ ] Write migration (full SQL in-file), apply to live project via Supabase connector, commit.
- [ ] Rewrite the three routes; typecheck; commit: `fix: make dashboard bulk saves atomic via Postgres RPCs`

### Task 5: RequestsTab error handling

**Files:** Modify `src/app/dashboard/page.tsx` (RequestsTab: fetch effect ~line 675, `updateStatus` ~line 688).

- [ ] fetch: try/catch/finally with an error state rendered inline (distinct from "no requests yet").
- [ ] updateStatus: check `res.ok`; on failure revert the optimistic change and surface the error.
- [ ] Commit: `fix: surface appointment-request fetch/update failures in dashboard`

### Task 6: Wizard uploads (storage bucket + upload route + wiring)

**Files:**
- Create: `src/app/api/upload/route.ts` (POST multipart; `requireAdmin`; validates type image/png|jpeg|webp|svg and size ≤ 5MB; uploads to bucket `branding` at `uploads/<uuid>.<ext>`; returns `{ url }`).
- Modify: `src/components/onboarding/OnboardingWizard.tsx` — before calling `/api/generate`, upload `logoFile`/`heroFile` and set `branding.logoUrl`/`branding.heroImageUrl`.
- Live: create public `branding` bucket.

- [ ] Create bucket on live (additive); implement route; wire wizard; typecheck; commit: `feat: upload wizard logo/hero images to storage instead of discarding them`

### Task 7: Final verification

- [ ] `npx vitest run` green; `npm run build` clean; `git log --oneline main..HEAD` one commit per task + WIP commit.
