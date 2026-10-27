import { pflichttests } from '../../pflichttests';
import { vergleichszeichen } from './vergleichen';

pflichttests(vergleichszeichen, {
  niveaus: { G: { stellen: 4 }, M: { stellen: 8 } },
  unabhaengigeLoesung(i) {
    const a = BigInt(i.platzhalter['a'] as number);
    const b = BigInt(i.platzhalter['b'] as number);
    return { typ: 'auswahl', wert: a < b ? 0 : a === b ? 1 : 2 };
  },
  grenzverletzungen(i, p) {
    const f: string[] = [];
    for (const n of [i.platzhalter['a'], i.platzhalter['b']] as number[]) {
      const s = String(n).length;
      if (s < p.stellen || s > p.stellen + 1) f.push(`${n} hat ${s} Stellen`);
    }
    return f;
  },
  mindestensVerschieden: { G: 90, M: 95 },
});
