# Session-Prompt

> Diese Datei ist der Einstieg in jede Arbeitssitzung – allein oder mit KI-Unterstützung.
> Am Ende jeder Sitzung wird sie aktualisiert und mit committet.

Stand: 29.10.2026 (15) · Phase 1 – Lernkern; Klasse 5 bis 8 als Entwurf, L-15 bis L-19 umgesetzt

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

0. **Grafik deutlich ansprechender machen (K-22)** – *muss vor Klasse 9 kommen.* Drei Testerinnen von 12 bis 16 Jahren stehen bereit (`TESTS.md` §2). Vor Beginn fragen: Was genau soll anders aussehen, welcher Weg (eigener Stil aus dem Code, freie Grafikpakete, Auftrag) und was zuerst (Bastion, Startseite, Üben)?
1. **Klasse 9** (K-20, erst nach Punkt 0): Lehrpläne auswerten (OS und GY; die PDFs gibt der Projektverantwortliche), Kompetenzen und Graph in `LEHRPLAN.md` §8e, dann Vorlagen Feld für Feld wie bei Klasse 5 bis 8. Danach Klasse 10 bis 12, dann Mathe im Studium (K-19). Ein früherer Entwurf für Klasse 9 wurde verworfen. Klasse 9 beginnt neu.
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

## Übergabe der letzten Sitzung (28./29.10.2026)

**Was seit der vorigen Übergabe dazukam:**

- **Klasse 7 und 8 sind als Entwurf fertig** (§8c, §8d):
  - Klasse 7: 29 Kompetenzen, 60 Vorlagen, 4 Anleitungen.
  - Klasse 8: 27 Kompetenzen, 54 Vorlagen, 3 Anleitungen.
  - Die Klassenwahl umfasst 5 bis 8 (`src/ui/ueben/klassen.ts`).
- **Basebau Epoche 1 ist vollständig** (BASEBAU §11). Dazu kommen:
  - Startpaket für Späteinsteiger (B-24).
  - Hinterhof mit dem Können je Lernfeld (B-25).
- **Generatoren werden nachgeladen und vorab gespeichert** (T-14, `src/generators/alle.ts`). Die App-Hülle hat 125,6 KB von 250 KB.
- **Wechsel begleiten (L-12)**, `src/core/learning/wechsel.ts`:
  - Überspringen: Der Hinweis zeigt die offenen Themen je übersprungener Klasse (`klassenLuecken`). „Lücken gezielt prüfen“ startet eine Diagnose genau dieser Themen.
  - Schulartwechsel: Der Hinweis zeigt die Themen, die nun früher drankommen.
  - Zurückstellen bleibt neutral, ohne Meldung.
- **Bericht für die Lehrkraft (L-13)** im Elternbereich, auch als Textdatei.
- **Profil (L-15):**
  - „Über mich“ mit freiwilligem Geburtsdatum und „Ich bin erwachsen“ (`src/core/policy/alter.ts`).
  - Ab 18 gibt es keinen Elternbereich mehr. Der Bericht heißt dann „Mein Bericht“.
- **Wiedereinstieg (L-16):** Die Diagnose „Alles ab Klasse 5“ endet mit „Dein Stand entspricht etwa Klasse N“ (`standKlasse`, Schwelle 70 %).
- **Klasse pflegen (L-17):**
  - Klasse und Schulart werden gemerkt und lassen sich auch im Elternbereich ändern.
  - Ab 1. August fragt die App einmal „Neues Schuljahr!“.
- **Gerade dran (L-18):** Lernbereiche oder einzelne Themen wählen. Diese Themen stehen in der Übersicht oben.
- **Klassenarbeit (L-19):**
  - Termin und Themen eintragen, „Das solltest du noch üben“.
  - Probe-Klassenarbeit: Diagnose im Modus `pruefung`.
  - Die Startseite zeigt nur das Datum, ohne Countdown.
- **Sicherung:** Ein Profil, das nur Einstellungen hat, gilt als leer. Eine Sicherung lässt sich also auch einspielen, wenn man vorher schon die Klasse gewählt hat.

**Lehren:**

- Browser-Tests müssen vor `page.reload()` warten, bis gespeichert ist. Dafür gibt es `expect.poll(() => einstellungImSpeicher(page, '…'))`. Sonst bricht das Neuladen auf dem langsameren CI-Rechner das Speichern ab. Lokal lässt sich das mit CPU-Drosselung nachstellen.
- Lint-Regeln für Svelte:
  - `$derived` statt `$state` mit `$effect`.
  - Kein veränderliches `Set` oder `Map` im Komponentenzustand.
  - Startwerte aus Props mit `untrack`.
- `getByText` mit regulärem Ausdruck findet Text nicht, der im Markup umbrochen ist. Den Text darum in einem Stück ausgeben.

**Zahlen:** 4442 Einheitentests und 34 Browser-Tests, alle grün; Lint und Build auch. PRs bis #38 sind auf `main`.

## Am Ende der Sitzung aktualisieren

- [ ] „Aktueller Auftrag“ auf den nächsten Schritt setzen
- [ ] „Übergabe der letzten Sitzung“ ersetzen
- [ ] `PLAN.md` Stand und Checkboxen aktualisieren
