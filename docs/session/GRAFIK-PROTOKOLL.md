# Protokoll Strang Grafik

> Neue Zeilen **unten anhängen**, eine Zeile je PR, nichts anderes in dieser Datei ändern.
> Git führt diese Datei beim Mergen selbst zusammen (`merge=union` in `.gitattributes`): Hängen zwei PRs gleichzeitig eine Zeile an, bleiben beide stehen.
> Einträge bis 31.10.2026 stehen in `docs/PLAN.md` §5.

| Datum | Änderung |
|---|---|
| 31.10.2026 | **G0–G11** (B-28): lebendige Szenen, Epochen 2–4, Belagerung; Einträge davor in `PLAN.md` §5 |
| 31.10.2026 | **Session-Prompt getrennt:** gemeinsamer Teil, Strang Lernkern, Strang Grafik |
| 31.10.2026 | **Sprite-Charge P0 (Dorf):** Gebäude Epoche 1, Boden, Wesen unter `public/grafik/atlas/`; Dorf-Szene nutzt Atlas, Code bleibt Fallback (`GRAFIK.md` §6, `GRAFIK-SPRITES.md` §8) |
| 31.10.2026 | **UI-Reorg:** Üben springt zur Aufgabe; Themenwahl unter Mehr; Bastion nur Bauplatz + Zahnrad-Einstellungen; Orientierung `darstellung.orientierung` (T-19, `GRAFIK.md` §1) |
| 31.10.2026 | **Bastion-Reiter Vollbild:** Chrome (Intro, Bedienhilfe, −/+/⌖, Bild-aus, ruhig/leicht/Sound) nur in Bastion-Einstellungen; Bühne ohne Kante; Hinterhof-Piktogramm; echtes Zahnrad; Querformat ohne untere Leiste (`GRAFIK.md` §1) |
| 31.10.2026 | **Boden/Wiese Atlas (Dorf):** Kacheln `flaeche`/`rand` (+ Varianten) erzeugt; Runtime legt Wiese aus Atlas, Code-Fallback bleibt (`GRAFIK.md` §6) |
| 31.10.2026 | **P1 Wetter-Himmel:** Sonne/Mond/Wolken, Regen/Schnee/Nebel, Schnee-Dach und Laub im Atlas; Bühne nutzt Sprites (`GRAFIK-SPRITES.md` §8) |
| 31.10.2026 | **Wetter-Cache dauerhaft:** Echtes Wetter bleibt bis Ort/Schalter geändert wird, kein Verfall um Mitternacht (T-15 / Preference PV) |
| 31.10.2026 | **Bastion spielbarer:** Vorrat-HUD, Bauen/Planen-Blatt, Versetzen per Ziehen, Wesen-Pfadfindung, Bewohner an Fortschritt (`GRAFIK.md` §1/§4.4) |
| 31.10.2026 | **P2 Garten-Sprites:** Gebäude Epoche 1, Rasen, Wesen (Biene/Schnecke/Schmetterling) im Atlas; Garten-Szene nutzt Atlas, Code bleibt Fallback (`GRAFIK.md` §6, `GRAFIK-SPRITES.md` §8) |
| 31.10.2026 | **Politur-Pass Bastion:** Versetzen ohne DataCloneError (`$state`-Proxy), Bau-Blatt-Schließen/Textumbruch, Auswahl↔Blatt, kompakte Knöpfe, Leiste Quer zuverlässiger |
| 31.10.2026 | **Abend-Fenster / Dorf-Politur:** `*_fenster.png`-Layer Dorf+Garten; Runtime am Abend; Tages-Sprites mit Rahmen/Sims (`GRAFIK-SPRITES.md` §1/§3) |
| 31.10.2026 | **Bewohner ausgebaut:** Handwerkerin/Imkerin, mehr Tätigkeiten, Fortschritts-Kopplung, Tippen+Zahnrad-Erklärung (`GRAFIK.md` §4.4) |
| 31.10.2026 | **P3 Bastion/Unterwasser/Weltraum:** Gebäude Epoche 1, Boden, Wesen (+ Abend-Fenster) im Atlas; Runtime mit Code-Fallback (`GRAFIK-SPRITES.md` §8) |
| 31.10.2026 | **P4 Hinterhof + MiniBastion:** Plätze/Wappen/Denkmal je Thema und Standbilder; Hinterhof-Szene und Startkarte nutzen Atlas (`GRAFIK-SPRITES.md` §7/§8) |
| 31.10.2026 | **P5 Epoche 2–4:** Gebäude aller Themen e2–e4 nach Katalog G9, Boden, Abend-Fenster; Atlas-Lookup mit Epoche-Fallback (`GRAFIK-SPRITES.md` §8) |
| 31.10.2026 | **P6 Belagerungs-Himmel / Rauch:** Spannungs-Dunst und Rauch-Overlays im Atlas; Bühne bei Bewährungsprobe (`GRAFIK-SPRITES.md` §8) |
| 31.10.2026 | **CC0-Sounddateien:** Kenney-Tips + eigenes Ambient unter `public/sound/` (Manifest); Loader mit Web-Audio-Fallback; PWA-Precache `.ogg` (T-18, G8) |
| 31.10.2026 | **Docs-Abgleich:** SESSION/PLAN/GRAFIK/SPRITES an Ist-Stand (G0–G11, P0–P6, CC0 erledigt; kein „nächster = G2“); optional Feinschliff klar |
| 31.10.2026 | **Feinschliff P3–P6:** Laub/Schnee-Dach nur Land; Hinterhof Umbruch+nur im Hinterhof-Blick; Bastion-Kern Firstkappe |
| 31.10.2026 | **Üben Ein-/Ausgabe:** Feedback-Schichtung, Antwortspiegel, Steine, Tipp-Notiz, Schrittweg-Checkliste, Tastatur angebunden (Lern-UI §9, Spec P0–P1) |
