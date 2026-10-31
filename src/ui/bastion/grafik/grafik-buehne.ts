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
  atlasHimmelId,
  atlasLaubId,
  atlasLaden,
  atlasSchneeDachId,
  atlasWetterId,
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
import {
  bewohnerFortschritt,
  bewohnerReagieren,
  bewohnerStarten,
  bewohnerTick,
  bewohnerFarbe,
  type BewohnerZustand,
} from './bewohner';
import { belegteFelder } from './pfad';
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
  /** Bücher für Bewohner-Freischaltung (Wissen behalten) */
  readonly buecher?: number;
  /** Konto nur für Ableitung – Stand wird nicht gezeichnet */
  readonly konto?: import('../../../core/ledger/buchung').Konto;
}

export interface Buehne {
  /** Pixi-Canvas (für atomaren Tausch in Bauplatz) */
  readonly view: HTMLCanvasElement;
  zeichne(b: Bastion, a: Ansicht): void;
  /** Bewegung umschalten, ohne die Bühne neu zu bauen (GRAFIK §4.5) */
  setzeBewegung(b: Bewegung): void;
  /** Feld unter einem Punkt in Bildschirmkoordinaten – oder undefined außerhalb */
  feldBei(clientX: number, clientY: number): Position | undefined;
  /** Wesen unter dem Punkt – für Tippen (GRAFIK §4.4) */
  wesenBei(clientX: number, clientY: number): string | undefined;
  /** Bewohner unter dem Punkt */
  bewohnerBei(clientX: number, clientY: number): string | undefined;
  /** Kurze Reaktion auf Tippen */
  tippeWesen(id: string): void;
  tippeBewohner(id: string): void;
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

/** Silhouette eines Bewohners (Zwerg o. Ä.) mit ruhiger Tätigkeit. */
function zeichneBewohner(g: Graphics, b: BewohnerZustand, jetzt: number) {
  const s = jetzt < b.reactBis ? 1.1 : 1;
  const x = b.x;
  const y = b.y;
  const farbe = bewohnerFarbe(b.art);
  // Körper + spitze Mütze
  g.ellipse(x, y, 4.5 * s, 3 * s).fill(farbe);
  g.poly([x - 4 * s, y - 4 * s, x, y - 11 * s, x + 4 * s, y - 4 * s]).fill(
    b.art === 'gaertner' ? '#3a6a38' : b.art === 'bibliothek' ? '#4a4a88' : '#b03a2e',
  );
  g.circle(x, y - 3.5 * s, 2.2 * s).fill('#f0d8c0');
  // Tätigkeit: Gießkanne / Besen / Buch / Blick
  if (b.taetigkeit === 'giessen') {
    const wip = Math.sin(b.phase) * 2;
    g.poly([x + 5 * s, y - 2 * s, x + 9 * s, y - 1 * s + wip, x + 7 * s, y + 1 * s]).fill(
      '#5a8aaa',
    );
    g.circle(x + 8 * s, y + 2 * s + wip, 0.8 * s).fill({ color: '#6ab0d0', alpha: 0.7 });
  } else if (b.taetigkeit === 'kehren' || b.taetigkeit === 'gaertnern') {
    const wip = Math.sin(b.phase) * 3;
    g.moveTo(x - 5 * s, y - 1 * s)
      .lineTo(x - 8 * s + wip, y + 4 * s)
      .stroke({ width: 1.5, color: '#8a6a3a' });
  } else if (b.taetigkeit === 'lesen') {
    g.rect(x + 3 * s, y - 5 * s, 5 * s, 4 * s).fill('#e8e0c8');
  } else if (b.taetigkeit === 'schauen') {
    g.circle(x + 1.2 * s, y - 4 * s, 0.6 * s).fill('#2a2a2a');
    g.circle(x - 1.2 * s, y - 4 * s, 0.6 * s).fill('#2a2a2a');
  }
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

const GESTIRN_X = () => buehneBreite() - 70;
const GESTIRN_Y = 52;

/** Sterne am Abend – feste Plätze, kein Zufall (Code, auch neben Atlas-Mond). */
function sterneZeichnen(g: Graphics, f: Farben) {
  if (!f.abend) return;
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

/** Sonne/Mond: Atlas-Sprite wenn vorhanden, sonst Code-Kreis (GRAFIK-SPRITES P1). */
function gestirnZeichnen(
  lage: Container,
  f: Farben,
  manifest: AtlasManifest | null,
  texturen: Map<string, Texture>,
) {
  const id = atlasHimmelId(f.abend ? 'mond' : 'sonne');
  const eintrag = atlasEintragPerId(manifest, id);
  const tex = eintrag ? texturen.get(eintrag.id) : undefined;
  if (eintrag && tex) {
    const spr = new Sprite(tex);
    spr.anchor.set(eintrag.anker.x, eintrag.anker.y);
    spr.width = eintrag.pixel.w / 2;
    spr.height = eintrag.pixel.h / 2;
    spr.position.set(GESTIRN_X(), GESTIRN_Y);
    lage.addChild(spr);
  } else {
    const g = new Graphics();
    g.circle(GESTIRN_X(), GESTIRN_Y, f.abend ? 16 : 22).fill(f.licht);
    if (f.abend) g.circle(GESTIRN_X() + 8, GESTIRN_Y - 6, 14).fill(f.himmel);
    lage.addChild(g);
  }
  if (f.abend) {
    const sterne = new Graphics();
    sterneZeichnen(sterne, f);
    lage.addChild(sterne);
  }
}

/** Wolken am Tag aus Atlas oder Code – Verschiebung übernimmt die Atmosphäre. */
function wolkenZeichnen(
  lage: Container,
  f: Farben,
  wetter: WetterBild,
  manifest: AtlasManifest | null,
  texturen: Map<string, Texture>,
) {
  if (f.abend) return;
  const plaetze: readonly { x: number; y: number; id: 'wolke_1' | 'wolke_2'; s: number }[] = [
    { x: 90, y: 50, id: 'wolke_1', s: 1 },
    { x: 300, y: 34, id: 'wolke_2', s: 0.85 },
  ];
  const extra =
    wetter !== 'klar'
      ? ([
          { x: 180, y: 60, id: 'wolke_2' as const, s: 0.95 },
          { x: 400, y: 40, id: 'wolke_1' as const, s: 0.8 },
        ] as const)
      : [];
  let atlasOk = true;
  for (const p of [...plaetze, ...extra]) {
    const eintrag = atlasEintragPerId(manifest, atlasHimmelId(p.id));
    const tex = eintrag ? texturen.get(eintrag.id) : undefined;
    if (!eintrag || !tex) {
      atlasOk = false;
      break;
    }
  }
  if (atlasOk) {
    for (const p of [...plaetze, ...extra]) {
      const eintrag = atlasEintragPerId(manifest, atlasHimmelId(p.id));
      const tex = eintrag ? texturen.get(eintrag.id) : undefined;
      if (!eintrag || !tex) continue;
      const spr = new Sprite(tex);
      spr.anchor.set(eintrag.anker.x, eintrag.anker.y);
      spr.width = (eintrag.pixel.w / 2) * p.s;
      spr.height = (eintrag.pixel.h / 2) * p.s;
      spr.position.set(p.x, p.y);
      spr.alpha = 0.92;
      lage.addChild(spr);
    }
    return;
  }
  const g = new Graphics();
  for (const [x, y, s] of [
    [90, 50, 1],
    [300, 34, 0.8],
  ] as const) {
    g.ellipse(x, y, 34 * s, 11 * s).fill({ color: f.wolke, alpha: 0.9 });
    g.ellipse(x + 22 * s, y - 7 * s, 22 * s, 11 * s).fill({ color: f.wolke, alpha: 0.9 });
  }
  if (wetter !== 'klar') {
    g.ellipse(180, 60, 40, 12).fill({ color: f.wolke, alpha: 0.75 });
    g.ellipse(400, 40, 36, 11).fill({ color: f.wolke, alpha: 0.7 });
  }
  lage.addChild(g);
}

/** Schnee-Dach-Auflage aus Atlas auf Gebäude-Fußpunkt (Winter). */
function schneeDachSprite(
  gebaeude: Container,
  pos: Position,
  typ: GebaeudeTyp,
  tiefe: number,
  manifest: AtlasManifest | null,
  texturen: Map<string, Texture>,
): void {
  const [bw, bt] = KATALOG[typ].groesse;
  const seite = Math.max(bw, bt) as 1 | 2 | 3;
  const felder: readonly [number, number] = seite >= 3 ? [3, 3] : seite >= 2 ? [2, 2] : [1, 1];
  const eintrag = atlasEintragPerId(manifest, atlasSchneeDachId(felder));
  const tex = eintrag ? texturen.get(eintrag.id) : undefined;
  if (!eintrag || !tex) return;
  const fuss = punkt(pos.x + bw, pos.y + bt);
  const spr = new Sprite(tex);
  spr.anchor.set(eintrag.anker.x, eintrag.anker.y);
  spr.width = eintrag.pixel.w / 2;
  spr.height = eintrag.pixel.h / 2;
  // leicht über dem Gebäude-Fuß, damit die Kappe auf dem Dach sitzt
  spr.position.set(fuss.x, fuss.y - 8);
  spr.zIndex = tiefe * 10 + 1;
  gebaeude.addChild(spr);
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
async function atlasTexturenLaden(
  manifest: AtlasManifest | null,
  braucht: (id: string) => boolean = () => true,
): Promise<Map<string, Texture>> {
  const map = new Map<string, Texture>();
  if (!manifest || manifest.eintraege.length === 0) return map;
  const basis = atlasBasisUrl();
  const liste = manifest.eintraege.filter((e) => braucht(e.id));
  await Promise.all(
    liste.map(async (e) => {
      try {
        // Timeout: offline/ohne Cache soll die Bühne nicht hängen (Code-Fallback)
        const geladen = Assets.load(basis + e.datei) as Promise<Texture>;
        const tex = await Promise.race([
          geladen,
          new Promise<Texture>((_, ablehnen) => {
            setTimeout(() => ablehnen(new Error('atlas-timeout')), 4_000);
          }),
        ]);
        map.set(e.id, tex);
      } catch {
        // einzelner Ausfall: Code-Fallback für diese ID
      }
    }),
  );
  return map;
}

/** Welche Atlas-IDs die Bühne für diese Bildart braucht (P0 Dorf + P1 Himmel/Wetter). */
function atlasBrauchtId(art: Bildart, id: string): boolean {
  if (id.startsWith('himmel/') || id.startsWith('wetter/') || id.startsWith('auflage/'))
    return true;
  if (art !== 'dorf') return false;
  return id.startsWith('dorf/') || id.startsWith('boden/dorf/') || id.startsWith('wesen/dorf/');
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

  // P1 Himmel/Wetter für alle Themen; Dorf-Gebäude/Boden/Wesen nur bei Dorf.
  // Bauplatz tauscht atomar (altes Canvas bleibt bis diese Promise fertig ist).
  const atlas: AtlasManifest | null = await atlasLaden();
  const texturen = await atlasTexturenLaden(atlas, (id) => atlasBrauchtId(art, id));

  const wetterBild: WetterBild = farben.wetter ?? 'klar';
  // Himmel / Boden / Overlay getrennt: Boden kann Atlas-Sprites sein (Dorf-Wiese)
  const hintergrund = new Container();
  const himmelLage = new Container();
  const bodenLage = new Container();
  const overlayLage = new Container();
  hintergrund.addChild(himmelLage, bodenLage, overlayLage);
  if (wetterBild === 'klar' || wetterBild === 'bewoelkt') {
    gestirnZeichnen(himmelLage, farben, atlas, texturen);
  }
  if (art === 'dorf') {
    const atlasWiese = dorfWieseAusAtlas(bodenLage, atlas, texturen, farben.abend);
    if (!atlasWiese) dorfWiese(stiftVon(bodenAlsGraphics(bodenLage)), farben.abend);
  } else if (art === 'garten') gartenBoden(stiftVon(bodenAlsGraphics(bodenLage)), farben.abend);
  else if (art === 'unterwasser') uwBoden(stiftVon(bodenAlsGraphics(bodenLage)), farben.abend);
  else if (art === 'weltraum') weltraumBoden(stiftVon(bodenAlsGraphics(bodenLage)), farben.abend);
  else insel(bodenAlsGraphics(bodenLage), farben);
  const rauchGfx = new Graphics();
  rauch(rauchGfx, farben);
  overlayLage.addChild(rauchGfx);
  if (wetterBild === 'nebel') {
    const nebelId = atlasWetterId('nebel');
    const nebelEintrag = atlasEintragPerId(atlas, nebelId);
    const nebelTex = nebelEintrag ? texturen.get(nebelEintrag.id) : undefined;
    if (nebelEintrag && nebelTex) {
      // drei weiche Flecken statt Vollflächen-Rechteck
      for (const [x, y, s] of [
        [120, 140, 1.4],
        [300, 200, 1.6],
        [460, 160, 1.3],
      ] as const) {
        const spr = new Sprite(nebelTex);
        spr.anchor.set(nebelEintrag.anker.x, nebelEintrag.anker.y);
        spr.width = (nebelEintrag.pixel.w / 2) * s;
        spr.height = (nebelEintrag.pixel.h / 2) * s;
        spr.position.set(x, y);
        spr.alpha = 0.85;
        overlayLage.addChild(spr);
      }
    } else {
      const g = new Graphics();
      g.rect(0, 0, buehneBreite(), buehneHoehe()).fill({ color: '#c8d2dc', alpha: 0.35 });
      overlayLage.addChild(g);
    }
  }
  if (farben.spannung) {
    const spannung = new Graphics();
    spannung.rect(0, 0, buehneBreite(), buehneHoehe()).fill({ color: '#4a3a38', alpha: 0.18 });
    overlayLage.addChild(spannung);
  }
  const wolkenLage = new Container();
  wolkenZeichnen(wolkenLage, farben, wetterBild, atlas, texturen);
  const gebaeude = new Container();
  gebaeude.sortableChildren = true;
  // Pivot in der Bühnenmitte, damit Aufstellen von der Mitte her wächst
  gebaeude.pivot.set(buehneBreite() / 2, buehneHoehe() / 2);
  gebaeude.position.set(buehneBreite() / 2, buehneHoehe() / 2);
  const partikelLage = new Container();
  const wesenLage = new Container();
  const bewohnerLage = new Container();
  app.stage.addChild(hintergrund, wolkenLage, gebaeude, wesenLage, bewohnerLage, partikelLage);
  let wesen: WesenZustand[] = [];
  let bewohner: BewohnerZustand[] = [];
  let letzteWesenZahl = -1;
  let letzteBewohnerKey = '';
  let belegt = belegteFelder([]);
  let letzteBauwerke: Bastion['bauwerke'] = [];
  let tickerZuletzt = performance.now();

  /** Gezeichnete Gebäude für das Antippen: Umriss auf dem Bild → Platz des Gebäudes */
  let treffer: { pos: Position; umriss: number[] }[] = [];
  let bewegung: Bewegung = bewegungStart;
  let bekannt = new Set<string>();
  let ersterZug = true;
  let aufstellStart = 0;
  /** Solange kleiner 1, wächst die Gebäude-Lage noch (Aufstell-Effekt). */
  let aufstellAktiv = false;

  type Tropfen = { x: number; y: number; v: number; spr?: Sprite };
  const leicht = bewegungStart === 'leicht';
  const jahreszeit = farben.jahreszeit;
  // Herbstlaub zusätzlich zu Wetter-Partikeln (Auflage P1), fest und begrenzt
  const laubBudget = jahreszeit === 'herbst' && bewegungStart !== 'aus' ? (leicht ? 4 : 8) : 0;
  const wetterBudget = partikelBudget(wetterBild, leicht);
  const budget = wetterBudget + laubBudget;
  const partikelArt: 'regen' | 'schnee' | 'nebel' | 'laub' | 'keine' =
    wetterBild === 'schnee'
      ? 'schnee'
      : wetterBild === 'nebel'
        ? 'nebel'
        : wetterBild === 'regen'
          ? 'regen'
          : laubBudget > 0
            ? 'laub'
            : 'keine';

  const wetterTexId =
    partikelArt === 'schnee'
      ? atlasWetterId('schnee_flocke')
      : partikelArt === 'nebel'
        ? atlasWetterId('nebel')
        : partikelArt === 'regen'
          ? atlasWetterId('regen_tropfen')
          : undefined;
  const wetterEintrag = wetterTexId ? atlasEintragPerId(atlas, wetterTexId) : undefined;
  const wetterTex = wetterEintrag ? texturen.get(wetterEintrag.id) : undefined;

  const tropfen: Tropfen[] = Array.from({ length: budget }, (_, i) => {
    const istLaub = i >= wetterBudget;
    const t: Tropfen = {
      x: ((i * 97) % buehneBreite()) + 3,
      y: ((i * 53) % buehneHoehe()) + 2,
      v: istLaub
        ? 0.35 + (i % 4) * 0.06
        : wetterBild === 'schnee'
          ? 0.4 + (i % 5) * 0.08
          : 1.2 + (i % 7) * 0.15,
    };
    if (istLaub) {
      const n = ((i % 3) + 1) as 1 | 2 | 3;
      const e = atlasEintragPerId(atlas, atlasLaubId(n));
      const tex = e ? texturen.get(e.id) : undefined;
      if (e && tex) {
        const spr = new Sprite(tex);
        spr.anchor.set(e.anker.x, e.anker.y);
        spr.width = e.pixel.w / 2;
        spr.height = e.pixel.h / 2;
        spr.alpha = 0.9;
        t.spr = spr;
        partikelLage.addChild(spr);
      }
    } else if (wetterEintrag && wetterTex) {
      const spr = new Sprite(wetterTex);
      spr.anchor.set(wetterEintrag.anker.x, wetterEintrag.anker.y);
      const skal = partikelArt === 'nebel' ? 0.55 : partikelArt === 'schnee' ? 0.7 : 0.85;
      spr.width = (wetterEintrag.pixel.w / 2) * skal;
      spr.height = (wetterEintrag.pixel.h / 2) * skal;
      spr.alpha = partikelArt === 'nebel' ? 0.35 : 0.85;
      t.spr = spr;
      partikelLage.addChild(spr);
    }
    return t;
  });

  // Code-Fallback-Partikel, wenn kein Atlas-Sprite für Wetter (Laub ohne Sprite entfällt)
  const partikelGfx = new Graphics();
  partikelLage.addChild(partikelGfx);
  const nutzeGfx = wetterBudget > 0 && !(wetterEintrag && wetterTex);

  const partikelZeichnen = () => {
    for (const t of tropfen) {
      if (t.spr) {
        t.spr.position.set(t.x, t.y);
      }
    }
    partikelGfx.clear();
    if (!nutzeGfx || wetterBudget === 0) return;
    for (let i = 0; i < wetterBudget; i++) {
      const t = tropfen[i];
      if (!t || t.spr) continue;
      if (wetterBild === 'schnee') {
        partikelGfx.circle(t.x, t.y, 1.6).fill({ color: '#f4f7fb', alpha: 0.9 });
      } else if (wetterBild === 'nebel') {
        partikelGfx.ellipse(t.x, t.y, 18, 6).fill({ color: '#dce4ec', alpha: 0.12 });
      } else {
        partikelGfx
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

  const bewohnerZeichnen = (jetzt: number) => {
    bewohnerLage.removeChildren().forEach((c) => c.destroy());
    if (!tickerAn(bewegung)) return;
    for (const b of bewohner) {
      const g = new Graphics();
      zeichneBewohner(g, b, jetzt);
      bewohnerLage.addChild(g);
    }
  };

  const ticker = () => {
    const jetzt = performance.now();
    const dt = Math.min(0.05, (jetzt - tickerZuletzt) / 1000);
    tickerZuletzt = jetzt;
    wolkenLage.x = wolkenVersatz(jetzt, bewegung);
    aufstellAnwenden(jetzt);
    if (tickerAn(bewegung) && budget > 0) {
      for (let i = 0; i < tropfen.length; i++) {
        const t = tropfen[i];
        if (!t) continue;
        t.y += t.v;
        const drift =
          i >= wetterBudget || wetterBild === 'schnee' ? Math.sin((jetzt + t.y) / 400) * 0.3 : 0;
        if (drift) t.x += drift;
        if (t.y > buehneHoehe()) {
          t.y = -4;
          t.x = (t.x + 37) % buehneBreite();
        }
      }
      partikelZeichnen();
    }
    if (tickerAn(bewegung) && wesen.length > 0) {
      const platz = bauplatzAktiv();
      wesen.forEach((w, i) => wesenTick(w, dt, jetzt, i, belegt, platz));
      wesenZeichnen(jetzt);
    }
    if (tickerAn(bewegung) && bewohner.length > 0) {
      bewohner.forEach((b, i) => bewohnerTick(b, dt, jetzt, i));
      bewohnerZeichnen(jetzt);
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
      // Standbild der Partikel bei „ruhig“; Wesen und Bewohner aus
      partikelZeichnen();
      wesenLage.removeChildren().forEach((c) => c.destroy());
      bewohnerLage.removeChildren().forEach((c) => c.destroy());
    }
  };
  tickerSync();

  return {
    zeichne(b, a) {
      const ids = new Set(b.bauwerke.map((x) => x.id));
      const anzahl = b.bauwerke.length;
      letzteBauwerke = b.bauwerke;
      belegt = belegteFelder(b.bauwerke);
      if (anzahl !== letzteWesenZahl) {
        letzteWesenZahl = anzahl;
        wesen = wesenStarten(thema, anzahl, bewegung === 'leicht', {
          bauwerke: b.bauwerke,
          platz: bauplatzAktiv(),
        });
        wesenZeichnen(performance.now());
      }
      const epocheJetzt = a.epoche ?? 1;
      const buecher = a.buecher ?? 0;
      const konto = a.konto;
      if (konto) {
        const f = bewohnerFortschritt(b, konto, buecher, epocheJetzt, bewegung === 'leicht');
        const key = `${f.gebaeude}|${f.fertig}|${f.buecher}|${f.epoche}|${f.hatWissen}|${f.hatTurm}|${f.hatFlaeche}|${f.hatZeichen}|${f.leicht}`;
        if (key !== letzteBewohnerKey) {
          letzteBewohnerKey = key;
          bewohner = bewohnerStarten(f, b.bauwerke, bauplatzAktiv());
          bewohnerZeichnen(performance.now());
        }
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
      const epoche = epocheJetzt;
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
                if (farben.jahreszeit === 'winter') {
                  schneeDachSprite(gebaeude, x.pos, x.typ, tiefe, atlas, texturen);
                }
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
      wesen = wesenStarten(thema, letzteWesenZahl < 0 ? 0 : letzteWesenZahl, b === 'leicht', {
        bauwerke: letzteBauwerke,
        platz: bauplatzAktiv(),
      });
      letzteBewohnerKey = '';
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
    bewohnerBei(clientX, clientY) {
      if (!tickerAn(bewegung)) return undefined;
      const r = app.canvas.getBoundingClientRect();
      const x = ((clientX - r.left) / r.width) * buehneBreite();
      const y = ((clientY - r.top) / r.height) * buehneHoehe();
      for (const b of [...bewohner].reverse()) {
        if (Math.hypot(b.x - x, b.y - y) < 16) return b.id;
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
    tippeBewohner(id) {
      const b = bewohner.find((x) => x.id === id);
      if (b) {
        bewohnerReagieren(b, performance.now());
        bewohnerZeichnen(performance.now());
      }
    },
    get view() {
      return app.canvas;
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
