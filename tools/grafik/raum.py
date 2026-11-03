"""G12: eigener 3D-Renderer für die Bilder der Bastion, Stil „weich gerendert“
(Wahl PV 03.11.2026, GRAFIK-SPRITES.md §13).

Gebäude werden als Körper beschrieben (Quader, Zylinder, Kegel, Pyramide,
Satteldach, Kuppel, Kugel) und berechnet: Licht von rechts oben, weiche
Eigenschatten, Umgebungsverdeckung, Materialien aus festen Mustern (Mauerwerk,
Ziegel, Schiefer, Schindel, Kupfer, Holz, Putz, Fachwerk, Laub) und durchsichtiges
Glas. Fenster und Türen sind Einlagen auf den Flächen. Gleiche Eingabe ergibt das
gleiche Bild (kein Zufall); nur numpy und Pillow, keine neue Abhängigkeit.

Raster wie iso.ts und G3: Bildpunkt = (Mitte + (x − y) · 48, Boden + (x + y) · 24 − z),
x und y in Feldern, z in Pixeln (doppelte Größe). Intern eine echte
Parallelprojektion (Blick 30° von oben); eine Einheit Höhe sind 58,79 Pixel.
"""
from __future__ import annotations

import math
from dataclasses import dataclass, field

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HW, HH = 48, 24
ZE = 48 * 2 / math.sqrt(2) * math.cos(math.radians(30))  # Pixel je Höheneinheit = 58,79
SICHT = np.array([1.0, 1.0, 48 / ZE])
SICHT /= np.linalg.norm(SICHT)  # zum Betrachter
LICHT = np.array([0.55, 0.15, 0.82])
LICHT /= np.linalg.norm(LICHT)

# Palette (GRAFIK-SPRITES.md §12.5 und §13)
STEIN = (176, 164, 146)
SOCKEL = (150, 138, 122)
HOLZ = (150, 104, 64)
BALKEN = (92, 62, 40)
PUTZ = (236, 226, 204)
SCHINDEL = (112, 82, 58)
ZIEGEL = (196, 96, 58)
SCHIEFER = (96, 104, 118)
KUPFER = (92, 156, 138)
PETROL = (31, 122, 114)
PETROL_HELL = (61, 190, 165)
GOLD = (214, 182, 104)
LAUB = (92, 140, 64)
GLAS = (190, 222, 230)
ERDE = (110, 78, 52)
EISEN = (58, 62, 66)


def lin(c) -> np.ndarray:
    a = np.asarray(c[:3], dtype=np.float64) / 255
    return np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)


def srgb(a: np.ndarray) -> np.ndarray:
    a = np.clip(a, 0, 1)
    return np.where(a <= 0.0031308, a * 12.92, 1.055 * a ** (1 / 2.4) - 0.055)


def hashf(*k: np.ndarray) -> np.ndarray:
    """Feste Pseudozahl 0…1 aus ganzen Zahlen (je Stein, je Brett); kein Zufall."""
    x = np.zeros_like(k[0], dtype=np.uint32) + np.uint32(2166136261)
    for v in k:
        x = (x ^ v.astype(np.int64).astype(np.uint32)) * np.uint32(16777619)
        x ^= x >> np.uint32(13)
    x = x * np.uint32(1274126177)
    x ^= x >> np.uint32(16)
    return (x & np.uint32(0xFFFFFF)).astype(np.float64) / 0xFFFFFF


def rauschen(a: np.ndarray, b: np.ndarray, f: float) -> np.ndarray:
    """Weiches Wertrauschen auf festem Gitter."""
    a, b = a * f, b * f
    ia, ib = np.floor(a), np.floor(b)
    fa, fb = a - ia, b - ib
    fa, fb = fa * fa * (3 - 2 * fa), fb * fb * (3 - 2 * fb)
    ia, ib = ia.astype(np.int64), ib.astype(np.int64)
    v00, v10 = hashf(ia, ib), hashf(ia + 1, ib)
    v01, v11 = hashf(ia, ib + 1), hashf(ia + 1, ib + 1)
    return (v00 * (1 - fa) + v10 * fa) * (1 - fb) + (v01 * (1 - fa) + v11 * fa) * fb


def _z(zpx: float) -> float:
    return zpx / ZE


# —— Körper ————————————————————————————————————————————————————————————


