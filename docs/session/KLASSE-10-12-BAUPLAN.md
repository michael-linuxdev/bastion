# Bauplan Klasse 10 bis 12

> Auftrag des PV vom 03.11.2026: „Klasse 10 bis 12 in voller Tiefe vorbereiten für die nächste Sitzung.“ Diese Datei ist der **Arbeitsplan** dafür. Sie legt je Kompetenz fest, was gebaut wird, damit die nächste Sitzung ohne Vorarbeit anfangen kann.
> Gilt zusammen mit `docs/session/KLASSE-9-12.md` (Auftrag K-30, Phasen, Entscheidungen 1–15) und `docs/LEHRPLAN.md` §8f (Klasse 10, 22 Kompetenzen) und §8g (Jahrgangsstufen 11/12, 55 Kompetenzen). Strang **Lernkern**.
> **Noch nichts davon ist gebaut.** Die Datei ist ein Entwurf: Was hier steht, darf beim Bauen besser werden. Dann bitte hier nachtragen.

Stand: 03.11.2026 · 77 Kompetenzen geplant (Klasse 10: 22, Jgst. 11/12: 55, davon 7 nur LK) · Fragen an den PV beantwortet (§7), offen nur die genaue Rundungsregel aus den PDFs

---

## 0. Was „fertig“ heißt (je Kompetenz)

Wie in Klasse 9 (Entscheidung 12, „voll je Kompetenz“):

1. `kompetenz.yaml` mit G, M, E (Beschreibungen aus der Spalte E in `LEHRPLAN.md` §8f/§8g), `sachsen` mit Oberschule/Gymnasium bzw. Kurs, Voraussetzungen wie im Graph.
2. **Vorlagen** für G, M und E. E nach K-31-Muster als `<KOMPETENZ>.BEGRUENDEN` mit `aussagenGenerator`, wo es passt; sonst `ordnen` oder `fehler-finden`.
3. **Generatoren** mit Pflicht-Tests (INHALTSFORMAT §6.3): unabhängige Lösung aus den Platzhaltern, Grenzverletzungen, `mindestensVerschieden`.
4. **Erstvermittlung** (`vermittlung.yaml`, VERMITTLUNG §2): ziel → anknuepfen → entdecken → erklaeren → beispiel (mit Bild) → ergaenzen → gegenbeispiel → merksatz. Rückwege (`bei`) auf die Kompetenz oder ihre Voraussetzungen.
5. **Fehlvorstellungen** mit `kurz` (höchstens 35 Wörter), Rückweg und Kompetenzliste. Jedes Fehlerbild der Vorlagen hat eine.
6. **Zwischenschritte** (`schritte`, K-29) bei Aufgaben mit drei oder mehr Rechenschritten (hier markiert mit **ZS**).
7. Fachbegriffe in `begriffe.yaml`, dann `pnpm inhalte:begriffe`.
8. Grün: `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm -s inhalte:pruefen`, `pnpm -s fehlerschueler --grenze`, e2e. Alles bleibt **Stufe 0**.

**Erfahrung aus K-31 (gleich beachten):**
- Neue Generator-ID vorher prüfen: `grep -rq "'<id>'" src/generators`. Doppelte IDs brechen die Inhaltsprüfung.
- Feste Zählungen in Tests (Vorlagen je Kompetenz, „Niveau E fehlt“) bei neuen Vorlagen nachziehen: `tools/review/review.test.ts`, `tools/pruefbogen/arbeitsblatt.test.ts`, `tests/e2e/ueben.spec.ts`.
- Vor dem PR **`pnpm test` ganz** laufen lassen und **`pnpm build` vor e2e**. Lokal überschreiten Simulator und schwere Pflicht-Tests unter Last die Zeit, das ist bekannt.
- Rückweg einer Fehlvorstellung muss in der Kompetenz oder einer Voraussetzung liegen (Fehler-Schüler B). Wenn nicht: andere Fehlvorstellung wählen oder Voraussetzung ergänzen.
- Ein Fehlerbild, das ein Generator nie erzeugt, zählt als Fehler-Schüler A. Seltene Fälle mit Parametern absichern.

---

## 1. Reihenfolge und PR-Schnitt

Grundlage: Entscheidung 3 (zuerst, was das Abitur trägt) und 7 (B6, B7, B10 vor 11/12). Klasse 10 vor 11/12, weil 11/12 darauf aufbaut (FS.SYSTEMATIK, EX, LG, TF, ZG).

| Etappe | Inhalt | PRs | Bausteine vorher |
|---|---|---|---|
| **10-0** | B9: Klasse 10 wählbar (`KLASSEN`), Schulart beachten (OS hat kein LG, FS nur teilweise) | 1 | – |
| **10-0b** | `graph@1` um `exp`, `log`, `sin`, `cos` und Regler b erweitern; `dreieck@1` für beliebige Dreiecke | 2 | – |
| **10-1** | Feld EX (3) | 1 | – |
| **10-2** | Feld LG (3, nur GY) | 1 | – |
| **10-3** | Feld TF (3), mit Werkzeug **`einheitskreis@1`** | 2 (Werkzeug, Inhalte) | B8 |
| **10-4** | Feld AD (4) | 1 | `dreieck@1` reicht |
| **10-5** | Feld ZG (3), mit SVG-Baustein **`stabdiagramm`** | 1 | – |
| **10-6** | Feld FS (4) | 1 | – |
| **10-7** | KP.STUMPF, PZ.KREDIT (2) | 1 | – |
| **10-Ende** | Inhaltsdurchsicht Klasse 10, Fehler-Schüler, Vorschau für den PV | 1 | – |
| **11-0** | B9: Jgst. 11/12 wählbar, **Kurs GK/LK** (Einstellung), LK-Kompetenzen nur bei LK | 1 | – |
| **11-0b** | B10: `hilfsmittelfrei: true` je Vorlage, Pflicht-Test „ohne Rechner lösbar“ | 1 | – |
| **11-0c** | B7: SVG-Baustein `tabelle` (Wertetabelle, Vierfeldertafel, Binomialtabelle) mit Textbeschreibung | 1 | – |
| **11-1** | GW (3) | 1 | – |
| **11-2** | AB (7), mit Werkzeug **`sekante@1`** (Sekante wird Tangente) | 3 (Werkzeug, AB 1–4, AB 5–7) | B8 |
| **11-3** | KD (7) | 2 (KD 1–4, KD 5–7) | – |
| **11-4** | IN (6), mit Werkzeug **`streifen@1`** (Rechtecke unter der Kurve) | 2 | B8 |
| **11-5** | WS (5), mit SVG-Baustein **`baum`** und Werkzeug **`vierfelder@1`** | 2 | B7, B8 |
| **11-6** | BV (5) | 1 | B7 |
| **11-7** | BS (3), NV (2, LK) | 1 | – |
| **11-8** | B6: SVG-Baustein `raum3d` (feste Schrägbild-Ansicht) | 1 | – |
| **11-9** | MA (2), VK (3) | 1 | B6 |
| **11-10** | GE (6) | 1 | B6 |
| **11-11** | AW (6) | 1 | B6 |
| **11-Ende** | Inhaltsdurchsicht 11/12, dann Phase C (KI-Prüfung, zwei Durchgänge) | 2+ | – |

Etwa **37 PRs**. Jeder PR: ein Feld (oder ein Baustein), ein Commit je Feld, Protokollzeile, Kurzmeldung an den PV.

---

## 2. Bausteine (vor oder während der Inhalte)

