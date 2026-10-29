import { dezimalDeutsch, runde10 } from '../../../core/learning/format';
import { bruch, ggT, type Bruch } from '../../../core/learning/bruch';
import type { Generator, Loesung } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng } from '../../../core/rng/rng';
import { auswahl, de, mische, verlange, zahl } from '../../hilfen';
import { bruchText } from './begriff';

const alsBruch = (b: Bruch): Loesung => ({ typ: 'bruch', wert: b });

export interface KuerzenParameter {
  readonly nenner_max: number; // Nenner des gekürzten Bruchs, 3 … 12
  readonly faktor_max: number; // 2 … 12
}

/** Zufallswerte einer Kürzen-Aufgabe – gemeinsam für Aufgabe und Zwischenschritte. */
function kuerzenWerte(seed: number, p: KuerzenParameter) {
  verlange(
    p.nenner_max >= 3 && p.nenner_max <= 12 && p.faktor_max >= 2 && p.faktor_max <= 12,
    'Parameter außerhalb',
  );
  const r = rng(seed);
  const n = r.int(2, p.nenner_max);
  let z = r.int(1, n - 1);
  while (ggT(z, n) !== 1) z -= 1;
  // Faktor mit echtem Teiler, damit „nicht vollständig gekürzt“ möglich ist (4, 6, 8, 9, 10, 12 …)
  const k = r.pick([2, 3, 4, 5, 6, 8, 9, 10, 12].filter((f) => f <= p.faktor_max));
  const teilfaktor = [2, 3, 5].find((t) => k % t === 0 && t < k);
  return { n, z, k, teilfaktor };
}

/** „Kürze 18/24 vollständig.“ – Vorlage M.ZO.BR.ERWEITERN.KUERZEN */
export const kuerzen: Generator<KuerzenParameter> = {
  id: 'br.kuerzen',
  version: 1,
  platzhalter: ['bruch'],
  fehlerbildIds: ['nicht-vollstaendig', 'nur-nenner-gekuerzt', 'subtrahiert'],

  // Zwischenschritte (INHALTSFORMAT §17): erst der größte gemeinsame Teiler, dann der gekürzte Bruch
  schritte: [
    { id: 'teiler', fehlerbildIds: ['kleiner-teiler'] },
    { id: 'ergebnis', fehlerbildIds: ['nur-nenner-gekuerzt', 'subtrahiert'] },
  ],

  schritt(seed, p, id) {
    const { n, z, k, teilfaktor } = kuerzenWerte(seed, p);
    if (id === 'teiler') {
      const loesung: Loesung = { typ: 'zahl', wert: k };
      return {
        loesung,
        // ein gemeinsamer Teiler, aber nicht der größte: danach wäre nicht vollständig gekürzt
        fehlerbilder: fehlerbilderAus(loesung, [
          ['kleiner-teiler', teilfaktor ? { typ: 'zahl', wert: teilfaktor } : undefined],
        ]),
      };
    }
    const loesung = alsBruch(bruch(z, n));
    return {
      loesung,
      fehlerbilder: fehlerbilderAus(loesung, [
        ['nur-nenner-gekuerzt', alsBruch(bruch(z * k, n))],
        ['subtrahiert', alsBruch(bruch(z, n * k - (z * k - z)))],
      ]),
    };
  },

  erzeuge(seed, p) {
    const { n, z, k, teilfaktor } = kuerzenWerte(seed, p);
    const gross = bruch(z * k, n * k);
    const richtig = alsBruch(bruch(z, n));
    return {
      platzhalter: { bruch: gross },
      loesung: richtig,
      loesungsweg: [
        de(`Größter gemeinsamer Teiler von ${z * k} und ${n * k}: ${k}`),
        de(`Zähler und Nenner durch ${k} teilen: ${z * k} : ${k} = ${z}, ${n * k} : ${k} = ${n}`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        [
          'nicht-vollstaendig',
          teilfaktor ? alsBruch(bruch((z * k) / teilfaktor, (n * k) / teilfaktor)) : undefined,
        ],
        ['nur-nenner-gekuerzt', alsBruch(bruch(z * k, n))],
        [
          // „Kürzen durch Subtrahieren“: von Zähler und Nenner dieselbe Zahl abgezogen (6/8 → 3/5)
          'subtrahiert',
          alsBruch(bruch(z, n * k - (z * k - z))),
        ],
      ]),
    };
  },
};

