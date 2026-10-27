# Bastion – Kompetenzmodell (Lehrplan)

Status: Entwurf v0.1 · Stand: 27.10.2026 · Aufgabe 0.4
Bezug: `KONZEPT.md` §4 (K-2), `BASEBAU.md` §3.3, `ARCHITEKTUR.md` §6

> **Quellenhinweis:** Die Bezüge zu den KMK-Bildungsstandards (Mathematik, Sekundarstufe I, Fassung von 2022) sind aus dem Gedächtnis erstellt. Bezeichnungen und Zuordnungen sind vor der Festlegung am Originaldokument der KMK zu prüfen (Aufgabe in `PLAN.md`).

---

## 1. Grundidee

Bastion organisiert Inhalte nicht nach Kapiteln, sondern als **Kompetenzgraph**: Kompetenzen sind Knoten, Voraussetzungen sind Kanten. Schulbücher, Bundesländer und Schulformen unterscheiden sich vor allem in der *Reihenfolge* und *Tiefe*, kaum im *Ziel*. Der Graph bildet das Ziel ab; Reihenfolge und Tiefe ergeben sich aus Voraussetzungen und Niveau.

## 2. Hierarchie

```
Fach               Mathematik
 └─ Bereich        Zahl und Operation          (≈ KMK-Leitidee)
     └─ Feld       Brüche                      (Themenfeld, für Navigation)
         └─ Kompetenz   Brüche erweitern und kürzen   ← Grundeinheit
             └─ Aufgabenvorlage   „Bruch auf gegebenen Nenner erweitern“
                 └─ Aufgabe       3/4 = ?/20   (vom Generator erzeugt)
```

| Ebene | Zweck | Wer sieht sie |
|---|---|---|
| Fach, Bereich | Elternbericht, Portfolio-Gliederung | alle |
| Feld | Navigation, Themenwahl vor Klassenarbeiten | Jugendliche |
| **Kompetenz** | Fortschritt, Niveau, Status, Bauplan | Jugendliche, Eltern, Portfolio |
| Aufgabenvorlage | Wiederholungsplanung (FSRS) | intern |
| Aufgabe | Einzelne Bearbeitung | Jugendliche |

### Granularität einer Kompetenz

Faustregeln, damit Kompetenzen weder zu grob noch zu fein werden:
- Der Kann-Satz ist für eine:n 11-Jährige:n verständlich und beschreibt **eine** Fähigkeit.
- Im Unterricht entspricht sie typischerweise einigen Stunden bis drei Wochen.
- Sie hat 2–5 Aufgabenvorlagen pro Niveau.
- Sie kann innerhalb von 2–4 Wochen regelmäßigen Lernens *gefestigt* werden.

## 3. Schema einer Kompetenz

```yaml
id: M.ZO.BR.ERWEITERN          # Fach.Bereich.Feld.Name – stabil, nie umbenennen
fach: mathematik
bereich: zahl-und-operation
feld: brueche
titel: Brüche erweitern und kürzen
kann_satz: Ich kann Brüche erweitern und kürzen.
klassenstufe_typisch: [6]      # Orientierung, kein Filter
voraussetzungen:
  - M.ZO.BR.BEGRIFF
  - M.ZO.TB.TEILER
niveaus:
  G:
    beschreibung: Erweitern und Kürzen mit kleinen Zahlen und vorgegebener Zahl.
    beispiel: "Erweitere 2/3 mit 4."
  M:
    beschreibung: Auf einen Zielnenner erweitern, vollständig kürzen.
    beispiel: "Kürze 18/24 vollständig."
  E:
    beschreibung: Gleichwertigkeit begründen, Fehler in Rechnungen finden und erklären.
    beispiel: "Tim sagt: 3/5 = 4/6, weil er zu Zähler und Nenner 1 addiert. Erkläre den Fehler."
kmk:
  leitidee: L1                 # s. 5.1
  prozesse: [K5, K1]           # s. 5.2
anforderungsbereiche: [I, II]  # s. 5.3
abdeckung: generator           # generator | handverfasst | gemischt
version: 1
```

**Entscheidung L-1:** IDs sind sprechend und **stabil**. Eine Kompetenz wird nie umbenannt oder neu nummeriert; wird sie fachlich ersetzt, bekommt sie eine neue ID und die alte einen Verweis `ersetzt_durch`.
*Warum:* Lernereignisse, Ledger-Buchungen und Portfolio-Einträge verweisen auf die ID – über Jahre (T-7). Eine Umbenennung würde die Geschichte eines Jugendlichen zerreißen.

