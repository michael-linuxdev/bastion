// Bauplatz als Grafik (ARCHITEKTUR T-6, BASEBAU B-11/B-12, Schritt 2.12):
// PixiJS, nachgeladen nur bei geöffneter Bastion. Draufsicht, schlichter eigener
// Stil aus Formen – austauschbar je Thema und Skin (B-17, B-18). Diese Datei ist
// der einzige Ort, der PixiJS importiert; die Listenansicht bleibt gleichwertig.
import { Application, Container, Graphics } from 'pixi.js';
import type { Bastion } from '../../../core/bastion/bauen';
import { BAUPLATZ, KATALOG, type Familie } from '../../../core/bastion/katalog';

export interface Farben {
  readonly boden: string;
  readonly raster: string;
  readonly linie: string;
  readonly familie: Readonly<Record<Familie, string>>;
  readonly imBau: string;
}

export interface Buehne {
  zeichne(b: Bastion): void;
  zerstoere(): void;
}

/** Größe eines Feldes in Bildpunkten – die Bühne wird per CSS auf die Breite skaliert */
const FELD = 40;

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
  ziel.append(app.canvas);

  const raster = new Graphics();
  for (let i = 0; i <= BAUPLATZ.breite; i++)
    raster.moveTo(i * FELD, 0).lineTo(i * FELD, BAUPLATZ.tiefe * FELD);
  for (let j = 0; j <= BAUPLATZ.tiefe; j++)
    raster.moveTo(0, j * FELD).lineTo(BAUPLATZ.breite * FELD, j * FELD);
  raster.stroke({ width: 1, color: farben.raster });
  const gebaeude = new Container();
  app.stage.addChild(raster, gebaeude);

  function form(
    g: Graphics,
    x: number,
    y: number,
    w: number,
    t: number,
    farbe: string,
    imBau: boolean,
  ) {
    const rand = 4;
    g.roundRect(x * FELD + rand, y * FELD + rand, w * FELD - 2 * rand, t * FELD - 2 * rand, 6);
    if (imBau) g.stroke({ width: 3, color: farben.imBau });
    else g.fill(farbe).stroke({ width: 2, color: farben.linie });
  }

  return {
    zeichne(b) {
      gebaeude.removeChildren().forEach((c) => c.destroy());
      const g = new Graphics();
      for (const x of b.bauwerke) {
        const [w, t] = KATALOG[x.typ].groesse;
        form(g, x.pos.x, x.pos.y, w, t, farben.familie[KATALOG[x.typ].familie], false);
      }
      // Neubauten im Bau: nur der Umriss
      for (const v of b.vorhaben.filter((x) => x.stufe === 1)) {
        const [w, t] = KATALOG[v.typ].groesse;
        form(g, v.pos.x, v.pos.y, w, t, farben.imBau, true);
      }
      gebaeude.addChild(g);
    },
    zerstoere() {
      app.destroy(true, { children: true });
    },
  };
}
