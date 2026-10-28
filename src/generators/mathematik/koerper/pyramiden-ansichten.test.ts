import { describe, expect, it } from 'vitest';
import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { ansicht, ansichtWaehlen, KOERPER, zweitafelKoerper } from './ansichten';
import {
  masseDichte,
  masseKoerper,
  pyramideErkennen,
  pyramideOberflaeche,
  pyramideVolumen,
  pyramideZaehlen,
  verpackungMaterial,
  verpackungVergleich,
} from './pyramiden';

// Parameter wie in den Vorlagen (content/…/M.RF.KP.*, M.GM.KP.*)
const T = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const zahlL = (x: number): Loesung => ({ typ: 'zahl', wert: Number(x.toFixed(6)) });
const auswahlL = (wert: number): Loesung => ({ typ: 'auswahl', wert });
const zahlen = (t: string) =>
  (t.match(/\d+(,\d+)?/g) ?? []).map((z) => Number(z.replace(',', '.')));
const optionen = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const wert = (i: Instanz) => (i.loesung.typ === 'zahl' ? i.loesung.wert : NaN);

const ECKEN: Readonly<Record<string, number>> = {
  drei: 3,
  vier: 4,
  fünf: 5,
  sechs: 6,
  sieben: 7,
  acht: 8,
};

pflichttests(pyramideZaehlen, {
  niveaus: { G: { n_max: 4, stumpf: false }, M: { n_max: 8, stumpf: true } },
  unabhaengigeLoesung(i) {
    const f = T(i, 'frage');
    const n = ECKEN[/([a-zäöüß]+)eckige?r? /.exec(f)?.[1] ?? ''] ?? NaN;
    // Pyramide: Grundfläche (n Ecken, n Kanten) + Spitze mit n Kanten; Stumpf: zwei n-Ecke + n Seitenkanten
    const stumpf = f.includes('stumpf');
    const e = stumpf ? n + n : n + 1;
    const k = stumpf ? n + n + n : n + n;
    const fl = 2 - e + k; // Eulerscher Polyedersatz
    return zahlL(f.includes('Ecken') ? e : f.includes('Kanten') ? k : fl);
  },
  grenzverletzungen(i, p) {
    return !p.stumpf && T(i, 'frage').includes('stumpf') ? ['Stumpf auf G'] : [];
  },
  mindestensVerschieden: { G: 6, M: 25 },
});

pflichttests(pyramideErkennen, {
  niveaus: { G: { netze: false }, M: { netze: true } },
  unabhaengigeLoesung(i) {
    const b = T(i, 'beschreibung');
    const k = /Trapez/.test(b)
      ? 'Pyramidenstumpf'
      : /Spitze|Dreiecken, die rundherum/.test(b)
        ? 'Pyramide'
        : 'Prisma';
    return auswahlL(optionen(i).indexOf(k));
  },
  grenzverletzungen(i, p) {
    return !p.netze && T(i, 'beschreibung').startsWith('Ein Netz') ? ['Netz auf G'] : [];
  },
  mindestensVerschieden: { G: 10, M: 18 },
});

pflichttests(pyramideVolumen, {
  niveaus: { G: { erweitert: false }, M: { erweitert: true } },
  unabhaengigeLoesung(i) {
    const t = T(i, 'aufgabe');
    const n = zahlen(t);
    if (t.startsWith('Ein Turm')) {
      const [a = 0, b = 0, hq = 0, h = 0] = n;
      return zahlL(a * b * hq + (a * b * h) / 3);
    }
    if (t.includes('quadratische')) {
      const [a = 0, h = 0] = n;
      return zahlL((a * a * h) / 3);
    }
    const [a = 0, b = 0, h = 0] = n;
    return zahlL((a * b * h) / 3);
  },
  grenzverletzungen(i, p) {
    const f: string[] = [];
    if (!Number.isInteger(wert(i))) f.push('Volumen nicht ganz');
    if (!p.erweitert && !T(i, 'aufgabe').includes('quadratische')) f.push('M-Fall auf G');
    return f;
  },
  mindestensVerschieden: { G: 50, M: 80 },
});

pflichttests(pyramideOberflaeche, {
  niveaus: { G: { rechteckig: false }, M: { rechteckig: true } },
  unabhaengigeLoesung(i) {
    const n = zahlen(T(i, 'aufgabe'));
    if (n.length === 2) {
      const [a = 0, hs = 0] = n;
      return zahlL(a * a + 4 * 0.5 * a * hs);
    }
    const [a = 0, b = 0, ha = 0, hb = 0] = n;
    return zahlL(a * b + a * ha + b * hb);
  },
  grenzverletzungen: (i) => (Number.isInteger(wert(i)) ? [] : ['nicht ganz']),
  mindestensVerschieden: { G: 60, M: 90 },
});

pflichttests(masseDichte, {
  niveaus: { G: { erweitert: false }, M: { erweitert: true } },
  unabhaengigeLoesung(i) {
    const t = T(i, 'aufgabe');
    const n = zahlen(t);
    if (t.includes('Berechne die Masse')) return zahlL((n[0] ?? 0) * (n[1] ?? 0));
    if (t.includes('Berechne das Volumen')) return zahlL((n[0] ?? 0) / (n[1] ?? 1));
    return zahlL((n[1] ?? 0) / (n[0] ?? 1));
  },
  grenzverletzungen(i, p) {
    return !p.erweitert && !T(i, 'aufgabe').includes('Berechne die Masse') ? ['M-Fall auf G'] : [];
  },
  mindestensVerschieden: { G: 80, M: 90 },
});

