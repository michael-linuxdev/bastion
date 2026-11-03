"""Bäume, Büsche, Hecken und Teiche je Jahreszeit (Wunsch PV, 03.11.2026).

„Die Bäume passen sich den Jahreszeiten an“: Zu jedem Bild der Umgebung und der
Kulisse, das etwas Pflanzliches zeigt, entstehen drei weitere Fassungen:
Frühling (hellgrün, Blüten), Herbst (bunt), Winter (kahl oder verschneit, Teich
gefroren). Der Sommer ist das bisherige Bild. Gleicher Stil und Renderer wie G12.

Namen: `<name>_<jahreszeit>`; Atlas-ID `<thema>/umgebung/<name>_<jahreszeit>`,
Kulisse `kulisse/<thema>/dinge/<name>_<jahreszeit>.png`.

Aufruf: python3 tools/grafik/g13_jahreszeiten.py
"""

from __future__ import annotations

import json
import math
import shutil
import sys
from multiprocessing import Pool
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from g12_modelle import HERBST, LAUB, SCHNEE, baum, blueten, frueh  # noqa: E402
from g12_rest import gischt, palette  # noqa: E402
from raum import SOCKEL, Szene, rendern  # noqa: E402

ATLAS = Path(__file__).resolve().parents[2] / "public" / "grafik" / "atlas"
JZ = ("fruehling", "herbst", "winter")
APFEL = (210, 60, 50)
IMMERGRUEN = (64, 112, 70)


def laub_farbe(farbe, jz, k=0):
    if jz == "herbst":
        return HERBST[k % len(HERBST)]
    if jz == "fruehling":
        return frueh(farbe)
    if jz == "winter":
        return IMMERGRUEN
    return farbe


def schneehaube(sz, x, y, z, r):
    """Flache Schneehaube oben auf einer Kugel."""
    sz.kugel(x, y, z, r * 0.82, "glatt", SCHNEE, rz=r * 0.3)


# —— Umgebung ——————————————————————————————————————————————————————————


def u_baum(h, r, stamm, farbe=LAUB, aepfel=0):
    def f(jz):
        sz = Szene()
        sz.schatten_r = 0.4 if r > 0.4 else 0.34
        baum(sz, 0, 0, h, r, stamm=stamm, farbe=farbe, jz=jz)
        # Äpfel im Sommer und Herbst, im Frühling Blüten (kommen aus baum), im Winter nichts
        if aepfel and jz in ("sommer", "herbst"):
            for k in range(aepfel):
                a = 1.3 * k
                sz.kugel(0.24 * math.cos(a), 0.24 * math.sin(a), h * 0.7, 0.03, "glatt", APFEL)
        return sz

    return f


def u_busch(jz):
    sz = Szene()
    sz.schatten_r = 0.34
    teile = ((0, 0, 22, 0.24), (-0.16, 0.12, 16, 0.16), (0.16, -0.06, 18, 0.17))
    for k, (dx, dy, dz, r) in enumerate(teile):
        sz.kugel(dx, dy, dz, r, "laub", laub_farbe(LAUB, jz, k), rz=r * 0.85)
        if jz == "winter":
            schneehaube(sz, dx, dy, dz + r * 0.85 * 58.79 * 0.7, r)
        if jz == "fruehling" and k == 0:
            blueten(sz, dx, dy, dz, r, k, n=3)
    return sz


def u_strauch(bl):
    def f(jz):
        sz = Szene()
        sz.schatten_r = 0.34
        teile = ((0, 0, 24, 0.26), (-0.18, 0.12, 16, 0.17), (0.18, -0.06, 18, 0.18))
        for k, (dx, dy, dz, r) in enumerate(teile):
            sz.kugel(dx, dy, dz, r, "laub", laub_farbe((86, 150, 66), jz, k), rz=r * 0.85)
            if jz == "winter":
                schneehaube(sz, dx, dy, dz + r * 0.85 * 58.79 * 0.7, r)
        # Blüten im Frühling und Sommer; im Herbst Hagebutten, im Winter keine
        if jz in ("fruehling", "herbst"):
            farben = bl if jz == "fruehling" else ((176, 40, 36), (200, 66, 40))
            for k in range(6 if jz == "herbst" else 8):
                a = 2 * math.pi * k / 8 + 0.4
                sz.kugel(0.2 * math.cos(a), 0.2 * math.sin(a) + 0.05, 30 + 8 * math.sin(a), 0.04, "glatt", farben[k % len(farben)])
        return sz

    return f


