#!/usr/bin/env python3
"""
Deterministischer Generator für Sprite-Charge P1 (Wetter-Himmel).
Ausgabe unter public/grafik/atlas/ nach GRAFIK-SPRITES.md §3/§5/§8.
Merged in bestehendes Manifest (P0 bleibt). Stil: Richtung A „Tag, warm“.
Aufruf: python3 tools/grafik/sprites-p1-wetter.py
"""
from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
ATLAS = ROOT / "public" / "grafik" / "atlas"
MANIFEST = ATLAS / "manifest.json"

# Farben Richtung A „Tag, warm“ (GRAFIK.md)
HIMMEL = "#D6ECF3"
SONNE = "#FFC85A"
SONNE_KERN = "#FFE29A"
MOND = "#E8E4D8"
MOND_SCHATTEN = "#C5C0B4"
WOLKE = "#FFFFFF"
WOLKE_DUNKEL = "#E0E8EE"
WOLKE_RAND = (180, 200, 210, 70)
REGEN = "#7aa0c0"
SCHNEE = "#f4f7fb"
NEBEL = (220, 228, 236)
LAUB = ("#C4603A", "#E07A4F", "#c49a3c")
KONTUR = (43, 38, 32, 70)


def hex_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def shade(h: str, delta: int) -> tuple[int, int, int]:
    r, g, b = hex_rgb(h)
    return (
        max(0, min(255, r + delta)),
        max(0, min(255, g + delta)),
        max(0, min(255, b + delta)),
    )


def new_img(w: int, h: int) -> Image.Image:
    return Image.new("RGBA", (w, h), (0, 0, 0, 0))


def soft_ellipse(
    base: Image.Image,
    box: tuple[int, int, int, int],
    fill: tuple[int, int, int, int],
    blur: float = 1.2,
) -> None:
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse(box, fill=fill)
    if blur > 0:
        layer = layer.filter(ImageFilter.GaussianBlur(radius=blur))
    base.alpha_composite(layer)


def save(
    img: Image.Image,
    rel: str,
    eintraege: list[dict],
    *,
    id_: str,
    felder: tuple[int, int] = (1, 1),
    anker: tuple[float, float] = (0.5, 0.5),
) -> None:
    path = ATLAS / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "PNG", optimize=True)
    eintraege.append(
        {
            "id": id_,
            "datei": rel.replace("\\", "/"),
            "felder": list(felder),
            "anker": {"x": anker[0], "y": anker[1]},
            "pixel": {"w": img.width, "h": img.height},
        }
    )


def sonne(eintraege: list[dict]) -> None:
    # Logik ~44 px Durchmesser → @2x 88
    size = 96
    img = new_img(size, size)
    cx = cy = size // 2
    # weicher Schein
    soft_ellipse(img, (8, 8, size - 8, size - 8), (*hex_rgb(SONNE), 55), blur=4)
    soft_ellipse(img, (18, 18, size - 18, size - 18), (*hex_rgb(SONNE), 160), blur=1.5)
    d = ImageDraw.Draw(img)
    d.ellipse([26, 26, size - 26, size - 26], fill=hex_rgb(SONNE_KERN), outline=KONTUR)
    # kleine Strahlen (fest)
    for i in range(8):
        a = i * (math.pi / 4)
        x0 = cx + math.cos(a) * 30
        y0 = cy + math.sin(a) * 30
        x1 = cx + math.cos(a) * 40
        y1 = cy + math.sin(a) * 40
        d.line([(x0, y0), (x1, y1)], fill=(*hex_rgb(SONNE), 180), width=3)
    save(img, "himmel/sonne.png", eintraege, id_="himmel/sonne", anker=(0.5, 0.5))


