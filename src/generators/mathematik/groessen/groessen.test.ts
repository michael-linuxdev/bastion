import { describe } from 'vitest';
import type { Instanz, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  einheitenUmrechnen,
  endzeit,
  kommaschreibweise,
  sachEinkauf,
  sachWeg,
  zeitspanne,
} from './groessen';

const t = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const zahlAus = (s: string) =>
  Number(s.replaceAll(String.fromCharCode(0x202f), '').replace(',', '.'));
// Unabhängig: alles in die kleinste Einheit (Tabelle hier im Test, nicht aus dem Generator).
const IN_KLEINSTER: Record<string, number> = {
  mm: 1,
  cm: 10,
  dm: 100,
  m: 1000,
  km: 1_000_000,
  mg: 1,
  g: 1000,
  kg: 1_000_000,
  t: 1_000_000_000,
  ct: 1,
  '€': 100,
  s: 1,
  min: 60,
  h: 3600,
  d: 86_400,
  'mm²': 1,
  'cm²': 100,
  'dm²': 10_000,
  'm²': 1_000_000,
  a: 100_000_000,
  ha: 10_000_000_000,
  'km²': 1_000_000_000_000,
  'mm³': 1,
  'cm³': 1000,
  'dm³': 1_000_000,
  'm³': 1_000_000_000,
  ml: 1,
  l: 1000,
};
const r6 = (x: number) => Math.round(x * 1e6) / 1e6;
// Uhrzeit „7:45 Uhr“ → Minuten nach Mitternacht
const minuten = (s: string) => {
  const m = /(\d+):(\d+)/.exec(s);
  return Number(m?.[1]) * 60 + Number(m?.[2]);
};

for (const richtung of ['in-kleinere', 'in-groessere'] as const) {
  describe(richtung, () => {
    pflichttests(einheitenUmrechnen, {
      niveaus: {
        G: {
          groessen: ['laenge', 'masse', 'geld', 'zeit'],
          richtung,
          sprung_max: 1,
          dezimal: false,
        },
        M: { groessen: ['laenge', 'masse', 'geld'], richtung, sprung_max: 3, dezimal: true },
      },
      unabhaengigeLoesung(i) {
        // in ganzen Hundertsteln rechnen, damit keine Gleitkomma-Ungenauigkeit entsteht
        const hundertstel = Math.round(zahlAus(t(i, 'wert')) * 100);
        const von = IN_KLEINSTER[t(i, 'von')] ?? NaN;
        const nach = IN_KLEINSTER[t(i, 'nach')] ?? NaN;
        return { typ: 'zahl', wert: (hundertstel * von) / (nach * 100) };
      },
      grenzverletzungen(i) {
        const l = i.loesung;
        return l.typ === 'zahl' && Math.round(l.wert * 1000) / 1000 !== l.wert
          ? ['mehr als 3 Nachkommastellen']
          : [];
      },
      mindestensVerschieden: { G: 85, M: 90 },
    });
  });
}

for (const richtung of ['in-kleinere', 'in-groessere'] as const) {
  describe(`${richtung} (Flächen und Volumen)`, () => {
    pflichttests(einheitenUmrechnen, {
      niveaus: {
        G: {
          groessen: ['flaeche', 'volumen', 'hohlmass'],
          richtung,
          sprung_max: 1,
          dezimal: false,
        },
        M: { groessen: ['flaeche', 'volumen', 'hohlmass'], richtung, sprung_max: 2, dezimal: true },
      },
      unabhaengigeLoesung(i) {
        // in ganzen Hundertsteln rechnen, damit keine Gleitkomma-Ungenauigkeit entsteht
        const hundertstel = Math.round(zahlAus(t(i, 'wert')) * 100);
        const von = IN_KLEINSTER[t(i, 'von')] ?? NaN;
        const nach = IN_KLEINSTER[t(i, 'nach')] ?? NaN;
        return { typ: 'zahl', wert: (hundertstel * von) / (nach * 100) };
      },
      grenzverletzungen(i) {
        const l = i.loesung;
        return l.typ === 'zahl' && Math.round(l.wert * 1000) / 1000 !== l.wert
          ? ['mehr als 3 Nachkommastellen']
          : [];
      },
      mindestensVerschieden: { G: 85, M: 90 },
    });
  });
}

