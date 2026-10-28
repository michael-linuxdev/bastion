# Bastion – Strategie für die nächsten 12 Monate

Status: v0.1 · Stand: 27.10.2026 · Überprüfung: Oktober 2027 (Monat 12)
Bezug: `VISION.md` (Prinzipien), `PLAN.md` (Aufgaben), `WETTBEWERB.md` (Vergleich), `TESTS.md` (Realitätstests)

---

## 1. Oberstes Ziel

> Nach 12 Monaten gibt es eine klar abgegrenzte Zielgruppe, für die Bastion spürbar besser ist als die Alternativen – und die es tatsächlich über Monate hinweg nutzt.

Alles in diesem Dokument dient diesem einen Ziel. Was nicht dazu beiträgt, wird verschoben (`PLAN.md` §2, „Nicht-Ziele bis Monat 12“).

**Zeithorizont und Prinzip „kein Termindruck“ (KONZEPT §12.2):** Die 12 Monate sind ein **Überprüfungszeitpunkt**, kein Abgabetermin. Phasen behalten Prüfkriterien statt Daten. Im Oktober 2027 wird ehrlich gemessen (§6) und entschieden, wie es weitergeht.

## 2. Phase A – Fokus-Entscheidung

**Entscheidung K-11: Verbindliche Scope-Grenze bis Monat 12.** *(Am 27.10.2026 zweimal geändert: zuerst Klassenstufen 5–13 statt 5–6, dann Start in **Sachsen** mit Klassenstufen 5–12.)*

| | Im Scope | Ausdrücklich später |
|---|---|---|
| **Fach** | Mathematik | alle anderen Fächer |
| **Bundesland** | **Sachsen** | andere Länder (der KMK-Bezug bleibt Grundlage, `LEHRPLAN.md` §5) |
| **Klassenstufen** | **5–12** von Anfang an | berufliche Bildung (Berufliches Gymnasium, Fachoberschule, Berufsschule) |
| **Schularten** | alle allgemeinbildenden: Oberschule (Haupt- und Realschulbildungsgang), Gymnasium, Gemeinschaftsschule/Oberschule+, Förderschulen | – |
| **Niveaus** | **G** (grundlegend) und **M** (mittel) | **E** (erweitert) |
| **Inhalt** | **Klassenstufe für Klassenstufe** (K-15): erst Klasse 5 vollständig, dann Klasse 6 usw. | Inhalte einer höheren Klassenstufe, solange die laufende nicht abgeschlossen ist |

*Warum Mathe:* Generatoren liefern hier am meisten Inhalt pro Arbeitsstunde (K-7).

*Warum Sachsen, Klasse 5–12, alle Schularten:* Entscheidung des Projektverantwortlichen (27.10.2026). Bastion soll vom Start an die ganze Altersspanne ansprechen, für die es gedacht ist; eingegrenzt wird über **Fach, Bundesland und Inhalte**, nicht über das Alter. Ein Bundesland statt aller macht die Zielgruppe greifbar: ein Lehrplan je Schulart, gemeinsame Abschlussprüfungen (Hauptschulabschluss Kl. 9, Realschulabschluss Kl. 10, Abitur nach Kl. 12), erreichbare Testpersonen und Kanäle vor Ort. In Sachsen beginnt Klasse 5 bereits an der weiterführenden Schule.

*Ehrliche Folge:* Für eine Person ist Mathe 5–12 inhaltlich nicht in 12 Monaten abzudecken. Breite Zielgruppe heißt deshalb **nicht** breite Inhalte zum Start: Die Inhalte wachsen Klassenstufe für Klassenstufe, und die Diagnose führt jede Person zu den Grundlagen, die bei ihr wackeln – auch eine Neuntklässlerin zu den Brüchen. Bis höhere Klassenstufen gefüllt sind, ist Bastion für Ältere ein Werkzeug, um Lücken aus den unteren Klassen zu schließen. Altersgerechte Gestaltung (Ton, Optik, Elternbereich) muss dafür von Anfang an für 10- bis 18-Jährige passen (KONZEPT §14, Risiko „Altersspanne“).

