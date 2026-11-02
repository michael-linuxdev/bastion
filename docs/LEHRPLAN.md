# Bastion – Kompetenzmodell (Lehrplan)

Status: Entwurf v0.3 · Stand: 02.11.2026 · Aufgaben 0.4, 0.18, U6 (Klasse 9 bis 12, §8e–§8g)
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

**Entscheidung L-22 (PV, 02.11.2026, ersetzt L-3): Lernende sehen keine Niveaus.** Die App wählt je Kompetenz still das Niveau der nächsten Aufgabe aus den bisherigen Aufgaben („dauernde Evaluation“, `src/core/learning/niveau-wahl.ts`): Start auf dem niedrigsten Niveau mit Aufgaben; hoch, sobald auf dem aktuellen Niveau die Regel für „gekonnt“ erfüllt ist (5 von 6 ohne Hilfe richtig, 2 Vorlagen); runter nach 3 misslungenen Aufgaben nacheinander. Kein Hinweis auf Auf- oder Abstieg. Für Lernende zählt der beste Stand über alle Niveaus (Übersicht, „Mein Stand“). Eltern und der Bericht für die Lehrkraft sehen die Niveaus weiter. Beim **Aufgabenblatt** (und später bei den Prüfungen, K-25) wählt man G, M oder E selbst. Die Baupläne je Niveau (§4.2, B-4) bleiben, nur unsichtbar.
*Warum:* Lernende bekommen die Aufgaben, die sie gerade lösen können, ohne sich selbst einstufen zu müssen. Weil nichts angezeigt wird, beschämt ein Abstieg nicht – das war der Grund für L-3.

~~**Entscheidung L-3:**~~ *(ersetzt durch L-22)* Niveauwechsel sind **Vorschläge, keine Automatik**. Die App schlägt höher vor, wenn eine Kompetenz schnell und sicher gekonnt wird, und tiefer, wenn sie wiederholt nicht gelingt. Der Jugendliche entscheidet.
*Warum:* Automatisches Herabstufen wirkt beschämend; automatisches Hochstufen kann überfordern. Selbstbestimmung über das eigene Niveau ist Teil der Autonomie, die langfristige Motivation trägt.

*Scope bis Monat 12 (K-11):* Inhalte entstehen nur für **G** und **M**. Niveau E bleibt im Modell (IDs, Datenfelder), wird aber erst nach Monat 12 mit Aufgaben gefüllt. Bis dahin schlägt die App kein Hochstufen über M hinaus vor.

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
| L4 | Raum und Form | ✅ Klasse 5 (K-16) |
| L5 | Daten und Zufall | teilweise (arithmetisches Mittel); mehr ab den Klassenstufen, in denen der Lehrplan es verlangt |

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
neu → (erklärt) → in Arbeit → gekonnt → gefestigt
                              ↓ (Erinnerung sinkt)
                          auffrischen → (Wiederholung bestanden) → gefestigt
```

| Status | Bedingung (Startwerte) |
|---|---|
| **neu** | Noch keine Aufgabe bearbeitet |
| **erklärt** | Noch keine Aufgabe bearbeitet, aber die Erstvermittlung ist bis zum Ende durchlaufen (VERMITTLUNG §2.4, „vermittelt“; seit U3d). Nur eine Anzeige vor dem ersten Üben; für „gekonnt“ zählt allein das Üben |
| **in Arbeit** | Mindestens eine Aufgabe bearbeitet |
| **gekonnt** | Von den letzten 6 Aufgaben auf diesem Niveau mindestens 5 richtig, ohne Hilfe, verteilt über mindestens 2 Aufgabenvorlagen |
| **gefestigt** | Gekonnt, *und* jede Aufgabenvorlage mindestens 2× als fällige Wiederholung bestanden, mit mindestens 7 Tagen zwischen erster Gekonnt-Feststellung und letzter Wiederholung, *und* geschätzte Erinnerungswahrscheinlichkeit aller Vorlagen ≥ 90 % |
| **auffrischen** | War gefestigt, Erinnerungswahrscheinlichkeit einer Vorlage < 80 % |

Konkretisierung von BASEBAU §3.3: Die „Elemente“ einer Kompetenz sind ihre **Aufgabenvorlagen**.

*Umsetzung (1b):* `src/core/learning/fortschritt.ts` berechnet alle Stufen. Präzisierungen: Für „gekonnt“ zählen die letzten 6 bearbeiteten Aufgaben (übersprungene nicht); mindestens 5 davon ohne Hilfe richtig, aus mindestens 2 Vorlagen. Für „gefestigt“ zählen die Vorlagen, die auf diesem Niveau geübt wurden (mindestens 2); geprüft wird bei jeder Antwort, die Erinnerung mit FSRS (`src/core/srs/karten.ts`). „Gekonnt“ und „gefestigt“ bleiben nach dem ersten Erreichen bestehen; „auffrischen“ wird beim Anzeigen berechnet.

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

*Umsetzung (1c):* `src/core/learning/diagnose.ts`. Je Kompetenz zwei Aufgaben aus zwei Vorlagen (bei 1 : 1 eine dritte); als Nächstes getestet wird die offene Kompetenz, deren Ergebnis in beide Richtungen am meisten entscheidet (wer sie kann, kann vermutlich die Voraussetzungen; wer nicht, vermutlich auch nicht, was darauf aufbaut). Höchstens 30 Aufgaben in zwei Etappen zu 15. Präzisierungen: Gestartet wird für alle bei Klasse 5 und Niveau G – Klassenstufe und Schulform werden (noch) nicht abgefragt, weil es nur Inhalte der Klasse 5 gibt. Nur **getestete** Kompetenzen werden „gekonnt“; gefolgerte zeigt die Ergebnisseite, gespeichert werden sie nicht. Simulation mit dem echten Graphen: bei Unsicheren reicht das Budget für ein vollständiges Bild (z. B. 26 Aufgaben); bei sehr Starken bleiben Kompetenzen offen, weil der Graph 21 Endpunkte hat – sie zeigen sich beim Üben schnell als „gekonnt“.

**Rückweg bei Fehlern:** Scheitert jemand wiederholt an einer Kompetenz, schlägt die App gezielt eine Voraussetzung vor („Kurz Teiler auffrischen?“), statt immer weiter dieselbe Kompetenz zu wiederholen.

*Umsetzung (1c):* `src/core/learning/empfehlung.ts`. „Empfohlen“ (L-5) steht in der Übersicht und in „Mein Stand“. Rückweg: nach **drei** falschen Antworten in Folge beim Üben schlägt die App die grundlegendste Voraussetzung vor, die noch nicht mindestens „gekonnt“ ist („Kurz üben“); gibt es keine, kommt kein Vorschlag.

## 8. Klasse 5 (Sachsen) – Kompetenzen für den ersten Bauabschnitt

Grundlage (K-16, bindend): **Lehrplan Oberschule Mathematik 2019** und **Lehrplan Gymnasium Mathematik 2004/2009/2011/2013/2019/2021** (Klassenstufen 5–8 in Kraft seit 1. August 2021), Sächsisches Staatsministerium für Kultus; Fundstellen in `docs/quellen/README.md`. Abkürzungen: **OS** = Oberschule, **GY** = Gymnasium, **LB** = Lernbereich.

### 8.1 Auswahl

**Entscheidung L-6 (neu gefasst am 27.10.2026, ersetzt die frühere Auswahl „vier Felder Kl. 5–6“):** Klasse 5 umfasst alle **Pflicht-Lernbereiche** der Klassenstufe 5 von OS und GY zusammen (K-15). Liegt ein Inhalt an einer Schulart in Klasse 5, an der anderen in Klasse 6, gehört er zu Klasse 5 und wird für die andere Schulart als „vorgezogen“ markiert.

| | OS Klasse 5 | GY Klasse 5 |
|---|---|---|
| LB 1 | Natürliche Zahlen (34 Ustd.) | Arbeiten mit natürlichen Zahlen (23 Ustd.) |
| LB 2 | Gemeine Brüche, Dezimalzahlen und Größen (34 Ustd.) | Gemeine Brüche und Dezimalzahlen (27 Ustd.) |
| LB 3 | Geometrische Grundformen (20 Ustd.) | Lagebeziehungen geometrischer Objekte (22 Ustd.) |
| LB 4 | Symmetrie und deckungsgleiche Figuren (12 Ustd.) | Rechtecke und Quader (22 Ustd.) |
| LB 5 | – | Vernetzung: Mathematik im Alltag (10 Ustd.) |

**Wahlbereiche** (OS: Zählen und Rechnen in der Geschichte, Meine neue Klasse, Planen einer Klassenfahrt; GY: Dynamisieren geometrischer Objekte, Puzzles und Spiele, Zählen und Rechnen einst und jetzt) sind **nicht** Teil der Abschlusskriterien von Klasse 5 (L-11). Sie können später als Zusatzangebote kommen.

**Wichtige Unterschiede der Schularten in Klasse 5:**
- **Brüche:** OS legt den Schwerpunkt auf das inhaltliche Verständnis; Rechnen mit gemeinen Brüchen ist ausdrücklich nicht gemeint, Erweitern und Kürzen kommen an der OS erst in Kl. 6 (LB 1 „Gebrochene Zahlen“). Das GY behandelt **Kürzen und Erweitern** und die Prozentschreibweise bereits in Klasse 5.
- **Körper:** OS behandelt den **Würfel**, GY den **Quader** (einschließlich zusammengesetzter Körper).
- **Winkelpaare** (Scheitel-, Neben-, Stufen-, Wechselwinkel) und **Punktsymmetrie, Drehung** stehen nur im GY-Lehrplan; **Quadratwurzel** und **Teilbarkeit als eigener Abschnitt mit Sieb des Eratosthenes** sowie **Textgleichungen** nur im OS-Lehrplan.
- **Arithmetisches Mittel** ist am GY Pflicht (LB 2), an der OS in Kl. 5 nur im Wahlbereich, in Kl. 6 Pflicht.

### 8.2 Kompetenzen

Legende: **Gen** = Generator · **Hand** = handverfasst · **Mix** = gemischt · **Erkl** = Zeichnen/Konstruieren wird erklärt, geprüft werden nur die prüfbaren Teile (L-10). Spalte *Sachsen* (L-9): wo die Kompetenz im Lehrplan steht; „GY vorgez.“ heißt: Inhalt kommt an der OS erst in Kl. 6.

**Feld NZ – Natürliche Zahlen** (KMK L1)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.ZO.NZ.STELLENWERT | Ich kann große Zahlen lesen, schreiben und in der Stellenwerttafel darstellen. | – | OS LB 1, GY LB 1 | Gen |
| M.ZO.NZ.ORDNEN *(neu)* | Ich kann natürliche Zahlen vergleichen, ordnen und am Zahlenstrahl darstellen. | STELLENWERT | OS LB 1, GY LB 1 | Gen |
| M.ZO.NZ.RUNDEN | Ich kann Zahlen runden, schätzen und Ergebnisse überschlagen. | STELLENWERT | OS LB 1, GY LB 1 | Gen |
| M.ZO.NZ.ADD-SUB | Ich kann addieren und subtrahieren – im Kopf, halbschriftlich und schriftlich. | STELLENWERT | OS LB 1, GY LB 1 (Wiederholung) | Gen |
| M.ZO.NZ.MULT | Ich kann multiplizieren – im Kopf, halbschriftlich und schriftlich. | ADD-SUB | OS LB 1, GY LB 1 (Wiederholung) | Gen |
| M.ZO.NZ.DIV | Ich kann durch eine einstellige Zahl dividieren, auch mit Rest. | MULT | OS LB 1, GY LB 1 | Gen |
| M.ZO.NZ.POTENZEN *(neu)* | Ich kann Zehnerpotenzen und Quadratzahlen bis 20² angeben und die Quadratwurzel als Umkehrung nutzen. | MULT | OS LB 1, GY LB 1 (Wurzel nur OS) | Gen |
| M.ZO.NZ.REGELN | Ich kann Rechengesetze und Rechenvorteile nutzen, um geschickt zu rechnen. | ADD-SUB, MULT | OS LB 1, GY LB 1 | Gen |
| M.SF.NZ.TERME | Ich kann Terme mit Klammern und Punkt-vor-Strich berechnen. | REGELN | OS LB 1 (Vorrangregeln), GY LB 1 | Gen |
| M.SF.NZ.GLEICHUNGEN *(neu)* | Ich kann einfache Gleichungen und Ungleichungen durch Probieren oder mit der Umkehraufgabe lösen und Textgleichungen aufstellen. | ADD-SUB, MULT | OS LB 1, GY LB 1 | Mix |

**Feld TB – Teilbarkeit** (KMK L1)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.ZO.TB.TEILER | Ich kann Teiler und Vielfache einer Zahl finden. | NZ.DIV | OS LB 1, GY LB 1 | Gen |
| M.ZO.TB.REGELN | Ich kann die Teilbarkeitsregeln für 2, 3, 4, 5, 6 und 10 anwenden. | TEILER | OS LB 1, GY LB 1 | Gen |
| M.ZO.TB.PRIM | Ich kann Primzahlen erkennen und einfache Zahlen in Primfaktoren zerlegen. | TEILER | OS LB 1 (Primzahlen), GY LB 1 (auch Zerlegung) | Gen |

**Feld BR – Brüche und Dezimalzahlen** (KMK L1)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.ZO.BR.BEGRIFF | Ich kann Anteile als Brüche darstellen, Brüche als Anteile deuten und echte und unechte Brüche unterscheiden. | NZ.DIV | OS LB 2, GY LB 2 | Mix |
| M.ZO.BR.ZAHLENSTRAHL *(neu)* | Ich kann Brüche und Dezimalzahlen am Zahlenstrahl ablesen und eintragen. | BEGRIFF, NZ.ORDNEN | OS LB 2, GY LB 2 | Gen |
| M.ZO.BR.ANTEIL-VON *(neu)* | Ich kann Anteile von Größen berechnen, z. B. 2/3 von 27 km. | BEGRIFF, NZ.DIV | OS LB 2, GY LB 2 | Gen |
| M.ZO.BR.ERWEITERN | Ich kann Brüche erweitern und kürzen. | BEGRIFF, TB.TEILER | GY LB 2 (OS Kl. 6, LB 1 – GY vorgez.) | Gen |
| M.ZO.BR.VERGLEICHEN | Ich kann Brüche vergleichen, ordnen und abschätzen. | BEGRIFF (GY: auch ERWEITERN) | OS LB 2, GY LB 2 | Gen |
| M.ZO.BR.DEZIMAL | Ich kann Zehnerbrüche, Dezimalzahlen und (GY) passende gemeine Brüche ineinander umwandeln. | BEGRIFF, NZ.STELLENWERT | OS LB 2, GY LB 2 | Gen |
| M.ZO.BR.PROZENT *(neu)* | Ich kann einfache Anteile in Prozentschreibweise angeben (1 %, 10 %, 20 %, 25 %, 50 %, 75 %, 100 %). | DEZIMAL | OS LB 2 (Einblick), GY LB 2 | Gen |
| M.ZO.BR.DEZ-ORDNEN *(neu)* | Ich kann Dezimalzahlen vergleichen, ordnen und runden. | DEZIMAL, NZ.RUNDEN | OS LB 2, GY LB 2 | Gen |
| M.ZO.BR.DEZ-RECHNEN | Ich kann Dezimalzahlen addieren und subtrahieren und mit einstelligen Zahlen und Zehnerpotenzen multiplizieren und dividieren. | DEZIMAL, NZ.MULT, NZ.DIV | OS LB 2, GY LB 2 | Gen |
| M.DZ.DA.MITTELWERT *(neu)* | Ich kann das arithmetische Mittel (den Durchschnitt) berechnen. | DEZ-RECHNEN | GY LB 2 (OS Kl. 6, LB 1 – GY vorgez.) | Gen |

**Feld GR – Größen** (KMK L2)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.GM.GR.UMRECHNEN | Ich kann Geld, Längen, Massen und Zeiten in andere Einheiten umrechnen (auch Dezi, Zenti, Milli). | NZ.STELLENWERT | OS LB 2, GY LB 5 | Gen |
| M.GM.GR.ZEIT | Ich kann mit Uhrzeiten und Zeitspannen rechnen. | NZ.ADD-SUB | OS LB 2, GY LB 5 | Gen |
| M.GM.GR.KOMMA | Ich kann Größen in verschiedenen Schreibweisen angeben (4 € 3 ct = 4,03 €; 1 m 20 cm = 1,2 m). | UMRECHNEN, BR.DEZIMAL | OS LB 2, GY LB 5 | Gen |
| M.GM.GR.SACH | Ich kann Sachaufgaben mit Größen lösen, überschlagen und sinnvoll runden. | UMRECHNEN, ZEIT, BR.DEZ-RECHNEN | OS LB 2, GY LB 5 | Mix |

**Feld GF – Geometrische Grundformen und Lagebeziehungen** (KMK L4)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.RF.GF.KOORDINATEN *(neu)* | Ich kann Punkte im Koordinatensystem ablesen und eintragen (erster Quadrant). | NZ.ORDNEN | OS LB 3, GY LB 3 (GY auch mit Brüchen und Dezimalzahlen) | Gen |
| M.RF.GF.LAGE *(neu)* | Ich kann erkennen und beschreiben, ob Geraden und Strecken parallel, senkrecht oder schneidend zueinander liegen. | – | OS LB 3, GY LB 3 | Mix · Erkl |
| M.RF.GF.WINKEL *(neu)* | Ich kann Winkel messen, zeichnen, bezeichnen und nach Winkelarten einteilen. | – | OS LB 3, GY LB 3 | Gen · Erkl |
| M.RF.GF.WINKELPAARE *(neu)* | Ich kann Scheitel-, Neben-, Stufen- und Wechselwinkel erkennen und ihre Größen bestimmen. | WINKEL, LAGE | GY LB 3 | Gen |

**Feld SY – Symmetrie und Bewegungen** (KMK L4)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.RF.SY.SYMMETRIE *(neu)* | Ich kann achsensymmetrische (GY: auch punktsymmetrische) Figuren erkennen und Symmetrieachsen finden. | – | OS LB 4, GY LB 3 | Mix |
| M.RF.SY.BEWEGUNGEN *(neu)* | Ich kann Spiegelung, Verschiebung (GY: und Drehung) unterscheiden und eine Verschiebung durch Richtung und Weite beschreiben. | SYMMETRIE | OS LB 4, GY LB 3 | Mix |
| M.RF.SY.SPIEGELN *(neu)* | Ich kann Figuren an einer Geraden spiegeln – auch im Koordinatensystem – und Original und Bild zuordnen. | SYMMETRIE, GF.KOORDINATEN | OS LB 4, GY LB 3 | Gen · Erkl |

**Feld FL – Umfang und Flächeninhalt** (KMK L2)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.GM.FL.RECHTECK *(neu)* | Ich kann Umfang und Flächeninhalt von Rechtecken und Quadraten berechnen. | NZ.MULT | OS LB 3, GY LB 4 | Gen |
| M.GM.FL.EINHEITEN *(neu)* | Ich kann Flächeneinheiten umrechnen (mm² bis km², a, ha). | RECHTECK, GR.UMRECHNEN | OS LB 3, GY LB 4/5 | Gen |
| M.GM.FL.ZUSAMMENGESETZT *(neu)* | Ich kann Umfang und Flächeninhalt von Figuren bestimmen, die sich in Rechtecke zerlegen lassen. | RECHTECK | OS LB 3, GY LB 4 | Gen |

**Feld KP – Würfel und Quader** (KMK L4, L2)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.RF.KP.DARSTELLEN *(neu)* | Ich kann Netze, Schrägbilder und Ansichten von Würfeln und Quadern erkennen und dem Körper zuordnen. | – | OS LB 3 (Würfel), GY LB 4 (Quader) | Mix · Erkl |
| M.GM.KP.VOLUMEN *(neu)* | Ich kann das Volumen von Würfeln und Quadern (GY: auch zusammengesetzter Körper) berechnen. | FL.RECHTECK | OS LB 3 (Würfel), GY LB 4 | Gen |
| M.GM.KP.OBERFLAECHE *(neu)* | Ich kann den Oberflächeninhalt von Würfeln und Quadern berechnen. | FL.RECHTECK, DARSTELLEN | OS LB 3 (Würfel), GY LB 4 | Gen |
| M.GM.KP.EINHEITEN *(neu)* | Ich kann Volumeneinheiten und Hohlmaße umrechnen (mm³ bis m³, ml, l). | VOLUMEN, GR.UMRECHNEN | OS LB 3, GY LB 4 | Gen |

**Summe Klasse 5:** 41 Kompetenzen × 2 Niveaus (G, M). Davon 34 überwiegend generatorbasiert, 7 gemischt; bei 4 wird zusätzlich Zeichnen erklärt (L-10). Datenquelle: `content/mathematik/…/kompetenz.yaml`.

**Aus dem früheren Ausschnitt nach Klasse 6 verschoben** (Lehrplan OS Kl. 6 LB 1 bzw. GY Kl. 6 LB 1): M.ZO.BR.ADD-SUB, M.ZO.BR.MULT, M.ZO.BR.DIV. IDs bleiben unverändert (L-1).
**Nicht ausdrücklich im Lehrplan:** M.ZO.TB.GGT-KGV steht weder im OS- noch im GY-Lehrplan Kl. 5–6. Es bleibt als Hilfskompetenz für das Addieren ungleichnamiger Brüche (Hauptnenner) in Klasse 6 im Graphen, zählt aber nicht zu den Abschlusskriterien.

*Ehrliche Einordnung:* 41 Kompetenzen mit je mindestens zwei Vorlagen pro Niveau bedeuten rund 165 geprüfte Vorlagen für Klasse 5. Für eine Person ist das die Arbeit vieler Monate – das ist der Preis von K-15 und K-16 und wird bewusst in Kauf genommen.

### 8.3 Zeichnen und Konstruieren

**Entscheidung L-10: Zeichnen und Konstruieren werden erklärt, geprüft wird das Prüfbare.**
- Die App **erklärt** Zeichen- und Konstruktionsschritte (Winkel mit dem Geodreieck zeichnen, Spiegeln, Schrägbild, später Konstruieren mit Zirkel): Schritt für Schritt, mit Bildern, zum Nachmachen auf Papier.
- Bewertet werden nur Teilfähigkeiten, die sich ohne freies Zeichnen prüfen lassen: Winkel an einem abgebildeten Winkelmesser ablesen, Winkelart bestimmen, Koordinaten des Bildpunkts angeben, das richtige Netz oder Schrägbild auswählen, Zeichenschritte in die richtige Reihenfolge bringen.
- Freies Zeichnen in der App gibt es nicht. Ob eine Zeichnung auf Papier gelungen ist, schätzt die Person selbst ein; diese Selbsteinschätzung zählt **nicht** für „gekonnt“ oder „gefestigt“ (wie Hilfen, L-O5).

*Umsetzung (1a):* Fünf Anleitungen (INHALTSFORMAT §4.3), beim Üben der Kompetenz unter „Zeichnen lernen“. Jeder Schritt mit Bild; am Ende eine Prüfliste zum Abhaken, die nicht gespeichert wird – die Selbsteinschätzung bleibt so ganz bei den Lernenden.

*Warum:* Die Lehrpläne verlangen Zeichnen und Konstruieren mit echten Geräten („unliniertes Papier, Geodreieck und Winkelmesser“). Die App ersetzt das nicht, sie bereitet es vor und sichert das Verständnis ab. Eine Zeichenfläche mit automatischer Prüfung wäre aufwendig, auf Handys ungenau und für Screenreader kaum zugänglich (A5).

### 8.4 Graph Klasse 5 (vereinfacht)

```
NZ.STELLENWERT ─┬─ NZ.ORDNEN ─┬─ GF.KOORDINATEN ─ SY.SPIEGELN
                │             └─ BR.ZAHLENSTRAHL
                ├─ NZ.RUNDEN ─ BR.DEZ-ORDNEN
                ├─ NZ.ADD-SUB ─ NZ.MULT ─┬─ NZ.DIV ─┬─ TB.TEILER ─┬─ TB.REGELN
                │      │                 │          │             └─ TB.PRIM
                │      │                 │          └─ BR.BEGRIFF ─┬─ BR.ERWEITERN
