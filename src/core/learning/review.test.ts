import { describe, expect, it } from 'vitest';
import {
  neuerReview,
  OEFFENTLICHE_MINDESTSTUFE,
  pruefeReview,
  reviewHash,
  wirksameStufe,
  sha256Hex,
} from './review';

const inhalt = () => ({ id: 'M.ZO.BR.ERWEITERN', text: { de: 'Erweitere 2/5.' }, version: 1 });

const block = (daten: Record<string, unknown>, stufe: 1 | 2 | 3 = 1) => ({
  stufe,
  datum: '2026-10-30',
  pruefer: stufe === 1 ? 'maschine' : 'michael',
  hash: reviewHash(daten),
});

describe('Review-Stufen (INHALTSFORMAT §8)', () => {
  it('SHA-256 stimmt für die leere Zeichenkette und für abc', () => {
    expect(sha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
    expect(sha256Hex('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq')).toBe(
      '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1',
    );
    expect(sha256Hex('ä')).toBe('33e6d73fee82904c8d7afb78de1154d1e8dc2a0edb08120e63df5b9385c2d9cc');
  });

  it('ohne Feld ist die Stufe 0, der Block selbst ist erlaubt', () => {
    expect(pruefeReview(undefined)).toEqual([]);
    expect(wirksameStufe(inhalt())).toBe(0);
  });

  it('ein passender Block hält die Stufe', () => {
    const daten = inhalt();
    const mit = { ...daten, review: block(daten, 2) };
    expect(pruefeReview(mit.review)).toEqual([]);
    expect(wirksameStufe(mit)).toBe(2);
  });

  it('eine Änderung am Inhalt setzt auf Stufe 0 zurück, der Block bleibt formal gültig', () => {
    const daten = inhalt();
    const mit = { ...daten, review: block(daten, 3), text: { de: 'Erweitere 3/5.' } };
    expect(pruefeReview(mit.review)).toEqual([]);
    expect(wirksameStufe(mit)).toBe(0);
  });

  it('meldet eine kaputte Form', () => {
    expect(
      pruefeReview({ stufe: 0, datum: 'gestern', pruefer: '', hash: 'abc', von: 'x' }).join(' | '),
    ).toContain('review.stufe');
    expect(
      pruefeReview({ stufe: 1, datum: '2026-13-40', pruefer: 'maschine', hash: 'ab' }).join(' | '),
    ).toContain('review.datum');
    expect(pruefeReview('nein')).toEqual(['review ist keine Zuordnung']);
  });

  it('die öffentliche Seite verlangt mindestens Stufe 2', () => {
    expect(OEFFENTLICHE_MINDESTSTUFE).toBe(2);
  });
});

describe('neuen Review-Block bilden', () => {
  it('setzt Stufe 1 auf neuen Inhalt, mit passendem Hash', () => {
    const daten = inhalt();
    const r = neuerReview(daten, 1, 'maschine', '2026-10-31');
    expect('review' in r && wirksameStufe({ ...daten, review: r.review })).toBe(1);
  });

  it('verlangt die vorige Stufe', () => {
    expect(neuerReview(inhalt(), 2, 'Frau Beispiel', '2026-10-31')).toHaveProperty('fehler');
    const daten = inhalt();
    const mit = { ...daten, review: block(daten, 1) };
    expect(neuerReview(mit, 2, 'Frau Beispiel', '2026-10-31')).toHaveProperty('review');
    expect(neuerReview(mit, 3, 'u4b', '2026-10-31')).toHaveProperty('fehler');
  });

  it('fängt nach einer Änderung wieder bei Stufe 1 an', () => {
    const daten = inhalt();
    const geaendert = { ...daten, review: block(daten, 2), version: 2 };
    expect(neuerReview(geaendert, 2, 'Frau Beispiel', '2026-10-31')).toHaveProperty('fehler');
    expect(neuerReview(geaendert, 1, 'maschine', '2026-10-31')).toHaveProperty('review');
  });

  it('Stufe 1 hat nur den Prüfer maschine, Datum und Name werden geprüft', () => {
    expect(neuerReview(inhalt(), 1, 'Frau Beispiel', '2026-10-31')).toHaveProperty('fehler');
    expect(neuerReview(inhalt(), 1, 'maschine', '2026-02-30')).toHaveProperty('fehler');
  });
});
