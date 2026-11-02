#!/usr/bin/env python3
"""G3: Bewohner der Bastion als Bilder aus dem eigenen Generator (GRAFIK.md §4.4,
GRAFIK-SPRITES.md §12.7).

Sechs Bewohner, für alle Themen gleich (der Code unterscheidet nicht nach Thema):
Gartenzwerg, Gärtnerin, Bücherwurm, Torhüter, Handwerkerin, Imkerin.
Je Bewohner 9 Bilder zu 64 × 64 (doppelte Größe, wie die Wesen):
  idle 3   – ruhig stehen (ruhen, lesen, schauen, wachen), leichtes Atmen
  arbeit 4 – die Tätigkeit der Rolle mit Werkzeug (gießen, kehren, pflanzen, ordnen,
             flicken, sammeln); die Bühne wählt den Zyklus nach der Tätigkeit
  react 2  – winkt nach dem Antippen
Maßstab §12.2: Mensch 30–34 Pixel hoch (Zwerg kleiner), Licht von rechts oben,
Kontur 120 nur am Rand, Palette §12.5 und Farben aus `bewohner.ts`.
Keine Waffen (Torhüter trägt einen Wimpelstab). Kein Zufall.

Schreibt `bewohner/<art>_<zyklus>_<i>.png` in den Atlas und ersetzt die passenden
Einträge in `manifest.json`; andere bleiben.
Aufruf: python3 tools/grafik/sprites-g3-bewohner.py
"""
from __future__ import annotations

import json
import math
import sys

from PIL import Image

sys.dont_write_bytecode = True
sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from g3_stil import ATLAS, PETROL, PETROL_HELL, Wesen, eintrag, hell, wesen_bodenschatten  # noqa: E402

HAUT = (240, 212, 186)
AUGE = (30, 26, 22)
HOLZ = (150, 104, 64)
STAHL = (150, 160, 172)
BLATT = (92, 140, 64)

ZYKLEN = {"idle": 3, "arbeit": 4, "react": 2}

# Farben wie bewohner.ts (Körper / Mütze), damit Rückfall und Bild zusammenpassen
ARTEN = {
    "zwerg": ((196, 92, 74), (176, 58, 46)),
    "gaertner": ((90, 143, 74), (210, 180, 110)),
    "bibliothek": ((106, 106, 170), (74, 74, 136)),
    "torhueter": ((106, 122, 138), (74, 90, 106)),
    "handwerk": ((138, 106, 58), (90, 64, 48)),
    "imker": ((201, 160, 58), (232, 216, 120)),
}


def arm_winkel(zyklus: str, frame: int) -> float:
    """Winkel des vorderen Arms in Grad (0 = hängt, 90 = waagerecht nach vorn)."""
    if zyklus == "react":
        return 150 + frame * 15
    if zyklus == "arbeit":
        return (20, 55, 80, 55)[frame % 4]
    return 12


def hand(schulter: tuple[float, float], winkel: float, laenge: float) -> tuple[float, float]:
    a = math.radians(winkel)
    return (schulter[0] + math.sin(a) * laenge, schulter[1] + math.cos(a) * laenge)


