"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { buttonTap, DURATION, EASE_OUT } from "@/lib/motion";

type Variant = "primary" | "secondary" | "ghost" | "outline";

const variants: Record<Variant, string> = {
  primary:
    "bg-green-neon text-white font-semibold shadow-[0_4px_14px_rgba(34,197,94,0.35)] hover:bg-green-dark",
  secondary:
    "bg-white border border-[#E0E0E0] text-text-dark font-semibold hover:border-green-dark hover:text-green-dark",
  ghost: "bg-transparent text-text-dark font-medium hover:bg-off-white",
  outline:
    "bg-white border border-[#E0E0E0] text-text-dark font-semibold hover:border-green-dark hover:text-green-dark",
};

interface AnimatedButtonProps {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

export function AnimatedButton({
  variant = "primary",
  size = "md",
  className,
  children,
  disabled,
  loading,
  type = "button",
  onClick,
}: AnimatedButtonProps) {
  const reduced = useReducedMotion();
  const sizes = {
    sm: "px-4 py-2 text-sm rounded-full min-h-[44px]",
    md: "px-6 py-2.5 text-sm rounded-full min-h-[44px]",
    lg: "px-8 py-3.5 text-base rounded-full min-h-[48px]",
  };

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      whileTap={buttonTap(reduced)}
      whileHover={reduced || loading ? undefined : { scale: 1.02 }}
      transition={{ duration: DURATION.fast, ease: EASE_OUT }}
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-bright focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      aria-busy={loading}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />}
      {children}
    </motion.button>
  );
}
