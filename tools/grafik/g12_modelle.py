"""G12: Modelle aller Gebäude im Stil „weich gerendert“ (GRAFIK-SPRITES.md §13).

Jede Leiter ist aufbauend: Stufe n ist dasselbe Gebäude wie Stufe n−1 plus genau ein
neues Teil, das zur Aufgabe passt (§13.2). Damit die Stufe ohne Ziffer lesbar bleibt
und der Umriss-Test (`atlas-stufen.test.ts`) hält, wächst zugleich die Hauptmasse
etwas in die Höhe (Faktor `w`).

Koordinaten: x, y in Feldern um die Mitte des Fußabdrucks (3 × 3: ±1,5; 2 × 2: ±1;
1 × 1: ±0,5), z in Pixeln (doppelte Größe) wie G3.
"""
from __future__ import annotations

import math

from raum import (
    BALKEN,
    EISEN,
    ERDE,
    GOLD,
    HOLZ,
    KUPFER,
    LAUB,
    PETROL,
    PETROL_HELL,
    PUTZ,
    SCHIEFER,
    SCHINDEL,
    SOCKEL,
    STEIN,
    ZIEGEL,
    Szene,
)

GLAS_F = (200, 230, 236)
RAHMEN_W = (236, 232, 220)
TERRAKOTTA = (186, 104, 70)
BLUETE = ((214, 96, 112), (236, 196, 84), (176, 120, 196), (240, 240, 236))
BRUCH = (168, 150, 128)  # Bruchstein Dorf
FEUER = (255, 170, 70)
LATERNE = (255, 210, 120)
PERLMUTT = (236, 230, 218)
KORALLE = (226, 122, 100)
MESSING = (204, 164, 86)
KUPPELGLAS = (150, 210, 226)
SAND = (222, 204, 160)
PANEEL = (226, 230, 236)
SOLAR = (44, 66, 118)
METALL = (176, 182, 190)
WARN = (236, 196, 60)
KRISTALL = (176, 120, 220)


def w(stufe: int, ab: int, f: float = 1.1) -> float:
    """Wachstum der Hauptmasse ab Stufe `ab` (eine Stufe: Faktor f)."""
    return f ** max(0, stufe - ab)


# —— gemeinsame Bauteile ——————————————————————————————————————————————————


def haus(sz: Szene, x0, x1, y0, y1, h, wand="putz", farbe=PUTZ, dach="ziegel", dachfarbe=ZIEGEL, dh=50, *, quer=False, ueber=0.1, sockel=0, fenster=True, tuer=None):
    """Haus mit Satteldach; Fenster in Reihen auf der linken und rechten Fläche."""
    if sockel:
        sz.quader(x0 - 0.02, x1 + 0.02, y0 - 0.02, y1 + 0.02, 0, sockel, "stein", SOCKEL)
    sz.quader(x0, x1, y0, y1, sockel, h, wand, farbe)
    if fenster:
        stock = 48
        for z in range(int(sockel + 18), int(h - 26), stock):
            for k in range(max(1, round((x1 - x0) / 0.42))):
                u = x0 + (x1 - x0) * (k + 0.5) / max(1, round((x1 - x0) / 0.42))
                if tuer is None or abs(u - tuer) > 0.2 or z > sockel + 40:
                    sz.fenster("l", u, y1, z, 0.16, 22, bogen=wand == "stein")
            for k in range(max(1, round((y1 - y0) / 0.42))):
                u = y0 + (y1 - y0) * (k + 0.5) / max(1, round((y1 - y0) / 0.42))
                sz.fenster("r", u, x1, z, 0.16, 22, bogen=wand == "stein")
    if tuer is not None:
        sz.fenster("l", tuer, y1, sockel, 0.26, 36, art="tuer", bogen=wand == "stein")
    sz.satteldach(x0, x1, y0, y1, h, dh, dach, dachfarbe, ueber=ueber, giebel=farbe, quer=quer)


def rundturm(sz: Szene, x, y, r, h, dach="ziegel", dachfarbe=ZIEGEL, kh=None, *, mat="stein", farbe=STEIN, fahne=False, fenster=True):
    sz.zylinder(x, y, r, 0, h, mat, farbe)
    if fenster:
        for z in range(50, int(h - 30), 52):
            sz.fenster_rund(x, y, r, 0.785, z, 0.1, 18)
    spitze = sz.kegel(x, y, r * 1.25, h, kh or r * 230, dach, dachfarbe)
    if fahne:
        sz.fahne(spitze, 34)
    return spitze


def baum(sz: Szene, x, y, h, r, *, stamm=0.07, farbe=LAUB):
    """Laubbaum: Stamm und Krone aus mehreren Kugeln (feste Lage)."""
    sz.zylinder(x, y, stamm, 0, h * 0.5, "holz", (112, 80, 52), n=14)
    for dx, dy, dz, f in ((0, 0, 0.7, 1.0), (-0.55, 0.25, 0.58, 0.7), (0.5, -0.15, 0.6, 0.72), (0.15, 0.5, 0.56, 0.66), (0.05, -0.25, 0.84, 0.66)):
        sz.kugel(x + dx * r, y + dy * r, h * dz, r * f, "laub", farbe, rz=r * f * 0.88)


def pflanzen(sz: Szene, x0, x1, y0, y1, boden: float, reihe: int):
    sz.quader(x0, x1, y0, y1, boden, boden + 3, "erde", ERDE)
    lang = (x1 - x0) >= (y1 - y0)
    n = max(2, round(((x1 - x0) if lang else (y1 - y0)) / 0.22))
    for k in range(n):
        t = (k + 0.5) / n
        x, y = (x0 + (x1 - x0) * t, (y0 + y1) / 2) if lang else ((x0 + x1) / 2, y0 + (y1 - y0) * t)
        sz.zylinder(x, y, 0.05, boden + 3, boden + 11, "glatt", TERRAKOTTA, n=16)
        sz.kugel(x, y, boden + 20, 0.085, "laub", LAUB, rz=0.16)
        if (k + reihe) % 2 == 0:
            sz.kugel(x + 0.03, y + 0.03, boden + 26, 0.035, "glatt", BLUETE[(k + reihe) % 3])


def glashaus(sz: Szene, x0, x1, y0, y1, sockel, wand, dach, *, quer=False):
    sz.quader(x0, x1, y0, y1, 0, sockel, "stein", SOCKEL)
    sz.quader(x0 + 0.03, x1 - 0.03, y0 + 0.03, y1 - 0.03, sockel, wand, "glas", GLAS_F)
    p = 0.028
    for x in (x0, x1 - p):
        for y in (y0, y1 - p):
            sz.quader(x, x + p, y, y + p, sockel, wand, "holz", RAHMEN_W)
    for k in range(1, max(1, round((x1 - x0) / 0.3))):
        x = x0 + (x1 - x0) * k / max(1, round((x1 - x0) / 0.3))
        sz.quader(x - 0.012, x + 0.012, y1 - 0.03, y1, sockel, wand, "holz", RAHMEN_W)
    for k in range(1, max(1, round((y1 - y0) / 0.3))):
        y = y0 + (y1 - y0) * k / max(1, round((y1 - y0) / 0.3))
        sz.quader(x1 - 0.03, x1, y - 0.012, y + 0.012, sockel, wand, "holz", RAHMEN_W)
    sz.quader(x0, x1, y0, y1, wand - 4, wand, "holz", RAHMEN_W)
    sz.satteldach(x0 + 0.02, x1 - 0.02, y0 + 0.02, y1 - 0.02, wand, dach, "glas", GLAS_F, ueber=0.0, giebel=None, quer=quer)
    if quer:
        sz.quader((x0 + x1) / 2 - 0.02, (x0 + x1) / 2 + 0.02, y0, y1, wand + dach - 3, wand + dach + 1, "holz", RAHMEN_W)
    else:
        sz.quader(x0, x1, (y0 + y1) / 2 - 0.02, (y0 + y1) / 2 + 0.02, wand + dach - 3, wand + dach + 1, "holz", RAHMEN_W)


def kuppelbau(sz: Szene, x, y, r, h, kh, *, wand="perlmutt", farbe=PERLMUTT, glas="scheibe", glasfarbe=KUPPELGLAS, fenster=True):
    """Unterwasser: Trommel aus Perlmutt mit Bullaugen und gläserner Kuppel."""
    sz.zylinder(x, y, r, 0, h, wand, farbe)
    sz.zylinder(x, y, r * 1.04, h - 6, h, "metall", MESSING)
    if fenster:
        for z in range(14, int(h - 18), 34):
            for wkl in (0.35, 1.2):
                sz.fenster_rund(x, y, r, wkl, z, 0.1, 16)
    return sz.kuppel(x, y, r, h, kh, glas, glasfarbe)


def modul(sz: Szene, x, y, r, z0, h, *, fenster=True):
    """Weltraum: Modul als Zylinder aus Paneelen mit Ringen und Fenstern."""
    sz.zylinder(x, y, r, z0, z0 + h, "paneel", PANEEL)
    for z in (z0 + 4, z0 + h - 4):
        sz.zylinder(x, y, r * 1.05, z - 3, z + 3, "metall", METALL)
    if fenster:
        for wkl in (0.3, 1.0, 1.7):
            sz.fenster_rund(x, y, r, wkl, z0 + h * 0.42, 0.09, 14)


def solarfluegel(sz: Szene, x, y, z, laenge, *, richtung=(1, -1)):
    """Ausleger mit zwei Solarflächen (waagrecht, schräg zum Betrachter)."""
    dx, dy = richtung
    n = math.hypot(dx, dy)
    dx, dy = dx / n, dy / n
    ende = (x + dx * laenge, y + dy * laenge, z)
    sz.balken((x, y, z), ende, 0.03, 0.03, "metall", METALL)
    for t0, t1 in ((0.25, 0.6), (0.65, 1.0)):
        a = (x + dx * laenge * t0, y + dy * laenge * t0, z)
        b = (x + dx * laenge * t1, y + dy * laenge * t1, z)
        sz.balken(a, b, 0.42, 0.014, "solar", SOLAR, quer=(0.0, 0.0, 1.0))


def schuessel(sz: Szene, x, y, z, r, *, mast=True):
    """Parabolschüssel: flache Kugelkappe auf kurzem Stiel."""
    if mast:
        sz.zylinder(x, y, 0.025, z - 20, z, "metall", METALL, n=10)
    sz.kugel(x, y, z + 4, r, "paneel", PANEEL, rz=r * 0.28)
    sz.zylinder(x, y, 0.012, z + 4, z + 4 + r * 70, "metall", METALL, n=8)


def laterne(sz: Szene, x, y, z, *, pfahl=True, farbe=LATERNE):
    """Kleine Laterne (leuchtet abends), auf Pfahl oder hängend an z."""
    if pfahl:
        sz.zylinder(x, y, 0.016, 0, z, "eisen", EISEN, n=8)
    sz.quader(x - 0.035, x + 0.035, y - 0.035, y + 0.035, z, z + 12, "licht", farbe)
    sz.pyramide(x - 0.04, x + 0.04, y - 0.04, y + 0.04, z + 12, 6, "eisen", EISEN, ueber=0)


# ═════ bastion ═══════════════════════════════════════════════════════════════


def bastion_kern(stufe: int) -> Szene:
    """1 Holzturm · 2 Stein unten, Fachwerk oben · 3 Steinturm mit Zinnen und Helm ·
    4 Ringmauer · 5 Torhaus · 6 zwei Ecktürme · 7 Palas im Hof · 8 Erkertürmchen ·
    9 Krönung: Kupferdächer, hohe Spitze, dritter Eckturm, Fahnen."""
    sz = Szene()
    sz.schatten_r = 0.95 if stufe <= 3 else 1.5
    dach, df = ("kupfer", KUPFER) if stufe >= 9 else ("ziegel", ZIEGEL)
    if stufe >= 4:
        h = 64
        for x0, x1, y0, y1 in ((-1.42, 1.42, -1.42, -1.2), (-1.42, -1.2, -1.2, 1.42), (-1.2, 1.42, 1.2, 1.42), (1.2, 1.42, -1.2, 1.2)):
            sz.quader(x0, x1, y0, y1, 0, h)
            sz.zinnen(x0, x1, y0, y1, h + 8, 12, n=max(1, round(max(x1 - x0, y1 - y0) / 0.42)), w=0.1)
        if stufe == 4:
            sz.fenster("l", -0.35, 1.42, 0, 0.36, 44, art="tuer")
    if stufe >= 5:
        sz.quader(-0.72, 0.02, 1.08, 1.5, 0, 128)
        sz.fenster("l", -0.35, 1.5, 0, 0.36, 50, art="tuer")
        sz.fenster("l", -0.35, 1.5, 84, 0.14, 20)
        sz.pyramide(-0.72, 0.02, 1.08, 1.5, 128, 58, dach, df, ueber=0.06)
        sz.banner("r", 1.29, 0.02, 120, 44)
    if stufe >= 6:
        for ex, ey in [(-1.2, 1.2), (1.2, -1.2)] + ([(1.2, 1.2)] if stufe >= 9 else []):
            eh = 210 if (ex, ey) == (1.2, 1.2) else 150
            sz.zylinder(ex, ey, 0.3, 0, eh)
            sz.zylinder(ex, ey, 0.34, eh - 8, eh + 2, "stein", SOCKEL)
            for z in range(60, eh - 30, 44):
                sz.fenster_rund(ex, ey, 0.3, 0.785, z, 0.1, 18)
            sp = sz.kegel(ex, ey, 0.38, eh + 2, 74, dach, df)
            if stufe >= 9:
                sz.fahne(sp, 34)
    if stufe >= 7:
        sz.quader(0.2, 1.18, -1.18, -0.55, 0, 118)
        for yy in (-0.72, -1.0):
            for z in (54, 88):
                sz.fenster("r", yy, 1.18, z, 0.14, 22)
        sz.satteldach(0.2, 1.18, -1.18, -0.55, 118, 50, dach, df, ueber=0.07, giebel=STEIN)
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
        sz.quader(-0.9, 0.9, -0.9, 0.9, 96, 186, "fachwerk", PUTZ)
        for u in (-0.3, 0.3):
            sz.fenster("l", u, 0.9, 116, 0.2, 26, bogen=False)
        sz.fenster("r", -0.3, 0.9, 116, 0.2, 26, bogen=False)
        sz.banner("r", 0.42, 0.9, 92, 52)
        sz.fahne(sz.pyramide(-0.9, 0.9, -0.9, 0.9, 186, 92, "ziegel", ZIEGEL, ueber=0.16), 40)
        return sz
    a = 0.82
    H = round(250 * w(stufe, 3, 1.09))
    sz.quader(-a, a, -a, a, 0, H)
    sz.fenster("l", 0.3, a, 0, 0.34, 40, art="tuer")
    for z in range(78, H - 40, 60):
        sz.fenster("l", 0.3, a, z, 0.16, 24)
        sz.fenster("r", -0.3, a, z, 0.16, 24)
        sz.fenster("r", 0.3, a, z, 0.16, 24)
    sz.banner("r", 0.0, a, H - 14, 70)
    sz.quader(-0.95, 0.95, -0.95, 0.95, H - 6, H + 4, "stein", SOCKEL)
    sz.zinnen(-0.95, 0.95, -0.95, 0.95, H + 12, 18)
    if stufe >= 8:
        for ex, ey in ((-0.84, -0.84), (-0.84, 0.84), (0.84, -0.84), (0.84, 0.84)):
            sz.zylinder(ex, ey, 0.16, H - 34, H + 40)
            sz.kegel(ex, ey, 0.21, H + 40, 58, dach, df)
    a2 = 0.56 if stufe >= 9 else 0.42  # Krönung: breiterer Aufsatz unter der hohen Spitze
    sz.quader(-a2, a2, -a2, a2, H + 4, H + 54 + (24 if stufe >= 9 else 0))
    sz.fenster("l", 0.0, a2, H + 16, 0.14, 18)
    sz.fenster("r", 0.0, a2, H + 16, 0.14, 18)
    if stufe >= 9:
        sz.zinnen(-a2 - 0.04, a2 + 0.04, -a2 - 0.04, a2 + 0.04, H + 86, 14, n=3, w=0.1)
        sp = sz.pyramide(-0.42, 0.42, -0.42, 0.42, H + 86, 150, dach, df, ueber=0.08)
        sz.kugel(sp[0], sp[1], sp[2] + 3, 0.045, "gold", GOLD)
        sz.fahne((sp[0], sp[1], sp[2] + 6), 44)
    else:
        sz.fahne(sz.pyramide(-0.42, 0.42, -0.42, 0.42, H + 54, 80, dach, df, ueber=0.1), 44)
    return sz


