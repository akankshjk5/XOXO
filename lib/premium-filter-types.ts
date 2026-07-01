export interface FilterOption {
  id: string;
  label: string;
}

export interface FilterSection {
  id: string;
  title: string;
  type: "single" | "search";
  options?: FilterOption[];
  placeholder?: string;
}

export type FilterValues = Record<string, string>;

export function countActiveFilters(values: FilterValues, defaults: FilterValues): number {
  return Object.keys(defaults).filter((k) => (values[k] || defaults[k]) !== defaults[k]).length;
}
