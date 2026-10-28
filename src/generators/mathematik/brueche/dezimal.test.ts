import { describe } from 'vitest';
import type { Instanz, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { dezimalAddSub, dezimalMalDurch, dezimalRunden, dezimalVergleichen } from './dezimal';

// Unabhängig: Dezimalzahlen als Brüche mit BigInt (Zähler/10^k) – ohne Gleitkomma.
const SCHMAL = String.fromCharCode(0x202f);
function alsMillionstel(text: string): bigint {
  const [ganz, nach = ''] = text.replaceAll(SCHMAL, '').split(',');
  return BigInt(ganz ?? '0') * 1_000_000n + BigInt((nach + '000000').slice(0, 6));
}
const t = (i: Instanz, name: string) => (i.platzhalter[name] as Sprachobjekt).de;
const ausMillionstel = (m: bigint) => Number(m) / 1e6;

pflichttests(dezimalVergleichen, {
  niveaus: { G: { ganz_max: 0 }, M: { ganz_max: 100 } },
  unabhaengigeLoesung(i) {
    const a = alsMillionstel(t(i, 'a'));
    const b = alsMillionstel(t(i, 'b'));
    return { typ: 'auswahl', wert: a < b ? 0 : a === b ? 1 : 2 };
  },
  grenzverletzungen: () => [],
  mindestensVerschieden: { G: 85, M: 95 },
});

pflichttests(dezimalRunden, {
  niveaus: { G: { ganz_max: 20, stellen_max: 1 }, M: { ganz_max: 1000, stellen_max: 2 } },
  unabhaengigeLoesung(i) {
    const m = alsMillionstel(t(i, 'zahl'));
    const stelle = ['Ganze', 'Zehntel', 'Hundertstel'].indexOf(t(i, 'stelle'));
    const einheit = 10n ** BigInt(6 - stelle);
    const ab = (m / einheit) * einheit;
    return { typ: 'zahl', wert: ausMillionstel(m - ab >= einheit / 2n ? ab + einheit : ab) };
  },
  grenzverletzungen: () => [],
  mindestensVerschieden: { G: 90, M: 95 },
});

pflichttests(dezimalAddSub, {
  niveaus: { G: { ganz_max: 20 }, M: { ganz_max: 1000 } },
  unabhaengigeLoesung(i) {
    const a = alsMillionstel(t(i, 'a'));
    const b = alsMillionstel(t(i, 'b'));
    return { typ: 'zahl', wert: ausMillionstel(t(i, 'zeichen') === '+' ? a + b : a - b) };
  },
  grenzverletzungen: (i) => (i.loesung.typ === 'zahl' && i.loesung.wert < 0 ? ['negativ'] : []),
  mindestensVerschieden: { G: 95, M: 98 },
});

for (const mit_zehnerpotenz of [false, true]) {
  describe(mit_zehnerpotenz ? 'Zehnerpotenz' : 'einstellig', () => {
    pflichttests(dezimalMalDurch, {
      niveaus: { G: { mit_zehnerpotenz }, M: { mit_zehnerpotenz } },
      unabhaengigeLoesung(i) {
        const a = alsMillionstel(t(i, 'a'));
        const b = BigInt(i.platzhalter['b'] as number);
        return {
          typ: 'zahl',
          wert: ausMillionstel(t(i, 'zeichen') === '·' ? a * b : a / b),
        };
      },
      grenzverletzungen(i) {
        const a = alsMillionstel(t(i, 'a'));
        const b = BigInt(i.platzhalter['b'] as number);
        return t(i, 'zeichen') === ':' && a % b !== 0n ? ['Division geht nicht auf'] : [];
      },
      mindestensVerschieden: { G: 90, M: 90 },
    });
  });
}
