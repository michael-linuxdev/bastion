import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { rechneRational as rechne } from '../../testhilfen';
import {
  lgsLoesen,
  lgsSchritt,
  loesbarkeit,
  sachLoesen,
  sachSystem,
  schnittpunktAblesen,
} from './lgs';

// Parameter wie in den Vorlagen (content/…/M.SF.GS.*)
const T = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const optionen = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const auswahlL = (wert: number): Loesung => ({ typ: 'auswahl', wert });
const zahlL = (x: number): Loesung => ({ typ: 'zahl', wert: x });
const punktL = (x: number, y: number): Loesung => ({
  typ: 'punkt',
  wert: { x: x || 0, y: y || 0 },
});
const z = (v: number) =>
  v < 0 ? `(−${String(-v).replace('.', ',')})` : String(v).replace('.', ',');
const wert = (term: string, x: number, y = 0) =>
  rechne(term.replace(/x/g, z(x)).replace(/y/g, z(y)));
/** Gleichung „links = rechts“ als Koeffizienten [a, b, c] von a·x + b·y = c */
function koeffizienten(g: string): [number, number, number] {
  const [l = '', r = ''] = g.split(' = ');
  const d = (x: number, y: number) => wert(l, x, y) - wert(r, x, y);
  const d0 = d(0, 0);
  return [d(1, 0) - d0, d(0, 1) - d0, -d0];
}
const gleichungen = (i: Instanz) =>
  T(i, 'system').replace('(I) ', '').split('; (II) ').map(koeffizienten);
/** Lösung per Cramerscher Regel */
function loese([a1, b1, c1]: number[], [a2, b2, c2]: number[]) {
  const d = (a1 ?? 0) * (b2 ?? 0) - (a2 ?? 0) * (b1 ?? 0);
  return {
    d,
    x: ((c1 ?? 0) * (b2 ?? 0) - (c2 ?? 0) * (b1 ?? 0)) / d,
    y: ((a1 ?? 0) * (c2 ?? 0) - (a2 ?? 0) * (c1 ?? 0)) / d,
  };
}

pflichttests(schnittpunktAblesen, {
  niveaus: { G: { halbe: false }, M: { halbe: true } },
  unabhaengigeLoesung(i) {
    // aus dem Bild: die beiden dicken Linien schneiden
    const re = /<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)" stroke-width="3"\/>/g;
    const kx = (p: string) => (Number(p) - 20) / 26 - 6;
    const ky = (p: string) => 6 - (Number(p) - 20) / 26;
    const g = [...(i.bild?.svg ?? '').matchAll(re)].map((m) => {
      const [x1, y1, x2, y2] = [kx(m[1] ?? ''), ky(m[2] ?? ''), kx(m[3] ?? ''), ky(m[4] ?? '')];
      const m1 = (y2 - y1) / (x2 - x1);
      return [-m1, 1, y1 - m1 * x1];
    });
    const s = loese(g[0] ?? [], g[1] ?? []);
    return punktL(Math.round(s.x * 100) / 100, Math.round(s.y * 100) / 100);
  },
  grenzverletzungen(i) {
    const [g1 = [], g2 = []] = gleichungen(i);
    const s = loese(g1, g2);
    return Math.abs(s.x) <= 5 && Math.abs(s.y) <= 5 ? [] : ['Schnittpunkt außerhalb'];
  },
  mindestensVerschieden: { G: 90, M: 90 },
});

pflichttests(loesbarkeit, {
  niveaus: { G: { allgemein: false }, M: { allgemein: true } },
  unabhaengigeLoesung(i) {
    const [[a1 = 0, b1 = 0, c1 = 0] = [], [a2 = 0, b2 = 0, c2 = 0] = []] = gleichungen(i);
    if (Math.abs(a1 * b2 - a2 * b1) > 1e-9) return auswahlL(0);
    // parallel oder gleich: (II) ist Vielfaches von (I)?
    const f = Math.abs(a1) > 1e-9 ? a2 / a1 : b2 / b1;
    return auswahlL(Math.abs(c2 - f * c1) < 1e-9 ? 2 : 1);
  },
  grenzverletzungen: (i, p) =>
    !p.allgemein && !T(i, 'system').startsWith('(I) y = ') ? ['G nicht nach y aufgelöst'] : [],
  mindestensVerschieden: { G: 90, M: 95 },
});

