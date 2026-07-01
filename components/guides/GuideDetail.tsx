"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, BadgeCheck, Globe, Loader2, MessageCircle, Check } from "lucide-react";
import toast from "react-hot-toast";
import { guidesAPI } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { EmptyState, LoadingSkeleton } from "@/components/motion";

interface Guide {
  _id: string;
  city: string;
  country?: string;
  expertise?: string[];
  languages?: string[];
  dailyRate?: number;
  hourlyRate?: number;
  rating?: number;
  totalReviews?: number;
  totalBookings?: number;
  isVerified?: boolean;
  description?: string;
  photos?: string[];
  user?: { _id?: string; name?: string; avatar?: string; bio?: string; nationality?: string };
}

export function GuideDetail() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"day" | "hour">("day");
  const [qty, setQty] = useState(1);
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data } = await guidesAPI.getById(id);
        setGuide(data.data);
      } catch {
        toast.error("Couldn't load this guide.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const total =
    mode === "hour" ? (guide?.hourlyRate || 0) * qty : (guide?.dailyRate || 0) * qty;

  const book = async () => {
    if (!id) {
      toast.error("Invalid guide request.");
      return;
    }
    if (!user) {
      toast.error("Please log in to book a guide.");
      router.push(`/login?redirect=/guides/${id}`);
      return;
    }
    if (!date) {
      toast.error("Pick a date.");
      return;
    }
    setBooking(true);
    try {
      await guidesAPI.book(id, {
        date,
        days: mode === "day" ? qty : undefined,
        hours: mode === "hour" ? qty : undefined,
        message,
      });
      toast.success("Request sent! The guide will confirm shortly. 🎉");
      router.push("/dashboard");
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Couldn't book this guide.";
      toast.error(msg);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-[88px] max-w-[1100px] mx-auto px-4 sm:px-6 pb-16">
        <LoadingSkeleton className="h-64 rounded-2xl mb-6" />
        <div className="grid lg:grid-cols-3 gap-6">
          <LoadingSkeleton className="h-48 lg:col-span-2 rounded-2xl" />
          <LoadingSkeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }
  if (!guide) {
    return (
      <div className="pt-[88px] max-w-lg mx-auto px-4 pb-16">
        <EmptyState
          icon="🧭"
          title="Guide not found"
          description="This guide may have been removed or the link is incorrect."
          cta="Browse guides"
          href="/guides"
        />
      </div>
    );
  }

  return (
    <div className="pt-[88px] max-w-[1100px] mx-auto px-4 sm:px-6 pb-16 grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="flex items-center gap-4 mb-5">
          <div className="relative h-24 w-24 rounded-2xl overflow-hidden bg-off-white shrink-0">
            {(guide.photos?.[0] || guide.user?.avatar) && (
              <Image src={guide.photos?.[0] || guide.user?.avatar || ""} alt={guide.user?.name || ""} fill sizes="96px" className="object-cover" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black text-text-dark flex items-center gap-2">
              {guide.user?.name}
              {guide.isVerified && <BadgeCheck className="h-5 w-5 text-green-dark" />}
            </h1>
            <p className="flex items-center gap-1 text-text-grey text-sm mt-1">
              <MapPin className="h-4 w-4" /> {guide.city}{guide.country ? `, ${guide.country}` : ""}
            </p>
            <div className="flex items-center gap-3 mt-1 text-sm text-text-grey">
              {guide.rating ? (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {guide.rating} ({guide.totalReviews})
                </span>
              ) : null}
              <span>{guide.totalBookings || 0} trips guided</span>
            </div>
          </div>
        </div>

        {guide.description && <p className="text-text-grey leading-relaxed mb-5">{guide.description}</p>}

        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div>
            <h3 className="font-bold text-text-dark mb-2">Expertise</h3>
            <div className="flex flex-wrap gap-1.5">
              {(guide.expertise || []).map((e) => (
                <span key={e} className="text-sm bg-off-white px-3 py-1 rounded-full text-text-grey">{e}</span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-text-dark mb-2">Languages</h3>
            <p className="flex items-center gap-2 text-sm text-text-grey">
              <Globe className="h-4 w-4" /> {(guide.languages || []).join(", ")}
            </p>
          </div>
        </div>

        {guide.user?._id && user && guide.user._id !== user._id && (
          <Link
            href={`/chat?peer=${guide.user._id}`}
            className="inline-flex items-center gap-2 text-green-dark font-semibold hover:underline"
          >
            <MessageCircle className="h-4 w-4" /> Message {guide.user?.name?.split(" ")[0]}
          </Link>
        )}
      </div>

      {/* Booking sidebar */}
      <aside className="lg:sticky lg:top-24 h-fit border border-[#EBEBEB] rounded-2xl p-5 shadow-sm bg-white">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode("day")}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold border ${mode === "day" ? "border-green-dark bg-green-dark/5 text-green-dark" : "border-[#E0E0E0] text-text-grey"}`}
          >
            Per day · {formatPrice(guide.dailyRate || 0)}
          </button>
          <button
            onClick={() => setMode("hour")}
            disabled={!guide.hourlyRate}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold border disabled:opacity-40 ${mode === "hour" ? "border-green-dark bg-green-dark/5 text-green-dark" : "border-[#E0E0E0] text-text-grey"}`}
          >
            Per hour · {formatPrice(guide.hourlyRate || 0)}
          </button>
        </div>

        <label className="text-sm font-semibold text-text-dark mb-1.5 block">Date</label>
        <input
          type="date"
          value={date}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-[#E0E0E0] rounded-xl px-4 py-2.5 mb-4 focus:border-green-dark outline-none"
        />

        <label className="text-sm font-semibold text-text-dark mb-1.5 block">
          {mode === "day" ? "Days" : "Hours"}
        </label>
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-9 w-9 rounded-full border border-[#E0E0E0]">−</button>
          <span className="font-semibold w-6 text-center">{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} className="h-9 w-9 rounded-full border border-[#E0E0E0]">+</button>
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          placeholder="Message to the guide (optional)"
          className="w-full border border-[#E0E0E0] rounded-xl px-4 py-2.5 mb-4 resize-none focus:border-green-dark outline-none"
        />

        <div className="flex items-center justify-between mb-4">
          <span className="text-text-grey text-sm">Total</span>
          <span className="text-lg font-bold text-text-dark">{formatPrice(total)}</span>
        </div>

        <button
          onClick={book}
          disabled={booking}
          className="w-full bg-green-neon text-white font-bold py-3 rounded-full hover:bg-green-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {booking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Request booking
        </button>
      </aside>
    </div>
  );
}
