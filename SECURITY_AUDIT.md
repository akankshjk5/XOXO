# XOXO Travels — Security Audit

_Production Integration Phase · 2026-06-25_

---

## Executive Summary

| Area | Rating | Status |
|---|---|---|
| Authentication (JWT) | **B+** | Hardened for production; rotate secrets before launch |
| Authorization | **B** | Route-level guards; verify all admin paths |
| Input validation | **B** | express-validator on auth; expand to mutations |
| Rate limiting | **A-** | Added on auth, AI, payments, global |
| CORS / HTTPS | **A-** | Production origin whitelist; trust proxy enabled |
| File uploads | **B** | MIME + size limits; Cloudinary preferred |
| Payments | **A-** | Signature verify + webhook HMAC + idempotency |
| XSS / CSRF | **B+** | JSON API + httpOnly cookies; CSRF N/A for Bearer JWT |
| Secrets management | **C+** | Env vars only — use vault in production |
| Logging / monitoring | **B** | Winston + request IDs; no Sentry yet |

**Overall:** Suitable for **controlled production beta** after secret rotation and Atlas network lockdown.

---

## 1. JWT Security

### Current implementation

| Control | Status | Location |
|---|---|---|
| Access token expiry | ✅ 7d (configurable) | `JWT_EXPIRE` |
| Refresh token rotation | ✅ On `/auth/refresh` | `auth.controller.js` |
| httpOnly cookies | ✅ `accessToken`, `refreshToken` | `utils/jwt.js` |
| `secure` flag in production | ✅ | `cookieOptions.secure` |
| `sameSite: lax` | ✅ | CSRF mitigation for cookies |
| Password hashing | ✅ bcrypt rounds 12 | `User` model |
| Weak secret rejection | ✅ Production boot fails if < 32 chars | `config/env.js` |

### Recommendations

- [ ] Rotate `JWT_SECRET` and `REFRESH_TOKEN_SECRET` before launch (`openssl rand -hex 32`)
- [ ] Consider shorter access token TTL (15m–1h) with refresh-only flow for high-security
- [ ] Add token blocklist on logout (optional Redis) for immediate revocation
- [ ] Enable `sameSite: strict` if cookie-only auth path is primary

---

## 2. Rate Limiting

| Limiter | Window | Max (prod) | Routes |
|---|---|---|---|
| `standardLimiter` | 15 min | 300 | All `/api/*` |
| `authLimiter` | 15 min | 20 | `/api/auth/*` |
| `aiLimiter` | 1 min | 10 | `/api/ai/*` |
| `paymentLimiter` | 15 min | 30 | `/api/payments/*` |

**File:** `src/middleware/rateLimiter.js`

### Recommendations

- [ ] Add IP-based blocking after repeated auth failures
- [ ] Consider Redis store for rate limits across multiple API instances

---

## 3. Input Validation

| Area | Validation | Gap |
|---|---|---|
| Auth register/login | ✅ express-validator | — |
| Bookings | ⚠️ Partial | Add Zod/Joi schema for travelers array |
| Payments | ⚠️ Partial | Validate ObjectId format |
| Inventory search | ⚠️ Query params | IATA code format regex added implicitly |
| File upload | ✅ MIME whitelist, 5MB | Add magic-byte check |
| AI endpoints | ❌ Public, no auth | Rate limited only |

### Recommendations

- [ ] Add `express-validator` to booking and payment routes
- [ ] Require auth on AI endpoints or API key for production
- [ ] Sanitize HTML in user-generated content (posts, chat)

---

## 4. XSS (Cross-Site Scripting)

| Vector | Mitigation |
|---|---|
| API responses | JSON only — no server-rendered HTML |
| User content (posts/chat) | React escapes by default on frontend |
| Email templates | Static HTML from server templates — no user HTML injection |
| `helmet()` | ✅ Security headers enabled |

### Recommendations

- [ ] Add Content-Security-Policy via helmet CSP config on frontend
- [ ] DOMPurify on any `dangerouslySetInnerHTML` usage (audit frontend)

---

## 5. CSRF

| Pattern | CSRF risk |
|---|---|
| Bearer token in `Authorization` header | **Low** — not cookie-submitted |
| httpOnly cookies for tokens | **Medium** — mitigated by `sameSite: lax` |
| Razorpay webhook | **None** — HMAC verified server-to-server |
| State-changing GET requests | **None** — all mutations use POST/PUT/DELETE |

