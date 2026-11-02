#!/usr/bin/env python3
"""G3 Epochen 2–4, Thema `unterwasser` (GRAFIK-SPRITES.md §12.11, Entscheidung PV 02.11.2026).

Neue Stufen, je in der Epoche, in der sie zuerst baubar sind (eine Stufe, ein Bild):
  Epoche 2 (Riffstadt):      Hauptkuppel 4–5, Perlenkammer 3, Leuchtturm 3, Werft 2, Schleuse 2
  Epoche 3 (Tiefseestation): Hauptkuppel 6–7, Perlenkammer 4, Leuchtturm 4, Werft 3
  Epoche 4 (Ozeanfeste):     Hauptkuppel 8–9, Perlenkammer 5, Leuchtturm 5

Materialleiter weiter nach Epoche 1 (§12.10): Korallenstein, Messing, Perlmutt und Glas;
ab Stufe 8 eine große Glasglocke über der ganzen Kuppelstadt. Die Glaskuppel aus
Stufe 3 bleibt die Mitte; ab Stufe 4 wächst um sie eine Kuppelstadt im Fußabdruck
(Nebenkuppeln, Röhren, Perlmutt-Türme, Ringgalerie, Glasglocke), in der Höhe je
Stufe um gut 8 %. Formen aus `sprites-g3-unterwasser.py` (Bullauge, Röhre, Laterne).
Aufruf: python3 tools/grafik/sprites-g3e-unterwasser.py
"""
from __future__ import annotations

import importlib.util
import math
import sys
from pathlib import Path

from PIL import ImageDraw

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from g3_stil import (  # noqa: E402
    BREITE,
    GRAU,
    HH,
    HW,
    KONTUR,
    PETROL,
    PETROL_HELL,
    STEIN,
    Iso,
    hell,
    kuppel,
    schatten,
    schreibe_epochen,
)

# Formen und Farben aus Epoche 1 wiederverwenden (gleiche Hand, ein Guss)
_spec = importlib.util.spec_from_file_location("g3_unterwasser", Path(__file__).resolve().parent / "sprites-g3-unterwasser.py")
e1 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(e1)  # type: ignore[union-attr]
KORALLENSTEIN, MESSING, PERLMUTT, GLAS = e1.KORALLENSTEIN, e1.MESSING, e1.PERLMUTT, e1.GLAS
MUSCHEL, SAND, ROT, LICHT, TUER = e1.MUSCHEL, e1.SAND, e1.ROT, e1.LICHT, e1.TUER
bullauge, roehre, laternenspitze, steine = e1.bullauge, e1.roehre, e1.laternenspitze, e1.steine

GLAS_GLOCKE = (190, 228, 236, 92)  # durchscheinende Glasglocke ab Stufe 8
TURMWEISS = (236, 232, 224)


def glocke(iso: Iso, x, y, r: float, z: float, h: float) -> None:
    """Große, durchscheinende Glasglocke mit Messingrippen (über schon Gezeichnetem)."""
    d = ImageDraw.Draw(iso.d._image, "RGBA")
    cx, cy = iso.p(x, y, z)
    rx, ry = r * HW * math.sqrt(2), r * HH * math.sqrt(2)
    n = 32
    umriss = [(cx - rx * math.cos(math.pi * i / n), cy - h * math.sin(math.pi * i / n)) for i in range(n + 1)]
    umriss += [(cx + rx * math.cos(math.pi * i / n), cy + ry * math.sin(math.pi * i / n)) for i in range(n + 1)]
    d.polygon([(round(a), round(b)) for a, b in umriss], fill=GLAS_GLOCKE)
    glanz = [(cx + rx * 0.25 - rx * 0.4 * math.cos(math.pi * i / n), cy - h * 0.62 - h * 0.22 * math.sin(math.pi * i / n)) for i in range(n + 1)]
    d.polygon([(round(a), round(b)) for a, b in glanz], fill=(255, 255, 255, 70))
    for k in range(1, 6):  # Messingrippen
        t = math.pi * k / 6
        fx = -math.cos(t)
        pts = [(cx + rx * fx * math.cos(a), cy - h * math.sin(a) + ry * math.sin(t) * math.cos(a) * 0.9) for a in [math.pi / 2 * j / 12 for j in range(13)]]
        for a, b in zip(pts, pts[1:]):
            iso.linie(a, b, hell(MESSING, -10), 2)
    iso.d.arc([cx - rx, cy - h, cx + rx, cy + h], 180, 360, fill=hell(MESSING, -20), width=2)
    iso.d.arc([cx - rx, cy - ry, cx + rx, cy + ry], 0, 180, fill=MESSING, width=4)


