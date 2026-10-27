import type { Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, verlange, zahl } from '../../hilfen';
import { aufKreis, bild, bogen, linie, text } from '../../svg';

export const BEZIEHUNGEN = [
  'Scheitelwinkel',
  'Nebenwinkel',
  'Stufenwinkel',
  'Wechselwinkel',
] as const;
type Beziehung = (typeof BEZIEHUNGEN)[number];

export interface WinkelpaarParameter {
  readonly beziehungen: readonly Beziehung[];
}

function pruefe(p: WinkelpaarParameter): boolean {
  verlange(p.beziehungen.length >= 2, 'beziehungen: mindestens zwei');
  verlange(
    p.beziehungen.every((b) => BEZIEHUNGEN.includes(b)),
    `beziehungen: nur ${BEZIEHUNGEN.join(', ')}`,
  );
  // Parallelen werden gezeichnet, sobald Stufen- oder Wechselwinkel vorkommen können.
  return p.beziehungen.some((b) => b === 'Stufenwinkel' || b === 'Wechselwinkel');
}

interface Paar {
  readonly alpha: number;
  readonly beziehung: Beziehung;
  readonly beta: number;
  readonly teile: string[];
  readonly beschreibung: string;
  readonly lageBeta: string; // „über der Geraden, rechts der Schnittgeraden“
}

/**
 * Eine Gerade (oder zwei Parallelen) wird von einer Schnittgeraden geschnitten.
 * α liegt am oberen Schnittpunkt S zwischen dem linken Strahl und dem Strahl
 * nach unten links; β liegt je nach Beziehung an S oder am unteren Schnittpunkt T.
 */
function zeichnePaar(r: Rng, beziehungen: readonly Beziehung[], parallelen: boolean): Paar {
  const alpha = r.int(8, 16) * 5; // 40° … 80°
  const beziehung = r.pick(beziehungen);
  const s: [number, number] = parallelen ? [190, 75] : [160, 115];
  const t: [number, number] = aufKreis(
    s[0],
    s[1],
    80 / Math.sin((alpha * Math.PI) / 180),
    alpha + 180,
  );
  const teile = [linie(10, s[1], 310, s[1])];
  if (parallelen) teile.push(linie(10, t[1], 310, t[1]));
  const oben = aufKreis(s[0], s[1], parallelen ? 60 : 100, alpha);
  const unten = parallelen
    ? aufKreis(t[0], t[1], 60, alpha + 180)
    : aufKreis(s[0], s[1], 100, alpha + 180);
  teile.push(linie(oben[0], oben[1], unten[0], unten[1]));
  const markiere = (
    ort: [number, number],
    von: number,
    bis: number,
    name: string,
    radius: number,
  ) => {
    teile.push(bogen(ort[0], ort[1], radius, von, bis));
    const [lx, ly] = aufKreis(ort[0], ort[1], radius + 16, (von + bis) / 2);
    teile.push(text(lx, ly + 5, name, 15));
  };
  markiere(s, 180, 180 + alpha, 'α', 26);
  const nebenUnten = r.int(0, 1) === 0;
  const lage: Record<Beziehung, [[number, number], number, number]> = {
    Scheitelwinkel: [s, 0, alpha],
    Nebenwinkel: nebenUnten ? [s, 180 + alpha, 360] : [s, alpha, 180],
    Stufenwinkel: [t, 180, 180 + alpha],
    Wechselwinkel: [t, 0, alpha],
  };
  const [ort, von, bis] = lage[beziehung];
  markiere(ort, von, bis, 'β', 20);
  const beta = beziehung === 'Nebenwinkel' ? 180 - alpha : alpha;
  // Die vier Winkelfelder an einem Schnittpunkt beginnen bei 0°, α, 180° und 180° + α.
  const lageBeta = `${von < 180 ? 'über' : 'unter'} der Geraden, ${von === 0 || von === 180 + alpha ? 'rechts' : 'links'} der Schnittgeraden`;
  return {
    alpha,
    beziehung,
    beta,
    teile,
    lageBeta,
    beschreibung:
      (parallelen
        ? 'Zwei parallele Geraden werden von einer dritten Geraden geschnitten.'
        : 'Zwei Geraden schneiden sich.') +
      ` Der Winkel α ist ${alpha}° groß. β ist der ${beziehung} von α.`,
  };
}

