"""Noch mehr Abwechslung in der Kulisse (Wunsch PV, 03.11.2026): „Mehr Abwechslung, noch mehr
unterschiedliche Objekte würfelbar in mehr Größen.“

Neue Dinge je Thema im Stil von G12–G15 (Renderer `raum.py`), ein Feld breit, Fuß unten
Mitte. Pflanzliches und Verschneibares auch je Jahreszeit (`_fruehling/_herbst/_winter`).

Ausgabe: `public/grafik/atlas/kulisse/<thema>/dinge/<name>.png`
Aufruf: python3 tools/grafik/g16_mehr_dinge.py
"""

from __future__ import annotations

import math
import shutil
import sys
from multiprocessing import Pool
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from g12_modelle import KORALLE, LAUB, METALL, PANEEL, SCHNEE, SOLAR, haus, schuessel  # noqa: E402
from g12_rest import at, koerper, kopf_punkt, palette  # noqa: E402
from g15_varianten import nadelbaum  # noqa: E402
from raum import ERDE, HOLZ, SOCKEL, STEIN, Szene, rendern  # noqa: E402

ZIEL = Path(__file__).resolve().parents[2] / "public" / "grafik" / "atlas" / "kulisse"
JZ = ("fruehling", "herbst", "winter")
DUNKELHOLZ = (96, 70, 48)
ROT = (176, 64, 50)


def szene():
    sz = Szene()
    sz.schatten_r = 0.0
    return sz


def schnee_auf(sz, x0, x1, y0, y1, z, jz, dicke=3):
    if jz == "winter":
        sz.quader(x0, x1, y0, y1, z, z + dicke, "glatt", SCHNEE)


# —— Bastion ——————————————————————————————————————————————————————————————


def wrack(jz="sommer"):
    sz = szene()
    # schräg liegender Rumpf, halb im Wasser
    for k in range(6):
        t = -0.35 + k * 0.14
        sz.balken((t, -0.18, 0), (t + 0.05, -0.2, 22 - k * 2), 0.04, 0.04, "holz", DUNKELHOLZ)
        sz.balken((t, 0.18, 0), (t + 0.05, 0.2, 18 - k * 2), 0.04, 0.04, "holz", DUNKELHOLZ)
    sz.balken((-0.4, 0, 2), (0.45, 0, 4), 0.05, 0.05, "holz", DUNKELHOLZ)
    sz.balken((0.05, 0, 4), (0.12, 0.05, 52), 0.035, 0.035, "holz", DUNKELHOLZ)
    sz.balken((0.0, -0.15, 40), (0.2, 0.2, 44), 0.025, 0.025, "holz", DUNKELHOLZ)
    return sz


def fischerboot(jz="sommer"):
    sz = szene()
    for k, (t, r) in enumerate(((-0.24, 0.07), (-0.12, 0.1), (0, 0.11), (0.12, 0.1), (0.24, 0.06))):
        sz.kugel(t, -t * 0.3, 6, r, "holz", (60, 110, 150) if k % 2 else (66, 120, 160), rz=0.06)
    sz.quader(-0.06, 0.06, -0.06, 0.06, 8, 22, "holz", (236, 230, 214))
    sz.zylinder(0.0, 0.0, 0.012, 22, 50, "holz", DUNKELHOLZ, n=8)
    sz.kugel(-0.12, 0.08, 10, 0.03, "glatt", ROT, rz=0.03)
    return sz


def steg(jz="sommer"):
    sz = szene()
    sz.quader(-0.5, 0.5, -0.1, 0.1, 10, 13, "holz", HOLZ)
    for x in (-0.45, -0.15, 0.15, 0.45):
        for y in (-0.09, 0.09):
            sz.zylinder(x, y, 0.025, 0, 13, "holz", DUNKELHOLZ, n=10)
    schnee_auf(sz, -0.48, 0.48, -0.09, 0.09, 13, jz, 2)
    return sz


