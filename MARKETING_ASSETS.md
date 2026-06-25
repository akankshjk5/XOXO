# XOXO.TRAVEL — Marketing Assets Guide

_Launch preparation · asset specifications · folder structure_

This document defines where marketing files live, what to produce, and the technical specs for each deliverable. **No application code changes are required** — drop finalized assets into the folders below.

---

## Folder structure

```
public/
├── videos/           # Homepage cinematic brand film
├── screenshots/      # Web + App Store + Play Store captures
├── og/               # Open Graph & social share images
├── press/            # Press kit downloads for media
├── logos/            # Brand logo exports (SVG, PNG, favicon)
└── app-preview/      # App Store & Google Play preview videos
```

Each folder includes a `README.md` with suggested filenames. See also [`public/MARKETING_README.md`](public/MARKETING_README.md).

**Brand tagline:** `Book. Meet. Travel.`  
**Primary domain:** `xoxo.travel`

---

## Homepage intro video specifications

Used by the first-visit cinematic experience. Technical integration is documented in [`INTRO_EXPERIENCE.md`](INTRO_EXPERIENCE.md).

### Delivery location

```
public/videos/
├── intro.mp4              # Required for launch (desktop)
├── intro.webm             # Required for launch (desktop, preferred on Chrome/Firefox)
├── intro-mobile.mp4       # Optional — mobile viewport
├── intro-mobile.webm      # Optional — mobile viewport
├── intro-poster.webp      # Recommended — loading + poster-only fallback
└── intro-poster.svg       # Included — lightweight fallback poster
```

Files are discovered at runtime. Missing video files fall back to the poster with the full cinematic timeline.

### Creative brief

| Property | Specification |
|---|---|
| **Purpose** | Premium brand film — travel, connection, discovery |
| **Duration** | 6–8 seconds source (loops until 5.5s homepage handoff) |
| **Mood** | Cinematic, aspirational, warm; dark ambient grade |
| **Safe zone** | Center-weighted — logo/tagline overlay at 1.0s–3.0s |
| **Text in video** | None — on-screen copy is rendered by the app |
| **Audio** | None (muted autoplay) |

### Desktop (`intro.mp4` / `intro.webm`)

| Property | Value |
|---|---|
| Resolution | **1920 × 1080** (16:9) |
| Frame rate | 24 fps or 30 fps |
| MP4 codec | H.264, High profile, `yuv420p` |
| WebM codec | VP9 |
| Target size | MP4 **< 3 MB** · WebM **< 2 MB** |
| Color | sRGB, subtle film grain optional |

### Mobile (`intro-mobile.*`)

| Property | Value |
|---|---|
| Resolution | **1080 × 1920** (9:16) or **720 × 1280** |
| Target size | **< 1.5 MB** per file |
| Framing | Vertical crop; keep hero subject center-top |

### Poster

| Property | Value |
|---|---|
| Format | WebP (primary) or SVG/PNG |
| Resolution | 1920 × 1080 (match video frame) |
| Content | Strong single frame from the film or brand key visual |

### Compression (FFmpeg)

```bash
# Desktop MP4
ffmpeg -i source.mov -an \
  -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
  -c:v libx264 -preset slow -crf 23 -movflags +faststart \
  public/videos/intro.mp4

# Desktop WebM
ffmpeg -i source.mov -an -vf "scale=1920:1080" \
  -c:v libvpx-vp9 -crf 35 -b:v 0 \
  public/videos/intro.webm

# Poster WebP
ffmpeg -i source.mov -vframes 1 -q:v 80 public/videos/intro-poster.webp
```

### Pre-launch checklist

- [ ] Desktop MP4 + WebM exported and under size targets
- [ ] Mobile variants exported (or confirm desktop-only fallback is acceptable)
- [ ] Poster WebP matches first frame / brand grade
- [ ] No burned-in text or UI chrome
- [ ] `movflags +faststart` on all MP4 files
- [ ] Spot-check on Chrome, Safari, and a mid-range Android device

---

## App Store preview specifications

Delivery: `public/app-preview/ios/`

Apple App Store **App Preview** videos appear on the product page and in search results.

