"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ChevronDown, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  variant?: "hero" | "inline";
  className?: string;
}

export function SearchBar({ variant = "hero", className }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [showTravelers, setShowTravelers] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    params.set("travelers", String(travelers));
    router.push(`/packages?${params.toString()}`);
  };

  const isHero = variant === "hero";

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "flex flex-col sm:flex-row items-stretch sm:items-center gap-0 rounded-2xl overflow-hidden",
          isHero
            ? "bg-white shadow-search border border-white/20"
            : "bg-white shadow-card border border-border"
        )}
      >
        <div className="flex-1 flex items-center px-4 sm:px-5 py-3.5 sm:py-0 sm:h-[56px] border-b sm:border-b-0 sm:border-r border-border/60">
          <Search className="h-4 w-4 text-text-muted shrink-0 mr-3" />
          <input
            type="text"
            placeholder="Search countries, cities"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 bg-transparent text-[15px] text-text-primary placeholder:text-text-muted outline-none"
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTravelers(!showTravelers)}
            className="flex items-center gap-2 px-4 sm:px-5 py-3.5 sm:py-0 sm:h-[56px] sm:min-w-[160px] text-left hover:bg-surface/50 transition-colors w-full sm:w-auto"
          >
            <span className="text-[13px] text-text-muted sm:hidden">Who&apos;s coming along?</span>
            <span className="hidden sm:block text-[13px] text-text-muted mr-1">Who&apos;s coming along?</span>
            <span className="text-[15px] font-semibold text-text-primary">
              {travelers} {travelers === 1 ? "Traveller" : "Travellers"}
            </span>
            <ChevronDown className={cn("h-4 w-4 text-text-muted ml-auto transition-transform", showTravelers && "rotate-180")} />
          </button>

          {showTravelers && (
            <div className="absolute top-full left-0 right-0 sm:left-auto sm:right-0 sm:w-64 z-20 bg-white border border-border rounded-xl shadow-card-hover p-4 mt-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">Travellers</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTravelers(Math.max(1, travelers - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:border-brand-green hover:text-brand-green transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-base font-semibold w-6 text-center">{travelers}</span>
                  <button
                    type="button"
                    onClick={() => setTravelers(Math.min(20, travelers + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:border-brand-green hover:text-brand-green transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSearch}
          className="hidden sm:flex items-center justify-center h-[56px] px-8 bg-brand-green hover:bg-brand-green-dark text-white font-semibold text-[15px] transition-colors"
        >
          Search
        </button>
      </div>

      <button
        type="button"
        onClick={handleSearch}
        className="sm:hidden w-full mt-3 h-12 rounded-pill bg-brand-green hover:bg-brand-green-dark text-white font-semibold text-[15px] transition-colors"
      >
        Search
      </button>
    </div>
  );
}
