import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { AufgabeEreignis } from './ereignis';
import { fortschreiben, neuAufbauen, standSchluessel, type KompetenzStand } from './fortschritt';

let zaehler = 0;
function ereignis(teil: Partial<AufgabeEreignis>): AufgabeEreignis {
  zaehler += 1;
  return {
    id: String(zaehler).padStart(26, '0'),
    art: 'aufgabe',
    v: 1,
    profil: 'P',
    ts: zaehler,
    tag: '2026-10-28',
    geraet: 'g',
    sitzung: 'S',
    modus: 'ueben',
    kompetenz: 'K',
    vorlage: 'K.A',
    niveau: 'G',
    quelle: { generator: 'g', version: 1, seed: 1 },
    paket: 'p',
    ergebnis: 'richtig',
    hilfen: 0,
    dauerMs: 1000,
    faellig: false,
    bewertung: 'gut',
    ...teil,
  };
}

const folge = (teile: Partial<AufgabeEreignis>[]) => {
  let s: KompetenzStand | undefined;
  for (const t of teile) s = fortschreiben(s, ereignis(t));
  return s;
};

describe('Status einer Kompetenz (LEHRPLAN §6)', () => {
  it('neu → in Arbeit nach der ersten Aufgabe', () => {
    expect(folge([{ ergebnis: 'falsch' }])?.status).toBe('in-arbeit');
    expect(folge([{ ergebnis: 'uebersprungen' }])).toBeUndefined();
  });

  it('gekonnt: 5 von 6 richtig ohne Hilfe, über 2 Vorlagen', () => {
    const fuenf = [{}, { vorlage: 'K.B' }, {}, { vorlage: 'K.B' }, {}];
    expect(folge(fuenf)?.status).toBe('gekonnt');
    expect(folge(fuenf)?.gekonntAm).toBe('2026-10-28');
  });

  it('nicht gekonnt: nur eine Vorlage, mit Hilfe oder zu viele Fehler', () => {
    expect(folge([{}, {}, {}, {}, {}, {}])?.status).toBe('in-arbeit');
    const mitHilfe = [{}, { vorlage: 'K.B', hilfen: 1 }, {}, { vorlage: 'K.B' }, {}, { hilfen: 1 }];
    expect(folge(mitHilfe)?.status).toBe('in-arbeit');
    const fehler = [
      {},
      { vorlage: 'K.B' },
      { ergebnis: 'falsch' as const },
      { ergebnis: 'falsch' as const },
      {},
      {},
    ];
    expect(folge(fehler)?.status).toBe('in-arbeit');
  });

  it('nur die letzten 6 zählen', () => {
    const alt = Array.from({ length: 6 }, () => ({ ergebnis: 'falsch' as const }));
    const neu = [{}, { vorlage: 'K.B' }, {}, { vorlage: 'K.B' }, {}];
    expect(folge([...alt, ...neu])?.status).toBe('gekonnt');
  });

  it('einmal gekonnt bleibt gekonnt', () => {
    const fuenf = [{}, { vorlage: 'K.B' }, {}, { vorlage: 'K.B' }, {}];
    const danach = Array.from({ length: 6 }, () => ({ ergebnis: 'falsch' as const }));
    expect(folge([...fuenf, ...danach])?.status).toBe('gekonnt');
  });
});

describe('Pflicht-Test D-6: fortgeschrieben = neu aufgebaut', () => {
  it('für zufällige Ereignisfolgen', () => {
    const arb = fc.array(
      fc.record({
        kompetenz: fc.constantFrom('K', 'L'),
        niveau: fc.constantFrom('G' as const, 'M' as const),
        vorlage: fc.constantFrom('A', 'B', 'C'),
        ergebnis: fc.constantFrom('richtig' as const, 'falsch' as const, 'uebersprungen' as const),
        hilfen: fc.integer({ min: 0, max: 2 }),
      }),
      { maxLength: 60 },
    );
    fc.assert(
      fc.property(arb, (teile) => {
        const ereignisse = teile.map((t) => ereignis(t));
        const inkrementell = new Map<string, KompetenzStand>();
        for (const e of ereignisse) {
          const neu = fortschreiben(inkrementell.get(standSchluessel(e)), e);
          if (neu) inkrementell.set(standSchluessel(e), neu);
        }
        // Neuaufbau aus gemischter Reihenfolge: sortiert selbst nach Zeit
        expect(neuAufbauen([...ereignisse].reverse())).toEqual(inkrementell);
      }),
      { numRuns: 2000 },
    );
  });
});
