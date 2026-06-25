"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DURATION_TABS, DURATION_PACKAGES, filterByDuration } from "@/lib/pyt-data";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { LazyImage } from "@/components/motion/LazyImage";

export function PackagesByDuration() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState("3-5");

  const filtered = DURATION_PACKAGES.filter((p) => filterByDuration(p.days, duration));

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

        <div ref={scrollRef} className="flex gap-5 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
          {(filtered.length ? filtered : DURATION_PACKAGES).map((pkg) => (
            <Link
              key={pkg.id}
              href={`/packages?duration=${pkg.days <= 5 ? "3-5" : pkg.days <= 9 ? "6-9" : "10+"}`}
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
      </div>
    </section>
  );
}