def seehundfels(jz="sommer"):
    sz = szene()
    for x, y, r, h in ((0, 0, 0.32, 14), (0.25, 0.1, 0.18, 9)):
        sz.kugel(x, y, 0, r, "stein", (146, 138, 128), rz=h / 58.8)
    grau = (120, 116, 112)
    koerper(sz, 0.0, 18, 0.26, 0.07, 8, grau)
    kopf_punkt(sz, 0.13, 22, 0.045, grau)
    return sz


def vogelfels(jz="sommer"):
    sz = szene()
    for x, y, r, h in ((0, 0, 0.26, 30), (0.16, -0.08, 0.16, 18), (-0.14, 0.12, 0.14, 12)):
        sz.kugel(x, y, 0, r, "stein", (150, 142, 132), rz=h / 58.8)
    for x, y, z in ((0.0, 0.0, 34), (0.16, -0.08, 21), (-0.1, 0.1, 15)):
        sz.kugel(x, y, z, 0.035, "glatt", (246, 246, 242), rz=0.04)
    return sz


def felseninsel(jz="sommer"):
    sz = szene()
    sz.kugel(0, 0, 0, 0.42, "stein", (150, 140, 128), rz=0.14)
    nadelbaum(sz, -0.05, 0.02, 70, 0.14, jz)
    return sz


# —— Dorf ——————————————————————————————————————————————————————————————————


def windmuehle(jz="sommer"):
    sz = szene()
    sz.zylinder(0, 0, 0.2, 0, 60, "putz", (236, 228, 210), n=28)
    sz.kegel(0, 0, 0.23, 60, 26, "schindel", (112, 82, 58), n=28)
    if jz == "winter":
        sz.kegel(0, 0, 0.18, 66, 18, "glatt", SCHNEE, n=28)
    nx, ny = 0.16, 0.16
    for k in range(4):
        a = math.pi / 4 + k * math.pi / 2
        ende = (nx + 0.3 * math.cos(a) * 0.7071, ny - 0.3 * math.cos(a) * 0.7071, 58 + 34 * math.sin(a))
        sz.balken((nx, ny, 58), ende, 0.1, 0.01, "holz", (226, 216, 196), quer=(0.7071, 0.7071, 0))
    sz.kugel(nx, ny, 58, 0.04, "holz", DUNKELHOLZ)
    return sz


def scheune(jz="sommer"):
    sz = szene()
    haus(sz, -0.34, 0.34, -0.26, 0.26, 34, "holz", ROT, "schindel", (96, 72, 56), dh=28, fenster=False, tuer=True)
    if jz == "winter":
        sz.satteldach(-0.37, 0.37, -0.29, 0.29, 36, 30, "glatt", SCHNEE, ueber=0.02)
    return sz


def holzstapel(jz="sommer"):
    sz = szene()
    for reihe in range(3):
        for k in range(5 - reihe):
            x = -0.2 + k * 0.1 + reihe * 0.05
            sz.walze((x, 0, 5 + reihe * 8.5), (0, 1, 0), 0.045, 0.34, "holz", (150, 108, 70) if (k + reihe) % 2 else (136, 96, 62))
    schnee_auf(sz, -0.2, 0.2, -0.17, 0.17, 28, jz, 2)
    return sz


def bienenstoecke(jz="sommer"):
    sz = szene()
    for x in (-0.2, 0.05, 0.3):
        sz.quader(x - 0.08, x + 0.08, -0.08, 0.08, 4, 26, "holz", (226, 196, 90) if x < 0 else (230, 214, 160))
        sz.quader(x - 0.1, x + 0.1, -0.1, 0.1, 26, 30, "holz", (120, 90, 60))
        sz.quader(x - 0.03, x + 0.03, -0.085, -0.075, 8, 12, "glatt", (40, 30, 20))
        schnee_auf(sz, x - 0.1, x + 0.1, -0.1, 0.1, 30, jz, 3)
    return sz


