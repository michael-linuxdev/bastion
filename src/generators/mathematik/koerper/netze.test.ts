import { describe, expect, it } from 'vitest';
import type { Instanz, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { gegenueber, WUERFELNETZE, wuerfelnetzWaehlen } from './netze';

// Unabhängig vom Generator: den Würfel mit Drehmatrizen über das Netz kippen.
// Für jedes Kästchen wird die Würfelfläche (als Normalenvektor im Würfel) bestimmt, die unten liegt.
type V3 = readonly [number, number, number];
type M3 = readonly [V3, V3, V3];
const zeile = (a: M3, b: M3, i: 0 | 1 | 2): V3 => [
  a[i][0] * b[0][0] + a[i][1] * b[1][0] + a[i][2] * b[2][0],
  a[i][0] * b[0][1] + a[i][1] * b[1][1] + a[i][2] * b[2][1],
  a[i][0] * b[0][2] + a[i][1] * b[1][2] + a[i][2] * b[2][2],
];
const mal = (a: M3, b: M3): M3 => [zeile(a, b, 0), zeile(a, b, 1), zeile(a, b, 2)];
const EINHEIT: M3 = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];
const KIPPEN: Record<string, M3> = {
  '1,0': [
    [0, 0, 1],
    [0, 1, 0],
    [-1, 0, 0],
  ], // nach rechts: oben → rechts
  '-1,0': [
    [0, 0, -1],
    [0, 1, 0],
    [1, 0, 0],
  ],
  '0,1': [
    [1, 0, 0],
    [0, 0, 1],
    [0, -1, 0],
  ], // nach unten im Bild
  '0,-1': [
    [1, 0, 0],
    [0, 0, -1],
    [0, 1, 0],
  ],
};
type Zelle = readonly [number, number];
function untenFlaechen(netz: readonly Zelle[]): (string | undefined)[] {
  const lage: (M3 | undefined)[] = netz.map(() => undefined);
  lage[0] = EINHEIT;
  const offen = [0];
  for (let i = offen.pop(); i !== undefined; i = offen.pop()) {
    const [si, zi] = netz[i] ?? [0, 0];
    const li = lage[i] ?? EINHEIT;
    netz.forEach(([s, z], j) => {
      const kipp = KIPPEN[`${s - si},${z - zi}`];
      if (kipp && lage[j] === undefined) {
        lage[j] = mal(kipp, li);
        offen.push(j);
      }
    });
  }
  // Fläche unten im Würfelsystem: Lageᵀ · (0, 0, −1) = −(dritte Zeile der Lage)
  return lage.map((l) => (l ? l[2].map((x) => -x || 0).join(',') : undefined));
}
const VIERERBLOCK: readonly Zelle[] = [
  [1, 0],
  [0, 1],
  [1, 1],
];
const hatViererblock = (n: readonly Zelle[]) =>
  n.some(([s, z]) => VIERERBLOCK.every(([a, b]) => n.some(([x, y]) => x === s + a && y === z + b)));
function faltbar(n: readonly Zelle[]): boolean {
  if (hatViererblock(n)) return false;
  const unten = untenFlaechen(n);
  return !unten.includes(undefined) && new Set(unten).size === 6;
}

// Kästchen aus dem SVG lesen
function zellenAus(svg: string): Zelle[] {
  const r = [...svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)"/g)].map((m) => [
    Number(m[1]),
    Number(m[2]),
    Number(m[3]),
  ]);
  const k = r[0]?.[2] ?? 1;
  const zellen = r.map(([x = 0, y = 0]) => [Math.round(x / k), Math.round(y / k)] as const);
  const minS = Math.min(...zellen.map(([s]) => s));
  const minZ = Math.min(...zellen.map(([, z]) => z));
  return zellen.map(([s, z]) => [s - minS, z - minZ] as const);
}

describe('Würfelnetze', () => {
  it('alle elf hinterlegten Netze lassen sich falten', () => {
    expect(WUERFELNETZE).toHaveLength(11);
    for (const n of WUERFELNETZE) expect(faltbar(n)).toBe(true);
  });
  it('ein 2×3-Rechteck und eine Fünferreihe sind keine Netze', () => {
    expect(
      faltbar([
        [0, 0],
        [1, 0],
        [2, 0],
        [0, 1],
        [1, 1],
        [2, 1],
      ]),
    ).toBe(false);
    expect(
      faltbar([
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [0, 1],
      ]),
    ).toBe(false);
  });
});

// G: das eine Netz finden; M: das eine Nicht-Netz unter drei Netzen finden.
const GESUCHT = { G: 'netz', M: 'kein-netz' } as const;
const passend = (i: Instanz, gesucht: 'netz' | 'kein-netz') =>
  (i.optionen ?? []).map((o) => faltbar(zellenAus(o.bild?.svg ?? '')) === (gesucht === 'netz'));

pflichttests(wuerfelnetzWaehlen, {
  niveaus: { G: { gesucht: GESUCHT.G }, M: { gesucht: GESUCHT.M } },
  unabhaengigeLoesung: (i, p) => ({ typ: 'auswahl', wert: passend(i, p.gesucht).indexOf(true) }),
  grenzverletzungen(i, p) {
    const fehler = passend(i, p.gesucht).filter(Boolean).length === 1 ? [] : ['nicht genau eine'];
    if (i.optionen?.length !== 4) fehler.push('vier Figuren');
    if (p.gesucht === 'kein-netz') {
      // knifflig: kein 2 × 2-Block, höchstens vier in einer Reihe
      const anders = zellenAus(i.optionen?.[passend(i, p.gesucht).indexOf(true)]?.bild?.svg ?? '');
      const reihe = Math.max(...anders.map(([s]) => s), ...anders.map(([, z]) => z)) + 1;
      if (hatViererblock(anders) || reihe > 4) fehler.push('Nicht-Netz zu leicht erkennbar');
    }
    return fehler;
  },
  mindestensVerschieden: { G: 99, M: 99 },
  zeitlimitMs: 30_000, // Falten von vier Figuren je Instanz, 10 000 Seeds
});

pflichttests(gegenueber, {
  niveaus: { G: { nur_in_reihe: true }, M: { nur_in_reihe: false } },
  unabhaengigeLoesung(i) {
    const zellen = zellenAus(i.bild?.svg ?? '');
    const buchstaben = [...(i.bild?.svg ?? '').matchAll(/>([A-F])</g)].map((m) => m[1]);
    const frage = buchstaben.indexOf((i.platzhalter['flaeche'] as Sprachobjekt).de);
    const unten = untenFlaechen(zellen);
    const gesucht = (unten[frage] ?? '')
      .split(',')
      .map((x) => String(-Number(x) || 0))
      .join(',');
    const ziel = buchstaben[unten.findIndex((u) => u === gesucht)];
    return { typ: 'auswahl', wert: (i.optionen ?? []).findIndex((o) => o.text?.de === ziel) };
  },
  grenzverletzungen: (i) => ((i.optionen ?? []).length === 5 ? [] : ['fünf Optionen']),
  mindestensVerschieden: { G: 90, M: 95 },
});
