export type HotelCategory = "luxury" | "premium" | "budget";
export type FlightClass = "economy" | "premium_economy" | "business";
export type TravelStyle = "adventure" | "romantic" | "family" | "luxury" | "backpacking";

export interface BudgetInput {
  adults: number;
  children: number;
  hotelCategory: HotelCategory;
  flightClass: FlightClass;
  travelStyle: TravelStyle;
  budgetINR: number;
  packagePricePerPerson: number;
  durationDays: number;
}

export interface BudgetBreakdown {
  flights: number;
  hotels: number;
  transport: number;
  food: number;
  activities: number;
  taxes: number;
  total: number;
  savings: number;
  withinBudget: boolean;
}

const HOTEL_MULT: Record<HotelCategory, number> = {
  luxury: 1.8,
  premium: 1.2,
  budget: 0.75,
};

const FLIGHT_MULT: Record<FlightClass, number> = {
  economy: 1,
  premium_economy: 1.4,
  business: 2.5,
};

const STYLE_MULT: Record<TravelStyle, number> = {
  adventure: 1.1,
  romantic: 1.25,
  family: 1.15,
  luxury: 1.5,
  backpacking: 0.85,
};

export function calculateBudget(input: BudgetInput): BudgetBreakdown {
  const travelers = input.adults + input.children * 0.6;
  const nights = Math.max(1, input.durationDays - 1);
  const base = input.packagePricePerPerson * travelers;

  const flights = Math.round(base * 0.32 * FLIGHT_MULT[input.flightClass]);
  const hotels = Math.round(base * 0.28 * HOTEL_MULT[input.hotelCategory] * (nights / 5));
  const transport = Math.round(base * 0.08 * STYLE_MULT[input.travelStyle]);
  const food = Math.round(base * 0.12 * (input.adults + input.children * 0.5));
  const activities = Math.round(base * 0.15 * STYLE_MULT[input.travelStyle]);
  const subtotal = flights + hotels + transport + food + activities;
  const taxes = Math.round(subtotal * 0.05);
  const total = subtotal + taxes;
  const savings = Math.max(0, input.budgetINR - total);

  return {
    flights,
    hotels,
    transport,
    food,
    activities,
    taxes,
    total,
    savings,
    withinBudget: total <= input.budgetINR,
  };
}
