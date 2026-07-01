export interface ConciergeMessage {
  role: "user" | "assistant" | "system";
  content: string;
  _id?: string;
  createdAt?: string;
}

export interface ConciergeIntent {
  origin?: string;
  originCity?: string;
  destination?: string;
  budgetINR?: number;
  budgetLabel?: string;
  departureDate?: string;
  returnDate?: string;
  durationDays?: number;
  travelers?: number;
  children?: number;
  seniors?: number;
  tripType?: string;
  travelStyle?: string[];
  interests?: string[];
  visaPreference?: string;
  hotelCategory?: string;
  socialPreference?: string;
  openDestination?: boolean;
  luxuryLevel?: string;
  adventureLevel?: string;
  flightPreference?: string;
  foodPreferences?: string[];
  scope?: string;
}

export interface BudgetBreakdown {
  currency: string;
  totalBudget: number;
  breakdown: {
    flights: number;
    hotels: number;
    activities: number;
    localTransport: number;
    food: number;
    shopping: number;
    emergencyReserve: number;
  };
  subtotal: number;
  remaining: number | null;
  perPerson: number | null;
  withinBudget: boolean | null;
}

export interface ConciergePlan {
  itinerary?: {
    destination: string;
    totalDays: number;
    estimatedBudget?: string;
    bestTimeToVisit?: string;
    weatherSummary?: string;
    days: Array<{
      day: number;
      title: string;
      morning?: { activity?: string; duration?: string; tip?: string };
      afternoon?: { activity?: string; duration?: string; tip?: string };
      evening?: { activity?: string; duration?: string; tip?: string };
      meals?: { breakfast?: string; lunch?: string; dinner?: string };
      transport?: string;
      estimatedCost?: string;
    }>;
    transportTips?: string[];
    packingTips?: string[];
    localTips?: string[];
  };
  budget?: BudgetBreakdown;
  rankedFlights?: Array<Record<string, unknown>>;
  rankedHotels?: Array<Record<string, unknown>>;
  topActivities?: Array<Record<string, unknown>>;
  packages?: Array<Record<string, unknown>>;
  social?: {
    travelers?: Array<Record<string, unknown>>;
    groups?: Array<Record<string, unknown>>;
    guides?: Array<Record<string, unknown>>;
  };
  visa?: Record<string, unknown>;
  geo?: { lat: number; lng: number; label?: string };
  suggestions?: Array<{ name: string; key: string; estimatedFrom?: number }>;
  highlights?: string[];
}

export interface ConciergeSession {
  id: string;
  title: string;
  status: "gathering" | "searching" | "plan_ready" | "archived";
  messages: ConciergeMessage[];
  intent: ConciergeIntent;
  missingFields?: string[];
  searchResults?: Record<string, unknown>;
  plan: ConciergePlan | null;
  pageContext?: Record<string, unknown>;
  shareToken?: string;
  savedItineraryId?: string;
}
