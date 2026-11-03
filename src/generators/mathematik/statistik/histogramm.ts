// Histogramm für Aufgaben (Feld ST) und das Werkzeug histogramm@1 der Erstvermittlung.
// Eigenes kleines Modul, damit die App-Hülle nicht alle Generatoren lädt.
import { de } from '../../hilfen';
import { bild, linie, rechteck, text } from '../../svg';

export function histogramm(
  grenzen: readonly number[],
  haeufig: readonly number[],
): ReturnType<typeof bild> {
  const max = Math.max(...haeufig);
  const breite = 50;
  const hoehe = 26;
  const x0 = 40;
  const y0 = 30 + max * hoehe;
  const teile: string[] = [
    linie(x0, y0, x0 + haeufig.length * breite + 10, y0, 2),
    linie(x0, 20, x0, y0, 2),
  ];
  for (let k = 0; k <= max; k++)
    teile.push(
      text(x0 - 22, y0 - k * hoehe + 4, String(k), 11),
      linie(x0 - 4, y0 - k * hoehe, x0, y0 - k * hoehe, 1),
    );
  haeufig.forEach((h, i) => {
    teile.push(rechteck(x0 + i * breite, y0 - h * hoehe, breite, h * hoehe));
  });
  grenzen.forEach((g, i) => teile.push(text(x0 + i * breite - 8, y0 + 16, String(g), 11)));
  return bild(
    x0 + haeufig.length * breite + 30,
    y0 + 26,
    teile,
    de(
      `Histogramm mit den Klassen ${grenzen
        .slice(0, -1)
        .map((g, i) => `${g} bis unter ${grenzen[i + 1]}: ${haeufig[i]}`)
        .join(', ')}.`,
    ),
  );
}
