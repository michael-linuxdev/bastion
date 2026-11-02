# Klasse 9 bis 12 bauen – Session-Prompt

> Auftrag aus der Entscheidung **K-30** des Projektverantwortlichen (PV) vom 02.11.2026 (`STRATEGIE.md`): **Klasse 9 bis 12 jetzt komplett im neuen Format bauen, danach alles gesammelt prüfen – erst mehrfach durch KI, dann durch einen Menschen.**
> Strang **Lernkern** (Branch `lernkern/…`, Protokollzeile in `docs/session/LERNKERN-PROTOKOLL.md`). Diese Datei gilt, bis Klasse 9 bis 12 gebaut und die gesammelte KI-Prüfung abgeschlossen ist.
> Vorher lesen: `CLAUDE.md`, `docs/SESSION-PROMPT.md`, `docs/session/LERNKERN.md` (vor allem „Wünsche aus dem anderen Strang“), `docs/STRATEGIE.md` K-23, K-25, K-28, K-30, dann `docs/INHALTSFORMAT.md` (ganz), `docs/VERMITTLUNG.md` §2–§3.6, `docs/LEHRPLAN.md` §1–§8d, `docs/PRUEFUNGEN.md`.

Stand: 02.11.2026 · Rückfragen beantwortet (unten „Entscheidungen“) · **Phase A fertig:** Listen in `LEHRPLAN.md` §8e (Kl. 9, 30), §8f (Kl. 10, 22), §8g (11/12, 55, davon 7 nur LK), Abgleich mit den Prüfungen §8g.4, Bedarfsliste in `LERNKERN.md` · Formeldarstellung KaTeX (T-22), Reihenfolge der Bausteine bestätigt · **als Nächstes Phase B: B1 KaTeX einbauen**

---

## Ziel

Für Klasse 9, 10 und die Jahrgangsstufen 11/12 (Grundkurs und Leistungskurs) gibt es dasselbe wie heute für Klasse 5 bis 8, gleich im neuen Format (K-28):

- Kompetenzlisten in `LEHRPLAN.md` (neue Abschnitte wie §8–§8d), mit Voraussetzungen, Niveaus **G, M und E** und Zuordnung zum sächsischen Lehrplan,
- je Kompetenz `kompetenz.yaml`, **Erstvermittlung** (`vermittlung.yaml`), Vorlagen (generatorbasiert, wo es geht) und **Fehlerkatalog** (Fehlvorstellungen mit Rückweg),
- Zwischenschritte (`schritte`, K-29), wo eine Aufgabe mehrschrittig ist,
- Generatoren in `src/generators/` mit den Pflicht-Tests nach INHALTSFORMAT §6.3.

Danach folgen die **Prüfungen auf Knopfdruck** (K-25, PLAN U7). Sie sind nicht Teil dieses Auftrags.

