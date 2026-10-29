# Session-Prompt

> Diese Datei ist der Einstieg in jede Arbeitssitzung – allein oder mit KI-Unterstützung.
> Am Ende jeder Sitzung wird sie aktualisiert und mit committet.

Stand: 29.10.2026 (16) · Phase 1 – Lernkern; Klasse 5 bis 8 als Entwurf, Grafik in Richtung A umgesetzt (K-22)

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

**Zu Beginn der Sitzung den Projektverantwortlichen fragen, womit es weitergeht** (entschieden am 29.10.2026). Nichts davon ohne diese Antwort beginnen. Zur Auswahl stehen:

0. **Grafik nachbessern (K-22)** – der Umbau auf Richtung A ist fertig (`GRAFIK.md` §5, PRs #42 bis #45).
   - Rückmeldungen der drei Testerinnen (12 bis 16 Jahre, `TESTS.md` §2) einarbeiten.
   - Noch im alten Stil: Diagnose, Mein Stand, Fehlerwerkstatt, Klassenarbeit, Elternbereich, Sicherung. Sie nutzen die neuen Tokens, haben aber noch eigene Knopfstile. Sie lassen sich Schritt für Schritt auf die gemeinsamen Knöpfe `haupt`, `zweit` und `dezent` umstellen.
   - Später: lebendige Szenen, Jahreszeiten, Wetter (T-15, nur freiwillig) und Skins (B-27).
1. **Klasse 9** (K-20; die Grafik ist umgesetzt, Klasse 9 kann beginnen): Lehrpläne auswerten (OS und GY; die PDFs gibt der Projektverantwortliche), Kompetenzen und Graph in `LEHRPLAN.md` §8e, dann Vorlagen Feld für Feld wie bei Klasse 5 bis 8. Danach Klasse 10 bis 12, dann Mathe im Studium (K-19). Ein früherer Entwurf für Klasse 9 wurde verworfen. Klasse 9 beginnt neu.
2. **Offene Reste:**
   - Anrede „Sie“ für Erwachsene (L-15). Dafür braucht es eine zweite Fassung aller Texte; vorher fragen, wie.
   - Wiederholungen bis zum Termin der Klassenarbeit planen (L-19).
   - „Gerade dran“-Themen beim Wiederholen öfter drannehmen (L-18).
   - `M.GM.FL.DREIECK` hat auf Niveau G nur eine Vorlage. Es braucht zwei (`pnpm inhalte:pruefen`).
3. **Prüfen und testen:** Vorlagen von Klasse 5 bis 8 mit einer Lehrkraft durchgehen. Die App könnte Hilfen fürs Prüfen bekommen (INHALTSFORMAT §8).

Rahmen: Mathe in **Sachsen**, Klasse 5–12, alle allgemeinbildenden Schularten, Niveaus G und M (K-11, K-15, K-17). Auch Erwachsene nutzen die App (K-21). MINT-Kontexte kommen erst nach Klasse 12 und lassen sich abschalten (L-14). Vor jeder neuen Aufgabe gegen `PLAN.md` §2.1 (Nicht-Ziele) prüfen.

Gemerkt für später (nicht jetzt umsetzen): Prüfungen entwerfen bis zum Abitur, mit Lösungen und zum Drucken (`LEHRPLAN.md` L-20).

**Arbeitsregel (Projektverantwortlicher, 28.10.2026, bestätigt 29.10.2026):** Jeder fertige Schritt kommt gleich per PR auf `main`. Ablauf:

1. PR öffnen und abonnieren.
2. Nach grüner CI per Squash mergen.
3. `main` mit `git merge -s ours origin/main` in den Arbeitsbranch übernehmen.
4. Pushen.

Fragen vorher stellen, nicht raten.

### Vom Projektverantwortlichen (nicht delegierbar)

1. **Inhalte prüfen (INHALTSFORMAT §10.1, §11.1, §4.3).** Alles ist KI-Entwurf: 255 Vorlagen zu 123 Kompetenzen (Klasse 5 bis 8), 15 Zeichen-Anleitungen und 197 Fachbegriffe in `content/mathematik/begriffe.yaml`. Das Abschlusskriterium einer Klasse (`STRATEGIE.md` §2) verlangt *geprüfte* Vorlagen. Am besten mit einer Lehrkraft, Kompetenz für Kompetenz.
2. Die Kompetenzlisten (`LEHRPLAN.md` §8 bis §8d) fachlich gegenlesen.
3. Lehrplan-PDFs für Klasse 9 (OS, GY) bereitstellen, sobald Klasse 9 dran ist.
4. **0.15** Testpersonen in Sachsen ansprechen (`TESTS.md` §2–3). Nach K-17 erst, wenn der Lehrplan bis Klasse 12 steht.
5. **0.14** Angebote nach dem Raster in `WETTBEWERB.md` §5 durchspielen.
6. **0.17** K-14 entscheiden (freiwilliger Studienbericht).
7. **0.10** Drei Referenzgeräte festlegen und darauf messen (Anleitung in ARCHITEKTUR §9.2).

## Übergabe der letzten Sitzung (29.10.2026)

**Was dazukam: Grafik in Richtung A „Tag, warm“ (K-22), in vier PRs:**

- **#42 Grundlage:**
  - Alle Farben, die Schrift und die Formen stehen als Fassung „tag-warm“ in `src/ui/grafik/fassungen.ts`, hell und dunkel. Ein Test prüft den Kontrast.
  - `darstellung.svelte.ts` schreibt die Tokens an `<html>`.
  - Unter „Über mich“ steht die Wahl „Aussehen“: Wie das Gerät, Hell oder Dunkel (Abend). Einstellung `darstellung.modus`.
  - Die Schrift Nunito wird mitgeliefert (`@fontsource-variable/nunito`, T-16).
  - Die Knöpfe `haupt`, `zweit` und `dezent` sind global in `grund.css` gestaltet.
- **#43 Startseite** (`src/ui/start/`):
  - Datum und Begrüßung, eine kleine Bastion als Bild, der große Knopf „Üben“ mit „Gerade dran“ und vier Kacheln.
  - Die Leiste unten (Start, Üben, Bastion, Mehr) ist in allen Ansichten sichtbar.
- **#44 Üben:**
  - Kopf mit Thema, Niveau als Schild und Punkten für die Runde: Blöcke zu fünf Aufgaben, danach ein Pausenhinweis (R5).
  - Die Knöpfe heißen „Prüfen“ und „Tipp“. Die Rückmeldung erscheint als Fläche.
- **#45 Bastion:**
  - Die Insel steht schräg von oben (`iso.ts`, `grafik-buehne.ts`). Am Abend stehen Mond und Sterne am Himmel, und die Fenster leuchten.
  - Vier Karten zeigen den Vorrat. Das vorgemerkte Ziel hat einen Fortschrittsbalken.
  - B-11 (Draufsicht) ist abgelöst.
- **#46 „Mehr“:** Auf Wunsch des Projektverantwortlichen passt die Startseite auf das iPhone 13. Sicherung, Über mich, Klassenarbeit, Für Eltern, Mein Stand, der Name und das Versprechen stehen unter „Mehr“ in der Leiste.

**Lehren:**

- Knöpfe gibt es jetzt doppelt, auf der Seite und in der Leiste. Browser-Tests suchen sie deshalb mit `page.getByRole('main').getByRole('button', …)`. Für Einträge unter „Mehr“ gibt es die Hilfsfunktion `mehr(page)`.
- Auf dem Bauplatz tippen die Tests über `punkt()` aus `src/ui/bastion/grafik/iso.ts`. Das ist dieselbe Rechnung wie in der App.
- Lokal überschreitet `fk.graph-ablesen` im vollen Testlauf die Zeitgrenze von 5 s. Das passiert auf diesem Rechner auch auf `main`, in der CI nicht.
- Prozesse nie mit `pkill -f "vite preview"` beenden. Das Muster trifft auch die eigene Shell. Stattdessen `pkill -f "[v]ite preview --port 4173"`.

**Zahlen:**

- Etwa 4454 Einheitentests und 37 Browser-Tests. Die Browser-Tests, Lint und Build sind grün. Bei den Einheitentests überschreitet lokal nur `fk.graph-ablesen` die Zeitgrenze (siehe oben).
- App-Hülle 129,8 KB von 250 KB.
- Bis #45 ist alles auf `main`. #46 („Mehr“) ist der letzte PR dieser Sitzung.

## Am Ende der Sitzung aktualisieren

- [ ] „Aktueller Auftrag“ auf den nächsten Schritt setzen
- [ ] „Übergabe der letzten Sitzung“ ersetzen
- [ ] `PLAN.md` Stand und Checkboxen aktualisieren
