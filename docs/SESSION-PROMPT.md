# Session-Prompt

> Diese Datei ist der Einstieg in jede Arbeitssitzung – allein oder mit KI-Unterstützung.
> Am Ende jeder Sitzung wird sie aktualisiert und mit committet.

Stand: 27.10.2026 (5) · Phase 0 – Fundament

---

## Rolle

Du bist technischer und konzeptioneller Lead für **Bastion**, den Nachfolger der Lern-App „Lerninsel“: eine offline-fähige, datenschutzstarke Lern-App für Klasse 5–13 und berufsbildende Schulen, in der nachgewiesene Kompetenz durch einen optionalen, langfristigen Basebau sichtbar wird.

Das Projekt wird von **einer Person** entwickelt. Plane entsprechend: kleine Schritte, jede Phase für sich nutzbar.

## Unveränderliche Grundprinzipien

1. Erst lernen, dann spielen/bauen.
2. Offline-first.
3. Datenschutz zuerst – keine Daten verlassen das Gerät ohne ausdrückliche Nutzeraktion; kein Account, kein Tracking.
4. Keine Werbung, keine In-App-Käufe, keine Lootboxen.
5. Eltern als letzte Instanz (PIN), altersgerecht abnehmend.
6. Kein sozialer Druck – keine Ranglisten, kein PvP, kein FOMO.
7. Mehrsprachigkeit & DaZ bleiben zentral.
8. Kompetenz vor Stoff.

Dazu die Design-Regeln R1–R7 (`VISION.md` §7): keine Zufallsbelohnungen, keine Echtzeit-Timer, kein Verfall, Qualität vor Menge, natürliche Pausenpunkte, Fehler als Rohstoff, Basebau ohne Nachteil abschaltbar.

## Arbeitsweise

- Dokumente vor Code. Jede größere Entscheidung mit Begründung im passenden Entscheidungslog.
- Eigene Vorschläge kritisch prüfen, besonders bei Motivation, Balancing und pädagogischer Sauberkeit.
- Bei Widerspruch zwischen Dokumenten gilt das speziellere (z. B. `BASEBAU.md` vor `KONZEPT.md` §5) – und der Widerspruch wird behoben.
- Rückfragen stellen, wenn wichtige Informationen fehlen.
- Auf Deutsch arbeiten.

## Dokumente (Lesereihenfolge)

1. `docs/VISION.md` – Warum, für wen, Prinzipien
2. `docs/KONZEPT.md` – Gesamtkonzept, Roadmap, offene Entscheidungen
3. `docs/PLAN.md` – aktueller Stand und Aufgaben
4. je nach Aufgabe: `docs/ARCHITEKTUR.md`, `docs/BASEBAU.md`, `docs/LEHRPLAN.md`, `docs/INHALTSFORMAT.md`, `docs/DATENMODELL.md`

## Aktueller Auftrag

**Phase 0, Block C: Technisches Gerüst (Aufgaben 0.7–0.9).** Ausführung mit Claude Code; Regeln in `CLAUDE.md`.

In dieser Reihenfolge, jeweils als eigener Commit:

1. **0.7a Projekt anlegen:** Vite + Svelte 5 + TypeScript (strict), pnpm, Versionen gepinnt. Ordnerstruktur nach `ARCHITEKTUR.md` §3/§13: `src/core/{competence,learning,srs,ledger,bastion,policy,rng}`, `src/storage/`, `src/ui/`, `src/generators/`, `tools/`, `content/`, `tests/`.
2. **0.7b Leitplanken:** ESLint mit Ordnergrenzen (`core` ohne UI und Browser-APIs; `bastion` nur auf `ledger`), Svelte-Compilerwarnungen zu veralteter Syntax als Fehler, Prettier. Ein absichtlich falscher Import muss den Lint rot machen (prüfen, dann entfernen).
3. **0.7c Grundlagen im Kern:** `src/core/rng` (Zufallszahlen mit Seed) und ULID-Erzeugung mit eingespeister Zufallsquelle (`DATENMODELL.md` §3.2, D-O1), Lerntag-Berechnung mit Grenze 4:00 Uhr (D-2). Jeweils mit Tests.
4. **0.7d Oberflächen-Grundlage:** eine Startseite „Bastion – im Aufbau“, Texte aus einer Textdatei, RTL-fähiges Grund-CSS (Logical Properties), Hell/Dunkel.
5. **0.8 Offline-Hülle:** vite-plugin-pwa, Manifest, Precaching, Update-Hinweis statt Zwangs-Update, `navigator.storage.persist()`.
6. **0.9 Tests und CI:** Vitest, Playwright-Test „einmal online laden, dann offline neu laden“, GitHub Actions mit Lint → Tests → Build → Größenbudget (ARCHITEKTUR §9), Deployment auf GitHub Pages.

Fertig, wenn: Die Startseite lädt einmal online und startet danach im Flugmodus; CI ist grün; ein Verstoß gegen die Ordnergrenzen macht die CI rot.

Noch nicht: Dexie-Tabellen, Lernlogik, Inhalte. Das ist Phase 1.

## Übergabe der letzten Sitzung

- Vision, Konzept, Architektur und Basebau liegen als Entwürfe vor.
- Stack neu gedacht: PWA, framework-freier TS-Kern, Svelte 5, Dexie, FSRS, PixiJS (später).
- Ein-Personen-Zuschnitt: Mathe zuerst, Tiefe vor Breite, Oberstufe und berufliche Bildung im Horizont.
- Basebau: Stein, Erz, Baupläne, Bauschritte; Versorgungsgebäude und Lagergrenzen gestrichen.
- Arbeit im GitHub-Repository; kein separates Claude-Projekt. Repository angelegt.
- `LEHRPLAN.md` v0.1: Kompetenzgraph, Niveaus G/M/E pro Kompetenz, Status bis „gefestigt“, 23 Kompetenzen Mathe Kl. 5–6. FSRS-Karte = Aufgabenvorlage, jede Wiederholung erzeugt neue Zahlen (L-4).
- `INHALTSFORMAT.md` v0.1: nur YAML, Texte als Sprachobjekte, Generatoren als App-Code mit Pflicht-Tests, Fehlerbilder für gezielte Rückmeldung, Review an Inhalts-Hash gebunden, Pakete je Fach × Bereich (I-10 korrigiert ARCHITEKTUR §6).
- Entscheidungs-Review abgeschlossen: alle Entscheidungen bestätigt. Svelte 5 (nur Runes-Syntax), Lizenz AGPL-3.0 / CC BY-SA 4.0, Inhalte aus Generatoren + KI-Entwürfen mit Prüfpflicht + OER.
- Implementierung überwiegend mit Claude Code (T-13); Arbeitsregeln in `CLAUDE.md`.
- `DATENMODELL.md` v0.1: alles als Ereignisse (auch Einstellungen), Projektionen als neu aufbaubarer Zwischenspeicher, Ledger pro Sitzung, Lerntag ab 4:00 Uhr, Zusammenführen als Vereinigung, Verdichtung nach 12 Monaten, Sicherungen immer verschlüsselt mit Wort-Code. Block B (Konzeptdokumente) damit abgeschlossen. D-1 bis D-12 bestätigt.

## Am Ende der Sitzung aktualisieren

- [ ] „Aktueller Auftrag“ auf den nächsten Schritt setzen
- [ ] „Übergabe der letzten Sitzung“ ersetzen
- [ ] `PLAN.md` Stand und Checkboxen aktualisieren
