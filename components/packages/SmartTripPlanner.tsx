"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { aiAPI } from "@/lib/api";
import type { TravelStyle } from "@/lib/budget-calculator";
import toast from "react-hot-toast";

interface Props {
  packageId: string;
  destination?: string;
  defaultDays: number;
  defaultBudget?: number;
  category?: string;
}

const STYLES: { id: TravelStyle; label: string }[] = [
  { id: "adventure", label: "Adventure" },
  { id: "romantic", label: "Romantic" },
  { id: "family", label: "Family" },
  { id: "luxury", label: "Luxury" },
  { id: "backpacking", label: "Backpacking" },
];

export function SmartTripPlanner({ packageId, destination, defaultDays, defaultBudget, category }: Props) {
  const router = useRouter();
  const [days, setDays] = useState(defaultDays);
  const [budget, setBudget] = useState(defaultBudget || 150000);
  const [style, setStyle] = useState<TravelStyle>("family");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const regenerate = async () => {
    if (!destination) {
      router.push(`/concierge?package=${packageId}`);
      return;
    }
    setLoading(true);
    try {
      const tripType =
        category === "corporate"
          ? "corporate"
          : style === "romantic"
            ? "couple"
            : style === "family"
              ? "family"
              : style === "backpacking"
                ? "solo"
                : "group";
      const budgetTier = budget > 200000 ? "luxury" : budget > 100000 ? "mid-range" : "budget";
      const { data } = await aiAPI.generateItinerary({
        destination,
        days,
        tripType,
        budget: budgetTier,
        travelStyle: [style],
      });
      const plan = data.data || data.itinerary || data;
      const text =
        typeof plan === "string"
          ? plan
          : plan.summary || plan.title || "Your custom itinerary is ready!";
      setPreview(text.slice(0, 400) + (text.length > 400 ? "…" : ""));
      toast.success("Itinerary regenerated!");
    } catch {
      toast.error("Couldn't regenerate — try Concierge for full planning.");
      router.push(`/concierge?destination=${encodeURIComponent(destination || "")}&budget=${budget}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-10 rounded-2xl border border-green-dark/20 bg-gradient-to-br from-green-dark/5 to-transparent p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-green-dark" aria-hidden />
        <h2 className="section-heading text-xl">Smart Trip Planner</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mb-4">
        <label className="text-sm">
          <span className="text-text-grey">Days</span>
          <input
            type="range"
            min={3}
            max={21}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="mt-2 w-full accent-green-dark"
          />
          <span className="font-semibold">{days} days</span>
        </label>
        <label className="text-sm">
          <span className="text-text-grey">Budget (₹)</span>
          <input
            type="number"
            min={50000}
            step={10000}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-[#EBEBEB] px-3 py-2"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {STYLES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStyle(s.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              style === s.id
                ? "bg-green-dark text-white"
                : "border border-[#EBEBEB] text-text-grey hover:border-green-dark"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={regenerate}
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-full bg-green-neon px-6 py-3 font-bold text-white hover:bg-green-dark transition-colors disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Regenerate Itinerary
      </button>

      {preview && (
        <p className="mt-4 rounded-xl bg-white/80 p-4 text-sm text-text-grey leading-relaxed">{preview}</p>
      )}

      <button
        type="button"
        onClick={() =>
          router.push(
            `/concierge?destination=${encodeURIComponent(destination || "")}&days=${days}&budget=${budget}&style=${style}`
          )
        }
        className="mt-3 text-sm font-semibold text-green-dark hover:underline"
      >
        Open full AI Concierge →
      </button>
    </section>
  );
}