def nebenkuppel(iso: Iso, fenster: list, x, y, r, h, farbe, *, glas_oben=False) -> tuple[float, float]:
    iso.zylinder(x, y, r * 0.92, 0, 12, STEIN)
    sp = kuppel(iso, x, y, r, 12, h, farbe, rippen=4, rippe=hell(MESSING, -30) if farbe == GLAS else None)
    cx, cy = iso.p(x, y, 12)
    bullauge(iso, (cx + r * 24, cy - h * 0.45), 5, fenster)
    if glas_oben:
        kuppel(iso, x, y - 0.02, r * 0.4, 12 + h * 0.8, h * 0.35, GLAS)
    return sp


def perlturm(iso: Iso, fenster: list, x, y, r, h, *, laterne=True) -> tuple[float, float]:
    """Schlanker Perlmutt-Turm mit Messingring, Bullaugen und Glaskuppel."""
    iso.zylinder(x, y, r, 0, h, PERLMUTT, stein=False)
    cx, cy = iso.p(x, y, 0)
    vorne = r * HH * math.sqrt(2)
    for z in range(40, h - 20, 54):
        bullauge(iso, (cx + 2, cy + vorne - z - 8), 5, fenster)
    iso.zylinder(x, y, r * 1.18, h, h + 8, MESSING, stein=False)
    sp = kuppel(iso, x, y, r * 1.05, h + 8, r * 70, GLAS, rippen=4, rippe=MESSING)
    if laterne:
        sp = laternenspitze(iso, sp, fenster)
    return sp


PLAN = {  # th: Höhe Mittelturm, kh: Glaskuppel, pt: Perlmutt-Türme links/rechts, ht: hinterer Turm
    4: dict(th=128, kh=104, pt=0, ht=0, ober=False, galerie=False, glocke=False, spitze=0),
    5: dict(th=166, kh=108, pt=200, ht=0, ober=False, galerie=False, glocke=False, spitze=0),
    6: dict(th=170, kh=86, pt=220, ht=0, ober=True, galerie=False, glocke=False, spitze=0),
    7: dict(th=212, kh=90, pt=240, ht=290, ober=True, galerie=True, glocke=False, spitze=0),
    8: dict(th=250, kh=104, pt=280, ht=320, ober=True, galerie=True, glocke=True, spitze=0),
    9: dict(th=258, kh=108, pt=330, ht=360, ober=True, galerie=True, glocke=True, spitze=110),
}


