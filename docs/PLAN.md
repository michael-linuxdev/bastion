# Bastion – Plan

Status: v0.3 · Stand: 29.10.2026
Roadmap-Begründung: `KONZEPT.md` §12–13. **Strategie und Scope bis Monat 12: `STRATEGIE.md`.** Dieses Dokument enthält nur **Stand und Aufgaben**.

---

## 1. Aktueller Stand

| | |
|---|---|
| Aktuelle Phase | **0 – Fundament** |
| Erledigt | `VISION.md`, `KONZEPT.md` v0.2, `ARCHITEKTUR.md` v0.2, `BASEBAU.md` v0.1, `LEHRPLAN.md` v0.1, `INHALTSFORMAT.md` v0.1, `DATENMODELL.md` v0.2 (Entwürfe; DATENMODELL bestätigt), `PLAN.md`, `SESSION-PROMPT.md`; Repository angelegt; `LICENSE`; technisches Gerüst 0.7–0.9; Scope-Entscheidung K-11 bis K-13 (`STRATEGIE.md`) |
| Neue Ausrichtung | **Unterrichtsersatz ohne KI** (29.10.2026, K-23 bis K-28, `VISION.md` v1.0). Arbeitsplan in §4b |
| Nächster Schritt | Fragen in `VERMITTLUNG.md` §8 klären, dann Format für Erstvermittlung und Fehlerkatalog festlegen (§4b, Schritt U1) |
| Blocker | keine |

## 2. Phasenübersicht

Zeitrahmen der Strategie: bis Monat 12 (Oktober 2027) – als Überprüfungszeitpunkt, nicht als Termin (`STRATEGIE.md` §1).

| Phase | Name | Status | Bis Monat 12? |
|---|---|---|---|
| 0 | Fundament | 🔄 läuft | ja |
| 1 | **Lernkern** Mathe (Zielgruppe Sachsen, Kl. 5–12), Niveaus G + M, Inhalte zuerst für **Klasse 5** vollständig (K-15) (Monate 1–5) | ⏳ | ja – Schwerpunkt |
| 2 | **Basebau Epoche 1** – Ledger, Bauen, Listenansicht, Simulator, Grafik in Draufsicht (K-18, `BASEBAU.md` §11) | 🔄 geplant, als Nächstes | ja |
| 3 | Bastion zeigen (QR-Übertragung, O-9) | ⏳ | nein |
| 4 | Mathe Sek I + Belagerungen | ⏳ | Inhalte: Klasse 6, 7 … jeweils erst nach Abschluss der vorigen (K-15); Belagerungen nein |
| 5 | Sprache (Operatoren, DaZ, Hilfesprache) | ⏳ | nein |
| 6 | Zweites Fach + Portfolio | ⏳ | nein |
| – | Horizont (berufliche Bildung, weitere Fächer …) | ohne Termin | nein |

Phasen haben Prüfkriterien, keine Termine (KONZEPT §12.2). Jede Phase ist ein GitHub-Milestone, jede Aufgabe ein Issue (T-12).

### 2.1 Nicht-Ziele bis Monat 12

Verbindlich nach K-11/K-12. Wer etwas davon anfangen will, muss zuerst diese Liste ändern – mit Begründung im Änderungsprotokoll.

**Inhalte**
- Kein zweites Fach. (Klassenstufen: 5–12 in Sachsen sind Zielgruppe; Inhalte entstehen Klassenstufe für Klassenstufe, `STRATEGIE.md` §2.)
- Keine Inhalte einer höheren Klassenstufe, solange die laufende nicht abgeschlossen ist (K-15).
- Kein Niveau E (erweitert). Die Datenstruktur kennt es, Inhalte gibt es keine. *(Wird für den Leistungskurs ab Klasse 11 nötig, K-25/K-28.)*
- Kein freies Zeichnen in der App. *(Geometrie, Diagramme und Statistik gehören dazu, sobald der sächsische Lehrplan sie verlangt – K-16. Zeichnen und Konstruieren mit Geodreieck und Zirkel werden erklärt, L-10.)*
- Keine Formeleingabe (MathLive o. Ä.).
- Kein anderes Bundesland als Sachsen; keine Bundesland-Abfrage (LEHRPLAN §10, L-9).

**Basebau**
- Keine Epochen nach Epoche 1, keine Belagerungen, keine QR-Übertragung. *(Grafik, Simulator, Studierstube und Zierde gehören seit K-18 zu Epoche 1.)*
- Keine Spezialisierung.

