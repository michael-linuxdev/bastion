/**
 * G3 Umriss-Test (FOKUS.md Paket G, GRAFIK-SPRITES.md §12.6):
 * Jede Stufe eines erneuerten Gebäudes unterscheidet sich als Umriss deutlich von der vorigen.
 *
 * - Umriss: XOR der Alpha-Masken geteilt durch ihre Vereinigung, ausgerichtet am Anker
 *   unten Mitte – mindestens 25 % (Entscheidung PV, 01.11.2026).
 * - Höhe: sichtbare Höhe (Alpha) mindestens 15 % über der vorigen Stufe.
 * - Ab Stufe 4 (Epochen 2–4, GRAFIK-SPRITES.md §12.11): Umriss mindestens 10 %, Höhe
 *   mindestens 8 %. Der Fußabdruck wächst nicht mit; ab Stufe 4 ist er gefüllt, und
 *   25 % Umriss ginge nur mit 30 % Höhe je Stufe. Die Stufe zeigt sich dann an je einem
 *   neuen Merkmal (Torhaus, Erker, Kuppel, Spitze, Kupferdach).
 * Die Kette läuft über die Epochen: jede Stufe hat ein Bild, in der Epoche, in der sie
 * zuerst baubar ist (Rückfall wie `atlasEintrag`).
 *
 * Gleiche Messung wie `pnpm grafik:stufen` (tools/grafik/stufen-vergleich.py).
 * Der Test gilt nur für erneuerte Chargen und wächst Charge für Charge (G3).
 * PNGs werden ohne Zusatzpaket gelesen: nur 8 Bit RGBA ohne Zeilensprung,
 * so wie die Generatoren (Pillow) sie schreiben.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { inflateSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';

/** Erneuerte Gebäude: [Atlas-Ordner, Rolle, Zahl der Stufen] */
const ERNEUERT: readonly (readonly [string, string, number])[] = [
  ['gebaeude/bastion/e1', 'kern', 3], // G3 Charge 1, 02.11.2026
  ['gebaeude/bastion/e1', 'wissen', 2], // G3 Charge 2, 02.11.2026
  ['gebaeude/bastion/e1', 'turm', 2], // G3 Charge 2, 02.11.2026
  ['gebaeude/garten/e1', 'kern', 3], // G3 Thema garten, 02.11.2026
  ['gebaeude/garten/e1', 'wissen', 2],
  ['gebaeude/garten/e1', 'turm', 2],
  ['gebaeude/unterwasser/e1', 'kern', 3], // G3 Thema unterwasser, 02.11.2026
  ['gebaeude/unterwasser/e1', 'wissen', 2],
  ['gebaeude/unterwasser/e1', 'turm', 2],
  ['gebaeude/weltraum/e1', 'kern', 3], // G3 Thema weltraum, 02.11.2026
  ['gebaeude/weltraum/e1', 'wissen', 2],
  ['gebaeude/weltraum/e1', 'turm', 2],
  ['gebaeude/dorf/e1', 'kern', 3], // G3 Thema dorf, 02.11.2026
  ['gebaeude/dorf/e1', 'wissen', 2],
  ['gebaeude/dorf/e1', 'turm', 2],
];

const MIN_UMRISS = 0.25;
const MIN_HOEHE = 0.15;
const MIN_UMRISS_AB_4 = 0.1;
const MIN_HOEHE_AB_4 = 0.08;

/** Erneuert über alle Epochen (G3 Epochen 2–4): [Thema, Rolle, höchste Stufe] */
const ERNEUERT_EPOCHEN: readonly (readonly [string, string, number])[] = [
  ['bastion', 'kern', 9],
  ['bastion', 'wissen', 5],
  ['bastion', 'turm', 5],
  ['bastion', 'werkstatt', 3],
  ['bastion', 'eingang', 2],
  ['weltraum', 'kern', 9],
  ['weltraum', 'wissen', 5],
  ['weltraum', 'turm', 5],
  ['weltraum', 'werkstatt', 3],
  ['weltraum', 'eingang', 2],
  ['dorf', 'kern', 9],
  ['dorf', 'wissen', 5],
  ['dorf', 'turm', 5],
  ['dorf', 'werkstatt', 3],
  ['dorf', 'eingang', 2],
  ['garten', 'kern', 9],
  ['garten', 'wissen', 5],
  ['garten', 'turm', 5],
  ['garten', 'werkstatt', 3],
  ['garten', 'eingang', 2],
  ['unterwasser', 'kern', 9],
  ['unterwasser', 'wissen', 5],
  ['unterwasser', 'turm', 5],
  ['unterwasser', 'werkstatt', 3],
  ['unterwasser', 'eingang', 2],
];

function stufenBild(thema: string, rolle: string, stufe: number): string {
  for (let e = 1; e <= 4; e++) {
    const pfad = resolve('public/grafik/atlas/gebaeude', thema, `e${e}`, `${rolle}_s${stufe}.png`);
    if (existsSync(pfad)) return pfad;
  }
  throw new Error(`kein Bild: ${thema} ${rolle} Stufe ${stufe}`);
}
/** Ab dieser Deckkraft zählt ein Pixel zum Umriss (weiche Schatten nicht) */
const ALPHA_GRENZE = 128;

interface Maske {
  readonly w: number;
  readonly h: number;
  readonly an: Uint8Array;
}