def vogelscheuche(jz="sommer"):
    sz = szene()
    sz.zylinder(0, 0, 0.018, 0, 50, "holz", DUNKELHOLZ, n=8)
    sz.balken((-0.18, 0.0, 40), (0.18, 0.0, 40), 0.025, 0.025, "holz", DUNKELHOLZ)
    sz.quader(-0.07, 0.07, -0.05, 0.05, 26, 44, "holz", (90, 120, 170))
    sz.kugel(0, 0, 52, 0.06, "holz", (226, 200, 150))
    sz.kegel(0, 0, 0.1, 56, 12, "holz", (200, 170, 90), n=20)
    if jz == "winter":
        sz.kegel(0, 0, 0.07, 62, 7, "glatt", SCHNEE, n=20)
    return sz


def karren(jz="sommer"):
    sz = szene()
    sz.quader(-0.22, 0.22, -0.14, 0.14, 12, 22, "holz", HOLZ)
    for y in (-0.16, 0.16):
        sz.walze((0.05, y, 10), (0, 1, 0), 0.1, 0.03, "holz", DUNKELHOLZ)
    sz.balken((0.22, 0, 16), (0.45, 0, 10), 0.03, 0.03, "holz", DUNKELHOLZ)
    if jz == "herbst":
        for k in range(5):
            sz.kugel(-0.12 + k * 0.06, (k % 2) * 0.06 - 0.03, 26, 0.05, "glatt", (226, 120, 40))
    else:
        sz.quader(-0.2, 0.2, -0.12, 0.12, 22, 26, "laub" if jz != "winter" else "glatt", (214, 184, 100) if jz != "winter" else SCHNEE)
    return sz


def pferd(jz="sommer"):
    sz = szene()
    braun = (132, 92, 60)
    koerper(sz, 0, 26, 0.38, 0.1, 14, braun)
    for v in (0.13, -0.13):
        for q in (-0.05, 0.05):
            x, y = at(v, q)
            sz.zylinder(x, y, 0.022, 0, 22, "glatt", braun, n=10)
    hx, hy = at(0.22)
    kx, ky = at(0.3)
    sz.balken((hx, hy, 30), (kx, ky, 42), 0.07, 0.07, "glatt", braun)
    sz.kugel(kx, ky, 42, 0.06, "glatt", braun, rz=0.05)
    mx, my = at(0.18)
    sz.balken((mx, my, 34), (kx, ky, 46), 0.03, 0.015, "glatt", (60, 44, 32))
    tx, ty = at(-0.22)
    sz.balken((tx, ty, 28), (tx, ty, 14), 0.03, 0.015, "glatt", (60, 44, 32))
    return sz


# —— Garten ————————————————————————————————————————————————————————————————


def pavillon(jz="sommer"):
    sz = szene()
    sz.zylinder(0, 0, 0.3, 0, 4, "stein", SOCKEL, n=8)
    for k in range(6):
        a = 2 * math.pi * k / 6
        sz.zylinder(0.24 * math.cos(a), 0.24 * math.sin(a), 0.018, 4, 40, "putz", (240, 236, 228), n=8)
    sz.kegel(0, 0, 0.32, 40, 22, "kupfer", (92, 156, 138), n=6)
    if jz == "winter":
        sz.kegel(0, 0, 0.24, 46, 15, "glatt", SCHNEE, n=6)
    return sz


def rosenbogen(jz="sommer"):
    sz = szene()
    for y in (-0.16, 0.16):
        sz.zylinder(0, y, 0.015, 0, 44, "metall", (70, 74, 78), n=8)
    for k in range(9):
        a = math.pi * k / 8
        sz.kugel(0, -0.16 * math.cos(a), 44 + 12 * math.sin(a), 0.035, "metall", (70, 74, 78), rz=0.03)
    if jz == "winter":
        return sz
    blatt = {"herbst": (170, 120, 50), "fruehling": (110, 170, 80)}.get(jz, (70, 130, 60))
    bluete = {"herbst": (176, 40, 36), "fruehling": (244, 186, 204)}.get(jz, (214, 70, 90))
    for k in range(14):
        a = math.pi * k / 13
        y, z = -0.16 * math.cos(a), 44 + 12 * math.sin(a)
        sz.kugel(0.02, y, z - (k % 3) * 8, 0.045, "laub", blatt, rz=0.04)
        if k % 2 == 0:
            sz.kugel(0.05, y, z - 4, 0.028, "glatt", bluete)
    return sz


