import type { Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, mische } from '../../hilfen';
import { bild, rechteck, text } from '../../svg';

/** Ein Netz als Liste von Kästchen [spalte, zeile]. */
export type Netz = readonly (readonly [number, number])[];

/** Die elf Würfelnetze (je eine Lage; Drehungen und Spiegelungen entstehen im Generator). */
export const WUERFELNETZE: readonly Netz[] = [
  // 1-4-1: Viererreihe, je ein Kästchen darüber und darunter
  ...(
    [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 1],
      [1, 2],
    ] as const
  ).map(([oben, unten]): Netz => [
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
    [oben, 0],
    [unten, 2],
  ]),
  // 2-3-1
  ...[1, 2, 3].map((unten): Netz => [
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
    [3, 1],
    [unten, 2],
  ]),
  // 2-2-2 (Treppe) und 3-3
  [
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
    [2, 2],
    [3, 2],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
    [3, 1],
    [4, 1],
  ],
];

export function normiert(n: Netz): Netz {
  const minS = Math.min(...n.map(([s]) => s));
  const minZ = Math.min(...n.map(([, z]) => z));
  return n
    .map(([s, z]) => [s - minS, z - minZ] as const)
    .sort((a, b) => a[1] - b[1] || a[0] - b[0]);
}

/** Kennzahl der Form, gleich für alle acht Lagen: kleinster Bitcode über alle Lagen. */
const LAGEN_VON: readonly ((s: number, z: number) => readonly [number, number])[] = [
  (s, z) => [s, z],
  (s, z) => [-s, z],
  (s, z) => [s, -z],
  (s, z) => [-s, -z],
  (s, z) => [z, s],
  (s, z) => [-z, s],
  (s, z) => [z, -s],
  (s, z) => [-z, -s],
];
function form(n: Netz): number {
  let beste = Infinity;
  for (const lage of LAGEN_VON) {
    const t = n.map(([s, z]) => lage(s, z));
    const minS = Math.min(...t.map(([s]) => s));
    const minZ = Math.min(...t.map(([, z]) => z));
    // Kästchen als Bits auf einem 6 × 6-Raster (2^36 ist als Zahl noch exakt)
    const code = t.reduce((c, [s, z]) => c + 2 ** ((z - minZ) * 6 + (s - minS)), 0);
    beste = Math.min(beste, code);
  }
  return beste;
}
const NETZFORMEN = new Set(WUERFELNETZE.map(form));
export const istWuerfelnetz = (n: Netz) => NETZFORMEN.has(form(n));

function zufaelligeLage(r: Rng, n: Netz): Netz {
  const lage = LAGEN_VON[r.int(0, 7)] ?? LAGEN_VON[0];
  return lage ? normiert(n.map(([s, z]) => lage(s, z))) : n;
}

/**
 * Zufälliges Sechserkästchen, das kein Würfelnetz ist. Knifflig: ohne die zwei
 * leicht erkennbaren Merkmale (vier Quadrate als 2 × 2-Block, fünf in einer Reihe).
 */
function keinNetz(r: Rng, knifflig: boolean): Netz {
  for (;;) {
    const zellen: [number, number][] = [[0, 0]];
    while (zellen.length < 6) {
      const [s, z] = r.pick(zellen);
      const [ds, dz] = r.pick([
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ] as const);
      if (!zellen.some(([a, b]) => a === s + ds && b === z + dz)) zellen.push([s + ds, z + dz]);
    }
    const n = normiert(zellen);
    const breit = Math.max(...n.map(([s]) => s));
    const hoch = Math.max(...n.map(([, z]) => z));
    if (breit > 4 || hoch > 4) continue;
    if (knifflig && (breit === 4 || hoch === 4 || hatViererblock(n))) continue;
    if (!istWuerfelnetz(n)) return n;
  }
}

const hatViererblock = (n: Netz) =>
  n.some(
    ([s, z]) =>
      n.some(([a, b]) => a === s + 1 && b === z) &&
      n.some(([a, b]) => a === s && b === z + 1) &&
      n.some(([a, b]) => a === s + 1 && b === z + 1),
  );

