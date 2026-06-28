"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DURATION_TABS, filterByDuration } from "@/lib/home-filters";
import { packagesAPI } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { LazyImage } from "@/components/motion/LazyImage";

interface DurationPackageCard {
  id: string;
  destination: string;
  title: string;
  duration: string;
  price: number;
  image: string;
  days: number;
}

interface ApiPackage {
  _id: string;
  title: string;
  images?: string[];
  pricePerPerson: number;
  durationDays: number;
  durationNights?: number;
  destination?: { name?: string };
}

function mapPackage(pkg: ApiPackage): DurationPackageCard {
  const nights = pkg.durationNights ?? Math.max(0, pkg.durationDays - 1);
  return {
    id: pkg._id,
    destination: pkg.destination?.name || pkg.title,
    title: pkg.title,
    duration: `${nights}N/${pkg.durationDays}D`,
    price: pkg.pricePerPerson,
    image:
      pkg.images?.[0] ||
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
    days: pkg.durationDays,
  };
}

export function PackagesByDuration() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState("all");
  const [packages, setPackages] = useState<DurationPackageCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await packagesAPI.getAll({ limit: 24, sort: "popular" });
        if (cancelled) return;
        const mapped = (data.data || []).map(mapPackage);
        console.info("[PackagesByDuration] GET /api/packages →", {
          count: mapped.length,
          total: data.pagination?.total,
          data: data.data,
        });
        setPackages(mapped);
      } catch (err) {
        console.error("[PackagesByDuration] Failed to load packages:", err);
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
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="section-heading">Packages By Duration</h2>
          <div className="flex gap-2 flex-wrap">
            {DURATION_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDuration(tab.id)}
                className={cn("pill-filter", duration === tab.id && "pill-filter-active")}
              >
                {tab.label}
              </button>
            ))}
          </div>
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
              <Link
                key={pkg.id}
                href={`/packages/${pkg.id}`}
                className="shrink-0 w-[360px] snap-start rounded-2xl overflow-hidden border border-[#EBEBEB] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] card-lift"
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
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
