// Arbeitsblatt ausgeben (FOKUS F6):
//   pnpm arbeitsblatt M.ZO.BR.ERWEITERN M.ZO.BR.ADD-SUB --niveau G --anzahl 12 --seed 7 > blatt.html
// Die Seite im Browser öffnen und als PDF drucken. Ohne --seed wird eine Nummer gewürfelt; sie
// steht unten auf dem Blatt und ergibt mit denselben Angaben wieder genau dieses Blatt.
import { parseArgs } from 'node:util';
import { runnerImport } from 'vite';

const { values, positionals: ids } = parseArgs({
  allowPositionals: true,
  options: {
    niveau: { type: 'string', default: 'G' },
    anzahl: { type: 'string', default: '12' },
    seed: { type: 'string' },
  },
});
const niveau = values.niveau;
const anzahl = Number(values.anzahl);
// Nur für die Blatt-Nummer; die Aufgaben selbst zieht src/core/rng aus dieser Nummer.
const seed =
  values.seed === undefined ? Math.floor(Math.random() * 100000) + 1 : Number(values.seed);
if (
  ids.length === 0 ||
  (niveau !== 'G' && niveau !== 'M' && niveau !== 'E') ||
  !Number.isInteger(anzahl) ||
  anzahl < 1 ||
  anzahl > 60 ||
  !Number.isInteger(seed) ||
  seed < 0 ||
  seed > 0xffffffff
) {
  console.error(
    'Aufruf: pnpm arbeitsblatt <Kompetenz-ID> [weitere …] [--niveau G|M|E] [--anzahl 1–60] [--seed Zahl]',
  );
  process.exit(1);
}
const { module } = await runnerImport<typeof import('./aus-inhalten.ts')>(
  './tools/pruefbogen/aus-inhalten.ts',
  { configFile: false, logLevel: 'error' },
);
const eingabe = module.eingabeAusInhalten('content', ids, '');
process.stdout.write(module.arbeitsblatt(eingabe, { niveau, anzahl, seed }));
