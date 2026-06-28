"use client";

import { useEffect, useState } from "react";
import { destinationsAPI } from "@/lib/api";
import { toDestinationCard, type DestinationLinkInput } from "@/lib/destination-url";
import { DestinationCarousel } from "@/components/home/DestinationCarousel";
import type { ValidatedDestinationCard } from "@/components/home/DestinationCarousel";

type DestRow = DestinationLinkInput & {
  isVisaFree?: boolean;
  isTrending?: boolean;
  isAdventure?: boolean;
};

function mapRows(
  rows: DestRow[],
  subLabel: string,
  prefix: string
): ValidatedDestinationCard[] {
  return rows
    .map((d, i) => toDestinationCard(d, subLabel, `${prefix}-${i}`))
    .filter(Boolean) as ValidatedDestinationCard[];
}

export function HomeDestinationSections() {
  const [trending, setTrending] = useState<ValidatedDestinationCard[]>([]);
  const [visaFree, setVisaFree] = useState<ValidatedDestinationCard[]>([]);
  const [adventure, setAdventure] = useState<ValidatedDestinationCard[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [trendRes, advRes, allRes] = await Promise.all([
          destinationsAPI.getTrending(),
          destinationsAPI.getAdventure(),
          destinationsAPI.getAll({}),
        ]);

        if (cancelled) return;

        const trendData: DestRow[] = trendRes.data.data || [];
        const advData: DestRow[] = advRes.data.data || [];
        const allData: DestRow[] = allRes.data.data || [];

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

        const trendingSource =
          trendData.length > 0 ? trendData : allData.filter((d) => d.isTrending);
        const adventureSource =
          advData.length > 0 ? advData : allData.filter((d) => d.isAdventure);

        setTrending(
          mapRows(
            trendingSource.length > 0 ? trendingSource : allData.slice(0, 8),
            "EXPLORE THE BEAUTY OF",
            "t"
          )
        );

        setVisaFree(
          mapRows(
            allData.filter((d) => d.isVisaFree),
            "EXPLORE WITHOUT VISA",
            "v"
          )
        );

        setAdventure(
          mapRows(
            adventureSource.length > 0 ? adventureSource : allData.slice(0, 6),
            "ADVENTURES WORTH CHASING",
            "a"
          )
        );
      } catch (err) {
        console.error("[HomeDestinationSections] Failed to load destinations:", err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
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

  const hasAny = trending.length > 0 || visaFree.length > 0 || adventure.length > 0;

  return (
    <>
      {error && !hasAny && (
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
