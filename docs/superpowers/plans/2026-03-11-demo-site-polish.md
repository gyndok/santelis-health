# Demo Site Polish Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade generated demo sites with hero images, provider cards, review carousel, and appointment request form to compete with existing doctor websites.

**Architecture:** Enhance 3 existing generated-site components (SiteHero, SiteReviews, GeneratedSite) and create 2 new ones (SiteProviders, SiteAppointmentForm). Add a new `appointment_requests` DB table with API routes for submission and dashboard management. Email notifications via Resend.

**Tech Stack:** Next.js 16, React, TypeScript, Tailwind CSS, Supabase, Resend

---

## Chunk 1: Type Updates & Hero Image

### Task 1: Update types and Branding interface

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Add AppointmentRequest interface and update Branding**

Add to `src/types/index.ts` after the `ScrapedWebsiteData` interface (end of file):

```typescript
// ============================================================
// Appointment Request Types
// ============================================================

export interface AppointmentRequest {
  id: string;
  practiceId: string;
  patientName: string;
  email: string;
  phone?: string;
  preferredDate?: string;
  preferredTime?: string;
  reason?: string;
  status: "new" | "contacted" | "scheduled" | "dismissed";
  createdAt: string;
}
```

The `Branding` interface already has `heroImageUrl?: string` (added earlier). Verify it's present. If not, add it.

- [ ] **Step 2: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: "Generating static pages" — no TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add AppointmentRequest type"
```

---

### Task 2: Hero image with Ken Burns animation

**Files:**
- Modify: `src/components/generated-site/SiteHero.tsx`

- [ ] **Step 1: Rewrite SiteHero.tsx with hero image support**

Replace the entire file with:

```tsx
import type { Provider, ColorPalette } from "@/types";

interface SiteHeroProps {
  practiceName: string;
  tagline?: string;
  provider: Provider;
  colorPalette: ColorPalette;
  phone: string;
  bookingUrl?: string;
  heroImageUrl?: string;
}

