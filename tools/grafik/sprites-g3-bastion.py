#!/usr/bin/env python3
"""G3, Charge 1: Bergfried Thema `bastion`, Epoche 1, Stufen 1–3 (FOKUS.md Paket G).

Eigener Generator nach der Stil-Regel GRAFIK-SPRITES.md §12 (Entscheidung PV
01.11.2026: eigener Generator für alles, aus einem Guss). Grundlage ist das
Probestück (a) (`tools/grafik/probe/bergfried-a-generator.py`, bleibt als Beleg).

Stufen-Sprache (§12.6, Tabelle §12.8):
  1 Holzturm   – Holz auf niedrigem Steinsockel, Schindeldach, eine Tür
  2 Fachwerk   – Steinsockel-Geschoss, vorkragendes Fachwerk, Ziegeldach, Anbau, Banner
  3 Stein      – hoher Steinturm, Zinnenkranz, Turmaufsatz mit Helm, runder Seitenturm, Fahne

Schreibt `gebaeude/bastion/e1/kern_s{1,2,3}.png` und `*_fenster.png` in den Atlas
und ersetzt die passenden Einträge in `manifest.json` (andere bleiben unverändert).
Aufruf: python3 tools/grafik/sprites-g3-bastion.py
Deterministisch, ohne Zufall. Raster wie iso.ts (Raute 48×24 logisch, hier 2× gezeichnet);
die untere Ecke des Fußabdrucks liegt 4 px über dem Bildrand wie bei P3 (`canvas_for`).
"""
from __future__ import annotations

import json
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw

HW, HH = 48, 24  # halbe Rautenbreite/-höhe je Feld (2×)
BREITE, ROH_H = 296, 560

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


def hell(c: tuple[int, int, int], d: int) -> tuple[int, int, int]:
    return tuple(max(0, min(255, v + d)) for v in c)  # type: ignore[return-value]


class Iso:
    def __init__(self, bild: Image.Image) -> None:
        self.d = ImageDraw.Draw(bild)
        self.cx = BREITE / 2
        self.cy0 = ROH_H - 4 - 3 * HH  # Mitte des 3×3-Fußabdrucks

    def p(self, x: float, y: float, z: float) -> tuple[float, float]:
        return (self.cx + (x - y) * HW, self.cy0 + (x + y) * HH - z)

    def poly(self, pts, farbe, kontur=None) -> None:
        self.d.polygon([(round(a), round(b)) for a, b in pts], fill=farbe, outline=kontur)

    def linie(self, a, b, farbe, w: int = 1) -> None:
        self.d.line([tuple(map(round, a)), tuple(map(round, b))], fill=farbe, width=w)

    # —— Grundkörper ——
    def quader(self, x0, x1, y0, y1, z0, z1, wand, dach=None, *, links=-34, rechts=-12) -> None:
        p = self.p
        self.poly([p(x0, y1, z0), p(x1, y1, z0), p(x1, y1, z1), p(x0, y1, z1)], hell(wand, links))
        self.poly([p(x1, y0, z0), p(x1, y1, z0), p(x1, y1, z1), p(x1, y0, z1)], hell(wand, rechts))
        self.poly([p(x0, y0, z1), p(x1, y0, z1), p(x1, y1, z1), p(x0, y1, z1)], dach or hell(wand, 14))
        for a, b in [((x0, y1, z0), (x1, y1, z0)), ((x1, y1, z0), (x1, y0, z0)), ((x1, y1, z0), (x1, y1, z1))]:
            self.linie(p(*a), p(*b), KONTUR)

    def textur_stein(self, x0, x1, y0, y1, z0, z1, schritt=14) -> None:
        p = self.p
        for i, z in enumerate(range(int(z0) + schritt, int(z1), schritt)):
            self.linie(p(x0, y1, z), p(x1, y1, z), hell(STEIN_FUGE, -10))
            self.linie(p(x1, y1, z), p(x1, y0, z), STEIN_FUGE)
            versatz = 0.5 if i % 2 else 0.0
            for k in range(4):
                u = (k + versatz) / 4
                zo = min(z + schritt, z1)
                self.linie(p(x0 + (x1 - x0) * u, y1, z), p(x0 + (x1 - x0) * u, y1, zo), hell(STEIN_FUGE, -10))
                self.linie(p(x1, y1 - (y1 - y0) * u, z), p(x1, y1 - (y1 - y0) * u, zo), STEIN_FUGE)

    def textur_holz(self, x0, x1, y0, y1, z0, z1, n=7) -> None:
        p = self.p
        for k in range(1, n):
            u = k / n
            self.linie(p(x0 + (x1 - x0) * u, y1, z0), p(x0 + (x1 - x0) * u, y1, z1), HOLZ_FUGE)
            self.linie(p(x1, y1 - (y1 - y0) * u, z0), p(x1, y1 - (y1 - y0) * u, z1), hell(HOLZ_FUGE, 12))

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
        self.poly([p(x0, y1, z), p(x1, y1, z), spitze], hell(farbe, -22), KONTUR)
        self.poly([p(x1, y1, z), p(x1, y0, z), spitze], hell(farbe, 16), KONTUR)
        # Ziegelreihen
        for t in (0.25, 0.5, 0.75):
            a = lambda q: (q[0] + (spitze[0] - q[0]) * t, q[1] + (spitze[1] - q[1]) * t)  # noqa: E731
            self.linie(a(p(x0, y1, z)), a(p(x1, y1, z)), hell(farbe, -40))
            self.linie(a(p(x1, y1, z)), a(p(x1, y0, z)), hell(farbe, -6))
        return spitze

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
        return pts

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


