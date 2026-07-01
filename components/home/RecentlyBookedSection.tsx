"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BUDGET_FILTERS, filterByBudget } from "@/lib/home-filters";
import { packagesAPI } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { LazyImage } from "@/components/motion/LazyImage";
import { AnimatedTabs } from "@/components/motion/AnimatedTabs";
import { WishlistHeart } from "@/components/wishlist/WishlistHeart";

const AVATAR_COLORS = ["#E74C3C", "#3498DB", "#9B59B6", "#F39C12", "#1ABC9C", "#E67E22"];

interface RecentBookingCard {
  id: string;
  userInitial: string;
  userColor: string;
  userName: string;
  city: string;
  bookedAgo: string;
  title: string;
  image: string;
  price: number;
}

function mapRecentBooking(
  item: {
    packageId: string;
    packageTitle: string;
    image?: string;
    userName: string;
    userCity: string;
    bookedAgo: string;
    price: number;
  },
  index: number
): RecentBookingCard {
  return {
    id: item.packageId,
    userInitial: item.userName?.charAt(0)?.toUpperCase() || "?",
    userColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
    userName: item.userName,
    city: item.userCity,
    bookedAgo: item.bookedAgo,
    title: item.packageTitle,
    image: item.image || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
    price: item.price,
  };
}

export function RecentlyBookedSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState("all");
  const [bookings, setBookings] = useState<RecentBookingCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await packagesAPI.recentBookings();
        if (cancelled) return;
        const items = (data.data || []).map((item: Parameters<typeof mapRecentBooking>[0], i: number) =>
          mapRecentBooking(item, i)
        );
        setBookings(items);
      } catch {
        if (!cancelled) setBookings([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = bookings.filter((b) => filterByBudget(b.price, filter));

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  return (
    <section className="bg-white section">
      <div className="container-x">
        <div className="flex flex-col gap-5 mb-6">
          <div>
            <h2 className="section-heading">Recently Booked</h2>
            <p className="text-sm text-text-grey mt-1">
              {bookings.length > 0
                ? `${bookings.length}+ trips booked recently`
                : "Live bookings from XOXO travellers"}
            </p>
          </div>
          <AnimatedTabs
            tabs={BUDGET_FILTERS.map((f) => ({ id: f.id, label: f.label }))}
            active={filter}
            onChange={setFilter}
          />
        </div>

        <div className="flex justify-end gap-2 mb-4">
          <button onClick={() => scroll("left")} className="carousel-btn" aria-label="Previous">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => scroll("right")} className="carousel-btn" aria-label="Next">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="shrink-0 w-[280px] h-[280px] bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-text-grey py-8 text-center border border-dashed border-[#E0E0E0] rounded-2xl">
            No recent bookings loaded from the API yet.
          </p>
        ) : (
          <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
            {filtered.map((card) => (
              <div key={card.id} className="relative shrink-0 w-[280px] snap-start">
                <WishlistHeart packageId={card.id} />
                <Link
                  href={`/packages/${card.id}`}
                  className="block rounded-2xl overflow-hidden border border-[#EBEBEB] shadow-premium card-lift bg-white"
                >
                  <div className="relative h-[200px] overflow-hidden">
                    <LazyImage src={card.image} alt={card.title} fill sizes="280px" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full pl-1 pr-2.5 py-1 max-w-[calc(100%-3rem)]">
                      <div
                        className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: card.userColor }}
                      >
                        {card.userInitial}
                      </div>
                      <span className="text-white text-[11px] truncate">
                        {card.userName} · {card.bookedAgo}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[15px] font-bold text-text-dark leading-snug line-clamp-2">
                      {card.title}
                    </p>
                    <p className="text-sm font-semibold text-green-dark mt-2">
                      {formatPrice(card.price)} / person
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
