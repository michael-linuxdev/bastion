# Qualität Klasse 5 bis 10 – Session-Prompt (K-32)

> Auftrag des Projektverantwortlichen (PV) vom 05.11.2026: **Tests mit echten Lernenden beginnen erst, wenn Klasse 5 bis 10, Oberfläche und Grafik wirklich besser sind.** Diese Datei gilt vor `FOKUS.md` und `KLASSE-9-12.md`, bis die Abnahme unten erfüllt ist.
> Vorher lesen: `CLAUDE.md`, `docs/SESSION-PROMPT.md`, die Datei des eigenen Strangs, `docs/INHALTSFORMAT.md` §8 (Prüfkatalog), `docs/VERMITTLUNG.md` §2.5 (V1–V9).
> Alle drei Stränge arbeiten parallel, jeder an seinen Paketen (Q-L, Q-O, Q-G). Protokollzeile je PR im eigenen Protokoll.

Stand: 05.11.2026 · Auftrag angelegt, Meilenstein M5 (Klasse 5) festgelegt, `pnpm review --klasse 5` zeigt den Fortschritt · Q-O1: Rundgang und Mängelliste erledigt, PV: alle Punkte in Reihenfolge 1–5; PR (1) bis (5) erledigt (Fehler, Rückmeldung, Themenwahl, Erstvermittlung, Kleines); offen nur B10 beim Lernkern · Q-G1 PR 1 (Takt der Bühne) gemergt als #285

---

## Warum (Befund vom 05.11.2026, Gesamtsicht)

- **Technik trägt.** Lint, Tests und Build grün, Fehler-Schüler bei 0 in allen Arten, Klasse 5 bis 10 vollständig als Entwurf (176 Themen, 501 Vorlagen, 338 Fehlvorstellungen).
- **Qualität ist nicht gemessen.** Von rund 1 030 Inhaltsdateien haben 25 Stufe 1 (nur das Musterfeld Brüche), 0 Stufe 2. Die gesammelte KI-Prüfung (Phase C in `KLASSE-9-12.md`) war auf „nach 11/12“ verschoben. Das Musterfeld hat gezeigt: Eine frische Prüfsitzung findet in 22 Dateien rund ein Dutzend echte Fehler. Hochgerechnet stecken Hunderte in den Entwürfen.
- **Erstvermittlungen sind fast nur Text.** 124 von 176 haben weder Bild noch Werkzeug. Bei bildhaften Feldern ist es am schlimmsten: Raum und Form 28 von 37 ohne Bild, Größen und Messen 23 von 26, Daten und Zufall 12 von 16. Beispiel Klasse 5, „Parallel, senkrecht, schneidend“: „Denk an Schienen einer Eisenbahn“, kein Bild. Für ein Kind, das das Thema nicht kennt, ist das ein Quiz, keine Vermittlung (V3 verletzt). Die Werkzeuge gibt es inzwischen (`graph@1`, `dreieck@1`, Kurven, Tabellen, Stabdiagramm, Bruchstreifen, Zahlenstrahl), die Erstvermittlungen der Klassen 5 bis 8 nutzen sie nicht, weil sie früher entstanden.
- **Zwischenschritte (K-29) gibt es in 17 von 501 Vorlagen**, praktisch nur im Musterfeld Brüche. Gleichungen, Prozent, Dreisatz, Flächen bleiben einschrittig.
- **Lern-Oberfläche** wirkt wie ein Formular: viel leere Fläche in der Erstvermittlung, Rückmeldung nach einem Fehler in drei gestapelten Kästen, Themenwahl als Liste von über 7 000 Pixeln Höhe mit Platzhalter-Bildern. Start, Mehr, Eltern und Mein Stand sind nach dem Strang Oberfläche ruhig und sauber.
- **Grafik:** Die Bastion sieht gut aus, ruckelt aber auf dem iPhone (PV, 04.11.2026). Referenzgeräte (Aufgabe 0.10) sind seit Beginn offen. Ohne Messung am echten Gerät ist weitere Grafikarbeit Blindflug.

## Entscheidungen des PV (05.11.2026) – K-32

1. **Einfrieren der Lern-Oberfläche aufgehoben** (`SESSION-PROMPT.md` Regel 7). Es diente nur U4b; U4b hat keinen Termin mehr.
2. **Jahrgang 11/12 angehalten.** Die Bausteine 11-0 bis 11-0c bleiben; Inhalte ab 11-1 erst nach der Abnahme unten. Kein weiterer ungeprüfter Stoff.
3. **„Wirklich besser“ wird gemessen** an der Abnahme unten. Erst dann wird ein Termin für U4b gesetzt.

