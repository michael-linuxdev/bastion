/**
 * Friedliche Wesen in der Bastion-Szene (GRAFIK §4.4).
 * Anzahl steigt mit gebauten Gebäuden; bei „ruhig“ aus. Kein Zufall.
 * Bodenwesen laufen um Gebäude herum (Pfadfindung).
 */
import type { Bauwerk, Position } from '../../../core/bastion/katalog';
import type { Thema } from '../../../core/policy/einstellung';
import { bauplatzAktiv, buehneBreite, buehneHoehe, type BauplatzMass } from './iso';
import { belegteFelder, bildZuFeld, feldMittePunkt, freiesFeld, pfadSuchen } from './pfad';

type Platz = BauplatzMass;

export type WesenArt =
  | 'huhn'
  | 'katze'
  | 'spatz'
  | 'biene'
  | 'schnecke'
  | 'schmetterling'
  | 'fisch'
  | 'qualle'
  | 'krebs'
  | 'drohne'
  | 'roboter'
  | 'moewe'
  | 'fuchs'
  | 'wache';

export interface WesenArtInfo {
  readonly art: WesenArt;
  readonly farbe: string;
  readonly skala: number;
}

/** Arten je Thema – G4: Dorf vollständig, andere vorbereitet. */
export function wesenArten(thema: Thema): readonly WesenArtInfo[] {
  switch (thema) {
    case 'dorf':
      return [
        { art: 'huhn', farbe: '#e8dcc8', skala: 1 },
        { art: 'katze', farbe: '#c4a574', skala: 1.05 },
        { art: 'spatz', farbe: '#6b5a4a', skala: 0.75 },
      ];
    case 'garten':
      return [
        { art: 'biene', farbe: '#e6c35c', skala: 0.7 },
        { art: 'schnecke', farbe: '#b89b7a', skala: 0.85 },
        { art: 'schmetterling', farbe: '#d478a0', skala: 0.8 },
      ];
    case 'unterwasser':
      return [
        { art: 'fisch', farbe: '#5a9ccc', skala: 0.85 },
        { art: 'qualle', farbe: '#d4a0e0', skala: 0.9 },
        { art: 'krebs', farbe: '#d4784a', skala: 0.8 },
      ];
    case 'weltraum':
      return [
        { art: 'drohne', farbe: '#a0e8d4', skala: 0.7 },
        { art: 'roboter', farbe: '#8a96a8', skala: 0.9 },
      ];
    case 'bastion':
      return [
        { art: 'moewe', farbe: '#e8e4dc', skala: 0.8 },
        { art: 'fuchs', farbe: '#c4783a', skala: 1 },
        { art: 'wache', farbe: '#6a7a8a', skala: 1 },
      ];
  }
}

/**
 * Anzahl Wesen: leerer Platz 1, dann +1 je ~3 Gebäude, max. 5 (voll) bzw. 3 (leicht).
 */
export function wesenAnzahl(gebaeude: number, leicht: boolean): number {
  const max = leicht ? 3 : 5;
  if (gebaeude <= 0) return Math.min(1, max);
  return Math.min(max, 1 + Math.floor(gebaeude / 3));
}

/** Fliegende / schwimmende Arten dürfen Gebäude überqueren. */
export function wesenFliegt(art: WesenArt): boolean {
  return (
    art === 'spatz' ||
    art === 'biene' ||
    art === 'schmetterling' ||
    art === 'fisch' ||
    art === 'qualle' ||
    art === 'drohne' ||
    art === 'moewe'
  );
}

export interface WesenZustand {
  readonly id: string;
  readonly art: WesenArt;
  readonly farbe: string;
  readonly skala: number;
  /** Position in Bildpunkten */
  x: number;
  y: number;
  /** Zielpunkt fürs Gehen */
  zx: number;
  zy: number;
  /** Weitere Wegpunkte (Bildpunkte) nach dem aktuellen Ziel */
  weg: { x: number; y: number }[];
  /** Blickrichtung: 1 rechts, -1 links */
  richtung: 1 | -1;
  /** Reaktion bis performance.now()-Zeitstempel */
  reactBis: number;
  phase: number;
}

function klemmen(p: { x: number; y: number }): { x: number; y: number } {
  return {
    x: Math.min(buehneBreite() - 8, Math.max(8, p.x)),
    y: Math.min(buehneHoehe() - 8, Math.max(40, p.y)),
  };
}

function zielSetzen(w: WesenZustand, felder: Position[], fliegt: boolean): void {
  if (felder.length === 0) return;
  const punkte = felder.map((f) => klemmen(feldMittePunkt(f)));
  // Flieger: Direktflug zum letzten Punkt; Boden: entlang der Felder
  if (fliegt) {
    const ende = punkte[punkte.length - 1];
    if (!ende) return;
    w.zx = ende.x;
    w.zy = ende.y;
    w.weg = [];
  } else {
    const erst = punkte[0];
    if (!erst) return;
    w.zx = erst.x;
    w.zy = erst.y;
    w.weg = punkte.slice(1);
  }
  w.richtung = w.zx >= w.x ? 1 : -1;
}