**Sprache und Zielgruppen**
- Keine Hilfesprache, kein DaZ-Pfad, keine weiteren Oberflächensprachen. *Spannung zu Prinzip 7, bewusst in Kauf genommen (KONZEPT §13).* Abfederung: einfache Sprache, Fachbegriffe mit Erklärung, RTL-fähiges Layout bleibt.
- Kein Operatoren-Training. *(Wird mit den Prüfungen nötig, K-25 – erst nach Klasse 9 bis 12, K-28.)*
- Keine berufliche Bildung (Lernfelder).

**Funktionen und Plattform** *(K-23: Variante B bleibt gesperrt bis `STRATEGIE.md` §0)*
- Kein QR-Transfer zwischen Geräten (Datei-Export/Import genügt).
- Keine Elternstufe „vereinbart“. Es gibt „begleitet“ und – weil die Oberstufe zur Zielgruppe gehört – „selbstverwaltet“ ohne Elternbereich (K-4).
- Kein Kompetenzportfolio zum Vorzeigen. *(Leistungsnachweise und Portfolio sind Priorität 4 von Variante A, K-24 – nach Vermitteln, Lernpfaden und Üben.)*
- Kein Lehrkräfte-Modus, keine Klassen, keine Aufgabenpakete für Lehrkräfte.
- Keine App-Store-Versionen.
- Keine Mehrgeräte-Synchronisation.

**Messung**
- Keine Nutzungsstatistik, kein Analytics, keine Telemetrie – auch nicht „nur anonym“. Messung nur über das freiwillige Testprotokoll (K-14) und Gespräche. Es ist nur mit Testcode eingeschaltet, die App sendet nichts.
- Keine Vanity-Metrics: Downloads, Aufrufe, Sitzungsdauer, Bewertungen.

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
- [ ] **0.10 Referenzgeräte und Messung** (teilweise: nachgeahmte Messung erledigt, ARCHITEKTUR §9.2)
  - Drei Referenzgeräte festlegen (altes Android, Chromebook, älteres iPad – oder verfügbarer Ersatz) – *offen, Projektverantwortlicher*
  - [x] Messskript `pnpm messen` und erste nachgeahmte Messung der Gerüst-App in `ARCHITEKTUR.md` §9.2
  - Messung auf den echten Referenzgeräten – *offen*

### Block D – Menschen

- [ ] **0.11 Testjugendliche gewinnen** (Vorgehen und Material: `TESTS.md`)
  - Zuerst 5–8, bis Monat 3 insgesamt 8–12 Jugendliche aus Sachsen – solange es nur Inhalte der Klasse 5 gibt, vor allem aus Klasse 5, dazu einige Ältere mit Lücken im Stoff der Klasse 5; möglichst aus unterschiedlichen Schularten
  - Davon mindestens 3–4, die „normalerweise keine Lern-Apps mögen“
  - Einverständnis der Eltern schriftlich (Vorlage `TESTS.md` §3)
  - Keine Daten der Testpersonen im Repository

### Block E – Fokus (die nächsten 14 Tage, `STRATEGIE.md` §8)

- [x] **0.12 Scope-Entscheidung festhalten** – K-11: Mathe in Sachsen, Kl. 5–12, alle Schularten, Niveaus G und M (`STRATEGIE.md` §2, `VISION.md` §11)
- [x] **0.13 Nicht-Ziele bis Monat 12** – §2.1
- [ ] **0.14 Bestehende Angebote selbst durchspielen** – Entwurf `WETTBEWERB.md` liegt vor. Offen: ANTON, bettermarks (falls Landeslizenz zugänglich) und eine dritte App je 30 Minuten mit denselben drei Bruch-Aufgaben durchspielen, absichtlich typische Fehler machen, Rückmeldung protokollieren (Raster in `WETTBEWERB.md` §5)
- [ ] **0.15 Erste 5–8 Testpersonen ansprechen** – Ansprache-Text und Elterninfo in `TESTS.md` §2–3
- [x] **0.16 Basebau-Minimum festlegen** – K-12 (`STRATEGIE.md` §3)
- [x] **0.18 Sächsische Lehrpläne Mathematik auswerten** – OS 2019 und GY 2021 für Klasse 5: 41 Kompetenzen in `LEHRPLAN.md` §8, Quellen in `docs/quellen/`. Offen: Gemeinschaftsschule/Oberschule+ und Förderschulen prüfen
- [x] **0.19 O-15 entschieden** – K-16: Lehrpläne bindend, Geometrie und Diagramme gehören dazu; Zeichnen wird erklärt (L-10)
- [x] **0.17 K-14 entschieden** (29.10.2026): freiwilliges Testprotokoll, gebaut in U4a

