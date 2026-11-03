"""Probestück G12: kleiner 3D-Renderer für die Bastion-Bilder (Wunsch PV 03.11.2026:
„wirklich anders aussehen, anderer Stil, anderer Aufbau“).

Statt flacher Vielecke (G3) werden Gebäude als echte Körper beschrieben und
berechnet: Licht von rechts oben, Eigenschatten, Umgebungsverdeckung (AO),
Materialien aus festen Mustern (Mauerwerk, Ziegel, Schiefer, Kupfer, Holz, Putz),
Fenster und Türen als Einlagen. Gleiche Eingabe ergibt das gleiche Bild (kein
Zufall); nur numpy und Pillow, keine neue Abhängigkeit.

Raster wie iso.ts und G3: Bildpunkt = (Mitte + (x − y) · 48, Boden + (x + y) · 24 − z),
x und y in Feldern, z in Pixeln (doppelte Größe). Intern ist das eine echte
Parallelprojektion (Blick 30° von oben); eine Einheit Höhe sind 58,79 Pixel.

Stile (gleiche Szene, anderes Licht):
  weich    – gerendert, weiche Schatten, feine Materialien, keine Kontur
  comic    – klare Tonstufen (Licht, Mitte, Schatten), dunkle Umrisslinie
  spielzeug – runde Kanten, kräftige Farben, kaum Muster
"""
from __future__ import annotations

import math
from dataclasses import dataclass, field

import numpy as np
from PIL import Image, ImageFilter

HW, HH = 48, 24
ZE = 48 * 2 / math.sqrt(2) * math.cos(math.radians(30))  # Pixel je Höheneinheit = 58,79
SICHT = np.array([1.0, 1.0, 48 / ZE], dtype=np.float64)
SICHT /= np.linalg.norm(SICHT)  # zum Betrachter
LICHT = np.array([0.55, 0.15, 0.82])
LICHT /= np.linalg.norm(LICHT)


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
    """Weiches Wertrauschen auf festem Gitter (für Putz, Patina, Maserung)."""
    a, b = a * f, b * f
    ia, ib = np.floor(a), np.floor(b)
    fa, fb = a - ia, b - ib
    fa, fb = fa * fa * (3 - 2 * fa), fb * fb * (3 - 2 * fb)
    ia, ib = ia.astype(np.int64), ib.astype(np.int64)
    v00, v10 = hashf(ia, ib), hashf(ia + 1, ib)
    v01, v11 = hashf(ia, ib + 1), hashf(ia + 1, ib + 1)
    return (v00 * (1 - fa) + v10 * fa) * (1 - fb) + (v01 * (1 - fa) + v11 * fa) * fb


# —— Körper ————————————————————————————————————————————————————————————


@dataclass
class Koerper:
    ebenen: np.ndarray | None  # (k, 4): n·p ≤ d
    mat: str
    farbe: tuple
    kugel: tuple | None = None  # (cx, cy, cz, rx, ry, rz, zmin)
    mitte: np.ndarray = field(default_factory=lambda: np.zeros(3))
    radius: float = 0.0
    rund: tuple | None = None  # (cx, cy) bei Zylinder/Kegel: Muster folgt dem Umfang
    giebel: tuple | None = None  # Satteldach: Farbe der Giebelflächen (Wand)


def _z(zpx: float) -> float:
    return zpx / ZE


