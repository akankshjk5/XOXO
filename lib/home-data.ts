export const NAV_ITEMS = [
  { href: "/packages", label: "Packages" },
  { href: "/destinations", label: "Destinations" },
  { href: "/ai-planner", label: "AI Planner" },
  { href: "/visa", label: "Visa" },
];

export const MORE_LINKS = [
  { href: "/visa", label: "Visa Assistance" },
  { href: "/packages", label: "Holiday Packages" },
  { href: "/ai-planner", label: "AI Trip Planner" },
  { href: "/community", label: "Community" },
  { href: "/guides", label: "Local Guides" },
];

export const TRUST_SIGNALS = [
  { icon: "✅", label: "2L+ Happy Travellers" },
  { icon: "⭐", label: "4.8/5 Rating" },
  { icon: "🛡️", label: "100% Safe Booking" },
  { icon: "💰", label: "Best Price Guarantee" },
  { icon: "🎧", label: "24/7 Support" },
];

export const DESTINATION_FILTERS = [
  { id: "all", label: "All" },
  { id: "honeymoon", label: "Honeymoon", emoji: "💑" },
  { id: "family", label: "Family", emoji: "👨‍👩‍👧" },
  { id: "adventure", label: "Adventure", emoji: "🏔" },
  { id: "international", label: "International", emoji: "✈️" },
  { id: "weekend", label: "Weekend", emoji: "🏖" },
  { id: "budget", label: "Budget", emoji: "💰" },
];

export interface PremiumDestination {
  id: string;
  name: string;
  slug: string;
  price: number;
  rating: number;
  reviews: number;
  badge?: "Hot" | "New" | "Deal";
  emoji: string;
  gradient: string;
  categories: string[];
}

export const PREMIUM_DESTINATIONS: PremiumDestination[] = [
  {
    id: "1", name: "Bali", slug: "bali", price: 45000, rating: 4.8, reviews: 234,
    badge: "Hot", emoji: "🌴",
    gradient: "linear-gradient(160deg, #0C447C 0%, #22C55E 100%)",
    categories: ["honeymoon", "international", "weekend"],
  },
  {
    id: "2", name: "Maldives", slug: "maldives", price: 85000, rating: 4.9, reviews: 312,
    badge: "Deal", emoji: "🏝️",
    gradient: "linear-gradient(160deg, #0C1F4A 0%, #378ADD 100%)",
    categories: ["honeymoon", "international"],
  },
  {
    id: "3", name: "Thailand", slug: "thailand", price: 35000, rating: 4.7, reviews: 456,
    badge: "Hot", emoji: "🛕",
    gradient: "linear-gradient(160deg, #F97316 0%, #FBBF24 100%)",
    categories: ["budget", "international", "family"],
  },
  {
    id: "4", name: "Dubai", slug: "dubai", price: 55000, rating: 4.8, reviews: 189,
    emoji: "🏙️",
    gradient: "linear-gradient(160deg, #185FA5 0%, #64748B 100%)",
    categories: ["family", "international", "adventure"],
  },
  {
    id: "5", name: "Switzerland", slug: "switzerland", price: 120000, rating: 4.9, reviews: 98,
    badge: "New", emoji: "🏔️",
    gradient: "linear-gradient(160deg, #0C447C 0%, #94A3B8 100%)",
    categories: ["adventure", "international", "honeymoon"],
  },
  {
    id: "6", name: "Goa", slug: "goa", price: 15000, rating: 4.5, reviews: 421,
    badge: "Deal", emoji: "🏖️",
    gradient: "linear-gradient(160deg, #F97316 0%, #22C55E 100%)",
    categories: ["weekend", "budget", "family"],
  },
  {
    id: "7", name: "Singapore", slug: "singapore", price: 65000, rating: 4.7, reviews: 167,
    emoji: "🦁",
    gradient: "linear-gradient(160deg, #0C1F4A 0%, #F97316 100%)",
    categories: ["family", "international"],
  },
  {
    id: "8", name: "Kerala", slug: "kerala", price: 20000, rating: 4.6, reviews: 289,
    emoji: "🌿",
    gradient: "linear-gradient(160deg, #22C55E 0%, #0C447C 100%)",
    categories: ["family", "weekend", "budget"],
  },
];

export interface PremiumPackage {
  id: string;
  title: string;
  duration: string;
  emoji: string;
  gradient: string;
  bookings: number;
  tags: string[];
  rating: number;
  reviews: number;
  price: number;
  originalPrice: number;
}