pflichttests(masseKoerper, {
  niveaus: { G: { prisma: false }, M: { prisma: true } },
  unabhaengigeLoesung(i) {
    const t = T(i, 'aufgabe');
    const n = zahlen(t);
    if (t.startsWith('Ein Quader'))
      return zahlL((n[0] ?? 0) * (n[1] ?? 0) * (n[2] ?? 0) * (n[3] ?? 0));
    const [g = 0, h = 0, l = 0, d = 0] = n;
    return zahlL(0.5 * g * h * l * d);
  },
  grenzverletzungen: () => [],
  mindestensVerschieden: { G: 90, M: 90 },
});

pflichttests(verpackungVergleich, {
  niveaus: { G: { drei: false }, M: { drei: true } },
  unabhaengigeLoesung(i) {
    const o = optionen(i).map((t) => {
      const [a = 0, b = 0, c = 0] = zahlen(t.replace(/^Schachtel \w: /, ''));
      return 2 * a * b + 2 * a * c + 2 * b * c;
    });
    return auswahlL(o.indexOf(Math.min(...o)));
  },
  grenzverletzungen(i, p) {
    const v = optionen(i).map((t) =>
      zahlen(t.replace(/^Schachtel \w: /, '')).reduce((s, x) => s * x, 1),
    );
    const f: string[] = [];
    if (new Set(v).size !== 1) f.push('verschiedene Volumen');
    if (v.length !== (p.drei ? 3 : 2)) f.push('Anzahl');
    return f;
  },
  mindestensVerschieden: { G: 20, M: 20 },
});

pflichttests(verpackungMaterial, {
  niveaus: { G: { erweitert: false }, M: { erweitert: true } },
  unabhaengigeLoesung(i) {
    const t = T(i, 'aufgabe');
    const [a = 0, b = 0, c = 0, z = 0] = zahlen(t);
    const voll = 2 * (a * b + a * c + b * c);
    return t.includes('ohne Deckel') ? zahlL((voll - a * b) * (1 + z / 100)) : zahlL(voll);
  },
  grenzverletzungen: () => [],
  mindestensVerschieden: { G: 90, M: 90 },
});

// Ansichten – unabhängig notiert: welche Form zeigt welcher Körper von vorne, oben, links?
const FORMEN: Readonly<Record<string, readonly [string, string, string]>> = {
  Quader: [
    'ein Rechteck, breiter als hoch',
    'ein Rechteck, breiter als tief',
    'ein Rechteck, höher als breit',
  ],
  Würfel: ['ein Quadrat', 'ein Quadrat', 'ein Quadrat'],
  'liegendes Dreiecksprisma': [
    'ein Dreieck',
    'ein Rechteck mit einer Linie in der Mitte',
    'ein Rechteck',
  ],
  'quadratische Pyramide': ['ein Dreieck', 'ein Quadrat mit beiden Diagonalen', 'ein Dreieck'],
  'stehendes Sechseckprisma': [
    'ein Rechteck mit zwei senkrechten Linien',
    'ein Sechseck',
    'ein Rechteck mit einer senkrechten Linie',
  ],
  'quadratischer Pyramidenstumpf': [
    'ein Trapez',
    'ein kleines Quadrat in einem großen, die Ecken verbunden',
    'ein Trapez',
  ],
  'stehendes Dreiecksprisma': [
    'ein Rechteck mit einer senkrechten Linie',
    'ein Dreieck',
    'ein Rechteck',
  ],
};
const ART: Readonly<Record<string, number>> = {
  'die Vorderansicht': 0,
  'die Draufsicht (von oben)': 1,
  'die Seitenansicht von links': 2,
};

pflichttests(ansichtWaehlen, {
  niveaus: { G: { erweitert: false }, M: { erweitert: true } },
  unabhaengigeLoesung(i) {
    const gesucht = FORMEN[T(i, 'koerper')]?.[ART[T(i, 'ansicht')] ?? 0] ?? '?';
    return auswahlL((i.optionen ?? []).findIndex((o) => o.bild?.beschreibung.de === gesucht));
  },
  grenzverletzungen(i, p) {
    const f: string[] = [];
    if ((i.optionen ?? []).length !== 4) f.push('nicht vier Antworten');
    if (!p.erweitert && T(i, 'ansicht').includes('links')) f.push('Seitenansicht auf G');
    return f;
  },
  mindestensVerschieden: { G: 60, M: 80 },
});

pflichttests(zweitafelKoerper, {
  niveaus: { G: { erweitert: false }, M: { erweitert: true } },
  unabhaengigeLoesung(i) {
    const b = i.bild?.beschreibung.de ?? '';
    const name = Object.entries(FORMEN).find(
      ([, [vorne, oben]]) =>
        b.includes(`(Vorderansicht): ${vorne}.`) && b.includes(`(Draufsicht): ${oben}.`),
    )?.[0];
    return auswahlL(optionen(i).indexOf(name ?? '?'));
  },
  grenzverletzungen: (i) => ((i.optionen ?? []).length === 4 ? [] : ['nicht vier Antworten']),
  mindestensVerschieden: { G: 30, M: 50 },
});

describe('Ansichten aus der Geometrie', () => {
  it('Würfel: alle Ansichten sind dasselbe Quadrat aus vier Strecken', () => {
    const w = KOERPER.find((k) => k.name === 'Würfel');
    if (!w) throw new Error('kein Würfel');
    for (const a of ['vorne', 'oben', 'links'] as const) expect(ansicht(w, a)).toHaveLength(4);
  });
  it('Pyramide von oben: Quadrat und zwei Diagonalen (acht Strecken, je vier Rand und Seitenkanten)', () => {
    const p = KOERPER.find((k) => k.name === 'quadratische Pyramide');
    if (!p) throw new Error('keine Pyramide');
    expect(ansicht(p, 'oben')).toHaveLength(8);
    expect(ansicht(p, 'vorne')).toHaveLength(3);
  });
});
