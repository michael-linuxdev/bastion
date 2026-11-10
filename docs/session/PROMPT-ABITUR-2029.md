# Prompt: Strang Abitur (Abiturprüfung Mathematik Sachsen 2029)

> Entwurf, erstellt von Claude am 10.11.2026. Die Entscheidungen E1 bis E9 sind
> Vorschläge, die der PV noch nicht bestätigt hat. Vorher prüfen: E1, E2, E8, E9
> und die Rückfragen am Ende. Die Werte in QUELLEN sind aus den Verlagsleseproben
> abgelesen, nicht amtlich.

````text
Lies CLAUDE.md, docs/SESSION-PROMPT.md, docs/VISION.md §6, docs/PRUEFUNGEN.md,
docs/INHALTSFORMAT.md, docs/session/KLASSE-9-12.md und
docs/session/KLASSE-10-12-BAUPLAN.md.

AUFTRAG
Du eröffnest den vierten Strang "Abitur" und baust das Fundament, damit die
Abiturprüfung Mathematik Sachsen 2029 (Grundkurs und Leistungskurs) aus Bastion
erzeugt werden kann. Du baust in dieser Sitzung NICHT die Prüfung, sondern
Format, Rechenkern, Prüfungsformate und einen Piloten. Parallel behebt eine
andere Sitzung die Funde des Reviews vom 10.11.2026; deren Dateien fasst du
nicht an (src/core/learning/arbeitsblatt.ts, fortschritt.ts, die Generatoren
unter src/generators/mathematik/, kompetenz.yaml-Dateien, docs/PRUEFUNGEN.md
Zeilen 18 bis 95).

ENTSCHEIDUNGEN DES PV (in Schritt 0 festschreiben, nicht neu verhandeln)
E1 "Erzeugen" heißt: Zusammenstellen aus von Menschen geschriebenen,
   parametrisierten Aufgabenfamilien. Die App erfindet keine Aufgaben.
E2 Papier zuerst. Prüfungsaufgaben werden gedruckt und von Menschen korrigiert.
   Keine automatische Auswertung offener Antworten. In der App später:
   Selbstkontrolle am Erwartungshorizont.
E3 Zweites Inhaltsformat "aufgabenfamilie@1" neben den heutigen Vorlagen.
E4 Eigener Rechenkern im Kern, ohne neue Abhängigkeit. Kein Mathematiksystem
   für Lernende.
E5 Prüfungsformate sind Daten je Jahrgang, mit Kennzeichen, ob amtlich bestätigt.
E6 Prüfungen werden als Text-PDF über Druck-CSS gesetzt, nicht über den
   Bild-Weg T-23.
E7 Startwert einer echten Prüfung: 128 Bit, von außen in den Kern gereicht.
   Startwert + Inhaltsstand = dieselbe Prüfung, Zeichen für Zeichen.
E8 Jahrgang 11/12 ist für diesen Strang wieder freigegeben (ändert K-32 Punkt 2).
   Reihenfolge: Teil A Grundkurs, Realschulabschluss, Teil B, Leistungskurs.
E9 "Prüfungstauglich" ist nur, was eine Lehrkraft mit Abitur-Korrekturerfahrung
   freigegeben hat (Review-Stufe 3). Alles von dir ist Stufe 0.

STRENGE REGELN
1. Dokumente vor Code. Ein Schritt = ein Thema = ein PR, in der Reihenfolge
   unten. Branches abitur/..., Commits "AB-<Nr>: ...".
2. Keine KI zur Laufzeit, keine Netzverbindung, keine neue Laufzeitabhängigkeit.
   src/core importiert nichts aus src/ui und keine Browser-APIs. Zufall nur über
   src/core/rng.
3. Keine Aufgabe, kein Sachkontext und kein Wortlaut aus echten Prüfungen,
   Schulbüchern oder Verlagsheften. Nur Aufbau und Aufgabenart dürfen
   übernommen werden. Im Zweifel: eigener Kontext.
4. Dir liegen keine Lehrplan- und Prüfungs-PDFs vor. Formatwerte kommen
   ausschließlich aus docs/PRUEFUNGEN.md §2 bis §4 und aus QUELLEN unten. Wo
   beide sich widersprechen, gilt QUELLEN. Fehlt ein Wert: Rückfrage, nicht
   raten. Jedes Format trägt amtlich_bestaetigt: false, und jedes erzeugte Blatt
   druckt dann "Format nach Verlagsangaben, nicht amtlich bestätigt".
5. pnpm lint, pnpm test, pnpm build vor jedem Commit grün. Kein Test wird
   abgeschwächt. Größenbudget (pnpm budget) einhalten; Abitur-Code wird
   nachgeladen, nicht in die App-Hülle.
