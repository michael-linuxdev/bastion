import { describe, expect, it } from 'vitest';
import { istGekuerzt, type Bruch } from '../../../core/learning/bruch';
import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { musterweg, pruefeSchritt } from '../../../core/learning/zwischenschritte';
import { pflichttests } from '../../pflichttests';
import {
  bruchAddSub,
  bruchDurchBruch,
  bruchDurchZahl,
  bruchMalBruch,
  bruchMalZahl,
  unechtZuDezimal,
  dezDurch,
  dezimalentwicklung,
  dezMal,
  ggt,
  kgv,
  periodenText,
  periodisch,
} from './rechnen';

// Parameter wie in den Vorlagen (content/…/M.ZO.BR.*, M.ZO.TB.GGT-KGV)
const B = (i: Instanz, n: string) => i.platzhalter[n] as Bruch;
const Z = (i: Instanz, n: string) => i.platzhalter[n] as number;
const zeichen = (i: Instanz) => (i.platzhalter['zeichen'] as Sprachobjekt).de;

/** Unabhängig: kürzen mit eigener Teilersuche statt ggT. */
function kuerze(z: number, n: number): Loesung {
  for (let t = Math.min(z, n); t > 1; t--)
    if (z % t === 0 && n % t === 0)
      return { typ: 'bruch', wert: { zaehler: z / t, nenner: n / t } };
  return { typ: 'bruch', wert: { zaehler: z, nenner: n } };
}

describe('kgV und ggT', () => {
  for (const [g, istGgt, M] of [
    [kgv, false, 30],
    [ggt, true, 60],
  ] as const) {
    pflichttests(g, {
      niveaus: { G: { zahl_max: 12 }, M: { zahl_max: M } },
      unabhaengigeLoesung(i) {
        const [a, b] = [Z(i, 'a'), Z(i, 'b')];
        if (istGgt) {
          for (let t = Math.min(a, b); t >= 1; t--)
            if (a % t === 0 && b % t === 0) return { typ: 'zahl', wert: t };
        }
        for (let v = Math.max(a, b); ; v++)
          if (v % a === 0 && v % b === 0) return { typ: 'zahl', wert: v };
      },
      grenzverletzungen(i, p) {
        const [a, b] = [Z(i, 'a'), Z(i, 'b')];
        return [a, b].filter((x) => x < 2 || x > p.zahl_max).map((x) => `${x} außerhalb`);
      },
      mindestensVerschieden: { G: 15, M: 40 },
    });
  }
});

describe('Brüche addieren und subtrahieren', () => {
  const NIVEAUS = {
    'G-gleich': { art: 'gleichnamig', nenner_max: 12, unecht: false },
    'M-gleich': { art: 'gleichnamig', nenner_max: 20, unecht: true },
    'G-ungleich': { art: 'vielfaches', nenner_max: 10, unecht: false },
    'M-ungleich': { art: 'beliebig', nenner_max: 12, unecht: true },
  } as const;
  pflichttests(bruchAddSub, {
    niveaus: NIVEAUS,
    unabhaengigeLoesung(i) {
      const [a, b] = [B(i, 'a'), B(i, 'b')];
      const z1 = a.zaehler * b.nenner;
      const z2 = b.zaehler * a.nenner;
      return kuerze(zeichen(i) === '+' ? z1 + z2 : z1 - z2, a.nenner * b.nenner);
    },
    grenzverletzungen(i, p) {
      const [a, b] = [B(i, 'a'), B(i, 'b')];
      const f: string[] = [];
      if (p.art === 'gleichnamig' && a.nenner !== b.nenner) f.push('nicht gleichnamig');
      if (p.art !== 'gleichnamig' && a.nenner === b.nenner) f.push('gleichnamig');
      if (p.art === 'vielfaches' && Math.max(a.nenner, b.nenner) % Math.min(a.nenner, b.nenner))
        f.push('kein Vielfaches');
      if (!p.unecht && (a.zaehler >= a.nenner || b.zaehler >= b.nenner)) f.push('unechter Bruch');
      if (!istGekuerzt(a) || !istGekuerzt(b)) f.push('Summand nicht gekürzt');
      if (zeichen(i) === '−' && a.zaehler * b.nenner <= b.zaehler * a.nenner) f.push('negativ');
      return f;
    },
    mindestensVerschieden: { 'G-gleich': 40, 'M-gleich': 70, 'G-ungleich': 40, 'M-ungleich': 80 },
  });

  it('Zwischenschritte: ein anderer gemeinsamer Nenner führt auch zum Ergebnis (§17)', () => {
    for (let seed = 0; seed < 500; seed++) {
      const p = NIVEAUS['M-ungleich'];
      const schritt = bruchAddSub.schritt;
      if (!schritt) throw new Error('keine Schritte');
      const kleinster = schritt(seed, p, 'nenner', {}).loesung;
      if (kleinster.typ !== 'zahl') throw new Error('Nenner ist keine Zahl');
      const nenner = { typ: 'zahl', wert: 2 * kleinster.wert } as const;
      const erster = schritt(seed, p, 'nenner', {});
      expect(erster.auchRichtig?.(nenner)).toBe(true);
      const bisher: Record<string, Loesung> = { nenner };
      for (const id of ['erster', 'zweiter', 'rechnen', 'kuerzen'])
        bisher[id] = schritt(seed, p, id, bisher).loesung;
      expect(bisher['kuerzen']).toEqual(bruchAddSub.erzeuge(seed, p).loesung);
      if (bisher['erster']?.typ === 'bruch') expect(bisher['erster'].wert.nenner).toBe(nenner.wert);
    }
  });

  it('Zwischenschritte bei gleichen Nennern: nur Zähler verrechnen und kürzen (§17)', () => {
    for (const niveau of ['G-gleich', 'M-gleich'] as const) {
      const p = NIVEAUS[niveau];
      for (let seed = 0; seed < 500; seed++) {
        const weg = musterweg(bruchAddSub, seed, p, ['rechnen', 'kuerzen']);
        const i = bruchAddSub.erzeuge(seed, p);
        expect(weg.at(-1)?.aufgabe.loesung).toEqual(i.loesung);
        const rechnen = weg[0]?.aufgabe;
        if (!rechnen || rechnen.loesung.typ !== 'bruch') throw new Error('kein Bruch');
        // Der Nenner bleibt der gemeinsame Nenner der Aufgabe
        expect(rechnen.loesung.wert.nenner).toBe(B(i, 'a').nenner);
        for (const f of rechnen.fehlerbilder)
          expect(pruefeSchritt(rechnen, f.antwort)).toEqual({ richtig: false, fehlerbild: f.id });
      }
    }
  });
});

