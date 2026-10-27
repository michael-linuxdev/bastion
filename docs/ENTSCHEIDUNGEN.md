# Entscheidungs-Review (Aufgabe 0.2) – abgeschlossen

Stand: 27.10.2026 · **Ergebnis: alle 56 Entscheidungen bestätigt, O-2 und O-8 entschieden.**

## Ergebnis auf einen Blick

| Punkt | Ergebnis |
|---|---|
| Teil A (30 schwer umkehrbare Entscheidungen) | alle bestätigt |
| Teil B (26 Stellschrauben) | alle bestätigt |
| T-3 Framework | Svelte 5 – keine Framework-Vorerfahrung; Regel „nur Runes-Syntax“ ergänzt |
| B-7 Bauschritte | max. 2 pro Tag bestätigt |
| Bauplan-Schwelle | 90 % + 7 Tage bestätigt (Startwert) |
| K-7 Erstes Fach | Mathematik bestätigt |
| O-2 Inhalte | Generatoren + KI-Entwürfe mit Prüfpflicht + OER |
| O-8 Lizenz | Code AGPL-3.0, Inhalte CC BY-SA 4.0 |
| Neu: T-13 | Implementierung überwiegend mit Claude Code; Qualität über automatische Prüfungen |

Das Review wurde im Dialog geführt; die Checkliste unten bleibt als Protokoll erhalten.

**So geht's:** Jede Zeile abhaken, ändern oder streichen. Ergänzungen direkt dahinter schreiben.
`[x]` = bestätigt · `[~]` = ändern (Notiz dahinter) · `[-]` = verworfen

Tipp: Den Inhalt in ein GitHub-Issue kopieren – dort werden die Kästchen anklickbar.

Teil A ist der wichtige Teil. Teil B kann im Block bestätigt werden – das sind Stellschrauben, die sich später leicht ändern lassen.

---

## Teil A – Schwer umkehrbar (einzeln prüfen)

Diese Entscheidungen prägen Datenmodell, Inhalte oder Grundhaltung. Ein späterer Wechsel kostet viel Arbeit oder bricht Spielstände.

### Grundhaltung (VISION)

- [x] **R1** Keine Zufallsbelohnungen, keine Truhen
- [x] **R2** Keine Echtzeit-Timer; Bauen dauert Lerneinheiten, nicht Stunden
- [x] **R3** Kein Verfall, keine Verluste, Pausen werden nie bestraft
- [x] **R4** Qualität schlägt Menge; Farmen hat abnehmenden Ertrag
- [x] **R5** Natürliche Pausenpunkte; die App schlägt das Ende vor
- [x] **R6** Fehler sind Rohstoff; Korrigieren wird belohnt
- [x] **R7** Basebau vollständig und ohne Nachteil abschaltbar

### Architektur und Daten

- [x] **K-1** Der Basebau kennt nur das Ressourcen-Ledger, keine Aufgaben oder Antworten
- [x] **K-2** Kompetenzen sind die Grundeinheit, nicht Kapitel
- [x] **T-1** PWA statt nativer App
- [x] **T-2** Fachlogik in framework-freiem TypeScript-Kern
- [x] **T-7** Ereignisbasiertes Datenmodell (append-only) mit Regelversionen
- [x] **L-1** Kompetenz-IDs sprechend und für immer stabil
- [x] **I-4** Vorlagen-IDs stabil; ausmustern statt löschen
- [x] **I-1** Generatoren sind App-Code; Inhaltspakete enthalten nie Code
- [x] **I-3** Alle Texte als Sprachobjekte (`{ de: … }`) ab Tag 1
- [x] **I-6** Lernereignis speichert Generator@Version + Seed, bei Fehlern zusätzlich Schnappschuss

### Pädagogik und Fairness

- [x] **L-4** Wiederholt wird die Vorlage mit neuen Zahlen, nie dieselbe Aufgabe
- [x] **B-3** Vier Ressourcen: Stein (Fleiß), Erz (Behalten), Baupläne (Kompetenz), Bauschritte (Zeit ohne Uhr)
- [x] **B-4** Erträge sind niveau- und fachneutral – keine Extra-Belohnung für höhere Niveaus
- [x] **B-6** Die Bastion schrumpft nie; das Portfolio zeigt ehrlich „auffrischen“
- [x] **B-10** Das Ledger bucht auch bei abgeschaltetem Basebau
- [x] **L-2** Niveaus pro Kompetenz, nicht an Schulform gebunden
- [x] **K-4** Elternrechte nehmen mit dem Alter ab; ab 18 nur noch der Nutzer
- [x] **K-9** KI-Entwürfe nur beim Erstellen von Inhalten, nie in der App, nie ungeprüft
- [x] **I-8** Review an Inhalts-Hash gebunden; jede Änderung macht es ungültig

