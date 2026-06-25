export type TransportMode =
  | "flight"
  | "bus"
  | "train"
  | "metro"
  | "taxi"
  | "bike_taxi"
  | "self_drive"
  | "car_rental"
  | "ferry"
  | "cruise"
  | "airport_transfer";

export interface TransportOffer {
  id: string;
  mode: TransportMode;
  providerId: string;
  providerLabel: string;
  origin: string;
  originLabel: string;
  destination: string;
  destinationLabel: string;
  departureAt: string;
  arrivalAt: string;
  durationMinutes: number;
  stops: number;
  price: number;
  currency: string;
  provider: string;
  live?: boolean;
  vehicleClass?: string;
  summary?: string;
}

export interface TransportGroup {
  mode: TransportMode | string;
  label: string;
  count: number;
  offers: TransportOffer[];
  status?: "coming_soon";
}

export interface TransportRecommendation {
  id: string;
  mode: string;
  label: string;
  price?: number;
  durationMinutes?: number;
}

export interface TransportSearchResult {
  offers: TransportOffer[];
  grouped: TransportGroup[];
  recommendations: {
    cheapest: TransportRecommendation | null;
    fastest: TransportRecommendation | null;
    bestValue: TransportRecommendation | null;
  };
  meta: {
    origin: string;
    destination: string;
    departureDate: string;
    total: number;
    modesSearched: string[];
    demo?: boolean;
  };
}

export interface TransportFilters {
  maxPrice?: number;
  minPrice?: number;
  maxDuration?: number;
  maxStops?: number;
  departureAfter?: string;
  departureBefore?: string;
  providerLabel?: string;
  sort?: "price" | "duration" | "departure";
}

export const MODE_ICONS: Record<string, string> = {
  flight: "✈️",
  bus: "🚌",
  train: "🚆",
  metro: "🚇",
  taxi: "🚕",
  bike_taxi: "🏍️",
  self_drive: "🚗",
  car_rental: "🚙",
  ferry: "⛴️",
  cruise: "🛳️",
  airport_transfer: "🛫",
};