Festgehalten als **K-32** in `STRATEGIE.md` §9. Ehrlich dazu: Stufe 2 setzt nur ein Mensch. Ohne Lehrkraft bleibt „besser“ bei Stufe 1 stehen. Die Suche nach einer Lehrkraft läuft beim PV parallel weiter.

## Abnahme „bereit für Tests“

| # | Kriterium | Woran gemessen | Strang |
|---|---|---|---|
| A1 | Jede Inhaltsdatei der Klassen 5 bis 10 hat Stufe 1 nach **zwei** unabhängigen Prüfdurchgängen (Phase C) | `pnpm review --klasse 5` … `--klasse 10`: alles auf 1 oder höher, Fundlisten abgearbeitet | Lernkern |
| A2 | Jede Erstvermittlung eines bildhaften Themas (Raum und Form, Größen und Messen, Brüche, Funktionen, Daten und Zufall) hat mindestens ein Bild oder Werkzeug an der Stelle, an der es erklärt | Zählung über `vermittlung.yaml` (`bild:` oder `werkzeug:`), je Klasse 0 ohne | Lernkern |
| A3 | Alle mehrschrittigen Vorlagen der Klassen 5 bis 7 haben Zwischenschritte (`schritte`) | Liste je Feld in dieser Datei, abgehakt | Lernkern |
| A4 | Rundgang der Lern-Oberfläche auf 390 px ohne Fund der Gruppen A (Fehler) und B (Verständlichkeit), Erstvermittlung, Rückmeldung und Themenwahl überarbeitet | Mängelliste wie bei Paket L, vom PV abgenommen | Oberfläche |
| A5 | Bastion auf dem iPhone 13 ohne Ruckeln beim Zoomen und Schwenken, Referenzgeräte festgelegt | Messung am Gerät (Safari-Webinspektor oder Bildrate über `pnpm messen`), Ergebnis in `GRAFIK.md` | Grafik |

Reihenfolge der Inhalte: **Klasse 5 zuerst (Meilenstein M5)**, dann 6, 7, 8, 9, 10. Jede Klasse wird für sich fertig, bevor die nächste beginnt (K-15). Dadurch ist früh sichtbar, wie viel Arbeit eine Klasse kostet.

## Pakete

### Strang Lernkern (Branch `lernkern/…`)

**Q-L1 – Prüfen (Phase C) je Klasse.** Zwei unabhängige Durchgänge je Datei, jeweils in einer frischen Sitzung oder einem Sub-Agenten ohne den Entwurf im Verlauf (INHALTSFORMAT §8, Prüfkatalog Fragen 1 bis 6). Ablauf je Feld:

1. Fundliste anlegen: `docs/pruefung/<klasse>-<feld>.md` (Datei, Stelle, Frage des Katalogs, Fund). Keine Teilnehmerdaten, nur Inhalte.
2. Funde in eigenen PRs beheben, mit Begründung. Geschmack ist kein Fund.
3. Zweiter Durchgang. Bleibt eine Datei in zwei Durchgängen ohne Fund: `pnpm review setzen --stufe 1 --pruefer maschine <IDs>`.
4. Fortschritt: `pnpm review --klasse 5`.

Reihenfolge innerhalb der Klasse: entlang des Graphen, Kompetenzen ohne Voraussetzungen zuerst (`LEHRPLAN.md` §8.4). Was `pnpm test` und `pnpm fehlerschueler` schon sichern, wird nicht wiederholt.

**Q-L2 – Erstvermittlungen mit Bild oder Werkzeug.** Je Feld ein PR. Zuerst die Felder mit dem größten Mangel: Raum und Form, Größen und Messen, Daten und Zufall, dann Funktionen und Brüche. Jede überarbeitete Erstvermittlung erfüllt V1 bis V9 (`VERMITTLUNG.md` §2.5) und nutzt vorhandene Werkzeuge und SVG-Bausteine (`src/generators/svg.ts`, `src/ui/vermittlung/werkzeuge/`). Fehlt ein Werkzeug für ein ganzes Feld (zum Beispiel Geometrie-Grundfiguren, Winkel, Körper), wird es als eigener PR gebaut, ohne Ziehen bedienbar, mit Beschreibung für Screenreader, Vorschaubild vor dem Einbau an den PV. Eine geänderte Datei verliert Stufe 1 und wird in Q-L1 neu geprüft, darum **Q-L2 vor Q-L1** je Feld.