| Baustein | Wofür | Umsetzung | Test |
|---|---|---|---|
| **B9a Klasse 10** | Klassenwahl, Gerade dran, Diagnose | `KLASSEN` um 10 erweitern; Kompetenzen mit `sachsen.oberschule: –` bei Schulart OS ausblenden | e2e: Klasse 10 wählbar; OS sieht LG nicht |
| **B9b Jgst. 11/12 und Kurs** | Abitur GK/LK | `KLASSEN` um 11 (für „11/12“); Einstellung `kurs: gk \| lk` neben der Schulart (kein Datenbankschema, Einstellung wie Schulart); `kompetenz.yaml` → `sachsen.gymnasium.kurs: [gk, lk]` oder `[lk]`; INHALTSFORMAT §3 nachtragen | Kern: LK-Kompetenz fehlt bei GK; e2e Kurswahl |
| **`graph@1` erweitern** | EX, LG, TF, FS, GW, AB, NV | Heute nur `gerade`, `parabel`, `potenz`, `wurzel`, `kubikwurzel` mit a, d, e. Neu: Arten `exp` (Basis als Parameter `basis`, auch e), `log`, `sin`, `cos`, `glocke` (μ, σ); Regler `b` für f(b·x) (Periode). Bestehende Bilder unverändert (Test) | werkzeuge.test.ts: alte Parameter geben dasselbe Bild |
| **`dreieck@1` erweitern** | AD | Heute immer rechtwinklig (`rechts`). Neu: `winkel: {alpha, beta}` für beliebige Dreiecke, Beschriftung von Winkeln | werkzeuge.test.ts |
| **B10 hilfsmittelfrei** | Teil A Abitur/RS | Vorlagenfeld `hilfsmittelfrei: true`, in der App als Kennzeichen „ohne Taschenrechner“ sichtbar (§7 Frage 2); Pflicht-Test: Lösung ganzzahlig oder Bruch mit Nenner ≤ 12 oder „schöner“ Wert aus fester Liste (√2, π, e, ln 2 …) | Pflicht-Test in `pflichttests.ts` (optional per Vorlage) |
| **B7 `tabelle`** | Wertetabellen, Verteilungen, Vierfeldertafel, kumulierte Binomialtabelle | SVG-Baustein in `svg.ts` + Feld `beschreibung` für Vorlesen (wie `bild`) | Snapshot und Lesbarkeit (Textlänge) |
| **`stabdiagramm`** | ZG, BV (Verteilung) | SVG wie `histogramm` mit Stäben statt Säulen; Wahrscheinlichkeiten an der Achse | Test: Stabhöhen = Werte |
| **`baum`** | ZF/WS: Baumdiagramm mit Pfadwahrscheinlichkeiten | SVG-Baustein; Wahrscheinlichkeiten als Text an den Ästen; später Eingabe an Ästen über `felder-eingabe` | Test: Summe je Knoten = 1 |
| **B6 `raum3d`** | VK, GE, AW, KP | Schrägbild-Achsen x (schräg, Verkürzung ½, 45°), y, z; Punkte, Strecken, Pfeile (Vektoren), Spurdreieck einer Ebene; feste Ansicht | Test: Projektion bekannter Punkte |
| **`einheitskreis@1`** (Werkzeug) | TF.BOGENMASS, TF.SINUS | Regler für den Winkel 0°–360° (Tastatur), Punkt auf dem Kreis, sin als senkrechte, cos als waagerechte Strecke, Bogenlänge als Zahl; Umschalter Grad/Bogenmaß | wie `graph@1`: werkzeuge.test.ts + e2e Bedienung per Tastatur |
| **`sekante@1`** (Werkzeug) | AB.AENDERUNGSRATE, AB.DEFINITION | Graph von f, Punkt P fest, Regler h; Sekante durch P und Q = (x₀+h, f(x₀+h)), Anstieg als Zahl; bei h → 0 nähert sich die Tangente | werkzeuge.test.ts |
| **`streifen@1`** (Werkzeug) | IN.BESTAND, IN.BESTIMMT | Regler n (Zahl der Streifen 1–50), Unter- und Obersumme als Zahl, Fläche schraffiert | werkzeuge.test.ts |
| **`vierfelder@1`** (Werkzeug) | WS.VIERFELDER, WS.BEDINGT | Vierfeldertafel und Baum nebeneinander, Antippen einer Zelle markiert den Pfad | werkzeuge.test.ts |

Nicht bauen (Bedarfsliste B4, B12): Eingabe exakter Terme und Termumformungsprüfung. Ableitungen und Stammfunktionen als **Koeffizientenfelder** (`felder-eingabe`) oder `auswahl`.

---

## 3. Konventionen für 10–12

- **Ordner:** `content/mathematik/<bereich>/<feld>/<KOMPETENZ>/` mit den Feldnamen aus §8f/§8g: `exponentialfunktionen`, `logarithmus`, `trigonometrische-funktionen`, `funktionen-systematisch`, `zufallsgroessen`, `allgemeine-dreiecke`; `grenzwerte`, `ableitungen`, `kurvendiskussion`, `integralrechnung`, `matrizen`, `vektoren`, `geraden-und-ebenen`, `abstaende-und-winkel`, `mehrstufige-zufallsversuche`, `binomialverteilung`, `normalverteilung`, `beurteilende-statistik`. KP.STUMPF zu `koerper` (GM), PZ.KREDIT zu `prozent-und-zins`.
- **Generatoren:** `src/generators/mathematik/<feld>/…`, ID-Präfix wie das Feld klein (`ex.`, `lg.`, `tf.`, `fs.`, `zg.`, `ad.`, `gw.`, `ab.`, `kd.`, `in.`, `ma.`, `vk.`, `ge.`, `aw.`, `ws.`, `bv.`, `nv.`, `bs.`). Vorhandene Präfixe prüfen: `kp.`, `pz.` gibt es schon.
- **Fehlvorstellungen:** `FV.<FELD>.<NAME>`; alte nutzen, wo sie passen (Liste je Feld unten, „vorhanden“).
- **Zahlen:** `$…$` mit KaTeX, Dezimalkomma `{,}`, gerundete Ergebnisse mit `runden` (B3). Teil-A-Vorlagen (hilfsmittelfrei) nur mit schönen Zahlen.
- **E-Vorlagen:** `aussagenGenerator` (Situation, richtig mit Begründung, 2–3 falsch mit Fehlerbild). Für „Schritte ordnen“ Typ `ordnen`.
- **Niveaus im Kurs:** Bei 11/12 ist E zuerst der LK-Anteil (Entscheidung 2). Eine Kompetenz, die nur LK ist, braucht trotzdem G, M und E.

---

## 4. Klasse 10 (22 Kompetenzen)

Legende: **Typ** z = `zahl-eingabe`, a = `auswahl`, f = `felder-eingabe`, b = `bild-auswahl`, bz = `bild-zahl`, o = `ordnen`. **ZS** = mit Zwischenschritten. **HF** = hilfsmittelfrei-fähig.

### 4.1 Feld EX – Exponentielles Wachstum (`strukturen-und-funktionaler-zusammenhang/exponentialfunktionen`)

| Kompetenz | G | M | E |
|---|---|---|---|
| **M.SF.EX.WACHSTUM** | a: Tabelle (4 Werte) → „linear / exponentiell“; `ex.wachstum-art` (Start 10–500, Zuwachs +d oder ·q, q ∈ {1,5; 2; 3; 0,5}) | z: Wachstumsfaktor aus Prozent (+p % → q = 1 + p/100) und n-ter Wert rekursiv/explizit; `ex.faktor` **ZS** | `ex.modell-aussage`: „Gleiche Differenzen → linear, gleiche Quotienten → exponentiell“ begründen |
| **M.SF.EX.FUNKTION** | b: Graph zu y = c·aˣ wählen (a ∈ {2, 3, ½, ⅓}, c ∈ {1, 2, 3}); `ex.graph-waehlen` (Kurven mit B5) | a: Eigenschaften (Schnitt mit y-Achse = c, steigend/fallend, Asymptote y = 0, kein Nullpunkt); `ex.eigenschaft` | `ex.asymptote-aussage`: „Der Graph schneidet die x-Achse irgendwann“ widerlegen |
| **M.SF.EX.SACH** | z: Bestand nach n Jahren (B3 runden); `ex.bestand` | z: Verdopplungs- und Halbwertszeit aus Tabelle oder q (n mit qⁿ = 2 durch Probieren in ganzen Jahren); `ex.verdopplung` **ZS** | `ex.modellgrenze-aussage`: „Das Modell gilt auch in 100 Jahren?“ (Sättigung) |

**Fehlerbilder → FV:** additiv statt multiplikativ → **FV.EX.LINEAR-STATT-EXP** (neu); q = p statt 1 + p/100 → **FV.EX.FAKTOR-PROZENT** (neu, Rückweg PZ.ZINS); Abnahme mit q = 1 + p/100 → **FV.EX.ABNAHME-FAKTOR** (neu); Hochzahl mal Basis (aⁿ = a·n) → FV.NZ.HOCHZAHL-MAL (vorhanden); Asymptote als Nullstelle → **FV.EX.ASYMPTOTE** (neu); c·aˣ = (c·a)ˣ → **FV.EX.FAKTOR-IN-POTENZ** (neu, Rückweg PW.GESETZE).
**Erstvermittlung:** Einstieg Zinseszins (PZ.ZINS) vs. Taschengeld + 5 € je Monat; Bild `graph@1` mit Regler a (bei a < 1 fallend), Vergleichsgerade gestrichelt. Merksatz: „Linear: immer plus d. Exponentiell: immer mal q.“
**Begriffe:** Wachstumsfaktor, Exponentialfunktion, Asymptote, Verdopplungszeit, Halbwertszeit, rekursiv, explizit.

