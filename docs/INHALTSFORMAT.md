# Bastion – Inhaltsformat

Status: Entwurf v0.1 · Stand: 27.10.2026 · Aufgabe 0.5
Bezug: `LEHRPLAN.md` (Schema, L-1, L-4, L-7), `ARCHITEKTUR.md` §6 (T-8), `KONZEPT.md` K-9

---

## 1. Ziele

Das Inhaltsformat muss fünf Dinge gleichzeitig leisten:

1. **Von Menschen lesbar und bearbeitbar** – auch ohne Programmierkenntnisse.
2. **Maschinell prüfbar** – Fehler fallen beim Build auf, nicht bei Jugendlichen.
3. **Sicher** – Inhaltspakete enthalten nie ausführbaren Code.
4. **Langlebig** – IDs und Formate überstehen Jahre und Versionswechsel.
5. **Ehrlich geprüft** – ungeprüfte Inhalte kommen nicht in die App (K-9).

## 2. Ablage im Repository

```
content/
└─ mathematik/
   ├─ fach.yaml
   └─ zahl-und-operation/
      ├─ bereich.yaml
      └─ brueche/
         ├─ feld.yaml
         └─ M.ZO.BR.ERWEITERN/
            ├─ kompetenz.yaml
            └─ vorlagen/
               ├─ mit-zahl.yaml
               ├─ zielnenner.yaml
               ├─ kuerzen.yaml
               ├─ gleichwertig.yaml
               └─ fehler-finden.yaml

src/generators/
└─ mathematik/brueche/
   ├─ erweitern-mit-zahl.ts
   ├─ erweitern-zielnenner.ts
   ├─ erweitern-zielnenner.test.ts
   └─ …
```

**Entscheidung I-1: Generatoren sind App-Code, keine Inhalte.** Sie liegen in `src/generators/`, werden mit der App ausgeliefert und wie Code getestet. Inhaltspakete verweisen nur per ID auf sie.
*Warum:* Bestätigt T-8 – Pakete enthalten nie ausführbaren Code. Folge: Ein neuer Generator braucht ein App-Update. Das ist akzeptabel, weil Generatoren selten neu entstehen, Vorlagen dagegen oft.

**Entscheidung I-2: Nur YAML.** Keine Markdown-Dateien mit Kopfdaten, kein Mischformat.
*Warum:* Ein Format, ein Parser, ein Schema. Längere Texte stehen als YAML-Blocktext (`|`).

## 3. Kompetenz-Datei

Schema wie in `LEHRPLAN.md` §3, ergänzt um `review`:

```yaml
# content/mathematik/zahl-und-operation/brueche/M.ZO.BR.ERWEITERN/kompetenz.yaml
id: M.ZO.BR.ERWEITERN
fach: mathematik
bereich: zahl-und-operation
feld: brueche
titel: { de: Brüche erweitern und kürzen }
kann_satz: { de: Ich kann Brüche erweitern und kürzen. }
klassenstufe_typisch: [6]
voraussetzungen: [M.ZO.BR.BEGRIFF, M.ZO.TB.TEILER]
niveaus:
  G:
    beschreibung: { de: Erweitern und Kürzen mit kleinen Zahlen und vorgegebener Zahl. }
  M:
    beschreibung: { de: Auf einen Zielnenner erweitern, vollständig kürzen. }
  E:
    beschreibung: { de: Gleichwertigkeit begründen, Fehler finden und erklären. }
kmk: { leitidee: L1, prozesse: [K5, K1] }
anforderungsbereiche: [I, II]
abdeckung: generator
version: 1
review:
  von: michael
  datum: 2026-10-27
  hash: 3f9a…                # s. Abschnitt 8
```

**Ergänzt (27.10.2026):**
- `sachsen` (Pflicht, LEHRPLAN L-9): Lehrplanbezug je Schulart, z. B. `gymnasium: { klassenstufe: 5, lernbereich: "LB 2 Gemeine Brüche und Dezimalzahlen" }`. Fehlt eine Schulart, steht die Kompetenz dort nicht in den ausgewerteten Klassenstufen.
- `zeichnen_erklaert: true` (optional, LEHRPLAN L-10): Zur Kompetenz gehört eine Zeichen- oder Konstruktionsanleitung, die nicht bewertet wird.
- Solange es kein Review-Werkzeug gibt, haben Kompetenzen noch kein `review`-Feld; alle gelten als ungeprüft.

**Entscheidung I-3: Alle Texte sind ab Tag 1 Sprachobjekte** (`{ de: … }`), auch wenn es zunächst nur Deutsch gibt.
*Warum:* Hilfesprache kommt in Phase 5. Wird jetzt ein einfacher String verwendet, müssen später alle Inhalte migriert werden. So wird später nur ergänzt.

## 4. Aufgabenvorlage

Eine Vorlage beschreibt *eine Art von Aufgabe* zu einer Kompetenz. Sie ist die Einheit für Wiederholungen (L-4): **Eine FSRS-Karte = Vorlage × Niveau.**

### 4.1 Generatorbasierte Vorlage

```yaml
# vorlagen/zielnenner.yaml
id: M.ZO.BR.ERWEITERN.ZIELNENNER
kompetenz: M.ZO.BR.ERWEITERN
niveaus: [G, M]
typ: bruch-eingabe
quelle: generator
generator: bruch.erweitern-zielnenner@1
parameter:
  G: { nenner_max: 6,  faktor_max: 5 }
  M: { nenner_max: 15, faktor_max: 12 }
antwort:
  form: exakt                 # Nenner muss genau {zielnenner} sein
text:
  aufgabe:
    de: |
      **Erweitere** den Bruch {bruch} so, dass der Nenner {zielnenner} ist.
hilfen:
  - de: Durch welche Zahl musst du den Nenner teilen, um {zielnenner} zu erhalten? Rechne {zielnenner} : {nenner}.
  - de: Multipliziere Zähler **und** Nenner mit {faktor}.
fehlerbilder:
  addiert:
    de: Du hast zum Zähler etwas addiert. Beim Erweitern wird **multipliziert** – Zähler und Nenner mit derselben Zahl.
  nur-nenner:
    de: Du hast nur den Nenner verändert. Der Zähler muss mit derselben Zahl multipliziert werden.
  zaehler-falscher-faktor:
    de: Der Nenner stimmt. Prüfe, mit welcher Zahl du den Zähler multipliziert hast.
herkunft: ki-entwurf          # eigen | ki-entwurf | oer
lizenz: null                  # bei OER Pflicht, s. 9
version: 1
review:
  von: michael
  datum: 2026-10-27
  geprueft: [fachlich, sprache, niveau, stichprobe]
  hash: 7c21…
```

### 4.2 Handverfasste Vorlage

Für Inhalte ohne Generator. Mindestens **5 gleichwertige Varianten**, die rotieren (LEHRPLAN §6.1).