*Warum G und M, nicht E:* Die Zielgruppe sind **Jugendliche, die in Mathe nicht zu den Stärksten gehören** – unabhängig von der Schulform. Für sie ist der Abstand zu den bestehenden Angeboten am größten (`WETTBEWERB.md`): Sie brauchen gezielte Rückmeldung auf ihre Fehler und Wiederholung, bis es sitzt – nicht mehr Knobelaufgaben. E ist zudem das teuerste Niveau (Begründen, Fehler analysieren, ungewohnte Darstellungen) und für Generatoren am schwersten.

*Was das für die Daten heißt:* Das Datenmodell behält `'E'` als möglichen Wert (DATENMODELL §4.1). E wird nur nicht mit Inhalten gefüllt. Ein späterer Ausbau braucht keine Migration.

**Entscheidung K-15: Tiefe vor Breite – Klassenstufe für Klassenstufe.** *(27.10.2026, ersetzt die bisherige Reihenfolge in Wellen nach Themen)*

Die Inhalte werden **sukzessiv** aufgebaut: zuerst **Klasse 5** vollständig, erst danach Klasse 6, dann 7 usw. Das schärft K-6 („Tiefe vor Breite“) auf Klassenstufen zu.

**Was „Klasse 5“ umfasst:** alle Pflicht-Lernbereiche der sächsischen Lehrpläne Mathematik für Klasse 5 – Oberschule und Gymnasium zusammengenommen. Liegt ein Inhalt an einer Schulart in Klasse 5 und an der anderen in Klasse 6 (z. B. Erweitern und Kürzen: Gymnasium Kl. 5, Oberschule Kl. 6), gehört er zum **früheren** Abschnitt. Die Liste steht in `LEHRPLAN.md` §8 (Aufgabe 0.18).

**Reihenfolge innerhalb einer Klassenstufe:** entlang des Kompetenzgraphen, von den Kompetenzen ohne Voraussetzungen aus.

**Eine Klassenstufe ist abgeschlossen, wenn:**
1. alle ihre Lernbereiche als Kompetenzen im Graphen stehen, mit Zuordnung zu den sächsischen Lehrplänen (L-9);
2. jede dieser Kompetenzen je Niveau G und M mindestens zwei geprüfte Vorlagen hat (INHALTSFORMAT §10.1), Generatoren mit bestandenen Pflicht-Tests;
3. Üben, Wiederholen, Fehlerwerkstatt und Diagnose für alle ihre Kompetenzen funktionieren;
4. ~~Jugendliche dieser Klassenstufe aus der Testgruppe sie genutzt haben und gemeldete fachliche Fehler behoben sind.~~ *Ausgesetzt durch K-17.*

Erst dann beginnt die Arbeit an Inhalten der nächsten Klassenstufe. *Seit K-17 genügen dafür die Punkte 1 und 3 sowie Punkt 2 ohne „geprüft“; Prüfung und Test kommen gesammelt später.*

*Warum:* Eine vollständige Klasse 5 ist für echte Jugendliche ein brauchbares Werkzeug für ein ganzes Schuljahr; zwei halbe Klassenstufen sind es nicht. Jede abgeschlossene Klassenstufe ist für sich nutzbar (KONZEPT §12.2) und ein ehrlicher Fortschritt, den man Eltern und Lehrkräften zeigen kann.

**Entscheidung K-17: Erst den Lehrplan bis Klasse 12 aufbauen, dann prüfen und testen.** *(28.10.2026, Projektverantwortlicher; ändert K-15 Punkte 2 und 4)*
- Die Klassenstufen werden weiter **nacheinander** aufgebaut (K-15 bleibt: erst 5, dann 6 …), aber eine Klassenstufe gilt schon als abgeschlossen, wenn ihre Kompetenzen im Graphen stehen, je Niveau G und M mindestens zwei Vorlagen als **Entwurf** haben (Generatoren mit bestandenen Pflicht-Tests) und Üben, Wiederholen, Fehlerwerkstatt und Diagnose für sie funktionieren.
- Die **fachliche Prüfung** der Vorlagen (INHALTSFORMAT §10.1) und die **Testrunden** mit Jugendlichen (`TESTS.md`) kommen gesammelt, wenn der Lehrplan bis Klasse 12 aufgebaut ist.
- Die Schwelle „Lernkern trägt“ (K-12) bleibt; sie wird damit erst nach Klasse 12 geprüft. Bis dahin bleibt es beim Basebau-Minimum.