def mond(eintraege: list[dict]) -> None:
    size = 72
    out = new_img(size, size)
    soft_ellipse(out, (6, 6, size - 6, size - 6), (*hex_rgb(MOND), 70), blur=2.5)
    # Sichel: voller Mond, dann Himmel-Kreis stanzt die rechte Seite weg
    voll = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    vd = ImageDraw.Draw(voll)
    vd.ellipse([12, 12, size - 12, size - 12], fill=hex_rgb(MOND), outline=KONTUR)
    vd.ellipse([28, 28, 36, 34], fill=hex_rgb(MOND_SCHATTEN))
    vd.ellipse([34, 40, 40, 45], fill=hex_rgb(MOND_SCHATTEN))
    mask = Image.new("L", (size, size), 0)
    md = ImageDraw.Draw(mask)
    md.ellipse([12, 12, size - 12, size - 12], fill=255)
    md.ellipse([26, 6, size + 4, size - 14], fill=0)
    sichel = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sichel.paste(voll, (0, 0), mask)
    out.alpha_composite(sichel)
    save(out, "himmel/mond.png", eintraege, id_="himmel/mond", anker=(0.5, 0.5))


def wolke(n: int, eintraege: list[dict]) -> None:
    # zwei Varianten: hell (1) und etwas dunkler/größer (2)
    w, h = (168, 72) if n == 1 else (200, 80)
    img = new_img(w, h)
    fill = (*hex_rgb(WOLKE), 230) if n == 1 else (*hex_rgb(WOLKE_DUNKEL), 235)
    fill2 = (*hex_rgb(WOLKE), 200) if n == 1 else (*hex_rgb(WOLKE), 210)
    if n == 1:
        soft_ellipse(img, (10, 22, 90, 62), fill, blur=1.4)
        soft_ellipse(img, (50, 8, 140, 58), fill2, blur=1.2)
        soft_ellipse(img, (100, 24, 160, 64), fill, blur=1.3)
    else:
        soft_ellipse(img, (8, 28, 100, 72), fill, blur=1.5)
        soft_ellipse(img, (55, 10, 155, 62), fill2, blur=1.3)
        soft_ellipse(img, (110, 26, 192, 70), fill, blur=1.4)
        soft_ellipse(img, (70, 30, 130, 70), (*hex_rgb(WOLKE_DUNKEL), 180), blur=1.0)
    save(img, f"himmel/wolke_{n}.png", eintraege, id_=f"himmel/wolke_{n}", anker=(0.5, 0.5))


def regen(eintraege: list[dict]) -> None:
    # Strich/Tropfen, lesbar klein
    img = new_img(16, 28)
    d = ImageDraw.Draw(img)
    d.line([(8, 2), (5, 24)], fill=(*hex_rgb(REGEN), 200), width=3)
    d.ellipse([3, 20, 9, 26], fill=(*hex_rgb(REGEN), 180))
    save(img, "wetter/regen_tropfen.png", eintraege, id_="wetter/regen_tropfen", anker=(0.5, 0.0))


def schneeflocke(eintraege: list[dict]) -> None:
    size = 24
    img = new_img(size, size)
    d = ImageDraw.Draw(img)
    cx = cy = size // 2
    for i in range(6):
        a = i * (math.pi / 3)
        x1 = cx + math.cos(a) * 9
        y1 = cy + math.sin(a) * 9
        d.line([(cx, cy), (x1, y1)], fill=(*hex_rgb(SCHNEE), 230), width=2)
    d.ellipse([cx - 2, cy - 2, cx + 2, cy + 2], fill=hex_rgb(SCHNEE))
    save(img, "wetter/schnee_flocke.png", eintraege, id_="wetter/schnee_flocke", anker=(0.5, 0.5))


def nebel(eintraege: list[dict]) -> None:
    w, h = 160, 64
    img = new_img(w, h)
    soft_ellipse(img, (4, 12, w - 4, h - 8), (*NEBEL, 110), blur=6)
    soft_ellipse(img, (30, 4, w - 20, h - 16), (*NEBEL, 90), blur=5)
    save(img, "wetter/nebel.png", eintraege, id_="wetter/nebel", anker=(0.5, 0.5))


