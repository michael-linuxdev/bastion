# CLAUDE.md – Arbeitsregeln für Claude Code in Bastion

## Zuerst lesen
1. `docs/SESSION-PROMPT.md` – gemeinsamer Teil, Regeln für parallele Stränge
   und danach die Datei des eigenen Strangs: `docs/session/LERNKERN.md` oder `docs/session/GRAFIK.md` – aktueller Auftrag und letzter Stand
2. `docs/VISION.md` §3 und §9 – die vier Kernaufgaben (Qualitätskriterien), Grundprinzipien und Design-Regeln R1–R7
3. Die im Auftrag genannten Dokumente in `docs/`

Bei Widerspruch zwischen Code und Dokumenten: nachfragen, nicht raten.

## Unverhandelbar
- **Keine KI in der App** (VISION v1.0, K-23): Erklärungen und Rückmeldungen sind vorab geschriebene, geprüfte Inhalte, nichts wird zur Laufzeit von einem Sprachmodell erzeugt.
- **Keine Netzwerkverbindungen** zur Laufzeit außer dem Laden der App und der Inhaltspakete von der eigenen Adresse. Kein Analytics, keine Fehler-Tracking-Dienste, keine CDN-Fonts, keine externen Bilder. Einzige Ausnahme: echtes Wetter von Open-Meteo, nur nach ausdrücklichem Einschalten (ARCHITEKTUR T-15).
- **Keine Werbung, keine Käufe, keine Zufallsbelohnungen, keine Echtzeit-Timer, kein Verfall.**
- **Ordnergrenzen:** `src/core/` importiert nichts aus `src/ui/` oder Browser-APIs. `src/core/bastion/` importiert nur aus `src/core/ledger/`.
- **Keine neue Laufzeitabhängigkeit** ohne Eintrag im Entscheidungslog von `docs/ARCHITEKTUR.md` – vorher fragen.

## Technik
- TypeScript im strengen Modus. Kein `any` ohne Begründung im Kommentar.
- **Svelte 5, ausschließlich Runes-Syntax:** `$state`, `$derived`, `$effect`, `$props`, Ereignisse als `onclick`. Verboten: `export let`, `$:`, `on:click`, Stores für lokalen Komponentenzustand.
- CSS mit Logical Properties (`margin-inline-start` statt `margin-left`) – RTL-Fähigkeit.
- Oberflächentexte nie hart im Code, sondern in der Textdatei für Übersetzungen.
- Generatoren: rein und deterministisch, Zufall nur über `src/core/rng`. Pflicht-Tests nach `docs/INHALTSFORMAT.md` §6.3.
- Datenänderungen nur über Ereignisse (append-only) und mit Schemaversion; jede Migration mit Test.

## Arbeitsweise
- **Kleine Schritte.** Eine Aufgabe, ein Thema, ein Commit. Lieber drei kleine Commits als ein großer.
- **Vor dem Commit:** `pnpm lint`, `pnpm test`, `pnpm build` müssen grün sein.
- **Erkläre jede Änderung in einfachem Deutsch:** Was wurde geändert, warum, wie kann ich es selbst ausprobieren? Der Projektverantwortliche ist kein Framework-Experte.
- **Dokumente im selben Commit aktualisieren**, wenn sich Verhalten, Struktur oder Entscheidungen ändern.
- **Am Ende jeder Sitzung:** die Datei des eigenen Strangs (`docs/session/…`) und den eigenen Abschnitt von `docs/PLAN.md` aktualisieren. `docs/SESSION-PROMPT.md` nur bei Änderungen für alle Stränge.
- **Parallele Stränge:** nur im eigenen Bereich ändern (Tabelle in `docs/SESSION-PROMPT.md`), Branch-Namen `lernkern/…` oder `grafik/…`.
- Commit-Nachrichten auf Deutsch, im Präsens, mit Aufgaben-Nummer: `0.7: Projektgerüst mit Vite und Svelte 5 anlegen`.
