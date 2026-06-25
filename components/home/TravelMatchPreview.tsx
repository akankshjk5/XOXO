"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Heart, Sparkles } from "lucide-react";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { FloatingCard } from "@/components/motion/AnimatedCard";
import { AnimatedButton } from "@/components/motion/AnimatedButton";

const MATCH_PROFILES = [
  {
    name: "Priya",
    dest: "Bali",
    match: 94,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
  },
  {
    name: "Arjun",
    dest: "Thailand",
    match: 88,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  },
  {
    name: "Sneha",
    dest: "Maldives",
    match: 91,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
  },
];

export function TravelMatchPreview() {
  const router = useRouter();

  return (
    <section className="section relative overflow-hidden bg-gradient-to-br from-green-dark via-[#0a2e24] to-green-mid text-white">
      <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(74,222,128,0.25),transparent_50%)]" />
      <div className="container-x relative">
        <RevealOnScroll className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold mb-4">
              <Sparkles className="h-3.5 w-3.5 text-green-bright" />
              Solo Traveler Matchmaking
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4 leading-tight">
              Find Your Perfect
              <br />
              <span className="text-green-bright">Travel Companion</span>
            </h2>
            <p className="text-white/70 text-[15px] leading-relaxed max-w-md mb-8">
              Match with verified solo travellers heading to the same destination. Share adventures,
              split costs, and make memories together.
            </p>
            <AnimatedButton
              variant="primary"
              className="bg-green-bright text-green-dark hover:bg-white"
              onClick={() => router.push("/match")}
            >
              Start Matching <ArrowRight className="h-4 w-4" />
            </AnimatedButton>
          </div>

          <div className="flex flex-col gap-4">
            {MATCH_PROFILES.map((p, i) => (
              <FloatingCard key={p.name}>
                <RevealOnScroll delay={i * 0.1}>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:bg-white/15 transition-colors">
                    <div className="relative h-14 w-14 rounded-full overflow-hidden ring-2 ring-green-bright/50 shrink-0">
                      <Image src={p.image} alt={p.name} fill sizes="56px" className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white">{p.name}</p>
                      <p className="text-sm text-white/60">Heading to {p.dest}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-black text-green-bright">{p.match}%</p>
                      <p className="text-[10px] text-white/50 uppercase tracking-wide flex items-center gap-0.5 justify-end">
                        <Heart className="h-3 w-3" /> match
                      </p>
                    </div>
                  </div>
                </RevealOnScroll>
              </FloatingCard>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
