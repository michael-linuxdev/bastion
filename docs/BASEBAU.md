# Bastion – Basebau

Status: Entwurf v0.2 · Stand: 28.10.2026 · Bezug: `VISION.md` (R1–R7), `KONZEPT.md` §5, `ARCHITEKTUR.md` (T-7, T-9)
Alle Zahlen sind **Startwerte für den Balancing-Simulator** (Phase 2), keine endgültigen Werte.

> **Seit K-18 (`STRATEGIE.md` §3, 28.10.2026):** Epoche 1 wird **vollständig und mit Grafik** gebaut, jetzt und vor Klasse 7. Die Grenze „nur Basebau-Minimum“ aus K-12 ist aufgehoben. Epochen 2–4 und Belagerungen bleiben außen vor. Der Umsetzungsplan steht in §11.

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

### 3.4a Umsetzung (2.2)

`src/core/ledger/regeln.ts`, Regelversion 1, rein und deterministisch. Präzisierungen:
- **Stein** gibt es für ernsthafte Aufgaben **aller** Lernmodi, auch beim Wiederholen (so rechnet die Herleitung in §5.3: 15 Aufgaben je Einheit, darunter die Wiederholungen). „Halber Ertrag“ heißt: je zwei Aufgaben zwischen der 26. und 50. ein Stein. Die Tageskurve gilt je Lerntag, gleich wie sich die Aufgaben auf Sitzungen verteilen.
- **Erz** für eine bestandene fällige Wiederholung (richtig, mit oder ohne Hilfe) oder für die **erste** richtige Korrektur eines Fehlers. Beides zugleich bringt ein Erz, nicht zwei. Die Diagnose bringt kein Erz. *Neu:* Ein **geratener** Fehler (§3.1) bringt beim Korrigieren kein Erz – sonst lohnte es, erst schnell zu raten und dann zu korrigieren. Was über 30 am Tag hinausgeht, steht als „gekappt“ in der Aufschlüsselung.
- **Bauschritt** für jede Sitzung, die eine Lerneinheit ist (DATENMODELL §4.2), höchstens zwei je Lerntag.
- **Bauplan** beim ersten „gefestigt“ einer Kompetenz auf einem Niveau. „Gefestigt“ ist **dieselbe Regel wie in „Mein Stand“** (LEHRPLAN §6, `src/core/learning/fortschritt.ts`): jede geübte Vorlage zweimal als fällige Wiederholung bestanden, mindestens 7 Tage nach „gekonnt“, Erinnerungswahrscheinlichkeit aller Vorlagen mindestens 90 %. Das deckt §3.3 ab; so widersprechen Studierstube und Kompetenzansicht einander nie.

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
| **Bau** (Zimmerei) | Mehrere Bauvorhaben gleichzeitig |
| **Zierde** (Banner, Garten, Feuerstelle, Statue …) | Ausdruck und Persönlichkeit; einfacher Steinverbrauch |

**Entscheidung B-1: Keine Versorgungsgebäude.** Der Entwurf in KONZEPT §5.3 sah Steinbruch, Erzmine und Lager vor. Das wird gestrichen.
*Warum:* Ohne passive Produktion (K-3) und ohne Lagergrenze (3.5) hätten sie keine Funktion. Eine Lagergrenze würde wiederum erarbeitete Ressourcen verfallen lassen oder zum Ausgeben drängen – beides widerspricht R3.

**Entscheidung B-2: Wissensgebäude schalten keine Lernfunktionen frei.** Der Entwurf in KONZEPT §5.3 nannte „Lernwerkzeuge“ als mögliche Freischaltung. Das wird gestrichen.
*Warum:* Sonst hätten Nutzer ohne Basebau einen Nachteil (R7), und Lernhilfen würden zur Belohnung statt zum Grundrecht.

### 4.2 Upgrade-Logik

- Jedes Gebäude hat Stufen. Die Stufe eines Gebäudes kann die Stufe des Bergfrieds nicht übersteigen.
- Jede Stufe kostet Stein, Erz, Baupläne und Bauschritte.
- Bauen läuft in drei Schritten: **Planen** (Platz wählen, Kosten sehen) → **Beginnen** (Ressourcen werden abgebucht) → **Fertigstellen** (nach den nötigen Bauschritten).
- Anfangs ist ein Bauvorhaben gleichzeitig möglich, mit der Zimmerei zwei.
- Ein begonnenes Bauvorhaben kann jederzeit abgebrochen werden; die Ressourcen kommen vollständig zurück.
- Gebäude dürfen jederzeit kostenlos versetzt werden. Layout ist Gestaltung, keine Prüfung.

*Warum Ressourcen schon beim Beginnen abgebucht werden:* Das macht die Entscheidung spürbar (Planung). Die vollständige Rückgabe beim Abbruch verhindert, dass eine Fehlentscheidung bestraft wird.

### 4.3 Spiegel-Mechanik: die Studierstube

Die Studierstube füllt sich **automatisch und kostenlos**: Jede gefestigte Kompetenz erscheint als Buch im Regal, beschriftet mit ihrem Kann-Satz. Die Stufe der Studierstube bestimmt nur, wie viel Platz und Gestaltung es gibt, nicht, was hineinkommt.

*Warum kostenlos:* Der Spiegel darf nicht davon abhängen, ob jemand Ressourcen ausgegeben hat. Wer etwas kann, sieht es.