/** „α = 65°. Wie groß ist β?“ – Vorlage M.RF.GF.WINKELPAARE.GROESSE */
export const winkelpaarGroesse: Generator<WinkelpaarParameter> = {
  id: 'gf.winkelpaar-groesse',
  version: 1,
  platzhalter: ['alpha', 'beziehung'],
  fehlerbildIds: ['gleich-statt-ergaenzt', 'ergaenzt-statt-gleich'],

  erzeuge(seed, p) {
    const parallelen = pruefe(p);
    const r = rng(seed);
    const { alpha, beziehung, beta, teile, beschreibung } = zeichnePaar(
      r,
      p.beziehungen,
      parallelen,
    );
    const gleich = beziehung !== 'Nebenwinkel';
    const loesung = zahl(beta);
    return {
      platzhalter: { alpha, beziehung: de(beziehung) },
      bild: bild(320, 230, teile, de(beschreibung)),
      loesung,
      loesungsweg: [
        de(gleich ? `${beziehung} sind gleich groß.` : 'Nebenwinkel ergänzen sich zu 180°.'),
        de(gleich ? `β = α = ${alpha}°` : `β = 180° − ${alpha}° = ${beta}°`),
      ],
      fehlerbilder: fehlerbilderAus(loesung, [
        ['gleich-statt-ergaenzt', gleich ? undefined : zahl(alpha)],
        ['ergaenzt-statt-gleich', gleich ? zahl(180 - alpha) : undefined],
      ]),
    };
  },
};

/** „Welche Beziehung haben α und β?“ – Vorlage M.RF.GF.WINKELPAARE.BENENNEN */
export const winkelpaarBenennen: Generator<WinkelpaarParameter> = {
  id: 'gf.winkelpaar-benennen',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['scheitel-neben-verwechselt', 'stufen-wechsel-verwechselt'],

  erzeuge(seed, p) {
    const parallelen = pruefe(p);
    const r = rng(seed);
    const { alpha, beziehung, teile, lageBeta } = zeichnePaar(r, p.beziehungen, parallelen);
    const optionen = BEZIEHUNGEN.filter((b) => p.beziehungen.includes(b));
    const index = (b: Beziehung) => (optionen.includes(b) ? optionen.indexOf(b) : undefined);
    const tausch: Partial<Record<Beziehung, Beziehung>> = {
      Scheitelwinkel: 'Nebenwinkel',
      Nebenwinkel: 'Scheitelwinkel',
      Stufenwinkel: 'Wechselwinkel',
      Wechselwinkel: 'Stufenwinkel',
    };
    const verwechselt = tausch[beziehung];
    const falsch = verwechselt === undefined ? undefined : index(verwechselt);
    const loesung = auswahl(optionen.indexOf(beziehung));
    const amSelbenPunkt = beziehung === 'Scheitelwinkel' || beziehung === 'Nebenwinkel';
    return {
      platzhalter: {},
      bild: bild(
        320,
        230,
        teile,
        de(
          (parallelen
            ? 'Zwei parallele Geraden werden von einer dritten Geraden geschnitten.'
            : 'Zwei Geraden schneiden sich.') +
            ` α ist ${alpha}° groß und liegt am oberen Schnittpunkt unter der Geraden, links der Schnittgeraden. ` +
            `β liegt ${amSelbenPunkt ? 'am selben Schnittpunkt' : 'am unteren Schnittpunkt'}, ` +
            `${lageBeta}.`,
        ),
      ),
      optionen: optionen.map((b) => ({ text: de(b) })),
      loesung,
      loesungsweg: [de(ERKLAERUNG[beziehung]), de(`α und β sind ${beziehung}.`)],
      fehlerbilder: fehlerbilderAus(loesung, [
        [
          amSelbenPunkt ? 'scheitel-neben-verwechselt' : 'stufen-wechsel-verwechselt',
          falsch === undefined ? undefined : auswahl(falsch),
        ],
      ]),
    };
  },
};

const ERKLAERUNG: Record<Beziehung, string> = {
  Scheitelwinkel: 'Scheitelwinkel liegen sich am selben Schnittpunkt gegenüber.',
  Nebenwinkel:
    'Nebenwinkel liegen am selben Schnittpunkt nebeneinander und haben einen Schenkel gemeinsam.',
  Stufenwinkel:
    'Stufenwinkel liegen an verschiedenen Schnittpunkten an der gleichen Stelle (F-Form).',
  Wechselwinkel:
    'Wechselwinkel liegen an verschiedenen Schnittpunkten auf verschiedenen Seiten (Z-Form).',
};
