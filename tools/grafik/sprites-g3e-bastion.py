#!/usr/bin/env python3
"""G3 Epochen 2–4, Thema `bastion` (GRAFIK-SPRITES.md §12.11, Entscheidung PV 02.11.2026).

Neue Stufen, je in der Epoche, in der sie zuerst baubar sind (eine Stufe, ein Bild):
  Epoche 2 (Burg):      Bergfried 4–5, Studierstube 3, Späherturm 3, Zimmerei 2, Tor 2
  Epoche 3 (Festung):   Bergfried 6–7, Studierstube 4, Späherturm 4, Zimmerei 3
  Epoche 4 (Zitadelle): Bergfried 8–9, Studierstube 5, Späherturm 5

Materialleiter ab Epoche 2: Stein mit Schieferdach, ab Stufe 8 Kupfer (Grünspan).
Der Steinturm aus Stufe 3 bleibt der Kern; ab Stufe 4 wächst um ihn eine Burg im
Fußabdruck (Mauerring, Ecktürme, Torhaus, Palas, Kuppel), in der Höhe je Stufe nur
um gut 8 % (§12.11). Gleiche Grundkörper wie Epoche 1 (`g3_stil.py`).
Aufruf: python3 tools/grafik/sprites-g3e-bastion.py
"""
from __future__ import annotations

import math
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from g3_stil import *  # noqa: E402,F403
from g3_stil import BREITE, HH, HW, Iso, hell, rundturm, schatten, schreibe_epochen  # noqa: E402


def mauer(iso: Iso, x0, x1, y0, y1, h, *, wand=STEIN, n=4) -> None:
    iso.quader(x0, x1, y0, y1, 0, h, wand)
    iso.textur_stein(x0, x1, y0, y1, 0, h)
    iso.zinnen(x0, x1, y0, y1, h, 12, wand, n=n)


def zinnenkranz_vorne(iso: Iso, a, z, farbe=STEIN, h=18) -> None:
    w = 0.16
    for k in range(4):
        u0 = -a + 2 * a * k / 4
        iso.quader(u0 + 0.22 * a / 0.95, u0 + 0.475 * a / 0.95, a - w, a, z, z + h, farbe)
        iso.quader(a - w, a, u0 + 0.22 * a / 0.95, u0 + 0.475 * a / 0.95, z, z + h, farbe)


# Bauplan je Stufe: Mauerhöhe, Hauptturm, Aufsatz, Ecktürme (links/rechts, vorne, hinten)
PLAN = {
    4: dict(mh=70, kh=268, auf="helm", lr=132, vf=112, hb=0, tor=False, erker=False, palas=False),
    5: dict(mh=70, kh=300, auf="helm", lr=176, vf=124, hb=0, tor=True, erker=False, palas=False),
    6: dict(mh=100, kh=336, auf="doppel", lr=190, vf=140, hb=0, tor=True, erker=True, palas=False),
    7: dict(mh=100, kh=372, auf="doppel", lr=200, vf=150, hb=270, tor=True, erker=True, palas=True),
    8: dict(mh=110, kh=396, auf="kuppel", lr=212, vf=160, hb=290, tor=True, erker=True, palas=True),
    9: dict(mh=110, kh=414, auf="spitze", lr=268, vf=176, hb=310, tor=True, erker=True, palas=True),
}


