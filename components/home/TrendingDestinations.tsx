"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";
import { PREMIUM_DESTINATIONS, DESTINATION_FILTERS } from "@/lib/home-data";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion/FadeIn";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

const BADGE_COLORS = {
  Hot: "bg-red-500",
  New: "bg-green-500",
  Deal: "bg-orange",
};

export function TrendingDestinations() {
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all"
      ? PREMIUM_DESTINATIONS
      : PREMIUM_DESTINATIONS.filter((d) => d.categories.includes(filter));

  return (
    <section className="section bg-white">
      <div className="container-x">
        <FadeIn className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">
              Trending Destinations
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Handpicked for Indian Travellers
            </p>
          </div>
          <Link
            href="/destinations"
            className="inline-flex items-center gap-1 text-sm font-semibold text-navy hover:gap-2 transition-all"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeIn>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {DESTINATION_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "filter-pill",
                filter === f.id ? "filter-pill-active" : "filter-pill-inactive"
              )}
            >
              {f.emoji && <span>{f.emoji}</span>}
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filtered.map((dest) => (
            <StaggerItem key={dest.id}>
              <Link href={`/destination/${dest.slug}`} className="group block">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-premium hover:shadow-premium-lg transition-shadow"
                  style={{ background: dest.gradient }}
                >
                  {/* Emoji placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl sm:text-7xl opacity-40 group-hover:scale-110 transition-transform duration-500">
                      {dest.emoji}
                    </span>
                  </div>

                  {/* Badge */}
                  {dest.badge && (
                    <span
                      className={cn(
                        "absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white uppercase tracking-wide",
                        BADGE_COLORS[dest.badge]
                      )}
                    >
                      {dest.badge}
                    </span>
                  )}

                  {/* Bottom overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                      {dest.name}
                    </h3>
                    <p className="text-sm text-white/90 mb-1.5">
                      from {formatPrice(dest.price)}/person
                    </p>
                    <div className="flex items-center gap-1 text-xs text-white/80">
                      <Star className="h-3 w-3 fill-orange text-orange" />
                      {dest.rating} · {dest.reviews} reviews
                    </div>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      Explore <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </motion.div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
