# Qualität Klasse 5 bis 10 – Session-Prompt (K-32)

> Auftrag des Projektverantwortlichen (PV) vom 05.11.2026: **Tests mit echten Lernenden beginnen erst, wenn Klasse 5 bis 10, Oberfläche und Grafik wirklich besser sind.** Diese Datei gilt vor `FOKUS.md` und `KLASSE-9-12.md`, bis die Abnahme unten erfüllt ist.
> Vorher lesen: `CLAUDE.md`, `docs/SESSION-PROMPT.md`, die Datei des eigenen Strangs, `docs/INHALTSFORMAT.md` §8 (Prüfkatalog), `docs/VERMITTLUNG.md` §2.5 (V1–V9).
> Alle drei Stränge arbeiten parallel, jeder an seinen Paketen (Q-L, Q-O, Q-G). Protokollzeile je PR im eigenen Protokoll.

Stand: 05.11.2026 · Auftrag angelegt, Meilenstein M5 (Klasse 5) festgelegt, `pnpm review --klasse 5` zeigt den Fortschritt · noch kein Paket begonnen

---

## Warum (Befund vom 05.11.2026, Gesamtsicht)

- **Technik trägt.** Lint, Tests und Build grün, Fehler-Schüler bei 0 in allen Arten, Klasse 5 bis 10 vollständig als Entwurf (176 Themen, 501 Vorlagen, 338 Fehlvorstellungen).
- **Qualität ist nicht gemessen.** Von rund 1 030 Inhaltsdateien haben 25 Stufe 1 (nur das Musterfeld Brüche), 0 Stufe 2. Die gesammelte KI-Prüfung (Phase C in `KLASSE-9-12.md`) war auf „nach 11/12“ verschoben. Das Musterfeld hat gezeigt: Eine frische Prüfsitzung findet in 22 Dateien rund ein Dutzend echte Fehler. Hochgerechnet stecken Hunderte in den Entwürfen.
- **Erstvermittlungen sind fast nur Text.** 124 von 176 haben weder Bild noch Werkzeug. Bei bildhaften Feldern ist es am schlimmsten: Raum und Form 28 von 37 ohne Bild, Größen und Messen 23 von 26, Daten und Zufall 12 von 16. Beispiel Klasse 5, „Parallel, senkrecht, schneidend“: „Denk an Schienen einer Eisenbahn“, kein Bild. Für ein Kind, das das Thema nicht kennt, ist das ein Quiz, keine Vermittlung (V3 verletzt). Die Werkzeuge gibt es inzwischen (`graph@1`, `dreieck@1`, Kurven, Tabellen, Stabdiagramm, Bruchstreifen, Zahlenstrahl), die Erstvermittlungen der Klassen 5 bis 8 nutzen sie nicht, weil sie früher entstanden.
- **Zwischenschritte (K-29) gibt es in 17 von 501 Vorlagen**, praktisch nur im Musterfeld Brüche. Gleichungen, Prozent, Dreisatz, Flächen bleiben einschrittig.
- **Lern-Oberfläche** wirkt wie ein Formular: viel leere Fläche in der Erstvermittlung, Rückmeldung nach einem Fehler in drei gestapelten Kästen, Themenwahl als Liste von über 7 000 Pixeln Höhe mit Platzhalter-Bildern. Start, Mehr, Eltern und Mein Stand sind nach dem Strang Oberfläche ruhig und sauber.
- **Grafik:** Die Bastion sieht gut aus, ruckelt aber auf dem iPhone (PV, 04.11.2026). Referenzgeräte (Aufgabe 0.10) sind seit Beginn offen. Ohne Messung am echten Gerät ist weitere Grafikarbeit Blindflug.

## Entscheidungen des PV (05.11.2026) – K-32

1. **Einfrieren der Lern-Oberfläche aufgehoben** (`SESSION-PROMPT.md` Regel 7). Es diente nur U4b; U4b hat keinen Termin mehr.
2. **Jahrgang 11/12 angehalten.** Die Bausteine 11-0 bis 11-0c bleiben; Inhalte ab 11-1 erst nach der Abnahme unten. Kein weiterer ungeprüfter Stoff.
3. **„Wirklich besser“ wird gemessen** an der Abnahme unten. Erst dann wird ein Termin für U4b gesetzt.

Festgehalten als **K-32** in `STRATEGIE.md` §9. Ehrlich dazu: Stufe 2 setzt nur ein Mensch. Ohne Lehrkraft bleibt „besser“ bei Stufe 1 stehen. Die Suche nach einer Lehrkraft läuft beim PV parallel weiter.

## Abnahme „bereit für Tests“

