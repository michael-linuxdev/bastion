# Strang Oberfläche – Session-Prompt

> Für Sitzungen, die an UI und UX **außerhalb der Bastion** arbeiten: Startseite, „Mehr“, Elternbereich, Über mich, Sicherung, Hinweise der App-Hülle.
> Vorher den gemeinsamen Teil lesen: `docs/SESSION-PROMPT.md`. Am Ende der Sitzung diese Datei und §4c in `docs/PLAN.md` aktualisieren, je PR eine Zeile unten in `docs/session/OBERFLAECHE-PROTOKOLL.md`.

Stand: 05.11.2026 · **Aktueller Auftrag: Q-O1 Lern-Oberfläche überarbeiten** (`docs/session/QUALITAET-5-10.md`, K-32): Rundgang und Mängelliste A1–D5 erledigt (dort unter Q-O1), PV: alle Punkte in Reihenfolge 1–5; PR (1) bis (4) erledigt (Fehler, Rückmeldung, Themenwahl, Erstvermittlung), als Nächstes PR (5) Kleines. Zuständigkeit erweitert auf Aufbau und Aussehen von `src/ui/ueben/`, `src/ui/vermittlung/`, `src/ui/eingabe/`. · 04.11.2026 · O15–O22 Bedienbarkeit (PV: „alles umsetzen“) · 03.11.2026: Strang angelegt (PV) · Startseite aufgeräumt (O1) · „Mehr“ aufgeräumt (O2) · Spiel-Banner und alle Kacheln (O3) · Symbole aus einem Guss (O4) · Elternbereich gegliedert (O5) · Feinschliff O6–O10 (Wunsch PV: „alle Vorschläge bauen“)

---

## Entscheidungen des PV (03.11.2026)

1. **Neuer Strang „Oberfläche“**, Branch `oberflaeche/…`, eigenes Protokoll.
2. **Sperre aufgehoben:** `src/ui/start/` und `src/ui/eltern/` sind nicht mehr eingefroren (`SESSION-PROMPT.md` Regel 7). Die Lern-Oberfläche (`ueben/`, `vermittlung/`, `eingabe/`) bleibt eingefroren.
3. **Umbau erlaubt:** nicht nur Optik und Texte, auch Aufbau, z. B. doppelte Kacheln entfernen, Formulare auf eigene Seiten legen, den Elternbereich gliedern. Keine neuen Lern-Funktionen.
4. **Mergen:** kleine PRs, je Bereich einer. Merge per Squash ohne den PV, sobald lint, test, build und E2E grün sind.

## Zuständigkeit

**Seit 05.11.2026 (K-32):** zusätzlich Aufbau, Abstände, Hierarchie, Karten und Texte in `src/ui/ueben/`, `src/ui/vermittlung/` und `src/ui/eingabe/` (Paket Q-O1). Die Logik dort (Auswertung, Abspieler, Diagnose, Ereignisse) bleibt beim Lernkern; Änderungen im Protokoll des Lernkerns melden.

Siehe Tabelle im gemeinsamen Teil. Kurz: `src/ui/start/` (ohne das Bastion-Bild selbst), die Hülle des Elternbereichs (`src/ui/eltern/Elternbereich.svelte`, `PinVermerke.svelte`, `SafariWeg.svelte`), `src/ui/profil/`, `src/ui/sicherung/`, `src/ui/UpdateHinweis.svelte`. Texte in `src/ui/texte/de.json` mit den Präfixen `start.`, `mehr.`, `eltern.`, `profil.`, `sicherung.`.

**Grenzen:**

- Die Bastion (`src/ui/bastion/`, Bühne, Bilder) gehört dem Strang Grafik. Wünsche dorthin unter „Wünsche aus dem anderen Strang“ in `GRAFIK.md`.
- Fach-Bausteine im Elternbereich (Aufgabenblatt, Druck, Testphase, Bericht) gehören dem Lernkern. Ihr Aussehen (Knöpfe, Abstände, Tokens) darf hier angeglichen werden, ihre Logik nicht.
- `src/ui/grund.css` (Tokens) gehört dem Grafik-Strang. Neue Tokens nur klein und in einem eigenen Commit.
- `App.svelte` ist gemeinsam: nur kleine Änderungen, eigener Commit.
- Keine neuen Daten, kein Schema, keine neue Abhängigkeit ohne Rückfrage.

## Befund vom 03.11.2026 (Rundgang, Handy 390 px und Desktop)

