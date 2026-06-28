"use client";

import { useEffect } from "react";
import { packagesAPI, destinationsAPI } from "@/lib/api";
import { getApiDebugInfo } from "@/lib/api-config";

/**
 * Fetches homepage inventory once and logs to console for production debugging.
 * Mounted at the top of the homepage — does not render UI.
 */
export function HomeApiLogger() {
  useEffect(() => {
    const info = getApiDebugInfo();
    console.info("[XOXO Homepage] API config:", info);

    (async () => {
      try {
        const [packagesRes, destinationsRes, trendingDestRes, trendingPkgRes, offersRes] =
          await Promise.all([
          packagesAPI.getAll({ limit: 24, sort: "popular" }),
          destinationsAPI.getAll({}),
          destinationsAPI.getTrending(),
          packagesAPI.getTrending(),
          packagesAPI.getVisaFree(),
        ]);

        console.info("[XOXO Homepage] GET /api/packages →", {
          count: packagesRes.data?.data?.length ?? 0,
          total: packagesRes.data?.pagination?.total,
          sample: packagesRes.data?.data?.[0]?.title,
          data: packagesRes.data?.data,
        });

        console.info("[XOXO Homepage] GET /api/destinations →", {
          count: destinationsRes.data?.data?.length ?? 0,
          sample: destinationsRes.data?.data?.[0]?.name,
          data: destinationsRes.data?.data,
        });

        console.info("[XOXO Homepage] GET /api/destinations/trending →", {
          count: trendingDestRes.data?.data?.length ?? 0,
          data: trendingDestRes.data?.data,
        });

        console.info("[XOXO Homepage] GET /api/packages/trending →", {
          count: trendingPkgRes.data?.data?.length ?? 0,
          data: trendingPkgRes.data?.data,
        });

        console.info("[XOXO Homepage] GET /api/packages/visa-free →", {
          count: offersRes.data?.data?.length ?? 0,
          data: offersRes.data?.data,
        });
      } catch (err) {
        console.error("[XOXO Homepage] Inventory fetch failed:", err);
      }
    })();
  }, []);

  return null;
}