export const PREMIUM_PACKAGES: PremiumPackage[] = [
  {
    id: "pkg-1",
    title: "Romantic Bali — 6N/7D",
    duration: "6 Nights",
    emoji: "🌴",
    gradient: "linear-gradient(135deg, #0C447C, #22C55E)",
    bookings: 847,
    tags: ["Flights Included", "4-Star Hotel", "Breakfast"],
    rating: 4.9,
    reviews: 1200,
    price: 55000,
    originalPrice: 72000,
  },
  {
    id: "pkg-2",
    title: "Dubai Family Fun — 5N/6D",
    duration: "5 Nights",
    emoji: "🏙️",
    gradient: "linear-gradient(135deg, #185FA5, #64748B)",
    bookings: 623,
    tags: ["Desert Safari", "5-Star Hotel", "Burj Khalifa"],
    rating: 4.8,
    reviews: 890,
    price: 48999,
    originalPrice: 62000,
  },
  {
    id: "pkg-3",
    title: "Thailand Explorer — 7N/8D",
    duration: "7 Nights",
    emoji: "🛕",
    gradient: "linear-gradient(135deg, #F97316, #FBBF24)",
    bookings: 512,
    tags: ["Flights Included", "Island Hopping", "Street Food Tour"],
    rating: 4.7,
    reviews: 756,
    price: 32999,
    originalPrice: 42000,
  },
  {
    id: "pkg-4",
    title: "Maldives Overwater — 4N/5D",
    duration: "4 Nights",
    emoji: "🏝️",
    gradient: "linear-gradient(135deg, #0C1F4A, #378ADD)",
    bookings: 394,
    tags: ["Overwater Villa", "All Meals", "Snorkeling"],
    rating: 4.9,
    reviews: 534,
    price: 99999,
    originalPrice: 125000,
  },
  {
    id: "pkg-5",
    title: "Swiss Alps Adventure — 8N/9D",
    duration: "8 Nights",
    emoji: "🏔️",
    gradient: "linear-gradient(135deg, #0C447C, #94A3B8)",
    bookings: 278,
    tags: ["Swiss Pass", "Scenic Trains", "4-Star Hotels"],
    rating: 4.8,
    reviews: 312,
    price: 145999,
    originalPrice: 175000,
  },
];

export const SOCIAL_FEATURES = [
  {
    title: "Solo Traveler Match",
    description: "Find travel buddies with similar interests, dates, and destinations. Never explore alone again.",
    href: "/match",
    emoji: "👥",
    gradient: "linear-gradient(135deg, #0C447C, #378ADD)",
  },
  {
    title: "Traveler Nearby",
    description: "Discover fellow travellers around you on the map. Connect, chat, and explore together.",
    href: "/nearby",
    emoji: "📍",
    gradient: "linear-gradient(135deg, #F97316, #FBBF24)",
  },
  {
    title: "Local Guides",
    description: "Book verified local guides for authentic, off-the-beaten-path experiences worldwide.",
    href: "/guides",
    emoji: "🧭",
    gradient: "linear-gradient(135deg, #22C55E, #0C447C)",
  },
];

export const TESTIMONIALS = [
  {
    id: "1",
    quote: "XOXO planned our Bali honeymoon perfectly. Every detail was taken care of — from flights to the private villa. The 24/7 support during the trip was incredible.",
    name: "Priya Sharma",
    trip: "Travelled to Bali, Nov 2024",
    initials: "PS",
    color: "#0C447C",
  },
  {
    id: "2",
    quote: "The AI itinerary builder saved me hours of research. Found a travel buddy through Solo Match for my Thailand trip. This app changed how I travel solo.",
    name: "Rahul Mehta",
    trip: "Travelled to Thailand, Jan 2025",
    initials: "RM",
    color: "#F97316",
  },
  {
    id: "3",
    quote: "Booked our Dubai family package with zero hassle. Transparent pricing, no hidden costs, and the day-by-day itinerary made travelling with kids stress-free.",
    name: "Ananya Reddy",
    trip: "Travelled to Dubai, Dec 2024",
    initials: "AR",
    color: "#22C55E",
  },
  {
    id: "4",
    quote: "Our Switzerland trip was meticulously planned. The scenic train rides, hotel choices, and day-by-day itinerary exceeded all expectations. Highly recommend!",
    name: "Vikram Singh",
    trip: "Travelled to Switzerland, Feb 2025",
    initials: "VS",
    color: "#185FA5",
  },
];

export const FOOTER_DESTINATIONS = ["Bali", "Thailand", "Maldives", "Switzerland", "Dubai", "Singapore", "Goa", "Kerala"];

export const SAMPLE_ITINERARY = [
  { day: "Day 1", title: "Arrival & Ubud", activity: "Temple visit, rice terrace walk, welcome dinner" },
  { day: "Day 2", title: "Culture & Nature", activity: "Monkey forest, art market, spa session" },
  { day: "Day 3", title: "Beach Day", activity: "Seminyak beach, water sports, sunset cruise" },
];
