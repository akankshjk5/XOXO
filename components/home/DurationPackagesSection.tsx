"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DURATION_FILTERS, PACKAGES } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

function filterByDuration(days: number | null, filter: string): boolean {
  if (!days) return false;
  switch (filter) {
    case "3-5": return days >= 3 && days <= 5;
    case "6-9": return days >= 6 && days <= 9;
    case "10+": return days >= 10;
    default: return true;
  }
}

export function DurationPackagesSection() {
  const [durationFilter, setDurationFilter] = useState("3-5");

  const filtered = PACKAGES.filter((pkg) =>
    filterByDuration(pkg.duration_days, durationFilter)
  );

  return (
    <section className="py-10 sm:py-14 bg-surface-warm">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <h2 className="pyt-section-title mb-5">Packages By Duration</h2>

        <div className="flex gap-2 mb-6">
          {DURATION_FILTERS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDurationFilter(tab.id)}
              className={cn(
                "pyt-pill",
                durationFilter === tab.id ? "pyt-pill-active" : "pyt-pill-inactive"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {(filtered.length > 0 ? filtered : PACKAGES).slice(0, 6).map((pkg) => (
            <Link key={pkg.id} href={`/package/${pkg.id}`} className="group">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-white border border-border/60 shadow-card group-hover:shadow-card-hover transition-all">
                <Image
                  src={pkg.images?.[0] || ""}
                  alt={pkg.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, 16vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-white font-bold text-sm capitalize">
                    {pkg.category || "Holiday"}
                  </h3>
                  {pkg.price_per_person && (
                    <p className="text-white/90 text-xs sm:text-sm font-medium mt-0.5">
                      From {formatPrice(pkg.price_per_person)}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
