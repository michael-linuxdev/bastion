#!/usr/bin/env python3
"""Probestück (b) für Paket G0.1: Bergfried Bastion, Epoche 1, Stufen 1–3,
zusammengesetzt aus dem CC0-Bausatz „Castle Kit 1.0“ von Kenney (www.kenney.nl).

Nur Probe: schreibt in einen Ordner außerhalb des Repositorys, nicht in den Atlas.
Aufruf: python3 tools/grafik/probe/bergfried-b-kenney.py <castle-kit-1.0/Isometric> <ausgabe>
Quelle des Bausatzes: Spiegel https://github.com/ETdoFresh/kenney.nl (Lizenz CC0, License.txt liegt bei).
"""
from __future__ import annotations

import colorsys
import sys
from pathlib import Path

from PIL import Image

STAPEL = 77  # Pixel je Turmblock im Bausatz
# Bausatz rendert mit Rautenverhältnis ≈ 1,46 : 1; die App nutzt 2 : 1 → x relativ strecken
SKAL_X, SKAL_Y = 1.10, 0.80
BREITE = 296  # wie heutige 3×3-Sprites (GRAFIK-SPRITES §2)
DACH_FARBTON = 15 / 360  # warmes Ziegelrot statt Blau (Richtung A)


def lade(ordner: Path, name: str) -> Image.Image:
    return Image.open(ordner / f"{name}_SE.png").convert("RGBA")


def umfaerben(bild: Image.Image) -> Image.Image:
    """Blaue Flächen (Dächer, Fahnen) auf warmes Ziegelrot drehen, Helligkeit bleibt."""
    px = bild.load()
    for y in range(bild.height):
        for x in range(bild.width):
            r, g, b, a = px[x, y]
            if a == 0 or b < r + 25:
                continue
            h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
            r2, g2, b2 = colorsys.hls_to_rgb(DACH_FARBTON, min(1, l * 1.05), min(1, s * 0.9))
            px[x, y] = (round(r2 * 255), round(g2 * 255), round(b2 * 255), a)
    return bild


def stapel(ordner: Path, teile: list[tuple[str, int, int, int]], hoehe: int = 700) -> Image.Image:
    """teile: (name, block, dx, dy) – block = Stockwerk ab 0, dx/dy Versatz in Bausatz-Pixeln."""
    flaeche = Image.new("RGBA", (420, hoehe), (0, 0, 0, 0))
    fuss = hoehe - 10
    for name, block, dx, dy in teile:
        t = lade(ordner, name)
        flaeche.alpha_composite(t, (210 - t.width // 2 + dx, fuss - t.height - block * STAPEL + dy))
    box = flaeche.getbbox()
    assert box
    # Waagrecht um die Mitte (x=210) symmetrisch zuschneiden, unten bündig
    halb = max(210 - box[0], box[2] - 210)
    flaeche = flaeche.crop((210 - halb, box[1], 210 + halb, fuss + 1))
    flaeche = flaeche.resize(
        (round(flaeche.width * SKAL_X), round(flaeche.height * SKAL_Y)), Image.Resampling.LANCZOS
    )
    if flaeche.width > BREITE:  # nie über die Breite des Fußabdrucks hinaus
        f = BREITE / flaeche.width
        flaeche = flaeche.resize((BREITE, round(flaeche.height * f)), Image.Resampling.LANCZOS)
    ziel = Image.new("RGBA", (BREITE, flaeche.height + 8), (0, 0, 0, 0))
    ziel.alpha_composite(flaeche, ((BREITE - flaeche.width) // 2, ziel.height - flaeche.height - 4))
    return umfaerben(ziel)


STUFEN = {
    # Stufe 1: gedrungener Turmstumpf mit flachem Dach – ein Anfang
    1: [("towerSquareBase", 0, 0, 0), ("towerSquareTopRoof", 1, 0, 0)],
    # Stufe 2: zwei Stockwerke mehr, offener Wehrgang aus Holz, hohes Dach, Fahne
    2: [
        ("towerSquareBase", 0, 0, 0),
        ("towerSquareMidWindows", 1, 0, 0),
        ("towerSquareMidOpen", 2, 0, 0),
        ("towerSquareTopRoofHigh", 3, 0, 0),
        ("flagBlue", 4, 4, -40),
    ],
    # Stufe 3: steinerner Bergfried mit Zinnen und Turmhelm, runder Seitenturm, Banner
    3: [
        ("towerSquareBase", 0, 0, 0),
        ("towerSquareMid", 1, 0, 0),
        ("towerSquareMidWindows", 2, 0, 0),
        ("towerSquareMidWindows", 3, 0, 0),
        ("towerSquareTopRoofHigh", 4, 0, 0),
        ("towerBase", 0, -72, 0),
        ("towerTopRoof", 1, -72, -20),
        ("flagBlue", 5, 4, -60),
    ],
}


def main() -> int:
    ordner, aus = Path(sys.argv[1]), Path(sys.argv[2])
    aus.mkdir(parents=True, exist_ok=True)
    for s, teile in STUFEN.items():
        stapel(ordner, teile).save(aus / f"kern_s{s}.png")
    return 0


if __name__ == "__main__":
    sys.exit(main())
