import { describe, expect, it } from 'vitest';
import { fleissBis } from '../ledger/regeln';
import { einfassungHoechstens, turmHoechstens } from './epochen';
import {
  BAUPLATZ,
  hindernisse,
  hoechstensFuer,
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
  it('Summe ohne Zierde (B-31): 1 000 Stein, 285 Erz, 11 Baupläne, etwa 50 Bauschritte', () => {
    const summe = { fleiss: 0, behalten: 0, koennen: 0, schritt: 0 };
    for (const g of Object.values(KATALOG)) {
      if (g.familie === 'zierde') continue;
      // Nur Stufen der Epoche 1; Höchstzahlen der Epoche 1
      const max = hoechstensFuer(g.typ, 1) ?? 1;
      const stueck = g.typ === 'einfassung' ? max - 4 : max;
      for (const s of g.stufen) {
        if (s.ab !== undefined && s.ab > 1) continue;
        for (const r of ['fleiss', 'behalten', 'koennen', 'schritt'] as const)
          summe[r] += s.kosten[r] * stueck;
      }
    }
    // §5.2 halbiert (B-31: Können und Bauschritte aufgerundet), 36 Einfassungs-Stücke (B-22):
    // 1 000 + 36 · 15 Fleiß; Einfassung und Zierde unverändert
    expect(summe).toEqual({ fleiss: 1480, behalten: 285, koennen: 11, schritt: 79 });
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
    expect(hindernisse('turm', zwei, undefined, 2)).toEqual([]);
    expect(turmHoechstens(2)).toBe(4);
    const kern = bau('kern', 3);
    expect(hindernisse('kern', [kern], kern)).toEqual(['hoechststufe']);
    // Epoche 2: Kern Stufe 4 erlaubt
    expect(hindernisse('kern', [kern], kern, 2)).toEqual([]);
    const tor = bau('eingang');
    expect(hindernisse('eingang', [bau('kern', 3), tor], tor)).toEqual(['hoechststufe']);
    const palisaden = Array.from({ length: 40 }, (_, i) => bau('einfassung', 1, `p${i}`));
    expect(
      hindernisse('einfassung', [...START.filter((b) => b.typ !== 'einfassung'), ...palisaden]),
    ).toEqual(['hoechstzahl']);
    expect(einfassungHoechstens(2)).toBe(60);
  });

  it('Stufen ab Epoche 2 brauchen freigeschaltete Epoche', () => {
    const kern4 = bau('kern', 4);
    expect(hindernisse('wissen', [kern4], bau('wissen', 2), 1)).toContain('hoechststufe');
    expect(hindernisse('wissen', [kern4], bau('wissen', 2), 2)).toEqual([]);
  });

  it('Zierde ohne Höchstzahl', () => {
    const viele = [...START, ...Array.from({ length: 20 }, (_, i) => bau('zeichen', 1, `b${i}`))];
    expect(hindernisse('zeichen', viele)).toEqual([]);
  });
});