│      │                 │                         ├─ BR.VERGLEICHEN
                │      │                 │                         ├─ BR.ANTEIL-VON
                │      │                 │                         └─ BR.DEZIMAL ─┬─ BR.PROZENT
                │      │                 │                                        └─ BR.DEZ-RECHNEN ─ DA.MITTELWERT
                │      │                 ├─ NZ.POTENZEN
                │      │                 ├─ NZ.REGELN ─ NZ.TERME
                │      │                 └─ FL.RECHTECK ─┬─ FL.ZUSAMMENGESETZT
                │      │                                 ├─ FL.EINHEITEN
                │      │                                 └─ KP.VOLUMEN ─ KP.EINHEITEN
                │      ├─ NZ.GLEICHUNGEN
                │      └─ GR.ZEIT
                └─ GR.UMRECHNEN ─┬─ GR.KOMMA (+ BR.DEZIMAL)
                                 └─ GR.SACH (+ GR.ZEIT, BR.DEZ-RECHNEN)

ohne Voraussetzung:  GF.LAGE · GF.WINKEL ─ GF.WINKELPAARE · SY.SYMMETRIE ─ SY.BEWEGUNGEN · KP.DARSTELLEN ─ KP.OBERFLAECHE
```

Der maßgebliche Graph ist die Datenquelle in `content/`; diese Skizze dient nur der Übersicht.

## 8b. Klasse 6 (Sachsen) – Kompetenzen für den zweiten Bauabschnitt

Grundlage wie §8 (K-16): Lehrplan Oberschule Mathematik 2019, Lehrplan Gymnasium Mathematik (Kl. 5–8 seit 1. August 2021). Ausgewertet am 28.10.2026 aus den vom Projektverantwortlichen bereitgestellten PDF-Dateien. Nach K-17 entstehen die Kompetenzen und Vorlagen als **Entwurf**; Prüfung und Test folgen gesammelt.

### 8b.1 Auswahl

| | OS Klasse 6 | GY Klasse 6 |
|---|---|---|
| LB 1 | Gebrochene Zahlen (35 Ustd.) | Arbeiten mit gebrochenen Zahlen (34 Ustd.) |
| LB 2 | Zuordnungen in der Umwelt (25 Ustd.) | Zuordnungen in der Umwelt (24 Ustd.) |
| LB 3 | Geometrie in der Ebene (30 Ustd.) | Dreiecke und Vierecke (30 Ustd.) |
| LB 4 | Geometrische Körper (20 Ustd.) | Prismen (12 Ustd.) |
| LB 5 | Mathematik im Alltag (15 Ustd.) | Vernetzung: Anteile (4 Ustd.) |

**Wahlbereiche** (OS: Dynamisieren geometrischer Objekte, Mathematische Spiele, Erfassen und Auswerten von Daten; GY: Finden von Vermutungen mit dynamischer Geometrie, Unterhaltsame Geometrie, Primzahlen) zählen nicht (L-11).

**Regel wie bei Klasse 5 (L-6):** Was eine Schulart schon in Klasse 5 hat, steht in §8 (z. B. Erweitern und Kürzen, arithmetisches Mittel, Winkelpaare – OS erst Kl. 6). Was eine Schulart in Klasse 6 und die andere erst in Klasse 7 hat, steht hier und ist für die andere „vorgezogen“: **Kreisdiagramme und Flächenanteile** (GY Kl. 6 LB 5, OS Kl. 7 LB 2 „Anteile und Prozente“) sowie **Berechnen von Prismen** (GY Kl. 6 LB 4, OS Kl. 7 LB 4 „Vielecke und Prismen“; die OS berechnet in Kl. 6 nur aus Quadern zusammengesetzte Körper).

**Wichtige Unterschiede der Schularten in Klasse 6:**
- **Geometrie:** Beide behandeln Winkelsätze, Dreiecksarten, Kongruenzsätze, Seiten-Winkel-Relation, Dreiecksungleichung und Flächeninhalte von Dreiecken und Vierecken. **Besondere Linien im Dreieck** (Höhe, Mittelsenkrechte, Winkelhalbierende, Seitenhalbierende) stehen nur im GY-Lehrplan; die OS braucht die Höhe für die Flächenformel.
- **Zufall:** OS in LB 5 (Einblick: Zufallsversuche, absolute und relative Häufigkeit), GY in LB 2 (Häufigkeiten als Zuordnungen).
- **Mengen:** beide nur „Einblick gewinnen“ (Element, Menge, Teilmenge).

**Nicht in der App abbildbar** (ehrlich benannt, wie freies Zeichnen in L-10): Präsentationen anfertigen (OS LB 5), Modelle bauen, Arbeit mit dynamischer Geometriesoftware und mit dem Taschenrechner. Problemlösestrategien (systematisches Probieren, Zurückführen auf Bekanntes, Skizzen) fließen in die Sachaufgaben ein, statt eine eigene Kompetenz zu sein.

### 8b.2 Kompetenzen

Legende wie §8.2. *Sachsen:* LB der Klasse 6, sonst angegeben.

**Feld BR – Gebrochene Zahlen** (KMK L1, L3)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.ZO.BR.MENGEN | Ich kann Zahlen einem Zahlbereich zuordnen und Element, Menge und Teilmenge unterscheiden. | BR.BEGRIFF | OS LB 1, GY LB 1 (je Einblick) | Mix |
| M.ZO.BR.PERIODISCH | Ich kann gemeine Brüche in Dezimalzahlen umwandeln und umgekehrt – auch periodische Dezimalzahlen. | BR.DEZIMAL, BR.ERWEITERN | OS LB 1, GY LB 1 | Gen |
| M.ZO.TB.GGT-KGV | Ich kann das kleinste gemeinsame Vielfache und den größten gemeinsamen Teiler zweier Zahlen finden. | TB.TEILER | Hilfskompetenz für LB 1 (Hauptnenner, vollständig kürzen) | Gen |
| M.ZO.BR.ADD-SUB | Ich kann gemeine Brüche addieren und subtrahieren – gleichnamige und ungleichnamige. | BR.ERWEITERN, TB.GGT-KGV | OS LB 1, GY LB 1 | Gen |
| M.ZO.BR.MULT | Ich kann Brüche miteinander und mit natürlichen Zahlen multiplizieren. | BR.ERWEITERN, BR.ANTEIL-VON | OS LB 1, GY LB 1 | Gen |
| M.ZO.BR.DIV | Ich kann Brüche durch natürliche Zahlen und durch Brüche dividieren. | BR.MULT | OS LB 1, GY LB 1 | Gen |
| M.ZO.BR.DEZ-MULT-DIV | Ich kann Dezimalzahlen miteinander multiplizieren und durch Dezimalzahlen dividieren. | BR.DEZ-RECHNEN | OS LB 1, GY LB 1 | Gen |
| M.ZO.BR.RECHENGESETZE | Ich kann Rechengesetze und Vorrangregeln auch bei Brüchen und Dezimalzahlen nutzen. | BR.ADD-SUB, BR.MULT, BR.DEZ-MULT-DIV, SF.NZ.TERME | OS LB 1, GY LB 1 | Gen |
| M.SF.BR.GLEICHUNGEN | Ich kann Gleichungen und Ungleichungen mit gebrochenen Zahlen durch Probieren oder mit der Umkehraufgabe lösen. | SF.NZ.GLEICHUNGEN, BR.ADD-SUB, BR.MULT | OS LB 1, GY LB 1 | Gen |
| M.ZO.BR.SACH | Ich kann Sachaufgaben mit Brüchen und Dezimalzahlen lösen, Ergebnisse überschlagen und sinnvoll runden. | BR.RECHENGESETZE | OS LB 1, GY LB 1 | Mix |
| M.ZO.BR.ANTEILE | Ich kann Anteile als Bruch, Dezimalzahl und in Prozent angeben und vergleichen – auch Flächenanteile. | BR.PROZENT, BR.PERIODISCH | GY LB 5 (OS Kl. 7 LB 2 – GY vorgez.) | Gen |

**Feld ZU – Zuordnungen** (KMK L3)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.SF.ZU.DARSTELLEN | Ich kann Zuordnungen aus dem Alltag in Worten, Tabellen, Pfeilbildern, Diagrammen und mit Gleichungen darstellen. | GF.KOORDINATEN | OS LB 2, GY LB 2 | Mix |
| M.SF.ZU.PROPORTIONAL | Ich kann erkennen, ob eine Zuordnung proportional, umgekehrt proportional oder keins von beiden ist. | ZU.DARSTELLEN, BR.DEZ-RECHNEN | OS LB 2, GY LB 2 | Gen |
| M.SF.ZU.DREISATZ | Ich kann Sachaufgaben mit proportionalen und umgekehrt proportionalen Zuordnungen mit dem Dreisatz lösen. | ZU.PROPORTIONAL | OS LB 2 (auch Verhältnisgleichungen, LB 1), GY LB 2 | Gen |
| M.SF.ZU.GRAPH | Ich kann proportionale und umgekehrt proportionale Zuordnungen im Koordinatensystem darstellen und Werte ablesen. | ZU.PROPORTIONAL, GF.KOORDINATEN | OS LB 2, GY LB 2 | Gen |

**Feld ZF – Zufall und Feld DA – Daten** (KMK L5)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.DZ.ZF.HAEUFIGKEIT | Ich kann Ergebnisse von Zufallsversuchen angeben und absolute und relative Häufigkeiten bestimmen. | BR.BEGRIFF, BR.DEZIMAL | OS LB 5, GY LB 2 | Gen |
| M.DZ.DA.KREISDIAGRAMM | Ich kann Anteile in Kreisdiagrammen ablesen und darstellen. | BR.ANTEIL-VON, GF.WINKEL | GY LB 5 (OS Kl. 7 LB 2 – GY vorgez.) | Gen |

**Feld DV – Dreiecke und Vierecke** (KMK L4)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.RF.DV.WINKELSAETZE | Ich kann mit Neben-, Scheitel-, Stufen- und Wechselwinkelsatz und dem Innenwinkelsatz für Dreiecke Winkel berechnen. | GF.WINKELPAARE | OS LB 3, GY LB 3 | Gen |
| M.RF.DV.DREIECKE | Ich kann Dreiecke nach Seiten und Winkeln einteilen und entscheiden, ob es ein Dreieck mit gegebenen Seiten gibt. | GF.WINKEL | OS LB 3, GY LB 3 | Gen |
| M.RF.DV.VIERECKE | Ich kann Quadrat, Rechteck, Raute, Parallelogramm, Trapez und Drachenviereck an ihren Eigenschaften erkennen. | GF.LAGE | OS LB 3, GY LB 3 | Gen |
| M.RF.DV.KONSTRUIEREN | Ich kann mit den Kongruenzsätzen entscheiden, ob ein Dreieck aus gegebenen Stücken eindeutig konstruierbar ist, und Dreiecke konstruieren. | DV.DREIECKE | OS LB 3, GY LB 3 | Mix · Erkl |
| M.RF.DV.BESONDERE-LINIEN | Ich kann Höhen, Mittelsenkrechten, Winkelhalbierende und Seitenhalbierende im Dreieck erkennen. | DV.DREIECKE, GF.LAGE | GY LB 3 | Mix · Erkl |

**Feld FL – Flächeninhalt** (KMK L2)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.GM.FL.DREIECK | Ich kann Umfang und Flächeninhalt von Dreiecken mit Grundseite und zugehöriger Höhe berechnen. | FL.RECHTECK, DV.DREIECKE | OS LB 3, GY LB 3 | Gen |
| M.GM.FL.VIERECKE | Ich kann Umfang und Flächeninhalt von Parallelogrammen, Trapezen und Drachenvierecken berechnen – auch durch Zerlegen und Ergänzen. | FL.DREIECK, DV.VIERECKE | OS LB 3, GY LB 3 | Gen |

**Feld KP – Prismen** (KMK L4, L2)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.RF.KP.PRISMEN | Ich kann gerade Prismen an ihren Eigenschaften erkennen und Netze, Schrägbilder und Ansichten dem Körper zuordnen. | KP.DARSTELLEN, DV.DREIECKE | OS LB 4, GY LB 4 | Mix · Erkl |
| M.GM.KP.PRISMA | Ich kann Volumen und Oberflächeninhalt gerader Prismen und zusammengesetzter Körper berechnen. | KP.PRISMEN, FL.DREIECK, FL.VIERECKE, KP.VOLUMEN, KP.OBERFLAECHE | GY LB 4; OS LB 4 (aus Quadern zusammengesetzt; Prismen OS Kl. 7 LB 4 – GY vorgez.) | Gen |

**Summe Klasse 6:** 26 Kompetenzen × 2 Niveaus (G, M), davon 21 überwiegend generatorbasiert, 5 gemischt; bei 3 wird Zeichnen erklärt (L-10): Dreiecke konstruieren, besondere Linien, Schrägbilder von Prismen. Datenquelle: `content/mathematik/…/kompetenz.yaml` mit `klassenstufe_typisch: [6]`.

*Stand 28.10.2026:* Kompetenzen und Graph stehen. **Feld BR vollständig als Entwurf:** alle 11 Kompetenzen mit mindestens zwei Vorlagen je Niveau (23 Vorlagen, Generatoren in `src/generators/mathematik/brueche/rechnen.ts` und `anwenden.ts`). **Feld ZU vollständig als Entwurf:** 4 Kompetenzen, 8 Vorlagen (`src/generators/mathematik/zuordnungen/`). **ZF und DA (Klasse 6):** Häufigkeiten und Kreisdiagramme mit je 2 Vorlagen (`src/generators/mathematik/daten/zufall.ts`). **Feld DV vollständig als Entwurf:** 5 Kompetenzen, 10 Vorlagen (`src/generators/mathematik/dreiecke/`), dazu die Anleitungen „Dreieck aus drei Seiten konstruieren“ und „Mittelsenkrechte konstruieren“ (L-10). **FL (Klasse 6):** Dreiecke und Vierecke mit 4 Vorlagen (`src/generators/mathematik/flaechen/vielecke.ts`). **KP (Klasse 6):** Prismen mit 4 Vorlagen (`src/generators/mathematik/koerper/prismen.ts`) und der Anleitung „Schrägbild eines Prismas“. Damit haben alle 26 Kompetenzen von Klasse 6 Vorlagen. Neue Felder im ID-Schema: ZU (zuordnungen), ZF (zufall), DV (dreiecke-und-vierecke).

## 8c. Klasse 7 (Sachsen) – Kompetenzen für den dritten Bauabschnitt

Grundlage wie §8 (K-16): Lehrplan Oberschule Mathematik 2019 (Haupt- und Realschulbildungsgang), Lehrplan Gymnasium Mathematik (Kl. 5–8 seit 1. August 2021). Ausgewertet am 28.10.2026 aus denselben PDF-Dateien wie Klasse 6. Nach K-17 entstehen Kompetenzen und Vorlagen als **Entwurf**; Prüfung und Test folgen gesammelt.

### 8c.1 Auswahl

Ab Klasse 7 teilt sich die Oberschule in **Hauptschulbildungsgang (HS)** und **Realschulbildungsgang (RS)**. Beide zählen; wo sie sich unterscheiden, liegt der HS-Umfang meist auf Niveau G, der RS-Umfang auf M (Niveaus bleiben nach L-2 aber unabhängig von der Schulart).

| | OS Klasse 7 – RS | OS Klasse 7 – HS | GY Klasse 7 |
|---|---|---|---|
| LB 1 | Prozent- und Zinsrechnung (28 Ustd.) | Zusammengesetzte Flächen und Körper (20 Ustd.) | Geometrie in der Ebene (24 Ustd.) |
| LB 2 | Elemente der Stochastik (12 Ustd.) | Anteile und Prozente (32 Ustd.) | Arbeiten mit rationalen Zahlen (56 Ustd.) |
| LB 3 | Rationale Zahlen und Gleichungen (28 Ustd.) | Rationale Zahlen (20 Ustd.) | Darstellen und Berechnen von Prismen und Pyramiden (20 Ustd.) |
| LB 4 | Vielecke und Prismen (32 Ustd.) | Vielecke und Prismen (28 Ustd.) | Vernetzung: Darstellen von Daten (4 Ustd.) |

**Wahlbereiche** (RS: Technisches Zeichnen, Unterhaltungsmathematik und Rechenverfahren, Parkettierungen; HS: Bandornamente und Parkettierungen, Optische Täuschungen, Unterhaltungsmathematik; GY: Tabellenkalkulation, Maßstäbe und ihre Anwendungen, Platonische Körper) zählen nicht (L-11).

**Regel wie bei Klasse 5 und 6 (L-6):** Was eine Schulart in Klasse 7 hat und eine andere erst später, steht hier und ist für die andere „vorgezogen“:
- **Zinsrechnung** (RS Kl. 7; HS Kl. 8; GY erst Kl. 10 LB 5),
- **Ergebnis, Ereignis, Wahrscheinlichkeit** (OS Kl. 7; GY Kl. 8 LB 2),
- **Kreis und Gerade, Satz des Thales** (GY Kl. 7; OS Kl. 8 – Thales im HS nur als Differenzierungshinweis),
- **Pyramiden** (GY Kl. 7; OS Kl. 9 bzw. 10).
Schon in Klasse 6 stehen Kreisdiagramme, Flächenanteile und das Berechnen von Prismen (§8b, für die OS vorgezogen). Die Masse über die Dichte steht in allen drei Lehrplänen in Klasse 7.

**Wichtige Unterschiede in Klasse 7:**
- **Rationale Zahlen:** Der HS multipliziert und dividiert ganze Zahlen nur mit bzw. durch natürliche Zahlen, rationale Zahlen mit dem Taschenrechner; RS und GY rechnen in allen Grundrechenarten, das GY auch mit Quadratwurzeln.
- **Gleichungen:** HS löst einfache Gleichungen inhaltlich; RS und GY lösen a·x + b = c·x + d kalkülmäßig und stellen Formeln um.
- **Beweisen** (Satz und Definition, wenn-dann, Gegenbeispiel, direkter Beweis) steht nur im GY-Lehrplan (LB 1); es wird an den Sätzen am Kreis geübt.

**Nicht in der App abbildbar** (wie bei Klasse 6): Arbeit mit dynamischer Geometriesoftware und Tabellenkalkulation, Modelle herstellen, Simulation mit dem Taschenrechner, die **Konstruktion der wahren Länge** im Zweitafelbild (GY LB 3) und Tangentenkonstruktionen mit Zirkel (GY LB 1) – sie werden höchstens erklärt (L-10). Die Strategien **Vorwärts- und Rückwärtsarbeiten** (GY LB 1) und **Gleichung aufstellen** (OS) fließen in die Sachaufgaben ein.

### 8c.2 Kompetenzen

Legende wie §8.2. *Sachsen:* LB der Klasse 7 (bei der OS der RS; der HS hat dieselben Inhalte in LB 2–4, ohne Zins und kalkülmäßiges Gleichungslösen), sonst angegeben.

**Feld RZ – Rationale Zahlen** (KMK L1)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.ZO.RZ.BEGRIFF | Ich kann negative Zahlen im Alltag deuten, auf der Zahlengeraden darstellen und Gegenzahl und Betrag angeben. | NZ.ORDNEN, BR.ZAHLENSTRAHL | OS LB 3, GY LB 2 | Gen |
| M.ZO.RZ.ORDNEN | Ich kann rationale Zahlen vergleichen und der Größe nach ordnen. | RZ.BEGRIFF, BR.VERGLEICHEN | OS LB 3, GY LB 2 | Gen |
| M.ZO.RZ.ZAHLBEREICHE | Ich kann natürliche, ganze, gebrochene und rationale Zahlen unterscheiden und ihre Beziehungen im Mengendiagramm zeigen. | RZ.BEGRIFF, BR.MENGEN | OS LB 3, GY LB 2 | Mix |
| M.ZO.RZ.ADD-SUB | Ich kann rationale Zahlen addieren und subtrahieren und dabei Vorzeichen und Rechenzeichen unterscheiden. | RZ.ORDNEN, BR.ADD-SUB, BR.DEZ-RECHNEN | OS LB 3, GY LB 2 | Gen |
| M.ZO.RZ.MULT-DIV | Ich kann rationale Zahlen multiplizieren und dividieren und das Vorzeichen des Ergebnisses bestimmen. | RZ.ADD-SUB, BR.MULT, BR.DIV, BR.DEZ-MULT-DIV | OS LB 3, GY LB 2 | Gen |
| M.ZO.RZ.POTENZEN | Ich kann Potenzen rationaler Zahlen berechnen und Quadratwurzeln ziehen. | RZ.MULT-DIV, NZ.POTENZEN | OS LB 3, GY LB 2 | Gen |
| M.ZO.RZ.RECHENGESETZE | Ich kann Rechengesetze und Vorrangregeln bei rationalen Zahlen nutzen. | RZ.MULT-DIV, BR.RECHENGESETZE | OS LB 3, GY LB 2 | Gen |

**Feld GF – Koordinatensystem** (KMK L4)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.RF.GF.QUADRANTEN | Ich kann Punkte mit negativen Koordinaten in alle vier Quadranten eintragen und ablesen. | GF.KOORDINATEN, RZ.BEGRIFF | OS LB 3, GY LB 2 | Gen |

**Feld GL – Terme und Gleichungen** (KMK L3)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.SF.GL.TERMWERT | Ich kann Variable in Terme einsetzen und Termwerte auch mit negativen Zahlen berechnen. | NZ.TERME, RZ.MULT-DIV | OS LB 3, GY LB 2 | Gen |
| M.SF.GL.LINEAR | Ich kann lineare Gleichungen durch Umformen lösen und die Lösung durch eine Probe prüfen. | GL.TERMWERT, BR.GLEICHUNGEN, RZ.RECHENGESETZE | OS LB 3, GY LB 2 | Gen |
| M.SF.GL.FORMELN | Ich kann Formeln nach einer gesuchten Größe umstellen. | GL.LINEAR | OS LB 3, GY LB 2 | Gen |
| M.SF.GL.AUFSTELLEN | Ich kann zu Zahlenrätseln und Sachaufgaben eine Gleichung aufstellen und lösen. | GL.LINEAR | OS LB 3, GY LB 2 | Gen |

**Feld PZ – Prozent- und Zinsrechnung** (KMK L1, L3)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.ZO.PZ.BEGRIFFE | Ich kann in Sachtexten Grundwert, Prozentwert und Prozentsatz erkennen und mit bequemen Prozentsätzen rechnen. | BR.PROZENT, BR.ANTEILE | OS LB 1, GY LB 2 | Gen |
| M.ZO.PZ.GRUNDAUFGABEN | Ich kann Prozentwert, Grundwert und Prozentsatz mit dem Dreisatz oder einer Formel berechnen. | PZ.BEGRIFFE, ZU.DREISATZ | OS LB 1, GY LB 2 | Gen |
| M.ZO.PZ.VERAENDERUNG | Ich kann Preiserhöhungen und Preissenkungen berechnen und „Steigerung um“ von „Steigerung auf“ unterscheiden. | PZ.GRUNDAUFGABEN | OS LB 1, GY LB 2 | Gen |
| M.ZO.PZ.ZINS | Ich kann Zinsen, Zinssatz und Kapital berechnen – auch für Teile eines Jahres und mit Zinseszins. | PZ.GRUNDAUFGABEN | OS LB 1, GY Kl. 10 LB 5 – vorgez. | Gen |

**Feld DA – Daten** (KMK L5)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.DZ.DA.DIAGRAMME | Ich kann Daten in Säulen-, Linien- und Kreisdiagrammen darstellen, auswerten und irreführende Darstellungen erkennen. | DA.KREISDIAGRAMM, PZ.GRUNDAUFGABEN | OS LB 2, GY LB 4 | Gen |

**Feld ZF – Zufall** (KMK L5)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.DZ.ZF.BEGRIFFE | Ich kann bei Zufallsversuchen Ergebnisse, Ergebnismenge und Ereignisse angeben. | ZF.HAEUFIGKEIT | OS LB 2, GY Kl. 8 LB 2 – vorgez. | Gen |
| M.DZ.ZF.WAHRSCHEINLICHKEIT | Ich kann Wahrscheinlichkeiten bei gleich wahrscheinlichen Ergebnissen angeben und aus relativen Häufigkeiten schätzen. | ZF.BEGRIFFE, BR.ANTEILE | OS LB 2, GY Kl. 8 LB 2 – vorgez. | Gen |

**Feld KR – Kreis und Begründen** (KMK L4, K1)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.RF.KR.LAGE | Ich kann Sekante, Tangente und Passante unterscheiden und Inkreis und Umkreis eines Dreiecks beschreiben. | DV.BESONDERE-LINIEN, GF.LAGE | OS Kl. 8 LB 4 – vorgez., GY LB 1 | Mix · Erkl |
| M.RF.KR.WINKELSAETZE | Ich kann mit dem Satz des Thales, dem Peripheriewinkelsatz und dem Zentri-Peripheriewinkelsatz Winkel am Kreis berechnen. | KR.LAGE, DV.WINKELSAETZE | OS Kl. 8 LB 4 – vorgez., GY LB 1 | Gen |
| M.RF.KR.BEGRUENDEN | Ich kann Satz und Definition unterscheiden, Wenn-dann-Aussagen umkehren und Aussagen durch ein Gegenbeispiel widerlegen. | KR.WINKELSAETZE | OS –, GY LB 1 | Mix |

**Feld DV – Vierecke konstruieren** (KMK L4)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.RF.DV.VIERECKE-KONSTRUIEREN | Ich kann Parallelogramme, Drachenvierecke und Trapeze aus gegebenen Stücken konstruieren. | DV.KONSTRUIEREN, DV.VIERECKE | OS LB 4, GY LB 1 | Mix · Erkl |

**Feld FL – Flächeninhalt** (KMK L2)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.GM.FL.VIELECKE | Ich kann Flächeninhalt und Umfang von Vielecken durch Zerlegen in Dreiecke und Vierecke berechnen. | FL.VIERECKE, FL.ZUSAMMENGESETZT | OS LB 4, GY LB 3 | Gen |

**Feld KP – Körper** (KMK L4, L2)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.RF.KP.ZWEITAFEL | Ich kann Körper im senkrechten Zweitafelbild lesen und Vorderansicht, Draufsicht und Seitenansicht dem Körper zuordnen. | KP.PRISMEN | OS LB 4, GY LB 3 | Mix · Erkl |
| M.GM.KP.MASSE | Ich kann die Masse eines Körpers aus Volumen und Dichte berechnen. | KP.PRISMA, KP.EINHEITEN | OS LB 4, GY LB 3 | Gen |
| M.GM.KP.VERPACKUNG | Ich kann Oberfläche und Volumen verschiedener Verpackungen vergleichen und den Materialverbrauch beurteilen. | KP.PRISMA | OS LB 4, GY – | Gen |
| M.RF.KP.PYRAMIDEN | Ich kann Pyramiden und Pyramidenstümpfe an ihren Eigenschaften erkennen und Netze, Schrägbilder und Ansichten zuordnen. | KP.PRISMEN, KP.ZWEITAFEL | OS Kl. 9 LB 2 – vorgez., GY LB 3 | Mix · Erkl |
| M.GM.KP.PYRAMIDE | Ich kann Volumen, Oberfläche und Masse von Pyramiden und zusammengesetzten Körpern berechnen. | KP.PYRAMIDEN, KP.PRISMA, KP.MASSE | OS Kl. 9 LB 2 – vorgez., GY LB 3 | Gen |

**Summe Klasse 7:** 29 Kompetenzen × 2 Niveaus (G, M), davon 23 überwiegend generatorbasiert, 6 gemischt; bei 4 wird Zeichnen erklärt (L-10): Kreis und Gerade (In- und Umkreis), Vierecke konstruieren, Zweitafelbild, Pyramiden darstellen. Neue Felder im ID-Schema: RZ (rationale-zahlen), GL (gleichungen), PZ (prozent-und-zins), KR (kreis). Datenquelle: `content/mathematik/…/kompetenz.yaml` mit `klassenstufe_typisch: [7]`.

*Stand 28.10.2026:* Kompetenzen und Graph stehen; Vorlagen folgen Feld für Feld. **RZ begonnen:** Begriff (Zahlengerade, Gegenzahl und Betrag, Alltag), Ordnen (Vergleichszeichen, der Größe nach) und Zahlbereiche (zuordnen, Aussagen) mit 7 Vorlagen (`src/generators/mathematik/rationale-zahlen/begriff.ts`). **RZ vollständig als Entwurf:** dazu Addieren und Subtrahieren (Term, Sachaufgabe), Multiplizieren und Dividieren (Term, Vorzeichenregel), Potenzen und Quadratwurzeln, Vorrangregeln und Rechenvorteile – 15 Vorlagen für 7 Kompetenzen (`rechnen.ts`). **GF.QUADRANTEN:** Ablesen, Quadrant bestimmen, an Achsen und Ursprung spiegeln (3 Vorlagen, `src/generators/mathematik/geometrie/quadranten.ts`). **Feld GL vollständig als Entwurf:** Termwerte und Probe, Gleichungen lösen und Umformungsschritte erkennen, Formeln umstellen und anwenden, Gleichungen zu Zahlenrätseln wählen und lösen – 8 Vorlagen für 4 Kompetenzen (`src/generators/mathematik/gleichungen/linear.ts`); neue Fachbegriffe Variable, Term, Formel, umformen. **Feld PZ vollständig als Entwurf:** Grundwert, Prozentwert und Prozentsatz erkennen, bequeme Prozentsätze, Grundaufgaben (berechnen und passende Rechnung wählen), neuer und alter Preis, „um“ und „auf“, Jahres- und Tageszinsen, Zinssatz und Kapital, Zinseszins über zwei Jahre – 8 Vorlagen für 4 Kompetenzen (`src/generators/mathematik/prozent/prozent.ts`). **DA und ZF (Klasse 7) als Entwurf:** Säulen- und Liniendiagramme ablesen, passendes Diagramm wählen, abgeschnittene Achse erkennen; Ergebnisse eines Ereignisses zählen und als Menge angeben; Wahrscheinlichkeit als Bruch, Chancen vergleichen – 6 Vorlagen für 3 Kompetenzen (`src/generators/mathematik/daten/diagramme.ts`, `wahrscheinlichkeit.ts`). **Feld KR vollständig als Entwurf:** Sekante, Tangente, Passante (am Bild, auf M aus Abstand und Radius), Mittelpunkt von Inkreis und Umkreis, Winkel am Kreis (Thales auf G; Zentri-Peripheriewinkel und Sehnenviereck auf M), passenden Satz wählen, Voraussetzung und Behauptung, Umkehrung, Gegenbeispiel – 6 Vorlagen für 3 Kompetenzen (`src/generators/mathematik/geometrie/kreis.ts`), dazu die Anleitung „Den Umkreis eines Dreiecks konstruieren“ (L-10). **DV.VIERECKE-KONSTRUIEREN:** nächster Konstruktionsschritt (Parallelogramm, Drachenviereck, auf M auch Trapez) und „eindeutig festgelegt?“ – 2 Vorlagen (`src/generators/mathematik/dreiecke/vierecke-konstruieren.ts`) und die Anleitung „Ein Parallelogramm konstruieren“. **FL.VIELECKE:** Flächeninhalt durch Zerlegen und durch Ergänzen zum Rechteck – 2 Vorlagen (`src/generators/mathematik/flaechen/vielecke-zerlegen.ts`). **Feld KP (Klasse 7) vollständig als Entwurf:** Ansicht zum Schrägbild wählen und Körper zum Zweitafelbild bestimmen (Schrägbild und Ansichten werden aus einer Beschreibung des Körpers berechnet, `koerper/ansichten.ts`), Ecken, Kanten und Flächen von Pyramiden und Pyramidenstümpfen, Pyramide, Prisma oder Stumpf erkennen, Volumen und Oberfläche von Pyramiden (auf M auch zusammengesetzt), Masse und Dichte, Verpackungen vergleichen und Materialbedarf – 10 Vorlagen für 5 Kompetenzen (`koerper/pyramiden.ts`), dazu die Anleitungen „Das Zweitafelbild eines Quaders zeichnen“ und „Das Schrägbild einer Pyramide zeichnen“. **Damit haben alle 29 Kompetenzen der Klasse 7 Vorlagen (60, Entwurf) und alle 4 mit Zeichnen eine Anleitung (L-10).** Negative Antworten gibt man mit der Minustaste der eigenen Tastatur ein (INHALTSFORMAT §5.1, §5.2; bis 31.10.2026 mit einem Knopf „±“). Die Klassenwahl hat „Klasse 7“.

## 8d. Klasse 8 (Sachsen) – Kompetenzen für den vierten Bauabschnitt

Grundlage wie §8 (K-16): Lehrplan Oberschule Mathematik 2019 (Haupt- und Realschulbildungsgang), Lehrplan Gymnasium Mathematik (Kl. 5–8 seit 1. August 2021). Ausgewertet am 28.10.2026 aus denselben PDF-Dateien. Nach K-17 entstehen Kompetenzen und Vorlagen als **Entwurf**.

### 8d.1 Auswahl

| | OS Klasse 8 – RS | OS Klasse 8 – HS | GY Klasse 8 |
|---|---|---|---|
| LB 1 | Lineare Gleichungen (16 Ustd.) | Wirtschaftliches Rechnen (24 Ustd.) | Arbeiten mit Termen und Gleichungen (24 Ustd.) |
| LB 2 | Lineare Funktionen und Gleichungssysteme (26 Ustd.) | Formeln und Gleichungen (16 Ustd.) | Zufallsversuche (24 Ustd.) |
| LB 3 | Kreis und Kreiszylinder (18 Ustd.) | Vom Vieleck zum Kreis (16 Ustd.) | Funktionen und lineare Gleichungssysteme (32 Ustd.) |
| LB 4 | Ähnlichkeit (14 Ustd.) | Kreiszylinder und Hohlzylinder (16 Ustd.) | Ähnlichkeit (20 Ustd.) |
| LB 5 | Zufällige Ereignisse (14 Ustd.) | Mathematik im Alltag (28 Ustd.) | Vernetzung: Heuristische Strategien (4 Ustd.) |
| LB 6 | Mathematik im Alltag (12 Ustd.) | – | – |

**Wahlbereiche** (RS: Das Fahrrad, Modellbau, Polyeder; HS: Das Fahrrad, Achtung Schuldenfalle, Modellbau; GY: Programmierung mathematischer Algorithmen, Lineare Optimierung, Simulation mit Zufallszahlen) zählen nicht (L-11).

**Regel wie bei Klasse 5 bis 7 (L-6):** Was eine Schulart in Klasse 8 hat und eine andere erst später, steht hier und ist für die andere „vorgezogen“:
- **Kreis und Kreiszylinder** (OS Kl. 8; GY Kl. 9 LB 2),
- **Ungleichungen** (GY Kl. 8 „Einblick“; RS Kl. 10 LB 2).
Schon früher stehen Zinsrechnung, Wahrscheinlichkeit und Satz des Thales (§8c). Die **binomischen Formeln** und die **Eigenschaften von Funktionen** (Monotonie, Extrema, Symmetrie) stehen nur im GY-Lehrplan; **regelmäßige Vielecke** und **Rabatt, Skonto, Mehrwertsteuer** nur im HS-Lehrplan (für das GY ohne Klassenstufe, bei der RS im Alltag LB 6). Lineare Funktionen hat der HS erst in Kl. 9 – sie stehen hier für RS und GY.

**Nicht in der App abbildbar:** Arbeit mit CAS, DGS und Tabellenkalkulation, lineare Regression mit CAS, Simulation mit Zufallszahlen, Realexperimente, Kreisornamente gestalten, Präsentationen, Haushaltsbuch führen. Die heuristischen Strategien (GY LB 5) fließen in die Sachaufgaben ein.

### 8d.2 Kompetenzen

Legende wie §8.2. *Sachsen:* LB der Klasse 8 (bei der OS meist der RS), sonst angegeben.

**Feld TU – Terme umformen** (KMK L3, L1)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.SF.TU.ZUSAMMENFASSEN | Ich kann gleichartige Glieder zusammenfassen und Summen und Differenzen in Klammern auflösen. | GL.TERMWERT, RZ.RECHENGESETZE | OS LB 1, GY LB 1 | Gen |
| M.SF.TU.AUSMULTIPLIZIEREN | Ich kann ein Produkt aus einer Zahl und einer Summe ausmultiplizieren und einen gemeinsamen Faktor ausklammern. | TU.ZUSAMMENFASSEN | OS LB 1, GY LB 1 | Gen |
| M.SF.TU.BINOMISCH | Ich kann die binomischen Formeln anwenden, um Terme auszumultiplizieren. | TU.AUSMULTIPLIZIEREN, RZ.POTENZEN | OS –, GY LB 1 | Gen |
| M.SF.TU.GLEICHUNGEN | Ich kann lineare Gleichungen lösen, bei denen ich zuerst Klammern auflösen und zusammenfassen muss. | TU.AUSMULTIPLIZIEREN, GL.LINEAR | OS LB 1, GY LB 1 | Gen |
| M.SF.TU.UNGLEICHUNGEN | Ich kann einfache lineare Ungleichungen lösen und die Lösungsmenge angeben. | TU.GLEICHUNGEN | OS Kl. 10 LB 2 – vorgez., GY LB 1 | Gen |

**Feld FK – Funktionen** (KMK L3)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.SF.FK.BEGRIFF | Ich kann entscheiden, ob eine Zuordnung eine Funktion ist, und Funktionswerte, Definitions- und Wertebereich angeben. | ZU.DARSTELLEN, GL.TERMWERT | OS LB 2, GY LB 3 | Gen |
| M.SF.FK.EIGENSCHAFTEN | Ich kann am Graphen ablesen, wo eine Funktion steigt oder fällt, Nullstellen, größte und kleinste Werte und Symmetrie erkennen. | FK.BEGRIFF, GF.QUADRANTEN | OS –, GY LB 3 | Gen |
| M.SF.FK.LINEAR-GRAPH | Ich kann Graphen linearer Funktionen y = m·x + n zeichnen und lesen und die Bedeutung von m und n erklären. | FK.BEGRIFF, ZU.GRAPH | OS LB 2, GY LB 3 | Gen |
| M.SF.FK.LINEAR-GLEICHUNG | Ich kann die Gleichung einer linearen Funktion aus zwei Punkten oder aus Anstieg und einem Punkt bestimmen. | FK.LINEAR-GRAPH, GL.LINEAR | OS LB 2, GY LB 3 | Gen |
| M.SF.FK.NULLSTELLE | Ich kann Nullstellen linearer Funktionen zeichnerisch und rechnerisch bestimmen. | FK.LINEAR-GRAPH, GL.LINEAR | OS LB 2, GY LB 3 | Gen |
| M.SF.FK.SACH | Ich kann Sachsituationen wie Tarife mit linearen Funktionen beschreiben und vergleichen. | FK.LINEAR-GLEICHUNG | OS LB 2, GY LB 3 | Gen |

**Feld GS – Lineare Gleichungssysteme** (KMK L3)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.SF.GS.GRAFISCH | Ich kann ein lineares Gleichungssystem mit zwei Gleichungen grafisch lösen und die drei Lösbarkeitsfälle unterscheiden. | FK.LINEAR-GRAPH | OS LB 2, GY LB 3 | Gen |
| M.SF.GS.RECHNERISCH | Ich kann lineare Gleichungssysteme mit zwei Gleichungen und zwei Variablen rechnerisch lösen. | GS.GRAFISCH, TU.GLEICHUNGEN | OS LB 2, GY LB 3 | Gen |
| M.SF.GS.SACH | Ich kann zu Sachaufgaben ein Gleichungssystem aufstellen und lösen. | GS.RECHNERISCH, GL.AUFSTELLEN | OS LB 2, GY LB 3 | Gen |

**Feld KR – Kreis** (KMK L2)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.GM.KR.UMFANG-FLAECHE | Ich kann Umfang und Flächeninhalt von Kreisen berechnen. | KR.LAGE, FL.VIELECKE | OS LB 3, GY Kl. 9 LB 2 – vorgez. | Gen |
| M.GM.KR.KREISRING | Ich kann den Flächeninhalt von Kreisringen, Halb- und Viertelkreisen und daraus zusammengesetzten Figuren berechnen. | KR.UMFANG-FLAECHE | OS LB 3, GY Kl. 9 LB 2 – vorgez. | Gen |

**Feld DV – Regelmäßige Vielecke** (KMK L4)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.RF.DV.REGELMAESSIG | Ich kann Innenwinkel und Symmetrien regelmäßiger Vielecke bestimmen und regelmäßige Vielecke mit dem Umkreis konstruieren. | DV.WINKELSAETZE, SY.SYMMETRIE, KR.LAGE | OS LB 3, GY – | Mix · Erkl |

**Feld KP – Kreiszylinder** (KMK L4, L2)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.RF.KP.ZYLINDER | Ich kann Netze, Ansichten und Schrägbilder von Kreiszylindern und Hohlzylindern erkennen und skizzieren. | KP.ZWEITAFEL, KR.LAGE | OS LB 3, GY Kl. 9 LB 2 – vorgez. | Mix · Erkl |
| M.GM.KP.ZYLINDER | Ich kann Mantel, Oberfläche, Volumen und Masse von Kreiszylindern und Hohlzylindern berechnen. | KP.ZYLINDER, KR.UMFANG-FLAECHE, KP.MASSE | OS LB 3, GY Kl. 9 LB 2 – vorgez. | Gen |

**Feld AE – Ähnlichkeit** (KMK L4, L2)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.RF.AE.STRECKUNG | Ich kann zentrische Streckungen mit Streckzentrum und Streckfaktor beschreiben und Bildpunkte und Bildstrecken bestimmen. | GF.QUADRANTEN, BR.ANTEILE | OS LB 4, GY LB 4 | Mix · Erkl |
| M.RF.AE.AEHNLICH | Ich kann entscheiden, ob zwei Figuren ähnlich sind, und den Hauptähnlichkeitssatz für Dreiecke anwenden. | AE.STRECKUNG, DV.WINKELSAETZE | OS LB 4, GY LB 4 | Gen |
| M.RF.AE.BERECHNEN | Ich kann fehlende Längen in ähnlichen Figuren berechnen und wissen, wie sich Flächen und Volumen beim Strecken ändern. | AE.AEHNLICH, ZU.DREISATZ | OS LB 4, GY LB 4 | Gen |

**Feld ZF – Zufall** (KMK L5)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.DZ.ZF.EREIGNISSE | Ich kann Ereignisse mit „und“, „oder“ und „nicht“ verknüpfen und als Mengen angeben. | ZF.BEGRIFFE, RZ.ZAHLBEREICHE | OS LB 5, GY LB 2 | Gen |
| M.DZ.ZF.BAUMDIAGRAMM | Ich kann mehrstufige Zufallsversuche mit Baumdiagrammen darstellen und Wahrscheinlichkeiten mit den Pfadregeln berechnen. | ZF.WAHRSCHEINLICHKEIT, BR.MULT | OS LB 5, GY LB 2 | Gen |
| M.DZ.ZF.ZAEHLEN | Ich kann mit der Produktregel zählen, wie viele Möglichkeiten es gibt. | ZF.BEGRIFFE, NZ.MULT | OS LB 5, GY LB 2 | Gen |

**Feld PZ – Mathematik im Alltag** (KMK L1)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. |
|---|---|---|---|---|
| M.ZO.PZ.WIRTSCHAFT | Ich kann Rabatt, Skonto und Mehrwertsteuer berechnen und Rechnungen prüfen. | PZ.VERAENDERUNG | OS LB 1, GY – | Gen |
| M.ZO.PZ.ANGEBOTE | Ich kann Angebote, Tarife und Kosten im Alltag vergleichen und das günstigste wählen. | PZ.WIRTSCHAFT, BR.SACH | OS LB 6, GY – | Gen |

**Summe Klasse 8:** 27 Kompetenzen × 2 Niveaus (G, M), davon 24 überwiegend generatorbasiert, 3 gemischt; bei 3 wird Zeichnen erklärt (L-10): regelmäßige Vielecke, Kreiszylinder darstellen, zentrische Streckung. Neue Felder im ID-Schema: TU (terme), FK (funktionen), GS (gleichungssysteme), AE (aehnlichkeit); KR (kreis) jetzt auch unter Größen und Messen. Datenquelle: `content/mathematik/…/kompetenz.yaml` mit `klassenstufe_typisch: [8]`.

*Stand 28.10.2026:* Kompetenzen und Graph stehen; Vorlagen folgen Feld für Feld. **Feld TU vollständig als Entwurf:** Zusammenfassen (Auswahl, Lücke), Ausmultiplizieren und Ausklammern (Lücke, Auswahl), binomische Formeln (Lücke, Auswahl), Gleichungen mit Klammern (lösen, Klammern auflösen), Ungleichungen (Lösungsmenge, größte/kleinste ganze Zahl) – 10 Vorlagen (`src/generators/mathematik/terme/umformen.ts`). Ganze Terme werden als Auswahl oder als Lücke mit einer Zahl abgefragt. Die Klassenwahl hat „Klasse 8“. **Feld FK vollständig als Entwurf:** Funktion ja/nein und Funktionswerte (auf M auch x gesucht), Nullstellen zählen und Hoch-/Tiefpunkt ablesen, Steigen und Fallen, y-Achsenabschnitt und Anstieg (mit Steigungsdreieck) ablesen, Gleichung zur Geraden wählen, Punktprobe, n aus einem Punkt und m aus zwei Punkten, Nullstellen berechnen und ablesen, Tarife (Kosten, Vergleich, Gleichung) – 12 Vorlagen für 6 Kompetenzen (`src/generators/mathematik/funktionen/funktionen.ts`); neue Fachbegriffe Funktion, Funktionswert, Nullstelle, lineare Funktion, Anstieg, y-Achsenabschnitt, Steigungsdreieck, Hochpunkt, Grundgebühr. **Feld GS vollständig als Entwurf:** Lösung am Schnittpunkt ablesen, Zahl der Lösungen (auf G nach y aufgelöst, auf M allgemeine Form), Gleichungssysteme lösen (G Einsetzen und Gleichsetzen, M Additionsverfahren) und den nächsten Schritt wählen, Gleichungssystem zur Sachaufgabe wählen und lösen – 6 Vorlagen für 3 Kompetenzen (`src/generators/mathematik/gleichungssysteme/lgs.ts`); neue Fachbegriffe Gleichungssystem, Einsetzungsverfahren, Additionsverfahren. **KR (Klasse 8) vollständig als Entwurf:** Umfang und Flächeninhalt (auf M rückwärts: Radius oder Durchmesser), rollendes Rad, Kreisring (auf M Unterlegscheibe mit Durchmessern), Halb- und Viertelkreis, Rechteck mit Halbkreisen – 4 Vorlagen (`src/generators/mathematik/kreis/berechnen.ts`). **Zylinder vollständig als Entwurf:** Netz erkennen, Länge des Mantelrechtecks (auf M Radius aus der Länge), Volumen und Mantel (auf M Oberfläche, Hohlzylinder, Höhe aus dem Volumen), Inhalt von Dosen und Masse von Stäben – 4 Vorlagen (`src/generators/mathematik/koerper/zylinder.ts`) und die Anleitung „Das Schrägbild eines Zylinders zeichnen“ (L-10). Gerechnet wird mit π ≈ 3,14, so sind alle Lösungen genau; die Aufgaben sagen das. Neue Fachbegriffe Durchmesser, π, Kreisring, Zylinder, Mantel. **Feld AE vollständig als Entwurf:** Bildstrecke und Streckfaktor, Bildpunkt im Koordinatensystem (auf M mit Streckzentrum außerhalb des Ursprungs), Ähnlichkeit prüfen (G Rechtecke über Seitenverhältnisse, M Dreiecke über Winkel) und ähnliche Figur wählen, fehlende Seiten, Schattenaufgaben, Flächen (k²) und Volumen (k³) – 6 Vorlagen für 3 Kompetenzen (`src/generators/mathematik/aehnlichkeit/aehnlichkeit.ts`) und die Anleitung „Ein Dreieck zentrisch strecken“ (L-10); neue Fachbegriffe zentrische Streckung, Streckfaktor, Streckzentrum, ähnlich, Hauptähnlichkeitssatz. **ZF (Klasse 8) als Entwurf:** Gegenereignis, „und“, „oder“, „aber nicht“ als Menge und als Anzahl, Pfade in der Urne (G mit Zurücklegen, M ohne und mit Summenregel), Baumdiagramm lesen, Möglichkeiten zählen und passende Rechnung wählen (G Produktregel, M auch n! und mit/ohne Wiederholung) – 6 Vorlagen (`src/generators/mathematik/daten/zufall8.ts`). **PZ (Klasse 8) als Entwurf:** Rabatt, Skonto, Mehrwertsteuer (M nacheinander und Netto aus Brutto), Rechnung prüfen, Angebote vergleichen (G Packungen, M Bar gegen Raten) und Kosten berechnen – 4 Vorlagen (`src/generators/mathematik/prozent/wirtschaft.ts`). **DV.REGELMAESSIG:** Symmetrieachsen und Mittelpunktswinkel, Innenwinkelsumme und Innenwinkel – 2 Vorlagen (`src/generators/mathematik/dreiecke/regelmaessig.ts`) und die Anleitung „Ein regelmäßiges Sechseck konstruieren“. **Damit haben alle 27 Kompetenzen der Klasse 8 Vorlagen (54, Entwurf) und alle 3 mit Zeichnen eine Anleitung (L-10).**

## 8e. Klasse 9 (Sachsen) – Kompetenzen für den fünften Bauabschnitt

Grundlage wie §8 (K-16): Lehrplan Oberschule Mathematik 2019 (Haupt- und Realschulbildungsgang, Kl. 9), Lehrplan Gymnasium Mathematik (Kl. 9 in Kraft seit 1. August 2022). Ausgewertet am 02.11.2026 aus den PDF-Dateien, die der PV bereitgestellt hat (`docs/quellen/README.md`). Nach K-30 entstehen alle Kompetenzen gleich im neuen Format (K-28) mit den Niveaus **G, M und E** und bleiben **Entwurf**, bis die gesammelte Prüfung folgt (`docs/session/KLASSE-9-12.md`).

### 8e.1 Auswahl

| | OS Klasse 9 – RS | OS Klasse 9 – HS | GY Klasse 9 |
|---|---|---|---|
| LB 1 | Rechtwinklige Dreiecke (28 Ustd.) | Rechtwinklige Dreiecke (28 Ustd.) | Funktionen und Potenzen (48 Ustd.) |
| LB 2 | Pyramide, Kreiskegel, Kugel (28 Ustd.) | Körperdarstellung und Körperberechnung (28 Ustd.) | Kreise, Kreiszylinder und Kugeln (8 Ustd.) |
| LB 3 | Quadratische Funktionen und quadratische Gleichungen (28 Ustd.) | Funktionale Zusammenhänge (24 Ustd.) | Rechtwinklige Dreiecke (32 Ustd.) |
| LB 4 | Beschreibende Statistik (16 Ustd.) | Mathematik im Alltag (20 Ustd.) | Auswerten von Daten (12 Ustd.) |
| LB 5 | – | – | Vernetzung: Mathematik und moderne Rechentechnik (4 Ustd.) |

**Wahlbereiche** (RS: Goldener Schnitt, Wahre Größe und Gestalt, Sportfest; HS: Statistische Erhebungen, Optimierung, Technisches Zeichnen; GY: Der goldene Schnitt, Rund um den Pythagoras, Baupläne und Bauzeichnungen) zählen nicht (L-11).

**Regel wie bei Klasse 5 bis 8 (L-6):** Was eine Schulart in Klasse 9 hat und eine andere erst später, steht hier und ist für die andere „vorgezogen“:
- **Potenzfunktionen** (GY Kl. 9 LB 1; RS Kl. 10 LB 2, dort nur y = a·xⁿ für n = −2, −1, 1, 2, 3),
- **Streuungsmaße Varianz und Standardabweichung** (GY Kl. 9 LB 4; an der OS nur die Spannweite).
Schon früher stehen der Kreis und der Kreiszylinder (§8d, für das GY vorgezogen) und die Pyramide (§8c, für die OS vorgezogen). Der HS hat die **linearen Funktionen** erst in Kl. 9 LB 3; sie stehen schon in §8d (FK, GS) und bekommen in Phase B die Zuordnung „OS HS Kl. 9 LB 3“.

**Wichtige Unterschiede in Klasse 9:**
- **Trigonometrie:** HS nur den Sinus (Kosinus und Tangens als Differenzierungshinweis), RS und GY Sinus, Kosinus und Tangens.
- **Höhensatz und Kathetensatz**, der **indirekte Beweis** und „genau dann, wenn“ stehen nur im GY-Lehrplan; der Satz des Pythagoras wird im GY bewiesen, an der OS anschaulich gewonnen.
- **Quadratische Gleichungen:** Der HS hat sie nur als Differenzierungshinweis; die RS bekommt eine Lösungsformel „mitgeteilt“; das GY interpretiert die Lösungsformel mit vollständiger Fallunterscheidung und löst ohne Hilfsmittel mit überschaubaren Zahlen.
- **Potenzen und Wurzeln:** Potenzgesetze mit rationalen Exponenten, Wurzelgleichungen und reelle Zahlen nur im GY; an der RS die Kubikwurzel beim Kugelvolumen.
- **Kugel:** RS und GY; im HS nur als Differenzierungshinweis.

**Nicht in der App abbildbar:** Arbeit mit CAS, DGS und Tabellenkalkulation (auch das „experimentelle Ermitteln“ von Eigenschaften), Projekte („Landvermessung“, „Statistische Manipulationen“, eigene statistische Erhebung), Dokumentieren und Präsentieren, LB 5 des GY (Rechentechnik als Hilfsmittel). Die Würdigungen (Archimedes, Pythagoras) können in der Erstvermittlung vorkommen, werden aber nicht geprüft. Der Beweis des Satzes des Pythagoras wird erklärt; geprüft wird nur das Ordnen von Beweisschritten (Niveau E, §5.3).

### 8e.2 Kompetenzen

Legende wie §8.2. *Sachsen:* LB der Klasse 9 (bei der OS meist der RS), sonst angegeben. Neu ab Klasse 9: Spalte **E** – was Niveau E über M hinaus verlangt (K-28, §5.3: geschlossene Formate mit AB-II/III-Charakter).

**Feld PW – Potenzen und Wurzeln** (KMK L1)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. | E |
|---|---|---|---|---|---|
| M.ZO.PW.WURZEL | Ich kann Quadrat-, Kubik- und n-te Wurzeln bestimmen und abschätzen. | RZ.POTENZEN, KR.BEGRUENDEN (E) | OS LB 2 (Kubikwurzel), GY LB 1 | Gen | Warum √(a²) = \|a\| und nicht a ist |
| M.ZO.PW.REELL | Ich kann rationale und irrationale Zahlen unterscheiden und die Zahlbereiche N, Z, Q und R ordnen. | PW.WURZEL, RZ.ZAHLBEREICHE, BR.PERIODISCH, KR.BEGRUENDEN (E) | OS –, GY LB 1 | Gen | „Stimmt das immer?“ zu Summen und Produkten irrationaler Zahlen |
| M.ZO.PW.GESETZE | Ich kann Potenzen mit ganzzahligen Exponenten mit den Potenzgesetzen vereinfachen. | PW.WURZEL, NZ.POTENZEN | OS –, GY LB 1 | Gen | Fehler finden, z. B. a²·a³ = a⁶ |
| M.ZO.PW.RATIONAL | Ich kann Potenzen mit rationalen Exponenten als Wurzeln schreiben und damit rechnen. | PW.GESETZE | OS –, GY LB 1 | Gen | Permanenzprinzip: warum a⁰ = 1 und a⁻ⁿ = 1/aⁿ |
| M.SF.GL.WURZEL | Ich kann einfache Wurzelgleichungen lösen und die Probe machen. | PW.WURZEL, TU.GLEICHUNGEN | OS –, GY LB 1 | Gen | Scheinlösung durch Quadrieren erkennen |

**Feld PF – Potenzfunktionen** (KMK L3)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. | E |
|---|---|---|---|---|---|
| M.SF.PF.POTENZFUNKTION | Ich kann Graphen und Eigenschaften von Potenzfunktionen y = xⁿ mit ganzzahligem n angeben: Definitions- und Wertebereich, Symmetrie, Polstellen, Asymptoten. | FK.EIGENSCHAFTEN, PW.GESETZE | OS Kl. 10 LB 2 – vorgez., GY LB 1 | Gen | Graph und Term zuordnen und begründen |
| M.SF.PF.WURZELFUNKTION | Ich kann Graphen und Eigenschaften von Potenzfunktionen mit rationalen Exponenten wie y = √x angeben. | PF.POTENZFUNKTION, PW.RATIONAL | OS –, GY LB 1 | Gen | Definitionsbereich begründen |
| M.SF.PF.PARAMETER | Ich kann beschreiben, wie sich der Graph von y = c·f(x), y = f(x) + c und y = f(x + c) aus dem Graphen von f ergibt. | PF.POTENZFUNKTION | OS –, GY LB 1 | Gen | Verschiebung und Streckung in falscher Reihenfolge erkennen |

**Feld QF – Quadratische Funktionen und Gleichungen** (KMK L3)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. | E |
|---|---|---|---|---|---|
| M.SF.QF.GRAPH | Ich kann quadratische Funktionen mit Wertetabelle und Graph darstellen und Definitions- und Wertebereich, Monotonie und Nullstellen ablesen. | FK.EIGENSCHAFTEN, RZ.POTENZEN | OS LB 3 (HS LB 3 Einblick), GY LB 1 | Gen | Parabel und Term ohne Rechnen zuordnen |
| M.SF.QF.SCHEITEL | Ich kann den Scheitelpunkt einer Parabel aus y = (x + d)² + e, y = x² + p·x + q und y = a·x² + c bestimmen und als Minimum oder Maximum deuten. | QF.GRAPH, TU.BINOMISCH | OS LB 3, GY LB 1 | Gen | Quadratische Ergänzung: Fehler im Schritt finden |
| M.SF.QF.INHALTLICH | Ich kann einfache quadratische Gleichungen ohne Formel lösen: x² = a, Produktform (x − 3)·(x + 2) = 0 und durch Ausklammern. | QF.GRAPH, TU.AUSMULTIPLIZIEREN | OS LB 3, GY LB 1 | Gen | Warum aus x² = 9 zwei Lösungen folgen |
| M.SF.QF.FORMEL | Ich kann quadratische Gleichungen mit der Lösungsformel lösen und an der Diskriminante sehen, ob es keine, genau eine oder zwei Lösungen gibt. | QF.INHALTLICH, QF.SCHEITEL | OS LB 3, GY LB 1 | Gen | „ein“ und „genau ein“ unterscheiden; vollständige Fallunterscheidung |
| M.SF.QF.SCHNITTPUNKTE | Ich kann Nullstellen und Schnittpunkte von Parabeln und Geraden zeichnerisch und rechnerisch bestimmen. | QF.FORMEL, FK.LINEAR-GLEICHUNG | OS LB 3, GY LB 1 | Gen | Zahl der Schnittpunkte begründen |
| M.SF.QF.SACH | Ich kann Sachaufgaben mit quadratischen Funktionen lösen, auch größte und kleinste Werte (Wurf, Brückenbogen, größte Fläche). | QF.SCHEITEL, QF.FORMEL | OS LB 3, GY LB 1 | Gen | Lösung im Sachzusammenhang prüfen (negative Länge verwerfen) |

**Feld PY – Satzgruppe des Pythagoras** (KMK L4, L2)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. | E |
|---|---|---|---|---|---|
| M.RF.PY.PYTHAGORAS | Ich kann mit dem Satz des Pythagoras fehlende Seiten im rechtwinkligen Dreieck berechnen. | DV.DREIECKE, PW.WURZEL | OS LB 1 (HS und RS), GY LB 3 | Gen | Hypotenuse falsch zugeordnet: Fehler finden |
| M.RF.PY.UMKEHRUNG | Ich kann mit der Umkehrung des Satzes des Pythagoras prüfen, ob ein Dreieck rechtwinklig ist, und Satz und Umkehrung unterscheiden. | PY.PYTHAGORAS, KR.BEGRUENDEN | OS LB 1, GY LB 3 | Gen | Indirekter Beweis und „genau dann, wenn“ (GY) |
| M.RF.PY.HOEHENSATZ | Ich kann Höhensatz und Kathetensatz anwenden. | PY.PYTHAGORAS | OS –, GY LB 3 | Gen | Satzgruppe: welcher Satz passt zur gegebenen Größe |
| M.RF.PY.SACH | Ich kann den Satz des Pythagoras in Figuren, Körpern und Sachaufgaben anwenden (Diagonalen, Leiter, Dachstuhl, Raumdiagonale). | PY.PYTHAGORAS, FL.VIELECKE | OS LB 1, GY LB 3 | Gen | Rechtwinkliges Teildreieck im Körper finden |

**Feld TR – Trigonometrie im rechtwinkligen Dreieck** (KMK L4, L2)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. | E |
|---|---|---|---|---|---|
| M.RF.TR.BEGRIFFE | Ich kann Sinus, Kosinus und Tangens als Seitenverhältnisse im rechtwinkligen Dreieck angeben. | PY.PYTHAGORAS, AE.AEHNLICH | OS LB 1 (HS nur Sinus), GY LB 3 | Gen | Warum das Verhältnis nur vom Winkel abhängt (Ähnlichkeit) |
| M.RF.TR.BERECHNEN | Ich kann mit Sinus, Kosinus und Tangens Seitenlängen und Winkel im rechtwinkligen Dreieck berechnen. | TR.BEGRIFFE | OS LB 1, GY LB 3 | Gen | Gegen- und Ankathete vom anderen Winkel aus |
| M.RF.TR.SACH | Ich kann Sachaufgaben mit Winkeln und Längen lösen: Steigung, Höhe, Vermessung, gleichschenklige Dreiecke und regelmäßige Vielecke. | TR.BERECHNEN, PY.SACH, DV.REGELMAESSIG | OS LB 1, GY LB 3 | Gen | π über regelmäßige n-Ecke annähern (GY) |

**Feld KP – Pyramide, Kegel und Kugel** (KMK L4, L2)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. | E |
|---|---|---|---|---|---|
| M.RF.KP.KEGEL | Ich kann Netze, Schrägbilder und Ansichten von Kreiskegeln erkennen und skizzieren. | KP.ZYLINDER, KP.PYRAMIDEN | OS LB 2, GY – | Mix · Erkl | Zweitafelbild und Körper zuordnen |
| M.GM.KP.PYRAMIDE-HOEHEN | Ich kann Körperhöhe, Seitenhöhe und Kantenlänge einer Pyramide mit dem Satz des Pythagoras berechnen. | KP.PYRAMIDE, PY.SACH | OS LB 2, GY LB 3 | Gen | Welche Strecke ist die Hypotenuse? |
| M.GM.KP.KEGEL | Ich kann Mantellinie, Mantel, Oberfläche, Volumen und Masse von Kreiskegeln berechnen. | KP.ZYLINDER, PY.PYTHAGORAS | OS LB 2, GY LB 3 | Gen | Volumen von Kegel und Zylinder vergleichen (Faktor 1/3) |
| M.GM.KP.KUGEL | Ich kann Oberfläche, Volumen und Masse von Kugeln berechnen, auch den Radius aus dem Volumen (Kubikwurzel). | KR.UMFANG-FLAECHE, PW.WURZEL | OS LB 2 (HS Differenzierung), GY LB 2 | Gen | Wie sich das Volumen beim Verdoppeln des Radius ändert |
| M.GM.KP.ZUSAMMENGESETZT | Ich kann Oberfläche, Volumen und Materialbedarf zusammengesetzter Körper aus Prisma, Zylinder, Pyramide, Kegel und Kugel berechnen. | KP.KEGEL (GM), KP.KUGEL, KP.PYRAMIDE | OS LB 2, GY – | Gen | Zerlegen oder ergänzen: Lösungsplan wählen |

**Feld ST – Beschreibende Statistik** (KMK L5)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. | E |
|---|---|---|---|---|---|
| M.DZ.ST.MITTELWERTE | Ich kann Modalwert, Median (Zentralwert) und arithmetisches Mittel bestimmen und entscheiden, welcher Mittelwert zu den Daten passt. | DA.MITTELWERT, DA.DIAGRAMME | OS LB 4, GY LB 4 | Gen | Ausreißer: welcher Mittelwert ist aussagekräftig? |
| M.DZ.ST.STREUUNG | Ich kann Minimum, Maximum, Spannweite, Varianz und Standardabweichung bestimmen und die Streuung deuten. | ST.MITTELWERTE, PW.WURZEL | OS LB 4 (nur Spannweite), GY LB 4 | Gen | Gleiches Mittel, andere Streuung vergleichen |
| M.DZ.ST.HISTOGRAMM | Ich kann Daten in Klassen einteilen und als Histogramm darstellen und lesen. | ST.MITTELWERTE | OS –, GY LB 4 | Gen | Wirkung einer anderen Klasseneinteilung |
| M.DZ.ST.MANIPULATION | Ich kann typische Fehler und Täuschungen in Statistiken erkennen: abgeschnittene Achsen, andere Bezugsgrößen, Prozent falsch verwendet, überzogene Genauigkeit. | ST.MITTELWERTE, PZ.GRUNDAUFGABEN, DA.DIAGRAMME | OS LB 4, GY LB 4 | Mix | Begründung zur irreführenden Darstellung auswählen |

*Stand 02.11.2026:* **PW.WURZEL und PW.REELL als Entwurf** mit G, M und E: Wurzeln berechnen (G Quadrat- und Kubikwurzeln, M bis ⁵√ und negative Radikanden), Wurzeln abschätzen (zwei Felder, G √, M ∛), „Stimmt das immer?“ zu Wurzeln (E); rational oder irrational (G), kleinster Zahlbereich (M), Aussagen über rationale und irrationale Zahlen (E) – 6 Vorlagen (`src/generators/mathematik/potenzen-wurzeln/`), 2 Erstvermittlungen, 12 neue Fehlvorstellungen (`FV.PW.…`). Für Niveau E kam M.RF.KR.BEGRUENDEN (Gegenbeispiel) als Voraussetzung dazu. Klasse 9 ist in der App wählbar.

*Stand 03.11.2026:* **PW.GESETZE als Entwurf** mit G, M und E: Hochzahl mit Potenzgesetz bestimmen (G positive Hochzahlen, M negative), geschickt berechnen mit Zwischenschritten (erst die Hochzahl, dann der Wert), Rechnungen prüfen (E: $a^2 \cdot a^3 = a^6$, $a^0 = 0$, $a^{-n} = -a^n$, $2^m \cdot 5^m = 10^m$ …) – 3 Vorlagen, 1 Erstvermittlung, 8 neue Fehlvorstellungen; neue Fachbegriffe Basis und Potenzgesetz. Hochzahl 0 und negative Hochzahlen stehen schon hier (Lehrplan GY LB 1); PW.RATIONAL baut darauf auf. **PW.RATIONAL als Entwurf** mit G, M und E: Potenzen mit Bruch-Hochzahl berechnen (G $a^{\frac{1}{n}}$, M $a^{\frac{m}{n}}$ mit Zwischenschritten: erst Wurzel, dann Potenz), Schreibweisen Wurzel ↔ Potenz zuordnen (M auch Kehrwert mit negativer Hochzahl), Aussagen prüfen (E) – 3 Vorlagen, 1 Erstvermittlung, 3 neue Fehlvorstellungen (BRUCH-HOCHZAHL-GETEILT, -VERTAUSCHT, TEIL-VERGESSEN). **GL.WURZEL als Entwurf** mit G, M und E: Wurzelgleichungen lösen (G $\sqrt{x} = c$ und $\sqrt{x + b} = c$, M mit Faktor vor x und Zahl neben der Wurzel, Zwischenschritte: erst quadrierte rechte Seite, dann x), Lösung oder Scheinlösung wählen (E, etwa die Hälfte ohne Lösung) – 2 Vorlagen, 1 Erstvermittlung, 3 neue Fehlvorstellungen (WURZEL-NICHT-QUADRIERT, ISOLIEREN-VERGESSEN, WURZEL-PROBE). Damit ist das Feld PW mit GL.WURZEL vollständig. **QF.GRAPH und QF.SCHEITEL als Entwurf** (neues Feld `quadratische-funktionen`): Funktionswerte (G $x^2 + c$, M mit Faktor), Nullstellen am Graphen ablesen (zwei Felder, ungeordnet, „keine Lösung“), Wertebereich ablesen (M), Aussagen über Parabeln (E); Scheitelpunkt aus Scheitelform (G) und Normalform (M), Maximum oder Minimum mit Begründung (E) – 6 Vorlagen, 2 Erstvermittlungen (noch ohne Bild), 8 neue Fehlvorstellungen; Graphen mit `kurve` (B5). QF.GRAPH setzt jetzt auch FK.NULLSTELLE voraus. **QF.INHALTLICH und QF.FORMEL als Entwurf:** Gleichungen ohne Formel lösen (G $x^2 = a$, M $(x - d)^2 = a$, Produktform, Ausklammern), Aussagen prüfen (E: nur positive Lösung, Teilen durch x …); Anzahl der Lösungen über die Diskriminante (G), Lösungsformel (G Normalform, M erst durch a teilen), Aussagen zur Anzahl (E) – 5 Vorlagen, 2 Erstvermittlungen, 8 neue Fehlvorstellungen, Begriff Diskriminante. **QF.SCHNITTPUNKTE und QF.SACH als Entwurf:** Schnittstellen von Parabel und Gerade (G am Graphen mit waagerechter Geraden, M rechnerisch), Anzahl der Schnittpunkte begründen (E); Bogenbreite (G), höchster Wurfpunkt und größte Fläche (M), Lösung im Sachzusammenhang deuten (E) – 4 Vorlagen, 2 Erstvermittlungen, 4 neue Fehlvorstellungen. **Damit ist das Feld QF vollständig.** **PF.POTENZFUNKTION, PF.WURZELFUNKTION und PF.PARAMETER als Entwurf** (neues Feld `potenzfunktionen`): Graph und Term zuordnen (G, mit Graph), Eigenschaften (M), Zuordnen mit Begründung (E); Werte und Umkehrfrage bei $\sqrt{x}$ und $x^{\frac{1}{3}}$ (G/M), Eigenschaften (M), Definitionsbereich begründen (E); Verschieben und Strecken beschreiben (G/M), Reihenfolge erkennen (E) – 8 Vorlagen, 3 Erstvermittlungen, 8 neue Fehlvorstellungen. Das Werkzeug „Parameter am Graphen“ (B8) folgt; bis dahin erklären die Erstvermittlungen mit Text. **Damit ist das Feld PF vollständig.**

**Summe Klasse 9:** 30 Kompetenzen × 3 Niveaus (G, M, E), davon 28 überwiegend generatorbasiert, 2 gemischt; bei 1 wird Zeichnen erklärt (Kegel, L-10). Neue Felder: PW (potenzen-wurzeln), PF (potenzfunktionen), QF (quadratische-funktionen), PY (pythagoras), TR (trigonometrie), ST (statistik); KP und GL werden fortgesetzt.

### 8e.3 Graph Klasse 9 (vereinfacht)

```
RZ.POTENZEN ─ PW.WURZEL ─┬─ PW.REELL (+ RZ.ZAHLBEREICHE, BR.PERIODISCH)
                         ├─ PW.GESETZE ─ PW.RATIONAL ─ PF.WURZELFUNKTION
                         ├─ GL.WURZEL (+ TU.GLEICHUNGEN)
                         ├─ PY.PYTHAGORAS (+ DV.DREIECKE) ─┬─ PY.UMKEHRUNG (+ KR.BEGRUENDEN)
                         │                                 ├─ PY.HOEHENSATZ
                         │                                 ├─ PY.SACH ─ KP.PYRAMIDE-HOEHEN
                         │                                 └─ TR.BEGRIFFE (+ AE.AEHNLICH) ─ TR.BERECHNEN ─ TR.SACH
                         └─ KP.KUGEL (+ KR.UMFANG-FLAECHE) ─┐