| # | Kriterium | Woran gemessen | Strang |
|---|---|---|---|
| A1 | Jede Inhaltsdatei der Klassen 5 bis 10 hat Stufe 1 nach **zwei** unabhängigen Prüfdurchgängen (Phase C) | `pnpm review --klasse 5` … `--klasse 10`: alles auf 1 oder höher, Fundlisten abgearbeitet | Lernkern |
| A2 | Jede Erstvermittlung eines bildhaften Themas (Raum und Form, Größen und Messen, Brüche, Funktionen, Daten und Zufall) hat mindestens ein Bild oder Werkzeug an der Stelle, an der es erklärt | Zählung über `vermittlung.yaml` (`bild:` oder `werkzeug:`), je Klasse 0 ohne | Lernkern |
| A3 | Alle mehrschrittigen Vorlagen der Klassen 5 bis 7 haben Zwischenschritte (`schritte`) | Liste je Feld in dieser Datei, abgehakt | Lernkern |
| A4 | Rundgang der Lern-Oberfläche auf 390 px ohne Fund der Gruppen A (Fehler) und B (Verständlichkeit), Erstvermittlung, Rückmeldung und Themenwahl überarbeitet | Mängelliste wie bei Paket L, vom PV abgenommen | Oberfläche |
| A5 | Bastion auf dem iPhone 13 ohne Ruckeln beim Zoomen und Schwenken, Referenzgeräte festgelegt | Messung am Gerät (Safari-Webinspektor oder Bildrate über `pnpm messen`), Ergebnis in `GRAFIK.md` | Grafik |

Reihenfolge der Inhalte: **Klasse 5 zuerst (Meilenstein M5)**, dann 6, 7, 8, 9, 10. Jede Klasse wird für sich fertig, bevor die nächste beginnt (K-15). Dadurch ist früh sichtbar, wie viel Arbeit eine Klasse kostet.

## Pakete

### Strang Lernkern (Branch `lernkern/…`)

**Q-L1 – Prüfen (Phase C) je Klasse.** Zwei unabhängige Durchgänge je Datei, jeweils in einer frischen Sitzung oder einem Sub-Agenten ohne den Entwurf im Verlauf (INHALTSFORMAT §8, Prüfkatalog Fragen 1 bis 6). Ablauf je Feld:

1. Fundliste anlegen: `docs/pruefung/<klasse>-<feld>.md` (Datei, Stelle, Frage des Katalogs, Fund). Keine Teilnehmerdaten, nur Inhalte.
2. Funde in eigenen PRs beheben, mit Begründung. Geschmack ist kein Fund.
3. Zweiter Durchgang. Bleibt eine Datei in zwei Durchgängen ohne Fund: `pnpm review setzen --stufe 1 --pruefer maschine <IDs>`.
4. Fortschritt: `pnpm review --klasse 5`.

Reihenfolge innerhalb der Klasse: entlang des Graphen, Kompetenzen ohne Voraussetzungen zuerst (`LEHRPLAN.md` §8.4). Was `pnpm test` und `pnpm fehlerschueler` schon sichern, wird nicht wiederholt.

**Q-L2 – Erstvermittlungen mit Bild oder Werkzeug.** Je Feld ein PR. Zuerst die Felder mit dem größten Mangel: Raum und Form, Größen und Messen, Daten und Zufall, dann Funktionen und Brüche. Jede überarbeitete Erstvermittlung erfüllt V1 bis V9 (`VERMITTLUNG.md` §2.5) und nutzt vorhandene Werkzeuge und SVG-Bausteine (`src/generators/svg.ts`, `src/ui/vermittlung/werkzeuge/`). Fehlt ein Werkzeug für ein ganzes Feld (zum Beispiel Geometrie-Grundfiguren, Winkel, Körper), wird es als eigener PR gebaut, ohne Ziehen bedienbar, mit Beschreibung für Screenreader, Vorschaubild vor dem Einbau an den PV. Eine geänderte Datei verliert Stufe 1 und wird in Q-L1 neu geprüft, darum **Q-L2 vor Q-L1** je Feld.

**Q-L3 – Zwischenschritte für mehrschrittige Vorlagen der Klassen 5 bis 7** (K-29, INHALTSFORMAT §17). Kandidaten, je Feld ein PR: Gleichungen (Rechenzeilen), Prozent (Grundwert, Prozentwert), Dreisatz, Flächen und Umfang zusammengesetzter Figuren, Einheiten umrechnen mit Komma, Dezimalzahlen rechnen, Brüche multiplizieren und dividieren. Liste beim ersten PR vervollständigen und hier abhaken.

**Q-L4 – Nebenbei:** `potenzen.ts` neue Fassung (10⁶ statt `10^6`, Entscheidung 01.11.2026); Brüche im Fließtext zu Formeln (F9, Entscheidung 11 in `KLASSE-9-12.md`), Feld für Feld zusammen mit Q-L2, damit Dateien nur einmal die Stufe verlieren.