/**
 * Würfel über das Netz abrollen: Für jedes Kästchen, welche Würfelfläche (0 … 5) unten liegt.
 * Gegenüberliegende Flächen: 0/1, 2/3, 4/5.
 */
export function abrollen(n: Netz): number[] {
  const flaeche: (number | undefined)[] = n.map(() => undefined);
  const lage: { u: number; d: number; n: number; s: number; o: number; w: number }[] = [];
  lage[0] = { u: 0, d: 1, n: 2, s: 3, o: 4, w: 5 };
  flaeche[0] = 1;
  const warteschlange = [0];
  while (warteschlange.length > 0) {
    const i = warteschlange.shift() ?? 0;
    const [s, z] = n[i] ?? [0, 0];
    const l = lage[i] ?? { u: 0, d: 1, n: 2, s: 3, o: 4, w: 5 };
    const nachbarn = [
      [1, 0, { ...l, d: l.o, o: l.u, u: l.w, w: l.d }],
      [-1, 0, { ...l, d: l.w, w: l.u, u: l.o, o: l.d }],
      [0, 1, { ...l, d: l.s, s: l.u, u: l.n, n: l.d }],
      [0, -1, { ...l, d: l.n, n: l.u, u: l.s, s: l.d }],
    ] as const;
    for (const [ds, dz, neu] of nachbarn) {
      const j = n.findIndex(([a, b]) => a === s + ds && b === z + dz);
      if (j >= 0 && flaeche[j] === undefined) {
        lage[j] = neu;
        flaeche[j] = neu.d;
        warteschlange.push(j);
      }
    }
  }
  return flaeche.map((f) => f ?? -1);
}

function netzBild(n: Netz, groesse: number, buchstaben?: readonly string[], markiert?: number) {
  const breite = Math.max(...n.map(([s]) => s)) + 1;
  const hoehe = Math.max(...n.map(([, z]) => z)) + 1;
  const k = Math.min(36, (groesse - 20) / Math.max(breite, hoehe));
  const ox = (groesse - breite * k) / 2;
  const oy = (groesse - hoehe * k) / 2;
  return n.flatMap(([s, z], i) => [
    rechteck(ox + s * k, oy + z * k, k, k, i === markiert),
    ...(buchstaben
      ? [text(ox + (s + 0.5) * k, oy + (z + 0.5) * k + 6, buchstaben[i] ?? '', 17)]
      : []),
  ]);
}

const beschreibe = (n: Netz) =>
  `${n.length} Quadrate, nach Zeilen von oben: ` +
  [...new Set(n.map(([, z]) => z))]
    .map(
      (z) =>
        `Zeile ${z + 1}: Spalten ${n
          .filter(([, b]) => b === z)
          .map(([s]) => s + 1)
          .join(', ')}`,
    )
    .join('; ') +
  '.';

export interface NetzWaehlenParameter {
  readonly gesucht: 'netz' | 'kein-netz';
}

