# Bastion – Basebau

Status: Entwurf v0.1 · Stand: 27.10.2026 · Bezug: `VISION.md` (R1–R7), `KONZEPT.md` §5, `ARCHITEKTUR.md` (T-7, T-9)
Alle Zahlen sind **Startwerte für den Balancing-Simulator** (Phase 2), keine endgültigen Werte.

---

## 1. Zweck des Basebaus

Der Basebau hat genau zwei Aufgaben:

1. **Spiegel:** Die Bastion zeigt sichtbar, was der Jugendliche sich erarbeitet hat.
2. **Langfristiger Anlass zum Wiederkommen** – durch Planung, Gestaltung und Vorfreude, nicht durch Druck.

Was er ausdrücklich **nicht** tun darf:
- Lernwerkzeuge, Inhalte oder Hilfen freischalten. Sonst wäre er nicht ohne Nachteil abschaltbar (R7).
- Jemanden für Pausen bestrafen (R3).
- Belohnungen zufällig verteilen (R1).

## 2. Begriffe

| Begriff | Bedeutung |
|---|---|
| **Aufgabe** | Eine einzelne bearbeitete Aufgabe im Lernkern |
| **Lerneinheit** | Eine abgeschlossene Lernsitzung mit Mindestumfang (s. 3.4) |
| **Bauschritt** | Fortschrittseinheit für Bauvorhaben; entsteht pro Lerneinheit |
| **Bauvorhaben** | Ein Gebäude oder eine Stufe, die gerade gebaut wird |
| **Kompetenz gefestigt** | Kompetenz nach Definition in 3.3 nachgewiesen und behalten |
| **Epoche** | Große Ausbaustufe der gesamten Bastion (Außenposten, Burg, Festung, Zitadelle) |

## 3. Ressourcen

### 3.1 Stein – Fleiß

| | |
|---|---|
| Entsteht | 1 Stein pro ernsthaft bearbeiteter Aufgabe in *Üben*, *Diagnose*, *Fehlerwerkstatt* |
| Richtig/falsch | Zählt **beides**. Stein belohnt Arbeit, nicht Fehlerfreiheit |
| Tageskurve | Aufgaben 1–25: voller Ertrag · 26–50: halber Ertrag · ab 51: kein Stein mehr |
| Ernsthaftigkeit | Kein Stein für Antworten unter einer Mindestbearbeitungszeit pro Aufgabentyp, wenn sie falsch sind (Raten) |

*Warum richtig und falsch gleich:* Würde nur Richtiges belohnt, optimieren Jugendliche auf leichte Aufgaben. Die Adaptivität hält die Aufgaben ohnehin im passenden Schwierigkeitsbereich.

*Warum die Ernsthaftigkeitsregel nur bei falschen Antworten greift:* Wer schnell und richtig antwortet, kann es. Wer schnell und falsch antwortet, rät. Die App sagt das freundlich („Nimm dir ruhig etwas mehr Zeit“), ohne zu protokollieren oder zu melden.

### 3.2 Erz – Behalten

| | |
|---|---|
| Entsteht | 1 Erz pro **bestandener fälliger Wiederholung** (FSRS) · 1 Erz pro **korrigiertem Fehler** in der Fehlerwerkstatt |
| Vorziehen | Nicht möglich: Nur fällige Wiederholungen zählen |
| Tagesobergrenze | 30 Erz |

*Warum Erz nicht farmbar ist:* Die Menge fälliger Wiederholungen bestimmt das Verfahren, nicht der Nutzer.

*Prüfung gegen Missbrauch:* Absichtlich falsch antworten, um später für die Korrektur Erz zu bekommen, bringt nichts: Bestanden = 1 Erz, Durchgefallen und später korrigiert = 1 Erz. Kein Vorteil, nur mehr Aufwand.

*Warum eine Tagesobergrenze:* Nach einer langen Pause sind sehr viele Wiederholungen fällig. Ohne Grenze würde die Pause ein Erz-Fest auslösen – und das Rückkehren in eine Marathon-Sitzung verwandeln. Siehe auch Rückkehrmodus (6.3).

### 3.3 Baupläne – Kompetenz