## 4. Phase 1 – Lernkern (Vorschau)

Wird zu Beginn von Phase 1 in Aufgaben zerlegt. Reihenfolge nach K-12 – jede Stufe ist für sich nutzbar und wird mit der Testgruppe geprüft.

**1a – Aufgabenqualität (Klasse 5, Niveaus G und M, K-15)**
1. Kern: Kompetenzgraph laden, Aufgaben-Engine, Auswertung – *erste Übungsseite steht: Inhaltspakete, Auswertung mit Fehlerbild-Rückmeldung, Hilfen, Lösungsweg, offline nutzbar. Ergebnisse werden als Lernereignisse auf dem Gerät gespeichert, die Übersicht zeigt „in Arbeit“ und „gekonnt“. Zeichen-Anleitungen beim Üben*
2. Generatoren für alle Kompetenzen der Klasse 5, entlang des Graphen, je mit Fehlerbildern und Lösungsweg (INHALTSFORMAT §6–7) – *als Entwurf erledigt: alle 41 Kompetenzen mit mindestens zwei Vorlagen je Niveau (88 Vorlagen, 68 Generatoren mit Pflicht-Tests). Anleitungen zum Zeichnen stehen (L-10, fünf Stück, INHALTSFORMAT §4.3). Offen: Prüfung der Vorlagen und Anleitungen (INHALTSFORMAT §10.1)*
3. Erklärungen in einfacher Sprache; Fachbegriffe mit Erklärung – *steht: Wörterbuch mit Fachbegriffen der Klasse 5, in Aufgaben, Hilfen und Rückmeldungen antippbar, Prüfung in `pnpm test` (INHALTSFORMAT §11.1). Offen: Prüfung der Erklärungen mit einer Lehrkraft (zusammen mit den Vorlagen)*
4. Abschlussbildschirm „Was habe ich heute gekonnt?“ (ohne Ressourcen) – *steht: Knopf „Fertig für heute“ beim Üben, Wiederholen und in der Werkstatt; zeigt heute gefestigte und neu gekonnte Themen, geübte Themen, Zahl der Aufgaben, Wiederholungen und aufgearbeiteten Fehler – ohne Punkte und Prozente – und schlägt eine Pause vor (R5). Berechnet aus den Aufgaben des Lerntags (`src/core/learning/heute.ts`); Sitzungs-Ereignisse kommen mit dem Ledger*

**1b – Wiederholung und Fehlerwerkstatt**
5. FSRS-Anbindung, Wiederholungsmodus, Rückkehrmodus – *Wiederholungsmodus steht: FSRS-Karten je Vorlage und Niveau (ts-fsrs 5.4.2), fällige Aufgaben über „Wiederholen“, Status bis „gefestigt“ und „auffrischen“, Rückkehrmodus nach Pausen (Begrüßung ohne Vorwurf, Portionen von höchstens 20)*
6. Fehlerwerkstatt nach Fehlerbildern („Du verwechselst manchmal Erweitern mit Addieren“) – *steht: offene Fehler nach Ursache gruppiert (Fehlerbild, sonst je Kompetenz), genau die damalige Aufgabe mit der damaligen Antwort, erledigt nach richtiger Korrektur. Belohnung fürs Korrigieren (R6): Erz, sichtbar im Abschluss (2.4)*

**1c – Diagnose und sichtbarer Fortschritt**
7. Diagnose-Modus (Einstieg ohne Vorwissen über die Schulform) – *steht: „Wo stehe ich?“ auf der Startseite, adaptiv durch den Graphen der Klasse 5, höchstens 30 Aufgaben in zwei Etappen, ohne Wertung und ohne Hilfen, Ergebnis „Hier stehst du – hier geht es weiter“ mit Empfehlungen zum Üben; bestandene Kompetenzen werden „gekonnt“*
8. Kompetenzansicht: was gefestigt ist, was wackelt – ohne Bastion verständlich – *steht: „Mein Stand“ mit Erklärung jeder Stufe, nächster Wiederholung und Empfehlungen; „empfohlen“ in der Übersicht (L-5); Rückweg bei Fehlern nach drei Fehlern in Folge (LEHRPLAN §7)*
9. Elternbereich minimal (PIN, Stufe „begleitet“, Kompetenzbericht) – *steht: „Für Eltern“ auf der Startseite, PIN beim ersten Öffnen, Wiederherstellungscode aus vier Wörtern (D-12), einfache Ansicht (Themen, Wochen) als Standard und ausführliche Ansicht mit einzelnen Aufgaben (D-14); Jugendliche sehen dasselbe unter „Mein Stand“*
10. Export/Import, Sicherungs-Erinnerung – *steht: „Sicherung“ auf der Startseite; verschlüsselte Datei `.bastion` mit Code aus sechs Wörtern (D-9), Einspielen führt zusammen (D-10) und legt vorher eine lokale Sicherung an; Erinnerung auf der Startseite, im Elternbereich einstellbar (zwei Wochen, Monat, drei Monate, nie); im Elternbereich letzte Sicherung und ob der Browser die Daten behalten will; PIN gilt je Gerät mit Vermerk nach Einspielen (D-15)*

