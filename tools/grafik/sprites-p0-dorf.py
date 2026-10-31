#!/usr/bin/env python3
"""
Deterministischer Generator für Sprite-Charge P0 (Dorf, Epoche 1).
Ausgabe unter public/grafik/atlas/ nach GRAFIK-SPRITES.md.
Keine Laufzeitabhängigkeit der App – nur Offline-Erzeugung (Pillow).
Aufruf: python3 tools/grafik/sprites-p0-dorf.py
"""
from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
ATLAS = ROOT / "public" / "grafik" / "atlas"

# Farben Richtung A „Tag, warm“ (GRAFIK.md)
DACH = "#C4603A"
DACH_HELL = "#E07A4F"
DACH_DUNKEL = "#8d3a34"
WAND = "#c4b29a"
WAND_HELL = "#d8cbb5"
WAND_DUNKEL = "#9a8a72"
HOLZ = "#7b5a3c"
HOLZ_HELL = "#a67c52"
HOLZ_DUNKEL = "#5a4028"
PETROL = "#1F7A72"
PETROL_HELL = "#3dbea5"
WASSER = "#6db7d8"
WISSEN_DACH = "#3d5c8a"
WIESEN_HELL = "#86b85c"
WIESEN = "#67a24a"
WIESEN_DUNKEL = "#5b9342"
RAND = "#1c3124"
STEIN = "#8a7e72"
SCHATTEN = (0, 0, 0, 45)
KONTUR = (43, 38, 32, 90)


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


def diamond(
    cx: float, cy: float, bw: float, bh: float
) -> list[tuple[float, float]]:
    """Isometrische Raute 2∶1, Unterkante = Südspitze bei (cx, cy)."""
    return [
        (cx, cy - bh),  # N
        (cx + bw / 2, cy - bh / 2),  # E
        (cx, cy),  # S (Fußpunkt)
        (cx - bw / 2, cy - bh / 2),  # W
    ]


def poly(draw: ImageDraw.ImageDraw, pts: list[tuple[float, float]], fill, outline=None) -> None:
    draw.polygon([(round(x), round(y)) for x, y in pts], fill=fill, outline=outline)


def kasten(
    draw: ImageDraw.ImageDraw,
    cx: float,
    fuss: float,
    bw: float,
    bh: float,
    hoehe: float,
    wand: str,
    dach: str,
    *,
    stufe: int = 1,
) -> float:
    """Zeichnet Iso-Quader; Rückgabe = Dach-Scheitel-y (Bildkoordinate)."""
    # Bodenraute (leicht sichtbar als Schatten)
    boden = diamond(cx, fuss, bw, bh)
    poly(draw, boden, SCHATTEN)

    # Seitenwände: von Boden hoch
    n, e, s, w = boden
    oben_n = (n[0], n[1] - hoehe)
    oben_e = (e[0], e[1] - hoehe)
    oben_s = (s[0], s[1] - hoehe)
    oben_w = (w[0], w[1] - hoehe)

    poly(draw, [w, s, oben_s, oben_w], shade(wand, -36))
    poly(draw, [s, e, oben_e, oben_s], shade(wand, -14))
    # Dach (Raute oben)
    dach_pts = [oben_n, oben_e, oben_s, oben_w]
    poly(draw, dach_pts, hex_rgb(dach))
    # Dach-First hell
    mid = ((oben_n[0] + oben_s[0]) / 2, (oben_n[1] + oben_s[1]) / 2)
    poly(draw, [oben_n, oben_e, mid], shade(dach, 28))
    poly(draw, [oben_n, oben_w, mid], shade(dach, 10))
    # Kontur
    draw.line(
        [tuple(map(round, p)) for p in dach_pts + [dach_pts[0]]],
        fill=KONTUR,
        width=1,
    )
    # Stufen-Punkte (wie Code-Fallback)
    if stufe > 1:
        for i in range(stufe):
            draw.ellipse(
                [
                    s[0] - 6 - i * 10,
                    s[1] - 10,
                    s[0] - 2 - i * 10,
                    s[1] - 6,
                ],
                fill=hex_rgb("#f0c14a"),
            )
    return oben_n[1]


