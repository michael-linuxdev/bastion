# Bastion – Gesamtkonzept

Status: v0.4 · Stand: 29.10.2026 · Bezug: `VISION.md` v1.0

> **Neue Ausrichtung (K-23 bis K-28):** Bastion wird Unterrichtsersatz ohne KI. §0 fasst die Folgen zusammen. Die übrigen Abschnitte gelten weiter, soweit sie nicht widersprechen. Bei Widerspruch gelten `VISION.md` v1.0 und `VERMITTLUNG.md`. Eine vollständige Überarbeitung folgt mit dem Pilot.
Detailtiefe: Überblick. Technik in `ARCHITEKTUR.md`; Basebau in `BASEBAU.md`, Kompetenzmodell in `LEHRPLAN.md`, Roadmap in `PLAN.md`.

---

## 0. Unterrichtsersatz: die vier Kernaufgaben

Jede Funktion dient mindestens einer der vier Kernaufgaben einer Lehrkraft (K-24, `VISION.md` §3). Sie sind die Qualitätskriterien des ganzen Konzepts:

| Kernaufgabe | Bausteine (bestehend und neu) | Wo beschrieben |
|---|---|---|
| 1 Vermitteln | **neu:** Erstvermittlung je Kompetenz mit Verzweigungen und interaktiven Werkzeugen | `VERMITTLUNG.md` §2 |
| 2 Diagnostizieren & Erklären | Fehlerbilder (I-7), **neu:** Fehlerkataloge mit Fehlvorstellungen, Diagnose nach Regeln, Rückwege in die Vermittlung | `VERMITTLUNG.md` §3 |
| 3 Üben & Festigen | Generatoren, Hilfen, Lösungswege, Fehlerwerkstatt, FSRS (§3) | `INHALTSFORMAT.md`, `LEHRPLAN.md` §6 |
| 4 Steuern & Bewerten | Kompetenzgraph, Diagnose „Wo stehe ich?“, Klassenarbeit (L-19), **neu:** Prüfungen auf Knopfdruck bis zum Abitur (K-25), Noten nur auf Wunsch (K-26) | `LEHRPLAN.md` §7, `VERMITTLUNG.md` §6 |

Folgen für dieses Dokument:

- §3.2 bekommt einen neuen ersten Lernmodus **Vermitteln** (vor Üben).
- §5 (Basebau) ist Nebensache (K-27); die Belagerungen (§5.4) gehen in den Prüfungen auf Knopfdruck auf.
- §7 (Portfolio) wird Teil von Kernaufgabe 4: Leistungsnachweise lokal und exportierbar.
- Variante B (Klassen, Lehrkräfte) ist gesperrt bis zur Schwelle in `STRATEGIE.md` §0.

## 1. Systemüberblick

Bastion besteht aus fünf Säulen, die klar getrennt sind und über definierte Schnittstellen zusammenarbeiten:

```
┌──────────────────────────────────────────────────────────┐
│                    ELTERNBEREICH (PIN)                   │
│        Zeitbudget · Berichte · Einstellungen · Export    │
└──────────────────────────────────────────────────────────┘
┌───────────────┐   Lern-   ┌───────────────┐   Ressourcen  ┌──────────────┐
│ KOMPETENZ-    │ ereignisse│  LERNKERN     │  (Ledger)     │  BASTION     │
│ MODELL        │──────────▶│  Aufgaben,    │──────────────▶│  Basebau     │
│ (Inhalte,     │           │  Kartei, SRS, │               │  (optional)  │
│  Niveaus)     │◀──────────│  Diagnose     │               │              │
└───────────────┘ Fortschritt└──────┬────────┘               └──────────────┘
                                    │
                             ┌──────▼────────┐
                             │ PORTFOLIO     │
                             │ (Nachweise)   │
                             └───────────────┘
```

**Entscheidung K-1:** Der Basebau liest nur aus einem **Ressourcen-Ledger** (Buchungsjournal). Er kennt keine Aufgaben, keine Fächer, keine Antworten.
*Warum:* So bleibt der Basebau abschaltbar (R7), der Lernkern bleibt pädagogisch unabhängig, und Balancing-Änderungen berühren nie die Lerndaten.

## 2. Nutzerreise (Kernschleife)