```yaml
id: M.ZO.BR.ERWEITERN.GLEICHWERTIG
kompetenz: M.ZO.BR.ERWEITERN
niveaus: [E]
typ: auswahl
quelle: handverfasst
varianten:
  - text:
      de: |
        Lea sagt: „6/8 und 9/12 sind gleich groß.“
        **Entscheide**, ob Lea recht hat, und wähle die passende Begründung.
    optionen:
      - { de: "Ja – beide lassen sich zu 3/4 kürzen.", richtig: true }
      - { de: "Nein – 9/12 hat größere Zahlen, also ist der Bruch größer." , fehlerbild: groessere-zahlen }
      - { de: "Nein – 8 und 12 sind verschiedene Nenner.", fehlerbild: nenner-vergleich }
      - { de: "Ja – Zähler und Nenner unterscheiden sich jeweils um 3." , fehlerbild: differenz }
  # … mindestens 4 weitere Varianten
fehlerbilder:
  groessere-zahlen: { de: Größere Zahlen im Bruch bedeuten nicht, dass der Bruch größer ist. Kürze beide Brüche und vergleiche dann. }
  nenner-vergleich: { de: Verschiedene Nenner schließen Gleichheit nicht aus – denk an 1/2 und 2/4. }
  differenz: { de: Die Differenz ist hier zufällig gleich. Gleichwertig sind Brüche, wenn man sie durch Erweitern oder Kürzen ineinander umformen kann. }
herkunft: eigen
version: 1
review: { von: michael, datum: 2026-10-27, geprueft: [fachlich, sprache, niveau], hash: … }
```

**Entscheidung I-4: Vorlagen-IDs sind stabil** – wie Kompetenz-IDs (L-1). Wird eine Vorlage ersetzt, bekommt sie eine neue ID; die alte wird mit `ausgemustert: true` markiert, nicht gelöscht.
*Warum:* An Vorlagen hängen FSRS-Karten und Fehlerwerkstatt-Einträge. Eine ausgemusterte Vorlage wird nicht mehr neu geplant; vorhandener Fortschritt der Kompetenz bleibt unberührt.

### 4.3 Zeichen-Anleitung (Typ `anleitung`, LEHRPLAN L-10)

Liegt unter `…/<Kompetenz-ID>/anleitungen/<name>.yaml`; die ID ist Kompetenz-ID + Dateiname in Großbuchstaben. Nur Kompetenzen mit `zeichnen_erklaert: true` haben Anleitungen, und jede solche Kompetenz hat mindestens eine.

```yaml
id: M.RF.GF.WINKEL.ZEICHNEN
kompetenz: M.RF.GF.WINKEL
titel: { de: Einen Winkel von 50° zeichnen }
material: { de: 'Papier, spitzer Bleistift, [[Geodreieck]]' }
bilder: anleitung.winkel@1        # Bilder aus src/generators/anleitungen, je Schritt eins
schritte:                         # mindestens zwei
  - de: Markiere einen Punkt S. …
pruefen:                          # Prüfliste zum Abhaken, wird nicht gespeichert
  - de: Lege das [[Geodreieck]] noch einmal an und miss nach. …
herkunft: ki-entwurf
version: 1
```

Die Bilder sind wie Generatoren App-Code (I-1): SVG ohne Verweise, mit Beschreibung. `pnpm test` prüft, dass es genau so viele Bilder wie Schritte gibt. Anleitungen werden nicht bewertet und erzeugen keine Lernereignisse (L-10); sie reisen im Paket des Bereichs mit. Stand 1a: fünf Anleitungen – Senkrechte und Parallele (GF.LAGE), Winkel zeichnen (GF.WINKEL), Spiegeln auf Kästchenpapier (SY.SPIEGELN), Würfel aus Papier (KP.DARSTELLEN).

## 5. Aufgabentypen Phase 1

| Typ | Eingabe | Auswertung | Einsatz |
|---|---|---|---|
| `zahl-eingabe` | Ganzzahl oder Dezimalzahl | Wertgleich nach Normalisierung (5.1) | NZ, BR.DEZ, GR |
| `bruch-eingabe` | Zähler/Nenner, optional gemischte Zahl | `form: beliebig` (wertgleich) · `gekuerzt` · `exakt` | BR |
| `groesse-eingabe` | Zahl + Einheit (Auswahlliste) | Wertgleich nach Umrechnung oder in geforderter Einheit | GR |
| `auswahl` | Eine oder mehrere Optionen | Exakte Übereinstimmung | alle, v. a. E |
| `ordnen` | Elemente in Reihenfolge bringen | Exakte Reihenfolge | BR.VERGLEICHEN, NZ |
| `zuordnen` | Paare bilden | Alle Paare korrekt | GR, BR.DEZIMAL |
| `fehler-finden` | Fehlerhaften Schritt einer Rechnung wählen, dann Begründung auswählen | Beide Teile korrekt; Teilrückmeldung | E-Niveaus |
| `bruch-bild` | Bild → Bruch eingeben *oder* Bruch → Felder einfärben | Wertgleich bzw. Anteil korrekt | BR.BEGRIFF |

**Ergänzung für Klasse 5 (K-16, L-10) – Entscheidung I-11 (bestätigt 27.10.2026):**

| Typ | Eingabe | Auswertung | Einsatz |
|---|---|---|---|
| `bild-zahl` | Generiertes Bild (SVG: Winkel mit Winkelmesser, Rechteck, Quadernetz …) + Zahl- oder Größeneingabe | wie `zahl-eingabe` / `groesse-eingabe`, mit Toleranz bei Messwerten | GF.WINKEL, FL, KP |
| `koordinaten-eingabe` | Punkt als Zahlenpaar eingeben *oder* im Gitter antippen | exakt (Gitterpunkte) | GF.KOORDINATEN, SY.SPIEGELN |
| `bild-auswahl` | mehrere Bilder, eines oder mehrere wählen (Netz, Schrägbild, Symmetrieachse) | exakte Übereinstimmung | KP.DARSTELLEN, SY |
| `anleitung` | Schritt-für-Schritt-Erklärung zum Zeichnen/Konstruieren auf Papier, mit Bildern; am Ende optional Selbsteinschätzung | **nicht bewertet**; zählt nicht für „gekonnt“ (L-10) | GF.WINKEL, SY.SPIEGELN, KP.DARSTELLEN |

Alle Bilder werden im Generator als SVG erzeugt (keine Bilddateien aus dem Netz) und haben eine Textbeschreibung.

**Barrierefreiheit:** Jeder Typ ist vollständig per Tastatur bedienbar. `bruch-bild` hat zusätzlich eine Textbeschreibung („Ein Rechteck aus 8 gleich großen Feldern, 3 davon sind gefärbt“) und eine Alternative ohne Bild.

**Später (I-O1, beantwortet durch K-29):** Schriftliche Rechenverfahren werden Zwischenschritte mit stellenweiser Eingabe (§17). Bis dahin wird bei NZ.ADD-SUB bis NZ.DIV nur das Ergebnis geprüft; der Lösungsweg zeigt das Schema.

### 5.1 Normalisierung von Zahleingaben

