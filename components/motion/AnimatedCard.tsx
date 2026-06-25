"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cardHover } from "@/lib/motion";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
  lift?: boolean;
  onClick?: () => void;
}

export function AnimatedCard({
  children,
  className,
  as = "div",
  lift = true,
  onClick,
}: AnimatedCardProps) {
  const reduced = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      initial="rest"
      whileHover={lift && !reduced ? "hover" : undefined}
      whileTap={lift && !reduced ? "tap" : undefined}
      custom={reduced}
      variants={cardHover}
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-[#EBEBEB] bg-white",
        lift && "shadow-[0_2px_12px_rgba(0,0,0,0.06)]",
        className
      )}
    >
      {children}
    </Component>
  );
}

export function FloatingCard({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={cn("rounded-2xl", className)}
      animate={reduced ? undefined : { y: [0, -6, 0] }}
      transition={reduced ? undefined : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
