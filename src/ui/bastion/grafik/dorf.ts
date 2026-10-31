// Bilder für das Thema Dorf (BASEBAU B-17, GRAFIK §6).
// Die Formen stammen aus Dorfkrieg (dasselbe Urheber, Platzhalter aus dem Code:
// Wiese aus Rauten, Häuser mit zwei Wandtönen und Dach, Zaun, Bäume).
// Sie liegen mit im Programm. Zur Laufzeit gibt es keine Verbindung zu
// dorfkrieg.micana.de. Das Raster bleibt das der Bastion (`iso.ts`): Antippen,
// Zoom und die Daten ändern sich nicht. Kampffiguren gibt es hier nicht –
// die zeigt Dorfkrieg nur im Kampf, und Bastion hat keine Truppen.
import { KATALOG, type GebaeudeTyp, type Position } from '../../../core/bastion/katalog';
import { bauplatzAktiv, RAUTE_B, punkt } from './iso';

/** Dorfkrieg rechnet mit Rauten 64×32, die Bühne mit 48×24. Gleiches Verhältnis. */
const S = RAUTE_B / 64;

/** Zeichenfläche ohne PixiJS, damit diese Datei nachgeladen mit der Bühne bleibt,
 * PixiJS aber nur `grafik-buehne.ts` importiert. */
export interface Stift {
  flaeche(punkte: readonly number[], farbe: string, alpha?: number): void;
  kontur(punkte: readonly number[], farbe: string, breite: number, alpha?: number): void;
  rechteck(x: number, y: number, b: number, h: number, farbe: string): void;
  ellipse(x: number, y: number, rx: number, ry: number, farbe: string, alpha?: number): void;
  kreis(x: number, y: number, r: number, farbe: string): void;
  linie(x1: number, y1: number, x2: number, y2: number, farbe: string, breite: number): void;
}

export interface DorfBau {
  readonly typ: GebaeudeTyp;
  readonly stufe: number;
  readonly pos: Position;
  /** Selbst gewählte Farbe der Zierde; ohne Angabe die Farbe aus dem Bild */
  readonly akzent?: string;
  readonly auswahl: boolean;
}

/** Welche Rolle welches Dorfbild bekommt. Jede Rolle hat eines. */
export const DORF_BILD = {
  kern: 'gemeindehaus',
  werkstatt: 'schreinerei',
  wissen: 'buecherei',
  turm: 'windmuehle',
  eingang: 'bruecke',
  einfassung: 'zaun',
  ursprung: 'brunnen',
  zeichen: 'wappen',
  flaeche: 'obstwiese',
  denkmal: 'denkmal',
} as const satisfies Record<GebaeudeTyp, string>;

/** Feste Bäume um die Wiese, keine Zufallsposition (GRAFIK §5). */
const BAEUME: readonly { x: number; y: number; s: number }[] = [
  { x: -0.55, y: 1.4, s: 0.95 },
  { x: -0.35, y: 5.6, s: 1.1 },
  { x: -0.6, y: 9.8, s: 0.85 },
  { x: 2.1, y: -0.55, s: 1 },
  { x: 6.8, y: -0.7, s: 1.15 },
  { x: 10.6, y: -0.35, s: 0.9 },
  { x: 12.25, y: 2.2, s: 1 },
  { x: 12.45, y: 6.7, s: 0.95 },
  { x: 12.15, y: 10.4, s: 1.05 },
  { x: 1.4, y: 12.35, s: 0.9 },
  { x: 6.2, y: 12.5, s: 1.1 },
  { x: 10.2, y: 12.25, s: 0.85 },
];

