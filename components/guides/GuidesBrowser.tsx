"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Star, MapPin, BadgeCheck } from "lucide-react";
import { guidesAPI } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import {
  AnimatedButton,
  EmptyState,
  SkeletonCard,
  StaggerReveal,
  StaggerRevealItem,
} from "@/components/motion";

interface Guide {
  _id: string;
  city: string;
  country?: string;
  expertise?: string[];
  languages?: string[];
  dailyRate?: number;
  hourlyRate?: number;
  rating?: number;
  totalReviews?: number;
  isVerified?: boolean;
  photos?: string[];
  user?: { name?: string; avatar?: string };
}

export function GuidesBrowser() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async (search?: string) => {
    setLoading(true);
    try {
      const { data } = await guidesAPI.getAll(search ? { q: search } : undefined);
      setGuides(data.data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="pt-[88px] container-x pb-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-text-dark tracking-tight">Local Guides Marketplace</h1>
        <p className="text-text-grey mt-2">Book a verified local to make your trip unforgettable.</p>
      </div>

      <div className="flex gap-2 max-w-xl mx-auto mb-10">
        <div className="relative flex-1 shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-grey" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load(q)}
            placeholder="Search by city e.g. Bali, Paris"
            className="w-full border border-[#E0E0E0] rounded-full pl-9 pr-4 py-3 focus:border-green-dark outline-none bg-white"
          />
        </div>
        <AnimatedButton onClick={() => load(q)}>Search</AnimatedButton>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : guides.length === 0 ? (
        <EmptyState icon="🧭" title="No guides found" description="Try searching another city or country." />
      ) : (
        <StaggerReveal className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {guides.map((g) => (
            <StaggerRevealItem key={g._id}>
            <Link
              href={`/guides/${g._id}`}
              className="rounded-2xl overflow-hidden border border-[#EBEBEB] bg-white card-lift block group shadow-[0_2px_16px_rgba(0,0,0,0.06)]"
            >
              <div className="relative h-44 overflow-hidden bg-off-white">
                {(g.photos?.[0] || g.user?.avatar) && (
                  <Image
                    src={g.photos?.[0] || g.user?.avatar || ""}
                    alt={g.user?.name || g.city}
                    fill
                    sizes="33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                {g.isVerified && (
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-white/90 text-green-dark text-xs font-semibold px-2 py-1 rounded-full">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-text-dark">{g.user?.name}</p>
                  {g.rating ? (
                    <span className="flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {g.rating}
                    </span>
                  ) : null}
                </div>
                <p className="flex items-center gap-1 text-sm text-text-grey mt-0.5">
                  <MapPin className="h-3.5 w-3.5" /> {g.city}{g.country ? `, ${g.country}` : ""}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(g.expertise || []).slice(0, 3).map((e) => (
                    <span key={e} className="text-[11px] bg-off-white px-2 py-0.5 rounded-full text-text-grey">
                      {e}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm">
                  <span className="font-bold text-green-dark">{formatPrice(g.dailyRate || 0)}</span>
                  <span className="text-text-grey"> / day</span>
                </p>
              </div>
            </Link>
            </StaggerRevealItem>
          ))}
        </StaggerReveal>
      )}
    </div>
  );
}
