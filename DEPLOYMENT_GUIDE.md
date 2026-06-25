# XOXO Travels — Deployment Guide

_Beta Stabilization & QA Phase · 2026-06-25_

Step-by-step guide to deploy XOXO.TRAVEL to production.

---

## Architecture Overview

```
                    ┌─────────────────────┐
                    │   xoxo.travel       │
                    │   (Vercel / CDN)    │
                    │   Next.js 14        │
                    └──────────┬──────────┘
                               │ HTTPS
                               ▼
                    ┌─────────────────────┐
                    │ api.xoxo.travel     │
                    │ Express + Socket.io │
                    │ (Docker / PaaS)     │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        MongoDB Atlas     Cloudinary        Razorpay
        Resend/SMTP       Amadeus           Google Maps
```

---

## Prerequisites

- [ ] Domain `xoxo.travel` registered
- [ ] MongoDB Atlas account
- [ ] Vercel account (frontend)
- [ ] Railway / Render / Azure Container Apps (backend)
- [ ] Razorpay live account (KYC complete)
- [ ] Resend account (or SMTP credentials)
- [ ] Cloudinary account
- [ ] SSL certificates (handled by Vercel + PaaS)

---

## Step 1 — MongoDB Atlas

1. Create a cluster in **Mumbai (`ap-south-1`)** for lowest latency to Indian users.
2. Create database user with read/write on `xoxo-travels`.
3. Network Access → add API server IP (or `0.0.0.0/0` temporarily during setup).
4. Copy connection string:
   ```
   mongodb+srv://<user>:<password>@cluster.mongodb.net/xoxo-travels?retryWrites=true&w=majority
   ```
5. Enable **Cloud Backup** (continuous).
6. SSH to API or run locally against Atlas:
   ```bash
   MONGODB_URI="mongodb+srv://..." npm run seed
   ```
7. Lock network access to API server IP only.

---

## Step 2 — Backend Deployment

### Option A: Docker (recommended)

```bash
cd backend
cp .env.production.example .env
# Fill all values (see Environment Variables below)

docker build -t xoxo-api .
docker run -d \
  --name xoxo-api \
  -p 5000:5000 \
  --env-file .env \
  xoxo-api
```

### Option B: Railway / Render

1. Connect GitHub repo, set root directory to `backend/`.
2. Build command: `npm ci --omit=dev`
3. Start command: `node src/server.js`
4. Add all environment variables from `.env.production.example`.
5. Enable HTTPS (automatic on Railway/Render).
6. Set custom domain: `api.xoxo.travel`.

### Post-deploy verification

```bash
curl https://api.xoxo.travel/api/health
# Expected: { "success": true, "database": "connected" }

API_URL=https://api.xoxo.travel npm run qa
# Expected: 45/45 tests pass
```

---

## Step 3 — Frontend Deployment (Vercel)

1. Import GitHub repo to Vercel.
2. Framework: **Next.js** (auto-detected).
3. Root directory: `xoxo-travels/` (or repo root).
4. Set environment variables:

```env
NEXT_PUBLIC_API_URL=https://api.xoxo.travel/api
NEXT_PUBLIC_SOCKET_URL=https://api.xoxo.travel
NEXT_PUBLIC_APP_URL=https://xoxo.travel
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIza...
```

5. Deploy → assign custom domain `xoxo.travel`.
6. Add `www.xoxo.travel` redirect to apex.

### Build verification

```bash
npm run build
# Must complete with 0 errors, 20 routes
```

---

## Step 4 — Environment Variables

### Backend (required)