FK.EIGENSCHAFTEN ─┬─ PF.POTENZFUNKTION ─ PF.PARAMETER      ├─ KP.ZUSAMMENGESETZT
                  └─ QF.GRAPH ─┬─ QF.SCHEITEL (+ TU.BINOMISCH) ─┐
                               └─ QF.INHALTLICH ────────────────┴─ QF.FORMEL ─┬─ QF.SCHNITTPUNKTE
                                                                              └─ QF.SACH
KP.ZYLINDER ─┬─ KP.KEGEL (GM, + PY.PYTHAGORAS) ──────────────────┘
             └─ KP.KEGEL (RF, + KP.PYRAMIDEN)
DA.MITTELWERT ─ ST.MITTELWERTE ─┬─ ST.STREUUNG ─ ST.HISTOGRAMM
                                └─ ST.MANIPULATION
```

## 8f. Klasse 10 (Sachsen) – Kompetenzen für den sechsten Bauabschnitt

Grundlage wie §8e: Lehrplan Oberschule Mathematik 2019 (Realschulbildungsgang, Kl. 10), Lehrplan Gymnasium Mathematik (Kl. 10 in Kraft seit 1. August 2023), ausgewertet am 02.11.2026. Klasse 10 der OS schließt mit dem **Realschulabschluss** ab (`PRUEFUNGEN.md` §4). Der Hauptschulbildungsgang endet mit Klasse 9.

### 8f.1 Auswahl

| | OS Klasse 10 – RS | GY Klasse 10 |
|---|---|---|
| LB 1 | Dreiecke und Vielecke (20 Ustd.) | Wachstumsvorgänge und periodische Vorgänge (22 Ustd.) |
| LB 2 | Funktionale Zusammenhänge (20 Ustd.) | Diskrete Zufallsgrößen (16 Ustd.) |
| LB 3 | Zufallsgrößen (12 Ustd.) | Algebraisches Lösen geometrischer Probleme (20 Ustd.) |
| LB 4 | Mathematik im Alltag (28 Ustd.) | Funktionale Zusammenhänge (42 Ustd.) |
| LB 5 | – | Vernetzung: Zinsrechnung (4 Ustd.) |

**Wahlbereiche** (RS: Dynamisieren geometrischer Objekte, Optimierung, Vermessungsprobleme; GY: Komplexe Zahlen, Logistisches Wachstum, Kurven in Parameterdarstellung und in Polarkoordinaten) zählen nicht (L-11).

**Hinweis zu §8d:** Die linearen Ungleichungen stehen an der OS nicht in Kl. 10 LB 2, sondern im **Wahlbereich 2 „Optimierung“** der Kl. 10. `M.SF.TU.UNGLEICHUNGEN` ist damit für die OS keine Pflicht. Die Zuordnung in §8d und in der `kompetenz.yaml` wird in Phase B berichtigt.

**Wichtige Unterschiede in Klasse 10:**
- **Exponentialfunktionen:** RS y = c·aˣ im Sachbezug; GY dazu rekursive und explizite Beschreibung, e als Basis, Parameter in allen vier Fällen, Logarithmus, Umkehrfunktionen und Exponentialgleichungen.
- **Sinusfunktion:** RS y = a·sin(b·x) mit Grad- und Bogenmaß; GY alle vier Parameter c·f(x), f(x) + c, f(x + c), f(c·x).
- **Zufallsgrößen:** RS nur der Erwartungswert, anschaulich und ohne Begriffsdefinition; GY Wahrscheinlichkeitsverteilung, „genau, mindestens, höchstens k“, Varianz und Standardabweichung, faire Spiele.
- **Stümpfe:** Pyramiden- und Kegelstumpf berechnen nur an der RS (LB 4).
- **Zahlenfolgen, Verknüpfen und Verketten von Funktionen, Systematik der Funktionen ohne Hilfsmittel** nur im GY (LB 4, Grundlage der Analysis).
- **Zinsen:** Zinseszins steht schon in §8c (`M.ZO.PZ.ZINS`); neu sind Kredit und Tilgung (GY LB 5, RS LB 4).

**Nicht in der App abbildbar:** exponentielle Regression mit Hilfsmitteln, Gewinnen der Umkehrfunktion mit CAS, Nachweis von Folgeneigenschaften mit CAS, Simulation von Zufallsversuchen (RS LB 3), Sich-Positionieren und Diskussionen (RS LB 4, GY LB 2). Die Parameterdarstellung des Kreises (GY LB 4, „Einblick“) und das logistische Wachstum (Einblick) kommen höchstens in der Erstvermittlung vor.

### 8f.2 Kompetenzen

Legende wie §8e.2. *Sachsen:* LB der Klasse 10.

**Feld EX – Exponentielles Wachstum** (KMK L3)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. | E |
|---|---|---|---|---|---|
| M.SF.EX.WACHSTUM | Ich kann lineares und exponentielles Wachstum unterscheiden und rekursiv und explizit beschreiben. | FK.LINEAR-GLEICHUNG, PZ.ZINS, PW.GESETZE | OS LB 2, GY LB 1 | Gen | Aus einer Tabelle begründen, welches Modell passt |
| M.SF.EX.FUNKTION | Ich kann Exponentialfunktionen y = c·aˣ (auch mit Basis e) zeichnen, ihre Eigenschaften angeben und den Einfluss der Parameter beschreiben. | EX.WACHSTUM, PF.PARAMETER | OS LB 2, GY LB 1 | Gen | Graph und Term zuordnen, Asymptote begründen |
| M.SF.EX.SACH | Ich kann Wachstums- und Zerfallsaufgaben lösen, auch mit Verdopplungs- und Halbwertszeit. | EX.FUNKTION | OS LB 2, GY LB 1 | Gen | Grenzen des Modells erkennen |

**Feld LG – Logarithmus und Umkehrfunktionen** (KMK L3, L1)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. | E |
|---|---|---|---|---|---|
| M.SF.LG.UMKEHRFUNKTION | Ich kann zu einer umkehrbaren Funktion die Umkehrfunktion bilden und ihren Graphen durch Spiegeln an y = x erhalten. | FK.BEGRIFF, PF.WURZELFUNKTION | OS –, GY LB 4 | Gen | Warum y = x² nur eingeschränkt umkehrbar ist |
| M.ZO.LG.LOGARITHMUS | Ich kann Logarithmen als Umkehrung des Potenzierens bestimmen und die Logarithmengesetze anwenden. | PW.GESETZE, LG.UMKEHRFUNKTION | OS –, GY LB 4 | Gen | Fehler finden, z. B. log(a + b) = log a + log b |
| M.SF.LG.GLEICHUNGEN | Ich kann Exponentialgleichungen aˣ = b lösen und die Logarithmusfunktion y = ln x als Umkehrung von y = eˣ beschreiben. | LG.LOGARITHMUS, EX.FUNKTION | OS –, GY LB 4 | Gen | Eigenschaften von ln aus eˣ begründen |

**Feld TF – Periodische Vorgänge und Sinusfunktion** (KMK L3)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. | E |
|---|---|---|---|---|---|
| M.SF.TF.BOGENMASS | Ich kann Winkel zwischen Grad- und Bogenmaß umrechnen und Sinus und Kosinus am Einheitskreis ablesen. | TR.BEGRIFFE, KR.UMFANG-FLAECHE | OS LB 2, GY LB 1 | Gen | Werte über 90° am Einheitskreis begründen |
| M.SF.TF.SINUS | Ich kann Graph und Eigenschaften der Sinus- und Kosinusfunktion angeben: Periode, Nullstellen, Extrema, Wertebereich. | TF.BOGENMASS, FK.EIGENSCHAFTEN | OS LB 2, GY LB 1 | Gen | Symmetrie und Periodizität begründen |
| M.SF.TF.PARAMETER | Ich kann den Einfluss der Parameter in y = a·sin(b·(x + c)) + d beschreiben und periodische Vorgänge damit modellieren. | TF.SINUS, PF.PARAMETER | OS LB 2 (nur a und b), GY LB 1 | Gen | Periode aus b richtig bestimmen (2π/b statt b) |

**Feld FS – Funktionen systematisch** (KMK L3)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. | E |
|---|---|---|---|---|---|
| M.SF.FS.SYSTEMATIK | Ich kann die Graphen und Eigenschaften von y = x, x², √x, 1/x, eˣ, ln x und sin x ohne Hilfsmittel angeben und zuordnen. | PF.WURZELFUNKTION, EX.FUNKTION, LG.GLEICHUNGEN, TF.SINUS | OS LB 2 (ohne ln), GY LB 4 | Gen | Aussagen über Funktionsklassen prüfen („Jede … hat …“) |
| M.SF.FS.TRANSFORMATION | Ich kann für beliebige bekannte Funktionen den Einfluss von c·f(x), f(x) + c, f(x + c) und f(c·x) auf Graph und Eigenschaften angeben. | FS.SYSTEMATIK, TF.PARAMETER | OS –, GY LB 1 und LB 4 | Gen | Mehrere Parameter: Reihenfolge der Abbildungen |
| M.SF.FS.VERKNUEPFEN | Ich kann Summen, Produkte, Quotienten und Verkettungen einfacher Funktionen bilden und innere und äußere Funktion angeben, auch tan x = sin x / cos x. | FS.SYSTEMATIK | OS –, GY LB 4 | Gen | Definitionslücken der Verknüpfung begründen |
| M.SF.FS.FOLGEN | Ich kann Zahlenfolgen explizit und rekursiv beschreiben und Schranken und Grenzwerte anschaulich bestimmen. | EX.WACHSTUM, FK.BEGRIFF | OS –, GY LB 4 | Gen | „Beschränkt, also konvergent?“ – Gegenbeispiel wählen |

**Feld ZG – Zufallsgrößen** (KMK L5)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. | E |
|---|---|---|---|---|---|
| M.DZ.ZG.VERTEILUNG | Ich kann zu einer Zufallsgröße die Wahrscheinlichkeitsverteilung aufstellen, als Stabdiagramm darstellen und Wahrscheinlichkeiten für „genau“, „mindestens“ und „höchstens k“ berechnen. | ZF.BAUMDIAGRAMM, ZF.ZAEHLEN | OS LB 3 (Einblick), GY LB 2 | Gen | Gegenereignis bei „mindestens eins“ nutzen |
| M.DZ.ZG.ERWARTUNG | Ich kann den Erwartungswert einer Zufallsgröße berechnen, mit dem Mittelwert vergleichen und Spiele als fair oder unfair beurteilen. | ZG.VERTEILUNG, ST.MITTELWERTE | OS LB 3, GY LB 2 | Gen | Gewinnchance und Gewinnerwartung unterscheiden |
| M.DZ.ZG.STREUUNG | Ich kann Varianz und Standardabweichung einer Zufallsgröße berechnen und als Maß für das Risiko deuten. | ZG.ERWARTUNG, ST.STREUUNG | OS –, GY LB 2 | Gen | Zwei Spiele mit gleichem Erwartungswert vergleichen |

**Feld AD – Allgemeine Dreiecke** (KMK L4, L2)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. | E |
|---|---|---|---|---|---|
| M.RF.AD.SINUSSATZ | Ich kann mit dem Sinussatz Seiten und Winkel in beliebigen Dreiecken berechnen. | TR.BERECHNEN, TF.BOGENMASS | OS LB 1, GY LB 3 | Gen | Zwei mögliche Dreiecke (Fall SsW) erkennen |
| M.RF.AD.KOSINUSSATZ | Ich kann mit dem Kosinussatz Seiten und Winkel in beliebigen Dreiecken berechnen. | TR.BERECHNEN, PY.PYTHAGORAS | OS LB 1, GY LB 3 | Gen | Pythagoras als Sonderfall begründen |
| M.GM.AD.FLAECHE | Ich kann den Flächeninhalt beliebiger Dreiecke und Vielecke mit A = ½·a·b·sin γ berechnen. | AD.SINUSSATZ, FL.DREIECK | OS LB 1, GY LB 3 | Gen | Formel aus A = ½·g·h herleiten (Schritte ordnen) |
| M.RF.AD.SACH | Ich kann Berechnungen an Dreiecken, Vielecken, Pyramiden und Kegeln mit einem Lösungsplan durchführen (Vermessung, Bauwerke). | AD.SINUSSATZ, AD.KOSINUSSATZ, KP.PYRAMIDE-HOEHEN | OS LB 1, GY LB 3 | Gen | Lösungsplan wählen: welcher Satz zuerst? |

**Felder KP und PZ – Mathematik im Alltag** (KMK L2, L1)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. | E |
|---|---|---|---|---|---|
| M.GM.KP.STUMPF | Ich kann Oberfläche, Volumen und Masse von Pyramiden- und Kegelstümpfen berechnen. | KP.ZUSAMMENGESETZT, AE.BERECHNEN | OS LB 4, GY – | Gen | Stumpf als Differenz zweier Körper begründen |
| M.ZO.PZ.KREDIT | Ich kann Sparpläne, Kredite und Tilgung berechnen und vergleichen. | PZ.ZINS, EX.SACH | OS LB 4, GY LB 5 | Gen | Effektiver Zins: Angebot mit versteckten Kosten erkennen |

**Summe Klasse 10:** 22 Kompetenzen × 3 Niveaus, alle überwiegend generatorbasiert. Neue Felder: EX (exponentialfunktionen), LG (logarithmus), TF (trigonometrische-funktionen), FS (funktionen-systematisch), ZG (zufallsgroessen), AD (allgemeine-dreiecke).

### 8f.3 Graph Klasse 10 (vereinfacht)

```
PZ.ZINS ─ EX.WACHSTUM (+ FK.LINEAR-GLEICHUNG, PW.GESETZE) ─┬─ EX.FUNKTION (+ PF.PARAMETER) ─┬─ EX.SACH ─ PZ.KREDIT
                                                           │                               └─ LG.GLEICHUNGEN ─┐
                                                           └─ FS.FOLGEN                                       │
