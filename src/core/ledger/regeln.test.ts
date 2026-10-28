import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { AufgabeEreignis } from '../learning/ereignis';
import type { KompetenzStand } from '../learning/fortschritt';
import { sitzungEreignis } from '../learning/sitzung';
import {
  alleSitzungsBuchungen,
  bauplanBuchungen,
  ERTRAG,
  steinBis,
  summe,
  type Buchung,
} from './regeln';

let n = 0;
function aufgabe(teil: Partial<AufgabeEreignis> = {}): AufgabeEreignis {
  n++;
  return {
    id: `A${String(n).padStart(6, '0')}`,
    art: 'aufgabe',
    v: 1,
    profil: 'P',
    ts: 1_000_000 + n * 30_000,
    tag: '2026-10-28',
    geraet: 'geraet01',
    sitzung: 'S1',
    modus: 'ueben',
    kompetenz: 'K',
    vorlage: 'K.V',
    niveau: 'G',
    quelle: { generator: 'g', version: 1, seed: 1 },
    paket: 'p',
    ergebnis: 'richtig',
    hilfen: 0,
    dauerMs: 20_000,
    faellig: false,
    bewertung: 'gut',
    ...teil,
  };
}
const falsch = (teil: Partial<AufgabeEreignis> = {}) =>
  aufgabe({
    ergebnis: 'falsch',
    bewertung: 'nochmal',
    schnappschuss: {
      platzhalter: {},
      loesung: { typ: 'zahl', wert: 1 },
      antwort: { typ: 'zahl', wert: 2 },
    },
    ...teil,
  });

/** Aufgaben je Sitzung zu Sitzungen machen und alles buchen. */
function buche(aufgaben: readonly AufgabeEreignis[]): Buchung[] {
  const jeSitzung = new Map<string, AufgabeEreignis[]>();
  for (const e of aufgaben) jeSitzung.set(e.sitzung, [...(jeSitzung.get(e.sitzung) ?? []), e]);
  const sitzungen = [...jeSitzung.values()].map((g) => sitzungEreignis(g, 'regulaer'));
  return alleSitzungsBuchungen(sitzungen, aufgaben);
}
const reihe = (anzahl: number, teil: Partial<AufgabeEreignis> = {}) =>
  Array.from({ length: anzahl }, () => aufgabe(teil));

describe('Stein (BASEBAU §3.1)', () => {
  it('Tageskurve: 25 voll, bis 50 halb, danach nichts', () => {
    expect(steinBis(0)).toBe(0);
    expect(steinBis(25)).toBe(25);
    expect(steinBis(27)).toBe(26);
    expect(steinBis(50)).toBe(37);
    expect(steinBis(200)).toBe(37);
  });

  it('richtig und falsch zählen gleich, Geratenes nicht', () => {
    const b = buche([
      ...reihe(3),
      ...Array.from({ length: 3 }, () => falsch()),
      ...Array.from({ length: 4 }, () => falsch({ dauerMs: 1_000 })),
      aufgabe({ ergebnis: 'uebersprungen', bewertung: null }),
    ]);
    expect(b.find((x) => x.ressource === 'stein')).toMatchObject({
      menge: 6,
      aufschluesselung: { aufgaben: 10, voll: 6, halb: 0, geraten: 4 },
    });
  });

  it('die Tageskurve gilt je Lerntag, egal wie die Aufgaben auf Sitzungen verteilt sind', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 30 }), { minLength: 1, maxLength: 6 }),
        (groessen) => {
          const aufgaben = groessen.flatMap((g, i) => reihe(g, { sitzung: `S${i}` }));
          const gesamt = groessen.reduce((a, b) => a + b, 0);
          expect(summe(buche(aufgaben)).stein).toBe(steinBis(gesamt));
        },
      ),
    );
  });

  it('ein neuer Lerntag beginnt die Kurve von vorn', () => {
    const b = buche([
      ...reihe(60, { sitzung: 'T1', tag: '2026-10-28' }),
      ...reihe(60, { sitzung: 'T2', tag: '2026-10-29' }),
    ]);
    expect(summe(b).stein).toBe(2 * steinBis(60));
  });
});

