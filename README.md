# Bastion

> Baue deine Bastion.

Bastion ist eine Lern-App für Mathematik, zuerst nach den Lehrplänen in **Sachsen**. Sie läuft im Browser, auch ohne Internet. Sie ist der Nachfolger der [Lerninsel](https://github.com/michael-linuxdev/lerninsel).

Was man nachweislich kann, wird sichtbar: als eigene Bastion, die über die Jahre wächst. Wer das nicht möchte, schaltet den Bau ab und lernt ohne Nachteil weiter.

**Keine Werbung. Keine In-App-Käufe. Kein Konto. Kein Tracking.** Alle Daten bleiben auf dem Gerät.

## Ausprobieren

**https://bastion.micana.de/** – im Browser öffnen, nichts installieren, kein Konto. Nach dem ersten Laden geht es auch offline. Die Seite wird bei jeder Änderung auf `main` automatisch aktualisiert.

## Für wen

- **Schülerinnen und Schüler** der Klassen 5 bis 10 an Oberschule und Gymnasium in Sachsen. Jahrgang 11/12 (Grund- und Leistungskurs) ist wählbar, die Themen dafür entstehen gerade.
- **Erwachsene**, die Schulmathematik neu lernen oder auffrischen möchten. Ab 18 Jahren verwaltet man sich selbst, ganz ohne Elternbereich.
- **Eltern**: Im Elternbereich (mit PIN) sehen sie, was geübt wurde, und können Klasse und Schulart einstellen.
- **Lehrkräfte**: Auf Wunsch zeigen Kinder oder Eltern einen Bericht je Lernfeld, auch als Textdatei.

## Was die App heute kann

- **Üben:** 501 Aufgabenvorlagen zu 176 Themen aus Klasse 5 bis 10, auf drei Niveaus (Grundlagen, mittel, erweitert; erweitert bei 159 Themen). Dazu gibt es Hilfen, Lösungswege, Zwischenschritte, Bilder, Formeln und Zeichen-Anleitungen. Fachbegriffe lassen sich antippen und werden erklärt. Aufgaben ohne Taschenrechner sind gekennzeichnet.
- **Erklären:** Jedes Thema hat eine Erstvermittlung Schritt für Schritt, mit Fragen zwischendurch. Wer einen typischen Denkfehler macht, bekommt genau dazu eine Erklärung und den Weg zurück zur passenden Stelle (338 beschriebene Fehlvorstellungen).
- **Wiederholen** zur richtigen Zeit. Die Fehlerwerkstatt arbeitet falsch gelöste Aufgaben gezielt auf.
- **„Wo stehe ich?“:** Diagnose für eine Klasse oder für alles ab Klasse 5. Für den Wiedereinstieg zeigt sie, welcher Klasse der eigene Stand etwa entspricht.
- **Schulalltag:** Was ist gerade in der Schule dran? Wann ist die nächste Klassenarbeit, mit welchen Themen? Dazu gibt es eine Probe-Klassenarbeit ohne Note. Das Datum steht da, ohne Countdown.
- **Wechsel begleiten:** Wer eine Klasse überspringt, bekommt gezielt die Lücken daraus geprüft. Ein Schulartwechsel zeigt die Themen, die nun früher drankommen. Wer eine Klasse wiederholt, bekommt keine Meldung, und nichts geht verloren.
- **Bastion bauen** (abschaltbar): Für geübte und gefestigte Themen gibt es Baustoffe. Es gibt keine Zufallsbelohnungen, keine Zeitdruck-Timer und keinen Verfall.
- **Für Lehrkräfte:** Im Elternbereich lässt sich ein Aufgabenblatt zusammenstellen: Themen nach Klasse und Bereich, Niveau, Anzahl, Blatt-Nr., Lösungsseite und Punkte für eine Probe-Klassenarbeit. „Drucken / als PDF speichern“ öffnet den Druckdialog des Browsers. Gleiche Blatt-Nr., gleiche Aufgaben.
- **Sicherung:** Eine verschlüsselte Datei mit Code aus sechs Wörtern. So kommt man zum Beispiel auf ein neues Gerät.

**Wichtig:** Alle Aufgaben und Erklärungen sind ein Entwurf. Eine Lehrkraft hat sie noch nicht geprüft. Hinweise auf Fehler sind sehr willkommen.

### Was ist öffentlich?

Auf `main` liegen alle Inhalte, auch Entwürfe. Die öffentliche Seite zeigt nur Themen ab einer Review-Stufe (`docs/INHALTSFORMAT.md` §8, Entscheidung T-20). Die Stufe steht in der Repository-Variable `BASTION_MINDESTSTUFE` (GitHub → Settings → Secrets and variables → Actions → Variables). Ohne Variable gilt 0: Die Seite zeigt alles und sagt Eltern auf der Startseite und im Elternbereich, dass es ein Entwurf ist. Mit 2 zeigt sie nur Themen, die eine Lehrkraft geprüft hat. Ein Thema kommt nur ganz hinein, mit Erklärung, allen Aufgaben und allen Fehlvorstellungen.

Selbst ausprobieren: `BASTION_MINDESTSTUFE=1 pnpm build && pnpm preview`. Dann erscheinen nur Themen, deren Dateien alle mindestens Stufe 1 haben. Stand 04.11.2026: Im Musterfeld Brüche (drei Themen) haben alle Dateien Stufe 1 bis auf die drei neueren Vorlagen `begruenden.yaml`; sobald sie geprüft sind, erscheinen die drei Themen. Bis dahin zeigt die Seite die Hinweisseite. `pnpm review` zeigt den Stand.

## Für Entwickler: selbst bauen

Voraussetzungen: Node.js ab Version 22 und pnpm (`corepack enable` aktiviert die passende Version).

```sh
pnpm install     # Abhängigkeiten installieren
pnpm dev         # Entwicklungsserver starten, Adresse steht in der Ausgabe
pnpm lint        # Prüfungen: ESLint inkl. Ordnergrenzen, Formatierung, Typen
pnpm format      # Code automatisch formatieren
pnpm test        # Einheitentests
pnpm build       # fertige App nach dist/ bauen
pnpm budget      # Größenbudget prüfen (nach pnpm build)
pnpm test:e2e    # Ende-zu-Ende-Tests im Browser (nach pnpm build)
pnpm messen      # Ladezeiten auf nachgeahmtem Altgerät messen (nach pnpm build)
pnpm inhalte:pruefen  # Inhalte in content/ prüfen und Abdeckung anzeigen
pnpm fehlerschueler   # Verdachtsfälle im Fehlerkatalog suchen (in der CI: --grenze)
pnpm review           # Review-Stufen und veraltete Vermerke anzeigen
pnpm pruefbogen <IDs> # Prüfbogen für eine Lehrkraft (HTML, als PDF drucken)
pnpm arbeitsblatt <IDs> --niveau G --anzahl 12   # Arbeitsblatt drucken
pnpm testnummern 3    # Teilnehmer-Nummern für den Test mit Jugendlichen
pnpm auswertung <Dateien>   # Testprotokolle auswerten (TESTS.md §4.5)
```

Offline ausprobieren: `pnpm build && pnpm preview`, Seite im Browser öffnen, warten bis „funktioniert jetzt auch ohne Internet“ erscheint, dann in den Entwicklerwerkzeugen „Offline“ einschalten (oder WLAN aus) und neu laden.

## Dokumentation

| Dokument | Inhalt |
|---|---|
| [VISION](docs/VISION.md) | Warum, für wen, unveränderliche Prinzipien |
| [KONZEPT](docs/KONZEPT.md) | Gesamtkonzept, Roadmap, offene Entscheidungen |
| [ARCHITEKTUR](docs/ARCHITEKTUR.md) | Tech-Stack und Architektur |
| [BASEBAU](docs/BASEBAU.md) | Ressourcen, Gebäude, Balancing |
| [GRAFIK](docs/GRAFIK.md) | Aussehen: Richtung, Farben, hell und dunkel, austauschbare Grafik |
| [LEHRPLAN](docs/LEHRPLAN.md) | Kompetenzmodell nach den sächsischen Lehrplänen, Klasse 5 bis 12 |
| [Quellen](docs/quellen/README.md) | Verbindliche Lehrpläne (Sachsen) |
| [INHALTSFORMAT](docs/INHALTSFORMAT.md) | Aufgabenformat, Generatoren, Review |
| [DATENMODELL](docs/DATENMODELL.md) | Ereignisse, Speicherung, Export, Datenschutz |
| [STRATEGIE](docs/STRATEGIE.md) | Ziel, Scope und Erfolgskriterien für die nächsten 12 Monate |
| [WETTBEWERB](docs/WETTBEWERB.md) | Vergleich mit bestehenden Angeboten, Hypothesen |
| [TESTS](docs/TESTS.md) | Realitätstests mit Jugendlichen: Ansprache, Einwilligung, Ablauf; druckfertige [Unterlagen](docs/vorlagen/test-unterlagen.html) |
| [PLAN](docs/PLAN.md) | Aktueller Stand, Aufgaben, Nicht-Ziele |
| [ENTSCHEIDUNGEN](docs/ENTSCHEIDUNGEN.md) | Entscheidungs-Review (Checkliste) |
| [SESSION-PROMPT](docs/SESSION-PROMPT.md) | Einstieg in die nächste Arbeitssitzung, mit den Strängen [Lernkern](docs/session/LERNKERN.md), [Grafik](docs/session/GRAFIK.md) und [Oberfläche](docs/session/OBERFLAECHE.md) |

## Lizenz

- **Code:** GNU Affero General Public License v3.0 (AGPL-3.0)
- **Inhalte** (`content/`): Creative Commons Namensnennung – Weitergabe unter gleichen Bedingungen 4.0 (CC BY-SA 4.0)

Siehe `LICENSE` und `content/LICENSE.md`.
