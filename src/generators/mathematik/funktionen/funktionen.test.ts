import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { rechneRational as rechne } from '../../testhilfen';
import {
  funktionswert,
  geradeAblesen,
  geradeBestimmen,
  gleichungZumGraph,
  graphAblesen,
  graphVerlauf,
  istFunktion,
  nullstelleAblesen,
  nullstelleBerechnen,
  punktAufGerade,
  tarif,
  tarifGleichung,
} from './funktionen';

// Parameter wie in den Vorlagen (content/…/M.SF.FK.*)
const T = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const optionen = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const auswahlL = (wert: number): Loesung => ({ typ: 'auswahl', wert });
const zahlL = (x: number): Loesung => ({ typ: 'zahl', wert: Math.round(x * 1e6) / 1e6 || 0 });
const z = (v: number) =>
  v < 0 ? `(−${String(-v).replace('.', ',')})` : String(v).replace('.', ',');
/** Deutsche Zahl („−2,5“, „12“) in eine Zahl */
const zahlAus = (t: string) => Number(t.replace('−', '-').replace(/\s/g, '').replace(',', '.'));
const ZAHL = '−?\\d+(?:,\\d+)?';
const wert = (term: string, x: number) => rechne(term.replace(/x/g, z(x)));

/** Dicke Linien (Graph) aus dem Bild, zurückgerechnet in Koordinaten (Raster 26, Rand 20, max 6) */
function graphStuecke(i: Instanz): [number, number, number, number][] {
  const svg = i.bild?.svg ?? '';
  const re = /<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)" stroke-width="3"\/>/g;
  const kx = (p: string) => (Number(p) - 20) / 26 - 6;
  const ky = (p: string) => 6 - (Number(p) - 20) / 26;
  return [...svg.matchAll(re)].map((m) => [
    kx(m[1] ?? ''),
    ky(m[2] ?? ''),
    kx(m[3] ?? ''),
    ky(m[4] ?? ''),
  ]);
}
const r2 = (x: number) => Math.round(x * 100) / 100;
/** m und n der (einzigen) Geraden im Bild */
function geradeAusBild(i: Instanz) {
  const [x1 = 0, y1 = 0, x2 = 1, y2 = 0] = graphStuecke(i)[0] ?? [];
  const m = r2((y2 - y1) / (x2 - x1));
  return { m, n: r2(y1 - m * x1) };
}
/** Wert des Polygonzugs an der Stelle x (undefined außerhalb) */
function zugWert(i: Instanz, x: number): number | undefined {
  for (const [x1, y1, x2, y2] of graphStuecke(i)) {
    if (x >= x1 - 1e-9 && x <= x2 + 1e-9) return y1 + ((y2 - y1) * (x - x1)) / (x2 - x1);
  }
  return undefined;
}
const stellen = (i: Instanz) => {
  const s = graphStuecke(i);
  const von = Math.round(s[0]?.[0] ?? 0);
  const bis = Math.round(s[s.length - 1]?.[2] ?? 0);
  return Array.from({ length: (bis - von) * 4 + 1 }, (_, k) => von + k / 4);
};

pflichttests(istFunktion, {
  niveaus: { G: { erweitert: false }, M: { erweitert: true } },
  unabhaengigeLoesung(i) {
    const t = T(i, 'zuordnung');
    let paare: [string, string][];
    if (t.startsWith('(')) {
      paare = [...t.matchAll(/\(([^|]+)\|([^)]+)\)/g)].map((m) => [m[1] ?? '', m[2] ?? '']);
    } else {
      const [xs = '', ys = ''] = t.replace('x: ', '').split(' – y: ');
      const y = ys.split(' | ');
      paare = xs.split(' | ').map((x, k) => [x, y[k] ?? '']);
    }
    const doppelt = paare.some(([x, y]) => paare.some(([x2, y2]) => x === x2 && y !== y2));
    return auswahlL(doppelt ? 1 : 0);
  },
  grenzverletzungen: (i, p) =>
    !p.erweitert && T(i, 'zuordnung').startsWith('(') ? ['Mengen auf G'] : [],
  mindestensVerschieden: { G: 95, M: 95 },
});