pflichttests(zeitspanne, {
  niveaus: { G: { bis_stunden: 3 }, M: { bis_stunden: 10 } },
  unabhaengigeLoesung: (i) => ({
    typ: 'zahl',
    wert: minuten(t(i, 'ende')) - minuten(t(i, 'beginn')),
  }),
  grenzverletzungen: (i, p) =>
    i.loesung.typ === 'zahl' && (i.loesung.wert <= 0 || i.loesung.wert > p.bis_stunden * 60 + 5)
      ? ['Dauer']
      : [],
  mindestensVerschieden: { G: 95, M: 98 },
});

for (const ueber_mitternacht of [false, true]) {
  describe(ueber_mitternacht ? 'über Mitternacht' : 'tagsüber', () => {
    pflichttests(endzeit, {
      niveaus: {
        G: { bis_stunden: 3, ueber_mitternacht },
        M: { bis_stunden: 9, ueber_mitternacht },
      },
      unabhaengigeLoesung: (i) => ({
        typ: 'zahl',
        wert:
          (minuten(t(i, 'beginn')) +
            (i.platzhalter['stunden'] as number) * 60 +
            (i.platzhalter['minuten'] as number)) %
          1440,
      }),
      grenzverletzungen: () => [],
      mindestensVerschieden: { G: 85, M: 95 }, // gemessen G (über Mitternacht): 89
    });
  });
}

for (const richtung of ['zu-komma', 'zu-kleiner'] as const) {
  describe(richtung, () => {
    pflichttests(kommaschreibweise, {
      niveaus: {
        G: { groessen: ['geld', 'laenge'], richtung },
        M: { groessen: ['geld', 'laenge', 'masse'], richtung },
      },
      unabhaengigeLoesung(i) {
        const gross = i.platzhalter['gross'] as number;
        const klein = i.platzhalter['klein'] as number;
        const f =
          (IN_KLEINSTER[t(i, 'einheit_gross')] ?? NaN) /
          (IN_KLEINSTER[t(i, 'einheit_klein')] ?? NaN);
        return {
          typ: 'zahl',
          wert: richtung === 'zu-komma' ? r6((gross * f + klein) / f) : gross * f + klein,
        };
      },
      grenzverletzungen: () => [],
      mindestensVerschieden: { G: 90, M: 95 },
    });
  });
}

pflichttests(sachEinkauf, {
  niveaus: { G: { menge_max: 4 }, M: { menge_max: 9 } },
  unabhaengigeLoesung(i) {
    const s = t(i, 'geschichte');
    const m = /kauft (\d+) .* zu je ([\d,]+) € und bezahlt mit einem ([\d,]+) €/.exec(s);
    const cent = (x: string) => Math.round(zahlAus(x) * 100);
    return {
      typ: 'zahl',
      wert: (cent(m?.[3] ?? '0') - Number(m?.[1]) * cent(m?.[2] ?? '0')) / 100,
    };
  },
  grenzverletzungen: (i) =>
    i.loesung.typ === 'zahl' && i.loesung.wert <= 0 ? ['kein Rückgeld'] : [],
  mindestensVerschieden: { G: 95, M: 98 },
});

pflichttests(sachWeg, {
  niveaus: { G: { km_max: 10 }, M: { km_max: 50 } },
  unabhaengigeLoesung(i) {
    const m = /ist ([\d,]+) km lang.*Umweg von (\d+) m/.exec(t(i, 'geschichte'));
    return {
      typ: 'zahl',
      wert: r6((Math.round(zahlAus(m?.[1] ?? '0') * 1000) * 2 + Number(m?.[2])) / 1000),
    };
  },
  grenzverletzungen: () => [],
  mindestensVerschieden: { G: 98, M: 98 },
});
