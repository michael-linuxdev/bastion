#!/usr/bin/env python3
"""G3: Thema `garten`, Epoche 1 (FOKUS.md Paket G, Klärung PV 02.11.2026).

Gleicher Generator wie `sprites-g3-bastion.py` und `sprites-g3-dorf.py`
(gemeinsames Modul `g3_stil.py`, Stil-Regel GRAFIK-SPRITES.md §12).
Eigene Materialleiter (§12.10):
  rohes Holz und Rinde → gehobelte Bretter mit Schindeln → bemaltes Holz mit Glas und Moosdach.

Stufen-Sprache:
  Baumhaus      1 Plattform aus Rundholz im Baum, Strickleiter
                2 Bretterhütte mit Schindeldach auf der Plattform, Leiter, Wimpel
                3 zweite, bemalte Hütte hoch oben mit Glasfenstern und Moosdach,
                  Turm mit Spitzdach, Hängebrücke, Rutsche, Fahne
  Gewächshaus   1 Frühbeet: niedriger Holzrahmen mit Glasdeckel
                2 Glashaus auf Steinsockel, hoch, Glaslaterne auf dem First, Banner
  Aussichtsbaum 1 Baum mit Leiter und kleinem Ausguck
                2 hoher Baum, Ausguck mit Dach und Geländer, Fernrohr, Wimpel

Aufruf: python3 tools/grafik/sprites-g3-garten.py
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
    ERDE,
    FENSTER_TAG,
    GRAU,
    GRUEN,
    HH,
    HOLZ,
    HOLZ_FUGE,
    HW,
    KONTUR,
    PETROL,
    PETROL_HELL,
    SCHINDEL,
    SOCKEL,
    STEIN,
    Iso,
    Wesen,
    hell,
    krone,
    schatten,
    schreibe_atlas,
    wesen_bodenschatten,
)

# Materialleiter Garten (§12.10)
RINDE = (110, 84, 60)
RUNDHOLZ = (160, 120, 80)
BRETT = (178, 138, 92)
BEMALT = (126, 168, 140)  # salbeigrün gestrichenes Holz
RAHMEN = (244, 239, 228)  # weiß gestrichene Rahmen
GLAS = (190, 226, 232)
MOOS = (112, 150, 74)
SEIL = (196, 170, 120)
TUER = (70, 46, 28)
GELB = (244, 222, 140)
BLUETEN = [(214, 92, 120), (236, 200, 90), (150, 120, 210), (240, 240, 236), (226, 120, 70)]


def stamm(iso: Iso, r: float, z0: float, z1: float) -> None:
    iso.zylinder(0.0, 0.0, r, z0, z1, RINDE, stein=False)
    cx, cy = iso.p(0, 0, 0)
    rx = r * HW * math.sqrt(2)
    for k, dx in enumerate((-0.5, -0.1, 0.35)):  # Rindenfurchen
        x = cx + dx * rx
        iso.linie((x, cy - z0 - 6 - k * 3), (x + 2, cy - z1 + 10), hell(RINDE, -30))


def plattform(iso: Iso, e: float, z: float, holz=RUNDHOLZ, *, gelaender=True) -> None:
    iso.quader(-e, e, -e, e, z - 8, z, holz)
    p = iso.p
    for k in range(1, 6):  # Rundhölzer
        u = -e + 2 * e * k / 6
        iso.linie(p(u, e, z), p(u, -e, z), hell(holz, -24))
    for u in (-e, 0.0, e):  # Stützstreben zum Stamm
        iso.linie(p(u, e, z - 8), p(0, 0.2, z - 46), hell(holz, -30), 3)
    if gelaender:
        for u in (-e, -e / 3, e / 3, e):
            iso.linie(p(u, e, z), p(u, e, z + 18), BALKEN, 2)
            iso.linie(p(e, u, z), p(e, u, z + 18), BALKEN, 2)
        iso.linie(p(-e, e, z + 18), p(e, e, z + 18), BALKEN, 2)
        iso.linie(p(e, e, z + 18), p(e, -e, z + 18), hell(BALKEN, 14), 2)


def strickleiter(iso: Iso, x, y, z0, z1) -> None:
    p = iso.p
    iso.linie(p(x - 0.08, y, z0), p(x - 0.08, y, z1), SEIL, 2)
    iso.linie(p(x + 0.08, y, z0), p(x + 0.08, y, z1), SEIL, 2)
    for z in range(int(z0) + 8, int(z1), 10):
        iso.linie(p(x - 0.08, y, z), p(x + 0.08, y, z), hell(RUNDHOLZ, -10), 2)


def wimpel(iso: Iso, fuss, hoehe: float, farben=(PETROL, PETROL_HELL)) -> None:
    x, y = fuss
    iso.linie((x, y), (x, y - hoehe), (244, 239, 228), 2)
    iso.poly([(x + 1, y - hoehe), (x + 24, y - hoehe + 6), (x + 1, y - hoehe + 13)], farben[1], KONTUR)


def glasflaeche_l(iso: Iso, x0, x1, y, z0, z1, n: int, fenster: list | None = None) -> None:
    """Glasfläche auf der linken Seite mit weißen Sprossen."""
    p = iso.p
    iso.poly([p(x0, y, z0), p(x1, y, z0), p(x1, y, z1), p(x0, y, z1)], hell(GLAS, -26), KONTUR)
    for k in range(1, n):
        u = x0 + (x1 - x0) * k / n
        iso.linie(p(u, y, z0), p(u, y, z1), RAHMEN, 2)
    iso.linie(p(x0, y, (z0 + z1) / 2), p(x1, y, (z0 + z1) / 2), RAHMEN, 2)
    if fenster is not None:
        fenster.append([p(x0, y, z0), p(x1, y, z0), p(x1, y, z1), p(x0, y, z1)])


def glasflaeche_r(iso: Iso, x, y0, y1, z0, z1, n: int, fenster: list | None = None) -> None:
    p = iso.p
    iso.poly([p(x, y1, z0), p(x, y0, z0), p(x, y0, z1), p(x, y1, z1)], hell(GLAS, -6), KONTUR)
    for k in range(1, n):
        v = y1 + (y0 - y1) * k / n
        iso.linie(p(x, v, z0), p(x, v, z1), RAHMEN, 2)
    iso.linie(p(x, y1, (z0 + z1) / 2), p(x, y0, (z0 + z1) / 2), RAHMEN, 2)
    if fenster is not None:
        fenster.append([p(x, y1, z0), p(x, y0, z0), p(x, y0, z1), p(x, y1, z1)])


def huette(iso: Iso, fenster, x0, x1, y0, y1, z, h, wand, dach, *, glas=False) -> tuple[float, float]:
    iso.quader(x0, x1, y0, y1, z, z + h, wand, links=-34, rechts=-10)
    iso.textur_holz(x0, x1, y0, y1, z, z + h, 5)
    xm, ym = (x0 + x1) / 2, (y0 + y1) / 2
    iso.fenster_l(xm - (x1 - x0) * 0.2, y1, z, b=0.2, h=min(h - 6, 30), farbe=TUER, bogen=False)
    if glas:
        glasflaeche_r(iso, x1, ym - 0.18, ym + 0.18, z + 10, z + h - 8, 2, fenster)
        glasflaeche_l(iso, xm + 0.05, xm + 0.3, y1, z + 12, z + h - 8, 1, fenster)
    else:
        fenster.append(iso.fenster_r(x1, ym, z + h * 0.4, b=0.18, h=16, bogen=False))
    return iso.satteldach(x0, x1, y0, y1, z + h, h * 0.6, dach, wand, ueber=0.08)


# —— Baumhaus (kern, 3×3) ——————————————————————————————


def kern1(iso: Iso, fenster: list) -> None:
    """Baum mit Plattform aus Rundholz und Strickleiter."""
    schatten(iso, 0.9)
    stamm(iso, 0.22, 0, 150)
    m = iso.p(0, 0, 176)
    krone(iso, m[0] - 6, m[1], 52)
    plattform(iso, 0.62, 82)
    strickleiter(iso, 0.1, 0.62, 0, 74)
    # Laterne an der Plattform (leuchtet abends)
    m = iso.p(0.62, -0.3, 100)
    iso.linie(m, (m[0], m[1] - 10), BALKEN, 2)
    lat = [(m[0] - 4, m[1]), (m[0] + 4, m[1]), (m[0] + 4, m[1] + 10), (m[0] - 4, m[1] + 10)]
    iso.poly(lat, (230, 180, 80), KONTUR)
    fenster.append(lat)


def kern2(iso: Iso, fenster: list) -> None:
    """Bretterhütte mit Schindeldach auf der Plattform, Leiter, Wimpel."""
    schatten(iso, 1.1)
    stamm(iso, 0.26, 0, 200)
    m = iso.p(0, 0, 220)
    krone(iso, m[0] - 10, m[1] + 6, 62)
    plattform(iso, 0.82, 96, BRETT)
    first = huette(iso, fenster, -0.62, 0.42, -0.6, 0.42, 96, 62, BRETT, SCHINDEL)
    wimpel(iso, first, 34)
    # Leiter vorne
    p = iso.p
    for x in (0.18, 0.4):
        iso.linie(p(x, 0.9, 0), p(x, 0.82, 90), BALKEN, 3)
    for z in range(10, 90, 12):
        iso.linie(p(0.18, 0.88, z), p(0.4, 0.88, z), hell(BRETT, -20), 2)
    # Blumenkasten an der Hütte
    iso.quader(-0.5, -0.1, 0.42, 0.5, 116, 124, hell(BRETT, -20))
    for k in range(4):
        a = p(-0.45 + k * 0.1, 0.48, 126)
        iso.d.ellipse([a[0] - 3, a[1] - 3, a[0] + 3, a[1] + 3], fill=BLUETEN[k % 5])


def kern3(iso: Iso, fenster: list) -> None:
    """Zweite bemalte Hütte hoch in der Krone mit Glas und Moosdach, Turm mit Spitzdach,
    Hängebrücke zu einem Ausguck, Rutsche, Fahne."""
    schatten(iso, 1.42)
    p = iso.p
    # kleiner Nebenbaum hinten rechts mit Ausguck
    iso.zylinder(1.0, -1.0, 0.12, 0, 120, RINDE, stein=False)
    mk = p(1.0, -1.0, 150)
    krone(iso, mk[0], mk[1], 30)
    iso.quader(0.75, 1.25, -1.25, -0.75, 104, 110, BRETT)
    # Hauptstamm und große Krone
    stamm(iso, 0.3, 0, 250)
    m = iso.p(0, 0, 266)
    krone(iso, m[0] - 12, m[1] + 6, 74)
    # Hängebrücke zum Nebenbaum
    a, b = p(0.5, -0.5, 104), p(0.8, -0.85, 110)
    iso.linie(a, b, hell(BRETT, -10), 4)
    iso.linie((a[0], a[1] - 14), (b[0], b[1] - 14), SEIL, 1)
    # untere Ebene: Plattform und Bretterhütte
    plattform(iso, 0.9, 104, BRETT)
    huette(iso, fenster, -0.76, 0.2, -0.7, 0.3, 104, 56, BRETT, SCHINDEL)
    # Rutsche vorne links
    iso.poly([p(-0.4, 0.9, 104), p(-0.2, 0.9, 104), p(-0.2, 1.5, 0), p(-0.4, 1.5, 0)], (214, 92, 70), KONTUR)
    iso.linie(p(-0.4, 0.9, 110), p(-0.4, 1.5, 6), hell((214, 92, 70), -40), 2)
    # obere Ebene: bemalte Hütte mit Glas und Moosdach
    plattform(iso, 0.6, 196, RUNDHOLZ, gelaender=False)
    first = huette(iso, fenster, -0.44, 0.44, -0.44, 0.44, 196, 56, BEMALT, MOOS, glas=True)
    # Türmchen mit Spitzdach auf dem First
    iso.quader(0.0, 0.26, -0.13, 0.13, 270, 300, BEMALT, links=-30, rechts=-8)
    fenster.append(iso.fenster_r(0.26, 0.0, 280, b=0.1, h=12, bogen=False))
    spitze = iso.pyramide(0.0, 0.26, -0.13, 0.13, 300, 46, (196, 96, 58), ueber=0.05)
    iso.fahne(spitze, 34, PETROL_HELL)
    iso.banner_r(0.44, 0.24, 244, 36, PETROL)
    # Laub vorn, damit die Hütten im Baum sitzen
    for dx, dz, r in ((-70, 150, 18), (66, 176, 16)):
        c = iso.p(0, 0, dz)
        krone(iso, c[0] + dx, c[1], r)


# —— Gewächshaus (wissen, 2×2) ——————————————————————————————


def wissen1(iso: Iso, fenster: list) -> None:
    """Frühbeet: niedriger Holzrahmen mit schrägem Glasdeckel, Pflanzen darin."""
    schatten(iso, 0.9)
    p = iso.p
    x0, x1, y0, y1 = -0.74, 0.74, -0.56, 0.56
    iso.quader(x0, x1, y0, y1, 0, 22, RUNDHOLZ, ERDE, links=-40, rechts=-10)
    iso.textur_holz(x0, x1, y0, y1, 0, 22, 6)
    for k in range(5):
        a = p(-0.55 + k * 0.27, 0.0, 22)
        iso.d.ellipse([a[0] - 8, a[1] - 10, a[0] + 8, a[1] + 2], fill=hell(GRUEN, (k % 2) * 14), outline=KONTUR)
    # Rückwand hoch, Glasdeckel schräg nach vorne
    iso.quader(x0, x1, y0, y0 + 0.08, 22, 52, RUNDHOLZ)
    glas = [p(x0, y0 + 0.08, 52), p(x1, y0 + 0.08, 52), p(x1, y1, 24), p(x0, y1, 24)]
    iso.poly(glas, GLAS + (190,), KONTUR)
    for k in range(1, 4):
        u = x0 + (x1 - x0) * k / 4
        iso.linie(p(u, y0 + 0.08, 52), p(u, y1, 24), RAHMEN, 2)
    iso.poly([p(x1, y0, 22), p(x1, y1, 22), p(x1, y1, 24), p(x1, y0 + 0.08, 52)], hell(RUNDHOLZ, -10), KONTUR)
    fenster.append([p(-0.3, 0.0, 30), p(0.3, 0.0, 30), p(0.3, 0.0, 40), p(-0.3, 0.0, 40)])


def wissen2(iso: Iso, fenster: list) -> None:
    """Glashaus auf Steinsockel, hohes Satteldach aus Glas, Glaslaterne auf dem First, Banner."""
    schatten(iso, 1.0)
    p = iso.p
    x0, x1, y0, y1 = -0.86, 0.86, -0.7, 0.7
    iso.quader(x0, x1, y0, y1, 0, 20, STEIN)
    iso.textur_stein(x0, x1, y0, y1, 0, 20, 10)
    # Pflanzen hinter Glas (zuerst, dann Glas darüber)
    glasflaeche_l(iso, x0, x1, y1, 20, 110, 6)
    glasflaeche_r(iso, x1, y0, y1, 20, 110, 5)
    for k in range(5):
        a = p(-0.7 + k * 0.32, y1, 34)
        iso.d.ellipse([a[0] - 9, a[1] - 18, a[0] + 9, a[1]], fill=hell(GRUEN, 10 + (k % 2) * 12))
        iso.d.ellipse([a[0] - 2, a[1] - 18, a[0] + 3, a[1] - 13], fill=BLUETEN[k % 5])
    iso.fenster_l(-0.5, y1, 20, b=0.26, h=56, farbe=hell(GLAS, -50), bogen=False)
    fenster.append([p(-0.2, y1, 40), p(0.6, y1, 40), p(0.6, y1, 100), p(-0.2, y1, 100)])
    fenster.append([p(x1, 0.4, 40), p(x1, -0.4, 40), p(x1, -0.4, 100), p(x1, 0.4, 100)])
    # Glasdach
    ym = 0.0
    iso.poly([p(x0, ym, 176), p(x1, ym, 176), p(x1, y0 - 0.06, 108), p(x0, y0 - 0.06, 108)], hell(GLAS, 10), KONTUR)
    iso.poly([p(x1, y1, 110), p(x1, y0, 110), p(x1, ym, 176)], hell(GLAS, -4), KONTUR)
    vorne = [p(x0 - 0.06, y1 + 0.06, 108), p(x1 + 0.06, y1 + 0.06, 108), p(x1 + 0.06, ym, 176), p(x0 - 0.06, ym, 176)]
    iso.poly(vorne, hell(GLAS, -18), KONTUR)
    for k in range(1, 7):
        u = x0 + (x1 - x0) * k / 7
        iso.linie(p(u, y1 + 0.06, 108), p(u, ym, 176), RAHMEN, 2)
    iso.linie(p(x0, ym, 176), p(x1, ym, 176), RAHMEN, 3)
    # Glaslaterne mit Spitze
    iso.quader(-0.2, 0.2, -0.16, 0.16, 172, 206, hell(GLAS, -10), links=-20, rechts=-6)
    for u in (-0.2, 0.0, 0.2):
        iso.linie(p(u, 0.16, 172), p(u, 0.16, 206), RAHMEN, 2)
    fenster.append([p(-0.2, 0.16, 176), p(0.2, 0.16, 176), p(0.2, 0.16, 202), p(-0.2, 0.16, 202)])
    spitze = iso.pyramide(-0.2, 0.2, -0.16, 0.16, 206, 34, BEMALT, ueber=0.04)
    wimpel(iso, spitze, 22)
    iso.banner_r(x1, 0.2, 104, 40, PETROL)


# —— Aussichtsbaum (turm, 1×1) ——————————————————————————————


def turm1(iso: Iso, fenster: list) -> None:
    """Schlanker Baum mit Leiter und kleinem Ausguck."""
    schatten(iso, 0.45)
    iso.zylinder(0.0, 0.0, 0.14, 0, 132, RINDE, stein=False)
    m = iso.p(0, 0, 150)
    krone(iso, m[0], m[1], 30)
    plattform(iso, 0.36, 92, RUNDHOLZ)
    p = iso.p
    for x in (-0.08, 0.1):
        iso.linie(p(x, 0.4, 0), p(x, 0.36, 86), BALKEN, 2)
    for z in range(8, 86, 11):
        iso.linie(p(-0.08, 0.39, z), p(0.1, 0.39, z), hell(RUNDHOLZ, -10), 2)


def turm2(iso: Iso, fenster: list) -> None:
    """Hoher Baum, Ausguck mit Schindel-Spitzdach, Geländer, Fernrohr und Wimpel."""
    schatten(iso, 0.5)
    iso.zylinder(0.0, 0.0, 0.17, 0, 196, RINDE, stein=False)
    m = iso.p(0, 0, 196)
    krone(iso, m[0] - 4, m[1], 44)
    plattform(iso, 0.44, 176, BRETT)
    p = iso.p
    for (x, y) in ((-0.4, 0.4), (0.4, 0.4), (0.4, -0.4)):
        iso.quader(x - 0.03, x + 0.03, y - 0.03, y + 0.03, 176, 214, BRETT)
    f = p(0.3, 0.3, 196)  # Fernrohr
    iso.linie(f, (f[0] + 16, f[1] - 8), (170, 140, 80), 4)
    lat = p(-0.1, 0.1, 176)
    lat = [(lat[0] - 4, lat[1]), (lat[0] + 4, lat[1]), (lat[0] + 4, lat[1] - 10), (lat[0] - 4, lat[1] - 10)]
    iso.poly(lat, (230, 180, 80), KONTUR)
    fenster.append(lat)
    spitze = iso.pyramide(-0.44, 0.44, -0.44, 0.44, 214, 44, SCHINDEL, ueber=0.06)
    wimpel(iso, spitze, 24)
    # Leiter
    for x in (-0.08, 0.1):
        iso.linie(p(x, 0.48, 0), p(x, 0.44, 170), BALKEN, 2)
    for z in range(8, 170, 12):
        iso.linie(p(-0.08, 0.47, z), p(0.1, 0.47, z), hell(BRETT, -14), 2)


# —— Schuppen, Tor, Hecke, Bank, Wimpel, Beet, Zwerg ——————————————


def werkstatt1(iso: Iso, fenster: list) -> None:
    """Geräteschuppen aus Brettern, offene Tür, Schubkarre, Gießkanne, Werkzeug."""
    schatten(iso, 0.95)
    p = iso.p
    x0, x1, y0, y1 = -0.7, 0.5, -0.6, 0.5
    iso.quader(x0, x1, y0, y1, 0, 70, BRETT, links=-36, rechts=-10)
    iso.textur_holz(x0, x1, y0, y1, 0, 70, 7)
    iso.fenster_l(-0.3, y1, 0, b=0.36, h=50, farbe=TUER, bogen=False)
    # Werkzeug an der Wand (Rechen, Spaten)
    for u, kopf in ((0.1, "r"), (0.3, "s")):
        iso.linie(p(u, y1 + 0.01, 8), p(u, y1 + 0.01, 60), BALKEN, 2)
        k = p(u, y1 + 0.01, 60)
        if kopf == "r":
            iso.linie((k[0] - 6, k[1]), (k[0] + 6, k[1]), GRAU, 2)
        else:
            iso.poly([(k[0] - 4, k[1] - 22), (k[0] + 4, k[1] - 22), (k[0] + 4, k[1] - 12), (k[0], k[1] - 8), (k[0] - 4, k[1] - 12)], GRAU, KONTUR)
    fenster.append(iso.fenster_r(x1, -0.05, 30, b=0.24, h=18, bogen=False))
    iso.satteldach(x0, x1, y0, y1, 70, 40, SCHINDEL, BRETT, ueber=0.1)
    # Schubkarre vorne rechts
    iso.quader(0.6, 0.86, 0.4, 0.7, 8, 22, (200, 110, 60))
    rad = p(0.88, 0.55, 6)
    iso.d.ellipse([rad[0] - 6, rad[1] - 6, rad[0] + 6, rad[1] + 6], fill=(60, 50, 44), outline=KONTUR)
    iso.linie(p(0.6, 0.45, 18), p(0.35, 0.5, 26), BALKEN, 2)
    # Gießkanne vorne links
    g = p(-0.6, 0.75, 0)
    iso.poly([(g[0] - 7, g[1]), (g[0] + 7, g[1]), (g[0] + 6, g[1] - 14), (g[0] - 6, g[1] - 14)], PETROL_HELL, KONTUR)
    iso.linie((g[0] + 6, g[1] - 6), (g[0] + 14, g[1] - 16), PETROL_HELL, 2)


def eingang1(iso: Iso, fenster: list) -> None:
    """Rosenbogen über einem kleinen Lattentor."""
    schatten(iso, 0.45)
    p = iso.p
    for x in (-0.42, 0.42):
        iso.quader(x - 0.04, x + 0.04, -0.04, 0.04, 0, 78, RAHMEN, links=-24, rechts=-8)
    # Bogen
    pts = [p(-0.42 + 0.84 * t, 0.0, 78 + 22 * math.sin(math.pi * t)) for t in [k / 12 for k in range(13)]]
    for a, b in zip(pts, pts[1:]):
        iso.linie(a, b, RAHMEN, 4)
    # Laub und Rosen am Bogen
    for k, (x, y) in enumerate(pts[::2]):
        iso.d.ellipse([x - 7, y - 6, x + 7, y + 6], fill=hell(GRUEN, (k % 2) * 12 - 8))
        iso.d.ellipse([x - 2, y - 3, x + 3, y + 2], fill=BLUETEN[0])
    for x in (-0.42, 0.42):
        for z in (20, 46):
            a = p(x, 0.04, z)
            iso.d.ellipse([a[0] - 6, a[1] - 6, a[0] + 6, a[1] + 6], fill=hell(GRUEN, -6))
            iso.d.ellipse([a[0] - 2, a[1] - 2, a[0] + 2, a[1] + 2], fill=BLUETEN[0])
    # Lattentor
    for k in range(6):
        u = -0.34 + k * 0.136
        iso.quader(u, u + 0.08, 0.0, 0.03, 0, 36, RAHMEN, links=-20, rechts=-6)
    iso.linie(p(-0.36, 0.03, 12), p(0.36, 0.03, 12), hell(RAHMEN, -40), 2)
    iso.linie(p(-0.36, 0.03, 28), p(0.36, 0.03, 28), hell(RAHMEN, -40), 2)


def einfassung1(iso: Iso, fenster: list) -> None:
    """Hecke: geschnittener Block aus Laub, an beiden Enden anschlussfähig."""
    p = iso.p
    iso.quader(-0.5, 0.5, -0.16, 0.16, 0, 40, GRUEN, hell(GRUEN, 18), links=-30, rechts=-12)
    for k in range(12):  # Blätterstruktur, feste Muster
        u = -0.45 + (k * 0.37 % 1) * 0.9
        z = 6 + (k * 0.61 % 1) * 30
        a = p(u, 0.16, z)
        iso.d.ellipse([a[0] - 3, a[1] - 2, a[0] + 3, a[1] + 2], fill=hell(GRUEN, -24))
        b = p(0.5, -0.12 + (k * 0.29 % 1) * 0.24, z)
        iso.d.ellipse([b[0] - 2, b[1] - 2, b[0] + 2, b[1] + 2], fill=hell(GRUEN, -4))
    for k in range(5):
        a = p(-0.4 + k * 0.2, 0.0, 40)
        iso.d.ellipse([a[0] - 4, a[1] - 2, a[0] + 4, a[1] + 2], fill=hell(GRUEN, 30))


def ursprung1(iso: Iso, fenster: list) -> None:
    """Gartenbank aus Holz mit Lehne, daneben ein Blumentopf."""
    schatten(iso, 0.4)
    p = iso.p
    for x in (-0.32, 0.32):
        iso.quader(x - 0.03, x + 0.03, -0.1, 0.1, 0, 18, BALKEN)
    iso.quader(-0.38, 0.38, -0.12, 0.12, 18, 22, BRETT)
    for k in range(1, 3):
        y = -0.12 + 0.24 * k / 3
        iso.linie(p(-0.38, y, 22), p(0.38, y, 22), hell(BRETT, -30))
    for x in (-0.32, 0.32):
        iso.quader(x - 0.03, x + 0.03, -0.14, -0.1, 22, 46, BALKEN)
    iso.quader(-0.38, 0.38, -0.15, -0.11, 34, 44, BRETT)
    t = p(0.4, 0.34, 0)
    iso.poly([(t[0] - 6, t[1]), (t[0] + 6, t[1]), (t[0] + 8, t[1] - 12), (t[0] - 8, t[1] - 12)], (196, 110, 70), KONTUR)
    iso.d.ellipse([t[0] - 8, t[1] - 22, t[0] + 8, t[1] - 10], fill=GRUEN, outline=KONTUR)
    iso.d.ellipse([t[0] - 2, t[1] - 22, t[0] + 3, t[1] - 17], fill=BLUETEN[1])


def zeichen1(iso: Iso, fenster: list) -> None:
    """Wimpel: Stange mit einer Kette kleiner Wimpel zu einem Pfosten."""
    schatten(iso, 0.3)
    p = iso.p
    iso.quader(-0.04, 0.04, -0.04, 0.04, 0, 120, RAHMEN, links=-24, rechts=-8)
    iso.quader(0.33, 0.39, -0.39, -0.33, 0, 56, RAHMEN, links=-24, rechts=-8)
    a, b = p(0.0, 0.0, 116), p(0.36, -0.36, 54)
    pts = [(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + 10 * math.sin(math.pi * t)) for t in [k / 8 for k in range(9)]]
    for q, r in zip(pts, pts[1:]):
        iso.linie(q, r, SEIL, 1)
    for k, (x, y) in enumerate(pts[1:-1]):
        iso.poly([(x - 4, y), (x + 4, y), (x, y + 10)], [PETROL, PETROL_HELL][k % 2], KONTUR)
    wimpel(iso, p(0.0, 0.0, 120), 0)


def flaeche1(iso: Iso, fenster: list) -> None:
    """Blumenbeet: gewölbte Erde mit Steinrand, Blumen in Bändern, eine Sonnenblume."""
    p = iso.p
    iso.quader(-0.9, 0.9, -0.9, 0.9, 0, 8, SOCKEL, ERDE, links=-30, rechts=-10)
    for k in range(9):  # Steine im Rand
        u = -0.85 + k * 0.21
        a = p(u, 0.9, 6)
        iso.d.ellipse([a[0] - 5, a[1] - 3, a[0] + 5, a[1] + 3], fill=hell(SOCKEL, 10 - (k % 2) * 14))
    for r, v in enumerate((-0.6, -0.25, 0.1, 0.45)):
        for k in range(6):
            u = -0.7 + k * 0.28
            a = p(u, v, 8)
            iso.d.ellipse([a[0] - 7, a[1] - 9, a[0] + 7, a[1] + 2], fill=hell(GRUEN, (k % 2) * 12 - 8), outline=KONTUR)
            iso.d.ellipse([a[0] - 3, a[1] - 9, a[0] + 3, a[1] - 3], fill=BLUETEN[(r + k // 2) % 5])
    s = p(0.55, -0.55, 8)
    iso.linie(s, (s[0], s[1] - 46), (90, 130, 60), 3)
    iso.d.ellipse([s[0] - 10, s[1] - 58, s[0] + 10, s[1] - 38], fill=(240, 196, 60), outline=KONTUR)
    iso.d.ellipse([s[0] - 4, s[1] - 52, s[0] + 4, s[1] - 44], fill=(120, 80, 40))


def denkmal1(iso: Iso, fenster: list) -> None:
    """Gartenzwerg aus Ton auf einem Steinsockel."""
    schatten(iso, 0.36)
    p = iso.p
    iso.zylinder(0.0, 0.0, 0.24, 0, 16, STEIN)
    ton, rot, bart, haut = (176, 120, 86), (196, 80, 60), (236, 230, 220), (230, 196, 164)
    b = p(0.0, 0.0, 16)
    iso.poly([(b[0] - 11, b[1]), (b[0] + 11, b[1]), (b[0] + 8, b[1] - 24), (b[0] - 8, b[1] - 24)], ton, KONTUR)
    iso.poly([(b[0] - 7, b[1] - 24), (b[0] + 7, b[1] - 24), (b[0] + 5, b[1] - 14), (b[0], b[1] - 8), (b[0] - 5, b[1] - 14)], bart, KONTUR)
    iso.d.ellipse([b[0] - 7, b[1] - 36, b[0] + 7, b[1] - 22], fill=haut, outline=KONTUR)
    iso.poly([(b[0] - 9, b[1] - 32), (b[0] + 9, b[1] - 32), (b[0] + 2, b[1] - 60)], rot, KONTUR)
    iso.d.ellipse([b[0] + 3, b[1] - 30, b[0] + 6, b[1] - 27], fill=(200, 120, 110))
    iso.linie((b[0] + 9, b[1] - 18), (b[0] + 16, b[1] - 4), BALKEN, 2)  # Schäufelchen


# —— Umgebung: Sträucher an den festen Plätzen der Garten-Szene ——————————


def strauch_a(iso: Iso, fenster: list) -> None:
    schatten(iso, 0.36)
    m = iso.p(0, 0, 16)
    krone(iso, m[0], m[1], 17)


def strauch_b(iso: Iso, fenster: list) -> None:
    """Blühender Strauch."""
    strauch_a(iso, fenster)
    m = iso.p(0, 0, 16)
    for k, (dx, dy) in enumerate(((-8, 2), (5, -7), (9, 5), (-2, -12), (0, 8))):
        iso.d.ellipse([m[0] + dx - 2.5, m[1] + dy - 2.5, m[0] + dx + 2.5, m[1] + dy + 2.5], fill=BLUETEN[k % 3])


UMGEBUNG = [("strauch_a", strauch_a), ("strauch_b", strauch_b)]


# —— Wesen: Biene, Schnecke, Schmetterling ——————————————————————


def biene(zyklus: str, frame: int) -> Image.Image:
    w = Wesen()
    gelb, schwarz, fluegel = (240, 196, 60), (50, 42, 36), (230, 240, 248, 200)
    schweb = [0, -1.5, 0, 1.5][frame % 4] if zyklus == "walk" else [0, -1, 0][frame % 3] if zyklus == "idle" else -frame * 3
    y = 30 + schweb
    wesen_bodenschatten(w, 5)
    auf = (frame % 2 == 0)
    w.oval(24 if auf else 26, y - 12, 34, y - 2, fluegel)
    w.oval(30, y - 13 if auf else y - 10, 40, y - 3, fluegel)
    w.oval(20, y - 4, 40, y + 8, gelb)
    for sx in (26, 31):
        w.strich((sx, y - 3), (sx, y + 7), schwarz, 2.2)
    w.oval(38, y - 3, 46, y + 5, schwarz)
    w.oval(41.5, y - 1.5, 43.5, y + 0.5, (240, 240, 236), kontur=False)
    w.form([(20, y + 2), (16, y + 2.5), (20, y + 4)], schwarz)
    if zyklus == "react":
        for k in range(3):
            w.oval(10 + k * 4, y - 14 - k * 2, 12 + k * 4, y - 12 - k * 2, gelb, kontur=False)
    return w.fertig()


def schnecke(zyklus: str, frame: int) -> Image.Image:
    w = Wesen()
    haus, haus_d, koerper = (196, 140, 84), (140, 92, 54), (176, 170, 130)
    streck = [0, 1.5, 3, 1.5][frame % 4] if zyklus == "walk" else 0
    wesen_bodenschatten(w, 12)
    rein = zyklus == "react"
    if not rein:
        w.form([(16, 54), (20, 49), (40 + streck, 49), (46 + streck, 53), (42 + streck, 55), (18, 55)], koerper)
        kx = 42 + streck
        w.strich((kx, 50), (kx + 2, 40), koerper, 1.6)
        w.strich((kx + 3, 50), (kx + 6, 41), koerper, 1.6)
        w.oval(kx + 1, 38.5, kx + 3.5, 41, (50, 42, 36), kontur=False)
        w.oval(kx + 5, 39.5, kx + 7.5, 42, (50, 42, 36), kontur=False)
    else:
        w.form([(18, 54), (22, 50), (36, 50), (40, 54)], koerper)
    w.oval(16, 32 + frame * (1 if rein else 0), 38, 54, haus)
    w.oval(21, 37, 34, 50, hell(haus, 20), kontur=False)
    w.d.arc([22 * 4, 39 * 4, 32 * 4, 49 * 4], 90, 400, fill=haus_d, width=6)
    w.oval(25.5, 42.5, 29, 46, haus_d, kontur=False)
    return w.fertig()


def schmetterling(zyklus: str, frame: int) -> Image.Image:
    w = Wesen()
    o, o_h, koerper = (226, 120, 70), (244, 196, 120), (50, 42, 36)
    schweb = [0, -2, 0, 2][frame % 4] if zyklus == "walk" else [0, -1, 0][frame % 3] if zyklus == "idle" else -4 - frame * 3
    y = 30 + schweb
    wesen_bodenschatten(w, 5)
    offen = frame % 2 == 0 or zyklus == "react"
    breit = 11 if offen else 5
    for s in (-1, 1):
        w.form([(32, y), (32 + s * breit, y - 12), (32 + s * (breit + 3), y - 4), (32 + s * 3, y + 1)], o)
        w.form([(32, y + 1), (32 + s * breit * 0.8, y + 10), (32 + s * 2, y + 6)], hell(o, -20))
        if offen:
            w.oval(32 + s * 7 - 2, y - 8, 32 + s * 7 + 2, y - 4, o_h, kontur=False)
    w.oval(30.8, y - 6, 33.2, y + 8, koerper, kontur=False)
    w.strich((32, y - 6), (29, y - 12), koerper, 0.8)
    w.strich((32, y - 6), (35, y - 12), koerper, 0.8)
    return w.fertig()


WESEN = {"biene": biene, "schnecke": schnecke, "schmetterling": schmetterling}


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
    return schreibe_atlas("garten", GEBAEUDE, UMGEBUNG, WESEN)


if __name__ == "__main__":
    sys.exit(main())
