# Fokus-Sitzung „Prüfen statt Bauen“ – Session-Prompt

> Ein Auftrag aus dem Review vom 01.11.2026, der beide Stränge betrifft. Er gilt, bis alle Pakete F1 bis F10 erledigt oder vom Projektverantwortlichen gestrichen sind.
> Vorher lesen: `CLAUDE.md`, `docs/SESSION-PROMPT.md`, `docs/session/LERNKERN.md`, `docs/STRATEGIE.md` §0, `docs/INHALTSFORMAT.md` §8.
> Die Sitzung arbeitet als **Strang Lernkern** (Branch `lernkern/…`, Protokollzeile in `LERNKERN-PROTOKOLL.md`). Ausnahmen für fremde und gemeinsame Dateien stehen bei jedem Paket.

Stand: 01.11.2026 · nichts davon begonnen

---

## Warum

Das Review vom 01.11.2026 hat ergeben:

- **Technik:** sehr gut. Lint, 5 283 Tests und Build sind grün, die Größenbudgets werden eingehalten.
- **Inhalte:** pädagogisch noch auf null. `pnpm review` zeigt 0 Dateien auf Stufe 2. Nur 22 Dateien des Musterfelds stehen auf Stufe 1. Kein Kriterium der Schwelle in `STRATEGIE.md` §0 ist für irgendeine Klassenstufe erfüllt.
- **Echte Lernende:** Niemand hat die App bisher benutzt (U4b steht aus).
- **Arbeitsverteilung:** Der Grafik-Strang hat am 31.10. rund 130 Design-Ideen umgesetzt und dabei etwa 2 400 Zeilen in `src/ui/ueben/` und `src/ui/eltern/` geändert. Der Lernkern hatte 3 Protokollzeilen. Nach K-27 ist der Basebau Nebensache.
- **Öffentliche Seite:** bastion.micana.de folgt `main` und zeigt nur Entwürfe.

**Der Engpass ist menschliche Prüfung, nicht Code.** Jedes Paket unten macht entweder die Prüfung leichter, macht den Test U4b aussagekräftiger oder schützt Lernende vor ungeprüften Inhalten. Neue Funktionen für Lernende oder die Bastion gehören **nicht** dazu.

---

## Zuerst: Rückfragen an den Projektverantwortlichen

Vor dem ersten Code gesammelt fragen (eine Fragerunde, mit Empfehlung). Antworten unten unter „Entscheidungen“ eintragen und im Entscheidungslog von `ARCHITEKTUR.md` festhalten, wo es eine Architekturfrage ist.

1. **Öffentliche Seite (F2):** Filter im Build (Empfehlung) oder Release-Branch?
2. **Was zeigt die öffentliche Seite, solange keine Kompetenz Stufe 2 hat?** Möglichkeiten:
   - (a) nur eine Hinweisseite „Inhalte werden geprüft“,
   - (b) alles, aber mit sichtbarem Vermerk „Entwurf“ für Eltern,
   - (c) Mindeststufe 1, also vorerst nur das Musterfeld.

   Empfehlung: Den Mechanismus jetzt bauen, die Stufe über eine Repository-Variable steuern (siehe F2) und mit (b) starten, bis das Musterfeld Stufe 2 hat. Danach (c) mit Stufe 2.
3. **Grafik-Pause (F1):** bestätigen, dass der Grafik-Strang bis zur Auswertung von U4b ruht, ausgenommen Fehlerbehebungen.
4. **Klasse 5 als Meilenstein (F7):** bestätigen, dass Klasse 5 die erste Klassenstufe ist, die vollständig Stufe 2 und den Test bestehen soll. Oder soll es Klasse 6 sein, weil das Musterfeld Brüche dort liegt?
5. **Offen aus früheren Sitzungen**, nur abfragen und nicht selbst entscheiden:
   - `potenzen.ts` neue Version (10⁶ statt `10^6`)?
   - Alte Branches (`u5b-*`, `u2-*`, `u3*`) auf GitHub löschen? Das geht nur über GitHub → Branches.

## Entscheidungen

_(von der ersten Sitzung auszufüllen)_

---

## Arbeitspakete

Ein Paket ist ein PR (oder mehrere kleine PRs). Reihenfolge wie unten, außer der Projektverantwortliche entscheidet anders. Jedes Paket endet mit `pnpm lint`, `pnpm test`, `pnpm build`, bei Oberflächen-Änderungen zusätzlich `pnpm test:e2e`, dazu einer Protokollzeile und einer Erklärung in einfachem Deutsch: was, warum, wie ausprobieren.

