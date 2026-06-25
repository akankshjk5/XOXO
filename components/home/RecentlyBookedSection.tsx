"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { BUDGET_FILTERS, RECENT_BOOKINGS, filterByBudget } from "@/lib/pyt-data";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { LazyImage } from "@/components/motion/LazyImage";

export function RecentlyBookedSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState("all");

  const filtered = RECENT_BOOKINGS.filter((b) => filterByBudget(b.price, filter));

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  return (
    <section className="bg-white section">
      <div className="container-x">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left title block */}
          <div className="lg:w-[220px] shrink-0">
            <div className="relative inline-block">
              <svg className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+8px)]" viewBox="0 0 200 60" fill="none">
                <ellipse cx="100" cy="30" rx="95" ry="28" stroke="#4ADE80" strokeWidth="2.5" fill="none" transform="rotate(-3 100 30)" />
              </svg>
              <p className="text-[clamp(28px,4vw,42px)] font-black text-text-dark leading-none tracking-tight relative">
                RECENTLY
              </p>
            </div>
            <p className="text-[clamp(28px,4vw,42px)] font-black text-text-dark leading-none tracking-tight mt-1">
              BOOKED
            </p>
            <p className="text-[clamp(28px,4vw,42px)] font-black text-text-dark leading-none tracking-tight mt-1">
              ITINERARIES
            </p>
            <p className="mt-4 text-sm text-text-grey flex items-center gap-1.5">
              <span>🤍</span> 143+ trips booked last week
            </p>
          </div>

          {/* Right scroll area */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 flex-1">
                {BUDGET_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={cn("pill-filter", filter === f.id && "pill-filter-active")}
                  >
                    {f.label}
                    {f.id === "all" && <ChevronDown className="h-3 w-3 opacity-60" />}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => scroll("left")} className="carousel-btn" aria-label="Previous">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={() => scroll("right")} className="carousel-btn" aria-label="Next">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
              {filtered.map((card) => (
                <Link
                  key={card.id}
                  href="/packages"
                  className="shrink-0 w-[280px] snap-start rounded-2xl overflow-hidden border border-[#EBEBEB] shadow-[0_2px_12px_rgba(0,0,0,0.10)] card-lift bg-white"
                >
                  <div className="relative h-[200px] overflow-hidden">
                    <LazyImage src={card.image} alt={card.title} fill sizes="280px" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full pl-1 pr-2.5 py-1">
                      <div
                        className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: card.userColor }}
                      >
                        {card.userInitial}
                      </div>
                      <span className="text-white text-[12px]">
                        {card.userName} from {card.city} · {card.bookedAgo}
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
