# src/storage

Persistenz-Adapter (Dexie/IndexedDB, T-4) und später Migrationen.

- `datenbank.ts` – Schema nach DATENMODELL §6 (Schemaversion 1)
- `ablage.ts` – einzige Schnittstelle nach außen: einrichten, speichereAufgabe, kompetenzStaende, neuBerechnen

Die Regeln (Status einer Kompetenz, Bewertung) stehen im Kern (`src/core/learning/`), hier wird nur gespeichert.
