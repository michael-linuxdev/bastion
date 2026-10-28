import { describe, expect, it } from 'vitest';
import type { Bruch } from '../../../core/learning/bruch';
import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  anteilVergleich,
  flaechenanteil,
  gleichungBruchMal,
  gleichungBruchPlus,
  natuerlich,
  sachAnteil,
  sachPreis,
  termBruchKlammer,
  termBruchPunkt,
  termDezimal,
  zahlbereichAussage,
} from './anwenden';

// Parameter wie in den Vorlagen (content/…/M.ZO.BR.*, M.SF.BR.GLEICHUNGEN)
const B = (i: Instanz, n: string) => i.platzhalter[n] as Bruch;
const T = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const zahlAus = (t: string) => Number(t.replace(/\s/g, '').replace(',', '.'));

/** Unabhängig: kürzen mit eigener Teilersuche. */
function kuerze(z: number, n: number): Loesung {
  for (let t = Math.min(z, n); t > 1; t--)
    if (z % t === 0 && n % t === 0)
      return { typ: 'bruch', wert: { zaehler: z / t, nenner: n / t } };
  return { typ: 'bruch', wert: { zaehler: z, nenner: n } };
}
const runde = (x: number) => Number(x.toFixed(6));

describe('Geschickt rechnen', () => {
  pflichttests(termDezimal, {
    niveaus: {
      G: { arten: ['punkt-vor-strich', 'quadrat'], zehntel_max: 50 },
      M: { arten: ['punkt-vor-strich', 'klammer', 'quadrat'], zehntel_max: 99 },
    },
    unabhaengigeLoesung(i) {
      // Term zurücklesen und nach den Vorrangregeln ausrechnen
      const t = T(i, 'term');
      let m = /^(.+)²$/.exec(t);
      if (m) return { typ: 'zahl', wert: runde(zahlAus(m[1] ?? '') ** 2) };
      m = /^\((.+) \+ (.+)\) · (\d+)$/.exec(t);
      if (m)
        return {
          typ: 'zahl',
          wert: runde((zahlAus(m[1] ?? '') + zahlAus(m[2] ?? '')) * Number(m[3])),
        };
      m = /^(.+) ([+−]) (.+) · (\d+)$/.exec(t);
      if (!m) throw new Error(`Term nicht lesbar: ${t}`);
      const produkt = zahlAus(m[3] ?? '') * Number(m[4]);
      const a = zahlAus(m[1] ?? '');
      return { typ: 'zahl', wert: runde(m[2] === '+' ? a + produkt : a - produkt) };
    },
    grenzverletzungen(i, p) {
      const t = T(i, 'term');
      const f: string[] = [];
      if (t.startsWith('(') && !p.arten.includes('klammer')) f.push('Klammer nicht erlaubt');
      if (t.endsWith('²') && !p.arten.includes('quadrat')) f.push('Quadrat nicht erlaubt');
      if (i.loesung.typ === 'zahl' && i.loesung.wert < 0) f.push('negativ');
      return f;
    },
    mindestensVerschieden: { G: 60, M: 70 },
  });

  for (const [g, klammer] of [
    [termBruchPunkt, false],
    [termBruchKlammer, true],
  ] as const) {
    pflichttests(g, {
      niveaus: { G: { nenner_max: 8, faktor_max: 5 }, M: { nenner_max: 12, faktor_max: 9 } },
      unabhaengigeLoesung(i) {
        const [a, b] = [B(i, 'a'), B(i, 'b')];
        const k = i.platzhalter['k'] as number;
        return klammer
          ? kuerze((a.zaehler + b.zaehler) * k, a.nenner)
          : kuerze(a.zaehler + b.zaehler * k, a.nenner);
      },
      grenzverletzungen(i, p) {
        const [a, b] = [B(i, 'a'), B(i, 'b')];
        const k = i.platzhalter['k'] as number;
        const f: string[] = [];
        if (a.nenner !== b.nenner) f.push('nicht gleichnamig');
        if (a.nenner > p.nenner_max) f.push('Nenner zu groß');
        if (k < 2 || k > p.faktor_max) f.push('Faktor außerhalb');
        return f;
      },
      mindestensVerschieden: { G: 60, M: 80 },
    });
  }
});