class Szene:
    def __init__(self) -> None:
        self.koerper: list[Koerper] = []
        self.einlagen: list[dict] = []

    # Grundkörper (z in Pixeln wie G3)
    def _poly(self, ebenen, mat, farbe, ecken, rund=None) -> Koerper:
        e = np.array(ebenen, dtype=np.float64)
        e[:, :3] /= np.linalg.norm(e[:, :3], axis=1, keepdims=True).clip(1e-9)
        # d nach Normierung anpassen
        roh = np.array(ebenen, dtype=np.float64)
        e[:, 3] = roh[:, 3] / np.linalg.norm(roh[:, :3], axis=1).clip(1e-9)
        ecken = np.array(ecken)
        m = ecken.mean(axis=0)
        k = Koerper(e, mat, farbe, mitte=m, radius=float(np.linalg.norm(ecken - m, axis=1).max()) + 1e-3, rund=rund)
        self.koerper.append(k)
        return k

    def quader(self, x0, x1, y0, y1, z0, z1, mat="stein", farbe=(176, 164, 146)):
        z0, z1 = _z(z0), _z(z1)
        eb = [(1, 0, 0, x1), (-1, 0, 0, -x0), (0, 1, 0, y1), (0, -1, 0, -y0), (0, 0, 1, z1), (0, 0, -1, -z0)]
        ecken = [(x, y, z) for x in (x0, x1) for y in (y0, y1) for z in (z0, z1)]
        return self._poly(eb, mat, farbe, ecken)

    def zylinder(self, cx, cy, r, z0, z1, mat="stein", farbe=(176, 164, 146), n=40):
        z0, z1 = _z(z0), _z(z1)
        eb = [(0, 0, 1, z1), (0, 0, -1, -z0)]
        for i in range(n):
            a = 2 * math.pi * (i + 0.5) / n
            eb.append((math.cos(a), math.sin(a), 0, cx * math.cos(a) + cy * math.sin(a) + r))
        ecken = [(cx + r * sx, cy + r * sy, z) for sx in (-1, 1) for sy in (-1, 1) for z in (z0, z1)]
        return self._poly(eb, mat, farbe, ecken, rund=(cx, cy))

    def kegel(self, cx, cy, r, z, h, mat="ziegel", farbe=(196, 96, 58), n=40):
        z0, hh = _z(z), _z(h)
        eb = [(0, 0, -1, -z0)]
        for i in range(n):
            a = 2 * math.pi * (i + 0.5) / n
            # Seitenfläche: (cos, sin)·(p−c)·hh + r·(z − z0) ≤ r·hh
            nx, ny, nz = math.cos(a) * hh, math.sin(a) * hh, r
            eb.append((nx, ny, nz, nx * cx + ny * cy + r * hh + r * z0))
        ecken = [(cx + r * sx, cy + r * sy, z0) for sx in (-1, 1) for sy in (-1, 1)] + [(cx, cy, z0 + hh)]
        self._poly(eb, mat, farbe, ecken, rund=(cx, cy))
        return (cx, cy, z + h)

    def pyramide(self, x0, x1, y0, y1, z, h, mat="ziegel", farbe=(196, 96, 58), ueber=0.12):
        x0, x1, y0, y1 = x0 - ueber, x1 + ueber, y0 - ueber, y1 + ueber
        z0, hh = _z(z), _z(h)
        mx, my = (x0 + x1) / 2, (y0 + y1) / 2
        ax, ay = (x1 - x0) / 2, (y1 - y0) / 2
        eb = [(0, 0, -1, -z0)]
        for sx, sy, a in ((1, 0, ax), (-1, 0, ax), (0, 1, ay), (0, -1, ay)):
            # (p − m)·s · hh + a · (z − z0) ≤ a · hh
            nx, ny, nz = sx * hh, sy * hh, a
            eb.append((nx, ny, nz, nx * mx + ny * my + a * hh + a * z0))
        ecken = [(x, y, z0) for x in (x0, x1) for y in (y0, y1)] + [(mx, my, z0 + hh)]
        self._poly(eb, mat, farbe, ecken)
        return (mx, my, z + h)

    def satteldach(self, x0, x1, y0, y1, z, h, mat="ziegel", farbe=(196, 96, 58), ueber=0.12, giebel=(236, 226, 204)):
        """First entlang x; Giebel bleiben offen sichtbar als Wandfarbe (eigener Körper)."""
        a, b = x0 - ueber, x1 + ueber
        c0, c1 = y0 - ueber, y1 + ueber
        z0, hh = _z(z) - _z(4), _z(h) + _z(4)
        my, ay = (c0 + c1) / 2, (c1 - c0) / 2
        eb = [(1, 0, 0, b), (-1, 0, 0, -a), (0, 0, -1, -z0)]
        for sy in (1, -1):
            eb.append((0, sy * hh, ay, sy * hh * my + ay * hh + ay * z0))
        ecken = [(x, y, z0) for x in (a, b) for y in (c0, c1)] + [(a, my, z0 + hh), (b, my, z0 + hh)]
        self._poly(eb, mat, farbe, ecken).giebel = giebel

    def kuppel(self, cx, cy, r, z, h, mat="kupfer", farbe=(92, 156, 138)):
        z0, hh = _z(z), _z(h)
        k = Koerper(None, mat, farbe, kugel=(cx, cy, z0, r, r, hh, z0), mitte=np.array([cx, cy, z0 + hh / 2]), radius=max(r, hh) * 1.5, rund=(cx, cy))
        self.koerper.append(k)
        return (cx, cy, z + h)

    def kugel(self, cx, cy, z, r, mat="laub", farbe=(92, 140, 64), rz=None):
        cz = _z(z)
        rz = r if rz is None else rz
        k = Koerper(None, mat, farbe, kugel=(cx, cy, cz, r, r, rz, -99.0), mitte=np.array([cx, cy, cz]), radius=max(r, rz) * 1.01)
        self.koerper.append(k)

    # Einlagen auf Flächen: Fenster, Tür, Banner
    def fenster(self, seite: str, u: float, w: float, z: float, b: float, h: float, *, art="fenster", bogen=True):
        """seite 'l' (Fläche y = w, Breite entlang x) oder 'r' (Fläche x = w, entlang y)."""
        self.einlagen.append(dict(seite=seite, u=u, w=w, z0=_z(z), b=b, h=_z(h), art=art, bogen=bogen))

    def fenster_rund(self, cx, cy, r, winkel, z, b, h, *, art="fenster"):
        self.einlagen.append(dict(seite="rund", cx=cx, cy=cy, r=r, winkel=winkel, z0=_z(z), b=b, h=_z(h), art=art, bogen=True))

    def fahne(self, spitze, hoehe, farbe=(61, 190, 165)):
        x, y, z = spitze
        self.zylinder(x, y, 0.018, z - 6, z + hoehe, "stange", (240, 236, 226), n=8)
        self.quader(x - 0.01, x + 0.01, y - 0.26, y - 0.02, z + hoehe - 22, z + hoehe - 2, "tuch", farbe)