### 4.2 Feld LG – Logarithmus und Umkehrfunktionen (`…/logarithmus`, nur GY)

| Kompetenz | G | M | E |
|---|---|---|---|
| **M.SF.LG.UMKEHRFUNKTION** | b: Graph der Umkehrfunktion durch Spiegeln an y = x wählen (lineare f); `lg.spiegeln` | f: Umkehrfunktion von y = m·x + n als Koeffizienten (y = □·x + □, Brüche erlaubt); `lg.umkehr-linear` **ZS** | `lg.umkehrbar-aussage`: „y = x² ist umkehrbar“ – nur für x ≥ 0 |
| **M.ZO.LG.LOGARITHMUS** | z: log_b(bⁿ) mit b ∈ {2, 3, 5, 10}, n ∈ −3…6 **HF**; `lg.wert` | z: Logarithmengesetze: log(a·b), log(aⁿ), log(a/b) auf bekannte Werte zurückführen **HF**; `lg.gesetze` | `lg.summe-aussage`: Fehler „log(a + b) = log a + log b“ finden |
| **M.SF.LG.GLEICHUNGEN** | z: aˣ = b mit b = aⁿ (ganzzahlig) **HF**; `lg.gleichung-ganz` | z: aˣ = b mit Logarithmus (runden auf 2 Stellen), auch c·aˣ = b; `lg.gleichung` **ZS** | `lg.ln-aussage`: „ln x ist für x ≤ 0 definiert“ – aus eˣ > 0 begründen |

**Fehlerbilder → FV:** log b(a) mit Basis und Argument vertauscht → **FV.LG.BASIS-ARGUMENT** (neu); log(a+b) = log a + log b → **FV.LG.SUMME** (neu); log(aⁿ) = (log a)ⁿ → **FV.LG.POTENZ** (neu); aˣ = b ⇒ x = b/a → **FV.LG.TEILEN-STATT-LOG** (neu, Rückweg LG.LOGARITHMUS); Umkehrfunktion als Kehrwert 1/f → **FV.LG.UMKEHR-KEHRWERT** (neu); an x-Achse statt an y = x gespiegelt → **FV.LG.SPIEGELACHSE** (neu).
**Erstvermittlung:** „Wie oft muss ich 2 malnehmen, um 32 zu bekommen?“ → log₂ 32 = 5. Bild: `graph@1` mit y = 2ˣ, y = log₂ x und y = x gestrichelt.
**Begriffe:** Logarithmus, Basis (vorhanden?), Umkehrfunktion, natürlicher Logarithmus, Eulersche Zahl.

### 4.3 Feld TF – Periodische Vorgänge und Sinusfunktion (`…/trigonometrische-funktionen`)

| Kompetenz | G | M | E |
|---|---|---|---|
| **M.SF.TF.BOGENMASS** | z: Grad → Bogenmaß als Vielfaches von π (30°, 45°, 60°, 90°, 120°, 180°, 270°) **HF** (auswahl mit π-Brüchen); `tf.bogenmass` | z: sin/cos am Einheitskreis für Winkel über 90° mit Vorzeichen (Quadrant); `tf.einheitskreis` (Bild aus `einheitskreis@1` als SVG) | `tf.quadrant-aussage`: „sin 150° = sin 30°“ begründen (Symmetrie) |
| **M.SF.TF.SINUS** | b: Graph sin oder cos erkennen; a: Periode, Nullstellen, Max/Min ablesen; `tf.eigenschaft` | f: Nullstellen in [0; 2π] als Vielfache von π (zwei Felder) **HF**; `tf.nullstellen` | `tf.periode-aussage`: Symmetrie und Periodizität (sin(x + 2π) = sin x) |
| **M.SF.TF.PARAMETER** | a: Amplitude a aus Graph oder Term; `tf.amplitude` (OS: nur a, b) | z: Periode 2π/b bzw. 360°/b aus b und umgekehrt; c, d nur GY (Parameter `gy: true`); `tf.periode` | `tf.periode-b-aussage`: Fehler „Periode = b“ finden |

**Fehlerbilder → FV:** Grad und Bogenmaß vermischt → FV.TR.BOGENMASS (vorhanden); π als 180 gerechnet in Zahlwert → **FV.TF.PI-180** (neu); Vorzeichen im 2./3. Quadranten → **FV.TF.VORZEICHEN-QUADRANT** (neu); sin und cos am Kreis vertauscht → **FV.TF.SIN-COS** (neu, Rückweg TR.BEGRIFFE); Periode = b → **FV.TF.PERIODE-B** (neu); Amplitude = Abstand Max–Min → **FV.TF.AMPLITUDE** (neu); Verschiebung c in falsche Richtung → FV.PF.VERSCHIEBUNG-RICHTUNG (vorhanden).
**Erstvermittlung:** Riesenrad (Höhe einer Gondel über die Zeit); Werkzeug `einheitskreis@1` und `graph@1` (Regler a, b, bei GY auch c, d). Braucht die Erweiterung von `graph@1` (Etappe 10-0b).
**Begriffe:** Bogenmaß, Einheitskreis, Periode, Amplitude, Sinusfunktion, Kosinusfunktion.

### 4.4 Feld AD – Allgemeine Dreiecke (`raum-und-form/allgemeine-dreiecke`, GM bei FLAECHE)

| Kompetenz | G | M | E |
|---|---|---|---|
| **M.RF.AD.SINUSSATZ** | z: fehlende Seite (WSW/SWW) mit Sinussatz, Bild `dreieck@1`; `ad.sinussatz-seite` | z: fehlender Winkel (SsW, Winkel gegenüber größerer Seite) **ZS**; `ad.sinussatz-winkel` | `ad.ssw-aussage`: „zwei mögliche Dreiecke“ erkennen (sin α = 0,5 → 30° oder 150°) |
| **M.RF.AD.KOSINUSSATZ** | z: dritte Seite (SWS) **ZS**; `ad.kosinussatz-seite` | z: Winkel aus drei Seiten (SSS) **ZS**; `ad.kosinussatz-winkel` | `ad.pythagoras-aussage`: Kosinussatz bei γ = 90° → Pythagoras |
| **M.GM.AD.FLAECHE** | z: A = ½·a·b·sin γ; `ad.flaeche` | z: Vieleck in Dreiecke zerlegt (Viereck mit Diagonale) **ZS**; `ad.flaeche-vieleck` | o: Herleitung aus A = ½·g·h ordnen (h = b·sin γ) |
| **M.RF.AD.SACH** | z: Vermessung (Turmhöhe mit zwei Winkeln, Flussbreite); `ad.vermessung` **ZS** | z: Pyramide/Kegel mit Satz wählen (Kantenwinkel); `ad.koerper` **ZS** | `ad.plan-aussage`: Welcher Satz zuerst? (SWS → Kosinussatz) |

**Fehlerbilder → FV:** falsches Seiten-Winkel-Paar → **FV.AD.PAAR** (neu); zweite Lösung beim SsW übersehen → **FV.AD.SSW-ZWEI** (neu, Rückweg DV.KONSTRUIEREN Kl. 6); Vorzeichen im Kosinussatz (+2ab cos γ) → **FV.AD.KOSINUS-VORZEICHEN** (neu); ½ vergessen → FV.FL.NICHT-HALBIERT (vorhanden); Satz wählen falsch → **FV.AD.SATZ-WAHL** (neu); Taschenrechner auf RAD → FV.TR.BOGENMASS (vorhanden).
**Erstvermittlung:** „Pythagoras gilt nur rechtwinklig – was nun?“ Bild `dreieck@1` mit beliebigen Winkeln (Erweiterung aus Etappe 10-0b).
**Begriffe:** Sinussatz, Kosinussatz, Kongruenzsatz (vorhanden), Vermessung.

### 4.5 Feld ZG – Zufallsgrößen (`daten-und-zufall/zufallsgroessen`)

| Kompetenz | G | M | E |
|---|---|---|---|
| **M.DZ.ZG.VERTEILUNG** | f: Verteilung beim Würfeln mit zwei Würfeln (Augensumme oder Anzahl Sechsen) ergänzen; `zg.verteilung` (Tabelle B7, Stabdiagramm) | z: P(X ≥ k), P(X ≤ k) aus Tabelle; `zg.kumuliert` | `zg.mindestens-aussage`: „mindestens eins“ über Gegenereignis |
| **M.DZ.ZG.ERWARTUNG** | z: Erwartungswert aus Tabelle (3–4 Werte, schöne Zahlen); `zg.erwartung` | z: Glücksspiel: Gewinn − Einsatz, fair? (a); `zg.fair` **ZS** | `zg.chance-gewinn-aussage`: „höhere Gewinnchance = höherer Erwartungswert“ widerlegen |
| **M.DZ.ZG.STREUUNG** (nur GY) | z: Varianz aus Tabelle (schöne Zahlen); `zg.varianz` **ZS** | z: Standardabweichung (runden); `zg.standardabweichung` | `zg.risiko-aussage`: zwei Spiele, gleicher E, verschiedene σ |

