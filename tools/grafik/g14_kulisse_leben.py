"""Mehr Leben in der Kulisse (Wunsch PV, 03.11.2026): „Die Kulissen sind noch zu viel
freie Fläche, die mit Leben gefüllt werden muss.“

Neue Dinge je Thema, im Stil von G12 (eigener Renderer, `raum.py`):
- **Flächen am Boden** (zwei Felder breit): Sandbank, Riff, Acker, Beet,
  Seegraswiese, Sandrippel, Kraterfeld – sie brechen die gleichförmige Fläche auf.
- **Dinge** (ein Feld): Boje, Leuchtturm, Baumgruppe, Kuh, Schaf, Zaun, Bank,
  Vogeltränke, Anemone, Seestern, Fischschwarm, Geröll, Antenne, Eisbrocken, Satellit.
Pflanzliches gibt es zusätzlich je Jahreszeit (`_fruehling`, `_herbst`, `_winter`).

Ausgabe: `public/grafik/atlas/kulisse/<thema>/dinge/<name>.png` (Fuß unten Mitte).
Aufruf: python3 tools/grafik/g14_kulisse_leben.py
"""

from __future__ import annotations

import math
import shutil
import sys
from multiprocessing import Pool
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from g12_modelle import BLUETE, HERBST, LAUB, SCHNEE, baum, frueh  # noqa: E402
from g12_rest import at, koerper, palette  # noqa: E402
from raum import ERDE, HOLZ, SOCKEL, STEIN, Szene, rendern  # noqa: E402

ZIEL = Path(__file__).resolve().parents[2] / "public" / "grafik" / "atlas" / "kulisse"
JZ = ("fruehling", "herbst", "winter")
SAND = (222, 204, 160)
NASS = (190, 172, 132)


def szene():
    sz = Szene()
    sz.schatten_r = 0.0
    return sz


# —— Bastion ——————————————————————————————————————————————————————————————


def sandbank(jz="sommer"):
    sz = szene()
    sz.kugel(0, 0, 0, 0.95, "sand", NASS, rz=0.03)
    sz.kugel(0.05, -0.05, 1, 0.78, "sand", SAND, rz=0.05)
    for x, y in ((0.3, 0.2), (-0.35, -0.1), (0.1, -0.4)):
        sz.kugel(x, y, 3, 0.05, "glatt", (238, 226, 214), rz=0.02)
    sz.kugel(-0.2, 0.3, 4, 0.1, "stein", SOCKEL, rz=0.06)
    return sz


def riff(jz="sommer"):
    sz = szene()
    for x, y, r in ((0, 0, 0.7), (-0.5, 0.3, 0.45), (0.45, -0.35, 0.4)):
        sz.kugel(x, y, -2, r, "glatt", (44, 108, 128), rz=0.02)
    for x, y, r, h in ((0.1, 0.05, 0.16, 10), (-0.35, 0.25, 0.12, 6), (0.4, -0.3, 0.1, 5)):
        sz.kugel(x, y, 0, r, "stein", (128, 120, 110), rz=h / 58.8)
    return sz


def boje(jz="sommer"):
    sz = szene()
    for k, (z0, z1) in enumerate(((0, 10), (10, 20), (20, 30))):
        sz.zylinder(0, 0, 0.1, z0, z1, "glatt", (214, 64, 52) if k % 2 == 0 else (244, 240, 232), n=20)
    sz.kugel(0, 0, 36, 0.06, "glatt", (236, 196, 60))
    sz.zylinder(0, 0, 0.16, -2, 1, "glatt", (180, 54, 44), n=20)
    return sz


def leuchtturm(jz="sommer"):
    sz = szene()
    for x, y, r, h in ((0, 0, 0.42, 16), (-0.25, 0.2, 0.24, 10), (0.28, -0.12, 0.22, 8)):
        sz.kugel(x, y, 0, r, "stein", (150, 140, 128), rz=h / 58.8)
    for k in range(5):
        sz.zylinder(0, 0, 0.13 - k * 0.008, 14 + k * 16, 30 + k * 16, "putz", (240, 236, 228) if k % 2 == 0 else (204, 70, 58), n=24)
    sz.zylinder(0, 0, 0.1, 94, 106, "licht", (255, 226, 140), n=20)
    sz.kegel(0, 0, 0.14, 106, 16, "metall", (60, 70, 80))
    return sz


# —— Dorf ——————————————————————————————————————————————————————————————————


