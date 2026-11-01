import { describe, expect, it } from 'vitest';
import { soundIstAn, soundSteuern, soundStufeAktuell, soundZuruecksetzen } from './sound';

describe('Bastion-Sound (GRAFIK §4.6, W113)', () => {
  it('Stufen: Ambient nur bei bastion und nicht ruhig', () => {
    soundZuruecksetzen();
    expect(soundIstAn()).toBe(false);
    expect(soundStufeAktuell()).toBe('aus');

    soundSteuern({ stufe: 'ui', ruhig: false });
    expect(soundIstAn()).toBe(false);
    expect(soundStufeAktuell()).toBe('ui');

    soundSteuern({ stufe: 'bastion', ruhig: false });
    expect(soundIstAn()).toBe(true);

    soundSteuern({ stufe: 'bastion', ruhig: true });
    expect(soundIstAn()).toBe(false);

    soundSteuern({ stufe: 'aus', ruhig: false });
    expect(soundIstAn()).toBe(false);
    soundZuruecksetzen();
  });
});
