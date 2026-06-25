import { access, readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import {
  INTRO_POSTER_CANDIDATES,
  INTRO_VIDEO_FILES,
  hasPlayableSources,
  toPublicVideoPath,
  type IntroVideoSourceSet,
  type IntroVideoVariant,
} from "@/lib/intro-video.config";

const VIDEOS_DIR = path.join(process.cwd(), "public", "videos");

type ConfigOverride = {
  desktop?: { webm?: string; mp4?: string };
  mobile?: { webm?: string; mp4?: string };
  poster?: string[];
};

async function existsInVideos(filename: string): Promise<boolean> {
  try {
    await access(path.join(VIDEOS_DIR, filename));
    return true;
  } catch {
    return false;
  }
}

async function loadConfigOverride(): Promise<ConfigOverride | null> {
  try {
    const raw = await readFile(path.join(VIDEOS_DIR, "intro.config.json"), "utf-8");
    return JSON.parse(raw) as ConfigOverride;
  } catch {
    return null;
  }
}

async function resolveVariant(
  variant: IntroVideoVariant,
  files: {
    desktop: { webm: string; mp4: string };
    mobile: { webm: string; mp4: string };
  }
): Promise<IntroVideoSourceSet> {
  const names = files[variant];
  const sources: IntroVideoSourceSet = {};

  if (names.webm && (await existsInVideos(names.webm))) {
    sources.webm = toPublicVideoPath(names.webm);
  }
  if (names.mp4 && (await existsInVideos(names.mp4))) {
    sources.mp4 = toPublicVideoPath(names.mp4);
  }

  return sources;
}

export async function GET() {
  const override = await loadConfigOverride();

  const files = {
    desktop: { ...INTRO_VIDEO_FILES.desktop, ...override?.desktop },
    mobile: { ...INTRO_VIDEO_FILES.mobile, ...override?.mobile },
  };

  const posterCandidates = override?.poster ?? [...INTRO_POSTER_CANDIDATES];
  let poster = toPublicVideoPath("intro-poster.svg");

  for (const name of posterCandidates) {
    if (await existsInVideos(name)) {
      poster = toPublicVideoPath(name);
      break;
    }
  }

  const [desktop, mobile] = await Promise.all([
    resolveVariant("desktop", files),
    resolveVariant("mobile", files),
  ]);

  const hasVideo = hasPlayableSources(desktop) || hasPlayableSources(mobile);

  return NextResponse.json(
    { desktop, mobile, poster, hasVideo },
    {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    }
  );
}
