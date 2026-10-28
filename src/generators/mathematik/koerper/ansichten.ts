// Zweitafelbild und Ansichten – Klasse 7 (LEHRPLAN §8c, M.RF.KP.ZWEITAFEL).
// Jeder Körper ist einmal über Ecken und Flächen beschrieben. Daraus entstehen
// das Schrägbild (Kavalierperspektive, verdeckte Kanten gestrichelt) und jede
// Ansicht als senkrechte Projektion – so passen Bild und Ansichten immer zusammen.
import type { Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng } from '../../../core/rng/rng';
import { auswahl, de, mische } from '../../hilfen';
import { bild, linie } from '../../svg';

type V3 = readonly [number, number, number]; // x nach rechts, y nach oben, z nach hinten
type V2 = readonly [number, number];

interface Koerper {
  readonly name: string;
  readonly ecken: readonly V3[];
  readonly flaechen: readonly (readonly number[])[];
  /** nur auf Niveau M */
  readonly erweitert: boolean;
}

function prisma(
  name: string,
  grund: readonly V2[],
  hoehe: number,
  stehend: boolean,
  erweitert: boolean,
): Koerper {
  // stehend: Grundfläche in der x-z-Ebene, Höhe nach oben; sonst Grundfläche vorne (x-y), Tiefe nach hinten
  const n = grund.length;
  const ecken: V3[] = [
    ...grund.map(([u, v]): V3 => (stehend ? [u, 0, v] : [u, v, 0])),
    ...grund.map(([u, v]): V3 => (stehend ? [u, hoehe, v] : [u, v, hoehe])),
  ];
  const flaechen = [
    grund.map((_, i) => i),
    grund.map((_, i) => n + i),
    ...grund.map((_, i) => [i, (i + 1) % n, n + ((i + 1) % n), n + i]),
  ];
  return { name, ecken, flaechen, erweitert };
}

function pyramide(
  name: string,
  grund: readonly V2[],
  spitze: V3,
  oben: readonly V2[] | undefined,
  hoehe: number,
  erweitert: boolean,
): Koerper {
  const n = grund.length;
  const unten = grund.map(([x, z]): V3 => [x, 0, z]);
  if (!oben) {
    return {
      name,
      ecken: [...unten, spitze],
      flaechen: [grund.map((_, i) => i), ...grund.map((_, i) => [i, (i + 1) % n, n])],
      erweitert,
    };
  }
  const deckel = oben.map(([x, z]): V3 => [x, hoehe, z]);
  return {
    name,
    ecken: [...unten, ...deckel],
    flaechen: [
      grund.map((_, i) => i),
      oben.map((_, i) => n + i),
      ...grund.map((_, i) => [i, (i + 1) % n, n + ((i + 1) % n), n + i]),
    ],
    erweitert,
  };
}

const sechseck: V2[] = Array.from({ length: 6 }, (_, i) => [
  1.6 + 1.6 * Math.cos((i * Math.PI) / 3),
  1.6 + 1.6 * Math.sin((i * Math.PI) / 3),
]);

export const KOERPER: readonly Koerper[] = [
  prisma(
    'Quader',
    [
      [0, 0],
      [4, 0],
      [4, 2],
      [0, 2],
    ],
    2.5,
    true,
    false,
  ),
  prisma(
    'Würfel',
    [
      [0, 0],
      [3, 0],
      [3, 3],
      [0, 3],
    ],
    3,
    true,
    false,
  ),
  prisma(
    'liegendes Dreiecksprisma',
    [
      [0, 0],
      [3.4, 0],
      [1.7, 2.6],
    ],
    3.2,
    false,
    false,
  ),
  pyramide(
    'quadratische Pyramide',
    [
      [0, 0],
      [3.2, 0],
      [3.2, 3.2],
      [0, 3.2],
    ],
    [1.6, 3.6, 1.6],
    undefined,
    0,
    false,
  ),
  prisma('stehendes Sechseckprisma', sechseck, 3.2, true, true),
  pyramide(
    'quadratischer Pyramidenstumpf',
    [
      [0, 0],
      [3.4, 0],
      [3.4, 3.4],
      [0, 3.4],
    ],
    [0, 0, 0],
    [
      [0.9, 0.9],
      [2.5, 0.9],
      [2.5, 2.5],
      [0.9, 2.5],
    ],
    2.2,
    true,
  ),
  prisma(
    'stehendes Dreiecksprisma',
    [
      [0, 0],
      [3.4, 0],
      [1.7, 2.8],
    ],
    2.6,
    true,
    true,
  ),
];

