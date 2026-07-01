"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  CalendarDays,
  Users,
  Hash,
  Share2,
  CalendarPlus,
  FileText,
  Compass,
  ClipboardList,
  Phone,
  MessageCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { bookingsAPI, paymentsAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";
import { getBookingsHubPath } from "@/lib/auth-routing";
import { buildBookingIcs, downloadIcs } from "@/lib/calendar";
import { EASE_OUT } from "@/lib/motion";
import { LoadingSkeleton } from "@/components/motion/LoadingSkeleton";
import { ContextualError } from "@/components/ui/ContextualError";
import { SUPPORT_PHONE, supportPhoneHref } from "@/lib/site";
import { formatBookingStatus, whatsAppHref } from "@/lib/booking-status";

interface BookingDetail {
  _id: string;
  bookingRef: string;
  status: string;
  paymentStatus: string;
  travelDate?: string;
  numTravelers: number;
  totalAmount: number;
  paidAmount?: number;
  package?: { title?: string; duration?: number };
}

function BookingConfirmationContent() {
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const bookingId = searchParams?.get("id") || "";
  const bookingRef = searchParams?.get("ref") || "";
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setError("Missing booking reference.");
      setLoading(false);
      return;
    }
    bookingsAPI
      .getById(bookingId)
      .then(({ data }) => setBooking(data.data))
      .catch(() => setError("Could not load booking details."))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const hubPath = user ? getBookingsHubPath(user) : "/dashboard?tab=bookings";
  const ref = booking?.bookingRef || bookingRef;
  const title = booking?.package?.title || "Holiday package";

  const shareBooking = async () => {
    const text = `My XOXO Travels booking ${ref} — ${title}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "XOXO Travels Booking", text, url: window.location.href });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      toast.success("Booking details copied!");
    }
  };

  const addToCalendar = () => {
    if (!booking?.travelDate) {
      toast.error("Travel date not set yet.");
      return;
    }
    const ics = buildBookingIcs({
      title,
      bookingRef: ref,
      travelDate: booking.travelDate,
      durationHours: (booking.package?.duration || 1) * 24,
    });
    downloadIcs(ics, `xoxo-${ref}.ics`);
    toast.success("Calendar file downloaded");
  };

  const downloadInvoice = async () => {
    if (!bookingId) return;
    setInvoiceLoading(true);
    try {
      const { data } = await paymentsAPI.getInvoice(bookingId);
      const url = data.data?.url;
      if (!url) {
        toast.error("Invoice not available yet.");
        return;
      }
      const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || "";
      window.open(`${base}${url}`, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Could not download invoice.");
    } finally {
      setInvoiceLoading(false);
    }
  };

  return (
    <div className="pt-[88px] max-w-xl mx-auto px-4 sm:px-6 pb-[calc(4rem+env(safe-area-inset-bottom))]">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: EASE_OUT }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
          className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-50 shadow-premium"
        >
          <CheckCircle2 className="h-11 w-11 text-green-dark" aria-hidden />
        </motion.div>
        <h1 className="text-2xl sm:text-3xl font-black text-text-dark tracking-tight">
          Booking Request Submitted
        </h1>
        <p className="text-text-grey mt-2 text-sm max-w-md mx-auto">
          Your dedicated travel consultant will contact you within 24 hours.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.12, ease: EASE_OUT }}
        className="mb-6 rounded-2xl border border-green-dark/15 bg-gradient-to-br from-green-dark/[0.05] via-white/90 to-white/80 backdrop-blur-sm p-5 shadow-premium"
      >
        <p className="text-sm font-bold text-text-dark mb-3">
          Your consultant will help you:
        </p>
        <ul className="text-xs sm:text-sm text-text-grey space-y-2 list-none">
          {(booking?.paymentStatus === "paid"
            ? [
                "Receive final itinerary from your consultant",
                "Complete visa documentation if required",
                "Pack and prepare for departure",
              ]
            : [
                "Confirm hotel availability",
                "Confirm flights",
                "Discuss visa requirements",
                "Finalize itinerary",
                "Complete payment",
              ]
          ).map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-green-dark font-bold shrink-0" aria-hidden>✓</span>
              {item}
            </li>
          ))}
        </ul>
      </motion.div>

      {!loading && !error && ref && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.3 }}
          className="mb-6 rounded-2xl border border-[#EBEBEB] bg-white px-5 py-4 shadow-premium text-center"
        >
          <p className="text-xs text-text-grey uppercase tracking-wide">Booking ID</p>
          <p className="font-black text-xl text-text-dark tabular-nums mt-1">{ref}</p>
          {SUPPORT_PHONE && (
            <p className="text-sm text-text-grey mt-3">
              Support:{" "}
              <a href={supportPhoneHref()} className="font-bold text-green-dark hover:underline">
                {SUPPORT_PHONE}
              </a>
            </p>
          )}
          <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
            <a
              href={supportPhoneHref()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-green-neon text-white font-bold px-5 py-3 hover:bg-green-dark transition-colors min-h-[44px]"
            >
              <Phone className="h-4 w-4" aria-hidden />
              Call Now
            </a>
            {whatsAppHref(SUPPORT_PHONE) && (
              <a
                href={whatsAppHref(SUPPORT_PHONE)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-green-dark text-green-dark font-bold px-5 py-3 hover:bg-green-dark/5 transition-colors min-h-[44px]"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                WhatsApp
              </a>
            )}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: EASE_OUT }}
        className="rounded-2xl border border-[#EBEBEB] bg-white p-6 space-y-4 shadow-premium"
      >
        {loading ? (
          <div className="space-y-4 py-4" aria-busy="true" aria-label="Loading booking details">
            <LoadingSkeleton className="h-14 w-full rounded-xl" />
            <LoadingSkeleton className="h-8 w-3/4 rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
              <LoadingSkeleton className="h-20 rounded-xl" />
              <LoadingSkeleton className="h-20 rounded-xl" />
            </div>
            <LoadingSkeleton className="h-10 w-full rounded-xl" />
          </div>
        ) : error ? (
          <ContextualError
            title="Couldn't load booking"
            message={error === "Missing booking reference." ? "This confirmation link is incomplete. Open it from your bookings or email." : "Please check your connection and try again."}
            retryLabel={bookingId ? "Try again" : undefined}
            onRetry={bookingId ? () => {
              setLoading(true);
              setError(null);
              bookingsAPI.getById(bookingId).then(({ data }) => setBooking(data.data)).catch(() => setError("Could not load booking details.")).finally(() => setLoading(false));
            } : undefined}
          />
        ) : booking ? (
          <>
            <div className="flex items-start gap-3 pb-2 border-b border-[#F0F0F0]">
              <Hash className="h-4 w-4 text-green-dark mt-0.5 shrink-0" aria-hidden />
              <div>
                <p className="text-xs text-text-grey uppercase tracking-wide">Booking reference</p>
                <p className="font-black text-lg text-text-dark tabular-nums">{ref}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-text-grey">Package</p>
              <p className="font-bold text-text-dark text-lg">{title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2 rounded-xl bg-off-white p-3">
                <CalendarDays className="h-4 w-4 text-green-dark mt-0.5 shrink-0" aria-hidden />
                <div>
                  <p className="text-xs text-text-grey">Travel date</p>
                  <p className="font-semibold">
                    {booking.travelDate
                      ? new Date(booking.travelDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "TBC"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-xl bg-off-white p-3">
                <Users className="h-4 w-4 text-green-dark mt-0.5 shrink-0" aria-hidden />
                <div>
                  <p className="text-xs text-text-grey">Travellers</p>
                  <p className="font-semibold">{booking.numTravelers}</p>
                </div>
              </div>
            </div>
            <div className="border-t border-[#EBEBEB] pt-4 flex justify-between items-center">
              <span className="text-text-grey text-sm">
                {booking.paymentStatus === "paid" ? "Amount paid" : "Estimated amount"}
              </span>
              <span className="text-2xl font-black text-green-dark tabular-nums">
                {formatPrice(booking.paidAmount || booking.totalAmount)}
              </span>
            </div>
            <span className="inline-flex items-center text-xs px-3 py-1 rounded-full font-semibold bg-amber-100 text-amber-800">
              {formatBookingStatus(booking.status)}
            </span>
          </>
        ) : null}
      </motion.div>

      {booking && !loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35 }}
          className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2"
        >
          {[
            { icon: Share2, label: "Share", onClick: shareBooking },
            { icon: CalendarPlus, label: "Calendar", onClick: addToCalendar },
            ...(booking.paymentStatus === "paid"
              ? [{ icon: FileText, label: "Invoice", onClick: downloadInvoice, loading: invoiceLoading }]
              : []),
          ].map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              disabled={action.loading}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-[#EBEBEB] bg-white py-3 px-2 text-xs font-semibold text-text-dark hover:border-green-dark hover:shadow-sm transition-all min-h-[72px] disabled:opacity-60"
            >
              {action.loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-green-dark" />
              ) : (
                <action.icon className="h-4 w-4 text-green-dark" aria-hidden />
              )}
              {action.label}
            </button>
          ))}
        </motion.div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Link
          href={hubPath}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-green-neon text-white font-bold py-3.5 hover:bg-green-dark transition-colors min-h-[48px]"
        >
          <ClipboardList className="h-4 w-4" aria-hidden />
          View booking
        </Link>
        <Link
          href="/packages"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-[#E0E0E0] font-semibold py-3.5 hover:border-green-dark transition-colors min-h-[48px]"
        >
          <Compass className="h-4 w-4" aria-hidden />
          Continue exploring
        </Link>
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <RequireAuth>
      <Suspense fallback={<div className="pt-32 text-center text-text-grey">Loading…</div>}>
        <BookingConfirmationContent />
      </Suspense>
    </RequireAuth>
  );
}
