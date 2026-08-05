# Security & Correctness Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the critical security holes (RLS, unauthenticated API routes, open redirect, email injection) and the broken-feature bugs (column mismatch, silent signup) found in the 2026-08-05 repo review.

**Architecture:** All data access already flows through server-side API routes using the Supabase service-role client; client-side Supabase is auth-only. So the strategy is: lock RLS down to default-deny, gate the admin-only API routes with a shared `requireAdmin()` helper, and harden the small pure surfaces (redirect validation, HTML escaping) with unit-tested helpers.

**Tech Stack:** Next.js 16 App Router, Supabase (`@supabase/ssr`), zod v4, Vitest (new devDependency).

## Global Constraints

- Work on branch `fix/security-review` off `main`.
- The working tree contains unrelated WIP edits (generated-site components, types). **Never `git add -A` / `git add .`** — stage only the exact files each task touches.
- Demo sites render practices with `status = 'preview'`; any status filter must allow `preview` and `live`, only exclude `draft`.
- All routes keep the existing error-shape convention: `NextResponse.json({ error }, { status })`, `"Unauthorized"` → 401.
- Verify each task with `npx vitest run` (once harness exists) and finish the plan with `npm run build`.
- Applying the RLS migration to the live Supabase project is NOT part of this plan — it requires explicit user sign-off (Task 10 only writes the SQL).

---

### Task 1: Vitest harness + pure helpers (`escapeHtml`, `safeRedirectPath`)

**Files:**
- Create: `src/lib/escape-html.ts`, `src/lib/safe-redirect.ts`
- Test: `src/lib/__tests__/escape-html.test.ts`, `src/lib/__tests__/safe-redirect.test.ts`
- Modify: `package.json` (add `vitest` devDep + `"test": "vitest run"` script)

**Interfaces:**
- Produces: `escapeHtml(input: string): string`; `safeRedirectPath(raw: string | null, fallback: string): string`

- [ ] **Step 1: Create branch and install vitest**

```bash
git checkout -b fix/security-review
npm install -D vitest
```

Add to `package.json` scripts: `"test": "vitest run"`.

- [ ] **Step 2: Write failing tests**

```ts
// src/lib/__tests__/escape-html.test.ts
import { describe, it, expect } from "vitest";
import { escapeHtml } from "../escape-html";

describe("escapeHtml", () => {
  it("escapes the five HTML special characters", () => {
    expect(escapeHtml(`<img src=x onerror="alert('1')" & more>`)).toBe(
      "&lt;img src=x onerror=&quot;alert(&#39;1&#39;)&quot; &amp; more&gt;",
    );
  });
  it("passes plain text through", () => {
    expect(escapeHtml("Jane Doe")).toBe("Jane Doe");
  });
});
```

```ts
// src/lib/__tests__/safe-redirect.test.ts
import { describe, it, expect } from "vitest";
import { safeRedirectPath } from "../safe-redirect";

describe("safeRedirectPath", () => {
  it("accepts a normal relative path", () => {
    expect(safeRedirectPath("/dashboard", "/x")).toBe("/dashboard");
  });
  it("rejects protocol-relative URLs", () => {
    expect(safeRedirectPath("//evil.com", "/x")).toBe("/x");
  });
  it("rejects userinfo-trick values", () => {
    expect(safeRedirectPath("@evil.com", "/x")).toBe("/x");
  });
  it("rejects backslash smuggling", () => {
    expect(safeRedirectPath("/\\evil.com", "/x")).toBe("/x");
  });
  it("rejects null/empty", () => {
    expect(safeRedirectPath(null, "/x")).toBe("/x");
    expect(safeRedirectPath("", "/x")).toBe("/x");
  });
});
```

- [ ] **Step 3: Run tests, verify they fail** — `npx vitest run` → FAIL (modules not found).

- [ ] **Step 4: Implement**

```ts
// src/lib/escape-html.ts
/** Escape a string for safe interpolation into HTML (email bodies, etc.). */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
```