export default function SiteHero({
  practiceName,
  tagline,
  provider,
  colorPalette,
  phone,
  bookingUrl,
  heroImageUrl,
}: SiteHeroProps) {
  const providerDisplayName = `Dr. ${provider.firstName} ${provider.lastName}, ${provider.credentials}`;

  return (
    <section className="relative overflow-hidden">
      {/* Background: image with Ken Burns or gradient fallback */}
      {heroImageUrl ? (
        <>
          <div
            className="absolute inset-0 animate-ken-burns"
            style={{
              backgroundImage: `url(${heroImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${colorPalette.primary}cc 0%, ${colorPalette.primaryDark}cc 100%)`,
            }}
          />
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${colorPalette.primary} 0%, ${colorPalette.primaryDark} 100%)`,
          }}
        />
      )}

      {/* Content */}
      <div className="relative py-20 md:py-32">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
            {practiceName}
          </h1>
          {tagline && (
            <p
              className="text-lg md:text-xl mb-4 font-medium"
              style={{ color: colorPalette.accent }}
            >
              {tagline}
            </p>
          )}
          <p className="text-lg md:text-xl text-white/80 mb-10">
            {providerDisplayName}
            {provider.title && (
              <>
                <br />
                <span className="text-base text-white/60">{provider.title}</span>
              </>
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={bookingUrl || "#contact"}
              className="font-semibold px-8 py-3.5 rounded-lg transition-opacity hover:opacity-90 text-lg inline-flex items-center justify-center gap-2"
              style={{
                backgroundColor: "#ffffff",
                color: colorPalette.primaryDark,
              }}
            >
              Book Appointment
            </a>
            <a
              href={`tel:${phone.replace(/[^\d+]/g, "")}`}
              className="border-2 border-white/40 text-white hover:border-white font-semibold px-8 py-3.5 rounded-lg transition-colors text-lg text-center"
            >
              Call {phone}
            </a>
          </div>
        </div>
      </div>

      {/* Ken Burns keyframes */}
      <style>{`
        @keyframes kenBurns {
          0% { transform: scale(1.0); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1.0); }
        }
        .animate-ken-burns {
          animation: kenBurns 20s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
```

- [ ] **Step 2: Update GeneratedSite.tsx to pass heroImageUrl to SiteHero**

In `src/components/generated-site/GeneratedSite.tsx`, find the `<SiteHero` JSX and add the `heroImageUrl` prop:

```tsx
      <SiteHero
        practiceName={config.practiceName}
        tagline={branding.tagline}
        provider={primaryProvider}
        colorPalette={branding.colorPalette}
        phone={primaryLocation.phone}
        bookingUrl={bookingUrl}
        heroImageUrl={branding.heroImageUrl}
      />
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: No TypeScript errors

- [ ] **Step 4: Commit**

```bash
git add src/components/generated-site/SiteHero.tsx src/components/generated-site/GeneratedSite.tsx
git commit -m "feat: add hero image support with Ken Burns animation"
```

---

## Chunk 2: Provider Cards

### Task 3: Create SiteProviders component

**Files:**
- Create: `src/components/generated-site/SiteProviders.tsx`
- Modify: `src/components/generated-site/GeneratedSite.tsx`

- [ ] **Step 1: Create SiteProviders.tsx**

Create `src/components/generated-site/SiteProviders.tsx`:

```tsx
import type { Provider, ColorPalette } from "@/types";

interface SiteProvidersProps {
  providers: Provider[];
  colorPalette: ColorPalette;
  bookingUrl?: string;
}

export default function SiteProviders({
  providers,
  colorPalette,
  bookingUrl,
}: SiteProvidersProps) {
  // Skip if 0 or 1 provider (About section handles single provider)
  if (providers.length <= 1) return null;

  return (
    <section id="providers" className="py-20 md:py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2
          className="text-3xl font-bold text-center mb-4"
          style={{ color: colorPalette.neutralDark }}
        >
          Our Providers
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Meet our team of experienced healthcare professionals
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              colorPalette={colorPalette}
            />
          ))}
        </div>

        {bookingUrl && (
          <div className="text-center mt-10">
            <a
              href={bookingUrl}
              className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-3.5 rounded-lg text-lg text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: colorPalette.primary }}
            >
              Book an Appointment
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function ProviderCard({
  provider,
  colorPalette,
}: {
  provider: Provider;
  colorPalette: ColorPalette;
}) {
  const displayName = `Dr. ${provider.firstName} ${provider.lastName}`;
  const initials = `${provider.firstName[0]}${provider.lastName[0]}`;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 text-center hover:shadow-lg transition-shadow">
      {/* Photo or initials fallback */}
      {provider.photoUrl ? (
        <img
          src={provider.photoUrl}
          alt={displayName}
          className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
        />
      ) : (
        <div
          className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold"
          style={{ backgroundColor: colorPalette.primary }}
        >
          {initials}
        </div>
      )}

      {/* Name & credentials */}
      <h3 className="text-lg font-semibold text-gray-900">{displayName}</h3>
      <p className="text-sm text-gray-500">{provider.credentials}</p>
      {provider.title && (
        <p className="text-sm mt-1" style={{ color: colorPalette.primary }}>
          {provider.title}
        </p>
      )}

      {/* Bio snippet */}
      {provider.bio && (
        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
          {provider.bio}
        </p>
      )}

      {/* Languages */}
      {provider.languages.length > 0 && (
        <p className="text-xs text-gray-400 mt-3">
          {provider.languages.join(" · ")}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add SiteProviders to GeneratedSite.tsx**

In `src/components/generated-site/GeneratedSite.tsx`:

Add the import at the top with the other imports:
```tsx
import SiteProviders from "./SiteProviders";
```

Add the component between `<SiteAbout>` and `<SiteServices>`:
```tsx
      <SiteAbout
        provider={primaryProvider}
        colorPalette={branding.colorPalette}
      />

      <SiteProviders
        providers={providers}
        colorPalette={branding.colorPalette}
        bookingUrl={bookingUrl}
      />

      <SiteServices
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: No TypeScript errors

- [ ] **Step 4: Commit**

```bash
git add src/components/generated-site/SiteProviders.tsx src/components/generated-site/GeneratedSite.tsx
git commit -m "feat: add provider cards grid component"
```

---

## Chunk 3: Review Carousel

### Task 4: Replace review grid with auto-rotating carousel

**Files:**
- Modify: `src/components/generated-site/SiteReviews.tsx`

- [ ] **Step 1: Rewrite SiteReviews.tsx with carousel**

Replace the entire file with:

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import type { Review, ColorPalette } from "@/types";

interface SiteReviewsProps {
  reviews: Review[];
  colorPalette: ColorPalette;
  googleBusinessProfileId?: string;
}

function StarRating({ rating, color }: { rating: number; color: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className="w-5 h-5"
          fill={star <= Math.round(rating) ? color : "#d1d5db"}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function SiteReviews({
  reviews,
  colorPalette,
  googleBusinessProfileId,
}: SiteReviewsProps) {
  if (reviews.length === 0) return null;

  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex(((index % reviews.length) + reviews.length) % reviews.length);
    },
    [reviews.length]
  );

  const next = useCallback(() => goTo(currentIndex + 1), [goTo, currentIndex]);
  const prev = useCallback(() => goTo(currentIndex - 1), [goTo, currentIndex]);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (isPaused || reviews.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isPaused, next, reviews.length]);

  return (
    <section id="reviews" className="py-20 md:py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <h2
          className="text-3xl font-bold text-center mb-4"
          style={{ color: colorPalette.neutralDark }}
        >
          Patient Reviews
        </h2>

        {/* Aggregate Rating */}
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-3 mb-2">
            <span
              className="text-4xl font-bold"
              style={{ color: colorPalette.primaryDark }}
            >
              {avgRating.toFixed(1)}
            </span>
            <StarRating rating={avgRating} color={colorPalette.primary} />
          </div>
          <p className="text-gray-500 text-sm">
            Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Carousel */}
        <div
          className="relative max-w-2xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Arrow buttons (desktop) */}
          {reviews.length > 1 && (
            <>
              <button
                onClick={prev}
                className="hidden md:flex absolute -left-12 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-colors z-10"
                aria-label="Previous review"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={next}
                className="hidden md:flex absolute -right-12 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-colors z-10"
                aria-label="Next review"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Review cards with fade transition */}
          <div className="relative min-h-[200px]">
            {reviews.map((review, i) => (
              <div
                key={i}
                className="absolute inset-0 transition-opacity duration-500"
                style={{ opacity: i === currentIndex ? 1 : 0, pointerEvents: i === currentIndex ? "auto" : "none" }}
              >
                <div className="rounded-xl border border-gray-200 bg-white p-8">
                  <div className="flex items-center justify-between mb-4">
                    <StarRating rating={review.rating} color={colorPalette.primary} />
                    <span className="text-xs text-gray-400">
                      {new Date(review.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <p className="text-gray-700 text-base leading-relaxed mb-4 italic">
                    &ldquo;{review.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: colorPalette.primary }}
                    >
                      {review.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-800">
                        {review.authorName}
                      </span>
                      {review.source === "google" && (
                        <span className="block text-xs text-gray-400">Google</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          {reviews.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: i === currentIndex ? colorPalette.primary : "#d1d5db",
                    transform: i === currentIndex ? "scale(1.3)" : "scale(1)",
                  }}
                  aria-label={`Go to review ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Google Reviews Link */}
        {googleBusinessProfileId && (
          <div className="text-center mt-8">
            <a
              href={`https://search.google.com/local/reviews?placeid=${googleBusinessProfileId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium underline"
              style={{ color: colorPalette.primary }}
            >
              See all reviews on Google &rarr;
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add src/components/generated-site/SiteReviews.tsx
git commit -m "feat: replace review grid with auto-rotating fade carousel"
```

---

## Chunk 4: Appointment Request Form & API

### Task 5: Create appointment request API route

**Files:**
- Create: `src/app/api/appointments/route.ts`

- [ ] **Step 1: Install Resend**

Run: `npm install resend`

- [ ] **Step 2: Create the API route**

Create `src/app/api/appointments/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { Resend } from "resend";

// Simple in-memory rate limiting
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + 3600000 }); // 1 hour
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { practiceId, patientName, email, phone, preferredDate, preferredTime, reason } = body;

    // Validate required fields
    if (!practiceId || !patientName || !email) {
      return NextResponse.json(
        { error: "Missing required fields: practiceId, patientName, email" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Insert appointment request
    const { data: appointment, error: insertError } = await supabase
      .from("appointment_requests")
      .insert({
        practice_id: practiceId,
        patient_name: patientName,
        email,
        phone: phone || null,
        preferred_date: preferredDate || null,
        preferred_time: preferredTime || null,
        reason: reason || null,
        status: "new",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Failed to insert appointment request:", insertError);
      return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
    }

    // Look up practice contact email for notification
    const { data: practice } = await supabase
      .from("practices")
      .select("practice_name, owner_email")
      .eq("id", practiceId)
      .single();

    const { data: location } = await supabase
      .from("locations")
      .select("email")
      .eq("practice_id", practiceId)
      .limit(1)
      .maybeSingle();

    const recipientEmail = practice?.owner_email || location?.email;

    // Send email notification if we have a recipient and Resend is configured
    if (recipientEmail && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "Santelis Health <appointments@santelishealth.com>",
          to: recipientEmail,
          subject: `New Appointment Request — ${patientName}`,
          html: `
            <h2>New Appointment Request</h2>
            <p>A new appointment request was submitted for <strong>${practice?.practice_name || "your practice"}</strong>.</p>
            <table style="border-collapse:collapse;margin:16px 0;">
              <tr><td style="padding:8px;font-weight:bold;">Name:</td><td style="padding:8px;">${patientName}</td></tr>
              <tr><td style="padding:8px;font-weight:bold;">Email:</td><td style="padding:8px;">${email}</td></tr>
              ${phone ? `<tr><td style="padding:8px;font-weight:bold;">Phone:</td><td style="padding:8px;">${phone}</td></tr>` : ""}
              ${preferredDate ? `<tr><td style="padding:8px;font-weight:bold;">Preferred Date:</td><td style="padding:8px;">${preferredDate}</td></tr>` : ""}
              ${preferredTime ? `<tr><td style="padding:8px;font-weight:bold;">Preferred Time:</td><td style="padding:8px;">${preferredTime}</td></tr>` : ""}
              ${reason ? `<tr><td style="padding:8px;font-weight:bold;">Reason:</td><td style="padding:8px;">${reason}</td></tr>` : ""}
            </table>
            <p><a href="https://santelishealth.com/dashboard">View in Dashboard</a></p>
          `,
        });
      } catch (emailErr) {
        console.error("Failed to send notification email:", emailErr);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ success: true, id: appointment.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: No TypeScript errors

- [ ] **Step 4: Commit**

```bash
git add src/app/api/appointments/route.ts package.json package-lock.json
git commit -m "feat: add appointment request API with email notification via Resend"
```

---

### Task 6: Create SiteAppointmentForm component

**Files:**
- Create: `src/components/generated-site/SiteAppointmentForm.tsx`
- Modify: `src/components/generated-site/GeneratedSite.tsx`

- [ ] **Step 1: Create SiteAppointmentForm.tsx**

Create `src/components/generated-site/SiteAppointmentForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { ColorPalette } from "@/types";

interface SiteAppointmentFormProps {
  practiceId: string;
  colorPalette: ColorPalette;
  practiceName: string;
}

export default function SiteAppointmentForm({
  practiceId,
  colorPalette,
  practiceName,
}: SiteAppointmentFormProps) {
  const [formData, setFormData] = useState({
    patientName: "",
    email: "",
    phone: "",
    preferredDate: "",
    preferredTime: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ practiceId, ...formData }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="appointment"
      className="py-20 md:py-24"
      style={{ backgroundColor: `${colorPalette.accent}33` }}
    >
      <div className="container mx-auto px-4 max-w-2xl">
        <h2
          className="text-3xl font-bold text-center mb-4"
          style={{ color: colorPalette.neutralDark }}
        >
          Request an Appointment
        </h2>
        <p className="text-center text-gray-600 mb-10">
          Fill out the form below and we&apos;ll get back to you as soon as possible.
        </p>

        {submitted ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${colorPalette.primary}20` }}
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke={colorPalette.primary}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3
              className="text-xl font-semibold mb-2"
              style={{ color: colorPalette.neutralDark }}
            >
              Thank you!
            </h3>
            <p className="text-gray-600">
              Your appointment request has been submitted. {practiceName} will be in touch shortly.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl border border-gray-200 p-8 space-y-5"
          >
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="patientName"
                required
                value={formData.patientName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                style={{ "--tw-ring-color": colorPalette.primary } as React.CSSProperties}
                placeholder="Your full name"
              />
            </div>

            {/* Email & Phone row */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                  style={{ "--tw-ring-color": colorPalette.primary } as React.CSSProperties}
                  placeholder="you@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                  style={{ "--tw-ring-color": colorPalette.primary } as React.CSSProperties}
                  placeholder="(555) 555-5555"
                />
              </div>
            </div>

            {/* Date & Time row */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                  style={{ "--tw-ring-color": colorPalette.primary } as React.CSSProperties}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Time
                </label>
                <select
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none bg-white"
                  style={{ "--tw-ring-color": colorPalette.primary } as React.CSSProperties}
                >
                  <option value="">No preference</option>
                  <option value="morning">Morning (8am - 12pm)</option>
                  <option value="afternoon">Afternoon (12pm - 4pm)</option>
                  <option value="evening">Evening (4pm - 6pm)</option>
                </select>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Visit
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none resize-none"
                style={{ "--tw-ring-color": colorPalette.primary } as React.CSSProperties}
                placeholder="Briefly describe the reason for your visit"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg text-white font-semibold text-lg transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: colorPalette.primary }}
            >
              {submitting ? "Submitting..." : "Request Appointment"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add SiteAppointmentForm to GeneratedSite.tsx**

In `src/components/generated-site/GeneratedSite.tsx`:

Add the import:
```tsx
import SiteAppointmentForm from "./SiteAppointmentForm";
```

Add the component between `<SiteReviews>` and `<SiteContact>`:
```tsx
      <SiteReviews
        reviews={reviews}
        colorPalette={branding.colorPalette}
        googleBusinessProfileId={integrations.googleBusinessProfileId}
      />

      <SiteAppointmentForm
        practiceId={config.id}
        colorPalette={branding.colorPalette}
        practiceName={config.practiceName}
      />

      <SiteContact
```

Also add `"Appointment"` to the SiteHeader nav links. In `src/components/generated-site/SiteHeader.tsx`, find the nav links array and add `{ label: "Appointment", href: "#appointment" }` after "Reviews".

- [ ] **Step 3: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: No TypeScript errors

- [ ] **Step 4: Commit**

```bash
git add src/components/generated-site/SiteAppointmentForm.tsx src/components/generated-site/GeneratedSite.tsx src/components/generated-site/SiteHeader.tsx
git commit -m "feat: add appointment request form to generated sites"
```

---

## Chunk 5: Dashboard Integration & DB Migration

### Task 7: Create dashboard appointments API route

**Files:**
- Create: `src/app/api/dashboard/appointments/route.ts`

- [ ] **Step 1: Create the dashboard appointments API**

Create `src/app/api/dashboard/appointments/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { authenticateDashboard } from "@/lib/dashboard-auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateDashboard(request);
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("appointment_requests")
      .select("*")
      .eq("practice_id", auth.practiceId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ appointments: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateDashboard(request);
    const supabase = getSupabaseAdmin();
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: "id and status required" }, { status: 400 });
    }

    const validStatuses = ["new", "contacted", "scheduled", "dismissed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Verify the appointment belongs to this practice
    const { data: existing } = await supabase
      .from("appointment_requests")
      .select("id")
      .eq("id", id)
      .eq("practice_id", auth.practiceId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("appointment_requests")
      .update({ status })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add src/app/api/dashboard/appointments/route.ts
git commit -m "feat: add dashboard appointments API for viewing and updating status"
```

---

### Task 8: Add Requests tab to dashboard

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Add "Requests" tab and component**

In `src/app/dashboard/page.tsx`:

1. Add `Calendar` to the lucide-react imports.

2. Update the `TabId` type to include `"requests"`:
```typescript
type TabId = "practice" | "providers" | "services" | "location" | "branding" | "reviews" | "insurance" | "requests";
```

3. Add the requests tab to the `TABS` array (after insurance):
```typescript
  { id: "requests", label: "Requests", icon: <Calendar className="w-4 h-4" /> },
```

4. Add the `RequestsTab` component render case in the tab content section. Find the switch/conditional that renders tabs and add:
```tsx
{activeTab === "requests" && <RequestsTab practiceIdParam={practiceIdParam} />}
```

5. Add the `RequestsTab` component at the bottom of the file (before the final export or after other tab components):

```tsx
function RequestsTab({ practiceIdParam }: { practiceIdParam: string | null }) {
  const [appointments, setAppointments] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const params = practiceIdParam ? `?practiceId=${practiceIdParam}` : "";
      const res = await window.fetch(`/api/dashboard/appointments${params}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
      setLoading(false);
    }
    fetch();
  }, [practiceIdParam]);

  async function updateStatus(id: string, status: string) {
    const params = practiceIdParam ? `?practiceId=${practiceIdParam}` : "";
    await window.fetch(`/api/dashboard/appointments${params}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  }

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800",
    contacted: "bg-yellow-100 text-yellow-800",
    scheduled: "bg-green-100 text-green-800",
    dismissed: "bg-gray-100 text-gray-800",
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }

  if (appointments.length === 0) {
    return <div className="text-center py-12 text-gray-500">No appointment requests yet.</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Appointment Requests</h3>
      <div className="space-y-3">
        {appointments.map((apt) => (
          <div key={apt.id as string} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium text-gray-900">{apt.patient_name as string}</div>
                <div className="text-sm text-gray-500">{apt.email as string}{apt.phone ? ` · ${apt.phone}` : ""}</div>
                {apt.preferred_date && (
                  <div className="text-sm text-gray-500 mt-1">
                    Preferred: {apt.preferred_date as string}{apt.preferred_time ? ` (${apt.preferred_time})` : ""}
                  </div>
                )}
                {apt.reason && (
                  <div className="text-sm text-gray-600 mt-1">{apt.reason as string}</div>
                )}
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(apt.created_at as string).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
                  })}
                </div>
              </div>
              <select
                value={apt.status as string}
                onChange={(e) => updateStatus(apt.id as string, e.target.value)}
                className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer ${statusColors[(apt.status as string) || "new"]}`}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="scheduled">Scheduled</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: add Requests tab to dashboard for appointment management"
```

---

### Task 9: Add hero image URL field to dashboard branding tab

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Add heroImageUrl field to BrandingTab**

In `src/app/dashboard/page.tsx`, find the `BrandingTab` component. Add a "Hero Image URL" input field in the form, alongside the existing branding fields (tagline, colors, etc.):

```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image URL</label>
  <input
    type="url"
    value={(branding.heroImageUrl as string) || ""}
    onChange={(e) => setBranding({ ...branding, heroImageUrl: e.target.value })}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
    placeholder="https://example.com/hero-image.jpg"
  />
  <p className="text-xs text-gray-400 mt-1">Optional background image for the hero section</p>
</div>
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: add hero image URL field to dashboard branding tab"
```

---

### Task 10: DB migration, env vars, and deploy

**Files:**
- Modify: `supabase/schema.sql`

- [ ] **Step 1: Update schema.sql with appointment_requests table**

Add to the end of `supabase/schema.sql`:

```sql
-- Appointment requests from generated sites
CREATE TABLE IF NOT EXISTS appointment_requests (
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

- [ ] **Step 2: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: No TypeScript errors

- [ ] **Step 3: Commit and push**

```bash
git add supabase/schema.sql
git commit -m "feat: add appointment_requests table to schema"
git push origin main
```

- [ ] **Step 4: User action — run DB migration**

Run this SQL in Supabase SQL Editor:
```sql
CREATE TABLE IF NOT EXISTS appointment_requests (
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

- [ ] **Step 5: User action — add RESEND_API_KEY to Vercel**

1. Sign up at https://resend.com
2. Create an API key
3. Add `RESEND_API_KEY` to Vercel environment variables
4. (Optional) Verify your domain in Resend for custom "from" address

- [ ] **Step 6: Verify deployment**

Visit `https://santelishealth.com/demo/kleins-womens-care` and verify:
- Hero section still works (no hero image configured yet, so gradient fallback)
- Reviews section shows carousel with arrows and dots
- Appointment form appears between reviews and contact
- Provider cards section appears (if multiple providers in demo data)