1. **Ankommen.** Die App zeigt: Was steht heute an? (fällige Wiederholungen, aktuelles Lernziel, ggf. nächste Klassenarbeit)
2. **Lernen.** Eine Sitzung = 1–3 kurze Einheiten (5–15 Min.). Klar begrenzt.
3. **Abschluss.** Rückmeldung: Was hast du heute gekonnt? Welche Ressourcen sind entstanden – und *warum*?
4. **Bauen (optional).** Ressourcen in die Bastion investieren, Bauvorhaben voranbringen.
5. **Pause.** Die App schlägt aktiv das Ende vor (R5).

Langfristige Schleife: Wochen → Kompetenz-Meilensteine → neue Baupläne. Schuljahre → neue Bastion-Epochen (siehe 5.5).

## 3. Lernkern

### 3.1 Aufgabentypen
- Geschlossene Aufgaben (Auswahl, Zuordnung, Lückentext, Zahl/Term-Eingabe)
- Parametrisierte Generatoren (v. a. Mathematik, Physik, Chemie-Rechnungen) – unendliche Varianten offline
- Lernkartei mit Spaced Repetition (Weiterentwicklung aus Lerninsel)
- Mehrschrittige Aufgaben mit Teilschritt-Feedback
- Selbsteinschätzung + Musterlösung für offene Aufgaben (Textproduktion, Erörterung). *Bastion bewertet keine Freitexte automatisch* – Begründung in Abschnitt 9, Entscheidung O-6.

### 3.2 Lernmodi
| Modus | Zweck |
|---|---|
| **Vermitteln** (neu, K-24) | Erstvermittlung einer Kompetenz, bevor geübt wird (`VERMITTLUNG.md` §2) |
| **Üben** | Neues festigen, adaptiv nach Niveau |
| **Wiederholen** | Fällige Karten/Kompetenzen (SRS) |
| **Diagnose** | Einstiegs- und Zwischenstandsbestimmung, ohne Ressourcenertrag-Druck |
| **Prüfungsvorbereitung** | Klassenarbeit, ESA/MSA, Abitur, Berufsabschluss – mit Zeitrahmen und Themenplan |
| **Fehlerwerkstatt** | Alte Fehler gezielt aufarbeiten (R6) |

### 3.3 Adaptivität
Niveau wird pro Kompetenz geführt, nicht pro Person. Eine Gesamtschülerin kann in Mathematik erweitert und in Englisch grundlegend arbeiten. Kein Schüler wird global „eingestuft“.

## 4. Kompetenzmodell (Überblick)

Details in `LEHRPLAN.md`. Grundarchitektur:

- **Rückgrat:** KMK-Bildungsstandards (für die Abschlüsse ESA, MSA und Allgemeine Hochschulreife in den Kernfächern) und KMK-Rahmenlehrpläne mit Lernfeldern für die berufliche Bildung.
- **Mapping-Schicht:** Landeslehrpläne (16 Bundesländer) werden als *Zuordnung* auf das Rückgrat gelegt, nicht als eigene Inhaltsbäume.
- **Niveaustufen:** drei Stufen pro Kompetenz, Arbeitstitel *grundlegend – mittel – erweitert*. Anschlussfähig an die Niveaudifferenzierung mehrerer Länder.
- **Überfachliche Kompetenzen:** Lernstrategien, Textverständnis, Medienkompetenz, Selbstorganisation – eigene Kategorie, fachübergreifend gespeist.

**Entscheidung K-2:** Kompetenzen sind die Grundeinheit, nicht Kapitel oder Schulbuchseiten.
*Warum:* Schulformen, Länder und Schulbücher unterscheiden sich in der Reihenfolge, kaum in den Zielkompetenzen. Ein Kompetenzgraph skaliert über alle Schulformen; Kapitelstrukturen nicht.

## 5. Bastion – Basebau (Überblick)

Ausarbeitung mit Zahlen und Balancing in `BASEBAU.md` – bei Abweichungen gilt `BASEBAU.md`. Hier die tragenden Mechaniken.

### 5.1 Ressourcen – drei Klassen, drei Lernqualitäten

| Ressource (Arbeitstitel) | Entsteht durch | Lernbedeutung | Begrenzung |
|---|---|---|---|
| **Stein** | Üben, bearbeitete Aufgaben | Fleiß, Volumen | Abnehmender Ertrag pro Tag (Tageskurve) |
| **Erz** | Bestandene Wiederholungen nach Abstand (SRS), korrigierte Fehler | Behalten, Festigung | Natürlich begrenzt durch Fälligkeit – nicht farmbar |
| **Baupläne** | Erreichte Kompetenz-Meilensteine, bestandene Prüfungssimulationen | Echte Kompetenz | Einmalig pro Meilenstein |

