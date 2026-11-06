// Gemeinsamer Takt für Fahnen, Mühlen, Wesen und Bewohner (GRAFIK §34, Q-G1 PR 3 neu).
// Rein und ohne PixiJS: Die Bühne rechnet damit, welches vorberechnete Bild gerade dran
// ist und was im Sichtfeld liegt. Kein Spieltimer: Der Takt zählt nur Bilder.
import { TAKT_HZ } from './atmosphaere';
import type { Kamera } from './kamera';

const VOLL = Math.PI * 2;

/** Nummer des Takt-Schritts zur Zeit `jetzt` (ms): alle Teile sehen dieselbe Zeit. */
export function taktSchritt(jetzt: number, hz: number = TAKT_HZ): number {
  return Math.floor((jetzt * hz) / 1000);
}

/** Zeit (ms) am Anfang eines Takt-Schritts */
export function taktZeit(schritt: number, hz: number = TAKT_HZ): number {
  return (schritt * 1000) / hz;
}

/**
 * Wie viele verschiedene Bilder eine gleichförmige Bewegung je Umlauf im Takt braucht:
 * so viele, wie in einem Umlauf Takt-Schritte liegen. Mehr sähe man bei `hz` Bildern je
 * Sekunde ohnehin nicht. Wehende Fahne (4,2 rad/s): 45 Bilder; bei Sturm 20.
 * @param radJeSekunde Winkelgeschwindigkeit der Phase
 * @param umlauf Phase, nach der das Bild gleich aussieht (2π, bei vier Flügeln π/2)
 */
export function bilderJeUmlauf(
  radJeSekunde: number,
  umlauf: number = VOLL,
  hz: number = TAKT_HZ,
): number {
  if (!(radJeSekunde > 0)) return 1;
  return Math.max(1, Math.round((umlauf * hz) / Math.abs(radJeSekunde)));
}

/** Nummer des vorberechneten Bildes (0 … stufen − 1) zu einer Phase, auch negativ. */
export function phasenStufe(phase: number, stufen: number, umlauf: number = VOLL): number {
  if (stufen <= 1 || !Number.isFinite(phase)) return 0;
  const s = ((Math.round((phase / umlauf) * stufen) % stufen) + stufen) % stufen;
  return s === 0 ? 0 : s; // keine −0
}

/** Phase, mit der ein vorberechnetes Bild gezeichnet wird */
export function stufenPhase(stufe: number, stufen: number, umlauf: number = VOLL): number {
  return stufen <= 1 ? 0 : (stufe / stufen) * umlauf;
}

/** Rechteck in Bühnen-Bildpunkten */
export interface Rechteck {
  readonly x: number;
  readonly y: number;
  readonly b: number;
  readonly h: number;
}

/**
 * Sichtfeld der Bühne zu einer Kamera: was im Fenster liegt, plus `rand` Fenster-Bildpunkte
 * ringsum, umgerechnet in Bühnen-Bildpunkte (die Bühne liegt mit `translate(x, y)
 * scale(zoom)` im Fenster).
 */
export function sichtfeldAus(
  k: Kamera,
  fenster: { readonly breite: number; readonly hoehe: number },
  rand: number,
): Rechteck {
  const z = k.zoom > 0 ? k.zoom : 1;
  return {
    x: (-k.x - rand) / z,
    y: (-k.y - rand) / z,
    b: (fenster.breite + 2 * rand) / z,
    h: (fenster.hoehe + 2 * rand) / z,
  };
}

/**
 * Liegt ein Kasten (Mitte, halbe Breite und Höhe) im Sichtfeld? Ohne Sichtfeld (die
 * Kamera hat sich noch nicht gemeldet) gilt alles als sichtbar.
 */
export function imSichtfeld(
  mx: number,
  my: number,
  halbB: number,
  halbH: number,
  sicht: Rechteck | undefined,
): boolean {
  if (!sicht) return true;
  return (
    mx + halbB >= sicht.x &&
    mx - halbB <= sicht.x + sicht.b &&
    my + halbH >= sicht.y &&
    my - halbH <= sicht.y + sicht.h
  );
}

/**
 * Vorrat vorberechneter Bilder: einmal bauen, danach nur noch holen. Die Bühne legt
 * darin je Fahne, Mühle und Statusgeste fertige Zeichnungen ab und tauscht im Takt nur,
 * welche gezeigt wird – statt jedes Mal neu zu zeichnen.
 */
export class BildVorrat<T> {
  private readonly bilder = new Map<string, T>();
  private gebaut = 0;

  holen(schluessel: string, bauen: () => T): T {
    let bild = this.bilder.get(schluessel);
    if (bild === undefined) {
      bild = bauen();
      this.bilder.set(schluessel, bild);
      this.gebaut++;
    }
    return bild;
  }

  /** Wie viele Bilder bisher gebaut wurden (für Tests und Messung) */
  get anzahlGebaut(): number {
    return this.gebaut;
  }

  get groesse(): number {
    return this.bilder.size;
  }

  /** Alles abgeben, z. B. beim Abbau der Bühne */
  leeren(weg?: (bild: T) => void): void {
    if (weg) for (const bild of this.bilder.values()) weg(bild);
    this.bilder.clear();
  }
}