| | |
|---|---|
| Entsteht | 1 Bauplan, wenn eine Kompetenz auf einem Niveau **gefestigt** ist · 1 Bauplan pro bestandener Belagerung im Ernstfall-Modus (ab Phase 4) |
| Gefestigt heißt | Mindestens 2 bestandene Wiederholungen mit insgesamt mindestens 7 Tagen Abstand, *und* die geschätzte Erinnerungswahrscheinlichkeit aller Elemente der Kompetenz liegt bei mindestens 90 % |
| Einmaligkeit | Pro Kompetenz und Niveau nur einmal |

*Warum diese Definition:* Ein Bauplan soll bedeuten „Das kann ich wirklich und habe es behalten“, nicht „Das habe ich heute einmal geschafft“. Der Abstand von 7 Tagen trennt Kurzzeit- von Langzeitbehalten.

*Wichtig:* Baupläne sind **niveauneutral**. Eine gefestigte Kompetenz auf Niveau *grundlegend* bringt genauso einen Bauplan wie eine auf Niveau *erweitert*. Eine höhere Niveaustufe derselben Kompetenz bringt einen weiteren Bauplan.

### 3.4 Bauschritte – Zeit, aber ohne Uhr

| | |
|---|---|
| Entsteht | 1 Bauschritt pro abgeschlossener Lerneinheit |
| Lerneinheit | Mindestens 10 ernsthaft bearbeitete Aufgaben *oder* 8 Minuten aktive Lernzeit; auch bei abgebrochener Sitzung (DATENMODELL D-3) |
| Tagesobergrenze | 2 Bauschritte |
| Wirkung | Ein Bauschritt bringt **jedes aktive Bauvorhaben** um einen Schritt voran |

*Warum eine Tagesobergrenze:* Verteiltes Lernen wirkt nachweislich besser als Marathon-Lernen. Die Grenze belohnt also gutes Lernverhalten. Sie ist **kein Streak**: Wer einen Tag auslässt, verliert nichts, er baut nur nicht an diesem Tag.

*Kritische Gegenfrage:* Benachteiligt die Grenze die Wochenend-Lernerin? Ja, bewusst ein wenig – sie baut langsamer als jemand, der dieselbe Zeit über die Woche verteilt. Die Kosten (Abschnitt 5) sind so angelegt, dass auch zwei Lerntage pro Woche **jede Woche sichtbaren Fortschritt** bringen. Der Simulator muss das bestätigen (Profil P3).

### 3.5 Grundregeln für alle Ressourcen

- **Niveauneutral:** Kein Ertragsfaktor für Schulform oder Niveau. Gleiche Anstrengung, gleiche Belohnung.
- **Fachneutral:** Ressourcen aus Mathematik bauen dasselbe wie Ressourcen aus Englisch.
- **Keine Obergrenze im Lager, kein Verfall.** Was erarbeitet ist, bleibt.
- **Das Ledger bucht immer** – auch bei abgeschaltetem Basebau. Wer den Basebau später einschaltet, findet alles Erarbeitete vor (R7).
- **Nachvollziehbar:** Nach jeder Sitzung zeigt die App, woraus jede Ressource entstanden ist.

## 4. Gebäude

### 4.1 Gebäudefamilien

| Familie | Funktion |
|---|---|
| **Kern** (Bergfried) | Bestimmt die maximale Stufe aller anderen Gebäude; Voraussetzung für Epochenwechsel |
| **Wissen** (Studierstube → Bibliothek, Observatorium …) | Spiegel des Kompetenzprofils (4.3) |
| **Verteidigung** (Palisade/Mauer, Turm, Tor) | Gestaltung; ab Phase 4 Bedeutung in Belagerungen |
| **Bau** (Bauhütte) | Mehrere Bauvorhaben gleichzeitig |
| **Zierde** (Banner, Garten, Feuerstelle, Statue …) | Ausdruck und Persönlichkeit; einfacher Steinverbrauch |

**Entscheidung B-1: Keine Versorgungsgebäude.** Der Entwurf in KONZEPT §5.3 sah Steinbruch, Erzmine und Lager vor. Das wird gestrichen.
*Warum:* Ohne passive Produktion (K-3) und ohne Lagergrenze (3.5) hätten sie keine Funktion. Eine Lagergrenze würde wiederum erarbeitete Ressourcen verfallen lassen oder zum Ausgeben drängen – beides widerspricht R3.

