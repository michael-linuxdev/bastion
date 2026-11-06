// Quader (VERMITTLUNG §2.3, Werkzeug quader@1): Schrägbild eines Quaders oder Würfels mit
// Maßen, auf Wunsch aus Einheitswürfeln und Schicht für Schicht gefüllt; oder sein Netz mit
// gleich getönten Gegenflächen. Interaktiv legen Knöpfe Schichten hinein oder nehmen sie weg.
// Reine Logik; die Darstellung ist Quader.svelte.
import type { Bild } from '../../../core/learning/generator';
import { zahlDeutsch } from '../../../core/learning/format';
import { bild, linie, text, vieleck } from '../../../generators/svg';
import { t } from '../../texte/texte';

export interface QuaderParameter {
  /** Länge, Breite (Tiefe), Höhe in Einheiten, ganze Zahlen 1–10 (Standard 4, 3, 2) */
  readonly laenge?: unknown;
  readonly breite?: unknown;
  readonly hoehe?: unknown;
  /** Längeneinheit: mm, cm, dm oder m (Standard cm) */
  readonly einheit?: unknown;
  /** false: keine Maße */
  readonly masse?: unknown;
  /** true: aus Einheitswürfeln (Raster auf den sichtbaren Flächen) */
  readonly wuerfel?: unknown;
  /** Zahl der gelegten Schichten von unten; macht das Werkzeug zum Füllen mit Knöpfen */
  readonly schichten?: unknown;
  /** true: statt des Schrägbilds das Netz (vorne, hinten, oben, unten, links, rechts) */
  readonly netz?: unknown;
}

export interface Quader {
  readonly laenge: number;
  readonly breite: number;
  readonly hoehe: number;
  readonly einheit: string;
  readonly masse: boolean;
  readonly wuerfel: boolean;
  readonly schichten?: number;
  readonly netz: boolean;
}

const EINHEITEN = ['mm', 'cm', 'dm', 'm'];
const kante = (x: unknown, sonst: number) =>
  typeof x === 'number' && Number.isInteger(x) && x >= 1 && x <= 10 ? x : sonst;

export function quaderAus(p: QuaderParameter): Quader {
  const hoehe = kante(p.hoehe, 2);
  const schichten =
    typeof p.schichten === 'number' && Number.isInteger(p.schichten)
      ? Math.min(hoehe, Math.max(0, p.schichten))
      : undefined;
  return {
    laenge: kante(p.laenge, 4),
    breite: kante(p.breite, 3),
    hoehe,
    einheit: EINHEITEN.includes(p.einheit as string) ? (p.einheit as string) : 'cm',
    masse: p.masse !== false,
    wuerfel: p.wuerfel === true || schichten !== undefined,
    ...(schichten !== undefined ? { schichten } : {}),
    netz: p.netz === true,
  };
}

/** Schichten legen (+1) oder wegnehmen (−1); bleibt zwischen 0 und der Höhe. */
export function gefuellt(z: Quader, delta: number): Quader {
  if (z.schichten === undefined) return z;
  return { ...z, schichten: Math.min(z.hoehe, Math.max(0, z.schichten + delta)) };
}

const istWuerfel = (z: Quader) => z.laenge === z.breite && z.breite === z.hoehe;
const mass = (z: Quader, n: number) => `${zahlDeutsch(n)} ${z.einheit}`;
const mal = (z: Quader, a: number, b: number) =>
  `${mass(z, a)} ${t('werkzeug.flaeche.mal')} ${mass(z, b)}`;

/** „1 von 2 Schichten gelegt, jede Schicht 4 mal 3 Würfel.“ */
export function schichtenText(z: Quader): string {
  return `${z.schichten ?? z.hoehe} ${t('werkzeug.flaeche.von')} ${z.hoehe} ${t('werkzeug.quader.schichten')}, ${t('werkzeug.quader.je-schicht')} ${z.laenge} ${t('werkzeug.flaeche.mal')} ${z.breite} ${t('werkzeug.quader.wuerfel-kurz')}.`;
}

