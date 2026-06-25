import type { Metadata } from "next";
import { ConciergeWorkspace } from "@/components/concierge/ConciergeWorkspace";

export const metadata: Metadata = {
  title: "AI Travel Concierge | XOXO Travels",
  description:
    "Plan your complete trip with XOXO AI — live flights, hotels, activities, budget analysis, and social travel matches.",
};

export default function ConciergePage() {
  return <ConciergeWorkspace />;
}
