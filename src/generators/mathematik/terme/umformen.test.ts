import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { rechneRational as rechne } from '../../testhilfen';
import {
  ausmultiplizierenLuecke,
  ausmultiplizierenWahl,
  binomischLuecke,
  binomischWahl,
  gleichungKlammer,
  klammerAufloesen,
  ungleichungLoesung,
  ungleichungRand,
  zusammenfassen,
  zusammenfassenLuecke,
} from './umformen';

// Parameter wie in den Vorlagen (content/…/M.SF.TU.*)
const T = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const optionen = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const auswahlL = (wert: number): Loesung => ({ typ: 'auswahl', wert });
const zahlL = (x: number): Loesung => ({ typ: 'zahl', wert: Math.round(x * 1e6) / 1e6 || 0 });
const z = (v: number) =>
  v < 0 ? `(−${String(-v).replace('.', ',')})` : String(v).replace('.', ',');
/** Term mit x und y an einer Stelle auswerten */
const wert = (term: string, x: number, y = 0) =>
  rechne(term.replace(/x/g, z(x)).replace(/y/g, z(y)));
const STELLEN: readonly [number, number][] = [
  [-3, 2],
  [1, -4],
  [2, 5],
  [7, -1],
];
const gleichwertig = (a: string, b: string) =>
  STELLEN.every(([x, y]) => Math.abs(wert(a, x, y) - wert(b, x, y)) < 1e-9);
/** Zahl für ☐ aus „links = rechts“ (☐ kommt linear vor): Auswerten mit ☐ = 0 und ☐ = 1 */
function luecke(aufgabe: string): number {
  const [l = '', r = ''] = aufgabe.split(' = ');
  const d = (t: number, [x, y]: readonly [number, number]) =>
    wert(l.replace('☐', z(t)), x, y) - wert(r.replace('☐', z(t)), x, y);
  const st = STELLEN[2] ?? [2, 5];
  const d0 = d(0, st);
  const d1 = d(1, st);
  return d0 / (d0 - d1);
}

pflichttests(zusammenfassen, {
  niveaus: { G: { klammer: false }, M: { klammer: true } },
  unabhaengigeLoesung: (i) => auswahlL(optionen(i).findIndex((o) => gleichwertig(o, T(i, 'term')))),
  grenzverletzungen(i, p) {
    const f: string[] = [];
    if (optionen(i).filter((o) => gleichwertig(o, T(i, 'term'))).length !== 1)
      f.push('nicht genau eine richtige Antwort');
    if (!p.klammer && T(i, 'term').includes('(')) f.push('Klammer auf G');
    if (optionen(i).length < 3) f.push('zu wenige Antworten');
    return f;
  },
  mindestensVerschieden: { G: 90, M: 90 },
});

pflichttests(zusammenfassenLuecke, {
  niveaus: { G: { klammer: false }, M: { klammer: true } },
  unabhaengigeLoesung: (i) => zahlL(luecke(T(i, 'aufgabe'))),
  grenzverletzungen: (i, p) =>
    !p.klammer && T(i, 'aufgabe').includes('(') ? ['Klammer auf G'] : [],
  mindestensVerschieden: { G: 80, M: 80 },
});

