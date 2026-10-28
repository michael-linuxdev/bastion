import { describe } from 'vitest';
import type { Bruch } from '../../../core/learning/bruch';
import type { Instanz, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  bruchZuDezimal,
  bruecheVergleichen,
  dezimalZuBruch,
  groessterBruch,
  kuerzen,
  prozentschreibweise,
} from './umwandeln';

const b = (i: Instanz, name: string) => i.platzhalter[name] as Bruch;
// Unabhängig: ggT per Probieren von oben, Vergleich per Kreuzprodukt mit BigInt.
const ggTProbe = (x: number, y: number) => {
  for (let t = Math.min(x, y); t > 1; t--) if (x % t === 0 && y % t === 0) return t;
  return 1;
};
const gekuerzt = (z: number, n: number) => ({
  zaehler: z / ggTProbe(z, n),
  nenner: n / ggTProbe(z, n),
});
const vergleich = (x: Bruch, y: Bruch) => {
  const l = BigInt(x.zaehler) * BigInt(y.nenner);
  const r = BigInt(y.zaehler) * BigInt(x.nenner);
  return l < r ? 0 : l === r ? 1 : 2;
};
const ausText = (t: string) => {
  const m = /frac\{(\d+)\}\{(\d+)\}/.exec(t);
  return { zaehler: Number(m?.[1]), nenner: Number(m?.[2]) };
};

pflichttests(kuerzen, {
  niveaus: { G: { nenner_max: 6, faktor_max: 5 }, M: { nenner_max: 12, faktor_max: 12 } },
  unabhaengigeLoesung: (i) => ({
    typ: 'bruch',
    wert: gekuerzt(b(i, 'bruch').zaehler, b(i, 'bruch').nenner),
  }),
  grenzverletzungen: (i) =>
    ggTProbe(b(i, 'bruch').zaehler, b(i, 'bruch').nenner) === 1 ? ['nicht kürzbar'] : [],
  mindestensVerschieden: { G: 28, M: 70 }, // gemessen: 32 / 79
});

pflichttests(bruecheVergleichen, {
  niveaus: {
    G: { faelle: ['gleichnamig', 'gleicher-zaehler'], nenner_max: 8 },
    M: { faelle: ['gleicher-zaehler', 'ungleichnamig'], nenner_max: 12 },
  },
  unabhaengigeLoesung: (i) => ({ typ: 'auswahl', wert: vergleich(b(i, 'a'), b(i, 'b')) }),
  grenzverletzungen: (i, p) =>
    Math.max(b(i, 'a').nenner, b(i, 'b').nenner) > p.nenner_max ? ['Nenner zu groß'] : [],
  mindestensVerschieden: { G: 60, M: 90 },
});

pflichttests(groessterBruch, {
  niveaus: { G: { nenner_max: 6 }, M: { nenner_max: 12 } },
  unabhaengigeLoesung(i) {
    const br = (i.optionen ?? []).map((o) => ausText((o.text as Sprachobjekt).de));
    let best = 0;
    br.forEach((x, k) => {
      if (vergleich(x, br[best] as Bruch) === 2) best = k;
    });
    return { typ: 'auswahl', wert: best };
  },
  grenzverletzungen: (i) => ((i.optionen ?? []).length !== 4 ? ['nicht vier Optionen'] : []),
  mindestensVerschieden: { G: 90, M: 98 },
});

pflichttests(bruchZuDezimal, {
  niveaus: { G: { nenner: [2, 4, 5, 10, 100] }, M: { nenner: [4, 8, 20, 25, 50, 1000] } },
  unabhaengigeLoesung: (i) => ({
    typ: 'zahl',
    wert: Math.round((b(i, 'bruch').zaehler * 1e6) / b(i, 'bruch').nenner) / 1e6,
  }),
  grenzverletzungen: () => [],
  mindestensVerschieden: { G: 25, M: 40 }, // gemessen: 29 / 47 (wenige Nenner)
});

pflichttests(dezimalZuBruch, {
  niveaus: { G: { nachkommastellen_max: 1 }, M: { nachkommastellen_max: 3 } },
  unabhaengigeLoesung(i) {
    const t = (i.platzhalter['dezimal'] as Sprachobjekt).de;
    const nach = t.split(',')[1] ?? '';
    return { typ: 'bruch', wert: gekuerzt(Number(nach), 10 ** nach.length) };
  },
  grenzverletzungen: (i, p) =>
    ((i.platzhalter['dezimal'] as Sprachobjekt).de.split(',')[1] ?? '').length >
    p.nachkommastellen_max
      ? ['zu viele Stellen']
      : [],
  mindestensVerschieden: { G: 9, M: 65 }, // gemessen M: 72
});

for (const richtung of ['dezimal-zu-prozent', 'prozent-zu-bruch'] as const) {
  describe(richtung, () => {
    pflichttests(prozentschreibweise, {
      niveaus: {
        G: { richtung, prozente: [10, 25, 50, 75, 100] },
        M: { richtung, prozente: [1, 10, 20, 25, 50, 75, 100] },
      },
      unabhaengigeLoesung(i) {
        const t = (i.platzhalter['wert'] as Sprachobjekt).de;
        if (richtung === 'dezimal-zu-prozent')
          return { typ: 'zahl', wert: Math.round(Number(t.replace(',', '.')) * 100) };
        return { typ: 'bruch', wert: gekuerzt(Number(t.replace(' %', '')), 100) };
      },
      grenzverletzungen: () => [],
      mindestensVerschieden: { G: 5, M: 7 },
    });
  });
}
