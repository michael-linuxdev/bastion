# Fokus-Sitzung „Prüfen statt Bauen“ – Session-Prompt

> Ein Auftrag aus dem Review vom 01.11.2026, der beide Stränge betrifft. Er gilt, bis Paket G und alle Pakete F1 bis F10 erledigt oder vom Projektverantwortlichen gestrichen sind.
> Vorher lesen: `CLAUDE.md`, `docs/SESSION-PROMPT.md`, `docs/session/LERNKERN.md`, `docs/STRATEGIE.md` §0, `docs/INHALTSFORMAT.md` §8.
> **Paket G** bearbeitet der **Strang Grafik** (Branch `grafik/…`, zusätzlich `docs/session/GRAFIK.md` lesen). **F1 bis F10** bearbeitet der **Strang Lernkern** (Branch `lernkern/…`, Protokollzeile in `LERNKERN-PROTOKOLL.md`). Ausnahmen für fremde und gemeinsame Dateien stehen bei jedem Paket.

Stand: 01.11.2026 abends · Widerspruch G0 entschieden (eigener Generator für alles, vor U4b nur Thema `bastion`) · L fast fertig · parallel G2/G5, F4, F5, F6 · **Vorrang: Paket G (Bauen und Ausbau), Entscheidung PV 01.11.2026**

---

## Warum

Das Review vom 01.11.2026 hat ergeben:

- **Technik:** sehr gut. Lint, 5 283 Tests und Build sind grün, die Größenbudgets werden eingehalten.
- **Inhalte:** pädagogisch noch auf null. `pnpm review` zeigt 0 Dateien auf Stufe 2. Nur 22 Dateien des Musterfelds stehen auf Stufe 1. Kein Kriterium der Schwelle in `STRATEGIE.md` §0 ist für irgendeine Klassenstufe erfüllt.
- **Echte Lernende:** Niemand hat die App bisher benutzt (U4b steht aus).
- **Arbeitsverteilung:** Der Grafik-Strang hat am 31.10. rund 130 Design-Ideen umgesetzt und dabei etwa 2 400 Zeilen in `src/ui/ueben/` und `src/ui/eltern/` geändert. Der Lernkern hatte 3 Protokollzeilen. Nach K-27 ist der Basebau Nebensache.
- **Öffentliche Seite:** bastion.micana.de folgt `main` und zeigt nur Entwürfe.

**Der Engpass ist menschliche Prüfung, nicht Code.** Die Pakete F1 bis F10 machen entweder die Prüfung leichter, machen den Test U4b aussagekräftiger oder schützen Lernende vor ungeprüften Inhalten. Neue Funktionen für Lernende gehören **nicht** dazu.

**Ergänzung des Projektverantwortlichen (01.11.2026):** Die Grafik ist entscheidend, weil jugendliche Testerinnen und Tester sie sehr stark beurteilen. Bevor „echte“ Verbesserungen kommen, muss sich die Bastion richtig anfühlen:

- Bauen und Ausbauen müssen **einfacher** werden.
- Die Stufen eines Gebäudes müssen sich **viel stärker unterscheiden**. Ein Ausbau muss sich wie ein Upgrade anfühlen.

Darum gibt es das **Paket G**. Es hat Vorrang vor F2 bis F10. Der Grafik-Strang pausiert nicht, sondern arbeitet nur an G. Der Lernkern kann F1 bis F10 parallel bearbeiten, weil sich die Bereiche nicht überschneiden. **Der Test U4b findet erst statt, wenn G und L abgenommen sind**, damit die Testerinnen Bastion und Lern-Oberfläche nur einmal und dann in guter Form sehen.

**Ergänzung des PV (01.11.2026):** Eingefroren wird nur eine fertige Lern-Oberfläche. Darum kommt vor F2 das **Paket L** (Lern-Oberfläche abschließen). Das Einfrieren aus F1 beginnt erst mit der Abnahme von L. Reihenfolge vor dem Test: L und G abgenommen → U4b.

**Befund vom 01.11.2026 (Vergleichsbild aller Stufen):**

- Alle Gebäudebilder erzeugt ein Python-Skript aus einfachen Formen (`tools/grafik/sprites-p*.py`). Jede Stufe ist dieselbe Kiste mit Dach.
- Beim Bergfried der Epoche 1 wachsen die Stufen 1 → 2 → 3 nur um 294 → 308 → 322 Pixel Höhe, also je etwa 5 %. Dazu kommen ein, zwei Fenster mehr, ein Fähnchen und winzige Punkte unten als Stufenanzeige.
- In Epoche 4 sehen die neun Stufen des Bergfrieds fast gleich aus.
- Beim Späherturm unterscheiden sich Stufe 1 und 2 nur um 12 Pixel Höhe.
- Kein Umriss, kein Stockwerk, kein Material, keine Dachform ändert sich zwischen den Stufen.

---

## Zuerst: Rückfragen an den Projektverantwortlichen

Vor dem ersten Code gesammelt fragen (eine Fragerunde, mit Empfehlung). Antworten unten unter „Entscheidungen“ eintragen und im Entscheidungslog von `ARCHITEKTUR.md` festhalten, wo es eine Architekturfrage ist.

1. **Öffentliche Seite (F2):** Filter im Build (Empfehlung) oder Release-Branch?
2. **Was zeigt die öffentliche Seite, solange keine Kompetenz Stufe 2 hat?** Möglichkeiten:
   - (a) nur eine Hinweisseite „Inhalte werden geprüft“,
   - (b) alles, aber mit sichtbarem Vermerk „Entwurf“ für Eltern,
   - (c) Mindeststufe 1, also vorerst nur das Musterfeld.

   Empfehlung: Den Mechanismus jetzt bauen, die Stufe über eine Repository-Variable steuern (siehe F2) und mit (b) starten, bis das Musterfeld Stufe 2 hat. Danach (c) mit Stufe 2.
