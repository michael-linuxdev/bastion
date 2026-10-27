import type { Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { RUNDUNGSSTELLEN, rundenAufStelle, ueberschlag } from './runden';

const stelleVon = (s: Sprachobjekt) => RUNDUNGSSTELLEN.findIndex((x) => x?.de === s.de);
// Unabhängig: Runden über die Zeichenkette (Ziffer rechts der Stelle betrachten).
function rundeText(n: number, k: number): number {
  const ab = Math.trunc(n / 10 ** k) * 10 ** k;
  const ziffer = Number(
    String(n)
      .padStart(k + 1, '0')
      .at(-k) ?? '0',
  );
  return ziffer >= 5 ? ab + 10 ** k : ab;
}

pflichttests(rundenAufStelle, {
  niveaus: {
    G: { stelle_min: 1, stelle_max: 3, zusatzstellen_max: 2 },
    M: { stelle_min: 2, stelle_max: 6, zusatzstellen_max: 3 },
  },
  unabhaengigeLoesung: (i) => ({
    typ: 'zahl',
    wert: rundeText(
      i.platzhalter['zahl'] as number,
      stelleVon(i.platzhalter['stelle'] as Sprachobjekt),
    ),
  }),
  grenzverletzungen(i, p) {
    const k = stelleVon(i.platzhalter['stelle'] as Sprachobjekt);
    const stellen = String(i.platzhalter['zahl']).length;
    const f: string[] = [];
    if (k < p.stelle_min || k > p.stelle_max) f.push(`Stelle ${k}`);
    if (stellen <= k || stellen > k + p.zusatzstellen_max)
      f.push(`${stellen} Stellen bei Stelle ${k}`);
    return f;
  },
  // G: Zehner-Aufgaben mit zwei- bis dreistelligen Zahlen haben wenig Spielraum.
  mindestensVerschieden: { G: 85, M: 95 },
});

pflichttests(ueberschlag, {
  niveaus: {
    G: { stellen_min: 3, stellen_max: 4, stelle: 2 },
    M: { stellen_min: 5, stellen_max: 7, stelle: 3 },
  },
  unabhaengigeLoesung(i, p) {
    const a = rundeText(i.platzhalter['a'] as number, p.stelle);
    const b = rundeText(i.platzhalter['b'] as number, p.stelle);
    const plus = (i.platzhalter['zeichen'] as Sprachobjekt).de === '+';
    return { typ: 'zahl', wert: plus ? a + b : a - b };
  },
  grenzverletzungen(i, p) {
    const f: string[] = [];
    for (const n of [i.platzhalter['a'], i.platzhalter['b']] as number[]) {
      const s = String(n).length;
      if (s < p.stellen_min || s > p.stellen_max + 1) f.push(`${n}: ${s} Stellen`);
    }
    if (i.loesung.typ === 'zahl' && i.loesung.wert <= 0) f.push('Ergebnis nicht positiv');
    return f;
  },
  mindestensVerschieden: { G: 95, M: 95 },
});
