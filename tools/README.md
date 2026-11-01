# tools

Werkzeuge für Entwicklung und Build: Größenbudget, Inhalts-Build und -Prüfung, Balancing-Simulator (`sim/`, `pnpm sim`, BASEBAU §8).

## Prüfbogen (`pruefbogen/`)

Setzt für die fachliche Prüfung (INHALTSFORMAT §8, Stufe 2) alles zu ausgewählten Kompetenzen als druckbare Seite zusammen. Der Bogen zeigt die Erstvermittlung Schritt für Schritt mit Antworten und Rückwegen, die Fehlvorstellungen mit allen Rückmeldungen, die auf sie zeigen, und je Vorlage und Niveau 20 erzeugte Aufgaben mit Lösung, außerdem die Fachbegriffe. Zu jedem Abschnitt gehören Ankreuzfelder und Platz für Anmerkungen.

```sh
pnpm pruefbogen M.ZO.BR.BEGRIFF M.ZO.BR.ERWEITERN M.ZO.BR.ADD-SUB > pruefbogen.html
```

Die Datei im Browser öffnen und als PDF drucken (T-17). Sie kommt nicht ins Repository.

Mit `--online --name "Musterfeld Brüche"` entsteht stattdessen eine Seite zum Ausfüllen als Artefakt auf claude.ai (`online.ts`). Die prüfende Person kreuzt dort an, wählt je Abschnitt ein Urteil und schreibt Anmerkungen. Die Eingaben landen in der Datenbank der Seite, in der Sammlung `bewertung` mit einem Dokument je Abschnitt (`A-<Kompetenz>`, `B-<Fehlvorstellung>`, `C-<Vorlage>`, `D-begriffe`, `kopf`), und lassen sich von dort einarbeiten. Diese Seite gehört nicht zur App: Sie lädt Schriften von Google Fonts und nutzt die Laufzeit von claude.ai. Die Regeln der App (kein Netz, keine externen Schriften) gelten für sie darum nicht. Das Werkzeug lädt die Generatoren über Vite (`import.meta.glob`), darum startet `lauf.ts` sie mit `runnerImport`.

## Arbeitsblatt (`pruefbogen/arbeitsblatt.ts`)

Druckbares Arbeitsblatt für Lehrkräfte (FOKUS F6): neue Aufgaben zu einer oder mehreren Kompetenzen auf einem Niveau.

```sh
pnpm arbeitsblatt M.ZO.BR.BEGRIFF M.ZO.BR.ERWEITERN M.ZO.BR.ADD-SUB --niveau G --anzahl 12 --seed 7 > blatt.html
```

Seite 1 hat einen Kopf mit Name, Datum und Thema und die Aufgaben mit kariertem Rechenkasten. Danach folgt eine eigene Seite mit Lösungen und Lösungsweg für die Lehrkraft. Die Fußzeile nennt die Review-Stufe der schwächsten benutzten Vorlage („Entwurf, nicht fachlich geprüft“ bei Stufe 0). Die Vorlagen kommen der Reihe nach dran, jede gleich oft; doppelte Aufgaben werden neu gezogen. Gleiche Angaben und gleicher Seed ergeben dasselbe Blatt. Ohne `--seed` wird eine Nummer gewürfelt; sie steht als „Arbeitsblatt Nr.“ auf dem Blatt. Brüche und Hochzahlen setzt derselbe Teil wie im Prüfbogen (`satz.ts`, aus `src/core/learning/text.ts`). Im Browser öffnen und als PDF drucken. Das Werkzeug legt die PDF-Technik für U7 nicht fest.

## Review-Vermerk (`review/`)

`pnpm review` zeigt die wirksamen Review-Stufen aller Inhaltsdateien und veraltete Vermerke. `pnpm review setzen --stufe N --pruefer "…" <Kennungen>` schreibt den Block `review:` (INHALTSFORMAT §8). Eine Stufe braucht die vorige. Es schreibt alle Dateien oder keine.
