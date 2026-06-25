"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { scaleIn } from "@/lib/motion";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  blur?: "sm" | "md" | "lg";
}

export function GlassCard({ children, className, blur = "md" }: GlassCardProps) {
  const reduced = useReducedMotion();
  const blurMap = { sm: "backdrop-blur-sm", md: "backdrop-blur-md", lg: "backdrop-blur-xl" };

  return (
    <motion.div
      custom={reduced}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={scaleIn}
      className={cn(
        "rounded-2xl border border-white/20 bg-white/70",
        blurMap[blur],
        "shadow-[0_8px_32px_rgba(0,0,0,0.08)]",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
