# Amadeus Hotel Provider API

## Provider

| | |
|---|---|
| **Live** | `AmadeusHotelProvider` |
| **Mock** | `MockHotelProvider` |
| **Credentials** | Same as Amadeus Flights |
| **API** | `GET /api/inventory/hotels` |

## Environment variables

```env
AMADEUS_API_KEY=your_api_key
AMADEUS_API_SECRET=your_api_secret
AMADEUS_ENV=test
```

Uses the shared Amadeus OAuth client. No separate hotel vendor required.

## Amadeus endpoints (two-step)

1. `GET /v1/reference-data/locations/hotels/by-city` — resolve hotel IDs
2. `GET /v3/shopping/hotel-offers` — fetch offers for up to 10 hotels

## Query parameters

| Param | Required | Example |
|---|---|---|
| `cityCode` | Yes | `BKK` (IATA city code) |
| `checkIn` | Yes | `2026-09-01` |
| `checkOut` | Yes | `2026-09-04` |
| `adults` | No | `2` |
| `rooms` | No | `1` |

### Example

```http
GET /api/inventory/hotels?cityCode=BKK&checkIn=2026-09-01&checkOut=2026-09-04&adults=2
```

## Response shape

```json
{
  "success": true,
  "data": [
    {
      "id": "offer-id",
      "name": "Grand Hotel",
      "cityCode": "BKK",
      "pricePerNight": 4500,
      "totalPrice": 13500,
      "currency": "INR",
      "rating": 4,
      "provider": "amadeus"
    }
  ],
  "meta": { "provider": "amadeus", "count": 3 }
}
```

## Mock mode

`MockHotelProvider` returns sample hotels for BKK, DXB, SIN when Amadeus keys are absent.

## Setup

1. Same Amadeus app as flights
2. Enable **Hotel Search** APIs in Amadeus developer portal
3. Test with city codes: `BKK`, `DXB`, `PAR`, `NYC`

## Retry & fallback

- Each Amadeus call retried up to 3×
- On persistent failure → mock hotels with `meta.fallback: true`

## Limitations

- Search only — no hotel booking confirmation
- Limited to 10 hotels per search (performance cap)
- Requires valid future check-in/check-out dates
