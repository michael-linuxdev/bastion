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

export type BewohnerArt = 'zwerg' | 'gaertner' | 'bibliothek' | 'torhueter' | 'handwerk' | 'imker';

export type Taetigkeit =
  | 'giessen'
  | 'kehren'
  | 'lesen'
  | 'ruhen'
  | 'gaertnern'
  | 'schauen'
  | 'pflanzen'
  | 'ordnen'
  | 'flicken'
  | 'wachen'
  | 'sammeln';

export interface BewohnerFortschritt {
  readonly gebaeude: number;
  readonly fertig: number;
  readonly buecher: number;
  readonly epoche: Epoche;
  readonly hatWissen: boolean;
  readonly hatTurm: boolean;
  readonly hatFlaeche: boolean;
  readonly hatZeichen: boolean;
  readonly hatWerkstatt: boolean;
  readonly hatEingang: boolean;
  readonly hatDenkmal: boolean;
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
    hatWerkstatt: typen.has('werkstatt'),
    hatEingang: typen.has('eingang'),
    hatDenkmal: typen.has('denkmal'),
    leicht,
  };
}

/** Kurzer Schlüssel für Szene-Neustart (ohne Objekte). */
export function bewohnerFortschrittKey(f: BewohnerFortschritt): string {
  return [
    f.gebaeude,
    f.fertig,
    f.buecher,
    f.epoche,
    +f.hatWissen,
    +f.hatTurm,
    +f.hatFlaeche,
    +f.hatZeichen,
    +f.hatWerkstatt,
    +f.hatEingang,
    +f.hatDenkmal,
    +f.leicht,
  ].join('|');
}

/**
 * Welche Bewohner-Arten sind freigeschaltet?
 * Reihenfolge fest und an Fortschritt gekoppelt; „leicht“ begrenzt auf 2.
 */
export function bewohnerArten(f: BewohnerFortschritt): readonly BewohnerArt[] {
  const max = f.leicht ? 2 : 6;
  const aus: BewohnerArt[] = [];
  // Gartenzwerg: Dorf/Garten belebt, sobald mehr als der Start-Kern steht oder etwas fertig ist
  if (f.gebaeude >= 2 || f.fertig >= 1) aus.push('zwerg');
  // Gärtnerin: Beet/Platz oder zwei fertige Vorhaben
  if (f.hatFlaeche || f.hatZeichen || f.fertig >= 2) aus.push('gaertner');
  // Bücherwurm: Wissensgebäude oder behaltenes Thema (Buch)
  if (f.hatWissen || f.buecher >= 1) aus.push('bibliothek');
  // Torhüter: Turm, Tor oder Epoche 2+
  if (f.hatTurm || f.hatEingang || f.epoche >= 2) aus.push('torhueter');
  // Handwerkerin: Werkstatt oder drei fertige Vorhaben
  if (f.hatWerkstatt || f.fertig >= 3) aus.push('handwerk');
  // Imkerin: Beet plus Fortschritt, Denkmal oder vier fertige Vorhaben
  if ((f.hatFlaeche && f.fertig >= 2) || f.hatDenkmal || f.fertig >= 4) aus.push('imker');
  return aus.slice(0, max);
}

const TAETIGKEITEN: Readonly<Record<BewohnerArt, readonly Taetigkeit[]>> = {
  zwerg: ['giessen', 'kehren', 'ruhen', 'schauen'],
  gaertner: ['gaertnern', 'giessen', 'pflanzen', 'sammeln', 'ruhen'],
  bibliothek: ['lesen', 'ordnen', 'schauen', 'ruhen'],
  torhueter: ['wachen', 'schauen', 'kehren', 'ruhen'],
  handwerk: ['flicken', 'ordnen', 'kehren', 'ruhen'],
  imker: ['schauen', 'sammeln', 'giessen', 'ruhen'],
};

