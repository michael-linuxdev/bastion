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


## 2. Hell, dunkel, System

- Drei Einstellungen: **System** (Standard), **Hell**, **Dunkel**. Gespeichert als Einstellung, wählbar unter „Über mich“.
- **Dunkel = Abendstimmung von Richtung A:** gleiche Formen und Schrift, dunkle warme Flächen.
  - Die Bastion steht unter Abendhimmel mit erleuchteten Fenstern.
  - Die Farben aus Richtung B sind dafür ein Anhaltspunkt: Himmel `#1A2342`, Licht `#FFC85A`.
- Beide Modi erfüllen den Kontrast von 4,5 : 1.

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
   - `src/ui/grafik/darstellung.svelte.ts` schreibt die Tokens an `<html>` und setzt `data-modus` auf `hell` oder `dunkel`. Das Bild der Bastion zeichnet sich beim Wechsel neu.
   - Wahl „Aussehen“ unter „Über mich“: Wie das Gerät, Hell, Dunkel (Abend). Einstellung `darstellung.modus`.
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