# —— Stufen ——————————————————————————————————————————————


def stufe1(iso: Iso, fenster: list) -> None:
    schatten(iso, 0.95)
    iso.quader(-0.78, 0.78, -0.78, 0.78, 0, 14, SOCKEL)
    iso.textur_stein(-0.78, 0.78, -0.78, 0.78, 0, 14, 7)
    iso.quader(-0.66, 0.66, -0.66, 0.66, 14, 118, HOLZ, links=-40, rechts=-8)
    iso.textur_holz(-0.66, 0.66, -0.66, 0.66, 14, 118)
    # Tür links, Fenster rechts
    iso.fenster_l(0.05, 0.66, 14, b=0.3, h=34, farbe=(70, 46, 28))
    fenster.append(iso.fenster_r(0.66, -0.1, 70, b=0.2, h=20))
    iso.pyramide(-0.66, 0.66, -0.66, 0.66, 118, 58, SCHINDEL, ueber=0.14)


def stufe2(iso: Iso, fenster: list) -> None:
    schatten(iso, 1.25)
    # Anbau links vorne: Holzschuppen mit Pultdach-Pyramide
    iso.quader(-1.3, -0.35, 0.55, 1.35, 0, 52, HOLZ, links=-40, rechts=-8)
    iso.textur_holz(-1.3, -0.35, 0.55, 1.35, 0, 52, 6)
    iso.fenster_l(-0.82, 1.35, 0, b=0.32, h=32, farbe=(70, 46, 28), bogen=False)
    iso.pyramide(-1.3, -0.35, 0.55, 1.35, 52, 30, SCHINDEL, ueber=0.08)
    # Hauptturm: Steingeschoss
    iso.quader(-0.8, 0.8, -0.8, 0.8, 0, 96, STEIN)
    iso.textur_stein(-0.8, 0.8, -0.8, 0.8, 0, 96)
    iso.fenster_l(0.35, 0.8, 0, b=0.32, h=36, farbe=(70, 46, 28))
    fenster.append(iso.fenster_r(0.8, 0.0, 44, b=0.18, h=22))
    # vorkragendes Fachwerk
    iso.quader(-0.9, 0.9, -0.9, 0.9, 96, 186, PUTZ, links=-30, rechts=-6)
    iso.textur_fachwerk(-0.9, 0.9, -0.9, 0.9, 96, 186)
    fenster.append(iso.fenster_l(-0.3, 0.9, 112, b=0.2, h=26, bogen=False))
    fenster.append(iso.fenster_l(0.3, 0.9, 150, b=0.2, h=22, bogen=False))
    fenster.append(iso.fenster_r(0.9, -0.3, 112, b=0.2, h=26, bogen=False))
    iso.banner_r(0.9, 0.42, 92, 52, PETROL)
    spitze = iso.pyramide(-0.9, 0.9, -0.9, 0.9, 186, 92, ZIEGEL, ueber=0.16)
    iso.fahne(spitze, 40, PETROL_HELL)