def bergfried(iso: Iso, fenster: list, stufe: int) -> None:
    """Burg um den Steinturm, Stufe 4 bis 9 (Bauplan `PLAN`)."""
    b = PLAN[stufe]
    dach = KUPFER if stufe >= 8 else SCHIEFER
    mh, kh = b["mh"], b["kh"]
    schatten(iso, 1.5)
    # —— hinten: Mauern, hinterer Eckturm, Palas ——
    mauer(iso, -1.38, 1.38, -1.38, -1.1, mh)
    mauer(iso, -1.38, -1.1, -1.1, 1.38, mh)
    if b["hb"]:
        rundturm(iso, fenster, -1.1, -1.1, 0.32, b["hb"], dach, reihen=(mh + 60, mh + 120), fahne=PETROL_HELL)
    if b["palas"]:
        iso.quader(0.2, 1.2, -1.1, -0.45, 0, 150, STEIN)
        iso.textur_stein(0.2, 1.2, -1.1, -0.45, 0, 150)
        for z in (70, 112):
            fenster.append(iso.fenster_r(1.2, -0.62, z, b=0.16, h=24))
            fenster.append(iso.fenster_r(1.2, -0.92, z, b=0.16, h=24))
        iso.satteldach(0.2, 1.2, -1.1, -0.45, 150, 58, dach, STEIN, ueber=0.08)
    # —— Hauptturm ——
    a = 0.82
    iso.quader(-a, a, -a, a, 0, kh, STEIN)
    iso.textur_stein(-a, a, -a, a, 0, kh)
    for z in range(78, kh - 40, 60):
        fenster.append(iso.fenster_l(-0.3, a, z))
        fenster.append(iso.fenster_r(a, -0.3, z))
        fenster.append(iso.fenster_r(a, 0.3, z))
    iso.banner_r(a, 0.0, kh - 16, 76, PETROL)
    iso.quader(-0.95, 0.95, -0.95, 0.95, kh - 6, kh + 4, hell(STEIN, -8))
    z = kh + 4

    def erker(ex, ey, h=50) -> None:
        iso.zylinder(ex, ey, 0.17, kh - 40, kh + 34, STEIN)
        iso.kegel(ex, ey, 0.23, kh + 34, h, dach)

    if b["erker"]:
        for ex, ey in ((-0.82, -0.82), (-0.82, 0.82), (0.82, -0.82)):
            erker(ex, ey, 50 + (stufe - 6) * 14)
    auf = b["auf"]
    if auf in ("kuppel", "spitze"):
        iso.zylinder(0, 0, 0.46, z, z + 62, STEIN)
        m = iso.p(0, 0, z)
        for wx in (-12, 12):
            pts = [(m[0] + wx - 5, m[1] - 4), (m[0] + wx + 5, m[1] - 4), (m[0] + wx + 5, m[1] - 26), (m[0] + wx - 5, m[1] - 26)]
            iso.poly(pts, FENSTER_TAG, KONTUR)
            fenster.append(pts)
        oben = kuppel(iso, 0, 0, 0.52, z + 62, 62, dach, rippen=6)
        lx, ly = oben
        lh = 28 if auf == "kuppel" else 44
        iso.poly([(lx - 9, ly + 2), (lx + 9, ly + 2), (lx + 9, ly - lh), (lx - 9, ly - lh)], hell(STEIN, 6), KONTUR)
        lat = [(lx - 4, ly - 4), (lx + 4, ly - 4), (lx + 4, ly - lh + 6), (lx - 4, ly - lh + 6)]
        iso.poly(lat, FENSTER_TAG, KONTUR)
        fenster.append(lat)
        sp_h = 92 if auf == "kuppel" else 136
        iso.poly([(lx - 10, ly - lh), (lx + 10, ly - lh), (lx, ly - lh - sp_h)], hell(dach, -6), KONTUR)
        iso.d.ellipse([lx - 4, ly - lh - sp_h - 6, lx + 4, ly - lh - sp_h + 2], fill=GOLD_MATT, outline=KONTUR)
        iso.fahne((lx, ly - lh - sp_h - 4), 40, PETROL_HELL)
    else:
        ah = {"helm": 54, "erker": 70, "doppel": 60}[auf]
        iso.quader(-0.5, 0.5, -0.5, 0.5, z, z + ah, STEIN)
        iso.textur_stein(-0.5, 0.5, -0.5, 0.5, z, z + ah)
        fenster.append(iso.fenster_l(0.0, 0.5, z + 14, b=0.14, h=18))
        fenster.append(iso.fenster_r(0.5, 0.0, z + 14, b=0.14, h=18))
        if auf == "doppel":  # zweiter, schmalerer Aufsatz: gestufter Turm
            iso.quader(-0.56, 0.56, -0.56, 0.56, z + ah, z + ah + 6, hell(STEIN, -8))
            z2 = z + ah + 6
            iso.quader(-0.3, 0.3, -0.3, 0.3, z2, z2 + 48, STEIN)
            fenster.append(iso.fenster_l(0.0, 0.3, z2 + 10, b=0.12, h=18))
            spitze = iso.pyramide(-0.3, 0.3, -0.3, 0.3, z2 + 48, 70 if stufe == 6 else 96, dach, ueber=0.08)
        else:
            helm = {"helm": 96 if stufe == 4 else 116, "erker": 80}[auf]
            if auf == "erker":  # breiter Zeltdach-Helm mit Gauben
                spitze = iso.pyramide(-0.5, 0.5, -0.5, 0.5, z + ah, helm, dach, ueber=0.14)
            else:
                spitze = iso.pyramide(-0.5, 0.5, -0.5, 0.5, z + ah, helm, dach, ueber=0.12)
        iso.fahne(spitze, 44, PETROL_HELL)
    zinnenkranz_vorne(iso, 0.95, kh + 4)
    if b["erker"]:
        erker(0.82, 0.82, 50 + (stufe - 6) * 14)
    # —— vorne: Mauern, Torhaus, Ecktürme ——
    mauer(iso, -1.1, 1.38, 1.1, 1.38, mh)
    mauer(iso, 1.1, 1.38, -1.1, 1.1, mh)
    if b["tor"]:
        th = mh + 64 + (stufe - 5) * 8
        for tx in (-0.55, 0.15):
            iso.quader(tx - 0.2, tx + 0.2, 1.02, 1.42, 0, th, STEIN)
            iso.textur_stein(tx - 0.2, tx + 0.2, 1.02, 1.42, 0, th)
            fenster.append(iso.fenster_l(tx, 1.42, th - 40, b=0.12, h=16))
            iso.pyramide(tx - 0.2, tx + 0.2, 1.02, 1.42, th, 40, dach, ueber=0.06)
        iso.fenster_l(-0.2, 1.38, 0, b=0.36, h=46, farbe=(70, 46, 28))
        iso.banner_r(0.35, 1.22, th - 10, 40, PETROL)
    lr, vf = b["lr"], b["vf"]
    for tx, ty in ((-1.15, 1.15), (1.15, -1.15)):
        rundturm(iso, fenster, tx, ty, 0.3, lr, dach, kegel_h=60 + (stufe - 4) * 10, reihen=tuple(range(40, lr - 30, 50)), fahne=PETROL_HELL if stufe >= 5 else None)
    rundturm(iso, fenster, 1.15, 1.15, 0.34, vf, dach, reihen=tuple(range(40, vf - 30, 50)) or (40,), fahne=PETROL_HELL)