**Fehlerbilder → FV:** Erwartungswert = Mittel der Werte ohne Gewichte → **FV.ZG.UNGEWICHTET** (neu, Rückweg ST.MITTELWERTE); Summe der Wahrscheinlichkeiten ≠ 1 nicht bemerkt → **FV.ZG.SUMME-EINS** (neu); Einsatz nicht abgezogen → **FV.ZG.EINSATZ** (neu); Varianz ohne Quadrat → **FV.ZG.VARIANZ-QUADRAT** (neu); σ = Varianz → **FV.ZG.WURZEL** (neu); Gegenereignis → FV.ZF.GEGENEREIGNIS (vorhanden); P(X ≥ k) mit Grenze k − 1 vertauscht → **FV.ZG.GRENZE** (neu, auch für BV).
**Erstvermittlung:** Glücksrad mit 1 €, 2 €, 5 €: „Was gewinne ich im Schnitt pro Spiel?“ Bild `stabdiagramm`.
**Begriffe:** Zufallsgröße, Wahrscheinlichkeitsverteilung, Erwartungswert, faires Spiel, Varianz, Standardabweichung.

### 4.6 Feld FS – Funktionen systematisch (`…/funktionen-systematisch`)

| Kompetenz | G | M | E |
|---|---|---|---|
| **M.SF.FS.SYSTEMATIK** | b: Graph zu Term (x, x², √x, 1/x, eˣ, ln x, sin x; OS ohne ln); `fs.zuordnen` | a: Eigenschaft je Funktion (D, W, Symmetrie, Nullstelle); `fs.eigenschaft` | `fs.klasse-aussage`: „Jede Potenzfunktion geht durch (1\|1)“ – stimmt; „… durch (0\|0)“ – Gegenbeispiel 1/x |
| **M.SF.FS.TRANSFORMATION** (GY) | a: Wirkung von f(x) + c, c·f(x), f(x + c), f(c·x) benennen; `fs.wirkung` | f: Term aus verschobenem/gestrecktem Graph (zwei Parameter); `fs.term-aus-graph` | o: Reihenfolge der Abbildungen bei y = 2·f(x − 1) + 3 ordnen |
| **M.SF.FS.VERKNUEPFEN** (GY) | a: innere und äußere Funktion von f(g(x)) benennen; `fs.verkettung` | z: f(g(a)) und g(f(a)) berechnen **HF**; `fs.verkettung-wert` | `fs.luecke-aussage`: Definitionslücke von f/g bei g = 0 |
| **M.SF.FS.FOLGEN** (GY) | z: n-tes Glied explizit und rekursiv (arithmetisch/geometrisch); `fs.folge-glied` | a: monoton/beschränkt, Grenzwert anschaulich (1/n, (−1)ⁿ, 2ⁿ); `fs.folge-eigenschaft` | `fs.konvergent-aussage`: „beschränkt, also konvergent?“ – Gegenbeispiel (−1)ⁿ |

**Fehlerbilder → FV:** Verschiebung f(x + c) in falsche Richtung → FV.PF.VERSCHIEBUNG-RICHTUNG (vorhanden); f(c·x) wie c·f(x) → **FV.FS.STRECKUNG-X** (neu); Verkettung als Produkt → **FV.FS.VERKETTUNG-PRODUKT** (neu); innere/äußere vertauscht → **FV.FS.INNEN-AUSSEN** (neu); Definitionsbereich √x, ln x → FV.PF.WURZEL-DEFINITION (vorhanden), **FV.FS.LN-DEFINITION** (neu); rekursiv/explizit Index um 1 verschoben → **FV.FS.INDEX** (neu); beschränkt ⇒ konvergent → **FV.FS.BESCHRAENKT-KONVERGENT** (neu).
**Erstvermittlung:** „Steckbrief“ je Grundfunktion mit `graph@1` (Funktionsart wählbar). Für FOLGEN: Treppe aus Punkten (B5 Punkte).
**Begriffe:** Verkettung, innere Funktion, äußere Funktion, Zahlenfolge, Grenzwert, beschränkt, monoton.

### 4.7 KP.STUMPF und PZ.KREDIT

| Kompetenz | G | M | E |
|---|---|---|---|
| **M.GM.KP.STUMPF** (nur OS) | z: Volumen Pyramidenstumpf als Differenz zweier Pyramiden (Maße gegeben) **ZS**; `kp.stumpf-differenz` | z: Formel V = h/3·(G + √(G·D) + D), Kegelstumpf, Masse **ZS**; `kp.stumpf-formel` | `kp.stumpf-aussage`: „Stumpf = halbe Pyramide“ widerlegen |
| **M.ZO.PZ.KREDIT** | z: Kontostand Sparplan nach n Jahren (jährliche Einzahlung, Tabelle) **ZS**; `pz.sparplan` | z: Restschuld bei Ratentilgung (1–3 Jahre, Tabelle) **ZS**; `pz.tilgung` | `pz.effektiv-aussage`: zwei Angebote, versteckte Gebühr → höherer Effektivzins |

**Fehlerbilder → FV:** Deckfläche vergessen → FV.KP.FLAECHEN-VERGESSEN (vorhanden); Stumpf als Prisma (G·h) → **FV.KP.STUMPF-PRISMA** (neu); Ähnlichkeit linear statt Volumen ·k³ → FV.AE.* (vorhanden, prüfen); Zinsen nur auf erste Einzahlung → **FV.PZ.SPARPLAN** (neu); Tilgung = Rate (Zinsanteil vergessen) → **FV.PZ.TILGUNG-ZINS** (neu); nur Zinssatz verglichen → **FV.PZ.EFFEKTIV** (neu).

---

## 5. Jahrgangsstufen 11/12 (55 Kompetenzen)

Alle mit `klassenstufe_typisch: [11, 12]`, `sachsen.gymnasium.kurs` (B9b). Teil-A-Vorlagen mit `hilfsmittelfrei: true` (B10), wo die Spalte **HF** steht.

### 5.1 Feld GW – Grenzwerte und Stetigkeit (`…/grenzwerte`)

| Kompetenz | G | M | E |
|---|---|---|---|
| **M.SF.GW.UNENDLICH** | a: lim für x → ±∞ von Polynom, gebrochenrational (Grad vergleichen), eˣ, e⁻ˣ **HF**; `gw.unendlich` | z: waagerechte Asymptote y = a/b (gleicher Grad) **HF**; `gw.asymptote` | LK: schiefe Asymptote aus Polynomdivision (f, zwei Koeffizienten); `gw.schief` |
| **M.SF.GW.STELLE** | z: Grenzwert durch Einsetzen oder Kürzen ((x² − a²)/(x − a)) **HF**; `gw.stelle` **ZS** | a: Polstelle oder hebbare Lücke unterscheiden; `gw.pol-luecke` | `gw.seitig-aussage`: links- und rechtsseitig verschieden (1/x bei 0) |
| **M.SF.GW.STETIGKEIT** | a: stetig an x₀? (Graph mit Sprung, Lücke, Knick) – b; `gw.stetig-bild` | a: abschnittsweise Funktion, Werte links/rechts vergleichen; `gw.stetig-abschnitt` | LK: Parameter wählen, damit stetig (f); `gw.stetig-parameter` |

**FV (neu):** **FV.GW.GRAD** (höchste Potenz falsch verglichen), **FV.GW.NULL-DURCH-NULL** („0/0 = 0“ oder „= 1“), **FV.GW.POL-LUECKE** (jede Nullstelle des Nenners = Pol), **FV.GW.EINSEITIG** (ein Grenzwert reicht), **FV.GW.KNICK-UNSTETIG** (Knick = unstetig). Vorhanden: FV.QF.* für Faktorisieren.
**Erstvermittlung:** „Was passiert mit 1/x, wenn x sehr groß wird?“ Wertetabelle (B7) und `graph@1` mit Asymptote gestrichelt.
**Begriffe:** Grenzwert (vorhanden aus FS), Asymptote, Polstelle, hebbare Definitionslücke, stetig, abschnittsweise definiert.

### 5.2 Feld AB – Ableitungen (`…/ableitungen`)

