"use client";

import Image from "next/image";
import Link from "next/link";
import { DESTINATIONS } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";

export function TrendingDestinations() {
  const trending = DESTINATIONS.slice(0, 6);

  return (
    <section className="py-10 sm:py-14 bg-surface-warm">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <h2 className="pyt-section-title mb-6 uppercase tracking-wider text-[13px] text-text-muted font-bold">
          Trending Destinations
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {trending.map((dest) => (
            <Link key={dest.id} href={`/destination/${dest.slug}`} className="group">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface">
                <Image
                  src={dest.cover_image || ""}
                  alt={dest.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, 16vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-white font-bold text-sm sm:text-base">{dest.name}</h3>
                  {dest.avg_price_inr && (
                    <p className="text-white/85 text-xs sm:text-sm mt-0.5">
                      From {formatPrice(dest.avg_price_inr)}
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

export function VisaFreeDestinations() {
  const visaFree = DESTINATIONS.filter((d) => !d.visa_required);

  return (
    <section className="py-10 sm:py-14 bg-white">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <h2 className="pyt-section-title mb-6 uppercase tracking-wider text-[13px] text-text-muted font-bold">
          Visa Free Destinations
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {visaFree.map((dest) => (
            <Link key={dest.id} href={`/destination/${dest.slug}`} className="group">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
                <Image
                  src={dest.cover_image || ""}
                  alt={dest.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, 16vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute top-2.5 right-2.5 rounded-pill bg-brand-green px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                  Visa Free
                </span>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-white font-bold text-sm sm:text-base">{dest.name}</h3>
                  {dest.avg_price_inr && (
                    <p className="text-white/85 text-xs sm:text-sm mt-0.5">
                      From {formatPrice(dest.avg_price_inr)}
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
