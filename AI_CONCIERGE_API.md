# XOXO AI Travel Concierge — API Reference

_Base URL: `/api/concierge` · Rate limit: 10 req/min (production)_

---

## Authentication

| Route | Auth |
|-------|------|
| Sessions, messages | Optional (`Bearer` JWT or guest) |
| Save itinerary | Required (`protect`) |
| Share read | Public |

### Guest headers

```
x-guest-id: <uuid>   # Returned on session create; store in localStorage
```

---

## Endpoints

### GET `/prompts`

Suggested starter queries.

**Response:**
```json
{
  "success": true,
  "data": [
    "I have ₹80,000. I want a honeymoon in Bali for 6 days in December."
  ]
}
```

---

### POST `/sessions`

Create a new concierge session.

**Response:**
```json
{
  "success": true,
  "guestId": "uuid-if-anonymous",
  "data": {
    "id": "sessionId",
    "title": "New trip",
    "status": "gathering",
    "messages": [{ "role": "assistant", "content": "..." }],
    "intent": {},
    "plan": null,
    "shareToken": "hex"
  }
}
```

---

### GET `/sessions/:id`

Load session state.

**Headers:** `Authorization` and/or `x-guest-id`

---

### POST `/sessions/:id/message`

Send a user message and run the orchestration pipeline.

**Body:**
```json
{
  "message": "I have ₹80,000 for a honeymoon in Bali for 6 days in December",
  "stream": true
}
```

#### Non-streaming response

```json
{
  "success": true,
  "data": {
    "id": "...",
    "status": "plan_ready",
    "messages": [...],
    "intent": {
      "destination": "Bali",
      "budgetINR": 80000,
      "durationDays": 6,
      "travelers": 2,
      "tripType": "honeymoon",
      "departureDate": "2026-12-10"
    },
    "missingFields": [],
    "plan": {
      "itinerary": { "destination": "Bali", "days": [...] },
      "budget": {
        "totalBudget": 80000,
        "breakdown": { "flights": 42000, "hotels": 18000, ... },
        "remaining": 5000,
        "withinBudget": true
      },
      "rankedFlights": [...],
      "rankedHotels": [...],
      "topActivities": [...],
      "social": { "travelers": [], "groups": [], "guides": [] },
      "visa": { "found": true, "data": {...} },
      "geo": { "lat": -8.34, "lng": 115.09 }
    }
  }
}
```

#### Streaming (SSE)

When `stream: true`, response is `text/event-stream`:

```
event: token
data: {"text":"Perfect"}

event: token
data: {"text":" —"}

event: done
data: {"session": { ...full session object... }}
```

---

### POST `/sessions/:id/save`

Save plan to `Itinerary` collection (auth required).

**Response:** `201` with saved itinerary document.

---

### GET `/share/:token`

Public read-only shared plan.

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Bali · 6 days",
    "plan": { ... },
    "intent": { ... }
  }
}
```

---

## Intent fields

| Field | Type | Description |
|-------|------|-------------|
| `origin` | string | IATA origin (default `DEL`) |
| `destination` | string | Destination name |
| `budgetINR` | number | Total budget in INR |
| `departureDate` | string | ISO date |
| `durationDays` | number | Trip length |
| `travelers` | number | Party size |
| `tripType` | string | honeymoon, solo, family, group |
| `travelStyle` | string[] | beaches, nightlife, culture, etc. |
| `socialPreference` | string | e.g. `solo-match` |
| `openDestination` | boolean | User wants suggestions |

---

## Status values

| Status | Meaning |
|--------|---------|
| `gathering` | Collecting missing trip details |
| `searching` | Running providers (internal) |
| `plan_ready` | Full plan available |
| `archived` | Closed session |

---

## Frontend client

```typescript
import { conciergeAPI } from "@/lib/api";

const { data } = await conciergeAPI.createSession();
await conciergeAPI.streamMessage(sessionId, message, onToken, onDone);
await conciergeAPI.saveItinerary(sessionId);
```

See `hooks/useConcierge.ts` for React integration.

---

## Legacy AI routes (still available)

| Route | Purpose |
|-------|---------|
| `POST /api/ai/itinerary` | Simple one-shot itinerary form |
| `POST /api/ai/chat` | Trippie widget chat |
| `POST /api/ai/destination-tips` | Destination tips |

Concierge supersedes these for full-trip planning. `/ai-planner` redirects to `/concierge`.