def stufe(n: int):
    return lambda iso, fenster: bergfried(iso, fenster, n)


# —— Studierstube (wissen, 2×2): Bibliothek → Observatorium → Archiv ————————————


def wissen3(iso: Iso, fenster: list) -> None:
    """Bibliothek: Steinsaal mit hohen Bogenfenstern, Schiefer-Satteldach, Treppenturm mit Helm."""
    schatten(iso, 1.0)
    iso.quader(-0.9, 0.9, -0.72, 0.72, 0, 132, STEIN)
    iso.textur_stein(-0.9, 0.9, -0.72, 0.72, 0, 132)
    iso.fenster_l(-0.5, 0.72, 0, b=0.28, h=38, farbe=(70, 46, 28))
    for x in (0.05, 0.5):
        fenster.append(iso.fenster_l(x, 0.72, 34, b=0.2, h=58))
    fenster.append(iso.fenster_r(0.9, -0.3, 34, b=0.2, h=58))
    fenster.append(iso.fenster_r(0.9, 0.3, 34, b=0.2, h=58))
    iso.satteldach(-0.9, 0.9, -0.72, 0.72, 132, 66, SCHIEFER, STEIN, ueber=0.12)
    iso.banner_r(0.9, 0.0, 128, 46, PETROL)
    # Treppenturm hinten links, ragt über den First
    rundturm(iso, fenster, -0.62, -0.38, 0.26, 236, SCHIEFER, kegel_h=72, reihen=(150, 196), fahne=PETROL_HELL)


