import type { Generator, Loesung, Punkt } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, mische, verlange } from '../../hilfen';
import { bild, koordinatensystem, linie, punkt as punktSvg, vieleck } from '../../svg';

const pkt = (x: number, y: number): Loesung => ({ typ: 'punkt', wert: { x, y } });
const P = (p: Punkt) => `(${p.x}|${p.y})`;

export interface GitterParameter {
  readonly max: number; // Größe des Gitters (5 … 12)
}

/** „Gib die Koordinaten des Punktes P an.“ – Vorlage M.RF.GF.KOORDINATEN.ABLESEN */
export const punktAblesen: Generator<GitterParameter> = {
  id: 'gf.punkt-ablesen',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['x-y-vertauscht', 'kaestchen-statt-linien'],

  erzeuge(seed, p) {
    verlange(p.max >= 5 && p.max <= 12, 'max: 5 … 12');
    const r = rng(seed);
    let x = r.int(1, p.max);
    const y = r.int(1, p.max);
    if (x === y) x = x === 1 ? 2 : x - 1;
    const ks = koordinatensystem(p.max, p.max);
    const richtig = pkt(x, y);
    return {
      platzhalter: {},
      bild: bild(
        ks.breite,
        ks.hoehe,
        [...ks.teile, punktSvg(ks.px(x), ks.py(y), 'P')],
        de(
          `Ein Koordinatensystem mit x- und y-Achse von 0 bis ${p.max}. Der Punkt P liegt ${x} Einheiten rechts vom Ursprung und ${y} Einheiten darüber.`,
        ),
      ),
      loesung: richtig,
      loesungsweg: [
        de(`Zuerst nach rechts (x): ${x}. Dann nach oben (y): ${y}.`),
        de(`P${P({ x, y })}`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['x-y-vertauscht', pkt(y, x)],
        ['kaestchen-statt-linien', pkt(x + 1, y + 1)],
      ]),
    };
  },
};

const BUCHSTABEN = ['A', 'B', 'C', 'D'];

/** „Welcher Punkt hat die Koordinaten (3|5)?“ – Vorlage M.RF.GF.KOORDINATEN.FINDEN */
export const punktFinden: Generator<GitterParameter> = {
  id: 'gf.punkt-finden',
  version: 1,
  platzhalter: ['x', 'y'],
  fehlerbildIds: ['x-y-vertauscht'],

  erzeuge(seed, p) {
    verlange(p.max >= 5 && p.max <= 12, 'max: 5 … 12');
    const r = rng(seed);
    const x = r.int(1, p.max);
    let y = r.int(1, p.max);
    if (x === y) y = y === 1 ? 2 : y - 1;
    const punkte: Punkt[] = [
      { x, y },
      { x: y, y: x },
    ];
    while (punkte.length < 4) {
      const q = { x: r.int(0, p.max), y: r.int(0, p.max) };
      if (punkte.every((s) => s.x !== q.x || s.y !== q.y)) punkte.push(q);
    }
    const gemischt = mische(r, punkte);
    const ks = koordinatensystem(p.max, p.max);
    const idx = (q: Punkt) => gemischt.findIndex((s) => s.x === q.x && s.y === q.y);
    return {
      platzhalter: { x, y },
      bild: bild(
        ks.breite,
        ks.hoehe,
        [
          ...ks.teile,
          ...gemischt.map((q, i) => punktSvg(ks.px(q.x), ks.py(q.y), BUCHSTABEN[i] ?? '')),
        ],
        de(
          `Ein Koordinatensystem von 0 bis ${p.max} mit den Punkten ${gemischt.map((q, i) => `${BUCHSTABEN[i]}${P(q)}`).join(', ')}.`,
        ),
      ),
      optionen: BUCHSTABEN.map((b) => ({ text: de(b) })),
      loesung: auswahl(idx({ x, y })),
      loesungsweg: [
        de(`Erst ${x} nach rechts, dann ${y} nach oben: Punkt ${BUCHSTABEN[idx({ x, y })] ?? ''}.`),
      ],
      fehlerbilder: fehlerbilderAus(auswahl(idx({ x, y })), [
        ['x-y-vertauscht', auswahl(idx({ x: y, y: x }))],
      ]),
    };
  },
};

export interface SpiegelnParameter {
  readonly max: number; // 6 … 12
  readonly figur: boolean; // false: ein Punkt; true: Dreieck, gefragt ist ein Eckpunkt
}

function achseUndPunkt(r: Rng, max: number) {
  const senkrecht = r.int(0, 1) === 0;
  const a = r.int(2, max - 2); // Achse x = a bzw. y = a
  // Punkt nicht auf der Achse und Bild noch im Gitter
  const abstand = r.int(1, Math.min(a, max - a));
  const seite = r.int(0, 1) === 0 ? -1 : 1;
  const quer = a + seite * abstand;
  const laengs = r.int(0, max);
  const p: Punkt = senkrecht ? { x: quer, y: laengs } : { x: laengs, y: quer };
  const bildPunkt: Punkt = senkrecht ? { x: 2 * a - p.x, y: p.y } : { x: p.x, y: 2 * a - p.y };
  return { senkrecht, a, p, bildPunkt };
}