*Warum drei Klassen:* Würde nur Menge belohnt, optimieren Jugendliche auf leichte Aufgaben. Erz koppelt den Fortschritt an **Behalten**, Baupläne an **Kompetenz**. Hochwertige Gebäude brauchen alle drei – der Ressourcenmix erzwingt sanft gutes Lernverhalten, ohne es vorzuschreiben.

Wichtig: Ressourcen sind **fachneutral**. Wer in Mathe stark ist, kann trotzdem überall bauen.
*Kritische Gegenfrage (offen, O-3):* Sollen bestimmte Gebäude fachgebundene Baupläne brauchen, damit die Bastion das Kompetenzprofil abbildet? Pro: Spiegelfunktion. Contra: Bestraft Schwächen sichtbar. Vorschlag: Fachgebundenheit nur für **Zierde und Spezialisierung**, nie für Kernfunktionen.

### 5.2 Bauen ohne Uhr
Bauvorhaben haben eine **Bauzeit in Lerneinheiten** statt in Stunden (technisch: *Bauschritte*, höchstens 2 pro Tag, siehe BASEBAU §3.4). Ein Turm braucht z. B. „4 abgeschlossene Sitzungen“. So entsteht Vorfreude und Planung wie in Base-Buildern, aber jeder Fortschritt ist an Lernen gebunden und niemand wird zu Uhrzeiten zurückgerufen (R2).

### 5.3 Gebäudefamilien (erste Skizze)
| Familie | Beispiel | Funktion |
|---|---|---|
| **Kern** | Bergfried | Bestimmt die Ausbaustufe der Bastion |
| **Wissen** | Studierstube, später Bibliothek, Observatorium, Labor, Archiv, Werkstatt, Hafen (Sprachen) | Spiegel des Kompetenzprofils; schalten **keine** Lernfunktionen frei (B-2) |
| **Verteidigung** | Mauern, Türme, Tore | Relevant für Belagerungen (5.4) |
| **Bau** | Zimmerei | Mehrere Bauvorhaben gleichzeitig |
| **Zierde** | Banner, Gärten, Statuen | Reiner Ausdruck, Identität |

Versorgungsgebäude und Lagergrenzen wurden gestrichen (B-1, siehe `BASEBAU.md`).

**Entscheidung K-3:** Keine passive Ressourcenproduktion.
*Warum:* Passive Produktion belohnt Nicht-Lernen und erzeugt „Einsammel“-Zwang. Versorgungsgebäude erhöhen Kapazität oder Komfort, nie Ertrag ohne Lernen.

### 5.4 Belagerungen = Prüfungssimulationen (PvE)
Die Bastion wird nie angegriffen, während man weg ist. Stattdessen kann der Nutzer **freiwillig eine Belagerung annehmen**: eine zeitlich gerahmte, gemischte Aufgabenserie zu einem Themenpaket – faktisch eine Klassenarbeits- oder Prüfungsprobe. Die Verteidigungsanlagen geben kleine Hilfen (z. B. ein Hinweis-Joker pro Turm-Stufe).

- Bestanden → Baupläne, Trophäe in der Bastion.
- Nicht bestanden → **kein Verlust**, stattdessen Fehlerwerkstatt-Paket und Hinweis, was fehlt.

*Warum:* Das ist der stärkste Punkt des Konzepts: Das Spannendste am Spiel ist zugleich die pädagogisch wertvollste Übung (Prüfungssimulation unter realistischen Bedingungen).
*Kritisch zu prüfen:* Hilfen durch Türme dürfen Prüfungsergebnisse nicht verfälschen. Vorschlag: Belagerungen haben einen „Ernstfall“-Modus ohne Hilfen, der für das Portfolio zählt.

### 5.5 Epochen – langfristige Struktur
Die Bastion durchläuft Epochen, gekoppelt an Bildungsabschnitte (z. B. Außenposten → Burg → Festung → Zitadelle). Mit jeder Epoche ändern sich Optik, Bauplätze und Ästhetik – passend zum Älterwerden der Nutzer. Ein 17-Jähriger soll nicht in einer Bastion sitzen, die wie für 11-Jährige aussieht.

*Offen (O-4):* Epochen an Klassenstufe koppeln oder an erreichte Kompetenz? Tendenz: Kompetenz, mit optischer Altersanpassung unabhängig davon.