def kuppelstadt(iso: Iso, fenster: list, stufe: int) -> None:
    b = PLAN[stufe]
    p = iso.p
    schatten(iso, 1.5)
    iso.quader(-1.38, 1.38, -1.38, 1.38, 0, 14, STEIN)
    iso.textur_stein(-1.38, 1.38, -1.38, 1.38, 0, 14, 7)
    # hinten: Nebenkuppel oder hoher Perlmutt-Turm, rechts hinten Nebenkuppel
    if b["ht"]:
        perlturm(iso, fenster, -1.0, -1.0, 0.26, b["ht"])
    else:
        nebenkuppel(iso, fenster, -1.0, -1.0, 0.36, 40, KORALLENSTEIN)
    # Perlmutt-Türme links und rechts oder Nebenkuppeln
    for tx, ty, farbe in ((1.02, -1.02, KORALLENSTEIN), (-1.02, 1.02, PERLMUTT)):
        if b["pt"]:
            sp = perlturm(iso, fenster, tx, ty, 0.24, b["pt"])
            if stufe >= 6:
                iso.fahne(sp, 26, PETROL_HELL)
        else:
            nebenkuppel(iso, fenster, tx, ty, 0.38, 44, farbe, glas_oben=True)
    roehre(iso, p(0.8, -0.78, 30), p(0.45, -0.42, 40), 8, MESSING)
    roehre(iso, p(-0.78, -0.78, 30), p(-0.42, -0.42, 40), 8, MESSING)
    # Ringgalerie (hinterer Teil vor dem Mittelturm)
    gz = 100
    if b["galerie"]:
        cx, cy = p(0, 0, gz)
        rx, ry = 1.08 * HW * math.sqrt(2), 1.08 * HH * math.sqrt(2)
        iso.d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry + 8], fill=hell(MESSING, -34), outline=KONTUR)
        iso.d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=hell(MESSING, -6), outline=KONTUR)
        for k in range(10):  # Stützen nach unten
            a = math.pi * (0.05 + 0.9 * k / 9)
            sx, sy = cx - rx * 0.96 * math.cos(a), cy + ry * 0.96 * math.sin(a)
            iso.linie((sx, sy + 6), (sx, sy + gz - 14), hell(MESSING, -30), 3)
    th = b["th"]
    if b["glocke"]:  # große Glasglocke über der unteren Stadt; der Mittelturm sticht hindurch
        glocke(iso, 0, 0, 1.42, 14, 128)
    # Mittelturm aus Korallenstein
    iso.zylinder(0, 0, 0.76, 14, th, KORALLENSTEIN)
    cx, cy = p(0, 0, 0)
    vorne = 0.76 * HH * math.sqrt(2)
    for z in range(50, th - 30, 48):
        for dx in (-40, -12, 16, 42):
            bullauge(iso, (cx + dx, cy + vorne * (1 - (dx / 58) ** 2) ** 0.5 - z), 7, fenster)
    iso.poly([(cx - 11, cy + vorne + 2), (cx + 11, cy + vorne + 2), (cx + 11, cy + vorne - 36), (cx, cy + vorne - 44), (cx - 11, cy + vorne - 36)], TUER, KONTUR)
    iso.banner_r(0.55, 0.55, th - 6, 52, PETROL)
    if b["galerie"]:  # vorderer Rand der Galerie über dem Turmfuß
        gx, gy = p(0, 0, gz)
        rx, ry = 1.08 * HW * math.sqrt(2), 1.08 * HH * math.sqrt(2)
        iso.d.arc([gx - rx, gy - ry, gx + rx, gy + ry], 10, 170, fill=hell(MESSING, 16), width=4)
        for k in range(11):
            a = math.pi * (0.06 + 0.88 * k / 10)
            sx, sy = gx - rx * math.cos(a), gy + ry * math.sin(a)
            iso.linie((sx, sy), (sx, sy - 12), hell(MESSING, -30), 2)
        iso.d.arc([gx - rx, gy - ry - 12, gx + rx, gy + ry - 12], 10, 170, fill=hell(MESSING, -20), width=2)
    iso.zylinder(0, 0, 0.84, th, th + 10, MESSING, stein=False)
    z = th + 10
    if b["ober"]:  # zweites Geschoss: schmalere Trommel mit Bullaugen
        iso.zylinder(0, 0, 0.54, z, z + 52, KORALLENSTEIN)
        ox, oy = p(0, 0, z)
        for dx in (-22, 0, 22):
            bullauge(iso, (ox + dx, oy + 0.54 * HH * math.sqrt(2) * (1 - (dx / 40) ** 2) ** 0.5 - 28), 6, fenster)
        iso.zylinder(0, 0, 0.6, z + 52, z + 60, MESSING, stein=False)
        z += 60
        r = 0.52
    else:
        r = 0.74
    spitze = kuppel(iso, 0, 0, r, z, b["kh"], GLAS, rippen=8, rippe=MESSING)
    gx, gy = p(0, 0, z + b["kh"] * 0.35)
    licht = [(gx - r * 40, gy + 8), (gx + r * 40, gy + 8), (gx + r * 26, gy - 22), (gx - r * 26, gy - 22)]
    fenster.append(licht)
    iso.d.ellipse([gx - r * 30, gy - 28, gx + 2, gy - 12], fill=hell(GLAS, 36))
    # vorne: Glas-Nebenkuppel und Röhre zur Mitte
    nebenkuppel(iso, fenster, 1.02, 1.02, 0.34, 40, GLAS if stufe >= 5 else PERLMUTT)
    roehre(iso, p(0.82, 0.8, 26), p(0.55, 0.52, 34), 8, MESSING)
    if b["spitze"]:  # hohe Messingspitze mit Laternenstube
        sx, sy = spitze
        iso.poly([(sx - 10, sy + 4), (sx + 10, sy + 4), (sx + 8, sy - 30), (sx - 8, sy - 30)], MESSING, KONTUR)
        lat = [(sx - 5, sy - 4), (sx + 5, sy - 4), (sx + 5, sy - 24), (sx - 5, sy - 24)]
        iso.poly(lat, LICHT, KONTUR)
        fenster.append(lat)
        iso.poly([(sx - 11, sy - 30), (sx + 11, sy - 30), (sx, sy - 30 - b["spitze"])], hell(MESSING, -16), KONTUR)
        spitze = (sx, sy - 30 - b["spitze"])
        iso.d.ellipse([sx - 5, spitze[1] - 8, sx + 5, spitze[1] + 2], fill=(246, 244, 250), outline=KONTUR)
    else:
        spitze = laternenspitze(iso, spitze, fenster)
    iso.fahne(spitze, 34, PETROL_HELL)


def kern(n: int):
    return lambda iso, fenster: kuppelstadt(iso, fenster, n)


# —— Perlenkammer (wissen, 2×2): Schneckenturm → Perlmutt-Archiv ——————————————


