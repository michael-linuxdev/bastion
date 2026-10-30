// Prüfbogen ausgeben (INHALTSFORMAT §8, Stufe 2):
//   pnpm pruefbogen M.ZO.BR.BEGRIFF M.ZO.BR.ERWEITERN M.ZO.BR.ADD-SUB > pruefbogen.html
// Die Seite im Browser öffnen und als PDF drucken (T-17). Nicht ins Repository legen.
import { runnerImport } from 'vite';

const ids = process.argv.slice(2);
if (ids.length === 0) {
  console.error('Aufruf: pnpm pruefbogen <Kompetenz-ID> [weitere …]');
  process.exit(1);
}
const { module } = await runnerImport<typeof import('./aus-inhalten.ts')>(
  './tools/pruefbogen/aus-inhalten.ts',
  { configFile: false, logLevel: 'error' },
);
process.stdout.write(
  module.bogenAusInhalten('content', ids, new Date().toISOString().slice(0, 10)),
);