### Technical requirements (Apple)

| Property | Value |
|---|---|
| **Formats** | `.mov`, `.m4v`, or `.mp4` |
| **Codec** | H.264 or ProRes 422 (H.264 recommended for size) |
| **Audio** | Optional — AAC, stereo, 48 kHz (or silent) |
| **Duration** | **15–30 seconds** per preview |
| **Max previews** | Up to 3 per localization per device size |
| **Orientation** | Portrait or landscape per device class |

### Required device sizes

| Device class | Resolution | Aspect |
|---|---|---|
| iPhone 6.7" (15 Pro Max, 14 Pro Max, etc.) | **886 × 1920** | Portrait |
| iPhone 6.5" (11 Pro Max, XS Max, etc.) | **886 × 1920** | Portrait |
| iPhone 5.5" (8 Plus, 7 Plus, etc.) | **1080 × 1920** | Portrait |
| iPad Pro 12.9" (6th gen) | **1200 × 1600** | Portrait |
| iPad Pro 12.9" (2nd gen) | **1200 × 1600** | Portrait |

> Export at the exact pixel dimensions Apple specifies for each slot. Use the largest class (6.7") as the primary master when resources are limited.

### Creative guidelines

- Show real in-app UI — no misleading mockups
- Lead with **Book → Meet → Travel** value props within 3 seconds
- Highlight: package search, travel matching, group trips, AI planner
- Avoid rapid cuts — 2–3 seconds per feature screen
- End on logo + `xoxo.travel` or App Store CTA frame

### Suggested filenames

```
app-preview/ios/
├── preview-iphone-6.7.mp4
├── preview-iphone-6.7-poster.jpg    # First frame, same dimensions
├── preview-iphone-6.5.mp4           # Optional resize from master
└── preview-ipad-12.9.mp4            # Optional tablet preview
```

### Export settings

| Property | Recommendation |
|---|---|
| Resolution | Match Apple table above |
| Frame rate | 30 fps |
| Bitrate | 10–15 Mbps H.264 for quality; re-compress if > 500 MB |
| Color | sRGB |

---

## Google Play preview specifications

Delivery: `public/app-preview/android/`

Google Play supports a **preview video** (YouTube link in Console) and **promo video** on the store listing. Keep master files in-repo for versioning.

### YouTube preview video (store listing)

| Property | Value |
|---|---|
| **Hosting** | YouTube (unlisted or public) — link entered in Play Console |
| **Duration** | **30 seconds – 2 minutes** recommended |
| **Aspect ratio** | **16:9** (1920 × 1080) |
| **Resolution** | 1080p minimum |
| **Content** | Real app footage; same creative rules as iOS |

### In-app promo / device preview masters

| Property | Value |
|---|---|
| Format | MP4 (H.264) |
| Resolution | **1080 × 1920** (phone) · **1200 × 1920** (tablet optional) |
| Duration | 15–30 seconds |
| Audio | Optional AAC stereo |
| Target size | **< 50 MB** per file for easy distribution |

### Feature graphic (required for Play Store)

Store in `public/screenshots/feature-graphic/`:

| Property | Value |
|---|---|
| Dimensions | **1024 × 500** px |
| Format | PNG or JPEG (no alpha) |
| Content | Brand + tagline; no excessive text (Play policy) |

### Suggested filenames

```
app-preview/android/
├── preview-phone-1080x1920.mp4
├── preview-phone-poster.jpg
├── promo-youtube-1920x1080.mp4      # Master for YouTube upload
└── promo-youtube-thumbnail.jpg      # 1280 × 720
```

---

## Open Graph image sizes

Delivery: `public/og/`

Used when links are shared on Facebook, LinkedIn, Slack, iMessage, Discord, etc.

### Primary OG image (required)

| Property | Value |
|---|---|
| **Dimensions** | **1200 × 630** px |
| **Aspect ratio** | 1.91:1 |
| **Format** | PNG or JPEG |
| **Max file size** | < 1 MB (aim for < 300 KB) |
| **Safe zone** | Keep logo and headline inside center **1120 × 580** |

### Recommended variants

| File | Size | Use case |
|---|---|---|
| `og-default.png` | 1200 × 630 | Site-wide default |
| `og-home.png` | 1200 × 630 | Homepage / brand film |
| `og-packages.png` | 1200 × 630 | Packages & search results |
| `og-destinations.png` | 1200 × 630 | Destination detail shares |
| `og-square.png` | 1200 × 1200 | Platforms that crop to square |

### Design notes

- Dark green brand background with aurora accent (match site hero)
- Logo: `XOXO.TRAVEL` wordmark + mark
- Tagline optional: `Book. Meet. Travel.`
- No fine print — readable at thumbnail size

---

## Social media banner sizes

Delivery: `public/og/` (or subfolder `public/og/social/`)

| Platform | Dimensions | Aspect | Filename suggestion |
|---|---|---|---|
| **Twitter / X** header | 1500 × 500 | 3:1 | `twitter-header.png` |
| **Twitter / X** card | 1200 × 628 | ~1.91:1 | `twitter-card.png` |
| **LinkedIn** company cover | 1128 × 191 | ~5.9:1 | `linkedin-cover.png` |
| **LinkedIn** post / link | 1200 × 627 | 1.91:1 | `linkedin-post.png` |
| **Facebook** cover | 820 × 312 | ~2.6:1 | `facebook-cover.png` |
| **Facebook** share | 1200 × 630 | 1.91:1 | `facebook-share.png` |
| **Instagram** post | 1080 × 1080 | 1:1 | `instagram-post.png` |
| **Instagram** story / reel cover | 1080 × 1920 | 9:16 | `instagram-story.png` |
| **YouTube** channel art | 2560 × 1440 | — | `youtube-channel-art.png` |
| **YouTube** thumbnail | 1280 × 720 | 16:9 | `youtube-thumbnail.png` |

### Safe zones

- **Twitter header:** keep critical content in center 1280 × 400
- **YouTube channel art:** safe area **1546 × 423** (visible on TV/desktop)
- **LinkedIn cover:** logo and text in left/center — right side may crop on mobile

---

## Press kit requirements

Delivery: `public/press/`

Prepare a downloadable package for journalists, partners, and influencers.

### Required contents

| Asset | Format | Notes |
|---|---|---|
| **Press kit PDF** | PDF | 4–8 pages: story, features, facts, contact |
| **Fact sheet** | PDF or MD | One-page: founded, HQ, markets, key stats |
| **Company description** | TXT / MD | 50, 100, and 250-word versions |
| **Founder / team bios** | MD + headshots | JPG 800 × 800 min, neutral background |
| **Logo pack** | ZIP or folder | Link to `public/logos/` exports |
| **Screenshots** | PNG | 5–10 high-res, no device chrome required |
| **Brand film** | MP4 | 30s cut or link to full intro |
| **Contact** | MD | press@xoxo.travel (update before launch) |

### Suggested structure

```
press/
├── xoxo-travels-press-kit.pdf
├── fact-sheet.pdf
├── company-descriptions.md
├── team/
│   ├── founder-name.jpg
│   └── founder-bio.md
├── screenshots/              # 2560px wide PNGs
└── downloads/
    └── xoxo-travels-logos.zip
```

### Writing checklist

- [ ] Boilerplate paragraph (who, what, where, why now)
- [ ] Key differentiators: social travel, matching, groups, AI planner
- [ ] Traction metrics (users, destinations, bookings — update at launch)
- [ ] Quotes from founder (2–3 sentences)
- [ ] Release date and availability (web, iOS, Android)
- [ ] Media contact name, email, phone

---

## Logo export guidelines

Delivery: `public/logos/`

### Master files (designer source)

| File | Description |
|---|---|
| `svg/xoxo-travel-logo-full.svg` | Mark + wordmark, full color |
| `svg/xoxo-travel-logo-mark.svg` | Icon only (`X>` mark) |
| `svg/xoxo-travel-wordmark.svg` | `XOXO.TRAVEL` text only |
| `svg/xoxo-travel-logo-reverse.svg` | White on transparent |
| `svg/xoxo-travel-logo-mono.svg` | Single-color black |

### Raster exports

| Use | Size | Format | Background |
|---|---|---|---|
| App icon source | 1024 × 1024 | PNG | No transparency for iOS; follow platform guides |
| Web / OG | 512, 1024 | PNG | Transparent or brand green |
| Favicon | 32, 48 | PNG | Transparent |
| PWA | 192, 512 | PNG | Brand green `#0f2e1f` or transparent |
| Apple touch icon | 180 × 180 | PNG | Solid background per HIG |

### Color specifications

| Token | Hex | Usage |
|---|---|---|
| Green dark | `#0f2e1f` | Backgrounds, footer |
| Green bright | `#4ade80` | Accent, mark, CTAs |
| White | `#ffffff` | Wordmark on dark |
| Shimmer gradient | Green → white | `.TRAVEL` accent in product UI |

### Clear space & minimum size

- **Clear space:** ½ × mark height on all sides
- **Minimum digital size:** 24 px mark height
- **Minimum print size:** 10 mm mark height

### Do / Don't

| Do | Don't |
|---|---|
| Use approved SVG/PNG exports | Stretch, skew, or rotate the logo |
| Maintain contrast on backgrounds | Place on busy photography without scrim |
| Use reverse white on dark green | Change brand colors or add effects |
| Export @2x for retina | Recreate the mark in non-brand fonts |

---

## Screenshot checklist

Delivery: `public/screenshots/`

### Web marketing (`screenshots/web/`)

| # | Screen | Capture notes |
|---|---|---|
| 1 | Homepage hero | After intro — search visible, aurora subtle |
| 2 | Package search / results | Show filters and cards |
| 3 | Package detail | Pricing, itinerary, CTA |
| 4 | Travel match | Matcher UI with profiles |
| 5 | Groups | Group list or detail |
| 6 | AI planner | Conversation or itinerary output |
| 7 | Dashboard | Bookings overview |
| 8 | Destinations | Grid or map view |

**Specs:** 2560 × 1440 or native viewport; PNG; optional browser chrome frame for landing pages.

### App Store (`screenshots/ios/`)

| Device | Size (portrait) | Count |
|---|---|---|
| iPhone 6.7" | 1290 × 2796 | 5–10 screenshots |
| iPhone 6.5" | 1284 × 2778 | Optional |
| iPad Pro 12.9" | 2048 × 2732 | 5–10 if tablet supported |

- First screenshot = primary value prop + tagline overlay (allowed by Apple as marketing text on image)
- Localize captions if shipping multiple regions
- Status bar: 9:41 AM, full signal, full battery (Apple convention)

### Google Play (`screenshots/android/`)

| Type | Size | Count |
|---|---|---|
| Phone | Min 1080 px on short edge | 4–8 |
| 7" tablet | 1200 × 1920 | 4+ if supported |
| 10" tablet | 1600 × 2560 | 4+ if supported |
| Feature graphic | **1024 × 500** | 1 required |

### Screenshot production checklist

- [ ] Use production or polished staging data (real destination names)
- [ ] Consistent device frame style across all shots
- [ ] No personal data, test emails, or debug banners
- [ ] Localized text overlays proofread
- [ ] Dark mode series if app supports it
- [ ] Exported PNG, sRGB, no compression artifacts
- [ ] File names include platform + screen + sequence (`ios-01-home.png`)

---

## Launch readiness summary

| Category | Folder | Status |
|---|---|---|
| Homepage intro video | `public/videos/` | Poster only — add MP4/WebM before launch |
| OG / social images | `public/og/` | Pending |
| Store screenshots | `public/screenshots/` | Pending |
| App previews | `public/app-preview/` | Pending |
| Logos | `public/logos/` | Pending full export pack |
| Press kit | `public/press/` | Pending |

---

## Related documentation

- [`INTRO_EXPERIENCE.md`](INTRO_EXPERIENCE.md) — Cinematic intro technical integration
- [`public/videos/README.md`](public/videos/README.md) — Intro video drop-in workflow
- [`public/MARKETING_README.md`](public/MARKETING_README.md) — Folder index

---

_Last updated: launch preparation phase · XOXO.TRAVEL_
