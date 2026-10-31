#!/usr/bin/env python3
"""
Deterministischer Generator für Sprite-Charge P4
(Hinterhof-Objekte alle Themen + MiniBastion-Standbilder).
Ausgabe unter public/grafik/atlas/ nach GRAFIK-SPRITES.md §7/§8.
Keine Laufzeitabhängigkeit der App – nur Offline-Erzeugung (Pillow).
Aufruf: python3 tools/grafik/sprites-p4-hinterhof.py
"""
from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
ATLAS = ROOT / "public" / "grafik" / "atlas"

THEMEN = ("bastion", "garten", "weltraum", "dorf", "unterwasser")

# Richtung A
HIMMEL = "#D6ECF3"
PETROL = "#1F7A72"
DACH = "#C4603A"
DACH_HELL = "#E07A4F"
TEXT = "#2B2620"
KONTUR = (43, 38, 32, 100)
SCHATTEN = (0, 0, 0, 40)

# Themen-Metaphern (GRAFIK.md §7): Buch, Blume, Stern, Buch, Perle
OBJEKT = {
    "bastion": "buch",
    "garten": "blume",
    "weltraum": "stern",
    "dorf": "garbe",
    "unterwasser": "perle",
}

BRONZE = {
    "bastion": "#cd7f32",
    "garten": "#c4783a",
    "weltraum": "#e8d080",
    "dorf": "#b88850",
    "unterwasser": "#7ec8c0",
}
SILBER = "#c0c8d4"
OFFEN_RAND = "#8a9a78"
OFFEN_INNEN = "#d8e0d0"


def hex_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def shade(h: str, delta: int) -> tuple[int, int, int]:
    r, g, b = hex_rgb(h)
    return (
        max(0, min(255, r + delta)),
        max(0, min(255, g + delta)),
        max(0, min(255, b + delta)),
    )


def new_img(w: int, h: int) -> Image.Image:
    return Image.new("RGBA", (w, h), (0, 0, 0, 0))


def save(
    img: Image.Image,
    rel: str,
    eintraege: list[dict],
    *,
    id_: str,
    felder: tuple[int, int] = (1, 1),
    anker: tuple[float, float] = (0.5, 1.0),
) -> None:
    pfad = ATLAS / rel
    pfad.parent.mkdir(parents=True, exist_ok=True)
    img.save(pfad, "PNG", optimize=True)
    eintraege.append(
        {
            "id": id_,
            "datei": rel,
            "felder": list(felder),
            "anker": {"x": anker[0], "y": anker[1]},
            "pixel": {"w": img.size[0], "h": img.size[1]},
        }
    )


