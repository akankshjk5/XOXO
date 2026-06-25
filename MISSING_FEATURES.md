# XOXO Travels — Feature Audit Matrix

_Audit date: 2026-06-24_

**Status legend:** ✅ Completed · 🟡 Partially Completed · ❌ Missing
**Complexity:** Low / Medium / High
**Priority:** MVP / V2 / V3

> "Partially Completed" usually means a Mongoose model and/or a stray util exists, but there is no controller, route, or UI wired end-to-end.

---

## A. Booking Ecosystem

| Feature | Status | Complexity | Priority | Dependencies |
|---|---|---|---|---|
| Package Booking (core) | 🟡 | High | MVP | Booking controller/routes, Payments, Auth guard. Currently UI-only ("Book Now" = toast) |
| Flight Booking (Amadeus/Sabre) | ❌ | High | V2 | 3rd-party GDS API keys, fare cache, Payments, traveler KYC |
| Hotel Booking | ❌ | High | V2 | Hotel inventory API or own inventory, Payments |
| Bus Booking | ❌ | Medium | V3 | Aggregator API (e.g. RedBus), Payments |
| Train Booking | ❌ | High | V3 | IRCTC/partner API (regulated), Payments, KYC |
| Cruise Booking | ❌ | High | V3 | Cruise inventory partner, Payments |
| Car Rental Booking | ❌ | Medium | V3 | Rental partner API, Payments |
| Taxi Booking | ❌ | Medium | V3 | Ride API (Uber/Ola) or own, live location |
| Travel Insurance | ❌ | Medium | V2 | Insurer partner API, Payments, KYC |
| Visa Assistance | 🟡 | Medium | MVP | AI Visa Assistant, inquiry model, email. AI tips endpoint exists; no `/visa` page or inquiry flow |

---

## B. Social Travel Features

| Feature | Status | Complexity | Priority | Dependencies |
|---|---|---|---|---|
| Solo Traveler Matchmaking | 🟡 | High | V2 | `TravelerMatch` model exists; needs matching engine, controller, UI, Auth |
| Traveler Nearby | ❌ | High | V2 | Geolocation, geospatial index, live location consent, privacy |
| Travel Buddy Scanner | ❌ | High | V3 | Matching engine, real-time presence, verification |
| Group Travel Community | ❌ | Medium | V2 | Group model, chat, feed |
| Travel Feed / Social Posts | ❌ | Medium | V2 | Post model, media upload (Cloudinary), feed ranking |
| Friend Requests | ❌ | Low | V2 | Friendship model, notifications |
| Traveler Verification | ❌ | High | V2 | KYC, document upload, admin review |
| Trusted Traveler Badge | ❌ | Low | V2 | Verification + trustScore logic (field exists, unused) |

---

## C. AI Features

| Feature | Status | Complexity | Priority | Dependencies |
|---|---|---|---|---|
| AI Travel Concierge (Trippie) | 🟡 | Medium | MVP | `/ai/chat` + widget done in **demo mode**; needs real `ANTHROPIC_API_KEY`, server streaming, destination cards |
| AI Itinerary Builder | 🟡 | Medium | MVP | `/ai/itinerary` endpoint exists (demo); **no `/ai-planner` UI**, no save flow |
| AI Visa Assistant | 🟡 | Medium | MVP | `/ai/destination-tips` exists; needs dedicated visa prompt + `/visa` UI |
| AI Budget Planner | ❌ | Medium | V2 | Claude prompt, pricing data, UI |
| AI Destination Recommender | ❌ | Medium | V2 | Claude + destination data, preferences, UI |
| AI Travel Matching Engine | ❌ | High | V2 | TravelerMatch + embeddings/scoring, social graph |
| AI Emergency Assistant | ❌ | Medium | V3 | Safety module, embassy data, SOS |

---

## D. Marketplace

| Feature | Status | Complexity | Priority | Dependencies |
|---|---|---|---|---|
| Local Guides Marketplace | 🟡 | High | V2 | `Guide` model exists; needs controller/routes, listing/profile/booking UI, Payments |
| Local Experiences Marketplace | ❌ | High | V2 | Experience model, host onboarding, Payments |
| Food Tours | ❌ | Medium | V3 | Experiences marketplace |
| Adventure Activities | ❌ | Medium | V3 | Experiences marketplace |
| Group Departures | ❌ | Medium | V2 | Package scheduling, seats inventory, group booking |
| Host Earnings Dashboard | ❌ | Medium | V2 | Guide/host payouts, Payments ledger, admin |

---

## E. Safety Features