```ts
// src/lib/safe-redirect.ts
/**
 * Validate a user-supplied redirect target. Only same-origin absolute
 * paths are allowed; anything else returns the fallback.
 */
export function safeRedirectPath(raw: string | null, fallback: string): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) {
    return fallback;
  }
  return raw;
}
```

- [ ] **Step 5: Run tests, verify pass** — `npx vitest run` → all PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/lib/escape-html.ts src/lib/safe-redirect.ts src/lib/__tests__
git commit -m "feat: add vitest harness with escapeHtml and safeRedirectPath helpers"
```

---

### Task 2: Shared admin auth helper

**Files:**
- Create: `src/lib/admin-auth.ts`
- Test: `src/lib/__tests__/admin-auth.test.ts`

**Interfaces:**
- Produces: `parseAdminEmails(raw: string | undefined): string[]`; `isAdminEmail(email: string | null | undefined, adminEmails: string[]): boolean`; `requireAdmin(request: NextRequest): Promise<string>` (returns admin email, throws `Error("Unauthorized")` otherwise — including when `ADMIN_EMAILS` is unset: fail closed).

- [ ] **Step 1: Write failing tests for the pure parts**

```ts
// src/lib/__tests__/admin-auth.test.ts
import { describe, it, expect } from "vitest";
import { parseAdminEmails, isAdminEmail } from "../admin-auth";

describe("parseAdminEmails", () => {
  it("splits, trims, lowercases, drops empties", () => {
    expect(parseAdminEmails(" A@x.com, b@Y.com ,,")).toEqual(["a@x.com", "b@y.com"]);
  });
  it("returns [] for undefined", () => {
    expect(parseAdminEmails(undefined)).toEqual([]);
  });
});

describe("isAdminEmail", () => {
  it("matches case-insensitively", () => {
    expect(isAdminEmail("A@X.com", ["a@x.com"])).toBe(true);
  });
  it("fails closed on empty allowlist", () => {
    expect(isAdminEmail("a@x.com", [])).toBe(false);
  });
  it("rejects null email", () => {
    expect(isAdminEmail(null, ["a@x.com"])).toBe(false);
  });
});
```

- [ ] **Step 2: Run, verify FAIL.**

- [ ] **Step 3: Implement**

```ts
// src/lib/admin-auth.ts
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
```

- [ ] **Step 4: Run tests, verify PASS.**

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin-auth.ts src/lib/__tests__/admin-auth.test.ts
git commit -m "feat: add shared requireAdmin helper with fail-closed allowlist"
```

---

### Task 3: Gate the unauthenticated admin-only API routes

**Files:**
- Modify: `src/app/api/prospects/route.ts`, `src/app/api/prospects/discover/route.ts`, `src/app/api/prospects/scrape/route.ts`, `src/app/api/prospects/[id]/generate-demo/route.ts`, `src/app/api/generate/route.ts`

**Interfaces:**
- Consumes: `requireAdmin(request)` from Task 2.

- [ ] **Step 1: Add the gate to each route.** At the top of every exported handler (before any DB/service work) add:

```ts
import { requireAdmin } from "@/lib/admin-auth";
// inside the try block, first line:
await requireAdmin(request);
```

And in each route's catch block, map the error (before the generic 500 handling):

```ts
if (err instanceof Error && err.message === "Unauthorized") {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

Special case — `generate-demo/route.ts` calls `/api/generate` via internal `fetch`, which would now 401 (no cookies forwarded). Forward the caller's cookies:

```ts
const generateResponse = await fetch(
  new URL("/api/generate", request.url).toString(),
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: request.headers.get("cookie") ?? "",
    },
    body: JSON.stringify(practiceConfig),
  },
);
```

- [ ] **Step 2: Whitelist `sortBy` in `src/app/api/prospects/route.ts`** (replace lines 12-13):

```ts
const SORTABLE_COLUMNS = new Set([
  "qualification_score",
  "created_at",
  "practice_name",
  "city",
  "outreach_status",
]);
const sortByParam = searchParams.get("sortBy") || "qualification_score";
const sortBy = SORTABLE_COLUMNS.has(sortByParam) ? sortByParam : "qualification_score";
const sortOrder = searchParams.get("sortOrder") || "desc";
```

- [ ] **Step 3: Verify** — `npx tsc --noEmit` clean; `npx vitest run` still green.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/prospects src/app/api/generate/route.ts
git commit -m "fix(security): require admin auth on prospect and generate API routes"
```

