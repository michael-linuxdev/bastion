// Koordinatensystem mit vier Quadranten – Klasse 7 (LEHRPLAN §8c, M.RF.GF.QUADRANTEN):
// Punkte mit negativen Koordinaten ablesen, Quadranten bestimmen, an den Achsen
// und am Ursprung spiegeln.
import { zahlText } from '../../../core/learning/text';
import type { Generator, Loesung, Punkt } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, verlange } from '../../hilfen';
import { bild, koordinatensystem4, punkt as punktSvg } from '../../svg';

const pkt = (x: number, y: number): Loesung => ({ typ: 'punkt', wert: { x, y } });
const P = (p: Punkt) => `(${zahlText(p.x)}|${zahlText(p.y)})`;
const ohneNull = (x: number) => (x === 0 ? 0 : x);

/** Punkt mit beiden Koordinaten ≠ 0, mindestens eine negativ */
function punktNegativ(r: Rng, max: number): Punkt {
  for (;;) {
    const x = r.int(1, max) * (r.int(0, 1) === 0 ? -1 : 1);
    const y = r.int(1, max) * (r.int(0, 1) === 0 ? -1 : 1);
    if ((x < 0 || y < 0) && Math.abs(x) !== Math.abs(y)) return { x, y };
  }
}

const ROEMISCH = ['I', 'II', 'III', 'IV'] as const;
/** Quadrant 0 … 3 (I oben rechts, gegen den Uhrzeigersinn) */
const quadrant = (p: Punkt) => (p.x > 0 ? (p.y > 0 ? 0 : 3) : p.y > 0 ? 1 : 2);

export interface QuadrantenParameter {
  readonly max: number; // 3 … 8
}

/** „Gib die Koordinaten des Punktes P an.“ – vier Quadranten */
export const punktAblesen4: Generator<QuadrantenParameter> = {
  id: 'gf.punkt-ablesen-4',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['x-y-vertauscht', 'vorzeichen-vergessen'],

  erzeuge(seed, p) {
    verlange(p.max >= 3 && p.max <= 8, 'max: 3 … 8');
    const r = rng(seed);
    const q = punktNegativ(r, p.max);
    const ks = koordinatensystem4(p.max);
    const richtig = pkt(q.x, q.y);
    const lr = q.x < 0 ? 'links' : 'rechts';
    const ou = q.y < 0 ? 'unter' : 'über';
    return {
      platzhalter: {},
      bild: bild(
        ks.breite,
        ks.hoehe,
        [...ks.teile, punktSvg(ks.px(q.x), ks.py(q.y), 'P')],
        de(
          `Ein Koordinatensystem mit vier Quadranten, beide Achsen von ${zahlText(-p.max)} bis ${p.max}. ` +
            `Der Punkt P liegt ${Math.abs(q.x)} Einheiten ${lr} vom Ursprung und ${Math.abs(q.y)} Einheiten ${ou} der x-Achse.`,
        ),
      ),
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: [
        de(`Zuerst x: ${Math.abs(q.x)} nach ${lr} – das ist ${zahlText(q.x)}.`),
        de(
          `Dann y: ${Math.abs(q.y)} nach ${q.y < 0 ? 'unten' : 'oben'} – das ist ${zahlText(q.y)}.`,
        ),
        de(`P${P(q)}`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['x-y-vertauscht', pkt(q.y, q.x)],
        ['vorzeichen-vergessen', pkt(Math.abs(q.x), Math.abs(q.y))],
      ]),
    };
  },
};

/** „In welchem Quadranten liegt P(−3|5)?“ */
export const quadrantBestimmen: Generator<QuadrantenParameter> = {
  id: 'gf.quadrant',
  version: 1,
  platzhalter: ['punkt'],
  fehlerbildIds: ['x-y-vertauscht', 'falsch-herum-gezaehlt'],

  erzeuge(seed, p) {
    verlange(p.max >= 3 && p.max <= 8, 'max: 3 … 8');
    const r = rng(seed);
    const q = punktNegativ(r, p.max);
    const qu = quadrant(q);
    const richtig = auswahl(qu);
    // Im Uhrzeigersinn gezählt: II und IV vertauscht
    const uhrzeiger = [0, 3, 2, 1][qu] ?? 0;
    return {
      platzhalter: { punkt: de(P(q)) },
      optionen: ROEMISCH.map((t) => ({ text: de(t) })),
      loesung: richtig,
      loesungsweg: [
        de(
          'Die Quadranten zählt man gegen den Uhrzeigersinn: I oben rechts, II oben links, III unten links, IV unten rechts.',
        ),
        de(
          `x ist ${q.x < 0 ? 'negativ (links)' : 'positiv (rechts)'}, y ist ${q.y < 0 ? 'negativ (unten)' : 'positiv (oben)'}: Quadrant ${ROEMISCH[qu]}.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['x-y-vertauscht', auswahl(quadrant({ x: q.y, y: q.x }))],
        ['falsch-herum-gezaehlt', auswahl(uhrzeiger)],
      ]),
    };
  },
};

export interface SpiegelnParameter4 {
  readonly max: number; // 3 … 8
  /** auch Spiegeln am Ursprung */
  readonly ursprung: boolean;
}

const ART = ['x-Achse', 'y-Achse', 'Ursprung'] as const;

/** „Spiegle P(−3|5) an der x-Achse. Gib die Koordinaten des Bildpunktes an.“ */
export const spiegeln4: Generator<SpiegelnParameter4> = {
  id: 'gf.spiegeln-4',
  version: 1,
  platzhalter: ['punkt', 'woran'],
  fehlerbildIds: ['achse-verwechselt', 'nur-ein-vorzeichen', 'beide-vorzeichen'],

  erzeuge(seed, p) {
    verlange(p.max >= 3 && p.max <= 8, 'max: 3 … 8');
    const r = rng(seed);
    const q = punktNegativ(r, p.max);
    const art = r.int(0, p.ursprung ? 2 : 1);
    const an = (a: number) =>
      a === 0 ? { x: q.x, y: -q.y } : a === 1 ? { x: -q.x, y: q.y } : { x: -q.x, y: -q.y };
    const b = an(art);
    const richtig = pkt(ohneNull(b.x), ohneNull(b.y));
    return {
      platzhalter: {
        punkt: de(P(q)),
        woran: de(art === 2 ? 'am Ursprung' : `an der ${ART[art]}`),
      },
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: [
        de(
          art === 0
            ? 'An der x-Achse spiegeln: x bleibt, y bekommt das andere Vorzeichen.'
            : art === 1
              ? 'An der y-Achse spiegeln: y bleibt, x bekommt das andere Vorzeichen.'
              : 'Am Ursprung spiegeln: x und y bekommen beide das andere Vorzeichen.',
        ),
        de(`P${P(q)} wird zu P'${P(b)}.`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['achse-verwechselt', art < 2 ? pkt(an(1 - art).x, an(1 - art).y) : undefined],
        ['beide-vorzeichen', art < 2 ? pkt(-q.x, -q.y) : undefined],
        ['nur-ein-vorzeichen', art === 2 ? pkt(-q.x, q.y) : undefined],
      ]),
    };
  },
};
