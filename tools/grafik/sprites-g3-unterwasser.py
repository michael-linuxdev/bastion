#!/usr/bin/env python3
"""G3: Thema `unterwasser`, Epoche 1 (FOKUS.md Paket G, Klärung PV 02.11.2026).

Gleicher Generator wie die anderen Themen (gemeinsames Modul `g3_stil.py`,
Stil-Regel GRAFIK-SPRITES.md §12). Eigene Materialleiter (§12.10):
  Treibholz und Muscheln → Korallenstein mit Bullaugen → Messing, Perlmutt und Glaskuppel.

Stufen-Sprache:
  Hauptkuppel   1 kleine Kuppel aus Treibholzrippen auf Steinen, Bullauge
                2 große Kuppel aus Korallenstein, Oberlicht, Röhre zu einer Nebenkuppel, Banner
                3 hohe Glaskuppel auf Messingring, Laternenspitze, zwei Nebenkuppeln, Fahne
  Perlenkammer  1 offene Riesenmuschel mit Perle   2 Perlmutt-Kuppel mit Schneckenturm und Glasfenstern
  Leuchtturm    1 Treibholzpfahl mit Laterne       2 gestreifter Steinturm mit Glaskanzel und Galerie

Aufruf: python3 tools/grafik/sprites-g3-unterwasser.py
Deterministisch, ohne Zufall.
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

from PIL import Image

sys.dont_write_bytecode = True  # kein __pycache__ im Repository
sys.path.insert(0, str(Path(__file__).resolve().parent))
from g3_stil import (  # noqa: E402
    BALKEN,
    BREITE,
    GRAU,
    HH,
    HW,
    KONTUR,
    PETROL,
    PETROL_HELL,
    SOCKEL,
    STEIN,
    Iso,
    Wesen,
    hell,
    kuppel,
    schatten,
    schreibe_atlas,
    wesen_bodenschatten,
)

# Materialleiter Unterwasser (§12.10)
TREIBHOLZ = (156, 134, 104)
MUSCHEL = (232, 208, 184)
KORALLENSTEIN = (206, 156, 132)
MESSING = (200, 164, 84)
PERLMUTT = (226, 222, 234)
GLAS = (164, 214, 226)
SAND = (214, 196, 150)
SEEGRAS = (78, 140, 96)
ROT = (208, 84, 70)
LICHT = (255, 214, 120)
TUER = (60, 54, 52)


def bullauge(iso: Iso, mitte, r: float, fenster: list, rahmen=MESSING) -> None:
    x, y = mitte
    iso.d.ellipse([x - r - 2, y - r - 2, x + r + 2, y + r + 2], fill=rahmen, outline=KONTUR)
    pts = [(x + r * math.cos(a / 12 * 2 * math.pi), y + r * math.sin(a / 12 * 2 * math.pi)) for a in range(12)]
    iso.poly(pts, (40, 70, 84))
    fenster.append(pts)


def steine(iso: Iso, ring: float, n: int, z: float = 0) -> None:
    p = iso.p
    pts = []
    for k in range(n):
        a = 2 * math.pi * k / n
        pts.append(p(ring * math.cos(a), ring * math.sin(a), z))
    for x, y in sorted(pts, key=lambda q: q[1]):
        iso.d.ellipse([x - 9, y - 7, x + 9, y + 4], fill=hell(SOCKEL, -6), outline=KONTUR)


def roehre(iso: Iso, a, b, r: float, farbe) -> None:
    """Röhre zwischen zwei Bildpunkten (in der Bildebene)."""
    iso.linie(a, b, KONTUR, int(r * 2 + 2))
    iso.linie(a, b, farbe, int(r * 2))
    iso.linie((a[0], a[1] - r * 0.5), (b[0], b[1] - r * 0.5), hell(farbe, 24), 2)


def laternenspitze(iso: Iso, spitze, fenster: list) -> tuple[float, float]:
    x, y = spitze
    iso.poly([(x - 6, y + 2), (x + 6, y + 2), (x + 5, y - 14), (x - 5, y - 14)], MESSING, KONTUR)
    lat = [(x - 4, y), (x + 4, y), (x + 4, y - 11), (x - 4, y - 11)]
    iso.poly(lat, LICHT, KONTUR)
    fenster.append(lat)
    iso.poly([(x - 7, y - 14), (x + 7, y - 14), (x, y - 24)], hell(MESSING, -20), KONTUR)
    return (x, y - 24)


# —— Hauptkuppel (kern, 3×3) ——————————————————————————————


def kern1(iso: Iso, fenster: list) -> None:
    """Kleine Kuppel aus Treibholzrippen und Muschelplatten auf einem Steinring, Bullauge, Tür."""
    schatten(iso, 0.9)
    steine(iso, 0.72, 10)
    kuppel(iso, 0, 0, 0.66, 6, 58, MUSCHEL, rippen=6, rippe=hell(TREIBHOLZ, -20))
    cx, cy = iso.p(0, 0, 6)
    bullauge(iso, (cx + 26, cy - 30), 8, fenster, TREIBHOLZ)
    iso.poly([(cx - 26, cy + 10), (cx - 6, cy + 14), (cx - 6, cy - 22), (cx - 16, cy - 30), (cx - 26, cy - 22)], TUER, KONTUR)


def kern2(iso: Iso, fenster: list) -> None:
    """Große Kuppel aus Korallenstein mit Glas-Oberlicht, Röhre zu einer Nebenkuppel, Banner."""
    schatten(iso, 1.2)
    p = iso.p
    # Nebenkuppel hinten rechts und Röhre
    kuppel(iso, 0.95, -0.95, 0.38, 0, 40, KORALLENSTEIN)
    roehre(iso, p(0.75, -0.7, 20), p(0.4, -0.35, 24), 7, MESSING)
    iso.quader(-0.95, 0.95, -0.95, 0.95, 0, 16, STEIN)
    iso.textur_stein(-0.95, 0.95, -0.95, 0.95, 0, 16, 8)
    spitze = kuppel(iso, 0, 0, 0.9, 16, 84, KORALLENSTEIN, rippen=8)
    cx, cy = p(0, 0, 16)
    for dx, dz in ((-44, 30), (-12, 44), (22, 42), (48, 26)):
        bullauge(iso, (cx + dx, cy - dz), 7, fenster)
    iso.poly([(cx - 30, cy + 18), (cx - 6, cy + 22), (cx - 6, cy - 18), (cx - 18, cy - 28), (cx - 30, cy - 18)], TUER, KONTUR)
    # Aufsatz: kleiner Turm mit Oberlicht-Kuppel
    iso.zylinder(0, 0, 0.2, 98, 126, KORALLENSTEIN)
    kuppel(iso, 0, 0, 0.24, 126, 20, GLAS)
    t = p(0, 0, 112)
    fenster.append([(t[0] - 8, t[1] + 4), (t[0] + 8, t[1] + 4), (t[0] + 8, t[1] - 6), (t[0] - 8, t[1] - 6)])
    iso.banner_r(0.7, 0.3, 66, 34, PETROL)


def kern3(iso: Iso, fenster: list) -> None:
    """Hohe Glaskuppel auf Messingring, Laternenspitze, zwei Nebenkuppeln, Röhren, Fahne."""
    schatten(iso, 1.42)
    p = iso.p
    kuppel(iso, 1.0, -1.0, 0.36, 0, 40, KORALLENSTEIN)
    kuppel(iso, -1.0, 1.0, 0.36, 0, 38, PERLMUTT, rippen=4)
    roehre(iso, p(0.8, -0.75, 28), p(0.45, -0.4, 36), 8, MESSING)
    iso.quader(-1.0, 1.0, -1.0, 1.0, 0, 20, STEIN)
    iso.textur_stein(-1.0, 1.0, -1.0, 1.0, 0, 20, 10)
    # Unterbau: runder Korallenstein-Turm, Messingring
    iso.zylinder(0, 0, 0.82, 20, 96, KORALLENSTEIN)
    cx, cy = p(0, 0, 0)
    for dx, dz in ((-50, 60), (-18, 64), (18, 64), (50, 60)):
        bullauge(iso, (cx + dx, cy - dz + 14), 8, fenster)
    iso.poly([(cx - 10, cy + 24), (cx + 10, cy + 24), (cx + 10, cy - 14), (cx, cy - 22), (cx - 10, cy - 14)], TUER, KONTUR)
    iso.zylinder(0, 0, 0.88, 96, 106, MESSING, stein=False)
    # hohe Glaskuppel mit Messingrippen, darin Licht
    spitze = kuppel(iso, 0, 0, 0.78, 106, 96, GLAS, rippen=8, rippe=MESSING)
    gx, gy = p(0, 0, 140)
    fenster.append([(gx - 34, gy + 10), (gx + 34, gy + 10), (gx + 22, gy - 26), (gx - 22, gy - 26)])
    iso.d.ellipse([gx - 24, gy - 30, gx + 2, gy - 12], fill=hell(GLAS, 36))  # Glanz
    spitze = laternenspitze(iso, spitze, fenster)
    iso.fahne(spitze, 30, PETROL_HELL)
    iso.banner_r(0.58, 0.58, 92, 46, PETROL)
    # Röhre zur vorderen Nebenkuppel (nach der Hauptkuppel, liegt davor)
    roehre(iso, p(-0.8, 0.75, 28), p(-0.5, 0.45, 32), 8, MESSING)


# —— Perlenkammer (wissen, 2×2) ——————————————————————————————


def muschelschale(iso: Iso, cx, cy, b: float, h: float, farbe, rippen: int = 9) -> None:
    pts = [(cx - b * math.cos(math.pi * i / 20), cy - h * math.sin(math.pi * i / 20)) for i in range(21)]
    pts += [(cx + b * 0.3, cy + 6), (cx - b * 0.3, cy + 6)]
    iso.poly(pts, farbe, KONTUR)
    for k in range(1, rippen):
        a = math.pi * k / rippen
        iso.linie((cx, cy + 4), (cx - b * math.cos(a) * 0.96, cy - h * math.sin(a) * 0.96), hell(farbe, -30))


def wissen1(iso: Iso, fenster: list) -> None:
    """Offene Riesenmuschel mit leuchtender Perle auf Sand und Steinen."""
    schatten(iso, 0.85)
    p = iso.p
    iso.quader(-0.7, 0.7, -0.6, 0.6, 0, 6, SAND, links=-20, rechts=-8)
    cx, cy = p(0, 0, 6)
    muschelschale(iso, cx + 4, cy - 30, 62, 64, hell(MUSCHEL, -14))  # obere Schale, aufgeklappt
    iso.d.ellipse([cx - 58, cy - 22, cx + 62, cy + 18], fill=hell(MUSCHEL, -40), outline=KONTUR)
    iso.d.ellipse([cx - 50, cy - 16, cx + 54, cy + 12], fill=hell(PERLMUTT, -10))
    perle = [(cx - 10 + 10 * math.cos(a / 12 * 2 * math.pi), cy - 10 + 10 * math.sin(a / 12 * 2 * math.pi)) for a in range(12)]
    iso.poly(perle, (246, 244, 250), KONTUR)
    fenster.append(perle)
    for dx in (-60, 58):
        iso.d.ellipse([cx + dx - 8, cy + 4, cx + dx + 8, cy + 14], fill=SOCKEL, outline=KONTUR)


def wissen2(iso: Iso, fenster: list) -> None:
    """Perlmutt-Kuppel mit Schneckenturm, Glasfenstern und Banner."""
    schatten(iso, 1.0)
    p = iso.p
    iso.quader(-0.85, 0.85, -0.85, 0.85, 0, 12, SAND, links=-20, rechts=-8)
    # Schneckenturm hinten links: hoher Spiralkegel mit Laterne
    spitze = iso.kegel(-0.45, -0.45, 0.4, 12, 150, MUSCHEL)
    tx, ty = iso.p(-0.45, -0.45, 12)
    rx = 0.4 * HW * math.sqrt(2)
    for k in range(7):  # Spirallinie: schräge Bänder, die nach oben enger werden
        z0, z1 = 12 + k * 22, 12 + (k + 1) * 22
        f0, f1 = 1 - (z0 - 12) / 150, 1 - (z1 - 12) / 150
        iso.linie((tx - rx * f0 * 0.9, ty - (z0 - 12) + 4), (tx + rx * f1 * 0.9, ty - (z1 - 12) + 2), hell(MUSCHEL, -50), 2)
    lx, ly = spitze
    lat = [(lx - 4, ly + 30), (lx + 4, ly + 30), (lx + 4, ly + 40), (lx - 4, ly + 40)]
    iso.poly(lat, LICHT, KONTUR)
    fenster.append(lat)
    kuppel(iso, 0.15, 0.15, 0.68, 12, 64, PERLMUTT, rippen=6, rippe=hell(MUSCHEL, -50))
    cx, cy = p(0.15, 0.15, 12)
    for dx, dz in ((-28, 30), (8, 40), (38, 26)):
        bullauge(iso, (cx + dx, cy - dz), 9, fenster)
    iso.poly([(cx - 46, cy + 12), (cx - 24, cy + 16), (cx - 24, cy - 16), (cx - 35, cy - 26), (cx - 46, cy - 16)], TUER, KONTUR)
    iso.banner_r(0.7, 0.55, 48, 30, PETROL)


# —— Leuchtturm (turm, 1×1) ——————————————————————————————


def turm1(iso: Iso, fenster: list) -> None:
    """Treibholzpfahl mit Querholz, Laterne und Steinen am Fuß."""
    schatten(iso, 0.42)
    p = iso.p
    steine(iso, 0.26, 6)
    iso.quader(-0.06, 0.06, -0.06, 0.06, 0, 128, TREIBHOLZ, links=-36, rechts=-8)
    for z in (40, 84):
        iso.linie(p(-0.06, 0.06, z), p(0.06, -0.06, z + 30), hell(TREIBHOLZ, -30), 3)
    iso.linie(p(-0.2, 0.0, 118), p(0.22, 0.0, 118), hell(TREIBHOLZ, -20), 4)
    m = p(0.18, 0.0, 114)
    iso.linie(m, (m[0], m[1] + 8), BALKEN, 1)
    lat = [(m[0] - 6, m[1] + 8), (m[0] + 6, m[1] + 8), (m[0] + 6, m[1] + 22), (m[0] - 6, m[1] + 22)]
    iso.poly(lat, LICHT, KONTUR)
    fenster.append(lat)
    iso.poly([(m[0] - 8, m[1] + 8), (m[0] + 8, m[1] + 8), (m[0], m[1] + 1)], MESSING, KONTUR)


def turm2(iso: Iso, fenster: list) -> None:
    """Gestreifter Steinturm, Galerie, Glaskanzel mit Licht, Messinghaube, Fahne."""
    schatten(iso, 0.5)
    p = iso.p
    steine(iso, 0.4, 8)
    iso.zylinder(0, 0, 0.36, 0, 170, (236, 232, 224), stein=False)
    cx, cy = p(0, 0, 0)
    rx, ry = 0.36 * HW * math.sqrt(2), 0.36 * HH * math.sqrt(2)
    for z0 in (30, 100):  # rote Bänder
        for i in range(24):
            a0, a1 = math.pi * i / 24, math.pi * (i + 1) / 24
            xa, xb = cx - rx * math.cos(a0), cx - rx * math.cos(a1)
            ya, yb = cy + ry * math.sin(a0), cy + ry * math.sin(a1)
            ton = hell(ROT, int(-30 + 40 * (i / 24)))
            iso.poly([(xa, ya - z0), (xb, yb - z0), (xb, yb - z0 - 34), (xa, ya - z0 - 34)], ton)
    iso.poly([(cx - 6, cy + ry), (cx + 6, cy + ry), (cx + 6, cy + ry - 26), (cx - 6, cy + ry - 26)], TUER, KONTUR)
    # Galerie
    gx, gy = 0.52 * HW * math.sqrt(2), 0.52 * HH * math.sqrt(2)
    iso.d.ellipse([cx - gx, cy - gy - 172, cx + gx, cy + gy - 172], fill=hell(GRAU, -20), outline=KONTUR)
    # Glaskanzel mit Licht
    iso.zylinder(0, 0, 0.26, 172, 206, GLAS, stein=False)
    lat = [(cx - 10, cy - 176), (cx + 10, cy - 176), (cx + 10, cy - 200), (cx - 10, cy - 200)]
    iso.poly(lat, LICHT, KONTUR)
    fenster.append(lat)
    for k in range(9):
        a = math.pi * k / 8
        x, y = cx - gx * math.cos(a), cy + gy * math.sin(a) - 172
        iso.linie((x, y), (x, y - 12), hell(GRAU, -40), 2)
    iso.d.arc([cx - gx, cy - gy - 184, cx + gx, cy + gy - 184], 0, 180, fill=hell(GRAU, -40), width=2)
    spitze = iso.kegel(0, 0, 0.32, 206, 34, MESSING)
    iso.fahne(spitze, 22, PETROL_HELL)


# —— Werft, Schleuse, Riff, Anker, Boje, Seegras, Skulptur ——————————————


def werkstatt1(iso: Iso, fenster: list) -> None:
    """Werft: Holzgerüst mit Kran, darin ein kleines U-Boot im Bau, Bretter im Sand."""
    schatten(iso, 0.95)
    p = iso.p
    iso.quader(-0.9, 0.9, -0.7, 0.7, 0, 6, SAND, links=-20, rechts=-8)
    for (x, y) in ((-0.7, -0.5), (0.7, -0.5)):
        iso.quader(x - 0.04, x + 0.04, y - 0.04, y + 0.04, 6, 92, TREIBHOLZ, links=-36, rechts=-8)
    iso.linie(p(-0.7, -0.5, 92), p(0.7, -0.5, 92), hell(TREIBHOLZ, -20), 4)
    # U-Boot: Rumpf als liegender Körper, Turm, Bullaugen, Propeller
    for k in range(18):
        t = k / 17
        x = -0.6 + 1.2 * t
        r = 20 * math.sin(math.pi * (0.1 + 0.8 * t)) + 4
        m = p(x, 0.0, 30)
        iso.d.ellipse([m[0] - r * 0.7, m[1] - r, m[0] + r * 0.7, m[1] + r * 0.6], fill=hell(MESSING, -10 + int(16 * t)))
    m = p(-0.6, 0.0, 30)
    n = p(0.6, 0.0, 30)
    iso.linie((m[0], m[1] - 21), (n[0], n[1] - 21), KONTUR)
    iso.linie((m[0], m[1] + 13), (n[0], n[1] + 13), KONTUR)
    t = p(0.0, 0.0, 50)
    iso.poly([(t[0] - 10, t[1]), (t[0] + 12, t[1] + 4), (t[0] + 10, t[1] - 16), (t[0] - 8, t[1] - 18)], hell(MESSING, 6), KONTUR)
    for x in (-0.3, 0.05, 0.35):
        bullauge(iso, p(x, 0.0, 32), 4, fenster)
    pr = p(-0.68, 0.0, 30)
    iso.poly([(pr[0], pr[1]), (pr[0] - 6, pr[1] - 10), (pr[0] - 4, pr[1] + 8)], hell(GRAU, -20), KONTUR)
    # Kran mit Haken
    iso.linie(p(0.7, -0.5, 92), p(0.2, -0.5, 110), hell(TREIBHOLZ, -30), 3)
    h = p(0.2, -0.5, 110)
    iso.linie(h, (h[0], h[1] + 28), (110, 100, 90), 1)
    for k in range(3):
        iso.quader(0.45, 0.85, 0.4 + k * 0.08, 0.46 + k * 0.08, 6, 10, hell(TREIBHOLZ, 20 - k * 10))


def eingang1(iso: Iso, fenster: list) -> None:
    """Tauchschleuse: runde Luke in einem Messingrahmen auf Steinsockel, Handrad, zwei Lampen."""
    schatten(iso, 0.45)
    p = iso.p
    iso.quader(-0.42, 0.42, -0.12, 0.12, 0, 14, STEIN)
    iso.quader(-0.4, 0.4, -0.06, 0.06, 14, 86, hell(MESSING, -30), links=-26, rechts=-8)
    m = p(0.0, 0.06, 50)
    iso.d.ellipse([m[0] - 26, m[1] - 30, m[0] + 26, m[1] + 30], fill=MESSING, outline=KONTUR)
    iso.d.ellipse([m[0] - 20, m[1] - 24, m[0] + 20, m[1] + 24], fill=hell(GRAU, -60), outline=KONTUR)
    iso.d.ellipse([m[0] - 9, m[1] - 9, m[0] + 9, m[1] + 9], outline=MESSING, width=3)
    for a in range(4):
        w = a * math.pi / 2 + math.pi / 4
        iso.linie(m, (m[0] + 11 * math.cos(w), m[1] + 11 * math.sin(w)), MESSING, 2)
    for x in (-0.36, 0.36):
        l = p(x, 0.06, 90)
        lat = [(l[0] - 4, l[1]), (l[0] + 4, l[1]), (l[0] + 4, l[1] - 9), (l[0] - 4, l[1] - 9)]
        iso.poly(lat, LICHT, KONTUR)
        fenster.append(lat)


def einfassung1(iso: Iso, fenster: list) -> None:
    """Korallenriff: Äste, Fächer und Hirnkorallen auf einem Steinstreifen, anschlussfähig."""
    p = iso.p
    iso.quader(-0.5, 0.5, -0.14, 0.14, 0, 10, SOCKEL)
    for k, x in enumerate((-0.38, -0.12, 0.14, 0.38)):
        b = p(x, 0.0, 10)
        if k % 2 == 0:  # Ast-Koralle
            for dx, h in ((-6, 30), (0, 40), (6, 28)):
                iso.linie(b, (b[0] + dx, b[1] - h), ROT, 4)
                iso.d.ellipse([b[0] + dx - 3, b[1] - h - 3, b[0] + dx + 3, b[1] - h + 3], fill=hell(ROT, 30))
        else:  # Fächer
            iso.poly([b, (b[0] - 14, b[1] - 30), (b[0] + 14, b[1] - 32)], (232, 180, 70), KONTUR)
            for dx in (-8, 0, 8):
                iso.linie(b, (b[0] + dx, b[1] - 28), hell((232, 180, 70), -40))
    m = p(0.0, 0.1, 10)
    iso.d.ellipse([m[0] - 10, m[1] - 10, m[0] + 10, m[1] + 4], fill=(170, 130, 190), outline=KONTUR)


def ursprung1(iso: Iso, fenster: list) -> None:
    """Anker im Sand, schräg, mit Kette."""
    schatten(iso, 0.4)
    p = iso.p
    iso.quader(-0.32, 0.32, -0.32, 0.32, 0, 4, SAND, links=-20, rechts=-8)
    eisen = (96, 100, 108)
    b = p(0.05, 0.05, 4)
    oben = (b[0] - 10, b[1] - 66)
    iso.linie(b, oben, KONTUR, 7)
    iso.linie(b, oben, eisen, 5)
    iso.linie((oben[0] - 14, oben[1] + 10), (oben[0] + 12, oben[1] + 6), eisen, 4)
    iso.d.ellipse([oben[0] - 6, oben[1] - 12, oben[0] + 6, oben[1]], outline=eisen, width=3)
    iso.d.arc([b[0] - 24, b[1] - 30, b[0] + 22, b[1] + 6], 20, 160, fill=eisen, width=5)
    for dx in (-22, 20):
        iso.poly([(b[0] + dx, b[1] - 12), (b[0] + dx - 4 * (1 if dx < 0 else -1), b[1] - 24), (b[0] + dx + 6 * (1 if dx < 0 else -1), b[1] - 14)], eisen, KONTUR)
    for k in range(6):  # Kette
        c = (oben[0] + 6 + k * 6, oben[1] - 4 + k * 9)
        iso.d.ellipse([c[0] - 3, c[1] - 4, c[0] + 3, c[1] + 4], outline=hell(eisen, 20), width=2)


def zeichen1(iso: Iso, fenster: list) -> None:
    """Boje: Petrol-Schwimmkörper mit hellem Band, Mast mit Fahne, Kette zum Grund."""
    schatten(iso, 0.3)
    p = iso.p
    b = p(0.0, 0.0, 0)
    for k in range(4):
        iso.d.ellipse([b[0] - 3, b[1] - 8 - k * 8, b[0] + 3, b[1] - k * 8], outline=(110, 110, 116), width=2)
    iso.zylinder(0, 0, 0.18, 34, 64, PETROL, stein=False)
    iso.zylinder(0, 0, 0.19, 46, 52, (244, 239, 228), stein=False)
    iso.kegel(0, 0, 0.18, 64, 16, PETROL)
    t = p(0, 0, 80)
    iso.linie(t, (t[0], t[1] - 40), (244, 239, 228), 2)
    iso.poly([(t[0] + 1, t[1] - 40), (t[0] + 22, t[1] - 34), (t[0] + 1, t[1] - 28)], PETROL_HELL, KONTUR)
    lat = [(t[0] - 3, t[1] - 6), (t[0] + 3, t[1] - 6), (t[0] + 3, t[1]), (t[0] - 3, t[1])]
    iso.poly(lat, LICHT, KONTUR)
    fenster.append(lat)


def flaeche1(iso: Iso, fenster: list) -> None:
    """Seegraswiese: Sandfläche mit Büscheln Seegras, Muscheln und einem Seestern."""
    p = iso.p
    iso.quader(-0.92, 0.92, -0.92, 0.92, 0, 4, SAND, hell(SAND, 8), links=-20, rechts=-8)
    for r, v in enumerate((-0.6, -0.2, 0.2, 0.6)):
        for k in range(5):
            u = -0.7 + k * 0.35 + (0.12 if r % 2 else 0)
            b = p(u, v, 4)
            for j, (dx, h) in enumerate(((-4, 24), (0, 34), (4, 26))):
                kurve = 5 if (k + j) % 2 else -5
                iso.linie(b, (b[0] + dx + kurve, b[1] - h * 0.55), hell(SEEGRAS, j * 10 - 6), 3)
                iso.linie((b[0] + dx + kurve, b[1] - h * 0.55), (b[0] + dx, b[1] - h), hell(SEEGRAS, j * 10 + 4), 2)
    for u, v in ((0.7, 0.7), (-0.75, 0.75)):
        m = p(u, v, 4)
        iso.d.pieslice([m[0] - 6, m[1] - 6, m[0] + 6, m[1] + 6], 180, 360, fill=MUSCHEL, outline=KONTUR)
    s = p(0.1, 0.8, 4)
    stern = [(s[0] + (8 if k % 2 == 0 else 3) * math.cos(k * math.pi / 5), s[1] + (4 if k % 2 == 0 else 1.5) * math.sin(k * math.pi / 5)) for k in range(10)]
    iso.poly(stern, (230, 120, 70), KONTUR)


def denkmal1(iso: Iso, fenster: list) -> None:
    """Muschelskulptur in Grau auf einem Steinsockel."""
    schatten(iso, 0.38)
    p = iso.p
    iso.quader(-0.28, 0.28, -0.28, 0.28, 0, 10, hell(STEIN, -14))
    iso.quader(-0.2, 0.2, -0.2, 0.2, 10, 40, STEIN)
    iso.textur_stein(-0.2, 0.2, -0.2, 0.2, 10, 40, 10)
    m = p(0.0, 0.0, 40)
    muschelschale(iso, m[0], m[1] - 6, 30, 52, GRAU, 9)
    iso.d.ellipse([m[0] - 8, m[1] - 10, m[0] + 8, m[1] + 2], fill=hell(GRAU, -20), outline=KONTUR)


# —— Umgebung: Korallen an den festen Plätzen der Unterwasser-Szene ——————————


def koralle_a(iso: Iso, fenster: list) -> None:
    """Rote Ast-Koralle."""
    schatten(iso, 0.3)
    b = iso.p(0, 0, 0)
    for dx, h, w in ((-10, 30, 4), (-4, 44, 5), (4, 38, 5), (10, 26, 4)):
        mitte = (b[0] + dx * 0.5, b[1] - h * 0.5)
        iso.linie(b, mitte, KONTUR, w + 2)
        iso.linie(mitte, (b[0] + dx, b[1] - h), KONTUR, w + 2)
    for dx, h, w in ((-10, 30, 4), (-4, 44, 5), (4, 38, 5), (10, 26, 4)):
        mitte = (b[0] + dx * 0.5, b[1] - h * 0.5)
        iso.linie(b, mitte, ROT, w)
        iso.linie(mitte, (b[0] + dx, b[1] - h), hell(ROT, 16), w)
        iso.d.ellipse([b[0] + dx - 3, b[1] - h - 3, b[0] + dx + 3, b[1] - h + 3], fill=hell(ROT, 40))


def koralle_b(iso: Iso, fenster: list) -> None:
    """Gelbe Fächerkoralle mit violetter Hirnkoralle davor."""
    schatten(iso, 0.3)
    b = iso.p(0, 0, 0)
    gelb = (232, 180, 70)
    iso.poly([b, (b[0] - 20, b[1] - 38), (b[0] - 4, b[1] - 46), (b[0] + 16, b[1] - 40)], gelb, KONTUR)
    for dx in (-14, -6, 2, 10):
        iso.linie(b, (b[0] + dx, b[1] - 40), hell(gelb, -40))
    iso.d.ellipse([b[0] - 2, b[1] - 12, b[0] + 18, b[1] + 4], fill=(170, 130, 190), outline=KONTUR)
    iso.d.arc([b[0] + 2, b[1] - 9, b[0] + 14, b[1] + 1], 180, 360, fill=hell((170, 130, 190), -40))


UMGEBUNG = [("koralle_a", koralle_a), ("koralle_b", koralle_b)]


# —— Wesen: Fisch, Krebs, Qualle ——————————————————————————————


def fisch(zyklus: str, frame: int) -> Image.Image:
    w = Wesen()
    o, o_h, weiss = (236, 140, 60), (250, 190, 110), (244, 242, 236)
    y = 32 + ([0, -1, 0][frame % 3] if zyklus == "idle" else [0, -1.5, 0, 1.5][frame % 4] if zyklus == "walk" else -3 - frame * 3)
    wedel = [0, 3, 0, -3][frame % 4] if zyklus != "idle" else [0, 1.5, 0][frame % 3]
    wesen_bodenschatten(w, 7)
    w.form([(20, y), (12, y - 7 + wedel), (12, y + 7 + wedel)], o)
    w.oval(18, y - 9, 44, y + 9, o)
    w.oval(24, y - 8, 42, y + 2, o_h, kontur=False)
    for sx in (26, 33):
        w.form([(sx, y - 8.5), (sx + 3, y - 8.5), (sx + 3, y + 8.5), (sx, y + 8.5)], weiss, kontur=False)
    w.form([(28, y - 9), (34, y - 14), (36, y - 8)], hell(o, -20))
    w.oval(37, y - 4, 41, y, (244, 242, 236), kontur=False)
    w.oval(38.5, y - 3, 40.5, y - 1, (30, 26, 22), kontur=False)
    if zyklus == "react":
        for k in range(3):
            w.oval(46 + k * 2, y - 8 - k * 5, 50 + k * 2, y - 4 - k * 5, (210, 236, 244), kontur=True)
    return w.fertig()


def krebs(zyklus: str, frame: int) -> Image.Image:
    w = Wesen()
    rot, hellrot, dunkel = ROT, (236, 130, 110), (90, 40, 34)
    seit = [-2, 0, 2, 0][frame % 4] if zyklus == "walk" else 0
    wesen_bodenschatten(w, 13)
    for k, bx in enumerate((22, 26, 38, 42)):  # Beine
        sv = seit + (1 if k % 2 else -1) * (frame % 2 if zyklus == "walk" else 0)
        w.strich((bx + seit, 46), (bx + sv + (-4 if bx < 32 else 4), 54), dunkel, 1.6)
    w.oval(20 + seit, 36, 44 + seit, 50, rot)
    w.oval(25 + seit, 37, 40 + seit, 43, hellrot, kontur=False)
    hoch = 8 if zyklus == "react" else 0
    for s in (-1, 1):  # Scheren
        x = 32 + s * 14 + seit
        w.strich((32 + s * 9 + seit, 40), (x, 34 - hoch), rot, 2.4)
        w.form([(x - 4, 34 - hoch), (x, 26 - hoch - frame % 2 * (2 if zyklus == "react" else 0)), (x + 4, 34 - hoch), (x, 31 - hoch)], rot)
    for s in (-1, 1):  # Augen auf Stielen
        w.strich((32 + s * 3 + seit, 37), (32 + s * 4 + seit, 31), dunkel, 1)
        w.oval(32 + s * 4 - 1.5 + seit, 29, 32 + s * 4 + 1.5 + seit, 32, (30, 26, 22), kontur=False)
    return w.fertig()


def qualle(zyklus: str, frame: int) -> Image.Image:
    w = Wesen()
    rosa, hellrosa = (214, 150, 200, 230), (240, 200, 230, 230)
    zieh = [0, 2, 4, 2][frame % 4] if zyklus == "walk" else [0, 1, 0][frame % 3] if zyklus == "idle" else -frame * 4
    y = 22 - zieh * 0.5
    wesen_bodenschatten(w, 6)
    for k, x in enumerate((24, 28, 32, 36, 40)):
        welle = 2 if (k + frame) % 2 else -2
        w.strich((x, y + 12), (x + welle, y + 22 + zieh), hellrosa, 1.2)
        w.strich((x + welle, y + 22 + zieh), (x, y + 30 + zieh), hellrosa, 1.2)
    breit = 13 - (zieh * 0.5 if zyklus == "walk" else 0)
    w.d.pieslice([(32 - breit) * 4, (y - 10) * 4, (32 + breit) * 4, (y + 24) * 4], 180, 360, fill=rosa, outline=(43, 38, 32, 255), width=4)
    w.oval(32 - breit * 0.6, y - 4, 32 + breit * 0.2, y + 4, hellrosa, kontur=False)
    w.oval(26, y + 4, 38, y + 9, (200, 120, 180, 230), kontur=False)
    return w.fertig()


WESEN = {"fisch": fisch, "krebs": krebs, "qualle": qualle}


GEBAEUDE = [
    ("kern", 1, kern1, 3, BREITE),
    ("kern", 2, kern2, 3, BREITE),
    ("kern", 3, kern3, 3, BREITE),
    ("wissen", 1, wissen1, 2, 200),
    ("wissen", 2, wissen2, 2, 200),
    ("turm", 1, turm1, 1, 104),
    ("turm", 2, turm2, 1, 104),
    ("werkstatt", 1, werkstatt1, 2, 200),
    ("eingang", 1, eingang1, 1, 104),
    ("einfassung", 1, einfassung1, 1, 104),
    ("ursprung", 1, ursprung1, 1, 104),
    ("zeichen", 1, zeichen1, 1, 104),
    ("flaeche", 1, flaeche1, 2, 200),
    ("denkmal", 1, denkmal1, 1, 104),
]


def main() -> int:
    return schreibe_atlas("unterwasser", GEBAEUDE, UMGEBUNG, WESEN)


if __name__ == "__main__":
    sys.exit(main())
