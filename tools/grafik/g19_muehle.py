#!/usr/bin/env python3
"""G19: Drehende Mühlenflügel (Wunsch PV, 03.11.2026).

Die Windmühle des Dorfs (Turm, Stufen 1–5) hat ihre Flügel bisher im Bild. Damit sie sich
drehen, rechnet dieses Werkzeug die Mühle noch einmal ohne Flügel (`dorf_turm(…,
fluegel=False)`), in einfacher und doppelter Größe, und legt sie als
`turm_s<k>_ohne.png` (und `@2x`) neben das Bild mit Flügeln. Das alte Bild bleibt: Vorschau
und Bauliste zeigen weiter die ganze Mühle.

Ins Manifest kommt je Mühle `"fluegel": {"x", "y", "l", "f", "ohne"}`: Nabe in Bildpunkten
des 1x-Bildes ab Fußpunkt, Flügellänge in Feldern, Höhenstreckung des Modells und die ID des
Bildes ohne Flügel. Die Bühne
tauscht das Bild und zeichnet die vier Flügel drehend in derselben Ebene wie das Modell.

Aufruf: python3 tools/grafik/g19_muehle.py   (etwa eine Minute)
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
import raum  # noqa: E402
from g12_modelle import EPOCHE_VON, ROLLEN, dorf_turm, streckung  # noqa: E402

ATLAS = Path(__file__).resolve().parents[2] / "public" / "grafik" / "atlas"


def speichern(bild: Image.Image, pfad: Path) -> None:
    bild.quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG).save(pfad, "PNG", optimize=True)


def ausrichten(gross: Image.Image, w: int, h: int) -> Image.Image:
    """Auf genau die doppelte Größe des 1x-Bildes: unten bündig, seitlich mittig (wie G17)."""
    neu = Image.new("RGBA", (2 * w, 2 * h), (0, 0, 0, 0))
    neu.paste(gross, ((2 * w - gross.width) // 2, 2 * h - gross.height), gross)
    return neu


def main() -> int:
    manifest_pfad = ATLAS / "manifest.json"
    manifest = json.loads(manifest_pfad.read_text(encoding="utf-8"))
    nach_id = {e["id"]: e for e in manifest["eintraege"]}
    _, n, breite = ROLLEN["turm"]
    neu: list[dict] = []
    # Dieselbe Höhenstreckung wie das Bild mit Flügeln (aus dem Modell mit Flügeln gerechnet)
    faktoren = streckung("dorf", "turm")
    for stufe in range(1, ROLLEN["turm"][0] + 1):
        f = faktoren[stufe - 1]
        epoche = EPOCHE_VON["turm"][stufe]
        e = nach_id[f"dorf/e{epoche}/turm_s{stufe}"]
        ohne_id = f"dorf/e{epoche}/turm_s{stufe}_ohne"
        rel = f"gebaeude/dorf/e{epoche}/turm_s{stufe}_ohne.png"
        sz = dorf_turm(stufe, fluegel=False)
        sz.strecken(f)
        tag, _ = raum.rendern(sz, breite, n)
        speichern(tag, ATLAS / rel)
        sz2 = dorf_turm(stufe, fluegel=False)
        sz2.strecken(f)
        gross, _ = raum.rendern(sz2, breite * 2, n, s=2, skala=2.0)
        speichern(ausrichten(gross, *tag.size), ATLAS / rel.replace(".png", "@2x.png"))
        neu.append({"id": ohne_id, "datei": rel, "felder": [n, n], "anker": {"x": 0.5, "y": 1.0}, "pixel": {"w": tag.width, "h": tag.height}, "hd": True})
        x, y, z, laenge = sz.muehle
        # Projektion wie `raum._rendern`, Fußpunkt n·HH + 4 über dem unteren Bildrand
        e["fluegel"] = {
            "x": round((x - y) * raum.HW, 1),
            "y": round(-(4 + n * raum.HH) + (x + y) * raum.HH - z * f, 1),
            "l": round(laenge, 3),
            # Höhenstreckung: die Flügel sind im Modell mitgestreckt (senkrecht länger)
            "f": round(f, 4),
            "ohne": ohne_id,
        }
        print(ohne_id, tag.size, e["fluegel"], flush=True)
    ohne = {e["id"] for e in neu}
    manifest["eintraege"] = [e for e in manifest["eintraege"] if e["id"] not in ohne] + neu
    manifest_pfad.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())
