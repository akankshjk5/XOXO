"use client";

import { useEffect, useState } from "react";
import { fetchIntroVideoAssets, type ResolvedIntroAssets } from "@/lib/intro-video";

export function useIntroVideoAssets() {
  const [assets, setAssets] = useState<ResolvedIntroAssets | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;

    fetchIntroVideoAssets()
      .then((resolved) => {
        if (alive) {
          setAssets(resolved);
          setReady(true);
        }
      })
      .catch(() => {
        if (alive) setReady(true);
      });

    return () => {
      alive = false;
    };
  }, []);

  return { assets, ready };
}
