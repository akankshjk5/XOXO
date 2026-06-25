"use client";

import { Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/home-data";
import { FadeIn } from "@/components/motion/FadeIn";

export function TestimonialsSection() {
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section id="testimonials" className="section bg-surface overflow-hidden">
      <div className="container-x mb-10">
        <FadeIn className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            What Our Travellers Say
          </h2>
          <p className="text-text-secondary mt-2">Real stories from real adventurers</p>
        </FadeIn>
      </div>

      <div className="relative">
        <div className="flex gap-5 animate-marquee w-max hover:[animation-play-state:paused] px-4">
          {doubled.map((t, i) => (
            <article
              key={`${t.id}-${i}`}
              className="shrink-0 w-[320px] sm:w-[380px] bg-white rounded-2xl p-6 shadow-premium border border-border/60"
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-orange text-orange" />
                ))}
              </div>
              <p className="text-sm text-text-secondary leading-relaxed italic mb-6 line-clamp-4">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: t.color }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{t.name}</p>
                  <p className="text-xs text-text-secondary">{t.trip}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