function neuesZiel(
  w: WesenZustand,
  index: number,
  jetzt: number,
  belegt: ReadonlySet<string>,
  platz: Platz,
): void {
  const fliegt = wesenFliegt(w.art);
  const zielFeld = freiesFeld(index * 3 + Math.floor(jetzt / 5000), belegt, platz);
  if (fliegt) {
    zielSetzen(w, [zielFeld], true);
    return;
  }
  const von = bildZuFeld(w.x, w.y);
  const weg = pfadSuchen(von, zielFeld, belegt, platz);
  if (weg.length > 0) {
    zielSetzen(w, weg.slice(1).length > 0 ? weg.slice(1) : [zielFeld], false);
  } else {
    // Kein Weg: auf der Stelle warten, nächstes freies Feld versuchen
    const alt = freiesFeld(index * 7 + Math.floor(jetzt / 3000), belegt, platz);
    const altWeg = pfadSuchen(von, alt, belegt, platz);
    if (altWeg.length > 0)
      zielSetzen(w, altWeg.slice(1).length > 0 ? altWeg.slice(1) : [alt], false);
    else zielSetzen(w, [alt], false);
  }
}

export interface WesenStartOpts {
  readonly bauwerke?: readonly Bauwerk[];
  readonly platz?: BauplatzMass;
}

/** Startliste für n Wesen aus den Arten des Themas. */
export function wesenStarten(
  thema: Thema,
  gebaeude: number,
  leicht: boolean,
  opts: WesenStartOpts = {},
): WesenZustand[] {
  const arten = wesenArten(thema);
  if (arten.length === 0) return [];
  const n = wesenAnzahl(gebaeude, leicht);
  const platz = opts.platz ?? bauplatzAktiv();
  const belegt = belegteFelder(opts.bauwerke ?? []);
  const aus: WesenZustand[] = [];
  for (let i = 0; i < n; i++) {
    const info = arten[i % arten.length];
    if (!info) continue;
    const startFeld = freiesFeld(i * 2, belegt, platz);
    const zielFeld = freiesFeld(i * 2 + 1, belegt, platz);
    const start = klemmen(feldMittePunkt(startFeld));
    const fliegt = wesenFliegt(info.art);
    const w: WesenZustand = {
      id: `w-${i}-${info.art}`,
      art: info.art,
      farbe: info.farbe,
      skala: info.skala,
      x: start.x,
      y: start.y,
      zx: start.x,
      zy: start.y,
      weg: [],
      richtung: 1,
      reactBis: 0,
      phase: i * 0.7,
    };
    if (fliegt) {
      zielSetzen(w, [zielFeld], true);
    } else {
      const weg = pfadSuchen(startFeld, zielFeld, belegt, platz);
      zielSetzen(w, weg.length > 1 ? weg.slice(1) : [zielFeld], false);
    }
    aus.push(w);
  }
  return aus;
}

/** Hindernisse für den nächsten Tick setzen (nach Gebäudewechsel). */
export function wesenHindernisse(
  liste: WesenZustand[],
  bauwerke: readonly Bauwerk[],
  platz: Platz = bauplatzAktiv(),
): { belegt: ReadonlySet<string>; platz: Platz } {
  void liste;
  return { belegt: belegteFelder(bauwerke), platz };
}

/** Einen Tick weiterbewegen; bei Ankunft neues Wegziel (um Gebäude herum). */
export function wesenTick(
  w: WesenZustand,
  dt: number,
  jetzt: number,
  index: number,
  belegt: ReadonlySet<string> = new Set(),
  platz: Platz = bauplatzAktiv(),
): void {
  if (jetzt < w.reactBis) {
    // kurze Hopser-Reaktion
    w.y -= Math.sin(((w.reactBis - jetzt) / 400) * Math.PI) * 0.4;
    return;
  }
  const dx = w.zx - w.x;
  const dy = w.zy - w.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 2) {
    const naechstes = w.weg.shift();
    if (naechstes) {
      w.zx = naechstes.x;
      w.zy = naechstes.y;
      w.richtung = w.zx >= w.x ? 1 : -1;
      return;
    }
    neuesZiel(w, index, jetzt, belegt, platz);
    return;
  }
  const schnell = wesenFliegt(w.art);
  const speed = (schnell ? 28 : 16) * dt;
  w.x += (dx / dist) * speed;
  w.y += (dy / dist) * speed;
  w.phase += dt * 6;
}

export function wesenReagieren(w: WesenZustand, jetzt: number): void {
  w.reactBis = jetzt + 400;
}
