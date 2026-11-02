// Fehler-Schüler ausführen (FOKUS F5): pnpm fehlerschueler [--seeds 200] > verdacht.md
// Sperrklinke (B4): pnpm fehlerschueler --grenze prüft gegen fehlerschueler-grenze.json
// und endet mit Fehler, wenn eine Art mehr Funde hat als erlaubt (CI).
// Gibt Verdachtsfälle je Feld aus. Funde werden nicht automatisch korrigiert:
// Inhalte ändern sich nur in eigenen PRs mit Begründung (INHALTSFORMAT §8).
// Die Generatoren kommen über Vite (import.meta.glob), darum runnerImport.
import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { runnerImport } from 'vite';

const { values } = parseArgs({
  options: {
    seeds: { type: 'string', default: '200' },
    grenze: { type: 'boolean', default: false },
  },
});
const seeds = Math.max(1, Number(values.seeds) || 200);

const { module } = await runnerImport<typeof import('./fehlerschueler-laden.ts')>(
  './tools/inhalte/fehlerschueler-laden.ts',
  { configFile: false, logLevel: 'error' },
);
if (values.grenze) {
  const { module: g } = await runnerImport<typeof import('./fehlerschueler-grenze.ts')>(
    './tools/inhalte/fehlerschueler-grenze.ts',
    { configFile: false, logLevel: 'error' },
  );
  const grenze = g.leseGrenze(
    JSON.parse(readFileSync('tools/inhalte/fehlerschueler-grenze.json', 'utf8')) as unknown,
  );
  const m = g.meldung(g.vergleiche(module.fundeJeArt(seeds), grenze));
  process.stdout.write(m.text);
  process.exit(m.ok ? 0 : 1);
}
process.stdout.write(module.verdachtAlsText(seeds));