def fenster(draw: ImageDraw.ImageDraw, x: float, y: float, *, abend: bool = False) -> None:
    fill = hex_rgb("#FFC85A") if abend else hex_rgb("#3a2a16")
    draw.rectangle([x - 4, y - 5, x + 4, y + 5], fill=fill, outline=KONTUR)


def fahne(draw: ImageDraw.ImageDraw, x: float, y: float) -> None:
    draw.line([(x, y + 10), (x, y - 22)], fill=hex_rgb("#f4efe4"), width=2)
    poly(
        draw,
        [(x, y - 22), (x + 18, y - 14), (x, y - 6)],
        hex_rgb(PETROL_HELL),
    )


def saege(draw: ImageDraw.ImageDraw, x: float, y: float) -> None:
    draw.line([(x - 14, y + 8), (x + 12, y - 10)], fill=hex_rgb("#f4efe4"), width=3)
    poly(
        draw,
        [(x + 2, y - 16), (x + 16, y - 8), (x + 4, y - 2)],
        hex_rgb("#e7d3a1"),
    )


def buch(draw: ImageDraw.ImageDraw, x: float, y: float) -> None:
    draw.rectangle([x - 12, y - 8, x - 1, y + 8], fill=hex_rgb("#f4efe4"), outline=KONTUR)
    draw.rectangle([x, y - 8, x + 11, y + 8], fill=hex_rgb("#d7e4ea"), outline=KONTUR)
    draw.line([(x, y - 8), (x, y + 8)], fill=hex_rgb("#6d5438"), width=2)


def fluegel(draw: ImageDraw.ImageDraw, x: float, y: float) -> None:
    arm = 22
    draw.line([(x - arm, y - 4), (x + arm, y + 4)], fill=hex_rgb("#f4efe4"), width=4)
    draw.line([(x - 4, y + arm), (x + 4, y - arm)], fill=hex_rgb("#f4efe4"), width=4)
    draw.ellipse([x - 5, y - 5, x + 5, y + 5], fill=hex_rgb(DACH_DUNKEL))


def baum(draw: ImageDraw.ImageDraw, x: float, y: float, s: float = 1.0) -> None:
    draw.ellipse(
        [x - 12 * s, y - 2 * s, x + 12 * s, y + 6 * s],
        fill=SCHATTEN,
    )
    draw.rectangle(
        [x - 3 * s, y - 16 * s, x + 3 * s, y + 2 * s],
        fill=hex_rgb(HOLZ),
    )
    draw.ellipse(
        [x - 14 * s, y - 34 * s, x + 14 * s, y - 8 * s],
        fill=hex_rgb("#2d6a3c"),
    )
    draw.ellipse(
        [x - 18 * s, y - 30 * s, x - 2 * s, y - 12 * s],
        fill=hex_rgb("#3f874c"),
    )


def save(img: Image.Image, rel: str, eintraege: list[dict], *, id_: str, felder: tuple[int, int], anker=(0.5, 1.0)) -> None:
    path = ATLAS / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "PNG", optimize=True)
    eintraege.append(
        {
            "id": id_,
            "datei": rel.replace("\\", "/"),
            "felder": list(felder),
            "anker": {"x": anker[0], "y": anker[1]},
            "pixel": {"w": img.width, "h": img.height},
        }
    )


def canvas_for(felder: tuple[int, int], extra_h: int) -> tuple[int, int, float, float, float, float]:
    """(W, H, cx, fuss_y, bw, bh) in @2x Pixeln."""
    fw, ft = felder
    # 1×1 Logik 48×24 → @2x 96×48
    bw = ((fw + ft) / 2) * 96
    bh = ((fw + ft) / 2) * 48
    w = int(bw + 8)
    h = int(bh + extra_h + 16)
    cx = w / 2
    fuss = h - 4
    return w, h, cx, fuss, bw, bh