def stufe3(iso: Iso, fenster: list) -> None:
    schatten(iso, 1.42)
    # Mauerstück hinten rechts mit Zinnen
    iso.quader(-0.2, 1.4, -1.4, -0.9, 0, 70, STEIN)
    iso.textur_stein(-0.2, 1.4, -1.4, -0.9, 0, 70)
    iso.zinnen(-0.2, 1.4, -1.4, -0.9, 70, 12, STEIN, n=4)
    # Hauptturm: hoher Steinturm
    iso.quader(-0.82, 0.82, -0.82, 0.82, 0, 250, STEIN)
    iso.textur_stein(-0.82, 0.82, -0.82, 0.82, 0, 250)
    iso.fenster_l(0.3, 0.82, 0, b=0.34, h=40, farbe=(70, 46, 28))
    for z in (78, 140, 196):
        fenster.append(iso.fenster_l(-0.3, 0.82, z))
        fenster.append(iso.fenster_r(0.82, -0.3, z))
    iso.banner_r(0.82, 0.32, 236, 70, PETROL)
    # Kragsims und Zinnenkranz
    iso.quader(-0.95, 0.95, -0.95, 0.95, 244, 254, hell(STEIN, -8))
    # Turmaufsatz mit Helm (hinter den vorderen Zinnen)
    iso.quader(-0.42, 0.42, -0.42, 0.42, 254, 300, STEIN)
    iso.textur_stein(-0.42, 0.42, -0.42, 0.42, 254, 300)
    fenster.append(iso.fenster_l(0.0, 0.42, 266, b=0.14, h=16))
    spitze = iso.pyramide(-0.42, 0.42, -0.42, 0.42, 300, 78, ZIEGEL, ueber=0.1)
    iso.fahne(spitze, 44, PETROL_HELL)
    # vordere Zinnen des Kranzes
    w = 0.16
    for k in range(4):
        u0 = -0.95 + 1.9 * k / 4
        iso.quader(u0 + 0.22, u0 + 0.475, 0.95 - w, 0.95, 254, 272, STEIN)
        iso.quader(0.95 - w, 0.95, u0 + 0.22, u0 + 0.475, 254, 272, STEIN)
    # runder Seitenturm links vorne
    iso.zylinder(-0.55, 1.05, 0.42, 0, 168, STEIN)
    fenster.append([])
    iso.kegel(-0.55, 1.05, 0.52, 168, 82, ZIEGEL)
    cx, cy = iso.p(-0.55, 1.05, 0)
    rx = 0.42 * HW * math.sqrt(2)
    for fz in (60, 112):
        pts = [(cx - 6, cy + rx * 0.0 - fz), (cx + 6, cy - fz), (cx + 6, cy - fz - 20), (cx, cy - fz - 26), (cx - 6, cy - fz - 20)]
        pts = [(a, b + 0.42 * HH * math.sqrt(2)) for a, b in pts]
        iso.poly(pts, FENSTER_TAG, KONTUR)
        fenster.append(pts)


def erzeuge(stufe: int) -> tuple[Image.Image, Image.Image]:
    bild = Image.new("RGBA", (BREITE, ROH_H), (0, 0, 0, 0))
    iso = Iso(bild)
    fenster: list = []
    {1: stufe1, 2: stufe2, 3: stufe3}[stufe](iso, fenster)
    abend = Image.new("RGBA", bild.size, (0, 0, 0, 0))
    da = ImageDraw.Draw(abend)
    for pts in fenster:
        if pts:
            da.polygon([(round(a), round(b)) for a, b in pts], fill=FENSTER_ABEND)
    box = bild.getbbox()
    assert box
    oben = max(0, box[1] - 4)
    return bild.crop((0, oben, BREITE, ROH_H)), abend.crop((0, oben, BREITE, ROH_H))


WURZEL = Path(__file__).resolve().parents[2]
ATLAS = WURZEL / "public" / "grafik" / "atlas"


def main() -> int:
    manifest_pfad = ATLAS / "manifest.json"
    manifest = json.loads(manifest_pfad.read_text(encoding="utf-8"))
    neu: dict[str, dict] = {}
    for s in (1, 2, 3):
        bild, abend = erzeuge(s)
        for name, b in ((f"kern_s{s}", bild), (f"kern_s{s}_fenster", abend)):
            rel = f"gebaeude/bastion/e1/{name}.png"
            pfad = ATLAS / rel
            pfad.parent.mkdir(parents=True, exist_ok=True)
            b.save(pfad, "PNG", optimize=True)
            neu[f"bastion/e1/{name}"] = {
                "id": f"bastion/e1/{name}",
                "datei": rel,
                "felder": [3, 3],
                "anker": {"x": 0.5, "y": 1.0},
                "pixel": {"w": b.width, "h": b.height},
            }
    gesehen = set()
    eintraege = []
    for e in manifest["eintraege"]:
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


if __name__ == "__main__":
    sys.exit(main())
