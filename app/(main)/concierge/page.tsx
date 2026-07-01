import type { Metadata } from "next";
import { Suspense } from "react";
import { ConciergeWorkspace } from "@/components/concierge/ConciergeWorkspace";

export const metadata: Metadata = {
  title: "AI Travel Concierge | XOXO Travels",
  description:
    "Plan your complete trip with XOXO AI — live flights, hotels, activities, budget analysis, and social travel matches.",
};

export default function ConciergePage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-text-grey">Loading concierge…</div>}>
      <ConciergeWorkspace />
    </Suspense>
  );
}
