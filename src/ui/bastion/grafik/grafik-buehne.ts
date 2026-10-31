// Bauplatz als Grafik (ARCHITEKTUR T-6, BASEBAU B-11/B-12, GRAFIK §1):
// PixiJS, nachgeladen nur bei geöffneter Bastion. Richtung A „Tag, warm“: die Insel
// schräg von oben (isometrisch), flache Farbflächen mit zwei Seitentönen je Gebäude,
// Himmel mit Sonne und Wolken; dunkel als Abend mit erleuchteten Fenstern.
// Je Rolle eine Form aus dem Code, Farbe je Gebäudefamilie – austauschbar je Thema
// und Skin (B-17, B-18, B-27). Das Thema Dorf zeichnet stattdessen die Dorfbilder
// (`dorf.ts`). Diese Datei ist der einzige Ort, der PixiJS importiert; die
// Listenansicht bleibt gleichwertig.
import { Application, Assets, Container, Graphics, Sprite, Texture } from 'pixi.js';
import type { Bastion } from '../../../core/bastion/bauen';
import type { HinterhofFeld } from '../../../core/learning/hinterhof';
import type { Thema } from '../../../core/policy/einstellung';
import { FARBWERT } from '../farben';
import {
  KATALOG,
  type Familie,
  type GebaeudeTyp,
  type Position,
} from '../../../core/bastion/katalog';
import {
  aufstellDauerMs,
  aufstellFortschritt,
  tickerAn,
  wolkenVersatz,
  type Bewegung,
} from './atmosphaere';
import {
  atlasBasisUrl,
  atlasBodenId,
  atlasEintrag,
  atlasEintragPerId,
  atlasLaden,
  atlasWesenId,
  type AtlasManifest,
  type BodenKachel,
} from './atlas';
import {
  dorfBaum,
  dorfBaumLagen,
  dorfBodenKachel,
  dorfBodenTint,
  dorfGebaeude,
  dorfHoehe,
  dorfSzene,
  dorfWiese,
  type Stift,
} from './dorf';
import { gartenBoden, gartenHoehe, gartenSzene } from './garten';
import { uwBoden, uwHoehe, uwSzene } from './unterwasser';
import { weltraumBoden, weltraumHoehe, weltraumSzene } from './weltraum';
import type { Epoche } from '../../../core/bastion/epochen';
import { epocheOptik, farbeSkalieren } from './epoche-optik';
import {
  bauplatzAktiv,
  bauplatzAktivSetzen,
  buehneBreite,
  buehneHoehe,
  INSEL,
  feldUnter,
  punkt,
  RAUTE_B,
  RAUTE_H,
  type BauplatzMass,
} from './iso';
import type { Jahreszeit } from './jahreszeit';
import { partikelBudget, type WetterBild } from './wetter';
import { hinterhofZeichnen } from './hinterhof-szene';
import { wesenReagieren, wesenStarten, wesenTick, type WesenZustand } from './wesen';
import type { Bildart } from './bildart';
export type { Bildart } from './bildart';
export { bildartVonThema } from './bildart';

export interface Farben {
  readonly boden: string;
  readonly raster: string;
  readonly linie: string;
  readonly familie: Readonly<Record<Familie, string>>;
  readonly imBau: string;
  readonly auswahl: string;
  readonly himmel: string;
  /** Sonne bei Tag, Mond und Fenster am Abend */
  readonly licht: string;
  readonly wolke: string;
  /** Dächer */
  readonly dach: string;
  /** Abendstimmung: Fenster leuchten, Sterne statt Wolken */
  readonly abend: boolean;
  /** Jahreszeit für Auflagen (Schnee); ohne Angabe = Sommer */
  readonly jahreszeit?: Jahreszeit;
  /** Wetterbild für Himmel und Partikel (GRAFIK §4.3) */
  readonly wetter?: WetterBild;
  /** Bewährungsprobe aktiv: spannender Himmel, leichter Rauch (GRAFIK §8 / G11) */
  readonly spannung?: boolean;
}

export interface Ansicht {
  /** ausgewähltes Gebäude (Instanz-ID) */
  readonly auswahl?: string;
  /** Feld, auf das gerade versetzt werden soll – mit Umriss in der Größe des Gebäudes */
  readonly ziel?: { readonly pos: Position; readonly typ: GebaeudeTyp; readonly frei: boolean };
  /** Hinterhof-Felder hinter dem Bauplatz (B-25) */
  readonly hinterhof?: readonly HinterhofFeld[];
  /** Freigeschaltete Epoche für Optik (GRAFIK §8 / G10) */
  readonly epoche?: Epoche;
}

export interface Buehne {
  zeichne(b: Bastion, a: Ansicht): void;
  /** Bewegung umschalten, ohne die Bühne neu zu bauen (GRAFIK §4.5) */
  setzeBewegung(b: Bewegung): void;
  /** Feld unter einem Punkt in Bildschirmkoordinaten – oder undefined außerhalb */
  feldBei(clientX: number, clientY: number): Position | undefined;
  /** Wesen unter dem Punkt – für Tippen (GRAFIK §4.4) */
  wesenBei(clientX: number, clientY: number): string | undefined;
  /** Kurze Reaktion auf Tippen */
  tippeWesen(id: string): void;
  zerstoere(): void;
}

/** Frame aus Zustand (idle / walk / react) – deterministisch. */
function wesenFrame(
  w: WesenZustand,
  jetzt: number,
): { zyklus: 'idle' | 'walk' | 'react'; frame: number } {
  if (jetzt < w.reactBis) {
    const t = 400 - (w.reactBis - jetzt);
    return { zyklus: 'react', frame: t < 200 ? 0 : 1 };
  }
  const bewegt = Math.hypot(w.zx - w.x, w.zy - w.y) > 2;
  if (bewegt) return { zyklus: 'walk', frame: Math.floor(Math.abs(w.phase)) % 4 };
  return { zyklus: 'idle', frame: Math.floor(Math.abs(w.phase) / 2) % 3 };
}

