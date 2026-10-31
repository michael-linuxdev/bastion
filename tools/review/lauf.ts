// Review-Stufen ansehen und setzen (INHALTSFORMAT §8).
//   pnpm review                       Stand: wie viele Dateien auf welcher Stufe, veraltete Vermerke
//   pnpm review setzen --stufe 2 --pruefer "Name" M.ZO.BR.BEGRIFF FV.BR.ADDITIV …
// Stufe 1 (Prüfer „maschine“) erst setzen, wenn `pnpm test` grün ist und der Prüfkatalog
// (INHALTSFORMAT §8) für genau diese Dateien keinen Widerspruch gefunden hat.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { parse } from 'yaml';
import { neuerReview, wirksameStufe, type ReviewStufe } from '../../src/core/learning/review';
import { setzeReviewBlock } from './block';
import { aufloesen, inhaltsdateien, type Inhaltsdatei } from './dateien';

const ORDNER = 'content';
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    stufe: { type: 'string' },
    pruefer: { type: 'string' },
    datum: { type: 'string' },
  },
});
const [befehl, ...angaben] = positionals;
const alle = inhaltsdateien(ORDNER);

const eingetragen = (d: Inhaltsdatei) => {
  const r = d.daten['review'] as { stufe?: unknown } | undefined;
  return typeof r?.stufe === 'number' ? r.stufe : 0;
};

function stand(): void {
  const zahl: Record<string, number[]> = {};
  const veraltet: string[] = [];
  for (const d of alle) {
    const w = wirksameStufe(d.daten);
    (zahl[d.art] ??= [0, 0, 0, 0])[w] = (zahl[d.art]?.[w] ?? 0) + 1;
    if (eingetragen(d) > w) veraltet.push(`${d.datei} (eingetragen ${eingetragen(d)}, gilt ${w})`);
  }
  console.log('Wirksame Review-Stufen (0 Entwurf · 1 Maschine · 2 Stichprobe · 3 mit Lernenden)');
  for (const [art, z] of Object.entries(zahl))
    console.log(`  ${art.padEnd(16)} ${z.map((n, i) => `${i}: ${n}`).join('  ')}`);
  if (veraltet.length > 0) {
    console.log(`\nVeraltet (nach dem Vermerk geändert, Stufe neu setzen):`);
    for (const v of veraltet) console.log(`  ${v}`);
  }
}

function setzen(): number {
  const stufe = Number(values.stufe);
  if (stufe !== 1 && stufe !== 2 && stufe !== 3) {
    console.error('--stufe 1, 2 oder 3 fehlt');
    return 1;
  }
  const pruefer = stufe === 1 ? 'maschine' : (values.pruefer ?? '').trim();
  if (pruefer === '') {
    console.error('--pruefer fehlt: Name der Person (Stufe 2) oder der Testrunde (Stufe 3)');
    return 1;
  }
  const datum = values.datum ?? new Date().toISOString().slice(0, 10);
  const { dateien, unbekannt } = aufloesen(alle, angaben);
  if (unbekannt.length > 0 || dateien.length === 0) {
    console.error(`Nicht gefunden: ${unbekannt.join(', ') || '(keine Angabe)'}`);
    return 1;
  }
  // Erst alle prüfen, dann schreiben: entweder alle Dateien oder keine.
  const neu: { pfad: string; text: string; stufe: ReviewStufe }[] = [];
  const fehler: string[] = [];
  for (const d of dateien) {
    const r = neuerReview(d.daten, stufe, pruefer, datum);
    if ('fehler' in r) fehler.push(`${d.datei}: ${r.fehler}`);
    else {
      const pfad = join(ORDNER, d.datei);
      neu.push({ pfad, text: setzeReviewBlock(readFileSync(pfad, 'utf8'), r.review), stufe });
    }
  }
  if (fehler.length > 0) {
    console.error(`Nichts geschrieben:\n  ${fehler.join('\n  ')}`);
    return 1;
  }
  for (const n of neu) {
    if (wirksameStufe(parse(n.text) as Record<string, unknown>) !== n.stufe)
      throw new Error(`${n.pfad}: Vermerk passt nach dem Schreiben nicht zum Inhalt`);
  }
  for (const n of neu) writeFileSync(n.pfad, n.text);
  console.log(
    `Stufe ${stufe} (${pruefer}, ${datum}) gesetzt in ${neu.length} ${neu.length === 1 ? 'Datei' : 'Dateien'}:`,
  );
  for (const n of neu) console.log(`  ${n.pfad}`);
  return 0;
}

if (befehl === undefined) stand();
else if (befehl === 'setzen') process.exitCode = setzen();
else {
  console.error('Aufruf: pnpm review  oder  pnpm review setzen --stufe N [--pruefer "…"] <IDs>');
  process.exitCode = 1;
}
