import { ShieldCheck } from "lucide-react";
import { PAYMENT_GATEWAY_PENDING_MESSAGE } from "@/lib/payment-config";
import type { PaymentMode } from "@/lib/payment-config";

interface PaymentModeNoticeProps {
  mode: PaymentMode | null;
  loading?: boolean;
}

/**
 * Checkout payment notice — demo vs live Razorpay.
 * Live Razorpay checkout is only opened when the API reports test/live mode.
 * Configure keys on Railway: see PAYMENT_SETUP.md
 */
export function PaymentModeNotice({ mode, loading }: PaymentModeNoticeProps) {
  if (loading) return null;

  if (!mode || mode === "demo") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p>{PAYMENT_GATEWAY_PENDING_MESSAGE}</p>
        <p className="mt-1.5 text-xs text-amber-800">
          Demo booking mode is active — you can complete a test booking without real payment.
        </p>
      </div>
    );
  }

  return (
    <p className="text-xs text-text-grey flex items-center gap-1.5">
      <ShieldCheck className="h-3.5 w-3.5 text-green-dark shrink-0" />
      Secure payment via Razorpay ({mode === "live" ? "live" : "test"} mode)
    </p>
  );
}