### F1 – Grafik-Pause und Lern-Oberfläche einfrieren

**Ziel:** Während U4b soll sich die Lern-Oberfläche nicht ändern, sonst lässt sich das Ergebnis nicht auswerten. Die Arbeit fließt in die Prüfung.

- `docs/session/GRAFIK.md`: Oben einen Kasten „Pause bis Auswertung U4b (Entscheidung PV, Datum)“ einfügen. Erlaubt sind nur Fehlerbehebungen und die Wünsche aus F8. Das ist eine Änderung im Grafik-Bereich auf Wunsch des PV, darum Protokollzeile in **beiden** Strang-Protokollen.
- `docs/SESSION-PROMPT.md`: Die Pause und die eingefrorene Lern-Oberfläche als Regel für alle Stränge eintragen. Gemeint sind `src/ui/ueben/`, `src/ui/vermittlung/`, `src/ui/eingabe/`, `src/ui/eltern/` und `src/ui/start/`. Erlaubt sind nur Fehlerbehebungen und Änderungen aus diesem Auftrag. Die Ausnahme „Aufräumen nach `GRAFIK.md` §9“ ruht in dieser Zeit.
- `AGENTS.md`: ein Satz dazu, damit Cursor und andere Agenten es sehen.
- `docs/PLAN.md` §1: Zeile „Nächster Schritt Grafik“ auf „Pause bis U4b“ kürzen.

### F2 – Öffentliche Seite nur mit geprüften Inhalten

**Ziel:** Lernende sehen nur Inhalte ab einer festgelegten Review-Stufe. `main` bleibt die Werkstatt.

Ausgangspunkt: `src/core/learning/review.ts` hat schon `wirksameStufe` und `OEFFENTLICHE_MINDESTSTUFE = 2`. Die Inhaltspakete baut `tools/inhalte/pakete.ts` und bindet sie über `vite.config.ts` ein.

1. **Regel festlegen und in `INHALTSFORMAT.md` §8 dokumentieren:** Eine Kompetenz ist öffentlich, wenn `kompetenz.yaml`, `vermittlung.yaml`, alle ihre Vorlagen und alle Fehlvorstellungen, auf die diese zeigen, mindestens die Mindeststufe haben. Sonst fällt die ganze Kompetenz heraus, keine halben Kompetenzen. Voraussetzungen, die herausfallen, gelten im Lernpfad als „nicht verfügbar“ und nicht als Lücke. Diese Stelle genau prüfen: Der Lernpfad darf nicht ins Leere zeigen.
2. **Umgebungsvariable `BASTION_MINDESTSTUFE`** (0 bis 3, Standard 0 = Werkstatt). `pakete.ts` filtert damit. Kein zweiter Branch.
3. **Leerer Zustand:** Ist nach dem Filter nichts übrig, zeigt die App eine ruhige Hinweisseite. Die Texte kommen nach `src/ui/texte/de.json`, nichts fest im Code.
4. **Vermerk „Entwurf“** (nur bei Option (b)): ein dezenter Hinweis im Elternbereich und auf der Startseite, wenn Inhalte unter Stufe 2 ausgeliefert werden. Nicht im Lernpfad.
5. **CI:** Den Deploy-Build mit `BASTION_MINDESTSTUFE: ${{ vars.BASTION_MINDESTSTUFE || 0 }}` bauen, damit der PV die Stufe in den GitHub-Einstellungen umstellen kann, ohne Code zu ändern. Prüf-Build und E2E-Tests bleiben bei 0. Das ist eine gemeinsame Datei, also ein eigener kleiner Commit.
6. **Tests:**
   - Filter mit Mindeststufe 0, 1 und 2 an einem kleinen Beispielbestand.
   - Eine Kompetenz mit einer Vorlage auf Stufe 0 fällt ganz heraus.
   - Bei Mindeststufe 2 entsteht heute ein leeres, aber gültiges Paket.
7. **Dokumente:** `ARCHITEKTUR.md`-Entscheidungslog, README („Was ist öffentlich?“), `LERNKERN.md` Punkt 1.3 als erledigt markieren.
8. **Ausprobieren:** `BASTION_MINDESTSTUFE=1 pnpm build && pnpm preview`. Es sollten nur die drei Bruch-Kompetenzen erscheinen.

### F3 – Prüfbogen auffrischen und Ergebnisse einlesen

