#!/usr/bin/env python3
"""G20: Mehr Formen für Sandbänke und Kraterfelder (offen aus der Sitzung 03.11.2026:
„Weniger gleichförmige Sandbänke“, „Gröbere Kraterfelder – wirken noch wie Punktringe“).

- Sandbänke 4–7: lang gestreckte Landzungen, Sicheln, kleine Inselketten, mit Prielen
  (nasse, dunklere Rinnen), Muscheln und Treibholz. Die Körper sind Ellipsoide mit eigener
  Länge und Breite statt runder Kugeln.
- Kraterfelder 1–7: Ränder als durchgehender, grober Wall (dicht überlappende, flache
  Ellipsoide), große Krater mit Zentralberg, helle Auswurfdecke außen. Die alten Bilder 1–3
  werden ersetzt, die Plätze in der App bleiben gleich.

Rechnet je Bild 1x und @2x (doppelte Größe, unten bündig wie G17). Formen aus einer festen
Zahlenfolge je Variante (`random.Random(Startwert)`), bei jedem Lauf gleich.

Aufruf: python3 tools/grafik/g20_flaechen.py   (etwa zwei Minuten)
"""
from __future__ import annotations

import math
import random
import shutil
import sys
from multiprocessing import Pool
from pathlib import Path

import numpy as np
from PIL import Image

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from raum import Koerper, Szene, _z, rendern  # noqa: E402

ZIEL = Path(__file__).resolve().parents[2] / "public" / "grafik" / "atlas" / "kulisse"
SAND = (222, 204, 160)
NASS = (190, 172, 132)
PRIEL = (150, 160, 150)
MUSCHEL = (238, 226, 214)
HOLZ = (128, 100, 72)
WALL = (164, 160, 152)
BODEN = (70, 68, 72)
AUSWURF = (138, 134, 130)


def ellipsoid(sz: Szene, cx, cy, z, rx, ry, rz, mat, farbe) -> None:
    """Wie `Szene.kugel`, aber mit eigener Länge (rx) und Breite (ry) in Feldern."""
    cz = _z(z)
    ecken = np.array([(cx - rx, cy - ry, cz - rz), (cx + rx, cy + ry, cz + rz)])
    sz.koerper.append(
        Koerper(None, mat, farbe, ecken, kugel=(cx, cy, cz, rx, ry, rz, -99.0), mitte=np.array([cx, cy, cz]), radius=max(rx, ry, rz) * 1.01)
    )


def szene() -> Szene:
    sz = Szene()
    sz.schatten_r = 0.0
    return sz