def wissen4(iso: Iso, fenster: list) -> None:
    """Observatorium: Bibliothek mit rundem Sternturm und Kuppel mit Spalt, Fernrohr."""
    schatten(iso, 1.0)
    iso.quader(-0.9, 0.5, -0.72, 0.72, 0, 132, STEIN)
    iso.textur_stein(-0.9, 0.5, -0.72, 0.72, 0, 132)
    iso.fenster_l(-0.55, 0.72, 0, b=0.28, h=38, farbe=(70, 46, 28))
    fenster.append(iso.fenster_l(-0.05, 0.72, 34, b=0.2, h=58))
    iso.satteldach(-0.9, 0.5, -0.72, 0.72, 132, 66, SCHIEFER, STEIN, ueber=0.1)
    # Sternturm rechts vorne
    iso.zylinder(0.5, 0.15, 0.48, 0, 320, STEIN)
    cx, cy = iso.p(0.5, 0.15, 0)
    vorne = 0.48 * HH * math.sqrt(2)
    for fz in (70, 140, 210, 270):
        pts = [(cx - 5, cy + vorne - fz), (cx + 5, cy + vorne - fz), (cx + 5, cy + vorne - fz - 20), (cx, cy + vorne - fz - 26), (cx - 5, cy + vorne - fz - 20)]
        iso.poly(pts, FENSTER_TAG, KONTUR)
        fenster.append(pts)
    iso.zylinder(0.5, 0.15, 0.56, 320, 330, hell(STEIN, -8))
    oben = kuppel(iso, 0.5, 0.15, 0.5, 330, 64, SCHIEFER, rippen=5)
    # Spalt in der Kuppel und Fernrohr
    sx, sy = oben
    iso.poly([(sx - 5, sy + 4), (sx + 5, sy + 4), (sx + 9, sy + 56), (sx - 1, sy + 56)], FENSTER_TAG, KONTUR)
    iso.linie((sx + 2, sy + 30), (sx + 34, sy - 10), (200, 200, 196), 5)
    iso.banner_r(0.9, -0.45, 120, 46, PETROL)
    iso.fahne((sx, sy), 30, PETROL_HELL)


def wissen5(iso: Iso, fenster: list) -> None:
    """Archiv: zwei Flügel um einen hohen Kuppelturm mit Laterne, Kupferdächer."""
    schatten(iso, 1.0)
    for x0, x1, y0, y1 in ((-0.95, 0.95, -0.95, -0.4), (-0.95, -0.4, -0.4, 0.95)):
        iso.quader(x0, x1, y0, y1, 0, 140, STEIN)
        iso.textur_stein(x0, x1, y0, y1, 0, 140)
    for x in (-0.68,):
        fenster.append(iso.fenster_l(x, 0.95, 40, b=0.18, h=54))
    for y in (-0.62,):
        fenster.append(iso.fenster_r(0.95, y, 40, b=0.18, h=54))
    iso.satteldach(-0.95, 0.95, -0.95, -0.4, 140, 50, KUPFER, STEIN, ueber=0.08)
    iso.quader(-0.95, -0.4, -0.4, 0.95, 140, 150, hell(STEIN, -10))
    iso.zinnen(-0.95, -0.4, -0.4, 0.95, 150, 10, STEIN, n=3)
    # Kuppelturm vorne rechts
    iso.quader(-0.3, 0.95, -0.3, 0.95, 0, 236, STEIN)
    iso.textur_stein(-0.3, 0.95, -0.3, 0.95, 0, 236)
    iso.fenster_l(0.1, 0.95, 0, b=0.3, h=42, farbe=(70, 46, 28))
    fenster.append(iso.fenster_l(0.55, 0.95, 70, b=0.2, h=60))
    fenster.append(iso.fenster_r(0.95, 0.1, 70, b=0.2, h=60))
    fenster.append(iso.fenster_r(0.95, 0.55, 70, b=0.2, h=60))
    iso.banner_r(0.95, 0.33, 226, 60, PETROL)
    iso.quader(-0.38, 1.03, -0.38, 1.03, 236, 246, hell(STEIN, -8))
    iso.zylinder(0.33, 0.33, 0.5, 246, 296, STEIN)
    oben = kuppel(iso, 0.33, 0.33, 0.55, 296, 80, KUPFER, rippen=6)
    lx, ly = oben
    iso.poly([(lx - 8, ly + 2), (lx + 8, ly + 2), (lx + 8, ly - 26), (lx - 8, ly - 26)], hell(STEIN, 6), KONTUR)
    lat = [(lx - 4, ly - 4), (lx + 4, ly - 4), (lx + 4, ly - 20), (lx - 4, ly - 20)]
    iso.poly(lat, FENSTER_TAG, KONTUR)
    fenster.append(lat)
    iso.poly([(lx - 9, ly - 26), (lx + 9, ly - 26), (lx, ly - 70)], hell(KUPFER, -6), KONTUR)
    iso.d.ellipse([lx - 4, ly - 76, lx + 4, ly - 68], fill=GOLD_MATT, outline=KONTUR)
    iso.fahne((lx, ly - 72), 30, PETROL_HELL)