**Ziel:** Die Lehrkraft soll schnell prüfen können, und ihre Antworten sollen ohne Handarbeit zurück ins Repository kommen.

1. Den Prüfbogen für das Musterfeld neu erzeugen (`pnpm pruefbogen --online --name "Musterfeld Brüche" M.ZO.BR.BEGRIFF M.ZO.BR.ERWEITERN M.ZO.BR.ADD-SUB`). Dann auf derselben Adresse neu veröffentlichen: https://claude.ai/artifact/NKSgnmWBsS1TpZ6uLLLgwy. Vorher die Seite lesen (`action: read`). Liegen schon Eingaben in der Sammlung `bewertung`, diese **nicht** verwerfen. Sie vorher sichern und dem PV melden.
2. Prüfen, wie die Seite heute je Abschnitt bewertet (Ankreuzfelder). Wenn nötig, je Schritt drei Knöpfe ergänzen: „passt“, „passt nicht“, „Kommentar“. Ziel: Eine Lehrkraft schafft eine Kompetenz in 20 bis 30 Minuten am Handy oder Tablet. Nicht nur ausdrucken.
3. **Neues Werkzeug `pnpm pruefbogen einlesen <datei.json>`:** Es liest die exportierten Eingaben der Sammlung `bewertung`.
   - Es erzeugt eine Arbeitsliste in Markdown: je Datei und Schritt der Befund und der Kommentar.
   - Für Dateien, bei denen alles „passt“, schlägt es den Befehl `pnpm review setzen --stufe 2 --pruefer <Name>` vor. Es setzt die Stufe **nicht** selbst; das bleibt eine bewusste Handlung.
   - Tests mit einer erfundenen Bewertungsdatei.
4. Eine kurze Anleitung für die Lehrkraft (eine Seite, `docs/` oder im Prüfbogen selbst): Was wird geprüft, wie lange dauert es, was passiert mit den Antworten.
5. Dem PV sagen, was er tun muss: die Lehrkraft als Bearbeiterin der Seite einladen.

### F4 – Auswertung für U4b vorbereiten

**Ziel:** Nach dem Test gibt es sofort eine Ja/Nein-Antwort zu den Kriterien in `STRATEGIE.md` §0, nicht nur Rohdaten.

1. `src/core/testphase/protokoll.ts` und `DATENMODELL.md` §4.8 lesen. Was steht in der Datei (`PROTOKOLL_FORMAT = 1`)?
2. **Neues Werkzeug `pnpm auswertung <dateien…>`** (`tools/auswertung/`, im Lernkern-Bereich; Tabelle in `SESSION-PROMPT.md` ergänzen). Die Rechnungen gehören rein und getestet in den Kern (`src/core/testphase/auswertung.ts`). Je Teilnehmer und zusammen:
   - **Kriterium 1:** Wer eine Erstvermittlung abgeschlossen hat, löst danach die Einstiegsaufgaben dieser Kompetenz ohne Hilfe, also ohne Tipp, Erklärung oder „Weiter ohne Weg“. „Einstiegsaufgaben“ zuerst genau festlegen (z. B. die ersten 3 Aufgaben auf Niveau G) und in `TESTS.md` dokumentieren. Ausgabe: x von 3, erfüllt ja/nein.
   - **F5:** Anteil der falschen Antworten mit Fehlerbild, Schwelle 80 %. Dazu die Liste der unbekannten Fehler, gruppiert nach Vorlage.
   - Nutzung der Zwischenschritte, „Weiter ohne Weg“, abgebrochene Erstvermittlungen (Schritt-ID, an dem aufgehört wurde).
   - Ausgabe als Markdown-Bericht, ohne Teilnehmer-Nummern in Dateien im Repository.
3. Tests mit synthetischen Protokollen: ein Fall, der alles erfüllt, und einer, der knapp scheitert.
4. `TESTS.md` §2–3: Ablauf ergänzen (Dateien einsammeln → `pnpm auswertung` → Bericht).

### F5 – „Fehler-Schüler“: Diagnose regelbasiert durchspielen

**Ziel:** Fehler finden, wie Stufe 1 sie gefunden hat (falsche Zuordnung, Rückweg zum falschen Schritt, kurze Erklärung passt nicht), bevor ein Mensch Zeit darauf verwendet. Ohne KI.