def gebaeude_kern(stufe: int, eintraege: list[dict]) -> None:
    felder = (3, 3)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 120 + stufe * 16)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    hoehe = 70 + (stufe - 1) * 16
    top = kasten(d, cx, fuss, bw, bh, hoehe, WAND, DACH_DUNKEL, stufe=stufe)
    # Fenster an den sichtbaren Seiten
    fenster(d, cx - bw * 0.18, fuss - bh * 0.35 - hoehe * 0.4)
    fenster(d, cx + bw * 0.18, fuss - bh * 0.35 - hoehe * 0.4)
    if stufe >= 2:
        fenster(d, cx - bw * 0.12, fuss - bh * 0.28 - hoehe * 0.65)
        fenster(d, cx + bw * 0.12, fuss - bh * 0.28 - hoehe * 0.65)
    fahne(d, cx, top + 8)
    # kleine Anbauten ab Stufe 3
    if stufe >= 3:
        poly(
            d,
            diamond(cx + bw * 0.28, fuss - 8, bw * 0.35, bh * 0.35),
            shade(WAND, -20),
        )
    save(img, f"gebaeude/dorf/e1/kern_s{stufe}.png", eintraege, id_=f"dorf/e1/kern_s{stufe}", felder=felder)


def gebaeude_werkstatt(eintraege: list[dict]) -> None:
    felder = (2, 2)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 90)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    top = kasten(d, cx, fuss, bw, bh, 52, HOLZ, HOLZ_HELL)
    fenster(d, cx - bw * 0.15, fuss - bh * 0.3 - 28)
    fenster(d, cx + bw * 0.15, fuss - bh * 0.3 - 28)
    saege(d, cx, top + 10)
    save(img, "gebaeude/dorf/e1/werkstatt_s1.png", eintraege, id_="dorf/e1/werkstatt_s1", felder=felder)


def gebaeude_wissen(stufe: int, eintraege: list[dict]) -> None:
    felder = (2, 2)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 88 + stufe * 10)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    hoehe = 48 + (stufe - 1) * 10
    top = kasten(d, cx, fuss, bw, bh, hoehe, "#efe6d4", WISSEN_DACH, stufe=stufe)
    fenster(d, cx - bw * 0.14, fuss - bh * 0.3 - hoehe * 0.45)
    fenster(d, cx + bw * 0.14, fuss - bh * 0.3 - hoehe * 0.45)
    buch(d, cx, top + 12)
    save(img, f"gebaeude/dorf/e1/wissen_s{stufe}.png", eintraege, id_=f"dorf/e1/wissen_s{stufe}", felder=felder)


def gebaeude_turm(stufe: int, eintraege: list[dict]) -> None:
    felder = (1, 1)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 130 + stufe * 16)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    hoehe = 78 + (stufe - 1) * 16
    # schmaler Turmkörper
    top = kasten(d, cx, fuss, bw * 0.85, bh * 0.85, hoehe, "#e4d2a8", DACH_DUNKEL, stufe=stufe)
    fenster(d, cx - 8, fuss - bh * 0.25 - hoehe * 0.35)
    fenster(d, cx + 8, fuss - bh * 0.25 - hoehe * 0.55)
    fluegel(d, cx, top + 6)
    save(img, f"gebaeude/dorf/e1/turm_s{stufe}.png", eintraege, id_=f"dorf/e1/turm_s{stufe}", felder=felder)


def gebaeude_eingang(eintraege: list[dict]) -> None:
    felder = (1, 1)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 50)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    top = kasten(d, cx, fuss, bw, bh, 22, HOLZ, HOLZ_HELL)
    # Brückengeländer
    draw = d
    draw.line([(cx - 28, top + 18), (cx + 10, top + 6)], fill=hex_rgb("#f4efe4"), width=3)
    draw.line([(cx - 10, top + 24), (cx + 28, top + 10)], fill=hex_rgb("#f4efe4"), width=3)
    # Planken
    poly(d, diamond(cx, fuss - 4, bw * 0.9, bh * 0.55), shade(HOLZ_HELL, 20))
    save(img, "gebaeude/dorf/e1/eingang_s1.png", eintraege, id_="dorf/e1/eingang_s1", felder=felder)


def gebaeude_einfassung(eintraege: list[dict]) -> None:
    felder = (1, 1)
    w, h = 96, 100
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    cx, fuss = w / 2, h - 6
    # drei Pfähle
    for ox in (-22, 0, 22):
        x = cx + ox
        d.rectangle([x - 5, fuss - 36, x + 5, fuss], fill=hex_rgb(HOLZ))
        poly(
            d,
            [(x - 8, fuss - 36), (x, fuss - 50), (x + 8, fuss - 36)],
            hex_rgb(HOLZ_HELL),
        )
    # Schatten-Raute
    poly(d, diamond(cx, fuss, 72, 36), SCHATTEN)
    save(img, "gebaeude/dorf/e1/einfassung_s1.png", eintraege, id_="dorf/e1/einfassung_s1", felder=felder)


