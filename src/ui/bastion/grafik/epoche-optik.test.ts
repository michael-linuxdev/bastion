import { describe, expect, it } from 'vitest';
import { epocheOptik, farbeSkalieren } from './epoche-optik';

describe('Epoche-Optik (G10)', () => {
  it('spätere Epochen sind höher und die Einfassung dicker', () => {
    expect(epocheOptik(1).hoehePlus).toBe(0);
    expect(epocheOptik(4).hoehePlus).toBeGreaterThan(epocheOptik(2).hoehePlus);
    expect(epocheOptik(4).einfassungDicke).toBeGreaterThan(epocheOptik(1).einfassungDicke);
    expect(epocheOptik(4).kernAkzent).toBeTruthy();
  });

  it('farbeSkalieren dunkelt ab', () => {
    expect(farbeSkalieren('#808080', 0.5)).toBe('#404040');
    expect(farbeSkalieren('kein', 0.5)).toBe('kein');
  });
});
