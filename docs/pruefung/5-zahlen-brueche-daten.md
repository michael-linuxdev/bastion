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

Status: **offen** (noch nicht behoben; nichts ist in diesem Durchgang geändert, keine Stufe gesetzt).

### Funde

| Datei | Stelle | Frage | Fund | Vorschlag | Status |
|---|---|---|---|---|---|
| M.ZO.NZ.ORDNEN/vermittlung.yaml | Schritt `ergaenzen`, Fehler 1090 → FV.NZ.ERSTE-ZIFFER | 3, 2 | „Welche Zahl ist kleiner: 1 090 oder 1 009?“ Beide Zahlen haben vier Stellen und dieselbe erste Ziffer. Wer 1 090 wählt, hat nicht nach der ersten Ziffer verglichen (eher von rechts oder die Null übersehen). Die Fehlvorstellung sagt „Zähle zuerst die Stellen … mehr Stellen ist größer“ und „Bei gleich langen Zahlen klappt das“, das widerspricht dem Fall direkt. | Zahlenpaar mit verschieden vielen Stellen und größerer erster Ziffer bei der kürzeren Zahl (etwa 980 oder 1 009), oder den Fehler 1090 ohne `fv` lassen bzw. auf eine passende Fehlvorstellung (Stellenwert) zeigen lassen. | offen |
| M.ZO.BR.ZAHLENSTRAHL/vermittlung.yaml; für `vorwissen` auch M.ZO.BR.VERGLEICHEN/vermittlung.yaml, M.ZO.BR.ANTEIL-VON/vermittlung.yaml | Schritte `ergaenzen`, `pruefen` (auch `gegenbeispiel`), `vorwissen` | 7 | Das Bild `zahlenstrahl@1` hat als Beschreibung „Zahlenstrahl von 0 bis 1, Markiert: 5/6“ bzw. „Markiert: 4/10“. Das ist die gesuchte Antwort; ein Bildschirmleser liest sie vor. Gleiches gilt für `vorwissen` mit `bruchstreifen@1` („3 von 5 Teilen gefärbt“, auch in BR.VERGLEICHEN und BR.ANTEIL-VON). | Für Frageschritte eine Beschreibung ohne Ergebnis, z. B. Parameter `frage: true` wie bei `geraden@1`/`winkel@1`: „7 Striche von 0 bis 1, Markierung am 6. Strich“. Sonst Entscheidung wie bei M.RF.GF.KOORDINATEN begründen. | offen |
| M.ZO.BR.ZAHLENSTRAHL/vorlagen/bruch.yaml, dezimal.yaml | Bild des Generators `br.zahlenstrahl-ablesen@1` | 7 | Die Beschreibung lautet „Jede Einheit ist in n gleiche Abschnitte geteilt. Die Markierung steht am k. Teilstrich nach der 0.“ Damit sind Nenner und Zähler genannt, und gerade der geprüfte Schritt (Abschnitte statt Striche zählen) ist vorweggenommen. | Beschreibung nur mit Strichen: „Von 0 bis 1 gibt es n + 1 Striche, die Markierung ist der k. Strich nach der 0.“ Dann muss auch ein Kind mit Bildschirmleser die Abschnitte selbst bestimmen. | offen |
| M.ZO.BR.ZAHLENSTRAHL/vorlagen/dezimal.yaml | Fehlerbild `striche-statt-abstaende` | 2 | Der Generator setzt den Wert k/(n+1), also 0,454545 statt 0,5, 0,818182 statt 0,9 usw. Diese Zahl tippt kein Kind, das Striche zählt; das Fehlerbild erscheint praktisch nie. Die Erstvermittlung (`pruefen`) nimmt für denselben Fehler 0,5 statt 0,4, also einen Strich zu viel. | Fehlerbild-Wert (k + 1)/10 (einen Strich zu viel gezählt), wie in der Erstvermittlung; Test anpassen. | offen |
| M.ZO.BR.ZAHLENSTRAHL/vorlagen/begruenden.yaml | Fehlerbild `anzahl-statt-anteil` | 6, 3 | „Die Marke zeigt einen [[Anteil]] von 1, nicht die Zahl der Striche.“ „Einen Anteil von 1“ liest ein Kind leicht als „den Wert 1“. Gemeint ist „einen Teil des Ganzen“. | „Die Marke zeigt einen Teil der Strecke von 0 bis 1, keine Anzahl. Zähle die Abschnitte bis 1 für den Nenner.“ | offen |
| M.ZO.BR.ANTEIL-VON/vermittlung.yaml | Bilder in `erklaeren-anteil-von` und `beispiel` | 4 | Der Text trennt „drei Viertel“ (gefärbte Kästchen) vom übrigen Viertel bzw. „zwei Fünftel“ von den übrigen drei. Im Bild sind die übrigen Säulen als `figuren` gezeichnet, und `gitter@1` füllt Figuren grau (Deckkraft 0,25 gegen 0,35 bei Kästchen). Gerendert sehen alle vier bzw. fünf Säulen fast gleich grau aus; man sieht nicht, welcher Teil gemeint ist. | Übrige Säulen ungefüllt zeichnen (z. B. gestrichelte Bildfigur `bild: true` oder neuer Parameter für ungefüllte Figuren) oder nur die genommenen Teile als Kästchen und den Rest als Umriss. | offen |
| M.ZO.BR.ANTEIL-VON/vorlagen/begruenden.yaml | Hilfe 2 | 5, 6 | „Ein Teil ist erst 1/n.“ Die Variable n kennt ein Kind in Klasse 5 nicht; die Hilfe sagt nicht, welcher Teil gemeint ist. | „Durch den [[Nenner]] teilen ergibt erst ein Teil, etwa ein Siebtel.“ | offen |
| M.ZO.BR.DEZ-ORDNEN/vorlagen/runden.yaml | Fehlerbild `falsche-stelle` | 2, 3 | Hat die Zahl genau eine Stelle mehr als verlangt, ist der Fehlerbild-Wert die unveränderte Zahl (G: „Runde 18,2 auf Ganze“ → 18,2; „0,62 auf Zehntel“ → 0,62; in 20 Aufgaben je Niveau 8- bis 9-mal). Wer die Zahl abschreibt, hat nicht „auf eine andere Stelle gerundet“; die Fehlvorstellung („Du hast richtig gerundet, aber auf eine andere Stelle“) passt nicht. | Fehlerbild nur setzen, wenn der Wert sich von der Ausgangszahl unterscheidet (sonst etwa auf die nächstgröbere Stelle runden); für „unverändert abgeschrieben“ eigenes Fehlerbild oder keines. | offen |
| M.ZO.BR.DEZ-ORDNEN/vorlagen/runden.yaml | Lösung bei „auf Hundertstel“ (Niveau M) | 4 | „Runde 907,704 auf Hundertstel“ zeigt als Lösung 907,7, ebenso 329,101 → 329,1. Auf Hundertstel gerundet schreibt man 907,70; die Endnull zeigt die Genauigkeit. Lösung und Lösungsweg lehren hier die falsche Schreibweise (FV.NZ.RUNDEN-STELLE sagt selbst „rechts von ihr stehen nur noch Nullen“). | Lösung mit fester Stellenzahl anzeigen (907,70) und 907,7 wie 907,70 werten, oder Zahlen ziehen, bei denen die Rundungsstelle keine 0 wird. | offen |
| M.ZO.BR.PROZENT/vorlagen/prozent-zu-bruch.yaml | Aufgabe „100 % als vollständig gekürzten Bruch“ (G und M) | 1, 4 | Lösung ist $\frac{1}{1}$. Ein sicheres Kind schreibt 1 oder $\frac{100}{100}$; „1/1 als gekürzter Bruch“ ist unüblich, und die Form ist nicht eindeutig. 100 % kommt in rund einem Viertel der G-Aufgaben vor. | 100 % aus der Liste dieser Vorlage nehmen (bleibt in DEZIMAL-ZU-PROZENT) oder 1 als Lösung annehmen und die Aufgabe „als Bruch oder ganze Zahl“ stellen. | offen |
| M.ZO.BR.PROZENT/vermittlung.yaml | Schritt `entdecken`, Fehler 5 → FV.BR.PROZENT-HUNDERTSTEL | 3 | Gefragt ist „Wie viele Hundertstel sind gefärbt?“, Prozent ist noch nicht eingeführt. Wer 5 antwortet, hat Reihen (Zehntel) gezählt. Die Fehlvorstellung sagt „Du hast Prozent nicht als Hundertstel umgewandelt“, das passt nicht. | Auf FV.BR.STELLENWERT-DEZIMAL zeigen (Zehntel und Hundertstel verwechselt) oder Fehler ohne `fv`. | offen |
| M.DZ.DA.MITTELWERT/vorlagen/zahlen.yaml | Niveau M, Lösung | 1 | Ohne Rundungsangabe entstehen periodische Ergebnisse: 115,666667; 73,166667; 118,833333; 115,833333 (4 von 20 Aufgaben). Die Auswertung vergleicht exakt, ein Kind müsste genau 115,666667 tippen. Der Lösungsweg zeigt 115,667. | Wie bei NOTEN „runde auf eine Nachkommastelle“ (oder zwei) in den Text und die Lösung runden, oder nur Werte ziehen, deren Durchschnitt höchstens zwei Nachkommastellen hat. | offen |
| M.DZ.DA.MITTELWERT/vorlagen/noten.yaml | Fehlerbild `nicht-gerundet` → FV.SA.ANGABE-UEBERSEHEN | 3 | Die kurze Erklärung der Fehlvorstellung lautet „Eine Angabe fehlt in deiner Rechnung. Lies den Text noch einmal und unterstreiche jede Zahl.“ Wer 2,67 statt 2,7 eingibt, hat alle Zahlen benutzt und nur nicht gerundet. Erklärung und Fehlerbild widersprechen sich. | Andere Fehlvorstellung (Rundungsauftrag übersehen, z. B. FV.NZ.RUNDEN-STELLE: „auf eine andere Stelle gerundet“) oder Fehlerbild ohne `fv`. | offen |

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
| fehlvorstellungen/FV.BR.PROZENT-HUNDERTSTEL.yaml | `warum-nicht` | „Das Komma zu verschieben ist der richtige Weg“ passt nicht zum Fehlerbild `prozent-als-nenner-zehn` (30 % → 30/10, kein Komma); die kurze Erklärung passt. | offen |
| M.DZ.DA.MITTELWERT/vorlagen/zahlen.yaml | Fehlerbild `durch-falsche-anzahl`, Niveau G | Wert Summe : (n − 1) oft periodisch (26,666667); ein Kind tippt gerundet, das Fehlerbild greift dann nicht. | offen |
| M.DZ.DA.MITTELWERT/vorlagen/noten.yaml, kompetenz.yaml | Niveau G | Kompetenz G: Durchschnitt natürlicher Zahlen; NOTEN (G) verlangt Runden auf Zehntel. | offen |
| M.DZ.DA.MITTELWERT/vermittlung.yaml | `vorwissen` | „12 : 4“ prüft Division natürlicher Zahlen, der Rückweg führt zu M.ZO.BR.DEZ-RECHNEN (Dezimalzahlen). | offen |

