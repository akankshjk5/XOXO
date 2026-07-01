"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, ChevronDown, Menu, X, Phone, User, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { MotionDrawer } from "@/components/motion/MotionDrawer";
import { useIntro } from "@/context/IntroContext";
import { BrandLogo } from "@/components/brand/BrandLogo";

function Logo() {
  return <BrandLogo variant="navbar" priority />;
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
  const pathname = usePathname() || "";
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

  const isHome = pathname === "/";
  const onDarkHero = isHome && !scrolled && !introActive;
  const onLightBar = !onDarkHero && !scrolled && !introActive;
  const onDarkBar = scrolled && !introActive;
  const menuIconClass = onDarkHero || onDarkBar ? "text-white" : "text-[#0E5C43]";
  const navLinkClass = onDarkHero
    ? "nav-link-white"
    : "text-[#0E5C43] hover:text-green-dark";
  const bellVariant = onDarkHero || onDarkBar ? "light" : "dark";

  return (
    <>
      {/* ── Transparent nav (over hero) ── */}
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          introActive || scrolled ? "opacity-0 pointer-events-none -translate-y-2" : "opacity-100",
          onLightBar && "bg-white/95 backdrop-blur-md border-b border-[#EBEBEB] shadow-sm"
        )}
      >
        <div className="container-x h-16 flex items-center justify-between">
          <Logo />

          <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
            <Link href="/destinations" className={cn("flex items-center gap-1 px-3 py-2 rounded-lg transition-colors", navLinkClass, onDarkHero && "hover:bg-white/10")}>
              Destinations
            </Link>
            <Link href="/packages" className={cn("flex items-center gap-1 px-3 py-2 rounded-lg transition-colors", navLinkClass, onDarkHero && "hover:bg-white/10")}>
              Packages
            </Link>
            <Link href="/transport" className={cn("px-3 py-2 rounded-lg transition-colors", navLinkClass, onDarkHero && "hover:bg-white/10")}>
              Transport
            </Link>
            <Link href="/concierge" className={cn("px-3 py-2 rounded-lg transition-colors", navLinkClass, onDarkHero && "hover:bg-white/10")}>
              Concierge
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {user && <NotificationBell variant={bellVariant} />}
            {user ? (
              <Link
                href="/dashboard"
                className={cn(
                  "hidden sm:inline-flex items-center gap-2 text-sm font-medium",
                  onDarkHero ? "text-white hover:opacity-80" : "text-[#0E5C43] hover:text-green-dark"
                )}
              >
                <span className="h-8 w-8 rounded-full bg-green-bright text-green-dark flex items-center justify-center font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span>Hi, {user.name.split(" ")[0]}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className={cn(
                  "hidden sm:inline-flex",
                  onDarkHero ? "btn-login-outline" : "rounded-full border border-[#0E5C43] px-4 py-2 text-sm font-semibold text-[#0E5C43] hover:bg-[#0E5C43]/5"
                )}
              >
                Login
              </Link>
            )}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className={cn("p-1.5", menuIconClass)}
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
          <Logo />
          <p className="hidden xl:block shrink-0 text-white text-[15px] font-medium whitespace-nowrap">
            Create a <span className="script-text">Sooper Hit</span> holiday
          </p>

          <SearchPill
            compact
            value={search}
            onChange={setSearch}
            onSubmit={handleSearch}
            className="mx-auto w-full"
          />

          <div className="flex items-center gap-2 shrink-0">
            {user && <NotificationBell variant="light" />}
            {user ? (
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-white hover:opacity-90"
              >
                <span className="h-8 w-8 rounded-full bg-green-bright text-green-dark flex items-center justify-center font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden lg:inline">Hi, {user.name.split(" ")[0]}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Login
              </Link>
            )}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className={cn("p-1.5 shrink-0", menuIconClass)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
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
                  href="/admin"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-2 text-[15px] font-medium text-amber-700 py-2"
                >
                  <Shield className="h-4 w-4" /> Admin dashboard
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
            { label: "Transport Hub", href: "/transport" },
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
