# XOXO Travels — Project Handover

Production-ready travel agency website with admin dashboard. Delivered within agreed client scope (₹20,000).

**Handover date:** June 2026  
**Stack:** Next.js 14 · Express · MongoDB Atlas · Railway (API) · Vercel (frontend)

---

## Live URLs

| Service | URL | Notes |
|---------|-----|--------|
| **Website (Vercel)** | Set `NEXT_PUBLIC_APP_URL` in Vercel | e.g. `https://your-app.vercel.app` |
| **API (Railway)** | Set in `NEXT_PUBLIC_API_URL` | e.g. `https://xoxo-production-2503.up.railway.app/api` |
| **Health check** | `{API_BASE}/api/health` | Should return `success: true`, `database: connected` |
| **Payment status** | `{API_BASE}/api/payments/status` | `demo` until Razorpay keys are added |

Replace placeholders with your deployed URLs after first deploy.

---

## Login credentials (seeded)

Created by `npm run seed` in the backend. **Change passwords before public launch.**

| Role | Email | Password | After login |
|------|-------|----------|-------------|
| **Admin** | `admin@xoxotravels.com` | `admin123` | Redirects to `/admin` |
| **Traveler (demo)** | `demo@xoxotravels.com` | `demo123` | Redirects to `/dashboard` |

To re-seed locally or on Railway:

```bash
cd backend && npm run seed
```

---

## Features delivered

### Public website
- Homepage with destination and package discovery
- Package listing with filters (Solo, Couple, Family, Friends, **Corporate**)
- Package detail pages with reviews, itinerary, booking modal
- Destination listing and detail pages
- AI Trip Planner (`/ai-planner`)
- Login / Signup with role-based redirects
- User dashboard (bookings, wishlist, itineraries, wallet, profile)
- Booking flow: browse → book → demo/live payment → confirmation → dashboard
- Corporate travel category with dedicated fields and detail panel
- Responsive layout (mobile-first)

### Admin dashboard (`/admin`)
- Dashboard with stats, charts, recent activity, quick actions
- **Packages** — CRUD, search, filters, image upload, publish/featured/trending/corporate/visa-free
- **Destinations** — CRUD, search, image upload, popular/active flags
- **Bookings** — view, search, status updates (pending/confirmed/cancelled)
- **Users** — view, search, role, block/unblock
- **Reviews** — approve, reject, delete
- **Coupons** — CRUD with expiry and discount
- **Settings** — website name, logo, contact, social links

### Backend API
- JWT authentication (access + refresh cookies)
- MongoDB models for packages, destinations, bookings, users, reviews, coupons, settings
- Demo payment mode (no Razorpay keys required)
- Live Razorpay when client adds keys (see `PAYMENT_SETUP.md`)
- Booking confirmation email (when email provider is configured)

### Explicitly out of scope
Flight/hotel booking APIs, CRM, loyalty program, multi-language, vendor portal, mobile app, WhatsApp automation, accounting module.

---

## Railway environment variables (required)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Min 32 chars (`openssl rand -hex 32`) |
| `REFRESH_TOKEN_SECRET` | Yes | Min 32 chars |
| `CLIENT_URL` | Yes | Vercel app URL (e.g. `https://your-app.vercel.app`) |
| `ALLOWED_ORIGINS` | Recommended | Comma-separated frontend origins for CORS |
| `NODE_ENV` | Yes | `production` |
| `PORT` | Auto | Railway sets this |

### Railway — optional

| Variable | Purpose |
|----------|---------|
| `RAZORPAY_KEY_ID` | Live/test payments |
| `RAZORPAY_KEY_SECRET` | Payment verification |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signature |
| `RESEND_API_KEY` or SMTP vars | Transactional email |
| `CLOUDINARY_*` | Image uploads (or local `/uploads`) |
| `SEED_IF_EMPTY` | Auto-seed empty database on boot |

---

## Vercel environment variables (required)

| Variable | Example | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-api.up.railway.app/api` | Backend API with `/api` suffix |
| `NEXT_PUBLIC_SOCKET_URL` | `https://your-api.up.railway.app` | Socket.io (no `/api`) |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Public site URL |
| `API_PROXY_TARGET` | `https://your-api.up.railway.app` | Optional rewrite target |

Razorpay keys are **not** required on Vercel — payments run through the Railway API.

---

## Payment setup

The site runs in **Demo Payment Mode** until the client adds Razorpay credentials on Railway.

Full instructions: **[PAYMENT_SETUP.md](./PAYMENT_SETUP.md)**

Quick steps:
1. Add `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` on Railway
2. Redeploy API
3. Register webhook: `https://YOUR-API/api/payments/webhook`
4. Verify: `GET /api/payments/status` → `"mode": "test"` or `"live"`

---

## Deployment checklist

- [ ] MongoDB Atlas cluster created; IP allowlist includes Railway
- [ ] Railway API deployed; `/api/health` returns `database: connected`
- [ ] JWT secrets set on Railway (not default placeholders)
- [ ] Vercel frontend deployed with correct `NEXT_PUBLIC_API_URL`
- [ ] `CLIENT_URL` and `ALLOWED_ORIGINS` match Vercel domain
- [ ] Database seeded (`npm run seed` or auto-seed on empty DB)
- [ ] Admin login tested → lands on `/admin`
- [ ] Demo user booking tested → confirmation page → dashboard
- [ ] Admin passwords rotated before go-live
- [ ] Razorpay keys added when ready to accept payments
- [ ] Email provider configured for booking confirmations

---

## Verify locally

```bash
# Frontend
npm run build
npm run lint

# Backend (separate terminal)
cd backend && npm run dev

# Seed
cd backend && npm run seed
```

---

## Key documentation

| Document | Purpose |
|----------|---------|
| [PAYMENT_SETUP.md](./PAYMENT_SETUP.md) | Razorpay client activation |
| [GITHUB_DEPLOYMENT_GUIDE.md](./GITHUB_DEPLOYMENT_GUIDE.md) | Full deploy walkthrough |
| [README.md](./README.md) | Dev setup |
| `backend/.env.example` | Local backend env template |
| `.env.example` | Local frontend env template |

---

## Known limitations

1. **Demo payments** — Bookings confirm without real money until Razorpay is configured.
2. **Email** — Confirmation emails require Resend or SMTP on Railway; otherwise bookings still confirm in-app.
3. **Social login** — UI present; OAuth not wired (password login only).
4. **Password reset** — “Forgot password” shows coming-soon toast; backend endpoint exists but no frontend flow.
5. **Travel add-ons** — Insurance and visa add-ons in booking modal are marked “Coming soon” (not charged).
6. **Admin header search** — Decorative; package search is in the Packages module.
7. **Seed passwords** — Default `admin123` / `demo123` are for demo only; rotate for production.
8. **Extra routes** — Some legacy pages (community, match, transport) exist from earlier phases but are not part of the client scope nav.

---

## Support contacts (project)

For deployment issues, refer to Railway and Vercel dashboards first. API logs are available in Railway → Deployments → Logs.

---

*This document is the single handover reference for the client delivery.*