PF.WURZELFUNKTION ─ LG.UMKEHRFUNKTION ─ LG.LOGARITHMUS (+ PW.GESETZE) ─ LG.GLEICHUNGEN ───────────────────────┤
TR.BEGRIFFE ─ TF.BOGENMASS ─ TF.SINUS ─ TF.PARAMETER ─────────────────────────────────────────────────────────┴─ FS.SYSTEMATIK ─┬─ FS.TRANSFORMATION
                                                                                                                             └─ FS.VERKNUEPFEN
TR.BERECHNEN ─┬─ AD.SINUSSATZ (+ TF.BOGENMASS) ─┬─ AD.FLAECHE
              └─ AD.KOSINUSSATZ ────────────────┴─ AD.SACH (+ KP.PYRAMIDE-HOEHEN)
ZF.BAUMDIAGRAMM ─ ZG.VERTEILUNG ─ ZG.ERWARTUNG (+ ST.MITTELWERTE) ─ ZG.STREUUNG (+ ST.STREUUNG)
KP.ZUSAMMENGESETZT ─ KP.STUMPF (+ AE.BERECHNEN)
```

## 8g. Jahrgangsstufen 11/12 (Sachsen) – Grundkurs und Leistungskurs

Grundlage: Lehrplan Gymnasium Mathematik (Jgst. 11 in Kraft seit 1. August 2024, Jgst. 12 seit 1. August 2025), Teile „Grundkurs“ und „Leistungskurs“, ausgewertet am 02.11.2026. Die Oberstufe gibt es nur am Gymnasium. Ziel ist das Abitur GK und LK (`PRUEFUNGEN.md` §1–§3, K-25).

### 8g.1 Auswahl

| LB | Grundkurs | Leistungskurs |
|---|---|---|
| Differentialrechnung | LB 1 (52 Ustd.) | LB 1 (66 Ustd.) |
| Matrizen | LB 2 (6 Ustd.) | LB 2 (6 Ustd.) |
| Vektoren, Geraden und Ebenen | LB 3 (32 Ustd.) | LB 3 (32 Ustd.) |
| Binomialverteilte Zufallsgrößen | LB 4 (18 Ustd.) | LB 4 (32 Ustd.) |
| Integralrechnung | LB 5 (28 Ustd.) | LB 5 (33 Ustd.) |
| Normalverteilte Zufallsgrößen | – | LB 6 (12 Ustd.) |
| Beurteilende Statistik | LB 6 (12 Ustd.) | LB 7 (12 Ustd.) |
| Abstände und Winkel | LB 7 (24 Ustd.) | LB 8 (26 Ustd.) |
| Weitere Anwendungen | LB 8 (20 Ustd.) | LB 9 (21 Ustd.) |

**Wahlbereiche** (GK: Kegelschnitte, Numerische Verfahren zum Lösen von Gleichungen, Dynamische Systeme und fraktale Strukturen, Bedingte Wahrscheinlichkeiten, Numerische Integrationsverfahren, Differentialgleichungen; LK: dieselben ohne „Bedingte Wahrscheinlichkeiten“, dafür Funktionen mit zwei Veränderlichen) zählen nicht (L-11). Bedingte Wahrscheinlichkeit und der Satz von Bayes sind im **LK Pflicht** (LB 4), im GK nur Wahlbereich.

**Entscheidung des PV (02.11.2026, `KLASSE-9-12.md` Entscheidung 2): GK und LK teilen sich die Kompetenzen.** Was der LK über den GK hinaus verlangt, steht auf **Niveau E**. Eine eigene Kompetenz mit der Kennzeichnung **(LK)** gibt es nur, wo der Stoff im GK gar nicht vorkommt. „Weitere Anwendungen“ (GK LB 8, LK LB 9) ist kein eigenes Feld; die Inhalte (Spiegeln, extremale Abstände, Flächen, Scharen) stehen bei den Feldern, zu denen sie gehören. Die Lernbereiche 1–9 gelten für die Jahrgangsstufen 11 und 12 zusammen; der Lehrplan teilt sie nicht auf die Jahre auf.

**Wichtige Unterschiede GK und LK** (nach Lernbereich):
- **Differentialrechnung:** LK beherrscht Grenzwerte und Stetigkeit (GK: Einblick in Stetigkeit), auch abschnittsweise definierte Funktionen; Ableitung nach Definition auch für f(x) = aˣ; Approximation durch lineare Funktionen; Polynomdivision (mit CAS) und alle Asymptoten.
- **Vektoren:** LK beherrscht lineare Abhängigkeit (GK: geometrische Veranschaulichung) und die Lage Ebene–Ebene mit Schnittgerade.
- **Stochastik:** LK zusätzlich Zugänge zum Wahrscheinlichkeitsbegriff (Einblick), Abzählverfahren, bedingte Wahrscheinlichkeit und Bayes; Normalverteilung (LB 6).
- **Integralrechnung:** LK zusätzlich lineare Substitution ohne Hilfsmittel, Integralfunktion, Integral als physikalische Größe, Volumen von Rotationskörpern.
- **Abstände:** LK zusätzlich Hesse'sche Normalenform und die Abstände Punkt–Gerade, Gerade–Ebene, Gerade–Gerade und Ebene–Ebene.
- **Weitere Anwendungen:** LK zusätzlich extremale Winkel, unbegrenzte Flächen, Volumina, Dichtefunktion und Fläche, Ortskurven und Ebenenscharen.

**Nicht in der App abbildbar:** Bestimmen von Funktionsgleichungen mit **Regression**, Ableiten und Integrieren „mit Hilfsmitteln: beliebige Funktionen“, Gleichungssysteme mit mehr als drei Unbekannten, Simulation, Lösen mit dem MMS. Bastion bietet kein modulares Mathematiksystem an (`PRUEFUNGEN.md` §5.3). Aufgaben im Stil von Teil B geben Rechnerergebnisse vor oder fragen nach Ansatz, Deutung und Begründung. Würdigungen (Newton, Leibniz, Riemann, Moivre, Laplace) nur in der Erstvermittlung.

### 8g.2 Kompetenzen

Legende wie §8e.2. *Sachsen:* LB nach Grundkurs/Leistungskurs, z. B. „GK 1, LK 1“. **(LK)** = nur Leistungskurs. `klassenstufe_typisch: [11, 12]`. Spalte **E** nennt zuerst den LK-Anteil, sonst den Transfer.

**Feld GW – Grenzwerte und Stetigkeit** (KMK SII: funktionaler Zusammenhang)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. | E |
|---|---|---|---|---|---|
| M.SF.GW.UNENDLICH | Ich kann das Verhalten von Funktionen für x → ±∞ bestimmen und waagerechte Asymptoten angeben. | FS.SYSTEMATIK, FS.FOLGEN | GK 1, LK 1 | Gen | LK: schiefe Asymptoten (Polynomdivision) |
| M.SF.GW.STELLE | Ich kann Grenzwerte an einer Stelle mit den Grenzwertsätzen bestimmen und Polstellen und Lücken unterscheiden. | GW.UNENDLICH, FS.VERKNUEPFEN | GK 1, LK 1 | Gen | Links- und rechtsseitigen Grenzwert vergleichen |
| M.SF.GW.STETIGKEIT | Ich kann entscheiden, ob eine Funktion an einer Stelle stetig ist, und Unstetigkeitsstellen angeben. | GW.STELLE | GK 1 (Einblick), LK 1 | Gen | LK: abschnittsweise Funktionen stetig machen (Parameter) |

**Feld AB – Ableitungen** (KMK SII: funktionaler Zusammenhang)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. | E |
|---|---|---|---|---|---|
| M.SF.AB.AENDERUNGSRATE | Ich kann mittlere und lokale Änderungsraten bestimmen und als Anstieg von Sekante und Tangente deuten. | FK.LINEAR-GLEICHUNG, GW.STELLE | GK 1, LK 1 | Gen | LK: Approximation durch eine lineare Funktion |
| M.SF.AB.DEFINITION | Ich kann die Ableitung mit dem Differentialquotienten nach Definition bestimmen. | AB.AENDERUNGSRATE, TU.BINOMISCH | GK 1, LK 1 | Mix | LK: f(x) = aˣ; Schritte der h-Methode ordnen |
| M.SF.AB.REGELN | Ich kann ganzrationale Funktionen und Potenzfunktionen mit rationalen Exponenten mit Potenz-, Faktor- und Summenregel ableiten. | AB.DEFINITION, PW.RATIONAL | GK 1, LK 1 | Gen | Eine Regel begründen (Schritte auswählen) |
| M.SF.AB.SPEZIELL | Ich kann eˣ, ln x, sin x und cos x ableiten. | AB.REGELN, FS.SYSTEMATIK | GK 1, LK 1 | Gen | Ableitung am Graphen bestätigen |
| M.SF.AB.KETTE-PRODUKT | Ich kann einfache Verkettungen und Produkte mit Ketten- und Produktregel ableiten. | AB.SPEZIELL, FS.VERKNUEPFEN | GK 1, LK 1 | Gen | Fehler finden: innere Ableitung vergessen |
| M.SF.AB.TANGENTE | Ich kann Gleichungen von Tangenten und Normalen bestimmen und Berührpunkte zu gegebenem Anstieg finden. | AB.REGELN, FK.LINEAR-GLEICHUNG | GK 1, LK 1 | Gen | Tangente von einem Punkt außerhalb (Parameter) |
| M.SF.AB.GRAPH | Ich kann zum Graphen einer Funktion den Graphen der Ableitung skizzieren und zuordnen und umgekehrt. | AB.AENDERUNGSRATE, FK.EIGENSCHAFTEN | GK 1, LK 1 | Mix | Aus f′ auf f schließen, Aussagen begründen |

**Feld KD – Funktionen untersuchen** (KMK SII: funktionaler Zusammenhang)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. | E |
|---|---|---|---|---|---|
| M.SF.KD.EIGENSCHAFTEN | Ich kann Definitions- und Wertebereich in Intervall- und Mengenschreibweise angeben und Nullstellen, Polstellen, Symmetrie und Asymptoten bestimmen. | GW.STELLE, QF.FORMEL | GK 1, LK 1 | Gen | LK: alle Asymptoten; Symmetrie allgemein nachweisen |
| M.SF.KD.MONOTONIE | Ich kann mit der ersten Ableitung Monotoniebereiche bestimmen. | AB.REGELN, KD.EIGENSCHAFTEN | GK 1, LK 1 | Gen | „f′(x) > 0 ⇒ steigend“ – Umkehrung prüfen |
| M.SF.KD.EXTREMA | Ich kann lokale und globale Extrempunkte mit notwendiger und hinreichender Bedingung bestimmen. | KD.MONOTONIE | GK 1, LK 1 | Gen | Notwendig und hinreichend unterscheiden (f′(0) = 0 bei x³) |
| M.SF.KD.WENDEPUNKT | Ich kann Wendepunkte und Krümmungsverhalten mit der zweiten Ableitung bestimmen. | KD.EXTREMA | GK 1, LK 1 | Gen | Wendetangente; Sattelpunkt erkennen |
| M.SF.KD.REKONSTRUKTION | Ich kann die Gleichung einer ganzrationalen Funktion aus gegebenen Eigenschaften mit einem Gleichungssystem bestimmen (bis zu drei Unbekannte). | KD.WENDEPUNKT, MA.LGS | GK 1, LK 1 | Gen | Bedingungen aus einem Sachtext aufstellen |
| M.SF.KD.EXTREMWERT | Ich kann Extremwertprobleme mit Haupt- und Nebenbedingung lösen und Randwerte prüfen. | KD.EXTREMA, QF.SACH | GK 1, LK 1 | Gen | LK: mehrere Verfahren vergleichen; extremale Abstände und Winkel |
| M.SF.KD.SCHAREN | Ich kann Funktionsscharen mit einem Parameter untersuchen und Eigenschaften in Abhängigkeit vom Parameter angeben. | KD.EXTREMA, FS.TRANSFORMATION | GK 8, LK 9 | Gen | LK: Ortskurven der Extrem- und Wendepunkte |

**Feld IN – Integralrechnung** (KMK SII: Messen, funktionaler Zusammenhang)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. | E |
|---|---|---|---|---|---|
| M.SF.IN.STAMMFUNKTION | Ich kann Stammfunktionen von ganzrationalen Funktionen, Potenzfunktionen, eˣ, 1/x und sin x angeben. | AB.SPEZIELL | GK 5, LK 5 | Gen | LK: lineare Substitution (z. B. e^(2x+1)) |
| M.SF.IN.BESTAND | Ich kann aus einer Änderungsrate den Bestand rekonstruieren und das Integral als Bilanz deuten. | AB.AENDERUNGSRATE, IN.STAMMFUNKTION | GK 5, LK 5 | Mix | LK: Integral als physikalische Größe (Weg, Arbeit) |
| M.SF.IN.BESTIMMT | Ich kann bestimmte Integrale mit dem Hauptsatz berechnen und die Eigenschaften des Integrals nutzen. | IN.STAMMFUNKTION | GK 5, LK 5 | Gen | Wert am Graphen von F ablesen; Vorzeichen deuten |
| M.SF.IN.FLAECHE | Ich kann Flächen zwischen einem Graphen und der x-Achse und zwischen zwei Graphen berechnen. | IN.BESTIMMT, QF.SCHNITTPUNKTE | GK 5 und 8, LK 5 und 9 | Gen | LK: unbegrenzte Flächen (uneigentliche Integrale) |
| M.SF.IN.INTEGRALFUNKTION (LK) | Ich kann Integralfunktionen untersuchen und ihren Zusammenhang mit der Ausgangsfunktion beschreiben. | IN.BESTIMMT, AB.GRAPH | LK 5 | Gen | Eigenschaften der Integralfunktion am Graphen von f begründen |
| M.SF.IN.ROTATION (LK) | Ich kann das Volumen von Rotationskörpern bei Rotation um die x-Achse berechnen. | IN.BESTIMMT, KP.KEGEL (GM) | LK 5 | Gen | Volumenformel des Kegels herleiten (Schritte ordnen) |

**Feld MA – Matrizen und Gleichungssysteme** (KMK SII: Algorithmus und Zahl)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. | E |
|---|---|---|---|---|---|
| M.ZO.MA.LGS | Ich kann lineare Gleichungssysteme mit drei Unbekannten in Matrixform schreiben und mit dem Gauß-Verfahren lösen. | GS.RECHNERISCH | GK 2, LK 2 | Gen | LK: Lösbarkeitsfälle (keine, eine, unendlich viele Lösungen) |
| M.ZO.MA.MULTIPLIZIEREN | Ich kann verkettete Matrizen multiplizieren und zeigen, dass A·B ≠ B·A sein kann. | MA.LGS | GK 2, LK 2 | Gen | Anwendung: Drehung oder Verflechtung (Einblick) |

**Feld VK – Vektoren** (KMK SII: Raum und Form)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. | E |
|---|---|---|---|---|---|
| M.RF.VK.RAUM | Ich kann Punkte und Körper im räumlichen Koordinatensystem darstellen und Koordinaten ablesen. | GF.QUADRANTEN, KP.ZWEITAFEL | GK 3, LK 3 | Mix · Erkl | Koordinaten verdeckter Ecken begründen |
| M.RF.VK.RECHNEN | Ich kann Vektoren addieren, subtrahieren, vervielfachen, ihren Betrag berechnen und damit Mittelpunkte und Parallelogramme nachweisen. | VK.RAUM, PY.SACH | GK 3, LK 3 | Gen | Rechengesetze geometrisch begründen |
| M.RF.VK.ABHAENGIG | Ich kann entscheiden, ob Vektoren linear abhängig sind, und das geometrisch deuten (parallel, in einer Ebene). | VK.RECHNEN, MA.LGS | GK 3 (Veranschaulichung), LK 3 | Gen | LK: rechnerischer Nachweis für drei Vektoren |

**Feld GE – Geraden und Ebenen** (KMK SII: Raum und Form)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. | E |
|---|---|---|---|---|---|
| M.RF.GE.GERADE | Ich kann Geradengleichungen in Parameterform aufstellen und prüfen, ob ein Punkt auf der Geraden liegt. | VK.RECHNEN | GK 3, LK 3 | Gen | Besondere Lage (parallel zu einer Koordinatenebene) |
| M.RF.GE.EBENE | Ich kann Ebenengleichungen in Parameter- und Koordinatenform aufstellen und ineinander umwandeln. | GE.GERADE, MA.LGS | GK 3, LK 3 | Gen | Spurpunkte und Lage im Raum deuten |
| M.RF.GE.LAGE-GG | Ich kann die Lage zweier Geraden bestimmen (identisch, parallel, schneidend, windschief) und den Schnittpunkt berechnen. | GE.GERADE, MA.LGS | GK 3, LK 3 | Gen | Entscheidungsweg in die richtige Reihenfolge bringen |
| M.RF.GE.LAGE-GE | Ich kann die Lage von Gerade und Ebene bestimmen und den Durchstoßpunkt berechnen. | GE.EBENE, GE.LAGE-GG | GK 3, LK 3 | Gen | Lage am Skalarprodukt mit dem Normalenvektor erkennen |
| M.RF.GE.LAGE-EE (LK) | Ich kann die Lage zweier Ebenen bestimmen und die Schnittgerade berechnen. | GE.LAGE-GE | LK 3 | Gen | Parallele Ebenen an den Normalenvektoren begründen |
| M.RF.GE.SCHAREN | Ich kann Geradenscharen untersuchen und besondere Geraden einer Schar bestimmen. | GE.LAGE-GG | GK 8, LK 9 | Gen | LK: Ebenenscharen |

**Feld AW – Abstände und Winkel** (KMK SII: Raum und Form, Messen)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. | E |
|---|---|---|---|---|---|
| M.RF.AW.SKALARPRODUKT | Ich kann das Skalarprodukt berechnen, damit Orthogonalität prüfen und Winkel zwischen Vektoren bestimmen. | VK.RECHNEN, TR.BERECHNEN | GK 7, LK 8 | Gen | Geometrische Bedeutung (Projektion) |
| M.RF.AW.VEKTORPRODUKT | Ich kann das Vektorprodukt berechnen, als Normalenvektor nutzen und Flächen von Parallelogramm und Dreieck bestimmen. | AW.SKALARPRODUKT | GK 7 und 8, LK 8 und 9 | Gen | Richtung und Betrag geometrisch deuten |
| M.RF.AW.SCHNITTWINKEL | Ich kann Schnittwinkel zwischen Geraden, zwischen Gerade und Ebene und zwischen zwei Ebenen berechnen. | AW.SKALARPRODUKT, GE.EBENE | GK 7, LK 8 | Gen | Sinus statt Kosinus bei Gerade–Ebene begründen |
| M.RF.AW.ABSTAND | Ich kann Abstände Punkt–Punkt und Punkt–Ebene berechnen, auch über den Lotfußpunkt. | AW.SCHNITTWINKEL, GE.LAGE-GE | GK 7, LK 8 | Gen | LK: Hesse'sche Normalenform |
| M.RF.AW.ABSTAND-WEITERE (LK) | Ich kann Abstände Punkt–Gerade, Gerade–Ebene, Gerade–Gerade (auch windschief) und Ebene–Ebene berechnen. | AW.ABSTAND, GE.LAGE-EE | LK 8 | Gen | Verfahren wählen und begründen |
| M.RF.AW.ANWENDUNG | Ich kann Punkte an Ebenen spiegeln und kleinste und größte Entfernungen in Ebene und Raum bestimmen. | AW.ABSTAND, KD.EXTREMWERT | GK 8, LK 9 | Gen | LK: extremale Winkel |

**Feld WS – Mehrstufige Zufallsversuche** (KMK SII: Daten und Zufall)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. | E |
|---|---|---|---|---|---|
| M.DZ.WS.MEHRSTUFIG | Ich kann Wahrscheinlichkeiten mehrstufiger Versuche mit Urnenmodell und Baumdiagramm berechnen und abschätzen. | ZF.BAUMDIAGRAMM, ZG.VERTEILUNG | GK 4, LK 4 | Gen | Verschiedene Lösungswege vergleichen |
| M.DZ.WS.ABZAEHLEN | Ich kann mit Fakultät und Binomialkoeffizient zählen. | ZF.ZAEHLEN | GK 4, LK 4 | Gen | LK: Abzählverfahren beim Lotto und Ziehen ohne Zurücklegen |
| M.DZ.WS.VIERFELDER | Ich kann Vierfeldertafeln aufstellen, ergänzen und lesen. | WS.MEHRSTUFIG, ZF.EREIGNISSE | GK 4, LK 4 | Gen | Zwischen Baum und Tafel wechseln |
| M.DZ.WS.UNABHAENGIG | Ich kann prüfen, ob zwei Ereignisse stochastisch unabhängig sind. | WS.VIERFELDER | GK 4, LK 4 | Gen | Unabhängig und unvereinbar unterscheiden |
| M.DZ.WS.BEDINGT (LK) | Ich kann bedingte Wahrscheinlichkeiten berechnen und den Satz von Bayes anwenden. | WS.VIERFELDER | LK 4 (GK Wahlbereich 4) | Gen | P(A\|B) und P(B\|A) verwechseln: Fehler finden (Testbeispiel) |

**Feld BV – Binomialverteilung** (KMK SII: Daten und Zufall)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. | E |
|---|---|---|---|---|---|
| M.DZ.BV.BERNOULLI | Ich kann Bernoulli-Ketten erkennen und Länge n und Trefferwahrscheinlichkeit p angeben. | WS.MEHRSTUFIG | GK 4, LK 4 | Gen | Prüfen, ob das Modell passt (Ziehen ohne Zurücklegen) |
| M.DZ.BV.EINZEL | Ich kann Einzelwahrscheinlichkeiten P(X = k) mit der Bernoulli-Formel berechnen. | BV.BERNOULLI, WS.ABZAEHLEN | GK 4, LK 4 | Gen | Formel herleiten (Pfade zählen) |
| M.DZ.BV.KUMULIERT | Ich kann kumulierte Wahrscheinlichkeiten für „höchstens“, „mindestens“ und „zwischen“ bestimmen, auch mit dem Summenzeichen. | BV.EINZEL, ZG.VERTEILUNG | GK 4, LK 4 | Gen | Grenzen richtig setzen (P(X ≥ k) = 1 − P(X ≤ k − 1)) |
| M.DZ.BV.KENNGROESSEN | Ich kann Erwartungswert, Varianz und Standardabweichung binomialverteilter Zufallsgrößen berechnen und deuten. | BV.BERNOULLI, ZG.STREUUNG | GK 4, LK 4 | Gen | Aus μ und σ auf n und p schließen |
| M.DZ.BV.SACH | Ich kann Sachaufgaben mit der Binomialverteilung lösen, auch „Wie oft muss man mindestens …?“. | BV.KUMULIERT, LG.GLEICHUNGEN | GK 4, LK 4 | Gen | LK: Modellierung kritisch beurteilen |

**Feld NV – Normalverteilung (LK)** (KMK SII: Daten und Zufall)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. | E |
|---|---|---|---|---|---|
| M.DZ.NV.DICHTE (LK) | Ich kann Dichte- und Verteilungsfunktion der Normalverteilung mit μ und σ beschreiben und den Graphen deuten. | BV.KENNGROESSEN, IN.BESTIMMT | LK 6 und 9 | Gen | Wahrscheinlichkeit als Fläche unter der Dichte |
| M.DZ.NV.BERECHNEN (LK) | Ich kann Wahrscheinlichkeiten normalverteilter Zufallsgrößen bestimmen und die Binomialverteilung durch die Normalverteilung annähern. | NV.DICHTE | LK 6 | Gen | Wann die Näherung zulässig ist (Faustregel) |

**Feld BS – Beurteilende Statistik** (KMK SII: Daten und Zufall)

| ID | Kann-Satz | Voraussetzungen | Sachsen | Abd. | E |
|---|---|---|---|---|---|
| M.DZ.BS.SCHAETZEN | Ich kann aus einer Stichprobe Mittelwert und Varianz schätzen und auf die Grundgesamtheit hochrechnen. | ST.STREUUNG, BV.KENNGROESSEN | GK 6, LK 7 | Gen | Aussagekraft einer Prognose beurteilen |
| M.DZ.BS.TEST | Ich kann einen ein- oder zweiseitigen Signifikanztest für binomialverteilte Zufallsgrößen durchführen: Nullhypothese, Ablehnungsbereich, Entscheidungsregel. | BV.KUMULIERT | GK 6, LK 7 | Gen | Links- oder rechtsseitig: aus dem Sachtext begründen |
| M.DZ.BS.IRRTUM | Ich kann das Signifikanzniveau und die statistische Sicherheit deuten und die Wahrscheinlichkeit einer Fehlentscheidung berechnen. | BS.TEST | GK 6, LK 7 | Gen | „Die Nullhypothese ist zu 95 % wahr“ – Fehlvorstellung finden |

**Summe Jahrgangsstufen 11/12:** 55 Kompetenzen × 3 Niveaus, davon **7 nur im LK** (IN.INTEGRALFUNKTION, IN.ROTATION, GE.LAGE-EE, AW.ABSTAND-WEITERE, WS.BEDINGT, NV.DICHTE, NV.BERECHNEN); 51 überwiegend generatorbasiert, 4 gemischt; bei 1 wird Zeichnen erklärt (räumliches Koordinatensystem). Neue Felder: GW, AB, KD, IN (Analysis), MA (Matrizen), VK, GE, AW (Analytische Geometrie), WS, BV, NV, BS (Stochastik).

**Summe Klasse 9 bis 12:** 107 Kompetenzen (30 + 22 + 55). Mit den 123 Kompetenzen der Klassen 5 bis 8 sind es 230.

### 8g.3 Graph Jahrgangsstufen 11/12 (vereinfacht)

```
Analysis
FS.SYSTEMATIK ─ GW.UNENDLICH (+ FS.FOLGEN) ─ GW.STELLE (+ FS.VERKNUEPFEN) ─┬─ GW.STETIGKEIT
                                                                           └─ AB.AENDERUNGSRATE ─┬─ AB.DEFINITION ─ AB.REGELN ─┬─ AB.SPEZIELL ─┬─ AB.KETTE-PRODUKT
                                                                                                 │                             │               └─ IN.STAMMFUNKTION ─┬─ IN.BESTAND
                                                                                                 │                             │                                    └─ IN.BESTIMMT ─┬─ IN.FLAECHE
                                                                                                 │                             │                                                    ├─ IN.INTEGRALFUNKTION (LK)
                                                                                                 │                             │                                                    └─ IN.ROTATION (LK)
                                                                                                 │                             ├─ AB.TANGENTE
                                                                                                 │                             └─ KD.MONOTONIE (+ KD.EIGENSCHAFTEN) ─ KD.EXTREMA ─┬─ KD.WENDEPUNKT ─ KD.REKONSTRUKTION (+ MA.LGS)
                                                                                                 │                                                                                ├─ KD.EXTREMWERT
                                                                                                 │                                                                                └─ KD.SCHAREN
                                                                                                 └─ AB.GRAPH
