/**
 * Hinterhof in der Pixi-Szene (B-25, GRAFIK §7): Felder hinter dem Bauplatz
 * (kleinere Feld-Y). Plätze als Objekte; volle Felder mit Wappen/Denkmal.
 * P4: Atlas-Sprites wenn vorhanden, sonst Code-Fallback.
 * Feinschliff: Umbruch + Dichte-Skala, damit viele offene Plätze nicht überlappen.
 */
import { Container, Graphics, Sprite, type Texture } from 'pixi.js';
import type { HinterhofFeld } from '../../../core/learning/hinterhof';
import type { Thema } from '../../../core/policy/einstellung';
import {
  atlasEintragPerId,
  atlasHinterhofId,
  type AtlasManifest,
  type HinterhofTeil,
} from './atlas';
import { hinterhofPlatzLayout, hinterhofPlatzZelle } from './hinterhof-layout';
import { punkt } from './iso';

/** Objektfarbe je Thema und Füllung (Code-Fallback). */
function objektFarbe(thema: Thema, fuellung: 'G' | 'M'): string {
  if (fuellung === 'M') return '#c0c8d4'; // Silber
  switch (thema) {
    case 'garten':
      return '#c4783a';
    case 'weltraum':
      return '#e8d080';
    case 'dorf':
      return '#b88850';
    case 'unterwasser':
      return '#7ec8c0';
    default:
      return '#cd7f32';
  }
}

function platzTeil(fuellung: 'offen' | 'G' | 'M'): HinterhofTeil {
  if (fuellung === 'offen') return 'platz_offen';
  if (fuellung === 'M') return 'platz_m';
  return 'platz_g';
}

function spriteAn(
  lage: Container,
  manifest: AtlasManifest | null,
  texturen: Map<string, Texture>,
  id: string,
  x: number,
  y: number,
  skala = 1,
): boolean {
  const eintrag = atlasEintragPerId(manifest, id);
  const tex = eintrag ? texturen.get(eintrag.id) : undefined;
  if (!eintrag || !tex) return false;
  const spr = new Sprite(tex);
  spr.anchor.set(eintrag.anker.x, eintrag.anker.y);
  spr.width = (eintrag.pixel.w / 2) * skala;
  spr.height = (eintrag.pixel.h / 2) * skala;
  spr.position.set(x, y);
  lage.addChild(spr);
  return true;
}

/**
 * Zeichnet den Hinterhof oberhalb des Bauplatzes (y negativ).
 * Ein Feld = eine oder mehrere Reihen; Plätze als Atlas-Objekte oder Code-Kreise.
 */
export function hinterhofZeichnen(
  lage: Container,
  felder: readonly HinterhofFeld[],
  thema: Thema,
  abend: boolean,
  atlas: AtlasManifest | null = null,
  texturen: Map<string, Texture> = new Map(),
): void {
  const g = new Graphics();
  lage.addChild(g);

  let yCursor = -3.2;
  felder.forEach((feld) => {
    const layout = hinterhofPlatzLayout(feld.plaetze.length);
    const reihenHoehe = 0.42;
    const beetHoehe = layout.reihen * reihenHoehe + 0.08;
    const x0 = (12 - layout.breite) / 2;
    // Beet / Regal-Boden (weiterhin Code)
    const a = punkt(x0, yCursor);
    const b = punkt(x0 + layout.breite, yCursor);
    const c = punkt(x0 + layout.breite, yCursor + beetHoehe);
    const d = punkt(x0, yCursor + beetHoehe);
    g.poly([a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y]).fill(abend ? '#2a3428' : '#5a6a48');
    feld.plaetze.forEach((p, pi) => {
      const { reihe, spalte } = hinterhofPlatzZelle(pi, layout.proReihe);
      const inReihe = Math.min(layout.proReihe, feld.plaetze.length - reihe * layout.proReihe);
      const reihenBreite = Math.min(layout.breite, inReihe * layout.abstand);
      const reihenX0 = x0 + (layout.breite - reihenBreite) / 2;
      const px = reihenX0 + (spalte + 0.5) * (reihenBreite / inReihe);
      const py = yCursor + 0.18 + reihe * reihenHoehe;
      const pt = punkt(px, py);
      // Offene Mulden kleiner – weniger „weiße Scheiben“-Teppich
      const skala = p.fuellung === 'offen' ? layout.skala * 0.82 : layout.skala;
      const id = atlasHinterhofId(thema, platzTeil(p.fuellung));
      const mitSprite = spriteAn(lage, atlas, texturen, id, pt.x, pt.y - 2, skala);
      if (!mitSprite) {
        const r = (p.fuellung === 'offen' ? 2.4 : 3.2) * (skala / 0.55);
        if (p.fuellung === 'offen') {
          g.circle(pt.x, pt.y - 2, r).fill(abend ? '#3a4438' : '#8a9a78');
        } else {
          g.circle(pt.x, pt.y - 4, r).fill(objektFarbe(thema, p.fuellung));
        }
      }
      if (p.vorwissen) g.circle(pt.x, pt.y - 4, 1.6).fill(abend ? '#88a0ff' : '#4060c0');
    });
    // Volle Felder: Wappen + Denkmal am Rand (Atlas oder Raute)
    if (feld.gefuellt > 0 && feld.gefuellt === feld.plaetze.length) {
      const w = punkt(x0 + layout.breite + 0.3, yCursor + beetHoehe / 2);
      const wappenOk = spriteAn(
        lage,
        atlas,
        texturen,
        atlasHinterhofId(thema, 'wappen_voll'),
        w.x,
        w.y,
        0.55,
      );
      const denkmalOk = spriteAn(
        lage,
        atlas,
        texturen,
        atlasHinterhofId(thema, 'denkmal_voll'),
        w.x + 12,
        w.y,
        0.5,
      );
      if (!wappenOk && !denkmalOk) {
        g.poly([w.x, w.y - 14, w.x + 8, w.y - 8, w.x, w.y - 2, w.x - 8, w.y - 8]).fill(
          objektFarbe(thema, 'M'),
        );
      }
    }
    yCursor += beetHoehe + 0.18;
  });
}

/** Kamera-Ziel: Mitte des Hinterhof-Bereichs in Bildpunkten */
export function hinterhofMitte(felderAnzahl: number): { x: number; y: number } {
  const y = -3.2 + (Math.max(1, felderAnzahl) * 0.55) / 2;
  return punkt(6, y);
}
