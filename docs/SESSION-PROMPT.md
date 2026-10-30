# Session-Prompt – Bastion (Unterrichtsersatz)

> Dieser Text ist der verbindliche Einstieg in jede Arbeitssitzung.
> Am Ende jeder Sitzung wird er aktualisiert und mit committet.

Stand: 30.10.2026 (20) · U5a und U5b für die natürlichen Zahlen fertig (379 von 596 Fehlerbildern zugeordnet; offen: Körper, Geometrie, Daten und Zufall)

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
- Zwischenschritte werden geprüft wie bei bettermarks: nach einem falschen Ergebnis, mit Schrittfeldern, zwei Versuche je Schritt (K-29, `VERMITTLUNG.md` §3.6).
- Für die Testphase gibt es ein Testprotokoll: Lernereignisse und Nutzungsprotokoll, nur mit Testcode im Elternbereich, Export als JSON-Datei mit Vorschau (K-14, D-18).

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

**Erledigt:**

- **U0 bis U2:** neue Vision, Format, Musterfeld Brüche.
- **U3 vollständig** (PLAN §4b): Abspieler der Erstvermittlung und Angebot vor dem ersten Üben (Zustand „erklärt“, Abschluss = Bauschritt), Diagnose der Fehlvorstellungen, Rückmeldung mit kurzer und langer Erklärung, Rückweg, Kontrastaufgaben, Zwischenschritte (K-29) im Musterfeld und Fehlerwerkstatt nach Ursachen.
- **U4a:** Testprotokoll (K-14, D-18).
- **U5a** (Entscheidung 30.10.2026: Variante (b) vor dem Test): alle Fehlerbilder im Feld Brüche und Dezimalzahlen zugeordnet, 35 neue Fehlvorstellungen (zusammen 45), Stand 82 von 596 Fehlerbildern.

**Als Nächstes:**

0. **U5b:** die übrigen Felder zuordnen, je Feld ein PR (Auftrag vom 30.10.2026: ohne Unterbrechung). Natürliche Zahlen, Teilbarkeit, rationale Zahlen, Prozent, Terme, Gleichungen, Gleichungssysteme, Funktionen und Zuordnungen, Größen, Flächen und Kreis sind fertig. Weiter mit Körpern, Geometrie, Daten und Zufall. Fertige Felder in `FV_ZUGEORDNET` (`tools/inhalte/pruefen.test.ts`) eintragen.

1. **U4b, der Test mit den drei Testerinnen** (`TESTS.md` §2–3):
   - Nummern mit `pnpm testnummern` ausgeben, Einwilligungen einholen.
   - Danach die Testprotokoll-Dateien auswerten: Verständnis, Treffer der Erklärungen, Nutzung der Zwischenschritte und „Weiter ohne Weg“.
2. **Vorher:** Das Musterfeld fachlich prüfen lassen (drei Erstvermittlungen, zehn Fehlvorstellungen, Schritte), am besten durch eine Lehrkraft.
3. **Bis zum Test möglich**, auf Wunsch:
   - **(a)** ein zweites Musterfeld, z. B. Dezimalzahlen,
   - ~~**(b)** die 596 vorhandenen Fehlerbilder den Fehlvorstellungen zuordnen~~ – gewählt, läuft als U5a/U5b.
   - Empfehlung: U5 erst nach dem Test, damit Formatfehler sich nicht über 123 Kompetenzen verbreiten.

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
5. ~~**0.17** K-14 entscheiden~~ – entschieden am 29.10.2026: Testprotokoll mit Testcode, Export als JSON-Datei (STRATEGIE §7, D-18), gebaut in U4a.
6. **0.10** Drei Referenzgeräte festlegen und darauf messen.

---

## Übergabe der letzten Sitzung (29./30.10.2026, Nachtschicht)

**Entscheidungen** (Fragerunden 29.10.2026):

- **K-29 Zwischenschritte wie bettermarks:** nach falschem Ergebnis, vorgegebene Schrittfelder, zwei Versuche je Schritt, „Weiter ohne Weg“ erlaubt, auch in der Fehlerwerkstatt.
- **K-14 Testprotokoll:** ausführlich, nur mit Teilnehmer-Nummer (mit Prüfziffer, zugleich Testcode) im Elternbereich, JSON-Datei mit Vorschau. Unbekannte Fehler stehen nur dort, U3k entfällt.
- **Erstvermittlung:** ein überspringbares Angebot vor dem ersten Üben. Der Abschluss zählt als Lerneinheit (ein Bauschritt je Kompetenz, D-16 ergänzt, BASEBAU §3.4c).
- **Halbfertiges** geht gleich online, wo es Inhalte gibt.

