import { describe, expect, it } from 'vitest';
import { alleSitzungsBuchungen } from '../../src/core/ledger/regeln';
import { auswerten, PROFILE, simuliere } from './simulator';

const profil = (id: string) => {
  const p = PROFILE.find((x) => x.id === id);
  if (!p) throw new Error(id);
  return p;
};
const ohneHuelle = (b: { ressource: string; menge: number; bezug: string; tag: string }) => ({
  ressource: b.ressource,
  menge: b.menge,
  bezug: b.bezug,
  tag: b.tag,
});

describe('Simulator (T-9)', () => {
  it('rechnet mit den echten Regeln: Fortschreibung = Neuaufbau aus allen Sitzungen', () => {
    for (const id of ['P1', 'P6']) {
      const e = simuliere(profil(id), 120);
      const sim = e.buchungen.filter((b) => b.grund === 'sitzung').map(ohneHuelle);
      expect(sim).toEqual(alleSitzungsBuchungen(e.sitzungen, e.aufgabenListe).map(ohneHuelle));
    }
  });

  it('ist deterministisch', () => {
    expect(auswerten(simuliere(profil('P3'), 90))).toEqual(auswerten(simuliere(profil('P3'), 90)));
  });

  // Erwartungen aus BASEBAU §8 (mit B-19) – Schutz vor Rückschritten beim Balancing.
  it('BASEBAU §8: P1 in 9–12 Monaten, P2 höchstens doppelt so schnell, P3 ≤ 18 Monate, P4 nie', () => {
    const tag = (id: string) => simuliere(profil(id)).epocheTag;
    const p1 = tag('P1');
    expect(p1).toBeDefined();
    expect((p1 ?? 0) / 30.4).toBeGreaterThanOrEqual(9);
    expect((p1 ?? 0) / 30.4).toBeLessThanOrEqual(12);
    expect(tag('P2') ?? 0).toBeGreaterThanOrEqual((p1 ?? 0) / 2);
    expect((tag('P3') ?? Infinity) / 30.4).toBeLessThanOrEqual(18);
    expect(tag('P4')).toBeUndefined();
  }, 60_000);

  it('BASEBAU §8: Pause ohne Verlust (P5), Prüfungsphase ohne großen Vorteil (P7), P3 jede Woche Fortschritt', () => {
    const p1 = simuliere(profil('P1')).epocheTag ?? 0;
    const p5 = simuliere(profil('P5')).epocheTag ?? Infinity;
    const p7 = simuliere(profil('P7')).epocheTag ?? Infinity;
    // drei Wochen Pause kosten höchstens etwa diese drei Wochen und ein paar Tage Anlauf
    expect(p5 - p1).toBeLessThanOrEqual(21 + 21);
    expect(p1 - p7).toBeLessThanOrEqual(14);
    expect(auswerten(simuliere(profil('P3'))).wochenOhneFortschritt).toBe(0);
  }, 60_000);

  it('BASEBAU §8 (B-19): P1 höchstens etwa 8 Wochen ohne Gebäude, P6 baut fast so viel wie P1', () => {
    const p1 = auswerten(simuliere(profil('P1')));
    const p6 = auswerten(simuliere(profil('P6')));
    expect(p1.lueckeJahr1).toBeLessThanOrEqual(60);
    expect(p6.fertigJahr1).toBeGreaterThanOrEqual(0.85 * p1.fertigJahr1);
  }, 60_000);
});