**Start:** Kopf doppelt („Bastion“ und „Willkommen in Bastion.“), drei Kleinzeilen; Bastion-Bild am Desktop und beim ersten Start oben abgeschnitten; Kacheln uneinheitlich (Symbol mal neben, mal über dem Text, „Bastion“ ohne Untertitel); „Wo stehe ich?“ und „Mein Stand“ doppelt zu „Mehr“; beim ersten Start hängt das Formular „Über mich“ unter der Startseite.

**Mehr:** drei Überschriften übereinander („Werkstatt“, „Bastion“, „Mehr“), Entwickler-Satz „Wenige Einträge – ohne Suche.“, gleiches Symbol für drei Einträge, „Kein Konto. Kein Tracking.“ doppelt.

**Elternbereich:** eine lange Seite ohne Gliederung (≈ 3 400 px am Handy); Knöpfe in drei Stilen (winzig grau, schwarz, grün); ungestaltete Auswahlliste; Fachsprache („Ledger“, „Security-Theater“, „Probe-Ansicht“, „Basebau“); Anrede wechselt zwischen „Sie“ und „du“.

## Aktueller Auftrag

1. Strang anlegen (dieser PR).
2. ~~Startseite aufräumen.~~ Erledigt (O1): Kopf mit Name, Gruß und höchstens einem leisen Satz; „Was bedeuten die Türen?“ entfällt; „Kein Konto“ und Entwurf-Vermerk ruhig am Seitenende; Startbild in festem Seitenverhältnis (16 : 10 am Handy, 2 : 1 ab 36rem), nicht mehr abgeschnitten; Bastion-Tür mit Infozeile, alle Nebenkacheln im selben Stil; beim ersten Start nur die kleine Karte „Über mich“ (`ProfilEinladung.svelte`) statt des Formulars.
2a. ~~Wunsch PV: „Bastion“ als Banner wie ein Spieltitel, Farbverlauf raus, immer alle Kacheln.~~ Erledigt (O3): Bild und Name „BASTION“ in einem Banner (gold mit Kontur, leicht schräg, Schleier unten); kein Verlauf hinter dem Kopf; keine „erste Minute“ mehr, kein „Mehr entdecken“: Üben, Bastion, Mehr, Wiederholen, Fehlerwerkstatt, Wo stehe ich?, Mein Stand immer sichtbar, leere sind ausgegraut.
3. ~~„Mehr“ aufräumen.~~ Erledigt (O2): nur noch Zurück und eine Überschrift „Mehr“ (ohne „Werkstatt“, „Bastion“, „Wenige Einträge“); jeder Eintrag mit Symbol und einer Infozeile wie die Kacheln der Startseite; Zone „Für Erwachsene“ nur, wenn es den Elternbereich gibt, ohne Versionszeile; Vertrauen in einem Satz am Ende; Offline-Hinweis oben als Hinweiskarte. Symbole `person`, `sicherung`, `kalender` als Wunsch an den Strang Grafik.
3a. ~~Wunsch PV: Symbole in den Menüs neu und aus einem Guss.~~ Erledigt (O4): `src/ui/grafik/Symbol.svelte` neu (24er-Raster, nur Striche, runde Enden); neue Symbole `person`, `sicherung`, `kalender` für „Mehr“; Symbole auf hellen Kacheln einheitlich in der Akzentfarbe. Ausnahme vom eigenen Bereich, weil der PV es ausdrücklich verlangt hat; Hinweis im Protokoll Grafik.
4. ~~Elternbereich gliedern und angleichen.~~ Erledigt (O5): Sprungleiste (Bericht, Klasse, Sicherung, Bastion, Aufgabenblatt, Testphase) und je Abschnitt eine Karte; PIN-Eingabe und Wiederherstellungscode als Karte; Knöpfe und Felder einheitlich, auch in den Bausteinen darunter (nur Aussehen, über `:global` in der Hülle); Texte ohne „Security-Theater“, „Ledger“, „Kind-Bastion“, „Basebau“; Texte zu Bastion-Schalter und Wetter ohne „du“, weil sie auch Eltern lesen.