/** Text für den Bildschirmleser: Körper und Maße, Würfel und Schichten oder das Netz. */
export function beschreibung(z: Quader): string {
  const saetze = [
    istWuerfel(z)
      ? `${t('werkzeug.quader.wuerfel')} ${mass(z, z.laenge)}.`
      : `${t('werkzeug.quader.quader')} ${mass(z, z.laenge)} ${t('werkzeug.flaeche.lang')}, ${mass(z, z.breite)} ${t('werkzeug.flaeche.breit')}, ${mass(z, z.hoehe)} ${t('werkzeug.quader.hoch')}.`,
  ];
  if (z.netz) {
    saetze.push(
      `${t('werkzeug.quader.netz')} ${t('werkzeug.quader.vorne-hinten')} ${mal(z, z.laenge, z.hoehe)}, ${t('werkzeug.quader.oben-unten')} ${mal(z, z.laenge, z.breite)}, ${t('werkzeug.quader.links-rechts')} ${mal(z, z.breite, z.hoehe)}. ${t('werkzeug.quader.gegen')}`,
    );
    return saetze.join(' ');
  }
  if (z.wuerfel) saetze.push(`${t('werkzeug.quader.aus')} 1 ${z.einheit}³.`);
  if (z.schichten !== undefined) saetze.push(schichtenText(z));
  return saetze.join(' ');
}

const BREITE = 340;

function schraegbild(z: Quader): { teile: string[]; hoehe: number } {
  const { laenge: l, breite: b, hoehe: h } = z;
  const f = 0.5 * Math.SQRT1_2; // Tiefe unter 45°, verkürzt auf die Hälfte
  const s = Math.min(30, 230 / (l + b * f), 170 / (h + b * f));
  const dx = b * s * f;
  const x0 = (BREITE - (l * s + dx)) / 2;
  const y0 = 16 + h * s + dx;
  const p = (x: number, y: number, tiefe: number): [number, number] => [
    x0 + x * s + tiefe * s * f,
    y0 - y * s - tiefe * s * f,
  ];
  const teile: string[] = [];
  const hs = z.schichten ?? h;
  const flaeche = (ecken: [number, number][], ton: number) =>
    vieleck(ecken).replace('/>', ` fill="currentColor" fill-opacity="${ton}"/>`);
  if (hs > 0) {
    teile.push(
      flaeche([p(0, 0, 0), p(l, 0, 0), p(l, hs, 0), p(0, hs, 0)], 0.1),
      flaeche([p(0, hs, 0), p(l, hs, 0), p(l, hs, b), p(0, hs, b)], 0.3),
      flaeche([p(l, 0, 0), p(l, 0, b), p(l, hs, b), p(l, hs, 0)], 0.2),
    );
    if (z.wuerfel) {
      const d = (a: [number, number], c: [number, number]) => linie(a[0], a[1], c[0], c[1], 0.75);
      for (let i = 1; i < l; i++)
        teile.push(d(p(i, 0, 0), p(i, hs, 0)), d(p(i, hs, 0), p(i, hs, b)));
      for (let j = 1; j < hs; j++) teile.push(d(p(0, j, 0), p(l, j, 0)), d(p(l, j, 0), p(l, j, b)));
      for (let k = 1; k < b; k++)
        teile.push(d(p(0, hs, k), p(l, hs, k)), d(p(l, 0, k), p(l, hs, k)));
    }
  }
  const strich = (a: [number, number], c: [number, number], gestrichelt: boolean) =>
    linie(a[0], a[1], c[0], c[1], gestrichelt ? 1.5 : 2).replace(
      '/>',
      gestrichelt ? ' stroke-dasharray="5 4"/>' : '/>',
    );
  // Sichtbare Kanten; über den gelegten Schichten gestrichelt (die leere Kiste).
  const leer = hs < h;
  teile.push(
    strich(p(0, 0, 0), p(l, 0, 0), false),
    strich(p(l, 0, 0), p(l, 0, b), false),
    strich(p(0, 0, 0), p(0, hs, 0), false),
    strich(p(l, 0, 0), p(l, hs, 0), false),
    strich(p(l, 0, b), p(l, hs, b), false),
    strich(p(0, hs, 0), p(l, hs, 0), false),
    strich(p(l, hs, 0), p(l, hs, b), false),
  );
  if (hs > 0)
    teile.push(strich(p(0, hs, 0), p(0, hs, b), false), strich(p(0, hs, b), p(l, hs, b), false));
  if (leer)
    teile.push(
      strich(p(0, hs, 0), p(0, h, 0), true),
      strich(p(l, hs, 0), p(l, h, 0), true),
      strich(p(l, hs, b), p(l, h, b), true),
      strich(p(0, h, 0), p(l, h, 0), true),
      strich(p(l, h, 0), p(l, h, b), true),
      strich(p(0, h, 0), p(0, h, b), true),
      strich(p(0, h, b), p(l, h, b), true),
    );
  // Verdeckte Kanten hinten unten links
  teile.push(
    strich(p(0, 0, 0), p(0, 0, b), true),
    strich(p(0, 0, b), p(l, 0, b), true),
    strich(p(0, 0, b), p(0, h, b), true),
  );
  if (z.masse) {
    const [ax, ay] = p(0, 0, 0);
    const [bx, by] = p(l, 0, 0);
    const [, dy] = p(0, h, 0);
    const [fx, fy] = p(l, 0, b);
    teile.push(
      text((ax + bx) / 2, ay + 20, mass(z, l), 13),
      text(ax - 10 - 3.6 * mass(z, h).length, (ay + dy) / 2 + 5, mass(z, h), 13),
      text((bx + fx) / 2 + 12 + 3.6 * mass(z, b).length, (by + fy) / 2 + 8, mass(z, b), 13),
    );
  }
  return { teile, hoehe: y0 + 30 };
}

