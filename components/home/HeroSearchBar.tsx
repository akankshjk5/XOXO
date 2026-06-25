"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  ChevronDown,
  Minus,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "packages", label: "Packages", emoji: "🌴" },
  { id: "destinations", label: "Destinations", emoji: "🗺️" },
  { id: "visa", label: "Visa", emoji: "🛂" },
  { id: "guides", label: "Guides", emoji: "🧭" },
];

const BUDGETS = ["Any Budget", "Under ₹50K", "₹50K–₹1.5L", "₹1.5L+", "Luxury"];

export function HeroSearchBar() {
  const router = useRouter();
  const [tab, setTab] = useState("packages");
  const [destination, setDestination] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState("Any Budget");
  const [showBudget, setShowBudget] = useState(false);
  const [showTravelers, setShowTravelers] = useState(false);

  const placeholders: Record<string, string> = {
    packages: "Where to?",
    destinations: "Search destinations",
    visa: "Country for visa",
    guides: "City or region",
  };

  const handleSearch = () => {
    const routes: Record<string, string> = {
      packages: "/packages",
      destinations: "/destinations",
      visa: "/visa",
      guides: "/guides",
    };
    const params = new URLSearchParams();
    if (destination) params.set("q", destination);
    params.set("travelers", String(travelers));
    if (budget !== "Any Budget") params.set("budget", budget);
    router.push(`${routes[tab]}?${params.toString()}`);
  };

  return (
    <div className="glass rounded-2xl p-4 sm:p-5 shadow-glass w-full max-w-[900px] relative">
      <div className="flex gap-1 mb-4 overflow-x-auto scrollbar-hide pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0",
              tab === t.id
                ? "bg-white text-navy shadow-sm"
                : "text-white/80 hover:text-white hover:bg-white/10"
            )}
          >
            <span>{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className={cn("grid gap-3", tab === "packages" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-3")}>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            placeholder={placeholders[tab]}
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full h-12 pl-10 pr-4 rounded-xl bg-white text-sm text-text-primary placeholder:text-text-secondary shadow-sm border-0 outline-none focus:ring-2 focus:ring-navy/20"
          />
        </div>

        <div className="relative">
          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input
            type="date"
            className="w-full h-12 pl-10 pr-4 rounded-xl bg-white text-sm text-text-primary shadow-sm border-0 outline-none focus:ring-2 focus:ring-navy/20"
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => { setShowTravelers(!showTravelers); setShowBudget(false); }}
            className="w-full h-12 pl-10 pr-4 rounded-xl bg-white text-sm text-left text-text-primary shadow-sm flex items-center"
          >
            <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            {travelers} Traveller{travelers > 1 ? "s" : ""}
            <ChevronDown className="ml-auto h-4 w-4 text-text-secondary" />
          </button>
          {showTravelers && (
            <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-white rounded-xl shadow-premium-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Travellers</span>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setTravelers(Math.max(1, travelers - 1))} className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:border-navy">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="font-semibold w-4 text-center">{travelers}</span>
                  <button type="button" onClick={() => setTravelers(Math.min(20, travelers + 1))} className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:border-navy">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {tab === "packages" ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => { setShowBudget(!showBudget); setShowTravelers(false); }}
              className="w-full h-12 pl-10 pr-4 rounded-xl bg-white text-sm text-left text-text-primary shadow-sm flex items-center"
            >
              <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              {budget}
              <ChevronDown className="ml-auto h-4 w-4 text-text-secondary" />
            </button>
            {showBudget && (
              <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-white rounded-xl shadow-premium-lg border border-border py-2">
                {BUDGETS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => { setBudget(b); setShowBudget(false); }}
                    className={cn(
                      "w-full px-4 py-2.5 text-sm text-left hover:bg-surface",
                      budget === b ? "text-navy font-semibold" : "text-text-secondary"
                    )}
                  >
                    {b}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSearch}
            className="h-12 rounded-xl bg-navy hover:bg-navy-light text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        )}
      </div>

      {tab === "packages" && (
        <button
          type="button"
          onClick={handleSearch}
          className="mt-4 w-full h-12 rounded-xl bg-navy hover:bg-navy-light text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:shadow-md"
        >
          <Search className="h-4 w-4" />
          Search Packages
        </button>
      )}
    </div>
  );
}
