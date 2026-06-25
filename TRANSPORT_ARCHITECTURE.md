# XOXO Transport Hub — Architecture

_Unified multi-modal transport search, comparison, and booking._

---

## Overview

The Transport Hub is a **single interface** for searching and comparing all transport modes. It does not create separate booking pages per provider or per mode.

```
User → /transport (TransportHub UI)
         ↓
    GET /api/transport/search
         ↓
    transport/hub.js (orchestrator)
         ↓
    ┌────────────┬──────────────────┐
    │ Flight     │ Mock Transport   │
    │ Adapter    │ Provider         │
    │ (Amadeus)  │ (bus, train, …)  │
    └────────────┴──────────────────┘
         ↓
    Normalized TransportOffer[]
         ↓
    Filters + AI recommendations
         ↓
    POST /api/bookings/transport → Razorpay (existing flow)
```

---

## Supported modes

| Mode | ID | Status |
|------|-----|--------|
| Flights | `flight` | Live (Amadeus) + mock fallback |
| Buses | `bus` | Mock provider |
| Trains | `train` | Mock provider |
| Metro | `metro` | Future — shown as coming soon |
| Taxi | `taxi` | Mock provider |
| Bike Taxi | `bike_taxi` | Mock provider |
| Self Drive | `self_drive` | Mock provider |
| Car Rentals | `car_rental` | Mock provider |
| Ferries | `ferry` | Mock provider |
| Cruises | `cruise` | Mock provider |
| Airport Transfers | `airport_transfer` | Mock provider |

---

## Provider architecture

### Base interface

`backend/src/services/transport/TransportProvider.js`

Every integration implements:
- `id` — slug (e.g. `mock-transport`, `flight-adapter`)
- `label` — human-readable integration name
- `modes` — array of mode IDs this provider serves
- `isLive()` — whether using live APIs
- `search(params)` → `{ offers: TransportOffer[], meta }`

### Registry

`backend/src/services/transport/registry.js`

Registers all providers. New live integrations are added here without UI changes.

Current providers:
| Provider | File | Modes |
|----------|------|-------|
| Flight adapter | `FlightTransportAdapter.js` | `flight` |
| Mock transport | `MockTransportProvider.js` | bus, train, taxi, … |

### Hub orchestrator

`backend/src/services/transport/hub.js`

- Runs all matching providers in parallel
- Normalizes offers to `TransportOffer`
- Applies filters (price, duration, stops, departure time, provider)
- Groups results by mode
- Computes AI recommendations: **cheapest**, **fastest**, **best value**

---

## Booking integration

Reuses the existing payment pipeline:

1. User selects offer in Transport Hub
2. `POST /api/bookings/transport` with full `offer` payload
3. `bookingType: "transport"`, `inventoryMeta.offer` stored
4. `POST /api/payments/order` → Razorpay or demo verify
5. Booking appears in dashboard

No duplicate payment logic.

---

## Frontend

| File | Role |
|------|------|
| `app/(main)/transport/page.tsx` | Route |
| `components/transport/TransportHub.tsx` | Unified search + results |
| `components/transport/TransportBookingModal.tsx` | Booking + payment |
| `lib/transport-types.ts` | TypeScript types |
| `lib/api.ts` → `transportAPI` | API client |

---

## Design principles

1. **No hardcoded third-party brands** — mock data uses generic labels (e.g. "Premium Coach Network")
2. **Provider swappable** — UI only knows `TransportOffer` shape
3. **Mock fallback** — flights use existing `withMockFallback`; other modes use mock until live APIs are wired
4. **Single search form** — one origin, destination, date, passenger count
5. **Grouped comparison** — results grouped by transport type

---

## Adding a new live provider

See `TRANSPORT_PROVIDER_GUIDE.md`.

---

## Related docs

- `TRANSPORT_API.md` — REST reference
- `TRANSPORT_PROVIDER_GUIDE.md` — integration guide
- `docs/integrations/AMADEUS.md` — flight live provider