**Abnahme dieses Auftrags:** Alle Kompetenzen der Listen sind angelegt, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm inhalte:pruefen` und `pnpm fehlerschueler --grenze` sind grün, und die gesammelte KI-Prüfung (unten, Phase C) hat für jede Datei Stufe 1 gesetzt oder einen offenen Fund gemeldet. Stufe 2 setzt erst ein Mensch (Phase D).

---

## Unverändert gültig

- **Keine KI in der App** (K-23). KI hilft beim Entwurf und bei der Prüfung; in der App läuft nur vorab geschriebener Inhalt.
- **Stufe 2 bleibt menschliche Prüfung** (INHALTSFORMAT §8). Keine KI setzt Stufe 2 oder 3.
- **Öffentliche Seite:** Der Filter im Build (T-20, `BASTION_MINDESTSTUFE`) hält alles unter Stufe 2 fern. Neuer Stoff braucht dafür nichts Zusätzliches; prüfen, dass der Filter auch die neuen Ordner erfasst.
- ~~**Lern-Oberfläche eingefroren** (`SESSION-PROMPT.md` Regel 7): … nur Fehlerbehebungen … gesammelt und dem PV vorgelegt, nicht still gebaut.~~ *Gelockert durch Entscheidung 4 (02.11.2026):* Neue Aufgabentypen, Tasten und Darstellungen, die Klasse 9–12 braucht, dürfen gebaut werden. Bedingungen: erst die Bedarfsliste aus Phase A, je Typ oder Darstellung ein eigener PR, vorhandene Aufgaben sehen gleich aus (Test), sonst bleibt die Lern-Oberfläche eingefroren.
- **Keine neue Laufzeitabhängigkeit** ohne Rückfrage und Eintrag im Entscheidungslog (`CLAUDE.md`). Das gilt auch für KaTeX.
- **Generatoren rein und deterministisch**, Zufall nur über `src/core/rng`.
- Kleine Schritte: ein Kompetenzfeld oder wenige Kompetenzen je PR, jeder PR nach grüner CI per Squash auf `main` (Ablauf im `SESSION-PROMPT.md`).

---

## Rückfragen an den PV (gesammelt, vor dem ersten Inhalt)

Eine Fragerunde mit Empfehlung, Antworten unten unter „Entscheidungen“ festhalten. *Gestellt und beantwortet am 02.11.2026.*

1. **Schularten:** Klasse 9/10 für **Gymnasium und Oberschule** (wie bei 5–8, Realschulabschluss `PRUEFUNGEN.md` §4) oder nur Gymnasium? *Empfehlung:* beide, Oberschule als Teilmenge kennzeichnen wie in §8–§8d.
2. **Kurse 11/12:** GK und LK getrennt als Niveaus oder als eigene Kompetenzen? *Empfehlung:* gemeinsame Kompetenz, LK-Anteile als Niveau E bzw. eigene Kompetenz nur dort, wo der LK-Stoff im GK gar nicht vorkommt.
3. **Reihenfolge:** *Empfehlung:* Klasse 9 → 10 → 11/12, innerhalb einer Klasse Leitidee für Leitidee; zuerst die Felder, die das Abitur trägt (Funktionen, Analysis, Stochastik, Analytische Geometrie).
4. **Neue Darstellung und Eingabe:** Für Klasse 9–12 werden voraussichtlich Formeln (Wurzeln, Potenzen mit rationalen Exponenten, Vektoren, Integrale), Funktionsgraphen und eventuell neue Aufgabentypen gebraucht. Das berührt die eingefrorene Lern-Oberfläche und vielleicht eine neue Abhängigkeit (KaTeX). Darf das jetzt gebaut werden, oder bleibt es bei den vorhandenen Typen, bis U4b ausgewertet ist? *Empfehlung:* erst die Liste der fehlenden Darstellungen und Typen erstellen (Phase A), dann entscheiden; KaTeX vorher nur messen (`LERNKERN.md` „Formeldarstellung“, Schritt 2).
5. **Laufende Pakete:** Was passiert mit F3 (Prüfseite Musterfeld), F7 bis F10 und dem Gewinnen einer Lehrkraft? *Empfehlung:* Lehrkraft und U4b laufen weiter parallel, F8–F10 ruhen.

---

## Phasen

### Phase A – Listen und Bedarf (ein PR)

> *Erledigt am 02.11.2026* mit den PDF-Dateien des PV (Lehrplan GY 2021, Lehrplan OS 2019, Muster LK Teil A, STARK-Leseproben GK, LK, RS). Die PDFs liegen nicht im Repository (`docs/quellen/README.md`).

- Lehrplan Gymnasium Mathematik Sachsen, Klassen 9, 10 und Jahrgangsstufen 11/12 (Fundstellen `docs/quellen/README.md`; die PDF-Dateien liegen nicht im Repository, der PV stellt sie bereit, wenn nötig). Bei Bedarf Lehrplan Oberschule Klasse 9/10.
- Kompetenzlisten als neue Abschnitte in `LEHRPLAN.md` (Auswahl, Kompetenzen, Graph), wie §8–§8d. Voraussetzungen zeigen auch auf Kompetenzen aus Klasse 5–8.
- **Bedarfsliste:** Welche Kompetenz braucht welchen Aufgabentyp, welche Taste, welche Darstellung? Was fehlt heute? Ergebnis als Tabelle in `LERNKERN.md` und als Rückfrage 4 an den PV.
- Abgleich mit `PRUEFUNGEN.md`: Deckt die Liste ab, was Abitur GK/LK und Realschulabschluss prüfen?

### Phase B – Bauen, Klasse für Klasse (viele kleine PRs)

Je Kompetenzfeld:

1. Generatoren mit Pflicht-Tests (§6.3), wo eine Aufgabe sich erzeugen lässt; sonst handverfasste Vorlagen.
2. `kompetenz.yaml`, Vorlagen für G, M und **E** (E mit AB-II/III-Charakter in geschlossenen Formaten: Fehler finden, Begründung auswählen, „Stimmt das immer?“, `LEHRPLAN.md` §4/§5.3).
3. `vermittlung.yaml` (Erstvermittlung, VERMITTLUNG §2) und Fehlvorstellungen mit Rückweg (§3), Zwischenschritte bei mehrschrittigen Aufgaben (§3.6).
4. Fachbegriffe in `begriffe.yaml`, mit `pnpm inhalte:begriffe` markieren.
5. `pnpm inhalte:pruefen`, `pnpm fehlerschueler --grenze`, `pnpm test`, `pnpm build`. Alles bleibt **Stufe 0** (Entwurf) bis Phase C.

Nicht in Phase B: Review-Vermerke setzen, Lern-Oberfläche ändern (außer nach Entscheidung zu Rückfrage 4).

### Phase C – Gesammelte KI-Prüfung (mehrfach)

Erst wenn eine Klassenstufe vollständig gebaut ist, oder am Ende für alles. **Mehrfach** heißt: mindestens **zwei unabhängige Durchgänge** je Datei, jeweils in einer **frischen Sitzung** ohne den Entwurf im Verlauf (INHALTSFORMAT §8, „Den Vermerk setzen“), möglichst mit verschiedenen Modellen.

1. `pnpm fehlerschueler` und `pnpm test` grün (Maschinenpunkte 1 und 2).
2. Durchgang 1 und 2: je Datei der **Prüfkatalog** INHALTSFORMAT §8 (Fragen 1–6). Jeder Fund mit Stelle in eine Fundliste (z. B. `docs/pruefung/9-12-funde.md` oder im Prüfbogen-Format, `tools/pruefbogen/`).
3. Funde in eigenen PRs beheben, mit Begründung. Danach Durchgang wiederholen, bis eine Datei in zwei Durchgängen ohne Fund bleibt.
4. Erst dann `pnpm review setzen --stufe 1 --pruefer maschine <Kennungen>`.
5. Ablauf und Ergebnis in `INHALTSFORMAT.md` §8 („Mehrfache KI-Prüfung“, neu) und `LERNKERN.md` festhalten.

### Phase D – Menschliche Prüfung (PV)

Gesammelt für Klasse 5 bis 12: Prüfbögen (`pnpm pruefbogen`, mit `--online` als Seite zum Ausfüllen), dann `pnpm pruefbogen einlesen` und Stufe 2 durch den PV mit dem Namen der prüfenden Person. Nicht Aufgabe dieser Sitzungen; sie bereiten die Bögen nur vor.

---

## Entscheidungen

Fragerunde des PV vom 02.11.2026 (Sitzung Lernkern, vor Phase A):

1. **Schularten:** beide. Gymnasium ist die Grundlage, Oberschul-Stoff Klasse 9/10 wird als Teilmenge gekennzeichnet wie in `LEHRPLAN.md` §8–§8d (Realschulabschluss, `PRUEFUNGEN.md` §4).
2. **Kurse 11/12:** eine gemeinsame Kompetenz für GK und LK; LK-Anteile als Niveau E. Eine eigene LK-Kompetenz nur dort, wo der Stoff im GK gar nicht vorkommt.
3. **Reihenfolge:** Klasse 9 → 10 → 11/12; innerhalb einer Klasse Leitidee für Leitidee, zuerst die Felder, die das Abitur trägt (Funktionen, Analysis, Stochastik, Analytische Geometrie).
4. **Neue Darstellung und Eingabe:** **jetzt bauen erlaubt** (abweichend von der Empfehlung). Die Lern-Oberfläche darf für Klasse 9–12 neue Aufgabentypen, Tasten und Darstellungen bekommen (Ausnahme von `SESSION-PROMPT.md` Regel 7). KaTeX erst messen; bei einem Ja Eintrag im Entscheidungslog (`ARCHITEKTUR.md`), wie für jede neue Abhängigkeit (`CLAUDE.md`). Grundlage bleibt die Bedarfsliste aus Phase A.
5. **Laufende Pakete:** **alles ruht** (abweichend von der Empfehlung). F3 (Prüfseite Musterfeld), F7 bis F10 und das Gewinnen einer Lehrkraft warten, bis Klasse 9–12 gebaut ist. Der Strang Lernkern arbeitet nur an diesem Auftrag. U4b selbst war nicht Teil der Frage; sein Termin bleibt beim PV.
6. **Quellen (Zusatzfrage):** Die Lehrplandatenbank ist aus der Arbeitsumgebung gesperrt (HTTP 403 am Proxy). **Phase A beginnt erst, wenn der PV die Lehrplan-PDFs bereitstellt:** Gymnasium Klasse 9, 10 und Jahrgangsstufen 11/12 sowie Oberschule Klasse 9/10 (Fassungen in `docs/quellen/README.md`). Keine Kompetenzlisten aus dem Gedächtnis.
7. **Reihenfolge der Bausteine** (zweite Fragerunde, 02.11.2026): wie in der Bedarfsliste vorgeschlagen (`LERNKERN.md`): B1 Formeln und B5 Kurven → B2 mehrere Felder und B3 Runden → B9 Klasse 9 wählbar → Inhalte Klasse 9 → Werkzeug „Parameter am Graphen“ → Klasse 10 → B6, B7, B10 und die übrigen Werkzeuge für 11/12. Phase A geht per PR auf `main`.
8. **Formeldarstellung (B1):** **KaTeX** (abweichend von der Empfehlung, „das sieht besser aus“), nach Vorschaubildern KaTeX gegen MathML. Bedingungen und Eintrag im Entscheidungslog: `ARCHITEKTUR.md` T-22. Die Inhalte schreiben Formeln weiter in LaTeX-Schreibweise zwischen `$…$`.
9. **Niveaus unsichtbar** (PV, 02.11.2026): Lernende sehen keine Niveaus; die App wählt sie still je Kompetenz und bewertet dauernd neu (LEHRPLAN L-22, ersetzt L-3). Eltern und Lehrkraft-Bericht sehen sie, beim Aufgabenblatt und bei Prüfungen wählt man sie. **Jetzt, vor Klasse 9** gebaut. Für 9–12 heißt das: Jede Kompetenz braucht Vorlagen auf G, M und E, damit die Anpassung greift.
10. **Drucken in der iPhone-App** (Fehler vom PV gemeldet): eigene Druckseite im Browser (ARCHITEKTUR T-21, Ergänzung).

---

## Protokoll

Je PR eine Zeile unten in `docs/session/LERNKERN-PROTOKOLL.md`. Stand dieses Auftrags oben in dieser Datei und in `LERNKERN.md` aktualisieren.

## Startsatz für eine neue Sitzung

„Lies CLAUDE.md und `docs/session/KLASSE-9-12.md`. Arbeite im Strang Lernkern. Stelle zuerst die Rückfragen an den PV, dann Phase A.“
