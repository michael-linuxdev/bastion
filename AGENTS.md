# AGENTS.md – Hinweise für Coding-Agenten (Cursor, Codex und andere)

Es gelten dieselben Regeln wie für Claude Code: **`CLAUDE.md` zuerst lesen**, dann `docs/SESSION-PROMPT.md` und die Datei des eigenen Strangs (`docs/session/LERNKERN.md` oder `docs/session/GRAFIK.md`).

Damit parallele PRs nicht an denselben Stellen zusammenstoßen:

1. **Branch-Name** `lernkern/…` oder `grafik/…`. Nur im eigenen Bereich ändern (Tabelle in `docs/SESSION-PROMPT.md`).
2. **Protokoll:** eine Zeile je PR **unten** in `docs/session/LERNKERN-PROTOKOLL.md` oder `docs/session/GRAFIK-PROTOKOLL.md` anhängen. Sonst nichts in diesen Dateien ändern.
3. **Nicht ändern:** `docs/PLAN.md` §5 (keine neuen Zeilen) und `docs/SESSION-PROMPT.md` (nur bei neuen Regeln für alle Stränge, mit Rückfrage). Der Stand eines Strangs gehört in seine Strang-Datei.
4. **Lern-Oberfläche eingefroren** (seit 01.11.2026, bis nach dem Test U4b): in `src/ui/ueben/`, `src/ui/vermittlung/`, `src/ui/eingabe/`, `src/ui/eltern/` und `src/ui/start/` nur Fehlerbehebungen und Pakete aus `docs/session/FOKUS.md`. Grafik arbeitet nur an Paket G (`docs/SESSION-PROMPT.md`, Regel 7).
5. **Vor dem PR** `origin/main` hineinmergen (kein Rebase) und `pnpm lint`, `pnpm test`, `pnpm build` laufen lassen.

`pnpm test` prüft Regel 2 und 3 (`tools/dokumente.test.ts`).
