"use client";

import { motion } from "framer-motion";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface AnimatedTabsProps {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function AnimatedTabs({ tabs, active, onChange, className }: AnimatedTabsProps) {
  const reduced = useReducedMotion();
  const pillId = useId();

  return (
    <div className={cn("flex gap-2 flex-wrap justify-center", className)} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative px-5 py-2 rounded-full text-sm font-semibold capitalize transition-colors",
              isActive ? "text-white" : "border border-[#E0E0E0] text-text-grey hover:border-green-dark"
            )}
          >
            {isActive && (
              <motion.span
                layoutId={reduced ? undefined : pillId}
                className="absolute inset-0 rounded-full bg-green-dark"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                style={{ zIndex: 0 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

interface TabPanelProps {
  children: ReactNode;
  id: string;
  active: string;
}

export function AnimatedTabPanel({ children, id, active }: TabPanelProps) {
  const reduced = useReducedMotion();
  if (id !== active) return null;
  return (
    <motion.div
      key={id}
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