@dataclass
class Koerper:
    ebenen: np.ndarray | None  # (k, 4): n·p ≤ d
    mat: str
    farbe: tuple
    ecken: np.ndarray
    kugel: tuple | None = None  # (cx, cy, cz, rx, ry, rz, zmin)
    rund: tuple | None = None  # (cx, cy): Muster folgen dem Umfang
    giebel: tuple | None = None  # Satteldach: Farbe der Giebelflächen
    rahmen: tuple | None = None  # Quader: (x0, x1, y0, y1, z0, z1) für Fachwerk und Glasrahmen
    mitte: np.ndarray = field(default_factory=lambda: np.zeros(3))
    radius: float = 0.0


class Szene:
    def __init__(self) -> None:
        self.koerper: list[Koerper] = []
        self.einlagen: list[dict] = []
        self.schatten_r = 1.0

    def _neu(self, ebenen, mat, farbe, ecken, **kw) -> Koerper:
        roh = np.array(ebenen, dtype=np.float64)
        laenge = np.linalg.norm(roh[:, :3], axis=1, keepdims=True).clip(1e-12)
        e = roh / laenge
        ecken = np.array(ecken, dtype=np.float64)
        m = ecken.mean(axis=0)
        k = Koerper(e, mat, farbe, ecken, mitte=m, radius=float(np.linalg.norm(ecken - m, axis=1).max()) + 1e-3, **kw)
        self.koerper.append(k)
        return k

    def quader(self, x0, x1, y0, y1, z0, z1, mat="stein", farbe=STEIN) -> Koerper:
        a, b = _z(z0), _z(z1)
        eb = [(1, 0, 0, x1), (-1, 0, 0, -x0), (0, 1, 0, y1), (0, -1, 0, -y0), (0, 0, 1, b), (0, 0, -1, -a)]
        ecken = [(x, y, z) for x in (x0, x1) for y in (y0, y1) for z in (a, b)]
        return self._neu(eb, mat, farbe, ecken, rahmen=(x0, x1, y0, y1, a, b))

    def zylinder(self, cx, cy, r, z0, z1, mat="stein", farbe=STEIN, n=40) -> Koerper:
        a, b = _z(z0), _z(z1)
        eb = [(0, 0, 1, b), (0, 0, -1, -a)]
        for i in range(n):
            w = 2 * math.pi * (i + 0.5) / n
            eb.append((math.cos(w), math.sin(w), 0, cx * math.cos(w) + cy * math.sin(w) + r))
        ecken = [(cx + r * sx, cy + r * sy, z) for sx in (-1, 1) for sy in (-1, 1) for z in (a, b)]
        return self._neu(eb, mat, farbe, ecken, rund=(cx, cy))

    def kegel(self, cx, cy, r, z, h, mat="ziegel", farbe=ZIEGEL, n=40):
        z0, hh = _z(z), _z(h)
        eb = [(0, 0, -1, -z0)]
        for i in range(n):
            w = 2 * math.pi * (i + 0.5) / n
            nx, ny, nz = math.cos(w) * hh, math.sin(w) * hh, r
            eb.append((nx, ny, nz, nx * cx + ny * cy + r * hh + r * z0))
        ecken = [(cx + r * sx, cy + r * sy, z0) for sx in (-1, 1) for sy in (-1, 1)] + [(cx, cy, z0 + hh)]
        self._neu(eb, mat, farbe, ecken, rund=(cx, cy))
        return (cx, cy, z + h)

    def pyramide(self, x0, x1, y0, y1, z, h, mat="ziegel", farbe=ZIEGEL, ueber=0.12):
        x0, x1, y0, y1 = x0 - ueber, x1 + ueber, y0 - ueber, y1 + ueber
        z0, hh = _z(z), _z(h)
        mx, my = (x0 + x1) / 2, (y0 + y1) / 2
        ax, ay = (x1 - x0) / 2, (y1 - y0) / 2
        eb = [(0, 0, -1, -z0)]
        for sx, sy, a in ((1, 0, ax), (-1, 0, ax), (0, 1, ay), (0, -1, ay)):
            nx, ny, nz = sx * hh, sy * hh, a
            eb.append((nx, ny, nz, nx * mx + ny * my + a * hh + a * z0))
        ecken = [(x, y, z0) for x in (x0, x1) for y in (y0, y1)] + [(mx, my, z0 + hh)]
        self._neu(eb, mat, farbe, ecken)
        return (mx, my, z + h)

    def satteldach(self, x0, x1, y0, y1, z, h, mat="ziegel", farbe=ZIEGEL, ueber=0.12, giebel=PUTZ, *, quer=False):
        """First entlang x (quer=True: entlang y). Giebelflächen in Wandfarbe."""
        if quer:
            a, b = y0 - ueber, y1 + ueber
            c0, c1 = x0 - ueber, x1 + ueber
        else:
            a, b = x0 - ueber, x1 + ueber
            c0, c1 = y0 - ueber, y1 + ueber
        z0, hh = _z(z) - _z(3), _z(h) + _z(3)
        m, ah = (c0 + c1) / 2, (c1 - c0) / 2
        if quer:
            eb = [(0, 1, 0, b), (0, -1, 0, -a), (0, 0, -1, -z0)]
            for s in (1, -1):
                eb.append((s * hh, 0, ah, s * hh * m + ah * hh + ah * z0))
            ecken = [(x, y, z0) for x in (c0, c1) for y in (a, b)] + [(m, a, z0 + hh), (m, b, z0 + hh)]
        else:
            eb = [(1, 0, 0, b), (-1, 0, 0, -a), (0, 0, -1, -z0)]
            for s in (1, -1):
                eb.append((0, s * hh, ah, s * hh * m + ah * hh + ah * z0))
            ecken = [(x, y, z0) for x in (a, b) for y in (c0, c1)] + [(a, m, z0 + hh), (b, m, z0 + hh)]
        self._neu(eb, mat, farbe, ecken, giebel=giebel, rund=("quer",) if quer else None)

    def kuppel(self, cx, cy, r, z, h, mat="kupfer", farbe=KUPFER):
        z0, hh = _z(z), _z(h)
        ecken = np.array([(cx - r, cy - r, z0), (cx + r, cy + r, z0 + hh)])
        k = Koerper(None, mat, farbe, ecken, kugel=(cx, cy, z0, r, r, hh, z0), mitte=np.array([cx, cy, z0 + hh / 2]), radius=max(r, hh) * 1.5, rund=(cx, cy))
        self.koerper.append(k)
        return (cx, cy, z + h)

    def kugel(self, cx, cy, z, r, mat="laub", farbe=LAUB, rz=None):
        cz = _z(z)
        rz = r if rz is None else rz
        ecken = np.array([(cx - r, cy - r, cz - rz), (cx + r, cy + r, cz + rz)])
        k = Koerper(None, mat, farbe, ecken, kugel=(cx, cy, cz, r, r, rz, -99.0), mitte=np.array([cx, cy, cz]), radius=max(r, rz) * 1.01)
        self.koerper.append(k)

    # —— zusammengesetzte Bauteile ——
    def zinnen(self, x0, x1, y0, y1, z, h=16, n=4, w=0.15, farbe=STEIN, mat="stein"):
        """Brüstung mit Zinnen auf allen vier Seiten; Oberkante Brüstung bei z."""
        self.quader(x0, x1, y0, y1, z - 8, z, mat, farbe)
        for k in range(n):
            a = x0 + (x1 - x0) * k / n
            b = y0 + (y1 - y0) * k / n
            lx, ly = (x1 - x0) / n, (y1 - y0) / n
            for qx0, qx1, qy0, qy1 in (
                (a + lx * 0.15, a + lx * 0.62, y1 - w, y1),
                (a + lx * 0.15, a + lx * 0.62, y0, y0 + w),
                (x1 - w, x1, b + ly * 0.15, b + ly * 0.62),
                (x0, x0 + w, b + ly * 0.15, b + ly * 0.62),
            ):
                self.quader(qx0, qx1, qy0, qy1, z, z + h, mat, farbe)

    def fahne(self, spitze, hoehe=40, farbe=PETROL_HELL):
        x, y, z = spitze
        self.zylinder(x, y, 0.016, z - 4, z + hoehe, "stange", (240, 236, 226), n=10)
        self.quader(x - 0.008, x + 0.008, y - 0.27, y - 0.015, z + hoehe - 22, z + hoehe - 3, "tuch", farbe)

    def banner(self, seite, u, w, z_oben, laenge, farbe=PETROL):
        """Banner flach an der Wand (seite 'r': Fläche x = w; 'l': Fläche y = w)."""
        if seite == "r":
            self.quader(w, w + 0.025, u - 0.11, u + 0.11, z_oben - laenge, z_oben, "tuch", farbe)
        else:
            self.quader(u - 0.11, u + 0.11, w, w + 0.025, z_oben - laenge, z_oben, "tuch", farbe)

    # —— Einlagen ——
    def fenster(self, seite: str, u: float, w: float, z: float, b: float = 0.16, h: float = 22, *, art="fenster", bogen=True):
        """seite 'l': Fläche y = w (Breite entlang x um u); 'r': Fläche x = w (entlang y um u)."""
        self.einlagen.append(dict(seite=seite, u=u, w=w, z0=_z(z), b=b, h=_z(h), art=art, bogen=bogen))

    def fenster_rund(self, cx, cy, r, winkel, z, b=0.12, h=20, *, art="fenster"):
        self.einlagen.append(dict(seite="rund", cx=cx, cy=cy, r=r, winkel=winkel, z0=_z(z), b=b, h=_z(h), art=art, bogen=True))


