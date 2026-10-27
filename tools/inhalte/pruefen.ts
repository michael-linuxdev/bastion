// Prüft die Inhalte in content/ (INHALTSFORMAT §10.1, Punkte 1–3) und gibt
// einen Bericht aus. Aufruf: pnpm inhalte:pruefen
import {
  pruefeGraph,
  pruefeKompetenz,
  type Kompetenz,
} from '../../src/core/competence/kompetenz.ts';
import { ladeKompetenzen } from './laden.ts';

export interface Pruefbericht {
  readonly fehler: string[];
  readonly kompetenzen: Kompetenz[];
}

export function pruefeInhalte(inhaltsordner: string): Pruefbericht {
  const fehler: string[] = [];
  const kompetenzen: Kompetenz[] = [];
  for (const d of ladeKompetenzen(inhaltsordner)) {
    if (d.lesefehler) {
      fehler.push(`${d.datei}: ${d.lesefehler}`);
      continue;
    }
    const f = pruefeKompetenz(d.daten, d.pfadTeile);
    fehler.push(...f.map((x) => `${d.datei}: ${x}`));
    if (f.length === 0) kompetenzen.push(d.daten as Kompetenz);
  }
  fehler.push(...pruefeGraph(kompetenzen));
  return { fehler, kompetenzen };
}

// Nur beim direkten Aufruf als Skript einen Bericht ausgeben.
if (import.meta.url === `file://${process.argv[1]}`) {
  const { fehler, kompetenzen } = pruefeInhalte('content');
  const zaehle = (fn: (k: Kompetenz) => boolean) => kompetenzen.filter(fn).length;
  const kl5 = kompetenzen.filter((k) => k.klassenstufe_typisch.includes(5));
  console.log(`Kompetenzen: ${kompetenzen.length} (davon Klasse 5: ${kl5.length})`);
  console.log(
    `Abdeckung: ${zaehle((k) => k.abdeckung === 'generator')} Generator · ` +
      `${zaehle((k) => k.abdeckung === 'gemischt')} gemischt · ` +
      `${zaehle((k) => k.abdeckung === 'handverfasst')} handverfasst · ` +
      `${zaehle((k) => k.zeichnen_erklaert === true)} mit Zeichenanleitung`,
  );
  console.log(
    `Lehrplan Sachsen: ${zaehle((k) => !!k.sachsen.oberschule)} mit Oberschul-, ` +
      `${zaehle((k) => !!k.sachsen.gymnasium)} mit Gymnasialbezug`,
  );
  console.log(
    'Reviews: noch kein Prüfwerkzeug – alle Kompetenzen gelten als ungeprüft (INHALTSFORMAT §8).',
  );
  if (fehler.length > 0) {
    console.error(`\n${fehler.length} Fehler:`);
    for (const f of fehler) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log('\nKeine Fehler.');
}
