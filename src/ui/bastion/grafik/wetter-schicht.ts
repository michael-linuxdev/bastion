/**
 * Wetterschicht über dem ganzen Bild (Wunsch PV 03.11.2026: „Wetter großflächiger“).
 * Bisher regnete und schneite es nur über der Insel; die Kulisse blieb trocken.
 * Hier entstehen feste Kacheln (kleine SVG-Bilder im Code, kein Netz) mit Tropfen
 * oder Flocken an festen Stellen. Mehrere Ebenen ziehen verschieden schnell,
 * das gibt Tiefe. Rein und deterministisch: gleiche Eingabe, gleiches Bild.
 */
import type { WetterBild, WetterStaerke } from './wetter';

export interface SchichtEbene {
  /** Kachel als data:-Adresse (SVG im Code) */
  readonly kachel: string;
  /** Kantenlänge der quadratischen Kachel in Bildpunkten */
  readonly groesse: number;
  /** Weg je Durchlauf in Bildpunkten – ganze Kacheln, damit die Schleife nahtlos ist */
  readonly weg: { readonly x: number; readonly y: number };
  /** Dauer eines Durchlaufs in Sekunden */
  readonly dauer: number;
  readonly deckkraft: number;
}

export interface Wetterschicht {
  readonly ebenen: readonly SchichtEbene[];
  /** Grauschleier über allem (0 = keiner) */
  readonly schleier: number;
  /** Nebelbänke über dem ganzen Bild */
  readonly nebel: number;
  /** Ziehende Wolkenschatten über Insel und Kulisse */
  readonly wolkenschatten: number;
}

const LEER: Wetterschicht = { ebenen: [], schleier: 0, nebel: 0, wolkenschatten: 0 };

/** Feste Mischzahl 0 … 1 aus zwei ganzen Zahlen (kein Zufall zur Laufzeit) */
function misch(i: number, k: number): number {
  const h = (Math.imul(i + 1, 2654435761) ^ Math.imul(k + 7, 2246822519)) >>> 0;
  return ((h >>> 8) % 10000) / 10000;
}

const svg = (groesse: number, inhalt: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${groesse}' height='${groesse}'>${inhalt}</svg>`,
  )}")`;

/** Regenstriche: `n` Striche, Länge `lang`, Neigung `neigung` (x je y) */
export function regenKachel(
  groesse: number,
  n: number,
  lang: number,
  neigung: number,
  ebene: number,
): string {
  let striche = '';
  for (let i = 0; i < n; i++) {
    const x = misch(i, ebene) * groesse;
    const y = misch(i, ebene + 31) * groesse;
    // Striche, die über den Rand reichen, zweimal zeichnen – sonst Lücken an der Naht
    for (const dy of [0, -groesse])
      for (const dx of [0, groesse, -groesse]) {
        const x1 = x + dx;
        const y1 = y + dy;
        striche += `<line x1='${x1.toFixed(1)}' y1='${y1.toFixed(1)}' x2='${(x1 - neigung * lang).toFixed(1)}' y2='${(y1 + lang).toFixed(1)}'/>`;
      }
  }
  return svg(
    groesse,
    `<g stroke='rgb(214,228,240)' stroke-width='1.1' stroke-linecap='round'>${striche}</g>`,
  );
}

/** Schneeflocken: `n` weiche Punkte mit Radius bis `r` */
export function schneeKachel(groesse: number, n: number, r: number, ebene: number): string {
  let punkte = '';
  for (let i = 0; i < n; i++) {
    const x = misch(i, ebene) * groesse;
    const y = misch(i, ebene + 17) * groesse;
    const ri = r * (0.6 + 0.4 * misch(i, ebene + 5));
    for (const dy of [0, -groesse, groesse])
      for (const dx of [0, groesse, -groesse])
        if (x + dx > -r && x + dx < groesse + r && y + dy > -r && y + dy < groesse + r)
          punkte += `<circle cx='${(x + dx).toFixed(1)}' cy='${(y + dy).toFixed(1)}' r='${ri.toFixed(1)}'/>`;
  }
  return svg(groesse, `<g fill='rgb(250,252,255)'>${punkte}</g>`);
}

const DICHTE: Record<WetterStaerke, number> = { leicht: 0.45, mittel: 1, stark: 1.8 };

/**
 * Was über dem ganzen Bild liegt. `land`: Bastion, Dorf, Garten – unter Wasser und
 * im Weltraum regnet es nicht. `leicht`: Bewegung „leicht“ (weniger Ebenen).
 */
export function wetterschicht(
  bild: WetterBild,
  staerke: WetterStaerke,
  land: boolean,
  leicht = false,
): Wetterschicht {
  if (!land) return LEER;
  const d = DICHTE[staerke];
  const ebenen = (liste: SchichtEbene[]) => (leicht ? liste.slice(0, 1) : liste);
  if (bild === 'regen' || bild === 'sturm') {
    const sturm = bild === 'sturm';
    // Neigung so, dass der Weg je Durchlauf ganze Kacheln bleibt (nahtlos)
    const neigung = sturm ? 1 / 3 : 0;
    const g = 180;
    // Zurückhaltend (PV 03.11.2026: „Der Regen ist viel zu stark“): zwei Ebenen, wenige,
    // kurze, blasse Striche – Insel und Gebäude bleiben gut zu erkennen
    const liste: SchichtEbene[] = [0, 1].map((e) => {
      const lang = (sturm ? 20 : 12) + e * 5;
      // Schnelle Ebene vorn (länger, deutlicher), langsame hinten
      const wegY = g * (sturm ? 3 : 2);
      return {
        kachel: regenKachel(g, Math.round((sturm ? 8 : 5) * d * (1 + e * 0.3)), lang, neigung, e),
        groesse: g,
        weg: { x: -Math.round(neigung * wegY), y: wegY },
        dauer: (sturm ? 0.5 : 0.8) / (1 + e * 0.35),
        deckkraft: Math.min(0.5, (0.16 + e * 0.08) * (staerke === 'leicht' ? 0.8 : 1)),
      };
    });
    return {
      ebenen: ebenen(liste),
      schleier: sturm ? 0.1 : staerke === 'stark' ? 0.07 : staerke === 'mittel' ? 0.03 : 0,
      nebel: staerke === 'stark' && !sturm ? 1 : 0,
      wolkenschatten: sturm ? 4 : 2,
    };
  }
  if (bild === 'schnee') {
    const g = 200;
    const liste: SchichtEbene[] = [0, 1, 2].map((e) => ({
      kachel: schneeKachel(g, Math.round(7 * d * (1 + e * 0.4)), 1.5 + e * 1.0, e + 3),
      groesse: g,
      // Flocken treiben schräg: eine Kachel zur Seite, zwei nach unten
      weg: { x: (e % 2 === 0 ? 1 : -1) * g, y: g * 2 },
      dauer: (staerke === 'stark' ? 9 : 14) / (1 + e * 0.45),
      deckkraft: 0.55 + e * 0.1,
    }));
    return {
      ebenen: ebenen(liste),
      schleier: staerke === 'stark' ? 0.08 : 0.02,
      nebel: staerke === 'stark' ? 2 : 0,
      wolkenschatten: 0,
    };
  }
  if (bild === 'nebel') return { ebenen: [], schleier: 0.06, nebel: 4, wolkenschatten: 0 };
  if (bild === 'bewoelkt') return { ebenen: [], schleier: 0, nebel: 0, wolkenschatten: 3 };
  return LEER;
}
