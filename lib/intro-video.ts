import {
  INTRO_POSTER_CANDIDATES,
  INTRO_VIDEO_FILES,
  type IntroVideoSourceSet,
  type IntroVideoVariant,
  type ResolvedIntroAssets,
  hasPlayableSources,
  toPublicVideoPath,
} from "@/lib/intro-video.config";

export * from "@/lib/intro-video.config";

/** @deprecated Use ResolvedIntroAssets from API — kept for compatibility */
export const INTRO_POSTER = toPublicVideoPath(INTRO_POSTER_CANDIDATES[INTRO_POSTER_CANDIDATES.length - 1]);

let assetCache: Promise<ResolvedIntroAssets> | null = null;

/** Clear cached asset resolution (e.g. after dropping new files in dev) */
export function resetIntroVideoAssetCache(): void {
  assetCache = null;
}

async function probeUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

async function resolveSourcesFromFilenames(
  webmName: string,
  mp4Name: string
): Promise<IntroVideoSourceSet> {
  const sources: IntroVideoSourceSet = {};
  const webmUrl = toPublicVideoPath(webmName);
  const mp4Url = toPublicVideoPath(mp4Name);

  if (await probeUrl(webmUrl)) sources.webm = webmUrl;
  if (await probeUrl(mp4Url)) sources.mp4 = mp4Url;

  return sources;
}

async function resolvePosterClient(): Promise<string> {
  for (const name of INTRO_POSTER_CANDIDATES) {
    const url = toPublicVideoPath(name);
    if (await probeUrl(url)) return url;
  }
  return INTRO_POSTER;
}

/** Client-side fallback when the API route is unavailable */
async function probeIntroVideoAssetsClient(): Promise<ResolvedIntroAssets> {
  const [desktop, mobile, poster] = await Promise.all([
    resolveSourcesFromFilenames(INTRO_VIDEO_FILES.desktop.webm, INTRO_VIDEO_FILES.desktop.mp4),
    resolveSourcesFromFilenames(INTRO_VIDEO_FILES.mobile.webm, INTRO_VIDEO_FILES.mobile.mp4),
    resolvePosterClient(),
  ]);

  const hasVideo =
    hasPlayableSources(desktop) ||
    hasPlayableSources(mobile);

  return { desktop, mobile, poster, hasVideo };
}

/** Resolve which video/poster files exist under `/public/videos` */
export async function fetchIntroVideoAssets(): Promise<ResolvedIntroAssets> {
  if (!assetCache) {
    assetCache = (async () => {
      try {
        const res = await fetch("/api/intro-videos", { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as ResolvedIntroAssets;
          return data;
        }
      } catch {
        /* fall through to client probe */
      }
      return probeIntroVideoAssetsClient();
    })();
  }
  return assetCache;
}

/** Prefer WebM when the browser supports it, otherwise MP4 */
export function pickIntroVideoSrc(sources: IntroVideoSourceSet): string | null {
  if (!hasPlayableSources(sources)) return null;
  if (typeof document === "undefined") {
    return sources.mp4 ?? sources.webm ?? null;
  }
  const v = document.createElement("video");
  if (
    sources.webm &&
    (v.canPlayType('video/webm; codecs="vp9"') || v.canPlayType("video/webm"))
  ) {
    return sources.webm;
  }
  return sources.mp4 ?? sources.webm ?? null;
}

/** Pick the best source set for a viewport variant (mobile → desktop fallback) */
export function pickVariantSources(
  assets: ResolvedIntroAssets,
  variant: IntroVideoVariant
): IntroVideoSourceSet {
  const primary = variant === "mobile" ? assets.mobile : assets.desktop;
  if (hasPlayableSources(primary)) return primary;
  return assets.desktop;
}

/** @deprecated Use fetchIntroVideoAssets — kept for any legacy imports */
export function getIntroVideoSources(variant: IntroVideoVariant = "desktop") {
  const names = INTRO_VIDEO_FILES[variant];
  return {
    webm: toPublicVideoPath(names.webm),
    mp4: toPublicVideoPath(names.mp4),
    poster: INTRO_POSTER,
  };
}

export function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 768px)").matches;
}
