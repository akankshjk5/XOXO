# Transport Hub — API Reference

_Base URL: `/api/transport`_

---

## Endpoints

### GET `/status`

Provider and mode registry status.

**Response:**
```json
{
  "success": true,
  "data": {
    "modes": [
      {
        "id": "flight",
        "label": "Flights",
        "future": false,
        "providers": [{ "id": "flight-adapter", "label": "Flight Inventory", "live": false }]
      }
    ],
    "integrations": [
      { "id": "flight-adapter", "label": "Flight Inventory", "modes": ["flight"], "live": false },
      { "id": "mock-transport", "label": "Mock Transport", "modes": ["bus", "train", ...], "live": false }
    ]
  }
}
```

---

### GET `/modes`

List all transport modes and labels.

---

### GET `/search`

Unified multi-modal search with filters and AI recommendations.

**Query parameters:**

| Param | Required | Description |
|-------|----------|-------------|
| `origin` | Yes | City or IATA code (e.g. `DEL`) |
| `destination` | Yes | City or IATA code (e.g. `MUM`) |
| `departureDate` | Yes | `YYYY-MM-DD` |
| `returnDate` | No | Round trip date |
| `passengers` | No | Default `1` |
| `modes` | No | Comma-separated mode IDs (default: all) |
| `maxPrice` | No | Max price filter (INR) |
| `minPrice` | No | Min price filter |
| `maxDuration` | No | Max duration in minutes |
| `maxStops` | No | Max stops |
| `departureAfter` | No | ISO datetime |
| `departureBefore` | No | ISO datetime |
| `providerId` | No | Filter by provider slug |
| `providerLabel` | No | Partial match on provider name |
| `sort` | No | `price` \| `duration` \| `departure` |

**Example:**
```
GET /api/transport/search?origin=DEL&destination=MUM&departureDate=2026-09-01&passengers=2&sort=price
```

**Response:**
```json
{
  "success": true,
  "offers": [ /* TransportOffer[] */ ],
  "grouped": [
    {
      "mode": "flight",
      "label": "Flights",
      "count": 3,
      "offers": [ /* ... */ ]
    },
    {
      "mode": "bus",
      "label": "Buses",
      "count": 3,
      "offers": [ /* ... */ ]
    },
    {
      "mode": "metro",
      "label": "Metro",
      "status": "coming_soon",
      "offers": []
    }
  ],
  "recommendations": {
    "cheapest": { "id": "...", "mode": "bus", "label": "...", "price": 649 },
    "fastest": { "id": "...", "mode": "bike_taxi", "label": "...", "durationMinutes": 45 },
    "bestValue": { "id": "...", "mode": "train", "label": "...", "price": 1450, "durationMinutes": 960 }
  },
  "meta": {
    "origin": "DEL",
    "destination": "MUM",
    "departureDate": "2026-09-01",
    "total": 24,
    "modesSearched": ["flight", "bus", "train", ...],
    "demo": true
  }
}
```

---

### GET `/recommendations`

Convenience alias returning only `recommendations` + `meta`. Same query params as `/search`.

---

## Booking

### POST `/api/bookings/transport`

**Auth:** Required (`Bearer` JWT)

**Body:**
```json
{
  "offer": { /* full TransportOffer from search */ },
  "travelDate": "2026-09-01T08:30:00",
  "numTravelers": 2,
  "travelers": [{ "name": "Jane Doe" }],
  "specialRequests": ""
}
```

**Response:** `201` with booking document (`bookingType: "transport"`, `inventoryMeta.offer` populated).

Then use existing payment endpoints:
- `POST /api/payments/order` — `{ bookingId }`
- `POST /api/payments/verify` — Razorpay or demo

---

## Frontend client

```typescript
import { transportAPI, bookingsAPI, paymentsAPI } from "@/lib/api";

const { data } = await transportAPI.search({
  origin: "DEL",
  destination: "MUM",
  departureDate: "2026-09-01",
  passengers: 1,
  sort: "price",
});

const booking = await bookingsAPI.createTransport({ offer: data.offers[0], travelers: [{ name: "User" }] });
```

---

## Legacy inventory routes

Individual mode routes remain available for Concierge and direct API use:

| Route | Mode |
|-------|------|
| `GET /api/inventory/flights` | Flights only |

Transport Hub supersedes these for user-facing search at `/transport`.