| Kompetenz | G | M | E |
|---|---|---|---|
| **M.SF.AB.AENDERUNGSRATE** | z: mittlere Änderungsrate aus zwei Punkten/Tabelle; `ab.mittlere` | bz: lokale Änderungsrate als Tangentenanstieg am Graphen ablesen (Raster); `ab.tangente-ablesen` | LK: lineare Näherung f(x₀ + h) ≈ f(x₀) + f′(x₀)·h; sonst `ab.mittlere-lokale-aussage` |
| **M.SF.AB.DEFINITION** | o: Schritte der h-Methode für f(x) = x² ordnen; Vorlage `ordnen` | f: Differenzenquotient von a·x² + b·x vereinfachen (Koeffizienten vor h) **HF**; `ab.h-methode` **ZS** | LK: f(x) = aˣ (Grenzwert als gegebener Wert); `ab.definition-aussage` |
| **M.SF.AB.REGELN** | f: f′(x) = □·x^□ für a·xⁿ **HF**; `ab.potenz` | f: Polynom bis Grad 4 (Koeffizientenfelder), auch √x und 1/x als Potenz **HF**; `ab.polynom` | o/`ab.regel-aussage`: Faktorregel begründen |
| **M.SF.AB.SPEZIELL** | a: Ableitung von eˣ, ln x, sin x, cos x zuordnen **HF**; `ab.speziell` | z: f′(x₀) für a·eˣ + b·sin x an schönen Stellen **HF**; `ab.speziell-wert` | `ab.graph-bestaetigen-aussage`: Anstieg von sin bei 0 ist 1 = cos 0 |
| **M.SF.AB.KETTE-PRODUKT** | f: Kettenregel (a·x + b)ⁿ, e^(kx) **HF**; `ab.kette` | a: Produktregel x·eˣ, x²·sin x (Ergebnisse als Auswahl) **HF**; `ab.produkt` | `ab.innere-aussage`: Fehler „innere Ableitung vergessen“ finden |
| **M.SF.AB.TANGENTE** | f: Tangente y = m·x + n in x₀ (Polynom Grad 2–3) **HF**; `ab.tangente` **ZS** | z: Berührpunkt zu gegebenem Anstieg (f′(x) = m lösen) **HF**; `ab.beruehrpunkt` **ZS** | LK: Tangente von P außerhalb (Ansatz auswählen); `ab.tangente-aussen-aussage` |
| **M.SF.AB.GRAPH** | b: Graph von f′ zu f wählen (Parabel ↔ Gerade, kubisch ↔ Parabel); `ab.graph-ableitung` | b: Graph von f zu f′ wählen; `ab.graph-stamm` | `ab.graph-aussage`: „f′ hat Nullstelle bei 2, also hat f dort ein Maximum“ – nur mit Vorzeichenwechsel |

**FV (neu):** **FV.AB.MITTEL-LOKAL** (mittlere statt lokale Rate), **FV.AB.H-NULL-ZU-FRUEH** (h = 0 vor dem Kürzen), **FV.AB.HOCHZAHL** (Hochzahl nicht um 1 vermindert / mal statt Faktor), **FV.AB.KONSTANTE** (Ableitung der Konstanten ≠ 0), **FV.AB.INNERE** (innere Ableitung vergessen), **FV.AB.PRODUKT** ((u·v)′ = u′·v′), **FV.AB.TANGENTE-PUNKT** (f′(x₀) als y-Wert genommen), **FV.AB.GRAPH-WERT** (f′ zeigt die Werte von f statt den Anstieg), **FV.AB.SIN-COS** (Vorzeichen bei cos′ = −sin). Vorhanden: FV.PW.* für Potenzen, FV.FK.ANSTIEG-* prüfen.
**Erstvermittlung:** Werkzeug `sekante@1`: Sekante wird Tangente. Beispiel: Geschwindigkeit eines Radfahrers aus dem Weg-Zeit-Graphen.
**Begriffe:** Änderungsrate, Sekante, Tangente, Differenzenquotient, Differentialquotient, Ableitung, Ableitungsfunktion, Kettenregel, Produktregel, Normale.

### 5.3 Feld KD – Funktionen untersuchen (`…/kurvendiskussion`)

| Kompetenz | G | M | E |
|---|---|---|---|
| **M.SF.KD.EIGENSCHAFTEN** | a: Definitionsbereich in Intervallschreibweise (√, 1/(x − a), ln) **HF**; `kd.definition` | a: Symmetrie (gerade/ungerade Potenzen), Nullstellen faktorisierter Polynome (f) **HF**; `kd.symmetrie`, `kd.nullstellen` | LK: alle Asymptoten; `kd.symmetrie-aussage` (f(−x) = f(x) allgemein) |
| **M.SF.KD.MONOTONIE** | a: Monotoniebereich aus Vorzeichen von f′ (Tabelle/Graph); `kd.monotonie-bild` | a: Intervalle aus f′ (Parabel) berechnen **HF**; `kd.monotonie` **ZS** | `kd.umkehrung-aussage`: „f steigend ⇒ f′ > 0“ – Gegenbeispiel x³ bei 0 |
| **M.SF.KD.EXTREMA** | f: Extremstelle(n) von Polynom Grad 3 (f′ = 0) **HF**; `kd.extremstelle` **ZS** | f: Extrempunkt mit Art (Hoch/Tief) über f″ oder VZW **HF**; `kd.extrempunkt` **ZS** | `kd.notwendig-aussage`: f′(0) = 0 bei x³ ist kein Extremum |
| **M.SF.KD.WENDEPUNKT** | z: Wendestelle von Polynom Grad 3 **HF**; `kd.wendestelle` | f: Wendetangente **HF**; `kd.wendetangente` **ZS** | `kd.sattel-aussage`: Sattelpunkt (f′ = 0 und f″ = 0 mit VZW) |
| **M.SF.KD.REKONSTRUKTION** | a: Bedingungen aus Text zuordnen („Hochpunkt bei (2\|3)“ → f(2) = 3, f′(2) = 0); `kd.bedingung` | f: Parabel/kubisch aus 2–3 Bedingungen (LGS lösen, B2) **ZS**; `kd.rekonstruktion` | `kd.bedingungen-aussage`: zu wenig Bedingungen für Grad 3 |
| **M.SF.KD.EXTREMWERT** | z: Rechteck unter Parabel / Zaun mit fester Länge (Hauptbedingung gegeben) **ZS**; `kd.extremwert-zaun` | z: Haupt- und Nebenbedingung aufstellen (Dose: Oberfläche bei festem Volumen, Ergebnis gerundet) **ZS**; `kd.extremwert-dose` | LK: Randwerte prüfen (Maximum am Rand); `kd.rand-aussage` |
| **M.SF.KD.SCHAREN** | z: Extremstelle in Abhängigkeit von a für feste Werte a ∈ {1, 2, 3}; `kd.schar-wert` | a: Parameter, für den f_a eine Eigenschaft hat (Nullstelle bei 1, Tiefpunkt auf x-Achse) **HF**; `kd.schar-parameter` | LK: Ortskurve der Tiefpunkte (Auswahl); `kd.ortskurve` |

**FV (neu):** **FV.KD.INTERVALL** (offene/geschlossene Grenze), **FV.KD.SYMMETRIE-KONSTANTE** (konstanter Summand zerstört Achsensymmetrie nicht – Verwechslung), **FV.KD.NOTWENDIG-HINREICHEND** (f′ = 0 reicht), **FV.KD.ART-VERTAUSCHT** (f″ > 0 als Hochpunkt), **FV.KD.Y-VERGESSEN** (nur Stelle statt Punkt), **FV.KD.BEDINGUNG** (Hochpunkt nur f′ = 0, f(x) vergessen), **FV.KD.RANDWERT** (Randmaximum übersehen), **FV.KD.NEBENBEDINGUNG** (Hauptbedingung mit zwei Variablen abgeleitet). Vorhanden: FV.QF.* (Lösungsformel), FV.GS.* (LGS).
**Erstvermittlung:** „Steckbrief einer Achterbahn“: f, f′, f″ untereinander (B5, drei Kurven). Zwischenschritte sind hier besonders wichtig.
**Begriffe:** Monotonie, Extrempunkt, Hochpunkt, Tiefpunkt, Wendepunkt, Sattelpunkt, notwendige Bedingung, hinreichende Bedingung, Krümmung, Nebenbedingung, Funktionenschar, Ortskurve.

### 5.4 Feld IN – Integralrechnung (`…/integralrechnung`)

