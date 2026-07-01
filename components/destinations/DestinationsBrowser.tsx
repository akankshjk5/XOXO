"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import toast from "react-hot-toast";
import { destinationsAPI } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import {
  AnimatedTabs,
  EmptyState,
  SkeletonDestination,
  StaggerReveal,
  StaggerRevealItem,
} from "@/components/motion";
import { WishlistHeart } from "@/components/wishlist/WishlistHeart";

interface ApiDestination {
  _id: string;
  name: string;
  country: string;
  slug: string;
  tagline?: string;
  coverImage?: string;
  avgPriceINR?: number;
  isVisaFree?: boolean;
  isTrending?: boolean;
}

const FILTERS = [
  { id: "all", label: "All" },
  { id: "trending", label: "Trending" },
  { id: "visa-free", label: "Visa Free" },
  { id: "adventure", label: "Adventure" },
];

export function DestinationsBrowser() {
  const [items, setItems] = useState<ApiDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let res;
        if (filter === "trending") res = await destinationsAPI.getTrending();
        else if (filter === "adventure") res = await destinationsAPI.getAdventure();
        else if (filter === "visa-free") res = await destinationsAPI.getAll({});
        else res = await destinationsAPI.getAll({});
        let data: ApiDestination[] = res.data.data || [];
        if (filter === "visa-free") data = data.filter((d) => d.isVisaFree);
        setItems(data);
      } catch {
        toast.error("Couldn't load destinations.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [filter]);

  const visible = items.filter(
    (d) =>
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container-x section">
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex items-center gap-2 flex-1 bg-white border border-[#E0E0E0] rounded-full px-4 py-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] focus-within:border-green-dark/40 transition-colors">
          <Search className="h-4 w-4 text-text-grey shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search destinations…"
            className="flex-1 outline-none text-sm bg-transparent"
          />
        </div>
        <AnimatedTabs tabs={FILTERS} active={filter} onChange={setFilter} className="sm:justify-end" />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonDestination key={i} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon="🗺️"
          title="No destinations found"
          description="Try a different filter or search term."
          cta="View all destinations"
          href="/destinations"
        />
      ) : (
        <StaggerReveal className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {visible.map((d) => (
            <StaggerRevealItem key={d._id}>
              <div className="relative">
                <WishlistHeart destinationId={d._id} />
              <Link
                href={`/destinations/${d.slug}`}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden card-lift group block shadow-premium"
              >
                <Image
                  src={d.coverImage || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"}
                  alt={d.name}
                  fill
                  sizes="(max-width:768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                {d.isVisaFree && (
                  <span className="absolute top-3 left-3 bg-green-bright text-green-dark text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    VISA FREE
                  </span>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  {d.tagline && (
                    <p className="text-[10px] uppercase text-white/70 tracking-widest mb-1 line-clamp-1">{d.tagline}</p>
                  )}
                  <p className="text-xl font-bold text-white">{d.name}</p>
                  {d.avgPriceINR && (
                    <p className="text-xs text-white/80 mt-1">from {formatPrice(d.avgPriceINR)}</p>
                  )}
                </div>
              </Link>
              </div>
            </StaggerRevealItem>
          ))}
        </StaggerReveal>
      )}
    </div>
  );
}