1. **Zuerst Bestandsaufnahme:** Was prüfen `tools/inhalte/diagnose.test.ts`, `abspielen.test.ts`, `auswertung.test.ts` und `pruefen.ts` schon? Nur Lücken füllen, nichts doppelt bauen.
2. **Werkzeug `pnpm fehlerschueler`** (oder Tests in `tools/inhalte/`). Für jedes Fehlerbild jeder Vorlage und für mehrere Startwerte des Zufalls:
   - die falsche Antwort erzeugen, wie das Fehlerbild sie beschreibt, sofern das Format sie berechenbar macht,
   - durch die echte Auswertung schicken,
   - prüfen: Es wird genau dieses Fehlerbild erkannt, nicht ein anderes und nicht die richtige Lösung. Die Fehlvorstellung hat eine kurze Erklärung. Der Rückweg zeigt auf einen vorhandenen Schritt einer Erstvermittlung, deren Kompetenz die Vorlage selbst ist oder eine ihrer Voraussetzungen.
   - Dasselbe für die Antwortmöglichkeiten mit `fv` in den Erstvermittlungen.
3. Ausgabe: eine Liste der Verdachtsfälle je Feld. Funde nicht automatisch korrigieren. Inhalte ändern sich nur in eigenen PRs mit Begründung, und geänderte Dateien verlieren ihren Review-Vermerk. Das muss im PR stehen.
4. Neue Prüfungen, die für alle Inhalte gelten und grün sind, werden Pflichttests (`INHALTSFORMAT.md` §6.3).

### F6 – Arbeitsblätter für Lehrkräfte (kleiner Vorläufer von U7)

**Ziel:** Lehrkräfte bekommen sofort etwas Nützliches: druckbare Arbeitsblätter mit neuen Aufgaben. Das hilft beim Gewinnen der prüfenden Lehrkraft und ist ein erster Schritt zu Kriterium 4 („eine Klassenarbeit wird als einsetzbar beurteilt“).

- **Als Werkzeug, nicht in der App**, wegen F1: `pnpm arbeitsblatt <Kompetenz…> --niveau G --anzahl 12 --seed 7 > blatt.html`, im Browser als PDF drucken. Den HTML- und Druck-Teil von `tools/pruefbogen/` wiederverwenden. **Keine neue Abhängigkeit**, kein PDF-Paket.
- Inhalt: Kopf mit Name, Datum und Thema; Aufgaben mit Platz zum Rechnen; zweite Seite mit Lösungen und Lösungsweg. Fußzeile mit Review-Stufe der Vorlagen („Entwurf, nicht fachlich geprüft“ bei Stufe 0).
- Derselbe Seed ergibt dasselbe Blatt (Test). Brüche und Hochzahlen sehen aus wie in der App (Teilmenge aus `src/core/learning/text.ts`).
- Danach dem PV vorschlagen, wie er das Blatt der Lehrkraft zusammen mit dem Prüfbogen anbietet.
- U7 bleibt offen: Die Entscheidung über die PDF-Technik für Prüfungen ist damit **nicht** getroffen. Das so in `PLAN.md` §4b vermerken.

### F7 – Meilenstein „Klasse 5 fertig“ planen

**Ziel:** Eine Klassenstufe, an der die Schwelle wirklich messbar wird. Nur planen, nicht prüfen. Die Prüfung macht ein Mensch.

1. Die Menge festlegen: Kompetenzen mit `5` in `klassenstufe_typisch` (heute etwa 79 Treffer; manche nennen mehrere Stufen). Mit `LEHRPLAN.md` §8 abgleichen. Die Liste kommt in `PLAN.md` §4b als neuer Meilenstein „M5“.
2. **Stichproben-Regel für Stufe 2** in `INHALTSFORMAT.md` §8 vorschlagen (PV entscheidet). Beispiel: Erstvermittlung und Fehlvorstellungen vollständig lesen; je Vorlage ein Niveau mit 20 erzeugten Aufgaben.
3. **Reihenfolge der Felder** nach Abhängigkeiten im Kompetenzgraph, mit grober Zeitschätzung je Feld auf Grundlage der Erfahrung aus F3.
4. **Stufe 1 vorziehen:** Felder der Klasse 5 bekommen Stufe 1 (zweites Modell, frische Sitzung, Prüfkatalog §8) **vor** der Lehrkraft, Feld für Feld, je ein PR. Das darf in späteren Sitzungen laufen, sobald F1 bis F6 stehen.
5. `pnpm review` um einen Filter nach Klassenstufe erweitern (`pnpm review --klasse 5`), damit der Fortschritt sichtbar ist.

### F8 – `App.svelte` aufteilen (ohne sichtbare Änderung)

