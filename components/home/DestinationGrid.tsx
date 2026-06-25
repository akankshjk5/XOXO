"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { useStore } from "@/store/useStore";
import { DESTINATIONS } from "@/lib/mock-data";
import { FilterTabs } from "./FilterTabs";
import { formatPrice } from "@/lib/utils";

export function DestinationGrid() {
  const { activeFilter } = useStore();

  const filtered =
    activeFilter === "all"
      ? DESTINATIONS
      : DESTINATIONS.filter((d) => d.category?.includes(activeFilter));

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
              Trending Destinations
            </h2>
            <p className="mt-1 text-text-secondary">
              Handpicked getaways loved by Indian travellers
            </p>
          </div>
          <Link
            href="/destinations"
            className="text-sm font-medium text-primary hover:underline shrink-0"
          >
            View all destinations →
          </Link>
        </div>

        <FilterTabs className="mb-8" />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((dest) => (
            <Link key={dest.id} href={`/destination/${dest.slug}`} className="group">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl shadow-card group-hover:shadow-card-hover transition-all duration-300 group-hover:-translate-y-1">
                <Image
                  src={dest.cover_image || ""}
                  alt={dest.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-1 text-white/80 text-xs mb-1">
                    <MapPin className="h-3 w-3" />
                    {dest.country}
                  </div>
                  <h3 className="text-white font-bold text-lg">{dest.name}</h3>
                  {dest.avg_price_inr && (
                    <p className="text-white/90 text-sm mt-1">
                      From {formatPrice(dest.avg_price_inr)}
                    </p>
                  )}
                </div>
                {!dest.visa_required && (
                  <span className="absolute top-3 right-3 rounded-full bg-success px-2 py-0.5 text-xs font-medium text-white">
                    Visa Free
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