/** Silhouette eines Wesens (Code-Fallback bis Sprite-Atlas). */
function zeichneWesen(g: Graphics, w: WesenZustand, jetzt: number) {
  const s = w.skala * (jetzt < w.reactBis ? 1.12 : 1);
  const x = w.x;
  const y = w.y;
  const r = w.richtung;
  g.ellipse(x, y, 5 * s, 3.5 * s).fill(w.farbe);
  g.circle(x + r * 5 * s, y - 3 * s, 2.4 * s).fill(w.farbe);
  if (w.art === 'huhn') {
    g.poly([x + r * 7 * s, y - 3 * s, x + r * 10 * s, y - 2 * s, x + r * 7 * s, y - 1 * s]).fill(
      '#e07a4f',
    );
  }
  if (w.art === 'katze') {
    g.poly([x + r * 3 * s, y - 5 * s, x + r * 5 * s, y - 8 * s, x + r * 6 * s, y - 4 * s]).fill(
      w.farbe,
    );
  }
  // Bein-Wippen
  const wip = Math.sin(w.phase) * 1.5 * s;
  g.moveTo(x - 2 * s, y + 2 * s)
    .lineTo(x - 2 * s, y + 5 * s + wip)
    .stroke({ width: 1.2, color: '#3a2a16', alpha: 0.7 });
  g.moveTo(x + 2 * s, y + 2 * s)
    .lineTo(x + 2 * s, y + 5 * s - wip)
    .stroke({ width: 1.2, color: '#3a2a16', alpha: 0.7 });
}

type Punkt = { x: number; y: number };

/** Farbe abdunkeln (Seitentöne): f = 1 bleibt, f = 0.7 ist 30 % dunkler. */
function dunkler(farbe: string, f: number): string {
  const n = parseInt(farbe.slice(1, 7), 16);
  const kanal = (s: number) =>
    Math.round(((n >> s) & 255) * f)
      .toString(16)
      .padStart(2, '0');
  return `#${kanal(16)}${kanal(8)}${kanal(0)}`;
}

const hoch = (p: Punkt, h: number): Punkt => ({ x: p.x, y: p.y - h });
const flach = (...p: Punkt[]) => p.flatMap((q) => [q.x, q.y]);

/** Höhe des Körpers je Rolle in Bildpunkten; Kern und Turm wachsen mit der Stufe. */
function hoehe(typ: GebaeudeTyp, stufe: number, epoche: Epoche = 1): number {
  const optik = epocheOptik(epoche);
  const grund: Record<GebaeudeTyp, number> = {
    kern: 54,
    turm: 46,
    werkstatt: 26,
    wissen: 28,
    eingang: 32,
    einfassung: 10 + optik.einfassungDicke * 2,
    ursprung: 8,
    zeichen: 6,
    flaeche: 3,
    denkmal: 14,
  };
  const plus = typ === 'einfassung' || typ === 'flaeche' ? 0 : optik.hoehePlus;
  return grund[typ] + plus + (typ === 'kern' || typ === 'turm' ? (stufe - 1) * 8 : 0);
}

/** Ecken eines Rechtecks auf dem Boden: hinten, rechts, vorne, links */
function ecken(gx: number, gy: number, w: number, t: number, rand: number) {
  return {
    hinten: punkt(gx + rand, gy + rand),
    rechts: punkt(gx + w - rand, gy + rand),
    vorne: punkt(gx + w - rand, gy + t - rand),
    links: punkt(gx + rand, gy + t - rand),
  };
}

/** Quader mit Deckfläche und zwei Seitentönen; gibt die Ecken der Deckfläche zurück. */
function quader(
  g: Graphics,
  boden: ReturnType<typeof ecken>,
  h: number,
  farbe: string,
  linie: string,
  /** Höhe, auf der der Quader steht (z. B. ein Turm auf dem Bergfried) */
  basis = 0,
) {
  const e = {
    hinten: hoch(boden.hinten, basis),
    rechts: hoch(boden.rechts, basis),
    vorne: hoch(boden.vorne, basis),
    links: hoch(boden.links, basis),
  };
  const o = {
    hinten: hoch(e.hinten, h),
    rechts: hoch(e.rechts, h),
    vorne: hoch(e.vorne, h),
    links: hoch(e.links, h),
  };
  const kontur = { width: 1, color: linie, alpha: 0.35 };
  g.poly(flach(e.links, e.vorne, o.vorne, o.links))
    .fill(dunkler(farbe, 0.82))
    .stroke(kontur);
  g.poly(flach(e.vorne, e.rechts, o.rechts, o.vorne))
    .fill(dunkler(farbe, 0.66))
    .stroke(kontur);
  g.poly(flach(o.hinten, o.rechts, o.vorne, o.links))
    .fill(farbe)
    .stroke(kontur);
  return o;
}

/** Fenster auf beiden sichtbaren Seiten; am Abend leuchten sie. */
function fenster(g: Graphics, e: ReturnType<typeof ecken>, h: number, f: Farben) {
  const farbe = f.abend ? f.licht : dunkler(f.linie, 1);
  const alpha = f.abend ? 1 : 0.35;
  for (const [a, b] of [
    [e.links, e.vorne],
    [e.vorne, e.rechts],
  ] as const) {
    const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - h * 0.55 };
    g.roundRect(m.x - 3, m.y - 5, 6, 10, 3).fill({ color: farbe, alpha });
  }
}

/** Schneehaube auf einem Dach (Winter, GRAFIK §4.3). */
function schneeDach(g: Graphics, o: ReturnType<typeof ecken>, h: number) {
  const spitze = hoch({ x: (o.hinten.x + o.vorne.x) / 2, y: (o.hinten.y + o.vorne.y) / 2 }, h + 4);
  g.poly(flach(o.links, o.vorne, spitze)).fill({ color: '#f4f7fb', alpha: 0.85 });
  g.poly(flach(o.vorne, o.rechts, spitze)).fill({ color: '#e8eef5', alpha: 0.85 });
}