def gewaechshaus(jz="sommer"):
    sz = szene()
    sz.quader(-0.3, 0.3, -0.2, 0.2, 0, 4, "stein", SOCKEL)
    sz.quader(-0.28, 0.28, -0.18, 0.18, 4, 24, "glas", (200, 230, 236))
    sz.satteldach(-0.3, 0.3, -0.2, 0.2, 24, 14, "glas", (200, 230, 236), ueber=0.0)
    if jz != "winter":
        for x in (-0.15, 0.0, 0.15):
            sz.kugel(x, 0, 12, 0.06, "laub", LAUB, rz=0.05)
    return sz


def vogelhaus(jz="sommer"):
    sz = szene()
    sz.zylinder(0, 0, 0.018, 0, 34, "holz", DUNKELHOLZ, n=8)
    sz.quader(-0.08, 0.08, -0.07, 0.07, 34, 48, "holz", (196, 150, 96))
    sz.satteldach(-0.1, 0.1, -0.09, 0.09, 48, 10, "schindel", ROT, ueber=0.02)
    sz.kugel(0.0, -0.075, 42, 0.022, "glatt", (40, 30, 20), rz=0.022)
    if jz == "winter":
        sz.satteldach(-0.1, 0.1, -0.09, 0.09, 50, 9, "glatt", SCHNEE, ueber=0.0)
    return sz


def sonnenuhr(jz="sommer"):
    sz = szene()
    sz.zylinder(0, 0, 0.12, 0, 22, "stein", STEIN, n=20)
    sz.zylinder(0, 0, 0.16, 22, 25, "stein", (196, 184, 164), n=24)
    sz.balken((0, 0, 25), (0.06, -0.06, 36), 0.012, 0.05, "metall", (180, 150, 80))
    if jz == "winter":
        sz.zylinder(0, 0, 0.14, 25, 27, "glatt", SCHNEE, n=24)
    return sz


def kuerbisbeet(jz="sommer"):
    sz = szene()
    sz.quader(-0.4, 0.4, -0.3, 0.3, 0, 3, "erde", (236, 240, 244) if jz == "winter" else ERDE)
    if jz == "winter":
        return sz
    for k, (x, y) in enumerate(((-0.25, -0.15), (0.0, 0.1), (0.22, -0.12), (-0.1, 0.18), (0.25, 0.16))):
        sz.kugel(x, y, 6, 0.08, "laub", (86, 150, 66), rz=0.03)
        if jz == "herbst" or (jz == "sommer" and k % 2 == 0):
            farbe = (232, 132, 42) if jz == "herbst" else (150, 170, 70)
            sz.kugel(x + 0.03, y, 8, 0.07 if jz == "herbst" else 0.045, "glatt", farbe, rz=0.05)
    return sz


# —— Unterwasser ———————————————————————————————————————————————————————————


def uw_wrack(jz="sommer"):
    sz = szene()
    gruen = (90, 110, 96)
    for k in range(5):
        t = -0.3 + k * 0.15
        sz.balken((t, -0.16, 0), (t + 0.04, -0.18, 20 - k * 2), 0.04, 0.04, "holz", gruen)
        sz.balken((t, 0.16, 0), (t + 0.04, 0.18, 16 - k * 2), 0.04, 0.04, "holz", gruen)
    sz.balken((-0.35, 0, 2), (0.35, 0, 3), 0.05, 0.05, "holz", gruen)
    sz.balken((0.0, 0, 3), (-0.05, 0.1, 40), 0.035, 0.035, "holz", gruen)
    sz.kugel(0.2, 0.1, 4, 0.06, "koralle", KORALLE)
    return sz


