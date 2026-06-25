"use client";

import { WHY_CHOOSE_STATS } from "@/lib/pyt-data";
import { StaggerContainer, StaggerItem } from "@/components/motion/FadeIn";
import { CountUp } from "@/components/motion/CountUp";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { FloatingCard } from "@/components/motion/AnimatedCard";

function StatValue({ value }: { value: string }) {
  if (value === "24X7") {
    return <span>{value}</span>;
  }
  if (value.endsWith("%")) {
    const num = parseInt(value, 10);
    return <CountUp end={num} suffix="%" />;
  }
  if (value.includes("k+")) {
    const num = parseInt(value, 10);
    return <CountUp end={num} suffix="k+" />;
  }
  const { prefix, num, suffix } = (() => {
    const match = value.match(/^([^0-9]*)([0-9.]+)(.*)$/);
    if (!match) return { prefix: "", num: 0, suffix: value };
    return { prefix: match[1], num: parseFloat(match[2]), suffix: match[3] };
  })();
  return (
    <>
      {prefix}
      <CountUp end={num} suffix={suffix} />
    </>
  );
}

export function WhyChooseUs() {
  return (
    <section className="bg-off-white py-16 md:py-24">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6">
        <RevealOnScroll>
          <h2 className="text-center text-[28px] sm:text-[32px] font-black text-text-dark mb-14 tracking-tight">
            Why choose XOXO Travels?
          </h2>
        </RevealOnScroll>

        <StaggerContainer className="relative grid grid-cols-2 gap-x-8 gap-y-10 md:gap-x-16 md:gap-y-12 mb-14 min-h-[280px]">
          {WHY_CHOOSE_STATS.map((stat) => (
              <StaggerItem
                key={stat.label}
                className={`flex flex-col items-center text-center ${
                  stat.position.includes("left") ? "md:items-end md:text-right" : "md:items-start md:text-left"
                }`}
              >
                <span className="text-2xl mb-2">{stat.icon}</span>
                <span className="text-[36px] sm:text-[42px] font-black text-green-bright leading-none tracking-tight">
                  <StatValue value={stat.value} />
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
              4.6 ⭐ · 8250+ reviews
            </div>
            <p className="text-[15px] text-text-grey italic leading-relaxed line-clamp-2">
              &ldquo;XOXO arranged a beautiful relaxing vacation to Maldives for me and my husband.
              The whole vacation was hustle free for us and the packages they offer are great.&rdquo;
            </p>
            <p className="text-green-neon text-sm font-semibold mt-3">Prameet Roy, Vietnam</p>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