*Warum:* Entscheidung des Projektverantwortlichen – erst soll das vollständige Angebot für die ganze Zielgruppe stehen.
*Ehrlich benannt:* Fehler im Lernkern oder in vielen Vorlagen derselben Art fallen so erst spät auf und müssen dann an vielen Stellen behoben werden. Abfederung: Pflicht-Tests je Generator, die automatische Inhaltsprüfung und die Browser-Tests laufen bei jeder Änderung; alle Inhalte bleiben als `ki-entwurf` gekennzeichnet, bis sie geprüft sind.

**Entscheidung K-16: Die sächsischen Lehrpläne Mathematik sind bindend für das MVP.** *(27.10.2026)* Lehrplan Oberschule Mathematik 2019 und Lehrplan Gymnasium Mathematik (Fassung 2021) haben höchste Priorität (Fundstellen: `docs/quellen/README.md`). Was dort als Pflicht-Lernbereich steht, gehört zum Inhalt der jeweiligen Klassenstufe – **auch Geometrie und Diagramme/Statistik**. Damit ist O-15 erledigt.
- Klasse 5 umfasst danach 41 Kompetenzen (`LEHRPLAN.md` §8): natürliche Zahlen, Teilbarkeit, Brüche und Dezimalzahlen, Größen, Koordinaten, Winkel, Symmetrie, Rechtecke, Würfel und Quader.
- **Zeichnen und Konstruieren** (Geodreieck, Winkelmesser, später Zirkel) darf und soll die App **erklären**; geprüft wird nur, was sich ohne freies Zeichnen prüfen lässt (L-10).
- Wahlbereiche der Lehrpläne zählen nicht zu den Abschlusskriterien (L-11).

**Zielgruppe in einem Satz:**
> Schülerinnen und Schüler in Sachsen, Klassen 5 bis 12, jeder Schulart, die in Mathe unsicher oder durchschnittlich sind. Inhalte gibt es zuerst für Klasse 5; für Ältere ist Bastion bis dahin ein Werkzeug gegen Lücken aus Klasse 5.

## 3. Phase B – Lernkern vor Basebau (Monate 1–5)

**Entscheidung K-12: Lernkern vor Basebau, mit harter Schwelle.**

Priorität in dieser Reihenfolge:

1. **Aufgabenqualität:** Generatoren, Erklärungen, Lösungswege, Fehlerbilder, saubere Trennung G/M.
2. **Wiederholung (FSRS) und Fehlerwerkstatt** wirklich gut machen.
3. **Diagnose und sichtbarer Kompetenzfortschritt** – auch ganz ohne Bastion.
4. Erst danach den **Basebau** so weit ausbauen, dass er Lernfortschritt spürbar belohnt.

**Regel (Schwelle „Lernkern trägt“):** Solange der Lernkern nicht von echten Nutzerinnen und Nutzern als *„besser als das, was ich sonst mache“* beschrieben wird, wird am Basebau nur das **Basebau-Minimum** gebaut:

- Das Ledger bucht Stein, Erz und Baupläne im Hintergrund (war schon B-10).
- Eine schlichte Listenansicht zeigt die Ressourcen und erlaubt **ein bis zwei** Gebäude der Epoche 1 zu bauen.
- Zweck allein: prüfen, ob die Verbindung „Lernen → Ressource → Bauen“ verstanden wird und ob sie die Lernqualität stört.
- **Nicht** im Minimum: Grafik, Epochen, Studierstube, Simulator, Balancing über Epoche 1 hinaus.

Die Schwelle gilt als erreicht, wenn in der Testgruppe (`TESTS.md`) **mindestens die Hälfte** – darunter mindestens zwei aus der Gruppe „mag eigentlich keine Lern-Apps“ – den Lernkern unaufgefordert oder auf offene Frage als besser beschreibt als ihr bisheriges Üben.

*Warum:* Wenn der Lernkern nicht trägt, macht der Basebau aus einem mittelmäßigen Übungsprogramm nur ein mittelmäßiges Übungsprogramm mit Bildern. Und R4 („Qualität schlägt Menge“) funktioniert nur, wenn es Qualität zu belohnen gibt.

