#!/usr/bin/env python3
"""G3 Epochen 2–4, Thema `garten` (GRAFIK-SPRITES.md §12.11, Entscheidung PV 02.11.2026).

Neue Stufen, je in der Epoche, in der sie zuerst baubar sind (eine Stufe, ein Bild):
  Epoche 2 (Obstgarten):         Baumhaus 4–5, Gewächshaus 3, Aussichtsbaum 3, Geräteschuppen 2, Gartentor 2
  Epoche 3 (Landschaftspark):    Baumhaus 6–7, Gewächshaus 4, Aussichtsbaum 4, Geräteschuppen 3
  Epoche 4 (Botanischer Garten): Baumhaus 8–9, Gewächshaus 5, Aussichtsbaum 5

Materialleiter ab Epoche 2 (Fortsetzung von §12.10): bemaltes Holz und Glas mit
Steinsockel und Schmiedeeisen, ab Stufe 8 Kupfer und Glaskuppeln.
Das Baumhaus aus Stufe 3 bleibt der Kern; ab Stufe 4 wächst es zu einem Baumhaus-Dorf
in mehreren Kronen mit Brücken, Treppe, Pavillon und zuletzt einer Glaskuppel.
Formen aus `sprites-g3-garten.py` (Plattform, Hütte, Glasflächen) und `g3_stil.py`.
Aufruf: python3 tools/grafik/sprites-g3e-garten.py
"""
from __future__ import annotations

import importlib.util
import math
import sys
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from g3_stil import *  # noqa: E402,F403
from g3_stil import BREITE, HH, HW, Iso, hell, krone, kuppel, schatten, schreibe_epochen  # noqa: E402

_spec = importlib.util.spec_from_file_location("garten_e1", Path(__file__).resolve().parent / "sprites-g3-garten.py")
assert _spec and _spec.loader
g1 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(g1)

RINDE, RUNDHOLZ, BRETT, BEMALT = g1.RINDE, g1.RUNDHOLZ, g1.BRETT, g1.BEMALT
RAHMEN, GLAS, MOOS, SEIL, TUER, BLUETEN = g1.RAHMEN, g1.GLAS, g1.MOOS, g1.SEIL, g1.TUER, g1.BLUETEN
plattform, huette, wimpel = g1.plattform, g1.huette, g1.wimpel
glasflaeche_l, glasflaeche_r = g1.glasflaeche_l, g1.glasflaeche_r

EISEN = (58, 62, 66)  # Schmiedeeisen
DACHROT = (196, 96, 58)


def baum(iso: Iso, x, y, r, h, kr) -> None:
    """Stamm mit Krone an beliebiger Stelle."""
    iso.zylinder(x, y, r, 0, h, RINDE, stein=False)
    m = iso.p(x, y, h + kr * 0.3)
    krone(iso, m[0], m[1], kr)


def bruecke(iso: Iso, a, b) -> None:
    pa, pb = iso.p(*a), iso.p(*b)
    iso.linie(pa, pb, hell(BRETT, -10), 4)
    iso.linie((pa[0], pa[1] - 14), (pb[0], pb[1] - 14), SEIL, 1)


def laterne(iso: Iso, fenster: list, pt) -> None:
    lat = [(pt[0] - 4, pt[1]), (pt[0] + 4, pt[1]), (pt[0] + 4, pt[1] - 10), (pt[0] - 4, pt[1] - 10)]
    iso.poly(lat, (230, 180, 80), KONTUR)
    fenster.append(lat)


def glaskuppel(iso: Iso, fenster: list, x, y, r, z, h, *, kupfer=False) -> tuple[float, float]:
    """Glaskuppel mit weißen Rippen, Laterne und Spitze (Kupfer ab Stufe 8)."""
    oben = kuppel(iso, x, y, r, z, h, GLAS, rippen=6, rippe=RAHMEN)
    cx, cy = iso.p(x, y, z)
    fenster.append([(cx - r * HW * 0.7, cy - 4), (cx + r * HW * 0.7, cy - 4), (cx + r * HW * 0.4, cy - h * 0.6), (cx - r * HW * 0.4, cy - h * 0.6)])
    lx, ly = oben
    iso.poly([(lx - 7, ly + 2), (lx + 7, ly + 2), (lx + 7, ly - 18), (lx - 7, ly - 18)], RAHMEN, KONTUR)
    laterne(iso, fenster, (lx, ly - 4))
    dach = KUPFER if kupfer else BEMALT
    iso.poly([(lx - 9, ly - 18), (lx + 9, ly - 18), (lx, ly - 46)], dach, KONTUR)
    return (lx, ly - 46)


