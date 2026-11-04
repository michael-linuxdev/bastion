import { describe, expect, it } from 'vitest';
import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { bogenmassText, einheitskreisBild, normiert, quadrant, sinCos } from './einheitskreis';
import {
  bezugswinkel,
  piTex,
  tfAmplitude,
  tfBogenmass,
  tfEigenschaft,
  tfEinheitskreis,
  tfNullstellen,
  tfPeriode,
  tfPeriodeAussage,
  tfPeriodeBAussage,
  tfQuadrantAussage,
  wellenBild,
} from './tf';

const texte = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const w = (i: Instanz, n: string) => Number(i.platzhalter[n]);
const s = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const wo = (i: Instanz, passt: (t: string) => boolean): Loesung => ({
  typ: 'auswahl',
  wert: texte(i).findIndex(passt),
});
const verschieden = (i: Instanz) =>
  new Set(texte(i)).size === texte(i).length ? [] : ['zwei gleiche Möglichkeiten'];
const rad = (g: number) => (g * Math.PI) / 180;

/** Bogenmaß unabhängig: g/180 kürzen durch Probieren */
function bogen(g: number): string {
  let z = g;
  let n = 180;
  for (let t = 180; t > 1; t--)
    if (z % t === 0 && n % t === 0) {
      z /= t;
      n /= t;
    }
  const zaehler = `${z === 1 ? '' : z}\\pi`;
  return n === 1 ? zaehler : `\\frac{${zaehler}}{${n}}`;
}

const STELLE_TEX = ['0', '\\frac{\\pi}{2}', '\\pi', '\\frac{3\\pi}{2}', '2\\pi'];

describe('Einheitskreis-Skizze', () => {
  it('rechnet Bogenmaß, Quadranten und Werte', () => {
    expect(bogenmassText(210)).toBe('7π/6');
    expect(bogenmassText(-90)).toBe('−π/2');
    expect(normiert(-30)).toBe(330);
    expect(normiert(360)).toBe(360);
    expect(quadrant(359)).toBe(4);
    expect(sinCos(180)).toEqual({ sin: 0, cos: -1 });
    expect(bezugswinkel(150)).toBe(30);
    expect(bezugswinkel(240)).toBe(60);
    expect(bezugswinkel(315)).toBe(45);
  });

  it('ohne Werte verrät das Bild die Lösung nicht', () => {
    for (const g of [120, 135, 150, 210, 225, 240, 300, 315, 330]) {
      const b = einheitskreisBild(g, { werte: false });
      expect(b.svg).not.toMatch(/0,5|0,71|0,87/);
    }
  });

  it('Wellenbild beschriftet die x-Achse in Vielfachen von π/2', () => {
    const b = wellenBild({ fn: 'sin', a: 1, b: 1, d: 0 });
    expect(b.svg).toContain('>π/2<');
    expect(b.svg).toContain('>3π/2<');
    expect(b.svg).toContain('>2π<');
    expect(b.beschreibung.de).toContain('0; 1; 0; −1; 0');
  });

  it('piTex schreibt Vielfache von π als Bruch', () => {
    expect(piTex(150)).toBe('\\frac{5\\pi}{6}');
    expect(piTex(180)).toBe('\\pi');
    expect(piTex(360)).toBe('2\\pi');
    expect(piTex(90)).toBe('\\frac{\\pi}{2}');
  });
});

describe('Bogenmaß (G)', () => {
  pflichttests(tfBogenmass, {
    niveaus: { G: {} },
    unabhaengigeLoesung: (i) => wo(i, (t) => t === `$${bogen(w(i, 'grad'))}$`),
    grenzverletzungen: verschieden,
    mindestensVerschieden: { G: 30 },
  });
});

describe('Sinus und Kosinus am Einheitskreis (M)', () => {
  pflichttests(tfEinheitskreis, {
    niveaus: { M: {} },
    unabhaengigeLoesung(i) {
      const g = w(i, 'grad');
      const v = w(i, 'funktion') === 1 ? Math.sin(rad(g)) : Math.cos(rad(g));
      return { typ: 'zahl', wert: Math.round(v * 100) / 100 };
    },
    grenzverletzungen(i) {
      const g = w(i, 'grad');
      return g % 90 === 0 || g < 90 || g > 360 ? ['Winkel nicht in Quadrant 2 bis 4'] : [];
    },
    mindestensVerschieden: { M: 15 },
  });
});

