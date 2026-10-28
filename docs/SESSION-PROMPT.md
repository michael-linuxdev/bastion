# Session-Prompt

> Diese Datei ist der Einstieg in jede Arbeitssitzung – allein oder mit KI-Unterstützung.
> Am Ende jeder Sitzung wird sie aktualisiert und mit committet.

Stand: 28.10.2026 (14) · Phase 0 – Fundament, Phase 1a begonnen

---

## Rolle

Du bist technischer und konzeptioneller Lead für **Bastion**, den Nachfolger der Lern-App „Lerninsel“: eine offline-fähige, datenschutzstarke Lern-App für Klasse 5–13 und berufsbildende Schulen (Start: Mathe in Sachsen, Kl. 5–12), in der nachgewiesene Kompetenz durch einen optionalen, langfristigen Basebau sichtbar wird.

Das Projekt wird von **einer Person** entwickelt. Plane entsprechend: kleine Schritte, jede Phase für sich nutzbar.

## Unveränderliche Grundprinzipien

1. Erst lernen, dann spielen/bauen.
2. Offline-first.
3. Datenschutz zuerst – keine Daten verlassen das Gerät ohne ausdrückliche Nutzeraktion; kein Account, kein Tracking.
4. Keine Werbung, keine In-App-Käufe, keine Lootboxen.
5. Eltern als letzte Instanz (PIN), altersgerecht abnehmend.
6. Kein sozialer Druck – keine Ranglisten, kein PvP, kein FOMO.
7. Mehrsprachigkeit & DaZ bleiben zentral.
8. Kompetenz vor Stoff.

Dazu die Design-Regeln R1–R7 (`VISION.md` §7): keine Zufallsbelohnungen, keine Echtzeit-Timer, kein Verfall, Qualität vor Menge, natürliche Pausenpunkte, Fehler als Rohstoff, Basebau ohne Nachteil abschaltbar.

## Arbeitsweise

- Dokumente vor Code. Jede größere Entscheidung mit Begründung im passenden Entscheidungslog.
- Eigene Vorschläge kritisch prüfen, besonders bei Motivation, Balancing und pädagogischer Sauberkeit.
- Bei Widerspruch zwischen Dokumenten gilt das speziellere (z. B. `BASEBAU.md` vor `KONZEPT.md` §5) – und der Widerspruch wird behoben.
- Rückfragen stellen, wenn wichtige Informationen fehlen.
- Auf Deutsch arbeiten.

## Dokumente (Lesereihenfolge)

1. `docs/VISION.md` – Warum, für wen, Prinzipien; §11 Scope-Grenze bis Monat 12
2. `docs/STRATEGIE.md` – Ziel, Scope und Erfolgskriterien für 12 Monate
3. `docs/PLAN.md` – aktueller Stand, Aufgaben, **Nicht-Ziele bis Monat 12**
4. `docs/KONZEPT.md` – Gesamtkonzept, Roadmap, offene Entscheidungen
5. je nach Aufgabe: `docs/WETTBEWERB.md`, `docs/TESTS.md`, `docs/ARCHITEKTUR.md`, `docs/BASEBAU.md`, `docs/LEHRPLAN.md`, `docs/INHALTSFORMAT.md`, `docs/DATENMODELL.md`

## Aktueller Auftrag

**Basebau Epoche 1 bauen (K-18)**, danach Klasse 7 (Phase 1a–1c für Klasse 5, Klasse 6 als Entwurf fertig). Rahmen: **K-17** – der Lehrplan wird Klassenstufe für Klassenstufe bis Klasse 12 aufgebaut (K-15), Prüfung der Vorlagen und Testrunden kommen gesammelt danach. Scope (K-11): Mathe in **Sachsen**, Klassenstufen **5–12**, alle allgemeinbildenden Schularten, Niveaus G und M. Lehrpläne Klasse 6 sind ausgewertet: 26 Kompetenzen in `LEHRPLAN.md` §8b und `content/`. **Klasse 6 ist inhaltlich abgedeckt (als Entwurf):** alle 26 Kompetenzen haben Vorlagen – BR 23, ZU 8, ZF/DA 4, DV 10, FL 4, KP 4, zusammen 53 Vorlagen, dazu 3 Anleitungen (Dreieck aus drei Seiten, Mittelsenkrechte, Schrägbild eines Prismas). Übersicht, „Mein Stand“ und Diagnose haben eine Klassenwahl (5 oder 6). Klasse 6 ist per PR #12 auf `main`. **Nächster Schritt: Basebau Epoche 1 nach K-18** (`BASEBAU.md` §11), Stufe A (2.1–2.4: Sitzungen, Ledger-Regeln, Buchungen und Konto, Abschluss mit Ressourcen) steht; 2.5 Gebäudekatalog, 2.6 Bauen, 2.7 Basebau-Schalter und 2.8 Listenansicht stehen – man kann bauen; als Nächstes 2.9 Studierstube; danach Klasse 7. Vor jeder neuen Aufgabe gegen `PLAN.md` §2.1 (Nicht-Ziele) prüfen.