def bastion_wissen(stufe: int) -> Szene:
    """1 Holzhütte mit Lesefenster · 2 Fachwerk-Obergeschoss · 3 Steinsaal mit hohen
    Fenstern · 4 Treppenturm · 5 Sternwarten-Kuppel mit Fernrohr."""
    sz = Szene()
    if stufe == 1:
        sz.quader(-0.8, 0.8, -0.66, 0.66, 0, 8, "stein", SOCKEL)
        sz.quader(-0.74, 0.74, -0.6, 0.6, 8, 64, "holz", HOLZ)
        sz.fenster("l", -0.38, 0.6, 8, 0.26, 30, art="tuer", bogen=False)
        sz.fenster("l", 0.3, 0.6, 28, 0.46, 18, bogen=False)
        sz.fenster("r", 0.0, 0.74, 30, 0.24, 16, bogen=False)
        sz.satteldach(-0.74, 0.74, -0.6, 0.6, 64, 44, "schindel", SCHINDEL, giebel=HOLZ)
        return sz
    if stufe == 2:
        sz.quader(-0.84, 0.84, -0.68, 0.68, 0, 50)
        sz.fenster("l", -0.4, 0.68, 0, 0.28, 34, art="tuer")
        sz.fenster("l", 0.32, 0.68, 14, 0.22, 20)
        sz.quader(-0.92, 0.92, -0.76, 0.76, 50, 116, "fachwerk", PUTZ)
        for u in (-0.46, 0.46):
            sz.fenster("l", u, 0.76, 66, 0.2, 24, bogen=False)
        sz.fenster("r", -0.3, 0.92, 66, 0.2, 24, bogen=False)
        sz.banner("r", 0.42, 0.92, 108, 40)
        sz.satteldach(-0.92, 0.92, -0.76, 0.76, 116, 62, "ziegel", ZIEGEL, ueber=0.14)
        return sz
    g = w(stufe, 3, 1.06)
    h = round(150 * g)
    sz.quader(-0.92, 0.92, -0.76, 0.76, 0, h)
    sz.fenster("l", -0.5, 0.76, 0, 0.28, 40, art="tuer")
    for x in (0.05, 0.5):
        sz.fenster("l", x, 0.76, 36, 0.2, h - 80)
    for y in (-0.35, 0.3):
        sz.fenster("r", y, 0.92, 36, 0.2, h - 80)
    sz.banner("r", 0.0, 0.92, h - 6, 46)
    sz.satteldach(-0.92, 0.92, -0.76, 0.76, h, 68, "schiefer", SCHIEFER, ueber=0.12, giebel=STEIN)
    if stufe >= 4:
        th = round(300 * g)
        sz.zylinder(-0.66, -0.44, 0.27, 0, th)
        for z in range(70, th - 30, 54):
            sz.fenster_rund(-0.66, -0.44, 0.27, 0.785, z, 0.1, 18)
        if stufe == 4:
            sz.fahne(sz.kegel(-0.66, -0.44, 0.34, th, 78, "schiefer", SCHIEFER), 34)
        else:
            sz.zylinder(-0.66, -0.44, 0.33, th - 6, th + 30, "stein", SOCKEL)
            sp = sz.kuppel(-0.66, -0.44, 0.34, th + 30, 54, "kupfer", KUPFER)
            sz.balken((-0.66, -0.44, th + 56), (-0.3, -0.2, th + 96), 0.06, 0.06, "metall", (90, 90, 96))
            sz.fahne(sp, 30)
    return sz


def bastion_turm(stufe: int) -> Szene:
    """1 offenes Holzgerüst · 2 Stube auf der Plattform · 3 Steinsockel · 4 ganz aus
    Stein mit Zinnen · 5 Signalfeuer unter Kupferhelm."""
    sz = Szene()
    sz.schatten_r = 0.52
    e = 0.34
    if stufe <= 2:
        for px, py in ((-e, -e), (e, -e), (-e, e), (e, e)):
            sz.quader(px - 0.045, px + 0.045, py - 0.045, py + 0.045, 0, 116, "holz", HOLZ)
        for z0, z1 in ((8, 60), (60, 112)):
            sz.balken((-e, e, z0), (e, e, z1), 0.03, 0.03, "holz", BALKEN)
            sz.balken((e, e, z0), (-e, e, z1), 0.03, 0.03, "holz", BALKEN)
            sz.balken((e, e, z0), (e, -e, z1), 0.03, 0.03, "holz", BALKEN)
            sz.balken((e, -e, z0), (e, e, z1), 0.03, 0.03, "holz", BALKEN)
        sz.quader(-0.48, 0.48, -0.48, 0.48, 112, 122, "holz", HOLZ)
        if stufe == 1:
            for px, py in ((-e, -e), (e, -e), (-e, e), (e, e)):
                sz.quader(px - 0.03, px + 0.03, py - 0.03, py + 0.03, 122, 160, "holz", HOLZ)
            sz.quader(-0.46, 0.46, 0.43, 0.47, 140, 144, "holz", BALKEN)
            sz.quader(0.43, 0.47, -0.46, 0.46, 140, 144, "holz", BALKEN)
            laterne(sz, 0.1, 0.1, 122, pfahl=False)
            sz.pyramide(-0.42, 0.42, -0.42, 0.42, 160, 42, "schindel", SCHINDEL, ueber=0.08)
            return sz
        sz.quader(-0.42, 0.42, -0.42, 0.42, 122, 186, "fachwerk", PUTZ)
        sz.fenster("l", 0.0, 0.42, 138, 0.18, 24, bogen=False)
        sz.fenster("r", 0.0, 0.42, 138, 0.18, 24, bogen=False)
        sz.fahne(sz.pyramide(-0.42, 0.42, -0.42, 0.42, 186, 62, "ziegel", ZIEGEL, ueber=0.1), 34)
        return sz
    g = w(stufe, 3, 1.12)
    if stufe == 3:
        sz.quader(-0.4, 0.4, -0.4, 0.4, 0, 150)
        sz.fenster("l", 0.0, 0.4, 0, 0.24, 34, art="tuer")
        sz.quader(-0.46, 0.46, -0.46, 0.46, 150, 158, "holz", HOLZ)
        sz.quader(-0.4, 0.4, -0.4, 0.4, 158, 222, "fachwerk", PUTZ)
        sz.fenster("l", 0.0, 0.4, 174, 0.18, 24, bogen=False)
        sz.fenster("r", 0.0, 0.4, 174, 0.18, 24, bogen=False)
        sz.fahne(sz.pyramide(-0.4, 0.4, -0.4, 0.4, 222, 66, "ziegel", ZIEGEL, ueber=0.1), 34)
        return sz
    H = round(270 * g)
    sz.quader(-0.38, 0.38, -0.38, 0.38, 0, H)
    sz.fenster("l", 0.0, 0.38, 0, 0.24, 34, art="tuer")
    for z in range(70, H - 30, 56):
        sz.fenster("l", 0.0, 0.38, z, 0.12, 20)
        sz.fenster("r", 0.0, 0.38, z, 0.12, 20)
    sz.zinnen(-0.46, 0.46, -0.46, 0.46, H + 8, 14, n=2, w=0.1)
    if stufe == 4:
        return sz
    for px, py in ((-0.3, -0.3), (0.3, -0.3), (-0.3, 0.3), (0.3, 0.3)):
        sz.quader(px - 0.03, px + 0.03, py - 0.03, py + 0.03, H, H + 46, "stein", SOCKEL)
    sz.zylinder(0, 0, 0.14, H, H + 10, "stein", SOCKEL)
    sz.kugel(0, 0, H + 20, 0.12, "glut", FEUER, rz=0.2)
    sp = sz.kegel(0, 0, 0.46, H + 46, 84, "kupfer", KUPFER)
    sz.fahne(sp, 34)
    return sz


def bastion_werkstatt(stufe: int) -> Szene:
    """1 Unterstand mit Hobelbank · 2 geschlossene Werkstatt mit Bretterlager · 3 Holzkran."""
    sz = Szene()
    for px, py in ((-0.85, -0.7), (0.85, -0.7), (-0.85, 0.7), (0.85, 0.7)):
        sz.quader(px - 0.05, px + 0.05, py - 0.05, py + 0.05, 0, 76 if stufe == 1 else 96, "holz", HOLZ)
    if stufe == 1:
        sz.satteldach(-0.9, 0.9, -0.75, 0.75, 76, 34, "schindel", SCHINDEL, giebel=HOLZ)
        sz.quader(-0.4, 0.3, 0.05, 0.3, 0, 26, "holz", (176, 128, 80))  # Hobelbank
        for k in range(3):
            sz.quader(0.35, 0.75, -0.55 + k * 0.12, -0.45 + k * 0.12, 0, 10 + k * 8, "holz", (166, 118, 72))
        laterne(sz, 0.85, 0.75, 50, pfahl=False)
        return sz
    sz.quader(-0.9, 0.9, -0.75, -0.1, 0, 96, "holz", HOLZ)
    sz.quader(0.2, 0.9, -0.1, 0.75, 0, 96, "holz", HOLZ)
    sz.fenster("r", 0.3, 0.9, 0, 0.36, 50, art="tuer", bogen=False)
    sz.fenster("l", 0.55, 0.75, 40, 0.24, 20, bogen=False)
    sz.satteldach(-0.9, 0.9, -0.75, 0.75, 96, 52, "ziegel", ZIEGEL, giebel=HOLZ)
    for k in range(4):  # Bretterlager vorne links
        sz.quader(-0.85, -0.1, 0.25 + k * 0.03, 0.55 + k * 0.03, k * 7, k * 7 + 6, "holz", (186, 138, 88))
    if stufe >= 3:  # Holzkran: Bock mit schrägem Ausleger, Seil und Last
        sz.quader(-0.85, -0.45, 0.45, 0.85, 0, 16, "holz", (140, 100, 64))
        for dx in (-0.12, 0.12):
            sz.balken((-0.65 + dx, 0.65, 16), (-0.65, 0.65, 120), 0.05, 0.05, "holz", HOLZ)
        sz.balken((-0.65, 0.55, 16), (-0.65, 0.65, 120), 0.05, 0.05, "holz", HOLZ)
        sz.balken((-0.65, 0.65, 30), (0.55, 0.85, 300), 0.12, 0.12, "holz", HOLZ)
        sz.balken((-0.65, 0.65, 30), (-0.95, 0.6, 130), 0.08, 0.08, "holz", HOLZ)
        sz.quader(-1.0, -0.8, 0.5, 0.75, 110, 150, "stein", SOCKEL)  # Gegengewicht
        sz.balken((-0.65, 0.65, 120), (0.55, 0.85, 300), 0.012, 0.012, "eisen", EISEN)
        sz.balken((0.55, 0.85, 300), (0.55, 0.85, 150), 0.01, 0.01, "eisen", EISEN)
        sz.quader(0.3, 0.8, 0.78, 0.92, 140, 150, "holz", (186, 138, 88))
        for px, py in ((-0.92, 0.2), (0.12, 0.2), (-0.92, 0.95), (0.12, 0.95)):  # Holzlager unter Dach
            sz.quader(px - 0.03, px + 0.03, py - 0.03, py + 0.03, 0, 92, "holz", HOLZ)
        sz.satteldach(-0.95, 0.15, 0.17, 0.98, 92, 34, "schindel", SCHINDEL, giebel=HOLZ, ueber=0.06)
        for k in range(3):  # Stapel Stämme für den Kran
            for j in range(3 - k):
                sz.walze((0.6, -0.95 + 0.2 * j + 0.1 * k, 12 + k * 20), (1, 0, 0), 0.1, 0.7, "holz", (156, 112, 70), n=16)
        sz.walze((-0.6, 0.86, 104), (0, 1, 0), 1.0, 0.18, "holz", (150, 108, 70), n=32)  # Tretrad
        sz.walze((-0.6, 0.86, 104), (0, 1, 0), 0.08, 0.3, "holz", BALKEN)
    return sz


