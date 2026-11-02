// Fehler-Schüler ausführen (FOKUS F5): pnpm fehlerschueler [--seeds 200] > verdacht.md
// Gibt Verdachtsfälle je Feld aus. Funde werden nicht automatisch korrigiert:
// Inhalte ändern sich nur in eigenen PRs mit Begründung (INHALTSFORMAT §8).
// Die Generatoren kommen über Vite (import.meta.glob), darum runnerImport.
import { parseArgs } from 'node:util';
import { runnerImport } from 'vite';

const { values } = parseArgs({ options: { seeds: { type: 'string', default: '200' } } });
const seeds = Math.max(1, Number(values.seeds) || 200);

const { module } = await runnerImport<typeof import('./fehlerschueler-laden.ts')>(
  './tools/inhalte/fehlerschueler-laden.ts',
  { configFile: false, logLevel: 'error' },
);
process.stdout.write(module.verdachtAlsText(seeds));
