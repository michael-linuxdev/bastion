#!/usr/bin/env python3
"""G3: Gebäude Thema `bastion`, Epoche 1 (FOKUS.md Paket G).
Charge 1: Bergfried (Stufen 1–3). Charge 2: Studierstube und Späherturm (Stufen 1–2).
Charge 3: Werkstatt, Tor, Palisade, Feuerstelle, Banner, Gartenbeet, Statue.
Umgebung: Bäume, Busch und Stein für den Inselrand (`umgebung/bastion/`).
Wesen: Möwe, Fuchs und Wache (`wesen/bastion/`, je 3 Ruhe-, 4 Geh- und 2 Reaktionsbilder).

Eigener Generator nach der Stil-Regel GRAFIK-SPRITES.md §12 (Entscheidung PV
01.11.2026: eigener Generator für alles, aus einem Guss). Grundlage ist das
Probestück (a) (`tools/grafik/probe/bergfried-a-generator.py`, bleibt als Beleg).

Stufen-Sprache (§12.6, Tabelle §12.8):
  1 Holzturm   – Holz auf niedrigem Steinsockel, Schindeldach, eine Tür
  2 Fachwerk   – Steinsockel-Geschoss, vorkragendes Fachwerk, Ziegeldach, Anbau, Banner
  3 Stein      – hoher Steinturm, Zinnenkranz, Turmaufsatz mit Helm, runder Seitenturm, Fahne

Schreibt die Bilder aus `GEBAEUDE` und ihre `*_fenster.png` in den Atlas
und ersetzt die passenden Einträge in `manifest.json` (andere bleiben unverändert).
Aufruf: python3 tools/grafik/sprites-g3-bastion.py
Deterministisch, ohne Zufall. Raster wie iso.ts (Raute 48×24 logisch, hier 2× gezeichnet);
die untere Ecke des Fußabdrucks liegt 4 px über dem Bildrand wie bei P3 (`canvas_for`).
"""
from __future__ import annotations

import math
import sys

from PIL import Image

sys.dont_write_bytecode = True  # kein __pycache__ im Repository
sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from g3_stil import *  # noqa: E402,F403  Raster, Licht, Palette, Grundkörper (§12)
from g3_stil import HH, HW, BREITE, Iso, Wesen, erzeuge_mit, hell, schatten, schreibe_atlas, wesen_bodenschatten  # noqa: E402


# —— Stufen ——————————————————————————————————————————————


def stufe1(iso: Iso, fenster: list) -> None:
    schatten(iso, 0.95)
    iso.quader(-0.78, 0.78, -0.78, 0.78, 0, 14, SOCKEL)
    iso.textur_stein(-0.78, 0.78, -0.78, 0.78, 0, 14, 7)
    iso.quader(-0.66, 0.66, -0.66, 0.66, 14, 118, HOLZ, links=-40, rechts=-8)
    iso.textur_holz(-0.66, 0.66, -0.66, 0.66, 14, 118)
    # Tür links, Fenster rechts
    iso.fenster_l(0.05, 0.66, 14, b=0.3, h=34, farbe=(70, 46, 28))
    fenster.append(iso.fenster_r(0.66, -0.1, 70, b=0.2, h=20))
    iso.pyramide(-0.66, 0.66, -0.66, 0.66, 118, 58, SCHINDEL, ueber=0.14)


def stufe2(iso: Iso, fenster: list) -> None:
    schatten(iso, 1.25)
    # Anbau links vorne: Holzschuppen mit Pultdach-Pyramide
    iso.quader(-1.3, -0.35, 0.55, 1.35, 0, 52, HOLZ, links=-40, rechts=-8)
    iso.textur_holz(-1.3, -0.35, 0.55, 1.35, 0, 52, 6)
    iso.fenster_l(-0.82, 1.35, 0, b=0.32, h=32, farbe=(70, 46, 28), bogen=False)
    iso.pyramide(-1.3, -0.35, 0.55, 1.35, 52, 30, SCHINDEL, ueber=0.08)
    # Hauptturm: Steingeschoss
    iso.quader(-0.8, 0.8, -0.8, 0.8, 0, 96, STEIN)
    iso.textur_stein(-0.8, 0.8, -0.8, 0.8, 0, 96)
    iso.fenster_l(0.35, 0.8, 0, b=0.32, h=36, farbe=(70, 46, 28))
    fenster.append(iso.fenster_r(0.8, 0.0, 44, b=0.18, h=22))
    # vorkragendes Fachwerk
    iso.quader(-0.9, 0.9, -0.9, 0.9, 96, 186, PUTZ, links=-30, rechts=-6)
    iso.textur_fachwerk(-0.9, 0.9, -0.9, 0.9, 96, 186)
    fenster.append(iso.fenster_l(-0.3, 0.9, 112, b=0.2, h=26, bogen=False))
    fenster.append(iso.fenster_l(0.3, 0.9, 150, b=0.2, h=22, bogen=False))
    fenster.append(iso.fenster_r(0.9, -0.3, 112, b=0.2, h=26, bogen=False))
    iso.banner_r(0.9, 0.42, 92, 52, PETROL)
    spitze = iso.pyramide(-0.9, 0.9, -0.9, 0.9, 186, 92, ZIEGEL, ueber=0.16)
    iso.fahne(spitze, 40, PETROL_HELL)