Lineare Algebra und Analytische Geometrie
GS.RECHNERISCH ─ MA.LGS ─ MA.MULTIPLIZIEREN
VK.RAUM ─ VK.RECHNEN ─┬─ VK.ABHAENGIG (+ MA.LGS)
                      ├─ GE.GERADE ─┬─ GE.LAGE-GG ─ GE.SCHAREN
                      │             └─ GE.EBENE (+ MA.LGS) ─ GE.LAGE-GE (+ GE.LAGE-GG) ─ GE.LAGE-EE (LK)
                      └─ AW.SKALARPRODUKT ─┬─ AW.VEKTORPRODUKT
                                           └─ AW.SCHNITTWINKEL (+ GE.EBENE) ─ AW.ABSTAND (+ GE.LAGE-GE) ─┬─ AW.ABSTAND-WEITERE (LK, + GE.LAGE-EE)
                                                                                                         └─ AW.ANWENDUNG (+ KD.EXTREMWERT)
Stochastik
ZF.BAUMDIAGRAMM ─ WS.MEHRSTUFIG (+ ZG.VERTEILUNG) ─┬─ WS.VIERFELDER ─┬─ WS.UNABHAENGIG
                                                   │                 └─ WS.BEDINGT (LK)
                                                   └─ BV.BERNOULLI ─┬─ BV.EINZEL (+ WS.ABZAEHLEN) ─ BV.KUMULIERT ─┬─ BV.SACH
                                                                    │                                             └─ BS.TEST ─ BS.IRRTUM
                                                                    └─ BV.KENNGROESSEN (+ ZG.STREUUNG) ─┬─ BS.SCHAETZEN (+ ST.STREUUNG)
                                                                                                        └─ NV.DICHTE (LK, + IN.BESTIMMT) ─ NV.BERECHNEN (LK)
