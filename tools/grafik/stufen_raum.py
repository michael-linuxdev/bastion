#!/usr/bin/env python3
"""Neue Stufenleitern (Wunsch PV 03.11.2026): jede Stufe ist dasselbe Gebäude wie die
vorige plus genau ein neues, gut sichtbares Teil (GRAFIK-SPRITES.md §13.2).

Vorschau für den PV: Bergfried (bastion, Stufe 1–9) und Gewächshaus (garten, 1–5)
im Stil „weich gerendert“ (`raum.py`). Schreibt nur in den angegebenen Ordner.
Aufruf: python3 tools/grafik/stufen_raum.py <ordner> [bergfried|gewaechshaus …]
"""
from __future__ import annotations

import sys
from multiprocessing import Pool
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from raum import (  # noqa: E402
    EISEN,
    ERDE,
    GOLD,
    HOLZ,
    KUPFER,
    LAUB,
    SCHINDEL,
    SOCKEL,
    STEIN,
    ZIEGEL,
    Szene,
    rendern,
)

TERRAKOTTA = (186, 104, 70)
BLUETE = ((214, 96, 112), (236, 196, 84), (176, 120, 196))


# —— Bergfried (kern, 3 × 3) ————————————————————————————————————————————————


def bergfried(stufe: int) -> Szene:
    """1 Holzturm · 2 Stein unten, Fachwerk oben · 3 Steinturm mit Zinnen und Helm ·
    4 Ringmauer · 5 Torhaus · 6 zwei Ecktürme · 7 Palas im Hof · 8 Turm ein Geschoss
    höher mit Erkertürmchen · 9 Krönung: Kupferdächer, hohe Spitze, dritter Eckturm."""
    sz = Szene()
    sz.schatten_r = 0.95 if stufe <= 3 else 1.5
    dach, dachfarbe = ("kupfer", KUPFER) if stufe >= 9 else ("ziegel", ZIEGEL)
    # —— hinten zuerst ist egal: der Renderer verdeckt richtig ——
    if stufe >= 4:  # Ringmauer mit Zinnen
        h = 64
        for x0, x1, y0, y1 in ((-1.42, 1.42, -1.42, -1.2), (-1.42, -1.2, -1.2, 1.42), (-1.2, 1.42, 1.2, 1.42), (1.2, 1.42, -1.2, 1.2)):
            sz.quader(x0, x1, y0, y1, 0, h)
            n = max(1, round(max(x1 - x0, y1 - y0) / 0.42))
            sz.zinnen(x0, x1, y0, y1, h + 8, 12, n=n, w=0.1)
        if stufe == 4:
            sz.fenster("l", -0.35, 1.42, 0, 0.36, 44, art="tuer")
    if stufe >= 5:  # Torhaus vorne
        sz.quader(-0.72, 0.02, 1.08, 1.5, 0, 128)
        sz.fenster("l", -0.35, 1.5, 0, 0.36, 50, art="tuer")
        sz.fenster("l", -0.35, 1.5, 84, 0.14, 20)
        sz.pyramide(-0.72, 0.02, 1.08, 1.5, 128, 58, dach, dachfarbe, ueber=0.06)
        sz.banner("r", 1.29, 0.02, 120, 44)
    if stufe >= 6:  # Ecktürme
        ecken = [(-1.2, 1.2), (1.2, -1.2)] + ([(1.2, 1.2)] if stufe >= 9 else [])
        for ex, ey in ecken:
            sz.zylinder(ex, ey, 0.3, 0, 150)
            sz.zylinder(ex, ey, 0.34, 142, 152, "stein", SOCKEL)
            for z in (60, 104):
                sz.fenster_rund(ex, ey, 0.3, 0.785, z, 0.1, 18)
            spitze = sz.kegel(ex, ey, 0.38, 152, 74, dach, dachfarbe)
            if stufe >= 9:
                sz.fahne(spitze, 34)
    if stufe >= 7:  # Palas im Hof hinten rechts
        sz.quader(0.2, 1.18, -1.18, -0.55, 0, 118)
        for yy in (-0.72, -1.0):
            for z in (54, 88):
                sz.fenster("r", yy, 1.18, z, 0.14, 22)
        sz.satteldach(0.2, 1.18, -1.18, -0.55, 118, 50, dach, dachfarbe, ueber=0.07, giebel=STEIN)
    # —— der Turm selbst ——
    if stufe == 1:
        sz.quader(-0.78, 0.78, -0.78, 0.78, 0, 14, "stein", SOCKEL)
        sz.quader(-0.66, 0.66, -0.66, 0.66, 14, 118, "holz", HOLZ)
        sz.fenster("l", 0.05, 0.66, 14, 0.3, 34, art="tuer", bogen=False)
        sz.fenster("r", -0.1, 0.66, 70, 0.18, 20, bogen=False)
        sz.pyramide(-0.66, 0.66, -0.66, 0.66, 118, 58, "schindel", SCHINDEL, ueber=0.14)
        return sz
    if stufe == 2:
        sz.quader(-0.8, 0.8, -0.8, 0.8, 0, 96)
        sz.fenster("l", 0.3, 0.8, 0, 0.32, 36, art="tuer")
        sz.fenster("r", 0.0, 0.8, 44, 0.18, 22)
        sz.quader(-0.9, 0.9, -0.9, 0.9, 96, 186, "fachwerk", (236, 226, 204))
        for u in (-0.3, 0.3):
            sz.fenster("l", u, 0.9, 116, 0.2, 26, bogen=False)
        sz.fenster("r", -0.3, 0.9, 116, 0.2, 26, bogen=False)
        sz.banner("r", 0.42, 0.9, 92, 52)
        spitze = sz.pyramide(-0.9, 0.9, -0.9, 0.9, 186, 92, "ziegel", ZIEGEL, ueber=0.16)
        sz.fahne(spitze, 40)
        return sz
    a = 0.82
    H = 330 if stufe >= 8 else 250
    sz.quader(-a, a, -a, a, 0, H)
    sz.fenster("l", 0.3, a, 0, 0.34, 40, art="tuer")
    for z in range(78, H - 40, 60):
        sz.fenster("l", 0.3 if z > 40 else -0.3, a, z, 0.16, 24)
        sz.fenster("r", -0.3, a, z, 0.16, 24)
        sz.fenster("r", 0.3, a, z, 0.16, 24)
    sz.banner("r", 0.0, a, H - 14, 70)
    sz.quader(-0.95, 0.95, -0.95, 0.95, H - 6, H + 4, "stein", SOCKEL)
    sz.zinnen(-0.95, 0.95, -0.95, 0.95, H + 12, 18)
    if stufe >= 8:  # Erkertürmchen an den Ecken
        for ex, ey in ((-0.84, -0.84), (-0.84, 0.84), (0.84, -0.84), (0.84, 0.84)):
            sz.zylinder(ex, ey, 0.16, H - 34, H + 40)
            sz.kegel(ex, ey, 0.21, H + 40, 58, dach, dachfarbe)
    sz.quader(-0.42, 0.42, -0.42, 0.42, H + 4, H + 54)
    sz.fenster("l", 0.0, 0.42, H + 16, 0.14, 18)
    sz.fenster("r", 0.0, 0.42, H + 16, 0.14, 18)
    if stufe >= 9:  # Krönung: hohe Kupferspitze mit Knauf
        spitze = sz.pyramide(-0.42, 0.42, -0.42, 0.42, H + 54, 170, dach, dachfarbe, ueber=0.08)
        sz.kugel(spitze[0], spitze[1], spitze[2] + 3, 0.045, "gold", GOLD)
        sz.fahne((spitze[0], spitze[1], spitze[2] + 6), 44)
    else:
        spitze = sz.pyramide(-0.42, 0.42, -0.42, 0.42, H + 54, 80, dach, dachfarbe, ueber=0.1)
        sz.fahne(spitze, 44)
    return sz


