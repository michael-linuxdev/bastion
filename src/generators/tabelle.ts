// Tabellen als Bild (Bedarfsliste B7, ab Jahrgang 11/12): Wertetabellen, Vierfeldertafeln und
// Ausschnitte aus der kumulierten Binomialtabelle. Gleiche Regeln wie der SVG-Baukasten:
// keine Verweise, Farbe über currentColor. Die Beschreibung liest die Tabelle Zeile für Zeile
// vor, damit sie auch ohne Bild vollständig ist.
import type { Bild } from '../core/learning/generator';
import { de } from './hilfen';
import { bild, linie, rechteck, text } from './svg';

export interface TabellenAngabe {
  /** Kopfzeile, z. B. ["x", "0", "1", "2"]; ohne Angabe keine */
  readonly kopf?: readonly string[];
  /** Zeilen; die erste Spalte ist der Zeilenkopf, wenn `zeilenkopf` gesetzt ist */
  readonly zeilen: readonly (readonly string[])[];
  /** erste Spalte als Kopf hervorheben (Vierfeldertafel, Wertetabelle) */
  readonly zeilenkopf?: boolean;
  /** Überschrift für die Beschreibung, z. B. „Vierfeldertafel“ */
  readonly titel?: string;
}

const ZEILE = 34;
const ZEICHEN = 8.5;
const RAND = 6;

/** Spaltenbreite nach dem längsten Eintrag, mindestens 44 Pixel */
function breiten(alle: readonly (readonly string[])[]): number[] {
  const spalten = Math.max(...alle.map((z) => z.length));
  return Array.from({ length: spalten }, (_, j) =>
    Math.max(44, ...alle.map((z) => 18 + ZEICHEN * (z[j] ?? '').length)),
  );
}

/** Beschreibung: „Tabelle. Spalten: x, 0, 1. Zeile 1: y, 3, 5.“ */
export function tabellenText(a: TabellenAngabe): string {
  const teile: string[] = [a.titel ?? 'Tabelle'];
  if (a.kopf) teile.push(`Spalten: ${a.kopf.filter((k) => k !== '').join(', ')}`);
  a.zeilen.forEach((z, i) => teile.push(`Zeile ${i + 1}: ${z.join(', ')}`));
  return `${teile.join('. ')}.`;
}

export function tabelle(a: TabellenAngabe): Bild {
  const alle = [...(a.kopf ? [a.kopf] : []), ...a.zeilen];
  const b = breiten(alle);
  const gesamt = b.reduce((s, x) => s + x, 0);
  const hoehe = alle.length * ZEILE;
  const teile: string[] = [];
  // Hintergrund für Kopfzeile und Kopfspalte
  const flaeche = (x: number, y: number, w: number, h: number) =>
    rechteck(x, y, w, h, true).replace('fill-opacity="0.35"', 'fill-opacity="0.12"');
  if (a.kopf) teile.push(flaeche(RAND, RAND, gesamt, ZEILE));
  const oben = a.kopf ? ZEILE : 0;
  if (a.zeilenkopf) teile.push(flaeche(RAND, RAND + oben, b[0] ?? 0, hoehe - oben));
  // Gitter
  for (let i = 0; i <= alle.length; i++)
    teile.push(
      linie(
        RAND,
        RAND + i * ZEILE,
        RAND + gesamt,
        RAND + i * ZEILE,
        i === 0 || i === alle.length ? 2 : 1,
      ),
    );
  let x = RAND;
  for (let j = 0; j <= b.length; j++) {
    teile.push(linie(x, RAND, x, RAND + hoehe, j === 0 || j === b.length ? 2 : 1));
    x += b[j] ?? 0;
  }
  // Einträge
  alle.forEach((zeile, i) => {
    let links = RAND;
    zeile.forEach((eintrag, j) => {
      const w = b[j] ?? 0;
      teile.push(
        text(links + w / 2, RAND + i * ZEILE + ZEILE / 2 + 5, eintrag.replace(/-/g, '−'), 14),
      );
      links += w;
    });
  });
  return bild(gesamt + 2 * RAND, hoehe + 2 * RAND, teile, de(tabellenText(a)));
}

/** Vierfeldertafel mit Summen: Ereignis A/Ā in Zeilen, B/B̄ in Spalten */
export function vierfeldertafel(
  namen: { readonly a: string; readonly b: string },
  werte: readonly [readonly [string, string], readonly [string, string]],
  summen?: {
    readonly zeilen: readonly [string, string];
    readonly spalten: readonly [string, string];
    readonly gesamt: string;
  },
): Bild {
  const nicht = (n: string) => `nicht ${n}`;
  const kopf = ['', namen.b, nicht(namen.b), ...(summen ? ['Summe'] : [])];
  const zeile = (i: 0 | 1, name: string) => [
    name,
    ...werte[i],
    ...(summen ? [summen.zeilen[i]] : []),
  ];
  const zeilen = [
    zeile(0, namen.a),
    zeile(1, nicht(namen.a)),
    ...(summen ? [['Summe', ...summen.spalten, summen.gesamt]] : []),
  ];
  return tabelle({ kopf, zeilen, zeilenkopf: true, titel: 'Vierfeldertafel' });
}
