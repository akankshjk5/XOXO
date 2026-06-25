import { TRUST_SIGNALS } from "@/lib/home-data";

export function TrustBar() {
  return (
    <div className="bg-white border-b border-border shadow-sm">
      <div className="container-x py-4">
        <div className="flex flex-wrap items-center justify-center gap-y-3 divide-x-0 sm:divide-x divide-border">
          {TRUST_SIGNALS.map((signal, i) => (
            <div
              key={signal.label}
              className={`flex items-center gap-2 px-4 sm:px-6 ${i === 0 ? "sm:pl-0" : ""}`}
            >
              <span className="text-base">{signal.icon}</span>
              <span className="text-xs sm:text-sm font-medium text-text-primary whitespace-nowrap">
                {signal.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
