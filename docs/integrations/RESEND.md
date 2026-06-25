# Resend Email

## Integration

| | |
|---|---|
| **Module** | `backend/src/utils/email.js` |
| **Templates** | `backend/src/utils/emailTemplates.js` |
| **Triggers** | `notify.js`, auth, visa, payments |

## Environment variables

```env
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=XOXO Travels <noreply@xoxo.travel>
SUPPORT_EMAIL=support@xoxo.travel
VISA_DESK_EMAIL=visa@xoxo.travel
```

### SMTP fallback (optional)

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=app_password
```

**Priority:** Resend → SMTP → skip (demo mode)

## Email triggers

| Event | Template | Recipient |
|---|---|---|
| Booking confirmed | `bookingConfirmationEmail` | User email |
| Password reset | auth controller | User email |
| Visa inquiry | visa provider | `VISA_DESK_EMAIL` |
| Social notifications | `notify.js` | User email (if enabled) |

## Behavior

### Configured (Resend)

```js
{ messageId: "uuid", provider: "resend" }
```

### Unconfigured (demo)

```js
{ skipped: true, reason: "email not configured" }
```

Booking and payments **still succeed** when email is skipped.

## Setup

1. Create account at [resend.com](https://resend.com)
2. Add and verify domain `xoxo.travel`
3. Configure DNS: SPF, DKIM (Resend dashboard provides records)
4. Create API key → `RESEND_API_KEY`
5. Set `EMAIL_FROM` to verified sender address

## Retry

- Resend API: 3 attempts with exponential backoff
- SMTP: 2 attempts
- Failures logged as `Integration failure: resend:send` or `email`

## Status check

```http
GET /api/inventory/status
```

```json
"email": {
  "resend": true,
  "smtp": false,
  "configured": true,
  "provider": "resend",
  "from": "XOXO Travels <noreply@xoxo.travel>"
}
```

## Testing

```bash
# After deploy with keys — trigger via demo booking smoke test
cd backend && API_URL=http://localhost:5000 npm run smoke
```

Check Resend dashboard → Logs for delivery status.

## Best practices

- Use separate transactional domain (`noreply@xoxo.travel`)
- Keep templates mobile-friendly (single column, 600px max)
- Include plain-text `text` fallback alongside `html`
- Monitor bounce/complaint rates in Resend dashboard
