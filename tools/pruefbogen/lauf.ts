// Prüfbogen ausgeben (INHALTSFORMAT §8, Stufe 2):
//   pnpm pruefbogen M.ZO.BR.BEGRIFF M.ZO.BR.ERWEITERN M.ZO.BR.ADD-SUB > pruefbogen.html
// Die Seite im Browser öffnen und als PDF drucken (T-17). Nicht ins Repository legen.
//   pnpm pruefbogen --online --name "Musterfeld Brüche" … > pruefbogen.html
// gibt die Seite zum Ausfüllen auf claude.ai aus (online.ts).
import { parseArgs } from 'node:util';
import { runnerImport } from 'vite';

const { values, positionals: ids } = parseArgs({
  allowPositionals: true,
  options: { online: { type: 'boolean', default: false }, name: { type: 'string' } },
});
if (ids.length === 0) {
  console.error('Aufruf: pnpm pruefbogen [--online] [--name "…"] <Kompetenz-ID> [weitere …]');
  process.exit(1);
}
const { module } = await runnerImport<typeof import('./aus-inhalten.ts')>(
  './tools/pruefbogen/aus-inhalten.ts',
  { configFile: false, logLevel: 'error' },
);
const eingabe = module.eingabeAusInhalten('content', ids, new Date().toISOString().slice(0, 10));
process.stdout.write(
  module.pruefbogen(eingabe, {
    form: values.online ? 'online' : 'druck',
    ...(values.name ? { name: values.name } : {}),
  }),
);
