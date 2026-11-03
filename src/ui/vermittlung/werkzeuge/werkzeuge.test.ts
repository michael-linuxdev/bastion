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

  it('kennt ab Klasse 10 Exponential-, Logarithmus-, Sinus- und Kosinuskurven', async () => {
    const { funktion, kurveAus, term } = await import('./graph');
    expect(term(kurveAus({ art: 'exp' }))).toBe('f(x) = 2ˣ');
    expect(term(kurveAus({ art: 'exp', basis: 'e', a: 3 }))).toBe('f(x) = 3 · eˣ');
    expect(term(kurveAus({ art: 'exp', basis: 0.5, d: 1 }))).toBe('f(x) = 0,5^(x − 1)');
    expect(term(kurveAus({ art: 'log' }))).toBe('f(x) = log₂(x)');
    expect(term(kurveAus({ art: 'log', basis: 'e' }))).toBe('f(x) = ln(x)');
    expect(term(kurveAus({ art: 'sin', a: 2, b: 3 }))).toBe('f(x) = 2 · sin(3x)');
    expect(term(kurveAus({ art: 'cos', b: 2, d: 1, e: -1 }))).toBe('f(x) = cos(2 · (x − 1)) − 1');
    expect(funktion(kurveAus({ art: 'exp', basis: 3 }))(2)).toBe(9);
    expect(funktion(kurveAus({ art: 'log', basis: 10 }))(1000)).toBeCloseTo(3);
    expect(Number.isNaN(funktion(kurveAus({ art: 'log' }))(0))).toBe(true);
    expect(funktion(kurveAus({ art: 'sin', a: 2, b: 2 }))(Math.PI / 4)).toBeCloseTo(2);
    expect(kurveAus({ art: 'exp', basis: 1, b: -2 })).toMatchObject({ basis: 2, b: 1 });
  });

  it('bietet den Regler b nur auf Wunsch an', async () => {
    const { reglerAus } = await import('./graph');
    expect(reglerAus({})).toEqual(['a', 'd', 'e']);
    expect(reglerAus({ regler: ['b', 'a'] })).toEqual(['a', 'b']);
  });

  it('hält den Ausschnitt in Grenzen', async () => {
    const { bereich } = await import('./graph');
    expect(bereich([2, 5], [-5, 5])).toEqual({ min: 0, max: 5 });
    expect(bereich([-50, 50], [-5, 5])).toEqual({ min: -5, max: 5 });
    expect(bereich(undefined, [-2, 8])).toEqual({ min: -2, max: 8 });
  });
});

describe('Dreieck (dreieck@1)', () => {
  it('zeichnet mit Winkeln ein beliebiges Dreieck, sonst wie bisher rechtwinklig', async () => {
    const { dreieckBild, winkelAus } = await import('./dreieck');
    const b = dreieckBild({
      winkel: { alpha: 40, beta: 70 },
      seiten: { c: 'c = 8 cm' },
      winkeltexte: { γ: 'γ = ?' },
    });
    expect(b.beschreibung.de).toContain('Dreiecks ABC');
    expect(b.beschreibung.de).toContain('γ = ?');
    expect(b.svg).toContain('<path');
    expect(winkelAus({ winkel: { alpha: 100, beta: 90 } })).toBeUndefined();
    expect(winkelAus({ winkel: { alpha: '40', beta: 70 } })).toBeUndefined();
    expect(dreieckBild({}).beschreibung.de).toContain('rechtwinkligen');
  });

  it('legt die Ecken so, dass die Winkel stimmen', async () => {
    const { ecken } = await import('../../../generators/mathematik/allgemeine-dreiecke/skizze');
    const P = ecken({ alpha: 50, beta: 60 });
    const winkel = (p: number[], q: number[], r: number[]) => {
      const u = [(q[0] ?? 0) - (p[0] ?? 0), (q[1] ?? 0) - (p[1] ?? 0)];
      const v = [(r[0] ?? 0) - (p[0] ?? 0), (r[1] ?? 0) - (p[1] ?? 0)];
      const c =
        ((u[0] ?? 0) * (v[0] ?? 0) + (u[1] ?? 0) * (v[1] ?? 0)) /
        (Math.hypot(u[0] ?? 0, u[1] ?? 0) * Math.hypot(v[0] ?? 0, v[1] ?? 0));
      return (Math.acos(c) * 180) / Math.PI;
    };
    expect(winkel(P.A, P.B, P.C)).toBeCloseTo(50, 5);
    expect(winkel(P.B, P.A, P.C)).toBeCloseTo(60, 5);
    for (const [x, y] of Object.values(P)) {
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(390);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(220);
    }
  });

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

describe('Histogramm (histogramm@1)', () => {
  it('nimmt gültige Klassen und Häufigkeiten', async () => {
    const { histogrammAus } = await import('./histogramm');
    expect(histogrammAus({ grenzen: [0, 10, 20, 30], haeufig: [2, 5, 3] })).toEqual({
      grenzen: [0, 10, 20, 30],
      haeufig: [2, 5, 3],
    });
  });

  it('fällt bei Unsinn auf ein kleines Standard-Histogramm zurück', async () => {
    const { histogrammAus } = await import('./histogramm');
    const standard = { grenzen: [0, 10, 20], haeufig: [1, 1] };
    expect(histogrammAus({})).toEqual(standard);
    expect(histogrammAus({ grenzen: [0, 10], haeufig: [2, 3] })).toEqual(standard);
    expect(histogrammAus({ grenzen: [0, 20, 10], haeufig: [2, 3] })).toEqual(standard);
    expect(histogrammAus({ grenzen: [0, 10, 20], haeufig: [2, 99] })).toEqual(standard);
    expect(histogrammAus({ grenzen: [0, 10, 20], haeufig: [0, 0] })).toEqual(standard);
  });

  it('beschreibt das Bild mit Klassen und Häufigkeiten', async () => {
    const { histogrammBild } = await import('./histogramm');
    const b = histogrammBild({ grenzen: [0, 10, 20], haeufig: [2, 5] });
    expect(b.svg).toMatch(/^<svg /);
    expect(b.beschreibung.de).toContain('0 bis unter 10: 2');
  });
});

describe('Anleitungsbild (anleitungsbild@1)', () => {
  it('liefert das Bild mit der Nummer ab 1, sonst nichts', async () => {
    const { anleitungsbild } = await import('./anleitungsbild');
    const b = anleitungsbild({ anleitung: 'anleitung.schraegbild-kegel@1', bild: 3 });
    expect(b?.beschreibung.de).toContain('Von S aus gehen zwei Linien');
    expect(anleitungsbild({ anleitung: 'anleitung.schraegbild-kegel@1', bild: 9 })).toBeUndefined();
    expect(anleitungsbild({ anleitung: 'gibt-es-nicht@1', bild: 1 })).toBeUndefined();
    expect(anleitungsbild({})).toBeUndefined();
  });
});
