/**
 * Kulisse hinter dem Bauplatz (GRAFIK.md §13, Wunsch PV 02.11.2026): Himmel als
 * Verlauf, darunter Bänder aus dem Generator (`tools/grafik/sprites-g3-kulisse.py`),
 * waagrecht wiederholt, damit sie jedes Seitenverhältnis füllen. Rein: keine
 * Browser-APIs, damit der Test dieselbe Rechnung prüft wie die Oberfläche.
 */
import type { Kamera } from './kamera';
import type { Sonnenzeiten } from './sonne';
import type { Thema } from '../../../core/policy/einstellung';

export type Stimmung = 'tag' | 'daemmerung' | 'nacht';

export interface KulissenThema {
  /** Himmel oben → unten je Stimmung */
  readonly himmel: Readonly<Record<Stimmung, readonly [string, string]>>;
  /** Grundfarbe unter den Bändern (Meer, Feld …), falls ein Bild fehlt */
  readonly grund: Readonly<Record<Stimmung, string>>;
}

/** Bisher nur das Thema `bastion`; die anderen behalten den Himmel der Bühne. */
const THEMEN: Partial<Record<Thema, KulissenThema>> = {
  bastion: {
    himmel: {
      tag: ['#8ec9e8', '#d6ecf3'],
      daemmerung: ['#5c6096', '#f2a86b'],
      nacht: ['#0e1628', '#2e3e5e'],
    },
    grund: { tag: '#3e8fb0', daemmerung: '#465c82', nacht: '#14283a' },
  },
};

export function kulisseFuer(thema: Thema): KulissenThema | undefined {
  return THEMEN[thema];
}

/**
 * Stimmung aus Abend-Schalter und Sonnenzeiten: bis eine Stunde nach Untergang und
 * ab 45 Minuten vor Aufgang Dämmerung, dazwischen Nacht. Kein Timer: die Oberfläche
 * fragt nur nach, wenn sich die Minute ohnehin ändert.
 */
export function stimmungAus(abend: boolean, jetzt: Date, zeiten: Sonnenzeiten): Stimmung {
  if (!abend) return 'tag';
  const m = jetzt.getHours() * 60 + jetzt.getMinutes();
  const nachUntergang = m >= zeiten.untergangMin && m < zeiten.untergangMin + 60;
  const vorAufgang = m < zeiten.aufgangMin && m >= zeiten.aufgangMin - 45;
  return nachUntergang || vorAufgang ? 'daemmerung' : 'nacht';
}

/** Bandmaße in CSS-Pixeln (Bilder sind doppelt gezeichnet) */
export const HORIZONT = { breite: 1024, hoehe: 144, wasser: 118 } as const;
export const MEER = { breite: 128, hoehe: 64 } as const;
export const STERNE = 256;
/** Abstand des Horizonts über der Inselspitze in Bühnen-Bildpunkten (Variante C, PV) */
export const HORIZONT_ABSTAND = 520;
/** Der ferne Horizont erscheint kleiner als die Insel */
const HORIZONT_SKALA = 0.55;

export interface KulissenLage {
  /** Wasserlinie des Horizonts im Fenster; negativ = über dem Fenster (nur Meer) */
  readonly horizontY: number;
  /** Maßstab des Horizont-Bands */
  readonly horizontSkala: number;
  /** Waagrechte Verschiebung des Horizonts (weit weg: kaum Bewegung) */
  readonly horizontX: number;
}

/**
 * Lage der Kulisse zur Kamera (Variante C, PV 02.11.2026): Meer rundherum; der
 * Horizont liegt weit über der Insel. Beim Herauszoomen rückt er ins Bild, beim
 * Hineinzoomen verschwindet er oben.
 * @param inselOben Spitze des Bauplatzes in Bühnen-Bildpunkten (`himmelFuer`)
 */
export function kulissenLage(k: Kamera, inselOben: number): KulissenLage {
  return {
    horizontY: k.y + (inselOben - HORIZONT_ABSTAND) * k.zoom,
    horizontSkala: HORIZONT_SKALA * (0.6 + 0.4 * k.zoom),
    horizontX: k.x * 0.25,
  };
}

/** Ein Ding im Meer: Bild, Lage in Feldern (darf außerhalb des Bauplatzes liegen), Maßstab */
export interface Ding {
  readonly bild: 'fels_1' | 'fels_2' | 'inselchen' | 'boot';
  readonly gx: number;
  readonly gy: number;
}

/** Bildmaße der Dinge in Bühnen-Bildpunkten (Bilder doppelt gezeichnet, Fuß unten Mitte) */
export const DING_MASS: Readonly<Record<Ding['bild'], { readonly w: number; readonly h: number }>> =
  {
    fels_1: { w: 80, h: 34 },
    fels_2: { w: 80, h: 29 },
    inselchen: { w: 80, h: 63 },
    boot: { w: 80, h: 57 },
  };

/** Feste Plätze rund um den Bauplatz (kein Zufall), wachsen mit der Bauplatzgröße */
export function dingeUmBauplatz(breite: number, tiefe: number): readonly Ding[] {
  return [
    { bild: 'fels_1', gx: -2.6, gy: tiefe * 0.3 },
    { bild: 'fels_2', gx: breite + 1.8, gy: tiefe * 0.55 },
    { bild: 'inselchen', gx: breite * 0.7, gy: tiefe + 3.2 },
    { bild: 'fels_2', gx: -3.5, gy: tiefe + 1.5 },
    { bild: 'inselchen', gx: breite + 3.5, gy: -2.5 },
    { bild: 'fels_1', gx: breite * 0.2, gy: -3 },
  ];
}
