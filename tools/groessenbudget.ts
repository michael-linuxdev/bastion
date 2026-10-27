// Prüft das Leistungsbudget aus ARCHITEKTUR §9: App-Hülle + Lernkern
// höchstens 250 KB JavaScript (gzip-komprimiert). Läuft nach `pnpm build`.
// Aufruf: pnpm budget
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const BUDGET_KB = 250;
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

const summe = dateien.reduce((s, d) => s + d.kb, 0);
for (const d of dateien.sort((a, b) => b.kb - a.kb)) {
  console.log(`${d.kb.toFixed(1).padStart(8)} KB  ${d.pfad}`);
}
console.log(`${summe.toFixed(1).padStart(8)} KB  gesamt (Budget: ${BUDGET_KB} KB, gzip)`);

if (summe > BUDGET_KB) {
  console.error(`Größenbudget überschritten um ${(summe - BUDGET_KB).toFixed(1)} KB.`);
  process.exit(1);
}
