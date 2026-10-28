import { describe, expect, it } from 'vitest';
import { leeresKonto, verbuche } from '../ledger/buchung';
import { bastionAus, beginnen } from './bauen';
import { vormerken, zielAus, ziellage, zielText } from './ziel';

const konto = (fleiss: number, behalten: number, koennen: number) =>
  [
    { ressource: 'fleiss' as const, menge: fleiss },
    { ressource: 'behalten' as const, menge: behalten },
    { ressource: 'koennen' as const, menge: koennen },
  ].reduce(verbuche, leeresKonto('P'));
const leer = bastionAus([], []);

describe('Ziel vormerken (B-20)', () => {
  it('zeigt, was noch fehlt, und was sonst im Weg steht', () => {
    const z = vormerken(leer, 'kern', 'start.kern');
    expect(z).toEqual({ typ: 'kern', stufe: 2, gebaeude: 'start.kern' });
    expect(ziellage(leer, konto(100, 90, 1), z)).toEqual({
      erreicht: false,
      fehlt: { fleiss: 150, behalten: 0, koennen: 1 },
      hindernisse: [],
    });
    // Werkstatt braucht Kern 2 – das steht im Weg, nicht nur die Ressourcen
    expect(ziellage(leer, konto(0, 0, 0), vormerken(leer, 'werkstatt')).hindernisse).toEqual([
      'voraussetzung',
    ]);
  });

  it('erreicht, sobald begonnen: Ausbau dieses Gebäudes, Neubau eines weiteren', () => {
    const k = konto(1000, 1000, 10);
    const turm = vormerken(leer, 'turm');
    const e = beginnen(
      leer,
      k,
      'turm',
      { pos: { x: 0, y: 0 } },
      {
        profil: 'P',
        geraet: 'g',
        id: 'V1',
        jetzt: 1,
        tag: '2026-11-01',
      },
    );
    if (!e.ok) throw new Error();
    const danach = bastionAus([e.bau], [...e.buchungen]);
    expect(ziellage(danach, k, turm).erreicht).toBe(true);
    // Ein zweiter Turm als neues Ziel ist noch nicht erreicht
    expect(ziellage(danach, k, vormerken(danach, 'turm')).erreicht).toBe(false);
  });

  it('wird als Text gespeichert; Unlesbares gilt als kein Ziel', () => {
    const z = vormerken(leer, 'eingang');
    expect(zielAus(zielText(z))).toEqual(z);
    for (const w of [undefined, '', '{kaputt', '{"typ":"burggraben","stufe":1}', 7])
      expect(zielAus(w)).toBeUndefined();
  });
});