*Kein Verlust:* Sinkt später die Erinnerungswahrscheinlichkeit einer Kompetenz, bleibt das Buch im Regal. Das **Kompetenzportfolio** zeigt dagegen ehrlich „auffrischen empfohlen“. Die Bastion schrumpft nie (R3), das Portfolio lügt nie.

*Umsetzung (2.9):* `src/core/bastion/studierstube.ts`. Die Bücher kommen aus den Bauplan-Buchungen (`kompetenz-gefestigt`) – sie entstehen genau einmal beim ersten „gefestigt“ und werden nie zurückgenommen; ausgegebene Baupläne nehmen kein Buch weg. So liest die Bastion nur das Ledger (K-1). In der Listenansicht steht „Deine Bücher“ mit Kann-Satz, Niveau und Datum, **auch bevor die Studierstube gebaut ist** – der Spiegel hängt nie davon ab, ob Ressourcen ausgegeben wurden. Ohne Studierstube steht darunter ein Hinweis, dass die Bücher mit ihr einen eigenen Raum bekommen; Platz und Gestaltung kommen mit der Grafik (2.13).

## 5. Epoche 1: Außenposten

### 5.1 Start

Bauplatz 12 × 12 Felder. Vorhanden: Bergfried Stufe 1, Feuerstelle, 4 Palisaden-Segmente.

Die erste Lerneinheit liefert genug für ein Banner, das sofort steht. *Warum:* Ein früher, kleiner Erfolg erklärt die Mechanik besser als jede Anleitung. Danach gibt es keine Sonderbelohnungen mehr.

### 5.2 Gebäude und Kosten

| Gebäude | Stufe | Stein | Erz | Baupläne | Bauschritte | Voraussetzung |
|---|---|---|---|---|---|---|
| Bergfried | 2 | 250 | 80 | 2 | 10 | – |
| Bergfried | 3 | 500 | 160 | 4 | 16 | – |
| Zimmerei | 1 | 150 | 40 | 1 | 6 | Bergfried 2 |
| Studierstube | 1 | 100 | 30 | 1 | 6 | – |
| Studierstube | 2 | 200 | 60 | 2 | 10 | Bergfried 2 |
| Späherturm (2×) | 1 | 100 | 30 | 1 | 6 | – |
| Späherturm (2×) | 2 | 200 | 60 | 2 | 10 | Bergfried 2 |
| Tor | 1 | 80 | 20 | 1 | 5 | – |
| Palisade (~~8~~ 36 weitere Segmente, B-22) | – | je 15 | – | – | je 1 | – |
| Banner, Garten, Statue u. a. | – | 20–40 | – | – | 1 | – |

**Summe Epoche 1** (ohne beliebige Zierde): ca. 2 000 Stein, 570 Erz, 17 Baupläne, ~100 Bauschritte. *Mit 36 Palisaden (B-22): 2 420 Stein und 121 Bauschritte.*

*Umsetzung (2.5):* `src/core/bastion/katalog.ts` – Katalog als Daten, genau nach dieser Tabelle (Test: 2 000 Stein, 570 Erz, 17 Baupläne, 93 Bauschritte). Präzisierungen:
- **Banner 10 Stein, 1 Bauschritt** statt 20–40: Nur so reicht die erste Lerneinheit (etwa 10 Stein) für ein Banner, wie §5.1 verlangt. Garten 30, Statue 40 Stein, je 1 Bauschritt; Zierde ohne Höchstzahl, begrenzt nur durch den Platz.
- **Feuerstelle** steht nur im Startzustand und wird nicht gebaut.
- **Größen** in Feldern (Draufsicht, B-11): Bergfried 3 × 3, Zimmerei, Studierstube und Garten 2 × 2, alles andere 1 × 1.
- **Startzustand:** Bergfried in der Mitte, Feuerstelle davor, vier Palisaden mit einer Lücke für das Tor.
- **Hindernisse** ohne Blick auf Ressourcen: nicht baubar, Höchststufe, Höchstzahl, Bergfried zu niedrig (§4.2), fehlende Voraussetzung. Ob die Ressourcen reichen, prüft das Bauen (2.6).
- Namen und je ein Satz „wozu“ stehen in der Textdatei (`gebaeude.<typ>`).

### 5.3 Herleitung

Referenzprofil P1 „regelmäßig“: 4 Lerneinheiten pro Woche à 15 Minuten.
- Pro Einheit ca. 15 Aufgaben → 15 Stein, ca. 5 Wiederholungen → 5 Erz, 1 Bauschritt.
- Pro Woche: ca. 60 Stein, 20 Erz, 4 Bauschritte.
- Über 40 Schulwochen: ca. 2 400 Stein, 800 Erz, 160 Bauschritte.
- Baupläne: In Mathe Kl. 5–6 erwarten wir in einem Schuljahr 15–25 gefestigte Kompetenzen. *(Zur Einordnung: Klasse 5 hat nach dem sächsischen Lehrplan 41 Kompetenzen × 2 Niveaus, `LEHRPLAN.md` §8. Der Startwert ist im Simulator zu prüfen.)*

Damit ist Epoche 1 für P1 in **etwa einem Schuljahr** abschließbar, mit Puffer. Erz ist bewusst knapper angesetzt als die Einnahme, weil Wiederholungsquoten zu Beginn schwanken.

