"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AppShell } from "@/components/layout/AppShell";

const AUTH_ROUTES = ["/login", "/signup"];
const ADMIN_PREFIX = "/admin";

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isAdminRoute(pathname: string) {
  return pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);
}

export function RouteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";

  if (isAuthRoute(pathname)) {
    return <>{children}</>;
  }

  if (isAdminRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen outline-none" tabIndex={-1}>
        <AppShell>{children}</AppShell>
      </main>
      <Footer />
    </>
  );
}