/** Dach als Pyramide über der Deckfläche */
function pyramide(g: Graphics, o: ReturnType<typeof ecken>, h: number, f: Farben) {
  const spitze = hoch({ x: (o.hinten.x + o.vorne.x) / 2, y: (o.hinten.y + o.vorne.y) / 2 }, h);
  const kontur = { width: 1, color: f.linie, alpha: 0.35 };
  g.poly(flach(o.links, o.vorne, spitze))
    .fill(dunkler(f.dach, 0.85))
    .stroke(kontur);
  g.poly(flach(o.vorne, o.rechts, spitze))
    .fill(dunkler(f.dach, 0.7))
    .stroke(kontur);
  if (f.jahreszeit === 'winter') schneeDach(g, o, h);
}

/** Satteldach entlang der Breite */
function satteldach(g: Graphics, o: ReturnType<typeof ecken>, h: number, f: Farben) {
  const firstL = hoch({ x: (o.hinten.x + o.links.x) / 2, y: (o.hinten.y + o.links.y) / 2 }, h);
  const firstR = hoch({ x: (o.rechts.x + o.vorne.x) / 2, y: (o.rechts.y + o.vorne.y) / 2 }, h);
  const kontur = { width: 1, color: f.linie, alpha: 0.35 };
  g.poly(flach(o.links, o.vorne, firstR, firstL))
    .fill(dunkler(f.dach, 0.9))
    .stroke(kontur);
  g.poly(flach(o.vorne, o.rechts, firstR))
    .fill(dunkler(f.dach, 0.7))
    .stroke(kontur);
  if (f.jahreszeit === 'winter') {
    g.poly(flach(o.links, o.vorne, firstR, firstL)).fill({ color: '#f4f7fb', alpha: 0.75 });
  }
}

/** Ein Gebäude je Rolle (B-12); Optik je Epoche (G10). */
function zeichneRolle(
  g: Graphics,
  typ: GebaeudeTyp,
  stufe: number,
  pos: Position,
  farbe: string,
  f: Farben,
  epoche: Epoche = 1,
) {
  const optik = epocheOptik(epoche);
  const wand = farbeSkalieren(farbe, optik.wandFaktor);
  const [w, t] = KATALOG[typ].groesse;
  const h = hoehe(typ, stufe, epoche);
  switch (typ) {
    case 'kern': {
      const e = ecken(pos.x, pos.y, w, t, 0.12);
      const o = quader(g, e, h, wand, f.linie);
      // Zinnen an den beiden vorderen Kanten
      for (const [a, b] of [
        [o.links, o.vorne],
        [o.vorne, o.rechts],
      ] as const)
        for (const s of [0.1, 0.45, 0.8]) {
          const p = { x: a.x + (b.x - a.x) * s, y: a.y + (b.y - a.y) * s };
          const q = { x: a.x + (b.x - a.x) * (s + 0.12), y: a.y + (b.y - a.y) * (s + 0.12) };
          g.poly(flach(p, q, hoch(q, 6), hoch(p, 6))).fill(dunkler(wand, 0.75));
        }
      fenster(g, e, h, f);
      // Turm in der Mitte mit Dach
      const innen = ecken(pos.x + w * 0.3, pos.y + t * 0.3, w * 0.4, t * 0.4, 0);
      const spitze = quader(g, innen, 26, wand, f.linie, h);
      pyramide(g, spitze, 24, f);
      if (optik.kernAkzent) {
        const m = {
          x: (spitze.hinten.x + spitze.vorne.x) / 2,
          y: (spitze.hinten.y + spitze.vorne.y) / 2,
        };
        g.circle(m.x, m.y - 28, 3).fill(optik.kernAkzent);
      }
      break;
    }
    case 'turm': {
      const e = ecken(pos.x, pos.y, w, t, 0.18);
      const o = quader(g, e, h, wand, f.linie);
      pyramide(g, o, 22, f);
      fenster(g, e, h, f);
      break;
    }
    case 'werkstatt': {
      const e = ecken(pos.x, pos.y, w, t, 0.1);
      const o = quader(g, e, h, wand, f.linie);
      satteldach(g, o, 16, f);
      fenster(g, e, h, f);
      break;
    }
    case 'wissen': {
      const e = ecken(pos.x, pos.y, w, t, 0.12);
      const o = quader(g, e, h, wand, f.linie);
      pyramide(g, o, 16, f);
      fenster(g, e, h, f);
      break;
    }
    case 'eingang': {
      const e = ecken(pos.x, pos.y, w, t, 0.1);
      quader(g, e, h, wand, f.linie);
      // Torbogen auf der linken Seite
      const m = { x: (e.links.x + e.vorne.x) / 2, y: (e.links.y + e.vorne.y) / 2 };
      g.roundRect(m.x - 6, m.y - 20, 12, 18, 6).fill({ color: f.linie, alpha: 0.7 });
      break;
    }
    case 'einfassung':
      for (let i = 0; i < 3; i++) {
        const e = ecken(pos.x + (w / 3) * i, pos.y, w / 3, t, 0.08);
        quader(g, e, h, wand, f.linie);
      }
      break;
    case 'ursprung': {
      // Feuerstelle: flacher Ring, darin eine Flamme
      const e = ecken(pos.x, pos.y, w, t, 0.2);
      const o = quader(g, e, h, wand, f.linie);
      const m = { x: (o.hinten.x + o.vorne.x) / 2, y: (o.hinten.y + o.vorne.y) / 2 };
      g.poly([m.x, m.y - 14, m.x + 5, m.y, m.x - 5, m.y]).fill(f.licht);
      break;
    }
    case 'zeichen': {
      // Mast mit Fahne
      const e = ecken(pos.x, pos.y, w, t, 0.3);
      quader(g, e, h, dunkler(f.boden, 0.8), f.linie);
      const fuss = hoch({ x: (e.hinten.x + e.vorne.x) / 2, y: (e.hinten.y + e.vorne.y) / 2 }, h);
      const spitze = hoch(fuss, 40);
      g.moveTo(fuss.x, fuss.y).lineTo(spitze.x, spitze.y).stroke({ width: 2.5, color: f.linie });
      g.poly([spitze.x, spitze.y, spitze.x + 18, spitze.y + 6, spitze.x, spitze.y + 12])
        .fill(farbe)
        .stroke({ width: 1, color: f.linie, alpha: 0.5 });
      break;
    }
    case 'flaeche': {
      const e = ecken(pos.x, pos.y, w, t, 0.06);
      const o = quader(g, e, h, wand, f.linie);
      // Herbst: wärmere Punkte; Winter: hellere „Schnee“-Punkte
      const punktFarbe =
        f.jahreszeit === 'herbst'
          ? dunkler(f.dach, 0.9)
          : f.jahreszeit === 'winter'
            ? '#eef2f6'
            : dunkler(farbe, 0.6);
      for (const [sx, sy] of [
        [0.3, 0.3],
        [0.7, 0.35],
        [0.4, 0.7],
        [0.72, 0.72],
        [0.5, 0.5],
      ] as const) {
        const p = {
          x: o.hinten.x + (o.rechts.x - o.hinten.x) * sx + (o.links.x - o.hinten.x) * sy,
          y: o.hinten.y + (o.rechts.y - o.hinten.y) * sx + (o.links.y - o.hinten.y) * sy,
        };
        g.circle(p.x, p.y, 2.5).fill(punktFarbe);
      }
      break;
    }
    case 'denkmal': {
      const e = ecken(pos.x, pos.y, w, t, 0.22);
      const o = quader(g, e, h, dunkler(f.boden, 0.85), f.linie);
      const m = { x: (o.hinten.x + o.vorne.x) / 2, y: (o.hinten.y + o.vorne.y) / 2 };
      g.poly([m.x, m.y - 26, m.x + 8, m.y, m.x, m.y + 4, m.x - 8, m.y])
        .fill(farbe)
        .stroke({ width: 1, color: f.linie, alpha: 0.5 });
      break;
    }
  }
  // Stufe als Punkte an der vorderen Ecke (ab Stufe 2)
  if (stufe > 1) {
    const v = punkt(pos.x + w, pos.y + t);
    for (let i = 0; i < stufe; i++) g.circle(v.x - 4 - i * 7, v.y - 6, 2.5).fill(f.linie);
  }
}

