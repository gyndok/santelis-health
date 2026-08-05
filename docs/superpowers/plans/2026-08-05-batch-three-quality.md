# Batch Three: UX, Accessibility & Service-Layer Quality Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the dashboard stale-state bug, close the accessibility gaps, dedupe the specialty lists, and harden the prospect-pipeline and AI/payment service modules.

**Architecture:** Dashboard tabs get remounted on data refresh via a version key. Specialty data derives from `specialtyConfigs` everywhere. Pipeline fixes are pure-logic changes with unit tests where extractable. `anthropic.ts`/`stripe.ts` move to lazy initialization matching `supabase-admin.ts`.

## Global Constraints

- Branch `fix/batch-three` off `main`; one commit per task; stage only task files.
- Verify with `npx vitest run` per task; end with `npm run build`.
- No live-DB changes in this batch.
- Read the `claude-api` skill before editing `src/lib/anthropic.ts` (Task 5).

---

### Task 1: Dashboard — tab state resync + specialty select from config
**Files:** `src/app/dashboard/page.tsx`
- [ ] Add `const [dataVersion, setDataVersion] = useState(0)`; increment in `fetchData` after state updates; wrap the tab-content container with `key={dataVersion}` so tabs remount with fresh server data after every save/refetch.
- [ ] Replace the hardcoded specialty slug array (line ~295) with `Object.entries(specialtyConfigs)` options (value = slug, label = config label) plus a disabled placeholder option for `""`.
- [ ] Commit: `fix: remount dashboard tabs on data refresh, derive specialty options from config`

### Task 2: Landing page — mobile nav + derived specialties
**Files:** `src/app/page.tsx`
- [ ] Add a mobile hamburger (client component state) with `aria-expanded`/`aria-controls`, rendering the same Features/Specialties/Pricing/Get Started links below the header on small screens.
- [ ] Derive the chip list from `Object.values(specialtyConfigs).map((c) => c.label)` and the "Specialties Supported" stat from `Object.keys(specialtyConfigs).length`.
- [ ] Commit: `fix: add mobile navigation and derive specialty content from config`

### Task 3: Accessibility fixes
**Files:** `src/components/generated-site/SiteAppointmentForm.tsx`, `SiteHeader.tsx`, `src/app/dashboard/page.tsx` (toast), `src/app/admin/prospects/page.tsx`
- [ ] Associate every label/input via `htmlFor`/`id`; add `role="alert"` (or `aria-live="polite"`) to the form error and success messages.
- [ ] SiteHeader hamburger: `aria-expanded`, `aria-controls`, `aria-label`.
- [ ] Dashboard save toast: `role="status"`.
- [ ] Admin prospects: row expansion moves to a `<button>` with `aria-expanded` (keyboard accessible); `fetchProspects`/`fetchStatusCounts` get try/catch + `res.ok` checks with an inline error state.
- [ ] Commit: `fix: accessibility for forms, nav toggles, and admin table; handle admin fetch errors`

### Task 4: Prospect pipeline hardening
**Files:** `src/services/prospect-pipeline.ts`, `src/services/prospect-scraper.ts`, `src/services/prospect-scorer.ts`
- Test: `src/lib/__tests__/prospect-utils.test.ts` for extracted pure helpers in `src/services/prospect-utils.ts` (`normalizeUrl`, `pickContactEmail`).
- [ ] Replace the `.or()` interpolated-filter dedup with two separate `.eq()` queries (comma/paren-safe); check the final update's `error`.
- [ ] `pickContactEmail(markdown, html, siteUrl)`: prefer `mailto:` links, reject image-extension matches (`logo@2x.png`), prefer addresses on the site's own domain.
- [ ] PageSpeed: `AbortSignal.timeout(60_000)`, optional `PAGESPEED_API_KEY`, throw when `lighthouseResult.categories.performance.score` is absent instead of scoring 0.
- [ ] `scrapeUrl`: validate/normalize the URL up front (`normalizeUrl` lowercases host, strips trailing slash, rejects invalid) and dedupe on the normalized form.
- [ ] Commit: `fix: harden prospect pipeline dedup, email extraction, and PageSpeed scoring`

### Task 5: Service module hygiene (read claude-api skill first)
**Files:** `src/lib/anthropic.ts`, `src/lib/stripe.ts`; Delete: `src/lib/supabase.ts` (no importers)
- [ ] Lazy `getAnthropic()` / `getStripe()` mirroring `supabase-admin.ts`; no module-scope client construction.
- [ ] `generateBlogPost`: strip markdown code fences before `JSON.parse`, check `stop_reason === "max_tokens"` and throw a clear error, raise `max_tokens`, find the text block instead of `content[0]` (same fix in `generateBio`/`generateMetaDescription`).
- [ ] `git rm src/lib/supabase.ts`; verify no imports break.
- [ ] Commit: `fix: lazy-init AI/payment clients, harden blog JSON parsing, drop legacy supabase client`

### Task 6: Final verification
- [ ] `npx vitest run` green; `npm run build` clean; one commit per task.
