/**
 * Thema Garten – eigene Szene (GRAFIK §10 G5), Niveau über dem Insel-Platzhalter.
 * Boden als Beete/Rasen, Gebäude: Baumhaus, Schuppen, Gewächshaus, Aussichtsbaum …
 * Stift ohne PixiJS-Import (wie dorf.ts).
 */
import { KATALOG, type GebaeudeTyp, type Position } from '../../../core/bastion/katalog';
import { bauplatzAktiv, RAUTE_B, punkt } from './iso';
import { hash01, schattieren, type Stift } from './dorf';

const S = RAUTE_B / 64;

export interface GartenBau {
  readonly typ: GebaeudeTyp;
  readonly stufe: number;
  readonly pos: Position;
  readonly akzent?: string;
  readonly auswahl: boolean;
}

const STRAEUCHER: readonly { x: number; y: number; s: number }[] = [
  { x: -0.5, y: 2.2, s: 0.9 },
  { x: -0.4, y: 7.1, s: 1.05 },
  { x: 1.8, y: -0.5, s: 0.95 },
  { x: 6.5, y: -0.55, s: 1.1 },
  { x: 11.2, y: -0.4, s: 0.85 },
  { x: 12.35, y: 3.5, s: 1 },
  { x: 12.4, y: 8.8, s: 0.95 },
  { x: 2.2, y: 12.4, s: 1 },
  { x: 7.5, y: 12.45, s: 1.05 },
  { x: 10.8, y: 12.3, s: 0.9 },
];

function rasenFarbe(abend: boolean, x: number, y: number, aussen: boolean): string {
  if (aussen) return abend ? '#142018' : '#1e3a28';
  const blume = hash01(x, y) > 0.92;
  const schach = (x + y) % 2 === 0;
  if (abend) {
    if (blume) return '#3a5040';
    return schach ? '#2a4034' : '#24382c';
  }
  if (blume) return '#7cbc5a';
  return schach ? '#5faa48' : '#4f9a3e';
}

export function gartenHoehe(typ: GebaeudeTyp, stufe: number): number {
  const grund: Record<GebaeudeTyp, number> = {
    kern: 62,
    werkstatt: 36,
    wissen: 42,
    turm: 72,
    eingang: 28,
    einfassung: 22,
    ursprung: 18,
    zeichen: 40,
    flaeche: 14,
    denkmal: 36,
  };
  return grund[typ] + (typ === 'kern' || typ === 'turm' ? (stufe - 1) * 8 : 0);
}

const flach = (p: readonly { x: number; y: number }[]) => p.flatMap((q) => [q.x, q.y]);
const hoch = (p: { x: number; y: number }, h: number) => ({ x: p.x, y: p.y - h });

export function gartenBoden(st: Stift, abend: boolean): void {
  const { breite, tiefe } = bauplatzAktiv();
  for (let y = -1; y <= tiefe; y++) {
    for (let x = -1; x <= breite; x++) {
      const aussen = x < 0 || y < 0 || x >= breite || y >= tiefe;
      const n = punkt(x, y);
      const o = punkt(x + 1, y);
      const s = punkt(x + 1, y + 1);
      const w = punkt(x, y + 1);
      const ecken = flach([n, o, s, w]);
      st.flaeche(ecken, rasenFarbe(abend, x, y, aussen));
      st.kontur(ecken, 'rgba(30, 60, 30, 0.12)', 1);
      if (!aussen && hash01(x + 1, y + 4) > 0.88) {
        const p = punkt(x + 0.45, y + 0.45);
        const farbe = hash01(x, y + 2) > 0.5 ? '#e07a9a' : '#e6c35c';
        st.kreis(p.x, p.y, 2.2, farbe);
      }
    }
  }
}

export function gartenSzene(
  st: Stift,
  bauten: readonly GartenBau[],
  abend: boolean,
  licht: string,
  auswahlRahmen: (pos: Position, typ: GebaeudeTyp) => void,
): void {
  const teile: { tiefe: number; mal: () => void }[] = STRAEUCHER.map((b) => ({
    tiefe: b.x + b.y,
    mal: () => strauch(st, b.x, b.y, b.s),
  }));
  for (const bau of bauten) {
    const [w, t] = KATALOG[bau.typ].groesse;
    teile.push({
      tiefe: bau.pos.x + bau.pos.y + (w + t) / 2,
      mal: () => {
        gebaeude(st, bau, abend, licht);
        if (bau.auswahl) auswahlRahmen(bau.pos, bau.typ);
      },
    });
  }
  teile.sort((a, b) => a.tiefe - b.tiefe);
  for (const teil of teile) teil.mal();
}

function strauch(st: Stift, x: number, y: number, scale: number): void {
  const p = punkt(x, y);
  const k = scale * S;
  st.ellipse(p.x, p.y + 2 * k, 9 * k, 3.5 * k, '#000000', 0.14);
  st.kreis(p.x, p.y - 8 * k, 9 * k, '#2f7a3c');
  st.kreis(p.x - 5 * k, p.y - 10 * k, 6 * k, '#3f914c');
  st.kreis(p.x + 4 * k, p.y - 9 * k, 5 * k, '#4aa058');
}

function kasten(
  st: Stift,
  x: number,
  y: number,
  w: number,
  t: number,
  h: number,
  wand: string,
  dach: string,
): void {
  const n = punkt(x, y);
  const o = punkt(x + w, y);
  const s = punkt(x + w, y + t);
  const we = punkt(x, y + t);
  const oben = { n: hoch(n, h), o: hoch(o, h), s: hoch(s, h), w: hoch(we, h) };
  st.flaeche(flach([we, s, oben.s, oben.w]), schattieren(wand, -28));
  st.flaeche(flach([s, o, oben.o, oben.s]), schattieren(wand, -10));
  const dachPunkte = flach([oben.n, oben.o, oben.s, oben.w]);
  st.flaeche(dachPunkte, dach);
  st.kontur(dachPunkte, 'rgba(0,0,0,0.22)', 1);
}

