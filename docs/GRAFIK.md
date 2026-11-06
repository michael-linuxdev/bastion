# Grafik

Status: Entschieden 29.10.2026 (K-22, B-27, T-15) · Umbau auf Richtung A umgesetzt 29.10.2026 (§5) · Lebendige Szenen B-28: G0–G11 + Atlas P0–P6 + CC0-Sound umgesetzt 31.10.2026 (§4, §6–§10); optional Feinschliff

Wie Bastion aussieht und wie die Grafik gebaut wird. Die Richtung kommt aus sechs Entwürfen (je zwei für Bastion, Startseite und Üben). Gewählt hat der Projektverantwortliche **Richtung A „Tag, warm“** für alle drei Bereiche.

## 1. Richtung A – „Tag, warm“

**Gesamteindruck:** hell, freundlich, rund, nicht kindlich. Für Jugendliche von 12 bis 16 und für Erwachsene.

**Farben (hell):**

| Rolle | Wert |
|---|---|
| Hintergrund | `#F6F1E7` (warmes Hellbeige) |
| Fläche (Karten) | `#FFFFFF` |
| Text | `#2B2620` |
| Text leise | `#5E564B` |
| Akzent (Knöpfe, Fortschritt) | `#1F7A72` (Petrol) |
| Akzent warm (Dächer, Fehlerwerkstatt) | `#C4603A` / `#E07A4F` |
| Himmel hinter der Bastion | `#D6ECF3` |
| Hinweis (z. B. Klassenarbeit) | Fläche `#FFF4D9`, Rand `#C49A3C` |

Farben nur als Tokens (CSS-Variablen), nie direkt in Komponenten. Kontrast mindestens 4,5 : 1 für Text.

**Schrift:** Nunito (rund, gut lesbar; SIL Open Font License). Sie wird **mit der App ausgeliefert**, nicht von Google Fonts geladen (keine fremden Server). Ersatz: `system-ui`.

**Formen:** große Radien (Karten 20–24 px, Knöpfe 14–16 px), Flächen statt Rahmen, Touch-Ziele mindestens 44 px.

**Bausteine aus den Entwürfen:**

- **Bastion:** Insel schräg von oben (isometrisch), flache Farbflächen mit zwei Seitentönen je Gebäude, Himmel mit Sonne und Wolken.
  - Baustoffe stehen als vier Kärtchen mit kleinem Symbol darüber.
  - Darunter die Karte „Als Nächstes“ mit **Fortschrittsbalken** (aus Richtung B übernommen) und „noch 2 Stein“.
- **Startseite:**
  - Datum und Begrüßung oben, darunter eine kleine Ansicht der Bastion als Karte.
  - Großer Knopf „Üben“ mit „Gerade dran“.
  - Vier Kacheln: Wiederholen, Fehlerwerkstatt, Wo stehe ich?, Mein Stand.
  - Hinweis auf die Klassenarbeit, nur mit Datum.
- **Üben:**
  - Thema und Niveau oben, dazu Punkte für den Fortschritt der Runde (keine Zeit).
  - Die Aufgabe steht groß auf einer Karte, mit Bild (zum Beispiel einem Bruchstreifen).
  - Eingabefelder passend zur Lösungsart (Zähler und Nenner getrennt).
  - Knöpfe „Prüfen“, „Tipp“ und „Lösungsweg“, darunter „Fertig für heute“.
- **Navigation (31.10.2026):** Keine untere Reiterleiste mehr. Startseite ist der Hub: Marke, lebendige Bastion-Vorschau, drei Türen (Üben, Bastion, Mehr), Nebenkacheln. Bastion hat ein Home-Piktogramm zur Startseite.
- **Startseite passt auf einen Bildschirm**, auch auf dem iPhone 13 in Safari (390 × 664 Punkte sichtbar). Was nicht täglich gebraucht wird, steht unter „Mehr“: Themen wählen, Mein Stand, Klassenarbeit, Über mich, Sicherung, Für Eltern, dazu der Name „Bastion“, das Versprechen „Keine Werbung …“ und der Hinweis „funktioniert ohne Internet“.
- **Üben (31.10.2026):** Ein Klick (Leiste oder Start) springt zur nächsten bzw. offenen Aufgabe – nicht in die Themenübersicht. Klasse, Niveau und Themenwahl liegen unter „Mehr“ → „Themen wählen“.
- **Bastion (31.10.2026):** Die Seite zeigt den Bauplatz vollflächig (keine Karten-Kante). Auf dem Reiter: kompakter Vorrat, Bauen/Planen-Blatt, Versetzen per Ziehen, Wesen um Gebäude herum, ruhige Bewohner (an Fortschritt gekoppelt). Zahnrad oben rechts: Bewährung, Thema, Wetter, Hinterhof-Liste, Orientierung, Darstellung (Bild aus, ruhig, leicht, Sound-Stufen aus/UI/Bastion+UI, Ganzes Bild), Bedienhilfe und die barrierefreie Liste. Zoom nur per Geste; −/+ / Fadenkreuz gibt es auf dem Reiter nicht. „Zum Hinterhof“ ist ein Piktogramm. In der laufenden Übung gibt es ein kleines Zahnrad nur für die Orientierung. Kräftiger Text und Sound-Stufen auch unter Über mich (Design V–Z).
- **Hub / Vertrauen (31.10.2026, Design V–Z):** „Kein Konto. Kein Tracking.“ dauerhaft auf Start und Mehr; bei noch nie geübt nur Üben + kurzer Satz; Landscape-Türen mit großen Tap-Zielen.
- **Bildschirm drehen (31.10.2026):** Einstellung `darstellung.orientierung` (`auto` / `hoch` / `quer`), wählbar in Bastion-Einstellungen, unter „Über mich“ und im Übungs-Zahnrad. Screen-Orientation-API wenn verfügbar; sonst Hinweis zum Drehen des Geräts (kein Layout-Bruch durch CSS-Drehung).
- **Bau-Blatt (31.10.2026):** Mini-Szene-Vorschau, Kostenstapel, Planen (Skizze) vs. Bauen (Stein setzen), Farbe am Banner, gesperrte Gebäude als Silhouette „Noch nicht“.
- **Test-Rohstoffe (31.10.2026):** Eltern-Schalter `bastion.test-rohstoffe` – virtueller Vorrat und Probe-Bastion nur im Speicher; Ledger und Lernfortschritt unberührt. Banner „Probe-Ansicht“ auf der Bastion.
- **Design-Bündel (31.10.2026):** Hub-Türen/Ortsnamen, HUD als Beutel mit Material-Icons, Bauen-Werkzeug am Szenenrand, leere Bastion mit Einladung, Eltern-Werkstatt-Optik, Display-/Text-Schriftrollen (Nunito), 2–3 bewusste Bewegungen (Wolken, Einblenden).
- **Design „Danach“ (31.10.2026):** Themen-Landkarte in Mein Stand / Gerade-dran; stiller Abschluss-Übergang (Stein/Beutel → Bastion); Fehlerwerkstatt als Damals/Heute-Paar; Bewohner-Statusgesten über dem Kopf; Geste-Sprache Tippen=wählen / Ziehen=bewegen; Onboarding erste Minute (ein Satz + Üben); Eltern-Werkstatt vs. Kind-Ort als zwei visuelle Register.


## 2. Hell, dunkel, System

- Drei Einstellungen: **System** (Standard), **Hell** (Tag), **Dunkel** (Abend). Gespeichert als Einstellung, wählbar unter „Über mich“ als „Abend in der Bastion“.
- **Lernflächen bleiben hell** (Design L61): CSS-Tokens an `<html>` sind immer die Hell-Fassung. Die Wahl steuert nur die Bastion-Szene (`szeneAbend`).
- **Dunkel = Abendstimmung von Richtung A** in der Bastion: gleiche Formen und Schrift in der Szene.
  - Die Bastion steht unter Abendhimmel mit erleuchteten Fenstern.
  - Die Farben aus Richtung B sind dafür ein Anhaltspunkt: Himmel `#1A2342`, Licht `#FFC85A`.
- Beide Fassungen (Hell-Tokens und Szene-Abend) erfüllen den Kontrast von 4,5 : 1.

## 3. Austauschbar bleiben (B-27)

Anpassungen und auch ein vollständiger Austausch der Grafik müssen jederzeit möglich sein. Deshalb:

- **Eine Grafikschicht:** Alles Aussehen hängt an Tokens (Farben, Schrift, Radien, Abstände) und an einem Katalog für Gebäude und Szenen (B-12). Komponenten fragen nach Rollen („Akzent“, „Kern Stufe 2“), nie nach festen Farben oder Bildern.
- **Mehrere Fassungen nebeneinander:** Eine neue Grafik kommt als weitere Fassung dazu und lässt sich umschalten. Die alte bleibt, bis die neue sie ersetzt.
- **Keine Daten im Bild:** Der Lernstand und die Bastion (Gebäude, Stufen, Plätze) kennen keine Grafik. Ein Austausch verändert keine Daten und braucht keine Migration.
- **Barrierearm in jeder Fassung:** Beschreibung für Screenreader, Ausblenden der Grafik (2.13) und reduzierte Bewegung bleiben Pflicht.

## 4. Lebendige Szenen (beschlossen 31.10.2026)

Nebenstrang parallel zum Lernkern (K-27 bleibt: Lernen hat Vorrang). Mehrere kleine PRs (§10). Sprite-Atlas und Übergabe: `GRAFIK-SPRITES.md`.

### 4.1 Stil

- **Politur:** klar über dem bisherigen Code-/Dorfkrieg-Platzhalter. Lesbarkeit und knackige isometrische Gebäude wie in Clash of Clans – **ohne** Militär, Truppen, Clash-Erkennung (VISION: kein CoC-Klon; B-15/B-16). Wärme und ruhiges Leben mindestens auf Stardew-Niveau.
- **Primärquelle Bild:** Sprites/Atlanten (B-28). Code-Zeichnung bleibt Fallback, bis das Atlas da ist.
- **Dorfkrieg-Dorfbilder** werden ersetzt, nicht behalten.
- **Lernumfeld** (Üben, Vermittlung, Fehlerwerkstatt, Diagnose): darf **nicht** ablenken – Aufräumen von Abständen und Hierarchie erlaubt, keine Bewegung, kein Wetter; optional sehr leiser UI-Cue nur beim Prüfen-Ergebnis (Stufe UI/Bastion, Standard aus).
- **Bastion / Hinterhof:** lebendig (Atmosphäre, Wesen, optional Sound).

### 4.2 Schichten

| Schicht | Inhalt | Bewegt? |
|---|---|---|
| Atmosphäre | Himmel, Sonne/Mond, Wolken, Jahreszeit-Palette, Wetter-Partikel | ja, außer „ruhig“ |
| Boden / Szene | Insel, Wiese, Plattform, Sand … je Thema und Epoche | nein (Standbild) |
| Gebäude | Atlas je Thema × Rolle × Epoche × Stufe | Aufstell-Effekt kurz |
| Wesen | 2–4 Arten je Thema; Anzahl steigt mit gebauten Gebäuden | ja; bei „ruhig“ **aus** |
| Hinterhof | dieselbe Bühne, Kamera schwenkt „hinter“ den Bauplatz; Plätze = Objekte (Buch/Blume/Stern/…); Denkmal/Wappen für volle Felder | wie Atmosphäre |

### 4.3 Jahreszeit, Tag, Wetter

- **Jahreszeit** nur aus dem lokalen Datum (Frühling/Sommer/Herbst/Winter); ändert Farben und wenige Auflagen (Schnee auf Dächern, Laub). Kein manueller Override in v1.
- **Abend:** nach Sonnenuntergang. Mit eingetragenem Ort und Wetter an: Sonnenzeiten von Open-Meteo. Ohne Ort: grobe Mitteleuropa-Näherung aus dem Datum. Unabhängig davon bleiben Hell/Dunkel/System unter „Über mich“ wählbar (manuell Hell erzwingt Tagoptik der UI-Tokens; die Bastion-Szene folgt der Sonnenregel, sobald Wetter/Ort greifen – Feinheit in der Umsetzung: bei manuell „Hell“ Tag, bei „Dunkel“ Abend, bei „System“ Sonnenstand).
- **Wetter offline:** aus Datum abgeleitet (nur Bild).
- **Wetter echt (T-15):** Freitext Stadt → Geocoding einmalig → Lat/Lon lokal; Forecast **dauerhaft** cachen, bis Ort oder Schalter geändert wird (Preference PV 31.10.2026); nur Eltern schalten ein (ab 18 selbst, L-15); bei Fehler **still** letzter Cache oder Datumswetter. Ändert nur das Bild.
- WMO grob auf: klar, bewölkt, Nebel, Regen, Schnee.

### 4.4 Wesen

| Thema | Arten |
|---|---|
| Dorf | Huhn, Katze, Spatz |
| Garten | Biene, Schnecke, Schmetterling |
| Bastion | Möwe, Fuchs am Rand, stilisierte Schildwache ohne Waffe |
| Unterwasser | Fischschwarm, Qualle, Krebs |
| Weltraum | Drohnen-Glühwürmchen, kleines Wartungsroboter-Silhouette |

- Tippen → kurze Reaktion (aufschauen, weghüpfen), kein Dialog.
- Erwachsene: dieselben Wesen (vorerst).
- Max. **5** Wesen bei voller Darstellung (iPhone 13).
- **Pfadfindung (31.10.2026):** Bodenwesen (Huhn, Katze, Schnecke, Fuchs, Wache, Krebs, Roboter) laufen auf freien Feldern um Gebäude herum (Breitensuche). Fliegende/schwimmende Arten dürfen Gebäude überqueren. Deterministisch, ohne Zufall.
- **Bewohner (31.10.2026, ausgebaut):** Ruhige Figuren (Gartenzwerg, Gärtnerin, Bücherwurm, Torhüter, Handwerkerin, Imkerin) mit kleinen Tätigkeiten (gießen, kehren, lesen, gärtnern, pflanzen, ordnen, flicken, wachen, sammeln, schauen, ruhen). Freischaltung nur über Bau-/Lernfortschritt (Gebäudezahl, fertige Vorhaben, Bücher, Turm/Tor/Werkstatt/Wissen/Fläche/Denkmal, Epoche). Antippen zeigt Name und Tätigkeit; kurze Erklärung im Zahnrad. Keine Belohnung, kein Verfall, kein Timer-Druck. Bei „ruhig“ aus; bei „leicht“ höchstens 2.
- **Bewohner als Bilder (G3, 02.11.2026):** Alle sechs kommen aus dem eigenen Generator (`tools/grafik/sprites-g3-bewohner.py`, Stil-Regel `GRAFIK-SPRITES.md` §12), für alle Themen gleich. Je Bewohner 9 Bilder zu 64 × 64: `idle` 3 (ruhen, lesen, schauen, wachen), `arbeit` 4 (gießen, kehren, gärtnern, pflanzen, ordnen, flicken, sammeln, mit dem Werkzeug der Rolle: Gießkanne, Spaten, Buch, Wimpelstab, Hammer, Wabenkorb) und `react` 2 (winkt nach dem Antippen). IDs `bewohner/<art>_<zyklus>_<i>`; die Auswahl trifft `bewohnerFrame` in `bewohner.ts`. Die Statusgeste über dem Kopf zeichnet weiter der Code. Fehlt ein Bild, zeichnet der Code die alte Figur (Rückfall). Der Torhüter trägt keine Waffe.

### 4.5 Schalter und Leistung

1. Basebau aus → kein Bild (R7).  
2. „Bild aus – nur die Liste“ → wie heute.  
3. **„Bastion ruhig“** → keine Loops, keine Wesen, Jahreszeit/Wetter als Standbild.  
4. **„Darstellung leicht“** → weniger Partikel, höchstens 3 Wesen, Bewegung bleibt.  
5. `prefers-reduced-motion` → wie „ruhig“.  

Ziel: **60 fps** auf dem iPhone 13; wenn knapp, **30 fps** anpeilen (automatisch drosseln), nicht hängen.

### 4.6 Sound (optional)

- Standard **aus**. Jugendliche schalten selbst ein.
- **Drei Stufen:** aus / nur UI (sehr leiser Cue beim Prüfen-Ergebnis) / Bastion+UI (Ambient + Bau-Tipps). Ambient nur in der Bastion, nie im Aufgaben-Fokus.
- Ambient (Wind) und kurze Tip-Geräusche (bauen, Wesen) nur bei Stufe Bastion+UI.
- Dateien **frei lizenziert (CC0 o. Ä.)**, mit der App ausgeliefert, offline (T-18). Kein CDN.

### 4.7 MiniBastion (Startseite)

Standbild der **aktuellen** Atmosphäre (Jahreszeit, Wetter, Abend), **ohne** Bewegung.

### 4.8 Grenzen (R-Regeln)

- Wetter, Jahreszeit, Wesen und Sound ändern nie Baustoffe, Fortschritt oder Belohnungen.
- Kein Verfall, kein „komm zurück wegen Regen“ (R2, R3).
- Keine Zufallsbelohnungen (R1).

## 4a. Widersprüche – Auflösung (31.10.2026)

| Konflikt | Auflösung |
|---|---|
| K-18 / PLAN: Epochen 2–4 und Belagerungen außen vor | **Aufgehoben** für diesen Nebenstrang (B-28): spezifizieren und einbauen, siehe `BASEBAU.md` §5.5–§5.7 |
| K-27 Basebau Nebensache | Bleibt: Lernkern und U4b haben Vorrang; Grafik läuft **parallel** in kleinen PRs |
| VISION „kein CoC-Klon“ vs. Stilreferenz | Nur Politur und isometrische Lesbarkeit; Inhalt ruhig, keine Truppen |
| B-12 schlichter Code-Stil | Primär Sprites; Code-Fallback bis Atlas fertig; austauschbar (B-27) |
| 60 fps vs. iPhone 13 | Ziel 60; Fallback 30 + Schalter „leicht“ / „ruhig“ |
| Abend manuell vs. Sonne | Tokens Hell/Dunkel bleiben; Szene nutzt Sonne, wenn System/Automatik greift (§4.3) |)

## 5. Umbau auf Richtung A

Vier Schritte, jeder ein eigener PR:

1. ✅ **Grundlage:**
   - Tokens als Fassung „tag-warm“ in `src/ui/grafik/fassungen.ts`, hell und dunkel. Ein Test prüft, dass jede Rolle gefüllt ist und der Kontrast reicht (Text 4,5 : 1, Bilder 3 : 1).
   - `src/ui/grafik/darstellung.svelte.ts` schreibt die **Hell-Tokens** an `<html>` (Lernflächen); `darstellung.dunkel` steuert weiter die Bastion-Szene. Wahl unter „Über mich“: Abend in der Bastion (System/Tag/Abend). Einstellung `darstellung.modus`.
   - Schrift Nunito mitgeliefert (T-16). Knöpfe `haupt`, `zweit`, `dezent` und Eingabefelder einheitlich in `grund.css`.
