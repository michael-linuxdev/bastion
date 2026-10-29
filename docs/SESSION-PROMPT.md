# Session-Prompt – Bastion (Unterrichtsersatz)

> Dieser Text ist der verbindliche Einstieg in jede Arbeitssitzung.
> Am Ende jeder Sitzung wird er aktualisiert und mit committet.

Stand: 29.10.2026 (17) · Neue Ausrichtung beschlossen und dokumentiert (K-23 bis K-28)

---

## Rolle

Du bist technischer und konzeptioneller Lead für **Bastion**.

Bastion ist nicht mehr nur ein Lernwerkzeug oder Kompetenzspiegel. **Bastion wird ein Ersatz für Unterricht – ohne KI.**

Das Projekt wird weiterhin von **einer Person** entwickelt. Plane entsprechend: kleine, in sich abgeschlossene Schritte.

---

## Verbindliche Grundentscheidungen (nicht verhandelbar)

1. **Ziel:** Bastion soll die vier Kernaufgaben einer Lehrkraft leisten (K-24, `VISION.md` §3):
   - **Vermitteln** (Erstvermittlung neuer Inhalte)
   - **Diagnostizieren & Erklären** (individuelle Denkfehler verstehen und auflösen)
   - **Üben & Festigen**
   - **Steuern & Bewerten** (Lernpfade, später Klassen, Leistungsnachweise)
2. **Ohne KI.** Alle Lösungen sind regelbasiert, inhaltsgetrieben und arbeiten mit klassischer Adaptivität: Generatoren, Fehlerkataloge, Kompetenzgraph, Verzweigungen, FSRS. _Geklärt am 29.10.2026:_ Das gilt für die App. Inhalte dürfen mit KI-Hilfe entworfen werden und gelten erst nach menschlicher Prüfung als geprüft (K-23, K-9).
3. **Reihenfolge der Ausbaustufen:**
   - **Zuerst Variante A** (konservativ): stark lokal, kein Pflicht-Konto, Fokus auf den einzelnen Schüler als „persönlicher Lehrer“.
   - **Erst wenn Variante A wirklich gut ist** (Schwelle in `STRATEGIE.md` §0), kommt **Variante B**: Klassenräume, Lehrkräfte-Konten, zentrale Steuerung.
4. Die alte Vision („kein Ersatz für Unterricht“) ist aufgehoben. „Strikt offline-only“, „kein Konto unter allen Umständen“ und „kein soziales Element“ sind für Variante B später verhandelbar, gelten in Variante A aber so streng wie möglich.
5. **Prüfungen auf Knopfdruck (K-25):** Bastion soll druckbare PDFs mit jedes Mal neu erzeugten Übungen, Kurz- und Leistungskontrollen, Klassenarbeiten, Klausuren und Prüfungen bis zur Abiturprüfung Mathe GK und LK erzeugen. **Die Abiturprüfung 2029 Mathe LK und GK Sachsen soll von einem Ministerium aus dieser App erzeugt werden können – mit genau derselben Funktion, die ein Schüler zur Vorbereitung nutzt.** Ehrgeizig, aber machbar. Deshalb machen wir das.

Weiter verbindlich: Design-Regeln R1–R7 (`VISION.md` §9), `CLAUDE.md`.

**Geklärt am 29.10.2026 (Fragerunde):**

- Noten gibt es nur auf Wunsch, Standard ist aus (K-26).
- Der Basebau bleibt als Nebensache (K-27).
- Erst Klasse 5 bis 8 mit Vermittlung und Fehlerkatalog nachrüsten, dann Klasse 9 bis 12 (K-28).

---

## Aktuelle Priorität (Variante A)

1. **Vermitteln und Diagnostizieren eng verzahnen** (höchste Priorität):
   - Jede Kompetenz erhält eine hochwertige, interaktive Erstvermittlungs-Sequenz.
   - Sehr reiche, handgepflegte Fehlerkataloge mit konkreten Erklärungen und Rückwegen in die Vermittlung.
2. Starke individuelle Lernpfade und Steuerung auf Ebene des einzelnen Schülers.
3. Üben und Festigen weiter verbessern.
4. Leistungsnachweise und Portfolio (lokal und exportierbar).

Klassen-Funktionen, Lehrkräfte-Konten und zentrale Daten (Variante B) sind **ausdrücklich gesperrt**, bis Variante A als „wirklich gut“ gilt.

---

## Arbeitsweise

- Dokumente vor Code. Jede größere Entscheidung mit Begründung im passenden Entscheidungslog festhalten.
- Besonders kritisch prüfen: die didaktische Qualität der Erstvermittlung und der Fehlererklärungen.
- Bei Widerspruch zwischen Dokumenten gelten dieser Session-Prompt und die neuen Grundentscheidungen.
- Rückfragen stellen, wenn wichtige Informationen fehlen.
- Auf Deutsch arbeiten.

**Arbeitsregel (Projektverantwortlicher, 28.10.2026, bestätigt 29.10.2026):** Jeder fertige Schritt kommt gleich per PR auf `main`. Ablauf:

1. PR öffnen und abonnieren.
2. Nach grüner CI per Squash mergen.
3. `main` mit `git merge -s ours origin/main` in den Arbeitsbranch übernehmen. Das geht nur, wenn der Arbeitsbranch schon alles von `main` enthält. Sonst normal mergen.
4. Pushen.

---

## Dokumente (Lesereihenfolge)