**Verdict:** CSRF tokens not required for primary JWT-header auth flow.

---

## 6. File Upload Security

| Control | Status |
|---|---|
| File type whitelist | ✅ jpeg, jpg, png, webp, gif |
| Max size | ✅ 5 MB |
| Auth required | ✅ `protect` middleware |
| Cloudinary upload | ✅ Preferred in production |
| Local fallback | ⚠️ Serves from `/uploads` — disable in prod if possible |

### Recommendations

- [ ] Add file magic-byte validation (not just extension)
- [ ] Virus scan integration for verification document uploads
- [ ] Disable local `/uploads` fallback when `NODE_ENV=production`

---

## 7. API Authorization

| Route group | Guard | Notes |
|---|---|---|
| `/api/bookings/*` | `protect` | Owner check in controller |
| `/api/payments/*` | `protect` | Owner check; webhook is public (signed) |
| `/api/admin/*` | `adminOnly` | Via verification routes |
| `/api/inventory/*` | Public | Read-only search — acceptable |
| `/api/ai/*` | **Public** | Rate limited — consider auth |

### Recommendations

- [ ] Audit all controllers for `req.user._id` ownership checks
- [ ] Add role-based access for refund endpoint (admin-only for partial refunds)

---

## 8. Sensitive Data Exposure

| Data | Exposure | Mitigation |
|---|---|---|
| Passwords | Never in responses | `select: false` + `toJSON` transform |
| Refresh tokens | Never in responses | `select: false` |
| JWT in logs | Not logged | — |
| Stack traces | Hidden in production | `errorHandler.js` |
| Razorpay secrets | Server only | Never in frontend bundle |
| Google Maps key | Server proxy | `GOOGLE_MAPS_API_KEY` backend-only |
| Demo credentials | Dev only | Hidden in production `LoginForm` |

### Recommendations

- [ ] Enable MongoDB encryption at rest (Atlas default)
- [ ] Audit `.env` files are in `.gitignore` (verified)
- [ ] Restrict `GET /api/users` — no public user enumeration

---

## 9. Payment Security

| Control | Status |
|---|---|
| Razorpay signature verification | ✅ HMAC-SHA256 |
| Webhook signature | ✅ `RAZORPAY_WEBHOOK_SECRET` |
| Webhook idempotency | ✅ `WebhookEvent` model |
| Demo mode auto-disable | ✅ When keys configured |
| Amount tampering | ✅ Server reads `booking.totalAmount` |

---

## 10. CORS & Network

```javascript
// Production: only CLIENT_URL + ALLOWED_ORIGINS
// Development: localhost:* allowed
```

| Control | Status |
|---|---|
| Credentials mode | ✅ `credentials: true` |
| Origin whitelist | ✅ No wildcard in production |
| `TRUST_PROXY` | ✅ For reverse proxy HTTPS |
| Socket.io CORS | ✅ Matches API origins |

### Recommendations

- [ ] MongoDB Atlas IP allowlist (remove `0.0.0.0/0` after setup)
- [ ] WAF on API gateway (Cloudflare / Azure Front Door)

---

## 11. Dependency Security

```bash
cd backend && npm audit
cd .. && npm audit
```

**Backend audit (2026-06-25):** 0 vulnerabilities  
**Action:** Run `npm audit` in CI on every deploy.

---

## 12. Remediation Checklist (Pre-Launch)

### Critical (must fix)

- [ ] Rotate all JWT and Razorpay secrets
- [ ] Configure `RAZORPAY_WEBHOOK_SECRET` and register webhook URL
- [ ] Lock MongoDB Atlas to API server IPs
- [ ] Set `NODE_ENV=production` on API and frontend

### High (should fix)

- [ ] Add auth to AI endpoints or per-user API quotas
- [ ] Redis-backed rate limiting for multi-instance deploy
- [ ] Sentry or Application Insights error tracking
- [ ] Disable local file upload fallback in production

### Medium (recommended)

- [ ] CSP headers on Next.js frontend
- [ ] Automated security scanning in CI (Snyk / Dependabot)
- [ ] Penetration test before public marketing launch

---

_Audit performed as part of Production Integration Phase. Re-audit after live credentials are configured._
