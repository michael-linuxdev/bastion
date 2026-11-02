import { describe, expect, it } from 'vitest';
import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { glWurzelLoesen, glWurzelProbe } from './wurzel';

const tex = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;

/** Unabhängig: Gleichung √(a·x + b) + d = e aus dem LaTeX lesen. */
function lies(t: string) {
  const m = /^\\sqrt\{(\d*)x(?: ([+-]) (\d+))?\}(?: ([+-]) (\d+))? = (-?\d+)$/.exec(t);
  if (!m) throw new Error(`unbekannte Gleichung ${t}`);
  const a = m[1] ? Number(m[1]) : 1;
  const b = m[3] ? Number(m[3]) * (m[2] === '-' ? -1 : 1) : 0;
  const d = m[5] ? Number(m[5]) * (m[4] === '-' ? -1 : 1) : 0;
  const e = Number(m[6]);
  return { a, b, d, e };
}

/** Lösung durch Ausprobieren aller ganzen Zahlen – ohne Quadrieren */
function probiere(t: string): number | undefined {
  const { a, b, d, e } = lies(t);
  for (let x = -500; x <= 500; x++) {
    const innen = a * x + b;
    if (innen >= 0 && Math.abs(Math.sqrt(innen) + d - e) < 1e-9) return x;
  }
  return undefined;
}

describe('Wurzelgleichungen lösen', () => {
  pflichttests(glWurzelLoesen, {
    niveaus: {
      G: { formen: ['einfach', 'summe'] },
      M: { formen: ['summe', 'linear', 'isolieren'] },
    },
    unabhaengigeLoesung: (i) => ({ typ: 'zahl', wert: probiere(tex(i, 'gleichung')) ?? NaN }),
    grenzverletzungen(i, p) {
      const f: string[] = [];
      const { a, d } = lies(tex(i, 'gleichung'));
      if (a !== 1 && !p.formen.includes('linear')) f.push('Faktor vor x nicht erlaubt');
      if (d !== 0 && !p.formen.includes('isolieren'))
        f.push('Summand neben der Wurzel nicht erlaubt');
      return f;
    },
    mindestensVerschieden: { G: 50, M: 80 },
  });

  it('Zwischenschritte: erst die quadrierte rechte Seite, dann x', () => {
    const p = { formen: ['isolieren'] } as const;
    const i = glWurzelLoesen.erzeuge(4, p);
    const { d, e } = lies(tex(i, 'gleichung'));
    expect(glWurzelLoesen.schritt?.(4, p, 'quadrat', {}).loesung).toEqual({
      typ: 'zahl',
      wert: (e - d) ** 2,
    });
    expect(glWurzelLoesen.schritt?.(4, p, 'x', {}).loesung).toEqual(i.loesung);
  });
});

describe('Lösung oder Scheinlösung (E)', () => {
  pflichttests(glWurzelProbe, {
    niveaus: { E: {} },
    unabhaengigeLoesung(i): Loesung {
      const x = probiere(tex(i, 'gleichung'));
      const k = (i.optionen ?? []).findIndex((o) =>
        x === undefined ? o.text?.de.startsWith('Keine') : o.text?.de === `$x = ${x}$`,
      );
      return { typ: 'auswahl', wert: k };
    },
    grenzverletzungen(i) {
      const n = i.optionen?.length ?? 0;
      return n >= 3 && n <= 4 ? [] : ['drei oder vier Optionen'];
    },
    mindestensVerschieden: { E: 60 },
  });

  it('etwa die Hälfte der Gleichungen hat keine Lösung', () => {
    let ohne = 0;
    for (let s = 0; s < 200; s++)
      if (probiere(tex(glWurzelProbe.erzeuge(s, {}), 'gleichung')) === undefined) ohne++;
    expect(ohne).toBeGreaterThan(60);
    expect(ohne).toBeLessThan(140);
  });
});