def stufe3(iso: Iso, fenster: list) -> None:
    schatten(iso, 1.42)
    # Mauerstück hinten rechts mit Zinnen
    iso.quader(-0.2, 1.4, -1.4, -0.9, 0, 70, STEIN)
    iso.textur_stein(-0.2, 1.4, -1.4, -0.9, 0, 70)
    iso.zinnen(-0.2, 1.4, -1.4, -0.9, 70, 12, STEIN, n=4)
    # Hauptturm: hoher Steinturm
    iso.quader(-0.82, 0.82, -0.82, 0.82, 0, 250, STEIN)
    iso.textur_stein(-0.82, 0.82, -0.82, 0.82, 0, 250)
    iso.fenster_l(0.3, 0.82, 0, b=0.34, h=40, farbe=(70, 46, 28))
    for z in (78, 140, 196):
        # links in die Mitte der sichtbaren Wand: bei −0,3 stand der runde Seitenturm davor
        fenster.append(iso.fenster_l(0.4, 0.82, z))
        fenster.append(iso.fenster_r(0.82, -0.3, z))
    iso.banner_r(0.82, 0.32, 236, 70, PETROL)
    # Kragsims und Zinnenkranz
    iso.quader(-0.95, 0.95, -0.95, 0.95, 244, 254, hell(STEIN, -8))
    # Turmaufsatz mit Helm (hinter den vorderen Zinnen)
    iso.quader(-0.42, 0.42, -0.42, 0.42, 254, 300, STEIN)
    iso.textur_stein(-0.42, 0.42, -0.42, 0.42, 254, 300)
    fenster.append(iso.fenster_l(0.0, 0.42, 266, b=0.14, h=16))
    spitze = iso.pyramide(-0.42, 0.42, -0.42, 0.42, 300, 78, ZIEGEL, ueber=0.1)
    iso.fahne(spitze, 44, PETROL_HELL)
    # vordere Zinnen des Kranzes
    w = 0.16
    for k in range(4):
        u0 = -0.95 + 1.9 * k / 4
        iso.quader(u0 + 0.22, u0 + 0.475, 0.95 - w, 0.95, 254, 272, STEIN)
        iso.quader(0.95 - w, 0.95, u0 + 0.22, u0 + 0.475, 254, 272, STEIN)
    # runder Seitenturm links vorne
    iso.zylinder(-0.55, 1.05, 0.42, 0, 168, STEIN)
    fenster.append([])
    iso.kegel(-0.55, 1.05, 0.52, 168, 82, ZIEGEL)
    cx, cy = iso.p(-0.55, 1.05, 0)
    rx = 0.42 * HW * math.sqrt(2)
    for fz in (60, 112):
        pts = [(cx - 6, cy + rx * 0.0 - fz), (cx + 6, cy - fz), (cx + 6, cy - fz - 20), (cx, cy - fz - 26), (cx - 6, cy - fz - 20)]
        pts = [(a, b + 0.42 * HH * math.sqrt(2)) for a, b in pts]
        iso.poly(pts, FENSTER_TAG, KONTUR)
        fenster.append(pts)


# —— Studierstube (wissen, 2×2) ————————————————————————————


def wissen1(iso: Iso, fenster: list) -> None:
    """Holzhaus, ein Geschoss, Satteldach aus Schindeln, Tür, breites Lesefenster."""
    schatten(iso, 0.95)
    iso.quader(-0.8, 0.8, -0.68, 0.68, 0, 8, SOCKEL)
    iso.quader(-0.74, 0.74, -0.6, 0.6, 8, 64, HOLZ, links=-40, rechts=-8)
    iso.textur_holz(-0.74, 0.74, -0.6, 0.6, 8, 64, 6)
    iso.fenster_l(-0.38, 0.6, 8, b=0.26, h=30, farbe=(70, 46, 28))
    fenster.append(iso.fenster_l(0.3, 0.6, 28, b=0.5, h=18, bogen=False))
    fenster.append(iso.fenster_r(0.74, 0.0, 30, b=0.24, h=16, bogen=False))
    iso.satteldach(-0.74, 0.74, -0.6, 0.6, 64, 44, SCHINDEL, HOLZ, ueber=0.12)


