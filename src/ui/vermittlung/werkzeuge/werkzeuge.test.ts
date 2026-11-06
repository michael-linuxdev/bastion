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
import { beschreibung as strahlBeschreibung, stelle, striche } from './zahlenstrahl';
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

  it('nennt mit frage nur Striche, nicht den Wert der Markierung', () => {
    expect(strahlBeschreibung({ von: 0, bis: 1, einteilung: 6 }, 5)).toBe(
      'Zahlenstrahl von 0 bis 1, Markiert: 5/6',
    );
    const frage = strahlBeschreibung({ von: 0, bis: 1, einteilung: 6, frage: true }, 5);
    expect(frage).toBe(
      'Zahlenstrahl von 0 bis 1 mit 7 Strichen. Die Markierung steht am 5. Strich nach der 0.',
    );
    expect(strahlBeschreibung({ von: 0, bis: 1, einteilung: 4, frage: true }, undefined)).toBe(
      'Zahlenstrahl von 0 bis 1 mit 5 Strichen.',
    );
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

describe('Einheitskreis (einheitskreis@1)', () => {
  it('prüft die Parameter und fällt auf Standards zurück', async () => {
    const { einheitskreisAus } = await import('./einheitskreis');
    expect(einheitskreisAus({})).toEqual({
      winkel: 30,
      einheit: 'grad',
      schritt: 15,
      werte: true,
      vergleich: undefined,
    });
    const z = einheitskreisAus({
      winkel: 400,
      einheit: 'bogen',
      schritt: 7,
      werte: false,
      vergleich: 30,
    });
    expect(z).toEqual({ winkel: 30, einheit: 'bogen', schritt: 15, werte: false, vergleich: 30 });
  });

  it('zeigt Winkel in Grad und im Bogenmaß als Vielfaches von π', async () => {
    const { winkelText } = await import('./einheitskreis');
    expect(winkelText(150, 'grad')).toBe('150°');
    expect(winkelText(150, 'bogen')).toBe('5π/6');
    expect(winkelText(180, 'bogen')).toBe('π');
    expect(winkelText(270, 'bogen')).toBe('3π/2');
    expect(winkelText(360, 'bogen')).toBe('2π');
    expect(winkelText(0, 'bogen')).toBe('0');
    expect(winkelText(45, 'bogen')).toBe('π/4');
    expect(winkelText(1, 'bogen')).toBe('π/180');
  });

  it('nennt sin und cos mit Vorzeichen und den Quadranten', async () => {
    const { anzeige } = await import('./einheitskreis');
    expect(anzeige(150, 'grad')).toEqual({ winkel: '150°', sin: '0,5', cos: '−0,87', quadrant: 2 });
    expect(anzeige(225, 'grad')).toMatchObject({ sin: '−0,71', cos: '−0,71', quadrant: 3 });
    expect(anzeige(300, 'grad')).toMatchObject({ sin: '−0,87', cos: '0,5', quadrant: 4 });
    expect(anzeige(90, 'grad')).toMatchObject({ sin: '1', cos: '0', quadrant: 0 });
    expect(anzeige(180, 'grad')).toMatchObject({ sin: '0', cos: '−1', quadrant: 0 });
  });

  it('das Bild ist ein SVG ohne Fremdes und beschreibt die Lage von P', async () => {
    const { einheitskreisBild } =
      await import('../../../generators/mathematik/trigonometrische-funktionen/einheitskreis');
    const b = einheitskreisBild(150);
    expect(b.svg).toMatch(/^<svg /);
    expect(b.svg).not.toMatch(/<script|href|url\(/);
    expect(b.svg).toContain('sin α = 0,5');
    expect(b.svg).toContain('cos α = −0,87');
    expect(b.beschreibung.de).toBe(
      'Einheitskreis mit dem Winkel α = 150°. P liegt bei (−0,87 | 0,5).',
    );
    const ohne = einheitskreisBild(150, { werte: false });
    expect(ohne.svg).not.toContain('0,87');
    expect(ohne.beschreibung.de).not.toContain('0,87');
  });
});

describe('Graph mit x-Achse in Vielfachen von π (graph@1, pi)', () => {
  it('beschriftet halbe π und rechnet die Kurve im Bogenmaß', async () => {
    const { graphBild, halbePi, kurvenAus } = await import('./graph');
    expect([1, 2, 3, 4, -2, -3].map(halbePi)).toEqual(['π/2', 'π', '3π/2', '2π', '−π', '−3π/2']);
    const p = { kurven: [{ art: 'sin' }], x: [0, 4], y: [-2, 2], pi: true };
    const b = graphBild(p, kurvenAus(p));
    expect(b.svg).toContain('>3π/2<');
    expect(b.svg).not.toContain('>3<');
    expect(b.beschreibung.de).toContain('sin(x)');
  });
});

describe('Stabdiagramm (stabdiagramm@1)', () => {
  it('prüft die Parameter und zeichnet je Wert einen Stab', async () => {
    const { stabdiagrammAus, stabdiagrammBild } = await import('./stabdiagramm');
    expect(stabdiagrammAus({ werte: [1, 2, 3], p: [0.2, 0.3, 0.5] }).p).toEqual([0.2, 0.3, 0.5]);
    expect(stabdiagrammAus({ werte: [1, 2], p: [0.5, null] }).p).toEqual([0.5, undefined]);
    // Summe nicht 1, falsche Länge, nicht aufsteigend: Standard
    expect(stabdiagrammAus({ werte: [1, 2], p: [0.5, 0.6] }).werte).toEqual([0, 1]);
    expect(stabdiagrammAus({ werte: [1, 2, 3], p: [0.5, 0.5] }).werte).toEqual([0, 1]);
    expect(stabdiagrammAus({ werte: [2, 1], p: [0.5, 0.5] }).werte).toEqual([0, 1]);
    const b = stabdiagrammBild({ werte: [1, 2, 5], p: [0.5, 0.3, null] });
    expect(b.beschreibung.de).toBe(
      'Stabdiagramm einer Verteilung: P(X = 1) = 0,5; P(X = 2) = 0,3; P(X = 5) = gesucht.',
    );
    expect(b.svg).toContain('>?<');
  });
});

describe('Geraden (geraden@1)', () => {
  it('liest Lage, Richtung und Winkel; Unsinn wird zum Standard', async () => {
    const { geradenAus, lageVon } = await import('./geraden');
    expect(geradenAus({})).toMatchObject({
      richtung: 0,
      winkel: 50,
      kurz: false,
      namen: ['g', 'h'],
    });
    expect(geradenAus({ lage: 'parallel' }).winkel).toBe(0);
    expect(geradenAus({ lage: 'senkrecht', winkel: 30 }).winkel).toBe(90);
    expect(geradenAus({ winkel: 400, richtung: -5, namen: ['a', 'zu-lang'] })).toMatchObject({
      winkel: 50,
      richtung: 0,
      namen: ['a', 'h'],
    });
    expect(geradenAus({ parallelen: true, winkel: 10 }).winkel).toBe(30);
    expect(geradenAus({}).drehbar).toBe(true);
    expect(geradenAus({ drehbar: false }).drehbar).toBe(false);
    expect(lageVon(0)).toBe('parallel');
    expect(lageVon(90)).toBe('senkrecht');
    expect(lageVon(45)).toBe('schneidend');
  });

  it('dreht h im Kreis und hält Parallelen im Bereich', async () => {
    const { gedreht, geradenAus } = await import('./geraden');
    const z = geradenAus({ winkel: 170 });
    expect(gedreht(z, 10).winkel).toBe(0);
    expect(gedreht(geradenAus({ lage: 'parallel' }), -10).winkel).toBe(170);
    expect(gedreht(geradenAus({ parallelen: true, winkel: 150 }), 10).winkel).toBe(150);
  });

  it('Winkelfelder: gegenüber gleich, nebeneinander zusammen 180°', async () => {
    const { feldgroessen } = await import('./geraden');
    const [a, b, c, d] = feldgroessen(60);
    expect(a).toBe(c);
    expect(b).toBe(d);
    expect(a + b).toBe(180);
  });

  it('beschreibt Lage und beschriftete Winkel, zeichnet kurze Stücke gestrichelt verlängert', async () => {
    const { geradenAus, geradenBild, verlaengert } = await import('./geraden');
    const b = geradenBild(geradenAus({ lage: 'senkrecht' }));
    expect(b.svg).toMatch(/^<svg /);
    expect(b.beschreibung.de).toContain('senkrecht');
    const p = geradenBild(
      geradenAus({ parallelen: true, winkel: 60, felder: ['α'], felder2: ['', '', '', 'β'] }),
    );
    expect(p.beschreibung.de).toContain('α = 60°');
    expect(p.beschreibung.de).toContain('β = 120°');
    expect(p.svg).toContain('>α<');
    const kurz = geradenAus({ kurz: true, winkel: 40 });
    expect(geradenBild(kurz).svg).not.toContain('stroke-dasharray');
    expect(geradenBild(kurz).beschreibung.de).not.toContain('schneiden sich');
    expect(geradenBild(verlaengert(kurz, true)).svg).toContain('stroke-dasharray');
    expect(geradenBild(verlaengert(kurz, true)).beschreibung.de).toContain('schneiden sich');
    // frage: Beschreibung ohne Lage und ohne Winkelgrößen (das Bild gehört zu einer Frage)
    const frage = geradenBild(geradenAus({ lage: 'parallel', felder: ['α', 'β'], frage: true }));
    expect(frage.beschreibung.de).not.toContain('parallel');
    expect(frage.beschreibung.de).toContain('An S: α, β.');
    expect(frage.beschreibung.de).not.toContain('= ');
  });
});

describe('Winkel (winkel@1)', () => {
  it('kennt die Winkelarten und hält den Bereich', async () => {
    const { geaendert, winkelart, winkelAus } = await import('./winkel');
    expect(['spitz', 'recht', 'stumpf', 'gestreckt', 'ueberstumpf', 'voll']).toEqual(
      [45, 90, 120, 180, 270, 360].map(winkelart),
    );
    expect(winkelAus({})).toMatchObject({ grad: 60, name: 'α', winkelmesser: false });
    expect(winkelAus({ grad: 200, winkelmesser: true }).grad).toBe(60);
    expect(geaendert(winkelAus({ grad: 355 }), 10).grad).toBe(360);
    expect(geaendert(winkelAus({ grad: 175, winkelmesser: true }), 10).grad).toBe(180);
    expect(geaendert(winkelAus({ grad: 5 }), -10).grad).toBe(0);
  });

  it('beschreibt den Winkel, am Winkelmesser beide Skalen', async () => {
    const { winkelAus, winkelBild } = await import('./winkel');
    const b = winkelBild(winkelAus({ grad: 120, name: 'β' }));
    expect(b.beschreibung.de).toContain('β von 120°, stumpf');
    expect(b.svg).toContain('>β<');
    const m = winkelBild(winkelAus({ grad: 40, winkelmesser: true }));
    expect(m.beschreibung.de).toContain('40 auf der äußeren Skala und 140 auf der inneren Skala');
    expect(m.svg).toContain('>180<');
    // B12: nur 20er-Marken beschriftet, Schrift 14
    expect(m.svg).toContain(
      'font-size="14" text-anchor="middle" fill="currentColor" stroke="none">160<',
    );
    expect(m.svg).not.toContain('>150<');
    const links = winkelBild(winkelAus({ grad: 40, winkelmesser: true, links: true }));
    expect(links.beschreibung.de).toContain('Der erste Schenkel zeigt auf 180');
    const frage = winkelBild(winkelAus({ grad: 110, winkelmesser: true, frage: true }));
    expect(frage.beschreibung.de).not.toContain('110°');
    expect(frage.beschreibung.de).not.toContain('stumpf');
    expect(frage.beschreibung.de).toContain('110 auf der äußeren Skala');
  });
});

describe('Gitter (gitter@1)', () => {
  it('zeichnet leere Figuren nur als Umriss', async () => {
    const { gitterAus, gitterBild } = await import('./gitter');
    const ecken = [
      [7, 0],
      [8, 0],
      [8, 3],
      [7, 3],
    ];
    const voll = gitterBild(gitterAus({ achsen: false, max: 9, figuren: [{ ecken }] }));
    const leer = gitterBild(gitterAus({ achsen: false, max: 9, figuren: [{ ecken, leer: true }] }));
    expect(voll.svg).toContain('fill-opacity');
    expect(leer.svg).not.toContain('fill-opacity');
    expect(leer.beschreibung.de).toContain('Leerer Umriss');
  });

  it('liest Punkte, Figuren, Achse und Pfeile; Unsinn fällt weg', async () => {
    const { gitterAus } = await import('./gitter');
    const z = gitterAus({
      max: 6,
      punkte: [{ x: 2, y: 3, name: 'P' }, { x: 9, y: 1 }, 'nein'],
      figuren: [
        {
          ecken: [
            [1, 1],
            [3, 1],
            [2, 3],
          ],
          namen: ['A', 'B', 'C'],
        },
        { ecken: [[1, 1]] },
      ],
      spiegelachse: { x: 4 },
      pfeile: [{ von: [0, 0], nach: [2, 1] }],
      kaestchen: [
        [5, 5],
        [6, 6],
      ],
    });
    expect(z.punkte).toEqual([{ x: 2, y: 3, name: 'P' }]);
    expect(z.figuren).toHaveLength(1);
    expect(z.achse).toEqual({ x: 4 });
    expect(z.pfeile).toHaveLength(1);
    expect(z.kaestchen).toEqual([[5, 5]]);
    expect(gitterAus({ max: 99 }).xmax).toBe(8);
  });

  it('bewegt den Punkt im Gitter und spiegelt oder verschiebt ihn', async () => {
    const { bewegt, bildpunkt, gespiegelt, gitterAus } = await import('./gitter');
    const z = gitterAus({ max: 8, beweglich: { x: 1, y: 3, name: 'P' }, spiegelachse: { x: 4 } });
    expect(bildpunkt(z)).toEqual({ x: 7, y: 3, name: 'P′' });
    expect(bewegt(z, -5, 0).beweglich?.x).toBe(0);
    expect(bildpunkt(bewegt(z, 2, 0))).toEqual({ x: 5, y: 3, name: 'P′' });
    expect(gespiegelt({ x: 2, y: 6 }, { y: 2 })).toEqual({ x: 2, y: -2 });
    const v = gitterAus({ beweglich: { x: 1, y: 1 }, verschiebung: [3, 2] });
    expect(bildpunkt(v)).toEqual({ x: 4, y: 3, name: 'P′' });
    expect(bildpunkt(gitterAus({ beweglich: { x: 1, y: 1 } }))).toBeUndefined();
  });

  it('beschreibt das Bild für den Bildschirmleser', async () => {
    const { gitterAus, gitterBild, verschiebungText } = await import('./gitter');
    const b = gitterBild(
      gitterAus({
        max: 6,
        punkte: [{ x: 2, y: 5, name: 'Q' }],
        spiegelachse: { y: 3 },
        beweglich: { x: 1, y: 1, name: 'P' },
        hilfslinien: true,
      }),
    );
    expect(b.svg).toMatch(/^<svg /);
    expect(b.beschreibung.de).toContain('Q(2|5)');
    expect(b.beschreibung.de).toContain('Dicke Linie waagerecht bei y = 3');
    expect(b.beschreibung.de).toContain('P′(1|5)');
    expect(b.svg).toContain('stroke-dasharray');
    expect(verschiebungText([3, -2])).toBe('3 nach rechts, 2 nach unten');
    const l = gitterBild(
      gitterAus({
        max: 6,
        linien: [
          { von: [1, 1], nach: [5, 5], gestrichelt: true },
          { von: [0, 3], nach: [6, 3] },
        ],
      }),
    );
    expect(l.beschreibung.de).toContain('Gestrichelte Linie von (1|1) nach (5|5)');
    expect(l.beschreibung.de).toContain('Linie von (0|3) nach (6|3)');
    const r = gitterBild(
      gitterAus({
        achsen: false,
        max: 5,
        kaestchen: [
          [0, 0],
          [1, 0],
        ],
      }),
    );
    expect(r.beschreibung.de).toContain('Rasterpapier');
    expect(r.svg).not.toContain('>3<');
  });
});

describe('Körpernetz (koerpernetz@1)', () => {
  it('nimmt eine Netznummer oder eigene Kästchen und erkennt Nicht-Netze', async () => {
    const { koerpernetzAus } = await import('./koerpernetz');
    const kreuz = koerpernetzAus({ netz: 1, buchstaben: ['A', 'B', 'C', 'D', 'E', 'F'] });
    expect(kreuz.netz).toHaveLength(6);
    expect(kreuz.istNetz).toBe(true);
    const reihe = koerpernetzAus({
      netz: [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [5, 0],
      ],
    });
    expect(reihe.istNetz).toBe(false);
    expect(koerpernetzAus({ netz: 'nein' }).istNetz).toBe(true);
    expect(
      koerpernetzAus({
        netz: [
          [0, 0],
          [2, 0],
          [3, 0],
          [4, 0],
          [5, 0],
          [6, 0],
        ],
      }).netz,
    ).toEqual(koerpernetzAus({}).netz);
    expect(koerpernetzAus({ boden: 'C' }).boden).toBe(2);
    expect(koerpernetzAus({ boden: 'Z' }).boden).toBeUndefined();
  });

  it('findet beim Kreuz die gegenüberliegende Fläche: in einer Dreierreihe das übernächste', async () => {
    const { gegenueber, koerpernetzAus } = await import('./koerpernetz');
    // Netz 1: Reihe in Zeile 2 (Spalten 1–4), darüber und darunter je ein Quadrat an Spalte 1.
    // Zeilenweise: A (oben), B C D E (Reihe), F (unten).
    const z = koerpernetzAus({ netz: 1 });
    expect(z.netz).toEqual([
      [0, 0],
      [0, 1],
      [1, 1],
      [2, 1],
      [3, 1],
      [0, 2],
    ]);
    expect(gegenueber(z, 1)).toBe(3); // B gegenüber D
    expect(gegenueber(z, 2)).toBe(4); // C gegenüber E
    expect(gegenueber(z, 0)).toBe(5); // A gegenüber F
    expect(gegenueber(z, 3)).toBe(1);
  });

  it('zeigt bei einer Sechserreihe, welche Quadrate aufeinanderfallen', async () => {
    const { doppelte, koerpernetzAus } = await import('./koerpernetz');
    const reihe = koerpernetzAus({
      netz: [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [5, 0],
      ],
    });
    expect(doppelte(reihe, 0)).toEqual([
      [0, 4],
      [1, 5],
    ]);
  });

  it('beschreibt Netz, Boden und Schrägbild', async () => {
    const { koerpernetzAus, koerpernetzBild } = await import('./koerpernetz');
    const b = koerpernetzBild(koerpernetzAus({ netz: 1, boden: 'B', schraegbild: true }));
    expect(b.svg).toMatch(/^<svg /);
    expect(b.beschreibung.de).toContain('Würfelnetz aus 6 Quadraten');
    expect(b.beschreibung.de).toContain('Boden: B, gegenüber liegt D');
    expect(b.beschreibung.de).toMatch(
      /Schrägbild des gefalteten Würfels: vorn \w, oben D, rechts \w/,
    );
    const reihe = koerpernetzBild(
      koerpernetzAus({
        netz: [
          [0, 0],
          [1, 0],
          [2, 0],
          [3, 0],
          [4, 0],
          [5, 0],
        ],
        boden: 'A',
      }),
    );
    expect(reihe.beschreibung.de).toContain('kein Würfelnetz');
    expect(reihe.beschreibung.de).toContain('A und E; B und F');
    const frage = koerpernetzBild(
      koerpernetzAus({
        netz: [
          [0, 0],
          [1, 0],
          [2, 0],
          [3, 0],
          [4, 0],
          [5, 0],
        ],
        frage: true,
      }),
    );
    expect(frage.beschreibung.de).toMatch(/^Sechs Quadrate,/);
    expect(frage.beschreibung.de).not.toContain('kein Würfelnetz');
    expect(frage.svg).not.toContain('fill-opacity');
  });
});
