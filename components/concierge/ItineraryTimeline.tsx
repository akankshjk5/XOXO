"use client";

import { Sun, Moon, MapPin } from "lucide-react";
import type { ConciergePlan, ConciergeIntent } from "@/lib/concierge-types";
import { formatItineraryLocation } from "@/lib/itinerary-export";

export function ItineraryTimeline({
  plan,
  intent,
}: {
  plan: ConciergePlan | null;
  intent?: ConciergeIntent | null;
}) {
  if (!plan?.itinerary) {
    return (
      <div className="rounded-2xl border border-dashed border-[#E0E0E0] bg-white/60 p-8 text-center text-sm text-text-grey">
        Your day-by-day itinerary will appear here once I have enough details.
      </div>
    );
  }

  const it = plan.itinerary;
  const loc = formatItineraryLocation(plan, intent);

  return (
    <div className="rounded-2xl border border-[#E8E8E8] bg-white shadow-elevated overflow-hidden">
      <div className="px-5 py-4 border-b border-[#EBEBEB]">
        <h3 className="font-black text-lg text-text-dark flex items-center gap-2">
          <MapPin className="h-4 w-4 text-green-dark" />
          {loc.label}
        </h3>
        <p className="text-xs text-text-grey mt-0.5">
          {loc.city}{loc.country ? ` · ${loc.country}` : ""} · {it.totalDays} days
        </p>
        {it.weatherSummary && (
          <p className="text-xs text-text-grey mt-1">{it.weatherSummary}</p>
        )}
      </div>
      <div className="p-4 space-y-4 max-h-[520px] overflow-y-auto">
        {it.days?.map((day) => (
          <div key={day.day} className="relative pl-6 border-l-2 border-green-bright/40">
            <span className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-green-bright border-2 border-white" />
            <p className="text-xs font-bold text-green-dark uppercase tracking-wide">Day {day.day}</p>
            <p className="font-bold text-text-dark text-sm mb-2">{day.title}</p>
            <div className="space-y-1.5 text-xs text-text-grey">
              {day.morning?.activity && (
                <p className="flex items-start gap-1.5">
                  <Sun className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{day.morning.activity}</span>
                </p>
              )}
              {day.afternoon?.activity && (
                <p className="flex items-start gap-1.5">
                  <Sun className="h-3.5 w-3.5 text-orange-400 shrink-0 mt-0.5" />
                  <span>{day.afternoon.activity}</span>
                </p>
              )}
              {day.evening?.activity && (
                <p className="flex items-start gap-1.5">
                  <Moon className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{day.evening.activity}</span>
                </p>
              )}
              {day.estimatedCost && (
                <p className="text-green-dark font-semibold pt-1">{day.estimatedCost}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