function pngMaske(pfad: string): Maske {
  const roh = readFileSync(pfad);
  let pos = 8;
  let w = 0;
  let h = 0;
  const idat: Buffer[] = [];
  while (pos < roh.length) {
    const laenge = roh.readUInt32BE(pos);
    const typ = roh.toString('latin1', pos + 4, pos + 8);
    const daten = roh.subarray(pos + 8, pos + 8 + laenge);
    if (typ === 'IHDR') {
      w = daten.readUInt32BE(0);
      h = daten.readUInt32BE(4);
      const tiefe = daten[8];
      const farbe = daten[9];
      const zeilensprung = daten[12];
      if (tiefe !== 8 || farbe !== 6 || zeilensprung !== 0)
        throw new Error(`${pfad}: nur 8 Bit RGBA ohne Zeilensprung`);
    } else if (typ === 'IDAT') idat.push(daten);
    else if (typ === 'IEND') break;
    pos += 12 + laenge;
  }
  const daten = inflateSync(Buffer.concat(idat));
  const bpp = 4;
  const zeile = w * bpp;
  const px = new Uint8Array(h * zeile);
  for (let y = 0; y < h; y++) {
    const filter = daten[y * (zeile + 1)];
    const quelle = y * (zeile + 1) + 1;
    for (let i = 0; i < zeile; i++) {
      const x = daten[quelle + i] ?? 0;
      const a = i >= bpp ? (px[y * zeile + i - bpp] ?? 0) : 0;
      const b = y > 0 ? (px[(y - 1) * zeile + i] ?? 0) : 0;
      const c = y > 0 && i >= bpp ? (px[(y - 1) * zeile + i - bpp] ?? 0) : 0;
      let v: number;
      if (filter === 0) v = x;
      else if (filter === 1) v = x + a;
      else if (filter === 2) v = x + b;
      else if (filter === 3) v = x + ((a + b) >> 1);
      else {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        v = x + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
      }
      px[y * zeile + i] = v & 0xff;
    }
  }
  const an = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) an[i] = (px[i * 4 + 3] ?? 0) >= ALPHA_GRENZE ? 1 : 0;
  return { w, h, an };
}

/** Sichtbare Höhe: von der obersten Zeile mit Umriss bis zum unteren Bildrand (Anker) */
function hoehe(m: Maske): number {
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (m.an[y * m.w + x]) return m.h - y;
  return 0;
}

/** Anteil der Fläche, in dem sich zwei Umrisse unterscheiden (Anker unten Mitte) */
function umrissAnders(a: Maske, b: Maske): number {
  const w = Math.max(a.w, b.w);
  const h = Math.max(a.h, b.h);
  const an = (m: Maske, x: number, y: number) => {
    const mx = x - Math.floor((w - m.w) / 2);
    const my = y - (h - m.h);
    if (mx < 0 || my < 0 || mx >= m.w || my >= m.h) return 0;
    return m.an[my * m.w + mx] ?? 0;
  };
  let xor = 0;
  let oder = 0;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const p = an(a, x, y);
      const q = an(b, x, y);
      if (p || q) oder++;
      if (p !== q) xor++;
    }
  return oder === 0 ? 0 : xor / oder;
}

describe('G3: jede Stufe ein sichtbares Upgrade (Umriss und Höhe)', () => {
  for (const [ordner, rolle, stufen] of ERNEUERT) {
    for (let s = 2; s <= stufen; s++) {
      it(`${ordner}/${rolle}: Stufe ${s - 1} → ${s}`, () => {
        const vorher = pngMaske(resolve('public/grafik/atlas', ordner, `${rolle}_s${s - 1}.png`));
        const nachher = pngMaske(resolve('public/grafik/atlas', ordner, `${rolle}_s${s}.png`));
        expect(umrissAnders(vorher, nachher)).toBeGreaterThanOrEqual(MIN_UMRISS);
        expect(hoehe(nachher)).toBeGreaterThanOrEqual(hoehe(vorher) * (1 + MIN_HOEHE));
      });
    }
  }

  for (const [thema, rolle, hoechste] of ERNEUERT_EPOCHEN) {
    for (let s = 2; s <= hoechste; s++) {
      it(`${thema}/${rolle} über Epochen: Stufe ${s - 1} → ${s}`, () => {
        const vorher = pngMaske(stufenBild(thema, rolle, s - 1));
        const nachher = pngMaske(stufenBild(thema, rolle, s));
        const umriss = s >= 4 ? MIN_UMRISS_AB_4 : MIN_UMRISS;
        const hoch = s >= 4 ? MIN_HOEHE_AB_4 : MIN_HOEHE;
        expect(umrissAnders(vorher, nachher)).toBeGreaterThanOrEqual(umriss);
        expect(hoehe(nachher)).toBeGreaterThanOrEqual(hoehe(vorher) * (1 + hoch));
      });
    }
  }

  it('Gegenprobe: dasselbe Bild zählt als kein Upgrade', () => {
    const a = pngMaske(resolve('public/grafik/atlas/gebaeude/bastion/e1/kern_s2.png'));
    expect(umrissAnders(a, a)).toBe(0);
    expect(hoehe(a)).toBeLessThan(hoehe(a) * (1 + MIN_HOEHE));
  });
});
