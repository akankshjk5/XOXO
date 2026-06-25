"use client";

import { useEffect, useState } from "react";
import { getReduceAnimationsPreference } from "@/lib/intro-storage";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReduced(mq.matches || getReduceAnimationsPreference());
    };
    update();
    mq.addEventListener("change", update);
    window.addEventListener("xoxo-experience-change", update);
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("xoxo-experience-change", update);
    };
  }, []);

  return reduced;
}

/** Notify hooks/components that experience prefs changed */
export function dispatchExperienceChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("xoxo-experience-change"));
  }
}
