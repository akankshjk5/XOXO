"use client";

import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { FILTER_TABS } from "@/lib/mock-data";

interface FilterTabsProps {
  className?: string;
}

export function FilterTabs({ className }: FilterTabsProps) {
  const { activeFilter, setActiveFilter } = useStore();

  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-1 scrollbar-hide", className)}>
      {FILTER_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveFilter(tab.id)}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
            activeFilter === tab.id
              ? "bg-primary text-white shadow-sm"
              : "bg-surface text-text-secondary hover:bg-border/50 hover:text-primary"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
