import { Headphones, Phone } from "lucide-react";

/** Premium info card — additional services handled by travel consultant after enquiry. */
export function BookingAddOnsNotice() {
  return (
    <div className="rounded-2xl border border-green-dark/15 bg-gradient-to-br from-green-dark/[0.05] via-white/90 to-white/80 backdrop-blur-sm p-4 shadow-premium">
      <div className="flex gap-3 sm:gap-4">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-dark/10 text-green-dark"
          aria-hidden
        >
          <Headphones className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1 space-y-2.5">
          <h4 className="text-sm font-bold text-text-dark">Need something more?</h4>
          <p className="text-xs sm:text-sm text-text-grey leading-relaxed">
            Need additional services such as premium insurance, visa processing, hotel upgrades, forex,
            private guides, airport lounge access, SIM cards, or customized travel arrangements?
          </p>
          <p className="text-xs sm:text-sm text-text-grey leading-relaxed">
            Our travel experts will personally assist you after your booking enquiry.
          </p>
          <p
            className="inline-flex items-center gap-1.5 rounded-full border border-green-dark/20 bg-green-dark/[0.06] px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-green-dark"
            role="note"
          >
            <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Our travel consultant will contact you after booking.
          </p>
          <p className="text-[11px] sm:text-xs text-text-grey/90 leading-relaxed border-t border-green-dark/10 pt-2.5">
            Additional services and pricing may vary depending on your destination and travel dates.
            Our travel consultant will confirm all optional services before final booking.
          </p>
        </div>
      </div>
    </div>
  );
}