## 4. Niveaus

### 4.1 Bedeutung

| Niveau | Kurz | Merkmale (Mathematik) |
|---|---|---|
| **G** grundlegend | Sicher im Kern | Überschaubare Zahlen, ein bis zwei Schritte, Strukturhilfen, vertraute Kontexte |
| **M** mittel | Sicher im Standard | Übliche Zahlräume, mehrschrittig, wenig Hilfen, neue Kontexte |
| **E** erweitert | Sicher im Transfer | Verknüpfen, Begründen, Fehler analysieren, ungewohnte Darstellungen |

**Entscheidung L-2:** Niveaus gelten pro Kompetenz, nicht pro Person – und sind **nicht an Schulformen gebunden**.
*Warum:* Eine Hauptschülerin kann Bruchrechnung auf E beherrschen, ein Gymnasiast Größen auf G. Die Schulform liefert nur einen Startvorschlag für die Diagnose.

**Entscheidung L-3:** Niveauwechsel sind **Vorschläge, keine Automatik**. Die App schlägt höher vor, wenn eine Kompetenz schnell und sicher gekonnt wird, und tiefer, wenn sie wiederholt nicht gelingt. Der Jugendliche entscheidet.
*Warum:* Automatisches Herabstufen wirkt beschämend; automatisches Hochstufen kann überfordern. Selbstbestimmung über das eigene Niveau ist Teil der Autonomie, die langfristige Motivation trägt.

### 4.2 Niveau und Bauplan

Jede Kompetenz kann auf jedem Niveau einmal gefestigt werden und bringt je einen Bauplan (BASEBAU B-4). Wer auf E festigt, muss G und M **nicht** vorher festigen – sie gelten dann als mitgefestigt, bringen aber keine zusätzlichen Baupläne.
*Warum:* Sonst würden starke Lernende gezwungen, Unterforderndes abzuarbeiten, oder würden mit drei Bauplänen für eine Leistung belohnt.

## 5. Bezug zu den KMK-Bildungsstandards

### 5.1 Leitideen (inhaltsbezogen)

| Code | Leitidee | Phase 1 |
|---|---|---|
| L1 | Zahl und Operation | ✅ |
| L2 | Größen und Messen | ✅ |
| L3 | Strukturen und funktionaler Zusammenhang | teilweise (Terme) |
| L4 | Raum und Form | ❌ Phase 4 |
| L5 | Daten und Zufall | ❌ Phase 4 |

### 5.2 Allgemeine mathematische Kompetenzen (prozessbezogen)

| Code | Kompetenz |
|---|---|
| K1 | Mathematisch argumentieren |
| K2 | Probleme mathematisch lösen |
| K3 | Mathematisch modellieren |
| K4 | Mathematische Darstellungen verwenden |
| K5 | Mit mathematischen Objekten umgehen (symbolisch, formal, technisch) |
| K6 | Kommunizieren |

### 5.3 Anforderungsbereiche

| AB | Bedeutung | Generatorfähig? |
|---|---|---|
| I | Reproduzieren | Sehr gut |
| II | Zusammenhänge herstellen | Teilweise (Sachaufgaben mit Vorlagen, Fehlersuche) |
| III | Verallgemeinern und Reflektieren | Kaum – braucht offene Antworten |

**Ehrliche Grenze:** Phase 1 trainiert vor allem AB I und II sowie K5, K4 und ansatzweise K1 und K3. Argumentieren und Kommunizieren in voller Breite brauchen offene Antworten (O-6). Das ist eine bewusste Grenze des Lern-MVP, kein Versehen. Niveau E enthält deshalb gezielt geschlossene Formate mit AB-II/III-Charakter: Fehler finden, Begründungen auswählen und ordnen, „Stimmt das immer?“-Aufgaben.

## 6. Status einer Kompetenz

```
neu → in Arbeit → gekonnt → gefestigt
                              ↓ (Erinnerung sinkt)
                          auffrischen → (Wiederholung bestanden) → gefestigt
```

