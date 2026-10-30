# Session-Prompt – Bastion (Unterrichtsersatz)

> Dieser Text ist der verbindliche Einstieg in jede Arbeitssitzung.
> Am Ende jeder Sitzung wird er aktualisiert und mit committet.

Stand: 30.10.2026 (23) · Merge-Reihenfolge: zuerst PR #85 (Zoom), dann #84, dann #82, dann u5c-dz

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

0. ~~**U5b**~~ fertig (30.10.2026): Alle 596 Fehlerbilder verweisen auf eine der 200 Fehlvorstellungen, `fv` ist Pflicht. Die PRs gehen nacheinander auf `main`. Als Nächstes gibt es zwei Möglichkeiten: U4b (Test) oder das Nachrüsten der Klassen 5 bis 8 mit Erstvermittlungen (U5, Rest). Die Erstvermittlungen müssen die Schritt-IDs anlegen, auf die die Rückwege schon zeigen (`…#erklaeren-…`).
0. ~~**U5c**~~ fertig (30.10.2026): Alle 123 Kompetenzen der Klassen 5 bis 8 haben eine Erstvermittlung, je Feld ein PR. Alle sind KI-Entwurf und noch nicht fachlich geprüft. Offen: Viele Kompetenzen haben weniger als drei Fehlvorstellungen (F1), und Felder ohne Werkzeug (Gleichungssysteme, Funktionen, Geometrie, Daten) haben keine Bilder (V3); dafür bräuchte es ein Koordinaten- und ein Geometrie-Werkzeug. Achtung V8: Jedes Zeichen wie „·“ oder „=“ zählt als Wort. Neue Erstvermittlungen in der Kurzform `text: { de: … }` schreiben und vor Prettier in die Blockform bringen.

1. **U4b, der Test mit den drei Testerinnen** (`TESTS.md` §2–3):
   - Nummern mit `pnpm testnummern` ausgeben, Einwilligungen einholen.
   - Danach die Testprotokoll-Dateien auswerten: Verständnis, Treffer der Erklärungen, Nutzung der Zwischenschritte und „Weiter ohne Weg“.
2. **Vorher:** Das Musterfeld fachlich prüfen lassen (drei Erstvermittlungen, zehn Fehlvorstellungen, Schritte), am besten durch eine Lehrkraft.
3. **Bis zum Test möglich**, auf Wunsch:
   - **(a)** ein zweites Musterfeld, z. B. Dezimalzahlen,
   - ~~**(b)** die 596 vorhandenen Fehlerbilder den Fehlvorstellungen zuordnen~~ – gewählt, läuft als U5a/U5b.

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

## Merge-Reihenfolge (30.10.2026)

Nicht durcheinander mergen. Je Schritt erst grüne CI, dann Squash. Diese Reihenfolge ersetzt den früheren Plan, PR #82 zuerst zu mergen.

1. **PR #85 geht zuerst live.** Grafik: Zoom des Bauplatzes wie in Dorfkrieg. Branch `cursor/dorfkrieg-zoom-e6c9`, https://github.com/michael-linuxdev/bastion/pull/85. Gilt für jedes Thema, nicht nur für Dorf: statt der drei Stufen 100 %, 150 % und 200 % mit Rollbalken zoomen **+** und **−** um etwa 12 % auf die Mitte, das Mausrad und zwei Finger zoomen auf den Zeiger, Ziehen verschiebt die Karte, **⌖** zeigt wieder das ganze Bild. Kleiner als 35 % und größer als 240 % geht es nicht.
2. **Danach PR #84** (dieser Stand: Lernkern-Korrekturen, Review-Stufen, dieser Prompt), https://github.com/michael-linuxdev/bastion/pull/84. Vorher den Branch auf das neue `main` nach #85 setzen. Normal mergen, nicht mit `merge -s ours`: #85 steckt hier noch nicht drin. `git merge-tree` am 30.10.2026 zwischen diesem Branch und `cursor/dorfkrieg-zoom-e6c9`: keine Konflikte, keine gemeinsame Datei.
3. **Dann PR #82** (`u5c-sf`, Erstvermittlungen Terme und Gleichungen). Konflikt voraussichtlich nur in `docs/PLAN.md` und `docs/SESSION-PROMPT.md`. Beide Absätze behalten.
4. **Dann einmal `u5c-dz`**, nicht die Zwischenschritte `u5c-fz`, `u5c-gm` und `u5c-rf` als eigene PRs. In `M.RF.AE.AEHNLICH/vermittlung.yaml` (nur auf `u5c-dz`) die Breite festnageln: die 6 cm gehören zur neuen Breite 9 cm, Faktor 1,5, die andere Seite ist 6 cm.

**PR #83** (Dorf-Grafik, Dorfbilder) ist bereits auf `main`.

---

## Geplant für spätere Sitzungen (noch nicht anfangen)

Dieser Abschnitt ist ein Arbeitsauftrag. Er wird erst umgesetzt, wenn eine Sitzung ihn ausdrücklich aufnimmt. Vorher kein Code, keine neuen Abhängigkeiten, keine Branches dafür.