### 5.6 Anti-Grind-Mechaniken
- Tageskurve für Stein (z. B. volle Ausbeute in den ersten ~30 Min., danach stark abnehmend).
- Erz nur aus fälligen Wiederholungen – nicht vorziehbar.
- Wiederholte gleiche Aufgaben bringen nichts.
- Keine Belohnung für Login-Tage, keine Streaks. *Wochenrückblick* statt Streak.

## 6. Zeitsystem „Erst lernen, dann …“

Aus der Lerninsel übernommen, aber altersgestuft:

| Stufe | Typisch | Steuerung |
|---|---|---|
| **Begleitet** | Kl. 5–7 | Eltern legen Lern-/Bauzeitverhältnis und Tagesgrenzen fest |
| **Vereinbart** | Kl. 8–10 | Jugendlicher schlägt Plan vor, Eltern bestätigen per PIN |
| **Selbstverwaltet** | Oberstufe, Ausbildung, volljährig | Jugendlicher steuert selbst; Elternbereich optional oder deaktiviert |

**Entscheidung K-4:** Elternrechte nehmen mit dem Alter ab; ab Volljährigkeit hat ausschließlich der Nutzer Zugriff auf seine Daten.
*Warum:* Ein Kontrollinstrument, das für 11-Jährige passt, wird von 16-Jährigen umgangen oder abgelehnt – und ist bei Volljährigen rechtlich und ethisch nicht vertretbar. Die Stufen wechseln nur einvernehmlich (Eltern-PIN) bzw. bei Volljährigkeit durch den Nutzer.

## 7. Kompetenzportfolio

- Zeigt nachgewiesene Kompetenzen mit Niveau, Datum und Nachweisart (Übung, Wiederholung, Prüfungssimulation).
- Gehört dem Nutzer, liegt lokal, Export als PDF/Datei nur auf Nutzer-Aktion.
- Formuliert in **Kann-Sätzen** („Ich kann lineare Gleichungssysteme mit zwei Variablen lösen“).
- Für berufsbildende Schulen: Bezug zu Lernfeldern, nutzbar in Bewerbungskontexten.
- Ehrlichkeitsregel: Das Portfolio zeigt nur, was im „Ernstfall“-Modus (ohne Hilfen) nachgewiesen wurde.

## 8. Mehrsprachigkeit & DaZ

- **Hilfesprache:** Aufgabenstellungen und Erklärungen zuschaltbar in Herkunftssprachen; Fachbegriffe bleiben deutsch mit Glossar.
- **DaZ-Pfad:** Eigener Kompetenzstrang für Bildungs- und Fachsprache (Operatoren wie „erläutere“, „begründe“, „erörtere“; Fachwortschatz pro Fach; Textverständnis).
- **Operatoren-Training** ist auch für Muttersprachler wertvoll und wird fachübergreifend angeboten.
- Ressourcen aus dem DaZ-Pfad zählen vollwertig – Spracharbeit ist Lernen, nicht Vorstufe.

## 9. Fokus-Hilfen und Barrierearmut

- Reizarmer Modus (keine Animationen, reduzierte Farben)
- Kurzeinheiten (5 Min.), klare Fortschrittsanzeige innerhalb der Einheit
- Vorlesefunktion (Text-to-Speech, offline wo möglich)
- Legasthenie-freundliche Darstellung (Schrift, Zeilenabstand)
- Bedienbarkeit per Tastatur, ausreichende Kontraste

*Zu O-6 (Freitextbewertung):* Automatische Bewertung offener Antworten würde entweder Cloud-KI erfordern (verletzt Prinzip 3) oder ein schwaches lokales Modell, das Jugendliche unfair bewertet. Daher: strukturierte Selbsteinschätzung mit Kriterienraster und Musterlösung. Neu bewerten, sobald lokale Modelle zuverlässig auf Endgeräten laufen.

## 10. Elternbereich

- PIN-geschützt, wie Lerninsel.
- Standard: Berichte auf **Kompetenzebene** („Bruchrechnung: gefestigt“) und Wochenzusammenfassung. Eine ausführliche Ansicht mit einzelnen Aufgaben gibt es auf Wunsch (D-14, DATENMODELL §5.2).
- Einstellungen: Zeitsystem-Stufe, Tagesgrenzen, Basebau an/aus, Hilfesprache.
- Jugendliche sehen immer, was Eltern sehen können (Transparenzprinzip).

## 11. Technik (Kurzfassung)

Vollständig in `ARCHITEKTUR.md`. Kernpunkte:

