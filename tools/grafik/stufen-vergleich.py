#!/usr/bin/env python3
"""Stufen-Vergleich der Gebäudebilder (Paket G1, FOKUS.md).

Legt alle Stufen je Thema, Epoche und Rolle nebeneinander – einmal als Bild,
einmal als schwarzer Umriss – und misst für jedes Paar aufeinanderfolgender
Stufen:

- Höhe: Wie viel höher ist das sichtbare Bild (Alpha) als die vorige Stufe?
- Umriss: Anteil der Fläche, in dem sich die Umrisse unterscheiden
  (XOR der Alpha-Masken geteilt durch ihre Vereinigung, ausgerichtet am Anker
  unten Mitte).

Aufruf:  pnpm grafik:stufen [--aus <ordner>] [--thema bastion] [--epoche 1]
Die Bilder landen im angegebenen Ordner (Standard: Temp-Ordner), nie im
Repository. Auf der Konsole erscheint eine Markdown-Tabelle mit den Messwerten.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import tempfile
from collections import defaultdict
from pathlib import Path

from PIL import Image, ImageDraw

WURZEL = Path(__file__).resolve().parents[2]
ATLAS = WURZEL / "public" / "grafik" / "atlas"
ALPHA_SCHWELLE = 32
ID_MUSTER = re.compile(r"^(?P<thema>[a-z]+)/e(?P<epoche>\d)/(?P<rolle>[a-z]+)_s(?P<stufe>\d+)$")
ROLLEN_FOLGE = ["kern", "wissen", "turm", "werkstatt", "eingang", "einfassung", "ursprung", "zeichen", "flaeche", "denkmal"]


def maske(bild: Image.Image) -> Image.Image:
    return bild.getchannel("A").point(lambda a: 255 if a >= ALPHA_SCHWELLE else 0)


def sichtbare_hoehe(bild: Image.Image) -> int:
    box = maske(bild).getbbox()
    return 0 if box is None else box[3] - box[1]


def umriss_unterschied(a: Image.Image, b: Image.Image) -> float:
    """XOR/Vereinigung der Alpha-Masken, beide am Fußpunkt (unten Mitte) ausgerichtet."""
    w = max(a.width, b.width)
    h = max(a.height, b.height)

    def auf_flaeche(bild: Image.Image) -> Image.Image:
        f = Image.new("L", (w, h), 0)
        f.paste(maske(bild), ((w - bild.width) // 2, h - bild.height))
        return f

    ma, mb = auf_flaeche(a), auf_flaeche(b)
    pa, pb = ma.tobytes(), mb.tobytes()
    vereinigung = sum(1 for x, y in zip(pa, pb) if x or y)
    xor = sum(1 for x, y in zip(pa, pb) if bool(x) != bool(y))
    return 0.0 if vereinigung == 0 else xor / vereinigung


def umriss_bild(bild: Image.Image) -> Image.Image:
    m = maske(bild)
    schwarz = Image.new("RGBA", bild.size, (20, 20, 20, 255))
    leer = Image.new("RGBA", bild.size, (0, 0, 0, 0))
    return Image.composite(schwarz, leer, m)


def lade_stufen(thema_filter: str | None, epoche_filter: int | None) -> dict:
    manifest = json.loads((ATLAS / "manifest.json").read_text(encoding="utf-8"))
    gruppen: dict = defaultdict(lambda: defaultdict(dict))
    for e in manifest["eintraege"]:
        t = ID_MUSTER.match(e["id"])
        if not t or not e["datei"].startswith("gebaeude/"):
            continue
        thema, epoche = t["thema"], int(t["epoche"])
        if thema_filter and thema != thema_filter:
            continue
        if epoche_filter and epoche != epoche_filter:
            continue
        gruppen[(thema, epoche)][t["rolle"]][int(t["stufe"])] = ATLAS / e["datei"]
    return gruppen


def blatt(thema: str, epoche: int, rollen: dict, ziel: Path) -> list[dict]:
    """Zeichnet ein Vergleichsblatt und liefert die Messwerte."""
    reihen = sorted(rollen, key=lambda r: ROLLEN_FOLGE.index(r) if r in ROLLEN_FOLGE else 99)
    rand, luecke = 16, 12
    bilder = {r: [Image.open(rollen[r][s]).convert("RGBA") for s in sorted(rollen[r])] for r in reihen}
    spalten = max(len(v) for v in bilder.values())
    zelle_w = max(i.width for v in bilder.values() for i in v)
    zeilen_h = {r: max(i.height for i in bilder[r]) for r in reihen}
    breite = rand * 2 + spalten * 2 * (zelle_w + luecke)
    hoehe = rand * 2 + sum(zeilen_h[r] + 30 for r in reihen)
    flaeche = Image.new("RGBA", (breite, hoehe), (214, 236, 243, 255))
    stift = ImageDraw.Draw(flaeche)
    werte: list[dict] = []
    y = rand
    for r in reihen:
        stift.text((rand, y), f"{thema} e{epoche} {r}", fill=(43, 38, 32, 255))
        y += 16
        unten = y + zeilen_h[r]
        for i, bild in enumerate(bilder[r]):
            x = rand + i * (zelle_w + luecke)
            flaeche.alpha_composite(bild, (x + (zelle_w - bild.width) // 2, unten - bild.height))
            ux = rand + (spalten + i) * (zelle_w + luecke)
            flaeche.alpha_composite(umriss_bild(bild), (ux + (zelle_w - bild.width) // 2, unten - bild.height))
            stift.text((x, unten + 1), f"s{i + 1}", fill=(43, 38, 32, 255))
        for i in range(1, len(bilder[r])):
            ha, hb = sichtbare_hoehe(bilder[r][i - 1]), sichtbare_hoehe(bilder[r][i])
            werte.append(
                {
                    "thema": thema,
                    "epoche": epoche,
                    "rolle": r,
                    "von": i,
                    "nach": i + 1,
                    "hoehe_von": ha,
                    "hoehe_nach": hb,
                    "hoehe_plus": (hb - ha) / ha if ha else 0.0,
                    "umriss": umriss_unterschied(bilder[r][i - 1], bilder[r][i]),
                }
            )
        y = unten + 14
    flaeche.save(ziel / f"stufen-{thema}-e{epoche}.png")
    return werte


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--aus", type=Path, default=Path(tempfile.gettempdir()) / "bastion-stufen")
    p.add_argument("--thema")
    p.add_argument("--epoche", type=int)
    p.add_argument("--json", action="store_true", help="Messwerte als JSON statt Markdown")
    a = p.parse_args()
    ziel = a.aus.resolve()
    if WURZEL in ziel.parents or ziel == WURZEL:
        print("Die Vergleichsbilder gehören nicht ins Repository. Bitte --aus außerhalb wählen.", file=sys.stderr)
        return 2
    ziel.mkdir(parents=True, exist_ok=True)
    alle: list[dict] = []
    for (thema, epoche), rollen in sorted(lade_stufen(a.thema, a.epoche).items()):
        alle += blatt(thema, epoche, rollen, ziel)
    if a.json:
        print(json.dumps(alle, indent=2))
        return 0
    print(f"Bilder: {ziel}\n")
    print("| Thema | Epoche | Rolle | Stufen | Höhe (px) | Höhe + | Umriss anders |")
    print("|---|---|---|---|---|---|---|")
    for w in alle:
        print(
            f"| {w['thema']} | {w['epoche']} | {w['rolle']} | {w['von']}→{w['nach']} | "
            f"{w['hoehe_von']}→{w['hoehe_nach']} | {w['hoehe_plus'] * 100:.0f} % | {w['umriss'] * 100:.0f} % |"
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
