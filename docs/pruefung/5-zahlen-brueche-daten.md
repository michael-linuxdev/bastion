# Prüfung Klasse 5, Zahlen, Brüche, Daten (Q-L1, Phase C)

Fundliste nach `INHALTSFORMAT.md` §8 (Prüfkatalog Fragen 1 bis 6) und dem Zusatzpunkt 7 aus dem Rundgang des Strangs Oberfläche: „Steht die Antwort schon im Text davor, in der Bildbeschreibung oder in der Statuszeile?“ Keine Teilnehmerdaten, nur Inhalte.

Geprüft werden die 53 Dateien der sieben Kompetenzen M.ZO.NZ.ORDNEN, M.ZO.BR.VERGLEICHEN, M.ZO.BR.ZAHLENSTRAHL, M.ZO.BR.ANTEIL-VON, M.ZO.BR.DEZ-ORDNEN, M.ZO.BR.PROZENT, M.DZ.DA.MITTELWERT: je `kompetenz.yaml`, `vermittlung.yaml` und alle Vorlagen (34 Dateien; Zeichen-Anleitungen gibt es in diesen Ordnern keine) sowie die 19 Fehlvorstellungen, auf die sie zeigen. Die Erstvermittlungen sind die neuen Fassungen aus Q-L2 (#297, mit Bild oder Werkzeug).

Ablauf wie bei Raum und Form: zwei unabhängige Durchgänge in frischen Sitzungen. Funde werden in eigenen PRs behoben, dann folgt der zweite Durchgang. Dateien, die in beiden Durchgängen ohne Fund bleiben, bekommen Stufe 1 (`pnpm review setzen --stufe 1 --pruefer maschine`).

## Durchgang 1 (06.11.2026)

Gegenstand: die 53 Dateien oben, Stand `origin/main` nach #297. Prüfer: Maschine (frische Sitzung ohne den Entwurf im Verlauf, entlang des Graphen: NZ.ORDNEN, BR.VERGLEICHEN, BR.ZAHLENSTRAHL, BR.ANTEIL-VON, BR.DEZ-ORDNEN, BR.PROZENT, DA.MITTELWERT). Grundlage: die Dateien selbst, der Prüfbogen (`pnpm pruefbogen` mit je 20 Aufgaben je Vorlage und Niveau), die Generatoren und die Bildbeschreibungen der Werkzeuge; die Gitter-Bilder der Erstvermittlungen wurden mit `gitterBild` gerendert und angesehen. Was `pnpm test` und `pnpm fehlerschueler` sichern, ist nicht wiederholt.

Teil-Liste der geprüften Dateien (Pfade relativ zu `content/mathematik/`):

- `zahl-und-operation/natuerliche-zahlen/M.ZO.NZ.ORDNEN/`: kompetenz, vermittlung, vorlagen der-groesse-nach, vergleichszeichen
- `zahl-und-operation/brueche-und-dezimalzahlen/M.ZO.BR.VERGLEICHEN/`: kompetenz, vermittlung, vorlagen begruenden, groesster, zeichen
- `…/M.ZO.BR.ZAHLENSTRAHL/`: kompetenz, vermittlung, vorlagen begruenden, bruch, dezimal
- `…/M.ZO.BR.ANTEIL-VON/`: kompetenz, vermittlung, vorlagen allgemein, begruenden, stammbruch
- `…/M.ZO.BR.DEZ-ORDNEN/`: kompetenz, vermittlung, vorlagen begruenden, runden, vergleichen
- `…/M.ZO.BR.PROZENT/`: kompetenz, vermittlung, vorlagen begruenden, dezimal-zu-prozent, prozent-zu-bruch
- `daten-und-zufall/daten/M.DZ.DA.MITTELWERT/`: kompetenz, vermittlung, vorlagen begruenden, noten, zahlen
- `fehlvorstellungen/`: FV.NZ.ERSTE-ZIFFER, FV.NZ.ZEICHEN-VERDREHT, FV.NZ.REIHENFOLGE-UMGEKEHRT, FV.NZ.RUNDEN-ABGESCHNITTEN, FV.NZ.RUNDEN-STELLE, FV.BR.TEIL-ZU-REST, FV.BR.NENNER-GROESSER, FV.BR.NUR-NENNER, FV.BR.NUR-ZAEHLER, FV.BR.STRICHE-GEZAEHLT, FV.BR.ANZAHL-STATT-ANTEIL, FV.BR.VERTAUSCHT, FV.BR.ANTEIL-EIN-SCHRITT, FV.BR.STELLENWERT-DEZIMAL, FV.BR.LAENGER-GROESSER, FV.BR.PROZENT-HUNDERTSTEL, FV.SA.ZWISCHENERGEBNIS, FV.SA.ANGABE-UEBERSEHEN, FV.DA.MITTELWERT-ANZAHL

Status: **behoben** (im PR „Q-L1: Funde Zahlen, Brüche, Daten“), **Entscheidung** (bewusst so gelassen, Begründung), **offen** (Hinweis ohne Fund, für eine spätere Runde). Keine Stufe gesetzt, das folgt nach Durchgang 2.

### Funde

| Datei | Stelle | Frage | Fund | Vorschlag | Status |
|---|---|---|---|---|---|
| M.ZO.NZ.ORDNEN/vermittlung.yaml | Schritt `ergaenzen`, Fehler 1090 → FV.NZ.ERSTE-ZIFFER | 3, 2 | „Welche Zahl ist kleiner: 1 090 oder 1 009?“ Beide Zahlen haben vier Stellen und dieselbe erste Ziffer. Wer 1 090 wählt, hat nicht nach der ersten Ziffer verglichen (eher von rechts oder die Null übersehen). Die Fehlvorstellung sagt „Zähle zuerst die Stellen … mehr Stellen ist größer“ und „Bei gleich langen Zahlen klappt das“, das widerspricht dem Fall direkt. | Zahlenpaar mit verschieden vielen Stellen und größerer erster Ziffer bei der kürzeren Zahl (etwa 980 oder 1 009), oder den Fehler 1090 ohne `fv` lassen bzw. auf eine passende Fehlvorstellung (Stellenwert) zeigen lassen. | behoben: Frage „Welche Zahl ist kleiner: 987 oder 1 009?“ (Lösung 987); wer 1 009 nimmt, hat nach der ersten Ziffer verglichen, das passt zu FV.NZ.ERSTE-ZIFFER. |
| M.ZO.BR.ZAHLENSTRAHL/vermittlung.yaml; für `vorwissen` auch M.ZO.BR.VERGLEICHEN/vermittlung.yaml, M.ZO.BR.ANTEIL-VON/vermittlung.yaml | Schritte `ergaenzen`, `pruefen` (auch `gegenbeispiel`), `vorwissen` | 7 | Das Bild `zahlenstrahl@1` hat als Beschreibung „Zahlenstrahl von 0 bis 1, Markiert: 5/6“ bzw. „Markiert: 4/10“. Das ist die gesuchte Antwort; ein Bildschirmleser liest sie vor. Gleiches gilt für `vorwissen` mit `bruchstreifen@1` („3 von 5 Teilen gefärbt“, auch in BR.VERGLEICHEN und BR.ANTEIL-VON). | Für Frageschritte eine Beschreibung ohne Ergebnis, z. B. Parameter `frage: true` wie bei `geraden@1`/`winkel@1`: „7 Striche von 0 bis 1, Markierung am 6. Strich“. Sonst Entscheidung wie bei M.RF.GF.KOORDINATEN begründen. | behoben (Zahlenstrahl): neuer Parameter `frage: true` für `zahlenstrahl@1`; die Beschreibung nennt dann nur die Striche („Zahlenstrahl von 0 bis 1 mit 7 Strichen. Die Markierung steht am 5. Strich nach der 0.“), gesetzt in `entdecken`, `ergaenzen`, `gegenbeispiel`, `pruefen`. Entscheidung (Bruchstreifen in `vorwissen`, auch BR.VERGLEICHEN, BR.ANTEIL-VON): „3 von 5 Teilen gefärbt“ ist der Zustand des Bilds; ein Bildschirmleser hat sonst keinen Zugang, die Schreibweise als Bruch bleibt die Aufgabe (wie M.RF.GF.KOORDINATEN). Bleibt so. |
| M.ZO.BR.ZAHLENSTRAHL/vorlagen/bruch.yaml, dezimal.yaml | Bild des Generators `br.zahlenstrahl-ablesen@1` | 7 | Die Beschreibung lautet „Jede Einheit ist in n gleiche Abschnitte geteilt. Die Markierung steht am k. Teilstrich nach der 0.“ Damit sind Nenner und Zähler genannt, und gerade der geprüfte Schritt (Abschnitte statt Striche zählen) ist vorweggenommen. | Beschreibung nur mit Strichen: „Von 0 bis 1 gibt es n + 1 Striche, die Markierung ist der k. Strich nach der 0.“ Dann muss auch ein Kind mit Bildschirmleser die Abschnitte selbst bestimmen. | behoben: Beschreibung nennt nur Striche („Von der 0 bis zur 1 stehen n + 1 Striche, die 0 und die 1 mitgezählt. Die Markierung steht am k. Strich nach der 0.“), Test. |
| M.ZO.BR.ZAHLENSTRAHL/vorlagen/dezimal.yaml | Fehlerbild `striche-statt-abstaende` | 2 | Der Generator setzt den Wert k/(n+1), also 0,454545 statt 0,5, 0,818182 statt 0,9 usw. Diese Zahl tippt kein Kind, das Striche zählt; das Fehlerbild erscheint praktisch nie. Die Erstvermittlung (`pruefen`) nimmt für denselben Fehler 0,5 statt 0,4, also einen Strich zu viel. | Fehlerbild-Wert (k + 1)/10 (einen Strich zu viel gezählt), wie in der Erstvermittlung; Test anpassen. | behoben: Fehlerbild-Wert bei Dezimalzahlen (k + 1)/10, ein Strich zu viel wie in der Erstvermittlung; beim Bruch bleibt k/(n + 1). Test. |
| M.ZO.BR.ZAHLENSTRAHL/vorlagen/begruenden.yaml | Fehlerbild `anzahl-statt-anteil` | 6, 3 | „Die Marke zeigt einen [[Anteil]] von 1, nicht die Zahl der Striche.“ „Einen Anteil von 1“ liest ein Kind leicht als „den Wert 1“. Gemeint ist „einen Teil des Ganzen“. | „Die Marke zeigt einen Teil der Strecke von 0 bis 1, keine Anzahl. Zähle die Abschnitte bis 1 für den Nenner.“ | behoben: „Die Marke zeigt einen Teil der Strecke von 0 bis 1, keine Anzahl. Die Abschnitte bis 1 ergeben den [[Nenner]].“ |
| M.ZO.BR.ANTEIL-VON/vermittlung.yaml | Bilder in `erklaeren-anteil-von` und `beispiel` | 4 | Der Text trennt „drei Viertel“ (gefärbte Kästchen) vom übrigen Viertel bzw. „zwei Fünftel“ von den übrigen drei. Im Bild sind die übrigen Säulen als `figuren` gezeichnet, und `gitter@1` füllt Figuren grau (Deckkraft 0,25 gegen 0,35 bei Kästchen). Gerendert sehen alle vier bzw. fünf Säulen fast gleich grau aus; man sieht nicht, welcher Teil gemeint ist. | Übrige Säulen ungefüllt zeichnen (z. B. gestrichelte Bildfigur `bild: true` oder neuer Parameter für ungefüllte Figuren) oder nur die genommenen Teile als Kästchen und den Rest als Umriss. | behoben: neuer Parameter `leer: true` für Figuren in `gitter@1` (nur Umriss, „Leerer Umriss“ in der Beschreibung); die übrigen Säulen in beiden Bildern sind jetzt leer. |
| M.ZO.BR.ANTEIL-VON/vorlagen/begruenden.yaml | Hilfe 2 | 5, 6 | „Ein Teil ist erst 1/n.“ Die Variable n kennt ein Kind in Klasse 5 nicht; die Hilfe sagt nicht, welcher Teil gemeint ist. | „Durch den [[Nenner]] teilen ergibt erst ein Teil, etwa ein Siebtel.“ | behoben: „Durch den [[Nenner]] teilen ergibt erst einen Teil, etwa ein Siebtel. Wie viele Teile sagt der [[Zähler]]?“ |
| M.ZO.BR.DEZ-ORDNEN/vorlagen/runden.yaml | Fehlerbild `falsche-stelle` | 2, 3 | Hat die Zahl genau eine Stelle mehr als verlangt, ist der Fehlerbild-Wert die unveränderte Zahl (G: „Runde 18,2 auf Ganze“ → 18,2; „0,62 auf Zehntel“ → 0,62; in 20 Aufgaben je Niveau 8- bis 9-mal). Wer die Zahl abschreibt, hat nicht „auf eine andere Stelle gerundet“; die Fehlvorstellung („Du hast richtig gerundet, aber auf eine andere Stelle“) passt nicht. | Fehlerbild nur setzen, wenn der Wert sich von der Ausgangszahl unterscheidet (sonst etwa auf die nächstgröbere Stelle runden); für „unverändert abgeschrieben“ eigenes Fehlerbild oder keines. | behoben: `br.dezimal-runden@2` setzt „falsche Stelle“ nur, wenn der Wert nicht die Ausgangszahl ist; sonst auf die gröbere Stelle gerundet (bei „auf Ganze“ dann keins). Test. |
| M.ZO.BR.DEZ-ORDNEN/vorlagen/runden.yaml | Lösung bei „auf Hundertstel“ (Niveau M) | 4 | „Runde 907,704 auf Hundertstel“ zeigt als Lösung 907,7, ebenso 329,101 → 329,1. Auf Hundertstel gerundet schreibt man 907,70; die Endnull zeigt die Genauigkeit. Lösung und Lösungsweg lehren hier die falsche Schreibweise (FV.NZ.RUNDEN-STELLE sagt selbst „rechts von ihr stehen nur noch Nullen“). | Lösung mit fester Stellenzahl anzeigen (907,70) und 907,7 wie 907,70 werten, oder Zahlen ziehen, bei denen die Rundungsstelle keine 0 wird. | behoben: `br.dezimal-runden@2` zieht nur Zahlen, deren Ergebnis an der Rundungsstelle keine 0 hat (sonst eine Einheit daneben, die Stellen dahinter bleiben). Fassung 1 bleibt für gespeicherte Aufgaben. Test. |
| M.ZO.BR.PROZENT/vorlagen/prozent-zu-bruch.yaml | Aufgabe „100 % als vollständig gekürzten Bruch“ (G und M) | 1, 4 | Lösung ist $\frac{1}{1}$. Ein sicheres Kind schreibt 1 oder $\frac{100}{100}$; „1/1 als gekürzter Bruch“ ist unüblich, und die Form ist nicht eindeutig. 100 % kommt in rund einem Viertel der G-Aufgaben vor. | 100 % aus der Liste dieser Vorlage nehmen (bleibt in DEZIMAL-ZU-PROZENT) oder 1 als Lösung annehmen und die Aufgabe „als Bruch oder ganze Zahl“ stellen. | behoben: 100 % aus dieser Vorlage genommen (G und M); bleibt in DEZIMAL-ZU-PROZENT und in der Erstvermittlung. |
| M.ZO.BR.PROZENT/vermittlung.yaml | Schritt `entdecken`, Fehler 5 → FV.BR.PROZENT-HUNDERTSTEL | 3 | Gefragt ist „Wie viele Hundertstel sind gefärbt?“, Prozent ist noch nicht eingeführt. Wer 5 antwortet, hat Reihen (Zehntel) gezählt. Die Fehlvorstellung sagt „Du hast Prozent nicht als Hundertstel umgewandelt“, das passt nicht. | Auf FV.BR.STELLENWERT-DEZIMAL zeigen (Zehntel und Hundertstel verwechselt) oder Fehler ohne `fv`. | behoben: Fehler 5 zeigt auf FV.BR.STELLENWERT-DEZIMAL (Zehntel und Hundertstel verwechselt), Voraussetzung M.ZO.BR.DEZIMAL. |
| M.DZ.DA.MITTELWERT/vorlagen/zahlen.yaml | Niveau M, Lösung | 1 | Ohne Rundungsangabe entstehen periodische Ergebnisse: 115,666667; 73,166667; 118,833333; 115,833333 (4 von 20 Aufgaben). Die Auswertung vergleicht exakt, ein Kind müsste genau 115,666667 tippen. Der Lösungsweg zeigt 115,667. | Wie bei NOTEN „runde auf eine Nachkommastelle“ (oder zwei) in den Text und die Lösung runden, oder nur Werte ziehen, deren Durchschnitt höchstens zwei Nachkommastellen hat. | behoben: `da.mittelwert@2` rundet ohne Noten auf zwei Nachkommastellen, die Vorlage sagt „Geht es nicht auf, runde auf zwei Stellen nach dem Komma.“; Lösungsweg mit Rundungszeile; Fehlerbild `nicht-gerundet` auch hier. Fassung 1 bleibt. Test. |
| M.DZ.DA.MITTELWERT/vorlagen/noten.yaml | Fehlerbild `nicht-gerundet` → FV.SA.ANGABE-UEBERSEHEN | 3 | Die kurze Erklärung der Fehlvorstellung lautet „Eine Angabe fehlt in deiner Rechnung. Lies den Text noch einmal und unterstreiche jede Zahl.“ Wer 2,67 statt 2,7 eingibt, hat alle Zahlen benutzt und nur nicht gerundet. Erklärung und Fehlerbild widersprechen sich. | Andere Fehlvorstellung (Rundungsauftrag übersehen, z. B. FV.NZ.RUNDEN-STELLE: „auf eine andere Stelle gerundet“) oder Fehlerbild ohne `fv`. | behoben: `nicht-gerundet` zeigt auf FV.NZ.RUNDEN-STELLE (auf Hundertstel statt Zehntel gerundet); die Fehlvorstellung nennt M.DZ.DA.MITTELWERT und führt dort zu `beispiel`, das jetzt ein Beispiel mit Runden hat (8 : 3 ≈ 2,7). FV.SA.ANGABE-UEBERSEHEN nennt MITTELWERT nicht mehr. |

### Hinweise ohne Fund (Durchgang 1)

| Datei | Stelle | Hinweis | Status |
|---|---|---|---|
| M.ZO.NZ.ORDNEN/kompetenz.yaml | `kann_satz`, Niveaus G und M | verspricht Ablesen und Eintragen am Zahlenstrahl; keine Vorlage tut das (nur Vergleichszeichen und Ordnen). | offen, Lücke für den PV |
| fehlvorstellungen/FV.NZ.REIHENFOLGE-UMGEKEHRT.yaml | `rueckweg` | führt zu NZ.ORDNEN Schritt 4 (Vergleichen); die Erstvermittlung hat keinen Schritt zum Ordnen mehrerer Zahlen oder zur Richtung „kleinste zuerst“. | offen |
| M.ZO.NZ.ORDNEN/vermittlung.yaml, M.ZO.BR.DEZ-ORDNEN/vermittlung.yaml | `pruefen` | Zwei Optionen (< und >); die falsche zeigt auf ZEICHEN-VERDREHT bzw. LAENGER-GROESSER, kann aber ebenso vom anderen Fehler kommen. | offen |
| M.ZO.NZ.ORDNEN/vorlagen/vergleichszeichen.yaml | Fehlerbild `zeichen-verdreht` | wird bei gleich langen Zahlen auch gesetzt, wenn das Kind falsch verglichen hat; die Rückmeldung selbst stimmt. | offen |
| M.ZO.BR.VERGLEICHEN/vorlagen/groesster.yaml | Niveau G | verlangt oft ungleichnamige Vergleiche ohne Halbes-Strategie (2/3 gegen 3/4, 4/5 gegen 2/3); die Kompetenz nennt für G nur gleichnamig, gleicher Zähler, Halbes. | offen |
| M.ZO.BR.VERGLEICHEN/vorlagen/zeichen.yaml | Fehlerbild `nur-zaehler-verglichen` bei gleichem Zähler | Rat „bringe auf denselben Nenner“ ist bei gleichem Zähler ein Umweg; nicht falsch. | offen |
| M.ZO.BR.ZAHLENSTRAHL/kompetenz.yaml | Niveau M | „Eintragen“ und „Einteilungen, die nicht zum Nenner passen“ kommen in keiner Vorlage vor. | offen, Lücke für den PV |
| M.ZO.BR.ANTEIL-VON/kompetenz.yaml | Niveau G | nennt nur Stammbrüche; Erstvermittlung (G) und `allgemein` (G) nutzen 3/4, 5/6. | offen |
| M.ZO.BR.ANTEIL-VON/vorlagen/allgemein.yaml, stammbruch.yaml | Einheit „Schüler“ | „von 36 Schüler“ statt „Schülern“ (Dativ). | offen |
| M.ZO.BR.DEZ-ORDNEN/kompetenz.yaml | Niveau G | „gleich viele Nachkommastellen“ und „auf Zehntel runden“; `vergleichen` (G) hat immer verschieden viele Stellen, `runden` (G) auch „auf Ganze“. | offen |
| M.ZO.BR.DEZ-ORDNEN/vermittlung.yaml | Bilder `erklaeren-vergleichen`, `beispiel`, `erklaeren-runden` | Beschreibung nennt die Markierung als Bruch („Markiert: 9/20“, „23/10“, „35/10“), der Text spricht von 0,45, 2,3, 3,5; ebenso FV.NZ.RUNDEN-ABGESCHNITTEN. Für Dezimalzahlen fehlt `zahlenstrahl@1` die Dezimalschreibweise (Rückfrage aus Q-L2). | offen |
| M.ZO.BR.PROZENT/kompetenz.yaml | Niveau G | nennt 50 %, 25 %, 100 %; die G-Vorlagen nehmen auch 10 % und 75 %. | offen |
| M.ZO.BR.PROZENT/vorlagen/prozent-zu-bruch.yaml | 25 %, 75 % | Für 25/10 (Fehler aus der Erstvermittlung, `pruefen`) und 75/10 entsteht kein Fehlerbild; nur bei 10, 20, 50 %. | offen |
| M.ZO.BR.PROZENT/vorlagen/dezimal-zu-prozent.yaml | Eingabe | Antwort als Zahl ohne %-Zeichen; ob „25 %“ angenommen wird, sagt die Aufgabe nicht. | offen |
| fehlvorstellungen/FV.BR.PROZENT-HUNDERTSTEL.yaml | `warum-nicht` | „Das Komma zu verschieben ist der richtige Weg“ passt nicht zum Fehlerbild `prozent-als-nenner-zehn` (30 % → 30/10, kein Komma); die kurze Erklärung passt. | behoben (Satz für Komma und Nenner) |
| M.DZ.DA.MITTELWERT/vorlagen/zahlen.yaml | Fehlerbild `durch-falsche-anzahl`, Niveau G | Wert Summe : (n − 1) oft periodisch (26,666667); ein Kind tippt gerundet, das Fehlerbild greift dann nicht. | behoben (mit Fund 12: auf zwei Nachkommastellen gerundet) |
| M.DZ.DA.MITTELWERT/vorlagen/noten.yaml, kompetenz.yaml | Niveau G | Kompetenz G: Durchschnitt natürlicher Zahlen; NOTEN (G) verlangt Runden auf Zehntel. | offen |
| M.DZ.DA.MITTELWERT/vermittlung.yaml | `vorwissen` | „12 : 4“ prüft Division natürlicher Zahlen, der Rückweg führt zu M.ZO.BR.DEZ-RECHNEN (Dezimalzahlen). | offen |

### Ohne Fund in Durchgang 1

Alle sieben `kompetenz.yaml` (Lücken oben nur als Hinweis); Erstvermittlungen BR.DEZ-ORDNEN, DA.MITTELWERT; NZ.ORDNEN: der-groesse-nach, vergleichszeichen; BR.VERGLEICHEN: begruenden, groesster, zeichen; ANTEIL-VON: allgemein, stammbruch; DEZ-ORDNEN: begruenden, vergleichen; PROZENT: begruenden, dezimal-zu-prozent; MITTELWERT: begruenden; alle 19 Fehlvorstellungen (FV.NZ.ERSTE-ZIFFER, FV.NZ.ZEICHEN-VERDREHT, FV.NZ.REIHENFOLGE-UMGEKEHRT, FV.NZ.RUNDEN-ABGESCHNITTEN, FV.NZ.RUNDEN-STELLE, FV.BR.TEIL-ZU-REST, FV.BR.NENNER-GROESSER, FV.BR.NUR-NENNER, FV.BR.NUR-ZAEHLER, FV.BR.STRICHE-GEZAEHLT, FV.BR.ANZAHL-STATT-ANTEIL, FV.BR.VERTAUSCHT, FV.BR.ANTEIL-EIN-SCHRITT, FV.BR.STELLENWERT-DEZIMAL, FV.BR.LAENGER-GROESSER, FV.BR.PROZENT-HUNDERTSTEL, FV.SA.ZWISCHENERGEBNIS, FV.SA.ANGABE-UEBERSEHEN, FV.DA.MITTELWERT-ANZAHL; die Widersprüche bei ERSTE-ZIFFER, PROZENT-HUNDERTSTEL und ANGABE-UEBERSEHEN liegen in den Dateien, die auf sie zeigen).

Mit Fund: NZ.ORDNEN/vermittlung; BR.VERGLEICHEN/vermittlung; ZAHLENSTRAHL: vermittlung, begruenden, bruch, dezimal; ANTEIL-VON: vermittlung, begruenden; DEZ-ORDNEN: runden; PROZENT: vermittlung, prozent-zu-bruch; MITTELWERT: noten, zahlen.

## Durchgang 2 (06.11.2026)

Gegenstand: dieselben Dateien nach den Behebungen aus Durchgang 1 (Branch `lernkern/q-l1-zahlen-brueche-daten`, Stand `ebc8eeba`), also die 34 Dateien der sieben Kompetenzen und die 18 Fehlvorstellungen, auf die sie jetzt zeigen. FV.SA.ANGABE-UEBERSEHEN gehört nicht mehr dazu (kein Verweis mehr aus diesen Kompetenzen) und wurde nicht geprüft. Prüfer: Maschine, frische Sitzung ohne Entwurf und ohne Durchgang 1 im Verlauf; die Fundliste aus Durchgang 1 erst nach der eigenen Prüfung gelesen. Grundlage: die Dateien, der Prüfbogen (`pnpm pruefbogen` mit je 20 Aufgaben je Vorlage und Niveau), die Generatoren (Quelltext; für `br.anteil-von@1` zusätzlich 1 200 Seeds ausgezählt), die Beschreibungen von `zahlenstrahl@1`, `gitter@1`, `bruchstreifen@1` und die Fachbegriffe (`begriffe.yaml`). Was `pnpm test` und `pnpm fehlerschueler` sichern, ist nicht wiederholt.

Status: **offen** (noch nicht behoben). Keine Stufe gesetzt.

### Funde

| Datei | Stelle | Frage | Fund | Vorschlag | Status |
|---|---|---|---|---|---|
| M.ZO.BR.PROZENT/vorlagen/begruenden.yaml | Generator `br.prozent-aussage@1`, Option `prozent-hundertstel` | 2, 4 | Die falsche Option „Ja. Man schreibt die Ziffern hinter dem Komma und hängt % an.“ erklärt Linas Behauptung nur bei 0,5 → 5 %, 0,1 → 1 %, 0,2 → 2 %. Bei 0,25 → „2,5 %“, 0,75 → „7,5 %“ und 0,01 → „0,1 %“ (3 von 6 Werten, also jede zweite Aufgabe) ergibt genau diese Regel 25 %, 75 % und 1 %, also die richtige Prozentzahl. Die Option widerspricht sich selbst, das Fehlerbild beschreibt einen Gedanken, der nicht zu Linas Zahl führt. | Option je Wert passend formulieren (bei 2,5 %, 7,5 %, 0,1 % etwa „Ja. Man nimmt die Zahl mal 10.“) oder diese drei Werte aus der Liste nehmen; Generator-Version erhöhen. | offen |
| M.ZO.BR.ANTEIL-VON/vorlagen/allgemein.yaml, stammbruch.yaml | Generator `br.anteil-von@1`, Einheit „Schüler“ | 6 | „Berechne $\frac{2}{3}$ von 33 Schüler.“ Nach „von“ steht der Dativ: „von 33 Schülern“. Betrifft 157 von 1 200 gezogenen Aufgaben (rund 13 %, alle Niveaus). In Durchgang 1 als Hinweis geführt; ein grammatisch falscher Aufgabensatz ist aber ein Nein bei Frage 6. | Einheit im Dativ führen („Schülern“) oder ein Wort nehmen, das nach „von“ stimmt; Generator-Version erhöhen. | offen |
| M.DZ.DA.MITTELWERT/vermittlung.yaml | Schritt `vorwissen`, `bei: { sonst: M.ZO.BR.DEZ-RECHNEN }` | 3, 5 | „Was ergibt 12 : 4?“ prüft die Division natürlicher Zahlen. Wer das nicht kann, wird zu „Dezimalzahlen rechnen“ geschickt, wo die fehlende Grundlage nicht erklärt wird (V2). In Durchgang 1 als Hinweis geführt; der Rückweg führt aber zu einem anderen Wissen als dem geprüften. | Vorwissensfrage zur Voraussetzung (etwa „Was ergibt 7,5 : 3?“) oder Rückweg zur Division natürlicher Zahlen (`M.ZO.NZ.DIV` als Voraussetzung ergänzen). | offen |
| fehlvorstellungen/FV.NZ.RUNDEN-STELLE.yaml | `erklaerung.lang`, `warum-nicht` | 4, 6 | „Die Namen der Stellen klingen [[ähnlich]]“ markiert das Alltagswort als Fachbegriff: Antippen zeigt „Zwei Figuren sind ähnlich, wenn die eine eine vergrößerte oder verkleinerte Kopie der anderen ist …“ (Klasse 9). Gleicher Fund wie FV.GF.WINKELPAARE-NAMEN in Raum und Form. Die Datei wurde in Durchgang 1 geändert (MITTELWERT ergänzt). | Markierung entfernen oder umformulieren („klingen fast gleich“). | offen |
| fehlvorstellungen/FV.BR.LAENGER-GROESSER.yaml | `erklaerung.lang`, `so-denkst-du` | 4, 6 | „wie eine [[ganze Zahl]] gelesen“: Der Fachbegriff erklärt „Die natürlichen Zahlen und ihre Gegenzahlen: … −2, −1, 0, 1, 2 …“. Negative Zahlen kommen erst in Klasse 6; gemeint ist eine natürliche Zahl (so steht es im Satz danach). | „wie eine [[natürliche Zahl]] gelesen“. | offen |
| fehlvorstellungen/FV.NZ.ERSTE-ZIFFER.yaml | `erklaerung.lang`, `warum-nicht` | 4 | „Bei gleich langen Zahlen klappt das, darum wirkt es richtig.“ Nur die erste Ziffer zu vergleichen klappt bei gleich langen Zahlen nicht immer: Bei 4 271 und 4 217 (Beispiel der Erstvermittlung) ist die erste Ziffer gleich, ebenso in jeder Aufgabe von `nz.vergleichszeichen` mit gleich langen Zahlen. | „Bei gleich langen Zahlen hilft die erste Ziffer oft, darum wirkt es richtig.“ | offen |
| fehlvorstellungen/FV.BR.NENNER-GROESSER.yaml | `gegenbeispiel` | 4 | „Teilst du eine Pizza mit 8 Freunden statt mit 4, bekommt jeder weniger. $\frac{1}{8}$ ist kleiner als $\frac{1}{4}$.“ Wer mit 8 Freunden teilt, teilt durch 9; die Brüche passen nicht zur Geschichte. | „Teilt man eine Pizza unter 8 statt unter 4 Kindern auf …“ | offen |

### Hinweise ohne Fund (Durchgang 2)

| Datei | Stelle | Hinweis | Status |
|---|---|---|---|
| M.ZO.BR.VERGLEICHEN/vermittlung.yaml | `pruefen` | Gefragt ist der größte von $\frac{2}{3}$, $\frac{3}{8}$, $\frac{1}{9}$; `erklaeren-ungleichnamig` hat genau $\frac{3}{8}$ und $\frac{2}{3}$ schon mit dem Halben verglichen (wie der Hinweis zu SYMMETRIE `pruefen` in Raum und Form). | offen |
| M.ZO.BR.PROZENT/vermittlung.yaml | `pruefen` | „Welcher Bruch ist 25 %?“ steht wörtlich im `merksatz` direkt davor („25 % = $\frac{1}{4}$“). | offen |
| M.ZO.NZ.ORDNEN/vermittlung.yaml | `entdecken` | Zwei Fragen („Liegt die 12 links oder rechts davon? Welche Zahl ist größer?“), aber ein Zahlenfeld; die erste lässt sich nicht eintippen. | offen |
| M.DZ.DA.MITTELWERT/vermittlung.yaml | `erklaeren-mittelwert` | „dieser gerechte [[Anteil]]“: Der Fachbegriff erklärt „Ein Teil von einem Ganzen, zum Beispiel 3/4 einer Pizza“, gemeint ist die Menge je Kind (5 Bonbons). Nicht falsch, aber zwei Bedeutungen. | offen |
| M.ZO.BR.DEZ-ORDNEN/vorlagen/vergleichen.yaml | Fehlerbild `mehr-stellen-groesser` | Bei Paaren wie 0,5 und 0,05 (rund 1 % der Aufgaben) ist der Fehlerbild-Wert „=“; die Rückmeldung („Mehr Nachkommastellen machen eine Zahl nicht größer“) passt dazu nur halb. | offen |
| fehlvorstellungen/FV.BR.STELLENWERT-DEZIMAL.yaml | `so-denkst-du` | „Du hast eine Ziffer an die falsche Stelle hinter dem Komma gesetzt“ passt nicht zu den beiden Erstvermittlungs-Antworten, die auf sie zeigen, ohne dass das Kind ein Komma schreibt (DEZ-ORDNEN `vorwissen` „70“, PROZENT `entdecken` „5“); die Erstvermittlung zeigt nur `kurz`. Siehe Urteil unten. | offen |

### Urteil zu den Behebungen aus Durchgang 1

Alle 13 Behebungen wurden nachgeprüft (Dateien, Generatoren, Beschreibungen). Zwölf tragen, eine nur halb:

| Fund aus Durchgang 1 | Behebung | Urteil |
|---|---|---|
| M.ZO.BR.PROZENT/vermittlung.yaml, `entdecken`, Fehler 5 | Fehler 5 zeigt jetzt auf FV.BR.STELLENWERT-DEZIMAL. | Trägt nur halb. Die Richtung stimmt (Zehntel statt Hundertstel), aber die kurze Erklärung, die das Kind hier sieht, lautet „Hinter dem Komma: erste Stelle [[Zehntel]], zweite Stelle [[Hundertstel]] … Zähle die Stellen.“ In der Aufgabe steht keine Kommazahl, gezählt werden Kästchen; „Zähle die Stellen“ führt nicht zur Antwort, und `so-denkst-du` („Ziffer an die falsche Stelle hinter dem Komma gesetzt“) beschreibt etwas anderes (Frage 3). Vorschlag: Fehler 5 mit eigener Rückmeldung ohne `fv` („Du hast die Reihen gezählt. Eine Reihe sind 10 Hundertstel.“) oder `kurz` der Fehlvorstellung so fassen, dass sie auch Zehntel und Hundertstel ohne Komma trifft. Status: offen. |

Geprüft und tragend: NZ.ORDNEN `ergaenzen` (987 oder 1 009); `zahlenstrahl@1` mit `frage: true` (Beschreibung nennt nur Striche; ohne Werkzeug keine Statuszeile); Entscheidung Bruchstreifen in `vorwissen` (Bildzustand, wie KOORDINATEN); Beschreibung von `br.zahlenstrahl-ablesen@1`; Fehlerbild `striche-statt-abstaende` als (k + 1)/10; Text `anzahl-statt-anteil`; `leer: true` in `gitter@1` für ANTEIL-VON; Hilfe 2 in ANTEIL-VON/begruenden; `br.dezimal-runden@2` (falsche Stelle nie die Ausgangszahl, keine 0 an der Rundungsstelle, auch bei Zahlen unter einer Einheit); 100 % aus PROZENT/prozent-zu-bruch; `da.mittelwert@2` (zwei Nachkommastellen, Fehlerbilder `durch-falsche-anzahl` und `nicht-gerundet` passen); NOTEN `nicht-gerundet` → FV.NZ.RUNDEN-STELLE mit Rückweg zu MITTELWERT `beispiel` (der neue Fund in dieser Fehlvorstellung betrifft eine andere Stelle).

### Ohne Fund in Durchgang 2

Pfade relativ zu `content/mathematik/`.

- `zahl-und-operation/natuerliche-zahlen/M.ZO.NZ.ORDNEN/kompetenz.yaml`
- `zahl-und-operation/natuerliche-zahlen/M.ZO.NZ.ORDNEN/vermittlung.yaml`
- `zahl-und-operation/natuerliche-zahlen/M.ZO.NZ.ORDNEN/vorlagen/der-groesse-nach.yaml`
- `zahl-und-operation/natuerliche-zahlen/M.ZO.NZ.ORDNEN/vorlagen/vergleichszeichen.yaml`
- `zahl-und-operation/brueche-und-dezimalzahlen/M.ZO.BR.VERGLEICHEN/kompetenz.yaml`
- `zahl-und-operation/brueche-und-dezimalzahlen/M.ZO.BR.VERGLEICHEN/vermittlung.yaml`
- `zahl-und-operation/brueche-und-dezimalzahlen/M.ZO.BR.VERGLEICHEN/vorlagen/begruenden.yaml`
- `zahl-und-operation/brueche-und-dezimalzahlen/M.ZO.BR.VERGLEICHEN/vorlagen/groesster.yaml`
- `zahl-und-operation/brueche-und-dezimalzahlen/M.ZO.BR.VERGLEICHEN/vorlagen/zeichen.yaml`
- `zahl-und-operation/brueche-und-dezimalzahlen/M.ZO.BR.ZAHLENSTRAHL/kompetenz.yaml`
- `zahl-und-operation/brueche-und-dezimalzahlen/M.ZO.BR.ZAHLENSTRAHL/vermittlung.yaml`
- `zahl-und-operation/brueche-und-dezimalzahlen/M.ZO.BR.ZAHLENSTRAHL/vorlagen/begruenden.yaml`
- `zahl-und-operation/brueche-und-dezimalzahlen/M.ZO.BR.ZAHLENSTRAHL/vorlagen/bruch.yaml`
- `zahl-und-operation/brueche-und-dezimalzahlen/M.ZO.BR.ZAHLENSTRAHL/vorlagen/dezimal.yaml`
- `zahl-und-operation/brueche-und-dezimalzahlen/M.ZO.BR.ANTEIL-VON/kompetenz.yaml`
- `zahl-und-operation/brueche-und-dezimalzahlen/M.ZO.BR.ANTEIL-VON/vermittlung.yaml`
- `zahl-und-operation/brueche-und-dezimalzahlen/M.ZO.BR.ANTEIL-VON/vorlagen/begruenden.yaml`
- `zahl-und-operation/brueche-und-dezimalzahlen/M.ZO.BR.DEZ-ORDNEN/kompetenz.yaml`
- `zahl-und-operation/brueche-und-dezimalzahlen/M.ZO.BR.DEZ-ORDNEN/vermittlung.yaml`
- `zahl-und-operation/brueche-und-dezimalzahlen/M.ZO.BR.DEZ-ORDNEN/vorlagen/begruenden.yaml`
- `zahl-und-operation/brueche-und-dezimalzahlen/M.ZO.BR.DEZ-ORDNEN/vorlagen/runden.yaml`
- `zahl-und-operation/brueche-und-dezimalzahlen/M.ZO.BR.DEZ-ORDNEN/vorlagen/vergleichen.yaml`
- `zahl-und-operation/brueche-und-dezimalzahlen/M.ZO.BR.PROZENT/kompetenz.yaml`
- `zahl-und-operation/brueche-und-dezimalzahlen/M.ZO.BR.PROZENT/vorlagen/dezimal-zu-prozent.yaml`
- `zahl-und-operation/brueche-und-dezimalzahlen/M.ZO.BR.PROZENT/vorlagen/prozent-zu-bruch.yaml`
- `daten-und-zufall/daten/M.DZ.DA.MITTELWERT/kompetenz.yaml`
- `daten-und-zufall/daten/M.DZ.DA.MITTELWERT/vorlagen/begruenden.yaml`
- `daten-und-zufall/daten/M.DZ.DA.MITTELWERT/vorlagen/noten.yaml`
- `daten-und-zufall/daten/M.DZ.DA.MITTELWERT/vorlagen/zahlen.yaml`
- `fehlvorstellungen/FV.NZ.REIHENFOLGE-UMGEKEHRT.yaml`
- `fehlvorstellungen/FV.NZ.ZEICHEN-VERDREHT.yaml`
- `fehlvorstellungen/FV.NZ.RUNDEN-ABGESCHNITTEN.yaml`
- `fehlvorstellungen/FV.BR.TEIL-ZU-REST.yaml`
- `fehlvorstellungen/FV.BR.NUR-NENNER.yaml`
- `fehlvorstellungen/FV.BR.NUR-ZAEHLER.yaml`
- `fehlvorstellungen/FV.BR.STRICHE-GEZAEHLT.yaml`
- `fehlvorstellungen/FV.BR.ANZAHL-STATT-ANTEIL.yaml`
- `fehlvorstellungen/FV.BR.VERTAUSCHT.yaml`
- `fehlvorstellungen/FV.BR.ANTEIL-EIN-SCHRITT.yaml`
- `fehlvorstellungen/FV.BR.STELLENWERT-DEZIMAL.yaml`
- `fehlvorstellungen/FV.BR.PROZENT-HUNDERTSTEL.yaml`
- `fehlvorstellungen/FV.SA.ZWISCHENERGEBNIS.yaml`
- `fehlvorstellungen/FV.DA.MITTELWERT-ANZAHL.yaml`

Mit Fund in Durchgang 2 (9 Dateien): PROZENT: vermittlung (Urteil oben), begruenden; ANTEIL-VON: allgemein, stammbruch; MITTELWERT: vermittlung; FV.NZ.RUNDEN-STELLE, FV.BR.LAENGER-GROESSER, FV.NZ.ERSTE-ZIFFER, FV.BR.NENNER-GROESSER.

**Ohne Fund in beiden Durchgängen (31 Dateien):** alle sieben `kompetenz.yaml`; DEZ-ORDNEN/vermittlung; NZ.ORDNEN: der-groesse-nach, vergleichszeichen; BR.VERGLEICHEN: begruenden, groesster, zeichen; DEZ-ORDNEN: begruenden, vergleichen; PROZENT: dezimal-zu-prozent; MITTELWERT: begruenden; FV.NZ.ZEICHEN-VERDREHT, FV.NZ.REIHENFOLGE-UMGEKEHRT, FV.NZ.RUNDEN-ABGESCHNITTEN, FV.BR.TEIL-ZU-REST, FV.BR.NUR-NENNER, FV.BR.NUR-ZAEHLER, FV.BR.STRICHE-GEZAEHLT, FV.BR.ANZAHL-STATT-ANTEIL, FV.BR.VERTAUSCHT, FV.BR.ANTEIL-EIN-SCHRITT, FV.BR.STELLENWERT-DEZIMAL, FV.BR.PROZENT-HUNDERTSTEL, FV.SA.ZWISCHENERGEBNIS, FV.DA.MITTELWERT-ANZAHL. Zwölf weitere Dateien hatten nur in Durchgang 1 einen Fund und blieben nach der Behebung in Durchgang 2 ohne Fund (NZ.ORDNEN/vermittlung, BR.VERGLEICHEN/vermittlung, ZAHLENSTRAHL: vermittlung, begruenden, bruch, dezimal; ANTEIL-VON: vermittlung, begruenden; DEZ-ORDNEN: runden; PROZENT: prozent-zu-bruch; MITTELWERT: noten, zahlen). Über die Stufe entscheidet die nächste Sitzung.
