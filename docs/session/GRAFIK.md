# Strang Grafik – Session-Prompt

> Für Sitzungen, die an Grafik und Basebau arbeiten: Aussehen, Startseite, Bastion, Themen, Bauplatz.
> Vorher den gemeinsamen Teil lesen: `docs/SESSION-PROMPT.md`. Am Ende der Sitzung nur diese Datei, `docs/GRAFIK.md` und den Abschnitt §4a in `docs/PLAN.md` aktualisieren.

> **Fokus Paket G bis zur Abnahme (Entscheidung PV, 01.11.2026).** Dieser Strang arbeitet nur an Paket G in `docs/session/FOKUS.md`: Bauen und Ausbau einfacher, jede Stufe eines Gebäudes ein sichtbares Upgrade. Die Design-Wellen und der Backlog AA–ZZ (`DESIGN-IDEEN.md`) ruhen bis nach dem Test U4b. Die Lern-Oberfläche schließt der Lernkern mit Paket L ab und friert sie danach ein (`SESSION-PROMPT.md`, Regel 7); das Aufräumen nach `GRAFIK.md` §9 ruht ebenfalls. Funde aus L für die Startseite kommen unten unter „Wünsche aus dem anderen Strang“.
>
> **Gemeinsame Entscheidung aus dem Lernkern (PV, 02.11.2026):** KaTeX kommt als neue Abhängigkeit für Formeln ab Klasse 9 (ARCHITEKTUR T-22), nachgeladen mit den Inhalten, nicht in der App-Hülle. Ebenso neu: `html2canvas-pro` für „Als PDF speichern“ beim Aufgabenblatt (T-23), nachgeladen nur bei diesem Knopf. Für die Grafik ändert sich nichts. Außerdem darf der Lernkern für Klasse 9–12 neue Aufgabentypen in der Lern-Oberfläche bauen (`SESSION-PROMPT.md` Regel 7, Ausnahme); `src/ui/start/` bleibt unberührt.
>
> **G0 (Klärung PV, 02.11.2026, `FOKUS.md`):** Bilder nur aus dem eigenen Generator (a), für alles in der Bastion. **Vor U4b alle fünf Themen in Epoche 1**, nicht nur `bastion`; Epochen 2–4 danach. Gemeinsame Entscheidung: öffentliche Seite über Filter im Build (ARCHITEKTUR T-20).

Stand: 03.11.2026 · neuer Stil „weich gerendert“ und neue Leitern für alles (Punkt 1) · vorher 02.11.2026 (spät) · Auftrag für die nächste Sitzung unten vorbereitet · **Epochen 2–4 vorgezogen und für alle fünf Themen erneuert** (Stufen 4–9 im neuen Stil, eine Stufe ein Bild, `GRAFIK-SPRITES.md` §12.11, Branch `grafik/g3-epochen`) · Paket G: G2 abgenommen, G3 und G4 für Thema `bastion`, Epoche 1 umgesetzt; G3 für alle fünf Themen der Epoche 1 erledigt: Gebäude, Umgebung, Wesen aus dem eigenen Generator (`GRAFIK.md` §11.8, Klärung PV 02.11.2026). Offen: G6 (Blick von 2–3 Jugendlichen, PV).

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

**Zuletzt (02.11.2026 abends):** Epochen 2–4 für alle Themen (je 15 Bilder, `sprites-g3e-<thema>.py`). Ab Stufe 4 gilt Umriss 10 %, Höhe 8 %. Offen: PR von `grafik/g3-epochen` nach `main` (nur auf Wunsch des PV); Boden der Epochen 2–4 ist noch der alte P5-Boden.

**Sitzung 02.11.2026 abends (PV):** Epochen 2–4 für alle fünf Themen im neuen Stil (eine Stufe, ein Bild; ab Stufe 4 Umriss 10 %, Höhe 8 %), Boden/Himmel/Wetter/Hinterhof/Startbild/Bewohner neu, doppeltes Tempo (B-31), Umzug zur Mitte (B-32), Himmel wächst mit der Epoche, Kulisse Variante C für `bastion` (`GRAFIK.md` §13), Trampelpfade entfernt (Linien zwischen den Gebäuden), Rahmen/Kamera rechnen mit dem Bauplatz der Epoche.

### Auftrag für die nächste Grafik-Sitzung (vorbereitet 02.11.2026)