**Taktgeber sind die Baupläne, nicht Stein.** Wer viel übt, aber wenig festigt, hat viel Stein und wenig Baupläne – und baut Zierde. Das ist gewollt: Die Bastion wird bunter, aber nicht größer, ohne echte Kompetenz.

### 5.4 Epochenwechsel

Außenposten → Burg: Bergfried Stufe 3 **und** 15 Baupläne insgesamt erworben (nicht ausgegeben).

Beim Wechsel wird die Bastion umgebaut: größerer Bauplatz, neuer Baustil, neue Gebäude (z. B. Bibliothek statt Studierstube, Steinmauern statt Palisaden). **Alles Gebaute bleibt erhalten** und wird in den neuen Stil übertragen.

*Umsetzung (2.10):* `src/core/bastion/epoche.ts`. Die Listenansicht zeigt oben „Ziel der Epoche 1: Außenposten“ mit beiden Bedingungen (Bergfried Stufe 3; erworbene Baupläne von 15) und erklärt, dass auch verbaute Baupläne zählen. Ist beides erreicht, steht dort „Epoche 1 geschafft! Dein Außenposten steht. Du kannst weiter gestalten – oder einfach stolz darauf sein.“ Einen Wechsel in Epoche 2 gibt es noch nicht (K-18); fertig sein ist erlaubt (§9 Punkt 3). Die Rückkehr-Begrüßung (§6.3) ergänzt bei eingeschaltetem Basebau „Deine Bastion hat gewartet.“

Epochen 2–4 werden ausgearbeitet, wenn Epoche 1 getestet ist (Phase 3). Nur so viel wird festgelegt: Jede Epoche braucht deutlich mehr Baupläne als die vorige, aber nicht mehr Stein pro Woche. Höhere Epochen spiegeln mehr Können, nicht mehr Fleiß.

## 6. Verzahnung mit dem Lernen

### 6.1 Sitzungsablauf
1. Lernen (Lerneinheit).
2. **Abschlussbildschirm:** Was habe ich heute gekonnt? Welche Ressourcen, und woraus?
3. Optional: Bastion öffnen, bauen, gestalten.
4. Hinweis „Für heute ist das gut“, sobald die 2 Bauschritte des Tages erreicht sind.

*Umsetzung (1a, Lernkern):* Der Abschlussbildschirm steht ohne Ressourcen (`src/ui/ueben/Abschluss.svelte`): Knopf „Fertig für heute“, zuerst das Können (gefestigt, neu gekonnt, geübt), dann Zahlen, dann der Pausenvorschlag. Bis es Sitzungs-Ereignisse gibt, gilt der Lerntag als Einheit. Ressourcen ergänzt Phase 2a – unter dem Können, nicht darüber (Korrumpierungseffekt, §9).

*Umsetzung (2.4):* Unter „Was du heute gekonnt hast“ steht „Dafür hast du erarbeitet“ mit je einer Zeile pro Ressource und ihrem Ursprung, z. B. „12 Stein – aus 12 bearbeiteten Aufgaben“, „3 Erz – aus 2 Wiederholungen und 1 aufgearbeiteten Fehler“ (R6), „1 Bauschritt – aus 1 Lerneinheit“, „1 Bauplan – weil du jetzt sicher behalten hast: …“ (`src/core/ledger/heute.ts`). Darunter, nur wenn sie zutreffen, sachliche Hinweise: geratene Antworten bringen keinen Stein („Nimm dir ruhig etwas mehr Zeit“, §3.1), ab der 26. Aufgabe gibt es weniger Stein, mehr als 30 Erz am Tag gibt es nicht, beide Bauschritte des Tages sind geschafft (Punkt 4). Der Pausenvorschlag bleibt immer am Ende. Keine Zähler „noch X bis zum nächsten …“ – sie würden zum Weitermachen drängen (R5).

### 6.2 Zeitsystem
Zeit in der Bastion zählt als Spielzeit im Sinne von „Erst lernen, dann …“. Das Verhältnis legen Eltern bzw. der Jugendliche je nach Stufe fest (KONZEPT §6). Startwert: 15 Minuten Lernen → 5 Minuten Bastion.

### 6.3 Rückkehrmodus nach Pausen
Nach mehr als 7 Tagen ohne Lerneinheit:
- Begrüßung ohne Vorwurf: „Willkommen zurück. Deine Bastion hat gewartet.“
- Fällige Wiederholungen werden **portioniert**: höchstens 20 pro Sitzung, die wichtigsten zuerst.
- Keine Anzeige der Pausenlänge, kein Zähler verpasster Tage.