6. Jede Aufgabenfamilie besteht diese Tests, sonst wird sie nicht gemergt:
   a) 500 Startwerte: jede Lösung im Erwartungshorizont wird auf einem zweiten,
      unabhängigen Weg bestätigt (z. B. Ableitung symbolisch UND numerisch,
      Nullstelle durch Einsetzen, Wahrscheinlichkeit durch Auszählen).
   b) Summe der Bewertungseinheiten der Teilaufgaben = Wert der Aufgabe.
   c) Jede Teilaufgabe hat genau einen Operator aus der Operatorenliste, einen
      Anforderungsbereich (I, II, III) und ein Sachgebiet.
   d) Ergebnisse sind "prüfungsglatt" (Regel je Familie als Bedingung
      aufschreiben) und die Figur oder Funktion existiert für jeden Startwert.
   e) Teil A: ohne Rechner lösbar (Regel je Familie als Bedingung).
   f) Gleicher Startwert + gleicher Inhaltsstand = identischer Text (Schnappschuss).
7. Der Startwert echter Prüfungen erscheint in keinem Protokoll, keinem Export
   und keiner Fußzeile. Auf dem Blatt steht nur ein Prüfwert aus Format,
   Inhaltsstand und Startwert.
8. Erkläre jede Änderung in einfachem Deutsch: was, warum, wie ausprobieren.
9. Nach Schritt 6 anhalten und berichten. Nicht weiterbauen.

SCHRITTE
0  Nur Dokumente. K-33 (E1, E2, E8, E9) in STRATEGIE.md §9; T-24 (E4, E6, E7) in
   ARCHITEKTUR.md; I-neu (E3, E5) in INHALTSFORMAT.md. Neue Dateien
   docs/session/ABITUR-2029.md (Auftrag, Meilensteine unten, Stand) und
   docs/session/ABITUR-PROTOKOLL.md (merge=union in .gitattributes,
   tools/dokumente.test.ts anpassen). Strang in die Tabelle von
   SESSION-PROMPT.md eintragen: Code src/core/pruefung/, src/ui/pruefung/,
   content/mathematik/pruefung/, tools/pruefung/. VISION §6 um den Satz
   ergänzen, was "erzeugen" heißt. K-32 Punkt 2 und KLASSE-9-12.md anpassen.
1  Format aufgabenfamilie@1 in INHALTSFORMAT.md beschreiben, dann Typen und
   Prüfer bauen. Pflichtfelder: id, version, sachgebiet (Analysis, Geometrie,
   Stochastik), kurs (GK, LK), teil (A, B), hilfsmittel, sachverhalt (Text mit
   Platzhaltern), material (Graph, Tabelle, Figur aus dem vorhandenen
   SVG-Baukasten), parameter mit Bedingungen, teilaufgaben[] mit: nummer,
   operator, text, be, anforderungsbereich, erwartung[] (Schritt, Ergebnis,
   Teil-BE), alternativen[] (weitere anerkannte Lösungswege), review.
   Texte in der Sie-Form.
2  Prüfungsformate als Daten: abitur-gk, abitur-lk, realschule, je Jahrgang.
   Felder: Teile, Aufgabengruppen, Pflicht und Wahl, Sachgebiete je Platz,
   BE je Teil, Zeiten, Abgabefrist Teil A, Hilfsmittel, Notenskala,
   amtlich_bestaetigt, quelle. Dazu die reine Funktion
   stelleZusammen(format, familien, startwert) -> Prüfung, mit Tests: Platzregeln
   erfüllt, BE-Summe stimmt, keine Familie doppelt, deterministisch.
3  Rechenkern src/core/pruefung/rechnen/: exakte Brüche, Polynome (Wert,
   Ableitung, Stammfunktion, Nullstellen bis Grad 2 exakt und Grad 3 mit einer
   rationalen Nullstelle), bestimmtes Integral, Vektoren im Raum (Skalarprodukt,
   Kreuzprodukt, Gerade, Ebene, Abstand Punkt-Ebene), Binomialverteilung
   (einzeln und kumuliert, exakt als Bruch). Eigenschaftstests mit fast-check.
   Kein Gleitkomma in Ergebnissen, die gedruckt werden. e-Funktion und
   Normalverteilung: nur Schnittstelle und Rückfrage, noch nicht bauen.
4  Pilot Teil A Grundkurs: drei Familien, je eine je Sachgebiet, je 5 BE, je
   zwei bis drei Teilaufgaben, mindestens eine mit Operator "Begründen Sie"
   oder "Weisen Sie nach". Alle Tests aus Regel 6.
5  Pilot Teil B Grundkurs: eine Analysis-Familie mit gemeinsamem Sachverhalt,
   Funktion mit Parameter, vier bis fünf zusammenhängenden Teilaufgaben, davon
   eine im Anforderungsbereich III und eine "im Sachzusammenhang deuten".
   Erwartungshorizont mit Zwischenergebnissen und einem zweiten Lösungsweg.
