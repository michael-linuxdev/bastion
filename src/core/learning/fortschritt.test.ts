import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { AufgabeEreignis } from './ereignis';
import { erinnerung, type Karte } from '../srs/karten';
import {
  anzeigeStatus,
  fortschreiben,
  kartenVon,
  neuAufbauen,
  verarbeite,
  type KompetenzStand,
  type Projektion,
} from './fortschritt';

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
  for (const t of teile) s = fortschreiben(s, ereignis(t), []);
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

const TAG = 86_400_000;

describe('gefestigt und auffrischen (LEHRPLAN §6)', () => {
  it('nach bestandenen fälligen Wiederholungen über mindestens 7 Tage', () => {
    const p: Projektion = { staende: new Map(), karten: new Map() };
    let t = Date.UTC(2026, 9, 1, 10);
    // gekonnt am ersten Tag
    for (const v of ['K.A', 'K.B', 'K.A', 'K.B', 'K.A'])
      verarbeite(p, ereignis({ vorlage: v, ts: (t += 60_000) }));
    expect([...p.staende.values()][0]?.status).toBe('gekonnt');
    // jede Vorlage bei Fälligkeit wiederholen, bis gefestigt
    for (let runde = 0; runde < 6 && [...p.staende.values()][0]?.status !== 'gefestigt'; runde++) {
      for (const v of ['K.A', 'K.B']) {
        const karte = p.karten.get(`P|${v}|G`) as Karte;
        t = Math.max(t + 60_000, karte.faellig);
        verarbeite(p, ereignis({ vorlage: v, ts: t, faellig: true }));
      }
    }
    const stand = [...p.staende.values()][0];
    expect(stand?.status).toBe('gefestigt');
    const karten = kartenVon(p.karten.values(), 'P', 'K', 'G');
    expect(anzeigeStatus(stand, karten, t)).toBe('gefestigt');
    // Lange nicht wiederholt: Erinnerung fällt unter 80 % → auffrischen
    const spaet = t + 3650 * TAG;
    expect(karten.some((k) => erinnerung(k, spaet) < 0.8)).toBe(true);
    expect(anzeigeStatus(stand, karten, spaet)).toBe('auffrischen');
  });

  it('nicht gefestigt, solange keine 7 Tage seit „gekonnt“ vergangen sind', () => {
    const p: Projektion = { staende: new Map(), karten: new Map() };
    let t = Date.UTC(2026, 9, 1, 10);
    for (const v of ['K.A', 'K.B', 'K.A', 'K.B', 'K.A'])
      verarbeite(p, ereignis({ vorlage: v, ts: (t += 60_000) }));
    // Wiederholungen „fällig“ markiert, aber alle am selben Tag
    for (let i = 0; i < 6; i++)
      verarbeite(p, ereignis({ vorlage: i % 2 ? 'K.B' : 'K.A', ts: (t += 60_000), faellig: true }));
    expect([...p.staende.values()][0]?.status).toBe('gekonnt');
  });

  it('ohne Stand: neu', () => {
    expect(anzeigeStatus(undefined, [], 0)).toBe('neu');
  });
});

describe('Diagnose (LEHRPLAN §7)', () => {
  it('zwei richtige aus zwei Vorlagen: gekonnt, aber nicht gefestigt', () => {
    const d = { modus: 'diagnose' as const, bewertung: null, sitzung: 'D1' };
    expect(folge([d, { ...d, vorlage: 'K.B' }])?.status).toBe('gekonnt');
  });
  it('eine falsche ist erlaubt, zwei nicht; andere Sitzung zählt neu', () => {
    const d = { modus: 'diagnose' as const, bewertung: null, sitzung: 'D1' };
    const f = { ...d, ergebnis: 'falsch' as const };
    expect(folge([d, f, { ...d, vorlage: 'K.B' }])?.status).toBe('gekonnt');
    expect(folge([f, f, d, { ...d, vorlage: 'K.B' }])?.status).toBe('in-arbeit');
    expect(folge([d, { ...d, sitzung: 'D2', vorlage: 'K.B' }])?.status).toBe('in-arbeit');
  });
});

describe('Pflicht-Test D-6: fortgeschrieben = neu aufgebaut', () => {
  it('für zufällige Ereignisfolgen über mehrere Wochen', () => {
    const arb = fc.array(
      fc.record({
        kompetenz: fc.constantFrom('K', 'L'),
        niveau: fc.constantFrom('G' as const, 'M' as const),
        vorlage: fc.constantFrom('A', 'B', 'C'),
        ergebnis: fc.constantFrom('richtig' as const, 'falsch' as const, 'uebersprungen' as const),
        hilfen: fc.integer({ min: 0, max: 2 }),
        faellig: fc.boolean(),
        modus: fc.constantFrom('ueben' as const, 'diagnose' as const),
        abstand: fc.integer({ min: 0, max: 5 * TAG }),
      }),
      { maxLength: 60 },
    );
    fc.assert(
      fc.property(arb, (teile) => {
        let ts = Date.UTC(2026, 9, 1);
        const ereignisse = teile.map(({ abstand, ...t }) =>
          ereignis({
            ...t,
            vorlage: `${t.kompetenz}.${t.vorlage}`,
            ts: (ts += abstand + 1),
            bewertung:
              t.ergebnis === 'uebersprungen'
                ? null
                : t.ergebnis === 'falsch'
                  ? 'nochmal'
                  : t.hilfen > 0
                    ? 'schwer'
                    : 'gut',
          }),
        );
        const inkrementell: Projektion = { staende: new Map(), karten: new Map() };
        for (const e of ereignisse) verarbeite(inkrementell, e);
        // Neuaufbau aus gemischter Reihenfolge: sortiert selbst nach Zeit
        const neu = neuAufbauen([...ereignisse].reverse());
        expect(neu.staende).toEqual(inkrementell.staende);
        expect(neu.karten).toEqual(inkrementell.karten);
      }),
      { numRuns: 1000 },
    );
  });
});
