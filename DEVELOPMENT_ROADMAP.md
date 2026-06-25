# XOXO Travels — Development Roadmap

_Audit date: 2026-06-24_

Sequenced plan to take the project from its current state (solid auth + catalog
foundations) to the full product vision. Phases are ordered by dependency and
business value. No code here — this is the plan.

---

## Guiding Principles
- **Unblock revenue first:** package booking + payments before peripheral verticals.
- **Build foundations once:** Payments ledger, Notifications, KYC, and Upload (Cloudinary) are shared dependencies — build them before features that need them.
- **Each feature ships full-stack:** model → controller → route (mounted) → API helper → UI → tested at 375px → console clean.

---

## Phase 0 — Stabilize Foundations (1 sprint) · MVP
_Fix what's inconsistent before adding scope._
- Unify auth: migrate **signup** to JWT backend; remove/retire Supabase client + middleware.
- Frontend auth guard: bootstrap `fetchMe()` on load; protect `/dashboard`, `/bookings`, etc.; redirect logic.
- Configure secrets in `.env`: `ANTHROPIC_API_KEY`, Razorpay, Cloudinary, SMTP.
- Wire homepage carousels to live backend data (replace `lib/pyt-data.ts` mock).
- Add global error boundary + 404/500 pages.

**Dependencies:** none. **Unlocks:** everything below.

---

## Phase 1 — Core Commerce / MVP (2–3 sprints) · MVP
_The minimum to actually sell a trip._
1. **Booking module** — `Booking` controller/routes (create, my, byId, cancel, admin status); wire detail-page "Book Now" → real multi-step flow (dates → travelers → add-ons → pay).
2. **Payments (Razorpay)** — payment controller/routes (create-order, verify, refund); frontend checkout; booking status updates; confirmation email (Nodemailer).
3. **Reviews & Ratings** — controller/routes; render real reviews on package detail; recompute package rating.
4. **Wishlist** — user wishlist routes; heart button + toast; dashboard wishlist tab.
5. **User Dashboard** — `/dashboard`: profile, booking history, saved itineraries, rewards balance, avatar upload (Cloudinary → user controller).
6. **AI Itinerary Builder UI** — `/ai-planner` wizard using existing `/ai/itinerary`; **Save Itinerary** (Itinerary routes); fixes Trippie "full screen" dead link.
7. **Trippie production** — real Claude key, server streaming, clickable destination cards.
8. **Visa Assistance (MVP)** — `/visa` page + inquiry model/route + email; AI visa tips.

**Dependencies:** Phase 0. **Unlocks:** Admin booking mgmt, refunds, rewards.

---

## Phase 2 — Marketplace, Social & Safety / V2 (4–6 sprints) · V2
_Differentiators that make it a "super-app."_

**Shared foundations first:**
- **Notification Center** (model + Socket.io + bell UI) — needed by chat, social, SOS.
- **KYC + Upload pipeline** (Cloudinary, admin review) — needed by verification, guides, safety.
- **Payments ledger / Wallet** — needed by rewards, referrals, host payouts, refunds.

**Then features:**
1. **Local Guides Marketplace** — Guide controller/routes, listing/profile/booking UI, host earnings.
2. **Real-time Chat (1:1 + group)** — chat controller/routes + Socket.io client + `/chat` UI (server handlers already exist).
3. **Social layer** — Travel Feed/Posts, Friend Requests, Group Travel Community, Traveler Verification + Trusted Badge (trustScore).
4. **Solo Matchmaking + Traveler Nearby** — matching engine over `TravelerMatch`, geospatial index, consent/privacy.
5. **Safety** — Emergency Contacts, Emergency SOS, Live Location Sharing, Female Safe Travel Mode.
6. **Payments extensions** — Wallet, Rewards earn/redeem, Referral system, Refund management.
7. **Travel Locker** — secure document storage.
8. **Insurance + Group Departures** — partner/insurer integration; seat inventory.
9. **AI** — Budget Planner, Destination Recommender, Travel Matching Engine.
10. **Admin Panel** — User mgmt, Guide verification, Booking mgmt, Revenue analytics.

**Dependencies:** Phase 1 + the three shared foundations above.

---

## Phase 3 — Expansion Verticals / V3 (ongoing) · V3
_High-effort or partner-gated; build after product-market fit._
- **Booking verticals:** Flights (Amadeus/Sabre), Hotels, Bus, Train (IRCTC), Cruise, Car Rental, Taxi.
- **Experiences marketplace:** Food Tours, Adventure Activities (host onboarding).
- **Community comms:** Voice Calling, Video Calling (WebRTC/Twilio), Auto Translation.
- **Advanced safety/AI:** Emergency Assistant, Embassy Information.
- **Payments:** Split Payments for Groups.
- **Admin:** Fraud Detection, Content Moderation.

**Dependencies:** mature Payments, KYC, Booking, and Notifications from Phase 2.

---

## Dependency Graph (high level)

```
Auth (done) ─┬─> Booking ──> Payments ──> Refunds / Wallet / Rewards / Referral
             ├─> Reviews
             ├─> Wishlist / Dashboard / Saved Itineraries
             └─> AI (Trippie, Itinerary, Visa)

Upload(Cloudinary) ──> KYC ──> Verification / Trusted Badge / Female Safe Mode
                          └──> Guides Marketplace ──> Host Earnings / Experiences

Notifications ──> Chat ──> Group Chat ──> Voice/Video/Translation
              └─> Social Feed / Friend Requests / SOS

Geolocation ──> Traveler Nearby / Live Location / Matchmaking

Payments Ledger ──> Admin Revenue Analytics ──> Fraud Detection
```

---

## Suggested MVP Definition of Done
A user can: sign up/login (JWT), browse & filter packages, view detail, **book and pay (Razorpay)**, receive a confirmation email, see bookings + wishlist + saved AI itineraries in a dashboard, leave a review, and chat with Trippie (real AI). Admin can view/manage bookings.

| Milestone | Phases | Rough effort |
|---|---|---|
| MVP launch | 0 + 1 | 3–4 sprints |
| Super-app (V2) | 2 | 4–6 sprints |
| Full vision (V3) | 3 | ongoing, partner-dependent |
