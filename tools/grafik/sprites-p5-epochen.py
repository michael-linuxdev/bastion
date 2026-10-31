#!/usr/bin/env python3
"""
Deterministischer Generator für Sprite-Charge P5
(Epoche 2–4 Gebäude je Thema nach Katalog G9 / GRAFIK-SPRITES.md §8).

Je Thema und Epoche 2–4: alle Stufen, die in dieser Epoche baubar sind
(reifere Optik: Stein/Metall/Gold, höher), inkl. Abend-Fenster wo Öffnungen.
Boden-Kacheln je Epoche (leicht edler). Keine Wesen (P0–P3).

Ausgabe unter public/grafik/atlas/; Manifest wird gemergt.
Aufruf: python3 tools/grafik/sprites-p5-epochen.py
"""
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
ATLAS = ROOT / "public" / "grafik" / "atlas"

THEMEN = ("bastion", "garten", "weltraum", "dorf", "unterwasser")
EPOCHEN = (2, 3, 4)

# Stufen je Rolle, die in Epoche e baubar sind (katalog.ts / epochen.ts)
STUFEN_BIS: dict[int, dict[str, tuple[int, ...]]] = {
    2: {
        "kern": (1, 2, 3, 4, 5),
        "werkstatt": (1, 2),
        "wissen": (1, 2, 3),
        "turm": (1, 2, 3),
        "eingang": (1, 2),
        "einfassung": (1,),
        "ursprung": (1,),
        "zeichen": (1,),
        "flaeche": (1,),
        "denkmal": (1,),
    },
    3: {
        "kern": (1, 2, 3, 4, 5, 6, 7),
        "werkstatt": (1, 2, 3),
        "wissen": (1, 2, 3, 4),
        "turm": (1, 2, 3, 4),
        "eingang": (1, 2),
        "einfassung": (1,),
        "ursprung": (1,),
        "zeichen": (1,),
        "flaeche": (1,),
        "denkmal": (1,),
    },
    4: {
        "kern": (1, 2, 3, 4, 5, 6, 7, 8, 9),
        "werkstatt": (1, 2, 3),
        "wissen": (1, 2, 3, 4, 5),
        "turm": (1, 2, 3, 4, 5),
        "eingang": (1, 2),
        "einfassung": (1,),
        "ursprung": (1,),
        "zeichen": (1,),
        "flaeche": (1,),
        "denkmal": (1,),
    },
}

FELDER: dict[str, tuple[int, int]] = {
    "kern": (3, 3),
    "werkstatt": (2, 2),
    "wissen": (2, 2),
    "turm": (1, 1),
    "eingang": (1, 1),
    "einfassung": (1, 1),
    "ursprung": (1, 1),
    "zeichen": (1, 1),
    "flaeche": (2, 2),
    "denkmal": (1, 1),
}

# Rollen mit Abend-Fenster-Layer
FENSTER_ROLLEN = frozenset({"kern", "werkstatt", "wissen", "turm"})

KONTUR = (43, 38, 32, 100)
SCHATTEN = (0, 0, 0, 45)
FENSTER_TAG = "#3a2a16"
FENSTER_ABEND = "#FFC85A"
FENSTER_ABEND_KERN = "#FFF0B8"
FENSTER_RAHMEN = "#5c4030"
GOLD = "#c9a227"

# Themen-Paletten (wand, dach, boden, boden_hell, akzent, detail)
PALETTE: dict[str, dict[str, str]] = {
    "bastion": {
        "wand": "#c4b29a",
        "dach": "#C4603A",
        "boden": "#67a24a",
        "boden_hell": "#86b85c",
        "akzent": "#1F7A72",
        "detail": "#8a7e72",
        "holz": "#7b5a3c",
    },
    "garten": {
        "wand": "#d4c4a8",
        "dach": "#5a8f4a",
        "boden": "#7cb85c",
        "boden_hell": "#9ad070",
        "akzent": "#c4783a",
        "detail": "#6b8f5a",
        "holz": "#8a6840",
    },
    "dorf": {
        "wand": "#c8b89a",
        "dach": "#C4603A",
        "boden": "#67a24a",
        "boden_hell": "#86b85c",
        "akzent": "#3d5c8a",
        "detail": "#8a7e72",
        "holz": "#7b5a3c",
    },
    "unterwasser": {
        "wand": "#7a9aab",
        "dach": "#3dbea5",
        "boden": "#b8a878",
        "boden_hell": "#c4b896",
        "akzent": "#d4786a",
        "detail": "#2d6a4c",
        "holz": "#5a7060",
    },
    "weltraum": {
        "wand": "#8a96a8",
        "dach": "#5ec4d4",
        "boden": "#3a465c",
        "boden_hell": "#4a5670",
        "akzent": "#7aecd4",
        "detail": "#6a7688",
        "holz": "#5a6878",
    },
}


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


