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
        const [packagesRes, destinationsRes, trendingRes] = await Promise.all([
          packagesAPI.getAll({ limit: 24, sort: "popular" }),
          destinationsAPI.getAll({}),
          destinationsAPI.getTrending(),
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
          count: trendingRes.data?.data?.length ?? 0,
          data: trendingRes.data?.data,
        });
      } catch (err) {
        console.error("[XOXO Homepage] Inventory fetch failed:", err);
      }
    })();
  }, []);

  return null;
}
