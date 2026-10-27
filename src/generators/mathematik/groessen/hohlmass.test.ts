import type { Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { hohlmassVolumen } from './hohlmass';

const t = (i: { platzhalter: Record<string, unknown> }, n: string) =>
  (i.platzhalter[n] as Sprachobjekt).de;
const zahlAus = (s: string) =>
  Number(s.replaceAll(String.fromCharCode(0x202f), '').replace(',', '.'));
// Unabhängig: alles in cm³ (Tabelle im Test).
const CM3: Record<string, number> = { 'cm³': 1, ml: 1, 'dm³': 1000, l: 1000 };

pflichttests(hohlmassVolumen, {
  niveaus: { G: { paare: 5, dezimal: false }, M: { paare: 8, dezimal: true } },
  unabhaengigeLoesung(i) {
    const tausendstel = Math.round(zahlAus(t(i, 'wert')) * 1000);
    const von = CM3[t(i, 'von')] ?? NaN;
    const nach = CM3[t(i, 'nach')] ?? NaN;
    return { typ: 'zahl', wert: (tausendstel * von) / nach / 1000 };
  },
  grenzverletzungen(i) {
    const l = i.loesung;
    return l.typ === 'zahl' && (Math.round(l.wert * 1000) / 1000 !== l.wert || l.wert <= 0)
      ? ['mehr als 3 Nachkommastellen oder nicht positiv']
      : [];
  },
  mindestensVerschieden: { G: 50, M: 80 },
});
