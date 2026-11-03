#!/usr/bin/env python3
"""G12: Kulissen für Dorf, Garten, Unterwasser und Weltraum (Auftrag Grafik Punkt 3,
GRAFIK.md §13, Variante C wie `bastion`), Stil „weich gerendert“ (§13 GRAFIK-SPRITES).

Je Thema und Stimmung (tag / daemmerung / nacht):
  horizont.png  fernes Band (2048 × 288, doppelte Größe), waagrecht nahtlos
  meer.png      Grund-Kachel um den Bauplatz (256 × 128), in beide Richtungen nahtlos
                (heißt wie beim Meer der Bastion, damit die App gleich lädt)
  sterne.png    Sterne (Nacht; im Weltraum in jeder Stimmung)
dazu `dinge/*.png` aus dem 3D-Renderer (`raum.py`), 160 breit.

  dorf        Felder in Streifen, Hecken, Bach, ferne Dächer und Kirchturm
  garten      Wiese mit Blumen, Hecken, Teich, ferne Bäume
  unterwasser Riff in Schichten, Lichtstrahlen von oben, Tiefe im Blau
  weltraum    Kraterrand, großer Planet am Horizont, Sterne
Gleiche Eingabe, gleiches Bild: Abwechslung nur aus festen Zahlen, kein Zufall.
Aufruf: python3 tools/grafik/g12_kulisse.py
"""
from __future__ import annotations

import math
import shutil
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from g12_modelle import KORALLE, LAUB, baum  # noqa: E402
from raum import HOLZ, SOCKEL, Szene, rendern  # noqa: E402

ZIEL = Path(__file__).resolve().parents[2] / "public" / "grafik" / "atlas" / "kulisse"
B, H = 2048, 288
GRUND = 236  # hier beginnt der Grund (Wasserlinie bei der Bastion)
KW, KH = 256, 128
S = 2  # doppelt zeichnen, weich verkleinern


def welle(x, teile):
    return sum(a * math.sin(2 * math.pi * (n * x / B) + p) for n, a, p in teile)


def mischen(a, b, t):
    return tuple(round(x + (y - x) * t) for x, y in zip(a, b))


def dunkler(c, f):
    return tuple(round(v * f) for v in c)


STIMMUNG_F = {"tag": 1.0, "daemmerung": 0.72, "nacht": 0.32}
STIMMUNG_TON = {"tag": (255, 255, 255), "daemmerung": (255, 196, 160), "nacht": (120, 140, 200)}


def stimmen(c, s):
    """Farbe für die Stimmung: dunkler und leicht getönt (Dämmerung warm, Nacht blau)."""
    f = STIMMUNG_F[s]
    t = STIMMUNG_TON[s]
    return tuple(round(min(255, v * f * (tt / 255) ** 0.35)) for v, tt in zip(c, t))


class Band:
    """Horizont-Band, doppelt gezeichnet; `fertig` verkleinert nahtlos."""

    def __init__(self) -> None:
        self.bild = Image.new("RGBA", (B * S, H * S), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.bild, "RGBA")

    def kurve(self, y0, teile, farbe, unten=GRUND, schritt=4):
        pts = [(x * S, (y0 + welle(x, teile)) * S) for x in range(0, B + 1, schritt)]
        self.d.polygon(pts + [(B * S, unten * S), (0, unten * S)], fill=farbe)

    def kreis(self, x, y, r, farbe, ry=None):
        for dx in (-B, 0, B):
            self.d.ellipse([(x + dx - r) * S, (y - (ry or r)) * S, (x + dx + r) * S, (y + (ry or r)) * S], fill=farbe)

    def poly(self, pts, farbe):
        for dx in (-B, 0, B):
            self.d.polygon([((x + dx) * S, y * S) for x, y in pts], fill=farbe)

    def dunst(self, y, farbe, hoehe=14, alpha=90):
        lage = Image.new("RGBA", self.bild.size, (0, 0, 0, 0))
        ImageDraw.Draw(lage).rectangle([0, (y - hoehe) * S, B * S, (y + 4) * S], fill=(*farbe, alpha))
        self.bild.alpha_composite(lage.filter(ImageFilter.GaussianBlur(6 * S)))

    def fertig(self) -> Image.Image:
        drei = Image.new("RGBA", (3 * self.bild.width, self.bild.height))
        for k in range(3):
            drei.paste(self.bild, (k * self.bild.width, 0))
        return drei.resize((3 * B, H), Image.LANCZOS).crop((B, 0, 2 * B, H))


