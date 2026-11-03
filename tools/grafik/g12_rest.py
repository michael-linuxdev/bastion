#!/usr/bin/env python3
"""G12: Umgebung, Kulisse-Dinge, Wesen und Bewohner im Stil „weich gerendert“
(GRAFIK-SPRITES.md §13). Gleiche IDs, Pfade und Maße wie G3; die App lädt unverändert.

- Umgebung (`umgebung/<thema>/…`, 104 breit): Bäume, Busch, Stein, Strauch, Koralle.
- Kulisse-Dinge (`kulisse/bastion/dinge/…`, 160 breit): Felsen, Inselchen, Segelboot.
- Wesen (`wesen/<thema>/<art>_<zyklus>_<n>`, 64 × 64): je 3 Ruhe-, 4 Geh-, 2 Reaktionsbilder.
- Bewohner (`bewohner/<art>_<zyklus>_<n>`, 64 × 64): je 3 Ruhe-, 4 Arbeits-, 2 Reaktionsbilder.

Wesen und Bewohner stehen mit dem Fuß bei (32, 56) wie bisher. Kein Zufall.
Aufruf: python3 tools/grafik/g12_rest.py [umgebung|kulisse|wesen|bewohner …]
"""
from __future__ import annotations

import json
import math
import shutil
import sys
from multiprocessing import Pool
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from g12_modelle import BRUCH, KORALLE, METALL, PANEEL, PERLMUTT, baum  # noqa: E402
from raum import EISEN, HOLZ, LAUB, PETROL, PETROL_HELL, SOCKEL, STEIN, Szene, rendern  # noqa: E402

ATLAS = Path(__file__).resolve().parents[2] / "public" / "grafik" / "atlas"
W_SKALA = 1.0  # Wesen im selben Maßstab wie die Gebäude (§12.2)


def palette(b: Image.Image, pfad: Path) -> None:
    pfad.parent.mkdir(parents=True, exist_ok=True)
    b.quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG).save(pfad, "PNG", optimize=True)


# —— Umgebung ————————————————————————————————————————————————————————————


def u_baum_a():
    sz = Szene()
    sz.schatten_r = 0.4
    baum(sz, 0, 0, 150, 0.46, stamm=0.07)
    return sz


def u_baum_b():
    sz = Szene()
    sz.schatten_r = 0.34
    baum(sz, 0, 0, 112, 0.38, stamm=0.06, farbe=(104, 150, 70))
    return sz


def u_busch():
    sz = Szene()
    sz.schatten_r = 0.34
    for dx, dy, dz, r in ((0, 0, 22, 0.24), (-0.16, 0.12, 16, 0.16), (0.16, -0.06, 18, 0.17)):
        sz.kugel(dx, dy, dz, r, "laub", LAUB, rz=r * 0.85)
    return sz


def u_stein():
    sz = Szene()
    sz.schatten_r = 0.3
    sz.kugel(-0.06, 0.02, 10, 0.24, "stein", SOCKEL, rz=0.2)
    sz.kugel(0.16, -0.08, 6, 0.14, "stein", STEIN, rz=0.12)
    return sz


def u_dorf_a():
    sz = Szene()
    sz.schatten_r = 0.4
    baum(sz, 0, 0, 146, 0.45, stamm=0.07, farbe=(98, 146, 66))
    for k in range(5):
        a = 1.3 * k
        sz.kugel(0.24 * math.cos(a), 0.24 * math.sin(a), 102, 0.03, "glatt", (210, 60, 50))
    return sz


def u_dorf_b():
    sz = Szene()
    sz.schatten_r = 0.34
    baum(sz, 0, 0, 108, 0.37, stamm=0.06, farbe=(110, 156, 74))
    return sz


