# XOXO Travels — Launch Checklist

_Final Production Readiness Audit · 2026-06-24 · Feature freeze in effect_

This document is the stabilization pass before real travel API integration and launch infrastructure. No new business features were added.

---

## Executive Summary

| Area | Status |
|---|---|
| Production build | ✅ Passes (20 routes, zero errors) |
| Broken navigation links | ✅ Fixed (redirects + data updates) |
| Demo / placeholder copy | ✅ Cleaned (realistic sample data retained where intentional) |
| SEO metadata | ✅ Added on commerce pages |
| PWA / favicon | ✅ SVG icon added; PNG maskable icons deferred |
| Accessibility | ✅ Key contrast + label fixes applied |
| Performance (Lighthouse local) | ⚠️ 44–59 — cinematic hero + JS weight; see below |
| Real API integration | ❌ Blocker for full production launch |

**Overall:** Ready for **controlled beta / investor demo**. Full public launch requires backend deployment, API keys, payment keys, and travel inventory APIs.

---

## Completed Items

### Audit & content stabilization

- [x] Full codebase scan — no `console.log`, `TODO`, or `FIXME` in `app/`, `components/`, `lib/`
- [x] Dead routes fixed via `next.config.mjs` redirects: `/flights`, `/hotels`, `/activities`, `/insurance` → `/packages`; `/solo-match` → `/match`
- [x] `lib/home-data.ts` — nav links point to live pages; testimonial copy no longer references unbuilt “travel locker”
- [x] `lib/pyt-data.ts` — drawer menu `#` placeholders replaced with real hrefs; booking ticker names normalized
- [x] `lib/mock-data.ts` — Solo Match link → `/match`
- [x] `HeroSearchBar.tsx` — tabs/routes aligned to Packages, Destinations, Visa, Guides
- [x] `MobileDrawer.tsx` — simplified for all-link drawer menu
- [x] `TestimonialsSection` — `id="testimonials"` for anchor links
- [x] Login form — demo credentials hidden in production (`NODE_ENV === development` only)

### SEO & metadata

- [x] `/packages` — title + description metadata
- [x] `/destinations` — title + description metadata
- [x] `/packages/[id]` — fallback metadata
- [x] Root layout — favicon via `/icon.svg`, Unsplash `preconnect`

### PWA & branding

- [x] `public/icon.svg` — brand mark (green gradient + “X”)
- [x] `manifest.json` — `theme_color` aligned to `#0D3D2E`; SVG icon entry
- [x] Layout `icons` metadata wired

### Accessibility fixes (Lighthouse-driven)

- [x] AI Planner — range slider `id` + `aria-*`; generate CTA uses `green-dark` (4.5:1 contrast)
- [x] Package detail — error-state back link contrast
- [x] Navbar logo — `travels` suffix contrast (`text-white/90`)
- [x] Login — password toggle 44px touch target
- [x] `AnimatedButton` primary variant — `green-dark` background for WCAG contrast

### Build verification

- [x] `npm run build` — successful, 20 routes, no type errors

### Lighthouse audit (local production server, port 3001)

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Homepage `/` | 59 | **100** | 96 | **100** |
| Destinations | 45 | **100** | **100** | **100** |
| Package detail* | 46 | 96 | 96 | **100** |
| Dashboard† | 44 | 92 | **100** | **100** |
| AI Planner | 45 → improved‡ | 90 → improved‡ | **100** | **100** |

\* Tested `/packages/sample-package` (API offline → not-found state).  
† Unauthenticated → redirects to `/login` (scores reflect login shell).  
‡ Accessibility fixes applied (range label, CTA contrast); re-audit on production deploy recommended.

**Performance note:** Low local scores are expected. Primary drivers: cinematic intro (~3.8s), Framer Motion, homepage code-split sections still hydrating, and single-process `next start` without CDN/edge caching. Production deployment with CDN, image optimization, and optional intro skip for returning users will improve scores materially.

---

## Remaining Production Blockers

### Must fix before public launch