def kachel_rauschen(w, h, p, seed):
    """Nahtloses Wertrauschen (Periode = Kachel)."""
    yy, xx = np.mgrid[0:h, 0:w]
    u, v = xx / w * p, yy / h * p
    iu, iv = np.floor(u).astype(int), np.floor(v).astype(int)
    fu, fv = u - iu, v - iv
    fu, fv = fu * fu * (3 - 2 * fu), fv * fv * (3 - 2 * fv)

    def h_(a, b):
        x = ((a % p) * 374761393 + (b % p) * 668265263 + seed * 97) & 0xFFFFFFFF
        x = (x ^ (x >> 13)) * 1274126177 & 0xFFFFFFFF
        return ((x ^ (x >> 16)) & 0xFFFF) / 0xFFFF

    return (h_(iu, iv) * (1 - fu) + h_(iu + 1, iv) * fu) * (1 - fv) + (h_(iu, iv + 1) * (1 - fu) + h_(iu + 1, iv + 1) * fu) * fv


def kachel(grund, tupfen, seed, *, streifen=None, tupfen_r=(2, 4), n=40):
    """Grund-Kachel: weiches Rauschen in der Grundfarbe, feste Tupfen (nahtlos)."""
    r = kachel_rauschen(KW, KH, 6, seed) * 0.6 + kachel_rauschen(KW, KH, 16, seed + 1) * 0.4
    a = np.array(grund, float)[None, None, :] * (0.95 + 0.1 * r[..., None])
    if streifen is not None:
        band = (np.sin(np.mgrid[0:KH, 0:KW][0] / KH * 2 * math.pi * 2) > 0)[..., None]
        a = np.where(band, a * streifen, a)
    bild = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGB").convert("RGBA")
    d = ImageDraw.Draw(bild, "RGBA")
    x = seed * 7919
    for i in range(n):
        x = (x * 1103515245 + 12345) % 2147483648
        px = (x >> 8) % KW
        x = (x * 1103515245 + 12345) % 2147483648
        py = (x >> 8) % KH
        rr = tupfen_r[0] + (i % (tupfen_r[1] - tupfen_r[0] + 1))
        farbe = tupfen[i % len(tupfen)]
        for dx in (-KW, 0, KW):
            for dy in (-KH, 0, KH):
                d.ellipse([px + dx - rr, py + dy - rr * 0.6, px + dx + rr, py + dy + rr * 0.6], fill=farbe)
    return bild


def sterne(dicht=70, gross=512):
    bild = Image.new("RGBA", (gross, gross), (0, 0, 0, 0))
    d = ImageDraw.Draw(bild)
    for k in range(dicht):
        x = (k * 173) % gross
        y = (k * 97 + k * k * 3) % gross
        r = 1 + (k % 5 == 0)
        a = 150 + (k * 29) % 100
        d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 246, 220, a))
    return bild


# —— Horizonte ————————————————————————————————————————————————————————————