/** Raute auf dem Boden – für Auswahl, Ziel und Neubauten */
function raute(g: Graphics, pos: Position, typ: GebaeudeTyp, abstand: number) {
  const [w, t] = KATALOG[typ].groesse;
  const e = ecken(pos.x, pos.y, w, t, abstand);
  return g.poly(flach(e.hinten, e.rechts, e.vorne, e.links));
}

/** Leichter Rauch bei Bewährungsprobe – keine Truppen (GRAFIK §8). */
function rauch(g: Graphics, f: Farben) {
  if (!f.spannung) return;
  for (const [x, y, s] of [
    [120, 90, 1.2],
    [280, 70, 1],
    [420, 100, 0.9],
  ] as const) {
    g.ellipse(x, y, 28 * s, 10 * s).fill({ color: f.wolke, alpha: 0.35 });
    g.ellipse(x + 16 * s, y - 6 * s, 18 * s, 8 * s).fill({ color: f.wolke, alpha: 0.25 });
  }
}

/** Sonne bzw. Mond und Sterne – feste Plätze, kein Zufall. Wolken liegen in einer eigenen Schicht. */
function gestirn(g: Graphics, f: Farben) {
  g.circle(buehneBreite() - 70, 52, f.abend ? 16 : 22).fill(f.licht);
  if (f.abend) {
    g.circle(buehneBreite() - 62, 46, 14).fill(f.himmel);
    for (const [x, y] of [
      [60, 30],
      [140, 70],
      [210, 24],
      [300, 54],
      [380, 20],
      [460, 80],
      [90, 96],
    ] as const)
      g.circle(x, y, 1.6).fill({ color: f.licht, alpha: 0.8 });
  }
}

/** Wolken am Tag – Verschiebung übernimmt die Atmosphäre (deterministisch). */
function wolken(g: Graphics, f: Farben) {
  if (f.abend) return;
  for (const [x, y, s] of [
    [90, 50, 1],
    [300, 34, 0.8],
  ] as const) {
    g.ellipse(x, y, 34 * s, 11 * s).fill({ color: f.wolke, alpha: 0.9 });
    g.ellipse(x + 22 * s, y - 7 * s, 22 * s, 11 * s).fill({ color: f.wolke, alpha: 0.9 });
  }
}

/** Die Insel: Deckfläche mit Raster, zwei Seitentöne nach vorn */
function insel(g: Graphics, f: Farben) {
  const { breite: W, tiefe: T } = bauplatzAktiv();
  const [h, r, v, l] = [punkt(0, 0), punkt(W, 0), punkt(W, T), punkt(0, T)];
  const u = (p: Punkt) => ({ x: p.x, y: p.y + INSEL });
  g.poly(flach(l, v, u(v), u(l))).fill(dunkler(f.boden, 0.78));
  g.poly(flach(v, r, u(r), u(v))).fill(dunkler(f.boden, 0.62));
  g.poly(flach(h, r, v, l)).fill(f.boden);
  for (let i = 0; i <= W; i++) {
    const a = punkt(i, 0);
    const b = punkt(i, T);
    g.moveTo(a.x, a.y).lineTo(b.x, b.y);
  }
  for (let j = 0; j <= T; j++) {
    const a = punkt(0, j);
    const b = punkt(W, j);
    g.moveTo(a.x, a.y).lineTo(b.x, b.y);
  }
  g.stroke({ width: 1, color: f.raster });
}