describe('Brüche multiplizieren und dividieren', () => {
  const faelle = [
    [
      bruchMalZahl,
      true,
      'zahl',
      { G: { nenner_max: 10, zahl_max: 6 }, M: { nenner_max: 15, zahl_max: 12 } },
    ],
    [
      bruchMalBruch,
      true,
      'bruch',
      { G: { nenner_max: 6, zahl_max: 2 }, M: { nenner_max: 12, zahl_max: 2 } },
    ],
    [
      bruchDurchZahl,
      false,
      'zahl',
      { G: { nenner_max: 10, zahl_max: 6 }, M: { nenner_max: 15, zahl_max: 12 } },
    ],
    [
      bruchDurchBruch,
      false,
      'bruch',
      { G: { nenner_max: 6, zahl_max: 2 }, M: { nenner_max: 12, zahl_max: 2 } },
    ],
  ] as const;
  for (const [g, mal, mit, niveaus] of faelle) {
    pflichttests(g, {
      niveaus,
      unabhaengigeLoesung(i) {
        const a = B(i, 'a');
        const roh = i.platzhalter['b'];
        const b: Bruch = typeof roh === 'number' ? { zaehler: roh, nenner: 1 } : (roh as Bruch);
        return mal
          ? kuerze(a.zaehler * b.zaehler, a.nenner * b.nenner)
          : kuerze(a.zaehler * b.nenner, a.nenner * b.zaehler);
      },
      grenzverletzungen(i, p) {
        const a = B(i, 'a');
        const b = i.platzhalter['b'];
        const f: string[] = [];
        if (a.nenner > p.nenner_max || a.zaehler >= a.nenner) f.push('a außerhalb');
        if (mit === 'zahl' && (typeof b !== 'number' || b < 2 || b > p.zahl_max))
          f.push('Zahl außerhalb');
        if (mit === 'bruch' && (typeof b === 'number' || (b as Bruch).nenner > p.nenner_max))
          f.push('Bruch außerhalb');
        if (zeichen(i) !== (mal ? '·' : ':')) f.push('falsches Zeichen');
        return f;
      },
      mindestensVerschieden: mit === 'zahl' ? { G: 30, M: 60 } : { G: 40, M: 70 },
    });
  }
});