def pavillon(iso: Iso, fenster: list, z, r, dach, *, h=44) -> tuple[float, float]:
    """Runder, offener Pavillon: Säulen und Zeltdach auf einer Plattform."""
    p = iso.p
    for k in range(6):  # hintere Säulen zuerst
        a = math.pi * (1 + k / 5)
        iso.linie(p(r * math.cos(a), r * math.sin(a), z), p(r * math.cos(a), r * math.sin(a), z + h), RAHMEN, 3)
    laterne(iso, fenster, p(0, 0, z + 16))
    for k in range(6):
        a = math.pi * k / 5
        iso.linie(p(r * math.cos(a), r * math.sin(a), z), p(r * math.cos(a), r * math.sin(a), z + h), RAHMEN, 3)
    return iso.kegel(0, 0, r * 1.25, z + h, 52, dach)


# —— Baumhaus (kern, 3×3): Baumhaus-Dorf ————————————————————————————

PLAN = {
    4: dict(h=270, kr=78, links=True, rechts=False, treppe=False, sockel=False, oben="turm"),
    5: dict(h=305, kr=82, links=True, rechts=True, treppe=True, sockel=False, oben="turm"),
    6: dict(h=364, kr=86, links=True, rechts=True, treppe=True, sockel=True, oben="pavillon"),
    7: dict(h=392, kr=90, links=True, rechts=True, treppe=True, sockel=True, oben="doppel"),
    8: dict(h=446, kr=92, links=True, rechts=True, treppe=True, sockel=True, oben="kuppel"),
    9: dict(h=452, kr=96, links=True, rechts=True, treppe=True, sockel=True, oben="spitze"),
}


