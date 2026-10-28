import { describe, expect, it } from 'vitest';
import type { Instanz } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { winkelAblesen, winkelart } from './winkel';

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
function schenkelwinkel(i: Instanz): number {
  const schenkel = [
    ...(i.bild?.svg ?? '').matchAll(
      /<line x1="160" y1="175" x2="([-\d.]+)" y2="([-\d.]+)" stroke-width="2.5"/g,
    ),
  ].map((m) => (Math.atan2(175 - Number(m[2]), Number(m[1]) - 160) * 180) / Math.PI);
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
