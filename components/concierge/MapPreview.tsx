"use client";

import type { ConciergePlan } from "@/lib/concierge-types";

export function MapPreview({ plan }: { plan: ConciergePlan | null }) {
  const geo = plan?.geo;
  const dest = plan?.itinerary?.destination;

  if (!geo?.lat || !geo?.lng) {
    return (
      <div className="rounded-2xl border border-dashed border-[#E0E0E0] h-40 flex items-center justify-center text-sm text-text-grey bg-off-white/50">
        {dest ? `Map preview · ${dest}` : "Destination map"}
      </div>
    );
  }

  const bbox = `${geo.lng - 0.15},${geo.lat - 0.1},${geo.lng + 0.15},${geo.lat + 0.1}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${geo.lat}%2C${geo.lng}`;

  return (
    <div className="rounded-2xl border border-[#E8E8E8] overflow-hidden h-40 bg-off-white shadow-elevated">
      <iframe
        title={`Map of ${dest || geo.label}`}
        src={src}
        className="w-full h-full border-0"
        loading="lazy"
      />
    </div>
  );
}
