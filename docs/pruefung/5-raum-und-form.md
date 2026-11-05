# Prüfung Klasse 5, Raum und Form (Q-L1, Phase C)

Fundliste nach `INHALTSFORMAT.md` §8 (Prüfkatalog Fragen 1 bis 6) und dem Zusatzpunkt 7 aus dem Rundgang des Strangs Oberfläche: „Steht die Antwort schon im Text davor, in der Bildbeschreibung oder in der Statuszeile?“ Keine Teilnehmerdaten, nur Inhalte.

Geprüft werden die 46 Dateien der acht Kompetenzen M.RF.GF.LAGE, M.RF.GF.WINKEL, M.RF.GF.WINKELPAARE, M.RF.GF.KOORDINATEN, M.RF.KP.DARSTELLEN, M.RF.SY.SYMMETRIE, M.RF.SY.SPIEGELN, M.RF.SY.BEWEGUNGEN: je `kompetenz.yaml`, `vermittlung.yaml`, alle Vorlagen und Zeichen-Anleitungen sowie die 13 Fehlvorstellungen, auf die sie zeigen. Die Erstvermittlungen sind die neuen Fassungen aus Q-L2 (mit Bild und Werkzeug).

Ablauf: zwei unabhängige Durchgänge, jeweils zwei Sub-Agenten mit leerem Kontext (Teil A: die vier GF-Kompetenzen, Teil B: KP und SY). Funde werden behoben, dann folgt der zweite Durchgang. Dateien, die in beiden Durchgängen ohne Fund bleiben, bekommen Stufe 1 (`pnpm review setzen --stufe 1 --pruefer maschine`).

## Durchgang 1 (05.11.2026)

Pfade relativ zu `content/mathematik/`. Status: **behoben** (im PR „Q-L1 Durchgang 1“), **Entscheidung** (bewusst so gelassen, Begründung), **offen** (Hinweis ohne Fund, für eine spätere Runde).

### Funde

