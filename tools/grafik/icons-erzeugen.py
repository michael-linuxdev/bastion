#!/usr/bin/env python3
"""Erzeugt PNG-App-Icons aus der Geometrie von public/icon.svg (deterministisch).

Aufruf: python3 tools/grafik/icons-erzeugen.py
Abhängigkeit nur zum Erzeugen: Pillow (nicht Laufzeit der App).
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

WURZEL = Path(__file__).resolve().parents[2]
PUBLIC = WURZEL / "public"

AKZENT = (0x1F, 0x7A, 0x72, 0xFF)
CREME = (0xF6, 0xF1, 0xE7, 0xFF)
DUNKEL = (0x15, 0x5E, 0x57, 0xFF)

# Formen in viewBox 0..512 – müssen zu public/icon.svg passen
SOCKEL = (80, 400, 352, 32, 8)
MAUER = (112, 268, 288, 140, 0)
LINKS = ((96, 168, 96, 240, 0), (96, 136, 24, 40, 0), (132, 136, 24, 40, 0), (168, 136, 24, 40, 0))
RECHTS = (
    (320, 168, 96, 240, 0),
    (320, 136, 24, 40, 0),
    (356, 136, 24, 40, 0),
    (392, 136, 24, 40, 0),
)
BERG = ((200, 112, 112, 296, 0), (200, 72, 28, 48, 0), (242, 72, 28, 48, 0), (284, 72, 28, 48, 0))
FENSTER = ((220, 148, 22, 30, 4), (270, 148, 22, 30, 4), (124, 220, 28, 28, 4), (360, 220, 28, 28, 4))


def _rect(
    draw: ImageDraw.ImageDraw,
    box: tuple[float, float, float, float],
    fill: tuple[int, ...],
    radius: float = 0,
) -> None:
    if radius > 0:
        draw.rounded_rectangle(box, radius=radius, fill=fill)
    else:
        draw.rectangle(box, fill=fill)


def _bastion(draw: ImageDraw.ImageDraw, s: float = 1.0) -> None:
    def R(x: float, y: float, w: float, h: float, fill=CREME, rad: float = 0) -> None:
        _rect(draw, (x * s, y * s, (x + w) * s, (y + h) * s), fill, rad * s)

    x, y, w, h, rad = SOCKEL
    R(x, y, w, h, CREME, rad)
    x, y, w, h, rad = MAUER
    R(x, y, w, h)
    for form in (*LINKS, *RECHTS, *BERG):
        x, y, w, h, rad = form
        R(x, y, w, h, CREME, rad)
    # Tor: Rechteck + Halbkreis oben
    draw.rectangle((236 * s, 276 * s, 276 * s, 408 * s), fill=DUNKEL)
    draw.ellipse((236 * s, 256 * s, 276 * s, 316 * s), fill=DUNKEL)
    for x, y, w, h, rad in FENSTER:
        R(x, y, w, h, DUNKEL, rad)


def zeichne_standard(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    s = size / 512.0
    draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=max(1, round(96 * s)), fill=AKZENT)
    _bastion(draw, s)
    return img


def zeichne_maskable(size: int) -> Image.Image:
    """Volle Kachel ohne Rundung; Burg auf ~72 % (Maskable Safe-Zone)."""
    out = Image.new("RGBA", (size, size), AKZENT)
    hilf = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    _bastion(ImageDraw.Draw(hilf), 1.0)
    scale = 0.72
    scaled = hilf.resize((int(size * scale), int(size * scale)), Image.Resampling.LANCZOS)
    ox = (size - scaled.size[0]) // 2
    oy = (size - scaled.size[1]) // 2
    out.paste(scaled, (ox, oy), scaled)
    return out


def main() -> None:
    ziele: list[tuple[str, Image.Image]] = [
        ("icon-192.png", zeichne_standard(192)),
        ("icon-512.png", zeichne_standard(512)),
        ("icon-maskable-512.png", zeichne_maskable(512).convert("RGB")),
        ("apple-touch-icon.png", zeichne_standard(180).convert("RGB")),
        ("favicon-32.png", zeichne_standard(32)),
    ]
    for name, im in ziele:
        pfad = PUBLIC / name
        im.save(pfad, format="PNG", optimize=True)
        print(f"{name}: {pfad.stat().st_size} B, {im.size}")


if __name__ == "__main__":
    main()