def baumhaus(iso: Iso, fenster: list, stufe: int) -> None:
    b = PLAN[stufe]
    p = iso.p
    dach = KUPFER if stufe >= 8 else DACHROT
    h = b["h"]
    schatten(iso, 1.5)
    # hinten rechts: Nebenbaum, ab Stufe 5 mit Hütte
    if b["rechts"]:
        zr = 150 + (stufe - 5) * 10 + (30 if stufe >= 9 else 0)
        baum(iso, 1.0, -1.0, 0.16, zr + 40, 40)
        plattform(iso, 0.4, zr, BRETT, gelaender=False)
        g = 1.0
        z = zr
        iso.quader(g - 0.3, g + 0.25, -g - 0.25, -g + 0.3, z, z + 44, BEMALT, links=-30, rechts=-8)
        fenster.append(iso.fenster_r(g + 0.25, -g, z + 14, b=0.14, h=16, bogen=False))
        if stufe >= 9:
            sp = glaskuppel(iso, fenster, g - 0.025, -g + 0.025, 0.3, z + 44, 34, kupfer=True)
        else:
            sp = iso.pyramide(g - 0.3, g + 0.25, -g - 0.25, -g + 0.3, z + 44, 40, dach, ueber=0.06)
        wimpel(iso, sp, 22)
    else:
        baum(iso, 1.0, -1.0, 0.12, 120, 30)
        iso.quader(0.75, 1.25, -1.25, -0.75, 104, 110, BRETT)
    # Steinterrasse um den Stamm (Landschaftspark)
    if b["sockel"]:
        iso.quader(-1.2, 1.2, -1.2, 1.2, 0, 22, STEIN)
        iso.textur_stein(-1.2, 1.2, -1.2, 1.2, 0, 22, 11)
        for k in range(6):
            a = p(-1.0 + k * 0.4, 1.2, 22)
            iso.d.ellipse([a[0] - 6, a[1] - 9, a[0] + 6, a[1] + 1], fill=hell(GRUEN, (k % 2) * 12), outline=KONTUR)
            iso.d.ellipse([a[0] - 2, a[1] - 9, a[0] + 2, a[1] - 5], fill=BLUETEN[k % 5])
    z0 = 22 if b["sockel"] else 0
    # Hauptstamm und große Krone
    g1.stamm(iso, 0.32, z0, h)
    m = iso.p(0, 0, h + 18)
    krone(iso, m[0] - 12, m[1] + 6, b["kr"])
    if stufe >= 6:  # Laub am langen Stamm, damit der Baum dicht bleibt
        zm = (z0 + 104 + h - 60) / 2 + 20
        for dx, r in ((-46, 30), (44, 26)):
            c = iso.p(0, 0, zm)
            krone(iso, c[0] + dx, c[1] + (dx < 0) * 10, r)
    if b["rechts"]:
        bruecke(iso, (0.5, -0.5, 150), (0.75, -0.8, 150 + (stufe - 5) * 10 + (30 if stufe >= 9 else 0)))
    # untere Ebene: Plattform und Bretterhütte
    plattform(iso, 0.92, z0 + 104, BRETT)
    huette(iso, fenster, -0.76, 0.2, -0.7, 0.3, z0 + 104, 56, BRETT, SCHINDEL)
    # Wendeltreppe um den Stamm statt Rutsche
    if b["treppe"]:
        for k in range(10):
            a = 0.3 + k * 0.62
            zz = z0 + 6 + k * 10
            q1, q2 = p(0.34 * math.cos(a), 0.34 * math.sin(a), zz), p(0.62 * math.cos(a), 0.62 * math.sin(a), zz)
            iso.linie(q1, q2, hell(BRETT, -16), 4)
    else:
        iso.poly([p(-0.4, 0.92, 104), p(-0.2, 0.92, 104), p(-0.2, 1.5, 0), p(-0.4, 1.5, 0)], (214, 92, 70), KONTUR)
    # obere Ebene: bemalte Hütte mit Glas
    zo = h - 60
    plattform(iso, 0.66, zo, RUNDHOLZ, gelaender=True)
    first = huette(iso, fenster, -0.46, 0.46, -0.46, 0.46, zo, 58, BEMALT, MOOS, glas=True)
    zt = zo + 58 + 30
    oben = b["oben"]
    if oben in ("turm", "doppel"):
        th = 40 if oben == "turm" else 70
        iso.quader(-0.18, 0.18, -0.18, 0.18, zt - 14, zt + th, BEMALT, links=-30, rechts=-8)
        fenster.append(iso.fenster_r(0.18, 0.0, zt + th - 30, b=0.1, h=14, bogen=False))
        fenster.append(iso.fenster_l(0.0, 0.18, zt + th - 30, b=0.1, h=14, bogen=False))
        if oben == "doppel":
            iso.quader(-0.26, 0.26, -0.26, 0.26, zt + 26, zt + 32, RAHMEN)
        spitze = iso.pyramide(-0.18, 0.18, -0.18, 0.18, zt + th, 52 if stufe == 4 else 62, dach, ueber=0.08)
        iso.fahne(spitze, 34, PETROL_HELL)
    elif oben == "pavillon":
        plattform(iso, 0.44, zt, RUNDHOLZ, gelaender=False)
        spitze = pavillon(iso, fenster, zt, 0.34, dach)
        iso.fahne(spitze, 34, PETROL_HELL)
    else:
        plattform(iso, 0.5, zt, RAHMEN, gelaender=False)
        iso.zylinder(0, 0, 0.44, zt, zt + 26, RAHMEN, stein=False)
        spitze = glaskuppel(iso, fenster, 0, 0, 0.46, zt + 26, 62 if oben == "kuppel" else 80, kupfer=True)
        if oben == "spitze":
            iso.poly([(spitze[0] - 6, spitze[1] + 2), (spitze[0] + 6, spitze[1] + 2), (spitze[0], spitze[1] - 72)], KUPFER, KONTUR)
            spitze = (spitze[0], spitze[1] - 72)
        iso.d.ellipse([spitze[0] - 4, spitze[1] - 6, spitze[0] + 4, spitze[1] + 2], fill=GOLD_MATT, outline=KONTUR)
        iso.fahne(spitze, 38, PETROL_HELL)
    iso.banner_r(0.46, 0.24, zo + 48, 36, PETROL)
    del first
    # vorne links: zweiter Baum mit Hütte und Brücke
    if b["links"]:
        lh = 170 + (stufe - 4) * 14 + (30 if stufe >= 9 else 0)
        baum(iso, -1.0, 1.0, 0.16, lh, 44)
        zl = lh - 56
        plattform(iso, 0.4, zl, BRETT, gelaender=False)
        cx = -1.0
        iso.quader(cx - 0.28, cx + 0.28, 1.0 - 0.28, 1.0 + 0.28, zl, zl + 44, BRETT, links=-34, rechts=-10)
        iso.textur_holz(cx - 0.28, cx + 0.28, 0.72, 1.28, zl, zl + 44, 4)
        fenster.append(iso.fenster_l(cx, 1.28, zl + 12, b=0.14, h=18, bogen=False))
        if stufe >= 9:
            sp = glaskuppel(iso, fenster, cx, 1.0, 0.3, zl + 44, 34, kupfer=True)
        else:
            sp = iso.pyramide(cx - 0.28, cx + 0.28, 0.72, 1.28, zl + 44, 44 if stufe < 7 else 60, dach if stufe >= 6 else SCHINDEL, ueber=0.08)
        wimpel(iso, sp, 22)
        bruecke(iso, (-0.6, 0.6, z0 + 104), (-0.75, 0.8, zl))
    # Laub vorn, damit die Hütten im Baum sitzen
    for dx, dz, r in ((66, z0 + 176, 16),):
        c = iso.p(0, 0, dz)
        krone(iso, c[0] + dx, c[1], r)


def kern(n: int):
    return lambda iso, fenster: baumhaus(iso, fenster, n)


# —— Gewächshaus (wissen, 2×2): Orangerie → großes Glashaus → Palmenhaus ————————


