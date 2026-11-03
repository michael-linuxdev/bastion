/**
 * Wege und Tagesablauf der Bewohner (Wunsch PV, 03.11.2026, Punkt 4): „morgens zur Arbeit
 * an ihr Gebäude, tagsüber tätig, abends nach Hause, nachts drinnen“ – nach der echten
 * Uhrzeit, fest, ohne Zufall.
 *
 * - Zuhause ist ein freies Feld vor dem Bergfried (Kern), die Arbeit das Feld neben dem
 *   eigenen Gebäude (wie bisher).
 * - Wege: kürzeste Wege über freie Felder vom Bergfried zu jedem Gebäude. Sie werden als
 *   ausgetretene Pfade gezeichnet; die Bewohner laufen darauf.
 * - Uhr: Aufbruch ab 7:00 (je Bewohner 4 Minuten später), Feierabend ab 18:00 (je 5 Minuten
 *   später). Tagsüber geht jeder alle 12 Minuten kurz zum Platz in der Mitte und zurück.
 *   Ein Schritt (ein Feld) dauert 1,6 Sekunden. Nach dem Heimweg ist der Bewohner drinnen.
 *
 * Rein: keine Browser-APIs, die Uhrzeit kommt als Sekunde des Tages herein.
 */
import { KATALOG, type Bauwerk, type Position } from '../../../core/bastion/katalog';
import type { BauplatzMass } from './iso';
import { feldFrei, feldSchluessel, pfadSuchen } from './pfad';

/** Sekunden je Feld beim Gehen */
export const SCHRITT = 1.6;
export const AUFBRUCH = 7 * 3600;
export const FEIERABEND = 18 * 3600;
/** Abstand der Besorgungen tagsüber und wie lange man am Platz bleibt */
export const BESORGUNG_TAKT = 12 * 60;
const BESORGUNG_BLEIBEN = 20;
const TAG = 24 * 3600;

export type Tagesphase = 'drinnen' | 'hinweg' | 'arbeit' | 'besorgung' | 'heimweg';

export interface BewohnerOrt {
  readonly phase: Tagesphase;
  /** Lage in Feldern (Feldmitte = ganze Zahl + 0,5) */
  readonly gx: number;
  readonly gy: number;
  /** Unterwegs (für den Lauf-Takt der Bilder) */
  readonly geht: boolean;
}

export interface BewohnerWege {
  readonly heim: Position;
  readonly arbeit: Position;
  /** Weg von zu Hause zur Arbeit (inklusive beider Enden) */
  readonly hin: readonly Position[];
  /** Weg von der Arbeit zum Platz (leer: keine Besorgungen) */
  readonly besorgung: readonly Position[];
}

/** Erstes freies Feld rund um ein Gebäude, in fester Reihenfolge (vorn zuerst). */
export function feldVor(
  b: Pick<Bauwerk, 'typ' | 'pos'>,
  belegt: ReadonlySet<string>,
  platz: BauplatzMass,
  versatz = 0,
): Position | undefined {
  const [w, t] = KATALOG[b.typ].groesse;
  const ring: Position[] = [];
  // vorn (zum Betrachter: größeres x und y), dann seitlich, dann hinten
  for (let dx = 0; dx < w; dx++) ring.push({ x: b.pos.x + dx, y: b.pos.y + t });
  for (let dy = 0; dy < t; dy++) ring.push({ x: b.pos.x + w, y: b.pos.y + dy });
  for (let dx = 0; dx < w; dx++) ring.push({ x: b.pos.x + dx, y: b.pos.y - 1 });
  for (let dy = 0; dy < t; dy++) ring.push({ x: b.pos.x - 1, y: b.pos.y + dy });
  const frei = ring.filter((p) => feldFrei(p.x, p.y, belegt, platz));
  if (frei.length === 0) return undefined;
  return frei[Math.abs(versatz) % frei.length];
}

/** Bergfried (Kern), sonst das erste Gebäude */
function mitte(bauwerke: readonly Bauwerk[]): Bauwerk | undefined {
  return bauwerke.find((b) => b.typ === 'kern') ?? bauwerke[0];
}

const RICHTUNGEN: readonly Position[] = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
];

/**
 * Kürzester Weg über freie Felder, der möglichst selten abbiegt (Schritt 1, Abbiegen 0,4):
 * ein gerader Pfad mit einem Knick statt einer Treppe. Leer, wenn nichts erreichbar ist.
 * Klein genug für ein einfaches Suchen ohne Vorrangschlange (Bauplatz bis 24 × 24).
 */
