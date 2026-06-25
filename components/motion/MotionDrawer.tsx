"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode } from "react";
import { modalBackdrop, drawerPanel } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface MotionDrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  side?: "right" | "left";
  className?: string;
}

export function MotionDrawer({
  open,
  onClose,
  children,
  side = "right",
  className,
}: MotionDrawerProps) {
  const reduced = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-black/50"
            initial="hidden"
            animate="visible"
            exit="exit"
            custom={reduced}
            variants={modalBackdrop}
            onClick={onClose}
          />
          <motion.aside
            className={`fixed top-0 bottom-0 z-[90] w-full max-w-[320px] bg-white flex flex-col shadow-2xl ${
              side === "right" ? "right-0" : "left-0"
            } ${className ?? ""}`}
            custom={reduced}
            variants={drawerPanel}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
