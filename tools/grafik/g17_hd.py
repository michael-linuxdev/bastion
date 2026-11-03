"""Scharfe Bilder beim Zoomen (Wunsch PV, 03.11.2026: „1 (Schärfe), weil man es sofort sieht“).

Die Bilder im Atlas haben die doppelte Größe der Bühne. Auf Handys mit dreifacher
Pixeldichte und beim Heranzoomen (bis 2,4-fach) reicht das nicht: Gebäude wirken weich.
Dieses Werkzeug rechnet dieselben Modelle noch einmal mit `skala=2` (doppelte Breite und
Höhe, gleiche Form) und legt sie als `<datei>@2x.png` daneben. Das Manifest bekommt je
Eintrag `"hd": true`; die App nimmt die @2x-Bilder nur bei hoher Pixeldichte.

Gerechnet werden: Gebäude (G12), Umgebung (G12/G13), Kulisse-Dinge (G12–G16).
Nicht: Wesen und Bewohner (klein, eigene feste Bildgröße), Boden, Himmel, Bänder.

Aufruf: python3 tools/grafik/g17_hd.py [gebaeude|umgebung|kulisse …]
"""

from __future__ import annotations

import json
import os
import shutil
import sys
from multiprocessing import Pool
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
import g12_atlas  # noqa: E402
import g12_kulisse  # noqa: E402
import g12_rest  # noqa: E402
import g13_jahreszeiten  # noqa: E402
import g14_kulisse_leben  # noqa: E402
import g15_varianten  # noqa: E402
import g16_mehr_dinge  # noqa: E402
import raum  # noqa: E402

ATLAS = Path(__file__).resolve().parents[2] / "public" / "grafik" / "atlas"
_rendern = raum.rendern
_speichern = Image.Image.save


def hd_rendern(sz, breite, n, **kw):
    """Gleiche Szene, doppelt so groß."""
    # Bei doppelter Größe reicht zweifache statt dreifache Kantenglättung (halbe Rechenzeit)
    kw["s"] = 2
    return _rendern(sz, breite * 2, n, skala=2.0, **kw)


# Erst in einen Zwischenordner rechnen (dauert lange), am Ende in den Atlas kopieren
ZWISCHEN = Path(os.environ.get("BASTION_HD_ZWISCHEN", str(ATLAS)))


def hd_speichern(self, fp, *args, **kw):
    """Alles, was in den Atlas geschrieben würde, landet als @2x im Zwischenordner."""
    p = Path(fp)
    if str(p).startswith(str(ATLAS)) and not p.stem.endswith("@2x"):
        p = ZWISCHEN / p.relative_to(ATLAS)
        p = p.with_name(p.stem + "@2x" + p.suffix)
        p.parent.mkdir(parents=True, exist_ok=True)
    return _speichern(self, p, *args, **kw)


def hd_gischt(bild: Image.Image, r: float) -> Image.Image:
    """Schaumring wie g12_rest.gischt, in doppelter Größe."""
    w, h = bild.size
    cx, cy = w / 2, h - 8 - 48
    rx, ry = r * 96 * 1.414, r * 48 * 1.414
    ring = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse([cx - rx, cy - ry, cx + rx, cy + ry], outline=(236, 246, 248, 210), width=6)
    ring = ring.filter(ImageFilter.GaussianBlur(2.4))
    ring.alpha_composite(bild)
    return ring


for modul in (g12_atlas, g12_kulisse, g12_rest, g13_jahreszeiten, g14_kulisse_leben, g15_varianten, g16_mehr_dinge):
    modul.rendern = hd_rendern
for modul in (g12_rest, g13_jahreszeiten):
    modul.gischt = hd_gischt
Image.Image.save = hd_speichern


def kulisse_g12(a):
    thema, name = a
    fn = g12_kulisse.DINGE[thema][name]
    tag, _ = hd_rendern(fn(), 160, 1, schatten_r=0.0)
    ziel = g12_kulisse.ZIEL / thema / "dinge" / f"{name}.png"
    tag.quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG).save(ziel, optimize=True)
    return ziel.name


