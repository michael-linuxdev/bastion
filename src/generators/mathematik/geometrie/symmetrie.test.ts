import { describe, expect, it } from 'vitest';
import { achsenZaehlen, bewegungErkennen } from './symmetrie';

/** Kästchen aus dem SVG lesen: gefüllte Rechtecke → [Spalte, Zeile] (Raster 20 px ab 5 px). */
function kaestchen(svg: string): [number, number][] {
  return [...svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="20" height="20" fill/g)].map(
    (m) => [(Number(m[1]) - 5) / 20, (Number(m[2]) - 5) / 20],
  );
}

describe('sy.bewegung-erkennen', () => {
  it('spiegelt die Figur wirklich an der gezeichneten Linie und verrät die Bewegung nicht', () => {
    let gespiegelt = 0;
    for (let seed = 1; seed <= 60; seed++) {
      const a = bewegungErkennen.erzeuge(seed, { mit_drehung: true });
      expect(a.bild?.beschreibung.de).not.toMatch(/Spiegelung|Verschiebung|Drehung/);
      const alle = kaestchen(a.bild?.svg ?? '');
      const links = alle.filter(([s]) => s < 7);
      const rechts = alle.filter(([s]) => s >= 7);
      expect(links).toHaveLength(5);
      expect(rechts).toHaveLength(5);
      // Die Linie steht bei jeder Bewegung da, damit sie die Spiegelung nicht verrät.
      expect(a.bild?.svg).toContain('x1="145" y1="0" x2="145" y2="130" stroke-width="2.5"');
      const erwartet = links.map(([s, z]) => `${13 - s},${z}`).sort();
      const istSpiegelung = a.loesung.typ === 'auswahl' && a.loesung.wert === 0;
      if (istSpiegelung) {
        gespiegelt++;
        expect(rechts.map(([s, z]) => `${s},${z}`).sort()).toEqual(erwartet);
      } else expect(rechts.map(([s, z]) => `${s},${z}`).sort()).not.toEqual(erwartet);
    }
    expect(gespiegelt).toBeGreaterThan(5);
  });
});

describe('sy.achsen-zaehlen', () => {
  it('gleichschenkliges Dreieck und Raute sehen nie gleichseitig oder quadratisch aus', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const d = achsenZaehlen.erzeuge(seed, { formen: ['gleichschenkliges Dreieck'] });
      const p = [
        ...(d.bild?.svg.match(/points="([^"]+)"/)?.[1] ?? '').matchAll(/([\d.]+),([\d.]+)/g),
      ].map((m) => [Number(m[1]), Number(m[2])] as const);
      const basis = Math.abs((p[1]?.[0] ?? 0) - (p[0]?.[0] ?? 0));
      const hoehe = Math.abs((p[0]?.[1] ?? 0) - (p[2]?.[1] ?? 0));
      expect(hoehe / basis).toBeGreaterThan(1.3);
      const r = achsenZaehlen.erzeuge(seed, { formen: ['Raute'] });
      const q = [
        ...(r.bild?.svg.match(/points="([^"]+)"/)?.[1] ?? '').matchAll(/([\d.]+),([\d.]+)/g),
      ].map((m) => [Number(m[1]), Number(m[2])] as const);
      const kurz = Math.abs((q[1]?.[0] ?? 0) - (q[3]?.[0] ?? 0));
      expect(kurz / 190).toBeLessThan(0.7);
    }
  });
});