| Status | Bedingung (Startwerte) |
|---|---|
| **neu** | Noch keine Aufgabe bearbeitet |
| **in Arbeit** | Mindestens eine Aufgabe bearbeitet |
| **gekonnt** | Von den letzten 6 Aufgaben auf diesem Niveau mindestens 5 richtig, ohne Hilfe, verteilt über mindestens 2 Aufgabenvorlagen |
| **gefestigt** | Gekonnt, *und* jede Aufgabenvorlage mindestens 2× als fällige Wiederholung bestanden, mit mindestens 7 Tagen zwischen erster Gekonnt-Feststellung und letzter Wiederholung, *und* geschätzte Erinnerungswahrscheinlichkeit aller Vorlagen ≥ 90 % |
| **auffrischen** | War gefestigt, Erinnerungswahrscheinlichkeit einer Vorlage < 80 % |

Konkretisierung von BASEBAU §3.3: Die „Elemente“ einer Kompetenz sind ihre **Aufgabenvorlagen**.

Der Bauplan entsteht beim *ersten* Erreichen von „gefestigt“. „Auffrischen“ wirkt nur im Portfolio und in der Wiederholungsplanung, nie auf die Bastion (B-6).

### 6.1 Wiederholung mit Generatoren

**Entscheidung L-4:** Eine FSRS-Karte ist eine **Aufgabenvorlage auf einem Niveau**, nicht eine einzelne Aufgabe. Jede Wiederholung erzeugt eine **neue Aufgabe** aus derselben Vorlage.
*Warum:* Würde dieselbe Aufgabe wiederholt, lernten Jugendliche Antworten auswendig („3/4 = 15/20“). Neue Zahlen mit gleicher Struktur prüfen, ob das *Verfahren* sitzt. Das ist der Unterschied zwischen Stoff und Kompetenz.

Für handverfasste Vorlagen ohne Generator gibt es mindestens 5 gleichwertige Varianten, die rotieren.

## 7. Freischaltung und Diagnose

**Entscheidung L-5:** Eine Kompetenz wird empfohlen, sobald alle Voraussetzungen mindestens **gekonnt** sind. Gesperrt wird nichts: Jede Kompetenz kann jederzeit gewählt werden, etwa für die nächste Klassenarbeit.
*Warum:* Die Schulrealität hält sich nicht an unseren Graphen. Wer morgen eine Arbeit über Bruchdivision schreibt, muss das üben können. Der Graph berät, er sperrt nicht.

**Diagnose beim Einstieg:**
- Dauer höchstens 15 Minuten, in zwei Etappen teilbar.
- Startpunkt aus Klassenstufe und Schulform (nur Vorschlag).
- Adaptiver Gang durch den Graphen: bei Erfolg weiter, bei Misserfolg Voraussetzungen prüfen.
- Ergebnis wird **nicht als Punktzahl** gezeigt, sondern als „Hier stehst du – hier geht es weiter“.
- Diagnose-Ergebnisse markieren Kompetenzen höchstens als *gekonnt*, nie als *gefestigt* (dafür braucht es Zeit, 6.).

**Rückweg bei Fehlern:** Scheitert jemand wiederholt an einer Kompetenz, schlägt die App gezielt eine Voraussetzung vor („Kurz Teiler auffrischen?“), statt immer weiter dieselbe Kompetenz zu wiederholen.

## 8. Ausschnitt Mathematik Klasse 5–6 (Phase 1)

### 8.1 Auswahl

**Entscheidung L-6:** Phase 1 umfasst vier Felder aus L1, L2 und L3: Natürliche Zahlen, Teilbarkeit, Brüche und Dezimalzahlen, Größen.
*Warum:* Sie sind in praktisch allen Ländern und Schulformen Kern von Klasse 5–6, bauen aufeinander auf (Teilbarkeit → Kürzen) und sind gut generatorfähig (K-7). Geometrie und Daten brauchen Zeichen- und Diagramm-Interaktionen und folgen in Phase 4.

*Hinweis:* In Berlin und Brandenburg sind Klasse 5 und 6 Teil der Grundschule. Bastion muss diese Jugendlichen genauso ansprechen – der Übergang aus der Lerninsel passiert dort später.

### 8.2 Kompetenzen

Legende Abdeckung: **Gen** = Generator · **Hand** = handverfasst · **Mix** = gemischt

**Feld NZ – Natürliche Zahlen und Rechenverfahren** (L1, L3)

