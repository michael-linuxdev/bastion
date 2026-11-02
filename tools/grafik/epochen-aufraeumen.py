#!/usr/bin/env python3
"""Eine Stufe, ein Bild (Entscheidung PV, 02.11.2026, GRAFIK-SPRITES.md §12.11).

Entfernt in den Epochen 2–4 aller Themen die Gebäudebilder, deren Stufe es schon in
einer früheren Epoche gibt (vor allem die alten P5-Kisten der Stufen 1–3). Die App
zeigt dann das Bild aus der Epoche, in der die Stufe zuerst vorkommt.
Aufruf: python3 tools/grafik/epochen-aufraeumen.py
"""
from __future__ import annotations

import sys

sys.dont_write_bytecode = True
sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from g3_stil import raeume_epochen  # noqa: E402

THEMEN = ("bastion", "dorf", "garten", "unterwasser", "weltraum")

if __name__ == "__main__":
    for t in THEMEN:
        print(t, raeume_epochen(t), "Einträge entfernt")