3. **Grafik (Paket G):** Die Richtung steht fest (PV, 01.11.2026). Offen sind nur die Fragen in G0: Woher kommen die neuen Bilder? Darf sich die Bau-Regel im Kern ändern?
4. **Klasse 5 als Meilenstein (F7):** bestätigen, dass Klasse 5 die erste Klassenstufe ist, die vollständig Stufe 2 und den Test bestehen soll. Oder soll es Klasse 6 sein, weil das Musterfeld Brüche dort liegt?
5. **Offen aus früheren Sitzungen**, nur abfragen und nicht selbst entscheiden:
   - `potenzen.ts` neue Version (10⁶ statt `10^6`)?
   - Alte Branches (`u5b-*`, `u2-*`, `u3*`) auf GitHub löschen? Das geht nur über GitHub → Branches.

## Entscheidungen

**Fragerunde des Strangs Lernkern mit dem PV (01.11.2026, Branch `claude/fokus-ruckfragen-f1-d1j8g1`):**

Fragerunde mit dem Projektverantwortlichen am 01.11.2026:

1. **Öffentliche Seite (F2):** Filter im Build über `BASTION_MINDESTSTUFE`, kein Release-Branch. `main` bleibt die Werkstatt. Festgehalten als T-20 in `ARCHITEKTUR.md`.
2. **Solange keine Kompetenz Stufe 2 hat:** Option (b). Die Seite zeigt alles, mit dem dezenten Vermerk „Entwurf“ für Eltern (Elternbereich und Startseite, nicht im Lernpfad). Sobald das Musterfeld Stufe 2 hat, stellt der PV die Repository-Variable auf 2 (Option (c) mit Stufe 2).
3. **Grafik (G0):**
   - **G0.1 Bilder:** Probestück in **allen drei** Wegen (a) Generator ausbauen, (b) CC0-Bausätze, (c) von Hand oder mit Bildwerkzeug entworfen. Bergfried, Standard-Thema, Epoche 1, Stufen 1–3, nebeneinander zeigen. Der PV wählt danach.
   - **G0.2 Bau-Regel im Kern:** darf sich ändern, aber **jeder Vorschlag einzeln** mit Zustimmung des PV, als eigener PR, mit `pnpm sim` vorher/nachher und Eintrag in `BASEBAU.md`. Schemaänderungen weiter nur mit Rückfrage und Migrationstest.
   - **G0.3 Themen:** zuerst das Standard-Thema, Epoche 1 vollständig, alle Rollen. Andere Themen und Epochen 2–4 danach.
4. **Meilenstein (F7):** Klasse 5 ist die erste Klassenstufe, die vollständig Stufe 2 und den Test bestehen soll.
5. **Offen aus früheren Sitzungen:**
   - `potenzen.ts` bekommt eine **neue Generator-Version** (10⁶ statt `10^6`). Eigener kleiner Lernkern-PR; nicht Teil von F1–F10 und ohne Vorrang davor.
   - Die alten Branches `u5b-*`, `u2-*`, `u3*` **löscht der PV selbst** über GitHub → Branches. Nicht mergen.

**Paket G, Rückfragen G0 (PV, 01.11.2026):**

- **G0.1 Bildquelle:** Probestück wie empfohlen. Der Bergfried (Epoche 1, Stufen 1–3) wird zweimal gebaut: (a) mit stark ausgebautem eigenem Generator und (b) auf Grundlage eines CC0-Bausatzes. Der PV wählt anhand des Vergleichsbilds. Erst danach geht es in die Breite. Hinweis: kenney.nl ist aus der Cloud-Sitzung gesperrt. Das „Castle Kit 1.0“ (CC0, isometrische Turmteile zum Stapeln) liegt in einem öffentlichen Spiegel auf GitHub (`ETdoFresh/kenney.nl`). Der Lizenztext ist dort enthalten.
- **G0.2 Bau-Regel:** Der Kern darf sich ändern (`src/core/bastion/`, `src/core/ledger/`, z. B. Kosten, Planen und Bauen in einem Schritt). Bedingung für jeden solchen PR: `pnpm sim` vorher und nachher, ein Eintrag in `BASEBAU.md` und eine eigene Zustimmung des PV im PR. Schemaänderungen nur nach Rückfrage und mit Migrationstest (B-29).
- **G0.3 Reihenfolge:** **Alle fünf Themen in Epoche 1** werden erneuert, bevor die Testerinnen kommen. Erst danach folgen die Epochen 2–4. Innerhalb eines Themas gilt die Reihenfolge aus G3: Bergfried, Studierstube, Späherturm, Werkstatt, Tor. Das Standard-Thema im Code ist `bastion`. Es kommt zuerst, weil daran das Probestück entsteht.
- Die Fragen 1, 2, 4 und 5 oben (F2, F7, alte Branches, `potenzen.ts`) gehören zum Lernkern und sind noch offen.

**Entscheidungen des PV, zweite Runde (01.11.2026 abends), lösen den Widerspruch beider Fragerunden auf und gehen vor:**

- **G0.1 Bildquelle: eigener Generator (a), für alles.** Nicht nur Gebäude: auch Umgebung, Boden, Wesen, Himmel, einfach alles in der Bastion, einheitlich für jedes Thema, „aus einem Guss“. Kein Kenney-Bausatz (b) und kein Weg (c) für Bilder. Die Kenney-Sounds (CC0) bleiben. Das Probestück (b) und die Skripte in `tools/grafik/probe/` dienen nur noch als Beleg.
- **Schwellwert Umriss-Test (G3):** 25 % der Fläche und 15 % Höhe je Stufe, wie im Probestück vorgeschlagen.
- **G0.3 Reihenfolge, gilt statt „alle fünf Themen“:** **Vor U4b nur das Standard-Thema `bastion`**, Epoche 1, alle Rollen, mit Boden, Wesen und Himmel aus dem neuen Generator. Die anderen vier Themen und die Epochen 2–4 folgen nach U4b, im selben Stil.
- **G2 erweitert:** Die Stufen-Sprache wird zu einer Stil-Regel für die ganze Bastion (Farbpalette, Licht, Kontur, Materialien, Maßstab, Raster). Gebäude, Boden, Wesen und Himmel richten sich danach.
- **PR #145 (Paket L)** wird gemergt, L18 und der Rundgang folgen in einem eigenen PR.
- **Parallel und abweichend von der Reihenfolge der Pakete:** Neben L dürfen **F4** (Auswertung U4b), **F5** („Fehler-Schüler“) und **F6** (Arbeitsblätter) laufen, je eine eigene Sitzung im Strang Lernkern. Sie ändern die Lern-Oberfläche nicht. F2 folgt nach der Abnahme von L.

