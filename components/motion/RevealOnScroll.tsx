"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { fadeUp, staggerContainer, staggerItem, EASE_OUT, REVEAL_OFFSET, DURATION } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  once?: boolean;
}

const directionOffset = {
  up: { y: REVEAL_OFFSET, x: 0 },
  down: { y: -REVEAL_OFFSET, x: 0 },
  left: { x: REVEAL_OFFSET, y: 0 },
  right: { x: -REVEAL_OFFSET, y: 0 },
};

export function RevealOnScroll({
  children,
  className,
  delay = 0,
  direction = "up",
  once = true,
}: RevealOnScrollProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: "-80px" });
  const reduced = useReducedMotion();
  const offset = directionOffset[direction];

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: reduced ? 1 : 0, ...offset }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : { opacity: reduced ? 1 : 0, ...offset }}
      transition={{ duration: reduced ? 0 : DURATION.normal, delay: reduced ? 0 : delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

/** Alias for design system */
export const AnimatedSection = RevealOnScroll;

export function StaggerReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={reduced}
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  );
}

export function StaggerRevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div className={className} custom={reduced} variants={staggerItem}>
      {children}
    </motion.div>
  );
}

export function FadeSlide({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      custom={reduced}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeUp}
    >
      {children}
    </motion.div>
  );
}