**Umgesetzt** (PRs #52 bis #64, alle auf `main`):

- **Datenbank:** Schemaversion 3 mit den Tabellen `vermittlungen` und `nutzungen`. Altstände `tests/altstaende/schema-1.json` und `schema-2.json` mit Migrationstests.
- **Ereignisse:**
  - `vermittlung` (v1),
  - `aufgabe` v2 mit `schritte` (D-17),
  - `nutzung` (v1, nicht in Sicherungen).
- **Kern:**
  - `abspielen.ts` (Abspieler),
  - `fv-diagnose.ts` (Zustände der Fehlvorstellungen, ohne eigene Tabelle),
  - `zwischenschritte.ts`,
  - `testphase/` (Teilnehmer-Nummer, Nutzung, Protokoll).
- **Oberfläche:**
  - `vermittlung/Vermittlung.svelte` und `Angebot.svelte`,
  - `ueben/Schrittweg.svelte` und `FvRueckmeldung.svelte`,
  - `eltern/Testphase.svelte`.
- **Grafik:** Startseite auf dem iPhone 13 korrigiert (`viewport-fit=cover`, `--leiste-hoehe`), Glühbirne für die Fehlerwerkstatt.
- **Generatoren mit Schritten:** Erweitern auf Zielnenner, Kürzen, Addieren/Subtrahieren. Der ungleichnamige Fall zeigt Schritte, der gleichnamige noch nicht.

**Offene Punkte:**

- Fragen in `VERMITTLUNG.md` §8 (Lehrkraft, amtliche Abitur-Vorgaben 2029, Werkzeuge).
- PDF- und Formelsatz-Technik für die Prüfungen (neue Abhängigkeit möglich, vorher fragen).
- Rechenzeilen für Gleichungen (K-29) und Schritte für gleichnamige Brüche kommen mit U5.
- Die Schwellen der Diagnose (`FV_REGELN`) sind Startwerte und werden im Test geprüft.
- Alte Branches auf GitHub ließen sich von hier nicht löschen (HTTP 403). Lokal gibt es nur `main`. Löschen über GitHub → Branches, oder dort „Automatically delete head branches“ einschalten.
- PR #63 wurde per normalem Merge-Commit statt per Squash gemergt. Das ist unschädlich.

**Übergabe U5a (30.10.2026, Tagschicht):**

- Feldübergreifende Fehlvorstellungen heißen nach dem Feld, in dem sie zuerst gelernt werden (`FV.NZ.PUNKT-VOR-STRICH`), Sachaufgaben-Fehler `FV.SA.…` (INHALTSFORMAT §16).
- Die kurze Erklärung erscheint **unter** dem Satz des Fehlerbilds. Sie muss zu allen Fehlerbildern passen, die auf sie zeigen, und darf ihnen nicht widersprechen. Darum gibt es `FV.BR.NICHT-GEKUERZT` getrennt von `FV.BR.NICHT-VOLLSTAENDIG`.
- Rückwege zeigen auf Schritte künftiger Erstvermittlungen (`…#erklaeren-…`). Wer später die Erstvermittlung schreibt, muss diese Schritt-IDs anlegen, sonst meldet die Prüfung einen Fehler.
- Zur fachlichen Prüfung: Manche kurze Erklärung wiederholt fast den Satz des Fehlerbilds (etwa beim Vergleichszeichen). Beim Review entscheiden, ob der Fehlerbild-Satz dann kürzer werden soll.
- `pnpm inhalte:begriffe` markiert Fachbegriffe jetzt auch in Fehlvorstellungen. Unbekannte Markierungen (`[[Brüchen]]`) entfernt es nicht; die meldet `pnpm inhalte:pruefen`.

**Lehren:**

- **Svelte und IndexedDB:** Werte aus `$state` sind Proxys. IndexedDB lehnt sie ab (DataCloneError), die Ablage fängt den Fehler ab, und es wird still nichts gespeichert. Vor dem Speichern `$state.snapshot` nutzen, oder `$state.raw` für ganze Datensätze.
- **Teilschritte auf eigenen Zweigen:** Wer sie aus dem Arbeitsbranch auslagert, merged `main` normal hinein. Bei Konflikten die Zweig-Seite nehmen und vor dem Commit nach `<<<<<<<` suchen.
- **Laufende `vite preview`-Prozesse** heißen `…/vite.js preview`. Beenden mit `pkill -f "[v]ite.js preview"`, sonst liefert ein alter Server alte Stände aus.
- **Bildschirmfotos** von Playwright nur mit absoluten Pfaden in den Arbeitsordner speichern, nie ins Repository.
- **Lint-Fehler von svelte-check** stehen in Großbuchstaben (`ERROR`). Beim Filtern der Ausgabe danach suchen.
- Browser-Tests suchen Knöpfe im Hauptbereich (`page.getByRole('main')…`). Für „Mehr“ gibt es `mehr(page)`. Das Formular der Aufgabe ist `form#antwort`, das der Schritte `form.aktuell`.
- Lokal überschreitet `fk.graph-ablesen` im vollen Testlauf manchmal die Zeitgrenze. Das passiert auch auf `main`, in der CI nicht.
- Browser-Tests, die neu laden, warten vorher, bis die Antwort in IndexedDB steht (`aufgabenImSpeicher`). Sonst geht sie beim Neuladen verloren, und der Test ist in der CI manchmal rot.
- `tools/logische-css.test.ts` verbietet `min-width` in Medienabfragen. Stattdessen `@media (width >= 36rem)` schreiben.

## Am Ende der Sitzung aktualisieren

- [ ] „Aktueller Auftrag“ auf den nächsten Schritt setzen
- [ ] Wichtige Entscheidungen und offene Punkte hier festhalten
- [ ] `PLAN.md` und Entscheidungslogs anpassen