def dorf_horizont(s):
    b = Band()
    fern = stimmen((150, 176, 150), s)
    b.kurve(120, ((3, 18, 0.4), (7, 9, 1.9)), fern)
    # Wald in der Ferne
    for k in range(96):
        x = k * B / 96 + (k * 37 % 11) - 5
        y = 150 + welle(x, ((3, 6, 2.2), (7, 3, 0.7)))
        b.kreis(x, y, 10 + (k * 13 % 6), stimmen((84, 122, 78), s), ry=14)
    # ferne Dächer, Kirchturm
    for k, x in enumerate((180, 420, 460, 900, 1320, 1360, 1700)):
        y = 170 + welle(x, ((3, 6, 2.2),))
        b.poly([(x - 12, y), (x + 12, y), (x + 12, y - 12), (x - 12, y - 12)], stimmen((226, 214, 192), s))
        b.poly([(x - 15, y - 12), (x + 15, y - 12), (x, y - 26)], stimmen((190, 92, 62), s))
    kx = 1320
    ky = 165 + welle(kx, ((3, 6, 2.2),))
    b.poly([(kx - 6, ky), (kx + 6, ky), (kx + 6, ky - 46), (kx - 6, ky - 46)], stimmen((214, 204, 186), s))
    b.poly([(kx - 8, ky - 46), (kx + 8, ky - 46), (kx, ky - 72)], stimmen((96, 104, 118), s))
    # Felder in Streifen, Hecken dazwischen
    for i, (y0, farbe) in enumerate(((178, (196, 182, 96)), (192, (124, 168, 86)), (206, (210, 190, 110)), (220, (108, 156, 78)))):
        b.kurve(y0, ((5, 5, 2.2 + i), (11, 3, 0.7)), stimmen(farbe, s))
        for k in range(60):
            x = k * B / 60 + (k * 31 % 13)
            y = y0 + welle(x, ((5, 5, 2.2 + i), (11, 3, 0.7))) - 2
            b.kreis(x, y, 6 + (k * 7 % 4), stimmen((66, 110, 62), s), ry=4)
    # Bach, der sich durch die Felder zieht
    pts = [(x, 226 + 6 * math.sin(2 * math.pi * 3 * x / B)) for x in range(0, B + 1, 8)]
    b.d.line([(x * S, y * S) for x, y in pts], fill=stimmen((120, 176, 210), s) + (255,), width=4 * S)
    b.d.rectangle([0, GRUND * S, B * S, H * S], fill=stimmen((116, 164, 76), s))
    b.dunst(GRUND - 60, stimmen((230, 240, 236), s), 40, 60)
    return b.fertig()


def garten_horizont(s):
    b = Band()
    b.kurve(130, ((3, 16, 1.1), (9, 6, 0.3)), stimmen((150, 186, 150), s))
    for k in range(70):  # ferne Baumkronen
        x = k * B / 70 + (k * 41 % 17)
        y = 160 + welle(x, ((3, 8, 2.0),))
        b.kreis(x, y, 16 + (k * 11 % 9), stimmen((82, 132, 74), s), ry=18)
    b.kurve(196, ((5, 4, 0.6), (13, 2, 1.7)), stimmen((104, 170, 82), s))
    for k in range(40):  # Hecken als Bögen
        x = k * B / 40
        y = 200 + welle(x, ((5, 4, 0.6),))
        b.kreis(x, y, 22, stimmen((58, 112, 56), s), ry=10)
    # Teich
    for x in (360, 1240):
        b.kreis(x, 226, 70, stimmen((110, 170, 200), s), ry=10)
        b.kreis(x + 20, 224, 26, stimmen((180, 220, 236), s), ry=3)
    b.kurve(230, ((7, 2, 0.4),), stimmen((95, 170, 72), s))
    # Blumen in der Wiese
    for k in range(240):
        x = (k * 997) % B
        y = 232 + (k * 13) % 4
        farbe = ((214, 96, 112), (236, 196, 84), (176, 120, 196), (240, 240, 236))[k % 4]
        b.kreis(x, y, 2, stimmen(farbe, s))
    b.d.rectangle([0, GRUND * S, B * S, H * S], fill=stimmen((95, 170, 72), s))
    b.dunst(GRUND - 70, stimmen((230, 242, 230), s), 40, 50)
    return b.fertig()