| Datei | Stelle | Frage | Fund | Status |
|---|---|---|---|---|
| raum-und-form/…/M.RF.GF.LAGE/vermittlung.yaml | Schritt `entdecken` | 7 | Die sichtbare Statuszeile von `geraden@1` nannte bei kurzen Stücken schon vor dem Verlängern „schneidend“. | behoben: Das Werkzeug nennt bei `kurz` die Lage erst nach dem Verlängern (Statuszeile und Beschreibung). |
| M.RF.GF.LAGE/vermittlung.yaml, M.RF.GF.WINKEL/vermittlung.yaml, M.RF.GF.WINKELPAARE/vermittlung.yaml | `ergaenzen`, `gegenbeispiel`, `pruefen`, `vorwissen` | 7 | Die Bildbeschreibung (Vorlesetext) nannte die gesuchte Antwort: „Sie sind parallel“, „110°, stumpf“, „β = 130°“. | behoben: neuer Parameter `frage: true` für `geraden@1`, `winkel@1` und `koerpernetz@1`. Die Beschreibung nennt dann nur die Daten (Richtungen, Skalenwerte, Namen der Winkel), nicht das Urteil. |
| M.RF.GF.KOORDINATEN/vermittlung.yaml | `ergaenzen`, `pruefen` | 7 | Die Bildbeschreibung „Punkte: S(6|3)“ ist die gesuchte Antwort. | Entscheidung: Für einen Bildschirmleser gibt es keinen anderen Zugang zur Lage eines Punkts; die Aufgabenbilder der Generatoren (`gf.punkt-ablesen`) machen es genauso. Bleibt so. |
| M.RF.GF.WINKEL/vorlagen/begruenden.yaml | Hilfe 2, Fehlerbild `gegenseite` | 5, 3 | Der Generator `gf.winkelart-aussage@1` liefert kein Bild; Hilfe und Rückmeldung sprachen von einem „Bogen“, den es nicht gibt. | behoben: Texte ohne Bogen („Gemeint ist der genannte Winkel, nicht der Rest bis 360°“). |
| M.RF.GF.WINKELPAARE/vermittlung.yaml | `vorwissen`, Fehler 90 und 360 → FV.GF.WINKELART | 3 | Die Kurzerklärung der Fehlvorstellung nannte „gestreckt: 180°“ nicht, genau das fehlende Wissen. | behoben: `FV.GF.WINKELART` kurz um „Gestreckt: 180°“ ergänzt; `so-denkst-du` passt jetzt auch zu Zahleingaben. |
| fehlvorstellungen/FV.GF.WINKELPAARE-NAMEN.yaml | `warum-nicht` | 4, 6 | „[[ähnliche]] Bilder“ markierte das Alltagswort als Fachbegriff Ähnlichkeit (Klasse 9). | behoben: umformuliert. |
| M.RF.GF.KOORDINATEN/vermittlung.yaml | `vorwissen`, Option „4“ → FV.NZ.ZEICHEN-VERDREHT | 3 | „Welche Zahl ist größer: 7 oder 4?“ enthält kein Vergleichszeichen; die Fehlvorstellung erklärt ein verdrehtes Zeichen. | behoben: Frage „Welcher Vergleich stimmt?“ mit Optionen 7 > 4 und 7 < 4. |
| raum-und-form/koerper/M.RF.KP.DARSTELLEN/vermittlung.yaml | `beispiel` | 4 | Text „Kreuz-Netz“, Bild war Netz 1 (T-Form, A und F an B). | behoben: Netz 5 (A und F an C), Text angepasst. |
| M.RF.KP.DARSTELLEN/vermittlung.yaml | `gegenbeispiel` | 7 | Das Bild hob die aufeinanderfallenden Quadrate hervor, die Beschreibung sagte „kein Würfelnetz“. | behoben: ohne `boden`, mit `frage: true`. |
| M.RF.KP.DARSTELLEN/vorlagen/netz-waehlen.yaml | Fehlerbild `falsch-gefaltet` | 2 | „eine Würfelfläche bleibt offen“ stimmt bei 13 von 150 Nicht-Netzen nicht (zwei Flächen offen, etwa U-Form). | behoben: „mindestens eine“, auch im Lösungsweg des Generators `kp.wuerfelnetz-waehlen`. |
| M.RF.KP.DARSTELLEN/anleitungen/wuerfelnetz.yaml | Schritt 1 | 4 | Text „4 Kästchen lang und breit“, Bild zeigt Quadrate aus 2 × 2 Kästchen. | behoben: Text „2 Kästchen“. |
| raum-und-form/symmetrie/M.RF.SY.SYMMETRIE/vermittlung.yaml | `ergaenzen` | 4 | Das „Dreieck mit zwei gleich langen Seiten“ war bis auf 3 % gleichseitig; 3 wäre vom Bild her richtig. | behoben: Spitze (4|8), Schenkel 7,6 zu Basis 6. |
| M.RF.SY.SYMMETRIE/vorlagen/achsen-zaehlen.yaml | Generator `sy.achsen-zaehlen@1`, Formen gleichschenkliges Dreieck und Raute | 1 | Für viele Seeds praktisch gleichseitig bzw. fast ein gedrehtes Quadrat; die richtige Antwort war nicht eindeutig. | behoben: Dreieck mindestens 1,3-mal so hoch wie breit, kurze Diagonale der Raute höchstens 130 zu 190 (Test). |
| M.RF.SY.SYMMETRIE/vorlagen/achsen-zaehlen.yaml | Fehlerbild `diagonalen-als-achsen` bei Dreieck (3), Raute (4), Trapez (2) | 2 | „Nicht jede Diagonale ist eine Symmetrieachse“ passt nicht: Ein Dreieck hat keine Diagonalen, bei der Raute sind die Diagonalen gerade die Achsen. | behoben: neues Fehlerbild `mittellinien-als-achsen` („Nicht jede Linie durch die Mitte …“) für diese drei Formen; `diagonalen-als-achsen` bleibt für Rechteck, Parallelogramm, Drachen. |
| M.RF.SY.SYMMETRIE/vorlagen/begruenden.yaml | Fehlerbilder `achsensymmetrie`, `achsen-gezaehlt` | 2 | Die Rückmeldungen beschrieben ein Zuviel an Achsen, die Optionen des Generators sind teils ein Zuwenig. | behoben: Texte in beide Richtungen neutral („Prüfe jede Linie durch Falten, auch schräge …“). |
| fehlvorstellungen/FV.GF.SPIEGELN-KOORDINATE.yaml | `kurz`, `so-stimmt-es` | 3 | Nur x-Achse, y-Achse, Ursprung und negative Koordinaten; in Klasse 5 ist die Achse x = 4 oder y = 3 im ersten Quadranten. | behoben: Kurzerklärung für jede waagerechte oder senkrechte Achse, Beispiel P(5|6) an y = 4 voran. |
| M.RF.SY.BEWEGUNGEN/vorlagen/erkennen.yaml | Bild des Generators `sy.bewegung-erkennen@1` | 7 | Die Bildbeschreibung nannte die gesuchte Bewegung wörtlich. | behoben: Beschreibung nennt nur die Kästchen beider Figuren und die Linie. |
| M.RF.SY.BEWEGUNGEN/vorlagen/erkennen.yaml | Bild bei Spiegelung | 4 | Die dicke Linie war nicht die Spiegelachse der beiden Figuren (Bildfigur fest um 8 Spalten versetzt). | behoben: Spiegelung wirklich an der Linie zwischen Spalte 7 und 8 (Spalte s → 13 − s), Test. |
| M.RF.SY.BEWEGUNGEN/vorlagen/verschiebung.yaml | Fehlerbild `nur-x-verschoben` | 2 | Bei dx = 0 war die Fehlerbild-Antwort der unveränderte Punkt Q. | behoben: dx und dy sind nie 0. |

