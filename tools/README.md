# tools

Werkzeuge für Entwicklung und Build: Größenbudget, Inhalts-Build und -Prüfung, Balancing-Simulator (`sim/`, `pnpm sim`, BASEBAU §8).

## Prüfbogen (`pruefbogen/`)

Setzt für die fachliche Prüfung (INHALTSFORMAT §8, Stufe 2) alles zu ausgewählten Kompetenzen als druckbare Seite zusammen. Der Bogen zeigt die Erstvermittlung Schritt für Schritt mit Antworten und Rückwegen, die Fehlvorstellungen mit allen Rückmeldungen, die auf sie zeigen, und je Vorlage und Niveau 20 erzeugte Aufgaben mit Lösung, außerdem die Fachbegriffe. Zu jedem Abschnitt gehören Ankreuzfelder und Platz für Anmerkungen.

```sh
pnpm pruefbogen M.ZO.BR.BEGRIFF M.ZO.BR.ERWEITERN M.ZO.BR.ADD-SUB > pruefbogen.html
```

Die Datei im Browser öffnen und als PDF drucken (T-17). Sie kommt nicht ins Repository. Das Werkzeug lädt die Generatoren über Vite (`import.meta.glob`), darum startet `lauf.ts` sie mit `runnerImport`.

