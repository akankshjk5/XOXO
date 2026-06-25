# XOXO.TRAVEL — Integration Documentation

_Live Integration Sprint · provider reference index_

---

## Overview

All external services use a **provider abstraction** with automatic **mock/demo fallback** when credentials are missing or live calls fail. Retry logic (3 attempts, exponential backoff) applies to transient errors (429, 5xx, network).

| Provider | Env vars | Mock when absent | Docs |
|---|---|---|---|
| Amadeus Flights | `AMADEUS_API_KEY`, `AMADEUS_API_SECRET` | `MockFlightProvider` | [AMADEUS.md](./AMADEUS.md) |
| Amadeus Hotels | Same as flights | `MockHotelProvider` | [HOTELS.md](./HOTELS.md) |
| Amadeus Activities | Same as flights | `MockActivityProvider` | [ACTIVITIES.md](./ACTIVITIES.md) |
| Google Maps & Places | `GOOGLE_MAPS_API_KEY` | Sample city predictions | [GOOGLE_MAPS.md](./GOOGLE_MAPS.md) |
| Razorpay | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Demo orders (`order_demo_*`) | [RAZORPAY.md](./RAZORPAY.md) |
| Resend Email | `RESEND_API_KEY`, `EMAIL_FROM` | Skip send, log debug | [RESEND.md](./RESEND.md) |
| Cloudinary | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Local disk `/uploads` | [CLOUDINARY.md](./CLOUDINARY.md) |

---

## Status endpoint

```http
GET /api/inventory/status
```

Returns live/mock state for all travel providers plus `payments`, `email`, and `uploads`:

```json
{
  "flights": { "provider": "mock", "live": false },
  "hotels": { "provider": "mock", "live": false },
  "activities": { "provider": "mock", "live": false },
  "maps": { "provider": "google", "live": false },
  "amadeus": false,
  "amadeusEnv": "test",
  "payments": { "configured": false, "mode": "demo" },
  "email": { "configured": false, "provider": "none" },
  "uploads": { "configured": false }
}
```

Upload status: `GET /api/upload/status`

---

## Shared utilities

| File | Purpose |
|---|---|
| `backend/src/utils/integration.js` | `withRetry`, `withMockFallback`, `logIntegrationFailure` |
| `backend/src/services/index.js` | Provider factory + `getProviderStatus()` |
| `backend/.env.example` | All integration env vars |

---

## Failure handling

1. **Missing credentials** → mock/demo mode, no thrown errors to clients
2. **Transient API failure** → retry up to 3× with backoff
3. **Persistent API failure** (Amadeus inventory) → log error, return mock data with `meta.fallback: true`
4. **Cloudinary failure** → fall back to local disk upload
5. **Email failure** → log error, return `{ skipped: true }` (booking still succeeds)

All failures logged via Winston: `Integration failure` / `Integration retry`.

---

## Smoke tests

```bash
cd backend
API_URL=http://localhost:5000 npm run smoke   # 22 checks
API_URL=http://localhost:5000 npm run qa      # smoke + extended (45+)
```

---

## Launch checklist

- [ ] Amadeus test keys → verify `live: true` on inventory status
- [ ] Google Maps key → Places autocomplete returns real predictions
- [ ] Razorpay test keys → orders return `demo: false`
- [ ] Razorpay webhook registered with production URL
- [ ] Resend domain verified → booking confirmation email delivers
- [ ] Cloudinary configured → uploads return `provider: "cloudinary"`
- [ ] Switch `AMADEUS_ENV=production` and `rzp_live_*` keys for go-live