- Progressive Web App, offline-first; Stack neu gedacht, unabhängig von der Lerninsel (T-1).
- Framework-freier TypeScript-Kern, Oberfläche in Svelte 5, Bastion-Darstellung mit PixiJS nur bei aktivem Basebau (T-2, T-3, T-6).
- Lokale Daten in IndexedDB (Dexie), ereignisbasiert: Lernereignisse und Ressourcen-Ledger sind append-only, mit Herkunft und Regelversion (T-4, T-7).
- Wiederholung nach FSRS (T-5); Inhalte als validierte, nachladbare Datenpakete (T-8).
- QR-Transfer und verschlüsselter Datei-Export; Erinnerung an Sicherungen wegen möglicher Speicherlöschung durch Browser.
- **Manipulation:** Lokale Daten sind veränderbar. Wir akzeptieren das bewusst – ohne Ranglisten gibt es keinen Anreiz und keinen Schaden für Dritte. Prüfbarkeit exportierter Portfolio-Nachweise bleibt offen (O-7).

## 12. Projektrealität: Ein-Personen-Projekt

Bastion wird von **einer Person** entwickelt. Das ist keine Randbedingung, sondern die wichtigste Planungsgröße. Das Projektziel (Klasse 5–13, alle Schulformen, berufsbildende Schulen) bleibt die Vision. Die Roadmap wird aber so geschnitten, dass jede Phase allein leistbar und für sich wertvoll ist.

### 12.1 Konsequenzen

**Entscheidung K-6: Tiefe vor Breite.** Ein Fach wird über mehrere Klassenstufen gut gemacht, bevor ein zweites beginnt. *Geschärft durch K-15:* Innerhalb des Fachs wird eine Klassenstufe abgeschlossen, bevor die nächste beginnt (`STRATEGIE.md` §2).
*Warum:* Zehn halbfertige Fächer helfen niemandem. Ein Fach, das von Klasse 5 bis zum MSA trägt, ist für echte Jugendliche nützlich und beweist das Konzept.

**Entscheidung K-7: Mathematik zuerst.**
*Warum:* Mathematik ist das Fach, in dem parametrisierte Generatoren am meisten Inhalt pro Arbeitsstunde liefern. Ein guter Generator für Bruchrechnung ersetzt hunderte handgeschriebene Aufgaben – auf drei Niveaus. Für eine Einzelperson ist das der einzige skalierbare Einstieg.

**Entscheidung K-8: Oberstufe und berufliche Bildung wandern in den Horizont.** *(Für Mathematik aufgehoben am 27.10.2026: Die Oberstufe gehört von Anfang an zur Zielgruppe, K-11. Für berufliche Bildung gilt K-8 weiter.)* Sie bleiben Teil der Vision und der Architektur (Kompetenzgraph, Lernfelder sind vorgesehen), haben aber keinen Termin in der Roadmap.
*Warum:* Beides ist inhaltlich so umfangreich, dass es allein nicht seriös zu leisten ist. Ehrlich „später“ ist besser als heimlich „halb“. Wiederaufnahme, sobald es Mitwirkende gibt oder die Sek-I-Basis steht.

**Entscheidung K-9: Inhalte dürfen KI-gestützt entstehen – zur Bauzeit, nie zur Laufzeit, und nie ungeprüft.**
- KI-Werkzeuge (z. B. Claude) helfen beim Entwurf von Aufgaben, Erklärungen, Lösungswegen und Generatoren.
- **Jede Aufgabe wird vor Aufnahme in ein Paket von einem Menschen geprüft.** Das Inhaltsformat bekommt dafür ein Pflichtfeld `review: { by, date }`; der Build lehnt ungeprüfte Inhalte ab.
- Die App selbst enthält keine KI und sendet nichts an KI-Dienste (Prinzip 3 bleibt unberührt).
*Warum:* Ohne Unterstützung ist die Inhaltsmenge allein nicht zu schaffen. Ohne Prüfpflicht landen fachliche Fehler bei Jugendlichen, die der App vertrauen – das wäre pädagogisch der schwerste denkbare Fehler.

**Entscheidung K-10: Mechanik vor Grafik.** Der Basebau entsteht zuerst in der Listenansicht (ARCHITEKTUR §4.5), die grafische Bastion danach.
*Warum:* Grafik ist für eine Einzelperson der teuerste Teil des Basebaus. Ob die Mechanik motiviert, lässt sich in der Listenansicht prüfen, bevor Zeit in Grafiken fließt. Die Listenansicht wird ohnehin für Barrierefreiheit gebraucht – keine Arbeit ist umsonst.

