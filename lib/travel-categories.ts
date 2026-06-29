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

/** Homepage / marketing traveler type IDs → package DB category */
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

/** AI planner & itinerary trip types */
export const AI_TRIP_TYPES = [
  "solo",
  "couple",
  "family",
  "group",
  "corporate",
] as const;

export type AiTripType = (typeof AI_TRIP_TYPES)[number];

export const CORPORATE_TRAVEL_TYPES = [
  { id: "conference", label: "Conference" },
  { id: "business-event", label: "Business Event" },
  { id: "incentive-travel", label: "Incentive Travel" },
  { id: "team-outing", label: "Team Outing" },
  { id: "workation", label: "Workation" },
  { id: "corporate-retreat", label: "Corporate Retreat" },
  { id: "mice-travel", label: "MICE Travel" },
] as const;

export type CorporateTravelTypeId = (typeof CORPORATE_TRAVEL_TYPES)[number]["id"];

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