def zeichne_objekt(
    d: ImageDraw.ImageDraw,
    art: str,
    cx: float,
    cy: float,
    farbe: str,
    *,
    scale: float = 1.0,
) -> None:
    """Kleines Themen-Objekt (Buch/Blume/Stern/Garbe/Perle), lesbar in klein."""
    s = max(0.7, scale)
    f = hex_rgb(farbe)
    fd = shade(farbe, -45)
    fh = shade(farbe, 30)
    if art == "buch":
        # stehendes Buch: Rücken links, Schnitt rechts hell
        d.rectangle(
            [cx - 11 * s, cy - 16 * s, cx + 11 * s, cy + 5 * s],
            fill=f,
            outline=KONTUR,
        )
        d.rectangle(
            [cx - 11 * s, cy - 16 * s, cx - 5 * s, cy + 5 * s],
            fill=fd,
        )
        d.rectangle(
            [cx - 4 * s, cy - 14 * s, cx + 9 * s, cy + 3 * s],
            fill=hex_rgb("#F6F1E7"),
            outline=KONTUR,
        )
        d.line(
            [(cx + 2 * s, cy - 12 * s), (cx + 2 * s, cy + 1 * s)],
            fill=shade("#F6F1E7", -35),
            width=max(1, int(s)),
        )
    elif art == "blume":
        d.line(
            [(cx, cy + 2 * s), (cx, cy + 12 * s)],
            fill=hex_rgb("#2d6a3c"),
            width=max(2, int(2.5 * s)),
        )
        for a in range(0, 360, 72):
            rad = math.radians(a)
            px = cx + math.cos(rad) * 8 * s
            py = cy - 6 * s + math.sin(rad) * 8 * s
            d.ellipse(
                [px - 5 * s, py - 5 * s, px + 5 * s, py + 5 * s],
                fill=f,
                outline=KONTUR,
            )
        d.ellipse(
            [cx - 5 * s, cy - 11 * s, cx + 5 * s, cy - 1 * s],
            fill=hex_rgb("#e6c35c"),
            outline=KONTUR,
        )
    elif art == "stern":
        pts = []
        for i in range(10):
            ang = math.radians(-90 + i * 36)
            r = (11 if i % 2 == 0 else 4.5) * s
            pts.append((cx + math.cos(ang) * r, cy - 2 * s + math.sin(ang) * r))
        d.polygon([(round(x), round(y)) for x, y in pts], fill=f, outline=KONTUR)
        d.ellipse(
            [cx - 3 * s, cy - 5 * s, cx + 3 * s, cy + 1 * s],
            fill=fh,
        )
    elif art == "garbe":
        # Weizengarbe: gebündelte Ähren
        for dx, tip in ((-8, -14), (-4, -18), (0, -20), (4, -18), (8, -14)):
            d.line(
                [(cx, cy + 6 * s), (cx + dx * s * 0.35, cy + tip * s)],
                fill=f,
                width=max(2, int(3 * s)),
            )
            d.ellipse(
                [
                    cx + dx * s * 0.35 - 3 * s,
                    cy + tip * s - 3 * s,
                    cx + dx * s * 0.35 + 3 * s,
                    cy + tip * s + 3 * s,
                ],
                fill=fh,
                outline=KONTUR,
            )
        d.ellipse(
            [cx - 6 * s, cy + 2 * s, cx + 6 * s, cy + 10 * s],
            fill=hex_rgb("#7b5a3c"),
            outline=KONTUR,
        )
    else:  # perle
        d.ellipse(
            [cx - 11 * s, cy - 12 * s, cx + 11 * s, cy + 8 * s],
            fill=f,
            outline=KONTUR,
        )
        d.ellipse(
            [cx - 11 * s, cy - 12 * s, cx + 11 * s, cy + 8 * s],
            outline=shade(farbe, -55),
        )
        d.ellipse(
            [cx - 5 * s, cy - 8 * s, cx + 2 * s, cy - 1 * s],
            fill=(255, 255, 255, 190),
        )


def platz_offen(thema: str, eintraege: list[dict]) -> None:
    size = 64
    img = new_img(size, size)
    d = ImageDraw.Draw(img)
    cx, cy = size / 2, size - 10
    # leere Mulde: äußerer Rand + innere Vertiefung (nie rot)
    d.ellipse([cx - 18, cy - 14, cx + 18, cy + 8], fill=hex_rgb(OFFEN_RAND), outline=KONTUR)
    d.ellipse([cx - 13, cy - 10, cx + 13, cy + 3], fill=shade(OFFEN_INNEN, -35), outline=KONTUR)
    d.ellipse([cx - 9, cy - 7, cx + 9, cy], fill=hex_rgb(OFFEN_INNEN))
    save(
        img,
        f"hinterhof/{thema}/platz_offen.png",
        eintraege,
        id_=f"hinterhof/{thema}/platz_offen",
        anker=(0.5, 1.0),
    )


def platz_fuellung(thema: str, niveau: str, eintraege: list[dict]) -> None:
    size = 64
    img = new_img(size, size)
    d = ImageDraw.Draw(img)
    cx, cy = size / 2, size - 8
    farbe = BRONZE[thema] if niveau == "g" else SILBER
    # kleiner Sockel
    d.ellipse([cx - 14, cy - 4, cx + 14, cy + 4], fill=SCHATTEN)
    zeichne_objekt(d, OBJEKT[thema], cx, cy - 6, farbe, scale=1.0)
    name = f"platz_{niveau}"
    save(
        img,
        f"hinterhof/{thema}/{name}.png",
        eintraege,
        id_=f"hinterhof/{thema}/{name}",
        anker=(0.5, 1.0),
    )


