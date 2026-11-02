# Strang Lernkern – Session-Prompt

> Für Sitzungen, die am Lernkern arbeiten: Inhalte, Erstvermittlung, Fehlerkataloge, Üben, Diagnose, Prüfungen.
> Vorher den gemeinsamen Teil lesen: `docs/SESSION-PROMPT.md`. Am Ende der Sitzung nur diese Datei und den Abschnitt §4b in `docs/PLAN.md` aktualisieren.

Stand: 01.11.2026 · Fokus-Auftrag `FOKUS.md`: Rückfragen beantwortet, F1 und F6 (`pnpm arbeitsblatt`) erledigt · Paket L zum größten Teil umgesetzt (L1–L17, L19, L20) · Nächster Schritt: L18, Rundgang, Abnahme L durch den PV, dann F2 · Parallel zu L (PV, #146): F4 erledigt (`pnpm auswertung`), dann F5

---

## Zuständigkeit

Siehe Tabelle im gemeinsamen Teil. Kurz: `content/`, `src/core/learning/`, `src/core/competence/`, `src/core/testphase/`, `src/core/srs/`, `src/generators/`, `src/ui/ueben/`, `src/ui/vermittlung/`, `src/ui/eingabe/`, `src/ui/eltern/`, `tools/inhalte/`, `tools/pruefbogen/`, `tools/review/`, `tools/auswertung/`. Dokumente: `VERMITTLUNG.md`, `INHALTSFORMAT.md`, `LEHRPLAN.md`, `PRUEFUNGEN.md`, `TESTS.md`, `DATENMODELL.md` (Lernereignisse).

**Besonders kritisch prüfen:** die didaktische Qualität der Erstvermittlung und der Fehlererklärungen.

---

## Aktueller Auftrag

**Erledigt:**

- **U0 bis U2:** neue Vision, Format, Musterfeld Brüche.
- **U3 vollständig** (PLAN §4b): Abspieler der Erstvermittlung und Angebot vor dem ersten Üben (Zustand „erklärt“, Abschluss = Bauschritt), Diagnose der Fehlvorstellungen, Rückmeldung mit kurzer und langer Erklärung, Rückweg, Kontrastaufgaben, Zwischenschritte (K-29) im Musterfeld und Fehlerwerkstatt nach Ursachen.
- **U4a:** Testprotokoll (K-14, D-18).
- **U5a** (Entscheidung 30.10.2026: Variante (b) vor dem Test): alle Fehlerbilder im Feld Brüche und Dezimalzahlen zugeordnet, 35 neue Fehlvorstellungen (zusammen 45), Stand 82 von 596 Fehlerbildern.
- **U5b und U5c:** alle 596 Fehlerbilder zugeordnet, alle 123 Kompetenzen mit Erstvermittlung.
- **01.11.2026, F4:** `pnpm auswertung` beantwortet nach U4b Kriterium 1 und F5 aus `STRATEGIE.md` §0 mit ja oder nein. Einstiegsaufgaben: die ersten 3 Aufgaben auf Niveau G nach der Erstvermittlung, ohne Tipp (`TESTS.md` §4.5). Der PV hat entschieden, dass F4 bis F6 parallel zu Paket L laufen, ohne die Lern-Oberfläche zu ändern (#146).
- **31.10.2026:** Prüfbogen (#88, #91), Review-Vermerk (#92), Zwischenschritte gleichnamig (#97), eigene Tastatur (#100), Brüche als Antwortmöglichkeit (#102), **Stufe 1 für das Musterfeld** (22 Dateien, Funde unten in der Übergabe).

**Als Nächstes:**

0. ~~**U5b**~~ fertig (30.10.2026): Alle 596 Fehlerbilder verweisen auf eine der 200 Fehlvorstellungen, `fv` ist Pflicht. Die PRs gehen nacheinander auf `main`. Als Nächstes gibt es zwei Möglichkeiten: U4b (Test) oder das Nachrüsten der Klassen 5 bis 8 mit Erstvermittlungen (U5, Rest). Die Erstvermittlungen müssen die Schritt-IDs anlegen, auf die die Rückwege schon zeigen (`…#erklaeren-…`).
0. ~~**U5c**~~ fertig (30.10.2026): Alle 123 Kompetenzen der Klassen 5 bis 8 haben eine Erstvermittlung, je Feld ein PR. Alle sind KI-Entwurf und noch nicht fachlich geprüft. Offen: Viele Kompetenzen haben weniger als drei Fehlvorstellungen (F1), und Felder ohne Werkzeug (Gleichungssysteme, Funktionen, Geometrie, Daten) haben keine Bilder (V3); dafür bräuchte es ein Koordinaten- und ein Geometrie-Werkzeug. Achtung V8: Jedes Zeichen wie „·“ oder „=“ zählt als Wort. Neue Erstvermittlungen in der Kurzform `text: { de: … }` schreiben und vor Prettier in die Blockform bringen.

1. **U4b, der Test mit den drei Testerinnen** (`TESTS.md` §2–3):
   - Nummern mit `pnpm testnummern` ausgeben, Einwilligungen einholen.
   - Danach die Testprotokoll-Dateien auswerten: Verständnis, Treffer der Erklärungen, Nutzung der Zwischenschritte und „Weiter ohne Weg“.
2. **Vorher:** Das Musterfeld fachlich prüfen lassen (drei Erstvermittlungen, zehn Fehlvorstellungen, Schritte), am besten durch eine Lehrkraft.
   Dafür gibt es den Prüfbogen (30.10.2026): `pnpm pruefbogen M.ZO.BR.BEGRIFF M.ZO.BR.ERWEITERN M.ZO.BR.ADD-SUB > pruefbogen.html`, im Browser als PDF drucken. Das sind etwa 46 Seiten. Er enthält die drei Erstvermittlungen, die zehn Fehlvorstellungen, sechs Vorlagen mit je 20 Aufgaben pro Niveau und zwölf Fachbegriffe, zu jedem Abschnitt Ankreuzfelder. Die Ergebnisse arbeitet die nächste Sitzung ein. Den Vermerk schreibt `pnpm review setzen` (INHALTSFORMAT §8, seit 31.10.2026). Vor Stufe 2 braucht jede Datei Stufe 1: ein zweites Modell prüft sie gegen den Prüfkatalog in §8, in einer frischen Sitzung. *Erledigt am 31.10.2026* für alle 22 Dateien des Musterfelds; die Texte haben sich dabei geändert, darum den Prüfbogen vor dem Versand neu erzeugen. Die Seite zum Ausfüllen liegt als Artefakt unter https://claude.ai/artifact/NKSgnmWBsS1TpZ6uLLLgwy. Sie wird mit `pnpm pruefbogen --online --name "Musterfeld Brüche" …` erzeugt und auf derselben Adresse neu veröffentlicht. Die Eingaben stehen in der Sammlung `bewertung` der Seite. Die Lehrkraft braucht Schreibrechte (per E-Mail als Bearbeiterin einladen), sonst speichert die Seite nur in ihrem Browser.
   **Arbeitsblatt dazu (F6, 01.11.2026):** `pnpm arbeitsblatt M.ZO.BR.BEGRIFF M.ZO.BR.ERWEITERN M.ZO.BR.ADD-SUB --niveau G --anzahl 12 --seed 7 > blatt.html` – drei Seiten, als Dankeschön und Probe für den Unterricht zusammen mit dem Prüfbogen anbieten (Vorschlag an den PV in der Übergabe von `FOKUS.md`).
3. **Bis zum Test möglich**, auf Wunsch:
   - **(a)** ein zweites Musterfeld, z. B. Dezimalzahlen,
   - ~~**(b)** die 596 vorhandenen Fehlerbilder den Fehlvorstellungen zuordnen~~ – gewählt, läuft als U5a/U5b.

---

## Geplant für spätere Sitzungen (noch nicht anfangen)

Dieser Abschnitt ist ein Arbeitsauftrag. Er wird erst umgesetzt, wenn eine Sitzung ihn ausdrücklich aufnimmt. Vorher kein Code, keine neuen Abhängigkeiten, keine Branches dafür.

Die Review-Stufen stehen schon fest (`INHALTSFORMAT.md` §8): 0 Entwurf, 1 Maschine, 2 Stichprobe durch eine Person, 3 mit Lernenden bewährt. Öffentlich erst ab Stufe 2. Das ist noch nicht erzwungen, weil die Seite `main` folgt.

### 1. Aus dem Lernkern-Review

1. ~~**Die Merge-Reihenfolge steht oben**~~ – erledigt am 30.10.2026, siehe dort.
2. **Alte Branches schließen, nicht mergen:** `u5b-*`, `u2-*`, `u3*`. *PV löscht sie selbst (01.11.2026).* Ein Merge setzt Fehlvorstellungen und Vermittlungstexte auf einen älteren Stand zurück. Schließen oder löschen. `u5c-fz`, `u5c-gm` und `u5c-rf` danach nicht noch einmal öffnen.
3. ~~**Öffentliche Seite von `main` trennen.**~~ *Erledigt 02.11.2026 (F2): `BASTION_MINDESTSTUFE`, INHALTSFORMAT §8, README „Was ist öffentlich?“.* *Entschieden 01.11.2026: Filter im Build (ARCHITEKTUR T-20), Umsetzung F2 in `FOKUS.md`.* Bisher: Release-Branch oder Filter im Build. Empfehlung: Filter im Build mit `wirksameStufe` (`pnpm review` zeigt den Stand), kein zweiter Branch. `main` bleibt die Werkstatt, auch mit Stufe 0. Die öffentliche Seite bekommt nur Inhalte ab Stufe 2, oder einen eigenen Release-Branch, der nur solche Stände enthält. Die Vorschau zeigt den Rest und kennzeichnet die Stufe für den Eigentümer, nicht für Lernende. Solange das nicht steht, folgt bastion.micana.de weiter `main`; das README sagt, dass alles Entwurf ist.
4. **Zwischenschritte** über die drei Bruchvorlagen hinaus: ~~gleichnamiges Addieren~~ (erledigt 31.10.2026: Schritte `rechnen` und `kuerzen`, eine Vorlage darf eine Auswahl der Generator-Schritte nehmen) und die Rechenzeilen für Gleichungen (K-29). Weitere mehrschrittige Vorlagen danach, nicht alles auf einmal.
5. ~~**`docs/PLAN.md` Abschnitt 1**~~ – erledigt am 31.10.2026: gleicher nächster Schritt wie hier.
6. **Klasse 9 bis 12 und PDF-Prüfungen** erst, wenn eine Klassenstufe der 5 bis 8 einmal Stufe 2 und den Test U4b bestanden hat (mindestens 2 von 3 Unkundigen lösen danach die Einstiegsaufgaben). Bis dahin kein neuer Stoff oberhalb von Klasse 8.

### 2. Eigene Tastatur für Zahlen und Terme

**Erledigt am 31.10.2026** (INHALTSFORMAT §5.2): `Tastatur.svelte` in Üben, Diagnose, Zwischenschritten und Erstvermittlung, Regel `tastenFuer` im Kern, Feld `tastatur` in Vorlage und Instanz, ±-Knopf entfernt. Offen: Tasten für Primfaktoren (Malpunkt) und Uhrzeiten (Doppelpunkt). Die Rechenzeilen für Gleichungen nutzen später Variablen-Tasten.

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

**Schritt 1 erledigt (31.10.2026):** Ich habe rund 90 000 Texte ausgewertet: alle Erstvermittlungen, Fehlvorstellungen, Begriffe und Anleitungen, dazu je Vorlage und Niveau 30 erzeugte Aufgaben mit Lösungsweg und Antwortmöglichkeiten. Ergebnis:

- **Gefunden und behoben:** Bei „Welcher Bruch ist am größten?“ zeigten die Antwortmöglichkeiten `$\frac{3}{4}$` als Text. Die Teilmenge kann jetzt `\frac{…}{…}`, und Antwortmöglichkeiten laufen durch sie (Test `darstellung.test.ts`).
- **Offen, braucht eine neue Generator-Version:** Der Lösungsweg zu Zehnerpotenzen (`potenzen.ts`) zeigt `10^6` statt 10⁶. Der Text gehört zur Ausgabe des Generators (INHALTSFORMAT §6.1, Regel 5).
- **Schon mit Unicode gelöst und ausreichend:** ², ³, ⁴, ⁶, √ vor einer Zahl, π, ≈, ≤, ≥, °, ⊥/⟂, ∥, Indizes x₁, |−5|, →, Mengen {5, 6}, ⅓. Keine Wurzel über eine Summe, keine Brüche mit Variablen, keine Vektoren, keine Integrale.
- **Didaktisch auffällig:** Etwa 3 600 Texte aus 94 Quellen schreiben Brüche mit Schrägstrich im Fließtext („1/4 + 2/4 = 3/4“), vor allem die Erstvermittlungen. Mit `$\frac{1}{4}$` erschienen sie als echter Bruch. Das wäre eine Inhaltsänderung über viele Dateien. Darüber entscheidet der Projektverantwortliche, am besten nach der Rückmeldung der Lehrkraft.
- **Folgerung:** Für Klasse 5 bis 8 fehlt kein Zeichen, das KaTeX nötig machte. Schritt 2 (KaTeX messen) wartet, bis Klasse 9 bis 12 (Vektoren, Integrale) drankommt.

**Schritte, wenn es drankommt**

1. ~~Liste der Zeichen, die Klasse 5 bis 8 wirklich brauchen und die die eigene Teilmenge nicht kann.~~ Erledigt, siehe oben.
2. Bundle von KaTeX lokal messen, ohne es fest einzubauen. Entscheidungslog nur bei einem Ja.
3. Wenn ja: Anzeige hinter derselben `$…$`-Schreibweise, Inhalte nicht umschreiben. Ein Test, dass alte Texte gleich aussehen.
4. Vorlese-Funktion an einem Bruch, einer Hochzahl und einer Wurzel prüfen.

---

---

## Wünsche aus dem anderen Strang

Hier trägt der andere Strang ein, was er in diesem Bereich braucht (gemeinsamer Teil, Regel 1). Erledigtes durchstreichen und mit Datum versehen.

- (noch keine)

---

## Protokoll

Steht in `docs/session/LERNKERN-PROTOKOLL.md`. Neue Zeilen dort unten anhängen, nicht hier.

---

## Übergabe der Sitzung 31.10.2026 (Stufe 1 Musterfeld)

**Geprüft:** die Kompetenzen `M.ZO.BR.BEGRIFF`, `…ERWEITERN`, `…ADD-SUB` mit `kompetenz.yaml`, `vermittlung.yaml` und je zwei Vorlagen (samt Generator-Code), dazu die zehn Fehlvorstellungen. Bei den Fehlvorstellungen auch jede Stelle außerhalb des Musterfelds, die auf sie zeigt (Frage 3 des Prüfkatalogs). Danach `pnpm review setzen --stufe 1 --pruefer maschine` für alle 22 Dateien.

**Funde und Änderungen:**

- *Frage nicht eindeutig (Frage 1).* Die Erstvermittlung vergleicht Brüche genau so, wie sie geschrieben sind. Wer richtig kürzt, war falsch:
  - BEGRIFF `ergaenzen`: 1/3 statt 2/6. Die Frage verlangt jetzt den Nenner 6.
  - ERWEITERN `entdecken`: 2/3 statt 4/6. Die Doppelfrage „Ist jetzt mehr gefärbt?“ lud genau dazu ein. Die Frage verlangt jetzt den Nenner 6.
  - ADD-SUB `ergaenzen`: 1/2 statt 3/6. Jetzt: „in Sechsteln, noch ohne zu kürzen“.
  - ADD-SUB `entdecken`: „Wie viele Viertel?“ lädt zur Zahl 3 ein, erwartet war ein Bruch. Jetzt: „Gib ihn als Bruch an.“
  - Zwischenschritt `kuerzen` in UNGLEICHNAMIG: Bei 5/6 gab es nichts zu kürzen und keine Anweisung. Jetzt wie bei GLEICHNAMIG: „Geht es nicht, schreibe den Bruch noch einmal hin.“
- *Falsche Zuordnung (Frage 3).*
  - ERWEITERN `pruefen`: Die Option 6/4 zeigte auf „nur den Nenner verändert“. Verändert ist aber nur der Zähler. Dafür gibt es keine Fehlvorstellung, darum ist die Option weg.
  - BEGRIFF `ergaenzen` und `pruefen`: Bei vertauschtem Zähler und Nenner ging der Rückweg zu `erklaeren-gleich` (gleich große Teile). Jetzt geht er wie in der Fehlvorstellung zu `erklaeren-ganzes` (oben/unten).
- *Kurze Erklärung passt nicht zu jedem Fehlerbild (Frage 3).*
  - TEIL-ZU-REST: „gefärbt und ungefärbt“ passt nicht zu Kugeln und Würfen (Wahrscheinlichkeit, Häufigkeit). Jetzt: „die gemeinten und die übrigen“.
  - NENNER-ADDIERT: „Der Nenner bleibt“ passt nicht zu ungleichen Nennern und nicht zum Subtrahieren. Jetzt: „Nenner werden nie addiert oder subtrahiert.“
  - EINTEILUNG: „Zähle sie noch einmal“ passt nicht zu Lea, die richtig 4 zählt, aber ungleich teilt.
  - NICHT-VOLLSTAENDIG: „Richtig gekürzt“ passt nicht zum Schritt „größter gemeinsamer Teiler“, in dem noch nichts gekürzt ist.
  - NUR-NENNER (lange Erklärung): sprach nur von kleineren Teilen. Beim Kürzen werden die Teile größer.
- *Fachlich unklar (Frage 4).*
  - FAKTOR, Gegenbeispiel: „6/12, das ist nur die Hälfte“ ließ sich als Hälfte von 8/12 lesen.
  - BEGRIFF `gegenbeispiel`: Im Text stand ein Kuchen, das Bild zeigt einen Streifen. Jetzt „ein Blech Kuchen“.

**Kein Fund, aber für die Lehrkraft notiert:**

- Das Fehlerbild `nicht-erweitert` in GLEICHNAMIG erzeugt `br.add-sub@1` nie. Der Text muss trotzdem dastehen; ein Kommentar sagt das jetzt.
- Bei G (`vielfaches`) fragt ein Zwischenschritt „Erweitere 1/4 auf den Nenner 4“, also mit dem Faktor 1. Das ist eindeutig, wirkt aber seltsam. Ob der Schritt dann entfällt, wäre eine Änderung am Kern.
- Die Kompetenzen versprechen mehr, als die Vorlagen üben: BEGRIFF M „echte und unechte Brüche unterscheiden“ (alle Aufgaben sind echte Brüche), ADD-SUB M „gemischte Zahlen“.
- `uebergang` lobt („Gut gemacht“, „Prima“, „Sehr gut“). Er kommt nur nach einem richtigen `pruefen`, darum steht das so.

**Offen, braucht den Projektverantwortlichen:** Prüfbogen neu erzeugen und auf https://claude.ai/artifact/NKSgnmWBsS1TpZ6uLLLgwy neu veröffentlichen (die Texte haben sich geändert), dann die Lehrkraft einladen.

## Übergabe der Sitzung 30./31.10.2026

**Umgesetzt** (alle auf `main`):

- **Merge-Reihenfolge:** #82 und #86 (`u5c-dz`) nach #85 und #84. In der Ähnlichkeit heißt das Rechteck „6 cm breit und 4 cm hoch“.
- **Prüfbogen** (#88, #91): `pnpm pruefbogen` als PDF zum Drucken, `--online` als Artefakt-Seite zum Ausfüllen, https://claude.ai/artifact/NKSgnmWBsS1TpZ6uLLLgwy. Beim Bau fiel ein Inhaltsfehler auf: Die Hilfe beim Erweitern sagte „teilen“ statt „malnehmen“. Er ist behoben.
- **Review-Vermerk** (#92): `pnpm review` und `pnpm review setzen`, Prüfkatalog für Stufe 1 in INHALTSFORMAT §8. Noch trägt keine Datei einen Vermerk.
- **Zwischenschritte gleichnamig** (#97): Vorlagen dürfen eine Auswahl der Generator-Schritte nehmen (§17).
- **Eigene Tastatur** (#100, §5.2): Der ±-Knopf ist weg.
- **Brüche als Antwortmöglichkeit** (#102): Die Teilmenge kann `\frac`, und ein Probelauf prüft die Anzeige aller Vorlagen.

**Offen, braucht den Projektverantwortlichen:**

- Lehrkraft für den Prüfbogen gewinnen und als Bearbeiterin einladen.
- ~~Öffentliche Seite trennen: Release-Branch oder Filter im Build (Punkt 1.3).~~ Entschieden 01.11.2026: Filter im Build (T-20), Umsetzung F2.
- Ob die Brüche mit Schrägstrich in den Erstvermittlungen auf `$\frac{…}{…}$` umgestellt werden (etwa 3 600 Stellen, Punkt 3).
- ~~Ob `potenzen.ts` eine neue Version bekommt~~ Entschieden 01.11.2026: ja, neue Generator-Version (10⁶ statt `10^6`), eigener kleiner PR.

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
- **Generatoren mit Schritten:** Erweitern auf Zielnenner, Kürzen, Addieren/Subtrahieren. Der ungleichnamige Fall zeigt Schritte, der gleichnamige noch nicht.

**Lernkern-Review (30.10.2026):** Drei Inhaltsfehler aus der Prüfung vom 30.10. sind behoben. Beim Schatten-Kehrwert steht jetzt das umgedrehte Verhältnis (Stab 2 m, Schatten 3 m, Baumschatten 12 m → 0,5 m). Die Fragen zum Erweitern und Vergleichen sagen, welcher Bruch einzutippen ist. Wer beim Zinseszins „wieder 50 €“ wählt, kommt zur Erklärung, dass das Kapital im zweiten Jahr größer ist. Ein Test rechnet beschriebene Fehlrechnungen aus dem Aufgabentext nach. Die Ähnlichkeits-Erstvermittlung (welche Seite die Breite ist) liegt nur auf `u5c-dz`, nicht auf main.

**Offene Punkte:**

- Fragen in `VERMITTLUNG.md` §8 (Lehrkraft, amtliche Abitur-Vorgaben 2029, Werkzeuge).
- PDF- und Formelsatz-Technik für die Prüfungen (neue Abhängigkeit möglich, vorher fragen).
- Rechenzeilen für Gleichungen (K-29) kommen mit U5. Schritte für gleichnamige Brüche gibt es seit 31.10.2026.
- Die Schwellen der Diagnose (`FV_REGELN`) sind Startwerte und werden im Test geprüft.
- Alte Branches auf GitHub ließen sich von hier nicht löschen (HTTP 403). Lokal gibt es nur `main`. Löschen über GitHub → Branches, oder dort „Automatically delete head branches“ einschalten.
- PR #63 wurde per normalem Merge-Commit statt per Squash gemergt. Das ist unschädlich.

**Übergabe U5a (30.10.2026, Tagschicht):**

- Feldübergreifende Fehlvorstellungen heißen nach dem Feld, in dem sie zuerst gelernt werden (`FV.NZ.PUNKT-VOR-STRICH`), Sachaufgaben-Fehler `FV.SA.…` (INHALTSFORMAT §16).
- Die kurze Erklärung erscheint **unter** dem Satz des Fehlerbilds. Sie muss zu allen Fehlerbildern passen, die auf sie zeigen, und darf ihnen nicht widersprechen. Darum gibt es `FV.BR.NICHT-GEKUERZT` getrennt von `FV.BR.NICHT-VOLLSTAENDIG`.
- Rückwege zeigen auf Schritte künftiger Erstvermittlungen (`…#erklaeren-…`). Wer später die Erstvermittlung schreibt, muss diese Schritt-IDs anlegen, sonst meldet die Prüfung einen Fehler.
- Zur fachlichen Prüfung: Manche kurze Erklärung wiederholt fast den Satz des Fehlerbilds (etwa beim Vergleichszeichen). Beim Review entscheiden, ob der Fehlerbild-Satz dann kürzer werden soll.
- `pnpm inhalte:begriffe` markiert Fachbegriffe jetzt auch in Fehlvorstellungen. Unbekannte Markierungen (`[[Brüchen]]`) entfernt es nicht; die meldet `pnpm inhalte:pruefen`.

**Lehren (Lernkern):**

- **Teilschritte auf eigenen Zweigen:** Wer sie aus dem Arbeitsbranch auslagert, merged `main` normal hinein. Bei Konflikten die Zweig-Seite nehmen und vor dem Commit nach `<<<<<<<` suchen.
- Lokal überschreitet `fk.graph-ablesen` im vollen Testlauf manchmal die Zeitgrenze. Das passiert auch auf `main`, in der CI nicht.
- Erstvermittlungen: Seit der eigenen Tastatur (31.10.2026) gibt es in Zahlenfeldern ein Minus, sobald die Lösung oder ein bekannter Fehler negativ ist. Negative Ergebnisse dürfen also wieder als Eingabe abgefragt werden.
- Werkzeug `zahlenstrahl@1`: `markiert` zählt ab 0 in Schritten der Einteilung, nicht ab `von`. Von 3 bis 4 in Zehnteln liegt 3,5 bei `markiert: 35`. Ganzzahlige Bereiche wie 30 bis 40 lassen sich damit nicht beschriften.
- Werkzeuge, die Generatoren brauchen, starten über `runnerImport` von Vite (`import.meta.glob` in `src/generators/alle.ts`), siehe `tools/pruefbogen/lauf.ts`.
