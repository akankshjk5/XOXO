# XOXO Travels — Cinematic Brand Film Experience

_Premium first-visit cinematic intro · seamless homepage handoff_

---

## Overview

The brand film is **not a loading screen**. It is a full-screen cinematic experience that plays on first visit (or when replayed), then transitions into the homepage hero without a page reload. The hero is a visual continuation of the intro.

**Tagline:** `Book. Meet. Travel.`  
**Duration:** 5.5 seconds to hero handoff

---

## File Locations

| File | Purpose |
|---|---|
| `public/videos/intro.mp4` | Desktop H.264 video |
| `public/videos/intro.webm` | Desktop VP9 video (preferred when supported) |
| `public/videos/intro-mobile.mp4` | Mobile H.264 (optional) |
| `public/videos/intro-mobile.webm` | Mobile VP9 (optional) |
| `public/videos/intro-poster.svg` | Poster while video loads |
| `components/cinematic/CinematicHero.tsx` | Orchestrates timeline + hero |
| `components/cinematic/IntroVideo.tsx` | Video player, autoplay, fallback |
| `components/cinematic/AuroraOverlay.tsx` | Aurora glow layer |
| `components/cinematic/FloatingTravelElements.tsx` | Icons + destination pins |
| `lib/intro-timeline.ts` | Timeline constants (seconds) |
| `lib/intro-storage.ts` | localStorage / session preferences |
| `lib/intro-video.config.ts` | Default filenames + poster candidates |
| `lib/intro-video.ts` | Client resolver + format selection |
| `app/api/intro-videos/route.ts` | Server-side file discovery |
| `public/videos/intro.config.json` | Optional filename overrides |
| `components/settings/ExperienceSettings.tsx` | User controls |
| `app/settings/experience/page.tsx` | Settings → Experience page |
| `context/IntroContext.tsx` | Intro active state + replay |

---

## Timeline

| Time | Event |
|---|---|
| **0.0s** | Full-screen video fades in; dark ambient overlay |
| **0.5s** | Aurora glow appears |
| **1.0s** | XOXO logo reveals |
| **2.0s** | Tagline: "Book. Meet. Travel." |
| **3.0s** | Search bar animates in |
| **3.5s** | Floating destination pins (Bali, Maldives, Dubai) |
| **4.5s** | Intro search becomes interactive |
| **5.5s** | Crossfade to homepage hero (no reload) |

Implemented with **Framer Motion** using `opacity` and `transform` only (GPU-friendly).

---

## Configurable video loading

Videos are **not hard-coded at build time**. At runtime the app scans `public/videos/` and only mounts `<source>` elements for files that exist.

### Drop-in workflow (launch)

1. Place `intro.mp4` and/or `intro.webm` in `public/videos/`
2. Optionally add `intro-mobile.*` and `intro-poster.webp`
3. Deploy — playback starts automatically on the next visit

No component or timeline changes are needed.

### API

`GET /api/intro-videos` returns:

```json
{
  "desktop": { "webm": "/videos/intro.webm", "mp4": "/videos/intro.mp4" },
  "mobile": { "webm": "/videos/intro-mobile.webm" },
  "poster": "/videos/intro-poster.svg",
  "hasVideo": true
}
```

Missing keys are omitted. `hasVideo: false` when no MP4/WebM files are present.

### Poster-only mode

When `hasVideo` is false (or playback fails):

- Poster image fills the viewport (Ken Burns subtle motion)
- Full Framer Motion timeline runs unchanged
- Skip, replay, first-visit, and hero transition behave identically
- No console errors or thrown exceptions

### Optional `intro.config.json`

Copy `public/videos/intro.config.json.example` to `intro.config.json` to use custom filenames:

```json
{
  "desktop": { "webm": "brand-film.webm", "mp4": "brand-film.mp4" },
  "poster": ["intro-poster.webp", "intro-poster.svg"]
}
```

Defaults live in `lib/intro-video.config.ts`.

---

### Desktop

| Property | Recommendation |
|---|---|
| Resolution | 1920 × 1080 (16:9) |
| Duration | 6–8 seconds (loops until 5.5s handoff) |
| Frame rate | 24 or 30 fps |
| MP4 codec | H.264, High profile |
| WebM codec | VP9 |
| Target file size | **< 3 MB** (MP4), **< 2 MB** (WebM) |
| Audio | None (muted autoplay) |

### Mobile (`intro-mobile.*`)

