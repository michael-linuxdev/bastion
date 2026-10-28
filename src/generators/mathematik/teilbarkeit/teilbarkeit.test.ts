import { describe, expect, it } from 'vitest';
import type { Instanz, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  istPrimzahl,
  istTeiler,
  naechstesVielfaches,
  primfaktorzerlegung,
  teilbarDurch,
  welcheTeilbar,
} from './teilbarkeit';

const n = (i: Instanz, name: string) => i.platzhalter[name] as number;
const SCHMAL = String.fromCharCode(0x202f);
// Unabhängig: Teilbarkeit per BigInt-Rest, Primzahl per Probedivision bis n − 1.
const teilt = (t: number, z: number) => BigInt(z) % BigInt(t) === 0n;
const prim = (z: number) =>
  z >= 2 && Array.from({ length: z - 2 }, (_, k) => k + 2).every((t) => z % t !== 0);
const ja = (wahr: boolean) => ({ typ: 'auswahl' as const, wert: wahr ? 0 : 1 });

pflichttests(istTeiler, {
  niveaus: { G: { zahl_max: 100 }, M: { zahl_max: 1000 } },
  unabhaengigeLoesung: (i) => ja(teilt(n(i, 'a'), n(i, 'b'))),
  grenzverletzungen: (i, p) =>
    n(i, 'b') > p.zahl_max + 12 || n(i, 'b') < 2 ? [`b = ${n(i, 'b')}`] : [],
  mindestensVerschieden: { G: 70, M: 75 }, // gemessen M: 80 (Fall „umgekehrt“ hat wenig Spielraum)
});

pflichttests(naechstesVielfaches, {
  niveaus: { G: { zahl_max: 100 }, M: { zahl_max: 1000 } },
  unabhaengigeLoesung(i) {
    let k = n(i, 'grenze') + 1;
    while (!teilt(n(i, 'a'), k)) k++;
    return { typ: 'zahl', wert: k };
  },
  grenzverletzungen: (i, p) => (n(i, 'grenze') > p.zahl_max ? ['Grenze zu groß'] : []),
  mindestensVerschieden: { G: 85, M: 95 },
});

pflichttests(teilbarDurch, {
  niveaus: { G: { teiler: [2, 3, 5, 10], stellen: 3 }, M: { teiler: [3, 4, 6], stellen: 6 } },
  unabhaengigeLoesung: (i) => ja(teilt(n(i, 'teiler'), n(i, 'zahl'))),
  grenzverletzungen: (i, p) => (String(n(i, 'zahl')).length !== p.stellen ? ['Stellenzahl'] : []),
  mindestensVerschieden: { G: 95, M: 98 },
});

pflichttests(welcheTeilbar, {
  niveaus: { G: { teiler: [3, 9], stellen: 3 }, M: { teiler: [3, 4, 6, 9], stellen: 5 } },
  unabhaengigeLoesung(i) {
    const zahlen = (i.optionen ?? []).map((o) =>
      Number((o.text as Sprachobjekt).de.replaceAll(SCHMAL, '')),
    );
    return { typ: 'auswahl', wert: zahlen.findIndex((z) => teilt(n(i, 'teiler'), z)) };
  },
  grenzverletzungen(i, p) {
    const zahlen = (i.optionen ?? []).map((o) =>
      Number((o.text as Sprachobjekt).de.replaceAll(SCHMAL, '')),
    );
    const f: string[] = [];
    if (zahlen.length !== 4) f.push('nicht vier Optionen');
    if (zahlen.filter((z) => teilt(n(i, 'teiler'), z)).length !== 1)
      f.push('nicht genau eine richtige');
    if (zahlen.some((z) => String(z).length !== p.stellen)) f.push('Stellenzahl');
    return f;
  },
  mindestensVerschieden: { G: 98, M: 98 },
});

pflichttests(istPrimzahl, {
  niveaus: { G: { zahl_max: 50 }, M: { zahl_max: 200 } },
  unabhaengigeLoesung: (i) => ja(prim(n(i, 'zahl'))),
  grenzverletzungen: (i, p) => (n(i, 'zahl') > p.zahl_max ? ['zu groß'] : []),
  mindestensVerschieden: { G: 35, M: 60 },
});

pflichttests(primfaktorzerlegung, {
  niveaus: { G: { zahl_max: 60, faktoren_min: 2 }, M: { zahl_max: 500, faktoren_min: 3 } },
  unabhaengigeLoesung(i) {
    const f: number[] = [];
    let rest = n(i, 'zahl');
    for (let t = 2; rest > 1; t++)
      while (rest % t === 0 && prim(t)) {
        f.push(t);
        rest /= t;
      }
    return { typ: 'reihenfolge', wert: f };
  },
  grenzverletzungen(i, p) {
    const l = i.loesung;
    return l.typ === 'reihenfolge' && l.wert.length < p.faktoren_min ? ['zu wenige Faktoren'] : [];
  },
  mindestensVerschieden: { G: 28, M: 80 }, // gemessen G: 32 (wenige Zahlen bis 60)
});

describe('tb.ist-primzahl – Einzelfälle', () => {
  it('fragt regelmäßig nach ungeraden zusammengesetzten Zahlen', () => {
    let gefunden = 0;
    for (let s = 0; s < 200; s++) {
      if (
        istPrimzahl
          .erzeuge(s, { zahl_max: 100 })
          .fehlerbilder.some((f) => f.id === 'ungerade-fuer-prim-gehalten')
      )
        gefunden++;
    }
    expect(gefunden).toBeGreaterThan(40);
  });
});