| Kompetenz | G | M | E |
|---|---|---|---|
| **M.SF.IN.STAMMFUNKTION** | f: Stammfunktion von a·xⁿ (Koeffizient, Hochzahl) **HF**; `in.potenz` | a: Stammfunktion von eˣ, 1/x, sin x, cos x, Summen **HF**; `in.speziell` | LK: lineare Substitution e^(2x+1), sin(3x) **HF**; `in.substitution` |
| **M.SF.IN.BESTAND** | z: Bestand aus konstanten Raten (Treppenfunktion, Fläche als Rechtecke); `in.bestand-treppe` | z: Bilanz mit Zu- und Abfluss (Fläche oberhalb/unterhalb) am Graphen; `in.bilanz` | LK: Integral als Weg aus Geschwindigkeit; `in.bilanz-aussage` |
| **M.SF.IN.BESTIMMT** | z: ∫ von a bis b für Polynom Grad ≤ 2 **HF**; `in.bestimmt` **ZS** | z: Wert aus dem Graphen einer Stammfunktion F(b) − F(a) (Raster) **HF**; `in.aus-F` | `in.vorzeichen-aussage`: negatives Integral ≠ negative Fläche |
| **M.SF.IN.FLAECHE** | z: Fläche zwischen Graph und x-Achse ohne Vorzeichenwechsel **HF**; `in.flaeche` **ZS** | z: Fläche mit Nullstelle im Intervall (aufteilen) oder zwischen zwei Graphen **ZS**; `in.flaeche-zwei` | LK: unbegrenzte Fläche (∫ 1/x² bis ∞) **HF**; `in.uneigentlich` |
| **M.SF.IN.INTEGRALFUNKTION** (LK) | a: Integralfunktion I(x) = ∫₀ˣ f: Wert I(0), Vorzeichen; `in.integralfunktion` | b: Graph von I zu f wählen; `in.integralfunktion-bild` | `in.integralfunktion-aussage`: Extrema von I bei Nullstellen von f |
| **M.SF.IN.ROTATION** (LK) | z: Volumen bei Rotation von f(x) = c (Zylinder) und f(x) = m·x (Kegel) **HF**; `in.rotation-einfach` | z: Rotation von √x, x² auf [0; a] **HF**; `in.rotation` **ZS** | o: Kegelvolumen herleiten (Schritte ordnen) |

**FV (neu):** **FV.IN.STAMM-ABLEITUNG** (abgeleitet statt aufgeleitet), **FV.IN.HOCHZAHL-TEILEN** (nicht durch n + 1 geteilt), **FV.IN.GRENZEN-VERTAUSCHT** (F(a) − F(b)), **FV.IN.FLAECHE-VORZEICHEN** (Integral über Nullstelle = Fläche), **FV.IN.BETRAG-ZU-FRUEH**, **FV.IN.KONSTANTE** (+C bei Stammfunktion verschwiegen – nur als Hinweis), **FV.IN.INNERE** (bei Substitution nicht durch k geteilt), **FV.IN.PI-ROTATION** (π oder Quadrat vergessen).
**Erstvermittlung:** Werkzeug `streifen@1`: Wasser fließt in ein Becken, Zuflussrate als Graph, Rechtecke werden schmaler.
**Begriffe:** Stammfunktion, Integral, bestimmtes Integral, Integrand, Hauptsatz, Integralfunktion, Rotationskörper, Bilanz.

### 5.5 Feld MA – Matrizen und Gleichungssysteme (`zahl-und-operation/matrizen`)

| Kompetenz | G | M | E |
|---|---|---|---|
| **M.ZO.MA.LGS** | f: LGS 3×3 in Dreiecksform rückwärts lösen **HF**; `ma.rueckwaerts` | f: Gauß-Verfahren 3×3 mit ganzzahliger Lösung **HF**; `ma.gauss` **ZS** | LK: Lösbarkeitsfälle (Nullzeile → unendlich viele, Widerspruch → keine); `ma.faelle-aussage` |
| **M.ZO.MA.MULTIPLIZIEREN** | f: 2×2-Matrix mal Vektor **HF**; `ma.mal-vektor` | f: 2×2 mal 2×2 und A·B ≠ B·A zeigen **HF**; `ma.produkt` | `ma.kommutativ-aussage`: „A·B = B·A immer“ widerlegen |

**FV (neu):** **FV.MA.ZEILE-SPALTE** (Zeile mal Zeile), **FV.MA.KOMMUTATIV**, **FV.MA.NULLZEILE** (Nullzeile = keine Lösung), **FV.MA.ZEILE-NUR-LINKS** (Umformung nur auf einer Seite). Vorhanden: FV.GS.LOESBARKEIT, FV.GS.FALSCH-EINGESETZT.
**Darstellung:** Matrix mit KaTeX (`pmatrix`), Eingabe als `felder-eingabe` im Raster (B2 mit Spalten).
**Begriffe:** Matrix, Koeffizientenmatrix, Gauß-Verfahren, Dreiecksform.

### 5.6 Feld VK – Vektoren (`raum-und-form/vektoren`)

| Kompetenz | G | M | E |
|---|---|---|---|
| **M.RF.VK.RAUM** | f: Koordinaten einer Quaderecke ablesen (B6 `raum3d`); `vk.ablesen` | f: verdeckte Ecke / Spitze einer Pyramide über Symmetrie; `vk.verdeckt` | `vk.schraegbild-aussage`: Warum ein Punkt im Schrägbild mehrdeutig ist |
| **M.RF.VK.RECHNEN** | f: Vektor AB, Summe, Vielfaches (3 Felder) **HF**; `vk.rechnen` | z: Betrag (√ schön: 3-4-12-13, 2-3-6-7) und Mittelpunkt (f) **HF**; `vk.betrag`, `vk.mittelpunkt` | `vk.parallelogramm-aussage`: Parallelogramm nachweisen (AB = DC) |
| **M.RF.VK.ABHAENGIG** | a: parallel? (Vielfaches) **HF**; `vk.parallel` | a: drei Vektoren in einer Ebene? (LGS, schöne Zahlen); `vk.komplanar` | LK: rechnerischer Nachweis (Ansatz wählen); `vk.abhaengig-aussage` |

**FV (neu):** **FV.VK.SPITZE-FUSS** (B − A vertauscht), **FV.VK.BETRAG-SUMME** (Betrag = Summe der Koordinaten), **FV.VK.MITTELPUNKT** (Differenz statt Summe halbiert), **FV.VK.SCHRAEG-ACHSE** (x-Achse im Schrägbild falsch gelesen), **FV.VK.PARALLEL-KOORDINATE** (eine gleiche Koordinate = parallel).
**Erstvermittlung:** Pfeile verschieben: Ein Vektor ist eine Verschiebung (B6, Pfeile).
**Begriffe:** Vektor, Ortsvektor, Betrag eines Vektors, Spaltenvektor, kollinear, komplanar, linear abhängig.

### 5.7 Feld GE – Geraden und Ebenen (`raum-und-form/geraden-und-ebenen`)

| Kompetenz | G | M | E |
|---|---|---|---|
| **M.RF.GE.GERADE** | f: Geradengleichung durch zwei Punkte (Stütz- und Richtungsvektor, 6 Felder) **HF**; `ge.gerade` | a: Punkt auf der Geraden? (Parameter aus einer Zeile, Probe) **HF**; `ge.punktprobe` **ZS** | `ge.lage-achse-aussage`: Gerade parallel zur x₁x₂-Ebene, weil 3. Koordinate des Richtungsvektors 0 |
| **M.RF.GE.EBENE** | f: Ebene in Parameterform aus drei Punkten **HF**; `ge.ebene-param` | f: Koordinatenform aus Normalenvektor und Punkt; Spurpunkte (3 Felder) **HF**; `ge.koordinatenform`, `ge.spurpunkte` **ZS** | `ge.spur-aussage`: fehlender Spurpunkt → Ebene parallel zu einer Achse |
| **M.RF.GE.LAGE-GG** | a: parallel/identisch/schneidend/windschief (Richtungsvektoren zuerst) **HF**; `ge.lage-gg` | f: Schnittpunkt **HF**; `ge.schnittpunkt` **ZS** | o: Entscheidungsweg ordnen |
| **M.RF.GE.LAGE-GE** | a: Lage Gerade–Ebene über n·v (=0?) **HF**; `ge.lage-ge` | f: Durchstoßpunkt (Koordinatenform) **HF**; `ge.durchstoss` **ZS** | `ge.skalar-aussage`: n·v = 0 heißt parallel oder in der Ebene |
| **M.RF.GE.LAGE-EE** (LK) | a: parallel/identisch/schneidend über Normalenvektoren; `ge.lage-ee` | f: Schnittgerade (Parameterform) **ZS**; `ge.schnittgerade` | `ge.normal-aussage`: parallele Ebenen an den Normalenvektoren |
| **M.RF.GE.SCHAREN** | a: Gerade der Schar durch gegebenen Punkt (Parameter) **HF**; `ge.schar-punkt` | a: Gerade der Schar parallel zu einer Ebene; `ge.schar-parallel` | LK: Ebenenschar; `ge.ebenenschar` |