def amphoren(jz="sommer"):
    sz = szene()
    for x, y, liegt in ((-0.15, 0.05, False), (0.08, -0.1, False), (0.2, 0.15, True)):
        if liegt:
            sz.walze((x, y, 7), (1, -1, 0), 0.07, 0.24, "glatt", (186, 104, 70))
        else:
            sz.kugel(x, y, 12, 0.09, "glatt", (186, 104, 70), rz=0.14)
            sz.zylinder(x, y, 0.035, 20, 30, "glatt", (186, 104, 70), n=12)
    return sz


def riesenmuschel(jz="sommer"):
    sz = szene()
    sz.kugel(0, 0, 4, 0.26, "perlmutt", (226, 214, 236), rz=0.08)
    sz.kugel(0.02, -0.02, 14, 0.24, "perlmutt", (236, 224, 244), rz=0.07)
    sz.kugel(0.0, -0.1, 10, 0.05, "glatt", (250, 250, 250))
    return sz


def korallenbogen(jz="sommer"):
    sz = szene()
    for k in range(11):
        a = math.pi * k / 10
        sz.kugel(-0.3 * math.cos(a), 0, 44 * math.sin(a), 0.07, "koralle", (226, 122, 100) if k % 2 else (200, 110, 160), rz=0.07)
    return sz


def saeulenreste(jz="sommer"):
    sz = szene()
    sz.zylinder(-0.15, 0, 0.07, 0, 46, "stein", (200, 192, 176), n=16)
    sz.zylinder(0.15, 0.05, 0.07, 0, 22, "stein", (200, 192, 176), n=16)
    sz.walze((0.2, -0.18, 6), (1, 0, 0), 0.06, 0.26, "stein", (196, 188, 170))
    sz.quader(-0.22, -0.08, -0.07, 0.07, 46, 52, "stein", (206, 198, 182))
    return sz


def muschelbank(jz="sommer"):
    sz = szene()
    sz.kugel(0, 0, 0, 0.36, "sand", (206, 190, 146), rz=0.02)
    for k in range(9):
        a = k * 2.4
        r = 0.25 * math.sqrt((k + 0.5) / 9)
        sz.kugel(r * math.cos(a), r * math.sin(a), 2, 0.05, "perlmutt", ((236, 226, 214), (226, 190, 170), (210, 200, 230))[k % 3], rz=0.025)
    return sz


# —— Weltraum ——————————————————————————————————————————————————————————————


def rover(jz="sommer"):
    sz = szene()
    sz.quader(-0.16, 0.16, -0.1, 0.1, 10, 20, "metall", (214, 182, 104))
    for x in (-0.12, 0.0, 0.12):
        for y in (-0.12, 0.12):
            sz.walze((x, y, 6), (0, 1, 0), 0.05, 0.03, "metall", (60, 62, 66))
    sz.balken((-0.16, -0.12, 21), (0.16, -0.12, 21), 0.16, 0.01, "solar", SOLAR, quer=(0, 0, 1))
    sz.zylinder(0.1, 0.05, 0.012, 20, 38, "metall", METALL, n=8)
    sz.kugel(0.1, 0.05, 40, 0.035, "metall", PANEEL)
    return sz


def landekapsel(jz="sommer"):
    sz = szene()
    for k in range(3):
        a = 2 * math.pi * k / 3
        sz.balken((0.1 * math.cos(a), 0.1 * math.sin(a), 16), (0.22 * math.cos(a), 0.22 * math.sin(a), 0), 0.02, 0.02, "metall", METALL)
    sz.kegel(0, 0, 0.16, 12, 34, "paneel", PANEEL, n=24)
    sz.zylinder(0, 0, 0.16, 8, 14, "metall", (60, 62, 66), n=24)
    sz.kugel(0.08, -0.08, 26, 0.03, "glas", (150, 210, 226))
    return sz


def solarfeld(jz="sommer"):
    sz = szene()
    for i in range(3):
        for j in range(2):
            x, y = -0.24 + i * 0.24, -0.12 + j * 0.24
            sz.zylinder(x, y, 0.012, 0, 8, "metall", METALL, n=8)
            sz.balken((x - 0.1, y, 12), (x + 0.1, y, 9), 0.18, 0.01, "solar", SOLAR, quer=(0, 1, 0))
    return sz


