"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { packagesAPI } from "@/lib/api";
import { mapHomePackageCard, type HomePackageCard } from "@/lib/home-mappers";
import { formatPrice } from "@/lib/utils";
import { LazyImage } from "@/components/motion/LazyImage";

export function TrendingPackagesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [packages, setPackages] = useState<HomePackageCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await packagesAPI.getTrending();
        if (cancelled) return;
        const mapped = (data.data || []).map(mapHomePackageCard);
        console.info("[TrendingPackagesSection] GET /api/packages/trending →", {
          count: mapped.length,
          data: data.data,
        });
        setPackages(mapped);
      } catch (err) {
        console.error("[TrendingPackagesSection] Failed to load trending packages:", err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -360 : 360, behavior: "smooth" });
  };

  return (
    <section className="bg-white section border-t border-[#EBEBEB]">
      <div className="container-x">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="section-heading">Trending Packages</h2>
          <div className="flex gap-2">
            <button onClick={() => scroll("left")} className="carousel-btn" aria-label="Previous">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => scroll("right")} className="carousel-btn" aria-label="Next">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex gap-5 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="shrink-0 w-[360px] h-[280px] bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : error || packages.length === 0 ? (
          <p className="text-sm text-text-grey py-8 text-center border border-dashed border-[#E0E0E0] rounded-2xl">
            Could not load trending packages from the API.
          </p>
        ) : (
          <div ref={scrollRef} className="flex gap-5 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
            {packages.map((pkg) => (
              <Link
                key={pkg.id}
                href={`/packages/${pkg.id}`}
                className="shrink-0 w-[360px] snap-start rounded-2xl overflow-hidden border border-[#EBEBEB] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] card-lift"
              >
                <div className="relative h-[200px] overflow-hidden">
                  <LazyImage src={pkg.image} alt={pkg.title} fill sizes="360px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  {pkg.rating ? (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs font-semibold">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {pkg.rating.toFixed(1)}
                    </div>
                  ) : null}
                  <p className="absolute bottom-4 left-4 text-xl font-bold text-white">{pkg.destination}</p>
                </div>
                <div className="p-4">
                  <p className="font-bold text-text-dark text-[15px] line-clamp-2">{pkg.title}</p>
                  <p className="text-sm text-text-grey mt-1">{pkg.duration}</p>
                  <p className="text-lg font-bold text-green-dark mt-2">From {formatPrice(pkg.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