| Blocker | Detail | Owner |
|---|---|---|
| **Backend not deployed** | Frontend defaults to `http://localhost:5000/api` | DevOps |
| **MongoDB production cluster** | Seed data only runs locally | DevOps |
| **Razorpay live keys** | Bookings run in demo mode without server keys | Payments |
| **Anthropic API** | AI Planner / Trippie require `ANTHROPIC_API_KEY` | Backend |
| **Auth secrets** | `JWT_SECRET`, `REFRESH_TOKEN_SECRET` must be strong random values | Security |
| **Travel inventory APIs** | Flights, hotels, activities are redirected — not built | Product |
| **Insurance / visa add-ons** | Booking modal shows “Coming soon” for insurance & visa upsells | Product |
| **PNG PWA icons** | Maskable 192×192 / 512×192 PNGs needed for full install prompt on all platforms | Design |
| **Brand favicon** | Current SVG is placeholder “X” — replace with final brand asset | Design |
| **Email delivery** | `RESEND_API_KEY` / SMTP for booking confirmations | Backend |
| **Google Maps** | `NEXT_PUBLIC_GOOGLE_MAPS_KEY` for maps/nearby features | Frontend |
| **Supabase** (if used) | Auth/storage keys in `.env.example` | Auth |
| **Cloudinary** | Image uploads (verification, social) need cloud credentials | Backend |
| **Rate limiting / WAF** | Not configured on API | Security |
| **Error monitoring** | No Sentry/App Insights wired | DevOps |
| **Legal pages** | Privacy policy, Terms of Service, refund policy pages missing | Legal |

### Known acceptable for beta

| Item | Notes |
|---|---|
| Homepage sample data | `RECENT_BOOKINGS`, testimonials, match preview — intentional social proof when API empty |
| Cinematic intro | Skippable; disabled for `prefers-reduced-motion` |
| Unused legacy components | `Hero.tsx`, `layout/Navbar.tsx`, etc. — not imported; safe to delete in cleanup sprint |
| Package itinerary empty state | “Itinerary coming soon” when backend has no itinerary array |
| Demo payment flow | `BookingModal` confirms without Razorpay when `orderRes.demo` |

---

## Required Third-Party API Keys

### Frontend (`.env.example`)

| Variable | Purpose | Required for |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL | All API calls |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Auth (if Supabase path used) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public key | Auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase | Admin operations |
| `ANTHROPIC_API_KEY` | Claude API | AI features (server route) |
| `RAZORPAY_KEY_ID` | Razorpay server | Payment order creation |
| `RAZORPAY_KEY_SECRET` | Razorpay server secret | Payment verification |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay checkout widget | Client checkout |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Google Maps JS API | Maps, nearby |
| `RESEND_API_KEY` | Resend email API | Transactional email |
| `NEXT_PUBLIC_APP_URL` | Canonical app URL | OAuth redirects, emails |

### Backend (`backend/.env.example`)

