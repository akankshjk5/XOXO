# XOXO Travels — Test Report

_Beta Stabilization & QA Phase · 2026-06-25_

---

## Executive Summary

| Suite | Tests | Passed | Failed |
|---|---|---|---|
| Core smoke (`smoke-test-production.js`) | 16 | 16 | 0 |
| Extended QA (`qa-smoke-extended.js`) | 29 | 29 | 0 |
| Frontend production build | 20 routes | ✅ | — |
| **Total automated API tests** | **45** | **45** | **0** |

**Verdict:** All automated API flows pass. Manual UI verification recommended before public beta launch.

---

## Test Plan

### 1. Authentication

| # | Test Case | Method | Expected | Result |
|---|---|---|---|---|
| A1 | Demo user login | `POST /api/auth/login` | 200 + accessToken | ✅ |
| A2 | Admin login | `POST /api/auth/login` | 200 + accessToken | ✅ |
| A3 | New user registration | `POST /api/auth/register` | 201/200 | ✅ |
| A4 | Get current user | `GET /api/auth/me` | 200 + user object | ✅ |
| A5 | Protected route without token | `GET /api/bookings/my` | 401 | ✅ |
| A6 | Session hydration (frontend) | AuthProvider + fetchMe | No flash of protected content | ✅ Fixed |
| A7 | Stale token cleanup | fetchMe on invalid token | Clears localStorage + redirect | ✅ Fixed |
| A8 | Logout | `POST /api/auth/logout` | Clears session | Manual |
| A9 | Password reset flow | forgot → reset | Email sent / token works | Manual |

### 2. Booking Flow

| # | Test Case | Expected | Result |
|---|---|---|---|
| B1 | Create package booking | 201 + bookingRef | ✅ |
| B2 | List my bookings | 200 + array | ✅ |
| B3 | Booking detail | 200 + populated package | ✅ |
| B4 | Cancel booking | status → cancelled | Manual |
| B5 | Add-ons pricing | Persisted on booking | ✅ Fixed |
| B6 | Demo payment E2E | order → verify → confirmed | ✅ |
| B7 | Live Razorpay checkout | Opens widget, verifies signature | Manual (needs live keys) |
| B8 | Webhook payment.captured | Idempotent confirm | Manual (needs webhook URL) |

### 3. AI Planner

| # | Test Case | Expected | Result |
|---|---|---|---|
| C1 | Generate itinerary | 200 + days array | ✅ |
| C2 | Demo fallback (no Anthropic key) | Returns sample itinerary | ✅ |
| C3 | Save itinerary | `POST /api/itineraries` | Manual |
| C4 | List saved itineraries | `GET /api/itineraries/my` | ✅ |
| C5 | Form validation (frontend) | Destination required | Manual |

### 4. Traveler Matching

| # | Test Case | Expected | Result |
|---|---|---|---|
| D1 | Get match profile | 200 or null | ✅ |
| D2 | Discover without profile | 200 + `requiresProfile: true` | ✅ Fixed |
| D3 | Upsert profile | 200 + profile | Manual |
| D4 | Discover with profile | 200 + scored matches | Manual |
| D5 | Send match request | 201 + notification | Manual |
| D6 | Accept/reject request | 200 + notification | Manual |

### 5. Nearby Travelers

| # | Test Case | Expected | Result |
|---|---|---|---|
| E1 | Get privacy settings | 200 | ✅ |
| E2 | Update location | 200 | ✅ |
| E3 | Discover without coords | 200 + uses stored location or `requiresLocation` | ✅ Fixed |
| E4 | Toggle location visibility | 200 | Manual |
| E5 | Geolocation permission denied | Toast error, no crash | Manual |

### 6. Community

| # | Test Case | Expected | Result |
|---|---|---|---|
| F1 | Feed load | `GET /api/posts` 200 | ✅ |
| F2 | Create post (auth) | 201 | Manual |
| F3 | Like / comment | 200 | Manual |
| F4 | Delete own post | 200 | Manual |

### 7. Friends