### 12.2 Arbeitsregeln für das Ein-Personen-Projekt

- **Jede Phase endet mit etwas Nutzbarem.** Keine Phase, die nur Vorarbeit für eine spätere ist.
- **Testjugendliche sind Pflicht.** 3–5 Jugendliche aus dem Umfeld pro Phase, möglichst aus unterschiedlichen Schulformen. Ohne Tests keine Phasenfreigabe.
- **Kein Termindruck in der Roadmap.** Phasen haben Prüfkriterien, keine Daten. Das Projekt soll dieselben Prinzipien leben, die es Jugendlichen verspricht: kein Verfall durch Pausen.
- **`SESSION-PROMPT.md` als Übergabe an das zukünftige Ich** (und an Claude): Was ist der Stand, was ist der nächste Schritt?

## 13. Phasen-Roadmap (Ein-Personen-Zuschnitt)

Detailplanung in `PLAN.md`.

*Seit K-18 (28.10.2026) entsteht Epoche 1 vollständig mit Grafik vor Klasse 7 (`BASEBAU.md` §11); die folgende Phasentabelle bleibt als ursprüngliche Planung stehen.*

**Fokus bis Monat 12 (K-11, K-12, `STRATEGIE.md`):** Phase 1 nur mit den Niveaus G und M; Inhalte Klassenstufe für Klassenstufe, zuerst Klasse 5 vollständig (K-15). Danach ein **Basebau-Minimum** (Phase 2a) als Versuchsaufbau. Phase 2 vollständig und Phase 3 erst, wenn Jugendliche den Lernkern als besser als ihr bisheriges Üben beschreiben. Phasen 4–6 liegen jenseits von Monat 12.

| Phase | Inhalt | Bewusst nicht enthalten | Prüfkriterium |
|---|---|---|---|
| **0 – Fundament** | `BASEBAU.md`, Kompetenzmodell-Ausschnitt Mathe 5/6, `PLAN.md`, `SESSION-PROMPT.md`; Repo-Gerüst, Build, Tests, Leistungsmessung | Code für Funktionen | Dokumente widerspruchsfrei, Gerüst läuft offline |
| **1 – Lern-MVP** | Mathe Kl. 5–6, 3–4 Kompetenzbereiche, generatorbasiert, Niveaus G und M (E später, K-11); Üben, Wiederholen (FSRS), Diagnose; Elternbereich (Stufe „begleitet“); Datei-Export/Import | Basebau, QR, weitere Fächer, Hilfesprache | Testjugendliche lernen messbar (Wiederholungserfolg) und verstehen die App ohne Hilfe |
| **2a – Basebau-Minimum** | Ledger sichtbar, Listenansicht, 1–2 Gebäude Epoche 1, Basebau-Schalter | Simulator, Grafik, weitere Gebäude | Verbindung „Lernen → Ressource → Bauen“ wird verstanden; Lernqualität sinkt nicht |
| **2 – Bastion-Mechanik** | Ledger, drei Ressourcen, ~6 Gebäude, Bauen in Lerneinheiten, Listenansicht, Basebau-Schalter, Balancing-Simulator | Grafische Bastion, Belagerungen | Simulator zeigt: Farmen lohnt nicht, Pausen schaden nicht. Tests: Lernqualität sinkt mit Basebau nicht |
| **3 – Bastion sichtbar** | Grafische Ansicht (PixiJS), Epoche 1, QR-Transfer | Weitere Epochen | Jugendliche wollen ihre Bastion zeigen |
| **4 – Mathe Sek I** | Mathe Kl. 7–10, Belagerungen als Prüfungssimulation, ESA/MSA-Vorbereitung Mathe | Weitere Fächer | Hauptschul- *und* Gymnasiums-Testpersonen nutzen es für echte Klassenarbeiten |
| **5 – Sprache** | Operatoren-Training (fachübergreifend), DaZ-Pfad Fachsprache Mathe, Hilfesprache für Oberfläche und Mathe-Erklärungen in 2–3 Sprachen | Volle Mehrsprachigkeit aller Inhalte | DaZ-Testpersonen kommen ohne Übersetzungshilfe von außen zurecht |
| **6 – Zweites Fach + Portfolio** | Englisch *oder* Deutsch (O-12), Kompetenzportfolio, Stufen „vereinbart“ und „selbstverwaltet“ | — | Portfolio wird freiwillig gezeigt |
| **Horizont** | Oberstufe/Abitur, berufliche Bildung, Naturwissenschaften, Lehrkräfte-Pakete, App-Stores | — | Nur mit Mitwirkenden oder belegter Nachfrage |