def bastion_eingang(stufe: int) -> Szene:
    """1 Holztor mit Dach · 2 Torhaus aus Stein mit Fallgitter."""
    sz = Szene()
    sz.schatten_r = 0.5
    if stufe == 1:
        for px in (-0.42, 0.42):
            sz.quader(px - 0.06, px + 0.06, -0.1, 0.1, 0, 108, "holz", HOLZ)
        sz.quader(-0.36, 0.36, -0.06, 0.06, 0, 84, "holz", (140, 96, 60))
        sz.fenster("l", 0.0, 0.06, 0, 0.66, 80, art="tuer", bogen=False)
        sz.satteldach(-0.5, 0.5, -0.16, 0.16, 108, 34, "schindel", SCHINDEL, giebel=HOLZ)
        return sz
    sz.quader(-0.46, 0.46, -0.42, 0.42, 0, 170)
    sz.fenster("l", 0.0, 0.42, 0, 0.42, 72, art="tuer")
    for k in range(5):
        sz.quader(-0.18 + k * 0.09, -0.16 + k * 0.09, 0.43, 0.45, 40, 92, "eisen", EISEN)
    sz.fenster("l", 0.0, 0.42, 112, 0.14, 22)
    sz.fenster("r", 0.0, 0.46, 112, 0.14, 22)
    sz.zinnen(-0.5, 0.5, -0.46, 0.46, 178, 14, n=2, w=0.1)
    sz.banner("r", 0.0, 0.46, 100, 50)
    sz.fahne(sz.pyramide(-0.3, 0.3, -0.3, 0.3, 172, 80, "schiefer", SCHIEFER, ueber=0.06), 34)
    return sz


def bastion_einfassung(_: int) -> Szene:
    sz = Szene()
    sz.schatten_r = 0.4
    for k in range(6):
        x = -0.42 + k * 0.168
        h = 64 + (k * 7) % 12
        sz.zylinder(x, 0, 0.075, 0, h, "holz", HOLZ, n=12)
        sz.kegel(x, 0, 0.075, h, 18, "holz", (170, 124, 78), n=12)
    sz.balken((-0.5, 0.08, 20), (0.5, 0.08, 20), 0.05, 0.03, "holz", BALKEN)
    sz.balken((-0.5, 0.08, 48), (0.5, 0.08, 48), 0.05, 0.03, "holz", BALKEN)
    return sz


def feuerstelle(sz: Szene, steinfarbe=SOCKEL):
    for k in range(10):
        a = 2 * math.pi * k / 10
        sz.kugel(0.24 * math.cos(a), 0.24 * math.sin(a), 6, 0.075, "stein", steinfarbe, rz=0.07)
    for a in (0.3, 1.9, 3.5):
        sz.balken((0.16 * math.cos(a), 0.16 * math.sin(a), 4), (-0.06 * math.cos(a), -0.06 * math.sin(a), 18), 0.05, 0.05, "holz", (120, 80, 50))
    sz.kegel(0, 0, 0.1, 8, 34, "glut", FEUER, n=16)
    sz.kegel(0.04, -0.02, 0.06, 10, 22, "glut", (255, 220, 120), n=12)


def bastion_ursprung(_: int) -> Szene:
    sz = Szene()
    sz.schatten_r = 0.36
    feuerstelle(sz)
    return sz


def fahnenmast(sz: Szene, tuch=PETROL, emblem=(244, 222, 140), *, h=150):
    sz.quader(-0.16, 0.16, -0.16, 0.16, 0, 10, "stein", SOCKEL)
    sz.zylinder(0, 0, 0.03, 10, h, "holz", (120, 84, 54), n=12)
    sz.kugel(0, 0, h + 4, 0.04, "gold", GOLD)
    sz.quader(0.03, 0.05, -0.2, 0.0, h - 90, h - 8, "tuch", tuch)
    sz.kugel(0.055, -0.1, h - 50, 0.05, "glatt", emblem, rz=0.06)


def bastion_zeichen(_: int) -> Szene:
    sz = Szene()
    sz.schatten_r = 0.3
    fahnenmast(sz)
    return sz


def beet(sz: Szene, x0, x1, y0, y1, reihen=4, *, rahmen=HOLZ):
    sz.quader(x0, x1, y0, y1, 0, 10, "holz", rahmen)
    sz.quader(x0 + 0.05, x1 - 0.05, y0 + 0.05, y1 - 0.05, 10, 12, "erde", ERDE)
    for r in range(reihen):
        y = y0 + 0.15 + (y1 - y0 - 0.3) * r / max(1, reihen - 1)
        for k in range(5):
            x = x0 + 0.18 + (x1 - x0 - 0.36) * k / 4
            sz.kugel(x, y, 20, 0.09, "laub", (86, 146, 64), rz=0.1)
            if (r + k) % 2 == 0:
                sz.kugel(x + 0.03, y + 0.03, 26, 0.035, "glatt", BLUETE[(r * 3 + k) % 4])


def bastion_flaeche(_: int) -> Szene:
    sz = Szene()
    sz.schatten_r = 0.9
    beet(sz, -0.85, 0.85, -0.85, 0.45)
    for k in range(4):
        sz.kugel(-0.7 + k * 0.42, 0.72, 2, 0.12, "stein", SOCKEL, rz=0.03)
    return sz


def statue(sz: Szene, *, stein=STEIN, figur="ritter"):
    sz.quader(-0.3, 0.3, -0.3, 0.3, 0, 16, "stein", SOCKEL)
    sz.quader(-0.22, 0.22, -0.22, 0.22, 16, 58, "stein", stein)
    sz.quader(-0.26, 0.26, -0.26, 0.26, 58, 64, "stein", SOCKEL)
    # Figur: Körper, Kopf, Schild und Schwert (glatter Stein)
    sz.zylinder(0, 0, 0.1, 64, 130, "glatt", (196, 196, 190), n=20)
    sz.kugel(0, 0, 144, 0.08, "glatt", (200, 200, 194))
    if figur == "ritter":
        sz.quader(0.1, 0.12, -0.08, 0.08, 84, 124, "glatt", (186, 186, 180))
        sz.balken((-0.12, 0.05, 70), (-0.12, 0.05, 160), 0.025, 0.025, "glatt", (190, 190, 184))


def bastion_denkmal(_: int) -> Szene:
    sz = Szene()
    sz.schatten_r = 0.38
    statue(sz)
    return sz


# ═════ garten ═══════════════════════════════════════════════════════════════


def huette(sz: Szene, x, y, z, a, h, *, dach=SCHINDEL, wand=HOLZ, farbe_dach="schindel", tuer=True):
    sz.quader(x - a - 0.04, x + a + 0.04, y - a - 0.04, y + a + 0.04, z - 6, z, "holz", (150, 108, 70))
    sz.quader(x - a, x + a, y - a, y + a, z, z + h, "holz", wand)
    if tuer:
        sz.fenster("l", x - a * 0.3, y + a, z, a * 0.7, h * 0.7, art="tuer", bogen=False)
    sz.fenster("r", y, x + a, z + h * 0.35, a * 0.6, h * 0.35, bogen=False)
    sz.pyramide(x - a, x + a, y - a, y + a, z + h, h * 0.7, farbe_dach, dach, ueber=0.08)


def garten_kern(stufe: int) -> Szene:
    """Baumhaus: 1 Plattform im Baum · 2 Hütte · 3 Treppe und Veranda · 4 zweite Hütte
    oben auf der Krone · 5 Hängebrücke zum Nachbarbaum · 6 Hütte im Nachbarbaum ·
    7 Leiter zur oberen Hütte mit Balkon · 8 Ausguck über der oberen Hütte ·
    9 Krönung: Laternenkette, Blumen auf den Dächern, Fahnen.
    Der Baum wächst mit (Faktor g), die oberen Teile reiten auf der Krone."""
    sz = Szene()
    sz.schatten_r = 1.2 if stufe < 5 else 1.5
    g = 1.16 ** min(stufe - 1, 2) * w(stufe, 3, 1.03)  # der Baum wächst früh schneller
    kz = 205 * g  # Mitte der Krone
    kr, kh = min(1.0 * g ** 0.4, 1.3), 0.62 * g ** 0.5  # Kronenradius, Kronenhöhe (Einheiten)
    sz.zylinder(0, 0, 0.24, 0, kz, "holz", (122, 88, 56), n=24)
    for dx, dy, dz, f in ((0, 0, 0, 1.0), (-0.45, 0.35, -0.12, 0.62), (0.5, -0.3, -0.08, 0.6), (0.35, 0.45, -0.16, 0.5), (-0.4, -0.45, 0.05, 0.55)):
        sz.kugel(dx * kr, dy * kr, kz + dz * kh * 58.8, kr * f, "laub", LAUB, rz=kh * f)
    zp = 100
    sz.zylinder(0, 0, 0.75, zp - 8, zp, "holz", (166, 120, 76), n=28)
    sz.ring(0, 0, zp + 22, 0.72, 0.03, 0.03, "holz", BALKEN, teile=24)
    for k in range(8):
        a = 2 * math.pi * (k + 0.5) / 8
        sz.balken((0.72 * math.cos(a), 0.72 * math.sin(a), zp), (0.72 * math.cos(a), 0.72 * math.sin(a), zp + 24), 0.03, 0.03, "holz", BALKEN)
    if stufe < 3:
        sz.balken((0.62, 0.9, 0), (0.5, 0.66, zp), 0.03, 0.03, "holz", HOLZ)
        sz.balken((0.82, 0.78, 0), (0.7, 0.54, zp), 0.03, 0.03, "holz", HOLZ)
        for k in range(7):
            t = (k + 0.5) / 7
            sz.balken((0.62 - 0.12 * t, 0.9 - 0.24 * t, zp * t), (0.82 - 0.12 * t, 0.78 - 0.24 * t, zp * t), 0.02, 0.02, "holz", BALKEN)
    laterne(sz, 0.55, 0.45, zp, pfahl=False)
    if stufe >= 2:
        huette(sz, 0.15, 0.15, zp, 0.3, 54)
    if stufe >= 3:
        for k in range(9):
            t = k / 9
            sz.quader(0.2 + t * 0.45, 0.42 + t * 0.45, 0.8, 1.15, 0, zp * (1 - t) - 2, "holz", (166, 120, 76))
        sz.quader(0.4, 1.1, -0.25, 0.45, zp - 8, zp, "holz", (166, 120, 76))
        sz.ring(0.75, 0.1, zp + 20, 0.32, 0.02, 0.02, "holz", BALKEN, teile=8)
    top = kz + kh * 58.8 * 0.85
    if stufe >= 4:  # obere Hütte auf der Krone
        sz.quader(-0.42, 0.42, -0.42, 0.42, top - 8, top, "holz", (166, 120, 76))
        huette(sz, 0.0, 0.0, top, 0.28, 50, dach=ZIEGEL, farbe_dach="ziegel")
    if stufe >= 5:  # Nachbarbaum und Hängebrücke
        nz = 150 * g
        sz.zylinder(1.05, -1.0, 0.13, 0, nz, "holz", (122, 88, 56), n=16)
        sz.kugel(1.05, -1.0, nz + 20, 0.42, "laub", LAUB, rz=0.4)
        sz.kugel(0.9, -0.8, nz, 0.3, "laub", LAUB, rz=0.28)
        sz.quader(0.8, 1.3, -1.25, -0.75, zp - 6, zp, "holz", (166, 120, 76))
        for k in range(10):
            t = (k + 0.5) / 10
            x, y = 0.6 + t * 0.3, -0.35 - t * 0.45
            z = zp - 2 - 14 * math.sin(math.pi * t)
            sz.balken((x - 0.05, y - 0.03, z), (x + 0.05, y + 0.03, z), 0.12, 0.012, "holz", (176, 130, 84), quer=(0.83, -0.55, 0))
        for dz in (16, 18):
            sz.balken((0.6, -0.35 + 0.08, zp + dz), (0.9, -0.8 + 0.08, zp + dz), 0.012, 0.012, "holz", BALKEN)
    if stufe >= 6:
        huette(sz, 1.05, -1.0, zp, 0.22, 44, dach=PETROL, farbe_dach="glatt")
    if stufe >= 7:  # Leiter zur oberen Hütte, Balkon
        sz.balken((0.45, 0.62, zp + 2), (0.32, 0.36, top - 4), 0.03, 0.03, "holz", HOLZ)
        sz.balken((0.62, 0.5, zp + 2), (0.48, 0.24, top - 4), 0.03, 0.03, "holz", HOLZ)
        sz.quader(0.3, 0.62, -0.3, 0.3, top - 8, top, "holz", (166, 120, 76))
        sz.ring(0.46, 0.0, top + 18, 0.22, 0.018, 0.018, "holz", BALKEN, teile=8)
    if stufe >= 8:  # Ausguck über der oberen Hütte
        za = top + 50 + 0.28 * 0.7 * 58.8 + 6
        sz.zylinder(0.0, 0.0, 0.03, top + 50, za + 40, "holz", BALKEN, n=10)
        sz.zylinder(0.0, 0.0, 0.2, za, za + 22, "holz", (176, 130, 84))
        sz.fahne((0.0, 0.0, za + 40), 34)
    if stufe >= 9:
        for k in range(8):
            a = 2 * math.pi * k / 8
            sz.kugel(0.72 * math.cos(a), 0.72 * math.sin(a), zp + 32, 0.04, "licht", LATERNE)
        for k, (x, y) in enumerate(((0.05, 0.25), (-0.15, 0.2), (0.2, 0.05))):
            sz.kugel(x, y, top + 50 + 18, 0.05, "glatt", BLUETE[k])
        sz.fahne((1.05, -1.0, 150 * g + 46), 34)
        sz.zylinder(0.0, 0.0, 0.02, za + 40, za + 80, "holz", BALKEN, n=8)
        sz.fahne((0.0, 0.0, za + 80), 30, PETROL)
    return sz


def fruehbeet(sz: Szene):
    sz.quader(-0.6, 0.1, 0.5, 0.92, 0, 16, "holz", HOLZ)
    sz.quader(-0.56, 0.06, 0.54, 0.88, 16, 17, "erde", ERDE)
    for k in range(4):
        sz.kugel(-0.48 + k * 0.17, 0.71, 22, 0.06, "laub", LAUB, rz=0.1)
    sz.quader(-0.6, 0.1, 0.5, 0.56, 16, 30, "holz", HOLZ)
    sz.quader(-0.58, 0.08, 0.52, 0.9, 30, 31, "glas", GLAS_F)


