// Ähnlichkeit, Niveau E – Klasse 8 (K-31): Begründungen auswählen. Streckfaktor aus Original und
// Bild, ähnliche Dreiecke über Winkel, Flächen und Volumen beim Strecken.
import { zahlText } from '../../../core/learning/text';
import { aussagenGenerator } from '../../aussagen';

const t = (x: number) => zahlText(Math.round(x * 1000) / 1000);

/** „Original 4 cm, Bild 12 cm: Welche Aussage über den Streckfaktor stimmt?“ (M.RF.AE.STRECKUNG.BEGRUENDEN) */
export const aeStreckfaktorAussage = aussagenGenerator(
  'ae.streckfaktor-aussage',
  ['kehrwert', 'gleich-viel-dazu', 'streckzentrum'],
  ['original', 'bild'],
  (r) => {
    const k = r.pick([2, 3, 0.5]);
    const a = k === 0.5 ? 2 * r.int(3, 9) : r.int(3, 9);
    const b = a * k;
    const d = Math.abs(b - a);
    return {
      situation: `Eine Strecke ist ${a} cm lang, ihr Bild bei einer zentrischen Streckung ${t(b)} cm.`,
      werte: { original: a, bild: b },
      richtig: `k = ${t(b)} : ${a} = ${t(k)}, denn jede Bildlänge ist das ${t(k)}-Fache der Originallänge.`,
      falsch: [
        [
          'kehrwert',
          `k = ${a} : ${t(b)} = ${t(1 / k)}, denn man teilt das Original durch das Bild.`,
        ],
        [
          'gleich-viel-dazu',
          k > 1
            ? `k = ${t(b)} − ${a} = ${t(d)}, denn zu jeder Länge kommen ${t(d)} cm dazu.`
            : `k = ${a} − ${t(b)} = ${t(d)}, denn von jeder Länge kommen ${t(d)} cm weg.`,
        ],
        [
          'streckzentrum',
          'Das kann man nicht sagen: Der Streckfaktor hängt davon ab, wo das Streckzentrum liegt.',
        ],
      ],
      weg: [
        'Der Streckfaktor sagt, mit welcher Zahl jede Länge malgenommen wird: k = Bild : Original.',
        `${t(b)} : ${a} = ${t(k)}. ${k > 1 ? 'k > 1: vergrößert.' : 'k zwischen 0 und 1: verkleinert.'}`,
      ],
    };
  },
);

