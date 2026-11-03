// Prozent, Niveau E – Klasse 7 (K-31): Grundwert, Grundaufgaben, „um“ und „auf“, Zinsen begründen.
import { aussagenGenerator } from '../../aussagen';

const dez = (x: number) => String(Math.round(x * 100) / 100).replace('.', ',');

/** „Welche Zahl ist der Grundwert?“ (M.ZO.PZ.BEGRIFFE.BEGRUENDEN) */
export const pzGrundwertBegriffAussage = aussagenGenerator(
  'pz.grundwert-begriff-aussage',
  ['teil-als-ganzes', 'satz-als-wert'],
  ['grund', 'prozent', 'kontext'],
  (r) => {
    const g = 100 * r.int(2, 8);
    const p = r.pick([5, 10, 20, 25, 50]);
    const w = (g * p) / 100;
    const kontext = r.int(0, 2);
    const texte = [
      `In einer Schule mit ${g} Kindern fahren ${p} % mit dem Rad. Das sind ${w} Kinder.`,
      `Von ${g} Losen sind ${p} % Gewinne, also ${w} Gewinnlose.`,
      `${w} von ${g} Plätzen im Kino sind besetzt, das sind ${p} %.`,
    ];
    return {
      situation: `${texte[kontext] ?? ''} Welche Zahl ist der Grundwert?`,
      werte: { grund: g, prozent: p, kontext },
      richtig: `${g}, denn der Grundwert ist das Ganze, von dem die Prozente genommen werden.`,
      falsch: [
        ['teil-als-ganzes', `${w}, denn der Grundwert ist die Zahl, die man ausrechnet.`],
        ['satz-als-wert', `${p}, denn der Grundwert steht beim Prozentzeichen.`],
      ],
      weg: [
        'Frage: Wovon werden die Prozente genommen? Das ist der Grundwert.',
        `Grundwert ${g}, Prozentsatz ${p} %, Prozentwert ${w}.`,
      ],
    };
  },
);

/** „p % sind W €. Grundwert = W · p?“ (M.ZO.PZ.GRUNDAUFGABEN.BEGRUENDEN) */
export const pzGrundwertAussage = aussagenGenerator(
  'pz.grundwert-aussage',
  ['grundaufgabe', 'falsch-herum-geteilt'],
  ['wert', 'prozent'],
  (r) => {
    const g = 20 * r.int(2, 20);
    const p = r.pick([10, 20, 25, 30, 40, 50]);
    const w = (g * p) / 100;
    return {
      situation: `${p} % eines Betrags sind ${w} €. Lisa sucht den ganzen Betrag und rechnet ${w} € · ${dez(p / 100)} = ${dez((w * p) / 100)} €. Stimmt das?`,
      werte: { wert: w, prozent: p },
      richtig: `Nein. Gesucht ist der Grundwert: G = W : p = ${w} € : ${dez(p / 100)} = ${g} €.`,
      falsch: [
        ['grundaufgabe', 'Ja. Prozentwert mal Prozentsatz ergibt den Grundwert.'],
        ['falsch-herum-geteilt', `Nein. Richtig ist G = ${dez(p / 100)} : ${w}.`],
      ],
      weg: [
        `Gegeben: W = ${w} € und p = ${p} %. Gesucht: G. Rechnung: G = W : p.`,
        `${w} : ${dez(p / 100)} = ${g}. Probe: ${p} % von ${g} € sind ${w} €.`,
      ],
    };
  },
);

/** „Von A auf B: um (100 + p) % gestiegen?“ (M.ZO.PZ.VERAENDERUNG.BEGRUENDEN) */
export const pzUmAufAussage = aussagenGenerator(
  'pz.um-auf-aussage',
  ['um-auf', 'falscher-grundwert'],
  ['alt', 'neu'],
  (r) => {
    const a = 20 * r.int(2, 10);
    const p = r.pick([10, 20, 25, 30, 40, 50]);
    const b = (a * (100 + p)) / 100;
    const aufNeu = Math.round(((b - a) / b) * 100);
    return {
      situation: `Ein Preis steigt von ${a} € auf ${b} €. Ben sagt: „Er ist um ${100 + p} % gestiegen.“ Stimmt das?`,
      werte: { alt: a, neu: b },
      richtig: `Nein. Der neue Preis ist ${100 + p} % des alten. Gestiegen ist er um ${p} %, denn ${b - a} € sind ${p} % von ${a} €.`,
      falsch: [
        ['um-auf', `Ja. ${b} : ${a} = ${dez(b / a)}, also um ${100 + p} %.`],
        [
          'falscher-grundwert',
          `Nein. Um etwa ${aufNeu} %, denn die Erhöhung wird auf den neuen Preis bezogen.`,
        ],
      ],
      weg: [
        `Änderung: ${b} € − ${a} € = ${b - a} €. Grundwert ist der alte Preis ${a} €.`,
        `${b - a} : ${a} = ${dez(p / 100)} = ${p} %. „Auf ${100 + p} %“ heißt „um ${p} %“.`,
      ],
    };
  },
);

/** „Zinsen für einige Monate = Kapital · Zinssatz?“ (M.ZO.PZ.ZINS.BEGRUENDEN) */
export const pzZeitraumAussage = aussagenGenerator(
  'pz.zeitraum-aussage',
  ['zeitraum', 'zeitraum-mal'],
  ['kapital', 'zinssatz', 'monate'],
  (r) => {
    const k = 1200 * r.int(1, 5);
    const p = r.int(1, 4);
    const m = r.pick([3, 4, 6, 9]);
    const jahr = (k * p) / 100;
    const zm = (jahr * m) / 12;
    return {
      situation: `Ole legt ${k} € für ${m} Monate zu ${p} % Zinsen an. Er rechnet: Zinsen = ${k} € · ${dez(p / 100)} = ${jahr} €. Stimmt das?`,
      werte: { kapital: k, zinssatz: p, monate: m },
      richtig: `Nein. Der Zinssatz gilt für ein Jahr. Für ${m} Monate gibt es ${jahr} € · ${m}/12 = ${zm} €.`,
      falsch: [
        ['zeitraum', 'Ja. Zinsen sind immer Kapital mal Zinssatz.'],
        ['zeitraum-mal', `Nein. Für ${m} Monate sind es ${jahr} € · ${m} = ${jahr * m} €.`],
      ],
      weg: [
        `Jahreszinsen: ${k} € · ${dez(p / 100)} = ${jahr} €.`,
        `${m} Monate sind ${m}/12 Jahr: ${jahr} € · ${m} : 12 = ${zm} €.`,
      ],
    };
  },
);
