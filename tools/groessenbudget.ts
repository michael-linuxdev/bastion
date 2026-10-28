// Prüft das Leistungsbudget aus ARCHITEKTUR §9: App-Hülle + Lernkern
// höchstens 250 KB JavaScript, die nachgeladenen, aber vorab gespeicherten
// Aufgaben-Generatoren (T-14) höchstens 400 KB, was nur bei Bedarf geladen wird
// (die Grafik der Bastion, PixiJS, tools/nachgeladen.ts) höchstens 300 KB – alles
// gzip-komprimiert. Läuft nach `pnpm build`.
// Aufruf: pnpm budget
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';
import { generatorDateien, nachgeladeneDateien } from './nachgeladen.ts';

const BUDGET_KB = 250;
const GRAFIK_BUDGET_KB = 300;
/** Aufgaben-Generatoren aller Klassen (T-14): nachgeladen, vorab gespeichert */
const GENERATOR_BUDGET_KB = 400;
const nachgeladen = nachgeladeneDateien('dist');
const generatoren = generatorDateien('dist');
const istGrafik = (pfad: string) => nachgeladen.has(pfad.replaceAll('\\', '/'));
const istGenerator = (pfad: string) => generatoren.has(pfad.replaceAll('\\', '/'));
const ORDNER = 'dist';

function jsDateien(ordner: string): string[] {
  return readdirSync(ordner, { withFileTypes: true }).flatMap((eintrag) => {
    const pfad = join(ordner, eintrag.name);
    if (eintrag.isDirectory()) return jsDateien(pfad);
    return eintrag.name.endsWith('.js') ? [pfad] : [];
  });
}

const dateien = jsDateien(ORDNER).map((pfad) => ({
  pfad: relative(ORDNER, pfad),
  kb: gzipSync(readFileSync(pfad), { level: 9 }).length / 1024,
}));

if (dateien.length === 0) {
  console.error(`Keine JavaScript-Dateien in ${ORDNER}/ gefunden – vorher pnpm build ausführen.`);
  process.exit(1);
}

for (const d of dateien.sort((a, b) => b.kb - a.kb)) {
  console.log(`${d.kb.toFixed(1).padStart(8)} KB  ${d.pfad}`);
}
let fehler = false;
for (const [name, budget, liste] of [
  [
    'App-Hülle und Lernkern',
    BUDGET_KB,
    dateien.filter((d) => !istGrafik(d.pfad) && !istGenerator(d.pfad)),
  ],
  [
    'Aufgaben-Generatoren (nachgeladen, vorab gespeichert)',
    GENERATOR_BUDGET_KB,
    dateien.filter((d) => istGenerator(d.pfad)),
  ],
  ['Grafik der Bastion (nachgeladen)', GRAFIK_BUDGET_KB, dateien.filter((d) => istGrafik(d.pfad))],
] as const) {
  const summe = liste.reduce((s, d) => s + d.kb, 0);
  console.log(`${summe.toFixed(1).padStart(8)} KB  ${name} (Budget: ${budget} KB, gzip)`);
  if (summe > budget) {
    console.error(`${name}: Größenbudget überschritten um ${(summe - budget).toFixed(1)} KB.`);
    fehler = true;
  }
}
if (fehler) process.exit(1);