/** „Sind die Dreiecke ähnlich?“ – über zwei Winkel (M.RF.AE.AEHNLICH.BEGRUENDEN) */
export const aeAehnlichAussage = aussagenGenerator(
  'ae.aehnlich-aussage',
  ['ein-winkel-reicht', 'groesse'],
  ['alpha', 'beta', 'gamma2', 'delta2'],
  (r) => {
    const alpha = 5 * r.int(6, 14);
    const beta = 5 * r.int(6, 14);
    const gamma = 180 - alpha - beta;
    const aehnlich = r.int(0, 1) === 0;
    // Dreieck 2: bei ähnlichen zwei Winkel des ersten (β und γ), sonst nur α gleich
    // Nicht ähnlich: zweiter Winkel weicht ab, darf aber nicht zufällig gleich γ sein
    const abw = [10, 15, 20].find((x) => beta + x !== gamma) ?? 10;
    const zweiter = aehnlich ? [beta, gamma] : [alpha, beta + abw];
    const dritter = 180 - (zweiter[0] ?? 0) - (zweiter[1] ?? 0);
    const kleiner = r.pick(['doppelt so groß', 'halb so groß']);
    return {
      situation: `Dreieck 1 hat die Winkel ${alpha}° und ${beta}°. Dreieck 2 ist ${kleiner} und hat die Winkel ${zweiter[0]}° und ${zweiter[1]}°. Sind die Dreiecke ähnlich?`,
      werte: { alpha, beta, gamma2: zweiter[0] ?? 0, delta2: zweiter[1] ?? 0 },
      richtig: aehnlich
        ? `Ja. Beide haben die Winkel ${alpha}°, ${beta}° und ${gamma}°. Stimmen zwei Winkel überein, sind Dreiecke ähnlich.`
        : `Nein. Dreieck 1 hat ${alpha}°, ${beta}° und ${gamma}°, Dreieck 2 hat ${zweiter[0]}°, ${zweiter[1]}° und ${dritter}°. Nur ein Winkel stimmt überein.`,
      falsch: aehnlich
        ? [
            ['ein-winkel-reicht', 'Das lässt sich nicht sagen: Es fehlen die Seitenlängen.'],
            ['groesse', `Nein, denn Dreieck 2 ist ${kleiner}.`],
          ]
        : [
            ['ein-winkel-reicht', `Ja, denn beide haben einen Winkel von ${alpha}°.`],
            ['groesse', `Nein, denn Dreieck 2 ist ${kleiner}. Ähnliche Dreiecke sind gleich groß.`],
          ],
      weg: [
        'Berechne in beiden Dreiecken den dritten Winkel: 180° minus die beiden anderen.',
        aehnlich
          ? `Dreieck 2: 180° − ${zweiter[0]}° − ${zweiter[1]}° = ${dritter}°. Alle Winkel stimmen überein: ähnlich, egal wie groß.`
          : `Dreieck 1: ${gamma}°, Dreieck 2: ${dritter}°. Die Winkel sind verschieden: nicht ähnlich.`,
      ],
    };
  },
);

/** „Ein Dreieck mit 6 cm² wird mit k = 3 gestreckt. Wie groß ist das Bild?“ (M.RF.AE.BERECHNEN.BEGRUENDEN) */
export const aeFlaecheVolumenAussage = aussagenGenerator(
  'ae.flaeche-volumen-aussage',
  ['gleicher-faktor', 'falsche-hochzahl', 'gleich-viel-dazu'],
  ['k', 'wert', 'volumen'],
  (r) => {
    const k = r.pick([2, 3]);
    const volumen = r.int(0, 1) === 1;
    const x = r.int(3, 9); // ab 3: k · x und x + k sind nie gleich
    const hoch = volumen ? 3 : 2;
    const e = volumen ? 'cm³' : 'cm²';
    const was = volumen ? 'Ein Quader hat das Volumen' : 'Ein Dreieck hat den Flächeninhalt';
    return {
      situation:
        `${was} ${x} ${e}. Er wird mit dem Streckfaktor k = ${k} vergrößert. Welche Aussage stimmt?`.replace(
          'Er wird',
          volumen ? 'Er wird' : 'Es wird',
        ),
      werte: { k, wert: x, volumen: volumen ? 1 : 0 },
      richtig: `Das Bild hat ${k ** hoch * x} ${e}, denn ${volumen ? 'ein Volumen' : 'eine Fläche'} wächst mit k${volumen ? '³' : '²'}.`,
      falsch: [
        ['gleicher-faktor', `Das Bild hat ${k * x} ${e}, denn alles wird ${k}-mal so groß.`],
        [
          'falsche-hochzahl',
          `Das Bild hat ${k ** (volumen ? 2 : 3) * x} ${e}, denn ${volumen ? 'es' : 'sie'} wächst mit k${volumen ? '²' : '³'}.`,
        ],
        ['gleich-viel-dazu', `Das Bild hat ${x + k} ${e}, denn es kommt k dazu.`],
      ],
      weg: [
        volumen
          ? 'Beim Volumen werden drei Längen gestreckt: Faktor k · k · k = k³.'
          : 'Bei einer Fläche werden zwei Längen gestreckt: Faktor k · k = k².',
        `${k}${volumen ? '³' : '²'} · ${x} ${e} = ${k ** hoch * x} ${e}`,
      ],
    };
  },
);