**Q-L3 – Zwischenschritte für mehrschrittige Vorlagen der Klassen 5 bis 7** (K-29, INHALTSFORMAT §17). Kandidaten, je Feld ein PR: Gleichungen (Rechenzeilen), Prozent (Grundwert, Prozentwert), Dreisatz, Flächen und Umfang zusammengesetzter Figuren, Einheiten umrechnen mit Komma, Dezimalzahlen rechnen, Brüche multiplizieren und dividieren. Liste beim ersten PR vervollständigen und hier abhaken.

**Q-L4 – Nebenbei:** `potenzen.ts` neue Fassung (10⁶ statt `10^6`, Entscheidung 01.11.2026); Brüche im Fließtext zu Formeln (F9, Entscheidung 11 in `KLASSE-9-12.md`), Feld für Feld zusammen mit Q-L2, damit Dateien nur einmal die Stufe verlieren.

### Strang Oberfläche (Branch `oberflaeche/…`)

**Q-O1 – Lern-Oberfläche überarbeiten.** Zuständigkeit erweitert (PV, 05.11.2026): Der Strang Oberfläche darf in `src/ui/ueben/`, `src/ui/vermittlung/` und `src/ui/eingabe/` Aufbau, Abstände, Hierarchie, Karten und Texte ändern. Die Logik (Auswertung, Abspieler, Diagnose, Ereignisse) bleibt beim Lernkern; Browser-Tests in `ueben.spec.ts` dürfen angepasst werden, wenn sich nur das Aussehen ändert. Ablauf wie bei Paket L: Rundgang auf 390 px, Mängelliste mit Bildschirmfotos an den PV, der PV wählt, dann kleine PRs. Bekannt schon jetzt:

- Erstvermittlung: Karte mit viel Leerraum, Schrittart („Probier es aus“) ohne Bild, Fortschrittsbalken ohne Schrittzahl.
- Rückmeldung nach einem Fehler: drei gestapelte Kästen (Antwort, „Noch nicht“, Fehlvorstellung) plus Lösungsweg plus zwei Knöpfe. Ziel: ein Kasten, eine Hauptaktion.
- Themenwahl: Liste über 7 000 px mit grauen Platzhalter-Bildern; Bereiche als Karten, Platzhalter weg oder echte Symbole je Feld.
- „Zeichnen lernen“ hängt als eigene Karte unter der Aufgabe.
- Lernpfad bleibt ohne Animationen, Wesen, Sound, Wetter (`GRAFIK.md` §9) und ohne Noten (K-26). R1–R7.

**Mängelliste vom 05.11.2026** (Rundgang auf 390 × 844 px, 74 Bildschirme, kein JS-Fehler; Bildschirmfotos im Scratchpad der Sitzung, nicht im Repository). **Der PV wählt**, was gebaut wird; Vorschlag der Reihenfolge am Ende.

*A – Fehler*
- ~~**A1** Zeichen-Anleitung „Prüfe deine Zeichnung“: Prüfliste zerfällt in Wortspalten, Seite läuft seitlich über (474 px). Ursache `display: flex` am Label mit mehreren Textknoten (`Anleitung.svelte`). Empfehlung: Text in einen `span`, Label als Raster.~~ Erledigt 05.11.2026 (PR 1): Text im `span`, Browser-Test prüft die Breite.
- ~~**A2** Lange Denkfehler-Erklärung: Brüche im Fließtext überlappen die Nachbarzeilen (`FvRueckmeldung.svelte`). Empfehlung: Zeilenhöhe bei Formel-Absätzen erhöhen, Gleichungen in eigener Zeile.~~ Erledigt 05.11.2026 (PR 1): Die Zeilenhöhe half nicht, weil der KaTeX-Strut den Zeilenkasten bestimmt; `Formel.svelte` setzt die Formel als Inline-Block mit 0,3 em Luft oben und unten, gilt überall (Aufgabe, Lösungsweg, Optionen).
- ~~**A3** „Zurück“ in der Erstvermittlung führt in die erste Aufgabe, nicht zurück zur Themenwahl (im Browser-Test so festgeschrieben). Empfehlung: Zurück führt dahin, woher man kam; ins Üben nur über „Jetzt üben“ (`App.svelte`, Test anpassen).~~ Erledigt 05.11.2026 (PR 1): `App.svelte` merkt sich die Herkunft (`vermittlungHerkunft`): aus dem Angebot zurück zur Themenwahl, aus der Übung (Buch, Rückweg) zurück in die Übung. Test U3c angepasst, Meldung im Lernkern-Protokoll.

