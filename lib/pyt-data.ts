import { DESTINATION_IMAGES, TRAVELER_IMAGES } from "@/lib/images";

export const DRAWER_MENU = [
  { label: "Family Theme Packages", href: "/packages?type=family" },
  { label: "Honeymoon Theme Packages", href: "/packages?type=honeymoon" },
  { label: "Adventure Theme Packages", href: "/packages?type=adventure" },
  { label: "International Destinations", href: "/destinations" },
  { label: "Visa Assistance", href: "/visa" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "Contact us", href: "tel:+919240204872" },
  { label: "AI Trip Planner", href: "/ai-planner" },
  { label: "Travel Community", href: "/community" },
];

export const TRAVELER_TYPES = [
  { id: "couple", label: "COUPLE", emoji: "💑", image: TRAVELER_IMAGES.couple },
  { id: "family", label: "FAMILY", emoji: "👨‍👩‍👧", image: TRAVELER_IMAGES.family },
  { id: "friends", label: "FRIENDS", emoji: "👯", image: TRAVELER_IMAGES.friends },
  { id: "solo", label: "SOLO", emoji: "🧳", image: TRAVELER_IMAGES.solo },
];

export const BUDGET_FILTERS = [
  { id: "all", label: "All Destinations" },
  { id: "under-50k", label: "Under ₹50K" },
  { id: "50k-1.5l", label: "₹50K to ₹1.5L" },
  { id: "1.5l-2.5l", label: "₹1.5L to ₹2.5L" },
  { id: "luxury", label: "Luxury" },
];

export interface BookingCard {
  id: string;
  userInitial: string;
  userColor: string;
  userName: string;
  city: string;
  bookedAgo: string;
  title: string;
  image: string;
  emoji: string;
  price: number;
}

export const RECENT_BOOKINGS: BookingCard[] = [
  {
    id: "1", userInitial: "A", userColor: "#E74C3C", userName: "Aziz", city: "Bengaluru", bookedAgo: "1hr ago",
    title: "Couple Escape: 5 Nights In Baku", image: DESTINATION_IMAGES.baku, emoji: "🏛️", price: 55542,
  },
  {
    id: "2", userInitial: "J", userColor: "#3498DB", userName: "Jay", city: "Chennai", bookedAgo: "2hr ago",
    title: "Couple Escape: 15 Nights In Como, Rome, Florence, Paris And Lucerne", image: DESTINATION_IMAGES.italy, emoji: "🏰", price: 165518,
  },
  {
    id: "3", userInitial: "A", userColor: "#9B59B6", userName: "Aishwarya", city: "Bengaluru", bookedAgo: "18hr ago",
    title: "Couple Holiday: 10 Nights In Split, Dubrovnik And Zagreb", image: DESTINATION_IMAGES.croatia, emoji: "⛵", price: 157097,
  },
  {
    id: "4", userInitial: "V", userColor: "#F39C12", userName: "Vicky", city: "Bengaluru", bookedAgo: "21hr ago",
    title: "Family Escape: 11 Nights In Grindelwald, Milan And Lucerne", image: DESTINATION_IMAGES.switzerland, emoji: "🏔️", price: 90921,
  },
  {
    id: "5", userInitial: "K", userColor: "#1ABC9C", userName: "Kriti", city: "New Delhi", bookedAgo: "2hr ago",
    title: "Family Escape: 6 Nights In Da Nang And Hanoi", image: DESTINATION_IMAGES.vietnam, emoji: "🛕", price: 45610,
  },
];

export interface DestinationCard {
  id: string;
  subLabel: string;
  name: string;
  slug: string;
  image: string;
  emoji: string;
}

export const TRENDING_DESTINATIONS: DestinationCard[] = [
  { id: "1", subLabel: "EXPLORE THE BEAUTY OF", name: "Thailand", slug: "thailand", image: DESTINATION_IMAGES.thailand, emoji: "🛕" },
  { id: "2", subLabel: "CREATE MEMORIES IN", name: "Maldives", slug: "maldives", image: DESTINATION_IMAGES.maldives, emoji: "🏝️" },
  { id: "3", subLabel: "DISCOVER THE MAGIC OF", name: "Bali", slug: "bali", image: DESTINATION_IMAGES.bali, emoji: "🌴" },
  { id: "4", subLabel: "EXPERIENCE LUXURY IN", name: "Dubai", slug: "dubai", image: DESTINATION_IMAGES.dubai, emoji: "🏙️" },
  { id: "5", subLabel: "WANDER THROUGH", name: "Switzerland", slug: "switzerland", image: DESTINATION_IMAGES.switzerland, emoji: "🏔️" },
  { id: "6", subLabel: "SUN, SAND & SEA IN", name: "Goa", slug: "goa", image: DESTINATION_IMAGES.goa, emoji: "🏖️" },
];

