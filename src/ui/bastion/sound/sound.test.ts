import { describe, expect, it } from 'vitest';
import { soundIstAn, soundSteuern, soundZuruecksetzen } from './sound';

describe('Bastion-Sound (GRAFIK §4.6)', () => {
  it('Standard und Ruhig: Ambient/Tipp nur wenn an und nicht ruhig', () => {
    soundZuruecksetzen();
    expect(soundIstAn()).toBe(false);
    soundSteuern({ an: true, ruhig: false });
    expect(soundIstAn()).toBe(true);
    soundSteuern({ an: true, ruhig: true });
    expect(soundIstAn()).toBe(false);
    soundSteuern({ an: false, ruhig: false });
    expect(soundIstAn()).toBe(false);
    soundZuruecksetzen();
  });
});
