/**
 * Canonical travel category definitions — shared across homepage, packages, AI, admin.
 */

export const PACKAGE_CATEGORIES = [
  "honeymoon",
  "family",
  "friends",
  "solo",
  "adventure",
  "luxury",
  "corporate",
] as const;

export type PackageCategory = (typeof PACKAGE_CATEGORIES)[number];

export const TRAVELER_TYPE_TO_CATEGORY: Record<string, PackageCategory> = {
  couple: "honeymoon",
  family: "family",
  friends: "friends",
  solo: "solo",
  corporate: "corporate",
  honeymoon: "honeymoon",
  adventure: "adventure",
  luxury: "luxury",
};

export const AI_TRIP_TYPES = ["solo", "couple", "family", "group", "corporate"] as const;

export const CORPORATE_FEATURES = [
  { key: "meetingConference", label: "Meeting / Conference" },
  { key: "teamOuting", label: "Team Outing" },
  { key: "workation", label: "Workation" },
  { key: "corporateRetreat", label: "Corporate Retreat" },
  { key: "gstInvoiceAvailable", label: "GST Invoice Available" },
  { key: "dedicatedTravelManager", label: "Dedicated Travel Manager" },
  { key: "airportPickup", label: "Airport Pickup" },
  { key: "customPricing", label: "Custom Pricing" },
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  all: "All Types",
  honeymoon: "Couple / Honeymoon",
  family: "Family",
  friends: "Friends",
  solo: "Solo",
  adventure: "Adventure",
  luxury: "Luxury",
  corporate: "Corporate",
  couple: "Couple",
};

export function resolvePackageCategoryFilter(
  value: string
): { type?: string; category?: string } {
  if (!value || value === "all") return {};
  if (value in TRAVELER_TYPE_TO_CATEGORY) {
    return { type: value };
  }
  return { category: value };
}

export function formatCategoryLabel(category?: string): string {
  if (!category) return "";
  return CATEGORY_LABELS[category] || category.replace(/-/g, " ");
}