**FV (neu):** **FV.GE.RICHTUNG-STUETZ** (Richtungsvektor = Ortsvektor B), **FV.GE.PARAMETER-JE-ZEILE** (Punktprobe: Parameter nur aus einer Zeile, Rest nicht geprüft), **FV.GE.WINDSCHIEF** („kein Schnittpunkt = parallel“), **FV.GE.GLEICHER-PARAMETER** (beim Gleichsetzen derselbe Parameter für beide Geraden), **FV.GE.NORMALE-SKALAR** (n·v = 0 als „schneidet“ gedeutet), **FV.GE.SPURPUNKT**.
**Begriffe:** Stützvektor, Richtungsvektor, Parameterform, Koordinatenform, Normalenvektor, Spurpunkt, windschief, Durchstoßpunkt, Schnittgerade.

### 5.8 Feld AW – Abstände und Winkel (`raum-und-form/abstaende-und-winkel`)

| Kompetenz | G | M | E |
|---|---|---|---|
| **M.RF.AW.SKALARPRODUKT** | z: Skalarprodukt **HF**; `aw.skalar` | z: Winkel zwischen Vektoren (runden), orthogonal? (a) **HF** bei 90°; `aw.winkel`, `aw.orthogonal` | `aw.projektion-aussage`: Skalarprodukt negativ ⇒ stumpfer Winkel |
| **M.RF.AW.VEKTORPRODUKT** | f: Vektorprodukt **HF**; `aw.kreuz` **ZS** | z: Fläche von Parallelogramm/Dreieck (schöne Beträge); `aw.flaeche` | `aw.kreuz-aussage`: a × b steht senkrecht auf a und b |
| **M.RF.AW.SCHNITTWINKEL** | z: Winkel zwischen Geraden (Betrag im Zähler); `aw.winkel-gg` | z: Winkel Gerade–Ebene (sin) und Ebene–Ebene; `aw.winkel-ge` | `aw.sinus-aussage`: warum sin bei Gerade–Ebene |
| **M.RF.AW.ABSTAND** | z: Abstand Punkt–Punkt **HF**; `aw.abstand-pp` | z: Abstand Punkt–Ebene über Lotfußpunkt (schöne Zahlen) **ZS**; `aw.abstand-pe` | LK: Hesse'sche Normalenform; `aw.hnf` |
| **M.RF.AW.ABSTAND-WEITERE** (LK) | z: Punkt–Gerade über Lotfußpunkt **ZS**; `aw.abstand-pg` | z: Gerade–Gerade (parallel, windschief) **ZS**; `aw.abstand-gg` | `aw.verfahren-aussage`: Verfahren wählen |
| **M.RF.AW.ANWENDUNG** | f: Spiegelpunkt an einer Ebene **ZS**; `aw.spiegeln` | z: kürzester Abstand eines Punktes auf einer Geraden zu einem Punkt (Extremwert); `aw.extremal` | LK: extremale Winkel (Auswahl); `aw.extremal-aussage` |

**FV (neu):** **FV.AW.SKALAR-VEKTOR** (Skalarprodukt als Vektor), **FV.AW.BETRAG-VERGESSEN** (Winkel > 90° bei Geraden), **FV.AW.SIN-COS** (cos bei Gerade–Ebene), **FV.AW.LOT-FUSS** (Abstand zum Stützpunkt statt zum Lotfußpunkt), **FV.AW.HNF-NORMIEREN** (Normalenvektor nicht durch Betrag geteilt), **FV.AW.SPIEGEL-HALB** (nur bis zum Lotfußpunkt).
**Begriffe:** Skalarprodukt, orthogonal, Vektorprodukt, Schnittwinkel, Lotfußpunkt, Hesse'sche Normalenform.

### 5.9 Feld WS – Mehrstufige Zufallsversuche (`daten-und-zufall/mehrstufige-zufallsversuche`)

| Kompetenz | G | M | E |
|---|---|---|---|
| **M.DZ.WS.MEHRSTUFIG** | z: zweistufig ohne Zurücklegen mit Baum (`baum`) **HF**; `ws.pfad` | z: dreistufig, Summe mehrerer Pfade (schöne Brüche) **HF**; `ws.pfade` **ZS** | `ws.weg-aussage`: Gegenereignis spart Pfade |
| **M.DZ.WS.ABZAEHLEN** | z: n!, Anordnungen **HF**; `ws.fakultaet` | z: Binomialkoeffizient (Teams, Lotto klein) **HF**; `ws.binomialkoeffizient` | LK: Ziehen ohne Zurücklegen mit Binomialkoeffizienten (Lotto 3 aus 10); `ws.lotto` |
| **M.DZ.WS.VIERFELDER** | f: Vierfeldertafel ergänzen (Anzahlen) **HF**; `ws.vierfelder` (B7) | z: Wahrscheinlichkeit aus der Tafel (Zeile/Spalte); `ws.vierfelder-p` | `ws.baum-tafel-aussage`: Baum und Tafel zeigen dasselbe |
| **M.DZ.WS.UNABHAENGIG** | a: unabhängig? (P(A∩B) = P(A)·P(B) prüfen) **HF**; `ws.unabhaengig` | a: aus Tafel prüfen; `ws.unabhaengig-tafel` | `ws.unvereinbar-aussage`: unvereinbar ≠ unabhängig |
| **M.DZ.WS.BEDINGT** (LK) | z: P(A\|B) aus der Tafel; `ws.bedingt` | z: Satz von Bayes (Test mit Fehlerquote, runden) **ZS**; `ws.bayes` | `ws.vertauscht-aussage`: P(krank \| positiv) ≠ P(positiv \| krank) |

**FV (neu):** **FV.WS.MIT-ZURUECKLEGEN** (Nenner nicht verringert; Spiegel zu FV.ZF.OHNE-ZURUECKLEGEN, vorhanden), **FV.WS.PFADE-ADDIEREN** (vorhanden FV.ZF.PFADREGELN), **FV.WS.FAKULTAET** (n! = n·(n−1) nur zwei Faktoren), **FV.WS.BINOM-REIHENFOLGE** (Reihenfolge mitgezählt), **FV.WS.ZEILE-SPALTE** (falsche Bezugsgröße in der Tafel), **FV.WS.UNVEREINBAR-UNABHAENGIG**, **FV.WS.BEDINGT-VERTAUSCHT**.
**Erstvermittlung:** `vierfelder@1` (Tafel ↔ Baum) und SVG `baum`.
**Begriffe:** Urnenmodell, Fakultät, Binomialkoeffizient, Vierfeldertafel, stochastisch unabhängig, unvereinbar, bedingte Wahrscheinlichkeit, Satz von Bayes.

### 5.10 Feld BV – Binomialverteilung (`daten-und-zufall/binomialverteilung`)

| Kompetenz | G | M | E |
|---|---|---|---|
| **M.DZ.BV.BERNOULLI** | f: n und p aus Sachtext; `bv.parameter` | a: Bernoulli-Kette oder nicht (ohne Zurücklegen, abhängige Versuche); `bv.modell` | `bv.modell-aussage`: Ziehen ohne Zurücklegen aus großer Urne ≈ Bernoulli |
| **M.DZ.BV.EINZEL** | z: P(X = k) für kleine n (n ≤ 5) **HF** (Bruch); `bv.einzel-klein` | z: P(X = k) mit Formel (runden, n ≤ 20) **ZS**; `bv.einzel` | o: Formel herleiten (Pfade zählen, ordnen) |
| **M.DZ.BV.KUMULIERT** | z: P(X ≤ k) aus Tabelle (B7, kumulierte Binomialtabelle); `bv.tabelle` | z: P(X ≥ k), P(a ≤ X ≤ b) aus Tabelle **ZS**; `bv.kumuliert` | `bv.grenze-aussage`: P(X ≥ k) = 1 − P(X ≤ k − 1) |
| **M.DZ.BV.KENNGROESSEN** | z: μ = n·p **HF**; `bv.erwartung` | z: σ = √(n·p·(1 − p)) (schöne Werte: n = 100, p = 0,5 → 5) **HF**; `bv.sigma` | `bv.rueckschluss-aussage`: aus μ und σ auf n und p |
| **M.DZ.BV.SACH** | z: Sachaufgabe „genau / höchstens“ mit Tabelle; `bv.sach` | z: „Wie oft mindestens, damit P(mindestens ein Treffer) ≥ 90 %?“ (1 − qⁿ, Logarithmus) **ZS**; `bv.mindestens` | LK: Modell kritisch beurteilen; `bv.kritik-aussage` |