# —— Strahlen ———————————————————————————————————————————————————————————


def schnitt(sz: Szene, o, d, *, tmax=np.inf, nur_treffer=False, ohne=frozenset(), auswahl=None):
    """Nächster Treffer je Strahl: t, Körper-Index, Normale. `auswahl(k)` liefert die
    Strahlen, die Körper k überhaupt treffen können (Bildausschnitt), sonst Kugeltest."""
    n = o.shape[0]
    best = np.full(n, np.inf)
    idx = np.full(n, -1)
    nor = np.zeros((n, 3))
    for ki, k in enumerate(sz.koerper):
        if ki in ohne:
            continue
        if auswahl is not None:
            sel = auswahl(k)
        else:
            oc = o - k.mitte
            bq = np.einsum("ij,ij->i", oc, d)
            cq = np.einsum("ij,ij->i", oc, oc) - k.radius**2
            disk = bq * bq - cq
            kand = (disk >= 0) & (-bq + np.sqrt(np.maximum(disk, 0)) > 1e-6)
            if nur_treffer:
                kand &= idx < 0
            sel = np.nonzero(kand)[0]
        if sel.size == 0:
            continue
        oo, dd = o[sel], d[sel]
        if k.ebenen is not None:
            E = k.ebenen
            num = E[:, 3][None, :] - oo @ E[:, :3].T
            den = dd @ E[:, :3].T
            with np.errstate(divide="ignore", invalid="ignore"):
                t = num / den
            ein = np.where(den < -1e-12, t, -np.inf)
            aus = np.where(den > 1e-12, t, np.inf)
            draussen = ((np.abs(den) <= 1e-12) & (num < 0)).any(axis=1)
            t0 = ein.max(axis=1)
            t1 = aus.min(axis=1)
            ok = (t0 < t1) & (t0 > 1e-5) & ~draussen & (t0 < tmax)
            nn = E[ein.argmax(axis=1), :3]
        else:
            cx, cy, cz, rx, ry, rz, zmin = k.kugel
            s = np.array([rx, ry, rz])
            ol = (oo - np.array([cx, cy, cz])) / s
            dl = dd / s
            a = np.einsum("ij,ij->i", dl, dl)
            bb = np.einsum("ij,ij->i", ol, dl)
            cc = np.einsum("ij,ij->i", ol, ol) - 1
            disk = bb * bb - a * cc
            t0 = (-bb - np.sqrt(np.maximum(disk, 0))) / a
            pz = oo[:, 2] + t0 * dd[:, 2]
            ok = (disk >= 0) & (t0 > 1e-5) & (pz >= zmin - 1e-6) & (t0 < tmax)
            pp = ol + t0[:, None] * dl
            nn = pp / s
            nn /= np.linalg.norm(nn, axis=1, keepdims=True).clip(1e-9)
        besser = ok & (t0 < best[sel])
        w = sel[besser]
        best[w] = t0[besser]
        idx[w] = ki
        nor[w] = nn[besser]
    return best, idx, nor


