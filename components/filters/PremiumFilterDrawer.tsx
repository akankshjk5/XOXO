"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { FilterSection, FilterValues } from "@/lib/premium-filter-types";
import { DURATION, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface PremiumFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  sections: FilterSection[];
  draft: FilterValues;
  onDraftChange: (next: FilterValues) => void;
  onApply: () => void;
  onReset: () => void;
}

export function PremiumFilterDrawer({
  open,
  onClose,
  title = "Filters",
  sections,
  draft,
  onDraftChange,
  onApply,
  onReset,
}: PremiumFilterDrawerProps) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [layout, setLayout] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const sync = () => {
      const w = window.innerWidth;
      if (w < 640) setLayout("mobile");
      else if (w < 1024) setLayout("tablet");
      else setLayout("desktop");
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const panelClass =
    layout === "mobile"
      ? "fixed inset-x-0 bottom-0 max-h-[min(88dvh,640px)] rounded-t-3xl"
      : layout === "tablet"
        ? "fixed top-0 right-0 h-full w-full max-w-md rounded-l-3xl"
        : "absolute right-0 top-full mt-2 w-[min(420px,calc(100vw-2rem))] rounded-2xl";

  const content = (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close filters"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            className={cn(
              "fixed inset-0 z-[180]",
              layout === "desktop" ? "bg-transparent" : "bg-black/40 backdrop-blur-[2px]"
            )}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={
              reduced
                ? false
                : layout === "mobile"
                  ? { y: "100%", opacity: 0 }
                  : layout === "tablet"
                    ? { x: "100%", opacity: 0 }
                    : { opacity: 0, y: -8, scale: 0.98 }
            }
            animate={
              layout === "mobile"
                ? { y: 0, opacity: 1 }
                : layout === "tablet"
                  ? { x: 0, opacity: 1 }
                  : { opacity: 1, y: 0, scale: 1 }
            }
            exit={
              reduced
                ? undefined
                : layout === "mobile"
                  ? { y: "100%", opacity: 0 }
                  : layout === "tablet"
                    ? { x: "100%", opacity: 0 }
                    : { opacity: 0, y: -8, scale: 0.98 }
            }
            transition={{ duration: reduced ? 0 : DURATION.normal, ease: EASE_OUT }}
            className={cn(
              "z-[190] flex flex-col overflow-hidden border border-white/40 bg-white/90 backdrop-blur-xl shadow-elevated",
              layout === "desktop" ? "absolute right-0 top-full mt-2" : "fixed",
              panelClass
            )}
            style={
              layout === "desktop"
                ? undefined
                : { paddingBottom: "max(0px, env(safe-area-inset-bottom))" }
            }
          >
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#EBEBEB]/80 shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-green-dark" aria-hidden />
                <h2 className="font-semibold text-text-dark">{title}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-text-grey hover:bg-off-white hover:text-text-dark transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-5">
              {sections.map((section) => (
                <div key={section.id}>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-grey mb-2.5">
                    {section.title}
                  </p>
                  {section.type === "search" ? (
                    <div className="flex items-center gap-2 rounded-xl border border-[#E8E8E8] bg-white/80 px-3 py-2.5 focus-within:border-green-dark/40 transition-colors">
                      <Search className="h-4 w-4 text-text-grey shrink-0" aria-hidden />
                      <input
                        value={draft[section.id] || ""}
                        onChange={(e) => onDraftChange({ ...draft, [section.id]: e.target.value })}
                        placeholder={section.placeholder || "Search…"}
                        className="flex-1 bg-transparent text-sm outline-none min-w-0"
                        aria-label={section.title}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(section.options || []).map((opt) => {
                        const active = (draft[section.id] || "all") === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => onDraftChange({ ...draft, [section.id]: opt.id })}
                            className={cn(
                              "rounded-full px-3.5 py-2 text-xs font-semibold border transition-all duration-200 min-h-[36px]",
                              active
                                ? "bg-green-dark text-white border-green-dark shadow-sm"
                                : "bg-white/70 text-text-dark border-[#E8E8E8] hover:border-green-dark/30"
                            )}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="shrink-0 flex gap-3 px-5 py-4 border-t border-[#EBEBEB]/80 bg-white/80 backdrop-blur-md pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={onReset}
                className="flex-1 rounded-full border border-[#E0E0E0] py-3 text-sm font-semibold text-text-dark hover:border-green-dark/40 transition-colors min-h-[44px]"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  onApply();
                  onClose();
                }}
                className="flex-1 rounded-full bg-green-neon text-white py-3 text-sm font-bold hover:bg-green-dark transition-colors min-h-[44px]"
              >
                Apply
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (layout === "desktop") return content;
  return createPortal(content, document.body);
}
