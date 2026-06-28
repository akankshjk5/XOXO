"use client";

import { useEffect, useState } from "react";
import { destinationsAPI } from "@/lib/api";
import { toDestinationCard, type DestinationLinkInput } from "@/lib/destination-url";
import { DestinationCarousel } from "@/components/home/DestinationCarousel";
import type { ValidatedDestinationCard } from "@/components/home/DestinationCarousel";

export function HomeDestinationSections() {
  const [trending, setTrending] = useState<ValidatedDestinationCard[]>([]);
  const [visaFree, setVisaFree] = useState<ValidatedDestinationCard[]>([]);
  const [adventure, setAdventure] = useState<ValidatedDestinationCard[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [trendRes, advRes, allRes] = await Promise.all([
          destinationsAPI.getTrending(),
          destinationsAPI.getAdventure(),
          destinationsAPI.getAll({}),
        ]);

        const trendData = trendRes.data.data || [];
        const advData = advRes.data.data || [];
        const allData: { name: string; slug: string; isVisaFree?: boolean; tagline?: string; coverImage?: string; _id?: string }[] =
          allRes.data.data || [];

        console.info("[HomeDestinationSections] GET /api/destinations →", {
          count: allData.length,
          data: allData,
        });
        console.info("[HomeDestinationSections] GET /api/destinations/trending →", {
          count: trendData.length,
          data: trendData,
        });
        console.info("[HomeDestinationSections] GET /api/destinations/adventure →", {
          count: advData.length,
          data: advData,
        });

        setTrending(
          trendData
            .map((d: DestinationLinkInput, i: number) =>
              toDestinationCard(d, d.tagline?.toUpperCase() || "EXPLORE THE BEAUTY OF", `t-${i}`)
            )
            .filter(Boolean) as ValidatedDestinationCard[]
        );

        setVisaFree(
          allData
            .filter((d) => d.isVisaFree)
            .map((d, i) =>
              toDestinationCard(d, "EXPLORE WITHOUT VISA", `v-${i}`)
            )
            .filter(Boolean) as ValidatedDestinationCard[]
        );

        setAdventure(
          advData
            .map((d: DestinationLinkInput, i: number) =>
              toDestinationCard(d, "ADVENTURES WORTH CHASING", `a-${i}`)
            )
            .filter(Boolean) as ValidatedDestinationCard[]
        );
      } catch (err) {
        console.error("[HomeDestinationSections] Failed to load destinations:", err);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) {
    return (
      <div className="bg-white section">
        <div className="container-x space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-7 w-56 bg-gray-100 rounded-lg animate-pulse" />
              <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="shrink-0 w-[220px] aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {ready && trending.length === 0 && visaFree.length === 0 && adventure.length === 0 && (
        <div className="bg-white section border-t border-[#EBEBEB]">
          <div className="container-x">
            <p className="text-sm text-text-grey text-center py-8 border border-dashed border-[#E0E0E0] rounded-2xl">
              Could not load destinations from the API. Open the browser console for details and
              confirm NEXT_PUBLIC_API_URL points to your Railway backend.
            </p>
          </div>
        </div>
      )}
      {trending.length > 0 && (
        <DestinationCarousel title="Trending Destinations" destinations={trending} />
      )}
      {visaFree.length > 0 && (
        <DestinationCarousel
          title="Visa Free Destinations"
          destinations={visaFree}
          bg="off-white"
        />
      )}
      {adventure.length > 0 && (
        <DestinationCarousel title="Adventures Worth Chasing" destinations={adventure} />
      )}
    </>
  );
}