def glashaus_dach(iso: Iso, x0, x1, y0, y1, z, h) -> tuple[float, float]:
    p = iso.p
    ym = (y0 + y1) / 2
    iso.poly([p(x0, ym, z + h), p(x1, ym, z + h), p(x1, y0 - 0.06, z - 2), p(x0, y0 - 0.06, z - 2)], hell(GLAS, 10), KONTUR)
    iso.poly([p(x1, y1, z), p(x1, y0, z), p(x1, ym, z + h)], hell(GLAS, -4), KONTUR)
    iso.poly([p(x0 - 0.06, y1 + 0.06, z - 2), p(x1 + 0.06, y1 + 0.06, z - 2), p(x1 + 0.06, ym, z + h), p(x0 - 0.06, ym, z + h)], hell(GLAS, -18), KONTUR)
    n = max(3, round((x1 - x0) * 4))
    for k in range(1, n):
        u = x0 + (x1 - x0) * k / n
        iso.linie(p(u, y1 + 0.06, z - 2), p(u, ym, z + h), RAHMEN, 2)
    iso.linie(p(x0, ym, z + h), p(x1, ym, z + h), RAHMEN, 3)
    return p((x0 + x1) / 2, ym, z + h)


def pflanzen(iso: Iso, x0, x1, y, z, n=5) -> None:
    p = iso.p
    for k in range(n):
        a = p(x0 + (x1 - x0) * (k + 0.5) / n, y, z)
        iso.d.ellipse([a[0] - 9, a[1] - 18, a[0] + 9, a[1]], fill=hell(GRUEN, 10 + (k % 2) * 12))
        iso.d.ellipse([a[0] - 2, a[1] - 18, a[0] + 3, a[1] - 13], fill=BLUETEN[k % 5])


def wissen3(iso: Iso, fenster: list) -> None:
    """Orangerie: Steinbau mit hohen Bogenfenstern, Glas-Satteldach, Laternenturm mit Spitze."""
    schatten(iso, 1.0)
    x0, x1, y0, y1 = -0.9, 0.9, -0.72, 0.72
    iso.quader(x0, x1, y0, y1, 0, 150, STEIN)
    iso.textur_stein(x0, x1, y0, y1, 0, 150)
    iso.fenster_l(-0.55, y1, 0, b=0.28, h=44, farbe=TUER)
    for x in (-0.1, 0.32, 0.68):
        fenster.append(iso.fenster_l(x, y1, 30, b=0.24, h=84, farbe=hell(GLAS, -40)))
    for y in (-0.4, 0.0, 0.4):
        fenster.append(iso.fenster_r(x1, y, 30, b=0.24, h=84, farbe=hell(GLAS, -30)))
    iso.quader(x0 - 0.04, x1 + 0.04, y0 - 0.04, y1 + 0.04, 150, 158, RAHMEN)
    glashaus_dach(iso, x0, x1, y0, y1, 158, 70)
    # Laternenturm auf dem First
    iso.quader(-0.2, 0.2, -0.16, 0.16, 220, 268, hell(GLAS, -10), links=-20, rechts=-6)
    for u in (-0.2, 0.0, 0.2):
        iso.linie(iso.p(u, 0.16, 220), iso.p(u, 0.16, 268), RAHMEN, 2)
    fenster.append([iso.p(-0.2, 0.16, 224), iso.p(0.2, 0.16, 224), iso.p(0.2, 0.16, 264), iso.p(-0.2, 0.16, 264)])
    spitze = iso.pyramide(-0.2, 0.2, -0.16, 0.16, 268, 50, BEMALT, ueber=0.04)
    iso.fahne(spitze, 30, PETROL_HELL)
    iso.banner_r(x1, -0.6, 146, 46, PETROL)
    # Kübelbäumchen vorne
    for x in (-0.2, 0.9):
        a = iso.p(x, 0.9, 0)
        iso.poly([(a[0] - 7, a[1]), (a[0] + 7, a[1]), (a[0] + 9, a[1] - 14), (a[0] - 9, a[1] - 14)], (200, 110, 60), KONTUR)
        krone(iso, a[0], a[1] - 30, 14)