**Entscheidung I-5:**
- Dezimaltrennzeichen ist das **Komma**. Ein **Punkt wird als Dezimaltrennzeichen akzeptiert** – mit dem freundlichen Hinweis, dass man im Deutschen ein Komma schreibt.
- **Tausendertrennzeichen werden nicht akzeptiert** (weder Punkt noch Leerzeichen innerhalb der Zahl).
- Leerzeichen am Rand, führende Nullen und ein überflüssiges `+` werden ignoriert.
- **Negative Zahlen** (ab Klasse 7): `-` und `−` gelten beide als Minus. Weil die Zahlentastaturen auf dem Handy oft kein Minus haben, setzt ein Generator `vorzeichen: true` für **jede** Instanz, deren Antwort negativ sein *kann*. Dann steht neben jedem Zahlenfeld (Ergebnis, Zähler, x und y) ein Knopf „±“, der das Minus vorn setzt oder entfernt. Weil der Knopf bei allen Aufgaben des Generators erscheint, verrät er nichts über die Lösung.

*Warum:* Viele Jugendliche mit DaZ kennen den Dezimalpunkt. Sie dafür als falsch zu werten, misst Konvention statt Mathematik. Tausenderpunkte würden dagegen Mehrdeutigkeit erzeugen („3.500“).

*Umsetzung:* `src/core/learning/auswertung.ts` liest Zahlen, Brüche (auch gemischt, „1 3/4“), Primfaktoren und Uhrzeiten und wertet Antworten aus. Ohne `antwort.form` gilt für Brüche `beliebig`. Erkannt wird zuerst die exakt gleiche Fehler-Antwort, dann eine wertgleiche (6/10 bei Fehlerbild 3/5). Wertgleich, aber in falscher Form, ergibt einen eigenen Hinweis (`nicht-gekuerzt`, `andere-schreibweise`). Ein Probelauf mit allen Vorlagen (`tools/inhalte/auswertung.test.ts`) stellt sicher, dass jede echte Lösung als richtig und jede Fehlerbild-Antwort als genau dieses Fehlerbild erkannt wird.

## 6. Generator-Schnittstelle

```ts
// src/generators/types.ts
export interface Generator<P> {
  id: string;            // "bruch.erweitern-zielnenner"
  version: number;       // ändert sich bei jeder Verhaltensänderung
  erzeuge(seed: number, param: P): Instanz;
}

export interface Instanz {
  platzhalter: Record<string, Wert>;     // füllt {…} im Vorlagentext
  loesung: Loesung;                      // typgerecht, s. Aufgabentypen
  loesungsweg: Schritt[];                // für Anzeige nach der Antwort
  fehlerbilder?: Fehlerbild[];           // erwartbare falsche Antworten
  optionen?: Option[];                   // bei auswahl / fehler-finden
  vorzeichen?: boolean;                  // Antwort kann negativ sein → Knopf „±“ (§5.1)
}

export interface Fehlerbild {
  id: string;            // muss in der Vorlage unter fehlerbilder stehen
  antwort: Loesung;      // die falsche Antwort, die dieses Fehlerbild erzeugt
}
```

**Umsetzung (27.10.2026):** Die Typen liegen nicht in `src/generators/types.ts`, sondern im Kern: `src/core/learning/generator.ts` (Generator, Instanz, Fehlerbild, Lösung) und `src/core/learning/bruch.ts` (Bruch, ggT, Vergleiche). *Warum:* Die Auswertung im Kern braucht dieselben Typen, darf aber nicht aus `src/generators` importieren (T-2); umgekehrt dürfen Generatoren aus dem Kern importieren. Gegenüber dem Entwurf oben ergänzt:
- `platzhalter`: Namen aller Platzhalter, die jede Instanz füllt (für den Pflicht-Test „alle Platzhalter gefüllt“ und den Abgleich mit der Vorlage).
- `fehlerbildIds`: alle Fehlerbild-IDs, die vorkommen können (für den Build-Abgleich mit `fehlerbilder` der Vorlage, §10.1).
- `fehlerbilder` ist immer vorhanden (ggf. leer); `antwort` ist eine `Loesung`: `{ typ: 'bruch' | 'zahl' | 'reihenfolge', wert }`.
- `elemente` (optional): die zu ordnenden Zahlen beim Typ `ordnen`, in der angezeigten, gemischten Reihenfolge. Der Abwechslungs-Test vergleicht Platzhalter **und** Elemente.
- Verzeichnis aller Generatoren: `src/generators/index.ts`, Schlüssel `id@version`.

### 6.1 Regeln für Generatoren

1. **Rein und deterministisch.** Gleicher Seed + gleiche Parameter = gleiche Aufgabe. Kein `Math.random`, kein `Date`, keine Browser-APIs. Zufall nur über den Zufallszahlengenerator aus `src/core/rng` (`rng(seed)` mit `int`, `pick`, `zahl`; Verfahren sfc32, durch feste Testwerte gegen Änderungen geschützt).
2. **Endlich.** Höchstens eine feste Zahl von Versuchen bei Wiederholungen („neu würfeln“); danach ein sicherer Standardfall.
3. **Keine trivialen oder hässlichen Fälle.** Kein Faktor 1, keine Aufgaben, deren Antwort im Text steht, keine Zahlen, die das Niveau sprengen.
4. **Unabhängig geprüfte Lösung.** Der Test berechnet die Lösung auf einem zweiten, einfachen Weg und vergleicht.
5. **Versionierung.** Jede Verhaltensänderung erhöht `version`. Alte Versionen werden nicht gelöscht, solange Ereignisse auf sie verweisen könnten (s. 6.3).

### 6.2 Beispiel: `bruch.erweitern-zielnenner@1`

```ts
export const erweiternZielnenner: Generator<{ nenner_max: number; faktor_max: number }> = {
  id: 'bruch.erweitern-zielnenner',
  version: 1,
  erzeuge(seed, p) {
    const r = rng(seed);
    const n = r.int(2, p.nenner_max);
    const z = r.pick(teilerfremdeZahlenUnter(n));   // Ausgangsbruch ist schon gekürzt
    const k = r.int(2, p.faktor_max);               // nie 1
    const zn = n * k;

    return {
      platzhalter: { bruch: bruch(z, n), nenner: n, zielnenner: zn, faktor: k },
      loesung: { typ: 'bruch', wert: bruch(z * k, zn) },
      loesungsweg: [
        { de: `${zn} : ${n} = ${k}` },
        { de: `Zähler und Nenner mit ${k} multiplizieren:` },
        { de: `${z} · ${k} = ${z * k} und ${n} · ${k} = ${zn}` },
      ],
      fehlerbilder: [
        { id: 'addiert',                antwort: bruch(z + (zn - n), zn) },
        { id: 'nur-nenner',             antwort: bruch(z, zn) },
        { id: 'zaehler-falscher-faktor', antwort: bruch(z * (k + 1), zn) },
      ].filter(f => !gleich(f.antwort, bruch(z * k, zn))),  // Fehlerbild darf nie die richtige Antwort sein
    };
  },
};
```

### 6.3 Pflicht-Tests je Generator (fast-check)

