/** Shared mappers for homepage package/destination API responses. */

export interface ApiPackage {
  _id: string;
  title: string;
  slug?: string;
  images?: string[];
  pricePerPerson: number;
  originalPrice?: number;
  durationDays: number;
  durationNights?: number;
  category?: string;
  badge?: string;
  rating?: number;
  reviewCount?: number;
  destination?: { name?: string; slug?: string; country?: string };
  itinerary?: { day: number; title: string; description?: string; activities?: string[] }[];
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80";

export interface HomePackageCard {
  id: string;
  destination: string;
  title: string;
  duration: string;
  price: number;
  originalPrice?: number;
  image: string;
  days: number;
  rating?: number;
  reviewCount?: number;
  badge?: string;
}

export function mapHomePackageCard(pkg: ApiPackage): HomePackageCard {
  const nights = pkg.durationNights ?? Math.max(0, pkg.durationDays - 1);
  return {
    id: pkg._id,
    destination: pkg.destination?.name || pkg.title,
    title: pkg.title,
    duration: `${nights}N/${pkg.durationDays}D`,
    price: pkg.pricePerPerson,
    originalPrice: pkg.originalPrice,
    image: pkg.images?.[0] || FALLBACK_IMAGE,
    days: pkg.durationDays,
    rating: pkg.rating,
    reviewCount: pkg.reviewCount,
    badge: pkg.badge,
  };
}

export interface ItineraryPreviewDay {
  day: string;
  title: string;
  activity: string;
}

export function mapItineraryPreview(pkg: ApiPackage, limit = 3): ItineraryPreviewDay[] {
  const days = pkg.itinerary || [];
  if (days.length === 0) {
    return [
      {
        day: "Day 1",
        title: pkg.destination?.name || pkg.title,
        activity: pkg.title,
      },
    ];
  }
  return days.slice(0, limit).map((d) => ({
    day: `Day ${d.day}`,
    title: d.title,
    activity: d.activities?.[0] || d.description || "",
  }));
}