*Verhältnis zu K-5 („Phase 1 ohne Basebau“):* Das Basebau-Minimum ist ein **Versuchsaufbau**, kein Basebau-Ausbau. Es kommt frühestens, wenn Üben, Wiederholen und Fehlerwerkstatt stehen (Ende Phase 1), damit die Testgruppe es rechtzeitig für die Frage „gehört mir das?“ (§6) erlebt.

## 4. Phase C – Harte Realitätstests (ab Monat 2, parallel)

Ausgearbeitet in `TESTS.md`. Kern:

- **8–12 Jugendliche** aus der Zielgruppe, gemischt motiviert und unmotiviert; davon **mindestens 3–4**, die „normalerweise keine Lern-Apps mögen“.
- Gefragt wird nicht nur „Ist es bedienbar?“, sondern:
  - Kommen sie **von allein** wieder?
  - **Behalten** sie mehr?
  - Fühlt sich die Bastion an wie etwas, das **ihnen gehört** – oder wie ein Fortschrittsbalken mit Bildern?
- Reaktionen werden **ungeschönt** protokolliert, auch die vernichtenden.

## 5. Phase D – Verbreitung vorbereiten (ab Monat 4–5)

Nicht erst, wenn die App „fertig“ ist. Zu klären und hier fortzuschreiben:

| Frage | Erster Stand |
|---|---|
| Welche Eltern- und Lehrkräfte-Kanäle sind realistisch erreichbar? | Offen. In Sachsen zu prüfen: Landeselternrat und Elternräte der Schulen, Fachberater:innen Mathematik, Sächsisches Bildungsportal (OER), LernSax als Ort, an dem Lehrkräfte Links teilen. Weitere Kandidaten: eigenes Umfeld und Schulen der Testgruppe, Elternvertretungen, Lerntherapie/Nachhilfe-Initiativen, Hausaufgabenhilfen, Bildungs-Blogs mit Datenschutz-Fokus, OER-Netzwerke (passt zu CC BY-SA). Bewertung nach Erreichbarkeit für eine Person, nicht nach Reichweite. |
| Gibt es den einen Satz „Warum sollte ich das meinem Kind empfehlen?“ | Entwurf: *„Bastion übt mit deinem Kind genau die Bruchrechnung, die es noch nicht sicher kann, wiederholt sie, bis sie sitzt – ohne Werbung, ohne Konto, ohne dass Daten das Gerät verlassen.“* In Tests mit Eltern prüfen und schärfen. |
| Ist ein schlanker Einstieg für Lehrkräfte denkbar, ohne dass die App schulisch wird? | Denkbar, ohne Lehrkräfte-Konto: eine druckbare Seite „Was Bastion übt“ (Kompetenzliste mit Bezug zu den KMK-Leitideen) und ein Link/QR für die Klasse. Kein Klassen-Modus, keine Datenrückmeldung an Lehrkräfte (O-5 bleibt im Horizont). |

## 6. Phase E – Erfolgskriterien für Monat 12

**Entscheidung K-13: Erfolgskriterien für Oktober 2027.** Bescheiden, messbar, ohne Vanity-Metrics.

| Nr. | Kriterium | Wie gemessen (mit Datenschutz, §7) |
|---|---|---|
| E1 | Mindestens **40 Jugendliche** haben die App **über 4 Monate oder länger regelmäßig** genutzt („regelmäßig“ = an mindestens 2 Lerntagen pro Woche in mindestens 12 der Wochen). | Nur in der Studiengruppe: freiwilliger Nutzungsbericht (§7). Außerhalb wird nichts gezählt. |
| E2 | In der Kerngruppe ist der **Wiederholungserfolg (Behalten) messbar besser** als ohne System. | Behaltenstest nach Pause, Vergleich „mit Bastion-Wiederholung“ gegen „nur im Unterricht/Block geübt“ (`TESTS.md` §5). |
| E3 | Mindestens **15 Jugendliche** beschreiben die Bastion **unaufgefordert** als „meins“ oder „zeigt, was ich kann“ (oder sinngemäß). | Offene Interviews, wörtlich protokolliert (`TESTS.md` §4). Nur unaufgeforderte Aussagen zählen. |