def lauf(a):
    art, rest = a
    if art == "gebaeude":
        return g12_atlas.auftrag(rest)[:3]
    if art == "rest":
        return g12_rest.job(rest)[1]
    if art == "g12k":
        return kulisse_g12(rest)
    if art == "g13":
        return g13_jahreszeiten.job(rest)[2]
    if art == "g14":
        return g14_kulisse_leben.job(rest)[1]
    if art == "g15":
        return g15_varianten.job(rest)[1]
    return g16_mehr_dinge.job(rest)[1]


def auftraege(teile: list[str]) -> list:
    jobs: list = []
    if "gebaeude" in teile:
        jobs += [("gebaeude", (t, r, s)) for t in g12_atlas.THEMEN for r, (n_st, _, _) in g12_atlas.ROLLEN.items() for s in range(1, n_st + 1)]
    if "umgebung" in teile:
        jobs += [("rest", ("umgebung", n, t)) for t, d in g12_rest.UMGEBUNG.items() for n in d]
        jobs += [("g13", ("umgebung", t, n, jz)) for t, d in g13_jahreszeiten.UMGEBUNG.items() for n in d for jz in g13_jahreszeiten.JZ]
    if "kulisse" in teile:
        jobs += [("rest", ("kulisse", n)) for n in g12_rest.KULISSE]
        jobs += [("g12k", (t, n)) for t, d in g12_kulisse.DINGE.items() for n in d]
        jobs += [("g13", ("kulisse", t, n, jz)) for t, d in g13_jahreszeiten.DINGE.items() for n in d for jz in g13_jahreszeiten.JZ]
        jz14 = g14_kulisse_leben.JZ
        jobs += [("g14", (t, n, "sommer")) for t, d in g14_kulisse_leben.DINGE.items() for n in d]
        jobs += [("g14", (t, n, jz)) for t, d in g14_kulisse_leben.DINGE.items() for n, (_, _, je) in d.items() if je for jz in jz14]
        for t, d in g15_varianten.VARIANTEN.items():
            for n, (_, _, je) in d.items():
                for v in range(2, g15_varianten.ANZAHL + 1):
                    jobs.append(("g15", (t, n, v, "sommer")))
                    if je:
                        jobs += [("g15", (t, n, v, jz)) for jz in g15_varianten.JZ]
        jobs += [("g16", (t, n, "sommer")) for t, d in g16_mehr_dinge.DINGE.items() for n in d]
        jobs += [("g16", (t, n, jz)) for t, d in g16_mehr_dinge.DINGE.items() for n, (_, je) in d.items() if je for jz in g16_mehr_dinge.JZ]
    return jobs


def main() -> int:
    teile = sys.argv[1:] or ["gebaeude", "umgebung", "kulisse"]
    jobs = auftraege(teile)
    print(len(jobs), "Bilder in doppelter Größe", flush=True)
    with Pool(4) as pool:
        for i, _ in enumerate(pool.imap_unordered(lauf, jobs), 1):
            if i % 50 == 0:
                print(i, "fertig", flush=True)
    if ZWISCHEN != ATLAS:
        for q in ZWISCHEN.rglob("*@2x.png"):
            ziel = ATLAS / q.relative_to(ZWISCHEN)
            ziel.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(q, ziel)
    # Manifest: "hd" für alle Einträge, deren @2x-Bild es gibt (die Größen bleiben die logischen)
    manifest_pfad = ATLAS / "manifest.json"
    manifest = json.loads(manifest_pfad.read_text(encoding="utf-8"))
    for e in manifest["eintraege"]:
        datei = ATLAS / e["datei"]
        if datei.with_name(datei.stem + "@2x" + datei.suffix).exists():
            e["hd"] = True
    manifest_pfad.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    shutil.rmtree(Path(__file__).resolve().parent / "__pycache__", ignore_errors=True)
    print("fertig")
    return 0


if __name__ == "__main__":
    sys.exit(main())