# —— Strahlen ———————————————————————————————————————————————————————————


def schnitt(sz: Szene, o: np.ndarray, d: np.ndarray, tmax=np.inf, nur_treffer=False):
    """Nächster Treffer je Strahl: t, Körper-Index, Normale."""
    n = o.shape[0]
    best = np.full(n, np.inf)
    idx = np.full(n, -1)
    nor = np.zeros((n, 3))
    for ki, k in enumerate(sz.koerper):
        # Grobtest: Kugel um den Körper
        oc = o - k.mitte
        bq = np.einsum("ij,ij->i", oc, d)
        cq = np.einsum("ij,ij->i", oc, oc) - k.radius**2
        kand = (bq * bq - cq >= 0) & (-bq + np.sqrt(np.maximum(bq * bq - cq, 0)) > 1e-6)
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
            ein = np.where(den < 0, t, -np.inf)
            aus = np.where(den > 0, t, np.inf)
            parallel_aus = (np.abs(den) < 1e-12) & (num < 0)
            t0 = ein.max(axis=1)
            t1 = aus.min(axis=1)
            ebene = ein.argmax(axis=1)
            ok = (t0 < t1) & (t0 > 1e-5) & ~parallel_aus.any(axis=1) & (t0 < tmax)
            nn = E[ebene, :3]
        else:
            cx, cy, cz, rx, ry, rz, zmin = k.kugel
            s = np.array([rx, ry, rz])
            ol = (oo - np.array([cx, cy, cz])) / s
            dl = dd / s
            a = np.einsum("ij,ij->i", dl, dl)
            bb = np.einsum("ij,ij->i", ol, dl)
            cc = np.einsum("ij,ij->i", ol, ol) - 1
            disk = bb * bb - a * cc
            wurzel = np.sqrt(np.maximum(disk, 0))
            t0 = (-bb - wurzel) / a
            pz = oo[:, 2] + t0 * dd[:, 2]
            ok = (disk >= 0) & (t0 > 1e-5) & (pz >= zmin - 1e-6) & (t0 < tmax)
            p = ol + t0[:, None] * dl
            nn = p / s
            nn /= np.linalg.norm(nn, axis=1, keepdims=True).clip(1e-9)
        besser = ok & (t0 < best[sel])
        w = sel[besser]
        best[w] = t0[besser]
        idx[w] = ki
        nor[w] = nn[besser]
    return best, idx, nor


def halbkugel_richtungen(n: np.ndarray, k: int = 8) -> list[np.ndarray]:
    """Feste Richtungen um die Normale (für die Umgebungsverdeckung)."""
    hilf = np.where(np.abs(n[:, 2:3]) < 0.9, np.array([[0, 0, 1.0]]), np.array([[1.0, 0, 0]]))
    t1 = np.cross(n, hilf)
    t1 /= np.linalg.norm(t1, axis=1, keepdims=True)
    t2 = np.cross(n, t1)
    aus = []
    for i in range(k):
        a = 2 * math.pi * (i + 0.37) / k
        el = 0.35 + 0.5 * ((i * 5) % k) / k
        r = math.cos(math.asin(el))
        aus.append(n * el + t1 * (r * math.cos(a)) + t2 * (r * math.sin(a)))
    return aus


# —— Material ———————————————————————————————————————————————————————————