# —— Späherturm (turm, 1×1) ————————————————————————————————————


def turm3(iso: Iso, fenster: list) -> None:
    """Steinerner Wachturm: vierkantig, Kragsims mit Zinnen, Aufsatz mit Schieferhelm."""
    schatten(iso, 0.56)
    iso.quader(-0.42, 0.42, -0.42, 0.42, 0, 230, STEIN)
    iso.textur_stein(-0.42, 0.42, -0.42, 0.42, 0, 230, 12)
    iso.fenster_l(0.0, 0.42, 0, b=0.24, h=34, farbe=(70, 46, 28))
    for z in (76, 150):
        fenster.append(iso.fenster_l(0.0, 0.42, z, b=0.14, h=22))
        fenster.append(iso.fenster_r(0.42, 0.0, z, b=0.14, h=22))
    iso.quader(-0.5, 0.5, -0.5, 0.5, 230, 238, hell(STEIN, -8))
    iso.quader(-0.26, 0.26, -0.26, 0.26, 238, 276, STEIN)
    spitze = iso.pyramide(-0.26, 0.26, -0.26, 0.26, 276, 76, SCHIEFER, ueber=0.08)
    iso.fahne(spitze, 34, PETROL_HELL)
    for k in range(3):
        u = -0.5 + k * 0.38
        iso.quader(u, u + 0.2, 0.36, 0.5, 238, 254, STEIN)
        iso.quader(0.36, 0.5, u, u + 0.2, 238, 254, STEIN)


def turm4(iso: Iso, fenster: list) -> None:
    """Runder Bergturm mit Wehrgang auf Kragsteinen und hohem Kegelhelm."""
    schatten(iso, 0.56)
    iso.zylinder(0, 0, 0.4, 0, 266, STEIN)
    cx, cy = iso.p(0, 0, 0)
    vorne = 0.4 * HH * math.sqrt(2)
    iso.poly([(cx - 10, cy + vorne), (cx + 10, cy + vorne), (cx + 10, cy + vorne - 34), (cx, cy + vorne - 42), (cx - 10, cy + vorne - 34)], (70, 46, 28), KONTUR)
    for fz in (90, 160, 220):
        pts = [(cx - 5, cy + vorne - fz), (cx + 5, cy + vorne - fz), (cx + 5, cy + vorne - fz - 18), (cx, cy + vorne - fz - 23), (cx - 5, cy + vorne - fz - 18)]
        iso.poly(pts, FENSTER_TAG, KONTUR)
        fenster.append(pts)
    iso.zylinder(0, 0, 0.5, 266, 300, hell(STEIN, -6))
    iso.kegel(0, 0, 0.58, 300, 118, SCHIEFER)
    sp = (cx, cy - 300 - 118)
    iso.fahne(sp, 36, PETROL_HELL)
    iso.banner_r(0.36, 0.1, 250, 50, PETROL)