*B – Verständlichkeit*
- ~~**B1** Rückmeldung nach falscher Antwort: bis zu vier Rahmen ineinander, drei beige Knöpfe („Später weiter“, „Fertig für heute“, „Lösungsweg ansehen“); Seite nach dem zweiten Denkfehler 1 480 px. Empfehlung: ein Kasten mit Urteil als Überschrift („Noch nicht – richtig ist 7059“), Denkfehler als Absatz mit Bild, Lösungsweg als Klappzeile, „Nächste Aufgabe“ als einziger Hauptknopf; „Später weiter“ und „Fertig für heute“ zu einem leisen Textknopf zusammenlegen.~~ Erledigt 05.11.2026 (PR 2): ein Kasten mit Urteil, Antwortzeile („Deine Antwort 0 · Richtig ist 7059“) und Ursache; kein Rahmen um die Rückmeldung; Lösungsweg als Klappzeile ohne Rahmen; „Nächste Aufgabe“ einziger Knopf, „Später weiter“ und „Fertig für heute“ als leise Textknöpfe (bleiben getrennt, weil sie Verschiedenes tun). Seite nach dem zweiten Denkfehler 1 214 px.
- ~~**B2** Denkfehler-Kasten: Katalogname als fette Überschrift, Kurzsatz doppelt (im Urteil und im Kasten), „Zurück zur Erklärung“ sieht aus wie Text und klingt nach Navigation. Empfehlung: Überschrift „Dein Denkfehler“, ein Satz, Zweitknopf „Erklärung noch einmal ansehen“.~~ Erledigt 05.11.2026 (PR 2): Abschnitt „Dein Denkfehler“ ohne Kasten, Name in normaler Größe, Kurzsatz nur, wenn das Urteil die Ursache nicht schon nennt; Knopf „Erklärung noch einmal ansehen“ als Zweitknopf (Test U3i angepasst).
- ~~**B3** Themenwahl: Steinkette (Voraussetzungen als 12,8-px-Punkte mit abgeschnittenen Namen) unter jedem der 21 Themen, ohne Erklärung. Empfehlung: aus der Liste nehmen; Voraussetzungen ins Angebot („Dafür brauchst du …“).~~ Erledigt 05.11.2026 (PR 3): Kette raus; das Angebot nennt „Dafür brauchst du: …“ und den „Ich kann …“-Satz.
- ~~**B4** Themenwahl, Kopf: Entwurf-Vermerk, Speicher-Satz, 7 Klassen-Radios, Schulart, „gerade dran“ vor dem ersten Thema (1,5 Bildschirme). Empfehlung: Klasse als Segmentleiste (`KlassenWahl kompakt`), Rest in eine Klappzeile, Vermerke ans Seitenende.~~ Erledigt 05.11.2026 (PR 3): Klasse und Schulart als Segmentleisten, Vermerke am Seitenende; „gerade dran“ bleibt eine Klappzeile. Keine Klappzeile um die Schulart, damit sie direkt wählbar bleibt (zwölf Browser-Tests greifen darauf zu).
- ~~**B5** „WAS WIRD GESUCHT?“ als Dauer-Label über jeder Aufgabe, auch über „Berechne schriftlich: 355 + 6704“. Empfehlung: Label entfernen (fetter Auftrag reicht); falls der Lernkern es für Sachaufgaben will, nur dort.~~ Erledigt 06.11.2026 (PR 5): Label überall weg. Vorlagen haben kein Merkmal „Sachaufgabe“; will der Lernkern es dort wieder, braucht es ein solches Merkmal (Meldung im Lernkern-Protokoll).
- ~~**B6** Abschluss: „Du hast neue Stein verdient. (2 Stein)“, dieselbe Zahl dreimal, Einleitungssatz über der Überschrift. Empfehlung: eine Zeile „2 Steine und 1 Bauschritt verdient – aus 2 Aufgaben und 1 Lerneinheit.“~~ Erledigt 06.11.2026 (PR 5): Beutel-Kasten und Satz „Du hast neue … verdient“ weg; unter „Dafür hast du erarbeitet“ eine Zeile „2 Stein und 1 Bauschritt – aus 2 bearbeiteten Aufgaben und 1 Lerneinheit“ (Einzahl/Mehrzahl aus der Textdatei); Einleitungssatz unter der Überschrift. Das Wort „Stein“ in der Mehrzahl ist ein Wort des Themas (`thema.bastion.fleiss-viele`, Strang Grafik), Wunsch „Steine“ dort eingetragen.
- ~~**B7** Üben: zwei unbeschriftete Symbole oben; der Schieberegler öffnet „Bildschirm drehen“ mitten in der Übung (gibt es seit O19 in den Einstellungen), das Buch ist die Erklärung. Empfehlung: Schieberegler raus, Buch mit Wort „Erklärung“.~~ Erledigt 06.11.2026 (PR 5): Regler raus; oben Zurück links, „Erklärung“ mit Buch rechts (44 px).
- ~~**B8** Wiederholen und Fehlerwerkstatt: Thema nur als kleine graue Zeile im Kasten; Werkstatt mit zwei Kästen „Damals“/„Heute deine Chance“ vor der Eingabe. Empfehlung: Thema in die Kopfzeile, Werkstatt-Hinweis als eine Zeile.~~ Erledigt 06.11.2026 (PR 5): Thema unter der Überschrift in der Kopfzeile; Werkstatt: „Deine Antwort damals: 0 · Rechne die Aufgabe noch einmal.“ (Test angepasst).
- ~~**B9** Fortschritt ohne Zahl: Balken der Erstvermittlung (bekannt) und blasse Steine im Üben. Empfehlung: „Schritt 3 von 12“, „2 von 5“.~~ Erledigt 05.11.2026 (PR 4): „Schritt 3 von 11“ über dem Balken; Steine im Üben kräftiger mit „2 von 5“.
- **B10** Inhalt (an Lernkern, Q-L1/Q-L2, kein Punkt für Q-O1): „Probier es aus“ fragt nach der Zahl, die im Satz davor steht; Beispiel „Kreis in 8 Stücke“ ohne Bild; Lösungsweg der schriftlichen Addition ohne Stellentafel.

