"use client";

import { useEffect, useState } from "react";
import { paymentsAPI } from "@/lib/api";
import type { PaymentMode } from "@/lib/payment-config";

/**
 * Reads payment mode from GET /api/payments/status.
 * Demo mode is used when RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set on the API (Railway).
 */
export function usePaymentMode() {
  const [mode, setMode] = useState<PaymentMode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentsAPI
      .getStatus()
      .then(({ data }) => setMode(data.data.mode))
      .catch(() => setMode("demo"))
      .finally(() => setLoading(false));
  }, []);

  const isDemo = loading || mode === "demo" || mode === null;

  return { mode, loading, isDemo };
}
