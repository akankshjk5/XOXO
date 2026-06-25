# Video assets

Homepage cinematic brand film. **Full specifications:** [MARKETING_ASSETS.md](../../MARKETING_ASSETS.md) · Technical integration: [INTRO_EXPERIENCE.md](../../INTRO_EXPERIENCE.md)

Drop brand film files here — **no code changes required**. The intro resolves available files at runtime.

## Default filenames (recommended)

| File | Purpose |
|---|---|
| `intro.mp4` | Desktop H.264 |
| `intro.webm` | Desktop VP9 |
| `intro-mobile.mp4` | Mobile H.264 (optional) |
| `intro-mobile.webm` | Mobile VP9 (optional) |
| `intro-poster.svg` | Poster while loading / when video is absent |

## Before launch

1. Add `intro.mp4` and/or `intro.webm` when your final cut is ready.
2. Optionally add mobile variants and a higher-fidelity `intro-poster.webp`.
3. Redeploy (or refresh in dev) — videos are picked up automatically.

## Missing video files

If no MP4/WebM files exist, the intro uses the poster with the **full cinematic timeline** (logo, tagline, pins, transition). No errors are thrown.

## Custom filenames (optional)

Copy `intro.config.json.example` → `intro.config.json` to override paths without touching application code.

See `INTRO_EXPERIENCE.md` for compression specs.