def person(art: str, zyklus: str, frame: int) -> Image.Image:
    w = Wesen()
    kleid, kopf = ARTEN[art]
    zwerg = art == "zwerg"
    k = 0.8 if zwerg else 1.0  # Zwerg kleiner (etwa 26 statt 32 Pixel)
    bob = (0, -0.6, 0)[frame % 3] if zyklus == "idle" else (-0.5 if zyklus == "arbeit" and frame % 2 else 0)
    fuss = 55.0

    def Y(v: float) -> float:  # Höhe über dem Fuß, skaliert
        return fuss - v * k + bob

    mx = 31.0
    wesen_bodenschatten(w, 8 if not zwerg else 7)
    # Beine
    hose = hell(kleid, -46)
    for bx in (mx - 3, mx + 3):
        w.strich((bx, Y(10)), (bx, fuss - 1), hose, 3.0 * k)
        w.oval(bx - 2.6, fuss - 3, bx + 3, fuss + 0.6, (60, 42, 30), kontur=False)
    # Körper (Kittel/Kleid): links dunkler, rechts heller
    breit = 7.5 if art in ("gaertner", "imker", "bibliothek") else 6.5
    unten = 6 if art in ("gaertner", "imker", "bibliothek") else 10
    w.form([(mx - breit, Y(unten)), (mx - 5.5, Y(23)), (mx + 5.5, Y(23)), (mx + breit, Y(unten))], kleid)
    w.form([(mx + 1, Y(22.5)), (mx + 5.5, Y(23)), (mx + breit, Y(unten)), (mx + 2, Y(unten))], hell(kleid, 22), kontur=False)
    if art == "handwerk":  # Schürze
        w.form([(mx - 3, Y(8)), (mx - 3, Y(18)), (mx + 4, Y(18)), (mx + 4, Y(8))], (220, 204, 170), kontur=False)
    if art == "torhueter":  # Gürtel und Petrol-Schärpe
        w.strich((mx - 6, Y(14)), (mx + 6, Y(14)), (92, 62, 40), 1.8)
        w.strich((mx - 4.5, Y(22)), (mx + 5, Y(12)), PETROL, 2.0)
    if art == "imker":  # helle Schutzjacke mit Streifen
        w.strich((mx - 6, Y(12)), (mx + 6.5, Y(12)), hell(kleid, -30), 1.2)
    # hinterer Arm
    w.strich((mx - 5, Y(21)), (mx - 6.5, Y(12)), hell(kleid, -26), 2.8 * k)
    # Kopf
    kr = 5.2 * k
    ky = Y(27.5)
    w.oval(mx - kr, ky - kr, mx + kr, ky + kr, HAUT)
    w.oval(mx + 1.8 * k, ky - 1, mx + 3.2 * k, ky + 0.4, AUGE, kontur=False)
    kopfbedeckung(w, art, mx, ky, kr, kopf)
    # vorderer Arm mit Werkzeug
    schulter = (mx + 4.5, Y(21))
    winkel = arm_winkel(zyklus, frame)
    h = hand(schulter, winkel, 9.5 * k)
    w.strich(schulter, h, hell(kleid, 6), 3.0 * k)
    w.oval(h[0] - 1.8, h[1] - 1.8, h[0] + 1.8, h[1] + 1.8, HAUT, kontur=False)
    if zyklus == "arbeit":
        werkzeug(w, art, h, frame)
    elif zyklus == "idle":
        ruhe_ding(w, art, mx, Y)
    return w.fertig()


