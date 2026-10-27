import { pflichttests } from '../../pflichttests';
import { stufenzahlenMal } from './stufenzahlen-mal';

const nullen = (n: number) => /0*$/.exec(String(n))?.[0].length ?? 0;

pflichttests(stufenzahlenMal, {
  niveaus: { G: { nullen_max: 3, vorne_max: 9 }, M: { nullen_max: 6, vorne_max: 25 } },
  unabhaengigeLoesung: (i) => ({
    typ: 'zahl',
    wert: Number(BigInt(i.platzhalter['a'] as number) * BigInt(i.platzhalter['b'] as number)),
  }),
  grenzverletzungen(i) {
    const a = i.platzhalter['a'] as number;
    const b = i.platzhalter['b'] as number;
    return nullen(a) < 1 || nullen(b) < 1 ? ['ohne Nullen'] : [];
  },
  // G hat bewusst einen kleinen Zahlenraum (Ziffer · Ziffer, wenige Nullen).
  mindestensVerschieden: { G: 70, M: 90 },
});
