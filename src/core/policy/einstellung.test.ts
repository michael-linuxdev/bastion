import { describe, expect, it } from 'vitest';
import {
  szenerieAus,
  modusAus,
  MODUS_SCHLUESSEL,
  orientierungAus,
  ORIENTIERUNG_SCHLUESSEL,
  BASEBAU_SCHLUESSEL,
  basebauAktiv,
  aktuelleEinstellungen,
  aufDiesemGeraet,
  vonAnderemGeraet,
  soundStufeAus,
  SOUND_SCHLUESSEL,
  kontrastAn,
  KONTRAST_SCHLUESSEL,
  SCHRIFT_SCHLUESSEL,
  schriftAus,
  type EinstellungEreignis,
} from './einstellung';

const e = (teil: Partial<EinstellungEreignis>): EinstellungEreignis => ({
  id: 'A',
  art: 'einstellung',
  v: 1,
  profil: 'P',
  ts: 0,
  tag: '2026-10-28',
  geraet: 'G1',
  schluessel: 'k',
  wert: 1,
  durch: 'jugendlich',
  ...teil,
});

describe('Einstellungen', () => {
  it('pro Schlüssel gilt die jüngste Änderung, bei gleicher Zeit die der Eltern (§7.3)', () => {
    const liste = [
      e({ id: '1', ts: 1, wert: 'alt' }),
      e({ id: '2', ts: 3, wert: 'neu' }),
      e({ id: '3', ts: 2, wert: 'mitte' }),
      e({ id: '4', schluessel: 'j', ts: 5, wert: 'kind', durch: 'jugendlich' }),
      e({ id: '0', schluessel: 'j', ts: 5, wert: 'eltern', durch: 'eltern' }),
    ];
    const werte = new Map(aktuelleEinstellungen(liste).map((x) => [x.schluessel, x.wert]));
    expect(werte).toEqual(
      new Map([
        ['k', 'neu'],
        ['j', 'eltern'],
      ]),
    );
    // Reihenfolge der Ereignisse spielt keine Rolle
    expect(
      new Map(aktuelleEinstellungen([...liste].reverse()).map((x) => [x.schluessel, x.wert])),
    ).toEqual(werte);
  });
  it('PIN gilt je Gerät (D-15)', () => {
    const liste = [
      e({ id: '1', geraet: 'ALT', schluessel: 'eltern.pin', ts: 9, wert: 'alt' }),
      e({ id: '2', geraet: 'NEU', schluessel: 'eltern.pin', ts: 1, wert: 'neu' }),
    ];
    expect(aufDiesemGeraet(liste, 'eltern.pin', 'NEU')?.wert).toBe('neu');
    expect(aufDiesemGeraet(liste, 'eltern.pin', 'DRITT')).toBeUndefined();
    expect(vonAnderemGeraet(liste, 'eltern.pin', 'DRITT')).toBe(true);
    expect(vonAnderemGeraet(liste.slice(1), 'eltern.pin', 'NEU')).toBe(false);
  });
});

describe('Basebau-Schalter (R7, B-13)', () => {
  it('Standard an; nur ein ausdrückliches „aus“ schaltet ab', () => {
    expect(basebauAktiv(undefined)).toBe(true);
    expect(basebauAktiv(true)).toBe(true);
    expect(basebauAktiv(false)).toBe(false);
    expect(basebauAktiv('irgendwas')).toBe(true);
    expect(BASEBAU_SCHLUESSEL).toBe('basebau.aktiv');
  });
});

describe('Test-Rohstoffe (Eltern)', () => {
  it('nur ausdrückliches true schaltet ein', async () => {
    const { TEST_ROHSTOFFE_SCHLUESSEL, testRohstoffeAn } = await import('./einstellung');
    expect(testRohstoffeAn(undefined)).toBe(false);
    expect(testRohstoffeAn(false)).toBe(false);
    expect(testRohstoffeAn(true)).toBe(true);
    expect(TEST_ROHSTOFFE_SCHLUESSEL).toBe('bastion.test-rohstoffe');
  });
});

describe('Hell, dunkel, System (GRAFIK §2)', () => {
  it('Standard ist System; nur bekannte Werte gelten', () => {
    expect(modusAus(undefined)).toBe('system');
    expect(modusAus('hell')).toBe('hell');
    expect(modusAus('dunkel')).toBe('dunkel');
    expect(modusAus('lila')).toBe('system');
    expect(MODUS_SCHLUESSEL).toBe('darstellung.modus');
  });
});

describe('Orientierung (Bildschirm drehen)', () => {
  it('Standard ist auto; nur bekannte Werte gelten', () => {
    expect(orientierungAus(undefined)).toBe('auto');
    expect(orientierungAus('hoch')).toBe('hoch');
    expect(orientierungAus('quer')).toBe('quer');
    expect(orientierungAus('schraeg')).toBe('auto');
    expect(ORIENTIERUNG_SCHLUESSEL).toBe('darstellung.orientierung');
  });
});

describe('Sound-Stufen (W113)', () => {
  it('Standard aus; boolean-Altwerte und Stufen', () => {
    expect(soundStufeAus(undefined)).toBe('aus');
    expect(soundStufeAus(false)).toBe('aus');
    expect(soundStufeAus(true)).toBe('bastion');
    expect(soundStufeAus('ui')).toBe('ui');
    expect(soundStufeAus('bastion')).toBe('bastion');
    expect(soundStufeAus('aus')).toBe('aus');
    expect(soundStufeAus('laut')).toBe('aus');
    expect(SOUND_SCHLUESSEL).toBe('basebau.sound');
  });
});

describe('Kontrast (V110)', () => {
  it('nur ausdrückliches true schaltet ein', () => {
    expect(kontrastAn(undefined)).toBe(false);
    expect(kontrastAn(false)).toBe(false);
    expect(kontrastAn(true)).toBe(true);
    expect(KONTRAST_SCHLUESSEL).toBe('darstellung.kontrast');
  });
});

describe('Schriftgröße (O19)', () => {
  it('drei Stufen, Unbekanntes wird „normal“', () => {
    expect(schriftAus(undefined)).toBe('normal');
    expect(schriftAus('gross')).toBe('gross');
    expect(schriftAus('sehr-gross')).toBe('sehr-gross');
    expect(schriftAus('riesig')).toBe('normal');
    expect(SCHRIFT_SCHLUESSEL).toBe('darstellung.schrift');
  });
});

describe('Bastion-Kamera und Bewohner-Namen (Design L)', () => {
  it('Schlüssel stehen fest', async () => {
    const { KAMERA_SCHLUESSEL, BEWOHNER_NAMEN_SCHLUESSEL } = await import('./einstellung');
    expect(KAMERA_SCHLUESSEL).toBe('basebau.kamera');
    expect(BEWOHNER_NAMEN_SCHLUESSEL).toBe('basebau.bewohner-namen');
  });
});

describe('Eigene Szenerie (basebau.szenerie)', () => {
  it('nimmt nur ganze Zahlen über 0, sonst Grundszenerie', () => {
    expect(szenerieAus(123)).toBe(123);
    expect(szenerieAus(0)).toBe(0);
    expect(szenerieAus(-5)).toBe(0);
    expect(szenerieAus(1.5)).toBe(0);
    expect(szenerieAus('7')).toBe(0);
    expect(szenerieAus(undefined)).toBe(0);
  });
});