/** Beschreibung jeder Ansicht in Worten (Bildbeschreibung für Screenreader, A2) */
const ANSICHT_TEXT: Readonly<Record<string, Readonly<Record<Ansicht, string>>>> = {
  Quader: {
    vorne: 'ein Rechteck, breiter als hoch',
    oben: 'ein Rechteck, breiter als tief',
    links: 'ein Rechteck, höher als breit',
  },
  Würfel: { vorne: 'ein Quadrat', oben: 'ein Quadrat', links: 'ein Quadrat' },
  'liegendes Dreiecksprisma': {
    vorne: 'ein Dreieck',
    oben: 'ein Rechteck mit einer Linie in der Mitte',
    links: 'ein Rechteck',
  },
  'quadratische Pyramide': {
    vorne: 'ein Dreieck',
    oben: 'ein Quadrat mit beiden Diagonalen',
    links: 'ein Dreieck',
  },
  'stehendes Sechseckprisma': {
    vorne: 'ein Rechteck mit zwei senkrechten Linien',
    oben: 'ein Sechseck',
    links: 'ein Rechteck mit einer senkrechten Linie',
  },
  'quadratischer Pyramidenstumpf': {
    vorne: 'ein Trapez',
    oben: 'ein kleines Quadrat in einem großen, die Ecken verbunden',
    links: 'ein Trapez',
  },
  'stehendes Dreiecksprisma': {
    vorne: 'ein Rechteck mit einer senkrechten Linie',
    oben: 'ein Dreieck',
    links: 'ein Rechteck',
  },
};
const ansichtText = (k: Koerper, a: Ansicht) => ANSICHT_TEXT[k.name]?.[a] ?? '';
/** Form einer Ansicht ohne Größe: Antworten mit derselben Form wären kaum zu unterscheiden */
const form = (k: Koerper, a: Ansicht) =>
  ansichtText(k, a)
    .replace(/, (breiter|höher) als \w+$/, '')
    .replace('mit einer Linie in der Mitte', 'mit einer senkrechten Linie');

// ---------------------------------------------------------------------------
// Geometrie: Kanten, Sichtbarkeit, Projektionen

function kanten(k: Koerper): { a: number; b: number; flaechen: number[] }[] {
  const liste = new Map<string, { a: number; b: number; flaechen: number[] }>();
  k.flaechen.forEach((f, fi) =>
    f.forEach((a, i) => {
      const b = f[(i + 1) % f.length] ?? a;
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      const e = liste.get(key) ?? { a: Math.min(a, b), b: Math.max(a, b), flaechen: [] };
      e.flaechen.push(fi);
      liste.set(key, e);
    }),
  );
  return [...liste.values()];
}

/** Ist die Fläche vom Betrachter (vorne rechts oben) aus sichtbar? */
function sichtbar(k: Koerper, f: readonly number[]): boolean {
  const pk = f.map((i): V3 => k.ecken[i] ?? [0, 0, 0]);
  // Normale nach Newell, nach außen ausgerichtet (Körper sind konvex)
  let n: [number, number, number] = [0, 0, 0];
  pk.forEach((p, i) => {
    const q = pk[(i + 1) % pk.length] ?? p;
    n = [
      n[0] + (p[1] - q[1]) * (p[2] + q[2]),
      n[1] + (p[2] - q[2]) * (p[0] + q[0]),
      n[2] + (p[0] - q[0]) * (p[1] + q[1]),
    ];
  });
  const mitte = (ps: readonly V3[]) =>
    ps.reduce(
      (s, p) => [s[0] + p[0] / ps.length, s[1] + p[1] / ps.length, s[2] + p[2] / ps.length] as V3,
      [0, 0, 0] as V3,
    );
  const mf = mitte(pk);
  const mk = mitte(k.ecken);
  const aussen = n[0] * (mf[0] - mk[0]) + n[1] * (mf[1] - mk[1]) + n[2] * (mf[2] - mk[2]);
  if (aussen < 0) n = [-n[0], -n[1], -n[2]];
  // Blickrichtung der Kavalierperspektive: von vorne rechts oben
  return n[0] * 0.35 + n[1] * 0.35 - n[2] > 1e-9;
}

type Strecke = readonly [V2, V2, boolean]; // von, bis, verdeckt