*C – Bedienung*
- ~~**C1** Themenwahl ohne Zurück-Knopf (nur Gerätetaste); alle anderen Seiten haben einen. Empfehlung: `ZurueckKnopf` in `App.svelte` bei `ansicht === 'uebersicht'`.~~ Erledigt 05.11.2026 (PR 3): Zurück führt dahin, woher man kam (`uebersichtHerkunft`: Start oder Mehr).
- ~~**C2** Erstvermittlung: „Prüfen“ unter der Tastatur und „Weiter“ nach „Stimmt.“ unter dem Falz; Rückmeldung „Noch nicht ganz“ erscheint ohne Scrollen unterhalb. Empfehlung: zur Rückmeldung scrollen, Prüfen neben die Tastatur wie im Üben.~~ Erledigt 05.11.2026 (PR 4): Nach dem Prüfen rücken Rückmeldung und Weiter-Knopf ins Bild, beim Tippen ins Feld der Prüfen-Knopf (wie `sichtbarMachen` im Üben). Auf 390 × 844 passen Feld, Tastatur und Prüfen ohne Scrollen auf den Bildschirm; der Knopf bleibt unten in der Karte.
- ~~**C3** Klassenwahl mit 7 Radios in Themenwahl und Diagnose. Empfehlung: überall `KlassenWahl kompakt`.~~ Erledigt 05.11.2026 (PR 3): kompakt in Themenwahl und Diagnose; Schulart und Kurs ebenfalls kompakt.
- ~~**C4** Klassenwechsel: Karte „Neue Klasse – willkommen.“ über der Überschrift, Klappzeile 27 px, „Nicht jetzt“ 13 px. Empfehlung: unter die Überschrift, 44 px, normaler Zweitknopf.~~ Erledigt 05.11.2026 (PR 3): Karte unter der Überschrift (als Snippet in der Übersicht), Klappzeile 44 px, „Lücken gezielt prüfen“ Hauptknopf, „Nicht jetzt“ Zweitknopf.
- ~~**C5** Fachbegriff-Knöpfe 29 px hoch, ohne Hinweis auf Antippen. Empfehlung: Tippfläche 44 px über `padding-block`.~~ Erledigt 06.11.2026 (PR 5): 48 px über `padding-block` mit negativem Rand (Zeile springt nicht), heller Grund hinter dem Wort als Hinweis.
- ~~**C6** Diagnose-Ergebnis: Zeilen unterschiedlich breit, Üben-Knöpfe versetzt. Empfehlung: volle Breite, Knopf rechts bündig.~~ Erledigt 06.11.2026 (PR 5): Zeilen „Das wackelt noch“ voll breit, Knopf rechts, „Nächster Schritt“ unter dem Namen.

