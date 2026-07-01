"use client";

import { useRouter } from "next/navigation";
import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { RevealOnScroll } from "./RevealOnScroll";
import { AnimatedButton } from "./AnimatedButton";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { EASE_OUT } from "@/lib/motion";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  cta?: string;
  href?: string;
  action?: ReactNode;
  variant?: "default" | "compact";
}

export function EmptyState({
  icon = "✨",
  title,
  description,
  cta,
  href,
  action,
  variant = "default",
}: EmptyStateProps) {
  const reduced = useReducedMotion();
  const router = useRouter();
  const isCompact = variant === "compact";

  return (
    <RevealOnScroll>
      <div
        className={`relative text-center overflow-hidden border border-[#E8E8E8] rounded-2xl bg-gradient-to-b from-white to-off-white/80 ${
          isCompact ? "py-10 px-5" : "py-16 px-6"
        }`}
      >
        {/* Ambient glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-green-bright/8 blur-3xl pointer-events-none"
          aria-hidden
        />

        <motion.div
          className="relative"
          initial={reduced ? false : { scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        >
          <p className={`${isCompact ? "text-4xl" : "text-5xl"} mb-4`} aria-hidden>
            {icon}
          </p>
          <p className={`font-bold text-text-dark ${isCompact ? "text-base" : "text-lg"} mb-1.5`}>{title}</p>
          {description && (
            <p className="text-sm text-text-grey max-w-sm mx-auto mb-5 leading-relaxed">{description}</p>
          )}
          {cta && href && (
            <AnimatedButton size="sm" variant="primary" onClick={() => router.push(href)}>
              {cta}
            </AnimatedButton>
          )}
          {action && <div className="mt-2">{action}</div>}
        </motion.div>
      </div>
    </RevealOnScroll>
  );
}
