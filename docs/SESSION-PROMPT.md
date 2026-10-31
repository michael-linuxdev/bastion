# Session-Prompt – Bastion (Unterrichtsersatz)

> Dieser Text ist der gemeinsame Einstieg in jede Arbeitssitzung.
> Danach liest jede Sitzung die Datei ihres Strangs:
> - **Lernkern:** `docs/session/LERNKERN.md`
> - **Grafik:** `docs/session/GRAFIK.md`
>
> Gehört eine Aufgabe zu keinem Strang, fragt die Sitzung nach, bevor sie anfängt.

Stand: 31.10.2026 (39) · Session-Prompt in Stränge getrennt; Grafik-Nebenstrang B-28 Spez+Atlas P0–P6+CC0 erledigt; optional Feinschliff

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

**Strang Grafik (B-28, 31.10.2026):** geplante Reihe **G0–G11** und Atlas-Chargen **P0–P6** sowie CC0-Sound sind auf `main` (Details: `docs/session/GRAFIK.md`, `GRAFIK.md` §6/§10). Optional offen: Jahreszeit-Feinheit, Ambient Wasser/Regen, Lern-UI §9, Messung iPhone 13, Testerinnen mit U4b. Der Strang darf den Lernkern nicht blockieren; bei Engpass wartet die Grafik (K-27).

Klassen-Funktionen, Lehrkräfte-Konten und zentrale Daten (Variante B) sind **ausdrücklich gesperrt**, bis Variante A als „wirklich gut“ gilt.

---

---

## Stränge und parallele Arbeit

Mehrere Sitzungen arbeiten gleichzeitig, je eine pro Strang. Sie dürfen sich nicht gegenseitig blockieren.

| | Lernkern | Grafik |
|---|---|---|
| Session-Prompt | `docs/session/LERNKERN.md` | `docs/session/GRAFIK.md` |
| Branch-Namen | `lernkern/…` | `grafik/…` |
| Code | `content/`, `src/core/learning/`, `src/core/competence/`, `src/core/testphase/`, `src/core/srs/`, `src/generators/`, `src/ui/ueben/`, `src/ui/vermittlung/`, `src/ui/eingabe/`, `src/ui/eltern/`, `tools/inhalte/`, `tools/pruefbogen/`, `tools/review/` | `src/ui/grafik/`, `src/ui/bastion/` (mit `grafik/` und `sound/`), `src/ui/start/`, `src/ui/grund.css`, `src/core/bastion/`, `src/core/ledger/`, `tools/sim/`, `public/` (Atlas, Sound) |
| Dokumente | `VERMITTLUNG.md`, `INHALTSFORMAT.md`, `LEHRPLAN.md`, `PRUEFUNGEN.md`, `TESTS.md`, `DATENMODELL.md` | `GRAFIK.md`, `GRAFIK-SPRITES.md`, `BASEBAU.md` |
| PLAN.md | §4b (Unterrichtsersatz), §4 | §4a (Basebau) |

**Gemeinsame Dateien** (beide Stränge dürfen sie ändern, aber nur klein und in einem eigenen Commit):

- `package.json`, `pnpm-lock.yaml` (neue Abhängigkeit nur nach Rückfrage, `CLAUDE.md`),
- `src/ui/texte/de.json` (neue Schlüssel mit dem Präfix des Bereichs, z. B. `tastatur.…`, `bastion.…`),
- `src/ui/App.svelte`, `src/ui/start/Leiste.svelte`, `tests/e2e/ueben.spec.ts`,
- Plattform und Daten: `src/storage/` (Datenbank, Schemaversion), `src/core/policy/`, `src/core/rng/`, `src/core/sicherung/`, `src/ui/plattform/`, `src/ui/profil/`, `src/ui/sicherung/`, `src/main.ts`. Schemaänderungen nur mit Rückfrage, sie betreffen beide Stränge (`CLAUDE.md`: jede Migration mit Test),
- `docs/PLAN.md` §1, `docs/ARCHITEKTUR.md` (Entscheidungslog), `docs/VISION.md`, `docs/STRATEGIE.md`, `CLAUDE.md` und diese Datei.

**Regeln:**

1. **Nur den eigenen Strang ändern.** Braucht ein Strang eine Änderung im Bereich des anderen, beschreibt er sie in der Datei des anderen Strangs unter „Wünsche aus dem anderen Strang“ und baut sie nicht selbst. Ausnahmen: ein Fehler, der die CI für alle rot macht; und das Aufräumen der Lern-Oberfläche nach `GRAFIK.md` §9 (nur Abstände, Hierarchie, Tokens; im Lernpfad keine Animationen, Wesen, Sound oder Wetter), dann in einem eigenen Commit mit Hinweis im Protokoll beider Stränge.
2. **Eigenes Protokoll.** Jeder Strang hängt je PR eine Zeile **unten** an seine Protokolldatei an: `docs/session/LERNKERN-PROTOKOLL.md` oder `docs/session/GRAFIK-PROTOKOLL.md`. Git führt diese Dateien beim Mergen selbst zusammen (`merge=union` in `.gitattributes`). `docs/PLAN.md` §5 bekommt keine neuen Zeilen mehr; das war die häufigste Konfliktstelle. Den Stand eines Strangs nicht in diese Datei schreiben, sondern in die Strang-Datei. `pnpm test` prüft beides (`tools/dokumente.test.ts`). Für andere Agenten (Cursor) steht das in `AGENTS.md`.
3. **Kurze Branches, oft mergen.** Jeder fertige Schritt kommt gleich per PR auf `main` (Ablauf unten). Vor dem Merge `main` normal hineinmergen und `pnpm lint`, `pnpm test`, `pnpm build` laufen lassen.
4. **Konflikte in gemeinsamen Dateien:** beide Seiten behalten. Bei echten Widersprüchen (gleiche Zeile, verschiedene Absicht) nachfragen, nicht raten.
5. **Rote CI durch den anderen Strang:** Ist `main` selbst rot, ist das nicht der eigene Fehler. Den Fehler nennen, nicht im fremden Bereich reparieren, außer er ist eine Zeile und eindeutig.
6. **Gemeinsame Entscheidungen** (neue Abhängigkeit, Schema, Datenschutz, R-Regeln) stehen im passenden Entscheidungslog und werden in beiden Strang-Dateien kurz erwähnt.