def schnecke(iso: Iso, fenster: list, x, y, r, z, h) -> tuple[float, float]:
    """Gewundener Schneckenturm (Spiralkegel) mit Laterne unter der Spitze."""
    spitze = iso.kegel(x, y, r, z, h, MUSCHEL)
    tx, ty = iso.p(x, y, z)
    rx = r * HW * math.sqrt(2)
    n = max(5, int(h / 22))
    for k in range(n):
        z0, z1 = k * h / n, (k + 1) * h / n
        f0, f1 = 1 - z0 / h, 1 - z1 / h
        iso.linie((tx - rx * f0 * 0.9, ty - z0 + 4), (tx + rx * f1 * 0.9, ty - z1 + 2), hell(MUSCHEL, -50), 2)
    lx, ly = spitze
    lat = [(lx - 4, ly + h * 0.2), (lx + 4, ly + h * 0.2), (lx + 4, ly + h * 0.2 + 10), (lx - 4, ly + h * 0.2 + 10)]
    iso.poly(lat, LICHT, KONTUR)
    fenster.append(lat)
    return spitze


def wissen3(iso: Iso, fenster: list) -> None:
    """Perlenkammer der Riffstadt: Perlmutt-Kuppel auf Messingring, zwei Schneckentürme."""
    schatten(iso, 1.0)
    p = iso.p
    iso.quader(-0.9, 0.9, -0.9, 0.9, 0, 12, SAND, links=-20, rechts=-8)
    sp = schnecke(iso, fenster, -0.5, -0.5, 0.38, 12, 232)
    iso.fahne(sp, 26, PETROL_HELL)
    schnecke(iso, fenster, 0.55, -0.55, 0.26, 12, 140)
    iso.zylinder(0.12, 0.12, 0.7, 12, 44, KORALLENSTEIN)
    iso.zylinder(0.12, 0.12, 0.74, 44, 52, MESSING, stein=False)
    kuppel(iso, 0.12, 0.12, 0.7, 52, 70, PERLMUTT, rippen=6, rippe=hell(MUSCHEL, -50))
    cx, cy = p(0.12, 0.12, 12)
    for dx in (-30, 0, 30):
        bullauge(iso, (cx + dx, cy - 22), 6, fenster)
    for dx, dz in ((-24, 76), (10, 88), (36, 72)):
        bullauge(iso, (cx + dx, cy - dz), 8, fenster)
    iso.poly([(cx - 52, cy + 12), (cx - 30, cy + 16), (cx - 30, cy - 16), (cx - 41, cy - 26), (cx - 52, cy - 16)], TUER, KONTUR)
    iso.banner_r(0.75, 0.5, 46, 30, PETROL)


def wissen4(iso: Iso, fenster: list) -> None:
    """Perlmutt-Archiv: hohe Korallentrommel mit Glas-Oberlicht, Schneckenturm mit Galerie."""
    schatten(iso, 1.0)
    p = iso.p
    iso.quader(-0.9, 0.9, -0.9, 0.9, 0, 12, SAND, links=-20, rechts=-8)
    sp = schnecke(iso, fenster, -0.52, -0.52, 0.36, 12, 296)
    iso.fahne(sp, 26, PETROL_HELL)
    # Galerie am Schneckenturm
    gx, gy = p(-0.52, -0.52, 150)
    iso.d.ellipse([gx - 30, gy - 10, gx + 30, gy + 10], fill=hell(MESSING, -10), outline=KONTUR)
    iso.zylinder(0.16, 0.16, 0.64, 12, 130, KORALLENSTEIN)
    cx, cy = p(0.16, 0.16, 0)
    vorne = 0.64 * HH * math.sqrt(2)
    for z in (44, 92):
        for dx in (-30, 0, 30):
            bullauge(iso, (cx + dx, cy + vorne * (1 - (dx / 48) ** 2) ** 0.5 - z), 7, fenster)
    iso.poly([(cx - 10, cy + vorne + 2), (cx + 10, cy + vorne + 2), (cx + 10, cy + vorne - 32), (cx, cy + vorne - 40), (cx - 10, cy + vorne - 32)], TUER, KONTUR)
    iso.zylinder(0.16, 0.16, 0.7, 130, 138, MESSING, stein=False)
    top = kuppel(iso, 0.16, 0.16, 0.66, 138, 60, PERLMUTT, rippen=6, rippe=hell(MUSCHEL, -50))
    kuppel(iso, 0.16, 0.14, 0.24, 138 + 50, 26, GLAS, rippen=3, rippe=MESSING)
    iso.banner_r(0.6, 0.56, 122, 44, PETROL)
    del top


