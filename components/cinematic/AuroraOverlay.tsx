"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface AuroraOverlayProps {
  intensity?: "subtle" | "vivid";
}

export function AuroraOverlay({ intensity = "vivid" }: AuroraOverlayProps) {
  const reduced = useReducedMotion();
  const opacity = intensity === "vivid" ? 0.55 : 0.35;

  if (reduced) {
    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(74,222,128,0.15), transparent 70%)",
        }}
      />
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <motion.div
        className="absolute -inset-[40%] opacity-60"
        style={{
          background:
            "conic-gradient(from 180deg at 50% 50%, rgba(74,222,128,0.4), rgba(13,61,46,0.3), rgba(34,197,94,0.35), rgba(45,27,14,0.25), rgba(74,222,128,0.4))",
          filter: "blur(60px)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 90% 60% at 30% 20%, rgba(74,222,128,${opacity}), transparent 55%),
            radial-gradient(ellipse 70% 50% at 75% 60%, rgba(34,197,94,${opacity * 0.7}), transparent 50%),
            radial-gradient(ellipse 50% 40% at 50% 100%, rgba(13,61,46,0.5), transparent 60%)`,
        }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