def flaechen_koord(p: np.ndarray, n: np.ndarray, rund: np.ndarray, rx: np.ndarray, ry: np.ndarray):
    """(a, b): a entlang der Fläche waagrecht, b senkrecht (z). Runde Körper: a = Bogen."""
    oben = n[:, 2] > 0.95
    a = np.where(np.abs(n[:, 0]) > np.abs(n[:, 1]), p[:, 1], p[:, 0])
    w = np.arctan2(p[:, 1] - ry, p[:, 0] - rx)
    rr = np.hypot(p[:, 0] - rx, p[:, 1] - ry)
    a = np.where(rund, w * np.maximum(rr, 0.05), a)
    b = np.where(oben, p[:, 1] + p[:, 0] * 0.3, p[:, 2])
    return a, b, oben


def material(mat, basis, p, n, rund, rx, ry, stil):
    """Farbe (linear) und Beulen-Faktor für die Normale."""
    a, b, oben = flaechen_koord(p, n, rund, rx, ry)
    farbe = np.repeat(lin(basis)[None, :], p.shape[0], axis=0)
    knick = np.zeros(p.shape[0])  # −1 … 1: Licht von oben/unten auf kleinen Kanten
    fein = 0.35 if stil == "spielzeug" else 1.0
    if mat == "stein":
        hoehe, laenge = 0.2, 0.34
        reihe = np.floor(b / hoehe)
        versatz = (reihe % 2) * 0.5
        spalte = np.floor(a / laenge + versatz)
        fa = a / laenge + versatz - spalte
        fb = b / hoehe - reihe
        ton = hashf(reihe.astype(np.int64), spalte.astype(np.int64))
        farbe *= (0.86 + 0.26 * ton * fein)[:, None]
        farbe *= np.array([1.0 + 0.04 * fein, 1.0, 0.97])[None, :] ** (ton[:, None] - 0.5)
        fuge = (np.minimum(fb, 1 - fb) < 0.07) | (np.minimum(fa, 1 - fa) * laenge / hoehe < 0.05)
        fuge &= ~oben
        farbe[fuge] *= 0.55 if stil != "spielzeug" else 0.8
        knick = np.where(~fuge & (fb > 0.78), 0.5, np.where(~fuge & (fb < 0.2), -0.4, 0))
        farbe *= (0.92 + 0.16 * rauschen(a, b, 9) * fein)[:, None]
    elif mat in ("ziegel", "schiefer"):
        hoehe = 0.085 if mat == "ziegel" else 0.07
        laenge = 0.12 if mat == "ziegel" else 0.15
        reihe = np.floor(b / hoehe)
        fb = b / hoehe - reihe
        spalte = np.floor(a / laenge + (reihe % 2) * 0.5)
        fa = a / laenge + (reihe % 2) * 0.5 - spalte
        ton = hashf(reihe.astype(np.int64), spalte.astype(np.int64) + 7)
        farbe *= (0.84 + 0.3 * ton * fein)[:, None]
        # jede Reihe unten dunkler (liegt im Schatten der Reihe darüber), oben Licht
        farbe *= (0.62 + 0.5 * fb)[:, None] if stil != "spielzeug" else (0.85 + 0.2 * fb)[:, None]
        stoss = np.minimum(fa, 1 - fa) < 0.06
        farbe[stoss] *= 0.7
        knick = (fb - 0.5) * 0.9
    elif mat == "kupfer":
        bahn = a / 0.16
        fa = bahn - np.floor(bahn)
        farbe *= (0.9 + 0.2 * rauschen(a, b, 6) * fein)[:, None]
        naht = np.minimum(fa, 1 - fa) < 0.08
        farbe[naht] *= 1.25
        knick = np.where(naht, 0.6, 0)
    elif mat == "holz":
        brett = np.floor(a / 0.11)
        fa = a / 0.11 - brett
        ton = hashf(brett.astype(np.int64), np.zeros_like(brett, dtype=np.int64) + 3)
        farbe *= (0.82 + 0.3 * ton)[:, None]
        maser = np.sin(b * 40 + 8 * rauschen(a, b * 0.2, 14) + brett * 1.3)
        farbe *= (0.92 + 0.08 * maser * fein)[:, None]
        farbe[np.minimum(fa, 1 - fa) < 0.06] *= 0.55
    elif mat == "putz":
        farbe *= (0.94 + 0.1 * rauschen(a, b, 11) * fein)[:, None]
    elif mat == "laub":
        r = rauschen(p[:, 0] + p[:, 2], p[:, 1] - p[:, 2], 9)
        farbe *= (0.75 + 0.45 * r)[:, None]
    return farbe, knick