def wissen5(iso: Iso, fenster: list) -> None:
    """Großes Archiv der Ozeanfeste: zwei Schneckentürme, Trommel mit Glaskuppel und Perle."""
    schatten(iso, 1.0)
    p = iso.p
    iso.quader(-0.92, 0.92, -0.92, 0.92, 0, 12, SAND, links=-20, rechts=-8)
    for x, y, h in ((-0.6, -0.6, 330), (0.64, -0.64, 250), (-0.64, 0.64, 250)):
        sp = schnecke(iso, fenster, x, y, 0.28, 12, h)
        iso.fahne(sp, 24, PETROL_HELL)
    iso.zylinder(0.14, 0.14, 0.62, 12, 156, KORALLENSTEIN)
    cx, cy = p(0.14, 0.14, 0)
    vorne = 0.62 * HH * math.sqrt(2)
    for z in (44, 92, 136):
        for dx in (-28, 0, 28):
            bullauge(iso, (cx + dx, cy + vorne * (1 - (dx / 46) ** 2) ** 0.5 - z), 7, fenster)
    iso.poly([(cx - 10, cy + vorne + 2), (cx + 10, cy + vorne + 2), (cx + 10, cy + vorne - 32), (cx, cy + vorne - 40), (cx - 10, cy + vorne - 32)], TUER, KONTUR)
    iso.zylinder(0.14, 0.14, 0.7, 156, 166, MESSING, stein=False)
    sp = kuppel(iso, 0.14, 0.14, 0.62, 166, 92, GLAS, rippen=8, rippe=MESSING)
    gx, gy = p(0.14, 0.14, 166 + 30)
    perle = [(gx + 14 * math.cos(a / 16 * 2 * math.pi), gy - 12 + 14 * math.sin(a / 16 * 2 * math.pi)) for a in range(16)]
    iso.poly(perle, (246, 244, 250), KONTUR)
    fenster.append(perle)
    sp = laternenspitze(iso, sp, fenster)
    iso.fahne(sp, 28, PETROL_HELL)
    iso.banner_r(0.58, 0.54, 146, 52, PETROL)


# —— Leuchtturm (turm, 1×1) ————————————————————————————————————


def streifenturm(iso: Iso, x, y, r, z0, z1, baender) -> None:
    iso.zylinder(x, y, r, z0, z1, TURMWEISS, stein=False)
    cx, cy = iso.p(x, y, 0)
    rx, ry = r * HW * math.sqrt(2), r * HH * math.sqrt(2)
    for zb, hb in baender:
        for i in range(24):
            a0, a1 = math.pi * i / 24, math.pi * (i + 1) / 24
            xa, xb = cx - rx * math.cos(a0), cx - rx * math.cos(a1)
            ya, yb = cy + ry * math.sin(a0), cy + ry * math.sin(a1)
            ton = hell(ROT, int(-30 + 40 * (i / 24)))
            iso.poly([(xa, ya - zb), (xb, yb - zb), (xb, yb - zb - hb), (xa, ya - zb - hb)], ton)


def galerie(iso: Iso, x, y, r, z) -> None:
    cx, cy = iso.p(x, y, z)
    gx, gy = r * HW * math.sqrt(2), r * HH * math.sqrt(2)
    iso.d.ellipse([cx - gx, cy - gy, cx + gx, cy + gy + 6], fill=hell(GRAU, -40), outline=KONTUR)
    iso.d.ellipse([cx - gx, cy - gy, cx + gx, cy + gy], fill=hell(GRAU, -20), outline=KONTUR)
    for k in range(9):
        a = math.pi * k / 8
        px, py = cx - gx * math.cos(a), cy + gy * math.sin(a)
        iso.linie((px, py), (px, py - 12), hell(GRAU, -40), 2)
    iso.d.arc([cx - gx, cy - gy - 12, cx + gx, cy + gy - 12], 0, 180, fill=hell(GRAU, -40), width=2)


def kanzel(iso: Iso, fenster: list, r, z, h) -> None:
    iso.zylinder(0, 0, r, z, z + h, GLAS, stein=False)
    cx, cy = iso.p(0, 0, z)
    w = r * 38
    lat = [(cx - w, cy - 4), (cx + w, cy - 4), (cx + w, cy - h + 6), (cx - w, cy - h + 6)]
    iso.poly(lat, LICHT, KONTUR)
    fenster.append(lat)
    for dx in (-w * 0.5, w * 0.5):
        iso.linie((cx + dx, cy - 2), (cx + dx, cy - h + 4), MESSING, 2)


def turm3(iso: Iso, fenster: list) -> None:
    """Leuchtturm auf breitem Steinsockel, zwei Galerien, größere Glaskanzel, Messinghaube."""
    schatten(iso, 0.56)
    iso.zylinder(0, 0, 0.46, 0, 40, STEIN)
    cx, cy = iso.p(0, 0, 0)
    iso.poly([(cx - 8, cy + 30), (cx + 8, cy + 30), (cx + 8, cy + 2), (cx - 8, cy + 2)], TUER, KONTUR)
    streifenturm(iso, 0, 0, 0.34, 40, 230, ((70, 34), (140, 34), (200, 30)))
    galerie(iso, 0, 0, 0.5, 232)
    kanzel(iso, fenster, 0.28, 232, 44)
    galerie(iso, 0, 0, 0.42, 276)
    sp = iso.kegel(0, 0, 0.36, 276, 46, MESSING)
    iso.fahne(sp, 26, PETROL_HELL)


