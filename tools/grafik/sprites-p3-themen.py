#!/usr/bin/env python3
"""
Deterministischer Generator für Sprite-Charge P3
(bastion, unterwasser, weltraum – Epoche 1).
Ausgabe unter public/grafik/atlas/ nach GRAFIK-SPRITES.md.
Abend-Fenster-Layer (*_fenster.png) wo passend (Gebäude mit Öffnungen).
Keine Laufzeitabhängigkeit der App – nur Offline-Erzeugung (Pillow).
Aufruf: python3 tools/grafik/sprites-p3-themen.py
Stil: Richtung A „Tag, warm“; Unterwasser/Weltraum mit thematischer Palette.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
ATLAS = ROOT / "public" / "grafik" / "atlas"

# —— Gemeinsame / Bastion (Richtung A) ——
DACH = "#C4603A"
DACH_HELL = "#E07A4F"
WAND = "#c4b29a"
WAND_HELL = "#d8cbb5"
STEIN = "#8a7e72"
HOLZ = "#7b5a3c"
HOLZ_DUNKEL = "#5a4028"
PETROL = "#1F7A72"
PETROL_HELL = "#3dbea5"
RASEN = "#67a24a"
RASEN_HELL = "#86b85c"
RASEN_DUNKEL = "#5b9342"
RAND_BASTION = "#1c3124"
SCHATTEN = (0, 0, 0, 45)
KONTUR = (43, 38, 32, 90)

# —— Unterwasser ——
UW_WAND = "#7a9aab"
UW_WAND_HELL = "#9ab8c8"
UW_DACH = "#3dbea5"
UW_DACH_HELL = "#6ad4c0"
UW_SAND = "#b8a878"
UW_SAND_HELL = "#c4b896"
UW_SAND_DUNKEL = "#a89868"
UW_RAND = "#123048"
UW_KORALLE = "#d4786a"
UW_SEEGRAS = "#2d6a4c"

# —— Weltraum ——
WS_METALL = "#8a96a8"
WS_METALL_HELL = "#a8b4c4"
WS_METALL_DUNKEL = "#6a7688"
WS_DACH = "#5ec4d4"
WS_DACH_HELL = "#7ad8e4"
WS_PLATT = "#3a465c"
WS_PLATT_HELL = "#4a5670"
WS_PLATT_DUNKEL = "#323c50"
WS_RAND = "#0a1020"
WS_KRISTALL = "#7aecd4"

FENSTER_TAG = "#3a2a16"
FENSTER_ABEND = "#FFC85A"
FENSTER_ABEND_KERN = "#FFF0B8"
FENSTER_RAHMEN = "#5c4030"


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


def diamond(cx: float, cy: float, bw: float, bh: float) -> list[tuple[float, float]]:
    return [
        (cx, cy - bh),
        (cx + bw / 2, cy - bh / 2),
        (cx, cy),
        (cx - bw / 2, cy - bh / 2),
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
    kuppel: bool = False,
) -> float:
    boden = diamond(cx, fuss, bw, bh)
    poly(draw, boden, SCHATTEN)
    n, e, s, w = boden
    oben_n = (n[0], n[1] - hoehe)
    oben_e = (e[0], e[1] - hoehe)
    oben_s = (s[0], s[1] - hoehe)
    oben_w = (w[0], w[1] - hoehe)
    poly(draw, [w, s, oben_s, oben_w], shade(wand, -36))
    poly(draw, [s, e, oben_e, oben_s], shade(wand, -14))
    dach_pts = [oben_n, oben_e, oben_s, oben_w]
    poly(draw, dach_pts, hex_rgb(dach))
    mid = ((oben_n[0] + oben_s[0]) / 2, (oben_n[1] + oben_s[1]) / 2)
    poly(draw, [oben_n, oben_e, mid], shade(dach, 28))
    poly(draw, [oben_n, oben_w, mid], shade(dach, 10))
    if kuppel:
        r = min(bw, bh) * 0.28
        my = mid[1] - hoehe * 0.15
        draw.ellipse(
            [mid[0] - r, my - r * 0.7, mid[0] + r, my + r * 0.35],
            fill=shade(dach, 18),
            outline=KONTUR,
        )
    draw.line(
        [tuple(map(round, p)) for p in dach_pts + [dach_pts[0]]],
        fill=KONTUR,
        width=1,
    )
    if stufe > 1:
        for i in range(stufe):
            draw.ellipse(
                [s[0] - 6 - i * 10, s[1] - 10, s[0] - 2 - i * 10, s[1] - 6],
                fill=hex_rgb("#f0c14a"),
            )
    return oben_n[1]


def fenster(
    draw: ImageDraw.ImageDraw,
    x: float,
    y: float,
    *,
    abend: bool = False,
    glow: bool = False,
    rund: bool = False,
) -> None:
    if abend and glow:
        draw.ellipse([x - 9, y - 10, x + 9, y + 10], fill=(255, 200, 90, 55))
    fill = hex_rgb(FENSTER_ABEND if abend else FENSTER_TAG)
    if rund:
        draw.ellipse([x - 6, y - 6, x + 6, y + 6], fill=hex_rgb(FENSTER_RAHMEN), outline=KONTUR)
        draw.ellipse([x - 4, y - 4, x + 4, y + 4], fill=fill)
        if abend:
            draw.ellipse([x - 2, y - 2, x + 1, y + 1], fill=hex_rgb(FENSTER_ABEND_KERN))
        return
    draw.rectangle([x - 5, y - 6, x + 5, y + 6], fill=hex_rgb(FENSTER_RAHMEN), outline=KONTUR)
    draw.rectangle([x - 3, y - 4, x + 3, y + 4], fill=fill)
    if abend:
        draw.rectangle([x - 2, y - 3, x, y - 1], fill=hex_rgb(FENSTER_ABEND_KERN))
    draw.line([(x, y - 4), (x, y + 4)], fill=hex_rgb(FENSTER_RAHMEN), width=1)
    draw.line([(x - 3, y), (x + 3, y)], fill=hex_rgb(FENSTER_RAHMEN), width=1)


def fenster_layer(
    w: int, h: int, punkte: list[tuple[float, float]], *, rund: bool = False
) -> Image.Image:
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    for x, y in punkte:
        fenster(d, x, y, abend=True, glow=True, rund=rund)
    return img


def save(
    img: Image.Image,
    rel: str,
    eintraege: list[dict],
    *,
    id_: str,
    felder: tuple[int, int],
    anker=(0.5, 1.0),
) -> None:
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


def save_fenster(
    w: int,
    h: int,
    punkte: list[tuple[float, float]],
    rel_basis: str,
    id_basis: str,
    felder: tuple[int, int],
    eintraege: list[dict],
    *,
    rund: bool = False,
) -> None:
    if not punkte:
        return
    layer = fenster_layer(w, h, punkte, rund=rund)
    rel = rel_basis.replace(".png", "_fenster.png")
    save(layer, rel, eintraege, id_=f"{id_basis}_fenster", felder=felder)


def canvas_for(felder: tuple[int, int], extra_h: int) -> tuple[int, int, float, float, float, float]:
    fw, ft = felder
    bw = ((fw + ft) / 2) * 96
    bh = ((fw + ft) / 2) * 48
    w = int(bw + 8)
    h = int(bh + extra_h + 16)
    cx = w / 2
    fuss = h - 4
    return w, h, cx, fuss, bw, bh


def _in_raute(px: float, py: float, cx: float = 48, cy: float = 24, hw: float = 48, hh: float = 24) -> bool:
    return abs(px - cx) / hw + abs(py - cy) / hh <= 1.0


def _boden_raute(
    farbe: str,
    farbe_hell: str,
    *,
    seed: int,
    details: str = "gras",
) -> Image.Image:
    img = new_img(96, 48)
    d = ImageDraw.Draw(img)
    raute = [(48, 0), (96, 24), (48, 48), (0, 24)]
    poly(d, raute, hex_rgb(farbe))
    poly(d, [(48, 5), (88, 24), (48, 43), (8, 24)], hex_rgb(farbe_hell))
    for i in range(18):
        t = (seed * 19 + i * 91) % 1000
        px = 12 + (t * 11) % 72
        py = 8 + (t * 9) % 32
        if not _in_raute(px, py, hw=40, hh=18):
            continue
        ton = shade(farbe_hell, 14 if (i + seed) % 2 == 0 else -12)
        d.point((px, py), fill=ton)
        if details == "gras" and i % 4 == 0:
            d.line([(px, py), (px, py - 2)], fill=shade(farbe, -18), width=1)
        elif details == "sand" and i % 5 == 0:
            d.ellipse([px - 1, py - 1, px + 1, py + 1], fill=shade(farbe_hell, 20))
        elif details == "metall" and i % 6 == 0:
            d.line([(px - 2, py), (px + 2, py)], fill=shade(farbe, 30), width=1)
    d.line(raute + [raute[0]], fill=(30, 40, 30, 40), width=1)
    return img


# ──────────────────── Bastion ────────────────────


def bastion_kern(stufe: int, eintraege: list[dict]) -> None:
    felder = (3, 3)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 120 + stufe * 14)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    hoehe = 56 + (stufe - 1) * 12
    top = kasten(d, cx, fuss, bw * 0.72, bh * 0.72, hoehe, WAND, DACH, stufe=stufe)
    # Firstkappe statt schwebender Zinnen-Blöcke auf dem Spitzdach
    d.ellipse(
        [cx - 7, top - 2, cx + 7, top + 8],
        fill=hex_rgb(STEIN),
        outline=KONTUR,
    )
    fenster_pts = [
        (cx - bw * 0.12, fuss - bh * 0.2 - hoehe * 0.45),
        (cx + bw * 0.12, fuss - bh * 0.2 - hoehe * 0.45),
    ]
    if stufe >= 2:
        fenster_pts.append((cx, fuss - bh * 0.15 - hoehe * 0.7))
    for px, py in fenster_pts:
        fenster(d, px, py)
    if stufe >= 3:
        d.line([(cx, top - 4), (cx, top - 28)], fill=hex_rgb("#f4efe4"), width=2)
        poly(d, [(cx, top - 28), (cx + 14, top - 20), (cx, top - 12)], hex_rgb(PETROL_HELL))
    id_ = f"bastion/e1/kern_s{stufe}"
    rel = f"gebaeude/bastion/e1/kern_s{stufe}.png"
    save(img, rel, eintraege, id_=id_, felder=felder)
    save_fenster(w, h, fenster_pts, rel, id_, felder, eintraege)


def bastion_werkstatt(eintraege: list[dict]) -> None:
    felder = (2, 2)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 80)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    kasten(d, cx, fuss, bw, bh, 44, WAND_HELL, HOLZ)
    fenster_pts = [(cx - bw * 0.12, fuss - bh * 0.28 - 22)]
    for px, py in fenster_pts:
        fenster(d, px, py)
    # Sägebrett
    d.rectangle([cx + bw * 0.18, fuss - 36, cx + bw * 0.22, fuss - 8], fill=hex_rgb(HOLZ_DUNKEL))
    id_ = "bastion/e1/werkstatt_s1"
    rel = "gebaeude/bastion/e1/werkstatt_s1.png"
    save(img, rel, eintraege, id_=id_, felder=felder)
    save_fenster(w, h, fenster_pts, rel, id_, felder, eintraege)


def bastion_wissen(stufe: int, eintraege: list[dict]) -> None:
    felder = (2, 2)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 86 + stufe * 8)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    hoehe = 48 + (stufe - 1) * 10
    kasten(d, cx, fuss, bw, bh, hoehe, WAND_HELL, "#3d5c8a", stufe=stufe)
    fenster_pts = [
        (cx - bw * 0.14, fuss - bh * 0.25 - hoehe * 0.4),
        (cx + bw * 0.14, fuss - bh * 0.25 - hoehe * 0.4),
    ]
    for px, py in fenster_pts:
        fenster(d, px, py)
    id_ = f"bastion/e1/wissen_s{stufe}"
    rel = f"gebaeude/bastion/e1/wissen_s{stufe}.png"
    save(img, rel, eintraege, id_=id_, felder=felder)
    save_fenster(w, h, fenster_pts, rel, id_, felder, eintraege)


def bastion_turm(stufe: int, eintraege: list[dict]) -> None:
    felder = (1, 1)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 130 + stufe * 12)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    hoehe = 72 + (stufe - 1) * 14
    kasten(d, cx, fuss, bw * 0.7, bh * 0.7, hoehe, STEIN, DACH, stufe=stufe)
    fenster_pts = [(cx, fuss - bh * 0.2 - hoehe * 0.55)]
    for px, py in fenster_pts:
        fenster(d, px, py)
    id_ = f"bastion/e1/turm_s{stufe}"
    rel = f"gebaeude/bastion/e1/turm_s{stufe}.png"
    save(img, rel, eintraege, id_=id_, felder=felder)
    save_fenster(w, h, fenster_pts, rel, id_, felder, eintraege)


def bastion_eingang(eintraege: list[dict]) -> None:
    felder = (1, 1)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 70)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    poly(d, diamond(cx, fuss, bw, bh), SCHATTEN)
    for ox in (-24, 24):
        d.rectangle([cx + ox - 6, fuss - 52, cx + ox + 6, fuss - 2], fill=hex_rgb(STEIN))
    d.arc([cx - 30, fuss - 70, cx + 30, fuss - 18], start=200, end=340, fill=hex_rgb(STEIN), width=5)
    poly(d, [(cx - 14, fuss - 6), (cx - 4, fuss - 40), (cx - 4, fuss - 6)], shade(HOLZ, -20))
    poly(d, [(cx + 14, fuss - 6), (cx + 4, fuss - 40), (cx + 4, fuss - 6)], shade(HOLZ, -10))
    save(img, "gebaeude/bastion/e1/eingang_s1.png", eintraege, id_="bastion/e1/eingang_s1", felder=felder)


def bastion_einfassung(eintraege: list[dict]) -> None:
    felder = (1, 1)
    w, h = 96, 100
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    cx, fuss = w / 2, h - 6
    poly(d, diamond(cx, fuss, 72, 36), SCHATTEN)
    for ox in (-24, -8, 8, 24):
        d.rectangle([cx + ox - 4, fuss - 36, cx + ox + 4, fuss - 2], fill=hex_rgb(HOLZ_DUNKEL))
        d.ellipse([cx + ox - 5, fuss - 42, cx + ox + 5, fuss - 32], fill=hex_rgb(HOLZ))
    d.line([(cx - 28, fuss - 28), (cx + 28, fuss - 28)], fill=hex_rgb(HOLZ), width=3)
    save(
        img,
        "gebaeude/bastion/e1/einfassung_s1.png",
        eintraege,
        id_="bastion/e1/einfassung_s1",
        felder=felder,
    )


def bastion_ursprung(eintraege: list[dict]) -> None:
    felder = (1, 1)
    w, h = 96, 110
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    cx, fuss = w / 2, h - 8
    poly(d, diamond(cx, fuss, 80, 40), SCHATTEN)
    d.ellipse([cx - 22, fuss - 14, cx + 22, fuss + 4], fill=hex_rgb(STEIN))
    d.ellipse([cx - 14, fuss - 10, cx + 14, fuss], fill=hex_rgb("#4a4038"))
    # Flammen
    poly(d, [(cx, fuss - 36), (cx + 10, fuss - 14), (cx - 10, fuss - 14)], hex_rgb("#E07A4F"))
    poly(d, [(cx, fuss - 28), (cx + 5, fuss - 14), (cx - 5, fuss - 14)], hex_rgb("#FFC85A"))
    save(img, "gebaeude/bastion/e1/ursprung_s1.png", eintraege, id_="bastion/e1/ursprung_s1", felder=felder)


def bastion_zeichen(eintraege: list[dict]) -> None:
    felder = (1, 1)
    w, h = 96, 120
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    cx, fuss = w / 2, h - 6
    poly(d, diamond(cx, fuss, 64, 32), SCHATTEN)
    d.line([(cx, fuss), (cx, fuss - 72)], fill=hex_rgb("#f4efe4"), width=3)
    poly(d, [(cx, fuss - 72), (cx + 18, fuss - 60), (cx, fuss - 48)], hex_rgb(PETROL_HELL))
    save(img, "gebaeude/bastion/e1/zeichen_s1.png", eintraege, id_="bastion/e1/zeichen_s1", felder=felder)


def bastion_flaeche(eintraege: list[dict]) -> None:
    felder = (2, 2)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 48)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    poly(d, diamond(cx, fuss, bw, bh), hex_rgb("#6b4a32"))
    poly(d, diamond(cx, fuss - 3, bw * 0.85, bh * 0.8), hex_rgb(RASEN))
    for ox, oy, f in ((-20, -30, "#e07a9a"), (18, -28, "#e6c35c"), (0, -40, "#7a9ce0")):
        d.ellipse([cx + ox - 3, fuss + oy - 3, cx + ox + 3, fuss + oy + 3], fill=hex_rgb(f))
    save(img, "gebaeude/bastion/e1/flaeche_s1.png", eintraege, id_="bastion/e1/flaeche_s1", felder=felder)


def bastion_denkmal(eintraege: list[dict]) -> None:
    felder = (1, 1)
    w, h = 96, 130
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    cx, fuss = w / 2, h - 6
    poly(d, diamond(cx, fuss, 64, 32), SCHATTEN)
    d.ellipse([cx - 18, fuss - 8, cx + 18, fuss + 4], fill=hex_rgb(STEIN))
    d.rectangle([cx - 10, fuss - 48, cx + 10, fuss - 8], fill=hex_rgb(WAND))
    d.ellipse([cx - 8, fuss - 64, cx + 8, fuss - 48], fill=hex_rgb(WAND_HELL))
    save(img, "gebaeude/bastion/e1/denkmal_s1.png", eintraege, id_="bastion/e1/denkmal_s1", felder=felder)


def bastion_boden(eintraege: list[dict]) -> None:
    save(
        _boden_raute(RASEN, RASEN_HELL, seed=2, details="gras"),
        "boden/bastion/e1/flaeche.png",
        eintraege,
        id_="boden/bastion/e1/flaeche",
        felder=(1, 1),
    )
    save(
        _boden_raute(RAND_BASTION, "#2a4034", seed=11, details="gras"),
        "boden/bastion/e1/rand.png",
        eintraege,
        id_="boden/bastion/e1/rand",
        felder=(1, 1),
    )
    save(
        _boden_raute(RASEN_DUNKEL, RASEN, seed=5, details="gras"),
        "boden/bastion/e1/flaeche_b.png",
        eintraege,
        id_="boden/bastion/e1/flaeche_b",
        felder=(1, 1),
    )
    save(
        _boden_raute("#78b854", RASEN_HELL, seed=8, details="gras"),
        "boden/bastion/e1/flaeche_hell.png",
        eintraege,
        id_="boden/bastion/e1/flaeche_hell",
        felder=(1, 1),
    )


def bastion_wesen(art: str, zyklus: str, frame: int, eintraege: list[dict]) -> None:
    size = 64
    img = new_img(size, size)
    d = ImageDraw.Draw(img)
    cx, cy = size / 2, size - 8
    bob = math.sin(frame * 1.2) * 2
    if zyklus == "react":
        bob -= 6 + frame * 2
    walk = (frame % 4) * 2 - 3 if zyklus == "walk" else 0
    wing = frame % 2

    if art == "moewe":
        body = hex_rgb("#e8e4dc")
        d.ellipse([cx - 12, cy - 18 + bob, cx + 12, cy - 6 + bob], fill=body, outline=KONTUR)
        d.ellipse([cx + 8, cy - 24 + bob, cx + 18, cy - 14 + bob], fill=body, outline=KONTUR)
        d.polygon(
            [(cx + 16, cy - 18 + bob), (cx + 24, cy - 16 + bob), (cx + 16, cy - 14 + bob)],
            fill=hex_rgb("#E07A4F"),
        )
        poly(
            d,
            [
                (cx - 4, cy - 14 + bob),
                (cx - 18 - wing * 4, cy - 22 + bob),
                (cx - 6, cy - 8 + bob),
            ],
            (240, 240, 245, 180),
        )
        d.line([(cx - 4, cy - 6 + bob), (cx - 4 + walk, cy)], fill=hex_rgb("#2B2620"), width=1)
        d.line([(cx + 4, cy - 6 + bob), (cx + 4 - walk, cy)], fill=hex_rgb("#2B2620"), width=1)
    elif art == "fuchs":
        body = hex_rgb("#c4783a")
        d.ellipse([cx - 14, cy - 18 + bob, cx + 10, cy - 4 + bob], fill=body, outline=KONTUR)
        d.ellipse([cx + 4, cy - 26 + bob, cx + 18, cy - 12 + bob], fill=body, outline=KONTUR)
        # Ohren
        poly(d, [(cx + 6, cy - 24 + bob), (cx + 10, cy - 34 + bob), (cx + 14, cy - 24 + bob)], body)
        poly(d, [(cx + 12, cy - 24 + bob), (cx + 16, cy - 32 + bob), (cx + 18, cy - 22 + bob)], body)
        # Schwanz
        poly(
            d,
            [
                (cx - 12, cy - 12 + bob),
                (cx - 26 + walk, cy - 20 + bob),
                (cx - 14, cy - 6 + bob),
            ],
            shade("#c4783a", 20),
        )
        d.ellipse([cx - 10 + walk, cy - 6, cx - 2 + walk, cy], fill=shade("#c4783a", -20))
        d.ellipse([cx + 2 - walk, cy - 6, cx + 10 - walk, cy], fill=shade("#c4783a", -20))
    else:  # wache – stilisierte Schildwache ohne Waffe
        body = hex_rgb("#6a7a8a")
        d.ellipse([cx - 10, cy - 8, cx + 10, cy + 2], fill=SCHATTEN)
        d.rectangle([cx - 8, cy - 36 + bob, cx + 8, cy - 8 + bob], fill=body, outline=KONTUR)
        d.ellipse([cx - 7, cy - 50 + bob, cx + 7, cy - 36 + bob], fill=hex_rgb("#d8cbb5"), outline=KONTUR)
        # Helm
        d.ellipse([cx - 8, cy - 54 + bob, cx + 8, cy - 42 + bob], fill=hex_rgb("#5a6878"), outline=KONTUR)
        # Schild (rund, dekorativ, keine Waffe)
        d.ellipse(
            [cx + 6, cy - 32 + bob, cx + 18, cy - 14 + bob],
            fill=hex_rgb(PETROL),
            outline=KONTUR,
        )
        d.ellipse([cx + 9, cy - 28 + bob, cx + 15, cy - 18 + bob], fill=hex_rgb(PETROL_HELL))
        if zyklus == "walk":
            d.line([(cx - 4, cy - 8 + bob), (cx - 4 + walk, cy)], fill=hex_rgb("#2B2620"), width=2)
            d.line([(cx + 4, cy - 8 + bob), (cx + 4 - walk, cy)], fill=hex_rgb("#2B2620"), width=2)

    rel = f"wesen/bastion/{art}_{zyklus}_{frame}.png"
    save(img, rel, eintraege, id_=f"wesen/bastion/{art}_{zyklus}_{frame}", felder=(1, 1))


# ──────────────────── Unterwasser ────────────────────


def uw_kern(stufe: int, eintraege: list[dict]) -> None:
    felder = (3, 3)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 110 + stufe * 12)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    hoehe = 50 + (stufe - 1) * 10
    top = kasten(
        d, cx, fuss, bw * 0.75, bh * 0.75, hoehe, UW_WAND, UW_DACH, stufe=stufe, kuppel=True
    )
    fenster_pts = [
        (cx - bw * 0.14, fuss - bh * 0.2 - hoehe * 0.4),
        (cx + bw * 0.14, fuss - bh * 0.2 - hoehe * 0.4),
    ]
    if stufe >= 2:
        fenster_pts.append((cx, top + 28))
    for px, py in fenster_pts:
        fenster(d, px, py, rund=True)
    id_ = f"unterwasser/e1/kern_s{stufe}"
    rel = f"gebaeude/unterwasser/e1/kern_s{stufe}.png"
    save(img, rel, eintraege, id_=id_, felder=felder)
    save_fenster(w, h, fenster_pts, rel, id_, felder, eintraege, rund=True)


def uw_werkstatt(eintraege: list[dict]) -> None:
    felder = (2, 2)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 78)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    kasten(d, cx, fuss, bw, bh, 42, UW_WAND, UW_WAND_HELL, kuppel=True)
    fenster_pts = [(cx, fuss - bh * 0.25 - 20)]
    for px, py in fenster_pts:
        fenster(d, px, py, rund=True)
    id_ = "unterwasser/e1/werkstatt_s1"
    rel = "gebaeude/unterwasser/e1/werkstatt_s1.png"
    save(img, rel, eintraege, id_=id_, felder=felder)
    save_fenster(w, h, fenster_pts, rel, id_, felder, eintraege, rund=True)


def uw_wissen(stufe: int, eintraege: list[dict]) -> None:
    felder = (2, 2)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 84 + stufe * 8)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    hoehe = 44 + (stufe - 1) * 8
    kasten(d, cx, fuss, bw, bh, hoehe, UW_WAND_HELL, "#8ec4d4", stufe=stufe, kuppel=True)
    # Perlen
    for ox, oy in ((-10, -18), (12, -22), (0, -12)):
        d.ellipse(
            [cx + ox - 3, fuss - bh * 0.2 + oy - 3, cx + ox + 3, fuss - bh * 0.2 + oy + 3],
            fill=hex_rgb("#f0e8d8"),
        )
    fenster_pts = [
        (cx - bw * 0.12, fuss - bh * 0.22 - hoehe * 0.35),
        (cx + bw * 0.12, fuss - bh * 0.22 - hoehe * 0.35),
    ]
    for px, py in fenster_pts:
        fenster(d, px, py, rund=True)
    id_ = f"unterwasser/e1/wissen_s{stufe}"
    rel = f"gebaeude/unterwasser/e1/wissen_s{stufe}.png"
    save(img, rel, eintraege, id_=id_, felder=felder)
    save_fenster(w, h, fenster_pts, rel, id_, felder, eintraege, rund=True)


def uw_turm(stufe: int, eintraege: list[dict]) -> None:
    felder = (1, 1)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 130 + stufe * 12)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    hoehe = 70 + (stufe - 1) * 12
    kasten(d, cx, fuss, bw * 0.55, bh * 0.55, hoehe, UW_WAND, UW_DACH_HELL, stufe=stufe)
    # Leuchtfeuer
    d.ellipse([cx - 10, fuss - hoehe - 18, cx + 10, fuss - hoehe + 2], fill=hex_rgb("#FFC85A"))
    d.ellipse([cx - 6, fuss - hoehe - 14, cx + 6, fuss - hoehe - 2], fill=hex_rgb("#FFF0B8"))
    save(
        img,
        f"gebaeude/unterwasser/e1/turm_s{stufe}.png",
        eintraege,
        id_=f"unterwasser/e1/turm_s{stufe}",
        felder=felder,
    )


def uw_eingang(eintraege: list[dict]) -> None:
    felder = (1, 1)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 72)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    poly(d, diamond(cx, fuss, bw, bh), SCHATTEN)
    d.ellipse([cx - 28, fuss - 56, cx + 28, fuss - 4], fill=hex_rgb(UW_WAND), outline=KONTUR)
    d.ellipse([cx - 16, fuss - 44, cx + 16, fuss - 12], fill=hex_rgb("#1a3040"))
    d.arc([cx - 20, fuss - 50, cx + 20, fuss - 10], start=200, end=340, fill=hex_rgb(UW_DACH), width=3)
    save(
        img,
        "gebaeude/unterwasser/e1/eingang_s1.png",
        eintraege,
        id_="unterwasser/e1/eingang_s1",
        felder=felder,
    )


def uw_einfassung(eintraege: list[dict]) -> None:
    felder = (1, 1)
    w, h = 96, 100
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    cx, fuss = w / 2, h - 6
    poly(d, diamond(cx, fuss, 72, 36), SCHATTEN)
    for ox, s in ((-22, 0.9), (0, 1.1), (22, 0.95)):
        x = cx + ox
        poly(
            d,
            [(x, fuss), (x - 8 * s, fuss - 22 * s), (x + 4 * s, fuss - 14 * s)],
            hex_rgb(UW_KORALLE),
        )
        poly(
            d,
            [(x, fuss), (x + 9 * s, fuss - 24 * s), (x + 2 * s, fuss - 12 * s)],
            shade(UW_KORALLE, 20),
        )
    save(
        img,
        "gebaeude/unterwasser/e1/einfassung_s1.png",
        eintraege,
        id_="unterwasser/e1/einfassung_s1",
        felder=felder,
    )


def uw_ursprung(eintraege: list[dict]) -> None:
    felder = (1, 1)
    w, h = 96, 120
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    cx, fuss = w / 2, h - 8
    poly(d, diamond(cx, fuss, 72, 36), SCHATTEN)
    d.ellipse([cx - 16, fuss - 8, cx + 16, fuss + 4], fill=hex_rgb("#4a5560"))
    # Anker
    d.line([(cx, fuss - 8), (cx, fuss - 48)], fill=hex_rgb("#6a7580"), width=3)
    d.arc([cx - 14, fuss - 28, cx + 14, fuss - 4], start=20, end=160, fill=hex_rgb("#6a7580"), width=3)
    d.ellipse([cx - 6, fuss - 54, cx + 6, fuss - 42], fill=hex_rgb("#6a7580"), outline=KONTUR)
    save(
        img,
        "gebaeude/unterwasser/e1/ursprung_s1.png",
        eintraege,
        id_="unterwasser/e1/ursprung_s1",
        felder=felder,
    )


def uw_zeichen(eintraege: list[dict]) -> None:
    felder = (1, 1)
    w, h = 96, 120
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    cx, fuss = w / 2, h - 6
    poly(d, diamond(cx, fuss, 64, 32), SCHATTEN)
    d.line([(cx, fuss), (cx, fuss - 50)], fill=hex_rgb("#d0d8e0"), width=2)
    d.ellipse([cx - 14, fuss - 70, cx + 14, fuss - 42], fill=hex_rgb(UW_DACH), outline=KONTUR)
    d.ellipse([cx - 6, fuss - 62, cx + 6, fuss - 50], fill=hex_rgb("#1a3040"))
    save(
        img,
        "gebaeude/unterwasser/e1/zeichen_s1.png",
        eintraege,
        id_="unterwasser/e1/zeichen_s1",
        felder=felder,
    )


def uw_flaeche(eintraege: list[dict]) -> None:
    felder = (2, 2)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 48)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    poly(d, diamond(cx, fuss, bw, bh), hex_rgb("#5a7060"))
    for ox, oy in ((-24, -28), (20, -32), (-8, -40), (10, -24), (0, -34)):
        d.ellipse(
            [cx + ox - 6, fuss + oy - 3, cx + ox + 6, fuss + oy + 3],
            fill=hex_rgb(UW_SEEGRAS),
        )
        d.line(
            [(cx + ox, fuss + oy), (cx + ox, fuss + oy - 10)],
            fill=shade(UW_SEEGRAS, 20),
            width=2,
        )
    save(
        img,
        "gebaeude/unterwasser/e1/flaeche_s1.png",
        eintraege,
        id_="unterwasser/e1/flaeche_s1",
        felder=felder,
    )


def uw_denkmal(eintraege: list[dict]) -> None:
    felder = (1, 1)
    w, h = 96, 120
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    cx, fuss = w / 2, h - 6
    poly(d, diamond(cx, fuss, 64, 32), SCHATTEN)
    d.ellipse([cx - 20, fuss - 28, cx + 20, fuss + 2], fill=hex_rgb("#d4a574"), outline=KONTUR)
    d.ellipse([cx - 10, fuss - 40, cx + 14, fuss - 16], fill=shade("#d4a574", 20), outline=KONTUR)
    d.ellipse([cx - 4, fuss - 22, cx + 6, fuss - 12], fill=hex_rgb("#f0e8d8"))
    save(
        img,
        "gebaeude/unterwasser/e1/denkmal_s1.png",
        eintraege,
        id_="unterwasser/e1/denkmal_s1",
        felder=felder,
    )


def uw_boden(eintraege: list[dict]) -> None:
    save(
        _boden_raute(UW_SAND, UW_SAND_HELL, seed=3, details="sand"),
        "boden/unterwasser/e1/flaeche.png",
        eintraege,
        id_="boden/unterwasser/e1/flaeche",
        felder=(1, 1),
    )
    save(
        _boden_raute(UW_RAND, "#1a3850", seed=12, details="sand"),
        "boden/unterwasser/e1/rand.png",
        eintraege,
        id_="boden/unterwasser/e1/rand",
        felder=(1, 1),
    )
    save(
        _boden_raute(UW_SAND_DUNKEL, UW_SAND, seed=7, details="sand"),
        "boden/unterwasser/e1/flaeche_b.png",
        eintraege,
        id_="boden/unterwasser/e1/flaeche_b",
        felder=(1, 1),
    )
    save(
        _boden_raute("#d0c4a0", UW_SAND_HELL, seed=9, details="sand"),
        "boden/unterwasser/e1/flaeche_hell.png",
        eintraege,
        id_="boden/unterwasser/e1/flaeche_hell",
        felder=(1, 1),
    )


def uw_wesen(art: str, zyklus: str, frame: int, eintraege: list[dict]) -> None:
    size = 64
    img = new_img(size, size)
    d = ImageDraw.Draw(img)
    cx, cy = size / 2, size - 8
    bob = math.sin(frame * 1.2) * 2.5
    if zyklus == "react":
        bob -= 5 + frame * 2
    walk = (frame % 4) * 2 - 3 if zyklus == "walk" else 0
    pulse = frame % 2

    if art == "fisch":
        body = hex_rgb("#5a9ccc")
        d.ellipse([cx - 14, cy - 18 + bob, cx + 10, cy - 4 + bob], fill=body, outline=KONTUR)
        poly(
            d,
            [
                (cx - 12, cy - 11 + bob),
                (cx - 22, cy - 18 + bob),
                (cx - 22, cy - 4 + bob),
            ],
            shade("#5a9ccc", 20),
        )
        d.ellipse([cx + 4, cy - 15 + bob, cx + 8, cy - 11 + bob], fill=hex_rgb("#2B2620"))
        d.line([(cx + 2, cy - 4 + bob), (cx + 2 + walk, cy)], fill=body, width=1)
    elif art == "qualle":
        body = hex_rgb("#d4a0e0")
        d.ellipse(
            [cx - 14, cy - 28 + bob, cx + 14, cy - 10 + bob],
            fill=body,
            outline=KONTUR,
        )
        d.ellipse(
            [cx - 10, cy - 24 + bob, cx + 10, cy - 14 + bob],
            fill=shade("#d4a0e0", 30),
        )
        for ox in (-8, -2, 4, 10):
            d.line(
                [(cx + ox, cy - 10 + bob), (cx + ox + pulse, cy - 2 + bob + abs(ox) // 2)],
                fill=shade("#d4a0e0", -20),
                width=2,
            )
    else:  # krebs
        body = hex_rgb("#d4784a")
        d.ellipse([cx - 12, cy - 16 + bob, cx + 12, cy - 2 + bob], fill=body, outline=KONTUR)
        # Scheren
        d.ellipse([cx - 22, cy - 20 + bob, cx - 10, cy - 8 + bob], fill=shade("#d4784a", 10), outline=KONTUR)
        d.ellipse([cx + 10, cy - 20 + bob, cx + 22, cy - 8 + bob], fill=shade("#d4784a", 10), outline=KONTUR)
        for ox in (-8, -2, 4, 10):
            d.line(
                [(cx + ox, cy - 2 + bob), (cx + ox + walk // 2, cy + 2)],
                fill=hex_rgb("#2B2620"),
                width=1,
            )

    rel = f"wesen/unterwasser/{art}_{zyklus}_{frame}.png"
    save(img, rel, eintraege, id_=f"wesen/unterwasser/{art}_{zyklus}_{frame}", felder=(1, 1))


# ──────────────────── Weltraum ────────────────────


def ws_kern(stufe: int, eintraege: list[dict]) -> None:
    felder = (3, 3)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 110 + stufe * 12)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    hoehe = 48 + (stufe - 1) * 10
    top = kasten(d, cx, fuss, bw * 0.78, bh * 0.78, hoehe, WS_METALL, WS_DACH, stufe=stufe)
    # Antenne / Kuppel
    d.ellipse([cx - 10, top - 16, cx + 10, top + 4], fill=hex_rgb("#FFC85A"), outline=KONTUR)
    fenster_pts = [
        (cx - bw * 0.16, fuss - bh * 0.2 - hoehe * 0.4),
        (cx + bw * 0.16, fuss - bh * 0.2 - hoehe * 0.4),
    ]
    if stufe >= 2:
        fenster_pts.append((cx, fuss - bh * 0.15 - hoehe * 0.65))
    for px, py in fenster_pts:
        fenster(d, px, py)
    id_ = f"weltraum/e1/kern_s{stufe}"
    rel = f"gebaeude/weltraum/e1/kern_s{stufe}.png"
    save(img, rel, eintraege, id_=id_, felder=felder)
    save_fenster(w, h, fenster_pts, rel, id_, felder, eintraege)


def ws_werkstatt(eintraege: list[dict]) -> None:
    felder = (2, 2)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 76)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    kasten(d, cx, fuss, bw, bh, 40, WS_METALL_HELL, WS_METALL_DUNKEL)
    fenster_pts = [(cx - bw * 0.1, fuss - bh * 0.25 - 18)]
    for px, py in fenster_pts:
        fenster(d, px, py)
    # Kranarm
    d.line([(cx + bw * 0.2, fuss - 40), (cx + bw * 0.35, fuss - 55)], fill=hex_rgb(WS_DACH), width=3)
    id_ = "weltraum/e1/werkstatt_s1"
    rel = "gebaeude/weltraum/e1/werkstatt_s1.png"
    save(img, rel, eintraege, id_=id_, felder=felder)
    save_fenster(w, h, fenster_pts, rel, id_, felder, eintraege)


def ws_wissen(stufe: int, eintraege: list[dict]) -> None:
    felder = (2, 2)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 90 + stufe * 8)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    hoehe = 46 + (stufe - 1) * 8
    top = kasten(d, cx, fuss, bw, bh, hoehe, WS_METALL, "#a0b8e0", stufe=stufe)
    # Kuppel / Teleskop
    d.ellipse([cx - 14, top - 8, cx + 14, top + 12], fill=hex_rgb("#c8d8f0"), outline=KONTUR)
    fenster_pts = [
        (cx - bw * 0.14, fuss - bh * 0.22 - hoehe * 0.35),
        (cx + bw * 0.14, fuss - bh * 0.22 - hoehe * 0.35),
    ]
    for px, py in fenster_pts:
        fenster(d, px, py)
    id_ = f"weltraum/e1/wissen_s{stufe}"
    rel = f"gebaeude/weltraum/e1/wissen_s{stufe}.png"
    save(img, rel, eintraege, id_=id_, felder=felder)
    save_fenster(w, h, fenster_pts, rel, id_, felder, eintraege)


def ws_turm(stufe: int, eintraege: list[dict]) -> None:
    felder = (1, 1)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 130 + stufe * 12)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    hoehe = 68 + (stufe - 1) * 12
    kasten(d, cx, fuss, bw * 0.4, bh * 0.4, hoehe, WS_METALL, WS_DACH, stufe=stufe)
    # Antennen
    tip = fuss - hoehe - 4
    d.line([(cx, tip), (cx + 18, tip - 14)], fill=hex_rgb(WS_DACH), width=2)
    d.line([(cx, tip), (cx - 18, tip - 14)], fill=hex_rgb(WS_DACH), width=2)
    if stufe >= 2:
        d.line([(cx, tip), (cx + 8, tip - 20)], fill=hex_rgb(WS_DACH_HELL), width=2)
    save(
        img,
        f"gebaeude/weltraum/e1/turm_s{stufe}.png",
        eintraege,
        id_=f"weltraum/e1/turm_s{stufe}",
        felder=felder,
    )


def ws_eingang(eintraege: list[dict]) -> None:
    felder = (1, 1)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 70)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    poly(d, diamond(cx, fuss, bw, bh), SCHATTEN)
    kasten(d, cx, fuss, bw * 0.85, bh * 0.7, 36, WS_METALL, WS_DACH)
    d.ellipse([cx - 10, fuss - 30, cx + 10, fuss - 10], fill=hex_rgb("#1a2030"), outline=KONTUR)
    d.arc([cx - 12, fuss - 32, cx + 12, fuss - 8], start=200, end=340, fill=hex_rgb(WS_DACH), width=2)
    save(img, "gebaeude/weltraum/e1/eingang_s1.png", eintraege, id_="weltraum/e1/eingang_s1", felder=felder)


def ws_einfassung(eintraege: list[dict]) -> None:
    felder = (1, 1)
    w, h = 96, 96
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    cx, fuss = w / 2, h - 6
    poly(d, diamond(cx, fuss, 72, 36), SCHATTEN)
    for ox in (-24, -8, 8, 24):
        d.rectangle(
            [cx + ox - 3, fuss - 28, cx + ox + 3, fuss - 2],
            fill=hex_rgb("#5a6880"),
            outline=KONTUR,
        )
    d.line([(cx - 28, fuss - 22), (cx + 28, fuss - 22)], fill=hex_rgb(WS_DACH), width=2)
    save(
        img,
        "gebaeude/weltraum/e1/einfassung_s1.png",
        eintraege,
        id_="weltraum/e1/einfassung_s1",
        felder=felder,
    )


def ws_ursprung(eintraege: list[dict]) -> None:
    felder = (1, 1)
    w, h = 96, 110
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    cx, fuss = w / 2, h - 8
    poly(d, diamond(cx, fuss, 80, 40), SCHATTEN)
    poly(d, diamond(cx, fuss - 4, 64, 28), hex_rgb("#4a5568"))
    d.ellipse([cx - 10, fuss - 16, cx + 10, fuss - 2], fill=hex_rgb("#FFC85A"), outline=KONTUR)
    d.ellipse([cx - 5, fuss - 12, cx + 5, fuss - 4], fill=hex_rgb("#FFF0B8"))
    save(img, "gebaeude/weltraum/e1/ursprung_s1.png", eintraege, id_="weltraum/e1/ursprung_s1", felder=felder)


def ws_zeichen(eintraege: list[dict]) -> None:
    felder = (1, 1)
    w, h = 96, 120
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    cx, fuss = w / 2, h - 6
    poly(d, diamond(cx, fuss, 64, 32), SCHATTEN)
    d.line([(cx, fuss), (cx, fuss - 70)], fill=hex_rgb("#d0d8e0"), width=2)
    poly(d, [(cx, fuss - 70), (cx + 16, fuss - 58), (cx, fuss - 46)], hex_rgb(WS_DACH))
    save(img, "gebaeude/weltraum/e1/zeichen_s1.png", eintraege, id_="weltraum/e1/zeichen_s1", felder=felder)


def ws_flaeche(eintraege: list[dict]) -> None:
    felder = (2, 2)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 48)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    poly(d, diamond(cx, fuss, bw, bh), hex_rgb("#2a3448"))
    for ox, oy, s in ((-22, -30, 5), (18, -34, 6), (0, -42, 4), (10, -26, 5)):
        d.ellipse(
            [cx + ox - s, fuss + oy - s, cx + ox + s, fuss + oy + s],
            fill=hex_rgb(WS_KRISTALL),
            outline=KONTUR,
        )
        d.ellipse(
            [cx + ox - s // 2, fuss + oy - s // 2, cx + ox + s // 2, fuss + oy + s // 2],
            fill=shade(WS_KRISTALL, 40),
        )
    save(img, "gebaeude/weltraum/e1/flaeche_s1.png", eintraege, id_="weltraum/e1/flaeche_s1", felder=felder)


def ws_denkmal(eintraege: list[dict]) -> None:
    felder = (1, 1)
    w, h = 96, 130
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    cx, fuss = w / 2, h - 6
    poly(d, diamond(cx, fuss, 64, 32), SCHATTEN)
    # Satellit
    d.ellipse([cx - 12, fuss - 40, cx + 12, fuss - 16], fill=hex_rgb("#a0b0c0"), outline=KONTUR)
    d.rectangle([cx - 28, fuss - 34, cx - 12, fuss - 22], fill=hex_rgb(WS_DACH), outline=KONTUR)
    d.rectangle([cx + 12, fuss - 34, cx + 28, fuss - 22], fill=hex_rgb(WS_DACH), outline=KONTUR)
    d.ellipse([cx - 5, fuss - 34, cx + 5, fuss - 24], fill=hex_rgb("#FFC85A"))
    d.line([(cx, fuss - 16), (cx, fuss - 4)], fill=hex_rgb(WS_METALL), width=2)
    save(img, "gebaeude/weltraum/e1/denkmal_s1.png", eintraege, id_="weltraum/e1/denkmal_s1", felder=felder)


def ws_boden(eintraege: list[dict]) -> None:
    save(
        _boden_raute(WS_PLATT, WS_PLATT_HELL, seed=4, details="metall"),
        "boden/weltraum/e1/flaeche.png",
        eintraege,
        id_="boden/weltraum/e1/flaeche",
        felder=(1, 1),
    )
    save(
        _boden_raute(WS_RAND, "#121828", seed=14, details="metall"),
        "boden/weltraum/e1/rand.png",
        eintraege,
        id_="boden/weltraum/e1/rand",
        felder=(1, 1),
    )
    save(
        _boden_raute(WS_PLATT_DUNKEL, WS_PLATT, seed=6, details="metall"),
        "boden/weltraum/e1/flaeche_b.png",
        eintraege,
        id_="boden/weltraum/e1/flaeche_b",
        felder=(1, 1),
    )
    save(
        _boden_raute("#5a6880", WS_PLATT_HELL, seed=10, details="metall"),
        "boden/weltraum/e1/flaeche_hell.png",
        eintraege,
        id_="boden/weltraum/e1/flaeche_hell",
        felder=(1, 1),
    )


def ws_wesen(art: str, zyklus: str, frame: int, eintraege: list[dict]) -> None:
    size = 64
    img = new_img(size, size)
    d = ImageDraw.Draw(img)
    cx, cy = size / 2, size - 8
    bob = math.sin(frame * 1.3) * 2
    if zyklus == "react":
        bob -= 6 + frame * 2
    walk = (frame % 4) * 2 - 3 if zyklus == "walk" else 0
    glow = frame % 2

    if art == "drohne":
        body = hex_rgb("#a0e8d4")
        d.ellipse([cx - 10, cy - 22 + bob, cx + 10, cy - 8 + bob], fill=body, outline=KONTUR)
        d.ellipse(
            [cx - 4, cy - 18 + bob, cx + 4, cy - 12 + bob],
            fill=hex_rgb("#FFC85A" if glow else "#FFF0B8"),
        )
        for ox in (-14, 14):
            d.ellipse(
                [cx + ox - 5, cy - 20 + bob, cx + ox + 5, cy - 12 + bob],
                fill=(200, 240, 255, 140),
            )
        d.line([(cx, cy - 8 + bob), (cx + walk, cy - 2)], fill=hex_rgb("#6a7688"), width=1)
    else:  # roboter
        body = hex_rgb("#8a96a8")
        d.rectangle([cx - 10, cy - 32 + bob, cx + 10, cy - 8 + bob], fill=body, outline=KONTUR)
        d.ellipse([cx - 8, cy - 46 + bob, cx + 8, cy - 30 + bob], fill=hex_rgb("#a8b4c4"), outline=KONTUR)
        d.ellipse([cx - 3, cy - 40 + bob, cx + 3, cy - 34 + bob], fill=hex_rgb("#5ec4d4"))
        d.rectangle([cx - 14, cy - 28 + bob, cx - 10, cy - 14 + bob], fill=hex_rgb("#6a7688"))
        d.rectangle([cx + 10, cy - 28 + bob, cx + 14, cy - 14 + bob], fill=hex_rgb("#6a7688"))
        d.ellipse([cx - 8 + walk, cy - 8, cx - 2 + walk, cy], fill=hex_rgb("#5a6880"))
        d.ellipse([cx + 2 - walk, cy - 8, cx + 8 - walk, cy], fill=hex_rgb("#5a6880"))

    rel = f"wesen/weltraum/{art}_{zyklus}_{frame}.png"
    save(img, rel, eintraege, id_=f"wesen/weltraum/{art}_{zyklus}_{frame}", felder=(1, 1))


def thema_gebaeude_und_boden(thema: str, eintraege: list[dict]) -> None:
    if thema == "bastion":
        for s in (1, 2, 3):
            bastion_kern(s, eintraege)
        bastion_werkstatt(eintraege)
        for s in (1, 2):
            bastion_wissen(s, eintraege)
        for s in (1, 2):
            bastion_turm(s, eintraege)
        bastion_eingang(eintraege)
        bastion_einfassung(eintraege)
        bastion_ursprung(eintraege)
        bastion_zeichen(eintraege)
        bastion_flaeche(eintraege)
        bastion_denkmal(eintraege)
        bastion_boden(eintraege)
    elif thema == "unterwasser":
        for s in (1, 2, 3):
            uw_kern(s, eintraege)
        uw_werkstatt(eintraege)
        for s in (1, 2):
            uw_wissen(s, eintraege)
        for s in (1, 2):
            uw_turm(s, eintraege)
        uw_eingang(eintraege)
        uw_einfassung(eintraege)
        uw_ursprung(eintraege)
        uw_zeichen(eintraege)
        uw_flaeche(eintraege)
        uw_denkmal(eintraege)
        uw_boden(eintraege)
    else:
        for s in (1, 2, 3):
            ws_kern(s, eintraege)
        ws_werkstatt(eintraege)
        for s in (1, 2):
            ws_wissen(s, eintraege)
        for s in (1, 2):
            ws_turm(s, eintraege)
        ws_eingang(eintraege)
        ws_einfassung(eintraege)
        ws_ursprung(eintraege)
        ws_zeichen(eintraege)
        ws_flaeche(eintraege)
        ws_denkmal(eintraege)
        ws_boden(eintraege)


def thema_wesen(thema: str, eintraege: list[dict]) -> None:
    frames = {"idle": 3, "walk": 4, "react": 2}
    if thema == "bastion":
        arten = ("moewe", "fuchs", "wache")
        fn = bastion_wesen
    elif thema == "unterwasser":
        arten = ("fisch", "qualle", "krebs")
        fn = uw_wesen
    else:
        arten = ("drohne", "roboter")
        fn = ws_wesen
    for art in arten:
        for zyklus, n in frames.items():
            for i in range(n):
                fn(art, zyklus, i, eintraege)


def main() -> None:
    neu: list[dict] = []
    for thema in ("bastion", "unterwasser", "weltraum"):
        thema_gebaeude_und_boden(thema, neu)
        thema_wesen(thema, neu)

    p3_ids = {e["id"] for e in neu}
    eintraege = list(neu)
    manifest_pfad = ATLAS / "manifest.json"
    if manifest_pfad.exists():
        alt = json.loads(manifest_pfad.read_text(encoding="utf-8"))
        for e in alt.get("eintraege", []):
            if e.get("id") not in p3_ids:
                eintraege.append(e)
    manifest = {"version": 1, "eintraege": eintraege}
    manifest_pfad.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"P3 Themen: {len(neu)} neu, {len(eintraege)} gesamt → {manifest_pfad}")


if __name__ == "__main__":
    main()
