/**
 * Future feature architecture scaffolds — not implemented.
 * Each entry documents the intended module boundary for v2+.
 */

export type FutureFeatureStatus = "planned" | "scaffold" | "beta" | "live";

export interface FutureFeature {
  id: string;
  name: string;
  status: FutureFeatureStatus;
  description: string;
  /** Suggested route or API namespace */
  route?: string;
  apiNamespace?: string;
}

export const FUTURE_FEATURES: FutureFeature[] = [
  { id: "multi-vendor", name: "Multi-vendor Partners", status: "scaffold", description: "Partner onboarding, commissions, and inventory sync.", apiNamespace: "/api/partners" },
  { id: "hotel-inventory", name: "Hotel Inventory", status: "scaffold", description: "Real-time hotel availability and rate plans.", apiNamespace: "/api/inventory/hotels" },
  { id: "flight-inventory", name: "Flight Inventory", status: "scaffold", description: "GDS/NDC flight search and booking.", apiNamespace: "/api/inventory/flights" },
  { id: "ai-itinerary", name: "AI Itinerary Builder", status: "beta", description: "Generative day-by-day itineraries.", route: "/ai-planner", apiNamespace: "/api/ai" },
  { id: "ai-assistant", name: "AI Travel Assistant", status: "beta", description: "Concierge chat with tool use.", route: "/concierge", apiNamespace: "/api/concierge" },
  { id: "loyalty", name: "Loyalty Points", status: "planned", description: "Earn/redeem points on bookings.", apiNamespace: "/api/wallet" },
  { id: "referral", name: "Referral Program", status: "planned", description: "Invite friends, earn credits.", apiNamespace: "/api/referrals" },
  { id: "affiliate", name: "Affiliate Dashboard", status: "planned", description: "Partner links and conversion tracking.", route: "/affiliate" },
  { id: "corporate", name: "Corporate Travel", status: "planned", description: "Company accounts and approval flows.", route: "/corporate" },
  { id: "i18n", name: "Multi-language", status: "planned", description: "Locale routing and translated content.", route: "/[locale]" },
  { id: "multi-currency", name: "Multi-currency", status: "planned", description: "Display and settle in user currency.", apiNamespace: "/api/currency" },
  { id: "pwa", name: "PWA", status: "scaffold", description: "Installable app with manifest.", route: "/manifest.json" },
  { id: "offline", name: "Offline Mode", status: "planned", description: "Cached itineraries and saved trips.", apiNamespace: "/api/sync" },
];

export function getFeatureById(id: string): FutureFeature | undefined {
  return FUTURE_FEATURES.find((f) => f.id === id);
}
