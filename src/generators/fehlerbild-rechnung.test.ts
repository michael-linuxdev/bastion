/**
 * Passt die Zahl im Fehlerbild zu dem Fehler, den der Satz beschreibt?
 *
 * Die Pflicht-Tests rechnen die richtige Lösung auf einem zweiten Weg nach.
 * Sie prüfen nicht, ob die falsche Antwort zu dem Satz passt, den das Kind
 * danach liest. Diese Prüfung rechnet die beschriebene Fehlrechnung aus dem
 * Aufgabentext nach – unabhängig von der Zeile im Generator.
 */
import { describe, expect, it } from 'vitest';
import { runde10 } from '../core/learning/format';
import type { Instanz, Loesung } from '../core/learning/generator';
import {
  bildstrecke,
  fehlendeSeite,
  schattenFlaeche,
} from './mathematik/aehnlichkeit/aehnlichkeit';
import { laplace } from './mathematik/daten/wahrscheinlichkeit';
import { geradeAblesen, geradeBestimmen } from './mathematik/funktionen/funktionen';
import {
  bequem,
  grundaufgabeBerechnen,
  kapitalNachJahren,
  zinsen,
} from './mathematik/prozent/prozent';
import { dreisatzProportional, dreisatzUmgekehrt } from './mathematik/zuordnungen/zuordnungen';

const text = (i: Instanz, name: string) => {
  const p = i.platzhalter[name];
  return p && typeof p === 'object' && 'de' in p ? p.de : '';
};

/** Zahlen im Aufgabentext, „1 200“ und „12,50“ eingeschlossen. */
const zahlen = (t: string) =>
  (t.replace(/(\d)\s(\d{3})/g, '$1$2').match(/−?\d+(?:,\d+)?/g) ?? []).map((z) =>
    Number(z.replace('−', '-').replace(',', '.')),
  );

const alsZahl = (l: Loesung | undefined) => (l?.typ === 'zahl' ? l.wert : undefined);

const bild = (i: Instanz, id: string) => alsZahl(i.fehlerbilder.find((f) => f.id === id)?.antwort);

const gleich = (a: number, b: number) => runde10(a, 4) === runde10(b, 4);

/**
 * Die beschriebene Zahl muss im Fehlerbild stehen. Fehlt sie, nur wenn sie mit
 * der Lösung oder einem anderen Fehlerbild zusammenfällt – die lässt der
 * Generator weg.
 */
function mussPassen(i: Instanz, id: string, erwartet: number) {
  const ist = bild(i, id);
  if (ist === undefined) {
    const loesung = alsZahl(i.loesung);
    const woanders = i.fehlerbilder.some(
      (f) => f.id !== id && f.antwort.typ === 'zahl' && gleich(f.antwort.wert, erwartet),
    );
    expect(
      (loesung !== undefined && gleich(loesung, erwartet)) || woanders,
      `${id} fehlt, der Satz beschreibt ${runde10(erwartet, 4)}`,
    ).toBe(true);
    return;
  }
  expect(runde10(ist, 4)).toBe(runde10(erwartet, 4));
}

function pruefe(
  name: string,
  erzeuge: (seed: number) => Instanz,
  beschrieben: (i: Instanz) => readonly { id: string; wert: number }[],
  laeufe = 400,
) {
  it(name, () => {
    for (let s = 0; s < laeufe; s++) {
      const i = erzeuge(s);
      for (const f of beschrieben(i)) mussPassen(i, f.id, f.wert);
    }
  });
}