*Umsetzung (1b, Lernkern):* `src/core/srs/rueckkehr.ts`. Präzisierungen, solange es noch keine Lerneinheiten (Sitzungs-Ereignisse) und keine Bastion gibt: Als Pause zählt die Zeit seit der letzten bearbeiteten Aufgabe. Die Begrüßung lautet „Willkommen zurück. Schön, dass du wieder da bist.“ – der Satz über die Bastion kommt mit dem Basebau. „Die wichtigsten zuerst“ heißt: die Karten mit der niedrigsten Erinnerungswahrscheinlichkeit. Die Portion von 20 gilt für **jede** Wiederholungsrunde, nicht nur nach Pausen (natürliche Pausenpunkte, R5); die Startseite nennt nur die Größe der nächsten Runde, nie die ganze Menge.

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
| P1 regelmäßig | 4×/Woche, 15 Min. | Epoche 1 in 9–12 Monaten; ~~mindestens alle 2 Wochen ein fertiges Gebäude~~ höchstens etwa 8 Wochen ohne fertiges Gebäude (B-19) |
| P2 eifrig | täglich, 30 Min. | Schneller als P1, aber höchstens etwa doppelt so schnell |
| P3 Wochenende | 2×/Woche, je 45 Min. | Jede Woche sichtbarer Fortschritt; Epoche 1 in höchstens 18 Monaten |
| P4 Farmer | nur leichte Aufgaben, viel Masse | Nicht schneller als P1 bei Bergfried und Epoche; viel Zierde ist in Ordnung |
| P5 Pause | P1 mit 3 Wochen Krankheit | Kein Verlust; nach Rückkehr in 2 Wochen wieder im Rhythmus |
| P6 schwach | 4×/Woche, Fehlerquote 50 % | ~~Fortschritt kaum langsamer als P1~~ Baut fast so viel wie P1 (mindestens 85 % der Gebäude im Jahr 1); das Ziel der Epoche darf später kommen, weil es Können spiegelt (B-19) |
| P7 Prüfungsphase | 2 Wochen täglich 60 Min., davor und danach P1 | Kein großer Vorteil durch Marathon (Tageskurve, Bauschritt-Grenze) |

Wird eine Erwartung verfehlt, werden zuerst die **Kosten** angepasst, dann die Tageskurven, zuletzt die Ressourcenregeln.

## 8a. Ergebnisse des Simulators (Schritt 2.11, Startwerte, 28.10.2026)

`tools/sim/simulator.ts` (`pnpm sim`) spielt die Profile zwei Jahre lang mit dem **echten Kern** durch: Aufgaben-Ereignisse, FSRS, „gekonnt“/„gefestigt“, Sitzungen, Ledger-Regeln, Bauen. Ausgedacht sind nur die Kinder:
- **Schulrhythmus:** ein neues Thema alle zwei Wochen (etwa 25 im Schuljahr, §5.3) aus 134 Themen (Klasse 5 und 6, zwei Niveaus); dazwischen fällige Wiederholungen (höchstens 20), bis zu drei Fehler in der Werkstatt, Üben von Bekanntem. Richtig mit 85 % (P6: 50 %), etwa 45 Sekunden je Aufgabe.
- **Bauen:** zuerst das Zeichen (Banner), dann der Reihe nach Turm, Wissen, Kern 2, Werkstatt, Eingang, Turm, Wissen 2, Türme 2, Kern 3, Einfassung. Zierde nur aus Überschuss: genug Fleiß fürs nächste Ziel und genug Platz für alle fehlenden Gebäude bleiben übrig.

| Profil | Epoche 1 | Jahr 1: Gebäude (davon Zierde) | größte Lücke Jahr 1 | Belegung nach 12 Mon. | Erwartung §8 |
|---|---|---|---|---|---|
| P1 regelmäßig | 9,8 Mon. | 59 (41) | 58 Tage | 81 % | 9–12 Mon. ✓ · alle 2 Wochen ein Gebäude ✗ |
| P2 eifrig | 8,3 Mon. | 73 (55) | 52 Tage | 99 % | höchstens doppelt so schnell ✓ |
| P3 Wochenende | 10,5 Mon. | 67 (49) | 35 Tage | 90 % | ≤ 18 Mon., jede Woche Fortschritt ✓ |
| P4 Farmer | nie | 55 (55) | 4 Tage | 85 % | nicht schneller als P1 ✓, viel Zierde ✓ |
| P5 Pause | 11,1 Mon. | 53 (35) | 58 Tage | 72 % | kein Verlust, rasch wieder im Rhythmus ✓ |
| P6 schwach | 12,8 Mon. | 55 (46) | 60 Tage | 81 % | kaum langsamer als P1 ✗ (+3 Monate) |
| P7 Prüfungsphase | 9,7 Mon. | 67 (49) | 63 Tage | 90 % | kein großer Vorteil ✓ |

Jahr 1 bei P1: rund 3 100 Fleiß, 880 Behalten, 22 Können, 210 Schritte – nahe an der Herleitung in §5.3.

**Befunde:**
1. **Lücken von fast zwei Monaten (P1, P6, P7):** Sie entstehen vor dem großen Schritt Kern Stufe 3 (500 Fleiß, 160 Behalten, 4 Können, 16 Schritte). Engpass ist vor allem *Behalten*. In dieser Zeit wird gespart, und es entsteht nichts.
2. **Schwache Lernende (P6) brauchen drei Monate länger.** Sie festigen weniger Themen und bekommen so weniger Können (16 statt 22 im Jahr 1) – das ist der Taktgeber (B-5). §9 Punkt 5 schlug dafür vor, die Schwelle für „gefestigt“ von 90 % auf 85 % zu senken.
3. **Der Bauplatz ist nach einem Jahr zu 80–99 % voll**, vor allem mit Zierde: Fleiß gibt es reichlich (3 100 im Jahr, Gebäude brauchen 2 000 in der ganzen Epoche). *Ohne Rücksicht auf Platz baut ein eifriges Kind den Platz so voll, dass Turm, Tor und Co. keinen Platz mehr finden – und Abreißen gibt es nicht.* Das ist eine echte Lücke im Spiel.
4. **Die Einfassung** erreicht ihre 12 Stück, umschließt damit aber nichts (siehe Vergleich mit 44 × 44 im Gespräch vom 28.10.2026).