def wissen2(iso: Iso, fenster: list) -> None:
    """Fachwerk über Steinsockel, zwei Geschosse, Ziegeldach mit Gaube und Dachreiter,
    rundes Fenster im Giebel, Banner."""
    schatten(iso, 1.0)
    iso.quader(-0.84, 0.84, -0.68, 0.68, 0, 48, STEIN)
    iso.textur_stein(-0.84, 0.84, -0.68, 0.68, 0, 48, 12)
    iso.fenster_l(-0.4, 0.68, 0, b=0.28, h=32, farbe=(70, 46, 28))
    fenster.append(iso.fenster_l(0.32, 0.68, 14, b=0.22, h=18))
    iso.quader(-0.92, 0.92, -0.76, 0.76, 48, 112, PUTZ, links=-30, rechts=-6)
    iso.textur_fachwerk(-0.92, 0.92, -0.76, 0.76, 48, 112)
    fenster.append(iso.fenster_l(-0.46, 0.76, 64, b=0.2, h=24, bogen=False))
    fenster.append(iso.fenster_l(0.46, 0.76, 64, b=0.2, h=24, bogen=False))
    fenster.append(iso.fenster_r(0.92, -0.3, 64, b=0.2, h=24, bogen=False))
    iso.banner_r(0.92, 0.42, 104, 40, PETROL)
    iso.satteldach(-0.92, 0.92, -0.76, 0.76, 112, 60, ZIEGEL, PUTZ, ueber=0.14)
    # rundes Fenster im Giebel (rechte Fläche)
    m = iso.p(0.92, 0.0, 134)
    rund = [(m[0] + 7 * math.cos(a / 8 * math.pi), m[1] + 9 * math.sin(a / 8 * math.pi)) for a in range(16)]
    iso.poly(rund, FENSTER_TAG, KONTUR)
    fenster.append(rund)
    # Dachgaube auf der vorderen Dachfläche
    iso.quader(0.12, 0.5, 0.28, 0.52, 120, 146, PUTZ, links=-24, rechts=-4)
    fenster.append(iso.fenster_l(0.31, 0.52, 124, b=0.18, h=14, bogen=False))
    iso.pyramide(0.12, 0.5, 0.28, 0.52, 146, 18, ZIEGEL, ueber=0.05)
    # Dachreiter: kleines Türmchen mit Spitze auf dem First
    iso.quader(-0.52, -0.22, -0.15, 0.15, 160, 190, PUTZ, links=-24, rechts=-4)
    iso.textur_fachwerk(-0.52, -0.22, -0.15, 0.15, 160, 190)
    spitze = iso.pyramide(-0.52, -0.22, -0.15, 0.15, 190, 44, ZIEGEL, ueber=0.06)
    iso.fahne(spitze, 26, PETROL_HELL)


# —— Späherturm (turm, 1×1) ——————————————————————————————


def turm1(iso: Iso, fenster: list) -> None:
    """Offener Holzturm: vier Pfosten mit Kreuzstreben, Plattform mit Geländer,
    kleines Schindeldach, Leiter, Laterne."""
    schatten(iso, 0.52)
    p = iso.p
    e = 0.36
    pfosten = [(-e, -e), (e, -e), (-e, e), (e, e)]
    for px, py in pfosten:  # hintere zuerst (Reihenfolge nach x + y)
        iso.quader(px - 0.05, px + 0.05, py - 0.05, py + 0.05, 0, 112, HOLZ, links=-40, rechts=-8)
    for z0, z1 in ((8, 58), (58, 108)):  # Kreuzstreben vorne links und rechts
        iso.linie(p(-e, e, z0), p(e, e, z1), BALKEN, 3)
        iso.linie(p(e, e, z0), p(-e, e, z1), BALKEN, 3)
        iso.linie(p(e, e, z0), p(e, -e, z1), hell(BALKEN, 14), 3)
        iso.linie(p(e, -e, z0), p(e, e, z1), hell(BALKEN, 14), 3)
    # Leiter vorne links
    for yy in (0.43, 0.43):
        iso.linie(p(-0.16, yy + 0.06, 0), p(-0.16, yy, 112), BALKEN, 2)
        iso.linie(p(0.04, yy + 0.06, 0), p(0.04, yy, 112), BALKEN, 2)
    for z in range(12, 112, 14):
        iso.linie(p(-0.16, 0.47, z), p(0.04, 0.47, z), HOLZ_FUGE, 2)
    # Plattform
    iso.quader(-0.5, 0.5, -0.5, 0.5, 112, 120, hell(HOLZ, -10))
    # Laterne auf der Plattform
    m = p(0.05, 0.05, 120)
    lat = [(m[0] - 4, m[1]), (m[0] + 4, m[1]), (m[0] + 4, m[1] - 10), (m[0] - 4, m[1] - 10)]
    iso.poly(lat, (230, 180, 80), KONTUR)
    fenster.append(lat)
    # Dachpfosten und Geländer
    for px, py in pfosten:
        iso.quader(px - 0.03, px + 0.03, py - 0.03, py + 0.03, 120, 156, HOLZ)
    for z in (134, 146):
        iso.linie(p(-0.48, 0.48, z), p(0.48, 0.48, z), BALKEN, 2)
        iso.linie(p(0.48, 0.48, z), p(0.48, -0.48, z), hell(BALKEN, 14), 2)
    iso.pyramide(-0.42, 0.42, -0.42, 0.42, 156, 40, SCHINDEL, ueber=0.08)