def garten_wissen_licht(sz: Szene):
    laterne(sz, 0.25, 0.95, 26)


def garten_wissen(stufe: int) -> Szene:
    """Gewächshaus: 1 Frühbeet mit Töpfen · 2 kleines Glashaus · 3 langes Glashaus auf
    Steinsockel, Regentonne · 4 zweiter, höherer Flügel · 5 Palmenhaus mit Glaskuppel."""
    sz = Szene()
    sz.schatten_r = 0.6 if stufe == 1 else 1.0
    fruehbeet(sz)
    garten_wissen_licht(sz)
    for k, (x, y) in enumerate(((0.3, 0.75), (0.48, 0.62), (0.62, 0.82))):
        if stufe == 1 or k < 2:
            sz.zylinder(x, y, 0.06, 0, 12, "glatt", TERRAKOTTA, n=16)
            sz.kugel(x, y, 22, 0.08, "laub", LAUB, rz=0.13)
    if stufe == 1:
        return sz
    if stufe == 2:
        glashaus(sz, -0.5, 0.5, -0.95, -0.3, 10, 64, 34)
        pflanzen(sz, -0.4, 0.4, -0.7, -0.55, 18, 0)
        return sz
    glashaus(sz, -0.92, 0.92, -0.95, -0.3, 18, 86, 42)
    pflanzen(sz, -0.8, 0.8, -0.72, -0.53, 26, 0)
    sz.zylinder(-0.84, 0.3, 0.11, 0, 34, "holz", HOLZ, n=20)
    for z in (8, 25):
        sz.zylinder(-0.84, 0.3, 0.115, z, z + 3, "eisen", EISEN, n=20)
    if stufe >= 4:
        glashaus(sz, 0.2, 0.92, -0.32, 0.92, 18, 118, 50, quer=True)
        pflanzen(sz, 0.47, 0.65, -0.2, 0.8, 26, 1)
        sz.kugel(0.56, 0.3, 70, 0.16, "laub", (80, 136, 62), rz=0.3)
    if stufe >= 5:
        cx, cy, r = -0.5, 0.12, 0.42
        sz.zylinder(cx, cy, r, 0, 18, "stein", SOCKEL)
        sz.zylinder(cx, cy, r - 0.02, 18, 128, "glas", GLAS_F)
        for k in range(10):
            a = 2 * math.pi * k / 10
            sz.zylinder(cx + r * 0.98 * math.cos(a), cy + r * 0.98 * math.sin(a), 0.014, 18, 128, "holz", RAHMEN_W, n=8)
        sz.zylinder(cx, cy, r + 0.01, 124, 130, "holz", RAHMEN_W)
        sp = sz.kuppel(cx, cy, r, 130, 60, "glas", GLAS_F)
        sz.kugel(cx, cy, sp[2] + 3, 0.04, "gold", GOLD)
        sz.zylinder(cx, cy, 0.04, 18, 120, "holz", HOLZ, n=12)
        for k in range(7):
            a = 2 * math.pi * k / 7
            sz.kugel(cx + 0.16 * math.cos(a), cy + 0.16 * math.sin(a), 118, 0.17, "laub", (78, 132, 60), rz=0.05)
        sz.kugel(cx, cy, 124, 0.09, "laub", (78, 132, 60))
    return sz


def garten_turm(stufe: int) -> Szene:
    """Aussichtsbaum: 1 Leiter am Baum · 2 Plattform · 3 Geländer und Dach ·
    4 zweite Plattform höher · 5 Ausguck-Korb mit Fernrohr."""
    sz = Szene()
    sz.schatten_r = 0.5
    H = 170 * w(stufe, 1, 1.12)
    sz.zylinder(0, 0, 0.1, 0, H * 0.75, "holz", (122, 88, 56), n=16)
    for dx, dy, dz, r in ((0, 0, 0.85, 0.36), (-0.2, 0.15, 0.72, 0.26), (0.2, -0.12, 0.76, 0.26), (0.0, 0.0, 1.0, 0.26)):
        sz.kugel(dx, dy, H * dz, r, "laub", LAUB, rz=r * 0.9)
    sz.balken((0.24, 0.32, 0), (0.1, 0.13, 100), 0.02, 0.02, "holz", HOLZ)
    sz.balken((0.34, 0.2, 0), (0.15, 0.06, 100), 0.02, 0.02, "holz", HOLZ)
    for k in range(6):
        t = (k + 0.5) / 6
        sz.balken((0.24 - 0.14 * t, 0.32 - 0.19 * t, 100 * t), (0.34 - 0.19 * t, 0.2 - 0.14 * t, 100 * t), 0.015, 0.015, "holz", BALKEN)
    if stufe >= 2:
        sz.zylinder(0, 0, 0.42, 100, 106, "holz", (166, 120, 76), n=24)
    if stufe >= 3:
        sz.ring(0, 0, 124, 0.4, 0.02, 0.02, "holz", BALKEN, teile=18)
        for k in range(4):
            a = math.pi / 4 + k * math.pi / 2
            sz.balken((0.38 * math.cos(a), 0.38 * math.sin(a), 106), (0.38 * math.cos(a), 0.38 * math.sin(a), 150), 0.025, 0.025, "holz", BALKEN)
        sz.kegel(0, 0, 0.48, 150, 34, "schindel", SCHINDEL)
    if stufe >= 4:
        z2 = H * 0.78
        sz.zylinder(0, 0, 0.3, z2, z2 + 5, "holz", (166, 120, 76), n=20)
        sz.ring(0, 0, z2 + 20, 0.29, 0.018, 0.018, "holz", BALKEN, teile=14)
    if stufe >= 5:
        zk = H * 1.08
        sz.zylinder(0, 0, 0.16, zk, zk + 22, "holz", (176, 130, 84), n=18)
        sz.balken((0.05, 0.05, zk + 28), (0.3, -0.12, zk + 40), 0.035, 0.035, "metall", (120, 104, 70))
        sz.fahne((0, 0, zk + 22), 34)
    return sz


def garten_werkstatt(stufe: int) -> Szene:
    """Geräteschuppen: 1 Werkzeugkiste unter Vordach · 2 Schuppen · 3 Wasserpumpe mit Tank."""
    sz = Szene()
    if stufe == 1:
        sz.quader(-0.4, 0.4, -0.3, 0.1, 0, 28, "holz", HOLZ)
        for px in (-0.5, 0.5):
            sz.quader(px - 0.04, px + 0.04, 0.3, 0.38, 0, 66, "holz", HOLZ)
            sz.quader(px - 0.04, px + 0.04, -0.42, -0.34, 0, 76, "holz", HOLZ)
        sz.balken((-0.6, -0.4, 80), (0.6, -0.4, 80), 0.08, 0.04, "holz", HOLZ)
        sz.satteldach(-0.6, 0.6, -0.45, 0.4, 66, 18, "schindel", SCHINDEL, giebel=HOLZ)
        sz.balken((0.1, 0.15, 0), (0.25, 0.2, 60), 0.02, 0.02, "holz", (150, 110, 70))
        sz.balken((0.25, 0.15, 0), (0.33, 0.22, 56), 0.02, 0.02, "eisen", EISEN)
        laterne(sz, 0.5, 0.3, 50, pfahl=False)
        return sz
    sz.quader(-0.75, 0.75, -0.65, 0.4, 0, 96, "holz", (120, 150, 110))
    sz.fenster("l", -0.3, 0.4, 0, 0.36, 60, art="tuer", bogen=False)
    sz.fenster("r", -0.1, 0.75, 44, 0.22, 22, bogen=False)
    sz.satteldach(-0.75, 0.75, -0.65, 0.4, 96, 44, "schindel", SCHINDEL, giebel=(120, 150, 110))
    beet(sz, 0.0, 0.8, 0.5, 0.95, 1)
    if stufe >= 3:
        for px, py in ((0.45, -0.85), (0.85, -0.85), (0.45, -0.45), (0.85, -0.45)):
            sz.balken((px, py, 0), (px * 0.9 + 0.065, py * 0.9 - 0.065, 190), 0.04, 0.04, "holz", HOLZ)
        sz.quader(0.38, 0.92, -0.92, -0.38, 184, 192, "holz", (150, 108, 70))
        sz.zylinder(0.65, -0.65, 0.36, 192, 300, "holz", (146, 104, 66))
        for z in (204, 250, 290):
            sz.zylinder(0.65, -0.65, 0.37, z, z + 4, "eisen", EISEN)
        sz.kegel(0.65, -0.65, 0.42, 300, 50, "schindel", SCHINDEL)
        for k in range(4):  # Windrad der Pumpe
            a = math.pi / 4 + k * math.pi / 2
            sz.balken((0.95, -0.35, 230), (0.97, -0.35 - 0.35 * math.cos(a), 230 + 0.35 * 58.8 * math.sin(a)), 0.1, 0.01, "holz", RAHMEN_W, quer=(0, math.sin(a), math.cos(a)))
        sz.balken((0.45, -0.45, 200), (0.2, 0.25, 30), 0.03, 0.03, "eisen", EISEN)
    return sz


def garten_eingang(stufe: int) -> Szene:
    """Gartentor: 1 Holztor · 2 Rosenbogen über dem Tor."""
    sz = Szene()
    sz.schatten_r = 0.48
    for px in (-0.42, 0.42):
        sz.quader(px - 0.05, px + 0.05, -0.05, 0.05, 0, 70, "holz", RAHMEN_W)
    for k in range(7):
        x = -0.32 + k * 0.107
        sz.quader(x - 0.03, x + 0.03, -0.02, 0.02, 6, 50 + 8 * math.sin(math.pi * k / 6), "holz", RAHMEN_W)
    sz.balken((-0.38, 0.0, 16), (0.38, 0.0, 16), 0.04, 0.02, "holz", RAHMEN_W)
    sz.balken((-0.38, 0.0, 42), (0.38, 0.0, 42), 0.04, 0.02, "holz", RAHMEN_W)
    if stufe >= 2:
        for k in range(15):
            a = math.pi * k / 14
            x, z = -0.44 * math.cos(a), 70 + 74 * math.sin(a)
            sz.kugel(x, 0, z, 0.075, "laub", LAUB)
            if k % 2 == 0:
                sz.kugel(x + 0.03, 0.05, z + 4, 0.045, "glatt", BLUETE[0])
        for px in (-0.44, 0.44):
            for z in (20, 46):
                sz.kugel(px, 0.02, z, 0.06, "laub", LAUB)
    return sz


def garten_einfassung(_: int) -> Szene:
    sz = Szene()
    sz.schatten_r = 0.4
    sz.quader(-0.5, 0.5, -0.16, 0.16, 0, 58, "laub", (72, 128, 58))
    for k in range(5):
        sz.kugel(-0.4 + k * 0.2, 0.0, 58, 0.13, "laub", (72, 128, 58), rz=0.08)
    return sz


def garten_ursprung(_: int) -> Szene:
    sz = Szene()
    sz.schatten_r = 0.4
    for px in (-0.36, 0.36):
        sz.quader(px - 0.04, px + 0.04, -0.12, 0.12, 0, 24, "holz", (110, 78, 50))
    sz.quader(-0.42, 0.42, -0.14, 0.14, 24, 30, "holz", HOLZ)
    sz.quader(-0.42, 0.42, -0.16, -0.1, 30, 64, "holz", HOLZ)
    sz.zylinder(0.3, 0.3, 0.07, 0, 14, "glatt", TERRAKOTTA, n=16)
    sz.kugel(0.3, 0.3, 24, 0.09, "laub", LAUB, rz=0.1)
    sz.kugel(0.33, 0.32, 30, 0.04, "glatt", BLUETE[1])
    return sz


def garten_zeichen(_: int) -> Szene:
    sz = Szene()
    sz.schatten_r = 0.3
    sz.zylinder(-0.3, 0, 0.025, 0, 170, "holz", RAHMEN_W, n=10)
    sz.zylinder(0.3, 0, 0.02, 0, 120, "holz", RAHMEN_W, n=10)
    for k in range(6):
        t = (k + 0.5) / 6
        x = -0.3 + 0.6 * t
        z = 168 - 50 * t - 12 * math.sin(math.pi * t)
        sz.balken((x - 0.03, 0, z), (x + 0.03, 0, z), 0.012, 0.01, "tuch", PETROL_HELL)
        sz.pyramide(x - 0.035, x + 0.035, -0.005, 0.005, z - 22, 22, "tuch", PETROL_HELL if k % 2 else PETROL, ueber=0)
    sz.fahne((-0.3, 0, 170), 30)
    return sz


def garten_flaeche(_: int) -> Szene:
    sz = Szene()
    sz.schatten_r = 0.9
    beet(sz, -0.85, 0.85, -0.85, 0.85, 5, rahmen=(150, 120, 90))
    sz.zylinder(0.6, -0.6, 0.02, 12, 90, "laub", (80, 130, 60), n=8)
    sz.kugel(0.6, -0.6, 96, 0.1, "glatt", (240, 196, 60), rz=0.04)
    return sz


def garten_denkmal(_: int) -> Szene:
    sz = Szene()
    sz.schatten_r = 0.3
    sz.zylinder(0, 0, 0.2, 0, 14, "stein", SOCKEL)
    sz.zylinder(0, 0, 0.12, 14, 44, "glatt", (70, 110, 170), n=20)
    sz.kugel(0, 0, 54, 0.1, "glatt", (236, 200, 170))
    sz.kugel(0.02, 0.06, 46, 0.09, "glatt", (244, 244, 240), rz=0.07)
    sz.kegel(0, 0, 0.11, 60, 50, "glatt", (210, 60, 52), n=20)
    return sz


# ═════ dorf ═════════════════════════════════════════════════════════════════


