import { describe, expect, it } from 'vitest';
import {
  BASEBAU_SCHLUESSEL,
  basebauAktiv,
  aktuelleEinstellungen,
  aufDiesemGeraet,
  vonAnderemGeraet,
  type EinstellungEreignis,
} from './einstellung';

const e = (teil: Partial<EinstellungEreignis>): EinstellungEreignis => ({
  id: 'A',
  art: 'einstellung',
  v: 1,
  profil: 'P',
  ts: 0,
  tag: '2026-10-28',
  geraet: 'G1',
  schluessel: 'k',
  wert: 1,
  durch: 'jugendlich',
  ...teil,
});

describe('Einstellungen', () => {
  it('pro Schlüssel gilt die jüngste Änderung, bei gleicher Zeit die der Eltern (§7.3)', () => {
    const liste = [
      e({ id: '1', ts: 1, wert: 'alt' }),
      e({ id: '2', ts: 3, wert: 'neu' }),
      e({ id: '3', ts: 2, wert: 'mitte' }),
      e({ id: '4', schluessel: 'j', ts: 5, wert: 'kind', durch: 'jugendlich' }),
      e({ id: '0', schluessel: 'j', ts: 5, wert: 'eltern', durch: 'eltern' }),
    ];
    const werte = new Map(aktuelleEinstellungen(liste).map((x) => [x.schluessel, x.wert]));
    expect(werte).toEqual(
      new Map([
        ['k', 'neu'],
        ['j', 'eltern'],
      ]),
    );
    // Reihenfolge der Ereignisse spielt keine Rolle
    expect(
      new Map(aktuelleEinstellungen([...liste].reverse()).map((x) => [x.schluessel, x.wert])),
    ).toEqual(werte);
  });
  it('PIN gilt je Gerät (D-15)', () => {
    const liste = [
      e({ id: '1', geraet: 'ALT', schluessel: 'eltern.pin', ts: 9, wert: 'alt' }),
      e({ id: '2', geraet: 'NEU', schluessel: 'eltern.pin', ts: 1, wert: 'neu' }),
    ];
    expect(aufDiesemGeraet(liste, 'eltern.pin', 'NEU')?.wert).toBe('neu');
    expect(aufDiesemGeraet(liste, 'eltern.pin', 'DRITT')).toBeUndefined();
    expect(vonAnderemGeraet(liste, 'eltern.pin', 'DRITT')).toBe(true);
    expect(vonAnderemGeraet(liste.slice(1), 'eltern.pin', 'NEU')).toBe(false);
  });
});

describe('Basebau-Schalter (R7, B-13)', () => {
  it('Standard an; nur ein ausdrückliches „aus“ schaltet ab', () => {
    expect(basebauAktiv(undefined)).toBe(true);
    expect(basebauAktiv(true)).toBe(true);
    expect(basebauAktiv(false)).toBe(false);
    expect(basebauAktiv('irgendwas')).toBe(true);
    expect(BASEBAU_SCHLUESSEL).toBe('basebau.aktiv');
  });
});