def turm5(iso: Iso, fenster: list) -> None:
    """Hoher Leuchtturm der Zitadelle: Rundturm, Wehrgang, Laternenstube, Kupferspitze."""
    schatten(iso, 0.56)
    iso.zylinder(0, 0, 0.42, 0, 300, STEIN)
    cx, cy = iso.p(0, 0, 0)
    vorne = 0.42 * HH * math.sqrt(2)
    iso.poly([(cx - 10, cy + vorne), (cx + 10, cy + vorne), (cx + 10, cy + vorne - 34), (cx, cy + vorne - 42), (cx - 10, cy + vorne - 34)], (70, 46, 28), KONTUR)
    for fz in (90, 160, 230):
        pts = [(cx - 5, cy + vorne - fz), (cx + 5, cy + vorne - fz), (cx + 5, cy + vorne - fz - 18), (cx, cy + vorne - fz - 23), (cx - 5, cy + vorne - fz - 18)]
        iso.poly(pts, FENSTER_TAG, KONTUR)
        fenster.append(pts)
    iso.zylinder(0, 0, 0.5, 300, 316, hell(STEIN, -6))
    # Laternenstube mit großen Fenstern
    iso.zylinder(0, 0, 0.32, 316, 372, STEIN, stein=False)
    for dx in (-8, 8):
        pts = [(cx + dx - 5, cy - 322), (cx + dx + 5, cy - 322), (cx + dx + 5, cy - 362), (cx + dx - 5, cy - 362)]
        iso.poly(pts, FENSTER_TAG, KONTUR)
        fenster.append(pts)
    sp = iso.kegel(0, 0, 0.4, 372, 104, KUPFER)
    iso.d.ellipse([sp[0] - 4, sp[1] - 6, sp[0] + 4, sp[1] + 2], fill=GOLD_MATT, outline=KONTUR)
    iso.fahne(sp, 36, PETROL_HELL)
    iso.banner_r(0.38, 0.1, 280, 56, PETROL)


# —— Zimmerei (werkstatt, 2×2) und Tor (eingang, 1×1) ———————————————————


def werkstatt2(iso: Iso, fenster: list) -> None:
    """Fachwerk-Zimmerei auf Steinsockel, Ziegeldach, offenes Tor, Holzkran mit Last."""
    schatten(iso, 0.95)
    p = iso.p
    iso.quader(-0.85, 0.6, -0.75, 0.7, 0, 40, STEIN)
    iso.textur_stein(-0.85, 0.6, -0.75, 0.7, 0, 40, 10)
    iso.fenster_l(-0.3, 0.7, 0, b=0.42, h=36, farbe=(70, 46, 28), bogen=False)
    iso.quader(-0.85, 0.6, -0.75, 0.7, 40, 100, PUTZ, links=-30, rechts=-6)
    iso.textur_fachwerk(-0.85, 0.6, -0.75, 0.7, 40, 100)
    fenster.append(iso.fenster_l(0.2, 0.7, 56, b=0.18, h=22, bogen=False))
    fenster.append(iso.fenster_r(0.6, 0.0, 56, b=0.18, h=22, bogen=False))
    iso.satteldach(-0.85, 0.6, -0.75, 0.7, 100, 56, ZIEGEL, PUTZ, ueber=0.1)
    # Holzkran rechts: Mast, Ausleger, Seil, Balkenlast
    iso.quader(0.72, 0.84, 0.3, 0.42, 0, 210, HOLZ, links=-40, rechts=-8)
    iso.linie(p(0.78, 0.36, 206), p(0.2, 0.36, 250), BALKEN, 4)
    iso.linie(p(0.78, 0.36, 150), p(0.5, 0.36, 230), BALKEN, 3)
    iso.linie(p(0.28, 0.36, 246), p(0.28, 0.36, 170), (200, 190, 160), 2)
    iso.quader(0.1, 0.46, 0.3, 0.42, 160, 170, hell(HOLZ, 20))
    for k in range(3):
        iso.quader(0.66, 0.95, 0.55 - k * 0.0, 0.85, k * 6, k * 6 + 6, hell(HOLZ, 26 - k * 8))
    iso.banner_r(0.6, -0.45, 96, 36, PETROL)