def u_strauch(blueten):
    def f():
        sz = Szene()
        sz.schatten_r = 0.34
        for dx, dy, dz, r in ((0, 0, 24, 0.26), (-0.18, 0.12, 16, 0.17), (0.18, -0.06, 18, 0.18)):
            sz.kugel(dx, dy, dz, r, "laub", (86, 150, 66), rz=r * 0.85)
        for k in range(6):
            a = 2 * math.pi * k / 6 + 0.4
            sz.kugel(0.2 * math.cos(a), 0.2 * math.sin(a) + 0.05, 30 + 8 * math.sin(a), 0.04, "glatt", blueten[k % len(blueten)])
        return sz

    return f


def u_koralle(farbe, zweig):
    def f():
        sz = Szene()
        sz.schatten_r = 0.32
        sz.kugel(0, 0, 6, 0.26, "koralle", (200, 150, 120), rz=0.1)
        for k in range(zweig):
            a = 2 * math.pi * k / zweig
            x, y = 0.14 * math.cos(a), 0.14 * math.sin(a)
            h = 50 + (k * 13) % 26
            sz.balken((x * 0.3, y * 0.3, 8), (x, y, h), 0.06, 0.06, "koralle", farbe)
            sz.kugel(x, y, h, 0.05, "koralle", farbe)
        return sz

    return f


UMGEBUNG = {
    "bastion": {"baum_a": u_baum_a, "baum_b": u_baum_b, "busch": u_busch, "stein": u_stein},
    "dorf": {"baum_a": u_dorf_a, "baum_b": u_dorf_b},
    "garten": {"strauch_a": u_strauch(((214, 96, 112), (240, 240, 236))), "strauch_b": u_strauch(((236, 196, 84), (176, 120, 196)))},
    "unterwasser": {"koralle_a": u_koralle(KORALLE, 6), "koralle_b": u_koralle((190, 110, 170), 5)},
}


# —— Kulisse-Dinge ————————————————————————————————————————————————————————


def gischt(bild: Image.Image, r: float) -> Image.Image:
    """Weicher Schaumring auf dem Wasser um den Fuß (hinter dem Ding)."""
    w, h = bild.size
    cx, cy = w / 2, h - 4 - 24
    rx, ry = r * 48 * 1.414, r * 24 * 1.414
    ring = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse([cx - rx, cy - ry, cx + rx, cy + ry], outline=(236, 246, 248, 210), width=3)
    ring = ring.filter(ImageFilter.GaussianBlur(1.2))
    ring.alpha_composite(bild)
    return ring


def k_fels(gross):
    def f():
        sz = Szene()
        sz.schatten_r = 0.0
        for x, y, h, r in ((-0.15, 0.05, 30, 0.32), (0.18, -0.1, 18, 0.22), (0.05, 0.25, 12, 0.18)):
            sz.kugel(x * gross, y * gross, 0, r * gross, "stein", (150, 140, 128), rz=h * gross / 58.8 * 0.9)
        return sz

    return f


def k_inselchen():
    sz = Szene()
    sz.schatten_r = 0.0
    sz.kugel(0, 0, 0, 0.62, "sand", (214, 196, 150), rz=0.16)
    sz.kugel(-0.05, -0.05, 4, 0.4, "laub", (110, 156, 88), rz=0.1)
    baum(sz, 0, 0, 80, 0.2, stamm=0.035)
    sz.kugel(0.32, 0.18, 6, 0.1, "stein", (150, 140, 128), rz=0.08)
    return sz


def k_boot():
    sz = Szene()
    sz.schatten_r = 0.0
    sz.kugel(0, 0, 4, 0.42, "holz", HOLZ, rz=0.12)
    sz.quader(-0.3, 0.3, -0.1, 0.1, 4, 10, "holz", (176, 130, 84))
    sz.zylinder(0, 0, 0.018, 8, 86, "holz", (120, 84, 54), n=10)
    sz.balken((0.02, 0, 82), (0.02, -0.36, 16), 0.012, 0.012, "holz", (120, 84, 54))
    for k in range(6):  # Segel aus schmalen Bahnen (Dreieck)
        t0, t1 = k / 6, (k + 1) / 6
        sz.quader(0.0, 0.012, -0.34 * (1 - t0) - 0.02, -0.02, 16 + 66 * t0, 16 + 66 * t1, "tuch", (244, 239, 228))
    sz.quader(0.0, 0.012, 0.02, 0.12, 74, 84, "tuch", SOCKEL)
    return sz


