import Link from "next/link";
import { PACKAGES } from "@/lib/mock-data";
import { PackageCard } from "./PackageCard";

export function TrendingSection() {
  return (
    <section className="py-10 sm:py-14 bg-white">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="pyt-section-title">Featured Holiday Packages</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Handpicked itineraries with transparent pricing
            </p>
          </div>
          <Link
            href="/packages"
            className="text-sm font-semibold text-brand-green hover:underline shrink-0"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PACKAGES.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </div>
    </section>
  );
}