Die Review-Stufen stehen schon fest (`INHALTSFORMAT.md` §8): 0 Entwurf, 1 Maschine, 2 Stichprobe durch eine Person, 3 mit Lernenden bewährt. Öffentlich erst ab Stufe 2. Das ist noch nicht erzwungen, weil die Seite `main` folgt.

### 1. Aus dem Lernkern-Review

1. **Die Merge-Reihenfolge steht oben:** zuerst PR #85, dann PR #84 auf den neuen `main`, dann PR #82, dann einmal `u5c-dz`. Die Breite in der Ähnlichkeit gehört zu Schritt 4.
2. **Alte Branches schließen, nicht mergen:** `u5b-*`, `u2-*`, `u3*`. Ein Merge setzt Fehlvorstellungen und Vermittlungstexte auf einen älteren Stand zurück. Schließen oder löschen. `u5c-fz`, `u5c-gm` und `u5c-rf` danach nicht noch einmal öffnen.
3. **Öffentliche Seite von `main` trennen.** `main` bleibt die Werkstatt, auch mit Stufe 0. Die öffentliche Seite bekommt nur Inhalte ab Stufe 2, oder einen eigenen Release-Branch, der nur solche Stände enthält. Die Vorschau zeigt den Rest und kennzeichnet die Stufe für den Eigentümer, nicht für Lernende. Solange das nicht steht, folgt bastion.micana.de weiter `main`; das README sagt, dass alles Entwurf ist.
4. **Zwischenschritte** über die drei Bruchvorlagen hinaus: gleichnamiges Addieren und die Rechenzeilen für Gleichungen (K-29). Weitere mehrschrittige Vorlagen danach, nicht alles auf einmal.
5. **`docs/PLAN.md` Abschnitt 1** auf denselben nächsten Schritt setzen wie §4b und dieser Prompt. Der Kopf nennt noch U1 und den 29.10.2026. Abschnitt 4b ist der gültige Arbeitsplan.
6. **Klasse 9 bis 12 und PDF-Prüfungen** erst, wenn eine Klassenstufe der 5 bis 8 einmal Stufe 2 und den Test U4b bestanden hat (mindestens 2 von 3 Unkundigen lösen danach die Einstiegsaufgaben). Bis dahin kein neuer Stoff oberhalb von Klasse 8.

### 2. Eigene Tastatur für Zahlen und Terme

Die Minustaste beim Üben (`src/ui/ueben/Eingabe.svelte`, Knopf ±, nur wenn die Instanz `vorzeichen` setzt) und das Zahlenfeld der Erstvermittlung (`inputmode="decimal"`, ohne Minus) werden eine Tastatur. Sie gehört zur App, läuft offline, und ersetzt den ±-Knopf. Die Systemtastatur bleibt für Namen und Freitext.

**Anforderungen**

- Tasten hängen an der Aufgabe, nicht an einem festen Layout. Ziffern immer, wenn eine Zahl kommt. Komma, wenn Dezimalzahlen vorkommen. Minus nur, wenn negative Antworten möglich sind. Bruchstrich bei Brüchen. Variablen und Einheiten nur, wenn die Vorlage sie nennt.
- Dieselbe Tastatur in Üben, Wiederholen, Fehlerwerkstatt und Erstvermittlung.
- Auf dem Handy groß genug für den Daumen, auf dem Rechner mit Tastatur weiterhin eingebbar. Fokus und Beschriftung für die Vorlese-Funktion. Kein Zeitdruck, kein Netz, keine neue Bibliothek.
- Kein MathLive (PLAN §2.1: keine Formeleingabe dieser Art).

**Datenmodell**

Die Vorlage nennt die Zusatz-Tasten. Der Generator darf sie je Aufgabe enger setzen (Minus nur in dieser einen Aufgabe). Die Instanz gewinnt, wenn sie etwas sagt; sonst gilt die Vorlage; sonst der Aufgabentyp (Zahl: Ziffern; Bruch: Zähler, Nenner, Bruchstrich).

```yaml
tastatur:
  - ziffern
  - komma
  - minus          # nur, wenn negative Antworten vorkommen
  - bruchstrich
  - variable: x
  - einheit: cm
```

**Schritte, wenn es drankommt**

1. Format in `INHALTSFORMAT.md` und Typen im Kern. Bestehende Vorlagen bleiben gültig; ohne Feld gilt der Aufgabentyp.
2. Eine Komponente für die Tasten, eingebunden in `Eingabe.svelte` und `Vermittlung.svelte`. Den ±-Knopf entfernen.
3. Tests: Minus fehlt, wenn die Aufgabe keins braucht; Bruchstrich erscheint bei Brüchen; Erstvermittlung und Üben zeigen dieselben Tasten.
4. Im Browser prüfen, Handy und Rechner, einschließlich einer Aufgabe mit negativer Zahl und einer Bruchaufgabe.

### 3. Mathematische Darstellung

Heute setzt `src/core/learning/text.ts` eine kleine eigene Teilmenge: Bruch aus dem Platzhalter, zwischen `$…$` Hochzahl, Wurzel und Malpunkt. Inhalte liefern kein HTML. Das bleibt der Ausgangspunkt.

