/** Homepage filter UI — not mock inventory data. */

export const BUDGET_FILTERS = [
  { id: "all", label: "All Destinations" },
  { id: "under-50k", label: "Under ₹50K" },
  { id: "50k-1.5l", label: "₹50K to ₹1.5L" },
  { id: "1.5l-2.5l", label: "₹1.5L to ₹2.5L" },
  { id: "luxury", label: "Luxury" },
];

export const DURATION_TABS = [
  { id: "all", label: "All Durations" },
  { id: "3-5", label: "3-5 Days" },
  { id: "6-9", label: "6-9 Days" },
  { id: "10+", label: "10+ Days" },
];

export function filterByBudget(price: number, filter: string): boolean {
  switch (filter) {
    case "under-50k":
      return price < 50000;
    case "50k-1.5l":
      return price >= 50000 && price <= 150000;
    case "1.5l-2.5l":
      return price > 150000 && price <= 250000;
    case "luxury":
      return price > 250000;
    default:
      return true;
  }
}

export function filterByDuration(days: number, filter: string): boolean {
  switch (filter) {
    case "3-5":
      return days >= 3 && days <= 5;
    case "6-9":
      return days >= 6 && days <= 9;
    case "10+":
      return days >= 10;
    default:
      return true;
  }
}
