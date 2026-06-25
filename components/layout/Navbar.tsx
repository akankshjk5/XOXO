"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, ChevronDown, Menu } from "lucide-react";
import { MobileDrawer } from "./MobileDrawer";
import { cn } from "@/lib/utils";

function Logo({ light = true }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-bright text-green-dark font-black text-sm">
        X&gt;
      </div>
      <span className={cn("text-lg font-bold tracking-tight", light ? "text-white" : "text-white")}>
        xoxo<span className="font-normal opacity-80">travels</span>
      </span>
    </Link>
  );
}

function SearchPill({
  className,
  compact = false,
  value,
  onChange,
  onSubmit,
}: {
  className?: string;
  compact?: boolean;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div
      className={cn(
        compact ? "pyt-search-glow-sm" : "pyt-search-glow",
        "flex items-center gap-3",
        compact ? "px-4 py-2.5" : "px-5 py-3.5",
        className
      )}
    >
      <Search className={cn("text-text-grey shrink-0", compact ? "h-4 w-4" : "h-5 w-5")} />
      <input
        type="text"
        placeholder="Search countries, cities"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        className={cn(
          "flex-1 bg-transparent outline-none text-text-dark placeholder:text-text-grey",
          compact ? "text-sm" : "text-[15px]"
        )}
      />
    </div>
  );
}

export function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    router.push(`/packages?${params.toString()}`);
  };

  return (
    <>
      {/* Top transparent nav */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled ? "opacity-0 pointer-events-none -translate-y-full" : "opacity-100"
        )}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-6">
            <button className="nav-link-white flex items-center gap-1">
              Explore Destinations <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </button>
            <button className="nav-link-white flex items-center gap-1">
              Holiday Tour Packages <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </button>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex px-5 py-2 rounded-full border border-white text-white text-[15px] font-medium hover:bg-white/10 transition-colors"
            >
              Login
            </Link>
            <button
              onClick={() => setDrawerOpen(true)}
              className="text-white p-2 text-2xl leading-none font-light"
              aria-label="Menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Sticky black nav after scroll */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-black-nav transition-all duration-300",
          scrolled ? "opacity-100 translate-y-0 shadow-lg" : "opacity-0 pointer-events-none -translate-y-full"
        )}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center gap-3 lg:gap-6">
          <p className="hidden lg:block shrink-0 text-white text-[15px] font-medium whitespace-nowrap">
            Create a <span className="script-text">Sooper Hit</span> holiday
          </p>
          <SearchPill
            compact
            className="flex-1 max-w-xl mx-auto"
            value={search}
            onChange={setSearch}
            onSubmit={handleSearch}
          />
          <div className="hidden md:block shrink-0 text-green-bright text-2xl select-none" aria-hidden>
            ↗
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden text-white p-1"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