def unterwasser_horizont(s):
    b = Band()
    # Riff in Schichten: hinten blass und blau, vorn kräftiger
    for i, (y0, farbe) in enumerate(((140, (70, 120, 150)), (172, (90, 120, 140)), (200, (150, 110, 120)))):
        b.kurve(y0, ((3 + i, 14 - 3 * i, 0.5 + i), (11, 5, 1.3 * i)), stimmen(farbe, s))
        for k in range(50):
            x = k * B / 50 + (k * 29 % 23)
            y = y0 + welle(x, ((3 + i, 14 - 3 * i, 0.5 + i), (11, 5, 1.3 * i)))
            h = 18 + (k * 17 % 22) - 5 * i
            farbe2 = ((214, 110, 96), (230, 160, 80), (180, 110, 170), (110, 170, 150))[k % 4]
            mix = mischen(farbe2, (60, 110, 150), 0.6 - 0.25 * i)
            for dx in (-6, 0, 6):
                b.poly([(x + dx - 3, y + 2), (x + dx + 3, y + 2), (x + dx + 1, y - h + abs(dx)), (x + dx - 1, y - h + abs(dx))], stimmen(mix, s) + (255,))
    b.d.rectangle([0, GRUND * S, B * S, H * S], fill=stimmen((214, 196, 150), s))
    b.kurve(GRUND - 4, ((9, 2, 0.4),), stimmen((214, 196, 150), s))
    # Lichtstrahlen von oben (weich, fest)
    lage = Image.new("RGBA", b.bild.size, (0, 0, 0, 0))
    dl = ImageDraw.Draw(lage)
    if s != "nacht":
        for k in range(8):
            x = k * B / 8 + 60
            dl.polygon([((x - 10) * S, 0), ((x + 30) * S, 0), ((x + 110) * S, GRUND * S), ((x + 40) * S, GRUND * S)], fill=(230, 246, 250, 40))
    b.bild.alpha_composite(lage.filter(ImageFilter.GaussianBlur(8 * S)))
    b.dunst(GRUND - 80, stimmen((150, 200, 220), s), 60, 70)
    return b.fertig()


def weltraum_horizont(s):
    b = Band()
    # Planet am Horizont mit Ring (zweimal je Band, fest)
    for x, r in ((520, 70), (1560, 44)):
        planet = Image.new("RGBA", b.bild.size, (0, 0, 0, 0))
        dp = ImageDraw.Draw(planet)
        for k in range(14):
            f = 1 - k / 14
            farbe = mischen((214, 150, 110), (250, 214, 170), k / 14)
            dp.ellipse([(x - r * f + r * 0.15 * (1 - f)) * S, (110 - r * f - r * 0.1 * (1 - f)) * S, (x + r * f + r * 0.15 * (1 - f)) * S, (110 + r * f - r * 0.1 * (1 - f)) * S], fill=stimmen(farbe, "tag" if s != "nacht" else "daemmerung") + (255,))
        dp.ellipse([(x - r * 1.7) * S, (110 - r * 0.25) * S, (x + r * 1.7) * S, (110 + r * 0.25) * S], outline=(240, 226, 200, 170), width=3 * S)
        b.bild.alpha_composite(planet)
    # Kraterrand: Berge in zwei Schichten
    b.kurve(176, ((4, 22, 0.6), (9, 12, 2.1), (19, 5, 0.3)), stimmen((120, 118, 132), s))
    b.kurve(206, ((5, 14, 1.6), (13, 6, 0.2)), stimmen((140, 136, 146), s))
    for k in range(30):  # kleine Krater im Vordergrund
        x = k * B / 30 + (k * 43 % 27)
        y = 222 + (k * 7) % 8
        b.kreis(x, y, 14 + k % 6, stimmen((112, 108, 120), s), ry=4)
        b.kreis(x + 2, y - 1, 10 + k % 6, stimmen((150, 146, 152), s), ry=2.5)
    b.d.rectangle([0, GRUND * S, B * S, H * S], fill=stimmen((150, 146, 140), s))
    return b.fertig()


HORIZONTE = {"dorf": dorf_horizont, "garten": garten_horizont, "unterwasser": unterwasser_horizont, "weltraum": weltraum_horizont}