Vom Projektverantwortlichen (nicht delegierbar):
1. Kompetenzliste Klasse 5 (`LEHRPLAN.md` §8, 41 Kompetenzen) fachlich gegenlesen – sie ist aus den Lehrplänen abgeleitet, aber noch nicht von einer Lehrkraft geprüft.
2. **0.15** Testpersonen in Sachsen ansprechen (`TESTS.md` §2–3) – nach K-17 erst, wenn der Lehrplan bis Klasse 12 steht.
3. **0.14** Angebote nach Raster `WETTBEWERB.md` §5 durchspielen.
4. **0.17** K-14 entscheiden (freiwilliger Studienbericht).
5. **0.10** Drei Referenzgeräte festlegen und auf ihnen messen (Anleitung ARCHITEKTUR §9.2).

Vom Projektverantwortlichen, neu:
6. **Vorlagen, Fachbegriffe und Anleitungen prüfen (INHALTSFORMAT §10.1, §11.1, §4.3).** Alle 88 Vorlagen, die 5 Zeichen-Anleitungen und die 83 Erklärungen in `content/mathematik/begriffe.yaml` sind KI-Entwurf. Das Abschlusskriterium für Klasse 5 (`STRATEGIE.md` §2, Punkt 2) verlangt *geprüfte* Vorlagen. Am besten mit einer Lehrkraft, Kompetenz für Kompetenz.

Mit Claude Code, als Nächstes:
7. **Klasse 6 (K-17):** Generatoren und Vorlagen für die 26 Kompetenzen (§8b), je Niveau mindestens zwei, entlang des Graphen. Erledigt als Entwurf: 53 Vorlagen, 3 Anleitungen; Übersicht, „Mein Stand“ und Diagnose mit Klassenwahl (`src/ui/ueben/KlassenWahl.svelte`). Die Diagnose prüft nur die gewählte Klasse; die Klasse bleibt fest, sobald die erste Antwort gegeben ist.
8. Laufzeit der Tests im Blick behalten: `pnpm test` dauert jetzt etwa eine Minute; die Würfelnetz-Tests allein etwa 20 Sekunden.

## Übergabe der letzten Sitzung