**Bewusst keine Kriterien:** Downloads, Seitenaufrufe, Sitzungsdauer, Sterne-Bewertungen, Streak-Längen (VISION §8).

*Ehrliche Einordnung:* E1 verlangt deutlich mehr Menschen als die 8–12 Testpersonen aus Phase C. Ohne Phase D wird E1 verfehlt. E3 setzt voraus, dass das Basebau-Minimum rechtzeitig (spätestens etwa Monat 6–7) bei den Testpersonen ist – sonst gibt es nichts, was „meins“ sein könnte.

## 7. Messen, ohne zu überwachen

Prinzip 3 gilt auch für die eigene Erfolgsmessung: **Die App sendet nichts.** Für E1 und E2 braucht es trotzdem Zahlen.

**Vorschlag K-14 (Status: Vorgeschlagen, vor Phase-1-Tests entscheiden): Freiwilliger Studienbericht.**

- Teilnehmende der Studiengruppe (mit schriftlicher Einwilligung der Eltern, `TESTS.md` §3) können in der App einen **Studienbericht** erzeugen: eine kleine Datei bzw. ein QR-Code mit **nur zusammengefassten** Werten, z. B. Zahl der Lerntage pro Woche, Wiederholungserfolg je Kompetenz, Zahl gefestigter Kompetenzen.
- Keine Uhrzeiten, keine einzelnen Antworten, kein Spitzname, keine Geräte-ID; die Studiengruppe vergibt eine **Teilnehmer-Nummer** auf Papier.
- Die Person sieht den Inhalt im Klartext, bevor sie ihn weitergibt, und gibt ihn selbst weiter (z. B. an die Eltern, die ihn per Mail schicken).
- Ohne Teilnahme existiert die Funktion praktisch nicht (versteckt hinter einem Studiencode).

*Warum Vorschlag statt Entscheidung:* Es ist die erste Funktion, deren Zweck Daten für das Projekt sind. Das braucht eine bewusste Entscheidung und einen Eintrag in `DATENMODELL.md` (Datenschutzprüfung §10), bevor sie gebaut wird.

## 8. Die nächsten 14 Tage

| Nr. | Schritt | Stand |
|---|---|---|
| 1 | Scope-Entscheidung schriftlich festhalten | erledigt: §2, K-11 |
| 2 | Liste „Nicht-Ziele bis Monat 12“ | erledigt: `PLAN.md` §2.1 |
| 3 | Mathe-Kern schonungslos gegen die besten Angebote halten | Entwurf: `WETTBEWERB.md`; offen: selbst durchspielen (`PLAN.md` 0.14) |
| 4 | Erste 5–8 Testpersonen identifizieren und ansprechen | Material bereit: `TESTS.md`; Ansprache durch den Projektverantwortlichen |
| 5 | Basebau auf das Minimum begrenzen | festgelegt: §3, K-12 |

## 9. Entscheidungen dieses Dokuments

| ID | Entscheidung | Status |
|---|---|---|
| K-11 | Scope bis Monat 12: Mathe in Sachsen, Kl. 5–12, alle Schularten, Niveaus G und M | Entschieden (27.10.2026, am selben Tag zweimal geändert) |
| L-9 | Lehrplanbezug Sachsen statt nur KMK (siehe LEHRPLAN.md §10) | Entschieden (27.10.2026) |
| K-15 | Inhalte Klassenstufe für Klassenstufe, beginnend mit Klasse 5; Abschlusskriterien je Klassenstufe | Entschieden (27.10.2026) |
| K-16 | Sächsische Lehrpläne Mathematik (OS 2019, GY 2021) bindend für das MVP; Geometrie und Diagramme gehören dazu (erledigt O-15) | Entschieden (27.10.2026) |
| K-12 | Lernkern vor Basebau; Basebau-Minimum bis zur Schwelle „Lernkern trägt“ | Entschieden (27.10.2026) |
| K-13 | Erfolgskriterien E1–E3 für Oktober 2027, keine Vanity-Metrics | Entschieden (27.10.2026) |
| K-14 | Freiwilliger Studienbericht als einzige Messquelle für E1/E2 | Vorgeschlagen |