def gebaeude_ursprung(eintraege: list[dict]) -> None:
    felder = (1, 1)
    w, h = 96, 110
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    cx, fuss = w / 2, h - 8
    poly(d, diamond(cx, fuss, 80, 40), SCHATTEN)
    d.ellipse([cx - 28, fuss - 18, cx + 28, fuss + 6], fill=hex_rgb("#6d5848"))
    d.ellipse([cx - 18, fuss - 14, cx + 18, fuss], fill=hex_rgb(WASSER))
    d.line([(cx - 22, fuss - 4), (cx - 22, fuss - 40)], fill=hex_rgb(HOLZ), width=3)
    d.line([(cx + 22, fuss - 4), (cx + 22, fuss - 40)], fill=hex_rgb(HOLZ), width=3)
    d.line([(cx - 26, fuss - 40), (cx + 26, fuss - 40)], fill=hex_rgb(HOLZ), width=4)
    save(img, "gebaeude/dorf/e1/ursprung_s1.png", eintraege, id_="dorf/e1/ursprung_s1", felder=felder)


def gebaeude_zeichen(eintraege: list[dict]) -> None:
    felder = (1, 1)
    w, h = 96, 120
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    cx, fuss = w / 2, h - 6
    poly(d, diamond(cx, fuss, 64, 32), SCHATTEN)
    d.line([(cx, fuss), (cx, fuss - 70)], fill=hex_rgb(HOLZ), width=3)
    fahne(d, cx, fuss - 48)
    # Wappen-Schild
    poly(
        d,
        [(cx - 14, fuss - 42), (cx + 14, fuss - 42), (cx + 10, fuss - 22), (cx, fuss - 16), (cx - 10, fuss - 22)],
        hex_rgb("#d36b32"),
    )
    save(img, "gebaeude/dorf/e1/zeichen_s1.png", eintraege, id_="dorf/e1/zeichen_s1", felder=felder)


def gebaeude_flaeche(eintraege: list[dict]) -> None:
    felder = (2, 2)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 70)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    poly(d, diamond(cx, fuss, bw, bh), hex_rgb(WIESEN_HELL))
    poly(d, diamond(cx, fuss, bw * 0.92, bh * 0.92), hex_rgb(WIESEN))
    for ox, oy, s in [(-28, -40, 0.7), (24, -36, 0.65), (-8, -55, 0.55), (18, -58, 0.6)]:
        baum(d, cx + ox, fuss + oy, s)
    # Früchte
    for ox, oy in [(-6, -48), (14, -52)]:
        d.ellipse([cx + ox - 3, fuss + oy - 3, cx + ox + 3, fuss + oy + 3], fill=hex_rgb("#c0392b"))
    save(img, "gebaeude/dorf/e1/flaeche_s1.png", eintraege, id_="dorf/e1/flaeche_s1", felder=felder)


def gebaeude_denkmal(eintraege: list[dict]) -> None:
    felder = (1, 1)
    w, h = 96, 130
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    cx, fuss = w / 2, h - 6
    kasten(d, cx, fuss, 70, 35, 18, STEIN, STEIN)
    # Figur
    d.rectangle([cx - 8, fuss - 70, cx + 8, fuss - 28], fill=hex_rgb(WAND))
    d.ellipse([cx - 12, fuss - 92, cx + 12, fuss - 68], fill=hex_rgb(WAND_HELL))
    save(img, "gebaeude/dorf/e1/denkmal_s1.png", eintraege, id_="dorf/e1/denkmal_s1", felder=felder)


def _in_raute(px: float, py: float, cx: float = 48, cy: float = 24, hw: float = 48, hh: float = 24) -> bool:
    """Punkt in der Iso-Raute 2∶1 (Mitte cx,cy; Halbbreite/Höhe)."""
    return abs(px - cx) / hw + abs(py - cy) / hh <= 1.0


