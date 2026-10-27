import type { Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, mische, verlange, zahl } from '../../hilfen';
import { aufKreis, bild, kaestchen, linie, raster, vieleck } from '../../svg';

interface Form {
  readonly name: string;
  readonly achsen: number;
  readonly ecken: (r: Rng) => [number, number][]; // Ecken im Bereich 0 … 200
  /** typische Fehlzählungen: [Fehlerbild-ID, gezählte Achsen] */
  readonly fehler: readonly [string, number][];
}

const regelmaessig =
  (n: number, drehung = 90) =>
  (): [number, number][] =>
    Array.from({ length: n }, (_, i) => aufKreis(100, 105, 85, drehung + (i * 360) / n));

const FORMEN: readonly Form[] = [
  {
    name: 'Quadrat',
    achsen: 4,
    ecken: (r) => {
      const a = r.int(110, 170);
      const o = (200 - a) / 2;
      return [
        [o, o],
        [o + a, o],
        [o + a, o + a],
        [o, o + a],
      ];
    },
    fehler: [['nur-waagerecht-senkrecht', 2]],
  },
  {
    name: 'Rechteck',
    achsen: 2,
    ecken: (r) => {
      const b = r.int(150, 190);
      const h = r.int(70, 120);
      return [
        [(200 - b) / 2, (200 - h) / 2],
        [(200 + b) / 2, (200 - h) / 2],
        [(200 + b) / 2, (200 + h) / 2],
        [(200 - b) / 2, (200 + h) / 2],
      ];
    },
    fehler: [['diagonalen-als-achsen', 4]],
  },
  {
    name: 'gleichseitiges Dreieck',
    achsen: 3,
    ecken: regelmaessig(3),
    fehler: [['nur-waagerecht-senkrecht', 1]],
  },
  {
    name: 'gleichschenkliges Dreieck',
    achsen: 1,
    ecken: (r) => {
      const b = r.int(80, 180);
      return [
        [100 - b / 2, 180],
        [100 + b / 2, 180],
        [100, r.int(10, 50)],
      ];
    },
    fehler: [['diagonalen-als-achsen', 3]],
  },
  {
    name: 'Raute',
    achsen: 2,
    ecken: (r) => {
      const b = r.int(50, 90);
      return [
        [100, 10],
        [100 + b, 105],
        [100, 200],
        [100 - b, 105],
      ];
    },
    fehler: [['diagonalen-als-achsen', 4]],
  },
  {
    name: 'gleichschenkliges Trapez',
    achsen: 1,
    ecken: (r) => {
      const o = r.int(30, 70);
      return [
        [10, 160],
        [190, 160],
        [190 - o, 50],
        [10 + o, 50],
      ];
    },
    fehler: [['diagonalen-als-achsen', 2]],
  },
  {
    name: 'Parallelogramm',
    achsen: 0,
    ecken: (r) => {
      const s = r.int(30, 60);
      return [
        [10, 150],
        [190 - s, 150],
        [190, 60],
        [10 + s, 60],
      ];
    },
    fehler: [
      ['diagonalen-als-achsen', 2],
      ['punktsymmetrie-als-achse', 1],
    ],
  },
  {
    name: 'regelmäßiges Fünfeck',
    achsen: 5,
    ecken: regelmaessig(5),
    fehler: [['nur-waagerecht-senkrecht', 1]],
  },
  {
    name: 'regelmäßiges Sechseck',
    achsen: 6,
    ecken: regelmaessig(6, 0),
    fehler: [['nur-waagerecht-senkrecht', 2]],
  },
  {
    name: 'Drachenviereck',
    achsen: 1,
    ecken: (r) => {
      const b = r.int(50, 80);
      return [
        [100, 10],
        [100 + b, 80],
        [100, 195],
        [100 - b, 80],
      ];
    },
    fehler: [['diagonalen-als-achsen', 2]],
  },
];

export interface AchsenParameter {
  readonly formen: readonly string[];
}

