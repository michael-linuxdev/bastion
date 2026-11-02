"""Gemeinsames Modul des G3-Generators (GRAFIK-SPRITES.md §12.1).

Raster, Licht, Kontur, Palette und Grundkörper für alle Themen, dazu das
Zeichnen von Wesen (64 × 64, vierfach gezeichnet) und das Schreiben in den
Atlas. Jedes Thema hat ein eigenes Skript (`sprites-g3-<thema>.py`), das nur
seine Formen und seine Materialleiter beschreibt. Gleiche Eingabe ergibt das
gleiche Bild (kein Zufall).
"""
from __future__ import annotations

import json
import math
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
    def __init__(self, bild: Image.Image, n: int = 3) -> None:
        self.d = ImageDraw.Draw(bild)
        self.cx = bild.width / 2
        self.cy0 = bild.height - 4 - n * HH  # Mitte des n×n-Fußabdrucks

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

    def satteldach(self, x0, x1, y0, y1, z, h, farbe, giebel, *, ueber=0.12) -> tuple[float, float]:
        """Satteldach, First parallel zur x-Achse. Sichtbar: vordere Dachfläche (+y) und der
        Giebel rechts (x1). Gibt die Mitte des Firsts zurück."""
        p = self.p
        ym = (y0 + y1) / 2
        a, b = x0 - ueber, x1 + ueber
        # hintere Dachfläche zuerst: von ihr bleibt rechts nur die Kante über dem Giebel sichtbar
        self.poly([p(a, ym, z + h), p(b, ym, z + h), p(b, y0 - ueber, z - 4), p(a, y0 - ueber, z - 4)], hell(farbe, 8), KONTUR)
        # Giebel rechts in Wandfarbe (rechte Fläche, heller)
        self.poly([p(x1, y1, z), p(x1, y0, z), p(x1, ym, z + h)], hell(giebel, -12), KONTUR)
        vorne = [p(a, y1 + ueber, z - 4), p(b, y1 + ueber, z - 4), p(b, ym, z + h), p(a, ym, z + h)]
        self.poly(vorne, hell(farbe, -18), KONTUR)
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




def erzeuge_mit(zeichne, n: int, breite: int) -> tuple[Image.Image, Image.Image]:
    """Zeichnet ein Gebäude mit n×n Feldern; schneidet oben den leeren Rand ab."""
    bild = Image.new("RGBA", (breite, ROH_H), (0, 0, 0, 0))
    iso = Iso(bild, n)
    fenster: list = []
    zeichne(iso, fenster)
    abend = Image.new("RGBA", bild.size, (0, 0, 0, 0))
    da = ImageDraw.Draw(abend)
    for pts in fenster:
        if pts:
            da.polygon([(round(a), round(b)) for a, b in pts], fill=FENSTER_ABEND)
    box = bild.getbbox()
    assert box
    oben = max(0, box[1] - 4)
    return bild.crop((0, oben, breite, ROH_H)), abend.crop((0, oben, breite, ROH_H))



WURZEL = Path(__file__).resolve().parents[2]
ATLAS = WURZEL / "public" / "grafik" / "atlas"

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
