import { describe, expect, it } from 'vitest';
import { fleissBis } from '../ledger/regeln';
import {
  BAUPLATZ,
  hindernisse,
  KATALOG,
  kosten,
  START,
  type Bauwerk,
  type GebaeudeTyp,
} from './katalog';

const bau = (typ: GebaeudeTyp, stufe = 1, id: string = typ): Bauwerk => ({
  id,
  typ,
  stufe,
  pos: { x: 0, y: 0 },
});

describe('Katalog Epoche 1 (BASEBAU §5.2)', () => {
  it('Summe ohne Zierde: 2 000 Stein, 570 Erz, 17 Baupläne, etwa 100 Bauschritte', () => {
    const summe = { fleiss: 0, behalten: 0, koennen: 0, schritt: 0 };
    for (const g of Object.values(KATALOG)) {
      if (g.familie === 'zierde') continue;
      // Anzahl baubarer Exemplare: Palisaden 8 weitere, Späherturm 2, sonst 1
      const stueck = g.typ === 'einfassung' ? 36 : (g.hoechstens ?? 1);
      for (const s of g.stufen)
        for (const r of ['fleiss', 'behalten', 'koennen', 'schritt'] as const)
          summe[r] += s.kosten[r] * stueck;
    }
    // §5.2 mit 36 statt 8 Einfassungs-Stücken (B-22): 2 000 + 28 · 15 Fleiß, 93 + 28 Bauschritte
    expect(summe).toEqual({ fleiss: 2420, behalten: 570, koennen: 17, schritt: 121 });
  });

  it('die erste Lerneinheit reicht für ein Banner (§5.1)', () => {
    const zeichen = kosten('zeichen', 1);
    expect(zeichen).toBeDefined();
    expect(fleissBis(10)).toBeGreaterThanOrEqual(zeichen?.fleiss ?? Infinity);
    expect(zeichen).toMatchObject({ behalten: 0, koennen: 0, schritt: 1 });
  });

  it('Voraussetzungen verweisen auf vorhandene Stufen', () => {
    for (const g of Object.values(KATALOG))
      for (const s of g.stufen)
        if (s.braucht)
          expect(KATALOG[s.braucht.typ].stufen.length).toBeGreaterThanOrEqual(s.braucht.stufe);
  });
});

describe('Startzustand (§5.1)', () => {
  it('Bergfried 1, Feuerstelle, 4 Palisaden – auf dem Bauplatz, ohne Überlappung', () => {
    expect(START.map((b) => b.typ).sort()).toEqual([
      'einfassung',
      'einfassung',
      'einfassung',
      'einfassung',
      'kern',
      'ursprung',
    ]);
    const belegt = new Set<string>();
    for (const b of START) {
      const [w, t] = KATALOG[b.typ].groesse;
      for (let x = b.pos.x; x < b.pos.x + w; x++)
        for (let y = b.pos.y; y < b.pos.y + t; y++) {
          expect(x).toBeLessThan(BAUPLATZ.breite);
          expect(y).toBeLessThan(BAUPLATZ.tiefe);
          expect(belegt.has(`${x},${y}`)).toBe(false);
          belegt.add(`${x},${y}`);
        }
    }
  });
});

describe('Hindernisse (§4.2)', () => {
  it('am Start: Banner, Späherturm, Tor, Studierstube gehen; Zimmerei braucht Bergfried 2', () => {
    for (const typ of ['zeichen', 'turm', 'eingang', 'wissen', 'einfassung'] as const)
      expect(hindernisse(typ, START)).toEqual([]);
    expect(hindernisse('werkstatt', START)).toEqual(['voraussetzung']);
    expect(hindernisse('ursprung', START)).toEqual(['nicht-baubar']);
  });

  it('kein Gebäude über der Stufe des Bergfrieds', () => {
    const turm = bau('turm');
    expect(hindernisse('turm', [...START, turm], turm)).toContain('kern-zu-niedrig');
    const hoch = [bau('kern', 2), turm];
    expect(hindernisse('turm', hoch, turm)).toEqual([]);
  });

  it('Höchstzahl und Höchststufe', () => {
    const zwei = [...START, bau('turm', 1, 'a'), bau('turm', 1, 'b')];
    expect(hindernisse('turm', zwei)).toEqual(['hoechstzahl']);
    const kern = bau('kern', 3);
    expect(hindernisse('kern', [kern], kern)).toEqual(['hoechststufe']);
    const tor = bau('eingang');
    expect(hindernisse('eingang', [bau('kern', 3), tor], tor)).toEqual(['hoechststufe']);
    const palisaden = Array.from({ length: 40 }, (_, i) => bau('einfassung', 1, `p${i}`));
    expect(
      hindernisse('einfassung', [...START.filter((b) => b.typ !== 'einfassung'), ...palisaden]),
    ).toEqual(['hoechstzahl']);
  });

  it('Zierde ohne Höchstzahl', () => {
    const viele = [...START, ...Array.from({ length: 20 }, (_, i) => bau('zeichen', 1, `b${i}`))];
    expect(hindernisse('zeichen', viele)).toEqual([]);
  });
});
