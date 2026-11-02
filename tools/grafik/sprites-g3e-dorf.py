#!/usr/bin/env python3
"""G3 Epochen 2–4, Thema `dorf` (GRAFIK-SPRITES.md §12.11, Entscheidung PV 02.11.2026).

Neue Stufen, je in der Epoche, in der sie zuerst baubar sind (eine Stufe, ein Bild):
  Epoche 2 (Dorf):          Gemeindehaus 4–5, Bücherei 3, Windmühle 3, Schreinerei 2, Brücke 2
  Epoche 3 (Marktstadt):    Gemeindehaus 6–7, Bücherei 4, Windmühle 4, Schreinerei 3
  Epoche 4 (Residenzstadt): Gemeindehaus 8–9, Bücherei 5, Windmühle 5

Materialleiter ab Epoche 2: Bruchstein mit Schieferdach (Fachwerk mit Ziegel nur noch
für Bürgerhäuser), ab Stufe 8 Kupfer (Grünspan). Das Rathaus aus Stufe 3 wächst zum
Marktplatz-Ensemble (freistehender Uhrturm, Treppengiebel, Bürgerhäuser, Kirchturm)
und zur Residenz (Kupferkuppel, Pavillons). Höhe je Stufe gut 8 % (§12.11).
Aufruf: python3 tools/grafik/sprites-g3e-dorf.py
Deterministisch, ohne Zufall.
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from g3_stil import (  # noqa: E402
    BALKEN,
    BREITE,
    FENSTER_TAG,
    GOLD_MATT,
    HH,
    HOLZ,
    HOLZ_FUGE,
    HW,
    KONTUR,
    KUPFER,
    PETROL,
    PETROL_HELL,
    PUTZ,
    SCHIEFER,
    STEIN,
    ZIEGEL,
    Iso,
    hell,
    kuppel,
    schatten,
    schreibe_epochen,
)

TUER = (70, 46, 28)
WASSER = (98, 160, 196)
ZIFFERBLATT = (244, 239, 228)
SEGEL = (240, 232, 214)


# —— Bauteile ——————————————————————————————————————————————


def uhr(iso: Iso, m: tuple[float, float], r: float = 13) -> None:
    iso.d.ellipse([m[0] - r, m[1] - r, m[0] + r, m[1] + r], fill=ZIFFERBLATT, outline=KONTUR)
    iso.linie(m, (m[0], m[1] - r * 0.7), (43, 38, 32), 2)
    iso.linie(m, (m[0] + r * 0.45, m[1] + r * 0.15), (43, 38, 32), 2)


def treppengiebel(iso: Iso, x, y0, y1, z, h, farbe=STEIN, stufen=4) -> None:
    """Stufengiebel auf der rechten Fläche (x fest), über dem Dachansatz z, Höhe h."""
    p = iso.p
    ym = (y0 + y1) / 2
    pts = [p(x, y1, z)]
    for k in range(stufen):
        t0, t1 = k / stufen, (k + 1) / stufen
        yy = y1 + (ym - y1) * t1
        zz = z + h * t1
        pts += [p(x, y1 + (ym - y1) * t0, zz), p(x, yy, zz)]
    pts += [p(x, ym - 0.06, z + h + 12), p(x, ym + 0.06, z + h + 12)]
    for k in range(stufen - 1, -1, -1):
        t0, t1 = k / stufen, (k + 1) / stufen
        zz = z + h * t1
        pts += [p(x, y0 + (ym - y0) * t1, zz), p(x, y0 + (ym - y0) * t0, zz)]
    pts.append(p(x, y0, z))
    iso.poly(pts, hell(farbe, -12), KONTUR)


def turmhelm(iso: Iso, fenster: list, x0, x1, y0, y1, z, art: str, dach) -> tuple[float, float]:
    """Abschluss eines Vierkantturms: helm | haube | kuppel | spitze. Gibt die Spitze zurück."""
    mx, my = (x0 + x1) / 2, (y0 + y1) / 2
    r = (x1 - x0) / 2
    if art == "helm":
        return iso.pyramide(x0, x1, y0, y1, z, 110, dach, ueber=0.08)
    if art == "haube":  # welsche Haube: Zwiebel, Laterne, kleine Spitze
        oben = kuppel(iso, mx, my, r * 1.05, z, 44, dach)
        lx, ly = oben
        iso.poly([(lx - 7, ly + 2), (lx + 7, ly + 2), (lx + 7, ly - 22), (lx - 7, ly - 22)], hell(STEIN, 6), KONTUR)
        lat = [(lx - 3, ly - 3), (lx + 3, ly - 3), (lx + 3, ly - 17), (lx - 3, ly - 17)]
        iso.poly(lat, FENSTER_TAG, KONTUR)
        fenster.append(lat)
        oben2 = kuppel(iso, mx, my, r * 0.42, z + 44 + 22 + (r * HH * math.sqrt(2) * 0.42), 22, dach)
        iso.poly([(oben2[0] - 5, oben2[1] + 2), (oben2[0] + 5, oben2[1] + 2), (oben2[0], oben2[1] - 46)], hell(dach, -6), KONTUR)
        return (oben2[0], oben2[1] - 46)
    # kuppel / spitze: Tambour, Kuppel, Laterne, Spitze
    iso.zylinder(mx, my, r * 0.92, z, z + 30, STEIN, stein=False)
    oben = kuppel(iso, mx, my, r * 1.0, z + 30, 56, dach, rippen=5)
    lx, ly = oben
    lh = 26 if art == "kuppel" else 34
    iso.poly([(lx - 8, ly + 2), (lx + 8, ly + 2), (lx + 8, ly - lh), (lx - 8, ly - lh)], hell(STEIN, 6), KONTUR)
    lat = [(lx - 4, ly - 4), (lx + 4, ly - 4), (lx + 4, ly - lh + 6), (lx - 4, ly - lh + 6)]
    iso.poly(lat, FENSTER_TAG, KONTUR)
    fenster.append(lat)
    sp = 36 if art == "kuppel" else 110
    iso.poly([(lx - 9, ly - lh), (lx + 9, ly - lh), (lx, ly - lh - sp)], hell(dach, -6), KONTUR)
    iso.d.ellipse([lx - 4, ly - lh - sp - 6, lx + 4, ly - lh - sp + 2], fill=GOLD_MATT, outline=KONTUR)
    return (lx, ly - lh - sp - 4)


def buergerhaus(iso: Iso, fenster: list, x0, x1, y0, y1, h, dach=ZIEGEL) -> None:
    """Schmales Fachwerk-Bürgerhaus auf Steinsockel, steiles Satteldach."""
    iso.quader(x0, x1, y0, y1, 0, 34, STEIN)
    iso.textur_stein(x0, x1, y0, y1, 0, 34, 11)
    iso.quader(x0, x1, y0, y1, 34, h, PUTZ, links=-30, rechts=-6)
    for z0 in range(34, h - 10, 46):
        iso.textur_fachwerk(x0, x1, y0, y1, z0, min(z0 + 46, h))
        fenster.append(iso.fenster_l((x0 + x1) / 2, y1, z0 + 12, b=0.16, h=20, bogen=False))
        fenster.append(iso.fenster_r(x1, (y0 + y1) / 2, z0 + 12, b=0.16, h=20, bogen=False))
    iso.satteldach(x0, x1, y0, y1, h, 74, dach, PUTZ, ueber=0.08)


def vierkantturm(iso: Iso, fenster: list, x0, x1, y0, y1, h, art, dach, *, uhr_z=None, galerie=False) -> tuple[float, float]:
    iso.quader(x0, x1, y0, y1, 0, h, STEIN)
    iso.textur_stein(x0, x1, y0, y1, 0, h, 12)
    mx, my = (x0 + x1) / 2, (y0 + y1) / 2
    for z in range(60, h - 70, 64):
        fenster.append(iso.fenster_l(mx, y1, z, b=0.14, h=22))
        fenster.append(iso.fenster_r(x1, my, z, b=0.14, h=22))
    uz = uhr_z or h - 40
    uhr(iso, iso.p(mx, y1, uz))
    uhr(iso, iso.p(x1, my, uz))
    if galerie:  # Umgang mit Brüstung
        iso.quader(x0 - 0.08, x1 + 0.08, y0 - 0.08, y1 + 0.08, h, h + 6, hell(STEIN, -12))
        for k in range(4):
            u = x0 - 0.08 + (x1 - x0 + 0.16) * (k + 0.5) / 4
            iso.quader(u - 0.03, u + 0.03, y1 + 0.02, y1 + 0.08, h + 6, h + 20, hell(STEIN, -4))
            v = y0 - 0.08 + (y1 - y0 + 0.16) * (k + 0.5) / 4
            iso.quader(x1 + 0.02, x1 + 0.08, v - 0.03, v + 0.03, h + 6, h + 20, hell(STEIN, -4))
        iso.quader(x0 - 0.08, x1 + 0.08, y1 + 0.04, y1 + 0.08, h + 20, h + 24, hell(STEIN, -12))
        iso.quader(x1 + 0.04, x1 + 0.08, y0 - 0.08, y1 + 0.08, h + 20, h + 24, hell(STEIN, -12))
        # Glockenstube über dem Umgang
        a = (x1 - x0) * 0.16
        iso.quader(x0 + a, x1 - a, y0 + a, y1 - a, h + 6, h + 56, STEIN)
        fenster.append(iso.fenster_l(mx, y1 - a, h + 16, b=0.14, h=24))
        fenster.append(iso.fenster_r(x1 - a, my, h + 16, b=0.14, h=24))
        return turmhelm(iso, fenster, x0 + a, x1 - a, y0 + a, y1 - a, h + 56, art, dach)
    iso.quader(x0 - 0.05, x1 + 0.05, y0 - 0.05, y1 + 0.05, h, h + 6, hell(STEIN, -12))
    return turmhelm(iso, fenster, x0, x1, y0, y1, h + 6, art, dach)


# —— Gemeindehaus (kern, 3×3): Rathaus → Marktplatz → Residenz ——————————————

PLAN = {
    4: dict(hh=150, turm=330, art="helm", treppe=False, buerger=0, kirche=0, pavillon=False, gal=False),
    5: dict(hh=150, turm=356, art="haube", treppe=True, buerger=1, kirche=0, pavillon=False, gal=False),
    6: dict(hh=170, turm=420, art="haube", treppe=True, buerger=2, kirche=0, pavillon=False, gal=True),
    7: dict(hh=170, turm=506, art="helm", treppe=True, buerger=2, kirche=330, pavillon=False, gal=True),
    8: dict(hh=190, turm=530, art="kuppel", treppe=False, buerger=2, kirche=350, pavillon=True, gal=True),
    9: dict(hh=236, turm=536, art="spitze", treppe=False, buerger=2, kirche=420, pavillon=True, gal=True),
}


def gemeindehaus(iso: Iso, fenster: list, stufe: int) -> None:
    b = PLAN[stufe]
    dach = KUPFER if stufe >= 8 else SCHIEFER
    hh = b["hh"]
    schatten(iso, 1.5)
    # —— hinten: Kirchturm (hinten links), Bürgerhäuser (hinten rechts) ——
    if b["kirche"]:
        sp = vierkantturm(iso, fenster, -1.4, -0.95, -1.4, -0.95, b["kirche"] - 130, "helm" if stufe < 8 else "spitze", dach)
        iso.fahne(sp, 30, PETROL_HELL)
    if b["buerger"] >= 2:
        buergerhaus(iso, fenster, -1.42, -0.98, -0.85, -0.05, 196)
    if b["buerger"] >= 1:
        buergerhaus(iso, fenster, -1.42, -0.98, 0.1, 1.1, 128)
    # —— Uhrturm rechts, frei stehend ——
    sp = vierkantturm(iso, fenster, 0.62, 1.34, -1.34, -0.62, b["turm"] - (56 if b["gal"] else 0), b["art"], dach, galerie=b["gal"])
    iso.fahne(sp, 40, PETROL_HELL)
    # —— Hauptbau ——
    x0, x1, y0, y1 = -0.9, 0.55, -0.75, 1.05
    iso.quader(x0, x1, y0, y1, 0, hh, STEIN)
    iso.textur_stein(x0, x1, y0, y1, 0, hh)
    iso.quader(x0 - 0.03, x1 + 0.03, y0 - 0.03, y1 + 0.03, 62, 68, hell(STEIN, -12))
    # Laubengang (Arkaden) im Erdgeschoss vorne links
    for u in (-0.6, -0.2, 0.2):
        iso.fenster_l(u, y1, 0, b=0.26, h=40, farbe=TUER)
    for z in range(82, hh - 20, 56):
        for u in (-0.6, -0.2, 0.2):
            fenster.append(iso.fenster_l(u, y1, z, b=0.15, h=28))
        for v in (-0.3, 0.15, 0.6):
            fenster.append(iso.fenster_r(x1, v, z, b=0.15, h=28))
    iso.banner_r(x1, 0.82, hh - 4, 56, PETROL)
    if b["pavillon"]:  # Residenz: Mansarddach in Kupfer, Gauben
        iso.quader(x0 - 0.06, x1 + 0.06, y0 - 0.06, y1 + 0.06, hh, hh + 8, hell(STEIN, -14))
        iso.pyramide(x0, x1, y0, y1, hh + 8, 70, dach, ueber=0.06)
        for u in (-0.5, 0.1):
            iso.quader(u - 0.12, u + 0.12, y1 - 0.38, y1 - 0.2, hh + 14, hh + 40, STEIN, links=-24, rechts=-4)
            fenster.append(iso.fenster_l(u, y1 - 0.2, hh + 18, b=0.12, h=16))
            iso.pyramide(u - 0.12, u + 0.12, y1 - 0.38, y1 - 0.2, hh + 40, 14, dach, ueber=0.03)
    else:
        iso.satteldach(x0, x1, y0, y1, hh, 92, dach, STEIN, ueber=0.12)
        if b["treppe"]:
            treppengiebel(iso, x1 + 0.01, y0, y1, hh, 92)
            m = iso.p(x1, 0.0, hh + 34)
            pts = [(m[0] - 6, m[1]), (m[0] + 6, m[1]), (m[0] + 6, m[1] - 22), (m[0] - 6, m[1] - 22)]
            iso.poly(pts, FENSTER_TAG, KONTUR)
            fenster.append(pts)
    # Residenz: Pavillon vorne links mit Kupferkuppel
    if b["pavillon"]:
        iso.quader(0.82, 1.4, 0.82, 1.4, 0, 118, STEIN)
        iso.textur_stein(0.82, 1.4, 0.82, 1.4, 0, 118)
        iso.fenster_l(1.11, 1.4, 0, b=0.26, h=42, farbe=TUER)
        fenster.append(iso.fenster_l(1.11, 1.4, 66, b=0.16, h=30))
        fenster.append(iso.fenster_r(1.4, 1.11, 66, b=0.16, h=30))
        iso.quader(0.78, 1.44, 0.78, 1.44, 118, 124, hell(STEIN, -12))
        oben = kuppel(iso, 1.11, 1.11, 0.32, 124, 46 if stufe == 8 else 64, dach, rippen=4)
        iso.fahne(oben, 30, PETROL_HELL)


def stufe(n: int):
    return lambda iso, fenster: gemeindehaus(iso, fenster, n)


# —— Bücherei (wissen, 2×2) ————————————————————————————————


def wissen3(iso: Iso, fenster: list) -> None:
    """Steinerne Bücherei: zwei Geschosse Bruchstein, Treppengiebel, Schieferdach, Dachreiter."""
    schatten(iso, 1.0)
    x0, x1, y0, y1 = -0.9, 0.9, -0.72, 0.72
    iso.quader(x0, x1, y0, y1, 0, 124, STEIN)
    iso.textur_stein(x0, x1, y0, y1, 0, 124)
    iso.fenster_l(-0.5, y1, 0, b=0.28, h=38, farbe=TUER)
    for z in (18, 74):
        for u in (0.0, 0.5):
            fenster.append(iso.fenster_l(u, y1, z, b=0.16, h=30))
        for v in (-0.35, 0.35):
            fenster.append(iso.fenster_r(x1, v, z, b=0.16, h=30))
    iso.satteldach(x0, x1, y0, y1, 124, 78, SCHIEFER, STEIN, ueber=0.1)
    treppengiebel(iso, x1 + 0.01, y0, y1, 124, 78)
    iso.banner_r(x1, -0.3, 120, 40, PETROL)
    iso.zylinder(0.86, 0.62, 0.26, 0, 290, STEIN)
    iso.kegel(0.86, 0.62, 0.32, 290, 100, SCHIEFER)
    # Dachreiter mit Spitze
    iso.quader(-0.55, -0.15, -0.2, 0.2, 170, 236, STEIN)
    fenster.append(iso.fenster_l(-0.35, 0.2, 190, b=0.12, h=20))
    sp = iso.pyramide(-0.55, -0.15, -0.2, 0.2, 236, 84, SCHIEFER, ueber=0.06)
    iso.fahne(sp, 26, PETROL_HELL)


def wissen4(iso: Iso, fenster: list) -> None:
    """Stadtbibliothek: Lesesaal mit hohen Bogenfenstern, Eckturm mit Uhr und Schieferhelm."""
    schatten(iso, 1.0)
    x0, x1, y0, y1 = -0.9, 0.42, -0.8, 0.8
    iso.quader(x0, x1, y0, y1, 0, 150, STEIN)
    iso.textur_stein(x0, x1, y0, y1, 0, 150)
    iso.fenster_l(-0.6, y1, 0, b=0.26, h=38, farbe=TUER)
    for u in (-0.2, 0.15):
        fenster.append(iso.fenster_l(u, y1, 26, b=0.18, h=78))
    for v in (-0.4, 0.15):
        fenster.append(iso.fenster_r(x1, v, 26, b=0.18, h=78))
    iso.satteldach(x0, x1, y0, y1, 150, 70, SCHIEFER, STEIN, ueber=0.08)
    sp = vierkantturm(iso, fenster, 0.42, 0.95, 0.2, 0.92, 282, "helm", SCHIEFER)
    iso.fahne(sp, 30, PETROL_HELL)
    iso.banner_r(0.95, 0.56, 150, 44, PETROL)


def wissen5(iso: Iso, fenster: list) -> None:
    """Residenz-Bibliothek: Säulenportal, Mansarddach, Kupferkuppel mit Laterne."""
    schatten(iso, 1.0)
    x0, x1, y0, y1 = -0.95, 0.95, -0.8, 0.8
    iso.quader(x0, x1, y0, y1, 0, 190, STEIN)
    iso.textur_stein(x0, x1, y0, y1, 0, 190)
    for u in (-0.6, 0.6):
        fenster.append(iso.fenster_l(u, y1, 40, b=0.18, h=84))
    for v in (-0.45, 0.0, 0.45):
        fenster.append(iso.fenster_r(x1, v, 40, b=0.16, h=84))
    # Portal mit Säulen und Dreiecksgiebel (linke Fläche)
    p = iso.p
    for u in (-0.3, -0.1, 0.1, 0.3):
        iso.quader(u - 0.04, u + 0.04, y1, y1 + 0.1, 0, 124, hell(STEIN, 26), links=-20, rechts=-4)
    iso.fenster_l(0.0, y1, 0, b=0.22, h=46, farbe=TUER)
    iso.poly([p(-0.4, y1 + 0.1, 124), p(0.4, y1 + 0.1, 124), p(0.0, y1 + 0.1, 156)], hell(STEIN, 14), KONTUR)
    iso.quader(x0 - 0.05, x1 + 0.05, y0 - 0.05, y1 + 0.05, 190, 198, hell(STEIN, -14))
    iso.pyramide(x0, x1, y0, y1, 198, 54, KUPFER, ueber=0.04)
    iso.zylinder(0.0, 0.0, 0.42, 226, 266, STEIN)
    oben = kuppel(iso, 0.0, 0.0, 0.46, 266, 84, KUPFER, rippen=6)
    lx, ly = oben
    iso.poly([(lx - 8, ly + 2), (lx + 8, ly + 2), (lx + 8, ly - 26), (lx - 8, ly - 26)], hell(STEIN, 6), KONTUR)
    lat = [(lx - 4, ly - 4), (lx + 4, ly - 4), (lx + 4, ly - 20), (lx - 4, ly - 20)]
    iso.poly(lat, FENSTER_TAG, KONTUR)
    fenster.append(lat)
    iso.poly([(lx - 9, ly - 26), (lx + 9, ly - 26), (lx, ly - 66)], hell(KUPFER, -6), KONTUR)
    iso.d.ellipse([lx - 4, ly - 72, lx + 4, ly - 64], fill=GOLD_MATT, outline=KONTUR)
    iso.fahne((lx, ly - 68), 28, PETROL_HELL)
    iso.banner_r(x1, -0.22, 186, 50, PETROL)


# —— Windmühle (turm, 1×1) ————————————————————————————————


def fluegel(iso: Iso, nabe, laenge: float, breite: float, winkel0: float, *, tuch=True) -> None:
    """Vier Flügel mit Segeltuch (wie Epoche 1), in der Bildebene, leicht gestaucht."""
    cx, cy = nabe
    for k in range(4):
        a = winkel0 + k * math.pi / 2
        dx, dy = math.cos(a) * 0.8, math.sin(a)
        nx, ny = -dy, dx
        ende = (cx + dx * laenge, cy - dy * laenge)
        iso.linie((cx, cy), ende, BALKEN, 3)
        p0 = (cx + dx * laenge * 0.22, cy - dy * laenge * 0.22)
        q = [p0, ende, (ende[0] + nx * breite, ende[1] - ny * breite), (p0[0] + nx * breite, p0[1] - ny * breite)]
        iso.poly(q, SEGEL if tuch else None, KONTUR if tuch else BALKEN)
        for t in (0.45, 0.7):
            a1 = (cx + dx * laenge * t, cy - dy * laenge * t)
            iso.linie(a1, (a1[0] + nx * breite, a1[1] - ny * breite), hell(SEGEL, -50) if tuch else BALKEN)
    iso.d.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], fill=hell(BALKEN, -10), outline=KONTUR)


def muehlenturm(iso: Iso, fenster: list, r: float, h: int, wand, *, galerie_z: int | None) -> tuple[float, float]:
    """Runder, leicht schlanker werdender Mühlenturm; gibt die Mitte oben zurück."""
    cx, cy = iso.p(0, 0, 0)
    iso.zylinder(0.0, 0.0, r, 0, h * 0.5, wand)
    iso.zylinder(0.0, 0.0, r * 0.86, h * 0.5, h, wand)
    vorne = r * HH * math.sqrt(2)
    iso.poly([(cx - 7, cy + vorne), (cx + 7, cy + vorne), (cx + 7, cy + vorne - 32), (cx - 7, cy + vorne - 32)], TUER, KONTUR)
    for fz in range(70, int(h) - 30, 62):
        v = vorne * (0.86 if fz > h * 0.5 else 1)
        pts = [(cx - 5, cy + v - fz), (cx + 5, cy + v - fz), (cx + 5, cy + v - fz - 18), (cx - 5, cy + v - fz - 18)]
        iso.poly(pts, FENSTER_TAG, KONTUR)
        fenster.append(pts)
    if galerie_z is not None:
        rx, ry = r * 1.5 * HW * math.sqrt(2), r * 1.5 * HH * math.sqrt(2)
        iso.d.ellipse([cx - rx, cy - ry - galerie_z, cx + rx, cy + ry - galerie_z], fill=hell(HOLZ, -14), outline=KONTUR)
        iso.zylinder(0.0, 0.0, r * 0.86, galerie_z, h, wand)
        for k in range(11):
            a = math.pi * k / 10
            x, y = cx - rx * math.cos(a), cy + ry * math.sin(a) - galerie_z
            iso.linie((x, y), (x, y - 12), BALKEN, 2)
        iso.d.arc([cx - rx, cy - ry - galerie_z - 12, cx + rx, cy + ry - galerie_z - 12], 0, 180, fill=BALKEN, width=2)
    return (cx, cy - h)


def turm3(iso: Iso, fenster: list) -> None:
    """Holländer aus Bruchstein, höher, Galerie, Schieferhaube, große Segelflügel."""
    schatten(iso, 0.56)
    oben = muehlenturm(iso, fenster, 0.42, 204, STEIN, galerie_z=104)
    iso.kegel(0.0, 0.0, 0.42, 204, 50, SCHIEFER)
    iso.fahne((oben[0], oben[1] - 50), 24, PETROL_HELL)
    fluegel(iso, (oben[0] + 10, oben[1] + 8), 46, 12, math.pi / 4)


def turm4(iso: Iso, fenster: list) -> None:
    """Galerieholländer der Marktstadt: hoher Ziegelturm auf Steinsockel, Windrose, Banner."""
    schatten(iso, 0.56)
    iso.quader(-0.46, 0.46, -0.46, 0.46, 0, 30, STEIN)
    iso.textur_stein(-0.46, 0.46, -0.46, 0.46, 0, 30, 10)
    cx, cy = iso.p(0, 0, 0)
    iso.zylinder(0.0, 0.0, 0.4, 30, 130, hell(ZIEGEL, -30), stein=True)
    oben = muehlenturm(iso, [], 0.36, 230, hell(ZIEGEL, -30), galerie_z=130)
    del oben
    for fz in (80, 170):
        pts = [(cx - 5, cy + 14 - fz), (cx + 5, cy + 14 - fz), (cx + 5, cy + 14 - fz - 18), (cx - 5, cy + 14 - fz - 18)]
        iso.poly(pts, FENSTER_TAG, KONTUR)
        fenster.append(pts)
    iso.kegel(0.0, 0.0, 0.4, 230, 54, SCHIEFER)
    top = (cx, cy - 230)
    # Windrose hinten an der Haube (kleines Flügelrad)
    w = (top[0] - 30, top[1] - 6)
    iso.linie((top[0] - 6, top[1] - 10), w, BALKEN, 2)
    for k in range(6):
        a = math.pi * k / 3
        iso.linie(w, (w[0] + 13 * math.cos(a), w[1] + 13 * math.sin(a)), hell(BALKEN, 20), 3)
    iso.fahne((top[0], top[1] - 54), 26, PETROL_HELL)
    iso.banner_r(0.4, 0.1, 124, 40, PETROL)
    fluegel(iso, (top[0] + 10, top[1] + 8), 48, 13, 0.0)


def turm5(iso: Iso, fenster: list) -> None:
    """Prunkmühle der Residenz: Steinturm, zwei Galerien, Kupferhaube mit Spitze, große Flügel."""
    schatten(iso, 0.56)
    oben = muehlenturm(iso, fenster, 0.42, 262, STEIN, galerie_z=110)
    cx, cy = oben
    rx, ry = 0.5 * HW * math.sqrt(2), 0.5 * HH * math.sqrt(2)
    iso.d.ellipse([cx - rx, cy - ry + 50, cx + rx, cy + ry + 50], fill=hell(HOLZ, -14), outline=KONTUR)
    for k in range(9):
        a = math.pi * k / 8
        x, y = cx - rx * math.cos(a), cy + ry * math.sin(a) + 50
        iso.linie((x, y), (x, y - 10), BALKEN, 2)
    sp = kuppel(iso, 0.0, 0.0, 0.4, 262, 50, KUPFER, rippen=4)
    iso.poly([(sp[0] - 6, sp[1] + 2), (sp[0] + 6, sp[1] + 2), (sp[0], sp[1] - 40)], hell(KUPFER, -6), KONTUR)
    iso.d.ellipse([sp[0] - 4, sp[1] - 46, sp[0] + 4, sp[1] - 38], fill=GOLD_MATT, outline=KONTUR)
    iso.fahne((sp[0], sp[1] - 42), 26, PETROL_HELL)
    iso.banner_r(0.38, 0.1, 230, 50, PETROL)
    fluegel(iso, (cx + 10, cy + 10), 50, 14, math.pi / 4)


# —— Schreinerei (werkstatt, 2×2) und Brücke (eingang, 1×1) ———————————————————


def werkstatt2(iso: Iso, fenster: list) -> None:
    """Fachwerk-Schreinerei mit Ziegeldach, großem Tor, Holzlager unter Vordach, Schornstein."""
    schatten(iso, 0.95)
    p = iso.p
    x0, x1, y0, y1 = -0.85, 0.5, -0.8, 0.62
    iso.quader(x0, x1, y0, y1, 0, 36, STEIN)
    iso.textur_stein(x0, x1, y0, y1, 0, 36, 10)
    iso.fenster_l(-0.3, y1, 0, b=0.44, h=40, farbe=TUER, bogen=False)
    iso.quader(x0, x1, y0, y1, 36, 104, PUTZ, links=-30, rechts=-6)
    iso.textur_fachwerk(x0, x1, y0, y1, 36, 104)
    fenster.append(iso.fenster_l(0.2, y1, 56, b=0.18, h=22, bogen=False))
    fenster.append(iso.fenster_r(x1, -0.4, 56, b=0.18, h=22, bogen=False))
    iso.quader(-0.6, -0.45, -0.5, -0.35, 130, 196, hell(ZIEGEL, -20))
    iso.satteldach(x0, x1, y0, y1, 104, 66, ZIEGEL, PUTZ, ueber=0.1)
    # Vordach rechts mit Bretterlager
    for py in (-0.6, 0.5):
        iso.quader(0.86, 0.92, py - 0.03, py + 0.03, 0, 70, HOLZ, links=-40, rechts=-8)
    for k in range(5):
        iso.quader(0.58, 0.9, -0.5, 0.4, k * 7, k * 7 + 7, hell(HOLZ, 30 - k * 7))
    iso.poly([p(0.5, -0.72, 96), p(1.0, -0.72, 72), p(1.0, 0.62, 72), p(0.5, 0.62, 96)], hell(ZIEGEL, -10), KONTUR)
    # Schild mit Hobel
    a = p(x1, 0.3, 92)
    iso.linie(a, (a[0] + 16, a[1] - 2), BALKEN, 3)
    s = [(a[0] + 8, a[1]), (a[0] + 26, a[1]), (a[0] + 26, a[1] + 16), (a[0] + 8, a[1] + 16)]
    iso.poly(s, PETROL, KONTUR)
    iso.banner_r(x1, -0.1, 100, 30, PETROL)


def werkstatt3(iso: Iso, fenster: list) -> None:
    """Sägemühle aus Bruchstein: Schieferdach, Wasserrad am Bach, Kran-Ausleger, Stämme."""
    schatten(iso, 0.95)
    p = iso.p
    # Bach rechts vorne
    iso.poly([p(0.55, -0.95, 0), p(0.95, -0.95, 0), p(0.95, 0.95, 0), p(0.55, 0.95, 0)], WASSER)
    x0, x1, y0, y1 = -0.9, 0.5, -0.85, 0.6
    iso.quader(x0, x1, y0, y1, 0, 160, STEIN)
    iso.textur_stein(x0, x1, y0, y1, 0, 160)
    iso.fenster_l(-0.45, y1, 0, b=0.4, h=46, farbe=TUER)
    for z in (30, 96):
        fenster.append(iso.fenster_l(0.15, y1, z, b=0.16, h=26))
        fenster.append(iso.fenster_r(x1, -0.5, z, b=0.16, h=26))
    iso.satteldach(x0, x1, y0, y1, 160, 80, SCHIEFER, STEIN, ueber=0.1)
    # Aufzugsgaube mit Ausleger auf der vorderen Dachfläche
    iso.quader(-0.35, 0.0, 0.2, 0.62, 160, 214, STEIN)
    fenster.append(iso.fenster_l(-0.18, 0.62, 168, b=0.16, h=24, bogen=False))
    iso.pyramide(-0.35, 0.0, 0.2, 0.62, 214, 30, SCHIEFER, ueber=0.04)
    iso.linie(p(-0.18, 0.62, 208), p(-0.18, 1.0, 212), BALKEN, 3)
    iso.linie(p(-0.18, 1.0, 212), p(-0.18, 1.0, 140), (200, 190, 160), 2)
    # Wasserrad an der rechten Wand
    m = p(0.66, 0.1, 58)
    iso.d.ellipse([m[0] - 20, m[1] - 52, m[0] + 20, m[1] + 52], outline=BALKEN, width=5)
    for k in range(8):
        a = math.pi * k / 8
        iso.linie((m[0] - 19 * math.cos(a), m[1] - 50 * math.sin(a)), (m[0] + 19 * math.cos(a), m[1] + 50 * math.sin(a)), HOLZ, 2)
    iso.d.ellipse([m[0] - 5, m[1] - 5, m[0] + 5, m[1] + 5], fill=BALKEN)
    # Stämme vorne links
    for k, (sx, sz) in enumerate(((-0.7, 0), (-0.45, 0), (-0.58, 12))):
        a = p(sx, 0.85, sz + 7)
        iso.d.ellipse([a[0] - 7, a[1] - 7, a[0] + 7, a[1] + 7], fill=hell(HOLZ, 46 - k * 8), outline=KONTUR)
        iso.d.ellipse([a[0] - 3, a[1] - 3, a[0] + 3, a[1] + 3], outline=HOLZ_FUGE)
    iso.banner_r(x1, -0.1, 156, 40, PETROL)
    sp = p(-0.2, -0.2, 240)
    iso.fahne(sp, 30, PETROL_HELL)


def eingang2(iso: Iso, fenster: list) -> None:
    """Steinbrücke: Bogen über den Bach, Brüstungen, zwei Laternen, Brückenfigur."""
    p = iso.p
    iso.poly([p(-0.5, -0.24, 0), p(0.5, -0.24, 0), p(0.5, 0.24, 0), p(-0.5, 0.24, 0)], WASSER)
    for k in (-0.3, 0.1, 0.35):
        iso.linie(p(k, -0.05, 0), p(k + 0.12, -0.05, 0), hell(WASSER, 50), 2)
    # Brückenkörper (in y-Richtung über das Wasser), Bogen auf der rechten Fläche
    x0, x1 = -0.24, 0.24
    iso.quader(x0, x1, -0.5, 0.5, 0, 34, STEIN)
    iso.textur_stein(x0, x1, -0.5, 0.5, 0, 34, 10)
    pts = [p(x1, 0.3, 0)]
    for t in range(0, 13):
        a = math.pi * t / 12
        pts.append(p(x1, 0.3 - 0.6 * (1 - math.cos(a)) / 2, 28 * math.sin(a)))
    pts.append(p(x1, -0.3, 0))
    iso.poly(pts, hell(WASSER, -30), KONTUR)
    # Brüstungen
    iso.quader(x0, x0 + 0.06, -0.5, 0.5, 34, 50, hell(STEIN, -6))
    iso.quader(x1 - 0.06, x1, -0.5, 0.5, 34, 50, hell(STEIN, -6))
    # Laternen vorne und hinten auf der rechten Brüstung
    for y in (-0.42, 0.42):
        iso.quader(x1 - 0.05, x1 + 0.01, y - 0.03, y + 0.03, 50, 88, (60, 60, 64), links=-20, rechts=-4)
        m = p(x1 - 0.02, y, 96)
        lat = [(m[0] - 5, m[1] + 6), (m[0] + 5, m[1] + 6), (m[0] + 5, m[1] - 8), (m[0] - 5, m[1] - 8)]
        iso.poly(lat, FENSTER_TAG, KONTUR)
        fenster.append(lat)
        iso.poly([(m[0] - 7, m[1] - 8), (m[0] + 7, m[1] - 8), (m[0], m[1] - 16)], (60, 60, 64), KONTUR)
    iso.banner_r(x1, 0.0, 74, 20, PETROL)


EPOCHEN = {
    2: [
        ("kern", 4, stufe(4), 3, BREITE),
        ("kern", 5, stufe(5), 3, BREITE),
        ("wissen", 3, wissen3, 2, 200),
        ("turm", 3, turm3, 1, 104),
        ("werkstatt", 2, werkstatt2, 2, 200),
        ("eingang", 2, eingang2, 1, 104),
    ],
    3: [
        ("kern", 6, stufe(6), 3, BREITE),
        ("kern", 7, stufe(7), 3, BREITE),
        ("wissen", 4, wissen4, 2, 200),
        ("turm", 4, turm4, 1, 104),
        ("werkstatt", 3, werkstatt3, 2, 200),
    ],
    4: [
        ("kern", 8, stufe(8), 3, BREITE),
        ("kern", 9, stufe(9), 3, BREITE),
        ("wissen", 5, wissen5, 2, 200),
        ("turm", 5, turm5, 1, 104),
    ],
}

if __name__ == "__main__":
    sys.exit(schreibe_epochen("dorf", EPOCHEN))