describe('Fehlerbild passt zum beschriebenen Fehler', () => {
  it('Beispiel Schatten: Stab 2 m, Schatten 3 m, Baumschatten 12 m ergibt 0,5 m', () => {
    // Richtig: 2 · 12 : 3 = 8. Umgedrehtes Verhältnis: 2 · 3 : 12 = 0,5.
    // Die alte Rechnung 3 · 12 : 2 = 18 beschreibt diesen Satz nicht.
    expect(runde10((2 * 3) / 12, 4)).toBe(0.5);
    expect(runde10((3 * 12) / 2, 4)).toBe(18);
  });

  pruefe(
    'Schatten: Kehrwert ist das umgedrehte Verhältnis',
    (s) => schattenFlaeche.erzeuge(s, { potenz: false }),
    (i) => {
      const [stab = NaN, schatten = NaN, lang = NaN] = zahlen(text(i, 'aufgabe'));
      return [{ id: 'kehrwert', wert: (stab * schatten) / lang }];
    },
  );

  pruefe(
    'Fehlende Seite: Kehrwert teilt durch k',
    (s) => fehlendeSeite.erzeuge(s, { krumm: true }),
    (i) => {
      const a = text(i, 'aufgabe');
      const seite = (name: string) => {
        const m = new RegExp(`${name} = (−?\\d+(?:,\\d+)?)`).exec(a);
        return Number((m?.[1] ?? 'NaN').replace(',', '.'));
      };
      const k = seite("a'") / seite('a');
      return [{ id: 'kehrwert', wert: seite('b') / k }];
    },
  );

  pruefe(
    'Bildstrecke: durch k geteilt statt malgenommen',
    (s) => bildstrecke.erzeuge(s, { faktor_gesucht: false }),
    (i) => {
      const [laenge = NaN, k = NaN] = zahlen(text(i, 'aufgabe'));
      return [
        { id: 'geteilt-statt-mal', wert: laenge / k },
        { id: 'addiert', wert: laenge + k },
      ];
    },
  );

  pruefe(
    'Streckfaktor: Original durch Bild, nicht umgekehrt',
    (s) => bildstrecke.erzeuge(s, { faktor_gesucht: true }),
    (i) => {
      const [original = NaN, bildLaenge = NaN] = zahlen(text(i, 'aufgabe'));
      return [{ id: 'kehrwert', wert: original / bildLaenge }];
    },
  );

  pruefe(
    'Anstieg aus zwei Punkten: x-Unterschied durch y-Unterschied',
    (s) => geradeBestimmen.erzeuge(s, { zwei_punkte: true }),
    (i) => {
      const m = alsZahl(i.loesung);
      return m === undefined || m === 0 ? [] : [{ id: 'kehrwert', wert: 1 / m }];
    },
  );

  pruefe(
    'Anstieg ablesen: Breite durch Höhe',
    (s) => geradeAblesen.erzeuge(s, { anstieg: true }),
    (i) => {
      const m = alsZahl(i.loesung);
      return m === undefined || m === 0 ? [] : [{ id: 'kehrwert', wert: 1 / m }];
    },
  );

  pruefe(
    'Dreisatz proportional: umgekehrt und 1 € je Stück',
    (s) => dreisatzProportional.erzeuge(s, { cent_schritt: 10, anzahl_max: 20 }),
    (i) => {
      const [a = NaN, preis = NaN, b = NaN] = zahlen(text(i, 'geschichte'));
      const cent = Math.round(preis * 100);
      const umgekehrt = (cent * a) / b;
      const faelle = [{ id: 'differenz-addiert', wert: preis + (b - a) }];
      if (Number.isInteger(umgekehrt))
        faelle.push({ id: 'umgekehrt-gerechnet', wert: umgekehrt / 100 });
      return faelle;
    },
  );

  pruefe(
    'Dreisatz umgekehrt: wie proportional gerechnet',
    (s) => dreisatzUmgekehrt.erzeuge(s, { produkt_max: 360 }),
    (i) => {
      const [a = NaN, dauer = NaN, b = NaN] = zahlen(text(i, 'geschichte'));
      const proportional = (dauer * b) / a;
      return Number.isInteger(proportional) ? [{ id: 'wie-proportional', wert: proportional }] : [];
    },
  );

  pruefe(
    'Prozent: falsch herum ist die vertauschte Division der Formel',
    (s) => grundaufgabeBerechnen.erzeuge(s, { alle: true }),
    (i) => {
      const t = text(i, 'aufgabe');
      const [a = NaN, b = NaN] = zahlen(t);
      if (t.startsWith('Berechne')) return [{ id: 'falsch-herum-geteilt', wert: (b * 100) / a }];
      if (t.includes('Grundwert')) return [{ id: 'falsch-herum-geteilt', wert: (a * 100) / b }];
      return [{ id: 'falsch-herum-geteilt', wert: (b * 100) / a }];
    },
  );

  pruefe(
    'Bequeme Prozente: durch die Prozentzahl geteilt',
    (s) => bequem.erzeuge(s, { saetze: [10, 25, 50] }),
    (i) => {
      const ps = zahlen(text(i, 'prozentsatz'))[0] ?? NaN;
      const g = zahlen(text(i, 'grundwert'))[0] ?? NaN;
      return [{ id: 'geteilt-durch-prozentzahl', wert: g / ps }];
    },
  );

  pruefe(
    'Zinsen: fehlende Hundert passt zur gesuchten Größe',
    (s) => zinsen.erzeuge(s, { erweitert: true }),
    (i) => {
      const t = text(i, 'aufgabe');
      const z = zahlen(t);
      if (t.includes('Zinssatz von')) {
        const [kapital = NaN, satz = NaN] = z;
        return [{ id: 'hundert-vergessen', wert: kapital * satz }];
      }
      if (t.includes('Wie hoch ist der Zinssatz')) {
        const [kapital = NaN, zinsenEuro = NaN] = z;
        return [{ id: 'hundert-vergessen', wert: zinsenEuro / kapital }];
      }
      if (t.includes('Tage')) {
        const [kapital = NaN, , satz = NaN] = z;
        return [{ id: 'tage-vergessen', wert: (kapital * satz) / 100 }];
      }
      return [];
    },
  );

  pruefe(
    'Zinseszins vergessen: zweimal dieselben Zinsen',
    (s) => kapitalNachJahren.erzeuge(s, { erweitert: true }),
    (i) => {
      const t = text(i, 'aufgabe');
      if (!t.includes('zwei Jahre')) return [];
      const [kapital = NaN, satz = NaN] = zahlen(t);
      return [{ id: 'zinseszins-vergessen', wert: kapital * (1 + (2 * satz) / 100) }];
    },
  );

  it('Wahrscheinlichkeit: Kehrwert vertauscht Zähler und Nenner', () => {
    for (const erweitert of [false, true]) {
      for (let s = 0; s < 200; s++) {
        const i = laplace.erzeuge(s, { erweitert });
        const l = i.loesung;
        const k = i.fehlerbilder.find((f) => f.id === 'kehrwert')?.antwort;
        expect(l.typ).toBe('bruch');
        expect(k?.typ).toBe('bruch');
        if (l.typ !== 'bruch' || k?.typ !== 'bruch') continue;
        expect(k.wert.zaehler * l.wert.zaehler).toBe(k.wert.nenner * l.wert.nenner);
      }
    }
  });
});