| Feature | Status | Complexity | Priority | Dependencies |
|---|---|---|---|---|
| KYC Verification | ❌ | High | V2 | Document upload (Cloudinary), admin review, encryption |
| Emergency SOS | ❌ | Medium | V2 | Live location, emergency contacts, notifications |
| Live Location Sharing | ❌ | High | V2 | Geolocation, Socket.io, consent/privacy |
| Female Safe Travel Mode | ❌ | Medium | V2 | Verification, curated content, safety toggles |
| Emergency Contacts | ❌ | Low | V2 | User profile fields, SOS |
| Embassy Information | ❌ | Low | V3 | Static/3rd-party embassy dataset |

---

## F. Payments

| Feature | Status | Complexity | Priority | Dependencies |
|---|---|---|---|---|
| Razorpay Integration | 🟡 | Medium | MVP | `utils/razorpay.js` (order + signature verify helpers) present; **no controller/route/UI** |
| Wallet System | ❌ | Medium | V2 | Wallet/ledger model, transactions, Payments |
| Rewards Points | 🟡 | Medium | V2 | `rewardPoints` field exists; no earn/redeem logic |
| Referral System | ❌ | Medium | V2 | Referral codes, attribution, rewards |
| Split Payments for Groups | ❌ | High | V3 | Group booking, partial payments, ledger |
| Refund Management | ❌ | Medium | V2 | Razorpay refunds, booking cancel flow, admin |

---

## G. User Features

| Feature | Status | Complexity | Priority | Dependencies |
|---|---|---|---|---|
| Booking History | ❌ | Low | MVP | Booking controller, dashboard UI, Auth |
| Saved Itineraries | 🟡 | Low | MVP | `Itinerary` model exists; no routes/UI |
| Saved Trips | ❌ | Low | V2 | Trip model or reuse itineraries, dashboard |
| Wishlist | ❌ | Low | MVP | User wishlist field/routes, heart button + toast |
| Reviews & Ratings | 🟡 | Medium | MVP | `Review` model exists; no controller/routes; detail shows static review |
| Travel Locker (docs) | 🟡 | Medium | V2 | Type referenced; needs model, secure upload, encryption |
| Notification Center | ❌ | Medium | V2 | Notification model, Socket.io, UI bell |

---

## H. Community

| Feature | Status | Complexity | Priority | Dependencies |
|---|---|---|---|---|
| Real-time Chat (1:1) | 🟡 | Medium | V2 | Socket server + `Message` model exist; **no chat routes, no UI** |
| Group Chat | ❌ | Medium | V2 | Room/group model, Socket.io |
| Voice Calling | ❌ | High | V3 | WebRTC/Twilio, signaling server |
| Video Calling | ❌ | High | V3 | WebRTC/Twilio, TURN/STUN |
| Auto Translation | ❌ | Medium | V3 | Translation API (Claude/Google), per-message |
| Community Feed | ❌ | Medium | V2 | Post model, media, ranking (overlaps Social Feed) |

---

## I. Admin Panel

| Feature | Status | Complexity | Priority | Dependencies |
|---|---|---|---|---|
| User Management | ❌ | Medium | V2 | Admin routes, `adminOnly` (exists), admin UI |
| Guide Verification | ❌ | Medium | V2 | Guide marketplace, KYC, admin UI |
| Booking Management | ❌ | Medium | MVP→V2 | Booking controller, admin UI |
| Revenue Analytics | ❌ | Medium | V2 | Payments ledger, aggregation, charts |
| Fraud Detection | ❌ | High | V3 | Rules/ML, payment + KYC signals |
| Content Moderation | ❌ | Medium | V3 | Feed/reviews, report queue, admin UI |

---

## Summary Counts

| Category | ✅ | 🟡 | ❌ | Total |
|---|---|---|---|---|
| Booking Ecosystem | 0 | 2 | 8 | 10 |
| Social Travel | 0 | 1 | 7 | 8 |
| AI Features | 0 | 3 | 4 | 7 |
| Marketplace | 0 | 1 | 5 | 6 |
| Safety | 0 | 0 | 6 | 6 |
| Payments | 0 | 2 | 4 | 6 |
| User Features | 0 | 3 | 4 | 7 |
| Community | 0 | 1 | 5 | 6 |
| Admin | 0 | 0 | 6 | 6 |
| **Total** | **0** | **13** | **49** | **62** |

**Foundations completed** (not in the vision list but real progress): Auth (JWT), Packages API + UI, Destinations API + UI, global Search API, AI demo layer, design system + animations, seed data.