**Durchgehend**
11. Ledger bucht im Hintergrund (B-10), ohne Anzeige
12. ~~Testrunden mit der Testgruppe nach 1a, 1b und 1c~~ – *nach K-17 erst, wenn der Lehrplan bis Klasse 12 aufgebaut ist (`TESTS.md`)*
13. Klasse 6 erst, wenn Klasse 5 nach den Kriterien in `STRATEGIE.md` §2 abgeschlossen ist – *nach K-17 ohne Prüfung und Test: Klasse 5 ist damit abgeschlossen, Klasse 6 ist dran. Stand: alle 26 Kompetenzen der Klasse 6 haben Vorlagen (53, Entwurf), Übersicht, „Mein Stand“ und Diagnose mit Klassenwahl*
14. Klasse 7 (K-15, K-17) – *Stand: Lehrpläne ausgewertet (OS mit Haupt- und Realschulbildungsgang, GY), 29 Kompetenzen und Graph in `LEHRPLAN.md` §8c; alle 29 Kompetenzen haben Vorlagen (60, Entwurf) und 4 Anleitungen, Klassenwahl mit Klasse 7 – Klasse 7 ist inhaltlich abgedeckt*
15. Klasse 8 (K-15, K-17) – *Stand: Lehrpläne ausgewertet, 27 Kompetenzen und Graph in `LEHRPLAN.md` §8d; alle 27 Kompetenzen haben Vorlagen (54, Entwurf) und 3 Anleitungen, Klassenwahl mit Klasse 8 – Klasse 8 ist inhaltlich abgedeckt*
16. Nach Klasse 8 (K-20): Startpaket für Späteinsteiger (B-24) – *steht (BASEBAU §3.4b)*, Hinterhof (B-25) – *Stufe 1 steht*, Wechsel begleiten (L-12) – *steht, beim Überspringen mit gezielter Lücken-Diagnose*, Bericht für die Lehrkraft im Elternbereich (L-13) – *steht*
17. Vor Klasse 9 (K-20, ergänzt): Profil mit Geburtsdatum und Ansprache (L-15) – *Profil steht, „Sie“ offen*, Schuljahreswechsel und Klasse pflegen (L-17) – *steht*, „Gerade dran“ (L-18) – *steht*, Diagnose zum Wiedereinstieg (L-16) – *steht*, Klassenarbeit (L-19) – *steht (Termin, Themen, Probe-Klassenarbeit); offen: Wiederholungen bis zum Termin planen*
17a. **Vorher: Grafik deutlich ansprechender (K-22)** – drei Testerinnen (12–16 Jahre) stehen bereit (`TESTS.md` §2). *Entschieden: Richtung A „Tag, warm“, Leiste unten, hell/dunkel/System, austauschbar (`GRAFIK.md`, B-27). Reihenfolge des Umbaus: Grundlage (Tokens, Schrift, Modi), Startseite, Üben, Bastion – je ein PR. Später: lebendige Szenen, Jahreszeiten, Wetter (T-15), Skins* – *umgesetzt am 29.10.2026 in vier PRs (#42 bis #45): Grundlage mit Fassung „tag-warm“, Nunito und Modi; Startseite mit Leiste unten; Üben mit Fortschrittspunkten; Bastion als Insel schräg von oben (`GRAFIK.md` §5). Offen: Test mit den drei Testerinnen*
17b. Klasse 9 bis 12, danach Mathe im Studium (K-19) – *erst nach 17a; Beginn nach Rückfrage beim Projektverantwortlichen, siehe `SESSION-PROMPT.md`*
17c. *Später, nur gemerkt:* Prüfungen entwerfen – Übungen bis Abiturprüfung je Klasse und Kurs, mit Lösungen, zum Drucken, Timer optional (`LEHRPLAN.md` L-20). Erst nach Klasse 12; offene Fragen stehen bei L-20.
18. Budget der App-Hülle: Generatoren nachladen (vom Projektverantwortlichen freigegeben, 28.10.2026) – *steht: ARCHITEKTUR T-14, App-Hülle 120 KB statt 212 KB*

**Prüfkriterium Phase 1:** Die Schwelle „Lernkern trägt“ (`STRATEGIE.md` §3) ist erreicht – oder es ist klar, warum nicht und was sich ändern muss.

## 4b. Unterrichtsersatz – Variante A (K-23 bis K-28)

Konzept: `VERMITTLUNG.md`. Reihenfolge nach K-28, jeder Schritt ein PR:

- [x] **U0** Neue Vision, vier Kernaufgaben als Qualitätskriterien, Konzept „Vermitteln und Diagnostizieren ohne KI“ (`VISION.md` v1.0, `VERMITTLUNG.md`, `STRATEGIE.md` §0)
- [x] **U1** Format für Erstvermittlung und Fehlerkatalog (`INHALTSFORMAT.md` §15, §16, I-12, I-13); Prüfung in `pnpm inhalte:pruefen` (`src/core/learning/vermittlung.ts`, `fehlvorstellung.ts`); Datenmodell `vermittlung` und Projektion `fehlvorstellungen` (`DATENMODELL.md` §4.7, D-16)
- [x] **U2** Musterfeld Brüche (`M.ZO.BR.BEGRIFF`, `M.ZO.BR.ERWEITERN`, `M.ZO.BR.ADD-SUB`), in drei Schritten:
  - [x] **U2a** Fehlerkatalog: 10 Fehlvorstellungen in `content/mathematik/fehlvorstellungen/`; alle 15 Fehlerbilder der 6 Vorlagen verweisen per `fv` darauf; Tests für F1 und F2
  - [x] **U2b** Erstvermittlung für die drei Kompetenzen (`vermittlung.yaml`, je 10 bis 11 Schritte, 12 bis 15 Minuten), alle Rückwege des Fehlerkatalogs zeigen auf vorhandene Schritte
  - [x] **U2c** Werkzeuge Bruchstreifen und Zahlenstrahl (`src/ui/vermittlung/werkzeuge/`): zeigen und interaktiv, ohne Ziehen bedienbar, mit Beschreibung für Screenreader
- [x] **U3** Abspieler in der App; Diagnose der Fehlvorstellungen; Fehlerwerkstatt nach Ursachen, in Schritten:
  - [x] **U3a** Ereignis `vermittlung` (`src/core/learning/vermittlung-ereignis.ts`), Datenbank-Schemaversion 2 mit Tabelle `vermittlungen`, in Sicherung und Import; Migrationstest mit Altstand `tests/altstaende/schema-1.json`
  - [x] **U3b** Erstvermittlungen und Fehlerkatalog in die Inhaltspakete (Grundpaket: Fehlerkatalog; Bereichspaket: Erstvermittlungen)
  - [x] **U3c** Abspieler: Schritte zeigen, Antworten auswerten, Werkzeuge einbinden, Verzweigungen folgen (`src/core/learning/abspielen.ts`, `src/ui/vermittlung/Vermittlung.svelte`); vorerst über den Knopf „Erklärung“ beim Üben
  - [x] **U3d** Einstieg vor dem ersten Üben (Angebot, überspringbar), Zustand „vermittelt“ (in der Übersicht „erklärt“), Abschluss bringt einen Bauschritt (einmal je Kompetenz), Kurzfassung zum Nachschlagen
  - [x] **U3e** Projektion `fehlvorstellungen` (VERMITTLUNG §3.3), im Kern berechnet (`src/core/learning/fv-diagnose.ts`)
  - [x] **U3f** Zwischenschritte (K-29): Format `schritte` und Prüfung (`INHALTSFORMAT.md` §17), Generator-Schnittstelle `schritt`, Pflicht-Tests (`src/core/learning/zwischenschritte.ts`)
  - [x] **U3g** Zwischenschritte im Musterfeld Brüche (Erweitern auf Zielnenner, Kürzen, ungleichnamig Addieren/Subtrahieren; INHALTSFORMAT §17)
  - [x] **U3h** Schritt-Eingabe beim Üben: „Zeig mir deinen Weg“, zwei Versuche je Schritt; Ereignis `aufgabe` mit `schritte` (`v` = 2, D-17); Diagnose zählt Schrittfehler
  - [x] **U3i** Rückmeldung beim Üben: kurze und lange Erklärung, Rückweg (Erklärung oder Grundlage), Kontrastaufgaben
  - [x] **U3j** Fehlerwerkstatt nach Ursachen: Gruppen je Fehlvorstellung über Vorlagen und Kompetenzen hinweg
  - [x] ~~**U3k** Unbekannte Fehler für die Pflege exportieren~~ – entfällt, steht im Testprotokoll (U4a)
  - [x] **U3l** Browser-Tests (je Schritt einer) und Dokumente (LEHRPLAN §6 „erklärt“, KONZEPT §0, VERMITTLUNG §7)
- [ ] **U4** Testphase, in zwei Schritten:
  - [x] **U4a** Testprotokoll (K-14, D-18): Teilnehmer-Nummer mit Prüfziffer im Elternbereich (sie ist zugleich der Testcode), unbekannte Fehler gesondert aufgeführt, Ereignis `nutzung`, Hinweis in der App, Export als JSON-Datei mit Vorschau, Ausschalten und Löschen
  - [ ] **U4b** Test mit den drei Testerinnen (`TESTS.md` §2)
- [ ] **U5** Klasse 5 bis 8 Feld für Feld nachrüsten (123 Kompetenzen); bestehende 596 Fehlerbilder den Fehlvorstellungen zuordnen; mehrschrittige Vorlagen bekommen Zwischenschritte (F6)
  - [x] **U5a** Fehlerbilder zuordnen, Feld Brüche und Dezimalzahlen: 67 Fehlerbilder, 35 neue Fehlvorstellungen (INHALTSFORMAT §16); Stand 82 von 596 mit `fv`
  - [ ] **U5b** Fehlerbilder zuordnen in den übrigen Feldern, je Feld ein PR (INHALTSFORMAT §16):
    - [x] natürliche Zahlen (43 Fehlerbilder, 18 neue Fehlvorstellungen; Stand 125 von 596)
    - [x] Teilbarkeit (15 Fehlerbilder, 8 neue Fehlvorstellungen; Stand 140 von 596)
    - [x] rationale Zahlen (42 Fehlerbilder, 14 neue Fehlvorstellungen; Stand 182 von 596)
    - [x] Prozent und Zins (31 Fehlerbilder, 11 neue Fehlvorstellungen; Stand 213 von 596)
    - [x] Terme (26 Fehlerbilder, 7 neue Fehlvorstellungen; Stand 239 von 596)
    - [x] Gleichungen und Gleichungssysteme (37 Fehlerbilder, 14 neue Fehlvorstellungen; Stand 276 von 596)
    - [ ] Funktionen und Zuordnungen · Größen · Geometrie · Daten und Zufall
- [ ] **U6** Klasse 9 bis 12 im neuen Format, mit Niveau E
- [ ] **U7** Prüfungen auf Knopfdruck bis zum Abitur (K-25); vorher PDF-Technik entscheiden
- [ ] **U8** Leistungsnachweise und Portfolio, lokal und exportierbar

## 4a. Phase 2 – Basebau Epoche 1 (K-18)

Ausgearbeitet in `BASEBAU.md` §11. Reihenfolge nach K-10, jeder Schritt ein Commit:
- **A – Ledger:** 2.1 Sitzungen ✅ (`src/core/learning/sitzung.ts`) · 2.2 Ledger-Regeln ✅ (`src/core/ledger/regeln.ts`) · 2.3 Buchungen und Konto ✅ (`src/core/ledger/buchung.ts`) · 2.4 Abschluss mit Ressourcen ✅
- **B – Bauen:** 2.5 Gebäudekatalog ✅ (`src/core/bastion/katalog.ts`) · 2.6 Bauen ✅ (`src/core/bastion/bauen.ts`) · 2.7 Basebau-Schalter (Standard an) ✅ · 2.8 Listenansicht (zuerst Banner und Späherturm) ✅ · 2.9 Studierstube ✅ · 2.10 Ende der Epoche 1 ✅
- **Zwischenschritt Themen (B-17):** 2.10a Rollen statt Burg-Wörter ✅ · 2.10b Themen und Wahl (Bastion, Garten, Weltraum, Dorf, Unterwasser) ✅
- **C – Balancing:** 2.11 Simulator mit den Profilen P1–P7 ✅ (`pnpm sim`, Ergebnisse BASEBAU §8a) · 2.11a Einfassung 40 ✅ · 2.11b Einlagern ✅ · 2.11c Ziel vormerken ✅ (B-19 bis B-22; alle Erwartungen aus §8 erfüllt)
- **D – Grafik:** 2.12 PixiJS einbinden ✅ (8.22.0, nachgeladen, offline) · 2.13 Bauplatz in Draufsicht ✅ (2.13a Zoom ✅) · 2.14 Gestalten ✅

Danach weiter mit den Inhalten: Klasse 7 (K-15, K-17) – begonnen, siehe Phase 1 Punkt 14. Testfragen für die späteren Testrunden: Wird „Lernen → Ressource → Bauen“ verstanden? Sinkt die Lernqualität? Fühlt es sich nach „meins“ an?

## 5. Änderungsprotokoll

| Datum | Änderung |
|---|---|
| 30.10.2026 | **U5b Gleichungen und Gleichungssysteme:** 37 Fehlerbilder zugeordnet, 14 neue Fehlvorstellungen |
| 30.10.2026 | **U5b Terme:** 26 Fehlerbilder zugeordnet, 7 neue Fehlvorstellungen |
| 30.10.2026 | **U5b Prozent und Zins:** 31 Fehlerbilder zugeordnet, 11 neue Fehlvorstellungen |
| 30.10.2026 | **U5b rationale Zahlen:** 42 Fehlerbilder zugeordnet, 14 neue Fehlvorstellungen |
| 30.10.2026 | **U5b Teilbarkeit:** 15 Fehlerbilder zugeordnet, 8 neue Fehlvorstellungen |
| 30.10.2026 | **U5b natürliche Zahlen:** 43 Fehlerbilder zugeordnet, 18 neue Fehlvorstellungen; vorhandene `FV.NZ.…` mit Beispielen ohne Brüche |
| 30.10.2026 | **U5a:** Fehlerbilder im Feld Brüche und Dezimalzahlen den Fehlvorstellungen zugeordnet (67 Fehlerbilder, 35 neue Fehlvorstellungen, zusammen 45); Test F2 für zugeordnete Felder; `pnpm inhalte:begriffe` markiert auch Fehlvorstellungen |
| 30.10.2026 | **U3 und U4a fertig** (PRs #52–#64): Erstvermittlung in der App, Diagnose der Fehlvorstellungen, Zwischenschritte (K-29), Fehlerwerkstatt nach Ursachen, Testprotokoll (K-14); Datenbank-Schemaversion 3; Startseite für das iPhone 13 korrigiert. Nächster Schritt: U4b (Test), Entscheidung zu U5 offen |
| 29.10.2026 | **Neue Ausrichtung: Unterrichtsersatz ohne KI** (K-23 bis K-28). `VISION.md` v1.0, neues `VERMITTLUNG.md`, Schwelle für Variante A in `STRATEGIE.md` §0, Arbeitsplan §4b; Nicht-Ziele §2.1 mit Hinweisen ergänzt |
| 29.10.2026 | K-22 umgesetzt: Grafik in Richtung A „Tag, warm“ (`GRAFIK.md` §5); B-11 (Draufsicht) abgelöst; Schrift Nunito mitgeliefert (T-16) |
| 28.10.2026 | K-18: Basebau Epoche 1 vollständig mit Grafik vor Klasse 7; Plan in `BASEBAU.md` §11; Draufsicht, schlichter eigener Stil, Schalter Standard an, zuerst Banner und Späherturm (B-11 bis B-14) |
| 27.10.2026 | Plan angelegt; Phase 0 gestartet; Arbeit im GitHub-Repository festgelegt |
| 27.10.2026 | Repository angelegt; `LEHRPLAN.md` v0.1 mit 23 Kompetenzen Mathe Kl. 5–6 |
| 27.10.2026 | `INHALTSFORMAT.md` v0.1: YAML-Format, Generator-Schnittstelle, Fehlerbilder, Review per Hash |
| 27.10.2026 | Entscheidungs-Review abgeschlossen; Lizenz festgelegt; `CLAUDE.md` angelegt (T-13) |
| 27.10.2026 | `DATENMODELL.md` v0.1: Ereignisse, Projektionen, Export/Import, Zusammenführen, Verdichtung, Datenschutzprüfung; Block B abgeschlossen |
| 27.10.2026 | `LICENSE` (AGPL-3.0); Block C 0.7–0.9: Gerüst, Leitplanken, Kern-Grundlagen, Offline-Hülle, Tests und CI |
| 27.10.2026 | Strategie für 12 Monate (`STRATEGIE.md`): Scope K-11 (Mathe, Kl. 5–6, G+M), Lernkern vor Basebau K-12, Erfolgskriterien K-13; Nicht-Ziele §2.1; Block E; Phase 1 neu gegliedert; Testgruppe 8–12 |
| 27.10.2026 | K-11 geändert: Zielgruppe Mathe Kl. 5–13 von Anfang an (statt 5–6); Inhalte weiter in Wellen ab Brüchen; Elternstufe „selbstverwaltet“ in den Scope; K-8 für Mathe-Oberstufe aufgehoben |
| 27.10.2026 | 0.10 teilweise (Messskript, nachgeahmte Messung); erster Generator `bruch.erweitern-zielnenner@1` mit wiederverwendbaren Pflicht-Tests |
| 27.10.2026 | K-11 präzisiert: Start in Sachsen, Kl. 5–12, alle allgemeinbildenden Schularten; L-9 Lehrplanbezug Sachsen; Aufgabe 0.18 |
| 27.10.2026 | K-15: Inhalte Klassenstufe für Klassenstufe, beginnend mit Klasse 5; Abschlusskriterien je Klassenstufe; O-15 (Geometrie/Daten Kl. 5) offen |
| 27.10.2026 | K-16: sächsische Lehrpläne bindend; LEHRPLAN §8 neu: Klasse 5 mit 41 Kompetenzen (OS 2019 + GY 2021); L-10 Zeichnen erklären, L-11 Wahlbereiche; Geometrie/Diagramme aus den Nicht-Zielen gestrichen |
| 27.10.2026 | 41 Kompetenzen Klasse 5 als YAML in `content/`; Prüfwerkzeug für Schema, Ordner und Graph (`pnpm inhalte:pruefen`, auch im Testlauf) |
| 27.10.2026 | Generatoren `nz.ziffer-an-stelle@1` und `nz.zahlwort-zu-zahl@1` für M.ZO.NZ.STELLENWERT |
| 27.10.2026 | Erste Vorlagen (ERWEITERN.ZIELNENNER, STELLENWERT.ZIFFER-AN-STELLE, STELLENWERT.ZAHLWORT); Prüfwerkzeug gleicht Vorlagen mit Kompetenzen und Generatoren ab; STELLENWERT als erste Kompetenz mit 2 Vorlagen je Niveau |
| 27.10.2026 | Generator `nz.zahlen-ordnen@1` mit Vorlage M.ZO.NZ.ORDNEN.DER-GROESSE-NACH; Lösungsart „Reihenfolge“ |
| 27.10.2026 | 1a: Generatoren und Vorlagen für alle 41 Kompetenzen der Klasse 5 (Entwürfe): Zahlen und Rechnen, Teilbarkeit, Brüche und Dezimalzahlen, Größen, Daten, Geometrie mit SVG-Bildern, Flächen und Körper; Generatoren registrieren sich selbst; Pflicht-Tests mit optionalem Zeitlimit |
| 27.10.2026 | Erste Übungsseite: Inhaltspakete aus `content/`, Auswertung (I-5, Bruchformen, Fehlerbilder), Vorlagentexte mit Formel-Teilmenge, Übersicht nach Graph, Übung mit Hilfen und Lösungsweg; E2E-Test offline |
| 28.10.2026 | PR #3 gemergt. Ergebnisse speichern: Ereignis `aufgabe`, Projektion `kompetenzen` (neu, in Arbeit, gekonnt) mit Pflicht-Test D-6, Ablage mit Dexie 4.4.6 (freigegeben), Status in der Übersicht |
| 28.10.2026 | PR #4 gemergt. Wiederholung mit FSRS: Karten, „gefestigt“, „auffrischen“, Wiederholen-Knopf mit fälligen Aufgaben; ts-fsrs 5.4.2 (freigegeben) |
| 28.10.2026 | PR #5 gemergt (Wiederholung). Fehlerwerkstatt: offene Fehler nach Ursache, Aufarbeiten der damaligen Aufgabe, Ereignisfeld `korrigiert` |
| 28.10.2026 | Rückkehrmodus (BASEBAU §6.3): Begrüßung nach mehr als 7 Tagen Pause, Wiederholungen portioniert (höchstens 20, die gefährdetsten zuerst); CI-Test „Wiederholen“ robuster |
| 28.10.2026 | PR #6 gemergt (Fehlerwerkstatt, Rückkehrmodus). 1c Diagnose: adaptiver Gang durch den Graphen, Simulation mit 500 Wissensständen, „Wo stehe ich?“ in der App |
| 28.10.2026 | PR #7 gemergt (Diagnose). Kompetenzansicht „Mein Stand“, „empfohlen“ in der Übersicht, Rückweg bei Fehlern |
