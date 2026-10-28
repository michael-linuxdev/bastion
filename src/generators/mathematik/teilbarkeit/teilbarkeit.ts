import { zahlDeutsch } from '../../../core/learning/format';
import type { Generator, Loesung } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng } from '../../../core/rng/rng';
import { auswahl, de, mische, verlange, zahl } from '../../hilfen';

/** Ja/Nein-Optionen: 0 = Ja, 1 = Nein. */
export const JA_NEIN = [{ text: de('Ja') }, { text: de('Nein') }];
const jaNein = (wahr: boolean) => auswahl(wahr ? 0 : 1);

export function primfaktoren(n: number): number[] {
  const f: number[] = [];
  let rest = n;
  for (let t = 2; t * t <= rest; t++) {
    while (rest % t === 0) {
      f.push(t);
      rest /= t;
    }
  }
  if (rest > 1) f.push(rest);
  return f;
}
export const istPrim = (n: number) => n >= 2 && primfaktoren(n).length === 1;

export interface IstTeilerParameter {
  readonly zahl_max: number; // 20 … 1000
}

/** „Ist 7 ein Teiler von 91?“ – Vorlage M.ZO.TB.TEILER.IST-TEILER */
export const istTeiler: Generator<IstTeilerParameter> = {
  id: 'tb.ist-teiler',
  version: 1,
  platzhalter: ['a', 'b'],
  fehlerbildIds: ['teiler-vielfaches-verwechselt', 'gerade-ungerade-geraten'],

  erzeuge(seed, p) {
    verlange(p.zahl_max >= 20 && p.zahl_max <= 1000, 'zahl_max: 20 … 1000');
    const r = rng(seed);
    const a = r.int(2, 12);
    const fall = r.int(0, 2);
    let b: number;
    if (fall === 0)
      b = a * r.int(2, Math.floor(p.zahl_max / a)); // ist Teiler
    else if (fall === 1)
      b = a * r.int(2, Math.floor(p.zahl_max / a)) + r.int(1, a - 1); // nicht
    else b = Math.max(2, Math.floor(a / r.int(2, 3))); // umgekehrt: b ist Teiler von a (b < a)
    if (b === a) b += 1;
    const wahr = b % a === 0;
    return {
      platzhalter: { a, b },
      optionen: JA_NEIN,
      loesung: jaNein(wahr),
      loesungsweg: [
        de(`${zahlDeutsch(b)} : ${a} = ${Math.floor(b / a)} Rest ${b % a}`),
        de(
          wahr
            ? `Kein Rest – ${a} ist ein Teiler von ${zahlDeutsch(b)}.`
            : `Es bleibt ein Rest – ${a} ist kein Teiler von ${zahlDeutsch(b)}.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(jaNein(wahr), [
        ['teiler-vielfaches-verwechselt', b < a && a % b === 0 ? jaNein(true) : undefined],
        ['gerade-ungerade-geraten', a % 2 === 0 && b % 2 === 0 && !wahr ? jaNein(true) : undefined],
      ]),
    };
  },
};

export interface VielfachesParameter {
  readonly zahl_max: number; // 20 … 1000
}

/** „Gib das kleinste Vielfache von 7 an, das größer als 60 ist.“ – Vorlage M.ZO.TB.TEILER.VIELFACHES */
export const naechstesVielfaches: Generator<VielfachesParameter> = {
  id: 'tb.naechstes-vielfaches',
  version: 1,
  platzhalter: ['a', 'grenze'],
  fehlerbildIds: ['nicht-groesser'],

  erzeuge(seed, p) {
    verlange(p.zahl_max >= 20 && p.zahl_max <= 1000, 'zahl_max: 20 … 1000');
    const r = rng(seed);
    const a = r.int(3, 12);
    const grenze = r.int(a + 1, p.zahl_max);
    const richtig = (Math.floor(grenze / a) + 1) * a;
    const darunter = Math.floor(grenze / a) * a;
    return {
      platzhalter: { a, grenze },
      loesung: zahl(richtig),
      loesungsweg: [
        de(`Vielfache von ${a} in der Nähe: … ${zahlDeutsch(darunter)}, ${zahlDeutsch(richtig)} …`),
        de(`Das kleinste, das größer als ${zahlDeutsch(grenze)} ist: ${zahlDeutsch(richtig)}`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(richtig), [['nicht-groesser', zahl(darunter)]]),
    };
  },
};

export interface TeilbarParameter {
  readonly teiler: readonly number[]; // Auswahl aus 2, 3, 4, 5, 6, 10
  readonly stellen: number; // 3 … 7
}

/** „Ist 4 716 durch 3 teilbar?“ – Vorlage M.ZO.TB.REGELN.TEILBAR */
export const teilbarDurch: Generator<TeilbarParameter> = {
  id: 'tb.teilbar-durch',
  version: 1,
  platzhalter: ['zahl', 'teiler'],
  fehlerbildIds: ['letzte-ziffer-statt-quersumme', 'bei-4-nur-letzte-ziffer'],

  erzeuge(seed, p) {
    verlange(
      p.teiler.length > 0 && p.teiler.every((t) => [2, 3, 4, 5, 6, 10].includes(t)),
      'teiler aus 2, 3, 4, 5, 6, 10',
    );
    verlange(p.stellen >= 3 && p.stellen <= 7, 'stellen: 3 … 7');
    const r = rng(seed);
    const t = r.pick(p.teiler);
    // Abstand zu den Grenzen, damit die Anpassungen unten die Stellenzahl nicht ändern
    let n = r.int(10 ** (p.stellen - 1) + 4, 10 ** p.stellen - 5);
    // Fallen bevorzugen: bei 3/6 gerade Endziffer ohne passende Quersumme, bei 4 gerade Endziffer
    if (r.int(0, 1) === 0) n = n - (n % 2) + (t === 4 ? 2 * r.int(0, 1) : 0);
    const wahr = n % t === 0;
    const quersumme = String(n)
      .split('')
      .reduce((s, z) => s + Number(z), 0);
    const zweiStellen = n % 100;
    const regel: Record<number, string> = {
      2: `Die letzte Ziffer ${n % 10} ist ${n % 2 === 0 ? '' : 'nicht '}gerade.`,
      3: `Quersumme: ${quersumme}. ${quersumme} ist ${quersumme % 3 === 0 ? '' : 'nicht '}durch 3 teilbar.`,
      4: `Die letzten beiden Ziffern bilden ${zweiStellen}. ${zweiStellen} ist ${zweiStellen % 4 === 0 ? '' : 'nicht '}durch 4 teilbar.`,
      5: `Die letzte Ziffer ist ${n % 10}. Durch 5 teilbar sind Zahlen mit 0 oder 5 am Ende.`,
      6: `Durch 6 teilbar heißt: durch 2 und durch 3. Gerade: ${n % 2 === 0 ? 'ja' : 'nein'}, Quersumme ${quersumme}: ${quersumme % 3 === 0 ? 'ja' : 'nein'}.`,
      10: `Die letzte Ziffer ist ${n % 10}. Durch 10 teilbar sind Zahlen mit 0 am Ende.`,
    };
    return {
      platzhalter: { zahl: n, teiler: t },
      optionen: JA_NEIN,
      loesung: jaNein(wahr),
      loesungsweg: [
        de(regel[t] ?? ''),
        de(
          wahr
            ? `${zahlDeutsch(n)} ist durch ${t} teilbar.`
            : `${zahlDeutsch(n)} ist nicht durch ${t} teilbar.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(jaNein(wahr), [
        [
          'letzte-ziffer-statt-quersumme',
          t === 3 || t === 6 ? jaNein((n % 10) % t === 0 && n % 10 !== 0) : undefined,
        ],
        ['bei-4-nur-letzte-ziffer', t === 4 ? jaNein(n % 2 === 0) : undefined],
      ]),
    };
  },
};

export interface WelcheTeilbarParameter {
  readonly teiler: readonly number[];
  readonly stellen: number;
}

/** „Welche Zahl ist durch 4 teilbar?“ (vier Zahlen, genau eine richtig) – Vorlage M.ZO.TB.REGELN.WELCHE */
export const welcheTeilbar: Generator<WelcheTeilbarParameter> = {
  id: 'tb.welche-teilbar',
  version: 1,
  platzhalter: ['teiler'],
  fehlerbildIds: ['nur-letzte-ziffer-geprueft'],

  erzeuge(seed, p) {
    verlange(
      p.teiler.length > 0 && p.teiler.every((t) => [3, 4, 6, 9].includes(t)),
      'teiler aus 3, 4, 6, 9',
    );
    verlange(p.stellen >= 3 && p.stellen <= 7, 'stellen: 3 … 7');
    const r = rng(seed);
    const t = r.pick(p.teiler);
    const unten = 10 ** (p.stellen - 1);
    const oben = 10 ** p.stellen - 1;
    const richtig = t * r.int(Math.ceil(unten / t), Math.floor(oben / t));
    const falsche = new Set<number>();
    // Falle: Endziffer wie eine teilbare Zahl, aber nicht teilbar
    let falle: number | undefined;
    for (let v = 0; v < 50 && falle === undefined; v++) {
      const k = r.int(unten, oben);
      if (k % t !== 0 && (t === 4 ? k % 2 === 0 : (k % 10) % t === 0 && k % 10 !== 0)) falle = k;
    }
    if (falle !== undefined) falsche.add(falle);
    while (falsche.size < 3) {
      const k = r.int(unten, oben);
      if (k % t !== 0 && k !== richtig) falsche.add(k);
    }
    const zahlen = mische(r, [richtig, ...falsche]);
    const index = (n: number) => zahlen.indexOf(n);
    const l: Loesung = auswahl(index(richtig));
    return {
      platzhalter: { teiler: t },
      optionen: zahlen.map((n) => ({ text: de(zahlDeutsch(n)) })),
      loesung: l,
      loesungsweg: [
        de(`${zahlDeutsch(richtig)} : ${t} = ${zahlDeutsch(richtig / t)} – ohne Rest.`),
      ],
      fehlerbilder: fehlerbilderAus(l, [
        ['nur-letzte-ziffer-geprueft', falle !== undefined ? auswahl(index(falle)) : undefined],
      ]),
    };
  },
};

export interface IstPrimParameter {
  readonly zahl_max: number; // 30 … 200
}

/** „Ist 91 eine Primzahl?“ – Vorlage M.ZO.TB.PRIM.IST-PRIM */
export const istPrimzahl: Generator<IstPrimParameter> = {
  id: 'tb.ist-primzahl',
  version: 1,
  platzhalter: ['zahl'],
  fehlerbildIds: ['ungerade-fuer-prim-gehalten', 'eins-fuer-prim-gehalten', 'zwei-nicht-erkannt'],

  erzeuge(seed, p) {
    verlange(p.zahl_max >= 30 && p.zahl_max <= 200, 'zahl_max: 30 … 200');
    const r = rng(seed);
    const fall = r.int(0, 9);
    let n: number;
    if (fall === 0) n = r.pick([1, 2]);
    else if (fall <= 4) {
      // ungerade, aber zusammengesetzt (z. B. 51 = 3 · 17, 91 = 7 · 13)
      const kandidaten: number[] = [];
      for (let k = 9; k <= p.zahl_max; k += 2) if (!istPrim(k)) kandidaten.push(k);
      n = r.pick(kandidaten);
    } else n = r.int(3, p.zahl_max);
    const wahr = istPrim(n);
    const f = primfaktoren(n);
    return {
      platzhalter: { zahl: n },
      optionen: JA_NEIN,
      loesung: jaNein(wahr),
      loesungsweg: [
        de('Eine Primzahl hat genau zwei Teiler: 1 und sich selbst.'),
        de(
          n === 1
            ? '1 hat nur einen Teiler – keine Primzahl.'
            : wahr
              ? `${n} hat nur die Teiler 1 und ${n}.`
              : `${n} = ${f.join(' · ')} – also keine Primzahl.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(jaNein(wahr), [
        ['ungerade-fuer-prim-gehalten', !wahr && n % 2 === 1 && n > 1 ? jaNein(true) : undefined],
        ['eins-fuer-prim-gehalten', n === 1 ? jaNein(true) : undefined],
        ['zwei-nicht-erkannt', n === 2 ? jaNein(false) : undefined],
      ]),
    };
  },
};

export interface PrimfaktorenParameter {
  readonly zahl_max: number; // 20 … 500
  readonly faktoren_min: number; // 2 … 4
}

/** „Zerlege 60 in Primfaktoren.“ – Vorlage M.ZO.TB.PRIM.ZERLEGEN */
export const primfaktorzerlegung: Generator<PrimfaktorenParameter> = {
  id: 'tb.primfaktorzerlegung',
  version: 1,
  platzhalter: ['zahl'],
  fehlerbildIds: ['nicht-vollstaendig-zerlegt'],

  erzeuge(seed, p) {
    verlange(p.zahl_max >= 20 && p.zahl_max <= 500, 'zahl_max: 20 … 500');
    verlange(p.faktoren_min >= 2 && p.faktoren_min <= 4, 'faktoren_min: 2 … 4');
    const r = rng(seed);
    let n = 0;
    for (let v = 0; v < 50; v++) {
      n = r.int(12, p.zahl_max);
      if (primfaktoren(n).length >= p.faktoren_min) break;
    }
    if (primfaktoren(n).length < p.faktoren_min) n = 2 ** p.faktoren_min * 3;
    const f = primfaktoren(n);
    const richtig: Loesung = { typ: 'reihenfolge', wert: f };
    // Fehler: zwei Faktoren nicht weiter zerlegt (z. B. 60 = 4 · 15)
    const halb = f.slice(0, Math.floor(f.length / 2)).reduce((a, b) => a * b, 1);
    const unvollstaendig = [halb, n / halb].sort((a, b) => a - b);
    return {
      platzhalter: { zahl: n },
      loesung: richtig,
      loesungsweg: [
        de('Teile immer wieder durch die kleinste Primzahl, die passt: 2, 3, 5, 7 …'),
        de(`${n} = ${f.join(' · ')}`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['nicht-vollstaendig-zerlegt', { typ: 'reihenfolge', wert: unvollstaendig }],
      ]),
    };
  },
};