`ARCHITEKTUR.md` §4.1 bevorzugt **KaTeX**, lokal gebündelt, vor MathJax. Eingebunden ist es nicht. `PLAN.md` verbietet MathLive. Eine Bibliothek wäre eine neue Abhängigkeit und braucht vorher einen Eintrag im Entscheidungslog.

**Vergleich, bevor jemand einbaut**

| | Eigene Svelte-Teile (heute) | KaTeX | MathJax |
|---|---|---|---|
| Lizenz | eigener Code, passt zur AGPL | MIT, mit AGPL bündelbar | Apache-2.0, mit AGPL bündelbar |
| Offline | ja | ja, wenn die Dateien mit der App kommen | ja, genauso |
| Größe | schon da, sehr klein | kleiner als MathJax; vor der Entscheidung am echten Bundle messen | größer |
| Barrierefreiheit | echte Zeichen und Bruch-Markup, das die Vorlese-Funktion lesen kann | MathML-Ausgabe prüfen, nicht nur das Bild der Formel | gilt als stärker für die Vorlese-Funktion; trotzdem messen |
| YAML | `$…$` und Platzhalter, schon so | dieselben `$…$`, wenn die Teilmenge reicht | ebenso |

**Richtung, noch keine Entscheidung:** Die eigene Teilmenge behalten, bis ein konkretes Zeichen fehlt (etwa Vektor, Matrix, Integral). Dann KaTeX gegen diese Teilmenge messen: Ladegröße, Offline, Vorlese-Funktion, ob `$…$` unverändert bleibt. MathJax nur, wenn KaTeX an der Vorlese-Funktion scheitert. Die Eingabe bleibt die Tastatur aus Punkt 2; sie schreibt dieselben Zeichen, die der Text schon versteht. Keine zweite Formelsprache.

**Schritte, wenn es drankommt**

1. Liste der Zeichen, die Klasse 5 bis 8 wirklich brauchen und die die eigene Teilmenge nicht kann.
2. Bundle von KaTeX lokal messen, ohne es fest einzubauen. Entscheidungslog nur bei einem Ja.
3. Wenn ja: Anzeige hinter derselben `$…$`-Schreibweise, Inhalte nicht umschreiben. Ein Test, dass alte Texte gleich aussehen.
4. Vorlese-Funktion an einem Bruch, einer Hochzahl und einer Wurzel prüfen.

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

**Nebenbei, Grafik (30.10.2026):** **PR #83** (Dorf-Grafik) ist auf `main`. Das Thema Dorf unter „Wie soll es aussehen?“ zeigt die Dorfbilder aus Dorfkrieg (Wiese, Häuser, Zaun, Bäume, `GRAFIK.md` §6). Die anderen Themen bleiben die Insel. Kampffiguren gibt es nicht. **PR #85** (Zoom des Bauplatzes wie in Dorfkrieg) ist noch nicht auf `main` und geht vor diesem Stand live. Der Zoom gilt für jedes Thema: nicht mehr 100 %, 150 % und 200 % mit Rollbalken, sondern + und − um etwa 12 % auf die Mitte, Mausrad und zwei Finger auf den Zeiger, Ziehen verschiebt, ⌖ zeigt das ganze Bild. Grenze 35 % bis 240 %. Der nächste inhaltliche Schritt bleibt U5c.

**Lernkern-Review (30.10.2026):** Drei Inhaltsfehler aus der Prüfung vom 30.10. sind behoben. Beim Schatten-Kehrwert steht jetzt das umgedrehte Verhältnis (Stab 2 m, Schatten 3 m, Baumschatten 12 m → 0,5 m). Die Fragen zum Erweitern und Vergleichen sagen, welcher Bruch einzutippen ist. Wer beim Zinseszins „wieder 50 €“ wählt, kommt zur Erklärung, dass das Kapital im zweiten Jahr größer ist. Ein Test rechnet beschriebene Fehlrechnungen aus dem Aufgabentext nach. Die Ähnlichkeits-Erstvermittlung (welche Seite die Breite ist) liegt nur auf `u5c-dz`, nicht auf main.

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
- Erstvermittlungen: Das Zahlenfeld hat `inputmode="decimal"`, auf dem iPhone fehlt dort das Minus. Negative Ergebnisse darum als Auswahl abfragen, nicht als Eingabe.
- Werkzeug `zahlenstrahl@1`: `markiert` zählt ab 0 in Schritten der Einteilung, nicht ab `von`. Von 3 bis 4 in Zehnteln liegt 3,5 bei `markiert: 35`. Ganzzahlige Bereiche wie 30 bis 40 lassen sich damit nicht beschriften.
- `tools/logische-css.test.ts` verbietet `min-width` in Medienabfragen. Stattdessen `@media (width >= 36rem)` schreiben.

## Am Ende der Sitzung aktualisieren

- [ ] „Aktueller Auftrag“ auf den nächsten Schritt setzen
- [ ] Wichtige Entscheidungen und offene Punkte hier festhalten
- [ ] `PLAN.md` und Entscheidungslogs anpassen
