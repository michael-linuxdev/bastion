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
  /** Dinge rund um den Bauplatz (Bilder in `kulisse/<thema>/dinge/`), der Reihe nach */
  readonly dinge: readonly string[];
  /** Wasser um die Insel: Schaumring, Tropfenringe bei Regen, Eisschollen bei Schnee */
  readonly wasser: boolean;
  /** Segelboot quert (nur auf dem Meer der Bastion) */
  readonly boot: boolean;
  /** Sterne auch am Tag (Weltraum) */
  readonly sterneImmer: boolean;
}

/**
 * Kulisse je Thema (GRAFIK §13, Auftrag Grafik Punkt 3): Bastion Meer rundherum,
 * Dorf Felder mit Hecken und Bach, Garten Wiese mit Teich, Unterwasser Riff in Schichten
 * mit Lichtstrahlen, Weltraum Kraterrand mit Planet und Sternen.
 */
const THEMEN: Record<Thema, KulissenThema> = {
  bastion: {
    himmel: {
      tag: ['#8ec9e8', '#d6ecf3'],
      daemmerung: ['#5c6096', '#f2a86b'],
      nacht: ['#0e1628', '#2e3e5e'],
    },
    grund: { tag: '#3e8fb0', daemmerung: '#465c82', nacht: '#14283a' },
    dinge: ['fels_1', 'fels_2', 'inselchen', 'fels_2', 'inselchen', 'fels_1'],
    wasser: true,
    boot: true,
    sterneImmer: false,
  },
  dorf: {
    himmel: {
      tag: ['#94cbe6', '#e2f0f2'],
      daemmerung: ['#5c6096', '#f2a86b'],
      nacht: ['#0e1628', '#2e3e5e'],
    },
    grund: { tag: '#74a44c', daemmerung: '#546a44', nacht: '#1e2a1c' },
    dinge: ['hecke', 'obstbaum', 'heuballen', 'teich', 'obstbaum', 'hecke'],
    wasser: false,
    boot: false,
    sterneImmer: false,
  },
  garten: {
    himmel: {
      tag: ['#9ad0ea', '#e8f4ee'],
      daemmerung: ['#5c6096', '#f2a86b'],
      nacht: ['#0e1628', '#2e3e5e'],
    },
    grund: { tag: '#5faa48', daemmerung: '#46703c', nacht: '#18281a' },
    dinge: ['blumenbusch', 'teich', 'hecke', 'obstbaum', 'blumenbusch', 'hecke'],
    wasser: false,
    boot: false,
    sterneImmer: false,
  },
  unterwasser: {
    himmel: {
      tag: ['#1f5e86', '#5fa8c8'],
      daemmerung: ['#20406a', '#4a7c9e'],
      nacht: ['#06101e', '#12304a'],
    },
    grund: { tag: '#cebc90', daemmerung: '#8a8070', nacht: '#2a2a2e' },
    dinge: ['koralle', 'fels', 'seetang', 'koralle', 'seetang', 'muschelfels'],
    wasser: false,
    boot: false,
    sterneImmer: false,
  },
  weltraum: {
    himmel: {
      tag: ['#080c1c', '#2a2e48'],
      daemmerung: ['#080c1c', '#3a2e48'],
      nacht: ['#04060e', '#141828'],
    },
    grund: { tag: '#94908a', daemmerung: '#6c6866', nacht: '#34323a' },
    dinge: ['krater', 'felsbrocken', 'kristall', 'schuessel', 'krater', 'kristall'],
    wasser: false,
    boot: false,
    sterneImmer: true,
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

/** Ein Ding um den Bauplatz: Bild, Lage in Feldern (außerhalb des Bauplatzes) */
export interface Ding {
  readonly bild: string;
  readonly gx: number;
  readonly gy: number;
}

/** Breite der Ding-Bilder in Bühnen-Bildpunkten (doppelt gezeichnet, Fuß unten Mitte) */
export const DING_BREITE = 80;

/** Feste Plätze rund um den Bauplatz (kein Zufall), wachsen mit der Bauplatzgröße */
export function dingeUmBauplatz(
  breite: number,
  tiefe: number,
  namen: readonly string[] = THEMEN.bastion.dinge,
): readonly Ding[] {
  const plaetze = [
    { gx: -2.6, gy: tiefe * 0.3 },
    { gx: breite + 1.8, gy: tiefe * 0.55 },
    { gx: breite * 0.7, gy: tiefe + 3.2 },
    { gx: -3.5, gy: tiefe + 1.5 },
    { gx: breite + 3.5, gy: -2.5 },
    { gx: breite * 0.2, gy: -3 },
  ];
  return plaetze.map((p, i) => ({ bild: namen[i % namen.length] ?? 'fels_1', ...p }));
}