KULISSE = {"fels_1": (k_fels(1.0), 0.55), "fels_2": (k_fels(0.7), 0.4), "inselchen": (k_inselchen, 0.75), "boot": (k_boot, 0.5)}


# —— Wesen und Bewohner ————————————————————————————————————————————————————
# Blick nach rechts im Bild: Richtung (1, −1)/√2. Die App spiegelt für links.

VX, VY = 0.7071, -0.7071  # vorn
QX, QY = 0.7071, 0.7071  # quer (links/rechts des Körpers)


def at(vorn: float, quer: float = 0.0):
    return (VX * vorn + QX * quer, VY * vorn + QY * quer)


def bein(sz, vorn, quer, z0, z1, farbe, phase=0.0, r=0.025):
    a = at(vorn + phase * 0.04, quer)
    b = at(vorn - phase * 0.04, quer)
    sz.balken((b[0], b[1], z0), (a[0], a[1], z1), r * 2, r * 2, "glatt", farbe)


def koerper(sz, vorn, z, lang, breit, hoch, farbe, mat="glatt"):
    """Ellipsoid entlang der Blickrichtung (Annäherung: Kugel, gestreckt über Teilkugeln)."""
    for t in (-0.5, -0.25, 0.0, 0.25, 0.5):
        x, y = at(vorn + t * lang * 0.55)
        sz.kugel(x, y, z, breit * (1 - abs(t) * 0.3), mat, farbe, rz=hoch / 58.8 * (1 - abs(t) * 0.25))


def kopf_punkt(sz, vorn, z, r, farbe, *, augen=True, mat="glatt"):
    x, y = at(vorn)
    sz.kugel(x, y, z, r, mat, farbe)
    if augen:
        for q in (-0.5, 0.5):
            ax, ay = at(vorn + r * 0.75, q * r * 0.9)
            sz.kugel(ax, ay, z + r * 58.8 * 0.25, r * 0.22, "glatt", (30, 26, 22))


def schritt(zyklus: str, frame: int) -> tuple[float, float]:
    """(Beinphase −1…1, Hüpfhöhe in Pixeln)."""
    if zyklus == "walk":
        return ((1, 0, -1, 0)[frame], (0, 1.5, 0, 1.5)[frame])
    if zyklus == "react":
        return (0, (6, 10)[frame])
    return (0, (0, 0.8, 0)[frame])


def w_fuchs(z, f):
    sz = Szene()
    ph, hop = schritt(z, f)
    for vorn, quer, p in ((0.12, -0.05, ph), (0.12, 0.05, -ph), (-0.12, -0.05, -ph), (-0.12, 0.05, ph)):
        bein(sz, vorn, quer, hop, hop + 9, (60, 40, 30), p)
    koerper(sz, 0, hop + 12, 0.34, 0.1, 8, (214, 110, 48))
    kopf_punkt(sz, 0.2, hop + 17, 0.075, (220, 120, 56))
    sx, sy = at(0.28)
    sz.kegel(sx, sy, 0.035, hop + 12, 3, "glatt", (240, 236, 226), n=12)
    for q in (-0.04, 0.04):
        ox, oy = at(0.18, q)
        sz.kegel(ox, oy, 0.028, hop + 20, 5, "glatt", (200, 100, 44), n=10)
    tx, ty = at(-0.26)
    sz.kugel(tx, ty, hop + 14 + (2 if z == "idle" and f == 1 else 0), 0.06, "glatt", (214, 110, 48), rz=0.12)
    ex, ey = at(-0.33)
    sz.kugel(ex, ey, hop + 17, 0.035, "glatt", (244, 240, 232))
    return sz