def wappen_voll(thema: str, eintraege: list[dict]) -> None:
    w, h = 80, 96
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    cx, fuss = w / 2, h - 6
    # Schild
    schild = [
        (cx, fuss - 70),
        (cx + 28, fuss - 58),
        (cx + 24, fuss - 22),
        (cx, fuss - 4),
        (cx - 24, fuss - 22),
        (cx - 28, fuss - 58),
    ]
    d.polygon([(round(x), round(y)) for x, y in schild], fill=hex_rgb(BRONZE[thema]), outline=KONTUR)
    innen = hex_rgb("#F6F1E7")
    d.polygon(
        [
            (round(cx), round(fuss - 62)),
            (round(cx + 18), round(fuss - 54)),
            (round(cx + 15), round(fuss - 26)),
            (round(cx), round(fuss - 14)),
            (round(cx - 15), round(fuss - 26)),
            (round(cx - 18), round(fuss - 54)),
        ],
        fill=innen,
        outline=KONTUR,
    )
    zeichne_objekt(d, OBJEKT[thema], cx, fuss - 40, PETROL, scale=0.85)
    save(
        img,
        f"hinterhof/{thema}/wappen_voll.png",
        eintraege,
        id_=f"hinterhof/{thema}/wappen_voll",
        anker=(0.5, 1.0),
    )


def denkmal_voll(thema: str, eintraege: list[dict]) -> None:
    w, h = 80, 100
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    cx, fuss = w / 2, h - 4
    # Sockel
    d.polygon(
        [
            (cx, fuss),
            (cx + 22, fuss - 10),
            (cx, fuss - 20),
            (cx - 22, fuss - 10),
        ],
        fill=hex_rgb("#8a7e72"),
        outline=KONTUR,
    )
    d.rectangle([cx - 14, fuss - 36, cx + 14, fuss - 18], fill=hex_rgb("#a4927a"), outline=KONTUR)
    # Figur / Säule je Thema
    if thema == "garten":
        # Gartenzwerg-Silhouette
        d.ellipse([cx - 10, fuss - 70, cx + 10, fuss - 50], fill=hex_rgb(DACH), outline=KONTUR)
        d.rectangle([cx - 8, fuss - 54, cx + 8, fuss - 34], fill=hex_rgb(PETROL), outline=KONTUR)
    elif thema == "weltraum":
        d.ellipse([cx - 12, fuss - 68, cx + 12, fuss - 44], fill=hex_rgb("#8a96a8"), outline=KONTUR)
        d.rectangle([cx - 3, fuss - 44, cx + 3, fuss - 34], fill=hex_rgb("#5ec4d4"))
    elif thema == "unterwasser":
        d.ellipse([cx - 14, fuss - 58, cx + 14, fuss - 34], fill=hex_rgb("#7ec8c0"), outline=KONTUR)
        d.arc([cx - 10, fuss - 72, cx + 10, fuss - 52], 200, 340, fill=hex_rgb("#d4786a"), width=3)
    elif thema == "dorf":
        d.polygon(
            [
                (cx, fuss - 72),
                (cx + 12, fuss - 48),
                (cx + 4, fuss - 48),
                (cx + 4, fuss - 34),
                (cx - 4, fuss - 34),
                (cx - 4, fuss - 48),
                (cx - 12, fuss - 48),
            ],
            fill=hex_rgb("#a4927a"),
            outline=KONTUR,
        )
    else:
        # Statue
        d.ellipse([cx - 8, fuss - 70, cx + 8, fuss - 54], fill=hex_rgb("#c4b29a"), outline=KONTUR)
        d.rectangle([cx - 10, fuss - 54, cx + 10, fuss - 34], fill=hex_rgb("#b7a48c"), outline=KONTUR)
    save(
        img,
        f"hinterhof/{thema}/denkmal_voll.png",
        eintraege,
        id_=f"hinterhof/{thema}/denkmal_voll",
        anker=(0.5, 1.0),
    )


def diamond(cx: float, cy: float, bw: float, bh: float) -> list[tuple[float, float]]:
    return [
        (cx, cy - bh),
        (cx + bw / 2, cy - bh / 2),
        (cx, cy),
        (cx - bw / 2, cy - bh / 2),
    ]