def turm4(iso: Iso, fenster: list) -> None:
    """Hoher Leuchtturm der Tiefseestation: Korallensockel, Kanzel unter Glaskuppel, Messingspitze."""
    schatten(iso, 0.56)
    iso.zylinder(0, 0, 0.46, 0, 60, KORALLENSTEIN)
    cx, cy = iso.p(0, 0, 0)
    iso.poly([(cx - 8, cy + 30), (cx + 8, cy + 30), (cx + 8, cy - 4), (cx, cy - 10), (cx - 8, cy - 4)], TUER, KONTUR)
    bullauge(iso, (cx + 22, cy - 18), 5, fenster)
    iso.zylinder(0, 0, 0.5, 60, 68, MESSING, stein=False)
    streifenturm(iso, 0, 0, 0.32, 68, 272, ((96, 34), (166, 34), (230, 30)))
    galerie(iso, 0, 0, 0.52, 274)
    kanzel(iso, fenster, 0.3, 274, 50)
    iso.zylinder(0, 0, 0.36, 324, 330, MESSING, stein=False)
    sp = kuppel(iso, 0, 0, 0.34, 330, 32, GLAS, rippen=4, rippe=MESSING)
    x, y = sp
    iso.poly([(x - 5, y + 2), (x + 5, y + 2), (x, y - 44)], hell(MESSING, -10), KONTUR)
    iso.fahne((x, y - 42), 26, PETROL_HELL)
    iso.banner_r(0.3, 0.12, 250, 44, PETROL)


def turm5(iso: Iso, fenster: list) -> None:
    """Leuchtturm der Ozeanfeste: Korallensockel, sehr hoher Streifenturm, zwei Galerien,
    Glaskugel mit Perlenlicht, Messingspitze."""
    schatten(iso, 0.56)
    p = iso.p
    iso.zylinder(0, 0, 0.46, 0, 72, KORALLENSTEIN)
    cx, cy = p(0, 0, 0)
    iso.poly([(cx - 8, cy + 30), (cx + 8, cy + 30), (cx + 8, cy - 4), (cx, cy - 10), (cx - 8, cy - 4)], TUER, KONTUR)
    for dx in (-18, 20):
        bullauge(iso, (cx + dx, cy - 28), 5, fenster)
    iso.zylinder(0, 0, 0.5, 72, 80, MESSING, stein=False)
    streifenturm(iso, 0, 0, 0.3, 80, 318, ((110, 32), (180, 32), (250, 32)))
    galerie(iso, 0, 0, 0.52, 320)
    kanzel(iso, fenster, 0.26, 320, 34)
    galerie(iso, 0, 0, 0.44, 354)
    iso.zylinder(0, 0, 0.18, 354, 370, MESSING, stein=False)
    m = p(0, 0, 402)
    iso.d.ellipse([m[0] - 30, m[1] - 32, m[0] + 30, m[1] + 30], fill=GLAS, outline=KONTUR)
    iso.d.ellipse([m[0] - 22, m[1] - 26, m[0] - 4, m[1] - 10], fill=hell(GLAS, 36))
    perle = [(m[0] + 12 * math.cos(a / 16 * 2 * math.pi), m[1] + 2 + 12 * math.sin(a / 16 * 2 * math.pi)) for a in range(16)]
    iso.poly(perle, LICHT, KONTUR)
    fenster.append(perle)
    for k in range(1, 4):
        iso.d.arc([m[0] - 30 * k / 4, m[1] - 32, m[0] + 30 * k / 4, m[1] + 30], 270, 90, fill=MESSING, width=1)
    iso.poly([(m[0] - 8, m[1] - 30), (m[0] + 8, m[1] - 30), (m[0], m[1] - 74)], hell(MESSING, -10), KONTUR)
    iso.fahne((m[0], m[1] - 72), 26, PETROL_HELL)
    iso.banner_r(0.28, 0.12, 300, 46, PETROL)


# —— Werft (werkstatt, 2×2) und Tauchschleuse (eingang, 1×1) ——————————————————


