"use client";

import { useEffect, useState } from "react";
import { Shield, X } from "lucide-react";
import {
  dismissSafetyDisclaimer,
  isSafetyDisclaimerDismissed,
  SAFETY_DISCLAIMER_TEXT,
} from "@/lib/safety-disclaimer";

export function SafetyDisclaimer({ className = "" }: { className?: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!isSafetyDisclaimerDismissed());
  }, []);

  if (!visible) return null;

  const close = () => {
    dismissSafetyDisclaimer();
    setVisible(false);
  };

  return (
    <div
      className={`rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 flex gap-3 items-start ${className}`}
      role="note"
      aria-label="Safety reminder"
    >
      <Shield className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-900">🛡️ Stay safe!</p>
        <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">{SAFETY_DISCLAIMER_TEXT}</p>
      </div>
      <button
        type="button"
        onClick={close}
        className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-800 shrink-0"
        aria-label="Dismiss safety notice"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
