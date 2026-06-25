"use client";

import Link from "next/link";
import { Plane, Hotel, Compass, User, Users, Share2, Save, Loader2 } from "lucide-react";
import type { ConciergePlan, ConciergeSession } from "@/lib/concierge-types";
import { formatPrice } from "@/lib/utils";

interface BookingSidebarProps {
  session: ConciergeSession | null;
  saving: boolean;
  onSave: () => void;
  onShare: () => void;
}

export function BookingSidebar({ session, saving, onSave, onShare }: BookingSidebarProps) {
  const plan = session?.plan;
  const flight = plan?.rankedFlights?.[0] as { airline?: string; price?: number; origin?: string; destination?: string } | undefined;
  const hotel = plan?.rankedHotels?.[0] as { name?: string; pricePerNight?: number } | undefined;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#E8E8E8] bg-white shadow-elevated p-5">
        <h3 className="font-black text-text-dark mb-3">Book & save</h3>
        <div className="space-y-2">
          {flight && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-off-white text-sm">
              <Plane className="h-4 w-4 text-green-dark shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{flight.airline || "Best flight"}</p>
                <p className="text-xs text-text-grey">
                  {flight.origin} → {flight.destination}
                </p>
                {flight.price && (
                  <p className="text-green-dark font-bold text-xs mt-1">{formatPrice(flight.price)}</p>
                )}
              </div>
            </div>
          )}
          {hotel && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-off-white text-sm">
              <Hotel className="h-4 w-4 text-green-dark shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{hotel.name}</p>
                {hotel.pricePerNight && (
                  <p className="text-green-dark font-bold text-xs mt-1">
                    {formatPrice(hotel.pricePerNight)}/night
                  </p>
                )}
              </div>
            </div>
          )}
          {(plan?.topActivities || []).slice(0, 2).map((a, i) => {
            const act = a as { id?: string; name?: string; price?: number };
            return (
              <div key={act.id || i} className="flex items-start gap-3 p-3 rounded-xl bg-off-white text-sm">
                <Compass className="h-4 w-4 text-green-dark shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{act.name}</p>
                  {act.price ? (
                    <p className="text-green-dark font-bold text-xs mt-1">{formatPrice(act.price)}</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <Link
            href="/packages"
            className="w-full text-center py-2.5 rounded-full bg-green-dark text-white text-sm font-semibold hover:bg-green-mid transition-colors"
          >
            Browse packages
          </Link>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || !plan?.itinerary}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-green-dark text-green-dark text-sm font-semibold disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save itinerary
          </button>
          <button
            type="button"
            onClick={onShare}
            disabled={!session?.shareToken}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-[#E0E0E0] text-text-grey text-sm font-semibold disabled:opacity-50"
          >
            <Share2 className="h-4 w-4" />
            Share plan
          </button>
        </div>
      </div>

      <SocialRecommendations plan={plan ?? null} />
    </div>
  );
}

function SocialRecommendations({ plan }: { plan: ConciergePlan | null }) {
  const travelers = plan?.social?.travelers || [];
  const guides = plan?.social?.guides || [];
  const groups = plan?.social?.groups || [];

  if (!travelers.length && !guides.length && !groups.length) return null;

  return (
    <div className="rounded-2xl border border-[#E8E8E8] bg-white shadow-elevated p-5">
      <h3 className="font-black text-text-dark mb-3">Social intelligence</h3>
      {travelers.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-bold text-text-grey uppercase mb-2 flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> Travelers
          </p>
          <div className="space-y-2">
            {travelers.slice(0, 3).map((t, i) => {
              const u = (t as { user?: { name?: string } }).user;
              return (
                <Link
                  key={i}
                  href="/match"
                  className="block text-sm font-medium text-green-dark hover:underline"
                >
                  {u?.name || "Traveler"} — same destination
                </Link>
              );
            })}
          </div>
        </div>
      )}
      {guides.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-bold text-text-grey uppercase mb-2 flex items-center gap-1">
            <User className="h-3.5 w-3.5" /> Local guides
          </p>
          {guides.slice(0, 2).map((g, i) => {
            const guide = g as { _id?: string; city?: string; user?: { name?: string } };
            return (
              <Link
                key={guide._id || i}
                href={guide._id ? `/guides/${guide._id}` : "/guides"}
                className="block text-sm font-medium text-green-dark hover:underline"
              >
                {guide.user?.name || "Guide"} · {guide.city}
              </Link>
            );
          })}
        </div>
      )}
      {groups.length > 0 && (
        <div>
          <p className="text-xs font-bold text-text-grey uppercase mb-2">Group trips</p>
          {groups.slice(0, 2).map((g, i) => {
            const grp = g as { _id?: string; title?: string; destination?: string };
            return (
              <Link
                key={grp._id || i}
                href={grp._id ? `/groups/${grp._id}` : "/groups"}
                className="block text-sm font-medium text-green-dark hover:underline"
              >
                {grp.title || grp.destination}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