def einlage(sz: Szene, p: np.ndarray, n: np.ndarray):
    """Fenster/Tür auf Flächen: gibt Art (0 nichts, 1 Glas, 2 Rahmen, 3 Tür, 4 Beschlag) zurück."""
    art = np.zeros(p.shape[0], dtype=np.int8)
    for e in sz.einlagen:
        if e["seite"] == "l":
            auf = (np.abs(p[:, 1] - e["w"]) < 0.02) & (n[:, 1] > 0.9)
            u = p[:, 0] - e["u"]
        elif e["seite"] == "r":
            auf = (np.abs(p[:, 0] - e["w"]) < 0.02) & (n[:, 0] > 0.9)
            u = -(p[:, 1] - e["u"])
        else:
            w = np.arctan2(p[:, 1] - e["cy"], p[:, 0] - e["cx"])
            dw = (w - e["winkel"] + math.pi) % (2 * math.pi) - math.pi
            rr = np.hypot(p[:, 0] - e["cx"], p[:, 1] - e["cy"])
            auf = np.abs(rr - e["r"]) < 0.03
            u = dw * e["r"]
        hb = e["b"] / 2
        v = p[:, 2] - e["z0"]
        oben = e["h"]
        if e["bogen"]:
            bogen_h = np.sqrt(np.maximum(hb * hb - u * u, 0)) * 0.9
            innen = (np.abs(u) < hb) & (v > 0) & (v < oben + bogen_h)
        else:
            innen = (np.abs(u) < hb) & (v > 0) & (v < oben)
        rahmen_d = 0.028
        if e["bogen"]:
            innen2 = (np.abs(u) < hb - rahmen_d) & (v > rahmen_d) & (v < oben + np.sqrt(np.maximum((hb - rahmen_d) ** 2 - u * u, 0)) * 0.9)
        else:
            innen2 = (np.abs(u) < hb - rahmen_d) & (v > rahmen_d) & (v < oben - rahmen_d)
        m = auf & innen
        if e["art"] == "fenster":
            art[m] = 2
            g = m & innen2
            art[g] = 1
            sprosse = g & ((np.abs(u) < 0.012) | (np.abs(v - oben * 0.55) < 0.012))
            art[sprosse] = 2
        else:
            art[m] = 3
            band = m & innen2 & ((np.abs(v - oben * 0.25) < 0.02) | (np.abs(v - oben * 0.72) < 0.02)) & (u < hb * 0.3)
            art[band] = 4
            art[m & ~innen2] = 2
    return art


# —— Bild —————————————————————————————————————————————————————————————


