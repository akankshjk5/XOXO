"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2, ShieldCheck, FileText, CalendarDays } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import toast from "react-hot-toast";
import { bookingsAPI, paymentsAPI } from "@/lib/api";
import { loadRazorpay } from "@/lib/razorpay";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";

interface BookingModalProps {
  pkg: { _id: string; title: string; pricePerPerson: number };
  travelers: number;
  onClose: () => void;
}

const ADDONS_COMING_SOON = [
  { id: "insurance", label: "Travel Insurance", icon: ShieldCheck },
  { id: "visa", label: "Visa Assistance", icon: FileText },
];

export function BookingModal({ pkg, travelers: initialTravelers, onClose }: BookingModalProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const reduced = useReducedMotion();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [travelers, setTravelers] = useState(initialTravelers);
  const [travelDate, setTravelDate] = useState("");
  const [lead, setLead] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
  });
  const [specialRequests, setSpecialRequests] = useState("");

  const total = pkg.pricePerPerson * travelers;

  const next = () => {
    if (step === 1 && !travelDate) {
      toast.error("Please pick a travel date.");
      return;
    }
    if (step === 2 && (!lead.name || !lead.email || lead.phone.length < 10)) {
      toast.error("Please fill in valid contact details.");
      return;
    }
    setStep((s) => s + 1);
  };

  const confirmAndPay = async () => {
    setSubmitting(true);
    try {
      // 1. Create booking
      const { data: bookingRes } = await bookingsAPI.create({
        packageId: pkg._id,
        travelDate,
        numTravelers: travelers,
        travelers: [{ name: lead.name }],
        addOns: [],
        specialRequests,
      });
      const booking = bookingRes.data;

      // 2. Create payment order
      const { data: orderRes } = await paymentsAPI.createOrder(booking._id);
      const order = orderRes.data;

      // 3a. Demo mode — no Razorpay keys configured on the server
      if (orderRes.demo) {
        await paymentsAPI.verify({ bookingId: booking._id });
        toast.success("Booking confirmed! (demo payment) 🎉");
        onClose();
        router.push("/dashboard");
        return;
      }

      // 3b. Real Razorpay checkout
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
        description: pkg.title,
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
            toast.success("Payment successful! Booking confirmed 🎉");
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
        "Something went wrong. Please try again.";
      toast.error(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? undefined : { opacity: 0, y: 24 }}
        transition={{ duration: reduced ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EBEBEB] sticky top-0 bg-white z-10">
          <div>
            <p className="text-xs text-text-grey">Step {step} of 3</p>
            <h3 className="font-bold text-text-dark line-clamp-1">{pkg.title}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-off-white" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-1 px-5 pt-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-green-neon" : "bg-[#EBEBEB]"}`}
            />
          ))}
        </div>

        <div className="p-5 space-y-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={reduced ? false : { opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? undefined : { opacity: 0, x: -16 }}
              transition={{ duration: reduced ? 0 : 0.3 }}
            >
          {step === 1 && (
            <>
              <div>
                <label className="text-sm font-semibold text-text-dark flex items-center gap-2 mb-2">
                  <CalendarDays className="h-4 w-4" /> Travel date
                </label>
                <input
                  type="date"
                  value={travelDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:border-green-dark outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-text-dark mb-2 block">Travellers</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setTravelers((t) => Math.max(1, t - 1))}
                    className="h-9 w-9 rounded-full border border-[#E0E0E0] hover:border-green-dark"
                  >
                    −
                  </button>
                  <span className="font-semibold w-6 text-center">{travelers}</span>
                  <button
                    onClick={() => setTravelers((t) => Math.min(12, t + 1))}
                    className="h-9 w-9 rounded-full border border-[#E0E0E0] hover:border-green-dark"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-text-dark mb-2 block">Add-ons</label>
                <div className="space-y-2">
                  {ADDONS_COMING_SOON.map((a) => {
                    const Icon = a.icon;
                    return (
                      <div
                        key={a.id}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-[#E0E0E0] bg-off-white opacity-70"
                        aria-disabled="true"
                      >
                        <span className="flex items-center gap-2 text-sm font-medium text-text-grey">
                          <Icon className="h-4 w-4" /> {a.label}
                        </span>
                        <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                          Coming soon
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-text-grey mt-2">
                  Insurance and visa add-ons are not available yet — you won&apos;t be charged for them.
                </p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="text-sm font-semibold text-text-dark mb-1.5 block">Full name</label>
                <input
                  value={lead.name}
                  onChange={(e) => setLead({ ...lead, name: e.target.value })}
                  className="w-full border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:border-green-dark outline-none"
                  placeholder="Lead traveller name"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-text-dark mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={lead.email}
                  onChange={(e) => setLead({ ...lead, email: e.target.value })}
                  className="w-full border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:border-green-dark outline-none"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-text-dark mb-1.5 block">Phone</label>
                <input
                  type="tel"
                  value={lead.phone}
                  onChange={(e) => setLead({ ...lead, phone: e.target.value })}
                  className="w-full border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:border-green-dark outline-none"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-text-dark mb-1.5 block">
                  Special requests (optional)
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={3}
                  className="w-full border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:border-green-dark outline-none resize-none"
                  placeholder="Dietary needs, anniversary, accessibility…"
                />
              </div>
            </>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <h4 className="font-bold text-text-dark">Review your trip</h4>
              <div className="rounded-xl bg-off-white p-4 space-y-2 text-sm">
                <Row label="Package" value={pkg.title} />
                <Row label="Travel date" value={travelDate} />
                <Row label="Travellers" value={String(travelers)} />
                <Row label="Lead contact" value={lead.name} />
                <div className="border-t border-[#E0E0E0] pt-2 mt-2 flex justify-between font-bold text-text-dark">
                  <span>Total payable</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              <p className="text-xs text-text-grey flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-green-dark" /> Secure payment via Razorpay
              </p>
            </div>
          )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#EBEBEB] sticky bottom-0 bg-white flex items-center gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-5 py-2.5 rounded-full border border-[#E0E0E0] font-medium hover:border-green-dark"
            >
              Back
            </button>
          )}
          <div className="ml-auto flex items-center gap-3">
            <span className="font-bold text-text-dark">{formatPrice(total)}</span>
            {step < 3 ? (
              <button
                onClick={next}
                className="px-6 py-2.5 rounded-full bg-green-neon text-white font-bold hover:bg-green-dark transition-colors"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={confirmAndPay}
                disabled={submitting}
                className="px-6 py-2.5 rounded-full bg-green-neon text-white font-bold hover:bg-green-dark transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Pay & Confirm
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-text-grey">{label}</span>
      <span className="font-medium text-text-dark text-right">{value}</span>
    </div>
  );
}
