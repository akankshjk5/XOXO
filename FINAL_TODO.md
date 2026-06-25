# XOXO.TRAVEL — Final Pre-Launch TODO

_Derived from `LAUNCH_CANDIDATE_REPORT.md` · Launch Candidate phase · 2026-06-25_

**Rule:** No new business features unless marked **blocker**. Focus on compliance, copy, SEO, keys, and polish.

---

## P0 — Launch blockers (must complete before public launch)

### Legal & compliance

- [ ] **Create `/privacy`** — Privacy Policy (data collected, cookies, third parties, DPDP/GDPR contact)
- [ ] **Create `/terms`** — Terms & Conditions (booking terms, liability, governing law)
- [ ] **Create `/refund`** — Refund & Cancellation Policy (align with Razorpay + package rules)
- [ ] **Create `/cookies`** — Cookie Policy (essential vs analytics cookies)
- [ ] **Add footer legal links** — Privacy · Terms · Refund · Cookies (`Footer.tsx`)
- [ ] **Signup terms checkbox** — "I agree to Terms & Privacy" with links (`signup/page.tsx`)
- [ ] **Legal review** — Have counsel approve all four pages before go-live

### Infrastructure & payments

- [ ] **Deploy backend** to production (see `DEPLOYMENT_GUIDE.md`)
- [ ] **MongoDB Atlas** — production cluster; run seed once; remove/disable demo user in prod
- [ ] **Razorpay live keys** — `rzp_live_*` on server + `NEXT_PUBLIC_RAZORPAY_KEY_ID` if needed
- [ ] **Razorpay webhook** — `POST /api/payments/webhook` on production URL + `RAZORPAY_WEBHOOK_SECRET`
- [ ] **Auth secrets** — `JWT_SECRET`, `REFRESH_TOKEN_SECRET` (≥32 chars, not defaults)
- [ ] **Resend** — verify `xoxo.travel` domain; set `EMAIL_FROM=noreply@xoxo.travel`
- [ ] **Cloudinary** — all three vars (local `/uploads` not persistent in containers)

### Trust & demo removal (blocker if paying users)

- [ ] **Remove demo payment user message** — Replace `"Booking confirmed! (demo payment)"` with standard copy; gate demo path to non-production only (`BookingModal.tsx`)
- [ ] **Verify Razorpay live E2E** — ₹1 test payment on staging before go-live

---

## P1 — High priority (complete before marketing push)

### SEO & sharing

- [ ] **`metadataBase`** in `app/layout.tsx` from `NEXT_PUBLIC_APP_URL`
- [ ] **Default OG image** — produce `public/og/og-default.png` (1200×630) per `MARKETING_ASSETS.md`
- [ ] **Wire Open Graph + Twitter** in root metadata
- [ ] **`app/robots.ts`** — allow `/`, disallow `/admin`, `/api`
- [ ] **`app/sitemap.ts`** — static routes + dynamic packages/destinations from API
- [ ] **`generateMetadata`** on `/packages/[id]` and `/destinations/[slug]`
- [ ] **JSON-LD** — `Organization` + `WebSite` on root; `Product` on package detail

### Brand consistency

- [ ] **Unify traveller stat** — pick one: `2 Lakh+` OR `150k+`; update `pyt-data.ts`, hero, footer, signup
- [ ] **Unify rating** — pick `4.6` or `4.8`; align `CinematicHero`, `WhyChooseUs`, `home-data.ts`
- [ ] **Fix testimonial attribution** — Maldives quote → correct name/destination (`WhyChooseUs.tsx` L85)
- [ ] **Canonical brand name** — document: `XOXO.TRAVEL` wordmark in hero/intro; `XOXO Travels` in legal/metadata
- [ ] **Replace dev error copy** — `"Couldn't load packages. Is the API running?"` → user-friendly message (`PackagesBrowser.tsx`)

### UX — conversion path

- [ ] **Post-payment redirect** — send to `/dashboard?tab=bookings` or dedicated `/booking/confirmed` view
- [ ] **Booking confirmation copy** — show booking ref, amount, date (toast or page)
- [ ] **Label static social proof** — add "Sample bookings" or connect to real data for Recently Booked section
- [ ] **Recently Booked deep links** — link cards to real package IDs when available

### Analytics & monitoring

- [ ] **Choose analytics** — GA4 or Plausible (privacy-friendly)
- [ ] **Add script** to `app/layout.tsx` with env-gated production-only load
- [ ] **Conversion events** — `signup`, `begin_checkout`, `purchase`
- [ ] **Error monitoring** — Sentry or Azure App Insights on frontend + backend

### PWA & icons

