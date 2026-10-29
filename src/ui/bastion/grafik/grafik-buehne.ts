// Bauplatz als Grafik (ARCHITEKTUR T-6, BASEBAU B-11/B-12, GRAFIK §1):
// PixiJS, nachgeladen nur bei geöffneter Bastion. Richtung A „Tag, warm“: die Insel
// schräg von oben (isometrisch), flache Farbflächen mit zwei Seitentönen je Gebäude,
// Himmel mit Sonne und Wolken; dunkel als Abend mit erleuchteten Fenstern.
// Je Rolle eine Form aus dem Code, Farbe je Gebäudefamilie – austauschbar je Thema
// und Skin (B-17, B-18, B-27). Diese Datei ist der einzige Ort, der PixiJS
// importiert; die Listenansicht bleibt gleichwertig.
import { Application, Container, Graphics } from 'pixi.js';
import type { Bastion } from '../../../core/bastion/bauen';
import { FARBWERT } from '../farben';
import {
  BAUPLATZ,
  KATALOG,
  type Familie,
  type GebaeudeTyp,
  type Position,
} from '../../../core/bastion/katalog';
import { BUEHNE_B, BUEHNE_H, INSEL, feldUnter, punkt } from './iso';

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
}

export interface Ansicht {
  /** ausgewähltes Gebäude (Instanz-ID) */
  readonly auswahl?: string;
  /** Feld, auf das gerade versetzt werden soll – mit Umriss in der Größe des Gebäudes */
  readonly ziel?: { readonly pos: Position; readonly typ: GebaeudeTyp; readonly frei: boolean };
}

