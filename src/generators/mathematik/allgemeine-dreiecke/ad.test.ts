import { describe, expect, it } from 'vitest';
import type { Instanz, Loesung } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  adFlaeche,
  adFlaecheAussage,
  adFlaecheVieleck,
  adKoerper,
  adKosinussatzSeite,
  adKosinussatzWinkel,
  adPlanAussage,
  adPythagorasAussage,
  adSinussatzSeite,
  adSinussatzWinkel,
  adSswAussage,
  adVermessung,
} from './ad';

const texte = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const w = (i: Instanz, n: string) => Number(i.platzhalter[n]);
const wo = (i: Instanz, passt: (t: string) => boolean): Loesung => ({
  typ: 'auswahl',
  wert: texte(i).findIndex(passt),
});
const verschieden = (i: Instanz) =>
  new Set(texte(i)).size === texte(i).length ? [] : ['zwei gleiche Möglichkeiten'];
const rad = (g: number) => (g * Math.PI) / 180;
const eins = (x: number): Loesung => ({ typ: 'zahl', wert: Math.round(x * 10) / 10 });
const dist = (p: [number, number], q: [number, number]) => Math.hypot(p[0] - q[0], p[1] - q[1]);

/** Dreieck aus Koordinaten: A im Ursprung, B auf der x-Achse – ein zweiter, unabhängiger Weg */
function ausWinkeln(alpha: number, beta: number, c: number) {
  const A: [number, number] = [0, 0];
  const B: [number, number] = [c, 0];
  // C als Schnitt zweier Strahlen
  const ta = Math.tan(rad(alpha));
  const tb = Math.tan(rad(180 - beta));
  const x = (c * tb) / (tb - ta);
  const C: [number, number] = [x, ta * x];
  return { a: dist(B, C), b: dist(A, C), c };
}

describe('Sinussatz: Seite (G)', () => {
  pflichttests(adSinussatzSeite, {
    niveaus: { G: {} },
    unabhaengigeLoesung(i) {
      // Dreieck mit c = 1 bauen und auf das gegebene b skalieren
      const d = ausWinkeln(w(i, 'alpha'), w(i, 'beta'), 1);
      return eins((d.a * w(i, 'b')) / d.b);
    },
    grenzverletzungen: (i) => (180 - w(i, 'alpha') - w(i, 'beta') < 20 ? ['γ zu klein'] : []),
    mindestensVerschieden: { G: 90 },
  });
});

describe('Sinussatz: Winkel (M)', () => {
  pflichttests(adSinussatzWinkel, {
    niveaus: { M: {} },
    unabhaengigeLoesung(i) {
      // C liegt auf dem Strahl von A unter α im Abstand b; B auf der x-Achse mit |BC| = a
      const a = w(i, 'a');
      const b = w(i, 'b');
      const al = rad(w(i, 'alpha'));
      const C: [number, number] = [b * Math.cos(al), b * Math.sin(al)];
      const bx = C[0] + Math.sqrt(a * a - C[1] * C[1]);
      const winkelB = Math.atan2(C[1], bx - C[0]);
      return eins((winkelB * 180) / Math.PI);
    },
    grenzverletzungen: (i) => (w(i, 'b') >= w(i, 'a') ? ['b nicht kleiner als a'] : []),
    mindestensVerschieden: { M: 90 },
  });
});

describe('Zwei Dreiecke bei SsW (E)', () => {
  pflichttests(adSswAussage, {
    niveaus: { E: {} },
    unabhaengigeLoesung(i) {
      const zwei = w(i, 'alpha') + (180 - w(i, 'beta1')) < 180;
      return wo(i, (t) => (zwei ? t.startsWith('Nein. Auch') : t.startsWith('Ja.')));
    },
    grenzverletzungen: verschieden,
    mindestensVerschieden: { E: 40 },
  });
});

describe('Kosinussatz: Seite (G)', () => {
  pflichttests(adKosinussatzSeite, {
    niveaus: { G: {} },
    unabhaengigeLoesung(i) {
      const al = rad(w(i, 'alpha'));
      const B: [number, number] = [w(i, 'c'), 0];
      const C: [number, number] = [w(i, 'b') * Math.cos(al), w(i, 'b') * Math.sin(al)];
      return eins(dist(B, C));
    },
    grenzverletzungen: (i) => (w(i, 'b') === w(i, 'c') ? ['gleichschenklig'] : []),
    mindestensVerschieden: { G: 80 },
  });

  it('Zwischenschritte: a² und a, anders gerundet zählt', () => {
    const i = adKosinussatzSeite.erzeuge(11, {});
    const q = adKosinussatzSeite.schritt?.(11, {}, 'quadrat', {});
    const s = adKosinussatzSeite.schritt?.(11, {}, 'seite', {});
    expect(s?.loesung).toEqual(i.loesung);
    const wert = q?.loesung.typ === 'zahl' ? q.loesung.wert : NaN;
    expect(q?.auchRichtig?.({ typ: 'zahl', wert: wert + 0.04 })).toBe(true);
  });
});

