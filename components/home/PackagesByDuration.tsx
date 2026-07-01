"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DURATION_TABS, filterByDuration } from "@/lib/home-filters";
import { packagesAPI } from "@/lib/api";
import { mapHomePackageCard, type HomePackageCard } from "@/lib/home-mappers";
import { formatPrice } from "@/lib/utils";
import { LazyImage } from "@/components/motion/LazyImage";
import { AnimatedTabs } from "@/components/motion/AnimatedTabs";
import { WishlistHeart } from "@/components/wishlist/WishlistHeart";

export function PackagesByDuration() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState("all");
  const [packages, setPackages] = useState<HomePackageCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await packagesAPI.getAll({ limit: 24, sort: "popular" });
        if (cancelled) return;
        setPackages(
          (data.data || [])
            .map(mapHomePackageCard)
            .filter((p: HomePackageCard) => !p.isVisaFree)
        );
      } catch {
        if (!cancelled) setPackages([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = packages.filter((p) => filterByDuration(p.days, duration));

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -380 : 380, behavior: "smooth" });
  };

  return (
    <section className="bg-off-white section border-t border-[#EBEBEB]">
      <div className="container-x">
        <div className="flex flex-col gap-5 mb-6">
          <h2 className="section-heading">Packages By Duration</h2>
          <AnimatedTabs tabs={DURATION_TABS} active={duration} onChange={setDuration} />
        </div>

        <div className="flex justify-end gap-2 mb-4">
          <button onClick={() => scroll("left")} className="carousel-btn" aria-label="Previous">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => scroll("right")} className="carousel-btn" aria-label="Next">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex gap-5 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="shrink-0 w-[360px] h-[280px] bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-text-grey py-8 text-center border border-dashed border-[#E0E0E0] rounded-2xl">
            No packages match this duration filter.
          </p>
        ) : (
          <div ref={scrollRef} className="flex gap-5 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
            {filtered.map((pkg) => (
              <div key={pkg.id} className="relative shrink-0 w-[360px] snap-start">
                <WishlistHeart packageId={pkg.id} />
                <Link
                  href={`/packages/${pkg.id}`}
                  className="block rounded-2xl overflow-hidden border border-[#EBEBEB] bg-white shadow-premium card-lift"
                >
                  <div className="relative h-[200px] overflow-hidden">
                    <LazyImage src={pkg.image} alt={pkg.destination} fill sizes="360px" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <p className="absolute bottom-4 left-4 text-xl font-bold text-white">
                      {pkg.destination}
                    </p>
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-text-dark text-[15px]">{pkg.title}</p>
                    <p className="text-sm text-text-grey mt-1">{pkg.duration}</p>
                    <p className="text-lg font-bold text-green-dark mt-2">
                      From {formatPrice(pkg.price)}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
