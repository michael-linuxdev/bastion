# Vermitteln und Diagnostizieren ohne KI

Status: Konzept v0.1 · Stand: 29.10.2026 · Grundlage: VISION v1.0 §3 (K-23, K-24)
Noch nicht umgesetzt. Das genaue Dateiformat kommt mit dem Pilot nach `INHALTSFORMAT.md` (§7 unten).

Dieses Dokument beschreibt, wie Bastion die Kernaufgaben **1 Vermitteln** und **2 Diagnostizieren & Erklären** erfüllt – ausschließlich mit vorab geschriebenen, geprüften Inhalten und festen Regeln.

---

## 1. Grundsätze

1. **Alles ist vorher geschrieben.** Erklärungen, Bilder, Verständnisfragen und Rückmeldungen stehen als Inhalt im Repository. Zur Laufzeit wird nichts formuliert, nur ausgewählt und mit Zahlen gefüllt.
2. **Anpassung durch Verzweigung, nicht durch Erzeugung.** Wo eine Lehrkraft spontan reagieren würde, hat die Sequenz vorbereitete Abzweige: Für jede typische falsche Antwort gibt es einen nächsten Schritt.
3. **Die Ursache zählt, nicht die Aufgabe.** Ein Fehler wird einer **Fehlvorstellung** zugeordnet („Du addierst Nenner“), und die Erklärung richtet sich an diese Vorstellung, nicht an die einzelne Aufgabe.
4. **Vermittlung und Diagnose sind ein Kreis.** Jede Fehlvorstellung hat einen Rückweg in die Stelle der Vermittlung, an der das Richtige aufgebaut wird. Jede Verständnisfrage der Vermittlung erkennt Fehlvorstellungen aus dem Katalog.
5. **Didaktische Leitlinien** (bewährt, ohne KI umsetzbar):
   - an Vorwissen anknüpfen und es vorher prüfen;
   - Grundvorstellungen aufbauen, nicht nur Regeln (zum Beispiel „Bruch als Anteil eines Ganzen“ vor „Zähler mal …“);
   - Darstellungen wechseln: handelnd (interaktiv), bildlich, symbolisch;
   - vorgerechnete Beispiele, deren Schritte schrittweise ausgeblendet werden („Fading“);
   - Gegenbeispiele und vorgeführte Fehler („Tim rechnet so – stimmt das?“);
   - kleine Schritte, wenig Text je Bildschirm, aktive Antworten statt Lesen;
   - einfache Sprache und Fachbegriffe mit Erklärung (L-7).
6. **Geprüft vor freigegeben.** Inhalte dürfen mit KI-Hilfe entworfen werden. Als geprüft gelten sie erst nach menschlicher Prüfung mit Review-Hash (I-8, K-9). In der App gibt es keine KI.

## 2. Erstvermittlung

Jede Kompetenz bekommt eine **Erstvermittlungs-Sequenz**: eine kurze, interaktive Unterrichtsstunde für eine Person, höchstens etwa 15 Minuten, mit einem natürlichen Ende (R5).

### 2.1 Bausteine

Eine Sequenz besteht aus Schritten. Jeder Schritt hat einen Typ:

| Typ | Zweck | Beispiel (Brüche erweitern) |
|---|---|---|
| `ziel` | Sagen, was man danach kann – ein Satz | „Danach kannst du einen Bruch so umschreiben, dass er gleich groß bleibt.“ |
| `anknuepfen` | Vorwissen prüfen: 1–3 Fragen zu den Voraussetzungen | „Welcher Anteil ist gefärbt?“ – Bei Lücke: Rückweg zur Voraussetzung |
| `entdecken` | Ein Phänomen selbst erzeugen, meist mit einem interaktiven Werkzeug (§2.3) | Bruchstreifen 2/3 feiner teilen: Was passiert mit dem Anteil? |
| `erklaeren` | Die Grundvorstellung kurz erklären, mit Bild | „Feiner teilen ändert nicht, *wie viel* gefärbt ist.“ |
| `beispiel` | Vorgerechnetes Beispiel, Schritt für Schritt | 2/3 = (2·4)/(3·4) = 8/12 |
| `ergaenzen` | Beispiel mit ausgeblendeten Schritten selbst vervollständigen | 3/5 = (3·□)/(5·2) = □/10 |
| `gegenbeispiel` | Einen typischen Fehler vorführen und beurteilen lassen | „Tim rechnet 2/3 = 4/5. Stimmt das?“ |
| `merksatz` | Das Wichtigste in einem bis drei Sätzen; wird in „Mein Stand“ gesammelt | „Erweitern: Zähler und Nenner mit derselben Zahl multiplizieren.“ |
| `pruefen` | Verständnisfrage mit diagnostischen Antworten (§2.2) | Mehrfachauswahl, jede falsche Antwort gehört zu einer Fehlvorstellung |
| `uebergang` | Erste, leichte Übungsaufgaben aus den Vorlagen; dann weiter ins Üben | 3 Aufgaben aus `M.ZO.BR.ERWEITERN.*` auf Niveau G |

