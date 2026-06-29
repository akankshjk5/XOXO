// Central image map — real Unsplash travel photography.
// Used across all cards/carousels so placeholders are never shown.

export const DESTINATION_IMAGES: Record<string, string> = {
  maldives: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
  bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
  thailand: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80",
  singapore: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80",
  japan: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
  dubai: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
  switzerland: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80",
  paris: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
  "new-zealand": "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&q=80",
  australia: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&q=80",
  vietnam: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80",
  kenya: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80",
  "sri-lanka": "https://images.unsplash.com/photo-1562602833-0f4ab2fc46e3?w=800&q=80",
  seychelles: "https://images.unsplash.com/photo-1573990013710-b1af4b04a0e9?w=800&q=80",
  malaysia: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80",
  mauritius: "https://images.unsplash.com/photo-1586861203927-800a5acdcc4d?w=800&q=80",
  // Extra slugs used in our data
  goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
  kerala: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80",
  iceland: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800&q=80",
  nepal: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
  baku: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80",
  italy: "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800&q=80",
  croatia: "https://images.unsplash.com/photo-1499678329028-101435549a4e?w=800&q=80",
};

// Hero full-bleed background — high quality, optimized width
export const HERO_BG =
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=85&auto=format&fit=crop";

/** Default package card / detail hero when no image is uploaded. */
export const DEFAULT_PACKAGE_IMAGE =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80";

// Traveler type photos
export const TRAVELER_IMAGES: Record<string, string> = {
  couple: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&q=80",
  family: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&q=80",
  friends: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80",
  corporate: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&q=80",
};

const FALLBACK = DESTINATION_IMAGES.bali;

/** Resolve a destination image by slug, with a safe fallback. */
export function getDestImage(slug?: string): string {
  if (!slug) return FALLBACK;
  return DESTINATION_IMAGES[slug.toLowerCase()] || FALLBACK;
}