# —— Gewächshaus (wissen, 2 × 2) ————————————————————————————————————————————


def glashaus(sz: Szene, x0, x1, y0, y1, sockel: float, wand: float, dach: float, *, quer=False):
    """Glashaus: Sockel, Glaswände mit Holzrahmen und Sprossen, Glas-Satteldach."""
    sz.quader(x0, x1, y0, y1, 0, sockel, "stein", SOCKEL)
    sz.quader(x0 + 0.03, x1 - 0.03, y0 + 0.03, y1 - 0.03, sockel, wand, "glas", (200, 230, 236))
    p = 0.028
    for x in (x0, x1 - p):  # Eckpfosten
        for y in (y0, y1 - p):
            sz.quader(x, x + p, y, y + p, sockel, wand, "holz", (236, 232, 220))
    schritt = 0.3
    n_x = max(1, round((x1 - x0) / schritt))
    for k in range(1, n_x):
        x = x0 + (x1 - x0) * k / n_x
        sz.quader(x - 0.012, x + 0.012, y1 - 0.03, y1, sockel, wand, "holz", (236, 232, 220))
        sz.quader(x - 0.012, x + 0.012, y0, y0 + 0.03, sockel, wand, "holz", (236, 232, 220))
    n_y = max(1, round((y1 - y0) / schritt))
    for k in range(1, n_y):
        y = y0 + (y1 - y0) * k / n_y
        sz.quader(x1 - 0.03, x1, y - 0.012, y + 0.012, sockel, wand, "holz", (236, 232, 220))
        sz.quader(x0, x0 + 0.03, y - 0.012, y + 0.012, sockel, wand, "holz", (236, 232, 220))
    sz.quader(x0, x1, y0, y1, wand - 4, wand, "holz", (236, 232, 220))  # Traufbalken (Rahmen)
    sz.quader(x0 + 0.03, x1 - 0.03, y0 + 0.03, y1 - 0.03, wand - 3.9, wand + 0.5, "glas", (200, 230, 236))
    sz.satteldach(x0 + 0.02, x1 - 0.02, y0 + 0.02, y1 - 0.02, wand, dach, "glas", (200, 230, 236), ueber=0.0, giebel=None, quer=quer)
    if quer:
        sz.quader((x0 + x1) / 2 - 0.02, (x0 + x1) / 2 + 0.02, y0, y1, wand + dach - 3, wand + dach + 1, "holz", (236, 232, 220))
    else:
        sz.quader(x0, x1, (y0 + y1) / 2 - 0.02, (y0 + y1) / 2 + 0.02, wand + dach - 3, wand + dach + 1, "holz", (236, 232, 220))


