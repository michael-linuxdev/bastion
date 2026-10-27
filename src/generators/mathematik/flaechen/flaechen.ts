import { zahlDeutsch } from '../../../core/learning/format';
import type { Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng } from '../../../core/rng/rng';
import { de, verlange, zahl } from '../../hilfen';
import { bild, text, vieleck } from '../../svg';

type Punkt = readonly [number, number];

/**
 * Vieleck mit Maßangaben an ausgewählten Seiten. Punkte in Einheiten (y nach oben),
 * gezeichnet so groß wie möglich im Bild 320 × 220.
 */
function massbild(
  punkte: readonly Punkt[],
  masse: readonly (number | undefined)[],
  einheit: string,
) {
  const xs = punkte.map((p) => p[0]);
  const ys = punkte.map((p) => p[1]);
  const [bx, by] = [Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)];
  const s = Math.min(220 / bx, 140 / by);
  const ox = (320 - bx * s) / 2 - Math.min(...xs) * s;
  const oy = (220 + by * s) / 2 + Math.min(...ys) * s;
  const px = punkte.map(([x, y]) => [ox + x * s, oy - y * s] as const);
  // Umlaufsinn bestimmen, damit die Beschriftung immer außen steht.
  let flaeche2 = 0;
  punkte.forEach(([x1, y1], i) => {
    const [x2, y2] = punkte[(i + 1) % punkte.length] ?? [0, 0];
    flaeche2 += x1 * y2 - x2 * y1;
  });
  const aussen = flaeche2 > 0 ? 1 : -1;
  const teile = [vieleck(px, true)];
  masse.forEach((m, i) => {
    if (m === undefined) return;
    const [x1, y1] = px[i] ?? [0, 0];
    const [x2, y2] = px[(i + 1) % px.length] ?? [0, 0];
    const len = Math.hypot(x2 - x1, y2 - y1);
    // Normale in Bildkoordinaten (y nach unten)
    const [nx, ny] = [(aussen * (y1 - y2)) / len, (aussen * (x2 - x1)) / len];
    const inhalt = `${zahlDeutsch(m)} ${einheit}`;
    // Neben senkrechten Seiten braucht die Beschriftung Platz für ihre halbe Breite.
    const abstand = Math.abs(nx) > 0.5 ? 8 + inhalt.length * 3.6 : 14;
    teile.push(text((x1 + x2) / 2 + nx * abstand, (y1 + y2) / 2 + ny * abstand + 5, inhalt, 13));
  });
  return teile;
}

export interface RechteckParameter {
  readonly gesucht: 'umfang' | 'flaeche';
  readonly max: number; // größte Seitenlänge
  readonly einheiten: readonly string[];
}

/** Umfang oder Flächeninhalt eines Rechtecks oder Quadrats – Vorlagen M.GM.FL.RECHTECK.UMFANG und .FLAECHE */
export const rechteck: Generator<RechteckParameter> = {
  id: 'fl.rechteck',
  version: 1,
  platzhalter: ['angabe', 'einheit'],
  fehlerbildIds: ['umfang-flaeche-verwechselt', 'nur-zwei-seiten', 'addiert'],

  erzeuge(seed, p) {
    verlange(p.max >= 5 && p.max <= 100, 'max: 5 … 100');
    const r = rng(seed);
    const quadrat = r.int(1, 4) === 1;
    const a = r.int(3, p.max);
    const b = quadrat ? a : r.int(2, a - 1);
    const e = r.pick(p.einheiten);
    const u = 2 * (a + b);
    const A = a * b;
    const umfang = p.gesucht === 'umfang';
    const loesung = zahl(umfang ? u : A);
    const punkte: Punkt[] = [
      [0, 0],
      [a, 0],
      [a, b],
      [0, b],
    ];
    return {
      platzhalter: {
        angabe: de(
          quadrat
            ? `Ein Quadrat hat die Seitenlänge ${zahlDeutsch(a)} ${e}.`
            : `Ein Rechteck ist ${zahlDeutsch(a)} ${e} lang und ${zahlDeutsch(b)} ${e} breit.`,
        ),
        einheit: de(umfang ? e : `${e}²`),
      },
      bild: bild(
        320,
        220,
        massbild(punkte, [a, b, undefined, undefined], e),
        de(
          quadrat
            ? `Ein Quadrat mit ${a} ${e} Seitenlänge.`
            : `Ein Rechteck, ${a} ${e} lang und ${b} ${e} breit.`,
        ),
      ),
      loesung,
      loesungsweg: umfang
        ? [
            de('Der Umfang ist die Länge aller vier Seiten zusammen: u = 2 · a + 2 · b.'),
            de(`u = 2 · ${a} ${e} + 2 · ${b} ${e} = ${zahlDeutsch(u)} ${e}`),
          ]
        : [
            de('Flächeninhalt = Länge mal Breite: A = a · b.'),
            de(`A = ${a} ${e} · ${b} ${e} = ${zahlDeutsch(A)} ${e}²`),
          ],
      fehlerbilder: fehlerbilderAus(loesung, [
        ['umfang-flaeche-verwechselt', zahl(umfang ? A : u)],
        ['nur-zwei-seiten', umfang ? zahl(a + b) : undefined],
        ['addiert', umfang ? undefined : zahl(a + b)],
      ]),
    };
  },
};

export interface SeiteFehltParameter {
  readonly max: number;
}

