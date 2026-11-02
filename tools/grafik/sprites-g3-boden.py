#!/usr/bin/env python3
"""G3 Boden: Kacheln für alle fünf Themen und Epochen 1–4 (GRAFIK-SPRITES.md §12.7, §12.11).

Je Thema und Epoche vier Kacheln wie bisher (`boden/<thema>/e<N>/<kachel>`, 96 × 48,
Anker unten Mitte): `flaeche`, `flaeche_b` (leise Variante für das Schachbrett),
`flaeche_hell` (seltener Akzent) und `rand` (Ring außerhalb des Bauplatzes).

Stil-Regel für Boden: Raute ohne Kontur innen, keine Rauten-Linien zwischen den
Kacheln (kein Gitter im Bild); nur die Rand-Kachel trägt die Kontur 90 am Rand der
Raute. Muster (Halme, Steine, Pflaster, Fugen) kommen aus festen Listen, nicht aus
dem Zufall. Je Epoche etwas edler; der Boden bleibt ruhig und übertönt die Gebäude nicht.

Fugen und Pflaster liegen in Rauten-Koordinaten (u, v ∈ [0, 1]); Linien nur bei
u = i/k und v = i/k mit i < k, damit zwei Kacheln an ihrer Kante keine doppelte Fuge
bilden (nahtlos). Aufruf: python3 tools/grafik/sprites-g3-boden.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from g3_stil import ATLAS, hell  # noqa: E402

W, H = 96, 48

# feste Folge statt Zufall (gleiche Eingabe, gleiches Bild)
def folge(n: int, start: int) -> list[tuple[float, float]]:
    x = start
    pts = []
    for _ in range(n):
        x = (x * 1103515245 + 12345) % 2147483648
        u = 0.1 + 0.8 * ((x >> 8) % 1000) / 1000
        x = (x * 1103515245 + 12345) % 2147483648
        v = 0.1 + 0.8 * ((x >> 8) % 1000) / 1000
        pts.append((u, v))
    return pts


def rp(u: float, v: float) -> tuple[float, float]:
    """Rauten-Koordinate → Bildpunkt (oben (0,0), rechts (1,0), links (0,1), unten (1,1))."""
    return (48 + (u - v) * 48, (u + v) * 24)


class Kachel:
    def __init__(self, grund) -> None:
        self.bild = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.bild)
        self.grund = grund
        self.d.polygon([(48, 0), (96, 24), (48, 48), (0, 24)], fill=grund)

    def zelle(self, u0, u1, v0, v1, farbe, einzug=0.0) -> None:
        pts = [rp(u0 + einzug, v0 + einzug), rp(u1 - einzug, v0 + einzug), rp(u1 - einzug, v1 - einzug), rp(u0 + einzug, v1 - einzug)]
        self.d.polygon([(round(a), round(b)) for a, b in pts], fill=farbe)

    def halme(self, n: int, start: int, farbe, *, hoehe=3) -> None:
        for u, v in folge(n, start):
            x, y = rp(u, v)
            self.d.line([(x, y), (x - 1, y - hoehe)], fill=farbe)
            self.d.line([(x + 1, y), (x + 2, y - hoehe + 1)], fill=farbe)

    def flecken(self, n: int, start: int, farbe, r=1.5) -> None:
        for u, v in folge(n, start):
            x, y = rp(u, v)
            self.d.ellipse([x - r * 2, y - r, x + r * 2, y + r], fill=farbe)

    def steinchen(self, n: int, start: int, farbe, r=2.0) -> None:
        for i, (u, v) in enumerate(folge(n, start)):
            x, y = rp(u, v)
            rr = r * (0.8 + 0.4 * (i % 3) / 2)
            self.d.ellipse([x - rr * 1.6, y - rr, x + rr * 1.6, y + rr * 0.8], fill=hell(farbe, -18))
            self.d.ellipse([x - rr * 1.4, y - rr, x + rr * 1.3, y + rr * 0.5], fill=farbe)

    def pflaster(self, k: int, fuge, toene, einzug=0.035) -> None:
        """k × k Steine, Fuge = Grundfarbe dazwischen; Töne aus fester Tabelle."""
        self.d.polygon([(48, 0), (96, 24), (48, 48), (0, 24)], fill=fuge)
        for i in range(k):
            for j in range(k):
                ton = toene[(i * 3 + j * 5 + (i * j) % 2) % len(toene)]
                self.zelle(i / k, (i + 1) / k, j / k, (j + 1) / k, ton, einzug)

    def fugen(self, k: int, farbe, breite=1) -> None:
        for i in range(k):  # nur i < k: die Kante gehört der Nachbarkachel nicht doppelt
            self.d.line([rp(i / k, 0), rp(i / k, 1)], fill=farbe, width=breite)
            self.d.line([rp(0, i / k), rp(1, i / k)], fill=farbe, width=breite)

    def streifen(self, farbe) -> None:
        """Mähstreifen: zweite Hälfte jeder Kachel etwas heller (läuft über Kacheln weiter)."""
        self.zelle(0, 1, 0.5, 1, farbe)

    def blumen(self, n: int, start: int, farben) -> None:
        for i, (u, v) in enumerate(folge(n, start)):
            x, y = rp(u, v)
            self.d.ellipse([x - 1.5, y - 1.5, x + 1.5, y + 0.5], fill=farben[i % len(farben)])

    def rand(self) -> "Kachel":
        """Rand-Kachel: nur dunklerer Grund. Eine Kontur je Kachel würde auf dem Ring ein
        Gitter zeichnen (§12.7 „kein Gitter“); die Kante zum Bauplatz entsteht durch den
        Farbsprung."""
        return self


# —— Paletten (aus §12.5 / §12.10 und den alten Kacheln) ————————————————————————

RASEN = (103, 162, 74)          # #67A24A
RASEN_H = (134, 184, 92)        # #86B85C
RASEN_D = (91, 147, 66)         # #5B9342
INSELRAND = (28, 49, 36)        # #1C3124
STEIN = (176, 164, 146)
STEIN_FUGE = (120, 108, 94)
KIES = (196, 186, 164)
DORF_WIESE = (116, 164, 76)
LEHM_WEG = (190, 164, 118)
KOPF = (150, 140, 126)
G_RASEN = (95, 170, 72)          # #5FAA48
G_RASEN_D = (79, 154, 62)
G_RASEN_H = (124, 188, 90)
BUCHS = (52, 104, 52)
ERDE = (96, 70, 48)
HOLZ = (150, 104, 64)
SAND = (214, 196, 150)           # #D6C496 (Unterwasser-Palette §12.10)
SAND_D = (208, 190, 144)
SAND_H = (226, 212, 172)
UW_RAND = (18, 48, 72)           # #123048
MUSCHEL = (232, 208, 184)
KORALLENSTEIN = (206, 156, 132)
PERLMUTT = (226, 222, 234)
MESSING = (200, 164, 84)
SEEGRAS = (78, 140, 96)
REGOLITH = (150, 146, 140)       # neu: Mondstaub
REGOLITH_D = (145, 141, 136)
FELS = (112, 112, 128)           # #707080
WS_RAND = (24, 28, 44)
PANEEL = (176, 182, 192)
PANEEL_D = (140, 146, 158)
LEUCHT = (110, 220, 220)         # #6EDCDC Leuchtband
BLUETEN = [(236, 200, 90), (214, 92, 92), (244, 239, 228), (150, 120, 210)]


def wiese(grund, halm, n=14, start=1) -> Kachel:
    k = Kachel(grund)
    k.flecken(6, start + 50, hell(grund, -8), r=2.2)
    k.halme(n, start, halm)
    return k


def bastion(e: int) -> dict[str, Kachel]:
    if e == 1:
        return {
            "flaeche": wiese(RASEN, RASEN_D, start=3),
            "flaeche_b": wiese(hell(RASEN, -2), RASEN_D, start=7),
            "flaeche_hell": wiese(RASEN_H, RASEN, start=11),
            "rand": wiese(INSELRAND, hell(INSELRAND, 14), n=8, start=5).rand(),
        }
    if e == 2:  # Wiese mit Kies und Trittsteinen
        hl = Kachel(hell(RASEN, 4)); hl.halme(8, 21, RASEN_D)
        for u in (0.25, 0.5, 0.75):
            x, y = rp(u, u)
            hl.d.ellipse([x - 7, y - 3, x + 7, y + 3], fill=hell(STEIN, -20)); hl.d.ellipse([x - 6, y - 3, x + 6, y + 2], fill=STEIN)
        b = wiese(hell(RASEN, -2), RASEN_D, start=9); b.steinchen(3, 31, KIES, 1.6)
        return {
            "flaeche": wiese(RASEN, RASEN_D, start=4),
            "flaeche_b": b,
            "flaeche_hell": hl,
            "rand": wiese(INSELRAND, hell(INSELRAND, 14), n=8, start=6).rand(),
        }
    if e == 3:  # Burghof: kurzer Rasen, Pflaster als Akzent, Mauersockel am Rand
        hl = Kachel(STEIN_FUGE); hl.pflaster(4, hell(STEIN_FUGE, -6), [STEIN, hell(STEIN, -8), hell(STEIN, 6)])
        f = Kachel(hell(RASEN, -2)); f.halme(8, 41, RASEN_D, hoehe=2)
        b = Kachel(hell(RASEN, -4)); b.halme(8, 43, RASEN_D, hoehe=2)
        r = Kachel(hell(STEIN_FUGE, -24)); r.fugen(2, hell(STEIN_FUGE, -40))
        return {"flaeche": f, "flaeche_b": b, "flaeche_hell": hl, "rand": r.rand()}
    # e4 Zitadelle: Steinplatten-Hof
    f = Kachel(STEIN); f.fugen(2, hell(STEIN_FUGE, 14))
    b = Kachel(hell(STEIN, -3)); b.fugen(2, hell(STEIN_FUGE, 12))
    hl = Kachel(STEIN); hl.pflaster(3, hell(STEIN_FUGE, 14), [hell(STEIN, 10), hell(STEIN, -4)]); hl.zelle(1 / 3, 2 / 3, 1 / 3, 2 / 3, (92, 156, 138), 0.06)
    r = Kachel(hell(STEIN_FUGE, -20)); r.fugen(2, hell(STEIN_FUGE, -36))
    return {"flaeche": f, "flaeche_b": b, "flaeche_hell": hl, "rand": r.rand()}


def dorf(e: int) -> dict[str, Kachel]:
    rand_gruen = hell(DORF_WIESE, -50)
    if e == 1:
        hl = wiese(hell(DORF_WIESE, 14), DORF_WIESE, start=13); hl.blumen(5, 61, BLUETEN)
        return {
            "flaeche": wiese(DORF_WIESE, hell(DORF_WIESE, -18), start=2),
            "flaeche_b": wiese(hell(DORF_WIESE, -2), hell(DORF_WIESE, -18), start=8),
            "flaeche_hell": hl,
            "rand": wiese(rand_gruen, hell(rand_gruen, 12), n=8, start=14).rand(),
        }
    if e == 2:  # Feldweg aus Lehm
        hl = Kachel(LEHM_WEG); hl.flecken(8, 71, hell(LEHM_WEG, -14), 1.4); hl.steinchen(3, 73, KOPF, 1.4)
        return {
            "flaeche": wiese(DORF_WIESE, hell(DORF_WIESE, -18), start=15),
            "flaeche_b": wiese(hell(DORF_WIESE, -2), hell(DORF_WIESE, -18), start=16),
            "flaeche_hell": hl,
            "rand": wiese(rand_gruen, hell(rand_gruen, 12), n=8, start=17).rand(),
        }
    toene = [KOPF, hell(KOPF, -10), hell(KOPF, 8), hell(KOPF, -4)]
    if e == 3:  # Marktstadt: Kopfsteinpflaster als Akzent, Wiese gemäht
        f = Kachel(hell(DORF_WIESE, -2)); f.halme(7, 81, hell(DORF_WIESE, -16), hoehe=2)
        b = Kachel(hell(DORF_WIESE, -4)); b.halme(7, 83, hell(DORF_WIESE, -18), hoehe=2)
        hl = Kachel(KOPF); hl.pflaster(5, hell(KOPF, -30), toene, 0.04)
        r = Kachel(hell(KOPF, -40)); r.pflaster(3, hell(KOPF, -56), [hell(KOPF, -34), hell(KOPF, -42)])
        return {"flaeche": f, "flaeche_b": b, "flaeche_hell": hl, "rand": r.rand()}
    # e4 Residenzstadt: ganz gepflastert, helle Platten als Akzent
    f = Kachel(KOPF); f.pflaster(5, hell(KOPF, -28), toene, 0.04)
    b = Kachel(KOPF); b.pflaster(5, hell(KOPF, -28), toene[1:] + toene[:1], 0.04)
    hl = Kachel(hell(KOPF, 20)); hl.fugen(2, hell(KOPF, -16)); hl.zelle(0.5, 1, 0, 0.5, hell(KOPF, 34))
    r = Kachel(hell(KOPF, -44)); r.fugen(2, hell(KOPF, -60))
    return {"flaeche": f, "flaeche_b": b, "flaeche_hell": hl, "rand": r.rand()}


def garten(e: int) -> dict[str, Kachel]:
    if e == 1:
        hl = wiese(G_RASEN_H, G_RASEN, start=23); hl.blumen(6, 91, BLUETEN)
        return {
            "flaeche": wiese(G_RASEN, G_RASEN_D, start=18),
            "flaeche_b": wiese(hell(G_RASEN, -2), G_RASEN_D, start=19),
            "flaeche_hell": hl,
            "rand": wiese(BUCHS, hell(BUCHS, 16), n=8, start=24).rand(),
        }
    if e == 2:  # gemähter Rasen mit Streifen
        f = Kachel(G_RASEN); f.streifen(hell(G_RASEN, 8)); f.halme(5, 101, G_RASEN_D, hoehe=2)
        b = Kachel(hell(G_RASEN, -2)); b.streifen(hell(G_RASEN, 6)); b.halme(5, 103, G_RASEN_D, hoehe=2)
        hl = Kachel(G_RASEN_H); hl.blumen(9, 105, BLUETEN); hl.halme(4, 107, G_RASEN)
        r = Kachel(BUCHS); r.flecken(8, 109, hell(BUCHS, 14), 2.0)
        return {"flaeche": f, "flaeche_b": b, "flaeche_hell": hl, "rand": r.rand()}
    f = Kachel(G_RASEN); f.streifen(hell(G_RASEN, 8))
    b = Kachel(hell(G_RASEN, -2)); b.streifen(hell(G_RASEN, 6))
    if e == 3:  # Landschaftspark: Beet mit Holzkante als Akzent
        hl = Kachel(G_RASEN); hl.streifen(hell(G_RASEN, 8))
        hl.zelle(0.2, 0.8, 0.2, 0.8, HOLZ); hl.zelle(0.2, 0.8, 0.2, 0.8, ERDE, 0.05); hl.blumen(6, 111, BLUETEN[:2])
        r = Kachel(BUCHS); r.flecken(8, 113, hell(BUCHS, 14), 2.0)
        return {"flaeche": f, "flaeche_b": b, "flaeche_hell": hl, "rand": r.rand()}
    # e4 Botanischer Garten: Kiesweg mit Steinkante als Akzent, Rand Kies mit Hecke
    hl = Kachel(KIES); hl.flecken(10, 121, hell(KIES, -16), 1.2); hl.zelle(0, 1, 0, 0.08, STEIN)
    r = Kachel(hell(KIES, -34)); r.flecken(10, 123, hell(KIES, -48), 1.2)
    return {"flaeche": f, "flaeche_b": b, "flaeche_hell": hl, "rand": r.rand()}


def unterwasser(e: int) -> dict[str, Kachel]:
    def sand(grund, start) -> Kachel:
        k = Kachel(grund)
        k.flecken(10, start, hell(grund, -12), 1.2)
        k.flecken(4, start + 7, hell(grund, 10), 1.0)
        return k

    r = sand(UW_RAND, 131).rand()
    if e == 1:
        hl = sand(SAND_H, 133); hl.halme(4, 135, SEEGRAS, hoehe=5)
        return {"flaeche": sand(SAND, 137), "flaeche_b": sand(SAND_D, 139), "flaeche_hell": hl, "rand": r}
    if e == 2:  # Sand mit Muscheln
        f = sand(SAND, 141); f.steinchen(2, 143, MUSCHEL, 1.6)
        b = sand(SAND_D, 145); b.steinchen(1, 147, MUSCHEL, 1.4)
        hl = sand(SAND_H, 149); hl.steinchen(4, 151, MUSCHEL, 2.0); hl.halme(3, 153, SEEGRAS, hoehe=5)
        return {"flaeche": f, "flaeche_b": b, "flaeche_hell": hl, "rand": r}
    if e == 3:  # Korallenstein-Platten als Akzent
        f = sand(SAND, 155); f.steinchen(1, 157, MUSCHEL, 1.4)
        b = sand(SAND_D, 159)
        hl = Kachel(KORALLENSTEIN); hl.pflaster(3, hell(KORALLENSTEIN, -30), [KORALLENSTEIN, hell(KORALLENSTEIN, 10), hell(KORALLENSTEIN, -8)])
        r3 = Kachel(hell(UW_RAND, 8)); r3.fugen(2, hell(UW_RAND, -6))
        return {"flaeche": f, "flaeche_b": b, "flaeche_hell": hl, "rand": r3.rand()}
    # e4 Ozeanfeste: Korallenstein-Platten, Perlmutt-Mosaik als Akzent, Messingfugen am Rand
    f = Kachel(SAND_H); f.fugen(2, hell(KORALLENSTEIN, -10))
    b = Kachel(hell(SAND_H, -3)); b.fugen(2, hell(KORALLENSTEIN, -12))
    hl = Kachel(PERLMUTT); hl.pflaster(4, hell(PERLMUTT, -40), [PERLMUTT, hell(PERLMUTT, -12), (200, 224, 230)], 0.04)
    r4 = Kachel(hell(UW_RAND, 8)); r4.fugen(2, hell(MESSING, -60))
    return {"flaeche": f, "flaeche_b": b, "flaeche_hell": hl, "rand": r4.rand()}


def weltraum(e: int) -> dict[str, Kachel]:
    def regolith(grund, start) -> Kachel:
        k = Kachel(grund)
        k.flecken(9, start, hell(grund, -10), 1.4)
        for i, (u, v) in enumerate(folge(2, start + 3)):  # kleine Krater
            x, y = rp(u, v)
            k.d.ellipse([x - 5, y - 2, x + 5, y + 3], fill=hell(grund, -16))
            k.d.ellipse([x - 4, y - 1, x + 4, y + 3], fill=hell(grund, -6))
        return k

    r = regolith(WS_RAND, 161).rand()
    if e == 1:
        hl = regolith(hell(REGOLITH, 10), 163); hl.steinchen(2, 165, FELS, 2.2)
        return {"flaeche": regolith(REGOLITH, 167), "flaeche_b": regolith(REGOLITH_D, 169), "flaeche_hell": hl, "rand": r}
    if e == 2:  # Regolith, Metallplatte als Akzent
        hl = Kachel(PANEEL_D); hl.fugen(2, hell(PANEEL_D, -24)); hl.zelle(0.0, 1.0, 0.0, 0.1, (236, 196, 60))
        return {"flaeche": regolith(REGOLITH, 171), "flaeche_b": regolith(REGOLITH_D, 173), "flaeche_hell": hl, "rand": r}
    if e == 3:  # Platten mit Fugen
        f = Kachel(PANEEL_D); f.fugen(2, hell(PANEEL_D, -22))
        b = Kachel(hell(PANEEL_D, -3)); b.fugen(2, hell(PANEEL_D, -24))
        hl = Kachel(PANEEL); hl.fugen(2, hell(PANEEL, -26)); hl.zelle(0.35, 0.65, 0.35, 0.65, LEUCHT, 0.02)
        r3 = Kachel(WS_RAND); r3.fugen(2, hell(WS_RAND, 20))
        return {"flaeche": f, "flaeche_b": b, "flaeche_hell": hl, "rand": r3.rand()}
    # e4 Sternenfestung: helle Paneele mit Leuchtfugen
    f = Kachel(PANEEL); f.fugen(2, hell(PANEEL, -26))
    b = Kachel(hell(PANEEL, -3)); b.fugen(2, hell(PANEEL, -28))
    hl = Kachel(PANEEL); hl.fugen(2, LEUCHT, 2)
    r4 = Kachel(WS_RAND); r4.fugen(2, hell(LEUCHT, -60), 2)
    return {"flaeche": f, "flaeche_b": b, "flaeche_hell": hl, "rand": r4.rand()}


THEMEN = {"bastion": bastion, "dorf": dorf, "garten": garten, "unterwasser": unterwasser, "weltraum": weltraum}
KACHELN = ("flaeche", "rand", "flaeche_b", "flaeche_hell")


def alle() -> dict[str, Image.Image]:
    """id → Bild für alle Themen und Epochen."""
    aus = {}
    for thema, f in THEMEN.items():
        for e in (1, 2, 3, 4):
            satz = f(e)
            for k in KACHELN:
                aus[f"boden/{thema}/e{e}/{k}"] = satz[k].bild
    return aus


def main() -> int:
    pfad = ATLAS / "manifest.json"
    manifest = json.loads(pfad.read_text(encoding="utf-8"))
    bilder = alle()
    neu = {}
    for id_, b in bilder.items():
        rel = id_ + ".png"
        (ATLAS / rel).parent.mkdir(parents=True, exist_ok=True)
        b.save(ATLAS / rel, "PNG", optimize=True)
        neu[id_] = {"id": id_, "datei": rel, "felder": [1, 1], "anker": {"x": 0.5, "y": 1.0}, "pixel": {"w": W, "h": H}}
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
    pfad.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(len(neu), "Boden-Kacheln geschrieben")
    return 0


if __name__ == "__main__":
    sys.exit(main())