def halbkugel(n: np.ndarray, k: int) -> list[np.ndarray]:
    hilf = np.where(np.abs(n[:, 2:3]) < 0.9, np.array([[0, 0, 1.0]]), np.array([[1.0, 0, 0]]))
    t1 = np.cross(n, hilf)
    t1 /= np.linalg.norm(t1, axis=1, keepdims=True)
    t2 = np.cross(n, t1)
    aus = []
    for i in range(k):
        w = 2 * math.pi * (i + 0.37) / k
        el = 0.3 + 0.55 * ((i * 5) % k) / k
        r = math.sqrt(1 - el * el)
        aus.append(n * el + t1 * (r * math.cos(w)) + t2 * (r * math.sin(w)))
    return aus


# —— Material ———————————————————————————————————————————————————————————


def material(k: Koerper, p: np.ndarray, n: np.ndarray):
    """Farbe (linear), Knick (Licht auf kleinen Kanten) und Glanz je Treffer."""
    m = p.shape[0]
    oben = n[:, 2] > 0.95
    if k.rund is not None and k.rund[0] != "quer":
        rx, ry = k.rund
        w = np.arctan2(p[:, 1] - ry, p[:, 0] - rx)
        a = w * np.maximum(np.hypot(p[:, 0] - rx, p[:, 1] - ry), 0.05)
    else:
        a = np.where(np.abs(n[:, 0]) > np.abs(n[:, 1]), p[:, 1], p[:, 0])
    b = np.where(oben, p[:, 1] + p[:, 0] * 0.3, p[:, 2])
    farbe = np.repeat(lin(k.farbe)[None, :], m, axis=0)
    knick = np.zeros(m)
    glanz = np.full(m, 0.04)
    mat = k.mat
    if mat == "stein":
        hoehe, laenge = 0.2, 0.34
        reihe = np.floor(b / hoehe)
        versatz = (reihe % 2) * 0.5
        spalte = np.floor(a / laenge + versatz)
        fa = a / laenge + versatz - spalte
        fb = b / hoehe - reihe
        ton = hashf(reihe.astype(np.int64), spalte.astype(np.int64))
        farbe *= (0.84 + 0.3 * ton)[:, None]
        farbe *= np.array([1.04, 1.0, 0.97])[None, :] ** (ton[:, None] - 0.5)
        fuge = ((np.minimum(fb, 1 - fb) < 0.07) | (np.minimum(fa, 1 - fa) * laenge / hoehe < 0.05)) & ~oben
        farbe[fuge] *= 0.55
        knick = np.where(~fuge & (fb > 0.78), 0.5, np.where(~fuge & (fb < 0.2), -0.4, 0))
        farbe *= (0.92 + 0.16 * rauschen(a, b, 9))[:, None]
    elif mat in ("ziegel", "schiefer", "schindel"):
        hoehe = {"ziegel": 0.085, "schiefer": 0.07, "schindel": 0.075}[mat]
        laenge = {"ziegel": 0.12, "schiefer": 0.15, "schindel": 0.1}[mat]
        reihe = np.floor(b / hoehe)
        fb = b / hoehe - reihe
        spalte = np.floor(a / laenge + (reihe % 2) * 0.5)
        fa = a / laenge + (reihe % 2) * 0.5 - spalte
        ton = hashf(reihe.astype(np.int64), spalte.astype(np.int64) + 7)
        farbe *= (0.84 + 0.3 * ton)[:, None]
        farbe *= (0.62 + 0.5 * fb)[:, None]
        farbe[np.minimum(fa, 1 - fa) < 0.06] *= 0.7
        knick = (fb - 0.5) * 0.9
        if mat == "schindel":
            farbe *= (0.9 + 0.12 * np.sin(a * 120 + ton * 6))[:, None]
    elif mat == "kupfer":
        fa = a / 0.16 - np.floor(a / 0.16)
        farbe *= (0.9 + 0.2 * rauschen(a, b, 6))[:, None]
        naht = np.minimum(fa, 1 - fa) < 0.08
        farbe[naht] *= 1.25
        knick = np.where(naht, 0.6, 0)
        glanz[:] = 0.35
    elif mat == "holz":
        brett = np.floor(a / 0.11)
        fa = a / 0.11 - brett
        ton = hashf(brett.astype(np.int64), np.zeros_like(brett, dtype=np.int64) + 3)
        farbe *= (0.82 + 0.3 * ton)[:, None]
        farbe *= (0.92 + 0.08 * np.sin(b * 40 + 8 * rauschen(a, b * 0.2, 14) + brett * 1.3))[:, None]
        farbe[np.minimum(fa, 1 - fa) < 0.06] *= 0.55
    elif mat == "putz":
        farbe *= (0.94 + 0.1 * rauschen(a, b, 11))[:, None]
    elif mat == "fachwerk" and k.rahmen is not None:
        x0, x1, y0, y1, z0, z1 = k.rahmen
        farbe *= (0.94 + 0.1 * rauschen(a, b, 11))[:, None]
        links = np.abs(n[:, 1]) > np.abs(n[:, 0])
        u = np.where(links, (p[:, 0] - x0) / (x1 - x0), (y1 - p[:, 1]) / (y1 - y0))
        v = (p[:, 2] - z0) / (z1 - z0)
        breite = 0.045 / np.where(links, x1 - x0, y1 - y0)
        hb = 0.06 / max(z1 - z0, 0.1)
        balken = (np.minimum(np.abs(v - 0.02), np.abs(v - 0.98)) < hb) | (np.abs(v - 0.5) < hb * 0.8)
        for s in (0.02, 0.34, 0.66, 0.98):
            balken |= np.abs(u - s) < breite
        balken |= (np.abs((u - 0.02) / 0.32 - (v - 0.5) / 0.48) < 0.08) & (u < 0.34) & (v > 0.5)
        balken |= (np.abs((0.98 - u) / 0.32 - (v - 0.5) / 0.48) < 0.08) & (u > 0.66) & (v > 0.5)
        balken &= ~oben
        farbe[balken] = lin(BALKEN) * (0.9 + 0.2 * rauschen(a[balken], b[balken], 30))[:, None]
    elif mat == "laub":
        r = rauschen(p[:, 0] * 1.3 + p[:, 2], p[:, 1] * 1.3 - p[:, 2], 11)
        farbe *= (0.7 + 0.55 * r)[:, None]
        knick = (r - 0.5) * 1.2
    elif mat == "erde":
        farbe *= (0.85 + 0.25 * rauschen(a, b, 25))[:, None]
    elif mat in ("stange", "gold", "eisen"):
        glanz[:] = 0.5 if mat == "gold" else 0.25
    elif mat == "glas":
        glanz[:] = 0.7
    elif mat == "glatt":
        farbe *= (0.96 + 0.06 * rauschen(a, b, 7))[:, None]
    return farbe, knick, glanz