/** Schrägbild: z nach rechts oben, halb so lang, 45° */
function schraegbild(k: Koerper): Strecke[] {
  const vis = k.flaechen.map((f) => sichtbar(k, f));
  const p = (v: V3): V2 => [v[0] + 0.3536 * v[2], v[1] + 0.3536 * v[2]];
  return kanten(k).map((e) => [
    p(k.ecken[e.a] ?? [0, 0, 0]),
    p(k.ecken[e.b] ?? [0, 0, 0]),
    !e.flaechen.some((f) => vis[f]),
  ]);
}

export type Ansicht = 'vorne' | 'oben' | 'links';

/** Senkrechte Projektion: Vorderansicht (x, y), Draufsicht (x, z) mit vorne unten, Seitenansicht von links (z, y) */
export function ansicht(k: Koerper, art: Ansicht): Strecke[] {
  const p = (v: V3): V2 =>
    art === 'vorne' ? [v[0], v[1]] : art === 'oben' ? [v[0], v[2]] : [v[2], v[1]];
  const gesehen = new Set<string>();
  const ergebnis: Strecke[] = [];
  const r = (x: number) => Math.round(x * 100) / 100;
  for (const e of kanten(k)) {
    let a = p(k.ecken[e.a] ?? [0, 0, 0]);
    let b = p(k.ecken[e.b] ?? [0, 0, 0]);
    if (r(a[0]) === r(b[0]) && r(a[1]) === r(b[1])) continue; // Kante zeigt auf den Betrachter
    if (r(a[0]) > r(b[0]) || (r(a[0]) === r(b[0]) && r(a[1]) > r(b[1]))) [a, b] = [b, a];
    const key = `${r(a[0])},${r(a[1])},${r(b[0])},${r(b[1])}`;
    if (gesehen.has(key)) continue;
    gesehen.add(key);
    ergebnis.push([a, b, false]);
  }
  return ergebnis;
}

/** Fingerabdruck einer Ansicht (zum Vergleichen, unabhängig von der Reihenfolge) */
export const abdruck = (s: readonly Strecke[]) =>
  s
    .map(([a, b]) =>
      [a, b].map(([x, y]) => `${Math.round(x * 100)},${Math.round(y * 100)}`).join('-'),
    )
    .sort()
    .join(' ');