**Entscheidung K-5 (bestätigt):** Phase 1 enthält keinen Basebau.

*Bewusste Spannung zum Projektziel:* DaZ und Hilfesprache sind Grundprinzipien, kommen aber erst in Phase 5. Das ist ein Kompromiss, kein Abrücken. Abfederung ab Phase 1: einfache Sprache in allen Aufgabentexten, Fachbegriffe mit Erklärung, RTL-fähiges Layout von Anfang an.

## 14. Risiken (ehrlich)

| Risiko | Einschätzung | Gegenmaßnahme |
|---|---|---|
| **Inhaltsmenge** | Größtes Risiko, für eine Person verschärft | K-6, K-7, K-9: Tiefe vor Breite, Generatoren, KI-Entwurf mit Prüfpflicht |
| **Überlastung des Entwicklers** | Hoch; Ein-Personen-Projekte scheitern selten an Technik, oft an Erschöpfung | Kleine Phasen, kein Termindruck, jede Phase für sich nutzbar |
| **Fachliche Fehler in KI-entworfenen Inhalten** | Mittel bis hoch | Prüfpflicht im Build; Fehlermeldefunktion in der App (lokal, Export auf Wunsch) |
| **Korrumpierungseffekt** – äußere Belohnung verdrängt innere Motivation | Real | Basebau abschaltbar; Belohnung an Kompetenz; Phase 2 prüft Lernqualität mit und ohne Basebau |
| **Altersspanne 10–19** | Hoch – seit K-11 (Sachsen, Kl. 5–12 von Anfang an) nicht mehr entschärft | Ton und Optik von Anfang an altersneutral, nicht kindlich; Elternstufe „selbstverwaltet“; Altersoptik der Epochen bleibt Konzept |
| **Grafik ohne Grafiker** | Mittel | K-10; freie Grafikpakete oder bewusst schlichter Stil (O-11) |
| **Basebau ohne Timer wird langweilig** | Mittel | Tiefe durch Planung, Spezialisierung, Belagerungen |
| **Bus-Faktor 1** | Hoch für Nutzer mit Langzeit-Bastionen | Offene Formate, offener Code (O-8), Dokumentation, Export jederzeit möglich |

## 15. Offene Entscheidungen

| ID | Frage | Optionen | Tendenz | Wann |
|---|---|---|---|---|
| O-1 | Tech-Stack | Fortführen / Neuaufbau | **Entschieden: Neuaufbau**, siehe `ARCHITEKTUR.md` | — |
| O-2 | Woher kommen Inhalte? | Eigenproduktion / Community / OER / Mischung | **Entschieden:** Generatoren + KI-gestützte Eigenproduktion mit Prüfpflicht (K-9) + passende OER | — |
| O-3 | Fachgebundene Baupläne? | Ja / nur Zierde / nein | Nur Zierde und Spezialisierung | Phase 2 |
| O-4 | Epochen-Kopplung | Klassenstufe / Kompetenz | Kompetenz + Altersoptik | Phase 3 |
| O-5 | Rolle von Lehrkräften | Keine / Aufgabenpakete per QR / Klassen-Modus | In den Horizont verschoben | — |
| O-6 | Freitextbewertung | Selbsteinschätzung / lokale KI / keine | Selbsteinschätzung | Phase 6 |
| O-7 | Portfolio-Nachweise prüfbar machen? | Nein / lokal signiert | Zunächst nein | Phase 6 |
| O-8 | Lizenz (Code und Inhalte) | Open Source / CC-Lizenz für Inhalte / proprietär | **Entschieden:** Code AGPL-3.0, Inhalte CC BY-SA 4.0 | — |
| O-9 | Bastion einem Freund zeigen | Keine / nur lokal | Nur lokal, ohne Vergleichswerte | Phase 3 |
| O-10 | Ziel-Plattformen | Nur PWA / App-Stores | PWA, App-Stores im Horizont | — |
| O-11 | Grafikquelle | Freie Grafikpakete (z. B. CC0) / eigener schlichter Stil / Auftrag | **Entschieden (B-12):** erst eigener schlichter Stil aus dem Code, später austauschbar | — |
| O-12 | Zweites Fach | Englisch / Deutsch | Englisch (besser strukturierbar, Wortschatz eignet sich für Kartei) | Phase 6 |
| O-13 | Hosting im Produktivbetrieb | GitHub Pages / EU-Anbieter (z. B. Codeberg Pages) / eigener Webhoster | Domain festgelegt: `bastion.micana.de`. Hoster: EU-Anbieter; GitHub Pages vorerst | vor erster öffentlicher Version |

