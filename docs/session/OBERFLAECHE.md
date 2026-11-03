# Strang Oberfläche – Session-Prompt

> Für Sitzungen, die an UI und UX **außerhalb der Bastion** arbeiten: Startseite, „Mehr“, Elternbereich, Über mich, Sicherung, Hinweise der App-Hülle.
> Vorher den gemeinsamen Teil lesen: `docs/SESSION-PROMPT.md`. Am Ende der Sitzung diese Datei und §4c in `docs/PLAN.md` aktualisieren, je PR eine Zeile unten in `docs/session/OBERFLAECHE-PROTOKOLL.md`.

Stand: 03.11.2026 · Strang angelegt (PV) · Startseite aufgeräumt (O1) · „Mehr“ aufgeräumt (O2) · Spiel-Banner und alle Kacheln (O3) · Symbole aus einem Guss (O4) · Elternbereich gegliedert (O5) · Feinschliff O6–O10 (Wunsch PV: „alle Vorschläge bauen“)

---

## Entscheidungen des PV (03.11.2026)

1. **Neuer Strang „Oberfläche“**, Branch `oberflaeche/…`, eigenes Protokoll.
2. **Sperre aufgehoben:** `src/ui/start/` und `src/ui/eltern/` sind nicht mehr eingefroren (`SESSION-PROMPT.md` Regel 7). Die Lern-Oberfläche (`ueben/`, `vermittlung/`, `eingabe/`) bleibt eingefroren.
3. **Umbau erlaubt:** nicht nur Optik und Texte, auch Aufbau, z. B. doppelte Kacheln entfernen, Formulare auf eigene Seiten legen, den Elternbereich gliedern. Keine neuen Lern-Funktionen.
4. **Mergen:** kleine PRs, je Bereich einer. Merge per Squash ohne den PV, sobald lint, test, build und E2E grün sind.

## Zuständigkeit

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

## Nächste Schritte (Vorschläge)


- Start: Querformat am Tablet einmal am echten Gerät ansehen.

## Wünsche aus dem anderen Strang

_(noch keine)_

## Wünsche an andere Stränge

- ~~An Grafik (03.11.2026): Symbole `person`, `sicherung`, `kalender`.~~ Selbst erledigt in O4 (Wunsch PV).

## Übergabe und Lehren

**Übergabe (03.11.2026):** O0 ist auf `main` (#239). O1 bis O5 kommen gemeinsam in einem PR (Branch `oberflaeche/eltern`), weil die Schritte aufeinander aufbauen; die Commits bleiben einzeln lesbar. Offen sind die Vorschläge oben unter „Nächste Schritte“.

**Lehren:**

- Infozeilen in Knöpfen werden Teil des Namens, den Screenreader und Browser-Tests sehen („Sicherung Deinen Stand …“). Dann `aria-label` mit dem Namen und `aria-describedby` für die Infozeile setzen. Sonst greifen `exact: true` und Suchen wie „Zurück“ daneben.
- Klappkarten (`details`) verstecken Felder vor Browser-Tests. Der Helfer `elternAufklappen(page)` in `tests/e2e/ueben.spec.ts` öffnet alle Abschnitte; er steht nach jedem „Ich habe den Code aufgeschrieben“ und „Öffnen“.
- Ausgegraute Knöpfe mit `aria-disabled` statt `disabled`: Playwright wertet beides für `toBeDisabled()`, aber nur `aria-disabled` bleibt mit Tab erreichbar. Den Klick dann selbst abfangen.
- IDs im Elternbereich nicht mit `eltern-…` beginnen: Die Bausteine darunter nutzen selbst solche IDs (`eltern-blatt`). Die Hülle nimmt `abschnitt-…`.
- GitHub beachtet `merge=union` nicht. Wenn `main` weiterläuft, meldet der PR einen Konflikt in den Protokollen. Dann `origin/main` lokal hineinmergen; git führt sie zusammen.
