#!/usr/bin/env python3
"""G18: Wo hängen Fahnen in den Gebäudebildern? (Wunsch PV, 03.11.2026: „Wehende Fahnen“)

Die Fahnen sind in die Bilder eingerechnet (`Szene.fahne`). Damit die Bühne sie wehen
lassen kann, braucht sie Lage, Größe und Farbe jedes Tuchs im Bild. Dieses Werkzeug baut
jedes Gebäude-Modell noch einmal auf, ohne zu rendern (dauert Sekunden), merkt sich jeden
Aufruf von `fahne` und rechnet die Ecken des Tuchs mit derselben Projektion wie
`raum.rendern` in Bildpunkte um. Die Farbe kommt aus dem fertigen Bild (Mitte des Tuchs),
damit Licht und Schatten passen. Ist das Tuch dort verdeckt, wird die Fahne übersprungen.

Ergebnis im Manifest je Eintrag: `"fahnen": [{"x", "y", "b", "h", "farbe"}]` in Bildpunkten
des 1x-Bildes, gemessen vom Fußpunkt unten Mitte (x nach rechts, y nach unten, also
negativ): `x, y` ist die Stange oben am Tuch, `b` und `s` sind der Weg zum freien Ende
(nach rechts und nach unten), `h` die Höhe des Tuchs.

Aufruf: python3 tools/grafik/g18_fahnen.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
import raum  # noqa: E402
from g12_modelle import EPOCHE_VON, ROLLEN, THEMEN, modell, streckung, zier_faktor  # noqa: E402

ATLAS = Path(__file__).resolve().parents[2] / "public" / "grafik" / "atlas"


def tuecher(thema: str, rolle: str, stufe: int) -> list[tuple]:
    """Alle `fahne`-Aufrufe des Modells: (x, y, z, hoehe, farbe)."""
    gemerkt: list[tuple] = []
    alt = raum.Szene.fahne

    def merken(self, spitze, hoehe=40, farbe=raum.PETROL_HELL):
        gemerkt.append((*spitze, hoehe, farbe))
        return alt(self, spitze, hoehe, farbe)

    raum.Szene.fahne = merken
    try:
        modell(thema, rolle)(stufe)
    finally:
        raum.Szene.fahne = alt
    # Manche Modelle bauen Teile mehrfach auf: jede Fahne nur einmal
    return list(dict.fromkeys(gemerkt))


def hoehen_faktor(thema: str, rolle: str, stufe: int) -> float:
    """Höhenstreckung, die `modell` nach dem Aufbau anwendet (die Fahne wird mitgestreckt)."""
    if ROLLEN[rolle][0] == 1:
        return zier_faktor(thema, rolle)
    return streckung(thema, rolle)[stufe - 1]


def bild_punkt(x: float, y: float, z_px: float, fuss_y: float) -> tuple[float, float]:
    """Projektion wie `raum._rendern` (Skala 1), relativ zum Fußpunkt unten Mitte."""
    return (x - y) * raum.HW, fuss_y + (x + y) * raum.HH - z_px


def farbton_abstand(a: tuple, b: tuple) -> float:
    """Abstand der Farbtöne (Anteile von Rot, Grün, Blau), unabhängig von der Helligkeit."""
    sa, sb = max(1, sum(a[:3])), max(1, sum(b[:3]))
    return sum(abs(x / sa - y / sb) for x, y in zip(a[:3], b[:3]))


def main() -> int:
    manifest_pfad = ATLAS / "manifest.json"
    manifest = json.loads(manifest_pfad.read_text(encoding="utf-8"))
    nach_id = {e["id"]: e for e in manifest["eintraege"]}
    for e in manifest["eintraege"]:
        e.pop("fahnen", None)
    zahl = 0
    for thema in THEMEN:
        for rolle, (n_st, n, _) in ROLLEN.items():
            for stufe in range(1, n_st + 1):
                epoche = EPOCHE_VON.get(rolle, {}).get(stufe, 1)
                e = nach_id.get(f"{thema}/e{epoche}/{rolle}_s{stufe}")
                if not e:
                    continue
                bild = Image.open(ATLAS / e["datei"]).convert("RGBA")
                w, h = bild.size
                # Bodenpunkt (0, 0, 0) liegt n·HH + 4 Bildpunkte über dem unteren Rand
                fuss_y = -(4 + n * raum.HH)
                liste = []
                f = hoehen_faktor(thema, rolle, stufe)
                for x, y, z, hoehe, farbe in tuecher(thema, rolle, stufe):
                    # Tuch wie `Szene.fahne`: von y − 0,015 bis y − 0,27, z + hoehe − 22 … − 3,
                    # danach mit dem ganzen Modell in der Höhe gestreckt
                    ox, oy = bild_punkt(x, y - 0.015, (z + hoehe - 3) * f, fuss_y)
                    ex, ey = bild_punkt(x, y - 0.27, (z + hoehe - 3) * f, fuss_y)
                    mx, my = bild_punkt(x, y - 0.14, (z + hoehe - 12.5) * f, fuss_y)
                    px, py = round(w / 2 + mx), round(h + my)
                    if not (0 <= px < w and 0 <= py < h):
                        continue
                    r, g, b, a = bild.getpixel((px, py))
                    # Verdeckt oder außerhalb des Bildes: lieber keine wehende Fahne. Das Tuch
                    # ist an der Stelle zu sehen, wenn der Farbton zum Tuch passt.
                    if a < 200 or farbton_abstand((r, g, b), farbe) > 0.22:
                        continue
                    liste.append(
                        {
                            "x": round(ox, 1),
                            "y": round(oy, 1),
                            "b": round(ex - ox, 1),
                            "s": round(ey - oy, 1),
                            "h": round(19 * f, 1),
                            "farbe": f"#{r:02x}{g:02x}{b:02x}",
                        }
                    )
                if liste:
                    e["fahnen"] = liste
                    zahl += len(liste)
    manifest_pfad.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(zahl, "Fahnen eingetragen")
    return 0


if __name__ == "__main__":
    sys.exit(main())