- **Klasse 5 inhaltlich abgedeckt (als Entwurf):** Alle 41 Kompetenzen haben mindestens zwei Vorlagen je Niveau G und M – 88 Vorlagen, 68 Generatoren, alle mit Pflicht-Tests (10 000 Seeds je Niveau). `pnpm inhalte:pruefen` zeigt die Abdeckung.
- **Neu in dieser Sitzung** (je ein Commit „1a: …“): Vergleichszeichen, Runden, schriftliches Rechnen, Stufenzahlen, Potenzen, Rechengesetze, Terme, Gleichungen, Teilbarkeit, Brüche (Begriff mit Bildern, Kürzen, Vergleichen, Umwandeln, Prozent), Dezimalzahlen, Mittelwert, Größen, Koordinaten, Spiegeln und Verschieben, Symmetrie, Lagebeziehungen, Winkel, Winkelpaare, Flächen- und Volumeneinheiten, Rechteck, L-Figuren, Volumen, Oberfläche, Würfelnetze.
- **Generatoren registrieren sich selbst:** Jeder exportierte Generator unter `src/generators/mathematik/` ist über `import.meta.glob` im Verzeichnis (`src/generators/index.ts`); die Inhaltsprüfung verlangt, dass jeder von einer Vorlage genutzt wird.
- **Bilder als SVG** (I-11): Hilfen in `src/generators/svg.ts` (Linien, Vielecke, Bögen, Kästchen, Koordinatensystem …), Farbe über `currentColor`. Jedes Bild hat eine Beschreibung für Screenreader. Die Pflicht-Tests prüfen, dass Bilder nichts nachladen.
- **Unabhängige Prüfung in den Tests:** Wo möglich lesen die Tests die Lösung aus dem Bild zurück, statt die Formel des Generators zu wiederholen – z. B. Fläche und Umfang aus dem gezeichneten Vieleck, Winkel aus den Bögen, Würfelnetze per Drehmatrizen statt Abrollen.
- **Pflicht-Tests:** neues optionales `zeitlimitMs` für rechenintensive Generatoren (INHALTSFORMAT §6.3); die Zahl der Seeds bleibt 10 000.
- **Umrechnungs-Generator** `gr.einheiten-umrechnen@1` kennt jetzt auch Flächen, Volumen und ml/l. Für die bisherigen Größen bleibt jede Aufgabe gleich, deshalb keine neue Version.
- Kommazahlen rechnen die Generatoren intern als ganze Zahlen (Hundertstel, Tausendstel), damit keine Gleitkommafehler entstehen.
- Abwechslungs-Schwellen in den Tests sind gemessen und stehen mit Kommentar „gemessen“ im Test.
- **Erste Übungsseite** (Start → „Üben“): Übersicht der Klasse 5 nach Bereich, entlang des Graphen, Wahl von Niveau G oder M; Aufgabe mit Bild, Eingabe passend zur Lösungsart, Rückmeldung zum Fehlerbild, Hilfen, Lösungsweg. Inhalte kommen als Pakete von der eigenen Adresse (`tools/inhalte/pakete.ts`) und gehen offline. Kern: `src/core/learning/auswertung.ts`, `text.ts`, `uebung.ts`; Oberfläche: `src/ui/ueben/`. Ergebnisse werden gespeichert (siehe unten).
- **Ergebnisse speichern (1b begonnen):** Jede geprüfte Antwort wird als Ereignis `aufgabe` gespeichert (`src/core/learning/ereignis.ts`), der Status je Kompetenz und Niveau fortgeschrieben (`fortschritt.ts`: neu, in Arbeit, gekonnt; Pflicht-Test D-6). Ablage mit Dexie 4.4.6 in `src/storage/` (vom Projektverantwortlichen freigegeben). Die Übersicht zeigt „in Arbeit“ und „✓ gekonnt“. PR #3 ist gemergt; die Arbeit läuft auf demselben Branch weiter.
- **Wiederholung (1b):** FSRS-Karten je Vorlage und Niveau (`src/core/srs/karten.ts`, ts-fsrs 5.4.2, freigegeben; ohne Zufall und ohne Minuten-Lernschritte). Startseite zeigt „Wiederholen“ mit der Zahl fälliger Aufgaben; eine Runde arbeitet die fälligen Karten ab und endet mit einem Pausenhinweis (R5). Status bis „gefestigt“ (fällige Wiederholungen bestanden, ≥ 7 Tage nach „gekonnt“, Erinnerung ≥ 90 %) und „auffrischen“ (< 80 %). PR #4 ist gemergt.
- **Fehlerwerkstatt (1b):** Startseite zeigt „Fehlerwerkstatt“, wenn offene Fehler da sind. Gruppiert nach Ursache – mit der Rückmeldung des Fehlerbilds als Überschrift; Fehler ohne Muster je Kompetenz. „Aufarbeiten“ zeigt genau die damalige Aufgabe (gleicher Seed) mit der damaligen Antwort; richtig gelöst ist der Fehler erledigt (`korrigiert`). Kern: `src/core/learning/werkstatt.ts`. Die Belohnung fürs Korrigieren (R6) folgt mit dem Basebau-Ledger. PR #5 (Wiederholung) ist gemergt.
- **Rückkehrmodus (1b):** nach mehr als 7 Tagen ohne Aufgabe Begrüßung ohne Vorwurf, keine Pausenlänge; jede Wiederholungsrunde höchstens 20 Aufgaben, die gefährdetsten zuerst (`src/core/srs/rueckkehr.ts`). Phase 1b ist damit bis auf die Belohnung fürs Korrigieren (R6, braucht den Ledger) fertig.
- Lehre aus der CI: Browser-Tests müssen warten, bis im Hintergrund gespeichert ist, bevor sie neu laden (z. B. „in Arbeit“ in der Übersicht abwarten).
- **Diagnose (1c):** „Wo stehe ich?“ auf der Startseite (`src/core/learning/diagnose.ts`, `src/ui/ueben/Diagnose.svelte`). Testet je Schritt die Kompetenz, deren Ergebnis am meisten entscheidet, zwei Aufgaben je Kompetenz (bei 1 : 1 eine dritte), höchstens 30 in zwei Etappen; keine Wertung, keine Hilfen, „Weiß ich nicht“ erlaubt und kein Fehler für die Werkstatt. Ergebnis: Empfehlungen mit „Üben“-Knopf und Liste dessen, was sitzt. Getestet bestanden → „gekonnt“; Gefolgertes wird nicht gespeichert. Diagnose-Aufgaben ohne FSRS-Bewertung. Ehrliche Grenze: Bei sehr Starken bleiben wegen der 21 Endpunkte des Graphen Themen ungetestet. PR #6 ist gemergt.
- **Kompetenzansicht (1c):** „Mein Stand“ auf der Startseite – Zusammenfassung, Empfehlungen, Abschnitte „Wackelt gerade“, „In Arbeit“, „Gekonnt“ (mit nächster Wiederholung), „Gefestigt“, jeweils mit Erklärung in einfacher Sprache; „empfohlen“ in der Übersicht (L-5); Rückweg bei Fehlern nach drei Fehlern in Folge (`src/core/learning/empfehlung.ts`). PR #7 (Diagnose) ist gemergt.
- **Elternbereich (1c, D-14):** „Für Eltern“ auf der Startseite. Beim ersten Öffnen PIN festlegen (4–8 Ziffern, PBKDF2 über WebCrypto), danach einmalig ein Wiederherstellungscode aus vier Wörtern (D-12) zum Aufschreiben; „PIN vergessen?“ setzt mit dem Code zurück. Standard ist die einfache Ansicht (Themen mit Status je Niveau, Wochen mit Lerntagen und Aufgaben), auf Wunsch die ausführliche (letzte 100 Aufgaben mit Zeit, Ergebnis, Fehlerbild, Hilfen, Dauer). Jugendliche sehen genau das unter „Mein Stand“ → „Was meine Eltern sehen“. PIN und Code sind Einstellungs-Ereignisse (D-5), geheim und nur gehasht. Ehrlicher Hinweis: Eine PIN auf dem Gerät des Kindes ist eine Hürde, keine Festung.
- **Sicherung (1c, DATENMODELL §7):** „Sicherung“ auf der Startseite. Erstellen zeigt einen Code aus **sechs** Wörtern (D-9, geändert: vier Wörter wären zu leicht durchzuprobieren) und speichert die verschlüsselte Datei `bastion-sicherung-JJJJ-MM-TT.bastion` (AES-GCM, PBKDF2 600 000, gzip; `src/ui/plattform/sicherung.ts`). Einspielen vereinigt die Ereignisse (D-10), legt vorher eine lokale Sicherung an und baut alle Projektionen neu auf. Eine Sicherung eines anderen Profils übernimmt das Gerät nur, wenn dessen Profil noch leer ist. Erinnerung auf der Startseite, Standard monatlich; Eltern stellen sie im Elternbereich ein oder ab (D-O4). Elternbereich zeigt letzte Sicherung und ob der Browser die Daten behalten will.
- **D-15:** Die PIN gilt je Gerät. Nach dem Einspielen auf einem anderen Gerät wird eine neue PIN festgelegt; das steht dann dauerhaft im Elternbereich und unter „Mein Stand“.
- **Abschlussbildschirm (1a):** Knopf „Fertig für heute“ beim Üben, Wiederholen und in der Werkstatt. Zeigt zuerst das Können (heute gefestigt, neu gekonnt, geübt), dann Zahlen (Aufgaben, Wiederholungen, aufgearbeitete Fehler), ohne Punkte und Prozente, und schlägt eine Pause vor (R5). Berechnet aus den Aufgaben des Lerntags (`src/core/learning/heute.ts`).
- **Fachbegriffe (1a, L-7):** Wörterbuch `content/mathematik/begriffe.yaml` (83 Begriffe), in Texten als `[[Form]]` markiert und antippbar; Erklärung erscheint direkt dahinter. `pnpm test` verlangt die Markierung beim ersten Vorkommen je Text; `pnpm inhalte:begriffe` markiert automatisch. In der Diagnose keine Erklärungen (keine Hilfen).
- **Zeichen-Anleitungen (1a, L-10):** fünf Anleitungen (Senkrechte, Parallele, Winkel 50°, Spiegeln auf Kästchenpapier, Würfel aus Papier) in `content/…/anleitungen/*.yaml`, Bilder je Schritt aus `src/generators/anleitungen/`. Beim Üben der Kompetenz unter „Zeichnen lernen“; am Ende eine Prüfliste zum Abhaken, nicht gespeichert, nicht bewertet (INHALTSFORMAT §4.3).
- Sicherung ist mit PR #9 auf `main`; Abschluss und Fachbegriffe stehen in PR #10. Die Anleitungen liegen auf dem Branch `claude/new-session-fl56ro`.
- **Klasse 6 (K-17):** Lehrpläne OS 2019 und GY 2021 für Klasse 6 ausgewertet (PDFs vom Projektverantwortlichen). 26 Kompetenzen in sechs Feldern, neue Felder ZU, ZF, DV. Vorgezogen fürs GY: Kreisdiagramme, Flächenanteile, Prismen berechnen (OS Kl. 7). Nicht abbildbar: Präsentationen, Modellbau, DGS, Taschenrechner.
- 1650 Tests und 14 Browser-Tests, Lint, Build, Größenbudget (120 von 250 KB) grün.

## Am Ende der Sitzung aktualisieren

- [ ] „Aktueller Auftrag“ auf den nächsten Schritt setzen
- [ ] „Übergabe der letzten Sitzung“ ersetzen
- [ ] `PLAN.md` Stand und Checkboxen aktualisieren
