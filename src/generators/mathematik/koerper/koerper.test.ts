import type { Instanz, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { kanteFehlt, oberflaeche, volumen } from './koerper';

const zahlen = (s: string) =>
  [...s.replaceAll(String.fromCharCode(0x202f), '').matchAll(/\d+/g)].map((m) => Number(m[0]));
const angabe = (i: Instanz) => (i.platzhalter['angabe'] as Sprachobjekt).de;
// Kanten aus der Bildbeschreibung (Würfel: eine Zahl)
const kantenAusBild = (i: Instanz) => {
  const z = zahlen(i.bild?.beschreibung.de ?? '');
  return z.length === 1 ? [z[0] ?? NaN, z[0] ?? NaN, z[0] ?? NaN] : z;
};

// Alle Linien und Beschriftungen müssen im Bild liegen; die Maße im Bild passen zur Angabe.
function bildFehler(i: Instanz): string[] {
  const svg = i.bild?.svg ?? '';
  const fehler: string[] = [];
  for (const m of svg.matchAll(/(?:x1?|x2)="([-\d.]+)"/g))
    if (Number(m[1]) < 0 || Number(m[1]) > 320) fehler.push(`x außerhalb: ${m[1]}`);
  for (const m of svg.matchAll(/(?:y1?|y2)="([-\d.]+)"/g))
    if (Number(m[1]) < 0 || Number(m[1]) > 230) fehler.push(`y außerhalb: ${m[1]}`);
  const imBild = [...svg.matchAll(/>(\d+) (?:cm|dm|m)</g)].map((m) => Number(m[1])).sort();
  const erwartet = [...kantenAusBild(i)].sort();
  if (JSON.stringify(imBild) !== JSON.stringify(erwartet)) fehler.push('Maße im Bild');
  return fehler;
}

for (const wuerfel of [false, true]) {
  pflichttests(volumen, {
    niveaus: { G: { wuerfel, max: 10 }, M: { wuerfel, max: 25 } },
    unabhaengigeLoesung: (i) => ({
      typ: 'zahl',
      wert: kantenAusBild(i).reduce((x, y) => x * y, 1),
    }),
    grenzverletzungen: bildFehler,
    mindestensVerschieden: wuerfel ? { G: 20, M: 50 } : { G: 90, M: 95 },
  });
}

pflichttests(kanteFehlt, {
  niveaus: { M: { max: 15 } },
  unabhaengigeLoesung(i) {
    const [V = NaN, a = NaN, b = NaN] = zahlen(angabe(i));
    return { typ: 'zahl', wert: V / a / b };
  },
  grenzverletzungen: (i) =>
    i.loesung.typ === 'zahl' && Number.isInteger(i.loesung.wert) ? [] : ['Kante'],
  mindestensVerschieden: { M: 90 },
});

// Unabhängig: sechs Flächen einzeln aufzählen und addieren.
const sechsFlaechen = ([a = NaN, b = NaN, c = NaN]: number[]) =>
  [a * b, a * b, a * c, a * c, b * c, b * c].reduce((x, y) => x + y, 0);

for (const [wuerfel, gegeben] of [
  [true, 'kanten'],
  [false, 'kanten'],
  [false, 'flaechen'],
] as const) {
  pflichttests(oberflaeche, {
    niveaus: { G: { wuerfel, gegeben, max: 10 }, M: { wuerfel, gegeben, max: 20 } },
    unabhaengigeLoesung(i) {
      if (gegeben === 'flaechen') {
        const [f1 = NaN, f2 = NaN, f3 = NaN] = zahlen(angabe(i));
        return { typ: 'zahl', wert: 2 * (f1 + f2 + f3) };
      }
      return { typ: 'zahl', wert: sechsFlaechen(kantenAusBild(i)) };
    },
    grenzverletzungen: bildFehler,
    mindestensVerschieden: wuerfel ? { G: 9, M: 19 } : { G: 90, M: 95 },
  });
}
