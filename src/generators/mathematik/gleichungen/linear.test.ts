import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { rechneRational as rechne } from '../../testhilfen';
import {
  formelAnwenden,
  formelUmstellen,
  gleichungWaehlen,
  istLoesung,
  linearLoesen,
  raetselLoesen,
  termwert,
  umformung,
} from './linear';

// Parameter wie in den Vorlagen (content/…/M.SF.GL.*)
const T = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const zahlL = (x: number): Loesung => ({ typ: 'zahl', wert: Number(x.toFixed(6)) || 0 });
const k = (x: number) =>
  x < 0 ? `(${String(x).replace('-', '−').replace('.', ',')})` : String(x).replace('.', ',');
const einsetzen = (term: string, x: number) => term.replace(/x/g, k(x));
/** Lösung einer Gleichung in x durch Probieren über −20 … 20 */
function probiere(gleichung: string): number[] {
  const [links = '', rechts = ''] = gleichung.split('=');
  const treffer: number[] = [];
  for (let x = -20; x <= 20; x++)
    if (Math.abs(rechne(einsetzen(links, x)) - rechne(einsetzen(rechts, x))) < 1e-9)
      treffer.push(x);
  return treffer;
}
const wert = (i: Instanz) => (i.loesung.typ === 'zahl' ? i.loesung.wert : NaN);

