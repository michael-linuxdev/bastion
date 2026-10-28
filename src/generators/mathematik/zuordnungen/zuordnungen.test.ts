import { describe, expect, it } from 'vitest';
import type { Instanz, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  dreisatzProportional,
  dreisatzUmgekehrt,
  graphAblesen,
  graphWaehlen,
  jeDesto,
  proportionalTabelle,
  tabelle,
  tabelleErgaenzen,
  zuordnungsart,
} from './zuordnungen';

const T = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const zahlen = (t: string) =>
  [...t.replace(/(\d) (\d)/g, '$1$2').matchAll(/\d+(?:,\d+)?/g)].map((m) =>
    Number(m[0].replace(',', '.')),
  );

/** Tabelle aus der Bildbeschreibung zurücklesen: „Tabelle: x 1, 2, 3; y 4, 8, gesucht.“ */
function tabelleAus(i: Instanz): { xs: number[]; ys: (number | null)[] } {
  const m = /^Tabelle: .*? ([\d, ]+); .*? ([\d, gesucht]+)\.$/.exec(i.bild?.beschreibung.de ?? '');
  const xs = (m?.[1] ?? '').split(', ').map((s) => Number(s.replace(/\s/g, '')));
  const ys = (m?.[2] ?? '')
    .split(', ')
    .map((s) => (s === 'gesucht' ? null : Number(s.replace(/\s/g, ''))));
  return { xs, ys };
}

describe('Art der Zuordnung', () => {
  // Erwartete Einordnung der Alltagssätze (0 eindeutig, 1 eineindeutig, 2 mehrdeutig)
  const SAETZE: Record<string, number> = {
    'Jedem Kind wird sein Geburtsmonat zugeordnet.': 0,
    'Jedem Auto wird sein Kennzeichen zugeordnet.': 1,
    'Jedem Monat werden die Kinder zugeordnet, die in ihm Geburtstag haben.': 2,
    'Jeder natürlichen Zahl wird ihr Doppeltes zugeordnet.': 1,
    'Jeder Zahl werden ihre Teiler zugeordnet.': 2,
    'Jedem Schüler wird seine Klasse zugeordnet.': 0,
    'Jeder Klasse werden ihre Schüler zugeordnet.': 2,
    'Jedem Land wird seine Hauptstadt zugeordnet.': 1,
  };
  pflichttests(zuordnungsart, {
    niveaus: { G: { worte: false }, M: { worte: true } },
    unabhaengigeLoesung(i) {
      if (!i.bild) return { typ: 'auswahl', wert: SAETZE[T(i, 'frage')] ?? -1 };
      const pfeile = [
        ...(i.bild.beschreibung.de.split('Pfeile: ')[1] ?? '').matchAll(/(\w) → (\w)/g),
      ].map((m) => [m[1], m[2]]);
      const von = new Map<string, number>();
      const nach = new Map<string, number>();
      for (const [a, b] of pfeile) {
        von.set(a ?? '', (von.get(a ?? '') ?? 0) + 1);
        nach.set(b ?? '', (nach.get(b ?? '') ?? 0) + 1);
      }
      if ([...von.values()].some((n) => n > 1)) return { typ: 'auswahl', wert: 2 };
      return { typ: 'auswahl', wert: [...nach.values()].some((n) => n > 1) ? 0 : 1 };
    },
    grenzverletzungen(i, p) {
      return !p.worte && !i.bild ? ['ohne Bild auf G'] : [];
    },
    mindestensVerschieden: { G: 40, M: 40 },
  });
});

describe('Tabelle ergänzen', () => {
  pflichttests(tabelleErgaenzen, {
    niveaus: { G: { mit_grundwert: false, k_max: 9 }, M: { mit_grundwert: true, k_max: 12 } },
    unabhaengigeLoesung(i) {
      const { xs, ys } = tabelleAus(i);
      const [x1, x2] = [xs[0] ?? 0, xs[1] ?? 0];
      const [y1, y2] = [ys[0] ?? 0, ys[1] ?? 0];
      const k = (y2 - y1) / (x2 - x1);
      const c = y1 - k * x1;
      return { typ: 'zahl', wert: k * (i.platzhalter['x'] as number) + c };
    },
    grenzverletzungen(i, p) {
      const { xs, ys } = tabelleAus(i);
      const f: string[] = [];
      if (ys.at(-1) !== null) f.push('letzter Wert nicht gesucht');
      if (xs.at(-1) !== i.platzhalter['x']) f.push('{x} passt nicht zur Tabelle');
      const k = ((ys[1] ?? 0) - (ys[0] ?? 0)) / ((xs[1] ?? 0) - (xs[0] ?? 0));
      if (k < 2 || k > p.k_max) f.push('k außerhalb');
      if (!p.mit_grundwert && (ys[0] ?? 0) !== k * (xs[0] ?? 0)) f.push('nicht proportional');
      return f;
    },
    mindestensVerschieden: { G: 60, M: 80 },
  });
});