---

### Task 4: Fix `/api/admin/practices` column bug, delete dead password login route

**Files:**
- Modify: `src/app/api/admin/practices/route.ts`
- Delete: `src/app/api/admin/login/route.ts`

- [ ] **Step 1: Refactor practices route** — replace the inline auth block (lines 7-32) with `await requireAdmin(request)` (+ the 401 catch mapping), and fix the select (the table column is `name`, not `practice_name`; alias keeps the page's expected response shape):

```ts
const { data, error } = await supabase
  .from("practices")
  .select("id, practice_name:name, subdomain, specialty, status, plan, owner_email, created_at")
  .order("created_at", { ascending: false });
```

- [ ] **Step 2: Delete the dead route that stores the plaintext admin password in a cookie** (nothing reads `admin_auth`; admin login is Supabase OAuth):

```bash
git rm src/app/api/admin/login/route.ts
```

Check nothing references it: `grep -rn "api/admin/login" src/` → expect no hits.

- [ ] **Step 3: Verify** — `npx tsc --noEmit` clean.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/practices/route.ts
git commit -m "fix: correct practices column select, remove plaintext-password login route"
```

---

### Task 5: Harden middleware (fail-closed admin gate, case-insensitive)

**Files:**
- Modify: `src/middleware.ts:61-69`

- [ ] **Step 1: Replace the admin check** with the shared helpers (edge-safe: pure string logic only):

```ts
import { parseAdminEmails, isAdminEmail } from "@/lib/admin-auth";

// Admin routes: restrict to ADMIN_EMAILS (fail closed if unset)
if (isAdmin) {
  const adminEmails = parseAdminEmails(process.env.ADMIN_EMAILS);
  if (!isAdminEmail(user.email, adminEmails)) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(loginUrl);
  }
}
```

Note: only import the pure functions, not `requireAdmin` (which pulls `@supabase/ssr` — already used by middleware, but keep the import list to the two pure helpers).

- [ ] **Step 2: Verify** — `npx tsc --noEmit`; `npm run build` compiles middleware without edge-runtime warnings.

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "fix(security): fail closed and compare case-insensitively in admin middleware"
```

---

### Task 6: Fix open redirect + wrong error page in OAuth callback

**Files:**
- Modify: `src/app/auth/callback/route.ts`

- [ ] **Step 1: Apply**

```ts
import { safeRedirectPath } from "@/lib/safe-redirect";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"), "/admin/prospects");
  const errorLogin = next.startsWith("/dashboard") ? "/dashboard/login" : "/admin/login";

  if (code) {
    const response = NextResponse.redirect(`${origin}${next}`);
    // ... (existing supabase client + exchangeCodeForSession unchanged)
    if (!error) {
      return response;
    }
  }

  return NextResponse.redirect(`${origin}${errorLogin}?error=auth_failed`);
}
```

- [ ] **Step 2: Verify** — `npx tsc --noEmit` clean; `npx vitest run` green.

- [ ] **Step 3: Commit**

```bash
git add src/app/auth/callback/route.ts
git commit -m "fix(security): validate next param in OAuth callback, route errors to correct login"
```

---

### Task 7: Appointments route — zod validation, HTML escaping, column fix

**Files:**
- Modify: `src/app/api/appointments/route.ts`

- [ ] **Step 1: Add a zod schema** (zod v4 syntax) at module scope:

```ts
import { z } from "zod";
import { escapeHtml } from "@/lib/escape-html";

const AppointmentRequestSchema = z.object({
  practiceId: z.uuid(),
  patientName: z.string().trim().min(1).max(200),
  email: z.email().max(320),
  phone: z.string().max(50).nullish(),
  preferredDate: z.string().max(30).nullish(),
  preferredTime: z.string().max(50).nullish(),
  reason: z.string().max(2000).nullish(),
});
```