UMGEBUNG = {
    "bastion": {"baum_a": u_baum(150, 0.46, 0.07), "baum_b": u_baum(112, 0.38, 0.06, (104, 150, 70)), "busch": u_busch},
    "dorf": {"baum_a": u_baum(146, 0.45, 0.07, (98, 146, 66), aepfel=5), "baum_b": u_baum(108, 0.37, 0.06, (110, 156, 74))},
    "garten": {"strauch_a": u_strauch(((214, 96, 112), (240, 240, 236))), "strauch_b": u_strauch(((236, 196, 84), (176, 120, 196)))},
}


# —— Kulisse-Dinge ————————————————————————————————————————————————————————


def d_hecke(jz):
    sz = Szene()
    sz.schatten_r = 0.0
    c = {"herbst": (134, 128, 56), "fruehling": frueh((72, 128, 58)), "winter": IMMERGRUEN}.get(jz, (72, 128, 58))
    sz.quader(-0.5, 0.5, -0.14, 0.14, 0, 40, "laub", c)
    for k in range(5):
        sz.kugel(-0.4 + k * 0.2, 0.0, 40, 0.13, "laub", c, rz=0.08)
        if jz == "winter":
            sz.kugel(-0.4 + k * 0.2, 0.0, 44, 0.12, "glatt", SCHNEE, rz=0.05)
    return sz


def d_obstbaum(jz):
    sz = Szene()
    sz.schatten_r = 0.0
    baum(sz, 0, 0, 120, 0.36, stamm=0.06, jz=jz)
    if jz in ("sommer", "herbst"):
        for k in range(5):
            a = 1.3 * k
            sz.kugel(0.25 * math.cos(a), 0.25 * math.sin(a), 82, 0.03, "glatt", APFEL)
    return sz


def d_teich(jz):
    sz = Szene()
    sz.schatten_r = 0.0
    wasser = (164, 200, 222) if jz == "winter" else (110, 170, 200)
    sz.kugel(0, 0, 0, 0.55, "glatt", wasser, rz=0.03)
    if jz == "winter":
        # Eis mit hellen Rissen statt Wasser
        for a0 in (0.4, 2.2, 4.1):
            sz.balken((0.0, 0.0, 2), (0.42 * math.cos(a0), 0.42 * math.sin(a0), 2), 0.015, 0.004, "glatt", (226, 238, 246))
    for k in range(8):
        a = 2 * math.pi * k / 8
        sz.kugel(0.58 * math.cos(a), 0.58 * math.sin(a), 2, 0.09, "stein", SOCKEL, rz=0.06)
        if jz == "winter":
            sz.kugel(0.58 * math.cos(a), 0.58 * math.sin(a), 5, 0.07, "glatt", SCHNEE, rz=0.03)
    if jz != "winter":
        blatt = (186, 150, 60) if jz == "herbst" else (86, 150, 66)
        for x, y in ((0.15, 0.1), (-0.2, -0.1)):
            sz.kugel(x, y, 2, 0.08, "laub", blatt, rz=0.01)
        if jz != "herbst":
            sz.kugel(0.15, 0.1, 4, 0.03, "glatt", (240, 200, 220))
    return sz


