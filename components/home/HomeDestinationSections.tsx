"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { destinationsAPI } from "@/lib/api";
import { toDestinationCard, type DestinationLinkInput } from "@/lib/destination-url";
import { DestinationCarousel } from "@/components/home/DestinationCarousel";
import type { ValidatedDestinationCard } from "@/components/home/DestinationCarousel";

type DestRow = DestinationLinkInput & {
  isVisaFree?: boolean;
  isTrending?: boolean;
  isAdventure?: boolean;
};

export function HomeDestinationSections() {
  const [trending, setTrending] = useState<ValidatedDestinationCard[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [trendRes, allRes] = await Promise.all([
          destinationsAPI.getTrending(),
          destinationsAPI.getAll({}),
        ]);

        if (cancelled) return;

        const trendData: DestRow[] = trendRes.data.data || [];
        const allData: DestRow[] = allRes.data.data || [];

        const trendingSource =
          trendData.length > 0 ? trendData : allData.filter((d) => d.isTrending);

        setTrending(
          (trendingSource.length > 0 ? trendingSource : allData.slice(0, 8))
            .map((d, i) => toDestinationCard(d, "EXPLORE", `t-${i}`))
            .filter(Boolean) as ValidatedDestinationCard[]
        );
      } catch {
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
        <div className="container-x space-y-4">
          <div className="h-7 w-56 bg-gray-100 rounded-lg animate-pulse" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="shrink-0 w-[220px] aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && trending.length === 0) {
    return (
      <div className="bg-white section border-t border-[#EBEBEB]">
        <div className="container-x">
          <p className="text-sm text-text-grey text-center py-8 border border-dashed border-[#E0E0E0] rounded-2xl">
            Could not load destinations. Check your API connection.
          </p>
        </div>
      </div>
    );
  }

  if (trending.length === 0) return null;

  return (
    <DestinationCarousel
      title="Trending Destinations"
      destinations={trending}
      action={
        <Link
          href="/destinations"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-dark hover:underline"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      }
    />
  );
}