6  Druck: tools/pruefung/lauf.ts erzeugt aus Format und Startwert drei
   HTML-Seiten mit Druck-CSS (A4, Logical Properties): Aufgaben, Erwartungshorizont,
   Bewertungsbogen mit Notenskala. Formeln als Text (KaTeX), kein html2canvas.
   Prüfwert in der Fußzeile. Texte in src/ui/texte/de.json mit Präfix "pruefung.".
   Noch keine Oberfläche in der App.

MEILENSTEINE (in ABITUR-2029.md eintragen, als Prüfpunkte, nicht als Zusagen)
02/2027 Schritte 0 bis 6. 08/2027 Teil A Grundkurs vollständig, Lehrkraft
gefunden. Sommer 2028 Stoff Jahrgang 11 und Realschulabschluss als Generalprobe.
Herbst 2028 Teil B GK und LK, erstes Probeabitur. 01/2029 Inhaltsstand
eingefroren, alles Stufe 3.

QUELLEN (aus den Verlagsleseproben abgelesen, nicht amtlich)
- Neue Struktur seit der Abiturprüfung 2024: Teil A hilfsmittelfrei mit zwei
  Aufgabengruppen, Teil B mit bis zu drei umfangreicheren Pflichtaufgaben aus
  zusammenhängenden Teilaufgaben, auch Sachgebiete vernetzend.
- Leistungskurs: 300 Minuten. Teil A Gruppe 1: vier Pflichtaufgaben (zwei
  Analysis, je eine Geometrie und Stochastik). Gruppe 2: sechs Aufgaben, zwei je
  Sachgebiet, zwei beliebige davon bearbeiten. Ab 2025: Teil A 30 BE, Teil B
  70 BE, Abgabe Teil A innerhalb der ersten 110 Minuten.
- Grundkurs: 255 Minuten, Teil A 25 BE, Teil B 55 BE, Abgabe Teil A innerhalb
  100 Minuten. Aufgabenzahl Teil A: aus docs/PRUEFUNGEN.md §3 übernehmen.
- Gruppe 1 deckt die Anforderungsbereiche I und II ab, Gruppe 2 erreicht in
  mindestens einer Teilaufgabe den Bereich III.
- Hilfsmittel beide Teile: Rechtschreibwörterbuch, Zeichengeräte. Nur Teil B:
  Formelsammlung des IQB und ein modulares Mathematiksystem ohne Netz (löst
  Gleichungen und Systeme, differenziert, integriert, rechnet mit Vektoren und
  Matrizen, Binomial- und Normalverteilung, Tabellen, Graphen). Bis
  einschließlich 2025 stattdessen grafikfähiger Taschenrechner.
- Notenskala bei 100 BE: 100-95 = 15 Punkte, 94-90 = 14, 89-85 = 13, 84-80 = 12,
  79-75 = 11, 74-70 = 10, 69-65 = 9, 64-60 = 8, 59-55 = 7, 54-50 = 6, 49-45 = 5,
  44-40 = 4, 39-33 = 3, 32-27 = 2, 26-20 = 1, 19-0 = 0. Skala bei 80 BE: aus
  docs/PRUEFUNGEN.md §3.
- Abzug: bei schwerwiegenden und gehäuften Verstößen gegen Sprache oder äußere
  Form je ein Punkt der einfachen Wertung.
- Operatoren, die in den Aufgaben vorkommen: Geben Sie an, Berechnen Sie,
  Bestimmen Sie, Zeigen Sie, Weisen Sie nach, Begründen Sie, Beurteilen Sie,
  Beschreiben Sie, Stellen Sie dar, Zeichnen Sie, Deuten Sie im
  Sachzusammenhang. Die amtliche Operatorenliste liegt nicht vor: Liste als
  vorläufig kennzeichnen.
- Realschulabschluss: Teil A 30 Minuten, etwa zehn kleine Aufgaben, nur
  Zeichengeräte. Teil B 210 Minuten, fünf Pflicht- und drei Wahlaufgaben, eine
  Wahlaufgabe ist zu lösen (je 8 BE), mit Taschenrechner und Formelsammlung.
- Alle Prüfungen siezen.

RÜCKFRAGEN AN DEN PV (im Abschlussbericht stellen, nicht selbst beantworten)
- OAVO, Verwaltungsvorschrift zur Abiturprüfung, Operatorenliste und
  Hilfsmittelhinweise des IQB beschaffen, damit amtlich_bestaetigt gesetzt
  werden kann.
- Wer gibt Aufgabenfamilien frei (Stufe 3)?
- Wie viele Familien je Platz gelten als genug, damit die offene Sammlung die
  Prüfung nicht vorhersagbar macht?
- e-Funktion und Normalverteilung im Rechenkern: selbst bauen oder Abhängigkeit?

ABSCHLUSS
Bericht: je Schritt PR-Nummer und "so probierst du es aus"; drei erzeugte
Beispielprüfungen (Teil A) als HTML im Scratchpad; was der Pilot über den
Aufwand je Familie zeigt (Stunden, Zeilen); offene Rückfragen.
````