KACHELN = {
    "dorf": lambda s: kachel(stimmen((116, 164, 76), s), [stimmen((136, 180, 90), s) + (90,), stimmen((96, 146, 66), s) + (90,)], 3, streifen=np.array([1.025, 1.02, 0.985])),
    "garten": lambda s: kachel(stimmen((95, 170, 72), s), [stimmen((214, 96, 112), s) + (220,), stimmen((240, 240, 236), s) + (220,), stimmen((236, 196, 84), s) + (220,), stimmen((80, 150, 62), s) + (160,)], 5, tupfen_r=(1, 3), n=60),
    "unterwasser": lambda s: kachel(stimmen((206, 188, 144), s), [stimmen((232, 214, 176), s) + (80,), stimmen((180, 160, 120), s) + (70,)], 7),
    "weltraum": lambda s: kachel(stimmen((148, 144, 138), s), [stimmen((120, 116, 112), s) + (150,), stimmen((170, 166, 160), s) + (120,)], 11, tupfen_r=(3, 7), n=26),
}


# —— Dinge um den Bauplatz (3D) ———————————————————————————————————————————


def d_hecke():
    sz = Szene()
    sz.schatten_r = 0.0
    sz.quader(-0.5, 0.5, -0.14, 0.14, 0, 40, "laub", (72, 128, 58))
    for k in range(5):
        sz.kugel(-0.4 + k * 0.2, 0.0, 40, 0.13, "laub", (72, 128, 58), rz=0.08)
    return sz


def d_heuballen():
    sz = Szene()
    sz.schatten_r = 0.0
    for x, y in ((-0.18, 0.05), (0.2, -0.1)):
        sz.walze((x, y, 20), (1, -1, 0), 0.18, 0.28, "holz", (214, 184, 100))
    return sz


def d_obstbaum():
    sz = Szene()
    sz.schatten_r = 0.0
    baum(sz, 0, 0, 120, 0.36, stamm=0.06)
    for k in range(5):
        a = 1.3 * k
        sz.kugel(0.25 * math.cos(a), 0.25 * math.sin(a), 82, 0.03, "glatt", (210, 60, 50))
    return sz


def d_teich():
    sz = Szene()
    sz.schatten_r = 0.0
    sz.kugel(0, 0, 0, 0.55, "glatt", (110, 170, 200), rz=0.03)
    for k in range(8):
        a = 2 * math.pi * k / 8
        sz.kugel(0.58 * math.cos(a), 0.58 * math.sin(a), 2, 0.09, "stein", SOCKEL, rz=0.06)
    for x, y in ((0.15, 0.1), (-0.2, -0.1)):
        sz.kugel(x, y, 2, 0.08, "laub", (86, 150, 66), rz=0.01)
    sz.kugel(0.15, 0.1, 4, 0.03, "glatt", (240, 200, 220))
    return sz


def d_blumenbusch():
    sz = Szene()
    sz.schatten_r = 0.0
    for dx, dy, r in ((0, 0, 0.24), (-0.16, 0.12, 0.16), (0.16, -0.06, 0.17)):
        sz.kugel(dx, dy, 20, r, "laub", (86, 150, 66), rz=r * 0.85)
    for k in range(7):
        a = 2 * math.pi * k / 7
        sz.kugel(0.2 * math.cos(a), 0.2 * math.sin(a), 28, 0.04, "glatt", ((214, 96, 112), (240, 240, 236), (236, 196, 84))[k % 3])
    return sz


def d_koralle_gross():
    sz = Szene()
    sz.schatten_r = 0.0
    sz.kugel(0, 0, 6, 0.36, "koralle", (200, 150, 120), rz=0.12)
    for k in range(8):
        a = 2 * math.pi * k / 8
        x, y = 0.2 * math.cos(a), 0.2 * math.sin(a)
        h = 60 + (k * 13) % 30
        farbe = (KORALLE, (240, 170, 80), (190, 110, 170))[k % 3]
        sz.balken((x * 0.3, y * 0.3, 8), (x, y, h), 0.07, 0.07, "koralle", farbe)
        sz.kugel(x, y, h, 0.06, "koralle", farbe)
    return sz