/**
 * Ruhiger Tätigkeitswechsel alle 8 s – gleicher Zeitpunkt → gleiche Tätigkeit.
 * Bei mehr Büchern / Beet / Werkstatt bevorzugt die Liste passende Tätigkeiten
 * (nur Auswahl aus der festen Liste, kein Zufall).
 */
export function taetigkeitFuer(
  art: BewohnerArt,
  jetztMs: number,
  index: number,
  f?: Pick<
    BewohnerFortschritt,
    'buecher' | 'hatFlaeche' | 'hatWerkstatt' | 'hatWissen' | 'fertig' | 'epoche'
  >,
): Taetigkeit {
  let liste = TAETIGKEITEN[art];
  if (f) {
    if (art === 'bibliothek' && (f.buecher >= 2 || f.hatWissen)) {
      liste = ['lesen', 'ordnen', 'lesen', 'schauen'];
    } else if (art === 'gaertner' && f.hatFlaeche) {
      liste = ['gaertnern', 'pflanzen', 'giessen', 'sammeln'];
    } else if (art === 'handwerk' && f.hatWerkstatt) {
      liste = ['flicken', 'ordnen', 'flicken', 'ruhen'];
    } else if (art === 'torhueter' && f.epoche >= 2) {
      liste = ['wachen', 'schauen', 'wachen', 'kehren'];
    } else if (art === 'imker' && f.fertig >= 3) {
      liste = ['sammeln', 'schauen', 'giessen', 'ruhen'];
    }
  }
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
  handwerk: '#8a6a3a',
  imker: '#c9a03a',
};

const MUETZE: Readonly<Record<BewohnerArt, string>> = {
  zwerg: '#b03a2e',
  gaertner: '#3a6a38',
  bibliothek: '#4a4a88',
  torhueter: '#4a5a6a',
  handwerk: '#5a4030',
  imker: '#e8d878',
};

export function bewohnerFarbe(art: BewohnerArt): string {
  return FARBEN[art];
}

export function bewohnerMuetze(art: BewohnerArt): string {
  return MUETZE[art];
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
        ? bauwerke.some((b) => b.typ === 'turm')
          ? 'turm'
          : 'eingang'
        : art === 'gaertner' || art === 'imker'
          ? bauwerke.some((b) => b.typ === 'flaeche')
            ? 'flaeche'
            : 'zeichen'
          : art === 'handwerk'
            ? 'werkstatt'
            : art === 'zwerg'
              ? bauwerke.some((b) => b.typ === 'denkmal')
                ? 'denkmal'
                : 'zeichen'
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
      taetigkeit: taetigkeitFuer(art, 0, i, f),
      phase: i * 1.1,
      reactBis: 0,
    };
  });
}

/** Tätigkeiten fortschreiben; leichte Wippe am Anker, kein Wanderdruck. */
export function bewohnerTick(
  b: BewohnerZustand,
  dt: number,
  jetzt: number,
  index: number,
  f?: BewohnerFortschritt,
): void {
  b.taetigkeit = taetigkeitFuer(b.art, jetzt, index, f);
  const ruhigArt =
    b.taetigkeit === 'ruhen' || b.taetigkeit === 'lesen' || b.taetigkeit === 'wachen';
  b.phase += dt * (ruhigArt ? 2 : 4);
  if (jetzt < b.reactBis) {
    b.y -= Math.sin(((b.reactBis - jetzt) / 400) * Math.PI) * 0.35;
    return;
  }
  // Kleine ruhige Bewegung am Platz: seitliches Wippen
  const amp = ruhigArt ? 0.4 : 1.2;
  const anker = feldMittePunkt(b.feld);
  b.x = anker.x + Math.sin(b.phase) * amp;
  const huepf =
    b.taetigkeit === 'giessen' || b.taetigkeit === 'pflanzen' || b.taetigkeit === 'sammeln'
      ? 0.8
      : 0.3;
  b.y = anker.y + Math.abs(Math.sin(b.phase * 0.5)) * huepf;
}

export function bewohnerReagieren(b: BewohnerZustand, jetzt: number): void {
  b.reactBis = jetzt + 400;
}
