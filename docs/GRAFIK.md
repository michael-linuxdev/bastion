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
- **Sturm:** schnellere Wellen und kräftigerer Schaum, dreimal so schnelle Wolken, ziehende Wolkenschatten über Insel und Meer, Windstriche.
- **Nebel:** Nebelbänke über dem Meer, Horizont und Dinge im Meer verschwinden fast.
- **Zahnrad:** „Wetter ausprobieren“ (Wie draußen, Sonne, Wolken, Regen, Schnee, Sturm, Nebel, Regenbogen); gilt nur für die Ansicht bis zum Neuladen und wird nicht gespeichert (`wetter-probe.svelte.ts`).
- **Offen:** wehende Fahnen und Banner bei Sturm. Die Fahnen sind Teil der Gebäudebilder; dafür bräuchte jedes Gebäude mit Fahne eigene Bilder für die Bewegung.
- Kulissen der anderen Themen (Punkt 3) bekommen dieselben Wetterteile, sobald es sie gibt.

### 15.1 Wetter über dem ganzen Bild und Stärken (Wunsch PV, 03.11.2026)

PV: „Wetter ist schon unterschiedlich, aber nicht viel davon auf dem Bildschirm zu sehen.“ Bisher regnete und schneite es nur über der Insel.

- **Wetterschicht** (`Wetterschicht.svelte`, `grafik/wetter-schicht.ts`) über Kulisse und Bauplatz, über den ganzen Bildschirm; fängt keine Tipper ab. Regen und Schnee sind feste Kacheln (kleine SVG-Bilder im Code, kein Netz, Tropfen und Flocken an festen Stellen) in drei Ebenen, die verschieden schnell fallen. Sturm: schräger Regen, dunkler Schleier, schnelle Wolkenschatten. Nebel: vier Nebelbänke über allem. Wolken: Wolkenschatten ziehen über Insel und Kulisse. Nur Bastion, Dorf und Garten (unter Wasser und im Weltraum regnet es nicht).
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
- **Wolken und Nebel wandern mit:** Wolkenschatten und Nebelbänke hängen an der Welt (gleiche Verschiebung und gleicher Zoom wie der Bauplatz), über einem Stück Welt dreimal so groß wie die Bühne; beim Neubeginn blenden sie weich ein und aus. Nur Regen und Schnee fallen weiter in Blickrichtung über den Bildschirm.
- **Szenerie bis weit hinaus:** keine Sperre mehr an den Seiten (beim Verschieben sah man sonst leere Fläche), Verteilung bis 44 Felder; oben (bis zum Horizont) etwas dichter als unten, damit beide Hälften gleich voll wirken. Gezeichnet wird nur, was im Bild oder knapp daneben liegt.
- **Himmel:** ruhige Wolken über dem Horizont (Land und Meer), die beim Verschieben nur wenig mitwandern; bei Regen und Sturm grauer, nachts kaum zu sehen. Vor der Bastion ferne Segel auf der Horizontlinie.