def uboot(iso: Iso, fenster: list, x0, x1, y, z, r0, farbe) -> None:
    p = iso.p
    for k in range(18):
        t = k / 17
        x = x0 + (x1 - x0) * t
        r = r0 * math.sin(math.pi * (0.1 + 0.8 * t)) + 4
        m = p(x, y, z)
        iso.d.ellipse([m[0] - r * 0.7, m[1] - r, m[0] + r * 0.7, m[1] + r * 0.6], fill=hell(farbe, -10 + int(16 * t)))
    m, n = p(x0, y, z), p(x1, y, z)
    iso.linie((m[0], m[1] - r0 - 1), (n[0], n[1] - r0 - 1), KONTUR)
    t = p((x0 + x1) / 2, y, z + r0)
    iso.poly([(t[0] - 10, t[1]), (t[0] + 12, t[1] + 4), (t[0] + 10, t[1] - 18), (t[0] - 8, t[1] - 20)], hell(farbe, 6), KONTUR)
    for k in range(3):
        bullauge(iso, p(x0 + (x1 - x0) * (0.3 + 0.2 * k), y, z + 2), 4, fenster)


def werkstatt2(iso: Iso, fenster: list) -> None:
    """Dock: Becken mit Korallensteinrand, fertiges U-Boot, hoher Messingkran mit Kiste."""
    schatten(iso, 0.95)
    p = iso.p
    iso.quader(-0.9, 0.9, -0.75, 0.75, 0, 18, KORALLENSTEIN)
    iso.textur_stein(-0.9, 0.9, -0.75, 0.75, 0, 18, 9)
    iso.poly([p(-0.72, -0.58, 18), p(0.72, -0.58, 18), p(0.72, 0.58, 18), p(-0.72, 0.58, 18)], (64, 118, 140))
    uboot(iso, fenster, -0.6, 0.5, 0.0, 34, 22, MESSING)
    # Kran hinten rechts: Gittermast, Ausleger, Seil, Kiste
    iso.quader(0.66, 0.78, -0.66, -0.54, 18, 220, hell(MESSING, -20), links=-30, rechts=-8)
    for z in range(30, 210, 26):
        iso.linie(p(0.66, -0.54, z), p(0.78, -0.54, z + 24), hell(MESSING, -50), 1)
    iso.linie(p(0.72, -0.6, 216), p(-0.2, -0.6, 236), hell(MESSING, -30), 4)
    iso.linie(p(0.72, -0.6, 160), p(0.3, -0.6, 228), hell(MESSING, -40), 2)
    iso.linie(p(-0.1, -0.6, 234), p(-0.1, -0.6, 150), (110, 100, 90), 1)
    iso.quader(-0.22, 0.0, -0.7, -0.5, 130, 150, hell(e1.TREIBHOLZ, 10))
    iso.banner_r(0.9, 0.4, 16 + 60, 30, PETROL)
    lat = p(0.72, -0.6, 222)
    l = [(lat[0] - 4, lat[1]), (lat[0] + 4, lat[1]), (lat[0] + 4, lat[1] - 9), (lat[0] - 4, lat[1] - 9)]
    iso.poly(l, LICHT, KONTUR)
    fenster.append(l)


def werkstatt3(iso: Iso, fenster: list) -> None:
    """Werfthalle: Glas-Tonnendach auf Korallenstein, Portalkran, Röhre zur Station."""
    schatten(iso, 0.95)
    p = iso.p
    # Portalkran hinten (zwei Stützen und Brücke)
    for x in (-0.8, 0.8):
        iso.quader(x - 0.06, x + 0.06, -0.82, -0.7, 0, 262, hell(MESSING, -20), links=-30, rechts=-8)
    iso.quader(-0.86, 0.86, -0.82, -0.7, 262, 276, hell(MESSING, -10))
    iso.linie(p(0.3, -0.76, 262), p(0.3, -0.76, 196), (110, 100, 90), 1)
    uboot(iso, fenster, 0.05, 0.6, -0.76, 182, 12, hell(MESSING, 10))
    # Halle: Korallensteinwände, Glas-Tonnendach (Bögen von vorne nach hinten)
    iso.quader(-0.85, 0.85, -0.6, 0.6, 0, 70, KORALLENSTEIN)
    iso.textur_stein(-0.85, 0.85, -0.6, 0.6, 0, 70, 14)
    for x in (-0.5, 0.0, 0.5):
        bullauge(iso, p(x, 0.6, 42), 7, fenster)
    iso.poly([p(0.85, 0.36, 0), p(0.85, -0.36, 0), p(0.85, -0.36, 56), p(0.85, 0.36, 56)], (64, 118, 140), KONTUR)
    for k in range(9):  # Tonnendach als Folge von Bögen entlang x
        x = -0.85 + 1.7 * k / 8
        pts = [p(x, 0.6 * math.cos(math.pi * j / 12), 70 + 74 * math.sin(math.pi * j / 12)) for j in range(13)]
        for a, b in zip(pts, pts[1:]):
            iso.linie(a, b, MESSING, 2)
    dach = [p(-0.85, 0.6 * math.cos(math.pi * j / 12), 70 + 74 * math.sin(math.pi * j / 12)) for j in range(13)]
    dach += [p(0.85, 0.6 * math.cos(math.pi * j / 12), 70 + 74 * math.sin(math.pi * j / 12)) for j in range(12, -1, -1)]
    d = ImageDraw.Draw(iso.d._image, "RGBA")
    d.polygon([(round(a), round(b)) for a, b in dach], fill=(190, 228, 236, 150))
    giebel = [p(0.85, 0.6 * math.cos(math.pi * j / 12), 70 + 74 * math.sin(math.pi * j / 12)) for j in range(13)]
    iso.poly(giebel, GLAS, KONTUR)
    gl = [p(0.85, 0.3 * math.cos(math.pi * j / 8), 76 + 44 * math.sin(math.pi * j / 8)) for j in range(9)]
    iso.poly(gl, hell(GLAS, -20))
    fenster.append(gl)
    for k in range(9):
        x = -0.85 + 1.7 * k / 8
        pts = [p(x, 0.6 * math.cos(math.pi * j / 12), 70 + 74 * math.sin(math.pi * j / 12)) for j in range(7, 13)]
        for a, b in zip(pts, pts[1:]):
            iso.linie(a, b, MESSING, 2)
    roehre(iso, p(-0.6, 0.62, 30), p(-0.6, 0.92, 22), 7, MESSING)
    iso.banner_r(0.85, 0.48, 66, 30, PETROL)
    iso.fahne(p(0.8, -0.76, 276), 28, PETROL_HELL)