**Entscheidungen dazu (28.10.2026):** B-19 bis B-22. Geprüft im Simulator vor der Entscheidung: Billigere Kosten für Kern Stufe 3 verschieben weder das Ende der Epoche noch die Lücken – Taktgeber sind die Baupläne (B-5). „Zierde ohne Sparen“ halbiert die Lücken (30 Tage), schiebt Epoche 1 bei P1 aber auf 12,7 Monate. Eine Schwelle von 85 % für „gefestigt“ ändert bei P6 nichts; „gekonnt“ schon bei 4 von 6 macht P6 sogar schneller als P1 (8,4 Monate) und wurde deshalb verworfen.

**Nach den Entscheidungen (2.11a–c):** Einfassung 40 Stück, Einlagern, Ziel vormerken. Der Simulator baut Einfassung und Zierde jetzt aus Überschuss im Wechsel (beides braucht kein Können) und lagert Zierde ein, wenn für ein fehlendes Gebäude kein zusammenhängender Platz frei ist.

| Profil | Epoche 1 | Jahr 1: Gebäude (davon Zierde) | größte Lücke Jahr 1 | Belegung nach 12 Mon. | Erwartung §8 (mit B-19) |
|---|---|---|---|---|---|
| P1 regelmäßig | 9,8 Mon. | 67 (34) | 58 Tage | 80 % | 9–12 Mon. ✓ · höchstens ~8 Wochen ohne Gebäude ✓ |
| P2 eifrig | 8,3 Mon. | 97 (52), 11-mal eingelagert | 52 Tage | 97 % | höchstens doppelt so schnell ✓ |
| P3 Wochenende | 10,5 Mon. | 77 (40) | 35 Tage | 91 % | ≤ 18 Mon., jede Woche Fortschritt ✓ |
| P4 Farmer | nie | 74 (44) | 3 Tage | 92 % | nicht schneller als P1 ✓ |
| P5 Pause | 11,1 Mon. | 58 (29) | 58 Tage | 72 % | kein Verlust ✓ |
| P6 schwach | 12,8 Mon. | 66 (34) | 60 Tage | 80 % | baut fast so viel wie P1 (66 zu 67) ✓ |
| P7 Prüfungsphase | 9,7 Mon. | 77 (40) | 65 Tage | 91 % | kein großer Vorteil ✓ |

Alle Erwartungen aus §8 sind damit erfüllt und werden in `tools/sim/simulator.test.ts` bei jedem Testlauf geprüft. *Ohne* Einlagern erreichte P2 die Epoche nicht: Der Platz war zerstückelt voll – B-21 ist also nötig, nicht nur bequem.

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
| B-11 | Bastion in **Draufsicht** (Plan von oben), nicht isometrisch | Entschieden (28.10.2026, Projektverantwortlicher) |
| B-12 | Gebäudebilder zuerst im **eigenen schlichten Stil** aus dem Code, austauschbar über einen Bildkatalog (erledigt KONZEPT O-11) | Entschieden (28.10.2026, Projektverantwortlicher) |
| B-13 | Basebau-Schalter: Standard **an**; Jugendliche und Eltern können ihn jederzeit umschalten. *Umsetzung (2.7):* Einstellung `basebau.aktiv` (nur `false` schaltet ab), Schalter „Bastion anzeigen“ in „Mein Stand“ (Jugendliche) und im Elternbereich (Eltern); es gilt die jüngste Änderung (D-5). Aus heißt: keine Ressourcen im Abschluss, später kein Bastion-Knopf – das Ledger bucht weiter (B-10) | Entschieden (28.10.2026, Projektverantwortlicher) |
| B-14 | Erste Gebäude in der Umsetzung: **Banner und Späherturm** – sie prüfen den frühen Erfolg (§5.1) und die ganze Kette aus allen vier Ressourcen | Entschieden (28.10.2026, Projektverantwortlicher) |
| B-15 | Der Turm heißt **Späherturm**, nicht „Wachturm“ – wegen der Nähe zur Zeitschrift „Der Wachtturm“ der Zeugen Jehovas. Gebäudenamen dürfen keinen erkennbaren Bezug zu Religionsgemeinschaften, Parteien, Marken oder anderen Spielen haben | Entschieden (28.10.2026, Projektverantwortlicher) |
| B-16 | Die „Bauhütte“ heißt **Zimmerei** – „Bauhütte“ ist zu nah an einem Gebäude aus „Clash of Clans“ (B-15 gilt auch für andere Spiele) | Entschieden (28.10.2026, Projektverantwortlicher) |
| B-17 | **Drei Ebenen:** Mechanik (Rollen, Kosten, Stufen, Regeln) – **Thema** (was eine Rolle ist: Namen von Gebäuden, Ressourcen, Epochen, Bildern) – **Skin** (Aussehen des Spielfelds, z. B. saisonal). Alle Themen haben **dieselbe Mechanik**; ein Thema ist reine Darstellung. Das Kind wählt das Thema und kann jederzeit kostenlos und ohne Verlust wechseln. Themen zum Start: **Bastion, Garten, Weltraum, Dorf, Unterwasser**. Ressourcen heißen je Thema anders | Entschieden (28.10.2026, Projektverantwortlicher) |
| B-18 | Skins sind nie Belohnung und nie knapp: Nichts gibt es „nur jetzt“ (R1, Prinzip 6). Ein saisonaler Skin darf sich nach dem Kalender einschalten. Skins wirken als Farbpalette mit wenigen Auflagen über jedem Thema, damit der Grafikaufwand nicht mit der Zahl der Themen wächst | Vorgeschlagen |
| B-19 | Erwartungen §8 nach dem Simulator angepasst: **P1** höchstens etwa 8 Wochen ohne fertiges Gebäude (Zierde zählt mit), längere Pausen nur vor dem großen Ziel der Epoche; **P6** baut fast so viel wie P1 (mindestens 85 % der Gebäude im Jahr 1), das Ziel der Epoche darf später kommen, weil es echtes Können spiegelt. „Gekonnt“ und „gefestigt“ bleiben unverändert – sonst wäre „Mein Stand“ nicht mehr ehrlich | Entschieden (28.10.2026, Projektverantwortlicher) |
| B-20 | **Ziel vormerken:** Das Kind kann ein Bauvorhaben vormerken und sieht, was dafür noch fehlt. Sparen wird sichtbare Vorfreude; keine Zeitvorgabe, kein Tageszähler (R5) | Entschieden (28.10.2026, Projektverantwortlicher) |
| B-21 | **Einlagern:** Zierde lässt sich jederzeit kostenlos vom Bauplatz ins Lager nehmen und wieder aufstellen. Nichts geht verloren (R3), nichts lässt sich farmen – so wird der Platz nie zur Falle | Entschieden (28.10.2026, Projektverantwortlicher) |
| B-22 | **Einfassung 40 Stück** in Epoche 1 (4 am Start, 36 baubar, je 15 Fleiß und 1 Bauschritt), damit sich ein Teil des Bauplatzes umschließen lässt | Entschieden (28.10.2026, Projektverantwortlicher) |
| B-23 | Im Thema Dorf heißt der Kern **Gemeindehaus**, nicht „Rathaus“ | Entschieden (28.10.2026, Projektverantwortlicher) |

