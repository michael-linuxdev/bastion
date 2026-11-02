// Prüfbogen ausgeben (INHALTSFORMAT §8, Stufe 2):
//   pnpm pruefbogen M.ZO.BR.BEGRIFF M.ZO.BR.ERWEITERN M.ZO.BR.ADD-SUB > pruefbogen.html
// Die Seite im Browser öffnen und als PDF drucken (T-17). Nicht ins Repository legen.
// Zum Ausfüllen am Bildschirm gibt es die Prüfseite in der App (Elternbereich, ARCHITEKTUR T-22).
//   pnpm pruefbogen einlesen bewertung.json > arbeitsliste.md
// liest die Datei „Ergebnis herunterladen“ der Prüfseite (einlesen.ts, FOKUS F3).
import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { runnerImport } from 'vite';

if (process.argv[2] === 'einlesen') {
  const datei = process.argv[3];
  if (!datei) {
    console.error('Aufruf: pnpm pruefbogen einlesen <datei.json>');
    process.exit(1);
  }
  const { module } = await runnerImport<typeof import('./einlesen-laden.ts')>(
    './tools/pruefbogen/einlesen-laden.ts',
    { configFile: false, logLevel: 'error' },
  );
  process.stdout.write(module.arbeitslisteAus(readFileSync(datei, 'utf8'), 'content'));
  process.exit(0);
}

const { values, positionals: ids } = parseArgs({
  allowPositionals: true,
  options: { name: { type: 'string' } },
});
if (ids.length === 0) {
  console.error('Aufruf: pnpm pruefbogen [--name "…"] <Kompetenz-ID> [weitere …]');
  process.exit(1);
}
const { module } = await runnerImport<typeof import('./aus-inhalten.ts')>(
  './tools/pruefbogen/aus-inhalten.ts',
  { configFile: false, logLevel: 'error' },
);
const eingabe = module.eingabeAusInhalten('content', ids, new Date().toISOString().slice(0, 10));
process.stdout.write(module.pruefbogen(eingabe, values.name ? { name: values.name } : {}));