def wissen4(iso: Iso, fenster: list) -> None:
    """Großes Glashaus: hohes Mittelschiff mit Glas-Tonnendach über zwei niedrigen Seitenschiffen."""
    schatten(iso, 1.0)
    p = iso.p
    # Seitenschiffe (Glas auf Steinsockel)
    for y0, y1 in ((-0.92, -0.42), (0.42, 0.92)):
        iso.quader(-0.92, 0.92, y0, y1, 0, 16, STEIN)
        glasflaeche_l(iso, -0.92, 0.92, y1, 16, 96, 6)
        glasflaeche_r(iso, 0.92, y0, y1, 16, 96, 2)
        iso.poly([p(-0.92, y0, 96), p(0.92, y0, 96), p(0.92, y1, 110), p(-0.92, y1, 110)], hell(GLAS, 6), KONTUR)
    pflanzen(iso, -0.9, 0.9, 0.92, 22, 6)
    fenster.append([p(-0.8, 0.92, 30), p(0.8, 0.92, 30), p(0.8, 0.92, 90), p(-0.8, 0.92, 90)])
    # Mittelschiff hoch
    x0, x1, y0, y1 = -0.92, 0.92, -0.42, 0.42
    glasflaeche_r(iso, x1, y0, y1, 96, 200, 3, fenster)
    glasflaeche_l(iso, x0, x1, y1, 110, 200, 6, fenster)
    # gewölbtes Glasdach (Tonne) als Stufen
    ym = 0.0
    for k in range(6):
        t0, t1 = k / 6, (k + 1) / 6
        za = 200 + 70 * math.sin(math.pi / 2 * t0)
        zb = 200 + 70 * math.sin(math.pi / 2 * t1)
        ya, yb = y1 - (y1 - ym) * t0, y1 - (y1 - ym) * t1
        iso.poly([p(x0, ya, za), p(x1, ya, za), p(x1, yb, zb), p(x0, yb, zb)], hell(GLAS, -18 + k * 5), KONTUR)
    giebel = [p(x1, y1, 200)] + [p(x1, y1 - (y1 - y0) * k / 12, 200 + 70 * math.sin(math.pi * k / 12)) for k in range(13)]
    iso.poly(giebel, hell(GLAS, -4), KONTUR)
    for k in range(1, 7):
        u = x0 + (x1 - x0) * k / 7
        pts = [p(u, y1 - (y1 - ym) * t, 200 + 70 * math.sin(math.pi / 2 * t)) for t in (0, 0.25, 0.5, 0.75, 1)]
        for a, b in zip(pts, pts[1:]):
            iso.linie(a, b, RAHMEN, 2)
    m = p(x1, 0.0, 226)
    iso.d.ellipse([m[0] - 12, m[1] - 16, m[0] + 12, m[1] + 16], fill=hell(GLAS, -40), outline=RAHMEN, width=2)
    fenster.append([(m[0] - 9, m[1] - 12), (m[0] + 9, m[1] - 12), (m[0] + 9, m[1] + 12), (m[0] - 9, m[1] + 12)])
    # Firstlaterne mit Spitze
    iso.quader(-0.18, 0.18, -0.14, 0.14, 266, 314, RAHMEN, links=-20, rechts=-6)
    laterne(iso, fenster, p(0.0, 0.14, 276))
    spitze = iso.pyramide(-0.18, 0.18, -0.14, 0.14, 314, 50, BEMALT, ueber=0.04)
    iso.fahne(spitze, 30, PETROL_HELL)
    iso.banner_r(0.92, 0.66, 92, 40, PETROL)


def palme(iso: Iso, x, y, z) -> None:
    a = iso.p(x, y, z)
    iso.linie(a, (a[0] + 4, a[1] - 40), RINDE, 4)
    k = (a[0] + 4, a[1] - 40)
    for dx, dy in ((-20, 6), (20, 6), (-14, -8), (14, -8), (0, -14)):
        iso.linie(k, (k[0] + dx, k[1] + dy), hell(GRUEN, 6), 4)