/** „Wie viele Symmetrieachsen hat die Figur?“ – Vorlage M.RF.SY.SYMMETRIE.ACHSEN-ZAEHLEN */
export const achsenZaehlen: Generator<AchsenParameter> = {
  id: 'sy.achsen-zaehlen',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['nur-waagerecht-senkrecht', 'diagonalen-als-achsen', 'punktsymmetrie-als-achse'],

  erzeuge(seed, p) {
    const auswahlFormen = FORMEN.filter((f) => p.formen.includes(f.name));
    verlange(auswahlFormen.length > 0, 'formen: mindestens eine bekannte Form');
    const r = rng(seed);
    const f = r.pick(auswahlFormen);
    const ecken = f.ecken(r);
    return {
      platzhalter: {},
      bild: bild(200, 210, [vieleck(ecken, true)], de(`Ein ${f.name}.`)),
      loesung: zahl(f.achsen),
      loesungsweg: [
        de(
          `Eine Symmetrieachse teilt die Figur so, dass beim Falten beide Hälften genau aufeinanderliegen.`,
        ),
        de(
          `Ein ${f.name} hat ${f.achsen === 0 ? 'keine' : f.achsen} Symmetrieachse${f.achsen === 1 ? '' : 'n'}.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(
        zahl(f.achsen),
        f.fehler.map(([id, n]) => [id, zahl(n)] as const),
      ),
    };
  },
};

type Figur = readonly (readonly [number, number])[]; // Kästchen [spalte, zeile]

const schluessel = (f: Figur) =>
  [...f]
    .map(([s, z]) => `${s},${z}`)
    .sort()
    .join(';');
function normiert(f: Figur): Figur {
  const ms = Math.min(...f.map(([s]) => s));
  const mz = Math.min(...f.map(([, z]) => z));
  return f.map(([s, z]) => [s - ms, z - mz] as const);
}
const spiegelSenkrecht = (f: Figur): Figur => normiert(f.map(([s, z]) => [-s, z] as const));
const spiegelWaagerecht = (f: Figur): Figur => normiert(f.map(([s, z]) => [s, -z] as const));
const spiegelDiagonal = (f: Figur): Figur => normiert(f.map(([s, z]) => [z, s] as const));
const spiegelGegen = (f: Figur): Figur => normiert(f.map(([s, z]) => [-z, -s] as const));
export function istAchsensymmetrisch(f: Figur): boolean {
  const k = schluessel(normiert(f));
  return [spiegelSenkrecht, spiegelWaagerecht, spiegelDiagonal, spiegelGegen].some(
    (m) => schluessel(m(f)) === k,
  );
}

/** Zufällige zusammenhängende Kästchenfigur mit n Kästchen. */
function zufallsfigur(r: Rng, n: number): Figur {
  const f: [number, number][] = [[0, 0]];
  while (f.length < n) {
    const [s, z] = r.pick(f);
    const [ds, dz] = r.pick([
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const);
    if (!f.some(([a, b]) => a === s + ds && b === z + dz)) f.push([s + ds, z + dz]);
  }
  return normiert(f);
}

function figurBild(f: Figur): string[] {
  return [...raster(5, 5, 20, 7, 7), ...f.map(([s, z]) => kaestchen(5, 5, 20, s, z))];
}

export interface SymmetrischeFigurParameter {
  readonly kaestchen: number; // Größe der Figuren (4 … 8)
}

/** „Welche Figur ist achsensymmetrisch?“ – Vorlage M.RF.SY.SYMMETRIE.FIGUR-WAEHLEN */
export const symmetrischeFigur: Generator<SymmetrischeFigurParameter> = {
  id: 'sy.symmetrische-figur',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['fast-symmetrisch'],

  erzeuge(seed, p) {
    verlange(p.kaestchen >= 4 && p.kaestchen <= 8, 'kaestchen: 4 … 8');
    const r = rng(seed);
    // symmetrische Figur: linke Hälfte zufällig, rechts gespiegelt (Achse senkrecht)
    let sym: Figur = [];
    for (let v = 0; v < 50; v++) {
      const halb = zufallsfigur(r, Math.ceil(p.kaestchen / 2));
      const breite = Math.max(...halb.map(([s]) => s)) + 1;
      sym = normiert([...halb, ...halb.map(([s, z]) => [2 * breite - 1 - s, z] as const)]);
      if (Math.max(...sym.map(([s]) => s)) < 7 && Math.max(...sym.map(([, z]) => z)) < 7) break;
    }
    // fast symmetrisch: ein Kästchen der rechten Seite verschoben
    const fast = (() => {
      for (let v = 0; v < 50; v++) {
        const kopie = [...sym];
        const i = r.int(0, kopie.length - 1);
        const [s, z] = kopie[i] as [number, number];
        const neu: [number, number] = [s, z + (z > 0 ? -1 : 1)];
        if (kopie.some(([a, b]) => a === neu[0] && b === neu[1])) continue;
        kopie[i] = neu;
        const kandidat = normiert(kopie);
        if (!istAchsensymmetrisch(kandidat) && Math.max(...kandidat.map(([, zz]) => zz)) < 7)
          return kandidat;
      }
      return undefined;
    })();
    const andere: Figur[] = fast ? [fast] : [];
    for (let v = 0; v < 200 && andere.length < 3; v++) {
      const f = zufallsfigur(r, p.kaestchen);
      if (
        !istAchsensymmetrisch(f) &&
        Math.max(...f.flatMap(([s, z]) => [s, z])) < 7 &&
        andere.every((a) => schluessel(a) !== schluessel(f))
      )
        andere.push(f);
    }
    const figuren = mische(r, [sym, ...andere]);
    const index = (f: Figur | undefined) => (f ? figuren.indexOf(f) : -1);
    return {
      platzhalter: {},
      optionen: figuren.map((f, i) => ({
        bild: bild(150, 150, figurBild(f), de(`Figur ${i + 1} aus ${f.length} Kästchen.`)),
      })),
      loesung: auswahl(index(sym)),
      loesungsweg: [
        de(
          'Falte gedanklich an einer Achse: Bei der symmetrischen Figur liegen beide Hälften genau aufeinander.',
        ),
      ],
      fehlerbilder: fehlerbilderAus(auswahl(index(sym)), [
        ['fast-symmetrisch', fast ? auswahl(index(fast)) : undefined],
      ]),
    };
  },
};

export interface BewegungParameter {
  readonly mit_drehung: boolean;
}

const BEWEGUNGEN = [
  { text: de('Spiegelung') },
  { text: de('Verschiebung') },
  { text: de('Drehung') },
];

/** „Durch welche Bewegung ist das Bild entstanden?“ – Vorlage M.RF.SY.BEWEGUNGEN.ERKENNEN */
export const bewegungErkennen: Generator<BewegungParameter> = {
  id: 'sy.bewegung-erkennen',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['spiegelung-verschiebung-verwechselt', 'drehung-spiegelung-verwechselt'],

  erzeuge(seed, p) {
    const r = rng(seed);
    let f: Figur = zufallsfigur(r, 5);
    // weder achsen- noch punktsymmetrisch, sonst wären die Bewegungen nicht unterscheidbar
    const gedreht = (g: Figur) => normiert(g.map(([s, z]) => [-s, -z] as const));
    for (
      let v = 0;
      v < 100 && (istAchsensymmetrisch(f) || schluessel(gedreht(f)) === schluessel(f));
      v++
    ) {
      f = zufallsfigur(r, 5);
    }
    const art = r.int(0, p.mit_drehung ? 2 : 1);
    const bildFigur: Figur =
      art === 0
        ? spiegelSenkrecht(f)
        : art === 1
          ? f
          : normiert(f.map(([s, z]) => [-s, -z] as const));
    const verschoben = bildFigur.map(([s, z]) => [s + 8, z] as const);
    const teile = [
      ...raster(5, 5, 20, 14, 6),
      ...f.map(([s, z]) => kaestchen(5, 5, 20, s, z)),
      ...verschoben.map(([s, z]) => kaestchen(5, 5, 20, s, z)),
    ];
    if (art === 0) teile.push(linie(5 + 7.5 * 20, 0, 5 + 7.5 * 20, 130, 2.5));
    const namen = [
      'eine Spiegelung an der senkrechten Linie',
      'eine Verschiebung nach rechts',
      'eine Drehung um einen halben Kreis',
    ];
    return {
      platzhalter: {},
      bild: bild(
        300,
        130,
        teile,
        de(
          `Links eine Figur aus 5 Kästchen, rechts ihr Bild. Das Bild entstand durch ${namen[art] ?? ''}.`,
        ),
      ),
      optionen: p.mit_drehung ? BEWEGUNGEN : BEWEGUNGEN.slice(0, 2),
      loesung: auswahl(art),
      loesungsweg: [
        de(
          'Verschiebung: Die Figur sieht genau gleich aus. Spiegelung: Sie ist seitenverkehrt. Drehung: Sie steht auf dem Kopf.',
        ),
      ],
      fehlerbilder: fehlerbilderAus(auswahl(art), [
        ['spiegelung-verschiebung-verwechselt', art < 2 ? auswahl(1 - art) : undefined],
        [
          'drehung-spiegelung-verwechselt',
          p.mit_drehung && art !== 1 ? auswahl(art === 0 ? 2 : 0) : undefined,
        ],
      ]),
    };
  },
};
