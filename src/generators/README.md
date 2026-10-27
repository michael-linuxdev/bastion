# src/generators

Parametrisierte Aufgabengeneratoren (INHALTSFORMAT §6). Rein und deterministisch, Zufall nur über `src/core/rng`.

- Schnittstelle: `src/core/learning/generator.ts`
- Verzeichnis aller Generatoren: `index.ts` (Schlüssel `id@version`) – sammelt jeden exportierten Generator unter `mathematik/` automatisch ein
- Gemeinsame Bausteine: `hilfen.ts` (Zufallszahlen, Mischen, Runden …), im Kern `fehlerbilderAus` und `gleicheLoesung`
- Pflicht-Tests (INHALTSFORMAT §6.3): `pflichttests.ts` – jeder Generator ruft sie in seiner `*.test.ts` auf