def einlage(sz: Szene, p: np.ndarray, n: np.ndarray) -> np.ndarray:
    """Fenster und Türen: 0 nichts, 1 Glas, 2 Rahmen, 3 Tür, 4 Beschlag."""
    art = np.zeros(p.shape[0], dtype=np.int8)
    for e in sz.einlagen:
        if e["seite"] == "l":
            auf = (np.abs(p[:, 1] - e["w"]) < 0.015) & (n[:, 1] > 0.9)
            u = p[:, 0] - e["u"]
        elif e["seite"] == "r":
            auf = (np.abs(p[:, 0] - e["w"]) < 0.015) & (n[:, 0] > 0.9)
            u = -(p[:, 1] - e["u"])
        else:
            w = np.arctan2(p[:, 1] - e["cy"], p[:, 0] - e["cx"])
            dw = (w - e["winkel"] + math.pi) % (2 * math.pi) - math.pi
            auf = np.abs(np.hypot(p[:, 0] - e["cx"], p[:, 1] - e["cy"]) - e["r"]) < 0.03
            u = dw * e["r"]
        hb, v, oben = e["b"] / 2, p[:, 2] - e["z0"], e["h"]

        def drin(rand):
            hh = hb - rand
            if e["bogen"]:
                return (np.abs(u) < hh) & (v > rand) & (v < oben + np.sqrt(np.maximum(hh * hh - u * u, 0)) * 0.9)
            return (np.abs(u) < hh) & (v > rand) & (v < oben - rand)

        m = auf & drin(0)
        innen = m & drin(0.026)
        if e["art"] == "fenster":
            art[m] = 2
            art[innen] = 1
            art[innen & ((np.abs(u) < 0.011) | (np.abs(v - oben * 0.55) < 0.011))] = 2
        else:
            art[m] = 2
            art[innen] = 3
            band = innen & ((np.abs(v - oben * 0.25) < 0.018) | (np.abs(v - oben * 0.7) < 0.018)) & (u < hb * 0.35)
            art[band] = 4
    return art