pflichttests(lgsLoesen, {
  niveaus: { G: { addition: false }, M: { addition: true } },
  unabhaengigeLoesung(i) {
    const [g1 = [], g2 = []] = gleichungen(i);
    const s = loese(g1, g2);
    return punktL(s.x, s.y);
  },
  grenzverletzungen(i, p) {
    const [g1 = [], g2 = []] = gleichungen(i);
    const s = loese(g1, g2);
    const f: string[] = [];
    if (!Number.isInteger(s.x) || !Number.isInteger(s.y)) f.push('Lösung nicht ganz');
    if (!p.addition && !T(i, 'system').startsWith('(I) y = '))
      f.push('G: (I) nicht nach y aufgelöst');
    return f;
  },
  mindestensVerschieden: { G: 95, M: 95 },
});

pflichttests(lgsSchritt, {
  niveaus: { G: { addition: false }, M: { addition: true } },
  unabhaengigeLoesung(i, p) {
    const [[a1 = 0, b1 = 0, c1 = 0] = [], [a2 = 0, b2 = 0, c2 = 0] = []] = gleichungen(i);
    // richtig ist die Gleichung in x, die für alle x gleichwertig zur erwarteten ist
    const soll = p.addition
      ? (x: number) => (a1 + a2) * x - (c1 + c2)
      : (x: number) => a2 * x + b2 * (-a1 / b1) * x + b2 * (c1 / b1) - c2;
    return auswahlL(
      optionen(i).findIndex((o) => {
        if (o.includes('y')) return false;
        const [a, , c] = koeffizienten(o);
        const ist = (x: number) => a * x - c;
        // gleiche Gleichung (nicht nur gleiche Lösung): beide Seiten stimmen bis auf den Faktor 1
        return [0, 1, 5].every((x) => Math.abs(ist(x) - soll(x)) < 1e-9);
      }),
    );
  },
  grenzverletzungen: (i) => (optionen(i).length >= 3 ? [] : ['zu wenige Antworten']),
  mindestensVerschieden: { G: 90, M: 90 },
});

/** Zahlen und Werte je Stück aus der Sachaufgabe lesen */
function sachWerte(t: string): { n: number; w: number; px: number; py: number } {
  const zahlen = (re: RegExp) => Number(re.exec(t)?.[1] ?? NaN);
  if (t.includes('Hühner'))
    return { n: zahlen(/zusammen (\d+) Tiere/), w: zahlen(/mit (\d+) Beinen/), px: 2, py: 4 };
  if (t.includes('Münzen'))
    return { n: zahlen(/liegen (\d+) Münzen/), w: zahlen(/zusammen (\d+) €/), px: 2, py: 1 };
  if (t.includes('Autos'))
    return { n: zahlen(/zusammen (\d+) Fahrzeuge/), w: zahlen(/mit (\d+) Rädern/), px: 4, py: 2 };
  return {
    n: zahlen(/kauft (\d+) Eintrittskarten/),
    w: zahlen(/zahlt (\d+) €/),
    px: zahlen(/Erwachsene kostet (\d+) €/),
    py: zahlen(/Kinder (\d+) €/),
  };
}

pflichttests(sachSystem, {
  niveaus: { G: {}, M: {} },
  unabhaengigeLoesung(i) {
    const v = sachWerte(T(i, 'sache'));
    return auswahlL(
      optionen(i).findIndex((o) => {
        const [g1 = '', g2 = ''] = o.replace('(I) ', '').split('; (II) ');
        const [a1, b1, c1] = koeffizienten(g1);
        const [a2, b2, c2] = koeffizienten(g2);
        return a1 === 1 && b1 === 1 && c1 === v.n && a2 === v.px && b2 === v.py && c2 === v.w;
      }),
    );
  },
  grenzverletzungen: (i) => (optionen(i).length >= 3 ? [] : ['zu wenige Antworten']),
  mindestensVerschieden: { G: 95, M: 95 },
});

pflichttests(sachLoesen, {
  niveaus: { G: { ohne_system: false }, M: { ohne_system: true } },
  unabhaengigeLoesung(i) {
    const v = sachWerte(T(i, 'sache'));
    // Probieren: x Stück der ersten Art, n − x der zweiten
    let x = -1;
    for (let k = 0; k <= v.n; k++) if (v.px * k + v.py * (v.n - k) === v.w) x = k;
    const ersteArt = /^(Hühner|Erwachsene|2-€-Münzen|Autos)$/;
    const gefragt = /^Wie viele (.+) sind es\?$/.exec(T(i, 'frage'))?.[1] ?? '';
    return zahlL(ersteArt.test(gefragt) ? x : v.n - x);
  },
  grenzverletzungen: (i, p) =>
    p.ohne_system && T(i, 'sache').includes('(I)') ? ['System auf M angegeben'] : [],
  mindestensVerschieden: { G: 95, M: 95 },
});