| Variable | Example | Notes |
|---|---|---|
| `NODE_ENV` | `production` | |
| `PORT` | `5000` | |
| `TRUST_PROXY` | `true` | Behind reverse proxy |
| `MONGODB_URI` | `mongodb+srv://...` | Atlas connection |
| `JWT_SECRET` | 64-char hex | `openssl rand -hex 32` |
| `REFRESH_TOKEN_SECRET` | 64-char hex | Different from JWT |
| `CLIENT_URL` | `https://xoxo.travel` | |
| `ALLOWED_ORIGINS` | `https://www.xoxo.travel` | Comma-separated |
| `RAZORPAY_KEY_ID` | `rzp_live_...` | |
| `RAZORPAY_KEY_SECRET` | `...` | |
| `RAZORPAY_WEBHOOK_SECRET` | `...` | From Razorpay dashboard |
| `RESEND_API_KEY` | `re_...` | Or use SMTP vars |
| `EMAIL_FROM` | `XOXO Travels <noreply@xoxo.travel>` | |
| `CLOUDINARY_CLOUD_NAME` | `...` | |
| `CLOUDINARY_API_KEY` | `...` | |
| `CLOUDINARY_API_SECRET` | `...` | |

### Backend (recommended)

| Variable | Purpose |
|---|---|
| `AMADEUS_API_KEY` | Live flight/hotel/activity search |
| `AMADEUS_API_SECRET` | |
| `AMADEUS_ENV` | `production` when live |
| `GOOGLE_MAPS_API_KEY` | Server-side Places proxy |
| `ANTHROPIC_API_KEY` | AI Planner |
| `SUPPORT_EMAIL` | `support@xoxo.travel` |
| `VISA_DESK_EMAIL` | `visa@xoxo.travel` |
| `LOG_LEVEL` | `info` |

Full template: `backend/.env.production.example`

---

## Step 5 — SSL & Domain

| Domain | Points to | SSL |
|---|---|---|
| `xoxo.travel` | Vercel | Auto (Let's Encrypt) |
| `www.xoxo.travel` | Vercel redirect | Auto |
| `api.xoxo.travel` | Backend PaaS | Auto |

### DNS records (example)

```
xoxo.travel       A/CNAME → Vercel
www.xoxo.travel   CNAME   → cname.vercel-dns.com
api.xoxo.travel   CNAME   → your-railway-app.up.railway.app
```

---

## Step 6 — Razorpay Webhook

1. Razorpay Dashboard → Webhooks → Add URL:
   ```
   https://api.xoxo.travel/api/payments/webhook
   ```
2. Events: `payment.captured`, `refund.processed`
3. Copy webhook secret → `RAZORPAY_WEBHOOK_SECRET`
4. Test with Razorpay test payment.

---

## Step 7 — Email (Resend)

1. Add domain `xoxo.travel` in Resend.
2. Add DNS records (SPF, DKIM, DMARC).
3. Set `RESEND_API_KEY` and `EMAIL_FROM=noreply@xoxo.travel`.
4. Send test booking confirmation email.

---

## Step 8 — Health Monitoring

### Uptime checks (configure on UptimeRobot / Better Uptime)

| Endpoint | Interval | Alert if |
|---|---|---|
| `GET https://api.xoxo.travel/api/health` | 5 min | status ≠ 200 or `database` ≠ connected |
| `GET https://xoxo.travel` | 5 min | status ≠ 200 |

### Log monitoring

- Backend logs JSON to stdout (Winston) — pipe to your PaaS log aggregator.
- Watch for `Unhandled rejection` and `Email send failed`.

---

## Step 9 — Backup Strategy

| Asset | Method | Frequency |
|---|---|---|
| MongoDB | Atlas continuous backup | Automatic |
| Cloudinary media | Cloudinary backup | Weekly export |
| Env secrets | 1Password / Azure Key Vault | On change |
| Git releases | Tags `v1.0.0-beta` | Per deploy |

See `OPERATIONS_GUIDE.md` for restore procedures.

---

## Step 10 — Go-Live Checklist

- [ ] `API_URL=https://api.xoxo.travel npm run qa` — 45/45
- [ ] Frontend loads at `https://xoxo.travel`
- [ ] Login → dashboard → book → pay (test mode)
- [ ] Confirmation email received
- [ ] Socket.io notifications work
- [ ] Disable or rotate demo/admin test accounts
- [ ] Remove `demo@` hint from production login (already dev-only)

---

_Related: `OPERATIONS_GUIDE.md`, `PRODUCTION_CHECKLIST.md`, `DEPLOYMENT_REPORT.md`_