---

## Arbeitspakete

Ein Paket ist ein PR (oder mehrere kleine PRs). Reihenfolge wie unten, außer der Projektverantwortliche entscheidet anders. Jedes Paket endet mit `pnpm lint`, `pnpm test`, `pnpm build`, bei Oberflächen-Änderungen zusätzlich `pnpm test:e2e`, dazu einer Protokollzeile und einer Erklärung in einfachem Deutsch: was, warum, wie ausprobieren.

### G – Bauen und Ausbau: einfacher, und jede Stufe ein sichtbares Upgrade (Vorrang)

**Strang Grafik** (Branch `grafik/…`, Protokoll `GRAFIK-PROTOKOLL.md`). Bereich: `src/ui/bastion/`, `src/core/bastion/`, `src/core/ledger/` (nur nach G0), `tools/grafik/`, `tools/sim/`, `public/grafik/`. Dokumente: `GRAFIK.md`, `GRAFIK-SPRITES.md`, `BASEBAU.md`. Die Lern-Oberfläche ändert der Grafik-Strang nicht; sie gehört dem Lernkern (F1, L).

**Ziel:** Eine Jugendliche oder ein Jugendlicher öffnet die Bastion, baut ohne Erklärung ein Gebäude, baut es aus und sagt sinngemäß: „Krass, das sieht jetzt richtig anders aus.“

**Abnahme (Messgrößen, in `GRAFIK.md` festhalten):**

- **Silhouetten-Test:** Jede Stufe eines Gebäudes ist als schwarzer Umriss von der vorigen zu unterscheiden. Automatisch prüfbar, siehe G3.
- **Handy-Test:** Auf 390 Pixeln Breite (iPhone 13) und bei normalem Zoom erkennt man auf dem Bauplatz ohne Antippen, welche Stufe ein Gebäude hat.
- **Bauen:** Vom Bastion-Bildschirm bis „Gebäude steht“ höchstens 3 Tipper, wenn genug Rohstoffe da sind. Ausbauen höchstens 2 Tipper: Gebäude antippen, „Ausbauen“.
- **Gefühl:** 2 bis 3 Jugendliche aus dem Umfeld (formlos, nicht U4b) sehen Vorher und Nachher. Mindestens 2 erkennen ohne Hilfe, welches Gebäude weiter ausgebaut ist, und finden den Ausbau „lohnend“.

**Grenzen, die bleiben:**

- R1–R7, vor allem: keine Zufallsbelohnung, kein Timer, kein Verfall.
- „Bewegung reduzieren“ wird beachtet: Animationen haben eine ruhige Fassung.
- Grafik ändert nie Daten (B-27).
- Größenbudget Grafik 300 KB gzip (heute 203 KB). Atlas-Bilder zählen gesondert: Gesamtgröße vor und nach jedem PR nennen, offline und im PWA-Zwischenspeicher.
- Keine neue Laufzeitabhängigkeit ohne Rückfrage.

#### G0 – Rückfragen an den PV (vor dem ersten Code)

1. **Woher kommen die Bilder?** Das Python-Skript zeichnet aus Formen. Mehr Details allein lösen das Problem wahrscheinlich nicht. Möglichkeiten:
   - (a) Generator stark ausbauen: Stockwerke, Anbauten, Dachformen, Materialwechsel je Stufe.
   - (b) CC0-Bausätze als Grundlage, z. B. isometrische Kenney-Pakete (CC0, mit AGPL vereinbar, lokal gebündelt, keine Netzlast zur Laufzeit), dann im eigenen Stil einfärben.
   - (c) Von Hand gezeichnet oder mit Bildwerkzeugen entworfen, dann vom PV abgenommen. Wie bei Inhalten gilt: KI-Hilfe beim Entwurf ist erlaubt, in der App läuft keine KI (K-23).

   **Empfehlung:** Zuerst ein Probestück. Ein Gebäude (Bergfried, Thema Bastion, Epoche 1, Stufen 1–3) in (a) und in (b) bauen, nebeneinander zeigen, der PV wählt. Erst danach in die Breite gehen.
2. **Darf sich die Bau-Regel im Kern ändern?** Heute gilt: vier Rohstoffarten, Bauschritte über mehrere Lerneinheiten (höchstens zwei am Tag), Planen und Bauen getrennt, Skizze, Einlagern, Ziel vormerken, Bergfried-Grenzen je Epoche. G5 schlägt Vereinfachungen vor. Wenn eine davon `src/core/bastion/` oder `src/core/ledger/` ändert (Kosten, Rohstoffarten, Bauschritte), braucht sie die Zustimmung des PV, einen Lauf von `pnpm sim` mit Vergleich vorher und nachher und einen Eintrag in `BASEBAU.md`. Schemaänderungen nur mit Rückfrage und Migrationstest.
3. **Welche Themen zuerst?** Empfehlung: das Thema, das die Testerinnen sehen werden (Standard-Thema prüfen), Epoche 1 vollständig, alle Rollen. Die anderen Themen und Epochen 2–4 danach. Die Testerinnen erreichen nur Epoche 1.

#### G1 – Bestandsaufnahme mit Belegen

- **Werkzeug `pnpm grafik:stufen`** (`tools/grafik/`): legt alle Stufen je Thema, Epoche und Rolle nebeneinander, als Bild und als Umriss. Die Bilder kommen in den Scratchpad, nie ins Repository. Dient vorher und nachher als Vergleich.
- **Bau-Wege zählen:** mit Playwright die Tipper und Bildschirme für (1) erstes Gebäude bauen, (2) Bergfried auf Stufe 2 ausbauen, (3) mit zu wenig Rohstoffen ausbauen wollen. Jeden Schritt festhalten, an dem man nachdenken oder lesen muss.
- Ergebnis als kurzer Abschnitt in `GRAFIK.md`. Bildschirmfotos für den PV über den Scratchpad schicken.

#### G2 – Stufen-Sprache festlegen (`GRAFIK-SPRITES.md`, neuer Abschnitt „Stufen“)

Regeln, die für jede Rolle und jedes Thema gelten:

