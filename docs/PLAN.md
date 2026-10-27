# Bastion – Plan

Status: v0.1 · Stand: 27.10.2026
Roadmap-Begründung: `KONZEPT.md` §12–13. Dieses Dokument enthält nur **Stand und Aufgaben**.

---

## 1. Aktueller Stand

| | |
|---|---|
| Aktuelle Phase | **0 – Fundament** |
| Erledigt | `VISION.md`, `KONZEPT.md` v0.2, `ARCHITEKTUR.md` v0.2, `BASEBAU.md` v0.1, `LEHRPLAN.md` v0.1, `INHALTSFORMAT.md` v0.1, `DATENMODELL.md` v0.2 (Entwürfe; DATENMODELL bestätigt), `PLAN.md`, `SESSION-PROMPT.md`; Repository angelegt; `LICENSE`; technisches Gerüst 0.7–0.9 |
| Nächster Schritt | CI auf GitHub prüfen, GitHub Pages einrichten, dann 0.10 Referenzgeräte |
| Blocker | keine |

## 2. Phasenübersicht

| Phase | Name | Status |
|---|---|---|
| 0 | Fundament | 🔄 läuft |
| 1 | Lern-MVP (Mathe Kl. 5–6) | ⏳ |
| 2 | Bastion-Mechanik (Listenansicht, Simulator) | ⏳ |
| 3 | Bastion sichtbar (Grafik, QR) | ⏳ |
| 4 | Mathe Sek I + Belagerungen | ⏳ |
| 5 | Sprache (Operatoren, DaZ, Hilfesprache) | ⏳ |
| 6 | Zweites Fach + Portfolio | ⏳ |
| – | Horizont (Oberstufe, berufliche Bildung …) | ohne Termin |

Phasen haben Prüfkriterien, keine Termine (KONZEPT §12.2). Jede Phase ist ein GitHub-Milestone, jede Aufgabe ein Issue (T-12).

## 3. Phase 0 – Fundament

**Ziel:** Alle Grundsatzentscheidungen sind bestätigt, das Kompetenzmodell für Mathe 5/6 steht als Ausschnitt, und ein leeres, aber vollständig offline lauffähiges Gerüst wird automatisch gebaut und getestet.

**Prüfkriterium (Phase-Ende):**
- Kein Eintrag in den Entscheidungslogs steht mehr auf „Vorgeschlagen“, der Phase 1 betrifft.
- Die Gerüst-App lädt einmal online und startet danach im Flugmodus.
- CI prüft bei jedem Push: Lint inkl. Ordnergrenzen, Tests, Build, Größenbudget.

### Block A – Repository und Entscheidungen

- [x] **0.1 Repository anlegen** (Milestones und Issues noch offen)
  - Name `bastion`, `docs/` mit allen Dokumenten, `README.md`
  - Sichtbarkeit (öffentlich/privat) hängt an O-8; bis dahin privat
  - Milestones für Phase 0–6 anlegen, Aufgaben dieser Liste als Issues
- [x] **0.2 Entscheidungs-Review** – Protokoll in `docs/ENTSCHEIDUNGEN.md`
  - Alle K-, T-, B-Entscheidungen durchgehen: bestätigen, ändern oder verwerfen
  - Status in den Logs aktualisieren
- [x] **0.3 Offene Entscheidungen vor Phase 1 klären** – AGPL-3.0 / CC BY-SA 4.0; Inhalte: Generatoren + KI-Entwürfe mit Prüfung + OER
  - O-8 Lizenz für Code und Inhalte
  - O-2 Inhaltsquellen (Tendenz: Generatoren + KI-gestützte Eigenproduktion mit Prüfpflicht + passende OER)
  - Erledigt: offizieller AGPL-Text als `LICENSE` angelegt. Offen: Repo öffentlich schalten

### Block B – Konzeptdokumente für Phase 1

- [x] **0.4 `docs/LEHRPLAN.md` – Kompetenzmodell** (Entwurf v0.1; offen: KMK-Abgleich am Original, L-O1)
  - Schema: Kompetenz (ID, Kann-Satz, Niveaus, Voraussetzungen, Bezug zu KMK-Leitideen, Klassenstufe)
  - Ausschnitt Mathe Kl. 5–6: 3–4 Kompetenzbereiche (Vorschlag: natürliche Zahlen und Rechenverfahren, Teilbarkeit, Brüche, Größen und Einheiten)
  - Pro Kompetenz drei Niveau-Beschreibungen
- [x] **0.5 `docs/INHALTSFORMAT.md`** (Entwurf v0.1)
  - Aufgabenformat (YAML/Markdown + JSON-Schema), Pflichtfeld `review`
  - Generator-Schnittstelle `seed → Aufgabe + Lösung + Lösungsweg`
  - Paketformat (Fach × Bereich × Niveau, Version, Prüfsumme)
  - Ein vollständiges Beispiel pro Aufgabentyp und ein Beispielgenerator (Pseudocode)