function gebaeude(st: Stift, bau: GartenBau, abend: boolean, licht: string): void {
  const { typ, pos, stufe, akzent } = bau;
  const [bw, bt] = KATALOG[typ].groesse;
  const h = gartenHoehe(typ, stufe) * 0.55;
  const holz = '#8b6a45';
  const dach = akzent ?? '#3d8f6a';
  const glas = abend ? licht : '#a8d8e8';

  switch (typ) {
    case 'kern': {
      // Baumhaus: Stamm + Plattform + Hütte
      const m = punkt(pos.x + bw / 2, pos.y + bt / 2);
      st.rechteck(m.x - 5 * S, m.y - 20 * S, 10 * S, 28 * S, '#5c4030');
      st.kreis(m.x - 8 * S, m.y - 28 * S, 14 * S, '#2d6a3c');
      st.kreis(m.x + 6 * S, m.y - 30 * S, 12 * S, '#3f874c');
      kasten(st, pos.x + 0.4, pos.y + 0.4, bw - 0.8, bt - 0.8, h * 0.7, holz, dach);
      if (abend) {
        const f = punkt(pos.x + bw * 0.45, pos.y + bt * 0.55);
        st.rechteck(f.x, f.y - h * 0.35, 5, 7, licht);
      }
      break;
    }
    case 'werkstatt':
      kasten(st, pos.x + 0.15, pos.y + 0.15, bw - 0.3, bt - 0.3, h, '#9a7a55', '#6b5340');
      break;
    case 'wissen': {
      // Gewächshaus: helles Glasdach
      kasten(st, pos.x + 0.1, pos.y + 0.1, bw - 0.2, bt - 0.2, h * 0.85, '#d5e8df', glas);
      const m = punkt(pos.x + bw / 2, pos.y + bt / 2);
      st.linie(m.x - 10 * S, m.y - h, m.x + 10 * S, m.y - h * 0.3, '#5a8a70', 1.5);
      break;
    }
    case 'turm': {
      // Aussichtsbaum
      const m = punkt(pos.x + 0.5, pos.y + 0.5);
      st.rechteck(m.x - 3 * S, m.y - 28 * S, 6 * S, 32 * S, '#5c4030');
      st.kreis(m.x, m.y - 36 * S, 14 * S, '#2d6a3c');
      st.kreis(m.x - 6 * S, m.y - 40 * S, 8 * S, '#3f874c');
      st.ellipse(m.x, m.y - 22 * S, 10 * S, 3 * S, holz);
      break;
    }
    case 'eingang':
      kasten(st, pos.x + 0.2, pos.y + 0.25, bw - 0.4, bt - 0.5, h * 0.5, holz, dach);
      {
        const m = punkt(pos.x + 0.5, pos.y + 0.55);
        st.ellipse(m.x, m.y - 4 * S, 6 * S, 8 * S, schattieren(holz, -40));
      }
      break;
    case 'einfassung':
      // Hecke
      for (let i = 0; i < 3; i++) {
        const p = punkt(pos.x + 0.2 + i * 0.3, pos.y + 0.4);
        st.ellipse(p.x, p.y - 6 * S, 7 * S, 8 * S, '#2f7a3c');
        st.ellipse(p.x - 2 * S, p.y - 9 * S, 5 * S, 5 * S, '#3f914c');
      }
      break;
    case 'ursprung': {
      const m = punkt(pos.x + 0.5, pos.y + 0.5);
      st.ellipse(m.x, m.y, 10 * S, 5 * S, '#6d5a40');
      st.ellipse(m.x, m.y - 2 * S, 7 * S, 3 * S, '#8a7560');
      break;
    }
    case 'zeichen': {
      const m = punkt(pos.x + 0.5, pos.y + 0.5);
      st.linie(m.x, m.y + 2 * S, m.x, m.y - 28 * S, '#f4efe4', 2);
      st.flaeche(
        [m.x, m.y - 28 * S, m.x + 12 * S, m.y - 22 * S, m.x, m.y - 16 * S],
        akzent ?? '#3dbea5',
      );
      break;
    }
    case 'flaeche':
      kasten(st, pos.x + 0.05, pos.y + 0.05, bw - 0.1, bt - 0.1, 4, '#6b4a32', '#5a3a28');
      for (const [sx, sy, f] of [
        [0.3, 0.3, '#e07a9a'],
        [0.7, 0.35, '#e6c35c'],
        [0.45, 0.65, '#7a9ce0'],
        [0.75, 0.7, '#e07a9a'],
      ] as const) {
        const p = punkt(pos.x + bw * sx, pos.y + bt * sy);
        st.kreis(p.x, p.y - 6, 2.5, f);
      }
      break;
    case 'denkmal': {
      // Gartenzwerg-Silhouette
      const m = punkt(pos.x + 0.5, pos.y + 0.5);
      st.ellipse(m.x, m.y, 6 * S, 3 * S, '#5a4030');
      st.kreis(m.x, m.y - 10 * S, 5 * S, akzent ?? '#c4603a');
      st.flaeche(
        [m.x, m.y - 22 * S, m.x + 6 * S, m.y - 12 * S, m.x - 6 * S, m.y - 12 * S],
        '#3d8f6a',
      );
      break;
    }
  }
}
