"use client";

import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchTrendingPackages } from "@/lib/home-inventory";
import { mapHomePackageCard, type HomePackageCard } from "@/lib/home-mappers";
import { FadeIn } from "@/components/motion/FadeIn";

const AVATAR_COLORS = ["#0C447C", "#F97316", "#22C55E", "#185FA5", "#9B59B6", "#E74C3C"];

export function TestimonialsSection() {
  const [items, setItems] = useState<HomePackageCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const items = await fetchTrendingPackages();
        if (cancelled) return;
        setItems(items.map(mapHomePackageCard));
      } catch (err) {
        console.error("[TestimonialsSection] Failed to load package social proof:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const doubled = items.length > 0 ? [...items, ...items] : [];

  return (
    <section id="testimonials" className="section bg-surface overflow-hidden">
      <div className="container-x mb-10">
        <FadeIn className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            What Our Travellers Say
          </h2>
          <p className="text-text-secondary mt-2">Top-rated trips from live production data</p>
        </FadeIn>
      </div>

      {loading ? (
        <div className="container-x flex gap-5 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="shrink-0 w-[320px] h-[200px] bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : doubled.length === 0 ? (
        <div className="container-x">
          <p className="text-sm text-text-grey text-center py-8 border border-dashed border-[#E0E0E0] rounded-2xl">
            No rated packages loaded from the API yet.
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="flex gap-5 animate-marquee w-max hover:[animation-play-state:paused] px-4">
            {doubled.map((pkg, i) => (
              <article
                key={`${pkg.id}-${i}`}
                className="shrink-0 w-[320px] sm:w-[380px] bg-white rounded-2xl p-6 shadow-premium border border-border/60"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className={`h-4 w-4 ${
                        j < Math.round(pkg.rating || 0)
                          ? "fill-orange text-orange"
                          : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed italic mb-6 line-clamp-4">
                  &ldquo;{pkg.title} — {pkg.reviewCount || 0}+ travellers booked this itinerary.&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                  >
                    {pkg.destination.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{pkg.destination}</p>
                    <p className="text-xs text-text-secondary">
                      {pkg.rating?.toFixed(1) || "—"} ★ · {pkg.duration}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