/** Wie in Dorfkrieg: gleiche Koordinaten, immer dieselbe Zahl zwischen 0 und 1. */
export function hash01(x: number, y: number): number {
  let n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

/** Wandfarbe aufhellen oder abdunkeln, wie in Dorfkrieg (`shade`). */
export function schattieren(hex: string, menge: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const kanal = (wert: number) => Math.max(0, Math.min(255, wert + menge));
  const r = kanal((n >> 16) & 255);
  const g = kanal((n >> 8) & 255);
  const b = kanal(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/** Farbe einer Wiesenraute. Außen herum dunkler, damit das Dorf einen Rand hat. */
export function wiesenFarbe(abend: boolean, x: number, y: number, aussen: boolean): string {
  if (aussen) return abend ? '#121c16' : '#1c3124';
  const hell = hash01(x, y) > 0.9;
  const schach = (x + y) % 2 === 0;
  if (abend) {
    if (hell) return '#2c4634';
    return schach ? '#243c2c' : '#1d3326';
  }
  if (hell) return '#86b85c';
  return schach ? '#67a24a' : '#5b9342';
}

/**
 * Welche Atlas-Boden-Kachel für Feld (x,y) – fest aus Position, kein Zufall.
 * Spec: `flaeche` / `rand`; Varianten `flaeche_b` / `flaeche_hell` für Schachbrett/Tupfen.
 */
export function dorfBodenKachel(
  x: number,
  y: number,
  breite: number,
  tiefe: number,
): 'flaeche' | 'rand' | 'flaeche_b' | 'flaeche_hell' {
  const aussen = x < 0 || y < 0 || x >= breite || y >= tiefe;
  if (aussen) return 'rand';
  if (hash01(x, y) > 0.9) return 'flaeche_hell';
  return (x + y) % 2 === 0 ? 'flaeche' : 'flaeche_b';
}

/** Abend-Abdunkeln der Atlas-Wiese (Tint als 0xRRGGBB), sonst weiß = unverändert. */
export function dorfBodenTint(abend: boolean): number {
  return abend ? 0x6a7a68 : 0xffffff;
}

/** Höhe des Bildes in Bildpunkten, fürs Antippen (Dach und Zeichen zählen mit). */
export function dorfHoehe(typ: GebaeudeTyp, stufe: number): number {
  const grund: Record<GebaeudeTyp, number> = {
    kern: 58,
    werkstatt: 40,
    wissen: 38,
    turm: 70,
    eingang: 20,
    einfassung: 24,
    ursprung: 30,
    zeichen: 42,
    flaeche: 36,
    denkmal: 44,
  };
  const wuchs = typ === 'kern' || typ === 'turm' ? (stufe - 1) * 8 : 0;
  return grund[typ] + wuchs;
}

const flach = (p: readonly { x: number; y: number }[]) => p.flatMap((q) => [q.x, q.y]);
const hoch = (p: { x: number; y: number }, h: number) => ({ x: p.x, y: p.y - h });

/** Die Wiese: eine Raute je Feld, drum herum ein dunkler Rand. Am Abend dunkler. */
export function dorfWiese(st: Stift, abend: boolean): void {
  const { breite, tiefe } = bauplatzAktiv();
  for (let y = -1; y <= tiefe; y++) {
    for (let x = -1; x <= breite; x++) {
      const aussen = x < 0 || y < 0 || x >= breite || y >= tiefe;
      const n = punkt(x, y);
      const o = punkt(x + 1, y);
      const s = punkt(x + 1, y + 1);
      const w = punkt(x, y + 1);
      const ecken = flach([n, o, s, w]);
      st.flaeche(ecken, wiesenFarbe(abend, x, y, aussen));
      st.kontur(ecken, 'rgba(20, 36, 18, 0.16)', 1);
      if (!aussen && hash01(x + 3, y + 9) > 0.94) {
        const p = punkt(x + 0.7, y + 0.35);
        st.rechteck(p.x, p.y, 2, 2, 'rgba(255,255,255,0.35)');
        st.rechteck(p.x + 4, p.y + 2, 2, 2, 'rgba(255,255,255,0.35)');
      }
    }
  }
}

/** Ein Baum am Feld (Code-Fallback / Dekoration neben Atlas-Sprites). */
export function dorfBaum(st: Stift, x: number, y: number, scale: number): void {
  baum(st, x, y, scale);
}

/** Feste Baumpositionen (Tiefe = x+y für Sortierung). */
export function dorfBaumLagen(): readonly { x: number; y: number; s: number; tiefe: number }[] {
  return BAEUME.map((b) => ({ ...b, tiefe: b.x + b.y }));
}

/** Ein Gebäude (Code-Fallback, wenn kein Atlas-Eintrag). */
export function dorfGebaeude(st: Stift, bau: DorfBau, abend: boolean, licht: string): void {
  gebaeude(st, bau, abend, licht);
}

/** Bäume und Häuser von hinten nach vorn, damit Vorderes Hinteres verdeckt. */
export function dorfSzene(
  st: Stift,
  bauten: readonly DorfBau[],
  abend: boolean,
  licht: string,
  auswahlRahmen: (pos: Position, typ: GebaeudeTyp) => void,
): void {
  const teile: { tiefe: number; mal: () => void }[] = BAEUME.map((b) => ({
    tiefe: b.x + b.y,
    mal: () => baum(st, b.x, b.y, b.s),
  }));
  for (const bau of bauten) {
    const [w, t] = KATALOG[bau.typ].groesse;
    teile.push({
      tiefe: bau.pos.x + bau.pos.y + (w + t) / 2,
      mal: () => {
        gebaeude(st, bau, abend, licht);
        if (bau.auswahl) auswahlRahmen(bau.pos, bau.typ);
      },
    });
  }
  teile.sort((a, b) => a.tiefe - b.tiefe);
  for (const teil of teile) teil.mal();
}

function baum(st: Stift, x: number, y: number, scale: number): void {
  const p = punkt(x, y);
  const k = scale * S;
  st.ellipse(p.x, p.y + 2 * k, 10 * k, 4 * k, '#000000', 0.18);
  st.rechteck(p.x - 2 * k, p.y - 12 * k, 4 * k, 14 * k, '#6d4a2e');
  st.kreis(p.x, p.y - 16 * k, 11 * k, '#2d6a3c');
  st.kreis(p.x - 5 * k, p.y - 18 * k, 7 * k, '#3f874c');
}

/** Quader wie in Dorfkrieg: zwei Wandtöne, Dach oben. */
function kasten(
  st: Stift,
  x: number,
  y: number,
  w: number,
  t: number,
  h: number,
  wand: string,
  dach: string,
): void {
  const n = punkt(x, y);
  const o = punkt(x + w, y);
  const s = punkt(x + w, y + t);
  const we = punkt(x, y + t);
  const oben = {
    n: hoch(n, h),
    o: hoch(o, h),
    s: hoch(s, h),
    w: hoch(we, h),
  };
  st.flaeche(flach([we, s, oben.s, oben.w]), schattieren(wand, -32));
  st.flaeche(flach([s, o, oben.o, oben.s]), schattieren(wand, -12));
  const dachPunkte = flach([oben.n, oben.o, oben.s, oben.w]);
  st.flaeche(dachPunkte, dach);
  st.kontur(dachPunkte, 'rgba(0,0,0,0.25)', 1);
}

/** Drei Holzpfähle, wie die Palisade in Dorfkrieg. */
function zaun(st: Stift, x: number, y: number): void {
  const basis = punkt(x + 0.5, y + 0.5);
  for (const ox of [-8, 0, 8]) {
    const dx = ox * S;
    st.rechteck(basis.x + dx - 3 * S, basis.y - 16 * S, 6 * S, 16 * S, '#7b5a3c');
    st.flaeche(
      [
        basis.x + dx - 5 * S,
        basis.y - 16 * S,
        basis.x + dx,
        basis.y - 23 * S,
        basis.x + dx + 5 * S,
        basis.y - 16 * S,
      ],
      '#a67c52',
    );
  }
}

function fahne(st: Stift, cx: number, cy: number, farbe: string): void {
  st.linie(cx, cy + 8 * S, cx, cy - 16 * S, '#f4efe4', 2);
  st.flaeche([cx, cy - 16 * S, cx + 14 * S, cy - 11 * S, cx, cy - 6 * S], farbe);
}

function saege(st: Stift, cx: number, cy: number): void {
  st.linie(cx - 10 * S, cy + 6 * S, cx + 8 * S, cy - 8 * S, '#f4efe4', 2);
  st.flaeche([cx + 2 * S, cy - 12 * S, cx + 12 * S, cy - 6 * S, cx + 4 * S, cy - 1 * S], '#e7d3a1');
}

function buch(st: Stift, cx: number, cy: number): void {
  st.rechteck(cx - 9 * S, cy - 6 * S, 8 * S, 11 * S, '#f4efe4');
  st.rechteck(cx, cy - 6 * S, 8 * S, 11 * S, '#d7e4ea');
  st.linie(cx, cy - 6 * S, cx, cy + 5 * S, '#6d5438', 1.5);
}

function fluegel(st: Stift, cx: number, cy: number): void {
  const arm = 16 * S;
  st.linie(cx - arm, cy - arm * 0.2, cx + arm, cy + arm * 0.2, '#f4efe4', 3);
  st.linie(cx - arm * 0.2, cy + arm, cx + arm * 0.2, cy - arm, '#f4efe4', 3);
  st.kreis(cx, cy, 3.5 * S, '#8d3a34');
}

function gelaender(st: Stift, pos: Position, h: number): void {
  const links = hoch(punkt(pos.x + 0.15, pos.y + 0.85), h + 4);
  const rechts = hoch(punkt(pos.x + 0.85, pos.y + 0.15), h + 4);
  const vorne = hoch(punkt(pos.x + 0.85, pos.y + 0.85), h + 4);
  st.linie(links.x, links.y, vorne.x, vorne.y, '#f4efe4', 2);
  st.linie(vorne.x, vorne.y, rechts.x, rechts.y, '#f4efe4', 2);
}

function fenster(
  st: Stift,
  x: number,
  y: number,
  w: number,
  t: number,
  h: number,
  farbe: string,
): void {
  const paare = [
    [punkt(x, y + t), punkt(x + w, y + t)],
    [punkt(x + w, y + t), punkt(x + w, y)],
  ] as const;
  for (const [a, b] of paare) {
    const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - h * 0.45 };
    st.rechteck(m.x - 3, m.y - 4, 6, 8, farbe);
  }
}

function brunnen(st: Stift, pos: Position, wasser: string): void {
  const c = punkt(pos.x + 0.5, pos.y + 0.5);
  st.ellipse(c.x, c.y + 2 * S, 12 * S, 6 * S, '#6d5848');
  st.ellipse(c.x, c.y, 8 * S, 4 * S, wasser);
  // Dezente Spiegelung im Wasser (P86) – hellerer Rand, kein Glanzspiel
  st.ellipse(c.x, c.y - 0.6 * S, 5.5 * S, 1.6 * S, '#ffffff', 0.18);
  st.ellipse(c.x + 1.2 * S, c.y + 0.8 * S, 3.2 * S, 1.1 * S, '#1a3040', 0.12);
  st.linie(c.x - 10 * S, c.y, c.x - 10 * S, c.y - 16 * S, '#6d4a2e', 2);
  st.linie(c.x + 10 * S, c.y, c.x + 10 * S, c.y - 16 * S, '#6d4a2e', 2);
  st.linie(c.x - 12 * S, c.y - 16 * S, c.x + 12 * S, c.y - 16 * S, '#6d4a2e', 3);
}

function wappen(st: Stift, pos: Position, farbe: string): void {
  const c = punkt(pos.x + 0.5, pos.y + 0.5);
  st.linie(c.x, c.y + 2, c.x, c.y - 28 * S, '#6d4a2e', 2.5);
  fahne(st, c.x, c.y - 12 * S, farbe);
}

function obstwiese(st: Stift, pos: Position, w: number, t: number, frucht: string): void {
  const n = punkt(pos.x, pos.y);
  const o = punkt(pos.x + w, pos.y);
  const s = punkt(pos.x + w, pos.y + t);
  const we = punkt(pos.x, pos.y + t);
  st.flaeche(flach([n, o, s, we]), '#86b85c');
  for (const [ox, oy] of [
    [0.45, 0.5],
    [1.25, 0.55],
    [0.6, 1.35],
    [1.45, 1.3],
  ] as const)
    baum(st, pos.x + ox, pos.y + oy, 0.55);
  for (const [ox, oy] of [
    [0.7, 0.85],
    [1.15, 1.15],
  ] as const) {
    const p = punkt(pos.x + ox, pos.y + oy);
    st.kreis(p.x, p.y - 8 * S, 2.2 * S, frucht);
  }
}

function denkmal(st: Stift, pos: Position, farbe: string): void {
  kasten(st, pos.x + 0.2, pos.y + 0.2, 0.6, 0.6, 8, '#8a7e72', '#8a7e72');
  const c = punkt(pos.x + 0.5, pos.y + 0.5);
  st.rechteck(c.x - 3 * S, c.y - 22 * S, 6 * S, 14 * S, farbe);
  st.kreis(c.x, c.y - 26 * S, 5 * S, farbe);
}

function stufePunkte(st: Stift, pos: Position, w: number, t: number, stufe: number): void {
  if (stufe <= 1) return;
  const v = punkt(pos.x + w, pos.y + t);
  for (let i = 0; i < stufe; i++) st.kreis(v.x - 4 - i * 7, v.y - 8, 2.5, '#f0c14a');
}

const KASTEN: Partial<Record<GebaeudeTyp, { wand: string; dach: string; hoehe: number }>> = {
  // Gemeindehaus: Rathaus aus Dorfkrieg (beiger Putz, rotes Dach, Fahne)
  kern: { wand: '#c4b29a', dach: '#8d3a34', hoehe: 42 },
  werkstatt: { wand: '#7b5a3c', dach: '#a67c52', hoehe: 30 },
  wissen: { wand: '#efe6d4', dach: '#3d5c8a', hoehe: 26 },
  // Windmühle: hoch wie der Wachturm, mit Flügeln statt Zinnen
  turm: { wand: '#e4d2a8', dach: '#8d3a34', hoehe: 46 },
  eingang: { wand: '#7b5a3c', dach: '#a67c52', hoehe: 10 },
};

function gebaeude(st: Stift, bau: DorfBau, abend: boolean, licht: string): void {
  const { typ, stufe, pos } = bau;
  const [w, t] = KATALOG[typ].groesse;
  switch (typ) {
    case 'einfassung':
      zaun(st, pos.x, pos.y);
      break;
    case 'flaeche':
      obstwiese(st, pos, w, t, bau.akzent ?? '#c0392b');
      break;
    case 'ursprung':
      brunnen(st, pos, bau.akzent ?? '#6db7d8');
      break;
    case 'zeichen':
      wappen(st, pos, bau.akzent ?? '#d36b32');
      break;
    case 'denkmal':
      denkmal(st, pos, bau.akzent ?? '#c4b29a');
      break;
    case 'kern':
    case 'werkstatt':
    case 'wissen':
    case 'turm':
    case 'eingang': {
      const spec = KASTEN[typ];
      if (!spec) break;
      const h = spec.hoehe + (typ === 'kern' || typ === 'turm' ? (stufe - 1) * 8 : 0);
      kasten(st, pos.x, pos.y, w, t, h, spec.wand, spec.dach);
      const c = punkt(pos.x + w / 2, pos.y + t / 2);
      c.y -= h;
      if (typ === 'kern') fahne(st, c.x, c.y, '#3dbea5');
      else if (typ === 'werkstatt') saege(st, c.x, c.y);
      else if (typ === 'wissen') buch(st, c.x, c.y);
      else if (typ === 'turm') fluegel(st, c.x, c.y - 4);
      else gelaender(st, pos, h);
      if (typ !== 'eingang') fenster(st, pos.x, pos.y, w, t, h, abend ? licht : '#3a2a16');
      break;
    }
  }
  stufePunkte(st, pos, w, t, stufe);
}
