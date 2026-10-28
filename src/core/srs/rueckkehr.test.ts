import { describe, expect, it } from 'vitest';
import type { Karte } from './karten';
import { erinnerung } from './karten';
import { istRueckkehr, RUECKKEHR, wiederholRunde } from './rueckkehr';

const TAG = 86_400_000;
const JETZT = Date.UTC(2026, 10, 20, 10);
const karte = (i: number, letzteVorTagen: number, stabilitaet: number): Karte => ({
  profil: 'P',
  kompetenz: 'K',
  vorlage: `K.${i}`,
  niveau: 'G',
  faellig: JETZT - letzteVorTagen * TAG + stabilitaet * TAG,
  stabilitaet,
  schwierigkeit: 5,
  geplanteTage: stabilitaet,
  lernschritte: 0,
  wiederholungen: 2,
  fehler: 0,
  zustand: 2,
  letzte: JETZT - letzteVorTagen * TAG,
  bestandenFaellig: 0,
});

describe('Rückkehrmodus (BASEBAU §6.3)', () => {
  it('erkennt eine Pause von mehr als 7 Tagen, aber nicht den ersten Start', () => {
    expect(istRueckkehr([], JETZT)).toBe(false);
    expect(istRueckkehr([karte(1, 3, 2)], JETZT)).toBe(false);
    expect(istRueckkehr([karte(1, 8, 2), karte(2, 30, 2)], JETZT)).toBe(true);
    expect(istRueckkehr([karte(1, 8, 2), karte(2, 1, 2)], JETZT)).toBe(false);
  });

  it('portioniert auf höchstens 20, die gefährdetsten zuerst', () => {
    const viele = Array.from({ length: 50 }, (_, i) => karte(i, 30, 1 + (i % 10)));
    const runde = wiederholRunde(viele, JETZT);
    expect(runde).toHaveLength(RUECKKEHR.portion);
    const r = runde.map((k) => erinnerung(k, JETZT));
    expect(r.every((x, i) => i === 0 || x >= (r[i - 1] ?? 0))).toBe(true);
    // keine der weggelassenen Karten ist gefährdeter als die letzte aufgenommene
    const grenze = r.at(-1) ?? 0;
    const rest = viele.filter((k) => !runde.includes(k)).map((k) => erinnerung(k, JETZT));
    expect(rest.every((x) => x >= grenze)).toBe(true);
  });

  it('nimmt nur fällige Karten', () => {
    expect(wiederholRunde([karte(1, 1, 30)], JETZT)).toEqual([]);
  });
});
