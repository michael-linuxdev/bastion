import { describe, expect, it } from 'vitest';
import { WETTER_PROBEN, wetterMitProbe } from './wetter-probe.svelte';

describe('Wetter zum Ausprobieren', () => {
  it('Automatisch lässt das Wetter, wie es ist', () => {
    expect(wetterMitProbe('auto', 'regen', false)).toEqual({ bild: 'regen', regenbogen: false });
    expect(wetterMitProbe('auto', 'klar', true)).toEqual({ bild: 'klar', regenbogen: true });
  });

  it('eine Wahl ersetzt das Wetter; Regenbogen über leichten Wolken', () => {
    expect(wetterMitProbe('sturm', 'klar', true)).toEqual({ bild: 'sturm', regenbogen: false });
    expect(wetterMitProbe('regenbogen', 'schnee', false)).toEqual({
      bild: 'bewoelkt',
      regenbogen: true,
    });
  });

  it('bietet alle Wetterbilder und den Regenbogen an', () => {
    expect(WETTER_PROBEN).toContain('sturm');
    expect(WETTER_PROBEN).toContain('regenbogen');
    expect(WETTER_PROBEN[0]).toBe('auto');
  });
});