5. ~~Vorschläge 1–11 (PV: „Baue alles davon“).~~ Erledigt:
   - **O6** `Seitenkopf.svelte` (Zurück mit Symbol, große Überschrift, Marke, Hinweis) für Mehr, Elternbereich, Über mich, Sicherung; Zurück aus Unterseiten von „Mehr“ führt nach „Mehr“; „Über mich“ (`UeberMich.svelte`) und „Sicherung“ als Karten.
   - **O7** Zahl-Plaketten auf Wiederholen und Fehlerwerkstatt (ruhig, ohne Rot); Rückkehr-Hinweis kürzer; Antippen des Banners öffnet die Bastion (nur Zeiger, die Tür bleibt für Tastatur).
   - **O8** Elternbereich: Klappkarten (nur Bericht offen), Sprungleiste bleibt oben und klappt auf, „Nach oben“; PIN groß mit Ziffernabstand, höchstens 8 Ziffern, Regel am Feld. Einzelne Ziffernfelder bewusst nicht: Ein Feld bleibt für Passwort-Manager und Tests stabil.
   - **O9** Bericht-Umschalter als Segmente in einer Zeile; Wetter und Bastion-Schalter mit „Sie“ für Eltern und „du“ für Jugendliche (`durch`); Banner am Abend mit dunklerem Schleier und warmem Schein.
   - **O10** Rundgang Tastatur, Screenreader, Kontrast: alle Texte ≥ 5,9 : 1, Fokus-Ring sichtbar. Behoben: Banner-Titel nicht doppelt vorgelesen; Türen und Kacheln heißen nur nach ihrem Namen, Infozeile als Beschreibung; ausgegraute Kacheln mit `aria-disabled` statt `disabled`, damit sie mit der Tastatur erreichbar bleiben; Bericht-Umschalter mit Namen; „Über mich“ nicht mehr doppelt als Region.

6. ~~Zurück-Knopf auch bei Mein Stand, Wo stehe ich?, Klassenarbeit (PV: „fass an“).~~ Erledigt (O11): `ZurueckKnopf.svelte`, auch im Seitenkopf; ebenso in der Fehlerwerkstatt. Nur der Knopf in `App.svelte`, die Seiten selbst unverändert.
7. ~~Zurück-Knopf auch in Übung, Anleitung, Erstvermittlung, Angebot und Wiederholen-Regal (PV).~~ Erledigt (O12): `ZurueckKnopf.svelte` überall; nur der Knopf, sonst nichts an der Lern-Oberfläche geändert.
8. ~~Neue Funktionen mit Tests absichern.~~ Erledigt (O13): `tests/e2e/oberflaeche.spec.ts` (Banner, Plaketten, erreichbare ausgegraute Kacheln, Seitenkopf, Klappkarten, Sprungleiste, PIN-Feld). `pnpm budget`: App-Hülle 182 von 250 KB.
9. ~~Erststart: Installationsanleitung wie in `michael-linuxdev/einbuergerung` (PV).~~ Erledigt (O14): Auf Handy und Tablet im Browser erscheint zuerst „Zuerst Bastion installieren“ mit Schritten für das erkannte Gerät (`plattform/geraet.ts`, 16 Anleitungen), drei Gründen, dem Hinweis für iPhone/iPad (Browser-Stand kommt nicht mit in die App) und „Ohne Installation im Browser weiter“ (gilt bis zum nächsten Öffnen, `sessionStorage`). Danach eine ruhige Leiste „App nicht installiert – Installieren ›“ auf der Startseite. Unter „Mehr“: „Als App installieren“ mit dem eigenen Gerät und anderen Geräten. Bietet der Browser selbst ein Installieren an (`beforeinstallprompt`), steht „Jetzt installieren“ darüber. Am Computer keine Sperre und keine Leiste. Keine neue Abhängigkeit, keine Netzabfrage.

