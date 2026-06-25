# Razorpay Live Payments

## Integration

| | |
|---|---|
| **Module** | `backend/src/utils/razorpay.js` |
| **Controller** | `backend/src/controllers/payment.controller.js` |
| **Frontend** | `components/packages/BookingModal.tsx` |

## Environment variables

```env
RAZORPAY_KEY_ID=rzp_test_xxxxx        # or rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxx     # recommended for production
```

| Mode | When |
|---|---|
| **Demo** | Keys absent → `order_demo_*`, verify accepts `razorpay_signature: "demo"` |
| **Test** | `rzp_test_*` keys → real Razorpay test mode |
| **Live** | `rzp_live_*` keys → production payments |

## API routes

| Method | Path | Description |
|---|---|---|
| POST | `/api/payments/order` | Create order for booking |
| POST | `/api/payments/verify` | Client-side payment verification |
| POST | `/api/payments/webhook` | Server-to-server events |
| POST | `/api/payments/refund` | Refund paid booking |
| GET | `/api/payments/invoice/:bookingId` | Invoice URL |

## Order flow

1. User creates package booking → `POST /api/bookings`
2. Server creates Razorpay order → `POST /api/payments/order`
3. Client opens Razorpay checkout with `keyId` + `orderId`
4. On success, client calls `POST /api/payments/verify` with signature
5. Webhook `payment.captured` provides backup confirmation

### Demo response (no keys)

```json
{
  "success": true,
  "demo": true,
  "data": {
    "orderId": "order_demo_1719234567890",
    "amount": 500000,
    "currency": "INR",
    "keyId": null
  }
}
```

### Live response

```json
{
  "success": true,
  "demo": false,
  "data": {
    "orderId": "order_Nxxxxxxxx",
    "amount": 500000,
    "currency": "INR",
    "keyId": "rzp_test_xxxxx"
  }
}
```

## Webhook setup

1. Razorpay Dashboard → Webhooks → Add endpoint
2. URL: `https://api.xoxo.travel/api/payments/webhook`
3. Events: `payment.captured`, `refund.processed`
4. Copy secret → `RAZORPAY_WEBHOOK_SECRET`
5. Webhook uses raw body for HMAC verification

## Retry

- `createOrder` and `refundPayment` retry 3× on transient failures
- Signature verification is synchronous (no retry)

## Status check

```http
GET /api/inventory/status
```

```json
"payments": {
  "configured": true,
  "live": false,
  "mode": "test",
  "webhook": true,
  "keyId": "rzp_test_xxx…"
}
```

## Go-live checklist

- [ ] KYC complete on Razorpay
- [ ] Switch to `rzp_live_*` keys
- [ ] Webhook registered on production domain
- [ ] Test ₹1 live payment end-to-end
- [ ] Verify booking confirmation email fires after payment

## Security

- Never expose `RAZORPAY_KEY_SECRET` to frontend
- Webhook signature required in production when secret is set
- Idempotency via `WebhookEvent` model prevents duplicate processing