/** PixiJS-Grafik als Stift, nur für die Dorfbilder. */
function stiftVon(g: Graphics): Stift {
  return {
    flaeche(punkte, farbe, alpha = 1) {
      g.poly([...punkte]).fill(alpha === 1 ? farbe : { color: farbe, alpha });
    },
    kontur(punkte, farbe, breite, alpha = 1) {
      g.poly([...punkte]).stroke({ width: breite, color: farbe, alpha });
    },
    rechteck(x, y, b, h, farbe) {
      g.rect(x, y, b, h).fill(farbe);
    },
    ellipse(x, y, rx, ry, farbe, alpha = 1) {
      g.ellipse(x, y, rx, ry).fill(alpha === 1 ? farbe : { color: farbe, alpha });
    },
    kreis(x, y, r, farbe) {
      g.circle(x, y, r).fill(farbe);
    },
    linie(x1, y1, x2, y2, farbe, breite) {
      g.moveTo(x1, y1).lineTo(x2, y2).stroke({ width: breite, color: farbe, cap: 'round' });
    },
  };
}

/** Texturen aus dem Manifest laden (eigene Adresse); Fehler → Eintrag fehlt, Fallback. */
async function atlasTexturenLaden(manifest: AtlasManifest | null): Promise<Map<string, Texture>> {
  const map = new Map<string, Texture>();
  if (!manifest || manifest.eintraege.length === 0) return map;
  const basis = atlasBasisUrl();
  await Promise.all(
    manifest.eintraege.map(async (e) => {
      try {
        const tex = (await Assets.load(basis + e.datei)) as Texture;
        map.set(e.id, tex);
      } catch {
        // einzelner Ausfall: Code-Fallback für diese ID
      }
    }),
  );
  return map;
}

/** Graphics-Kind in einer Boden-Lage anlegen (Code-Fallback zeichnet darauf). */
function bodenAlsGraphics(lage: Container): Graphics {
  const g = new Graphics();
  lage.addChild(g);
  return g;
}

const BODEN_KACHELN: readonly BodenKachel[] = ['flaeche', 'rand', 'flaeche_b', 'flaeche_hell'];

/**
 * Dorf-Wiese aus Atlas-Kacheln (GRAFIK-SPRITES Boden).
 * true = gezeichnet; false = Aufrufer soll `dorfWiese` (Code) nutzen.
 */
function dorfWieseAusAtlas(
  lage: Container,
  manifest: AtlasManifest | null,
  texturen: Map<string, Texture>,
  abend: boolean,
): boolean {
  if (!manifest) return false;
  const epoche = 1;
  const texProKachel = new Map<BodenKachel, { tex: Texture; w: number; h: number }>();
  for (const k of BODEN_KACHELN) {
    const id = atlasBodenId('dorf', epoche, k);
    const eintrag = atlasEintragPerId(manifest, id);
    const tex = eintrag ? texturen.get(eintrag.id) : undefined;
    if (!eintrag || !tex) {
      // Pflicht: flaeche + rand; Varianten optional → dann auf flaeche zurück
      if (k === 'flaeche' || k === 'rand') return false;
      continue;
    }
    texProKachel.set(k, { tex, w: eintrag.pixel.w, h: eintrag.pixel.h });
  }
  const flaeche = texProKachel.get('flaeche');
  if (!flaeche) return false;
  const tint = dorfBodenTint(abend);
  const { breite, tiefe } = bauplatzAktiv();
  for (let y = -1; y <= tiefe; y++) {
    for (let x = -1; x <= breite; x++) {
      const gewaehlt = dorfBodenKachel(x, y, breite, tiefe);
      // Varianten optional: fehlende hell/b → flaeche (rand ist Pflicht oben)
      const paket = texProKachel.get(gewaehlt) ?? texProKachel.get('flaeche') ?? flaeche;
      const spr = new Sprite(paket.tex);
      spr.anchor.set(0.5, 1);
      spr.width = paket.w / 2 || RAUTE_B;
      spr.height = paket.h / 2 || RAUTE_H;
      // Südspitze der Feldraute = Fußpunkt (wie Gebäude-Anker)
      const fuss = punkt(x + 1, y + 1);
      spr.position.set(fuss.x, fuss.y);
      spr.tint = tint;
      lage.addChild(spr);
    }
  }
  return true;
}