def turm2(iso: Iso, fenster: list) -> None:
    """Geschlossene Turmstube aus Fachwerk auf Steinfuß, vorkragend, Ziegel-Spitzhelm, Fahne."""
    schatten(iso, 0.56)
    iso.quader(-0.4, 0.4, -0.4, 0.4, 0, 96, STEIN)
    iso.textur_stein(-0.4, 0.4, -0.4, 0.4, 0, 96, 12)
    iso.fenster_l(0.0, 0.4, 0, b=0.24, h=30, farbe=(70, 46, 28))
    fenster.append(iso.fenster_r(0.4, 0.0, 52, b=0.14, h=18))
    iso.quader(-0.5, 0.5, -0.5, 0.5, 96, 168, PUTZ, links=-30, rechts=-6)
    iso.textur_fachwerk(-0.5, 0.5, -0.5, 0.5, 96, 168)
    fenster.append(iso.fenster_l(0.0, 0.5, 116, b=0.2, h=24, bogen=False))
    fenster.append(iso.fenster_r(0.5, 0.0, 116, b=0.2, h=24, bogen=False))
    spitze = iso.pyramide(-0.5, 0.5, -0.5, 0.5, 168, 92, ZIEGEL, ueber=0.08)
    iso.fahne(spitze, 34, PETROL_HELL)


# —— Charge 3: Werkstatt, Tor, Einfassung und Zierde ——————————————



def werkstatt1(iso: Iso, fenster: list) -> None:
    """Offener Holzschuppen mit Pultdach aus Schindeln, Werkbank, Bretterstapel, Sägebock."""
    schatten(iso, 0.95)
    p = iso.p
    # Rückwände (hinten und links), durch die offene Front sichtbar
    iso.quader(-0.8, 0.8, -0.72, -0.62, 0, 66, HOLZ, links=-40, rechts=-8)
    iso.textur_holz(-0.8, 0.8, -0.72, -0.62, 0, 66, 7)
    iso.quader(-0.8, -0.7, -0.72, 0.7, 0, 66, HOLZ, links=-40, rechts=-8)
    iso.textur_holz(-0.8, -0.7, -0.72, 0.7, 0, 66, 6)
    # Werkbank
    iso.quader(-0.35, 0.35, -0.5, -0.2, 0, 22, hell(HOLZ, 24))
    iso.linie(p(-0.2, -0.2, 22), p(0.15, -0.2, 26), (200, 200, 196), 2)  # Säge auf der Bank
    # Bretterstapel vorne rechts
    for k in range(4):
        iso.quader(0.3, 0.78, 0.3, 0.6, k * 5, k * 5 + 5, hell(HOLZ, 30 - k * 6))
    # Sägebock vorne links
    iso.linie(p(-0.55, 0.45, 0), p(-0.35, 0.45, 20), BALKEN, 3)
    iso.linie(p(-0.35, 0.45, 0), p(-0.55, 0.45, 20), BALKEN, 3)
    iso.linie(p(-0.45, 0.2, 18), p(-0.45, 0.65, 18), hell(HOLZ, 20), 4)
    # vordere Pfosten
    for px, py in ((0.74, -0.66), (-0.74, 0.64), (0.74, 0.64)):
        iso.quader(px - 0.05, px + 0.05, py - 0.05, py + 0.05, 0, 58, HOLZ, links=-40, rechts=-8)
    # Laterne unter dem Dach
    m = p(0.2, 0.3, 50)
    lat = [(m[0] - 4, m[1]), (m[0] + 4, m[1]), (m[0] + 4, m[1] - 10), (m[0] - 4, m[1] - 10)]
    iso.poly(lat, (230, 180, 80), KONTUR)
    fenster.append(lat)
    # Pultdach: hinten hoch, vorne tief
    a, b, c, d = -0.92, 0.92, -0.84, 0.82
    iso.poly([p(a, d, 58), p(b, d, 58), p(b, d, 52), p(a, d, 52)], hell(SCHINDEL, -40), KONTUR)
    iso.poly([p(b, c, 76), p(b, d, 58), p(b, d, 52), p(b, c, 70)], hell(SCHINDEL, -20), KONTUR)
    iso.poly([p(a, c, 76), p(b, c, 76), p(b, d, 58), p(a, d, 58)], hell(SCHINDEL, 6), KONTUR)
    for t in (0.25, 0.5, 0.75):
        y = c + (d - c) * t
        iso.linie(p(a, y, 76 - 18 * t), p(b, y, 76 - 18 * t), hell(SCHINDEL, -30))