Replace the manual destructure/validation (lines 31-40) with:

```ts
const parsed = AppointmentRequestSchema.safeParse(await request.json());
if (!parsed.success) {
  return NextResponse.json(
    { error: "Invalid request", details: parsed.error.issues.map((i) => i.message) },
    { status: 400 },
  );
}
const { practiceId, patientName, email, phone, preferredDate, preferredTime, reason } = parsed.data;
```

- [ ] **Step 2: Fix the practices select** (column is `name`, not `practice_name`):

```ts
const { data: practice } = await supabase
  .from("practices")
  .select("name, owner_email")
  .eq("id", practiceId)
  .single();
```

…and use `practice?.name` in the email body.

- [ ] **Step 3: Escape every user value in the email HTML.** Compute once above the template:

```ts
const safe = {
  patientName: escapeHtml(patientName),
  email: escapeHtml(email),
  phone: phone ? escapeHtml(phone) : null,
  preferredDate: preferredDate ? escapeHtml(preferredDate) : null,
  preferredTime: preferredTime ? escapeHtml(preferredTime) : null,
  reason: reason ? escapeHtml(reason) : null,
  practiceName: escapeHtml(practice?.name ?? "your practice"),
};
```

and swap all `${...}` interpolations in the HTML (including the subject line's `${patientName}` — keep the subject as plain text, unescaped, since it is not HTML).

- [ ] **Step 4: Verify** — `npx tsc --noEmit` clean.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/appointments/route.ts
git commit -m "fix(security): validate appointment payload with zod, escape email HTML, fix name column"
```

---

### Task 8: Case-insensitive practice ownership lookup

**Files:**
- Modify: `src/lib/dashboard-auth.ts:59-64`

- [ ] **Step 1: Replace `.eq` with `.ilike`** (exact-match case-insensitive; no wildcards in the pattern since emails contain no `%`/`_` metacharacters we need — but escape them defensively):

```ts
const { data: practice, error } = await admin
  .from("practices")
  .select("id")
  .ilike("owner_email", userEmail.replace(/([%_\\])/g, "\\$1"))
  .limit(1)
  .maybeSingle();
```

- [ ] **Step 2: Verify** — `npx tsc --noEmit` clean.

- [ ] **Step 3: Commit**

```bash
git add src/lib/dashboard-auth.ts
git commit -m "fix: match practice owner_email case-insensitively"
```

---

### Task 9: Harden public practice fetch (`get-practice.ts`)

**Files:**
- Modify: `src/lib/get-practice.ts`

- [ ] **Step 1: Explicit columns + status filter** (demo sites use `preview`, so allow `preview` and `live`; exclude only `draft`):

```ts
const { data: practice, error: practiceError } = await supabase
  .from("practices")
  .select(
    "id, name, specialty, sub_specialties, subdomain, domain, plan, status, branding, seo_config, integrations, insurances_accepted, created_at, updated_at",
  )
  .eq("subdomain", slug)
  .in("status", ["preview", "live"])
  .single();
```

- [ ] **Step 2: Drop `stripeCustomerId` from the returned config** (delete line 163) — it must never reach page props.

- [ ] **Step 3: Log in the catch block** instead of swallowing:

```ts
} catch (err) {
  console.error(`getPracticeBySlug(${slug}) failed:`, err);
  return null;
}
```

- [ ] **Step 4: Verify** — `npx tsc --noEmit` clean (note: `get-practice.ts` has unrelated WIP edits in the working tree; edit around them, do not revert them).

- [ ] **Step 5: Commit**

```bash
git add src/lib/get-practice.ts
git commit -m "fix(security): select explicit columns, exclude drafts, stop exposing stripe id"
```

---

### Task 10: RLS lockdown migration

**Files:**
- Create: `supabase/migrations/20260805000000_lock_down_rls.sql`
- Modify: `supabase/schema.sql` (policy section, lines ~200-314, and the `appointment_requests` FK)

- [ ] **Step 1: Write the migration** (all app data access goes through the service role, which bypasses RLS; client-side Supabase is auth-only — so default-deny everything):

```sql
-- Lock down RLS. All application data access flows through server-side
-- API routes using the service role (which bypasses RLS). Client-side
-- Supabase is used for auth only, so no anon/authenticated policies
-- are needed at all. Default-deny.