| Variable | Purpose |
|---|---|
| `PORT` | API port (default 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Access token signing |
| `JWT_EXPIRE` | Access token TTL |
| `REFRESH_TOKEN_SECRET` | Refresh token signing |
| `REFRESH_TOKEN_EXPIRE` | Refresh token TTL |
| `CLOUDINARY_CLOUD_NAME` | Media uploads |
| `CLOUDINARY_API_KEY` | Media uploads |
| `CLOUDINARY_API_SECRET` | Media uploads |
| `RAZORPAY_KEY_ID` | Payments |
| `RAZORPAY_KEY_SECRET` | Payments |
| `ANTHROPIC_API_KEY` | AI itinerary generation |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASS` | SMTP fallback |
| `CLIENT_URL` | CORS + redirect origin |
| `NODE_ENV` | `production` in prod |

---

## Deployment Checklist

### Pre-deploy

- [ ] Set all environment variables in hosting provider (Vercel + Railway/Render/Azure for API)
- [ ] Point `NEXT_PUBLIC_API_URL` to production API URL
- [ ] Set `CLIENT_URL` and `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Run `npm run build` in CI — must pass
- [ ] Run `node backend/src/seed.js` against production MongoDB (once)
- [ ] Replace placeholder SVG icon with brand PNG assets
- [ ] Configure custom domain + SSL
- [ ] Enable CORS on API for production frontend origin only

### Frontend (Next.js 14)

- [ ] Deploy to Vercel / Azure Static Web Apps / similar
- [ ] Set `NODE_ENV=production`
- [ ] Verify redirects: `/itinerary`, `/solo-match`, `/flights`, etc.
- [ ] Smoke test: Home → Packages → Detail → Login → Dashboard
- [ ] Verify middleware auth routes (`/dashboard`, `/chat`, etc.)

### Backend (Express + MongoDB)

- [ ] Deploy API with persistent MongoDB (Atlas recommended)
- [ ] Health check endpoint monitored
- [ ] Socket.io origin restricted to `CLIENT_URL`
- [ ] File upload limits configured on Cloudinary
- [ ] Razorpay webhook URL registered (when live payments enabled)

### Post-deploy

- [ ] Run Lighthouse on production URLs (not localhost)
- [ ] Test booking flow end-to-end with Razorpay test mode
- [ ] Test AI planner with production Anthropic key
- [ ] Verify email delivery (booking confirmation)
- [ ] Submit sitemap to Google Search Console
- [ ] Test PWA install on Android + iOS

---

## Security Checklist

- [ ] Rotate all secrets — never use `.env.example` defaults in production
- [ ] `JWT_SECRET` ≥ 32 random bytes; separate refresh secret
- [ ] MongoDB IP allowlist + authenticated user (not open `0.0.0.0/0` without auth)
- [ ] Razorpay webhook signature verification enabled
- [ ] Rate limit `/api/auth/login`, `/api/ai/*`, `/api/bookings`
- [ ] Helmet / security headers on Express
- [ ] Input validation on all mutation endpoints (existing Zod on frontend; verify backend)
- [ ] Admin routes (`/admin/verification`) — role check server-side
- [ ] No secrets in client bundle (only `NEXT_PUBLIC_*` keys)
- [ ] HTTPS enforced; HSTS on production domain
- [ ] Dependency audit: `npm audit` on frontend + backend
- [ ] File upload MIME + size validation (verification docs)
- [ ] CORS: single production origin, no `*` in production

---

## Backup Checklist

### MongoDB

- [ ] Enable Atlas continuous backup (or daily `mongodump` cron)
- [ ] Test restore procedure quarterly
- [ ] Document connection string recovery via Atlas UI

### Media (Cloudinary)

- [ ] Enable Cloudinary backup / versioning if available
- [ ] Export asset list monthly

### Application

- [ ] Git tags for each production release (`v1.0.0-beta`, etc.)
- [ ] Environment variable backup in secure vault (1Password / Azure Key Vault)
- [ ] Database seed script versioned in `backend/src/seed.js`

### Disaster recovery

- [ ] RTO / RPO documented (suggested: RTO 4h, RPO 24h for beta)
- [ ] Runbook: API down → check MongoDB → check hosting → rollback deploy
- [ ] On-call contact: +91 9240204872 (from site footer)

---

## Intentional Sample Data (Not Bugs)

These surfaces show curated travel content when the API is empty or for marketing:

| Source | Used on |
|---|---|
| `lib/pyt-data.ts` — `RECENT_BOOKINGS`, `TRENDING_DESTINATIONS`, `DURATION_PACKAGES` | Homepage carousels |
| `lib/home-data.ts` — `TESTIMONIALS`, `PREMIUM_DESTINATIONS`, `SAMPLE_ITINERARY` | Homepage sections |
| `TravelMatchPreview.tsx` — sample match profiles | Homepage social proof |
| Unsplash images via `lib/images.ts` | All cards (CDN URLs, not placeholders) |

Replace with live API data once backend is deployed and seeded.

---

## Unused Components (Cleanup — Post-Launch)

Not imported by active routes; safe to remove in a dedicated cleanup PR:

- `components/Hero.tsx`, `HeroSection.tsx`, `HeroSearchBar.tsx` (homepage uses `CinematicHero`)
- `components/home/FeaturedPackages.tsx`, `TrendingDestinations.tsx`, `DestinationSections.tsx`, `FilterTabs.tsx`, `StatsRow.tsx`, `SocialHighlights.tsx`, `DestinationGrid.tsx`, `DurationPackagesSection.tsx`, `TrendingSection.tsx`, `TrustSection.tsx`
- `components/layout/Navbar.tsx`, `MobileDrawer.tsx` (active nav is `components/Navbar.tsx` + `MotionDrawer`)
- `components/PlaceholderPage.tsx`

---

## Next Phase (After This Checklist)

1. Deploy backend + MongoDB Atlas
2. Wire `NEXT_PUBLIC_API_URL` to production
3. Integrate real flight/hotel/activity APIs (or scope reduction)
4. Enable Razorpay live mode + webhooks
5. Add legal pages + error monitoring
6. Replace placeholder brand icons
7. Re-run Lighthouse on production domain — target Performance ≥ 75

---

_Related docs: `LAUNCH_READINESS_REPORT.md`, `MVP_READINESS_REPORT.md`, `PROJECT_STATUS.md`_
