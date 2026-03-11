# Prospect Scraper Pipeline — Design Spec

## Overview

A prospect discovery and qualification system for Santelis Health that finds doctors with poor or no websites, scrapes their existing online presence, scores them as leads, and lets an admin review and trigger demo site generation.

**Scope (Phase 1):** Discovery + scraping + scoring + manual demo generation trigger. No automated email outreach yet.

## Architecture

Three layers:

### 1. Service Layer (`src/services/`)

Pure business logic, no HTTP concerns.

| File | Responsibility |
|---|---|
| `prospect-discovery.ts` | Google Maps Places API — search by location, extract practice data |
| `prospect-scraper.ts` | Firecrawl — scrape website, extract structured data |
| `prospect-scorer.ts` | PageSpeed check + qualification scoring algorithm |
| `prospect-pipeline.ts` | Orchestrates: discover → scrape → score → save to DB |

### 2. API Routes (`src/app/api/prospects/`)

Thin HTTP wrappers over services.

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/prospects/discover` | POST | Search by location (city, state, specialty?) |
| `/api/prospects/scrape` | POST | Scrape a single URL |
| `/api/prospects` | GET | List prospects with filters |
| `/api/prospects/[id]/generate-demo` | POST | Trigger demo site generation |

### 3. Admin UI (`src/app/admin/prospects/`)

| Element | Description |
|---|---|
| Top bar — location search | City/state input + optional specialty dropdown + "Discover" button |
| Top bar — URL search | Paste a URL + "Scrape" button |
| Prospect table | Columns: Practice Name, City/State, Specialty, Google Rating, PageSpeed, Score, Status, Actions |
| Table features | Sortable by score (highest first), filterable by status |
| Row detail | Expandable view showing scraped data |
| Actions | Scrape (if not yet scraped), Generate Demo (if qualified), View Demo (if generated) |
| Protection | Password via `ADMIN_PASSWORD` env var, checked in middleware |

## Discovery Flow

### By Location

Input: `{ city, state, specialty? }`

1. Build search query: `"{specialty} doctor in {city} {state}"` or `"doctor in {city} {state}"` if no specialty
2. Google Maps Places API → Text Search
3. For each result, extract: `displayName`, `formattedAddress`, `nationalPhoneNumber`, `rating`, `userRatingCount`, `websiteUri`
4. Skip duplicates (match on `websiteUri` OR `practiceName + city`)
5. Save each as prospect with status `discovered`
6. Cap at 20 results per query (single page)
7. Return `{ count, prospects[] }`

### By URL

Input: `{ url, specialty? }`

1. Create prospect with URL and status `discovered`
2. Immediately trigger scrape + score
3. Return the scored prospect

### No-Website Path

When Google Maps returns a result with no `websiteUri`:
- Save with status `no-website`
- Skip Firecrawl scrape and PageSpeed check
- Auto-assign +50 qualification points
- Pull what we can from Google Maps (name, address, phone, rating, reviews)
- NPI Registry lookup for credentials (future enhancement)
- These are prime leads — they definitely need a website

## Scraping (Firecrawl)

For each prospect with a website URL:

1. Call Firecrawl `scrapeUrl(url)` with markdown format
2. Parse the returned content to extract:
   - Provider names and credentials
   - Services listed
   - Office hours
   - About/bio text
   - Contact information (phone, email, fax)
   - Any existing SEO meta tags
3. Store as `scrapedData` JSONB on the prospect record
4. Update status: `discovered` → stays `discovered` (scoring changes it)

## Scoring

### PageSpeed

- Hit `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url={url}&category=performance`
- No API key needed for low volume (~25/day)
- Store performance score (0-100) as `currentPageSpeed`

### Qualification Scoring Matrix

| Signal | Points |
|---|---|
| No website at all | +50 |
| PageSpeed < 50 | +30 |
| PageSpeed 50-70 | +15 |
| No SSL (http://) | +20 |
| No mobile responsive meta tag | +15 |
| No structured data (schema.org) | +10 |
| Website looks outdated (heuristic from scraped content) | +10 |
| Google rating >= 4.0 (good practice, bad site) | +10 |
| Has 20+ Google reviews | +5 |

**Threshold:** Score >= 40 → status changes to `qualified`

Scoring uses data from PageSpeed response + Firecrawl scraped content. No extra API calls.

## Demo Generation

Triggered manually from admin UI for qualified prospects:

1. Map `scrapedData` to `PracticeConfig` format
2. Use Claude (Sonnet) to:
   - Polish/rewrite provider bio
   - Generate a tagline
   - Write SEO meta description
3. Match specialty to closest config in `specialtyConfigs` for palette + default services
4. Call existing `/api/generate` endpoint to create practice in Supabase
5. Set prospect's `demoSlug`, update status to `demo-generated`
6. Demo viewable at `santelishealth.com/demo/{slug}`

## Data Model

Uses existing `prospects` table from `supabase/schema.sql`. One addition needed:

- Add `no-website` to the `outreach_status` CHECK constraint

### Updated Status Flow

```
discovered → qualified → demo-generated → (future: emailed → opened → clicked → signed-up → converted)
     ↓
no-website → qualified → demo-generated → ...
```

## Authentication

Simple middleware-based password protection for `/admin/*` routes:

- `ADMIN_PASSWORD` env var
- Login page at `/admin/login` — stores password in a cookie
- Middleware checks cookie on all `/admin/*` requests
- No user accounts, no sessions — just a single shared password

## Environment Variables

| Variable | Required | Source |
|---|---|---|
| `GOOGLE_MAPS_API_KEY` | Yes | Google Cloud Console |
| `FIRECRAWL_API_KEY` | Yes | firecrawl.dev |
| `GOOGLE_PAGESPEED_API_KEY` | No | Free without key for low volume |
| `ADMIN_PASSWORD` | Yes | Set in Vercel + .env.local |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Already configured |

## API Rate Limits & Costs

| Service | Free Tier | Cost Beyond |
|---|---|---|
| Google Maps Places | $200/mo credit (~10k searches) | $0.02/search |
| Firecrawl | 500 credits/mo on free plan | $0.01-0.05/scrape |
| PageSpeed Insights | ~25/day no key, unlimited with key | Free |
| Claude Sonnet (demo gen) | Pay per use | ~$0.01-0.03 per prospect |

## Out of Scope (Phase 1)

- Automated email outreach (Phase 2)
- NPI Registry lookup (Phase 2)
- Email finding via Hunter.io/Apollo (Phase 2)
- Bulk operations (scrape all, generate all)
- Pagination of Google Maps results (20 per query is fine for now)
- Prospect editing/notes