def dorf_kern(stufe: int) -> Szene:
    """Gemeindehaus: 1 Fachwerkhaus · 2 zweites Geschoss · 3 Dachreiter mit Glocke ·
    4 Seitenflügel · 5 Laubengang · 6 Uhrturm · 7 zweiter Flügel · 8 Ratssaal-Erker ·
    9 Krönung: Kupferhaube auf dem Uhrturm."""
    sz = Szene()
    sz.schatten_r = 1.1 if stufe <= 3 else 1.5
    g = w(stufe, 3, 1.05)
    hoch = 74 if stufe == 1 else round(130 * g)
    x0, x1, y0, y1 = -0.95, 0.95, -0.7, 0.55
    sz.quader(x0 - 0.03, x1 + 0.03, y0 - 0.03, y1 + 0.03, 0, 14, "stein", BRUCH)
    sz.quader(x0, x1, y0, y1, 14, hoch, "fachwerk", PUTZ)
    sz.fenster("l", -0.1, y1, 14, 0.3, 40, art="tuer", bogen=False)
    for z in range(30, hoch - 30, 58):
        for u in (-0.6, 0.45):
            sz.fenster("l", u, y1, z, 0.2, 24, bogen=False)
        for u in (-0.3, 0.25):
            sz.fenster("r", u, x1, z, 0.2, 24, bogen=False)
    sz.satteldach(x0, x1, y0, y1, hoch, 70, "ziegel", ZIEGEL, ueber=0.14)
    if stufe >= 3:
        zr = hoch + 64
        sz.quader(-0.4, 0.4, -0.4, 0.24, zr - 40, zr + 90, "holz", (150, 108, 70))
        sz.fenster("l", 0.0, 0.24, zr + 4, 0.3, 36, bogen=True)
        sz.fenster("r", -0.08, 0.4, zr + 4, 0.3, 36, bogen=True)
        sz.kugel(0, -0.08, zr + 16, 0.11, "gold", GOLD)
        sz.fahne(sz.pyramide(-0.4, 0.4, -0.4, 0.24, zr + 90, 120, "schiefer", SCHIEFER, ueber=0.08), 28)
    if stufe >= 4:
        haus(sz, 0.45, 1.35, -1.35, -0.75, round(110 * g), "fachwerk", PUTZ, "ziegel", ZIEGEL, 54, quer=True, sockel=12, fenster=False)
        sz.fenster("r", -1.05, 1.35, 40, 0.2, 24, bogen=False)
    if stufe >= 5:  # Laubengang
        for k in range(5):
            x = -0.85 + k * 0.42
            sz.quader(x - 0.05, x + 0.05, 0.86, 0.96, 0, 46, "stein", BRUCH)
        sz.quader(-0.95, 0.95, 0.55, 0.98, 46, 56, "stein", BRUCH)
        sz.satteldach(-0.95, 0.95, 0.56, 0.98, 56, 18, "ziegel", ZIEGEL, ueber=0.04, giebel=BRUCH)
    if stufe >= 6:  # Uhrturm hinten links
        th = round(270 * g)
        sz.quader(-1.42, -0.8, -1.42, -0.8, 0, th, "stein", BRUCH)
        sz.fenster("l", -1.11, -0.8, th - 60, 0.2, 28)
        sz.fenster("r", -1.11, -0.8, th - 60, 0.2, 28)
        sz.walze((-1.11, -0.795, th - 96), (0, 1, 0), 0.17, 0.02, "glatt", (244, 239, 228))
        sz.walze((-0.795, -1.11, th - 96), (1, 0, 0), 0.17, 0.02, "glatt", (244, 239, 228))
        sz.balken((-1.11, -0.78, th - 96), (-1.11, -0.78, th - 78), 0.015, 0.01, "eisen", EISEN)
        sz.balken((-0.78, -1.11, th - 96), (-0.78, -1.02, th - 96), 0.015, 0.01, "eisen", EISEN)
        if stufe >= 9:
            sz.quader(-1.46, -0.76, -1.46, -0.76, th, th + 12, "stein", BRUCH)
            sp = sz.kuppel(-1.11, -1.11, 0.38, th + 12, 60, "kupfer", KUPFER)
            sz.zylinder(-1.13, -1.13, 0.14, sp[2] - 8, sp[2] + 40, "kupfer", KUPFER)
            sp2 = sz.kuppel(-1.13, -1.13, 0.17, sp[2] + 40, 26, "kupfer", KUPFER)
            sp = sz.kegel(-1.13, -1.13, 0.08, sp2[2] - 2, 90, "kupfer", KUPFER)
            sz.kugel(sp[0], sp[1], sp[2] + 2, 0.035, "gold", GOLD)
            for fx, fy in ((-1.42, -0.84), (-0.84, -1.42), (-0.84, -0.84)):
                sz.kegel(fx, fy, 0.07, th + 12, 70, "kupfer", KUPFER, n=16)
            for fx, fy in ((0.95, 0.55), (-0.95, 0.55)):
                sz.kegel(fx, fy, 0.08, hoch, 90, "kupfer", KUPFER, n=16)
        else:
            sz.pyramide(-1.42, -0.8, -1.42, -0.8, th, 96, "schiefer", SCHIEFER, ueber=0.06)
    if stufe >= 7:
        haus(sz, -1.4, -0.6, -0.65, 1.35, round(104 * g), "fachwerk", PUTZ, "ziegel", ZIEGEL, 50, quer=True, sockel=12, fenster=False)
        for z in (40, 80):
            sz.fenster("l", -1.0, 1.35, z, 0.2, 24, bogen=False)
    if stufe >= 8:  # Ratssaal-Erker
        sz.quader(0.2, 0.7, 0.55, 0.78, 66, hoch - 4, "fachwerk", PUTZ)
        sz.fenster("l", 0.45, 0.78, 76, 0.32, 30, bogen=False)
        sz.pyramide(0.2, 0.7, 0.55, 0.78, hoch - 4, 34, "schiefer", SCHIEFER, ueber=0.04)
    return sz


def dorf_wissen(stufe: int) -> Szene:
    """Bücherei: 1 Bücherhäuschen · 2 Haus · 3 zweites Geschoss mit Lesegaube ·
    4 Anbau mit großem Fenster · 5 Turmzimmer."""
    sz = Szene()
    if stufe == 1:
        sz.zylinder(0, 0.2, 0.03, 0, 40, "holz", BALKEN, n=10)
        sz.quader(-0.32, 0.32, 0.0, 0.4, 40, 100, "holz", (136, 96, 60))
        sz.fenster("l", 0.0, 0.4, 48, 0.46, 44, bogen=False)
        sz.satteldach(-0.32, 0.32, 0.0, 0.4, 100, 30, "ziegel", ZIEGEL, giebel=(136, 96, 60), ueber=0.06)
        return sz
    g = w(stufe, 3, 1.08)
    hoch = 76 if stufe == 2 else round(128 * g)
    sz.quader(-0.85, 0.85, -0.7, 0.55, 0, 12, "stein", BRUCH)
    sz.quader(-0.82, 0.82, -0.67, 0.52, 12, hoch, "fachwerk", PUTZ)
    sz.fenster("l", -0.45, 0.52, 12, 0.26, 36, art="tuer", bogen=False)
    for z in range(26, hoch - 30, 54):
        sz.fenster("l", 0.3, 0.52, z, 0.3, 26, bogen=False)
        sz.fenster("r", 0.0, 0.82, z, 0.24, 26, bogen=False)
    sz.satteldach(-0.82, 0.82, -0.67, 0.52, hoch, 58, "ziegel", ZIEGEL, ueber=0.12)
    if stufe >= 3:
        sz.quader(-0.25, 0.25, 0.1, 0.4, hoch - 4, hoch + 36, "fachwerk", PUTZ)
        sz.fenster("l", 0.0, 0.4, hoch + 4, 0.28, 24, bogen=False)
        sz.satteldach(-0.25, 0.25, 0.1, 0.42, hoch + 36, 20, "ziegel", ZIEGEL, quer=True, ueber=0.04)
    if stufe >= 4:
        sz.quader(0.2, 0.95, 0.52, 0.95, 0, round(96 * g), "stein", BRUCH)
        sz.fenster("l", 0.58, 0.95, 18, 0.5, 56, bogen=True)
        sz.satteldach(0.2, 0.95, 0.52, 0.95, round(96 * g), 30, "ziegel", ZIEGEL, quer=True, giebel=BRUCH, ueber=0.05)
    if stufe >= 5:
        th = round(250 * g)
        rundturm(sz, -0.72, -0.62, 0.26, th, "schiefer", SCHIEFER, 84, mat="stein", farbe=BRUCH, fahne=True)
    return sz


def muehle_fluegel(sz: Szene, x, y, z, laenge, *, voll=True):
    """Vier Flügel vor der rechten Fläche (Ebene x = konst.), über Kreuz."""
    for k in range(4):
        a = math.pi / 4 + k * math.pi / 2
        ende = (x + 0.02, y - laenge * math.cos(a), z + laenge * ZE_W * math.sin(a))
        sz.balken((x + 0.02, y, z), ende, 0.03, 0.03, "holz", BALKEN)
        if voll:
            mitte_a = (x + 0.025, y - laenge * 0.25 * math.cos(a), z + laenge * 0.25 * ZE_W * math.sin(a))
            sz.balken(mitte_a, ende, 0.24, 0.01, "tuch", (240, 232, 214), quer=(0.0, math.sin(a), math.cos(a)))


ZE_W = 58.79  # Pixel je Feldeinheit in der Höhe (für Flügel in Feldmaß)


def dorf_turm(stufe: int) -> Szene:
    """Windmühle: 1 kleine Bockmühle · 2 größere Flügel · 3 Steinsockel · 4 Galerie ·
    5 Kupferkappe mit Fahne."""
    sz = Szene()
    sz.schatten_r = 0.5
    g = w(stufe, 1, 1.14)
    sockel = 0
    if stufe >= 3:
        sockel = round(90 * g / 1.3)
        sz.zylinder(0, 0, 0.42, 0, sockel, "stein", BRUCH)
        sz.fenster_rund(0, 0, 0.42, 0.785, 0, 0.18, 34, art="tuer")
    else:
        sz.zylinder(0, 0, 0.05, 0, 40, "holz", BALKEN, n=10)
        for a in (0.4, 2.0, 3.6, 5.2):
            sz.balken((0.3 * math.cos(a), 0.3 * math.sin(a), 0), (0.02 * math.cos(a), 0.02 * math.sin(a), 34), 0.03, 0.03, "holz", BALKEN)
        sockel = 40
    kh = round(90 * g)
    sz.quader(-0.36, 0.36, -0.36, 0.36, sockel, sockel + kh, "holz", (160, 116, 72))
    sz.fenster("l", 0.0, 0.36, sockel + 20, 0.14, 20, bogen=False)
    oben = sockel + kh
    if stufe >= 4:
        sz.zylinder(0, 0, 0.46, sockel - 6, sockel, "holz", (166, 120, 76), n=28)
        sz.ring(0, 0, sockel + 18, 0.44, 0.02, 0.02, "holz", BALKEN, teile=20)
    if stufe >= 5:
        sz.zylinder(0, 0, 0.38, oben, oben + 10, "holz", (160, 116, 72))
        sp = sz.kuppel(0, 0, 0.38, oben + 10, 44, "kupfer", KUPFER)
        sz.fahne(sp, 34)
    else:
        sz.satteldach(-0.36, 0.36, -0.36, 0.36, oben, 38, "schindel", SCHINDEL, giebel=(160, 116, 72), ueber=0.06)
    laenge = (0.5 if stufe == 1 else 0.7) * (1 + 0.06 * max(0, stufe - 2))
    muehle_fluegel(sz, 0.36, 0.0, oben - 22, laenge)
    return sz


def dorf_werkstatt(stufe: int) -> Szene:
    """Schreinerei: 1 Werkbank unter Dach · 2 Werkstatt · 3 Wasserrad (Säge)."""
    sz = Szene()
    if stufe == 1:
        for px, py in ((-0.6, -0.5), (0.6, -0.5), (-0.6, 0.4), (0.6, 0.4)):
            sz.quader(px - 0.04, px + 0.04, py - 0.04, py + 0.04, 0, 70, "holz", HOLZ)
        sz.satteldach(-0.66, 0.66, -0.56, 0.46, 70, 30, "ziegel", ZIEGEL, giebel=HOLZ)
        sz.quader(-0.35, 0.35, -0.15, 0.12, 0, 26, "holz", (176, 128, 80))
        for k in range(3):
            sz.quader(0.7, 0.95, -0.6 + k * 0.1, -0.5 + k * 0.1, 0, 12 + k * 6, "holz", (186, 138, 88))
        laterne(sz, 0.6, 0.4, 46, pfahl=False)
        return sz
    haus(sz, -0.85, 0.65, -0.8, 0.35, 92, "fachwerk", PUTZ, "ziegel", ZIEGEL, 52, sockel=10, fenster=False)
    sz.fenster("l", -0.35, 0.35, 10, 0.4, 50, art="tuer", bogen=False)
    sz.fenster("l", 0.3, 0.35, 40, 0.24, 24, bogen=False)
    for k in range(5):
        sz.quader(-0.85, 0.1, 0.5 + k * 0.03, 0.85 + k * 0.03, k * 6, k * 6 + 5, "holz", (186, 138, 88))
    if stufe >= 3:
        sz.quader(0.68, 0.98, -0.95, 0.95, 0, 8, "glatt", (90, 140, 190))  # Bach
        sz.walze((0.85, -0.25, 40), (1, 0, 0), 0.55, 0.07, "holz", (140, 100, 64), n=24)
        for k in range(8):
            a = 2 * math.pi * k / 8
            sz.balken((0.85, -0.25 + 0.6 * math.cos(a), 40 + 0.6 * ZE_W * math.sin(a)), (0.85, -0.25 + 0.4 * math.cos(a), 40 + 0.4 * ZE_W * math.sin(a)), 0.12, 0.03, "holz", (120, 86, 54), quer=(1, 0, 0))
        sz.walze((0.75, -0.25, 40), (1, 0, 0), 0.05, 0.25, "eisen", EISEN)
    return sz