def eingang2(iso: Iso, fenster: list) -> None:
    """Große Schleuse: Korallensteinblock mit Luke, darauf Glaskuppel mit Licht, Lampenmasten."""
    schatten(iso, 0.5)
    p = iso.p
    iso.quader(-0.48, 0.48, -0.26, 0.26, 0, 96, KORALLENSTEIN)
    iso.textur_stein(-0.48, 0.48, -0.26, 0.26, 0, 96, 12)
    m = p(0.0, 0.26, 46)
    iso.d.ellipse([m[0] - 30, m[1] - 34, m[0] + 30, m[1] + 34], fill=MESSING, outline=KONTUR)
    iso.d.ellipse([m[0] - 23, m[1] - 27, m[0] + 23, m[1] + 27], fill=hell(GRAU, -60), outline=KONTUR)
    iso.d.ellipse([m[0] - 10, m[1] - 10, m[0] + 10, m[1] + 10], outline=MESSING, width=3)
    for a in range(4):
        w = a * math.pi / 2 + math.pi / 4
        iso.linie(m, (m[0] + 12 * math.cos(w), m[1] + 12 * math.sin(w)), MESSING, 2)
    bullauge(iso, p(0.48, 0.0, 66), 6, fenster)
    iso.quader(-0.52, 0.52, -0.3, 0.3, 96, 104, MESSING)
    sp = kuppel(iso, 0, 0, 0.3, 104, 46, GLAS, rippen=4, rippe=MESSING)
    g = p(0, 0, 118)
    lat = [(g[0] - 8, g[1]), (g[0] + 8, g[1]), (g[0] + 6, g[1] - 16), (g[0] - 6, g[1] - 16)]
    iso.poly(lat, LICHT, KONTUR)
    fenster.append(lat)
    sp = laternenspitze(iso, sp, fenster)
    iso.fahne(sp, 24, PETROL_HELL)
    for x in (-0.44, 0.44):
        b = p(x, 0.34, 0)
        iso.linie(b, (b[0], b[1] - 118), hell(MESSING, -30), 3)
        lat = [(b[0] - 5, b[1] - 118), (b[0] + 5, b[1] - 118), (b[0] + 5, b[1] - 130), (b[0] - 5, b[1] - 130)]
        iso.poly(lat, LICHT, KONTUR)
        fenster.append(lat)
    iso.banner_r(0.48, -0.1, 92, 34, PETROL)


EPOCHEN = {
    2: [
        ("kern", 4, kern(4), 3, BREITE),
        ("kern", 5, kern(5), 3, BREITE),
        ("wissen", 3, wissen3, 2, 200),
        ("turm", 3, turm3, 1, 104),
        ("werkstatt", 2, werkstatt2, 2, 200),
        ("eingang", 2, eingang2, 1, 104),
    ],
    3: [
        ("kern", 6, kern(6), 3, BREITE),
        ("kern", 7, kern(7), 3, BREITE),
        ("wissen", 4, wissen4, 2, 200),
        ("turm", 4, turm4, 1, 104),
        ("werkstatt", 3, werkstatt3, 2, 200),
    ],
    4: [
        ("kern", 8, kern(8), 3, BREITE),
        ("kern", 9, kern(9), 3, BREITE),
        ("wissen", 5, wissen5, 2, 200),
        ("turm", 5, turm5, 1, 104),
    ],
}

if __name__ == "__main__":
    sys.exit(schreibe_epochen("unterwasser", EPOCHEN))
