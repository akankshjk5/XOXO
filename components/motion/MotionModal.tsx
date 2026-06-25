"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode } from "react";
import { modalBackdrop, modalContent } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface MotionModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  align?: "center" | "bottom";
}

export function MotionModal({
  open,
  onClose,
  children,
  className,
  align = "center",
}: MotionModalProps) {
  const reduced = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={`fixed inset-0 z-[100] flex ${
            align === "bottom" ? "items-end sm:items-center" : "items-center"
          } justify-center bg-black/50 p-0 sm:p-4`}
          initial="hidden"
          animate="visible"
          exit="exit"
          custom={reduced}
          variants={modalBackdrop}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            custom={reduced}
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className={className}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