describe('Gleichungen mit Brüchen', () => {
  pflichttests(gleichungBruchPlus, {
    niveaus: {
      G: { gleichnamig: true, nenner_max: 10 },
      M: { gleichnamig: false, nenner_max: 12 },
    },
    unabhaengigeLoesung(i) {
      const [a, b] = [B(i, 'a'), B(i, 'b')];
      const plus = T(i, 'zeichen') === '+';
      const z = plus
        ? b.zaehler * a.nenner - a.zaehler * b.nenner
        : b.zaehler * a.nenner + a.zaehler * b.nenner;
      return kuerze(z, a.nenner * b.nenner);
    },
    grenzverletzungen(i, p) {
      const [a, b] = [B(i, 'a'), B(i, 'b')];
      const f: string[] = [];
      if (a.nenner > p.nenner_max) f.push('a zu groß');
      if (i.loesung.typ === 'bruch' && !(i.loesung.wert.zaehler > 0)) f.push('x nicht positiv');
      if (b.zaehler <= 0) f.push('b nicht positiv');
      return f;
    },
    mindestensVerschieden: { G: 50, M: 80 },
  });

  pflichttests(gleichungBruchMal, {
    niveaus: { G: { faktor: 'zahl', nenner_max: 10 }, M: { faktor: 'bruch', nenner_max: 10 } },
    unabhaengigeLoesung(i) {
      const b = B(i, 'b');
      const roh = i.platzhalter['k'];
      const k: Bruch = typeof roh === 'number' ? { zaehler: roh, nenner: 1 } : (roh as Bruch);
      return kuerze(b.zaehler * k.nenner, b.nenner * k.zaehler);
    },
    grenzverletzungen(i, p) {
      const k = i.platzhalter['k'];
      return (p.faktor === 'zahl') === (typeof k === 'number') ? [] : ['falsche Art von Faktor'];
    },
    mindestensVerschieden: { G: 50, M: 80 },
  });
});

describe('Zahlbereiche', () => {
  pflichttests(natuerlich, {
    niveaus: { G: { verkleidet: false }, M: { verkleidet: true } },
    unabhaengigeLoesung(i) {
      const z = i.platzhalter['zahl'];
      const ganz =
        typeof z === 'number'
          ? Number.isInteger(z) && z >= 0
          : (z as Bruch).zaehler % (z as Bruch).nenner === 0;
      return { typ: 'auswahl', wert: ganz ? 0 : 1 };
    },
    grenzverletzungen(i, p) {
      const z = i.platzhalter['zahl'];
      if (
        !p.verkleidet &&
        typeof z !== 'number' &&
        (z as Bruch).zaehler % (z as Bruch).nenner === 0
      )
        return ['verkleidete natürliche Zahl auf G'];
      return [];
    },
    mindestensVerschieden: { G: 60, M: 60 },
  });

  pflichttests(zahlbereichAussage, {
    niveaus: { G: { teilmengen: false }, M: { teilmengen: true } },
    unabhaengigeLoesung(i) {
      // Wahr sind genau die Aussagen ohne verdrehte Teilmenge, ohne „keine gebrochene Zahl“
      // zwischen 0 und 1 und ohne echten Bruch als natürliche Zahl.
      const wahr = (t: string) => {
        if (t.startsWith('Zwischen 0 und 1')) return false;
        if (
          t.startsWith('Jede gebrochene') ||
          t.startsWith('Die gebrochenen Zahlen sind eine Teilmenge')
        )
          return false;
        if (/kein Element/.test(t)) return false;
        const m = /^(\d+)\/(\d+) ist ein Element der natürlichen/.exec(t);
        if (m) return Number(m[1]) % Number(m[2]) === 0;
        return true;
      };
      return { typ: 'auswahl', wert: (i.optionen ?? []).findIndex((o) => wahr(o.text?.de ?? '')) };
    },
    grenzverletzungen(i) {
      return (i.optionen?.length ?? 0) === 3 ? [] : ['nicht drei Aussagen'];
    },
    mindestensVerschieden: { G: 40, M: 50 },
  });
});

