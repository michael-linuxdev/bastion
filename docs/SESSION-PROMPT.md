# Session-Prompt

> Diese Datei ist der Einstieg in jede Arbeitssitzung – allein oder mit KI-Unterstützung.
> Am Ende jeder Sitzung wird sie aktualisiert und mit committet.

Stand: 27.10.2026 (10) · Phase 0 – Fundament

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
1a. I-11 (neue Aufgabentypen für Bilder, Koordinaten, Anleitungen) bestätigen.
2. **0.15** Erste 5–8 Testpersonen in Sachsen ansprechen (`TESTS.md` §2–3).
3. **0.14** Angebote nach Raster `WETTBEWERB.md` §5 durchspielen.
4. **0.17** K-14 entscheiden (freiwilliger Studienbericht).
5. **0.10** Drei Referenzgeräte festlegen und auf ihnen messen (Anleitung ARCHITEKTUR §9.2).

Mit Claude Code, als Nächstes:
6. Die 41 Kompetenzen der Klasse 5 als YAML in `content/` anlegen (INHALTSFORMAT §3, mit Feld `sachsen`) und ein kleines Prüfwerkzeug für Graph und Verweise (INHALTSFORMAT §10.1, Punkte 1–3).
7. Generatoren entlang des Graphen von der Wurzel aus: `M.ZO.NZ.STELLENWERT`, `NZ.ORDNEN`, `NZ.RUNDEN` … – jeweils mit `pflichttests`.
8. Danach: Kompetenzgraph laden und eine erste Übungsseite, die eine Generator-Aufgabe anzeigt und die Antwort mit Fehlerbild-Rückmeldung auswertet.

## Übergabe der letzten Sitzung

- PR #1 gemergt; https://bastion.micana.de/ wird bei jedem Push auf `main` veröffentlicht (Deploy-Lauf grün).
- **Scope zweimal geändert (K-11):** erst Kl. 5–13 statt 5–6, dann präzisiert auf **Sachsen, Kl. 5–12, alle Schularten**. K-8 für die Mathe-Oberstufe aufgehoben. Neue Entscheidung **L-9**: Kompetenzen bekommen eine Zuordnung zu den sächsischen Lehrplänen je Schulart (Feld `sachsen`), der Graph bleibt länderneutral, keine Bundesland-Abfrage. Elternstufe „selbstverwaltet“ jetzt im Scope (Oberstufe).
- Hinweis aus der Recherche: Brüche am sächsischen Gymnasium schon in Kl. 5 („Gemeine Brüche und Dezimalzahlen“, Lehrplan 2019), an der Oberschule in Kl. 6 – am Original zu prüfen (0.18).
- **0.10 teilweise:** `pnpm messen` (`tools/messung.ts`) misst den Build auf einem nachgeahmten Altgerät (CPU ÷6, langsames 4G). Gerüst-App: nutzbar nach ca. 0,7 s online, 0,3 s offline (ARCHITEKTUR §9.2). Echte Referenzgeräte stehen aus.
- **Erster Generator:** `bruch.erweitern-zielnenner@1` in `src/generators/mathematik/brueche/`. Typen liegen bewusst im Kern (`src/core/learning/generator.ts`, `bruch.ts`), weil die Auswertung sie braucht (INHALTSFORMAT §6, Umsetzung). Die Pflicht-Tests aus INHALTSFORMAT §6.3 sind ein wiederverwendbarer Baustein (`src/generators/pflichttests.ts`, 10 000 Seeds je Niveau); per absichtlich eingebauten Fehlern geprüft, dass sie anschlagen.
- Fehlerbilder mit gleicher falscher Antwort: Der Generator meldet nur das vorrangige (INHALTSFORMAT §7).
- **K-15 (neu):** Inhalte Klassenstufe für Klassenstufe, zuerst Klasse 5 vollständig (über alle Schularten; ein Thema gehört zur früheren Klassenstufe, wenn es an einer Schulart dort liegt). Abschlusskriterien je Klassenstufe in `STRATEGIE.md` §2. Ersetzt die Wellen nach Themen. Der Bruch-Generator passt dazu (Brüche: Gymnasium Kl. 5).
- **K-16 (neu):** Die sächsischen Lehrpläne Mathematik (OS 2019, GY 2021) sind bindend. Ausgewertet für Klasse 5: 41 Kompetenzen in `LEHRPLAN.md` §8, einschließlich Koordinaten, Winkel, Symmetrie, Rechtecke, Würfel/Quader. Erweitern/Kürzen liegt am GY in Kl. 5 (OS Kl. 6) und gehört deshalb zu Klasse 5. Rechnen mit Brüchen ist Klasse 6. Geometrie und Diagramme aus den Nicht-Zielen gestrichen.
- **L-10:** Zeichnen und Konstruieren erklärt die App, geprüft wird nur das Prüfbare. **L-11:** Wahlbereiche zählen nicht zum Abschluss einer Klassenstufe.
- Lehrplan-PDFs bewusst nicht im Repository (Weitergaberecht ungeklärt); Fundstellen in `docs/quellen/README.md`.
- 51 Tests, Lint, Build und Budget grün.

## Am Ende der Sitzung aktualisieren

- [ ] „Aktueller Auftrag“ auf den nächsten Schritt setzen
- [ ] „Übergabe der letzten Sitzung“ ersetzen
- [ ] `PLAN.md` Stand und Checkboxen aktualisieren