def vogel(farbe, schnabel, *, gross=1.0, kamm=None):
    def f(z, fr):
        sz = Szene()
        ph, hop = schritt(z, fr)
        g = gross
        if z == "walk":  # Flieger und Hüpfer: Flügel schlagen
            hop += 6
        for q in (-0.025, 0.025):
            bein(sz, 0, q, hop, hop + 6 * g, (226, 170, 60), ph * 0.5, r=0.012)
        koerper(sz, 0, hop + 9 * g, 0.2 * g, 0.075 * g, 7 * g, farbe)
        kopf_punkt(sz, 0.1 * g, hop + 15 * g, 0.05 * g, farbe)
        sx, sy = at(0.16 * g)
        sz.balken((at(0.13 * g)[0], at(0.13 * g)[1], hop + 15 * g), (sx, sy, hop + 14 * g), 0.025 * g, 0.02 * g, "glatt", schnabel)
        flap = (0.0, 1.0, 0.0, -1.0)[fr] if z == "walk" else (1.0 if z == "react" else 0.0)
        for s in (-1, 1):
            wx, wy = at(-0.02, s * 0.07 * g)
            ex, ey = at(-0.08, s * (0.1 + 0.08 * abs(flap)) * g)
            sz.balken((wx, wy, hop + 10 * g), (ex, ey, hop + 10 * g + flap * 8 * g), 0.09 * g, 0.012, "glatt", farbe, quer=(VX, VY, 0))
        if kamm:
            kx, ky = at(0.09 * g)
            sz.kugel(kx, ky, hop + 19 * g, 0.03 * g, "glatt", kamm, rz=0.05)
        return sz

    return f


def w_katze(z, f):
    sz = Szene()
    ph, hop = schritt(z, f)
    for vorn, quer, p in ((0.1, -0.04, ph), (0.1, 0.04, -ph), (-0.1, -0.04, -ph), (-0.1, 0.04, ph)):
        bein(sz, vorn, quer, hop, hop + 8, (170, 130, 84), p)
    koerper(sz, 0, hop + 11, 0.28, 0.085, 7, (196, 156, 104))
    kopf_punkt(sz, 0.17, hop + 17, 0.07, (204, 164, 112))
    for q in (-0.04, 0.04):
        ox, oy = at(0.17, q)
        sz.kegel(ox, oy, 0.025, hop + 20, 7, "glatt", (176, 136, 90), n=10)
    a = at(-0.16)
    b = at(-0.24)
    sz.balken((a[0], a[1], hop + 12), (b[0], b[1], hop + 26 + (3 if f == 1 else 0)), 0.03, 0.03, "glatt", (176, 136, 90))
    return sz


def w_schnecke(z, f):
    sz = Szene()
    _, hop = schritt(z, f)
    ruck = (0, 0.01, 0.02, 0.01)[f] if z == "walk" else 0
    koerper(sz, ruck, 3, 0.26, 0.05, 4, (196, 180, 140))
    kopf_punkt(sz, 0.13 + ruck, 6 + hop * 0.3, 0.04, (196, 180, 140), augen=False)
    for q in (-0.02, 0.02):
        a = at(0.15 + ruck, q)
        sz.balken((a[0], a[1], 8), (a[0] + 0.02, a[1] - 0.02, 15), 0.01, 0.01, "glatt", (176, 160, 120))
    hx, hy = at(-0.02 + ruck)
    sz.kugel(hx, hy, 13 + hop * 0.3, 0.09, "glatt", (176, 112, 70), rz=0.17)
    sz.kugel(hx + 0.02, hy + 0.02, 14 + hop * 0.3, 0.05, "glatt", (210, 150, 96), rz=0.1)
    return sz


