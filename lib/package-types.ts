export interface FlightSuggestion {
  airline: string;
  airlineCode: string;
  departureAirport: string;
  arrivalAirport: string;
  duration: string;
  stops: string;
  priceINR: number;
  departureWindow: string;
  returnWindow: string;
  affiliateUrl: string;
}

export interface HotelSuggestion {
  tier: string;
  label: string;
  name: string;
  rating: number;
  pricePerNightINR: number;
  totalINRNights: number;
  distanceKm: number;
  amenities: string[];
  image: string;
  affiliateUrl: string;
}

export interface ChecklistSection {
  title: string;
  items: { id: string; label: string; checked: boolean }[];
}

export interface TravelChecklist {
  sections: ChecklistSection[];
  packageTitle: string;
  destination?: string;
  country?: string;
}

export interface PackageFlags {
  featured?: boolean;
  trending?: boolean;
  isLuxury?: boolean;
  isPopular?: boolean;
  isVisaFree?: boolean;
  isHidden?: boolean;
  status?: "draft" | "published";
}