*D – Aussehen*
- ~~**D1** Erstvermittlung: Karte füllt bei Textschritten ein Drittel, Rest leer; Schrittart als Kapitälchen; „Nur Kurzfassung“ als Link darüber (bekannt). Empfehlung: ruhige Seite statt Formularkarte, Schrittart als Überschrift, Weiter in voller Breite unten, Kurzfassung als Zweitknopf.~~ Erledigt 05.11.2026 (PR 4): Die Karte füllt den Bildschirm, der Knopf steht bei jedem Schritt unten an derselben Stelle in voller Breite; Schrittart als Überschrift in normaler Größe; „Nur Kurzfassung“ als Zweitknopf unter der Karte. Die weiße Karte bleibt (gleiches Arbeitsblatt wie im Üben). Bild oder Werkzeug je Schritt kommt aus Q-L2.
- ~~**D2** Themenwahl: Platzhalter-Verläufe vor jedem Thema, 5 600 px (ein Bereich offen) bis 10 000 px (bekannt). Empfehlung: Platzhalter weg, Symbol je Bereich, Thema als flache Zeile (Titel, Status, Pfeil), „Ich kann …“ erst im Angebot; Ziel unter 2 500 px.~~ Erledigt 05.11.2026 (PR 3): Platzhalter weg, flache Zeilen mit Titel, Status und Pfeil; Klasse 5 mit einem Bereich offen 2 460 px (vorher 5 647). Symbole je Bereich gibt es noch nicht (`Symbol.svelte` gehört dem Strang Grafik, Wunsch dort eingetragen).
- ~~**D3** Antwortoptionen mit Brüchen: Bruch kleiner als Text, links oben statt mittig. Empfehlung: Textgröße, mittig.~~ Erledigt 06.11.2026 (PR 5): Formel in Optionen ohne Zusatzluft, mittig zur Zeile, Ziffern so groß wie der Text.
- ~~**D4** Startseite (eigener Bereich, O7): „Wieder-holen“, „Fehler-werkstatt“ brechen wegen der Plakette. Empfehlung: Plakette unter den Titel.~~ Erledigt 06.11.2026 (PR 5): Plakette vor der Infozeile unter dem Titel; Symbol und Abstand im Titel etwas kleiner, sonst bräche „Fehlerwerkstatt“ auf 390 px weiter um.
- ~~**D5** Zwischenschritte: vier Rahmen ineinander. Geht mit B1 mit.~~ Erledigt 05.11.2026 (PR 2): Rahmen um die Rückmeldung weg, bleiben Karte und Schrittkasten.

*Vorschlag Reihenfolge, je ein PR:* (1) A1–A3, (2) B1+B2+D5 Rückmeldung, (3) B3+B4+C1+C3+C4+D2 Themenwahl, (4) D1+B9+C2 Erstvermittlung, (5) Kleines (B5–B8, C5, C6, D3, D4).

**Auswahl des PV (05.11.2026, über die koordinierende Sitzung eingeholt): alle Punkte, Reihenfolge 1–5.** B10 geht an den Lernkern. Bei A3 wird der Browser-Test des Lernkerns bewusst angepasst und im PR begründet; Änderungen an Logik oder Tests, die mehr als das Aussehen betreffen, kommen ins Lernkern-Protokoll.

### Strang Grafik (Branch `grafik/…`)

**Q-G1 – Tempo, sonst nichts.** Bis die Bastion auf dem iPhone 13 flüssig ist, keine neuen Dinge, Wesen, Wetter oder Themen. Ansatzpunkte aus `GRAFIK.md` (04.11.2026): Pixi-Ticker nur bei Bewegung, Kulisse beim Zoomen nicht je Schritt neu ausrichten (Culling mit Abstand), Bewohner, Wesen und Fahnen in einem gemeinsamen 30-Hz-Takt, HD-Bilder nur im Sichtfeld. Jeder PR nennt Bildrate und Speicher vorher und nachher (Chromium-Messung nach `GRAFIK.md` §24; der PV misst am Gerät). **Q-G0 (PV):** drei Referenzgeräte festlegen (0.10), mindestens das iPhone 13.

## Meilenstein M5 – Klasse 5 (42 Kompetenzen, Stand 05.11.2026)

Kompetenzen mit `klassenstufe_typisch` 5 (`pnpm review --klasse 5`). Spalte „Bild“: Thema ist bildhaft, A2 gilt. Spalte „Schritte“: Vorlagen sind mehrschrittig, A3 gilt. Abhaken, sobald das Paket für die Kompetenz erledigt ist.

