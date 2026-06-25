"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { SAMPLE_ITINERARY } from "@/lib/home-data";
import { FadeIn } from "@/components/motion/FadeIn";

export function AIItineraryBanner() {
  const [typedText, setTypedText] = useState("");
  const fullText = "Day 1: Arrive in Bali, check into your villa...";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullText.length) {
        setTypedText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [fullText]);

  return (
    <section className="section hero-gradient overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="container-x relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <FadeIn direction="left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1.5 mb-5">
              <Sparkles className="h-4 w-4 text-orange" />
              <span className="text-sm font-medium text-white/90">Powered by Claude AI</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
              Plan Your Dream Trip in 30 Seconds
            </h2>
            <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-8 max-w-md">
              Tell our AI where you want to go — get a complete day-by-day plan with hidden gems, local food spots, and practical tips instantly.
            </p>
            <Link href="/concierge" className="btn-orange inline-flex animate-pulse-soft">
              <Sparkles className="h-4 w-4" />
              Try AI Planner — It&apos;s Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </FadeIn>

          <FadeIn direction="right" delay={0.2}>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="glass rounded-2xl p-6 shadow-glass max-w-md mx-auto lg:ml-auto"
            >
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                <div className="h-8 w-8 rounded-lg bg-orange/20 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-orange" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">AI Itinerary</p>
                  <p className="text-xs text-white/50">Bali · 6 Days · Couple</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {SAMPLE_ITINERARY.map((item) => (
                  <div key={item.day} className="bg-white/10 rounded-xl p-3">
                    <p className="text-xs font-bold text-orange mb-0.5">{item.day}</p>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-xs text-white/60 mt-0.5">{item.activity}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-white/50 font-mono border-t border-white/10 pt-3">
                {typedText}
                <span className="inline-block w-0.5 h-3.5 bg-orange ml-0.5 animate-pulse" />
              </p>
            </motion.div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