def d_seetang():
    sz = Szene()
    sz.schatten_r = 0.0
    for k in range(5):
        x = -0.2 + k * 0.1
        h = 60 + (k * 17) % 40
        sz.kugel(x, 0.02 * (k % 3), h / 2, 0.04, "laub", (70, 150, 96), rz=h / 118)
    return sz


def d_unterwasserfels():
    sz = Szene()
    sz.schatten_r = 0.0
    sz.kugel(-0.1, 0, 10, 0.3, "stein", (120, 130, 140), rz=0.25)
    sz.kugel(0.2, -0.05, 6, 0.18, "stein", (130, 140, 150), rz=0.15)
    sz.kugel(0.0, 0.1, 30, 0.08, "koralle", KORALLE)
    return sz


def d_krater():
    sz = Szene()
    sz.schatten_r = 0.0
    for k in range(12):
        a = 2 * math.pi * k / 12
        sz.kugel(0.45 * math.cos(a), 0.45 * math.sin(a), 2, 0.14, "stein", (150, 146, 140), rz=0.07)
    sz.kugel(0, 0, -2, 0.42, "stein", (112, 108, 104), rz=0.02)
    return sz


def d_felsbrocken():
    sz = Szene()
    sz.schatten_r = 0.0
    sz.kugel(-0.08, 0.02, 10, 0.26, "stein", (130, 126, 134), rz=0.2)
    sz.kugel(0.2, -0.1, 6, 0.14, "stein", (150, 146, 150), rz=0.12)
    return sz


def d_kristall():
    sz = Szene()
    sz.schatten_r = 0.0
    for x, y, h, r, f in ((0, 0, 70, 0.1, (176, 120, 220)), (0.14, -0.06, 44, 0.07, (120, 200, 220)), (-0.12, 0.08, 36, 0.06, (220, 120, 200))):
        sz.pyramide(x - r, x + r, y - r, y + r, 0, h, "scheibe", f, ueber=0)
    return sz


def d_schuessel():
    sz = Szene()
    sz.schatten_r = 0.0
    sz.quader(-0.12, 0.12, -0.12, 0.12, 0, 10, "metall", (176, 182, 190))
    sz.zylinder(0, 0, 0.03, 10, 60, "metall", (176, 182, 190), n=10)
    sz.kugel(0, 0, 66, 0.26, "paneel", (226, 230, 236), rz=0.07)
    sz.kugel(0, 0, 76, 0.03, "licht", (255, 90, 80))
    return sz


DINGE = {
    "dorf": {"hecke": d_hecke, "heuballen": d_heuballen, "obstbaum": d_obstbaum, "teich": d_teich},
    "garten": {"teich": d_teich, "hecke": d_hecke, "blumenbusch": d_blumenbusch, "obstbaum": d_obstbaum},
    "unterwasser": {"koralle": d_koralle_gross, "seetang": d_seetang, "fels": d_unterwasserfels, "muschelfels": d_unterwasserfels},
    "weltraum": {"krater": d_krater, "felsbrocken": d_felsbrocken, "kristall": d_kristall, "schuessel": d_schuessel},
}


def main() -> int:
    for thema, horizont in HORIZONTE.items():
        for s in ("tag", "daemmerung", "nacht"):
            ordner = ZIEL / thema / s
            ordner.mkdir(parents=True, exist_ok=True)
            horizont(s).save(ordner / "horizont.png", optimize=True)
            KACHELN[thema](s).save(ordner / "meer.png", optimize=True)
            if s == "nacht" or thema == "weltraum":
                sterne(110 if thema == "weltraum" else 70).save(ordner / "sterne.png", optimize=True)
        (ZIEL / thema / "dinge").mkdir(parents=True, exist_ok=True)
        for name, fn in DINGE[thema].items():
            tag, _ = rendern(fn(), 160, 1, schatten_r=0.0)
            tag.quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG).save(ZIEL / thema / "dinge" / f"{name}.png", optimize=True)
            print(thema, name, tag.size)
    shutil.rmtree(Path(__file__).resolve().parent / "__pycache__", ignore_errors=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