export interface VergleichenParameter {
  /** 'gleichnamig' | 'gleicher-zaehler' | 'ungleichnamig' – erlaubte Fälle */
  readonly faelle: readonly string[];
  readonly nenner_max: number; // 3 … 20
}

const OPTIONEN = [{ text: de('<') }, { text: de('=') }, { text: de('>') }];
const zeichen = (a: Bruch, b: Bruch) => {
  const d = a.zaehler * b.nenner - b.zaehler * a.nenner;
  return d < 0 ? 0 : d === 0 ? 1 : 2;
};

/** „Vergleiche: 3/5 ☐ 3/4“ – Vorlage M.ZO.BR.VERGLEICHEN.ZEICHEN */
export const bruecheVergleichen: Generator<VergleichenParameter> = {
  id: 'br.brueche-vergleichen',
  version: 1,
  platzhalter: ['a', 'b'],
  fehlerbildIds: ['groesserer-nenner-groesser', 'nur-zaehler-verglichen'],

  erzeuge(seed, p) {
    verlange(p.faelle.length > 0 && p.nenner_max >= 3 && p.nenner_max <= 20, 'Parameter außerhalb');
    const r = rng(seed);
    const fall = r.pick(p.faelle);
    let a: Bruch;
    let b: Bruch;
    if (fall === 'gleichnamig') {
      const n = r.int(3, p.nenner_max);
      const [x, y] = mische(
        r,
        Array.from({ length: n - 1 }, (_, i) => i + 1),
      ) as [number, number];
      [a, b] = [bruch(x, n), bruch(y ?? x, n)];
    } else if (fall === 'gleicher-zaehler') {
      const [n1, n2] = mische(
        r,
        Array.from({ length: p.nenner_max - 2 }, (_, i) => i + 3),
      ) as [number, number];
      const z = r.int(1, Math.min(n1, n2) - 1);
      [a, b] = [bruch(z, n1), bruch(z, n2)];
    } else {
      const n1 = r.int(3, p.nenner_max);
      let n2 = r.int(3, p.nenner_max);
      if (n2 === n1) n2 = n1 === 3 ? 4 : n1 - 1;
      [a, b] = [bruch(r.int(1, n1 - 1), n1), bruch(r.int(1, n2 - 1), n2)];
    }
    const richtig = zeichen(a, b);
    const nachZaehler = a.zaehler < b.zaehler ? 0 : a.zaehler === b.zaehler ? 1 : 2;
    const nachNenner = a.nenner < b.nenner ? 0 : a.nenner === b.nenner ? 1 : 2;
    return {
      platzhalter: { a, b },
      optionen: OPTIONEN,
      loesung: auswahl(richtig),
      loesungsweg: [
        de(
          a.nenner === b.nenner
            ? 'Gleiche Nenner: Der Bruch mit dem größeren Zähler ist größer.'
            : a.zaehler === b.zaehler
              ? 'Gleiche Zähler: Der Bruch mit dem kleineren Nenner ist größer – die Teile sind größer.'
              : `Auf den gleichen Nenner bringen: ${a.zaehler * b.nenner}/${a.nenner * b.nenner} und ${b.zaehler * a.nenner}/${a.nenner * b.nenner}`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(auswahl(richtig), [
        ['groesserer-nenner-groesser', a.zaehler === b.zaehler ? auswahl(nachNenner) : undefined],
        ['nur-zaehler-verglichen', a.nenner !== b.nenner ? auswahl(nachZaehler) : undefined],
      ]),
    };
  },
};

export interface GroessterParameter {
  readonly nenner_max: number; // 4 … 12
}

/** „Welcher Bruch ist am größten?“ – Vorlage M.ZO.BR.VERGLEICHEN.GROESSTER */
export const groessterBruch: Generator<GroessterParameter> = {
  id: 'br.groesster-bruch',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['groesster-nenner', 'groesster-zaehler'],

  erzeuge(seed, p) {
    verlange(p.nenner_max >= 4 && p.nenner_max <= 12, 'nenner_max: 4 … 12');
    const r = rng(seed);
    const brueche: Bruch[] = [];
    while (brueche.length < 4) {
      const n = r.int(2, p.nenner_max);
      const b = bruch(r.int(1, n - 1), n);
      if (brueche.every((x) => x.zaehler * b.nenner !== b.zaehler * x.nenner)) brueche.push(b);
    }
    const wert = (b: Bruch) => b.zaehler / b.nenner;
    const index = (f: (b: Bruch) => number) =>
      brueche.reduce((best, b, i) => (f(b) > f(brueche[best] as Bruch) ? i : best), 0);
    const eindeutig = (f: (b: Bruch) => number) =>
      brueche.filter((b) => f(b) === Math.max(...brueche.map(f))).length === 1;
    const richtig = auswahl(index(wert));
    return {
      platzhalter: {},
      optionen: brueche.map((b) => ({ text: de(bruchText(b)) })),
      loesung: richtig,
      loesungsweg: [
        de('Bringe die Brüche auf einen gemeinsamen Nenner oder vergleiche mit 1/2.'),
        de(
          `Am größten: ${(brueche[index(wert)] as Bruch).zaehler}/${(brueche[index(wert)] as Bruch).nenner}`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        [
          'groesster-nenner',
          eindeutig((b) => b.nenner) ? auswahl(index((b) => b.nenner)) : undefined,
        ],
        [
          'groesster-zaehler',
          eindeutig((b) => b.zaehler) ? auswahl(index((b) => b.zaehler)) : undefined,
        ],
      ]),
    };
  },
};

/** Gemeine Brüche, die sich als endliche Dezimalzahl schreiben lassen (Nenner aus 2, 4, 5, 8, 10, 20, 25, 50, 100). */
const ENDLICH = [2, 4, 5, 8, 10, 20, 25, 50, 100, 1000];

export interface ZuDezimalParameter {
  readonly nenner: readonly number[];
}

/** „Schreibe 3/4 als Dezimalzahl.“ – Vorlage M.ZO.BR.DEZIMAL.BRUCH-ZU-DEZIMAL */
export const bruchZuDezimal: Generator<ZuDezimalParameter> = {
  id: 'br.bruch-zu-dezimal',
  version: 1,
  platzhalter: ['bruch'],
  fehlerbildIds: ['zaehler-komma-nenner', 'stelle-verschoben'],

  erzeuge(seed, p) {
    verlange(
      p.nenner.length > 0 && p.nenner.every((n) => ENDLICH.includes(n)),
      'nenner nur aus 2, 4, 5, 8, 10, 20, 25, 50, 100, 1000',
    );
    const r = rng(seed);
    const n = r.pick(p.nenner);
    let z = r.int(1, n - 1);
    if (n !== 10 && n !== 100 && n !== 1000) while (ggT(z, n) !== 1) z -= 1;
    const w = runde10(z / n, 6);
    const zehner = [10, 100, 1000].find((t) => t % n === 0) ?? 1000;
    return {
      platzhalter: { bruch: bruch(z, n) },
      loesung: zahl(w),
      loesungsweg: [
        ...(zehner !== n
          ? [de(`Erweitere auf den Nenner ${zehner}: ${z}/${n} = ${(z * zehner) / n}/${zehner}`)]
          : []),
        de(`${(z * zehner) / n}/${zehner} = ${dezimalDeutsch(w)}`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(w), [
        ['zaehler-komma-nenner', zahl(Number(`${z}.${n}`))],
        ['stelle-verschoben', zahl(runde10(w * 10, 6))],
      ]),
    };
  },
};

export interface ZuBruchParameter {
  readonly nachkommastellen_max: number; // 1 … 3
}

/** „Schreibe 0,35 als Bruch und kürze vollständig.“ – Vorlage M.ZO.BR.DEZIMAL.DEZIMAL-ZU-BRUCH */
export const dezimalZuBruch: Generator<ZuBruchParameter> = {
  id: 'br.dezimal-zu-bruch',
  version: 1,
  platzhalter: ['dezimal'],
  fehlerbildIds: ['immer-zehntel', 'nicht-gekuerzt'],

  erzeuge(seed, p) {
    verlange(
      p.nachkommastellen_max >= 1 && p.nachkommastellen_max <= 3,
      'nachkommastellen_max: 1 … 3',
    );
    const r = rng(seed);
    const stellen = r.int(1, p.nachkommastellen_max);
    const nenner = 10 ** stellen;
    let z = r.int(1, nenner - 1);
    if (z % 10 === 0 && stellen > 1) z += 1;
    const g = ggT(z, nenner);
    const richtig = alsBruch(bruch(z / g, nenner / g));
    return {
      platzhalter: { dezimal: { de: dezimalDeutsch(z / nenner) } },
      loesung: richtig,
      loesungsweg: [
        de(
          `${dezimalDeutsch(z / nenner)} = ${z}/${nenner} (${stellen} Nachkommastelle${stellen > 1 ? 'n' : ''} → Nenner ${nenner})`,
        ),
        ...(g > 1 ? [de(`Kürzen mit ${g}: ${z / g}/${nenner / g}`)] : []),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['immer-zehntel', stellen > 1 ? alsBruch(bruch(z, 10)) : undefined],
        ['nicht-gekuerzt', g > 1 ? alsBruch(bruch(z, nenner)) : undefined],
      ]),
    };
  },
};

/** Die Prozentangaben aus dem Lehrplan Kl. 5 (OS LB 2: 0,01; 0,1; 0,2; 0,25; 0,5; 0,75; 1). */
export const PROZENTE = [1, 10, 20, 25, 50, 75, 100];

export interface ProzentParameter {
  readonly richtung: 'dezimal-zu-prozent' | 'prozent-zu-bruch';
  readonly prozente: readonly number[];
}

/** „Gib 0,25 in Prozent an.“ / „Schreibe 75 % als Bruch.“ – Vorlagen M.ZO.BR.PROZENT.… */
export const prozentschreibweise: Generator<ProzentParameter> = {
  id: 'br.prozentschreibweise',
  version: 1,
  platzhalter: ['wert'],
  fehlerbildIds: ['komma-verschoben', 'prozent-als-nenner-zehn'],

  erzeuge(seed, p) {
    verlange(
      p.prozente.length > 0 && p.prozente.every((x) => PROZENTE.includes(x)),
      'prozente aus 1, 10, 20, 25, 50, 75, 100',
    );
    const r = rng(seed);
    const pr = r.pick(p.prozente);
    if (p.richtung === 'dezimal-zu-prozent') {
      return {
        platzhalter: { wert: { de: dezimalDeutsch(pr / 100) } },
        loesung: zahl(pr),
        loesungsweg: [
          de(`Prozent heißt „von Hundert“: ${dezimalDeutsch(pr / 100)} = ${pr}/100 = ${pr} %`),
        ],
        fehlerbilder: fehlerbilderAus(zahl(pr), [
          ['komma-verschoben', zahl(runde10(pr / 10, 6))],
          ['prozent-als-nenner-zehn', undefined],
        ]),
      };
    }
    const g = ggT(pr, 100);
    const richtig = alsBruch(bruch(pr / g, 100 / g));
    return {
      platzhalter: { wert: { de: `${pr} %` } },
      loesung: richtig,
      loesungsweg: [
        de(`${pr} % = ${pr}/100`),
        ...(g > 1 && pr !== 100 ? [de(`Gekürzt: ${pr / g}/${100 / g}`)] : []),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['komma-verschoben', undefined],
        [
          'prozent-als-nenner-zehn',
          pr % 10 === 0 && pr < 100 ? alsBruch(bruch(pr, 10)) : undefined,
        ],
      ]),
    };
  },
};
