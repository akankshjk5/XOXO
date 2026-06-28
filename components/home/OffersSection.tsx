"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { packagesAPI } from "@/lib/api";
import { mapHomePackageCard, type HomePackageCard } from "@/lib/home-mappers";
import { formatPrice } from "@/lib/utils";
import { LazyImage } from "@/components/motion/LazyImage";

export function OffersSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [offers, setOffers] = useState<HomePackageCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await packagesAPI.getVisaFree();
        if (cancelled) return;
        setOffers((data.data || []).map(mapHomePackageCard));
      } catch (err) {
        console.error("[OffersSection] Failed to load visa-free offers:", err);
        if (!cancelled) setOffers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && offers.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -360 : 360, behavior: "smooth" });
  };

  return (
    <section className="bg-off-white section border-t border-[#EBEBEB]">
      <div className="container-x">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="section-heading">Visa-Free Offers</h2>
            <p className="text-sm text-text-grey mt-1">Live packages with no visa hassle</p>
          </div>
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
        ) : (
          <div ref={scrollRef} className="flex gap-5 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
            {offers.map((pkg) => (
              <Link
                key={pkg.id}
                href={`/packages/${pkg.id}`}
                className="shrink-0 w-[360px] snap-start rounded-2xl overflow-hidden border border-[#EBEBEB] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] card-lift"
              >
                <div className="relative h-[200px] overflow-hidden">
                  <LazyImage src={pkg.image} alt={pkg.title} fill sizes="360px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <span className="absolute top-3 left-3 bg-green-bright text-green-dark text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full">
                    Visa Free
                  </span>
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