### Strang Oberfläche (Branch `oberflaeche/…`)

**Q-O1 – Lern-Oberfläche überarbeiten.** Zuständigkeit erweitert (PV, 05.11.2026): Der Strang Oberfläche darf in `src/ui/ueben/`, `src/ui/vermittlung/` und `src/ui/eingabe/` Aufbau, Abstände, Hierarchie, Karten und Texte ändern. Die Logik (Auswertung, Abspieler, Diagnose, Ereignisse) bleibt beim Lernkern; Browser-Tests in `ueben.spec.ts` dürfen angepasst werden, wenn sich nur das Aussehen ändert. Ablauf wie bei Paket L: Rundgang auf 390 px, Mängelliste mit Bildschirmfotos an den PV, der PV wählt, dann kleine PRs. Bekannt schon jetzt:

- Erstvermittlung: Karte mit viel Leerraum, Schrittart („Probier es aus“) ohne Bild, Fortschrittsbalken ohne Schrittzahl.
- Rückmeldung nach einem Fehler: drei gestapelte Kästen (Antwort, „Noch nicht“, Fehlvorstellung) plus Lösungsweg plus zwei Knöpfe. Ziel: ein Kasten, eine Hauptaktion.
- Themenwahl: Liste über 7 000 px mit grauen Platzhalter-Bildern; Bereiche als Karten, Platzhalter weg oder echte Symbole je Feld.
- „Zeichnen lernen“ hängt als eigene Karte unter der Aufgabe.
- Lernpfad bleibt ohne Animationen, Wesen, Sound, Wetter (`GRAFIK.md` §9) und ohne Noten (K-26). R1–R7.

### Strang Grafik (Branch `grafik/…`)

**Q-G1 – Tempo, sonst nichts.** Bis die Bastion auf dem iPhone 13 flüssig ist, keine neuen Dinge, Wesen, Wetter oder Themen. Ansatzpunkte aus `GRAFIK.md` (04.11.2026): Pixi-Ticker nur bei Bewegung, Kulisse beim Zoomen nicht je Schritt neu ausrichten (Culling mit Abstand), Bewohner, Wesen und Fahnen in einem gemeinsamen 30-Hz-Takt, HD-Bilder nur im Sichtfeld. Jeder PR nennt Bildrate und Speicher vorher und nachher (Chromium-Messung nach `GRAFIK.md` §24; der PV misst am Gerät). **Q-G0 (PV):** drei Referenzgeräte festlegen (0.10), mindestens das iPhone 13.

## Meilenstein M5 – Klasse 5 (42 Kompetenzen, Stand 05.11.2026)

Kompetenzen mit `klassenstufe_typisch` 5 (`pnpm review --klasse 5`). Spalte „Bild“: Thema ist bildhaft, A2 gilt. Spalte „Schritte“: Vorlagen sind mehrschrittig, A3 gilt. Abhaken, sobald das Paket für die Kompetenz erledigt ist.