export interface Buehne {
  zeichne(b: Bastion, a: Ansicht): void;
  /** Feld unter einem Punkt in Bildschirmkoordinaten – oder undefined außerhalb */
  feldBei(clientX: number, clientY: number): Position | undefined;
  zerstoere(): void;
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
function hoehe(typ: GebaeudeTyp, stufe: number): number {
  const grund: Record<GebaeudeTyp, number> = {
    kern: 54,
    turm: 46,
    werkstatt: 26,
    wissen: 28,
    eingang: 32,
    einfassung: 12,
    ursprung: 8,
    zeichen: 6,
    flaeche: 3,
    denkmal: 14,
  };
  return grund[typ] + (typ === 'kern' || typ === 'turm' ? (stufe - 1) * 8 : 0);
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
}

/** Ein Gebäude je Rolle (B-12) */
function zeichneRolle(
  g: Graphics,
  typ: GebaeudeTyp,
  stufe: number,
  pos: Position,
  farbe: string,
  f: Farben,
) {
  const [w, t] = KATALOG[typ].groesse;
  const h = hoehe(typ, stufe);
  switch (typ) {
    case 'kern': {
      const e = ecken(pos.x, pos.y, w, t, 0.12);
      const o = quader(g, e, h, farbe, f.linie);
      // Zinnen an den beiden vorderen Kanten
      for (const [a, b] of [
        [o.links, o.vorne],
        [o.vorne, o.rechts],
      ] as const)
        for (const s of [0.1, 0.45, 0.8]) {
          const p = { x: a.x + (b.x - a.x) * s, y: a.y + (b.y - a.y) * s };
          const q = { x: a.x + (b.x - a.x) * (s + 0.12), y: a.y + (b.y - a.y) * (s + 0.12) };
          g.poly(flach(p, q, hoch(q, 6), hoch(p, 6))).fill(dunkler(farbe, 0.75));
        }
      fenster(g, e, h, f);
      // Turm in der Mitte mit Dach
      const innen = ecken(pos.x + w * 0.3, pos.y + t * 0.3, w * 0.4, t * 0.4, 0);
      const spitze = quader(g, innen, 26, farbe, f.linie, h);
      pyramide(g, spitze, 24, f);
      break;
    }
    case 'turm': {
      const e = ecken(pos.x, pos.y, w, t, 0.18);
      const o = quader(g, e, h, farbe, f.linie);
      pyramide(g, o, 22, f);
      fenster(g, e, h, f);
      break;
    }
    case 'werkstatt': {
      const e = ecken(pos.x, pos.y, w, t, 0.1);
      const o = quader(g, e, h, farbe, f.linie);
      satteldach(g, o, 16, f);
      fenster(g, e, h, f);
      break;
    }
    case 'wissen': {
      const e = ecken(pos.x, pos.y, w, t, 0.12);
      const o = quader(g, e, h, farbe, f.linie);
      pyramide(g, o, 16, f);
      fenster(g, e, h, f);
      break;
    }
    case 'eingang': {
      const e = ecken(pos.x, pos.y, w, t, 0.1);
      quader(g, e, h, farbe, f.linie);
      // Torbogen auf der linken Seite
      const m = { x: (e.links.x + e.vorne.x) / 2, y: (e.links.y + e.vorne.y) / 2 };
      g.roundRect(m.x - 6, m.y - 20, 12, 18, 6).fill({ color: f.linie, alpha: 0.7 });
      break;
    }
    case 'einfassung':
      for (let i = 0; i < 3; i++) {
        const e = ecken(pos.x + (w / 3) * i, pos.y, w / 3, t, 0.08);
        quader(g, e, h, farbe, f.linie);
      }
      break;
    case 'ursprung': {
      // Feuerstelle: flacher Ring, darin eine Flamme
      const e = ecken(pos.x, pos.y, w, t, 0.2);
      const o = quader(g, e, h, farbe, f.linie);
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
      const o = quader(g, e, h, farbe, f.linie);
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
        g.circle(p.x, p.y, 2.5).fill(dunkler(farbe, 0.6));
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

/** Himmel: Sonne und Wolken am Tag, Mond und Sterne am Abend – feste Plätze, kein Zufall. */
function himmel(g: Graphics, f: Farben) {
  g.circle(BUEHNE_B - 70, 52, f.abend ? 16 : 22).fill(f.licht);
  if (f.abend) {
    g.circle(BUEHNE_B - 62, 46, 14).fill(f.himmel);
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
  } else {
    for (const [x, y, s] of [
      [90, 50, 1],
      [300, 34, 0.8],
    ] as const) {
      g.ellipse(x, y, 34 * s, 11 * s).fill({ color: f.wolke, alpha: 0.9 });
      g.ellipse(x + 22 * s, y - 7 * s, 22 * s, 11 * s).fill({ color: f.wolke, alpha: 0.9 });
    }
  }
}

/** Die Insel: Deckfläche mit Raster, zwei Seitentöne nach vorn */
function insel(g: Graphics, f: Farben) {
  const W = BAUPLATZ.breite;
  const T = BAUPLATZ.tiefe;
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

export async function buehneErstellen(ziel: HTMLElement, farben: Farben): Promise<Buehne> {
  const app = new Application();
  await app.init({
    width: BUEHNE_B,
    height: BUEHNE_H,
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

  const hintergrund = new Graphics();
  himmel(hintergrund, farben);
  insel(hintergrund, farben);
  const gebaeude = new Container();
  app.stage.addChild(hintergrund, gebaeude);

  /** Gezeichnete Gebäude für das Antippen: Umriss auf dem Bild → Platz des Gebäudes */
  let treffer: { pos: Position; umriss: number[] }[] = [];

  return {
    zeichne(b, a) {
      gebaeude.removeChildren().forEach((c) => c.destroy());
      const g = new Graphics();
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
      for (const x of reihe) {
        const [w, t] = KATALOG[x.typ].groesse;
        if (a.auswahl === x.id)
          raute(g, x.pos, x.typ, -0.05).stroke({ width: 3, color: farben.auswahl });
        zeichneRolle(
          g,
          x.typ,
          x.stufe,
          x.pos,
          x.farbe ? FARBWERT[x.farbe] : farben.familie[KATALOG[x.typ].familie],
          farben,
        );
        // Umriss des ganzen Gebäudes (Boden bis Dach) zum Antippen
        const e = ecken(x.pos.x, x.pos.y, w, t, 0);
        const h = hoehe(x.typ, x.stufe) + 20;
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
    feldBei(clientX, clientY) {
      const r = app.canvas.getBoundingClientRect();
      const x = ((clientX - r.left) / r.width) * BUEHNE_B;
      const y = ((clientY - r.top) / r.height) * BUEHNE_H;
      // Erst die Gebäude, von vorn nach hinten – auch ein Tipp aufs Dach trifft
      for (const z of [...treffer].reverse()) if (innen(z.umriss, x, y)) return z.pos;
      return feldUnter(x, y);
    },
    zerstoere() {
      app.destroy(true, { children: true });
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