## 11. Umsetzungsplan Epoche 1 (K-18)

Reihenfolge nach K-10: **erst Mechanik und Listenansicht, dann Grafik.** Jeder Schritt ist ein kleiner Commit mit Tests; die Nummern setzen den Plan in `PLAN.md` §4a fort.

### Stufe A – Ledger (Kern, noch ohne Bauen)

| Nr. | Schritt | Kern der Sache | Prüfung |
|---|---|---|---|
| 2.1 ✅ | **Sitzungen** | `sitzung`-Ereignis (DATENMODELL §4.2) beim Abschluss („Fertig für heute“, Verlassen); fehlende Sitzungen beim nächsten Start nachtragen (D-3); Lerneinheit = mindestens 10 ernsthafte Aufgaben oder 8 Minuten aktive Zeit (§3.4) | Einheitentests, auch für Abbruch und Nachtragen |
| 2.2 ✅ | **Ledger-Regeln** in `src/core/ledger/` | rein und deterministisch, Regelversion 1: Stein mit Tageskurve und Rateregel (§3.1), Erz aus fälligen bestandenen Wiederholungen und Korrekturen, höchstens 30 am Tag (§3.2), Bauschritte höchstens 2 am Tag (§3.4), Bauplan beim ersten „gefestigt“ je Kompetenz und Niveau (§3.3) | fast-check: Tagesgrenzen halten, absichtlich falsch antworten bringt nichts, Niveau ändert nichts (B-4) |
| 2.3 ✅ | **Buchungen und Konto** | `buchung`-Ereignisse je Sitzung mit Aufschlüsselung (D-4), Projektion `konto`; Sicherung, Einspielen und Zusammenführen kennen die neue Ereignisart (DATENMODELL §7.3); Schemaversion mit Migrationstest | Pflicht-Test D-6: fortgeschrieben = neu aufgebaut |
| 2.4 ✅ | **Abschluss mit Ressourcen** | Ressourcen **unter** dem Können, mit „woher“ (§6.1, §9 Punkt 2); „Für heute ist das gut“ nach dem zweiten Bauschritt (R5); Belohnung fürs Korrigieren sichtbar (R6) | Browser-Test |

### Stufe B – Bau-Mechanik und Listenansicht

| Nr. | Schritt | Kern der Sache | Prüfung |
|---|---|---|---|
| 2.5 ✅ | **Gebäudekatalog** | alle Gebäude der Epoche 1 als Daten (§5.2), Stufen, Kosten, Voraussetzungen, Bergfried-Grenze (§4.2); Startzustand (§5.1) | Einheitentests |
| 2.6 ✅ | **Bauen** in `src/core/bastion/` (liest nur `ledger`) | `bau`-Ereignisse (DATENMODELL §4.4): beginnen bucht ab, abbrechen erstattet alles (B-8), Bauschritte wirken auf alle aktiven Vorhaben (B-7), fertigstellen, versetzen kostenlos; ein Vorhaben gleichzeitig, mit Zimmerei zwei; Projektion `bastion` | fast-check: nie negativer Vorrat, Abbruch erstattet genau, Neuaufbau = Fortschreibung |
| 2.7 ✅ | **Basebau-Schalter** | Einstellung `basebau.aktiv`, Standard an (B-13); aus heißt: nichts vom Basebau sichtbar, das Ledger bucht weiter (B-10, R7) | Browser-Test: aus → ein, alles Erarbeitete ist da |
| 2.8 ✅ | **Listenansicht** | barrierefrei und reizarm (ARCHITEKTUR §4.5): Vorrat, Gebäude, Vorhaben, Planen → Beginnen → Fertigstellen; zuerst Banner und Späherturm (B-14), dann der übrige Katalog | Browser-Test: lernen → Ressource → bauen |
| 2.9 ✅ | **Studierstube** | jede gefestigte Kompetenz als Buch mit Kann-Satz, automatisch und kostenlos, das Buch bleibt im Regal (B-6) | Einheitentests |
| 2.10 ✅ | **Ende der Epoche 1** | Bergfried 3 und 15 erworbene Baupläne: „Epoche 1 geschafft“; Epoche 2 wird nicht gebaut, fertig sein ist erlaubt (§9 Punkt 3); Rückkehr-Begrüßung „Deine Bastion hat gewartet“ (§6.3) | Einheitentests |

