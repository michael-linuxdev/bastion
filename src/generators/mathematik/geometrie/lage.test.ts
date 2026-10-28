import { describe, expect, it } from 'vitest';
import type { Instanz } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { lagebeziehung, paralleleFinden } from './lage';

// Unabhängig: Richtungen aus der Bildbeschreibung lesen und vergleichen.
const richtungen = (i: Instanz) =>
  [...(i.bild?.beschreibung.de ?? '').matchAll(/unter (\d+)°/g)].map((m) => Number(m[1]));

// Alle Linien müssen im Bild liegen.
function ausserhalb(i: Instanz, breite: number, hoehe: number): string[] {
  const svg = i.bild?.svg ?? '';
  const fehler: string[] = [];
  for (const m of svg.matchAll(
    /<line x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)"/g,
  )) {
    const [x1, y1, x2, y2] = m.slice(1).map(Number) as [number, number, number, number];
    if ([x1, x2].some((x) => x < 0 || x > breite) || [y1, y2].some((y) => y < 0 || y > hoehe))
      fehler.push(`Linie außerhalb: ${m[0]}`);
  }
  return fehler;
}

pflichttests(lagebeziehung, {
  niveaus: { G: { schraeg: false }, M: { schraeg: true } },
  unabhaengigeLoesung(i) {
    const [g, h] = richtungen(i) as [number, number];
    const d = Math.abs(g - h);
    return { typ: 'auswahl', wert: d === 0 ? 0 : d === 90 ? 1 : 2 };
  },
  grenzverletzungen: (i) => ausserhalb(i, 300, 220),
  mindestensVerschieden: { G: 15, M: 60 },
});

pflichttests(paralleleFinden, {
  niveaus: { G: { schraeg: false }, M: { schraeg: true } },
  unabhaengigeLoesung(i) {
    const [a, ...rest] = richtungen(i);
    return { typ: 'auswahl', wert: rest.indexOf(a ?? -1) };
  },
  grenzverletzungen: (i) => ausserhalb(i, 310, 230),
  mindestensVerschieden: { G: 15, M: 60 },
});

describe('gf.lagebeziehung', () => {
  it('zeigt manchmal schneidende Geraden ohne sichtbaren Schnittpunkt', () => {
    const texte = Array.from({ length: 200 }, (_, s) =>
      lagebeziehung.erzeuge(s, { schraeg: true }),
    );
    expect(texte.some((i) => i.bild?.beschreibung.de.includes('berühren sich'))).toBe(true);
  });
});
