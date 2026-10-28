import { describe, expect, it } from 'vitest';
import {
  diagnose,
  DIAGNOSE,
  empfehlungen,
  kann,
  standKlasse,
  type Antwort,
  type DiagnoseStand,
} from './diagnose';

// Kette A → B → C → D (D baut auf C auf usw.)
const kette = [
  { id: 'A', voraussetzungen: [] },
  { id: 'B', voraussetzungen: ['A'] },
  { id: 'C', voraussetzungen: ['B'] },
  { id: 'D', voraussetzungen: ['C'] },
];

/** Spielt eine Diagnose mit einer Person durch, die genau `kenntnis` kann. */
function spiele(kenntnis: Set<string>, ks = kette) {
  const antworten: Antwort[] = [];
  let s = diagnose(ks, antworten);
  while (s.naechste) {
    antworten.push({ kompetenz: s.naechste, richtig: kenntnis.has(s.naechste) });
    s = diagnose(ks, antworten);
  }
  return s;
}

describe('Diagnose (LEHRPLAN §7)', () => {
  it('beginnt in der Mitte und halbiert', () => {
    expect(['B', 'C']).toContain(diagnose(kette, []).naechste);
  });

  it('findet die Grenze in einer Kette mit wenigen Aufgaben', () => {
    for (const n of [0, 1, 2, 3, 4]) {
      const kenntnis = new Set(kette.slice(0, n).map((k) => k.id));
      const s = spiele(kenntnis);
      for (const k of kette) expect(kann(s, k.id), `${n} ${k.id}`).toBe(kenntnis.has(k.id));
      expect(s.aufgaben).toBeLessThanOrEqual(6); // höchstens 3 Kompetenzen × 2 Aufgaben
    }
  });

  it('1 : 1 braucht eine dritte Aufgabe', () => {
    const erste = diagnose(kette, []).naechste ?? '';
    const s = diagnose(kette, [
      { kompetenz: erste, richtig: true },
      { kompetenz: erste, richtig: false },
    ]);
    expect(s.naechste).toBe(erste);
    expect(s.getestet.has(erste)).toBe(false);
  });

  it('empfiehlt, was als Nächstes dran ist', () => {
    const s = spiele(new Set(['A', 'B']));
    expect(empfehlungen(kette, s)).toEqual(['C']);
    expect(empfehlungen(kette, spiele(new Set()))).toEqual(['A']);
  });

  it('endet spätestens nach der Höchstzahl, mit Pausenpunkt nach der ersten Etappe', () => {
    const viele = Array.from({ length: 40 }, (_, i) => ({ id: `K${i}`, voraussetzungen: [] }));
    const antworten: Antwort[] = [];
    let s = diagnose(viele, antworten);
    let pause = 0;
    while (s.naechste) {
      antworten.push({ kompetenz: s.naechste, richtig: true });
      s = diagnose(viele, antworten);
      if (s.etappenEnde) pause += 1;
    }
    expect(s.aufgaben).toBe(DIAGNOSE.hoechstens);
    expect(pause).toBe(1);
  });
});

describe('Stand im Sinne einer Klasse (L-16)', () => {
  const k = (id: string, c: number) => ({ id, klassenstufe_typisch: [c] });
  const stand = (kann: string[], nicht: string[]): DiagnoseStand => ({
    getestet: new Map([
      ...kann.map((i) => [i, 'kann'] as const),
      ...nicht.map((i) => [i, 'kann-noch-nicht'] as const),
    ]),
    gefolgert: new Map(),
    aufgaben: 10,
    etappenEnde: false,
  });
  const ks = [k('A5', 5), k('B5', 5), k('A6', 6), k('B6', 6), k('A7', 7), k('B7', 7)];

  it('höchste Klasse, bis zu der jede Klasse mindestens 70 % sitzt', () => {
    expect(standKlasse(ks, stand(['A5', 'B5', 'A6', 'B6'], ['A7', 'B7']))).toBe(6);
    expect(standKlasse(ks, stand(['A5', 'B5', 'A7', 'B7'], ['A6', 'B6']))).toBe(5);
    expect(standKlasse(ks, stand([], ['A5']))).toBe(4);
    expect(standKlasse(ks, stand([], []))).toBeUndefined();
  });
});
