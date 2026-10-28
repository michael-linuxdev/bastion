// Bauplatz als Grafik (ARCHITEKTUR T-6, BASEBAU B-11/B-12, Schritte 2.12–2.13):
// PixiJS, nachgeladen nur bei geöffneter Bastion. Draufsicht, schlichter eigener
// Stil: je Rolle eine Form aus dem Code, Farbe je Gebäudefamilie – austauschbar
// je Thema und Skin (B-17, B-18). Diese Datei ist der einzige Ort, der PixiJS
// importiert; die Listenansicht bleibt gleichwertig.
import { Application, Container, Graphics } from 'pixi.js';
import type { Bastion } from '../../../core/bastion/bauen';
import {
  BAUPLATZ,
  KATALOG,
  type Familie,
  type GebaeudeTyp,
  type Position,
} from '../../../core/bastion/katalog';

export interface Farben {
  readonly boden: string;
  readonly raster: string;
  readonly linie: string;
  readonly familie: Readonly<Record<Familie, string>>;
  readonly imBau: string;
  readonly auswahl: string;
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

/** Größe eines Feldes in Bildpunkten – die Bühne wird per CSS auf die Breite skaliert */
const FELD = 40;

/** Schlichte Draufsicht je Rolle (B-12). x, y, w, t in Bildpunkten. */
function zeichneRolle(
  g: Graphics,
  typ: GebaeudeTyp,
  stufe: number,
  x: number,
  y: number,
  w: number,
  t: number,
  farbe: string,
  linie: string,
) {
  const m = { x: x + w / 2, y: y + t / 2 };
  const r = Math.min(w, t) / 2;
  const kontur = { width: 2, color: linie };
  switch (typ) {
    case 'kern': {
      // Turm mit Zinnen: Quadrat, innen ein zweites, Zinnen am Rand
      g.rect(x, y, w, t).fill(farbe).stroke(kontur);
      const z = w / 7;
      for (let i = 0; i < 7; i += 2) {
        g.rect(x + i * z, y - 3, z, 6)
          .fill(farbe)
          .stroke({ width: 1, color: linie });
        g.rect(x + i * z, y + t - 3, z, 6)
          .fill(farbe)
          .stroke({ width: 1, color: linie });
      }
      g.rect(x + w * 0.3, y + t * 0.3, w * 0.4, t * 0.4).stroke(kontur);
      break;
    }
    case 'turm':
      g.circle(m.x, m.y, r).fill(farbe).stroke(kontur);
      g.circle(m.x, m.y, r * 0.45).stroke({ width: 1.5, color: linie });
      break;
    case 'werkstatt':
      // Dach von oben: Rechteck mit First
      g.rect(x, y, w, t).fill(farbe).stroke(kontur);
      g.moveTo(x, y)
        .lineTo(m.x, m.y)
        .lineTo(x + w, y)
        .moveTo(x, y + t)
        .lineTo(m.x, m.y)
        .lineTo(x + w, y + t);
      g.stroke({ width: 1.5, color: linie });
      break;
    case 'wissen':
      // offenes Buch
      g.roundRect(x, y, w, t, 4).fill(farbe).stroke(kontur);
      g.moveTo(m.x, y + t * 0.2).lineTo(m.x, y + t * 0.8);
      for (const f of [0.35, 0.5, 0.65]) {
        g.moveTo(x + w * 0.2, y + t * f).lineTo(x + w * 0.42, y + t * f);
        g.moveTo(x + w * 0.58, y + t * f).lineTo(x + w * 0.8, y + t * f);
      }
      g.stroke({ width: 1.5, color: linie });
      break;
    case 'eingang':
      // Torbogen: Rechteck mit Durchgang
      g.rect(x, y, w, t).fill(farbe).stroke(kontur);
      g.roundRect(x + w * 0.3, y + t * 0.35, w * 0.4, t * 0.65, 6).fill(linie);
      break;
    case 'einfassung':
      // drei Pfähle
      for (let i = 0; i < 3; i++)
        g.roundRect(x + (w / 3) * i + 2, y + 2, w / 3 - 4, t - 4, 3)
          .fill(farbe)
          .stroke({ width: 1, color: linie });
      break;
    case 'ursprung':
      g.circle(m.x, m.y, r * 0.9)
        .fill(farbe)
        .stroke(kontur);
      g.poly([
        m.x,
        m.y - r * 0.55,
        m.x + r * 0.35,
        m.y + r * 0.4,
        m.x - r * 0.35,
        m.y + r * 0.4,
      ]).fill(linie);
      break;
    case 'zeichen':
      // Mast mit Fahne
      g.moveTo(x + w * 0.3, y + t * 0.1)
        .lineTo(x + w * 0.3, y + t * 0.9)
        .stroke({ width: 2.5, color: linie });
      g.poly([x + w * 0.3, y + t * 0.12, x + w * 0.85, y + t * 0.3, x + w * 0.3, y + t * 0.5])
        .fill(farbe)
        .stroke({ width: 1, color: linie });
      break;
    case 'flaeche': {
      g.roundRect(x, y, w, t, 10).fill(farbe).stroke(kontur);
      for (const [fx, fy] of [
        [0.3, 0.3],
        [0.7, 0.35],
        [0.4, 0.7],
        [0.72, 0.72],
        [0.5, 0.5],
      ] as const)
        g.circle(x + w * fx, y + t * fy, r * 0.12).fill(linie);
      break;
    }
    case 'denkmal':
      g.poly([m.x, y, x + w, m.y, m.x, y + t, x, m.y])
        .fill(farbe)
        .stroke(kontur);
      g.circle(m.x, m.y, r * 0.2).fill(linie);
      break;
  }
  // Stufe als Punkte unten rechts (ab Stufe 2)
  for (let i = 0; i < stufe && stufe > 1; i++)
    g.circle(x + w - 5 - i * 7, y + t - 5, 2.5).fill(linie);
}

export async function buehneErstellen(ziel: HTMLElement, farben: Farben): Promise<Buehne> {
  const app = new Application();
  await app.init({
    width: BAUPLATZ.breite * FELD,
    height: BAUPLATZ.tiefe * FELD,
    background: farben.boden,
    antialias: true,
    resolution: Math.min(2, globalThis.devicePixelRatio || 1),
    autoDensity: true,
    // keine Erweiterungen nachladen, die wir nicht brauchen (Größe, A3)
    manageImports: false,
    preference: 'webgl',
  });
  app.canvas.style.inlineSize = '100%';
  app.canvas.style.blockSize = 'auto';
  app.canvas.style.display = 'block';
  ziel.append(app.canvas);

  const raster = new Graphics();
  for (let i = 0; i <= BAUPLATZ.breite; i++)
    raster.moveTo(i * FELD, 0).lineTo(i * FELD, BAUPLATZ.tiefe * FELD);
  for (let j = 0; j <= BAUPLATZ.tiefe; j++)
    raster.moveTo(0, j * FELD).lineTo(BAUPLATZ.breite * FELD, j * FELD);
  raster.stroke({ width: 1, color: farben.raster });
  const gebaeude = new Container();
  app.stage.addChild(raster, gebaeude);

  const rand = 5;
  const rechteck = (pos: Position, typ: GebaeudeTyp) => {
    const [w, t] = KATALOG[typ].groesse;
    return [
      pos.x * FELD + rand,
      pos.y * FELD + rand,
      w * FELD - 2 * rand,
      t * FELD - 2 * rand,
    ] as const;
  };

  return {
    zeichne(b, a) {
      gebaeude.removeChildren().forEach((c) => c.destroy());
      const g = new Graphics();
      for (const x of b.bauwerke) {
        const [px, py, w, t] = rechteck(x.pos, x.typ);
        zeichneRolle(
          g,
          x.typ,
          x.stufe,
          px,
          py,
          w,
          t,
          farben.familie[KATALOG[x.typ].familie],
          farben.linie,
        );
        if (a.auswahl === x.id)
          g.roundRect(px - 4, py - 4, w + 8, t + 8, 8).stroke({ width: 3, color: farben.auswahl });
      }
      // Neubauten im Bau: gestrichelt wirkender Umriss
      for (const v of b.vorhaben.filter((x) => x.stufe === 1)) {
        const [px, py, w, t] = rechteck(v.pos, v.typ);
        g.roundRect(px, py, w, t, 6).stroke({ width: 3, color: farben.imBau });
        g.moveTo(px, py)
          .lineTo(px + w, py + t)
          .stroke({ width: 1, color: farben.imBau });
      }
      if (a.ziel) {
        const [px, py, w, t] = rechteck(a.ziel.pos, a.ziel.typ);
        g.roundRect(px - 2, py - 2, w + 4, t + 4, 6).stroke({
          width: 3,
          color: a.ziel.frei ? farben.auswahl : farben.linie,
          alpha: a.ziel.frei ? 1 : 0.4,
        });
      }
      gebaeude.addChild(g);
    },
    feldBei(clientX, clientY) {
      const r = app.canvas.getBoundingClientRect();
      const x = Math.floor(((clientX - r.left) / r.width) * BAUPLATZ.breite);
      const y = Math.floor(((clientY - r.top) / r.height) * BAUPLATZ.tiefe);
      return x >= 0 && y >= 0 && x < BAUPLATZ.breite && y < BAUPLATZ.tiefe ? { x, y } : undefined;
    },
    zerstoere() {
      app.destroy(true, { children: true });
    },
  };
}