Für jeweils 10 000 Seeds pro Niveau:
- Lösung stimmt mit unabhängiger Berechnung überein.
- Alle Zahlen liegen in den Niveau-Grenzen.
- Kein Fehlerbild ergibt die richtige Antwort.
- Alle Platzhalter der Vorlage werden gefüllt.
- Gleicher Seed → identische Instanz.
- Nicht mehr als ein kleiner Anteil identischer Instanzen in 100 aufeinanderfolgenden Seeds (Abwechslung).

*Umsetzung:* `src/generators/pflichttests.ts` stellt alle sechs Prüfungen bereit; jeder Generator ruft sie in seiner Testdatei mit seinen Niveau-Parametern, einer unabhängigen Lösungsberechnung, den Niveau-Grenzen und einer Mindestzahl verschiedener Instanzen auf. Zusätzlich geprüft: Fehlerbild-Antworten sind untereinander verschieden, und jede Fehlerbild-ID ist beim Generator angemeldet. Generatoren liegen unter `src/generators/mathematik/<feld>/` und registrieren sich selbst (`src/generators/index.ts`). Rechenintensive Generatoren (z. B. Würfelnetze) dürfen ein höheres Zeitlimit je Test angeben (`zeitlimitMs`); die Zahl der Seeds bleibt 10 000. Wo die Lösung nicht schlicht nachzurechnen ist, prüft der Test sie auf einem echten Rückweg (z. B. liest ein eigener Zahlwort-Leser im Test die Aufgabe zurück in eine Zahl). Platzhalter dürfen Zahlen, Brüche oder Sprachobjekte sein (z. B. Stellennamen), nie nackte Texte (I-3). Zahlen im Lösungsweg werden mit `zahlDeutsch` gegliedert (`src/core/learning/format.ts`, §11).

### 6.4 Was ein Lernereignis speichert

**Entscheidung I-6:** Ein Lernereignis speichert `generator@version` und `seed`. Bei **falschen** Antworten zusätzlich einen kompakten Schnappschuss der Instanz (Platzhalter, Lösung, gegebene Antwort, Fehlerbild-ID).
*Warum:* Seed und Version reichen zur Rekonstruktion, solange der Generator unverändert existiert. Die Fehlerwerkstatt (R6) muss aber auch nach Generator-Änderungen exakt *die* Aufgabe zeigen können, an der jemand gescheitert ist. Für richtige Antworten ist das unnötig – Datensparsamkeit auch lokal.

## 7. Fehlerbilder

**Entscheidung I-7:** Typische Fehler werden als **Fehlerbilder** modelliert: Der Generator (oder die handverfasste Variante) kennt die falsche Antwort, die ein bestimmtes Fehlverständnis erzeugt; die Vorlage liefert die passende Rückmeldung.

*Warum:*
- **Gezielte Rückmeldung** statt „Leider falsch“. Das ist der größte pädagogische Hebel, den geschlossene Aufgaben haben.
- **Fehlerwerkstatt nach Ursachen:** Fehler werden nach Fehlerbild gruppiert („Du verwechselst manchmal Erweitern mit Addieren“), nicht nach Aufgaben.
- **Diagnose:** Häufiges Fehlerbild → gezielter Vorschlag einer Voraussetzung (LEHRPLAN §7).

Unbekannte falsche Antworten bekommen eine allgemeine Rückmeldung und den Lösungsweg.

**Doppelte Fehler-Antworten:** Können zwei Fehlverständnisse dieselbe falsche Antwort erzeugen (bei `erweitern-zielnenner` etwa 1/2 → ?/4: „addiert“ und „falscher Faktor“ ergeben beide 3/4), meldet der Generator nur das erste in seiner festen Reihenfolge. Die Reihenfolge steht im Generator und ist nach Häufigkeit des Fehlers gewählt.

## 8. Review-Pflicht

**Entscheidung I-8: Ein Review ist an den Inhalt gebunden.** `review.hash` ist eine Prüfsumme über alle Felder der Datei außer `review` selbst. Bei Vorlagen mit Generator gehört die Generator-Version dazu.
*Warum:* Jede spätere Änderung – auch ein Komma im Text – macht das Review automatisch ungültig. So kann nichts ungeprüft durchrutschen, ohne dass jemand daran denken muss.

Ablauf:
1. Inhalt entsteht (eigen, KI-Entwurf, OER).
2. `pnpm content:review <datei>` zeigt den Inhalt; bei Generatoren zusätzlich eine **Stichprobe von 20 erzeugten Aufgaben je Niveau** mit Lösung, Lösungsweg und Fehlerbildern.
3. Prüfende Person bestätigt die Punkte `fachlich`, `sprache` (L-7), `niveau`, bei Generatoren `stichprobe`.
4. Das Werkzeug schreibt `review` mit Datum und Hash in die Datei.

Der Build lehnt ab: fehlendes Review, abweichenden Hash, fehlende Prüfpunkte.

## 9. Herkunft und Lizenz

**Entscheidung I-9:** Jede Vorlage gibt `herkunft` an (`eigen`, `ki-entwurf`, `oer`). Bei `oer` sind `lizenz` (z. B. `CC-BY-4.0`), `quelle` und `urheber` Pflicht.
*Warum:* Saubere Lizenzlage ist Voraussetzung dafür, dass Bastion selbst offen lizenziert werden kann (O-8). Die Herkunft `ki-entwurf` ist intern dokumentiert, damit Fehlerhäufungen später nach Herkunft auswertbar sind.

## 10. Build und Pakete

### 10.1 Prüfschritte (`tools/content-build`)

*Umgesetzt (27.10.2026) für Kompetenzen (Punkte 1–3) und Vorlagen mit Generator (Punkt 2):* `pnpm inhalte:pruefen` (`tools/inhalte/`, läuft über Vitest und zeigt einen Bericht mit der Abdeckung je Kompetenz), zusätzlich bei jedem `pnpm test`. Für Vorlagen wird geprüft: Kompetenz und Niveaus existieren, ID = Kompetenz-ID + `.` + Dateiname in Großbuchstaben, Generator mit genau dieser Version registriert, Parameter je Niveau vorhanden, jeder `{platzhalter}` in Aufgabe, Hilfen und Rückmeldungen wird vom Generator geliefert, und für **jedes** Fehlerbild des Generators gibt es genau eine Rückmeldung (keine fehlende, keine überzählige). Prüflogik: `src/core/learning/vorlage.ts`. Handverfasste Vorlagen folgen. Statt eines JSON-Schemas prüft die TypeScript-Funktion `pruefeKompetenz` in `src/core/competence/kompetenz.ts` – so braucht es keine Schema-Bibliothek, und die App kann dieselbe Prüfung später für geladene Pakete nutzen. Zusätzlich geprüft: Ordner passt zur ID, Leitidee passt zum Bereich, Kann-Satz beginnt mit „Ich kann“, Lehrplanbezug Sachsen vorhanden.

