"""Varianten für die Kulisse (Wunsch PV, 03.11.2026): „Wir brauchen mehr unterschiedliche,
z. B. Kraterfelder und Sandbänke und Bäume, einfach alles unterschiedlich.“

Zu den Bildern aus G14 (Variante 1) entstehen Variante 2 und 3 mit anderer Form:
Sandbänke und Riffe mit anderem Umriss, Kraterfelder mit anderer Anordnung, Baumgruppen
mit Nadelbäumen oder anderer Mischung, Äcker mit anderen Reihen, Beete mit anderen
Blumen, Seegras, Sandrippel, Geröll und Eisbrocken anders gelegt. Die Formen kommen aus
einer festen Zahlenfolge je Variante (`random.Random(Startwert)` im Generator) – das
Ergebnis ist bei jedem Lauf gleich. Welche Variante wo steht, entscheidet in der App der
Szenerie-Startwert des Kindes.

Ausgabe: `kulisse/<thema>/dinge/<name>_<v>.png` (v = 2, 3), Pflanzliches zusätzlich
`<name>_<v>_<jahreszeit>.png`.
Aufruf: python3 tools/grafik/g15_varianten.py
"""

from __future__ import annotations

import math
import random
import shutil
import sys
from multiprocessing import Pool
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from g12_modelle import BLUETE, LAUB, SCHNEE, baum, frueh  # noqa: E402
from g12_rest import palette  # noqa: E402
from raum import ERDE, SOCKEL, Szene, rendern  # noqa: E402

ZIEL = Path(__file__).resolve().parents[2] / "public" / "grafik" / "atlas" / "kulisse"
JZ = ("fruehling", "herbst", "winter")
SAND = (222, 204, 160)
NASS = (190, 172, 132)
NADEL = (52, 104, 70)


def szene():
    sz = Szene()
    sz.schatten_r = 0.0
    return sz


def nadelbaum(sz, x, y, h, r, jz):
    """Nadelbaum: Stamm und drei Kegel übereinander; im Winter mit Schnee, sonst immergrün."""
    sz.zylinder(x, y, r * 0.12, 0, h * 0.25, "holz", (104, 76, 52), n=12)
    for k, (z0, f) in enumerate(((0.18, 1.0), (0.42, 0.78), (0.64, 0.55))):
        farbe = NADEL if jz != "fruehling" else (66, 124, 80)
        sz.kegel(x, y, r * f, h * z0, h * 0.34, "laub", farbe, n=24)
        if jz == "winter":
            sz.kegel(x, y, r * f * 0.62, h * (z0 + 0.17), h * 0.17, "glatt", SCHNEE, n=24)


def sandbank(v, jz="sommer"):
    z = random.Random(100 + v)
    sz = szene()
    teile = [(z.uniform(-0.35, 0.35), z.uniform(-0.3, 0.3), z.uniform(0.35, 0.6)) for _ in range(2 + v)]
    for x, y, r in teile:
        sz.kugel(x, y, 0, r + 0.15, "sand", NASS, rz=0.03)
    for x, y, r in teile:
        sz.kugel(x, y, 1, r, "sand", SAND, rz=0.05)
    for _ in range(2 + v):
        sz.kugel(z.uniform(-0.5, 0.5), z.uniform(-0.4, 0.4), 3, 0.045, "glatt", (238, 226, 214), rz=0.02)
    if v == 3:
        # Möwenrastplatz: ein Pfahl
        sz.zylinder(0.2, -0.1, 0.03, 0, 26, "holz", (110, 82, 58), n=10)
    return sz


def riff(v, jz="sommer"):
    z = random.Random(200 + v)
    sz = szene()
    for _ in range(3 + v):
        sz.kugel(z.uniform(-0.6, 0.6), z.uniform(-0.45, 0.45), -2, z.uniform(0.25, 0.5), "glatt", (40 + 10 * v, 104, 126), rz=0.02)
    for _ in range(2 + v):
        sz.kugel(z.uniform(-0.5, 0.5), z.uniform(-0.4, 0.4), 0, z.uniform(0.07, 0.15), "stein", (128, 120, 110), rz=z.uniform(4, 11) / 58.8)
    return sz