def pflanzen(sz: Szene, x0, x1, y0, y1, boden: float, reihe: int):
    """Tisch mit Töpfen und Pflanzen, Blüten in drei Farben (feste Folge)."""
    sz.quader(x0, x1, y0, y1, boden, boden + 3, "erde", ERDE)
    n = max(2, round((x1 - x0) / 0.22)) if (x1 - x0) >= (y1 - y0) else max(2, round((y1 - y0) / 0.22))
    for k in range(n):
        t = (k + 0.5) / n
        if (x1 - x0) >= (y1 - y0):
            x, y = x0 + (x1 - x0) * t, (y0 + y1) / 2
        else:
            x, y = (x0 + x1) / 2, y0 + (y1 - y0) * t
        sz.zylinder(x, y, 0.05, boden + 3, boden + 11, "glatt", TERRAKOTTA, n=16)
        sz.kugel(x, y, boden + 20, 0.085, "laub", LAUB, rz=0.16)
        if (k + reihe) % 2 == 0:
            sz.kugel(x + 0.03, y + 0.03, boden + 26, 0.035, "glatt", BLUETE[(k + reihe) % 3])


def fruehbeet(sz: Szene):
    sz.quader(-0.6, 0.1, 0.5, 0.92, 0, 16, "holz", HOLZ)
    sz.quader(-0.56, 0.06, 0.54, 0.88, 16, 17, "erde", ERDE)
    for k in range(4):
        sz.kugel(-0.48 + k * 0.17, 0.71, 22, 0.06, "laub", LAUB, rz=0.1)
    sz.quader(-0.6, 0.1, 0.5, 0.56, 16, 30, "holz", HOLZ)  # hintere Kante höher
    sz.quader(-0.58, 0.08, 0.52, 0.9, 30, 31, "glas", (200, 230, 236))