- **Jede Stufe ändert den Umriss**, nicht nur Details. Mindestens eines davon: ein Stockwerk mehr, ein Anbau oder Seitenturm, eine andere Dachform, ein Turmaufsatz oder eine Kuppel.
- **Höhe:** spürbar mehr je Stufe, Richtwert mindestens 15–20 %. Bilder dürfen über den Fußabdruck nach oben wachsen; die Felder (`felder`) bleiben gleich. Prüfen, dass Antippen und Überdeckung auf dem Bauplatz weiter stimmen.
- **Material** zeigt den Reifegrad: z. B. Holz → Fachwerk → Stein. Die Epoche ändert den Baustil zusätzlich (G10 bleibt).
- **Belohnende Details** ab höheren Stufen: Banner, Fenster mit Licht, Zinnen, Gerüst-Reste weg, Pflanzen. Keine Glitzer- oder Kisten-Optik (R1).
- **Die Stufe ist ohne Ziffer erkennbar.** Die Punkte unten am Gebäude sind zu klein; sie entfallen oder werden zu einer gut sichtbaren, ruhigen Plakette, nur in der Auswahl.
- Für jedes Thema eine Tabelle: Rolle × Stufe → was ändert sich (wie §4 für die Rollen).

#### G3 – Neue Gebäudebilder, in Chargen

- Reihenfolge: **Bergfried** (er hat die meisten Stufen und ist das Ziel der Epoche 1), dann Studierstube, Späherturm, Werkstatt, Tor. Zuerst das Thema aus G0.3, Epoche 1. Die anderen Themen folgen als eigene PRs, Epochen 2–4 danach.
- Je Charge ein PR mit Vergleichsbild vorher/nachher in der Beschreibung (aus G1).
- **Automatischer Test** (`tools/grafik/atlas-stufen.test.ts`): Für jedes Paar aufeinanderfolgender Stufen unterscheiden sich die Umrisse (Alpha-Maske) um mindestens einen festgelegten Anteil. Startwert z. B. 12 % der Fläche, am Probestück eichen. Dazu die Höhe nach G2. Der Test gilt erst für die erneuerten Chargen und wird Charge für Charge erweitert, bis er für alle gilt.
- Abend-Fenster (`*_fenster.png`) für jede neue Stufe mitliefern.

#### G4 – Der Ausbau-Moment

- **Vorher/Nachher im Bau-Blatt:** aktuelle Stufe und nächste Stufe groß nebeneinander, mit einem Satz, was neu ist („bekommt ein zweites Stockwerk und einen Wehrgang“). Texte in `de.json`.
- **Kurzer Ausbau-Moment auf dem Bauplatz** (etwa 1–2 Sekunden): Gerüst, Staub, das neue Bild erscheint, dazu der vorhandene weiche Bau-Klang (Sound-Stufen beachten). Bei „Bewegung reduzieren“: einfaches Überblenden. Kein Konfetti-Regen und keine Belohnungstruhe (R1). Gilt nur in der Bastion, nie im Lernpfad.
- Danach bleibt die Kamera kurz auf dem Gebäude. Ein Bewohner kann darauf reagieren (vorhandene Statusgesten).
- Ein Bauvorhaben über mehrere Lerneinheiten soll sichtbar wachsen: Gerüst in Abschnitten statt eines Fortschrittsbalkens, wenn die Bau-Regel aus G0.2 bleibt.

#### G5 – Bauen vereinfachen

Aus G1 ableiten. Leitlinie: **eine Hauptaktion je Bildschirm, alles andere unter „Mehr“.**

- **Ausbauen:** Gebäude antippen → großer Knopf „Ausbauen“ mit Kosten → fertig (oder: Bauvorhaben gestartet). Fehlt etwas, sagt der Knopf, was fehlt und wie man es bekommt („noch 2 Lerneinheiten“), statt grau zu sein.
- **Neu bauen:** „Bauen“ → Gebäude wählen → die App schlägt einen freien Platz vor (Geister-Vorschau gibt es schon) → „Hier bauen“. Verschieben geht danach jederzeit kostenlos.
- **Planen, Skizze, Einlagern, Ziel vormerken:** prüfen, ob sie für Einsteiger nötig sind. Sie bleiben möglich, aber hinter „Mehr“, oder Planen und Bauen werden zu einem Schritt zusammengelegt.
- **Rohstoffe:** im Bau-Blatt nur zeigen, was dieses Gebäude braucht und was fehlt, nicht immer alle vier.
- Vorschläge, die den Kern ändern (G0.2), getrennt als eigener PR, nach Zustimmung.
- E2E-Tests für die Bastion (`Bastion als Liste…`, `Bauplatz als Bild…`) anpassen; die Listenansicht (Barrierefreiheit) bleibt voll bedienbar.

#### G6 – Abnahme

- Vergleichsbilder und eine kurze Bildschirmaufnahme (Scratchpad) für den PV.
- Formloser Blick von 2–3 Jugendlichen (siehe Abnahme oben). Ergebnis in `GRAFIK.md`.
- Erst danach: „G abgenommen“ hier eintragen. Damit ist der Weg frei für U4b.

---

### ~~F1 – Grafik auf G beschränken; Lern-Oberfläche erst vor U4b einfrieren~~ (erledigt 01.11.2026; eingefroren wird erst mit der Abnahme von Paket L, siehe dort)

**Entscheidung PV (01.11.2026):** Die Lern-Oberfläche wird **jetzt nicht** eingefroren. In der Woche ab 01.11.2026 arbeitet der PV ohne Cursor und will die Lern-Oberfläche gezielt verbessern. Verbesserungen an Üben, Erstvermittlung, Eingabe, Eltern und Start sind darum ausdrücklich erwünscht, in Sitzungen des Strangs Lernkern (Branch `lernkern/…`), klein und je ein PR. Grenzen: `GRAFIK.md` §9 (im Lernpfad keine Animationen, Wesen, Sound oder Wetter) und R1–R7.

**Einfrieren erst später:** Sobald G abgenommen ist und ein Termin für U4b feststeht, wird die Lern-Oberfläche bis zur Auswertung von U4b eingefroren, sonst lässt sich das Ergebnis des Tests nicht auswerten. Gemeint sind dann `src/ui/ueben/`, `src/ui/vermittlung/`, `src/ui/eingabe/`, `src/ui/eltern/` und `src/ui/start/`; erlaubt sind dann nur Fehlerbehebungen. Die Sitzung, die den Termin einträgt, schreibt die Regel in `docs/SESSION-PROMPT.md` und `AGENTS.md`.

