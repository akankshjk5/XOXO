"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star, MapPin, ExternalLink } from "lucide-react";
import { packagesAPI } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { HotelSuggestion } from "@/lib/package-types";
import { trackEvent } from "@/lib/analytics";
import { LoadingSkeleton } from "@/components/motion/LoadingSkeleton";
import { getDestImage } from "@/lib/images";

interface Props {
  packageId: string;
}

const TIER_STYLES: Record<string, string> = {
  luxury: "border-amber-200 bg-amber-50/50",
  premium: "border-green-200 bg-green-50/30",
  budget: "border-[#EBEBEB] bg-white",
};

export function RecommendedHotels({ packageId }: Props) {
  const [hotels, setHotels] = useState<HotelSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    packagesAPI
      .getHotelSuggestions(packageId)
      .then(({ data }) => setHotels(data.data || []))
      .catch(() => setHotels([]))
      .finally(() => setLoading(false));
  }, [packageId]);

  if (loading) {
    return (
      <section className="mt-10">
        <h2 className="section-heading mb-4">Recommended Hotels</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <LoadingSkeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!hotels.length) return null;

  return (
    <section className="mt-10" aria-labelledby="recommended-hotels-heading">
      <h2 id="recommended-hotels-heading" className="section-heading mb-2">
        Recommended Hotels
      </h2>
      <p className="text-sm text-text-grey mb-5">Curated stays by tier — affiliate booking only.</p>
      <div className="grid gap-4 md:grid-cols-3">
        {hotels.map((h) => (
          <article
            key={h.tier}
            className={`overflow-hidden rounded-xl border ${TIER_STYLES[h.tier] || TIER_STYLES.budget}`}
          >
            <div className="relative h-36">
              <Image
                src={h.image || getDestImage()}
                alt=""
                fill
                sizes="(max-width:768px) 100vw, 33vw"
                className="object-cover"
                loading="lazy"
              />
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-text-dark">
                {h.label}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-text-dark line-clamp-1">{h.name}</h3>
              <div className="mt-1 flex items-center gap-2 text-sm text-text-grey">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
                {h.rating}
                <span className="flex items-center gap-0.5">
                  <MapPin className="h-3 w-3" aria-hidden />
                  {h.distanceKm.toFixed(1)} km
                </span>
              </div>
              <p className="mt-2 text-lg font-bold text-green-dark">
                {formatPrice(h.pricePerNightINR)}
                <span className="text-xs font-normal text-text-grey"> / night</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {h.amenities.map((a) => (
                  <span key={a} className="rounded bg-off-white px-1.5 py-0.5 text-[10px] text-text-grey">
                    {a}
                  </span>
                ))}
              </div>
              <a
                href={h.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={() =>
                  trackEvent("click", { entityType: "hotel", entityId: packageId, meta: { tier: h.tier } })
                }
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-green-dark py-2.5 text-sm font-semibold text-white hover:bg-green-mid transition-colors"
              >
                Book Hotel <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