| Feld | Kompetenz | Thema | Bild | Schritte |
|---|---|---|---|---|
| Natürliche Zahlen | M.ZO.NZ.STELLENWERT | Große Zahlen und Stellenwerte | | |
| | M.ZO.NZ.ORDNEN | Zahlen vergleichen und ordnen | Zahlenstrahl | |
| | M.ZO.NZ.RUNDEN | Runden, schätzen, überschlagen | | |
| | M.ZO.NZ.ADD-SUB | Addieren und Subtrahieren | | schriftlich |
| | M.ZO.NZ.MULT | Multiplizieren | | schriftlich |
| | M.ZO.NZ.DIV | Dividieren | | schriftlich, Rest |
| | M.ZO.NZ.REGELN | Rechengesetze und Rechenvorteile | | |
| | M.ZO.NZ.POTENZEN | Potenzen und Quadratzahlen | | |
| | M.ZO.SA.LESEN | Sachaufgaben lesen | | |
| Teilbarkeit | M.ZO.TB.TEILER | Teiler und Vielfache | | |
| | M.ZO.TB.REGELN | Teilbarkeitsregeln | | |
| | M.ZO.TB.PRIM | Primzahlen | | Primfaktoren |
| Terme und Gleichungen | M.SF.NZ.TERME | Terme mit Klammern und Vorrangregeln | | Rechenzeilen |
| | M.SF.NZ.GLEICHUNGEN | Einfache Gleichungen und Ungleichungen | | Rechenzeilen |
| Brüche und Dezimalzahlen | M.ZO.BR.BEGRIFF | Brüche als Anteile | Bruchstreifen ✓ | |
| | M.ZO.BR.ERWEITERN | Brüche erweitern und kürzen | Bruchstreifen ✓ | ✓ |
| | M.ZO.BR.VERGLEICHEN | Brüche vergleichen | Bruchstreifen | |
| | M.ZO.BR.ZAHLENSTRAHL | Brüche und Dezimalzahlen am Zahlenstrahl | Zahlenstrahl | |
| | M.ZO.BR.ANTEIL-VON | Anteile von Größen | Bruchstreifen | zwei Schritte |
| | M.ZO.BR.DEZIMAL | Brüche und Dezimalzahlen umwandeln | | |
| | M.ZO.BR.DEZ-ORDNEN | Dezimalzahlen vergleichen und runden | Zahlenstrahl | |
| | M.ZO.BR.DEZ-RECHNEN | Mit Dezimalzahlen rechnen | | schriftlich |
| | M.ZO.BR.PROZENT | Prozentschreibweise | Hundertertafel | |
| Größen und Messen | M.GM.GR.UMRECHNEN | Einheiten umrechnen | Stellenwerttafel | |
| | M.GM.GR.KOMMA | Größen in verschiedenen Schreibweisen | Stellenwerttafel | |
| | M.GM.GR.ZEIT | Uhrzeiten und Zeitspannen | Uhr | zwei Schritte |
| | M.GM.GR.SACH | Sachaufgaben mit Größen | | mehrschrittig |
| | M.GM.FL.EINHEITEN | Flächeneinheiten | Quadrat | |
| | M.GM.FL.RECHTECK | Umfang und Fläche des Rechtecks | Rechteck | |
| | M.GM.FL.ZUSAMMENGESETZT | Zusammengesetzte Figuren | Figur | zerlegen, rechnen |
| | M.GM.KP.EINHEITEN | Volumeneinheiten und Hohlmaße | Würfel | |
| | M.GM.KP.VOLUMEN | Volumen von Würfel und Quader | Quader | |
| | M.GM.KP.OBERFLAECHE | Oberfläche von Würfel und Quader | Netz | Flächen, Summe |
| Raum und Form | M.RF.GF.LAGE | Parallel, senkrecht, schneidend | Geraden | |
| | M.RF.GF.WINKEL | Winkel | Winkel | |
| | M.RF.GF.WINKELPAARE | Winkelpaare an Geraden | Geraden | |
| | M.RF.GF.KOORDINATEN | Koordinatensystem | Koordinaten ✓ | |
| | M.RF.KP.DARSTELLEN | Würfel und Quader darstellen | Schrägbild, Netz | |
| | M.RF.SY.SYMMETRIE | Symmetrische Figuren | Figur | |
| | M.RF.SY.SPIEGELN | An einer Geraden spiegeln | Gitter | |
| | M.RF.SY.BEWEGUNGEN | Spiegeln, Verschieben, Drehen | Gitter | |
| Daten und Zufall | M.DZ.DA.MITTELWERT | Arithmetisches Mittel | Säulen | Summe, teilen |

Die Einträge in „Bild“ und „Schritte“ sind Vorschläge der Gesamtsicht, keine Prüfung. Die Sitzung, die ein Feld übernimmt, prüft sie an den Dateien und korrigiert die Tabelle.

## Startsätze

- **Lernkern:** „Lies CLAUDE.md, `docs/SESSION-PROMPT.md`, `docs/session/LERNKERN.md` und `docs/session/QUALITAET-5-10.md`. Arbeite im Strang Lernkern an Meilenstein M5: zuerst Q-L2 für das Feld Raum und Form (Klasse 5), dann Q-L1 für dasselbe Feld. Je Feld ein PR. Melde nach jedem PR kurz in einfachem Deutsch.“
- **Oberfläche:** „Lies CLAUDE.md, `docs/SESSION-PROMPT.md`, `docs/session/OBERFLAECHE.md` und `docs/session/QUALITAET-5-10.md`. Mach Q-O1: Rundgang der Lern-Oberfläche auf 390 px, Mängelliste mit Bildschirmfotos an den PV, dann warten, was er wählt.“
- **Grafik:** „Lies CLAUDE.md, `docs/SESSION-PROMPT.md`, `docs/session/GRAFIK.md` und `docs/session/QUALITAET-5-10.md`. Mach Q-G1: Tempo der Bastion. Erster PR: Ticker nur bei Bewegung, mit Messung vorher und nachher.“

## Übergaben

Jede Sitzung trägt am Ende hier ein: Paket, Stand, PR-Nummer, Erledigtes mit Datum durchstreichen, neue Rückfragen an den PV. Dazu eine Zeile im Protokoll des eigenen Strangs und die Zeile des Strangs in `docs/PLAN.md` §1.

- **05.11.2026, Gesamtsicht (Branch `claude/qualitaet-5-10-auftrag`):** Auftrag angelegt, K-32 im Entscheidungslog, Regel 7 aufgehoben, 11/12 angehalten, `pnpm review --klasse N`. Noch kein Paket begonnen.
