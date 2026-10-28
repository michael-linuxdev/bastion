import type { Instanz, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { dreieckFlaeche, dreieckRueckwaerts, viereckFlaeche, zerlegt } from './vielecke';

const B = (i: Instanz) => i.bild?.beschreibung.de ?? '';
const masse = (t: string) =>
  [...t.matchAll(/(\w+) = (\d+) cm/g)].reduce<Record<string, number>>(
    (m, x) => ({ ...m, [x[1] ?? '']: Number(x[2]) }),
    {},
  );

pflichttests(dreieckFlaeche, {
  niveaus: { G: { max: 12, stumpf: false }, M: { max: 20, stumpf: true } },
  unabhaengigeLoesung(i) {
    const m = masse(B(i));
    return { typ: 'zahl', wert: ((m['g'] ?? 0) * (m['h'] ?? 0)) / 2 };
  },
  grenzverletzungen(i, p) {
    const m = masse(B(i));
    return (m['g'] ?? 0) <= p.max && (m['h'] ?? 0) <= p.max && m['g'] === i.platzhalter['g']
      ? []
      : ['Maße außerhalb'];
  },
  mindestensVerschieden: { G: 50, M: 70 },
});

pflichttests(dreieckRueckwaerts, {
  niveaus: { G: { max: 12 }, M: { max: 30 } },
  unabhaengigeLoesung(i) {
    const t = (i.platzhalter['angabe'] as Sprachobjekt).de;
    const a = Number(/Flächeninhalt (\d+) cm²/.exec(t.replace(/(\d) (\d)/g, '$1$2'))?.[1]);
    const gegeben = Number(/= (\d+) cm\./.exec(t)?.[1]);
    return { typ: 'zahl', wert: (2 * a) / gegeben };
  },
  grenzverletzungen: (i) =>
    i.loesung.typ === 'zahl' && Number.isInteger(i.loesung.wert) ? [] : ['nicht ganz'],
  mindestensVerschieden: { G: 40, M: 70 },
});

pflichttests(viereckFlaeche, {
  niveaus: {
    G: { arten: ['parallelogramm', 'trapez'], max: 12 },
    M: { arten: ['parallelogramm', 'trapez', 'drachen'], max: 20 },
  },
  unabhaengigeLoesung(i) {
    const d = B(i);
    const m = masse(d);
    if (d.startsWith('Ein Parallelogramm'))
      return { typ: 'zahl', wert: (m['g'] ?? 0) * (m['h'] ?? 0) };
    if (d.startsWith('Ein Trapez'))
      return { typ: 'zahl', wert: (((m['a'] ?? 0) + (m['c'] ?? 0)) * (m['h'] ?? 0)) / 2 };
    return { typ: 'zahl', wert: ((m['e'] ?? 0) * (m['f'] ?? 0)) / 2 };
  },
  grenzverletzungen: (i) =>
    i.loesung.typ === 'zahl' && Number.isInteger(i.loesung.wert) && i.loesung.wert > 0
      ? []
      : ['Fläche nicht ganz'],
  mindestensVerschieden: { G: 60, M: 70 },
});

pflichttests(zerlegt, {
  niveaus: { G: { max: 10 }, M: { max: 20 } },
  unabhaengigeLoesung(i) {
    const z = [...B(i).matchAll(/(\d+) cm/g)].map((m) => Number(m[1]));
    const [b, h1, h2] = [z[0] ?? 0, z[1] ?? 0, z[2] ?? 0];
    return { typ: 'zahl', wert: b * h1 + (b * h2) / 2 };
  },
  grenzverletzungen: (i) =>
    i.loesung.typ === 'zahl' && Number.isInteger(i.loesung.wert) ? [] : ['nicht ganz'],
  mindestensVerschieden: { G: 60, M: 80 },
});