**Entscheidung B-2: Wissensgebäude schalten keine Lernfunktionen frei.** Der Entwurf in KONZEPT §5.3 nannte „Lernwerkzeuge“ als mögliche Freischaltung. Das wird gestrichen.
*Warum:* Sonst hätten Nutzer ohne Basebau einen Nachteil (R7), und Lernhilfen würden zur Belohnung statt zum Grundrecht.

### 4.2 Upgrade-Logik

- Jedes Gebäude hat Stufen. Die Stufe eines Gebäudes kann die Stufe des Bergfrieds nicht übersteigen.
- Jede Stufe kostet Stein, Erz, Baupläne und Bauschritte.
- Bauen läuft in drei Schritten: **Planen** (Platz wählen, Kosten sehen) → **Beginnen** (Ressourcen werden abgebucht) → **Fertigstellen** (nach den nötigen Bauschritten).
- Anfangs ist ein Bauvorhaben gleichzeitig möglich, mit der Bauhütte zwei.
- Ein begonnenes Bauvorhaben kann jederzeit abgebrochen werden; die Ressourcen kommen vollständig zurück.
- Gebäude dürfen jederzeit kostenlos versetzt werden. Layout ist Gestaltung, keine Prüfung.

*Warum Ressourcen schon beim Beginnen abgebucht werden:* Das macht die Entscheidung spürbar (Planung). Die vollständige Rückgabe beim Abbruch verhindert, dass eine Fehlentscheidung bestraft wird.

### 4.3 Spiegel-Mechanik: die Studierstube

Die Studierstube füllt sich **automatisch und kostenlos**: Jede gefestigte Kompetenz erscheint als Buch im Regal, beschriftet mit ihrem Kann-Satz. Die Stufe der Studierstube bestimmt nur, wie viel Platz und Gestaltung es gibt, nicht, was hineinkommt.

*Warum kostenlos:* Der Spiegel darf nicht davon abhängen, ob jemand Ressourcen ausgegeben hat. Wer etwas kann, sieht es.

*Kein Verlust:* Sinkt später die Erinnerungswahrscheinlichkeit einer Kompetenz, bleibt das Buch im Regal. Das **Kompetenzportfolio** zeigt dagegen ehrlich „auffrischen empfohlen“. Die Bastion schrumpft nie (R3), das Portfolio lügt nie.

## 5. Epoche 1: Außenposten

### 5.1 Start

Bauplatz 12 × 12 Felder. Vorhanden: Bergfried Stufe 1, Feuerstelle, 4 Palisaden-Segmente.

Die erste Lerneinheit liefert genug für ein Banner, das sofort steht. *Warum:* Ein früher, kleiner Erfolg erklärt die Mechanik besser als jede Anleitung. Danach gibt es keine Sonderbelohnungen mehr.

### 5.2 Gebäude und Kosten

| Gebäude | Stufe | Stein | Erz | Baupläne | Bauschritte | Voraussetzung |
|---|---|---|---|---|---|---|
| Bergfried | 2 | 250 | 80 | 2 | 10 | – |
| Bergfried | 3 | 500 | 160 | 4 | 16 | – |
| Bauhütte | 1 | 150 | 40 | 1 | 6 | Bergfried 2 |
| Studierstube | 1 | 100 | 30 | 1 | 6 | – |
| Studierstube | 2 | 200 | 60 | 2 | 10 | Bergfried 2 |
| Wachturm (2×) | 1 | 100 | 30 | 1 | 6 | – |
| Wachturm (2×) | 2 | 200 | 60 | 2 | 10 | Bergfried 2 |
| Tor | 1 | 80 | 20 | 1 | 5 | – |
| Palisade (8 weitere Segmente) | – | je 15 | – | – | je 1 | – |
| Banner, Garten, Statue u. a. | – | 20–40 | – | – | 1 | – |

**Summe Epoche 1** (ohne beliebige Zierde): ca. 2 000 Stein, 570 Erz, 17 Baupläne, ~100 Bauschritte.

### 5.3 Herleitung

Referenzprofil P1 „regelmäßig“: 4 Lerneinheiten pro Woche à 15 Minuten.
- Pro Einheit ca. 15 Aufgaben → 15 Stein, ca. 5 Wiederholungen → 5 Erz, 1 Bauschritt.
- Pro Woche: ca. 60 Stein, 20 Erz, 4 Bauschritte.
- Über 40 Schulwochen: ca. 2 400 Stein, 800 Erz, 160 Bauschritte.
- Baupläne: In Mathe Kl. 5–6 erwarten wir in einem Schuljahr 15–25 gefestigte Kompetenzen.

