import { describe, expect, it } from 'vitest';
import type { Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { gilt, rechne } from '../../testhilfen';
import { geschicktRechnen, verteilungsgesetz } from './geschickt-rechnen';
import { gleichungUmkehr, ungleichungGroesste } from './gleichungen';
import { quadratzahl, zehnerpotenz } from './potenzen';
import { termBerechnen } from './terme';

const text = (i: { platzhalter: Record<string, unknown> }, name: string) =>
  (i.platzhalter[name] as Sprachobjekt).de;

describe('Testhilfe rechne', () => {
  it('rechnet Punkt vor Strich und Klammern', () => {
    expect(rechne('18 + 6 · 7')).toBe(60);
    expect(rechne('(18 + 6) · 7 − 5')).toBe(163);
    expect(rechne('3 482 + 917')).toBe(4399);
    expect(gilt('x + 540 = 684', 'x', 144)).toBe(true);
    expect(gilt('y + 10 < 25', 'y', 15)).toBe(false);
  });
});

for (const wurzel of [false, true]) {
  describe(wurzel ? 'Wurzel' : 'Quadrat', () => {
    pflichttests(quadratzahl, {
      niveaus: { G: { basis_max: 10, wurzel }, M: { basis_max: 20, wurzel } },
      unabhaengigeLoesung(i) {
        const n = i.platzhalter['basis'] as number;
        return { typ: 'zahl', wert: wurzel ? Math.round(Math.sqrt(n ** 2)) : n ** 2 };
      },
      grenzverletzungen: (i, p) =>
        (i.platzhalter['basis'] as number) > p.basis_max ? ['Basis zu groß'] : [],
      // Kleiner Zahlenraum: nur 9 bzw. 19 mögliche Aufgaben (gemessen: 9 bzw. 18).
      mindestensVerschieden: { G: 9, M: 17 },
    });
  });
}

for (const mit_faktor of [false, true]) {
  describe(mit_faktor ? 'mit Faktor' : 'ohne Faktor', () => {
    pflichttests(zehnerpotenz, {
      niveaus: { G: { exponent_max: 6, mit_faktor }, M: { exponent_max: 12, mit_faktor } },
      unabhaengigeLoesung: (i) => ({
        typ: 'zahl',
        wert: Number(
          `${i.platzhalter['faktor'] as number}${'0'.repeat(i.platzhalter['exponent'] as number)}`,
        ),
      }),
      grenzverletzungen: (i, p) =>
        (i.platzhalter['exponent'] as number) > p.exponent_max ? ['Exponent'] : [],
      // Ohne Faktor gibt es nur so viele Aufgaben wie Exponenten (gemessen: 86/94 bzw. 5/11).
      mindestensVerschieden: mit_faktor ? { G: 80, M: 88 } : { G: 5, M: 11 },
    });
  });
}

pflichttests(geschicktRechnen, {
  niveaus: { G: { stufe: 10 }, M: { stufe: 100 } },
  unabhaengigeLoesung: (i) => ({ typ: 'zahl', wert: rechne(text(i, 'aufgabe')) }),
  grenzverletzungen: () => [],
  mindestensVerschieden: { G: 70, M: 90 }, // gemessen: 84 / 98
});

pflichttests(verteilungsgesetz, {
  niveaus: { G: { faktor_max: 9, stufe: 10 }, M: { faktor_max: 20, stufe: 100 } },
  unabhaengigeLoesung: (i) => ({
    typ: 'zahl',
    wert: (i.platzhalter['a'] as number) * (i.platzhalter['b'] as number),
  }),
  grenzverletzungen: () => [],
  mindestensVerschieden: { G: 30, M: 50 }, // gemessen: 36 / 60 (kleiner Zahlenraum)
});

for (const klammern of [false, true]) {
  describe(klammern ? 'mit Klammern' : 'Punkt vor Strich', () => {
    pflichttests(termBerechnen, {
      niveaus: { G: { zahl_max: 20, klammern }, M: { zahl_max: 99, klammern } },
      unabhaengigeLoesung: (i) => ({ typ: 'zahl', wert: rechne(text(i, 'term')) }),
      grenzverletzungen: (i) => (rechne(text(i, 'term')) < 0 ? ['negatives Ergebnis'] : []),
      mindestensVerschieden: { G: 95, M: 98 },
    });
  });
}

pflichttests(gleichungUmkehr, {
  niveaus: { G: { zahl_max: 100, rechenarten: 2 }, M: { zahl_max: 1000, rechenarten: 4 } },
  unabhaengigeLoesung(i) {
    // Durchprobieren: die einzige natürliche Zahl, die die Gleichung erfüllt.
    const g = text(i, 'gleichung');
    for (let x = 0; x <= 13_000; x++) if (gilt(g, 'x', x)) return { typ: 'zahl', wert: x };
    return { typ: 'zahl', wert: -1 };
  },
  grenzverletzungen: () => [],
  mindestensVerschieden: { G: 95, M: 95 },
  laeufe: 300,
});

pflichttests(ungleichungGroesste, {
  niveaus: { G: { zahl_max: 30 }, M: { zahl_max: 1000 } },
  unabhaengigeLoesung(i) {
    const g = text(i, 'ungleichung');
    let groesste = -1;
    for (let y = 0; y <= 1000; y++) if (gilt(g, 'y', y)) groesste = y;
    return { typ: 'zahl', wert: groesste };
  },
  grenzverletzungen: () => [],
  mindestensVerschieden: { G: 65, M: 95 }, // gemessen: 76 / 100
  laeufe: 300,
});
