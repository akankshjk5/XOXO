"""One-shot generator for favicon, PWA icons, and OG image. Run from repo root."""
from __future__ import annotations

import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
LOGO_PATH = ROOT / "public" / "logos" / "png" / "xoxo-logo.png"
PUBLIC = ROOT / "public"
ICONS_DIR = PUBLIC / "icons"

GREEN_DARK = (13, 61, 46)
GREEN_MID = (15, 74, 56)
GREEN_NEON = (34, 197, 94)
WHITE = (255, 255, 255)
MUTED = (200, 220, 210)


def load_logo() -> Image.Image:
    return Image.open(LOGO_PATH).convert("RGBA")


def fit_logo_on_square(size: int, padding_ratio: float = 0.12) -> Image.Image:
    logo = load_logo()
    canvas = Image.new("RGBA", (size, size), (*GREEN_DARK, 255))
    pad = int(size * padding_ratio)
    inner = size - pad * 2
    lw, lh = logo.size
    scale = min(inner / lw, inner / lh)
    nw, nh = int(lw * scale), int(lh * scale)
    resized = logo.resize((nw, nh), Image.Resampling.LANCZOS)
    x = (size - nw) // 2
    y = (size - nh) // 2
    canvas.paste(resized, (x, y), resized)
    return canvas


def save_favicon(path: Path) -> None:
    sizes = [16, 32, 48]
    images = [fit_logo_on_square(s).convert("RGBA") for s in sizes]
    images[0].save(path, format="ICO", sizes=[(s, s) for s in sizes], append_images=images[1:])


def save_pwa_icons() -> None:
    ICONS_DIR.mkdir(parents=True, exist_ok=True)
    fit_logo_on_square(192).convert("RGB").save(ICONS_DIR / "icon-192.png", "PNG", optimize=True)
    fit_logo_on_square(512).convert("RGB").save(ICONS_DIR / "icon-512.png", "PNG", optimize=True)


def pick_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def apply_travel_background(base: Image.Image) -> Image.Image:
    w, h = base.size
    draw = ImageDraw.Draw(base)
    for y in range(h):
        t = y / max(h - 1, 1)
        r = int(GREEN_DARK[0] * (1 - t * 0.35) + GREEN_MID[0] * t * 0.35)
        g = int(GREEN_DARK[1] * (1 - t * 0.25) + GREEN_MID[1] * t * 0.25)
        b = int(GREEN_DARK[2] * (1 - t * 0.2) + GREEN_MID[2] * t * 0.2)
        draw.line([(0, y), (w, y)], fill=(r, g, b))

    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse((w * 0.15, h * 0.35, w * 0.95, h * 1.15), fill=(34, 197, 94, 45))
    glow = glow.filter(ImageFilter.GaussianBlur(24))
    return Image.alpha_composite(base.convert("RGBA"), glow).convert("RGB")


def save_og_image(path: Path) -> None:
    w, h = 1200, 630
    base = Image.new("RGB", (w, h), GREEN_DARK)
    base = apply_travel_background(base)

    # Decorative travel arcs
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    odraw.arc((80, 120, 520, 560), start=200, end=340, fill=(255, 255, 255, 28), width=3)
    odraw.arc((680, 80, 1180, 580), start=160, end=300, fill=(255, 255, 255, 22), width=2)
    base = Image.alpha_composite(base.convert("RGBA"), overlay).convert("RGB")
    draw = ImageDraw.Draw(base)

    logo = load_logo()
    logo_w = 420
    logo_h = int(logo.size[1] * (logo_w / logo.size[0]))
    logo = logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
    base.paste(logo, ((w - logo_w) // 2, 72), logo)

    title_font = pick_font(64, bold=True)
    sub_font = pick_font(34)
    foot_font = pick_font(24)

    title = "XOXO Travels"
    subtitle = "Create Your Sooper Hit Holiday"
    footer = "www.xoxotravels.com"

    def text_width(text: str, font: ImageFont.ImageFont) -> int:
        bbox = draw.textbbox((0, 0), text, font=font)
        return bbox[2] - bbox[0]

    draw.text(((w - text_width(title, title_font)) // 2, 250), title, fill=WHITE, font=title_font)
    draw.text(((w - text_width(subtitle, sub_font)) // 2, 340), subtitle, fill=MUTED, font=sub_font)
    draw.text(((w - text_width(footer, foot_font)) // 2, 540), footer, fill=(160, 200, 175), font=foot_font)

    base.save(path, "PNG", optimize=True)


def main() -> None:
    if not LOGO_PATH.exists():
        raise SystemExit(f"Logo not found: {LOGO_PATH}")

    save_favicon(PUBLIC / "favicon.ico")
    save_pwa_icons()
    save_og_image(PUBLIC / "og-image.png")
    print("Generated favicon.ico, icons/icon-192.png, icons/icon-512.png, og-image.png")


if __name__ == "__main__":
    main()