Damit ist Epoche 1 für P1 in **etwa einem Schuljahr** abschließbar, mit Puffer. Erz ist bewusst knapper angesetzt als die Einnahme, weil Wiederholungsquoten zu Beginn schwanken.

**Taktgeber sind die Baupläne, nicht Stein.** Wer viel übt, aber wenig festigt, hat viel Stein und wenig Baupläne – und baut Zierde. Das ist gewollt: Die Bastion wird bunter, aber nicht größer, ohne echte Kompetenz.

### 5.4 Epochenwechsel

Außenposten → Burg: Bergfried Stufe 3 **und** 15 Baupläne insgesamt erworben (nicht ausgegeben).

Beim Wechsel wird die Bastion umgebaut: größerer Bauplatz, neuer Baustil, neue Gebäude (z. B. Bibliothek statt Studierstube, Steinmauern statt Palisaden). **Alles Gebaute bleibt erhalten** und wird in den neuen Stil übertragen.

Epochen 2–4 werden ausgearbeitet, wenn Epoche 1 getestet ist (Phase 3). Nur so viel wird festgelegt: Jede Epoche braucht deutlich mehr Baupläne als die vorige, aber nicht mehr Stein pro Woche. Höhere Epochen spiegeln mehr Können, nicht mehr Fleiß.

## 6. Verzahnung mit dem Lernen

### 6.1 Sitzungsablauf
1. Lernen (Lerneinheit).
2. **Abschlussbildschirm:** Was habe ich heute gekonnt? Welche Ressourcen, und woraus?
3. Optional: Bastion öffnen, bauen, gestalten.
4. Hinweis „Für heute ist das gut“, sobald die 2 Bauschritte des Tages erreicht sind.

### 6.2 Zeitsystem
Zeit in der Bastion zählt als Spielzeit im Sinne von „Erst lernen, dann …“. Das Verhältnis legen Eltern bzw. der Jugendliche je nach Stufe fest (KONZEPT §6). Startwert: 15 Minuten Lernen → 5 Minuten Bastion.

### 6.3 Rückkehrmodus nach Pausen
Nach mehr als 7 Tagen ohne Lerneinheit:
- Begrüßung ohne Vorwurf: „Willkommen zurück. Deine Bastion hat gewartet.“
- Fällige Wiederholungen werden **portioniert**: höchstens 20 pro Sitzung, die wichtigsten zuerst.
- Keine Anzeige der Pausenlänge, kein Zähler verpasster Tage.

### 6.4 Was die Bastion vom Lernkern weiß
Nur Ledger-Buchungen und die Liste gefestigter Kompetenzen (für die Studierstube). Keine Antworten, keine Fehler, keine Zeiten (K-1).

## 7. Bewusst ausgeschlossene Mechaniken

| Mechanik | Warum ausgeschlossen |
|---|---|
| Echtzeit-Bauzeiten und Beschleuniger | FOMO und Rückruf zu Uhrzeiten (R2) |
| Truhen, Zufallsbelohnungen, seltene Drops | Variable Belohnung erzeugt zwanghaftes Verhalten (R1) |
| Angriffe auf die Bastion in Abwesenheit | Bestraft Pausen (R3) |
| Verfall, Wartungskosten, Hunger | Bestraft Pausen (R3) |
| Tägliche Login-Belohnung, Streaks | Belohnt Anwesenheit statt Lernen; Streak-Abbruch demotiviert |
| Lagergrenzen | Lassen Erarbeitetes verfallen (B-1) |
| Vergleich mit anderen Bastionen | Sozialer Druck (Prinzip 6) |
| Ertragsfaktor nach Niveau | Ungerecht gegenüber Schulformen (3.5) |
| Freischaltung von Lernfunktionen | Nachteil ohne Basebau (B-2) |

## 8. Balancing-Prüfung (Simulator, Phase 2)