def schnee_dach(felder: tuple[int, int], eintraege: list[dict]) -> None:
    """Weiche Schnee-Kappe auf Iso-Dach, Fußpunkt = Südspitze der Dachraute."""
    fw, ft = felder
    bw = ((fw + ft) / 2) * 96
    bh = ((fw + ft) / 2) * 48
    # Höhe der Kappe über der Dachfläche
    cap = 18 + fw * 6
    w = int(bw + 16)
    h = int(bh + cap + 12)
    img = new_img(w, h)
    cx = w / 2
    fuss = h - 4
    # Dachraute (Unterkante = Fußpunkt)
    n = (cx, fuss - bh)
    e = (cx + bw / 2, fuss - bh / 2)
    s = (cx, fuss)
    west = (cx - bw / 2, fuss - bh / 2)
    # Schnee-Kuppe: etwas über der Raute, weich
    spitze = (cx, n[1] - cap)
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    # zwei Seiten wie Code-schneeDach
    d.polygon(
        [
            (round(west[0]), round(west[1])),
            (round(s[0]), round(s[1])),
            (round(spitze[0]), round(spitze[1])),
        ],
        fill=(*hex_rgb(SCHNEE), 220),
    )
    d.polygon(
        [
            (round(s[0]), round(s[1])),
            (round(e[0]), round(e[1])),
            (round(spitze[0]), round(spitze[1])),
        ],
        fill=(*hex_rgb("#e8eef5"), 220),
    )
    # weicher Rand
    layer = layer.filter(ImageFilter.GaussianBlur(radius=1.2))
    img.alpha_composite(layer)
    # leichte Kontur der Firstkante
    d2 = ImageDraw.Draw(img)
    d2.line(
        [
            (round(west[0]), round(west[1] - 2)),
            (round(spitze[0]), round(spitze[1] + 2)),
            (round(e[0]), round(e[1] - 2)),
        ],
        fill=(255, 255, 255, 160),
        width=2,
    )
    name = f"{fw}x{ft}"
    save(
        img,
        f"auflage/schnee_dach_{name}.png",
        eintraege,
        id_=f"auflage/schnee_dach_{name}",
        felder=felder,
        anker=(0.5, 1.0),
    )


def laub(n: int, eintraege: list[dict]) -> None:
    size = 28
    img = new_img(size, size)
    d = ImageDraw.Draw(img)
    farbe = LAUB[(n - 1) % len(LAUB)]
    # Blattform, fest aus n verdreht
    rot = (n - 1) * 25
    cx = cy = size / 2
    pts = []
    for i, (dx, dy) in enumerate(((0, -10), (7, -2), (4, 8), (0, 5), (-4, 8), (-7, -2))):
        a = math.radians(rot)
        x = cx + dx * math.cos(a) - dy * math.sin(a)
        y = cy + dx * math.sin(a) + dy * math.cos(a)
        pts.append((x, y))
    d.polygon([(round(x), round(y)) for x, y in pts], fill=hex_rgb(farbe), outline=KONTUR)
    d.line([(cx, cy - 6), (cx, cy + 4)], fill=shade(farbe, -40), width=1)
    save(img, f"auflage/laub_{n}.png", eintraege, id_=f"auflage/laub_{n}", anker=(0.5, 0.5))


P1_IDS_PREFIX = ("himmel/", "wetter/", "auflage/")


def main() -> None:
    neu: list[dict] = []
    sonne(neu)
    mond(neu)
    wolke(1, neu)
    wolke(2, neu)
    regen(neu)
    schneeflocke(neu)
    nebel(neu)
    schnee_dach((1, 1), neu)
    schnee_dach((2, 2), neu)
    schnee_dach((3, 3), neu)
    for i in (1, 2, 3):
        laub(i, neu)

    bestehend: list[dict] = []
    if MANIFEST.exists():
        data = json.loads(MANIFEST.read_text(encoding="utf-8"))
        bestehend = [
            e
            for e in data.get("eintraege", [])
            if not any(str(e.get("id", "")).startswith(p) for p in P1_IDS_PREFIX)
        ]
    eintraege = bestehend + neu
    MANIFEST.write_text(
        json.dumps({"version": 1, "eintraege": eintraege}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"P1 Wetter-Himmel: {len(neu)} neu, Manifest gesamt {len(eintraege)} → {MANIFEST}")


if __name__ == "__main__":
    main()