def eingang1(iso: Iso, fenster: list) -> None:
    """Holztor zwischen zwei Pfosten mit Querbalken und kleinem Schindeldach."""
    schatten(iso, 0.5)
    p = iso.p
    iso.quader(-0.46, -0.34, -0.07, 0.07, 0, 78, HOLZ, links=-40, rechts=-8)
    # Torflügel (Bretter mit Strebe), Vorderseite y = 0.04
    y = 0.04
    iso.poly([p(-0.34, y, 0), p(0.34, y, 0), p(0.34, y, 58), p(-0.34, y, 58)], hell(HOLZ, -30), KONTUR)
    for k in range(1, 6):
        u = -0.34 + 0.68 * k / 6
        iso.linie(p(u, y, 0), p(u, y, 58), HOLZ_FUGE)
    iso.linie(p(0, y, 0), p(0, y, 58), BALKEN, 2)
    for z in (12, 46):
        iso.linie(p(-0.34, y, z), p(0.34, y, z), BALKEN, 3)
    iso.linie(p(-0.32, y, 14), p(-0.02, y, 44), BALKEN, 2)
    iso.linie(p(0.32, y, 14), p(0.02, y, 44), BALKEN, 2)
    iso.quader(0.34, 0.46, -0.07, 0.07, 0, 78, HOLZ, links=-40, rechts=-8)
    iso.quader(-0.54, 0.54, -0.09, 0.09, 78, 86, hell(HOLZ, -12))
    iso.satteldach(-0.54, 0.54, -0.2, 0.2, 86, 22, SCHINDEL, HOLZ, ueber=0.06)


def einfassung1(iso: Iso, fenster: list) -> None:
    """Palisade: angespitzte Holzpfähle mit Querriegel, an beiden Enden anschlussfähig."""
    p = iso.p
    n = 5
    for k in range(n):  # von hinten (kleines x) nach vorne
        x0 = -0.5 + k / n
        x1 = x0 + 1 / n - 0.02
        h = 48 + (k % 2) * 6
        iso.quader(x0, x1, -0.06, 0.06, 0, h, HOLZ, links=-40, rechts=-8)
        m = (x0 + x1) / 2
        iso.poly([p(x0, 0.06, h), p(x1, 0.06, h), p(m, 0.0, h + 12)], hell(HOLZ, -30), KONTUR)
        iso.poly([p(x1, 0.06, h), p(x1, -0.06, h), p(m, 0.0, h + 12)], hell(HOLZ, -6), KONTUR)
    iso.quader(-0.5, 0.5, 0.06, 0.1, 30, 36, hell(HOLZ, -20))


def ursprung1(iso: Iso, fenster: list) -> None:
    """Feuerstelle: Steinkreis mit Scheiten, Glut (Abend-Ebene), Sitzstamm."""
    schatten(iso, 0.45)
    p = iso.p
    cx, cy = p(-0.05, -0.05, 0)
    r = 0.26
    steine = []
    for k in range(10):
        a = 2 * math.pi * k / 10
        sx, sy = p(-0.05 + r * math.cos(a), -0.05 + r * math.sin(a), 0)
        steine.append((sy, sx))
    for sy, sx in sorted(steine):
        iso.d.ellipse([sx - 6, sy - 6, sx + 6, sy + 2], fill=hell(STEIN, -10), outline=KONTUR)
    glut = [(cx - 12, cy - 2), (cx + 12, cy - 2), (cx + 8, cy + 4), (cx - 8, cy + 4)]
    iso.poly(glut, (150, 60, 30))
    fenster.append(glut)
    # Scheite als kleines Zelt
    for dx in (-8, 0, 8):
        iso.linie((cx + dx, cy), (cx, cy - 22), BALKEN, 3)
    flamme = [(cx - 6, cy - 4), (cx, cy - 26), (cx + 6, cy - 4)]
    iso.poly(flamme, (240, 150, 50))
    fenster.append(flamme)
    # Sitzstamm vorne rechts
    iso.quader(0.12, 0.42, 0.22, 0.36, 0, 10, HOLZ, links=-40, rechts=-8)
    sx, sy = p(0.42, 0.29, 5)
    iso.d.ellipse([sx - 4, sy - 6, sx + 4, sy + 5], fill=hell(HOLZ, 40), outline=KONTUR)


