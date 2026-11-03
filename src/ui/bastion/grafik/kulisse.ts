/**
 * Kulisse hinter dem Bauplatz (GRAFIK.md §13, Wunsch PV 02.11.2026): Himmel als
 * Verlauf, darunter Bänder aus dem Generator (`tools/grafik/sprites-g3-kulisse.py`),
 * waagrecht wiederholt, damit sie jedes Seitenverhältnis füllen. Rein: keine
 * Browser-APIs, damit der Test dieselbe Rechnung prüft wie die Oberfläche.
 */
import type { Kamera } from './kamera';
import type { Sonnenzeiten } from './sonne';
import type { Thema } from '../../../core/policy/einstellung';
import type { Jahreszeit } from './jahreszeit';

export type Stimmung = 'tag' | 'daemmerung' | 'nacht';

/** Bewegtes in der Kulisse: Möwen, grasende Tiere, Schmetterlinge, Fischschwarm, Satellit */
export type LebenArt = 'moewen' | 'grasen' | 'schmetterlinge' | 'schwarm' | 'satellit';

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
  /** Weitere Dinge, locker verteilt bis an den Bildrand (Wunsch PV: mehr Leben, G14) */
  readonly weitere: readonly string[];
  /** Flächen am Boden, zwei Felder breit (Acker, Sandbank, Beet …), liegen unter allem */
  readonly flaechen: readonly string[];
  /** Was sich in der Kulisse ruhig bewegt */
  readonly leben: readonly LebenArt[];
  /** Wie viele Formen es von einem Ding gibt (`<name>_2.png`, `<name>_3.png`, G15) */
  readonly varianten: Readonly<Record<string, number>>;
  /** Dinge mit eigenem Bild je Jahreszeit (`<name>_<jahreszeit>.png`, G13) */
  readonly jahreszeitDinge: readonly string[];
  /** Boden und Horizont folgen der Jahreszeit (nur über Land) */
  readonly jahreszeitBoden: boolean;
}