def wissen5(iso: Iso, fenster: list) -> None:
    """Palmenhaus: zwei Glasflügel um eine hohe Glaskuppel mit Kupferlaterne, Palmen innen."""
    schatten(iso, 1.0)
    p = iso.p
    # Glasflügel hinten rechts und vorne links
    for x0, x1, y0, y1 in ((-0.95, 0.95, -0.95, -0.45), (-0.95, -0.45, -0.45, 0.95)):
        iso.quader(x0, x1, y0, y1, 0, 16, STEIN)
        glasflaeche_l(iso, x0, x1, y1, 16, 120, max(2, round((x1 - x0) * 4)))
        glasflaeche_r(iso, x1, y0, y1, 16, 120, max(2, round((y1 - y0) * 4)))
        glashaus_dach(iso, x0, x1, y0, y1, 120, 36)
    # Rundbau mit Kuppel vorne rechts
    iso.zylinder(0.3, 0.3, 0.62, 0, 16, STEIN)
    iso.zylinder(0.3, 0.3, 0.6, 16, 262, hell(GLAS, -10), stein=False)
    cx, cy = iso.p(0.3, 0.3, 0)
    rx, ry = 0.6 * HW * math.sqrt(2), 0.6 * HH * math.sqrt(2)
    for k in range(1, 8):  # senkrechte Sprossen
        a = math.pi * k / 8
        x = cx - rx * math.cos(a)
        y = cy + ry * math.sin(a)
        iso.linie((x, y - 16), (x, y - 262), RAHMEN, 2)
    for zz in (80, 160):
        iso.d.arc([cx - rx, cy - ry - zz, cx + rx, cy + ry - zz], 0, 180, fill=RAHMEN, width=2)
    fenster.append([(cx - rx * 0.6, cy - 30), (cx + rx * 0.6, cy - 30), (cx + rx * 0.6, cy - 170), (cx - rx * 0.6, cy - 170)])
    for dx in (-0.25, 0.2):
        palme(iso, 0.3 + dx, 0.3 - dx, 120)
    iso.d.ellipse([cx - rx, cy - ry - 262, cx + rx, cy + ry - 262], fill=RAHMEN, outline=KONTUR)
    spitze = glaskuppel(iso, fenster, 0.3, 0.3, 0.62, 266, 100, kupfer=True)
    iso.d.ellipse([spitze[0] - 4, spitze[1] - 6, spitze[0] + 4, spitze[1] + 2], fill=GOLD_MATT, outline=KONTUR)
    iso.fahne(spitze, 34, PETROL_HELL)
    iso.d.rectangle([cx - 9, cy + ry - 44, cx + 9, cy + ry - 4], fill=TUER, outline=KONTUR)
    iso.banner_r(0.95, -0.7, 116, 44, PETROL)


# —— Aussichtsbaum (turm, 1×1): Aussichtsturm → Pagode ————————————————————


def turm3(iso: Iso, fenster: list) -> None:
    """Hölzerner Aussichtsturm im Baum: Bretterstube, Rundgang, rotes Spitzdach."""
    schatten(iso, 0.5)
    p = iso.p
    iso.zylinder(0.0, 0.0, 0.17, 0, 250, RINDE, stein=False)
    m = iso.p(0, 0, 190)
    krone(iso, m[0] - 4, m[1], 40)
    plattform(iso, 0.46, 220, BRETT)
    iso.quader(-0.32, 0.32, -0.32, 0.32, 220, 270, BEMALT, links=-30, rechts=-8)
    iso.textur_holz(-0.32, 0.32, -0.32, 0.32, 220, 270, 4)
    fenster.append(iso.fenster_l(0.0, 0.32, 232, b=0.18, h=22, bogen=False))
    fenster.append(iso.fenster_r(0.32, 0.0, 232, b=0.18, h=22, bogen=False))
    spitze = iso.pyramide(-0.32, 0.32, -0.32, 0.32, 270, 70, DACHROT, ueber=0.1)
    iso.fahne(spitze, 30, PETROL_HELL)
    for x in (-0.08, 0.1):
        iso.linie(p(x, 0.5, 0), p(x, 0.46, 214), BALKEN, 2)
    for z in range(8, 214, 12):
        iso.linie(p(-0.08, 0.49, z), p(0.1, 0.49, z), hell(BRETT, -14), 2)


def pagode(iso: Iso, fenster: list, dacher: int, dach, h1: int = 48) -> None:
    schatten(iso, 0.55)
    iso.quader(-0.44, 0.44, -0.44, 0.44, 0, 16, STEIN)
    z = 16
    for k in range(dacher):
        a = 0.36 - k * 0.04
        h = 62 if k == 0 else h1
        iso.quader(-a, a, -a, a, z, z + h, BEMALT if k % 2 == 0 else hell(BEMALT, 10), links=-30, rechts=-8)
        if k == 0:
            iso.fenster_l(0.0, a, z, b=0.2, h=34, farbe=TUER, bogen=False)
        fenster.append(iso.fenster_r(a, 0.0, z + h - 30, b=0.14, h=18, bogen=False))
        if k > 0:
            fenster.append(iso.fenster_l(0.0, a, z + h - 30, b=0.14, h=18, bogen=False))
        z += h
        iso.pyramide(-a, a, -a, a, z, 22, dach, ueber=0.16)
        z += 12
    sp = iso.pyramide(-0.14, 0.14, -0.14, 0.14, z, 54, dach, ueber=0.02)
    iso.d.ellipse([sp[0] - 4, sp[1] - 6, sp[0] + 4, sp[1] + 2], fill=GOLD_MATT, outline=KONTUR)
    iso.fahne(sp, 30, PETROL_HELL)


def turm4(iso: Iso, fenster: list) -> None:
    """Pagode mit drei geschwungenen Dächern, salbeigrün bemalt, rote Dächer."""
    pagode(iso, fenster, 5, DACHROT)
    iso.banner_r(0.36, 0.1, 74, 40, PETROL)


def turm5(iso: Iso, fenster: list) -> None:
    """Hohe Pagode mit fünf Kupferdächern und Spitze."""
    pagode(iso, fenster, 6, KUPFER, 56)
    iso.banner_r(0.36, 0.1, 74, 40, PETROL)