1. YAML lesen, gegen JSON-Schema prüfen.
2. Verweise prüfen: Kompetenzen, Voraussetzungen, Generatoren (registriert, Version vorhanden), Fehlerbild-IDs.
3. Graph prüfen: keine Zyklen in den Voraussetzungen.
4. Reviews prüfen (8).
5. Abdeckung prüfen: Jede Kompetenz hat **pro Niveau mindestens 2 Vorlagen**; handverfasste Vorlagen mindestens 5 Varianten.
6. Probelauf: Jede Vorlage wird mit 50 Seeds je Niveau gerendert; kein Platzhalter darf offen bleiben, kein KaTeX-Fehler auftreten.
7. Bericht: Abdeckung je Kompetenz und Niveau, Herkunftsverteilung, offene Reviews.

### 10.2 Paketzuschnitt

**Entscheidung I-10: Ein Paket je Fach × Bereich, mit allen drei Niveaus.** Das korrigiert ARCHITEKTUR §6 („je Fach × Bereich × Niveau“).
*Warum:* Niveauwechsel sind ausdrücklich erwünscht (L-3). Lägen die Niveaus in getrennten Paketen, wäre ein Wechsel offline nicht möglich. Inhaltspakete sind reiner Text und klein; der Speichergewinn wäre den Bruch nicht wert.

Zusätzlich enthält das **Grundpaket** jedes Fachs den vollständigen Kompetenzgraphen (ohne Vorlagen), damit Diagnose und Empfehlungen immer funktionieren.

### 10.3 Paketformat

```
packs/
├─ manifest.json                       # Pakete, Versionen, Prüfsummen, Größen
├─ mathematik.grund.v3.json            # Fach, Bereiche, Felder, Kompetenzen, Graph
├─ mathematik.zahl-und-operation.v7.json
└─ mathematik.groessen-und-messen.v2.json
```

Die App lädt das Manifest, zeigt vor dem Download die Größe an und speichert Pakete in IndexedDB. Neue Paketversionen werden nur zwischen Sitzungen eingespielt.

*Umsetzung (Stand Klasse 5):* `tools/inhalte/pakete.ts` baut die Pakete als Vite-Plugin – im Entwicklungsserver unter `/packs/`, im Build als Dateien in `dist/packs/`. Dateinamen tragen den Anfang der Prüfsumme (`mathematik.grund.dde4758d8e.json`), das Manifest heißt `manifest.json` und nennt Name, Datei, Bereich, Größe und SHA-256. Alle Pakete der Klasse 5 zusammen sind etwa 23 KB (gzip) groß; deshalb speichert der Service Worker sie vorerst vollständig vorab, statt sie nach Auswahl in IndexedDB zu laden. Die Auswahl vor dem Download folgt, wenn weitere Klassenstufen dazukommen.

*Seit U3b (29.10.2026):* Das Grundpaket enthält zusätzlich den Fehlerkatalog (`fehlvorstellungen`, §16), weil er zum Fach gehört. Die Erstvermittlungen (`vermittlungen`, §15) liegen im Paket des Bereichs ihrer Kompetenz. Das Paketformat bleibt 1: Ältere App-Versionen übersehen die neuen Felder einfach. Die App liest sie in `src/ui/plattform/pakete.ts` als Zuordnung Kompetenz → Sequenz und ID → Fehlvorstellung.

## 11. Texte und Darstellung

- Formatierung: kleines Markdown-Subset (fett, kursiv, Zeilenumbruch, Liste). Keine Links, keine Bilder per URL.
- Mathematik: zwischen `$…$`. Brüche aus Platzhaltern werden automatisch als Bruch gesetzt. *Stand Klasse 5:* Eine kleine eigene Teilmenge reicht – Hochzahl (`^2`, `^{…}`), Wurzel (`\sqrt{…}`) und Malpunkt (`\cdot`), umgesetzt in `src/core/learning/text.ts`. KaTeX (ARCHITEKTUR §4.1) wird erst eingebunden, wenn Inhalte mehr brauchen; bis dahin spart das Ladegröße.
- Zahlen aus Platzhaltern werden automatisch deutsch formatiert (Komma; bei großen Zahlen schmales Leerzeichen als Tausendergliederung *in der Anzeige*).
- Sprachregeln aus LEHRPLAN L-7. Richtwert: Aufgabentexte auf Niveau G höchstens zwei Sätze, Operator am Satzanfang.
- Fachbegriffe: `[[Form]]`, siehe §11.1.

### 11.1 Fachbegriffe mit Erklärung

Das Wörterbuch `content/mathematik/begriffe.yaml` enthält je Fachbegriff eine `id`, das `wort`, die `formen` (genau so geschrieben, wie der Begriff in Texten vorkommt, z. B. `Primzahl`, `Primzahlen`) und eine `erklaerung` in einfacher Sprache (höchstens 35 Wörter, möglichst mit Beispiel). Es reist im Grundpaket mit.

In Aufgabentexten, Hilfen und Fehlerbild-Rückmeldungen steht das **erste Vorkommen** eines Begriffs **je Text** als `[[Form]]`. Die App unterstreicht ihn gepunktet; Antippen zeigt die Erklärung direkt dahinter (L-7). In der Diagnose bleibt die Erklärung aus – dort gibt es keine Hilfen (LEHRPLAN §7).

`pnpm test` prüft: Jede markierte Form steht im Wörterbuch, jedes erste Vorkommen ist markiert, jede Form gehört zu genau einem Begriff, jeder Begriff kommt in einer Vorlage vor. `pnpm inhalte:begriffe` markiert fehlende Stellen in allen Vorlagen, Anleitungen und Fehlvorstellungen automatisch (dort nur in Erklärung und Gegenbeispiel) – danach die Änderungen lesen: Ein Wort kann in einem Satz etwas anderes bedeuten als im Wörterbuch (dann den Satz umformulieren).

## 12. Vollständiges Beispiel: `M.ZO.BR.ERWEITERN`

| Vorlage | Typ | Quelle | G | M | E |
|---|---|---|---|---|---|
| `.MIT-ZAHL` – „Erweitere 2/3 mit 4.“ | bruch-eingabe | Generator | ✅ | | |
| `.ZIELNENNER` – „Erweitere 3/4 auf den Nenner 20.“ | bruch-eingabe | Generator | ✅ | ✅ | |
| `.KUERZEN` – „Kürze 18/24 vollständig.“ (`form: gekuerzt`) | bruch-eingabe | Generator | | ✅ | ✅ |
| `.GLEICHWERTIG` – Gleichheit entscheiden und begründen | auswahl | handverfasst | | | ✅ |
| `.FEHLER-FINDEN` – „Wo steckt der Fehler in Tims Rechnung?“ | fehler-finden | Generator | | | ✅ |

Abdeckung: G 2, M 2, E 3 Vorlagen – erfüllt die Mindestregel (10.1, Punkt 5). Daraus entstehen 7 FSRS-Karten für einen Jugendlichen, der alle Niveaus durchläuft.

## 13. Offene Punkte

