#!/usr/bin/env python3
"""G3: Thema `weltraum`, Epoche 1 (FOKUS.md Paket G, Klärung PV 02.11.2026).

Gleicher Generator wie die anderen Themen (gemeinsames Modul `g3_stil.py`,
Stil-Regel GRAFIK-SPRITES.md §12). Eigene Materialleiter (§12.10):
  Blech und Landekapsel → helle Paneele mit Nieten → Glas, Solarflügel und Leuchtband.

Stufen-Sprache:
  Kommandomodul 1 Landekapsel auf drei Beinen, Luke, Bullauge
                2 Paneelmodul mit Kapsel obenauf, Solarflügel, Antenne, Banner
                3 Turm aus drei Modulen, Glaskuppel, zwei große Solarflügel, Andockring, Leuchtband, Fahne
  Sternwarte    1 Teleskop auf Dreibein neben einer Gerätekiste
                2 Rundbau mit Kuppel, offenem Spalt und großem Teleskop
  Antennenmast  1 Gittermast mit kleiner Schüssel  2 hoher Mast, große Schüssel, Blinklicht, Fahne

Aufruf: python3 tools/grafik/sprites-g3-weltraum.py
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
    BREITE,
    HH,
    HW,
    KONTUR,
    PETROL,
    PETROL_HELL,
    Iso,
    Wesen,
    hell,
    kuppel,
    schatten,
    schreibe_atlas,
    wesen_bodenschatten,
)

# Materialleiter Weltraum (§12.10)
BLECH = (150, 156, 164)
PANEEL = (222, 226, 232)
NIETE = (176, 182, 190)
SOLAR = (52, 72, 128)
GLAS = (150, 206, 226)
ORANGE = (232, 140, 60)
LEUCHT = (110, 220, 220)
FELS = (120, 112, 128)
TUER = (64, 70, 80)
LICHT = (255, 214, 120)


def paneele(iso: Iso, x0, x1, y0, y1, z0, z1, n: int = 4, schritt: int = 24) -> None:
    """Fugen zwischen Paneelen und Nieten an den Ecken."""
    p = iso.p
    for z in range(int(z0) + schritt, int(z1), schritt):
        iso.linie(p(x0, y1, z), p(x1, y1, z), hell(PANEEL, -40))
        iso.linie(p(x1, y1, z), p(x1, y0, z), hell(PANEEL, -26))
    for k in range(1, n):
        u = k / n
        iso.linie(p(x0 + (x1 - x0) * u, y1, z0), p(x0 + (x1 - x0) * u, y1, z1), hell(PANEEL, -40))
        iso.linie(p(x1, y1 - (y1 - y0) * u, z0), p(x1, y1 - (y1 - y0) * u, z1), hell(PANEEL, -26))


def bullauge(iso: Iso, mitte, r: float, fenster: list) -> None:
    x, y = mitte
    iso.d.ellipse([x - r - 2, y - r - 2, x + r + 2, y + r + 2], fill=BLECH, outline=KONTUR)
    pts = [(x + r * math.cos(a / 12 * 2 * math.pi), y + r * math.sin(a / 12 * 2 * math.pi)) for a in range(12)]
    iso.poly(pts, (40, 52, 70))
    fenster.append(pts)


def solarfluegel(iso: Iso, ansatz, laenge: float, hoehe: float, *, richtung: int = 1) -> None:
    """Solarflügel in der Bildebene, schräg wie die rechte Fläche (Licht von rechts)."""
    x, y = ansatz
    dx, dy = laenge * richtung, -laenge * 0.5 * richtung
    iso.linie((x, y), (x + dx * 0.15, y + dy * 0.15), BLECH, 3)
    a = (x + dx * 0.15, y + dy * 0.15)
    pts = [(a[0], a[1] - hoehe / 2), (a[0] + dx, a[1] + dy - hoehe / 2), (a[0] + dx, a[1] + dy + hoehe / 2), (a[0], a[1] + hoehe / 2)]
    iso.poly(pts, SOLAR, KONTUR)
    for k in range(1, 5):
        t = k / 5
        iso.linie((a[0] + dx * t, a[1] + dy * t - hoehe / 2), (a[0] + dx * t, a[1] + dy * t + hoehe / 2), hell(SOLAR, 40))
    iso.linie((a[0], a[1]), (a[0] + dx, a[1] + dy), hell(SOLAR, 40))


def schuessel(iso: Iso, mitte, r: float, *, kippen: float = 0.45) -> None:
    x, y = mitte
    iso.d.ellipse([x - r, y - r * kippen, x + r, y + r * kippen], fill=hell(PANEEL, -30), outline=KONTUR)
    iso.d.ellipse([x - r * 0.8, y - r * kippen * 0.8 - 1, x + r * 0.8, y + r * kippen * 0.8 - 1], fill=PANEEL)
    iso.linie((x, y), (x + r * 0.2, y - r * 0.7), BLECH, 2)
    iso.d.ellipse([x + r * 0.2 - 2, y - r * 0.7 - 2, x + r * 0.2 + 2, y - r * 0.7 + 2], fill=ORANGE)


def leuchtband(iso: Iso, x0, x1, y0, y1, z, fenster: list) -> None:
    p = iso.p
    l = [p(x0, y1, z), p(x1, y1, z), p(x1, y1, z + 4), p(x0, y1, z + 4)]
    r = [p(x1, y1, z), p(x1, y0, z), p(x1, y0, z + 4), p(x1, y1, z + 4)]
    iso.poly(l, LEUCHT)
    iso.poly(r, hell(LEUCHT, 20))
    fenster.append(l)
    fenster.append(r)


# —— Kommandomodul (kern, 3×3) ——————————————————————————————


def kapsel(iso: Iso, fenster: list, x, y, z: float, r: float, h: float) -> tuple[float, float]:
    """Landekapsel: Kegelstumpf aus Blech mit Hitzeschild unten, Bullauge."""
    iso.zylinder(x, y, r, z, z + 8, hell(BLECH, -30), stein=False)  # Hitzeschild
    cx, cy = iso.p(x, y, 0)
    rx, ry = r * HW * math.sqrt(2), r * HH * math.sqrt(2)
    n = 24
    oben = 0.55
    for i in range(n):
        a0, a1 = math.pi * i / n, math.pi * (i + 1) / n
        ton = hell(BLECH, int(-34 + 50 * (i / n)))
        pts = [
            (cx - rx * math.cos(a0), cy + ry * math.sin(a0) - z - 8),
            (cx - rx * math.cos(a1), cy + ry * math.sin(a1) - z - 8),
            (cx - rx * oben * math.cos(a1), cy + ry * oben * math.sin(a1) - z - 8 - h),
            (cx - rx * oben * math.cos(a0), cy + ry * oben * math.sin(a0) - z - 8 - h),
        ]
        iso.poly(pts, ton)
    iso.d.ellipse([cx - rx * oben, cy - ry * oben - z - 8 - h, cx + rx * oben, cy + ry * oben - z - 8 - h], fill=hell(BLECH, 20), outline=KONTUR)
    for t in (0.33, 0.66):  # Ringfugen
        rr, yy = rx * (1 - (1 - oben) * t), cy - z - 8 - h * t
        iso.d.arc([cx - rr, yy - ry * (1 - (1 - oben) * t), cx + rr, yy + ry * (1 - (1 - oben) * t)], 0, 180, fill=hell(BLECH, -40))
    bullauge(iso, (cx + rx * 0.3, cy - z - 8 - h * 0.55), 7, fenster)
    return (cx, cy - z - 8 - h)


def kern1(iso: Iso, fenster: list) -> None:
    """Landekapsel auf drei Beinen, Luke, Bullauge, kleine Antenne."""
    schatten(iso, 0.85)
    p = iso.p
    for (x, y) in ((-0.55, 0.3), (0.3, -0.55), (0.45, 0.45)):
        iso.linie(p(x, y, 0), p(x * 0.5, y * 0.5, 34), BLECH, 4)
        a = p(x, y, 0)
        iso.d.ellipse([a[0] - 7, a[1] - 3, a[0] + 7, a[1] + 3], fill=hell(BLECH, -20), outline=KONTUR)
    spitze = kapsel(iso, fenster, 0, 0, 30, 0.6, 76)
    cx, cy = p(0, 0, 0)
    iso.poly([(cx - 22, cy - 42), (cx - 6, cy - 40), (cx - 6, cy - 72), (cx - 20, cy - 74)], TUER, KONTUR)
    iso.linie(spitze, (spitze[0] + 4, spitze[1] - 26), BLECH, 2)
    iso.d.ellipse([spitze[0] + 2, spitze[1] - 30, spitze[0] + 6, spitze[1] - 26], fill=ORANGE)


def kern2(iso: Iso, fenster: list) -> None:
    """Paneelmodul mit Kapsel obenauf, Solarflügel, Antenne, Banner."""
    schatten(iso, 1.2)
    p = iso.p
    iso.quader(-0.9, 0.9, -0.9, 0.9, 0, 12, BLECH)
    iso.zylinder(0, 0, 0.78, 12, 102, PANEEL, stein=False)
    cx, cy = p(0, 0, 0)
    rx, ry = 0.78 * HW * math.sqrt(2), 0.78 * HH * math.sqrt(2)
    for z in (40, 72):
        iso.d.arc([cx - rx, cy - ry - z, cx + rx, cy + ry - z], 0, 180, fill=hell(PANEEL, -40))
    for dx in (-40, 0, 40):
        bullauge(iso, (cx + dx, cy - 56 + abs(dx) * 0.12), 8, fenster)
    iso.poly([(cx - 62, cy + 6), (cx - 42, cy + 14), (cx - 42, cy - 30), (cx - 62, cy - 36)], TUER, KONTUR)
    solarfluegel(iso, p(0.6, -0.5, 80), 80, 26)
    spitze = kapsel(iso, fenster, 0, 0, 102, 0.5, 64)
    iso.linie(spitze, (spitze[0], spitze[1] - 34), BLECH, 2)
    iso.d.ellipse([spitze[0] - 3, spitze[1] - 38, spitze[0] + 3, spitze[1] - 32], fill=ORANGE)
    iso.banner_r(0.55, 0.55, 96, 40, PETROL)


def kern3(iso: Iso, fenster: list) -> None:
    """Turm aus drei Modulen, Glaskuppel, zwei große Solarflügel, Andockring, Leuchtband, Fahne."""
    schatten(iso, 1.42)
    p = iso.p
    iso.quader(-1.0, 1.0, -1.0, 1.0, 0, 14, BLECH)
    # Seitenmodul hinten rechts mit Röhre
    iso.quader(0.55, 1.35, -1.35, -0.55, 14, 74, PANEEL, links=-30, rechts=-8)
    paneele(iso, 0.55, 1.35, -1.35, -0.55, 14, 74, 3, 20)
    fenster.append(iso.fenster_r(1.35, -0.95, 34, b=0.3, h=14, bogen=False))
    cx, cy = p(0, 0, 0)
    rx, ry = 0.72 * HW * math.sqrt(2), 0.72 * HH * math.sqrt(2)
    solarfluegel(iso, p(0.45, -0.45, 220), 76, 30)
    for i, (z0, z1) in enumerate(((14, 94), (98, 178), (182, 250))):
        r = 0.72 - i * 0.08
        iso.zylinder(0, 0, r, z0, z1, PANEEL, stein=False)
        iso.zylinder(0, 0, r + 0.04, z1, z1 + 4, BLECH, stein=False)
        rr = r * HW * math.sqrt(2)
        for dx in (-rr * 0.5, rr * 0.05, rr * 0.55):
            bullauge(iso, (cx + dx, cy - (z0 + z1) / 2 + abs(dx) * 0.1), 7, fenster)
        lb = [(cx - rr, cy - z0 - 6), (cx + rr, cy - z0 - 6), (cx + rr, cy - z0 - 10), (cx - rr, cy - z0 - 10)]
        iso.poly(lb, LEUCHT)
        fenster.append(lb)
    iso.poly([(cx - 10, cy + ry - 2), (cx + 10, cy + ry - 2), (cx + 10, cy + ry - 40), (cx - 10, cy + ry - 40)], TUER, KONTUR)
    # Andockring links
    a = p(-0.9, 0.2, 140)
    iso.d.ellipse([a[0] - 16, a[1] - 22, a[0] + 6, a[1] + 22], fill=BLECH, outline=KONTUR)
    iso.d.ellipse([a[0] - 12, a[1] - 16, a[0] + 2, a[1] + 16], fill=hell(BLECH, -50))
    solarfluegel(iso, p(-0.45, 0.45, 160), 74, 30, richtung=-1)
    # Glaskuppel mit Antenne und Fahne
    spitze = kuppel(iso, 0, 0, 0.54, 254, 52, GLAS, rippen=6, rippe=BLECH)
    g = p(0, 0, 274)
    fenster.append([(g[0] - 24, g[1] + 6), (g[0] + 24, g[1] + 6), (g[0] + 14, g[1] - 16), (g[0] - 14, g[1] - 16)])
    iso.fahne(spitze, 34, PETROL_HELL)
    iso.banner_r(0.62, 0.62, 170, 46, PETROL)


# —— Sternwarte (wissen, 2×2) ——————————————————————————————


def wissen1(iso: Iso, fenster: list) -> None:
    """Teleskop auf Dreibein neben einer Gerätekiste mit Lämpchen."""
    schatten(iso, 0.85)
    p = iso.p
    iso.quader(-0.7, -0.05, -0.2, 0.45, 0, 34, PANEEL, links=-30, rechts=-8)
    paneele(iso, -0.7, -0.05, -0.2, 0.45, 0, 34, 2, 16)
    lat = [*p(-0.05, 0.1, 20)]
    l = [(lat[0] - 4, lat[1] - 4), (lat[0] + 4, lat[1] - 6), (lat[0] + 4, lat[1] + 2), (lat[0] - 4, lat[1] + 4)]
    iso.poly(l, LEUCHT, KONTUR)
    fenster.append(l)
    b = p(0.35, -0.1, 0)
    for dx, dy in ((-14, 4), (12, 6), (2, -8)):
        iso.linie((b[0] + dx, b[1] + dy), (b[0], b[1] - 40), BLECH, 3)
    rohr_a, rohr_b = (b[0] - 16, b[1] - 34), (b[0] + 22, b[1] - 66)
    iso.linie(rohr_a, rohr_b, KONTUR, 12)
    iso.linie(rohr_a, rohr_b, PANEEL, 10)
    iso.linie((rohr_a[0], rohr_a[1] - 3), (rohr_b[0], rohr_b[1] - 3), hell(PANEEL, 20), 3)
    iso.d.ellipse([rohr_b[0] - 6, rohr_b[1] - 6, rohr_b[0] + 6, rohr_b[1] + 6], fill=GLAS, outline=KONTUR)


def wissen2(iso: Iso, fenster: list) -> None:
    """Rundbau mit Kuppel, offenem Spalt, großem Teleskop, Sternbanner."""
    schatten(iso, 1.0)
    p = iso.p
    iso.quader(-0.88, 0.88, -0.88, 0.88, 0, 10, BLECH)
    iso.zylinder(0, 0, 0.74, 10, 86, PANEEL, stein=False)
    cx, cy = p(0, 0, 0)
    rx, ry = 0.74 * HW * math.sqrt(2), 0.74 * HH * math.sqrt(2)
    iso.d.arc([cx - rx, cy - ry - 48, cx + rx, cy + ry - 48], 0, 180, fill=hell(PANEEL, -40))
    for dx in (-30, 30):
        bullauge(iso, (cx + dx, cy - 60), 7, fenster)
    iso.poly([(cx - 10, cy + ry - 2), (cx + 10, cy + ry - 2), (cx + 10, cy + ry - 40), (cx - 10, cy + ry - 40)], TUER, KONTUR)
    lb = [(cx - rx, cy - 84), (cx + rx, cy - 84), (cx + rx, cy - 88), (cx - rx, cy - 88)]
    iso.poly(lb, LEUCHT)
    fenster.append(lb)
    spitze = kuppel(iso, 0, 0, 0.74, 86, 76, PANEEL)
    # Spalt in der Kuppel, Teleskop schaut heraus
    sx, sy = spitze
    spalt = [(sx - 6, sy + 2), (sx + 6, sy + 2), (sx + 16, sy + 62), (sx + 2, sy + 64)]
    iso.poly(spalt, (30, 36, 52), KONTUR)
    fenster.append(spalt)
    iso.linie((sx + 6, sy + 40), (sx + 30, sy - 10), KONTUR, 14)
    iso.linie((sx + 6, sy + 40), (sx + 30, sy - 10), BLECH, 12)
    iso.d.ellipse([sx + 23, sy - 17, sx + 37, sy - 3], fill=GLAS, outline=KONTUR)
    iso.banner_r(0.74, 0.3, 80, 40, PETROL)


# —— Antennenmast (turm, 1×1) ——————————————————————————————


def gittermast(iso: Iso, z0: float, z1: float, e: float) -> None:
    p = iso.p
    ecken = [(-e, -e), (e, -e), (e, e), (-e, e)]
    for x, y in ecken:
        iso.linie(p(x, y, z0), p(x * 0.5, y * 0.5, z1), BLECH, 2)
    for z in range(int(z0), int(z1), 20):
        f0, f1 = 1 - 0.5 * (z - z0) / (z1 - z0), 1 - 0.5 * (z + 20 - z0) / (z1 - z0)
        iso.linie(p(-e * f0, e * f0, z), p(e * f1, e * f1, z + 20), hell(BLECH, -20), 1)
        iso.linie(p(e * f0, e * f0, z), p(e * f1, -e * f1, z + 20), hell(BLECH, 10), 1)
        iso.linie(p(-e * f0, e * f0, z), p(e * f0, e * f0, z), hell(BLECH, -20), 1)


def turm1(iso: Iso, fenster: list) -> None:
    """Gittermast mit kleiner Schüssel und einem Lämpchen."""
    schatten(iso, 0.4)
    iso.quader(-0.3, 0.3, -0.3, 0.3, 0, 8, BLECH)
    gittermast(iso, 8, 120, 0.22)
    schuessel(iso, iso.p(0.08, 0.08, 122), 16)
    l = iso.p(0, 0, 128)
    lat = [(l[0] - 3, l[1]), (l[0] + 3, l[1]), (l[0] + 3, l[1] - 6), (l[0] - 3, l[1] - 6)]
    iso.poly(lat, ORANGE, KONTUR)
    fenster.append(lat)


def turm2(iso: Iso, fenster: list) -> None:
    """Hoher Mast, große Schüssel, zwei Stabantennen, Blinklicht, Fahne, Gerätekasten."""
    schatten(iso, 0.48)
    p = iso.p
    iso.quader(-0.4, 0.4, -0.4, 0.4, 0, 30, PANEEL, links=-30, rechts=-8)
    paneele(iso, -0.4, 0.4, -0.4, 0.4, 0, 30, 2, 15)
    fenster.append(iso.fenster_r(0.4, 0.0, 10, b=0.24, h=10, bogen=False))
    gittermast(iso, 30, 214, 0.26)
    schuessel(iso, p(0.12, 0.12, 176), 30, kippen=0.5)
    for dx in (-0.14, 0.14):
        iso.linie(p(dx, 0, 214), p(dx, 0, 250), BLECH, 2)
    l = p(0, 0, 216)
    lat = [(l[0] - 4, l[1]), (l[0] + 4, l[1]), (l[0] + 4, l[1] - 8), (l[0] - 4, l[1] - 8)]
    iso.poly(lat, ORANGE, KONTUR)
    fenster.append(lat)
    iso.fahne(p(-0.14, 0, 250), 0, PETROL_HELL)


# —— Montagehalle, Schleuse, Schutzwand, Landeplatz, Flagge, Kristalle, Satellit ——————


def werkstatt1(iso: Iso, fenster: list) -> None:
    """Montagehalle mit offenem Rolltor, Roboterarm, Kisten und Leuchtband."""
    schatten(iso, 0.95)
    p = iso.p
    x0, x1, y0, y1 = -0.8, 0.7, -0.7, 0.6
    iso.quader(x0, x1, y0, y1, 0, 66, PANEEL, links=-30, rechts=-8)
    paneele(iso, x0, x1, y0, y1, 0, 66, 4, 22)
    tor = [p(-0.55, y1, 0), p(0.25, y1, 0), p(0.25, y1, 48), p(-0.55, y1, 48)]
    iso.poly(tor, (54, 60, 72), KONTUR)
    for z in (42, 46):
        iso.linie(p(-0.55, y1, z), p(0.25, y1, z), hell(PANEEL, -50))
    # Roboterarm in der Halle
    b = p(-0.15, y1, 0)
    iso.linie((b[0], b[1] - 2), (b[0] + 4, b[1] - 24), ORANGE, 4)
    iso.linie((b[0] + 4, b[1] - 24), (b[0] + 18, b[1] - 30), ORANGE, 3)
    for k, (dx, dz) in enumerate(((-0.6, 0), (-0.6, 12), (-0.4, 0))):
        iso.quader(dx, dx + 0.16, y1 + 0.1, y1 + 0.26, dz, dz + 12, hell(ORANGE, -20 + k * 10))
    iso.quader(x0 - 0.02, x1 + 0.02, y0 - 0.02, y1 + 0.02, 66, 72, BLECH)
    leuchtband(iso, x0, x1, y0, y1, 54, fenster)
    fenster.append(iso.fenster_r(x1, -0.05, 24, b=0.3, h=16, bogen=False))


def eingang1(iso: Iso, fenster: list) -> None:
    """Luftschleuse: Rahmen mit Schiebetür, Warnstreifen, Lampe."""
    schatten(iso, 0.45)
    p = iso.p
    iso.quader(-0.44, 0.44, -0.12, 0.12, 0, 82, BLECH, links=-30, rechts=-8)
    tuer = [p(-0.26, 0.12, 6), p(0.26, 0.12, 6), p(0.26, 0.12, 60), p(-0.26, 0.12, 60)]
    iso.poly(tuer, TUER, KONTUR)
    iso.linie(p(0.0, 0.12, 6), p(0.0, 0.12, 60), hell(TUER, 30), 2)
    for k in range(6):
        u = -0.44 + k * 0.16
        iso.poly([p(u, 0.12, 0), p(u + 0.08, 0.12, 0), p(u + 0.12, 0.12, 6), p(u + 0.04, 0.12, 6)], (236, 196, 60))
    l = p(0.0, 0.12, 70)
    lat = [(l[0] - 6, l[1]), (l[0] + 6, l[1]), (l[0] + 6, l[1] - 6), (l[0] - 6, l[1] - 6)]
    iso.poly(lat, LEUCHT, KONTUR)
    fenster.append(lat)


def einfassung1(iso: Iso, fenster: list) -> None:
    """Schutzwand: Paneele auf Stützen mit Leuchtband, an beiden Enden anschlussfähig."""
    iso.quader(-0.5, 0.5, -0.06, 0.06, 0, 46, PANEEL, links=-30, rechts=-8)
    paneele(iso, -0.5, 0.5, -0.06, 0.06, 0, 46, 3, 23)
    leuchtband(iso, -0.5, 0.5, -0.06, 0.06, 36, fenster)
    for x in (-0.5, 0.42):
        iso.quader(x, x + 0.08, -0.1, 0.1, 0, 50, BLECH)


def ursprung1(iso: Iso, fenster: list) -> None:
    """Landeplatz: runde Platte mit Markierung und Lichtern am Rand."""
    p = iso.p
    iso.zylinder(0, 0, 0.44, 0, 6, BLECH, stein=False)
    c = p(0, 0, 6)
    rx, ry = 0.36 * HW * math.sqrt(2), 0.36 * HH * math.sqrt(2)
    iso.d.ellipse([c[0] - rx, c[1] - ry, c[0] + rx, c[1] + ry], outline=(236, 196, 60), width=2)
    iso.linie((c[0] - 10, c[1] - 5), (c[0] - 10, c[1] + 5), (236, 196, 60), 3)
    iso.linie((c[0] + 10, c[1] - 5), (c[0] + 10, c[1] + 5), (236, 196, 60), 3)
    iso.linie((c[0] - 10, c[1]), (c[0] + 10, c[1]), (236, 196, 60), 3)
    for k in range(8):
        a = 2 * math.pi * k / 8
        q = p(0.42 * math.cos(a), 0.42 * math.sin(a), 6)
        l = [(q[0] - 2, q[1] - 2), (q[0] + 2, q[1] - 2), (q[0] + 2, q[1] + 2), (q[0] - 2, q[1] + 2)]
        iso.poly(l, LEUCHT)
        fenster.append(l)


def zeichen1(iso: Iso, fenster: list) -> None:
    """Flagge: Mast mit Petrol-Flagge und Stern auf einem Sockel."""
    schatten(iso, 0.3)
    p = iso.p
    iso.quader(-0.16, 0.16, -0.16, 0.16, 0, 10, BLECH)
    iso.quader(-0.03, 0.03, -0.03, 0.03, 10, 120, PANEEL, links=-30, rechts=-8)
    f = p(0.0, 0.0, 116)
    iso.linie(f, (f[0] + 34, f[1] - 4), BLECH, 2)
    fl = [(f[0] + 1, f[1]), (f[0] + 34, f[1] - 4), (f[0] + 34, f[1] + 20), (f[0] + 1, f[1] + 24)]
    iso.poly(fl, PETROL, KONTUR)
    m = (f[0] + 17, f[1] + 10)
    stern = [(m[0] + (6 if k % 2 == 0 else 2.5) * math.cos(k * math.pi / 5 - math.pi / 2), m[1] + (6 if k % 2 == 0 else 2.5) * math.sin(k * math.pi / 5 - math.pi / 2)) for k in range(10)]
    iso.poly(stern, (244, 222, 140))


def flaeche1(iso: Iso, fenster: list) -> None:
    """Kristallfeld: Felsboden mit Gruppen leuchtender Kristalle."""
    p = iso.p
    iso.quader(-0.92, 0.92, -0.92, 0.92, 0, 6, FELS, hell(FELS, 12), links=-24, rechts=-10)
    farben = [(170, 120, 220), (110, 210, 220), (220, 130, 190)]
    for k, (u, v, h) in enumerate(((-0.55, -0.5, 34), (0.4, -0.55, 26), (-0.1, 0.0, 44), (0.55, 0.35, 30), (-0.6, 0.5, 24), (0.1, 0.65, 20))):
        b = p(u, v, 6)
        f = farben[k % 3]
        for dx, s, hh in ((-6, 5, h * 0.7), (0, 6, h), (7, 4, h * 0.6)):
            pts = [(b[0] + dx - s, b[1]), (b[0] + dx - s * 0.6, b[1] - hh * 0.8), (b[0] + dx, b[1] - hh), (b[0] + dx + s * 0.6, b[1] - hh * 0.8), (b[0] + dx + s, b[1])]
            iso.poly(pts, hell(f, -20), KONTUR)
            iso.poly([pts[2], pts[3], pts[4], (b[0] + dx, b[1])], hell(f, 20))
        if k % 2 == 0:
            fenster.append([(b[0] - 3, b[1] - h * 0.6), (b[0] + 3, b[1] - h * 0.6), (b[0] + 3, b[1] - h * 0.3), (b[0] - 3, b[1] - h * 0.3)])


def denkmal1(iso: Iso, fenster: list) -> None:
    """Satellit in Grau auf einem schlanken Ständer."""
    schatten(iso, 0.36)
    p = iso.p
    grau = (168, 166, 160)
    iso.quader(-0.22, 0.22, -0.22, 0.22, 0, 10, BLECH)
    iso.quader(-0.03, 0.03, -0.03, 0.03, 10, 70, hell(grau, -20))
    iso.quader(-0.12, 0.12, -0.12, 0.12, 70, 100, grau, links=-30, rechts=-8)
    for s in (-1, 1):
        a = p(0.0, 0.0, 85)
        pts = [(a[0] + s * 12, a[1] - 8), (a[0] + s * 44, a[1] - 20), (a[0] + s * 44, a[1] - 4), (a[0] + s * 12, a[1] + 8)]
        iso.poly(pts, hell(grau, -30), KONTUR)
        for t in (0.33, 0.66):
            x = a[0] + s * (12 + 32 * t)
            iso.linie((x, a[1] - 8 - 12 * t), (x, a[1] + 8 - 12 * t), hell(grau, -50))
    schuessel(iso, p(0, 0, 108), 14)


# —— Wesen: Drohne und Roboter ——————————————————————————————


def drohne(zyklus: str, frame: int) -> Image.Image:
    w = Wesen()
    y = 28 + ([0, -1, 0][frame % 3] if zyklus == "idle" else [0, -1.5, 0, 1.5][frame % 4] if zyklus == "walk" else -3 - frame * 3)
    wesen_bodenschatten(w, 9)
    for s in (-1, 1):  # Arme mit Rotoren
        w.strich((32 + s * 5, y), (32 + s * 15, y - 4), BLECH, 1.6)
        b = 6 if frame % 2 == 0 else 3
        w.oval(32 + s * 15 - b, y - 6, 32 + s * 15 + b, y - 3.5, (200, 210, 220, 200), kontur=False)
    w.oval(23, y - 5, 41, y + 7, PANEEL)
    w.oval(26, y - 4, 38, y + 1, hell(PANEEL, 14), kontur=False)
    auge = LEUCHT if zyklus != "react" else ORANGE
    w.oval(29, y + 1, 35, y + 6, (40, 52, 70))
    w.oval(30.5, y + 2.2, 33.5, y + 5, auge, kontur=False)
    w.oval(31, y - 9, 33, y - 5, PETROL_HELL)
    return w.fertig()


def roboter(zyklus: str, frame: int) -> Image.Image:
    w = Wesen()
    bob = [0, -0.6, 0][frame % 3] if zyklus == "idle" else 0.0
    y = bob
    wesen_bodenschatten(w, 10)
    schritt = [(-2, 2), (0, 0), (2, -2), (0, 0)][frame % 4] if zyklus == "walk" else (0, 0)
    for bx, sv in ((27, schritt[0]), (37, schritt[1])):  # Beine mit Füßen
        w.strich((bx, 44 + y), (bx + sv, 52), BLECH, 3)
        w.oval(bx + sv - 4, 51, bx + sv + 4, 55, hell(BLECH, -30))
    w.form([(22, 46 + y), (22, 30 + y), (42, 30 + y), (42, 46 + y)], PANEEL)
    w.form([(32, 30 + y), (42, 30 + y), (42, 46 + y), (32, 46 + y)], hell(PANEEL, -14), kontur=False)
    w.oval(28, 35 + y, 36, 41 + y, PETROL, kontur=True)
    if zyklus == "react":  # winkt
        w.strich((42, 33 + y), (50, 22 + y - frame * 2), BLECH, 2.4)
        w.oval(48, 19 + y - frame * 2, 52, 23 + y - frame * 2, ORANGE)
    else:
        w.strich((42, 33 + y), (46, 42 + y), BLECH, 2.4)
    w.strich((22, 33 + y), (18, 42 + y), BLECH, 2.4)
    w.form([(25, 30 + y), (25, 19 + y), (39, 19 + y), (39, 30 + y)], hell(PANEEL, 6))
    w.form([(27, 22 + y), (37, 22 + y), (37, 27 + y), (27, 27 + y)], (40, 52, 70), kontur=False)
    for ax in (30, 34):
        w.oval(ax - 1.4, 23.5 + y, ax + 1.4, 26 + y, LEUCHT, kontur=False)
    w.strich((32, 19 + y), (32, 14 + y), BLECH, 1)
    w.oval(30.5, 12 + y, 33.5, 15 + y, ORANGE)
    return w.fertig()


WESEN = {"drohne": drohne, "roboter": roboter}


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
    return schreibe_atlas("weltraum", GEBAEUDE, (), WESEN)


if __name__ == "__main__":
    sys.exit(main())
