# Bastion

> Baue deine Bastion.

Bastion ist eine Lern-App für Mathematik, zuerst nach den Lehrplänen in **Sachsen**. Sie läuft im Browser, auch ohne Internet. Sie ist der Nachfolger der [Lerninsel](https://github.com/michael-linuxdev/lerninsel).

Was man nachweislich kann, wird sichtbar: als eigene Bastion, die über die Jahre wächst. Wer das nicht möchte, schaltet den Bau ab und lernt ohne Nachteil weiter.

**Keine Werbung. Keine In-App-Käufe. Kein Konto. Kein Tracking.** Alle Daten bleiben auf dem Gerät.

## Ausprobieren

**https://bastion.micana.de/** – im Browser öffnen, nichts installieren, kein Konto. Nach dem ersten Laden geht es auch offline. Die Seite wird bei jeder Änderung auf `main` automatisch aktualisiert.

## Für wen

- **Schülerinnen und Schüler** der Klassen 5 bis 8 an Oberschule und Gymnasium in Sachsen. Klasse 9 bis 12 folgen.
- **Erwachsene**, die Schulmathematik neu lernen oder auffrischen möchten. Ab 18 Jahren verwaltet man sich selbst, ganz ohne Elternbereich.
- **Eltern**: Im Elternbereich (mit PIN) sehen sie, was geübt wurde, und können Klasse und Schulart einstellen.
- **Lehrkräfte**: Auf Wunsch zeigen Kinder oder Eltern einen Bericht je Lernfeld, auch als Textdatei.

## Was die App heute kann

- **Üben:** 255 Aufgabenvorlagen zu 123 Themen aus Klasse 5 bis 8, je auf zwei Niveaus (Grundlagen und mehr). Dazu gibt es Hilfen, Lösungswege, Bilder und Zeichen-Anleitungen. Fachbegriffe lassen sich antippen und werden erklärt.
- **Wiederholen** zur richtigen Zeit. Die Fehlerwerkstatt arbeitet falsch gelöste Aufgaben gezielt auf.
- **„Wo stehe ich?“:** Diagnose für eine Klasse oder für alles ab Klasse 5. Für den Wiedereinstieg zeigt sie, welcher Klasse der eigene Stand etwa entspricht.
- **Schulalltag:** Was ist gerade in der Schule dran? Wann ist die nächste Klassenarbeit, mit welchen Themen? Dazu gibt es eine Probe-Klassenarbeit ohne Note. Das Datum steht da, ohne Countdown.
- **Wechsel begleiten:** Wer eine Klasse überspringt, bekommt gezielt die Lücken daraus geprüft. Ein Schulartwechsel zeigt die Themen, die nun früher drankommen. Wer eine Klasse wiederholt, bekommt keine Meldung, und nichts geht verloren.
- **Bastion bauen** (abschaltbar): Für geübte und gefestigte Themen gibt es Baustoffe. Es gibt keine Zufallsbelohnungen, keine Zeitdruck-Timer und keinen Verfall.
- **Sicherung:** Eine verschlüsselte Datei mit Code aus sechs Wörtern. So kommt man zum Beispiel auf ein neues Gerät.

**Wichtig:** Alle Aufgaben und Erklärungen sind ein Entwurf. Eine Lehrkraft hat sie noch nicht geprüft. Hinweise auf Fehler sind sehr willkommen.

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
| [LEHRPLAN](docs/LEHRPLAN.md) | Kompetenzmodell; Klasse 5 bis 8 nach den sächsischen Lehrplänen, Entscheidungen L-1 bis L-19 |
| [Quellen](docs/quellen/README.md) | Verbindliche Lehrpläne (Sachsen) |
| [INHALTSFORMAT](docs/INHALTSFORMAT.md) | Aufgabenformat, Generatoren, Review |
| [DATENMODELL](docs/DATENMODELL.md) | Ereignisse, Speicherung, Export, Datenschutz |
| [STRATEGIE](docs/STRATEGIE.md) | Ziel, Scope und Erfolgskriterien für die nächsten 12 Monate |
| [WETTBEWERB](docs/WETTBEWERB.md) | Vergleich mit bestehenden Angeboten, Hypothesen |
| [TESTS](docs/TESTS.md) | Realitätstests mit Jugendlichen: Ansprache, Einwilligung, Ablauf |
| [PLAN](docs/PLAN.md) | Aktueller Stand, Aufgaben, Nicht-Ziele |
| [ENTSCHEIDUNGEN](docs/ENTSCHEIDUNGEN.md) | Entscheidungs-Review (Checkliste) |
| [SESSION-PROMPT](docs/SESSION-PROMPT.md) | Einstieg in die nächste Arbeitssitzung |

## Lizenz

- **Code:** GNU Affero General Public License v3.0 (AGPL-3.0)
- **Inhalte** (`content/`): Creative Commons Namensnennung – Weitergabe unter gleichen Bedingungen 4.0 (CC BY-SA 4.0)

Siehe `LICENSE` und `content/LICENSE.md`.
