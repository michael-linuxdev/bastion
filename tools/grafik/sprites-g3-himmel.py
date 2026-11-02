#!/usr/bin/env python3
"""G3: Himmel, Wetter, Auflagen und Belagerung im Stil der Stil-Regel (GRAFIK-SPRITES.md §12.7).

Ersetzt die Bilder der alten Chargen P1 (`sprites-p1-wetter.py`) und P6
(`sprites-p6-belagerung.py`) unter denselben IDs, Pfaden und Bildgrößen; die App
liest die Größe aus `pixel` im Manifest, das sich dadurch nicht ändert.

- Himmel: Sonne (Scheibe mit weichem Hof, keine Strahlen), Mond (Sichel), zwei Wolken
  aus Kugeln mit flacher Unterseite, Licht von rechts oben, Kontur 70.
- Wetter: Regentropfen, Schneeflocke (weich, kein Glitzern), Nebelband.
- Auflagen: drei Herbstblätter; Schnee als **Verwehung am Fuß** der Vorderkanten
  (1×1, 2×2, 3×3). Die Gebäude haben seit G3 sehr verschiedene Dachformen und Höhen;
  eine feste Dachkappe säße mitten im Turm. Am Boden passt der Schnee zu jedem Gebäude.
- Belagerung: dunkle, weiche Wolkenbank und drei Rauchfahnen (grau, ruhig).

Intern vierfach gezeichnet und weich verkleinert. Kein Zufall: alle Lagen sind feste Zahlen.
Aufruf: python3 tools/grafik/sprites-g3-himmel.py
"""
from __future__ import annotations

import json
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

sys.dont_write_bytecode = True

WURZEL = Path(__file__).resolve().parents[2]
ATLAS = WURZEL / "public" / "grafik" / "atlas"
S = 4  # intern vierfach

KONTUR = (43, 38, 32, 70)  # §12.4: Himmel, Wetter, Auflagen
SONNE = (255, 200, 90)
SONNE_HELL = (255, 226, 154)
SONNE_TIEF = (238, 170, 70)
MOND = (232, 228, 216)
MOND_HELL = (246, 243, 234)
MOND_TIEF = (197, 192, 180)
WOLKE = (255, 255, 255)
WOLKE_MITTE = (240, 245, 248)
WOLKE_UNTEN = (224, 232, 238)
REGEN = (122, 160, 192)
SCHNEE = (244, 247, 251)
SCHNEE_SCHATTEN = (206, 220, 232)
LAUB = [((196, 96, 58), (150, 66, 36)), ((224, 122, 79), (176, 86, 50)), ((196, 154, 60), (146, 110, 36))]
DUNST = (74, 64, 70)
RAUCH = (136, 132, 128)
RAUCH_HELL = (178, 174, 168)


def hell(c, d):
    return tuple(max(0, min(255, v + d)) for v in c[:3])


class Blatt:
    """Zeichenfläche in vierfacher Größe."""

    def __init__(self, w: int, h: int) -> None:
        self.w, self.h = w, h
        self.bild = Image.new("RGBA", (w * S, h * S), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.bild, "RGBA")

    def kreis(self, x, y, r, farbe, kontur=None, breite=1.0) -> None:
        self.d.ellipse(
            [(x - r) * S, (y - r) * S, (x + r) * S, (y + r) * S],
            fill=farbe,
            outline=kontur,
            width=max(1, round(breite * S)) if kontur else 0,
        )

    def oval(self, x0, y0, x1, y1, farbe, kontur=None) -> None:
        self.d.ellipse([x0 * S, y0 * S, x1 * S, y1 * S], fill=farbe, outline=kontur, width=S if kontur else 0)

    def form(self, pts, farbe, kontur=None) -> None:
        self.d.polygon([(round(x * S), round(y * S)) for x, y in pts], fill=farbe, outline=kontur)

    def strich(self, a, b, farbe, breite=1.0) -> None:
        self.d.line([(a[0] * S, a[1] * S), (b[0] * S, b[1] * S)], fill=farbe, width=max(1, round(breite * S)))

    def weich(self, radius: float) -> None:
        self.bild = self.bild.filter(ImageFilter.GaussianBlur(radius * S))
        self.d = ImageDraw.Draw(self.bild, "RGBA")

    def fertig(self) -> Image.Image:
        return self.bild.resize((self.w, self.h), Image.LANCZOS)


# —— Himmel ——————————————————————————————————————————————————


