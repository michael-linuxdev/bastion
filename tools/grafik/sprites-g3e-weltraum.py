#!/usr/bin/env python3
"""G3 Epochen 2–4, Thema `weltraum` (GRAFIK-SPRITES.md §12.11, Entscheidung PV 02.11.2026).

Neue Stufen, je in der Epoche, in der sie zuerst baubar sind (eine Stufe, ein Bild):
  Epoche 2 (Außenbasis):     Kommandomodul 4–5, Sternwarte 3, Antennenmast 3, Montagehalle 2, Schleuse 2
  Epoche 3 (Orbitalstation): Kommandomodul 6–7, Sternwarte 4, Antennenmast 4, Montagehalle 3
  Epoche 4 (Sternenfestung): Kommandomodul 8–9, Sternwarte 5, Antennenmast 5

Materialleiter weiter (§12.10): Paneele mit Leuchtband → Ringmodule und mehr
Solarflügel → große Glaskuppel und Turm mit Ring. Der Modulturm aus Stufe 3 bleibt
der Kern; ab Stufe 4 wächst um ihn die Station im Fußabdruck (Seitenmodule,
Andockbucht, Ring, Kuppel, Spitze), in der Höhe je Stufe gut 8 %.
Aufruf: python3 tools/grafik/sprites-g3e-weltraum.py
Deterministisch, ohne Zufall.
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from g3_stil import (  # noqa: E402
    BREITE,
    HH,
    HW,
    KONTUR,
    PETROL,
    PETROL_HELL,
    Iso,
    hell,
    kuppel,
    schatten,
    schreibe_epochen,
)

# Materialleiter Weltraum (wie sprites-g3-weltraum.py)
BLECH = (150, 156, 164)
PANEEL = (222, 226, 232)
SOLAR = (52, 72, 128)
GLAS = (150, 206, 226)
ORANGE = (232, 140, 60)
LEUCHT = (110, 220, 220)
TUER = (64, 70, 80)
WARN = (236, 196, 60)


def bullauge(iso: Iso, mitte, r: float, fenster: list) -> None:
    x, y = mitte
    iso.d.ellipse([x - r - 2, y - r - 2, x + r + 2, y + r + 2], fill=BLECH, outline=KONTUR)
    pts = [(x + r * math.cos(a / 12 * 2 * math.pi), y + r * math.sin(a / 12 * 2 * math.pi)) for a in range(12)]
    iso.poly(pts, (40, 52, 70))
    fenster.append(pts)


def solarfluegel(iso: Iso, ansatz, laenge: float, hoehe: float, *, richtung: int = 1) -> None:
    x, y = ansatz
    dx, dy = laenge * richtung, -laenge * 0.5 * richtung
    iso.linie((x, y), (x + dx * 0.15, y + dy * 0.15), BLECH, 3)
    a = (x + dx * 0.15, y + dy * 0.15)
    pts = [(a[0], a[1] - hoehe / 2), (a[0] + dx, a[1] + dy - hoehe / 2), (a[0] + dx, a[1] + dy + hoehe / 2), (a[0], a[1] + hoehe / 2)]
    iso.poly(pts, SOLAR, KONTUR)
    for k in range(1, 5):
        t = k / 5
        iso.linie((a[0] + dx * t, a[1] + dy * t - hoehe / 2), (a[0] + dx * t, a[1] + dy * t + hoehe / 2), hell(SOLAR, 40))
    iso.linie((a[0], a[1]), (a[0] + dx, a[1] + dy), hell(SOLAR, 40))


def schuessel(iso: Iso, mitte, r: float, *, kippen: float = 0.45) -> None:
    x, y = mitte
    iso.d.ellipse([x - r, y - r * kippen, x + r, y + r * kippen], fill=hell(PANEEL, -30), outline=KONTUR)
    iso.d.ellipse([x - r * 0.8, y - r * kippen * 0.8 - 1, x + r * 0.8, y + r * kippen * 0.8 - 1], fill=PANEEL)
    iso.linie((x, y), (x + r * 0.2, y - r * 0.7), BLECH, 2)
    iso.d.ellipse([x + r * 0.2 - 2, y - r * 0.7 - 2, x + r * 0.2 + 2, y - r * 0.7 + 2], fill=ORANGE)


def schuessel_steil(iso: Iso, mitte, r: float) -> None:
    """Große Schüssel, zum Himmel gekippt (Radioteleskop): steht hochkant in der Bildebene."""
    x, y = mitte
    iso.d.ellipse([x - r * 0.62, y - r, x + r * 0.62, y + r], fill=hell(PANEEL, -34), outline=KONTUR)
    iso.d.ellipse([x - r * 0.5 + 3, y - r * 0.84, x + r * 0.5 + 3, y + r * 0.84], fill=PANEEL)
    for t in (0.35, 0.7):
        iso.d.ellipse([x - r * 0.5 * t + 3, y - r * 0.84 * t, x + r * 0.5 * t + 3, y + r * 0.84 * t], outline=hell(PANEEL, -30))
    tip = (x + r * 0.7, y - r * 0.15)
    for dy in (-r * 0.6, r * 0.6):
        iso.linie((x + 3, y + dy), tip, BLECH, 2)
    iso.d.ellipse([tip[0] - 4, tip[1] - 4, tip[0] + 4, tip[1] + 4], fill=ORANGE, outline=KONTUR)


def leuchtring(iso: Iso, x, y, r: float, z: float, fenster: list) -> None:
    cx, cy = iso.p(x, y, 0)
    rr = r * HW * math.sqrt(2)
    lb = [(cx - rr, cy - z), (cx + rr, cy - z), (cx + rr, cy - z - 4), (cx - rr, cy - z - 4)]
    iso.poly(lb, LEUCHT)
    fenster.append(lb)


def modul(iso: Iso, fenster: list, x, y, r: float, z0: float, z1: float, *, augen: int = 3) -> None:
    """Rundes Paneelmodul mit Bullaugen, Leuchtband unten und Blechkragen oben."""
    iso.zylinder(x, y, r, z0, z1, PANEEL, stein=False)
    iso.zylinder(x, y, r + 0.04, z1, z1 + 4, BLECH, stein=False)
    cx, cy = iso.p(x, y, 0)
    rr = r * HW * math.sqrt(2)
    for k in range(augen):
        dx = rr * (-0.5 + k / max(1, augen - 1)) if augen > 1 else rr * 0.1
        bullauge(iso, (cx + dx, cy - (z0 + z1) / 2 + abs(dx) * 0.1), 6 if r < 0.4 else 7, fenster)
    leuchtring(iso, x, y, r, z0 + 6, fenster)


def ring(iso: Iso, x, y, r: float, z: float, teil: str, *, dicke: int = 10) -> None:
    """Wohnring um einen Turm (Torus von schräg oben): `teil` = "hinten" oder "vorne"."""
    cx, cy = iso.p(x, y, z)
    rx, ry = r * HW * math.sqrt(2), r * HH * math.sqrt(2)
    box = [cx - rx, cy - ry, cx + rx, cy + ry]
    if teil == "hinten":
        iso.d.arc([box[0], box[1] - dicke / 2, box[2], box[3] - dicke / 2], 180, 360, fill=KONTUR, width=dicke + 2)
        iso.d.arc([box[0], box[1] - dicke / 2, box[2], box[3] - dicke / 2], 180, 360, fill=hell(PANEEL, -26), width=dicke)
    else:
        iso.d.arc([box[0], box[1], box[2], box[3]], 0, 180, fill=KONTUR, width=dicke + 3)
        iso.d.arc([box[0], box[1], box[2], box[3]], 0, 180, fill=PANEEL, width=dicke)
        iso.d.arc([box[0] + 3, box[1] + 3, box[2] - 3, box[3] - 3], 20, 160, fill=LEUCHT, width=2)


def speichen(iso: Iso, x, y, r: float, z: float, innen: float) -> None:
    cx, cy = iso.p(x, y, z)
    rx, ry = r * HW * math.sqrt(2), r * HH * math.sqrt(2)
    ix = innen * HW * math.sqrt(2)
    for a in (math.pi * 0.15, math.pi * 0.85):
        iso.linie((cx + ix * math.cos(a), cy + ix * 0.5 * math.sin(a)), (cx + rx * math.cos(a), cy + ry * math.sin(a)), BLECH, 3)


def antenne(iso: Iso, fuss, h: float, fenster: list) -> tuple[float, float]:
    x, y = fuss
    iso.linie((x, y), (x, y - h), BLECH, 3)
    for t in (0.4, 0.7):
        iso.linie((x - 8 * (1 - t), y - h * t), (x + 8 * (1 - t), y - h * t), BLECH, 2)
    lat = [(x - 3, y - h - 2), (x + 3, y - h - 2), (x + 3, y - h - 8), (x - 3, y - h - 8)]
    iso.poly(lat, ORANGE, KONTUR)
    fenster.append(lat)
    return (x, y - h - 8)


# —— Kommandomodul (kern, 3×3): Station wächst um den Modulturm ——————————————

PLAN = {
    4: dict(mod=4, flg=1, seite=1, bucht=False, ring=0, ring2=0, kuppel="klein", spitze=40),
    5: dict(mod=4, flg=2, seite=2, bucht=True, ring=0, ring2=0, kuppel="klein", spitze=92),
    6: dict(mod=5, flg=2, seite=2, bucht=True, ring=1.42, ring2=0, kuppel="klein", spitze=84),
    7: dict(mod=5, flg=2, seite=3, bucht=True, ring=1.42, ring2=0, kuppel="klein", spitze=150),
    8: dict(mod=6, flg=3, seite=3, bucht=True, ring=1.42, ring2=0, kuppel="gross", spitze=84),
    9: dict(mod=7, flg=3, seite=3, bucht=True, ring=1.42, ring2=1.0, kuppel="gross", spitze=96),
}
MOD_H = 74


def kommando(iso: Iso, fenster: list, stufe: int) -> None:
    b = PLAN[stufe]
    p = iso.p
    schatten(iso, 1.5)
    iso.quader(-1.38, 1.38, -1.38, 1.38, 0, 12, BLECH)
    for k in range(7):  # Warnstreifen vorne an der Plattform
        u = -1.3 + k * 0.38
        iso.poly([p(u, 1.38, 0), p(u + 0.16, 1.38, 0), p(u + 0.24, 1.38, 12), p(u + 0.08, 1.38, 12)], WARN)
    hoehe = 12 + b["mod"] * (MOD_H + 4)
    # Seitenmodule links und rechts (1: flach, 2: zweistöckig mit Schüssel, 3: Rundtürme mit Kuppel)
    def seite(sx, sy) -> None:
        if b["seite"] == 3:
            iso.zylinder(sx, sy, 0.36, 12, 210, PANEEL, stein=False)
            cx2, cy2 = p(sx, sy, 0)
            for z in (60, 120, 180):
                bullauge(iso, (cx2 + 8, cy2 - z), 6, fenster)
                leuchtring(iso, sx, sy, 0.36, z - 24, fenster)
            o = kuppel(iso, sx, sy, 0.36, 210, 36, GLAS, rippen=4, rippe=BLECH)
            antenne(iso, o, 30, fenster)
            return
        h1 = 70
        iso.quader(sx - 0.42, sx + 0.42, sy - 0.42, sy + 0.42, 12, h1, PANEEL, links=-30, rechts=-8)
        fenster.append(iso.fenster_l(sx, sy + 0.42, 30, b=0.3, h=14, bogen=False))
        fenster.append(iso.fenster_r(sx + 0.42, sy, 30, b=0.3, h=14, bogen=False))
        leuchtband_q(sx - 0.42, sx + 0.42, sy - 0.42, sy + 0.42, h1 - 12)
        top = h1
        if b["seite"] == 2:
            iso.quader(sx - 0.32, sx + 0.32, sy - 0.32, sy + 0.32, h1, h1 + 54, PANEEL, links=-30, rechts=-8)
            fenster.append(iso.fenster_r(sx + 0.32, sy, h1 + 20, b=0.24, h=12, bogen=False))
            top = h1 + 54
        iso.quader(sx - 0.44, sx + 0.44, sy - 0.44, sy + 0.44, top, top + 4, BLECH) if b["seite"] == 1 else None
        schuessel(iso, p(sx, sy, top + 6), 18 if b["seite"] == 1 else 24)

    def leuchtband_q(x0, x1, y0, y1, z) -> None:
        l = [p(x0, y1, z), p(x1, y1, z), p(x1, y1, z + 4), p(x0, y1, z + 4)]
        r = [p(x1, y1, z), p(x1, y0, z), p(x1, y0, z + 4), p(x1, y1, z + 4)]
        iso.poly(l, LEUCHT)
        iso.poly(r, hell(LEUCHT, 20))
        fenster.append(l)
        fenster.append(r)

    seite(-0.9, -0.9)
    if b["ring"]:
        ring(iso, 0, 0, b["ring"], hoehe * 0.42, "hinten", dicke=14)
    if b["ring2"]:
        ring(iso, 0, 0, b["ring2"], hoehe * 0.78, "hinten", dicke=10)
    # Solarflügel hinten rechts
    for k in range(b["flg"]):
        solarfluegel(iso, p(0.5, -0.5, hoehe - 40 - k * 70), 86 + k * 6, 30)
    seite(0.95, -0.95)
    # Modulturm
    cx, cy = p(0, 0, 0)
    z = 12
    for i in range(b["mod"]):
        r = 0.74 - i * 0.05
        modul(iso, fenster, 0, 0, r, z, z + MOD_H)
        z += MOD_H + 4
    ry = 0.74 * HH * math.sqrt(2)
    iso.poly([(cx - 11, cy + ry - 14), (cx + 11, cy + ry - 14), (cx + 11, cy + ry - 54), (cx - 11, cy + ry - 54)], TUER, KONTUR)
    iso.banner_r(0.66, 0.66, 190, 52, PETROL)
    # Solarflügel vorne links
    for k in range(b["flg"]):
        solarfluegel(iso, p(-0.5, 0.5, hoehe - 70 - k * 70), 84 + k * 6, 30, richtung=-1)
    if b["ring"]:
        speichen(iso, 0, 0, b["ring"], hoehe * 0.42, 0.7)
        ring(iso, 0, 0, b["ring"], hoehe * 0.42, "vorne", dicke=14)
    if b["ring2"]:
        speichen(iso, 0, 0, b["ring2"], hoehe * 0.78, 0.6)
        ring(iso, 0, 0, b["ring2"], hoehe * 0.78, "vorne", dicke=10)
    seite(-0.95, 0.95)
    # Kuppel
    rk = 0.74 - b["mod"] * 0.05
    if b["kuppel"] == "gross":
        iso.zylinder(0, 0, rk + 0.12, z, z + 8, BLECH, stein=False)
        oben = kuppel(iso, 0, 0, rk + 0.2, z + 8, 100, GLAS, rippen=8, rippe=BLECH)
        g = p(0, 0, z + 40)
        fenster.append([(g[0] - 30, g[1] + 6), (g[0] + 30, g[1] + 6), (g[0] + 18, g[1] - 26), (g[0] - 18, g[1] - 26)])
    else:
        oben = kuppel(iso, 0, 0, rk, z, 52, GLAS, rippen=6, rippe=BLECH)
        g = p(0, 0, z + 20)
        fenster.append([(g[0] - 22, g[1] + 6), (g[0] + 22, g[1] + 6), (g[0] + 12, g[1] - 16), (g[0] - 12, g[1] - 16)])
    sp = antenne(iso, oben, b["spitze"], fenster)
    iso.fahne(sp, 30, PETROL_HELL)
    # vorne: Andockbucht mit kleiner Fähre
    if b["bucht"]:
        iso.quader(0.55, 1.3, 0.55, 1.3, 12, 46, PANEEL, links=-30, rechts=-8)
        leuchtring(iso, 0.92, 0.92, 0.0, 0, [])
        m = p(0.92, 0.92, 46)
        iso.poly([(m[0] - 26, m[1] + 2), (m[0] + 22, m[1] - 4), (m[0] + 34, m[1] - 12), (m[0] + 20, m[1] - 18), (m[0] - 24, m[1] - 12)], PANEEL, KONTUR)
        iso.poly([(m[0] - 4, m[1] - 10), (m[0] + 8, m[1] - 26), (m[0] + 14, m[1] - 14)], ORANGE, KONTUR)
        cock = [(m[0] + 20, m[1] - 16), (m[0] + 30, m[1] - 12), (m[0] + 20, m[1] - 8)]
        iso.poly(cock, GLAS, KONTUR)
        fenster.append(cock)
        for k in range(4):
            q = p(0.6 + k * 0.22, 1.3, 30)
            l = [(q[0] - 2, q[1] - 2), (q[0] + 2, q[1] - 2), (q[0] + 2, q[1] + 2), (q[0] - 2, q[1] + 2)]
            iso.poly(l, LEUCHT)
            fenster.append(l)


def stufe(n: int):
    return lambda iso, fenster: kommando(iso, fenster, n)


# —— Sternwarte (wissen, 2×2): Radioteleskop → Observatorium → großes Observatorium ——


def wissen3(iso: Iso, fenster: list) -> None:
    """Radioteleskop: große, zum Himmel gekippte Schüssel auf Gittergestell, Gerätehaus."""
    schatten(iso, 1.0)
    p = iso.p
    iso.quader(-0.9, 0.9, -0.9, 0.9, 0, 10, BLECH)
    iso.quader(-0.8, 0.0, 0.1, 0.85, 10, 64, PANEEL, links=-30, rechts=-8)
    fenster.append(iso.fenster_r(0.0, 0.48, 30, b=0.3, h=14, bogen=False))
    leuchtring(iso, -0.4, 0.48, 0.0, 0, [])
    b = p(0.25, -0.25, 10)
    for dx in (-20, 20):
        iso.linie((b[0] + dx, b[1]), (b[0], b[1] - 150), BLECH, 4)
    for z in range(20, 150, 26):
        f = 1 - z / 150
        iso.linie((b[0] - 20 * f, b[1] - z), (b[0] + 20 * f, b[1] - z - 13), hell(BLECH, -20), 2)
    schuessel_steil(iso, (b[0] - 6, b[1] - 210), 78)
    iso.banner_r(0.9, -0.2, 60, 40, PETROL)
    iso.fahne(p(-0.7, 0.2, 64), 40, PETROL_HELL)


def wissen4(iso: Iso, fenster: list) -> None:
    """Observatorium: zweigeschossiger Rundbau, große Kuppel mit Spalt, Schüssel daneben."""
    schatten(iso, 1.0)
    p = iso.p
    iso.quader(-0.9, 0.9, -0.9, 0.9, 0, 10, BLECH)
    iso.linie(p(-0.55, -0.55, 10), p(-0.55, -0.55, 250), BLECH, 5)
    for z in (60, 120, 180):
        iso.linie(p(-0.7, -0.55, z - 40), p(-0.55, -0.55, z), BLECH, 2)
    schuessel_steil(iso, p(-0.55, -0.55, 300), 56)
    modul(iso, fenster, 0.1, 0.1, 0.72, 10, 90)
    modul(iso, fenster, 0.1, 0.1, 0.66, 94, 170, augen=2)
    cx, cy = p(0.1, 0.1, 0)
    ry = 0.72 * HH * math.sqrt(2)
    iso.poly([(cx - 10, cy + ry - 2), (cx + 10, cy + ry - 2), (cx + 10, cy + ry - 40), (cx - 10, cy + ry - 40)], TUER, KONTUR)
    spitze = kuppel(iso, 0.1, 0.1, 0.72, 174, 92, PANEEL)
    sx, sy = spitze
    spalt = [(sx - 7, sy + 2), (sx + 7, sy + 2), (sx + 18, sy + 74), (sx + 2, sy + 76)]
    iso.poly(spalt, (30, 36, 52), KONTUR)
    fenster.append(spalt)
    iso.linie((sx + 6, sy + 50), (sx + 40, sy - 16), KONTUR, 16)
    iso.linie((sx + 6, sy + 50), (sx + 40, sy - 16), BLECH, 14)
    iso.d.ellipse([sx + 32, sy - 24, sx + 48, sy - 8], fill=GLAS, outline=KONTUR)
    iso.banner_r(0.82, 0.3, 160, 46, PETROL)
    iso.fahne((sx - 2, sy + 2), 30, PETROL_HELL)


def wissen5(iso: Iso, fenster: list) -> None:
    """Großes Observatorium: Turm mit Ring, große Glaskuppel mit Teleskop, zwei Schüsseln."""
    schatten(iso, 1.0)
    p = iso.p
    iso.quader(-0.95, 0.95, -0.95, 0.95, 0, 10, BLECH)
    schuessel_steil(iso, p(-0.6, -0.6, 160), 44)
    iso.linie(p(-0.6, -0.6, 10), p(-0.6, -0.6, 120), BLECH, 4)
    ring(iso, 0.05, 0.05, 0.98, 150, "hinten", dicke=10)
    modul(iso, fenster, 0.05, 0.05, 0.66, 10, 90)
    modul(iso, fenster, 0.05, 0.05, 0.6, 94, 174, augen=2)
    modul(iso, fenster, 0.05, 0.05, 0.54, 178, 238, augen=2)
    ring(iso, 0.05, 0.05, 0.98, 150, "vorne", dicke=10)
    cx, cy = p(0.05, 0.05, 0)
    ry = 0.66 * HH * math.sqrt(2)
    iso.poly([(cx - 10, cy + ry - 2), (cx + 10, cy + ry - 2), (cx + 10, cy + ry - 40), (cx - 10, cy + ry - 40)], TUER, KONTUR)
    iso.zylinder(0.05, 0.05, 0.62, 242, 250, BLECH, stein=False)
    spitze = kuppel(iso, 0.05, 0.05, 0.66, 250, 96, GLAS, rippen=8, rippe=BLECH)
    sx, sy = spitze
    g = [(sx - 26, sy + 70), (sx + 26, sy + 70), (sx + 16, sy + 40), (sx - 16, sy + 40)]
    fenster.append(g)
    iso.linie((sx - 10, sy + 70), (sx + 18, sy + 30), KONTUR, 14)
    iso.linie((sx - 10, sy + 70), (sx + 18, sy + 30), BLECH, 12)
    schuessel(iso, p(0.75, 0.75, 14), 22)
    iso.banner_r(0.66, 0.4, 230, 50, PETROL)
    sp = antenne(iso, spitze, 44, fenster)
    iso.fahne(sp, 30, PETROL_HELL)


# —— Antennenmast (turm, 1×1): Funkturm → hoher Funkturm → Sendeturm ——————————————


def turm3(iso: Iso, fenster: list) -> None:
    """Funkturm: runder Paneelschaft, Plattform mit zwei Schüsseln, Stabantenne."""
    schatten(iso, 0.5)
    p = iso.p
    iso.quader(-0.44, 0.44, -0.44, 0.44, 0, 10, BLECH)
    iso.zylinder(0, 0, 0.3, 10, 230, PANEEL, stein=False)
    cx, cy = p(0, 0, 0)
    for z in (60, 120, 180):
        leuchtring(iso, 0, 0, 0.3, z, fenster)
    iso.poly([(cx - 8, cy + 10), (cx + 8, cy + 10), (cx + 8, cy - 22), (cx - 8, cy - 22)], TUER, KONTUR)
    iso.zylinder(0, 0, 0.46, 230, 244, BLECH, stein=False)
    schuessel(iso, p(-0.2, 0.2, 262), 22)
    schuessel(iso, p(0.25, -0.25, 270), 20)
    sp = antenne(iso, p(0, 0, 244), 96, fenster)
    iso.fahne((sp[0], sp[1] + 40), 0, PETROL_HELL)


def turm4(iso: Iso, fenster: list) -> None:
    """Hoher Funkturm: schlanker Schaft, Ringplattform mit Schüsseln, Spitze mit Blinklicht."""
    schatten(iso, 0.5)
    p = iso.p
    iso.quader(-0.44, 0.44, -0.44, 0.44, 0, 10, BLECH)
    iso.zylinder(0, 0, 0.26, 10, 300, PANEEL, stein=False)
    cx, cy = p(0, 0, 0)
    for z in (60, 130, 200, 260):
        leuchtring(iso, 0, 0, 0.26, z, fenster)
    iso.poly([(cx - 8, cy + 8), (cx + 8, cy + 8), (cx + 8, cy - 24), (cx - 8, cy - 24)], TUER, KONTUR)
    ring(iso, 0, 0, 0.5, 300, "hinten", dicke=10)
    iso.zylinder(0, 0, 0.34, 300, 330, PANEEL, stein=False)
    for dx in (-10, 10):
        bullauge(iso, (cx + dx, cy - 316), 5, fenster)
    ring(iso, 0, 0, 0.5, 300, "vorne", dicke=10)
    schuessel(iso, p(0.3, -0.3, 300), 18)
    iso.zylinder(0, 0, 0.36, 330, 336, BLECH, stein=False)
    sp = antenne(iso, p(0, 0, 336), 110, fenster)
    iso.fahne(sp, 30, PETROL_HELL)
    iso.banner_r(0.26, 0.05, 240, 50, PETROL)


def turm5(iso: Iso, fenster: list) -> None:
    """Sendeturm der Sternenfestung: zwei Ringplattformen, Glaskanzel, hohe Spitze."""
    schatten(iso, 0.5)
    p = iso.p
    iso.quader(-0.46, 0.46, -0.46, 0.46, 0, 12, BLECH)
    iso.zylinder(0, 0, 0.3, 12, 340, PANEEL, stein=False)
    cx, cy = p(0, 0, 0)
    for z in (60, 130, 200, 270):
        leuchtring(iso, 0, 0, 0.3, z, fenster)
    iso.poly([(cx - 8, cy + 8), (cx + 8, cy + 8), (cx + 8, cy - 24), (cx - 8, cy - 24)], TUER, KONTUR)
    for z, r in ((200, 0.48), (340, 0.52)):
        ring(iso, 0, 0, r, z, "hinten", dicke=9)
    for z, r in ((200, 0.48),):
        ring(iso, 0, 0, r, z, "vorne", dicke=9)
    iso.zylinder(0, 0, 0.38, 340, 380, BLECH, stein=False)
    oben = kuppel(iso, 0, 0, 0.36, 380, 36, GLAS, rippen=4, rippe=BLECH)
    g = p(0, 0, 392)
    fenster.append([(g[0] - 14, g[1] + 4), (g[0] + 14, g[1] + 4), (g[0] + 8, g[1] - 10), (g[0] - 8, g[1] - 10)])
    ring(iso, 0, 0, 0.52, 340, "vorne", dicke=9)
    sp = antenne(iso, oben, 120, fenster)
    iso.fahne(sp, 30, PETROL_HELL)
    iso.banner_r(0.3, 0.05, 320, 54, PETROL)


# —— Montagehalle (werkstatt, 2×2) und Schleuse (eingang, 1×1) ——————————————————


def werkstatt2(iso: Iso, fenster: list) -> None:
    """Größere Montagehalle mit Tonnendach und Portalkran über einer kleinen Rakete."""
    schatten(iso, 0.95)
    p = iso.p
    x0, x1, y0, y1 = -0.85, 0.2, -0.8, 0.5
    iso.quader(x0, x1, y0, y1, 0, 90, PANEEL, links=-30, rechts=-8)
    tor = [p(-0.7, y1, 0), p(0.05, y1, 0), p(0.05, y1, 64), p(-0.7, y1, 64)]
    iso.poly(tor, (54, 60, 72), KONTUR)
    for k in range(5):
        iso.linie(p(-0.7, y1, 12 + k * 12), p(0.05, y1, 12 + k * 12), hell(TUER, 20))
    fenster.append(iso.fenster_r(x1, -0.4, 40, b=0.3, h=18, bogen=False))
    iso.quader(x0 - 0.02, x1 + 0.02, y0 - 0.02, y1 + 0.02, 90, 96, BLECH)
    leuchtring(iso, -0.3, 0.5, 0.0, 0, [])
    # Rakete rechts vorne
    rk = p(0.6, 0.45, 0)
    iso.poly([(rk[0] - 10, rk[1]), (rk[0] + 10, rk[1]), (rk[0] + 10, rk[1] - 110), (rk[0] - 10, rk[1] - 110)], PANEEL, KONTUR)
    iso.poly([(rk[0] - 10, rk[1] - 110), (rk[0] + 10, rk[1] - 110), (rk[0], rk[1] - 140)], ORANGE, KONTUR)
    for s in (-1, 1):
        iso.poly([(rk[0] + 10 * s, rk[1]), (rk[0] + 20 * s, rk[1] + 4), (rk[0] + 10 * s, rk[1] - 26)], ORANGE, KONTUR)
    bullauge(iso, (rk[0], rk[1] - 80), 4, fenster)
    # Portalkran über der Rakete
    for xx in (0.3, 0.9):
        iso.quader(xx - 0.04, xx + 0.04, 0.15, 0.23, 0, 170, ORANGE, links=-30, rechts=-8)
    iso.linie(p(0.3, 0.19, 170), p(0.9, 0.19, 170), ORANGE, 6)
    iso.linie(p(0.6, 0.19, 170), p(0.6, 0.45, 150), BLECH, 2)
    iso.banner_r(0.2, 0.0, 90, 40, PETROL)
    iso.fahne(p(0.9, 0.19, 170), 30, PETROL_HELL)


def werkstatt3(iso: Iso, fenster: list) -> None:
    """Startrampe: hohe Rakete im Startturm, Hangar mit Leuchtband, Treibstofftank."""
    schatten(iso, 0.95)
    p = iso.p
    iso.quader(-0.95, 0.95, -0.95, 0.95, 0, 10, BLECH)
    iso.quader(-0.9, -0.1, -0.9, 0.2, 10, 96, PANEEL, links=-30, rechts=-8)
    iso.quader(-0.92, -0.08, -0.92, 0.22, 96, 102, BLECH)
    tor = [p(-0.75, 0.2, 10), p(-0.25, 0.2, 10), p(-0.25, 0.2, 70), p(-0.75, 0.2, 70)]
    iso.poly(tor, (54, 60, 72), KONTUR)
    leuchtring(iso, -0.5, 0.2, 0.0, 0, [])
    fenster.append(iso.fenster_r(-0.1, -0.35, 50, b=0.3, h=16, bogen=False))
    # Tank links vorne
    iso.zylinder(-0.55, 0.65, 0.22, 10, 70, hell(PANEEL, -10), stein=False)
    kuppel(iso, -0.55, 0.65, 0.22, 70, 16, PANEEL)
    # Startturm (Gitter) und Rakete
    t = p(0.5, -0.2, 10)
    for dx in (-30, -12):
        iso.linie((t[0] + dx, t[1]), (t[0] + dx, t[1] - 270), ORANGE, 4)
    for z in range(10, 270, 24):
        iso.linie((t[0] - 30, t[1] - z), (t[0] - 12, t[1] - z - 20), hell(ORANGE, -20), 2)
    rk = p(0.45, 0.35, 10)
    iso.poly([(rk[0] - 14, rk[1]), (rk[0] + 14, rk[1]), (rk[0] + 14, rk[1] - 230), (rk[0] - 14, rk[1] - 230)], PANEEL, KONTUR)
    iso.poly([(rk[0] + 4, rk[1]), (rk[0] + 14, rk[1]), (rk[0] + 14, rk[1] - 230), (rk[0] + 4, rk[1] - 230)], hell(PANEEL, 14))
    for zz in (60, 150):
        iso.linie((rk[0] - 14, rk[1] - zz), (rk[0] + 14, rk[1] - zz), hell(PANEEL, -40), 2)
    iso.poly([(rk[0] - 14, rk[1] - 230), (rk[0] + 14, rk[1] - 230), (rk[0], rk[1] - 276)], ORANGE, KONTUR)
    for s in (-1, 1):
        iso.poly([(rk[0] + 14 * s, rk[1]), (rk[0] + 28 * s, rk[1] + 6), (rk[0] + 14 * s, rk[1] - 40)], ORANGE, KONTUR)
    bullauge(iso, (rk[0], rk[1] - 196), 5, fenster)
    iso.linie((t[0] - 12, t[1] - 200), (rk[0] - 14, rk[1] - 196), BLECH, 3)
    iso.banner_r(-0.1, 0.0, 96, 40, PETROL)
    iso.fahne((t[0] - 30, t[1] - 270), 30, PETROL_HELL)


def eingang2(iso: Iso, fenster: list) -> None:
    """Große Schleuse mit Andockarm: Paneelrahmen, Doppeltür, Kontrollkanzel, Arm mit Ring."""
    schatten(iso, 0.5)
    p = iso.p
    iso.quader(-0.48, 0.48, -0.18, 0.18, 0, 132, PANEEL, links=-30, rechts=-8)
    tuer = [p(-0.3, 0.18, 6), p(0.3, 0.18, 6), p(0.3, 0.18, 76), p(-0.3, 0.18, 76)]
    iso.poly(tuer, TUER, KONTUR)
    iso.linie(p(0.0, 0.18, 6), p(0.0, 0.18, 76), hell(TUER, 30), 2)
    for k in range(6):
        u = -0.48 + k * 0.16
        iso.poly([p(u, 0.18, 0), p(u + 0.08, 0.18, 0), p(u + 0.12, 0.18, 6), p(u + 0.04, 0.18, 6)], WARN)
    leuchtring(iso, 0.0, 0.18, 0.0, 0, [])
    fenster.append(iso.fenster_r(0.48, 0.0, 96, b=0.24, h=18, bogen=False))
    iso.quader(-0.5, 0.5, -0.2, 0.2, 132, 138, BLECH)
    iso.zylinder(-0.1, 0.0, 0.2, 138, 168, PANEEL, stein=False)
    oben = kuppel(iso, -0.1, 0.0, 0.2, 168, 22, GLAS, rippen=3, rippe=BLECH)
    fenster.append([(oben[0] - 10, oben[1] + 18), (oben[0] + 10, oben[1] + 18), (oben[0] + 6, oben[1] + 8), (oben[0] - 6, oben[1] + 8)])
    # Andockarm nach rechts oben mit Ring
    a = p(0.4, 0.0, 120)
    e = (a[0] + 34, a[1] - 52)
    iso.linie(a, e, BLECH, 6)
    iso.d.ellipse([e[0] - 9, e[1] - 14, e[0] + 9, e[1] + 14], fill=BLECH, outline=KONTUR)
    iso.d.ellipse([e[0] - 5, e[1] - 9, e[0] + 5, e[1] + 9], fill=hell(BLECH, -50))
    sp = antenne(iso, oben, 30, fenster)
    iso.fahne(sp, 26, PETROL_HELL)
    iso.banner_r(0.48, -0.08, 128, 40, PETROL)


EPOCHEN = {
    2: [
        ("kern", 4, stufe(4), 3, BREITE),
        ("kern", 5, stufe(5), 3, BREITE),
        ("wissen", 3, wissen3, 2, 200),
        ("turm", 3, turm3, 1, 104),
        ("werkstatt", 2, werkstatt2, 2, 200),
        ("eingang", 2, eingang2, 1, 104),
    ],
    3: [
        ("kern", 6, stufe(6), 3, BREITE),
        ("kern", 7, stufe(7), 3, BREITE),
        ("wissen", 4, wissen4, 2, 200),
        ("turm", 4, turm4, 1, 104),
        ("werkstatt", 3, werkstatt3, 2, 200),
    ],
    4: [
        ("kern", 8, stufe(8), 3, BREITE),
        ("kern", 9, stufe(9), 3, BREITE),
        ("wissen", 5, wissen5, 2, 200),
        ("turm", 5, turm5, 1, 104),
    ],
}

if __name__ == "__main__":
    sys.exit(schreibe_epochen("weltraum", EPOCHEN))