describe('Kosinussatz: Winkel (M)', () => {
  pflichttests(adKosinussatzWinkel, {
    niveaus: { M: {} },
    unabhaengigeLoesung(i) {
      // Heron: Fläche, dann sin γ = 2A/(ab); Lage von γ über a² + b² gegen c²
      const [a, b, c] = [w(i, 'a'), w(i, 'b'), w(i, 'c')];
      const s = (a + b + c) / 2;
      const A = Math.sqrt(s * (s - a) * (s - b) * (s - c));
      let g = (Math.asin(Math.min(1, (2 * A) / (a * b))) * 180) / Math.PI;
      if (a * a + b * b < c * c) g = 180 - g;
      return eins(g);
    },
    grenzverletzungen: (i) => {
      const [a, b, c] = [w(i, 'a'), w(i, 'b'), w(i, 'c')];
      return a + b <= c || a + c <= b || b + c <= a ? ['kein Dreieck'] : [];
    },
    mindestensVerschieden: { M: 90 },
  });
});

describe('Pythagoras als Sonderfall (E)', () => {
  pflichttests(adPythagorasAussage, {
    niveaus: { E: {} },
    unabhaengigeLoesung: (i) => wo(i, (t) => t.startsWith('Ja.')),
    grenzverletzungen: verschieden,
    mindestensVerschieden: { E: 12 },
  });
});

describe('Flächeninhalt (G)', () => {
  pflichttests(adFlaeche, {
    niveaus: { G: {} },
    unabhaengigeLoesung(i) {
      // Höhe auf a: b · sin γ
      const h = w(i, 'b') * Math.sin(rad(w(i, 'gamma')));
      return eins((w(i, 'a') * h) / 2);
    },
    grenzverletzungen: () => [],
    mindestensVerschieden: { G: 90 },
  });
});

describe('Flächeninhalt eines Vierecks (M)', () => {
  pflichttests(adFlaecheVieleck, {
    niveaus: { M: {} },
    unabhaengigeLoesung(i) {
      const t = (x: number, y: number, g: number) => {
        const P: [number, number] = [x, 0];
        const Q: [number, number] = [y * Math.cos(rad(g)), y * Math.sin(rad(g))];
        // Kreuzprodukt
        return Math.abs(P[0] * Q[1] - P[1] * Q[0]) / 2;
      };
      return eins(t(w(i, 'a'), w(i, 'd'), w(i, 'alpha')) + t(w(i, 'b'), w(i, 'c'), w(i, 'gamma')));
    },
    grenzverletzungen: () => [],
    mindestensVerschieden: { M: 90 },
  });
});

describe('Herleitung der Flächenformel (E)', () => {
  pflichttests(adFlaecheAussage, {
    niveaus: { E: {} },
    unabhaengigeLoesung: (i) => wo(i, (t) => t.startsWith('Im rechtwinkligen Teildreieck')),
    grenzverletzungen: verschieden,
    mindestensVerschieden: { E: 40 },
  });
});

describe('Vermessung (G)', () => {
  pflichttests(adVermessung, {
    niveaus: { G: {} },
    unabhaengigeLoesung(i) {
      const d = ausWinkeln(w(i, 'alpha'), w(i, 'beta'), w(i, 's'));
      return eins(d.b);
    },
    grenzverletzungen: () => [],
    mindestensVerschieden: { G: 90 },
  });
});

describe('Pyramide (M)', () => {
  pflichttests(adKoerper, {
    niveaus: { M: {} },
    unabhaengigeLoesung(i) {
      // gleichschenkliges Dreieck: halbe Grundkante = s · sin(φ/2)
      return eins(2 * w(i, 's') * Math.sin(rad(w(i, 'phi') / 2)));
    },
    grenzverletzungen: () => [],
    mindestensVerschieden: { M: 60 },
  });
});

describe('Lösungsplan (E)', () => {
  pflichttests(adPlanAussage, {
    niveaus: { E: {} },
    unabhaengigeLoesung(i) {
      const f = w(i, 'fall');
      return wo(i, (t) =>
        f === 2
          ? t.startsWith('Zuerst den dritten Winkel')
          : t.startsWith('Zuerst der Kosinussatz'),
      );
    },
    grenzverletzungen: verschieden,
    mindestensVerschieden: { E: 12 },
  });
});