pflichttests(funktionswert, {
  niveaus: { G: { erweitert: false }, M: { erweitert: true } },
  unabhaengigeLoesung(i) {
    const a = T(i, 'aufgabe');
    const term = /^f\(x\) = (.+?)\. /.exec(a)?.[1] ?? '';
    const f = /Berechne f\((.+)\)\.$/.exec(a);
    if (f) return zahlL(wert(term, zahlAus(f[1] ?? '')));
    const w = zahlAus(new RegExp(`f\\(x\\) = (${ZAHL})\\?$`).exec(a)?.[1] ?? '');
    const xs = Array.from({ length: 81 }, (_, k) => k - 40).filter((x) => wert(term, x) === w);
    return zahlL(xs.length === 1 ? (xs[0] ?? NaN) : NaN);
  },
  grenzverletzungen: (i, p) =>
    !p.erweitert && /x²|Für welches/.test(T(i, 'aufgabe')) ? ['M-Fall auf G'] : [],
  mindestensVerschieden: { G: 95, M: 95 },
});

pflichttests(graphAblesen, {
  niveaus: { G: { extrem: false }, M: { extrem: true } },
  unabhaengigeLoesung(i, p) {
    const xs = stellen(i);
    const ys = xs.map((x) => zugWert(i, x) ?? NaN);
    if (p.extrem) {
      const ziel = T(i, 'frage').includes('höchste') ? Math.max(...ys) : Math.min(...ys);
      return zahlL(xs[ys.findIndex((y) => Math.abs(y - ziel) < 1e-6)] ?? NaN);
    }
    return zahlL(ys.filter((y) => Math.abs(y) < 1e-6).length);
  },
  grenzverletzungen(i) {
    const s = graphStuecke(i);
    return s.length >= 2 && s.every((t) => t.every((v) => Math.abs(v) <= 6 + 1e-6))
      ? []
      : ['Graph zu kurz oder außerhalb'];
  },
  mindestensVerschieden: { G: 70, M: 70 },
});

/** Bereich „für x > a“, „für x < a“, „überall“ als Prüffunktion */
function bereich(o: string): (x: number) => boolean {
  const m = new RegExp(`^für x ([<>]) (${ZAHL})$`).exec(o);
  if (!m) return () => true;
  const a = zahlAus(m[2] ?? '');
  return m[1] === '>' ? (x) => x > a : (x) => x < a;
}

pflichttests(graphVerlauf, {
  niveaus: { G: { bereich: false }, M: { bereich: true } },
  unabhaengigeLoesung(i, p) {
    if (!p.bereich) {
      const { m } = geradeAusBild(i);
      return auswahlL(m > 0 ? 0 : m < 0 ? 1 : 2);
    }
    const xs = stellen(i).filter((x) => Number.isInteger(x * 2) && !Number.isInteger(x));
    const faellt = (x: number) => (zugWert(i, x + 0.25) ?? 0) < (zugWert(i, x - 0.25) ?? 0);
    return auswahlL(optionen(i).findIndex((o) => xs.every((x) => bereich(o)(x) === faellt(x))));
  },
  grenzverletzungen: (i) => (optionen(i).length >= 2 ? [] : ['zu wenige Antworten']),
  mindestensVerschieden: { G: 20, M: 70 },
});

pflichttests(geradeAblesen, {
  niveaus: { G: { anstieg: false }, M: { anstieg: true } },
  unabhaengigeLoesung(i, p) {
    const { m, n } = geradeAusBild(i);
    return zahlL(p.anstieg ? m : n);
  },
  grenzverletzungen: (i) => (graphStuecke(i).length === 1 ? [] : ['nicht genau eine Gerade']),
  mindestensVerschieden: { G: 20, M: 40 },
});

pflichttests(gleichungZumGraph, {
  niveaus: { G: { anstieg: false }, M: { anstieg: true } },
  unabhaengigeLoesung(i) {
    const { m, n } = geradeAusBild(i);
    return auswahlL(
      optionen(i).findIndex((o) => {
        const term = o.replace(/^y = /, '');
        return Math.abs(wert(term, 0) - n) < 1e-6 && Math.abs(wert(term, 2) - (2 * m + n)) < 1e-6;
      }),
    );
  },
  grenzverletzungen: (i) => (optionen(i).length >= 3 ? [] : ['zu wenige Antworten']),
  mindestensVerschieden: { G: 40, M: 60 },
});