Feste Reihenfolge als Regel (Abweichungen begründen): `ziel` → `anknuepfen` → `entdecken` → `erklaeren` → `beispiel` → `ergaenzen` → `gegenbeispiel` → `merksatz` → `pruefen` → `uebergang`. Bei komplexen Kompetenzen wiederholt sich der Kern (`erklaeren` bis `pruefen`) für jeden Teilaspekt.

### 2.2 Verzweigungen

Schritte, die eine Antwort verlangen (`anknuepfen`, `entdecken`, `ergaenzen`, `gegenbeispiel`, `pruefen`), haben Regeln für den nächsten Schritt:

```yaml
- id: pruefen-1
  typ: pruefen
  frage: { de: "Welcher Bruch ist genauso groß wie 3/4?" }
  optionen:
    - { wert: "6/8", richtig: true }
    - { wert: "4/5", fv: FV.BR.ADDIERT }        # Zähler und Nenner um 1 erhöht
    - { wert: "6/4", fv: FV.BR.NUR-ZAEHLER }
    - { wert: "3/8", fv: FV.BR.NUR-NENNER }
  weiter: merksatz                             # bei richtig
  bei:                                         # bei falsch: je Fehlvorstellung
    FV.BR.ADDIERT: erklaeren-multiplizieren    # zurück an die passende Stelle
    FV.BR.NUR-ZAEHLER: beispiel-1
    sonst: beispiel-1
```

- Jeder Weg durch die Sequenz endet beim `uebergang`. Kein Weg ist eine Sackgasse, und kein Schritt wird öfter als zweimal hintereinander gezeigt. Danach geht es mit dem Hinweis „Das schauen wir uns beim Üben noch einmal an“ weiter.
- Ein Werkzeug prüft beim Bauen der Inhalte: Alle Ziele existieren, alle Wege enden, jede `fv` steht im Fehlerkatalog.

### 2.3 Interaktive Werkzeuge

Handelnde Darstellungen sind App-Code wie die Generatoren (I-1): ein fester Satz von Werkzeugen mit Parametern, zum Beispiel:

- Bruchstreifen und Kreis teilen und färben,
- Zahlenstrahl mit Markierung,
- Rasterpapier für Flächen und Spiegelungen,
- Koordinatensystem mit Punkten und Geraden,
- Waage für Gleichungen,
- später Funktionsgraph mit Schiebereglern.

Jedes Werkzeug hat eine gleichwertige Bedienung ohne Ziehen (Tastatur, Knöpfe) und eine Beschreibung für Screenreader.

### 2.4 Zustand „vermittelt“

- Eine Kompetenz, deren Sequenz bis zum `uebergang` durchlaufen ist, gilt als **vermittelt**. Das ist ein neuer Zustand vor „geübt“ und „gekonnt“ (LEHRPLAN L-5 wird ergänzt).
- Wer eine Kompetenz zum ersten Mal wählt, bekommt die Vermittlung angeboten, nicht erzwungen. Wer sie in der Diagnose schon kann, überspringt sie.
- Die Sequenz lässt sich jederzeit wieder ansehen. Es gibt auch eine **Kurzfassung**: nur Merksätze und Beispiele, zum Auffrischen.
- Die Schritte erzeugen Lernereignisse mit Schemaversion (D-Regeln), damit die Diagnose weiß, welche Fehlvorstellung schon in der Vermittlung aufgefallen ist.

### 2.5 Qualitätskriterien je Sequenz (Prüfliste für das Review)