export function wegSuchen(
  von: Position,
  nach: Position,
  belegt: ReadonlySet<string>,
  platz: BauplatzMass,
): Position[] {
  if (!feldFrei(von.x, von.y, belegt, platz) || !feldFrei(nach.x, nach.y, belegt, platz))
    return pfadSuchen(von, nach, belegt, platz);
  if (von.x === nach.x && von.y === nach.y) return [von];
  // Zustand: Feld und Richtung, aus der man kam
  const schluessel = (x: number, y: number, r: number) => (y * platz.breite + x) * 5 + r;
  const kosten = new Map<number, number>();
  const vorher = new Map<number, number>();
  const offen: { x: number; y: number; r: number; k: number }[] = [
    { x: von.x, y: von.y, r: 4, k: 0 },
  ];
  kosten.set(schluessel(von.x, von.y, 4), 0);
  let ziel: number | undefined;
  while (offen.length > 0) {
    // günstigsten offenen Zustand nehmen (bei Gleichstand der zuerst eingetragene)
    let best = 0;
    for (let i = 1; i < offen.length; i++)
      if ((offen[i]?.k ?? Infinity) < (offen[best]?.k ?? Infinity)) best = i;
    const cur = offen.splice(best, 1)[0];
    if (!cur) break;
    const ck = schluessel(cur.x, cur.y, cur.r);
    if ((kosten.get(ck) ?? Infinity) < cur.k) continue;
    if (cur.x === nach.x && cur.y === nach.y) {
      ziel = ck;
      break;
    }
    RICHTUNGEN.forEach((d, r) => {
      const nx = cur.x + d.x;
      const ny = cur.y + d.y;
      if (!feldFrei(nx, ny, belegt, platz)) return;
      const nk = cur.k + 1 + (cur.r !== 4 && cur.r !== r ? 0.4 : 0);
      const key = schluessel(nx, ny, r);
      if (nk >= (kosten.get(key) ?? Infinity)) return;
      kosten.set(key, nk);
      vorher.set(key, ck);
      offen.push({ x: nx, y: ny, r, k: nk });
    });
  }
  if (ziel === undefined) return [];
  const weg: Position[] = [];
  for (let k: number | undefined = ziel; k !== undefined; k = vorher.get(k)) {
    const feld = Math.floor(k / 5);
    weg.push({ x: feld % platz.breite, y: Math.floor(feld / platz.breite) });
  }
  return weg.reverse();
}

/** Gebäude ohne eigenen Weg: Mauerstücke und Flächen (Beet, Platz) */
const OHNE_WEG: ReadonlySet<Bauwerk['typ']> = new Set(['einfassung', 'flaeche']);

/**
 * Ausgetretene Wege: vom Feld vor dem Bergfried zu einem freien Feld an jedem anderen
 * Gebäude, fest aus den Bauwerken. Jeder Weg ist eine Folge benachbarter Felder.
 */
export function wegeListe(
  bauwerke: readonly Bauwerk[],
  belegt: ReadonlySet<string>,
  platz: BauplatzMass,
): readonly (readonly Position[])[] {
  const kern = mitte(bauwerke);
  if (!kern) return [];
  const start = feldVor(kern, belegt, platz);
  if (!start) return [];
  const aus: Position[][] = [];
  for (const b of bauwerke) {
    if (b === kern || OHNE_WEG.has(b.typ)) continue;
    const ziel = feldVor(b, belegt, platz);
    if (!ziel) continue;
    const weg = wegSuchen(start, ziel, belegt, platz);
    if (weg.length > 1) aus.push(weg);
  }
  return aus;
}

/** Alle Wegfelder (Schlüssel „x,y“): dort wächst nichts */
export function wegeFelder(
  bauwerke: readonly Bauwerk[],
  belegt: ReadonlySet<string>,
  platz: BauplatzMass,
): ReadonlySet<string> {
  const aus = new Set<string>();
  for (const weg of wegeListe(bauwerke, belegt, platz))
    for (const p of weg) aus.add(feldSchluessel(p.x, p.y));
  return aus;
}

