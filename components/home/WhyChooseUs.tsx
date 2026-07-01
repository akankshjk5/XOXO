"use client";

import { useEffect, useState } from "react";
import { packagesAPI, destinationsAPI } from "@/lib/api";
import { StaggerContainer, StaggerItem } from "@/components/motion/FadeIn";
import { CountUp } from "@/components/motion/CountUp";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { FloatingCard } from "@/components/motion/AnimatedCard";

const BASE_STATS = [
  { icon: "🌍", label: "Destinations", key: "destinations" as const },
  { icon: "📦", label: "Holiday Packages", key: "packages" as const },
  { icon: "⭐", label: "Traveller Rating", key: "rating" as const, value: "4.6" },
  { icon: "🎧", label: "Support", key: "support" as const, value: "24X7" },
];

function StatValue({ value }: { value: string }) {
  if (value === "24X7") return <span>{value}</span>;
  if (value.endsWith("%")) {
    const num = parseInt(value, 10);
    return <CountUp end={num} suffix="%" />;
  }
  if (value.includes("k+")) {
    const num = parseInt(value, 10);
    return <CountUp end={num} suffix="k+" />;
  }
  const match = value.match(/^([^0-9]*)([0-9.]+)(.*)$/);
  if (!match) return <span>{value}</span>;
  return (
    <>
      {match[1]}
      <CountUp end={parseFloat(match[2])} suffix={match[3]} />
    </>
  );
}

export function WhyChooseUs() {
  const [counts, setCounts] = useState({ packages: 0, destinations: 0 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [pkgRes, destRes] = await Promise.all([
          packagesAPI.getAll({ limit: 1 }),
          destinationsAPI.getAll({}),
        ]);
        if (cancelled) return;
        setCounts({
          packages: pkgRes.data.pagination?.total ?? pkgRes.data.data?.length ?? 0,
          destinations: destRes.data.data?.length ?? 0,
        });
      } catch {
        /* counts optional */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = BASE_STATS.map((stat) => {
    if (stat.key === "packages") {
      return { ...stat, value: counts.packages > 0 ? `${counts.packages}+` : "—" };
    }
    if (stat.key === "destinations") {
      return { ...stat, value: counts.destinations > 0 ? String(counts.destinations) : "—" };
    }
    return stat;
  });

  return (
    <section className="bg-off-white py-16 md:py-24">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6">
        <RevealOnScroll>
          <h2 className="text-center text-[28px] sm:text-[32px] font-black text-text-dark mb-14 tracking-tight">
            Why choose XOXO Travels?
          </h2>
        </RevealOnScroll>

        <StaggerContainer className="relative grid grid-cols-2 gap-x-8 gap-y-10 md:gap-x-16 md:gap-y-12 mb-14 min-h-[280px]">
          {stats.map((stat) => (
            <StaggerItem
              key={stat.label}
              className="flex flex-col items-center text-center md:items-center"
            >
              <span className="text-2xl mb-2">{stat.icon}</span>
              <span className="text-[36px] sm:text-[42px] font-black text-green-bright leading-none tracking-tight">
                <StatValue value={stat.value || "—"} />
              </span>
              <span className="text-sm text-text-grey mt-1.5 font-medium">{stat.label}</span>
            </StaggerItem>
          ))}

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <FloatingCard>
              <div className="text-center bg-white rounded-2xl px-6 py-5 shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-[#EBEBEB] max-w-[220px]">
                <div className="text-4xl mb-2">🏆</div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-grey mb-1">Awarded</p>
                <p className="text-sm font-bold text-text-dark leading-snug">
                  The Best International Holiday Brand in India
                </p>
              </div>
            </FloatingCard>
          </div>
        </StaggerContainer>

        <RevealOnScroll delay={0.1}>
          <div className="max-w-xl mx-auto text-center border-t border-[#EBEBEB] pt-8">
            <div className="inline-flex items-center gap-2 mb-4 text-sm text-text-grey">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white border text-[10px] font-bold shadow-sm">
                <span className="text-[#4285F4]">G</span>
              </div>
              Live inventory · {counts.packages} packages · {counts.destinations} destinations
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