### Projektzuschnitt

- [x] **K-6** Tiefe vor Breite: ein Fach gut, bevor ein zweites beginnt
- [x] **K-7** Mathematik als erstes Fach
- [x] **K-8** Oberstufe und berufliche Bildung in den Horizont, ohne Termin
- [x] **K-5** Phase 1 ohne Basebau

---

## Teil B – Stellschrauben (Block-Bestätigung möglich)

- [x] **Alle folgenden bestätigen** – oder einzelne unten markieren

**Konzept**
- [x] **K-3** Keine passive Ressourcenproduktion
- [x] **K-10** Basebau-Mechanik zuerst in der Listenansicht, Grafik danach

**Technik**
- [x] **T-3** Svelte 5 für die Oberfläche
- [x] **T-4** Dexie über IndexedDB, hinter Repository-Schicht
- [x] **T-5** FSRS als Wiederholungsverfahren
- [x] **T-6** PixiJS nachgeladen, plus gleichwertige Listenansicht
- [x] **T-8** Inhalte als validierte Datenpakete
- [x] **T-9** Balancing-Simulator ab Phase 2
- [x] **T-10** Ein Paket mit erzwungenen Ordnergrenzen statt Monorepo
- [x] **T-11** Bibliotheken erst mit ihrer Phase einführen

**Basebau**
- [x] **B-1** Keine Versorgungsgebäude, keine Lagergrenzen
- [x] **B-2** Wissensgebäude schalten keine Lernfunktionen frei
- [x] **B-5** Baupläne sind Taktgeber für Bergfried und Epochen
- [x] **B-7** Höchstens 2 Bauschritte pro Tag, wirken auf alle aktiven Bauvorhaben
- [x] **B-8** Abbruch gibt alle Ressourcen zurück; Versetzen kostenlos
- [x] **B-9** Rückkehrmodus nach Pausen ohne Vorwurf, Wiederholungen portioniert

**Kompetenzmodell**
- [x] **L-3** Niveauwechsel nur als Vorschlag
- [x] **L-5** Graph empfiehlt, sperrt nicht
- [x] **L-6** Phase 1: Natürliche Zahlen, Teilbarkeit, Brüche/Dezimalzahlen, Größen
- [x] **L-7** Einfache Sprache in allen Aufgaben
- [x] **L-8** Kein Länderbezug, keine Bundesland-Abfrage in Phase 1

**Inhaltsformat**
- [x] **I-2** Nur YAML als Quellformat
- [x] **I-5** Komma Standard, Punkt akzeptiert, keine Tausendertrennzeichen
- [x] **I-7** Fehlerbilder für gezielte Rückmeldung
- [x] **I-9** Herkunft und Lizenz je Vorlage
- [x] **I-10** Pakete je Fach × Bereich mit allen Niveaus

---

## Teil C – Wo ich selbst unsicher bin

Diese Punkte habe ich bestätigt vorgeschlagen, halte sie aber für die wackeligsten. Hier lohnt sich ein zweiter Blick besonders.

1. **B-7 Tageslimit von 2 Bauschritten.** Pädagogisch begründet (verteiltes Lernen), könnte sich für Jugendliche trotzdem wie eine Bremse anfühlen.
2. **Bauplan-Schwelle** (90 % Erinnerung, 7 Tage). Könnte schwächere Lernende zu lange ohne Bauplan lassen.
3. **K-7 Mathe zuerst.** Technisch richtig, aber für Jugendliche, die Mathe hassen, ein schwacher Einstieg in die App.
4. **T-3 Svelte statt React.** Gut begründet, aber Geschmackssache – wenn du React schon gut kennst, wiegt das schwerer als ein paar Kilobyte.

---

## Teil D – Vor Phase 1 noch zu entscheiden

- [x] **O-8** Lizenz für Code und Inhalte (z. B. Code unter einer Open-Source-Lizenz, Inhalte unter CC BY-SA) – entscheidet auch, ob das Repo öffentlich wird
- [x] **O-2** Inhaltsquellen bestätigen: Generatoren + KI-gestützte Eigenproduktion mit Prüfpflicht + passende OER

---

## Nachtrag 27.10.2026

DATENMODELL D-1 bis D-12 im Dialog bestätigt (Lerntag ab 4:00 Uhr, Verdichtung nach 12 Monaten, alle übrigen wie vorgeschlagen).

## Nach dem Review

Erledigt: Alle Entscheidungslogs stehen auf „Entschieden“. Neue Entscheidungen werden ab jetzt direkt mit Status „Entschieden“ eingetragen, wenn sie in einer Sitzung bestätigt wurden – sonst „Vorgeschlagen“ und beim nächsten Review geprüft.
