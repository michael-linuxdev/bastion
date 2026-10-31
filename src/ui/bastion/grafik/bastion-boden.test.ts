import { describe, expect, it } from 'vitest';
import { bastionBodenKachel, bastionBodenTint } from './bastion-boden';
import { uwBodenKachel, uwBodenTint } from './unterwasser';
import { weltraumBodenKachel, weltraumBodenTint } from './weltraum';

describe('P3 Atlas-Boden-Kacheln', () => {
  it('Bastion: Rand außen, innen fest', () => {
    expect(bastionBodenKachel(-1, 0, 12, 12)).toBe('rand');
    const a = bastionBodenKachel(2, 3, 12, 12);
    expect(a === 'flaeche' || a === 'flaeche_b' || a === 'flaeche_hell').toBe(true);
    expect(bastionBodenKachel(2, 3, 12, 12)).toBe(a);
    expect(bastionBodenTint(false)).toBe(0xffffff);
    expect(bastionBodenTint(true)).not.toBe(0xffffff);
  });

  it('Unterwasser: Rand außen, innen fest', () => {
    expect(uwBodenKachel(12, 0, 12, 12)).toBe('rand');
    const a = uwBodenKachel(1, 1, 12, 12);
    expect(a === 'flaeche' || a === 'flaeche_b' || a === 'flaeche_hell').toBe(true);
    expect(uwBodenKachel(1, 1, 12, 12)).toBe(a);
    expect(uwBodenTint(true)).not.toBe(0xffffff);
  });

  it('Weltraum: Rand außen, innen fest', () => {
    expect(weltraumBodenKachel(0, -1, 12, 12)).toBe('rand');
    const a = weltraumBodenKachel(4, 5, 12, 12);
    expect(a === 'flaeche' || a === 'flaeche_b' || a === 'flaeche_hell').toBe(true);
    expect(weltraumBodenKachel(4, 5, 12, 12)).toBe(a);
    expect(weltraumBodenTint(false)).toBe(0xffffff);
  });
});