def kraterfeld(v, jz="sommer"):
    z = random.Random(300 + v)
    sz = szene()
    for _ in range(2 + v):
        x, y, r = z.uniform(-0.6, 0.6), z.uniform(-0.45, 0.45), z.uniform(0.14, 0.34)
        # Wall als flacher Ring aus vielen kleinen Kugeln, Boden dunkler, eingesunken
        sz.kugel(x, y, -3, r * 0.95, "stein", (104, 100, 96), rz=0.015)
        n = max(10, int(r * 60))
        for k in range(n):
            a = 2 * math.pi * k / n
            sz.kugel(x + r * math.cos(a), y + r * math.sin(a), 0, r * 0.22, "stein", (164, 160, 152), rz=0.035)
    for _ in range(3):
        sz.kugel(z.uniform(-0.6, 0.6), z.uniform(-0.5, 0.5), 0, 0.05, "stein", (150, 146, 140), rz=0.04)
    return sz


def geroell(v, jz="sommer"):
    z = random.Random(400 + v)
    sz = szene()
    for _ in range(3 + v):
        sz.kugel(z.uniform(-0.3, 0.3), z.uniform(-0.25, 0.25), 0, z.uniform(0.06, 0.17), "stein", (136 + 6 * v, 132 + 6 * v, 126 + 6 * v), rz=z.uniform(5, 13) / 58.8)
    return sz


def eisbrocken(v, jz="sommer"):
    z = random.Random(500 + v)
    sz = szene()
    for _ in range(2 + v):
        sz.kugel(z.uniform(-0.25, 0.25), z.uniform(-0.2, 0.2), 0, z.uniform(0.08, 0.18), "glatt", (196, 222, 238), rz=z.uniform(8, 20) / 58.8)
    return sz


def baumgruppe(v, jz="sommer"):
    z = random.Random(600 + v)
    sz = szene()
    for k in range(2 + v):
        x, y = z.uniform(-0.35, 0.35), z.uniform(-0.3, 0.35)
        h = z.uniform(70, 120)
        if v == 2 or (v == 3 and k % 2 == 0):
            nadelbaum(sz, x, y, h * 1.1, z.uniform(0.16, 0.22), jz)
        else:
            farbe = (LAUB, (104, 150, 70), (98, 146, 66), (120, 156, 76))[k % 4]
            baum(sz, x, y, h, z.uniform(0.2, 0.3), stamm=0.045, farbe=farbe, jz=jz)
    return sz