/** Strecken in ein Bild einpassen (y nach oben) */
function zeichne(strecken: readonly Strecke[], breite: number, hoehe: number, rand = 12): string[] {
  const xs = strecken.flatMap(([a, b]) => [a[0], b[0]]);
  const ys = strecken.flatMap(([a, b]) => [a[1], b[1]]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const s = Math.min((breite - 2 * rand) / (x1 - x0 || 1), (hoehe - 2 * rand) / (y1 - y0 || 1));
  const X = (x: number) => rand + (x - x0) * s + (breite - 2 * rand - (x1 - x0) * s) / 2;
  const Y = (y: number) => hoehe - rand - (y - y0) * s - (hoehe - 2 * rand - (y1 - y0) * s) / 2;
  return strecken.map(([a, b, verdeckt]) =>
    verdeckt
      ? `<line x1="${X(a[0]).toFixed(1)}" y1="${Y(a[1]).toFixed(1)}" x2="${X(b[0]).toFixed(1)}" y2="${Y(b[1]).toFixed(1)}" stroke-width="1.5" stroke-dasharray="5 4"/>`
      : linie(X(a[0]), Y(a[1]), X(b[0]), Y(b[1]), 2),
  );
}

const ANSICHT_NAME: Readonly<Record<Ansicht, string>> = {
  vorne: 'die Vorderansicht',
  oben: 'die Draufsicht (von oben)',
  links: 'die Seitenansicht von links',
};

// ---------------------------------------------------------------------------
// Ansicht zum Schrägbild wählen (M.RF.KP.ZWEITAFEL.ANSICHT)

export interface AnsichtParameter {
  readonly erweitert: boolean;
}

/** „Welches Bild zeigt die Draufsicht?“ – Schrägbild, vier Ansichten zur Wahl */
export const ansichtWaehlen: Generator<AnsichtParameter> = {
  id: 'kp.ansicht-waehlen',
  version: 1,
  platzhalter: ['koerper', 'ansicht'],
  fehlerbildIds: ['andere-ansicht', 'anderer-koerper'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const liste = KOERPER.filter((k) => p.erweitert || !k.erweitert);
    const k = r.pick(liste);
    const arten: Ansicht[] = p.erweitert ? ['vorne', 'oben', 'links'] : ['vorne', 'oben'];
    const art = r.pick(arten);
    const kandidaten: { id: string; s: Strecke[]; text: string; form: string }[] = [
      { id: 'richtig', s: ansicht(k, art), text: ansichtText(k, art), form: form(k, art) },
    ];
    const nimm = (id: string, von: Koerper, a: Ansicht) => {
      if (kandidaten.length < 4 && !kandidaten.some((c) => c.form === form(von, a)))
        kandidaten.push({ id, s: ansicht(von, a), text: ansichtText(von, a), form: form(von, a) });
    };
    for (const a of mische(
      r,
      (['vorne', 'oben', 'links'] as Ansicht[]).filter((x) => x !== art),
    ))
      nimm('andere-ansicht', k, a);
    for (const anderer of mische(
      r,
      KOERPER.filter((x) => x !== k),
    ))
      nimm('anderer-koerper', anderer, r.pick(arten));
    const optionen = mische(r, kandidaten);
    const index = (id: string) => {
      const i = optionen.findIndex((o) => o.id === id);
      return i < 0 ? undefined : auswahl(i);
    };
    const richtig = auswahl(optionen.findIndex((o) => o.id === 'richtig'));
    return {
      platzhalter: { koerper: de(k.name), ansicht: de(ANSICHT_NAME[art]) },
      bild: bild(
        240,
        200,
        zeichne(schraegbild(k), 240, 200, 20),
        de(`Ein Schrägbild: ${k.name}. Verdeckte Kanten sind gestrichelt.`),
      ),
      optionen: optionen.map((o, i) => ({
        text: de(`Bild ${i + 1}`),
        bild: bild(110, 110, zeichne(o.s, 110, 110), de(o.text)),
      })),
      loesung: richtig,
      loesungsweg: [
        de(
          art === 'vorne'
            ? 'Vorderansicht: Du schaust genau von vorne auf den Körper.'
            : art === 'oben'
              ? 'Draufsicht: Du schaust genau von oben auf den Körper.'
              : 'Seitenansicht: Du schaust genau von links auf den Körper.',
        ),
        de(
          `Das ist ${ansichtText(k, art)} – Bild ${optionen.findIndex((o) => o.id === 'richtig') + 1}.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['andere-ansicht', index('andere-ansicht')],
        ['anderer-koerper', index('anderer-koerper')],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Körper zum Zweitafelbild (M.RF.KP.ZWEITAFEL.KOERPER)

/** „Welcher Körper hat dieses Zweitafelbild?“ – Aufriss oben, Grundriss unten */
export const zweitafelKoerper: Generator<AnsichtParameter> = {
  id: 'kp.zweitafel-koerper',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['nur-aufriss', 'nur-grundriss'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const liste = KOERPER.filter((k) => p.erweitert || !k.erweitert);
    const k = r.pick(liste);
    const auf = ansicht(k, 'vorne');
    const grund = ansicht(k, 'oben');
    // Aufriss und Grundriss im gleichen Maßstab übereinander, dazwischen die Rissachse
    const alle = [
      ...auf.map(([a, b]): Strecke => [[a[0], a[1] + 4.6], [b[0], b[1] + 4.6], false]),
      ...grund,
    ];
    const achse: Strecke = [[-0.6, 4.3], [4.6, 4.3], false];
    const teile = zeichne([...alle, achse], 200, 260, 16);
    const andere = mische(
      r,
      liste.filter((x) => x !== k),
    ).slice(0, 3);
    const optionen = mische(r, [k, ...andere]);
    const richtig = auswahl(optionen.indexOf(k));
    const nurAuf = optionen.findIndex((o) => o !== k && form(o, 'vorne') === form(k, 'vorne'));
    const nurGrund = optionen.findIndex((o) => o !== k && form(o, 'oben') === form(k, 'oben'));
    return {
      platzhalter: {},
      bild: bild(
        200,
        260,
        teile,
        de(
          `Ein Zweitafelbild. Oben der Aufriss (Vorderansicht): ${ansichtText(k, 'vorne')}. Unten der Grundriss (Draufsicht): ${ansichtText(k, 'oben')}. Dazwischen die Rissachse.`,
        ),
      ),
      optionen: optionen.map((o) => ({ text: de(o.name) })),
      loesung: richtig,
      loesungsweg: [
        de(
          'Der Aufriss zeigt den Körper von vorne, der Grundriss von oben. Erst beide zusammen verraten den Körper.',
        ),
        de(`Hier: ${k.name}.`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['nur-aufriss', nurAuf >= 0 ? auswahl(nurAuf) : undefined],
        ['nur-grundriss', nurGrund >= 0 ? auswahl(nurGrund) : undefined],
      ]),
    };
  },
};
