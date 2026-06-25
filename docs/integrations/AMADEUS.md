# Amadeus Flights API

## Provider

| | |
|---|---|
| **Live** | `AmadeusFlightProvider` |
| **Mock** | `MockFlightProvider` |
| **Client** | `backend/src/services/amadeus/client.js` |
| **API** | `GET /api/inventory/flights` |

## Environment variables

```env
AMADEUS_API_KEY=your_api_key
AMADEUS_API_SECRET=your_api_secret
AMADEUS_ENV=test          # test | production
```

When `AMADEUS_API_KEY` and `AMADEUS_API_SECRET` are both set, flights use Amadeus. Otherwise mock curated routes (DEL-BKK, DEL-DXB, BOM-SIN) are returned.

## Amadeus endpoint

```
GET /v2/shopping/flight-offers
```

### Query parameters (API → Amadeus)

| Param | Required | Example |
|---|---|---|
| `origin` | Yes | `DEL` |
| `destination` | Yes | `BKK` |
| `departureDate` | Yes | `2026-09-01` |
| `returnDate` | No | `2026-09-10` |
| `adults` | No | `2` |
| `travelClass` | No | `ECONOMY` |

### Example

```http
GET /api/inventory/flights?origin=DEL&destination=BKK&departureDate=2026-09-01&adults=1
```

## Response shape

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "airline": "Thai Airways",
      "airlineCode": "TG",
      "origin": "DEL",
      "destination": "BKK",
      "departureAt": "2026-09-01T08:30:00",
      "price": 22100,
      "currency": "INR",
      "provider": "amadeus"
    }
  ],
  "meta": { "provider": "amadeus", "count": 5, "source": "GDS" }
}
```

When live fails, `meta.fallback: true` and `meta.reason: "live_unavailable"` with mock data.

## Setup

1. Register at [developers.amadeus.com](https://developers.amadeus.com)
2. Create a Self-Service app → copy API Key + Secret
3. Start with `AMADEUS_ENV=test` (sandbox data)
4. Enable Flight Offers Search in your app
5. For production inventory, switch to `AMADEUS_ENV=production`

## Retry & errors

- OAuth token cached; invalidated on 401
- 3 retries on 429, 5xx, network errors
- Auth failures logged as `Integration failure: amadeus:auth`
- API errors logged as `Amadeus API error`

## Limitations

- **Search only** — no flight booking/order creation via Amadeus yet
- Sandbox may return limited routes; use major airport pairs for testing
- Currency fixed to `INR` in queries

## Related

- [HOTELS.md](./HOTELS.md) — same Amadeus credentials
- [ACTIVITIES.md](./ACTIVITIES.md) — same Amadeus credentials