/** Bild eines Dings in der Jahreszeit: eigenes Bild, wenn es eines gibt; Sommer ohne Zusatz */
export function dingBild(thema: KulissenThema, name: string, jz: Jahreszeit, variante = 1): string {
  const v = variante > 1 && variante <= (thema.varianten[name] ?? 1) ? `_${variante}` : '';
  return jz !== 'sommer' && thema.jahreszeitDinge.includes(name)
    ? `${name}${v}_${jz}`
    : `${name}${v}`;
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
    // Leuchtturm selten (einer von sechzehn), Felsen und Bojen oft
    weitere: [
      'fels_2',
      'boje',
      'fels_1',
      'inselchen',
      'fels_2',
      'fels_1',
      'boje',
      'inselchen',
      'fels_2',
      'leuchtturm',
      'fels_1',
      'boje',
      'fels_2',
      'inselchen',
      'fels_1',
      'boje',
    ],
    flaechen: ['sandbank', 'riff', 'riff', 'sandbank'],
    leben: ['moewen'],
    varianten: { sandbank: 3, riff: 3 },
    jahreszeitDinge: ['inselchen'],
    jahreszeitBoden: true,
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
    weitere: [
      'baumgruppe',
      'kuh',
      'hecke',
      'schaf',
      'zaun',
      'obstbaum',
      'schaf',
      'heuballen',
      'baumgruppe',
      'kuh',
    ],
    flaechen: ['acker', 'acker', 'teich', 'acker'],
    leben: ['grasen'],
    varianten: { acker: 3, baumgruppe: 3 },
    jahreszeitDinge: ['hecke', 'obstbaum', 'teich', 'acker', 'baumgruppe', 'zaun'],
    jahreszeitBoden: true,
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
    weitere: [
      'baumgruppe',
      'blumenbusch',
      'bank',
      'hecke',
      'vogeltraenke',
      'obstbaum',
      'blumenbusch',
      'baumgruppe',
    ],
    flaechen: ['beet', 'teich', 'beet'],
    leben: ['schmetterlinge'],
    varianten: { beet: 3, baumgruppe: 3 },
    jahreszeitDinge: [
      'blumenbusch',
      'teich',
      'hecke',
      'obstbaum',
      'beet',
      'baumgruppe',
      'bank',
      'vogeltraenke',
    ],
    jahreszeitBoden: true,
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
    weitere: [
      'anemone',
      'seetang',
      'seestern',
      'koralle',
      'fels',
      'anemone',
      'seetang',
      'muschelfels',
    ],
    flaechen: ['seegras', 'sandrippel', 'seegras'],
    leben: ['schwarm'],
    varianten: { seegras: 3, sandrippel: 3 },
    jahreszeitDinge: [],
    jahreszeitBoden: false,
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
    weitere: [
      'geroell',
      'eisbrocken',
      'krater',
      'antenne',
      'felsbrocken',
      'geroell',
      'kristall',
      'eisbrocken',
    ],
    flaechen: ['kraterfeld', 'kraterfeld'],
    leben: ['satellit'],
    varianten: { kraterfeld: 3, geroell: 3, eisbrocken: 3 },
    jahreszeitDinge: [],
    jahreszeitBoden: false,
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
  /** Breite in Bühnen-Bildpunkten (Standard DING_BREITE) */
  readonly breite?: number;
  /** Fläche am Boden: liegt unter den anderen Dingen */
  readonly flach?: boolean;
  /** Welche Form (1 = Grundbild, 2, 3 …), siehe `varianten` */
  readonly variante?: number;
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

/** Feste Mischzahl 0 … 1 (kein Zufall zur Laufzeit) */
function misch(a: number, b: number, k: number, szenerie = 0): number {
  let h = (Math.imul(a + 101, 2654435761) ^ Math.imul(b + 307, 2246822519) ^ (k * 97)) >>> 0;
  // Eigene Szenerie des Kindes: der Startwert mischt alles neu (0 = Grundszenerie)
  if (szenerie !== 0) h = (Math.imul(h ^ szenerie, 2246822519) ^ (h >>> 13)) >>> 0;
  return ((h >>> 9) % 10000) / 10000;
}

/** Wie weit die Kulisse um den Bauplatz reicht (Felder) – bis über den Bildrand */
export const KULISSE_WEITE = 44;

/**
 * Alle Dinge der Kulisse (Wunsch PV 03.11.2026: weniger leere Fläche): die sechs
 * festen Plätze am Bauplatz, dazu locker verteilte Dinge und Flächen bis weit hinaus.
 * Raster mit fester Verschiebung je Zelle, kein Zufall. Nichts liegt auf dem Bauplatz
 * oder direkt am Rand; weiter weg wird es lockerer. Reihenfolge: erst die Flächen,
 * dann alles nach Tiefe (hinten zuerst), damit Vorderes vorn liegt.
 */
export function kulissenDinge(
  breite: number,
  tiefe: number,
  thema: KulissenThema,
  /** Szenerie-Startwert des Kindes (Einstellung `basebau.szenerie`); 0 = Grundszenerie */
  szenerie = 0,
): readonly Ding[] {
  // Auch die sechs Plätze am Bauplatz tragen je Szenerie andere Dinge
  const versatz = szenerie % thema.dinge.length;
  const nah = dingeUmBauplatz(breite, tiefe, [
    ...thema.dinge.slice(versatz),
    ...thema.dinge.slice(0, versatz),
  ]);
  const weit: Ding[] = [];
  const schritt = 3.4;
  const w = KULISSE_WEITE;
  let n = 0;
  for (let i = 0; -w + i * schritt < breite + w; i++)
    for (let j = 0; -w + j * schritt < tiefe + w; j++) {
      const gx = -w + i * schritt + (misch(i, j, 1, szenerie) - 0.5) * schritt * 0.8;
      const gy = -w + j * schritt + (misch(i, j, 2, szenerie) - 0.5) * schritt * 0.8;
      // Abstand zum Bauplatz (0 = am Rand)
      const ax = gx < 0 ? -gx : gx > breite ? gx - breite : 0;
      const ay = gy < 0 ? -gy : gy > tiefe ? gy - tiefe : 0;
      const abstand = Math.max(ax, ay);
      if (abstand < 2.2) continue;
      if (nah.some((d) => Math.hypot(d.gx - gx, d.gy - gy) < 2.4)) continue;
      // nah dichter, weit lockerer
      let dichte = abstand < 9 ? 0.6 : abstand < 18 ? 0.34 : abstand < 30 ? 0.2 : 0.12;
      // Oben (hinter dem Bauplatz, Bildschirm-y folgt gx + gy) ist bis zum Horizont weniger
      // Platz zu sehen als unten: dort etwas dichter, damit beide Hälften gleich voll wirken
      if (gx + gy < (breite + tiefe) / 2) dichte *= 1.35;
      if (misch(i, j, 3, szenerie) > dichte) continue;
      const flach = thema.flaechen.length > 0 && misch(i, j, 4, szenerie) < 0.2;
      const liste = flach ? thema.flaechen : thema.weitere.length ? thema.weitere : thema.dinge;
      // Reihenfolge der Liste mit fester Verschiebung je Zelle, damit nichts im Takt wiederholt
      n += 1 + Math.floor(misch(i, j, 5, szenerie) * 3);
      const bild = liste[n % liste.length] ?? liste[0] ?? 'fels_1';
      // Größe schwankt etwas (Flächen 2–3 Felder, Dinge 0,85–1,15)
      const g = misch(i, j, 6, szenerie);
      const bildBreite = Math.round(DING_BREITE * (flach ? 2 + g : 0.85 + g * 0.3));
      // Form: jede Variante gleich oft, je Zelle fest
      const formen = thema.varianten[bild] ?? 1;
      const variante = 1 + Math.floor(misch(i, j, 7, szenerie) * formen);
      weit.push({
        bild,
        gx,
        gy,
        breite: bildBreite,
        ...(flach ? { flach: true } : {}),
        ...(variante > 1 ? { variante } : {}),
      });
    }
  const tiefeVon = (d: Ding) => d.gx + d.gy;
  return [
    ...weit.filter((d) => d.flach).sort((a, b) => tiefeVon(a) - tiefeVon(b)),
    ...[...nah, ...weit.filter((d) => !d.flach)].sort((a, b) => tiefeVon(a) - tiefeVon(b)),
  ];
}