## 16. Entscheidungslog

| ID | Entscheidung | Datum | Status |
|---|---|---|---|
| K-1 | Basebau liest nur aus Ressourcen-Ledger | 27.10.2026 | Entschieden |
| K-2 | Kompetenzen als Grundeinheit | 27.10.2026 | Entschieden |
| K-3 | Keine passive Ressourcenproduktion | 27.10.2026 | Entschieden |
| K-4 | Altersgestufte Elternrechte, Selbstverwaltung ab Volljährigkeit | 27.10.2026 | Entschieden |
| K-5 | Phase 1 ohne Basebau | 27.10.2026 | Entschieden |
| K-6 | Tiefe vor Breite | 27.10.2026 | Entschieden |
| K-7 | Mathematik als erstes Fach | 27.10.2026 | Entschieden |
| K-8 | Oberstufe und berufliche Bildung in den Horizont (für Mathe-Oberstufe aufgehoben durch K-11) | 27.10.2026 | Teilweise aufgehoben |
| K-9 | KI-gestützte Inhalte nur zur Bauzeit, mit menschlicher Prüfpflicht | 27.10.2026 | Entschieden |
| K-10 | Basebau-Mechanik vor Grafik | 27.10.2026 | Entschieden |
| R1–R7 | Abgeleitete Design-Regeln (siehe VISION.md) | 27.10.2026 | Entschieden |
| O-1 | Tech-Stack wird neu gedacht | 27.10.2026 | Entschieden |
| — | Projekt wird von einer Person entwickelt; Roadmap darauf zugeschnitten | 27.10.2026 | Festgestellt |
| — | Arbeit im GitHub-Repository, kein Claude-Projekt (T-12) | 27.10.2026 | Entschieden |
| O-2 | Inhalte: Generatoren + KI-Entwürfe mit Prüfpflicht + OER | 27.10.2026 | Entschieden |
| O-8 | Lizenz: Code AGPL-3.0, Inhalte CC BY-SA 4.0 | 27.10.2026 | Entschieden |
| — | Entscheidungs-Review 0.2 abgeschlossen; alle Vorschläge bestätigt | 27.10.2026 | Entschieden |
| T-1–T-11 | Stack- und Architekturentscheidungen (siehe ARCHITEKTUR.md) | 27.10.2026 | Entschieden |
| B-1–B-10 | Basebau-Entscheidungen (siehe BASEBAU.md) | 27.10.2026 | Entschieden |
| L-1–L-8 | Kompetenzmodell-Entscheidungen (siehe LEHRPLAN.md) | 27.10.2026 | Entschieden |
| I-1–I-10 | Inhaltsformat-Entscheidungen (siehe INHALTSFORMAT.md) | 27.10.2026 | Entschieden |
| D-1–D-12 | Datenmodell-Entscheidungen (siehe DATENMODELL.md) | 27.10.2026 | Entschieden |
| K-11 | Scope bis Monat 12: Mathe in Sachsen, Kl. 5–12, alle Schularten, Niveaus G und M (siehe STRATEGIE.md) | 27.10.2026 | Entschieden |
| K-15 | Inhalte Klassenstufe für Klassenstufe, beginnend mit Klasse 5 (schärft K-6) | 27.10.2026 | Entschieden |
| K-16 | Sächsische Lehrpläne Mathematik (OS 2019, GY 2021) bindend für das MVP | 27.10.2026 | Entschieden |
| K-17 | Erst Lehrplan bis Klasse 12 aufbauen (als Entwurf), dann gesammelt prüfen und testen (ändert K-15 Punkte 2 und 4) | 28.10.2026 | Entschieden |
| K-12 | Lernkern vor Basebau; Basebau-Minimum bis Schwelle „Lernkern trägt“ | 27.10.2026 | Entschieden, Grenze aufgehoben durch K-18 (28.10.2026) |
| K-13 | Erfolgskriterien für Monat 12, keine Vanity-Metrics | 27.10.2026 | Entschieden |
| K-14 | Freiwilliges Testprotokoll als einzige Messquelle (STRATEGIE §7) | 29.10.2026 | Entschieden |