def sonne() -> Image.Image:
    b = Blatt(96, 96)
    hof = Blatt(96, 96)
    hof.kreis(48, 48, 40, SONNE + (70,))
    hof.weich(5)
    b.bild.alpha_composite(hof.bild)
    b.kreis(48, 48, 27, SONNE_TIEF, KONTUR, 1.2)
    b.kreis(50, 46, 23, SONNE)  # mittlerer Ton nach rechts oben
    b.kreis(54, 42, 12, SONNE_HELL)  # Licht von rechts oben
    return b.fertig()


def mond() -> Image.Image:
    b = Blatt(72, 72)
    hof = Blatt(72, 72)
    hof.kreis(36, 36, 30, MOND + (46,))
    hof.weich(4)
    b.bild.alpha_composite(hof.bild)
    sichel = Blatt(72, 72)
    sichel.kreis(36, 36, 22, MOND_TIEF + (255,))
    sichel.kreis(39, 34, 19, MOND + (255,))
    sichel.kreis(41, 31, 9, MOND_HELL + (255,))
    for x, y, r in ((30, 42, 3.2), (40, 44, 2.2), (33, 30, 2.4)):  # Krater, feste Lagen
        sichel.kreis(x, y, r, MOND_TIEF + (255,))
    # Sichel: rechts oben ein Stück herausnehmen (durchsichtig)
    maske = Image.new("L", sichel.bild.size, 0)
    dm = ImageDraw.Draw(maske)
    dm.ellipse([(36 - 22) * S, (36 - 22) * S, (36 + 22) * S, (36 + 22) * S], fill=255)
    dm.ellipse([(48 - 19) * S, (26 - 19) * S, (48 + 19) * S, (26 + 19) * S], fill=0)
    sichel.bild.putalpha(Image.composite(sichel.bild.getchannel("A"), Image.new("L", maske.size, 0), maske))
    b.bild.alpha_composite(sichel.bild)
    # Kontur der Sichel
    kontur = maske.filter(ImageFilter.FIND_EDGES).point(lambda a: 70 if a > 40 else 0)
    rand = Image.new("RGBA", maske.size, KONTUR[:3] + (0,))
    rand.putalpha(kontur)
    b.bild.alpha_composite(rand)
    return b.fertig()


def wolke(w: int, h: int, kugeln) -> Image.Image:
    """Kugeln (x, y, r) auf flacher Unterseite: Umriss, dunkler Grund, Mitte, Licht."""
    b = Blatt(w, h)
    unten = h - 10
    for x, y, r in kugeln:  # Kontur: alle Teile etwas größer
        b.kreis(x, y, r + 1.2, KONTUR)
    b.form([(kugeln[0][0], unten - 10), (kugeln[-1][0], unten - 10), (kugeln[-1][0], unten + 1.2), (kugeln[0][0], unten + 1.2)], KONTUR)
    for x, y, r in kugeln:
        b.kreis(x, y, r, WOLKE_UNTEN + (255,))
    b.form([(kugeln[0][0], unten - 10), (kugeln[-1][0], unten - 10), (kugeln[-1][0], unten), (kugeln[0][0], unten)], WOLKE_UNTEN + (255,))
    for x, y, r in kugeln:  # Mitte nach rechts oben
        b.kreis(x + r * 0.12, y - r * 0.16, r * 0.8, WOLKE_MITTE + (255,))
    b.form([(kugeln[0][0], unten - 13), (kugeln[-1][0], unten - 13), (kugeln[-1][0], unten - 6), (kugeln[0][0], unten - 6)], WOLKE_MITTE + (255,))
    for x, y, r in kugeln:  # Licht
        b.kreis(x + r * 0.28, y - r * 0.32, r * 0.48, WOLKE + (255,))
    # flache Unterseite: unter `unten` wegschneiden
    alpha = b.bild.getchannel("A")
    ImageDraw.Draw(alpha).rectangle([0, (unten + 1.2) * S, w * S, h * S], fill=0)
    b.bild.putalpha(alpha)
    return b.fertig()


# —— Wetter ——————————————————————————————————————————————————


def regen_tropfen() -> Image.Image:
    b = Blatt(16, 28)
    b.strich((10.5, 3), (6.5, 20), REGEN + (150,), 2.2)
    b.form([(5, 19), (8.5, 15), (11, 21), (8, 25), (4.6, 23)], REGEN + (220,))
    b.kreis(8, 21.5, 2.6, REGEN + (230,))
    b.kreis(8.8, 20.6, 1.0, (210, 228, 240, 220))
    return b.fertig()


