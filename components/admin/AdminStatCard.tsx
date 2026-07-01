"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { CountUp } from "@/components/motion/CountUp";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DURATION, EASE_OUT } from "@/lib/motion";

interface AdminStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  className?: string;
  animate?: boolean;
}

export function AdminStatCard({ label, value, icon: Icon, trend, className, animate }: AdminStatCardProps) {
  const reduced = useReducedMotion();
  const numeric = typeof value === "number";

  return (
    <motion.div
      whileHover={reduced ? undefined : { y: -3, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}
      transition={{ duration: DURATION.fast, ease: EASE_OUT }}
      className={cn("admin-card p-5 transition-colors hover:border-green-bright/25", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-text-grey">{label}</p>
          <p className="mt-2 font-primary text-2xl font-semibold text-text-dark tabular-nums">
            {numeric && animate ? <CountUp end={value} duration={1.2} /> : value}
          </p>
          {trend && <p className="mt-1 text-xs text-green-dark">{trend}</p>}
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-dark/10 text-green-dark">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
    </motion.div>
  );
}
