"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown, Phone } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { MotionDrawer } from "@/components/motion/MotionDrawer";

const NAV_LINKS = [
  { label: "Packages", href: "/packages" },
  { label: "Destinations", href: "/destinations" },
  { label: "Travel Match", href: "/match" },
  { label: "AI Concierge", href: "/concierge" },
  { label: "Transport Hub", href: "/transport" },
  { label: "Contact", href: "/contact" },
];

export function AuthTopBar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 flex h-14 items-center justify-between border-b border-[#EBEBEB] bg-white/95 px-4 backdrop-blur-md">
        <BrandLogo variant="navbar" priority />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-text-dark hover:bg-off-white"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      <MotionDrawer open={open} onClose={() => setOpen(false)}>
        <div className="flex items-center justify-between border-b border-[#EBEBEB] px-5 py-5">
          <span className="text-xl font-bold text-text-dark">Menu</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 hover:bg-off-white"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-between border-b border-[#EBEBEB] px-5 py-4 text-[15px] font-semibold text-text-dark transition-all hover:bg-off-white hover:pl-6"
            >
              {link.label}
              <ChevronDown className="h-4 w-4 rotate-[-90deg] text-text-grey" />
            </Link>
          ))}
        </nav>

        <div className="border-t border-[#EBEBEB] px-5 py-5">
          <a href="tel:+919240204872" className="mb-3 flex items-center gap-2 text-[15px] font-medium text-text-dark">
            <Phone className="h-4 w-4" /> +91 9240204872
          </a>
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="text-sm font-medium text-green-dark hover:underline"
          >
            Back to homepage
          </Link>
        </div>
      </MotionDrawer>
    </>
  );
}
