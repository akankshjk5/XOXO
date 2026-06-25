"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Search, ChevronDown } from "lucide-react";
import { HERO_BG } from "@/lib/images";

function GoogleRating() {
  return (
    <div className="inline-flex items-center gap-2 text-white text-[13px] font-medium">
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white shrink-0">
        <span className="text-[11px] font-bold text-[#4285F4]">G</span>
      </div>
      <span>4.6</span>
      <span className="text-amber-300 text-sm">★</span>
      <span className="text-white/75">From 8250 reviews</span>
    </div>
  );
}

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.15 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export default function Hero() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    router.push(`/packages?${params.toString()}`);
  };

  // Magnetic pull on the search pill
  const handleMagnet = (e: React.MouseEvent) => {
    const el = searchRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    el.style.transform = `translate(${x * 0.08}px, ${y * 0.12}px)`;
  };
  const resetMagnet = () => {
    if (searchRef.current) searchRef.current.style.transform = "translate(0,0)";
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Full-bleed background photo with slow ken-burns */}
      <div className="absolute inset-0 z-0">
        <Image
          src={HERO_BG}
          alt="Scenic travel destination"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center animate-kenburns"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute bottom-0 inset-x-0 h-56 bg-gradient-to-t from-green-dark via-green-dark/60 to-transparent" />
      </div>

      {/* Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-3xl mx-auto pt-28 pb-36"
      >
        <motion.div variants={item}>
          <GoogleRating />
        </motion.div>

        <motion.div variants={item} className="w-10 h-[2px] bg-white/50 my-6" />

        <motion.h1 variants={item} className="hero-heading mb-12 px-2">
          Create Your Sooper Hit Holiday
        </motion.h1>

        <motion.div
          variants={item}
          ref={searchRef}
          onMouseMove={handleMagnet}
          onMouseLeave={resetMagnet}
          className="pyt-search-glow mx-auto magnetic"
        >
          <Search className="h-5 w-5 text-text-grey shrink-0" />
          <input
            type="text"
            placeholder="Search countries, cities"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pyt-search-input"
          />
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: window.innerHeight - 60, behavior: "smooth" })}
        aria-label="Scroll to next section"
        className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50 hover:text-white z-10 transition-colors"
      >
        <ChevronDown className="h-5 w-5 animate-scroll-bounce" />
      </button>

      {/* Curve into next section */}
      <div className="absolute bottom-0 inset-x-0 h-10 bg-green-dark rounded-t-[40px]" />
    </section>
  );
}