| Profil | Verhalten | Erwartung (muss erfüllt sein) |
|---|---|---|
| P1 regelmäßig | 4×/Woche, 15 Min. | Epoche 1 in 9–12 Monaten; mindestens alle 2 Wochen ein fertiges Gebäude |
| P2 eifrig | täglich, 30 Min. | Schneller als P1, aber höchstens etwa doppelt so schnell |
| P3 Wochenende | 2×/Woche, je 45 Min. | Jede Woche sichtbarer Fortschritt; Epoche 1 in höchstens 18 Monaten |
| P4 Farmer | nur leichte Aufgaben, viel Masse | Nicht schneller als P1 bei Bergfried und Epoche; viel Zierde ist in Ordnung |
| P5 Pause | P1 mit 3 Wochen Krankheit | Kein Verlust; nach Rückkehr in 2 Wochen wieder im Rhythmus |
| P6 schwach | 4×/Woche, Fehlerquote 50 % | Fortschritt kaum langsamer als P1, weil Stein und Erz aus Fehlerkorrektur fließen |
| P7 Prüfungsphase | 2 Wochen täglich 60 Min., davor und danach P1 | Kein großer Vorteil durch Marathon (Tageskurve, Bauschritt-Grenze) |

Wird eine Erwartung verfehlt, werden zuerst die **Kosten** angepasst, dann die Tageskurven, zuletzt die Ressourcenregeln.

## 9. Kritische Gegenprüfung

Ungeklärte Zweifel, die wir offen weitertragen:

1. **Ist Erz für 11-Jährige zu abstrakt?** „Erz gibt es für Wiederholungen“ ist verständlich, „für fällige Wiederholungen“ vielleicht nicht. Test in Phase 2. Fallback: Erz heißt sichtbar „Wiederholungs-Erz“.
2. **Korrumpierungseffekt.** Jugendliche, die Mathe schon mögen, könnten durch Ressourcen umdeuten, *warum* sie lernen. Gegenmittel: Der Abschlussbildschirm zeigt zuerst das Können, dann die Ressourcen. Phase 2 vergleicht Testpersonen mit und ohne Basebau.
3. **Was passiert, wenn alles gebaut ist?** Wir akzeptieren: **Fertig sein ist erlaubt.** Eine abgeschlossene Epoche darf ein Endpunkt sein, an dem man stolz ist, nicht eine Tretmühle. Gestaltung und der nächste Bildungsabschnitt bieten neue Ziele.
4. **Horten.** Jemand baut nie und sammelt nur. Unproblematisch – es gibt keinen Verfall und keinen Grund, zum Ausgeben zu drängen.
5. **Bauplan-Definition zu streng?** 90 % Erinnerungswahrscheinlichkeit plus 7 Tage Abstand könnte schwächere Lernende lange ohne Bauplan lassen. P6 prüft das; notfalls Schwelle auf 85 %.
6. **Ein Fach im Lern-MVP.** Solange nur Mathe existiert, ist die Bastion eine Mathe-Bastion. Für Jugendliche, die Mathe hassen, ist das ein schwacher Einstieg. Akzeptiert bis Phase 6.

## 10. Entscheidungen dieses Dokuments

| ID | Entscheidung | Status |
|---|---|---|
| B-1 | Keine Versorgungsgebäude, keine Lagergrenzen | Entschieden |
| B-2 | Wissensgebäude schalten keine Lernfunktionen frei | Entschieden |
| B-3 | Vier Ressourcen: Stein (Fleiß), Erz (Behalten), Baupläne (Kompetenz), Bauschritte (Zeit ohne Uhr) | Entschieden |
| B-4 | Erträge sind niveau- und fachneutral | Entschieden |
| B-5 | Baupläne sind Taktgeber für Bergfried und Epochen | Entschieden |
| B-6 | Studierstube spiegelt gefestigte Kompetenzen automatisch und kostenlos; Bastion schrumpft nie, Portfolio bleibt ehrlich | Entschieden |
| B-7 | Bauschritte: max. 2 pro Tag, wirken auf alle aktiven Bauvorhaben | Entschieden |
| B-8 | Abbruch eines Bauvorhabens gibt alle Ressourcen zurück; Versetzen ist kostenlos | Entschieden |
| B-9 | Rückkehrmodus nach Pausen ohne Vorwurf und mit portionierten Wiederholungen | Entschieden |
| B-10 | Ledger bucht auch bei abgeschaltetem Basebau | Entschieden |
