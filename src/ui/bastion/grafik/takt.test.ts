import { describe, expect, it } from 'vitest';
import { TAKT_HZ } from './atmosphaere';
import {
  BildVorrat,
  bilderJeUmlauf,
  imSichtfeld,
  phasenStufe,
  sichtfeldAus,
  stufenPhase,
  taktSchritt,
  taktZeit,
} from './takt';

describe('Gemeinsamer Takt (GRAFIK §34)', () => {
  it('Takt-Schritt: 30 je Sekunde, alle Teile sehen dieselbe Zeit', () => {
    expect(TAKT_HZ).toBe(30);
    expect(taktSchritt(0)).toBe(0);
    expect(taktSchritt(33)).toBe(0);
    expect(taktSchritt(34)).toBe(1);
    expect(taktSchritt(1000)).toBe(30);
    expect(taktZeit(30)).toBe(1000);
    // Innerhalb eines Schritts ändert sich die Zeit nicht
    expect(taktZeit(taktSchritt(1010))).toBe(taktZeit(taktSchritt(1030)));
  });

  it('Bilder je Umlauf: so viele, wie Takt-Schritte in einem Umlauf liegen', () => {
    // Fahne: 4,2 rad/s → 1,5 s je Umlauf → 45 Bilder; Sturm (×2,2) → 20
    expect(bilderJeUmlauf(4.2)).toBe(45);
    expect(bilderJeUmlauf(4.2 * 2.2)).toBe(20);
    // Banner: 1,6 rad/s → 118 Bilder
    expect(bilderJeUmlauf(1.6)).toBe(118);
    // Mühle: eine Umdrehung in 12 s, vier gleiche Flügel → Viertelumlauf 3 s → 90 Bilder
    expect(bilderJeUmlauf((Math.PI * 2) / 12, Math.PI / 2)).toBe(90);
    // Steht still: ein Bild
    expect(bilderJeUmlauf(0)).toBe(1);
    expect(bilderJeUmlauf(Number.NaN)).toBe(1);
  });

  it('Phasenstufe: im Bereich, auch für negative Phasen, und zurück', () => {
    const n = 45;
    for (const phase of [0, 0.1, 1, 3, 6.28, 100, -0.1, -7, -1000]) {
      const s = phasenStufe(phase, n);
      expect(Number.isInteger(s)).toBe(true);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThan(n);
      // Die gezeichnete Phase liegt höchstens eine halbe Stufe neben der echten
      const voll = Math.PI * 2;
      const d = ((((stufenPhase(s, n) - phase) % voll) + voll * 1.5) % voll) - Math.PI;
      expect(Math.abs(d)).toBeLessThanOrEqual(Math.PI / n + 1e-9);
    }
    expect(Object.is(phasenStufe(-1e-9, n), 0)).toBe(true);
    expect(phasenStufe(5, 1)).toBe(0);
    expect(phasenStufe(Number.NaN, n)).toBe(0);
  });

  it('Im Takt rückt eine gleichförmige Bewegung je Schritt um etwa ein Bild weiter', () => {
    const omega = 4.2;
    const n = bilderJeUmlauf(omega);
    let vorher = phasenStufe(0, n);
    let gleich = 0;
    for (let schritt = 1; schritt <= 300; schritt++) {
      const s = phasenStufe((taktZeit(schritt) / 1000) * omega, n);
      const weiter = (s - vorher + n) % n;
      expect(weiter).toBeLessThanOrEqual(2);
      if (weiter === 0) gleich++;
      vorher = s;
    }
    // fast immer ein neues Bild je Schritt
    expect(gleich).toBeLessThan(10);
  });

  it('Sichtfeld aus der Kamera: Fenster plus Rand, in Bühnen-Bildpunkten', () => {
    const fenster = { breite: 390, hoehe: 844 };
    expect(sichtfeldAus({ x: 0, y: 0, zoom: 1 }, fenster, 0)).toEqual({
      x: -0,
      y: -0,
      b: 390,
      h: 844,
    });
    // herangezoomt und verschoben: kleiner Ausschnitt weiter rechts unten
    const s = sichtfeldAus({ x: -400, y: -200, zoom: 2 }, fenster, 10);
    expect(s).toEqual({ x: 195, y: 95, b: 205, h: 432 });
  });

  it('Im Sichtfeld: Überlappung zählt, ohne Sichtfeld ist alles sichtbar', () => {
    const sicht = { x: 100, y: 100, b: 200, h: 100 };
    expect(imSichtfeld(150, 150, 5, 5, sicht)).toBe(true);
    expect(imSichtfeld(95, 150, 10, 5, sicht)).toBe(true); // ragt hinein
    expect(imSichtfeld(80, 150, 10, 5, sicht)).toBe(false);
    expect(imSichtfeld(150, 220, 5, 10, sicht)).toBe(false);
    expect(imSichtfeld(-1000, -1000, 1, 1, undefined)).toBe(true);
  });

  it('Bildvorrat: jedes Bild nur einmal bauen', () => {
    const vorrat = new BildVorrat<{ n: number }>();
    let gebaut = 0;
    const bauen = () => ({ n: ++gebaut });
    const a = vorrat.holen('fahne|3', bauen);
    const b = vorrat.holen('fahne|3', bauen);
    vorrat.holen('fahne|4', bauen);
    expect(a).toBe(b);
    expect(gebaut).toBe(2);
    expect(vorrat.anzahlGebaut).toBe(2);
    expect(vorrat.groesse).toBe(2);
    const weg: number[] = [];
    vorrat.leeren((x) => weg.push(x.n));
    expect(weg).toEqual([1, 2]);
    expect(vorrat.groesse).toBe(0);
  });
});