def schnee_flocke() -> Image.Image:
    b = Blatt(24, 24)
    b.kreis(12, 12, 7.5, SCHNEE_SCHATTEN + (120,))
    b.weich(1.2)
    b.kreis(12, 12, 5.6, SCHNEE + (255,), KONTUR, 0.8)
    b.kreis(13, 11, 3.0, (255, 255, 255, 255))
    return b.fertig()


def nebel() -> Image.Image:
    b = Blatt(160, 64)
    for x, y, rx, ry, a in ((44, 36, 40, 12, 120), (86, 30, 46, 14, 140), (122, 38, 34, 11, 110), (80, 42, 64, 9, 90)):
        b.oval(x - rx, y - ry, x + rx, y + ry, (226, 232, 238, a))
    b.weich(5)
    return b.fertig()


# —— Auflagen ——————————————————————————————————————————————————


def laub(n: int) -> Image.Image:
    """Drei Blattformen: Ahorn, Eiche, Linde (feste Formen), Mittelrippe, Kontur 70."""
    farbe, tief = LAUB[n - 1]
    b = Blatt(28, 28)
    if n == 1:  # Ahorn: fünf Spitzen
        pts = []
        for k in range(10):
            a = -math.pi / 2 + k * math.pi / 5 - 0.0
            r = 10 if k % 2 == 0 else 4.6
            pts.append((14 + r * math.cos(a), 14.5 + r * math.sin(a) * 0.95))
    elif n == 2:  # Eiche: gewellter Rand
        pts = []
        for k in range(24):
            a = 2 * math.pi * k / 24
            r = 1 + 0.16 * math.cos(6 * a)
            pts.append((14 + 6.2 * r * math.cos(a), 14 + 10 * r * math.sin(a)))
    else:  # Linde: Herzform
        pts = []
        for k in range(32):
            t = 2 * math.pi * k / 32
            x = 16 * math.sin(t) ** 3
            y = -(13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t))
            pts.append((14 + x * 0.6, 13 + y * 0.6))
    b.form(pts, farbe + (255,), KONTUR)
    # rechte Hälfte heller (Licht von rechts oben)
    licht = Blatt(28, 28)
    licht.form(pts, hell(farbe, 22) + (255,))
    maske = Image.new("L", licht.bild.size, 0)
    ImageDraw.Draw(maske).polygon([(14 * S, 0), (28 * S, 0), (28 * S, 28 * S), (14 * S, 28 * S)], fill=255)
    licht.bild.putalpha(Image.composite(licht.bild.getchannel("A"), Image.new("L", maske.size, 0), maske))
    b.bild.alpha_composite(licht.bild)
    b.strich((14, 5.5), (14, 24.5), tief + (230,), 1.0)  # Mittelrippe mit Stiel
    return b.fertig()


def schnee_verwehung(n: int, w: int, h: int) -> Image.Image:
    """Schneeverwehung an den beiden Vorderkanten des n×n-Fußabdrucks.

    Raute in doppelter Größe: 48 × 24 je Feld (halb), unterste Ecke unten Mitte des Bildes
    (Anker 0,5 / 1,0 wie das Gebäude). Ein durchgehender Wall aus eng liegenden Kugeln,
    dicker zur vorderen Ecke hin; links dunkler (Licht von rechts oben). Feste Zahlen."""
    b = Blatt(w, h)
    cx, fuss = w / 2, h - 3
    links = (cx - n * 48 - 2, fuss - n * 24 - 1)
    rechts = (cx + n * 48 + 2, fuss - n * 24 - 1)
    unten = (cx, fuss)
    huegel = []
    k_max = 9 * n
    for seite, (a, z) in (("l", (links, unten)), ("r", (unten, rechts))):
        for k in range(k_max + 1):
            t = k / k_max
            x = a[0] + (z[0] - a[0]) * t
            y = a[1] + (z[1] - a[1]) * t
            naehe = t if seite == "l" else 1 - t  # 1 an der vorderen Ecke
            welle = (0.0, 1.2, 0.4, 1.8, 0.8)[k % 5]
            dicke = 6.0 + 4.5 * naehe + welle
            huegel.append((seite, x, y - dicke * 0.45, dicke))
    for _, x, y, r in huegel:  # Kontur
        b.oval(x - r - 1, y - r * 0.72 - 1, x + r + 1, y + r * 0.72 + 1, KONTUR)
    for seite, x, y, r in huegel:
        b.oval(x - r, y - r * 0.72, x + r, y + r * 0.72, (SCHNEE_SCHATTEN if seite == "l" else hell(SCHNEE_SCHATTEN, 14)) + (255,))
    for seite, x, y, r in huegel:
        rr = r * 0.78
        b.oval(x + r * 0.15 - rr, y - r * 0.2 - rr * 0.62, x + r * 0.15 + rr, y - r * 0.2 + rr * 0.62, (hell(SCHNEE, -8) if seite == "l" else SCHNEE) + (255,))
    for seite, x, y, r in huegel[2::5]:  # Licht nur auf einzelnen Kuppen
        rr = r * 0.32
        b.oval(x + r * 0.3 - rr, y - r * 0.38 - rr * 0.6, x + r * 0.3 + rr, y - r * 0.38 + rr * 0.6, (255, 255, 255, 255))
    return b.fertig()


