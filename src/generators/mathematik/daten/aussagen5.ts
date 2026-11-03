// Daten, Niveau E – Klasse 5 (K-31): Durchschnitt begründen.
import { aussagenGenerator } from '../../aussagen';

const dez = (x: number) => String(Math.round(x * 100) / 100).replace('.', ',');

/** „Gleiche Werte nur einmal zählen?“ (M.DZ.DA.MITTELWERT.BEGRUENDEN) */
export const daMittelwertAussage = aussagenGenerator(
  'da.mittelwert-aussage',
  ['mittelwert-anzahl', 'zwischenergebnis'],
  ['n1', 'n2', 'n3', 'n4', 'n5'],
  (r) => {
    const n = r.pick([4, 5]);
    const noten = Array.from({ length: n }, () => r.int(1, 5));
    if (new Set(noten).size === n) noten[n - 1] = noten[0] ?? 1;
    const summe = noten.reduce((s, x) => s + x, 0);
    const k = new Set(noten).size;
    const werte = Object.fromEntries(
      [0, 1, 2, 3, 4].map((i) => [`n${i + 1}`, noten[i] ?? 0]),
    ) as Record<string, number>;
    return {
      situation: `Noten in einer Gruppe: ${noten.join(', ')}. Paul teilt die Summe ${summe} durch ${k}, weil ${k} verschiedene Noten vorkommen. Stimmt das?`,
      werte,
      richtig: `Nein. Jede Note zählt, auch doppelte: ${summe} : ${n} = ${dez(summe / n)}.`,
      falsch: [
        ['mittelwert-anzahl', 'Ja. Gleiche Noten zählt man nur einmal.'],
        ['zwischenergebnis', `Nein. Der Durchschnitt ist die Summe ${summe}.`],
      ],
      weg: [
        'Durchschnitt = Summe aller Werte : Anzahl aller Werte.',
        `${noten.join(' + ')} = ${summe}, ${summe} : ${n} = ${dez(summe / n)}`,
      ],
    };
  },
);
