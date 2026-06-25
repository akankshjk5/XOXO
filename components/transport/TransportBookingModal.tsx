"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { bookingsAPI, paymentsAPI } from "@/lib/api";
import { loadRazorpay } from "@/lib/razorpay";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";
import type { TransportOffer } from "@/lib/transport-types";
import { MODE_ICONS } from "@/lib/transport-types";

interface TransportBookingModalProps {
  offer: TransportOffer;
  passengers: number;
  onClose: () => void;
}

export function TransportBookingModal({ offer, passengers, onClose }: TransportBookingModalProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [submitting, setSubmitting] = useState(false);
  const [lead, setLead] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
  });

  const confirmAndPay = async () => {
    if (!lead.name || !lead.email) {
      toast.error("Name and email are required.");
      return;
    }
    setSubmitting(true);
    try {
      const { data: bookingRes } = await bookingsAPI.createTransport({
        offer,
        travelDate: offer.departureAt,
        numTravelers: passengers,
        travelers: [{ name: lead.name }],
      });
      const booking = bookingRes.data;

      const { data: orderRes } = await paymentsAPI.createOrder(booking._id);
      const order = orderRes.data;

      if (orderRes.demo) {
        await paymentsAPI.verify({ bookingId: booking._id });
        toast.success("Transport booking confirmed! (demo payment)");
        onClose();
        router.push("/dashboard");
        return;
      }

      const ok = await loadRazorpay();
      if (!ok) {
        toast.error("Couldn't load payment gateway.");
        setSubmitting(false);
        return;
      }

      const rzp = new window.Razorpay!({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "XOXO Travels",
        description: `${MODE_ICONS[offer.mode] || ""} ${offer.providerLabel}`,
        order_id: order.orderId,
        prefill: { name: lead.name, email: lead.email, contact: lead.phone },
        theme: { color: "#0B6E4F" },
        handler: async (resp: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await paymentsAPI.verify({ bookingId: booking._id, ...resp });
            toast.success("Payment successful! Booking confirmed.");
            onClose();
            router.push("/dashboard");
          } catch {
            toast.error("Payment verification failed.");
          }
        },
      });
      rzp.open();
      setSubmitting(false);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Booking failed. Please try again.";
      toast.error(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-elevated overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-black text-text-dark">Confirm booking</h3>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="rounded-xl bg-off-white p-4">
            <p className="font-bold">{offer.providerLabel}</p>
            <p className="text-sm text-text-grey">{offer.summary}</p>
            <p className="text-lg font-black text-green-dark mt-2">{formatPrice(offer.price)}</p>
          </div>
          <input
            className="w-full rounded-xl border px-3 py-2.5 text-sm"
            placeholder="Full name"
            value={lead.name}
            onChange={(e) => setLead((l) => ({ ...l, name: e.target.value }))}
          />
          <input
            className="w-full rounded-xl border px-3 py-2.5 text-sm"
            placeholder="Email"
            type="email"
            value={lead.email}
            onChange={(e) => setLead((l) => ({ ...l, email: e.target.value }))}
          />
          <input
            className="w-full rounded-xl border px-3 py-2.5 text-sm"
            placeholder="Phone"
            value={lead.phone}
            onChange={(e) => setLead((l) => ({ ...l, phone: e.target.value }))}
          />
          <button
            type="button"
            onClick={confirmAndPay}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-green-dark text-white font-semibold disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Pay & confirm
          </button>
        </div>
      </div>
    </div>
  );
}
