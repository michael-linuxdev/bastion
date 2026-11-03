#!/usr/bin/env python3
"""Probestück G12 (Wunsch PV 03.11.2026): Bergfried Stufe 3 und Stufe 9 im 3D-Renderer
`raum.py`, in drei Stilen. Schreibt nur in den angegebenen Ordner, nicht in den Atlas.
Aufruf: python3 tools/grafik/probe/probe-raum.py <ordner> [stil …]
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from raum import Szene, bodenschatten, kloetzchen, rendern  # noqa: E402

STEIN = (176, 164, 146)
ZIEGEL = (196, 96, 58)
SCHIEFER = (96, 104, 118)
KUPFER = (92, 156, 138)
HOLZ = (150, 104, 64)
PETROL = (31, 122, 114)
PETROL_HELL = (61, 190, 165)
GOLD = (214, 182, 104)


def zinnen(sz: Szene, x0, x1, y0, y1, z, h=16, n=4, w=0.15, farbe=STEIN):
    sz.quader(x0, x1, y0, y1, z - 8, z, "stein", farbe)
    for k in range(n):
        a = x0 + (x1 - x0) * k / n
        b = y0 + (y1 - y0) * k / n
        lx, ly = (x1 - x0) / n, (y1 - y0) / n
        for (qx0, qx1, qy0, qy1) in (
            (a + lx * 0.12, a + lx * 0.6, y1 - w, y1),
            (a + lx * 0.12, a + lx * 0.6, y0, y0 + w),
            (x1 - w, x1, b + ly * 0.12, b + ly * 0.6),
            (x0, x0 + w, b + ly * 0.12, b + ly * 0.6),
        ):
            sz.quader(qx0, qx1, qy0, qy1, z, z + h, "stein", farbe)


def rundturm(sz: Szene, x, y, r, h, dach, kegel_h, *, fenster=(), fahne=True):
    sz.zylinder(x, y, r, 0, h)
    sz.zylinder(x, y, r * 1.12, h - 8, h + 2, "stein", (160, 150, 134))
    for z in fenster:
        sz.fenster_rund(x, y, r, 0.785, z, 0.1, 18)
    spitze = sz.kegel(x, y, r * 1.28, h + 2, kegel_h, "schiefer" if dach == SCHIEFER else ("kupfer" if dach == KUPFER else "ziegel"), dach)
    if fahne:
        sz.fahne(spitze, 34)


def stufe3() -> Szene:
    sz = Szene()
    # Mauerstück hinten rechts mit Zinnen
    sz.quader(-0.2, 1.4, -1.4, -0.9, 0, 70)
    zinnen(sz, -0.2, 1.4, -1.4, -0.9, 78, 14)
    # Hauptturm
    a = 0.82
    sz.quader(-a, a, -a, a, 0, 250)
    sz.fenster("l", 0.3, a, 0, 0.34, 34, art="tuer")
    for z in (78, 140, 196):
        sz.fenster("l", -0.3, a, z, 0.16, 22)
        sz.fenster("r", -0.3, a, z, 0.16, 22)
    sz.quader(a, a + 0.03, 0.2, 0.44, 150, 236, "tuch", PETROL)  # Banner
    zinnen(sz, -0.95, 0.95, -0.95, 0.95, 262, 18)
    sz.quader(-0.42, 0.42, -0.42, 0.42, 254, 300)
    sz.fenster("l", 0.0, 0.42, 266, 0.14, 16)
    spitze = sz.pyramide(-0.42, 0.42, -0.42, 0.42, 300, 78, "ziegel", ZIEGEL, ueber=0.1)
    sz.fahne(spitze, 44)
    # runder Seitenturm links vorne
    sz.zylinder(-0.55, 1.05, 0.42, 0, 168)
    for z in (60, 112):
        sz.fenster_rund(-0.55, 1.05, 0.42, 1.2, z, 0.12, 20)
    sz.kegel(-0.55, 1.05, 0.52, 168, 82, "ziegel", ZIEGEL)
    return sz


def stufe9() -> Szene:
    sz = Szene()
    dach, mh, kh = KUPFER, 110, 414
    # Mauerring mit Zinnen
    for x0, x1, y0, y1 in ((-1.38, 1.38, -1.38, -1.1), (-1.38, -1.1, -1.1, 1.38), (-1.1, 1.38, 1.1, 1.38), (1.1, 1.38, -1.1, 1.1)):
        sz.quader(x0, x1, y0, y1, 0, mh)
        zinnen(sz, x0, x1, y0, y1, mh + 8, 12, n=6 if (x1 - x0) > 1 or (y1 - y0) > 1 else 1, w=0.1)
    # hinterer Eckturm und Palas
    rundturm(sz, -1.1, -1.1, 0.32, 310, dach, 90, fenster=(170, 230))
    sz.quader(0.2, 1.05, -1.05, -0.45, 0, 150)
    for z in (70, 112):
        for yy in (-0.62, -0.88):
            sz.fenster("r", yy, 1.05, z, 0.14, 22)
    sz.satteldach(0.2, 1.05, -1.05, -0.45, 150, 58, "kupfer", dach, ueber=0.08, giebel=STEIN)
    # Hauptturm
    a = 0.78
    sz.quader(-a, a, -a, a, 0, kh)
    for z in range(140, kh - 40, 60):
        sz.fenster("l", -0.3, a, z, 0.15, 24)
        sz.fenster("r", -0.3, a, z, 0.15, 24)
        sz.fenster("r", 0.3, a, z, 0.15, 24)
    sz.quader(a, a + 0.03, -0.12, 0.12, kh - 120, kh - 16, "tuch", PETROL)
    zinnen(sz, -0.95, 0.95, -0.95, 0.95, kh + 8, 18)
    for ex, ey in ((-0.82, -0.82), (-0.82, 0.82), (0.82, -0.82), (0.82, 0.82)):
        sz.zylinder(ex, ey, 0.17, kh - 40, kh + 34)
        sz.kegel(ex, ey, 0.23, kh + 34, 92, "kupfer", dach)
    # Aufsatz mit Kuppel, Laterne und hoher Spitze
    z = kh + 4
    sz.zylinder(0, 0, 0.46, z, z + 62)
    for w in (0.4, 1.2):
        sz.fenster_rund(0, 0, 0.46, w, z + 14, 0.12, 22)
    oben = sz.kuppel(0, 0, 0.52, z + 62, 62, "kupfer", dach)
    sz.zylinder(0, 0, 0.12, oben[2] - 4, oben[2] + 40, "stein")
    sz.fenster_rund(0, 0, 0.12, 0.785, oben[2] + 8, 0.08, 20)
    spitze = sz.kegel(0, 0, 0.14, oben[2] + 40, 136, "kupfer", dach)
    sz.kugel(0, 0, spitze[2] + 2, 0.05, "gold", GOLD)
    sz.fahne((0, 0, spitze[2] + 4), 40)
    # Torhaus vorne
    th = mh + 96
    for tx in (-0.55, 0.15):
        sz.quader(tx - 0.2, tx + 0.2, 1.02, 1.42, 0, th)
        sz.fenster("l", tx, 1.42, th - 44, 0.12, 18)
        sz.pyramide(tx - 0.2, tx + 0.2, 1.02, 1.42, th, 46, "kupfer", dach, ueber=0.06)
    sz.quader(-0.35, -0.05, 1.08, 1.38, 0, mh + 20)
    sz.fenster("l", -0.2, 1.38, 0, 0.26, 52, art="tuer")
    sz.quader(0.35, 0.38, 1.12, 1.32, th - 70, th - 10, "tuch", PETROL)
    # Ecktürme
    rundturm(sz, -1.15, 1.15, 0.3, 268, dach, 110, fenster=range(60, 240, 60))
    rundturm(sz, 1.15, -1.15, 0.3, 268, dach, 110, fenster=range(60, 240, 60))
    rundturm(sz, 1.15, 1.15, 0.34, 176, dach, 90, fenster=(60, 120))
    return sz


def main() -> int:
    ziel = Path(sys.argv[1])
    ziel.mkdir(parents=True, exist_ok=True)
    stile = sys.argv[2:] or ["weich", "comic", "spielzeug", "kloetzchen"]
    for name, szene, hoehe, r in (("kern_s3", stufe3(), 520, 1.42), ("kern_s9", stufe9(), 800, 1.5)):
        for stil in stile:
            if stil == "kloetzchen":
                tag, abend = kloetzchen(szene, 296, hoehe, 3)
            else:
                tag, abend = rendern(szene, 296, hoehe, 3, stil=stil)
            tag = bodenschatten(tag, 3, r)
            box = tag.getbbox()
            oben = max(0, box[1] - 4) if box else 0
            tag.crop((0, oben, 296, hoehe)).save(ziel / f"{name}-{stil}.png")
            abend.crop((0, oben, 296, hoehe)).save(ziel / f"{name}-{stil}_fenster.png")
            print(name, stil)
    return 0


if __name__ == "__main__":
    sys.exit(main())