def meteorit(jz="sommer"):
    sz = szene()
    for k in range(10):
        a = 2 * math.pi * k / 10
        sz.kugel(0.3 * math.cos(a), 0.3 * math.sin(a), 0, 0.08, "stein", (164, 160, 152), rz=0.03)
    sz.kugel(0.02, -0.02, 6, 0.14, "metall", (70, 64, 60), rz=0.12)
    return sz


def funkmast(jz="sommer"):
    sz = szene()
    for k in range(4):
        a = math.pi / 4 + k * math.pi / 2
        sz.balken((0.12 * math.cos(a), 0.12 * math.sin(a), 0), (0, 0, 70), 0.015, 0.015, "metall", METALL)
    for z in (20, 40, 58):
        sz.zylinder(0, 0, 0.12 * (1 - z / 70) + 0.01, z, z + 1.5, "metall", METALL, n=4)
    schuessel(sz, 0, 0, 72, 0.12, mast=False)
    sz.kugel(0, 0, 80, 0.025, "licht", (255, 90, 80))
    return sz


def kristallfeld(jz="sommer"):
    sz = szene()
    for k, (x, y, h) in enumerate(((0, 0, 40), (0.14, 0.08, 26), (-0.12, 0.1, 30), (0.06, -0.14, 22), (-0.16, -0.08, 18))):
        farbe = ((176, 120, 220), (120, 180, 230), (200, 150, 230))[k % 3]
        sz.kegel(x, y, 0.05, 0, h, "glatt", farbe, n=6)
    return sz


# Je Thema: Name → (Modell, je Jahreszeit?)
DINGE = {
    "bastion": {"wrack": (wrack, False), "fischerboot": (fischerboot, False), "steg": (steg, True), "seehundfels": (seehundfels, False), "vogelfels": (vogelfels, False), "felseninsel": (felseninsel, True)},
    "dorf": {"windmuehle": (windmuehle, True), "scheune": (scheune, True), "holzstapel": (holzstapel, True), "bienenstoecke": (bienenstoecke, True), "vogelscheuche": (vogelscheuche, True), "karren": (karren, True), "pferd": (pferd, False)},
    "garten": {"pavillon": (pavillon, True), "rosenbogen": (rosenbogen, True), "gewaechshaus": (gewaechshaus, True), "vogelhaus": (vogelhaus, True), "sonnenuhr": (sonnenuhr, True), "kuerbisbeet": (kuerbisbeet, True)},
    "unterwasser": {"wrack": (uw_wrack, False), "amphoren": (amphoren, False), "riesenmuschel": (riesenmuschel, False), "korallenbogen": (korallenbogen, False), "saeulenreste": (saeulenreste, False), "muschelbank": (muschelbank, False)},
    "weltraum": {"rover": (rover, False), "landekapsel": (landekapsel, False), "solarfeld": (solarfeld, False), "meteorit": (meteorit, False), "funkmast": (funkmast, False), "kristallfeld": (kristallfeld, False)},
}


def job(a):
    thema, name, jz = a
    fn, _ = DINGE[thema][name]
    tag, _ = rendern(fn(jz), 160, 1, schatten_r=0.0)
    datei = f"{name}.png" if jz == "sommer" else f"{name}_{jz}.png"
    palette(tag, ZIEL / thema / "dinge" / datei)
    return (thema, datei, tag.size)


def main() -> int:
    jobs = [(t, n, "sommer") for t, d in DINGE.items() for n in d]
    jobs += [(t, n, jz) for t, d in DINGE.items() for n, (_, je) in d.items() if je for jz in JZ]
    with Pool(4) as pool:
        for thema, datei, groesse in pool.imap_unordered(job, jobs):
            print(thema, datei, groesse)
    shutil.rmtree(Path(__file__).resolve().parent / "__pycache__", ignore_errors=True)
    print(len(jobs), "Bilder geschrieben")
    return 0


if __name__ == "__main__":
    sys.exit(main())