def zeichen1(iso: Iso, fenster: list) -> None:
    """Holzmast mit Petrol-Banner und Emblem."""
    schatten(iso, 0.3)
    p = iso.p
    iso.quader(-0.2, 0.2, -0.2, 0.2, 0, 8, SOCKEL)
    iso.quader(-0.04, 0.04, -0.04, 0.04, 8, 124, HOLZ, links=-40, rechts=-8)
    iso.linie(p(-0.04, 0.0, 116), p(0.34, 0.0, 116), BALKEN, 3)
    # Banner hängt am Querholz, Fläche y = 0
    b = [p(0.02, 0.0, 114), p(0.32, 0.0, 114), p(0.32, 0.0, 62), p(0.17, 0.0, 72), p(0.02, 0.0, 62)]
    iso.poly(b, PETROL, KONTUR)
    m = p(0.17, 0.0, 96)
    iso.d.ellipse([m[0] - 6, m[1] - 7, m[0] + 6, m[1] + 5], fill=(244, 222, 140), outline=KONTUR)
    kopf = p(0.0, 0.0, 124)
    iso.d.ellipse([kopf[0] - 4, kopf[1] - 6, kopf[0] + 4, kopf[1] + 2], fill=(244, 222, 140), outline=KONTUR)


def flaeche1(iso: Iso, fenster: list) -> None:
    """Gartenbeet: Holzrahmen mit drei Reihen Pflanzen, Weg aus Trittsteinen."""
    p = iso.p
    iso.quader(-0.9, 0.9, -0.9, 0.5, 0, 10, HOLZ, ERDE, links=-40, rechts=-8)
    farben = [(214, 92, 92), (236, 200, 90), (150, 120, 210)]
    for r, yy in enumerate((-0.62, -0.2, 0.22)):
        for k in range(6):
            xx = -0.72 + k * 0.29
            m = p(xx, yy, 10)
            iso.d.ellipse([m[0] - 9, m[1] - 12, m[0] + 9, m[1] + 2], fill=hell(GRUEN, (k % 2) * 14 - 6), outline=KONTUR)
            if (k + r) % 2 == 0:
                iso.d.ellipse([m[0] - 3, m[1] - 12, m[0] + 3, m[1] - 6], fill=farben[r])
    for xx in (-0.6, -0.1, 0.4, 0.8):
        m = p(xx, 0.72, 0)
        iso.d.ellipse([m[0] - 9, m[1] - 4, m[0] + 9, m[1] + 4], fill=GRAU, outline=KONTUR)


def denkmal1(iso: Iso, fenster: list) -> None:
    """Steinsockel mit Figur in neutralem Grau (Gestalten färbt später, §3)."""
    schatten(iso, 0.4)
    p = iso.p
    iso.quader(-0.32, 0.32, -0.32, 0.32, 0, 10, hell(STEIN, -14))
    iso.quader(-0.24, 0.24, -0.24, 0.24, 10, 40, STEIN)
    iso.textur_stein(-0.24, 0.24, -0.24, 0.24, 10, 40, 10)
    iso.quader(-0.11, 0.11, -0.08, 0.08, 40, 92, GRAU, links=-30, rechts=-6)
    kopf = p(0.0, 0.0, 104)
    iso.d.ellipse([kopf[0] - 9, kopf[1] - 11, kopf[0] + 9, kopf[1] + 7], fill=hell(GRAU, 10), outline=KONTUR)
    iso.linie(p(0.11, 0.0, 84), p(0.2, 0.0, 120), hell(GRAU, -20), 5)  # erhobener Arm
    iso.linie(p(-0.11, 0.0, 84), p(-0.16, 0.0, 58), hell(GRAU, -30), 5)


# —— Umgebung am Inselrand (§12.7): Bäume, Busch, Stein ——————————————


def baum(iso: Iso, fenster: list, hoehe: int, r: float) -> None:
    schatten(iso, 0.42)
    iso.quader(-0.07, 0.07, -0.07, 0.07, 0, hoehe, HOLZ, links=-40, rechts=-8)
    m = iso.p(0, 0, hoehe + r * 0.6)
    krone(iso, m[0], m[1], r)


def baum_a(iso: Iso, fenster: list) -> None:
    baum(iso, fenster, 46, 30)


def baum_b(iso: Iso, fenster: list) -> None:
    baum(iso, fenster, 32, 23)


def busch(iso: Iso, fenster: list) -> None:
    schatten(iso, 0.38)
    m = iso.p(0, 0, 14)
    krone(iso, m[0], m[1], 15)


def stein(iso: Iso, fenster: list) -> None:
    schatten(iso, 0.36)
    iso.quader(-0.26, 0.22, -0.2, 0.24, 0, 12, SOCKEL)
    iso.quader(-0.1, 0.18, -0.16, 0.12, 12, 22, hell(SOCKEL, 10))