| ID | Kann-Satz | Voraussetzungen | Abd. | AB |
|---|---|---|---|---|
| M.ZO.NZ.STELLENWERT | Ich kann große Zahlen lesen, schreiben und im Stellenwertsystem darstellen. | – | Gen | I |
| M.ZO.NZ.RUNDEN | Ich kann Zahlen runden und Ergebnisse überschlagen. | STELLENWERT | Gen | I, II |
| M.ZO.NZ.ADD-SUB | Ich kann schriftlich addieren und subtrahieren. | STELLENWERT | Gen | I |
| M.ZO.NZ.MULT | Ich kann schriftlich multiplizieren. | ADD-SUB | Gen | I |
| M.ZO.NZ.DIV | Ich kann schriftlich dividieren. | MULT | Gen | I |
| M.ZO.NZ.REGELN | Ich kann Rechengesetze nutzen, um geschickt zu rechnen. | ADD-SUB, MULT | Gen | I, II |
| M.SF.NZ.TERME | Ich kann Terme mit Klammern und Punkt-vor-Strich berechnen und aufstellen. | REGELN | Mix | I, II |

**Feld TB – Teilbarkeit** (L1)

| ID | Kann-Satz | Voraussetzungen | Abd. | AB |
|---|---|---|---|---|
| M.ZO.TB.TEILER | Ich kann Teiler und Vielfache einer Zahl finden. | NZ.DIV | Gen | I |
| M.ZO.TB.REGELN | Ich kann Teilbarkeitsregeln anwenden und begründen. | TEILER | Mix | I, II |
| M.ZO.TB.PRIM | Ich kann Primzahlen erkennen und Zahlen in Primfaktoren zerlegen. | TEILER | Gen | I |
| M.ZO.TB.GGT-KGV | Ich kann den größten gemeinsamen Teiler und das kleinste gemeinsame Vielfache bestimmen. | PRIM | Gen | I, II |

**Feld BR – Brüche und Dezimalzahlen** (L1)

| ID | Kann-Satz | Voraussetzungen | Abd. | AB |
|---|---|---|---|---|
| M.ZO.BR.BEGRIFF | Ich kann Anteile als Brüche darstellen und Brüche als Anteile deuten. | NZ.DIV | Mix | I, II |
| M.ZO.BR.ERWEITERN | Ich kann Brüche erweitern und kürzen. | BEGRIFF, TB.TEILER | Gen | I, II |
| M.ZO.BR.VERGLEICHEN | Ich kann Brüche vergleichen und ordnen. | ERWEITERN, TB.GGT-KGV | Gen | I, II |
| M.ZO.BR.ADD-SUB | Ich kann Brüche addieren und subtrahieren. | VERGLEICHEN | Gen | I |
| M.ZO.BR.MULT | Ich kann Brüche multiplizieren. | ERWEITERN | Gen | I |
| M.ZO.BR.DIV | Ich kann Brüche dividieren. | MULT | Gen | I |
| M.ZO.BR.DEZIMAL | Ich kann Brüche und Dezimalzahlen ineinander umwandeln. | ERWEITERN | Gen | I |
| M.ZO.BR.DEZ-RECHNEN | Ich kann mit Dezimalzahlen rechnen. | DEZIMAL, NZ.MULT, NZ.DIV | Gen | I |

**Feld GR – Größen und Einheiten** (L2)

| ID | Kann-Satz | Voraussetzungen | Abd. | AB |
|---|---|---|---|---|
| M.GM.GR.UMRECHNEN | Ich kann Längen, Massen und Geldbeträge in andere Einheiten umrechnen. | NZ.STELLENWERT | Gen | I |
| M.GM.GR.ZEIT | Ich kann mit Uhrzeiten und Zeitspannen rechnen. | NZ.ADD-SUB | Gen | I, II |
| M.GM.GR.KOMMA | Ich kann Größen in Kommaschreibweise angeben und damit rechnen. | UMRECHNEN, BR.DEZIMAL | Gen | I |
| M.GM.GR.SACH | Ich kann Sachaufgaben mit Größen lösen. | UMRECHNEN, ZEIT | Mix | II |

**Summe:** 23 Kompetenzen × 3 Niveaus. Davon 17 überwiegend generatorbasiert, 6 gemischt.

Zum Abgleich mit BASEBAU §5.3: Realistisch werden in einem Schuljahr 15–25 Kompetenz-Niveau-Paare gefestigt – passend zur Bauplan-Annahme von Epoche 1.

### 8.3 Graph (vereinfacht)