def epoche_wand(wand: str, epoche: int) -> str:
    """Kühler / steiniger ab Epoche 2 (analog epoche-optik wandFaktor)."""
    faktor = {2: 0.88, 3: 0.80, 4: 0.74}[epoche]
    r, g, b = hex_rgb(wand)
    return "#{:02x}{:02x}{:02x}".format(
        max(0, min(255, round(r * faktor))),
        max(0, min(255, round(g * faktor))),
        max(0, min(255, round(b * faktor))),
    )


def epoche_boden(farbe: str, epoche: int) -> str:
    faktor = {2: 0.96, 3: 0.92, 4: 0.90}[epoche]
    r, g, b = hex_rgb(farbe)
    return "#{:02x}{:02x}{:02x}".format(
        max(0, min(255, round(r * faktor))),
        max(0, min(255, round(g * faktor))),
        max(0, min(255, round(b * faktor))),
    )


def hoehe_plus(epoche: int) -> int:
    return {2: 4, 3: 8, 4: 12}[epoche]


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


def canvas_for(felder: tuple[int, int], extra_h: int) -> tuple[int, int, float, float, float, float]:
    fw, ft = felder
    bw = ((fw + ft) / 2) * 96
    bh = ((fw + ft) / 2) * 48
    w = int(bw + 8)
    h = int(bh + extra_h + 16)
    cx = w / 2
    fuss = h - 4
    return w, h, cx, fuss, bw, bh


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
    epoche: int = 2,
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
    # Epoche 3+: steinerne Zinnen / Metall-Kante
    if epoche >= 3:
        for ox in (-bw * 0.18, 0.0, bw * 0.18):
            draw.rectangle(
                [cx + ox - 5, oben_n[1] - 2, cx + ox + 5, oben_n[1] + 8],
                fill=shade(wand, -20),
                outline=KONTUR,
            )
    if epoche >= 4:
        draw.ellipse(
            [mid[0] - 4, mid[1] - 6, mid[0] + 4, mid[1] + 2],
            fill=hex_rgb(GOLD),
            outline=KONTUR,
        )
    draw.line(
        [tuple(map(round, p)) for p in dach_pts + [dach_pts[0]]],
        fill=KONTUR,
        width=1,
    )
    if stufe > 1:
        for i in range(min(stufe, 9)):
            draw.ellipse(
                [s[0] - 6 - i * 8, s[1] - 10, s[0] - 2 - i * 8, s[1] - 6],
                fill=hex_rgb("#f0c14a" if epoche < 4 else GOLD),
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
    anker: tuple[float, float] = (0.5, 1.0),
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


def _in_raute(px: float, py: float, cx: float = 48, cy: float = 24, hw: float = 48, hh: float = 24) -> bool:
    return abs(px - cx) / hw + abs(py - cy) / hh <= 1.0


def boden_kachel(thema: str, epoche: int, art: str, eintraege: list[dict]) -> None:
    pal = PALETTE[thema]
    farbe = epoche_boden(pal["boden"], epoche)
    hell = epoche_boden(pal["boden_hell"], epoche)
    if art == "rand":
        farbe = shade_hex(farbe, -40)
        hell = shade_hex(hell, -30)
    elif art == "flaeche_hell":
        farbe = hell
        hell = shade_hex(hell, 18)
    elif art == "flaeche_b":
        farbe = shade_hex(farbe, -8)
    img = new_img(96, 48)
    d = ImageDraw.Draw(img)
    raute = [(48, 0), (96, 24), (48, 48), (0, 24)]
    poly(d, raute, hex_rgb(farbe))
    poly(d, [(48, 5), (88, 24), (48, 43), (8, 24)], hex_rgb(hell))
    seed = epoche * 17 + (sum(ord(c) for c in thema + art) % 97)
    for i in range(16):
        t = (seed * 19 + i * 91) % 1000
        px = 12 + (t * 11) % 72
        py = 8 + (t * 9) % 32
        if not _in_raute(px, py, hw=40, hh=18):
            continue
        ton = shade(hell, 12 if i % 2 == 0 else -10)
        d.point((px, py), fill=ton)
    if epoche >= 4:
        d.ellipse([44, 20, 52, 28], fill=(*hex_rgb(GOLD), 80))
    d.line(raute + [raute[0]], fill=(30, 40, 30, 40), width=1)
    id_ = f"boden/{thema}/e{epoche}/{art}"
    rel = f"boden/{thema}/e{epoche}/{art}.png"
    save(img, rel, eintraege, id_=id_, felder=(1, 1), anker=(0.5, 1.0))


def shade_hex(h: str, delta: int) -> str:
    r, g, b = shade(h, delta)
    return "#{:02x}{:02x}{:02x}".format(r, g, b)


def zeichne_rolle(
    thema: str,
    epoche: int,
    rolle: str,
    stufe: int,
    eintraege: list[dict],
) -> None:
    pal = PALETTE[thema]
    wand = epoche_wand(pal["wand"], epoche)
    dach = pal["dach"]
    akzent = pal["akzent"]
    detail = pal["detail"]
    holz = pal["holz"]
    felder = FELDER[rolle]
    plus = hoehe_plus(epoche)
    rund = thema == "unterwasser"

    if rolle == "kern":
        w, h, cx, fuss, bw, bh = canvas_for(felder, 120 + stufe * 14 + plus)
        img = new_img(w, h)
        d = ImageDraw.Draw(img)
        hoehe = 56 + (stufe - 1) * 12 + plus
        top = kasten(
            d,
            cx,
            fuss,
            bw * 0.72,
            bh * 0.72,
            hoehe,
            wand,
            dach,
            stufe=stufe,
            epoche=epoche,
            kuppel=thema in ("unterwasser", "weltraum"),
        )
        fenster_pts = [
            (cx - bw * 0.12, fuss - bh * 0.2 - hoehe * 0.45),
            (cx + bw * 0.12, fuss - bh * 0.2 - hoehe * 0.45),
        ]
        if stufe >= 2:
            fenster_pts.append((cx, fuss - bh * 0.15 - hoehe * 0.7))
        if stufe >= 4:
            fenster_pts.append((cx - bw * 0.08, fuss - bh * 0.18 - hoehe * 0.55))
            fenster_pts.append((cx + bw * 0.08, fuss - bh * 0.18 - hoehe * 0.55))
        for px, py in fenster_pts:
            fenster(d, px, py, rund=rund)
        if stufe >= 3:
            d.line([(cx, top - 4), (cx, top - 28 - plus // 2)], fill=hex_rgb("#f4efe4"), width=2)
            poly(
                d,
                [(cx, top - 28 - plus // 2), (cx + 14, top - 20), (cx, top - 12)],
                hex_rgb(akzent),
            )
        if epoche >= 4 and stufe >= 8:
            d.ellipse([cx - 8, top - 40, cx + 8, top - 24], fill=hex_rgb(GOLD), outline=KONTUR)
    elif rolle == "werkstatt":
        w, h, cx, fuss, bw, bh = canvas_for(felder, 80 + plus + stufe * 6)
        img = new_img(w, h)
        d = ImageDraw.Draw(img)
        hoehe = 44 + (stufe - 1) * 8 + plus
        kasten(d, cx, fuss, bw, bh, hoehe, shade_hex(wand, 12), holz, stufe=stufe, epoche=epoche)
        fenster_pts = [(cx - bw * 0.12, fuss - bh * 0.28 - hoehe * 0.5)]
        if stufe >= 2:
            fenster_pts.append((cx + bw * 0.12, fuss - bh * 0.28 - hoehe * 0.5))
        for px, py in fenster_pts:
            fenster(d, px, py, rund=rund)
        d.rectangle(
            [cx + bw * 0.18, fuss - 36 - plus // 2, cx + bw * 0.22, fuss - 8],
            fill=hex_rgb(holz),
        )
    elif rolle == "wissen":
        w, h, cx, fuss, bw, bh = canvas_for(felder, 86 + stufe * 8 + plus)
        img = new_img(w, h)
        d = ImageDraw.Draw(img)
        hoehe = 48 + (stufe - 1) * 10 + plus
        wissen_dach = akzent if thema != "garten" else "#3d5c8a"
        kasten(
            d,
            cx,
            fuss,
            bw,
            bh,
            hoehe,
            shade_hex(wand, 10),
            wissen_dach,
            stufe=stufe,
            epoche=epoche,
            kuppel=stufe >= 3,
        )
        fenster_pts = [
            (cx - bw * 0.14, fuss - bh * 0.25 - hoehe * 0.4),
            (cx + bw * 0.14, fuss - bh * 0.25 - hoehe * 0.4),
        ]
        if stufe >= 3:
            fenster_pts.append((cx, fuss - bh * 0.2 - hoehe * 0.65))
        for px, py in fenster_pts:
            fenster(d, px, py, rund=rund)
    elif rolle == "turm":
        w, h, cx, fuss, bw, bh = canvas_for(felder, 130 + stufe * 12 + plus)
        img = new_img(w, h)
        d = ImageDraw.Draw(img)
        hoehe = 72 + (stufe - 1) * 14 + plus
        kasten(
            d,
            cx,
            fuss,
            bw * 0.7,
            bh * 0.7,
            hoehe,
            detail,
            dach,
            stufe=stufe,
            epoche=epoche,
        )
        fenster_pts = [(cx, fuss - bh * 0.2 - hoehe * 0.55)]
        if stufe >= 3:
            fenster_pts.append((cx, fuss - bh * 0.15 - hoehe * 0.35))
        for px, py in fenster_pts:
            fenster(d, px, py, rund=rund)
    elif rolle == "eingang":
        w, h, cx, fuss, bw, bh = canvas_for(felder, 70 + plus + (stufe - 1) * 10)
        img = new_img(w, h)
        d = ImageDraw.Draw(img)
        poly(d, diamond(cx, fuss, bw, bh), SCHATTEN)
        dicke = 6 + epoche
        for ox in (-24, 24):
            d.rectangle(
                [cx + ox - dicke // 2, fuss - 52 - plus, cx + ox + dicke // 2, fuss - 2],
                fill=hex_rgb(detail),
            )
        d.arc(
            [cx - 30, fuss - 70 - plus, cx + 30, fuss - 18],
            start=200,
            end=340,
            fill=hex_rgb(detail),
            width=4 + epoche,
        )
        tuer_h = 40 + (stufe - 1) * 6
        poly(d, [(cx - 14, fuss - 6), (cx - 4, fuss - tuer_h), (cx - 4, fuss - 6)], shade(holz, -20))
        poly(d, [(cx + 14, fuss - 6), (cx + 4, fuss - tuer_h), (cx + 4, fuss - 6)], shade(holz, -10))
        fenster_pts: list[tuple[float, float]] = []
    elif rolle == "einfassung":
        w, h = 96, 100 + plus
        img = new_img(w, h)
        d = ImageDraw.Draw(img)
        cx, fuss = w / 2, h - 6
        poly(d, diamond(cx, fuss, 72, 36), SCHATTEN)
        # Holz → Stein → fest → Zitadelle
        farbe = holz if epoche == 2 else detail
        if epoche >= 4:
            farbe = shade_hex(detail, -30)
        dicke = 3 + epoche
        for ox in (-24, -8, 8, 24):
            d.rectangle(
                [cx + ox - dicke, fuss - 36 - plus // 2, cx + ox + dicke, fuss - 2],
                fill=hex_rgb(farbe),
            )
        d.line(
            [(cx - 28, fuss - 28 - plus // 3), (cx + 28, fuss - 28 - plus // 3)],
            fill=hex_rgb(farbe),
            width=2 + epoche,
        )
        fenster_pts = []
    elif rolle == "ursprung":
        w, h, cx, fuss, bw, bh = canvas_for(felder, 50 + plus)
        img = new_img(w, h)
        d = ImageDraw.Draw(img)
        poly(d, diamond(cx, fuss, bw * 0.9, bh * 0.9), SCHATTEN)
        if thema == "garten":
            d.rectangle([cx - 18, fuss - 14, cx + 18, fuss - 8], fill=hex_rgb(holz))
            d.ellipse([cx - 10, fuss - 28, cx + 10, fuss - 12], fill=hex_rgb(akzent))
        elif thema == "unterwasser":
            d.ellipse([cx - 12, fuss - 20, cx + 12, fuss - 4], fill=hex_rgb(detail))
            d.line([(cx, fuss - 20), (cx, fuss - 40)], fill=hex_rgb(detail), width=3)
        elif thema == "weltraum":
            d.ellipse([cx - 20, fuss - 8, cx + 20, fuss - 2], fill=hex_rgb(detail))
            d.ellipse([cx - 8, fuss - 22, cx + 8, fuss - 8], fill=hex_rgb(akzent))
        else:
            d.ellipse([cx - 14, fuss - 18, cx + 14, fuss - 4], fill=shade(dach, -20))
            d.ellipse([cx - 6, fuss - 28, cx + 6, fuss - 14], fill=hex_rgb("#e07a4f"))
        fenster_pts = []
    elif rolle == "zeichen":
        w, h, cx, fuss, bw, bh = canvas_for(felder, 60 + plus)
        img = new_img(w, h)
        d = ImageDraw.Draw(img)
        poly(d, diamond(cx, fuss, bw * 0.7, bh * 0.7), SCHATTEN)
        d.rectangle([cx - 2, fuss - 48 - plus, cx + 2, fuss - 4], fill=hex_rgb(holz))
        poly(
            d,
            [
                (cx + 2, fuss - 48 - plus),
                (cx + 22, fuss - 40 - plus // 2),
                (cx + 2, fuss - 32),
            ],
            hex_rgb(akzent if epoche < 4 else GOLD),
        )
        fenster_pts = []
    elif rolle == "flaeche":
        w, h, cx, fuss, bw, bh = canvas_for(felder, 40 + plus)
        img = new_img(w, h)
        d = ImageDraw.Draw(img)
        poly(d, diamond(cx, fuss, bw, bh), SCHATTEN)
        poly(d, diamond(cx, fuss - 6, bw * 0.85, bh * 0.85), hex_rgb(pal["boden"]))
        for i in range(5 + epoche):
            ox = -20 + i * 10
            d.ellipse(
                [cx + ox - 3, fuss - 22 - (i % 3) * 4, cx + ox + 3, fuss - 16 - (i % 3) * 4],
                fill=hex_rgb(akzent),
            )
        fenster_pts = []
    else:  # denkmal
        w, h, cx, fuss, bw, bh = canvas_for(felder, 70 + plus)
        img = new_img(w, h)
        d = ImageDraw.Draw(img)
        poly(d, diamond(cx, fuss, bw * 0.8, bh * 0.8), SCHATTEN)
        d.rectangle([cx - 10, fuss - 12, cx + 10, fuss - 4], fill=hex_rgb(detail))
        d.ellipse(
            [cx - 12, fuss - 40 - plus // 2, cx + 12, fuss - 14],
            fill=hex_rgb(GOLD if epoche >= 4 else akzent),
            outline=KONTUR,
        )
        fenster_pts = []

    id_ = f"{thema}/e{epoche}/{rolle}_s{stufe}"
    rel = f"gebaeude/{thema}/e{epoche}/{rolle}_s{stufe}.png"
    save(img, rel, eintraege, id_=id_, felder=felder)
    if rolle in FENSTER_ROLLEN:
        save_fenster(w, h, fenster_pts, rel, id_, felder, eintraege, rund=rund)


def thema_epoche(thema: str, epoche: int, eintraege: list[dict]) -> None:
    stufen = STUFEN_BIS[epoche]
    for rolle, stufe_list in stufen.items():
        for stufe in stufe_list:
            zeichne_rolle(thema, epoche, rolle, stufe, eintraege)
    for art in ("flaeche", "rand", "flaeche_b", "flaeche_hell"):
        boden_kachel(thema, epoche, art, eintraege)
    # README-Platzhalter aktualisieren
    readme = ATLAS / thema / f"e{epoche}" / "README.md"
    readme.parent.mkdir(parents=True, exist_ok=True)
    readme.write_text(
        f"# Sprites für {thema}/e{epoche} – P5 (GRAFIK-SPRITES.md §8)\n",
        encoding="utf-8",
    )


def main() -> None:
    neu: list[dict] = []
    for thema in THEMEN:
        for epoche in EPOCHEN:
            thema_epoche(thema, epoche, neu)

    p5_ids = {e["id"] for e in neu}
    eintraege = list(neu)
    manifest_pfad = ATLAS / "manifest.json"
    if manifest_pfad.exists():
        alt = json.loads(manifest_pfad.read_text(encoding="utf-8"))
        for e in alt.get("eintraege", []):
            if e.get("id") not in p5_ids:
                eintraege.append(e)
    manifest = {"version": 1, "eintraege": eintraege}
    manifest_pfad.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"P5 Epochen: {len(neu)} neu, {len(eintraege)} gesamt → {manifest_pfad}")


if __name__ == "__main__":
    main()