# —— Bild —————————————————————————————————————————————————————————————


SONNE = np.array([1.0, 0.95, 0.86]) * 1.25
HIMMEL = np.array([0.6, 0.68, 0.8])
BODEN = np.array([0.3, 0.34, 0.2])


def schattieren(sz: Szene, p, n, ki, d, *, ao_strahlen=8, schatten_strahlen=3, glas=frozenset()):
    """Farbe (linear) und Abend-Leuchten für Treffer p mit Normale n am Körper ki."""
    m = p.shape[0]
    farbe = np.zeros((m, 3))
    knick = np.zeros(m)
    glanz = np.zeros(m)
    for k_i in np.unique(ki):
        sel = ki == k_i
        k = sz.koerper[k_i]
        f, kn, gl = material(k, p[sel], n[sel])
        if k.giebel is not None:
            quer = k.rund is not None and k.rund[0] == "quer"
            g = (np.abs(n[sel][:, 1 if quer else 0]) > 0.9)
            if g.any():
                pg = Koerper(None, "putz", k.giebel, k.ecken)
                gf, gk, _ = material(pg, p[sel][g], n[sel][g])
                f[g], kn[g] = gf, gk
        farbe[sel], knick[sel], glanz[sel] = f, kn, gl
    art = einlage(sz, p, n)
    farbe[art == 1] = lin((40, 48, 62))
    farbe[art == 2] = lin((222, 212, 190))
    if (art == 3).any():
        q = p[art == 3]
        farbe[art == 3] = lin((100, 64, 38)) * (0.82 + 0.18 * np.sin((q[:, 0] + q[:, 1]) * 95))[:, None]
    farbe[art == 4] = lin((50, 46, 44))
    glanz[art == 1] = 0.55
    leuchten = art == 1
    # Kanten leicht runden (Fase): Normale zur Nachbarfläche neigen
    for k_i in np.unique(ki):
        k = sz.koerper[k_i]
        if k.ebenen is None or k.rund is not None and k.rund[0] != "quer":
            continue
        sel = np.nonzero(ki == k_i)[0]
        abst = k.ebenen[:, 3][None, :] - p[sel] @ k.ebenen[:, :3].T
        for j in range(k.ebenen.shape[0]):
            nahe = (abst[:, j] < 0.022) & (np.abs(n[sel] @ k.ebenen[j, :3]) < 0.95)
            if nahe.any():
                w = (1 - abst[nahe, j] / 0.022) * 0.5
                nn = n[sel[nahe]] + k.ebenen[j, :3][None, :] * w[:, None]
                n[sel[nahe]] = nn / np.linalg.norm(nn, axis=1, keepdims=True)
    nb = n + np.array([0, 0, 1.0])[None, :] * (knick[:, None] * 0.35)
    nb /= np.linalg.norm(nb, axis=1, keepdims=True)
    start = p + n * 2e-3
    licht = np.zeros(m)
    for r in [LICHT + np.array(v) for v in ((0, 0, 0), (0.05, -0.05, 0.01), (-0.04, 0.05, -0.02))][:schatten_strahlen]:
        r = r / np.linalg.norm(r)
        _, i2, _ = schnitt(sz, start, np.repeat(r[None, :], m, axis=0), nur_treffer=True, ohne=glas)
        licht += i2 < 0
    licht /= schatten_strahlen
    frei = np.zeros(m)
    for r in halbkugel(n, ao_strahlen):
        tt, i2, _ = schnitt(sz, start, r, tmax=0.45, nur_treffer=True, ohne=glas)
        frei += np.where(i2 < 0, 1.0, np.clip(tt / 0.45, 0, 1) ** 0.5)
    ao = frei / ao_strahlen
    diff = np.clip(nb @ LICHT, 0, 1)
    amb = (HIMMEL[None, :] * (0.55 + 0.45 * (0.5 + 0.5 * nb[:, 2:3])) + BODEN[None, :] * np.clip(-nb[:, 2:3], 0, 1)) * ao[:, None] ** 1.4
    col = farbe * (amb + SONNE[None, :] * (diff * licht)[:, None])
    h = LICHT + SICHT
    h /= np.linalg.norm(h)
    col += (np.clip(nb @ h, 0, 1) ** 40 * glanz * licht)[:, None] * 0.8
    return col, leuchten