pflichttests(ausmultiplizierenLuecke, {
  niveaus: { G: { erweitert: false }, M: { erweitert: true } },
  unabhaengigeLoesung: (i) => zahlL(luecke(T(i, 'aufgabe'))),
  grenzverletzungen: (i, p) =>
    !p.erweitert && /^−|\(−/.test(T(i, 'aufgabe').split(' = ')[0] ?? '')
      ? ['negativer Faktor auf G']
      : [],
  mindestensVerschieden: { G: 80, M: 90 },
});

pflichttests(ausmultiplizierenWahl, {
  niveaus: { G: { erweitert: false }, M: { erweitert: true } },
  unabhaengigeLoesung: (i) => auswahlL(optionen(i).findIndex((o) => gleichwertig(o, T(i, 'term')))),
  grenzverletzungen(i) {
    return optionen(i).filter((o) => gleichwertig(o, T(i, 'term'))).length === 1
      ? []
      : ['nicht genau eine richtige Antwort'];
  },
  mindestensVerschieden: { G: 80, M: 80 },
});

pflichttests(binomischLuecke, {
  niveaus: { G: { erweitert: false }, M: { erweitert: true } },
  unabhaengigeLoesung: (i) => zahlL(luecke(T(i, 'aufgabe'))),
  grenzverletzungen: (i, p) =>
    !p.erweitert && /·\(|2·x|3·x/.test(T(i, 'aufgabe').split(' = ')[0] ?? '')
      ? ['M-Fall auf G']
      : [],
  mindestensVerschieden: { G: 25, M: 50 },
});

pflichttests(binomischWahl, {
  niveaus: { G: { erweitert: false }, M: { erweitert: true } },
  unabhaengigeLoesung: (i) => auswahlL(optionen(i).findIndex((o) => gleichwertig(o, T(i, 'term')))),
  grenzverletzungen(i) {
    return optionen(i).filter((o) => gleichwertig(o, T(i, 'term'))).length === 1
      ? []
      : ['nicht genau eine richtige Antwort'];
  },
  mindestensVerschieden: { G: 15, M: 40 },
});

/** Lösung einer Gleichung in x durch Probieren über −20 … 20 */
const loesungen = (g: string) => {
  const [l = '', r = ''] = g.split(' = ');
  const t: number[] = [];
  for (let x = -20; x <= 20; x++) if (Math.abs(wert(l, x) - wert(r, x)) < 1e-9) t.push(x);
  return t;
};

pflichttests(gleichungKlammer, {
  niveaus: { G: { beidseitig: false }, M: { beidseitig: true } },
  unabhaengigeLoesung(i) {
    const l = loesungen(T(i, 'gleichung'));
    return zahlL(l.length === 1 ? (l[0] ?? NaN) : NaN);
  },
  grenzverletzungen: (i, p) =>
    !p.beidseitig && (T(i, 'gleichung').match(/\(/g) ?? []).length > 1
      ? ['zwei Klammern auf G']
      : [],
  mindestensVerschieden: { G: 90, M: 90 },
});

pflichttests(klammerAufloesen, {
  niveaus: { G: { beidseitig: false }, M: { beidseitig: true } },
  unabhaengigeLoesung(i) {
    // Die richtige Gleichung hat auf beiden Seiten dieselben Terme wie die Ausgangsgleichung
    const [l = '', r = ''] = T(i, 'gleichung').split(' = ');
    return auswahlL(
      optionen(i).findIndex((o) => {
        const [ol = '', or = ''] = o.split(' = ');
        return gleichwertig(ol, l) && gleichwertig(or, r);
      }),
    );
  },
  grenzverletzungen: (i) => (optionen(i).length >= 3 ? [] : ['zu wenige Antworten']),
  mindestensVerschieden: { G: 90, M: 90 },
});

/** Lösungsmenge einer Ungleichung als Prüffunktion */
function erfuellt(u: string, x: number): boolean {
  const m = /^(.+) ([<>≤≥]) (.+)$/.exec(u);
  if (!m) return false;
  const [, l = '', zeichen, r = ''] = m;
  const a = wert(l, x);
  const b = wert(r, x);
  return zeichen === '<' ? a < b : zeichen === '>' ? a > b : zeichen === '≤' ? a <= b : a >= b;
}

pflichttests(ungleichungLoesung, {
  niveaus: { G: { negativ: false }, M: { negativ: true } },
  unabhaengigeLoesung(i) {
    const u = T(i, 'ungleichung');
    const xs = Array.from({ length: 81 }, (_, k) => -20 + k / 2);
    return auswahlL(
      optionen(i).findIndex((o) => xs.every((x) => erfuellt(u, x) === erfuellt(o, x))),
    );
  },
  grenzverletzungen(i, p) {
    return !p.negativ && /^−|^\(−/.test(T(i, 'ungleichung')) ? ['negativer Faktor auf G'] : [];
  },
  laeufe: 2000,
  mindestensVerschieden: { G: 80, M: 90 },
});

pflichttests(ungleichungRand, {
  niveaus: { G: { negativ: false }, M: { negativ: true } },
  unabhaengigeLoesung(i) {
    const u = T(i, 'ungleichung');
    const xs = Array.from({ length: 41 }, (_, k) => -20 + k).filter((x) => erfuellt(u, x));
    return zahlL(T(i, 'welche') === 'größte' ? Math.max(...xs) : Math.min(...xs));
  },
  grenzverletzungen: () => [],
  mindestensVerschieden: { G: 80, M: 90 },
});