def rendern(sz: Szene, breite: int, hoehe: int, n_felder: int, *, stil="weich", s: int = 3, sonne=True):
    """Gibt (Tagbild, Abend-Ebene) in Endgröße zurück (RGBA), Fußpunkt wie G3."""
    W, H = breite * s, hoehe * s
    cx = breite / 2
    cy0 = hoehe - 4 - n_felder * HH
    jj, ii = np.mgrid[0:H, 0:W]
    sx = (ii.ravel() + 0.5) / s
    sy = (jj.ravel() + 0.5) / s
    u = (sx - cx) / HW
    v = (sy - cy0) / HH
    p0 = np.stack([(u + v) / 2, (v - u) / 2, np.zeros_like(u)], axis=1)
    o = p0 + SICHT[None, :] * 40
    d = np.repeat(-SICHT[None, :], o.shape[0], axis=0)
    t, idx, nor = schnitt(sz, o, d)
    treffer = idx >= 0
    rgba = np.zeros((W * H, 4))
    abend = np.zeros(W * H)
    tid = np.nonzero(treffer)[0]
    p = o[tid] + t[tid, None] * d[tid]
    n = nor[tid]
    ki = idx[tid]
    farbe = np.zeros((tid.size, 3))
    knick = np.zeros(tid.size)
    glanz = np.zeros(tid.size)
    for k_i, k in enumerate(sz.koerper):
        m = ki == k_i
        if not m.any():
            continue
        rund = np.full(m.sum(), k.rund is not None)
        rx = np.full(m.sum(), k.rund[0] if k.rund else 0.0)
        ry = np.full(m.sum(), k.rund[1] if k.rund else 0.0)
        f, kn = material(k.mat, k.farbe, p[m], n[m], rund, rx, ry, stil)
        if k.giebel is not None:
            g = np.abs(n[m][:, 0]) > 0.9
            gf, gk = material("putz", k.giebel, p[m][g], n[m][g], rund[g], rx[g], ry[g], stil)
            f[g], kn[g] = gf, gk
        farbe[m] = f
        knick[m] = kn
        glanz[m] = {"kupfer": 0.35, "stange": 0.2, "gold": 0.6}.get(k.mat, 0.04)
    # Einlagen
    art = einlage(sz, p, n)
    farbe[art == 1] = lin((44, 52, 66))
    farbe[art == 2] = lin((224, 214, 192))
    farbe[art == 3] = lin((96, 62, 36)) * (0.85 + 0.15 * np.sin(p[art == 3][:, 0] * 90 + p[art == 3][:, 1] * 90))[:, None]
    farbe[art == 4] = lin((50, 46, 44))
    glanz[art == 1] = 0.5
    abend[tid[art == 1]] = 1
    # Spielzeug: runde Kanten (Normale zur Nachbarfläche neigen)
    if stil == "spielzeug" or stil == "weich":
        fase = 0.07 if stil == "spielzeug" else 0.025
        for k_i, k in enumerate(sz.koerper):
            m = np.nonzero(ki == k_i)[0]
            if m.size == 0 or k.ebenen is None or k.rund is not None:
                continue
            E = k.ebenen
            abst = E[:, 3][None, :] - p[m] @ E[:, :3].T  # ≥ 0 innen
            for j in range(E.shape[0]):
                nahe = (abst[:, j] < fase) & (np.abs(n[m] @ E[j, :3]) < 0.95)
                if nahe.any():
                    w = (1 - abst[nahe, j] / fase) * 0.55
                    nn = n[m[nahe]] + E[j, :3][None, :] * w[:, None]
                    n[m[nahe]] = nn / np.linalg.norm(nn, axis=1, keepdims=True)
    # Beulen der Muster: Normale leicht nach oben/unten neigen
    nb = n + np.array([0, 0, 1.0])[None, :] * (knick[:, None] * 0.35)
    nb /= np.linalg.norm(nb, axis=1, keepdims=True)
    # Schatten: weich aus festen Richtungen um das Licht
    start = p + n * 2e-3
    licht = np.zeros(tid.size)
    richtungen = [LICHT] if stil == "comic" else [LICHT + np.array(v) for v in ((0, 0, 0), (0.06, -0.05, 0), (-0.05, 0.06, 0.02), (0.03, 0.04, -0.04))]
    for r in richtungen:
        r = r / np.linalg.norm(r)
        tt, ii2, _ = schnitt(sz, start, np.repeat(r[None, :], tid.size, axis=0), nur_treffer=True)
        licht += (ii2 < 0)
    licht /= len(richtungen)
    # Umgebungsverdeckung
    ao = np.ones(tid.size)
    if stil != "comic":
        frei = np.zeros(tid.size)
        rs = halbkugel_richtungen(n, 8)
        for r in rs:
            tt, ii2, _ = schnitt(sz, start, r, tmax=0.45, nur_treffer=True)
            frei += np.where(ii2 < 0, 1.0, np.clip(tt / 0.45, 0, 1) ** 0.5)
        ao = frei / len(rs)
    diff = np.clip(nb @ LICHT, 0, 1)
    himmel = 0.5 + 0.5 * nb[:, 2]
    boden = np.clip(-nb[:, 2], 0, 1)
    if stil == "comic":
        stufe = np.where(diff * licht > 0.55, 1.0, np.where(diff * licht > 0.2, 0.68, 0.45))
        hell_ = 0.42 + 0.75 * stufe
        col = farbe * hell_[:, None]
    else:
        sonne_c = np.array([1.0, 0.95, 0.86]) * 1.15
        himmel_c = np.array([0.62, 0.7, 0.82])
        bounce_c = np.array([0.32, 0.36, 0.22])
        amb = (himmel_c[None, :] * (0.55 + 0.45 * himmel[:, None]) + bounce_c[None, :] * boden[:, None]) * ao[:, None] ** 1.3
        col = farbe * (amb + sonne_c[None, :] * (diff * licht)[:, None])
        # Glanzlicht
        h = LICHT + SICHT
        h = h / np.linalg.norm(h)
        spec = np.clip(nb @ h, 0, 1) ** 40 * glanz * licht
        col += spec[:, None] * 0.8
        if stil == "spielzeug":
            col = col * 1.08
    rgb = srgb(col)
    if stil == "spielzeug":
        g = rgb.mean(axis=1, keepdims=True)
        rgb = np.clip(g + (rgb - g) * 1.35, 0, 1)
    rgba[tid, :3] = rgb
    rgba[tid, 3] = 1
    bild = rgba.reshape(H, W, 4)
    if stil == "comic":  # Umriss aus Tiefen- und Körperwechsel
        tief = np.where(treffer, t, 99).reshape(H, W)
        kid = idx.reshape(H, W)
        kante = np.zeros((H, W), bool)
        for dy, dx in ((0, 1), (1, 0)):
            a1 = tief[: H - dy, : W - dx]
            a2 = tief[dy:, dx:]
            k1 = kid[: H - dy, : W - dx]
            k2 = kid[dy:, dx:]
            k = (np.abs(a1 - a2) > 0.08) | ((k1 != k2) & (np.abs(a1 - a2) > 0.02))
            kante[: H - dy, : W - dx] |= k
            kante[dy:, dx:] |= k
        maske = Image.fromarray((kante * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3))
        km = np.asarray(maske) > 0
        bild[km, :3] = bild[km, :3] * 0.25 + np.array([43, 38, 32]) / 255 * 0.75
        bild[km, 3] = np.maximum(bild[km, 3], 0.9)
    tag = Image.fromarray((bild * 255).round().astype(np.uint8), "RGBA").resize((breite, hoehe), Image.LANCZOS)
    ab = np.zeros((H, W, 4))
    ab[..., :3] = np.array([255, 200, 90]) / 255
    ab[..., 3] = abend.reshape(H, W)
    abend_bild = Image.fromarray((ab * 255).round().astype(np.uint8), "RGBA").resize((breite, hoehe), Image.LANCZOS)
    return tag, abend_bild


