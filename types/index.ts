export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  nationality: string | null;
  bio: string | null;
  is_guide: boolean;
  is_verified: boolean;
  trust_score: number;
  travel_style: string[] | null;
  languages: string[] | null;
  created_at: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  slug: string;
  cover_image: string | null;
  description: string | null;
  category: string[] | null;
  avg_price_inr: number | null;
  best_season: string | null;
  visa_required: boolean;
  created_at: string;
}

export interface Package {
  id: string;
  destination_id: string | null;
  title: string;
  description: string | null;
  duration_days: number | null;
  price_per_person: number | null;
  max_people: number | null;
  inclusions: string[] | null;
  exclusions: string[] | null;
  itinerary: ItineraryDay[] | null;
  images: string[] | null;
  category: string | null;
  badge: "hot" | "new" | "deal" | null;
  rating: number | null;
  review_count: number;
  created_at: string;
  destination?: Destination;
}

export interface ItineraryDay {
  day: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
}

export interface Booking {
  id: string;
  user_id: string | null;
  package_id: string | null;
  booking_type: string;
  status: "pending" | "confirmed" | "cancelled";
  travel_date: string | null;
  num_travelers: number | null;
  total_amount: number | null;
  razorpay_payment_id: string | null;
  razorpay_order_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  package?: Package;
}

export interface Guide {
  id: string;
  user_id: string | null;
  city: string | null;
  expertise: string[] | null;
  hourly_rate: number | null;
  daily_rate: number | null;
  languages: string[] | null;
  description: string | null;
  photos: string[] | null;
  rating: number | null;
  total_reviews: number;
  is_verified: boolean;
  created_at: string;
  profile?: Profile;
}

export interface GroupTrip {
  id: string;
  creator_id: string | null;
  destination: string;
  departure_date: string;
  return_date: string;
  max_members: number;
  current_members: number;
  trip_style: string | null;
  description: string | null;
  cost_per_person: number | null;
  status: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string | null;
  receiver_id: string | null;
  trip_id: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface TravelLockerDoc {
  id: string;
  user_id: string | null;
  doc_type: "passport" | "visa" | "insurance" | "ticket" | "hotel";
  doc_name: string | null;
  file_url: string | null;
  expiry_date: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string | null;
  package_id: string | null;
  guide_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  profile?: Profile;
}

export interface TravelerProfile {
  id: string;
  user_id: string | null;
  destination: string | null;
  travel_style: string | null;
  looking_for: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_at: string;
  profile?: Profile;
}

export interface SearchTab {
  id: string;
  label: string;
  icon: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  text: string;
  destination: string;
}

export interface RecentlyBooked {
  id: string;
  userName: string;
  userInitial: string;
  city: string;
  bookedAgo: string;
  title: string;
  cities: string;
  tripType: "COUPLE" | "FAMILY" | "SOLO" | "FRIENDS";
  price: number;
  nights: number;
  image?: string;
}

export interface PressMention {
  id: string;
  source: string;
  quote: string;
  date: string;
  url: string;
}
