# tools

Werkzeuge für Entwicklung und Build: Größenbudget, Inhalts-Build und -Prüfung, Balancing-Simulator (`sim/`, `pnpm sim`, BASEBAU §8).

## Prüfbogen (`pruefbogen/`)

Setzt für die fachliche Prüfung (INHALTSFORMAT §8, Stufe 2) alles zu ausgewählten Kompetenzen als druckbare Seite zusammen. Der Bogen zeigt die Erstvermittlung Schritt für Schritt mit Antworten und Rückwegen, die Fehlvorstellungen mit allen Rückmeldungen, die auf sie zeigen, und je Vorlage und Niveau 20 erzeugte Aufgaben mit Lösung, außerdem die Fachbegriffe. Zu jedem Abschnitt gehören Ankreuzfelder und Platz für Anmerkungen.

```sh
pnpm pruefbogen M.ZO.BR.BEGRIFF M.ZO.BR.ERWEITERN M.ZO.BR.ADD-SUB > pruefbogen.html
```

Die Datei im Browser öffnen und als PDF drucken (T-17). Sie kommt nicht ins Repository.

Mit `--online --name "Musterfeld Brüche"` entsteht stattdessen eine Seite zum Ausfüllen als Artefakt auf claude.ai (`online.ts`). Die prüfende Person kreuzt dort an, wählt je Abschnitt ein Urteil und schreibt Anmerkungen. Die Eingaben landen in der Datenbank der Seite, in der Sammlung `bewertung` mit einem Dokument je Abschnitt (`A-<Kompetenz>`, `B-<Fehlvorstellung>`, `C-<Vorlage>`, `D-begriffe`, `kopf`), und lassen sich von dort einarbeiten. Diese Seite gehört nicht zur App: Sie lädt Schriften von Google Fonts und nutzt die Laufzeit von claude.ai. Die Regeln der App (kein Netz, keine externen Schriften) gelten für sie darum nicht. Das Werkzeug lädt die Generatoren über Vite (`import.meta.glob`), darum startet `lauf.ts` sie mit `runnerImport`.

## Auswertung der Testprotokolle (`auswertung/`)

Wertet die Testprotokoll-Dateien aus U4b aus (`TESTS.md` §4.5) und schreibt einen Bericht in Markdown: Kriterium 1 (Einstiegsaufgaben nach der Erstvermittlung) und F5 (falsche Antworten mit Fehlerbild) aus `STRATEGIE.md` §0 mit ja, nein oder „noch offen“, die unbekannten Fehler je Vorlage und je Person Zwischenschritte, „Weiter ohne Weg“ und abgebrochene Erstvermittlungen.

```sh
pnpm auswertung protokoll-1.json protokoll-2.json > bericht.md
```

Personen heißen im Bericht „Person 1 …“; `--nummern` setzt die Teilnehmer-Nummern dazu. Protokolle und Bericht kommen nicht ins Repository. Die Rechnungen stehen rein und getestet in `src/core/testphase/auswertung.ts`.

## Review-Vermerk (`review/`)

`pnpm review` zeigt die wirksamen Review-Stufen aller Inhaltsdateien und veraltete Vermerke. `pnpm review setzen --stufe N --pruefer "…" <Kennungen>` schreibt den Block `review:` (INHALTSFORMAT §8). Eine Stufe braucht die vorige. Es schreibt alle Dateien oder keine.