# —— Geräteschuppen (werkstatt, 2×2) und Gartentor (eingang, 1×1) ——————————————


def werkstatt2(iso: Iso, fenster: list) -> None:
    """Gärtnerei: Bretterhaus mit Schindeldach, Wasserturm mit Fass auf Stelzen, Regentonne."""
    schatten(iso, 0.95)
    p = iso.p
    # Wasserturm hinten rechts (zuerst, das Haus steht davor)
    tx, ty = 0.62, -0.5
    for sx, sy in ((tx - 0.18, ty - 0.18), (tx + 0.18, ty - 0.18), (tx - 0.18, ty + 0.18), (tx + 0.18, ty + 0.18)):
        iso.quader(sx - 0.03, sx + 0.03, sy - 0.03, sy + 0.03, 0, 150, BALKEN)
    iso.linie(p(tx + 0.18, ty - 0.18, 20), p(tx + 0.18, ty + 0.18, 130), BALKEN, 2)
    iso.linie(p(tx + 0.18, ty + 0.18, 20), p(tx + 0.18, ty - 0.18, 130), BALKEN, 2)
    iso.quader(tx - 0.24, tx + 0.24, ty - 0.24, ty + 0.24, 150, 156, BRETT)
    iso.zylinder(tx, ty, 0.22, 156, 212, RUNDHOLZ, stein=False)
    cx, cy = iso.p(tx, ty, 0)
    rx, ry = 0.22 * HW * math.sqrt(2), 0.22 * HH * math.sqrt(2)
    for zz in (168, 198):
        iso.d.arc([cx - rx, cy - ry - zz, cx + rx, cy + ry - zz], 0, 180, fill=EISEN, width=2)
    sp = iso.kegel(tx, ty, 0.28, 212, 34, SCHINDEL)
    wimpel(iso, sp, 22)
    # Haus
    x0, x1, y0, y1 = -0.85, 0.3, -0.6, 0.7
    iso.quader(x0, x1, y0, y1, 0, 14, STEIN)
    iso.quader(x0, x1, y0, y1, 14, 96, BRETT, links=-36, rechts=-10)
    iso.textur_holz(x0, x1, y0, y1, 14, 96, 7)
    iso.fenster_l(-0.45, y1, 14, b=0.36, h=52, farbe=TUER, bogen=False)
    fenster.append(iso.fenster_l(0.05, y1, 48, b=0.2, h=22, bogen=False))
    fenster.append(iso.fenster_r(x1, 0.1, 48, b=0.22, h=22, bogen=False))
    iso.satteldach(x0, x1, y0, y1, 96, 58, SCHINDEL, BRETT, ueber=0.1)
    # Regentonne vorne rechts, Fallrohr
    iso.zylinder(0.55, 0.6, 0.12, 0, 30, RUNDHOLZ, stein=False)
    iso.banner_r(x1, 0.45, 92, 34, PETROL)


def werkstatt3(iso: Iso, fenster: list) -> None:
    """Gartenmeisterei aus Stein mit Schieferdach und Windpumpe mit Rad, Frühbeete davor."""
    schatten(iso, 0.95)
    p = iso.p
    x0, x1, y0, y1 = -0.9, 0.3, -0.85, 0.45
    iso.quader(x0, x1, y0, y1, 0, 116, STEIN)
    iso.textur_stein(x0, x1, y0, y1, 0, 116)
    iso.fenster_l(-0.5, y1, 0, b=0.34, h=46, farbe=TUER)
    fenster.append(iso.fenster_l(0.0, y1, 54, b=0.18, h=28))
    fenster.append(iso.fenster_r(x1, -0.2, 54, b=0.18, h=28))
    fenster.append(iso.fenster_r(x1, -0.6, 54, b=0.18, h=28))
    iso.satteldach(x0, x1, y0, y1, 116, 64, SCHIEFER, STEIN, ueber=0.1)
    # Windpumpe: Gittermast mit Rad und Fahne
    bx, by = 0.68, -0.2
    for dx, dy in ((-0.14, -0.14), (0.14, -0.14), (-0.14, 0.14), (0.14, 0.14)):
        iso.linie(p(bx + dx, by + dy, 0), p(bx + dx * 0.3, by + dy * 0.3, 296), EISEN, 3)
    for zz in (60, 130, 200, 260):
        f = 1 - zz / 296 * 0.7
        iso.linie(p(bx - 0.14 * f, by + 0.14 * f, zz), p(bx + 0.14 * f, by + 0.14 * f, zz), EISEN, 2)
        iso.linie(p(bx + 0.14 * f, by + 0.14 * f, zz), p(bx + 0.14 * f, by - 0.14 * f, zz), EISEN, 2)
    m = p(bx, by + 0.06, 306)
    iso.d.ellipse([m[0] - 34, m[1] - 34, m[0] + 34, m[1] + 34], outline=EISEN, width=3)
    for k in range(12):
        a = math.pi * k / 6
        iso.poly([m, (m[0] + 32 * math.cos(a), m[1] + 32 * math.sin(a)), (m[0] + 32 * math.cos(a + 0.3), m[1] + 32 * math.sin(a + 0.3))], RAHMEN if k % 2 else hell(RAHMEN, -30), KONTUR)
    iso.d.ellipse([m[0] - 5, m[1] - 5, m[0] + 5, m[1] + 5], fill=DACHROT, outline=KONTUR)
    iso.poly([(m[0] + 4, m[1] - 2), (m[0] + 40, m[1] - 10), (m[0] + 40, m[1] + 6)], PETROL, KONTUR)
    # Frühbeete vorne
    for k in range(2):
        xx = -0.6 + k * 0.6
        iso.quader(xx - 0.24, xx + 0.24, 0.62, 0.9, 0, 12, RUNDHOLZ, ERDE)
        iso.poly([p(xx - 0.24, 0.62, 22), p(xx + 0.24, 0.62, 22), p(xx + 0.24, 0.9, 12), p(xx - 0.24, 0.9, 12)], GLAS + (190,), KONTUR)
    iso.banner_r(x1, 0.2, 112, 40, PETROL)


