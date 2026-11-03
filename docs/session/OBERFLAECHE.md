# Strang Oberfläche – Session-Prompt

> Für Sitzungen, die an UI und UX **außerhalb der Bastion** arbeiten: Startseite, „Mehr“, Elternbereich, Über mich, Sicherung, Hinweise der App-Hülle.
> Vorher den gemeinsamen Teil lesen: `docs/SESSION-PROMPT.md`. Am Ende der Sitzung diese Datei und §4c in `docs/PLAN.md` aktualisieren, je PR eine Zeile unten in `docs/session/OBERFLAECHE-PROTOKOLL.md`.

Stand: 03.11.2026 · Strang angelegt (PV) · Startseite aufgeräumt (O1) · „Mehr“ aufgeräumt (O2)

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
3. ~~„Mehr“ aufräumen.~~ Erledigt (O2): nur noch Zurück und eine Überschrift „Mehr“ (ohne „Werkstatt“, „Bastion“, „Wenige Einträge“); jeder Eintrag mit Symbol und einer Infozeile wie die Kacheln der Startseite; Zone „Für Erwachsene“ nur, wenn es den Elternbereich gibt, ohne Versionszeile; Vertrauen in einem Satz am Ende; Offline-Hinweis oben als Hinweiskarte. Symbole `person`, `sicherung`, `kalender` als Wunsch an den Strang Grafik.
4. Elternbereich gliedern und angleichen.

## Wünsche aus dem anderen Strang

_(noch keine)_

## Wünsche an andere Stränge

- An Grafik (03.11.2026): Symbole `person`, `sicherung`, `kalender` (`GRAFIK.md`, Wünsche).

## Übergabe und Lehren

_(folgt am Ende der ersten Sitzung)_
