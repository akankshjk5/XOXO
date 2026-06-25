"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, ChevronDown, Menu, X, Phone, User, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { MotionDrawer } from "@/components/motion/MotionDrawer";
import { useIntro } from "@/context/IntroContext";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-bright text-green-dark font-black text-xs">
        X&gt;
      </div>
      <span className="text-[17px] font-bold text-white tracking-tight">
        xoxo<span className="font-normal text-white/90">travels</span>
      </span>
    </Link>
  );
}

function SearchPill({
  compact = false,
  value,
  onChange,
  onSubmit,
  className,
}: {
  compact?: boolean;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  className?: string;
}) {
  return (
    <div className={cn(compact ? "pyt-search-glow-sm" : "pyt-search-glow", className)}>
      <Search className={cn("text-text-grey shrink-0", compact ? "h-4 w-4" : "h-5 w-5")} />
      <input
        type="text"
        placeholder="Search countries, cities"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        className={cn("pyt-search-input", compact && "text-sm")}
      />
    </div>
  );
}

export default function Navbar() {
  const router = useRouter();
  const { introActive } = useIntro();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleLogout = async () => {
    await logout();
    setDrawerOpen(false);
    toast.success("Signed out");
    router.push("/");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.55);
    onScroll();
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
      {/* ── Transparent nav (over hero) ── */}
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          introActive || scrolled ? "opacity-0 pointer-events-none -translate-y-2" : "opacity-100"
        )}
      >
        <div className="container-x h-[68px] flex items-center justify-between">
          <Logo />

          <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
            <Link href="/destinations" className="nav-link-white flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
              Destinations
            </Link>
            <Link href="/packages" className="nav-link-white flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
              Packages
            </Link>
            <Link href="/concierge" className="nav-link-white px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
              Concierge
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {user && <NotificationBell />}
            {user ? (
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-2 text-white text-sm font-medium hover:opacity-80"
              >
                <span className="h-8 w-8 rounded-full bg-green-bright text-green-dark flex items-center justify-center font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span>Hi, {user.name.split(" ")[0]}</span>
              </Link>
            ) : (
              <Link href="/login" className="btn-login-outline hidden sm:inline-flex">
                Login
              </Link>
            )}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="text-white p-1.5"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Sticky black nav (after scroll) ── */}
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 bg-black-nav transition-all duration-300",
          scrolled && !introActive ? "opacity-100 translate-y-0 shadow-lg" : "opacity-0 pointer-events-none -translate-y-full"
        )}
      >
        <div className="container-x h-16 flex items-center gap-3 lg:gap-5">
          <p className="hidden lg:block shrink-0 text-white text-[15px] font-medium whitespace-nowrap">
            Create a <span className="script-text">Sooper Hit</span> holiday
          </p>

          <SearchPill
            compact
            value={search}
            onChange={setSearch}
            onSubmit={handleSearch}
            className="mx-auto w-full"
          />

          <span className="hidden md:block shrink-0 text-green-bright text-xl select-none" aria-hidden>
            ↗
          </span>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="md:hidden text-white p-1 shrink-0"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <MotionDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-[#EBEBEB]">
          <span className="text-xl font-bold text-text-dark">
            {user ? `Hello, ${user.name.split(" ")[0]}` : "Hello, Guest"}
          </span>
          <button type="button" onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-lg hover:bg-off-white" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-[#EBEBEB] flex flex-col gap-2">
          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-2 text-[15px] font-medium text-text-dark py-2"
              >
                <LayoutDashboard className="h-4 w-4" /> My Dashboard
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin/verification"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-2 text-[15px] font-medium text-amber-700 py-2"
                >
                  <Shield className="h-4 w-4" /> Verification queue
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-[15px] font-medium text-red-500 py-2"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-2 text-[15px] font-medium text-green-dark py-2"
            >
              <User className="h-4 w-4" /> Login / Sign up
            </Link>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto">
          {[
            { label: "Packages", href: "/packages" },
            { label: "Destinations", href: "/destinations" },
            { label: "Travel Match", href: "/match" },
            { label: "Nearby", href: "/nearby" },
            { label: "Group Trips", href: "/groups" },
            { label: "Community Feed", href: "/community" },
            { label: "Friends", href: "/friends" },
            { label: "Get Verified", href: "/verify" },
            { label: "Local Guides", href: "/guides" },
            { label: "Messages", href: "/chat" },
            { label: "AI Concierge", href: "/concierge" },
            { label: "Visa Assistant", href: "/visa" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setDrawerOpen(false)}
              className="flex items-center justify-between w-full px-5 py-4 text-[15px] font-semibold text-text-dark border-b border-[#EBEBEB] hover:bg-off-white hover:pl-6 transition-all"
            >
              {link.label}
              <ChevronDown className="h-4 w-4 text-text-grey rotate-[-90deg]" />
            </Link>
          ))}
        </nav>

        <div className="px-5 py-5 border-t border-[#EBEBEB]">
          <a href="tel:+919240204872" className="flex items-center gap-2 text-[15px] font-medium text-text-dark mb-3">
            <Phone className="h-4 w-4" /> +91 9240204872
          </a>
        </div>
      </MotionDrawer>
    </>
  );
}