| # | Test Case | Expected | Result |
|---|---|---|---|
| G1 | Friends list | 200 | ✅ |
| G2 | Friend requests | 200 | ✅ |
| G3 | Send request | 201 + email notification | Manual |
| G4 | Accept/reject | 200 + email | Manual |

### 8. Guides

| # | Test Case | Expected | Result |
|---|---|---|---|
| H1 | Guides list | 200 | ✅ |
| H2 | Guide detail | 200 | Manual |
| H3 | Book guide | 201 | Manual |

### 9. Dashboard

| # | Test Case | Expected | Result |
|---|---|---|---|
| I1 | Wallet balance | 200 | ✅ |
| I2 | Notifications | 200 | ✅ |
| I3 | Bookings display | Populated from API | Manual |
| I4 | Wishlist toggle | 200 | ✅ |
| I5 | Reward points after booking | Incremented | ✅ |

### 10. Payments

| # | Test Case | Expected | Result |
|---|---|---|---|
| J1 | Create order | 200 + orderId | ✅ |
| J2 | Verify payment (demo) | 200 + paid status | ✅ |
| J3 | Invoice generation | `/invoices/` URL on booking | Manual |
| J4 | Refund request | 200 | Manual |
| J5 | Webhook idempotency | No double-confirm | Manual |

### 11. Notifications

| # | Test Case | Expected | Result |
|---|---|---|---|
| K1 | In-app notification list | 200 | ✅ |
| K2 | Socket.io push | Real-time bell update | Manual |
| K3 | Email on payment | Resend/SMTP | Manual (needs keys) |
| K4 | Email on social events | `social` type sends email | ✅ Fixed |
| K5 | Mark as read | 200 | Manual |

### 12. Admin

| # | Test Case | Expected | Result |
|---|---|---|---|
| L1 | Admin verification queue | 200 (admin only) | ✅ |
| L2 | Non-admin blocked | 403 | Manual |
| L3 | Approve/reject verification | 200 + user notified | Manual |

### 13. Mobile Responsiveness

| # | Test Case | Viewport | Result |
|---|---|---|---|
| M1 | Homepage sections | 375×812 | Manual |
| M2 | Navbar + drawer | 375×812 | Manual |
| M3 | Package detail sticky CTA | 375×812 | Manual |
| M4 | Booking modal steps | 375×812 | Manual |
| M5 | Bottom nav (AppShell) | 375×812 | Manual |
| M6 | Touch targets ≥ 44px | All interactive | Manual |
| M7 | Chat input + send | 375×812 | Manual |

---

## Running Automated Tests

```bash
cd backend

# Core flows (auth, booking, payment, inventory)
npm run smoke

# Full API coverage (social, admin, guides, etc.)
node scripts/qa-smoke-extended.js

# Both suites
npm run qa

# Against production API
API_URL=https://api.xoxo.travel npm run qa
```

---

## Performance Baseline (Local)

| Metric | Value | Notes |
|---|---|---|
| Homepage First Load JS | ~200 kB | Next.js build |
| Shared JS chunk | 87.2 kB | All routes |
| `/api/health` response | < 50 ms | Local |
| `/api/packages?limit=24` | < 200 ms | With `.lean()` |
| AI itinerary generation | 2–15 s | Depends on Anthropic |

---

## Manual Test Accounts

| Role | Email | Password |
|---|---|---|
| Demo user | `demo@xoxotravels.com` | `demo123` |
| Admin | `admin@xoxotravels.com` | `admin123` |

> Rotate or disable these accounts before public launch.

---

## Outstanding Manual QA

- [ ] Live Razorpay payment on staging
- [ ] Email deliverability (Resend + SPF/DKIM)
- [ ] Cross-browser: Chrome, Safari, Firefox mobile
- [ ] Lighthouse on production domain
- [ ] Socket.io reconnection after network drop

---

_Related: `BUG_REPORT.md`, `DEPLOYMENT_GUIDE.md`, `OPERATIONS_GUIDE.md`_
