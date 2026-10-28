import { describe, expect, it } from 'vitest';
import { steinBis } from '../ledger/regeln';
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
    const summe = { stein: 0, erz: 0, bauplan: 0, bauschritt: 0 };
    for (const g of Object.values(KATALOG)) {
      if (g.familie === 'zierde') continue;
      // Anzahl baubarer Exemplare: Palisaden 8 weitere, Späherturm 2, sonst 1
      const stueck = g.typ === 'palisade' ? 8 : (g.hoechstens ?? 1);
      for (const s of g.stufen)
        for (const r of ['stein', 'erz', 'bauplan', 'bauschritt'] as const)
          summe[r] += s.kosten[r] * stueck;
    }
    expect(summe).toEqual({ stein: 2000, erz: 570, bauplan: 17, bauschritt: 93 });
  });

  it('die erste Lerneinheit reicht für ein Banner (§5.1)', () => {
    const banner = kosten('banner', 1);
    expect(banner).toBeDefined();
    expect(steinBis(10)).toBeGreaterThanOrEqual(banner?.stein ?? Infinity);
    expect(banner).toMatchObject({ erz: 0, bauplan: 0, bauschritt: 1 });
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
      'bergfried',
      'feuerstelle',
      'palisade',
      'palisade',
      'palisade',
      'palisade',
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
  it('am Start: Banner, Späherturm, Tor, Studierstube gehen; Bauhütte braucht Bergfried 2', () => {
    for (const typ of ['banner', 'spaeherturm', 'tor', 'studierstube', 'palisade'] as const)
      expect(hindernisse(typ, START)).toEqual([]);
    expect(hindernisse('bauhuette', START)).toEqual(['voraussetzung']);
    expect(hindernisse('feuerstelle', START)).toEqual(['nicht-baubar']);
  });

  it('kein Gebäude über der Stufe des Bergfrieds', () => {
    const turm = bau('spaeherturm');
    expect(hindernisse('spaeherturm', [...START, turm], turm)).toContain('bergfried-zu-niedrig');
    const hoch = [bau('bergfried', 2), turm];
    expect(hindernisse('spaeherturm', hoch, turm)).toEqual([]);
  });

  it('Höchstzahl und Höchststufe', () => {
    const zwei = [...START, bau('spaeherturm', 1, 'a'), bau('spaeherturm', 1, 'b')];
    expect(hindernisse('spaeherturm', zwei)).toEqual(['hoechstzahl']);
    const bergfried = bau('bergfried', 3);
    expect(hindernisse('bergfried', [bergfried], bergfried)).toEqual(['hoechststufe']);
    const tor = bau('tor');
    expect(hindernisse('tor', [bau('bergfried', 3), tor], tor)).toEqual(['hoechststufe']);
    const palisaden = Array.from({ length: 12 }, (_, i) => bau('palisade', 1, `p${i}`));
    expect(
      hindernisse('palisade', [...START.filter((b) => b.typ !== 'palisade'), ...palisaden]),
    ).toEqual(['hoechstzahl']);
  });

  it('Zierde ohne Höchstzahl', () => {
    const viele = [...START, ...Array.from({ length: 20 }, (_, i) => bau('banner', 1, `b${i}`))];
    expect(hindernisse('banner', viele)).toEqual([]);
  });
});