**Ziel:** Weniger Konflikte in der gemeinsamen Datei. Gut jetzt, weil der Grafik-Strang ruht.

- `src/ui/App.svelte` (1 180 Zeilen): Ansichtswechsel und Zustand in eine eigene Datei (`src/ui/ansicht.svelte.ts` o. Ä.), jede Ansicht in eine eigene Komponente. Nur Runes-Syntax.
- **Keine Verhaltensänderung.** Alle E2E-Tests bleiben unverändert grün. Wenn ein Test angepasst werden muss, ist das ein Zeichen für eine Verhaltensänderung: stoppen und erklären.
- Gemeinsame Datei, also eigener PR, Protokollzeile in beiden Strängen.
- `grafik-buehne.ts` (2 020 Zeilen) und `Bastion.svelte` **nicht** anfassen. Stattdessen unter „Wünsche aus dem anderen Strang“ in `GRAFIK.md` eintragen, für die Zeit nach der Pause.

### F9 – Schrägstrich-Brüche: Vorschau statt Entscheidung

**Ziel:** Die offene Frage (etwa 3 600 Stellen `1/4` statt `$\frac{1}{4}$`) wird zu einer Ja/Nein-Entscheidung mit Vorschau.

- **Werkzeug `pnpm inhalte:brueche`:** Es findet Brüche mit Schrägstrich in Texten und schreibt einen Bericht mit vorher/nachher je Datei (Markdown oder HTML zum Durchblättern). Ausnahmen erkennen und auflisten statt umschreiben: Einheiten (`km/h`, `m/s`), Datumsangaben, Verhältnisse, Texte innerhalb von `$…$`.
- `--anwenden` erst bauen oder benutzen, wenn der PV entschieden hat. Achtung: Das ändert den Review-Hash der 22 Dateien auf Stufe 1. Sie fallen auf Stufe 0 zurück. Das muss in der Rückfrage stehen. Empfehlung: Erst nach der Rückmeldung der Lehrkraft zum Musterfeld anwenden.
- Tests: Ausnahmen bleiben unverändert; ein Durchlauf ändert nichts mehr (idempotent).

### F10 – Stand-Dokumente straffen

**Ziel:** Der PV soll den Stand in 30 Sekunden lesen können.

- `docs/PLAN.md` §1: jede Zeile höchstens zwei Sätze. Erledigtes steht in den Protokollen, nicht in „Nächster Schritt“.
- Kopfzeile „Stand:“ in `docs/session/GRAFIK.md` und `LERNKERN.md`: ein Satz.
- `docs/SESSION-PROMPT.md`: doppelte Trennlinien (`---` / `---`) entfernen und die Lesereihenfolge um diese Datei ergänzen, solange sie gilt.
- Nichts inhaltlich streichen, was eine Entscheidung dokumentiert.

---

## Nicht in diesem Auftrag

- Neue Funktionen in Lernpfad, Bastion, Grafik oder Sound.
- Neue Inhalte, Kompetenzen oder Klasse 9 bis 12 (bleibt gesperrt, `LERNKERN.md` 1.6).
- Review-Stufe 2 setzen ohne menschliche Prüfung.
- Neue Laufzeitabhängigkeiten; für F2 bis F9 ist keine nötig.

## Kleinigkeiten nebenbei (nur wenn sie im Weg sind)

- `fk.graph-ablesen` überschreitet lokal manchmal die Zeitgrenze: Ursache suchen statt Zeitgrenze erhöhen.
- Voller Testlauf etwa 3,5 Minuten: Wenn F5 viele Fälle erzeugt, diese in `pnpm inhalte:pruefen` bündeln und nicht in jeden `pnpm test`-Lauf legen. Vorher mit dem PV klären, ob die CI sie trotzdem ausführt.

---

## Übergabe

Jede Sitzung, die hier arbeitet, trägt am Ende ein:

- Paket, Stand, PR-Nummer; Erledigtes mit Datum durchstreichen,
- neue Rückfragen an den PV,
- eine Zeile in `LERNKERN-PROTOKOLL.md` (bei F1 und F8 auch in `GRAFIK-PROTOKOLL.md`),
- `docs/PLAN.md` §1 „Nächster Schritt Lernkern“.

Sind alle Pakete erledigt: Diese Datei bleibt als Beleg stehen. Der Verweis in `SESSION-PROMPT.md` wird entfernt, und `GRAFIK.md` bekommt die Pause erst nach der Auswertung von U4b wieder aufgehoben.

### Übergaben

_(noch keine)_
