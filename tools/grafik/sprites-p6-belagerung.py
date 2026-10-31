#!/usr/bin/env python3
"""
Deterministischer Generator für Sprite-Charge P6 (Belagerungs-Himmel / Rauch).
Ausgabe unter public/grafik/atlas/belagerung/ nach GRAFIK-SPRITES.md §3/§8.
Merged in bestehendes Manifest (P0–P5 bleiben). Keine Truppen, keine Waffen.
Aufruf: python3 tools/grafik/sprites-p6-belagerung.py
"""
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
ATLAS = ROOT / "public" / "grafik" / "atlas"
MANIFEST = ATLAS / "manifest.json"

# Spannungsfarben (GRAFIK §8 / G11 Code: #4a3a38-Wash, weicher Rauch)
HIMMEL_DUNST = (74, 58, 56)  # #4a3a38
RAUCH_HELL = (200, 196, 190)
RAUCH_MITTEL = (160, 154, 148)
RAUCH_DUNKEL = (120, 114, 108)
KONTUR = (43, 38, 32, 40)

P6_IDS_PREFIX = ("belagerung/",)


def new_img(w: int, h: int) -> Image.Image:
    return Image.new("RGBA", (w, h), (0, 0, 0, 0))


def soft_ellipse(
    base: Image.Image,
    box: tuple[int, int, int, int],
    fill: tuple[int, int, int, int],
    blur: float = 1.2,
) -> None:
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse(box, fill=fill)
    if blur > 0:
        layer = layer.filter(ImageFilter.GaussianBlur(radius=blur))
    base.alpha_composite(layer)


def save(
    img: Image.Image,
    rel: str,
    eintraege: list[dict],
    *,
    id_: str,
    anker: tuple[float, float] = (0.5, 0.5),
) -> None:
    path = ATLAS / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "PNG", optimize=True)
    eintraege.append(
        {
            "id": id_,
            "datei": rel.replace("\\", "/"),
            "felder": [1, 1],
            "anker": {"x": anker[0], "y": anker[1]},
            "pixel": {"w": img.width, "h": img.height},
        }
    )


def belagerung_himmel(eintraege: list[dict]) -> None:
    """Weicher Spannungs-Dunst über die Bühne (kein Vollflächen-Rechteck)."""
    # @2x der Logikbreite ~560×320 → 1120×640 wäre zu groß; weiches Overlay-Tile
    w, h = 320, 200
    img = new_img(w, h)
    # drei weiche Bänder: oben stärker, unten auslaufend
    soft_ellipse(img, (-40, -60, w + 40, 100), (*HIMMEL_DUNST, 90), blur=18)
    soft_ellipse(img, (20, 20, w - 20, 140), (*HIMMEL_DUNST, 55), blur=22)
    soft_ellipse(img, (-20, 80, w + 20, h + 40), (*HIMMEL_DUNST, 35), blur=20)
    save(img, "belagerung/himmel.png", eintraege, id_="belagerung/himmel", anker=(0.5, 0.5))


def rauch(n: int, eintraege: list[dict]) -> None:
    """Rauchwolke n=1…3 – weiche Ellipsen, feste Silhouette, kein Militär."""
    # Größen wie Code-Rauch (ca. 56×20 Logik → @2x)
    groessen = {
        1: (120, 56),
        2: (100, 48),
        3: (88, 44),
    }
    w, h = groessen[n]
    img = new_img(w, h)
    # Varianten leicht versetzt, deterministisch
    if n == 1:
        soft_ellipse(img, (8, 18, 78, 48), (*RAUCH_MITTEL, 110), blur=2.2)
        soft_ellipse(img, (40, 6, 110, 40), (*RAUCH_HELL, 95), blur=2.0)
        soft_ellipse(img, (55, 16, 100, 42), (*RAUCH_DUNKEL, 70), blur=1.8)
    elif n == 2:
        soft_ellipse(img, (6, 16, 70, 44), (*RAUCH_HELL, 100), blur=2.0)
        soft_ellipse(img, (35, 4, 94, 36), (*RAUCH_MITTEL, 90), blur=1.9)
        soft_ellipse(img, (48, 14, 88, 40), (*RAUCH_DUNKEL, 65), blur=1.6)
    else:
        soft_ellipse(img, (4, 14, 58, 40), (*RAUCH_DUNKEL, 95), blur=1.8)
        soft_ellipse(img, (28, 4, 82, 32), (*RAUCH_MITTEL, 85), blur=1.7)
        soft_ellipse(img, (40, 12, 78, 36), (*RAUCH_HELL, 70), blur=1.5)
    # leichte Kontur-Andeutung (keine harte Kante)
    soft_ellipse(img, (w // 4, h // 3, (3 * w) // 4, (2 * h) // 3), (*KONTUR[:3], 25), blur=3)
    save(img, f"belagerung/rauch_{n}.png", eintraege, id_=f"belagerung/rauch_{n}", anker=(0.5, 0.6))


def main() -> None:
    neu: list[dict] = []
    belagerung_himmel(neu)
    for i in (1, 2, 3):
        rauch(i, neu)

    bestehend: list[dict] = []
    if MANIFEST.exists():
        data = json.loads(MANIFEST.read_text(encoding="utf-8"))
        bestehend = [
            e
            for e in data.get("eintraege", [])
            if not any(str(e.get("id", "")).startswith(p) for p in P6_IDS_PREFIX)
        ]
    eintraege = bestehend + neu
    MANIFEST.write_text(
        json.dumps({"version": 1, "eintraege": eintraege}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"P6 Belagerung: {len(neu)} neu, Manifest gesamt {len(eintraege)} → {MANIFEST}")


if __name__ == "__main__":
    main()
