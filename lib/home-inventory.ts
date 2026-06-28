import { packagesAPI } from "@/lib/api";
import type { ApiPackage } from "@/lib/home-mappers";

/** Deduplicate homepage trending-packages requests across sections. */
let trendingPackagesPromise: Promise<ApiPackage[]> | null = null;

export function fetchTrendingPackages(): Promise<ApiPackage[]> {
  if (!trendingPackagesPromise) {
    trendingPackagesPromise = packagesAPI
      .getTrending()
      .then((res) => (res.data.data || []) as ApiPackage[])
      .catch((err) => {
        trendingPackagesPromise = null;
        throw err;
      });
  }
  return trendingPackagesPromise;
}
