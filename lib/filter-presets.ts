import type { FilterSection } from "@/lib/premium-filter-types";
import { PACKAGE_CATEGORIES, CATEGORY_LABELS } from "@/lib/travel-categories";

export const PACKAGE_FILTER_SECTIONS: FilterSection[] = [
  {
    id: "search",
    title: "Search",
    type: "search",
    placeholder: "Search packages…",
  },
  {
    id: "budget",
    title: "Budget",
    type: "single",
    options: [
      { id: "all", label: "All Budgets" },
      { id: "u50", label: "Under ₹50K" },
      { id: "50-150", label: "₹50K–1.5L" },
      { id: "150-250", label: "₹1.5L–2.5L" },
      { id: "lux", label: "Luxury" },
    ],
  },
  {
    id: "duration",
    title: "Duration",
    type: "single",
    options: [
      { id: "all", label: "Any Duration" },
      { id: "3-5", label: "3–5 Days" },
      { id: "6-9", label: "6–9 Days" },
      { id: "10+", label: "10+ Days" },
    ],
  },
  {
    id: "category",
    title: "Category",
    type: "single",
    options: [
      { id: "all", label: "All" },
      ...PACKAGE_CATEGORIES.map((c) => ({ id: c, label: CATEGORY_LABELS[c] || c })),
      { id: "visa-free", label: "Visa Free" },
    ],
  },
  {
    id: "sort",
    title: "Sort By",
    type: "single",
    options: [
      { id: "popular", label: "Popular" },
      { id: "newest", label: "Newest" },
      { id: "rating", label: "Rating" },
      { id: "price_asc", label: "Price: Low → High" },
      { id: "price_desc", label: "Price: High → Low" },
    ],
  },
];

export const PACKAGE_FILTER_DEFAULTS = {
  search: "",
  budget: "all",
  duration: "all",
  category: "all",
  sort: "popular",
};

export const DESTINATION_FILTER_SECTIONS: FilterSection[] = [
  {
    id: "search",
    title: "Search",
    type: "search",
    placeholder: "Search destinations…",
  },
  {
    id: "filter",
    title: "Explore",
    type: "single",
    options: [
      { id: "all", label: "All" },
      { id: "trending", label: "Trending" },
      { id: "visa-free", label: "Visa Free" },
      { id: "adventure", label: "Adventure" },
    ],
  },
];

export const DESTINATION_FILTER_DEFAULTS = {
  search: "",
  filter: "all",
};

export const HOME_BUDGET_FILTER_SECTIONS: FilterSection[] = [
  {
    id: "budget",
    title: "Budget",
    type: "single",
    options: [
      { id: "all", label: "All Destinations" },
      { id: "under-50k", label: "Under ₹50K" },
      { id: "50k-1.5l", label: "₹50K to ₹1.5L" },
      { id: "1.5l-2.5l", label: "₹1.5L to ₹2.5L" },
      { id: "luxury", label: "Luxury" },
    ],
  },
];

export const HOME_BUDGET_DEFAULTS = { budget: "all" };

export const HOME_DURATION_FILTER_SECTIONS: FilterSection[] = [
  {
    id: "duration",
    title: "Duration",
    type: "single",
    options: [
      { id: "all", label: "All Durations" },
      { id: "3-5", label: "3–5 Days" },
      { id: "6-9", label: "6–9 Days" },
      { id: "10+", label: "10+ Days" },
    ],
  },
];

export const HOME_DURATION_DEFAULTS = { duration: "all" };
