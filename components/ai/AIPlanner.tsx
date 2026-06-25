"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Save, MapPin, Sun, Moon, Sunset } from "lucide-react";
import toast from "react-hot-toast";
import { aiAPI, itinerariesAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface DayPlan {
  day: number;
  title: string;
  morning?: { activity?: string; tip?: string };
  afternoon?: { activity?: string; tip?: string };
  evening?: { activity?: string; tip?: string };
  accommodation?: string;
  estimatedCost?: string;
}
interface Itinerary {
  destination: string;
  totalDays: number;
  estimatedBudget?: string;
  bestTimeToVisit?: string;
  days: DayPlan[];
  packingTips?: string[];
  localTips?: string[];
}

const TRIP_TYPES = ["solo", "couple", "family", "group"];
const BUDGETS = ["budget", "mid-range", "luxury"];
const STYLES = ["Beaches", "Adventure", "Culture", "Food", "Nightlife", "Nature", "Shopping", "Relaxation"];

export function AIPlanner() {
  const user = useAuthStore((s) => s.user);
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(5);
  const [tripType, setTripType] = useState("couple");
  const [budget, setBudget] = useState("mid-range");
  const [styles, setStyles] = useState<string[]>(["Culture"]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<Itinerary | null>(null);

  const toggleStyle = (s: string) =>
    setStyles((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const generate = async () => {
    if (!destination.trim()) {
      toast.error("Where would you like to go?");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await aiAPI.generateItinerary({
        destination,
        days,
        tripType,
        budget,
        travelStyle: styles.join(", "),
      });
      setResult(data.itinerary);
    } catch {
      toast.error("Couldn't generate itinerary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!user) {
      toast.error("Please log in to save itineraries.");
      return;
    }
    if (!result) return;
    setSaving(true);
    try {
      await itinerariesAPI.create({
        destination: result.destination,
        totalDays: result.totalDays,
        tripType,
        budget,
        travelStyle: styles.join(", "),
        data: result,
      });
      toast.success("Itinerary saved to your dashboard!");
    } catch {
      toast.error("Couldn't save itinerary.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-[88px] max-w-[1100px] mx-auto px-4 sm:px-6 pb-16">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-2 text-green-dark font-semibold text-sm mb-2">
          <Sparkles className="h-4 w-4" /> AI Trip Planner
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-text-dark">Plan your dream trip in seconds</h1>
        <p className="text-text-grey mt-2">Tell us your vibe — Trippie crafts a day-by-day itinerary.</p>
      </div>

      {/* Form */}
      <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-text-dark mb-1.5 block">Destination</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-grey" />
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Bali, Switzerland, Vietnam"
                className="w-full border border-[#E0E0E0] rounded-xl pl-9 pr-4 py-2.5 focus:border-green-dark outline-none"
              />
            </div>
          </div>
          <div>
            <label htmlFor="trip-days" className="text-sm font-semibold text-text-dark mb-1.5 block">Days: {days}</label>
            <input
              id="trip-days"
              type="range"
              min={2}
              max={15}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              aria-valuemin={2}
              aria-valuemax={15}
              aria-valuenow={days}
              className="w-full accent-green-dark mt-3"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-text-dark mb-1.5 block">Trip type</label>
            <div className="flex flex-wrap gap-2">
              {TRIP_TYPES.map((t) => (
                <Chip key={t} active={tripType === t} onClick={() => setTripType(t)} label={t} />
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-text-dark mb-1.5 block">Budget</label>
            <div className="flex flex-wrap gap-2">
              {BUDGETS.map((b) => (
                <Chip key={b} active={budget === b} onClick={() => setBudget(b)} label={b} />
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-text-dark mb-1.5 block">Travel style</label>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <Chip key={s} active={styles.includes(s)} onClick={() => toggleStyle(s)} label={s} />
            ))}
          </div>
        </div>

        <button
          onClick={generate}
          disabled={loading}
          className="w-full sm:w-auto px-8 py-3 rounded-full bg-green-dark text-white font-bold hover:bg-green-mid transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Crafting your trip…" : "Generate itinerary"}
        </button>
      </div>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 flex flex-col items-center gap-4 py-12"
        >
          <div className="flex gap-2">
            {[0, 1, 2].map((d) => (
              <motion.span
                key={d}
                className="h-3 w-3 rounded-full bg-green-neon"
                animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
              />
            ))}
          </div>
          <p className="text-text-grey text-sm font-medium">Trippie is crafting your itinerary…</p>
        </motion.div>
      )}

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-2xl font-black text-text-dark">{result.destination}</h2>
              <p className="text-text-grey text-sm">
                {result.totalDays} days · {result.estimatedBudget} · Best time: {result.bestTimeToVisit}
              </p>
            </div>
            <button
              onClick={save}
              disabled={saving}
              className="px-5 py-2.5 rounded-full border border-green-dark text-green-dark font-semibold hover:bg-green-dark hover:text-white transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
            </button>
          </div>

          <div className="space-y-4">
            {result.days?.map((d) => (
              <div key={d.day} className="border border-[#EBEBEB] rounded-2xl p-5">
                <h3 className="font-bold text-text-dark mb-3">
                  <span className="text-green-neon">Day {d.day}</span> · {d.title}
                </h3>
                <div className="grid sm:grid-cols-3 gap-3 text-sm">
                  <Slot icon={Sun} label="Morning" data={d.morning} />
                  <Slot icon={Sunset} label="Afternoon" data={d.afternoon} />
                  <Slot icon={Moon} label="Evening" data={d.evening} />
                </div>
                {d.accommodation && (
                  <p className="text-xs text-text-grey mt-3">🏨 {d.accommodation} · {d.estimatedCost}</p>
                )}
              </div>
            ))}
          </div>

          {(result.packingTips?.length || result.localTips?.length) && (
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              {result.packingTips?.length ? (
                <TipBox title="Packing tips" items={result.packingTips} />
              ) : null}
              {result.localTips?.length ? (
                <TipBox title="Local tips" items={result.localTips} />
              ) : null}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors border ${
        active ? "bg-green-dark text-white border-green-dark" : "border-[#E0E0E0] text-text-grey hover:border-green-dark"
      }`}
    >
      {label}
    </button>
  );
}

function Slot({
  icon: Icon,
  label,
  data,
}: {
  icon: React.ElementType;
  label: string;
  data?: { activity?: string; tip?: string };
}) {
  return (
    <div className="rounded-xl bg-off-white p-3">
      <p className="flex items-center gap-1.5 font-semibold text-text-dark mb-1">
        <Icon className="h-3.5 w-3.5 text-green-dark" /> {label}
      </p>
      <p className="text-text-grey">{data?.activity || "Free time"}</p>
      {data?.tip && <p className="text-xs text-text-grey/80 mt-1 italic">💡 {data.tip}</p>}
    </div>
  );
}

function TipBox({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border border-[#EBEBEB] rounded-2xl p-5">
      <h4 className="font-bold text-text-dark mb-2">{title}</h4>
      <ul className="list-disc pl-5 space-y-1 text-sm text-text-grey">
        {items.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  );
}
