"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, CalendarDays, Users, Hash } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { bookingsAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";
import { getBookingsHubPath } from "@/lib/auth-routing";

interface BookingDetail {
  _id: string;
  bookingRef: string;
  status: string;
  paymentStatus: string;
  travelDate?: string;
  numTravelers: number;
  totalAmount: number;
  paidAmount?: number;
  package?: { title?: string };
}

function BookingConfirmationContent() {
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const bookingId = searchParams?.get("id") || "";
  const bookingRef = searchParams?.get("ref") || "";
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="pt-[88px] max-w-lg mx-auto px-4 sm:px-6 pb-16">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-9 w-9 text-green-dark" />
        </div>
        <h1 className="text-2xl font-black text-text-dark">Booking confirmed!</h1>
        <p className="text-text-grey mt-2 text-sm">
          A confirmation email has been sent to your inbox.
        </p>
      </div>

      <div className="rounded-2xl border border-[#EBEBEB] bg-white p-6 space-y-4 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-2 text-text-grey py-8">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading booking…
          </div>
        ) : error ? (
          <p className="text-center text-red-600 text-sm py-4">{error}</p>
        ) : booking ? (
          <>
            <div className="flex items-start gap-3">
              <Hash className="h-4 w-4 text-green-dark mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-text-grey">Booking reference</p>
                <p className="font-bold text-text-dark">{booking.bookingRef || bookingRef}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-text-grey">Package</p>
              <p className="font-semibold text-text-dark">{booking.package?.title || "Holiday package"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <CalendarDays className="h-4 w-4 text-text-grey mt-0.5" />
                <div>
                  <p className="text-xs text-text-grey">Travel date</p>
                  <p className="font-medium">
                    {booking.travelDate
                      ? new Date(booking.travelDate).toLocaleDateString("en-IN")
                      : "TBC"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 text-text-grey mt-0.5" />
                <div>
                  <p className="text-xs text-text-grey">Travellers</p>
                  <p className="font-medium">{booking.numTravelers}</p>
                </div>
              </div>
            </div>
            <div className="border-t border-[#EBEBEB] pt-4 flex justify-between items-center">
              <span className="text-text-grey text-sm">Amount paid</span>
              <span className="text-xl font-bold text-green-dark">
                {formatPrice(booking.paidAmount || booking.totalAmount)}
              </span>
            </div>
            <span
              className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
                booking.status === "confirmed"
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {booking.status}
            </span>
          </>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Link
          href={hubPath}
          className="flex-1 text-center rounded-full bg-green-neon text-white font-bold py-3 hover:bg-green-dark transition-colors"
        >
          View my bookings
        </Link>
        <Link
          href="/packages"
          className="flex-1 text-center rounded-full border border-[#E0E0E0] font-medium py-3 hover:border-green-dark transition-colors"
        >
          Browse more packages
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