def acker(jz="sommer"):
    sz = szene()
    boden = {"winter": (236, 240, 244), "herbst": (128, 92, 60)}.get(jz, ERDE)
    sz.quader(-0.9, 0.9, -0.6, 0.6, 0, 2, "erde", boden)
    for k in range(6):
        y = -0.5 + k * 0.2
        if jz == "herbst":
            # gepflügt: Furchen
            sz.balken((-0.85, y, 3), (0.85, y, 3), 0.06, 0.04, "erde", (104, 74, 48))
        elif jz == "winter":
            sz.balken((-0.85, y, 3), (0.85, y, 3), 0.07, 0.03, "glatt", SCHNEE)
        else:
            farbe = (132, 186, 84) if jz == "fruehling" else (222, 184, 86)
            hoch = 5 if jz == "fruehling" else 11
            sz.balken((-0.85, y, 2), (0.85, y, 2 + hoch), 0.12, 0.02, "laub", farbe, quer=(0, 0, 1))
    return sz


def baumgruppe(jz="sommer"):
    sz = szene()
    for x, y, h, r, f in ((-0.25, 0.1, 110, 0.3, LAUB), (0.22, -0.18, 96, 0.27, (104, 150, 70)), (0.1, 0.32, 80, 0.22, (98, 146, 66))):
        baum(sz, x, y, h, r, stamm=0.05, farbe=f, jz=jz)
    return sz


def kuh(jz="sommer"):
    sz = szene()
    weiss, fleck = (244, 240, 232), (52, 44, 40)
    koerper(sz, 0, 22, 0.42, 0.13, 16, weiss)
    for v, q in ((0.08, 0.06), (-0.1, -0.05)):
        x, y = at(v, q)
        sz.kugel(x, y, 26, 0.07, "glatt", fleck, rz=0.06)
    for v in (0.13, -0.13):
        for q in (-0.06, 0.06):
            x, y = at(v, q)
            sz.zylinder(x, y, 0.025, 0, 16, "glatt", weiss, n=10)
    # Kopf gesenkt: grast
    kx, ky = at(0.27)
    sz.kugel(kx, ky, 14, 0.08, "glatt", weiss, rz=0.07)
    nx, ny = at(0.33)
    sz.kugel(nx, ny, 10, 0.05, "glatt", (226, 170, 160), rz=0.04)
    return sz


def schaf(jz="sommer"):
    sz = szene()
    wolle = (240, 238, 230)
    for v, q in ((0.06, 0), (-0.06, 0.03), (0, -0.04), (-0.1, -0.02)):
        x, y = at(v, q)
        sz.kugel(x, y, 18, 0.1, "laub", wolle, rz=0.1)
    kx, ky = at(0.17)
    sz.kugel(kx, ky, 16, 0.05, "glatt", (60, 54, 50), rz=0.05)
    for v in (0.07, -0.08):
        for q in (-0.04, 0.04):
            x, y = at(v, q)
            sz.zylinder(x, y, 0.016, 0, 10, "glatt", (60, 54, 50), n=8)
    return sz


def zaun(jz="sommer"):
    sz = szene()
    for k in range(5):
        x = -0.8 + k * 0.4
        sz.quader(x - 0.025, x + 0.025, -0.025, 0.025, 0, 22, "holz", HOLZ)
        if jz == "winter":
            sz.kugel(x, 0, 23, 0.035, "glatt", SCHNEE, rz=0.02)
    for z in (9, 17):
        sz.balken((-0.8, 0, z), (0.8, 0, z), 0.02, 0.03, "holz", HOLZ)
    return sz


# —— Garten ————————————————————————————————————————————————————————————————


def beet(jz="sommer"):
    sz = szene()
    sz.quader(-0.85, 0.85, -0.5, 0.5, 0, 6, "stein", SOCKEL)
    erde = (236, 240, 244) if jz == "winter" else ERDE
    sz.quader(-0.78, 0.78, -0.43, 0.43, 6, 8, "erde", erde)
    if jz == "winter":
        return sz
    farben = {"fruehling": ((236, 96, 112), (250, 214, 92), (244, 186, 204)), "herbst": ((214, 120, 52), (156, 90, 170), (226, 172, 64))}.get(jz, BLUETE)
    for i in range(7):
        for j in range(3):
            x, y = -0.66 + i * 0.22, -0.28 + j * 0.28
            sz.kugel(x, y, 13, 0.07, "laub", frueh(LAUB) if jz == "fruehling" else LAUB, rz=0.06)
            sz.kugel(x + 0.02, y + 0.02, 18, 0.045, "glatt", farben[(i + j) % len(farben)])
    return sz