def standbild(thema: str, eintraege: list[dict]) -> None:
    """Ruhige Gesamtansicht 960×480 (@2x für 480×240 Logik), klarer Tag."""
    w, h = 960, 480
    img = new_img(w, h)
    d = ImageDraw.Draw(img)

    # Himmel
    if thema == "weltraum":
        d.rectangle([0, 0, w, h], fill=hex_rgb("#1a2342"))
        for i, (sx, sy) in enumerate(
            [(80, 40), (200, 70), (340, 30), (500, 55), (700, 45), (860, 80), (120, 120)]
        ):
            r = 2 + (i % 3)
            d.ellipse([sx - r, sy - r, sx + r, sy + r], fill=hex_rgb("#FFC85A" if i % 4 == 0 else "#e8eef8"))
    elif thema == "unterwasser":
        d.rectangle([0, 0, w, h], fill=hex_rgb("#6db7d8"))
        for i in range(5):
            y = 40 + i * 30
            d.ellipse([60 + i * 160, y, 160 + i * 160, y + 24], fill=(255, 255, 255, 35))
    else:
        d.rectangle([0, 0, w, h], fill=hex_rgb(HIMMEL))
        # Sonne
        d.ellipse([780, 40, 860, 120], fill=hex_rgb("#FFC85A"))
        # Wolke
        d.ellipse([120, 70, 220, 110], fill=(255, 255, 255, 200))
        d.ellipse([160, 55, 250, 100], fill=(255, 255, 255, 200))

    # Boden-Insel / Wiese
    cx, fuss = w / 2, h - 40
    if thema == "dorf":
        boden = "#67a24a"
        rand = "#3f6d32"
    elif thema == "garten":
        boden = "#6aaa4e"
        rand = "#3f874c"
    elif thema == "unterwasser":
        boden = "#b8a878"
        rand = "#8a7850"
    elif thema == "weltraum":
        boden = "#3a465c"
        rand = "#2a3448"
    else:
        boden = "#5b9342"
        rand = "#3f6d32"

    isle = diamond(cx, fuss, 700, 160)
    d.polygon([(round(x), round(y)) for x, y in isle], fill=hex_rgb(boden))
    # Seiten
    n, e, s, west = isle
    d.polygon(
        [(round(x), round(y)) for x, y in [west, s, (s[0], s[1] + 28), (west[0], west[1] + 28)]],
        fill=hex_rgb(rand),
    )
    d.polygon(
        [(round(x), round(y)) for x, y in [e, s, (s[0], s[1] + 28), (e[0], e[1] + 28)]],
        fill=shade(rand, -20),
    )

    # Kern-Gebäude stilisiert
    bw, bh, hoehe = 160, 80, 90
    if thema == "garten":
        # Baumhaus
        d.rectangle([cx - 8, fuss - 100, cx + 8, fuss - 20], fill=hex_rgb("#5c4030"))
        d.ellipse([cx - 50, fuss - 160, cx + 50, fuss - 70], fill=hex_rgb("#2d6a3c"), outline=KONTUR)
        d.polygon(
            [
                (cx - 40, fuss - 70),
                (cx, fuss - 100),
                (cx + 40, fuss - 70),
                (cx + 40, fuss - 40),
                (cx - 40, fuss - 40),
            ],
            fill=hex_rgb("#8b6a45"),
            outline=KONTUR,
        )
        d.polygon(
            [(cx - 42, fuss - 72), (cx, fuss - 105), (cx + 42, fuss - 72)],
            fill=hex_rgb(DACH),
            outline=KONTUR,
        )
    elif thema == "dorf":
        d.polygon(
            [
                (cx - 50, fuss - 20),
                (cx - 50, fuss - 90),
                (cx, fuss - 110),
                (cx + 50, fuss - 90),
                (cx + 50, fuss - 20),
            ],
            fill=hex_rgb("#a4927a"),
            outline=KONTUR,
        )
        d.polygon(
            [(cx - 55, fuss - 88), (cx, fuss - 120), (cx + 55, fuss - 88)],
            fill=hex_rgb("#8d3a34"),
            outline=KONTUR,
        )
        d.line([(cx, fuss - 120), (cx, fuss - 145)], fill=hex_rgb("#f4efe4"), width=3)
        d.polygon(
            [(cx, fuss - 145), (cx + 22, fuss - 138), (cx, fuss - 131)],
            fill=hex_rgb(PETROL),
        )
    elif thema == "unterwasser":
        d.ellipse([cx - 70, fuss - 140, cx + 70, fuss - 30], fill=hex_rgb("#7a9aab"), outline=KONTUR)
        d.ellipse([cx - 40, fuss - 160, cx + 40, fuss - 100], fill=hex_rgb("#3dbea5"), outline=KONTUR)
        d.rectangle([cx - 12, fuss - 70, cx + 12, fuss - 40], fill=hex_rgb("#3a2a16"))
    elif thema == "weltraum":
        # Kommandomodul (flach iso)
        d.polygon(
            [
                (cx, fuss - 130),
                (cx + 70, fuss - 95),
                (cx + 70, fuss - 45),
                (cx, fuss - 20),
                (cx - 70, fuss - 45),
                (cx - 70, fuss - 95),
            ],
            fill=hex_rgb("#8a96a8"),
            outline=KONTUR,
        )
        d.ellipse([cx - 28, fuss - 105, cx + 28, fuss - 55], fill=hex_rgb("#5ec4d4"), outline=KONTUR)
        d.rectangle([cx - 10, fuss - 85, cx + 10, fuss - 65], fill=hex_rgb("#FFC85A"))
        # Antenne
        d.line([(cx + 50, fuss - 100), (cx + 50, fuss - 150)], fill=hex_rgb("#a8b4c4"), width=3)
        d.ellipse([cx + 42, fuss - 160, cx + 58, fuss - 144], fill=hex_rgb("#7aecd4"), outline=KONTUR)
    else:
        # Bastion Bergfried (iso-Körper + Dach)
        boden_pts = diamond(cx, fuss - 20, bw, bh)
        n, e, s, west = boden_pts
        oben_n = (n[0], n[1] - hoehe)
        oben_e = (e[0], e[1] - hoehe)
        oben_s = (s[0], s[1] - hoehe)
        oben_w = (west[0], west[1] - hoehe)
        d.polygon(
            [(round(x), round(y)) for x, y in [west, s, oben_s, oben_w]],
            fill=shade("#c4b29a", -36),
            outline=KONTUR,
        )
        d.polygon(
            [(round(x), round(y)) for x, y in [s, e, oben_e, oben_s]],
            fill=shade("#c4b29a", -18),
            outline=KONTUR,
        )
        # Dach als Raute auf der Oberkante
        tip = (cx, oben_n[1] - 36)
        d.polygon(
            [(round(x), round(y)) for x, y in [oben_w, tip, oben_e, oben_s]],
            fill=hex_rgb(DACH),
            outline=KONTUR,
        )
        d.polygon(
            [(round(x), round(y)) for x, y in [oben_w, tip, oben_e]],
            fill=hex_rgb(DACH_HELL),
        )
        # Fenster
        d.rectangle([cx - 22, fuss - 70, cx - 10, fuss - 52], fill=hex_rgb("#3a2a16"))
        d.rectangle([cx + 10, fuss - 70, cx + 22, fuss - 52], fill=hex_rgb("#3a2a16"))

    # kleines Zier-Gebäude rechts
    zx = cx + 180
    d.polygon(
        [
            (zx - 30, fuss - 15),
            (zx - 30, fuss - 55),
            (zx, fuss - 70),
            (zx + 30, fuss - 55),
            (zx + 30, fuss - 15),
        ],
        fill=hex_rgb("#9a8a72" if thema != "weltraum" else "#6a7688"),
        outline=KONTUR,
    )
    d.polygon(
        [(zx - 34, fuss - 52), (zx, fuss - 78), (zx + 34, fuss - 52)],
        fill=hex_rgb(DACH_HELL if thema != "unterwasser" else "#6ad4c0"),
        outline=KONTUR,
    )

    save(
        img,
        f"minibat/{thema}/standbild.png",
        eintraege,
        id_=f"minibat/{thema}/standbild",
        felder=(1, 1),
        anker=(0.5, 1.0),
    )


def thema_hinterhof(thema: str, eintraege: list[dict]) -> None:
    platz_offen(thema, eintraege)
    platz_fuellung(thema, "g", eintraege)
    platz_fuellung(thema, "m", eintraege)
    wappen_voll(thema, eintraege)
    denkmal_voll(thema, eintraege)
    standbild(thema, eintraege)


def main() -> None:
    neu: list[dict] = []
    for thema in THEMEN:
        thema_hinterhof(thema, neu)

    p4_ids = {e["id"] for e in neu}
    eintraege = list(neu)
    manifest_pfad = ATLAS / "manifest.json"
    if manifest_pfad.exists():
        alt = json.loads(manifest_pfad.read_text(encoding="utf-8"))
        for e in alt.get("eintraege", []):
            if e.get("id") not in p4_ids:
                eintraege.append(e)
    manifest = {"version": 1, "eintraege": eintraege}
    manifest_pfad.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"P4 Hinterhof/MiniBastion: {len(neu)} neu, {len(eintraege)} gesamt → {manifest_pfad}")


if __name__ == "__main__":
    main()
