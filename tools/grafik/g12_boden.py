#!/usr/bin/env python3
"""G12: Boden-Kacheln im Stil „weich gerendert“ (GRAFIK-SPRITES.md §13).

Jede Kachel (Raute 96 × 48) bekommt ein Höhenrelief (Halme, Steine, Pflaster mit
gerundeten Kanten, Sandrippel, Krater, Platten) und wird mit demselben Licht wie die
Gebäude schattiert (`raum.LICHT`). Das Rauschen wiederholt sich genau einmal je Kachel,
darum passen die Kacheln nahtlos aneinander; die Kante der Raute bleibt hart.
Ebene Flächen behalten ihre Grundfarbe, damit die Tönung der App gleich bleibt.

Bedeutung je Thema und Epoche wie bisher (`sprites-g3-boden.py`): `flaeche`,
`flaeche_b` (Abwechslung), `flaeche_hell` (Akzent), `rand` (Inselrand).
Aufruf: python3 tools/grafik/g12_boden.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from raum import LICHT, lin, srgb  # noqa: E402

ATLAS = Path(__file__).resolve().parents[2] / "public" / "grafik" / "atlas"
W, H, S = 96, 48, 4

# Rautenkoordinaten je Bildpunkt (u, v ∈ [0, 1) innen)
_jj, _ii = np.mgrid[0:H * S, 0:W * S]
_x = (_ii + 0.5) / S
_y = (_jj + 0.5) / S
U = ((_x - 48) / 48 + _y / 24) / 2
V = (_y / 24 - (_x - 48) / 48) / 2


def _hash(a, b, s):
    x = (a.astype(np.int64) * 374761393 + b.astype(np.int64) * 668265263 + s * 2147483647) & 0xFFFFFFFF
    x = (x ^ (x >> 13)) * 1274126177 & 0xFFFFFFFF
    return ((x ^ (x >> 16)) & 0xFFFF) / 0xFFFF


def rauschen(p: int, seed: int) -> np.ndarray:
    """Wertrauschen mit Periode 1 Kachel (p Zellen je Kante): nahtlos."""
    a, b = U * p, V * p
    ia, ib = np.floor(a), np.floor(b)
    fa, fb = a - ia, b - ib
    fa, fb = fa * fa * (3 - 2 * fa), fb * fb * (3 - 2 * fb)
    ia, ib = ia.astype(np.int64) % p, ib.astype(np.int64) % p
    ja, jb = (ia + 1) % p, (ib + 1) % p
    v00, v10, v01, v11 = _hash(ia, ib, seed), _hash(ja, ib, seed), _hash(ia, jb, seed), _hash(ja, jb, seed)
    return (v00 * (1 - fa) + v10 * fa) * (1 - fb) + (v01 * (1 - fa) + v11 * fa) * fb


def folge(n: int, start: int, rand=0.12):
    x = start
    out = []
    for _ in range(n):
        x = (x * 1103515245 + 12345) % 2147483648
        u = rand + (1 - 2 * rand) * ((x >> 8) % 1000) / 1000
        x = (x * 1103515245 + 12345) % 2147483648
        v = rand + (1 - 2 * rand) * ((x >> 8) % 1000) / 1000
        out.append((u, v))
    return out


class Kachel:
    def __init__(self, grund) -> None:
        self.farbe = np.repeat(lin(grund)[None, :], U.size, axis=0).reshape(U.shape + (3,))
        self.hoehe = np.zeros(U.shape)

    def mischen(self, maske, farbe, t=1.0):
        m = (np.clip(maske, 0, 1) * t)[..., None]
        self.farbe = self.farbe * (1 - m) + lin(farbe)[None, None, :] * m

    def gras(self, halm, seed, *, dichte=22, staerke=1.0):
        fein = rauschen(dichte, seed)
        grob = rauschen(5, seed + 1)
        self.farbe *= (0.9 + 0.18 * grob)[..., None]
        self.mischen((fein - 0.55) * 3.2 * staerke, halm, 0.75)
        self.hoehe += 1.4 * fein * staerke + 0.8 * grob

    def flecken(self, farbe, seed, p=6, schwelle=0.62):
        self.mischen((rauschen(p, seed) - schwelle) * 5, farbe, 0.7)

    def steine(self, farbe, n, seed, r=0.06):
        for i, (u, v) in enumerate(folge(n, seed)):
            rr = r * (0.75 + 0.5 * ((i * 7) % 5) / 4)
            d = ((U - u) / rr) ** 2 + ((V - v) / (rr * 0.8)) ** 2
            m = np.clip(1 - d, 0, 1)
            self.mischen(m * 8, farbe)
            self.hoehe += np.sqrt(m) * 3.0

    def blumen(self, farben, n, seed):
        for i, (u, v) in enumerate(folge(n, seed)):
            d = ((U - u) / 0.035) ** 2 + ((V - v) / 0.035) ** 2
            m = np.clip(1 - d, 0, 1)
            self.mischen(m * 6, farben[i % len(farben)])
            self.hoehe += np.sqrt(m) * 2.2

    def pflaster(self, k, fuge, toene, einzug=0.06, rund=0.18):
        a, b = U * k, V * k
        ia, ib = np.floor(a).astype(np.int64), np.floor(b).astype(np.int64)
        fa, fb = a - ia, b - ib
        rand = np.minimum(np.minimum(fa, 1 - fa), np.minimum(fb, 1 - fb))
        innen = rand > einzug
        ton = (ia * 3 + ib * 5 + (ia * ib) % 2) % len(toene)
        neu = np.zeros(U.shape + (3,))
        for t, c in enumerate(toene):
            neu[ton == t] = lin(c)
        neu *= (0.93 + 0.14 * rauschen(k * 6, 17))[..., None]
        self.farbe = np.where(innen[..., None], neu, lin(fuge)[None, None, :])
        self.hoehe += np.where(innen, np.clip((rand - einzug) / rund, 0, 1) ** 0.6 * 2.6, 0)

    def platten(self, k, fuge, breite=0.025):
        a, b = U * k, V * k
        fa, fb = a - np.floor(a), b - np.floor(b)
        rand = np.minimum(np.minimum(fa, 1 - fa), np.minimum(fb, 1 - fb))
        nut = rand < breite * k
        self.farbe *= (0.96 + 0.08 * rauschen(k * 4, 23))[..., None]
        self.mischen(nut.astype(float), fuge)
        self.hoehe += np.where(nut, -1.2, 0.4 * rauschen(16, 29))

    def streifen(self, farbe):
        self.mischen((V >= 0.5).astype(float), farbe, 0.6)

    def zelle(self, u0, u1, v0, v1, farbe, einzug=0.0, hoch=1.2):
        m = (U >= u0 + einzug) & (U < u1 - einzug) & (V >= v0 + einzug) & (V < v1 - einzug)
        self.mischen(m.astype(float), farbe)
        self.hoehe += m * hoch

    def sand(self, seed):
        rippel = np.sin(2 * np.pi * (U * 4 + V * 1) + 3 * rauschen(4, seed))
        self.farbe *= (0.95 + 0.06 * rippel + 0.08 * rauschen(18, seed + 3) - 0.04)[..., None]
        self.hoehe += 0.8 * rippel + 0.6 * rauschen(18, seed + 3)

    def halme(self, farbe, n, seed, laenge=0.09):
        for i, (u, v) in enumerate(folge(n, seed)):
            m = (np.abs(U - V - (u - v)) < 0.012) & (U + V > u + v - laenge) & (U + V < u + v)
            self.mischen(m.astype(float), farbe)
            self.hoehe += m * 2.0

    def krater(self, n, seed, r=0.1):
        for u, v in folge(n, seed, 0.2):
            d = np.sqrt(((U - u) / r) ** 2 + ((V - v) / (r * 0.8)) ** 2)
            self.hoehe += np.where(d < 1, -2.6 * (1 - d * d), np.where(d < 1.3, 1.2 * (1.3 - d) / 0.3, 0))

    def bild(self) -> Image.Image:
        # Normale aus dem Relief (Höhe in Bildpunkten der doppelten Größe)
        du = np.gradient(self.hoehe, axis=1) * S
        dv = np.gradient(self.hoehe, axis=0) * S
        # Bildachsen → Welt (u, v): x wächst mit u − v, y mit u + v
        gx = (du + dv * 2) / 2 / 48
        gy = (dv * 2 - du) / 2 / 48
        n = np.stack([-gx, -gy, np.ones_like(gx)], axis=-1)
        n /= np.linalg.norm(n, axis=-1, keepdims=True)
        eben = 0.6 + 0.62 * LICHT[2]
        licht = (0.6 + 0.62 * np.clip(n @ LICHT, 0, 1)) / eben
        rgb = srgb(self.farbe * licht[..., None])
        gross = Image.fromarray((rgb * 255).round().astype(np.uint8), "RGB").convert("RGBA")
        klein = gross.resize((W, H), Image.LANCZOS)
        maske = Image.new("L", (W, H), 0)
        ImageDraw.Draw(maske).polygon([(48, 0), (96, 24), (48, 48), (0, 24)], fill=255)
        klein.putalpha(maske)
        return klein


def hell(c, d):
    return tuple(max(0, min(255, v + d)) for v in c)


RASEN, RASEN_H, RASEN_D, INSELRAND = (103, 162, 74), (134, 184, 92), (91, 147, 66), (28, 49, 36)
STEIN, STEIN_FUGE, KIES = (176, 164, 146), (120, 108, 94), (196, 186, 164)
DORF_WIESE, LEHM_WEG, KOPF = (116, 164, 76), (190, 164, 118), (150, 140, 126)
G_RASEN, G_RASEN_D, G_RASEN_H, BUCHS, ERDE, HOLZ = (95, 170, 72), (79, 154, 62), (124, 188, 90), (52, 104, 52), (96, 70, 48), (150, 104, 64)
SAND, SAND_D, SAND_H, UW_RAND = (214, 196, 150), (208, 190, 144), (226, 212, 172), (18, 48, 72)
MUSCHEL, KORALLENSTEIN, PERLMUTT, MESSING, SEEGRAS = (232, 208, 184), (206, 156, 132), (226, 222, 234), (200, 164, 84), (78, 140, 96)
REGOLITH, REGOLITH_D, FELS, WS_RAND = (150, 146, 140), (145, 141, 136), (112, 112, 128), (24, 28, 44)
PANEEL, PANEEL_D, LEUCHT = (176, 182, 192), (140, 146, 158), (110, 220, 220)
BLUETEN = [(236, 200, 90), (214, 92, 92), (244, 239, 228), (150, 120, 210)]


def wiese(grund, halm, seed, *, staerke=1.0):
    k = Kachel(grund)
    k.gras(halm, seed, staerke=staerke)
    k.flecken(hell(grund, -10), seed + 50)
    return k


def bastion(e):
    if e == 1:
        return {"flaeche": wiese(RASEN, RASEN_D, 3), "flaeche_b": wiese(hell(RASEN, -2), RASEN_D, 7), "flaeche_hell": wiese(RASEN_H, RASEN, 11), "rand": wiese(INSELRAND, hell(INSELRAND, 14), 5)}
    if e == 2:
        hl = wiese(hell(RASEN, 4), RASEN_D, 21)
        for u in (0.25, 0.5, 0.75):
            d = ((U - u) / 0.11) ** 2 + ((V - u) / 0.08) ** 2
            m = np.clip(1 - d, 0, 1)
            hl.mischen(m * 8, STEIN)
            hl.hoehe += np.sqrt(m) * 2.4
        b = wiese(hell(RASEN, -2), RASEN_D, 9)
        b.steine(KIES, 3, 31, 0.045)
        return {"flaeche": wiese(RASEN, RASEN_D, 4), "flaeche_b": b, "flaeche_hell": hl, "rand": wiese(INSELRAND, hell(INSELRAND, 14), 6)}
    if e == 3:
        hl = Kachel(STEIN_FUGE)
        hl.pflaster(4, hell(STEIN_FUGE, -6), [STEIN, hell(STEIN, -8), hell(STEIN, 6)])
        r = Kachel(hell(STEIN_FUGE, -24))
        r.platten(2, hell(STEIN_FUGE, -40))
        return {"flaeche": wiese(hell(RASEN, -2), RASEN_D, 41, staerke=0.6), "flaeche_b": wiese(hell(RASEN, -4), RASEN_D, 43, staerke=0.6), "flaeche_hell": hl, "rand": r}
    f = Kachel(STEIN)
    f.platten(2, hell(STEIN_FUGE, 14))
    b = Kachel(hell(STEIN, -3))
    b.platten(2, hell(STEIN_FUGE, 12))
    hl = Kachel(STEIN)
    hl.pflaster(3, hell(STEIN_FUGE, 14), [hell(STEIN, 10), hell(STEIN, -4)])
    hl.zelle(1 / 3, 2 / 3, 1 / 3, 2 / 3, (92, 156, 138), 0.06)
    r = Kachel(hell(STEIN_FUGE, -20))
    r.platten(2, hell(STEIN_FUGE, -36))
    return {"flaeche": f, "flaeche_b": b, "flaeche_hell": hl, "rand": r}


def dorf(e):
    rg = hell(DORF_WIESE, -50)
    if e == 1:
        hl = wiese(hell(DORF_WIESE, 14), DORF_WIESE, 13)
        hl.blumen(BLUETEN, 5, 61)
        return {"flaeche": wiese(DORF_WIESE, hell(DORF_WIESE, -18), 2), "flaeche_b": wiese(hell(DORF_WIESE, -2), hell(DORF_WIESE, -18), 8), "flaeche_hell": hl, "rand": wiese(rg, hell(rg, 12), 14)}
    if e == 2:
        hl = Kachel(LEHM_WEG)
        hl.flecken(hell(LEHM_WEG, -14), 71, p=9, schwelle=0.55)
        hl.hoehe += 0.8 * rauschen(14, 72)
        hl.steine(KOPF, 3, 73, 0.05)
        return {"flaeche": wiese(DORF_WIESE, hell(DORF_WIESE, -18), 15), "flaeche_b": wiese(hell(DORF_WIESE, -2), hell(DORF_WIESE, -18), 16), "flaeche_hell": hl, "rand": wiese(rg, hell(rg, 12), 17)}
    toene = [KOPF, hell(KOPF, -10), hell(KOPF, 8), hell(KOPF, -4)]
    if e == 3:
        hl = Kachel(KOPF)
        hl.pflaster(5, hell(KOPF, -30), toene, 0.05)
        r = Kachel(hell(KOPF, -40))
        r.pflaster(3, hell(KOPF, -56), [hell(KOPF, -34), hell(KOPF, -42)])
        return {"flaeche": wiese(hell(DORF_WIESE, -2), hell(DORF_WIESE, -16), 81, staerke=0.6), "flaeche_b": wiese(hell(DORF_WIESE, -4), hell(DORF_WIESE, -18), 83, staerke=0.6), "flaeche_hell": hl, "rand": r}
    f = Kachel(KOPF)
    f.pflaster(5, hell(KOPF, -28), toene, 0.05)
    b = Kachel(KOPF)
    b.pflaster(5, hell(KOPF, -28), toene[1:] + toene[:1], 0.05)
    hl = Kachel(hell(KOPF, 20))
    hl.platten(2, hell(KOPF, -16))
    hl.zelle(0.5, 1, 0, 0.5, hell(KOPF, 34))
    r = Kachel(hell(KOPF, -44))
    r.platten(2, hell(KOPF, -60))
    return {"flaeche": f, "flaeche_b": b, "flaeche_hell": hl, "rand": r}


def garten(e):
    if e == 1:
        hl = wiese(G_RASEN_H, G_RASEN, 23)
        hl.blumen(BLUETEN, 6, 91)
        return {"flaeche": wiese(G_RASEN, G_RASEN_D, 18), "flaeche_b": wiese(hell(G_RASEN, -2), G_RASEN_D, 19), "flaeche_hell": hl, "rand": wiese(BUCHS, hell(BUCHS, 16), 24)}
    if e == 2:
        f = wiese(G_RASEN, G_RASEN_D, 101, staerke=0.5)
        f.streifen(hell(G_RASEN, 10))
        b = wiese(hell(G_RASEN, -2), G_RASEN_D, 103, staerke=0.5)
        b.streifen(hell(G_RASEN, 8))
        hl = wiese(G_RASEN_H, G_RASEN, 107)
        hl.blumen(BLUETEN, 9, 105)
        r = wiese(BUCHS, hell(BUCHS, 14), 109)
        return {"flaeche": f, "flaeche_b": b, "flaeche_hell": hl, "rand": r}
    f = wiese(G_RASEN, G_RASEN_D, 111 + e, staerke=0.4)
    f.streifen(hell(G_RASEN, 10))
    b = wiese(hell(G_RASEN, -2), G_RASEN_D, 113 + e, staerke=0.4)
    b.streifen(hell(G_RASEN, 8))
    if e == 3:
        hl = wiese(G_RASEN, G_RASEN_D, 115, staerke=0.4)
        hl.zelle(0.2, 0.8, 0.2, 0.8, HOLZ, 0, 1.6)
        hl.zelle(0.2, 0.8, 0.2, 0.8, ERDE, 0.05, 0.4)
        hl.blumen(BLUETEN[:2], 6, 111)
        return {"flaeche": f, "flaeche_b": b, "flaeche_hell": hl, "rand": wiese(BUCHS, hell(BUCHS, 14), 113)}
    hl = Kachel(KIES)
    hl.steine(hell(KIES, -16), 14, 121, 0.04)
    hl.steine(hell(KIES, 10), 10, 125, 0.035)
    hl.zelle(0, 1, 0, 0.08, STEIN)
    r = Kachel(hell(KIES, -34))
    r.steine(hell(KIES, -48), 12, 123, 0.04)
    return {"flaeche": f, "flaeche_b": b, "flaeche_hell": hl, "rand": r}


def sandkachel(grund, seed):
    k = Kachel(grund)
    k.sand(seed)
    k.flecken(hell(grund, -12), seed + 5, p=8)
    return k


def unterwasser(e):
    r = sandkachel(UW_RAND, 131)
    if e == 1:
        hl = sandkachel(SAND_H, 133)
        hl.halme(SEEGRAS, 5, 135, 0.14)
        return {"flaeche": sandkachel(SAND, 137), "flaeche_b": sandkachel(SAND_D, 139), "flaeche_hell": hl, "rand": r}
    if e == 2:
        f = sandkachel(SAND, 141)
        f.steine(MUSCHEL, 2, 143, 0.05)
        b = sandkachel(SAND_D, 145)
        b.steine(MUSCHEL, 1, 147, 0.045)
        hl = sandkachel(SAND_H, 149)
        hl.steine(MUSCHEL, 4, 151, 0.055)
        hl.halme(SEEGRAS, 3, 153, 0.14)
        return {"flaeche": f, "flaeche_b": b, "flaeche_hell": hl, "rand": r}
    if e == 3:
        f = sandkachel(SAND, 155)
        f.steine(MUSCHEL, 1, 157, 0.045)
        hl = Kachel(KORALLENSTEIN)
        hl.pflaster(3, hell(KORALLENSTEIN, -30), [KORALLENSTEIN, hell(KORALLENSTEIN, 10), hell(KORALLENSTEIN, -8)])
        r3 = Kachel(hell(UW_RAND, 8))
        r3.platten(2, hell(UW_RAND, -6))
        return {"flaeche": f, "flaeche_b": sandkachel(SAND_D, 159), "flaeche_hell": hl, "rand": r3}
    f = Kachel(SAND_H)
    f.platten(2, hell(KORALLENSTEIN, -10))
    b = Kachel(hell(SAND_H, -3))
    b.platten(2, hell(KORALLENSTEIN, -12))
    hl = Kachel(PERLMUTT)
    hl.pflaster(4, hell(PERLMUTT, -40), [PERLMUTT, hell(PERLMUTT, -12), (200, 224, 230)], 0.05)
    r4 = Kachel(hell(UW_RAND, 8))
    r4.platten(2, hell(MESSING, -60))
    return {"flaeche": f, "flaeche_b": b, "flaeche_hell": hl, "rand": r4}


def regolith(grund, seed):
    k = Kachel(grund)
    k.hoehe += 0.9 * rauschen(16, seed)
    k.flecken(hell(grund, -10), seed + 1, p=7)
    k.krater(2, seed + 3)
    return k


def weltraum(e):
    r = regolith(WS_RAND, 161)
    if e == 1:
        hl = regolith(hell(REGOLITH, 10), 163)
        hl.steine(FELS, 2, 165, 0.06)
        return {"flaeche": regolith(REGOLITH, 167), "flaeche_b": regolith(REGOLITH_D, 169), "flaeche_hell": hl, "rand": r}
    if e == 2:
        hl = Kachel(PANEEL_D)
        hl.platten(2, hell(PANEEL_D, -24))
        hl.zelle(0.0, 1.0, 0.0, 0.1, (236, 196, 60), 0, 0.6)
        return {"flaeche": regolith(REGOLITH, 171), "flaeche_b": regolith(REGOLITH_D, 173), "flaeche_hell": hl, "rand": r}
    if e == 3:
        f = Kachel(PANEEL_D)
        f.platten(2, hell(PANEEL_D, -22))
        b = Kachel(hell(PANEEL_D, -3))
        b.platten(2, hell(PANEEL_D, -24))
        hl = Kachel(PANEEL)
        hl.platten(2, hell(PANEEL, -26))
        hl.zelle(0.35, 0.65, 0.35, 0.65, LEUCHT, 0.02, 0.3)
        r3 = Kachel(WS_RAND)
        r3.platten(2, hell(WS_RAND, 20))
        return {"flaeche": f, "flaeche_b": b, "flaeche_hell": hl, "rand": r3}
    f = Kachel(PANEEL)
    f.platten(2, hell(PANEEL, -26))
    b = Kachel(hell(PANEEL, -3))
    b.platten(2, hell(PANEEL, -28))
    hl = Kachel(PANEEL)
    hl.platten(2, LEUCHT, 0.04)
    r4 = Kachel(WS_RAND)
    r4.platten(2, hell(LEUCHT, -60), 0.04)
    return {"flaeche": f, "flaeche_b": b, "flaeche_hell": hl, "rand": r4}


THEMEN = {"bastion": bastion, "dorf": dorf, "garten": garten, "unterwasser": unterwasser, "weltraum": weltraum}


def main() -> int:
    manifest_pfad = ATLAS / "manifest.json"
    manifest = json.loads(manifest_pfad.read_text(encoding="utf-8"))
    alt = {e["id"]: e for e in manifest["eintraege"]}
    n = 0
    for thema, fn in THEMEN.items():
        for e in (1, 2, 3, 4):
            for name, k in fn(e).items():
                rel = f"boden/{thema}/e{e}/{name}.png"
                id_ = f"boden/{thema}/e{e}/{name}"
                bild = k.bild()
                (ATLAS / rel).parent.mkdir(parents=True, exist_ok=True)
                bild.save(ATLAS / rel, "PNG", optimize=True)
                if id_ not in alt:
                    raise SystemExit(f"unbekannte Kachel {id_}")
                n += 1
    print(n, "Boden-Kacheln geschrieben")
    return 0


if __name__ == "__main__":
    sys.exit(main())