**Jetzt umsetzen:**

- `docs/session/GRAFIK.md`: Oben einen Kasten „Fokus Paket G bis zur Abnahme (Entscheidung PV, 01.11.2026)“ einfügen. „Als Nächstes“ ersetzen durch einen Verweis auf G in `FOKUS.md`. Die Design-Wellen und der Backlog AA–ZZ ruhen bis nach U4b. Der Grafik-Strang ändert die Lern-Oberfläche in dieser Zeit nicht; die Ausnahme „Aufräumen nach `GRAFIK.md` §9“ ruht, Verbesserungen dort macht der Lernkern. Das ist eine Änderung im Grafik-Bereich auf Wunsch des PV, darum eine Protokollzeile in **beiden** Strang-Protokollen.
- `docs/SESSION-PROMPT.md` und `AGENTS.md`: je ein Satz, dass der Grafik-Strang nur an G arbeitet und die Lern-Oberfläche dem Lernkern gehört. Cursor ruht ab 01.11.2026 eine Woche, der Satz gilt trotzdem für danach.
- `docs/PLAN.md` §1: Zeile „Nächster Schritt Grafik“ auf „Paket G: Bauen und Ausbau (FOKUS.md)“ kürzen.

### L – Lern-Oberfläche abschließen (vor F2, Entscheidung PV 01.11.2026)

**Strang Lernkern.** **Ziel:** Die Testpersonen sehen in U4b eine fertige Lern-Oberfläche. Fertig heißt: Jeder Bildschirm sieht gut aus, ist verständlich und lässt sich ohne Stocken bedienen. Erst danach wird eingefroren (Regel 7 in `SESSION-PROMPT.md`).

1. **Bestandsaufnahme:** mit Playwright auf 390 Pixeln Breite (iPhone 13) jeden Weg einmal durchgehen: erste Erklärung (Erstvermittlung), Üben, falsche Antwort mit Diagnose und Rückweg, Zwischenschritte, Fehlerwerkstatt, Wiederholen, Elternbereich (mit Testprotokoll). Jede Stelle festhalten, an der man stockt, raten oder lange lesen muss, oder die schlecht aussieht.
2. **Mängelliste** mit Bildschirmfotos (Scratchpad, nicht ins Repository) an den PV. Bekannt schon jetzt: Tastatur ohne Malpunkt (Primfaktoren) und Doppelpunkt (Uhrzeiten), `LERNKERN.md` §2.
3. **Der PV wählt**, was vor U4b behoben sein muss. Nur das wird gebaut, in kleinen PRs. Keine neuen Funktionen.
4. **Grenzen:** Im Lernpfad keine Animationen, Wesen, Sound oder Wetter (`GRAFIK.md` §9); R1–R7. Funde auf der Startseite (`src/ui/start/`, Bereich Grafik) kommen als Wunsch in `GRAFIK.md`, der Grafik-Strang erledigt sie neben G.
**Stand 01.11.2026:** Schritte 1 und 2 erledigt. Mängelliste L1–L19 an den PV geschickt: A Fehler (L1–L6), B Verständlichkeit (L7–L11), C Bedienung am Handy (L12–L15), D Startseite und Themenwahl (L16–L19, Bereich Grafik). Kein JS-Fehler, kein seitlicher Überlauf. **Auswahl des PV (01.11.2026, Schritt 3):** alle Punkte L1–L19 vor dem Test, dazu **L20: Die Tastatur nutzt die ganze Breite des Bildschirms** (heute nur die linke Hälfte). Gruppe D (Startseite, Themenwahl) macht ausnahmsweise der Lernkern, je ein eigener Commit mit Protokollzeile in beiden Strängen.

**Stand 01.11.2026 abends (Schritt 4, Branch `claude/fokus-ruckfragen-f1-d1j8g1`):** Erledigt L1–L17, L19, L20 (L3 war schon richtig). Offen:
- **L18 Themenwahl kürzen:** Nur der Teil „Neues Thema freigeschaltet erst nach dem ersten Üben“ ist erledigt. Das Einklappen der Bereiche war gebaut, ließ aber den Browser-Test „Zeichen-Anleitung“ scheitern und ist zurückgenommen. Nächster Versuch: Bereiche einklappen, Test mit Aufklappen des Bereichs anpassen.
- Danach: Rundgang wiederholen, Bildschirmfotos an den PV, Abnahme (Schritt 5).

5. **Abnahme durch den PV:** „L abgenommen“ hier eintragen, mit Datum und Commit. **Ab dann gilt das Einfrieren**, bis U4b ausgewertet ist. Der Vermerk „Entwurf“ aus F2 ist danach als Änderung aus diesem Auftrag weiter erlaubt.

### F2 – Öffentliche Seite nur mit geprüften Inhalten

**Ziel:** Lernende sehen nur Inhalte ab einer festgelegten Review-Stufe. `main` bleibt die Werkstatt.

Ausgangspunkt: `src/core/learning/review.ts` hat schon `wirksameStufe` und `OEFFENTLICHE_MINDESTSTUFE = 2`. Die Inhaltspakete baut `tools/inhalte/pakete.ts` und bindet sie über `vite.config.ts` ein.

