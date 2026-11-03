// Zufall, Niveau E – Klasse 8 (K-31): Zählen, Pfadregeln und Gegenereignis begründen.
import { aussagenGenerator } from '../../aussagen';

/** „Wie viele Möglichkeiten gibt es?“ (M.DZ.ZF.ZAEHLEN.BEGRUENDEN) */
export const zfZaehlenAussage = aussagenGenerator(
  'zf.zaehlen-aussage',
  ['addiert', 'stufe-vergessen'],
  ['a', 'b', 'c'],
  (r) => {
    const a = r.int(2, 5);
    const b = r.int(2, 4);
    const c = r.int(2, 4);
    return {
      situation: `Mia hat ${a} T-Shirts, ${b} Hosen und ${c} Mützen. Wie viele verschiedene Kombinationen aus je einem Teil kann sie anziehen?`,
      werte: { a, b, c },
      richtig: `${a} · ${b} · ${c} = ${a * b * c}, denn zu jedem T-Shirt passt jede Hose und zu jedem Paar jede Mütze.`,
      falsch: [
        ['addiert', `${a} + ${b} + ${c} = ${a + b + c}, denn man zählt alle Kleidungsstücke.`],
        ['stufe-vergessen', `${a} · ${b} = ${a * b}, denn die Mütze ändert die Kombination nicht.`],
      ],
      weg: [
        'Produktregel: Bei jeder Stufe kommen alle Möglichkeiten der nächsten Stufe dazu.',
        `${a} · ${b} = ${a * b} Paare, mal ${c} Mützen = ${a * b * c}.`,
      ],
    };
  },
);

/** „Zweimal mit Zurücklegen: Wie wahrscheinlich ist zweimal Rot?“ (M.DZ.ZF.BAUMDIAGRAMM.BEGRUENDEN) */
export const zfPfadAussage = aussagenGenerator(
  'zf.pfad-aussage',
  ['addiert', 'ohne-zuruecklegen'],
  ['rot', 'gesamt'],
  (r) => {
    const n = r.pick([5, 10]);
    const rot = r.int(2, n === 5 ? 3 : 4);
    return {
      situation: `In einer Urne liegen ${rot} rote und ${n - rot} blaue Kugeln. Lena zieht zweimal und legt die Kugel jedes Mal zurück. Wie groß ist die Wahrscheinlichkeit für zweimal Rot?`,
      werte: { rot, gesamt: n },
      richtig: `${rot}/${n} · ${rot}/${n} = ${rot * rot}/${n * n}, denn entlang eines Pfades wird multipliziert.`,
      falsch: [
        [
          'addiert',
          `${rot}/${n} + ${rot}/${n} = ${2 * rot}/${n}, denn beide Züge zählen zusammen.`,
        ],
        [
          'ohne-zuruecklegen',
          `${rot}/${n} · ${rot - 1}/${n - 1} = ${rot * (rot - 1)}/${n * (n - 1)}, denn beim zweiten Zug ist eine rote Kugel weniger da.`,
        ],
      ],
      weg: [
        `Mit Zurücklegen ist die Wahrscheinlichkeit für Rot bei jedem Zug ${rot}/${n}.`,
        `Pfadregel: ${rot}/${n} · ${rot}/${n} = ${rot * rot}/${n * n}.`,
      ],
    };
  },
);

/** „Was ist das Gegenereignis?“ (M.DZ.ZF.EREIGNISSE.BEGRUENDEN) */
export const zfGegenereignisAussage = aussagenGenerator(
  'zf.gegenereignis-aussage',
  ['grenze', 'ereignis-begriff'],
  ['k'],
  (r) => {
    const k = r.int(2, 5);
    const bis = (n: number) => Array.from({ length: n }, (_, i) => i + 1).join(', ');
    return {
      situation: `Beim Würfeln ist A: „Die Augenzahl ist größer als ${k}.“ Was ist das Gegenereignis von A?`,
      werte: { k },
      richtig: `„Die Augenzahl ist höchstens ${k}“, also {${bis(k)}}: alle Ergebnisse, die nicht zu A gehören.`,
      falsch: [
        ['grenze', `„Die Augenzahl ist kleiner als ${k}“, also {${bis(k - 1)}}.`],
        ['ereignis-begriff', `„Die Augenzahl ist ${k}“, denn das ist die Grenze.`],
      ],
      weg: [
        `A = {${Array.from({ length: 6 - k }, (_, i) => i + k + 1).join(', ')}}.`,
        `Das Gegenereignis enthält alle übrigen Ergebnisse: {${bis(k)}}. Die ${k} gehört dazu, weil sie nicht größer als ${k} ist.`,
      ],
    };
  },
);
