# Protokoll Strang Lernkern

> Neue Zeilen **unten anhängen**, eine Zeile je PR, nichts anderes in dieser Datei ändern.
> Git führt diese Datei beim Mergen selbst zusammen (`merge=union` in `.gitattributes`): Hängen zwei PRs gleichzeitig eine Zeile an, bleiben beide stehen.
> Einträge bis 31.10.2026 stehen in `docs/PLAN.md` §5.

| Datum | Änderung |
|---|---|
| 31.10.2026 | **Session-Prompt getrennt:** gemeinsamer Teil, Strang Lernkern, Strang Grafik |
| 31.10.2026 | **Stufe 1 Musterfeld Brüche:** 22 Dateien gegen den Prüfkatalog (INHALTSFORMAT §8) gelesen, 14 Funde in 11 Dateien behoben, Vermerk gesetzt |
| 31.10.2026 | **Konflikte vermeiden:** Protokolle in eigenen Dateien mit `merge=union`, `AGENTS.md` für Cursor, Test `tools/dokumente.test.ts` |
| 01.11.2026 | **Fokus-Auftrag „Prüfen statt Bauen“:** `docs/session/FOKUS.md` mit Paketen F1–F10 aus dem Review; Verweis im Session-Prompt |
| 01.11.2026 | **F1 Fokus:** Rückfragen beantwortet (FOKUS.md „Entscheidungen“, T-20); Lern-Oberfläche eingefroren (SESSION-PROMPT Regel 7, AGENTS.md), Grafik nur Paket G, Design-Wellen und Backlog AA–ZZ ruhen bis nach U4b |
| 01.11.2026 | **Fokus Paket L:** Lern-Oberfläche erst abschließen, dann einfrieren (PV); L vor F2, U4b erst nach Abnahme von L und G (FOKUS.md, SESSION-PROMPT Regel 7, AGENTS.md) |
| 01.11.2026 | **Paket L (Lern-Oberfläche):** Mängelliste L1–L20, umgesetzt L1–L17, L19, L20; Startseite (L16, L17) und `MiniBastion` vom Lernkern auf Wunsch des PV; offen L18 und Abnahme |
| 01.11.2026 | **Fokus F1 geändert:** Lern-Oberfläche nicht jetzt einfrieren, Verbesserungen im Lernkern erwünscht; Einfrieren erst ab Termin U4b (PV) |
| 01.11.2026 | **F4 Auswertung U4b:** `pnpm auswertung` (`tools/auswertung/`) mit reinen Rechnungen in `src/core/testphase/auswertung.ts`; Einstiegsaufgaben in `TESTS.md` §4.5 festgelegt (erste 3 auf Niveau G nach der Erstvermittlung, ohne Tipp); Tests mit synthetischen Protokollen (erfüllt / knapp gescheitert) |
| 01.11.2026 | **F5 Fehler-Schüler:** Bestandsaufnahme der Prüfungen in `tools/inhalte/`, nur Lücken gefüllt; `pnpm fehlerschueler` meldet Verdachtsfälle A–E je Feld (100: A 18, B 58, C 2, D 5, E 17), nicht korrigiert; Test mit erfundenen Inhalten in `pnpm test`, voller Lauf nicht |
| 01.11.2026 | **F6 Arbeitsblätter:** `pnpm arbeitsblatt` (Werkzeug außerhalb der App, HTML zum Drucken, Lösungsseite, Review-Stufe in der Fußzeile, gleicher Seed = gleiches Blatt); Satz-Hilfen aus dem Prüfbogen in `satz.ts`; PDF-Technik für U7 bleibt offen |
| 01.11.2026 | **PV-Entscheidung Reihenfolge:** #145 mergen, L18 eigener PR; F4, F5, F6 parallel zu L (`FOKUS.md` „Entscheidungen“) |
| 01.11.2026 | **L18 Themenwahl:** Bereiche eingeklappt (offen: erster Bereich und Bereiche mit Fortschritt), Test „Zeichen-Anleitung“ klappt vorher auf; Rundgang 390 px wiederholt, Fotos an den PV; offen nur die Abnahme von L |
| 02.11.2026 | **B4 Fehler-Schüler als CI-Sperrklinke:** `pnpm fehlerschueler --grenze` gegen `tools/inhalte/fehlerschueler-grenze.json` (je Art A–E), rot bei mehr Funden, Hinweis zum Senken bei weniger; eigener CI-Schritt |
