/**
 * Pfadfindung auf dem Bauplatz-Raster: Wesen laufen um Gebäude herum
 * (Preferences Bastion-Interaktion). Deterministisch, ohne Zufall.
 * Bau-Geister (Vorhaben) zählen wie fertige Bauten (Q90).
 */
import type { Vorhaben } from '../../../core/bastion/bauen';
import { KATALOG, type Bauwerk, type Position } from '../../../core/bastion/katalog';
import { bauplatzAktiv, feldUnter, punkt, type BauplatzMass } from './iso';

export function feldSchluessel(x: number, y: number): string {
  return `${x},${y}`;
}

type Belegung = {
  readonly typ: Bauwerk['typ'] | Vorhaben['typ'];
  readonly pos: Position;
};

/** Alle belegten Felder der Bauwerke und optionaler Vorhaben (Grundfläche). */
export function belegteFelder(
  bauwerke: readonly Bauwerk[],
  vorhaben: readonly Vorhaben[] = [],
): ReadonlySet<string> {
  const aus = new Set<string>();
  const eintraege: readonly Belegung[] = [...bauwerke, ...vorhaben];
  for (const b of eintraege) {
    const [w, t] = KATALOG[b.typ].groesse;
    for (let dx = 0; dx < w; dx++) {
      for (let dy = 0; dy < t; dy++) {
        aus.add(feldSchluessel(b.pos.x + dx, b.pos.y + dy));
      }
    }
  }
  return aus;
}

export function feldFrei(
  x: number,
  y: number,
  belegt: ReadonlySet<string>,
  platz: BauplatzMass,
): boolean {
  return (
    x >= 0 && y >= 0 && x < platz.breite && y < platz.tiefe && !belegt.has(feldSchluessel(x, y))
  );
}

/** Nächstes freies Feld aus einer festen Suche – gleicher Index → gleiches Feld. */
export function freiesFeld(
  index: number,
  belegt: ReadonlySet<string>,
  platz: BauplatzMass,
): Position {
  const kandidaten: Position[] = [];
  for (let y = 0; y < platz.tiefe; y++) {
    for (let x = 0; x < platz.breite; x++) {
      if (feldFrei(x, y, belegt, platz)) kandidaten.push({ x, y });
    }
  }
  if (kandidaten.length === 0) return { x: 0, y: 0 };
  return kandidaten[Math.abs(index) % kandidaten.length] ?? { x: 0, y: 0 };
}

const NACHBARN: readonly Position[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

/** Wenn Start auf einem Gebäude liegt: nächstes freies Nachbarfeld. */
function startFrei(von: Position, belegt: ReadonlySet<string>, platz: BauplatzMass): Position {
  if (feldFrei(von.x, von.y, belegt, platz)) return von;
  for (const n of NACHBARN) {
    const p = { x: von.x + n.x, y: von.y + n.y };
    if (feldFrei(p.x, p.y, belegt, platz)) return p;
  }
  return freiesFeld(von.x + von.y * platz.breite, belegt, platz);
}

/**
 * Kürzester Weg von `von` nach `nach` auf freien Feldern (Breitensuche).
 * Leer, wenn keines erreichbar ist.
 */
export function pfadSuchen(
  von: Position,
  nach: Position,
  belegt: ReadonlySet<string>,
  platz: BauplatzMass,
): Position[] {
  const start = startFrei(von, belegt, platz);
  if (!feldFrei(nach.x, nach.y, belegt, platz)) return [];
  if (start.x === nach.x && start.y === nach.y) return [start];

  const queue: Position[] = [start];
  const vorher = new Map<string, string | undefined>();
  vorher.set(feldSchluessel(start.x, start.y), undefined);

  while (queue.length > 0) {
    const cur = queue.shift();
    if (!cur) break;
    if (cur.x === nach.x && cur.y === nach.y) {
      const weg: Position[] = [];
      let k: string | undefined = feldSchluessel(cur.x, cur.y);
      while (k !== undefined) {
        const [xs, ys] = k.split(',');
        weg.push({ x: Number(xs), y: Number(ys) });
        k = vorher.get(k);
      }
      weg.reverse();
      return weg;
    }
    for (const n of NACHBARN) {
      const nx = cur.x + n.x;
      const ny = cur.y + n.y;
      if (!feldFrei(nx, ny, belegt, platz)) continue;
      const key = feldSchluessel(nx, ny);
      if (vorher.has(key)) continue;
      vorher.set(key, feldSchluessel(cur.x, cur.y));
      queue.push({ x: nx, y: ny });
    }
  }
  return [];
}

/** Feldmitte als Bildpunkt. */
export function feldMittePunkt(pos: Position): { x: number; y: number } {
  return punkt(pos.x + 0.5, pos.y + 0.5);
}

/** Bildpunkt → Rasterfeld (aktiver Bauplatz), sonst {0,0}. */
export function bildZuFeld(bildX: number, bildY: number): Position {
  return feldUnter(bildX, bildY) ?? { x: 0, y: 0 };
}

/** Aktiven Bauplatz für Aufrufer ohne Import von iso. */
export function aktiverPlatz(): BauplatzMass {
  return bauplatzAktiv();
}
