const RECENT_KEY = "xoxo_recent_packages";
const COMPARE_KEY = "xoxo_compare_packages";
const MAX_RECENT = 8;
const MAX_COMPARE = 4;

export interface StoredPackageRef {
  _id: string;
  title: string;
  images?: string[];
  pricePerPerson: number;
  durationDays: number;
  destination?: { name?: string; country?: string };
  rating?: number;
  isVisaFree?: boolean;
  category?: string;
}

export function addRecentlyViewed(pkg: StoredPackageRef) {
  if (typeof window === "undefined") return;
  const list = getRecentlyViewed().filter((p) => p._id !== pkg._id);
  list.unshift(pkg);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
}

export function getRecentlyViewed(): StoredPackageRef[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getCompareList(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(COMPARE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function toggleCompare(id: string): string[] {
  if (typeof window === "undefined") return [];
  let list = getCompareList();
  if (list.includes(id)) {
    list = list.filter((x) => x !== id);
  } else {
    if (list.length >= MAX_COMPARE) list = list.slice(1);
    list.push(id);
  }
  localStorage.setItem(COMPARE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("xoxo-compare-update"));
  return list;
}

export function isInCompare(id: string): boolean {
  return getCompareList().includes(id);
}

export function clearCompare() {
  if (typeof window === "undefined") return;
  localStorage.setItem(COMPARE_KEY, "[]");
  window.dispatchEvent(new Event("xoxo-compare-update"));
}
