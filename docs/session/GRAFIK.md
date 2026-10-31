# Strang Grafik – Session-Prompt

> Für Sitzungen, die an Grafik und Basebau arbeiten: Aussehen, Startseite, Bastion, Themen, Bauplatz.
> Vorher den gemeinsamen Teil lesen: `docs/SESSION-PROMPT.md`. Am Ende der Sitzung nur diese Datei, `docs/GRAFIK.md` und den Abschnitt §4a in `docs/PLAN.md` aktualisieren.

Stand: 31.10.2026 · G0–G11, P0–P3 Atlas; Abend-Fenster; Bewohner ausgebaut; Wetter-Cache dauerhaft; Bastion-Vollbild; Bastion spielbarer; Politur-Pass; nächster Schritt: P4 Hinterhof/MiniBastion, Messung iPhone 13

---

## Zuständigkeit

Siehe Tabelle im gemeinsamen Teil. Kurz: `src/ui/grafik/`, `src/ui/bastion/` (mit `grafik/` und `sound/`), `src/ui/start/`, `src/ui/grund.css`, `src/core/bastion/`, `src/core/ledger/`, `tools/sim/`, `public/` (Atlas, Sound). Dokumente: `GRAFIK.md`, `GRAFIK-SPRITES.md`, `BASEBAU.md`.

**Grenzen:** Der Basebau bleibt Nebensache (K-27). Design-Regeln R1–R7 (`VISION.md` §9) gelten für jedes Bild: keine Zufallsbelohnungen, keine Echtzeit-Timer, kein Verfall, „Bewegung reduzieren“ wird beachtet. Grafik ändert nie Daten (B-27): Lernstand und Bastion kennen keine Bilder.

---

## Aktueller Auftrag

**Erledigt:**

- **Umbau auf Richtung A** (`GRAFIK.md` §5, Schritte 1 bis 6): Tokens und Fassung „tag-warm“, Startseite mit Leiste, Üben, Bastion als Insel schräg von oben, „Mehr“, Korrekturen für das iPhone 13.
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

**Als Nächstes:**

1. **Sprites einhängen**, sobald Chargen geliefert sind (`GRAFIK-SPRITES.md` §8). ~~P0–P3~~ erledigt; ~~Abend-Fenster~~ erledigt; ~~Bewohner ausgebaut~~; als Nächstes **P4** Hinterhof + MiniBastion. Ohne Atlas bleibt der Code-Fallback.
2. **Auf dem iPhone 13 messen:** Ziel 60 Bilder je Sekunde, sonst „leicht“ (`GRAFIK.md` §4a). Hängt an den Referenzgeräten (0.10, Projektverantwortlicher).
3. **Die Testerinnen probieren die Grafik aus**, zusammen mit dem Test U4b des Lernkerns, damit sie nur einmal kommen (`TESTS.md` §2).

Weitere Schritte legt der Projektverantwortliche fest. Bei Engpass wartet die Grafik auf den Lernkern (K-27, B-28).

**Offen:** Die drei Referenzgeräte festlegen und darauf messen (0.10, Projektverantwortlicher).

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