def eingang2(iso: Iso, fenster: list) -> None:
    """Steinpfeiler mit schmiedeeisernem Tor, Pergola mit Kletterrosen, Laternen."""
    schatten(iso, 0.5)
    p = iso.p
    for x in (-0.44, 0.44):
        iso.quader(x - 0.08, x + 0.08, -0.08, 0.08, 0, 112, STEIN)
        iso.textur_stein(x - 0.08, x + 0.08, -0.08, 0.08, 0, 112, 14)
        iso.quader(x - 0.1, x + 0.1, -0.1, 0.1, 112, 118, hell(STEIN, -10))
        lat = p(x, 0.0, 118)
        lat = [(lat[0] - 5, lat[1]), (lat[0] + 5, lat[1]), (lat[0] + 5, lat[1] - 14), (lat[0] - 5, lat[1] - 14)]
        iso.poly(lat, (230, 180, 80), KONTUR)
        fenster.append(lat)
        iso.poly([(lat[0][0] - 2, lat[3][1]), (lat[1][0] + 2, lat[3][1]), ((lat[0][0] + lat[1][0]) / 2, lat[3][1] - 10)], EISEN, KONTUR)
    # Schmiedeeisernes Tor mit Bogen
    pts = [p(-0.36 + 0.72 * t, 0.0, 70 + 22 * math.sin(math.pi * t)) for t in [k / 12 for k in range(13)]]
    for a, b in zip(pts, pts[1:]):
        iso.linie(a, b, EISEN, 3)
    for k in range(9):
        u = -0.36 + 0.72 * k / 8
        top = 70 + 22 * math.sin(math.pi * k / 8)
        iso.linie(p(u, 0.0, 0), p(u, 0.0, top), EISEN, 2)
    iso.linie(p(-0.36, 0.0, 30), p(0.36, 0.0, 30), EISEN, 2)
    # Pergola: zwei Balken quer, Latten längs, oben Rosen
    for y in (-0.34, 0.34):
        iso.quader(-0.6, 0.6, y - 0.04, y + 0.04, 150, 160, BEMALT)
    for k in range(5):
        u = -0.5 + k * 0.25
        iso.quader(u - 0.03, u + 0.03, -0.42, 0.42, 160, 166, RAHMEN)
    for x in (-0.44, 0.44):
        for y in (-0.34, 0.34):
            iso.linie(p(x, y, 118), p(x, y, 150), RAHMEN, 3)
    for k in range(7):
        a = p(-0.55 + k * 0.18, 0.3 - (k % 2) * 0.5, 168)
        iso.d.ellipse([a[0] - 8, a[1] - 7, a[0] + 8, a[1] + 5], fill=hell(GRUEN, (k % 2) * 12 - 8))
        iso.d.ellipse([a[0] - 3, a[1] - 4, a[0] + 3, a[1] + 1], fill=BLUETEN[0])
    for x in (-0.44, 0.44):
        for z in (40, 90, 130):
            a = p(x, 0.09, z)
            iso.d.ellipse([a[0] - 6, a[1] - 6, a[0] + 6, a[1] + 6], fill=hell(GRUEN, -6))
            iso.d.ellipse([a[0] - 2, a[1] - 2, a[0] + 2, a[1] + 2], fill=BLUETEN[0])


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
    sys.exit(schreibe_epochen("garten", EPOCHEN))
