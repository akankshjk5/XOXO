"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play } from "lucide-react";
import { useIntroVideoAssets } from "@/hooks/useIntroVideoAssets";
import {
  INTRO_POSTER,
  hasPlayableSources,
  isMobileViewport,
  pickVariantSources,
} from "@/lib/intro-video";

interface IntroVideoProps {
  playing: boolean;
  loop: boolean;
  className?: string;
  onReady?: () => void;
  onAutoplayBlocked?: () => void;
}

function PosterBackground({
  poster,
  playing,
  className = "",
  kenBurns = false,
  onPosterReady,
}: {
  poster: string;
  playing: boolean;
  className?: string;
  kenBurns?: boolean;
  onPosterReady?: () => void;
}) {
  return (
    <div className={`absolute inset-0 z-0 overflow-hidden ${className}`}>
      <Image
        src={poster}
        alt=""
        fill
        priority
        sizes="100vw"
        className={`object-cover object-center transition-opacity duration-700 ${
          kenBurns ? "scale-105 animate-kenburns" : ""
        } ${playing && !kenBurns ? "opacity-0" : "opacity-100"}`}
        unoptimized={poster.endsWith(".svg")}
        onLoad={onPosterReady}
      />
      <div className="absolute inset-0 bg-black/45 pointer-events-none" />
    </div>
  );
}

export function IntroVideo({
  playing,
  loop,
  className = "",
  onReady,
  onAutoplayBlocked,
}: IntroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { assets, ready } = useIntroVideoAssets();
  const [variant, setVariant] = useState<"desktop" | "mobile">("desktop");
  const [useDesktopFallback, setUseDesktopFallback] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [forcePoster, setForcePoster] = useState(false);
  const readyFired = useRef(false);

  const poster = assets?.poster ?? INTRO_POSTER;

  const activeSources = useMemo(() => {
    if (!assets) return { webm: undefined, mp4: undefined };
    if (useDesktopFallback) return assets.desktop;
    return pickVariantSources(assets, variant);
  }, [assets, variant, useDesktopFallback]);

  const posterOnly =
    ready &&
    (forcePoster || !assets?.hasVideo || !hasPlayableSources(activeSources));

  useEffect(() => {
    setVariant(isMobileViewport() ? "mobile" : "desktop");
    setUseDesktopFallback(false);
    setLoaded(false);
  }, [assets]);

  const fireReady = useCallback(() => {
    if (readyFired.current) return;
    readyFired.current = true;
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    if (posterOnly) fireReady();
  }, [posterOnly, fireReady]);

  const tryPlay = useCallback(async () => {
    const el = videoRef.current;
    if (!el || posterOnly) return;
    try {
      el.muted = true;
      await el.play();
      setBlocked(false);
    } catch {
      setBlocked(true);
      onAutoplayBlocked?.();
    }
  }, [posterOnly, onAutoplayBlocked]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || posterOnly) return;
    el.loop = loop;
    if (playing) tryPlay();
    else el.pause();
  }, [playing, loop, posterOnly, tryPlay, activeSources]);

  const handleVideoError = () => {
    if (
      variant === "mobile" &&
      !useDesktopFallback &&
      assets &&
      hasPlayableSources(assets.desktop)
    ) {
      setUseDesktopFallback(true);
      setLoaded(false);
      return;
    }
    setForcePoster(true);
    fireReady();
  };

  if (!ready) {
    return (
      <PosterBackground
        poster={INTRO_POSTER}
        playing={playing}
        className={className}
        onPosterReady={fireReady}
      />
    );
  }

  if (posterOnly) {
    return (
      <PosterBackground
        poster={poster}
        playing={playing}
        className={className}
        kenBurns
        onPosterReady={fireReady}
      />
    );
  }

  return (
    <div className={`absolute inset-0 z-0 overflow-hidden ${className}`}>
      <Image
        src={poster}
        alt=""
        fill
        priority
        sizes="100vw"
        className={`object-cover object-center transition-opacity duration-700 ${
          loaded && playing ? "opacity-0" : "opacity-100"
        }`}
        unoptimized={poster.endsWith(".svg")}
      />

      <video
        key={`${variant}-${useDesktopFallback}-${activeSources.webm ?? ""}-${activeSources.mp4 ?? ""}`}
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover object-center transform-gpu"
        style={{ willChange: "opacity, transform" }}
        poster={poster}
        muted
        playsInline
        preload={playing ? "auto" : "metadata"}
        onLoadedData={() => {
          setLoaded(true);
          fireReady();
        }}
        onError={handleVideoError}
      >
        {activeSources.webm ? (
          <source src={activeSources.webm} type="video/webm" />
        ) : null}
        {activeSources.mp4 ? (
          <source src={activeSources.mp4} type="video/mp4" />
        ) : null}
      </video>

      <div className="absolute inset-0 bg-black/45 pointer-events-none" />

      {blocked && playing && (
        <button
          type="button"
          onClick={() => tryPlay()}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/30 backdrop-blur-[2px]"
          aria-label="Play brand film"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 border border-white/30 backdrop-blur-md">
            <Play className="h-7 w-7 text-white ml-1" fill="white" />
          </span>
          <span className="text-sm font-semibold text-white/90">Tap to play</span>
        </button>
      )}
    </div>
  );
}
