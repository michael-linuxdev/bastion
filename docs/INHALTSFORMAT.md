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

**Barrierefreiheit:** Jeder Typ ist vollständig per Tastatur bedienbar. `bruch-bild` hat zusätzlich eine Textbeschreibung („Ein Rechteck aus 8 gleich großen Feldern, 3 davon sind gefärbt“) und eine Alternative ohne Bild.

**Später (offen, I-O1):** `rechenschema` für schriftliche Rechenverfahren mit stellenweiser Eingabe. In Phase 1 wird bei NZ.ADD-SUB bis NZ.DIV nur das Ergebnis geprüft; der Lösungsweg zeigt das Schema.

### 5.1 Normalisierung von Zahleingaben

**Entscheidung I-5:**
- Dezimaltrennzeichen ist das **Komma**. Ein **Punkt wird als Dezimaltrennzeichen akzeptiert** – mit dem freundlichen Hinweis, dass man im Deutschen ein Komma schreibt.
- **Tausendertrennzeichen werden nicht akzeptiert** (weder Punkt noch Leerzeichen innerhalb der Zahl).
- Leerzeichen am Rand, führende Nullen und ein überflüssiges `+` werden ignoriert.

*Warum:* Viele Jugendliche mit DaZ kennen den Dezimalpunkt. Sie dafür als falsch zu werten, misst Konvention statt Mathematik. Tausenderpunkte würden dagegen Mehrdeutigkeit erzeugen („3.500“).

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
}

export interface Fehlerbild {
  id: string;            // muss in der Vorlage unter fehlerbilder stehen
  antwort: Loesung;      // die falsche Antwort, die dieses Fehlerbild erzeugt
}
```

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

## 11. Texte und Darstellung

- Formatierung: kleines Markdown-Subset (fett, kursiv, Zeilenumbruch, Liste). Keine Links, keine Bilder per URL.
- Mathematik: KaTeX zwischen `$…$`. Brüche aus Platzhaltern werden automatisch als Bruch gesetzt.
- Zahlen aus Platzhaltern werden automatisch deutsch formatiert (Komma; bei großen Zahlen schmales Leerzeichen als Tausendergliederung *in der Anzeige*).
- Sprachregeln aus LEHRPLAN L-7. Richtwert: Aufgabentexte auf Niveau G höchstens zwei Sätze, Operator am Satzanfang.

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
| I-O1 | Aufgabentyp `rechenschema` für schriftliche Verfahren in Phase 1? | Nein, nach Phase 1 entscheiden |
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
