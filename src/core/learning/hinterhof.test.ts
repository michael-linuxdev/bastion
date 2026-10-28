import { describe, expect, it } from 'vitest';
import type { Kompetenz } from '../competence/kompetenz';
import type { AufgabeEreignis } from './ereignis';
import type { KompetenzStand } from './fortschritt';
import { hinterhof } from './hinterhof';

const kompetenz = (id: string, feld: string, klasse: number): Kompetenz =>
  ({ id, feld, klassenstufe_typisch: [klasse] }) as unknown as Kompetenz;
const stand = (
  k: string,
  niveau: 'G' | 'M',
  teil: Partial<KompetenzStand> = {},
): KompetenzStand => ({
  profil: 'P',
  kompetenz: k,
  niveau,
  status: 'gefestigt',
  gekonntAm: '2026-10-01',
  gekonntTs: 1,
  gefestigtAm: '2026-10-10',
  aufgaben: 10,
  letzte: [],
  ...teil,
});
const diagnose = (k: string, ts: number) =>
  ({ modus: 'diagnose', kompetenz: k, niveau: 'G', ts }) as unknown as AufgabeEreignis;

describe('Hinterhof (B-25)', () => {
  const ks = [
    kompetenz('BR1', 'brueche', 5),
    kompetenz('BR2', 'brueche', 6),
    kompetenz('FK1', 'funktionen', 8),
    kompetenz('FK2', 'funktionen', 8),
    kompetenz('GL1', 'gleichungen', 7),
  ];

  it('füllt Plätze mit gefestigten Kompetenzen – M vor G – und lässt den Rest „offen“', () => {
    const h = hinterhof(ks, [stand('BR1', 'G'), stand('BR2', 'G'), stand('BR2', 'M')], [], 7);
    expect(h.map((f) => [f.feld, f.gefuellt, f.plaetze.map((p) => p.fuellung)])).toEqual([
      ['brueche', 2, ['G', 'M']],
      ['gleichungen', 0, ['offen']],
    ]);
  });

  it('zeigt spätere Klassen nur, wenn schon gefestigt – als vorausgearbeitet', () => {
    const h = hinterhof(ks, [stand('FK1', 'G')], [], 7);
    const fk = h.find((f) => f.feld === 'funktionen');
    expect(fk?.plaetze).toEqual([
      { kompetenz: 'FK1', klasse: 8, fuellung: 'G', vorwissen: false, voraus: true },
    ]);
  });

  it('markiert Vorwissen aus der Diagnose, gekonnt zählt noch nicht als gefüllt', () => {
    const nurGekonnt: KompetenzStand = {
      profil: 'P',
      kompetenz: 'GL1',
      niveau: 'G',
      status: 'gekonnt',
      gekonntAm: '2026-10-01',
      gekonntTs: 42,
      aufgaben: 2,
      letzte: [],
    };
    const h = hinterhof(ks, [nurGekonnt], [diagnose('GL1', 42)], 7);
    const gl = h.find((f) => f.feld === 'gleichungen')?.plaetze[0];
    expect(gl).toMatchObject({ fuellung: 'offen', vorwissen: true });
  });
});