2. ✅ **Start-Hub ohne Reiter** (`src/ui/start/`):
   - Datum und Begrüßung, kleine Ansicht der Bastion (`src/ui/grafik/MiniBastion.svelte`, nur Bild), großer Knopf „Üben“ mit „Gerade dran“.
   - Kacheln: Wiederholen, Fehlerwerkstatt, Wo stehe ich?, Mein Stand, Mehr. Ist nichts fällig oder kein Fehler offen, bleibt die Kachel sichtbar, ist aber nicht wählbar.
   - Hinweis auf die Klassenarbeit nur mit Datum.
   - Keine untere Reiterleiste mehr (31.10.2026). Symbole in `src/ui/grafik/Symbol.svelte`.
3. ✅ **Üben** (`src/ui/ueben/Uebung.svelte`):
   - Kopf mit Thema, Niveau als Schild und Punkten für den Fortschritt der Runde. Die Punkte zeigen nur die Menge, keine Zeit und kein richtig oder falsch (R1, R2).
   - Beim Wiederholen und in der Fehlerwerkstatt umfassen die Punkte die ganze Runde. Beim Üben zeigen sie Blöcke zu fünf Aufgaben. Nach jedem Block erscheint „Eine gute Stelle für eine Pause“ (R5).
   - Die Aufgabe steht groß auf einer Karte. Die Knöpfe heißen „Prüfen“ und „Tipp“. Der Lösungsweg kommt wie bisher nach dem Prüfen, damit er nicht vorher verrät, was zu tun ist.
   - Die Rückmeldung erscheint als Fläche: grün bei richtig, warm bei falsch, nie rot (Fehler als Rohstoff).
   - Die Themenliste zeigt die Themen als Karten.
4. ✅ **Bastion als Insel schräg von oben** (`src/ui/bastion/grafik/`):
   - `iso.ts` rechnet zwischen Feldern und Bildpunkten um (Rauten 2 : 1). Ein Test prüft, dass die Mitte jedes Feldes zu genau diesem Feld zurückführt.
   - `grafik-buehne.ts` zeichnet den Himmel mit Sonne und Wolken, die Insel mit zwei Seitentönen und jedes Gebäude als Körper mit Dach. Am Abend (dunkel) stehen Mond und Sterne am Himmel, und die Fenster leuchten. Sterne und Wolken stehen an festen Plätzen, ohne Zufall.
   - Antippen trifft auch das Dach eines Gebäudes, nicht nur den Boden darunter.
   - Die Seite zeigt das Bild zuerst. Darunter stehen die Baustoffe als vier Karten mit Symbol. Die Symbole zeigen, woher ein Baustoff kommt: Üben, Wiederholen, Können und Bauschritte.
   - Ein vorgemerktes Ziel erscheint als Karte mit Fortschrittsbalken und „Dafür fehlt noch …“. Die Themenwahl steht am Ende der Seite.

5. ✅ **„Mehr“ vom Start-Hub** (`src/ui/start/Mehr.svelte`). Themen, Stand, Sicherung, Eltern. Der Name „Bastion“ steht für Screenreader weiter als Überschrift.
6. ✅ **Korrekturen nach dem ersten Blick auf dem iPhone 13** (29.10.2026):
   - Die App nutzt den ganzen Bildschirm (`viewport-fit=cover`).
   - Oben ist mehr Abstand. Das Datum lag vorher am Rand unter der Statusleiste, wo iOS Inhalte unscharf zeichnet.
   - Die Startseite füllt den Bildschirm. Den freien Platz bekommt das Bild der Bastion (höchstens 20rem), ohne Basebau die Kacheln.
   - Die Fehlerwerkstatt hat als Symbol eine Glühbirne statt eines Schraubenschlüssels: Aus Fehlern wird ein Aha (R6).

Der Umbau auf Richtung A ist damit fertig. Als Nächstes sollen die drei Testerinnen ihn ausprobieren (`TESTS.md` §2).

## 6. Thema Dorf – Atlas P0 (ersetzt Dorfkrieg-Platzhalter)

