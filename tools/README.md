# tools

Werkzeuge für Entwicklung und Build: Größenbudget, Inhalts-Build und -Prüfung, Balancing-Simulator (`sim/`, `pnpm sim`, BASEBAU §8).

## Prüfbogen (`pruefbogen/`)

Setzt für die fachliche Prüfung (INHALTSFORMAT §8, Stufe 2) alles zu ausgewählten Kompetenzen als druckbare Seite zusammen. Der Bogen zeigt die Erstvermittlung Schritt für Schritt mit Antworten und Rückwegen, die Fehlvorstellungen mit allen Rückmeldungen, die auf sie zeigen, und je Vorlage und Niveau 20 erzeugte Aufgaben mit Lösung, außerdem die Fachbegriffe. Zu jedem Abschnitt gehören Ankreuzfelder und Platz für Anmerkungen.

```sh
pnpm pruefbogen M.ZO.BR.BEGRIFF M.ZO.BR.ERWEITERN M.ZO.BR.ADD-SUB > pruefbogen.html
```

Die Datei im Browser öffnen und als PDF drucken (T-17). Sie kommt nicht ins Repository.

Die Logik steht als reines Modell im Kern (`src/core/learning/pruefbogen.ts`); `bogen.ts` setzt daraus nur das HTML. Zum Ausfüllen am Bildschirm gibt es seit 02.11.2026 die Prüfseite in der App: Elternbereich → „Für Lehrkräfte: Inhalte prüfen“ (ARCHITEKTUR T-22). Sie zeigt dasselbe Modell, speichert die Urteile auf dem Gerät und gibt sie mit „Ergebnis herunterladen“ als Datei aus. Die frühere Artefakt-Seite (`--online`) ist entfallen. Das Werkzeug lädt die Generatoren über Vite (`import.meta.glob`), darum startet `lauf.ts` sie mit `runnerImport`.

## Auswertung der Testprotokolle (`auswertung/`)

Wertet die Testprotokoll-Dateien aus U4b aus (`TESTS.md` §4.5) und schreibt einen Bericht in Markdown: Kriterium 1 (Einstiegsaufgaben nach der Erstvermittlung) und F5 (falsche Antworten mit Fehlerbild) aus `STRATEGIE.md` §0 mit ja, nein oder „noch offen“, die unbekannten Fehler je Vorlage und je Person Zwischenschritte, „Weiter ohne Weg“ und abgebrochene Erstvermittlungen.

```sh
pnpm auswertung protokoll-1.json protokoll-2.json > bericht.md
```

Personen heißen im Bericht „Person 1 …“; `--nummern` setzt die Teilnehmer-Nummern dazu. Protokolle und Bericht kommen nicht ins Repository. Die Rechnungen stehen rein und getestet in `src/core/testphase/auswertung.ts`.

### Eingaben einlesen (`pruefbogen/einlesen.ts`, FOKUS F3)

```sh
pnpm pruefbogen einlesen bewertung.json > arbeitsliste.md
```

`bewertung.json` ist die Datei, die die Prüfseite der App mit „Ergebnis herunterladen“ erzeugt (`bastion-pruefung-<Datum>.json`, Form aus `exportDokumente` im Kern): eine Liste mit einem Dokument je Abschnitt, `{ id, data: { werte, stand } }`, `kopf` zuerst. Angenommen werden auch `doc_id` statt `id`, `{ documents: [...] }` oder `{ "<id>": … }`. Die Datei kommt per E-Mail und nicht ins Repository. Die Arbeitsliste nennt je Abschnitt Urteil, abgehakte Prüffragen und Zeilen, die Anmerkung, in Teil A die Schritte mit „passt nicht“ oder Kommentar samt Schritt-ID aus `vermittlung.yaml`, und die Dateien: Teil A `kompetenz.yaml` und `vermittlung.yaml`, Teil B die Fehlvorstellung, Teil C die Vorlage, Teil D (Fachbegriffe) keine. Für Dateien, deren Abschnitt „passt“ und die gültige Stufe 1 haben, schlägt sie `pnpm review setzen --stufe 2 --pruefer "<Name>" …` vor. Sie setzt nichts selbst. „Passt mit Änderung“ und „falsch“ landen unter „Zu ändern“. Beispiel mit erfundenen Werten: `pruefbogen/beispiel/bewertung.json`.

## Arbeitsblatt (`pruefbogen/arbeitsblatt.ts`)

Druckbares Arbeitsblatt für Lehrkräfte (FOKUS F6): neue Aufgaben zu einer oder mehreren Kompetenzen auf einem Niveau.

```sh
pnpm arbeitsblatt M.ZO.BR.BEGRIFF M.ZO.BR.ERWEITERN M.ZO.BR.ADD-SUB --niveau G --anzahl 12 --seed 7 > blatt.html
```

Seite 1 hat einen Kopf mit Name, Datum und Thema und die Aufgaben mit kariertem Rechenkasten. Danach folgt eine eigene Seite mit Lösungen und Lösungsweg für die Lehrkraft. Die Fußzeile nennt die Review-Stufe der schwächsten benutzten Vorlage („Entwurf, nicht fachlich geprüft“ bei Stufe 0). Die Vorlagen kommen der Reihe nach dran, jede gleich oft; doppelte Aufgaben werden neu gezogen. Gleiche Angaben und gleicher Seed ergeben dasselbe Blatt. Ohne `--seed` wird eine Nummer gewürfelt; sie steht als „Arbeitsblatt Nr.“ auf dem Blatt. Brüche und Hochzahlen setzt derselbe Teil wie im Prüfbogen (`satz.ts`, aus `src/core/learning/text.ts`). Im Browser öffnen und als PDF drucken.

Die Blatt-Logik (Ziehen, Review-Stufe, Punkte, Lösung als Text) liegt seit 02.11.2026 im Kern, `src/core/learning/arbeitsblatt.ts`. Dieselbe Logik nutzt der Elternbereich der App („Für Lehrkräfte: Aufgabenblatt drucken“). Hier steht nur der HTML-Satz. Die PDF-Technik ist vorläufig entschieden: Druckdialog des Browsers, keine Abhängigkeit (ARCHITEKTUR T-21).

## Fehler-Schüler (`inhalte/fehlerschueler.ts`)

`pnpm fehlerschueler [--seeds 200] > verdacht.md` spielt die Diagnose regelbasiert durch und listet Verdachtsfälle je Feld (Arten A–E, INHALTSFORMAT §8). Er korrigiert nichts. Der Lauf über alle Inhalte dauert wenige Sekunden. Er ist nicht Teil von `pnpm test`, dort läuft nur ein kleiner Test mit erfundenen Inhalten. Er startet die Generatoren wie der Prüfbogen über `runnerImport`.

**Sperrklinke (B4, Entscheidung PV 01.11.2026):** `pnpm fehlerschueler --grenze` vergleicht die Zahl der Funde je Art mit `inhalte/fehlerschueler-grenze.json` und endet mit Fehler, wenn eine Art mehr Funde hat. Die CI führt das bei jedem Push aus. Wer Funde behebt, senkt die Zahl in der Datei im selben PR; das Werkzeug sagt, auf welchen Wert. Erhöhen ist nicht vorgesehen.

## Review-Vermerk (`review/`)

`pnpm review` zeigt die wirksamen Review-Stufen aller Inhaltsdateien und veraltete Vermerke. `pnpm review setzen --stufe N --pruefer "…" <Kennungen>` schreibt den Block `review:` (INHALTSFORMAT §8). Eine Stufe braucht die vorige. Es schreibt alle Dateien oder keine.
