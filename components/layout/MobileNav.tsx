"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Compass, Users, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/packages", label: "Explore", icon: Compass },
  { href: "/match", label: "Match", icon: Users },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/dashboard", label: "Profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-[#EBEBEB]/80 bg-white/90 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch min-h-[56px]">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 touch-target transition-colors",
                isActive ? "text-green-dark" : "text-text-grey"
              )}
            >
              {isActive && !reduced && (
                <motion.span
                  layoutId="mobile-nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-green-neon"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <motion.span whileTap={reduced ? undefined : { scale: 0.88 }}>
                <Icon className={cn("h-[22px] w-[22px]", isActive && "stroke-[2.5]")} />
              </motion.span>
              <span className="text-[10px] font-semibold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
