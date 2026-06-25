"use client";

import Link from "next/link";
import { X, Phone } from "lucide-react";
import { DRAWER_MENU } from "@/lib/pyt-data";
import { cn } from "@/lib/utils";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-[2px] md:bg-black/40"
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 z-[90] w-full max-w-[320px] bg-white flex flex-col shadow-2xl",
          "animate-[drawer-slide_0.3s_ease-out]"
        )}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-[#EBEBEB]">
          <span className="text-xl font-bold text-text-dark">Hello, Guest</span>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-off-white transition-colors">
            <X className="h-5 w-5 text-text-dark" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          {DRAWER_MENU.map((item) => (
            <div key={item.label} className="border-b border-[#EBEBEB]">
              <Link
                href={item.href}
                onClick={onClose}
                className="flex items-center justify-between px-5 py-4 text-[15px] text-text-dark hover:bg-off-white hover:pl-6 transition-all"
              >
                {item.label}
              </Link>
            </div>
          ))}
        </nav>

        <div className="px-5 py-5 border-t border-[#EBEBEB]">
          <a href="tel:+919240204872" className="flex items-center gap-2 text-[15px] font-medium text-text-dark mb-4">
            <Phone className="h-4 w-4" />
            +91 9240204872
          </a>
          <div className="flex gap-3">
            {["WhatsApp", "Facebook", "X", "Instagram", "LinkedIn"].map((s) => (
              <span
                key={s}
                className="text-[11px] font-medium text-text-grey hover:text-green-dark cursor-pointer transition-colors"
              >
                {s === "WhatsApp" ? "💬" : s === "Facebook" ? "f" : s === "X" ? "𝕏" : s === "Instagram" ? "📷" : "in"}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
