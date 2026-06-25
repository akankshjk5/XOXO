import { DestinationsBrowser } from "@/components/destinations/DestinationsBrowser";

export const metadata = {
  title: "Explore Destinations | XOXO Travels",
  description:
    "Discover handpicked destinations across Asia, Europe, and beyond — from Bali and Thailand to Switzerland and Dubai.",
};

export default function DestinationsPage() {
  return (
    <>
      <div className="bg-green-dark pt-24 pb-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl font-black text-white">Explore Destinations</h1>
          <p className="text-white/70 mt-2">Handpicked getaways across the globe.</p>
        </div>
      </div>
      <DestinationsBrowser />
    </>
  );
}