def insekt(farbe, fluegel, *, streifen=None, gross=1.0):
    def f(z, fr):
        sz = Szene()
        _, hop = schritt(z, fr)
        hop += 14
        flap = (0.2, 1.0, 0.2, -0.6)[fr] if z == "walk" else (0.6 if z == "idle" and fr == 1 else 0.0)
        koerper(sz, 0, hop, 0.12 * gross, 0.045 * gross, 5 * gross, farbe)
        if streifen:
            for t in (-0.03, 0.02):
                x, y = at(t * gross)
                sz.kugel(x, y, hop, 0.047 * gross, "glatt", streifen, rz=0.02)
        kopf_punkt(sz, 0.07 * gross, hop + 1, 0.03 * gross, (40, 36, 30), augen=False)
        for s in (-1, 1):
            a = at(0, s * 0.03)
            b = at(-0.02, s * 0.13 * gross)
            sz.balken((a[0], a[1], hop + 2), (b[0], b[1], hop + 6 + flap * 6), 0.09 * gross, 0.008, "glatt", fluegel, quer=(VX, VY, 0))
        return sz

    return f


def w_fisch(z, f):
    sz = Szene()
    _, hop = schritt(z, f)
    hop += 14
    wedel = (0.0, 0.03, 0.0, -0.03)[f] if z == "walk" else 0.0
    koerper(sz, 0, hop, 0.24, 0.07, 9, (236, 150, 70))
    kopf_punkt(sz, 0.1, hop + 1, 0.05, (240, 160, 80))
    a, b = at(-0.14), at(-0.24, wedel * 3)
    sz.balken((a[0], a[1], hop), (b[0], b[1], hop), 0.012, 0.12, "glatt", (244, 200, 120), quer=(0, 0, 1))
    m = at(0.0)
    sz.balken((m[0], m[1], hop + 5), (m[0], m[1], hop + 10), 0.08, 0.01, "glatt", (244, 200, 120), quer=(VX, VY, 0))
    return sz


def w_krebs(z, f):
    sz = Szene()
    ph, hop = schritt(z, f)
    for q in (-0.07, -0.04, 0.04, 0.07):
        for s in (-1, 1):
            a = at(0.0, q * 0.6)
            b = at(0.02 * ph * s, q * 1.9)
            sz.balken((a[0], a[1], hop + 5), (b[0], b[1], hop), 0.014, 0.014, "glatt", (190, 70, 50))
    koerper(sz, 0, hop + 6, 0.12, 0.09, 5, (214, 84, 60))
    for q in (-0.07, 0.07):
        cx, cy = at(0.13, q)
        sz.kugel(cx, cy, hop + 9 + (4 if z == "react" else 0), 0.04, "glatt", (224, 96, 68), rz=0.05)
    for q in (-0.025, 0.025):
        ax, ay = at(0.06, q)
        sz.zylinder(ax, ay, 0.008, hop + 8, hop + 14, "glatt", (190, 70, 50), n=8)
        sz.kugel(ax, ay, hop + 15, 0.016, "glatt", (30, 26, 22))
    return sz


def w_qualle(z, f):
    sz = Szene()
    _, hop = schritt(z, f)
    puls = (1.0, 1.08, 1.0, 0.92)[f] if z == "walk" else 1.0
    hop += 12
    for k in range(6):
        a = 2 * math.pi * k / 6
        x, y = 0.07 * math.cos(a), 0.07 * math.sin(a)
        sz.balken((x, y, hop + 6), (x * 1.2, y * 1.2, hop - 8 + 2 * math.sin(a + f)), 0.01, 0.01, "glatt", (220, 170, 220))
    sz.kuppel(0, 0, 0.12 * puls, hop + 4, 12, "glatt", (210, 160, 220))
    return sz


def w_drohne(z, f):
    sz = Szene()
    _, hop = schritt(z, f)
    hop += 16
    sz.zylinder(0, 0, 0.1, hop, hop + 5, "paneel", PANEEL, n=24)
    sz.kugel(0, 0, hop + 6, 0.06, "scheibe", (120, 200, 240), rz=0.05)
    for k in range(4):
        a = math.pi / 4 + k * math.pi / 2
        x, y = 0.16 * math.cos(a), 0.16 * math.sin(a)
        sz.balken((0.06 * math.cos(a), 0.06 * math.sin(a), hop + 3), (x, y, hop + 3), 0.02, 0.02, "metall", METALL)
        sz.zylinder(x, y, 0.06, hop + 5, hop + 6, "glatt", (200, 206, 214), n=16)
    sz.kugel(0, 0, hop - 2, 0.02, "licht", (255, 90, 80) if f % 2 == 0 else (120, 220, 255))
    return sz