def rendern(sz: Szene, breite: int, n_felder: int, *, s: int = 3, rand_oben: int = 4, schatten_r: float | None = None):
    """Tagbild und Abend-Ebene (RGBA, Endgröße); Fußpunkt wie G3, oben beschnitten."""
    alle = np.concatenate([k.ecken for k in sz.koerper])
    hoehe_px = 4 + n_felder * HH * 2
    # Höhe des Bilds: höchster Punkt der Szene
    cx = breite / 2
    sy_min = ((alle[:, 0] + alle[:, 1]) * HH - alle[:, 2] * ZE).min()
    cy0_rel = -sy_min + rand_oben + 6
    H_end = int(math.ceil(cy0_rel + n_felder * HH + 4))
    hoehe = max(H_end, hoehe_px)
    cy0 = hoehe - 4 - n_felder * HH
    W, H = breite * s, hoehe * s
    jj, ii = np.mgrid[0:H, 0:W]
    sx = (ii.ravel() + 0.5) / s
    sy = (jj.ravel() + 0.5) / s
    u = (sx - cx) / HW
    v = (sy - cy0) / HH
    o = np.stack([(u + v) / 2, (v - u) / 2, np.zeros_like(u)], axis=1) + SICHT[None, :] * 40
    d = np.repeat(-SICHT[None, :], o.shape[0], axis=0)

    def auswahl(k: Koerper):
        e = k.ecken
        if k.kugel is not None:
            cxk, cyk, czk, rx, ry, rz, _ = k.kugel
            e = np.array([(cxk + a * rx, cyk + b * ry, czk + c * rz) for a in (-1, 1) for b in (-1, 1) for c in (-1, 1)])
        px = (cx + (e[:, 0] - e[:, 1]) * HW) * s
        py = (cy0 + (e[:, 0] + e[:, 1]) * HH - e[:, 2] * ZE) * s
        x0, x1 = max(0, int(px.min()) - 2), min(W, int(px.max()) + 3)
        y0, y1 = max(0, int(py.min()) - 2), min(H, int(py.max()) + 3)
        if x1 <= x0 or y1 <= y0:
            return np.zeros(0, dtype=np.int64)
        yy, xx = np.mgrid[y0:y1, x0:x1]
        return (yy * W + xx).ravel()

    glas = frozenset(i for i, k in enumerate(sz.koerper) if k.mat == "glas")
    t, idx, nor = schnitt(sz, o, d, auswahl=auswahl)
    tid = np.nonzero(idx >= 0)[0]
    p = o[tid] + t[tid, None] * d[tid]
    col, leuchten = schattieren(sz, p, nor[tid].copy(), idx[tid], d[tid], glas=glas)
    # Glas: dahinter weiterschauen und mischen
    ist_glas = np.isin(idx[tid], list(glas)) if glas else np.zeros(tid.size, bool)
    alpha = np.ones(tid.size)
    if ist_glas.any():
        g = np.nonzero(ist_glas)[0]
        t2, i2, n2 = schnitt(sz, p[g] + d[tid[g]] * 1e-3, d[tid[g]], ohne=glas)
        hinter = i2 >= 0
        innen = np.zeros((g.size, 3))
        if hinter.any():
            p2 = p[g][hinter] + d[tid[g]][hinter] * t2[hinter, None]
            c2, _ = schattieren(sz, p2, n2[hinter].copy(), i2[hinter], d[tid[g]][hinter], ao_strahlen=4, schatten_strahlen=1, glas=glas)
            innen[hinter] = c2 * 0.8
        toenung = lin(GLAS)
        spiegel = col[g]
        col[g] = innen * toenung * 1.05 + spiegel * 0.18
        alpha[g] = np.where(hinter, 1.0, 0.45)
    rgba = np.zeros((W * H, 4))
    rgba[tid, :3] = srgb(col)
    rgba[tid, 3] = alpha
    abend = np.zeros(W * H)
    abend[tid[leuchten]] = 1
    tag = Image.fromarray((rgba.reshape(H, W, 4) * 255).round().astype(np.uint8), "RGBA").resize((breite, hoehe), Image.LANCZOS)
    ab = np.zeros((H, W, 4))
    ab[..., :3] = np.array([255, 200, 90]) / 255
    ab[..., 3] = abend.reshape(H, W)
    abend_bild = Image.fromarray((ab * 255).round().astype(np.uint8), "RGBA").resize((breite, hoehe), Image.LANCZOS)
    r = sz.schatten_r if schatten_r is None else schatten_r
    tag = bodenschatten(tag, n_felder, r)
    box = tag.getbbox()
    oben = max(0, box[1] - rand_oben) if box else 0
    return tag.crop((0, oben, breite, hoehe)), abend_bild.crop((0, oben, breite, hoehe))


def bodenschatten(bild: Image.Image, n_felder: int, r: float) -> Image.Image:
    """Weiche Raute unter dem Gebäude (Schwarz, Deckkraft 46) wie §12.3."""
    w, h = bild.size
    cx, cy0 = w / 2, h - 4 - n_felder * HH
    schicht = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    pts = [(cx + (x - y) * HW, cy0 + (x + y) * HH) for x, y in ((-r, -r), (r, -r), (r, r), (-r, r))]
    ImageDraw.Draw(schicht).polygon(pts, fill=(0, 0, 0, 46))
    schicht = schicht.filter(ImageFilter.GaussianBlur(3))
    schicht.alpha_composite(bild)
    return schicht