def sandbank(v: int) -> Szene:
    """Form je Variante: 4 Landzunge, 5 Sichel, 6 Inselkette, 7 breite Bank mit Priel."""
    z = random.Random(700 + v)
    sz = szene()
    teile: list[tuple] = []
    if v == 4:
        # lange, schmale Zunge schräg über das Feld, zur Spitze dünner
        for k in range(7):
            t = k / 6
            teile.append((-0.7 + 1.4 * t, 0.35 - 0.7 * t + 0.08 * math.sin(t * 5), 0.32 * (1 - 0.6 * t) + 0.08, 0.16 * (1 - 0.5 * t) + 0.06))
    elif v == 5:
        # Sichel um eine stille Lagune
        for k in range(8):
            a = math.pi * (0.15 + 0.7 * k / 7)
            teile.append((0.55 * math.cos(a) * 1.2, -0.1 + 0.5 * math.sin(a) - 0.25, 0.2, 0.14 + 0.06 * math.sin(a)))
    elif v == 6:
        # Kette aus drei bis vier kleinen Inselchen
        for k in range(4):
            teile.append((-0.6 + 0.4 * k + z.uniform(-0.05, 0.05), 0.3 - 0.2 * k + z.uniform(-0.06, 0.06), z.uniform(0.14, 0.24), z.uniform(0.1, 0.16)))
    else:
        # breite Bank mit Ausbuchtungen
        for _ in range(6):
            teile.append((z.uniform(-0.45, 0.45), z.uniform(-0.3, 0.3), z.uniform(0.25, 0.42), z.uniform(0.15, 0.28)))
    for x, y, rx, ry in teile:
        ellipsoid(sz, x, y, 0, rx + 0.12, ry + 0.1, 0.03, "sand", NASS)
    for x, y, rx, ry in teile:
        ellipsoid(sz, x, y, 1, rx, ry, 0.05, "sand", SAND)
    if v in (5, 7):
        # Priel: dunkle, nasse Rinne quer durch die Bank
        for k in range(5):
            ellipsoid(sz, -0.35 + 0.17 * k, 0.05 * math.sin(k), 2, 0.09, 0.035, 0.012, "glatt", PRIEL)
    for _ in range(3 + v % 3):
        x, y, _, _ = teile[z.randrange(len(teile))]
        sz.kugel(x + z.uniform(-0.1, 0.1), y + z.uniform(-0.06, 0.06), 3, 0.04, "glatt", MUSCHEL, rz=0.02)
    if v in (4, 7):
        # Treibholz
        x, y, _, _ = teile[len(teile) // 2]
        sz.balken((x - 0.14, y + 0.02, 4), (x + 0.12, y - 0.03, 4), 0.03, 0.03, "holz", HOLZ)
    return sz


def kraterfeld(v: int) -> Szene:
    """Grobe Krater: durchgehender Wall, große mit Zentralberg, helle Auswurfdecke."""
    z = random.Random(900 + v)
    sz = szene()
    anzahl = 2 + (v % 3)
    krater = []
    for k in range(anzahl):
        r = z.uniform(0.18, 0.38) if k == 0 else z.uniform(0.1, 0.24)
        krater.append((z.uniform(-0.5, 0.5), z.uniform(-0.38, 0.38), r))
    for x, y, r in krater:
        # Auswurfdecke: flacher, heller Hof um den Krater
        ellipsoid(sz, x, y, -1, r * 1.45, r * 1.4, 0.008, "stein", AUSWURF)
    for x, y, r in krater:
        ellipsoid(sz, x, y, 0, r * 0.92, r * 0.9, 0.012, "stein", BODEN)
        # Wall aus dicht überlappenden, flachen Stücken: wirkt geschlossen statt als Perlenkette
        n = max(14, int(r * 110))
        for i in range(n):
            a = 2 * math.pi * i / n
            dicke = r * (0.24 + 0.07 * math.sin(a * 3 + v))
            sz.kugel(x + r * math.cos(a), y + r * math.sin(a), 0, dicke, "stein", WALL, rz=0.05 + 0.015 * math.cos(a * 2 + v))
        if r > 0.26:
            # Zentralberg
            sz.kugel(x + 0.02, y, -1, r * 0.22, "stein", WALL, rz=0.05)
    for _ in range(4):
        sz.kugel(z.uniform(-0.65, 0.65), z.uniform(-0.5, 0.5), 0, z.uniform(0.04, 0.07), "stein", (150, 146, 140), rz=0.04)
    return sz


def speichern(bild: Image.Image, pfad: Path) -> None:
    pfad.parent.mkdir(parents=True, exist_ok=True)
    bild.quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG).save(pfad, "PNG", optimize=True)


def job(a):
    thema, name, v = a
    fn = sandbank if name == "sandbank" else kraterfeld
    felder = 2
    tag, _ = rendern(fn(v), 160 * felder, felder, schatten_r=0.0)
    datei = f"{name}.png" if v == 1 else f"{name}_{v}.png"
    ziel = ZIEL / thema / "dinge" / datei
    speichern(tag, ziel)
    gross, _ = rendern(fn(v), 320 * felder, felder, s=2, schatten_r=0.0, skala=2.0)
    w, h = tag.size
    neu = Image.new("RGBA", (2 * w, 2 * h), (0, 0, 0, 0))
    neu.paste(gross, ((2 * w - gross.width) // 2, 2 * h - gross.height), gross)
    speichern(neu, ziel.with_name(ziel.stem + "@2x.png"))
    return datei, tag.size


def main() -> int:
    jobs = [("bastion", "sandbank", v) for v in range(4, 8)]
    jobs += [("weltraum", "kraterfeld", v) for v in range(1, 8)]
    with Pool(4) as pool:
        for datei, groesse in pool.imap_unordered(job, jobs):
            print(datei, groesse, flush=True)
    shutil.rmtree(Path(__file__).resolve().parent / "__pycache__", ignore_errors=True)
    print(len(jobs), "Bilder geschrieben")
    return 0


if __name__ == "__main__":
    sys.exit(main())