- [ ] **PNG maskable icons** — 192×192, 512×512 in `manifest.json`
- [ ] **favicon.ico** + apple-touch-icon 180×180
- [ ] **Replace placeholder `icon.svg`** with final brand mark
- [ ] **Intro video files** — `intro.mp4` + `intro.webm` in `public/videos/`

---

## P2 — Medium priority (first week post-launch)

### UX polish

- [ ] **Cancel booking confirmation** — "Are you sure?" dialog (`DashboardClient.tsx`)
- [ ] **Signup phone alignment** — require phone on signup OR relax booking phone rule
- [ ] **Package detail z-index** — raise sticky CTA above mobile nav or add bottom padding
- [ ] **`PlanWithXOXO` loading fallback** — skeleton while `ssr: false` loads
- [ ] **Home destination API failure** — show error state instead of silent empty (`HomeDestinationSections.tsx`)
- [ ] **Custom `app/not-found.tsx`** — branded 404 with links to Packages / Home

### SEO depth

- [ ] **Page descriptions** on social routes (`/match`, `/chat`, `/dashboard`, etc.)
- [ ] **`noindex`** on `/admin/*`, `/dashboard`, `/chat`, `/login`, `/signup`
- [ ] **Homepage-specific metadata** — distinct from generic root title
- [ ] **Submit sitemap** to Google Search Console after deploy

### Content & copy

- [ ] **Remove or qualify award claim** — "Best International Holiday Brand" (`WhyChooseUs.tsx`)
- [ ] **Itinerary empty state** — softer copy or hide section when empty
- [ ] **Hide Insurance/Visa add-ons** on booking step 3 until live (reduce confusion)
- [ ] **Align manifest description** with positioning (`manifest.json`)

### Code hygiene

- [ ] **Delete unused legacy components** — `Hero.tsx`, `layout/Navbar.tsx`, old home sections using `/package/` paths
- [ ] **Remove or archive `lib/mock-data.ts`** if unused
- [ ] **Rename `pyt-*` CSS** to `xoxo-*` (cosmetic; low urgency)

---

## P3 — Post-launch / optional

- [ ] Guest checkout or inline login in booking modal
- [ ] Dedicated `/flights`, `/hotels`, `/activities` pages (remove 302 redirects)
- [ ] Live inventory UI wired to `inventoryAPI`
- [ ] Service worker / offline PWA
- [ ] A/B test intro on/off for returning users
- [ ] Lighthouse re-audit on production CDN URLs
- [ ] Press kit + OG variants per page (`MARKETING_ASSETS.md`)

---

## Environment checklist (production `.env`)

### Backend

```env
NODE_ENV=production
MONGODB_URI=
JWT_SECRET=
REFRESH_TOKEN_SECRET=
CLIENT_URL=https://xoxo.travel
ALLOWED_ORIGINS=https://xoxo.travel
AMADEUS_API_KEY=
AMADEUS_API_SECRET=
AMADEUS_ENV=production
GOOGLE_MAPS_API_KEY=
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
RESEND_API_KEY=
EMAIL_FROM=XOXO Travels <noreply@xoxo.travel>
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ANTHROPIC_API_KEY=
```

### Frontend

```env
NEXT_PUBLIC_API_URL=https://api.xoxo.travel/api
NEXT_PUBLIC_APP_URL=https://xoxo.travel
NEXT_PUBLIC_SOCKET_URL=https://api.xoxo.travel
```

---

## Verification before go-live

```bash
# API
cd backend && API_URL=https://api.xoxo.travel npm run qa   # expect 53/53

# Frontend
npm run build                                                 # expect 0 errors

# Manual smoke
# 1. First visit → intro → skip → hero
# 2. Browse packages → open detail → book → pay (live ₹1)
# 3. Confirm email received
# 4. Dashboard → My Bookings shows confirmed booking
# 5. Share homepage URL — verify OG preview
# 6. Footer legal links load
# 7. Mobile: package detail sticky CTA + bottom nav
```

---

## Ownership matrix

| Area | Suggested owner |
|------|-----------------|
| Legal pages | Legal / founder |
| OG images + favicon | Design |
| SEO (sitemap, metadata, JSON-LD) | Frontend |
| Razorpay live + webhook | Payments / backend |
| Deploy + secrets | DevOps |
| Analytics | Growth / marketing |
| Copy & brand alignment | Product / marketing |
| Intro video assets | Marketing |

---

## Status tracking

| Phase | Target | Status |
|-------|--------|--------|
| Launch Candidate audit | 2026-06-25 | ✅ Complete |
| P0 legal + deploy | — | ⬜ Not started |
| P1 SEO + brand | — | ⬜ Not started |
| GA launch | — | ⬜ Blocked on P0 |

_Update this file as items are completed. Do not add new product features during LC phase._
