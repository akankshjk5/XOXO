"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GitCompare, X } from "lucide-react";
import { getCompareList, clearCompare } from "@/lib/package-storage";

export function CompareBar() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setIds(getCompareList());
    sync();
    window.addEventListener("xoxo-compare-update", sync);
    return () => window.removeEventListener("xoxo-compare-update", sync);
  }, []);

  if (ids.length === 0) return null;

  return (
    <div
      className="fixed bottom-20 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border border-green-dark/30 bg-white px-4 py-2 shadow-lg md:bottom-6"
      role="status"
    >
      <GitCompare className="h-4 w-4 text-green-dark" aria-hidden />
      <span className="text-sm font-medium">{ids.length} selected</span>
      <Link
        href={`/packages/compare?ids=${ids.join(",")}`}
        className="rounded-full bg-green-dark px-3 py-1 text-xs font-bold text-white hover:bg-green-mid"
      >
        Compare
      </Link>
      <button
        type="button"
        onClick={clearCompare}
        className="p-1 text-text-grey hover:text-text-dark"
        aria-label="Clear compare list"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
