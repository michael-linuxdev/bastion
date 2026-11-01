# Strang Grafik – Session-Prompt

> Für Sitzungen, die an Grafik und Basebau arbeiten: Aussehen, Startseite, Bastion, Themen, Bauplatz.
> Vorher den gemeinsamen Teil lesen: `docs/SESSION-PROMPT.md`. Am Ende der Sitzung nur diese Datei, `docs/GRAFIK.md` und den Abschnitt §4a in `docs/PLAN.md` aktualisieren.

Stand: 01.11.2026 · Fokus Paket G (`FOKUS.md`): G0 entschieden, G1 gemessen, G5 Teil 1 (Ausbauen beim Antippen) umgesetzt; Probestück Bergfried (a)/(b) wartet auf die Wahl des PV (`GRAFIK.md` §11).

---

## Zuständigkeit

Siehe Tabelle im gemeinsamen Teil. Kurz: `src/ui/grafik/`, `src/ui/bastion/` (mit `grafik/` und `sound/`), `src/ui/start/`, `src/ui/grund.css`, `src/core/bastion/`, `src/core/ledger/`, `tools/sim/`, `public/` (Atlas, Sound). Dokumente: `GRAFIK.md`, `GRAFIK-SPRITES.md`, `BASEBAU.md`, `DESIGN-IDEEN.md` (Backlog AA–ZZ).

**Grenzen:** Der Basebau bleibt Nebensache (K-27). Design-Regeln R1–R7 (`VISION.md` §9) gelten für jedes Bild: keine Zufallsbelohnungen, keine Echtzeit-Timer, kein Verfall, „Bewegung reduzieren“ wird beachtet. Grafik ändert nie Daten (B-27): Lernstand und Bastion kennen keine Bilder.

---

## Aktueller Auftrag

**Erledigt:**