10. ~~Bedienbarkeit, zwei Rundgänge vom 04.11.2026 (PV: „Setze alles davon um“, auch Punkt 6 selbst).~~ Erledigt:
   - **O15 Zurück-Taste des Geräts** (`App.svelte`): Außerhalb der Startseite liegt genau ein eigener Eintrag im Verlauf. Zurück (Taste, Wischgeste, Browser) drückt den sichtbaren Zurück-Knopf der Seite (`data-zurueck` in `ZurueckKnopf.svelte`), ohne Knopf geht es zur Startseite. Zurück per Knopf in der App nimmt den Eintrag wieder weg. Nach jedem Wechsel: oben anfangen, Fokus auf die Überschrift (`tabindex=-1`, ohne Rahmen), Titel im Tab „Seite – Bastion“.
   - **O16 Startseite:** Spalten nach Platz (`auto-fit`, `minmax(min(100%, 10rem), 1fr)`): bei großer Schrift untereinander, kein Seitwärts-Wischen. Lange Namen brechen um. Üben-Tür nennt „Klasse 5 · Thema“ (Thema nur, wenn die Inhalte schon geladen sind; kein zusätzliches Laden beim Start). Leere Kacheln (Wiederholen, Fehlerwerkstatt) bleiben (O3), stehen aber flacher hinter den aktiven – im Code in derselben Reihenfolge, damit Tastatur und Screenreader sie gleich erleben. Handy quer: Banner höchstens 40 % der Höhe. Ab 64rem quer: Banner links (klebt), Türen rechts, Spalte 64rem.
   - **O17 Erststart:** „Ohne Installation im Browser weiter“ als Knopf direkt nach den Schritten (auf iPhone/iPad nach der Warnung), Gründe darunter. Die Wahl merkt sich das Gerät (`localStorage`); auf iPhone/iPad weiter nur bis zum nächsten Öffnen, weil der Stand aus dem Browser nicht mit in die App kommt. Karte „Über mich“ erst nach der ersten Aufgabe.
   - **O18 Mein Stand** (Ausnahme von Regel 7, PV): oben eine Karte mit Zusammenfassung bzw. Einstiegssatz und „Weiter mit: …“; Klasse als Segmentleiste (`KlassenWahl kompakt`, Feldnamen bleiben „Klasse 6“); Bereiche der Landkarte als Klappkarten mit „x von y sicher · z in Arbeit“, offen nur Bereiche mit laufenden Themen (sonst der erste); Themennamen ungekürzt. Bastion-Schalter nicht mehr hier.
   - **O19 Einstellungen** (`src/ui/profil/Einstellungen.svelte`, unter Mehr): Schriftgröße (Normal, Groß 112,5 %, Sehr groß 125 %; neue Einstellung `darstellung.schrift`, kein neues Schema), Bastion an/aus, Abend in der Bastion, kräftiger Text, Ton, Bildschirm. „Über mich“ enthält nur noch die Angaben und einen Hinweis für Geschwister an einem Gerät. Wetter, Kamera und Bewegung bleiben in der Bastion.
   - **O20 PIN und Kleines:** Regel nur noch am Feld, mit ✓, sobald sie erfüllt ist; „Beide Eingaben stimmen überein“ bzw. „stimmen nicht überein“ schon beim Tippen. Zurück-Knopf mit Hover nur bei Maus (am Handy blieb die Fläche stehen). Unter Mehr sagt die Infozeile der Sicherung, wenn sie wieder dran ist.
   - **O22 Punkt 6 selbst** (Ausnahme PV von Regel 1 und 7): Übungsbild größer (`max(10rem, 28dvh)`), Beschriftung fett mit hellem Rand; „Zeichnen lernen“ als kleine Karte mit einer Zeile je Anleitung; Prüfen-Hinweis kräftiger und per `aria-describedby` am Knopf. Bastion: „Vorrat zeigen“ als Plakette mit Fläche.
   - **Geprüft, war schon da:** Zifferntastatur der PIN (`inputmode="numeric"`), Enter prüft (Formular), Seite „Fertig für heute“ (R5), Meldung bei fehlendem Inhaltspaket mit „Nochmal“, Datum der letzten Sicherung und Bestätigung nach dem Einspielen.
   - **Bewusst nicht gebaut:** Elternbereich ohne erneute PIN offen lassen – ein Kind bekäme das Gerät sonst direkt mit offenem Elternbereich zurück. Dunkelmodus: Lernflächen bleiben nach Design L61 hell; Wunsch zum Banner-Schleier an Grafik. Bericht in Alltagssprache gehört zum Lernkern-Baustein. Entwurf-Vermerk bleibt auf Start (für Lernende) und im Elternbereich (T-20 verlangt ihn für Eltern).

## Nächste Schritte

1. ~~**Q-O1** Rundgang der Lern-Oberfläche auf 390 px, Mängelliste an den PV.~~ Erledigt 05.11.2026: 74 Bildschirme, Mängelliste A1–A3, B1–B10, C1–C6, D1–D5 in `QUALITAET-5-10.md` unter Q-O1 (mit Empfehlung je Punkt und Vorschlag der Reihenfolge).
2. **Auswahl des PV (05.11.2026, über die koordinierende Sitzung): alle Punkte, Reihenfolge 1–5.** Kleine PRs, je Bildschirm einer: ~~(1) Fehler A1–A3~~ (erledigt 05.11.2026), ~~(2) Rückmeldung als ein Kasten~~ (erledigt 05.11.2026), ~~(3) Themenwahl~~ (erledigt 05.11.2026), ~~(4) Erstvermittlung~~ (erledigt 05.11.2026), (5) Kleines. Browser-Tests in `ueben.spec.ts` dürfen mit, wenn nur das Aussehen wechselt; A3 ändert Verhalten (Zurück aus der Erstvermittlung), der Test wird bewusst angepasst und im PR begründet, Meldung im Lernkern-Protokoll.

Vorschläge von früher:

- Start: Querformat am Tablet einmal am echten Gerät ansehen.