| Feld | Kompetenz | Thema | Bild | Schritte |
|---|---|---|---|---|
| Natürliche Zahlen | M.ZO.NZ.STELLENWERT | Große Zahlen und Stellenwerte | | |
| | M.ZO.NZ.ORDNEN | Zahlen vergleichen und ordnen | Zahlenstrahl | |
| | M.ZO.NZ.RUNDEN | Runden, schätzen, überschlagen | | |
| | M.ZO.NZ.ADD-SUB | Addieren und Subtrahieren | | schriftlich |
| | M.ZO.NZ.MULT | Multiplizieren | | schriftlich |
| | M.ZO.NZ.DIV | Dividieren | | schriftlich, Rest |
| | M.ZO.NZ.REGELN | Rechengesetze und Rechenvorteile | | |
| | M.ZO.NZ.POTENZEN | Potenzen und Quadratzahlen | | |
| | M.ZO.SA.LESEN | Sachaufgaben lesen | | |
| Teilbarkeit | M.ZO.TB.TEILER | Teiler und Vielfache | | |
| | M.ZO.TB.REGELN | Teilbarkeitsregeln | | |
| | M.ZO.TB.PRIM | Primzahlen | | Primfaktoren |
| Terme und Gleichungen | M.SF.NZ.TERME | Terme mit Klammern und Vorrangregeln | | Rechenzeilen |
| | M.SF.NZ.GLEICHUNGEN | Einfache Gleichungen und Ungleichungen | | Rechenzeilen |
| Brüche und Dezimalzahlen | M.ZO.BR.BEGRIFF | Brüche als Anteile | Bruchstreifen ✓ | |
| | M.ZO.BR.ERWEITERN | Brüche erweitern und kürzen | Bruchstreifen ✓ | ✓ |
| | M.ZO.BR.VERGLEICHEN | Brüche vergleichen | Bruchstreifen | |
| | M.ZO.BR.ZAHLENSTRAHL | Brüche und Dezimalzahlen am Zahlenstrahl | Zahlenstrahl | |
| | M.ZO.BR.ANTEIL-VON | Anteile von Größen | Bruchstreifen | zwei Schritte |
| | M.ZO.BR.DEZIMAL | Brüche und Dezimalzahlen umwandeln | | |
| | M.ZO.BR.DEZ-ORDNEN | Dezimalzahlen vergleichen und runden | Zahlenstrahl | |
| | M.ZO.BR.DEZ-RECHNEN | Mit Dezimalzahlen rechnen | | schriftlich |
| | M.ZO.BR.PROZENT | Prozentschreibweise | Hundertertafel | |
| Größen und Messen | M.GM.GR.UMRECHNEN | Einheiten umrechnen | Stellenwerttafel | |
| | M.GM.GR.KOMMA | Größen in verschiedenen Schreibweisen | Stellenwerttafel | |
| | M.GM.GR.ZEIT | Uhrzeiten und Zeitspannen | Uhr | zwei Schritte |
| | M.GM.GR.SACH | Sachaufgaben mit Größen | | mehrschrittig |
| | M.GM.FL.EINHEITEN | Flächeneinheiten | Quadrat | |
| | M.GM.FL.RECHTECK | Umfang und Fläche des Rechtecks | Rechteck | |
| | M.GM.FL.ZUSAMMENGESETZT | Zusammengesetzte Figuren | Figur | zerlegen, rechnen |
| | M.GM.KP.EINHEITEN | Volumeneinheiten und Hohlmaße | Würfel | |
| | M.GM.KP.VOLUMEN | Volumen von Würfel und Quader | Quader | |
| | M.GM.KP.OBERFLAECHE | Oberfläche von Würfel und Quader | Netz | Flächen, Summe |
| Raum und Form | M.RF.GF.LAGE | Parallel, senkrecht, schneidend | Geraden ✓ | |
| | M.RF.GF.WINKEL | Winkel | Winkel ✓ | |
| | M.RF.GF.WINKELPAARE | Winkelpaare an Geraden | Geraden ✓ | |
| | M.RF.GF.KOORDINATEN | Koordinatensystem | Gitter ✓ (vorher ohne Bild, die Tabelle war falsch) | |
| | M.RF.KP.DARSTELLEN | Würfel und Quader darstellen | Netz, Schrägbild ✓ | |
| | M.RF.SY.SYMMETRIE | Symmetrische Figuren | Gitter ✓ | |
| | M.RF.SY.SPIEGELN | An einer Geraden spiegeln | Gitter ✓ | |
| | M.RF.SY.BEWEGUNGEN | Spiegeln, Verschieben, Drehen | Gitter ✓ | |
| Daten und Zufall | M.DZ.DA.MITTELWERT | Arithmetisches Mittel | Säulen | Summe, teilen |

