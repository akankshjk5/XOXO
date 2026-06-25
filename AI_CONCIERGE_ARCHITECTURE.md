# XOXO AI Travel Concierge — Architecture

_Version 2 · central trip intelligence_

---

## Overview

The AI Travel Concierge is **not a simple chatbot**. It is a server-orchestrated planning agent that:

1. Extracts structured travel intent from natural language
2. Asks follow-up questions when data is missing
3. Calls live inventory + social APIs in parallel
4. Generates an optimized itinerary with budget analysis
5. Surfaces travelers, groups, and guides
6. Supports save, share, and booking handoff

---

## System diagram

```
┌─────────────────────────────────────────────────────────────┐
│  /concierge (ConciergeWorkspace)                            │
│  ┌──────────┐  ┌─────────────────┐  ┌────────────────────┐  │
│  │ Chat SSE │  │ Timeline + Map  │  │ Budget + Booking   │  │
│  └────┬─────┘  └────────▲────────┘  └─────────▲──────────┘  │
└───────┼──────────────────┼─────────────────────┼────────────┘
        │                  │                     │
        ▼                  └──────────┬──────────┘
┌───────────────────┐               │
│ POST /concierge/  │               │
│ sessions/:id/     │               │
│ message (SSE)     │               │
└─────────┬─────────┘               │
          ▼                         │
┌─────────────────────────────────────────────────────────────┐
│  concierge/orchestrator.js                                  │
│  1. intent.js — NL → structured intent                      │
│  2. tools.js — parallel API orchestration                   │
│  3. Claude — plan + conversational reply                      │
└─────────┬───────────────────────────────────────────────────┘
          │
    ┌─────┴─────┬─────────┬──────────┬──────────┬──────────┐
    ▼           ▼         ▼          ▼          ▼          ▼
 Amadeus    Amadeus   Amadeus    Visa      Guides    Match/
 Flights    Hotels    Activities Static    Groups    Travelers
    │           │         │          │          │          │
    └───────────┴─────────┴──────────┴──────────┴──────────┘
                    Provider abstraction (mock fallback)
```

---

## Backend modules

| Path | Role |
|------|------|
| `models/ConciergeSession.js` | Session state, messages, intent, plan, share token |
| `services/concierge/intent.js` | Rule-based + Claude intent extraction |
| `services/concierge/destinations.js` | IATA codes, coordinates, destination suggestions |
| `services/concierge/tools.js` | Inventory + social search orchestration |
| `services/concierge/orchestrator.js` | 7-step workflow, budget builder, SSE streaming |
| `controllers/concierge.controller.js` | REST + SSE endpoints |
| `routes/concierge.routes.js` | Route mounting |
| `middleware/optionalAuth.js` | Guest + authenticated sessions |

---

## Workflow steps

| Step | Module | Output |
|------|--------|--------|
| 1. Understand intent | `intent.js` | `origin`, `destination`, `budgetINR`, dates, travelers, style |
| 2. Follow-up | `orchestrator.js` | Natural question if `missingFields` non-empty |
| 3. Live search | `tools.js` | flights, hotels, activities, visa, packages |
| 4. Itinerary | `orchestrator.js` + Claude | Day-by-day plan, weather, tips |
| 5. Social | `tools.js` | travelers, groups, guides |
| 6. Budget | `orchestrator.js` | Breakdown + remaining budget |
| 7. Booking | `BookingSidebar.tsx` | Package links, save, share |

---

## Reused modules (no duplication)

| Existing | Used by concierge |
|----------|-------------------|
| `services/index.js` | Flight/hotel/activity providers |
| `services/visa/StaticVisaProvider` | Visa lookup |
| `services/maps/GoogleMapsProvider` | Geocoding |
| `models/Package`, `Guide`, `GroupTrip`, `TravelerMatch` | Recommendations |
| `models/Itinerary` | Save plan |
| `utils/claude.js` | LLM |
| `utils/integration.js` | Retry + mock fallback |
| `lib/api.ts` | bookings, guides, match, groups (frontend handoff) |

---

## Session model

- **Authenticated users:** `ConciergeSession.user` linked to `User`
- **Guests:** `guestId` header + `localStorage` (`xoxo_concierge_guest`)
- **Persistence:** MongoDB `conciergesessions` collection
- **Share:** `shareToken` → `/concierge/share/[token]`

---

## Failure handling

- Provider errors → mock fallback via `withMockFallback`
- Claude unavailable → rule-based intent + `buildDemoPlan`
- SSE stream failure → falls back to non-streaming JSON response
- Partial intent → gathering mode with targeted questions

---

## Security

- `optionalAuth` on session/message routes
- `protect` on save itinerary
- Guest sessions scoped by `x-guest-id` header
- Rate limited via `aiLimiter` (same as `/api/ai`)

---

## Future extensions

- Tool-use function calling (native Claude tools)
- Persistent cross-session memory on `User`
- Direct flight/hotel booking (`bookingType: flight | hotel`)
- Weather API integration
- Push notifications on price drops via `notify()`
