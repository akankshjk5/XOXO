"use client";

import { useRouter } from "next/navigation";
import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { RevealOnScroll } from "./RevealOnScroll";
import { AnimatedButton } from "./AnimatedButton";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DURATION, EASE_OUT } from "@/lib/motion";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  cta?: string;
  href?: string;
  action?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  variant?: "default" | "compact";
}

export function EmptyState({
  icon = "✨",
  title,
  description,
  cta,
  href,
  action,
  onRetry,
  retryLabel = "Try again",
  variant = "default",
}: EmptyStateProps) {
  const reduced = useReducedMotion();
  const router = useRouter();
  const isCompact = variant === "compact";

  return (
    <RevealOnScroll>
      <div
        className={`relative text-center overflow-hidden border border-[#E8E8E8] rounded-2xl bg-gradient-to-b from-white via-white to-off-white/90 shadow-premium ${
          isCompact ? "py-10 px-5" : "py-14 px-6"
        }`}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full bg-green-bright/10 blur-3xl pointer-events-none"
          aria-hidden
        />
        <div className="absolute inset-x-8 top-6 h-px bg-gradient-to-r from-transparent via-green-bright/20 to-transparent" aria-hidden />

        <motion.div
          className="relative"
          initial={reduced ? false : { scale: 0.92, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: DURATION.slow, ease: EASE_OUT }}
        >
          <motion.p
            className={`${isCompact ? "text-4xl" : "text-5xl"} mb-4 inline-block`}
            aria-hidden
            animate={reduced ? undefined : { y: [0, -4, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          >
            {icon}
          </motion.p>
          <p className={`font-bold text-text-dark ${isCompact ? "text-base" : "text-lg"} mb-1.5 tracking-tight`}>
            {title}
          </p>
          {description && (
            <p className="text-sm text-text-grey max-w-sm mx-auto mb-5 leading-relaxed">{description}</p>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            {cta && href && (
              <AnimatedButton size="sm" variant="primary" onClick={() => router.push(href)}>
                {cta}
              </AnimatedButton>
            )}
            {onRetry && (
              <AnimatedButton size="sm" variant="secondary" onClick={onRetry}>
                {retryLabel}
              </AnimatedButton>
            )}
          </div>
          {action && <div className="mt-3">{action}</div>}
        </motion.div>
      </div>
    </RevealOnScroll>
  );
}
