# Session-Prompt

> Diese Datei ist der Einstieg in jede Arbeitssitzung – allein oder mit KI-Unterstützung.
> Am Ende jeder Sitzung wird sie aktualisiert und mit committet.

Stand: 27.10.2026 (6) · Phase 0 – Fundament

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

**Phase 0 abschließen.** Ausführung mit Claude Code; Regeln in `CLAUDE.md`.

1. **CI auf GitHub prüfen:** Der Workflow `.github/workflows/ci.yml` muss auf `main` grün laufen. Dazu den Branch der letzten Sitzung nach `main` übernehmen.
2. **GitHub Pages einrichten:** *Settings → Pages → Source: GitHub Actions*. Für private Repositories braucht Pages einen kostenpflichtigen Plan – sonst erst nach dem Öffentlich-Schalten (O-8).
3. **Probe im Flugmodus:** Testversion auf einem Handy öffnen, warten bis „funktioniert jetzt auch ohne Internet“ erscheint, Flugmodus an, neu öffnen.
4. **0.10 Referenzgeräte und Messung** (`PLAN.md`): drei Geräte festlegen, Gerüst-App messen, Ergebnis in `ARCHITEKTUR.md` §9 eintragen.
5. Offen aus Block A: Milestones und Issues für die Phasen anlegen (T-12), Repository öffentlich schalten (O-8).

Danach: Phase 1 in Aufgaben zerlegen (`PLAN.md` §4).

## Übergabe der letzten Sitzung

- `LICENSE` mit dem offiziellen AGPL-3.0-Text angelegt.
- **0.7a** Projekt: Vite 8, Svelte 5 (Runes-Modus erzwungen), TypeScript 6 strict, pnpm 10; alle Versionen exakt gepinnt (ARCHITEKTUR §4.6). TypeScript 7 noch nicht, weil `svelte-check` und `typescript-eslint` es nicht unterstützen.
- **0.7b** Leitplanken (ARCHITEKTUR §4.7): `eslint-plugin-boundaries` für die Ordnergrenzen, Browser-APIs und Svelte in `src/core` verboten, Svelte-Warnungen brechen Lint und Build ab, Prettier. `tools/ordnergrenzen.test.ts` beweist bei jedem Testlauf, dass falsche Importe gemeldet werden.
- **0.7c** Kern: `src/core/rng/rng.ts` (sfc32 mit Seed, feste Referenzwerte im Test), `src/core/rng/ulid.ts` mit `ZufallsQuelle` (D-O1 → D-13 entschieden: eigene Umsetzung), `src/core/policy/lerntag.ts` (4:00 Uhr, UTC-Versatz wird hereingereicht).
- **0.7d** Startseite „Bastion – im Aufbau“, Texte in `src/ui/texte/de.json`, Grund-CSS mit logischen Eigenschaften (per Test erzwungen), Hell/Dunkel nach Systemeinstellung.
- **0.8** Offline-Hülle: Precaching, Manifest, Platzhalter-Icons aus `public/icon.svg`, Update nur nach Zustimmung, `navigator.storage.persist()`.
- **0.9** Playwright-Test „online laden, offline neu laden, keine fremden Anfragen“, Größenbudget-Skript (aktuell ca. 21 KB von 250 KB), CI mit Deployment auf GitHub Pages.
- Lokal geprüft: `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm budget`, `pnpm test:e2e` grün. CI auf GitHub für den Arbeitszweig grün (Lauf 2); Veröffentlichung läuft erst auf `main`.
- Zwei TypeScript-Konfigurationen: `tsconfig.json` (App, ohne Node-Typen) und `tsconfig.node.json` (Werkzeuge, Tests).

## Am Ende der Sitzung aktualisieren

- [ ] „Aktueller Auftrag“ auf den nächsten Schritt setzen
- [ ] „Übergabe der letzten Sitzung“ ersetzen
- [ ] `PLAN.md` Stand und Checkboxen aktualisieren