UMGEBUNG = [("baum_a", baum_a), ("baum_b", baum_b), ("busch", busch), ("stein", stein)]


# —— Wesen des Themas bastion (§12.7): Möwe, Fuchs, Wache, je 3 Ruhe-, 4 Geh-, 2 Reaktionsbilder ——

def moewe(zyklus: str, frame: int) -> Image.Image:
    w = Wesen()
    weiss, grau, gelb = (244, 242, 236), (150, 160, 170), (236, 176, 64)
    bob = [0, -0.6, 0][frame % 3] if zyklus == "idle" else 0.0
    hoch = -5 - frame * 2 if zyklus == "react" else 0.0
    y = bob + hoch
    wesen_bodenschatten(w, 9 if zyklus != "react" else 6)
    # Beine
    if zyklus != "react":
        schritt = [(-2, 2), (0, 0), (2, -2), (0, 0)][frame % 4] if zyklus == "walk" else (0, 0)
        w.strich((29 + schritt[0], 48 + y), (29 + schritt[0] * 1.5, 55), gelb, 1.4)
        w.strich((34 + schritt[1], 48 + y), (34 + schritt[1] * 1.5, 55), gelb, 1.4)
    # Körper (Licht von rechts oben: oben heller)
    w.form([(18, 42 + y), (24, 37 + y), (36, 36 + y), (42, 40 + y), (40, 47 + y), (30, 50 + y), (22, 47 + y)], hell(weiss, -18))
    w.form([(24, 38 + y), (36, 37 + y), (40, 40 + y), (34, 43 + y), (25, 42 + y)], weiss, kontur=False)
    # Kopf und Schnabel
    w.oval(36, 29 + y, 46, 39 + y, weiss)
    w.form([(45, 33 + y), (52, 34.5 + y), (45, 36 + y)], gelb)
    w.oval(41.5, 32 + y, 43.5, 34 + y, (30, 26, 22), kontur=False)
    # Flügel: in Ruhe angelegt, bei Reaktion hochgeschlagen
    if zyklus == "react":
        w.form([(24, 40 + y), (14, 24 + y - frame * 3), (22, 26 + y), (34, 38 + y)], grau)
    else:
        auf = 1.5 if zyklus == "walk" and frame % 2 else 0
        w.form([(20, 41 + y), (30, 38 + y - auf), (38, 41 + y), (30, 45 + y), (16, 44 + y)], grau)
        w.form([(16, 44 + y), (11, 46 + y), (18, 46 + y)], hell(grau, -40))
    return w.fertig()


def fuchs(zyklus: str, frame: int) -> Image.Image:
    w = Wesen()
    rot, hellrot, creme, dunkel = (204, 112, 52), (226, 146, 84), (244, 232, 210), (70, 48, 34)
    bob = [0, -0.5, 0][frame % 3] if zyklus == "idle" else 0.0
    y = bob
    wesen_bodenschatten(w, 13)
    sitzt = zyklus == "react"
    if sitzt:
        # sitzt aufrecht, Schwanz um die Pfoten, Ohren gespitzt
        w.form([(16, 54), (10, 48), (12, 42), (22, 44), (30, 54)], rot)
        w.form([(10, 48), (8, 45), (12, 43)], creme)
        w.form([(24, 54), (22, 40), (28, 30), (36, 31), (38, 42), (36, 54)], rot)
        w.form([(30, 34), (35, 33), (36, 44), (31, 50)], creme, kontur=False)
        w.strich((28, 50), (28, 55), dunkel, 2.2)
        w.strich((34, 50), (34, 55), dunkel, 2.2)
        kx, ky = 33, 22 - frame
    else:
        schritt = [(-2.5, 2.5), (0, 0), (2.5, -2.5), (0, 0)][frame % 4] if zyklus == "walk" else (0, 0)
        # Schwanz buschig nach hinten oben, weiße Spitze
        wedel = (frame % 2) * 1.5 if zyklus == "walk" else 0
        w.form([(17, 41 + y), (8, 36 + y - wedel), (4, 30 + y - wedel), (9, 31 + y - wedel), (15, 36 + y), (20, 38 + y)], rot)
        w.form([(4, 30 + y - wedel), (6, 28 + y - wedel), (9, 31 + y - wedel)], creme)
        # Beine (hinten dunkler)
        for bx, sv, ton in ((20, schritt[1], hell(dunkel, -10)), (24, schritt[0], dunkel), (36, schritt[0], hell(dunkel, -10)), (40, schritt[1], dunkel)):
            w.strich((bx, 45 + y), (bx + sv, 55), ton, 2.2)
        # Körper
        w.form([(16, 40 + y), (22, 35 + y), (38, 35 + y), (44, 39 + y), (42, 46 + y), (20, 47 + y)], rot)
        w.form([(22, 36 + y), (38, 36 + y), (42, 39 + y), (24, 40 + y)], hellrot, kontur=False)
        w.form([(34, 44 + y), (42, 42 + y), (43, 46 + y), (36, 47 + y)], creme, kontur=False)
        kx, ky = 44, 30 + y
    # Kopf mit spitzer Schnauze, Ohren mit dunklen Spitzen
    w.form([(kx - 6, ky + 2), (kx - 4, ky - 4), (kx + 3, ky - 5), (kx + 6, ky), (kx + 12, ky + 4), (kx + 6, ky + 7), (kx - 3, ky + 7)], rot)
    w.form([(kx + 1, ky + 3), (kx + 12, ky + 4), (kx + 6, ky + 7), (kx, ky + 7)], creme, kontur=False)
    w.oval(kx + 11, ky + 2.8, kx + 13.4, ky + 5.2, dunkel, kontur=False)
    w.oval(kx + 3, ky - 1, kx + 5, ky + 1, (30, 26, 22), kontur=False)
    for ox in (-4, 1):
        w.form([(kx + ox, ky - 3), (kx + ox + 2, ky - 11), (kx + ox + 5, ky - 3)], rot)
        w.form([(kx + ox + 1.2, ky - 8), (kx + ox + 2, ky - 11), (kx + ox + 3, ky - 8)], dunkel, kontur=False)
    return w.fertig()


