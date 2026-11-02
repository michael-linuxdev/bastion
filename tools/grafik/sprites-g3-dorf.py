#!/usr/bin/env python3
"""G3: Gebäude Thema `dorf`, Epoche 1 (FOKUS.md Paket G, Klärung PV 02.11.2026).

Gleicher Generator wie `sprites-g3-bastion.py` (gemeinsames Modul `g3_stil.py`,
Stil-Regel GRAFIK-SPRITES.md §12). Eigene Materialleiter (§12.10):
  Lehm mit Strohdach → Fachwerk mit Ziegeldach → Bruchstein mit Schieferdach.

Stufen-Sprache:
  Gemeindehaus  1 Lehmhaus mit Strohdach
                2 Fachwerkhaus, zwei Geschosse, Ziegeldach, Anbau, Schornstein, Banner
                3 Rathaus aus Bruchstein, Schieferdach, Uhrturm mit Helm, Seitenflügel, Fahne
  Bücherei      1 Lehmhäuschen mit Strohdach   2 Fachwerk über Steinsockel, Erker, Schild
  Windmühle     1 Bockwindmühle aus Holz       2 Turmholländer aus Stein mit Galerie

Aufruf: python3 tools/grafik/sprites-g3-dorf.py
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
    PUTZ,
    SCHINDEL,
    SOCKEL,
    STEIN,
    STEIN_FUGE,
    ZIEGEL,
    Iso,
    Wesen,
    hell,
    wesen_bodenschatten,
    krone,
    schatten,
    schreibe_atlas,
)

# Materialleiter Dorf (§12.10)
LEHM = (206, 178, 132)
LEHM_FLECK = (184, 154, 108)
STROH = (208, 172, 88)
STROH_FUGE = (160, 124, 52)
SCHIEFER = (96, 104, 118)
WASSER = (98, 160, 196)
TUER = (70, 46, 28)
GELB = (244, 222, 140)
LATTE = (204, 184, 150)  # verwittertes, helles Holz (Zaun)


def textur_lehm(iso: Iso, x0, x1, y0, y1, z0, z1) -> None:
    """Lehmputz: wenige feste Flecken statt Fugen (feste Muster, kein Zufall)."""
    p = iso.p
    for k in range(7):
        u = (k * 0.37 + 0.11) % 1
        z = z0 + (z1 - z0) * ((k * 0.53 + 0.2) % 0.8 + 0.1)
        a = p(x0 + (x1 - x0) * u, y1, z)
        iso.d.ellipse([a[0] - 3, a[1] - 1, a[0] + 3, a[1] + 1], fill=hell(LEHM_FLECK, -30))
        b = p(x1, y1 - (y1 - y0) * ((u + 0.4) % 1), z)
        iso.d.ellipse([b[0] - 3, b[1] - 1, b[0] + 3, b[1] + 1], fill=hell(LEHM_FLECK, -6))


def strohdach(iso: Iso, x0, x1, y0, y1, z, h, *, ueber=0.18):
    """Satteldach aus Stroh: dick, weit überstehend, Halme als Linien von oben nach unten."""
    p = iso.p
    ym = (y0 + y1) / 2
    a, b = x0 - ueber, x1 + ueber
    first = iso.satteldach(x0, x1, y0, y1, z, h, STROH, LEHM, ueber=ueber)
    for k in range(1, 14):  # Halme auf der vorderen Fläche
        u = a + (b - a) * k / 14
        iso.linie(p(u, ym, z + h - 2), p(u, y1 + ueber, z - 4), STROH_FUGE)
    # dicke Traufkante
    iso.linie(p(a, y1 + ueber, z - 5), p(b, y1 + ueber, z - 5), hell(STROH, -50), 3)
    return first


def schornstein(iso: Iso, x, y, z0, z1) -> None:
    iso.quader(x - 0.08, x + 0.08, y - 0.08, y + 0.08, z0, z1, hell(ZIEGEL, -20))
    iso.quader(x - 0.1, x + 0.1, y - 0.1, y + 0.1, z1, z1 + 4, hell(ZIEGEL, -36))


# —— Gemeindehaus (kern, 3×3) ——————————————————————————————


def kern1(iso: Iso, fenster: list) -> None:
    """Lehmhaus mit Strohdach, Tür, zwei Fenster."""
    schatten(iso, 0.95)
    iso.quader(-0.84, 0.84, -0.66, 0.66, 0, 8, SOCKEL)
    iso.quader(-0.78, 0.78, -0.6, 0.6, 8, 66, LEHM, links=-30, rechts=-8)
    textur_lehm(iso, -0.78, 0.78, -0.6, 0.6, 8, 66)
    iso.fenster_l(-0.3, 0.6, 8, b=0.28, h=34, farbe=TUER, bogen=False)
    fenster.append(iso.fenster_l(0.35, 0.6, 30, b=0.2, h=18, bogen=False))
    fenster.append(iso.fenster_r(0.78, 0.0, 30, b=0.2, h=18, bogen=False))
    strohdach(iso, -0.78, 0.78, -0.6, 0.6, 66, 64)


def kern2(iso: Iso, fenster: list) -> None:
    """Fachwerkhaus, zwei Geschosse auf Steinsockel, Ziegeldach, Lehm-Anbau, Schornstein, Banner."""
    schatten(iso, 1.3)
    # Anbau links vorne: Lehm mit Strohdach
    iso.quader(-1.32, -0.5, 0.5, 1.3, 0, 46, LEHM, links=-30, rechts=-8)
    textur_lehm(iso, -1.32, -0.5, 0.5, 1.3, 0, 46)
    iso.fenster_l(-0.9, 1.3, 0, b=0.3, h=30, farbe=TUER, bogen=False)
    iso.pyramide(-1.32, -0.5, 0.5, 1.3, 46, 30, STROH, ueber=0.1)
    # Hauptbau
    iso.quader(-0.95, 0.95, -0.8, 0.8, 0, 40, STEIN)
    iso.textur_stein(-0.95, 0.95, -0.8, 0.8, 0, 40, 10)
    iso.fenster_l(0.45, 0.8, 0, b=0.3, h=34, farbe=TUER)
    fenster.append(iso.fenster_r(0.95, -0.2, 10, b=0.18, h=18))
    iso.quader(-1.0, 1.0, -0.85, 0.85, 40, 136, PUTZ, links=-30, rechts=-6)
    iso.textur_fachwerk(-1.0, 1.0, -0.85, 0.85, 40, 88)
    iso.textur_fachwerk(-1.0, 1.0, -0.85, 0.85, 88, 136)
    for z in (52, 100):
        for u in (-0.5, 0.0, 0.5):
            fenster.append(iso.fenster_l(u, 0.85, z, b=0.18, h=24, bogen=False))
        fenster.append(iso.fenster_r(1.0, -0.4, z, b=0.18, h=24, bogen=False))
        fenster.append(iso.fenster_r(1.0, 0.4, z, b=0.18, h=24, bogen=False))
    iso.banner_r(1.0, 0.0, 134, 44, PETROL)
    schornstein(iso, -0.5, -0.3, 160, 222)
    iso.satteldach(-1.0, 1.0, -0.85, 0.85, 136, 84, ZIEGEL, PUTZ, ueber=0.16)
    # Dachgaube vorne
    iso.quader(0.2, 0.6, 0.34, 0.6, 146, 176, PUTZ, links=-24, rechts=-4)
    fenster.append(iso.fenster_l(0.4, 0.6, 152, b=0.18, h=16, bogen=False))
    iso.pyramide(0.2, 0.6, 0.34, 0.6, 176, 18, ZIEGEL, ueber=0.05)


def kern3(iso: Iso, fenster: list) -> None:
    """Rathaus aus Bruchstein, Schieferdach, Uhrturm mit Helm, Seitenflügel, Fahne."""
    schatten(iso, 1.42)
    # Seitenflügel hinten rechts (Fachwerk auf Stein)
    iso.quader(0.3, 1.4, -1.4, -0.7, 0, 50, STEIN)
    iso.textur_stein(0.3, 1.4, -1.4, -0.7, 0, 50, 12)
    iso.quader(0.3, 1.4, -1.4, -0.7, 50, 96, PUTZ, links=-30, rechts=-6)
    iso.textur_fachwerk(0.3, 1.4, -1.4, -0.7, 50, 96)
    fenster.append(iso.fenster_r(1.4, -1.05, 62, b=0.18, h=22, bogen=False))
    iso.satteldach(0.3, 1.4, -1.4, -0.7, 96, 50, ZIEGEL, PUTZ, ueber=0.1)
    # Hauptbau Bruchstein
    iso.quader(-1.05, 1.05, -0.75, 0.9, 0, 132, STEIN)
    iso.textur_stein(-1.05, 1.05, -0.75, 0.9, 0, 132)
    iso.quader(-1.08, 1.08, -0.78, 0.93, 62, 68, hell(STEIN, -12))  # Gesims
    for u in (-0.65, -0.3, 0.35, 0.7):
        fenster.append(iso.fenster_l(u, 0.9, 16, b=0.16, h=26))
        fenster.append(iso.fenster_l(u, 0.9, 82, b=0.16, h=28))
    for v in (-0.45, 0.1, 0.6):
        fenster.append(iso.fenster_r(1.05, v, 16, b=0.16, h=26))
        fenster.append(iso.fenster_r(1.05, v, 82, b=0.16, h=28))
    # Portal mit Treppe
    iso.quader(-0.25, 0.25, 0.9, 1.15, 0, 8, hell(STEIN, -10))
    iso.fenster_l(0.02, 0.9, 8, b=0.3, h=40, farbe=TUER)
    iso.banner_r(1.05, -0.17, 128, 56, PETROL)
    iso.satteldach(-1.05, 1.05, -0.75, 0.9, 132, 80, SCHIEFER, STEIN, ueber=0.14)
    # Uhrturm auf dem First, mittig vorne
    iso.quader(-0.32, 0.32, -0.2, 0.44, 170, 284, STEIN)
    iso.textur_stein(-0.32, 0.32, -0.2, 0.44, 170, 284, 12)
    m = iso.p(0.0, 0.44, 236)
    iso.d.ellipse([m[0] - 13, m[1] - 13, m[0] + 13, m[1] + 13], fill=(244, 239, 228), outline=KONTUR)
    iso.linie(m, (m[0], m[1] - 9), (43, 38, 32), 2)
    iso.linie(m, (m[0] + 6, m[1] + 2), (43, 38, 32), 2)
    fenster.append(iso.fenster_r(0.32, 0.12, 252, b=0.16, h=22))  # Glockenstube
    iso.quader(-0.38, 0.38, -0.26, 0.5, 284, 290, hell(STEIN, -12))
    spitze = iso.pyramide(-0.32, 0.32, -0.2, 0.44, 290, 96, SCHIEFER, ueber=0.08)
    iso.fahne(spitze, 40, PETROL_HELL)


# —— Bücherei (wissen, 2×2) ————————————————————————————————


def wissen1(iso: Iso, fenster: list) -> None:
    """Lehmhäuschen mit Strohdach, Tür, breites Lesefenster."""
    schatten(iso, 0.9)
    iso.quader(-0.74, 0.74, -0.6, 0.6, 0, 6, SOCKEL)
    iso.quader(-0.68, 0.68, -0.54, 0.54, 6, 56, LEHM, links=-30, rechts=-8)
    textur_lehm(iso, -0.68, 0.68, -0.54, 0.54, 6, 56)
    iso.fenster_l(-0.34, 0.54, 6, b=0.26, h=30, farbe=TUER, bogen=False)
    fenster.append(iso.fenster_l(0.3, 0.54, 24, b=0.42, h=16, bogen=False))
    fenster.append(iso.fenster_r(0.68, 0.0, 24, b=0.22, h=16, bogen=False))
    strohdach(iso, -0.68, 0.68, -0.54, 0.54, 56, 52, ueber=0.16)


def wissen2(iso: Iso, fenster: list) -> None:
    """Fachwerk über Steinsockel, zwei Geschosse, Ziegeldach, Erker, Schornstein, Schild mit Buch."""
    schatten(iso, 1.0)
    iso.quader(-0.84, 0.84, -0.7, 0.7, 0, 44, STEIN)
    iso.textur_stein(-0.84, 0.84, -0.7, 0.7, 0, 44, 11)
    iso.fenster_l(-0.45, 0.7, 0, b=0.28, h=32, farbe=TUER)
    fenster.append(iso.fenster_r(0.84, 0.0, 12, b=0.3, h=18))
    iso.quader(-0.9, 0.9, -0.76, 0.76, 44, 136, PUTZ, links=-30, rechts=-6)
    iso.textur_fachwerk(-0.9, 0.9, -0.76, 0.76, 44, 90)
    iso.textur_fachwerk(-0.9, 0.9, -0.76, 0.76, 90, 136)
    for z in (56, 102):
        fenster.append(iso.fenster_l(-0.5, 0.76, z, b=0.2, h=22, bogen=False))
        fenster.append(iso.fenster_r(0.9, -0.35, z, b=0.2, h=22, bogen=False))
        fenster.append(iso.fenster_r(0.9, 0.35, z, b=0.2, h=22, bogen=False))
    schornstein(iso, -0.45, -0.25, 150, 214)
    iso.satteldach(-0.9, 0.9, -0.76, 0.76, 136, 70, ZIEGEL, PUTZ, ueber=0.14)
    # Erker vorne rechts, über zwei Geschosse, mit eigenem Spitzdach
    iso.quader(0.12, 0.62, 0.76, 1.0, 54, 126, PUTZ, links=-24, rechts=-4)
    iso.textur_fachwerk(0.12, 0.62, 0.76, 1.0, 54, 126)
    fenster.append(iso.fenster_l(0.37, 1.0, 64, b=0.2, h=20, bogen=False))
    fenster.append(iso.fenster_l(0.37, 1.0, 98, b=0.2, h=20, bogen=False))
    iso.pyramide(0.12, 0.62, 0.76, 1.0, 126, 22, ZIEGEL, ueber=0.05)
    iso.banner_r(0.9, 0.42, 132, 34, PETROL)
    # Schild mit aufgeschlagenem Buch am Ausleger (linke Fläche)
    a = iso.p(-0.9, 0.2, 108)
    iso.linie(a, (a[0] - 22, a[1] + 2), BALKEN, 3)
    s = [(a[0] - 30, a[1] + 4), (a[0] - 10, a[1] + 4), (a[0] - 10, a[1] + 22), (a[0] - 30, a[1] + 22)]
    iso.poly(s, PETROL, KONTUR)
    iso.poly([(a[0] - 27, a[1] + 9), (a[0] - 20, a[1] + 11), (a[0] - 13, a[1] + 9), (a[0] - 13, a[1] + 17), (a[0] - 20, a[1] + 19), (a[0] - 27, a[1] + 17)], GELB)


# —— Windmühle (turm, 1×1) ————————————————————————————————


def fluegel(iso: Iso, nabe, laenge: float, breite: float, *, tuch: bool, winkel0: float = math.pi / 4) -> None:
    """Vier Flügel als Gitter (Holz) oder mit Segeltuch, in der Bildebene, leicht gestaucht."""
    cx, cy = nabe
    for k in range(4):
        a = winkel0 + k * math.pi / 2
        dx, dy = math.cos(a) * 0.8, math.sin(a)
        nx, ny = -dy, dx
        ende = (cx + dx * laenge, cy - dy * laenge)
        iso.linie((cx, cy), ende, BALKEN, 3)
        p0 = (cx + dx * laenge * 0.25, cy - dy * laenge * 0.25)
        q = [p0, ende, (ende[0] + nx * breite, ende[1] - ny * breite), (p0[0] + nx * breite, p0[1] - ny * breite)]
        if tuch:
            iso.poly(q, (240, 232, 214), KONTUR)
        else:
            iso.poly(q, None, BALKEN)
            for t in (0.4, 0.6, 0.8):
                a1 = (cx + dx * laenge * t, cy - dy * laenge * t)
                iso.linie(a1, (a1[0] + nx * breite, a1[1] - ny * breite), BALKEN)
    iso.d.ellipse([cx - 4, cy - 4, cx + 4, cy + 4], fill=hell(BALKEN, -10), outline=KONTUR)


def turm1(iso: Iso, fenster: list) -> None:
    """Bockwindmühle: Holzkasten auf einem Bock, Satteldach, Gitterflügel."""
    schatten(iso, 0.5)
    p = iso.p
    # Bock: Mittelpfosten und Streben
    for a, b in (((-0.36, 0.0), (0.0, 0.0)), ((0.0, -0.36), (0.0, 0.0)), ((0.36, 0.0), (0.0, 0.0)), ((0.0, 0.36), (0.0, 0.0))):
        iso.linie(p(a[0], a[1], 0), p(b[0], b[1], 34), BALKEN, 3)
    iso.quader(-0.05, 0.05, -0.05, 0.05, 0, 40, HOLZ, links=-40, rechts=-8)
    # Mühlenkasten
    iso.quader(-0.3, 0.3, -0.36, 0.36, 40, 122, HOLZ, links=-40, rechts=-8)
    iso.textur_holz(-0.3, 0.3, -0.36, 0.36, 40, 122, 5)
    iso.fenster_l(0.0, 0.36, 40, b=0.18, h=26, farbe=TUER, bogen=False)
    fenster.append(iso.fenster_l(0.0, 0.36, 86, b=0.14, h=14, bogen=False))
    iso.satteldach(-0.3, 0.3, -0.36, 0.36, 122, 30, SCHINDEL, HOLZ, ueber=0.06)
    # Treppe hinten links (sichtbar links unten)
    iso.linie(p(-0.3, 0.2, 44), p(-0.62, 0.2, 0), BALKEN, 3)
    fluegel(iso, p(0.3, 0.0, 108), 46, 10, tuch=False)


def turm2(iso: Iso, fenster: list) -> None:
    """Turmholländer: runder Steinturm, Galerie, Haube, Segeltuch-Flügel, Fahne."""
    schatten(iso, 0.56)
    p = iso.p
    iso.zylinder(0.0, 0.0, 0.4, 0, 70, STEIN)
    cx, cy = p(0, 0, 0)
    # Galerie (Umgang) aus Holz: Boden vor dem oberen Turm, Geländer danach
    rx, ry = 0.56 * HW * math.sqrt(2), 0.56 * HH * math.sqrt(2)
    iso.d.ellipse([cx - rx, cy - ry - 74, cx + rx, cy + ry - 74], fill=hell(HOLZ, -14), outline=KONTUR)
    iso.zylinder(0.0, 0.0, 0.34, 74, 156, PUTZ, stein=False)
    for fz, b in ((0, 0), (98, 1)):  # Tür unten, Fenster oben (vorne Mitte)
        y = cy + 0.34 * HH * math.sqrt(2)
        pts = [(cx - 6, y - fz), (cx + 6, y - fz), (cx + 6, y - fz - (30 if not b else 18)), (cx - 6, y - fz - (30 if not b else 18))]
        iso.poly(pts, TUER if not b else FENSTER_TAG, KONTUR)
        if b:
            fenster.append(pts)
    for k in range(9):
        a = math.pi * k / 8
        x, y = cx - rx * math.cos(a), cy + ry * math.sin(a) - 74
        iso.linie((x, y), (x, y - 12), BALKEN, 2)
    iso.d.arc([cx - rx, cy - ry - 86, cx + rx, cy + ry - 86], 0, 180, fill=BALKEN, width=2)
    # Haube
    iso.kegel(0.0, 0.0, 0.4, 156, 44, SCHINDEL)
    iso.fahne((cx, cy - 200), 22, PETROL_HELL)
    fluegel(iso, (cx + 16, cy - 150), 44, 11, tuch=True)


# —— Schreinerei, Brücke, Zaun, Brunnen, Wappen, Obstwiese, Denkmal ——————————


def werkstatt1(iso: Iso, fenster: list) -> None:
    """Schreinerei: offener Schuppen, Lehm-Rückwand, Strohdach (Pultdach), Werkbank, Holzstapel."""
    schatten(iso, 0.95)
    p = iso.p
    iso.quader(-0.8, 0.8, -0.72, -0.6, 0, 62, LEHM, links=-30, rechts=-8)
    textur_lehm(iso, -0.8, 0.8, -0.72, -0.6, 0, 62)
    iso.quader(-0.8, -0.68, -0.72, 0.7, 0, 62, LEHM, links=-30, rechts=-8)
    iso.quader(-0.4, 0.3, -0.5, -0.22, 0, 22, hell(HOLZ, 24))  # Werkbank
    iso.quader(-0.3, -0.1, -0.45, -0.3, 22, 30, hell(HOLZ, 40))  # Hobel
    # Holzstapel: runde Stämme vorne rechts
    for r, (sx, sz) in enumerate(((0.36, 0), (0.56, 0), (0.46, 12))):
        m = p(0.78, sx, sz + 7)
        iso.d.ellipse([m[0] - 7, m[1] - 7, m[0] + 7, m[1] + 7], fill=hell(HOLZ, 50 - r * 8), outline=KONTUR)
        iso.d.ellipse([m[0] - 3, m[1] - 3, m[0] + 3, m[1] + 3], outline=HOLZ_FUGE)
    # Hackklotz vorne links
    iso.zylinder(-0.45, 0.45, 0.12, 0, 16, HOLZ, stein=False)
    for px, py in ((0.74, -0.66), (-0.74, 0.64), (0.74, 0.64)):
        iso.quader(px - 0.05, px + 0.05, py - 0.05, py + 0.05, 0, 58, HOLZ, links=-40, rechts=-8)
    m = p(0.1, 0.3, 50)
    lat = [(m[0] - 4, m[1]), (m[0] + 4, m[1]), (m[0] + 4, m[1] - 10), (m[0] - 4, m[1] - 10)]
    iso.poly(lat, (230, 180, 80), KONTUR)
    fenster.append(lat)
    a, b, c, d = -0.94, 0.94, -0.86, 0.84
    iso.poly([p(a, d, 58), p(b, d, 58), p(b, d, 50), p(a, d, 50)], hell(STROH, -50), KONTUR)
    iso.poly([p(b, c, 80), p(b, d, 58), p(b, d, 50), p(b, c, 72)], hell(STROH, -26), KONTUR)
    iso.poly([p(a, c, 80), p(b, c, 80), p(b, d, 58), p(a, d, 58)], hell(STROH, 4), KONTUR)
    for k in range(1, 14):
        u = a + (b - a) * k / 14
        iso.linie(p(u, c, 80), p(u, d, 58), STROH_FUGE)


def eingang1(iso: Iso, fenster: list) -> None:
    """Dorfbrücke: Holzsteg mit Geländer über einen kleinen Bach."""
    p = iso.p
    iso.poly([p(-0.5, -0.2, 0), p(0.5, -0.2, 0), p(0.5, 0.2, 0), p(-0.5, 0.2, 0)], WASSER)
    for k in (-0.3, 0.1, 0.35):
        iso.linie(p(k, -0.05, 0), p(k + 0.12, -0.05, 0), hell(WASSER, 50), 2)
    iso.poly([p(-0.5, 0.2, 0), p(0.5, 0.2, 0), p(0.5, 0.26, -6), p(-0.5, 0.26, -6)], hell(ERDE, 20))
    # Steg in x-Richtung über das Wasser (quer zum Bach)
    iso.quader(-0.16, 0.16, -0.5, 0.5, 10, 16, hell(HOLZ, 10))
    for k in range(1, 8):
        v = -0.5 + k / 8
        iso.linie(p(-0.16, v, 16), p(0.16, v, 16), HOLZ_FUGE)
    for y in (-0.42, 0.42):  # Stützen
        iso.quader(-0.14, -0.08, y - 0.04, y + 0.04, -4, 10, HOLZ)
        iso.quader(0.08, 0.14, y - 0.04, y + 0.04, -4, 10, HOLZ)
    for x in (-0.16, 0.16):  # Geländer
        for y in (-0.46, 0.0, 0.46):
            iso.quader(x - 0.02, x + 0.02, y - 0.02, y + 0.02, 16, 40, HOLZ, links=-40, rechts=-8)
        iso.linie(p(x, -0.46, 40), p(x, 0.46, 40), BALKEN, 3)
        iso.linie(p(x, -0.46, 28), p(x, 0.46, 28), hell(BALKEN, 10), 2)


def einfassung1(iso: Iso, fenster: list) -> None:
    """Zaun: Latten mit spitzem Kopf an zwei Riegeln, an beiden Enden anschlussfähig."""
    p = iso.p
    iso.quader(-0.5, 0.5, 0.04, 0.07, 12, 16, hell(HOLZ, -18))
    iso.quader(-0.5, 0.5, 0.04, 0.07, 30, 34, hell(HOLZ, -18))
    n = 6
    for k in range(n):
        x0 = -0.5 + k / n + 0.03
        x1 = x0 + 1 / n - 0.08
        iso.quader(x0, x1, 0.07, 0.1, 0, 34, LATTE, links=-26, rechts=-6)
        m = (x0 + x1) / 2
        iso.poly([p(x0, 0.1, 34), p(x1, 0.1, 34), p(m, 0.1, 40)], hell(LATTE, -26), KONTUR)
    for x in (-0.48, 0.46):
        iso.quader(x, x + 0.04, -0.02, 0.04, 0, 40, HOLZ, links=-40, rechts=-8)


def ursprung1(iso: Iso, fenster: list) -> None:
    """Dorfbrunnen: runder Steinkranz mit Wasser, zwei Pfosten, Schindeldach, Kurbel, Eimer."""
    schatten(iso, 0.42)
    p = iso.p
    iso.quader(-0.05, 0.05, -0.34, -0.28, 0, 78, HOLZ, links=-40, rechts=-8)
    iso.zylinder(0.0, 0.0, 0.3, 0, 26, STEIN)
    cx, cy = p(0, 0, 26)
    rx, ry = 0.24 * HW * math.sqrt(2), 0.24 * HH * math.sqrt(2)
    iso.d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=WASSER, outline=hell(WASSER, -40))
    iso.linie(p(0, -0.3, 66), p(0, 0.3, 66), BALKEN, 3)  # Welle
    iso.linie(p(0, 0.0, 66), p(0, 0.0, 44), (120, 110, 100), 1)  # Seil
    e = p(0, 0.0, 44)
    iso.poly([(e[0] - 5, e[1]), (e[0] + 5, e[1]), (e[0] + 4, e[1] + 9), (e[0] - 4, e[1] + 9)], hell(HOLZ, 20), KONTUR)
    iso.quader(-0.05, 0.05, 0.28, 0.34, 0, 78, HOLZ, links=-40, rechts=-8)
    k = p(0.0, 0.38, 66)
    iso.linie(k, (k[0] - 6, k[1] + 8), BALKEN, 2)  # Kurbel
    iso.satteldach(-0.2, 0.2, -0.42, 0.42, 78, 22, SCHINDEL, HOLZ, ueber=0.04)


def zeichen1(iso: Iso, fenster: list) -> None:
    """Wappen: Pfosten mit Querholz und Wappenschild (Petrol, gelbes Zeichen)."""
    schatten(iso, 0.3)
    p = iso.p
    iso.quader(-0.18, 0.18, -0.18, 0.18, 0, 8, SOCKEL)
    iso.quader(-0.04, 0.04, -0.04, 0.04, 8, 112, HOLZ, links=-40, rechts=-8)
    m = p(0.0, 0.08, 84)
    s = [(m[0] - 18, m[1] - 18), (m[0] + 18, m[1] - 18), (m[0] + 18, m[1] + 2), (m[0], m[1] + 18), (m[0] - 18, m[1] + 2)]
    iso.poly(s, PETROL, KONTUR)
    iso.poly([(m[0], m[1] - 18), (m[0] + 18, m[1] - 18), (m[0] + 18, m[1] + 2), (m[0], m[1] + 18)], hell(PETROL, 18))
    iso.poly([(m[0] - 7, m[1] + 4), (m[0], m[1] - 10), (m[0] + 7, m[1] + 4)], GELB, KONTUR)  # Ähre/Giebel
    k = p(0.0, 0.0, 112)
    iso.d.ellipse([k[0] - 4, k[1] - 6, k[0] + 4, k[1] + 2], fill=GELB, outline=KONTUR)


def flaeche1(iso: Iso, fenster: list) -> None:
    """Obstwiese: Wiese mit drei Obstbäumen (Äpfel, Birnen) und Blumen."""
    p = iso.p
    iso.quader(-0.92, 0.92, -0.92, 0.92, 0, 4, GRUEN, hell(GRUEN, 10), links=-30, rechts=-10)
    for k, (u, v) in enumerate(((-0.6, 0.5), (0.3, -0.5), (0.5, 0.55), (-0.2, 0.0))):
        m = p(u, v, 4)
        iso.d.ellipse([m[0] - 3, m[1] - 2, m[0] + 3, m[1] + 2], fill=[(240, 240, 236), (236, 200, 90)][k % 2])
    for u, v, frucht in ((-0.45, -0.45, (204, 64, 52)), (0.45, -0.1, (214, 196, 76)), (-0.1, 0.45, (204, 64, 52))):
        iso.quader(u - 0.05, u + 0.05, v - 0.05, v + 0.05, 4, 36, HOLZ, links=-40, rechts=-8)
        m = p(u, v, 52)
        krone(iso, m[0], m[1], 19)
        for dx, dy in ((-8, 4), (6, -6), (9, 6), (-2, -10)):
            iso.d.ellipse([m[0] + dx - 2.5, m[1] + dy - 2.5, m[0] + dx + 2.5, m[1] + dy + 2.5], fill=frucht)


def denkmal1(iso: Iso, fenster: list) -> None:
    """Gestufter Bruchsteinsockel mit Figur in neutralem Grau (Bäuerin mit Garbe)."""
    schatten(iso, 0.42)
    p = iso.p
    iso.quader(-0.34, 0.34, -0.34, 0.34, 0, 8, hell(STEIN, -14))
    iso.quader(-0.26, 0.26, -0.26, 0.26, 8, 18, hell(STEIN, -6))
    iso.quader(-0.18, 0.18, -0.18, 0.18, 18, 44, STEIN)
    iso.textur_stein(-0.18, 0.18, -0.18, 0.18, 18, 44, 9)
    # Figur: Rock, Oberkörper, Kopf mit Kopftuch, Garbe im Arm
    iso.poly([p(-0.12, 0.0, 44), p(0.12, 0.0, 44), p(0.06, 0.0, 80), p(-0.06, 0.0, 80)], GRAU, KONTUR)
    iso.quader(-0.07, 0.07, -0.05, 0.05, 78, 98, hell(GRAU, -6), links=-30, rechts=-6)
    k = p(0.0, 0.0, 108)
    iso.d.ellipse([k[0] - 8, k[1] - 9, k[0] + 8, k[1] + 7], fill=hell(GRAU, 10), outline=KONTUR)
    iso.d.chord([k[0] - 9, k[1] - 11, k[0] + 9, k[1] + 5], 180, 360, fill=hell(GRAU, -18), outline=KONTUR)
    g = p(0.12, 0.0, 90)  # Garbe: gebundene Halme, oben gefächert
    for dx in (-6, -3, 0, 3, 6):
        iso.linie((g[0], g[1] + 10), (g[0] + dx + 4, g[1] - 16), hell(GRAU, -30), 2)
    iso.linie((g[0] - 2, g[1] + 2), (g[0] + 5, g[1] + 2), hell(GRAU, -50), 3)


# —— Umgebung (§12.7): Bäume an den festen Plätzen der Dorf-Szene ——————————


def dorfbaum(iso: Iso, fenster: list, hoehe: int, r: float, frucht=None) -> None:
    schatten(iso, 0.42)
    iso.quader(-0.07, 0.07, -0.07, 0.07, 0, hoehe, HOLZ, links=-40, rechts=-8)
    m = iso.p(0, 0, hoehe + r * 0.6)
    krone(iso, m[0], m[1], r)
    if frucht:
        for dx, dy in ((-0.5, 0.2), (0.3, -0.35), (0.55, 0.3), (-0.1, -0.6), (0.05, 0.45)):
            x, y = m[0] + dx * r, m[1] + dy * r
            iso.d.ellipse([x - 2.5, y - 2.5, x + 2.5, y + 2.5], fill=frucht)


def baum_a(iso: Iso, fenster: list) -> None:
    """Linde: hoher Laubbaum."""
    dorfbaum(iso, fenster, 44, 29)


def baum_b(iso: Iso, fenster: list) -> None:
    """Apfelbaum: kleiner, mit roten Äpfeln."""
    dorfbaum(iso, fenster, 30, 22, (204, 64, 52))


UMGEBUNG = [("baum_a", baum_a), ("baum_b", baum_b)]


# —— Wesen (§12.7): Huhn, Katze, Spatz, je 3 Ruhe-, 4 Geh-, 2 Reaktionsbilder ——


def huhn(zyklus: str, frame: int) -> Image.Image:
    w = Wesen()
    weiss, braun, rot, gelb = (244, 238, 226), (196, 140, 84), (210, 60, 48), (236, 176, 64)
    pick = zyklus == "idle" and frame == 1  # pickt
    y = 0.0
    wesen_bodenschatten(w, 10)
    if zyklus != "react":
        schritt = [(-2, 2), (0, 0), (2, -2), (0, 0)][frame % 4] if zyklus == "walk" else (0, 0)
        for bx, sv in ((29, schritt[0]), (34, schritt[1])):
            w.strich((bx, 47), (bx + sv, 55), gelb, 1.4)
    else:
        y = -3 - frame * 2
        w.strich((29, 47 + y), (28, 52 + y), gelb, 1.4)
        w.strich((34, 47 + y), (35, 52 + y), gelb, 1.4)
    # Schwanzfedern
    w.form([(18, 38 + y), (14, 28 + y), (20, 30 + y), (24, 36 + y)], hell(braun, -20))
    # Körper
    w.form([(18, 40 + y), (22, 33 + y), (34, 32 + y), (42, 37 + y), (40, 46 + y), (28, 50 + y), (20, 47 + y)], braun)
    w.form([(23, 34 + y), (34, 33 + y), (40, 37 + y), (30, 39 + y)], hell(braun, 24), kontur=False)
    # Flügel
    if zyklus == "react":
        w.form([(24, 38 + y), (16, 26 + y - frame * 3), (26, 30 + y), (34, 37 + y)], hell(braun, -16))
    else:
        w.oval(22, 37 + y, 35, 45 + y, hell(braun, -16))
        w.strich((25, 42 + y), (32, 42 + y), hell(braun, -40), 0.8)
    # Kopf (beim Picken tiefer)
    ky = 26 + y + (8 if pick else 0)
    kx = 40 + (3 if pick else 0)
    w.oval(kx - 4, ky - 1, kx + 5, ky + 8, weiss)
    w.form([(kx - 2, ky), (kx, ky - 4), (kx + 2, ky - 2), (kx + 4, ky - 4), (kx + 4, ky + 1)], rot)
    w.form([(kx + 5, ky + 3), (kx + 9, ky + 4.5), (kx + 5, ky + 6)], gelb)
    w.oval(kx + 6 - 3.5, ky + 6, kx + 6 - 1.5, ky + 9, rot, kontur=False)
    w.oval(kx + 1.5, ky + 2, kx + 3.2, ky + 3.7, (30, 26, 22), kontur=False)
    return w.fertig()


def katze(zyklus: str, frame: int) -> Image.Image:
    w = Wesen()
    grau, hellgrau, dunkel, rosa = (150, 140, 130), (190, 180, 168), (96, 88, 80), (220, 150, 150)
    bob = [0, -0.5, 0][frame % 3] if zyklus == "idle" else 0.0
    y = bob
    wesen_bodenschatten(w, 12)
    if zyklus == "react":
        # sitzt aufrecht, Schwanz hoch
        w.strich((22, 52), (16, 36 - frame * 2), grau, 3)
        w.form([(22, 54), (21, 42), (26, 32), (34, 32), (37, 42), (36, 54)], grau)
        w.form([(27, 36), (33, 35), (35, 46), (29, 50)], hellgrau, kontur=False)
        w.strich((28, 50), (28, 55), dunkel, 2.2)
        w.strich((33, 50), (33, 55), dunkel, 2.2)
        kx, ky = 31, 25
    else:
        schritt = [(-2.5, 2.5), (0, 0), (2.5, -2.5), (0, 0)][frame % 4] if zyklus == "walk" else (0, 0)
        w.strich((18, 40 + y), (10, 30 + y - (frame % 2 if zyklus == "walk" else 0)), grau, 3)
        for bx, sv, ton in ((21, schritt[1], dunkel), (25, schritt[0], grau), (36, schritt[0], dunkel), (40, schritt[1], grau)):
            w.strich((bx, 44 + y), (bx + sv, 55), ton, 2.4)
        w.form([(17, 40 + y), (22, 35 + y), (38, 35 + y), (43, 39 + y), (41, 46 + y), (20, 46 + y)], grau)
        for sx in (25, 30, 35):  # Streifen
            w.strich((sx, 35.5 + y), (sx - 1, 40 + y), dunkel, 1.2)
        kx, ky = 43, 31 + y
    w.oval(kx - 6, ky - 5, kx + 6, ky + 6, grau)
    w.form([(kx - 6, ky - 2), (kx - 5, ky - 10), (kx - 1, ky - 5)], grau)
    w.form([(kx + 1, ky - 5), (kx + 5, ky - 10), (kx + 6, ky - 2)], grau)
    w.form([(kx - 4.6, ky - 4), (kx - 4.5, ky - 7.5), (kx - 2.5, ky - 5)], rosa, kontur=False)
    w.oval(kx - 3.5, ky - 1, kx - 1.5, ky + 1.5, (60, 120, 70), kontur=False)
    w.oval(kx + 1.5, ky - 1, kx + 3.5, ky + 1.5, (60, 120, 70), kontur=False)
    w.oval(kx - 1, ky + 2, kx + 1, ky + 3.5, rosa, kontur=False)
    return w.fertig()


def spatz(zyklus: str, frame: int) -> Image.Image:
    w = Wesen()
    braun, hell_b, grau, dunkel = (150, 108, 70), (214, 190, 156), (130, 126, 120), (70, 50, 34)
    hop = [0, -2, 0, -1][frame % 4] if zyklus == "walk" else 0.0
    y = hop + (-6 - frame * 3 if zyklus == "react" else 0)
    wesen_bodenschatten(w, 6)
    if zyklus != "react":
        w.strich((29, 48 + y), (29, 54), dunkel, 1.2)
        w.strich((32, 48 + y), (32, 54), dunkel, 1.2)
    w.form([(20, 44 + y), (16, 41 + y), (23, 40 + y)], dunkel)  # Schwanz
    w.oval(21, 38 + y, 37, 50 + y, braun)
    w.oval(26, 43 + y, 36, 50 + y, hell_b, kontur=False)
    if zyklus == "react":
        w.form([(24, 42 + y), (18, 30 + y - frame * 2), (28, 34 + y), (32, 41 + y)], hell(braun, -20))
    else:
        w.form([(22, 42 + y), (30, 40 + y), (32, 45 + y), (24, 47 + y)], hell(braun, -24))
        for k in (24, 27):
            w.strich((k, 42.5 + y), (k + 2, 44.5 + y), hell_b, 0.8)
    w.oval(31, 33 + y, 40, 42 + y, grau)
    w.oval(33, 33 + y, 40, 37 + y, braun, kontur=False)
    w.form([(39.5, 37 + y), (43, 38.5 + y), (39.5, 40 + y)], dunkel)
    w.oval(36, 36 + y, 37.6, 37.6 + y, (30, 26, 22), kontur=False)
    w.oval(35, 39 + y, 38, 41.5 + y, (40, 34, 30), kontur=False)  # Kehlfleck
    return w.fertig()


WESEN = {"huhn": huhn, "katze": katze, "spatz": spatz}


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
    return schreibe_atlas("dorf", GEBAEUDE, UMGEBUNG, WESEN)


if __name__ == "__main__":
    sys.exit(main())
