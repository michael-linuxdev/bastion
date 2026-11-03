import { describe, expect, it } from 'vitest';
import { WERKZEUGE } from '../../../core/learning/vermittlung';
import {
  anzahlGefaerbt,
  breiten,
  geteilt,
  startzustand,
  umgeschaltet,
  verfeinert,
} from './bruchstreifen';
import { stelle, striche } from './zahlenstrahl';
import { WERKZEUG_NAMEN } from './index';

describe('Bruchstreifen (bruchstreifen@1)', () => {
  it('startet mit den ersten Teilen gefärbt', () => {
    const z = startzustand({ teile: 4, gefaerbt: 3 });
    expect(z.gefaerbt).toEqual([true, true, true, false]);
  });

  it('verträgt fehlende und unsinnige Parameter', () => {
    expect(startzustand({})).toEqual({ teile: 1, gefaerbt: [false] });
    expect(startzustand({ teile: 3, gefaerbt: 9 }).gefaerbt).toEqual([true, true, true]);
    expect(startzustand({ teile: 500 }).teile).toBe(24);
  });

  it('verfeinern verdoppelt Teile und gefärbte Teile – der Anteil bleibt (Erweitern)', () => {
    const z = verfeinert(startzustand({ teile: 3, gefaerbt: 2 }));
    expect(z.teile).toBe(6);
    expect(anzahlGefaerbt(z)).toBe(4);
    expect(anzahlGefaerbt(z) / z.teile).toBeCloseTo(2 / 3);
  });

  it('färben und neu teilen', () => {
    let z = startzustand({ teile: 1 });
    z = geteilt(z, 4);
    z = umgeschaltet(umgeschaltet(umgeschaltet(z, 0), 1), 2);
    expect(anzahlGefaerbt(z)).toBe(3);
    expect(anzahlGefaerbt(umgeschaltet(z, 1))).toBe(2);
    expect(geteilt(z, 2).gefaerbt).toEqual([true, true]);
  });

  it('gleiche Teile summieren sich zu 1; ungleiche haben ein großes erstes Teil', () => {
    expect(breiten(4).reduce((a, b) => a + b)).toBeCloseTo(1);
    const u = breiten(4, true);
    expect(u.reduce((a, b) => a + b)).toBeCloseTo(1);
    expect(u[0]).toBeGreaterThan(u[1] ?? 1);
  });
});

describe('Zahlenstrahl (zahlenstrahl@1)', () => {
  it('teilt jede Einheit in gleiche Teile und beschriftet ganze Zahlen', () => {
    const s = striche({ von: 0, bis: 2, einteilung: 4 });
    expect(s).toHaveLength(9);
    expect(s.filter((x) => x.ganz).map((x) => x.zaehler)).toEqual([0, 4, 8]);
    expect(s[3]?.lage).toBeCloseTo(3 / 8);
  });

  it('schreibt Stellen als ganze Zahl oder Bruch', () => {
    expect(stelle(3, 4)).toBe('3/4');
    expect(stelle(8, 4)).toBe('2');
  });
});

describe('Werkzeuge', () => {
  it('jedes Werkzeug aus dem Kern hat eine Darstellung in der Oberfläche', () => {
    expect([...WERKZEUG_NAMEN].sort()).toEqual([...WERKZEUGE].sort());
  });
});

describe('Graph (graph@1)', () => {
  it('liest Kurven mit Vorgaben und verwirft Unsinn', async () => {
    const { kurveAus, kurvenAus } = await import('./graph');
    expect(kurveAus({})).toMatchObject({ art: 'parabel', a: 1, d: 0, e: 0, n: 2 });
    expect(kurveAus({ art: 'zauber', n: 0 })).toMatchObject({ art: 'parabel', n: 2 });
    expect(kurvenAus({ kurven: Array(9).fill({}) })).toHaveLength(4);
  });

  it('schreibt den Term in Scheitelform', async () => {
    const { kurveAus, term } = await import('./graph');
    expect(term(kurveAus({}))).toBe('f(x) = x²');
    expect(term(kurveAus({ a: 2, d: 1, e: 3 }))).toBe('f(x) = 2 · (x − 1)² + 3');
    expect(term(kurveAus({ a: -0.5, d: -2, e: -1 }))).toBe('f(x) = −0,5 · (x + 2)² − 1');
    expect(term(kurveAus({ art: 'potenz', n: -2 }))).toBe('f(x) = x⁻²');
    expect(term(kurveAus({ art: 'wurzel', e: 1 }))).toBe('f(x) = √x + 1');
  });

  it('rechnet a · g(x − d) + e', async () => {
    const { funktion, kurveAus } = await import('./graph');
    expect(funktion(kurveAus({ a: 2, d: 1, e: 3 }))(3)).toBe(11);
    expect(Number.isNaN(funktion(kurveAus({ art: 'wurzel' }))(-1))).toBe(true);
  });

  it('baut ein SVG mit Beschreibung, Vergleichskurve gestrichelt', async () => {
    const { graphBild, kurvenAus } = await import('./graph');
    const p = { kurven: [{ a: 2 }, { vergleich: true }], punkte: [[0, 0]] };
    const b = graphBild(p, kurvenAus(p));
    expect(b.svg).toContain('stroke-dasharray');
    expect(b.svg).toContain('<circle');
    expect(b.beschreibung.de).toContain('f(x) = 2 · x²');
  });

  it('hält den Ausschnitt in Grenzen', async () => {
    const { bereich } = await import('./graph');
    expect(bereich([2, 5], [-5, 5])).toEqual({ min: 0, max: 5 });
    expect(bereich([-50, 50], [-5, 5])).toEqual({ min: -5, max: 5 });
    expect(bereich(undefined, [-2, 8])).toEqual({ min: -2, max: 8 });
  });
});

describe('Dreieck (dreieck@1)', () => {
  it('nimmt C als Standard und nur Seiten a, b, c', async () => {
    const { dreieckAus } = await import('./dreieck');
    expect(dreieckAus({})).toEqual({ rechts: 'C', seiten: {} });
    expect(dreieckAus({ rechts: 'X', seiten: { a: 'a = 3 cm', d: 'nein', c: 5 } })).toEqual({
      rechts: 'C',
      seiten: { a: 'a = 3 cm', c: 'c = 5' },
    });
    expect(dreieckAus({ rechts: 'B', seiten: { b: 'x'.repeat(40) } }).seiten).toEqual({});
  });

  it('zeichnet die Skizze der Aufgaben mit Beschreibung', async () => {
    const { dreieckBild } = await import('./dreieck');
    const b = dreieckBild({ rechts: 'A', seiten: { a: 'a = ?' } });
    expect(b.svg).toMatch(/^<svg /);
    expect(b.beschreibung.de).toContain('rechte Winkel liegt bei A');
  });
});
