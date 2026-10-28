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

**Phase 1a – Klasse 5 vollständig aufbauen (K-15: Tiefe vor Breite, Klassenstufe für Klassenstufe).** Scope (K-11): Mathe in **Sachsen**, Klassenstufen **5–12**, alle allgemeinbildenden Schularten, Niveaus G und M. Klasse 6 erst, wenn Klasse 5 nach `STRATEGIE.md` §2 abgeschlossen ist. Vor jeder neuen Aufgabe gegen `PLAN.md` §2.1 (Nicht-Ziele) prüfen.

Vom Projektverantwortlichen (nicht delegierbar):
1. Kompetenzliste Klasse 5 (`LEHRPLAN.md` §8, 41 Kompetenzen) fachlich gegenlesen – sie ist aus den Lehrplänen abgeleitet, aber noch nicht von einer Lehrkraft geprüft.
2. **0.15** Erste 5–8 Testpersonen in Sachsen ansprechen (`TESTS.md` §2–3).
3. **0.14** Angebote nach Raster `WETTBEWERB.md` §5 durchspielen.
4. **0.17** K-14 entscheiden (freiwilliger Studienbericht).
5. **0.10** Drei Referenzgeräte festlegen und auf ihnen messen (Anleitung ARCHITEKTUR §9.2).

Vom Projektverantwortlichen, neu:
6. **Vorlagen prüfen (INHALTSFORMAT §10.1).** Alle 88 Vorlagen sind `herkunft: ki-entwurf`. Das Abschlusskriterium für Klasse 5 (`STRATEGIE.md` §2, Punkt 2) verlangt *geprüfte* Vorlagen. Am besten mit einer Lehrkraft, Kompetenz für Kompetenz.

Mit Claude Code, als Nächstes:
7. **Wiederholung (Phase 1b):** FSRS-Karten je Vorlage und Niveau (Projektion `karten`), fällige Aufgaben anbieten, dann „gefestigt“ und „auffrischen“ (LEHRPLAN §6). Vorher klären: ts-fsrs als Laufzeitabhängigkeit (T-5) – ist geplant, aber vor dem Einbau fragen. Danach Fehlerwerkstatt aus den Schnappschüssen.
8. Anleitungen (`anleitung`, L-10) für Zeichnen mit Geodreieck und Winkelmesser: GF.LAGE, GF.WINKEL, SY.SPIEGELN, KP.DARSTELLEN (`zeichnen_erklaert: true`) – nicht bewertet.
9. Laufzeit der Tests im Blick behalten: `pnpm test` dauert jetzt etwa eine Minute; die Würfelnetz-Tests allein etwa 20 Sekunden.

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
- 1578 Tests und 4 Browser-Tests, Lint, Build, Größenbudget (92 von 250 KB) grün. Branch `claude/new-session-fl56ro`, noch **nicht** nach `main` gebracht (wartet auf OK).

## Am Ende der Sitzung aktualisieren

- [ ] „Aktueller Auftrag“ auf den nächsten Schritt setzen
- [ ] „Übergabe der letzten Sitzung“ ersetzen
- [ ] `PLAN.md` Stand und Checkboxen aktualisieren