describe('Symmetrie am Einheitskreis (E)', () => {
  pflichttests(tfQuadrantAussage, {
    niveaus: { E: {} },
    unabhaengigeLoesung(i) {
      const a = w(i, 'alpha');
      const art = w(i, 'art');
      const fn = art === 0 || art === 3 ? Math.sin : Math.cos;
      const winkel = art <= 1 ? 180 - a : 360 - a;
      const gleich = Math.abs(fn(rad(winkel)) - fn(rad(a))) < 1e-9;
      return wo(i, (t) => (gleich ? t.startsWith('Ja.') : t.startsWith('Nein. P')));
    },
    grenzverletzungen: verschieden,
    mindestensVerschieden: { E: 40 },
  });
});

describe('Graph erkennen, Periode (G)', () => {
  pflichttests(tfEigenschaft, {
    niveaus: { G: {} },
    unabhaengigeLoesung(i) {
      if (w(i, 'art') === 1) return wo(i, (t) => t === '$2\\pi$');
      const fn = w(i, 'funktion') === 1 ? '\\sin x' : '\\cos x';
      return wo(i, (t) => t === `$y = ${fn}$`);
    },
    grenzverletzungen: verschieden,
    mindestensVerschieden: { G: 15 },
  });
});

describe('Nullstellen und Extremstellen (M)', () => {
  pflichttests(tfNullstellen, {
    niveaus: { M: {} },
    unabhaengigeLoesung(i) {
      const fn = w(i, 'funktion') === 1 ? Math.sin : Math.cos;
      const ziel = [0, 1, -1][w(i, 'art')] ?? 0;
      const stellen = [0, 1, 2, 3, 4].filter((k) => Math.abs(fn((k * Math.PI) / 2) - ziel) < 1e-9);
      const text = `$x = ${stellen.map((k) => STELLE_TEX[k]).join(';\\ ')}$`;
      return wo(i, (t) => t === text);
    },
    grenzverletzungen: verschieden,
    mindestensVerschieden: { M: 20 },
  });
});

describe('Periode und Symmetrie begründen (E)', () => {
  pflichttests(tfPeriodeAussage, {
    niveaus: { E: {} },
    unabhaengigeLoesung(i) {
      const x = 0.7;
      const stimmt = [
        Math.abs(Math.sin(x + 2 * Math.PI) - Math.sin(x)) < 1e-9,
        Math.abs(Math.sin(x + Math.PI) - Math.sin(x)) < 1e-9,
        Math.abs(Math.sin(-x) - Math.sin(x)) < 1e-9,
        Math.abs(Math.cos(-x) - Math.cos(x)) < 1e-9,
      ][w(i, 'art')];
      return wo(i, (t) => (stimmt ? t.startsWith('Ja.') : t.startsWith('Nein. Bei')));
    },
    grenzverletzungen: verschieden,
    mindestensVerschieden: { E: 12 },
  });
});

describe('Amplitude (G)', () => {
  pflichttests(tfAmplitude, {
    niveaus: { G: {} },
    unabhaengigeLoesung: (i) => ({
      typ: 'zahl',
      wert: (w(i, 'groesster') - w(i, 'kleinster')) / 2,
    }),
    grenzverletzungen: (i) =>
      w(i, 'groesster') !== -w(i, 'kleinster') ? ['Graph verschoben'] : [],
    mindestensVerschieden: { G: 8 },
  });
});

describe('Periode aus b (M)', () => {
  pflichttests(tfPeriode, {
    niveaus: { G: { umgekehrt: false }, M: { umgekehrt: true } },
    unabhaengigeLoesung(i) {
      const um = s(i, 'satz').includes('Bestimme b');
      return { typ: 'zahl', wert: um ? 360 / w(i, 'periode') : 360 / w(i, 'b') };
    },
    grenzverletzungen: (i, p) =>
      !p.umgekehrt && s(i, 'satz').includes('Bestimme b') ? ['umgekehrt auf Niveau G'] : [],
    mindestensVerschieden: { G: 8, M: 12 },
  });
});

describe('„Periode = b“ widerlegen (E)', () => {
  pflichttests(tfPeriodeBAussage, {
    niveaus: { E: {} },
    unabhaengigeLoesung: (i) => wo(i, (t) => t.startsWith('Nein. $')),
    grenzverletzungen: verschieden,
    mindestensVerschieden: { E: 10 },
  });

  it('richtige Aussage nennt 2π/b', () => {
    const i = tfPeriodeBAussage.erzeuge(5, {});
    const b = w(i, 'b');
    expect(texte(i).some((t) => t.includes(`\\frac{2\\pi}{${b}}`))).toBe(true);
  });
});