- **V1** Das Ziel ist in einem Satz klar.
- **V2** Die Voraussetzungen werden geprüft, und bei einer Lücke gibt es einen Rückweg.
- **V3** Jede Grundvorstellung hat mindestens ein Bild oder ein Werkzeug, nicht nur Text.
- **V4** Es gibt mindestens ein vorgerechnetes und ein selbst zu ergänzendes Beispiel.
- **V5** Mindestens ein Gegenbeispiel stammt aus dem Fehlerkatalog der Kompetenz.
- **V6** Jede `pruefen`-Frage hat diagnostische Falschantworten, jeweils mit Fehlvorstellung und Abzweig.
- **V7** Jeder Weg endet im Üben; die Sequenz dauert höchstens etwa 15 Minuten.
- **V8** Einfache Sprache: höchstens etwa 40 Wörter je Bildschirm; Fachbegriffe sind erklärt.
- **V9** Fachlich geprüft, mit Bezug zum sächsischen Lehrplan (K-16).
- **V10** Für die Musterkompetenzen zusätzlich: Mit drei Lernenden ausprobiert, die das Thema noch nicht kannten (`TESTS.md`).

## 3. Fehlerkataloge

### 3.1 Fehlvorstellung statt nur Fehlerbild

Bisher hat jede Vorlage **Fehlerbilder** (I-7): Der Generator erkennt eine bestimmte falsche Antwort, und die Vorlage hat einen Satz dazu. Es gibt 596 Fehlerbilder in 255 Vorlagen. Das bleibt die **Erkennung**.

Neu kommt darüber der **Fehlerkatalog**: eine Liste von **Fehlvorstellungen**. Jede hat eine stabile, fachweite ID (zum Beispiel `FV.BR.ADDIERT`), weil dieselbe Fehlvorstellung in vielen Kompetenzen auftaucht (Brüche addieren, erweitern, vergleichen). Jedes Fehlerbild einer Vorlage verweist auf genau eine Fehlvorstellung.

### 3.2 Aufbau eines Eintrags

```yaml
id: FV.BR.ADDIERT
name: { de: Rechnet bei Brüchen mit Addition statt Multiplikation }
art: falsche-regel        # falsche-grundvorstellung | falsche-regel | uebergeneralisiert |
                          # verwechslung | lesefehler | rechenfehler
beschreibung:             # für Prüfende: woran man sie erkennt, warum sie entsteht
  de: Überträgt das Rechnen mit natürlichen Zahlen auf Zähler und Nenner ...
kompetenzen: [M.ZO.BR.ERWEITERN, M.ZO.BR.ADD-SUB, M.ZO.BR.VERGLEICHEN]
erklaerung:
  kurz: { de: Beim Erweitern wird multipliziert – Zähler und Nenner mit derselben Zahl. }
  lang:                   # Schritte wie in der Vermittlung, mit Bild
    - { typ: so-denkst-du, de: "Du hast zu Zähler und Nenner dieselbe Zahl addiert: 2/3 → 3/4." }
    - { typ: warum-nicht, de: "...", bild: bruchstreifen-vergleich }
    - { typ: so-stimmt-es, de: "..." }
gegenbeispiel: { de: "1/2 → 2/3? Ein halber Kuchen ist nicht dasselbe wie zwei Drittel." }
rueckweg:
  vermittlung: M.ZO.BR.ERWEITERN#erklaeren-multiplizieren
  voraussetzung: M.ZO.BR.BEGRIFF          # nur wenn die Grundvorstellung fehlt
kontrast:                 # Aufgaben, bei denen genau diese Vorstellung sicher scheitert
  - M.ZO.BR.ERWEITERN.ZIELNENNER
quelle: { de: Fachdidaktik Bruchrechnung; eigene Unterrichtserfahrung }
herkunft: ki-entwurf
version: 1
```

### 3.3 Diagnose nach festen Regeln

Je Fehlvorstellung führt Bastion eine Zählung aus den gespeicherten Aufgaben-Ereignissen (sie enthalten das Fehlerbild schon). Die Zählung ist eine Projektion, es braucht kein neues Speicherformat dafür:

| Zustand | Regel | Reaktion der App |
|---|---|---|
| **aufgefallen** | einmal erkannt | kurze Erklärung in der Rückmeldung |
| **vermutet** | zweimal in verschiedenen Aufgaben innerhalb der letzten 10 Aufgaben dieser Fehlvorstellung | lange Erklärung („So denkst du gerade – warum es nicht stimmt – so stimmt es“) und Angebot: „Zurück zur Erklärung?“ (Rückweg) |
| **in Arbeit** | nach Erklärung oder Rückweg | als Nächstes zwei Kontrastaufgaben |
| **aufgelöst** | beide Kontrastaufgaben richtig, ohne erneutes Auftreten | in der Fehlerwerkstatt als erledigt; bleibt in der Wiederholung |
| **wieder da** | nach „aufgelöst“ erneut erkannt | wie „vermutet“, aber mit Rückweg zur Voraussetzung, falls es eine gibt |

- Die Schwellen sind Startwerte und werden mit Lernenden geprüft.
- Die Fehlerwerkstatt gruppiert künftig nach Fehlvorstellung statt nach Fehlerbild.
- Der bisherige Rückweg (drei Fehler in Folge → Voraussetzung, LEHRPLAN §7) bleibt für Fehler ohne erkannte Fehlvorstellung.

### 3.4 Unbekannte Fehler

Falsche Antworten ohne Fehlerbild bekommen weiter die allgemeine Rückmeldung und den Lösungsweg. Sie bleiben in der Fehlerwerkstatt. Lernende können sie freiwillig als Datei exportieren („Fehler, die Bastion nicht erklären konnte“), zum Beispiel für die Testrunden. Die Datei enthält nur Aufgabe und Antwort, nichts Persönliches. So wächst der Katalog aus echten Fehlern, ohne Telemetrie.

### 3.5 Qualitätskriterien je Fehlerkatalog

- **F1** Jede Kompetenz hat mindestens drei Fehlvorstellungen, oder eine Begründung, warum es weniger gibt.
- **F2** Jedes Fehlerbild jeder Vorlage verweist auf eine Fehlvorstellung.
- **F3** Jede Fehlvorstellung hat eine kurze und eine lange Erklärung, ein Gegenbeispiel, einen Rückweg und mindestens eine Kontrastaufgabe.
- **F4** Die lange Erklärung benennt die falsche Denkweise wertschätzend („Das ist eine naheliegende Idee, weil …“) und widerlegt sie mit einem Bild oder Gegenbeispiel, nicht nur mit der Regel.
- **F5** Die häufigsten falschen Antworten aus den Testrunden sind abgedeckt (Ziel: 80 % aller falschen Antworten haben ein Fehlerbild).

## 4. Der Kreis im Überblick

1. **Neu:** Die Kompetenz wird empfohlen (Graph) oder gewählt.
2. **Vermitteln:** Erstvermittlung; Verständnisfragen erkennen Fehlvorstellungen und verzweigen.
3. **Erste Übung:** `uebergang` mit leichten Aufgaben.
4. **Üben:** Generatoren; Fehlerbilder → Fehlvorstellungen → Erklärung, Rückweg, Kontrastaufgaben.
5. **Festigen:** Wiederholung nach FSRS; Fehlerwerkstatt nach Ursachen.
6. **Steuern & Bewerten:** Lernpfad, Diagnose, Leistungsnachweise (§6).

## 5. Was sich an Daten und Format ändert (Vorschau)

- Neue Inhaltsdateien je Kompetenz: `vermittlung.yaml`. Neu je Fach: Fehlerkatalog unter `content/mathematik/fehler/`.
- Vorlagen: Jedes Fehlerbild bekommt `fv: <ID>`. Bestehende Texte werden zur kurzen Erklärung oder bleiben aufgabenbezogen.
- Neue Lernereignisse für Vermittlungs-Schritte (mit Schemaversion und Migrationstest, CLAUDE.md). Die Diagnose der Fehlvorstellungen braucht kein neues Ereignis.
- Neuer Kompetenzzustand „vermittelt“.
- Alles kommt mit dem Pilot genau in `INHALTSFORMAT.md` und `DATENMODELL.md`.

## 6. Prüfungen auf Knopfdruck (K-25) – Anforderungen

Das gehört zur Kernaufgabe 4 und kommt nach Vermitteln und Diagnose. Damit es später trägt, gilt schon jetzt:

- **Aufbau wie die echte Prüfung:** Teile, Hilfsmittel, Anforderungsbereiche I–III, Bewertungseinheiten und Operatoren nach den sächsischen Vorgaben. Grundlage sind die veröffentlichten Vorgaben und Prüfungen. Es wird nichts Geschütztes kopiert.
- **Neue Aufgaben bei jedem Druck:** Die Aufgaben kommen aus den Generatoren und handverfassten Vorlagen mit Parametern. Offene Aufgaben (Begründen, Beweisen, Modellieren) brauchen Vorlagen mit **Erwartungshorizont** und Bewertungshinweisen.
- **Nachvollziehbar und geheim zugleich:** Jede Prüfung trägt einen Prüfungscode, aus dem sie sich genau wieder erzeugen lässt. Der Zufall dafür kommt aus einem großen Zahlenraum (mindestens 64 Bit, sicherer Zufall des Geräts). So lässt sich eine echte Prüfung nicht erraten, obwohl die App öffentlich ist.
- **Gleiche Funktion für alle:** Ministerium, Lehrkraft und Schülerin nutzen dieselbe Funktion (VISION §6).
- **Druck ohne Netz:** Aufgabenblatt, Lösungsblatt und Bewertungshinweise getrennt, mit sauberem Formelsatz. Die Technik (Druckansicht des Browsers oder eigene PDF-Erzeugung, Formelsatz) ist **noch offen**. Eine neue Laufzeitabhängigkeit braucht einen Eintrag in ARCHITEKTUR (CLAUDE.md).
- **Noten nur auf Wunsch** (K-26): Punkte und Bewertungshinweise immer. Eine Note nach sächsischem Schlüssel nur, wenn sie eingeschaltet ist.
- **Zeit:** Die Bearbeitungszeit steht auf dem Blatt. In der App gibt es höchstens eine freiwillige Uhr, ohne Folgen (R2-Ausnahme, VISION §9).

Dafür nötig und bisher Nicht-Ziel: Niveau E (Leistungskurs), Operatoren-Training, Klasse 11/12 vollständig. `PLAN.md` §2.1 wird angepasst.

## 7. Vorgehen

Reihenfolge nach K-28 (zuerst Klasse 5–8 nachrüsten):

1. **Format festlegen** für Sequenz und Fehlerkatalog, in `INHALTSFORMAT.md`. Dazu ein Prüfwerkzeug für Wege, Ziele und Verweise.
2. **Musterfeld Brüche** (Zielgruppe „Lücken bei Brüchen“, VISION §11): Erstvermittlung und Fehlerkatalog für drei Kompetenzen, Vorschlag `M.ZO.BR.BEGRIFF`, `M.ZO.BR.ERWEITERN`, `M.ZO.BR.ADD-SUB`. Dazu die Werkzeuge Bruchstreifen und Zahlenstrahl.
3. **Abspieler in der App:** Sequenz zeigen, verzweigen, Ereignisse speichern; Diagnose der Fehlvorstellungen; Fehlerwerkstatt nach Ursachen.
4. **Test mit den drei Testerinnen** (`TESTS.md` §2): Verstehen sie das Thema nur mit der Vermittlung? Treffen die Erklärungen?
5. **Ausrollen** Feld für Feld über alle 123 Kompetenzen der Klassen 5–8. Jedes Feld ist ein PR mit Review-Liste.
6. Dann **Klasse 9 bis 12** gleich im neuen Format, mit Niveau E. Dann die **Prüfungen** (§6).

**Ehrliche Einschätzung des Aufwands:** 123 Sequenzen und Kataloge für Klasse 5–8 und etwa 100 weitere für Klasse 9–12 sind sehr viel Inhalt für eine Person. Entwürfe kann Claude schnell schreiben. Der Engpass ist die menschliche Prüfung. Für das Abitur 2029 muss die Prüfung deshalb früh planbar werden, am besten mit einer Lehrkraft, die regelmäßig Felder abnimmt.

## 8. Offene Fragen an den Projektverantwortlichen

1. **Musterkompetenzen:** passen Bruchbegriff, Erweitern/Kürzen und Addieren/Subtrahieren?
2. **Fachliche Prüfung:** Gibt es eine Lehrkraft, die Sequenzen und Kataloge abnimmt? In welchem Takt?
3. **Abitur-Vorgaben:** Die sächsischen Vorgaben und Prüfungen der letzten Jahrgänge (GK und LK) werden als Quellen gebraucht (`docs/quellen/`).
4. **Druck und PDF:** Reicht die Druckansicht des Browsers („Als PDF speichern“), oder soll Bastion die PDF selbst erzeugen (neue Abhängigkeit)?
5. **Werkzeuge:** Welche handelnden Darstellungen sind dir am wichtigsten?
