#!/usr/bin/env python3
"""G3: Hinterhof und Startbild der MiniBastion im Stil der Stil-Regel (GRAFIK-SPRITES.md §12).

Ersetzt die Bilder aus `sprites-p4-hinterhof.py` mit denselben IDs, Pfaden und Maßen
(Einträge in `manifest.json` bleiben gleich):

- `hinterhof/<thema>/platz_offen|platz_g|platz_m` (64 × 64): Sockel aus dem Material des
  Themas, leer oder mit dem Themen-Zeichen (Buch, Blume, Stern, Garbe, Perle) in Bronze
  (grundlegend) oder Silber (mittel).
- `hinterhof/<thema>/wappen_voll` (80 × 96): Wappenschild in Petrol mit Bronzerand und
  Zeichen auf einem Ständer.
- `hinterhof/<thema>/denkmal_voll` (80 × 100): das Denkmal-Bild des Themas aus Epoche 1
  (`gebaeude/<thema>/e1/denkmal_s1.png`), verkleinert – so sieht es aus wie im Bauplatz.
- `minibat/<thema>/standbild` (960 × 480): eine kleine Bastion des Themas, zusammengesetzt
  aus den G3-Bildern von Epoche 1 (Bergfried Stufe 3, Studierstube 2, Späherturm 2,
  Einfassung, Feuerstelle und Umgebung) auf den Bodenkacheln. Die Startseite zeigt damit,
  was man in der Bastion wirklich sieht.

Klein gezeichnet wird vierfach und dann weich verkleinert (wie die Wesen, §12.7).
Deterministisch, ohne Zufall.
Aufruf: python3 tools/grafik/sprites-g3-hinterhof.py
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from g3_stil import ATLAS, HH, HW, KONTUR, PETROL, STEIN, hell  # noqa: E402

THEMEN = ("bastion", "garten", "weltraum", "dorf", "unterwasser")
ZEICHEN = {"bastion": "buch", "garten": "blume", "weltraum": "stern", "dorf": "garbe", "unterwasser": "perle"}
# Sockel-Material je Thema (Materialleiter §12.5 / §12.10)
SOCKEL_MAT = {
    "bastion": STEIN,
    "dorf": (168, 156, 138),  # Bruchstein
    "garten": (178, 138, 92),  # Brett
    "unterwasser": (206, 156, 132),  # Korallenstein
    "weltraum": (222, 226, 232),  # Paneel
}
BRONZE = (196, 132, 70)
SILBER = (192, 200, 212)
PAPIER = (246, 241, 231)
GOLD_MATT = (214, 182, 104)
K = (43, 38, 32, 150)  # Kontur in klein etwas kräftiger, damit sie nach dem Verkleinern trägt


class Klein:
    """Zeichenfläche in vierfacher Größe; `fertig()` verkleinert weich."""

    def __init__(self, w: int, h: int, s: int = 4) -> None:
        self.s, self.w, self.h = s, w, h
        self.bild = Image.new("RGBA", (w * s, h * s), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.bild)

    def q(self, pts):
        return [(round(x * self.s), round(y * self.s)) for x, y in pts]

    def form(self, pts, farbe, kontur=True) -> None:
        self.d.polygon(self.q(pts), fill=farbe, outline=K if kontur else None, width=self.s if kontur else 0)

    def oval(self, x0, y0, x1, y1, farbe, kontur=True) -> None:
        s = self.s
        self.d.ellipse([x0 * s, y0 * s, x1 * s, y1 * s], fill=farbe, outline=K if kontur else None, width=s if kontur else 0)

    def strich(self, a, b, farbe, breite=1.0) -> None:
        self.d.line(self.q([a, b]), fill=farbe, width=max(1, round(breite * self.s)))

    def fertig(self) -> Image.Image:
        return self.bild.resize((self.w, self.h), Image.LANCZOS)


def sockel(k: Klein, cx: float, fuss: float, b: float, h: float, mat) -> float:
    """Isometrischer Sockel (Raute b breit, h hoch), Licht von rechts oben. Gibt die Oberkante zurück."""
    t = b / 4  # halbe Rautenhöhe
    oben = fuss - h
    k.oval(cx - b / 2 - 2, fuss - t - 1, cx + b / 2 + 2, fuss + t * 0.6, (0, 0, 0, 40), kontur=False)
    k.form([(cx - b / 2, oben - t), (cx, oben), (cx, fuss), (cx - b / 2, fuss - t)], hell(mat, -34))
    k.form([(cx, oben), (cx + b / 2, oben - t), (cx + b / 2, fuss - t), (cx, fuss)], hell(mat, -12))
    k.form([(cx - b / 2, oben - t), (cx, oben - 2 * t), (cx + b / 2, oben - t), (cx, oben)], hell(mat, 14))
    # Fuge in der Mitte des Sockels
    k.strich((cx - b / 2, fuss - t - h / 2), (cx, fuss - h / 2), hell(mat, -50), 0.6)
    k.strich((cx, fuss - h / 2), (cx + b / 2, fuss - t - h / 2), hell(mat, -30), 0.6)
    return oben - t


def zeichen(k: Klein, art: str, cx: float, fuss: float, farbe, g: float = 1.0) -> None:
    """Themen-Zeichen stehend, Fuß bei (cx, fuss); Licht von rechts oben."""
    dunkel, licht = hell(farbe, -40), hell(farbe, 34)
    if art == "buch":  # aufgestelltes Buch, leicht geöffnet
        k.form([(cx - 12 * g, fuss - 4 * g), (cx, fuss), (cx, fuss - 24 * g), (cx - 12 * g, fuss - 28 * g)], dunkel)
        k.form([(cx, fuss), (cx + 12 * g, fuss - 4 * g), (cx + 12 * g, fuss - 28 * g), (cx, fuss - 24 * g)], farbe)
        k.form([(cx - 9 * g, fuss - 7 * g), (cx - 1 * g, fuss - 4 * g), (cx - 1 * g, fuss - 23 * g), (cx - 9 * g, fuss - 26 * g)], PAPIER, kontur=False)
        k.form([(cx + 1 * g, fuss - 4 * g), (cx + 9 * g, fuss - 7 * g), (cx + 9 * g, fuss - 26 * g), (cx + 1 * g, fuss - 23 * g)], hell(PAPIER, -14), kontur=False)
        for z in (11, 16, 21):
            k.strich((cx - 8 * g, fuss - (z + 3) * g), (cx - 2 * g, fuss - z * g), hell(PAPIER, -60), 0.5)
            k.strich((cx + 2 * g, fuss - z * g), (cx + 8 * g, fuss - (z + 3) * g), hell(PAPIER, -60), 0.5)
    elif art == "blume":
        k.strich((cx, fuss), (cx, fuss - 16 * g), (70, 120, 60), 2.2 * g)
        k.form([(cx, fuss - 6 * g), (cx + 8 * g, fuss - 12 * g), (cx + 2 * g, fuss - 8 * g)], (92, 150, 70))
        m = fuss - 22 * g
        for i in range(6):
            a = math.pi * 2 * i / 6
            px, py = cx + math.cos(a) * 7 * g, m + math.sin(a) * 6 * g
            k.oval(px - 5 * g, py - 5 * g, px + 5 * g, py + 5 * g, licht if math.cos(a) > 0 else farbe)
        k.oval(cx - 4 * g, m - 4 * g, cx + 4 * g, m + 4 * g, (230, 196, 92))
    elif art == "stern":
        m = fuss - 16 * g
        pts = []
        for i in range(10):
            a = math.radians(-90 + i * 36)
            r = (14 if i % 2 == 0 else 6) * g
            pts.append((cx + math.cos(a) * r, m + math.sin(a) * r))
        k.form(pts, farbe)
        k.form([pts[0], pts[1], (cx, m), pts[9]], licht, kontur=False)
        k.form([pts[1], pts[2], pts[3], (cx, m)], licht, kontur=False)
        k.form([(cx, m), pts[5], pts[6], pts[7]], dunkel, kontur=False)
    elif art == "garbe":
        for dx in (-7, -3.5, 0, 3.5, 7):
            top = (cx + dx * 0.9 * g, fuss - (24 - abs(dx)) * g)
            k.strich((cx + dx * 0.3 * g, fuss), top, dunkel, 1.8 * g)
            k.oval(top[0] - 2.6 * g, top[1] - 5 * g, top[0] + 2.6 * g, top[1] + 2 * g, licht if dx >= 0 else farbe)
        k.form([(cx - 6 * g, fuss - 6 * g), (cx + 6 * g, fuss - 6 * g), (cx + 5 * g, fuss - 10 * g), (cx - 5 * g, fuss - 10 * g)], (120, 90, 56))
    else:  # perle in Muschel
        k.form([(cx - 14 * g, fuss - 2 * g), (cx + 14 * g, fuss - 2 * g), (cx + 10 * g, fuss + 2 * g), (cx - 10 * g, fuss + 2 * g)], (226, 204, 182))
        fan = [(cx - 14 * g, fuss - 2 * g)]
        for i in range(9):
            a = math.pi * (1 - i / 8)
            fan.append((cx + math.cos(a) * 14 * g, fuss - 2 * g - math.sin(a) * 18 * g))
        k.form(fan, (232, 208, 184))
        for i in range(1, 8):
            a = math.pi * (1 - i / 8)
            k.strich((cx, fuss - 2 * g), (cx + math.cos(a) * 13 * g, fuss - 2 * g - math.sin(a) * 17 * g), (196, 168, 140), 0.5)
        k.oval(cx - 7 * g, fuss - 15 * g, cx + 7 * g, fuss - 1 * g, farbe)
        k.oval(cx - 1 * g, fuss - 12 * g, cx + 4 * g, fuss - 7 * g, (255, 255, 255, 200), kontur=False)


def platz(thema: str, niveau: str | None) -> Image.Image:
    k = Klein(64, 64)
    mat = SOCKEL_MAT[thema]
    oben = sockel(k, 32, 60, 40, 8, mat)
    if niveau is None:  # leerer Platz: Mulde im Sockel (nie rot, §7)
        k.oval(23, oben + 6, 41, oben + 14, hell(mat, -46), kontur=False)
        k.oval(25, oben + 7.5, 39, oben + 13, hell(mat, -26), kontur=False)
    else:
        farbe = BRONZE if niveau == "g" else SILBER
        if thema == "weltraum" and niveau == "g":
            farbe = (214, 170, 92)
        zeichen(k, ZEICHEN[thema], 32, oben + 10, farbe, 1.0)
    return k.fertig()


def wappen(thema: str) -> Image.Image:
    k = Klein(80, 96)
    mat = SOCKEL_MAT[thema]
    sockel(k, 40, 92, 36, 6, mat)
    # Ständer: zwei Pfosten
    holz = (150, 104, 64) if thema != "weltraum" else (150, 156, 164)
    for x in (27, 53):
        k.form([(x - 2, 84), (x + 2, 84), (x + 2, 30), (x - 2, 30)], hell(holz, -20 if x < 40 else 0))
    # Schild: Bronzerand, Petrol-Fläche, linke Hälfte dunkler
    rand = [(40, 14), (64, 22), (61, 56), (40, 78), (19, 56), (16, 22)]
    k.form(rand, BRONZE)
    innen = [(40, 19), (59, 25), (56.5, 54), (40, 72), (23.5, 54), (21, 25)]
    k.form(innen, PETROL, kontur=False)
    k.form([(40, 19), (40, 72), (23.5, 54), (21, 25)], hell(PETROL, -20), kontur=False)
    k.strich((40, 19), (40, 72), hell(PETROL, -36), 0.6)
    zeichen(k, ZEICHEN[thema], 40, 58, GOLD_MATT, 0.95)
    # Glanzkante rechts oben am Rand
    k.strich((44, 16), (62, 23), hell(BRONZE, 40), 1.2)
    return k.fertig()


def denkmal(thema: str) -> Image.Image:
    quelle = Image.open(ATLAS / f"gebaeude/{thema}/e1/denkmal_s1.png").convert("RGBA")
    box = quelle.getbbox()
    assert box
    figur = quelle.crop(box)
    f = min(76 / figur.width, 96 / figur.height)
    figur = figur.resize((max(1, round(figur.width * f)), max(1, round(figur.height * f))), Image.LANCZOS)
    bild = Image.new("RGBA", (80, 100), (0, 0, 0, 0))
    bild.alpha_composite(figur, ((80 - figur.width) // 2, 100 - 2 - figur.height))
    return bild


# —— Startbild ——————————————————————————————————————————————

HIMMEL = {
    "bastion": (214, 236, 243),
    "dorf": (214, 236, 243),
    "garten": (220, 238, 236),
    "unterwasser": (108, 178, 210),
    "weltraum": (26, 35, 66),
}
# Seiten der Insel (Rand §12.5, je Thema)
INSELRAND = {
    "bastion": (28, 49, 36),
    "dorf": (63, 109, 50),
    "garten": (63, 135, 76),
    "unterwasser": (138, 120, 80),
    "weltraum": (42, 52, 72),
}
UMGEBUNG = {
    "bastion": ["baum_a", "baum_b", "busch", "stein"],
    "dorf": ["baum_a", "baum_b"],
    "garten": ["strauch_a", "strauch_b"],
    "unterwasser": ["koralle_a", "koralle_b"],
    "weltraum": [],
}


def lade(rel: str) -> Image.Image:
    return Image.open(ATLAS / rel).convert("RGBA")


def standbild(thema: str) -> Image.Image:
    W, H = 1920, 960  # doppelt, am Ende auf 960 × 480
    bild = Image.new("RGBA", (W, H), HIMMEL[thema] + (255,))
    d = ImageDraw.Draw(bild, "RGBA")
    # Himmel
    if thema == "weltraum":
        for i, (sx, sy) in enumerate([(360, 320), (560, 400), (760, 300), (1000, 360), (1320, 310), (1520, 420), (440, 520), (1460, 560), (880, 470)]):
            r = 3 + (i % 3) * 2
            d.ellipse([sx - r, sy - r, sx + r, sy + r], fill=(255, 200, 90) if i % 4 == 0 else (232, 238, 248))
    elif thema == "unterwasser":
        strahlen = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ds = ImageDraw.Draw(strahlen)
        for i in range(6):
            x = 300 + i * 240
            ds.polygon([(x, 0), (x + 70, 0), (x + 220, 640), (x + 170, 640)], fill=(255, 255, 255, 26))
        bild.alpha_composite(strahlen)
        for x, y, r in ((420, 520, 9), (450, 440, 6), (1480, 560, 8), (1510, 480, 5)):
            d.ellipse([x - r, y - r, x + r, y + r], outline=(255, 255, 255, 120), width=3)
    else:
        sonne = lade("himmel/sonne.png").resize((130, 130), Image.LANCZOS)
        bild.alpha_composite(sonne, (1430, 300))
        for name, x, y, f in (("wolke_1", 340, 320, 1.4), ("wolke_2", 1080, 290, 1.1), ("wolke_1", 1300, 470, 0.9)):
            w = lade(f"himmel/{name}.png")
            w = w.resize((round(w.width * f), round(w.height * f)), Image.LANCZOS)
            bild.alpha_composite(w, (x, y))

    # Insel: 10 × 10 Felder, Mitte bei (cx, cy); Raster 96 × 48 (§12.2)
    n = 10
    cx, cy = W / 2, H - 70 - n * HH  # Mitte der Raute

    def p(x: float, y: float, z: float = 0) -> tuple[float, float]:
        return (cx + (x - y) * HW, cy + (x + y) * HH - z)

    a = n / 2
    dicke = 46
    links, unten, rechts = p(-a, a), p(a, a), p(a, -a)
    d.polygon([links, unten, (unten[0], unten[1] + dicke), (links[0], links[1] + dicke)], fill=INSELRAND[thema])
    d.polygon([unten, rechts, (rechts[0], rechts[1] + dicke), (unten[0], unten[1] + dicke)], fill=hell(INSELRAND[thema], -16))
    kacheln = {k: lade(f"boden/{thema}/e1/{k}.png") for k in ("flaeche", "flaeche_b", "flaeche_hell", "rand")}
    for i in range(n):
        for j in range(n):
            rand = i in (0, n - 1) or j in (0, n - 1)
            art = "rand" if rand else ("flaeche_b" if (i * 7 + j * 3) % 5 == 0 else "flaeche_hell" if (i * 3 + j * 5) % 7 == 0 else "flaeche")
            t = kacheln[art]
            bx, by = p(i - a + 1, j - a + 1)
            bild.alpha_composite(t, (round(bx - t.width / 2), round(by - t.height)))

    # Dinge auf der Insel: (Bild, unterste Ecke des Fußabdrucks x, y); gezeichnet nach x + y
    dinge: list[tuple[str, float, float]] = []
    g = f"gebaeude/{thema}/e1"
    dinge.append((f"{g}/kern_s3.png", 1.5, 1.5))
    dinge.append((f"{g}/wissen_s2.png", -2.2, 2.6))
    dinge.append((f"{g}/turm_s2.png", 3.4, -2.0))
    dinge.append((f"{g}/ursprung_s1.png", 2.8, 3.0))
    dinge.append((f"{g}/werkstatt_s1.png", 2.4, -3.4))
    for k in range(5):  # Einfassung an der hinteren rechten Kante
        dinge.append((f"{g}/einfassung_s1.png", -3.4 + k, -4.2))
    um = UMGEBUNG[thema]
    plaetze = [(-4.0, -1.6), (-3.6, 0.4), (-1.6, -3.2), (4.2, 0.6), (4.3, 2.3), (-4.2, 4.2), (0.6, 4.3)]
    for k, (x, y) in enumerate(plaetze):
        if um:
            dinge.append((f"{thema}/umgebung/{um[k % len(um)]}", x, y))
    for rel, x, y in sorted(dinge, key=lambda t: t[1] + t[2]):
        datei = rel if rel.endswith(".png") else f"umgebung/{thema}/{rel.rsplit('/', 1)[1]}.png"
        b = lade(datei)
        bx, by = p(x, y)
        bild.alpha_composite(b, (round(bx - b.width / 2), round(by - b.height + 4)))
    # Ausschnitt um die Insel, damit sie die Karte der Startseite füllt
    bw, bh = 1480, 740
    box = (round((W - bw) / 2), H - bh, round((W + bw) / 2), H)
    return bild.crop(box).convert("RGB").resize((960, 480), Image.LANCZOS).convert("RGBA")


def speichere(rel: str, b: Image.Image) -> None:
    pfad = ATLAS / rel
    pfad.parent.mkdir(parents=True, exist_ok=True)
    b.save(pfad, "PNG", optimize=True)
    print(rel, b.size)


def main() -> int:
    for t in THEMEN:
        speichere(f"hinterhof/{t}/platz_offen.png", platz(t, None))
        speichere(f"hinterhof/{t}/platz_g.png", platz(t, "g"))
        speichere(f"hinterhof/{t}/platz_m.png", platz(t, "m"))
        speichere(f"hinterhof/{t}/wappen_voll.png", wappen(t))
        speichere(f"hinterhof/{t}/denkmal_voll.png", denkmal(t))
        speichere(f"minibat/{t}/standbild.png", standbild(t))
    return 0


if __name__ == "__main__":
    sys.exit(main())
