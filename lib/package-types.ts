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

export interface CorporatePackageInfo {
  companyName?: string;
  employeeCountMin?: number;
  employeeCountMax?: number;
  meetingLocation?: string;
  travelTypes?: string[];
  supportsInvoice?: boolean;
  supportsGst?: boolean;
  dedicatedTravelManager?: boolean;
  customPricing?: boolean;
  negotiatedHotels?: boolean;
  airportTransfers?: boolean;
}

export interface PackageRecord {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  destination?: string | { _id: string; name?: string };
  durationDays: number;
  durationNights?: number;
  pricePerPerson: number;
  originalPrice?: number;
  maxPeople?: number;
  minPeople?: number;
  category?: string;
  images?: string[];
  inclusions?: string[];
  exclusions?: string[];
  highlights?: string[];
  corporate?: CorporatePackageInfo;
  status?: "draft" | "published";
}
