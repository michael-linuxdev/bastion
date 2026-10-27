import { describe } from 'vitest';
import type { Instanz } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { achsenZaehlen, bewegungErkennen, symmetrischeFigur } from './symmetrie';

// Unabhängig: bekannte Achsenzahlen aus dem Tafelwerk, nach Namen in der Bildbeschreibung.
const ACHSEN: Record<string, number> = {
  Quadrat: 4,
  Rechteck: 2,
  'gleichseitiges Dreieck': 3,
  'gleichschenkliges Dreieck': 1,
  Raute: 2,
  'gleichschenkliges Trapez': 1,
  Parallelogramm: 0,
  'regelmäßiges Fünfeck': 5,
  'regelmäßiges Sechseck': 6,
  Drachenviereck: 1,
};
const ALLE = Object.keys(ACHSEN);

pflichttests(achsenZaehlen, {
  niveaus: {
    G: { formen: ['Quadrat', 'Rechteck', 'gleichschenkliges Dreieck', 'Raute', 'Parallelogramm'] },
    M: { formen: ALLE },
  },
  unabhaengigeLoesung: (i) => ({
    typ: 'zahl',
    wert: ACHSEN[(i.bild?.beschreibung.de ?? '').replace(/^Ein /, '').replace(/\.$/, '')] ?? -1,
  }),
  grenzverletzungen: () => [],
  mindestensVerschieden: { G: 50, M: 60 },
});

// Kästchen aus dem SVG lesen (gefüllte Rechtecke, Raster 20 px ab 5 px)
const kaestchenAus = (svg: string) =>
  [...svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="20" height="20" fill/g)].map(
    (m) => [(Number(m[1]) - 5) / 20, (Number(m[2]) - 5) / 20] as [number, number],
  );
function symmetrisch(k: [number, number][]): boolean {
  const menge = new Set(k.map(([a, b]) => `${a},${b}`));
  const [minS, maxS] = [Math.min(...k.map((x) => x[0])), Math.max(...k.map((x) => x[0]))];
  const [minZ, maxZ] = [Math.min(...k.map((x) => x[1])), Math.max(...k.map((x) => x[1]))];
  const pruefe = (f: (a: number, b: number) => [number, number]) =>
    k.every(([a, b]) => menge.has(f(a, b).join(',')));
  const senk = pruefe((a, b) => [minS + maxS - a, b]);
  const waag = pruefe((a, b) => [a, minZ + maxZ - b]);
  // Diagonalen nur bei quadratischem Umriss möglich
  const quad = maxS - minS === maxZ - minZ;
  const diag = quad && pruefe((a, b) => [minS + (b - minZ), minZ + (a - minS)]);
  const gegen = quad && pruefe((a, b) => [minS + (maxZ - b), minZ + (maxS - a)]);
  return senk || waag || diag || gegen;
}

pflichttests(symmetrischeFigur, {
  niveaus: { G: { kaestchen: 4 }, M: { kaestchen: 7 } },
  unabhaengigeLoesung: (i: Instanz) => ({
    typ: 'auswahl',
    wert: (i.optionen ?? []).findIndex((o) => symmetrisch(kaestchenAus(o.bild?.svg ?? ''))),
  }),
  grenzverletzungen(i) {
    const sym = (i.optionen ?? []).filter((o) =>
      symmetrisch(kaestchenAus(o.bild?.svg ?? '')),
    ).length;
    return sym !== 1 || (i.optionen ?? []).length !== 4 ? [`${sym} symmetrische Figuren`] : [];
  },
  mindestensVerschieden: { G: 98, M: 98 },
  laeufe: 2000,
});

for (const mit_drehung of [false, true]) {
  describe(mit_drehung ? 'mit Drehung' : 'ohne Drehung', () => {
    pflichttests(bewegungErkennen, {
      niveaus: { G: { mit_drehung }, M: { mit_drehung } },
      unabhaengigeLoesung(i) {
        // Linke und rechte Figur aus dem SVG lesen und selbst vergleichen
        const alle = kaestchenAus(i.bild?.svg ?? '');
        const norm = (k: [number, number][]) => {
          const ms = Math.min(...k.map((x) => x[0]));
          const mz = Math.min(...k.map((x) => x[1]));
          return k
            .map(([a, b]) => `${a - ms},${b - mz}`)
            .sort()
            .join(';');
        };
        const links = alle.filter(([a]) => a < 7);
        const rechts = alle.filter(([a]) => a >= 7);
        const ziel = norm(rechts);
        if (norm(links) === ziel) return { typ: 'auswahl', wert: 1 };
        if (norm(links.map(([a, b]) => [-a, b])) === ziel) return { typ: 'auswahl', wert: 0 };
        if (norm(links.map(([a, b]) => [-a, -b])) === ziel) return { typ: 'auswahl', wert: 2 };
        return { typ: 'auswahl', wert: -1 };
      },
      grenzverletzungen: () => [],
      mindestensVerschieden: { G: 95, M: 95 },
      laeufe: 2000,
    });
  });
}