/** Fehlende Seitenlänge aus Umfang oder Flächeninhalt – Vorlage M.GM.FL.RECHTECK.SEITE-FEHLT */
export const seiteFehlt: Generator<SeiteFehltParameter> = {
  id: 'fl.seite-fehlt',
  version: 1,
  platzhalter: ['angabe', 'einheit'],
  fehlerbildIds: ['subtrahiert', 'umfang-nicht-halbiert'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const a = r.int(3, p.max);
    const b = r.int(2, p.max);
    const e = r.pick(['cm', 'm']);
    const ausUmfang = r.int(0, 1) === 0;
    const u = 2 * (a + b);
    const A = a * b;
    const loesung = zahl(b);
    return {
      platzhalter: {
        angabe: de(
          ausUmfang
            ? `Ein Rechteck hat den Umfang ${zahlDeutsch(u)} ${e}. Eine Seite ist ${a} ${e} lang.`
            : `Ein Rechteck hat den Flächeninhalt ${zahlDeutsch(A)} ${e}². Eine Seite ist ${a} ${e} lang.`,
        ),
        einheit: de(e),
      },
      loesung,
      loesungsweg: ausUmfang
        ? [
            de(
              `Zwei Seiten sind ${a} ${e} lang: ${zahlDeutsch(u)} − 2 · ${a} = ${zahlDeutsch(u - 2 * a)}.`,
            ),
            de(
              `Das sind die beiden anderen Seiten zusammen: ${zahlDeutsch(u - 2 * a)} : 2 = ${b} ${e}`,
            ),
          ]
        : [de('A = a · b, also b = A : a.'), de(`b = ${zahlDeutsch(A)} : ${a} = ${b} ${e}`)],
      fehlerbilder: fehlerbilderAus(loesung, [
        ['subtrahiert', ausUmfang ? undefined : zahl(A - a)],
        ['umfang-nicht-halbiert', ausUmfang ? zahl(u - a) : undefined],
      ]),
    };
  },
};

const ECKEN = ['oben rechts', 'oben links', 'unten rechts', 'unten links'] as const;

export interface ZusammengesetztParameter {
  readonly gesucht: 'umfang' | 'flaeche';
  readonly alle_masse: boolean; // false: nur die Maße, die man zum Rechnen braucht
  readonly max: number;
}

/** L-förmige Figur: Flächeninhalt oder Umfang – Vorlagen M.GM.FL.ZUSAMMENGESETZT.FLAECHE und .UMFANG */
export const zusammengesetzt: Generator<ZusammengesetztParameter> = {
  id: 'fl.zusammengesetzt',
  version: 1,
  platzhalter: ['einheit'],
  fehlerbildIds: [
    'aussen-multipliziert',
    'addiert-statt-abgezogen',
    'einschnitt-vergessen',
    'flaeche-statt-umfang',
  ],

  erzeuge(seed, p) {
    verlange(p.max >= 8, 'max: mindestens 8');
    const r = rng(seed);
    // Seitenverhältnis und Einschnitt nicht zu extrem, damit die Maße lesbar bleiben.
    const W = r.int(6, p.max);
    const H = r.int(Math.max(6, Math.ceil(W / 2)), Math.min(p.max, Math.floor(W * 1.5)));
    const w = r.int(Math.max(3, Math.ceil(W / 4)), W - Math.max(3, Math.ceil(W / 4)));
    const h = r.int(Math.max(3, Math.ceil(H / 4)), H - Math.max(3, Math.ceil(H / 4)));
    const ecke = r.int(0, 3);
    const e = r.pick(['cm', 'm']);
    // Ausschnitt oben rechts; die anderen Ecken entstehen durch Spiegeln.
    const grund: Punkt[] = [
      [0, 0],
      [W, 0],
      [W, H - h],
      [W - w, H - h],
      [W - w, H],
      [0, H],
    ];
    const spiegelX = ecke === 1 || ecke === 3;
    const spiegelY = ecke === 2 || ecke === 3;
    const punkte = grund.map(([x, y]) => [spiegelX ? W - x : x, spiegelY ? H - y : y] as const);
    // Seiten: unten W, rechts H − h, Einschnitt w, Einschnitt h, oben W − w, links H
    const masse = p.alle_masse ? [W, H - h, w, h, W - w, H] : [W, undefined, w, h, undefined, H];
    const A = W * H - w * h;
    const u = 2 * (W + H);
    const umfang = p.gesucht === 'umfang';
    const loesung = zahl(umfang ? u : A);
    return {
      platzhalter: { einheit: de(umfang ? e : `${e}²`) },
      bild: bild(
        320,
        220,
        massbild(punkte, masse, e),
        de(
          `Eine L-förmige Figur: ein Rechteck, ${W} ${e} breit und ${H} ${e} hoch, ` +
            `dem an der Ecke ${ECKEN[ecke] ?? ''} ein Rechteck, ${w} ${e} breit und ${h} ${e} hoch, fehlt.`,
        ),
      ),
      loesung,
      loesungsweg: umfang
        ? [
            de('Gehe einmal außen um die Figur herum und addiere alle sechs Seiten.'),
            de(
              `${W} + ${H - h} + ${w} + ${h} + ${W - w} + ${H} = ${zahlDeutsch(u)} – also ${zahlDeutsch(u)} ${e}.`,
            ),
          ]
        : [
            de('Ergänze die Figur zu einem großen Rechteck und ziehe das fehlende Rechteck ab.'),
            de(
              `${W} · ${H} − ${w} · ${h} = ${zahlDeutsch(W * H)} − ${zahlDeutsch(w * h)} = ${zahlDeutsch(A)} – also ${zahlDeutsch(A)} ${e}².`,
            ),
          ],
      fehlerbilder: fehlerbilderAus(loesung, [
        ['aussen-multipliziert', umfang ? undefined : zahl(W * H)],
        ['addiert-statt-abgezogen', umfang ? undefined : zahl(W * H + w * h)],
        ['einschnitt-vergessen', umfang ? zahl(u - w - h) : undefined],
        ['flaeche-statt-umfang', umfang ? zahl(A) : undefined],
      ]),
    };
  },
};