describe('Sachaufgaben', () => {
  pflichttests(sachPreis, {
    niveaus: { G: { rueckgeld: false }, M: { rueckgeld: true } },
    unabhaengigeLoesung(i, p) {
      const g = T(i, 'geschichte');
      const m = /([\d,]+) kg .* ([\d,]+) € je Kilogramm/.exec(g);
      const kosten = zahlAus(m?.[1] ?? '') * zahlAus(m?.[2] ?? '');
      if (!p.rueckgeld) return { typ: 'zahl', wert: runde(kosten) };
      const schein = Number(/mit einem (\d+)-€-Schein/.exec(g)?.[1]);
      return { typ: 'zahl', wert: runde(schein - kosten) };
    },
    grenzverletzungen(i) {
      return i.loesung.typ === 'zahl' && i.loesung.wert > 0 ? [] : ['Ergebnis nicht positiv'];
    },
    mindestensVerschieden: { G: 80, M: 80 },
  });

  const BRUCHWORTE: Record<string, [number, number]> = {
    'die Hälfte': [1, 2],
    'ein Drittel': [1, 3],
    'zwei Drittel': [2, 3],
    'ein Viertel': [1, 4],
    'drei Viertel': [3, 4],
    'ein Fünftel': [1, 5],
    'zwei Fünftel': [2, 5],
    'ein Sechstel': [1, 6],
    'ein Achtel': [1, 8],
    'drei Achtel': [3, 8],
    'ein Zehntel': [1, 10],
    'drei Zehntel': [3, 10],
  };
  pflichttests(sachAnteil, {
    niveaus: { G: { ausgaben: 1 }, M: { ausgaben: 2 } },
    unabhaengigeLoesung(i) {
      const g = T(i, 'geschichte');
      const ganzes = Number(/hat (\d+) €/.exec(g)?.[1]);
      let rest = ganzes;
      for (const [wort, [z, n]] of Object.entries(BRUCHWORTE))
        rest -= ((ganzes * z) / n) * [...g.matchAll(new RegExp(` ${wort} `, 'g'))].length;
      return { typ: 'zahl', wert: rest };
    },
    grenzverletzungen(i) {
      return i.loesung.typ === 'zahl' && Number.isInteger(i.loesung.wert) && i.loesung.wert > 0
        ? []
        : ['Rest nicht positiv oder nicht ganz'];
    },
    mindestensVerschieden: { G: 50, M: 70 },
  });
});

describe('Anteile', () => {
  pflichttests(anteilVergleich, {
    niveaus: { G: { schwer: false }, M: { schwer: true } },
    unabhaengigeLoesung(i) {
      const wert = (t: string) => {
        const s = t.replace(' ist mehr', '');
        if (s.endsWith(' %')) return zahlAus(s.slice(0, -2)) / 100;
        const m = /^(\d+)\/(\d+)$/.exec(s);
        return m ? Number(m[1]) / Number(m[2]) : zahlAus(s);
      };
      const [x, y] = (i.optionen ?? []).slice(0, 2).map((o) => wert(o.text?.de ?? ''));
      return {
        typ: 'auswahl',
        wert: Math.abs((x ?? 0) - (y ?? 0)) < 1e-9 ? 2 : (x ?? 0) > (y ?? 0) ? 0 : 1,
      };
    },
    grenzverletzungen(i) {
      return (i.optionen?.length ?? 0) === 3 ? [] : ['nicht drei Optionen'];
    },
    mindestensVerschieden: { G: 40, M: 50 },
  });

  pflichttests(flaechenanteil, {
    niveaus: {
      G: {
        raster: [
          [5, 2],
          [5, 4],
          [5, 5],
          [10, 5],
          [10, 10],
        ],
      },
      M: {
        raster: [
          [5, 4],
          [8, 5],
          [10, 4],
          [4, 5],
        ],
      },
    },
    unabhaengigeLoesung(i) {
      // Aus dem Bild zurücklesen: gefüllte Kästchen und alle Kästchen zählen
      const svg = i.bild?.svg ?? '';
      const gefaerbt = (svg.match(/fill-opacity/g) ?? []).length;
      const gesamt = Number(/aus (\d+) gleich großen/.exec(i.bild?.beschreibung.de ?? '')?.[1]);
      return { typ: 'zahl', wert: (gefaerbt * 100) / gesamt };
    },
    grenzverletzungen(i) {
      return i.loesung.typ === 'zahl' &&
        Number.isInteger(i.loesung.wert) &&
        i.loesung.wert > 0 &&
        i.loesung.wert < 100
        ? []
        : ['Prozentwert nicht glatt'];
    },
    mindestensVerschieden: { G: 20, M: 20 },
  });
});

describe('Einzelfälle', () => {
  it('Sachaufgabe nennt Preise mit zwei Nachkommastellen', () => {
    for (let s = 0; s < 200; s++)
      expect(T(sachPreis.erzeuge(s, { rueckgeld: false }), 'geschichte')).toMatch(/\d,\d\d € je/);
  });
});