def _wiesen_raute(
    farbe: str,
    farbe_hell: str,
    *,
    blumen: bool,
    seed: int,
) -> Image.Image:
    """Eine Boden-Kachel @2x (96×48): Raute mit leichter Struktur, Richtung A „Tag, warm“."""
    img = new_img(96, 48)
    d = ImageDraw.Draw(img)
    raute = [(48, 0), (96, 24), (48, 48), (0, 24)]
    poly(d, raute, hex_rgb(farbe))
    # innere hellere Fläche (Lesbarkeit in klein)
    poly(d, [(48, 5), (88, 24), (48, 43), (8, 24)], hex_rgb(farbe_hell))
    # feste „Halme“ / Punkte – deterministisch aus seed, kein Zufall
    for i in range(18):
        t = (seed * 17 + i * 97) % 1000
        px = 12 + (t * 13) % 72
        py = 8 + (t * 7) % 32
        if not _in_raute(px, py, hw=40, hh=18):
            continue
        ton = shade(farbe_hell, 12 if (i + seed) % 2 == 0 else -10)
        d.point((px, py), fill=ton)
        if i % 3 == 0:
            d.line([(px, py), (px, py - 2)], fill=shade(farbe, -20), width=1)
    if blumen:
        for i, (bx, by) in enumerate(((30, 18), (62, 22), (44, 30))):
            if (seed + i) % 2 == 0:
                d.rectangle([bx, by, bx + 1, by + 1], fill=(255, 255, 255, 180))
    # weiche Kontur (Alpha), damit Kacheln nicht hart stoßen
    d.line(raute + [raute[0]], fill=(20, 36, 18, 40), width=1)
    return img


def boden(eintraege: list[dict]) -> None:
    # Spec GRAFIK-SPRITES.md §3: boden/<thema>/e<epoche>/flaeche.png + rand.png
    img = _wiesen_raute(WIESEN, WIESEN_HELL, blumen=True, seed=3)
    save(
        img,
        "boden/dorf/e1/flaeche.png",
        eintraege,
        id_="boden/dorf/e1/flaeche",
        felder=(1, 1),
    )
    # dunkler Rand um den Bauplatz (wie dorfWiese aussen)
    img2 = _wiesen_raute(RAND, "#2a4534", blumen=False, seed=11)
    save(
        img2,
        "boden/dorf/e1/rand.png",
        eintraege,
        id_="boden/dorf/e1/rand",
        felder=(1, 1),
    )
    # Varianten für Schachbrett / hellere Tupfen (Runtime wählt fest per Feld)
    img_b = _wiesen_raute(WIESEN_DUNKEL, WIESEN, blumen=False, seed=5)
    save(
        img_b,
        "boden/dorf/e1/flaeche_b.png",
        eintraege,
        id_="boden/dorf/e1/flaeche_b",
        felder=(1, 1),
    )
    img_h = _wiesen_raute("#7ab054", WIESEN_HELL, blumen=True, seed=7)
    save(
        img_h,
        "boden/dorf/e1/flaeche_hell.png",
        eintraege,
        id_="boden/dorf/e1/flaeche_hell",
        felder=(1, 1),
    )