### Hinweise ohne Fund (Durchgang 1)

| Datei | Stelle | Hinweis | Status |
|---|---|---|---|
| M.RF.GF.LAGE/vermittlung.yaml | `erklaeren-senkrecht` | „Alle anderen Geraden schneiden sich schräg“ schloss Parallelen mit ein. | behoben (Formulierung) |
| M.RF.GF.LAGE/vermittlung.yaml | `beispiel` | Uhr um 2 Uhr war spiegelverkehrt gezeichnet. | behoben (`winkel: 120`) |
| M.RF.GF.LAGE/vorlagen/begruenden.yaml | Hilfe 2 | „Miss den Abstand an zwei Stellen“ ohne Bild; beide Abstände stehen im Text. | behoben („Vergleiche die beiden Abstände.“) |
| M.RF.GF.WINKEL/vorlagen/ablesen.yaml | Fehlerbild `falsche-skala` | „Spitze Winkel sind kleiner als 90°“ half bei stumpfen Winkeln nicht. | behoben („Schätze vorher: spitz oder stumpf?“) |
| M.RF.GF.WINKELPAARE/vermittlung.yaml | `merksatz` | Lesart, als bräuchten Scheitelwinkel Parallelen. | behoben |
| M.RF.SY.SYMMETRIE/vorlagen/figur-waehlen.yaml | Niveau M | Mit 7 Kästchen hat die symmetrische Figur 8, die anderen 7. | behoben (`kaestchen: 8`) |
| fehlvorstellungen/FV.SY.ACHSENSYMMETRIE.yaml, FV.SY.BEWEGUNG-ERKENNEN.yaml | `so-stimmt-es`, `warum-nicht` | „ist sie Punktsymmetrie“; „[[ähnlich]]“ als Fachbegriff. | behoben |
| M.RF.SY.SPIEGELN/vermittlung.yaml | `entdecken`, Option | „Er wandert in dieselbe Richtung wie P“ war bei Pfeilen nach oben wahr. | behoben („auch nach rechts, von der Linie weg“) |
| M.RF.SY.BEWEGUNGEN/vermittlung.yaml | `gegenbeispiel` | Der symmetrische Pfeil war ebenso eine Drehung wie eine Spiegelung. | behoben (L-Figur ohne waagerechte Achse) |
| M.RF.SY.SYMMETRIE/vermittlung.yaml, M.RF.SY.SPIEGELN/vermittlung.yaml | `entdecken`, `vorwissen-achse` | Die Beschreibung nannte die dicke Linie „Spiegelachse“, bevor das Kind entschieden hat. | behoben (Text „Dicke Linie senkrecht bei x =“) |
| M.RF.KP.DARSTELLEN/vermittlung.yaml | `pruefen` | „Welche zwei Quadrate liegen gegenüber?“ hatte bei Netz 7 drei richtige Paare. | behoben („gegenüber von C“) |
| fehlvorstellungen/FV.GF.LAGEBEZIEHUNG.yaml | `erklaerung.lang` | Die lange Erklärung behandelt nur „nicht berühren = parallel“, nicht „schräg = senkrecht“. | offen |
| fehlvorstellungen/FV.GF.X-Y-VERTAUSCHT.yaml | `so-stimmt-es` | Für Gleichungssysteme formuliert, in Klasse 5 wenig hilfreich (geteilt mit acht Kompetenzen). | offen |
| fehlvorstellungen/FV.KP.NETZ-FALTEN.yaml | `so-stimmt-es` | „genau eine Fläche dazwischen“ gilt nur in einer geraden Reihe (Treppe: nicht). | offen |
| M.RF.SY.BEWEGUNGEN/vermittlung.yaml | `erklaeren-bewegungen` | Für die Drehung gibt es kein Bild (auf Niveau G kommt sie nicht vor). | offen |
| M.RF.SY.BEWEGUNGEN/vorlagen/begruenden.yaml | Hilfe 2 | „Ist die Figur seitenverkehrt?“, die Situation hat nur einen Punkt. | offen |
| M.RF.GF.WINKELPAARE/vorlagen/benennen.yaml | Bildbeschreibung | „am oberen Schnittpunkt“ auch ohne Parallelen. | offen |
| M.RF.GF.KOORDINATEN/vorlagen/ablesen.yaml, finden.yaml | Bildbeschreibung | enthält die Lösung (siehe Entscheidung oben). | Entscheidung |
| M.RF.GF.LAGE/kompetenz.yaml | `abdeckung: gemischt` | alle Vorlagen sind Generatoren; „gemischt“ nur mit den Anleitungen. | offen |