def gewaechshaus(stufe: int) -> Szene:
    """1 Frühbeet mit Töpfen · 2 kleines Glashaus auf Holzsockel · 3 langes Glashaus auf
    Steinsockel, Regentonne · 4 zweiter Flügel (L-Form) · 5 Palmenhaus: runder Glasbau
    mit Kuppel und Palme."""
    sz = Szene()
    sz.schatten_r = 0.6 if stufe == 1 else 1.0
    fruehbeet(sz)
    for k, (x, y) in enumerate(((0.3, 0.75), (0.48, 0.62), (0.62, 0.82))):
        if stufe == 1 or k < 2:
            sz.zylinder(x, y, 0.06, 0, 12, "glatt", TERRAKOTTA, n=16)
            sz.kugel(x, y, 22, 0.08, "laub", LAUB, rz=0.13)
    if stufe == 1:
        return sz
    if stufe == 2:
        glashaus(sz, -0.5, 0.5, -0.95, -0.3, 10, 60, 32)
        pflanzen(sz, -0.4, 0.4, -0.7, -0.55, 18, 0)
        return sz
    glashaus(sz, -0.92, 0.92, -0.95, -0.3, 18, 80, 40)
    pflanzen(sz, -0.8, 0.8, -0.72, -0.53, 26, 0)
    sz.zylinder(-0.84, 0.3, 0.11, 0, 34, "holz", HOLZ, n=20)  # Regentonne
    sz.zylinder(-0.84, 0.3, 0.115, 8, 11, "eisen", EISEN, n=20)
    sz.zylinder(-0.84, 0.3, 0.115, 25, 28, "eisen", EISEN, n=20)
    if stufe >= 4:
        glashaus(sz, 0.2, 0.92, -0.32, 0.92, 18, 80, 40, quer=True)
        pflanzen(sz, 0.47, 0.65, -0.2, 0.8, 26, 1)
        for y in (0.1, 0.5):  # Kletterpflanze am Rahmen
            sz.kugel(0.93, y, 50, 0.04, "laub", LAUB, rz=0.32)
    if stufe >= 5:
        cx, cy, r = -0.58, 0.08, 0.34
        sz.zylinder(cx, cy, r, 0, 18, "stein", SOCKEL)
        sz.zylinder(cx, cy, r - 0.02, 18, 74, "glas", (200, 230, 236))
        for k in range(8):
            import math

            w = 2 * math.pi * k / 8
            sz.zylinder(cx + r * 0.98 * math.cos(w), cy + r * 0.98 * math.sin(w), 0.014, 18, 74, "holz", (236, 232, 220), n=8)
        sz.zylinder(cx, cy, r + 0.01, 70, 76, "holz", (236, 232, 220))
        oben = sz.kuppel(cx, cy, r, 76, 30, "glas", (200, 230, 236))
        sz.kugel(cx, cy, oben[2] + 3, 0.04, "gold", GOLD)
        # Palme innen
        sz.zylinder(cx, cy, 0.035, 18, 84, "holz", HOLZ, n=12)
        for k in range(6):
            w = 2 * math.pi * k / 6
            sz.kugel(cx + 0.13 * math.cos(w), cy + 0.13 * math.sin(w), 84, 0.14, "laub", (78, 132, 60), rz=0.05)
        sz.kugel(cx, cy, 88, 0.08, "laub", (78, 132, 60))
    return sz


LEITERN = {
    "bergfried": (bergfried, range(1, 10), 3, 296),
    "gewaechshaus": (gewaechshaus, range(1, 6), 2, 200),
}


def _eins(auftrag):
    name, stufe, ziel = auftrag
    bau, _, n, breite = LEITERN[name]
    tag, abend = rendern(bau(stufe), breite, n)
    tag.save(Path(ziel) / f"{name}_s{stufe}.png")
    abend.save(Path(ziel) / f"{name}_s{stufe}_fenster.png")
    return name, stufe, tag.size


def main() -> int:
    ziel = Path(sys.argv[1])
    ziel.mkdir(parents=True, exist_ok=True)
    namen = sys.argv[2:] or list(LEITERN)
    auftraege = [(n, s, str(ziel)) for n in namen for s in LEITERN[n][1]]
    with Pool(4) as pool:
        for name, stufe, groesse in pool.imap_unordered(_eins, auftraege):
            print(name, stufe, groesse, flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
