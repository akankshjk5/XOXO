/**
 * Intro video configuration — drop files into `public/videos/` using these names.
 * Override filenames via `public/videos/intro.config.json` (optional).
 */

export const INTRO_VIDEO_BASE_PATH = "/videos";

/** Default filenames (no code changes needed when replacing files before launch) */
export const INTRO_VIDEO_FILES = {
  desktop: {
    webm: "intro.webm",
    mp4: "intro.mp4",
  },
  mobile: {
    webm: "intro-mobile.webm",
    mp4: "intro-mobile.mp4",
  },
} as const;

/** First match wins when probing the videos directory */
export const INTRO_POSTER_CANDIDATES = [
  "intro-poster.webp",
  "intro-poster.jpg",
  "intro-poster.jpeg",
  "intro-poster.png",
  "intro-poster.svg",
] as const;

export type IntroVideoVariant = "desktop" | "mobile";

export interface IntroVideoSourceSet {
  webm?: string;
  mp4?: string;
}

export interface ResolvedIntroAssets {
  desktop: IntroVideoSourceSet;
  mobile: IntroVideoSourceSet;
  poster: string;
  /** True when at least one MP4 or WebM file exists on disk */
  hasVideo: boolean;
}

export function toPublicVideoPath(filename: string): string {
  return `${INTRO_VIDEO_BASE_PATH}/${filename}`;
}

export function hasPlayableSources(sources: IntroVideoSourceSet): boolean {
  return Boolean(sources.webm || sources.mp4);
}
