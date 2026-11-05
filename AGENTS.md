# AGENTS.md – Hinweise für Coding-Agenten (Cursor, Codex und andere)

Es gelten dieselben Regeln wie für Claude Code: **`CLAUDE.md` zuerst lesen**, dann `docs/SESSION-PROMPT.md` und die Datei des eigenen Strangs (`docs/session/LERNKERN.md`, `docs/session/GRAFIK.md` oder `docs/session/OBERFLAECHE.md`).

Damit parallele PRs nicht an denselben Stellen zusammenstoßen:

1. **Branch-Name** `lernkern/…`, `grafik/…` oder `oberflaeche/…`. Nur im eigenen Bereich ändern (Tabelle in `docs/SESSION-PROMPT.md`).
2. **Protokoll:** eine Zeile je PR **unten** in `docs/session/LERNKERN-PROTOKOLL.md`, `docs/session/GRAFIK-PROTOKOLL.md` oder `docs/session/OBERFLAECHE-PROTOKOLL.md` anhängen. Sonst nichts in diesen Dateien ändern.
3. **Nicht ändern:** `docs/PLAN.md` §5 (keine neuen Zeilen) und `docs/SESSION-PROMPT.md` (nur bei neuen Regeln für alle Stränge, mit Rückfrage). Der Stand eines Strangs gehört in seine Strang-Datei.
4. **Auftrag „Qualität Klasse 5 bis 10“** (`docs/session/QUALITAET-5-10.md`, seit 05.11.2026, K-32): Das Einfrieren der Lern-Oberfläche ist aufgehoben. In `src/ui/ueben/`, `src/ui/vermittlung/` und `src/ui/eingabe/` ändert der Strang Oberfläche Aufbau und Aussehen (Q-O1), der Lernkern die Logik. `src/ui/start/` und `src/ui/eltern/` gehören dem Strang Oberfläche. Grafik arbeitet nur am Tempo der Bastion (Q-G1). Jahrgang 11/12 ruht (`docs/SESSION-PROMPT.md`, Regel 7).
5. **Vor dem PR** `origin/main` hineinmergen (kein Rebase) und `pnpm lint`, `pnpm test`, `pnpm build` laufen lassen.

`pnpm test` prüft Regel 2 und 3 (`tools/dokumente.test.ts`).