function netzbild(z: Quader): { teile: string[]; hoehe: number } {
  const { laenge: l, breite: b, hoehe: h } = z;
  const k = Math.min(24, 320 / (2 * l + 2 * b), 220 / (h + 2 * b));
  const x0 = (BREITE - (2 * l + 2 * b) * k) / 2;
  const y0 = 10;
  const teile: string[] = [];
  const feld = (x: number, y: number, w: number, hh: number, ton: number, name: string) => {
    const [px, py] = [x0 + x * k, y0 + y * k];
    teile.push(
      `<rect x="${px}" y="${py}" width="${w * k}" height="${hh * k}" fill="currentColor" fill-opacity="${ton}"/>`,
    );
    const zweiZeilen = hh * k >= 38 && z.masse;
    teile.push(text(px + (w * k) / 2, py + (hh * k) / 2 + (zweiZeilen ? -3 : 4), name, 11));
    if (zweiZeilen)
      teile.push(
        text(
          px + (w * k) / 2,
          py + (hh * k) / 2 + 13,
          `${zahlDeutsch(w)} · ${zahlDeutsch(hh)}`,
          12,
        ),
      );
  };
  feld(0, b, b, h, 0.2, t('werkzeug.quader.links'));
  feld(b, b, l, h, 0.08, t('werkzeug.quader.vorne'));
  feld(b + l, b, b, h, 0.2, t('werkzeug.quader.rechts'));
  feld(2 * b + l, b, l, h, 0.08, t('werkzeug.quader.hinten'));
  feld(b, 0, l, b, 0.32, t('werkzeug.quader.oben'));
  feld(b, b + h, l, b, 0.32, t('werkzeug.quader.unten'));
  return { teile, hoehe: y0 + (h + 2 * b) * k + 12 };
}

export function quaderBild(z: Quader): Bild {
  const { teile, hoehe } = z.netz ? netzbild(z) : schraegbild(z);
  return bild(BREITE, hoehe, teile, { de: beschreibung(z) });
}
