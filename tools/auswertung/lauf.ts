// Auswertung der Testprotokolle für U4b (FOKUS F4, TESTS.md §4.5):
//   pnpm auswertung protokoll-1.json protokoll-2.json … > bericht.md
//   pnpm auswertung --nummern …   zeigt die Teilnehmer-Nummern neben „Person 1 …“
// Die Rechnungen stehen in src/core/testphase/auswertung.ts. Protokolle und Bericht
// kommen nicht ins Repository (TESTS.md §4.4).
import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { bericht, gesamtAuswerten, protokollLesen } from '../../src/core/testphase/auswertung.ts';
import type { Testprotokoll } from '../../src/core/testphase/protokoll.ts';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { nummern: { type: 'boolean', default: false } },
});

if (positionals.length === 0) {
  console.error('Aufruf: pnpm auswertung [--nummern] <protokoll.json> …');
  process.exit(1);
}

const protokolle: Testprotokoll[] = [];
let fehlerhaft = false;
for (const datei of positionals) {
  let daten: unknown;
  try {
    daten = JSON.parse(readFileSync(datei, 'utf8'));
  } catch (e) {
    console.error(`${datei}: nicht lesbar (${(e as Error).message})`);
    fehlerhaft = true;
    continue;
  }
  const r = protokollLesen(daten);
  if ('fehler' in r) {
    console.error(`${datei}: ${r.fehler}`);
    fehlerhaft = true;
  } else protokolle.push(r.protokoll);
}
if (fehlerhaft) process.exit(1);

console.log(bericht(gesamtAuswerten(protokolle), { mitNummern: values.nummern }));
