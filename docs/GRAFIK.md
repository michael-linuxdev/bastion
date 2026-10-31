# Grafik

Status: Entschieden 29.10.2026 (K-22, B-27, T-15) · Umbau auf Richtung A umgesetzt 29.10.2026 (§5) · Lebendige Szenen beschlossen 31.10.2026 (§4, §7–§10, B-28)

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
- **Leiste unten** (aus Richtung B übernommen): Start, Üben, Bastion, Mehr – immer sichtbar, aktueller Bereich hervorgehoben. *Geändert am 29.10.2026 (Projektverantwortlicher): „Mehr“ ersetzt „Mein Stand“.*
- **Startseite passt auf einen Bildschirm**, auch auf dem iPhone 13 in Safari (390 × 664 Punkte sichtbar). Was nicht täglich gebraucht wird, steht unter „Mehr“: Mein Stand, Klassenarbeit, Über mich, Sicherung, Für Eltern, dazu der Name „Bastion“, das Versprechen „Keine Werbung …“ und der Hinweis „funktioniert ohne Internet“.

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
- **Lernumfeld** (Üben, Vermittlung, Fehlerwerkstatt, Diagnose): darf **nicht** ablenken – Aufräumen von Abständen und Hierarchie erlaubt, keine Bewegung, kein Wetter, kein Sound dort.
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
- **Wetter echt (T-15):** Freitext Stadt → Geocoding einmalig → Lat/Lon lokal; Forecast bis **Mitternacht** cachen; nur Eltern schalten ein (ab 18 selbst, L-15); bei Fehler **still** letzter Cache oder Datumswetter. Ändert nur das Bild.
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

### 4.5 Schalter und Leistung

1. Basebau aus → kein Bild (R7).  
2. „Bild aus – nur die Liste“ → wie heute.  
3. **„Bastion ruhig“** → keine Loops, keine Wesen, Jahreszeit/Wetter als Standbild.  
4. **„Darstellung leicht“** → weniger Partikel, höchstens 3 Wesen, Bewegung bleibt.  
5. `prefers-reduced-motion` → wie „ruhig“.  

Ziel: **60 fps** auf dem iPhone 13; wenn knapp, **30 fps** anpeilen (automatisch drosseln), nicht hängen.

### 4.6 Sound (optional)

- Standard **aus**. Jugendliche schalten selbst ein.
- Ambient (Wind, Wasser, Regen) und kurze Tip-Geräusche (bauen, Wesen).
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
2. ✅ **Startseite mit der Leiste unten** (`src/ui/start/`):
   - Datum und Begrüßung, kleine Ansicht der Bastion (`src/ui/grafik/MiniBastion.svelte`, nur Bild), großer Knopf „Üben“ mit „Gerade dran“.
   - Vier Kacheln: Wiederholen, Fehlerwerkstatt, Wo stehe ich?, Mein Stand. Ist nichts fällig oder kein Fehler offen, bleibt die Kachel sichtbar, ist aber nicht wählbar.
   - Hinweis auf die Klassenarbeit nur mit Datum.
   - Leiste unten (`Leiste.svelte`) in allen Ansichten; ohne Basebau ohne Bastion (R7). Symbole in `src/ui/grafik/Symbol.svelte`.
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

5. ✅ **„Mehr“ statt „Mein Stand“** in der Leiste (`src/ui/start/Mehr.svelte`). Die Startseite ist kompakter und passt auf das iPhone 13. Der Name „Bastion“ steht für Screenreader weiter als Überschrift, sichtbar aber nur unter „Mehr“. Wenn eine Erinnerung an die Sicherung und eine Klassenarbeit zugleich angezeigt werden, kann die Seite etwas länger werden.
6. ✅ **Korrekturen nach dem ersten Blick auf dem iPhone 13** (29.10.2026):
   - Die App nutzt den ganzen Bildschirm (`viewport-fit=cover`). Die Leiste hält Abstand zum Strich unten am iPhone, deshalb ist die Markierung von „Start“ ganz zu sehen.
   - Die Leiste misst ihre Höhe selbst (`--leiste-hoehe`). Der Hinweis auf eine neue Version steht darüber statt dahinter.
   - Oben ist mehr Abstand. Das Datum lag vorher am Rand unter der Statusleiste, wo iOS Inhalte unscharf zeichnet.
   - Die Startseite füllt den Bildschirm bis zur Leiste. Den freien Platz bekommt das Bild der Bastion (höchstens 20rem), ohne Basebau die Kacheln.
   - Die Fehlerwerkstatt hat als Symbol eine Glühbirne statt eines Schraubenschlüssels: Aus Fehlern wird ein Aha (R6).

Der Umbau auf Richtung A ist damit fertig. Als Nächstes sollen die drei Testerinnen ihn ausprobieren (`TESTS.md` §2).

## 6. Thema Dorf – bisherige Dorfbilder (werden ersetzt)

Unter „Wie soll es aussehen?“ gibt es das Thema **Dorf** (B-17). Seit dem 30.10.2026 zeichnet die Bastion dort die Platzhalter aus [Dorfkrieg](https://github.com/michael-linuxdev/dorfkrieg) (`dorf.ts`): Wiese, Häuser, Zaun, Bäume. Zoom wie in Dorfkrieg (`kamera.ts`).

**Ab dem Grafik-Nebenstrang (31.10.2026):** Diese Platzhalter werden durch das Sprite-Atlas ersetzt (`GRAFIK-SPRITES.md`). Alle fünf Themen bekommen eigene Szenen auf demselben Niveau. Kampffiguren gibt es weiterhin nicht; Wesen sind friedliche Bewohner (§4.4).

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

## 10. PR-Reihenfolge (Nebenstrang)

| PR | Inhalt |
|---|---|
| **G0** | Dieses Dokument, `GRAFIK-SPRITES.md`, BASEBAU §5.5–§5.7, Entscheidungslogs |
| **G1** | Atmosphäre-Gerüst, Ticker, „ruhig“, „leicht“, reduced-motion, Aufstell-Effekt · *umgesetzt* |
| **G2** | Jahreszeit aus Datum + Abend nach Sonnenuntergang |
| **G3** | Open-Meteo (Eltern, Ort, Cache Mitternacht, stiller Fallback) |
| **G4** | Lebewesen (Dorf zuerst) + Tippen + Anzahl~Gebäude |
| **G5** | Atlas-Anbindung + Thema Garten (neues Niveau); Dorfkrieg-Dorf ersetzen sobald Sprites da |
| **G6** | Unterwasser, Weltraum, Bastion-Feinschliff |
| **G7** | Hinterhof als Szene + Denkmal/Wappen |
| **G8** | Sound optional (CC0, Standard aus) |
| **G9** | Katalog Epoche 2–4 (Kosten, Bauplatz, Wechsel) |
| **G10** | Optiken aller Epochen (Atlas) |
| **G11** | Belagerung Mechanik + Optik |

Sprites können parallel von Claude/Grok nach `GRAFIK-SPRITES.md` erzeugt und in G5+ eingehängt werden. Ohne Atlas bleibt der Code-Fallback.
