import { describe, expect, it } from 'vitest';
import { freierPlatz, platzHindernisse, type Bastion } from '../../core/bastion/bauen';
import { BAUPLATZ, KATALOG, START } from '../../core/bastion/katalog';
import { vorgeschlagenerPlatz } from './platz-vorschlag';

const start: Bastion = { bauwerke: START, vorhaben: [], fertig: [], vorrat: 0, lager: [] };

describe('Platz-Vorschlag neben dem Bergfried', () => {
  it('liegt frei, direkt am Bergfried und nicht mehr oben links', () => {
    const pos = vorgeschlagenerPlatz(start, 'wissen');
    expect(pos).toBeDefined();
    if (!pos) return;
    expect(platzHindernisse(start, 'wissen', pos)).toEqual([]);
    expect(pos).not.toEqual(freierPlatz(start, 'wissen'));
    // berührt den Bergfried (Abstand der Rechtecke höchstens ein Feld)
    const kern = START.find((x) => x.typ === 'kern');
    if (!kern) throw new Error('kein Bergfried');
    const [kw, kt] = KATALOG.kern.groesse;
    const [w, t] = KATALOG.wissen.groesse;
    const luecke = (a: number, al: number, b: number, bl: number) =>
      Math.max(0, Math.max(a, b) - Math.min(a + al, b + bl));
    expect(luecke(pos.x, w, kern.pos.x, kw)).toBeLessThanOrEqual(1);
    expect(luecke(pos.y, t, kern.pos.y, kt)).toBeLessThanOrEqual(1);
  });

  it('ist eindeutig und ohne Bergfried an der Mitte des Bauplatzes', () => {
    const ohne: Bastion = { ...start, bauwerke: START.filter((x) => x.typ !== 'kern') };
    const pos = vorgeschlagenerPlatz(ohne, 'zeichen');
    expect(pos).toEqual(vorgeschlagenerPlatz(ohne, 'zeichen'));
    if (!pos) throw new Error('kein Platz');
    expect(Math.abs(pos.x + 0.5 - BAUPLATZ.breite / 2)).toBeLessThanOrEqual(1);
    expect(Math.abs(pos.y + 0.5 - BAUPLATZ.tiefe / 2)).toBeLessThanOrEqual(1);
  });

  it('voller Platz: kein Vorschlag, genau wie freierPlatz', () => {
    const voll: Bastion = {
      ...start,
      bauwerke: Array.from({ length: 144 }, (_, i) => ({
        id: `z${i}`,
        typ: 'zeichen' as const,
        stufe: 1,
        pos: { x: i % 12, y: Math.floor(i / 12) },
      })),
    };
    expect(vorgeschlagenerPlatz(voll, 'zeichen')).toBeUndefined();
    expect(freierPlatz(voll, 'zeichen')).toBeUndefined();
  });
});