export const VISA_FREE_DESTINATIONS: DestinationCard[] = [
  { id: "v1", subLabel: "THE CHARMING ISLANDS", name: "Maldives", slug: "maldives", image: DESTINATION_IMAGES.maldives, emoji: "🏝️" },
  { id: "v2", subLabel: "EXPLORE WITHOUT VISA", name: "Thailand", slug: "thailand", image: DESTINATION_IMAGES.thailand, emoji: "🛕" },
  { id: "v3", subLabel: "DISCOVER THE PEARL OF", name: "Sri Lanka", slug: "sri-lanka", image: DESTINATION_IMAGES["sri-lanka"], emoji: "🐘" },
  { id: "v4", subLabel: "CITY OF LIONS", name: "Singapore", slug: "singapore", image: DESTINATION_IMAGES.singapore, emoji: "🦁" },
  { id: "v5", subLabel: "BACKWATERS & BEAUTY", name: "Kerala", slug: "kerala", image: DESTINATION_IMAGES.kerala, emoji: "🌿" },
];

export const ADVENTURE_DESTINATIONS: DestinationCard[] = [
  { id: "a1", subLabel: "ADVENTURES WORTH CHASING", name: "New Zealand", slug: "new-zealand", image: DESTINATION_IMAGES["new-zealand"], emoji: "🌋" },
  { id: "a2", subLabel: "ADVENTURES WORTH CHASING", name: "Iceland", slug: "iceland", image: DESTINATION_IMAGES.iceland, emoji: "🧊" },
  { id: "a3", subLabel: "ADVENTURES WORTH CHASING", name: "Nepal", slug: "nepal", image: DESTINATION_IMAGES.nepal, emoji: "⛰️" },
  { id: "a4", subLabel: "ADVENTURES WORTH CHASING", name: "Kenya", slug: "kenya", image: DESTINATION_IMAGES.kenya, emoji: "🦁" },
];

export const DURATION_TABS = [
  { id: "3-5", label: "3-5 Days" },
  { id: "6-9", label: "6-9 Days" },
  { id: "10+", label: "10+ Days" },
];

export interface DurationPackage {
  id: string;
  destination: string;
  title: string;
  duration: string;
  price: number;
  image: string;
  emoji: string;
  days: number;
}

export const DURATION_PACKAGES: DurationPackage[] = [
  { id: "d1", destination: "Thailand", title: "Bangkok & Phuket Escape", duration: "4N/5D", price: 30400, image: DESTINATION_IMAGES.thailand, emoji: "🛕", days: 5 },
  { id: "d2", destination: "Maldives", title: "Overwater Paradise", duration: "3N/4D", price: 189754, image: DESTINATION_IMAGES.maldives, emoji: "🏝️", days: 4 },
  { id: "d3", destination: "Sri Lanka", title: "Cultural Triangle Tour", duration: "5N/6D", price: 30000, image: DESTINATION_IMAGES["sri-lanka"], emoji: "🐘", days: 6 },
  { id: "d4", destination: "Singapore", title: "City & Sentosa Fun", duration: "4N/5D", price: 72551, image: DESTINATION_IMAGES.singapore, emoji: "🦁", days: 5 },
  { id: "d5", destination: "Bali", title: "Ubud & Seminyak Retreat", duration: "6N/7D", price: 43854, image: DESTINATION_IMAGES.bali, emoji: "🌴", days: 7 },
  { id: "d6", destination: "Mauritius", title: "Island Honeymoon", duration: "5N/6D", price: 51516, image: DESTINATION_IMAGES.mauritius, emoji: "🌊", days: 6 },
];

export const WHY_CHOOSE_STATS = [
  { icon: "🧳", value: "100%", label: "Customisation", position: "top-left" },
  { icon: "👍", value: "95%", label: "Visa Success", position: "top-right" },
  { icon: "💜", value: "24X7", label: "Concierge", position: "bottom-left" },
  { icon: "👥", value: "150k+", label: "Travellers", position: "bottom-right" },
];

export function filterByBudget(price: number, filter: string): boolean {
  switch (filter) {
    case "under-50k": return price < 50000;
    case "50k-1.5l": return price >= 50000 && price <= 150000;
    case "1.5l-2.5l": return price > 150000 && price <= 250000;
    case "luxury": return price > 250000;
    default: return true;
  }
}

export function filterByDuration(days: number, filter: string): boolean {
  switch (filter) {
    case "3-5": return days >= 3 && days <= 5;
    case "6-9": return days >= 6 && days <= 9;
    case "10+": return days >= 10;
    default: return true;
  }
}
