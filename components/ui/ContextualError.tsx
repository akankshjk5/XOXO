"use client";

import { motion } from "framer-motion";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { EASE_OUT, DURATION } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface ContextualErrorProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  compact?: boolean;
}

/** Premium inline error with contextual copy and optional retry. */
export function ContextualError({
  title = "Something didn't load",
  message,
  onRetry,
  retryLabel = "Try again",
  className,
  compact,
}: ContextualErrorProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      role="alert"
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.fast, ease: EASE_OUT }}
      className={cn(
        "rounded-2xl border border-red-200/80 bg-gradient-to-b from-red-50 to-white text-red-900",
        compact ? "px-4 py-3" : "px-5 py-4",
        className
      )}
    >
      <div className="flex gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600" aria-hidden>
          <AlertCircle className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-red-950">{title}</p>
          <p className="text-sm text-red-800/90 mt-0.5 leading-relaxed">{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 min-h-[44px]"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
              {retryLabel}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
