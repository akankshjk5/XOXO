"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { calculateBudget, type HotelCategory, type FlightClass, type TravelStyle } from "@/lib/budget-calculator";
import { formatPrice } from "@/lib/utils";

interface Props {
  packagePricePerPerson: number;
  durationDays: number;
}

const ROWS = [
  { key: "flights", label: "Flights" },
  { key: "hotels", label: "Hotels" },
  { key: "transport", label: "Transport" },
  { key: "food", label: "Food" },
  { key: "activities", label: "Activities" },
  { key: "taxes", label: "Taxes & fees" },
] as const;

export function BudgetCalculator({ packagePricePerPerson, durationDays }: Props) {
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [hotelCategory, setHotelCategory] = useState<HotelCategory>("premium");
  const [flightClass, setFlightClass] = useState<FlightClass>("economy");
  const [travelStyle, setTravelStyle] = useState<TravelStyle>("family");
  const [budgetINR, setBudgetINR] = useState(200000);

  const breakdown = useMemo(
    () =>
      calculateBudget({
        adults,
        children,
        hotelCategory,
        flightClass,
        travelStyle,
        budgetINR,
        packagePricePerPerson,
        durationDays,
      }),
    [adults, children, hotelCategory, flightClass, travelStyle, budgetINR, packagePricePerPerson, durationDays]
  );

  return (
    <section className="mt-10 rounded-2xl border border-[#EBEBEB] bg-white p-5 sm:p-6" aria-labelledby="budget-calc-heading">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="h-5 w-5 text-green-dark" aria-hidden />
        <h2 id="budget-calc-heading" className="section-heading text-xl">
          AI Budget Calculator
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <label className="text-sm">
          <span className="text-text-grey">Adults</span>
          <input
            type="number"
            min={1}
            max={12}
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-[#EBEBEB] px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="text-text-grey">Children</span>
          <input
            type="number"
            min={0}
            max={8}
            value={children}
            onChange={(e) => setChildren(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-[#EBEBEB] px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="text-text-grey">Your budget (₹)</span>
          <input
            type="number"
            min={50000}
            step={10000}
            value={budgetINR}
            onChange={(e) => setBudgetINR(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-[#EBEBEB] px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="text-text-grey">Hotel category</span>
          <select
            value={hotelCategory}
            onChange={(e) => setHotelCategory(e.target.value as HotelCategory)}
            className="mt-1 w-full rounded-xl border border-[#EBEBEB] px-3 py-2"
          >
            <option value="luxury">Luxury</option>
            <option value="premium">Premium</option>
            <option value="budget">Budget</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="text-text-grey">Flight class</span>
          <select
            value={flightClass}
            onChange={(e) => setFlightClass(e.target.value as FlightClass)}
            className="mt-1 w-full rounded-xl border border-[#EBEBEB] px-3 py-2"
          >
            <option value="economy">Economy</option>
            <option value="premium_economy">Premium Economy</option>
            <option value="business">Business</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="text-text-grey">Travel style</span>
          <select
            value={travelStyle}
            onChange={(e) => setTravelStyle(e.target.value as TravelStyle)}
            className="mt-1 w-full rounded-xl border border-[#EBEBEB] px-3 py-2"
          >
            <option value="adventure">Adventure</option>
            <option value="romantic">Romantic</option>
            <option value="family">Family</option>
            <option value="luxury">Luxury</option>
            <option value="backpacking">Backpacking</option>
          </select>
        </label>
      </div>

      <div className="rounded-xl bg-off-white p-4 space-y-2">
        {ROWS.map(({ key, label }) => (
          <div key={key} className="flex justify-between text-sm">
            <span className="text-text-grey">{label}</span>
            <span className="font-medium text-text-dark">{formatPrice(breakdown[key])}</span>
          </div>
        ))}
        <div className="border-t border-[#EBEBEB] pt-2 flex justify-between font-bold text-text-dark">
          <span>Total estimated</span>
          <span className={breakdown.withinBudget ? "text-green-dark" : "text-amber-600"}>
            {formatPrice(breakdown.total)}
          </span>
        </div>
        <div className="flex justify-between text-sm text-green-dark font-medium">
          <span>Potential savings</span>
          <span>{formatPrice(breakdown.savings)}</span>
        </div>
      </div>
    </section>
  );
}
