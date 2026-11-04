// Stabdiagramm einer Wahrscheinlichkeitsverteilung (Klasse 10, Feld ZG) für Aufgaben und das
// Werkzeug stabdiagramm@1: je Wert ein senkrechter Stab mit der Höhe P(X = x). Ein fehlender
// Wert (undefined) erscheint gestrichelt mit „?“. Eigenes kleines Modul, damit die App-Hülle
// nicht alle Generatoren lädt.
import type { Bild } from '../../../core/learning/generator';
import { zahlText } from '../../../core/learning/text';
import { de } from '../../hilfen';
import { bild, gestrichelt, linie, text } from '../../svg';

const ABSTAND = 54;
const X0 = 52;
const HOEHE = 200;

/** Stäbe zu den Werten `werte` mit Wahrscheinlichkeiten `p` (0 … 1, undefined = gesucht). */
export function stabdiagramm(
  werte: readonly number[],
  p: readonly (number | undefined)[],
  name = 'X',
): Bild {
  const bekannt = p.filter((x): x is number => typeof x === 'number');
  // Achse bis zur nächsten Zehntelstufe über dem größten Wert, mindestens 0,5
  const max = Math.max(0.5, Math.ceil(Math.max(...bekannt, 0) * 10 + 0.5) / 10);
  const y0 = 24 + HOEHE;
  const py = (w: number) => y0 - (w / max) * HOEHE;
  const breite = X0 + werte.length * ABSTAND + 20;
  const teile: string[] = [
    linie(X0, y0, breite - 10, y0, 2),
    linie(X0, 16, X0, y0, 2),
    text(X0 + 4, 12, `P(${name} = x)`, 11),
  ];
  for (let k = 0; k <= Math.round(max * 10); k++) {
    const w = k / 10;
    teile.push(linie(X0 - 4, py(w), X0, py(w), 1), text(X0 - 20, py(w) + 4, zahlText(w), 11));
  }
  werte.forEach((x, i) => {
    const mx = X0 + (i + 0.5) * ABSTAND;
    const w = p[i];
    teile.push(text(mx, y0 + 16, String(x).replace('-', '−'), 12));
    if (typeof w === 'number') {
      teile.push(linie(mx, y0, mx, py(w), 7));
    } else {
      teile.push(gestrichelt(mx, y0, mx, py(max * 0.6), 2), text(mx, py(max * 0.6) - 6, '?', 14));
    }
  });
  teile.push(text(breite - 8, y0 + 16, 'x', 12));
  const liste = werte
    .map((x, i) => {
      const w = p[i];
      return `P(${name} = ${x}) = ${typeof w === 'number' ? zahlText(w) : 'gesucht'}`;
    })
    .join('; ');
  return bild(breite, y0 + 28, teile, de(`Stabdiagramm einer Verteilung: ${liste}.`));
}