def bank(jz="sommer"):
    sz = szene()
    for x in (-0.3, 0.3):
        sz.quader(x - 0.03, x + 0.03, -0.1, 0.1, 0, 12, "metall", (60, 66, 70))
    sz.quader(-0.38, 0.38, -0.12, 0.08, 12, 15, "holz", HOLZ)
    sz.quader(-0.38, 0.38, 0.08, 0.12, 15, 30, "holz", HOLZ)
    if jz == "winter":
        sz.quader(-0.36, 0.36, -0.1, 0.07, 15, 17, "glatt", SCHNEE)
    return sz


def vogeltraenke(jz="sommer"):
    sz = szene()
    sz.zylinder(0, 0, 0.08, 0, 24, "stein", STEIN, n=20)
    sz.zylinder(0, 0, 0.22, 24, 30, "stein", STEIN, n=28)
    sz.zylinder(0, 0, 0.18, 30, 31, "glatt", (206, 226, 236) if jz == "winter" else (110, 170, 200), n=28)
    return sz


# —— Unterwasser ———————————————————————————————————————————————————————————


def seegras(jz="sommer"):
    sz = szene()
    sz.kugel(0, 0, 0, 0.9, "sand", (196, 182, 140), rz=0.02)
    for i in range(18):
        a = i * 2.39996
        rr = 0.75 * math.sqrt((i + 0.5) / 18)
        x, y = rr * math.cos(a), rr * math.sin(a) * 0.8
        h = 26 + (i * 7) % 18
        neig = 0.06 * math.sin(i)
        sz.balken((x, y, 0), (x + neig, y - neig, h), 0.03, 0.012, "laub", (64, 140, 84) if i % 3 else (92, 160, 92), quer=(0.7071, -0.7071, 0))
    return sz


def sandrippel(jz="sommer"):
    sz = szene()
    sz.kugel(0, 0, 0, 0.95, "sand", (206, 190, 146), rz=0.02)
    for k in range(5):
        y = -0.5 + k * 0.25
        sz.balken((-0.7, y, 1), (0.7, y + 0.08, 1), 0.06, 0.02, "sand", (226, 212, 172))
    sz.kugel(0.3, -0.2, 2, 0.05, "glatt", (236, 226, 214), rz=0.02)
    return sz


def anemone(jz="sommer"):
    sz = szene()
    sz.zylinder(0, 0, 0.1, 0, 10, "koralle", (200, 120, 150), n=20)
    for k in range(12):
        a = 2 * math.pi * k / 12
        sz.balken((0.05 * math.cos(a), 0.05 * math.sin(a), 10), (0.16 * math.cos(a), 0.16 * math.sin(a), 22 + (k % 3) * 3), 0.025, 0.025, "koralle", (236, 140, 180))
    return sz


def seestern(jz="sommer"):
    sz = szene()
    for k in range(5):
        a = 2 * math.pi * k / 5 + 0.3
        sz.balken((0, 0, 2), (0.22 * math.cos(a), 0.22 * math.sin(a), 1), 0.07, 0.025, "koralle", (232, 120, 64))
    sz.kugel(0, 0, 2, 0.06, "koralle", (240, 140, 80), rz=0.03)
    return sz


def fischschwarm(jz="sommer"):
    sz = szene()
    for k in range(7):
        v, q, z = ((0, 0, 40), (-0.14, 0.12, 46), (-0.12, -0.14, 36), (-0.28, 0.02, 42), (0.12, 0.16, 50), (0.1, -0.12, 32), (-0.3, -0.2, 50))[k]
        x, y = at(v, q)
        farbe = (236, 210, 90) if k % 2 else (110, 170, 220)
        for t, r in ((-0.04, 0.03), (0, 0.04), (0.04, 0.03)):
            px, py = at(v + t, q)
            sz.kugel(px, py, z, r, "glatt", farbe, rz=0.03)
        a, b = at(v - 0.07, q), at(v - 0.11, q)
        sz.balken((a[0], a[1], z), (b[0], b[1], z), 0.01, 0.05, "glatt", farbe, quer=(0, 0, 1))
    return sz


# —— Weltraum ——————————————————————————————————————————————————————————————