*Umsetzung 2.8:* `src/ui/bastion/Bastion.svelte`, auf der Startseite der Knopf „Bastion“ (nur bei eingeschaltetem Basebau). Von oben nach unten: Vorrat (Stein, Erz, Baupläne, Bauschritte im Vorrat), „Im Bau“ mit Fortschrittsbalken und „Abbrechen“, „Neu bauen“ (Banner und Späherturm zuerst, B-14) und „Ausbauen“ mit Zweck, Kosten und den Gründen, warum etwas gerade nicht geht, „Deine Gebäude“ mit Feld und „Versetzen“ (Spalte und Reihe wählen), „Fertig geworden“ als kleine Geschichte. Ein Neubau kommt auf das erste freie Feld; versetzen lässt er sich danach kostenlos. Der volle Bauplatz steht einmal über der Liste, fehlende Ressourcen stehen in einer Zeile („Dafür reicht es noch nicht: Stein, Erz“). Keine Zähler „noch X …“ (R5).

### Zwischenschritt – Themen (B-17)

| Nr. | Schritt | Kern der Sache | Prüfung |
|---|---|---|---|
| 2.10a ✅ | **Rollen statt Burg-Wörter** im Code | Gebäude-Kennungen werden Rollen (`kern`, `werkstatt`, `wissen`, `turm`, `eingang`, `einfassung`, `ursprung`, `zeichen`, `flaeche`, `denkmal`), Ressourcen werden `fleiss`, `behalten`, `koennen`, `schritt`. Jetzt günstig: Es gibt noch keine echten Bau-Daten | alle Tests unverändert grün |
| 2.10b ✅ | **Themen und Wahl** | Namen je Thema in der Textdatei (`thema.<thema>.…`), Einstellung `basebau.thema` (Standard Bastion), Wahl in der Bastion und in „Mein Stand“; Abschluss, Liste und Begrüßung sprechen die Sprache des Themas | Test: jedes Thema hat jeden Namen; Wechsel ändert nur Wörter |

*Umsetzung 2.10a/b:* Kennungen sind Rollen (`src/core/bastion/katalog.ts`), Ressourcen `fleiss`, `behalten`, `koennen`, `schritt`. Die Wörter jedes Themas stehen in der Textdatei unter `thema.<thema>.…` (Name, „Dein …“, Epoche, je Ressource Ein- und Mehrzahl, „ein Buch“/„eine Blume“ mit Zeichen, je Rolle Name und „wozu“). Texte der Bastion, des Abschlusses und der Begrüßung haben Platzhalter wie `{ganzes}` oder `{fleiss-viele}`, die `src/ui/bastion/thema.svelte.ts` mit den Wörtern des gewählten Themas füllt. Gewählt wird oben in der Bastion („Wie soll es aussehen?“), gespeichert als Einstellung `basebau.thema` (Standard Bastion). Ein Test prüft, dass jedes Thema jedes Wort hat und jeder Platzhalter auflösbar ist.

**Namen der Themen** (vom Projektverantwortlichen bestätigt, 28.10.2026):

| Rolle | Bastion | Garten | Weltraum | Dorf | Unterwasser |
|---|---|---|---|---|---|
| kern | Bergfried | Baumhaus | Kommandomodul | Gemeindehaus | Hauptkuppel |
| werkstatt | Zimmerei | Geräteschuppen | Montagehalle | Schreinerei | Werft |
| wissen | Studierstube | Gewächshaus | Sternwarte | Bücherei | Perlenkammer |
| turm | Späherturm | Aussichtsbaum | Antennenmast | Windmühle | Leuchtturm |
| eingang | Tor | Gartentor | Luftschleuse | Dorfbrücke | Tauchschleuse |
| einfassung | Palisade | Hecke | Schutzwand | Zaun | Korallenriff |
| ursprung | Feuerstelle | Gartenbank | Landeplatz | Dorfbrunnen | Anker |
| zeichen | Banner | Wimpel | Flagge | Wappen | Boje |
| flaeche | Garten | Blumenbeet | Kristallfeld | Obstwiese | Seegraswiese |
| denkmal | Statue | Gartenzwerg | Satellit | Denkmal | Muschelskulptur |
| fleiss | Stein | Samen | Metall | Holz | Sand |
| behalten | Erz | Wassertropfen | Energie | Lehm | Kristall |
| koennen | Bauplan | Gartenplan | Konstruktionsplan | Bauplan | Seekarte |
| schritt | Bauschritt | Gartenschritt | Montageschritt | Bauschritt | Tauchgang |
| je gefestigtem Thema | Buch | Blume | Stern | Buch | Perle |
| Ganzes | Deine Bastion | Dein Garten | Deine Raumstation | Dein Dorf | Deine Unterwasserstadt |
| Epoche 1 | Außenposten | Wildgarten | Forschungsstation | Weiler | Tauchstation |