def wesen_frame(
    art: str,
    zyklus: str,
    frame: int,
    eintraege: list[dict],
) -> None:
    """Kleine Silhouetten 64×64 @2x (~32 Logik)."""
    size = 64
    img = new_img(size, size)
    d = ImageDraw.Draw(img)
    cx, cy = size / 2, size - 8
    bob = math.sin(frame * 1.2) * 2
    if zyklus == "react":
        bob -= 6 + frame * 2
    walk = (frame % 4) * 2 - 3 if zyklus == "walk" else 0

    if art == "huhn":
        body = hex_rgb("#e8dcc8")
        d.ellipse([cx - 14, cy - 22 + bob, cx + 12, cy - 4 + bob], fill=body, outline=KONTUR)
        d.ellipse([cx + 4, cy - 30 + bob, cx + 18, cy - 16 + bob], fill=body, outline=KONTUR)
        d.polygon(
            [(cx + 16, cy - 24 + bob), (cx + 26, cy - 22 + bob), (cx + 16, cy - 20 + bob)],
            fill=hex_rgb("#e07a4f"),
        )
        # Beine
        d.line([(cx - 4, cy - 4 + bob), (cx - 4 + walk, cy)], fill=hex_rgb("#c4603a"), width=2)
        d.line([(cx + 4, cy - 4 + bob), (cx + 4 - walk, cy)], fill=hex_rgb("#c4603a"), width=2)
        if zyklus == "react":
            d.ellipse([cx + 10, cy - 34 + bob, cx + 14, cy - 30 + bob], fill=hex_rgb("#2B2620"))
    elif art == "katze":
        body = hex_rgb("#c4a574")
        d.ellipse([cx - 16, cy - 20 + bob, cx + 14, cy - 2 + bob], fill=body, outline=KONTUR)
        d.ellipse([cx + 6, cy - 28 + bob, cx + 20, cy - 14 + bob], fill=body, outline=KONTUR)
        # Ohren
        poly(d, [(cx + 8, cy - 26 + bob), (cx + 12, cy - 36 + bob), (cx + 16, cy - 26 + bob)], body)
        poly(d, [(cx + 14, cy - 26 + bob), (cx + 18, cy - 34 + bob), (cx + 20, cy - 24 + bob)], body)
        # Schwanz
        d.arc(
            [cx - 28, cy - 28 + bob, cx - 8, cy - 4 + bob],
            start=200,
            end=340,
            fill=body,
            width=3,
        )
        d.line([(cx - 2, cy - 2 + bob), (cx - 2 + walk, cy)], fill=shade("#c4a574", -40), width=2)
        d.line([(cx + 6, cy - 2 + bob), (cx + 6 - walk, cy)], fill=shade("#c4a574", -40), width=2)
    else:  # spatz
        body = hex_rgb("#6b5a4a")
        wing = frame % 2 if zyklus != "idle" else 0
        d.ellipse([cx - 10, cy - 18 + bob, cx + 10, cy - 4 + bob], fill=body, outline=KONTUR)
        d.ellipse([cx + 2, cy - 24 + bob, cx + 14, cy - 12 + bob], fill=shade("#6b5a4a", 20), outline=KONTUR)
        poly(
            d,
            [
                (cx - 4, cy - 14 + bob),
                (cx - 20, cy - 18 - wing * 4 + bob),
                (cx - 6, cy - 8 + bob),
            ],
            shade("#6b5a4a", 30),
        )
        d.polygon(
            [(cx + 12, cy - 18 + bob), (cx + 20, cy - 16 + bob), (cx + 12, cy - 14 + bob)],
            fill=hex_rgb("#2B2620"),
        )

    rel = f"wesen/dorf/{art}_{zyklus}_{frame}.png"
    save(
        img,
        rel,
        eintraege,
        id_=f"wesen/dorf/{art}_{zyklus}_{frame}",
        felder=(1, 1),
        anker=(0.5, 1.0),
    )


def main() -> None:
    eintraege: list[dict] = []
    for s in (1, 2, 3):
        gebaeude_kern(s, eintraege)
    gebaeude_werkstatt(eintraege)
    for s in (1, 2):
        gebaeude_wissen(s, eintraege)
    for s in (1, 2):
        gebaeude_turm(s, eintraege)
    gebaeude_eingang(eintraege)
    gebaeude_einfassung(eintraege)
    gebaeude_ursprung(eintraege)
    gebaeude_zeichen(eintraege)
    gebaeude_flaeche(eintraege)
    gebaeude_denkmal(eintraege)
    boden(eintraege)

    frames = {
        "idle": 3,
        "walk": 4,
        "react": 2,
    }
    for art in ("huhn", "katze", "spatz"):
        for zyklus, n in frames.items():
            for i in range(n):
                wesen_frame(art, zyklus, i, eintraege)

    # P1 (himmel/wetter/auflage) und spätere Chargen beim Neuaufbau behalten
    manifest_pfad = ATLAS / "manifest.json"
    if manifest_pfad.exists():
        alt = json.loads(manifest_pfad.read_text(encoding="utf-8"))
        p0_ids = {e["id"] for e in eintraege}
        for e in alt.get("eintraege", []):
            if e.get("id") not in p0_ids:
                eintraege.append(e)
    manifest = {"version": 1, "eintraege": eintraege}
    manifest_pfad.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"P0 Dorf: {len(eintraege)} Einträge → {manifest_pfad}")


if __name__ == "__main__":
    main()
