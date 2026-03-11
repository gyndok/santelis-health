# Demo Site Polish — Design Spec

**Date:** 2026-03-11
**Status:** Approved
**Goal:** Make generated demo sites competitive with existing doctor websites (michelemd.com, cls.health, premierwellnessclearlake.com) by adding 4 high-impact visual and functional improvements.

---

## Features

### 1. Hero Image + Ken Burns Animation

Upgrade the hero section from a solid gradient to support a configurable background image with a subtle Ken Burns (slow zoom/pan) CSS animation.

- Add `heroImageUrl?: string` to the `Branding` interface
- If image URL provided: render as `background-image` with semi-transparent gradient overlay (primary/primaryDark at ~60% opacity) for text readability
- Ken Burns: 20s infinite CSS `@keyframes` animation, `scale(1.0)` → `scale(1.1)`, `overflow: hidden` container
- If no image: current gradient-only behavior (backward compatible)
- Dashboard BrandingTab gets a "Hero Image URL" field

**Modified:** `SiteHero.tsx`, `types/index.ts`, dashboard `page.tsx`

### 2. Provider Cards Grid

New `SiteProviders.tsx` component rendering provider cards between the About and Services sections.

- Responsive grid: 1 col mobile, 2 cols md, 3 cols lg
- Each card: photo (or initials circle fallback), name + credentials, title, 2-line bio snippet (CSS `line-clamp-2`), languages
- Single shared "Book Appointment" CTA below the grid (links to practice booking URL)
- Skip section entirely if only 1 provider (About section already covers them)
- Uses existing `Provider` interface — no type changes needed

**Created:** `SiteProviders.tsx`
**Modified:** `GeneratedSite.tsx`

### 3. Testimonial Carousel

Replace the static 2-column review grid with an auto-rotating fade carousel.

- Keep the aggregate rating display at top (unchanged)
- Single-card fade carousel below, auto-rotates every 5s
- Dot indicators (clickable to jump to specific review)
- Left/right arrow buttons on hover (desktop)
- Pause auto-rotation on hover
- Pure CSS transitions + minimal React state — no external carousel library

**Modified:** `SiteReviews.tsx`

### 4. Appointment Request Form

New `SiteAppointmentForm.tsx` component placed between Reviews and Contact sections.

- Accent-colored background section (matches Services section styling)
- Heading: "Request an Appointment"
- Fields: name (required), email (required), phone, preferred date (date picker), preferred time (morning/afternoon/evening select), reason for visit (textarea)
- Submits POST to `/api/appointments` with `practiceId`
- Success state: "Thank you! We'll be in touch shortly."
- Basic rate limiting: max 5 submissions per IP per hour (in-memory)

**Created:** `SiteAppointmentForm.tsx`, `api/appointments/route.ts`

---

## Data Model

### New table: `appointment_requests`

```sql
CREATE TABLE appointment_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  practice_id UUID REFERENCES practices(id) NOT NULL,
  patient_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  preferred_date DATE,
  preferred_time TEXT,
  reason TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'scheduled', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Type changes (`types/index.ts`)

- Add `heroImageUrl?: string` to `Branding` interface
- Add `AppointmentRequest` interface matching the table schema

---

## Email Notification

- **Service:** Resend (free tier: 100 emails/day)
- **New dependency:** `resend` npm package
- **New env var:** `RESEND_API_KEY`
- **From:** `appointments@santelishealth.com` (configure domain in Resend)
- **Subject:** "New Appointment Request — [Patient Name]"
- **To:** Practice contact email (from `locations.email` or `practices.owner_email`)
- **Body:** Simple HTML — patient name, email, phone, preferred date/time, reason, link to dashboard

---

## Dashboard Integration

- New "Requests" tab in the customer dashboard
- Lists appointment requests for the practice, newest first
- Status badges: new (blue), contacted (yellow), scheduled (green), dismissed (gray)
- Click to update status via dropdown
- New API route: `GET/PUT /api/dashboard/appointments`

---

## Page Flow (top to bottom)

1. SiteHeader _(unchanged)_
2. **SiteHero** _(+ hero image + Ken Burns)_
3. SiteAbout _(primary provider bio)_
4. **SiteProviders** _(NEW — provider cards grid)_
5. SiteServices _(unchanged)_
6. **SiteReviews** _(carousel instead of grid)_
7. **SiteAppointmentForm** _(NEW — request form)_
8. SiteContact _(unchanged)_
9. SiteFooter _(unchanged)_

---

## Competitor Feature Mapping

| Feature | michelemd.com | cls.health | premierwellness | Ours (after) |
|---------|:---:|:---:|:---:|:---:|
| Hero image/video | ✅ image | — | ✅ video | ✅ image + Ken Burns |
| Provider cards | ❌ | ✅ full cards | ❌ | ✅ cards + shared CTA |
| Review carousel | ✅ Trustindex | ❌ | ✅ fade | ✅ fade carousel |
| Contact/appt form | ✅ basic | ❌ (external) | ✅ popup | ✅ inline form |
| Patient portal | ❌ | ✅ | ❌ | ❌ (deferred) |
