#!/usr/bin/env python3
"""Kulisse hinter dem Bauplatz (GRAFIK.md §12, Wunsch PV 02.11.2026).

Statt einer leeren Himmelsfläche: nahtlose Bänder, die die App in jedem
Seitenverhältnis nebeneinanderlegt (waagrecht wiederholt):

  horizont.png  ferne Hügel und Waldsaum, unten in Meerfarbe auslaufend
  meer.png      Kachel mit Wellenstrichen (waagrecht und senkrecht wiederholbar)
  sterne.png    Sternkachel, nur für die Nacht

Je Stimmung tag / daemmerung / nacht ein Satz. Der Himmel selbst ist ein
Verlauf im Code (`kulisse.ts`), damit er jede Höhe füllt. Gleiche Eingabe,
gleiches Bild: Abwechslung nur aus festen Zahlen, kein Zufall.
Aufruf: python3 tools/grafik/sprites-g3-kulisse.py
Ausgabe: public/grafik/atlas/kulisse/<thema>/<stimmung>/*.png (doppelte Größe)
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

sys.dont_write_bytecode = True
WURZEL = Path(__file__).resolve().parents[2]
ZIEL = WURZEL / "public" / "grafik" / "atlas" / "kulisse"

B = 2048  # Breite eines Bandes (doppelte Größe, also 1024 CSS-Pixel)
H_HORIZONT = 288
MEER = (256, 128)


def welle(x: float, teile: tuple[tuple[int, float, float], ...]) -> float:
    """Summe von Sinuswellen mit ganzzahligen Perioden über B – dadurch nahtlos."""
    return sum(a * math.sin(2 * math.pi * (n * x / B) + p) for n, a, p in teile)


def mischen(a, b, t: float):
    return tuple(round(x + (y - x) * t) for x, y in zip(a, b))


STIMMUNGEN = {
    "tag": dict(
        fern=(150, 186, 156), mitte=(112, 160, 104), wald=(70, 122, 72), meer=(62, 143, 176),
        welle=(140, 200, 220), dunst=(214, 236, 243), licht=None,
    ),
    "daemmerung": dict(
        fern=(150, 130, 150), mitte=(104, 104, 120), wald=(64, 70, 84), meer=(70, 92, 130),
        welle=(230, 170, 130), dunst=(242, 190, 150), licht=(255, 200, 90),
    ),
    "nacht": dict(
        fern=(48, 62, 88), mitte=(34, 48, 68), wald=(22, 32, 46), meer=(20, 40, 58),
        welle=(70, 100, 130), dunst=(46, 62, 94), licht=(255, 200, 90),
    ),
}


def horizont(s: dict) -> Image.Image:
    gross = Image.new("RGBA", (B * S, H_HORIZONT * S), (0, 0, 0, 0))
    d = Zeichner(gross, S)  # vierfach zeichnen (§12.12)
    grund = 236  # hier beginnt das Meer
    # ferne Hügel, im Dunst
    pts = [(x, 128 + welle(x, ((3, 26, 0.4), (7, 13, 1.9), (17, 5, 0.2)))) for x in range(0, B + 1, 4)]
    d.polygon(pts + [(B, grund), (0, grund)], fill=s["fern"])
    # nähere Hügel
    pts = [(x, 170 + welle(x, ((5, 22, 2.2), (11, 9, 0.7), (23, 4, 1.1)))) for x in range(0, B + 1, 4)]
    d.polygon(pts + [(B, grund), (0, grund)], fill=s["mitte"])
    # Waldsaum: runde Kronen in festen Abständen (Periode teilt B)
    for k in range(128):
        x = k * B / 128 + (k * 37 % 11) - 5
        y = 206 + welle(x, ((3, 6, 2.2), (7, 3, 0.7)))
        r = 9 + (k * 13 % 7)
        for dx in (-B, 0, B):  # über den Rand hinaus, damit die Naht nicht schneidet
            d.ellipse([x + dx - r, y - r, x + dx + r, y + r + 18], fill=s["wald"])
    # zwei ferne Hof-Lichter bei Dämmerung und Nacht (fest, kein Funkeln)
    if s["licht"]:
        for x in (212, 701, 1390):
            y = 176 + welle(x, ((5, 22, 2.2), (11, 9, 0.7), (23, 4, 1.1)))
            d.rectangle([x - 2, y + 6, x + 2, y + 10], fill=s["licht"])
    # Ufer: das Meer beginnt
    d.rectangle([0, grund, B, H_HORIZONT], fill=s["meer"])
    # nahtlos verkleinern: dreifach nebeneinander, die Mitte bleibt
    dreifach = Image.new("RGBA", (3 * gross.width, gross.height))
    for k in range(3):
        dreifach.paste(gross, (k * gross.width, 0))
    bild = dreifach.resize((3 * B, H_HORIZONT), Image.LANCZOS).crop((B, 0, 2 * B, H_HORIZONT))
    # Dunst-Saum über der Wasserlinie
    dunst = Image.new("RGBA", bild.size, (0, 0, 0, 0))
    dd = ImageDraw.Draw(dunst)
    dd.rectangle([0, grund - 10, B, grund + 4], fill=(*s["dunst"], 90))
    dunst = dunst.filter(ImageFilter.GaussianBlur(6))
    bild.alpha_composite(dunst)
    return bild


def meer(s: dict) -> Image.Image:
    w, h = MEER
    bild = Image.new("RGBA", (w, h), (*s["meer"], 255))
    d = ImageDraw.Draw(bild)
    # Wellenstriche an festen Stellen, je Reihe versetzt; Wiederholung nahtlos
    for r, y in enumerate(range(8, h, 20)):
        for k in range(3):
            x0 = (k * w / 3 + r * 37) % w
            laenge = 22 + (r * 7 + k * 5) % 16
            for dx in (-w, 0, w):
                d.line([(x0 + dx, y), (x0 + dx + laenge, y)], fill=(*s["welle"], 150), width=2)
    return bild


def sterne() -> Image.Image:
    w = h = 512
    bild = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(bild)
    for k in range(70):
        x = (k * 173) % w
        y = (k * 97 + k * k * 3) % h
        r = 1 + (k % 5 == 0)
        a = 150 + (k * 29) % 100
        d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 246, 220, a))
    return bild


# —— Dinge im Meer (gleiche Grundkörper wie die Gebäude, g3_stil) ————————————

sys.path.insert(0, str(Path(__file__).resolve().parent))
from g3_stil import GRAU, HOLZ, HOLZ_FUGE, KONTUR, S, SOCKEL, STEIN, Iso, Zeichner, erzeuge_mit, hell, krone, speichere_palette  # noqa: E402

GISCHT = (236, 246, 248, 200)
SAND = (214, 196, 150)


def gischt(iso: Iso, r: float) -> None:
    """Heller Schaumring auf dem Wasser um einen Fuß (Ellipse in der Ebene z = 0)."""
    cx, cy = iso.p(0, 0, 0)
    rx, ry = r * 48 * 1.414, r * 24 * 1.414
    iso.d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], outline=GISCHT, width=3)


def fels(iso: Iso, fenster: list, gross: float) -> None:
    gischt(iso, 0.55 * gross)
    p = iso.p
    for (x, y, h, r) in ((-0.15, 0.05, 30, 0.32), (0.18, -0.1, 18, 0.22), (0.05, 0.25, 12, 0.18)):
        cx, cy = p(x * gross, y * gross, 0)
        rx = r * gross * 68
        iso.poly([(cx - rx, cy), (cx - rx * 0.5, cy - h * gross), (cx + rx * 0.2, cy - h * gross * 1.1), (cx + rx, cy)], hell(STEIN, -26), KONTUR)
        iso.poly([(cx + rx * 0.2, cy - h * gross * 1.1), (cx + rx, cy), (cx + rx * 0.1, cy + 4)], hell(STEIN, 8), KONTUR)


def fels_1(iso, fenster):
    fels(iso, fenster, 1.0)


def fels_2(iso, fenster):
    fels(iso, fenster, 0.7)


def inselchen(iso: Iso, fenster: list) -> None:
    """Kleine Sandinsel mit Felsen und einem Baum."""
    gischt(iso, 0.75)
    p = iso.p
    cx, cy = p(0, 0, 0)
    iso.d.ellipse([cx - 64, cy - 28, cx + 64, cy + 30], fill=hell(SAND, -18), outline=KONTUR)
    iso.d.ellipse([cx - 58, cy - 30, cx + 58, cy + 22], fill=SAND)
    iso.d.ellipse([cx - 40, cy - 26, cx + 40, cy + 10], fill=(110, 156, 88))
    iso.quader(-0.04, 0.04, -0.04, 0.04, 0, 46, HOLZ, links=-40, rechts=-8)
    tx, ty = p(0, 0, 66)
    krone(iso, tx, ty, 22)
    fx, fy = p(0.35, 0.2, 0)
    iso.poly([(fx - 12, fy), (fx - 4, fy - 14), (fx + 10, fy)], hell(GRAU, -20), KONTUR)


def boot(iso: Iso, fenster: list) -> None:
    """Segelboot von der Seite: Holzrumpf, weißes Segel, kleiner Wimpel (keine Akzentfarbe)."""
    p = iso.p
    cx, cy = p(0, 0, 0)
    iso.d.ellipse([cx - 40, cy - 6, cx + 40, cy + 10], outline=GISCHT, width=2)
    rumpf = [(cx - 34, cy - 10), (cx + 38, cy - 10), (cx + 24, cy + 4), (cx - 26, cy + 4)]
    iso.poly(rumpf, HOLZ, KONTUR)
    iso.linie((cx - 30, cy - 4), (cx + 30, cy - 4), HOLZ_FUGE, 2)
    iso.linie((cx, cy - 10), (cx, cy - 82), hell(HOLZ, -30), 3)
    iso.poly([(cx + 3, cy - 80), (cx + 3, cy - 16), (cx + 40, cy - 16)], (244, 239, 228), KONTUR)
    iso.poly([(cx - 3, cy - 70), (cx - 3, cy - 18), (cx - 28, cy - 18)], (232, 226, 212), KONTUR)
    iso.poly([(cx, cy - 82), (cx + 14, cy - 78), (cx, cy - 74)], SOCKEL, KONTUR)


DINGE = {"fels_1": fels_1, "fels_2": fels_2, "inselchen": inselchen, "boot": boot}


def main() -> int:
    thema = "bastion"
    for name, s in STIMMUNGEN.items():
        ordner = ZIEL / thema / name
        ordner.mkdir(parents=True, exist_ok=True)
        horizont(s).save(ordner / "horizont.png", optimize=True)
        meer(s).save(ordner / "meer.png", optimize=True)
        print(thema, name)
    sterne().save(ZIEL / thema / "nacht" / "sterne.png", optimize=True)
    (ZIEL / thema / "dinge").mkdir(parents=True, exist_ok=True)
    for name, zeichne in DINGE.items():
        bild, _ = erzeuge_mit(zeichne, 1, 160)
        speichere_palette(bild, ZIEL / thema / "dinge" / f"{name}.png")
        print(name, bild.size)
    return 0


if __name__ == "__main__":
    sys.exit(main())
