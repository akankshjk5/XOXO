"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2, CalendarDays, Tag, CheckCircle2 } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import toast from "react-hot-toast";
import { bookingsAPI, paymentsAPI, couponsAPI } from "@/lib/api";
import { loadRazorpay } from "@/lib/razorpay";
import { getBookingConfirmationPath } from "@/lib/auth-routing";
import { useAuthStore } from "@/store/authStore";
import { isValidPhoneNumber, getPhoneValidationError } from "@/lib/phone";
import { usePaymentMode } from "@/hooks/usePaymentMode";
import { PaymentModeNotice } from "@/components/payments/PaymentModeNotice";
import { formatPrice } from "@/lib/utils";
import { BOOKING_ADDONS, calcAddOnTotal } from "@/lib/booking-addons";
import { BookingAddOnsNotice } from "@/components/packages/BookingAddOnsNotice";
import { cn } from "@/lib/utils";

interface BookingModalProps {
  pkg: { _id: string; title: string; pricePerPerson: number };
  travelers: number;
  onClose: () => void;
}

interface AppliedCoupon {
  code: string;
  discount: number;
}

export function BookingModal({ pkg, travelers: initialTravelers, onClose }: BookingModalProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { mode: paymentMode, loading: paymentModeLoading, isDemo } = usePaymentMode();
  const reduced = useReducedMotion();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [travelers, setTravelers] = useState(initialTravelers);
  const [travelDate, setTravelDate] = useState("");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [lead, setLead] = useState({ name: "", email: "", phone: "" });
  const [specialRequests, setSpecialRequests] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const phoneError = phoneTouched ? getPhoneValidationError(lead.phone) : null;

  useEffect(() => {
    if (user) {
      setLead((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || user.phoneNumber || "",
      }));
    }
  }, [user]);

  const packageSubtotal = pkg.pricePerPerson * travelers;
  const addOnTotal = calcAddOnTotal(selectedAddOns, travelers);
  const subtotal = packageSubtotal + addOnTotal;
  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setAppliedCoupon(null);
    setCouponInput("");
  };

  const applyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) {
      toast.error("Enter a coupon code");
      return;
    }
    setCouponLoading(true);
    try {
      const { data } = await couponsAPI.validate({ code, subtotal });
      setAppliedCoupon({ code: data.data.code, discount: data.data.discount });
      toast.success(`Coupon applied — you save ${formatPrice(data.data.discount)}`);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Invalid coupon");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    toast.success("Coupon removed");
  };

  const next = () => {
    if (step === 1 && !travelDate) {
      toast.error("Please pick a travel date.");
      return;
    }
    if (step === 2) {
      setPhoneTouched(true);
      if (!lead.name.trim()) {
        toast.error("Please enter your full name.");
        return;
      }
      if (!lead.email.trim()) {
        toast.error("Please enter your email address.");
        return;
      }
      const phoneErr = getPhoneValidationError(lead.phone);
      if (phoneErr) {
        toast.error(phoneErr);
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const confirmAndPay = async () => {
    const phoneErr = getPhoneValidationError(lead.phone);
    if (phoneErr) {
      setPhoneTouched(true);
      toast.error(phoneErr);
      return;
    }
    setSubmitting(true);
    try {
      const { data: bookingRes } = await bookingsAPI.create({
        packageId: pkg._id,
        travelDate,
        numTravelers: travelers,
        travelers: [{ name: lead.name }],
        addOns: selectedAddOns,
        specialRequests,
        couponCode: appliedCoupon?.code,
        contactEmail: lead.email,
        contactPhone: lead.phone,
      });
      const booking = bookingRes.data;

      const { data: orderRes } = await paymentsAPI.createOrder(booking._id);
      const order = orderRes.data;

      if (orderRes.demo) {
        await paymentsAPI.verify({ bookingId: booking._id });
        toast.success("Booking request received! (demo payment) 🎉");
        onClose();
        router.replace(getBookingConfirmationPath(booking._id, booking.bookingRef));
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
        description: pkg.title,
        order_id: order.orderId,
        prefill: { name: lead.name, email: lead.email, contact: lead.phone },
        theme: { color: "#0B6E4F" },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            toast("Payment cancelled. Your booking request is saved — complete payment from your dashboard or try again.", {
              icon: "ℹ️",
            });
          },
        },
        handler: async (resp: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await paymentsAPI.verify({ bookingId: booking._id, ...resp });
            toast.success("Payment successful! Booking confirmed 🎉");
            onClose();
            router.replace(getBookingConfirmationPath(booking._id, booking.bookingRef));
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
        "Couldn't complete your booking. Please check your connection and try again.";
      toast.error(msg);
      setSubmitting(false);
    }
  };

  const addOnLines = useMemo(
    () =>
      selectedAddOns.map((id) => {
        const a = BOOKING_ADDONS.find((x) => x.id === id);
        if (!a) return null;
        const lineTotal = a.price * (a.perTraveler ? travelers : 1);
        return { label: a.label, amount: lineTotal };
      }).filter(Boolean) as { label: string; amount: number }[],
    [selectedAddOns, travelers]
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? undefined : { opacity: 0, y: 24 }}
        transition={{ duration: reduced ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[92dvh] flex flex-col shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EBEBEB] shrink-0">
          <div>
            <p className="text-xs text-text-grey">Step {step} of 3</p>
            <h3 className="font-bold text-text-dark line-clamp-1">{pkg.title}</h3>
          </div>
          <button type="button" onClick={onClose} disabled={submitting} className="p-2 rounded-lg hover:bg-off-white min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-1 px-5 pt-4 shrink-0">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-green-neon" : "bg-[#EBEBEB]"}`} />
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={reduced ? false : { opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? undefined : { opacity: 0, x: -16 }}
              transition={{ duration: reduced ? 0 : 0.2 }}
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
                      className="w-full border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:border-green-dark outline-none min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-text-dark mb-2 block">Travellers</label>
                    <div className="flex items-center gap-4">
                      <button type="button" onClick={() => setTravelers((t) => Math.max(1, t - 1))} className="h-10 w-10 rounded-full border border-[#E0E0E0] hover:border-green-dark min-h-[44px] min-w-[44px]">−</button>
                      <span className="font-semibold w-6 text-center">{travelers}</span>
                      <button type="button" onClick={() => setTravelers((t) => Math.min(12, t + 1))} className="h-10 w-10 rounded-full border border-[#E0E0E0] hover:border-green-dark min-h-[44px] min-w-[44px]">+</button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-text-dark mb-2 block">Optional add-ons</label>
                    <div className="space-y-2">
                      {BOOKING_ADDONS.map((a) => {
                        const Icon = a.icon;
                        const selected = selectedAddOns.includes(a.id);
                        const linePrice = a.price * (a.perTraveler ? travelers : 1);
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => toggleAddOn(a.id)}
                            className={cn(
                              "w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-colors min-h-[44px]",
                              selected ? "border-green-dark bg-green-dark/5 ring-1 ring-green-dark/20" : "border-[#E0E0E0] hover:border-green-dark/40"
                            )}
                          >
                            <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border", selected ? "bg-green-neon border-green-neon text-white" : "border-[#CCC]")}>
                              {selected && <Check className="h-3.5 w-3.5" />}
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="flex items-center gap-2 text-sm font-semibold text-text-dark">
                                <Icon className="h-4 w-4 text-green-dark shrink-0" /> {a.label}
                              </span>
                              <span className="text-xs text-text-grey block mt-0.5">{a.description}</span>
                            </span>
                            <span className="text-sm font-bold text-green-dark shrink-0">+{formatPrice(linePrice)}</span>
                          </button>
                        );
                      })}
                    </div>
                    <BookingAddOnsNotice />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-text-dark mb-1.5 block">Full name</label>
                    <input value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} className="w-full border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:border-green-dark outline-none min-h-[44px]" placeholder="Lead traveller name" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-text-dark mb-1.5 block">Email</label>
                    <input type="email" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} className="w-full border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:border-green-dark outline-none min-h-[44px]" placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-text-dark mb-1.5 block">
                      Phone number <span className="text-red-500" aria-hidden>*</span>
                      <span className="sr-only">(required)</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={lead.phone}
                      onChange={(e) => setLead({ ...lead, phone: e.target.value })}
                      onBlur={() => setPhoneTouched(true)}
                      aria-invalid={!!phoneError}
                      aria-describedby={phoneError ? "booking-phone-error" : undefined}
                      className={cn(
                        "w-full border rounded-xl px-4 py-2.5 focus:outline-none min-h-[44px]",
                        phoneError
                          ? "border-red-300 focus:border-red-400"
                          : "border-[#E0E0E0] focus:border-green-dark"
                      )}
                      placeholder="+91 98765 43210"
                    />
                    {phoneError && (
                      <p id="booking-phone-error" className="mt-1.5 text-xs text-red-600" role="alert">
                        {phoneError}
                      </p>
                    )}
                    <p className="mt-1.5 text-[11px] text-text-grey">
                      Required — our travel consultant will call you to confirm your itinerary and add-ons.
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-text-dark mb-1.5 block">Special requests (optional)</label>
                    <textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} rows={3} className="w-full border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:border-green-dark outline-none resize-none" placeholder="Dietary needs, anniversary, accessibility…" />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-text-dark flex items-center gap-2 mb-2">
                      <Tag className="h-4 w-4" /> Coupon code
                    </label>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between rounded-xl border border-green-dark/30 bg-green-dark/5 px-4 py-3">
                        <div>
                          <p className="text-sm font-bold text-green-dark flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" /> {appliedCoupon.code}
                          </p>
                          <p className="text-xs text-text-grey">Saving {formatPrice(appliedCoupon.discount)}</p>
                        </div>
                        <button type="button" onClick={removeCoupon} className="text-xs font-semibold text-red-600 px-3 py-1.5 rounded-full border border-red-200 min-h-[36px]">Remove</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="Enter code"
                          className="flex-1 border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:border-green-dark outline-none min-h-[44px] uppercase"
                        />
                        <button
                          type="button"
                          onClick={applyCoupon}
                          disabled={couponLoading}
                          className="px-4 rounded-xl bg-green-dark text-white font-semibold text-sm min-h-[44px] disabled:opacity-50 inline-flex items-center gap-1"
                        >
                          {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                        </button>
                      </div>
                    )}
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
                    <Row label="Mobile" value={lead.phone} />
                    {addOnLines.map((line) => (
                      <Row key={line.label} label={line.label} value={formatPrice(line.amount)} />
                    ))}
                    {appliedCoupon && <Row label={`Coupon (${appliedCoupon.code})`} value={`−${formatPrice(appliedCoupon.discount)}`} />}
                    <div className="border-t border-[#E0E0E0] pt-2 mt-2 flex justify-between font-bold text-text-dark">
                      <span>Total payable</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                  <PaymentModeNotice mode={paymentMode} loading={paymentModeLoading} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="px-5 py-4 border-t border-[#EBEBEB] bg-white flex items-center gap-3 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {step > 1 && (
            <button type="button" onClick={() => setStep((s) => s - 1)} disabled={submitting} className="px-5 py-2.5 rounded-full border border-[#E0E0E0] font-medium hover:border-green-dark min-h-[44px] disabled:opacity-50">
              Back
            </button>
          )}
          <div className="ml-auto flex items-center gap-3">
            <span className="font-bold text-text-dark">{formatPrice(total)}</span>
            {step < 3 ? (
              <button
                type="button"
                onClick={next}
                disabled={step === 2 && (!lead.name.trim() || !lead.email.trim() || !isValidPhoneNumber(lead.phone))}
                className="px-6 py-2.5 rounded-full bg-green-neon text-white font-bold hover:bg-green-dark transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={confirmAndPay}
                disabled={submitting}
                className="px-6 py-2.5 rounded-full bg-green-neon text-white font-bold hover:bg-green-dark transition-colors flex items-center gap-2 disabled:opacity-60 min-h-[44px]"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {isDemo ? "Confirm demo booking" : "Pay & Confirm"}
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
