"use client";

import type { ConciergePlan } from "@/lib/concierge-types";
import { formatPrice } from "@/lib/utils";

const LABELS: Record<string, string> = {
  flights: "Flights",
  hotels: "Hotels",
  activities: "Activities",
  localTransport: "Local transport",
  food: "Food",
  shopping: "Shopping",
  emergencyReserve: "Emergency reserve",
};

export function BudgetDashboard({ plan }: { plan: ConciergePlan | null }) {
  const budget = plan?.budget;
  if (!budget) {
    return (
      <div className="rounded-2xl border border-dashed border-[#E0E0E0] bg-white/60 p-6 text-center text-sm text-text-grey">
        Budget breakdown appears after trip planning.
      </div>
    );
  }

  const total = budget.totalBudget || budget.subtotal;
  const items = Object.entries(budget.breakdown || {});

  return (
    <div className="rounded-2xl border border-[#E8E8E8] bg-white shadow-elevated p-5">
      <h3 className="font-black text-text-dark mb-1">Budget analysis</h3>
      <p className="text-2xl font-black text-green-dark mb-4">
        {total ? formatPrice(total) : "—"}
        {budget.perPerson ? (
          <span className="text-sm font-medium text-text-grey ml-2">
            · {formatPrice(budget.perPerson)}/person
          </span>
        ) : null}
      </p>
      <div className="space-y-2">
        {items.map(([key, val]) => {
          const pct = total ? Math.min(100, Math.round((val / total) * 100)) : 0;
          return (
            <div key={key}>
              <div className="flex justify-between text-xs mb-0.5">
                <span className="text-text-grey">{LABELS[key] || key}</span>
                <span className="font-semibold text-text-dark">{formatPrice(val)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-off-white overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-bright transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {budget.remaining !== null && (
        <p
          className={`mt-4 text-sm font-semibold ${
            budget.withinBudget ? "text-green-dark" : "text-amber-600"
          }`}
        >
          {budget.withinBudget ? "Remaining budget: " : "Over budget by: "}
          {formatPrice(Math.abs(budget.remaining))}
        </p>
      )}
    </div>
  );
}
