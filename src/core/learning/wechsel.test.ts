import { describe, expect, it } from 'vitest';
import type { Kompetenz } from '../competence/kompetenz';
import type { KompetenzStand } from './fortschritt';
import { schulartLuecken, uebersprungeneKlassen } from './wechsel';

const k = (id: string, os?: number, gy?: number): Kompetenz =>
  ({
    id,
    sachsen: {
      ...(os ? { oberschule: { klassenstufe: os, lernbereich: 'LB 1' } } : {}),
      ...(gy ? { gymnasium: { klassenstufe: gy, lernbereich: 'LB 1' } } : {}),
    },
  }) as unknown as Kompetenz;

describe('Wechsel begleiten (L-12)', () => {
  it('übersprungene Klassen: nur zwischen alt und neu und nur mit Inhalten', () => {
    expect(uebersprungeneKlassen(5, 8, [5, 6, 7, 8])).toEqual([6, 7]);
    expect(uebersprungeneKlassen(6, 7, [5, 6, 7, 8])).toEqual([]);
    expect(uebersprungeneKlassen(8, 6, [5, 6, 7, 8])).toEqual([]); // zurückgestellt: neutral
  });

  it('Schulartwechsel: was die neue Schulart bis zur Klasse schon hatte, die alte nicht', () => {
    const ks = [
      k('ERWEITERN', 6, 5),
      k('WINKELPAARE', 6, 5),
      k('BRUCH', 5, 5),
      k('NUR-GY', undefined, 6),
      k('SPAETER', 7, 7),
    ];
    const gekonnt: KompetenzStand = {
      profil: 'P',
      kompetenz: 'WINKELPAARE',
      niveau: 'G',
      status: 'gekonnt',
      gekonntAm: '2026-10-01',
      gekonntTs: 1,
      aufgaben: 5,
      letzte: [],
    };
    expect(schulartLuecken(ks, [gekonnt], 'oberschule', 'gymnasium', 6).map((x) => x.id)).toEqual([
      'NUR-GY',
    ]);
    expect(schulartLuecken(ks, [], 'oberschule', 'gymnasium', 5).map((x) => x.id)).toEqual([
      'ERWEITERN',
      'WINKELPAARE',
    ]);
    expect(schulartLuecken(ks, [], 'gymnasium', 'oberschule', 6)).toEqual([]);
    expect(schulartLuecken(ks, [], 'gymnasium', 'gymnasium', 6)).toEqual([]);
  });
});
