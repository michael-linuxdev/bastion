# Bastion – Kompetenzmodell (Lehrplan)

Status: Entwurf v0.2 · Stand: 27.10.2026 · Aufgaben 0.4, 0.18
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

*Umsetzung (1a/1b):* `src/core/learning/fortschritt.ts` berechnet „neu“, „in Arbeit“ und „gekonnt“. Präzisierung: Gezählt werden die letzten 6 bearbeiteten Aufgaben (übersprungene zählen nicht); von ihnen müssen mindestens 5 ohne Hilfe richtig sein, und diese 5 müssen aus mindestens 2 Vorlagen stammen. Einmal erreicht, bleibt „gekonnt“ bestehen – ob es hält, entscheidet später die Wiederholung. „Gefestigt“ und „auffrischen“ folgen mit FSRS in Phase 1b.

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

## 9. Sprache in Aufgaben

**Entscheidung L-7:** Alle Aufgabentexte folgen ab Phase 1 Regeln für einfache, klare Sprache: kurze Sätze, eine Information pro Satz, Operatoren fett und einheitlich, keine unnötigen Nebensätze, Fachbegriffe mit Erklärung beim ersten Auftreten.
*Warum:* DaZ und Hilfesprache kommen erst in Phase 5 (KONZEPT §13). Einfache Sprache ist die Abfederung bis dahin – und hilft allen, nicht nur Jugendlichen mit DaZ. Gerade Sachaufgaben (GR.SACH) messen sonst Lesekompetenz statt Mathematik.

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
| L-3 | Niveauwechsel nur als Vorschlag | Entschieden |
| L-4 | FSRS-Karte = Aufgabenvorlage; jede Wiederholung erzeugt neue Aufgabe | Entschieden |
| L-5 | Graph empfiehlt, sperrt nicht | Entschieden |
| L-6 | Klasse 5 = alle Pflicht-Lernbereiche Kl. 5 von OS und GY zusammen (neu gefasst 27.10.2026) | Entschieden |
| L-7 | Einfache Sprache in allen Aufgaben ab Phase 1 | Entschieden |
| L-8 | Kein Länderbezug und keine Bundesland-Abfrage in Phase 1 | Ersetzt durch L-9 |
| L-9 | Lehrplanbezug Sachsen je Schulart zusätzlich zum KMK-Bezug; keine Bundesland-Abfrage | Entschieden |
| L-10 | Zeichnen und Konstruieren werden erklärt, geprüft wird nur das Prüfbare; kein freies Zeichnen in der App | Entschieden |
| L-11 | Wahlbereiche der Lehrpläne zählen nicht zu den Abschlusskriterien einer Klassenstufe | Entschieden |