- [x] **0.6 `docs/DATENMODELL.md`** (v0.2, Entscheidungen bestätigt)
  - Ereignistypen (LearningEvent, LedgerEntry, BuildAction, Snapshot) mit Feldern
  - Schemaversionierung und Migrationsregeln
  - Exportformat (verschlüsselt) und Importregeln
  - Verdichtung alter Ereignisse (Frist, Zusammenfassungen)

### Block C – Technisches Gerüst

- [x] **0.7 Projekt aufsetzen** (0.7a–d, ARCHITEKTUR §4.6–4.8)
  - Vite + Svelte 5 + TypeScript (strict), pnpm, Versionen gepinnt
  - Ordnerstruktur nach ARCHITEKTUR §3/§13 (`src/core/…`, `src/storage/`, `src/ui/`, `tools/`)
  - Lint-Regel für Ordnergrenzen (`core` ohne UI-Importe, `bastion` nur auf `ledger`)
  - RTL-fähiges Grund-CSS (Logical Properties), Oberflächentexte in einer Textdatei
  - Kern-Grundlagen: `rng` mit Seed, ULID (D-13), Lerntag ab 4:00 Uhr
- [x] **0.8 Offline-Hülle** (ARCHITEKTUR §4.9)
  - vite-plugin-pwa, Manifest, Service Worker mit Precaching
  - Update-Strategie: Hinweis an Nutzer, nie Aktualisierung mitten in einer Sitzung
  - `navigator.storage.persist()` anfragen
- [x] **0.9 Tests und CI (GitHub Actions)** (ARCHITEKTUR §4.10; CI grün; offen: Übernahme nach `main`, Pages-Quelle einstellen)
  - Vitest (Beispieltest im Kern), Playwright-Test „erster Start, dann offline neu laden“
  - CI-Schritte: Lint → Tests → Build → Größenbudget (ARCHITEKTUR §9)
  - Automatisches Deployment auf GitHub Pages für Testversionen
- [ ] **0.10 Referenzgeräte und Messung**
  - Drei Referenzgeräte festlegen (altes Android, Chromebook, älteres iPad – oder verfügbarer Ersatz)
  - Erste Messung der Gerüst-App, Ergebnis in `ARCHITEKTUR.md` §9 eintragen

### Block D – Menschen

- [ ] **0.11 Testjugendliche gewinnen**
  - 3–5 Jugendliche Kl. 5–6, möglichst aus unterschiedlichen Schulformen
  - Einverständnis der Eltern einholen; kurz schriftlich festhalten, was getestet und was beobachtet wird
  - Keine Daten der Testpersonen im Repository

## 4. Phase 1 – Vorschau

Wird zu Beginn von Phase 1 in Aufgaben zerlegt. Grobe Bausteine:

1. Kern: Kompetenzgraph laden, Aufgaben-Engine, Auswertung
2. Generatoren für die Kompetenzen aus 0.4
3. FSRS-Anbindung, Wiederholungsmodus, Rückkehrmodus
4. Diagnose-Modus
5. Elternbereich (PIN, Stufe „begleitet“, Kompetenzbericht)
6. Export/Import, Sicherungs-Erinnerung
7. Abschlussbildschirm „Was habe ich heute gekonnt?“ (zunächst ohne Ressourcen)
8. Ledger bucht bereits im Hintergrund (B-10), ohne Anzeige
9. Testrunde mit Testjugendlichen

## 5. Änderungsprotokoll

| Datum | Änderung |
|---|---|
| 27.10.2026 | Plan angelegt; Phase 0 gestartet; Arbeit im GitHub-Repository festgelegt |
| 27.10.2026 | Repository angelegt; `LEHRPLAN.md` v0.1 mit 23 Kompetenzen Mathe Kl. 5–6 |
| 27.10.2026 | `INHALTSFORMAT.md` v0.1: YAML-Format, Generator-Schnittstelle, Fehlerbilder, Review per Hash |
| 27.10.2026 | Entscheidungs-Review abgeschlossen; Lizenz festgelegt; `CLAUDE.md` angelegt (T-13) |
| 27.10.2026 | `DATENMODELL.md` v0.1: Ereignisse, Projektionen, Export/Import, Zusammenführen, Verdichtung, Datenschutzprüfung; Block B abgeschlossen |
| 27.10.2026 | `LICENSE` (AGPL-3.0); Block C 0.7–0.9: Gerüst, Leitplanken, Kern-Grundlagen, Offline-Hülle, Tests und CI |