| ID | Frage | Tendenz |
|---|---|---|
| I-O1 | Aufgabentyp `rechenschema` für schriftliche Verfahren in Phase 1? | *Beantwortet (29.10.2026, K-29):* als Zwischenschritte mit stellenweiser Eingabe (§17) |
| I-O2 | Termeingabe (z. B. „Stelle einen Term auf“) | Phase 1 nur als `auswahl`; freie Termeingabe frühestens Phase 4 |
| I-O3 | Eigener kleiner Editor für Vorlagen statt YAML von Hand? | Erst, wenn Mitwirkende dazukommen |
| I-O4 | Wie viele Varianten braucht eine handverfasste Vorlage wirklich? | 5 als Startwert, mit FSRS-Daten prüfen |

## 14. Entscheidungen dieses Dokuments

| ID | Entscheidung | Status |
|---|---|---|
| I-1 | Generatoren sind App-Code, Pakete enthalten keinen Code | Entschieden |
| I-2 | Nur YAML als Quellformat | Entschieden |
| I-3 | Alle Texte als Sprachobjekte ab Tag 1 | Entschieden |
| I-4 | Stabile Vorlagen-IDs, Ausmustern statt Löschen | Entschieden |
| I-5 | Komma Standard, Punkt akzeptiert, keine Tausendertrennzeichen | Entschieden |
| I-6 | Ereignis speichert Generator@Version + Seed, bei Fehlern zusätzlich Schnappschuss | Entschieden |
| I-7 | Fehlerbilder für gezielte Rückmeldung und Fehlerwerkstatt | Entschieden |
| I-8 | Review an Inhalts-Hash gebunden | Entschieden |
| I-9 | Herkunft und Lizenz je Vorlage | Entschieden |
| I-10 | Pakete je Fach × Bereich mit allen Niveaus (korrigiert ARCHITEKTUR §6) | Entschieden |
| I-11 | Aufgabentypen `bild-zahl`, `koordinaten-eingabe`, `bild-auswahl`, `anleitung`; Bilder als SVG aus dem Generator | Entschieden |
| I-12 | **Erstvermittlung als Datei je Kompetenz** (`vermittlung.yaml`, §15): Schritte mit festen Typen, Verzweigung über Fehlvorstellungen, geprüfte Wege. Bilder und Interaktion nur über Werkzeuge aus dem App-Code (wie I-1) | Entschieden (29.10.2026, K-24) |
| I-13 | **Fehlvorstellungen als eigene Dateien je Fach** (§16), verknüpft mit den Fehlerbildern der Vorlagen über `fv` | Entschieden (29.10.2026, K-24) |
| I-14 | **Zwischenschritte als `schritte` in der Vorlage** (§17); der Generator berechnet jeden Schritt aus den bisherigen Eingaben | Entschieden (29.10.2026, K-29) |

## 15. Erstvermittlung (`vermittlung.yaml`, VERMITTLUNG §2)

Eine Datei je Kompetenz: `…/<Kompetenz-ID>/vermittlung.yaml`. Sie beschreibt eine Sequenz aus Schritten (Bausteine nach `VERMITTLUNG.md` §2.1). Alle Texte sind Sprachobjekte (I-3). Fachbegriffe werden wie überall mit `[[…]]` markiert (§11.1).

```yaml
id: M.ZO.BR.ERWEITERN            # = Kompetenz-ID
kompetenz: M.ZO.BR.ERWEITERN
niveau: G                        # Niveau der Einstiegsaufgaben im uebergang
dauer_min: 12                    # geschätzt, höchstens 15 (V7)
schritte:
  - id: ziel
    typ: ziel
    text: { de: Danach kannst du einen Bruch so umschreiben, dass er gleich groß bleibt. }
  - id: vorwissen
    typ: anknuepfen
    text: { de: Welcher Anteil ist gefärbt? }
    bild: { werkzeug: bruchstreifen@1, parameter: { teile: 4, gefaerbt: 3 } }
    antwort:
      optionen:
        - { wert: { de: 3/4 }, richtig: true }
        - { wert: { de: 4/3 }, fv: FV.BR.ZAEHLER-NENNER-VERTAUSCHT }
        - { wert: { de: 3/7 }, fv: FV.BR.TEIL-ZU-REST }
    weiter: entdecken
    bei: { sonst: M.ZO.BR.BEGRIFF }       # Rückweg zur Voraussetzung
  - id: entdecken
    typ: entdecken
    text: { de: Teile jeden Abschnitt in zwei Hälften. Wie viel ist jetzt gefärbt? }
    werkzeug: { id: bruchstreifen@1, parameter: { teile: 4, gefaerbt: 3, verfeinern: true } }
    antwort:
      eingabe: { art: bruch, loesung: '6/8' }
    weiter: erklaeren
  - id: erklaeren
    typ: erklaeren
    text: { de: Feiner teilen ändert nicht, *wie viel* gefärbt ist. … }
    bild: { werkzeug: bruchstreifen@1, parameter: { teile: 8, gefaerbt: 6 } }
    weiter: beispiel
  # … beispiel, ergaenzen, gegenbeispiel, merksatz, pruefen
  - id: uebergang
    typ: uebergang
    text: { de: Jetzt probierst du es selbst. }
    vorlagen: [M.ZO.BR.ERWEITERN.ZIELNENNER]
    anzahl: 3
herkunft: ki-entwurf
version: 1
```

**Regeln** (geprüft von `pnpm inhalte:pruefen`):

- `id` und `kompetenz` stimmen mit dem Ordner überein. Die Kompetenz gibt es.
- Jeder Schritt hat eine eindeutige `id` (Kleinbuchstaben, Ziffern, Bindestrich), einen bekannten `typ` und einen Text.
- Der erste Schritt hat den Typ `ziel`, und es gibt genau einen Schritt `uebergang`. Er ist der letzte.
- **Antworten** gibt es bei `anknuepfen`, `entdecken`, `ergaenzen`, `gegenbeispiel` und `pruefen`. Dort ist `antwort` Pflicht, bei den anderen Typen verboten. Es gibt zwei Formen:
  - `optionen`: mindestens zwei, genau eine mit `richtig: true`. Jede falsche Option hat eine `fv` (bei `pruefen` Pflicht, sonst empfohlen).
  - `eingabe`: `art` ist `zahl` oder `bruch`, dazu `loesung`. Optional `fehler: [{ wert, fv }]` für bekannte falsche Eingaben.
- **Weiter:** Jeder Schritt außer `uebergang` hat `weiter`. Das ist die `id` eines Schritts dieser Sequenz.
- **Verzweigungen** (`bei`): Schlüssel sind Fehlvorstellungen oder `sonst`. Ziele sind Schritte dieser Sequenz oder (Rückweg) eine Kompetenz-ID aus `voraussetzungen`.
- **Wege enden:** Von jedem Schritt führt ein Weg über `weiter` zum `uebergang`. Jeder Schritt ist vom ersten aus erreichbar.
- Jede genannte `fv` steht im Fehlerkatalog (§16).
- **Bilder und Werkzeuge** nennen ein bekanntes Werkzeug `name@version` (VERMITTLUNG §2.3). Die Liste steht im Kern, die Umsetzung in `src/ui`.
- `uebergang.vorlagen` nennt mindestens eine Vorlage der Kompetenz, die es auf dem Niveau `niveau` gibt.
- `dauer_min` ist höchstens 15. Texte haben höchstens 40 Wörter je Schritt (V8).
- Pflicht sind außerdem: mindestens ein `beispiel`, ein `ergaenzen`, ein `gegenbeispiel`, ein `merksatz` und ein `pruefen` (V4–V6).
- `herkunft` und `version` wie bei Vorlagen. Das Review folgt I-8.