def bodenschatten(bild: Image.Image, n_felder: int, r: float) -> Image.Image:
    """Weiche Raute unter dem Gebäude (Schwarz, Deckkraft 40) wie §12.3."""
    from PIL import ImageDraw

    w, h = bild.size
    cx, cy0 = w / 2, h - 4 - n_felder * HH
    schicht = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    pts = [(cx + (x - y) * HW, cy0 + (x + y) * HH) for x, y in ((-r, -r), (r, -r), (r, r), (-r, r))]
    ImageDraw.Draw(schicht).polygon(pts, fill=(0, 0, 0, 46))
    schicht = schicht.filter(ImageFilter.GaussianBlur(3))
    schicht.alpha_composite(bild)
    return schicht


# —— Stil „klötzchen“: alles aus kleinen Würfeln ————————————————————————————


def kloetzchen(sz: Szene, breite: int, hoehe: int, n_felder: int, *, v: float = 0.16, s: int = 2):
    """Füllt die Körper mit Würfeln der Kante `v` (Felder) und zeichnet die sichtbaren
    Würfel von hinten nach vorn (Maler-Verfahren), mit Ecken-Schatten (AO)."""
    from PIL import ImageDraw

    vz = v  # Würfel sind echte Würfel: Höhe v Einheiten
    alle = np.array([k.mitte for k in sz.koerper])
    lo = np.min([k.mitte - k.radius for k in sz.koerper], axis=0)
    hi = np.max([k.mitte + k.radius for k in sz.koerper], axis=0)
    lo[2] = max(lo[2], 0.0)
    gx = np.arange(lo[0] + v / 2, hi[0], v)
    gy = np.arange(lo[1] + v / 2, hi[1], v)
    gz = np.arange(vz / 2, hi[2], vz)
    X, Y, Z = np.meshgrid(gx, gy, gz, indexing="ij")
    P = np.stack([X.ravel(), Y.ravel(), Z.ravel()], axis=1)
    welcher = np.full(P.shape[0], -1)
    for ki, k in enumerate(sz.koerper):
        if k.ebenen is not None:
            innen = np.all(P @ k.ebenen[:, :3].T <= k.ebenen[:, 3][None, :] + v * 0.35, axis=1)
        else:
            cx, cy, cz, rx, ry, rz, zmin = k.kugel
            q = (P - np.array([cx, cy, cz])) / np.array([rx, ry, rz])
            innen = (np.einsum("ij,ij->i", q, q) <= 1.05) & (P[:, 2] >= zmin - v * 0.3)
        welcher[innen] = ki
    gitter = welcher.reshape(X.shape)
    voll = gitter >= 0
    nx, ny, nz = voll.shape

    def nachbar(dx, dy, dz):
        out = np.zeros_like(voll)
        xs = slice(max(dx, 0), nx + min(dx, 0))
        ys = slice(max(dy, 0), ny + min(dy, 0))
        zs = slice(max(dz, 0), nz + min(dz, 0))
        xd = slice(max(-dx, 0), nx + min(-dx, 0))
        yd = slice(max(-dy, 0), ny + min(-dy, 0))
        zd = slice(max(-dz, 0), nz + min(-dz, 0))
        out[xd, yd, zd] = voll[xs, ys, zs]
        return out

    oben_frei = ~nachbar(0, 0, 1)
    vorn_y = ~nachbar(0, 1, 0)  # linke Fläche (+y)
    vorn_x = ~nachbar(1, 0, 0)  # rechte Fläche (+x)
    sichtbar = voll & (oben_frei | vorn_y | vorn_x)
    # AO: wie viele Nachbarn rund um die Fläche besetzt sind
    ao_oben = sum(nachbar(dx, dy, 1).astype(float) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
    ao_l = sum(nachbar(dx, 1, dz).astype(float) for dx, dz in ((1, 0), (-1, 0), (0, 1)))
    ao_r = sum(nachbar(1, dy, dz).astype(float) for dy, dz in ((1, 0), (-1, 0), (0, 1)))
    W, H = breite * s, hoehe * s
    bild = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    abend = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(bild)
    da = ImageDraw.Draw(abend)
    cx, cy0 = breite / 2, hoehe - 4 - n_felder * HH

    def pt(x, y, z):
        return ((cx + (x - y) * HW) * s, (cy0 + (x + y) * HH - z * ZE) * s)

    ii, jj, kk = np.nonzero(sichtbar)
    reihen = np.argsort(ii + jj + kk * 1.0001, kind="stable")
    # Einlagen (Fenster) auf Würfel abbilden: Mittelpunkt der Würfelfläche prüfen
    for r in reihen:
        i, j, k = ii[r], jj[r], kk[r]
        x, y, z = gx[i], gy[j], gz[k]
        kor = sz.koerper[gitter[i, j, k]]
        basis = lin(kor.farbe)
        mat = kor.mat
        h = hashf(np.array([i]), np.array([j * 131 + k]))[0]
        if mat == "stein":
            reihe = k // 2
            stein = (i + j + (reihe % 2) * 2) // 3
            t = hashf(np.array([reihe]), np.array([stein]))[0]
            basis = basis * (0.85 + 0.25 * t)
        elif mat in ("ziegel", "schiefer", "kupfer"):
            basis = basis * (0.8 + 0.25 * ((k % 2) * 0.6 + h * 0.4))
        else:
            basis = basis * (0.92 + 0.12 * h)
        x0, x1, y0, y1 = x - v / 2, x + v / 2, y - v / 2, y + v / 2
        z0, z1 = z - vz / 2, z + vz / 2
        glas = False
        for e in sz.einlagen:
            if e["seite"] == "l":
                hit = abs(y1 - e["w"]) < v * 0.8 and abs(x - e["u"]) < e["b"] / 2 + v * 0.2
            elif e["seite"] == "r":
                hit = abs(x1 - e["w"]) < v * 0.8 and abs(y - e["u"]) < e["b"] / 2 + v * 0.2
            else:
                ww = math.atan2(y - e["cy"], x - e["cx"])
                dw = (ww - e["winkel"] + math.pi) % (2 * math.pi) - math.pi
                hit = abs(math.hypot(x - e["cx"], y - e["cy"]) - e["r"]) < v * 0.9 and abs(dw * e["r"]) < e["b"] / 2 + v * 0.3
            if hit and e["z0"] <= z <= e["z0"] + e["h"] * 1.25:
                glas = e["art"] == "fenster"
                basis = lin((44, 52, 66)) if glas else lin((96, 62, 36))
                break
        flaechen = []
        if oben_frei[i, j, k]:
            flaechen.append(([pt(x0, y0, z1), pt(x1, y0, z1), pt(x1, y1, z1), pt(x0, y1, z1)], 1.0 - 0.07 * ao_oben[i, j, k]))
        if vorn_y[i, j, k]:
            flaechen.append(([pt(x0, y1, z0), pt(x1, y1, z0), pt(x1, y1, z1), pt(x0, y1, z1)], 0.62 - 0.06 * ao_l[i, j, k]))
        if vorn_x[i, j, k]:
            flaechen.append(([pt(x1, y0, z0), pt(x1, y1, z0), pt(x1, y1, z1), pt(x1, y0, z1)], 0.8 - 0.06 * ao_r[i, j, k]))
        for pts, licht in flaechen:
            c = srgb(basis * licht * 1.15)
            farbe = tuple(int(round(q * 255)) for q in c) + (255,)
            d.polygon(pts, fill=farbe, outline=tuple(int(q * 0.86) for q in farbe[:3]) + (255,))
            if glas:
                da.polygon(pts, fill=(255, 200, 90, 255))
            elif farbe:
                da.polygon(pts, fill=(0, 0, 0, 0))
    return bild.resize((breite, hoehe), Image.LANCZOS), abend.resize((breite, hoehe), Image.LANCZOS)
