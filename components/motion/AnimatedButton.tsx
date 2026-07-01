"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { buttonTap, EASE_OUT } from "@/lib/motion";

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
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

export function AnimatedButton({
  variant = "primary",
  size = "md",
  className,
  children,
  disabled,
  type = "button",
  onClick,
}: AnimatedButtonProps) {
  const reduced = useReducedMotion();
  const sizes = {
    sm: "px-4 py-2 text-sm rounded-full",
    md: "px-6 py-2.5 text-sm rounded-full",
    lg: "px-8 py-3.5 text-base rounded-full",
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileTap={buttonTap(reduced)}
      whileHover={reduced ? undefined : { scale: 1.02 }}
      transition={{ duration: reduced ? 0 : 0.2, ease: EASE_OUT }}
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-bright focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </motion.button>
  );
}
