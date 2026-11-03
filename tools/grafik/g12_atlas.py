#!/usr/bin/env python3
"""G12: schreibt alle Gebäudebilder im Stil „weich gerendert“ in den Atlas
(GRAFIK-SPRITES.md §13). Ersetzt für die gewählten Themen alle Einträge unter
`gebaeude/<thema>/` (alle Epochen); andere Einträge bleiben.

Aufruf: python3 tools/grafik/g12_atlas.py [thema …] [--nur rolle,rolle]
Rechnet mit vier Prozessen; gleiche Eingabe ergibt das gleiche Bild.
"""
from __future__ import annotations

import json
import shutil
import sys
from multiprocessing import Pool
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from g12_modelle import EPOCHE_VON, ROLLEN, THEMEN, modell  # noqa: E402
from raum import rendern  # noqa: E402

ATLAS = Path(__file__).resolve().parents[2] / "public" / "grafik" / "atlas"


def palette(b, pfad: Path) -> None:
    from PIL import Image

    pfad.parent.mkdir(parents=True, exist_ok=True)
    b.quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG).save(pfad, "PNG", optimize=True)


def eintrag(id_: str, rel: str, n: int, b) -> dict:
    return {"id": id_, "datei": rel, "felder": [n, n], "anker": {"x": 0.5, "y": 1.0}, "pixel": {"w": b.width, "h": b.height}}


def auftrag(job):
    thema, rolle, stufe = job
    _, n, breite = ROLLEN[rolle]
    epoche = EPOCHE_VON.get(rolle, {}).get(stufe, 1)
    tag, abend = rendern(modell(thema, rolle)(stufe), breite, n)
    aus = []
    rel = f"gebaeude/{thema}/e{epoche}/{rolle}_s{stufe}.png"
    palette(tag, ATLAS / rel)
    aus.append(eintrag(f"{thema}/e{epoche}/{rolle}_s{stufe}", rel, n, tag))
    if abend.getchannel("A").getbbox():
        rel = f"gebaeude/{thema}/e{epoche}/{rolle}_s{stufe}_fenster.png"
        abend.save(ATLAS / rel, "PNG", optimize=True)
        aus.append(eintrag(f"{thema}/e{epoche}/{rolle}_s{stufe}_fenster", rel, n, abend))
    return thema, rolle, stufe, aus


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    nur = None
    if "--nur" in sys.argv:
        nur = set(sys.argv[sys.argv.index("--nur") + 1].split(","))
        args = [a for a in args if a != sys.argv[sys.argv.index("--nur") + 1]]
    themen = args or list(THEMEN)
    jobs = [(t, r, s) for t in themen for r, (n_st, _, _) in ROLLEN.items() if nur is None or r in nur for s in range(1, n_st + 1)]
    manifest_pfad = ATLAS / "manifest.json"
    manifest = json.loads(manifest_pfad.read_text(encoding="utf-8"))
    rollen = set(nur) if nur else set(ROLLEN)

    def ersetzt(e) -> bool:
        teile = e["id"].split("/")
        if len(teile) != 3 or teile[0] not in themen or not teile[1].startswith("e"):
            return False
        return teile[2].split("_s")[0] in rollen

    for e in [e for e in manifest["eintraege"] if ersetzt(e)]:
        (ATLAS / e["datei"]).unlink(missing_ok=True)
    neu: list[dict] = []
    with Pool(4) as pool:
        for thema, rolle, stufe, aus in pool.imap_unordered(auftrag, jobs):
            neu.extend(aus)
            print(thema, rolle, stufe, aus[0]["pixel"], flush=True)
    neu_ids = {e["id"] for e in neu}
    manifest["eintraege"] = [e for e in manifest["eintraege"] if not ersetzt(e) and e["id"] not in neu_ids] + sorted(neu, key=lambda e: e["id"])
    manifest_pfad.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    shutil.rmtree(Path(__file__).resolve().parent / "__pycache__", ignore_errors=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
