#!/usr/bin/env python3
"""
Deterministischer Generator für Sprite-Charge P2 (Garten, Epoche 1).
Ausgabe unter public/grafik/atlas/ nach GRAFIK-SPRITES.md.
Keine Laufzeitabhängigkeit der App – nur Offline-Erzeugung (Pillow).
Aufruf: python3 tools/grafik/sprites-p2-garten.py
Stil: Richtung A „Tag, warm“, fortgesetzt vom Dorf (P0) – grüner, blumiger.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
ATLAS = ROOT / "public" / "grafik" / "atlas"

# Farben Richtung A „Tag, warm“ + Garten-Akzente (GRAFIK.md / garten.ts)
DACH_GRUEN = "#3d8f6a"
DACH_GRUEN_HELL = "#5ab080"
DACH_GRUEN_DUNKEL = "#2a6a4e"
HOLZ = "#8b6a45"
HOLZ_HELL = "#a8845c"
HOLZ_DUNKEL = "#5c4030"
GLAS = "#a8d8e8"
GLAS_HELL = "#c5e8f2"
BLATT = "#2f7a3c"
BLATT_HELL = "#3f914c"
BLATT_HELLER = "#4aa058"
RASEN = "#5faa48"
RASEN_DUNKEL = "#4f9a3e"
RASEN_HELL = "#7cbc5a"
RAND = "#1e3a28"
PETROL = "#1F7A72"
PETROL_HELL = "#3dbea5"
BLUME_ROSA = "#e07a9a"
BLUME_GELB = "#e6c35c"
BLUME_BLAU = "#7a9ce0"
WAND_HELL = "#d5e8df"
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
    draw.line(
        [tuple(map(round, p)) for p in dach_pts + [dach_pts[0]]],
        fill=KONTUR,
        width=1,
    )
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


def laubkrone(draw: ImageDraw.ImageDraw, x: float, y: float, s: float = 1.0) -> None:
    draw.ellipse(
        [x - 14 * s, y - 4 * s, x + 14 * s, y + 6 * s],
        fill=SCHATTEN,
    )
    draw.ellipse(
        [x - 16 * s, y - 28 * s, x + 16 * s, y - 2 * s],
        fill=hex_rgb(BLATT),
    )
    draw.ellipse(
        [x - 20 * s, y - 24 * s, x - 2 * s, y - 6 * s],
        fill=hex_rgb(BLATT_HELL),
    )
    draw.ellipse(
        [x + 2 * s, y - 26 * s, x + 18 * s, y - 8 * s],
        fill=hex_rgb(BLATT_HELLER),
    )


def stamm(draw: ImageDraw.ImageDraw, x: float, y: float, h: float, s: float = 1.0) -> None:
    draw.rectangle(
        [x - 5 * s, y - h, x + 5 * s, y + 2 * s],
        fill=hex_rgb(HOLZ_DUNKEL),
    )


def fenster(draw: ImageDraw.ImageDraw, x: float, y: float, *, glas: bool = False) -> None:
    fill = hex_rgb(GLAS) if glas else hex_rgb("#3a2a16")
    draw.rectangle([x - 4, y - 5, x + 4, y + 5], fill=fill, outline=KONTUR)


def wimpel(draw: ImageDraw.ImageDraw, x: float, y: float) -> None:
    draw.line([(x, y + 10), (x, y - 22)], fill=hex_rgb("#f4efe4"), width=2)
    poly(
        draw,
        [(x, y - 22), (x + 16, y - 14), (x, y - 6)],
        hex_rgb(PETROL_HELL),
    )


def blume(draw: ImageDraw.ImageDraw, x: float, y: float, farbe: str) -> None:
    draw.ellipse([x - 3, y - 3, x + 3, y + 3], fill=hex_rgb(farbe))
    draw.ellipse([x - 1, y - 1, x + 1, y + 1], fill=hex_rgb("#f4efe4"))


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


def canvas_for(felder: tuple[int, int], extra_h: int) -> tuple[int, int, float, float, float, float]:
    fw, ft = felder
    bw = ((fw + ft) / 2) * 96
    bh = ((fw + ft) / 2) * 48
    w = int(bw + 8)
    h = int(bh + extra_h + 16)
    cx = w / 2
    fuss = h - 4
    return w, h, cx, fuss, bw, bh


def gebaeude_kern(stufe: int, eintraege: list[dict]) -> None:
    """Baumhaus: Stamm + Laub + hölzerne Hütte."""
    felder = (3, 3)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 140 + stufe * 16)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    hoehe = 48 + (stufe - 1) * 12
    # Stamm unter der Hütte
    stamm(d, cx, fuss - 8, 70 + stufe * 8, 1.2)
    laubkrone(d, cx - bw * 0.12, fuss - 90 - stufe * 6, 1.4 + stufe * 0.1)
    laubkrone(d, cx + bw * 0.18, fuss - 95 - stufe * 6, 1.15)
    top = kasten(d, cx, fuss - 28, bw * 0.55, bh * 0.55, hoehe, HOLZ, DACH_GRUEN, stufe=stufe)
    fenster(d, cx - bw * 0.08, fuss - 28 - bh * 0.2 - hoehe * 0.4)
    fenster(d, cx + bw * 0.08, fuss - 28 - bh * 0.2 - hoehe * 0.4)
    if stufe >= 2:
        # Seil / Leiter
        d.line([(cx - 20, fuss - 10), (cx - 8, top + 20)], fill=hex_rgb(HOLZ_HELL), width=2)
    if stufe >= 3:
        wimpel(d, cx + 6, top + 4)
    save(img, f"gebaeude/garten/e1/kern_s{stufe}.png", eintraege, id_=f"garten/e1/kern_s{stufe}", felder=felder)


def gebaeude_werkstatt(eintraege: list[dict]) -> None:
    """Geräteschuppen."""
    felder = (2, 2)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 86)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    top = kasten(d, cx, fuss, bw, bh, 48, HOLZ_HELL, "#6b5340")
    fenster(d, cx - bw * 0.14, fuss - bh * 0.3 - 26)
    # Rechen an der Wand
    d.line([(cx + bw * 0.22, top + 8), (cx + bw * 0.22, fuss - 12)], fill=hex_rgb("#f4efe4"), width=2)
    for i in range(4):
        yy = top + 14 + i * 6
        d.line([(cx + bw * 0.16, yy), (cx + bw * 0.28, yy)], fill=hex_rgb("#c4b29a"), width=1)
    save(img, "gebaeude/garten/e1/werkstatt_s1.png", eintraege, id_="garten/e1/werkstatt_s1", felder=felder)


def gebaeude_wissen(stufe: int, eintraege: list[dict]) -> None:
    """Gewächshaus mit Glasdach."""
    felder = (2, 2)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 90 + stufe * 10)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    hoehe = 44 + (stufe - 1) * 10
    top = kasten(d, cx, fuss, bw, bh, hoehe, WAND_HELL, GLAS, stufe=stufe)
    # Firststreben
    d.line([(cx - bw * 0.2, top + 4), (cx + bw * 0.2, fuss - bh * 0.35 - hoehe * 0.2)], fill=shade(DACH_GRUEN, -10), width=2)
    d.line([(cx + bw * 0.2, top + 4), (cx - bw * 0.2, fuss - bh * 0.35 - hoehe * 0.2)], fill=shade(DACH_GRUEN, -10), width=2)
    # Pflanzen innen (Punkte)
    for ox, oy, f in ((-12, -18, BLUME_ROSA), (10, -22, BLUME_GELB), (0, -14, BLATT_HELL)):
        d.ellipse([cx + ox - 3, fuss - bh * 0.25 + oy - 3, cx + ox + 3, fuss - bh * 0.25 + oy + 3], fill=hex_rgb(f))
    if stufe >= 2:
        fenster(d, cx, top + 18, glas=True)
    save(img, f"gebaeude/garten/e1/wissen_s{stufe}.png", eintraege, id_=f"garten/e1/wissen_s{stufe}", felder=felder)


def gebaeude_turm(stufe: int, eintraege: list[dict]) -> None:
    """Aussichtsbaum mit Plattform."""
    felder = (1, 1)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 140 + stufe * 16)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    hoehe_stamm = 88 + (stufe - 1) * 14
    stamm(d, cx, fuss, hoehe_stamm, 0.9)
    laubkrone(d, cx, fuss - hoehe_stamm - 8, 1.15 + stufe * 0.08)
    # Plattform
    plat_y = fuss - hoehe_stamm * 0.45
    poly(d, diamond(cx, plat_y, bw * 0.95, bh * 0.7), hex_rgb(HOLZ))
    poly(d, diamond(cx, plat_y - 4, bw * 0.7, bh * 0.5), hex_rgb(HOLZ_HELL))
    if stufe >= 2:
        # Geländer
        d.line([(cx - 22, plat_y - 18), (cx - 22, plat_y - 4)], fill=hex_rgb("#f4efe4"), width=2)
        d.line([(cx + 22, plat_y - 18), (cx + 22, plat_y - 4)], fill=hex_rgb("#f4efe4"), width=2)
        d.line([(cx - 24, plat_y - 18), (cx + 24, plat_y - 18)], fill=hex_rgb("#f4efe4"), width=2)
        for i in range(stufe):
            d.ellipse(
                [cx + 10 - i * 10, fuss - 10, cx + 14 - i * 10, fuss - 6],
                fill=hex_rgb("#f0c14a"),
            )
    save(img, f"gebaeude/garten/e1/turm_s{stufe}.png", eintraege, id_=f"garten/e1/turm_s{stufe}", felder=felder)


def gebaeude_eingang(eintraege: list[dict]) -> None:
    """Gartentor mit Bogen."""
    felder = (1, 1)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 70)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    poly(d, diamond(cx, fuss, bw, bh), SCHATTEN)
    # Pfosten
    for ox in (-22, 22):
        d.rectangle([cx + ox - 5, fuss - 48, cx + ox + 5, fuss - 2], fill=hex_rgb(HOLZ))
        laubkrone(d, cx + ox, fuss - 52, 0.45)
    # Bogen
    d.arc([cx - 28, fuss - 64, cx + 28, fuss - 20], start=200, end=340, fill=hex_rgb(HOLZ_HELL), width=4)
    # Torflügel (offen angedeutet)
    poly(d, [(cx - 16, fuss - 8), (cx - 4, fuss - 36), (cx - 4, fuss - 8)], shade(HOLZ, -20))
    poly(d, [(cx + 16, fuss - 8), (cx + 4, fuss - 36), (cx + 4, fuss - 8)], shade(HOLZ, -10))
    save(img, "gebaeude/garten/e1/eingang_s1.png", eintraege, id_="garten/e1/eingang_s1", felder=felder)


def gebaeude_einfassung(eintraege: list[dict]) -> None:
    """Hecke aus drei Büschen."""
    felder = (1, 1)
    w, h = 96, 100
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    cx, fuss = w / 2, h - 6
    poly(d, diamond(cx, fuss, 72, 36), SCHATTEN)
    for ox, s in ((-22, 0.85), (0, 1.0), (22, 0.9)):
        x = cx + ox
        d.ellipse([x - 14 * s, fuss - 28 * s, x + 14 * s, fuss - 2], fill=hex_rgb(BLATT))
        d.ellipse([x - 10 * s, fuss - 36 * s, x + 8 * s, fuss - 14 * s], fill=hex_rgb(BLATT_HELL))
        if ox == 0:
            blume(d, x + 2, fuss - 22, BLUME_ROSA)
    save(img, "gebaeude/garten/e1/einfassung_s1.png", eintraege, id_="garten/e1/einfassung_s1", felder=felder)


def gebaeude_ursprung(eintraege: list[dict]) -> None:
    """Gartenbank."""
    felder = (1, 1)
    w, h = 96, 110
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    cx, fuss = w / 2, h - 8
    poly(d, diamond(cx, fuss, 80, 40), SCHATTEN)
    # Sitzfläche
    poly(d, diamond(cx, fuss - 10, 70, 28), hex_rgb(HOLZ))
    poly(d, diamond(cx, fuss - 14, 64, 24), hex_rgb(HOLZ_HELL))
    # Lehne
    d.rectangle([cx - 28, fuss - 42, cx + 28, fuss - 28], fill=hex_rgb(HOLZ_DUNKEL))
    d.line([(cx - 26, fuss - 40), (cx + 26, fuss - 40)], fill=hex_rgb(HOLZ_HELL), width=2)
    # Beine
    for ox in (-22, 22):
        d.rectangle([cx + ox - 3, fuss - 12, cx + ox + 3, fuss + 2], fill=hex_rgb(HOLZ_DUNKEL))
    save(img, "gebaeude/garten/e1/ursprung_s1.png", eintraege, id_="garten/e1/ursprung_s1", felder=felder)


def gebaeude_zeichen(eintraege: list[dict]) -> None:
    """Wimpel an Stange."""
    felder = (1, 1)
    w, h = 96, 120
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    cx, fuss = w / 2, h - 6
    poly(d, diamond(cx, fuss, 64, 32), SCHATTEN)
    d.line([(cx, fuss), (cx, fuss - 70)], fill=hex_rgb(HOLZ), width=3)
    wimpel(d, cx, fuss - 48)
    # kleine Blume am Fuß
    blume(d, cx + 10, fuss - 8, BLUME_GELB)
    save(img, "gebaeude/garten/e1/zeichen_s1.png", eintraege, id_="garten/e1/zeichen_s1", felder=felder)


def gebaeude_flaeche(eintraege: list[dict]) -> None:
    """Blumenbeet."""
    felder = (2, 2)
    w, h, cx, fuss, bw, bh = canvas_for(felder, 50)
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    poly(d, diamond(cx, fuss, bw, bh), hex_rgb("#6b4a32"))
    poly(d, diamond(cx, fuss, bw * 0.88, bh * 0.88), hex_rgb("#5a3a28"))
    poly(d, diamond(cx, fuss - 4, bw * 0.78, bh * 0.72), hex_rgb("#3a6a38"))
    for ox, oy, f in (
        (-28, -36, BLUME_ROSA),
        (24, -32, BLUME_GELB),
        (-8, -48, BLUME_BLAU),
        (18, -52, BLUME_ROSA),
        (-18, -28, BLUME_GELB),
        (8, -38, BLUME_BLAU),
    ):
        blume(d, cx + ox, fuss + oy, f)
    save(img, "gebaeude/garten/e1/flaeche_s1.png", eintraege, id_="garten/e1/flaeche_s1", felder=felder)


def gebaeude_denkmal(eintraege: list[dict]) -> None:
    """Gartenzwerg-Silhouette."""
    felder = (1, 1)
    w, h = 96, 130
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    cx, fuss = w / 2, h - 6
    poly(d, diamond(cx, fuss, 64, 32), SCHATTEN)
    # Sockel
    d.ellipse([cx - 16, fuss - 10, cx + 16, fuss + 4], fill=hex_rgb("#5a4030"))
    # Körper
    d.ellipse([cx - 12, fuss - 36, cx + 12, fuss - 10], fill=hex_rgb("#c4603a"))
    # Kopf
    d.ellipse([cx - 10, fuss - 52, cx + 10, fuss - 32], fill=hex_rgb("#e8d4b8"))
    # Mütze
    poly(
        d,
        [(cx, fuss - 72), (cx + 14, fuss - 44), (cx - 14, fuss - 44)],
        hex_rgb(DACH_GRUEN),
    )
    # Bart
    poly(
        d,
        [(cx - 8, fuss - 38), (cx + 8, fuss - 38), (cx, fuss - 28)],
        hex_rgb("#f4efe4"),
    )
    save(img, "gebaeude/garten/e1/denkmal_s1.png", eintraege, id_="garten/e1/denkmal_s1", felder=felder)


def _in_raute(px: float, py: float, cx: float = 48, cy: float = 24, hw: float = 48, hh: float = 24) -> bool:
    return abs(px - cx) / hw + abs(py - cy) / hh <= 1.0


def _rasen_raute(
    farbe: str,
    farbe_hell: str,
    *,
    blumen: bool,
    seed: int,
) -> Image.Image:
    """Boden-Kachel @2x (96×48): Rasen-Raute, etwas blumiger als Dorf-Wiese."""
    img = new_img(96, 48)
    d = ImageDraw.Draw(img)
    raute = [(48, 0), (96, 24), (48, 48), (0, 24)]
    poly(d, raute, hex_rgb(farbe))
    poly(d, [(48, 5), (88, 24), (48, 43), (8, 24)], hex_rgb(farbe_hell))
    for i in range(20):
        t = (seed * 19 + i * 91) % 1000
        px = 12 + (t * 11) % 72
        py = 8 + (t * 9) % 32
        if not _in_raute(px, py, hw=40, hh=18):
            continue
        ton = shade(farbe_hell, 14 if (i + seed) % 2 == 0 else -12)
        d.point((px, py), fill=ton)
        if i % 4 == 0:
            d.line([(px, py), (px, py - 2)], fill=shade(farbe, -18), width=1)
    if blumen:
        farben = (BLUME_ROSA, BLUME_GELB, BLUME_BLAU)
        for i, (bx, by) in enumerate(((28, 16), (60, 20), (46, 30), (38, 24))):
            if (seed + i) % 2 == 0:
                f = farben[i % 3]
                d.rectangle([bx, by, bx + 1, by + 1], fill=(*hex_rgb(f), 200))
    d.line(raute + [raute[0]], fill=(30, 60, 30, 40), width=1)
    return img


def boden(eintraege: list[dict]) -> None:
    img = _rasen_raute(RASEN, RASEN_HELL, blumen=True, seed=4)
    save(img, "boden/garten/e1/flaeche.png", eintraege, id_="boden/garten/e1/flaeche", felder=(1, 1))
    img2 = _rasen_raute(RAND, "#2a5040", blumen=False, seed=13)
    save(img2, "boden/garten/e1/rand.png", eintraege, id_="boden/garten/e1/rand", felder=(1, 1))
    img_b = _rasen_raute(RASEN_DUNKEL, RASEN, blumen=False, seed=6)
    save(img_b, "boden/garten/e1/flaeche_b.png", eintraege, id_="boden/garten/e1/flaeche_b", felder=(1, 1))
    img_h = _rasen_raute("#6ec455", RASEN_HELL, blumen=True, seed=9)
    save(
        img_h,
        "boden/garten/e1/flaeche_hell.png",
        eintraege,
        id_="boden/garten/e1/flaeche_hell",
        felder=(1, 1),
    )


def wesen_frame(art: str, zyklus: str, frame: int, eintraege: list[dict]) -> None:
    """Biene / Schnecke / Schmetterling – 64×64 @2x."""
    size = 64
    img = new_img(size, size)
    d = ImageDraw.Draw(img)
    cx, cy = size / 2, size - 8
    bob = math.sin(frame * 1.2) * 2
    if zyklus == "react":
        bob -= 6 + frame * 2
    walk = (frame % 4) * 2 - 3 if zyklus == "walk" else 0
    wing = frame % 2 if zyklus != "idle" else 0

    if art == "biene":
        body = hex_rgb("#e6c35c")
        d.ellipse([cx - 12, cy - 20 + bob, cx + 10, cy - 6 + bob], fill=body, outline=KONTUR)
        # Streifen
        d.line([(cx - 6, cy - 18 + bob), (cx - 6, cy - 8 + bob)], fill=hex_rgb("#2B2620"), width=2)
        d.line([(cx + 2, cy - 18 + bob), (cx + 2, cy - 8 + bob)], fill=hex_rgb("#2B2620"), width=2)
        d.ellipse([cx + 6, cy - 26 + bob, cx + 16, cy - 16 + bob], fill=body, outline=KONTUR)
        # Flügel
        poly(
            d,
            [
                (cx - 2, cy - 18 + bob),
                (cx - 16, cy - 28 - wing * 3 + bob),
                (cx - 4, cy - 12 + bob),
            ],
            (240, 248, 255, 160),
        )
        d.line([(cx - 2, cy - 6 + bob), (cx - 2 + walk, cy)], fill=hex_rgb("#2B2620"), width=1)
        d.line([(cx + 4, cy - 6 + bob), (cx + 4 - walk, cy)], fill=hex_rgb("#2B2620"), width=1)
    elif art == "schnecke":
        body = hex_rgb("#b89b7a")
        # Haus
        d.ellipse([cx - 8, cy - 28 + bob, cx + 16, cy - 6 + bob], fill=hex_rgb("#c4a070"), outline=KONTUR)
        d.arc([cx - 4, cy - 24 + bob, cx + 12, cy - 10 + bob], start=20, end=300, fill=hex_rgb("#8a6a48"), width=2)
        # Körper
        d.ellipse([cx - 18, cy - 14 + bob, cx + 4, cy - 2 + bob], fill=body, outline=KONTUR)
        # Fühler
        d.line([(cx - 14, cy - 12 + bob), (cx - 18, cy - 22 + bob)], fill=body, width=2)
        d.line([(cx - 10, cy - 12 + bob), (cx - 12, cy - 22 + bob)], fill=body, width=2)
        d.ellipse([cx - 20, cy - 24 + bob, cx - 16, cy - 20 + bob], fill=hex_rgb("#2B2620"))
        d.ellipse([cx - 14, cy - 24 + bob, cx - 10, cy - 20 + bob], fill=hex_rgb("#2B2620"))
        if zyklus == "walk":
            d.ellipse([cx - 20 + walk, cy - 4, cx - 8 + walk, cy], fill=shade("#b89b7a", -20))
    else:  # schmetterling
        body = hex_rgb("#6b5a4a")
        fluegel = hex_rgb("#d478a0")
        fluegel2 = hex_rgb("#e09ab8")
        spread = 10 + wing * 4
        poly(
            d,
            [
                (cx, cy - 16 + bob),
                (cx - spread - 8, cy - 28 + bob),
                (cx - spread, cy - 10 + bob),
            ],
            fluegel,
        )
        poly(
            d,
            [
                (cx, cy - 16 + bob),
                (cx + spread + 8, cy - 28 + bob),
                (cx + spread, cy - 10 + bob),
            ],
            fluegel2,
        )
        poly(
            d,
            [
                (cx, cy - 12 + bob),
                (cx - spread, cy - 4 + bob),
                (cx - 4, cy - 8 + bob),
            ],
            shade("#d478a0", 20),
        )
        poly(
            d,
            [
                (cx, cy - 12 + bob),
                (cx + spread, cy - 4 + bob),
                (cx + 4, cy - 8 + bob),
            ],
            shade("#e09ab8", 10),
        )
        d.ellipse([cx - 3, cy - 20 + bob, cx + 3, cy - 6 + bob], fill=body, outline=KONTUR)
        d.line([(cx - 1, cy - 20 + bob), (cx - 6, cy - 28 + bob)], fill=body, width=1)
        d.line([(cx + 1, cy - 20 + bob), (cx + 6, cy - 28 + bob)], fill=body, width=1)

    rel = f"wesen/garten/{art}_{zyklus}_{frame}.png"
    save(
        img,
        rel,
        eintraege,
        id_=f"wesen/garten/{art}_{zyklus}_{frame}",
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

    frames = {"idle": 3, "walk": 4, "react": 2}
    for art in ("biene", "schnecke", "schmetterling"):
        for zyklus, n in frames.items():
            for i in range(n):
                wesen_frame(art, zyklus, i, eintraege)

    # Bestehende Chargen (P0/P1) behalten
    manifest_pfad = ATLAS / "manifest.json"
    if manifest_pfad.exists():
        alt = json.loads(manifest_pfad.read_text(encoding="utf-8"))
        p2_ids = {e["id"] for e in eintraege}
        for e in alt.get("eintraege", []):
            if e.get("id") not in p2_ids:
                eintraege.append(e)
    manifest = {"version": 1, "eintraege": eintraege}
    manifest_pfad.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"P2 Garten: {len(eintraege)} Einträge → {manifest_pfad}")


if __name__ == "__main__":
    main()