def w_roboter(z, f):
    sz = Szene()
    ph, hop = schritt(z, f)
    for q in (-0.05, 0.05):
        x, y = at(0.0, q)
        sz.walze((x, y, hop + 4), (QX, QY, 0), 0.04, 0.03, "metall", (80, 86, 96))
    sz.quader(-0.07, 0.07, -0.07, 0.07, hop + 6, hop + 22, "paneel", PANEEL)
    sz.quader(-0.05, 0.05, -0.05, 0.05, hop + 22, hop + 32, "paneel", PANEEL)
    ex, ey = at(0.05)
    sz.kugel(ex, ey, hop + 28, 0.025, "licht", (120, 220, 255))
    sz.zylinder(0, 0, 0.008, hop + 32, hop + 40, "metall", METALL, n=8)
    sz.kugel(0, 0, hop + 41, 0.016, "licht", (255, 90, 80))
    for s in (-1, 1):
        a = at(0, s * 0.08)
        b = at(0.04 + 0.03 * ph * s, s * 0.09)
        sz.balken((a[0], a[1], hop + 19), (b[0], b[1], hop + 10 + (10 if z == "react" else 0)), 0.02, 0.02, "metall", METALL)
    return sz


# Personen (Wache und Bewohner)
HAUT = (240, 212, 186)


def person(kleid, kopfteil, *, klein=1.0, werkzeug=None, zyklus_arbeit="arbeit"):
    def f(z, fr):
        sz = Szene()
        k = klein
        if z == "arbeit":  # leichtes Wippen bei der Arbeit
            ph, hop = 0.0, (0.0, 0.6, 1.0, 0.6)[fr % 4]
        else:
            ph, hop = schritt(z, fr)
        hose = tuple(max(0, c - 46) for c in kleid)
        for q in (-0.03, 0.03):
            bein(sz, 0, q, hop, hop + 10 * k, hose, ph if q < 0 else -ph, r=0.018)
            fx, fy = at(0.01, q)
            sz.kugel(fx, fy, hop + 1, 0.025, "glatt", (60, 42, 30), rz=0.02)
        sz.kegel(0, 0, 0.075 * k, hop + 8 * k, 26 * k, "glatt", kleid, n=20)
        sz.zylinder(0, 0, 0.06 * k, hop + 10 * k, hop + 22 * k, "glatt", kleid, n=20)
        kz = hop + 27.5 * k
        kopf_punkt(sz, 0.0, kz, 0.065 * k, HAUT)
        kopfteil(sz, kz, k)
        # Arme: hinten hängt, vorn nach Zyklus
        if z == "react":
            winkel = 150 + fr * 15
        elif z in ("arbeit", "walk") and werkzeug is not None and z == "arbeit":
            winkel = (20, 55, 80, 55)[fr % 4]
        elif z == "walk":
            winkel = 20 * ph
        else:
            winkel = 12
        for s in (-1, 1):
            sx, sy = at(0.0, s * 0.07 * k)
            w = winkel if s > 0 else 8
            a = math.radians(w)
            hx, hy = at(math.sin(a) * 0.12 * k, s * 0.075 * k)
            hz = hop + 21 * k - math.cos(a) * 10 * k
            sz.balken((sx, sy, hop + 21 * k), (hx, hy, hz), 0.035 * k, 0.035 * k, "glatt", tuple(min(255, c + 6) for c in kleid))
            sz.kugel(hx, hy, hz, 0.02 * k, "glatt", HAUT)
            if s > 0 and werkzeug is not None and z == "arbeit":
                werkzeug(sz, (hx, hy, hz), fr)
        return sz

    return f