Die Einträge in „Bild“ und „Schritte“ sind Vorschläge der Gesamtsicht, keine Prüfung. Ein ✓ heißt: Paket Q-L2 für diese Kompetenz erledigt (Bild oder Werkzeug an der Stelle, die erklärt). Die Sitzung, die ein Feld übernimmt, prüft sie an den Dateien und korrigiert die Tabelle.

## Startsätze

- **Lernkern:** „Lies CLAUDE.md, `docs/SESSION-PROMPT.md`, `docs/session/LERNKERN.md` und `docs/session/QUALITAET-5-10.md`. Arbeite im Strang Lernkern an Meilenstein M5: zuerst Q-L2 für das Feld Raum und Form (Klasse 5), dann Q-L1 für dasselbe Feld. Je Feld ein PR. Melde nach jedem PR kurz in einfachem Deutsch.“
- **Oberfläche:** „Lies CLAUDE.md, `docs/SESSION-PROMPT.md`, `docs/session/OBERFLAECHE.md` und `docs/session/QUALITAET-5-10.md`. Mach Q-O1: Rundgang der Lern-Oberfläche auf 390 px, Mängelliste mit Bildschirmfotos an den PV, dann warten, was er wählt.“
- **Grafik:** „Lies CLAUDE.md, `docs/SESSION-PROMPT.md`, `docs/session/GRAFIK.md` und `docs/session/QUALITAET-5-10.md`. Mach Q-G1: Tempo der Bastion. Erster PR: Ticker nur bei Bewegung, mit Messung vorher und nachher.“

## Übergaben

Jede Sitzung trägt am Ende hier ein: Paket, Stand, PR-Nummer, Erledigtes mit Datum durchstreichen, neue Rückfragen an den PV. Dazu eine Zeile im Protokoll des eigenen Strangs und die Zeile des Strangs in `docs/PLAN.md` §1.

- **05.11.2026, Gesamtsicht (Branch `claude/qualitaet-5-10-auftrag`):** Auftrag angelegt, K-32 im Entscheidungslog, Regel 7 aufgehoben, 11/12 angehalten, `pnpm review --klasse N`. Noch kein Paket begonnen.
- **05.11.2026, Oberfläche (Branch `oberflaeche/q-o1-lernoberflaeche`):** Q-O1 Schritt 1 und 2 erledigt: Rundgang auf 390 × 844 px (74 Bildschirme, kein JS-Fehler, ein Überlauf) und Mängelliste A1–D5 oben bei Q-O1, Bildschirmfotos im Scratchpad. Noch nichts gebaut. Rückfrage an den PV, welche Punkte vor den Tests: **Antwort (über die koordinierende Sitzung): alle, Reihenfolge (1) bis (5).** #282 gemergt.
- **05.11.2026, Oberfläche (Branch `oberflaeche/q-o1-fehler`):** PR (1) ~~A1, A2, A3~~ erledigt (Fehler).
- **05.11.2026, Oberfläche (Branch `oberflaeche/q-o1-rueckmeldung`):** PR (2) ~~B1, B2, D5~~ erledigt (Rückmeldung als ein Kasten).
- **05.11.2026, Oberfläche (Branch `oberflaeche/q-o1-themenwahl`):** PR (3) ~~B3, B4, C1, C3, C4, D2~~ erledigt (Themenwahl).
- **05.11.2026, Oberfläche (Branch `oberflaeche/q-o1-erstvermittlung`):** PR (4) ~~D1, B9, C2~~ erledigt (Erstvermittlung). Als Nächstes PR (5): Kleines (B5–B8, C5, C6, D3, D4).
- **06.11.2026, Oberfläche (Branch `oberflaeche/q-o1-kleines`):** PR (5) ~~B5, B6, B7, B8, C5, C6, D3, D4~~ erledigt (Kleines). Damit ist die Mängelliste von Q-O1 abgearbeitet; B10 (Inhalt) liegt beim Lernkern. Offen beim Strang Grafik: Mehrzahl „Steine“ für das Thema Bastion (Wunsch in `GRAFIK.md`).
- **05.11.2026, Grafik, Q-G1 PR 1 (Branch `grafik/q-g1-ticker`):** Takt der Bühne: Pixi-Ticker steht bei „ruhig“, beim Zoomen und Schwenken und ohne bewegte Teile, sonst 30 Hz statt 60; Einzelbild bei Änderung. Messwerkzeug `pnpm tempo` (GRAFIK §29, Zahlen vorher/nachher dort). Befund für die nächsten PRs: Beim Zoomen bleibt der Hauptfaden auch mit stehender Bühne voll, Ursache liegt in der Kulisse (Punkt 2). Offen beim PV: Messung am iPhone 13 nach jedem PR, Referenzgeräte (Q-G0).
