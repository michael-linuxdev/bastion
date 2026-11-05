// Körpernetz (VERMITTLUNG §2.3, Werkzeug koerpernetz@1): ein Würfelnetz aus sechs Quadraten mit
// Buchstaben, auf Wunsch daneben der gefaltete Würfel als Schrägbild. Interaktiv wird ein
// Quadrat als Boden gewählt; das Werkzeug zeigt, welches Quadrat gegenüberliegt. Bei sechs
// Quadraten, die kein Netz ergeben, zeigt es, welche beim Falten aufeinanderfallen.
// Reine Logik; die Darstellung ist Koerpernetz.svelte.
import type { Bild } from '../../../core/learning/generator';
import {
  abrollen,
  istWuerfelnetz,
  normiert,
  WUERFELNETZE,
  type Netz,
} from '../../../generators/mathematik/koerper/netze';
import { bild, gestrichelt, linie, rechteck, text, vieleck } from '../../../generators/svg';
import { t } from '../../texte/texte';

export interface KoerpernetzParameter {
  /** Nummer 1 … 11 eines Würfelnetzes oder eigene Kästchen [[Spalte, Zeile], …] (sechs Stück) */
  readonly netz?: unknown;
  /** sechs Buchstaben, Reihenfolge der Kästchen zeilenweise von oben links (Standard A … F) */
  readonly buchstaben?: unknown;
  /** Buchstabe des Quadrats, das als Boden gewählt und hervorgehoben ist */
  readonly boden?: unknown;
  /** true: daneben der gefaltete Würfel als Schrägbild */
  readonly schraegbild?: unknown;
  /** true: Die Beschreibung sagt nicht, ob es ein Würfelnetz ist (das Bild gehört zu einer Frage) */
  readonly frage?: unknown;
}

export interface Koerpernetz {
  readonly netz: Netz;
  readonly buchstaben: readonly string[];
  /** Index des Bodens im Netz */
  readonly boden?: number;
  readonly schraegbild: boolean;
  readonly istNetz: boolean;
  readonly frage: boolean;
}

const STANDARD = ['A', 'B', 'C', 'D', 'E', 'F'];

/** Sechs zusammenhängende Kästchen aus der Angabe; sonst Netz 1 (Kreuz). */
function netzAus(x: unknown): Netz {
  if (typeof x === 'number' && Number.isInteger(x) && x >= 1 && x <= WUERFELNETZE.length)
    return normiert(WUERFELNETZE[x - 1] ?? []);
  if (Array.isArray(x) && x.length === 6) {
    const zellen = x.flatMap((z) => {
      if (!Array.isArray(z) || z.length !== 2) return [];
      const [s, r] = z as unknown[];
      return typeof s === 'number' &&
        typeof r === 'number' &&
        Number.isInteger(s) &&
        Number.isInteger(r)
        ? [[s, r] as const]
        : [];
    });
    if (zellen.length === 6 && zusammenhaengend(zellen) && keineDoppelten(zellen)) {
      const n = normiert(zellen);
      if (Math.max(...n.map(([s]) => s)) <= 5 && Math.max(...n.map(([, z]) => z)) <= 5) return n;
    }
  }
  return normiert(WUERFELNETZE[0] ?? []);
}

const keineDoppelten = (n: Netz) => new Set(n.map(([s, z]) => `${s},${z}`)).size === n.length;

function zusammenhaengend(n: Netz): boolean {
  const gesehen = new Set<number>([0]);
  const warteschlange = [0];
  while (warteschlange.length) {
    const i = warteschlange.shift() ?? 0;
    const [s, z] = n[i] ?? [0, 0];
    n.forEach(([a, b], j) => {
      if (!gesehen.has(j) && Math.abs(a - s) + Math.abs(b - z) === 1) {
        gesehen.add(j);
        warteschlange.push(j);
      }
    });
  }
  return gesehen.size === n.length;
}

