import { describe, expect, it } from 'vitest';
import {
  BESTANDEN_ANTEIL,
  bewaehrungBauplan,
  bewaehrungBestanden,
  JOKER_MAX,
  MIN_AUFGABEN,
  turmJoker,
} from './bewaehrung';
import type { Bauwerk } from './katalog';

const turm = (stufe: number, id: string): Bauwerk => ({
  id,
  typ: 'turm',
  stufe,
  pos: { x: 0, y: 0 },
});

describe('Bewährungsprobe (BASEBAU §5.6)', () => {
  it('Joker = Summe Turm-Stufen, höchstens 5', () => {
    expect(turmJoker([])).toBe(0);
    expect(turmJoker([turm(2, 'a'), turm(3, 'b')])).toBe(5);
    expect(turmJoker([turm(3, 'a'), turm(3, 'b')])).toBe(JOKER_MAX);
  });

  it('bestanden ab Anteil und Mindestzahl', () => {
    expect(bewaehrungBestanden(2, 2)).toBe(false); // unter MIN_AUFGABEN
    expect(MIN_AUFGABEN).toBe(3);
    expect(bewaehrungBestanden(3, 4)).toBe(3 / 4 >= BESTANDEN_ANTEIL);
    expect(bewaehrungBestanden(2, 4)).toBe(false);
    expect(bewaehrungBestanden(3, 3)).toBe(true);
  });

  it('Ernstfall-Bauplan', () => {
    expect(bewaehrungBauplan('bewaehrung:t1', '2026-10-31')).toMatchObject({
      ressource: 'koennen',
      menge: 1,
      grund: 'belagerung',
      bezug: 'bewaehrung:t1',
    });
  });
});
