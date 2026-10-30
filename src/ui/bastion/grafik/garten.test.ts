import { describe, expect, it } from 'vitest';
import { GEBAEUDE_TYPEN, START } from '../../../core/bastion/katalog';
import { BUEHNE_H } from './iso';
import { LEERE_EINGABE, type GartenEingabe } from './freischalten';
import { GARTEN_BILD, gartenHoehe, istBegehbar, rasenFarbe, zwergPosen } from './garten';

const voll = Array.from({ length: 12 }, (_, y) =>
  Array.from({ length: 12 }, (_, x) => ({ typ: 'einfassung' as const, stufe: 1, pos: { x, y } })),
).flat();

describe('Gartenbilder', () => {
  it('jede Rolle hat ein eigenes Bild, Höhen bleiben im Bild', () => {
    for (const typ of GEBAEUDE_TYPEN) expect(GARTEN_BILD[typ], typ).toBeTruthy();
    expect(new Set(Object.values(GARTEN_BILD)).size).toBe(GEBAEUDE_TYPEN.length);
    for (const typ of GEBAEUDE_TYPEN) {
      expect(gartenHoehe(typ, 1)).toBeGreaterThan(0);
      expect(gartenHoehe(typ, 1)).toBeLessThan(BUEHNE_H);
    }
    expect(gartenHoehe('kern', 2)).toBeGreaterThan(gartenHoehe('kern', 1));
    expect(gartenHoehe('turm', 3)).toBeGreaterThan(gartenHoehe('turm', 1));
    expect(gartenHoehe('einfassung', 2)).toBe(gartenHoehe('einfassung', 1));
  });

  it('die Wiese ist fest und am Abend dunkler', () => {
    expect(rasenFarbe(false, 0, 0, true)).toBe('#23402c');
    expect(rasenFarbe(true, -1, 0, true)).toBe('#142018');
    expect(rasenFarbe(false, 0, 0, false)).toBe(rasenFarbe(false, 0, 0, false));
    expect(rasenFarbe(true, 0, 0, false)).not.toBe(rasenFarbe(false, 0, 0, false));
  });
});

describe('Gartenzwerge', () => {
  it('am Anfang ein Zwerg, mit mehr Fortschritt zwei und drei', () => {
    expect(zwergPosen(START, START, LEERE_EINGABE, 0, false)).toHaveLength(1);
    const viel: GartenEingabe = { ...LEERE_EINGABE, fleiss: 12 };
    expect(zwergPosen(START, START, viel, 0, false)).toHaveLength(2);
    expect(zwergPosen(START, START, { ...LEERE_EINGABE, fleiss: 40 }, 0, false)).toHaveLength(3);
  });

  it('läuft nur über freie Kacheln, ruhig, und bleibt bei reduzierter Bewegung stehen', () => {
    const posenBei = (t: number, ruhig = false) =>
      zwergPosen(START, START, LEERE_EINGABE, t, ruhig);
    const still = posenBei(0, true)[0];
    expect(still).toBeTruthy();
    expect(posenBei(30, true)[0]).toMatchObject({ x: still?.x, y: still?.y, feld: still?.feld });
    const taetigkeiten = new Set<string>();
    let vorher = posenBei(0)[0];
    expect(vorher && istBegehbar(START, vorher.feld)).toBe(true);
    for (let t = 0.5; t <= 45; t += 0.5) {
      const pose = posenBei(t)[0];
      expect(pose && istBegehbar(START, pose.feld), `t=${t}`).toBe(true);
      if (vorher && pose) {
        const schritte =
          Math.abs(pose.feld.x - vorher.feld.x) + Math.abs(pose.feld.y - vorher.feld.y);
        expect(schritte, `t=${t}`).toBeLessThanOrEqual(1);
      }
      if (pose) taetigkeiten.add(pose.tat);
      vorher = pose;
    }
    expect(taetigkeiten.has('laufen') || taetigkeiten.has('stehen')).toBe(true);
    expect(taetigkeiten.has('teich')).toBe(true);
  });

  it('arbeitet am Blumenbeet, wenn eines da ist, und betritt es nicht', () => {
    const beet = { typ: 'flaeche' as const, stufe: 1, pos: { x: 4, y: 8 } };
    const welt = [...START, beet];
    const gesehen = new Set<string>();
    for (let t = 0; t <= 40; t += 0.5) {
      const pose = zwergPosen(welt, welt, LEERE_EINGABE, t, false)[0];
      expect(pose && istBegehbar(welt, pose.feld)).toBe(true);
      if (pose?.tat === 'beet') gesehen.add('beet');
    }
    expect(gesehen.has('beet')).toBe(true);
  });

  it('ohne freie Kachel gibt es keinen Zwerg auf dem Feld', () => {
    expect(zwergPosen(voll, voll, LEERE_EINGABE, 0, false)).toEqual([]);
  });
});