| Property | Recommendation |
|---|---|
| Resolution | 1080 × 1920 (9:16) or 720 × 1280 |
| Target file size | **< 1.5 MB** each |
| Content | Crop for vertical safe zone (logo area top/center) |

### Compression (FFmpeg examples)

**Desktop MP4:**
```bash
ffmpeg -i source.mov -an -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -preset slow -crf 23 -movflags +faststart public/videos/intro.mp4
```

**Desktop WebM:**
```bash
ffmpeg -i source.mov -an -vf "scale=1920:1080" -c:v libvpx-vp9 -crf 35 -b:v 0 public/videos/intro.webm
```

**Mobile MP4:**
```bash
ffmpeg -i source.mov -an -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" -c:v libx264 -preset slow -crf 24 -movflags +faststart public/videos/intro-mobile.mp4
```

**Poster WebP (optional):**
```bash
ffmpeg -i source.mov -vframes 1 -q:v 2 public/videos/intro-poster.webp
```

---

## Features

| Feature | Implementation |
|---|---|
| Skip intro | Button top-right during film |
| First visit only | `localStorage` `xoxo_intro_seen` + 30-day expiry |
| Disable intro | Settings → Experience toggle |
| Replay | Footer link, Settings, or `replayIntro()` context |
| Reduced motion | `prefers-reduced-motion` + user setting |
| Autoplay blocked | Poster + tap-to-play overlay |
| No video files | Poster + hero image Ken Burns fallback |
| Format selection | WebM if supported, else MP4 |
| Mobile variant | `intro-mobile.*` on viewports ≤ 768px |

---

## User Settings

**Path:** `/settings/experience`

| Setting | Storage key |
|---|---|
| Disable brand film | `xoxo_intro_disabled` |
| Reduce animations | `xoxo_reduce_animations` |
| Replay (once) | `sessionStorage` `xoxo_intro_replay` |

Footer links: **Experience settings** · **Replay brand film**

---

## Performance Considerations

### Targets

- **No layout shift** — poster fills viewport before video decodes
- **60 FPS** — opacity/transform only; `transform-gpu` on animated layers
- **Lighthouse Performance > 90** — after video compression + lazy preload

### Optimizations applied

| Technique | Detail |
|---|---|
| Lazy video load | `preload="none"` until intro plays; `metadata` otherwise |
| Poster first | SVG/WebP shown until `onLoadedData` |
| Video only during intro | Unmounted after handoff; static hero image persists |
| Mobile/desktop assets | Separate files reduce mobile bandwidth |
| Below-fold unchanged | Homepage sections still code-split |
| No page reload | Single React tree; phase state machine |

### Lighthouse tips

1. Keep MP4 **under 3 MB** — video is largest LCP risk during intro
2. Use `movflags +faststart` for progressive download
3. Prefer WebM on Chrome/Firefox (smaller)
4. Run Lighthouse **after** intro seen (repeat visit) for steady-state score
5. Consider serving video from CDN with `Cache-Control: max-age=31536000`

### Fallback chain

```
1. intro-mobile.webm / intro-mobile.mp4 (mobile)
2. intro.webm / intro.mp4 (desktop)
3. intro-poster.svg + HERO_BG Ken Burns
4. Reduced motion → skip directly to hero
```

---

## Developer API

```tsx
import { useIntro } from "@/context/IntroContext";
import { requestIntroReplay, clearIntroSeen } from "@/lib/intro-storage";

const { replayIntro, introActive } = useIntro();

// Trigger replay from anywhere
clearIntroSeen();
requestIntroReplay();
replayIntro();
router.push("/");
```

```ts
import { INTRO_TIMELINE, INTRO_DURATION_MS, INTRO_TAGLINE } from "@/lib/intro-timeline";
```

---

## Testing Checklist

- [ ] First visit plays full timeline
- [ ] Second visit (same session) skips intro
- [ ] After 30 days, intro replays
- [ ] Skip intro → immediate hero
- [ ] Replay from footer works
- [ ] Disable in settings → never plays
- [ ] `prefers-reduced-motion` → no intro
- [ ] Autoplay blocked → tap to play
- [ ] Missing video files → poster fallback
- [ ] Mobile viewport uses mobile assets
- [ ] No layout shift on load
- [ ] Hero search works after handoff

---

_Related: `PREMIUM_EXPERIENCE_REPORT.md`, `lib/intro-storage.ts`_