export function koerpernetzAus(p: KoerpernetzParameter): Koerpernetz {
  const netz = netzAus(p.netz);
  const roh = Array.isArray(p.buchstaben) ? p.buchstaben : [];
  const buchstaben = STANDARD.map((b, i) => {
    const x = roh[i];
    return typeof x === 'string' && x.length >= 1 && x.length <= 2 ? x : b;
  });
  const boden = typeof p.boden === 'string' ? buchstaben.indexOf(p.boden) : -1;
  return {
    netz,
    buchstaben,
    ...(boden >= 0 ? { boden } : {}),
    schraegbild: p.schraegbild === true,
    istNetz: istWuerfelnetz(netz),
    frage: p.frage === true,
  };
}

/** Boden wählen (Index) oder die Wahl aufheben (undefined). */
export function mitBoden(z: Koerpernetz, boden: number | undefined): Koerpernetz {
  const ohne: Koerpernetz = {
    netz: z.netz,
    buchstaben: z.buchstaben,
    schraegbild: z.schraegbild,
    istNetz: z.istNetz,
    frage: z.frage,
  };
  return boden !== undefined && boden >= 0 && boden < 6 ? { ...ohne, boden } : ohne;
}

/**
 * Welche Würfelfläche jedes Kästchen wird, wenn `boden` unten liegt:
 * 0 oben, 1 unten, 2 hinten, 3 vorn, 4 rechts, 5 links. Gegenüber: 0/1, 2/3, 4/5.
 */
export function flaechen(z: Koerpernetz, boden = 0): number[] {
  const reihenfolge = [boden, ...z.netz.map((_, i) => i).filter((i) => i !== boden)];
  const f = abrollen(reihenfolge.map((i) => z.netz[i] ?? [0, 0]));
  const ergebnis: number[] = z.netz.map(() => -1);
  reihenfolge.forEach((i, k) => {
    ergebnis[i] = f[k] ?? -1;
  });
  return ergebnis;
}

/** Index des Kästchens, das dem Boden gegenüberliegt (bei echten Netzen genau eines). */
export function gegenueber(z: Koerpernetz, boden: number): number | undefined {
  const f = flaechen(z, boden);
  const i = f.indexOf(0);
  return i >= 0 ? i : undefined;
}

/** Bei sechs Quadraten ohne Netz: Gruppen von Kästchen, die auf dieselbe Fläche fallen. */
export function doppelte(z: Koerpernetz, boden = 0): number[][] {
  const f = flaechen(z, boden);
  const gruppen = new Map<number, number[]>();
  f.forEach((fl, i) => gruppen.set(fl, [...(gruppen.get(fl) ?? []), i]));
  return [...gruppen.values()].filter((g) => g.length > 1);
}

/** Text für den Bildschirmleser. */
export function beschreibung(z: Koerpernetz): string {
  const zeilen = [...new Set(z.netz.map(([, r]) => r))].map(
    (r) =>
      `${t('werkzeug.koerpernetz.zeile')} ${r + 1}: ${t('werkzeug.koerpernetz.spalten')} ${z.netz
        .filter(([, b]) => b === r)
        .map(([s]) => s + 1)
        .join(', ')}`,
  );
  const saetze = [
    `${t(z.frage ? 'werkzeug.koerpernetz.sechs' : z.istNetz ? 'werkzeug.koerpernetz.netz' : 'werkzeug.koerpernetz.kein-netz')} ${t('werkzeug.koerpernetz.zeilen')} ${zeilen.join('; ')}.`,
    `${t('werkzeug.koerpernetz.beschriftung')} ${z.buchstaben.join(', ')}.`,
  ];
  if (z.boden !== undefined) {
    const b = z.buchstaben[z.boden] ?? '';
    if (z.istNetz) {
      const g = gegenueber(z, z.boden);
      saetze.push(
        `${t('werkzeug.koerpernetz.boden')} ${b}, ${t('werkzeug.koerpernetz.gegenueber')} ${z.buchstaben[g ?? 0] ?? ''}.`,
      );
      if (z.schraegbild) {
        const f = flaechen(z, z.boden);
        const name = (seite: number) => z.buchstaben[f.indexOf(seite)] ?? '';
        saetze.push(
          `${t('werkzeug.koerpernetz.schraegbild')} ${name(3)}, ${t('werkzeug.koerpernetz.oben')} ${name(0)}, ${t('werkzeug.koerpernetz.rechts')} ${name(4)}.`,
        );
      }
    } else {
      const gruppen = doppelte(z, z.boden);
      saetze.push(
        `${t('werkzeug.koerpernetz.boden')} ${b}. ${t('werkzeug.koerpernetz.doppelt')} ${gruppen
          .map((g) => g.map((i) => z.buchstaben[i] ?? '').join(` ${t('werkzeug.geraden.und')} `))
          .join(
            '; ',
          )}. ${t('werkzeug.koerpernetz.offen')} ${6 - new Set(flaechen(z, z.boden)).size}.`,
      );
    }
  }
  return saetze.join(' ');
}