---

## Arbeitsweise

- Dokumente vor Code. Jede größere Entscheidung mit Begründung im passenden Entscheidungslog festhalten.
- Bei Widerspruch zwischen Dokumenten gelten dieser Session-Prompt, die Datei des Strangs und die neuen Grundentscheidungen.
- Rückfragen stellen, wenn wichtige Informationen fehlen.
- Auf Deutsch arbeiten.

**Arbeitsregel (Projektverantwortlicher, 28.10.2026, bestätigt 29.10.2026):** Jeder fertige Schritt kommt gleich per PR auf `main`. Ablauf:

1. PR öffnen und abonnieren.
2. Nach grüner CI per Squash mergen.
3. `main` in den Arbeitsbranch übernehmen: mit `git merge -s ours origin/main` nur, wenn `git diff --quiet HEAD origin/main` nichts meldet (der Branch enthält genau `main`). Sonst normal mergen. Mit parallelen Strängen ist das der Normalfall.
4. Pushen.

---

## Dokumente (Lesereihenfolge)

1. Dieser Session-Prompt und die Datei des eigenen Strangs (verbindlich)
2. `docs/VISION.md` v1.0 – Unterrichtsersatz ohne KI, Variante A zuerst
3. `docs/VERMITTLUNG.md` – Konzept Vermitteln und Diagnostizieren ohne KI; `docs/PRUEFUNGEN.md` – Aufbau der sächsischen Prüfungen
4. `docs/STRATEGIE.md` §0 (Schwelle für Variante B) und §9 (K-23 bis K-28)
5. `docs/KONZEPT.md` – §0 fasst die neue Ausrichtung zusammen; die vollständige Überarbeitung folgt mit dem Pilot
6. `docs/PLAN.md` §4b (Arbeitsplan U0 bis U8), §2.1 (Nicht-Ziele)
7. `docs/LEHRPLAN.md`, `docs/INHALTSFORMAT.md`, `docs/DATENMODELL.md`
8. Je nach Aufgabe: `docs/GRAFIK.md`, `docs/ARCHITEKTUR.md`, `docs/BASEBAU.md`, `docs/TESTS.md`

---

---

## Aktueller Auftrag

Steht in der Datei des Strangs. Für beide gilt:

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

---

## Lehren (für alle Stränge)

- **Svelte und IndexedDB:** Werte aus `$state` sind Proxys. IndexedDB lehnt sie ab (DataCloneError), die Ablage fängt den Fehler ab, und es wird still nichts gespeichert. Vor dem Speichern `$state.snapshot` nutzen, oder `$state.raw` für ganze Datensätze.
- **Laufende `vite preview`-Prozesse** heißen `…/vite.js preview`. Beenden mit `pkill -f "[v]ite.js preview"`, sonst liefert ein alter Server alte Stände aus.
- **Bildschirmfotos** von Playwright nur mit absoluten Pfaden in den Arbeitsordner speichern, nie ins Repository.
- **Lint-Fehler von svelte-check** stehen in Großbuchstaben (`ERROR`). Beim Filtern der Ausgabe danach suchen.
- Browser-Tests suchen Knöpfe im Hauptbereich (`page.getByRole('main')…`). Für „Mehr“ gibt es `mehr(page)`. Das Formular der Aufgabe ist `form#antwort`, das der Schritte `form.aktuell`.
- Browser-Tests, die neu laden, warten vorher, bis die Antwort in IndexedDB steht (`aufgabenImSpeicher`). Sonst geht sie beim Neuladen verloren, und der Test ist in der CI manchmal rot.
- `tools/logische-css.test.ts` verbietet `min-width` in Medienabfragen. Stattdessen `@media (width >= 36rem)` schreiben.
- `pnpm lint` nicht mit `grep error` filtern. Prettier meldet `[warn]`, und `svelte-check` endet trotzdem grün. Den Exit-Code prüfen.
- Browser-Tests starten nur `vite preview` und nutzen den letzten Build. Nach Änderungen an Inhalten oder Oberfläche erst `pnpm build`.
- Beim Squash-Merge per Werkzeug braucht `expectedHeadSha` die volle SHA mit 40 Zeichen.

## Am Ende der Sitzung aktualisieren

- [ ] In der Datei des eigenen Strangs: „Aktueller Auftrag“, Übergabe und Lehren; im Protokoll des Strangs eine Zeile unten anhängen
- [ ] Im eigenen Abschnitt von `PLAN.md` den Stand
- [ ] Diese Datei nur, wenn sich etwas für alle Stränge ändert (Grundentscheidungen, Regeln, gemeinsame Lehren)
