#!/usr/bin/env python3
"""G3: Gebäude Thema `bastion`, Epoche 1 (FOKUS.md Paket G).
Charge 1: Bergfried (Stufen 1–3). Charge 2: Studierstube und Späherturm (Stufen 1–2).
Charge 3: Werkstatt, Tor, Palisade, Feuerstelle, Banner, Gartenbeet, Statue.
Umgebung: Bäume, Busch und Stein für den Inselrand (`umgebung/bastion/`).

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

import json
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw

HW, HH = 48, 24  # halbe Rautenbreite/-höhe je Feld (2×)
BREITE, ROH_H = 296, 560

KONTUR = (43, 38, 32, 120)
STEIN = (176, 164, 146)
STEIN_FUGE = (120, 108, 94)
SOCKEL = (150, 138, 122)
HOLZ = (150, 104, 64)
HOLZ_FUGE = (104, 70, 42)
PUTZ = (236, 226, 204)
BALKEN = (92, 62, 40)
SCHINDEL = (112, 82, 58)
ZIEGEL = (196, 96, 58)
PETROL = (31, 122, 114)
PETROL_HELL = (61, 190, 165)
FENSTER_TAG = (58, 42, 22)
FENSTER_ABEND = (255, 200, 90)


def hell(c: tuple[int, int, int], d: int) -> tuple[int, int, int]:
    return tuple(max(0, min(255, v + d)) for v in c)  # type: ignore[return-value]


class Iso:
    def __init__(self, bild: Image.Image, n: int = 3) -> None:
        self.d = ImageDraw.Draw(bild)
        self.cx = bild.width / 2
        self.cy0 = bild.height - 4 - n * HH  # Mitte des n×n-Fußabdrucks

    def p(self, x: float, y: float, z: float) -> tuple[float, float]:
        return (self.cx + (x - y) * HW, self.cy0 + (x + y) * HH - z)

    def poly(self, pts, farbe, kontur=None) -> None:
        self.d.polygon([(round(a), round(b)) for a, b in pts], fill=farbe, outline=kontur)

    def linie(self, a, b, farbe, w: int = 1) -> None:
        self.d.line([tuple(map(round, a)), tuple(map(round, b))], fill=farbe, width=w)

    # —— Grundkörper ——
    def quader(self, x0, x1, y0, y1, z0, z1, wand, dach=None, *, links=-34, rechts=-12) -> None:
        p = self.p
        self.poly([p(x0, y1, z0), p(x1, y1, z0), p(x1, y1, z1), p(x0, y1, z1)], hell(wand, links))
        self.poly([p(x1, y0, z0), p(x1, y1, z0), p(x1, y1, z1), p(x1, y0, z1)], hell(wand, rechts))
        self.poly([p(x0, y0, z1), p(x1, y0, z1), p(x1, y1, z1), p(x0, y1, z1)], dach or hell(wand, 14))
        for a, b in [((x0, y1, z0), (x1, y1, z0)), ((x1, y1, z0), (x1, y0, z0)), ((x1, y1, z0), (x1, y1, z1))]:
            self.linie(p(*a), p(*b), KONTUR)

    def textur_stein(self, x0, x1, y0, y1, z0, z1, schritt=14) -> None:
        p = self.p
        for i, z in enumerate(range(int(z0) + schritt, int(z1), schritt)):
            self.linie(p(x0, y1, z), p(x1, y1, z), hell(STEIN_FUGE, -10))
            self.linie(p(x1, y1, z), p(x1, y0, z), STEIN_FUGE)
            versatz = 0.5 if i % 2 else 0.0
            for k in range(4):
                u = (k + versatz) / 4
                zo = min(z + schritt, z1)
                self.linie(p(x0 + (x1 - x0) * u, y1, z), p(x0 + (x1 - x0) * u, y1, zo), hell(STEIN_FUGE, -10))
                self.linie(p(x1, y1 - (y1 - y0) * u, z), p(x1, y1 - (y1 - y0) * u, zo), STEIN_FUGE)

    def textur_holz(self, x0, x1, y0, y1, z0, z1, n=7) -> None:
        p = self.p
        for k in range(1, n):
            u = k / n
            self.linie(p(x0 + (x1 - x0) * u, y1, z0), p(x0 + (x1 - x0) * u, y1, z1), HOLZ_FUGE)
            self.linie(p(x1, y1 - (y1 - y0) * u, z0), p(x1, y1 - (y1 - y0) * u, z1), hell(HOLZ_FUGE, 12))

    def textur_fachwerk(self, x0, x1, y0, y1, z0, z1) -> None:
        p = self.p
        zm = (z0 + z1) / 2
        for fl in ("l", "r"):
            def q(u, z):
                return p(x0 + (x1 - x0) * u, y1, z) if fl == "l" else p(x1, y1 - (y1 - y0) * u, z)

            for z in (z0 + 2, zm, z1 - 2):
                self.linie(q(0, z), q(1, z), BALKEN, 3)
            for u in (0.02, 0.33, 0.67, 0.98):
                self.linie(q(u, z0), q(u, z1), BALKEN, 3)
            self.linie(q(0.02, zm), q(0.33, z1 - 2), BALKEN, 2)
            self.linie(q(0.67, z1 - 2), q(0.98, zm), BALKEN, 2)

    def pyramide(self, x0, x1, y0, y1, z, h, farbe, *, ueber=0.12) -> tuple[float, float]:
        x0, x1, y0, y1 = x0 - ueber, x1 + ueber, y0 - ueber, y1 + ueber
        mx, my = (x0 + x1) / 2, (y0 + y1) / 2
        p = self.p
        spitze = p(mx, my, z + h)
        self.poly([p(x0, y1, z), p(x1, y1, z), spitze], hell(farbe, -22), KONTUR)
        self.poly([p(x1, y1, z), p(x1, y0, z), spitze], hell(farbe, 16), KONTUR)
        # Ziegelreihen
        for t in (0.25, 0.5, 0.75):
            a = lambda q: (q[0] + (spitze[0] - q[0]) * t, q[1] + (spitze[1] - q[1]) * t)  # noqa: E731
            self.linie(a(p(x0, y1, z)), a(p(x1, y1, z)), hell(farbe, -40))
            self.linie(a(p(x1, y1, z)), a(p(x1, y0, z)), hell(farbe, -6))
        return spitze

    def satteldach(self, x0, x1, y0, y1, z, h, farbe, giebel, *, ueber=0.12) -> tuple[float, float]:
        """Satteldach, First parallel zur x-Achse. Sichtbar: vordere Dachfläche (+y) und der
        Giebel rechts (x1). Gibt die Mitte des Firsts zurück."""
        p = self.p
        ym = (y0 + y1) / 2
        a, b = x0 - ueber, x1 + ueber
        # hintere Dachfläche zuerst: von ihr bleibt rechts nur die Kante über dem Giebel sichtbar
        self.poly([p(a, ym, z + h), p(b, ym, z + h), p(b, y0 - ueber, z - 4), p(a, y0 - ueber, z - 4)], hell(farbe, 8), KONTUR)
        # Giebel rechts in Wandfarbe (rechte Fläche, heller)
        self.poly([p(x1, y1, z), p(x1, y0, z), p(x1, ym, z + h)], hell(giebel, -12), KONTUR)
        vorne = [p(a, y1 + ueber, z - 4), p(b, y1 + ueber, z - 4), p(b, ym, z + h), p(a, ym, z + h)]
        self.poly(vorne, hell(farbe, -18), KONTUR)
        for t in (0.25, 0.5, 0.75):
            yy = y1 + ueber + (ym - y1 - ueber) * t
            self.linie(p(a, yy, z - 4 + (h + 4) * t), p(b, yy, z - 4 + (h + 4) * t), hell(farbe, -40))
        return p((x0 + x1) / 2, ym, z + h)

    def zylinder(self, x, y, r, z0, z1, wand, *, stein=True) -> None:
        cxs, cys = self.p(x, y, 0)
        rx, ry = r * HW * math.sqrt(2), r * HH * math.sqrt(2)
        n = 24
        for i in range(n):  # senkrechte Streifen, links dunkler (Licht von rechts)
            a0, a1 = math.pi * i / n, math.pi * (i + 1) / n
            xa, xb = cxs - rx * math.cos(a0), cxs - rx * math.cos(a1)
            ya, yb = cys + ry * math.sin(a0), cys + ry * math.sin(a1)
            ton = hell(wand, int(-40 + 46 * (i / n)))
            self.poly([(xa, ya - z0), (xb, yb - z0), (xb, yb - z1), (xa, ya - z1)], ton)
        if stein:
            for z in range(int(z0) + 14, int(z1), 14):
                self.d.arc([cxs - rx, cys - ry - z, cxs + rx, cys + ry - z], 0, 180, fill=STEIN_FUGE)
        self.d.ellipse([cxs - rx, cys - ry - z1, cxs + rx, cys + ry - z1], fill=hell(wand, 12), outline=KONTUR)

    def kegel(self, x, y, r, z, h, farbe) -> tuple[float, float]:
        cxs, cys = self.p(x, y, 0)
        rx, ry = r * HW * math.sqrt(2), r * HH * math.sqrt(2)
        spitze = (cxs, cys - z - h)
        n = 20
        for i in range(n):
            a0, a1 = math.pi * i / n, math.pi * (i + 1) / n
            pa = (cxs - rx * math.cos(a0), cys + ry * math.sin(a0) - z)
            pb = (cxs - rx * math.cos(a1), cys + ry * math.sin(a1) - z)
            self.poly([pa, pb, spitze], hell(farbe, int(-30 + 44 * (i / n))))
        self.d.arc([cxs - rx, cys - ry - z, cxs + rx, cys + ry - z], 0, 180, fill=KONTUR)
        return spitze

    def zinnen(self, x0, x1, y0, y1, z, h, farbe, n=4) -> None:
        """Brüstung mit Zinnen: hintere Kanten zuerst, dann vordere."""
        w = 0.14
        hinten, vorne = [], []
        for k in range(n):
            u0 = x0 + (x1 - x0) * k / n
            v0 = y0 + (y1 - y0) * k / n
            hinten.append((u0, u0 + (x1 - x0) / n * 0.55, y0, y0 + w))
            hinten.append((x0, x0 + w, v0, v0 + (y1 - y0) / n * 0.55))
            vorne.append((u0 + (x1 - x0) / n * 0.45, u0 + (x1 - x0) / n, y1 - w, y1))
            vorne.append((x1 - w, x1, v0 + (y1 - y0) / n * 0.45, v0 + (y1 - y0) / n))
        for a, b, c, d in hinten:
            self.quader(a, b, c, d, z, z + h, farbe)
        self.quader(x0, x1, y0, y1, z - 6, z, farbe, hell(farbe, -30))
        for a, b, c, d in sorted(vorne, key=lambda q: q[1] + q[3]):
            self.quader(a, b, c, d, z, z + h, farbe)

    def fenster_l(self, x, y, z, b=0.16, h=22, *, farbe=FENSTER_TAG, bogen=True) -> list:
        """Fenster auf der linken Fläche (y fest), Mitte x, Unterkante z."""
        p = self.p
        pts = [p(x - b / 2, y, z), p(x + b / 2, y, z), p(x + b / 2, y, z + h)]
        if bogen:
            for t in range(1, 6):
                a = math.pi * t / 6
                pts.append(p(x + b / 2 * math.cos(a), y, z + h + b * 26 * math.sin(a)))
        pts.append(p(x - b / 2, y, z + h))
        self.poly(pts, farbe, KONTUR)
        return pts

    def fenster_r(self, x, y, z, b=0.16, h=22, *, farbe=FENSTER_TAG, bogen=True) -> list:
        p = self.p
        pts = [p(x, y + b / 2, z), p(x, y - b / 2, z), p(x, y - b / 2, z + h)]
        if bogen:
            for t in range(1, 6):
                a = math.pi * t / 6
                pts.append(p(x, y - b / 2 * math.cos(a), z + h + b * 26 * math.sin(a)))
        pts.append(p(x, y + b / 2, z + h))
        self.poly(pts, farbe, KONTUR)
        return pts

    def fahne(self, fuss: tuple[float, float], hoehe: float, farbe) -> None:
        x, y = fuss
        self.linie((x, y), (x, y - hoehe), (244, 239, 228), 3)
        self.poly([(x + 1, y - hoehe), (x + 30, y - hoehe + 8), (x + 1, y - hoehe + 18)], farbe, KONTUR)

    def banner_r(self, x, y, z_oben, laenge, farbe) -> None:
        p = self.p
        b = 0.22
        oben_a, oben_b = p(x, y + b / 2, z_oben), p(x, y - b / 2, z_oben)
        unten_m = p(x, y, z_oben - laenge - 10)
        self.poly(
            [oben_a, oben_b, p(x, y - b / 2, z_oben - laenge), unten_m, p(x, y + b / 2, z_oben - laenge)],
            farbe,
            KONTUR,
        )
        m = p(x, y, z_oben - laenge * 0.45)
        self.d.ellipse([m[0] - 5, m[1] - 6, m[0] + 5, m[1] + 4], fill=(244, 222, 140))


def schatten(iso: Iso, r: float) -> None:
    p = iso.p
    iso.poly([p(-r, -r, 0), p(r, -r, 0), p(r, r, 0), p(-r, r, 0)], (0, 0, 0, 40))


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
        fenster.append(iso.fenster_l(-0.3, 0.82, z))
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

GRUEN = (92, 140, 64)
ERDE = (96, 70, 48)
GRAU = (168, 166, 160)


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

LAUB = (92, 140, 64)


def krone(iso: Iso, mx: float, my: float, r: float) -> None:
    """Laubkrone als Kugel aus drei Tönen (links dunkel, rechts hell), Kontur nur am Rand."""
    d = iso.d
    teile = [(-0.55, 0.15, 0.75), (0.5, 0.2, 0.7), (0.0, -0.35, 0.85), (0.0, 0.25, 0.9)]
    for dx, dy, f in teile:  # Umriss: alle Teile etwas größer in Konturfarbe
        rr = r * f + 1.5
        d.ellipse([mx + dx * r - rr, my + dy * r - rr, mx + dx * r + rr, my + dy * r + rr], fill=KONTUR)
    for dx, dy, f in teile:
        rr = r * f
        d.ellipse([mx + dx * r - rr, my + dy * r - rr, mx + dx * r + rr, my + dy * r + rr], fill=hell(LAUB, -26))
    for dx, dy, f in teile:  # mittlerer Ton nach rechts oben versetzt
        rr = r * f * 0.72
        cx, cy = mx + dx * r + r * 0.16, my + dy * r - r * 0.14
        d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=LAUB)
    for dx, dy, f in teile[1:3]:  # Licht von rechts oben
        rr = r * f * 0.38
        cx, cy = mx + dx * r + r * 0.3, my + dy * r - r * 0.3
        d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=hell(LAUB, 26))


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


def erzeuge_mit(zeichne, n: int, breite: int) -> tuple[Image.Image, Image.Image]:
    """Zeichnet ein Gebäude mit n×n Feldern; schneidet oben den leeren Rand ab."""
    bild = Image.new("RGBA", (breite, ROH_H), (0, 0, 0, 0))
    iso = Iso(bild, n)
    fenster: list = []
    zeichne(iso, fenster)
    abend = Image.new("RGBA", bild.size, (0, 0, 0, 0))
    da = ImageDraw.Draw(abend)
    for pts in fenster:
        if pts:
            da.polygon([(round(a), round(b)) for a, b in pts], fill=FENSTER_ABEND)
    box = bild.getbbox()
    assert box
    oben = max(0, box[1] - 4)
    return bild.crop((0, oben, breite, ROH_H)), abend.crop((0, oben, breite, ROH_H))


def erzeuge(stufe: int) -> tuple[Image.Image, Image.Image]:
    return erzeuge_mit({1: stufe1, 2: stufe2, 3: stufe3}[stufe], 3, BREITE)


WURZEL = Path(__file__).resolve().parents[2]
ATLAS = WURZEL / "public" / "grafik" / "atlas"


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
    manifest_pfad = ATLAS / "manifest.json"
    manifest = json.loads(manifest_pfad.read_text(encoding="utf-8"))
    neu: dict[str, dict] = {}
    for rolle, stufe, zeichne, n, breite in GEBAEUDE:
        bild, abend = erzeuge_mit(zeichne, n, breite)
        bilder = [(f"{rolle}_s{stufe}", bild)]
        if abend.getbbox():  # Abend-Ebene nur, wo etwas leuchtet
            bilder.append((f"{rolle}_s{stufe}_fenster", abend))
        for name, b in bilder:
            rel = f"gebaeude/bastion/e1/{name}.png"
            pfad = ATLAS / rel
            pfad.parent.mkdir(parents=True, exist_ok=True)
            b.save(pfad, "PNG", optimize=True)
            neu[f"bastion/e1/{name}"] = {
                "id": f"bastion/e1/{name}",
                "datei": rel,
                "felder": [n, n],
                "anker": {"x": 0.5, "y": 1.0},
                "pixel": {"w": b.width, "h": b.height},
            }
    for name, zeichne in UMGEBUNG:
        bild, _ = erzeuge_mit(zeichne, 1, 104)
        rel = f"umgebung/bastion/{name}.png"
        pfad = ATLAS / rel
        pfad.parent.mkdir(parents=True, exist_ok=True)
        bild.save(pfad, "PNG", optimize=True)
        neu[f"bastion/umgebung/{name}"] = {
            "id": f"bastion/umgebung/{name}",
            "datei": rel,
            "felder": [1, 1],
            "anker": {"x": 0.5, "y": 1.0},
            "pixel": {"w": bild.width, "h": bild.height},
        }
    gesehen = set()
    eintraege = []
    for e in manifest["eintraege"]:
        if e["id"] in neu:
            eintraege.append(neu[e["id"]])
            gesehen.add(e["id"])
        else:
            eintraege.append(e)
    eintraege.extend(v for k, v in neu.items() if k not in gesehen)
    manifest["eintraege"] = eintraege
    manifest_pfad.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for k, v in neu.items():
        print(k, v["pixel"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