DROP POLICY IF EXISTS "Authenticated users full access to practices"  ON practices;
DROP POLICY IF EXISTS "Authenticated users full access to providers"  ON providers;
DROP POLICY IF EXISTS "Authenticated users full access to services"   ON services;
DROP POLICY IF EXISTS "Authenticated users full access to locations"  ON locations;
DROP POLICY IF EXISTS "Authenticated users full access to reviews"    ON reviews;
DROP POLICY IF EXISTS "Authenticated users full access to blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users full access to prospects"  ON prospects;

DROP POLICY IF EXISTS "Public can read live practices"                  ON practices;
DROP POLICY IF EXISTS "Public can read providers of live practices"     ON providers;
DROP POLICY IF EXISTS "Public can read services of live practices"      ON services;
DROP POLICY IF EXISTS "Public can read locations of live practices"     ON locations;
DROP POLICY IF EXISTS "Public can read reviews of live practices"       ON reviews;
DROP POLICY IF EXISTS "Public can read published posts of live practices" ON blog_posts;

-- This policy had no TO clause, so it granted anon/authenticated full
-- read-write access to patient PII. The service role needs no policy.
DROP POLICY IF EXISTS "Service role full access to appointment_requests" ON appointment_requests;

-- Align with every other child table: cascade on practice deletion.
ALTER TABLE appointment_requests
  DROP CONSTRAINT IF EXISTS appointment_requests_practice_id_fkey;
ALTER TABLE appointment_requests
  ADD CONSTRAINT appointment_requests_practice_id_fkey
  FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE;
```

- [ ] **Step 2: Update `schema.sql`** so a fresh project matches: delete all `CREATE POLICY` statements (keep every `ENABLE ROW LEVEL SECURITY` line), replace the policy-section commentary with the default-deny explanation above, and add `ON DELETE CASCADE` to the `appointment_requests.practice_id` FK definition.

- [ ] **Step 3: Verify** — `grep -c "CREATE POLICY" supabase/schema.sql` → 0; `grep -c "ENABLE ROW LEVEL SECURITY" supabase/schema.sql` → unchanged count (8).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260805000000_lock_down_rls.sql supabase/schema.sql
git commit -m "fix(security): default-deny RLS, close appointment_requests PII exposure"
```

**⚠ Applying this to the live Supabase project requires user sign-off — do not run it against the remote database as part of this plan.**

---

### Task 11: Remove silent sign-up from dashboard login

**Files:**
- Modify: `src/app/dashboard/login/page.tsx:94-112`

- [ ] **Step 1: Replace the signUp fallback** inside `handlePasswordSignIn`'s error branch:

```ts
if (error) {
  setError(
    error.message.toLowerCase().includes("invalid login")
      ? "Invalid email or password. If you haven't set a password yet, sign in with a magic link instead."
      : error.message,
  );
} else {
  window.location.href = "/dashboard";
}
```

(Magic link / OAuth remain the account-creation paths — `signInWithOtp` creates users by default.)

- [ ] **Step 2: Verify** — `npx tsc --noEmit` clean.

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/login/page.tsx
git commit -m "fix: stop silently creating accounts on failed password sign-in"
```

---

### Task 12: Final verification

- [ ] **Step 1:** `npx vitest run` → all tests pass.
- [ ] **Step 2:** `npm run build` → compiles with no errors.
- [ ] **Step 3:** `npm run lint` → no new errors (pre-existing warnings in WIP files are out of scope).
- [ ] **Step 4:** `git log --oneline main..HEAD` → one commit per task, working tree still holding the user's unrelated WIP edits untouched.
