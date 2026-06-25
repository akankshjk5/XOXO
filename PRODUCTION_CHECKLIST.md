# XOXO Travels — Production Checklist

_Production Integration Phase · 2026-06-25_

Use this checklist to take XOXO.TRAVEL from beta-ready to live production.

---

## Phase 1 — Production Infrastructure

### MongoDB Atlas
- [ ] Create Atlas cluster (region: Mumbai `ap-south-1` recommended)
- [ ] Create database user with least privilege
- [ ] Set `MONGODB_URI` in API environment
- [ ] Run `npm run seed` once against production DB
- [ ] Enable continuous backup
- [ ] Restrict network access to API server IP

### API Deployment
- [ ] Deploy from `backend/Dockerfile`
- [ ] Set `NODE_ENV=production`
- [ ] Set `TRUST_PROXY=true`
- [ ] Set `CLIENT_URL=https://xoxo.travel`
- [ ] Set `ALLOWED_ORIGINS=https://www.xoxo.travel`
- [ ] Verify `GET /api/health` returns `database: connected`
- [ ] HTTPS enabled on API domain (platform TLS)

### Environment Variables (API)

| Variable | Required | Notes |
|---|---|---|
| `MONGODB_URI` | ✅ | Atlas connection string |
| `JWT_SECRET` | ✅ | ≥ 32 random bytes |
| `REFRESH_TOKEN_SECRET` | ✅ | ≥ 32 random bytes, different from JWT |
| `CLIENT_URL` | ✅ | Frontend HTTPS URL |
| `CLOUDINARY_*` | ✅ | Image uploads |
| `RESEND_API_KEY` or `EMAIL_*` | ✅ | Transactional email |
| `RAZORPAY_*` | ✅ | Live payments |
| `RAZORPAY_WEBHOOK_SECRET` | ✅ | Webhook verification |
| `AMADEUS_*` | Recommended | Live flight/hotel/activity |
| `GOOGLE_MAPS_API_KEY` | Recommended | Places autocomplete |
| `ANTHROPIC_API_KEY` | Recommended | AI planner |

Template: `backend/.env.production.example`

### Logging & Monitoring
- [x] Winston structured logging
- [x] Request ID correlation (`X-Request-Id`)
- [x] Morgan HTTP logs → Winston
- [ ] Sentry / App Insights (recommended)
- [ ] Uptime monitor on `/api/health`

### CORS & HTTPS
- [x] Production origin whitelist
- [x] `credentials: true` for cookies
- [x] Trust proxy for reverse proxy HTTPS
- [ ] Verify no CORS errors from production frontend

---

## Phase 2 — Real Travel Inventory

### Amadeus (Flights, Hotels, Activities)
- [ ] Create Amadeus developer account
- [ ] Set `AMADEUS_API_KEY` + `AMADEUS_API_SECRET`
- [ ] Start with `AMADEUS_ENV=test`, then switch to `production`
- [x] Service interfaces implemented (`src/services/`)
- [x] API routes live at `/api/inventory/*`
- [x] Mock fallback when keys absent
- [ ] Test: `GET /api/inventory/flights?origin=DEL&destination=BKK&departureDate=2026-09-01`

### Google Maps / Places
- [ ] Enable Places API in Google Cloud Console
- [ ] Set `GOOGLE_MAPS_API_KEY` on API server
- [ ] Restrict key to API server IP
- [x] Server-side proxy at `/api/inventory/places/*`
- [ ] Set `NEXT_PUBLIC_GOOGLE_MAPS_KEY` for client maps widgets

### Visa
- [x] Static visa data for 13 destinations
- [x] Inquiry persistence (`VisaInquiry` model)
- [x] Email to visa desk on inquiry
- [ ] Expand visa country database or integrate external source

### Frontend integration
- [x] `inventoryAPI` added to `lib/api.ts`
- [ ] Wire search UI to inventory endpoints (when pages are built)
- [ ] Remove `/flights` → `/packages` redirect when flights page ships

---

## Phase 3 — Production Payments

### Razorpay Setup
- [ ] Activate Razorpay live account (KYC complete)
- [ ] Set `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` on API
- [ ] Set `NEXT_PUBLIC_RAZORPAY_KEY_ID` on frontend
- [ ] Register webhook: `https://api.xoxo.travel/api/payments/webhook`
- [ ] Set `RAZORPAY_WEBHOOK_SECRET`
- [ ] Subscribe to events: `payment.captured`, `refund.processed`

### Payment Flow Verification
- [x] Order creation
- [x] Client-side signature verification
- [x] Webhook handler with idempotency
- [x] Refund endpoint
- [x] HTML invoice generation
- [x] Confirmation email on payment
- [ ] Test live ₹1 payment end-to-end
- [ ] Test refund flow in Razorpay dashboard

---

## Phase 4 — Notifications

### Email
- [x] Resend integration (preferred)
- [x] SMTP fallback
- [x] Booking confirmation template
- [x] Payment confirmation template
- [x] Social notification emails (match, friend, group)
- [x] Visa inquiry to desk
- [ ] Verify deliverability (SPF/DKIM on domain)
- [ ] Set `EMAIL_FROM=noreply@xoxo.travel`

### In-app + Real-time
- [x] Socket.io notifications
- [x] `Notification` model persistence
- [ ] Verify push on match request, friend request, group invite in production

---

## Phase 5 — Security

- [x] Production env validation on boot
- [x] Rate limiting (auth, AI, payments, global)
- [x] Helmet security headers
- [x] JWT secret strength check
- [x] Payment signature verification
- [x] Webhook HMAC verification
- [x] Error handler hides stack in production
- [ ] Rotate all secrets before go-live
- [ ] MongoDB IP allowlist
- [ ] `npm audit` in CI
- [ ] Review `SECURITY_AUDIT.md` remediation items

---

## Phase 6 — Deployment Verification

### Automated
```bash
# After deploy
API_URL=https://api.xoxo.travel npm run smoke
```

Expected: **16/16 tests pass**

### Manual smoke tests

| Flow | Steps | Pass |
|---|---|---|
| Homepage | Load, cinematic intro skip, sections render | [ ] |
| Destinations | Browse, filter, open detail | [ ] |
| Packages | Browse, open detail, wishlist | [ ] |
| Booking | Login → book → pay (test/live) → dashboard | [ ] |
| AI Planner | Generate itinerary → save | [ ] |
| Social | Match discover, friend request, chat message | [ ] |
| Payments | Razorpay checkout → confirmation email | [ ] |
| Notifications | In-app bell + email received | [ ] |
| Admin | Verification queue (admin login) | [ ] |

### Frontend deploy
- [ ] `NEXT_PUBLIC_API_URL` → production API
- [ ] `NEXT_PUBLIC_SOCKET_URL` → production API (wss:// if supported)
- [ ] `npm run build` passes
- [ ] Custom domain + SSL on Vercel

---

## Quick Reference — Deploy Commands

```bash
# Backend
cd backend
cp .env.production.example .env
# Edit .env with production values
docker compose up --build -d
docker compose exec api npm run seed
API_URL=http://localhost:5000 npm run smoke

# Frontend
cd ..
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL
npm run build
```

---

## Sign-off

| Role | Name | Date | Signed |
|---|---|---|---|
| Engineering | | | [ ] |
| DevOps | | | [ ] |
| Product | | | [ ] |

---

_Previous docs: `LAUNCH_CHECKLIST.md` (beta stabilization), `DEPLOYMENT_REPORT.md`, `SECURITY_AUDIT.md`_
