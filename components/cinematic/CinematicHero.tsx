"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { Search, ChevronDown } from "lucide-react";
import { destinationsAPI } from "@/lib/api";
import { buildDestinationHref } from "@/lib/destination-url";
import { HERO_BG } from "@/lib/images";
import { markIntroSeen, shouldShowIntro } from "@/lib/intro-storage";
import { INTRO_TAGLINE, INTRO_TIMELINE, INTRO_DURATION_MS } from "@/lib/intro-timeline";
import { useIntro } from "@/context/IntroContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { AuroraOverlay } from "@/components/cinematic/AuroraOverlay";
import { FloatingTravelElements } from "@/components/cinematic/FloatingTravelElements";
import { IntroVideo } from "@/components/cinematic/IntroVideo";
import { EASE_OUT } from "@/lib/motion";
import { BrandLogo } from "@/components/brand/BrandLogo";

type Phase = "intro" | "transition" | "hero";

const T = INTRO_TIMELINE;

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

export function CinematicHero() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const { setIntroActive, replayToken } = useIntro();
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<{ name: string; slug: string; country?: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [playIntro, setPlayIntro] = useState(false);
  const [phase, setPhase] = useState<Phase>("hero");
  const [mounted, setMounted] = useState(false);
  const [interactive, setInteractive] = useState(true);
  const [useVideo, setUseVideo] = useState(false);
  const [pinsVisible, setPinsVisible] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const bgX = useTransform(mouseX, [-0.5, 0.5], [-12, 12]);
  const bgY = useTransform(mouseY, [-0.5, 0.5], [-8, 8]);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const completeIntro = useCallback(() => {
    setPhase("hero");
    setPlayIntro(false);
    setUseVideo(false);
    setInteractive(true);
    setPinsVisible(false);
    setIntroActive(false);
    markIntroSeen();
  }, [setIntroActive]);

  const skipIntro = useCallback(() => {
    completeIntro();
  }, [completeIntro]);

  const startIntro = useCallback(() => {
    if (reduced) {
      setPhase("hero");
      setIntroActive(false);
      return;
    }
    setPlayIntro(true);
    setUseVideo(true);
    setPhase("intro");
    setInteractive(false);
    setPinsVisible(false);
    setIntroActive(true);

    const pinsTimer = setTimeout(() => setPinsVisible(true), T.destinationPins * 1000);
    const interactiveTimer = setTimeout(() => setInteractive(true), T.interactive * 1000);
    const endTimer = setTimeout(() => {
      setPhase("transition");
      setTimeout(completeIntro, 500);
    }, INTRO_DURATION_MS);

    return () => {
      clearTimeout(pinsTimer);
      clearTimeout(interactiveTimer);
      clearTimeout(endTimer);
    };
  }, [reduced, setIntroActive, completeIntro]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (shouldShowIntro()) {
      const cleanup = startIntro();
      return cleanup;
    }
    setPhase("hero");
    setIntroActive(false);
  }, [mounted, replayToken, reduced, setIntroActive, startIntro]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (reduced) return;
    const { clientX, clientY, currentTarget } = e;
    const rect = currentTarget.getBoundingClientRect();
    mouseX.set((clientX - rect.left) / rect.width - 0.5);
    mouseY.set((clientY - rect.top) / rect.height - 0.5);
    setMouse({
      x: ((clientX - rect.left) / rect.width - 0.5) * 40,
      y: ((clientY - rect.top) / rect.height - 0.5) * 24,
    });
  };

  const handleSearch = (slug?: string) => {
    if (slug) {
      router.push(buildDestinationHref(slug));
      setShowSuggestions(false);
      return;
    }
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    router.push(`/packages?${params.toString()}`);
    setShowSuggestions(false);
  };

  useEffect(() => {
    if (search.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await destinationsAPI.autocomplete(search.trim());
        setSuggestions(data.data || []);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleMagnet = (e: React.MouseEvent) => {
    const el = searchRef.current;
    if (!el || reduced) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    el.style.transform = `translate(${x * 0.08}px, ${y * 0.12}px)`;
  };

  const resetMagnet = () => {
    if (searchRef.current) searchRef.current.style.transform = "translate(0,0)";
  };

  const showIntroUI = mounted && playIntro && phase !== "hero";
  const showHeroContent = phase === "hero" || phase === "transition";

  return (
    <section
      className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Background layer — video during intro, image for hero continuation */}
      <div className="absolute inset-0 z-0">
        {useVideo && playIntro ? (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "transition" ? 0 : 1 }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
          >
            <IntroVideo playing={phase === "intro"} loop={phase === "intro"} />
          </motion.div>
        ) : null}

        <motion.div
          className="absolute inset-0"
          style={{ x: bgX, y: bgY }}
          initial={false}
          animate={{ opacity: useVideo && playIntro && phase === "intro" ? 0 : 1 }}
          transition={{ duration: 0.9, ease: EASE_OUT, delay: phase === "hero" ? 0 : 0.2 }}
        >
          <Image
            src={HERO_BG}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center scale-110 animate-kenburns"
          />
        </motion.div>

        <motion.div
          className="absolute inset-0 bg-black/40"
          initial={false}
          animate={{ opacity: showIntroUI ? 0.55 : 0.4 }}
          transition={{ duration: 0.8 }}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showIntroUI ? 1 : 0.35 }}
          transition={{ duration: 0.9, delay: showIntroUI ? T.aurora : 0, ease: EASE_OUT }}
          className="absolute inset-0"
        >
          <AuroraOverlay intensity={showIntroUI ? "vivid" : "subtle"} />
        </motion.div>

        <div className="absolute bottom-0 inset-x-0 h-56 bg-gradient-to-t from-green-dark via-green-dark/70 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.35)_100%)]" />
      </div>

      <FloatingTravelElements
        visible={showIntroUI}
        showPins={pinsVisible}
        parallaxX={mouse.x}
        parallaxY={mouse.y}
      />

      <AnimatePresence>
        {showIntroUI && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.3, duration: 0.35 }}
            onClick={skipIntro}
            className="absolute top-24 right-4 sm:right-8 z-30 px-4 py-2 rounded-full text-xs font-semibold text-white/80 border border-white/25 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:text-white transition-colors touch-target"
          >
            Skip intro
          </motion.button>
        )}
      </AnimatePresence>

      {/* Brand film timeline layer */}
      <AnimatePresence mode="wait">
        {showIntroUI && (
          <motion.div
            key="intro-brand"
            className="relative z-20 flex flex-col items-center text-center px-4 w-full max-w-4xl mx-auto pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "transition" ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          >
            <motion.div
              className="mb-6 transform-gpu"
              initial={{ opacity: 0, scale: 0.6, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.75, ease: EASE_OUT, delay: T.logo }}
            >
              <BrandLogo variant="intro" href="/" className="mx-auto brightness-110 drop-shadow-[0_8px_32px_rgba(0,0,0,0.35)]" priority />
            </motion.div>

            <motion.p
              className="text-lg sm:text-xl text-white/85 font-semibold tracking-wide"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: EASE_OUT, delay: T.tagline }}
            >
              {INTRO_TAGLINE}
            </motion.p>

            <motion.div
              className={`mt-10 w-full max-w-md rounded-full border border-white/30 bg-white/10 backdrop-blur-xl px-6 py-3.5 flex items-center gap-3 shadow-[0_8px_40px_rgba(0,0,0,0.25)] transform-gpu ${
                interactive ? "pointer-events-auto" : "pointer-events-none"
              }`}
              initial={{ opacity: 0, y: 28, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: EASE_OUT, delay: T.searchBar }}
            >
              <Search className="h-5 w-5 text-green-bright shrink-0" />
              <input
                type="text"
                placeholder="Where will you go next?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                disabled={!interactive}
                tabIndex={interactive ? 0 : -1}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/50 outline-none min-w-0"
                aria-label="Search destinations during intro"
              />
              <motion.span
                className="h-2 w-2 rounded-full bg-green-bright shrink-0"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Homepage hero — seamless continuation */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-3xl mx-auto pt-28 pb-36"
        initial={false}
        animate={{
          opacity: showHeroContent ? 1 : 0,
          y: showHeroContent ? 0 : 20,
        }}
        transition={{ duration: reduced ? 0 : 0.75, ease: EASE_OUT }}
      >
        {showHeroContent && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.05, ease: EASE_OUT }}
            >
              <GoogleRating />
            </motion.div>

            <motion.div
              className="w-10 h-[2px] bg-white/50 my-6"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.12, ease: EASE_OUT }}
            />

            <motion.h2
              className="hero-heading mb-12 px-2"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18, ease: EASE_OUT }}
            >
              Create Your Sooper Hit Holiday
            </motion.h2>

            <motion.div
              ref={searchRef}
              onMouseMove={handleMagnet}
              onMouseLeave={resetMagnet}
              className="pyt-search-glow mx-auto magnetic transform-gpu relative"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.28, ease: EASE_OUT }}
            >
              <Search className="h-5 w-5 text-text-grey shrink-0" />
              <input
                type="text"
                placeholder="Search countries, cities"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pyt-search-input"
                aria-label="Search destinations"
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-xl shadow-lg border border-[#EBEBEB] overflow-hidden text-left">
                  {suggestions.map((s) => (
                    <li key={s.slug}>
                      <button
                        type="button"
                        className="w-full px-4 py-3 text-sm text-left hover:bg-off-white text-text-dark"
                        onMouseDown={() => handleSearch(s.slug)}
                      >
                        {s.name}
                        {s.country ? <span className="text-text-grey"> · {s.country}</span> : null}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </>
        )}
      </motion.div>

      <motion.button
        type="button"
        onClick={() => window.scrollTo({ top: window.innerHeight - 60, behavior: "smooth" })}
        aria-label="Scroll to explore"
        className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 hover:text-white z-10 transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: showHeroContent ? 1 : 0 }}
        transition={{ delay: showHeroContent ? 0.4 : 0, duration: 0.5 }}
      >
        <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Explore</span>
        <ChevronDown className="h-5 w-5 animate-scroll-bounce" />
      </motion.button>

      <div className="absolute bottom-0 inset-x-0 h-10 bg-green-dark rounded-t-[40px] z-10" />
    </section>
  );
}