export async function buehneErstellen(
  ziel: HTMLElement,
  farben: Farben,
  art: Bildart = 'insel',
  bewegungStart: Bewegung = 'voll',
  thema: Thema = 'bastion',
  platz?: BauplatzMass,
): Promise<Buehne> {
  if (platz) bauplatzAktivSetzen(platz);
  const app = new Application();
  await app.init({
    width: buehneBreite(),
    height: buehneHoehe(),
    background: farben.himmel,
    antialias: true,
    // doppelte Auflösung, damit das Bild auch beim Zoom (bis 200 %) scharf bleibt
    resolution: Math.min(4, (globalThis.devicePixelRatio || 1) * 2),
    autoDensity: true,
    // keine Erweiterungen nachladen, die wir nicht brauchen (Größe, A3)
    manageImports: false,
    preference: 'webgl',
  });
  app.canvas.style.inlineSize = '100%';
  app.canvas.style.blockSize = 'auto';
  app.canvas.style.display = 'block';
  ziel.append(app.canvas);

  // Atlas erst nach dem Canvas, und nur für Dorf (P0). So bleibt der Aufbau anderer
  // Themen schnell; Bauplatz.$effect räumt verwaiste Canvas bei Abbruch weg.
  const atlas: AtlasManifest | null = art === 'dorf' ? await atlasLaden() : null;
  const texturen = art === 'dorf' ? await atlasTexturenLaden(atlas) : new Map<string, Texture>();

  const wetterBild: WetterBild = farben.wetter ?? 'klar';
  // Himmel / Boden / Overlay getrennt: Boden kann Atlas-Sprites sein (Dorf-Wiese)
  const hintergrund = new Container();
  const himmelLage = new Graphics();
  const bodenLage = new Container();
  const overlayLage = new Graphics();
  hintergrund.addChild(himmelLage, bodenLage, overlayLage);
  if (wetterBild === 'klar' || wetterBild === 'bewoelkt') gestirn(himmelLage, farben);
  if (art === 'dorf') {
    const atlasWiese = dorfWieseAusAtlas(bodenLage, atlas, texturen, farben.abend);
    if (!atlasWiese) dorfWiese(stiftVon(bodenAlsGraphics(bodenLage)), farben.abend);
  } else if (art === 'garten') gartenBoden(stiftVon(bodenAlsGraphics(bodenLage)), farben.abend);
  else if (art === 'unterwasser') uwBoden(stiftVon(bodenAlsGraphics(bodenLage)), farben.abend);
  else if (art === 'weltraum') weltraumBoden(stiftVon(bodenAlsGraphics(bodenLage)), farben.abend);
  else insel(bodenAlsGraphics(bodenLage), farben);
  rauch(overlayLage, farben);
  if (wetterBild === 'nebel') {
    overlayLage.rect(0, 0, buehneBreite(), buehneHoehe()).fill({ color: '#c8d2dc', alpha: 0.35 });
  }
  if (farben.spannung) {
    overlayLage.rect(0, 0, buehneBreite(), buehneHoehe()).fill({ color: '#4a3a38', alpha: 0.18 });
  }
  const wolkenLage = new Graphics();
  wolken(wolkenLage, farben);
  // Bei bewölkt/Regen/Schnee mehr Wolken (feste zweite Lage)
  if (wetterBild !== 'klar' && !farben.abend) {
    wolkenLage.ellipse(180, 60, 40, 12).fill({ color: farben.wolke, alpha: 0.75 });
    wolkenLage.ellipse(400, 40, 36, 11).fill({ color: farben.wolke, alpha: 0.7 });
  }
  const gebaeude = new Container();
  gebaeude.sortableChildren = true;
  // Pivot in der Bühnenmitte, damit Aufstellen von der Mitte her wächst
  gebaeude.pivot.set(buehneBreite() / 2, buehneHoehe() / 2);
  gebaeude.position.set(buehneBreite() / 2, buehneHoehe() / 2);
  const partikelLage = new Graphics();
  const wesenLage = new Container();
  app.stage.addChild(hintergrund, wolkenLage, gebaeude, wesenLage, partikelLage);
  let wesen: WesenZustand[] = [];
  let letzteWesenZahl = -1;
  let tickerZuletzt = performance.now();

  /** Gezeichnete Gebäude für das Antippen: Umriss auf dem Bild → Platz des Gebäudes */
  let treffer: { pos: Position; umriss: number[] }[] = [];
  let bewegung: Bewegung = bewegungStart;
  let bekannt = new Set<string>();
  let ersterZug = true;
  let aufstellStart = 0;
  /** Solange kleiner 1, wächst die Gebäude-Lage noch (Aufstell-Effekt). */
  let aufstellAktiv = false;

  type Tropfen = { x: number; y: number; v: number };
  const leicht = bewegungStart === 'leicht';
  const budget = partikelBudget(wetterBild, leicht);
  const tropfen: Tropfen[] = Array.from({ length: budget }, (_, i) => ({
    x: ((i * 97) % buehneBreite()) + 3,
    y: ((i * 53) % buehneHoehe()) + 2,
    v: wetterBild === 'schnee' ? 0.4 + (i % 5) * 0.08 : 1.2 + (i % 7) * 0.15,
  }));

  const partikelZeichnen = () => {
    partikelLage.clear();
    if (budget === 0) return;
    for (const t of tropfen) {
      if (wetterBild === 'schnee') {
        partikelLage.circle(t.x, t.y, 1.6).fill({ color: '#f4f7fb', alpha: 0.9 });
      } else if (wetterBild === 'nebel') {
        partikelLage.ellipse(t.x, t.y, 18, 6).fill({ color: '#dce4ec', alpha: 0.12 });
      } else {
        partikelLage
          .moveTo(t.x, t.y)
          .lineTo(t.x - 1, t.y + 6)
          .stroke({ width: 1.2, color: '#7aa0c0', alpha: 0.55 });
      }
    }
  };
  partikelZeichnen();

  const aufstellAnwenden = (jetzt: number) => {
    if (!aufstellAktiv) return;
    const dauer = aufstellDauerMs(bewegung);
    const f = aufstellFortschritt(jetzt - aufstellStart, dauer);
    gebaeude.scale.set(0.92 + 0.08 * f);
    gebaeude.alpha = f;
    if (f >= 1) aufstellAktiv = false;
  };

  const wesenZeichnen = (jetzt: number) => {
    wesenLage.removeChildren().forEach((c) => c.destroy());
    if (!tickerAn(bewegung)) return; // bei „ruhig“ keine Wesen (GRAFIK §4.4)
    for (const w of wesen) {
      const { zyklus, frame } = wesenFrame(w, jetzt);
      const id = atlasWesenId(thema, w.art, zyklus, frame);
      const eintrag = atlasEintragPerId(atlas, id);
      const tex = eintrag ? texturen.get(eintrag.id) : undefined;
      if (eintrag && tex) {
        const spr = new Sprite(tex);
        spr.anchor.set(eintrag.anker.x, eintrag.anker.y);
        const skal = (eintrag.pixel.w / 2) * w.skala * (jetzt < w.reactBis ? 1.12 : 1);
        spr.width = skal;
        spr.height = (eintrag.pixel.h / eintrag.pixel.w) * skal;
        spr.position.set(w.x, w.y);
        spr.scale.x = w.richtung * Math.abs(spr.scale.x);
        wesenLage.addChild(spr);
      } else {
        const g = new Graphics();
        zeichneWesen(g, w, jetzt);
        wesenLage.addChild(g);
      }
    }
  };

  const ticker = () => {
    const jetzt = performance.now();
    const dt = Math.min(0.05, (jetzt - tickerZuletzt) / 1000);
    tickerZuletzt = jetzt;
    wolkenLage.x = wolkenVersatz(jetzt, bewegung);
    aufstellAnwenden(jetzt);
    if (tickerAn(bewegung) && budget > 0) {
      for (const t of tropfen) {
        t.y += t.v;
        if (wetterBild === 'schnee') t.x += Math.sin((jetzt + t.y) / 400) * 0.3;
        if (t.y > buehneHoehe()) {
          t.y = -4;
          t.x = (t.x + 37) % buehneBreite();
        }
      }
      partikelZeichnen();
    }
    if (tickerAn(bewegung) && wesen.length > 0) {
      wesen.forEach((w, i) => wesenTick(w, dt, jetzt, i));
      wesenZeichnen(jetzt);
    }
  };

  const tickerSync = () => {
    app.ticker.remove(ticker);
    if (tickerAn(bewegung)) {
      app.ticker.add(ticker);
      wesenZeichnen(performance.now());
    } else {
      wolkenLage.x = 0;
      gebaeude.scale.set(1);
      gebaeude.alpha = 1;
      // Standbild der Partikel bei „ruhig“; Wesen aus
      partikelZeichnen();
      wesenLage.removeChildren().forEach((c) => c.destroy());
    }
  };
  tickerSync();

  return {
    zeichne(b, a) {
      const ids = new Set(b.bauwerke.map((x) => x.id));
      const anzahl = b.bauwerke.length;
      if (anzahl !== letzteWesenZahl) {
        letzteWesenZahl = anzahl;
        wesen = wesenStarten(thema, anzahl, bewegung === 'leicht');
        wesenZeichnen(performance.now());
      }
      if (ersterZug) {
        bekannt = ids;
        ersterZug = false;
        gebaeude.scale.set(1);
        gebaeude.alpha = 1;
        aufstellAktiv = false;
      } else {
        const neu = [...ids].some((id) => !bekannt.has(id));
        bekannt = ids;
        if (neu && aufstellDauerMs(bewegung) > 0) {
          aufstellStart = performance.now();
          aufstellAktiv = true;
          gebaeude.scale.set(0.92);
          gebaeude.alpha = 0;
          tickerSync();
        }
      }
      gebaeude.removeChildren().forEach((c) => c.destroy());
      const g = new Graphics();
      g.zIndex = 0;
      if (a.hinterhof && a.hinterhof.length > 0) {
        hinterhofZeichnen(stiftVon(g), a.hinterhof, thema, farben.abend);
      }
      // Neubauten im Bau: Umriss auf dem Boden
      for (const v of b.vorhaben.filter((x) => x.stufe === 1)) {
        raute(g, v.pos, v.typ, 0.1)
          .fill({ color: farben.imBau, alpha: 0.18 })
          .stroke({ width: 2, color: farben.imBau });
      }
      // Von hinten nach vorn zeichnen, damit Vorderes Hinteres verdeckt
      const reihe = [...b.bauwerke].sort((p, q) => {
        const [pw, pt] = KATALOG[p.typ].groesse;
        const [qw, qt] = KATALOG[q.typ].groesse;
        return p.pos.x + p.pos.y + (pw + pt) / 2 - (q.pos.x + q.pos.y + (qw + qt) / 2);
      });
      treffer = [];
      const epoche = a.epoche ?? 1;
      if (art === 'dorf' && texturen.size > 0) {
        // Atlas-Dorf: Bäume + Gebäude-Sprites (Fallback je Rolle, GRAFIK-SPRITES P0)
        const lagen: { tiefe: number; zeichne: () => void }[] = dorfBaumLagen().map((b) => ({
          tiefe: b.tiefe,
          zeichne: () => {
            const stueck = new Graphics();
            dorfBaum(stiftVon(stueck), b.x, b.y, b.s);
            stueck.zIndex = b.tiefe * 10;
            gebaeude.addChild(stueck);
          },
        }));
        for (const x of reihe) {
          const [bw, bt] = KATALOG[x.typ].groesse;
          const tiefe = x.pos.x + x.pos.y + (bw + bt) / 2;
          lagen.push({
            tiefe,
            zeichne: () => {
              const eintrag = atlasEintrag(atlas, 'dorf', epoche, x.typ, x.stufe);
              const tex = eintrag ? texturen.get(eintrag.id) : undefined;
              if (eintrag && tex) {
                const fuss = punkt(x.pos.x + bw, x.pos.y + bt);
                const spr = new Sprite(tex);
                spr.anchor.set(eintrag.anker.x, eintrag.anker.y);
                spr.width = eintrag.pixel.w / 2;
                spr.height = eintrag.pixel.h / 2;
                spr.position.set(fuss.x, fuss.y);
                spr.zIndex = tiefe * 10;
                gebaeude.addChild(spr);
                if (a.auswahl === x.id) {
                  raute(g, x.pos, x.typ, -0.05).stroke({ width: 3, color: farben.auswahl });
                }
              } else {
                const stueck = new Graphics();
                dorfGebaeude(
                  stiftVon(stueck),
                  {
                    typ: x.typ,
                    stufe: x.stufe,
                    pos: x.pos,
                    ...(x.farbe ? { akzent: FARBWERT[x.farbe] } : {}),
                    auswahl: a.auswahl === x.id,
                  },
                  farben.abend,
                  farben.licht,
                );
                if (a.auswahl === x.id) {
                  raute(stueck, x.pos, x.typ, -0.05).stroke({ width: 3, color: farben.auswahl });
                }
                stueck.zIndex = tiefe * 10;
                gebaeude.addChild(stueck);
              }
            },
          });
        }
        lagen.sort((p, q) => p.tiefe - q.tiefe);
        for (const lage of lagen) lage.zeichne();
      } else if (art === 'dorf') {
        dorfSzene(
          stiftVon(g),
          reihe.map((x) => ({
            typ: x.typ,
            stufe: x.stufe,
            pos: x.pos,
            ...(x.farbe ? { akzent: FARBWERT[x.farbe] } : {}),
            auswahl: a.auswahl === x.id,
          })),
          farben.abend,
          farben.licht,
          (pos, typ) => {
            raute(g, pos, typ, -0.05).stroke({ width: 3, color: farben.auswahl });
          },
        );
      } else if (art === 'garten') {
        gartenSzene(
          stiftVon(g),
          reihe.map((x) => ({
            typ: x.typ,
            stufe: x.stufe,
            pos: x.pos,
            ...(x.farbe ? { akzent: FARBWERT[x.farbe] } : {}),
            auswahl: a.auswahl === x.id,
          })),
          farben.abend,
          farben.licht,
          (pos, typ) => {
            raute(g, pos, typ, -0.05).stroke({ width: 3, color: farben.auswahl });
          },
        );
      } else if (art === 'unterwasser') {
        uwSzene(
          stiftVon(g),
          reihe.map((x) => ({
            typ: x.typ,
            stufe: x.stufe,
            pos: x.pos,
            ...(x.farbe ? { akzent: FARBWERT[x.farbe] } : {}),
            auswahl: a.auswahl === x.id,
          })),
          farben.abend,
          farben.licht,
          (pos, typ) => {
            raute(g, pos, typ, -0.05).stroke({ width: 3, color: farben.auswahl });
          },
        );
      } else if (art === 'weltraum') {
        weltraumSzene(
          stiftVon(g),
          reihe.map((x) => ({
            typ: x.typ,
            stufe: x.stufe,
            pos: x.pos,
            ...(x.farbe ? { akzent: FARBWERT[x.farbe] } : {}),
            auswahl: a.auswahl === x.id,
          })),
          farben.abend,
          farben.licht,
          (pos, typ) => {
            raute(g, pos, typ, -0.05).stroke({ width: 3, color: farben.auswahl });
          },
        );
      }
      for (const x of reihe) {
        const [w, t] = KATALOG[x.typ].groesse;
        if (art === 'insel') {
          if (a.auswahl === x.id)
            raute(g, x.pos, x.typ, -0.05).stroke({ width: 3, color: farben.auswahl });
          zeichneRolle(
            g,
            x.typ,
            x.stufe,
            x.pos,
            x.farbe ? FARBWERT[x.farbe] : farben.familie[KATALOG[x.typ].familie],
            farben,
            a.epoche ?? 1,
          );
        }
        // Umriss des ganzen Gebäudes (Boden bis Dach) zum Antippen
        const e = ecken(x.pos.x, x.pos.y, w, t, 0);
        const h =
          (art === 'dorf'
            ? dorfHoehe(x.typ, x.stufe)
            : art === 'garten'
              ? gartenHoehe(x.typ, x.stufe)
              : art === 'unterwasser'
                ? uwHoehe(x.typ, x.stufe)
                : art === 'weltraum'
                  ? weltraumHoehe(x.typ, x.stufe)
                  : hoehe(x.typ, x.stufe, a.epoche ?? 1)) + 20;
        treffer.push({
          pos: x.pos,
          umriss: flach(
            e.links,
            e.vorne,
            e.rechts,
            hoch(e.rechts, h),
            hoch(e.hinten, h),
            hoch(e.links, h),
          ),
        });
      }
      if (a.ziel) {
        raute(g, a.ziel.pos, a.ziel.typ, 0).stroke({
          width: 3,
          color: a.ziel.frei ? farben.auswahl : farben.linie,
          alpha: a.ziel.frei ? 1 : 0.4,
        });
      }
      gebaeude.addChild(g);
    },
    setzeBewegung(b) {
      bewegung = b;
      wesen = wesenStarten(thema, letzteWesenZahl < 0 ? 0 : letzteWesenZahl, b === 'leicht');
      tickerSync();
    },
    feldBei(clientX, clientY) {
      const r = app.canvas.getBoundingClientRect();
      const x = ((clientX - r.left) / r.width) * buehneBreite();
      const y = ((clientY - r.top) / r.height) * buehneHoehe();
      // Erst die Gebäude, von vorn nach hinten – auch ein Tipp aufs Dach trifft
      for (const z of [...treffer].reverse()) if (innen(z.umriss, x, y)) return z.pos;
      return feldUnter(x, y);
    },
    wesenBei(clientX, clientY) {
      if (!tickerAn(bewegung)) return undefined;
      const r = app.canvas.getBoundingClientRect();
      const x = ((clientX - r.left) / r.width) * buehneBreite();
      const y = ((clientY - r.top) / r.height) * buehneHoehe();
      for (const w of [...wesen].reverse()) {
        if (Math.hypot(w.x - x, w.y - y) < 14 * w.skala) return w.id;
      }
      return undefined;
    },
    tippeWesen(id) {
      const w = wesen.find((x) => x.id === id);
      if (w) {
        wesenReagieren(w, performance.now());
        wesenZeichnen(performance.now());
      }
    },
    zerstoere() {
      app.ticker.remove(ticker);
      const view = app.canvas;
      app.destroy(true, { children: true });
      // Pixi entfernt die View nicht zuverlässig, wenn destroy nach Abbruch kommt
      view.remove();
    },
  };
}

/** Liegt (x, y) im Vieleck? (Strahlverfahren) */
function innen(umriss: readonly number[], x: number, y: number): boolean {
  let drin = false;
  const n = umriss.length / 2;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = umriss[2 * i] ?? 0;
    const yi = umriss[2 * i + 1] ?? 0;
    const xj = umriss[2 * j] ?? 0;
    const yj = umriss[2 * j + 1] ?? 0;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) drin = !drin;
  }
  return drin;
}