describe('Erz (BASEBAU §3.2)', () => {
  it('nur bestandene fällige Wiederholungen – Vorziehen geht nicht', () => {
    const b = buche([
      ...reihe(3, { faellig: true, modus: 'wiederholen' }),
      ...reihe(5, { faellig: false }),
      falsch({ faellig: true, modus: 'wiederholen' }),
    ]);
    expect(b.find((x) => x.ressource === 'erz')).toMatchObject({
      menge: 3,
      aufschluesselung: { wiederholungen: 3, korrekturen: 0, gekappt: 0 },
    });
  });

  it('die Diagnose bringt kein Erz', () => {
    expect(summe(buche(reihe(5, { modus: 'diagnose', faellig: true, bewertung: null }))).erz).toBe(
      0,
    );
  });

  it('absichtlich falsch antworten bringt keinen Vorteil', () => {
    // bestanden: 1 Erz
    const bestanden = buche([aufgabe({ sitzung: 'X', faellig: true, modus: 'wiederholen' })]);
    // durchgefallen und in einer späteren Sitzung korrigiert: auch 1 Erz
    const fehler = falsch({ sitzung: 'Y1', faellig: true, modus: 'wiederholen' });
    const korrigiert = buche([
      fehler,
      aufgabe({ sitzung: 'Y2', modus: 'fehlerwerkstatt', korrigiert: fehler.id }),
    ]);
    expect(summe(bestanden).erz).toBe(1);
    expect(summe(korrigiert).erz).toBe(1);
  });

  it('erst raten, dann korrigieren bringt nichts; zweimal korrigieren zählt einmal', () => {
    const geraten = falsch({ sitzung: 'R1', dauerMs: 500 });
    const ernst = falsch({ sitzung: 'R1' });
    const b = buche([
      geraten,
      ernst,
      aufgabe({ sitzung: 'R2', modus: 'fehlerwerkstatt', korrigiert: geraten.id }),
      aufgabe({ sitzung: 'R2', modus: 'fehlerwerkstatt', korrigiert: ernst.id }),
      aufgabe({ sitzung: 'R3', modus: 'fehlerwerkstatt', korrigiert: ernst.id }),
    ]);
    expect(summe(b).erz).toBe(1);
  });

  it('höchstens 30 am Lerntag, der Rest ist sichtbar gekappt', () => {
    const b = buche([
      ...reihe(20, { sitzung: 'E1', faellig: true, modus: 'wiederholen' }),
      ...reihe(20, { sitzung: 'E2', faellig: true, modus: 'wiederholen' }),
    ]);
    expect(summe(b).erz).toBe(ERTRAG.erzJeTag);
    expect(
      b.filter((x) => x.ressource === 'erz').map((x) => x.aufschluesselung['gekappt']),
    ).toEqual([0, 10]);
  });
});

describe('Bauschritte (BASEBAU §3.4)', () => {
  it('einer je Lerneinheit, höchstens zwei am Lerntag', () => {
    const b = buche([
      ...reihe(10, { sitzung: 'L1' }),
      ...reihe(9, { sitzung: 'KURZ' }),
      ...reihe(10, { sitzung: 'L2' }),
      ...reihe(10, { sitzung: 'L3' }),
      ...reihe(10, { sitzung: 'L4', tag: '2026-10-29' }),
    ]);
    expect(b.filter((x) => x.ressource === 'bauschritt').map((x) => x.bezug)).toEqual([
      'L1',
      'L2',
      'L4',
    ]);
  });
});

describe('Grundregeln (BASEBAU §3.5, B-4)', () => {
  const beispiel = () => [
    ...reihe(12, { sitzung: 'G1' }),
    ...Array.from({ length: 4 }, () => falsch({ sitzung: 'G1' })),
    ...reihe(6, { sitzung: 'G2', faellig: true, modus: 'wiederholen' }),
  ];

  it('niveau- und fachneutral: Niveau und Kompetenz ändern nichts', () => {
    const basis = beispiel();
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(fc.constantFrom('G' as const, 'M' as const), fc.constantFrom('K1', 'E.X')),
          {
            minLength: basis.length,
            maxLength: basis.length,
          },
        ),
        (wahl) => {
          const anders = basis.map((e, i) => ({
            ...e,
            niveau: wahl[i]?.[0] ?? e.niveau,
            kompetenz: wahl[i]?.[1] ?? e.kompetenz,
          }));
          expect(buche(anders)).toEqual(buche(basis));
        },
      ),
    );
  });

  it('deterministisch und unabhängig von der Reihenfolge der Eingaben', () => {
    const basis = beispiel();
    fc.assert(
      fc.property(fc.shuffledSubarray(basis, { minLength: basis.length }), (gemischt) => {
        expect(buche(gemischt)).toEqual(buche(basis));
      }),
    );
  });

  it('keine Buchungen über null und nie negative Mengen', () => {
    const b = buche([...reihe(3, { sitzung: 'N' }), falsch({ sitzung: 'N', dauerMs: 100 })]);
    expect(b.map((x) => x.ressource)).toEqual(['stein']);
    expect(b.every((x) => x.menge > 0 && x.regel === 1 && x.bezug === 'N')).toBe(true);
  });
});

describe('Baupläne (BASEBAU §3.3)', () => {
  const stand = (kompetenz: string, niveau: 'G' | 'M', gefestigtAm?: string): KompetenzStand => ({
    profil: 'P',
    kompetenz,
    niveau,
    status: gefestigtAm ? 'gefestigt' : 'gekonnt',
    aufgaben: 10,
    letzte: [],
    ...(gefestigtAm ? { gefestigtAm } : {}),
  });

  it('einer je Kompetenz und Niveau beim ersten Festigen, nur einmal', () => {
    const staende = [
      stand('K2', 'G', '2026-11-05'),
      stand('K1', 'G', '2026-11-01'),
      stand('K1', 'M', '2026-11-09'),
      stand('K3', 'G'),
    ];
    const erst = bauplanBuchungen(staende, new Set());
    expect(erst.map((b) => [b.bezug, b.tag, b.menge, b.grund])).toEqual([
      ['K1@G', '2026-11-01', 1, 'kompetenz-gefestigt'],
      ['K2@G', '2026-11-05', 1, 'kompetenz-gefestigt'],
      ['K1@M', '2026-11-09', 1, 'kompetenz-gefestigt'],
    ]);
    expect(bauplanBuchungen(staende, new Set(erst.map((b) => b.bezug)))).toEqual([]);
  });
});
