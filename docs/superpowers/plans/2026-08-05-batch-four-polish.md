# Batch Four: Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clear the remaining review findings: fragile hex-alpha color math, JS hover handlers (sticky hover on touch), the divergent Prospect types, dead/broken review-link props, missing wizard validation, stock README, and no CI.

**Architecture:** Color math moves to a validated `withAlpha()` helper. Hover states move to CSS classes in `globals.css` driven by the `--site-*` CSS variables GeneratedSite already sets. A GitHub Actions workflow gates lint + typecheck + tests + build (which requires fixing the one pre-existing lint error).

## Global Constraints

- Branch `fix/batch-four` off `main`; one commit per task; stage only task files.
- Verify per task with `npx vitest run` + `npx tsc --noEmit`; end with `npm run build` and `npm run lint` (must be fully clean — CI will enforce it).
- No live-DB changes in this batch.

---

### Task 1: `withAlpha()` helper + replace hex-alpha concatenations
**Files:** Create `src/lib/color.ts` + `src/lib/__tests__/color.test.ts`; modify the generated-site components using `${color}XX` (SiteAbout, SiteCommunity, SiteContact, SiteProviders, SiteReviews, SiteServices).
- [ ] TDD `withAlpha(hex: string, alpha: number): string` — accepts `#rrggbb` and `#rgb` (expands), clamps alpha 0–1, returns `rgba(r,g,b,a)`; returns the input unchanged for non-hex values (rgb()/var()/named) so bad data degrades gracefully.
- [ ] Replace every `` `${color}4d` ``-style concatenation with `withAlpha(color, 0.3)` etc. (4d≈0.3, 33=0.2, 26=0.15, 1a=0.1, 80=0.5).
- [ ] Commit: `fix: validated withAlpha helper replaces fragile hex-alpha concatenation`

### Task 2: Hover handlers → CSS
**Files:** `src/app/globals.css`, and the components with `onMouseEnter`/`onMouseLeave` (SiteHeader, SiteHero, SiteContact, SiteCommunity, SiteProviders, SiteReviews).
- [ ] Add `.site-*` classes in globals.css using `var(--site-primary)` etc. with `@media (hover: hover)` so touch devices never get sticky hover; keep non-var dynamic values (e.g. computed shadows) as CSS custom properties set inline where needed.
- [ ] Delete the JS handlers; apply the classes.
- [ ] Commit: `fix: move hover states to CSS, eliminating sticky hover on touch devices`

### Task 3: Review links + icon consistency
**Files:** `GeneratedSite.tsx`, `SiteReviews.tsx`, `src/app/demo/[slug]/page.tsx`, `src/config/specialties.ts`.
- [ ] Pass `googleReviewUrl={integrations.googleReviewUrl}` (check the Integrations type; add the field if missing) so the prop is no longer dead; remove the truncated-looking mock `googleBusinessProfileId` from the demo config (or replace with a full valid place ID if one exists in the WIP content).
- [ ] Add lucide `iconName` values to `defaultServices` in specialties.ts so wizard-generated sites match demo sites (map emoji → nearest lucide name from the set in get-practice.ts).
- [ ] Commit: `fix: wire review link prop, drop broken mock place id, use lucide icons for default services`

### Task 4: Unify Prospect types
**Files:** `src/types/index.ts`, `src/app/admin/prospects/page.tsx`.
- [ ] Replace the camelCase `Prospect` in types/index.ts with the snake_case DB row shape (matching schema.sql `prospects`), named `Prospect`; delete the local interface in the admin page and import it. Update any other references (`grep -rn "Prospect" src`).
- [ ] Commit: `refactor: single snake_case Prospect type matching the DB row`

### Task 5: Wizard validation + featured-service fix
**Files:** `src/components/onboarding/OnboardingWizard.tsx`.
- [ ] Add per-step validation: step gating on required fields (practice name + specialty; provider first/last name; phone/city/state on location step) — disable Continue with an inline hint until valid.
- [ ] Fix the featured-services dead branch: render the "Feature" toggle for custom services too (indices `form.services.length + i`), matching what `buildSummary` already computes.
- [ ] Commit: `fix: wizard step validation and featured toggle for custom services`

### Task 6: README, CI, lint-clean
**Files:** `README.md`, create `.github/workflows/ci.yml`, fix `src/app/onboard/page.tsx` lint error (a → Link).
- [ ] Rewrite README: what the app is, stack, env vars table, local dev, supabase migrations note, test/build commands.
- [ ] CI workflow: on push/PR to main — npm ci, lint, `tsc --noEmit`, vitest, build (with dummy `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` env so build succeeds).
- [ ] Fix the `<a href="/">` → `<Link>` lint error in onboard/page.tsx so `npm run lint` exits 0.
- [ ] Commit: `chore: real README, CI workflow, lint-clean`

### Task 7: Final verification
- [ ] `npx vitest run` green; `npm run build` clean; `npm run lint` exits 0; one commit per task.