const NETZ_GROESSE = 190;

export function koerpernetzBild(z: Koerpernetz): Bild {
  const n = z.netz;
  const breite = Math.max(...n.map(([s]) => s)) + 1;
  const hoehe = Math.max(...n.map(([, r]) => r)) + 1;
  const k = Math.min(36, (NETZ_GROESSE - 20) / Math.max(breite, hoehe));
  const ox = (NETZ_GROESSE - breite * k) / 2;
  const oy = (NETZ_GROESSE - hoehe * k) / 2;
  const f = z.boden === undefined ? undefined : flaechen(z, z.boden);
  const gruppen = z.boden === undefined || z.istNetz ? [] : doppelte(z, z.boden).flat();
  const teile: string[] = [];
  n.forEach(([s, r], i) => {
    const x = ox + s * k;
    const y = oy + r * k;
    if (i === z.boden) teile.push(rechteck(x, y, k, k, true));
    else if ((f && f[i] === 0) || gruppen.includes(i))
      teile.push(
        `<rect x="${x}" y="${y}" width="${k}" height="${k}" fill="currentColor" fill-opacity="0.14" stroke-width="3"/>`,
      );
    else teile.push(rechteck(x, y, k, k));
    teile.push(text(x + k / 2, y + k / 2 + 6, z.buchstaben[i] ?? '', 17));
  });
  let gesamt = NETZ_GROESSE + 10;
  if (z.schraegbild) {
    gesamt = 340;
    const a = 64;
    const d = 24;
    const x0 = 232;
    const y0 = 160;
    teile.push(
      // vorn
      vieleck([
        [x0, y0],
        [x0 + a, y0],
        [x0 + a, y0 - a],
        [x0, y0 - a],
      ]),
      // oben
      vieleck(
        [
          [x0, y0 - a],
          [x0 + a, y0 - a],
          [x0 + a + d, y0 - a - d],
          [x0 + d, y0 - a - d],
        ],
        true,
      ),
      // rechts
      vieleck([
        [x0 + a, y0],
        [x0 + a + d, y0 - d],
        [x0 + a + d, y0 - a - d],
        [x0 + a, y0 - a],
      ]),
      gestrichelt(x0, y0, x0 + d, y0 - d),
      gestrichelt(x0 + d, y0 - d, x0 + a + d, y0 - d),
      gestrichelt(x0 + d, y0 - d, x0 + d, y0 - a - d),
    );
    if (f && z.istNetz) {
      const name = (seite: number) => z.buchstaben[f.indexOf(seite)] ?? '';
      teile.push(
        text(x0 + a - 16, y0 - 8, name(3), 17),
        text(x0 + a / 2 + d / 2, y0 - a - d / 2 + 5, name(0), 15),
        text(x0 + a + d / 2, y0 - a / 2 - d / 2 + 5, name(4), 15),
      );
    }
    teile.push(linie(205, 40, 205, 170, 0.5));
  }
  return bild(gesamt, NETZ_GROESSE + 10, teile, { de: beschreibung(z) });
}
