import type { Metadata } from "next";
import { PackageDetail } from "@/components/packages/PackageDetail";

export const metadata: Metadata = {
  title: "Package Details | XOXO Travels",
  description:
    "View day-by-day itinerary, inclusions, pricing, and book your XOXO Travels holiday package.",
};

export default function PackageDetailPage() {
  return <PackageDetail />;
}
