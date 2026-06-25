"use client";

import { motion } from "framer-motion";
import { Plane, MapPin, Camera, Palmtree, Compass } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { EASE_OUT } from "@/lib/motion";
import { INTRO_TIMELINE } from "@/lib/intro-timeline";

const ICONS = [
  { Icon: Plane, x: "12%", y: "22%", delay: 0 },
  { Icon: MapPin, x: "78%", y: "28%", delay: 0.15 },
  { Icon: Camera, x: "85%", y: "62%", delay: 0.3 },
  { Icon: Palmtree, x: "18%", y: "68%", delay: 0.2 },
  { Icon: Compass, x: "50%", y: "18%", delay: 0.25 },
];

const PINS = [
  { x: "28%", y: "42%", label: "Bali" },
  { x: "62%", y: "38%", label: "Maldives" },
  { x: "45%", y: "58%", label: "Dubai" },
];

interface FloatingTravelElementsProps {
  visible: boolean;
  showPins: boolean;
  parallaxX?: number;
  parallaxY?: number;
}

export function FloatingTravelElements({
  visible,
  showPins,
  parallaxX = 0,
  parallaxY = 0,
}: FloatingTravelElementsProps) {
  const reduced = useReducedMotion();
  if (!visible || reduced) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-[5]" aria-hidden>
      {ICONS.map(({ Icon, x, y, delay }, i) => (
        <motion.div
          key={i}
          className="absolute transform-gpu"
          style={{ left: x, top: y }}
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{
            opacity: [0, 0.7, 0.5],
            scale: 1,
            y: [20, 0, -8, 0],
            x: parallaxX * (i % 2 === 0 ? 1 : -1) * 0.3,
          }}
          transition={{
            opacity: { duration: 1, delay },
            scale: { duration: 0.6, delay },
            y: { duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: delay + 0.5 },
            x: { duration: 0.1 },
          }}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
            <Icon className="h-5 w-5 text-white/90" strokeWidth={1.5} />
          </div>
        </motion.div>
      ))}

      {showPins &&
        PINS.map((pin, i) => (
          <motion.div
            key={pin.label}
            className="absolute flex flex-col items-center transform-gpu"
            style={{ left: pin.x, top: pin.y }}
            initial={{ opacity: 0, y: 16, scale: 0.85 }}
            animate={{
              opacity: 1,
              y: [0, -6, 0],
              scale: 1,
              x: parallaxX * 0.2 * (i - 1),
            }}
            transition={{
              opacity: { duration: 0.55, ease: EASE_OUT },
              scale: { duration: 0.55, ease: EASE_OUT },
              y: { duration: 2.5 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: 0.3 + i * 0.15 },
              x: { duration: 0.1 },
            }}
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 rounded-full bg-green-bright/40"
                animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
              />
              <MapPin
                className="h-6 w-6 text-green-bright drop-shadow-[0_2px_8px_rgba(74,222,128,0.8)]"
                fill="currentColor"
              />
            </div>
            <span className="mt-1 text-[10px] font-semibold text-white/80 tracking-wide uppercase">
              {pin.label}
            </span>
          </motion.div>
        ))}
    </div>
  );
}