def kopfbedeckung(w: Wesen, art: str, mx: float, ky: float, kr: float, farbe) -> None:
    if art == "zwerg":  # rote Zipfelmütze, weißer Bart
        w.form([(mx - kr - 0.6, ky - 1), (mx - 1, ky - kr - 10), (mx + kr + 0.6, ky - 1)], farbe)
        w.form([(mx - 1, ky - kr - 10), (mx + kr + 0.6, ky - 1), (mx + 1.5, ky - 1)], hell(farbe, 24), kontur=False)
        w.form([(mx - kr + 1, ky + 1), (mx + kr - 0.5, ky + 1), (mx + 1.5, ky + kr + 5)], (244, 240, 232))
    elif art == "gaertner":  # breiter Strohhut mit grünem Band
        w.oval(mx - kr - 3.5, ky - 3.5, mx + kr + 3.5, ky - 0.5, farbe)
        w.form([(mx - kr + 0.5, ky - 2), (mx - kr + 1.5, ky - kr - 1.5), (mx + kr - 1.5, ky - kr - 1.5), (mx + kr - 0.5, ky - 2)], hell(farbe, 10))
        w.strich((mx - kr + 0.8, ky - 2.8), (mx + kr - 0.8, ky - 2.8), (58, 106, 56), 1.4)
    elif art == "bibliothek":  # Gelehrtenkappe, Brille
        w.form([(mx - kr - 0.5, ky - 1.5), (mx - kr + 0.5, ky - kr - 1.5), (mx + kr - 0.5, ky - kr - 1.5), (mx + kr + 0.5, ky - 1.5)], farbe)
        w.oval(mx - 1.2, ky - kr - 3.5, mx + 1.2, ky - kr - 1.2, PETROL_HELL, kontur=False)
        w.oval(mx + 0.8, ky - 2, mx + 4.6, ky + 1.4, (210, 220, 228))
    elif art == "torhueter":  # runde Kappe aus Stahl
        w.form([(mx - kr - 0.8, ky - 0.5), (mx - kr, ky - kr), (mx, ky - kr - 2.5), (mx + kr, ky - kr), (mx + kr + 0.8, ky - 0.5)], STAHL)
        w.form([(mx, ky - kr - 2.5), (mx + kr, ky - kr), (mx + kr + 0.8, ky - 0.5), (mx + 1.5, ky - 0.5)], hell(STAHL, 26), kontur=False)
    elif art == "handwerk":  # flache Kappe mit Schirm
        w.form([(mx - kr - 0.3, ky - 1.5), (mx - kr + 0.6, ky - kr - 0.8), (mx + kr - 0.6, ky - kr - 0.8), (mx + kr + 0.3, ky - 1.5)], farbe)
        w.form([(mx + kr - 1, ky - 2.2), (mx + kr + 4, ky - 1.2), (mx + kr - 0.5, ky - 0.6)], hell(farbe, -14))
    elif art == "imker":  # flacher Hut mit Schleier
        w.oval(mx - kr - 3, ky - kr - 1, mx + kr + 3, ky - kr + 2, farbe)
        w.form([(mx - kr + 0.5, ky - kr), (mx - kr + 1.5, ky - kr - 4), (mx + kr - 1.5, ky - kr - 4), (mx + kr - 0.5, ky - kr)], hell(farbe, 12))
        w.form([(mx - kr - 2.5, ky - kr + 1), (mx + kr + 2.5, ky - kr + 1), (mx + kr + 1.5, ky + kr - 0.5), (mx - kr - 1.5, ky + kr - 0.5)], (245, 240, 200, 120), kontur=False)