**Stand 03.11.2026:** Punkt 1 umgesetzt als neuer Stil „weich gerendert“ mit neuen, aufbauenden Stufenleitern für alle Gebäude aller Themen und allen übrigen Bildern (Branch `grafik/sprite-qualitaet`, `GRAFIK.md` §14, `GRAFIK-SPRITES.md` §13). Aus Punkt 4 erledigt: Absturz nach Themenwechsel (#206), Fuchs über der Burg und Fenster hinter dem Turm (#207); dazu Bauplan-Buch ohne Niveau (#208, Wunsch Lernkern). Offen: Punkte 2, 3, 4 (Dorf lädt langsam, Tipper in der ersten Sekunde), 5. Festlegung zum Umriss-Test ab Stufe 4 (sichtbar geändert statt +8 % Höhe) beim PV zur Kenntnis.

Startsatz: „Lies CLAUDE.md, `docs/SESSION-PROMPT.md` und `docs/session/GRAFIK.md`, Abschnitt ‚Auftrag für die nächste Grafik-Sitzung‘. Arbeite die Punkte der Reihe nach ab, je Punkt ein PR, Fotos aus der echten App vor dem Commit.“

1. **Sprites in höherer Qualität (Wunsch PV).** Alle Bilder des G3-Generators (`tools/grafik/g3_stil.py`, `sprites-g3-*.py`, `sprites-g3e-*.py`, Boden, Himmel, Hinterhof, Bewohner, Kulisse) in besserer Qualität:
   - intern vierfach zeichnen und weich verkleinern (wie schon die Wesen, `W_S = 4`), damit Kanten glatt sind;
   - feinere Materialien: Steinquader mit leichtem Tonwechsel je Stein (feste Zahlenfolge, kein Zufall), Holzmaserung, Ziegel- und Schieferreihen mit Schatten, Fensterrahmen und Sprossen, Türbeschläge;
   - weiche Eigenschatten (Dachüberstand auf der Wand, Turm auf Mauer) statt nur flacher Töne;
   - Maße, Fußpunkte und IDs bleiben, damit die App unverändert lädt; Umriss-Test (`atlas-stufen.test.ts`) bleibt grün;
   - Vorher/Nachher-Blatt je Thema an den PV, erst dann in die Breite. Dateigröße des Atlas im Blick (Budget-Test).
2. **Mehr Wetter (Wunsch PV).** Bisher: klar, bewölkt, Regen, Schnee, Nebel. Ergänzen, ruhig und ohne Blitzen (R1–R7, „Bewegung reduzieren“ beachten):
   - Regen: Tropfenringe auf dem Meer der Kulisse, nasse, dunklere Dächer, Pfützen-Glanz auf dem Boden;
   - Schnee: liegender Schnee auf Boden und Kulisse (Hügel weiß), Eisschollen am Ufer;
   - Wind/Sturm: höhere Wellen, wehende Fahnen und Banner (Frames), ziehende Wolkenschatten über Insel und Meer;
   - Nebel: Bänke über dem Meer, Horizont verschwindet;
   - nach Regen manchmal ein Regenbogen (aus dem Datum bestimmt, kein Zufall zur Laufzeit);
   - alles auch aus echtem Wetter (Open-Meteo nur nach Einschalten, T-15) und im Zahnrad zum Ausprobieren.
3. **Kulisse für die anderen Themen** (Variante C wie `bastion`): Dorf (Felder, Hecken, Bach, ferne Dächer), Garten (Wiese, Teich, Hecken), Unterwasser (Riff in Schichten, Lichtstrahlen, Tiefe), Weltraum (Krater, Planet am Horizont, Sterne). Eigene `dinge` je Thema.
4. **Fehlerbehebungen:** Dorf-Szene lädt langsam, die Kamera sitzt in den ersten Sekunden falsch; ein Tipper in der ersten Sekunde geht verloren (#160).
5. **Simulator für Epoche 2–4** (`tools/sim/`): echte Zahlen statt Überschlag (BASEBAU §8b).

**Als Nächstes (vorher):** **G6** durch den PV (Seite zum Zeigen: https://claude.ai/artifact/JsQNiwe5nzjtRBJGgJ6k4K), danach „G abgenommen“ in `FOKUS.md`. Bis U4b nur Fehlerbehebungen. Auftrag für die nächste Grafik-Sitzung: `FOKUS.md` „Nächste Sitzungen“.

**Ruht bis nach U4b** (bisher „Als Nächstes“, nur zur Erinnerung): Design-Wellen A–Z und Backlog AA–ZZ (`DESIGN-IDEEN.md`), Themen-Welten (H29), Jahreszeit-Auflagen und Ambient Wasser/Regen. Weiter offen: Messung auf dem iPhone 13 (`GRAFIK.md` §4.5, hängt an 0.10) und die Testerinnen zusammen mit U4b, erst nach Abnahme von G.

**Offen (PV):** Die drei Referenzgeräte festlegen und darauf messen (0.10).

---

## Wünsche aus dem anderen Strang

Hier trägt der andere Strang ein, was er in diesem Bereich braucht (gemeinsamer Teil, Regel 1). Erledigtes durchstreichen und mit Datum versehen.

- ~~**Aus dem Lernkern (02.11.2026, LEHRPLAN L-22):** Lernende sehen keine Niveaus mehr. Im Bauplan-Buch der Bastion steht noch „(grundlegend, seit …)“ bzw. „(mittel, seit …)“ (`src/ui/bastion/Bastion.svelte`, Zeile mit `buch.niveau`). Bitte das Niveau dort weglassen, nur „seit …“ zeigen; der Browser-Test „Studierstube“ (`grundlegend,\s+seit`) muss dann mit.~~ – erledigt 03.11.2026 (Branch `grafik/bauplanbuch-ohne-niveau`).
- ~~Startseite aus Paket L (L16, L17)~~ – erledigt 01.11.2026 vom Lernkern auf Wunsch des PV: „Über mich“ unter den Türen, kein Schild im Bastion-Bild, Bild schwebt ohne freie Kante (`MiniBastion.svelte`), Gruß nach dem ersten Üben ohne „Willkommen“.

---

## Protokoll

Steht in `docs/session/GRAFIK-PROTOKOLL.md`. Neue Zeilen dort unten anhängen, nicht hier.

---

## Übergabe bisheriger Sitzungen

- **29.10.2026:** Startseite auf dem iPhone 13 korrigiert (`viewport-fit=cover`, `--leiste-hoehe`), Glühbirne für die Fehlerwerkstatt.
- **30.10.2026:** **PR #83** (Dorf-Grafik) ist auf `main`. Das Thema Dorf unter „Wie soll es aussehen?“ zeigt die Dorfbilder aus Dorfkrieg (Wiese, Häuser, Zaun, Bäume, `GRAFIK.md` §6). Die anderen Themen bleiben die Insel. Kampffiguren gibt es nicht. **PR #85** (Zoom des Bauplatzes wie in Dorfkrieg) ist seit dem 30.10.2026 auf `main`. Der Zoom gilt für jedes Thema: nicht mehr 100 %, 150 % und 200 % mit Rollbalken, sondern + und − um etwa 12 % auf die Mitte, Mausrad und zwei Finger auf den Zeiger, Ziehen verschiebt, ⌖ zeigt das ganze Bild. Grenze 35 % bis 240 %.

- **01.11.2026 (G5 Teil 2):** Neubau mit Platz-Vorschlag und „Hier bauen“ (`GRAFIK.md` §11.7). Offen beim PV: Kern-Vorschlag „Planen und Bauen zusammenlegen“ (Empfehlung: nein, G4 statt dessen) und schönerer Platz über `ablage.ts`.

**Lehren (Grafik):**

- Im Lernpfad keine Animationen, Wesen, Sound oder Wetter (`GRAFIK.md` §9). Die Lern-Oberfläche gehört dem Lernkern; nur Aufräumen nach §9 ist erlaubt. *Seit 01.11.2026 ruht auch das, solange die Lern-Oberfläche eingefroren ist.*

- Das Bild der Bastion zeichnet PixiJS. Es wird nachgeladen und nicht vorab gespeichert (ARCHITEKTUR T-6). Tests für Rechnungen (Raster, Kamera) stehen neben dem Code (`iso.test.ts`, `kamera.test.ts`, `dorf.test.ts`); das Zeichnen selbst prüft der Browser-Test „Bauplatz als Bild“.
- Vor einer Änderung am Aussehen den Kontrast-Test der Fassungen laufen lassen (`src/ui/grafik/fassungen.test.ts`), Text 4,5 : 1, Bilder 3 : 1.