### Ohne Fund in Durchgang 1

Alle acht `kompetenz.yaml`; LAGE: parallele-finden, zwei-geraden, Anleitungen parallele und senkrechte; WINKEL: art, Anleitung zeichnen; WINKELPAARE: begruenden, benennen, groesse; KOORDINATEN: ablesen, begruenden, finden; KP.DARSTELLEN: begruenden, gegenueber, kein-netz; SYMMETRIE: figur-waehlen; SPIEGELN: vermittlung, begruenden, dreieck, punkt, Anleitung kaestchen; BEWEGUNGEN: vermittlung, begruenden; Fehlvorstellungen FV.GF.LAGEBEZIEHUNG, FV.GF.WINKELMESSER-SKALA, FV.GF.GLEICH-ODER-180, FV.GF.X-Y-VERTAUSCHT, FV.GF.KAESTCHEN-LINIEN, FV.KP.NETZ-FALTEN, FV.SY.ACHSENSYMMETRIE, FV.SY.SPIEGELABSTAND, FV.SY.VERSCHIEBUNG.

## Durchgang 2 (06.11.2026)

Zwei frische Sub-Agenten über dieselben 46 Dateien, nach den Korrekturen aus Durchgang 1.

### Funde

| Datei | Stelle | Frage | Fund | Status |
|---|---|---|---|---|
| M.RF.GF.LAGE/vorlagen/parallele-finden.yaml | Generator `gf.parallele-finden@1`, Niveau G | 4, 1 | In rund einem Drittel der Aufgaben lag die gesuchte Parallele auf derselben Geraden wie a (unterbrochene Linie statt zweiter Gerade). | behoben: Die Parallele wird immer 22 px quer zu a versetzt gezeichnet. |
| M.RF.GF.LAGE/anleitungen/parallele.yaml, senkrechte.yaml, M.RF.GF.WINKEL/anleitungen/zeichnen.yaml | `[[Kante]]` | 4, 6 | Der markierte Begriff zeigt die Erklärung der Körperkante („Ein Quader hat 12 Kanten“), gemeint ist die lange Seite des Geodreiecks. | behoben: „lange Seite“. |
| M.RF.SY.BEWEGUNGEN/vorlagen/erkennen.yaml | Bild des Generators `sy.bewegung-erkennen@1` | 7 | Die dicke Linie wurde nur bei einer Spiegelung gezeichnet; auf Niveau G hieß die Aufgabe damit „Ist eine Linie da?“. | behoben: Die Linie steht bei jeder Bewegung (bei der Spiegelung ist sie die Achse), Test. |
| M.RF.SY.BEWEGUNGEN/vermittlung.yaml | `entdecken` | 7 | Der Text nannte „3 nach rechts, 2 nach oben“, die richtige Option wiederholte es. | behoben: Text ohne Zahlen, das Kind liest die Verschiebung am Werkzeug ab. |

### Hinweise ohne Fund (Durchgang 2)