1. **Regel festlegen und in `INHALTSFORMAT.md` §8 dokumentieren:** Eine Kompetenz ist öffentlich, wenn `kompetenz.yaml`, `vermittlung.yaml`, alle ihre Vorlagen und alle Fehlvorstellungen, auf die diese zeigen, mindestens die Mindeststufe haben. Sonst fällt die ganze Kompetenz heraus, keine halben Kompetenzen. Voraussetzungen, die herausfallen, gelten im Lernpfad als „nicht verfügbar“ und nicht als Lücke. Diese Stelle genau prüfen: Der Lernpfad darf nicht ins Leere zeigen.
2. **Umgebungsvariable `BASTION_MINDESTSTUFE`** (0 bis 3, Standard 0 = Werkstatt). `pakete.ts` filtert damit. Kein zweiter Branch.
3. **Leerer Zustand:** Ist nach dem Filter nichts übrig, zeigt die App eine ruhige Hinweisseite. Die Texte kommen nach `src/ui/texte/de.json`, nichts fest im Code.
4. **Vermerk „Entwurf“** (nur bei Option (b)): ein dezenter Hinweis im Elternbereich und auf der Startseite, wenn Inhalte unter Stufe 2 ausgeliefert werden. Nicht im Lernpfad.
5. **CI:** Den Deploy-Build mit `BASTION_MINDESTSTUFE: ${{ vars.BASTION_MINDESTSTUFE || 0 }}` bauen, damit der PV die Stufe in den GitHub-Einstellungen umstellen kann, ohne Code zu ändern. Prüf-Build und E2E-Tests bleiben bei 0. Das ist eine gemeinsame Datei, also ein eigener kleiner Commit.
6. **Tests:**
   - Filter mit Mindeststufe 0, 1 und 2 an einem kleinen Beispielbestand.
   - Eine Kompetenz mit einer Vorlage auf Stufe 0 fällt ganz heraus.
   - Bei Mindeststufe 2 entsteht heute ein leeres, aber gültiges Paket.
7. **Dokumente:** `ARCHITEKTUR.md`-Entscheidungslog, README („Was ist öffentlich?“), `LERNKERN.md` Punkt 1.3 als erledigt markieren.
8. **Ausprobieren:** `BASTION_MINDESTSTUFE=1 pnpm build && pnpm preview`. Es sollten nur die drei Bruch-Kompetenzen erscheinen.

### F3 – Prüfbogen auffrischen und Ergebnisse einlesen

**Ziel:** Die Lehrkraft soll schnell prüfen können, und ihre Antworten sollen ohne Handarbeit zurück ins Repository kommen.

1. Den Prüfbogen für das Musterfeld neu erzeugen (`pnpm pruefbogen --online --name "Musterfeld Brüche" M.ZO.BR.BEGRIFF M.ZO.BR.ERWEITERN M.ZO.BR.ADD-SUB`). Dann auf derselben Adresse neu veröffentlichen: https://claude.ai/artifact/NKSgnmWBsS1TpZ6uLLLgwy. Vorher die Seite lesen (`action: read`). Liegen schon Eingaben in der Sammlung `bewertung`, diese **nicht** verwerfen. Sie vorher sichern und dem PV melden.
2. Prüfen, wie die Seite heute je Abschnitt bewertet (Ankreuzfelder). Wenn nötig, je Schritt drei Knöpfe ergänzen: „passt“, „passt nicht“, „Kommentar“. Ziel: Eine Lehrkraft schafft eine Kompetenz in 20 bis 30 Minuten am Handy oder Tablet. Nicht nur ausdrucken.
3. **Neues Werkzeug `pnpm pruefbogen einlesen <datei.json>`:** Es liest die exportierten Eingaben der Sammlung `bewertung`.
   - Es erzeugt eine Arbeitsliste in Markdown: je Datei und Schritt der Befund und der Kommentar.
   - Für Dateien, bei denen alles „passt“, schlägt es den Befehl `pnpm review setzen --stufe 2 --pruefer <Name>` vor. Es setzt die Stufe **nicht** selbst; das bleibt eine bewusste Handlung.
   - Tests mit einer erfundenen Bewertungsdatei.
4. Eine kurze Anleitung für die Lehrkraft (eine Seite, `docs/` oder im Prüfbogen selbst): Was wird geprüft, wie lange dauert es, was passiert mit den Antworten.
5. Dem PV sagen, was er tun muss: die Lehrkraft als Bearbeiterin der Seite einladen.

### ~~F4 – Auswertung für U4b vorbereiten~~ (erledigt 01.11.2026: `pnpm auswertung`, `TESTS.md` §4.5)

**Ziel:** Nach dem Test gibt es sofort eine Ja/Nein-Antwort zu den Kriterien in `STRATEGIE.md` §0, nicht nur Rohdaten.

1. `src/core/testphase/protokoll.ts` und `DATENMODELL.md` §4.8 lesen. Was steht in der Datei (`PROTOKOLL_FORMAT = 1`)?
2. **Neues Werkzeug `pnpm auswertung <dateien…>`** (`tools/auswertung/`, im Lernkern-Bereich; Tabelle in `SESSION-PROMPT.md` ergänzen). Die Rechnungen gehören rein und getestet in den Kern (`src/core/testphase/auswertung.ts`). Je Teilnehmer und zusammen:
   - **Kriterium 1:** Wer eine Erstvermittlung abgeschlossen hat, löst danach die Einstiegsaufgaben dieser Kompetenz ohne Hilfe, also ohne Tipp, Erklärung oder „Weiter ohne Weg“. „Einstiegsaufgaben“ zuerst genau festlegen (z. B. die ersten 3 Aufgaben auf Niveau G) und in `TESTS.md` dokumentieren. Ausgabe: x von 3, erfüllt ja/nein.
   - **F5:** Anteil der falschen Antworten mit Fehlerbild, Schwelle 80 %. Dazu die Liste der unbekannten Fehler, gruppiert nach Vorlage.
   - Nutzung der Zwischenschritte, „Weiter ohne Weg“, abgebrochene Erstvermittlungen (Schritt-ID, an dem aufgehört wurde).
   - Ausgabe als Markdown-Bericht, ohne Teilnehmer-Nummern in Dateien im Repository.
3. Tests mit synthetischen Protokollen: ein Fall, der alles erfüllt, und einer, der knapp scheitert.
4. `TESTS.md` §2–3: Ablauf ergänzen (Dateien einsammeln → `pnpm auswertung` → Bericht).

### F5 – „Fehler-Schüler“: Diagnose regelbasiert durchspielen

**Ziel:** Fehler finden, wie Stufe 1 sie gefunden hat (falsche Zuordnung, Rückweg zum falschen Schritt, kurze Erklärung passt nicht), bevor ein Mensch Zeit darauf verwendet. Ohne KI.