pflichttests(termwert, {
  niveaus: { G: { erweitert: false }, M: { erweitert: true } },
  unabhaengigeLoesung: (i) => zahlL(rechne(einsetzen(T(i, 'term'), i.platzhalter['x'] as number))),
  grenzverletzungen(i, p) {
    const f: string[] = [];
    if (!p.erweitert && /[²(]/.test(T(i, 'term'))) f.push('Klammer oder Quadrat auf G');
    if (!p.erweitert && !Number.isInteger(i.platzhalter['x'])) f.push('x nicht ganz auf G');
    if (Math.abs(wert(i)) > 200) f.push('zu groß');
    return f;
  },
  mindestensVerschieden: { G: 90, M: 90 },
});

pflichttests(istLoesung, {
  niveaus: { G: { beidseitig: false }, M: { beidseitig: true } },
  unabhaengigeLoesung(i) {
    const x = i.platzhalter['x'] as number;
    return { typ: 'auswahl', wert: probiere(T(i, 'gleichung')).includes(x) ? 0 : 1 };
  },
  grenzverletzungen(i, p) {
    const f: string[] = [];
    if (probiere(T(i, 'gleichung')).length !== 1) f.push('nicht genau eine Lösung');
    if (!p.beidseitig && /x.*=.*x/.test(T(i, 'gleichung'))) f.push('x rechts auf G');
    return f;
  },
  mindestensVerschieden: { G: 90, M: 90 },
});

pflichttests(linearLoesen, {
  niveaus: { G: { formen: ['einfach'] }, M: { formen: ['beidseitig', 'klammer'] } },
  unabhaengigeLoesung(i) {
    const l = probiere(T(i, 'gleichung'));
    return l.length === 1 ? zahlL(l[0] ?? NaN) : zahlL(NaN);
  },
  grenzverletzungen(i, p) {
    const g = T(i, 'gleichung');
    const f: string[] = [];
    if (!p.formen.includes('beidseitig') && /=.*x/.test(g)) f.push('x rechts auf G');
    if (!Number.isInteger(wert(i)) || wert(i) === 0) f.push('Lösung');
    return f;
  },
  mindestensVerschieden: { G: 90, M: 90 },
});

pflichttests(umformung, {
  niveaus: { G: { beidseitig: false }, M: { beidseitig: true } },
  unabhaengigeLoesung(i) {
    // Die richtige Umformung macht aus „vorher“ eine Gleichung mit derselben Lösung
    // und derselben rechten Seite wie „nachher“: Wir prüfen jede Option.
    const vorher = T(i, 'vorher');
    const nachher = T(i, 'nachher');
    const [lv = '', rv = ''] = vorher.split('=');
    const [ln = '', rn = ''] = nachher.split('=');
    const passt = (i.optionen ?? []).findIndex((o) => {
      const s = (o.text?.de ?? '').replace(' auf beiden Seiten', '');
      const op = s[0];
      const teil = s.slice(2);
      const anwenden = (seite: string, x: number) => {
        const w = rechne(einsetzen(seite, x));
        const z = rechne(einsetzen(teil, x));
        return op === '+' ? w + z : op === '−' ? w - z : op === ':' ? w / z : w * z;
      };
      return [-3, 1, 2, 7].every(
        (x) =>
          Math.abs(anwenden(lv, x) - rechne(einsetzen(ln, x))) < 1e-9 &&
          Math.abs(anwenden(rv, x) - rechne(einsetzen(rn, x))) < 1e-9,
      );
    });
    return { typ: 'auswahl', wert: passt };
  },
  grenzverletzungen(i, p) {
    return !p.beidseitig && /=.*x/.test(T(i, 'vorher')) ? ['x rechts auf G'] : [];
  },
  mindestensVerschieden: { G: 90, M: 90 },
});

pflichttests(formelUmstellen, {
  niveaus: { G: { erweitert: false }, M: { erweitert: true } },
  unabhaengigeLoesung(i) {
    // Werte einsetzen: Die richtige Umstellung erfüllt die Formel für alle Testwerte
    const formel = T(i, 'formel');
    const nach = T(i, 'nach');
    const werte: Record<string, number> = {
      a: 3,
      b: 5,
      c: 4,
      g: 6,
      h: 7,
      s: 11,
      t: 2,
      u: 13,
      v: 9,
      A: 17,
      G: 8,
      V: 19,
    };
    const ersetze = (t: string, w: Record<string, number>) =>
      t.replace(/\b[a-zA-Z]\b/g, (n) => String(w[n] ?? NaN).replace('.', ','));
    const [ziel = '', rechts = ''] = formel.split(' = ');
    const w = { ...werte };
    w[ziel] = rechne(ersetze(rechts, w));
    const index = (i.optionen ?? []).findIndex((o) => {
      const [, ausdruck = ''] = (o.text?.de ?? '').split(' = ');
      return Math.abs(rechne(ersetze(ausdruck, w)) - (w[nach] ?? NaN)) < 1e-9;
    });
    return { typ: 'auswahl', wert: index };
  },
  grenzverletzungen(i, p) {
    const schwer = ['v = s : t', 'V = a · b · c', 'A = g · h : 2', 'u = 2 · a + 2 · b'];
    return !p.erweitert && schwer.includes(T(i, 'formel')) ? ['schwere Formel auf G'] : [];
  },
  mindestensVerschieden: { G: 4, M: 8 },
});

pflichttests(formelAnwenden, {
  niveaus: { G: { erweitert: false }, M: { erweitert: true } },
  unabhaengigeLoesung(i) {
    const t = T(i, 'aufgabe');
    const z = (n: string) => Number(new RegExp(`${n} = (\\d+)`).exec(t)?.[1]);
    if (t.includes('V = a · b · c')) return zahlL(z('V') / (z('a') * z('b')));
    if (t.includes('u = 2 · a')) return zahlL((z('u') - 2 * z('a')) / 2);
    if (t.includes('u = 4 · a')) return zahlL(z('u') / 4);
    if (t.includes('s = v · t')) return zahlL(z('s') / z('v'));
    return zahlL(z('A') / z('a'));
  },
  grenzverletzungen(i, p) {
    const t = T(i, 'aufgabe');
    const f: string[] = [];
    if (!p.erweitert && /a · b · c|2 · a \+/.test(t)) f.push('schwere Formel auf G');
    if (!Number.isInteger(wert(i)) || wert(i) < 2) f.push('Ergebnis');
    return f;
  },
  mindestensVerschieden: { G: 50, M: 70 },
});

pflichttests(gleichungWaehlen, {
  niveaus: { G: { erweitert: false }, M: { erweitert: true } },
  unabhaengigeLoesung(i) {
    // Die passende Gleichung hat genau die Lösung, die das Rätsel in Worten beschreibt:
    // Wir prüfen jede Option mit der Probe „in Worten“ gegen alle x in −20 … 20.
    const r = T(i, 'raetsel');
    const n = (r.match(/−?\d+/g) ?? []).map((z) => Number(z.replace('−', '-')));
    const fach: Record<string, number> = {
      Doppelte: 2,
      Dreifache: 3,
      Vierfache: 4,
      Fünffache: 5,
      Sechsfache: 6,
    };
    const a = fach[/das ([A-Za-zÄÖÜäöüß]+)/i.exec(r)?.[1] ?? ''] ?? NaN;
    const worte = (x: number): boolean => {
      if (r.startsWith('Das') && r.includes('vermehrt')) return a * x + (n[0] ?? 0) === n[1];
      if (r.startsWith('Das') && r.includes('vermindert')) return a * x - (n[0] ?? 0) === n[1];
      if (r.startsWith('Addiert') && r.includes('multipliziert'))
        return (x + (n[0] ?? 0)) * (n[1] ?? 0) === n[2];
      if (r.startsWith('Addiert')) return x + (n[0] ?? 0) === a * x;
      return x - (n[0] ?? 0) === n[1];
    };
    const index = (i.optionen ?? []).findIndex((o) => {
      for (let x = -20; x <= 20; x++) {
        const [l = '', re = ''] = (o.text?.de ?? '').split('=');
        const gilt = Math.abs(rechne(einsetzen(l, x)) - rechne(einsetzen(re, x))) < 1e-9;
        if (gilt !== worte(x)) return false;
      }
      return true;
    });
    return { typ: 'auswahl', wert: index };
  },
  grenzverletzungen(i, p) {
    return !p.erweitert && /−/.test(T(i, 'raetsel')) ? ['negative Zahl auf G'] : [];
  },
  mindestensVerschieden: { G: 90, M: 90 },
  zeitlimitMs: 20_000, // Probe jeder Option für x = −20 … 20, 10 000 Seeds; auf CI knapp über 5 s
});

pflichttests(raetselLoesen, {
  niveaus: { G: { erweitert: false }, M: { erweitert: true } },
  unabhaengigeLoesung(i) {
    // Probieren direkt in Worten (wie oben)
    const r = T(i, 'raetsel');
    const n = (r.match(/−?\d+/g) ?? []).map((z) => Number(z.replace('−', '-')));
    const fach: Record<string, number> = {
      Doppelte: 2,
      Dreifache: 3,
      Vierfache: 4,
      Fünffache: 5,
      Sechsfache: 6,
    };
    const a = fach[/das ([A-Za-zÄÖÜäöüß]+)/i.exec(r)?.[1] ?? ''] ?? NaN;
    for (let x = -30; x <= 30; x++) {
      const passt =
        r.startsWith('Das') && r.includes('vermehrt')
          ? a * x + (n[0] ?? 0) === n[1]
          : r.startsWith('Das')
            ? a * x - (n[0] ?? 0) === n[1]
            : r.includes('multipliziert')
              ? (x + (n[0] ?? 0)) * (n[1] ?? 0) === n[2]
              : r.startsWith('Addiert')
                ? x + (n[0] ?? 0) === a * x
                : x - (n[0] ?? 0) === n[1];
      if (passt) return zahlL(x);
    }
    return zahlL(NaN);
  },
  grenzverletzungen(i, p) {
    return !p.erweitert && (wert(i) <= 0 || /−/.test(T(i, 'raetsel'))) ? ['negativ auf G'] : [];
  },
  mindestensVerschieden: { G: 90, M: 90 },
});