## 16. Fehlerkatalog (Fehlvorstellungen, VERMITTLUNG §3)

Eine Datei je Fehlvorstellung: `content/mathematik/fehlvorstellungen/<ID>.yaml`. Fehlvorstellungen gehören zum Fach, nicht zu einer Kompetenz, weil dieselbe in vielen Kompetenzen auftritt.

```yaml
id: FV.BR.ADDIERT
name: { de: Rechnet bei Brüchen mit Addition statt Multiplikation }
art: falsche-regel
beschreibung: { de: Überträgt das Rechnen mit natürlichen Zahlen auf Zähler und Nenner … }
kompetenzen: [M.ZO.BR.ERWEITERN, M.ZO.BR.ADD-SUB]
erklaerung:
  kurz: { de: Beim Erweitern wird multipliziert – Zähler und Nenner mit derselben Zahl. }
  lang:
    - { teil: so-denkst-du, de: Du hast zu Zähler und Nenner dieselbe Zahl addiert. }
    - { teil: warum-nicht, de: …, bild: { werkzeug: bruchstreifen@1, parameter: { teile: 2, gefaerbt: 1 } } }
    - { teil: so-stimmt-es, de: … }
gegenbeispiel: { de: 1/2 → 2/3? Ein halber Kuchen ist nicht dasselbe wie zwei Drittel. }
rueckweg:
  vermittlung: M.ZO.BR.ERWEITERN#erklaeren
  voraussetzung: M.ZO.BR.BEGRIFF          # optional
kontrast: [M.ZO.BR.ERWEITERN.ZIELNENNER]
quelle: { de: Fachdidaktik Bruchrechnung }
herkunft: ki-entwurf
version: 1
```

**Regeln:**

- **ID:** `FV.<FELD>.<NAME>` in Großbuchstaben. Sie ist gleich dem Dateinamen und stabil wie Vorlagen-IDs (I-4).
  - `<FELD>` ist das Feld, in dem die Fehlvorstellung zuerst gelernt wird, auch wenn sie später woanders auftritt: `FV.NZ.PUNKT-VOR-STRICH` gehört zu den natürlichen Zahlen, tritt aber auch bei Brüchen auf.
  - `FV.SA.…` steht für Fehler beim Lösen von Sachaufgaben (Frage nicht beantwortet, Angabe übersehen, Rechenart geraten). Sie gehören zu keinem Feld.
  - Die Erklärung muss zu **allen** Fehlerbildern passen, die auf die Fehlvorstellung verweisen, denn sie erscheint unter jedem davon.
- `art` ist eine von: `falsche-grundvorstellung`, `falsche-regel`, `uebergeneralisiert`, `verwechslung`, `lesefehler`, `rechenfehler`.
- `kompetenzen`: mindestens eine, alle vorhanden. Jede Kompetenz, in deren Vorlagen ein Fehlerbild auf die Fehlvorstellung verweist, steht darin (Test in `tools/inhalte/pruefen.test.ts`).
- `erklaerung.kurz` hat höchstens 35 Wörter. `erklaerung.lang` enthält genau die Teile `so-denkst-du`, `warum-nicht` und `so-stimmt-es`, in dieser Reihenfolge (F3, F4).
- `gegenbeispiel` ist Pflicht.
- `rueckweg.vermittlung` hat die Form `<Kompetenz-ID>#<Schritt-ID>`. Hat die Kompetenz schon eine Erstvermittlung, muss es den Schritt geben. `rueckweg.voraussetzung` ist eine Kompetenz-ID.
- `kontrast`: mindestens eine vorhandene Vorlage (F3).

**Fehlerbilder in Vorlagen** bekommen die Fehlvorstellung als `fv`: `nur-nenner: { de: …, fv: FV.BR.NUR-NENNER }`. Ist `fv` gesetzt, muss die Fehlvorstellung existieren. Seit U5b (30.10.2026) ist `fv` für **jedes** Fehlerbild Pflicht (F2, Test in `tools/inhalte/pruefen.test.ts`). Neue Vorlagen bringen ihre Fehlvorstellungen also gleich mit.

*Zuordnung U5a (30.10.2026):* Brüche und Dezimalzahlen (`M.ZO.BR.…`, `M.SF.BR.…`) sind zugeordnet, alle 67 übrigen Fehlerbilder der 40 Vorlagen. Dazu kamen 35 neue Fehlvorstellungen (jetzt 45), zwei vorhandene gelten jetzt auch in weiteren Kompetenzen (`FV.BR.VERTAUSCHT` beim Anteil von, `FV.BR.GEGENTEIL` bei Flächenanteilen). Der Rückweg nennt bei Kompetenzen ohne Erstvermittlung schon den Schritt, den sie später haben soll (etwa `M.ZO.BR.VERGLEICHEN#erklaeren-gleicher-zaehler`). Bis dahin zeigt die App dort keinen Knopf „Zur Erklärung“.

*Zuordnung U5b (Stand 30.10.2026):*

| Feld | Präfix | Fehlerbilder | neue Fehlvorstellungen |
|---|---|---|---|
| Natürliche Zahlen | `M.ZO.NZ.`, `M.SF.NZ.` | 43 | 18; 6 vorhandene `FV.NZ.…` gelten jetzt auch hier, ihre Beispiele kommen ohne Brüche aus |
| Teilbarkeit | `M.ZO.TB.` | 15 | 8; `FV.NZ.GRENZE-MITGEZAEHLT` gilt auch für „größer als“ |
| Rationale Zahlen | `M.ZO.RZ.` | 42 | 14; 9 vorhandene gelten auch hier (Komma, Hochzahl, Wurzel, Ordnen, Punkt vor Strich, Klammer, Striche, Schreibweise) |
| Prozent und Zins | `M.ZO.PZ.` | 31 | 11; `FV.BR.PROZENT-HUNDERTSTEL` und zwei `FV.SA.…` gelten auch hier |
| Terme | `M.SF.TU.` | 26 | 7; Vorzeichen, Quadrat, Vergleichszeichen und Grenze gelten auch hier |
| Gleichungen und Gleichungssysteme | `M.SF.GL.`, `M.SF.GS.` | 37 | 14; darunter `FV.GF.X-Y-VERTAUSCHT`, das zu den Koordinaten gehört |
| Funktionen und Zuordnungen | `M.SF.FK.`, `M.SF.ZU.` | 42 | 13; `FV.ZU.EINDEUTIGKEIT` gilt für Zuordnungen und Funktionen |
| Größen, Flächen, Kreis | `M.GM.GR.`, `M.GM.FL.`, `M.GM.KR.` | 61 | 13 (`FV.GR.…`, `FV.FL.…`, `FV.KR.…`) |
| Körper | `M.GM.KP.` | 49 | 9; dazu `FV.SA.GEGENTEIL-GEFRAGT` |
| Grundformen, Symmetrie, Dreiecke und Vierecke | `M.RF.GF.`, `M.RF.SY.`, `M.RF.DV.` | 64 | 21 (`FV.GF.…`, `FV.SY.…`, `FV.DV.…`) |
| Körper, Kreis und Ähnlichkeit (Raum und Form) | `M.RF.KP.`, `M.RF.KR.`, `M.RF.AE.` | 54 | 14 (`FV.KP.…`, `FV.KR.…`, `FV.AE.…`) |
| Daten und Zufall | `M.DZ.DA.`, `M.DZ.ZF.` | 50 | 13 (`FV.DA.…`, `FV.ZF.…`) |