## Wünsche aus dem anderen Strang

_(noch keine)_

## Wünsche an andere Stränge

- An Grafik (04.11.2026): Banner bei dunklem Gerät ohne grauen Schleier (`GRAFIK.md`, Wünsche).
- An Grafik (05.11.2026, Q-O1 D2): fünf Symbole für die Bereiche der Themenwahl (Zahlen und Rechnen, Terme und Gleichungen, Größen und Messen, Raum und Form, Daten) in `Symbol.svelte`, im Stil von O4. Die Themenwahl zeigt bis dahin keine Bilder.

- ~~An Grafik (03.11.2026): Symbole `person`, `sicherung`, `kalender`.~~ Selbst erledigt in O4 (Wunsch PV).

## Übergabe und Lehren

**Übergabe (05.11.2026, Branch `oberflaeche/q-o1-lernoberflaeche`):** Rundgang für Q-O1 gemacht, Mängelliste in `QUALITAET-5-10.md`. Das Skript des Rundgangs (Playwright, 390 × 844, iPhone-13-Profil, alle Lernwege mit Bildschirmfoto je Schritt) liegt im Scratchpad der Sitzung und ist in ein paar Minuten neu geschrieben: Wege wie in `tests/e2e/ueben.spec.ts` (Helfer `themenWaehlen`, `thema`, `angebotUeberspringen`), je Bildschirm `page.screenshot` plus `document.documentElement.scrollWidth` für den Überlauf. Noch nichts gebaut; es wartet auf die Auswahl des PV.

**Übergabe (03.11.2026):** O0 ist auf `main` (#239). O1 bis O5 kommen gemeinsam in einem PR (Branch `oberflaeche/eltern`), weil die Schritte aufeinander aufbauen; die Commits bleiben einzeln lesbar. Offen sind die Vorschläge oben unter „Nächste Schritte“.

**Lehren:**

- Die Unit-Tests (`pnpm test`) brauchen in der Cloud-Sitzung rund acht Minuten; im Hintergrund laufen lassen und dabei weiterarbeiten.
- Neue Wege brechen Tests im Lernkern-Bereich (`ueben.spec.ts`), die Einstellungen oder „Über mich“ direkt ansteuern. Dafür gibt es jetzt die Helfer `einstellungen(page)` und `einladungWeg(page)`.

- Die Browser-Tests laufen als „Desktop Chrome“. Für Handy-Verhalten (Installationssperre) im Test einen eigenen Kontext mit iPhone-`userAgent` öffnen (`tests/e2e/oberflaeche.spec.ts`).

- Infozeilen in Knöpfen werden Teil des Namens, den Screenreader und Browser-Tests sehen („Sicherung Deinen Stand …“). Dann `aria-label` mit dem Namen und `aria-describedby` für die Infozeile setzen. Sonst greifen `exact: true` und Suchen wie „Zurück“ daneben.
- Klappkarten (`details`) verstecken Felder vor Browser-Tests. Der Helfer `elternAufklappen(page)` in `tests/e2e/ueben.spec.ts` öffnet alle Abschnitte; er steht nach jedem „Ich habe den Code aufgeschrieben“ und „Öffnen“.
- Ausgegraute Knöpfe mit `aria-disabled` statt `disabled`: Playwright wertet beides für `toBeDisabled()`, aber nur `aria-disabled` bleibt mit Tab erreichbar. Den Klick dann selbst abfangen.
- IDs im Elternbereich nicht mit `eltern-…` beginnen: Die Bausteine darunter nutzen selbst solche IDs (`eltern-blatt`). Die Hülle nimmt `abschnitt-…`.
- KaTeX-Brüche im Fließtext (`\displaystyle`): Die Zeilenhöhe des Absatzes ändert nichts, weil der KaTeX-Strut den Zeilenkasten bestimmt. Luft gibt nur ein Inline-Block mit `padding-block` um die Formel (`Formel.svelte`).
- Das Geräteprofil `devices['iPhone 13']` von Playwright hat nur 664 px Höhe (Browserleisten abgezogen). Für den Rundgang auf 390 × 844 den `viewport` ausdrücklich setzen.
- `Textteile` liefert mehrere Knoten (Text, Fachbegriff-Knopf, Text). In einem `display: flex`-Elternteil wird jeder Knoten eine Spalte (A1 der Mängelliste). Textteile immer in ein `span` fassen.
- GitHub beachtet `merge=union` nicht. Wenn `main` weiterläuft, meldet der PR einen Konflikt in den Protokollen. Dann `origin/main` lokal hineinmergen; git führt sie zusammen.
