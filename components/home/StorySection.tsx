"use client";

import { type ReactNode } from "react";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { cn } from "@/lib/utils";

interface StorySectionProps {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  dark?: boolean;
  id?: string;
}

/** Homepage narrative section with consistent hierarchy */
export function StorySection({
  children,
  eyebrow,
  title,
  subtitle,
  className,
  dark,
  id,
}: StorySectionProps) {
  return (
    <section id={id} className={cn("relative", className)}>
      {(eyebrow || title) && (
        <RevealOnScroll className="container-x mb-8 md:mb-10">
          {eyebrow && (
            <p
              className={cn(
                "text-[11px] font-bold uppercase tracking-[0.2em] mb-2",
                dark ? "text-green-bright/80" : "text-green-dark/70"
              )}
            >
              {eyebrow}
            </p>
          )}
          {title && (
            <h2
              className={cn(
                "text-2xl sm:text-3xl font-black tracking-tight leading-tight",
                dark ? "text-white" : "text-text-dark"
              )}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p className={cn("mt-2 text-[15px] max-w-xl leading-relaxed", dark ? "text-white/65" : "text-text-grey")}>
              {subtitle}
            </p>
          )}
        </RevealOnScroll>
      )}
      {children}
    </section>
  );
}

/** Subtle narrative bridge between homepage chapters */
export function StoryBridge({ label }: { label: string }) {
  return (
    <RevealOnScroll>
      <div className="container-x py-6 md:py-8 flex items-center gap-4" aria-hidden>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E0E0E0] to-transparent" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-text-grey/80 shrink-0">
          {label}
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E0E0E0] to-transparent" />
      </div>
    </RevealOnScroll>
  );
}
