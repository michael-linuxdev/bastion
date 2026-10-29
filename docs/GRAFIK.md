# Grafik

Status: Entschieden 29.10.2026 (K-22, B-27, T-15) · Umbau auf Richtung A umgesetzt 29.10.2026 (§5)

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

## 4. Später: lebendige Szenen

Erst nach dem Umbau auf Richtung A, ohne festen Zeitpunkt:

- **Detailliertere Grafik** und **Animationen**: lebendiges Dorf oder lebendiger Garten, Figuren, Rauch, Wasser.
  - Jede Bewegung lässt sich abschalten und hält sich an „Bewegung reduzieren“ im System.
- **Jahreszeiten** nach dem Datum (Schnee im Winter, Laub im Herbst).
- **Wetter**:
  - Ohne Internet entsteht es aus dem Datum.
  - Auf Wunsch kommt das echte Wetter von Open-Meteo, nur nach ausdrücklichem Einschalten (T-15).
- **Skins**: weitere Fassungen der Grafik, zusätzlich zu den Themen (B-17).
  - Kostenlos und ohne Kauf.
  - Als Belohnung nur nach festen, sichtbaren Regeln, nie zufällig (R1).

**Grenzen (R-Regeln):**

- Das Wetter und die Jahreszeiten ändern nur das Bild, nie Baustoffe, Fortschritt oder Belohnungen.
- Kein Verfall bei schlechtem Wetter oder langer Pause (R3).
- Keine Uhrzeit-Ereignisse, die zum Öffnen drängen (R2).

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

Der Umbau auf Richtung A ist damit fertig. Als Nächstes sollen die drei Testerinnen ihn ausprobieren (`TESTS.md` §2).