def kappe(farbe, form):
    def f(sz, kz, k):
        if form == "zipfel":
            sz.kegel(0, 0, 0.07 * k, kz + 2, 16 * k, "glatt", farbe, n=16)
            bx, by = at(0.04)
            sz.kegel(bx, by, 0.05 * k, kz - 10 * k, 8 * k, "glatt", (244, 240, 232), n=12)
        elif form == "hut":
            sz.zylinder(0, 0, 0.11 * k, kz + 3, kz + 4, "glatt", farbe, n=20)
            sz.zylinder(0, 0, 0.05 * k, kz + 4, kz + 9, "glatt", farbe, n=16)
        elif form == "barett":
            sz.kugel(0, 0, kz + 4, 0.07 * k, "glatt", farbe, rz=0.04)
        elif form == "helm":
            sz.kuppel(0, 0, 0.07 * k, kz + 1, 6, "metall", (176, 182, 190))
        elif form == "kappe":
            sz.kuppel(0, 0, 0.068 * k, kz + 2, 5, "glatt", farbe)
        elif form == "schleier":
            sz.zylinder(0, 0, 0.1 * k, kz + 3, kz + 4, "glatt", farbe, n=20)
            sz.zylinder(0, 0, 0.075 * k, kz - 6, kz + 3, "glatt", (236, 236, 226), n=16)

    return f


def wz_hammer(sz, h, fr):
    sz.balken(h, (h[0] + 0.02, h[1] - 0.02, h[2] + 12), 0.015, 0.015, "holz", HOLZ)
    sz.quader(h[0] - 0.02, h[0] + 0.05, h[1] - 0.05, h[1] + 0.02, h[2] + 10, h[2] + 15, "metall", (140, 146, 156))


def wz_spaten(sz, h, fr):
    sz.balken((h[0], h[1], h[2] + 8), (h[0] + 0.03, h[1] - 0.03, h[2] - 18), 0.014, 0.014, "holz", HOLZ)
    sz.quader(h[0] + 0.01, h[0] + 0.06, h[1] - 0.06, h[1] - 0.01, h[2] - 26, h[2] - 16, "metall", (140, 146, 156))


def wz_buch(sz, h, fr):
    sz.quader(h[0] - 0.03, h[0] + 0.03, h[1] - 0.03, h[1] + 0.03, h[2] - 2, h[2] + 4, "glatt", (150, 40, 40))


def wz_speer(sz, h, fr):
    sz.balken((h[0], h[1], h[2] - 20), (h[0], h[1], h[2] + 30), 0.014, 0.014, "holz", HOLZ)
    sz.kegel(h[0], h[1], 0.02, h[2] + 30, 8, "metall", (176, 182, 190), n=10)


def wz_imker(sz, h, fr):
    sz.zylinder(h[0], h[1], 0.03, h[2] - 4, h[2] + 4, "metall", (140, 146, 156), n=12)
    if fr % 2:
        sz.kugel(h[0] + 0.03, h[1] - 0.03, h[2] + 10, 0.015, "glatt", (240, 200, 60))


WESEN = {
    "bastion": {"moewe": vogel((244, 244, 240), (236, 180, 60), gross=1.2), "fuchs": w_fuchs, "wache": person((106, 122, 138), kappe(None, "helm"), werkzeug=wz_speer)},
    "dorf": {"huhn": vogel((240, 234, 220), (236, 180, 60), kamm=(210, 60, 50)), "katze": w_katze, "spatz": vogel((140, 110, 80), (80, 70, 60), gross=0.75)},
    "garten": {"biene": insekt((236, 196, 60), (220, 236, 244), streifen=(50, 44, 40)), "schmetterling": insekt((80, 60, 50), (236, 140, 70), gross=1.3), "schnecke": w_schnecke},
    "unterwasser": {"fisch": w_fisch, "krebs": w_krebs, "qualle": w_qualle},
    "weltraum": {"drohne": w_drohne, "roboter": w_roboter},
}
BEWOHNER = {
    "zwerg": person((196, 92, 74), kappe((176, 58, 46), "zipfel"), klein=0.8, werkzeug=wz_hammer),
    "gaertner": person((90, 143, 74), kappe((210, 180, 110), "hut"), werkzeug=wz_spaten),
    "bibliothek": person((106, 106, 170), kappe((74, 74, 136), "barett"), werkzeug=wz_buch),
    "torhueter": person((106, 122, 138), kappe((74, 90, 106), "helm"), werkzeug=wz_speer),
    "handwerk": person((138, 106, 58), kappe((90, 64, 48), "kappe"), werkzeug=wz_hammer),
    "imker": person((201, 160, 58), kappe((232, 216, 120), "schleier"), werkzeug=wz_imker),
}
WESEN_ZYKLEN = {"idle": 3, "walk": 4, "react": 2}
BEWOHNER_ZYKLEN = {"idle": 3, "arbeit": 4, "react": 2}