| Datei | Stelle | Hinweis | Status |
|---|---|---|---|
| M.RF.GF.WINKELPAARE/vermittlung.yaml | `gegenbeispiel` | `frage: true` fehlte, die Beschreibung nannte α = 50°, β = 130°. | behoben |
| M.RF.GF.LAGE/vermittlung.yaml | `entdecken` | Mit den Drehknöpfen ließ sich h parallel drehen, dann trafen sich die Geraden nicht. | behoben: `drehbar: false`, nur der Knopf zum Verlängern |
| M.RF.GF.LAGE/vermittlung.yaml | `gegenbeispiel` | Beschreibung „h verläuft unter 90°“ (Richtung, nicht Winkel zwischen g und h) war missverständlich. | behoben (`richtung: 10`) |
| M.RF.SY.SYMMETRIE/vermittlung.yaml | `pruefen` | Fragte nach dem Quadrat, dessen Achsenzahl das Beispiel schon nannte. | behoben (Rechteck, 2 Achsen) |
| M.RF.SY.BEWEGUNGEN/vermittlung.yaml | `pruefen` | Option (−1|3) mit negativer Koordinate in Klasse 5. | behoben (Q(5|5), Optionen (8|7), (8|5), (2|3)) |
| M.RF.KP.DARSTELLEN/vermittlung.yaml | `merksatz` | „jedes zweite Quadrat“ schwer lesbar. | behoben („das erste und das dritte“) |
| M.RF.KP.DARSTELLEN/vorlagen (Generator `netze.ts`) | Bildbeschreibung | Dativ „aus 6 Quadrate“. | behoben |
| M.RF.KP.DARSTELLEN/anleitungen/wuerfelnetz.yaml | Bilder 3 und 4 | Zwei Klebelaschen treffen beim Falten dieselbe Kante, ein Kantenpaar hat keine; der Würfel schließt trotzdem. | offen (Anleitungsbild `bilder.ts`) |
| M.RF.KP.DARSTELLEN/kompetenz.yaml | `kann_satz`, Niveau M | verspricht Schrägbilder, Grundriss, Seitenansichten; die Vorlagen behandeln nur Netze. | offen, Lücke für den PV (Inhalt oder Beschreibung anpassen) |
| M.RF.GF.LAGE/kompetenz.yaml, M.RF.GF.KOORDINATEN/kompetenz.yaml | Niveau M | Beschreibung verspricht Figuren und Koordinatensystem bzw. Brüche und Dezimalzahlen; die M-Vorlagen tun das nicht. | offen, Lücke für den PV |
| M.RF.GF.WINKEL/vermittlung.yaml, vorlagen/art.yaml | `[[Winkelart]]` | Antippen des Begriffs zeigt die Einteilung, also die Antwort. Markierung ist projektweit Pflicht. | Entscheidung: bleibt |
| M.RF.GF.WINKELPAARE/vermittlung.yaml | `pruefen` mit `frage: true` | Die Beschreibung sagt nicht, ob β neben oder gegenüber α liegt. | offen (Werkzeug könnte die Lage der Felder nennen) |
| M.RF.SY.SPIEGELN/vermittlung.yaml | `entdecken`, Option „auch nach rechts“ | zeigt auf FV.SY.SPIEGELABSTAND, deren `so-denkst-du` nur „bis zur Achse“ nennt; die kurze Erklärung widerlegt die Option trotzdem. | offen |
| M.RF.SY.SYMMETRIE/vorlagen/figur-waehlen.yaml | Fehlerbild `fast-symmetrisch` | Das verschobene Kästchen kann die Figur zerreißen; die Aufgabe bleibt eindeutig. | offen |
| fehlvorstellungen/FV.GF.SPIEGELN-KOORDINATE.yaml | `kurz` („Am Ursprung“), `so-stimmt-es` | für Klasse 5 über dem Niveau, fachlich richtig; das Klasse-5-Beispiel steht jetzt voran. | offen (geteilt mit QUADRANTEN) |
| M.RF.GF.LAGE/vorlagen/begruenden.yaml | Option `senkrecht` | aus den Angaben nicht streng ausgeschlossen, praktisch eindeutig. | offen |
| M.RF.GF.LAGE/anleitungen/senkrechte.yaml | `titel` | „Senkrechte“ ist keine Wortform im Wörterbuch. | offen |

### Ohne Fund in Durchgang 2

Alle Dateien außer den vier oben: alle acht `kompetenz.yaml`, alle Erstvermittlungen außer BEWEGUNGEN, alle Vorlagen außer parallele-finden und erkennen, Anleitungen wuerfelnetz und kaestchen, alle 13 Fehlvorstellungen.

## Durchgang 3 (Nachprüfung, 06.11.2026)

Dateien, die nach ihrem letzten Durchgang ohne Fund noch geändert wurden, prüft ein weiterer frischer Sub-Agent: LAGE/vermittlung, LAGE/anleitungen parallele und senkrechte, LAGE/parallele-finden (Generator), WINKEL/anleitungen zeichnen, WINKELPAARE/vermittlung, KP.DARSTELLEN/vermittlung, SYMMETRIE/vermittlung, BEWEGUNGEN/vermittlung, BEWEGUNGEN/erkennen (Generator).

Ergebnis folgt.

## Stufe 1

Regel für dieses Feld (wie beim Musterfeld Brüche am 04.11.2026): Stufe 1 bekommt eine Datei, wenn sie in zwei unabhängigen Durchgängen geprüft wurde und nach ihrer letzten Änderung ein Durchgang ohne Fund lag.