**FV (neu):** **FV.BV.OHNE-KOEFFIZIENT** (nur pᵏ·qⁿ⁻ᵏ, Binomialkoeffizient vergessen), **FV.BV.N-P-VERTAUSCHT**, **FV.BV.MINDESTENS-GRENZE** (1 − P(X ≤ k) statt k − 1; mit FV.ZG.GRENZE abstimmen), **FV.BV.SIGMA-OHNE-WURZEL**, **FV.BV.UNABHAENGIG** (Modell trotz Abhängigkeit), **FV.BV.MINDESTENS-EINS** (n·p statt 1 − qⁿ).
**Darstellung:** `stabdiagramm` für B(n; p), Tabelle B7 (kumuliert, n = 10, 20; p = 0,1 … 0,5 – die Werte im Generator mit exakter Rechnung, gerundet auf 4 Stellen).
**Begriffe:** Bernoulli-Experiment, Bernoulli-Kette, Trefferwahrscheinlichkeit, Binomialverteilung, kumuliert.

### 5.11 Feld NV – Normalverteilung, LK (`daten-und-zufall/normalverteilung`)

| Kompetenz | G | M | E |
|---|---|---|---|
| **M.DZ.NV.DICHTE** (LK) | b: Glockenkurve zu μ und σ wählen; `nv.kurve` (B5) | a: Wirkung von μ und σ (verschieben, breiter/flacher); `nv.parameter` | `nv.flaeche-aussage`: P(X = a) = 0, Wahrscheinlichkeit ist Fläche |
| **M.DZ.NV.BERECHNEN** (LK) | z: σ-Regeln (68 %, 95 %, 99,7 %) **HF**; `nv.sigma-regel` | z: P(a ≤ X ≤ b) mit gegebenen Φ-Werten (Tabelle B7); `nv.phi` **ZS** | `nv.naeherung-aussage`: Näherung nur bei σ > 3 (Laplace-Bedingung) |

**FV (neu):** **FV.NV.PUNKT-WAHRSCHEINLICHKEIT** (P(X = a) > 0), **FV.NV.SIGMA-BREITE** (größeres σ = höhere Kurve), **FV.NV.STANDARDISIEREN** (z = (x − μ)/σ falsch). Erstvermittlung: Histogramm von B(100; 0,5) und Glockenkurve darüber (B5).
**Begriffe:** Normalverteilung, Dichtefunktion, Glockenkurve, Standardisierung, Sigma-Regeln.

### 5.12 Feld BS – Beurteilende Statistik (`daten-und-zufall/beurteilende-statistik`)

| Kompetenz | G | M | E |
|---|---|---|---|
| **M.DZ.BS.SCHAETZEN** | z: Hochrechnung aus Stichprobe (Anteil · Grundgesamtheit); `bs.hochrechnen` | z: Mittelwert und Varianz einer Stichprobe schätzen (Tabelle); `bs.schaetzen` | `bs.aussagekraft-aussage`: kleine Stichprobe, große Unsicherheit |
| **M.DZ.BS.TEST** | a: Nullhypothese und Seite (links/rechts) aus Sachtext; `bs.hypothese` | z: Ablehnungsbereich mit Tabelle (B7) bestimmen **ZS**; `bs.ablehnung` | `bs.seite-aussage`: links- oder rechtsseitig aus dem Interesse begründen |
| **M.DZ.BS.IRRTUM** | a: Fehler 1. und 2. Art im Sachtext erkennen; `bs.fehlerart` | z: Wahrscheinlichkeit für den Fehler 1. Art aus Tabelle; `bs.alpha` | `bs.95-aussage`: „H₀ ist zu 95 % wahr“ – Fehlvorstellung |

**FV (neu):** **FV.BS.HYPOTHESE-VERTAUSCHT** (H₀ = das, was man zeigen will), **FV.BS.SEITE**, **FV.BS.GRENZE-ABLEHNUNG** (Grenze k gehört falsch dazu; Rückweg BV.KUMULIERT), **FV.BS.FEHLERART** (1. und 2. Art vertauscht), **FV.BS.SICHERHEIT** (Signifikanzniveau als Wahrscheinlichkeit für H₀), **FV.BS.HOCHRECHNEN** (Anteil auf falsche Grundgesamtheit).
**Begriffe:** Stichprobe, Grundgesamtheit, Nullhypothese, Gegenhypothese, Signifikanzniveau, Ablehnungsbereich, Fehler 1. Art, Fehler 2. Art.

---

## 6. Zahlen auf einen Blick

| | Kompetenzen | Vorlagen (ca.) | Generatoren (ca.) | neue FV (ca.) | neue Begriffe (ca.) |
|---|---|---|---|---|---|
| Klasse 10 | 22 | 66 | 60 | 45 | 40 |
| Jgst. 11/12 | 55 | 165 | 150 | 80 | 90 |
| **zusammen** | **77** | **231** | **210** | **125** | **130** |

Zum Vergleich Klasse 9: 30 Kompetenzen, 69 Vorlagen, rund 25 PRs. Klasse 10 ist etwa so groß wie Klasse 9; 11/12 etwa doppelt so groß.

---

## 7. Fragen an den PV – beantwortet am 03.11.2026

1. **Kurswahl GK/LK:** im **Profil** neben der Schulart, änderbar; ohne Angabe gilt GK, LK-Kompetenzen bleiben dann ausgeblendet. (Wie empfohlen.)
2. **Hilfsmittelfrei:** **in der App gekennzeichnet** (abweichend von der Empfehlung). Folge für B10: Vorlagen mit `hilfsmittelfrei: true` zeigen beim Üben ein Kennzeichen „ohne Taschenrechner“ (Symbol mit Text für die Vorlese-Funktion, Text in der Übersetzungsdatei). Das ist eine Änderung der Lern-Oberfläche: eigener PR, vorhandene Aufgaben sehen gleich aus (Test), Vorschaubild für den PV.
3. **Oberschule:** Themen, die es an der Oberschule nicht gibt, werden **ausgeblendet, wenn Oberschule gewählt ist** (über `sachsen.oberschule`). Umgekehrt KP.STUMPF beim Gymnasium ebenso.
4. **Werkzeuge:** **Vorschaubild vor dem Einbau.** Je neues Werkzeug und je neuer SVG-Baustein ein Bildschirmfoto an den PV; in Inhalte eingebaut wird erst nach seinem Ok. Bis dahin an Feldern weiterbauen, die das Werkzeug nicht brauchen (Reihenfolge in §1 entsprechend tauschen).
5. **Runden:** *PV fragt: Was sagt der Lehrplan?* Antwort aus den Unterlagen im Repository: **Eine feste Stellenzahl steht dort nicht.** Die ausgewerteten Lehrpläne verlangen „Ergebnisse überschlagen und sinnvoll runden“ bzw. „Ergebnis mit sinnvoller Genauigkeit angeben“ (`LEHRPLAN.md` §8, z. B. M.ZO.BR.SACH, M.GM.GR.SACH). Die Lehrplan-PDFs und Musteraufgaben liegen nicht im Repository (`docs/quellen/README.md`); dort ist eine genaue Regel für Wahrscheinlichkeiten nicht belegt. **Vorschlag bis zur Klärung:** Rundung je Vorlage wie in der Aufgabe angegeben („auf Hundertstel“, „in Prozent auf eine Stelle“); bei Wahrscheinlichkeiten **vier Stellen nach dem Komma oder Prozent mit einer Stelle**, beide Schreibweisen gelten als richtig; eine genauer oder etwas anders gerundete Eingabe bekommt den Hinweis „richtig, aber anders gerundet“ (B3). Bei der nächsten Sitzung mit den PDFs (Musteraufgaben Abitur, Erwartungshorizonte) prüfen und hier festhalten.
6. **Tempo:** **eine Sitzung für Klasse 10, zwei bis drei für 11/12**, voll je Kompetenz (wie Entscheidung 12).
7. **KI-Prüfung (Phase C):** **erst am Ende**, für Klasse 9 bis 12 gemeinsam.

## 8. Startsatz für die nächste Sitzung

„Lies CLAUDE.md, `docs/session/KLASSE-9-12.md` und `docs/session/KLASSE-10-12-BAUPLAN.md`. Arbeite im Strang Lernkern. Die Fragen in §7 sind beantwortet; zuerst die Rundungsregel mit den Lehrplan-PDFs klären, falls der PV sie bereitstellt. Dann Etappe 10-0 (Klasse 10 wählbar) und weiter in der Reihenfolge aus §1, je Feld ein PR, nach jedem PR kurz melden.“
