// Skizze eines rechtwinkligen Dreiecks für Aufgaben (Feld PY, TR) und das Werkzeug dreieck@1
// der Erstvermittlung. Eigenes kleines Modul, damit die App-Hülle nicht alle Generatoren lädt.
import type { Bild } from '../../../core/learning/generator';
import { de } from '../../hilfen';
import { bild, linie, text, vieleck } from '../../svg';

export type Ecke = 'A' | 'B' | 'C';
export const SEITE: Readonly<Record<Ecke, string>> = { A: 'a', B: 'b', C: 'c' };
/** Die beiden anderen Ecken in fester Reihenfolge */
export const ANDERE: Readonly<Record<Ecke, readonly [Ecke, Ecke]>> = {
  A: ['B', 'C'],
  B: ['C', 'A'],
  C: ['A', 'B'],
};

/**
 * Skizze eines rechtwinkligen Dreiecks: rechter Winkel unten links an `rechts`, die Seiten mit
 * Namen und, wenn angegeben, Längen beschriftet („a = 6 cm“, „c = ?“).
 */
export function dreieckSkizze(
  rechts: Ecke,
  beschriftung: Readonly<Record<string, string>>,
  /** Fassung 1: Beschriftung der senkrechten Seite lag links außerhalb des Bildes */
  fassung: 1 | 2,
): Bild {
  const [unten, oben] = ANDERE[rechts];
  const links = fassung === 1 ? 40 : 130;
  const P = { [rechts]: [links, 170], [unten]: [links + 210, 170], [oben]: [links, 40] } as Record<
    Ecke,
    [number, number]
  >;
  const [rx, ry] = P[rechts];
  const teile = [
    vieleck([P.A, P.B, P.C]),
    linie(rx + 14, ry, rx + 14, ry - 14, 1.5),
    linie(rx, ry - 14, rx + 14, ry - 14, 1.5),
    text(P[rechts][0] - 18, P[rechts][1] + 16, rechts, 14),
    text(P[unten][0] + 6, P[unten][1] + 16, unten, 14),
    text(P[oben][0] - 18, P[oben][1] - 4, oben, 14),
  ];
  // Seitenbeschriftung: Seite gegenüber jeder Ecke, in der Mitte der Seite
  const mitte = (e: Ecke): [number, number] => {
    const [x, y] = ANDERE[e];
    return [(P[x][0] + P[y][0]) / 2, (P[x][1] + P[y][1]) / 2];
  };
  for (const e of ['A', 'B', 'C'] as const) {
    const [mx, my] = mitte(e);
    const name = SEITE[e];
    const t = beschriftung[name] ?? name;
    // Fassung 2: Abstand nach der Länge der Beschriftung (etwa 3,6 Pixel je halbes Zeichen),
    // links neben der senkrechten Seite, rechts oberhalb der Hypotenuse
    const halb = 3.6 * t.length;
    const dx =
      fassung === 1
        ? e === rechts
          ? 10
          : e === unten
            ? -64
            : 4
        : e === rechts
          ? 12 + halb
          : e === unten
            ? -10 - halb
            : 0;
    const dy = e === rechts ? (fassung === 1 ? -8 : -10) : e === unten ? 4 : 22;
    teile.push(text(mx + dx, my + dy, t, 13));
  }
  const besch = Object.entries(beschriftung)
    .map(([k, v]) => v.replace(/^[a-z] = /, `${k} = `))
    .join(', ');
  return bild(
    fassung === 1 ? 300 : 390,
    200,
    teile,
    de(
      `Skizze eines rechtwinkligen Dreiecks ABC, nicht maßstäblich. Der rechte Winkel liegt bei ${rechts}.${besch ? ` ${besch}.` : ''}`,
    ),
  );
}
