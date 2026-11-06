import { describe, expect, it } from 'vitest';
import type { Instanz } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { WINKELMESSER, winkelAblesen, winkelart } from './winkel';

// Unabhängig: Winkelart aus der Gradzahl in der Bildbeschreibung.
const grad = (i: Instanz) => Number(/(\d+)° groß/.exec(i.bild?.beschreibung.de ?? '')?.[1]);
const art = (w: number) => (w < 90 ? 0 : w === 90 ? 1 : w < 180 ? 2 : w === 180 ? 3 : 4);

pflichttests(winkelart, {
  niveaus: { G: { ueberstumpf: false }, M: { ueberstumpf: true } },
  unabhaengigeLoesung: (i) => ({ typ: 'auswahl', wert: art(grad(i)) }),
  grenzverletzungen: (i) => (grad(i) > 0 && grad(i) < 360 ? [] : [`Winkel ${grad(i)}°`]),
  mindestensVerschieden: { G: 40, M: 60 },
});

// Unabhängig: Winkel zwischen den beiden dicken Schenkeln aus dem SVG berechnen.
const { cx, cy } = WINKELMESSER;
function schenkelwinkel(i: Instanz): number {
  const muster = new RegExp(
    `<line x1="${cx}" y1="${cy}" x2="([-\\d.]+)" y2="([-\\d.]+)" stroke-width="2.5"`,
    'g',
  );
  const schenkel = [...(i.bild?.svg ?? '').matchAll(muster)].map(
    (m) => (Math.atan2(cy - Number(m[2]), Number(m[1]) - cx) * 180) / Math.PI,
  );
  const [a, b] = schenkel as [number, number];
  return Math.round(Math.abs(a - b));
}

pflichttests(winkelAblesen, {
  niveaus: { G: { schritt: 10, beide_seiten: false }, M: { schritt: 5, beide_seiten: true } },
  unabhaengigeLoesung: (i) => ({ typ: 'zahl', wert: schenkelwinkel(i) }),
  grenzverletzungen(i, p) {
    const w = i.loesung.typ === 'zahl' ? i.loesung.wert : NaN;
    return w >= 10 && w <= 170 && w !== 90 && w % p.schritt === 0 ? [] : [`Winkel ${w}`];
  },
  mindestensVerschieden: { G: 15, M: 40 },
});

describe('gf.winkel-ablesen', () => {
  it('legt im Niveau M den ersten Schenkel auch links an', () => {
    const p = { schritt: 5, beide_seiten: true };
    const texte = Array.from(
      { length: 50 },
      (_, s) => winkelAblesen.erzeuge(s, p).loesungsweg[0]?.de,
    );
    expect(texte.some((t) => t?.includes('innere'))).toBe(true);
    expect(texte.some((t) => t?.includes('äußere'))).toBe(true);
  });
});

describe('Winkelmesser (B12, D8)', () => {
  const p = { schritt: 5, beide_seiten: true };
  it('beschriftet jede 20°-Marke beider Skalen in lesbarer Größe', () => {
    const svg = winkelAblesen.erzeuge(3, p).bild?.svg ?? '';
    const zahlen = [...svg.matchAll(/font-size="(\d+)"[^>]*>(\d+)</g)];
    expect(zahlen).toHaveLength(20); // 10 Marken (0, 20 … 180), je außen und innen
    expect(zahlen.every((m) => Number(m[1]) >= 14)).toBe(true);
    expect(new Set(zahlen.map((m) => Number(m[2]) % 20))).toEqual(new Set([0]));
    // Bild fast doppelt so breit wie hoch: am Handy volle Breite, 1 Einheit ≈ 1 px
    expect(WINKELMESSER.breite / WINKELMESSER.hoehe).toBeGreaterThan(1.85);
  });

  it('zeichnet die Zahlen über den Schenkeln', () => {
    const svg = winkelAblesen.erzeuge(7, p).bild?.svg ?? '';
    expect(svg.lastIndexOf('stroke-width="2.5"')).toBeLessThan(svg.indexOf('<text'));
  });

  it('zeigt die Lösung mit Grad, die Beschreibung nennt sie nicht als Ergebnis', () => {
    for (let s = 0; s < 50; s++) {
      const i = winkelAblesen.erzeuge(s, p);
      expect(i.einheit).toBe('°');
      const w = i.loesung.typ === 'zahl' ? i.loesung.wert : NaN;
      expect(i.bild?.beschreibung.de).not.toContain(`${w}°`);
    }
  });
});