```
STELLENWERT ─┬─ RUNDEN
             ├─ ADD-SUB ─ MULT ─ DIV ─┬─ TB.TEILER ─┬─ TB.REGELN
             │      │        │        │             └─ TB.PRIM ─ TB.GGT-KGV ─┐
             │      └─ GR.ZEIT        └─ BR.BEGRIFF ─┐                       │
             │          REGELN ─ TERME               └─ BR.ERWEITERN ────────┴─ BR.VERGLEICHEN ─ BR.ADD-SUB
             └─ GR.UMRECHNEN                             ├─ BR.MULT ─ BR.DIV
                    └─ GR.SACH                           └─ BR.DEZIMAL ─ BR.DEZ-RECHNEN
                    └─ GR.KOMMA (+ BR.DEZIMAL)
```

Der maßgebliche Graph ist die Datenquelle in `content/`; diese Skizze dient nur der Übersicht.

## 9. Sprache in Aufgaben

**Entscheidung L-7:** Alle Aufgabentexte folgen ab Phase 1 Regeln für einfache, klare Sprache: kurze Sätze, eine Information pro Satz, Operatoren fett und einheitlich, keine unnötigen Nebensätze, Fachbegriffe mit Erklärung beim ersten Auftreten.
*Warum:* DaZ und Hilfesprache kommen erst in Phase 5 (KONZEPT §13). Einfache Sprache ist die Abfederung bis dahin – und hilft allen, nicht nur Jugendlichen mit DaZ. Gerade Sachaufgaben (GR.SACH) messen sonst Lesekompetenz statt Mathematik.

Operatoren in Phase 1 (einheitliche Liste): *berechne, bestimme, gib an, ordne, vergleiche, runde, überschlage, entscheide, begründe, finde den Fehler*.

## 10. Länderbezug

**Entscheidung L-8:** Phase 1 arbeitet nur mit KMK-Bezug und typischer Klassenstufe. Eine Zuordnung zu einzelnen Landeslehrplänen gibt es noch nicht; das Bundesland wird nicht abgefragt.
*Warum:* Für Kl. 5–6 Mathematik sind die Unterschiede überwiegend Reihenfolge, die der Graph abfängt. Eine Länderzuordnung ist für eine Person erst sinnvoll, wenn Abschlussprüfungen (Phase 4) länderspezifisch werden. Und jede nicht abgefragte Angabe ist gelebter Datenschutz.

## 11. Offene Punkte

| ID | Frage | Tendenz |
|---|---|---|
| L-O1 | KMK-Bezeichnungen und Zuordnungen am Original prüfen | vor Abschluss Phase 0 |
| L-O2 | Negative Zahlen in Phase 1? (Kl. 6 oder 7, je nach Land) | Nein, Phase 4 |
| L-O3 | Schwellen für „gekonnt“ und „gefestigt“ | „Gefestigt“: 90 % + 7 Tage im Review bestätigt (Startwert); Feinkalibrierung mit Testjugendlichen und Simulator |
| L-O4 | Darstellung von Brüchen als Bild (Kreis, Rechteck) – Generator mit SVG | Ja, für BR.BEGRIFF nötig; Aufwand in `INHALTSFORMAT.md` klären |
| L-O5 | Hilfen in Aufgaben (Tipp, Lösungsweg) – wie wirken sie auf „gekonnt“? | Aufgabe mit Hilfe zählt für Stein, nicht für „gekonnt“ |

## 12. Entscheidungen dieses Dokuments

| ID | Entscheidung | Status |
|---|---|---|
| L-1 | Sprechende, stabile Kompetenz-IDs, nie umbenennen | Entschieden |
| L-2 | Niveaus pro Kompetenz, unabhängig von Schulform | Entschieden |
| L-3 | Niveauwechsel nur als Vorschlag | Entschieden |
| L-4 | FSRS-Karte = Aufgabenvorlage; jede Wiederholung erzeugt neue Aufgabe | Entschieden |
| L-5 | Graph empfiehlt, sperrt nicht | Entschieden |
| L-6 | Phase 1: Natürliche Zahlen, Teilbarkeit, Brüche/Dezimalzahlen, Größen | Entschieden |
| L-7 | Einfache Sprache in allen Aufgaben ab Phase 1 | Entschieden |
| L-8 | Kein Länderbezug und keine Bundesland-Abfrage in Phase 1 | Entschieden |