/** „Spiegle P an der Geraden g. Gib die Koordinaten von P′ an.“ – Vorlagen M.RF.SY.SPIEGELN.PUNKT und .DREIECK */
export const spiegelpunkt: Generator<SpiegelnParameter> = {
  id: 'sy.spiegelpunkt',
  version: 1,
  platzhalter: ['punkt', 'achse'],
  fehlerbildIds: ['nicht-gespiegelt', 'auf-die-achse', 'falsche-achse'],

  erzeuge(seed, p) {
    verlange(p.max >= 6 && p.max <= 12, 'max: 6 … 12');
    const r = rng(seed);
    const { senkrecht, a, p: q, bildPunkt } = achseUndPunkt(r, p.max);
    const ks = koordinatensystem(p.max, p.max);
    const teile = [...ks.teile];
    teile.push(
      senkrecht
        ? linie(ks.px(a), ks.py(0), ks.px(a), ks.py(p.max), 3)
        : linie(ks.px(0), ks.py(a), ks.px(p.max), ks.py(a), 3),
    );
    let name = 'P';
    if (p.figur) {
      // Dreieck A, B, C auf derselben Seite der Achse: B längs der Achse, C ein Stück quer dazu
      const laengs = (senkrecht ? q.y : q.x) + 2 <= p.max ? 2 : -2;
      const abstand = Math.abs((senkrecht ? q.x : q.y) - a);
      const weg = (senkrecht ? q.x : q.y) > a ? 1 : -1; // Richtung von der Achse weg
      const quer =
        abstand >= 2
          ? -weg
          : (senkrecht ? q.x : q.y) + weg >= 0 && (senkrecht ? q.x : q.y) + weg <= p.max
            ? weg
            : -weg;
      const b: Punkt = senkrecht ? { x: q.x, y: q.y + laengs } : { x: q.x + laengs, y: q.y };
      const c: Punkt = senkrecht
        ? { x: q.x + quer, y: q.y + laengs / 2 }
        : { x: q.x + laengs / 2, y: q.y + quer };
      teile.push(
        vieleck(
          [q, b, c].map((s) => [ks.px(s.x), ks.py(s.y)] as const),
          true,
        ),
      );
      name = 'A';
    }
    teile.push(punktSvg(ks.px(q.x), ks.py(q.y), name));
    const richtig = pkt(bildPunkt.x, bildPunkt.y);
    const achse = de(senkrecht ? `x = ${a}` : `y = ${a}`);
    const falscheAchse = senkrecht ? { x: q.x, y: 2 * a - q.y } : { x: 2 * a - q.x, y: q.y };
    return {
      platzhalter: { punkt: de(`${name}${P(q)}`), achse },
      bild: bild(
        ks.breite,
        ks.hoehe,
        teile,
        de(
          `Ein Koordinatensystem von 0 bis ${p.max}. Eine ${senkrecht ? 'senkrechte' : 'waagerechte'} Spiegelachse verläuft bei ${achse.de}. ${p.figur ? 'Ein Dreieck mit dem Eckpunkt' : 'Der Punkt'} ${name}${P(q)}.`,
        ),
      ),
      loesung: richtig,
      loesungsweg: [
        de(`${name} ist ${Math.abs((senkrecht ? q.x : q.y) - a)} Kästchen von der Achse entfernt.`),
        de(`Gleich weit auf der anderen Seite: ${name}′${P(bildPunkt)}`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['nicht-gespiegelt', pkt(q.x, q.y)],
        ['auf-die-achse', pkt(senkrecht ? a : q.x, senkrecht ? q.y : a)],
        [
          'falsche-achse',
          falscheAchse.x >= 0 &&
          falscheAchse.y >= 0 &&
          falscheAchse.x <= p.max &&
          falscheAchse.y <= p.max
            ? pkt(falscheAchse.x, falscheAchse.y)
            : undefined,
        ],
      ]),
    };
  },
};

export interface VerschiebenParameter {
  readonly max: number; // 8 … 15
}

/** „P(2|3) wird nach P′(6|4) verschoben. Wohin kommt Q(1|5)?“ – Vorlage M.RF.SY.BEWEGUNGEN.VERSCHIEBUNG */
export const verschiebung: Generator<VerschiebenParameter> = {
  id: 'sy.verschiebung',
  version: 1,
  platzhalter: ['p', 'p_bild', 'q'],
  fehlerbildIds: ['nur-x-verschoben', 'falsche-richtung', 'auf-p-bild-gesetzt'],

  erzeuge(seed, p) {
    verlange(p.max >= 8 && p.max <= 15, 'max: 8 … 15');
    const r = rng(seed);
    let dx = r.int(-4, 4);
    const dy = r.int(-4, 4);
    if (dx === 0 && dy === 0) dx = 3;
    const im = (d: number) => r.int(Math.max(0, -d), Math.min(p.max, p.max - d));
    const P1: Punkt = { x: im(dx), y: im(dy) };
    let Q: Punkt = { x: im(dx), y: im(dy) };
    for (let v = 0; v < 20 && Q.x === P1.x && Q.y === P1.y; v++) Q = { x: im(dx), y: im(dy) };
    const richtig = pkt(Q.x + dx, Q.y + dy);
    return {
      platzhalter: { p: de(P(P1)), p_bild: de(P({ x: P1.x + dx, y: P1.y + dy })), q: de(P(Q)) },
      loesung: richtig,
      loesungsweg: [
        de(
          `Von P nach P′: ${dx >= 0 ? `${dx} nach rechts` : `${-dx} nach links`}, ${dy >= 0 ? `${dy} nach oben` : `${-dy} nach unten`}.`,
        ),
        de(`Q wird genauso verschoben: Q′${P({ x: Q.x + dx, y: Q.y + dy })}`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['nur-x-verschoben', pkt(Q.x + dx, Q.y)],
        ['falsche-richtung', Q.x - dx >= 0 && Q.y - dy >= 0 ? pkt(Q.x - dx, Q.y - dy) : undefined],
        ['auf-p-bild-gesetzt', pkt(P1.x + dx, P1.y + dy)],
      ]),
    };
  },
};