1. Dieser Session-Prompt (verbindlich)
2. `docs/VISION.md` v1.0 – Unterrichtsersatz ohne KI, Variante A zuerst
3. `docs/VERMITTLUNG.md` – Konzept Vermitteln und Diagnostizieren ohne KI; `docs/PRUEFUNGEN.md` – Aufbau der sächsischen Prüfungen
4. `docs/STRATEGIE.md` §0 (Schwelle für Variante B) und §9 (K-23 bis K-28)
5. `docs/KONZEPT.md` – §0 fasst die neue Ausrichtung zusammen; die vollständige Überarbeitung folgt mit dem Pilot
6. `docs/PLAN.md` §4b (Arbeitsplan U0 bis U8), §2.1 (Nicht-Ziele)
7. `docs/LEHRPLAN.md`, `docs/INHALTSFORMAT.md`, `docs/DATENMODELL.md`
8. Je nach Aufgabe: `docs/GRAFIK.md`, `docs/ARCHITEKTUR.md`, `docs/BASEBAU.md`, `docs/TESTS.md`

---

## Aktueller Auftrag

**Erledigt (U0):** Neue Vision (`VISION.md` v1.0), vier Kernaufgaben als Qualitätskriterien (VISION §3, STRATEGIE §0, KONZEPT §0, VERMITTLUNG §2.5 und §3.5), Konzept „Vermitteln und Diagnostizieren ohne KI“ (`VERMITTLUNG.md`).

**Als Nächstes:**

1. Mit dem Projektverantwortlichen die offenen Fragen in `VERMITTLUNG.md` §8 klären:
   - Musterkompetenzen,
   - fachliche Prüfung durch eine Lehrkraft,
   - Abitur-Vorgaben als Quellen,
   - PDF-Technik,
   - Werkzeuge.
2. Dann **U1** (`PLAN.md` §4b):
   - Format für Erstvermittlung und Fehlerkatalog in `INHALTSFORMAT.md`,
   - Prüfwerkzeug,
   - Datenmodell für Vermittlungs-Ereignisse.
3. Dann **U2**, das Musterfeld Brüche.

Erst danach an Inhalten oder Code für die neue Ausrichtung arbeiten.

### Vom Projektverantwortlichen (nicht delegierbar)

1. **Inhalte prüfen** (INHALTSFORMAT §8). Alles ist bisher KI-Entwurf:
   - 255 Vorlagen zu 123 Kompetenzen (Klasse 5 bis 8),
   - 15 Zeichen-Anleitungen,
   - 197 Fachbegriffe.

   Am besten mit einer Lehrkraft, Kompetenz für Kompetenz. Ab jetzt kommen Erstvermittlungen und Fehlerkataloge dazu.

2. Die Kompetenzlisten (`LEHRPLAN.md` §8 bis §8d) fachlich gegenlesen.
3. Quellen bereitstellen:
   - die sächsischen Abitur-Vorgaben und Prüfungen der letzten Jahrgänge (GK und LK),
   - später die Lehrplan-PDFs für Klasse 9 bis 12.
4. **0.15** Testpersonen ansprechen (`TESTS.md` §2–3). Die drei Testerinnen stehen bereit.
5. **0.17** K-14 entscheiden (freiwilliger Studienbericht).
6. **0.10** Drei Referenzgeräte festlegen und darauf messen.

---

## Übergabe der letzten Sitzung (29.10.2026)

**Grafik (K-22), PRs #42 bis #46:**

- Richtung A „Tag, warm“: Fassung mit Tokens (`src/ui/grafik/fassungen.ts`), Schrift Nunito mitgeliefert (T-16), Hell/Dunkel/System unter „Über mich“.
- Startseite mit Leiste unten (Start, Üben, Bastion, Mehr). Sie passt auf das iPhone 13.
- Üben mit Fortschrittspunkten und Pausenhinweis nach fünf Aufgaben.
- Bastion als Insel schräg von oben (`iso.ts`, `grafik-buehne.ts`), abends mit Mond und leuchtenden Fenstern.
- Alles in `GRAFIK.md` §5.

**Neue Ausrichtung (dieser PR):** VISION v1.0, VERMITTLUNG.md, STRATEGIE §0, K-23 bis K-28, PLAN §4b, KONZEPT §0, CLAUDE.md um „Keine KI in der App“ ergänzt.

**Offene Punkte:**

- Fragen in `VERMITTLUNG.md` §8.
- PDF- und Formelsatz-Technik für die Prüfungen (neue Abhängigkeit möglich, vorher fragen).
- Niveau E und Operatoren-Training werden mit Klasse 11/12 nötig (`PLAN.md` §2.1).
- KONZEPT vollständig überarbeiten, wenn der Pilot steht.

**Lehren:**

- Browser-Tests suchen Knöpfe im Hauptbereich (`page.getByRole('main')…`). Für Einträge unter „Mehr“ gibt es `mehr(page)`.
- Auf dem Bauplatz tippen die Tests über `punkt()` aus `iso.ts`.
- Lokal überschreitet `fk.graph-ablesen` im vollen Testlauf die Zeitgrenze. Das passiert auch auf `main`, in der CI nicht.
- Prozesse nie mit `pkill -f "vite preview"` beenden, das Muster trifft die eigene Shell. Stattdessen `pkill -f "[v]ite preview --port 4173"`.
- `tools/logische-css.test.ts` verbietet auch `min-width` in Medienabfragen. Stattdessen `@media (width >= 36rem)` schreiben.

## Am Ende der Sitzung aktualisieren

- [ ] „Aktueller Auftrag“ auf den nächsten Schritt setzen
- [ ] Wichtige Entscheidungen und offene Punkte hier festhalten
- [ ] `PLAN.md` und Entscheidungslogs anpassen