def dorf_eingang(stufe: int) -> Szene:
    """Dorfbrücke: 1 Holzsteg · 2 Steinbrücke mit Bogen und Laternen."""
    sz = Szene()
    sz.quader(-0.5, 0.5, -0.5, 0.5, 0, 4, "glatt", (96, 150, 196))  # Wasser
    if stufe == 1:
        for py in (-0.25, 0.25):
            for px in (-0.4, 0.4):
                sz.quader(px - 0.03, px + 0.03, py - 0.03, py + 0.03, 0, 36, "holz", BALKEN)
        for k in range(8):
            x = -0.45 + k * 0.128
            sz.quader(x - 0.055, x + 0.055, -0.3, 0.3, 20, 24, "holz", (176, 130, 84))
        sz.quader(-0.48, 0.48, 0.27, 0.3, 40, 44, "holz", BALKEN)
        return sz
    sz.quader(-0.5, 0.5, -0.3, 0.3, 0, 40, "stein", BRUCH)
    sz.fenster("l", 0.0, 0.3, 0, 0.5, 18, art="tuer")
    sz.quader(-0.5, 0.5, 0.24, 0.3, 40, 54, "stein", BRUCH)
    sz.quader(-0.5, 0.5, -0.3, -0.24, 40, 54, "stein", BRUCH)
    for px in (-0.42, 0.42):
        sz.zylinder(px, 0.27, 0.025, 54, 110, "eisen", EISEN, n=10)
        sz.quader(px - 0.05, px + 0.05, 0.22, 0.32, 110, 128, "licht", LATERNE)
        sz.pyramide(px - 0.06, px + 0.06, 0.21, 0.33, 128, 12, "eisen", EISEN, ueber=0)
    sz.banner("l", 0.0, 0.3, 52, 30)
    return sz


def dorf_einfassung(_: int) -> Szene:
    sz = Szene()
    sz.schatten_r = 0.4
    for k in range(7):
        x = -0.45 + k * 0.15
        sz.quader(x - 0.04, x + 0.04, -0.015, 0.015, 0, 52, "holz", (226, 210, 180))
        sz.pyramide(x - 0.04, x + 0.04, -0.015, 0.015, 52, 8, "holz", (226, 210, 180), ueber=0)
    for z in (14, 38):
        sz.balken((-0.5, 0.03, z), (0.5, 0.03, z), 0.04, 0.02, "holz", (200, 180, 150))
    return sz


def dorf_ursprung(_: int) -> Szene:
    sz = Szene()
    sz.schatten_r = 0.4
    sz.zylinder(0, 0, 0.3, 0, 36, "stein", BRUCH)
    sz.zylinder(0, 0, 0.24, 30, 37, "glatt", (80, 130, 180))
    for px in (-0.28, 0.28):
        sz.quader(px - 0.03, px + 0.03, -0.03, 0.03, 36, 110, "holz", HOLZ)
    sz.satteldach(-0.36, 0.36, -0.26, 0.26, 110, 30, "schindel", SCHINDEL, giebel=HOLZ, ueber=0.04)
    sz.walze((0, 0, 98), (1, 0, 0), 0.04, 0.5, "holz", HOLZ)
    sz.zylinder(0.05, 0, 0.06, 64, 80, "holz", (150, 108, 70), n=14)
    return sz


def dorf_zeichen(_: int) -> Szene:
    sz = Szene()
    sz.schatten_r = 0.3
    sz.quader(-0.16, 0.16, -0.16, 0.16, 0, 10, "stein", BRUCH)
    sz.zylinder(0, 0, 0.03, 10, 150, "holz", (120, 84, 54), n=12)
    sz.quader(0.03, 0.06, -0.22, 0.08, 70, 130, "glatt", PETROL)
    sz.kugel(0.07, -0.07, 102, 0.07, "gold", (240, 214, 120), rz=0.08)
    return sz


def dorf_flaeche(_: int) -> Szene:
    sz = Szene()
    sz.schatten_r = 0.95
    sz.quader(-0.95, 0.95, -0.95, 0.95, 0, 4, "laub", (104, 160, 76))
    for x, y, h in ((-0.45, -0.45, 120), (0.45, -0.3, 110), (-0.2, 0.45, 114)):
        baum(sz, x, y, h, 0.3, stamm=0.05)
        for k in range(4):
            a = 1.3 * k
            sz.kugel(x + 0.22 * math.cos(a), y + 0.22 * math.sin(a), h * 0.72, 0.035, "glatt", (210, 60, 50))
    return sz


def dorf_denkmal(_: int) -> Szene:
    sz = Szene()
    sz.schatten_r = 0.38
    statue(sz, stein=BRUCH)
    return sz


# ═════ unterwasser ══════════════════════════════════════════════════════════