def kraterfeld(jz="sommer"):
    sz = szene()
    for x, y, r in ((0, 0, 0.3), (-0.55, 0.3, 0.2), (0.5, -0.3, 0.22), (0.3, 0.45, 0.14)):
        for k in range(10):
            a = 2 * math.pi * k / 10
            sz.kugel(x + r * math.cos(a), y + r * math.sin(a), 0, r * 0.32, "stein", (170, 166, 158), rz=0.05)
        sz.kugel(x, y, -2, r * 0.9, "stein", (110, 106, 102), rz=0.02)
    return sz


def geroell(jz="sommer"):
    sz = szene()
    for x, y, r, h in ((0, 0, 0.16, 12), (0.2, 0.12, 0.1, 8), (-0.18, 0.1, 0.12, 9), (0.05, -0.2, 0.08, 6)):
        sz.kugel(x, y, 0, r, "stein", (150, 146, 140), rz=h / 58.8)
    return sz


def antenne(jz="sommer"):
    sz = szene()
    sz.quader(-0.12, 0.12, -0.12, 0.12, 0, 6, "metall", (176, 182, 190))
    sz.zylinder(0, 0, 0.02, 6, 60, "metall", (200, 204, 210), n=12)
    for z in (20, 36, 50):
        sz.balken((-0.1, 0, z), (0.1, 0, z), 0.012, 0.012, "metall", (200, 204, 210))
    sz.kugel(0, 0, 62, 0.035, "licht", (255, 90, 80))
    return sz


def eisbrocken(jz="sommer"):
    sz = szene()
    for x, y, r, h in ((0, 0, 0.18, 18), (0.18, 0.1, 0.1, 10), (-0.15, 0.12, 0.12, 12)):
        sz.kugel(x, y, 0, r, "glatt", (200, 226, 240), rz=h / 58.8)
    return sz


def satellit(jz="sommer"):
    sz = szene()
    sz.quader(-0.08, 0.08, -0.08, 0.08, 30, 46, "metall", (214, 182, 104))
    for s in (-1, 1):
        sz.balken((0, s * 0.08, 38), (0, s * 0.2, 38), 0.015, 0.015, "metall", (176, 182, 190))
        sz.quader(-0.08, 0.08, s * 0.2 - 0.12 * (s < 0), s * 0.2 + 0.12 * (s > 0), 35, 41, "solar", (44, 66, 118))
    sz.zylinder(0, 0, 0.01, 46, 56, "metall", (200, 204, 210), n=8)
    return sz


# Je Thema: Name → (Modell, Breite in Feldern, je Jahreszeit?)
DINGE = {
    "bastion": {"sandbank": (sandbank, 2, False), "riff": (riff, 2, False), "boje": (boje, 1, False), "leuchtturm": (leuchtturm, 1, False)},
    "dorf": {"acker": (acker, 2, True), "baumgruppe": (baumgruppe, 1, True), "kuh": (kuh, 1, False), "schaf": (schaf, 1, False), "zaun": (zaun, 1, True)},
    "garten": {"beet": (beet, 2, True), "baumgruppe": (baumgruppe, 1, True), "bank": (bank, 1, True), "vogeltraenke": (vogeltraenke, 1, True)},
    "unterwasser": {"seegras": (seegras, 2, False), "sandrippel": (sandrippel, 2, False), "anemone": (anemone, 1, False), "seestern": (seestern, 1, False), "fischschwarm": (fischschwarm, 1, False)},
    "weltraum": {"kraterfeld": (kraterfeld, 2, False), "geroell": (geroell, 1, False), "antenne": (antenne, 1, False), "eisbrocken": (eisbrocken, 1, False), "satellit": (satellit, 1, False)},
}


def job(a):
    thema, name, jz = a
    fn, felder, _ = DINGE[thema][name]
    tag, _ = rendern(fn(jz), 160 * felder, felder, schatten_r=0.0)
    datei = f"{name}.png" if jz == "sommer" else f"{name}_{jz}.png"
    palette(tag, ZIEL / thema / "dinge" / datei)
    return (thema, datei, tag.size)


def main() -> int:
    jobs = [(t, n, "sommer") for t, d in DINGE.items() for n in d]
    jobs += [(t, n, jz) for t, d in DINGE.items() for n, (_, _, je) in d.items() if je for jz in JZ]
    with Pool(4) as pool:
        for thema, datei, groesse in pool.imap_unordered(job, jobs):
            print(thema, datei, groesse)
    shutil.rmtree(Path(__file__).resolve().parent / "__pycache__", ignore_errors=True)
    print(len(jobs), "Bilder geschrieben")
    return 0


if __name__ == "__main__":
    sys.exit(main())
