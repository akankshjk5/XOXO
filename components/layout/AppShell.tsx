"use client";

import { PageTransition } from "@/components/motion/PageTransition";
import { MobileNav } from "@/components/layout/MobileNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageTransition>{children}</PageTransition>
      <MobileNav />
      <div className="h-[calc(56px+env(safe-area-inset-bottom))] md:hidden" aria-hidden />
    </>
  );
}
