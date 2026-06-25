# XOXO AI Travel Concierge — UI Guide

_Route: `/concierge` · Design system: XOXO green-dark / green-bright_

---

## Layout

Three-column workspace (stacks on mobile):

```
┌────────────────────────────────────────────────────────────┐
│  Header: title + "New trip"                                │
├──────────────┬─────────────────────┬───────────────────────┤
│  Chat (4col) │  Plan panel (5col)  │  Sidebar (3col)       │
│              │  · Map preview      │  · Budget dashboard   │
│  Messages    │  · Itinerary timeline│  · Booking cards     │
│  Prompts     │  · Highlights       │  · Social recs        │
│  Input       │                     │  · Save / Share       │
└──────────────┴─────────────────────┴───────────────────────┘
```

---

## Components

| Component | Path | Purpose |
|-----------|------|---------|
| `ConciergeWorkspace` | `components/concierge/ConciergeWorkspace.tsx` | Page shell + state |
| `ConciergeChat` | `components/concierge/ConciergeChat.tsx` | Chat + prompts + SSE |
| `ItineraryTimeline` | `components/concierge/ItineraryTimeline.tsx` | Day-by-day vertical timeline |
| `BudgetDashboard` | `components/concierge/BudgetDashboard.tsx` | Bar breakdown + remaining |
| `BookingSidebar` | `components/concierge/BookingSidebar.tsx` | Flights/hotels/activities + CTAs |
| `MapPreview` | `components/concierge/MapPreview.tsx` | OpenStreetMap embed |

---

## Hooks & types

| File | Purpose |
|------|---------|
| `hooks/useConcierge.ts` | Session init, send, stream, new trip |
| `lib/concierge-types.ts` | TypeScript interfaces |
| `lib/api.ts` → `conciergeAPI` | HTTP + SSE client |

---

## User flows

### 1. First visit

1. Auto-creates session with welcome message
2. Shows 3 suggested prompts
3. User types or taps prompt
4. Streaming response in chat bubble
5. Plan panel populates when `status: plan_ready`

### 2. Incomplete query

User: *"I want a relaxing trip"*

- Concierge asks for budget, dates, destination
- Timeline shows placeholder state
- Budget panel shows placeholder

### 3. Complete query

User: *"₹80,000 honeymoon Bali 6 days December"*

- Chat confirms plan
- Map shows Bali
- Timeline shows 6 days
- Budget shows breakdown vs ₹80,000
- Sidebar shows top flight + hotel
- Social section shows matching travelers (if any)

### 4. Save & share

- **Save** → requires login → `itinerariesAPI` via backend save
- **Share** → copies `/concierge/share/[token]` to clipboard

---

## Design tokens

| Element | Classes |
|---------|---------|
| Primary CTA | `bg-green-dark text-white rounded-full` |
| Accent | `text-green-bright`, `bg-green-bright/10` |
| Cards | `rounded-2xl border shadow-elevated` |
| User bubble | `bg-green-dark text-white` |
| Assistant bubble | `bg-off-white border` |
| Chat header | `bg-gradient-to-r from-green-dark to-green-mid` |

Matches existing `CinematicHero`, `AIPlanner`, and navbar styling.

---

## Loading states

| State | UI |
|-------|-----|
| Session init | Full-page spinner + "Starting your concierge session…" |
| Sending message | Input disabled, send button spinner |
| Streaming | Bouncing dots in empty assistant bubble |
| No plan yet | Dashed border placeholders in timeline/budget |
| Saving | Sidebar button spinner |

---

## Responsive behavior

| Breakpoint | Layout |
|------------|--------|
| Mobile | Single column: chat → map → timeline → budget → sidebar |
| `lg` (1024px+) | 4 / 5 / 3 column grid |
| Min chat height | `min-h-[480px]` on desktop |

---

## Navigation integration

| Location | Link |
|----------|------|
| Navbar | "Concierge" → `/concierge` |
| Footer | "AI Concierge" |
| Trippie widget | Opens `/concierge` |
| `/ai-planner` | Redirects to `/concierge` |
| Dashboard saved trips | Still lists itineraries from save flow |

---

## Accessibility

- Send button `aria-label="Send"`
- Map iframe `title` includes destination
- Toast feedback for save/share/errors
- Keyboard: Enter to send in chat form

---

## Pages

| Route | File |
|-------|------|
| `/concierge` | `app/(main)/concierge/page.tsx` |
| `/concierge/share/[token]` | `app/(main)/concierge/share/[token]/page.tsx` |
