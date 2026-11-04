import { describe, expect, it } from 'vitest';
import type { Bauwerk } from '../../../core/bastion/katalog';
import { belegteFelder, feldSchluessel } from './pfad';
import {
  AUFBRUCH,
  FEIERABEND,
  SCHRITT,
  bewohnerOrt,
  bewohnerWege,
  feldVor,
  sekundeDesTages,
  wegSuchen,
  wegeFelder,
  wegeListe,
} from './tagesablauf';

const platz = { breite: 12, tiefe: 12 };
const bauwerke: Bauwerk[] = [
  { id: 'k', typ: 'kern', stufe: 2, pos: { x: 4, y: 4 } },
  { id: 'w', typ: 'werkstatt', stufe: 1, pos: { x: 9, y: 1 } },
  { id: 'z', typ: 'zeichen', stufe: 1, pos: { x: 1, y: 9 } },
];
const belegt = belegteFelder(bauwerke);
const [kern, werkstatt] = bauwerke as [Bauwerk, Bauwerk, Bauwerk];
/** Feld vor einem Gebäude; im Test gibt es immer eines */
const vor = (b: Bauwerk) => feldVor(b, belegt, platz) ?? { x: -1, y: -1 };

describe('tagesablauf', () => {
  it('Wege liegen nur auf freien Feldern und verbinden den Bergfried mit jedem Gebäude', () => {
    const wege = wegeFelder(bauwerke, belegt, platz);
    expect(wege.size).toBeGreaterThan(4);
    for (const k of wege) expect(belegt.has(k)).toBe(false);
    const vorKern = vor(kern);
    const vorWerkstatt = vor(werkstatt);
    expect(wege.has(feldSchluessel(vorKern.x, vorKern.y))).toBe(true);
    expect(wege.has(feldSchluessel(vorWerkstatt.x, vorWerkstatt.y))).toBe(true);
  });

  it('Wege biegen selten ab: auf freier Fläche höchstens ein Knick', () => {
    const weg = wegSuchen({ x: 0, y: 0 }, { x: 5, y: 4 }, new Set(), platz);
    expect(weg).toHaveLength(10);
    let knicke = 0;
    weg.forEach((c, i) => {
      const a = weg[i - 2];
      const b = weg[i - 1];
      if (a && b && (b.x - a.x !== c.x - b.x || b.y - a.y !== c.y - b.y)) knicke++;
    });
    expect(knicke).toBe(1);
  });

  it('keine Wege zu Mauerstücken und Flächen', () => {
    const mitMauer: Bauwerk[] = [
      ...bauwerke,
      { id: 'm', typ: 'einfassung', stufe: 1, pos: { x: 0, y: 0 } },
    ];
    expect(wegeListe(mitMauer, belegteFelder(mitMauer), platz)).toHaveLength(2);
  });

  it('ist fest: gleiche Bauwerke, gleiche Wege', () => {
    expect([...wegeFelder(bauwerke, belegt, platz)]).toEqual([
      ...wegeFelder(bauwerke, belegt, platz),
    ]);
  });

  const arbeit = vor(werkstatt);
  const wege = bewohnerWege(0, arbeit, bauwerke, belegt, platz);

  it('nachts drinnen, morgens auf dem Weg, tagsüber bei der Arbeit, abends heim', () => {
    expect(bewohnerOrt(sekundeDesTages(3, 0, 0), 0, wege).phase).toBe('drinnen');
    expect(bewohnerOrt(AUFBRUCH - 1, 0, wege).phase).toBe('drinnen');
    const unterwegs = bewohnerOrt(AUFBRUCH + SCHRITT * 1.5, 0, wege);
    expect(unterwegs.phase).toBe('hinweg');
    expect(unterwegs.geht).toBe(true);
    expect(bewohnerOrt(sekundeDesTages(9, 1, 0), 0, wege).phase).toMatch(/arbeit|besorgung/);
    expect(bewohnerOrt(FEIERABEND + SCHRITT, 0, wege).phase).toBe('heimweg');
    expect(bewohnerOrt(sekundeDesTages(23, 0, 0), 0, wege).phase).toBe('drinnen');
  });

  it('Hinweg beginnt zu Hause und endet an der Arbeit', () => {
    const start = bewohnerOrt(AUFBRUCH, 0, wege);
    expect([start.gx, start.gy]).toEqual([wege.heim.x + 0.5, wege.heim.y + 0.5]);
    const dauer = (wege.hin.length - 1) * SCHRITT;
    const an = bewohnerOrt(AUFBRUCH + dauer + 1, 0, wege);
    expect(an.phase).not.toBe('hinweg');
  });

  it('macht tagsüber Besorgungen zum Platz und ist vor dem Feierabend zurück', () => {
    let besorgung = 0;
    for (let s = AUFBRUCH + 600; s < FEIERABEND; s += 5) {
      const o = bewohnerOrt(s, 0, wege);
      if (o.phase === 'besorgung') besorgung++;
      expect(['arbeit', 'besorgung']).toContain(o.phase);
    }
    expect(besorgung).toBeGreaterThan(10);
  });

  it('Bewohner brechen versetzt auf', () => {
    const w1 = bewohnerWege(1, arbeit, bauwerke, belegt, platz);
    expect(bewohnerOrt(AUFBRUCH + 10, 1, w1).phase).toBe('drinnen');
  });

  it('ohne Bergfried bleibt alles ruhig, ohne Fehler', () => {
    const leer = bewohnerWege(0, { x: 2, y: 2 }, [], new Set(), platz);
    expect(bewohnerOrt(sekundeDesTages(12, 0, 0), 0, leer).phase).toMatch(/arbeit|besorgung/);
    expect(wegeFelder([], new Set(), platz).size).toBe(0);
  });
});
