"use client";

import { useEffect, useState } from "react";
import { Plane, ExternalLink } from "lucide-react";
import { packagesAPI } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { FlightSuggestion } from "@/lib/package-types";
import { trackEvent } from "@/lib/analytics";
import { LoadingSkeleton } from "@/components/motion/LoadingSkeleton";

interface Props {
  packageId: string;
}

export function RecommendedFlights({ packageId }: Props) {
  const [flights, setFlights] = useState<FlightSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    packagesAPI
      .getFlightSuggestions(packageId)
      .then(({ data }) => setFlights(data.data || []))
      .catch(() => setFlights([]))
      .finally(() => setLoading(false));
  }, [packageId]);

  if (loading) {
    return (
      <section className="mt-10" aria-label="Recommended flights loading">
        <h2 className="section-heading mb-4">Recommended Flights</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <LoadingSkeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!flights.length) return null;

  return (
    <section className="mt-10" aria-labelledby="recommended-flights-heading">
      <h2 id="recommended-flights-heading" className="section-heading mb-2">
        Recommended Flights
      </h2>
      <p className="text-sm text-text-grey mb-5">
        AI-estimated options from India. Prices are indicative — book via our partner.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {flights.map((f) => (
          <article
            key={`${f.airline}-${f.priceINR}`}
            className="admin-card rounded-xl border border-[#EBEBEB] bg-white p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-dark/10 text-green-dark">
                  <Plane className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="font-semibold text-text-dark">{f.airline}</p>
                  <p className="text-xs text-text-grey">
                    {f.departureAirport} → {f.arrivalAirport}
                  </p>
                </div>
              </div>
              <p className="text-lg font-bold text-green-dark">{formatPrice(f.priceINR)}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-text-grey">
              <span className="rounded-full bg-off-white px-2 py-1">{f.stops}</span>
              <span className="rounded-full bg-off-white px-2 py-1">{f.duration}</span>
              <span className="rounded-full bg-off-white px-2 py-1">{f.departureWindow}</span>
            </div>
            <p className="mt-2 text-[11px] text-text-grey">Return: {f.returnWindow}</p>
            <a
              href={f.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={() =>
                trackEvent("click", { entityType: "flight", entityId: packageId, meta: { airline: f.airline } })
              }
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-green-dark py-2.5 text-sm font-semibold text-green-dark hover:bg-green-dark hover:text-white transition-colors"
            >
              View Flight <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
