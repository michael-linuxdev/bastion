// Winkel (VERMITTLUNG §2.3, Werkzeug winkel@1): ein Winkel mit Scheitel, zwei Schenkeln und
// Bogen, auf Wunsch am Winkelmesser. Interaktiv wird er mit Knöpfen größer und kleiner, die
// Winkelart steht dabei. Reine Logik; die Darstellung ist Winkel.svelte.
import type { Bild } from '../../../core/learning/generator';
import {
  rechterWinkel,
  WINKELMESSER,
  winkelmesserTeile,
} from '../../../generators/mathematik/geometrie/winkel';
import { aufKreis, bild, bogen, kreis, linie, text } from '../../../generators/svg';
import { t } from '../../texte/texte';

export interface WinkelParameter {
  /** Größe in Grad, 0 … 360 (Standard 60); mit Winkelmesser höchstens 180 */
  readonly grad?: unknown;
  /** Name des Winkels (Standard α) */
  readonly name?: unknown;
  /** true: Winkelmesser mit zwei Skalen liegt am Scheitel */
  readonly winkelmesser?: unknown;
  /** true: der erste Schenkel zeigt nach links (innere Skala) */
  readonly links?: unknown;
  /** Schrittweite der Knöpfe in Grad (Standard 10) */
  readonly schritt?: unknown;
  /** true: Die Beschreibung nennt Größe und Winkelart nicht (das Bild gehört zu einer Frage) */
  readonly frage?: unknown;
}

export interface Winkel {
  readonly grad: number;
  readonly name: string;
  readonly winkelmesser: boolean;
  readonly links: boolean;
  readonly schritt: number;
  readonly frage: boolean;
}

export const WINKELARTEN = [
  'spitz',
  'recht',
  'stumpf',
  'gestreckt',
  'ueberstumpf',
  'voll',
] as const;
export type Winkelart = (typeof WINKELARTEN)[number];

export function winkelart(grad: number): Winkelart {
  if (grad < 90) return 'spitz';
  if (grad === 90) return 'recht';
  if (grad < 180) return 'stumpf';
  if (grad === 180) return 'gestreckt';
  if (grad < 360) return 'ueberstumpf';
  return 'voll';
}

const ganz = (x: unknown, von: number, bis: number, sonst: number) =>
  typeof x === 'number' && Number.isInteger(x) && x >= von && x <= bis ? x : sonst;

export function winkelAus(p: WinkelParameter): Winkel {
  const winkelmesser = p.winkelmesser === true;
  return {
    grad: ganz(p.grad, 0, winkelmesser ? 180 : 360, 60),
    name: typeof p.name === 'string' && p.name.length > 0 && p.name.length <= 3 ? p.name : 'α',
    winkelmesser,
    links: p.links === true,
    schritt: ganz(p.schritt, 1, 45, 10),
    frage: p.frage === true,
  };
}

/** Winkel um `delta` ändern, im erlaubten Bereich (0 … 360, am Winkelmesser 0 … 180). */
export function geaendert(z: Winkel, delta: number): Winkel {
  const max = z.winkelmesser ? 180 : 360;
  return { ...z, grad: Math.min(max, Math.max(0, z.grad + delta)) };
}

/** Text für den Bildschirmleser. */
export function beschreibung(z: Winkel): string {
  const art = t(`werkzeug.winkel.art.${winkelart(z.grad)}`);
  const saetze = [
    z.frage
      ? `${t('werkzeug.winkel.ein')} ${z.name}.`
      : `${t('werkzeug.winkel.ein')} ${z.name} ${t('werkzeug.winkel.von')} ${z.grad}°, ${art}.`,
  ];
  if (z.winkelmesser) {
    const skala = (g: number) =>
      `${g} ${t('werkzeug.winkel.aussen')} ${t('werkzeug.geraden.und')} ${180 - g} ${t('werkzeug.winkel.innen')}`;
    const erster = z.links ? 180 : 0;
    const zweiter = z.links ? 180 - z.grad : z.grad;
    saetze.push(
      `${t('werkzeug.winkel.messer')} ${t('werkzeug.winkel.erster')} ${skala(erster)}, ${t('werkzeug.winkel.zweiter')} ${skala(zweiter)}.`,
    );
  } else {
    saetze.push(t(z.links ? 'werkzeug.winkel.nach-links' : 'werkzeug.winkel.nach-rechts'));
  }
  return saetze.join(' ');
}

export function winkelBild(z: Winkel): Bild {
  const teile: string[] = [];
  const erster = z.links ? 180 : 0;
  const zweiter = z.links ? 180 - z.grad : z.grad;
  const von = z.links ? 180 - z.grad : 0;
  const bis = z.links ? 180 : z.grad;
  if (z.winkelmesser) {
    // B12: gleiche Maße wie die Aufgabe; Schenkel unter den Zahlen, damit diese lesbar bleiben
    const { cx, cy, schenkel, breite, hoehe } = WINKELMESSER;
    const [ex, ey] = aufKreis(cx, cy, schenkel, erster);
    const [zx, zy] = aufKreis(cx, cy, schenkel, zweiter);
    const unten = [linie(cx, cy, ex, ey, 2.5), linie(cx, cy, zx, zy, 2.5)];
    if (z.grad > 0) unten.push(bogen(cx, cy, 34, von, bis));
    if (z.grad >= 20) {
      const [lx, ly] = aufKreis(cx, cy, 52, (von + bis) / 2);
      unten.push(text(lx, ly + 5, z.name, 15));
    }
    return bild(breite, hoehe, winkelmesserTeile(cx, cy, unten), { de: beschreibung(z) });
  }
  const [cx, cy] = [150, 110];
  const [x1, y1] = aufKreis(cx, cy, 100, erster);
  const [x2, y2] = aufKreis(cx, cy, 100, zweiter);
  teile.push(linie(cx, cy, x1, y1, 2.5), linie(cx, cy, x2, y2, 2.5));
  if (z.grad === 90) teile.push(...rechterWinkel(cx, cy, von));
  else if (z.grad >= 360) teile.push(kreis(cx, cy, 30));
  else if (z.grad > 0) teile.push(bogen(cx, cy, 30, von, bis));
  teile.push(kreis(cx, cy, 3, true));
  if (z.grad > 0) {
    const [lx, ly] = aufKreis(cx, cy, z.grad >= 360 ? 45 : 50, (von + bis) / 2);
    teile.push(text(lx, ly + 5, z.name, 16));
  }
  return bild(300, 220, teile, { de: beschreibung(z) });
}
