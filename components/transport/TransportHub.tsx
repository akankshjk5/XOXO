"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plane,
  Bus,
  Train,
  Car,
  Ship,
  Loader2,
  Sparkles,
  Filter,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { transportAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";
import type { TransportFilters, TransportOffer, TransportSearchResult } from "@/lib/transport-types";
import { MODE_ICONS } from "@/lib/transport-types";
import { TransportBookingModal } from "./TransportBookingModal";

const MODE_OPTIONS = [
  { id: "flight", label: "Flights", icon: Plane },
  { id: "bus", label: "Buses", icon: Bus },
  { id: "train", label: "Trains", icon: Train },
  { id: "taxi", label: "Taxi", icon: Car },
  { id: "bike_taxi", label: "Bike Taxi", icon: Car },
  { id: "self_drive", label: "Self Drive", icon: Car },
  { id: "car_rental", label: "Car Rentals", icon: Car },
  { id: "ferry", label: "Ferries", icon: Ship },
  { id: "cruise", label: "Cruises", icon: Ship },
  { id: "airport_transfer", label: "Airport Transfers", icon: Plane },
];

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export function TransportHub() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [origin, setOrigin] = useState("DEL");
  const [destination, setDestination] = useState("MUM");
  const [departureDate, setDepartureDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  );
  const [passengers, setPassengers] = useState(1);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TransportSearchResult | null>(null);
  const [filters, setFilters] = useState<TransportFilters>({ sort: "price" });
  const [showFilters, setShowFilters] = useState(false);
  const [bookingOffer, setBookingOffer] = useState<TransportOffer | null>(null);

  const toggleMode = (id: string) => {
    setSelectedModes((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const search = useCallback(async () => {
    if (!origin || !destination || !departureDate) {
      toast.error("Origin, destination, and date are required.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await transportAPI.search({
        origin,
        destination,
        departureDate,
        passengers,
        modes: selectedModes.length ? selectedModes.join(",") : undefined,
        ...filters,
      });
      setResult(data);
    } catch {
      toast.error("Transport search failed. Try again.");
    } finally {
      setLoading(false);
    }
  }, [origin, destination, departureDate, passengers, selectedModes, filters]);

  const displayGroups = useMemo(
    () => (result?.grouped || []).filter((g) => g.status !== "coming_soon"),
    [result]
  );

  const handleBook = (offer: TransportOffer) => {
    if (!user) {
      toast.error("Please log in to book.");
      router.push(`/login?redirect=/transport`);
      return;
    }
    setBookingOffer(offer);
  };

  return (
    <div className="min-h-screen bg-off-white">
      <div className="bg-gradient-to-br from-green-dark via-green-mid to-green-bright text-white">
        <div className="container-x py-10 md:py-14">
          <p className="text-green-bright/90 text-sm font-semibold uppercase tracking-wider mb-2">
            XOXO Transport Hub
          </p>
          <h1 className="text-3xl md:text-4xl font-black mb-2">One search. Every way to travel.</h1>
          <p className="text-white/80 max-w-2xl">
            Compare flights, buses, trains, taxis, ferries, cruises, and more — all from one place.
          </p>
        </div>
      </div>

      <div className="container-x -mt-8 relative z-10 pb-16">
        <div className="rounded-2xl border border-[#E8E8E8] bg-white shadow-elevated p-5 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-text-grey uppercase">From</label>
              <input
                value={origin}
                onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm"
                placeholder="DEL or city"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text-grey uppercase">To</label>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value.toUpperCase())}
                className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm"
                placeholder="MUM or city"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text-grey uppercase">Departure</label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text-grey uppercase">Passengers</label>
              <input
                type="number"
                min={1}
                max={9}
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {MODE_OPTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => toggleMode(id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  selectedModes.length === 0 || selectedModes.includes(id)
                    ? "bg-green-dark text-white border-green-dark"
                    : "bg-white text-text-grey border-[#E0E0E0]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={search}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-green-dark text-white font-semibold text-sm hover:bg-green-mid disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Search all transport
            </button>
            <button
              type="button"
              onClick={() => setShowFilters((s) => !s)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#E0E0E0] text-sm font-semibold"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl bg-off-white">
              <input
                type="number"
                placeholder="Max price ₹"
                className="rounded-lg border px-3 py-2 text-sm"
                onChange={(e) =>
                  setFilters((f) => ({ ...f, maxPrice: e.target.value ? Number(e.target.value) : undefined }))
                }
              />
              <input
                type="number"
                placeholder="Max duration (min)"
                className="rounded-lg border px-3 py-2 text-sm"
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    maxDuration: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
              <input
                type="number"
                placeholder="Max stops"
                className="rounded-lg border px-3 py-2 text-sm"
                onChange={(e) =>
                  setFilters((f) => ({ ...f, maxStops: e.target.value ? Number(e.target.value) : undefined }))
                }
              />
              <select
                className="rounded-lg border px-3 py-2 text-sm"
                value={filters.sort || "price"}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    sort: e.target.value as TransportFilters["sort"],
                  }))
                }
              >
                <option value="price">Sort: Price</option>
                <option value="duration">Sort: Duration</option>
                <option value="departure">Sort: Departure</option>
              </select>
            </div>
          )}
        </div>

        {result?.recommendations && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: "cheapest", title: "Cheapest", accent: "bg-emerald-50 border-emerald-200" },
              { key: "fastest", title: "Fastest", accent: "bg-sky-50 border-sky-200" },
              { key: "bestValue", title: "Best Value", accent: "bg-amber-50 border-amber-200" },
            ].map(({ key, title, accent }) => {
              const rec = result.recommendations[key as keyof typeof result.recommendations];
              if (!rec) return null;
              const fullOffer = result.offers.find((o) => o.id === rec.id);
              return (
                <motion.button
                  key={key}
                  type="button"
                  onClick={() => fullOffer && handleBook(fullOffer)}
                  disabled={!fullOffer}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 ${accent}`}
                >
                  <p className="text-xs font-bold uppercase text-text-grey">{title}</p>
                  <p className="font-bold text-text-dark mt-1">{rec.label}</p>
                  <p className="text-sm text-text-grey mt-1">
                    {MODE_ICONS[rec.mode]} {rec.mode.replace("_", " ")}
                    {rec.price != null && ` · ${formatPrice(rec.price)}`}
                    {rec.durationMinutes != null && ` · ${formatDuration(rec.durationMinutes)}`}
                  </p>
                  {fullOffer && (
                    <p className="text-xs font-semibold text-green-dark mt-2">Tap to book →</p>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}

        {result && (
          <p className="mt-6 text-sm text-text-grey">
            {result.meta.total} options · {result.meta.demo ? "Demo data" : "Live + demo mix"}
          </p>
        )}

        <div className="mt-6 space-y-8">
          {displayGroups.map((group) => (
            <section key={group.mode}>
              <h2 className="text-lg font-black text-text-dark mb-3 flex items-center gap-2">
                <span>{MODE_ICONS[group.mode] || "🚍"}</span>
                {group.label}
                <span className="text-sm font-normal text-text-grey">({group.count})</span>
              </h2>

              {group.status === "coming_soon" ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-text-grey text-sm">
                  Metro integration coming soon.
                </div>
              ) : group.offers.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-text-grey text-sm">
                  No options for this route right now.
                </div>
              ) : (
                <div className="space-y-3">
                  {group.offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="rounded-2xl border bg-white p-4 md:p-5 shadow-sm hover:shadow-elevated transition-shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                    >
                      <div>
                        <p className="font-bold text-text-dark">{offer.providerLabel}</p>
                        <p className="text-sm text-text-grey">{offer.summary || offer.vehicleClass}</p>
                        <p className="text-sm mt-2 flex items-center gap-2">
                          <span className="font-semibold">{formatTime(offer.departureAt)}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-text-grey" />
                          <span className="font-semibold">{formatTime(offer.arrivalAt)}</span>
                          <span className="text-text-grey">
                            · {formatDuration(offer.durationMinutes)}
                            {offer.stops > 0 ? ` · ${offer.stops} stop(s)` : " · Non-stop"}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <p className="text-xl font-black text-green-dark">{formatPrice(offer.price)}</p>
                        <button
                          type="button"
                          onClick={() => handleBook(offer)}
                          className="px-5 py-2.5 rounded-full bg-green-dark text-white text-sm font-semibold hover:bg-green-mid"
                        >
                          Book
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>

      {bookingOffer && (
        <TransportBookingModal
          offer={bookingOffer}
          passengers={passengers}
          onClose={() => setBookingOffer(null)}
        />
      )}
    </div>
  );
}