describe('Proportional oder nicht', () => {
  pflichttests(proportionalTabelle, {
    niveaus: { G: { weder: false }, M: { weder: true } },
    unabhaengigeLoesung(i) {
      const { xs, ys } = tabelleAus(i);
      const q = xs.map((x, j) => (ys[j] ?? 0) / x);
      const p = xs.map((x, j) => (ys[j] ?? 0) * x);
      if (q.every((v) => v === q[0])) return { typ: 'auswahl', wert: 0 };
      if (p.every((v) => v === p[0])) return { typ: 'auswahl', wert: 1 };
      return { typ: 'auswahl', wert: 2 };
    },
    grenzverletzungen(i, p) {
      const { xs, ys } = tabelleAus(i);
      const f: string[] = [];
      if (xs.length !== 4) f.push('nicht vier Paare');
      if (ys.some((y) => y === null || y <= 0 || !Number.isInteger(y)))
        f.push('y nicht positiv ganz');
      if ((i.optionen?.length ?? 0) !== (p.weder ? 3 : 2)) f.push('falsche Optionen');
      return f;
    },
    mindestensVerschieden: { G: 50, M: 70 },
  });

  const ERWARTET: Record<string, number> = {
    'Je mehr Brötchen du kaufst, desto mehr bezahlst du.': 0,
    'Je mehr Personen sich eine Pizza teilen, desto kleiner wird jedes Stück.': 1,
    'Je schneller ein Zug fährt, desto kürzer braucht er für dieselbe Strecke.': 1,
    'Je länger du mit gleicher Geschwindigkeit radelst, desto weiter kommst du.': 0,
    'Je mehr Liter Benzin du tankst, desto mehr kostet es.': 0,
    'Je mehr Pumpen arbeiten, desto schneller ist das Becken leer.': 1,
    'Je älter ein Kind ist, desto größer ist es.': 2,
    'Je mehr Kinder in der Klasse sind, desto mehr Bücher braucht die Klasse, wenn jedes Kind eines bekommt.': 0,
    'Ein Taxi kostet 4 € Grundpreis und 2 € je Kilometer. Je weiter du fährst, desto mehr zahlst du.': 2,
    'Je mehr Tore eine Mannschaft schießt, desto mehr Zuschauer kommen.': 2,
  };
  pflichttests(jeDesto, {
    niveaus: { G: { weder: false }, M: { weder: true } },
    unabhaengigeLoesung: (i) => ({ typ: 'auswahl', wert: ERWARTET[T(i, 'satz')] ?? -1 }),
    grenzverletzungen: (i, p) =>
      !p.weder && (ERWARTET[T(i, 'satz')] ?? 0) === 2 ? ['weder noch auf G'] : [],
    mindestensVerschieden: { G: 7, M: 10 },
  });
});

describe('Dreisatz', () => {
  pflichttests(dreisatzProportional, {
    niveaus: { G: { cent_schritt: 100, anzahl_max: 10 }, M: { cent_schritt: 10, anzahl_max: 20 } },
    unabhaengigeLoesung(i) {
      const [a, preis, b] = zahlen(T(i, 'geschichte'));
      return { typ: 'zahl', wert: Number((((preis ?? 0) / (a ?? 1)) * (b ?? 0)).toFixed(2)) };
    },
    grenzverletzungen(i, p) {
      const [a, , b] = zahlen(T(i, 'geschichte'));
      return [a, b].some((x) => (x ?? 0) < 2 || (x ?? 0) > p.anzahl_max)
        ? ['Anzahl außerhalb']
        : [];
    },
    mindestensVerschieden: { G: 60, M: 80 },
  });

  pflichttests(dreisatzUmgekehrt, {
    niveaus: { G: { produkt_max: 72 }, M: { produkt_max: 360 } },
    unabhaengigeLoesung(i) {
      const [a, t, b] = zahlen(T(i, 'geschichte'));
      return { typ: 'zahl', wert: ((a ?? 0) * (t ?? 0)) / (b ?? 1) };
    },
    grenzverletzungen(i) {
      return i.loesung.typ === 'zahl' && Number.isInteger(i.loesung.wert)
        ? []
        : ['Ergebnis nicht ganz'];
    },
    mindestensVerschieden: { G: 40, M: 70 },
  });
});

describe('Graphen', () => {
  pflichttests(graphAblesen, {
    niveaus: { G: { umgekehrt: false }, M: { umgekehrt: true } },
    unabhaengigeLoesung(i) {
      const d = i.bild?.beschreibung.de ?? '';
      const x = i.platzhalter['x'] as number;
      const gerade = /durch den Punkt \((\d+)\|(\d+)\)/.exec(d);
      if (gerade) return { typ: 'zahl', wert: (Number(gerade[2]) / Number(gerade[1])) * x };
      const punkt = new RegExp(`\\(${x}\\|(\\d+)\\)`).exec(d);
      return { typ: 'zahl', wert: Number(punkt?.[1]) };
    },
    grenzverletzungen(i) {
      return i.loesung.typ === 'zahl' && Number.isInteger(i.loesung.wert) && i.loesung.wert > 0
        ? []
        : ['y nicht ganz'];
    },
    mindestensVerschieden: { G: 15, M: 8 },
  });

  pflichttests(graphWaehlen, {
    niveaus: { G: { umgekehrt: false }, M: { umgekehrt: true } },
    unabhaengigeLoesung(i) {
      const { xs, ys } = tabelleAus(i);
      const umgekehrt = (ys[0] ?? 0) * (xs[0] ?? 0) === (ys[1] ?? 0) * (xs[1] ?? 0);
      const merkmal = umgekehrt ? 'Kurve' : 'durch den Ursprung';
      return {
        typ: 'auswahl',
        wert: (i.optionen ?? []).findIndex((o) => o.bild?.beschreibung.de.includes(merkmal)),
      };
    },
    grenzverletzungen: (i) => ((i.optionen ?? []).length === 3 ? [] : ['nicht drei Graphen']),
    // nur die Reihenfolge der drei Graphen ändert sich
    mindestensVerschieden: { G: 5, M: 5 },
  });
});

describe('Tabelle – Einzelfall', () => {
  it('beschreibt Werte und das gesuchte Feld', () => {
    expect(
      tabelle(
        ['x', 'y'],
        [
          [1, 2],
          [3, null],
        ],
      ).beschreibung.de,
    ).toBe('Tabelle: x 1, 3; y 2, gesucht.');
  });
});
