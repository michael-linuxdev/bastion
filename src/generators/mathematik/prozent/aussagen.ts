// Prozent im Alltag, Niveau E – Klasse 8 (K-31): Rabatt und Aufschlag, Angebote vergleichen.
import { aussagenGenerator } from '../../aussagen';

const euro = (x: number) => (Math.round(x * 100) / 100).toFixed(2).replace('.', ',');
const dez = (x: number) => String(x).replace('.', ',');

/** „Erst p % billiger, dann p % teurer: wieder der alte Preis?“ (M.ZO.PZ.WIRTSCHAFT.BEGRUENDEN) */
export const pzRabattAussage = aussagenGenerator(
  'pz.rabatt-aussage',
  ['falscher-grundwert', 'richtung'],
  ['preis', 'prozent'],
  (r) => {
    const preis = r.pick([40, 60, 80, 120, 200]);
    const p = r.pick([10, 20, 25, 50]);
    const billig = (preis * (100 - p)) / 100;
    const ende = (billig * (100 + p)) / 100;
    return {
      situation: `Ein Rad kostet ${preis} €. Im Sommer wird es um ${p} % billiger, im Herbst um ${p} % teurer. Kostet es dann wieder ${preis} €?`,
      werte: { preis, prozent: p },
      richtig: `Nein, nur ${euro(ende)} €. Die ${p} % im Herbst beziehen sich auf den kleineren Preis ${euro(billig)} €.`,
      falsch: [
        ['falscher-grundwert', `Ja. Minus ${p} % und plus ${p} % heben sich auf.`],
        ['richtung', `Nein, es kostet mehr als vorher, denn der Aufschlag kommt zuletzt.`],
      ],
      weg: [
        `Sommer: ${preis} € · ${dez((100 - p) / 100)} = ${euro(billig)} €.`,
        `Herbst: ${euro(billig)} € · ${dez((100 + p) / 100)} = ${euro(ende)} €. Der Grundwert ist jetzt der Sommerpreis.`,
      ],
    };
  },
);

/** „Welche Packung ist günstiger?“ (M.ZO.PZ.ANGEBOTE.BEGRUENDEN) */
export const pzAngebotAussage = aussagenGenerator(
  'pz.angebot-aussage',
  ['packungsgroesse', 'nur-preis'],
  ['klein', 'gross'],
  (r) => {
    // Preis je 100 g in Cent: kleine Packung günstiger
    const klein = 10 * r.int(5, 14);
    const gross = klein + 10 * r.int(1, 4);
    const pk = (2 * klein) / 100;
    const pg = (5 * gross) / 100;
    return {
      situation: `Packung A: 200 g für ${euro(pk)} €. Packung B: 500 g für ${euro(pg)} €. Welche ist günstiger?`,
      werte: { klein, gross },
      richtig: `A: Sie kostet ${euro(klein / 100)} € je 100 g, B kostet ${euro(gross / 100)} € je 100 g.`,
      falsch: [
        ['packungsgroesse', 'B, denn große Packungen sind immer günstiger.'],
        ['nur-preis', `B, denn ${euro(pg)} € für 500 g ist mehr Ware fürs Geld als bei A.`],
      ],
      weg: [
        'Vergleiche den Preis für dieselbe Menge, zum Beispiel je 100 g.',
        `A: ${euro(pk)} € : 2 = ${euro(klein / 100)} €. B: ${euro(pg)} € : 5 = ${euro(gross / 100)} €.`,
      ],
    };
  },
);