### Ohne Fund in Durchgang 1

Alle sieben `kompetenz.yaml` (Lücken oben nur als Hinweis); Erstvermittlungen BR.DEZ-ORDNEN, DA.MITTELWERT; NZ.ORDNEN: der-groesse-nach, vergleichszeichen; BR.VERGLEICHEN: begruenden, groesster, zeichen; ANTEIL-VON: allgemein, stammbruch; DEZ-ORDNEN: begruenden, vergleichen; PROZENT: begruenden, dezimal-zu-prozent; MITTELWERT: begruenden; alle 19 Fehlvorstellungen (FV.NZ.ERSTE-ZIFFER, FV.NZ.ZEICHEN-VERDREHT, FV.NZ.REIHENFOLGE-UMGEKEHRT, FV.NZ.RUNDEN-ABGESCHNITTEN, FV.NZ.RUNDEN-STELLE, FV.BR.TEIL-ZU-REST, FV.BR.NENNER-GROESSER, FV.BR.NUR-NENNER, FV.BR.NUR-ZAEHLER, FV.BR.STRICHE-GEZAEHLT, FV.BR.ANZAHL-STATT-ANTEIL, FV.BR.VERTAUSCHT, FV.BR.ANTEIL-EIN-SCHRITT, FV.BR.STELLENWERT-DEZIMAL, FV.BR.LAENGER-GROESSER, FV.BR.PROZENT-HUNDERTSTEL, FV.SA.ZWISCHENERGEBNIS, FV.SA.ANGABE-UEBERSEHEN, FV.DA.MITTELWERT-ANZAHL; die Widersprüche bei ERSTE-ZIFFER, PROZENT-HUNDERTSTEL und ANGABE-UEBERSEHEN liegen in den Dateien, die auf sie zeigen).

Mit Fund: NZ.ORDNEN/vermittlung; BR.VERGLEICHEN/vermittlung; ZAHLENSTRAHL: vermittlung, begruenden, bruch, dezimal; ANTEIL-VON: vermittlung, begruenden; DEZ-ORDNEN: runden; PROZENT: vermittlung, prozent-zu-bruch; MITTELWERT: noten, zahlen.

## Durchgang 2

Folgt nach der Behebung in einer frischen Sitzung.