```

### 8g.4 Abgleich mit den Prüfungen (`PRUEFUNGEN.md`)

**Abitur GK und LK** (§1–§3): Alle drei Sachgebiete sind abgedeckt – Analysis (GW, AB, KD, IN), Analytische Geometrie/Lineare Algebra (MA, VK, GE, AW), Stochastik (WS, BV, NV, BS). Die im Muster [SMK-M] beobachteten Formen von Teil A passen zu den Kompetenzen: Ableitung und Anstieg (AB.REGELN, AB.SPEZIELL), Grenzwerte (GW.UNENDLICH), Definitionsbereich und Asymptoten (KD.EIGENSCHAFTEN), Integral aus dem Graphen einer Stammfunktion (IN.BESTIMMT, E), Funktionenscharen (KD.SCHAREN), Mittelpunkt und Geraden im Raum (VK.RECHNEN, GE.GERADE), Parallelogramm nachweisen (VK.RECHNEN), Geradenscharen und Ebene (GE.SCHAREN), Standardabweichung der Binomialverteilung (BV.KENNGROESSEN). Teil A ist hilfsmittelfrei; die Generatoren der Klasse 11/12 brauchen deshalb einen Modus mit „schönen“ Zahlen (§5.3).

**Lücken beim Abitur, ehrlich benannt:**
- **Teil B mit MMS** (Regression, numerisches Lösen, beliebige Funktionen ableiten und integrieren) lässt sich nicht nachbilden. Bastion übt Ansatz, Deutung und Begründung; Rechnerergebnisse stehen in der Aufgabe.
- **Nachweis- und Begründungsaufgaben** („Zeigen Sie …“, „Begründen Sie …“) gibt es nur geschlossen: Begründung auswählen, Schritte ordnen, Fehler finden (§5.3). Offene Beweise bleiben ungeprüft.
- **IQB-Pool-Aufgaben** (§1) werden im Stil nachgebildet, nicht ersetzt.

**Realschulabschluss** (§4): Teil A prüft Basiswissen der Klassen 5 bis 10 ohne Taschenrechner (vorhanden). Die sachbezogenen Themen von Teil B sind abgedeckt: Körper einschließlich Stümpfe (KP.KEGEL, KP.KUGEL, KP.ZUSAMMENGESETZT, KP.STUMPF), Prozent und Kosten (PZ, PZ.KREDIT), Statistik (ST.MITTELWERTE), Trigonometrie (TR, AD), Funktionen (QF, EX, TF), Erwartungswert (ZG.ERWARTUNG). **Lücken:** Rechenkästchen, Zweitafelbild und Schrägbild zeichnen (nur erklärt, L-10) und Baumdiagramm beschriften (braucht ein Eingabefeld im Bild, siehe Bedarfsliste in `docs/session/LERNKERN.md`).

**Hauptschulabschluss (Kl. 9):** Die Inhalte des HS-Lehrplans Kl. 9 sind abgedeckt (PY, TR.BEGRIFFE mit Sinus, KP.KEGEL, KP.ZUSAMMENGESETZT, lineare Funktionen aus §8d). Den Aufbau der Prüfung kennen wir noch nicht (`PRUEFUNGEN.md` §6).

## 9. Sprache in Aufgaben

**Entscheidung L-7:** Alle Aufgabentexte folgen ab Phase 1 Regeln für einfache, klare Sprache: kurze Sätze, eine Information pro Satz, Operatoren fett und einheitlich, keine unnötigen Nebensätze, Fachbegriffe mit Erklärung beim ersten Auftreten.
*Warum:* DaZ und Hilfesprache kommen erst in Phase 5 (KONZEPT §13). Einfache Sprache ist die Abfederung bis dahin – und hilft allen, nicht nur Jugendlichen mit DaZ. Gerade Sachaufgaben (GR.SACH) messen sonst Lesekompetenz statt Mathematik.

*Umsetzung (1a):* Fachbegriffe stehen mit Erklärung im Wörterbuch `content/mathematik/begriffe.yaml` (Entwurf, 83 Begriffe der Klasse 5) und sind in den Texten antippbar; `pnpm test` erzwingt die Markierung beim ersten Vorkommen je Text (INHALTSFORMAT §11.1). Die Erklärungen sind wie die Vorlagen `ki-entwurf` und gehören zur Prüfung mit einer Lehrkraft.

Operatoren in Phase 1 (einheitliche Liste): *berechne, bestimme, gib an, ordne, vergleiche, runde, überschlage, entscheide, begründe, finde den Fehler*.

## 10. Länderbezug

**Entscheidung L-9 (27.10.2026, ersetzt L-8): Lehrplanbezug Sachsen.** Bastion startet in Sachsen (K-11). Jede Kompetenz bekommt zusätzlich zum KMK-Bezug eine Zuordnung zu den sächsischen Lehrplänen Mathematik, je Schulart:

```yaml
sachsen:
  oberschule: { klassenstufe: 6, lernbereich: "…" }   # Haupt- und Realschulbildungsgang
  gymnasium:  { klassenstufe: 5, lernbereich: "Gemeine Brüche und Dezimalzahlen" }