- **Umbau auf Richtung A** (`GRAFIK.md` §5, Schritte 1 bis 6): Tokens und Fassung „tag-warm“, Start-Hub, Üben, Bastion als Insel schräg von oben, „Mehr“, Korrekturen für das iPhone 13.
- **App-Menü / Bau / Test-Vorrat (31.10.2026):** Untere Reiterleiste entfernt; Start-Hub mit Mehr-Kachel; Bau-Blatt mit Atlas-Vorschau; Eltern-Schalter Unendlich Rohstoffe (Probe-Bastion im Speicher, Ledger unberührt).
- **Design-Bündel (31.10.2026):** Hub als Türen+Ort, lebendige MiniBastion, HUD-Beutel/Material-Icons, Bauen am Rand, Mini-Szene-Vorschau, Planen/Bauen-Trennung, Probe-Banner, Eltern-Werkstatt, Display-Schriftrolle, sanfte Motion.
- **Thema Dorf** (#83) und **Zoom des Bauplatzes** (#85, alle Themen).
- **Basebau Epoche 1** vollständig (`PLAN.md` §4a, A bis D).
- **Lebendige Szenen, G0 bis G11** (B-28, `GRAFIK.md` §4–§10, PRs #93 bis #105): Atmosphäre mit Schaltern „ruhig“ und „leicht“, Jahreszeit und Abend aus dem Datum, Wetter von Open-Meteo nur nach Einschalten (T-15), Lebewesen, Atlas-Lader mit Code-Fallback, eigene Szenen für Garten, Unterwasser und Weltraum, Hinterhof in der Szene, Ton (Standard aus), Katalog und Wechsel für Epochen 2 bis 4, Optik je Epoche, Bewährungsprobe (Belagerung).
- **UI-Reorg** (#108, `GRAFIK.md` §1, T-19): „Üben“ springt zur nächsten Aufgabe, die Themenwahl liegt unter „Mehr“, die Bastion zeigt nur den Bauplatz mit Zahnrad für die Einstellungen, die Bildschirm-Orientierung ist wählbar.
- **Bastion-Reiter aufräumen / Vollbild:** Chrome (Intro, Bedienhilfe, −/+ / ⌖, Bild-aus, ruhig/leicht/Sound) nur noch in Bastion-Einstellungen; Bühne ohne Karten-Kante; Hinterhof als Piktogramm; echtes Zahnrad; Querformat ohne untere Leiste.
- **Sprite-Charge P0 Dorf** (#109, `GRAFIK.md` §6, `GRAFIK-SPRITES.md` §8): Gebäude Epoche 1, Boden-Kacheln und Wesen im Atlas, Code bleibt Fallback.
- **Boden/Wiese Atlas:** Dorf-Wiese aus Atlas-Kacheln (`flaeche`/`rand` + Varianten); Code-`dorfWiese` nur noch Fallback (`GRAFIK.md` §6, `GRAFIK-SPRITES.md` §3/§10).
- **P1 Wetter-Himmel:** Atlas-Sprites für Sonne/Mond/Wolken, Wetter-Partikel, Schnee-Dach und Laub; Runtime mit Code-Fallback (`GRAFIK-SPRITES.md` §5/§8).
- **P2 Garten:** Gebäude Epoche 1, Rasen-Kacheln und Wesen (Biene, Schnecke, Schmetterling) im Atlas; Runtime mit Code-Fallback (`garten.ts`, `GRAFIK-SPRITES.md` §8).
- **Bastion-Reiter spielbarer:** Vorrat-HUD und Bauen/Planen auf dem Reiter; Versetzen per Ziehen; Wesen-Pfadfindung um Gebäude; Bewohner (Zwerg/Gärtnerin/Bücherwurm/Torhüter) an Fortschritt gekoppelt (`GRAFIK.md` §1, §4.4).
- **Politur-Pass Bastion-Reiter:** Versetzen speichert ohne `$state`-Proxy (DataCloneError); Bau-Blatt mit Schließen und umbrechenden Kosten; Auswahl und Blatt ohne Doppel-HUD; kürzere Knöpfe; Leiste im Querformat zuverlässiger aus.
- **Abend-Fenster / Dorf-Politur:** Atlas-Layer `*_fenster.png` für Dorf- und Garten-Gebäude mit Fenstern; Bühne zeigt sie am Abend; Tages-Sprites mit Rahmen/Sims/Tür/klarer Kontur.
- **Bewohner ausgebaut:** Handwerkerin und Imkerin; Tätigkeiten pflanzen/ordnen/flicken/wachen/sammeln; klarere Freischaltung (Tor, Werkstatt, Denkmal, Bücher, fertig, Epoche); Antippen zeigt Name/Tätigkeit; Erklärung im Zahnrad (`GRAFIK.md` §4.4).
- **P3 Bastion/Unterwasser/Weltraum:** Gebäude Epoche 1, Boden-Kacheln und Wesen im Atlas; Abend-Fenster wo Öffnungen; Runtime mit Code-Fallback (`GRAFIK-SPRITES.md` §8).
- **P4 Hinterhof + MiniBastion:** Plätze/Wappen/Denkmal je Thema und Standbilder für die Startkarte; Runtime mit Code/SVG-Fallback (`GRAFIK-SPRITES.md` §7/§8).
- **P5 Epoche 2–4:** Gebäude je Thema nach Katalog G9 (reifere Optik, neue Stufen, Fenster, Boden); Runtime mit Epoche-Fallback (`GRAFIK-SPRITES.md` §8, G10).
- **P6 Belagerungs-Himmel / Rauch:** Atlas-Overlays `belagerung/himmel` und `rauch_1…3`; Bühne bei Bewährungsprobe mit Code-Fallback (`GRAFIK-SPRITES.md` §8).
- **CC0-Sounddateien (G8 nachgezogen):** Tipps aus Kenney Interface Sounds (CC0) und eigenes Ambient-Wind (CC0) unter `public/sound/` mit Manifest; Loader bevorzugt Dateien, sonst Web-Audio-Fallback; PWA-Precache `.ogg` (T-18).
- **Feinschliff P3–P6:** Herbstlaub und Schnee-Dach nur über Land; Hinterhof-Plätze mit Umbruch/Dichte-Skala und nur im Hinterhof-Blick; Bastion-Kern Firstkappe statt schwebender Zinnen.
- **Design-Ideen §R–§U (93–108):** Eingabe Uhr-Zifferblatt/Rest nachgeordnet; Fehlvorstellung mit Titel + Schema (Urteil, Karten, Ordnen, Schrittweg aus Lern-UI §9); Hub-Türen + Mehr-Zonen; Eltern Probe/PIN/Druck/Basebau-Trennung.
- **Üben Ein-/Ausgabe (Lern-UI §9):** Feedback-Schichtung, Antwortspiegel, Steine-Fortschritt, Tipp-Randnotiz, Schrittweg-Checkliste, Tastatur angebunden, Querformat; Spec `ueben-io-design` P0–P1.
- **Design-Ideen §K (39–52):** Steinkette, Klassenarbeit nüchtern, Abschluss-Ritual, Hub-Wetter, Geister-Bauplan, Vorrat einklappbar, „Alles sicher“, Über mich kindgerecht, Offline-Hinweis einmalig, Motion-Texte, Fokus-Ringe Eltern, weiche Bau-Sounds, Aufgabentext-Luft, einheitliche Leerzustände. K50 Prüfen-Sound im Lernpfad bewusst still (GRAFIK §9).
- **Design V–Z (109–128):** Systemschrift/Kontrast, SR-Reihenfolge Üben, Sound-Stufen aus/UI/Bastion, Hub-Vertrauen & nie-geübt, Bau ohne Rohstoffe, Stand „alles sitzt“, Sicherungshilfe, Tokens/Microcopy.
- **Design „Danach“:** Landkarte, stiller Üben→Bastion-Übergang, Fehlerwerkstatt-Paar, Bewohner-Statusgesten, Geste-Sprache, Onboarding erste Minute, Eltern=Werkstatt / Kind=Ort.
- **App-Icon / Favicon:** Bastion-Silhouette auf Akzent-Kachel (`public/icon.svg` + PNGs/maskable/apple/favicon-32); Generator `tools/grafik/icons-erzeugen.py`.

**Design L53–L64 (31.10.2026):** Tagesziel-Markierung, Wiederholen-Regal, Diagnose-Landkarte, Kamera-Gedächtnis, Bau-Kosten nach Auswahl, Bewohner-Namen, Hinterhof-HUD, PIN-Ton, Nacht nur Bastion, Eltern-Brief, Microcopy „Noch nicht“, Querformat Üben.

**Zuletzt:** Design-Ideen **§M–§Q** (65–92) auf `cursor/design-mq-da8f` – Feinschliff Lernen/Bastion, Pausen, Themenkarten, Bastion-Tiefe, Bewohner/Wesen.

**Als Nächstes (alles optional / PV):**

1. **Design-Wellen A–Z** in parallelen PRs fertigstellen und konsolidieren; Backlog danach aus `docs/DESIGN-IDEEN.md` (AA–ZZ). Themen-Welten (H29) erst nach Konsolidierung.
2. **Weiterer Feinschliff:** Jahreszeit-Auflagen (Schnee/Laub) stärker nutzen; Ambient Wasser/Regen (CC0).
3. **Auf dem iPhone 13 messen:** Ziel 60 Bilder je Sekunde, sonst „leicht“ (`GRAFIK.md` §4.5). Hängt an den Referenzgeräten (0.10, Projektverantwortlicher).
4. **Die Testerinnen probieren die Grafik aus**, zusammen mit dem Test U4b des Lernkerns, damit sie nur einmal kommen (`TESTS.md` §2).

Kein verbindlicher G-/P-Rest mehr. Weitere Schritte legt der Projektverantwortliche fest. Bei Engpass wartet die Grafik auf den Lernkern (K-27, B-28).

**Offen (PV):** Die drei Referenzgeräte festlegen und darauf messen (0.10).

---

## Wünsche aus dem anderen Strang

Hier trägt der andere Strang ein, was er in diesem Bereich braucht (gemeinsamer Teil, Regel 1). Erledigtes durchstreichen und mit Datum versehen.

- (noch keine)

---

## Protokoll

Steht in `docs/session/GRAFIK-PROTOKOLL.md`. Neue Zeilen dort unten anhängen, nicht hier.

---

## Übergabe bisheriger Sitzungen

- **29.10.2026:** Startseite auf dem iPhone 13 korrigiert (`viewport-fit=cover`, `--leiste-hoehe`), Glühbirne für die Fehlerwerkstatt.
- **30.10.2026:** **PR #83** (Dorf-Grafik) ist auf `main`. Das Thema Dorf unter „Wie soll es aussehen?“ zeigt die Dorfbilder aus Dorfkrieg (Wiese, Häuser, Zaun, Bäume, `GRAFIK.md` §6). Die anderen Themen bleiben die Insel. Kampffiguren gibt es nicht. **PR #85** (Zoom des Bauplatzes wie in Dorfkrieg) ist seit dem 30.10.2026 auf `main`. Der Zoom gilt für jedes Thema: nicht mehr 100 %, 150 % und 200 % mit Rollbalken, sondern + und − um etwa 12 % auf die Mitte, Mausrad und zwei Finger auf den Zeiger, Ziehen verschiebt, ⌖ zeigt das ganze Bild. Grenze 35 % bis 240 %.

**Lehren (Grafik):**

- Im Lernpfad keine Animationen, Wesen, Sound oder Wetter (`GRAFIK.md` §9). Die Lern-Oberfläche gehört dem Lernkern; nur Aufräumen nach §9 ist erlaubt.

- Das Bild der Bastion zeichnet PixiJS. Es wird nachgeladen und nicht vorab gespeichert (ARCHITEKTUR T-6). Tests für Rechnungen (Raster, Kamera) stehen neben dem Code (`iso.test.ts`, `kamera.test.ts`, `dorf.test.ts`); das Zeichnen selbst prüft der Browser-Test „Bauplatz als Bild“.
- Vor einer Änderung am Aussehen den Kontrast-Test der Fassungen laufen lassen (`src/ui/grafik/fassungen.test.ts`), Text 4,5 : 1, Bilder 3 : 1.
