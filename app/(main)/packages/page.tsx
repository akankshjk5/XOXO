import { Suspense } from "react";
import { PackagesBrowser } from "@/components/packages/PackagesBrowser";

export const metadata = {
  title: "Holiday Packages | XOXO Travels",
  description:
    "Curated international holiday packages for Indian travellers — honeymoons, family trips, and adventure getaways with transparent pricing.",
};

export default function PackagesPage() {
  return (
    <>
      <div className="bg-green-dark pt-24 pb-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl font-black text-white">Holiday Packages</h1>
          <p className="text-white/70 mt-2">Curated international trips for Indian travellers.</p>
        </div>
      </div>
      <Suspense fallback={<div className="max-w-[1280px] mx-auto px-6 py-12 text-text-grey">Loading packages…</div>}>
        <PackagesBrowser />
      </Suspense>
    </>
  );
}