```

- Die Zuordnung dient der Diagnose (Startvorschlag aus Klassenstufe und Schulart), der Themenwahl vor Klassenarbeiten und der Sprache gegenüber Lehrkräften und Eltern („passt zu Lernbereich … in Klasse …“).
- Der Kompetenzgraph bleibt länderneutral (§1); andere Länder bekommen später ein eigenes Zuordnungsfeld, ohne dass sich IDs ändern (L-1).
- Das Bundesland wird **nicht abgefragt** – es gibt vorerst nur Sachsen. Die Schulart ist eine freiwillige Einstellung.
- Abschlussprüfungen in Sachsen (Hauptschulabschluss Kl. 9, Realschulabschluss Kl. 10, Abitur) werden zum Bezugspunkt, sobald die Klassenstufen 9, 10 und 11–12 an der Reihe sind (K-15).

*Warum:* Ein konkretes Land macht Inhalte für Jugendliche, Eltern und Lehrkräfte wiedererkennbar („genau das kommt in unserer Arbeit dran“). Der KMK-Bezug bleibt die Grundlage, damit der Graph später für andere Länder taugt.

*Bisher – L-8 (ersetzt):* Phase 1 arbeitet nur mit KMK-Bezug und typischer Klassenstufe. Eine Zuordnung zu einzelnen Landeslehrplänen gibt es noch nicht; das Bundesland wird nicht abgefragt.
*Warum:* Für Kl. 5–6 Mathematik sind die Unterschiede überwiegend Reihenfolge, die der Graph abfängt. Eine Länderzuordnung ist für eine Person erst sinnvoll, wenn Abschlussprüfungen (Phase 4) länderspezifisch werden. Und jede nicht abgefragte Angabe ist gelebter Datenschutz.

## 11. Offene Punkte

| ID | Frage | Tendenz |
|---|---|---|
| L-O1 | KMK-Bezeichnungen und Zuordnungen am Original prüfen; sächsische Lehrpläne (Oberschule, Gymnasium) beschaffen und zuordnen (0.18) | vor Abschluss Phase 0 |
| L-O2 | Negative Zahlen | Nach Lehrplan Sachsen: rationale Zahlen in Kl. 7 (OS LB 3, GY prüfen) |
| L-O3 | Schwellen für „gekonnt“ und „gefestigt“ | „Gefestigt“: 90 % + 7 Tage im Review bestätigt (Startwert); Feinkalibrierung mit Testjugendlichen und Simulator |
| L-O4 | Darstellung als Bild (Brüche, Winkel, Koordinatensystem, Netze) – Generator mit SVG | Ja, für Klasse 5 vielfach nötig; Aufgabentypen in `INHALTSFORMAT.md` §5 ergänzen |
| L-O5 | Hilfen in Aufgaben (Tipp, Lösungsweg) – wie wirken sie auf „gekonnt“? | Aufgabe mit Hilfe zählt für Stein, nicht für „gekonnt“ |

## 12. Entscheidungen dieses Dokuments

| ID | Entscheidung | Status |
|---|---|---|
| L-1 | Sprechende, stabile Kompetenz-IDs, nie umbenennen | Entschieden |
| L-2 | Niveaus pro Kompetenz, unabhängig von Schulform | Entschieden |
| L-3 | Niveauwechsel nur als Vorschlag | Ersetzt durch L-22 |
| L-4 | FSRS-Karte = Aufgabenvorlage; jede Wiederholung erzeugt neue Aufgabe | Entschieden |
| L-5 | Graph empfiehlt, sperrt nicht | Entschieden |
| L-6 | Klasse 5 = alle Pflicht-Lernbereiche Kl. 5 von OS und GY zusammen (neu gefasst 27.10.2026) | Entschieden |
| L-7 | Einfache Sprache in allen Aufgaben ab Phase 1 | Entschieden |
| L-8 | Kein Länderbezug und keine Bundesland-Abfrage in Phase 1 | Ersetzt durch L-9 |
| L-9 | Lehrplanbezug Sachsen je Schulart zusätzlich zum KMK-Bezug; keine Bundesland-Abfrage | Entschieden |
| L-10 | Zeichnen und Konstruieren werden erklärt, geprüft wird nur das Prüfbare; kein freies Zeichnen in der App | Entschieden |
| L-11 | Wahlbereiche der Lehrpläne zählen nicht zu den Abschlusskriterien einer Klassenstufe | Entschieden |
| L-12 | **Wechsel begleiten:** (a) Schulartwechsel – die App listet die Kompetenzen, die die neue Schulart bis zur aktuellen Klasse schon hatte („vorgezogen“, L-6), und bietet dazu eine kurze Diagnose an; (b) Überspringen – beim Hochstellen der Klasse gezielt die Lücken der übersprungenen Klasse(n) prüfen *(ergänzt 29.10.2026, Projektverantwortlicher)*: Der Hinweis zeigt je übersprungener Klasse die noch nicht gekonnten Themen (nach dem Lehrplan der gewählten Schulart) und startet eine Diagnose genau dieser Themen; das Ergebnis nennt die Lücken zum Üben; (c) Sitzenbleiben – Klasse zurückstellen ohne Meldung und ohne Rückschritt-Anzeige, Gekonntes bleibt, Wiederholungen laufen weiter | Entschieden (28.10.2026, Projektverantwortlicher); umgesetzt: Klasse und Schulart werden gemerkt (Einstellungen `lernen.klasse`, `lernen.schulart`, Schulart freiwillig in der Übersicht), `src/core/learning/wechsel.ts`, Hinweis `src/ui/ueben/Wechsel.svelte` über der Übersicht mit „Lücken gezielt prüfen“ bzw. „Kurz prüfen“ und „Nicht jetzt“ (`klassenLuecken`, `schulartLuecken`); die Diagnose prüft genau die offenen Themen und zeigt „Diese Lücken lohnt es sich zu schließen“. Wer zum ersten Mal eine höhere Klasse wählt, bekommt auch Klasse 5 mitgeprüft |
| L-13 | **Bericht für die Lehrkraft im Elternbereich:** je Lernbereich gekonnt und gefestigt, offene Lücken, Hinweis wo jemand deutlich über seiner Klasse liegt. Nur auf dem Gerät, gezeigt oder als Datei, kein Versand (Prinzip 3) | Entschieden (28.10.2026, Projektverantwortlicher); umgesetzt: dritte Ansicht „Für die Lehrkraft“ im Elternbericht (und damit auch unter „Was meine Eltern sehen“), `lehrkraftBericht` in `src/core/learning/bericht.ts`, je Lernfeld gekonnt und gefestigt bis zur gewählten Klasse, offen aus früheren Klassen, schon aus späteren gekonnt; als Textdatei speicherbar |
| L-14 | **MINT-Kontexte:** Physik, Chemie und Informatik kommen in Mathe-Aufgaben dort vor, wo der sächsische Mathe-Lehrplan sie selbst als Anwendung nennt; alles Nötige steht in der Aufgabe, Fachwissen wird nicht vorausgesetzt. *Ergänzt am 28.10.2026:* Die MINT-Kontexte sind **abschaltbar** (Einstellung für Kind und Eltern, auch im Elternbereich) und kommen **erst, wenn der Mathe-Kern bis Klasse 12 steht** | Entschieden (28.10.2026, Projektverantwortlicher) |
| L-15 | **Altersgerecht lernen:** Profil mit freiwilligem, vollem Geburtsdatum (nur auf dem Gerät) und „Ich bin erwachsen“. Danach richten sich Ansprache (du oder Sie, Ton), Sachkontexte (Erwachsene: Gehalt, Miete, Kredit), Optik der Bastion (O-4) und der Elternbereich (ab 18 selbstverwaltet, ohne Elternbereich). Ohne Angabe gilt: Schülerin oder Schüler, „du“, Elternbereich möglich. Die Kompetenzen und Aufgaben selbst bleiben gleich | Entschieden (28.10.2026, Projektverantwortlicher). *Umgesetzt:* „Über mich“ (`src/ui/profil/Profil.svelte`, beim ersten Start freiwillig gefragt, überspringbar; Einstellungen `profil.geburtsdatum`, `profil.erwachsen`, `profil.gefragt`), `src/core/policy/alter.ts`; selbstverwaltet ohne Knopf „Für Eltern“, der Bericht unter „Mein Stand“ heißt dann „Mein Bericht“. *Offen:* Ansprache mit „Sie“ (braucht eine zweite Fassung aller Texte), Sachkontexte für Erwachsene, Optik (O-4) |
| L-16 | **Diagnose zum Wiedereinstieg** (vor allem für Erwachsene): ein klassenübergreifender Gang von Klasse 5 bis zur höchsten vorhandenen Klasse, adaptiv; Ergebnis „Dein Stand entspricht etwa Klasse …“ mit Empfehlung, wo es weitergeht | Entschieden (28.10.2026, Projektverantwortlicher). *Umgesetzt:* In „Wo stehe ich?“ die Wahl „Alles ab Klasse 5 – für den Wiedereinstieg“ (für Erwachsene vorgewählt); derselbe adaptive Gang über alle Kompetenzen mit Aufgaben, höchstens 30 Aufgaben. `standKlasse` in `src/core/learning/diagnose.ts`: die höchste Klasse, bis zu der in jeder Klasse mindestens 70 % der entschiedenen Themen sitzen; danach „Themen zeigen: Klasse …“ |
| L-17 | **Klasse pflegen:** Kind (Übersicht) und Eltern (Elternbereich) können Klasse und Schulart ändern, protokolliert mit „durch wen“. **Schuljahreswechsel:** beim ersten Öffnen ab 1. August einmal fragen „Neues Schuljahr – welche Klasse?“, Vorschlag Klasse + 1, gleiche Klasse ohne Kommentar möglich; danach wird „Gerade dran“ geleert. Kein Timer (R2) | Entschieden (28.10.2026, Projektverantwortlicher). *Umgesetzt:* Klasse und Schulart auch im Elternbereich (protokolliert als „Eltern“); Frage „Neues Schuljahr!“ auf der Startseite (`src/ui/ueben/Schuljahr.svelte`, Einstellung `lernen.schuljahr`), nicht bei „Ich bin erwachsen“ und nicht, solange nie eine Klasse gewählt wurde |
| L-18 | **Gerade in der Schule dran:** Lernbereiche aus dem Lehrplan der eigenen Klasse und Schulart wählen und darin einzelne Themen ab- oder zuwählen; diese Themen stehen in der Übersicht oben und kommen beim Üben öfter dran | Entschieden (28.10.2026, Projektverantwortlicher). *Umgesetzt:* `src/core/learning/gerade-dran.ts` und `src/ui/ueben/GeradeDran.svelte` in der Übersicht (mit Schulart nach Lernbereichen des Lehrplans, auch Vorgezogenes in der richtigen Klasse; ohne Schulart nach Lernfeldern), Einstellung `lernen.gerade-dran`, beim Schuljahreswechsel geleert. *Offen:* „öfter dran“ beim Wiederholen |
| L-19 | **Klassenarbeit vorbereiten:** Termin und Themen eintragen (die App plant passende Wiederholungen, ohne Countdown-Druck) und eine Probe-Klassenarbeit (gemischt, ohne Hilfen, danach „Das sitzt / Das noch üben“). Die Belagerung (Phase 4) baut später darauf auf | Entschieden (28.10.2026, Projektverantwortlicher). *Umgesetzt:* `src/core/learning/klassenarbeit.ts` und `src/ui/ueben/Klassenarbeit.svelte` (Knopf „Klassenarbeit“ auf der Startseite). Termin und Themen werden in der Einstellung `lernen.klassenarbeit` gespeichert. Die Themen sind mit „Gerade dran“ vorbelegt. Nach dem Termin ist die Klassenarbeit vorbei. Die Startseite zeigt nur das Datum, ohne Countdown. „Das solltest du noch üben“ listet zuerst neue Themen und Themen in Arbeit, dann „auffrischen“, dann gekonnte. Die Probe-Klassenarbeit ist eine Diagnose genau dieser Themen im Modus `pruefung` (ohne Hilfen und ohne Note). Ihr Ergebnis heißt „Das noch üben“. Falsche Antworten kommen in die Fehlerwerkstatt. *Offen:* Wiederholungen bis zum Termin planen |
| L-20 | **Idee (gemerkt, noch nicht entschieden): Prüfungen entwerfen.** Auf Knopfdruck realistische Übungen, Kurzkontrollen, Leistungskontrollen, Klassenarbeiten, Klausuren und Prüfungen erstellen. Das soll für alle Klassenstufen und Kurse gehen (Grund- und Leistungskurs) und für Lehrkräfte wie für Schülerinnen und Schüler. Ziel ist zum Beispiel „Abiturprüfung Mathematik LK Sachsen 2028“: im Aufbau und Stil der echten Prüfung, aus den Generatoren, mit Lösungen, Lösungswegen, Hilfen und Erklärungen. Alles soll sich auch drucken lassen (Aufgabenblatt und Lösungsblatt getrennt). Ein Timer ist optional. | Idee des Projektverantwortlichen (29.10.2026). **Seit 29.10.2026 Ziel (K-25):** Maßstab Abitur 2029 GK und LK; Anforderungen in `VERMITTLUNG.md` §6. Punkt (5) ist durch K-26 ersetzt (Noten nur auf Wunsch). Baut auf L-19 (Probe-Klassenarbeit) und der Belagerung (Phase 4) auf; braucht die Inhalte bis Klasse 12 (K-20). Vor der Umsetzung klären: (1) Der Timer widerspricht R2 (keine Echtzeit-Timer). Es braucht eine Ausnahme nur für den Prüfungsmodus, freiwillig und ohne Folgen für die Bastion – sonst entfällt er. (2) Die echte Prüfung eines künftigen Jahrgangs ist unbekannt. Es entsteht ein Entwurf im Stil der veröffentlichten Prüfungen und Vorgaben (Aufbau, Teile, Hilfsmittel, Bewertungseinheiten), keine Kopie geschützter Aufgaben. (3) Druckansicht ohne Netz (CSS für den Druck, keine externe PDF-Bibliothek ohne Eintrag in ARCHITEKTUR). (4) Lehrkräfte ohne Konto: Erstellen und Drucken geht lokal; Weitergabe nur als Datei. (5) Bewertung: Punkte oder Notenschlüssel nur im Prüfungsmodus und nur auf Papier oder für Lehrkräfte – nicht in der Bastion (kein Druck, R-Regeln). |
| L-21 | **Grundkurs und Leistungskurs teilen sich die Kompetenzen** (§8g): LK-Anteile stehen auf Niveau E; eine eigene Kompetenz mit „(LK)“ nur, wo der Stoff im GK gar nicht vorkommt. Klasse 9/10 gilt für Gymnasium und Oberschule, der Oberschul-Stoff ist in der Spalte *Sachsen* gekennzeichnet | Entschieden (02.11.2026, Projektverantwortlicher, `KLASSE-9-12.md` Entscheidungen 1 und 2) |
| L-22 | **Niveaus für Lernende unsichtbar, automatisch je Kompetenz** (§4.1): hoch nach „gekonnt“ auf dem aktuellen Niveau, runter nach 3 misslungenen Aufgaben nacheinander, still. Sichtbar nur für Eltern, im Bericht für die Lehrkraft und beim Aufgabenblatt bzw. bei Prüfungen | Entschieden (02.11.2026, Projektverantwortlicher); umgesetzt 02.11.2026 (`src/core/learning/niveau-wahl.ts`) |
