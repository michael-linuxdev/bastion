import { describe, expect, it } from 'vitest';
import type { AufgabeEreignis } from '../learning/ereignis';
import { erinnerung, fortschreibenKarte, istFaellig, type Karte } from './karten';

const TAG = 86_400_000;
const START = Date.UTC(2026, 9, 28, 10);
const e = (ts: number, teil: Partial<AufgabeEreignis> = {}): AufgabeEreignis => ({
  id: String(ts),
  art: 'aufgabe',
  v: 1,
  profil: 'P',
  ts,
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
  dauerMs: 1,
  faellig: false,
  bewertung: 'gut',
  ...teil,
});

describe('Wiederholungskarten (FSRS)', () => {
  it('plant nach „gut“ in die Zukunft und nach „nochmal“ früher', () => {
    const gut = fortschreibenKarte(undefined, e(START)) as Karte;
    const schlecht = fortschreibenKarte(
      undefined,
      e(START, { ergebnis: 'falsch', bewertung: 'nochmal' }),
    ) as Karte;
    expect(gut.faellig).toBeGreaterThan(START);
    expect(gut.faellig).toBeGreaterThan(schlecht.faellig);
    expect(istFaellig(gut, START)).toBe(false);
    expect(istFaellig(gut, gut.faellig)).toBe(true);
  });

  it('Abstände wachsen mit jeder bestandenen Wiederholung', () => {
    let k = fortschreibenKarte(undefined, e(START)) as Karte;
    const abstaende: number[] = [];
    for (let i = 0; i < 4; i++) {
      const t = k.faellig;
      const neu = fortschreibenKarte(k, e(t, { faellig: true })) as Karte;
      abstaende.push(neu.faellig - t);
      k = neu;
    }
    expect(abstaende.every((a, i) => i === 0 || a > (abstaende[i - 1] ?? 0))).toBe(true);
    expect(k.bestandenFaellig).toBe(4);
  });

  it('Erinnerung sinkt mit der Zeit und liegt bei Fälligkeit nahe 90 %', () => {
    const k = fortschreibenKarte(undefined, e(START)) as Karte;
    expect(erinnerung(k, START + TAG / 24)).toBeGreaterThan(erinnerung(k, k.faellig));
    expect(erinnerung(k, k.faellig)).toBeGreaterThan(0.85);
    expect(erinnerung(k, k.faellig)).toBeLessThan(0.95);
  });

  it('ist wiederholbar: gleiche Ereignisse, gleiche Karte', () => {
    const a = fortschreibenKarte(fortschreibenKarte(undefined, e(START)), e(START + 3 * TAG));
    const b = fortschreibenKarte(fortschreibenKarte(undefined, e(START)), e(START + 3 * TAG));
    expect(a).toEqual(b);
  });

  it('übersprungene Aufgaben (ohne Bewertung) ändern nichts', () => {
    expect(fortschreibenKarte(undefined, e(START, { bewertung: null }))).toBeUndefined();
  });
});