def acker(v, jz="sommer"):
    z = random.Random(700 + v)
    sz = szene()
    boden = {"winter": (236, 240, 244), "herbst": (128, 92, 60)}.get(jz, ERDE)
    lang, breit = (0.9, 0.6) if v == 2 else (0.7, 0.75)
    sz.quader(-lang, lang, -breit, breit, 0, 2, "erde", boden)
    # v2: quer laufende Reihen, v3: zwei Kulturen nebeneinander
    reihen = 7 if v == 2 else 6
    for k in range(reihen):
        t = -breit + 0.1 + k * (2 * breit - 0.2) / (reihen - 1)
        a, b = ((-lang + 0.05, t), (lang - 0.05, t)) if v == 3 else ((t * lang / breit, -breit + 0.05), (t * lang / breit, breit - 0.05))
        if jz == "herbst":
            sz.balken((a[0], a[1], 3), (b[0], b[1], 3), 0.06, 0.04, "erde", (104, 74, 48))
        elif jz == "winter":
            sz.balken((a[0], a[1], 3), (b[0], b[1], 3), 0.07, 0.03, "glatt", SCHNEE)
        else:
            frucht = (222, 184, 86) if (v == 2 or k < reihen // 2) else (120, 170, 70)
            farbe = (132, 186, 84) if jz == "fruehling" else frucht
            hoch = 5 if jz == "fruehling" else z.uniform(7, 12)
            sz.balken((a[0], a[1], 2), (b[0], b[1], 2 + hoch), 0.11, 0.02, "laub", farbe, quer=(0, 0, 1))
    return sz


def beet(v, jz="sommer"):
    z = random.Random(800 + v)
    sz = szene()
    if v == 2:
        # rundes Beet
        sz.zylinder(0, 0, 0.62, 0, 6, "stein", SOCKEL, n=32)
        sz.zylinder(0, 0, 0.55, 6, 8, "erde", (236, 240, 244) if jz == "winter" else ERDE, n=32)
        plaetze = [(0.42 * math.cos(2 * math.pi * k / 10), 0.42 * math.sin(2 * math.pi * k / 10)) for k in range(10)] + [(0, 0), (0.18, 0.1), (-0.15, -0.12)]
    else:
        sz.quader(-0.5, 0.5, -0.8, 0.8, 0, 6, "stein", SOCKEL)
        sz.quader(-0.43, 0.43, -0.73, 0.73, 6, 8, "erde", (236, 240, 244) if jz == "winter" else ERDE)
        plaetze = [(-0.25 + i * 0.25, -0.6 + j * 0.24) for i in range(3) for j in range(6)]
    if jz == "winter":
        return sz
    farben = {"fruehling": ((250, 214, 92), (236, 96, 112), (186, 140, 220)), "herbst": ((214, 120, 52), (156, 90, 170), (226, 172, 64))}.get(jz, BLUETE)
    for i, (x, y) in enumerate(plaetze):
        sz.kugel(x, y, 13, 0.07, "laub", frueh(LAUB) if jz == "fruehling" else LAUB, rz=0.06)
        sz.kugel(x + 0.02, y + 0.02, 18, 0.045, "glatt", farben[z.randrange(len(farben))])
    return sz


def seegras(v, jz="sommer"):
    z = random.Random(900 + v)
    sz = szene()
    sz.kugel(0, 0, 0, 0.85, "sand", (196, 182, 140), rz=0.02)
    for i in range(14 + 6 * v):
        x, y = z.uniform(-0.65, 0.65), z.uniform(-0.55, 0.55)
        if x * x / 0.42 + y * y / 0.3 > 1:
            continue
        h = z.uniform(18, 46)
        n = z.uniform(-0.08, 0.08)
        farbe = ((64, 140, 84), (92, 160, 92), (120, 150, 70))[i % 3 if v == 3 else i % 2]
        sz.balken((x, y, 0), (x + n, y - n, h), 0.03, 0.012, "laub", farbe, quer=(0.7071, -0.7071, 0))
    return sz


def sandrippel(v, jz="sommer"):
    z = random.Random(950 + v)
    sz = szene()
    sz.kugel(0, 0, 0, 0.9, "sand", (206, 190, 146), rz=0.02)
    winkel = z.uniform(-0.6, 0.6)
    for k in range(4 + v):
        y = -0.5 + k * (1.0 / (3 + v))
        dx, dy = math.cos(winkel) * 0.5, math.sin(winkel) * 0.5
        sz.balken((-dx, y - dy, 1), (dx, y + dy, 1), 0.05, 0.02, "sand", (226, 212, 172))
    for _ in range(v):
        sz.kugel(z.uniform(-0.4, 0.4), z.uniform(-0.3, 0.3), 2, 0.05, "glatt", (236, 226, 214), rz=0.02)
    return sz


# Je Thema: Name → (Modell, Breite in Feldern, je Jahreszeit?)
VARIANTEN = {
    "bastion": {"sandbank": (sandbank, 2, False), "riff": (riff, 2, False)},
    "dorf": {"acker": (acker, 2, True), "baumgruppe": (baumgruppe, 1, True)},
    "garten": {"beet": (beet, 2, True), "baumgruppe": (baumgruppe, 1, True)},
    "unterwasser": {"seegras": (seegras, 2, False), "sandrippel": (sandrippel, 2, False)},
    "weltraum": {"kraterfeld": (kraterfeld, 2, False), "geroell": (geroell, 1, False), "eisbrocken": (eisbrocken, 1, False)},
}
ANZAHL = 3  # Varianten je Ding (1 = Bild aus G14)


def job(a):
    thema, name, v, jz = a
    fn, felder, _ = VARIANTEN[thema][name]
    tag, _ = rendern(fn(v, jz), 160 * felder, felder, schatten_r=0.0)
    datei = f"{name}_{v}.png" if jz == "sommer" else f"{name}_{v}_{jz}.png"
    palette(tag, ZIEL / thema / "dinge" / datei)
    return (thema, datei, tag.size)


def main() -> int:
    jobs = []
    for t, d in VARIANTEN.items():
        for n, (_, _, je) in d.items():
            for v in range(2, ANZAHL + 1):
                jobs.append((t, n, v, "sommer"))
                if je:
                    jobs += [(t, n, v, jz) for jz in JZ]
    with Pool(4) as pool:
        for thema, datei, groesse in pool.imap_unordered(job, jobs):
            print(thema, datei, groesse)
    shutil.rmtree(Path(__file__).resolve().parent / "__pycache__", ignore_errors=True)
    print(len(jobs), "Bilder geschrieben")
    return 0


if __name__ == "__main__":
    sys.exit(main())