Unter „Wie soll es aussehen?“ gibt es das Thema **Dorf** (B-17). Seit dem 30.10.2026 lagen dort Code-Platzhalter aus [Dorfkrieg](https://github.com/michael-linuxdev/dorfkrieg) (`dorf.ts`). Zoom wie in Dorfkrieg (`kamera.ts`).

**Sprite-Charge P0 (31.10.2026):** Gebäude Epoche 1, Boden-Kacheln und Wesen (Huhn, Katze, Spatz) liegen unter `public/grafik/atlas/` mit `manifest.json`. Die Bastion-Szene lädt die Texturen und zeichnet Dorf-Gebäude/Wesen aus dem Atlas; fehlt ein Eintrag, bleibt der Code-Fallback. Generator: `tools/grafik/sprites-p0-dorf.py` (offline, deterministisch).

**Abend-Fenster / Dorf-Politur (31.10.2026):** Gebäude mit Fenstern (Kern, Werkstatt, Wissen, Turm; Garten: Kern, Werkstatt, Wissen) liefern deckungsgleiche `*_fenster.png`-Layer. Am Abend legt die Bühne den Layer über das Tages-Sprite (warme Fenster). Tages-Sprites mit Rahmen, Sims und klarerer Silhouette (Richtung A „Tag, warm“).

**Boden/Wiese aus dem Atlas (31.10.2026):** Beim Thema Dorf kommt die Wiese aus den Boden-Kacheln (`boden/dorf/e1/flaeche`, `rand`, optional Schachbrett/`flaeche_hell`). Die Code-Zeichnung `dorfWiese` bleibt Fallback, wenn Kacheln fehlen. Stil bleibt Richtung A „Tag, warm“; am Abend verdunkeln die Kacheln per Tint.

**Wetter-Himmel P1 (31.10.2026):** Sonne, Mond, Wolken, Regen/Schnee/Nebel und Schnee-Dach/Laub liegen unter `public/grafik/atlas/` (`himmel/`, `wetter/`, `auflage/`). Die Bühne lädt den Atlas für alle Themen und nutzt die Sprites für Gestirn, Wolken und Partikel; fehlt etwas, bleibt der Code-Fallback. Generator: `tools/grafik/sprites-p1-wetter.py`.

**Sprite-Charge P2 Garten (31.10.2026):** Gebäude Epoche 1 (Baumhaus, Schuppen, Gewächshaus, Aussichtsbaum, Tor, Hecke, Bank, Wimpel, Blumenbeet, Zwerg), Rasen-Kacheln und Wesen (Biene, Schnecke, Schmetterling) unter `public/grafik/atlas/`. Die Bastion-Szene zeichnet Garten aus dem Atlas; fehlt ein Eintrag, bleibt der Code-Fallback (`garten.ts`). Generator: `tools/grafik/sprites-p2-garten.py`.

**Sprite-Charge P3 Bastion/Unterwasser/Weltraum (31.10.2026):** Epoche 1 je Thema (Gebäude nach Rollen-Tabelle, Boden-Kacheln, Wesen, Abend-Fenster wo Öffnungen), Generator `tools/grafik/sprites-p3-themen.py`. Die Bühne lädt Atlas für Bildart Insel (`bastion`), Unterwasser und Weltraum; Code-Fallback bleibt (`zeichneRolle`, `unterwasser.ts`, `weltraum.ts`). Kampffiguren gibt es weiterhin nicht; Wesen sind friedliche Bewohner (§4.4).

**Sprite-Charge P4 Hinterhof + MiniBastion (31.10.2026):** Plätze/Wappen/Denkmal je Thema und Standbilder; Generator `tools/grafik/sprites-p4-hinterhof.py` (`GRAFIK-SPRITES.md` §7/§8).

**Sprite-Charge P5 Epoche 2–4 (31.10.2026):** Gebäude aller Themen für Epochen 2–4 nach Katalog G9 (reifere Optik, neue Stufen, Abend-Fenster, Boden-Kacheln), Generator `tools/grafik/sprites-p5-epochen.py`. Runtime: Atlas-Lookup mit Fallback auf niedrigere Epoche; fehlt alles, Code-Fallback (`epoche-optik.ts`).

**Sprite-Charge P6 Belagerungs-Himmel / Rauch (31.10.2026):** Spannungs-Dunst und drei Rauch-Overlays unter `public/grafik/atlas/belagerung/`; Generator `tools/grafik/sprites-p6-belagerung.py`. Die Bühne nutzt sie bei Bewährungsprobe (`spannung`), sonst Code-Fallback (G11). Keine Truppen. Verbindliche Atlas-Chargen **P0–P6** und optionale **CC0-Sounddateien** (G8, `public/sound/`) sind geliefert. Optional/offen: Feinschliff Jahreszeit-Auflagen, Ambient Wasser/Regen, Lern-UI §9, Messung iPhone 13, Testerinnen mit U4b.

## 7. Hinterhof in der Szene (B-25)

- Dieselbe Pixi-Bühne; Kamera schwenkt hinter den Bauplatz (nicht nur Liste).
- Jedes Lernfeld = Reihe von Plätzen; Füllung als kleines Objekt je Thema (Buch, Blume, Stern, Buch, Perle).
- G und M unterscheidbar (z. B. Bronze/Silber-Ton).
- Volle Felder: Denkmal oder Wappen in dieser Welle schon sichtbar.
- Liste bleibt parallel (reizarm). Privat, verschwindet mit Basebau-Schalter.

## 8. Epochen und Belagerung in der Grafik

Mechanik und Kosten: `BASEBAU.md` §5.5–§5.7 (B-28). Grafik:

- Je Epoche eigener visueller Stil im Atlas (Außenposten → Burg → Festung → Zitadelle; Namen je Thema).
- Belagerung / Bewährungsprobe: Optik (Himmel, Rauch, Spannung) **und** Mechanik (Prüfungssimulation); keine Truppen auf dem Bauplatz.

## 9. Lern-UI aufräumen

Tokens und Richtung A bleiben. Erlaubt: Abstände, Hierarchie, Ruhe. Verboten im Lernpfad: Animationen, Partikel, Wesen, Sound, Wetter-Effekte.

**Üben Ein-/Ausgabe (31.10.2026):** Arbeitsblatt mit zwei Phasen (Eingabe / Rückmeldung), ruhiges Urteil + Ursache, Antwortspiegel mit Ergebnisrahmen, Tipps als Randnotiz, Fortschritt als Steine, Schrittweg als Checkliste, Tastatur an die Eingabefläche gebunden, Querformat Prompt|Eingabe. Keine KI, kein Timer, keine Zufallsbelohnung.

## 10. PR-Reihenfolge (Nebenstrang)

| PR | Inhalt |
|---|---|
| **G0** | Dieses Dokument, `GRAFIK-SPRITES.md`, BASEBAU §5.5–§5.7, Entscheidungslogs |
| **G1** | Atmosphäre-Gerüst, Ticker, „ruhig“, „leicht“, reduced-motion, Aufstell-Effekt · *umgesetzt* |
| **G2** | Jahreszeit aus Datum + Abend nach Sonnenuntergang · *umgesetzt* |
| **G3** | Open-Meteo (Eltern, Ort, dauerhafter Cache, stiller Fallback) · *umgesetzt* |
| **G4** | Lebewesen (Dorf zuerst) + Tippen + Anzahl~Gebäude · *umgesetzt* |
| **G5** | Atlas-Anbindung + Thema Garten (neues Niveau) · *umgesetzt* |
| **P0** | Sprite-Charge Dorf Epoche 1 (Gebäude, Boden, Wesen) · *umgesetzt* – siehe `GRAFIK-SPRITES.md` §8 |
| **P1** | Wetter-Himmel · *umgesetzt* |
| **P2** | Sprite-Charge Garten Epoche 1 (Gebäude, Boden, Wesen) · *umgesetzt* |
| **P3** | Sprite-Charge Bastion/Unterwasser/Weltraum Epoche 1 · *umgesetzt* |
| **P4** | Hinterhof + MiniBastion · *umgesetzt* |
| **P5** | Epoche 2–4 Gebäude je Thema (Atlas) · *umgesetzt* |
| **G6** | Unterwasser, Weltraum, Bastion-Wesen · *umgesetzt* (Code-Szenen; P3-Sprites eingehängt) |
| **G7** | Hinterhof als Szene + Denkmal/Wappen · *umgesetzt* |
| **G8** | Sound optional (CC0, Standard aus) · *umgesetzt* (CC0-Dateien in `public/sound/` + prozeduraler Fallback) |
| **G9** | Katalog Epoche 2–4 (Kosten, Bauplatz, Wechsel) · *umgesetzt* |
| **G10** | Optiken aller Epochen (Atlas) · *umgesetzt* (P5-Sprites + Code-Fallback / Epoche-Lookup) |
| **G11** | Belagerung Mechanik + Optik · *umgesetzt* (Bewährungsprobe Üben/Ernstfall, Spannungs-Himmel) |
| **P6** | Belagerungs-Himmel / Rauch-Overlays · *umgesetzt* (Atlas `belagerung/` + Code-Fallback) |

Sprites können parallel von Claude/Grok nach `GRAFIK-SPRITES.md` erzeugt und in G5+ eingehängt werden. Ohne Atlas bleibt der Code-Fallback.

---

## 11. Paket G – Bauen und Ausbau (Fokus 01.11.2026)

Auftrag und Abnahme: `docs/session/FOKUS.md`, Paket G. Hinweis: Die Nummern G0 bis G6 dort sind **Paket-Schritte**. Sie haben nichts mit den Szenen-PRs G0 bis G11 in §10 zu tun.

### 11.1 Abnahme (Messgrößen)

| Prüfung | Ziel | Wie gemessen |
|---|---|---|
| Silhouetten-Test | Jede Stufe hat einen anderen Umriss als die vorige | `pnpm grafik:stufen`, Spalte „Umriss anders“. Der Schwellwert wird am Probestück geeicht (siehe 11.2) und dann in `tools/grafik/atlas-stufen.test.ts` festgeschrieben |
| Höhe | mindestens 15–20 % mehr je Stufe | `pnpm grafik:stufen`, Spalte „Höhe +“ (sichtbare Höhe des Bilds, ohne transparenten Rand) |
| Handy-Test | Auf 390 px Breite die Stufe ohne Antippen erkennen | Bildschirmfoto mit iPhone-13-Größe, Blick des PV |
| Bauen | höchstens 3 Tipper vom Bastion-Bildschirm bis „Gebäude steht“ | Playwright mit iPhone-13-Größe (11.3) |
| Ausbauen | höchstens 2 Tipper: Gebäude antippen, „Ausbauen“ | wie oben |
| Gefühl | 2 von 2–3 Jugendlichen erkennen ohne Hilfe die höhere Stufe und finden den Ausbau lohnend | formlos, Ergebnis hier eintragen |

### 11.2 Befund vorher: Stufen (G1, 01.11.2026)

Werkzeug: `pnpm grafik:stufen -- --aus <ordner> [--thema bastion] [--epoche 1] [--json]` (`tools/grafik/stufen-vergleich.py`). Es legt je Thema und Epoche ein Blatt an: links die Stufen als Bild, rechts als schwarzen Umriss. Dazu gibt es eine Tabelle mit Höhe und Umriss-Unterschied. Der Unterschied ist die Fläche, die nur in einer der beiden Stufen belegt ist, geteilt durch die Fläche beider zusammen. Beide Bilder sind dabei am Fußpunkt ausgerichtet. Die Bilder gehören nicht ins Repository; das Werkzeug verweigert einen Ordner darin.

Epoche 1, alle Themen (Atlas-Stand vor Paket G):

| Rolle | Stufen | Höhe + | Umriss anders |
|---|---|---|---|
| kern (5 Themen) | 1→2, 2→3 | 5–8 %, einmal 19–22 % (nur durch ein Fähnchen) | 8–12 % |
| wissen (5 Themen) | 1→2 | 5–7 % | 8–10 % |
| turm (5 Themen) | 1→2 | 12–19 % | 13–14 %, Garten 46 % |

In Epoche 4 (Bastion) wachsen die Stufen des Bergfrieds um je 4–6 %, und die Umrisse unterscheiden sich um 7–9 %. Ergebnis: Ohne echte Formänderung liegt der Umriss-Unterschied bei rund 10 %. Der Startwert von 12 % aus `FOKUS.md` G3 ist darum zu niedrig. Er wird am Probestück neu festgelegt (Vorschlag: mindestens 25 %). Auffällig: Der „Bergfried“ der Bastion ist in Epoche 1 ein flaches Haus mit Walmdach und kein Turm.

### 11.3 Befund vorher: Bau-Wege (G1, 01.11.2026)

Gemessen mit Playwright, iPhone 13 (390 × 844), Bauplatz mit Bild, Thema Bastion, Epoche 1. Gezählt wird vom Bastion-Bildschirm aus.

| Weg | Tipper | Schritte | Wo man nachdenken oder lesen muss |
|---|---|---|---|
| (1) Erstes Gebäude bauen (genug Rohstoffe und Bauschritte) | **3** ✓ | „Bauen“ → Studierstube → „Stein setzen“ | „Stein setzen“ heißt nicht „Bauen“. Der Platz wird selbst gewählt (hinten am Rand), ohne Vorschau und ohne Blick auf das neue Gebäude. Die Kachel „Späherturm“ ist abgeschnitten; nur das Dach ist zu sehen |
| (2) Bergfried auf Stufe 2 ausbauen | **3** ✗ (Ziel 2) | „Bauen“ → nach unten zur Karte „Bergfried Stufe 2“ wischen → „Ausbauen“ | **Antippen des Bergfrieds bietet kein „Ausbauen“**, nur „Ziehen zum Versetzen“ und „Fertig“. Der Ausbau steckt unter „Neu bauen“, ganz unten. In der Vorschau verdeckt die Kopfzeile den Titel „Bergfried auf Stufe 2“. Es gibt kein Vorher/Nachher |
| (3) Ausbauen mit zu wenig Rohstoffen | 3, dann Sackgasse | wie (2) | Rote Zeile „Dafür reicht es noch nicht: Stein, Erz“, „Ausbauen“ ist blass. Es steht nicht da, **wie viel** fehlt und **wie** man es bekommt. Die Hauptaktion ist dann „Als Skizze planen“; das Wort „Skizze“ wird nicht erklärt. Der Vorrat oben zeigt nur Stein und Bauschritte, nicht das fehlende Erz |

Nebenbefund: Die Sprechblase „Hier kann etwas stehen.“ unter dem Bauplatz ist auf eine schmale Spalte gequetscht (ein Wort je Zeile) und liegt über dem Auswahl-Feld. Das kommt in G5.

### 11.4 Probestück (G0.1)

Der Bergfried, Thema Bastion, Epoche 1, Stufen 1–3, wird zweimal gebaut: (a) mit dem eigenen Generator, stark ausgebaut, und (b) aus dem CC0-Bausatz „Castle Kit 1.0“ von Kenney (isometrische Turmteile zum Stapeln). Der PV wählt anhand eines Vergleichsbilds. Bis dahin entsteht nichts davon im Atlas.

**Stand 01.11.2026, beide Varianten gebaut. Wahl des PV (01.11.2026 abends): (a) eigener Generator, und zwar für alles in der Bastion (Gebäude, Boden, Umgebung, Wesen, Himmel), einheitlich für jedes Thema. Schwellwert Umriss 25 %, Höhe 15 %. Vor U4b nur Thema `bastion` (`FOKUS.md` „Entscheidungen“).** *Geändert am 02.11.2026 (PV): vor U4b alle fünf Themen in Epoche 1.* Skripte: `tools/grafik/probe/bergfried-a-generator.py <ausgabe>` und `tools/grafik/probe/bergfried-b-kenney.py <castle-kit-1.0/Isometric> <ausgabe>`. Beide schreiben nur in einen Ordner außerhalb des Repositorys. Der Bausatz für (b) stammt aus dem Spiegel `github.com/ETdoFresh/kenney.nl`, weil kenney.nl aus der Cloud-Sitzung gesperrt ist; `License.txt` (CC0) liegt dort bei.

| | Stufe 1 | Stufe 2 | Stufe 3 | Höhe + (1→2 / 2→3) | Umriss anders (1→2 / 2→3) | Dateigröße s1–s3 |
|---|---|---|---|---|---|---|
| vorher | Kiste mit Walmdach | dieselbe Kiste, +1 Fenster | dieselbe Kiste, + Fähnchen | 7 % / 22 % | 10 % / 10 % | 2 KB je Bild |
| (a) Generator | Holzturm auf Steinsockel, Schindeldach | Steingeschoss + vorkragendes Fachwerk, Ziegeldach, Holzanbau, Banner, Fahne | hoher Steinturm, Zinnenkranz, Turmaufsatz mit Helm, runder Seitenturm, Mauerstück | 70 % / 30 % | 53 % / 31 % | 3 / 7 / 12 KB |
| (b) Kenney | Turmstumpf mit flachem Dach | 3 Geschosse, offener Holz-Wehrgang, hohes Dach, Fahne | 5 Geschosse, runder Seitenturm, Fahne | 99 % / 23 % | 51 % / 34 % | 24 / 53 / 65 KB (noch nicht verkleinert) |

Beobachtungen: (a) zeigt den Materialwechsel Holz → Fachwerk → Stein und passt genau ins 2∶1-Raster. Jedes weitere Gebäude muss aber selbst entworfen werden. (b) wirkt plastischer und „fertiger“. Der Bausatz ist mit einem flacheren Blickwinkel gerendert (Raute etwa 1,46∶1) und wird für das 2∶1-Raster in der Breite gestreckt. Material und Stil sind auf Stein mit Blau festgelegt; die Dächer werden umgefärbt. Holz und Fachwerk fehlen im Bausatz. Für Garten, Unterwasser und Weltraum braucht (b) andere Bausätze, z. B. Nature Kit, Space Kit oder Pirate Kit, sofern es sie in passender Isometrie gibt; sonst bleiben diese Themen bei (a). Beide Varianten erfüllen Höhe und Umriss deutlich. Daraus ergibt sich der Vorschlag für den Schwellwert im Test: Umriss mindestens 25 %, Höhe mindestens 15 %.

### 11.5 G5 – Bauen vereinfachen, erster Schritt (01.11.2026)

Ohne Änderung am Kern (`src/core/` unverändert); nur `src/ui/bastion/` und Texte.

| Vorher (11.3) | Jetzt |
|---|---|
| Ausbauen nur über „Bauen“ → ganz unten → „Ausbauen“ (3 Tipper + Wischen) | **Gebäude antippen → „Ausbauen auf Stufe 2“** (2 Tipper). Reicht alles, wird sofort ausgebaut |
| Reicht etwas nicht: „Ausbauen“ blass, „Dafür reicht es noch nicht: Stein, Erz“ | Der Knopf heißt dann „Ausbauen – was fehlt?“ und öffnet das Bau-Blatt mit dem Gebäude. Dort steht je Rohstoff „Noch 130 Stein. Jede geübte Aufgabe bringt Stein.“ (Texte `bastion.woher.*`, je Thema) |
| Hauptaktion bei Mangel: „Als Skizze planen“ | Skizze und Vormerken liegen unter „Mehr“. Es gibt nur eine Hauptaktion |
| „Stein setzen“ | „Bauen“, dazu „Steht sofort.“ oder „Fertig nach 4 weiteren Lerneinheiten (höchstens zwei am Tag).“ |
| Titel des Blatts immer „Neu bauen“; Ausbau-Karten unten | Titel „Ausbauen“ beim Ausbau; Ausbau-Karten stehen vor „Neu bauen“. Neue Auswahl springt nach oben, nichts liegt mehr unter der Kopfzeile |
| „Hier kann etwas stehen.“ ein Wort je Zeile | mittig in voller Breite; tritt wie „Bauen“ zurück, solange ein Gebäude gewählt ist |

E2E: `Ausbauen beim Antippen: zwei Tipper, sonst steht da, was fehlt (FOKUS G5)`. Die Listenansicht in den Einstellungen bleibt unverändert und voll bedienbar.

Noch offen in G5: ~~Bauplatz-Vorschlag mit Geister-Vorschau und „Hier bauen“ beim Neubau~~ (Teil 2, 11.7); Planen und Bauen zusammenlegen (Kern, B-29): Vorschlag in 11.7, Entscheidung beim PV.

### 11.6 G2 – Stil-Regel für die ganze Bastion (01.11.2026, abgenommen 02.11.2026)

Nach der Wahl des PV (eigener Generator für alles, aus einem Guss) steht die Regel in `GRAFIK-SPRITES.md` §12: Raster und Maßstab, Licht von rechts oben, Kontur, Palette mit Materialleiter Holz → Fachwerk → Stein, Stufen-Sprache mit Schwellwerten (Umriss 25 %, Höhe 15 %) und die Tabelle Rolle × Stufe für das Thema `bastion`, Epoche 1 (14 Gebäudebilder). Vorbild ist das Probestück (a). **Vom PV am 02.11.2026 abgenommen** (`GRAFIK-SPRITES.md` §12.9).

### 11.7 G5 – Bauplatz-Vorschlag beim Neubau (Teil 2, 01.11.2026)

Ohne Änderung am Kern; nur `src/ui/bastion/` (mit `grafik/grafik-buehne.ts`) und Texte.

| Vorher (11.3) | Jetzt |
|---|---|
| „Bauen“ → Gebäude → „Bauen“; der Platz wird still gewählt (hinten am Rand), man sieht ihn nicht | **„Bauen“ → Gebäude antippen → „Hier bauen“** (3 Tipper). Nach dem Antippen geht das Blatt zu. Auf dem Bauplatz liegt ein Geist: Fläche und gestrichelter Umriss in Akzentfarbe, dazu das Gebäudebild blass. Die Kamera schwenkt dorthin und holt etwas heran (mindestens 120 %) |
| – | Unten steht eine Leiste mit Name, „Der freie Platz ist auf dem Bauplatz markiert.“, Dauer („Steht sofort.“ oder „Fertig nach …“), „Sobald es steht, kannst du es kostenlos versetzen.“ und den Knöpfen **„Hier bauen“**, „Anderes Gebäude“ und „Abbrechen“. Für Screenreader nennt sie das Feld („Spalte 1, Reihe 1“) |
| Gebäude, das gerade nicht geht | wie bisher: Das Blatt bleibt offen und sagt, was fehlt (11.5) |

Der vorgeschlagene Platz ist **genau der, auf den gebaut wird**. **Seit 02.11.2026 (Entscheidung PV) liegt er neben dem Bergfried:** `vorgeschlagenerPlatz` (`src/ui/plattform/platz-vorschlag.ts`) nimmt das freie Feld, dessen Mitte der Mitte des Bergfrieds am nächsten liegt; Plätze dahinter zählen doppelt so weit, weil der hohe Bergfried sie in der Schrägansicht verdecken würde. Ohne Bergfried zählt die Bauplatz-Mitte, bei Gleichstand das Feld, das `freierPlatz` zuerst fände. Vorschau (`Bastion.svelte`) und Ablage beim Beginnen nutzen dieselbe Funktion. Der Kern bleibt unverändert, Aufstellen aus dem Lager nimmt weiter das erste freie Feld. Beispiel Startzustand: Die Studierstube kommt links neben den Bergfried (Spalte 4, Reihe 6). Die Listenansicht in den Einstellungen bleibt unverändert. E2E: `Neubau: die App schlägt einen freien Platz vor, „Hier bauen“ (FOKUS G5)`.

**Vorschlag an den PV (B-29, nicht gebaut): Planen und Bauen in einem Schritt.** Im Kern ist „Planen“ kein eigener Schritt. Getrennt ist nur die Bauzeit: Reicht der Vorrat an Bauschritten nicht, wartet das Gebäude als Vorhaben über mehrere Lerneinheiten (B-7). Für „Gebäude steht nach 3 Tippern“ wäre die kleinste Kernänderung: Bauen geht erst, wenn genug Bauschritte im Vorrat sind, und dann steht das Gebäude sofort (ein neues Hindernis `zu-wenig-schritt` in `beginnHindernisse`). Ereignisse und Schema bleiben gleich; alte Vorhaben laufen weiter wie bisher. Zum Vergleich wurde `pnpm sim` in einer Probe-Kopie gerechnet und nicht übernommen:

| Profil | vorher | nachher (Kind spart keine Bauschritte) | nachher (Kind hebt Bauschritte für das nächste Ziel auf) |
|---|---|---|---|
| P1, P2, P5, P6, P7 | – | unverändert | unverändert |
| P3 Wochenende: Epoche 1 nach | 10,5 Monaten | **19,7 Monaten** | 10,7 Monaten |
| P3: Gebäude fertig im Jahr 1 | 77 | 85 | **29** |
| P3: größte Lücke | 35 Tage | 35 Tage | **56 Tage** |
| P4 Farmer: größte Lücke | 3 Tage | 3 Tage | 7 Tage |

Rot würden 9 Kern-Tests, die das alte Verhalten festhalten (ein Bauschritt wirkt auf alle Vorhaben, Abbruch gibt Bauschritte zurück, Zimmerei mit zwei Vorhaben). Diese Regeln hätten für neue Bauten keine Wirkung mehr. **Empfehlung: den Kern nicht ändern.** **Entscheidung PV (01.11.2026 abends): so umgesetzt, B-29 wird für „Planen und Bauen zusammenlegen“ nicht genutzt.** Die Wochenend-Lernerin verliert entweder viel Zeit oder sieht im ersten Jahr weniger als die Hälfte der Gebäude. Stattdessen macht G4 das Warten sichtbar: Das Gerüst wächst mit jeder Lerneinheit in Abschnitten. Mit dem Platz-Vorschlag oben ist das Planen für das Kind schon ein Schritt.


### 11.8 G3 – Charge 1: Bergfried, Thema `bastion`, Epoche 1 (02.11.2026)

Erzeugt mit dem eigenen Generator `tools/grafik/sprites-g3-bastion.py` nach der Stil-Regel `GRAFIK-SPRITES.md` §12 (Grundlage: Probestück (a), das unter `tools/grafik/probe/` als Beleg bleibt). Der Generator ersetzt nur `bastion/e1/kern_s1…s3` und die Abend-Ebenen im Atlas, alle anderen Einträge bleiben.

| Stufe | Bild | Höhe (sichtbar) | Umriss anders als vorige Stufe |
|---|---|---|---|
| 1 | Holzturm auf Steinsockel, Schindeldach | 223 px (vorher 294 px Kiste) | – |
| 2 | Steingeschoss, vorkragendes Fachwerk, Ziegeldach, Anbau, Banner, Fahne | 379 px (+70 %) | 53 % |
| 3 | hoher Steinturm, Zinnenkranz, Turmaufsatz mit Helm, runder Seitenturm, Mauerstück | 491 px (+30 %) | 31 % |

Vorher: +5 % Höhe je Stufe, kaum Umriss-Unterschied (§11.2). Atlas-Bilder des Bergfrieds: 7,6 KB → 22,0 KB (+14 KB, Grafik-Budget unberührt, der Atlas zählt gesondert).

**Automatischer Test** `tools/grafik/atlas-stufen.test.ts`: Für jedes erneuerte Gebäude muss jede Stufe mindestens 25 % anderen Umriss und 15 % mehr Höhe haben (Schwellen des PV, G0). Die Liste `ERNEUERT` wächst mit jeder Charge. PNGs liest der Test ohne Zusatzpaket.

**In der App geprüft** (390 px, Bildschirmfotos an den PV): Stufe 1 und 2 stehen stimmig auf dem Bauplatz, Antippen trifft weiter. Ein laufender Ausbau auf Stufe 3 zeigt noch die alte Baustellen-Kiste aus dem Code – das löst G4 (Gerüst in Abschnitten). Nächste Chargen: Werkstatt, Tor, Einfassung und Zierde, dann Boden, Umgebung, Wesen (Tabelle §12.8).

**Charge 2 (02.11.2026): Studierstube und Späherturm**, derselbe Generator (jetzt für 1×1, 2×2 und 3×3 Felder, neu: Satteldach).

| Gebäude | Stufe 1 | Stufe 2 | Höhe | Umriss anders |
|---|---|---|---|---|
| Studierstube (2×2) | Holzhaus, Satteldach aus Schindeln, Tür, breites Lesefenster | Fachwerk über Steinsockel, Ziegeldach mit Gaube und Dachreiter, rundes Giebelfenster, Banner | 176 → 318 px (+81 %) | 45 % |
| Späherturm (1×1) | offener Holzturm: Pfosten mit Kreuzstreben, Plattform mit Geländer, Leiter, Laterne, Schindeldach | Fachwerk-Turmstube auf Steinfuß, Ziegel-Spitzhelm, Fahne | 222 → 322 px (+45 %) | 42 % |

Der Späherturm bleibt unter dem Bergfried Stufe 2 (379 px), wie §12.8 verlangt. Vorher: Studierstube +7 % / 9 %, Späherturm +13 % / 14 % (§11.2).

**Charge 3 (02.11.2026): alle übrigen Gebäude der Epoche 1** nach Tabelle §12.8: Werkstatt (offener Holzschuppen mit Pultdach, Werkbank, Bretterstapel, Sägebock, Laterne als Abend-Ebene), Tor (Holztor zwischen Pfosten mit Querbalken und Schindeldach), Palisade (angespitzte Pfähle mit Querriegel, an beiden Enden anschlussfähig), Feuerstelle (Steinkreis, Scheite, Sitzstamm; Glut und Flamme als neue Abend-Ebene), Banner (Holzmast mit Petrol-Banner und Emblem), Gartenbeet (Holzrahmen, drei Reihen Pflanzen, Trittsteine), Statue (Steinsockel, Figur in neutralem Grau). Damit stammen alle 14 Gebäudebilder des Themas `bastion`, Epoche 1, aus dem neuen Generator. **Umgebung (02.11.2026):** Bäume (zwei Größen), Busch und Stein aus demselben Generator (Laubkrone als Kugel aus drei Tönen, Kontur nur am Rand, §12.7), Atlas `umgebung/bastion/`. Die Bühne stellt zwölf davon an feste Plätze auf den Inselrand, knapp außerhalb der Felder (`src/ui/bastion/grafik/insel-umgebung.ts`, Test: nie auf einem Feld, kein Zufall); vorne nur Niedriges, damit nichts den Bauplatz verdeckt. Sie sind nicht antippbar.

**Wesen (02.11.2026):** Möwe, Fuchs und Wache neu aus demselben Generator, gleiche Bildnamen und Frames wie P3 (3 Ruhe-, 4 Geh-, 2 Reaktionsbilder, 64 × 64): Licht von rechts oben, Kontur am Rand, Petrol-Akzent. Reaktion: Möwe schlägt die Flügel, Fuchs setzt sich auf, Wache winkt (keine Waffe). Intern vierfach gezeichnet und weich verkleinert.

Damit stammen Gebäude, Umgebung und Wesen des Themas `bastion`, Epoche 1, aus dem neuen Generator. Der Boden bleibt nach §12.5 wie P3.  Eine `_maske.png` für die Statue erst, wenn die Bühne Masken nutzt.

**Thema `dorf`, Gebäude der Epoche 1 (02.11.2026, Klärung PV: alle fünf Themen vor U4b).** Der Generator ist jetzt aufgeteilt: gemeinsames Modul `tools/grafik/g3_stil.py` (die Bilder des Themas `bastion` sind danach Byte für Byte gleich) und je Thema ein Skript, hier `tools/grafik/sprites-g3-dorf.py`. Materialleiter Lehm/Stroh → Fachwerk/Ziegel → Bruchstein/Schiefer, Tabelle `GRAFIK-SPRITES.md` §12.10.

| Gebäude | vorher (Höhe + / Umriss) | jetzt Höhe | Höhe + | Umriss anders |
|---|---|---|---|---|
| Gemeindehaus 1→2 | 7 % / 10 % | 200 → 313 px | 56 % | 55 % |
| Gemeindehaus 2→3 | 7 % / 12 % | 313 → 492 px | 57 % | 28 % |
| Bücherei 1→2 | 7 % / 9 % | 172 → 289 px | 68 % | 54 % |
| Windmühle 1→2 | 12 % / 14 % | 186 → 250 px | 34 % | 36 % |

Atlas-Bilder `gebaeude/dorf/e1`: 25 KB → 55 KB; ganzer Atlas 1 374 KB → 1 405 KB (+31 KB, zählt gesondert vom Grafik-Budget). In der App geprüft (390 px, Thema Dorf, Bildschirmfotos an den PV): alle Gebäude stehen stimmig auf der Wiese, Abend-Fenster deckungsgleich. Der Ausbau des Gemeindehauses auf Stufe 3 schließt die Epoche ab; danach zeigt die App wie bei `bastion` die alten Bilder der Epoche 2 (kommen nach U4b). Umriss-Test und Sätze zum Ausbau (`bastion.ausbau-neu.dorf.*`) gelten jetzt auch für das Dorf.

**Dorf: Umgebung und Wesen (02.11.2026).** Linde (`baum_a`) und Apfelbaum (`baum_b`) aus demselben Generator, Atlas `umgebung/dorf/`. Die Dorf-Bühne stellt sie auf die festen Baumplätze aus `dorf.ts` (`dorfBaumLagen`), etwas kleiner als den Code-Baum, vorne nur Apfelbäume, damit nichts den Bauplatz verdeckt; fehlt das Bild, zeichnet der Code wie bisher. Huhn (pickt, flattert), Katze (Streifen, setzt sich mit Schwanz hoch) und Spatz (hüpft, fliegt auf) neu im Stil der Bastion-Wesen, gleiche Namen und Frames wie P0. Atlas gesamt 1 405 KB → 1 463 KB (+58 KB). Damit stammt alles im Dorf außer dem Boden aus dem neuen Generator; der Boden bleibt wie bei `bastion` (§12.5).

**Thema `garten`, Epoche 1 (02.11.2026).** Skript `tools/grafik/sprites-g3-garten.py`, Materialleiter rohes Holz und Rinde → Bretter mit Schindeln → bemaltes Holz mit Glas und Moosdach (`GRAFIK-SPRITES.md` §12.10). Alle 14 Gebäude, dazu Sträucher (grün und blühend) auf den festen Plätzen der Garten-Szene (`gartenStrauchLagen`, Code-Strauch bleibt Rückfall) und Biene, Schnecke, Schmetterling.

| Gebäude | vorher (Höhe + / Umriss) | jetzt Höhe | Höhe + | Umriss anders |
|---|---|---|---|---|
| Baumhaus 1→2 | 8 % / 11 % | 284 → 344 px | 21 % | 40 % |
| Baumhaus 2→3 | 19 % / 11 % | 344 → 446 px | 30 % | 44 % |
| Gewächshaus 1→2 | 7 % / 10 % | 127 → 311 px | 145 % | 63 % |
| Aussichtsbaum 1→2 | 12 % / 46 % | 211 → 307 px | 45 % | 58 % |

Das Baumhaus Stufe 1 bekommt eine Laterne an der Plattform, damit es abends leuchtet wie die anderen Stufen. Neu im gemeinsamen Modul: Hat ein neues Bild keine Fenster, entfernt der Generator die alte Abend-Ebene (sonst läge ein altes Fenster über dem neuen Bild). Atlas gesamt etwa +74 KB. In der App geprüft (390 px, Thema Garten).

**Thema `unterwasser`, Epoche 1 (02.11.2026).** Skript `tools/grafik/sprites-g3-unterwasser.py`, Materialleiter Treibholz und Muscheln → Korallenstein mit Bullaugen → Messing, Perlmutt und Glaskuppel (`GRAFIK-SPRITES.md` §12.10). Neu im Skript: eine Kuppel als Grundkörper (Halbkugel mit Licht von rechts oben, wahlweise mit Rippen). Alle 14 Gebäude, dazu Korallen (Ast und Fächer) auf den festen Plätzen der Unterwasser-Szene (`uwKoralleLagen`, Code-Koralle bleibt Rückfall) und Fisch, Krebs, Qualle.

| Gebäude | vorher (Höhe + / Umriss) | jetzt Höhe | Höhe + | Umriss anders |
|---|---|---|---|---|
| Hauptkuppel 1→2 | 6 % / 9 % | 109 → 205 px | 88 % | 56 % |
| Hauptkuppel 2→3 | 6 % / 8 % | 205 → 325 px | 59 % | 40 % |
| Perlenkammer 1→2 | 6 % / 8 % | 142 → 235 px | 65 % | 40 % |
| Leuchtturm 1→2 | 12 % / 13 % | 152 → 287 px | 89 % | 74 % |

In der App geprüft (390 px, Thema Unterwasserstadt).

**Thema `weltraum`, Epoche 1 (02.11.2026).** Skript `tools/grafik/sprites-g3-weltraum.py`, Materialleiter Blech und Landekapsel → helle Paneele mit Nieten → Glas, Solarflügel und Leuchtband (`GRAFIK-SPRITES.md` §12.10). Die Kuppel-Grundform liegt jetzt im gemeinsamen Modul `g3_stil.py` (Unterwasser-Bilder unverändert). Alle 14 Gebäude, dazu Drohne und Roboter. Die Weltraum-Szene hat keine Umgebung (auch vorher nicht); es kommt keine dazu.

| Gebäude | vorher (Höhe + / Umriss) | jetzt Höhe | Höhe + | Umriss anders |
|---|---|---|---|---|
| Kommandomodul 1→2 | 6 % / 9 % | 186 → 271 px | 46 % | 53 % |
| Kommandomodul 2→3 | 5 % / 8 % | 271 → 409 px | 51 % | 53 % |
| Sternwarte 1→2 | 5 % / 8 % | 108 → 228 px | 111 % | 60 % |
| Antennenmast 1→2 | 19 % / 14 % | 154 → 277 px | 80 % | 74 % |

**Damit sind alle fünf Themen der Epoche 1 aus dem eigenen Generator** (Gebäude, Umgebung, Wesen; Boden wie bisher). Umriss-Test und Sätze zum Ausbau gelten für alle fünf.

**Nächster Schritt:** G6 Abnahme (PV, 2–3 Jugendliche).

### 11.9 G4 – Gerüst in Abschnitten (02.11.2026, erster Schritt)

Ein laufendes Bauvorhaben (Neubau oder Ausbau über mehrere Lerneinheiten, Bau-Regel unverändert nach B-30) zeigt auf dem Bauplatz ein **Gerüst statt eines Fortschrittsbalkens**: Stangen an den drei sichtbaren Ecken und Laufbretter in 2 bis 6 Ebenen, eine je Bauschritt (`src/ui/bastion/grafik/geruest.ts`, Test `geruest.test.ts`). Fertige Ebenen sind kräftig, offene blass. Ab dem ersten Bauschritt steht mindestens eine Ebene. Das Gerüst reicht bis 80 % der Höhe des **künftigen** Bildes, so sieht man schon, wie viel höher das Gebäude wird. Bei großen Grundflächen (Bergfried 3×3) rückt es an den Körper heran. Ruhiges Bild ohne Bewegung (R1–R7, „Bewegung reduzieren“ braucht keine eigene Fassung).

Außerdem reicht die Fläche zum Antippen jetzt bis zur Spitze der neuen, höheren Bilder (vorher galt die Höhe der alten Code-Formen).

**Vorher/Nachher (02.11.2026):** Beim Antippen eines Gebäudes steht unter „Ausbauen“ klein die heutige und die nächste Stufe nebeneinander, dazu ein Satz, was neu dazukommt („Bekommt ein Steingeschoss, darüber Fachwerk mit Ziegeldach, einen Anbau und ein Banner.“). Dasselbe im Bau-Blatt: heutige Stufe klein, Pfeil, neue Stufe groß. Die Sätze stehen in `de.json` je Thema, Rolle und Stufe (`bastion.ausbau-neu.<thema>.<rolle>.<stufe>`, `src/ui/bastion/ausbau-neu.ts`; seit 03.11.2026 ohne Epoche, weil eine Stufe in jeder Epoche gleich aussieht, und für alle Stufen aller Themen, §14); fehlt einer, zeigt die App nur die Bilder.

**Ausbau-Moment (02.11.2026):** Wird eine Stufe fertig, erscheint das neue Bild sanft (dieselbe ruhige Einblendung wie bei einem Neubau, kein Konfetti, keine Truhe, R1). Bei „Bewegung reduzieren“ wechselt das Bild ohne Einblendung. Der weiche Bau-Klang beim Ausbauen gab es schon (Sound-Stufen beachtet). Die Kamera bleibt, wo sie ist – man schaut beim Ausbauen per Antippen ohnehin auf das Gebäude.

Offen in G4: Staub-Wölkchen beim Fertigwerden (nur bei „leicht“); eine Statusgeste eines Bewohners.


### Himmel über dem Bauplatz wächst mit der Epoche (02.11.2026)

Die Bühne lässt über dem Bauplatz so viel Himmel, wie der höchste Turm an der hinteren Ecke braucht: 160 / 210 / 250 / 310 Bildpunkte für 12×12 / 16×16 / 20×20 / 24×24 (`himmelFuer` in `src/ui/bastion/grafik/iso.ts`). Vorher waren es fest 120, und hohe Stufen wurden oben abgeschnitten. Der Bergfried steht seit B-32 in der Mitte und braucht weniger.

## 13. Kulisse hinter dem Bauplatz (Wunsch PV, 02.11.2026, Variante C)

Statt der leeren Himmelsfläche liegt hinter dem Bauplatz eine Kulisse, die das ganze Fenster füllt, im Hoch- und Querformat. Entwurf 1 (Horizont direkt an der Inselspitze) hat der PV verworfen; gewählt ist **Variante C**: Meer rundherum, der Horizont weit weg.

- **Meer:** füllt das Fenster und geht mit der Insel mit (Kachel `meer.png`, gleicher Zoom und Weg wie der Bauplatz). Schaumring am Inselrand, Felsen und Inselchen an festen Plätzen um den Bauplatz (`dingeUmBauplatz`, kein Zufall), ein Segelboot quert langsam.
- **Horizont:** 520 Bühnen-Bildpunkte über der Inselspitze, kleiner gezeichnet und kaum verschoben (`kulissenLage`). Herausgezoomt erscheint er oben mit Himmel, Hügeln und Waldsaum; hineingezoomt liegt er über dem Fenster, dann ist nur Meer zu sehen. Nachts Sterne über dem Horizont.
- **Stimmung:** `tag`, `daemmerung` (eine Stunde nach Untergang, 45 Minuten vor Aufgang), `nacht` (`stimmungAus`). Kein Timer; die Oberfläche fragt einmal je Minute die Uhr, wie bisher. Felsen, Boot und Schaum werden abends und nachts abgedunkelt.
- **Bewegung:** Wellen (eine Kachel in 40 Sekunden) und Boot (3 Minuten) nur bei „voll“/„leicht“ und ohne „Bewegung reduzieren“ (R5).
- **Bühne:** Mit Kulisse ist das Pixi-Bild durchsichtig (`Farben.kulisse`, Schwarz mit Deckkraft 0) und zeichnet kein Gestirn.
- **Bilder:** `tools/grafik/sprites-g3-kulisse.py` → `public/grafik/atlas/kulisse/<thema>/…` (Stimmungen, `dinge/`).
- **Nebenbei behoben:** Der Rahmen des Bauplatz-Bilds und das Einpassen der Kamera nahmen bisher immer die Größe 12×12 (`buehneBreite()` ohne Neuberechnung). In Epoche 2–4 wurde das Bild darum gestaucht. Jetzt rechnen Rahmen, Kamera und Kulisse mit dem Bauplatz der Epoche (`buehneFuer(bauplatz)`).
- **Stand 03.11.2026 (Auftrag Punkt 3):** alle fünf Themen haben eine Kulisse (`tools/grafik/g12_kulisse.py`, Stil „weich gerendert“): **Dorf** Felder in Streifen, Hecken, Bach, ferne Dächer und Kirchturm; **Garten** Wiese mit Blumen, Hecken, Teiche, ferne Bäume; **Unterwasser** Riff in drei Schichten, Lichtstrahlen von oben, Tiefe im Blau; **Weltraum** Kraterrand, Planet mit Ring, Sterne auch am Tag. Je Thema eigene Dinge um den Bauplatz (`kulisseFuer(thema).dinge`); Schaumring, Tropfenringe, Eisschollen und Boot nur, wo Wasser ist (Bastion). Wolken ziehen nur über Land. Das Wetter (§15) wirkt in allen Kulissen.

## 14. Neuer Stil „weich gerendert“ und neue Stufenleitern (PV, 03.11.2026, Auftrag Punkt 1)

Regeln und Technik: `GRAFIK-SPRITES.md` §13. Ablauf mit dem PV:

1. Erster Versuch (vierfach zeichnen, feinere Materialien, §12.12): auf App-Größe kaum zu sehen („sieht ja genau so aus wie vorher“).
2. Vier Stilproben aus einem eigenen 3D-Renderer (weich gerendert, Comic, Spielzeug, Klötzchen); Wahl des PV: **weich gerendert**.
3. „Die Abstufungen 1 bis 9 sind noch zu sinnlos, vor allem ab 4“: Die Leitern sind neu gedacht. Jede Stufe ist dasselbe Gebäude wie die vorige plus genau ein Teil, das zur Aufgabe passt (Tabelle §13.3). Auftrag des PV: „für alle Gebäude in allen Themen, alle Objekte inklusive Boden im neuen Stil, nicht nochmal fragen“.

**Umgesetzt (03.11.2026):** alle Gebäude aller fünf Themen (je 9 + 5 + 5 + 3 + 2 Stufen und 5 Zierden, `tools/grafik/g12_modelle.py`, `g12_atlas.py`), Boden (80 Kacheln, `g12_boden.py`), Umgebung, Kulisse-Dinge, Wesen und Bewohner (`g12_rest.py`); Hinterhof und Startbild werden aus den neuen Bildern zusammengesetzt (`sprites-g3-hinterhof.py`). Himmel, Wetter und Auflagen bleiben (weiche 2D-Formen, schon im passenden Stil). Ein Satz je Stufe sagt, was dazukommt (`bastion.ausbau-neu.<thema>.<rolle>.<stufe>`).

- **Umriss-Test** (`atlas-stufen.test.ts`, `GRAFIK-SPRITES.md` §13.2 Nr. 5): bis Stufe 3 wie bisher (Umriss 25 %, Höhe +15 %). **Ab Stufe 4 neu festgelegt** (03.11.2026, nach Fotos aus der App): mindestens 10 % der Fläche sichtbar geändert (Umriss oder Farbe), nicht niedriger als die vorige Stufe. Die alte Regel (Höhe +8 % je Stufe) zwang die aufbauenden Leitern in die Höhe und verzerrte sie. Der PV kann das zurücknehmen; dann müssten die Stufen ab 4 wieder vor allem nach oben wachsen.
- **Offen beim PV:** Blick auf die neuen Leitern in der App (Fotos im PR).

## 15. Mehr Wetter (Wunsch PV, 02.11.2026, Auftrag Punkt 2)

Ruhig und ohne Blitze (R1–R7); bei „ruhig“ und „Bewegung reduzieren“ steht alles still.

- **Wetterbilder:** klar, bewölkt, Regen, Schnee, Nebel und neu **Sturm**. Gewitter (WMO 95–99) zeigt die App als Sturm, ohne Blitze. Aus echtem Wetter (Open-Meteo, nur nach Einschalten, T-15) zusätzlich Wind (`wind_speed_10m`, ab 50 km/h Sturm) und Niederschlag des Tages.
- **Regenbogen:** nach Regen, wenn es aufklart. Offline aus dem Datum (gestern Regen, heute klar oder bewölkt, an zwei von drei solchen Tagen; `regenbogenAusDatum`), mit echtem Wetter aus dem Niederschlag des Tages (`regenbogenAusEcht`). Kein Zufall zur Laufzeit.
- **Regen:** dunkleres Meer und Tropfenringe in der Kulisse, nasse, dunklere Dächer (Tönung der Gebäude), Pfützen mit Glanz auf festen Feldern (`wetter-optik.ts`).
- **Schnee:** liegender Schnee auf Boden und Dächern, weiße Hügel am Horizont, Eisschollen am Ufer.
- **Sturm:** schnellere Wellen und kräftigerer Schaum, dreimal so schnelle Wolken, Wolkenschatten über Insel und Meer, Windstriche.
- **Nebel:** Nebelbänke über dem Meer, Horizont und Dinge im Meer verschwinden fast.
- **Zahnrad:** „Wetter ausprobieren“ (Wie draußen, Sonne, Wolken, Regen, Schnee, Sturm, Nebel, Regenbogen); gilt nur für die Ansicht bis zum Neuladen und wird nicht gespeichert (`wetter-probe.svelte.ts`).
- **Offen:** wehende Fahnen und Banner bei Sturm. Die Fahnen sind Teil der Gebäudebilder; dafür bräuchte jedes Gebäude mit Fahne eigene Bilder für die Bewegung.
- Kulissen der anderen Themen (Punkt 3) bekommen dieselben Wetterteile, sobald es sie gibt.

### 15.1 Wetter über dem ganzen Bild und Stärken (Wunsch PV, 03.11.2026)

PV: „Wetter ist schon unterschiedlich, aber nicht viel davon auf dem Bildschirm zu sehen.“ Bisher regnete und schneite es nur über der Insel.

- **Wetterschicht** (`Wetterschicht.svelte`, `grafik/wetter-schicht.ts`) über Kulisse und Bauplatz, über den ganzen Bildschirm; fängt keine Tipper ab. Regen und Schnee sind feste Kacheln (kleine SVG-Bilder im Code, kein Netz, Tropfen und Flocken an festen Stellen) in drei Ebenen, die verschieden schnell fallen. Sturm: schräger Regen, dunkler Schleier, mehr Wolkenschatten. Nebel: vier Nebelbänke über allem. Wolken: Wolkenschatten liegen über Insel und Kulisse (fest, seit §24). Nur Bastion, Dorf und Garten (unter Wasser und im Weltraum regnet es nicht).
- **Stärke** leicht / mittel / stark (`WetterStaerke`): aus dem Wettercode (Niesel und Schauer leicht, Starkregen und starker Schnee stark; `staerkeAusWmo`) oder offline fest aus dem Datum (`staerkeAusDatum`). Stark: mehr Tropfen, grauer Schleier, beim Gestöber Schneedunst.
- **Zahnrad:** neu Nieselregen, Starkregen, Leichter Schnee, Schneegestöber.
- **Nichts mehr direkt über der Insel** (Wunsch PV): Mit Kulisse zeichnet die Bühne keine kleinen Wolken, Tropfen, Flocken, Nebelteilchen und Sturmschatten mehr über der Insel; das übernimmt die Wetterschicht. Was auf der Insel liegt, bleibt: Pfützen, Schnee auf Boden und Dächern, nasse Dächer, Herbstlaub.
- Bewegung nur bei „voll“ und „leicht“ (leicht: eine Ebene) und ohne „Bewegung reduzieren“; sonst steht das Wetter still im Bild, bleibt aber sichtbar. Die Ebenen bewegen sich nur per CSS-Verschiebung (kein Neuzeichnen je Bild).

## 16. Erster Tipper und Kamera nach dem Öffnen (Auftrag Punkt 4, #160)

- **Ursache:** Das Bild wurde gebaut, bevor das Wetter geladen war, und baute sich danach ein zweites Mal auf. Ein Tipper in dieser Zeit ging ins Leere, und das Dorf lud seine Bilder doppelt.
- **Jetzt:** Der Bauplatz wartet auf das Wetter (höchstens 1,2 s, dann ohne) und baut sich einmal auf. Gemessen mit fester Uhr an einem Tag mit Wetter „klar“: vorher 2 Aufbauten nach dem Öffnen (Bastion und Dorf), jetzt 1.
- **Tipper vor dem fertigen Bild:** wird gemerkt und ausgeführt, sobald das Bild steht. Gemerkt wird die Stelle im Bild, nicht auf dem Bildschirm – so trifft der Tipper auch, wenn die Kamera sich bis dahin noch einpasst (vermutete Ursache des ersten roten CI-Laufs; lokal nicht nachstellbar). Der Browser-Test hält jetzt die Bildliste (`manifest.json`) zurück, bis getippt ist, und prüft am Fenster `data-bild="laedt"`. So trifft er auf jedem Rechner genau den Fall „Tipper vor dem fertigen Bild“ (vorher in der CI manchmal rot, weil das Bild dort schon fertig war oder die Kamera noch rückte). Browser-Test „Erster Tipper gleich nach dem Öffnen geht nicht verloren“ (ohne die Korrektur rot).
- **Kamera:** Kommt die Größe des Bauplatzes (Epoche) erst nach dem ersten Einpassen, passt die Kamera sich neu ein bzw. legt die gemerkte Kamera neu, solange man sie noch nicht selbst bewegt hat.

## 17. Jahreszeiten in Insel und Kulisse (Wunsch PV, 03.11.2026)

PV: „Herbstlaub nur innerhalb der Insel bzw. dort, wo tatsächlich Bäume sind; die passen sich ebenfalls den Jahreszeiten an.“ Bisher färbte die Jahreszeit nur die Farben ein, im Winter lag Schnee auf den Dächern, und das Laub fiel irgendwo über das ganze Bild.

- **Bäume je Jahreszeit** (`tools/grafik/g13_jahreszeiten.py`, gleicher Renderer wie G12): Frühling hellgrün mit Blüten, Sommer wie bisher, Herbst bunt (orange, gelb, rot), Winter kahle Äste mit Schnee. Büsche, Sträucher und Hecken im Winter immergrün mit Schneehaube, im Herbst mit Hagebutten. Obstbäume tragen im Sommer und Herbst Äpfel. Teiche frieren im Winter zu (Eis mit Rissen). Gilt für die Umgebung auf der Insel (Bastion, Dorf, Garten) und für die Dinge der Kulisse.
- **Laden:** Die App lädt nur die Bilder der aktuellen Jahreszeit (`atlasBrauchtId`); fehlt ein Bild, nimmt sie das Sommerbild.
- **Herbstlaub fällt nur unter Bäumen:** Beim Zeichnen merkt sich die Bühne die Kronen; jedes Blatt fällt von einer Krone bis zum Boden unter dem Baum und startet dann an der nächsten Krone. Ohne Bäume fällt kein Laub.
- **Boden:** Die Insel samt Rand bekommt einen Ton je Jahreszeit (Frühling frisch, Herbst warm, Winter Raureif mit Schneeflecken). Die Kulisse tönt Felder, Wiese und Hügel genauso (`jz-…`-Klassen in `Kulisse.svelte`). Unter Wasser und im Weltraum bleibt alles, wie es ist.
- **Zahnrad:** „Jahreszeit ausprobieren“ (Wie im Kalender, Frühling, Sommer, Herbst, Winter) – wie beim Wetter nur für die Ansicht bis zum Neuladen.

## 18. Mehr Leben in der Kulisse (Wunsch PV, 03.11.2026)

PV: „Die Kulissen sind noch zu viel freie Fläche, die mit Leben gefüllt werden muss.“ Bisher standen sechs Dinge rund um den Bauplatz.

- **Verteilung** (`kulissenDinge` in `grafik/kulisse.ts`): die sechs festen Plätze am Bauplatz, dazu ein Raster mit fester Verschiebung je Zelle bis 30 Felder hinaus; nah dichter, weit lockerer; nichts auf dem Bauplatz und direkt am Rand; weit seitlich nichts (im Hochformat unsichtbar); etwa 70–100 Dinge je nach Epoche. Kein Zufall: gleiche Größe, gleiche Plätze. Größen schwanken leicht. Hinter dem Horizont wird nichts gezeigt (sonst stünde es herausgezoomt am Himmel).
- **Flächen am Boden** (zwei bis drei Felder, liegen unter allem): Bastion Sandbänke und Riffe, Dorf Äcker und Teiche, Garten Beete und Teiche, Unterwasser Seegraswiesen und Sandrippel, Weltraum Kraterfelder.
- **Neue Dinge** (`tools/grafik/g14_kulisse_leben.py`): Bastion Boje, Leuchtturm (selten); Dorf Baumgruppe, Kuh, Schaf, Zaun; Garten Baumgruppe, Bank, Vogeltränke; Unterwasser Anemone, Seestern; Weltraum Geröll, Antenne, Eisbrocken. Pflanzliches gibt es je Jahreszeit (Acker im Frühling grün, im Sommer Korn, im Herbst gepflügt, im Winter verschneit).
- **Bewegtes**, ruhig und nur bei „voll“/„leicht“ ohne „Bewegung reduzieren“: Möwen kreisen über dem Meer (einfache Form aus dem Code), Kühe und Schafe grasen (nicken), Schmetterlinge flattern im Garten (nachts nicht), Fischschwärme ziehen unter Wasser hin und her, ein Satellit zieht über den Weltraum.

### 18.1 Nachbesserung nach den iPhone-Fotos des PV (03.11.2026)

- **Regen ruhiger:** zwei statt drei Ebenen, weniger, kürzere und blassere Striche; Schleier bei Regen kaum noch (mittel 3 %, stark 7 %, Sturm 10 %). Schnee etwas zurückgenommen. Insel und Gebäude bleiben bei jedem Wetter gut zu erkennen.
- **Wolken und Nebel wandern mit:** Wolkenschatten und Nebelbänke hängen an der Welt (gleiche Verschiebung und gleicher Zoom wie der Bauplatz), über einem Stück Welt dreimal so groß wie die Bühne; seit §24 ziehen sie nicht mehr selbst. Nur Regen und Schnee fallen weiter in Blickrichtung über den Bildschirm.
- **Szenerie bis weit hinaus:** keine Sperre mehr an den Seiten (beim Verschieben sah man sonst leere Fläche), Verteilung bis 44 Felder; oben (bis zum Horizont) etwas dichter als unten, damit beide Hälften gleich voll wirken. Gezeichnet wird nur, was im Bild oder knapp daneben liegt.
- **Himmel:** ruhige Wolken über dem Horizont (Land und Meer), die beim Verschieben nur wenig mitwandern; bei Regen und Sturm grauer, nachts kaum zu sehen. Vor der Bastion ferne Segel auf der Horizontlinie.

### 18.2 Vielfalt und eigene Umgebung (Wunsch PV, 03.11.2026)

PV: „Wir brauchen mehr unterschiedliche, z. B. Kraterfelder und Sandbänke und Bäume, einfach alles unterschiedlich (jeder Schüler kann zufällig eine Szenerie generieren).“

- **Varianten** (`tools/grafik/g15_varianten.py`, 46 Bilder): von Sandbank, Riff, Acker, Baumgruppe (Bastion-Dorf und Garten, jetzt auch mit Nadelbäumen, im Winter grün mit Schnee), Beet (auch rund), Seegras, Sandrippel, Kraterfeld, Geröll und Eisbrocken je drei Formen (`<name>_2`, `<name>_3`), Pflanzliches je Jahreszeit. Welche Form wo steht, legt `kulissenDinge` fest (`KulissenThema.varianten`).
- **Eigene Umgebung:** Im Zahnrad „Neue Umgebung würfeln“ (und „Ursprüngliche Umgebung“). Der Startwert wird als Einstellung `basebau.szenerie` gespeichert (Ereignis wie die Kamera, keine Schemaänderung) und mischt Lage, Auswahl, Form und Größe aller Dinge der Kulisse neu; auch die sechs Plätze am Bauplatz. Echter Zufall nur beim Antippen (`src/ui/plattform/zufall.ts`), danach fest. Nur Aussehen: keine Belohnung, nicht ans Lernen gebunden, jederzeit neu oder zurück (R1). 0 = Grundszenerie wie bisher.
- **Oben und unten gleich voll:** Test prüft, dass über dem Bauplatz etwa so viele Dinge stehen wie darunter.

- **Sandbänke und Krater (04.11.2026, `tools/grafik/g20_flaechen.py`):** vier neue Sandbänke (Landzunge, Sichel um eine Lagune, Inselkette, breite Bank mit Priel; Muscheln, Treibholz), aus Ellipsoiden mit eigener Länge und Breite statt runder Kugeln. Alle sieben Kraterfelder neu und gröber: geschlossener Wall statt Perlenkette, dunkler Boden, große Krater mit Zentralberg, Auswurfdecke außen. Je Bild 1x und @2x. In der App: `sandbank: 7`, `kraterfeld: 7`. Flächen liegen dazu bei jedem zweiten Platz seitenverkehrt (`gespiegelt`, ruhendes `scale`, keine eigene Grafikebene).
- **Gleich verteilt:** Die Mischzahl `misch` in `kulisse.ts` mischt jetzt alle Eingaben gründlich. Vorher veränderte die Nummer der Frage nur abgeschnittene Bits: In der Grundszenerie hingen „ist eine Fläche“ und „welche Form“ zusammen, 57 von 69 Sandbänken hatten Form 1. Die Grundszenerie sieht dadurch anders aus, bleibt aber fest.

### 18.3 Noch mehr Dinge und Größen (Wunsch PV, 03.11.2026)

PV: „Mehr Abwechslung, noch mehr unterschiedliche Objekte würfelbar in mehr Größen.“

- **33 neue Dinge** (`tools/grafik/g16_mehr_dinge.py`, 73 Bilder mit Jahreszeiten):
  - Bastion: Wrack, Fischerboot, Steg, Seehundfelsen, Vogelfelsen, Felseninsel mit Kiefer.
  - Dorf: Windmühle, Scheune, Holzstapel, Bienenstöcke, Vogelscheuche, Karren (im Herbst mit Kürbissen), Pferd (grast).
  - Garten: Pavillon, Rosenbogen, kleines Gewächshaus, Vogelhaus, Sonnenuhr, Kürbisbeet.
  - Unterwasser: Wrack, Amphoren, Riesenmuschel, Korallenbogen, Säulenreste, Muschelbank.
  - Weltraum: Rover, Landekapsel, Solarfeld, Meteoritenkrater, Funkmast, Kristallfeld.
- **Größen:** Dinge 0,7–1,5-fach, Flächen 1,6–3,4-fach; kleine häufiger als große. Alles hängt am Szenerie-Startwert (§18.2).

## 19. Licht, Wasser und Leben an Gebäuden (Wunsch PV, 03.11.2026, Schritt 2 und 3)

- **Lichtschein am Abend:** Vor jedem Gebäude mit erleuchteten Fenstern liegt ein warmer, weicher Schein auf dem Boden (`fensterAbendSprite`, additive Mischung).
- **Rauch:** Aus Bergfried und Werkstatt (Bastion, Dorf, Garten) steigen ruhige Wölkchen aus der Dachspitze; bei Regen etwas, bei Sturm deutlich schräg und schneller; abends dunkler. Bei „ruhig“ kein Rauch.
- **Wasser:** An der Küste (§20) schwillt der Schaum langsam an und ab (bei Sturm schneller und breiter), darunter eine weiche Spiegelung der Inselwand im Wasser.
- Offen: wehende Fahnen (in die Gebäudebilder eingerechnet, dafür bräuchte es eigene Bilder je Bewegung), drehende Mühlenflügel, wandernde Schatten mit der Tageszeit.

## 20. Unförmige Insel (Wunsch PV, 03.11.2026)

PV: „Bäume stehen zum Teil im Wasser. Die Insel darf auch unförmig sein, wobei ein nicht bebaubarer Teil über das bisherige Viereck hinausgeht.“

- **Inselrand** (`grafik/insel-rand.ts`): Der Bauplatz bleibt das Viereck mit seiner Einfassung. Darum liegt eine freie Küstenlinie, 1,1 bis 3,4 Felder über die Einfassung hinaus. Die Buchten und Landzungen entstehen aus drei Wellen mit festen Phasen aus dem Szenerie-Startwert (§18.2), sind also mit „Neue Umgebung würfeln“ veränderbar. Bauen kann man dort nicht.
- **Gezeichnet in der Kulisse** (hinter der Bühne, wandert mit der Kamera; die Bühne hat nur 24 Bildpunkte Rand und würde ihn abschneiden): Strand (nur am Meer) mit Schaum an der echten Küste, Seitenwand, Oberfläche auf Höhe des Bauplatzes; Farben je Thema (`KulissenThema.insel`), Töne je Jahreszeit.
- **Bewuchs** (`inselBewuchs`): Bäume, Büsche, Sträucher, Steine bzw. Korallen aus dem Atlas, je Jahreszeit. Hohes nur auf der hinteren Hälfte, weil Vorderes hinter den Wänden der Bühne verschwände. Die Bäume der Bühne am Bauplatzrand stehen jetzt auf Land.
- **Kulisse-Dinge** halten Abstand zur Küste (Dinge knapp ein Feld, Flächen und die sechs Plätze am Bauplatz knapp zwei).

## 21. Scharf beim Zoomen (Wunsch PV, 03.11.2026, Schritt 1)

- **Ursache:** Die Bühne zeichnet bis zur vierfachen Auflösung, die Bilder lagen aber nur in doppelter Größe vor. Auf dem iPhone (dreifache Pixeldichte) wirkten sie schon ohne Zoom weich, bei 2,4-fachem Zoom deutlich unscharf.
- **Lösung:** `tools/grafik/g17_hd.py` rechnet dieselben Modelle mit `skala=2` noch einmal (doppelte Breite und Höhe, zweifache statt dreifache Kantenglättung) und legt `<datei>@2x.png` daneben, genau doppelt so groß wie das Original (unten bündig ausgerichtet). Betroffen: Gebäude aller Themen und Epochen, Umgebung (mit Jahreszeiten), alle Kulisse-Dinge. Nicht: Wesen, Bewohner, Boden, Himmel, Bänder.
- **App:** Das Manifest markiert solche Einträge mit `"hd": true`. `atlasDatei` nimmt bei Pixeldichte ab 1,5 die @2x-Datei; die logische Größe (`pixel`) bleibt, die Bühne rechnet unverändert. Die Kulisse nutzt `srcset` (1x/2x). Geladen wird nur das aktive Thema und nur auf Geräten, die es brauchen; der Atlas wächst im Repository von 7,7 auf 15 MB.
- **Laufzeit:** etwa zwei Stunden für alle 383 Aufträge (vier Prozesse). Der Lauf schreibt zuerst in einen Zwischenordner (`BASTION_HD_ZWISCHEN`) und kopiert am Ende.
- Test `tools/grafik/atlas-hd.test.ts`: jedes Gebäude hat ein @2x-Bild in doppelter Größe, jedes Kulisse-Ding hat eines (sonst wäre es auf dem Handy kaputt), niedrige Pixeldichte lädt weiter das kleine Bild.

## 22. Tiefe in der Ferne (Wunsch PV, 03.11.2026, Schritt 6)

- **Luftperspektive:** Dinge der Kulisse ab 8 Feldern Abstand vom Bauplatz werden mit wachsendem Abstand blasser (CSS-Variable `--dunst` 0 … 1, nur Deckkraft – seit §24 kein Filter mehr je Bild).
- **Dunst am Horizont:** Vom Horizont abwärts liegt ein weicher Schleier in der unteren Himmelsfarbe (`.ferne`), nachts schwächer.

## 23. Boden mit Leben (Wunsch PV, 03.11.2026, Schritt 7)

- Auf jedem freien Feld der Insel 1 bis 4 kleine Einzelheiten (`grafik/boden-leben.ts`), fest aus der Lage des Feldes: Grasbüschel; im Frühling viele Blüten (rosa, weiß, gelb, lila), im Sommer einzelne Blumen, im Herbst Laub am Boden, im Winter vereiste Büschel und Spuren im Schnee. Bebaute Felder (auch im Bau) bleiben frei; abends gedämpft. Nur über Land (Bastion, Dorf, Garten).

## 24. Kein Absturz beim Zoomen (Meldung PV, 03.11.2026)

- **Meldung:** Auf dem iPhone (Safari, Home-Bildschirm) stürzte die App nach ein paarmal Herein- und Herauszoomen ab.
- **Ursache:** Browser legen für animierte Teile eigene Grafikebenen an, und für alles, was darüber liegt, Sammelebenen. Liegen diese Ebenen in der Welt, die mit der Kamera vergrößert wird, rechnet der Browser sie in Zoom × Pixeldichte (bis 2,4 × 3). Zwölf ziehende Wolkenschatten, die schwellende Brandung und die Sammelebenen darüber brauchten herangezoomt rund **710 MB** Grafikspeicher. Dazu kamen alle Gebäude aller Stufen in HD (rund 76 MB statt 21 MB Texturen).
- **Lösung:**
  - Wolkenschatten und Nebelbänke liegen fest in der Welt und wandern nur mit der Kamera, sie ziehen nicht mehr selbst.
  - Die Brandung schwillt über die Strichdeckkraft in zehn Stufen je Durchlauf statt über eine Verschiebung. Das braucht keine eigene Ebene.
  - Kein Filter mehr an einzelnen Kulisse-Bildern. Abend und Nacht färbt eine einzige Tönung in Fenstergröße (`.abendton`), die Luftperspektive wirkt nur über die Deckkraft.
  - Die Bühne lädt alle Bilder zuerst in einfacher Größe. Scharfe @2x-Bilder lädt sie nur für die Einträge nach, die beim Zeichnen wirklich gebraucht werden (`TexturVorrat` merkt sich die IDs), und zeichnet dann einmal neu.
- **Nachgezogen (selbst optimiert, 03.11.2026):** Die Bühne glättet Kanten nur noch bei einfacher Auflösung (unter 2,5-fach). Bei 3-facher Pixeldichte zeichnet sie 4-fach, das Verkleinern glättet ohnehin, und die Glättung bräuchte einen vierfachen Bildpuffer (bei 3264 × 2544 Bildpunkten rund 100 MB). Im Vergleichsbild sieht man keinen Unterschied. Wesen, Bewohner und Statusgesten kommen aus einem Vorrat: je Figur ein Sprite, das nur Bild und Lage wechselt. Vorher entstanden 60-mal je Sekunde neue Objekte, die gleich wieder zerstört wurden.
- **Messung** (Chromium, 390 × 844, Pixeldichte 3, ganz herangezoomt, Ebenenfläche × Zoom²): vorher 178 MPx ≈ 710 MB in 52 Ebenen, nachher 60 MPx ≈ 238 MB in 38 Ebenen. Messwerkzeug: CDP `LayerTree` mit Playwright.

## 25. Wege und Tagesablauf der Bewohner (Wunsch PV, 03.11.2026, Punkt 4)

- **Wege:** Vom Feld vor dem Bergfried führt ein ausgetretener Pfad zu jedem Gebäude (nicht zu Mauerstücken und Flächen). Der Weg sucht den kürzesten Pfad über freie Felder und biegt dabei selten ab (`wegSuchen`: Schritt 1, Abbiegen 0,4), also ein gerader Pfad mit Knick statt einer Treppe. Gezeichnet wird ein durchgehendes Band (deckend, abends dunkler), im Winter festgetretener Schnee. Auf Wegfeldern wächst kein Boden-Leben (§23). Nur über Land.
- **Tagesablauf nach der Uhr** (`grafik/tagesablauf.ts`, rein, ohne Zufall):
  - Zuhause ist ein Feld vor dem Bergfried, die Arbeit das Feld vor dem eigenen Gebäude.
  - Ab 7:00 brechen die Bewohner auf, jeder 4 Minuten nach dem vorigen, und gehen den Weg zur Arbeit (1,6 s je Feld).
  - Tagsüber geht jeder alle 12 Minuten kurz zum Platz (Banner, sonst Mitte des Bauplatzes), bleibt 20 s und geht zurück.
  - Ab 18:00 gehen alle heim (je 5 Minuten versetzt), danach sind sie drinnen und werden nicht gezeichnet. Antippen geht dann auch nicht.
  - Gleiche Uhrzeit, gleiche Bauwerke → gleiches Bild.
- Mit „Bewegung reduzieren“ (ruhig) bleiben die Bewohner wie bisher aus. Es gibt weder Druck noch Belohnung: Der Ablauf zeigt nur, dass die Bastion bewohnt ist.

## 26. Wehende Fahnen (Wunsch PV, 03.11.2026)

- Die Fahnen sind in die Gebäudebilder eingerechnet. `tools/grafik/g18_fahnen.py` baut jedes Gebäude-Modell noch einmal auf, ohne zu rendern (Sekunden). Es merkt sich jeden Aufruf von `Szene.fahne` und rechnet die Ecken des Tuchs mit derselben Projektion wie `raum.rendern` in Bildpunkte um. Die Farbe kommt aus dem fertigen Bild (Mitte des Tuchs). Ist das Tuch dort verdeckt oder passt der Farbton nicht, bleibt die Fahne still.
- Das Manifest trägt je Eintrag `fahnen: [{x, y, b, s, h, farbe}]` (1x-Bildpunkte ab Fußpunkt). Die Höhenstreckung, die `modell` nach dem Aufbau anwendet (GRAFIK-SPRITES §13.2), rechnet das Werkzeug mit ein. Derzeit sind es 35 Fahnen in allen fünf Themen.
- Die Bühne legt über jedes solche Tuch ein gezeichnetes Tuch in sechs Streifen. Es wellt sich, zum freien Ende hin stärker, mit hellen und dunklen Falten. Bei Sturm weht es doppelt so schnell und stärker. Das gezeichnete Tuch ist etwas höher als die Welle ausschlägt, so bleibt das stille Tuch im Bild ganz verdeckt. Abends hat es dieselbe Tönung wie das Gebäude. Bei „ruhig“ bleibt das stille Tuch aus dem Bild.
- **Banner** (Fahnenmast, 04.11.2026): Das Tuch hängt senkrecht am Mast. `g18_fahnen.py` erfasst es über die Aufrufe von `fahnenmast` mit `haengt: true` und dem Wappen (Mitte, Halbmesser, Farbe aus dem Bild). Auf der Bühne bleibt es oben fest und schwingt unten sacht zur Seite, in Streifen mit Falten; das Wappen schwingt mit.
- Test `tools/grafik/atlas-fahnen.test.ts`: Jedes Tuch liegt im Bild und hat eine Farbe, das Banner trägt sein Wappen.

## 27. Drehende Mühlenflügel (Wunsch PV, 03.11.2026)

- Die Windmühle des Dorfs (Turm, Stufen 1–5) hatte ihre Flügel im Bild. `tools/grafik/g19_muehle.py` rechnet sie ohne Flügel (`dorf_turm(…, fluegel=False)`, gleiche Höhenstreckung), in einfacher und doppelter Größe, als `turm_s<k>_ohne.png`. Das Bild mit Flügeln bleibt für Vorschau und Bauliste.
- Das Manifest trägt am Mühlenbild `fluegel: {x, y, l, f, ohne}`: Nabe, Flügellänge in Feldern, Höhenstreckung, ID des Bildes ohne Flügel.
- Die Bühne tauscht das Bild und zeichnet vier Flügel in der Ebene der rechten Wand, mit derselben Projektion wie das Modell: Tuch von einem Viertel bis zum Ende, 0,24 Felder breit, Rute darüber, Nabe. Sie drehen einmal in zwölf Sekunden, bei Sturm schneller, und bei „ruhig“ stehen sie still wie im alten Bild. Nebenbei sind die Flügel jetzt ganz zu sehen; im Bild waren sie am Rand abgeschnitten.
- Reihenfolge beim Neurechnen: `g12_atlas.py`, dann `g17_hd.py`, dann `g18_fahnen.py` und `g19_muehle.py`.
- Test `tools/grafik/atlas-muehle.test.ts`.

## 28. Bauen als kleines Schauspiel (Wunsch PV, 03.11.2026, Punkt 5)

- **Baustelle:** Neben jedem laufenden Bauvorhaben steht hinten rechts ein hölzerner Kran (Mast mit Streben, Ausleger mit Gegengewicht, Spannseile). Der Ausleger schwenkt langsam über die Baustelle, am Seil hebt und senkt sich ein Steinblock. Auf dem Gerüst (§10, wächst mit den Bauschritten) arbeitet ab der ersten fertigen Ebene jemand mit dem Hammer, ab vier Ebenen zwei. Alles ist im Code gezeichnet, nur über Land. Bei „ruhig“ steht alles still. Am Fortschritt ändert das nichts, es ist nur Bild.
- **Kamerafahrt beim Epochenwechsel** (`grafik/kamerafahrt.ts`, Bauplatz): Erreicht die Bastion eine neue Epoche, fährt die Kamera beim nächsten Blick auf den Bauplatz einmal in etwa vier Sekunden vom Bergfried (Zoom 1,9) auf das ganze, gewachsene Bild. Sie fährt weich an und hält weich an, der Zoom ändert sich gleichmäßig im Verhältnis. Ein Tipper oder das Mausrad bricht ab und springt ans Ende. Bei „Bewegung reduzieren“ (ruhig oder System) gibt es keine Fahrt.
  - Gemerkt wird die höchste Epoche, deren Fahrt lief: Einstellung `basebau.kamerafahrt`, ein Ereignis wie die Kamera.
  - Fehlt der Wert (erste Nutzung oder Update), merkt sich die App die jetzige Epoche ohne Fahrt.
  - Kein Timer und kein Druck: Die Fahrt zeigt nur, dass der Platz gewachsen ist.

## 29. Takt der Bühne (Q-G1, PR 1, 05.11.2026)

- **Befund:** Der Pixi-Ticker lief immer mit 60 Bildern je Sekunde, auch bei „Bewegung reduzieren“: Dort nahm die Bühne nur ihren eigenen Rückruf vom Ticker, PixiJS zeichnete das unveränderte Bild trotzdem 60-mal je Sekunde neu (bei dreifacher Pixeldichte 3264 × 2544 Bildpunkte). Beim Zoomen und Schwenken kam dieselbe Arbeit dazu, obwohl die Kamera das fertige Bild nur per CSS-Transform verschiebt und vergrößert.
- **Regel** (`atmosphaere.ts`, `taktFuer`, rein mit Test): Der Takt ist 0, wenn Bewegung aus ist („ruhig“ oder System-Ruhe), wenn die Kamera sich bewegt (Geste oder Kamerafahrt, bis `KAMERA_RUHE_MS` = 150 ms nach der letzten Änderung) oder wenn es nichts zu bewegen gibt (keine Wesen, Bewohner, Wolken, Partikel, Fahnen, Mühlen, Baustellen, Rauch, kein Aufstellen, kein Sturm). Sonst `TAKT_HZ` = 30: Sprites mit zwei bis vier Bildern je Zyklus, ziehende Wolken und wehende Fahnen brauchen keine 60 Bilder (§4.5: „wenn knapp, 30 fps anpeilen“).
- **Bühne** (`grafik-buehne.ts`): `autoStart: false`; `taktSync` startet und stoppt den Pixi-Ticker (mit `app.render` daran) nach der Regel und setzt `maxFPS`. Steht der Takt, zeichnet `bildAnfordern` beim nächsten Browser-Bild ein Einzelbild, sobald sich etwas ändert (`zeichne`, Auswahl, Bewegung umgeschaltet, Tippen auf Wesen oder Bewohner, scharfe Bilder nachgeladen). Der Ticker prüft am Ende jedes Durchlaufs, ob noch etwas in Bewegung ist (etwa das Aufstellen vorbei), und hält sonst an. `Bauplatz.svelte` meldet jede Kamera-Änderung an `setzeKameraBewegt`.
- **Nicht abschaltbar:** Pixis `SchedulerSystem` hängt an `Ticker.system` (geschützt) und läuft mit 60 Hz weiter, rund 0,2 ms je Bild. Das Ereignis-System (`renderer.events`) ist im Build nicht registriert; der Versuch, es abzuhängen, lässt die Bühne leer (Lehre in `docs/session/GRAFIK.md`).
- **Messung** mit `pnpm tempo` (`tools/grafik/tempo.ts`, Beschreibung in `tools/README.md`): Chromium ohne Grafikkarte, 390 × 844 bei Pixeldichte 3, CPU ÷4, je Phase 6 s. Die Bühne wird über die Chrome-Ablaufverfolgung beobachtet: Bilder/s = gezeigte Bilder, Takt/s = Durchläufe des Pixi-Tickers, Hauptfaden und GPU = belegte Zeit, Hänger = über 100 ms ohne Bild, Ebenen wie §24. Ohne Grafikkarte kostet jedes neue Pixi-Bild den Hauptfaden rund 250 ms („Commit“, Kopie des Canvas); darum ist der Hauptfaden hier voll, sobald die Bühne zeichnet, und der Takt kommt nicht über 8 bis 11 je Sekunde. Die Zahlen taugen zum Vergleich, nicht als Maß für das iPhone (der PV misst dort, Q-G0).

- **Zahlen vorher → nachher** (Chromium, 390 × 844, Pixeldichte 3, je Phase 6 s; vorher = `main` vom 05.11.2026 mit demselben Werkzeug):

  | Lage | Phase | Bilder/s | Takt/s | ms je Takt | Hauptfaden | GPU | Hänger | Ebenen |
  |---|---|---|---|---|---|---|---|---|
  | CPU ÷4, Bewegung voll | Ruhe | 59,9 → 59,1 | 8,4 → 7,1 | 3,5 → 2,3 | 100 % → 100 % | 71 % → 78 % | 0 → 0 | 45 MB → 45 MB |
  | | Zoomen | 59,9 → 60,0 | 8,4 → 14,1 | 1,9 → 0,9 | 100 % → 99 % | 71 % → 66 % | 0 → 0 | 35 MB → 37 MB |
  | | Schwenken | 60,0 → 57,7 | 8,5 → 20,5 | 1,9 → 0,5 | 100 % → 95 % | 71 % → 67 % | 0 → 1 | 33 MB → 38 MB |
  | | Herangezoomt | 14,4 → 22,1 | 8,6 → 12,4 | 1,8 → 1,1 | 100 % → 97 % | 71 % → 70 % | 49 → 21 | 106 MB → 105 MB |
  | CPU ÷1, Bewegung voll | Ruhe | 58,6 → 56,8 | 9,7 → 10,1 | 0,8 → 0,8 | 100 % → 100 % | 91 % → 92 % | 0 → 1 | 45 MB → 45 MB |
  | | Zoomen | 60,0 → 60,2 | 10,0 → 20,5 | 0,7 → 0,2 | 100 % → 95 % | 90 % → 81 % | 0 → 0 | 33 MB → 33 MB |
  | | Schwenken | 60,0 → 60,1 | 9,9 → 28,1 | 0,5 → 0,1 | 100 % → 89 % | 90 % → 77 % | 0 → 0 | 32 MB → 37 MB |
  | | Herangezoomt | 13,7 → 60,0 | 10,3 → 13,5 | 0,5 → 0,6 | 100 % → 98 % | 90 % → 87 % | 58 → 0 | 98 MB → 130 MB |
  | CPU ÷4, Bewegung reduzieren | Ruhe | 4,1 → 0,0 | 8,3 → 60,0 | 1,1 → 0,3 | **100 % → 6 %** | **79 % → 0 %** | 24 → 0 | 16 MB → 16 MB |
  | | Zoomen | 5,2 → 8,0 | 7,4 → 9,2 | 0,7 → 1,4 | 100 % → 99 % | 75 % → 72 % | 24 → 19 | 84 MB → 65 MB |
  | | Schwenken | 5,0 → 6,4 | 7,0 → 10,2 | 0,9 → 1,1 | 100 % → 99 % | 75 % → 70 % | 24 → 22 | 16 MB → 16 MB |
  | | Herangezoomt | 4,8 → 4,5 | 7,5 → 33,4 | 0,8 → 0,4 | 100 % → 56 % | 78 % → 39 % | 50 → 20 | 63 MB → 63 MB |

  Lesart: „Takt/s“ zählt alle Animationsbilder des Hauptfadens; nachher sind das beim Zoomen und Schwenken Pixis Scheduler und das Einzelbild (billig, 0,1 bis 0,9 ms), vorher die Durchläufe der Bühne (1,9 bis 3,5 ms samt Canvas-Kopie). Bei „Bewegung reduzieren“ ist die Bühne in Ruhe jetzt still (0 Bilder, Hauptfaden 6 %, GPU 0 %), vorher zeichnete sie weiter. Herangezoomt zeigt Chromium jetzt 22 statt 14 Bilder je Sekunde (ungedrosselt 60 statt 14) mit weniger Hängern. In Ruhe mit Bewegung ändert sich in Chromium ohne Grafikkarte nichts: Der Hauptfaden ist dort schon mit 7 bis 10 Bildern je Sekunde voll, die Grenze von 30 greift erst auf einem Gerät mit Grafikkarte (iPhone: halbe Arbeit für den Grafikprozessor, Messung durch den PV). Beim Zoomen und Schwenken bleibt der Hauptfaden mit 95 bis 99 % voll, obwohl die Bühne steht: Das ist die Kulisse (`Kulisse.svelte`, rund 70 Commits in 4 s), der nächste Punkt in Q-G1.

## 30. Kulisse beim Zoomen nicht je Schritt neu ausrichten (Q-G1, PR 2, 06.11.2026)

- **Befund (Messung aus PR 1):** Mit stehender Bühne blieb der Hauptfaden beim Zoomen und Schwenken zu 92 bis 96 % belegt. Ursache war die Kulisse: Bei jeder Kamera-Änderung setzte `Kulisse.svelte` den Himmel-Verlauf des Fensters (Wasserlinie als Farbstopp), das Meer (`background-size` und `background-position` je Zoom), Horizont, Dunst, Luftperspektive, Sterne, Wolken, ferne Segel und den Abendton neu – jedes davon in Fenstergröße, also je Schritt zwei bis drei fensterfüllende Neuzeichnungen plus Layout; dazu wurden die rund 100 Dinge je Schritt neu auf Sichtbarkeit geprüft, und am Rand entstanden und verschwanden Bilder.
- **Grundsatz:** Nur noch **zwei Transforms** ändern sich mit der Kamera – die der Welt (Insel, Meer, Dinge, 1:1) und die der fernen Schicht (Horizont, Sterne, Wolken: Parallaxe ein Viertel, Höhe und Maßstab aus `kulissenLage`). Alles, was darin liegt, behält seine Koordinaten; der Browser verschiebt und vergrößert fertige Ebenen.
  - **Himmel:** Der Fenster-Verlauf hat keinen Farbstopp an der Wasserlinie mehr (`himmel[0]` → `himmel[1]` bei 40 %, dann einfarbig). Unter der Wasserlinie decken Meerfläche und Bänder.
  - **Meer in der Welt:** `meer-grund` (Farbe des Grunds) und darauf die Wellenkachel in Bühnen-Bildpunkten, ab 60 Bildpunkten unter der Horizontlinie; die Wellen ziehen als `background-position` in 128 Stufen je 40 s (keine eigene Ebene, gut dreimal je Sekunde ein kleines Neuzeichnen).
  - **Ferne Schicht** (`.fern`, Ursprung auf der Horizontlinie, Einheit = Band-Bildpunkte): Horizont-Band ohne Zoom-Skalierung je Schritt, Sterne (Kachel `STERNE / HORIZONT_SKALA`, bei Zoom 1 wie vorher), Wolken und ferne Segel an festen Stellen (statt in Prozent der Fensterbreite), Regenbogen.
  - **Gleichförmige Bänder** (Wasser unter der Linie, Dunst, Luftperspektive, Abendton) liegen in der Welt-Ebene, Lage und Länge aus der Cull-Kamera umgerechnet: Sie sind waagrecht ohne Struktur, darum fällt die fehlende Parallaxe nicht auf, und der Zoom-Drift zwischen zwei Sprüngen (höchstens 10 %) auch nicht.
- **Culling mit Abstand** (`kulisse.ts`: `cullKamera`, `cullRand`, Tests): Sichtbarkeit der Dinge und Lage der Ebenen folgen einer **Cull-Kamera**, die der echten erst nach einem Achtel Fenster Verschiebung oder 10 % Zoom nachspringt. Dazwischen ändert sich im Baum nichts.
- **Sichtkasten statt großer Flächen (§24 beachtet):** Welt und Ferne halten je **eine** Ebene (`.sicht`, `will-change: transform`, `overflow: clip`): Fenster plus Rand (`cullRand` = ein Achtel plus 160 px), in Welt- bzw. Band-Koordinaten über einen `versatz` so gelegt, dass die Kinder ihre Koordinaten behalten. Beim Cull-Sprung wandern Kasten und Versatz, einmal Layout und Neuzeichnen von etwa 1,3 Fensterflächen. Ein erster Versuch mit großen Flächen (Meer 7 Bühnenbreiten, Bänder 6 144 px) trieb den Ebenenspeicher nach der §24-Rechnung auf 1 bis 6 GB – darum der Kasten.
- **Bühne:** Beim Anhalten für eine Kamera-Geste fordert `taktSync` kein Einzelbild mehr an (nichts hat sich geändert); vorher gab es bei jedem Umschalten ein Bild.
- **Zahlen vorher → nachher** (`pnpm tempo`, Chromium ohne Grafikkarte, 390 × 844, Pixeldichte 3, CPU ÷4, je Phase 6 s; vorher = `main` nach PR 1):

  | Lage | Phase | Bilder/s | Takt/s | Hauptfaden | GPU | Hänger | Ebenen | Ebenenspeicher (§24-Rechnung) |
  |---|---|---|---|---|---|---|---|---|
  | Bewegung voll | Ruhe | 59,6 → 58,8 | 7,2 → 7,6 | 100 % → 100 % | 77 % → 76 % | 0 → 0 | 21 → 28 | 45 MB → 144 MB |
  | | Zoomen | 60,2 → 60,2 | 21,9 → 47,1 | **92 % → 66 %** | **55 % → 16 %** | 0 → 0 | 16 → 28 | 31 MB → 159 MB |
  | | Schwenken | 60,0 → 58,5 | 18,9 → 49,9 | **96 % → 68 %** | **65 % → 13 %** | 0 → 0 | 16 → 28 | 31 MB → 162 MB |
  | | Herangezoomt | 20,1 → 59,9 | 10,2 → 14,6 | 100 % → 94 % | 74 % → 63 % | 28 → 0 | 16 → 27 | 89 MB → 179 MB |
  | Bewegung reduzieren | Ruhe | 0 → 0 | 60 → 60 | 5 % → 4 % | 0 % → 0 % | 0 → 0 | 4 → 8 | 16 MB → 105 MB |
  | | Zoomen | 23,1 → 24,9 | 45,0 → 59,2 | **67 % → 50 %** | 18 % → 0 % | 5 → 3 | 4 → 8 | 16 MB → 106 MB |
  | | Schwenken | 7,2 → 32,1 | 11,4 → 57,3 | **100 % → 54 %** | 70 % → 0 % | 23 → 1 | 4 → 8 | 16 MB → 106 MB |
  | | Herangezoomt | 4,9 → 4,8 | 35,6 → 59,9 | **53 % → 14 %** | 36 % → 0 % | 18 → 0 | 6 → 8 | 63 MB → 150 MB |

  Lesart: Zoomen und Schwenken kosten den Hauptfaden ein Drittel weniger und den GPU-Prozess fast nichts mehr; mit „Bewegung reduzieren“ fällt das Schwenken von 100 % auf 54 %. Was bleibt (50 bis 68 %), ist das Zeichnen der Welt-Ebene bei jedem Cull-Sprung und die Wetterschicht. Der **Ebenenspeicher nach der §24-Rechnung** (Ebenenfläche × Maßstab², vier Byte je Bildpunkt) steigt, weil Welt und Ferne jetzt je eine eigene Ebene von Fenster plus Rand halten (je rund 11 MPx bei Pixeldichte 3). Die Rechnung zählt die volle Fläche; Browser kacheln solche Ebenen und halten nur die sichtbaren Kacheln. Er bleibt unter den 238 MB, die nach §24 auf dem iPhone sicher waren (vor dem Absturz-Fix 710 MB). **Der PV prüft am iPhone 13, ob mehrfaches Herein- und Herauszoomen stabil bleibt** (die Probe aus §24); falls nicht, ist `cullRand` die Stellschraube (kleinerer Rand, kleinere Ebenen, dafür öfter ein Sprung).
- **Sichtbare Änderungen:** Die Wellenkachel beginnt 60 Bühnen-Bildpunkte unter der Horizontlinie, davor liegt ruhiges Wasser in der Farbe des Grunds; Wolken und ferne Segel stehen an festen Stellen der Ferne (Parallaxe ein Viertel statt 0,15 bzw. 0,2); Sterne skalieren leicht mit dem Zoom. Fotos vorher/nachher waren bis auf die Segel-Plätze deckungsgleich.

## 31. Fahnen, Mühlen, Bewohner und Wesen im gemeinsamen Takt (Q-G1, PR 3, 06.11.2026)

- **Befund:** Der Takt lief seit §29 mit höchstens 30 Hz, aber in jedem Durchlauf bauten `fahnenWehen`, `muehlenDrehen` und `bewohnerZeichnen` ihre Grafiken neu auf (`clear()` und neue Vielecke, die PixiJS danach neu zerlegt und hochlädt): jede Fahne und jedes Banner in sechs Streifen, die vier Mühlenflügel und über jedem Bewohner die Statusgeste. Wesen und Bewohner setzten ihre Größe über `width`/`height`, das jedes Mal die Grenzen ausmisst.
- **Vorberechnete Bilder** (`takt.ts`: `bilderJeUmlauf`, `phasenStufe`, `stufenPhase`, `BildVorrat`, Tests): Fahne, Banner und Mühle bewegen sich gleichförmig. Die Phase wird auf so viele Stufen je Umlauf gerundet, wie bei 30 Hz Takt-Schritte hineinpassen (Fahne 45, bei Sturm 20; Banner 118; Mühle 90 für eine Vierteldrehung, weil vier gleiche Flügel nach einer Vierteldrehung gleich aussehen). Jede Stufe wird beim ersten Gebrauch einmal als `GraphicsContext` gezeichnet, mit dem Ursprung an der Ecke des Tuchs bzw. an der Nabe, und liegt im Vorrat; gleich große Tücher teilen sich die Bilder. Im Takt tauscht die Bühne nur, welches Bild das Tuch zeigt (`g.context`), und setzt die Lage. Die Statusgesten liegen je Tätigkeit einmal im Vorrat und werden nur verschoben. Wesen und Bewohner setzen den Maßstab direkt. Das Aussehen bleibt gleich: Bei 30 Bildern je Sekunde zeigte das Neuzeichnen auch nicht mehr Zwischenstufen.
- **Gemeinsamer Takt** (`taktSchritt`, `taktZeit`): Fahnen, Mühlen und Kräne sehen dieselbe, auf 30 Hz gerundete Zeit und rücken höchstens einmal je Takt-Schritt weiter, auch wenn Pixi den Ticker öfter ruft.
- **Nichts außerhalb des Sichtfelds** (`sichtfeldAus`, `imSichtfeld`): `Bauplatz.svelte` meldet der Bühne das Sichtfeld (Fenster plus `cullRand`, in Bühnen-Bildpunkten) nur, wenn die Cull-Kamera aus §30 springt, nicht je Zoom-Schritt. Der Rand ist größer als der Sprung, darum liegt alles im Fenster immer im Sichtfeld. Fahnen, Mühlen, Kräne, Wesen und Bewohner außerhalb behalten ihr letztes Bild (nicht ausblenden: Beim Schwenken zeigt der Browser das alte Bild der Bühne weiter). Stehen Fahnen, Mühlen und Kräne nur außerhalb und bewegt sich sonst nichts, hält der Takt an (`hatBewegung`). Wesen und Bewohner zählen weiter als Bewegung, weil sie ins Bild laufen können.
- **„Bewegung reduzieren“ und R1–R7:** unverändert. Bei „ruhig“ gibt es keine Fahnen-Tücher, Wesen und Bewohner; die Mühle zeigt ihr Standbild (Stufe 0). Der Takt zählt nur Bilder, er ist kein Spieltimer; nichts verfällt.
- **Messwerkzeug:** `pnpm tempo --reich` baut vor der Messung eine gewachsene Bastion (Bergfried Stufe 3, Banner, Späherturm Stufe 2, Tor, Studierstube, Garten; Vorrat wie im Browser-Test „Bastion als Liste“). Die frische Bastion hat keine Fahne, dort sieht man nur Wesen, Bewohner und Statusgeste. `--foto` legt ein Bildschirmfoto ab.
- **Zahlen vorher → nachher** (`pnpm tempo`, Chromium ohne Grafikkarte, 390 × 844, Pixeldichte 3, CPU ÷4, je Phase 6 s; vorher = Stand #290; Median aus drei Läufen im Wechsel, „Bewegung reduzieren“ je ein Lauf):

  | Lage | Phase | Bilder/s | Takt/s | ms je Takt | Hauptfaden | GPU | Hänger | Ebenenspeicher (§24-Rechnung) |
  |---|---|---|---|---|---|---|---|---|
  | frisch | Ruhe | 54,8 → 52,2 | 2,8 → 2,1 | **13,7 → 11,2** | 100 % → 99 % | 73 % → 71 % | 1 → 2 | 191 MB → 191 MB |
  | | Zoomen | 54,2 → 50,5 | 6,4 → 5,8 | 3,7 → 3,5 | 99 % → 99 % | 50 % → 59 % | 2 → 5 | 200 MB → 208 MB |
  | | Schwenken | 55,5 → 51,9 | 7,7 → 7,1 | **3,1 → 1,7** | 98 % → 98 % | 47 % → 57 % | 1 → 3 | 199 MB → 204 MB |
  | | Herangezoomt | 54,1 → 53,6 | 7,1 → 6,5 | 3,8 → 3,4 | 99 % → 98 % | 59 % → 65 % | 3 → 6 | 222 MB → 219 MB |
  | gewachsen (`--reich`) | Ruhe | 57,9 → 56,0 | 1,3 → 1,6 | **14,9 → 8,5** | 99 % → 99 % | 83 % → 82 % | 0 → 1 | 179 MB → 181 MB |
  | | Zoomen | 54,5 → 56,5 | 2,6 → 1,7 | **7,5 → 5,7** | 100 % → 100 % | 82 % → 76 % | 4 → 1 | 191 MB → 196 MB |
  | | Schwenken | 55,9 → 56,9 | 2,5 → 2,7 | **6,5 → 3,0** | 100 % → 99 % | 70 % → 73 % | 2 → 0 | 192 MB → 186 MB |
  | | Herangezoomt | 54,1 → 54,6 | 4,4 → 4,7 | 3,8 → 3,1 | 99 % → 99 % | 71 % → 69 % | 4 → 4 | 210 MB → 217 MB |
  | frisch, ruhig | Ruhe | 0 → 0 | 59,9 → 59,8 | 0,3 → 0,3 | 8 % → 7 % | 0 % → 0 % | 0 → 0 | 149 MB → 149 MB |
  | | Zoomen | 25,5 → 22,4 | 41,1 → 35,3 | 0,7 → 1,0 | 75 % → 81 % | 0 % → 0 % | 5 → 8 | 154 MB → 150 MB |
  | | Schwenken | 29,6 → 23,5 | 50,5 → 42,1 | 0,5 → 0,6 | 66 % → 74 % | 0 % → 0 % | 8 → 13 | 154 MB → 150 MB |
  | | Herangezoomt | 4,6 → 5,4 | 57,9 → 55,5 | 0,6 → 0,4 | 20 % → 25 % | 0 % → 0 % | 0 → 1 | 207 MB → 194 MB |
  | gewachsen, ruhig | Ruhe | 0 → 0 | 59,9 → 59,4 | 0,4 → 0,3 | 9 % → 8 % | 0 % → 0 % | 0 → 0 | 148 MB → 148 MB |
  | | Zoomen | 18,1 → 16,5 | 32,9 → 30,1 | 1,5 → 1,5 | 82 % → 85 % | 0 % → 0 % | 11 → 17 | 151 MB → 151 MB |
  | | Schwenken | 21,6 → 21,2 | 39,7 → 38,8 | 1,0 → 1,1 | 75 % → 76 % | 0 % → 0 % | 16 → 16 | 151 MB → 151 MB |
  | | Herangezoomt | 4,9 → 5,5 | 55,0 → 53,7 | 0,4 → 0,5 | 23 % → 26 % | 0 % → 0 % | 1 → 0 | 215 MB → 215 MB |

  Lesart: Was dieser PR spart, steht in **„ms je Takt“**, der Zeit eines Durchlaufs im Hauptfaden (Rückruf der Bühne plus Pixis Zeichnen): in der gewachsenen Bastion in Ruhe 14,9 → 8,5 ms (rund 40 % weniger), nach dem Schwenken 6,5 → 3,0 ms; in der frischen Bastion (nur Statusgeste und Wesen) 13,7 → 11,2 ms. Bilder/s, Hauptfaden und GPU bewegen sich in Chromium ohne Grafikkarte kaum: Dort kostet jedes neue Bild der Bühne den Hauptfaden rund 250 ms für die Kopie des Canvas (§29), der Takt kommt nur auf 1 bis 8 Durchläufe je Sekunde, und die Läufe streuen stark (einzelne Läufe vorher 41 ms je Takt). Auf dem iPhone fällt die Kopie weg; dort ist der Durchlauf selbst die Arbeit, und der Grafikprozessor bekommt fertige Bilder statt neuer Geometrie. Bei „Bewegung reduzieren“ ändert sich nichts (keine Tücher, Wesen und Bewohner), die Unterschiede dort liegen in der Streuung. Der **Ebenenspeicher** ändert sich durch diesen PR nicht (keine neuen Ebenen); er liegt heute bei Regen höher als in §30 (frisch 191 bis 236 MB, Höchstwert in einem Vorher-Lauf herangezoomt), knapp unter den 238 MB aus §24 – ein Thema für PR 4 (HD-Bilder nur im Sichtfeld).
- **Aussehen:** Fotos vorher/nachher (390 × 844, frisch und gewachsen, voll und herangezoomt, ruhig) sind gleich; Fahnen, Banner mit Wappen und Statusgesten stehen an derselben Stelle, nur die Phase der Bewegung und die Wege der Wesen unterscheiden sich je nach Zeitpunkt des Fotos.

## 32. Ebenenspeicher senken (Q-G1, PR 4, 06.11.2026)

- **Befund** (`pnpm tempo --wetter regen --ebenen`, nennt je Ebene Element, Größe, Maßstab und den Grund, warum der Browser sie anlegt): Bei Regen lag der Ebenenspeicher nach der §24-Rechnung bei 191 bis 242 MB, herangezoomt einmal über den 238 MB aus §24. Der Speicher lag **nicht in den Pixi-Texturen**, sondern in den Ebenen des Browsers:
  - die zwei Sichtkästen aus §30 (Welt und Ferne) mit je rund 43 MB: Fenster plus `cullRand` (ein Achtel der längeren Seite plus 160 px) auf jeder Seite, also rund 920 × 1 375 Bildpunkte bei dreifacher Pixeldichte – auch dort, wo in der Ebene nichts liegt (über der Wasserlinie in der Welt, unter dem Horizont-Band in der Ferne);
  - eine **Sammelebene** über Dingen der Kulisse (24 bis 41 MB, Grund `Overlap`): Die Tropfenringe im Meer schwellen als eigene Ebenen; alles, was danach gezeichnet wird und sie überdeckt, muss der Browser darüber in eine eigene Ebene legen;
  - die zwei Regen-Ebenen mit je 16 MB (Fenster plus zwei Kacheln hoch) und die Wetterschicht selbst (11 MB).
- **Sichtkasten knapp** (`kulisse.ts`: `sichtRand`, `cullKamera`, `sichtKasten`, Tests): Rand je Achse ein Achtel des Fensters plus 24 px statt ein Achtel der längeren Seite plus 160 px. Die Cull-Kamera springt jetzt, wenn das Fenster dem Rand des Kastens bis auf 8 px nahekommt oder um 10 % gezoomt wurde (vorher: nach festen Schritten). So reicht der kleine Rand auch, wenn Zoomen und Schieben zusammenkommen; ein Test spielt 2 000 solcher Gesten durch und prüft, dass das Fenster immer im Kasten liegt. Welche Dinge ins Bild kommen und wo Figuren weiterlaufen, richtet sich weiter nach dem großen `cullRand`.
- **Kasten nur, wo etwas liegt:** Der Welt-Kasten endet oben über der Wasserlinie, so hoch wie das höchste Ding (Bilder sind höchstens so hoch wie breit); der Fern-Kasten endet unten mit dem Horizont-Band. Herangezoomt liegt die Ferne ganz über dem Fenster und bekommt keine Ebene mehr.
- **Tropfenringe zuletzt:** Sie liegen im Welt-Kasten nach allen Dingen und Bändern; darüber liegt nichts mehr, also keine Sammelebene. Weil sie dadurch über dem Abendton liegen, steckt dessen Tönung in ihrer Farbe (Ton · α + Ringfarbe · (1 − α), gleiches Bild).
- **Wetter-Ebenen** (`wetter-schicht.ts`, `abschnitte`, Test): Eine Ebene muss so weit über das Fenster ragen, wie sie in einem Durchlauf zieht. Senkrechter Regen zieht jetzt eine Kachel in der halben Zeit statt zwei (gleiches Tempo, gleiches Bild). Sturm (drei Kacheln, schräg) und Schnee (zwei Kacheln, schräg) laufen in drei bzw. zwei Abschnitten: Nach jedem springt die Ebene eine Kachel nach oben; das Muster wiederholt sich je Kachel, darum sieht man den Sprung nicht (`fallen-2`, `fallen-3` in `Wetterschicht.svelte`). Alle Ebenen ragen nur noch eine Kachel nach oben und nur auf der Seite seitlich über, von der die Kachel hereinzieht (vorher auf beiden): Regen 390 × 1 024 statt 390 × 1 204, Sturm 570 × 1 024 statt 750 × 1 384, Schnee 590 × 1 044 statt 790 × 1 244 Bildpunkte.
- **Nicht geändert:** Die Pixi-Texturen (`TexturVorrat`) laden HD schon nur für Gezeichnetes (§24) und zählen nicht zum Ebenenspeicher. Die Bühne (Canvas) zählt nach der §24-Rechnung herangezoomt 60 MB (Fläche × Maßstab²); ihr Bildpuffer ist fest 3 264 × 2 544 Bildpunkte (rund 33 MB), der Browser vergrößert ihn nur. Ihre Auflösung zu senken, würde das Bild ändern.
- **Messwerkzeug:** `pnpm tempo --wetter regen` stellt die Wetter-Probe aus dem Zahnrad ein, `--ebenen` listet die größten Ebenen. Das Werkzeug beendet den Vorschau-Server jetzt mit der ganzen Prozessgruppe und bricht ab, wenn der Port schon belegt ist – vorher lief Vite nach einem Lauf weiter, und der nächste Lauf maß still den Build des alten Servers.

- **Zahlen vorher → nachher** (`pnpm tempo --wetter …`, Chromium ohne Grafikkarte, 390 × 844, Pixeldichte 3, CPU ÷4, je Phase 6 s; vorher = Stand #292/#293; Regen und klar Median aus drei Läufen im Wechsel vorher/nachher, ruhig, Sturm und Schnee je ein Lauf; Ebenenspeicher nach der §24-Rechnung):

  | Lage | Phase | Bilder/s | Takt/s | ms je Takt | Hauptfaden | GPU | Hänger | Ebenen | Ebenenspeicher |
  |---|---|---|---|---|---|---|---|---|---|
  | Regen, frisch | Ruhe | 56,5 → 59,2 | 2,6 → 3,0 | 4,9 → 6,5 | 100 % → 99 % | 83 % → 81 % | 1 → 0 | 58 → 49 | 191 MB → 88 MB |
  | | Zoomen | 56,6 → 58,5 | 8,7 → 11,3 | 2,2 → 1,7 | 98 % → 98 % | 50 % → 55 % | 1 → 0 | 58 → 38 | 191 MB → 88 MB |
  | | Schwenken | 58,1 → 57,8 | 14,2 → 15,3 | 1,3 → 1,0 | 99 % → 95 % | 35 % → 45 % | 1 → 0 | 57 → 38 | 195 MB → 88 MB |
  | | Herangezoomt | 56,5 → 57,3 | 7,5 → 8,6 | 2,4 → 2,1 | 98 % → 98 % | 69 % → 67 % | 2 → 0 | 48 → 37 | 216 MB → 137 MB |
  | Regen, gewachsen (`--reich`) | Ruhe | 50,6 → 58,9 | 1,4 → 1,3 | 10,4 → 6,6 | 100 % → 100 % | 84 % → 82 % | 3 → 0 | 60 → 49 | 182 MB → 86 MB |
  | | Zoomen | 54,7 → 59,6 | 2,4 → 2,4 | 4,6 → 4,6 | 100 % → 100 % | 81 % → 80 % | 1 → 0 | 57 → 49 | 191 MB → 89 MB |
  | | Schwenken | 55,5 → 58,8 | 2,9 → 5,1 | 3,2 → 1,3 | 99 % → 99 % | 56 % → 66 % | 0 → 0 | 57 → 49 | 192 MB → 88 MB |
  | | Herangezoomt | 57,4 → 57,9 | 4,4 → 5,9 | 2,4 → 1,9 | 99 % → 99 % | 72 % → 69 % | 1 → 2 | 51 → 37 | 217 MB → 132 MB |
  | klar, frisch | Ruhe | 58,7 → 58,8 | 3,5 → 3,8 | 4,6 → 3,7 | 100 % → 100 % | 84 % → 83 % | 0 → 0 | 28 → 28 | 115 MB → 49 MB |
  | | Zoomen | 60,2 → 60,2 | 23,0 → 30,5 | 0,9 → 0,7 | 94 % → 86 % | 35 % → 32 % | 0 → 0 | 28 → 17 | 118 MB → 49 MB |
  | | Schwenken | 58,7 → 58,4 | 31,4 → 39,4 | 0,6 → 0,4 | 90 % → 81 % | 31 % → 23 % | 1 → 0 | 28 → 17 | 118 MB → 49 MB |
  | | Herangezoomt | 36,4 → 24,6 | 9,5 → 11,7 | 2,0 → 1,1 | 98 % → 95 % | 69 % → 71 % | 6 → 11 | 26 → 16 | 132 MB → 97 MB |
  | Regen, ruhig | Ruhe | 0,0 → 0,0 | 60,1 → 59,9 | 0,2 → 0,2 | 6 % → 5 % | 0 % → 0 % | 0 → 0 | 11 → 11 | 149 MB → 81 MB |
  | | Zoomen | 26,9 → 24,1 | 46,8 → 47,4 | 0,4 → 0,4 | 68 % → 66 % | 0 % → 0 % | 5 → 5 | 11 → 11 | 151 MB → 81 MB |
  | | Schwenken | 33,7 → 34,5 | 51,4 → 51,6 | 0,3 → 0,3 | 64 % → 59 % | 0 % → 0 % | 3 → 7 | 11 → 11 | 151 MB → 80 MB |
  | | Herangezoomt | 5,1 → 4,9 | 59,3 → 59,0 | 0,2 → 0,3 | 15 % → 19 % | 0 % → 0 % | 0 → 0 | 11 → 10 | 204 MB → 122 MB |
  | Sturm, frisch | Ruhe | 59,6 → 59,0 | 5,7 → 6,4 | 3,2 → 4,8 | 100 % → 99 % | 73 % → 73 % | 0 → 0 | 58 → 49 | 230 MB → 101 MB |
  | | Zoomen | 60,2 → 60,1 | 23,3 → 33,6 | 0,7 → 0,7 | 98 % → 87 % | 20 % → 19 % | 0 → 0 | 56 → 49 | 241 MB → 102 MB |
  | | Schwenken | 60,0 → 59,9 | 31,6 → 40,5 | 0,5 → 0,4 | 94 % → 84 % | 16 % → 11 % | 0 → 0 | 54 → 49 | 242 MB → 100 MB |
  | | Herangezoomt | 59,7 → 58,3 | 12,6 → 13,6 | 2,0 → 1,6 | 98 % → 96 % | 60 % → 61 % | 0 → 2 | 50 → 37 | 281 MB → 137 MB |
  | Schnee, frisch | Ruhe | 59,0 → 58,8 | 6,8 → 6,5 | 2,2 → 2,1 | 100 % → 99 % | 77 % → 77 % | 0 → 0 | 32 → 32 | 227 MB → 124 MB |
  | | Zoomen | 59,9 → 60,1 | 42,9 → 44,7 | 0,4 → 0,4 | 75 % → 72 % | 19 % → 16 % | 0 → 0 | 32 → 21 | 230 MB → 124 MB |
  | | Schwenken | 60,0 → 60,0 | 45,7 → 50,1 | 0,3 → 0,3 | 74 % → 66 % | 16 % → 11 % | 0 → 0 | 32 → 21 | 230 MB → 124 MB |
  | | Herangezoomt | 59,9 → 59,8 | 14,4 → 14,7 | 1,1 → 1,0 | 94 % → 93 % | 66 % → 66 % | 0 → 0 | 30 → 20 | 244 MB → 172 MB |

  Lesart: Der **Ebenenspeicher** sinkt bei Regen in Ruhe, beim Zoomen und Schwenken um mehr als die Hälfte (191 → 88 MB), herangezoomt von 216 auf 137 MB (Median; der höchste Einzelwert vorher war 289 MB in der gewachsenen Bastion, nachher 137 MB). Damit liegen alle Phasen bei Regen unter dem Richtwert von 150 MB und mit Abstand unter den 238 MB aus §24; ohne Wetter bleiben 49 bis 97 MB, Sturm herangezoomt 281 → 137 MB. **Schnee** bleibt herangezoomt mit 172 MB darüber (vorher 244 MB): drei Flocken-Ebenen von je 21 MB, die schräg ziehen und darum breiter sind als das Fenster; weniger ginge nur mit weniger Ebenen oder kleineren Kacheln, und das sähe anders aus. Die **Zahl der Ebenen** fällt, weil die Sammelebene über den Dingen und herangezoomt die ferne Ebene entfallen. **Bilder/s, Takt, Hauptfaden und GPU** ändern sich in Chromium ohne Grafikkarte kaum (Streuung, Canvas-Kopie wie in §29 und §31); die Gewinne aus PR 2 und 3 bleiben, beim Zoomen und Schwenken ist der Hauptfaden eher etwas freier, obwohl die Cull-Kamera mit dem knapperen Kasten öfter springen kann. Herangezoomt ohne Wetter schwanken Bilder/s und Hänger stark von Lauf zu Lauf (vorher 14 bis 60 Bilder/s). Auf dem iPhone zählt vor allem der Speicher: weniger und kleinere Ebenen heißt weniger Grafikspeicher, den Safari beim Zoomen neu belegen muss.
- **Aussehen:** Fotos vorher/nachher bei gleicher Kamera und angehaltenen Animationen (390 × 844, Regen und Schnee, Start, ganz herausgezoomt und ganz herangezoomt) sind gleich; die Differenzbilder zeigen nur Kanten, die um Bruchteile eines Bildpunkts anders gerastert sind (0,03 bis 0,4 % der Bildpunkte), weil der Sichtkasten an einer anderen Stelle beginnt.

## 33. Q-G1 PR 2 bis 4 zurückgenommen (Meldung PV, 06.11.2026)

- **Meldung:** Auf dem iPhone stürzt die App beim Zoomen sofort ab (Stand `main` mit #290, #292, #298).
- **Sofortmaßnahme:** Der Code von §30, §31 und §32 ist zurückgenommen (`src/ui/bastion/`, `tools/grafik/`), es gilt wieder der Stand nach PR 1 (#285, §29). Die Abschnitte §30 bis §32 bleiben als Geschichte stehen; ihre Zahlen gelten nicht mehr.
- **Vermutete Ursache:** §30 legte Welt und Ferne in je eine Sichtkasten-Ebene mit `will-change: transform` innerhalb der Kamera-Transformation. Genau dieses Muster (große Ebene, die mit Zoom × Pixeldichte vergrößert wird) war schon in §24 die Ursache. Die §24-Rechnung in Chromium zählt die Ebenen, bildet aber nicht ab, wie Safari sie beim Zoomen neu rastert; die Messung hat den Absturz darum nicht vorhergesagt.
- **Lehre:** Kein Grafik-PR, der Ebenen innerhalb der Kamera-Transformation anlegt oder vergrößert, ohne Probe am iPhone vor dem Merge. Bis Referenzgeräte feststehen (Q-G0), ist der PV die einzige verlässliche Messung.
- **Weiter:** PR 3 (gemeinsamer Takt, nur Pixi) einzeln neu einbringen, ohne Abhängigkeit von der Cull-Kamera; PR 2 und 4 nur mit einem Ansatz ohne große transformierte Ebenen und erst nach Probe am Gerät.


## 34. Gemeinsamer Takt neu, nur Pixi (Q-G1, PR 3 neu, 06.11.2026)

- **Was:** Der Inhalt von §31 kommt einzeln zurück, nur der Teil in der Pixi-Bühne: vorberechnete Bilder für Fahnen, Banner und Mühlenflügel (`BildVorrat`, `bilderJeUmlauf`, `phasenStufe`), Statusgesten je Tätigkeit einmal, Wesen und Bewohner setzen den Maßstab direkt, alle sehen dieselbe auf 30 Hz gerundete Zeit (`taktSchritt`, `taktZeit`). Reine Logik in `takt.ts` mit Tests; Beschreibung wie in §31.
- **Anders als #292:** keine Cull-Kamera und kein `cullRand` aus §30. Das Sichtfeld rechnet `Bauplatz.svelte` bei Kamera-Ruhe (150 ms nach der letzten Änderung, `KAMERA_RUHE_MS`) aus der aktuellen Kamera (`sichtfeldAus`, Fenster plus ein Achtel Rand) und meldet es der Bühne, gleich bevor der Takt wieder anläuft. Während der Geste steht der Takt ohnehin (§29). Das Sichtfeld ist eine reine Rechnung: Es legt keine Ebene an, ändert kein CSS und kein `will-change`. `Kulisse.svelte`, `Wetterschicht.svelte` und alle Stile sind unverändert.
- **Ebenen:** keine neuen. Die Zahl der Grafikebenen ist je Lauf vorher und nachher gleich (Ruhe frisch 45 / 45 / 45 → 45 / 45 / 45, gewachsen 53 / 53 / 54 → 53 / 53 / 54; herangezoomt 37 / 38 / 38 → 37 / 38 / 38 bzw. 37 / 37 / 38 → 37 / 37 / 38; „ruhig“ 9 → 9). Beim Zoomen und Schwenken schwankt die Zahl von Lauf zu Lauf in beiden Ständen (je nachdem, wann `LayerTree` mitten in der Geste meldet, z. B. gewachsen beim Schwenken vorher 53 / 53 / 42, nachher 41 / 46 / 41); die Bühne bleibt ein einziges Canvas.
- **Zahlen vorher → nachher** (`pnpm tempo` und `pnpm tempo --reich`, Chromium ohne Grafikkarte, 390 × 844, Pixeldichte 3, CPU ÷4, je Phase 6 s; vorher = `main` nach #299 mit demselben Werkzeug; Median aus drei Läufen, vorher und nachher im Wechsel, „ruhig“ je ein Lauf; der Messrechner war zu Beginn durch andere Sitzungen belastet):

  | Lage | Phase | Bilder/s | Takt/s | ms je Takt | Hauptfaden | GPU | Hänger | Ebenen | Ebenenspeicher (§24-Rechnung) |
  |---|---|---|---|---|---|---|---|---|---|
  | frisch | Ruhe | 57,7 → 58,6 | 5,1 → 6,8 | **3,7 → 3,2** | 100 % → 100 % | 76 % → 76 % | 1 → 0 | 45 → 45 | 81 MB → 81 MB |
  | | Zoomen | 59,0 → 59,9 | 8,4 → 11,9 | **1,1 → 0,8** | 100 % → 100 % | 73 % → 66 % | 0 → 0 | 39 → 39 | 80 MB → 80 MB |
  | | Schwenken | 59,2 → 60,0 | 10,7 → 14,0 | **1,0 → 0,8** | 98 % → 98 % | 67 % → 65 % | 0 → 0 | 39 → 39 | 82 MB → 81 MB |
  | | Herangezoomt | 59,7 → 58,7 | 6,8 → 6,9 | **2,1 → 1,6** | 100 % → 100 % | 76 % → 75 % | 0 → 1 | 38 → 38 | 169 MB → 172 MB |
  | gewachsen (`--reich`) | Ruhe | 59,9 → 59,7 | 3,9 → 3,0 | 5,0 → 4,9 | 100 % → 100 % | 78 % → 84 % | 0 → 0 | 53 → 53 | 83 MB → 83 MB |
  | | Zoomen | 60,1 → 59,9 | 6,4 → 4,3 | 1,8 → 2,1 | 100 % → 100 % | 74 % → 79 % | 0 → 0 | 42 → 42 | 82 MB → 88 MB |
  | | Schwenken | 60,0 → 59,8 | 7,4 → 5,2 | **1,7 → 1,4** | 100 % → 100 % | 73 % → 77 % | 0 → 0 | 53 → 41 | 101 MB → 96 MB |
  | | Herangezoomt | 59,9 → 59,8 | 5,9 → 6,5 | **2,4 → 2,1** | 100 % → 100 % | 76 % → 75 % | 0 → 0 | 37 → 37 | 181 MB → 205 MB |
  | frisch, ruhig | Ruhe | 0 → 0 | 59,9 → 60,1 | 0,2 → 0,2 | 5 % → 5 % | 0 % → 0 % | 0 → 0 | 9 → 9 | 62 MB → 62 MB |
  | | Zoomen | 9,5 → 8,2 | 8,9 → 9,2 | 1,7 → 1,3 | 99 % → 99 % | 71 % → 70 % | 21 → 20 | 25 → 24 | 136 MB → 121 MB |
  | | Schwenken | 7,0 → 7,5 | 10,0 → 10,2 | 0,9 → 1,1 | 100 % → 99 % | 67 % → 66 % | 22 → 21 | 9 → 9 | 62 MB → 63 MB |
  | | Herangezoomt | 4,5 → 5,0 | 33,1 → 33,2 | 0,3 → 0,3 | 55 % → 56 % | 39 % → 39 % | 18 → 21 | 9 → 9 | 98 MB → 107 MB |
  | gewachsen, ruhig | Ruhe | 0 → 0 | 60,1 → 60,1 | 0,2 → 0,2 | 6 % → 6 % | 0 % → 0 % | 0 → 0 | 9 → 9 | 61 MB → 61 MB |
  | | Zoomen | 5,4 → 5,5 | 6,4 → 6,0 | 1,5 → 1,0 | 99 % → 99 % | 72 % → 73 % | 13 → 13 | 24 → 24 | 136 MB → 148 MB |
  | | Schwenken | 4,2 → 4,2 | 6,7 → 6,5 | 1,0 → 1,8 | 100 % → 100 % | 71 % → 71 % | 14 → 14 | 9 → 9 | 63 MB → 64 MB |
  | | Herangezoomt | 3,7 → 3,7 | 23,8 → 23,0 | 0,4 → 0,4 | 69 % → 70 % | 50 % → 51 % | 20 → 22 | 9 → 9 | 115 MB → 128 MB |

  Lesart: Wie in §31 zeigt sich die Ersparnis in „ms je Takt“ (Durchlauf im Hauptfaden), hier kleiner als damals, weil die Läufe auf dem Stand nach #285 ohne die Kulisse aus §30 kürzer sind: frisch 3,7 → 3,2 ms in Ruhe, herangezoomt 2,1 → 1,6; gewachsen nach dem Schwenken 1,7 → 1,4, herangezoomt 2,4 → 2,1. Bilder/s, Hauptfaden und GPU bleiben in Chromium ohne Grafikkarte voll (Kopie des Canvas, §29). Der **Ebenenspeicher** streut zwischen den Läufen stark, in beiden Ständen gleich (gewachsen herangezoomt vorher 165 / 181 / 255 MB, nachher 205 / 187 / 253 MB; frisch 150 / 169 / 177 → 161 / 172 / 175 MB): Er hängt am Regen und an den Kulisse-Ebenen, die dieser PR nicht anfasst. Bei „ruhig“ ändert sich nichts (keine Tücher, Wesen und Bewohner).
- **Aussehen:** Fotos vorher/nachher (390 × 844, frisch und gewachsen, voll und ruhig) sind gleich: bei „ruhig“ Bildpunkt für Bildpunkt (0,0 % Abweichung), mit Bewegung weichen 0,4 % der Bildpunkte ab (Wege der Wesen, Regen, Phase der Fahnen). Fahnen, Banner mit Wappen und Statusgesten stehen an derselben Stelle.
- **Probe am iPhone vor dem Merge (§33):** Bastion mit Fahnen öffnen, mehrfach ganz herein- und herauszoomen und schwenken (stabil, kein Absturz); wehen Fahnen und Banner, drehen Mühlen und laufen Wesen und Bewohner nach dem Loslassen weiter, auch an Stellen, die vorher außerhalb des Bildes lagen.