1. **Zuerst Bestandsaufnahme:** Was prüfen `tools/inhalte/diagnose.test.ts`, `abspielen.test.ts`, `auswertung.test.ts` und `pruefen.ts` schon? Nur Lücken füllen, nichts doppelt bauen.
2. **Werkzeug `pnpm fehlerschueler`** (oder Tests in `tools/inhalte/`). Für jedes Fehlerbild jeder Vorlage und für mehrere Startwerte des Zufalls:
   - die falsche Antwort erzeugen, wie das Fehlerbild sie beschreibt, sofern das Format sie berechenbar macht,
   - durch die echte Auswertung schicken,
   - prüfen: Es wird genau dieses Fehlerbild erkannt, nicht ein anderes und nicht die richtige Lösung. Die Fehlvorstellung hat eine kurze Erklärung. Der Rückweg zeigt auf einen vorhandenen Schritt einer Erstvermittlung, deren Kompetenz die Vorlage selbst ist oder eine ihrer Voraussetzungen.
   - Dasselbe für die Antwortmöglichkeiten mit `fv` in den Erstvermittlungen.
3. Ausgabe: eine Liste der Verdachtsfälle je Feld. Funde nicht automatisch korrigieren. Inhalte ändern sich nur in eigenen PRs mit Begründung, und geänderte Dateien verlieren ihren Review-Vermerk. Das muss im PR stehen.
4. Neue Prüfungen, die für alle Inhalte gelten und grün sind, werden Pflichttests (`INHALTSFORMAT.md` §6.3).

### ~~F6 – Arbeitsblätter für Lehrkräfte (kleiner Vorläufer von U7)~~

