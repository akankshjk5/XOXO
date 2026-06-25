import { TRUST_PILLARS, TOURISM_PARTNERS, PRESS_MENTIONS } from "@/lib/mock-data";
import { SearchBar } from "./SearchBar";

export function TrustSection() {
  return (
    <section className="py-10 sm:py-14 bg-surface-warm">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-text-muted mb-2">
            Adventures worth chasing
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Why travellers trust XOXO Travels
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {TRUST_PILLARS.map((pillar) => (
            <div key={pillar.title} className="text-center px-4">
              <h3 className="text-lg font-bold text-text-primary mb-2">{pillar.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>

        <div className="mb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-text-muted text-center mb-6">
            Tourism Board Partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {TOURISM_PARTNERS.map((partner) => (
              <span
                key={partner}
                className="text-sm font-semibold text-text-muted/70 hover:text-text-secondary transition-colors"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>

        {PRESS_MENTIONS.map((press) => (
          <div key={press.id} className="pyt-card p-6 sm:p-8 max-w-3xl mx-auto text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-text-muted mb-4">
              What the press says
            </p>
            <blockquote className="text-base sm:text-lg text-text-primary leading-relaxed font-medium mb-4">
              &ldquo;{press.quote}&rdquo;
            </blockquote>
            <p className="text-sm text-text-secondary">
              <span className="font-semibold text-text-primary">{press.source}</span>
              {" · "}{press.date}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function BottomSearchCTA() {
  return (
    <section className="py-12 sm:py-16 bg-primary">
      <div className="mx-auto max-w-[720px] px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 tracking-tight">
          Create a Sooper Hit holiday
        </h2>
        <SearchBar variant="inline" />
      </div>
    </section>
  );
}
