import { describe, expect, it } from 'vitest';
import type { Kompetenz } from '../competence/kompetenz';
import { auswahlAus, lernbereiche } from './gerade-dran';

const k = (
  id: string,
  feld: string,
  typisch: number,
  os?: [number, string],
  gy?: [number, string],
) =>
  ({
    id,
    feld,
    klassenstufe_typisch: [typisch],
    sachsen: {
      ...(os ? { oberschule: { klassenstufe: os[0], lernbereich: os[1] } } : {}),
      ...(gy ? { gymnasium: { klassenstufe: gy[0], lernbereich: gy[1] } } : {}),
    },
  }) as unknown as Kompetenz;

describe('Gerade dran (L-18)', () => {
  const ks = [
    k('ERW', 'brueche', 5, [6, 'LB 1 Brüche'], [5, 'LB 2 Brüche']),
    k('ADD', 'brueche', 6, [6, 'LB 1 Brüche'], [6, 'LB 1 Brüche']),
    k('KREIS', 'flaechen', 6, [6, 'LB 10 Kreise'], undefined),
    k('WINKEL', 'winkel', 6, [6, 'LB 2 Winkel'], [6, 'LB 3 Winkel']),
  ];

  it('gruppiert nach Lernbereich der Schulart – auch Vorgezogenes erscheint in der richtigen Klasse', () => {
    expect(
      lernbereiche(ks, 6, 'oberschule').map((l) => [l.name, l.kompetenzen.map((x) => x.id)]),
    ).toEqual([
      ['LB 1 Brüche', ['ERW', 'ADD']],
      ['LB 2 Winkel', ['WINKEL']],
      ['LB 10 Kreise', ['KREIS']],
    ]);
    expect(lernbereiche(ks, 6, 'gymnasium').map((l) => l.name)).toEqual([
      'LB 1 Brüche',
      'LB 3 Winkel',
    ]);
  });

  it('ohne Schulart nach Lernfeldern der Klasse', () => {
    expect(lernbereiche(ks, 6, undefined).map((l) => [l.art, l.name])).toEqual([
      ['feld', 'brueche'],
      ['feld', 'flaechen'],
      ['feld', 'winkel'],
    ]);
  });

  it('liest die gespeicherte Auswahl, Unbekanntes und Doppeltes fällt weg', () => {
    expect(auswahlAus('ADD,XYZ,ADD,KREIS', new Set(['ADD', 'KREIS']))).toEqual(['ADD', 'KREIS']);
    expect(auswahlAus(undefined, new Set())).toEqual([]);
  });
});