def d_blumenbusch(jz):
    sz = Szene()
    sz.schatten_r = 0.0
    for k, (dx, dy, r) in enumerate(((0, 0, 0.24), (-0.16, 0.12, 0.16), (0.16, -0.06, 0.17))):
        sz.kugel(dx, dy, 20, r, "laub", laub_farbe((86, 150, 66), jz, k), rz=r * 0.85)
        if jz == "winter":
            schneehaube(sz, dx, dy, 20 + r * 0.85 * 58.79 * 0.7, r)
    if jz != "winter":
        farben = ((176, 40, 36), (200, 66, 40)) if jz == "herbst" else ((214, 96, 112), (240, 240, 236), (236, 196, 84), (244, 186, 204))
        for k in range(9 if jz == "fruehling" else 6):
            a = 2 * math.pi * k / 9
            sz.kugel(0.2 * math.cos(a), 0.2 * math.sin(a), 28, 0.04, "glatt", farben[k % len(farben)])
    return sz


def k_inselchen(jz):
    sz = Szene()
    sz.schatten_r = 0.0
    sz.kugel(0, 0, 0, 0.62, "sand", (214, 196, 150), rz=0.16)
    gras = {"winter": SCHNEE, "herbst": (150, 150, 80), "fruehling": frueh((110, 156, 88))}.get(jz, (110, 156, 88))
    sz.kugel(-0.05, -0.05, 4, 0.4, "glatt" if jz == "winter" else "laub", gras, rz=0.1)
    baum(sz, 0, 0, 80, 0.2, stamm=0.035, jz=jz)
    sz.kugel(0.32, 0.18, 6, 0.1, "stein", (150, 140, 128), rz=0.08)
    return sz


DINGE = {
    "bastion": {"inselchen": (k_inselchen, 0.75)},
    "dorf": {"hecke": (d_hecke, None), "obstbaum": (d_obstbaum, None), "teich": (d_teich, None)},
    "garten": {"hecke": (d_hecke, None), "obstbaum": (d_obstbaum, None), "teich": (d_teich, None), "blumenbusch": (d_blumenbusch, None)},
}


def job(a):
    art, thema, name, jz = a
    if art == "umgebung":
        tag, _ = rendern(UMGEBUNG[thema][name](jz), 104, 1)
        rel = f"umgebung/{thema}/{name}_{jz}.png"
        palette(tag, ATLAS / rel)
        return (f"{thema}/umgebung/{name}_{jz}", f"{thema}/umgebung/{name}", rel, tag.size)
    fn, ring = DINGE[thema][name]
    tag, _ = rendern(fn(jz), 160, 1, schatten_r=0.0)
    if ring is not None:
        tag = gischt(tag, ring)
    rel = f"kulisse/{thema}/dinge/{name}_{jz}.png"
    palette(tag, ATLAS / rel)
    return (None, None, rel, tag.size)


def main() -> int:
    jobs = [("umgebung", t, n, jz) for t, d in UMGEBUNG.items() for n in d for jz in JZ]
    jobs += [("kulisse", t, n, jz) for t, d in DINGE.items() for n in d for jz in JZ]
    manifest_pfad = ATLAS / "manifest.json"
    manifest = json.loads(manifest_pfad.read_text(encoding="utf-8"))
    eintraege = manifest["eintraege"]
    nach_id = {e["id"]: e for e in eintraege}
    with Pool(4) as pool:
        for id_, basis, rel, (w, h) in pool.imap_unordered(job, jobs):
            if id_ is None:
                continue
            if id_ not in nach_id:
                vorlage = nach_id[basis]
                neu = {**vorlage, "id": id_}
                # direkt hinter das Sommerbild einreihen
                eintraege.insert(eintraege.index(vorlage) + 1, neu)
                nach_id[id_] = neu
            nach_id[id_]["datei"] = rel
            nach_id[id_]["pixel"] = {"w": w, "h": h}
    manifest_pfad.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    shutil.rmtree(Path(__file__).resolve().parent / "__pycache__", ignore_errors=True)
    print(len(jobs), "Bilder geschrieben")
    return 0


if __name__ == "__main__":
    sys.exit(main())