*Umsetzung 2.11c (B-20):* `src/core/bastion/ziel.ts`. Jedes Angebot, das gerade nicht geht, hat „Vormerken“. Oben in der Bastion steht dann „Dein Ziel: …“ mit „Dafür fehlt noch: 60 Stein, 30 Erz“ und, falls etwas anderes im Weg steht, dem Grund (z. B. „Braucht zuerst: Bergfried Stufe 2“); sind alle Ressourcen da: „Alles da – du kannst es jetzt bauen.“ Gespeichert als Einstellung `basebau.ziel`; ist das Vorhaben begonnen, erlischt die Vormerkung von selbst.

Die Grafik (Stufe D) zeichnet zuerst nur das Thema Bastion, aber mit Bildern je Thema und Skin austauschbar. Später brauchen die Belagerungen (Phase 4) einen thema-neutralen Kern, etwa „Bewährungsprobe“.

### Stufe C – Balancing

| Nr. | Schritt | Kern der Sache | Prüfung |
|---|---|---|---|
| 2.11 ✅ | **Simulator** `tools/sim` (T-9) | spielt die Profile P1–P7 (§8) mit dem echten Kern durch und schreibt einen Bericht; nur Werkzeug, nicht in der App | Bericht erfüllt §8; sonst Kosten anpassen, dann Tageskurven, zuletzt Regeln |

### Stufe D – Grafik

| Nr. | Schritt | Kern der Sache | Prüfung |
|---|---|---|---|
| 2.12 ✅ | **PixiJS einbinden** (T-6) | genaue Version im Entscheidungslog (ARCHITEKTUR §4.6), nur nachgeladen bei aktivem Basebau, im Offline-Speicher, Budget ≤ 300 KB (ARCHITEKTUR §9) | Leistungsmessung, Offline-Test |
| 2.13 ✅ | **Bauplatz** | 12 × 12 Felder in Draufsicht (B-11), Gebäude im schlichten Stil aus dem Code (B-12), hell und dunkel; Feld antippen = Platz wählen, Versetzen; Umschalter zur gleichwertigen Listenansicht | Browser-Test mit Grafik und offline |
| 2.14 ✅ | **Gestalten** | Bannerfarbe, Zierde (Garten, Statue …) | Einheitentests |

*Umsetzung 2.12–2.13:* `src/ui/bastion/Bauplatz.svelte`, `src/ui/bastion/grafik/grafik-buehne.ts`. Je Rolle eine schlichte Form aus dem Code (Kern mit Zinnen, runder Turm, Dach der Werkstatt, Buch für Wissen, Tor mit Durchgang, Pfähle der Einfassung, Feuer, Fahne, Beet, Raute fürs Denkmal), Farbe je Familie, Stufe als Punkte, Neubauten im Bau als Umriss. **Antippen** wählt ein Gebäude; darunter erscheinen „Versetzen“, bei Zierde „Einlagern“, und „Fertig“. Nach „Versetzen“ versetzt ein Tipp auf ein freies Feld das Gebäude; auf einem belegten Feld steht „Dort ist kein Platz frei.“. **„Bild ausblenden – nur die Liste“** schaltet auf die reizarme Ansicht um (Einstellung `basebau.bild`); dann wird PixiJS gar nicht geladen. Neu gebaut wird weiter über die Liste (erstes freies Feld) und danach versetzt. Die Felder sind auf dem Handy etwa 30 Punkte groß – knapp unter der Empfehlung von 44; Zoom kommt bei Bedarf nach den Testrunden.

*Umsetzung 2.14:* Zierde (Zeichen, Fläche, Denkmal, Ursprung) bekommt eine selbst gewählte Farbe aus acht (Rot, Orange, Gelb, Grün, Blau, Lila, Weiß, Schwarz) – in der Liste bei jedem Zierstück und im Feld unter dem Bild, wenn es angetippt ist. Kostenlos, jederzeit änderbar, bleibt beim Einlagern erhalten. Bau-Aktion `gestalten` mit `gestaltung.farbe` (DATENMODELL §4.4); das Bild zeigt die gewählte Farbe statt der Farbe der Familie.

### Ausdrücklich nicht in diesem Plan

Epochen 2–4, Belagerungen (Phase 4), QR-Übertragung und Zeigen (Phase 3), Zeitsystem „15 Minuten Lernen → 5 Minuten Bastion“ (§6.2, kommt mit den Elternstufen), Testrunden (K-17).

### Offene Startwerte, die der Plan festlegt (Simulator prüft sie)

- **Rateregel (§3.1):** Eine falsche Antwort zählt als geraten bei weniger als 3 Sekunden (Auswahl) bzw. 5 Sekunden (Eingabe).
- **„Gefestigt“ für den Bauplan:** Der Lernkern hat schon eine Regel (`src/core/learning/fortschritt.ts`, LEHRPLAN §6). In Schritt 2.2 wird sie mit §3.3 (zwei bestandene Wiederholungen mit 7 Tagen Abstand, 90 %) abgeglichen. Bei Abweichung gilt eine einzige Definition für beide, damit Studierstube und „Mein Stand“ nie widersprechen.