Damit verweisen alle 596 Fehlerbilder auf eine der 200 Fehlvorstellungen.

**Werkzeuge** (Stand U2c). Neue Werkzeuge kommen in `WERKZEUGE` (`src/core/learning/vermittlung.ts`) und in `src/ui/vermittlung/werkzeuge/`. Ein Test hält beide Listen gleich.

| Werkzeug | Parameter | Interaktiv |
|---|---|---|
| `bruchstreifen@1` | `teile` (1–24), `gefaerbt`, `verfeinern` (Knopf „Jedes Teil halbieren“ statt + und −), `ungleich` (erstes Teil absichtlich größer) | Teile antippen färbt sie; + und − ändern die Zahl der Teile |
| `zahlenstrahl@1` | `von`, `bis` (ganze Zahlen), `einteilung` (Teile je Einheit), `markiert` (Zähler bezogen auf die Einteilung) | Striche antippen markiert eine Stelle |

## 17. Zwischenschritte (`schritte`, VERMITTLUNG §3.6, I-14)

Eine Vorlage mit einer mehrschrittigen Rechnung bekommt `schritte`. Sie erscheinen nur nach einem falschen Ergebnis (K-29).

```yaml
# in vorlagen/ungleichnamig.yaml (M.ZO.BR.ADD-SUB)
schritte:
  - id: nenner
    frage: { de: 'Welcher gemeinsame [[Nenner]] passt zu {a} und {b}?' }
    typ: zahl-eingabe
    fehlerbilder:
      nenner-addiert: { de: Du hast die Nenner addiert. Der gemeinsame Nenner ist ein Vielfaches beider Nenner., fv: FV.BR.NENNER-ADDIERT }
  - id: erster
    frage: { de: 'Erweitere {a} auf den Nenner {nenner}.' }
    typ: bruch-eingabe
    fehlerbilder:
      nur-nenner: { de: Du hast nur den Nenner verändert., fv: FV.BR.NUR-NENNER }
  # … zweiter, summe
```

**Regeln:**

- `id` ist eindeutig. Die Reihenfolge und die IDs sind genau die des Generators (`schritte` im Generator).
- Ein Schritt hat **ein** Eingabefeld: `typ` ist `zahl-eingabe` oder `bruch-eingabe`. Wer zwei Brüche erweitert, macht das in zwei Schritten.
- `frage` darf nutzen:
  - die Platzhalter der Aufgabe,
  - die Platzhalter, die der Generator für diesen Schritt meldet,
  - die Eingaben früherer Schritte (`{nenner}` ist die Eingabe des Schritts `nenner`).
- `fehlerbilder` wie in §7, jedes mit `fv` (F6). Jede Fehlerbild-ID ist beim Generator für diesen Schritt angemeldet, und zu jeder angemeldeten gibt es eine Rückmeldung.
- Die Lösung des letzten Schritts ist das Ergebnis der Aufgabe.
- Brüche zählen in Schritten so, wie sie geschrieben sind: Wer auf den Nenner 12 erweitern soll, schreibt 12 in den Nenner.

**Generator-Schnittstelle** (`src/core/learning/generator.ts`): Der Generator meldet seine Schritte und berechnet jeden Schritt aus Seed, Parametern und den bisherigen gültigen Eingaben. So sind mehrere richtige Wege möglich.

```ts
interface Generator<P> {
  // … wie §6
  readonly schritte?: readonly { id: string; fehlerbildIds: readonly string[]; platzhalter?: readonly string[] }[];
  schritt?(seed: number, param: P, id: string, bisher: Readonly<Record<string, Loesung>>): SchrittAufgabe;
}

interface SchrittAufgabe {
  loesung: Loesung;                          // nach dem zweiten Fehlversuch gezeigt
  fehlerbilder: readonly Fehlerbild[];       // bekannte falsche Eingaben dieses Schritts
  auchRichtig?: (eingabe: Loesung) => boolean;  // weitere richtige Wege, z. B. ein größerer gemeinsamer Nenner
  platzhalter?: Readonly<Record<string, Wert>>;
}
```

Auswertung und Musterweg: `pruefeSchritt` und `musterweg` in `src/core/learning/zwischenschritte.ts`.

**Prüfung** (`pnpm inhalte:pruefen`, `pruefeSchritte`): Schritte passen zum Generator, Fragen nutzen nur bekannte Platzhalter, jedes Fehlerbild ist angemeldet und hat `fv`.

**Pflicht-Tests je Generator mit Schritten** (zusätzlich zu §6.3, automatisch in `pflichttests`), für 10 000 Seeds je Niveau:

- Der Musterweg endet genau beim Ergebnis der Aufgabe.
- Jede Lösung eines Schritts gilt als richtig.
- Jede Fehlerbild-Antwort eines Schritts wird als genau dieses Fehlerbild erkannt und nie als richtig.
- Die Fehlerbild-Antworten eines Schritts sind untereinander verschieden.
- Gemeldete Platzhalter sind gefüllt.

*Umsetzung (U3f, 29.10.2026):* Format, Prüfung, Schnittstelle und Pflicht-Tests stehen.

*Musterfeld Brüche (U3g, 29.10.2026):*

| Vorlage | Schritte |
|---|---|
| `M.ZO.BR.ERWEITERN.ZIELNENNER` | Faktor, erweiterter Bruch |
| `M.ZO.BR.ERWEITERN.KUERZEN` | größter gemeinsamer Teiler, gekürzter Bruch |
| `M.ZO.BR.ADD-SUB.UNGLEICHNAMIG` | gemeinsamer Nenner (jedes gemeinsame Vielfache gilt), erster und zweiter Bruch erweitert, Zähler verrechnet, gekürzt |

- `M.ZO.BR.ADD-SUB.GLEICHNAMIG` nutzt denselben Generator, zeigt aber keine Schritte. Die Schritte passen zu ungleichnamigen Brüchen; eigene Schritte für gleichnamige folgen mit U5.
- Die Generator-Versionen bleiben gleich, weil die Aufgaben selbst unverändert sind. Die Schritte kommen nur dazu.