pflichttests(punktAufGerade, {
  niveaus: { G: {}, M: {} },
  unabhaengigeLoesung(i) {
    const [, x = '', y = ''] =
      new RegExp(`^P\\((${ZAHL})\\|(${ZAHL})\\)$`).exec(T(i, 'punkt')) ?? [];
    const term = T(i, 'gerade').replace(/^y = /, '');
    return auswahlL(wert(term, zahlAus(x)) === zahlAus(y) ? 0 : 1);
  },
  grenzverletzungen: () => [],
  mindestensVerschieden: { G: 95, M: 95 },
});

pflichttests(geradeBestimmen, {
  niveaus: { G: { zwei_punkte: false }, M: { zwei_punkte: true } },
  unabhaengigeLoesung(i) {
    const a = T(i, 'aufgabe');
    const punkte = [...a.matchAll(new RegExp(`\\((${ZAHL})\\|(${ZAHL})\\)`, 'g'))].map((m) => [
      zahlAus(m[1] ?? ''),
      zahlAus(m[2] ?? ''),
    ]);
    const [[x1 = 0, y1 = 0] = [], [x2 = 0, y2 = 0] = []] = punkte;
    if (punkte.length === 2) return zahlL((y2 - y1) / (x2 - x1));
    // „y = m·x + n“: m durch Einsetzen von x = 1 in den Teil vor „+ n“
    const m = wert(/y = (.+) \+ n/.exec(a)?.[1] ?? '', 1);
    return zahlL(y1 - m * x1);
  },
  grenzverletzungen: (i, p) =>
    !p.zwei_punkte && T(i, 'aufgabe').includes('Q(') ? ['zwei Punkte auf G'] : [],
  mindestensVerschieden: { G: 85, M: 90 },
});

pflichttests(nullstelleBerechnen, {
  niveaus: { G: { dezimal: false }, M: { dezimal: true } },
  unabhaengigeLoesung(i) {
    const term = T(i, 'funktion').replace(/^f\(x\) = /, '');
    const f0 = wert(term, 0);
    const f1 = wert(term, 1);
    return zahlL(-f0 / (f1 - f0));
  },
  grenzverletzungen(i, p) {
    const term = T(i, 'funktion').replace(/^f\(x\) = /, '');
    const x0 = -wert(term, 0) / (wert(term, 1) - wert(term, 0));
    return !p.dezimal && !Number.isInteger(x0) ? ['Komma-Nullstelle auf G'] : [];
  },
  mindestensVerschieden: { G: 70, M: 80 },
});

pflichttests(nullstelleAblesen, {
  niveaus: { G: {}, M: {} },
  unabhaengigeLoesung(i) {
    const { m, n } = geradeAusBild(i);
    return zahlL(-n / m);
  },
  grenzverletzungen: () => [],
  mindestensVerschieden: { G: 20, M: 20 },
});

/** Alle Euro-Beträge im Text */
const betraege = (t: string) =>
  [...t.matchAll(new RegExp(`(${ZAHL}) €`, 'g'))].map((m) => zahlAus(m[1] ?? ''));

pflichttests(tarif, {
  niveaus: { G: { vergleich: false }, M: { vergleich: true } },
  unabhaengigeLoesung(i) {
    const a = T(i, 'aufgabe');
    const [g1 = 0, p1 = 0, g2 = 0, p2 = 0] = betraege(a);
    const menge = /Was kosten (\d+) /.exec(a);
    if (menge) return zahlL(g1 + p1 * Number(menge[1]));
    for (let x = 0; x < 200; x++) if (g1 + p1 * x < g2 + p2 * x) return zahlL(x);
    return zahlL(NaN);
  },
  grenzverletzungen: (i, p) =>
    !p.vergleich && T(i, 'aufgabe').includes('Tarif B') ? ['Vergleich auf G'] : [],
  mindestensVerschieden: { G: 90, M: 90 },
});

pflichttests(tarifGleichung, {
  niveaus: { G: {}, M: {} },
  unabhaengigeLoesung(i) {
    const [g = 0, p = 0] = betraege(T(i, 'tarif'));
    return auswahlL(
      optionen(i).findIndex((o) => {
        const term = o.replace(/^y = /, '');
        return Math.abs(wert(term, 0) - g) < 1e-9 && Math.abs(wert(term, 1) - (g + p)) < 1e-9;
      }),
    );
  },
  grenzverletzungen: (i) => (optionen(i).length >= 3 ? [] : ['zu wenige Antworten']),
  mindestensVerschieden: { G: 20, M: 20 },
});