def figur(sz: Szene) -> Image.Image:
    tag, _ = rendern(sz, 64, 1, s=4, fest=(64, 56))
    schatten = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    ImageDraw.Draw(schatten).ellipse([23, 53, 41, 59], fill=(0, 0, 0, 46))
    schatten = schatten.filter(ImageFilter.GaussianBlur(1))
    schatten.alpha_composite(tag)
    return schatten


# —— Aufträge ——————————————————————————————————————————————————————————


def job(a):
    art, name, *rest = a
    if art == "umgebung":
        thema = rest[0]
        sz = UMGEBUNG[thema][name]()
        tag, _ = rendern(sz, 104, 1)
        rel = f"umgebung/{thema}/{name}.png"
        palette(tag, ATLAS / rel)
        return (f"{thema}/umgebung/{name}", rel, tag.size)
    if art == "kulisse":
        fn, r = KULISSE[name]
        tag, _ = rendern(fn(), 160, 1, schatten_r=0.0)
        tag = gischt(tag, r)
        rel = f"kulisse/bastion/dinge/{name}.png"
        palette(tag, ATLAS / rel)
        return (None, rel, tag.size)
    if art == "wesen":
        thema, zyklus, i = rest
        bild = figur(WESEN[thema][name](zyklus, i))
        rel = f"wesen/{thema}/{name}_{zyklus}_{i}.png"
        bild.save(ATLAS / rel, "PNG", optimize=True)
        return (f"wesen/{thema}/{name}_{zyklus}_{i}", rel, bild.size)
    zyklus, i = rest
    bild = figur(BEWOHNER[name](zyklus, i))
    rel = f"bewohner/{name}_{zyklus}_{i}.png"
    bild.save(ATLAS / rel, "PNG", optimize=True)
    return (f"bewohner/{name}_{zyklus}_{i}", rel, bild.size)


def main() -> int:
    teile = sys.argv[1:] or ["umgebung", "kulisse", "wesen", "bewohner"]
    jobs = []
    if "umgebung" in teile:
        jobs += [("umgebung", n, t) for t, d in UMGEBUNG.items() for n in d]
    if "kulisse" in teile:
        jobs += [("kulisse", n) for n in KULISSE]
    if "wesen" in teile:
        jobs += [("wesen", n, t, z, i) for t, d in WESEN.items() for n in d for z, k in WESEN_ZYKLEN.items() for i in range(k)]
    if "bewohner" in teile:
        jobs += [("bewohner", n, z, i) for n in BEWOHNER for z, k in BEWOHNER_ZYKLEN.items() for i in range(k)]
    manifest_pfad = ATLAS / "manifest.json"
    manifest = json.loads(manifest_pfad.read_text(encoding="utf-8"))
    nach_id = {e["id"]: e for e in manifest["eintraege"]}
    with Pool(4) as pool:
        for id_, rel, (w, h) in pool.imap_unordered(job, jobs):
            if id_ is None:
                continue
            if id_ not in nach_id:
                raise SystemExit(f"unbekannte ID {id_}")
            nach_id[id_]["datei"] = rel
            nach_id[id_]["pixel"] = {"w": w, "h": h}
    manifest_pfad.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    shutil.rmtree(Path(__file__).resolve().parent / "__pycache__", ignore_errors=True)
    print(len(jobs), "Bilder geschrieben")
    return 0


if __name__ == "__main__":
    sys.exit(main())