def roehre(sz: Szene, a, b, r=0.09):
    pa, pb = (a[0], a[1], a[2]), (b[0], b[1], b[2])
    m = ((pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2, (pa[2] + pb[2]) / 2)
    laenge = math.dist((pa[0], pa[1], pa[2] / ZE_W), (pb[0], pb[1], pb[2] / ZE_W))
    sz.walze(m, (pb[0] - pa[0], pb[1] - pa[1], (pb[2] - pa[2]) / ZE_W), r, laenge, "scheibe", KUPPELGLAS)
    for t in (0.2, 0.8):
        q = (pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t, pa[2] + (pb[2] - pa[2]) * t)
        sz.walze(q, (pb[0] - pa[0], pb[1] - pa[1], (pb[2] - pa[2]) / ZE_W), r * 1.15, 0.03, "metall", MESSING)


def unterwasser_kern(stufe: int) -> Szene:
    """Hauptkuppel: 1 kleine Kuppel · 2 größer mit Bullaugen · 3 Röhre zur Nebenkuppel ·
    4 zweite Nebenkuppel · 5 Aufsatz-Kuppel · 6 Röhrenring · 7 Turm mit Glasspitze ·
    8 Seegras-Gartenkuppel · 9 Krönung: Leuchtperle."""
    sz = Szene()
    sz.schatten_r = 0.9 if stufe == 1 else 1.4
    g = w(stufe, 2, 1.08)
    if stufe == 1:
        sz.zylinder(0, 0, 0.78, 0, 8, "metall", MESSING)
        kuppelbau(sz, 0, 0, 0.7, 40, 90, fenster=False)
        sz.fenster_rund(0, 0, 0.7, 0.785, 6, 0.26, 26, art="tuer")
        for wkl in (0.1, 1.45):
            sz.fenster_rund(0, 0, 0.7, wkl, 14, 0.12, 16)
        return sz
    r = 0.95
    h = round(70 * g)
    sz.zylinder(0, 0, 1.02, 0, 8, "metall", MESSING)
    oben = kuppelbau(sz, 0, 0, r, h, round(120 * g))
    sz.fenster_rund(0, 0, r, 0.785, 8, 0.3, 30, art="tuer")
    if stufe >= 3:
        kuppelbau(sz, 1.0, 1.0, 0.5, 70, 60)
        roehre(sz, (0.6, 0.6, 30), (0.72, 0.72, 30))
        sz.zylinder(1.0, 1.0, 0.06, 120, 180, "metall", MESSING, n=12)
        sz.kugel(1.0, 1.0, 186, 0.08, "licht", (250, 240, 200))
    if stufe >= 4:
        kuppelbau(sz, -1.05, 0.95, 0.38, 40, 48)
        roehre(sz, (-0.62, 0.55, 28), (-0.8, 0.72, 28))
    if stufe >= 5:
        z = oben[2] - 26
        sz.zylinder(0, 0, 0.42, z, z + round(60 * g), "perlmutt", PERLMUTT)
        for wkl in (0.4, 1.2):
            sz.fenster_rund(0, 0, 0.42, wkl, z + 20, 0.1, 16)
        oben = sz.kuppel(0, 0, 0.42, z + round(60 * g), 56, "scheibe", KUPPELGLAS)
    if stufe >= 6:
        sz.ring(0, 0, 18, 1.28, 0.08, 0.08, "scheibe", KUPPELGLAS, teile=26)
        for k in range(4):
            a = math.pi / 4 + k * math.pi / 2
            sz.zylinder(1.28 * math.cos(a), 1.28 * math.sin(a), 0.07, 0, 24, "metall", MESSING, n=12)
    if stufe >= 7:
        th = round(190 * g)
        sz.zylinder(1.0, -1.0, 0.24, 0, th, "perlmutt", PERLMUTT)
        for z in range(40, th - 30, 50):
            sz.zylinder(1.0, -1.0, 0.25, z, z + 6, "koralle", KORALLE)
            sz.fenster_rund(1.0, -1.0, 0.24, 0.785, z + 14, 0.08, 16)
        sz.kegel(1.0, -1.0, 0.26, th, 80, "scheibe", KUPPELGLAS)
    if stufe >= 8:
        cx, cy = -1.05, 0.0
        sz.zylinder(cx, cy, 0.42, 0, 30, "perlmutt", PERLMUTT)
        for k in range(6):
            a = 2 * math.pi * k / 6
            sz.kugel(cx + 0.2 * math.cos(a), cy + 0.2 * math.sin(a), 52, 0.05, "laub", (70, 150, 96), rz=0.3)
        sz.kuppel(cx, cy, 0.42, 30, 60, "glas", GLAS_F)
    if stufe >= 9:  # Leuchtperle auf dem Turm und über der Hauptkuppel
        th = round(190 * g)
        sz.zylinder(1.0, -1.0, 0.05, th + 60, th + 110, "metall", MESSING, n=12)
        sz.kugel(1.0, -1.0, th + 126, 0.16, "licht", (250, 240, 220))
        sz.zylinder(0, 0, 0.34, oben[2] - 14, oben[2] + 4, "metall", MESSING)
        for k in range(6):
            a = 2 * math.pi * k / 6
            sz.balken((0.3 * math.cos(a), 0.3 * math.sin(a), oben[2]), (0.08 * math.cos(a), 0.08 * math.sin(a), oben[2] + 70), 0.04, 0.04, "metall", MESSING)
        sz.kugel(0, 0, oben[2] + 84, 0.22, "licht", (250, 240, 220))
    return sz


def schneckenturm(sz: Szene, x, y, r, h):
    stufen = 5
    for k in range(stufen):
        rr = r * (1 - k / (stufen + 1))
        z0 = h * k / stufen
        sz.zylinder(x, y, rr, z0, z0 + h / stufen + 2, "perlmutt", PERLMUTT if k % 2 else (230, 214, 200))
    sz.kegel(x, y, r * 0.3, h, h * 0.25, "perlmutt", PERLMUTT)


def unterwasser_wissen(stufe: int) -> Szene:
    """Perlenkammer: 1 Muscheltruhe · 2 kleine Kuppel · 3 Schaufenster mit Perlen ·
    4 Schneckenturm · 5 zweiter Schneckenturm mit Perle."""
    sz = Szene()
    if stufe == 1:
        sz.kuppel(0, 0.2, 0.42, 0, 26, "perlmutt", (232, 196, 184))
        sz.kugel(0, 0.2, 30, 0.42, "perlmutt", (240, 214, 200), rz=0.12)
        sz.kugel(0.1, 0.55, 18, 0.07, "licht", (250, 246, 240))
        return sz
    g = w(stufe, 2, 1.12)
    kuppelbau(sz, -0.15, -0.15, 0.62, round(50 * g), round(84 * g))
    sz.fenster_rund(-0.15, -0.15, 0.62, 0.785, 4, 0.24, 28, art="tuer")
    if stufe >= 3:
        sz.quader(0.25, 0.9, 0.35, 0.9, 0, 60, "perlmutt", PERLMUTT)
        sz.fenster("l", 0.58, 0.9, 10, 0.46, 40, bogen=True)
        sz.fenster("r", 0.62, 0.9, 10, 0.36, 40, bogen=True)
        sz.kuppel(0.58, 0.62, 0.34, 60, 34, "perlmutt", (232, 196, 184))
        for k in range(3):
            sz.kugel(0.45 + k * 0.13, 0.95, 14, 0.04, "scheibe", (250, 246, 240))
    if stufe >= 4:
        schneckenturm(sz, -0.7, 0.55, 0.26, round(190 * g))
    if stufe >= 5:
        schneckenturm(sz, 0.62, -0.68, 0.24, round(220 * g))
        sz.kugel(0.62, -0.68, round(220 * g) * 1.25 + 14, 0.09, "licht", (250, 244, 230))
    return sz


def unterwasser_turm(stufe: int) -> Szene:
    """Leuchtturm: 1 Lichtboje · 2 Mast · 3 Turm · 4 Galerie · 5 große Laterne."""
    sz = Szene()
    sz.schatten_r = 0.5
    if stufe == 1:
        sz.kugel(0, 0, 22, 0.28, "glatt", KORALLE, rz=0.3)
        sz.zylinder(0, 0, 0.12, 30, 50, "perlmutt", PERLMUTT)
        sz.kugel(0, 0, 60, 0.09, "licht", (250, 240, 200))
        return sz
    g = w(stufe, 2, 1.18)
    H = round(150 * g)
    if stufe == 2:
        sz.zylinder(0, 0, 0.22, 0, 12, "metall", MESSING)
        sz.zylinder(0, 0, 0.06, 12, H, "perlmutt", PERLMUTT, n=16)
        for z in range(20, H - 10, 30):
            sz.zylinder(0, 0, 0.065, z, z + 8, "koralle", KORALLE, n=16)
        sz.kugel(0, 0, H + 12, 0.1, "licht", (250, 240, 200))
        return sz
    sz.zylinder(0, 0, 0.3, 0, H, "perlmutt", PERLMUTT)
    for z in range(10, H - 10, 44):
        sz.zylinder(0, 0, 0.305, z, z + 18, "koralle", KORALLE)
    sz.fenster_rund(0, 0, 0.3, 0.785, 0, 0.16, 30, art="tuer")
    top = H
    if stufe >= 4:
        sz.zylinder(0, 0, 0.42, H, H + 6, "metall", MESSING)
        sz.ring(0, 0, H + 22, 0.4, 0.02, 0.02, "metall", MESSING, teile=18)
    if stufe >= 5:
        sz.zylinder(0, 0, 0.24, H + 6, H + 60, "glas", GLAS_F)
        sz.kugel(0, 0, H + 32, 0.15, "licht", (250, 236, 190))
        top = sz.kuppel(0, 0, 0.27, H + 60, 36, "metall", MESSING)[2]
        sz.fahne((0, 0, top), 30)
    else:
        sz.kuppel(0, 0, 0.27, H + 6, 30, "metall", MESSING)
        sz.kugel(0, 0, H + 44, 0.08, "licht", (250, 240, 200))
    return sz


def unterwasser_werkstatt(stufe: int) -> Szene:
    """Werft: 1 Steg · 2 Halle · 3 Kran mit U-Boot."""
    sz = Szene()
    for k in range(6):
        x = -0.75 + k * 0.3
        sz.quader(x - 0.03, x + 0.03, 0.45, 0.51, 0, 24, "metall", MESSING)
    sz.quader(-0.9, 0.9, 0.38, 0.9, 24, 30, "holz", (160, 120, 84))
    if stufe == 1:
        sz.kugel(0.3, 0.65, 40, 0.12, "glatt", KORALLE, rz=0.1)
        laterne(sz, 0.8, 0.85, 70, farbe=(250, 240, 200))
        return sz
    sz.quader(-0.9, 0.9, -0.9, 0.3, 0, 90, "perlmutt", PERLMUTT)
    sz.fenster("l", -0.3, 0.3, 0, 0.6, 70, art="tuer", bogen=True)
    sz.walze((0, -0.3, 90), (1, 0, 0), 0.6, 1.84, "metall", MESSING, n=32)
    if stufe >= 3:
        sz.kugel(0.1, 0.66, 60, 0.62, "glatt", (236, 196, 60), rz=0.26)
        sz.zylinder(0.2, 0.66, 0.14, 70, 110, "glatt", (236, 196, 60), n=18)
        sz.kugel(0.2, 0.66, 112, 0.14, "scheibe", KUPPELGLAS, rz=0.1)
        sz.walze((0.75, 0.66, 60), (1, 0, 0), 0.1, 0.12, "metall", MESSING)
        for px in (-0.85, 0.85):  # Portalkran über dem Dock
            for py in (0.42, 0.95):
                sz.quader(px - 0.05, px + 0.05, py - 0.05, py + 0.05, 30, 210, "metall", MESSING)
        sz.quader(-0.92, 0.92, 0.38, 0.99, 210, 236, "metall", MESSING)
        sz.quader(0.05, 0.3, 0.55, 0.8, 236, 262, "paneel", PERLMUTT)
        sz.balken((0.15, 0.66, 210), (0.15, 0.66, 130), 0.012, 0.012, "eisen", EISEN)
    return sz


def unterwasser_eingang(stufe: int) -> Szene:
    """Tauchschleuse: 1 Luke · 2 Schleusenkammer mit Glaskuppel."""
    sz = Szene()
    sz.schatten_r = 0.48
    if stufe == 1:
        sz.zylinder(0, 0, 0.34, 0, 30, "perlmutt", PERLMUTT)
        sz.zylinder(0, 0, 0.26, 30, 34, "metall", MESSING)
        sz.walze((0, 0, 40), (0, 0, 1), 0.06, 0.05, "metall", MESSING)
        return sz
    sz.zylinder(0, 0, 0.42, 0, 96, "perlmutt", PERLMUTT)
    sz.fenster_rund(0, 0, 0.42, 0.785, 0, 0.28, 50, art="tuer")
    sz.zylinder(0, 0, 0.44, 90, 98, "metall", MESSING)
    sp = sz.kuppel(0, 0, 0.42, 98, 60, "scheibe", KUPPELGLAS)
    sz.kugel(0, 0, sp[2] + 8, 0.06, "licht", (250, 240, 200))
    for px, py in ((-0.38, 0.42), (0.42, -0.38)):
        sz.zylinder(px, py, 0.03, 0, 110, "metall", MESSING, n=10)
        sz.kugel(px, py, 118, 0.06, "licht", (250, 240, 200))
    return sz


def unterwasser_einfassung(_: int) -> Szene:
    sz = Szene()
    sz.schatten_r = 0.4
    sz.quader(-0.5, 0.5, -0.16, 0.16, 0, 16, "koralle", (200, 150, 120))
    for k in range(7):
        x = -0.42 + k * 0.14
        h = 34 + (k * 13) % 26
        sz.kugel(x, 0.02 * (k % 3), 16 + h / 2, 0.08, "koralle", (KORALLE, (240, 170, 80), (190, 110, 170))[k % 3], rz=h / 120)
    return sz


def unterwasser_ursprung(_: int) -> Szene:
    sz = Szene()
    sz.schatten_r = 0.4
    sz.quader(-0.4, 0.4, -0.4, 0.4, 0, 6, "sand", SAND)
    sz.balken((0, 0, 6), (0, 0, 130), 0.06, 0.06, "eisen", (80, 84, 90))
    sz.walze((0, 0, 120), (1, 0, 0), 0.05, 0.32, "eisen", (80, 84, 90))
    sz.zylinder(0, 0, 0.06, 130, 142, "eisen", (80, 84, 90), n=14)
    for s in (-1, 1):
        sz.balken((0, 0, 14), (s * 0.32, 0, 52), 0.06, 0.06, "eisen", (80, 84, 90), quer=(0, 1, 0))
        sz.kegel(s * 0.32, 0, 0.06, 52, 16, "eisen", (80, 84, 90), n=12)
    return sz


def unterwasser_zeichen(_: int) -> Szene:
    sz = Szene()
    sz.schatten_r = 0.3
    sz.kugel(0, 0, 30, 0.2, "glatt", PETROL, rz=0.32)
    sz.zylinder(0, 0, 0.205, 30, 46, "glatt", (244, 244, 240))
    sz.zylinder(0, 0, 0.025, 46, 120, "metall", MESSING, n=10)
    sz.kugel(0, 0, 124, 0.05, "licht", (250, 240, 200))
    sz.fahne((0, 0, 120), 30)
    return sz


def unterwasser_flaeche(_: int) -> Szene:
    sz = Szene()
    sz.schatten_r = 0.95
    sz.quader(-0.95, 0.95, -0.95, 0.95, 0, 4, "sand", SAND)
    for i in range(5):
        for j in range(5):
            if (i * 3 + j) % 4 == 0:
                continue
            x, y = -0.8 + i * 0.4 + 0.06 * ((j * 7) % 3 - 1), -0.8 + j * 0.4
            h = 50 + (i * 17 + j * 11) % 40
            sz.kugel(x, y, 4 + h / 2, 0.05, "laub", (70, 150, 96), rz=h / 118)
    return sz


def unterwasser_denkmal(_: int) -> Szene:
    sz = Szene()
    sz.schatten_r = 0.38
    sz.quader(-0.3, 0.3, -0.3, 0.3, 0, 40, "perlmutt", PERLMUTT)
    for k in range(9):
        a = math.pi * (0.1 + 0.8 * k / 8)
        sz.balken((0, 0, 46), (0.34 * math.cos(a), 0, 46 + 90 * math.sin(a)), 0.13, 0.04, "perlmutt", (232, 200, 184), quer=(0, 1, 0))
    sz.kugel(0, 0.02, 50, 0.08, "scheibe", (250, 246, 240))
    return sz


# ═════ weltraum ═════════════════════════════════════════════════════════════


def weltraum_kern(stufe: int) -> Szene:
    """Kommandomodul: 1 Modul · 2 Solarflügel · 3 zweites Modul · 4 Andockring ·
    5 angedockte Fähre · 6 Wohnring · 7 Turm mit Kuppel · 8 zweites Paar Solarflügel ·
    9 Krönung: Antennenspitze mit Fahne."""
    sz = Szene()
    sz.schatten_r = 1.0 if stufe <= 2 else 1.5
    g = w(stufe, 3, 1.07)
    sz.zylinder(0, 0, 1.1, 0, 12, "metall", METALL)
    for k in range(12):
        a = 2 * math.pi * k / 12
        sz.quader(1.02 * math.cos(a) - 0.05, 1.02 * math.cos(a) + 0.05, 1.02 * math.sin(a) - 0.05, 1.02 * math.sin(a) + 0.05, 10, 13, "glatt", WARN)
    h1 = 96
    modul(sz, 0, 0, 0.62, 12, h1)
    sz.fenster_rund(0, 0, 0.62, 0.785, 12, 0.3, 40, art="tuer")
    top = 12 + h1
    if stufe >= 3:
        h2 = round(90 * g)
        modul(sz, 0, 0, 0.58, top, h2)
        for a in (0.3, 3.44):
            sz.walze((0.7 * math.cos(a), 0.7 * math.sin(a), top + h2 * 0.5), (math.cos(a), math.sin(a), 0), 0.16, 0.3, "paneel", PANEEL)
        top += h2
    sp = sz.kuppel(0, 0, 0.58 if stufe >= 3 else 0.62, top, 40, "scheibe", (170, 200, 230))
    if stufe >= 2:
        solarfluegel(sz, 0.4, -0.4, 70, 1.0, richtung=(1, -1))
        solarfluegel(sz, -0.4, 0.4, 70, 1.0, richtung=(-1, 1))
    if stufe >= 4:
        sz.ring(0, 0, 60, 0.82, 0.06, 0.12, "metall", METALL, teile=26)
        for a in (0.785, 3.93):
            sz.walze((0.72 * math.cos(a), 0.72 * math.sin(a), 60), (math.cos(a), math.sin(a), 0), 0.12, 0.25, "paneel", PANEEL)
    if stufe >= 5:  # Fähre
        sz.walze((1.0, 1.0, 60), (1, 1, 0), 0.16, 0.7, "paneel", PANEEL)
        sz.kugel(1.25, 1.25, 60, 0.17, "paneel", PANEEL)
        sz.kugel(1.3, 1.3, 64, 0.11, "scheibe", (60, 90, 140))
        sz.balken((0.85, 1.25, 50), (1.25, 0.85, 50), 0.3, 0.02, "metall", METALL, quer=(1, 1, 0))
    if stufe >= 6:
        zr = top - 20
        sz.ring(0, 0, zr, 1.25, 0.1, 0.1, "paneel", PANEEL, teile=32)
        for a in (0.4, 2.0, 3.6, 5.2):
            sz.balken((0, 0, zr), (1.2 * math.cos(a), 1.2 * math.sin(a), zr), 0.04, 0.04, "metall", METALL)
    if stufe >= 7:
        th = round(60 * g)
        b = sp[2] - 6
        sz.zylinder(0, 0, 0.3, b, b + th, "paneel", PANEEL)
        for wkl in (0.4, 1.2):
            sz.fenster_rund(0, 0, 0.3, wkl, b + th * 0.5, 0.09, 14)
        sz.zylinder(0, 0, 0.33, b + th - 6, b + th, "metall", METALL)
        sp = sz.kuppel(0, 0, 0.33, b + th, 40, "scheibe", (170, 200, 230))
    if stufe >= 8:
        solarfluegel(sz, 0.3, 0.3, top - 30, 1.0, richtung=(1, 1))
        solarfluegel(sz, -0.3, -0.3, top - 30, 0.9, richtung=(-1, -1))
    if stufe >= 9:
        sz.zylinder(0, 0, 0.025, sp[2] - 4, sp[2] + 110, "metall", METALL, n=10)
        sz.kugel(0, 0, sp[2] + 110, 0.04, "licht", (255, 90, 80))
        sz.fahne((0, 0, sp[2] + 70), 34)
    return sz


def weltraum_wissen(stufe: int) -> Szene:
    """Sternwarte: 1 Fernrohr auf Stativ · 2 Hütte mit Klappdach · 3 Kuppel ·
    4 Schüssel · 5 zweites Teleskop."""
    sz = Szene()
    g = w(stufe, 2, 1.1)
    if stufe == 1:
        for a in (0.3, 2.4, 4.5):
            sz.balken((0.25 * math.cos(a), 0.25 * math.sin(a), 0), (0, 0, 50), 0.025, 0.025, "metall", METALL)
        sz.balken((-0.1, 0.1, 44), (0.3, -0.2, 90), 0.1, 0.1, "paneel", PANEEL)
        sz.quader(0.2, 0.4, 0.25, 0.4, 0, 30, "metall", METALL)
        sz.quader(0.22, 0.38, 0.4, 0.41, 14, 26, "licht", (120, 220, 255))
        return sz
    sz.quader(-0.6, 0.6, -0.6, 0.6, 0, round(70 * g), "paneel", PANEEL)
    sz.fenster("l", -0.2, 0.6, 0, 0.28, 44, art="tuer", bogen=False)
    sz.fenster("l", 0.3, 0.6, 22, 0.22, 20, bogen=False)
    sz.fenster("r", 0.0, 0.6, 22, 0.22, 20, bogen=False)
    oben = round(70 * g)
    if stufe == 2:
        sz.quader(-0.6, 0.0, -0.6, 0.6, oben, oben + 6, "metall", METALL)
        sz.balken((-0.6, 0.6, oben + 6), (0.0, 0.6, oben + 50), 0.03, 0.03, "metall", METALL)
        sz.balken((0.1, 0.0, oben), (0.4, -0.3, oben + 50), 0.12, 0.12, "paneel", PANEEL)
        return sz
    sz.zylinder(0, 0, 0.8, oben, oben + 20, "metall", METALL)
    sp = sz.kuppel(0, 0, 0.78, oben + 20, round(80 * g), "paneel", PANEEL)
    sz.balken((0.1, 0.1, oben + 40), (0.35, -0.25, sp[2] + 24), 0.1, 0.1, "metall", (90, 96, 110))
    if stufe >= 4:
        sz.zylinder(0.72, 0.72, 0.04, 0, round(130 * g), "metall", METALL, n=12)
        schuessel(sz, 0.72, 0.72, round(130 * g), 0.3, mast=False)
    if stufe >= 5:
        sz.zylinder(-0.7, -0.7, 0.26, 0, round(150 * g), "paneel", PANEEL)
        sp2 = sz.kuppel(-0.7, -0.7, 0.28, round(150 * g), 36, "paneel", PANEEL)
        sz.balken((-0.7, -0.7, sp2[2] - 14), (-0.45, -0.95, sp2[2] + 24), 0.07, 0.07, "metall", (90, 96, 110))
    return sz


def weltraum_turm(stufe: int) -> Szene:
    """Antennenmast: 1 Stange · 2 Schüssel · 3 höherer Mast · 4 Ringplattform ·
    5 zweite Schüssel mit Licht."""
    sz = Szene()
    sz.schatten_r = 0.45
    H = round(150 * w(stufe, 1, 1.13))
    sz.quader(-0.22, 0.22, -0.22, 0.22, 0, 12, "metall", METALL)
    if stufe >= 3:  # Gittermast
        for px, py in ((-0.14, -0.14), (0.14, -0.14), (-0.14, 0.14), (0.14, 0.14)):
            sz.balken((px, py, 12), (px * 0.4, py * 0.4, H), 0.025, 0.025, "metall", METALL)
        for z in range(30, H, 34):
            f = 1 - 0.6 * (z - 12) / (H - 12)
            sz.ring(0, 0, z, 0.14 * f * 1.414, 0.012, 0.012, "metall", METALL, teile=4)
    else:
        sz.zylinder(0, 0, 0.035, 12, H, "metall", METALL, n=12)
    sz.kugel(0, 0, H + 4, 0.04, "licht", (255, 90, 80))
    if stufe >= 2:
        schuessel(sz, 0.12, 0.12, H * 0.7, 0.24, mast=False)
    if stufe >= 4:
        sz.zylinder(0, 0, 0.34, H * 0.5, H * 0.5 + 5, "metall", METALL, n=24)
        sz.ring(0, 0, H * 0.5 + 18, 0.33, 0.012, 0.012, "metall", METALL, teile=16)
    if stufe >= 5:
        schuessel(sz, -0.14, -0.14, H * 0.88, 0.2, mast=False)
        sz.kugel(0, 0, H * 0.5 + 22, 0.04, "licht", (120, 220, 255))
    return sz


def weltraum_werkstatt(stufe: int) -> Szene:
    """Montagehalle: 1 Gerüst · 2 Halle · 3 Rakete im Startturm."""
    sz = Szene()
    if stufe == 1:
        for px, py in ((-0.7, -0.6), (0.7, -0.6), (-0.7, 0.6), (0.7, 0.6)):
            sz.quader(px - 0.03, px + 0.03, py - 0.03, py + 0.03, 0, 90, "metall", METALL)
        for z in (30, 60, 90):
            sz.ring(0, 0, z, 0.92, 0.02, 0.02, "metall", WARN, teile=4)
        sz.quader(-0.3, 0.3, -0.25, 0.25, 0, 30, "paneel", PANEEL)
        laterne(sz, 0.7, 0.6, 90, pfahl=False, farbe=(255, 240, 200))
        return sz
    sz.quader(-0.9, 0.5, -0.9, 0.5, 0, 110, "paneel", PANEEL)
    sz.fenster("l", -0.2, 0.5, 0, 0.7, 80, art="tuer", bogen=False)
    sz.walze((-0.2, -0.2, 110), (1, 0, 0), 0.66, 1.4, "paneel", PANEEL)
    for k in range(5):
        sz.quader(-0.9 + k * 0.29, -0.85 + k * 0.29, 0.5, 0.52, 0, 6, "glatt", WARN)
    if stufe >= 3:
        sz.quader(0.55, 0.95, 0.55, 0.95, 0, 8, "metall", METALL)
        sz.quader(0.35, 0.98, 0.98, 1.0, 8, 320, "metall", WARN)  # Startturm
        sz.quader(0.98, 1.0, 0.3, 1.0, 8, 320, "metall", WARN)
        for z in range(40, 320, 46):
            sz.quader(0.45, 0.98, 0.45, 0.98, z, z + 6, "metall", WARN)
        sz.quader(0.82, 0.96, 0.6, 0.7, 200, 214, "metall", METALL)
        sz.zylinder(0.68, 0.72, 0.27, 8, 250, "paneel", PANEEL)
        sz.kegel(0.68, 0.72, 0.27, 250, 90, "glatt", (200, 60, 56))
        for dx, dy in ((-0.24, 0.0), (0.0, -0.24)):
            sz.zylinder(0.68 + dx, 0.72 + dy, 0.08, 8, 140, "paneel", PANEEL, n=16)
            sz.kegel(0.68 + dx, 0.72 + dy, 0.08, 140, 30, "glatt", (200, 60, 56), n=16)
        for a in (0.4, 2.5, 4.6):
            sz.balken((0.68, 0.72, 10), (0.68 + 0.22 * math.cos(a), 0.72 + 0.22 * math.sin(a), 10), 0.12, 0.012, "glatt", (200, 60, 56), quer=(0, 0, 1))
    return sz


def weltraum_eingang(stufe: int) -> Szene:
    """Luftschleuse: 1 Tür · 2 Doppelschleuse mit Glaskanzel."""
    sz = Szene()
    sz.schatten_r = 0.48
    sz.quader(-0.4, 0.4, -0.3, 0.3, 0, 100 if stufe == 1 else 120, "paneel", PANEEL)
    sz.fenster("l", -0.12 if stufe > 1 else 0.0, 0.3, 0, 0.3, 66, art="tuer", bogen=False)
    for k in range(4):
        sz.quader(-0.4 + k * 0.2, -0.32 + k * 0.2, 0.3, 0.32, 0, 6, "glatt", WARN)
    if stufe >= 2:
        sz.fenster("l", 0.22, 0.3, 0, 0.22, 66, art="tuer", bogen=False)
        sz.quader(-0.48, 0.48, -0.36, 0.36, 120, 128, "metall", METALL)
        sp = sz.kuppel(0, 0, 0.4, 128, 60, "scheibe", (170, 200, 230))
        sz.kugel(0, 0, sp[2] + 4, 0.04, "licht", (120, 220, 255))
        sz.walze((0.42, -0.1, 50), (1, 0, 0), 0.18, 0.2, "paneel", PANEEL)
    return sz


def weltraum_einfassung(_: int) -> Szene:
    sz = Szene()
    sz.schatten_r = 0.4
    sz.quader(-0.5, 0.5, -0.07, 0.07, 0, 70, "paneel", PANEEL)
    for x in (-0.48, 0.48):
        sz.quader(x - 0.04, x + 0.04, -0.1, 0.1, 0, 80, "metall", METALL)
    sz.quader(-0.44, 0.44, 0.07, 0.08, 46, 54, "licht", (120, 220, 255))
    return sz


def weltraum_ursprung(_: int) -> Szene:
    sz = Szene()
    sz.schatten_r = 0.42
    sz.zylinder(0, 0, 0.44, 0, 8, "metall", (120, 126, 136), n=36)
    sz.zylinder(0, 0, 0.36, 8, 9, "glatt", WARN, n=36)
    sz.zylinder(0, 0, 0.32, 9, 10, "metall", (120, 126, 136), n=36)
    sz.quader(-0.14, -0.1, -0.12, 0.12, 10, 11, "glatt", WARN)
    sz.quader(0.1, 0.14, -0.12, 0.12, 10, 11, "glatt", WARN)
    sz.quader(-0.1, 0.1, -0.02, 0.02, 10, 11, "glatt", WARN)
    for k in range(6):
        a = 2 * math.pi * k / 6
        sz.kugel(0.4 * math.cos(a), 0.4 * math.sin(a), 10, 0.03, "licht", (120, 220, 255))
    return sz


def weltraum_zeichen(_: int) -> Szene:
    sz = Szene()
    sz.schatten_r = 0.3
    sz.quader(-0.14, 0.14, -0.14, 0.14, 0, 10, "metall", METALL)
    sz.zylinder(0, 0, 0.02, 10, 160, "metall", METALL, n=10)
    sz.quader(0.02, 0.035, -0.28, 0.0, 110, 156, "tuch", PETROL)
    sz.kugel(0.04, -0.14, 133, 0.04, "glatt", (244, 222, 140), rz=0.04)
    return sz


def weltraum_flaeche(_: int) -> Szene:
    sz = Szene()
    sz.schatten_r = 0.95
    sz.quader(-0.95, 0.95, -0.95, 0.95, 0, 8, "metall", (110, 104, 124))
    for x, y, h, r, f in ((-0.4, -0.4, 90, 0.12, KRISTALL), (-0.25, -0.2, 60, 0.1, (220, 120, 200)), (0.4, -0.3, 70, 0.1, (120, 200, 220)), (0.2, 0.4, 100, 0.13, KRISTALL), (-0.5, 0.45, 50, 0.08, (120, 200, 220)), (0.6, 0.6, 40, 0.07, (220, 120, 200))):
        sz.pyramide(x - r, x + r, y - r, y + r, 8, h, "scheibe", f, ueber=0)
        sz.kugel(x, y, 8 + h * 0.4, r * 0.6, "licht", f, rz=0.02)
    return sz


def weltraum_denkmal(_: int) -> Szene:
    sz = Szene()
    sz.schatten_r = 0.38
    sz.quader(-0.2, 0.2, -0.2, 0.2, 0, 14, "metall", METALL)
    sz.zylinder(0, 0, 0.04, 14, 90, "metall", METALL, n=12)
    sz.quader(-0.12, 0.12, -0.12, 0.12, 90, 130, "glatt", (210, 190, 120))
    for s in (-1, 1):
        sz.balken((s * 0.14, -s * 0.14, 110), (s * 0.46, -s * 0.46, 110), 0.22, 0.012, "solar", SOLAR, quer=(1, 1, 0))
    schuessel(sz, 0, 0, 136, 0.12, mast=False)
    return sz


# ═════ Verzeichnis ══════════════════════════════════════════════════════════

ROLLEN = {
    # rolle: (Stufen, Felder, Bildbreite)
    "kern": (9, 3, 296),
    "wissen": (5, 2, 200),
    "turm": (5, 1, 104),
    "werkstatt": (3, 2, 200),
    "eingang": (2, 1, 104),
    "einfassung": (1, 1, 104),
    "ursprung": (1, 1, 104),
    "zeichen": (1, 1, 104),
    "flaeche": (1, 2, 200),
    "denkmal": (1, 1, 104),
}
THEMEN = ("bastion", "dorf", "garten", "unterwasser", "weltraum")


# Höhe (GRAFIK-SPRITES.md §13.2): bis Stufe 3 jede Stufe mindestens 15 % höher, ab Stufe 4
# mindestens so hoch wie die vorige (Umriss-Test). Wo eine frühe Stufe von sich aus weniger
# wächst, streckt `streckung` sie in der Höhe; ab Stufe 4 wird nicht mehr gestreckt, weil
# das die Gebäude verzerrt (Fachwerk-Hochhaus, Ei-Kuppeln; Fotos 03.11.2026).
ZIEL_FRUEH, ZIEL_SPAET = 1.2, 1.0
# Stufen, deren neues Teil schlank ist (Kran, Spitze): dort wächst das Gebäude etwas mehr,
# damit sich auch der Umriss deutlich ändert (Umriss-Test 25 % bzw. 10 %).
ZIEL_EXTRA: dict[tuple[str, str, int], float] = {
    ("unterwasser", "kern", 3): 1.08,
    ("unterwasser", "wissen", 3): 1.06,
    ("weltraum", "kern", 2): 1.05,
    ("bastion", "werkstatt", 3): 1.38,
}


def streckung(thema: str, rolle: str) -> list[float]:
    roh = globals()[f"{thema}_{rolle}"]
    stufen, n, _ = ROLLEN[rolle]
    faktoren = [1.0]
    vorher = roh(1).hoehe_px(n)
    for s in range(2, stufen + 1):
        sz = roh(s)
        ziel = vorher * (ZIEL_FRUEH if s <= 3 else ZIEL_SPAET) * ZIEL_EXTRA.get((thema, rolle, s), 1.0)
        f = faktoren[-1]
        lo, hi = f, f * 3
        sz_f = roh(s)
        sz_f.strecken(f)
        if sz_f.hoehe_px(n) < ziel:
            for _ in range(30):  # Halbierung: kleinste Streckung, die das Ziel erreicht
                mid = (lo + hi) / 2
                t = roh(s)
                t.strecken(mid)
                if t.hoehe_px(n) >= ziel:
                    hi = mid
                else:
                    lo = mid
            f = hi
        sz.strecken(f)
        faktoren.append(f)
        vorher = sz.hoehe_px(n)
    return faktoren


_STRECKUNG: dict[tuple[str, str], list[float]] = {}


# Bildhöhen der Zierde wie bisher (G3), damit Tippflächen und Abstände gleich bleiben:
# eine höhere Palisade überdeckte sonst die Feuerstelle dahinter (Browser-Test).
ZIER_HOEHE = {
    "bastion": {"einfassung": 103, "ursprung": 60, "zeichen": 162, "flaeche": 111, "denkmal": 147},
    "dorf": {"einfassung": 84, "ursprung": 138, "zeichen": 150, "flaeche": 154, "denkmal": 151},
    "garten": {"einfassung": 88, "ursprung": 90, "zeichen": 154, "flaeche": 122, "denkmal": 108},
    "unterwasser": {"einfassung": 95, "ursprung": 112, "zeichen": 152, "flaeche": 125, "denkmal": 130},
    "weltraum": {"einfassung": 96, "ursprung": 54, "zeichen": 153, "flaeche": 121, "denkmal": 152},
}


def zier_faktor(thema: str, rolle: str) -> float:
    roh = globals()[f"{thema}_{rolle}"]
    _, n, _ = ROLLEN[rolle]
    ziel = ZIER_HOEHE[thema][rolle] - 4  # oberer Rand des Bildes
    lo, hi = 0.65, 1.5  # höchstens um ein Drittel stauchen, sonst wirkt es platt
    for _ in range(30):
        mid = (lo + hi) / 2
        t = roh(1)
        t.strecken(mid)
        if t.hoehe_px(n) > ziel:
            hi = mid
        else:
            lo = mid
    return lo


def modell(thema: str, rolle: str):
    roh = globals()[f"{thema}_{rolle}"]
    if ROLLEN[rolle][0] == 1:
        f = zier_faktor(thema, rolle)

        def gestaucht(stufe: int):
            sz = roh(stufe)
            sz.strecken(f)
            return sz

        return gestaucht
    if (thema, rolle) not in _STRECKUNG:
        _STRECKUNG[(thema, rolle)] = streckung(thema, rolle)

    def gestreckt(stufe: int):
        sz = roh(stufe)
        sz.strecken(_STRECKUNG[(thema, rolle)][stufe - 1])
        return sz

    return gestreckt


# Epoche, in der eine Stufe zuerst baubar ist (Katalog `ab`, GRAFIK-SPRITES.md §12.11)
EPOCHE_VON = {
    "kern": {1: 1, 2: 1, 3: 1, 4: 2, 5: 2, 6: 3, 7: 3, 8: 4, 9: 4},
    "wissen": {1: 1, 2: 1, 3: 2, 4: 3, 5: 4},
    "turm": {1: 1, 2: 1, 3: 2, 4: 3, 5: 4},
    "werkstatt": {1: 1, 2: 2, 3: 3},
    "eingang": {1: 1, 2: 2},
}