def werkzeug(w: Wesen, art: str, h: tuple[float, float], frame: int) -> None:
    x, y = h
    if art == "zwerg":  # Gießkanne, Tropfen beim Kippen
        w.form([(x - 1, y - 1), (x + 6, y - 1), (x + 6, y + 5), (x - 1, y + 5)], (90, 138, 170))
        w.strich((x + 6, y), (x + 10, y - 3 + frame), (90, 138, 170), 1.4)
        if frame in (1, 2):
            w.oval(x + 10, y + frame, x + 11.6, y + 1.6 + frame, (106, 176, 208), kontur=False)
    elif art == "gaertner":  # Spaten mit Pflänzchen
        w.strich((x, y - 6), (x + 2, y + 8), HOLZ, 1.6)
        w.form([(x + 0.5, y + 7), (x + 4, y + 7.5), (x + 3.5, y + 12), (x + 1, y + 11.5)], STAHL)
        if frame >= 2:
            w.oval(x + 4, y + 9, x + 7.5, y + 12, BLATT, kontur=False)
    elif art == "bibliothek":  # Buch, das geblättert wird
        w.form([(x - 1, y - 3), (x + 6, y - 4), (x + 6, y + 2), (x - 1, y + 3)], (232, 224, 200))
        w.strich((x + 2.5, y - 3.5), (x + 2.5, y + 2.5), (176, 168, 136), 0.8)
        w.form([(x + 2.5, y - 3.5), (x + 6, y - 4), (x + 6, y + 2), (x + 2.5, y + 2.5)], (122, 60, 52) if frame % 2 else (232, 224, 200))
    elif art == "torhueter":  # Wimpelstab (keine Waffe), wird geschwenkt
        w.strich((x, y + 6), (x, y - 16), (106, 90, 58), 1.6)
        weh = (0, 1.5, 3, 1.5)[frame]
        w.form([(x, y - 16), (x + 8, y - 13 + weh), (x, y - 10)], PETROL)
    elif art == "handwerk":  # Hammer klopft auf ein Brett
        w.strich((x, y), (x + 1 + frame, y - 7 + frame), HOLZ, 1.6)
        w.form([(x - 1 + frame, y - 9 + frame), (x + 4 + frame, y - 8.5 + frame), (x + 4 + frame, y - 6 + frame), (x - 1 + frame, y - 6.5 + frame)], (90, 90, 90))
        w.form([(36, 52), (50, 50), (50, 52.5), (36, 54.5)], (196, 150, 98))
    elif art == "imker":  # Korb mit Waben, Biene
        w.oval(x - 1, y - 1, x + 8, y + 5, (138, 90, 42))
        w.oval(x + 1, y - 2.5, x + 6, y + 0.5, (236, 196, 80), kontur=False)
        bx, by = x + 9 + (0, 2, 3, 1)[frame], y - 8 + (0, -1, 1, 0)[frame]
        w.oval(bx - 1.5, by - 1, bx + 1.5, by + 1, (236, 196, 64), kontur=False)
        w.strich((bx - 0.3, by - 1), (bx - 0.3, by + 1), AUGE, 0.6)


def ruhe_ding(w: Wesen, art: str, mx: float, Y) -> None:
    """Ein ruhiges Merkmal im Stehen, damit man die Rolle auch ohne Tätigkeit erkennt."""
    if art == "bibliothek":
        w.form([(mx + 3, Y(19)), (mx + 8, Y(19.5)), (mx + 8, Y(14)), (mx + 3, Y(13.5))], (122, 60, 52))
    elif art == "torhueter":
        x = mx + 10
        w.strich((x, Y(1)), (x, Y(33)), (106, 90, 58), 1.6)
        w.form([(x, Y(33)), (x + 7, Y(30.5)), (x, Y(28))], PETROL)
    elif art == "imker":
        w.oval(mx + 6, Y(9), mx + 14, Y(3), (138, 90, 42))
    elif art == "gaertner":
        w.strich((mx + 10, Y(1)), (mx + 9, Y(20)), HOLZ, 1.6)
        w.form([(mx + 8, Y(0.5)), (mx + 12, Y(0.5)), (mx + 11.5, Y(4)), (mx + 8.5, Y(4))], STAHL)


def main() -> int:
    manifest_pfad = ATLAS / "manifest.json"
    manifest = json.loads(manifest_pfad.read_text(encoding="utf-8"))
    neu: dict[str, dict] = {}
    for art in ARTEN:
        for zyklus, n in ZYKLEN.items():
            for i in range(n):
                bild = person(art, zyklus, i)
                rel = f"bewohner/{art}_{zyklus}_{i}.png"
                pfad = ATLAS / rel
                pfad.parent.mkdir(parents=True, exist_ok=True)
                bild.save(pfad, "PNG", optimize=True)
                neu[f"bewohner/{art}_{zyklus}_{i}"] = eintrag(f"bewohner/{art}_{zyklus}_{i}", rel, 1, bild)
    eintraege = [neu.pop(e["id"]) if e["id"] in neu else e for e in manifest["eintraege"]]
    eintraege.extend(neu.values())
    manifest["eintraege"] = eintraege
    manifest_pfad.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(len(ARTEN) * sum(ZYKLEN.values()), "Bewohner-Bilder")
    return 0


if __name__ == "__main__":
    sys.exit(main())