# —— Belagerung ——————————————————————————————————————————————————


def belagerung_himmel() -> Image.Image:
    b = Blatt(320, 200)
    for x, y, rx, ry, a in (
        (90, 92, 80, 46, 120),
        (170, 78, 96, 52, 140),
        (250, 96, 70, 42, 120),
        (160, 118, 130, 34, 90),
    ):
        b.oval(x - rx, y - ry, x + rx, y + ry, DUNST + (a,))
    for x, y, rx, ry in ((120, 70, 44, 20), (210, 66, 40, 18)):  # hellere Kanten oben rechts
        b.oval(x - rx, y - ry, x + rx, y + ry, hell(DUNST, 24) + (60,))
    b.weich(14)
    return b.fertig()


def rauch(w: int, h: int, teile) -> Image.Image:
    b = Blatt(w, h)
    for x, y, r, a in teile:
        b.kreis(x, y, r * 1.3, RAUCH + (a,))
    for x, y, r, a in teile:
        b.kreis(x + r * 0.3, y - r * 0.35, r * 0.75, RAUCH_HELL + (a,))
    b.weich(4.0)
    return b.fertig()


# —— Schreiben ——————————————————————————————————————————————————

BILDER = {
    "himmel/sonne": sonne,
    "himmel/mond": mond,
    "himmel/wolke_1": lambda: wolke(168, 72, [(38, 46, 18), (72, 34, 24), (108, 38, 22), (136, 48, 16)]),
    "himmel/wolke_2": lambda: wolke(200, 80, [(40, 54, 18), (74, 40, 25), (112, 32, 28), (150, 44, 22), (176, 56, 14)]),
    "wetter/regen_tropfen": regen_tropfen,
    "wetter/schnee_flocke": schnee_flocke,
    "wetter/nebel": nebel,
    "auflage/laub_1": lambda: laub(1),
    "auflage/laub_2": lambda: laub(2),
    "auflage/laub_3": lambda: laub(3),
    "auflage/schnee_dach_1x1": lambda: schnee_verwehung(1, 112, 84),
    "auflage/schnee_dach_2x2": lambda: schnee_verwehung(2, 208, 138),
    "auflage/schnee_dach_3x3": lambda: schnee_verwehung(3, 304, 192),
    "belagerung/himmel": belagerung_himmel,
    "belagerung/rauch_1": lambda: rauch(120, 56, [(26, 40, 12, 150), (46, 32, 15, 140), (70, 26, 14, 120), (92, 20, 11, 100), (108, 16, 7, 80)]),
    "belagerung/rauch_2": lambda: rauch(100, 48, [(22, 34, 11, 150), (42, 27, 13, 135), (63, 22, 11, 115), (82, 17, 8, 90)]),
    "belagerung/rauch_3": lambda: rauch(88, 44, [(20, 31, 10, 150), (38, 25, 11, 130), (56, 20, 9, 110), (72, 16, 6, 85)]),
}


def main() -> int:
    manifest_pfad = ATLAS / "manifest.json"
    manifest = json.loads(manifest_pfad.read_text(encoding="utf-8"))
    nach_id = {e["id"]: e for e in manifest["eintraege"]}
    for id_, zeichne in BILDER.items():
        e = nach_id[id_]  # gleiche ID, gleicher Pfad, gleiche Größe
        bild = zeichne()
        assert (bild.width, bild.height) == (e["pixel"]["w"], e["pixel"]["h"]), id_
        bild.save(ATLAS / e["datei"], "PNG", optimize=True)
        print(id_, e["pixel"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
