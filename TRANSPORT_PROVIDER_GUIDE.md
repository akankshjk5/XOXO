# Transport Provider Integration Guide

_How to add or replace transport providers without changing the UI._

---

## Provider contract

Create a class extending `TransportProvider`:

```javascript
const { TransportProvider } = require("./TransportProvider");

class MyRailProvider extends TransportProvider {
  get id() { return "my-rail-partner"; }
  get label() { return "Rail Partner API"; }
  get modes() { return ["train"]; }
  isLive() { return true; }

  async search(params) {
    // params: { origin, destination, departureDate, passengers, modes }
    const offers = [/* normalized TransportOffer objects */];
    return {
      offers,
      meta: { provider: this.id, live: true, count: offers.length },
    };
  }
}
```

---

## TransportOffer shape (required)

Every offer returned must include:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique offer ID |
| `mode` | string | `flight`, `bus`, `train`, etc. |
| `providerId` | string | Integration slug |
| `providerLabel` | string | Display name (not a hardcoded UI brand) |
| `origin` | string | Code or city |
| `originLabel` | string | Display origin |
| `destination` | string | Code or city |
| `destinationLabel` | string | Display destination |
| `departureAt` | string | ISO datetime |
| `arrivalAt` | string | ISO datetime |
| `durationMinutes` | number | Trip duration |
| `stops` | number | Stop count |
| `price` | number | Total price in INR |
| `currency` | string | `INR` |
| `provider` | string | `mock` or integration id |
| `live` | boolean | Optional |
| `vehicleClass` | string | Optional cabin/class |
| `summary` | string | Optional one-line description |

---

## Registration steps

### 1. Create provider file

```
backend/src/services/transport/providers/MyRailProvider.js
```

### 2. Register in registry

Edit `backend/src/services/transport/registry.js`:

```javascript
const { MyRailProvider } = require("./providers/MyRailProvider");

function getTransportProviders() {
  if (!providers) {
    providers = [
      new FlightTransportAdapter(),
      new MyRailProvider(),      // add live provider
      new MockTransportProvider(), // keep for modes without live API
    ];
  }
  return providers;
}
```

### 3. Configure environment

Add credentials to `backend/.env`:

```env
MY_RAIL_API_KEY=
MY_RAIL_API_URL=
```

Document in `backend/.env.production.example`.

### 4. Optional: remove mock for that mode

In `MockTransportProvider.js`, remove the mode from `MOCK_MODES` once live provider is stable.

---

## Flight provider (existing)

Flights are handled by `FlightTransportAdapter.js`, which wraps:
- `AmadeusFlightProvider` (live)
- `MockFlightProvider` (fallback)

Configure via existing Amadeus env vars — no Transport Hub changes needed.

---

## Mock provider (development)

`MockTransportProvider.js` + `mock-data.js`

- Generic partner names only (no RedBus, Uber, Ola, etc.)
- Route-keyed samples: `ORIGIN-DEST` (e.g. `DEL-MUM`)
- Automatically used when no live provider is registered for a mode

---

## Error handling

Providers should:
- Return `{ offers: [], meta: { error: "..." } }` on empty results
- Throw only on unrecoverable errors (hub catches per-provider failures)

For live providers with fallback, wrap with `withMockFallback` from `utils/integration.js` (see `FlightTransportAdapter.js`).

---

## Testing

```bash
# Search all modes
curl "http://localhost:5000/api/transport/search?origin=DEL&destination=MUM&departureDate=2026-09-01"

# Single mode
curl "...&modes=train,bus"

# With filters
curl "...&maxPrice=2000&sort=duration"
```

---

## Checklist for new provider

- [ ] Extends `TransportProvider`
- [ ] Returns normalized `TransportOffer[]`
- [ ] Registered in `registry.js`
- [ ] Env vars documented in `.env.example`
- [ ] No third-party brand names hardcoded in UI layer
- [ ] Smoke test passes (`npm run qa`)
