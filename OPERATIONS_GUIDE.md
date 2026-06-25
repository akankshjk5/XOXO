# XOXO Travels — Operations Guide

_Beta Stabilization & QA Phase · 2026-06-25_

Day-2 operations runbook for the XOXO.TRAVEL production stack.

---

## Service Inventory

| Service | URL | Port | Health Check |
|---|---|---|---|
| Frontend | `https://xoxo.travel` | 443 | HTTP 200 on `/` |
| API | `https://api.xoxo.travel` | 443→5000 | `GET /api/health` |
| MongoDB | Atlas cluster | 27017 | Atlas dashboard |
| Socket.io | Same as API | 443 | Connect + `join` event |

---

## Daily Operations

### Morning health check (5 min)

```bash
# API health
curl -s https://api.xoxo.travel/api/health | jq .

# Expected:
# { "success": true, "database": "connected", "environment": "production" }

# Automated regression
API_URL=https://api.xoxo.travel npm run qa
```

### Log review

Check backend logs for:
- `Email send failed` — Resend/SMTP issue
- `Amadeus API error` — inventory provider down
- `Unhandled rejection` — uncaught async error
- `CORS blocked` — misconfigured frontend origin

---

## Deployment Procedure

### Backend rolling deploy

1. Merge changes to `main`.
2. PaaS auto-deploys from Git (or manual Docker push).
3. Verify health endpoint.
4. Run smoke tests against production URL.
5. Monitor logs for 15 minutes.

### Frontend deploy

1. Vercel auto-deploys on push to `main`.
2. Verify `https://xoxo.travel` loads.
3. Check browser console for API connection errors.
4. Test login flow.

### Database migrations

- No formal migration tool yet; schema changes are additive via Mongoose.
- For destructive changes: backup Atlas first, then deploy API.

---

## Incident Response

### API down (health check failing)

1. Check PaaS dashboard — is container running?
2. Check Atlas — is cluster paused or unreachable?
3. Check recent deploy — rollback if needed.
4. Review logs for `MongoDB connection error`.
5. **RTO target:** 30 minutes.

### Database connection lost

1. Atlas → Network Access — verify API IP allowlisted.
2. Atlas → Cluster → check status (maintenance?).
3. Restart API container.
4. If credentials rotated, update `MONGODB_URI` in env.

### Payments failing

1. Check Razorpay dashboard for outages.
2. Verify `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` are live keys.
3. Check webhook delivery logs in Razorpay.
4. Bookings stay `pending` — no data loss; users can retry.

### Emails not sending

1. Check `RESEND_API_KEY` validity.
2. Verify DNS (SPF/DKIM) on `xoxo.travel`.
3. Check logs for `Email skipped — no provider configured`.
4. Fallback: configure SMTP vars (`EMAIL_USER`, `EMAIL_PASS`).

### AI Planner down

1. Check `ANTHROPIC_API_KEY` quota/billing.
2. API falls back to demo itinerary when key missing — users still get a response.
3. Monitor `aiLimiter` 429 responses in logs.

---

## Backup & Restore

### MongoDB Atlas restore

1. Atlas → Cluster → Backup → select restore point.
2. Restore to new cluster or overwrite (overwrite requires downtime).
3. Update `MONGODB_URI` if cluster URL changes.
4. Run `npm run smoke` to verify.

### Environment secrets restore

1. Retrieve from vault (1Password / Key Vault).
2. Update PaaS environment variables.
3. Restart API container.

### Invoice files

- Stored in `backend/invoices/` on API server.
- Docker volume `api_invoices` persists across restarts.
- Not backed up to Atlas — regenerate from booking data if lost.

---

## Scaling Guidelines

| Traffic level | Action |
|---|---|
| < 1k DAU | Single API instance, Atlas M10 |
| 1k–10k DAU | 2+ API instances, Redis for rate limits + Socket.io adapter |
| 10k+ DAU | CDN for static assets, read replicas on Atlas, queue for emails |

Current architecture supports **beta launch** on a single API instance.

---

## Security Operations

### Secret rotation (quarterly)

```bash
# Generate new secrets
openssl rand -hex 32  # JWT_SECRET
openssl rand -hex 32  # REFRESH_TOKEN_SECRET

# Update in PaaS env → restart API
# All users will need to re-login (refresh tokens invalidated)
```

### Dependency updates

```bash
cd backend && npm audit && npm update
cd .. && npm audit && npm update
npm run build  # verify frontend
npm run qa     # verify API
```

### Access control

- Admin panel: `/admin/verification` — requires `role: admin`
- Rotate `admin@xoxotravels.com` password before launch
- Never commit `.env` files

---

## Monitoring Alerts (Recommended)

| Alert | Condition | Severity |
|---|---|---|
| API down | Health check fails 2× | Critical |
| DB disconnected | `database: disconnected` | Critical |
| High error rate | > 10 errors/min in logs | Warning |
| Payment webhook failures | Razorpay dashboard alerts | High |
| Disk space (uploads) | > 80% volume | Warning |

---

## Useful Commands

```bash
# Local dev
cd backend && npm run dev
cd .. && npm run dev

# Seed database
cd backend && npm run seed

# Full QA suite
cd backend && npm run qa

# Docker local stack
cd backend && docker compose up --build

# Check what's on port 5000 (Windows PowerShell)
Get-NetTCPConnection -LocalPort 5000 | Select OwningProcess

# Start API on alternate port
$env:PORT=5002; node src/server.js
```

---

## Contacts

| Role | Contact |
|---|---|
| On-call engineering | (configure) |
| Customer support | +91 9240204872 |
| Razorpay support | dashboard.razorpay.com |
| Atlas support | cloud.mongodb.com |

---

## Release History

| Version | Date | Notes |
|---|---|---|
| `v0.1.0-beta` | 2026-06-25 | Beta stabilization — 45 API tests, 8 bugs fixed |
| `v0.1.0` | TBD | Production launch |

---

_Related: `DEPLOYMENT_GUIDE.md`, `TEST_REPORT.md`, `BUG_REPORT.md`_