describe('Dezimalzahlen mal und geteilt', () => {
  for (const [g, mal] of [
    [dezMal, true],
    [dezDurch, false],
  ] as const) {
    pflichttests(g, {
      niveaus: { G: { stellen: 1, ziffern_max: 9 }, M: { stellen: 2, ziffern_max: 99 } },
      unabhaengigeLoesung(i) {
        const [a, b] = [Z(i, 'a'), Z(i, 'b')];
        return { typ: 'zahl', wert: Number((mal ? a * b : a / b).toFixed(6)) };
      },
      grenzverletzungen(i, p) {
        const f: string[] = [];
        for (const n of ['a', 'b']) {
          const x = Z(i, n);
          if (!(x > 0)) f.push(`${n} nicht positiv`);
          if (Number(x.toFixed(p.stellen + 2)) !== x) f.push(`${n} hat zu viele Stellen`);
        }
        const b = Z(i, 'b');
        if (Number.isInteger(b)) f.push('b ohne Komma');
        // Ziffernfolge ohne Komma
        const stellen = (String(b).split('.')[1] ?? '').length;
        if (Math.round(b * 10 ** stellen) > Math.max(p.ziffern_max, 99)) f.push('b zu groß');
        return f;
      },
      mindestensVerschieden: mal ? { G: 30, M: 80 } : { G: 50, M: 80 },
    });
  }
});

/** Wert einer Schreibweise wie „0,16̅“ als Bruch-Vergleich mit z/n; undefined = keine gültige Periode. */
function stimmtSchreibweise(t: string, b: Bruch): boolean {
  const m = /^(\d+),(\d*?)((?:\d̅)*)$/.exec(t);
  if (!m) return false;
  const [ganz, vor, strich] = [Number(m[1]), m[2] ?? '', (m[3] ?? '').replaceAll('̅', '')];
  const v = 10 ** vor.length;
  const p = 10 ** strich.length;
  // Wert = ganz + vor/v + strich/((p − 1)·v); bei leerer Periode endlich
  const nenner = strich ? (p - 1) * v : v;
  const zaehler = ganz * nenner + Number(vor || 0) * (strich ? p - 1 : 1) + Number(strich || 0);
  return zaehler * b.nenner === b.zaehler * nenner;
}

describe('Brüche in Dezimalzahlen', () => {
  pflichttests(unechtZuDezimal, {
    niveaus: {
      G: { nenner: [2, 4, 5, 10, 20, 25], unecht: true },
      M: { nenner: [2, 4, 5, 8, 10, 20, 25, 40, 50], unecht: true },
    },
    unabhaengigeLoesung(i) {
      const b = B(i, 'bruch');
      return { typ: 'zahl', wert: Number((b.zaehler / b.nenner).toFixed(6)) };
    },
    grenzverletzungen(i, p) {
      const b = B(i, 'bruch');
      const f: string[] = [];
      if (!p.nenner.includes(b.nenner)) f.push('Nenner nicht erlaubt');
      if (!p.unecht && b.zaehler >= b.nenner) f.push('unecht');
      if (!istGekuerzt(b)) f.push('nicht gekürzt');
      return f;
    },
    // gemessen: G 24, M 57 (G hat nur 39 mögliche Brüche)
    mindestensVerschieden: { G: 20, M: 50 },
  });

  pflichttests(periodisch, {
    niveaus: {
      G: { schreibweise: false, nenner_max: 12 },
      M: { schreibweise: true, nenner_max: 15 },
    },
    unabhaengigeLoesung(i, p) {
      const b = B(i, 'bruch');
      if (!p.schreibweise) {
        // endlich genau dann, wenn der gekürzte Nenner nur die Primfaktoren 2 und 5 hat
        let n = b.nenner;
        while (n % 2 === 0) n /= 2;
        while (n % 5 === 0) n /= 5;
        return { typ: 'auswahl', wert: n === 1 ? 0 : 1 };
      }
      const treffer = (i.optionen ?? []).findIndex(
        (o) => (o.text?.de.includes('̅') ?? false) && stimmtSchreibweise(o.text?.de ?? '', b),
      );
      return { typ: 'auswahl', wert: treffer };
    },
    grenzverletzungen(i, p) {
      const b = B(i, 'bruch');
      const f: string[] = [];
      if (b.nenner > p.nenner_max || b.zaehler >= b.nenner) f.push('Bruch außerhalb');
      if (p.schreibweise && (i.optionen?.length ?? 0) < 3) f.push('zu wenige Optionen');
      return f;
    },
    mindestensVerschieden: { G: 25, M: 25 },
  });
});

describe('Dezimalentwicklung – Einzelfälle', () => {
  it('kennt Vorperiode und Periode', () => {
    expect(periodenText(dezimalentwicklung({ zaehler: 1, nenner: 6 }))).toBe('0,1' + '6̅');
    expect(periodenText(dezimalentwicklung({ zaehler: 1, nenner: 3 }))).toBe('0,3̅');
    expect(dezimalentwicklung({ zaehler: 1, nenner: 7 }).periode).toBe('142857');
    expect(dezimalentwicklung({ zaehler: 3, nenner: 8 })).toEqual({
      ganz: 0,
      vor: '375',
      periode: '',
    });
  });
});
