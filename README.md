# Bastion

> Baue deine Bastion.

Bastion ist eine offline-fähige, datenschutzstarke Lern-App für Klasse 5–13 und berufsbildende Schulen – der Nachfolger der [Lerninsel](https://github.com/michael-linuxdev/lerninsel). Nachgewiesene Kompetenz wird sichtbar: als eigene Festung, die über Jahre wächst. Der Basebau ist vollständig optional.

**Keine Werbung. Keine In-App-Käufe. Kein Account. Kein Tracking.**

## Online

Testversion: **https://bastion.micana.de/** (wird bei jedem Push auf `main` automatisch aktualisiert)

## Status

Phase 0 – Fundament. Technisches Gerüst im Aufbau.

## Selbst ausprobieren

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
```

Offline ausprobieren: `pnpm build && pnpm preview`, Seite im Browser öffnen, warten bis „funktioniert jetzt auch ohne Internet“ erscheint, dann in den Entwicklerwerkzeugen „Offline“ einschalten (oder WLAN aus) und neu laden.

## Dokumentation

| Dokument | Inhalt |
|---|---|
| [VISION](docs/VISION.md) | Warum, für wen, unveränderliche Prinzipien |
| [KONZEPT](docs/KONZEPT.md) | Gesamtkonzept, Roadmap, offene Entscheidungen |
| [ARCHITEKTUR](docs/ARCHITEKTUR.md) | Tech-Stack und Architektur |
| [BASEBAU](docs/BASEBAU.md) | Ressourcen, Gebäude, Balancing |
| [LEHRPLAN](docs/LEHRPLAN.md) | Kompetenzmodell, erster Ausschnitt Mathe (Grundlagen Kl. 5–6) |
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
