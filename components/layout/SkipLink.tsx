"use client";

/** Keyboard skip link — bypasses cinematic hero / nav to main content */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-5 focus:py-2.5 focus:bg-white focus:text-green-dark focus:rounded-xl focus:shadow-elevated focus:font-semibold focus:outline-none focus:ring-2 focus:ring-green-bright"
    >
      Skip to main content
    </a>
  );
}
