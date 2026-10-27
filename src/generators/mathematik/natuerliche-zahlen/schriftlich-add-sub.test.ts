import type { Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { schriftlichAddieren, schriftlichSubtrahieren } from './schriftlich-add-sub';

const SCHMAL = String.fromCharCode(0x202f);
const zahlen = (text: string) => text.split(' + ').map((t) => BigInt(t.replaceAll(SCHMAL, '')));

pflichttests(schriftlichAddieren, {
  niveaus: {
    G: { anzahl: 2, stellen_min: 3, stellen_max: 4 },
    M: { anzahl: 3, stellen_min: 4, stellen_max: 7 },
  },
  unabhaengigeLoesung: (i) => ({
    typ: 'zahl',
    wert: Number(zahlen((i.platzhalter['aufgabe'] as Sprachobjekt).de).reduce((a, b) => a + b, 0n)),
  }),
  grenzverletzungen(i, p) {
    const z = zahlen((i.platzhalter['aufgabe'] as Sprachobjekt).de);
    const f: string[] = [];
    if (z.length !== p.anzahl) f.push(`${z.length} Summanden`);
    for (const n of z) {
      const s = String(n).length;
      if (s < p.stellen_min || s > p.stellen_max) f.push(`${n}: ${s} Stellen`);
    }
    return f;
  },
  mindestensVerschieden: { G: 98, M: 98 },
});

pflichttests(schriftlichSubtrahieren, {
  niveaus: { G: { stellen_min: 3, stellen_max: 4 }, M: { stellen_min: 5, stellen_max: 8 } },
  unabhaengigeLoesung: (i) => ({
    typ: 'zahl',
    wert: Number(BigInt(i.platzhalter['a'] as number) - BigInt(i.platzhalter['b'] as number)),
  }),
  grenzverletzungen(i, p) {
    const a = i.platzhalter['a'] as number;
    const b = i.platzhalter['b'] as number;
    const f: string[] = [];
    if (b >= a) f.push('Subtrahend nicht kleiner');
    for (const n of [a, b]) {
      const s = String(n).length;
      if (s < p.stellen_min || s > p.stellen_max) f.push(`${n}: ${s} Stellen`);
    }
    return f;
  },
  mindestensVerschieden: { G: 98, M: 98 },
});
