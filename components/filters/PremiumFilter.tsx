"use client";

import { memo, useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { SlidersHorizontal } from "lucide-react";
import type { FilterSection, FilterValues } from "@/lib/premium-filter-types";
import { countActiveFilters } from "@/lib/premium-filter-types";
import { cn } from "@/lib/utils";

const PremiumFilterDrawer = dynamic(
  () => import("./PremiumFilterDrawer").then((m) => m.PremiumFilterDrawer),
  { ssr: false }
);

interface PremiumFilterProps {
  sections: FilterSection[];
  values: FilterValues;
  defaults: FilterValues;
  onChange: (values: FilterValues) => void;
  title?: string;
  className?: string;
}

export const PremiumFilter = memo(function PremiumFilter({
  sections,
  values,
  defaults,
  onChange,
  title = "Filters",
  className,
}: PremiumFilterProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterValues>(values);

  const activeCount = useMemo(() => countActiveFilters(values, defaults), [values, defaults]);

  const openDrawer = useCallback(() => {
    setDraft(values);
    setOpen(true);
  }, [values]);

  const handleReset = useCallback(() => {
    setDraft(defaults);
    onChange(defaults);
  }, [defaults, onChange]);

  return (
    <div className={cn("relative inline-flex", className)}>
      <button
        type="button"
        onClick={openDrawer}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-200 min-h-[44px]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-bright focus-visible:ring-offset-2",
          activeCount > 0
            ? "border-green-dark bg-green-dark/5 text-green-dark shadow-sm"
            : "border-[#E0E0E0] bg-white text-text-dark hover:border-green-dark/30 hover:shadow-sm"
        )}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        Filters
        {activeCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-green-neon text-[10px] font-bold text-white px-1">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <PremiumFilterDrawer
          open={open}
          onClose={() => setOpen(false)}
          title={title}
          sections={sections}
          draft={draft}
          onDraftChange={setDraft}
          onApply={() => onChange(draft)}
          onReset={handleReset}
        />
      )}
    </div>
  );
});
