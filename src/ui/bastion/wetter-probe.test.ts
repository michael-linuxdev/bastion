import { describe, expect, it } from 'vitest';
import { WETTER_PROBEN, wetterMitProbe } from './wetter-probe.svelte';

const echt = (bild: 'regen' | 'klar', regenbogen = false) =>
  ({ bild, staerke: 'leicht', regenbogen }) as const;

describe('Wetter zum Ausprobieren', () => {
  it('Automatisch lässt das Wetter, wie es ist', () => {
    expect(wetterMitProbe('auto', echt('regen'))).toEqual(echt('regen'));
    expect(wetterMitProbe('auto', echt('klar', true))).toEqual(echt('klar', true));
  });

  it('eine Wahl ersetzt das Wetter; Regenbogen über leichten Wolken', () => {
    expect(wetterMitProbe('sturm', echt('klar', true))).toEqual({
      bild: 'sturm',
      staerke: 'mittel',
      regenbogen: false,
    });
    expect(wetterMitProbe('regenbogen', echt('regen'))).toEqual({
      bild: 'bewoelkt',
      staerke: 'mittel',
      regenbogen: true,
    });
  });

  it('Niesel bis Starkregen, leichter Schnee bis Gestöber', () => {
    expect(wetterMitProbe('niesel', echt('klar'))).toMatchObject({
      bild: 'regen',
      staerke: 'leicht',
    });
    expect(wetterMitProbe('starkregen', echt('klar'))).toMatchObject({
      bild: 'regen',
      staerke: 'stark',
    });
    expect(wetterMitProbe('schnee-leicht', echt('klar'))).toMatchObject({
      bild: 'schnee',
      staerke: 'leicht',
    });
    expect(wetterMitProbe('gestoeber', echt('klar'))).toMatchObject({
      bild: 'schnee',
      staerke: 'stark',
    });
  });

  it('bietet alle Wetterbilder, Stärken und den Regenbogen an', () => {
    for (const w of ['sturm', 'regenbogen', 'niesel', 'starkregen', 'gestoeber'] as const)
      expect(WETTER_PROBEN).toContain(w);
    expect(WETTER_PROBEN[0]).toBe('auto');
  });
});
