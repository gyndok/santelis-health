# Customer Dashboard — Design Spec

## Overview

A dashboard where customers (doctors) can edit their practice website after onboarding, and admins can edit any practice via impersonation. Features a side-by-side editor + live preview layout.

## Routes

| Route | Purpose |
|---|---|
| `/dashboard` | Customer dashboard (protected, scoped to their practice) |
| `/dashboard/login` | Customer sign-in (Google, magic link, email/password) |
| `/admin/practices` | Admin list of all practices |
| `/admin/practices/[id]` → redirects to `/dashboard?practiceId={id}` | Admin editing a specific practice |

## Auth & Ownership

- Customers sign in via Supabase Auth: Google OAuth, magic link, email/password
- New `owner_email` column on `practices` table links a practice to a user
- On dashboard load, query practices where `owner_email` matches authenticated user's email
- If no practice found, show message with link to `/onboard`
- Admin impersonation: admin clicks "Edit" on a practice → navigates to `/dashboard?practiceId={id}`, dashboard skips ownership check for users in `ADMIN_EMAILS`

## Editor Layout

**Desktop (side-by-side):**
- Left panel (~50%): tabbed editor form
- Right panel (~50%): live preview iframe rendering `GeneratedSite`
- Preview auto-refreshes after each save

**Mobile:**
- Editor stacks on top, preview link below

## Editor Tabs

| Tab | Fields |
|---|---|
| Practice Info | Practice name, specialty, sub-specialties, tagline |
| Providers | Add/edit/remove — name, credentials, title, bio, education, board certs, languages, photo |
| Services | Add/edit/remove/reorder — title, description, featured toggle, icon |
| Location & Hours | Address, city, state, zip, phone, fax, email, per-day hours with open/closed, Google Maps URL |
| Branding | Color palette picker (4 presets per specialty + custom), tagline, logo upload placeholder |
| Reviews | Add/edit/remove — author, rating, text, date, source |
| Insurance | Add/remove from list, autocomplete for common insurers |

Each tab has its own Save button, success/error toast, and triggers preview refresh on save.

## API Routes

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/dashboard/practice` | GET | Fetch current user's practice (by owner_email) or by practiceId (admin) |
| `/api/dashboard/practice` | PUT | Update practice basics (name, specialty, tagline, insurance) |
| `/api/dashboard/providers` | PUT | Replace all providers for a practice |
| `/api/dashboard/services` | PUT | Replace all services for a practice |
| `/api/dashboard/location` | PUT | Update location & hours |
| `/api/dashboard/branding` | PUT | Update branding (colors, logo) |
| `/api/dashboard/reviews` | PUT | Replace all reviews for a practice |

All routes check Supabase auth session, match owner_email or check ADMIN_EMAILS for admin bypass.

## Admin Practices Page

Page at `/admin/practices`:
- Table: Name, Specialty, Subdomain, Status, Owner Email, Created, Actions
- "Edit" button → `/dashboard?practiceId={id}`
- "View Demo" link → `/demo/{slug}`
- Same auth middleware as `/admin/prospects`

## Database Changes

- Add `owner_email TEXT` column to `practices` table
- Update onboarding `/api/generate` to save owner email when creating a practice

## Live Preview

- Renders `GeneratedSite` component in an iframe at `/demo/{slug}`
- Iframe reloads after each tab save
- "Open in new tab" link available

## Out of Scope (V1)

- Rich features (videos, consent forms, patient portal links — future, like geffreyklein.com)
- Image/logo upload (placeholder for now)
- Custom domain management
- Analytics/traffic stats
