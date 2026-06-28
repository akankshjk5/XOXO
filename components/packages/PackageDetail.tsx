"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Star, Clock, Check, X, Minus, Plus, Share2, ChevronDown, Heart } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import toast from "react-hot-toast";
import { packagesAPI, usersAPI } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { BookingModal } from "@/components/packages/BookingModal";
import { PackageReviews } from "@/components/packages/PackageReviews";

interface ItineraryDay {
  day: number;
  title: string;
  description?: string;
  activities?: string[];
  meals?: string[];
  accommodation?: string;
}
interface PackageFull {
  _id: string;
  title: string;
  description?: string;
  images?: string[];
  pricePerPerson: number;
  originalPrice?: number;
  durationDays: number;
  durationNights?: number;
  category?: string;
  rating?: number;
  reviewCount?: number;
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: ItineraryDay[];
  highlights?: string[];
  destination?: { name?: string; country?: string };
  similar?: {
    _id: string;
    title: string;
    images?: string[];
    pricePerPerson: number;
    durationDays: number;
  }[];
}

const TABS = ["Itinerary", "Inclusions", "Reviews"] as const;

export function PackageDetail() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [pkg, setPkg] = useState<PackageFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Itinerary");
  const [travelers, setTravelers] = useState(2);
  const [openDay, setOpenDay] = useState<number | null>(1);
  const [showBooking, setShowBooking] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!user || !id) return;
    usersAPI
      .getWishlist()
      .then(({ data }) => {
        setWishlisted((data.data || []).some((p: { _id: string }) => p._id === id));
      })
      .catch(() => {});
  }, [user, id]);

  const toggleWishlist = async () => {
    if (!id) return;
    if (!user) {
      toast.error("Please log in to save to wishlist.");
      return;
    }
    try {
      const { data } = await usersAPI.toggleWishlist(id);
      setWishlisted(data.added);
      toast.success(data.added ? "Added to wishlist ❤️" : "Removed from wishlist");
    } catch {
      toast.error("Couldn't update wishlist.");
    }
  };

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const { data } = await packagesAPI.getById(id);
        setPkg(data.data);
      } catch {
        toast.error("Couldn't load this package.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Couldn't copy link.");
    }
  };

  const book = () => {
    if (!user) {
      toast.error("Please log in to book this trip.");
      router.push(`/login?redirect=/packages/${id}`);
      return;
    }
    setShowBooking(true);
  };

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="h-72 bg-gray-200 animate-pulse rounded-2xl mb-6" />
        <div className="h-8 w-1/2 bg-gray-200 animate-pulse rounded mb-4" />
        <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 pt-32 pb-20 text-center">
        <p className="text-5xl mb-3">🧭</p>
        <p className="text-text-grey mb-4">Package not found.</p>
        <Link href="/packages" className="text-green-dark font-semibold hover:underline">← Back to packages</Link>
      </div>
    );
  }

  const heroImg = pkg.images?.[0] || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80";
  const total = pkg.pricePerPerson * travelers;

  return (
    <div className="pt-[68px] pb-24 lg:pb-16">
      {/* Hero */}
      <div className="relative h-[42vh] min-h-[300px] w-full overflow-hidden">
        <Image src={heroImg} alt={pkg.title} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-[1280px] mx-auto px-4 sm:px-6 pb-6">
          {pkg.destination?.name && (
            <p className="text-white/80 text-sm uppercase tracking-widest mb-1">
              {pkg.destination.name}{pkg.destination.country ? `, ${pkg.destination.country}` : ""}
            </p>
          )}
          <h1 className="text-2xl sm:text-4xl font-black text-white max-w-3xl">{pkg.title}</h1>
          <div className="flex items-center gap-4 mt-3 text-white text-sm">
            {pkg.rating ? (
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {pkg.rating} ({pkg.reviewCount})
              </span>
            ) : null}
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {pkg.durationDays}D/{pkg.durationNights ?? pkg.durationDays - 1}N
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2">
          {pkg.description && <p className="text-text-grey leading-relaxed mb-6">{pkg.description}</p>}

          {/* Tabs */}
          <div className="flex gap-2 border-b border-[#EBEBEB] mb-5">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                  tab === t ? "border-green-neon text-green-dark" : "border-transparent text-text-grey hover:text-text-dark"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "Itinerary" && (
            <div className="space-y-3">
              {(pkg.itinerary || []).map((d) => (
                <div key={d.day} className="border border-[#EBEBEB] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenDay(openDay === d.day ? null : d.day)}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-off-white"
                  >
                    <span className="font-semibold text-text-dark">
                      <span className="text-green-neon">Day {d.day}</span> · {d.title}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${openDay === d.day ? "rotate-180" : ""}`} />
                  </button>
                  {openDay === d.day && (
                    <motion.div
                      initial={reduced ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduced ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: reduced ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 text-sm text-text-grey space-y-2">
                        {d.description && <p>{d.description}</p>}
                        {d.activities?.length ? (
                          <ul className="list-disc pl-5 space-y-1">
                            {d.activities.map((a, i) => <li key={i}>{a}</li>)}
                          </ul>
                        ) : null}
                        {d.accommodation && <p className="text-text-dark">🏨 {d.accommodation}</p>}
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
              {!pkg.itinerary?.length && <p className="text-text-grey">Itinerary coming soon.</p>}
            </div>
          )}

          {tab === "Inclusions" && (
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-text-dark mb-3">What&apos;s included</h3>
                <ul className="space-y-2">
                  {(pkg.inclusions || []).map((inc, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-grey">
                      <Check className="h-4 w-4 text-green-neon shrink-0 mt-0.5" /> {inc}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-text-dark mb-3">Not included</h3>
                <ul className="space-y-2">
                  {(pkg.exclusions || []).map((exc, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-grey">
                      <X className="h-4 w-4 text-red-400 shrink-0 mt-0.5" /> {exc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {tab === "Reviews" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-black text-text-dark">{pkg.rating || "—"}</span>
                <div className="text-sm text-text-grey">
                  Based on {pkg.reviewCount || 0} traveller reviews
                </div>
              </div>
              <PackageReviews packageId={pkg._id} />
            </div>
          )}
        </div>

        {/* Sticky sidebar */}
        <aside className="lg:sticky lg:top-24 h-fit border border-[#EBEBEB] rounded-2xl p-5 shadow-sm bg-white">
          <div className="flex items-end gap-2 mb-1">
            <span className="text-2xl font-black text-green-dark">{formatPrice(pkg.pricePerPerson)}</span>
            {pkg.originalPrice && (
              <span className="text-sm text-text-grey line-through mb-0.5">{formatPrice(pkg.originalPrice)}</span>
            )}
          </div>
          <p className="text-xs text-text-grey mb-4">per person</p>

          <div className="flex items-center justify-between border border-[#EBEBEB] rounded-xl px-4 py-3 mb-4">
            <span className="text-sm font-medium">Travellers</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTravelers((t) => Math.max(1, t - 1))}
                className="h-7 w-7 rounded-full border border-[#E0E0E0] flex items-center justify-center hover:border-green-dark"
                aria-label="Decrease"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-5 text-center font-semibold">{travelers}</span>
              <button
                onClick={() => setTravelers((t) => Math.min(12, t + 1))}
                className="h-7 w-7 rounded-full border border-[#E0E0E0] flex items-center justify-center hover:border-green-dark"
                aria-label="Increase"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4 text-sm">
            <span className="text-text-grey">Total</span>
            <span className="text-lg font-bold text-text-dark">{formatPrice(total)}</span>
          </div>

          <button
            onClick={book}
            className="w-full bg-green-neon text-white font-bold py-3 rounded-full hover:bg-green-dark transition-colors mb-3"
          >
            Book Now
          </button>
          <div className="flex gap-3">
            <button
              onClick={toggleWishlist}
              className={`flex-1 flex items-center justify-center gap-2 border font-medium py-3 rounded-full transition-colors ${
                wishlisted
                  ? "border-red-300 text-red-500 bg-red-50"
                  : "border-[#E0E0E0] text-text-dark hover:border-green-dark"
              }`}
            >
              <Heart className={`h-4 w-4 ${wishlisted ? "fill-red-500" : ""}`} /> {wishlisted ? "Saved" : "Save"}
            </button>
            <button
              onClick={share}
              className="flex-1 flex items-center justify-center gap-2 border border-[#E0E0E0] text-text-dark font-medium py-3 rounded-full hover:border-green-dark transition-colors"
            >
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>
        </aside>
      </div>

      {/* Similar packages */}
      {pkg.similar?.length ? (
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pb-16">
          <h2 className="section-heading mb-5">Similar Packages</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {pkg.similar.map((s) => (
              <Link key={s._id} href={`/packages/${s._id}`} className="rounded-2xl overflow-hidden border border-[#EBEBEB] bg-white card-lift block group">
                <div className="relative h-32 overflow-hidden">
                  <Image
                    src={s.images?.[0] || heroImg}
                    alt={s.title}
                    fill
                    sizes="25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold line-clamp-2 mb-1">{s.title}</p>
                  <p className="text-sm font-bold text-green-dark">{formatPrice(s.pricePerPerson)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {showBooking && (
        <BookingModal
          pkg={{ _id: pkg._id, title: pkg.title, pricePerPerson: pkg.pricePerPerson }}
          travelers={travelers}
          onClose={() => setShowBooking(false)}
        />
      )}

      {/* Mobile sticky booking bar */}
      <div
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#EBEBEB] px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="min-w-0">
          <p className="text-[11px] text-text-grey uppercase">From</p>
          <p className="text-lg font-black text-green-dark leading-tight">{formatPrice(total)}</p>
          <p className="text-[11px] text-text-grey">{travelers} traveller{travelers === 1 ? "" : "s"}</p>
        </div>
        <button
          type="button"
          onClick={book}
          className="shrink-0 px-6 py-3 rounded-full bg-green-neon text-white font-bold hover:bg-green-dark transition-colors"
          aria-label={`Book ${pkg.title}`}
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
