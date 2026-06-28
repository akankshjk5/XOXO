"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { useIntro } from "@/context/IntroContext";
import { clearIntroSeen, requestIntroReplay } from "@/lib/intro-storage";

const LINKS = [
  { label: "Packages", href: "/packages" },
  { label: "Destinations", href: "/destinations" },
  { label: "Transport Hub", href: "/transport" },
  { label: "AI Concierge", href: "/concierge" },
  { label: "Community", href: "/community" },
  { label: "Visa", href: "/visa" },
];

export function Footer() {
  const router = useRouter();
  const { replayIntro } = useIntro();

  const handleReplayFilm = () => {
    clearIntroSeen();
    requestIntroReplay();
    replayIntro();
    router.push("/");
  };

  return (
    <footer className="relative bg-green-dark text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-mid/50 via-transparent to-black/30 pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-green-bright/40 to-transparent" />
      <div className="container-x relative py-16 md:py-20">
        <RevealOnScroll className="flex flex-col md:flex-row md:items-start md:justify-between gap-12">
          <div className="text-center md:text-left">
            <Link href="/" className="inline-flex items-center gap-3 mb-5 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-bright text-green-dark font-black text-sm shadow-[0_0_24px_rgba(74,222,128,0.35)] group-hover:shadow-[0_0_32px_rgba(74,222,128,0.5)] transition-shadow">
                X&gt;
              </div>
              <span className="brand-name text-2xl tracking-tight">
                xoxo<span className="font-normal opacity-80">travels</span>
              </span>
            </Link>
            <p className="text-sm text-white/60 max-w-sm leading-relaxed">
              Custom international holidays for Indian travellers — book, plan, and explore together.
            </p>
            <p className="mt-4 text-xs text-white/40 font-medium tracking-wide uppercase">
              Trusted by 2 Lakh+ travellers
            </p>
          </div>

          <nav className="flex flex-wrap justify-center md:justify-end gap-x-10 gap-y-4">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-semibold text-white/70 hover:text-green-bright transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </RevealOnScroll>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} XOXO Travels · Made with care in India
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
            <Link href="/settings/experience" className="text-white/50 hover:text-green-bright transition-colors">
              Experience settings
            </Link>
            <button
              type="button"
              onClick={handleReplayFilm}
              className="text-white/50 hover:text-green-bright transition-colors"
            >
              Replay brand film
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
