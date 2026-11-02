"""Gemeinsames Modul des G3-Generators (GRAFIK-SPRITES.md §12.1).

Raster, Licht, Kontur, Palette und Grundkörper für alle Themen, dazu das
Zeichnen von Wesen (64 × 64, vierfach gezeichnet) und das Schreiben in den
Atlas. Jedes Thema hat ein eigenes Skript (`sprites-g3-<thema>.py`), das nur
seine Formen und seine Materialleiter beschreibt. Gleiche Eingabe ergibt das
gleiche Bild (kein Zufall).

Qualität (GRAFIK-SPRITES.md §12.12): Gebäude und Umgebung werden intern
vierfach gezeichnet (`S`) und weich verkleinert, wie die Wesen. Die Skripte
rechnen weiter in einfachen Bildpunkten; `Zeichner` vergrößert jede Form.
Materialien (Steintöne, Maserung, Dachreihen, Fenstersprossen, Beschläge) und
weiche Eigenschatten kommen aus festen Zahlenfolgen, nicht aus dem Zufall.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HW, HH = 48, 24  # halbe Rautenbreite/-höhe je Feld (2×)
BREITE, ROH_H = 296, 1000  # Höhe nur Arbeitsfläche, oben wird beschnitten

KONTUR = (43, 38, 32, 120)
STEIN = (176, 164, 146)
STEIN_FUGE = (120, 108, 94)
SOCKEL = (150, 138, 122)
HOLZ = (150, 104, 64)
HOLZ_FUGE = (104, 70, 42)
PUTZ = (236, 226, 204)
BALKEN = (92, 62, 40)
SCHINDEL = (112, 82, 58)
ZIEGEL = (196, 96, 58)
PETROL = (31, 122, 114)
PETROL_HELL = (61, 190, 165)
FENSTER_TAG = (58, 42, 22)
FENSTER_ABEND = (255, 200, 90)


S = 4  # intern vierfach zeichnen (Gebäude, Umgebung, Kulisse-Dinge), dann weich verkleinern
TUER = (70, 46, 28)
BESCHLAG = (54, 50, 48)
SPROSSE = (150, 122, 88)
SIMS = (214, 204, 186)


def hell(c: tuple[int, int, int], d: int) -> tuple[int, int, int]:
    return tuple(max(0, min(255, v + d)) for v in c)  # type: ignore[return-value]


def zahl(*k: int) -> int:
    """Feste Zahl 0–999 aus ganzen Zahlen (für Steintöne, Astlöcher); kein Zufall."""
    x = 2166136261
    for v in k:
        x = ((x ^ (v & 0xFFFFFFFF)) * 16777619) & 0xFFFFFFFF
    x ^= x >> 13
    x = (x * 1274126177) & 0xFFFFFFFF
    return (x >> 8) % 1000


class Zeichner:
    """ImageDraw mit Maßstab: die Skripte geben Bildpunkte der fertigen Größe an,
    gezeichnet wird `s`-fach. Linienbreiten wachsen mit (1 Pixel bleibt 1 Pixel)."""

    def __init__(self, bild: Image.Image, s: int = 1, mischen: bool = False) -> None:
        self._d = ImageDraw.Draw(bild)
        self._image = bild
        self.s = s
        self.mischen = mischen  # halbdurchsichtige Farben über das Bild legen statt Pixel ersetzen

    def _gemischt(self, art: str, xy, *args, **kw) -> None:
        """Zeichnet auf eine kleine leere Ebene und legt sie über das Bild (ImageDraw
        ersetzt bei RGBA-Bildern sonst die Pixel samt Deckkraft)."""
        pts = xy if xy and not isinstance(xy[0], (int, float)) else list(zip(xy[::2], xy[1::2]))
        rand = (kw.get("width") or 1) + 4
        x0 = max(0, int(min(a for a, _ in pts) - rand))
        y0 = max(0, int(min(b for _, b in pts) - rand))
        x1 = min(self._image.width, int(max(a for a, _ in pts) + rand) + 1)
        y1 = min(self._image.height, int(max(b for _, b in pts) + rand) + 1)
        if x1 <= x0 or y1 <= y0:
            return
        ebene = Image.new("RGBA", (x1 - x0, y1 - y0), (0, 0, 0, 0))
        verschoben = [(a - x0, b - y0) for a, b in pts]
        if art in ("ellipse", "rectangle", "arc", "chord", "pieslice"):
            verschoben = [verschoben[0][0], verschoben[0][1], verschoben[1][0], verschoben[1][1]]
        getattr(ImageDraw.Draw(ebene), art)(verschoben, *args, **kw)
        self._image.alpha_composite(ebene, (x0, y0))

    def _zeichne(self, art: str, xy, *args, **kw) -> None:
        if self.mischen:
            self._gemischt(art, xy, *args, **kw)
            return
        if self.s == 1:
            getattr(self._d, art)(xy, *args, **kw)
            return
        # Konturen und Linien mit Deckkraft < 255 dunkeln ab, statt Löcher zu stanzen
        rand = kw.get("outline")
        if art in ("line", "arc"):
            rand, kw = kw.get("fill"), dict(kw)
        if rand is not None and len(rand) == 4 and rand[3] < 255:
            if art in ("line", "arc"):
                self._gemischt(art, xy, *args, **kw)
                return
            ohne = dict(kw, outline=None, width=0)
            if kw.get("fill") is not None:
                getattr(self._d, art)(xy, *args, **ohne)
            self._gemischt(art, xy, *args, **dict(kw, fill=None))
            return
        getattr(self._d, art)(xy, *args, **kw)

    def _xy(self, xy):
        s = self.s
        if xy and isinstance(xy[0], (int, float)):
            return [v * s for v in xy]
        return [(a * s, b * s) for a, b in xy]

    def _w(self, width) -> int:
        return max(1, round(width * self.s)) if width else 0

    def polygon(self, xy, fill=None, outline=None, width=1) -> None:
        self._zeichne("polygon", self._xy(xy), fill=fill, outline=outline, width=self._w(width) if outline else 0)

    def line(self, xy, fill=None, width=1, joint=None) -> None:
        self._zeichne("line", self._xy(xy), fill=fill, width=self._w(width), joint=joint)

    def ellipse(self, xy, fill=None, outline=None, width=1) -> None:
        self._zeichne("ellipse", self._xy(xy), fill=fill, outline=outline, width=self._w(width) if outline else 0)

    def rectangle(self, xy, fill=None, outline=None, width=1) -> None:
        self._zeichne("rectangle", self._xy(xy), fill=fill, outline=outline, width=self._w(width) if outline else 0)

    def arc(self, xy, start, end, fill=None, width=1) -> None:
        self._zeichne("arc", self._xy(xy), start, end, fill=fill, width=self._w(width))

    def chord(self, xy, start, end, fill=None, outline=None, width=1) -> None:
        self._zeichne("chord", self._xy(xy), start, end, fill=fill, outline=outline, width=self._w(width) if outline else 0)

    def pieslice(self, xy, start, end, fill=None, outline=None, width=1) -> None:
        self._zeichne("pieslice", self._xy(xy), start, end, fill=fill, outline=outline, width=self._w(width) if outline else 0)


class Iso:
    def __init__(self, bild: Image.Image, n: int = 3, s: int = 1) -> None:
        self.bild = bild
        self.s = s
        self.d = Zeichner(bild, s)
        self.mix = Zeichner(bild, s, mischen=True)  # mischt halbdurchsichtige Farben
        self.cx = bild.width / s / 2
        self.cy0 = bild.height / s - 4 - n * HH  # Mitte des n×n-Fußabdrucks
        self.sprossen: dict[int, list] = {}  # Fenster → Sprossen (auch auf der Abend-Ebene)

    def p(self, x: float, y: float, z: float) -> tuple[float, float]:
        return (self.cx + (x - y) * HW, self.cy0 + (x + y) * HH - z)

    def poly(self, pts, farbe, kontur=None) -> None:
        if self.s == 1:
            pts = [(round(a), round(b)) for a, b in pts]
        self.d.polygon(pts, fill=farbe, outline=kontur)

    def linie(self, a, b, farbe, w: float = 1) -> None:
        if self.s == 1:
            a, b = tuple(map(round, a)), tuple(map(round, b))
        self.d.line([a, b], fill=farbe, width=w)

    def abdunkeln(self, pts, staerke: float, weich: float = 3.0) -> None:
        """Weicher Eigenschatten: dunkelt schon Gezeichnetes in der Fläche `pts` ab,
        Rand weich (`weich` Pixel). Leere Stellen bleiben leer (kein Schatten in der Luft)."""
        s = self.s
        rand = int(weich * s * 3) + 2
        xs = [a * s for a, _ in pts]
        ys = [b * s for _, b in pts]
        x0, y0 = max(0, int(min(xs)) - rand), max(0, int(min(ys)) - rand)
        x1, y1 = min(self.bild.width, int(max(xs)) + rand), min(self.bild.height, int(max(ys)) + rand)
        if x1 <= x0 or y1 <= y0:
            return
        maske = Image.new("L", (x1 - x0, y1 - y0), 0)
        ImageDraw.Draw(maske).polygon([(a - x0, b - y0) for a, b in zip(xs, ys)], fill=255)
        if weich > 0:
            maske = maske.filter(ImageFilter.GaussianBlur(weich * s))
        stueck = np.asarray(self.bild.crop((x0, y0, x1, y1)), dtype=np.float32)
        f = 1.0 - staerke * np.asarray(maske, dtype=np.float32)[..., None] / 255.0
        stueck[..., :3] *= f
        self.bild.paste(Image.fromarray(stueck.round().astype(np.uint8), "RGBA"), (x0, y0))

    def flaeche_l(self, x0, x1, y, z0, z1) -> list:
        p = self.p
        return [p(x0, y, z0), p(x1, y, z0), p(x1, y, z1), p(x0, y, z1)]

    def flaeche_r(self, x, y0, y1, z0, z1) -> list:
        p = self.p
        return [p(x, y1, z0), p(x, y0, z0), p(x, y0, z1), p(x, y1, z1)]

    def traufschatten(self, x0, x1, y0, y1, z, tiefe: float = 12, staerke: float = 0.34) -> None:
        """Schatten des Dachüberstands auf den sichtbaren Wänden direkt unter der Traufe."""
        self.abdunkeln(self.flaeche_l(x0, x1, y1, z - tiefe, z + 2), staerke, tiefe / 3)
        self.abdunkeln(self.flaeche_r(x1, y0, y1, z - tiefe, z + 2), staerke * 0.8, tiefe / 3)

    # —— Grundkörper ——
    def quader(self, x0, x1, y0, y1, z0, z1, wand, dach=None, *, links=-34, rechts=-12) -> None:
        p = self.p
        if self.s > 1 and z0 > 0 and (x1 - x0) * (y1 - y0) > 0.02:
            # weicher Schatten auf dem, worauf der Körper steht (Turm auf Mauer)
            e = 0.1
            self.abdunkeln([p(x0 - e, y0 - e, z0), p(x1 + e, y0 - e, z0), p(x1 + e, y1 + e, z0), p(x0 - e, y1 + e, z0)], 0.28, 3)
        self.poly([p(x0, y1, z0), p(x1, y1, z0), p(x1, y1, z1), p(x0, y1, z1)], hell(wand, links))
        self.poly([p(x1, y0, z0), p(x1, y1, z0), p(x1, y1, z1), p(x1, y0, z1)], hell(wand, rechts))
        self.poly([p(x0, y0, z1), p(x1, y0, z1), p(x1, y1, z1), p(x0, y1, z1)], dach or hell(wand, 14))
        if self.s > 1 and z1 - z0 >= 24 and (x1 - x0) > 0.3:
            # Fuß der Wand etwas dunkler (Boden-Nähe), Kante oben ein Hauch Licht
            t = min(10, (z1 - z0) / 4)
            self.abdunkeln(self.flaeche_l(x0, x1, y1, z0 - 2, z0 + t), 0.16, t / 2.5)
            self.abdunkeln(self.flaeche_r(x1, y0, y1, z0 - 2, z0 + t), 0.12, t / 2.5)
        if self.s > 1:
            self.mix.line([p(x0, y1, z1), p(x1, y1, z1), p(x1, y0, z1)], fill=(255, 250, 236, 46), width=1)
        for a, b in [((x0, y1, z0), (x1, y1, z0)), ((x1, y1, z0), (x1, y0, z0)), ((x1, y1, z0), (x1, y1, z1))]:
            self.linie(p(*a), p(*b), KONTUR)

    def textur_stein(self, x0, x1, y0, y1, z0, z1, schritt=14) -> None:
        p = self.p
        if self.s > 1:
            self._steintoene(x0, x1, y0, y1, z0, z1, schritt)
        for i, z in enumerate(range(int(z0) + schritt, int(z1), schritt)):
            self.linie(p(x0, y1, z), p(x1, y1, z), hell(STEIN_FUGE, -10))
            self.linie(p(x1, y1, z), p(x1, y0, z), STEIN_FUGE)
            versatz = 0.5 if i % 2 else 0.0
            for k in range(4):
                u = (k + versatz) / 4
                zo = min(z + schritt, z1)
                self.linie(p(x0 + (x1 - x0) * u, y1, z), p(x0 + (x1 - x0) * u, y1, zo), hell(STEIN_FUGE, -10))
                self.linie(p(x1, y1 - (y1 - y0) * u, z), p(x1, y1 - (y1 - y0) * u, zo), STEIN_FUGE)

    def _steintoene(self, x0, x1, y0, y1, z0, z1, schritt) -> None:
        """Jeder Quader einen leicht anderen Ton (feste Zahlenfolge), oben ein Lichtsaum."""
        p = self.p
        reihen = list(range(int(z0), int(z1), schritt))
        for i, za in enumerate(reihen):
            zb = min(za + schritt, z1)
            versatz = 0.5 if i % 2 else 0.0
            for seite in ("l", "r"):
                for k in range(-1, 4):
                    u0 = max(0.0, (k + versatz) / 4)
                    u1 = min(1.0, (k + 1 + versatz) / 4)
                    if u1 <= u0:
                        continue
                    if seite == "l":
                        pts = [p(x0 + (x1 - x0) * u0, y1, za), p(x0 + (x1 - x0) * u1, y1, za), p(x0 + (x1 - x0) * u1, y1, zb), p(x0 + (x1 - x0) * u0, y1, zb)]
                    else:
                        pts = [p(x1, y1 - (y1 - y0) * u0, za), p(x1, y1 - (y1 - y0) * u1, za), p(x1, y1 - (y1 - y0) * u1, zb), p(x1, y1 - (y1 - y0) * u0, zb)]
                    w = zahl(round(x0 * 100), round(y0 * 100), int(za), k, seite == "l") - 500  # −500 … 499
                    a = abs(w) * 30 // 500
                    farbe = (255, 248, 232, a) if w > 0 else (30, 24, 18, a)
                    self.mix.polygon(pts, fill=farbe)
                    # Lichtsaum oben am Stein, Schattensaum unten
                    self.mix.line([pts[3], pts[2]], fill=(255, 250, 238, 40), width=1)
                    self.mix.line([pts[0], pts[1]], fill=(20, 16, 12, 34), width=1)

    def textur_holz(self, x0, x1, y0, y1, z0, z1, n=7) -> None:
        p = self.p
        if self.s > 1:
            self._maserung(x0, x1, y0, y1, z0, z1, n)
        for k in range(1, n):
            u = k / n
            self.linie(p(x0 + (x1 - x0) * u, y1, z0), p(x0 + (x1 - x0) * u, y1, z1), HOLZ_FUGE)
            self.linie(p(x1, y1 - (y1 - y0) * u, z0), p(x1, y1 - (y1 - y0) * u, z1), hell(HOLZ_FUGE, 12))

    def _maserung(self, x0, x1, y0, y1, z0, z1, n) -> None:
        """Maserung je Brett: zwei feine, leicht wellige Linien, ab und zu ein Astloch."""
        p = self.p
        for seite in ("l", "r"):
            for k in range(n):
                for j, f in enumerate((0.32, 0.7)):
                    u = (k + f) / n
                    pts = []
                    steps = max(4, int((z1 - z0) / 6))
                    for t in range(steps + 1):
                        z = z0 + 2 + (z1 - z0 - 4) * t / steps
                        du = 0.18 / n * math.sin(z * 0.11 + k * 1.7 + j * 2.3)
                        if seite == "l":
                            pts.append(p(x0 + (x1 - x0) * (u + du), y1, z))
                        else:
                            pts.append(p(x1, y1 - (y1 - y0) * (u + du), z))
                    self.mix.line(pts, fill=(60, 36, 18, 34), width=0.5)
                h = zahl(k, seite == "l", int(z0), round(x0 * 10))
                if h < 260:  # Astloch an fester Stelle
                    u = (k + 0.5) / n
                    z = z0 + (z1 - z0) * (0.2 + 0.6 * h / 260)
                    m = p(x0 + (x1 - x0) * u, y1, z) if seite == "l" else p(x1, y1 - (y1 - y0) * u, z)
                    self.mix.ellipse([m[0] - 1.6, m[1] - 1.1, m[0] + 1.6, m[1] + 1.1], fill=(54, 32, 16, 120))

    def textur_fachwerk(self, x0, x1, y0, y1, z0, z1) -> None:
        p = self.p
        zm = (z0 + z1) / 2
        for fl in ("l", "r"):
            def q(u, z):
                return p(x0 + (x1 - x0) * u, y1, z) if fl == "l" else p(x1, y1 - (y1 - y0) * u, z)

            for z in (z0 + 2, zm, z1 - 2):
                self.linie(q(0, z), q(1, z), BALKEN, 3)
            for u in (0.02, 0.33, 0.67, 0.98):
                self.linie(q(u, z0), q(u, z1), BALKEN, 3)
            self.linie(q(0.02, zm), q(0.33, z1 - 2), BALKEN, 2)
            self.linie(q(0.67, z1 - 2), q(0.98, zm), BALKEN, 2)

    def pyramide(self, x0, x1, y0, y1, z, h, farbe, *, ueber=0.12) -> tuple[float, float]:
        x0, x1, y0, y1 = x0 - ueber, x1 + ueber, y0 - ueber, y1 + ueber
        mx, my = (x0 + x1) / 2, (y0 + y1) / 2
        p = self.p
        spitze = p(mx, my, z + h)
        if self.s > 1 and ueber > 0.03:
            self.traufschatten(x0 + ueber, x1 - ueber, y0 + ueber, y1 - ueber, z)
        self.poly([p(x0, y1, z), p(x1, y1, z), spitze], hell(farbe, -22), KONTUR)
        self.poly([p(x1, y1, z), p(x1, y0, z), spitze], hell(farbe, 16), KONTUR)
        if self.s > 1:
            for a, b in ((p(x0, y1, z), p(x1, y1, z)), (p(x1, y1, z), p(x1, y0, z))):
                self._dachreihen(a, b, spitze, spitze, h)
            self.linie(p(x1, y1, z), spitze, hell(farbe, 34), 1)  # Grat im Licht
            return spitze
        # Ziegelreihen
        for t in (0.25, 0.5, 0.75):
            a = lambda q: (q[0] + (spitze[0] - q[0]) * t, q[1] + (spitze[1] - q[1]) * t)  # noqa: E731
            self.linie(a(p(x0, y1, z)), a(p(x1, y1, z)), hell(farbe, -40))
            self.linie(a(p(x1, y1, z)), a(p(x1, y0, z)), hell(farbe, -6))
        return spitze

    def _dachreihen(self, a, b, c, d, h: float) -> None:
        """Ziegel- oder Schieferreihen auf der Dachfläche a–b (Traufe) bis d–c (First):
        je Reihe eine dunkle Linie mit weichem Schatten darunter und versetzte Stoßfugen."""
        def punkt(u, t):
            unten = (a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u)
            oben = (d[0] + (c[0] - d[0]) * u, d[1] + (c[1] - d[1]) * u)
            return (unten[0] + (oben[0] - unten[0]) * t, unten[1] + (oben[1] - unten[1]) * t)

        laenge = math.dist(a, b)
        reihen = max(3, min(12, round(h / 9)))
        spitz = math.dist(c, d) < 1
        for i in range(1, reihen):
            t = i / reihen
            self.mix.line([punkt(0, t), punkt(1, t)], fill=(24, 16, 12, 70), width=1)
            # Schatten unter der Reihe darüber
            t2 = t + 0.35 / reihen
            self.mix.polygon([punkt(0, t), punkt(1, t), punkt(1, t2), punkt(0, t2)], fill=(24, 16, 12, 22))
            # Licht an der Unterkante der Reihe
            t3 = t - 0.12 / reihen
            self.mix.line([punkt(0, t3), punkt(1, t3)], fill=(255, 246, 228, 26), width=1)
        for i in range(reihen):
            t0, t1 = i / reihen, (i + 1) / reihen
            breite = laenge * ((1 - t0) if spitz else 1)
            m = max(1, round(breite / 9))
            for j in range(m):
                u = (j + 0.5 * (i % 2)) / m
                if 0.02 < u < 0.98:
                    self.mix.line([punkt(u, t0 + 0.04 / reihen), punkt(u, t1 - 0.12 / reihen)], fill=(24, 16, 12, 48), width=0.75)

    def satteldach(self, x0, x1, y0, y1, z, h, farbe, giebel, *, ueber=0.12) -> tuple[float, float]:
        """Satteldach, First parallel zur x-Achse. Sichtbar: vordere Dachfläche (+y) und der
        Giebel rechts (x1). Gibt die Mitte des Firsts zurück."""
        p = self.p
        ym = (y0 + y1) / 2
        a, b = x0 - ueber, x1 + ueber
        if self.s > 1 and ueber > 0.03:
            self.traufschatten(x0, x1, y0, y1, z, staerke=0.3)
        # hintere Dachfläche zuerst: von ihr bleibt rechts nur die Kante über dem Giebel sichtbar
        self.poly([p(a, ym, z + h), p(b, ym, z + h), p(b, y0 - ueber, z - 4), p(a, y0 - ueber, z - 4)], hell(farbe, 8), KONTUR)
        # Giebel rechts in Wandfarbe (rechte Fläche, heller)
        self.poly([p(x1, y1, z), p(x1, y0, z), p(x1, ym, z + h)], hell(giebel, -12), KONTUR)
        vorne = [p(a, y1 + ueber, z - 4), p(b, y1 + ueber, z - 4), p(b, ym, z + h), p(a, ym, z + h)]
        self.poly(vorne, hell(farbe, -18), KONTUR)
        if self.s > 1:
            self._dachreihen(vorne[0], vorne[1], vorne[2], vorne[3], h)
            self.linie(vorne[2], vorne[3], hell(farbe, 30), 1)  # First im Licht
            return p((x0 + x1) / 2, ym, z + h)
        for t in (0.25, 0.5, 0.75):
            yy = y1 + ueber + (ym - y1 - ueber) * t
            self.linie(p(a, yy, z - 4 + (h + 4) * t), p(b, yy, z - 4 + (h + 4) * t), hell(farbe, -40))
        return p((x0 + x1) / 2, ym, z + h)

    def zylinder(self, x, y, r, z0, z1, wand, *, stein=True) -> None:
        cxs, cys = self.p(x, y, 0)
        rx, ry = r * HW * math.sqrt(2), r * HH * math.sqrt(2)
        n = 24
        for i in range(n):  # senkrechte Streifen, links dunkler (Licht von rechts)
            a0, a1 = math.pi * i / n, math.pi * (i + 1) / n
            xa, xb = cxs - rx * math.cos(a0), cxs - rx * math.cos(a1)
            ya, yb = cys + ry * math.sin(a0), cys + ry * math.sin(a1)
            ton = hell(wand, int(-40 + 46 * (i / n)))
            self.poly([(xa, ya - z0), (xb, yb - z0), (xb, yb - z1), (xa, ya - z1)], ton)
        if stein:
            for z in range(int(z0) + 14, int(z1), 14):
                self.d.arc([cxs - rx, cys - ry - z, cxs + rx, cys + ry - z], 0, 180, fill=STEIN_FUGE)
        self.d.ellipse([cxs - rx, cys - ry - z1, cxs + rx, cys + ry - z1], fill=hell(wand, 12), outline=KONTUR)

    def kegel(self, x, y, r, z, h, farbe) -> tuple[float, float]:
        cxs, cys = self.p(x, y, 0)
        rx, ry = r * HW * math.sqrt(2), r * HH * math.sqrt(2)
        spitze = (cxs, cys - z - h)
        n = 20
        if self.s > 1 and z > 0:  # Schatten der Traufe auf dem Turm darunter
            ix, iy = rx / 1.24, ry / 1.24
            band = [(cxs - ix * math.cos(math.pi * i / n), cys + iy * math.sin(math.pi * i / n) - z + 2) for i in range(n + 1)]
            band += [(cxs + ix * math.cos(math.pi * i / n), cys + iy * math.sin(math.pi * (n - i) / n) - z + 14) for i in range(n + 1)]
            self.abdunkeln(band, 0.32, 3.5)
        for i in range(n):
            a0, a1 = math.pi * i / n, math.pi * (i + 1) / n
            pa = (cxs - rx * math.cos(a0), cys + ry * math.sin(a0) - z)
            pb = (cxs - rx * math.cos(a1), cys + ry * math.sin(a1) - z)
            self.poly([pa, pb, spitze], hell(farbe, int(-30 + 44 * (i / n))))
        self.d.arc([cxs - rx, cys - ry - z, cxs + rx, cys + ry - z], 0, 180, fill=KONTUR)
        return spitze

    def zinnen(self, x0, x1, y0, y1, z, h, farbe, n=4) -> None:
        """Brüstung mit Zinnen: hintere Kanten zuerst, dann vordere."""
        w = 0.14
        hinten, vorne = [], []
        for k in range(n):
            u0 = x0 + (x1 - x0) * k / n
            v0 = y0 + (y1 - y0) * k / n
            hinten.append((u0, u0 + (x1 - x0) / n * 0.55, y0, y0 + w))
            hinten.append((x0, x0 + w, v0, v0 + (y1 - y0) / n * 0.55))
            vorne.append((u0 + (x1 - x0) / n * 0.45, u0 + (x1 - x0) / n, y1 - w, y1))
            vorne.append((x1 - w, x1, v0 + (y1 - y0) / n * 0.45, v0 + (y1 - y0) / n))
        for a, b, c, d in hinten:
            self.quader(a, b, c, d, z, z + h, farbe)
        self.quader(x0, x1, y0, y1, z - 6, z, farbe, hell(farbe, -30))
        for a, b, c, d in sorted(vorne, key=lambda q: q[1] + q[3]):
            self.quader(a, b, c, d, z, z + h, farbe)

    def fenster_l(self, x, y, z, b=0.16, h=22, *, farbe=FENSTER_TAG, bogen=True) -> list:
        """Fenster auf der linken Fläche (y fest), Mitte x, Unterkante z."""
        p = self.p
        pts = [p(x - b / 2, y, z), p(x + b / 2, y, z), p(x + b / 2, y, z + h)]
        if bogen:
            for t in range(1, 6):
                a = math.pi * t / 6
                pts.append(p(x + b / 2 * math.cos(a), y, z + h + b * 26 * math.sin(a)))
        pts.append(p(x - b / 2, y, z + h))
        self.poly(pts, farbe, KONTUR)
        if self.s > 1:
            q = lambda u, zz: p(x + b / 2 * u, y, zz)  # noqa: E731
            self._oeffnung(pts, q, z, h, b, farbe, bogen)
        return pts

    def fenster_r(self, x, y, z, b=0.16, h=22, *, farbe=FENSTER_TAG, bogen=True) -> list:
        p = self.p
        pts = [p(x, y + b / 2, z), p(x, y - b / 2, z), p(x, y - b / 2, z + h)]
        if bogen:
            for t in range(1, 6):
                a = math.pi * t / 6
                pts.append(p(x, y - b / 2 * math.cos(a), z + h + b * 26 * math.sin(a)))
        pts.append(p(x, y + b / 2, z + h))
        self.poly(pts, farbe, KONTUR)
        if self.s > 1:
            q = lambda u, zz: p(x, y - b / 2 * u, zz)  # noqa: E731
            self._oeffnung(pts, q, z, h, b, farbe, bogen)
        return pts

    def _oeffnung(self, pts, q, z, h, b, farbe, bogen) -> None:
        """Fenster: Laibung (Schatten innen oben), Sprossen, Glanz, Sims.
        Tür (jede andere Farbe als FENSTER_TAG): Bretter, Bänder, Ring.
        `q(u, z)`: Punkt auf der Öffnung, u von −1 (links) bis 1 (rechts)."""
        oben = z + h + (b * 26 if bogen else 0)
        if farbe == FENSTER_TAG:
            # Laibung: oben und links tiefer im Schatten
            self.mix.polygon([q(-1, z + h), q(1, z + h), q(1, z + h - 4), q(-1, z + h - 4)], fill=(0, 0, 0, 60))
            self.mix.polygon([q(-1, z), q(-0.7, z), q(-0.7, z + h), q(-1, z + h)], fill=(0, 0, 0, 50))
            # Glanz in der Scheibe (matt)
            self.mix.polygon([q(0.2, z + h * 0.5), q(0.85, z + h * 0.82), q(0.85, z + h * 0.62), q(0.2, z + h * 0.3)], fill=(190, 214, 230, 46))
            linien = [(q(0, z + 1), q(0, oben - 1)), (q(-1, z + h * 0.55), q(1, z + h * 0.55))]
            for a, c in linien:
                self.mix.line([a, c], fill=(*SPROSSE, 230), width=1)
            self.sprossen[id(pts)] = linien
            # Sims unter dem Fenster
            self.d.polygon([q(-1.25, z), q(1.25, z), q(1.25, z - 3), q(-1.25, z - 3)], fill=SIMS, outline=KONTUR)
            self.mix.polygon([q(-1.1, z - 3), q(1.1, z - 3), q(1.1, z - 7), q(-1.1, z - 7)], fill=(0, 0, 0, 36))
        elif h >= 26 and b >= 0.24:
            # Tür: senkrechte Bretter, zwei eiserne Bänder, Ring
            for u in (-0.5, 0.0, 0.5):
                self.mix.line([q(u, z + 1), q(u, oben - 2)], fill=(30, 18, 10, 80), width=0.75)
            for zz in (z + h * 0.24, z + h * 0.72):
                self.d.line([q(-0.92, zz), q(0.15, zz)], fill=BESCHLAG, width=2)
                m = q(-0.92, zz)
                self.d.ellipse([m[0] - 1.3, m[1] - 1.3, m[0] + 1.3, m[1] + 1.3], fill=hell(BESCHLAG, 30))
            m = q(0.55, z + h * 0.48)
            self.d.ellipse([m[0] - 2, m[1] - 2, m[0] + 2, m[1] + 2], outline=hell(BESCHLAG, 50), width=1)
            # Schwelle
            self.d.polygon([q(-1.15, z), q(1.15, z), q(1.15, z - 2), q(-1.15, z - 2)], fill=hell(SIMS, -40), outline=KONTUR)
            self.mix.polygon([q(-1, oben), q(1, oben), q(1, oben - 5), q(-1, oben - 5)], fill=(0, 0, 0, 50))

    def fahne(self, fuss: tuple[float, float], hoehe: float, farbe) -> None:
        x, y = fuss
        self.linie((x, y), (x, y - hoehe), (244, 239, 228), 3)
        self.poly([(x + 1, y - hoehe), (x + 30, y - hoehe + 8), (x + 1, y - hoehe + 18)], farbe, KONTUR)

    def banner_r(self, x, y, z_oben, laenge, farbe) -> None:
        p = self.p
        b = 0.22
        oben_a, oben_b = p(x, y + b / 2, z_oben), p(x, y - b / 2, z_oben)
        unten_m = p(x, y, z_oben - laenge - 10)
        self.poly(
            [oben_a, oben_b, p(x, y - b / 2, z_oben - laenge), unten_m, p(x, y + b / 2, z_oben - laenge)],
            farbe,
            KONTUR,
        )
        m = p(x, y, z_oben - laenge * 0.45)
        self.d.ellipse([m[0] - 5, m[1] - 6, m[0] + 5, m[1] + 4], fill=(244, 222, 140))


def schatten(iso: Iso, r: float) -> None:
    p = iso.p
    iso.poly([p(-r, -r, 0), p(r, -r, 0), p(r, r, 0), p(-r, r, 0)], (0, 0, 0, 40))



GRUEN = (92, 140, 64)
ERDE = (96, 70, 48)
GRAU = (168, 166, 160)
LAUB = (92, 140, 64)


def krone(iso: Iso, mx: float, my: float, r: float) -> None:
    """Laubkrone als Kugel aus drei Tönen (links dunkel, rechts hell), Kontur nur am Rand."""
    d = iso.d
    teile = [(-0.55, 0.15, 0.75), (0.5, 0.2, 0.7), (0.0, -0.35, 0.85), (0.0, 0.25, 0.9)]
    for dx, dy, f in teile:  # Umriss: alle Teile etwas größer in Konturfarbe
        rr = r * f + 1.5
        d.ellipse([mx + dx * r - rr, my + dy * r - rr, mx + dx * r + rr, my + dy * r + rr], fill=KONTUR)
    for dx, dy, f in teile:
        rr = r * f
        d.ellipse([mx + dx * r - rr, my + dy * r - rr, mx + dx * r + rr, my + dy * r + rr], fill=hell(LAUB, -26))
    for dx, dy, f in teile:  # mittlerer Ton nach rechts oben versetzt
        rr = r * f * 0.72
        cx, cy = mx + dx * r + r * 0.16, my + dy * r - r * 0.14
        d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=LAUB)
    for dx, dy, f in teile[1:3]:  # Licht von rechts oben
        rr = r * f * 0.38
        cx, cy = mx + dx * r + r * 0.3, my + dy * r - r * 0.3
        d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=hell(LAUB, 26))



WESEN_FRAMES = {"idle": 3, "walk": 4, "react": 2}
W_S = 4  # intern vierfach zeichnen, dann weich auf 64 × 64 verkleinern
W_KONTUR = (43, 38, 32, 255)


def kuppel(iso: Iso, x, y, r: float, z: float, h: float, farbe, *, rippen: int = 0, rippe=None) -> tuple[float, float]:
    """Halbkugel (Kuppel) auf Höhe z, Radius r in Feldern, Höhe h in Pixeln. Gibt die Spitze zurück."""
    cx, cy = iso.p(x, y, z)
    rx, ry = r * HW * math.sqrt(2), r * HH * math.sqrt(2)
    n = 28
    umriss = [(cx - rx * math.cos(math.pi * i / n), cy - h * math.sin(math.pi * i / n)) for i in range(n + 1)]
    umriss += [(cx + rx * math.cos(math.pi * i / n), cy + ry * math.sin(math.pi * i / n)) for i in range(n + 1)]
    iso.poly(umriss, hell(farbe, -30), KONTUR)
    for k, (f, d) in enumerate(((0.82, -12), (0.6, 4), (0.32, 16))):
        ox, oy = rx * (1 - f) * 0.55, h * (1 - f) * 0.5
        pts = [(cx + ox - rx * f * math.cos(math.pi * i / n), cy - oy - h * f * math.sin(math.pi * i / n) + ry * (1 - f) * 0.4) for i in range(n + 1)]
        pts += [(cx + ox + rx * f * math.cos(math.pi * i / n), cy - oy + ry * f * math.sin(math.pi * i / n) * 0.6) for i in range(n + 1)]
        iso.poly(pts, hell(farbe, d))
    if rippen:
        for k in range(1, rippen):
            t = math.pi * k / rippen
            fx = -math.cos(t)
            pts = [(cx + rx * fx * math.cos(a), cy - h * math.sin(a) + ry * math.sin(t) * math.cos(a) * 0.9) for a in [math.pi / 2 * j / 10 for j in range(11)]]
            for a, b in zip(pts, pts[1:]):
                iso.linie(a, b, rippe or hell(farbe, -50), 2)
        iso.d.arc([cx - rx, cy - ry, cx + rx, cy + ry], 0, 180, fill=rippe or hell(farbe, -50), width=2)
    return (cx, cy - h)


class Wesen:
    def __init__(self) -> None:
        self.bild = Image.new("RGBA", (64 * W_S, 64 * W_S), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.bild)

    def q(self, pts):
        return [(round(x * W_S), round(y * W_S)) for x, y in pts]

    def form(self, pts, farbe, kontur=True) -> None:
        self.d.polygon(self.q(pts), fill=farbe, outline=W_KONTUR if kontur else None, width=W_S if kontur else 0)

    def oval(self, x0, y0, x1, y1, farbe, kontur=True) -> None:
        self.d.ellipse([x0 * W_S, y0 * W_S, x1 * W_S, y1 * W_S], fill=farbe, outline=W_KONTUR if kontur else None, width=W_S if kontur else 0)

    def strich(self, a, b, farbe, breite=1.0) -> None:
        self.d.line(self.q([a, b]), fill=farbe, width=max(1, round(breite * W_S)))

    def fertig(self) -> Image.Image:
        return self.bild.resize((64, 64), Image.LANCZOS)


def wesen_bodenschatten(w: Wesen, breite: float) -> None:
    w.oval(32 - breite, 54, 32 + breite, 59, (0, 0, 0, 46), kontur=False)




def verkleinern(gross: Image.Image, w: int, h: int) -> Image.Image:
    """Weich verkleinern; fast durchsichtige Reste am Rand fallen weg (sonst wächst die Box)."""
    klein = gross.resize((w, h), Image.LANCZOS)
    a = np.asarray(klein).copy()
    a[a[..., 3] < 8] = 0
    return Image.fromarray(a, "RGBA")


def erzeuge_mit(zeichne, n: int, breite: int) -> tuple[Image.Image, Image.Image]:
    """Zeichnet ein Gebäude mit n×n Feldern; schneidet oben den leeren Rand ab."""
    gross = Image.new("RGBA", (breite * S, ROH_H * S), (0, 0, 0, 0))
    iso = Iso(gross, n, S)
    fenster: list = []
    zeichne(iso, fenster)
    abend_gross = Image.new("RGBA", gross.size, (0, 0, 0, 0))
    da = Zeichner(abend_gross, S)
    for pts in fenster:
        if pts:
            da.polygon(pts, fill=FENSTER_ABEND)
            for a, c in iso.sprossen.get(id(pts), ()):
                da.line([a, c], fill=(120, 84, 40, 255), width=1)
    bild = verkleinern(gross, breite, ROH_H)
    abend = verkleinern(abend_gross, breite, ROH_H)
    box = bild.getbbox()
    assert box
    oben = max(0, box[1] - 4)
    return bild.crop((0, oben, breite, ROH_H)), abend.crop((0, oben, breite, ROH_H))



WURZEL = Path(__file__).resolve().parents[2]
ATLAS = WURZEL / "public" / "grafik" / "atlas"

def speichere_palette(b: Image.Image, pfad: Path) -> None:
    """Als Palette-PNG (256 Farben, fein gestreut) speichern: Die vierfach gezeichneten
    Bilder hätten als RGBA etwa die vierfache Dateigröße (§12.12, Atlas im Budget)."""
    b.quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG).save(pfad, "PNG", optimize=True)


def eintrag(id_: str, rel: str, n: int, b: Image.Image) -> dict:
    return {"id": id_, "datei": rel, "felder": [n, n], "anker": {"x": 0.5, "y": 1.0}, "pixel": {"w": b.width, "h": b.height}}


def schreibe_atlas(thema: str, gebaeude, umgebung=(), wesen=None, *, epoche: int = 1) -> int:
    """Schreibt Gebäude (mit Abend-Ebenen), Umgebung und Wesen eines Themas in den
    Atlas und ersetzt die passenden Einträge in `manifest.json`; andere bleiben."""
    manifest_pfad = ATLAS / "manifest.json"
    manifest = json.loads(manifest_pfad.read_text(encoding="utf-8"))
    neu: dict[str, dict] = {}
    weg: set[str] = set()

    def speichere(rel: str, id_: str, n: int, b: Image.Image) -> None:
        pfad = ATLAS / rel
        pfad.parent.mkdir(parents=True, exist_ok=True)
        if rel.startswith(("gebaeude/", "umgebung/")):
            speichere_palette(b, pfad)
        else:
            b.save(pfad, "PNG", optimize=True)
        neu[id_] = eintrag(id_, rel, n, b)

    for rolle, stufe, zeichne, n, breite in gebaeude:
        bild, abend = erzeuge_mit(zeichne, n, breite)
        bilder = [(f"{rolle}_s{stufe}", bild)]
        if abend.getbbox():  # Abend-Ebene nur, wo etwas leuchtet
            bilder.append((f"{rolle}_s{stufe}_fenster", abend))
        else:  # eine alte Abend-Ebene passt nicht mehr zum neuen Bild
            alt = f"{thema}/e{epoche}/{rolle}_s{stufe}_fenster"
            weg.add(alt)
            (ATLAS / f"gebaeude/{thema}/e{epoche}/{rolle}_s{stufe}_fenster.png").unlink(missing_ok=True)
        for name, b in bilder:
            speichere(f"gebaeude/{thema}/e{epoche}/{name}.png", f"{thema}/e{epoche}/{name}", n, b)
    for name, zeichne in umgebung:
        bild, _ = erzeuge_mit(zeichne, 1, 104)
        speichere(f"umgebung/{thema}/{name}.png", f"{thema}/umgebung/{name}", 1, bild)
    for art, zeichne_wesen in (wesen or {}).items():
        for zyklus, n in WESEN_FRAMES.items():
            for i in range(n):
                bild = zeichne_wesen(zyklus, i)
                speichere(f"wesen/{thema}/{art}_{zyklus}_{i}.png", f"wesen/{thema}/{art}_{zyklus}_{i}", 1, bild)
    gesehen = set()
    eintraege = []
    for e in manifest["eintraege"]:
        if e["id"] in weg:
            continue
        if e["id"] in neu:
            eintraege.append(neu[e["id"]])
            gesehen.add(e["id"])
        else:
            eintraege.append(e)
    eintraege.extend(v for k, v in neu.items() if k not in gesehen)
    manifest["eintraege"] = eintraege
    manifest_pfad.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for k, v in neu.items():
        print(k, v["pixel"])
    return 0


def raeume_epochen(thema: str) -> int:
    """Eine Stufe hat in jeder Epoche dasselbe Bild (Entscheidung PV, 02.11.2026).
    Entfernt in e2–e4 jedes Gebäudebild (und jede Abend-Ebene), dessen Stufe es schon
    in einer früheren Epoche gibt; die App nimmt dann über den Epoche-Rückfall
    (`atlasEintrag`) das frühere Bild. Gibt die Zahl der entfernten Einträge zurück."""
    manifest_pfad = ATLAS / "manifest.json"
    manifest = json.loads(manifest_pfad.read_text(encoding="utf-8"))
    ids = {e["id"] for e in manifest["eintraege"]}

    def frueher(epoche: int, name: str) -> bool:
        basis = name.removesuffix("_fenster")
        return any(f"{thema}/e{e}/{basis}" in ids for e in range(1, epoche))

    weg = []
    for e in manifest["eintraege"]:
        teile = e["id"].split("/")
        if len(teile) == 3 and teile[0] == thema and teile[1] in ("e2", "e3", "e4"):
            if frueher(int(teile[1][1]), teile[2]):
                weg.append(e)
    for e in weg:
        (ATLAS / e["datei"]).unlink(missing_ok=True)
    manifest["eintraege"] = [e for e in manifest["eintraege"] if e not in weg]
    manifest_pfad.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return len(weg)


# —— Epochen 2–4 (§12.11): gemeinsame Bauteile und Schreiben ————————————————

SCHIEFER = (96, 104, 118)
KUPFER = (92, 156, 138)  # Grünspan, Metalldach ab Epoche 4
GOLD_MATT = (214, 182, 104)  # Knauf und Spitze, matt (kein Glitzern, R1)


def rundturm(iso: Iso, fenster: list, x, y, r, h, dach, *, wand=STEIN, kegel_h=None, reihen=(), fahne=None, zinnen=False) -> tuple[float, float]:
    """Runder Turm mit Kegeldach (oder Zinnenkranz), Fenster auf der Vorderseite.
    Gibt die Spitze zurück."""
    iso.zylinder(x, y, r, 0, h, wand)
    cx, cy = iso.p(x, y, 0)
    vorne = r * HH * math.sqrt(2)
    for fz in reihen:
        pts = [(cx - 5, cy + vorne - fz), (cx + 5, cy + vorne - fz), (cx + 5, cy + vorne - fz - 18), (cx, cy + vorne - fz - 23), (cx - 5, cy + vorne - fz - 18)]
        iso.poly(pts, FENSTER_TAG, KONTUR)
        fenster.append(pts)
    if zinnen:
        rx = r * HW * math.sqrt(2) * 1.08
        for k in range(5):
            a = math.pi * (0.1 + 0.8 * k / 4)
            zx, zy = cx - rx * math.cos(a), cy + vorne * 1.08 * math.sin(a) - h
            iso.poly([(zx - 6, zy), (zx + 6, zy), (zx + 6, zy - 12), (zx - 6, zy - 12)], hell(wand, -6 + k * 4), KONTUR)
        spitze = (cx, cy - h - 12)
    else:
        spitze = iso.kegel(x, y, r * 1.22, h, kegel_h or r * 190, dach)
    if fahne:
        iso.fahne(spitze, 34, fahne)
    return spitze


def schreibe_epochen(thema: str, epochen: dict[int, list]) -> int:
    """Schreibt die neuen Stufen der Epochen 2–4 (je in die Epoche, in der sie zuerst
    baubar sind) und räumt danach doppelte Stufen aus (eine Stufe, ein Bild)."""
    for epoche, gebaeude in sorted(epochen.items()):
        schreibe_atlas(thema, gebaeude, epoche=epoche)
    print(thema, raeume_epochen(thema), "doppelte Einträge entfernt")
    return 0