/** Wege eines Bewohners: zu Hause vor dem Bergfried, Arbeit am Ankerfeld, Platz in der Mitte. */
export function bewohnerWege(
  index: number,
  arbeit: Position,
  bauwerke: readonly Bauwerk[],
  belegt: ReadonlySet<string>,
  platz: BauplatzMass,
): BewohnerWege {
  const kern = mitte(bauwerke);
  const heim = (kern && feldVor(kern, belegt, platz, index)) ?? arbeit;
  const hin = wegSuchen(heim, arbeit, belegt, platz);
  // Platz: Zeichen/Brunnen, sonst die Mitte des Bauplatzes (nächstes freies Feld)
  const zeichen = bauwerke.find((b) => b.typ === 'zeichen');
  const platzFeld = zeichen
    ? feldVor(zeichen, belegt, platz, index + 1)
    : naechstesFreies(
        { x: Math.floor(platz.breite / 2), y: Math.floor(platz.tiefe / 2) },
        belegt,
        platz,
      );
  const besorgung =
    platzFeld && (platzFeld.x !== arbeit.x || platzFeld.y !== arbeit.y)
      ? wegSuchen(arbeit, platzFeld, belegt, platz)
      : [];
  return { heim, arbeit, hin: hin.length > 0 ? hin : [arbeit], besorgung };
}

function naechstesFreies(
  p: Position,
  belegt: ReadonlySet<string>,
  platz: BauplatzMass,
): Position | undefined {
  for (let r = 0; r < Math.max(platz.breite, platz.tiefe); r++)
    for (let dy = -r; dy <= r; dy++)
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        if (feldFrei(p.x + dx, p.y + dy, belegt, platz)) return { x: p.x + dx, y: p.y + dy };
      }
  return undefined;
}

/** Lage auf einem Weg nach `t` Sekunden Gehen (Feldmitte zu Feldmitte). */
function aufWeg(weg: readonly Position[], t: number): { gx: number; gy: number } {
  const erstes = weg[0] ?? { x: 0, y: 0 };
  if (weg.length < 2) return { gx: erstes.x + 0.5, gy: erstes.y + 0.5 };
  const s = Math.max(0, Math.min(weg.length - 1, t / SCHRITT));
  const i = Math.min(weg.length - 2, Math.floor(s));
  const a = weg[i] ?? erstes;
  const b = weg[i + 1] ?? a;
  const f = s - i;
  return { gx: a.x + (b.x - a.x) * f + 0.5, gy: a.y + (b.y - a.y) * f + 0.5 };
}

const dauer = (weg: readonly Position[]) => Math.max(0, weg.length - 1) * SCHRITT;
const rueck = (weg: readonly Position[]) => [...weg].reverse();

/**
 * Wo ist der Bewohner zur Sekunde `sek` des Tages (0 … 86 399, Ortszeit)?
 * Gleiche Uhrzeit, gleiche Wege → gleiche Lage.
 */
export function bewohnerOrt(sek: number, index: number, wege: BewohnerWege): BewohnerOrt {
  const s = ((sek % TAG) + TAG) % TAG;
  const los = AUFBRUCH + index * 240;
  const heimLos = FEIERABEND + index * 300;
  const hinDauer = dauer(wege.hin);
  const am = (p: Position, phase: Tagesphase): BewohnerOrt => ({
    phase,
    gx: p.x + 0.5,
    gy: p.y + 0.5,
    geht: false,
  });
  const geht = (weg: readonly Position[], t: number, phase: Tagesphase): BewohnerOrt => ({
    phase,
    ...aufWeg(weg, t),
    geht: true,
  });
  if (s < los) return am(wege.heim, 'drinnen');
  if (s < los + hinDauer) return geht(wege.hin, s - los, 'hinweg');
  if (s >= heimLos + hinDauer) return am(wege.heim, 'drinnen');
  if (s >= heimLos) return geht(rueck(wege.hin), s - heimLos, 'heimweg');
  // Tagsüber: alle 12 Minuten zum Platz und zurück (versetzt je Bewohner)
  if (wege.besorgung.length > 1) {
    const d = dauer(wege.besorgung);
    const takt = (s - los - hinDauer + index * 97) % BESORGUNG_TAKT;
    const start = BESORGUNG_TAKT - (2 * d + BESORGUNG_BLEIBEN);
    // Die letzte Besorgung muss vor dem Feierabend zurück sein
    const ende = s - takt + BESORGUNG_TAKT;
    if (takt >= start && ende <= heimLos) {
      const t = takt - start;
      if (t < d) return geht(wege.besorgung, t, 'besorgung');
      const ziel = wege.besorgung[wege.besorgung.length - 1] ?? wege.arbeit;
      if (t < d + BESORGUNG_BLEIBEN) return am(ziel, 'besorgung');
      return geht(rueck(wege.besorgung), t - d - BESORGUNG_BLEIBEN, 'besorgung');
    }
  }
  return am(wege.arbeit, 'arbeit');
}

/** Sekunde des Tages aus Stunden, Minuten, Sekunden (Ortszeit) */
export function sekundeDesTages(stunde: number, minute: number, sekunde: number): number {
  return stunde * 3600 + minute * 60 + sekunde;
}