def werkstatt3(iso: Iso, fenster: list) -> None:
    """Steinerne Bauhütte mit Schieferdach, Tretradkran, Werkplatz mit Quadern."""
    schatten(iso, 0.95)
    p = iso.p
    iso.quader(-0.9, 0.35, -0.85, 0.5, 0, 120, STEIN)
    iso.textur_stein(-0.9, 0.35, -0.85, 0.5, 0, 120)
    iso.fenster_l(-0.5, 0.5, 0, b=0.36, h=44, farbe=(70, 46, 28))
    fenster.append(iso.fenster_l(0.0, 0.5, 52, b=0.18, h=30))
    fenster.append(iso.fenster_r(0.35, -0.2, 52, b=0.18, h=30))
    fenster.append(iso.fenster_r(0.35, -0.6, 52, b=0.18, h=30))
    iso.satteldach(-0.9, 0.35, -0.85, 0.5, 120, 66, SCHIEFER, STEIN, ueber=0.1)
    # Tretradkran rechts vorne: Rad, Mast, langer Ausleger
    m = p(0.62, 0.55, 64)
    iso.d.ellipse([m[0] - 46, m[1] - 46, m[0] + 46, m[1] + 46], outline=BALKEN, width=5)
    for k in range(6):
        a = math.pi * k / 6
        iso.linie((m[0] - 44 * math.cos(a), m[1] - 44 * math.sin(a)), (m[0] + 44 * math.cos(a), m[1] + 44 * math.sin(a)), HOLZ, 2)
    iso.quader(0.74, 0.86, 0.1, 0.22, 0, 300, HOLZ, links=-40, rechts=-8)
    iso.linie(p(0.8, 0.16, 296), p(-0.3, 0.16, 330), BALKEN, 5)
    iso.linie(p(0.8, 0.16, 220), p(0.2, 0.16, 316), BALKEN, 3)
    iso.linie(p(-0.2, 0.16, 326), p(-0.2, 0.16, 200), (200, 190, 160), 2)
    iso.quader(-0.32, -0.08, 0.06, 0.26, 180, 200, STEIN)
    for x, y, h in ((0.5, 0.86, 18), (0.78, 0.84, 12)):
        iso.quader(x - 0.13, x + 0.1, y - 0.12, y + 0.08, 0, h, STEIN)
    iso.banner_r(0.35, 0.3, 116, 40, PETROL)
    iso.fahne(p(0.8, 0.16, 300), 30, PETROL_HELL)


def eingang2(iso: Iso, fenster: list) -> None:
    """Steinernes Torhaus: Rundbogen mit Fallgitter, Zinnen, Schieferhelm, Banner."""
    schatten(iso, 0.5)
    p = iso.p
    iso.quader(-0.5, 0.5, -0.22, 0.22, 0, 120, STEIN)
    iso.textur_stein(-0.5, 0.5, -0.22, 0.22, 0, 120, 12)
    bogen = iso.fenster_l(0.0, 0.22, 0, b=0.46, h=46, farbe=(70, 46, 28))
    for k in range(1, 5):
        u = -0.23 + 0.46 * k / 5
        iso.linie(p(u, 0.22, 2), p(u, 0.22, 56), (40, 36, 32), 2)
    for z in (16, 32, 48):
        iso.linie(p(-0.22, 0.22, z), p(0.22, 0.22, z), (40, 36, 32), 2)
    fenster.append(iso.fenster_r(0.5, 0.0, 78, b=0.12, h=18))
    iso.quader(-0.56, 0.56, -0.28, 0.28, 120, 128, hell(STEIN, -8))
    iso.quader(-0.3, 0.3, -0.18, 0.18, 128, 164, STEIN)
    fenster.append(iso.fenster_l(0.0, 0.18, 136, b=0.12, h=16))
    spitze = iso.pyramide(-0.3, 0.3, -0.18, 0.18, 164, 56, SCHIEFER, ueber=0.06)
    iso.fahne(spitze, 30, PETROL_HELL)
    for k in range(3):
        u = -0.56 + k * 0.42
        iso.quader(u, u + 0.2, 0.16, 0.28, 128, 144, STEIN)
    iso.banner_r(0.5, 0.0, 116, 40, PETROL)
    del bogen


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
    sys.exit(schreibe_epochen("bastion", EPOCHEN))
