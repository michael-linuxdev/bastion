// Bauplatz als Grafik (ARCHITEKTUR T-6, BASEBAU B-11/B-12, GRAFIK §1):
// PixiJS, nachgeladen nur bei geöffneter Bastion. Richtung A „Tag, warm“: die Insel
// schräg von oben (isometrisch), flache Farbflächen mit zwei Seitentönen je Gebäude,
// Himmel mit Sonne und Wolken; dunkel als Abend mit erleuchteten Fenstern.
// Je Rolle eine Form aus dem Code, Farbe je Gebäudefamilie – austauschbar je Thema
// und Skin (B-17, B-18, B-27). Das Thema Dorf zeichnet stattdessen die Dorfbilder
// (`dorf.ts`). Diese Datei ist der einzige Ort, der PixiJS importiert; die
// Listenansicht bleibt gleichwertig.
import {
  Application,
  Assets,
  Container,
  Graphics,
  GraphicsContext,
  Sprite,
  Texture,
} from 'pixi.js';
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
  taktFuer,
  tickerAn,
  wolkenVersatz,
  type Bewegung,
} from './atmosphaere';
import {
  atlasBasisUrl,
  atlasBelagerungId,
  atlasBodenEintrag,
  atlasEintrag,
  atlasEintragPerId,
  atlasFensterEintrag,
  atlasHimmelId,
  atlasLaubId,
  atlasLaden,
  atlasSchneeDachId,
  atlasWetterId,
  atlasWesenId,
  atlasDatei,
  type AtlasFahne,
  type AtlasFluegel,
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
import {
  gartenBoden,
  gartenBodenKachel,
  gartenBodenTint,
  gartenGebaeude,
  gartenHoehe,
  gartenStrauch,
  gartenStrauchLagen,
  gartenSzene,
} from './garten';
import { bastionBodenKachel, bastionBodenTint } from './bastion-boden';
import {
  uwBoden,
  uwBodenKachel,
  uwBodenTint,
  uwGebaeude,
  uwHoehe,
  uwKoralle,
  uwKoralleLagen,
  uwSzene,
} from './unterwasser';
import {
  weltraumBoden,
  weltraumBodenKachel,
  weltraumBodenTint,
  weltraumGebaeude,
  weltraumHoehe,
  weltraumSzene,
} from './weltraum';
import type { Epoche } from '../../../core/bastion/epochen';
import { epocheOptik, farbeSkalieren } from './epoche-optik';
import {
  bauplatzAktiv,
  bauplatzAktivSetzen,
  bodenTiefe,
  buehneBreite,
  buehneHoehe,
  INSEL,
  feldUnter,
  himmelFuer,
  punkt,
  RAUTE_B,
  RAUTE_H,
  type BauplatzMass,
} from './iso';
import type { Jahreszeit } from './jahreszeit';
import { partikelBudget, type WetterBild } from './wetter';
import { pfuetzen, REGENBOGEN_FARBEN, schneeFlecken, wolkenSchatten } from './wetter-optik';
import { hinterhofZeichnen } from './hinterhof-szene';
import {
  bewohnerFortschritt,
  bewohnerFortschrittKey,
  bewohnerReagieren,
  bewohnerStarten,
  bewohnerTick,
  bewohnerFarbe,
  bewohnerFrame,
  bewohnerMuetze,
  atlasBewohnerId,
  type BewohnerZustand,
  type Taetigkeit,
} from './bewohner';
import { belegteFelder } from './pfad';
import { bodenLeben } from './boden-leben';
import { sekundeDesTages, wegeFelder, wegeListe } from './tagesablauf';
import { wesenReagieren, wesenStarten, wesenTick, type WesenZustand } from './wesen';
import { atlasThema, type Bildart } from './bildart';
import { geruestEbenen } from './geruest';
import { inselUmgebung } from './insel-umgebung';
import { istLandBildart } from './thema-partikel';
import {
  BildVorrat,
  bilderJeUmlauf,
  imSichtfeld,
  phasenStufe,
  stufenPhase,
  taktSchritt,
  taktZeit,
  type Rechteck,
} from './takt';
export type { Bildart } from './bildart';
export { bildartVonThema } from './bildart';
export { istLandBildart } from './thema-partikel';

export interface Farben {
  readonly boden: string;
  readonly raster: string;
  readonly linie: string;
  readonly familie: Readonly<Record<Familie, string>>;
  readonly imBau: string;
  readonly auswahl: string;
  readonly himmel: string;
  /** Kulisse dahinter (GRAFIK §13): Bühne ohne eigenen Himmel, durchsichtig */
  readonly kulisse?: boolean;
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
  /** Regenbogen am Himmel (nach Regen, aus Datum oder echtem Wetter) */
  readonly regenbogen?: boolean;
  /** Bewährungsprobe aktiv: spannender Himmel, leichter Rauch (GRAFIK §8 / G11) */
  readonly spannung?: boolean;
}

export interface Ansicht {
  /** ausgewähltes Gebäude (Instanz-ID) */
  readonly auswahl?: string;
  /** Feld, auf das gerade versetzt werden soll – mit Umriss in der Größe des Gebäudes */
  readonly ziel?: { readonly pos: Position; readonly typ: GebaeudeTyp; readonly frei: boolean };
  /** Neubau-Vorschlag (G5): freies Feld als Geist – Umriss und blasses Bild, noch nichts gebaut */
  readonly vorschlag?: { readonly pos: Position; readonly typ: GebaeudeTyp };
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
  /**
   * Die Kamera zoomt oder schwenkt gerade (GRAFIK §29): Solange das gilt, steht der Takt,
   * das Bild bleibt stehen, und nur der Browser verschiebt und vergrößert es.
   */
  setzeKameraBewegt(bewegt: boolean): void;
  /**
   * Sichtfeld der Kamera in Bühnen-Bildpunkten, mit Rand (GRAFIK §34): Fahnen, Mühlen,
   * Kräne, Wesen und Bewohner außerhalb werden nicht bewegt. Bauplatz meldet es nur bei
   * Kamera-Ruhe, gleich vor `setzeKameraBewegt(false)`, nicht bei jedem Zoom-Schritt; das
   * Sichtfeld ist eine reine Rechnung, es ändert keine Ebene im Browser.
   */
  setzeSichtfeld(r: Rechteck | undefined): void;
  /** Feld unter einem Punkt in Bildschirmkoordinaten – oder undefined außerhalb */
  feldBei(clientX: number, clientY: number): Position | undefined;
  /** Wesen unter dem Punkt – für Tippen (GRAFIK §4.4) */
  wesenBei(clientX: number, clientY: number): string | undefined;
  /** Bewohner unter dem Punkt */
  bewohnerBei(clientX: number, clientY: number): string | undefined;
  /** Kurze Reaktion auf Tippen */
  tippeWesen(id: string): void;
  tippeBewohner(id: string): BewohnerZustand | undefined;
  /** Bewohner-Zustand zur Anzeige (Name/Tätigkeit) */
  bewohnerZustand(id: string): BewohnerZustand | undefined;
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
/** Statusgeste über dem Kopf – Tätigkeit ohne Popup lesbar (Design „Danach“ J35). */
function zeichneStatusgeste(
  g: GraphicsContext,
  x: number,
  y: number,
  s: number,
  taetigkeit: Taetigkeit,
) {
  const kx = x;
  const ky = y - 14 * s;
  g.circle(kx, ky, 3.4 * s).fill({ color: '#fff8ef', alpha: 0.92 });
  g.circle(kx, ky, 3.4 * s).stroke({ width: 0.7, color: '#6a5a4a', alpha: 0.45 });
  if (taetigkeit === 'giessen') {
    g.poly([kx - 1.5 * s, ky - 0.5 * s, kx + 2 * s, ky - 1.5 * s, kx + 1 * s, ky + 1.5 * s]).fill(
      '#3a7a9a',
    );
    g.circle(kx + 1.6 * s, ky + 2 * s, 0.7 * s).fill({ color: '#5ab0d0', alpha: 0.85 });
  } else if (taetigkeit === 'kehren' || taetigkeit === 'gaertnern') {
    g.moveTo(kx, ky - 2 * s)
      .lineTo(kx, ky + 2.2 * s)
      .stroke({ width: 1.2, color: '#6a4a2a' });
    g.poly([kx - 2 * s, ky + 2.2 * s, kx + 2 * s, ky + 2.2 * s, kx, ky + 0.4 * s]).fill('#8a6a3a');
  } else if (taetigkeit === 'pflanzen') {
    g.moveTo(kx, ky + 2 * s)
      .lineTo(kx, ky - 0.5 * s)
      .stroke({ width: 1.1, color: '#3a6a2a' });
    g.ellipse(kx - 1.4 * s, ky - 1 * s, 1.3 * s, 0.8 * s).fill('#4a8a3a');
    g.ellipse(kx + 1.4 * s, ky - 1.2 * s, 1.3 * s, 0.8 * s).fill('#4a8a3a');
  } else if (taetigkeit === 'lesen' || taetigkeit === 'ordnen') {
    g.rect(kx - 2.2 * s, ky - 1.6 * s, 4.4 * s, 3.2 * s).fill('#e8e0c8');
    g.moveTo(kx, ky - 1.6 * s)
      .lineTo(kx, ky + 1.6 * s)
      .stroke({ width: 0.7, color: '#b0a888' });
  } else if (taetigkeit === 'flicken') {
    g.moveTo(kx - 1.8 * s, ky + 1.5 * s)
      .lineTo(kx + 1.8 * s, ky - 1.8 * s)
      .stroke({ width: 1.3, color: '#4a4a4a' });
    g.rect(kx + 0.8 * s, ky - 2.4 * s, 1.8 * s, 1.5 * s).fill('#6a6a6a');
  } else if (taetigkeit === 'sammeln') {
    g.ellipse(kx, ky + 0.6 * s, 2.4 * s, 1.6 * s).fill('#8a5a2a');
    g.circle(kx - 0.8 * s, ky - 0.4 * s, 0.7 * s).fill('#6aaa4a');
    g.circle(kx + 0.9 * s, ky - 0.8 * s, 0.65 * s).fill('#c45c4a');
  } else if (taetigkeit === 'wachen') {
    g.moveTo(kx, ky + 2.2 * s)
      .lineTo(kx, ky - 2.2 * s)
      .stroke({ width: 1.2, color: '#5a4a2a' });
    g.poly([kx, ky - 2.2 * s, kx + 2.2 * s, ky - 0.8 * s, kx, ky - 0.2 * s]).fill('#a03a2a');
  } else if (taetigkeit === 'schauen') {
    g.circle(kx - 1.1 * s, ky, 0.85 * s).fill('#2a2a2a');
    g.circle(kx + 1.1 * s, ky, 0.85 * s).fill('#2a2a2a');
  } else {
    // ruhen: kleiner Mond
    g.circle(kx, ky, 1.6 * s).fill('#c9b88a');
    g.circle(kx + 0.7 * s, ky - 0.4 * s, 1.3 * s).fill('#fff8ef');
  }
}

function zeichneBewohner(g: Graphics, b: BewohnerZustand, jetzt: number) {
  const s = jetzt < b.reactBis ? 1.1 : 1;
  const x = b.x;
  const y = b.y;
  const farbe = bewohnerFarbe(b.art);
  zeichneStatusgeste(g.context, x, y, s, b.taetigkeit);
  // Körper + Mütze (Form je Art leicht unterscheidbar)
  g.ellipse(x, y, 4.5 * s, 3 * s).fill(farbe);
  if (b.art === 'imker') {
    // flacher Schleierhut
    g.ellipse(x, y - 6.5 * s, 5 * s, 2 * s).fill(bewohnerMuetze(b.art));
    g.rect(x - 4.5 * s, y - 6 * s, 9 * s, 3 * s).fill({ color: '#f5f0c8', alpha: 0.45 });
  } else if (b.art === 'handwerk') {
    // flache Kappe
    g.ellipse(x, y - 5.5 * s, 4.5 * s, 1.8 * s).fill(bewohnerMuetze(b.art));
  } else if (b.art === 'torhueter') {
    // runde Wächterkappe
    g.ellipse(x, y - 6 * s, 4 * s, 2.5 * s).fill(bewohnerMuetze(b.art));
  } else {
    g.poly([x - 4 * s, y - 4 * s, x, y - 11 * s, x + 4 * s, y - 4 * s]).fill(bewohnerMuetze(b.art));
  }
  g.circle(x, y - 3.5 * s, 2.2 * s).fill('#f0d8c0');
  // Tätigkeit am Körper: Gießkanne / Besen / Buch / Blick / Werkzeug / Korb
  if (b.taetigkeit === 'giessen') {
    const wip = Math.sin(b.phase) * 2;
    g.poly([x + 5 * s, y - 2 * s, x + 9 * s, y - 1 * s + wip, x + 7 * s, y + 1 * s]).fill(
      '#5a8aaa',
    );
    g.circle(x + 8 * s, y + 2 * s + wip, 0.8 * s).fill({ color: '#6ab0d0', alpha: 0.7 });
  } else if (
    b.taetigkeit === 'kehren' ||
    b.taetigkeit === 'gaertnern' ||
    b.taetigkeit === 'pflanzen'
  ) {
    const wip = Math.sin(b.phase) * 3;
    g.moveTo(x - 5 * s, y - 1 * s)
      .lineTo(x - 8 * s + wip, y + 4 * s)
      .stroke({ width: 1.5, color: '#8a6a3a' });
    if (b.taetigkeit === 'pflanzen') {
      g.circle(x - 7 * s + wip, y + 4.5 * s, 1.2 * s).fill('#4a8a3a');
    }
  } else if (b.taetigkeit === 'lesen' || b.taetigkeit === 'ordnen') {
    g.rect(x + 3 * s, y - 5 * s, 5 * s, 4 * s).fill('#e8e0c8');
    if (b.taetigkeit === 'ordnen') {
      g.rect(x + 4 * s, y - 7 * s, 4 * s, 2 * s).fill('#d0c8a8');
    }
  } else if (b.taetigkeit === 'flicken') {
    const wip = Math.sin(b.phase) * 2;
    g.moveTo(x + 4 * s, y - 2 * s)
      .lineTo(x + 8 * s, y - 4 * s + wip)
      .stroke({ width: 1.6, color: '#5a5a5a' });
    g.rect(x + 7 * s, y - 5.5 * s + wip, 2.5 * s, 2 * s).fill('#7a7a7a');
  } else if (b.taetigkeit === 'sammeln') {
    g.ellipse(x + 6 * s, y + 1 * s, 3 * s, 2 * s).fill('#8a5a2a');
    g.circle(x + 5 * s, y, 0.9 * s).fill('#6aaa4a');
    g.circle(x + 7 * s, y - 0.5 * s, 0.8 * s).fill('#c45c4a');
  } else if (b.taetigkeit === 'schauen' || b.taetigkeit === 'wachen') {
    g.circle(x + 1.2 * s, y - 4 * s, 0.6 * s).fill('#2a2a2a');
    g.circle(x - 1.2 * s, y - 4 * s, 0.6 * s).fill('#2a2a2a');
    if (b.taetigkeit === 'wachen') {
      g.moveTo(x - 5 * s, y + 2 * s)
        .lineTo(x - 5 * s, y - 8 * s)
        .stroke({ width: 1.4, color: '#6a5a3a' });
    }
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

/** Gestrichelter Boden-Umriss für geplante Bauten (Geister-Silhouette). */
/**
 * Gerüst für ein laufendes Bauvorhaben (G4, FOKUS.md): Es wächst in Abschnitten statt
 * eines Fortschrittsbalkens. Ein Abschnitt je Bauschritt (2 bis 6 Ebenen); fertige
 * Ebenen sind kräftig, offene nur angedeutet. Ruhiges Bild ohne Bewegung (R1–R7).
 */
function geruest(
  g: Graphics,
  pos: Position,
  typ: GebaeudeTyp,
  hoeheZiel: number,
  bedarf: number,
  fortschritt: number,
) {
  const [w, t] = KATALOG[typ].groesse;
  // Eng am Gebäude: Große Grundflächen (Bergfried 3×3) sind breiter als der Körper darauf
  const einzug = Math.max(0, Math.min(w, t) / 2 - 1) - 0.06;
  const e = ecken(pos.x, pos.y, w, t, einzug);
  const { ebenen, fertig } = geruestEbenen(bedarf, fortschritt);
  const holz = '#966840';
  const dunkel = '#5c3e28';
  const stark = (k: number) => (k <= fertig ? 1 : 0.38);
  const stangen = [e.links, e.vorne, e.rechts];
  // Stangen: fertiger Teil kräftig, der Rest angedeutet
  const hFertig = (hoeheZiel * fertig) / ebenen;
  for (const p of stangen) {
    if (hFertig > 0)
      g.moveTo(p.x, p.y)
        .lineTo(p.x, p.y - hFertig)
        .stroke({ width: 2.4, color: dunkel, alpha: 1, cap: 'round' });
    g.moveTo(p.x, p.y - hFertig)
      .lineTo(p.x, p.y - hoeheZiel)
      .stroke({ width: 2, color: dunkel, alpha: 0.38, cap: 'round' });
  }
  for (let k = 1; k <= ebenen; k++) {
    const z = (hoeheZiel * k) / ebenen;
    const a = stark(k);
    // Laufbretter vorne links und vorne rechts
    g.moveTo(e.links.x, e.links.y - z)
      .lineTo(e.vorne.x, e.vorne.y - z)
      .lineTo(e.rechts.x, e.rechts.y - z)
      .stroke({ width: 3, color: holz, alpha: a, cap: 'round', join: 'round' });
    // Strebe je fertiger Ebene auf der linken Seite
    if (k <= fertig) {
      const z0 = (hoeheZiel * (k - 1)) / ebenen;
      g.moveTo(e.links.x, e.links.y - z0)
        .lineTo(e.vorne.x, e.vorne.y - z)
        .stroke({ width: 1.6, color: dunkel, alpha: 0.9 });
    }
  }
}

function geisterUmriss(g: Graphics, pos: Position, typ: GebaeudeTyp, farbe: string | number) {
  const [w, t] = KATALOG[typ].groesse;
  const e = ecken(pos.x, pos.y, w, t, 0.1);
  const eckenListe = [e.hinten, e.rechts, e.vorne, e.links] as const;
  for (let i = 0; i < eckenListe.length; i++) {
    const a = eckenListe[i];
    const b = eckenListe[(i + 1) % eckenListe.length];
    if (!a || !b) continue;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const schritte = Math.max(2, Math.floor(len / 7));
    for (let s = 0; s < schritte; s += 2) {
      const t0 = s / schritte;
      const t1 = Math.min(1, (s + 1) / schritte);
      g.moveTo(a.x + dx * t0, a.y + dy * t0)
        .lineTo(a.x + dx * t1, a.y + dy * t1)
        .stroke({ width: 2.2, color: farbe, alpha: 0.85, cap: 'round' });
    }
  }
}

/** Rauch-Plätze bei Bewährungsprobe – feste Lagen, kein Zufall (GRAFIK §8 / P6). */
const RAUCH_PLAETZE = [
  { x: 120, y: 90, s: 1.2, teil: 'rauch_1' as const },
  { x: 280, y: 70, s: 1, teil: 'rauch_2' as const },
  { x: 420, y: 100, s: 0.9, teil: 'rauch_3' as const },
] as const;

/** Leichter Rauch: Atlas-Sprites (P6) oder Code-Ellipsen – keine Truppen. */
function rauchZeichnen(
  lage: Container,
  f: Farben,
  manifest: AtlasManifest | null,
  texturen: Map<string, Texture>,
) {
  if (!f.spannung) return;
  let atlasOk = true;
  for (const p of RAUCH_PLAETZE) {
    const eintrag = atlasEintragPerId(manifest, atlasBelagerungId(p.teil));
    const tex = eintrag ? texturen.get(eintrag.id) : undefined;
    if (!eintrag || !tex) {
      atlasOk = false;
      break;
    }
  }
  if (atlasOk) {
    for (const p of RAUCH_PLAETZE) {
      const eintrag = atlasEintragPerId(manifest, atlasBelagerungId(p.teil));
      const tex = eintrag ? texturen.get(eintrag.id) : undefined;
      if (!eintrag || !tex) continue;
      const spr = new Sprite(tex);
      spr.anchor.set(eintrag.anker.x, eintrag.anker.y);
      spr.width = (eintrag.pixel.w / 2) * p.s;
      spr.height = (eintrag.pixel.h / 2) * p.s;
      spr.position.set(p.x, p.y);
      spr.alpha = 0.85;
      lage.addChild(spr);
    }
    return;
  }
  const g = new Graphics();
  for (const p of RAUCH_PLAETZE) {
    g.ellipse(p.x, p.y, 28 * p.s, 10 * p.s).fill({ color: f.wolke, alpha: 0.35 });
    g.ellipse(p.x + 16 * p.s, p.y - 6 * p.s, 18 * p.s, 8 * p.s).fill({
      color: f.wolke,
      alpha: 0.25,
    });
  }
  lage.addChild(g);
}

/** Spannungs-Himmel: Atlas-Dunst (P6) oder Code-Rechteck (G11). */
function spannungHimmelZeichnen(
  lage: Container,
  f: Farben,
  manifest: AtlasManifest | null,
  texturen: Map<string, Texture>,
) {
  if (!f.spannung) return;
  const eintrag = atlasEintragPerId(manifest, atlasBelagerungId('himmel'));
  const tex = eintrag ? texturen.get(eintrag.id) : undefined;
  if (eintrag && tex) {
    // drei weiche Flecken über die Bühne statt einer harten Vollfläche
    for (const [x, y, s] of [
      [buehneBreite() * 0.25, 80, 1.5],
      [buehneBreite() * 0.55, 120, 1.7],
      [buehneBreite() * 0.8, 70, 1.3],
    ] as const) {
      const spr = new Sprite(tex);
      spr.anchor.set(eintrag.anker.x, eintrag.anker.y);
      spr.width = (eintrag.pixel.w / 2) * s;
      spr.height = (eintrag.pixel.h / 2) * s;
      spr.position.set(x, y);
      spr.alpha = 0.9;
      lage.addChild(spr);
    }
    return;
  }
  const spannung = new Graphics();
  spannung.rect(0, 0, buehneBreite(), buehneHoehe()).fill({ color: '#4a3a38', alpha: 0.18 });
  lage.addChild(spannung);
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

/**
 * Schnee-Auflage aus Atlas auf Gebäude-Fußpunkt (Winter). Seit G3 eine Verwehung an den
 * Vorderkanten des Fußabdrucks (`auflage/schnee_dach_*`): Die Dächer sind je Stufe
 * verschieden, der Fuß nicht. Darum genau auf dem Fußpunkt, ohne Versatz.
 */
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
  spr.position.set(fuss.x, fuss.y);
  spr.zIndex = tiefe * 10 + 1;
  gebaeude.addChild(spr);
}

/**
 * Abend-Fenster-Layer deckungsgleich auf dem Gebäude-Sprite
 * (GRAFIK-SPRITES.md §3 `*_fenster.png`, GRAFIK.md §2 erleuchtete Fenster).
 */
function fensterAbendSprite(
  gebaeude: Container,
  thema: Thema,
  epoche: number,
  typ: GebaeudeTyp,
  stufe: number,
  pos: Position,
  tiefe: number,
  manifest: AtlasManifest | null,
  texturen: Map<string, Texture>,
): void {
  const eintrag = atlasFensterEintrag(manifest, thema, epoche, typ, stufe);
  const tex = eintrag ? texturen.get(eintrag.id) : undefined;
  if (!eintrag || !tex) return;
  const [bw, bt] = KATALOG[typ].groesse;
  const fuss = punkt(pos.x + bw, pos.y + bt);
  // Licht aus den Fenstern fällt warm auf den Boden vor dem Gebäude (Wunsch PV: Licht)
  const schein = new Graphics();
  const m = punkt(pos.x + bw / 2 + 0.5, pos.y + bt / 2 + 0.5);
  for (const f of [1, 0.72, 0.48, 0.28]) {
    schein
      .ellipse(m.x, m.y, (bw * RAUTE_B * 0.46 + 8) * f, (bt * RAUTE_H * 0.46 + 4) * f)
      .fill({ color: '#ffcf7a', alpha: 0.07 });
  }
  schein.blendMode = 'add';
  schein.zIndex = tiefe * 10 - 1;
  gebaeude.addChild(schein);
  const spr = new Sprite(tex);
  spr.anchor.set(eintrag.anker.x, eintrag.anker.y);
  spr.width = eintrag.pixel.w / 2;
  spr.height = eintrag.pixel.h / 2;
  spr.position.set(fuss.x, fuss.y);
  spr.zIndex = tiefe * 10 + 2;
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
  // Raster nur noch angedeutet (P85); die Trampelpfade sind entfallen (PV 02.11.2026: Linien zwischen den Gebäuden)
  for (let i = 0; i <= W; i += Math.max(2, Math.floor(W / 4))) {
    const a = punkt(i, 0);
    const b = punkt(i, T);
    g.moveTo(a.x, a.y).lineTo(b.x, b.y);
  }
  for (let j = 0; j <= T; j += Math.max(2, Math.floor(T / 4))) {
    const a = punkt(0, j);
    const b = punkt(W, j);
    g.moveTo(a.x, a.y).lineTo(b.x, b.y);
  }
  g.stroke({ width: 1, color: f.raster, alpha: 0.28 });
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

/**
 * Texturen-Vorrat, der sich merkt, welche IDs die Bühne beim Zeichnen tatsächlich abfragt.
 * Nur diese bekommen später ein scharfes @2x-Bild (Absturz beim Zoomen auf dem iPhone,
 * PV 03.11.2026: alle Gebäude aller Stufen in HD waren rund 76 MB Grafikspeicher).
 */
class TexturVorrat extends Map<string, Texture> {
  readonly gebraucht = new Set<string>();
  override get(id: string): Texture | undefined {
    this.gebraucht.add(id);
    return super.get(id);
  }
}

/** Farbe `#rrggbb` mit dem Faktor `f` aufhellen oder abdunkeln (begrenzt auf 0 … 255) */
function heller(farbe: string, f: number): number {
  const n = parseInt(farbe.slice(1, 7), 16);
  const k = (v: number) => Math.min(255, Math.round(v * f));
  return (k((n >> 16) & 255) << 16) | (k((n >> 8) & 255) << 8) | k(n & 255);
}

/** Farbe der ausgetretenen Wege je Thema; im Winter festgetretener Schnee */
const WEG_FARBE: Readonly<Record<string, string>> = {
  insel: '#a9b56c',
  dorf: '#a79a66',
  garten: '#b4b48a',
  winter: '#dfe5ec',
};

/** Texturen aus dem Manifest laden (eigene Adresse); Fehler → Eintrag fehlt, Fallback. */
async function atlasTexturenLaden(
  manifest: AtlasManifest | null,
  braucht: (id: string) => boolean = () => true,
): Promise<TexturVorrat> {
  const map = new TexturVorrat();
  if (!manifest || manifest.eintraege.length === 0) return map;
  const basis = atlasBasisUrl();
  const liste = manifest.eintraege.filter((e) => braucht(e.id));
  await Promise.all(
    liste.map(async (e) => {
      try {
        // Timeout: offline/ohne Cache soll die Bühne nicht hängen (Code-Fallback)
        // Erst alles in einfacher Größe; scharfe Bilder zieht hdNachziehen nur für Sichtbares nach
        const datei = atlasDatei(e, 1);
        const geladen = Assets.load(basis + datei) as Promise<Texture>;
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

/** Welche Atlas-IDs die Bühne braucht (P0–P6: Himmel/Wetter/Belagerung + Themen). */
/** Bilder je Jahreszeit (G13): `<id>_<jahreszeit>`; der Sommer ist das Bild ohne Zusatz */
const JAHRESZEIT_ENDUNG = /_(fruehling|herbst|winter)$/;
/** Umgebungsbilder mit Laubkrone: dort fällt im Herbst Laub */
const KRONE_LAUB = /\/umgebung\/(baum_|strauch_)/;

/** Umgebungsbild in der passenden Jahreszeit, sonst das Sommerbild */
function umgebungEintrag(atlas: AtlasManifest | null, id: string, jz: Jahreszeit | undefined) {
  if (jz && jz !== 'sommer') {
    const e = atlasEintragPerId(atlas, `${id}_${jz}`);
    if (e) return e;
  }
  return atlasEintragPerId(atlas, id);
}

function atlasBrauchtId(art: Bildart, id: string, jz?: Jahreszeit): boolean {
  // Nur die Bilder der aktuellen Jahreszeit laden
  const endung = JAHRESZEIT_ENDUNG.exec(id);
  if (endung && endung[1] !== jz) return false;
  if (
    id.startsWith('himmel/') ||
    id.startsWith('wetter/') ||
    id.startsWith('auflage/') ||
    id.startsWith('belagerung/') ||
    id.startsWith('bewohner/')
  )
    return true;
  // Hinterhof-Objekte (P4) für das jeweilige Thema
  if (art === 'dorf' && id.startsWith('hinterhof/dorf/')) return true;
  if (art === 'garten' && id.startsWith('hinterhof/garten/')) return true;
  if (art === 'insel' && id.startsWith('hinterhof/bastion/')) return true;
  if (art === 'unterwasser' && id.startsWith('hinterhof/unterwasser/')) return true;
  if (art === 'weltraum' && id.startsWith('hinterhof/weltraum/')) return true;
  if (art === 'dorf')
    return id.startsWith('dorf/') || id.startsWith('boden/dorf/') || id.startsWith('wesen/dorf/');
  if (art === 'garten')
    return (
      id.startsWith('garten/') || id.startsWith('boden/garten/') || id.startsWith('wesen/garten/')
    );
  if (art === 'insel')
    return (
      id.startsWith('bastion/') ||
      id.startsWith('boden/bastion/') ||
      id.startsWith('wesen/bastion/')
    );
  if (art === 'unterwasser')
    return (
      id.startsWith('unterwasser/') ||
      id.startsWith('boden/unterwasser/') ||
      id.startsWith('wesen/unterwasser/')
    );
  if (art === 'weltraum')
    return (
      id.startsWith('weltraum/') ||
      id.startsWith('boden/weltraum/') ||
      id.startsWith('wesen/weltraum/')
    );
  return false;
}

/** Graphics-Kind in einer Boden-Lage anlegen (Code-Fallback zeichnet darauf). */
function bodenAlsGraphics(lage: Container): Graphics {
  const g = new Graphics();
  lage.addChild(g);
  return g;
}

const BODEN_KACHELN: readonly BodenKachel[] = ['flaeche', 'rand', 'flaeche_b', 'flaeche_hell'];

/**
 * Boden aus Atlas-Kacheln (Dorf/Garten/Bastion/UW/Weltraum, GRAFIK-SPRITES).
 * true = gezeichnet; false = Aufrufer soll Code-Boden nutzen.
 */
function bodenAusAtlas(
  lage: Container,
  thema: Thema,
  manifest: AtlasManifest | null,
  texturen: Map<string, Texture>,
  abend: boolean,
  kachelFn: (x: number, y: number, breite: number, tiefe: number) => BodenKachel,
  tintFn: (abend: boolean) => number,
  /** P5: Epoche für Boden-Atlas; Fallback auf niedrigere (atlasBodenEintrag) */
  epoche: number = 1,
): boolean {
  if (!manifest) return false;
  const texProKachel = new Map<BodenKachel, { tex: Texture; w: number; h: number }>();
  for (const k of BODEN_KACHELN) {
    const eintrag = atlasBodenEintrag(manifest, thema, epoche, k);
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
  const tint = tintFn(abend);
  const { breite, tiefe } = bauplatzAktiv();
  for (let y = -1; y <= tiefe; y++) {
    for (let x = -1; x <= breite; x++) {
      const gewaehlt = kachelFn(x, y, breite, tiefe);
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
  const aufloesung = Math.min(4, (globalThis.devicePixelRatio || 1) * 2);
  const app = new Application();
  await app.init({
    width: buehneBreite(),
    height: buehneHoehe(),
    // Mit Kulisse durchsichtig: Schwarz mit Deckkraft 0, sonst mischt der Browser
    // die Himmelfarbe aufhellend hinein (vormultiplizierte Deckkraft)
    background: farben.kulisse ? '#000000' : farben.himmel,
    backgroundAlpha: farben.kulisse ? 0 : 1,
    // Kantenglättung nur bei einfacher Auflösung: Ab 2,5-facher Auflösung glättet das
    // Verkleinern ohnehin, und die Glättung bräuchte auf dem iPhone einen vierfachen
    // Bildpuffer (bei 3264 × 2544 Bildpunkten rund 100 MB, Absturz beim Zoomen, GRAFIK §24)
    antialias: aufloesung < 2.5,
    // doppelte Auflösung, damit das Bild auch beim Zoom (bis 200 %) scharf bleibt
    resolution: aufloesung,
    autoDensity: true,
    // keine Erweiterungen nachladen, die wir nicht brauchen (Größe, A3)
    manageImports: false,
    preference: 'webgl',
    // Den Ticker startet die Bühne selbst (`taktSync`, GRAFIK §29): nur wenn es etwas zu
    // bewegen gibt und die Kamera ruht, sonst zeichnet sie Einzelbilder bei Bedarf
    autoStart: false,
  });
  app.canvas.style.inlineSize = '100%';
  app.canvas.style.blockSize = 'auto';
  app.canvas.style.display = 'block';
  ziel.append(app.canvas);

  // P1 Himmel/Wetter für alle Themen; Gebäude/Boden/Wesen/Hinterhof aus Atlas (P0–P5).
  // Bauplatz tauscht atomar (altes Canvas bleibt bis diese Promise fertig ist).
  const atlas: AtlasManifest | null = await atlasLaden();
  const texturen = await atlasTexturenLaden(atlas, (id) =>
    atlasBrauchtId(art, id, farben.jahreszeit),
  );

  const wetterBild: WetterBild = farben.wetter ?? 'klar';
  // Himmel / Boden / Overlay getrennt: Boden kann Atlas-Sprites sein
  const hintergrund = new Container();
  const himmelLage = new Container();
  const bodenLage = new Container();
  const overlayLage = new Container();
  hintergrund.addChild(himmelLage, bodenLage, overlayLage);
  // Mit Kulisse kein Gestirn über dem Meer: Tageszeit zeigt die Kulisse (GRAFIK §13)
  if (!farben.kulisse && (wetterBild === 'klar' || wetterBild === 'bewoelkt')) {
    gestirnZeichnen(himmelLage, farben, atlas, texturen);
  }
  // Boden je Epoche (P5/G3): neu bauen, sobald die Bühne eine andere Epoche zeichnet
  let bodenEpoche = 0;
  const bodenBauen = (epoche: number) => {
    if (epoche === bodenEpoche) return;
    bodenEpoche = epoche;
    for (const k of bodenLage.removeChildren()) k.destroy();
    if (art === 'dorf') {
      const atlasWiese = bodenAusAtlas(
        bodenLage,
        'dorf',
        atlas,
        texturen,
        farben.abend,
        dorfBodenKachel,
        dorfBodenTint,
        epoche,
      );
      if (!atlasWiese) dorfWiese(stiftVon(bodenAlsGraphics(bodenLage)), farben.abend);
    } else if (art === 'garten') {
      const atlasRasen = bodenAusAtlas(
        bodenLage,
        'garten',
        atlas,
        texturen,
        farben.abend,
        gartenBodenKachel,
        gartenBodenTint,
        epoche,
      );
      if (!atlasRasen) gartenBoden(stiftVon(bodenAlsGraphics(bodenLage)), farben.abend);
    } else if (art === 'unterwasser') {
      const atlasSand = bodenAusAtlas(
        bodenLage,
        'unterwasser',
        atlas,
        texturen,
        farben.abend,
        uwBodenKachel,
        uwBodenTint,
        epoche,
      );
      if (!atlasSand) uwBoden(stiftVon(bodenAlsGraphics(bodenLage)), farben.abend);
    } else if (art === 'weltraum') {
      const atlasPlatt = bodenAusAtlas(
        bodenLage,
        'weltraum',
        atlas,
        texturen,
        farben.abend,
        weltraumBodenKachel,
        weltraumBodenTint,
        epoche,
      );
      if (!atlasPlatt) weltraumBoden(stiftVon(bodenAlsGraphics(bodenLage)), farben.abend);
    } else {
      const atlasBastion = bodenAusAtlas(
        bodenLage,
        'bastion',
        atlas,
        texturen,
        farben.abend,
        bastionBodenKachel,
        bastionBodenTint,
        epoche,
      );
      if (!atlasBastion) insel(bodenAlsGraphics(bodenLage), farben);
    }
  };
  bodenBauen(1);
  // Wetter auf dem Boden (Auftrag Grafik Punkt 2): Pfützen-Glanz, liegender Schnee
  const bodenWetter = new Graphics();
  hintergrund.addChildAt(bodenWetter, hintergrund.getChildIndex(bodenLage) + 1);
  const platzJetzt = bauplatzAktiv();
  if (wetterBild === 'regen' || wetterBild === 'sturm') {
    for (const { pos, groesse } of pfuetzen(platzJetzt.breite, platzJetzt.tiefe)) {
      const m = punkt(pos.x + 0.5, pos.y + 0.5);
      const rx = (groesse * RAUTE_B) / 2;
      const ry = (groesse * RAUTE_H) / 2;
      bodenWetter.ellipse(m.x, m.y, rx, ry).fill({ color: '#3c5a70', alpha: 0.22 });
      bodenWetter.ellipse(m.x, m.y, rx * 0.85, ry * 0.75).fill({ color: '#d6e8f2', alpha: 0.32 });
      bodenWetter
        .ellipse(m.x + rx * 0.25, m.y - ry * 0.2, rx * 0.3, ry * 0.18)
        .fill({ color: '#ffffff', alpha: 0.45 });
    }
  } else if (wetterBild === 'schnee') {
    const ecke = (x: number, y: number) => punkt(x, y);
    const r = [
      ecke(0, 0),
      ecke(platzJetzt.breite, 0),
      ecke(platzJetzt.breite, platzJetzt.tiefe),
      ecke(0, platzJetzt.tiefe),
    ];
    bodenWetter.poly(r.flatMap((q) => [q.x, q.y])).fill({ color: '#f2f6fa', alpha: 0.42 });
    for (const { pos, groesse } of schneeFlecken(platzJetzt.breite, platzJetzt.tiefe)) {
      const m = punkt(pos.x + 0.5, pos.y + 0.5);
      bodenWetter
        .ellipse(m.x, m.y, (groesse * RAUTE_B) / 2, (groesse * RAUTE_H) / 2)
        .fill({ color: '#ffffff', alpha: 0.5 });
    }
  }
  // Jahreszeit auf dem Boden (Wunsch PV 03.11.2026): passt zur Kulisse ringsherum –
  // Frühling frisch, Herbst warm und trockener, Winter mit Raureif und etwas Schnee
  const jzBoden = farben.jahreszeit;
  if (istLandBildart(art) && jzBoden && jzBoden !== 'sommer' && wetterBild !== 'schnee') {
    // mit dem Rand der Insel (ein gutes halbes Feld rundherum)
    const r = 0.6;
    const flaeche = [
      punkt(-r, -r),
      punkt(platzJetzt.breite + r, -r),
      punkt(platzJetzt.breite + r, platzJetzt.tiefe + r),
      punkt(-r, platzJetzt.tiefe + r),
    ].flatMap((q) => [q.x, q.y]);
    const ton = {
      fruehling: ['#d2f0a0', 0.12],
      herbst: ['#c8923a', 0.36],
      winter: ['#eef3f6', 0.4],
    }[jzBoden] as [string, number];
    bodenWetter.poly(flaeche).fill({ color: ton[0], alpha: ton[1] });
    if (jzBoden === 'winter')
      for (const { pos, groesse } of schneeFlecken(platzJetzt.breite, platzJetzt.tiefe)) {
        const m = punkt(pos.x + 0.5, pos.y + 0.5);
        bodenWetter
          .ellipse(m.x, m.y, (groesse * RAUTE_B) / 2, (groesse * RAUTE_H) / 2)
          .fill({ color: '#ffffff', alpha: 0.4 });
      }
  }
  // Regenbogen über der Insel, wenn keine Kulisse ihn zeigt (sanft, R1)
  if (farben.regenbogen && !farben.kulisse) {
    const bogen = new Graphics();
    const cx = buehneBreite() * 0.62;
    const cy = himmelFuer(platzJetzt) + 40;
    const r0 = buehneBreite() * 0.34;
    REGENBOGEN_FARBEN.forEach((farbe, i) => {
      bogen
        .arc(cx, cy, r0 - i * 5, Math.PI, 2 * Math.PI)
        .stroke({ width: 5, color: farbe, alpha: 0.28 });
    });
    himmelLage.addChild(bogen);
  }
  rauchZeichnen(overlayLage, farben, atlas, texturen);
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
  spannungHimmelZeichnen(overlayLage, farben, atlas, texturen);
  const wolkenLage = new Container();
  /**
   * Mit Kulisse liegt das Wetter als eigene Schicht über dem ganzen Bild (GRAFIK §15.1):
   * dann keine kleinen Wolken, Tropfen, Flocken und Schatten mehr direkt über der Insel
   * (Wunsch PV 03.11.2026). Was auf der Insel liegt (Pfützen, Schnee, Laub), bleibt.
   */
  const wetterUeberAllem = farben.kulisse === true && istLandBildart(art);
  // Wolken nur über Land; unter Wasser und im Weltraum gibt es keine (Grafik Punkt 3)
  if (istLandBildart(art) && !wetterUeberAllem)
    wolkenZeichnen(wolkenLage, farben, wetterBild, atlas, texturen);
  const gebaeude = new Container();
  gebaeude.sortableChildren = true;
  // Pivot in der Bühnenmitte, damit Aufstellen von der Mitte her wächst
  gebaeude.pivot.set(buehneBreite() / 2, buehneHoehe() / 2);
  gebaeude.position.set(buehneBreite() / 2, buehneHoehe() / 2);
  const partikelLage = new Container();
  const wesenLage = new Container();
  const bewohnerLage = new Container();
  // Sturm: Wolkenschatten ziehen über Insel und Gebäude; Regen: nasse, dunklere Dächer
  const schattenLage = new Graphics();
  const schattenZeichnen = (zeit: number) => {
    schattenLage.clear();
    if (wetterBild !== 'sturm' || wetterUeberAllem) return;
    for (const w of wolkenSchatten(zeit, buehneBreite(), buehneHoehe(), tickerAn(bewegung))) {
      for (const f of [1, 0.75, 0.5]) {
        schattenLage.ellipse(w.x, w.y, w.rx * f, w.ry * f).fill({ color: '#1c2430', alpha: 0.05 });
      }
    }
  };
  if (wetterBild === 'regen' || wetterBild === 'sturm') gebaeude.tint = 0xd2d8e2;
  app.stage.addChild(
    hintergrund,
    wolkenLage,
    gebaeude,
    schattenLage,
    wesenLage,
    bewohnerLage,
    partikelLage,
  );
  let wesen: WesenZustand[] = [];
  let bewohner: BewohnerZustand[] = [];
  let letzteWesenZahl = -1;
  let letzteBewohnerKey = '';
  let bewohnerF: ReturnType<typeof bewohnerFortschritt> | undefined;
  let belegt = belegteFelder([]);
  let letzteBauwerke: Bastion['bauwerke'] = [];
  let tickerZuletzt = performance.now();
  let zerstoert = false;
  /** Die Kamera bewegt sich gerade (Geste oder Kamerafahrt) – der Takt steht (GRAFIK §29) */
  let kameraBewegt = false;
  /** Ob der eigene Rückruf am Pixi-Ticker hängt */
  let tickerAngehaengt = false;
  let bildAngefordert = false;
  /**
   * Ein Einzelbild zeichnen, sobald der Browser bereit ist – nur, wenn der Ticker steht.
   * Läuft er, zeichnet er ohnehin. Mehrere Anforderungen je Bild werden zu einer.
   */
  const bildAnfordern = () => {
    if (bildAngefordert || zerstoert) return;
    bildAngefordert = true;
    requestAnimationFrame(() => {
      bildAngefordert = false;
      if (zerstoert || app.ticker.started) return;
      app.render();
    });
  };

  /** Gezeichnete Gebäude für das Antippen: Umriss auf dem Bild → Platz des Gebäudes */
  let treffer: { pos: Position; umriss: number[] }[] = [];
  let bewegung: Bewegung = bewegungStart;
  schattenZeichnen(0);
  let bekannt = new Set<string>();
  /** Stufe je Gebäude beim letzten Zeichnen: Ein Ausbau soll wie ein Neubau sanft erscheinen (G4) */
  let bekannteStufen = new Map<string, number>();
  let ersterZug = true;
  let aufstellStart = 0;
  /** Solange kleiner 1, wächst die Gebäude-Lage noch (Aufstell-Effekt). */
  let aufstellAktiv = false;

  type Tropfen = { x: number; y: number; v: number; spr?: Sprite; bis?: number; q?: number };
  /**
   * Herbstlaub fällt nur unter Bäumen (Wunsch PV 03.11.2026): Kronen, die beim Zeichnen
   * gemerkt werden – Mitte der Krone und wie tief ein Blatt bis zum Boden fällt.
   */
  let laubQuellen: { x: number; y: number; h: number }[] = [];
  /** Rauch: Stellen über Dächern, aus denen ruhige Wölkchen aufsteigen */
  let rauchQuellen: { x: number; y: number }[] = [];
  const rauchLage = new Graphics();
  app.stage.addChild(rauchLage);
  const RAUCH_WOELKCHEN = 6;
  const schornsteinZeichnen = (jetzt: number) => {
    rauchLage.clear();
    if (rauchQuellen.length === 0 || bewegung === 'aus') return;
    // Wind: bei Sturm schräg und schnell, sonst langsam nach oben
    const wind = wetterBild === 'sturm' ? 2.6 : wetterBild === 'regen' ? 0.9 : 0.4;
    const dauer = wetterBild === 'sturm' ? 2600 : 5200;
    const ton = farben.abend ? '#8e96a6' : '#c9cfd6';
    rauchQuellen.forEach((q, qi) => {
      for (let k = 0; k < RAUCH_WOELKCHEN; k++) {
        const t = (((jetzt / dauer + k / RAUCH_WOELKCHEN + qi * 0.37) % 1) + 1) % 1;
        const x = q.x + t * 26 * wind + Math.sin((t + qi) * 5) * 2;
        const y = q.y - t * 46;
        rauchLage
          .circle(x, y, 2.5 + t * 7)
          .fill({ color: ton, alpha: 0.5 * (1 - t) * Math.min(1, t * 6) });
      }
    });
  };
  const laubNeu = (t: Tropfen, i: number) => {
    const n = laubQuellen.length;
    if (n === 0) return;
    t.q = ((t.q ?? i) + 3) % n;
    const q = laubQuellen[t.q];
    if (!q) return;
    t.x = q.x + (((i * 37) % 21) - 10) * 0.9;
    t.y = q.y + ((i * 11) % 7);
    t.bis = q.y + q.h;
  };
  const leicht = bewegungStart === 'leicht';
  const jahreszeit = farben.jahreszeit;
  // Herbstlaub nur über Land (Dorf/Garten/Bastion) – nicht Unterwasser/Weltraum (P3 Feinschliff)
  const landThema = istLandBildart(art);
  const laubBudget =
    jahreszeit === 'herbst' && bewegungStart !== 'aus' && landThema ? (leicht ? 4 : 8) : 0;
  const wetterBudget = wetterUeberAllem ? 0 : partikelBudget(wetterBild, leicht);
  const budget = wetterBudget + laubBudget;
  const partikelArt: 'regen' | 'schnee' | 'nebel' | 'laub' | 'keine' =
    wetterBudget === 0
      ? laubBudget > 0
        ? 'laub'
        : 'keine'
      : wetterBild === 'schnee'
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
          : wetterBild === 'sturm'
            ? 0.15 + (i % 5) * 0.04
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
        // erst sichtbar, wenn es unter einer Krone startet (Ticker)
        spr.visible = false;
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
      } else if (wetterBild === 'sturm') {
        // Windstrich: kurz, waagrecht, leicht geschwungen
        partikelGfx
          .moveTo(t.x, t.y)
          .quadraticCurveTo(t.x + 9, t.y - 2, t.x + 20, t.y)
          .stroke({ width: 1.2, color: '#f4f8fb', alpha: 0.5 });
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

  /**
   * Wesen am Boden und Bewohner stehen zwischen den Gebäuden: Sie liegen in derselben,
   * nach Tiefe sortierten Ebene (`gebaeude`), sonst läuft der Fuchs hinter dem Turm
   * über die Burg.
   */
  const amBoden: Container[] = [];
  const bodenWeg = () => {
    for (const c of amBoden.splice(0)) {
      if (!c.destroyed) {
        c.parent?.removeChild(c);
        c.destroy();
      }
    }
  };
  const aufBoden = (c: Container, fussY: number, zusatz: number) => {
    c.zIndex = bodenTiefe(fussY) * 10 + zusatz;
    gebaeude.addChild(c);
    amBoden.push(c);
  };
  /**
   * Vorrat an Figuren, die jedes Bild neu stehen (Wesen, Bewohner, Statusgesten): je Figur
   * ein Sprite bzw. eine Grafik, die nur Bild und Lage wechselt. Vorher entstanden 60-mal
   * je Sekunde neue Objekte und wurden gleich wieder zerstört – viel Arbeit für die
   * Speicherbereinigung auf dem Handy. Was `zeichne` mit den Gebäuden abräumt, entsteht
   * beim nächsten Bild neu.
   */
  const dauerSprites = new Map<string, Sprite>();
  const dauerGrafik = new Map<string, Graphics>();
  const dauerHolen = <T extends Sprite | Graphics>(
    vorrat: Map<string, T>,
    schluessel: string,
    neu: () => T,
    gesehen: Set<string>,
  ): T => {
    let c = vorrat.get(schluessel);
    if (!c || c.destroyed) {
      c = neu();
      vorrat.set(schluessel, c);
    }
    if (c.parent !== gebaeude) gebaeude.addChild(c);
    c.visible = true;
    gesehen.add(schluessel);
    return c;
  };
  /** Figuren einer Art, die in diesem Bild nicht vorkamen, ausblenden */
  const dauerAusblenden = (praefix: string, gesehen: ReadonlySet<string>) => {
    for (const vorrat of [dauerSprites, dauerGrafik] as Map<string, Container>[])
      for (const [k, c] of vorrat)
        if (k.startsWith(praefix) && !gesehen.has(k) && !c.destroyed) c.visible = false;
  };
  /**
   * Sichtfeld der Kamera in Bühnen-Bildpunkten (GRAFIK §34): Was außerhalb liegt, wird
   * nicht bewegt. Undefiniert, bis sich die Kamera meldet – dann gilt alles als sichtbar.
   */
  let sicht: Rechteck | undefined;
  /** Rand um eine Figur für die Sichtprüfung (Bild, Statusgeste, Reaktion) */
  const FIGUR_RAND = 40;
  /** Vorberechnete Bilder: Statusgesten je Tätigkeit, Fahnen und Mühlen je Takt-Bild */
  const gesten = new BildVorrat<GraphicsContext>();
  const tuchBilder = new BildVorrat<GraphicsContext>();
  const wesenZeichnen = (jetzt: number) => {
    wesenLage.removeChildren().forEach((c) => c.destroy());
    for (const c of [...amBoden]) {
      if (c.label === 'wesen') {
        amBoden.splice(amBoden.indexOf(c), 1);
        if (!c.destroyed) {
          c.parent?.removeChild(c);
          c.destroy();
        }
      }
    }
    const gesehen = new Set<string>();
    if (!tickerAn(bewegung)) {
      dauerAusblenden('w:', gesehen);
      return; // bei „ruhig“ keine Wesen (GRAFIK §4.4)
    }
    // Auch Flieger (Möwe) nach ihrem Punkt über dem Boden: Sie landen zwischen den
    // Gebäuden, sonst säße die Möwe hinter dem Turm sichtbar auf den Zinnen.
    const ablegen = (c: Container, w: WesenZustand) => {
      c.label = 'wesen';
      aufBoden(c, w.y, 5);
    };
    for (const w of wesen) {
      const { zyklus, frame } = wesenFrame(w, jetzt);
      const id = atlasWesenId(thema, w.art, zyklus, frame);
      const eintrag = atlasEintragPerId(atlas, id);
      const tex = eintrag ? texturen.get(eintrag.id) : undefined;
      if (eintrag && tex) {
        const spr = dauerHolen(dauerSprites, `w:${w.id}`, () => new Sprite(), gesehen);
        // Außerhalb des Sichtfelds bleibt das letzte Bild stehen (GRAFIK §34). Nicht
        // ausblenden: Beim Schwenken zeigt der Browser das alte Bild der Bühne weiter.
        if (spr.texture !== Texture.EMPTY && !imSichtfeld(w.x, w.y, FIGUR_RAND, FIGUR_RAND, sicht))
          continue;
        spr.texture = tex;
        spr.zIndex = bodenTiefe(w.y) * 10 + 5;
        spr.anchor.set(eintrag.anker.x, eintrag.anker.y);
        const skal = (eintrag.pixel.w / 2) * w.skala * (jetzt < w.reactBis ? 1.12 : 1);
        // Maßstab direkt statt über `width`/`height` (das misst jedes Mal die Grenzen aus)
        spr.scale.set(
          (w.richtung * skal) / tex.orig.width,
          ((eintrag.pixel.h / eintrag.pixel.w) * skal) / tex.orig.height,
        );
        spr.position.set(w.x, w.y);
      } else {
        const g = new Graphics();
        zeichneWesen(g, w, jetzt);
        ablegen(g, w);
      }
    }
    dauerAusblenden('w:', gesehen);
  };

  const bewohnerZeichnen = (jetzt: number) => {
    bewohnerLage.removeChildren().forEach((c) => c.destroy());
    for (const c of [...amBoden]) {
      if (c.label === 'bewohner') {
        amBoden.splice(amBoden.indexOf(c), 1);
        if (!c.destroyed) {
          c.parent?.removeChild(c);
          c.destroy();
        }
      }
    }
    const gesehen = new Set<string>();
    if (!tickerAn(bewegung)) {
      dauerAusblenden('b:', gesehen);
      return;
    }
    const ablegen = (c: Container, y: number) => {
      c.label = 'bewohner';
      aufBoden(c, y, 6);
    };
    for (const b of bewohner) {
      // Nachts drinnen (Tagesablauf, Punkt 4)
      if (b.tagesphase === 'drinnen') continue;
      const { zyklus, frame } = bewohnerFrame(b, jetzt);
      const eintrag = atlasEintragPerId(atlas, atlasBewohnerId(b.art, zyklus, frame));
      const tex = eintrag ? texturen.get(eintrag.id) : undefined;
      if (eintrag && tex) {
        // Bild aus dem Generator (G3); die Statusgeste bleibt darüber (Design „Danach“ J35)
        const spr = dauerHolen(dauerSprites, `b:${b.id}`, () => new Sprite(), gesehen);
        const g = dauerHolen(dauerGrafik, `b:${b.id}`, () => new Graphics(), gesehen);
        // Außerhalb des Sichtfelds bleibt das letzte Bild stehen (GRAFIK §34)
        if (spr.texture !== Texture.EMPTY && !imSichtfeld(b.x, b.y, FIGUR_RAND, FIGUR_RAND, sicht))
          continue;
        spr.texture = tex;
        spr.zIndex = bodenTiefe(b.y) * 10 + 6;
        spr.anchor.set(eintrag.anker.x, eintrag.anker.y);
        const breite = (eintrag.pixel.w / 2) * (jetzt < b.reactBis ? 1.1 : 1);
        spr.scale.set(
          breite / tex.orig.width,
          ((eintrag.pixel.h / eintrag.pixel.w) * breite) / tex.orig.height,
        );
        spr.position.set(b.x, b.y + 4);
        // Statusgeste: je Tätigkeit einmal gezeichnet, danach nur verschoben (GRAFIK §34)
        g.context = gesten.holen(b.taetigkeit, () => {
          const c = new GraphicsContext();
          zeichneStatusgeste(c, 0, 0, 1, b.taetigkeit);
          return c;
        });
        g.position.set(b.x, b.y - 12);
        g.zIndex = spr.zIndex;
      } else {
        const g = new Graphics();
        zeichneBewohner(g, b, jetzt);
        ablegen(g, b.y);
      }
    }
    dauerAusblenden('b:', gesehen);
  };

  /**
   * Wehende Fahnen (Wunsch PV, 03.11.2026): Über jedem Tuch im Gebäudebild liegt ein
   * gezeichnetes Tuch, das sich leicht wellt. Gesammelt nach jedem Zeichnen; bei
   * „ruhig“ bleibt das stille Tuch aus dem Bild.
   *
   * Seit Q-G1 PR 3 (GRAFIK §31, neu §34) entsteht jedes Bild der Welle nur einmal: Die Phase wird
   * auf so viele Stufen je Umlauf gerundet, wie Takt-Schritte hineinpassen, und jede Stufe
   * liegt als fertige Zeichnung (`GraphicsContext`) im Vorrat. Im Takt tauscht die Bühne
   * nur, welche Zeichnung das Tuch zeigt. Gleich große Tücher teilen sich die Bilder.
   */
  interface Tuch {
    g: Graphics;
    x: number;
    y: number;
    k: number;
    n: number;
    /** Ursprung der Zeichnung (Ecke des Tuchs bzw. Nabe) in Bühnen-Bildpunkten */
    ox: number;
    oy: number;
    /** im Sichtfeld – sonst bleibt das letzte Bild stehen */
    sichtbar: boolean;
    /** Schlüssel des gezeigten Bildes */
    bild: string;
  }
  let fahnenTuecher: (Tuch & { f: AtlasFahne })[] = [];
  let muehlen: (Tuch & { f: AtlasFluegel })[] = [];
  /** Lage der Tücher und Mühlen zum Sichtfeld neu bestimmen */
  const tuecherSichten = () => {
    for (const t of fahnenTuecher) {
      const s = t.k / 2;
      const rand = 4 * s * 2.2;
      t.sichtbar = imSichtfeld(
        t.ox + (t.f.b * s) / 2,
        t.oy + ((t.f.h + t.f.s) * s) / 2,
        (Math.abs(t.f.b) * s) / 2 + rand,
        ((Math.abs(t.f.h) + Math.abs(t.f.s)) * s) / 2 + rand,
        sicht,
      );
    }
    for (const m of muehlen) {
      const s = m.k / 2;
      const r = m.f.l * Math.max(48, 58.79 * m.f.f) * s + 8;
      m.sichtbar = imSichtfeld(m.ox, m.oy, r, r, sicht);
    }
  };
  const fahnenSammeln = () => {
    fahnenTuecher = [];
    muehlen = [];
    const idVon = new Map<Texture, string>();
    for (const [id, tex] of texturen) idVon.set(tex, id);
    let n = 0;
    for (const kind of [...gebaeude.children]) {
      if (!(kind instanceof Sprite)) continue;
      const id = idVon.get(kind.texture);
      const eintrag = id ? atlasEintragPerId(atlas, id) : undefined;
      if (!eintrag) continue;
      const k = kind.width / (eintrag.pixel.w / 2);
      const s = k / 2;
      // Mühle: Bild ohne Flügel zeigen und die Flügel selbst zeichnen (auch bei „ruhig“,
      // dann stehen sie still)
      const ohne = eintrag.fluegel ? atlasEintragPerId(atlas, eintrag.fluegel.ohne) : undefined;
      const ohneTex = ohne ? texturen.get(ohne.id) : undefined;
      if (eintrag.fluegel && ohne && ohneTex) {
        kind.texture = ohneTex;
        kind.height = (ohne.pixel.h / 2) * k;
        const g = new Graphics();
        g.zIndex = kind.zIndex + 0.5;
        g.tint = kind.tint;
        gebaeude.addChild(g);
        const f = eintrag.fluegel;
        muehlen.push({
          g,
          x: kind.x,
          y: kind.y,
          k,
          f,
          n: n++,
          ox: kind.x + f.x * s,
          oy: kind.y + f.y * s,
          sichtbar: true,
          bild: '',
        });
      }
      if (!eintrag.fahnen || !tickerAn(bewegung)) continue;
      for (const f of eintrag.fahnen) {
        const g = new Graphics();
        g.zIndex = kind.zIndex + 0.5;
        g.tint = kind.tint;
        gebaeude.addChild(g);
        fahnenTuecher.push({
          g,
          x: kind.x,
          y: kind.y,
          k,
          f,
          n: n++,
          ox: kind.x + f.x * s,
          oy: kind.y + f.y * s,
          sichtbar: true,
          bild: '',
        });
      }
    }
    tuecherSichten();
    const jetzt = taktZeit(taktSchritt(performance.now()));
    // Erstes Bild immer zeichnen, auch außerhalb des Sichtfelds
    fahnenWehen(jetzt, true);
    muehlenDrehen(jetzt, true);
  };
  /** Ein Tuch zeigt das Bild zum Schlüssel; gebaut wird es nur beim ersten Mal */
  const tuchZeigen = (t: Tuch, schluessel: string, bauen: (c: GraphicsContext) => void) => {
    if (t.bild === schluessel) return;
    t.bild = schluessel;
    t.g.context = tuchBilder.holen(schluessel, () => {
      const c = new GraphicsContext();
      bauen(c);
      return c;
    });
    t.g.position.set(t.ox, t.oy);
  };
  /**
   * Drehende Mühlenflügel (Wunsch PV, 03.11.2026): vier Flügel vor der rechten Wand, in
   * derselben Ebene wie im Modell (`muehle_fluegel` in `g12_modelle.py`), eine Umdrehung
   * in zwölf Sekunden, bei Sturm schneller. Bei „ruhig“ stehen sie wie im alten Bild.
   * Vier gleiche Flügel: Nach einer Vierteldrehung sieht das Bild gleich aus, darum reicht
   * ein Vorrat für eine Vierteldrehung.
   */
  const muehlenDrehen = (jetzt: number, immer = false) => {
    const dreht = tickerAn(bewegung);
    const tempo = wetterBild === 'sturm' ? 2.5 : 1;
    const viertel = Math.PI / 2;
    const stufen = dreht ? bilderJeUmlauf(((Math.PI * 2) / 12) * tempo, viertel) : 1;
    for (const m of muehlen) {
      if (!m.sichtbar && !immer) continue;
      const { f, k } = m;
      const s = k / 2;
      const drehung = dreht ? -((jetzt / 12_000) * Math.PI * 2 * tempo + m.n) : 0;
      const stufe = phasenStufe(drehung, stufen, viertel);
      const schluessel = `m|${f.l}|${f.f}|${s}|${stufe}/${stufen}`;
      tuchZeigen(m, schluessel, (g) => {
        const winkel = stufenPhase(stufe, stufen, viertel);
        // Bildpunkte je Feld in der Ebene der rechten Wand (iso: 48 / 24 / 58,79)
        const qx = 48 * s;
        const qy = 24 * s;
        const qz = 58.79 * s * f.f;
        // Richtung in der Wand-Ebene: dy = Feld nach hinten, dz = nach oben (Nabe bei 0, 0)
        const bild = (dy: number, dz: number) => ({ x: -dy * qx, y: dy * qy - dz * qz });
        for (let i = 0; i < 4; i++) {
          const a = Math.PI / 4 + (i * Math.PI) / 2 + winkel;
          const ca = Math.cos(a);
          const sa = Math.sin(a);
          // Flügel entlang (−cos a, sin a), Tuch quer dazu (sin a, cos a), 0,24 Felder breit
          const ende = bild(-f.l * ca, f.l * sa);
          const ecken = [
            [0.25, -0.12],
            [1, -0.12],
            [1, 0.12],
            [0.25, 0.12],
          ].map(([t = 0, q = 0]) => bild(-f.l * t * ca + q * sa, f.l * t * sa + q * ca));
          // Tuch: im Licht heller, wenn es nach oben zeigt
          const licht = 0.9 + 0.1 * sa;
          g.poly(ecken.flatMap((p) => [p.x, p.y]))
            .fill(heller('#f0e8d6', licht))
            .stroke({ width: 0.8 * s, color: 0x8a6a4a, alpha: 0.7 });
          // Rute über dem Tuch, wie im alten Bild
          g.moveTo(0, 0)
            .lineTo(ende.x, ende.y)
            .stroke({ width: 1.6 * s, color: 0x5c3e28, cap: 'round' });
        }
        g.circle(0, 0, 2.4 * s).fill(0x4a3220);
      });
    }
  };
  /**
   * Banner am Mast: Das Tuch hängt und schwingt unten sacht zur Seite (oben fest), in
   * Streifen mit hellen und dunklen Falten; das Wappen schwingt mit. Gezeichnet ab der
   * oberen Ecke des Tuchs (0, 0).
   */
  const bannerZeichnen = (
    g: GraphicsContext,
    f: AtlasFahne,
    s: number,
    wind: number,
    phase: number,
  ) => {
    const amp = 1.4 * s * wind;
    const rand = 0.4 * s;
    const versatz = (v: number) => Math.sin(phase - v * 1.2) * amp * v * v;
    const teile = 6;
    for (let i = 0; i < teile; i++) {
      const v0 = i / teile;
      const v1 = (i + 1) / teile;
      const d0 = versatz(v0);
      const d1 = versatz(v1);
      const y0 = f.h * s * v0;
      const y1 = f.h * s * v1;
      const licht = 0.92 + 0.08 * Math.cos(phase - ((i + 0.5) / teile) * 1.2);
      g.poly([
        d0 - rand,
        y0 - rand,
        f.b * s + d0 + rand,
        y0 + f.s * s - rand,
        f.b * s + d1 + rand,
        y1 + f.s * s + rand,
        d1 - rand,
        y1 + rand,
      ]).fill(heller(f.farbe, licht));
    }
    const w = f.wappen;
    if (w) {
      const v = (w.y - f.y) / f.h;
      g.circle((w.x - f.x) * s + versatz(v), (w.y - f.y) * s, w.r * s).fill(heller(w.farbe, 0.88));
    }
  };
  /** Wehendes Tuch, gezeichnet ab der Ecke am Mast (0, 0) */
  const fahneZeichnen = (
    g: GraphicsContext,
    f: AtlasFahne,
    s: number,
    wind: number,
    phase: number,
  ) => {
    const amp = 1.1 * s * wind;
    // Rand größer als die Welle: das stille Tuch im Bild bleibt ganz verdeckt
    const rand = amp + 0.5 * s;
    const teile = 6;
    const punkte: { x: number; y: number }[] = [];
    for (let i = 0; i <= teile; i++) {
      const a = i / teile;
      const welle = Math.sin(phase - a * 2.6);
      punkte.push({ x: f.b * s * a, y: f.s * s * a + welle * amp * a });
    }
    for (let i = 0; i < teile; i++) {
      const p = punkte[i];
      const q = punkte[i + 1];
      if (!p || !q) continue;
      // Falten: wo die Welle steigt, ist das Tuch heller
      const licht = 0.9 + 0.1 * Math.cos(phase - ((i + 0.5) / teile) * 2.6);
      g.poly([
        p.x,
        p.y - rand,
        q.x + 0.2,
        q.y - rand,
        q.x + 0.2,
        q.y + f.h * s + rand,
        p.x,
        p.y + f.h * s + rand,
      ]).fill(heller(f.farbe, licht));
    }
  };
  const fahnenWehen = (jetzt: number, immer = false) => {
    const wind = wetterBild === 'sturm' ? 2.2 : 1;
    for (const t of fahnenTuecher) {
      if (!t.sichtbar && !immer) continue;
      const { f, k } = t;
      // Bildpunkte des 1x-Bildes sind halbe Bühnenpunkte
      const s = k / 2;
      // Banner schwingen langsamer (1,6 rad/s) als Fahnen wehen (4,2 rad/s)
      const omega = (f.haengt ? 1.6 : 4.2) * wind;
      const phase = (jetzt / 1000) * omega + t.n * (f.haengt ? 1.3 : 1.7);
      const stufen = bilderJeUmlauf(omega);
      const stufe = phasenStufe(phase, stufen);
      const w = f.wappen;
      const art = f.haengt ? `b|${w ? `${w.x - f.x},${w.y - f.y},${w.r},${w.farbe}` : ''}` : 'f';
      const schluessel = `${art}|${f.b}|${f.s}|${f.h}|${f.farbe}|${s}|${wind}|${stufe}/${stufen}`;
      tuchZeigen(t, schluessel, (g) =>
        (f.haengt ? bannerZeichnen : fahneZeichnen)(g, f, s, wind, stufenPhase(stufe, stufen)),
      );
    }
  };

  /**
   * Baustelle als kleines Schauspiel (Wunsch PV, 03.11.2026, Punkt 5): neben jedem laufenden
   * Bauvorhaben ein hölzerner Kran, dessen Ausleger langsam hin und her schwenkt und eine
   * Last hebt und senkt; auf jeder fertigen zweiten Gerüst-Ebene arbeitet jemand mit dem
   * Hammer. Bei „ruhig“ steht alles still. Kein Fortschritt hängt davon ab – es ist Bild.
   */
  let baustellen: {
    kran: Graphics;
    leute: Graphics;
    mast: { gx: number; gy: number };
    hoehe: number;
    arm: number;
    pos: Position;
    typ: GebaeudeTyp;
    hoeheZiel: number;
    ebenen: number;
    fertig: number;
    n: number;
    /** schon einmal gezeichnet – erst danach darf die Sichtprüfung überspringen */
    gezeichnet?: boolean;
  }[] = [];
  /** Kran samt Ausleger und Arbeitern liegt im Sichtfeld */
  const baustelleSichtbar = (b: (typeof baustellen)[number]): boolean => {
    const fuss = punkt(b.mast.gx, b.mast.gy);
    return imSichtfeld(fuss.x, fuss.y - b.hoehe / 2, b.arm * 48 + 40, b.hoehe / 2 + 60, sicht);
  };
  const baustelleZeichnen = (jetzt: number) => {
    const bewegt = tickerAn(bewegung);
    const t = bewegt ? jetzt / 1000 : 0;
    const holz = 0x7a5232;
    const dunkel = 0x4a3220;
    for (const b of baustellen) {
      const { kran: g, mast, hoehe: h, arm } = b;
      const fuss = punkt(mast.gx, mast.gy);
      // Außerhalb des Sichtfelds bleibt das letzte Bild stehen (GRAFIK §34)
      if (b.gezeichnet && !baustelleSichtbar(b)) continue;
      b.gezeichnet = true;
      g.clear();
      const oben = { x: fuss.x, y: fuss.y - h };
      // Mast: zwei Stangen mit Querstreben, Fuß aus Balken
      g.moveTo(fuss.x - 7, fuss.y + 2)
        .lineTo(fuss.x + 7, fuss.y - 2)
        .stroke({ width: 3, color: dunkel, cap: 'round' });
      for (const dx of [-1.8, 1.8])
        g.moveTo(fuss.x + dx, fuss.y)
          .lineTo(oben.x + dx * 0.6, oben.y)
          .stroke({ width: 2, color: holz, cap: 'round' });
      for (let k = 1; k < 6; k++) {
        const y0 = fuss.y - (h * (k - 1)) / 6;
        const y1 = fuss.y - (h * k) / 6;
        g.moveTo(fuss.x - 1.8, y0)
          .lineTo(fuss.x + 1.8, y1)
          .stroke({ width: 1, color: dunkel, alpha: 0.8 });
      }
      // Ausleger schwenkt langsam zwischen zwei Richtungen (Feldebene, über der Baustelle)
      const winkel = Math.PI * 0.95 + Math.sin(t * 0.28 + b.n * 2.1) * 0.55;
      const richtung = { x: Math.cos(winkel), y: Math.sin(winkel) };
      const ort = (f: number) => {
        const p = punkt(mast.gx + richtung.x * arm * f, mast.gy + richtung.y * arm * f);
        return { x: p.x, y: p.y - h };
      };
      const spitze = ort(1);
      const gegen = ort(-0.35);
      g.moveTo(gegen.x, gegen.y)
        .lineTo(spitze.x, spitze.y)
        .stroke({ width: 2.4, color: holz, cap: 'round' });
      // Spannseil vom Mastkopf zur Spitze, Gegengewicht hinten
      g.moveTo(oben.x, oben.y - 7)
        .lineTo(spitze.x, spitze.y)
        .moveTo(oben.x, oben.y - 7)
        .lineTo(gegen.x, gegen.y)
        .stroke({ width: 0.8, color: dunkel, alpha: 0.85 });
      g.moveTo(oben.x, oben.y)
        .lineTo(oben.x, oben.y - 7)
        .stroke({ width: 2, color: holz, cap: 'round' });
      g.rect(gegen.x - 3, gegen.y - 1, 6, 5).fill(0x8c8478);
      // Last hebt und senkt sich am Seil (ein Steinblock auf Holz)
      const haken = ort(0.72);
      const hub = 0.5 - 0.5 * Math.cos(t * 0.5 + b.n);
      const lastY = haken.y + 6 + hub * (h * 0.7);
      g.moveTo(haken.x, haken.y).lineTo(haken.x, lastY).stroke({ width: 0.8, color: dunkel });
      g.rect(haken.x - 4, lastY, 8, 5)
        .fill(0xb4aa98)
        .stroke({ width: 0.8, color: dunkel, alpha: 0.7 });

      // Arbeiter auf dem Gerüst: je zwei fertige Ebenen einer, höchstens zwei
      const l = b.leute;
      l.clear();
      const [w, tt] = KATALOG[b.typ].groesse;
      const anzahl = Math.min(2, Math.max(1, Math.floor(b.fertig / 2)));
      if (b.fertig === 0) continue;
      for (let i = 0; i < anzahl; i++) {
        const ebene = Math.max(1, b.fertig - i * 2);
        const z = (b.hoeheZiel * ebene) / b.ebenen;
        // Auf dem Laufbrett vorn, links und rechts der Mitte
        const p = punkt(b.pos.x + w * (i === 0 ? 0.75 : 0.3), b.pos.y + tt + 0.05);
        const x = p.x;
        const y = p.y - z;
        const schlag = Math.max(0, Math.sin(t * 5.2 + i * 1.9 + b.n));
        // Körper, Kopf, Mütze, Arm mit Hammer
        l.roundRect(x - 2.2, y - 9, 4.4, 7, 1.8).fill(i === 0 ? 0x5a7aa0 : 0x8a5a3a);
        l.circle(x, y - 11, 2.2).fill(0xe6c09a);
        l.ellipse(x, y - 12.6, 2.4, 1.1).fill(0x6a4a2a);
        const ax = x + 2 + Math.cos(-0.6 - schlag * 1.2) * 4.5;
        const ay = y - 7 + Math.sin(-0.6 - schlag * 1.2) * 4.5;
        l.moveTo(x + 1.6, y - 7)
          .lineTo(ax, ay)
          .stroke({ width: 1.4, color: 0xe6c09a, cap: 'round' });
        l.rect(ax - 1, ay - 2, 2.6, 2.2).fill(0x5a5a5a);
        l.moveTo(x - 1, y - 2)
          .lineTo(x - 1.2, y)
          .moveTo(x + 1, y - 2)
          .lineTo(x + 1.2, y)
          .stroke({ width: 1.2, color: 0x3a3a44, cap: 'round' });
      }
    }
  };

  /** Letzter Takt-Schritt, in dem Fahnen, Mühlen und Baustellen weitergestellt wurden */
  let letzterSchritt = -1;
  const ticker = () => {
    const jetzt = performance.now();
    // Gemeinsamer Takt (GRAFIK §34): Fahnen, Mühlen und Baustellen sehen dieselbe, auf
    // den Takt gerundete Zeit und rücken höchstens einmal je Takt-Schritt weiter.
    const schritt = taktSchritt(jetzt);
    if (schritt !== letzterSchritt) {
      letzterSchritt = schritt;
      const taktJetzt = taktZeit(schritt);
      if (baustellen.length > 0) baustelleZeichnen(taktJetzt);
      if (fahnenTuecher.length > 0) fahnenWehen(taktJetzt);
      if (muehlen.length > 0) muehlenDrehen(taktJetzt);
    }
    const dt = Math.min(0.05, (jetzt - tickerZuletzt) / 1000);
    tickerZuletzt = jetzt;
    // Bei Sturm ziehen die Wolken dreimal so schnell
    wolkenLage.x = wolkenVersatz(jetzt, bewegung) * (wetterBild === 'sturm' ? 3 : 1);
    if (wetterBild === 'sturm') schattenZeichnen(jetzt);
    aufstellAnwenden(jetzt);
    if (tickerAn(bewegung)) schornsteinZeichnen(jetzt);
    if (tickerAn(bewegung) && budget > 0) {
      for (let i = 0; i < tropfen.length; i++) {
        const t = tropfen[i];
        if (!t) continue;
        if (i >= wetterBudget) {
          // Laub: von der Krone bis zum Boden unter dem Baum, dann zur nächsten Krone
          if (t.spr) t.spr.visible = laubQuellen.length > 0;
          if (t.bis === undefined || t.y > t.bis) laubNeu(t, i);
          t.y += t.v;
          t.x += Math.sin((jetzt + i * 300) / 400) * 0.3;
          continue;
        }
        t.y += t.v;
        if (wetterBild === 'sturm' && i < wetterBudget) {
          t.x += 3.2 + t.v * 6; // der Wind treibt waagrecht
          if (t.x > buehneBreite()) t.x = -24;
        }
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
      const uhr = new Date();
      const sekunde = sekundeDesTages(
        uhr.getHours(),
        uhr.getMinutes(),
        uhr.getSeconds() + uhr.getMilliseconds() / 1000,
      );
      bewohner.forEach((b, i) => bewohnerTick(b, dt, jetzt, i, bewohnerF, sekunde));
      bewohnerZeichnen(jetzt);
    }
    // Ist das Aufstellen vorbei und sonst nichts in Bewegung, hält der Takt an
    if (!hatBewegung()) taktSync();
  };

  /**
   * Gibt es gerade etwas zu bewegen? Mit Kulisse liegen Wolken und Wetter außerhalb der
   * Bühne (§15.1); dann steht die Bühne ohne Wesen, Bewohner, Fahnen, Mühlen, Baustellen,
   * Rauch und Laub still – und der Takt mit ihr (GRAFIK §29).
   */
  const hatBewegung = (): boolean =>
    aufstellAktiv ||
    wesen.length > 0 ||
    bewohner.length > 0 ||
    wolkenLage.children.length > 0 ||
    (budget > 0 && tropfen.length > 0) ||
    // Fahnen, Mühlen und Kräne stehen fest: außerhalb des Sichtfelds bewegt sich nichts
    // davon, und ohne anderes Bewegtes steht der Takt (GRAFIK §34)
    fahnenTuecher.some((t) => t.sichtbar) ||
    muehlen.some((m) => m.sichtbar && tickerAn(bewegung)) ||
    baustellen.some(baustelleSichtbar) ||
    rauchQuellen.length > 0 ||
    (wetterBild === 'sturm' && !wetterUeberAllem);

  /**
   * Takt an die Lage anpassen (GRAFIK §29): Pixi rechnet nur, wenn `taktFuer` einen Takt
   * nennt, mit höchstens TAKT_HZ Bildern je Sekunde. Steht der Takt, zeichnet die Bühne
   * ein Einzelbild, damit der letzte Stand zu sehen ist. Vorher lief der Pixi-Ticker
   * immer mit 60 Hz, auch bei „ruhig“ (dort fehlte nur der eigene Rückruf).
   */
  const taktSync = () => {
    if (zerstoert) return;
    if (!tickerAn(bewegung)) {
      wolkenLage.x = 0;
      gebaeude.scale.set(1);
      gebaeude.alpha = 1;
      aufstellAktiv = false;
      // Standbild der Partikel bei „ruhig“; Wesen und Bewohner aus
      partikelZeichnen();
      wesenLage.removeChildren().forEach((c) => c.destroy());
      bewohnerLage.removeChildren().forEach((c) => c.destroy());
      bodenWeg();
      dauerAusblenden('', new Set());
    }
    const takt = taktFuer({ bewegung, bewegt: hatBewegung(), kameraBewegt });
    if (takt > 0) {
      app.ticker.maxFPS = takt;
      if (!tickerAngehaengt) {
        app.ticker.add(ticker);
        tickerAngehaengt = true;
        tickerZuletzt = performance.now();
        wesenZeichnen(tickerZuletzt);
      }
      app.start();
    } else {
      if (tickerAngehaengt) {
        app.ticker.remove(ticker);
        tickerAngehaengt = false;
      }
      app.stop();
      bildAnfordern();
    }
  };
  taktSync();

  /**
   * Scharfe Bilder nachladen: nur für die Einträge, die die letzte Zeichnung wirklich
   * abgefragt hat (stehende Gebäude, Umgebung, Fenster). Danach einmal neu zeichnen.
   * Läuft nur bei hoher Pixeldichte.
   */
  const pixeldichte = globalThis.devicePixelRatio || 1;
  const hdFertig = new Set<string>();
  let hdLaeuft = false;
  let letzteZeichnung: [Bastion, Ansicht] | undefined;
  const hdNachziehen = () => {
    if (hdLaeuft || zerstoert || pixeldichte < 1.5) return;
    const basis = atlasBasisUrl();
    const offen = [...texturen.gebraucht]
      .filter((id) => !hdFertig.has(id))
      .map((id) => atlasEintragPerId(atlas, id))
      .filter((e): e is NonNullable<typeof e> => !!e && !!e.hd && texturen.has(e.id));
    for (const e of offen) hdFertig.add(e.id);
    if (offen.length === 0) return;
    hdLaeuft = true;
    void Promise.all(
      offen.map(async (e) => {
        try {
          const tex = (await Assets.load(basis + atlasDatei(e, pixeldichte))) as Texture;
          return { e, tex };
        } catch {
          return undefined;
        }
      }),
    ).then((liste) => {
      hdLaeuft = false;
      if (zerstoert) return;
      let neu = 0;
      for (const x of liste) {
        if (!x) continue;
        texturen.set(x.e.id, x.tex);
        neu++;
      }
      // Die einfachen Bilder bleiben im Vorrat (manche Sprites entstehen außerhalb von
      // zeichne); ungenutzt räumt PixiJS sie nach einer Weile aus dem Grafikspeicher.
      if (neu > 0 && letzteZeichnung) buehne.zeichne(...letzteZeichnung);
    });
  };

  const buehne: Buehne = {
    zeichne(b, a) {
      letzteZeichnung = [b, a];
      queueMicrotask(hdNachziehen);
      const ids = new Set(b.bauwerke.map((x) => x.id));
      const anzahl = b.bauwerke.length;
      letzteBauwerke = b.bauwerke;
      belegt = belegteFelder(b.bauwerke, b.vorhaben);
      if (anzahl !== letzteWesenZahl) {
        letzteWesenZahl = anzahl;
        wesen = wesenStarten(thema, anzahl, bewegung === 'leicht', {
          bauwerke: b.bauwerke,
          vorhaben: b.vorhaben,
          platz: bauplatzAktiv(),
        });
        wesenZeichnen(performance.now());
      }
      const epocheJetzt = a.epoche ?? 1;
      bodenBauen(epocheJetzt);
      const buecher = a.buecher ?? 0;
      const konto = a.konto;
      if (konto) {
        const f = bewohnerFortschritt(b, konto, buecher, epocheJetzt, bewegung === 'leicht');
        bewohnerF = f;
        const key = bewohnerFortschrittKey(f);
        if (key !== letzteBewohnerKey) {
          letzteBewohnerKey = key;
          bewohner = bewohnerStarten(f, b.bauwerke, bauplatzAktiv());
          bewohnerZeichnen(performance.now());
        }
      } else {
        bewohnerF = undefined;
      }
      const stufen = new Map(b.bauwerke.map((x) => [x.id, x.stufe] as const));
      if (ersterZug) {
        bekannt = ids;
        bekannteStufen = stufen;
        ersterZug = false;
        gebaeude.scale.set(1);
        gebaeude.alpha = 1;
        aufstellAktiv = false;
      } else {
        const neu = [...ids].some((id) => !bekannt.has(id));
        // Ausbau-Moment (G4): eine Stufe höher zählt wie ein neues Gebäude
        const ausgebaut = [...stufen].some(([id, st]) => (bekannteStufen.get(id) ?? st) < st);
        bekannt = ids;
        bekannteStufen = stufen;
        if ((neu || ausgebaut) && aufstellDauerMs(bewegung) > 0) {
          aufstellStart = performance.now();
          aufstellAktiv = true;
          gebaeude.scale.set(0.92);
          gebaeude.alpha = 0;
        }
      }
      gebaeude.removeChildren().forEach((c) => c.destroy());
      baustellen = [];
      const g = new Graphics();
      g.zIndex = 0;
      if (a.hinterhof && a.hinterhof.length > 0) {
        hinterhofZeichnen(gebaeude, a.hinterhof, thema, farben.abend, atlas, texturen);
      }
      // Neubauten im Bau: gestrichelte Geister-Silhouette (Design-Ideen K43)
      for (const v of b.vorhaben.filter((x) => x.stufe === 1)) {
        raute(g, v.pos, v.typ, 0.1).fill({ color: farben.imBau, alpha: 0.1 });
        geisterUmriss(g, v.pos, v.typ, farben.imBau);
      }
      // Von hinten nach vorn zeichnen, damit Vorderes Hinteres verdeckt
      const reihe = [...b.bauwerke].sort((p, q) => {
        const [pw, pt] = KATALOG[p.typ].groesse;
        const [qw, qt] = KATALOG[q.typ].groesse;
        return p.pos.x + p.pos.y + (pw + pt) / 2 - (q.pos.x + q.pos.y + (qw + qt) / 2);
      });
      treffer = [];
      laubQuellen = [];
      // Boden mit Leben (Wunsch PV, Schritt 7): Gras, Blumen, Laub, Spuren auf freien Feldern
      if (istLandBildart(art) && texturen.size > 0) {
        const leben = new Graphics();
        leben.zIndex = 1;
        const { breite: lw, tiefe: lt } = bauplatzAktiv();
        const dunkel = farben.abend ? 0.55 : 1;
        // Ausgetretene Wege vom Bergfried zu den Gebäuden (Punkt 4); dort wächst nichts
        const wege = wegeListe(b.bauwerke, belegt, bauplatzAktiv());
        const wegFarbe = WEG_FARBE[farben.jahreszeit === 'winter' ? 'winter' : art] ?? '#c8b48a';
        const pfade = new Graphics();
        for (const weg of wege) {
          weg.forEach((f, i) => {
            const p = punkt(f.x + 0.5, f.y + 0.5);
            if (i === 0) pfade.moveTo(p.x, p.y);
            else pfade.lineTo(p.x, p.y);
          });
        }
        // Deckend gezeichnet: halb durchsichtige Wege dunkeln sich dort ab, wo sie sich
        // überlappen. Abends dunkler gefärbt statt durchsichtiger.
        pfade.stroke({ width: 13, color: dunkler(wegFarbe, dunkel), cap: 'round', join: 'round' });
        pfade.zIndex = 0.5;
        gebaeude.addChild(pfade);
        const frei = new Set([...belegt, ...wegeFelder(b.bauwerke, belegt, bauplatzAktiv())]);
        for (const d of bodenLeben(lw, lt, farben.jahreszeit ?? 'sommer', frei)) {
          const p = punkt(d.x, d.y);
          if (d.art === 'buesche') {
            for (const [dx, h] of [
              [-2.2, 6],
              [0, 8],
              [2.2, 5.4],
            ] as const)
              leben
                .moveTo(p.x + dx, p.y)
                .lineTo(p.x + dx * 1.7, p.y - h)
                .stroke({ width: 1.5, color: d.farbe, alpha: 0.85 * dunkel, cap: 'round' });
          } else if (d.art === 'bluete') {
            leben
              .moveTo(p.x, p.y)
              .lineTo(p.x, p.y - 6)
              .stroke({ width: 0.9, color: '#4d8f35', alpha: dunkel });
            leben.circle(p.x, p.y - 6.8, 2.6).fill({ color: d.farbe, alpha: dunkel });
            leben.circle(p.x, p.y - 6.8, 0.9).fill({ color: '#f6d24a', alpha: dunkel });
          } else if (d.art === 'laub') {
            leben.ellipse(p.x, p.y, 3.4, 1.7).fill({ color: d.farbe, alpha: 0.9 * dunkel });
          } else {
            // Spuren im Schnee: ein paar Abdrücke hintereinander
            for (let k = 0; k < 3; k++)
              leben
                .ellipse(p.x + k * 3.2 + (k % 2) * 1.2, p.y + k * 1.6 - (k % 2) * 1.4, 1.3, 0.7)
                .fill({ color: d.farbe, alpha: 0.55 * dunkel });
          }
        }
        gebaeude.addChild(leben);
      }
      const epoche = epocheJetzt;
      // Rauch aus Bergfried und Werkstatt (Wunsch PV: Leben an den Gebäuden), nur über Land
      rauchQuellen = [];
      const rauchThema =
        art === 'dorf'
          ? 'dorf'
          : art === 'garten'
            ? 'garten'
            : art === 'insel'
              ? 'bastion'
              : undefined;
      if (rauchThema && texturen.size > 0)
        for (const x of reihe) {
          if (x.typ !== 'kern' && x.typ !== 'werkstatt') continue;
          const e = atlasEintrag(atlas, rauchThema, epoche, x.typ, x.stufe);
          if (!e) continue;
          const [bw, bt] = KATALOG[x.typ].groesse;
          const fuss = punkt(x.pos.x + bw, x.pos.y + bt);
          rauchQuellen.push({ x: fuss.x + e.pixel.w * 0.03, y: fuss.y - (e.pixel.h / 2) * 0.78 });
        }
      schornsteinZeichnen(performance.now());
      if (art === 'dorf' && texturen.size > 0) {
        // Atlas-Dorf: Bäume + Gebäude-Sprites (Fallback je Rolle, GRAFIK-SPRITES P0)
        // Bäume aus dem Atlas (G3, GRAFIK-SPRITES §12.10), sonst Code-Baum
        const lagen: { tiefe: number; zeichne: () => void }[] = dorfBaumLagen().map((b) => ({
          tiefe: b.tiefe,
          zeichne: () => {
            const eintrag = umgebungEintrag(atlas, `dorf/umgebung/${b.art}`, farben.jahreszeit);
            const tex = eintrag ? texturen.get(eintrag.id) : undefined;
            if (eintrag && tex) {
              // Der Code-Baum steht mit dem Stamm auf punkt(x, y); das Bild hat seinen
              // Fußpunkt an der unteren Ecke eines Felds, dessen Mitte dort liegt.
              const fuss = punkt(b.x + 0.5, b.y + 0.5);
              const spr = new Sprite(tex);
              spr.anchor.set(eintrag.anker.x, eintrag.anker.y);
              spr.width = (eintrag.pixel.w / 2) * b.bild;
              spr.height = (eintrag.pixel.h / 2) * b.bild;
              spr.position.set(fuss.x, fuss.y);
              spr.zIndex = b.tiefe * 10;
              gebaeude.addChild(spr);
              if (KRONE_LAUB.test(eintrag.id))
                laubQuellen.push({
                  x: fuss.x,
                  y: fuss.y - spr.height * 0.72,
                  h: spr.height * 0.68,
                });
              return;
            }
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
                if (farben.abend) {
                  fensterAbendSprite(
                    gebaeude,
                    'dorf',
                    epoche,
                    x.typ,
                    x.stufe,
                    x.pos,
                    tiefe,
                    atlas,
                    texturen,
                  );
                }
                if (farben.jahreszeit === 'winter' || farben.wetter === 'schnee') {
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
      } else if (art === 'garten' && texturen.size > 0) {
        // Atlas-Garten: Sträucher + Gebäude-Sprites (Fallback je Rolle, GRAFIK-SPRITES P2)
        // Sträucher aus dem Atlas (G3, GRAFIK-SPRITES §12.10), sonst Code-Strauch
        const lagen: { tiefe: number; zeichne: () => void }[] = gartenStrauchLagen().map((b) => ({
          tiefe: b.tiefe,
          zeichne: () => {
            const eintrag = umgebungEintrag(atlas, `garten/umgebung/${b.art}`, farben.jahreszeit);
            const tex = eintrag ? texturen.get(eintrag.id) : undefined;
            if (eintrag && tex) {
              // Der Code-Strauch steht auf punkt(x, y); das Bild hat seinen Fußpunkt an der
              // unteren Ecke eines Felds, dessen Mitte dort liegt.
              const fuss = punkt(b.x + 0.5, b.y + 0.5);
              const spr = new Sprite(tex);
              spr.anchor.set(eintrag.anker.x, eintrag.anker.y);
              spr.width = (eintrag.pixel.w / 2) * b.bild;
              spr.height = (eintrag.pixel.h / 2) * b.bild;
              spr.position.set(fuss.x, fuss.y);
              spr.zIndex = b.tiefe * 10;
              gebaeude.addChild(spr);
              if (KRONE_LAUB.test(eintrag.id))
                laubQuellen.push({
                  x: fuss.x,
                  y: fuss.y - spr.height * 0.72,
                  h: spr.height * 0.68,
                });
              return;
            }
            const stueck = new Graphics();
            gartenStrauch(stiftVon(stueck), b.x, b.y, b.s);
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
              const eintrag = atlasEintrag(atlas, 'garten', epoche, x.typ, x.stufe);
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
                if (farben.abend) {
                  fensterAbendSprite(
                    gebaeude,
                    'garten',
                    epoche,
                    x.typ,
                    x.stufe,
                    x.pos,
                    tiefe,
                    atlas,
                    texturen,
                  );
                }
                if (farben.jahreszeit === 'winter' || farben.wetter === 'schnee') {
                  schneeDachSprite(gebaeude, x.pos, x.typ, tiefe, atlas, texturen);
                }
                if (a.auswahl === x.id) {
                  raute(g, x.pos, x.typ, -0.05).stroke({ width: 3, color: farben.auswahl });
                }
              } else {
                const stueck = new Graphics();
                gartenGebaeude(
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
      } else if (art === 'unterwasser' && texturen.size > 0) {
        // Atlas-Unterwasser: Korallen + Gebäude-Sprites (P3)
        // Korallen aus dem Atlas (G3, GRAFIK-SPRITES §12.10), sonst Code-Koralle
        const lagen: { tiefe: number; zeichne: () => void }[] = uwKoralleLagen().map((b) => ({
          tiefe: b.tiefe,
          zeichne: () => {
            const eintrag = atlasEintragPerId(atlas, `unterwasser/umgebung/${b.art}`);
            const tex = eintrag ? texturen.get(eintrag.id) : undefined;
            if (eintrag && tex) {
              // Fußpunkt an der unteren Ecke des Felds, dessen Mitte punkt(x, y) ist
              const fuss = punkt(b.x + 0.5, b.y + 0.5);
              const spr = new Sprite(tex);
              spr.anchor.set(eintrag.anker.x, eintrag.anker.y);
              spr.width = (eintrag.pixel.w / 2) * b.bild;
              spr.height = (eintrag.pixel.h / 2) * b.bild;
              spr.position.set(fuss.x, fuss.y);
              spr.zIndex = b.tiefe * 10;
              gebaeude.addChild(spr);
              if (KRONE_LAUB.test(eintrag.id))
                laubQuellen.push({
                  x: fuss.x,
                  y: fuss.y - spr.height * 0.72,
                  h: spr.height * 0.68,
                });
              return;
            }
            const stueck = new Graphics();
            uwKoralle(stiftVon(stueck), b.x, b.y, b.s);
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
              const eintrag = atlasEintrag(atlas, 'unterwasser', epoche, x.typ, x.stufe);
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
                if (farben.abend) {
                  fensterAbendSprite(
                    gebaeude,
                    'unterwasser',
                    epoche,
                    x.typ,
                    x.stufe,
                    x.pos,
                    tiefe,
                    atlas,
                    texturen,
                  );
                }
                // Kein Schnee-Dach unter Wasser (Jahreszeit gilt für Land-Themen)
                if (a.auswahl === x.id) {
                  raute(g, x.pos, x.typ, -0.05).stroke({ width: 3, color: farben.auswahl });
                }
              } else {
                const stueck = new Graphics();
                uwGebaeude(
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
      } else if (art === 'weltraum' && texturen.size > 0) {
        // Atlas-Weltraum: Gebäude-Sprites (P3)
        const lagen: { tiefe: number; zeichne: () => void }[] = [];
        for (const x of reihe) {
          const [bw, bt] = KATALOG[x.typ].groesse;
          const tiefe = x.pos.x + x.pos.y + (bw + bt) / 2;
          lagen.push({
            tiefe,
            zeichne: () => {
              const eintrag = atlasEintrag(atlas, 'weltraum', epoche, x.typ, x.stufe);
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
                if (farben.abend) {
                  fensterAbendSprite(
                    gebaeude,
                    'weltraum',
                    epoche,
                    x.typ,
                    x.stufe,
                    x.pos,
                    tiefe,
                    atlas,
                    texturen,
                  );
                }
                // Kein Schnee-Dach im Weltraum
                if (a.auswahl === x.id) {
                  raute(g, x.pos, x.typ, -0.05).stroke({ width: 3, color: farben.auswahl });
                }
              } else {
                const stueck = new Graphics();
                weltraumGebaeude(
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
      } else if (art === 'insel' && texturen.size > 0) {
        // Atlas-Bastion: Gebäude-Sprites (P3); Code-Fallback je Rolle
        const lagen: { tiefe: number; zeichne: () => void }[] = [];
        // Umgebung am Inselrand (G3, GRAFIK-SPRITES §12.7): feste Plätze, kein Zufall
        const { breite: pw, tiefe: pt } = bauplatzAktiv();
        for (const u of inselUmgebung(pw, pt)) {
          const eintrag = umgebungEintrag(atlas, `bastion/umgebung/${u.art}`, farben.jahreszeit);
          const tex = eintrag ? texturen.get(eintrag.id) : undefined;
          if (!eintrag || !tex) continue;
          lagen.push({
            tiefe: u.x + u.y + 1,
            zeichne: () => {
              const fuss = punkt(u.x + 1, u.y + 1);
              const spr = new Sprite(tex);
              spr.anchor.set(eintrag.anker.x, eintrag.anker.y);
              spr.width = (eintrag.pixel.w / 2) * u.s;
              spr.height = (eintrag.pixel.h / 2) * u.s;
              spr.position.set(fuss.x, fuss.y);
              spr.zIndex = (u.x + u.y + 1) * 10;
              gebaeude.addChild(spr);
              if (KRONE_LAUB.test(eintrag.id))
                laubQuellen.push({
                  x: fuss.x,
                  y: fuss.y - spr.height * 0.72,
                  h: spr.height * 0.68,
                });
            },
          });
        }
        for (const x of reihe) {
          const [bw, bt] = KATALOG[x.typ].groesse;
          const tiefe = x.pos.x + x.pos.y + (bw + bt) / 2;
          lagen.push({
            tiefe,
            zeichne: () => {
              const eintrag = atlasEintrag(atlas, 'bastion', epoche, x.typ, x.stufe);
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
                if (farben.abend) {
                  fensterAbendSprite(
                    gebaeude,
                    'bastion',
                    epoche,
                    x.typ,
                    x.stufe,
                    x.pos,
                    tiefe,
                    atlas,
                    texturen,
                  );
                }
                if (farben.jahreszeit === 'winter' || farben.wetter === 'schnee') {
                  schneeDachSprite(gebaeude, x.pos, x.typ, tiefe, atlas, texturen);
                }
                if (a.auswahl === x.id) {
                  raute(g, x.pos, x.typ, -0.05).stroke({ width: 3, color: farben.auswahl });
                }
              } else {
                const stueck = new Graphics();
                if (a.auswahl === x.id)
                  raute(stueck, x.pos, x.typ, -0.05).stroke({ width: 3, color: farben.auswahl });
                zeichneRolle(
                  stueck,
                  x.typ,
                  x.stufe,
                  x.pos,
                  x.farbe ? FARBWERT[x.farbe] : farben.familie[KATALOG[x.typ].familie],
                  farben,
                  a.epoche ?? 1,
                );
                stueck.zIndex = tiefe * 10;
                gebaeude.addChild(stueck);
              }
            },
          });
        }
        lagen.sort((p, q) => p.tiefe - q.tiefe);
        for (const lage of lagen) lage.zeichne();
      }
      for (const x of reihe) {
        const [w, t] = KATALOG[x.typ].groesse;
        if (art === 'insel' && texturen.size === 0) {
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
        const codeHoehe =
          art === 'dorf'
            ? dorfHoehe(x.typ, x.stufe)
            : art === 'garten'
              ? gartenHoehe(x.typ, x.stufe)
              : art === 'unterwasser'
                ? uwHoehe(x.typ, x.stufe)
                : art === 'weltraum'
                  ? weltraumHoehe(x.typ, x.stufe)
                  : hoehe(x.typ, x.stufe, a.epoche ?? 1);
        // Steht ein Atlas-Bild da, zählt seine Höhe: Die neuen Gebäude (G3) sind viel
        // höher als die Code-Formen, sonst trifft ein Tipper auf die Turmspitze nicht.
        const bildEintrag =
          texturen.size > 0
            ? atlasEintrag(atlas, atlasThema(art), epocheJetzt, x.typ, x.stufe)
            : undefined;
        // Die Fläche wächst von den hinteren Ecken der Grundfläche nach oben, das Bild vom
        // vorderen Fußpunkt aus: Höhe der Grundfläche abziehen, damit die Fläche genau an der
        // Bildspitze endet (sonst überdeckt z. B. die Palisade die Feuerstelle dahinter).
        const bildHoehe = bildEintrag ? bildEintrag.pixel.h / 2 - ((w + t) / 2) * RAUTE_H : 0;
        const h = Math.max(codeHoehe + 20, bildHoehe);
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
      // Laufende Bauvorhaben: Gerüst in Abschnitten vor dem Gebäude (G4)
      for (const v of b.vorhaben) {
        const [vw, vt] = KATALOG[v.typ].groesse;
        const ziel =
          texturen.size > 0
            ? atlasEintrag(atlas, atlasThema(art), epocheJetzt, v.typ, v.stufe)
            : undefined;
        const hoeheZiel = ziel ? (ziel.pixel.h / 2) * 0.8 : hoehe(v.typ, v.stufe, epocheJetzt) + 12;
        const stueck = new Graphics();
        geruest(stueck, v.pos, v.typ, hoeheZiel, v.bedarf, v.fortschritt);
        stueck.zIndex = (v.pos.x + v.pos.y + (vw + vt) / 2) * 10 + 5;
        gebaeude.addChild(stueck);
        // Kran und Arbeiter (Wunsch PV Punkt 5: Bauen als kleines Schauspiel), nur über Land
        if (istLandBildart(art)) {
          const kran = new Graphics();
          // Der Kran steht hinten rechts neben der Baustelle
          const mast = { gx: v.pos.x + vw + 0.45, gy: v.pos.y + 0.15 };
          kran.zIndex = (mast.gx + mast.gy) * 10 + 4;
          const leute = new Graphics();
          leute.zIndex = stueck.zIndex + 1;
          gebaeude.addChild(kran, leute);
          const { ebenen, fertig } = geruestEbenen(v.bedarf, v.fortschritt);
          baustellen.push({
            kran,
            leute,
            mast,
            hoehe: hoeheZiel * 1.12 + 10,
            arm: Math.max(1.3, Math.max(vw, vt) * 0.95),
            pos: v.pos,
            typ: v.typ,
            hoeheZiel,
            ebenen,
            fertig,
            n: baustellen.length,
          });
        }
      }
      baustelleZeichnen(performance.now());
      if (a.vorschlag) {
        const v = a.vorschlag;
        raute(g, v.pos, v.typ, 0.05).fill({ color: farben.auswahl, alpha: 0.16 });
        geisterUmriss(g, v.pos, v.typ, farben.auswahl);
        const eintrag = atlasEintrag(atlas, thema, epocheJetzt, v.typ, 1);
        const tex = eintrag ? texturen.get(eintrag.id) : undefined;
        if (eintrag && tex) {
          const [vw, vt] = KATALOG[v.typ].groesse;
          const fuss = punkt(v.pos.x + vw, v.pos.y + vt);
          const spr = new Sprite(tex);
          spr.anchor.set(eintrag.anker.x, eintrag.anker.y);
          spr.width = eintrag.pixel.w / 2;
          spr.height = eintrag.pixel.h / 2;
          spr.position.set(fuss.x, fuss.y);
          spr.alpha = 0.5;
          spr.zIndex = (v.pos.x + v.pos.y + (vw + vt) / 2) * 10 + 1;
          gebaeude.addChild(spr);
        }
      }
      if (a.ziel) {
        raute(g, a.ziel.pos, a.ziel.typ, 0).stroke({
          width: 3,
          color: a.ziel.frei ? farben.auswahl : farben.linie,
          alpha: a.ziel.frei ? 1 : 0.4,
        });
      }
      gebaeude.addChild(g);
      fahnenSammeln();
      // Neue Fahnen, Baustellen oder ein Aufstellen können den Takt starten; steht er,
      // zeigt ein Einzelbild den neuen Stand
      taktSync();
      bildAnfordern();
    },
    setzeBewegung(b) {
      bewegung = b;
      wesen = wesenStarten(thema, letzteWesenZahl < 0 ? 0 : letzteWesenZahl, b === 'leicht', {
        bauwerke: letzteBauwerke,
        platz: bauplatzAktiv(),
      });
      letzteBewohnerKey = '';
      taktSync();
      bildAnfordern();
    },
    setzeSichtfeld(r) {
      sicht = r;
      tuecherSichten();
      // Während einer Kamera-Geste nichts weiter: Die Kamera-Ruhe gleich danach startet
      // oder hält den Takt nach dem neuen Sichtfeld.
      if (!kameraBewegt) taktSync();
    },
    setzeKameraBewegt(bewegt) {
      if (bewegt === kameraBewegt) return;
      kameraBewegt = bewegt;
      taktSync();
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
        if (b.tagesphase === 'drinnen') continue;
        if (Math.hypot(b.x - x, b.y - y) < 16) return b.id;
      }
      return undefined;
    },
    tippeWesen(id) {
      const w = wesen.find((x) => x.id === id);
      if (w) {
        wesenReagieren(w, performance.now());
        wesenZeichnen(performance.now());
        bildAnfordern();
      }
    },
    tippeBewohner(id) {
      const b = bewohner.find((x) => x.id === id);
      if (b) {
        bewohnerReagieren(b, performance.now());
        bewohnerZeichnen(performance.now());
        bildAnfordern();
      }
      return b;
    },
    bewohnerZustand(id) {
      return bewohner.find((x) => x.id === id);
    },
    get view() {
      return app.canvas;
    },
    zerstoere() {
      zerstoert = true;
      if (tickerAngehaengt) app.ticker.remove(ticker);
      tickerAngehaengt = false;
      const view = app.canvas;
      // Nicht `destroy(true)`: das gäbe auch die globalen Ressourcen von PixiJS frei (Vorrat
      // an Zeichen-Stapeln), die die neue Bühne nach einem Themenwechsel schon nutzt.
      // Danach stürzte das Bild ab und blieb leer (#160, Dorf-Szene).
      app.destroy({ removeView: true }, { children: true });
      // Pixi entfernt die View nicht zuverlässig, wenn destroy nach Abbruch kommt
      view.remove();
      // Geteilte Zeichnungen gehören keiner Grafik, darum hier abgeben (GRAFIK §34)
      gesten.leeren((c) => c.destroy());
      tuchBilder.leeren((c) => c.destroy());
    },
  };
  return buehne;
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
