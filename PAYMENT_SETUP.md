# Payment setup (Razorpay)

XOXO Travels ships **without** Razorpay credentials. The full booking and payment flow works out of the box in **Demo Payment Mode** so you can demo the product. Add your own Razorpay keys on Railway when you are ready to accept real payments.

**Never commit API keys or secrets to GitHub.** Use environment variables only.

---

## How payment mode is chosen

On API startup, the backend checks:

| Condition | Mode | Checkout behaviour |
|-----------|------|-------------------|
| `RAZORPAY_KEY_ID` **and** `RAZORPAY_KEY_SECRET` are set | **test** or **live** | Razorpay checkout opens (`rzp_test_*` = test, `rzp_live_*` = live) |
| Either variable is missing or empty | **demo** | No Razorpay widget; booking completes via demo verify |

Verify the active mode:

```bash
curl https://YOUR-API-URL/api/payments/status
```

Example (demo):

```json
{
  "success": true,
  "data": {
    "configured": false,
    "mode": "demo",
    "demo": true,
    "live": false,
    "webhook": false,
    "message": "Online payment will be enabled after the client configures their payment gateway."
  }
}
```

`GET /api/health` also includes a safe `payments` summary (no secret values).

---

## Required environment variables

Set these on **Railway** (backend API). The frontend does **not** need Razorpay secrets.

| Variable | Required for live payments | Description |
|----------|---------------------------|-------------|
| `RAZORPAY_KEY_ID` | Yes | From Razorpay Dashboard → API Keys (`rzp_test_…` or `rzp_live_…`) |
| `RAZORPAY_KEY_SECRET` | Yes | Secret paired with the Key ID — **server only** |
| `RAZORPAY_WEBHOOK_SECRET` | Recommended | From Razorpay Dashboard → Webhooks (verifies server-to-server events) |

Optional (legacy — not required):

- `NEXT_PUBLIC_RAZORPAY_KEY_ID` on Vercel — **not used** by the current checkout flow. The Key ID is returned securely from `POST /api/payments/order`.

---

## Railway configuration

1. Open your Railway project → **backend service** → **Variables**.
2. Add:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
   RAZORPAY_KEY_SECRET=your_secret_here
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   ```
3. Use **test keys** first (`rzp_test_…`). Switch to `rzp_live_…` when going live.
4. Redeploy the API service.
5. Confirm in logs:
   - Demo: `Payments: Demo mode — add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET…`
   - Live/test: `Payments: Razorpay test mode enabled` (or `live`)

---

## Vercel configuration

**No Razorpay variables are required on Vercel** for package booking.

Ensure these are set (already required for the app):

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL including `/api` suffix |
| `NEXT_PUBLIC_APP_URL` | Public site URL |

The browser talks to your Railway API for `POST /api/payments/order` and `POST /api/payments/verify`.

---

## Switch from Demo Mode to Live Mode

1. Create a Razorpay account at [https://dashboard.razorpay.com](https://dashboard.razorpay.com).
2. Complete KYC if you want **live** payments.
3. Copy **API Keys** (Test mode first).
4. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to Railway.
5. Redeploy the backend.
6. Book a test package — step 3 should show **“Secure payment via Razorpay (test mode)”** and open the Razorpay checkout.
7. When ready for production, replace keys with **Live** keys (`rzp_live_…`) and redeploy.

To return to demo (e.g. staging): remove or clear the Razorpay variables on Railway and redeploy.

---

## Webhook URL

Register this URL in Razorpay Dashboard → **Webhooks**:

```
https://YOUR-RAILWAY-API-DOMAIN/api/payments/webhook
```

Example:

```
https://xoxo-production-2503.up.railway.app/api/payments/webhook
```

Events to enable (recommended):

- `payment.captured`
- `refund.processed`

Copy the webhook signing secret into Railway as `RAZORPAY_WEBHOOK_SECRET`.

---

## End-to-end booking flow (unchanged)

1. User books a package → `POST /api/bookings`
2. Payment order → `POST /api/payments/order`
3. **Demo:** auto-verify → `POST /api/payments/verify` (no Razorpay UI)
4. **Live/test:** Razorpay checkout → verify with signature
5. Confirmation email (if email is configured)
6. User lands on `/booking/confirmation`
7. Booking appears in **Dashboard → My Bookings** and **Admin → Bookings**

---

## Security checklist

- [ ] No `RAZORPAY_KEY_SECRET` in frontend code or Vercel env
- [ ] `.env` and `.env.local` are in `.gitignore` (already configured)
- [ ] Webhook secret set before relying on webhooks in production
- [ ] Use test keys until UAT is complete

---

## Code references

| Area | File |
|------|------|
| Razorpay env + demo detection | `backend/src/utils/razorpay.js` |
| Payment API + demo verify | `backend/src/controllers/payment.controller.js` |
| Startup log | `backend/src/server.js` |
| Checkout UI notice | `components/payments/PaymentModeNotice.tsx` |
| Package booking modal | `components/packages/BookingModal.tsx` |

For more detail see `docs/integrations/RAZORPAY.md`.
