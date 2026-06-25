# XOXO Travels — Bug Report

_Beta Stabilization & QA Phase · 2026-06-25_

---

## Summary

| Severity | Found | Fixed | Open |
|---|---|---|---|
| Critical | 0 | 0 | 0 |
| High | 3 | 3 | 0 |
| Medium | 4 | 4 | 0 |
| Low | 3 | 1 | 2 |
| **Total** | **10** | **8** | **2** |

---

## Fixed Issues

### BUG-001 · High — Social notification emails never sent

**Symptom:** Match requests, friend requests, and group invites created in-app notifications but no email.

**Root cause:** Controllers used `type: "social"` but `notify()` only emailed types in `["payment", "booking", "match", "friend", ...]` — `"social"` was missing.

**Fix:** Added `"social"`, `"guide"`, and `"system"` to `EMAIL_TYPES` in `backend/src/utils/notify.js`.

**Verified:** Code review; email sends when provider configured.

---

### BUG-002 · High — Auth race condition on protected routes

**Symptom:** Brief flash of dashboard/protected content before redirect when token expired; or protected page rendered before `fetchMe` completed.

**Root cause:** `RequireAuth` checked token synchronously without waiting for session hydration; `fetchMe` did not set a global ready state.

**Fix:**
- Added `hydrated` flag to `authStore`
- `AuthProvider` blocks render until hydration completes
- `RequireAuth` waits for `hydrated` before allowing/rejecting

**Files:** `store/authStore.ts`, `components/auth/AuthProvider.tsx`, `components/auth/RequireAuth.tsx`

---

### BUG-003 · High — Stale JWT not cleared from localStorage

**Symptom:** After token expiry, API returned 401 but `xoxo_token` remained in localStorage, causing retry loops.

**Root cause:** `fetchMe` catch block cleared Zustand state but not `localStorage`.

**Fix:** `fetchMe` and logout now call `localStorage.removeItem("xoxo_token")` on failure.

**File:** `store/authStore.ts`

---

### BUG-004 · Medium — Match discover returned 400 for new users

**Symptom:** API returned HTTP 400 when user had no match profile, causing unnecessary error handling in clients.

**Root cause:** `discover` controller treated missing profile as client error.

**Fix:** Returns `200` with `{ data: [], requiresProfile: true, message: "..." }`.

**Files:** `backend/src/controllers/match.controller.js`, `components/social/MatchClient.tsx`

---

### BUG-005 · Medium — Nearby API required lat/lng query params

**Symptom:** `GET /api/nearby` returned 400 even when user had previously shared location.

**Root cause:** Controller did not fall back to user's stored coordinates.

**Fix:** Falls back to `lastLatitude`/`lastLongitude`; returns `requiresLocation: true` with empty array if none.

**File:** `backend/src/controllers/nearby.controller.js`

---

### BUG-006 · Medium — Booking add-ons not persisted

**Symptom:** Insurance/visa add-on prices included in total but not saved on booking document.

**Root cause:** `addOns` field missing from Booking schema usage in create controller.

**Fix:** Added `addOns` array to schema; controller persists add-on details.

**Files:** `backend/src/models/Booking.js`, `backend/src/controllers/booking.controller.js`

---

### BUG-007 · Medium — Package list queries not optimized

**Symptom:** Slower API response on `/api/packages` with full Mongoose documents.

**Root cause:** No `.lean()` and full destination populate.

**Fix:** Added `.lean()` and selective destination field projection.

**File:** `backend/src/controllers/package.controller.js`

---

### BUG-008 · Low — Missing database indexes on bookings

**Symptom:** Potential slow queries on user bookings and payment webhook lookups.

**Fix:** Added indexes on `{ user, createdAt }`, `razorpayOrderId`, `razorpayPaymentId`.

**File:** `backend/src/models/Booking.js`

---

## Open / Known Issues (Not Fixed — By Design or Deferred)

### BUG-009 · Low — Port 5000 conflict on dev restart

**Symptom:** `EADDRINUSE` when starting backend while previous instance runs.

**Workaround:** Stop existing process or use `$env:PORT=5002; node src/server.js`.

**Recommendation:** Use `npm run dev` with nodemon or document in OPERATIONS_GUIDE.

---

### BUG-010 · Low — Homepage still uses static sample data

**Symptom:** Recently Booked ticker and some sections show `pyt-data` mocks instead of live API.

**Status:** Intentional fallback for marketing when API empty. `packagesAPI.recentBookings()` exists but not wired.

**Recommendation:** Wire in post-beta sprint (not a blocker for beta).

---

## Issues Investigated — Not Bugs

| Report | Finding |
|---|---|
| Match discover "failure" in initial QA | Expected 400 before fix; now returns 200 with `requiresProfile` |
| Nearby "failure" in initial QA | Expected without lat/lng; now uses stored location |
| Console.log in frontend | None found in `app/` or `components/` |
| TODO/FIXME in source | None found in application code |

---

## Regression Checklist (Post-Fix)

- [x] `npm run smoke` — 16/16
- [x] `qa-smoke-extended.js` — 29/29
- [x] `npm run build` (frontend) — green
- [ ] Manual booking modal on mobile
- [ ] Manual auth redirect after token expiry

---

_Related: `TEST_REPORT.md`_
