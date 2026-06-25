"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { pageTransition } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      custom={reduced}
      initial="initial"
      animate="animate"
      variants={pageTransition}
      className="min-h-[inherit]"
    >
      {children}
    </motion.div>
  );
}