def wache(zyklus: str, frame: int) -> Image.Image:
    w = Wesen()
    haut, stahl, tunika, gurt, hose = (230, 200, 168), (150, 160, 172), PETROL, (92, 62, 40), (96, 74, 56)
    bob = [0, -0.6, 0][frame % 3] if zyklus == "idle" else 0.0
    y = bob
    wesen_bodenschatten(w, 8)
    schritt = [(-3, 3), (0, 0), (3, -3), (0, 0)][frame % 4] if zyklus == "walk" else (0, 0)
    # Beine und Stiefel
    for bx, sv in ((28, schritt[0]), (35, schritt[1])):
        w.strich((bx, 42 + y), (bx + sv, 53), hose, 3.2)
        w.oval(bx + sv - 2.5, 51.5, bx + sv + 3, 55.5, (60, 42, 30), kontur=False)
    # Tunika mit Gürtel
    w.form([(24, 44 + y), (25, 27 + y), (38, 27 + y), (40, 44 + y)], tunika)
    w.form([(32, 28 + y), (38, 27 + y), (40, 44 + y), (34, 44 + y)], hell(tunika, 22), kontur=False)
    w.strich((25, 36 + y), (39, 36 + y), gurt, 2.2)
    # Arm: winkt bei Reaktion, sonst am Körper
    if zyklus == "react":
        w.strich((26, 29 + y), (20, 18 + y - frame * 2), tunika, 3.2)
        w.oval(17.5, 14 + y - frame * 2, 22.5, 19 + y - frame * 2, haut)
    else:
        w.strich((26, 29 + y), (24, 39 + y), hell(tunika, -20), 3.2)
    # Kopf mit Helm
    w.oval(26.5, 15 + y, 37.5, 27 + y, haut)
    w.form([(25.5, 21 + y), (26.5, 15 + y), (31.5, 12 + y), (37, 15 + y), (38.5, 21 + y)], stahl)
    w.form([(31.5, 12 + y), (37, 15 + y), (38.5, 21 + y), (33, 21 + y)], hell(stahl, 26), kontur=False)
    w.oval(34, 21.5 + y, 35.6, 23.1 + y, (30, 26, 22), kontur=False)
    # rundes Schild vorne, dekorativ, keine Waffe
    w.oval(35, 28 + y, 47, 42 + y, tunika)
    w.oval(37.5, 30.5 + y, 44.5, 39.5 + y, PETROL_HELL, kontur=False)
    w.oval(40, 33.5 + y, 42.5, 36.5 + y, (244, 222, 140), kontur=False)
    return w.fertig()


WESEN = {"moewe": moewe, "fuchs": fuchs, "wache": wache}


def erzeuge(stufe: int) -> tuple[Image.Image, Image.Image]:
    return erzeuge_mit({1: stufe1, 2: stufe2, 3: stufe3}[stufe], 3, BREITE)


# Erneuerte Gebäude: Rolle, Stufe, Zeichnung, Felder (n×n), Bildbreite (wie P3: n·96 + 8)
GEBAEUDE = [
    ("kern", 1, stufe1, 3, BREITE),
    ("kern", 2, stufe2, 3, BREITE),
    ("kern", 3, stufe3, 3, BREITE),
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
    return schreibe_atlas("bastion", GEBAEUDE, UMGEBUNG, WESEN)


if __name__ == "__main__":
    sys.exit(main())