/** „Welche Figur ist ein Würfelnetz?“ bzw. „… ist kein Würfelnetz?“ – Vorlagen M.RF.KP.DARSTELLEN.NETZ-WAEHLEN und .KEIN-NETZ */
export const wuerfelnetzWaehlen: Generator<NetzWaehlenParameter> = {
  id: 'kp.wuerfelnetz-waehlen',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['falsch-gefaltet'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const netz = p.gesucht === 'netz';
    const richtig = netz ? zufaelligeLage(r, r.pick(WUERFELNETZE)) : keinNetz(r, true);
    const andere: Netz[] = [];
    const formen = new Set([form(richtig)]);
    while (andere.length < 3) {
      const kandidat = netz ? keinNetz(r, false) : zufaelligeLage(r, r.pick(WUERFELNETZE));
      const f = form(kandidat);
      if (!formen.has(f)) {
        formen.add(f);
        andere.push(kandidat);
      }
    }
    const figuren = mische(r, [richtig, ...andere]);
    const loesung = auswahl(figuren.indexOf(richtig));
    return {
      platzhalter: {},
      optionen: figuren.map((f, i) => ({
        bild: bild(180, 180, netzBild(f, 180), de(`Figur ${i + 1} aus ${beschreibe(f)}`)),
      })),
      loesung,
      loesungsweg: [
        de(
          netz
            ? 'Falte in Gedanken: Ein Quadrat ist der Boden, die anderen klappst du hoch. Beim Würfelnetz entsteht jede Fläche genau einmal.'
            : 'Falte in Gedanken: Bei dieser Figur würden zwei Quadrate aufeinander landen, und eine Fläche bliebe offen.',
        ),
        de(
          'Merke: In einem Würfelnetz liegen nie mehr als vier Quadrate in einer Reihe, und nie bilden vier Quadrate ein großes Quadrat.',
        ),
      ],
      fehlerbilder: fehlerbilderAus(loesung, [
        ['falsch-gefaltet', auswahl(figuren.indexOf(andere[0] ?? richtig))],
      ]),
    };
  },
};

const BUCHSTABEN = ['A', 'B', 'C', 'D', 'E', 'F'];

export interface GegenueberParameter {
  readonly nur_in_reihe: boolean; // true: die gesuchte Fläche liegt zwei Kästchen weiter in derselben Reihe
}

/** „Welche Fläche liegt gegenüber von A?“ – Vorlage M.RF.KP.DARSTELLEN.GEGENUEBER */
export const gegenueber: Generator<GegenueberParameter> = {
  id: 'kp.gegenueber',
  version: 1,
  platzhalter: ['flaeche'],
  fehlerbildIds: ['nachbar-gewaehlt'],

  erzeuge(seed, p) {
    const r = rng(seed);
    for (;;) {
      const n = zufaelligeLage(r, r.pick(WUERFELNETZE));
      const flaechen = abrollen(n);
      const buchstaben = mische(r, BUCHSTABEN);
      const frage = r.int(0, 5);
      const ziel = flaechen.indexOf((flaechen[frage] ?? 0) ^ 1);
      const [fs, fz] = n[frage] ?? [0, 0];
      const [zs, zz] = n[ziel] ?? [0, 0];
      const inReihe =
        (fs === zs && Math.abs(fz - zz) === 2) || (fz === zz && Math.abs(fs - zs) === 2);
      if (p.nur_in_reihe && !inReihe) continue;
      const optionen = BUCHSTABEN.filter((b) => b !== buchstaben[frage]);
      const index = (zelle: number) => optionen.indexOf(buchstaben[zelle] ?? '');
      const nachbar = n.findIndex(([s, z]) => Math.abs(s - fs) + Math.abs(z - fz) === 1);
      const loesung = auswahl(index(ziel));
      return {
        platzhalter: { flaeche: de(buchstaben[frage] ?? '') },
        bild: bild(
          220,
          220,
          netzBild(n, 220, buchstaben, frage),
          de(
            `Würfelnetz aus ${beschreibe(n)} Beschriftung in derselben Reihenfolge: ${n
              .map((_, i) => buchstaben[i])
              .join(', ')}. Die Fläche ${buchstaben[frage] ?? ''} ist hervorgehoben.`,
          ),
        ),
        optionen: optionen.map((b) => ({ text: de(b) })),
        loesung,
        loesungsweg: [
          de(
            'Flächen, die im Netz nebeneinanderliegen, werden beim Falten Nachbarn – nie Gegenüber.',
          ),
          de(
            inReihe
              ? 'Liegen drei Quadrate in einer Reihe, sind das erste und das dritte gegenüber.'
              : 'Falte Schritt für Schritt um die hervorgehobene Fläche herum.',
          ),
          de(`Gegenüber von ${buchstaben[frage] ?? ''} liegt ${buchstaben[ziel] ?? ''}.`),
        ],
        fehlerbilder: fehlerbilderAus(loesung, [['nachbar-gewaehlt', auswahl(index(nachbar))]]),
      };
    }
  },
};
