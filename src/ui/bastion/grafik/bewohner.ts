/**
 * Ruhige Bewohner der Bastion (Preferences „Bewohner“): Gartenzwerge u. a.
 * führen kleine Tätigkeiten aus. Freischaltung nur über Lern-/Bau-Fortschritt.
 * Keine Belohnung, kein Verfall, kein Timer-Druck. Deterministisch.
 */
import type { Bastion } from '../../../core/bastion/bauen';
import type { Epoche } from '../../../core/bastion/epochen';
import type { Bauwerk, Position } from '../../../core/bastion/katalog';
import type { Konto } from '../../../core/ledger/buchung';
import { bauplatzAktiv, type BauplatzMass } from './iso';
import { belegteFelder, feldMittePunkt, freiesFeld } from './pfad';

export type BewohnerArt = 'zwerg' | 'gaertner' | 'bibliothek' | 'torhueter';

export type Taetigkeit = 'giessen' | 'kehren' | 'lesen' | 'ruhen' | 'gaertnern' | 'schauen';

export interface BewohnerFortschritt {
  readonly gebaeude: number;
  readonly fertig: number;
  readonly buecher: number;
  readonly epoche: Epoche;
  readonly hatWissen: boolean;
  readonly hatTurm: boolean;
  readonly hatFlaeche: boolean;
  readonly hatZeichen: boolean;
  readonly leicht: boolean;
}

/** Ableitung aus Bastion/Konto/Büchern – rein, keine Datenhaltung. */
export function bewohnerFortschritt(
  bastion: Bastion,
  _konto: Konto,
  buecher: number,
  epoche: Epoche,
  leicht: boolean,
): BewohnerFortschritt {
  const typen = new Set(bastion.bauwerke.map((b) => b.typ));
  return {
    gebaeude: bastion.bauwerke.length,
    fertig: bastion.fertig.length,
    buecher,
    epoche,
    hatWissen: typen.has('wissen'),
    hatTurm: typen.has('turm'),
    hatFlaeche: typen.has('flaeche'),
    hatZeichen: typen.has('zeichen'),
    leicht,
  };
}

/**
 * Welche Bewohner-Arten sind freigeschaltet?
 * Reihenfolge fest; „leicht“ begrenzt auf 2.
 */
export function bewohnerArten(f: BewohnerFortschritt): readonly BewohnerArt[] {
  const max = f.leicht ? 2 : 4;
  const aus: BewohnerArt[] = [];
  // Erster Zwerg: sobald mehr als der Start-Kern steht oder etwas fertig wurde
  if (f.gebaeude >= 2 || f.fertig >= 1) aus.push('zwerg');
  // Gärtner: Beet/Platz oder zwei fertige Bauwerke
  if (f.hatFlaeche || f.hatZeichen || f.fertig >= 2) aus.push('gaertner');
  // Bibliothek: Wissensgebäude oder erstes behaltenes Thema (Buch)
  if (f.hatWissen || f.buecher >= 1) aus.push('bibliothek');
  // Torhüter: Turm oder Epoche 2+
  if (f.hatTurm || f.epoche >= 2) aus.push('torhueter');
  return aus.slice(0, max);
}

const TAETIGKEITEN: Readonly<Record<BewohnerArt, readonly Taetigkeit[]>> = {
  zwerg: ['giessen', 'kehren', 'ruhen'],
  gaertner: ['gaertnern', 'giessen', 'ruhen'],
  bibliothek: ['lesen', 'schauen', 'ruhen'],
  torhueter: ['schauen', 'kehren', 'ruhen'],
};

/** Ruhiger Tätigkeitswechsel alle 8 s – gleicher Zeitpunkt → gleiche Tätigkeit. */
export function taetigkeitFuer(art: BewohnerArt, jetztMs: number, index: number): Taetigkeit {
  const liste = TAETIGKEITEN[art];
  const slot = Math.floor(jetztMs / 8000) + index * 3;
  return liste[Math.abs(slot) % liste.length] ?? 'ruhen';
}

export interface BewohnerZustand {
  readonly id: string;
  readonly art: BewohnerArt;
  /** Ankerfeld (Boden) */
  readonly feld: Position;
  x: number;
  y: number;
  taetigkeit: Taetigkeit;
  phase: number;
  reactBis: number;
}

const FARBEN: Readonly<Record<BewohnerArt, string>> = {
  zwerg: '#c45c4a',
  gaertner: '#5a8f4a',
  bibliothek: '#6a6aaa',
  torhueter: '#6a7a8a',
};

export function bewohnerFarbe(art: BewohnerArt): string {
  return FARBEN[art];
}

function ankerFeld(
  art: BewohnerArt,
  index: number,
  bauwerke: readonly Bauwerk[],
  belegt: ReadonlySet<string>,
  platz: BauplatzMass,
): Position {
  const typBevorzugt =
    art === 'bibliothek'
      ? 'wissen'
      : art === 'torhueter'
        ? 'turm'
        : art === 'gaertner'
          ? 'flaeche'
          : 'zeichen';
  const geb = bauwerke.find((b) => b.typ === typBevorzugt);
  if (geb) {
    // Neben dem Gebäude, nicht darauf
    const kandidat = freiesFeld(geb.pos.x + geb.pos.y + index + 11, belegt, platz);
    return kandidat;
  }
  return freiesFeld(index * 5 + 3, belegt, platz);
}

/** Startliste aus Fortschritt und Bauplatz. */
export function bewohnerStarten(
  f: BewohnerFortschritt,
  bauwerke: readonly Bauwerk[],
  platz: BauplatzMass = bauplatzAktiv(),
): BewohnerZustand[] {
  const arten = bewohnerArten(f);
  const belegt = belegteFelder(bauwerke);
  return arten.map((art, i) => {
    const feld = ankerFeld(art, i, bauwerke, belegt, platz);
    const p = feldMittePunkt(feld);
    return {
      id: `b-${i}-${art}`,
      art,
      feld,
      x: p.x,
      y: p.y,
      taetigkeit: taetigkeitFuer(art, 0, i),
      phase: i * 1.1,
      reactBis: 0,
    };
  });
}

/** Tätigkeiten fortschreiben; leichte Wippe am Anker, kein Wanderdruck. */
export function bewohnerTick(b: BewohnerZustand, dt: number, jetzt: number, index: number): void {
  b.taetigkeit = taetigkeitFuer(b.art, jetzt, index);
  b.phase += dt * (b.taetigkeit === 'ruhen' ? 2 : 4);
  if (jetzt < b.reactBis) {
    b.y -= Math.sin(((b.reactBis - jetzt) / 400) * Math.PI) * 0.35;
    return;
  }
  // Kleine ruhige Bewegung am Platz (Gießen/Kehren): seitliches Wippen
  const amp = b.taetigkeit === 'ruhen' || b.taetigkeit === 'lesen' ? 0.4 : 1.2;
  const anker = feldMittePunkt(b.feld);
  b.x = anker.x + Math.sin(b.phase) * amp;
  b.y = anker.y + Math.abs(Math.sin(b.phase * 0.5)) * (b.taetigkeit === 'giessen' ? 0.8 : 0.3);
}

export function bewohnerReagieren(b: BewohnerZustand, jetzt: number): void {
  b.reactBis = jetzt + 400;
}