*Erledigt am 01.11.2026 (Branch `lernkern/f6-arbeitsblatt`, parallel zu Paket L nach Entscheidung des PV in #146):* `pnpm arbeitsblatt`, Beschreibung in `tools/README.md`. Die Lern-Oberfläche ist unverändert.


**Ziel:** Lehrkräfte bekommen sofort etwas Nützliches: druckbare Arbeitsblätter mit neuen Aufgaben. Das hilft beim Gewinnen der prüfenden Lehrkraft und ist ein erster Schritt zu Kriterium 4 („eine Klassenarbeit wird als einsetzbar beurteilt“).

- **Als Werkzeug, nicht in der App**, damit es unabhängig von der Lern-Oberfläche bleibt: `pnpm arbeitsblatt <Kompetenz…> --niveau G --anzahl 12 --seed 7 > blatt.html`, im Browser als PDF drucken. Den HTML- und Druck-Teil von `tools/pruefbogen/` wiederverwenden. **Keine neue Abhängigkeit**, kein PDF-Paket.
- Inhalt: Kopf mit Name, Datum und Thema; Aufgaben mit Platz zum Rechnen; zweite Seite mit Lösungen und Lösungsweg. Fußzeile mit Review-Stufe der Vorlagen („Entwurf, nicht fachlich geprüft“ bei Stufe 0).
- Derselbe Seed ergibt dasselbe Blatt (Test). Brüche und Hochzahlen sehen aus wie in der App (Teilmenge aus `src/core/learning/text.ts`).
- Danach dem PV vorschlagen, wie er das Blatt der Lehrkraft zusammen mit dem Prüfbogen anbietet.
- U7 bleibt offen: Die Entscheidung über die PDF-Technik für Prüfungen ist damit **nicht** getroffen. Das so in `PLAN.md` §4b vermerken.

### F7 – Meilenstein „Klasse 5 fertig“ planen

**Ziel:** Eine Klassenstufe, an der die Schwelle wirklich messbar wird. Nur planen, nicht prüfen. Die Prüfung macht ein Mensch.

1. Die Menge festlegen: Kompetenzen mit `5` in `klassenstufe_typisch` (heute etwa 79 Treffer; manche nennen mehrere Stufen). Mit `LEHRPLAN.md` §8 abgleichen. Die Liste kommt in `PLAN.md` §4b als neuer Meilenstein „M5“.
2. **Stichproben-Regel für Stufe 2** in `INHALTSFORMAT.md` §8 vorschlagen (PV entscheidet). Beispiel: Erstvermittlung und Fehlvorstellungen vollständig lesen; je Vorlage ein Niveau mit 20 erzeugten Aufgaben.
3. **Reihenfolge der Felder** nach Abhängigkeiten im Kompetenzgraph, mit grober Zeitschätzung je Feld auf Grundlage der Erfahrung aus F3.
4. **Stufe 1 vorziehen:** Felder der Klasse 5 bekommen Stufe 1 (zweites Modell, frische Sitzung, Prüfkatalog §8) **vor** der Lehrkraft, Feld für Feld, je ein PR. Das darf in späteren Sitzungen laufen, sobald F1 bis F6 stehen.
5. `pnpm review` um einen Filter nach Klassenstufe erweitern (`pnpm review --klasse 5`), damit der Fortschritt sichtbar ist.

### F8 – `App.svelte` aufteilen (ohne sichtbare Änderung)

**Ziel:** Weniger Konflikte in der gemeinsamen Datei. Gut jetzt, weil der Grafik-Strang ruht.

- `src/ui/App.svelte` (1 180 Zeilen): Ansichtswechsel und Zustand in eine eigene Datei (`src/ui/ansicht.svelte.ts` o. Ä.), jede Ansicht in eine eigene Komponente. Nur Runes-Syntax.
- **Keine Verhaltensänderung.** Alle E2E-Tests bleiben unverändert grün. Wenn ein Test angepasst werden muss, ist das ein Zeichen für eine Verhaltensänderung: stoppen und erklären.
- Gemeinsame Datei, also eigener PR, Protokollzeile in beiden Strängen.
- `grafik-buehne.ts` (2 020 Zeilen) und `Bastion.svelte` **nicht** anfassen. Stattdessen unter „Wünsche aus dem anderen Strang“ in `GRAFIK.md` eintragen, für die Zeit nach der Pause.

### F9 – Schrägstrich-Brüche: Vorschau statt Entscheidung

**Ziel:** Die offene Frage (etwa 3 600 Stellen `1/4` statt `$\frac{1}{4}$`) wird zu einer Ja/Nein-Entscheidung mit Vorschau.

- **Werkzeug `pnpm inhalte:brueche`:** Es findet Brüche mit Schrägstrich in Texten und schreibt einen Bericht mit vorher/nachher je Datei (Markdown oder HTML zum Durchblättern). Ausnahmen erkennen und auflisten statt umschreiben: Einheiten (`km/h`, `m/s`), Datumsangaben, Verhältnisse, Texte innerhalb von `$…$`.
- `--anwenden` erst bauen oder benutzen, wenn der PV entschieden hat. Achtung: Das ändert den Review-Hash der 22 Dateien auf Stufe 1. Sie fallen auf Stufe 0 zurück. Das muss in der Rückfrage stehen. Empfehlung: Erst nach der Rückmeldung der Lehrkraft zum Musterfeld anwenden.
- Tests: Ausnahmen bleiben unverändert; ein Durchlauf ändert nichts mehr (idempotent).

### F10 – Stand-Dokumente straffen

**Ziel:** Der PV soll den Stand in 30 Sekunden lesen können.

- `docs/PLAN.md` §1: jede Zeile höchstens zwei Sätze. Erledigtes steht in den Protokollen, nicht in „Nächster Schritt“.
- Kopfzeile „Stand:“ in `docs/session/GRAFIK.md` und `LERNKERN.md`: ein Satz.
- `docs/SESSION-PROMPT.md`: doppelte Trennlinien (`---` / `---`) entfernen und die Lesereihenfolge um diese Datei ergänzen, solange sie gilt.
- Nichts inhaltlich streichen, was eine Entscheidung dokumentiert.

---

## Nicht in diesem Auftrag

- Neue Funktionen in Lernpfad, Grafik oder Sound, außer Paket G. Auch in G keine neuen Themen, Epochen, Wesen oder Wetter.
- Neue Inhalte, Kompetenzen oder Klasse 9 bis 12 (bleibt gesperrt, `LERNKERN.md` 1.6).
- Review-Stufe 2 setzen ohne menschliche Prüfung.
- Neue Laufzeitabhängigkeiten; für F2 bis F9 ist keine nötig.

## Kleinigkeiten nebenbei (nur wenn sie im Weg sind)

- `fk.graph-ablesen` überschreitet lokal manchmal die Zeitgrenze: Ursache suchen statt Zeitgrenze erhöhen.
- Voller Testlauf etwa 3,5 Minuten: Wenn F5 viele Fälle erzeugt, diese in `pnpm inhalte:pruefen` bündeln und nicht in jeden `pnpm test`-Lauf legen. Vorher mit dem PV klären, ob die CI sie trotzdem ausführt.

---

## Übergabe

Jede Sitzung, die hier arbeitet, trägt am Ende ein:

- Paket, Stand, PR-Nummer; Erledigtes mit Datum durchstreichen,
- neue Rückfragen an den PV,
- eine Zeile im Protokoll des eigenen Strangs (bei F1 und F8 in beiden),
- `docs/PLAN.md` §1, Zeile des eigenen Strangs.

Sind alle Pakete erledigt: Diese Datei bleibt als Beleg stehen. Der Verweis in `SESSION-PROMPT.md` wird entfernt. Das Einfrieren der Lern-Oberfläche (ab Abnahme von L, spätestens ab Termin U4b) und die Ruhe der Design-Wellen enden erst nach der Auswertung von U4b.

### Übergaben

- **01.11.2026, Lernkern (Branch `claude/fokus-ruckfragen-f1-d1j8g1`):** Rückfragen gestellt und unter „Entscheidungen“ eingetragen (T-20 im Entscheidungslog). ~~F1~~ erledigt: Kasten und neues „Als Nächstes“ in `GRAFIK.md`, Regel 7 in `SESSION-PROMPT.md`, Punkt 4 in `AGENTS.md`, `PLAN.md` §1. Neue Rückfragen: keine. Danach auf Wunsch des PV: Paket L vor F2 eingefügt, Einfrieren beginnt erst mit der Abnahme von L. Paket L: Bestandsaufnahme, Auswahl des PV, L1–L17, L19, L20 umgesetzt. Als Nächstes: L18 fertig, Rundgang, Abnahme L; dann F2.
- **01.11.2026, Strang Grafik, Paket G** (Branch `grafik/paket-g-g0-g1`): ~~G0 Rückfragen~~ (siehe „Entscheidungen“) · ~~G1 Bestandsaufnahme~~ (`pnpm grafik:stufen`, Bau-Wege gemessen, `GRAFIK.md` §11.2–11.3) · G0.1 Probestück gebaut (`GRAFIK.md` §11.4, Skripte `tools/grafik/probe/`). **Rückfrage an den PV:** Variante (a) Generator oder (b) Kenney-Bausatz, oder eine Mischung, z. B. (b) für Stein und Burg und (a) für Holz, Garten und Unterwasser? Außerdem: Schwellwert für den Umriss-Test 25 % statt 12 %? Danach folgen G2 (Stufen-Sprache) und G5 (Ausbauen beim Antippen des Gebäudes), unabhängig von der Bildwahl.
- **01.11.2026, Strang Grafik, G5 Teil 1** (Branch `grafik/g5-bauen-einfacher`, baut auf #143 auf): Ausbauen beim Antippen in 2 Tippern, „was fehlt“ mit Menge und Herkunft, Skizze und Vormerken unter „Mehr“ (`GRAFIK.md` §11.5). Offen in G5: Bauplatz-Vorschlag mit „Hier bauen“ und Planen und Bauen zusammenlegen (Kern, B-29).
- **01.11.2026, Strang Grafik, G2** (Branch `grafik/g2-stilregel`): Stil-Regel für die ganze Bastion als Entwurf in `GRAFIK-SPRITES.md` §12 (Raster, Maßstab, Licht, Kontur, Palette, Materialleiter, Stufen-Sprache, Tabelle Rolle × Stufe Thema `bastion` E1). **Rückfrage an den PV:** Regel abnehmen (Checkliste §12.9), dann G3.
- **01.11.2026, Lernkern, F6** (Branch `lernkern/f6-arbeitsblatt`): ~~F6~~ `pnpm arbeitsblatt <Kompetenz…> --niveau G --anzahl 12 --seed 7 > blatt.html`: Kopf, Aufgaben mit Rechenkasten, Lösungsseite mit Lösungsweg, Fußzeile mit der schwächsten Review-Stufe; gleicher Seed, gleiches Blatt (Test). Gemeinsamer Satz von Prüfbogen und Blatt in `tools/pruefbogen/satz.ts`. PLAN §4b: PDF-Technik für U7 nicht entschieden. Vorschlag für die Lehrkraft an den PV geschickt. Neue Rückfragen: keine.
