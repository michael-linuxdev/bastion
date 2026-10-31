/**
 * Thema Unterwasserstadt (GRAFIK G6): Sandboden, Kuppeln, Korallen, Blasen-Optik.
 */
import { BAUPLATZ, KATALOG, type GebaeudeTyp, type Position } from '../../../core/bastion/katalog';
import { RAUTE_B, punkt } from './iso';
import { hash01, schattieren, type Stift } from './dorf';

const S = RAUTE_B / 64;

export interface UwBau {
  readonly typ: GebaeudeTyp;
  readonly stufe: number;
  readonly pos: Position;
  readonly akzent?: string;
  readonly auswahl: boolean;
}

const KORALLEN: readonly { x: number; y: number; s: number }[] = [
  { x: -0.45, y: 3, s: 1 },
  { x: -0.5, y: 8, s: 0.9 },
  { x: 2, y: -0.5, s: 1.1 },
  { x: 7, y: -0.55, s: 0.95 },
  { x: 11.5, y: -0.4, s: 1 },
  { x: 12.4, y: 4, s: 0.9 },
  { x: 12.35, y: 9.5, s: 1.05 },
  { x: 3, y: 12.4, s: 0.95 },
  { x: 8, y: 12.45, s: 1 },
];

function sandFarbe(abend: boolean, x: number, y: number, aussen: boolean): string {
  if (aussen) return abend ? '#0a1824' : '#123048';
  const hell = hash01(x, y) > 0.85;
  const schach = (x + y) % 2 === 0;
  if (abend) return hell ? '#1a3048' : schach ? '#152838' : '#101f2e';
  return hell ? '#c4b896' : schach ? '#b8a878' : '#a89868';
}

export function uwHoehe(typ: GebaeudeTyp, stufe: number): number {
  const grund: Record<GebaeudeTyp, number> = {
    kern: 56,
    werkstatt: 38,
    wissen: 40,
    turm: 68,
    eingang: 30,
    einfassung: 20,
    ursprung: 22,
    zeichen: 36,
    flaeche: 12,
    denkmal: 34,
  };
  return grund[typ] + (typ === 'kern' || typ === 'turm' ? (stufe - 1) * 8 : 0);
}

const flach = (p: readonly { x: number; y: number }[]) => p.flatMap((q) => [q.x, q.y]);
const hoch = (p: { x: number; y: number }, h: number) => ({ x: p.x, y: p.y - h });

export function uwBoden(st: Stift, abend: boolean): void {
  const { breite, tiefe } = BAUPLATZ;
  for (let y = -1; y <= tiefe; y++) {
    for (let x = -1; x <= breite; x++) {
      const aussen = x < 0 || y < 0 || x >= breite || y >= tiefe;
      const ecken = flach([punkt(x, y), punkt(x + 1, y), punkt(x + 1, y + 1), punkt(x, y + 1)]);
      st.flaeche(ecken, sandFarbe(abend, x, y, aussen));
      if (!aussen && hash01(x, y + 5) > 0.9) {
        const p = punkt(x + 0.5, y + 0.4);
        st.kreis(p.x, p.y - 8, 2, 'rgba(180,220,255,0.35)');
      }
    }
  }
}

export function uwSzene(
  st: Stift,
  bauten: readonly UwBau[],
  abend: boolean,
  licht: string,
  auswahlRahmen: (pos: Position, typ: GebaeudeTyp) => void,
): void {
  const teile: { tiefe: number; mal: () => void }[] = KORALLEN.map((k) => ({
    tiefe: k.x + k.y,
    mal: () => koralle(st, k.x, k.y, k.s),
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
  for (const t of teile) t.mal();
}

function koralle(st: Stift, x: number, y: number, scale: number): void {
  const p = punkt(x, y);
  const k = scale * S;
  st.ellipse(p.x, p.y + 2 * k, 8 * k, 3 * k, '#000000', 0.12);
  st.flaeche([p.x, p.y, p.x - 6 * k, p.y - 14 * k, p.x + 2 * k, p.y - 10 * k], '#d4786a');
  st.flaeche([p.x, p.y, p.x + 7 * k, p.y - 16 * k, p.x + 2 * k, p.y - 8 * k], '#e09080');
}

function kuppel(
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
  st.flaeche(flach([we, s, oben.s, oben.w]), schattieren(wand, -30));
  st.flaeche(flach([s, o, oben.o, oben.s]), schattieren(wand, -12));
  const m = {
    x: (oben.n.x + oben.s.x) / 2,
    y: (oben.n.y + oben.s.y) / 2 - h * 0.35,
  };
  st.flaeche(flach([oben.n, oben.o, oben.s, oben.w]), dach);
  st.kreis(m.x, m.y, Math.min(w, t) * 6 * S, dach);
}

function gebaeude(st: Stift, bau: UwBau, abend: boolean, licht: string): void {
  const { typ, pos, stufe, akzent } = bau;
  const [bw, bt] = KATALOG[typ].groesse;
  const h = uwHoehe(typ, stufe) * 0.5;
  const wand = '#7a9aab';
  const dach = akzent ?? '#3dbea5';
  switch (typ) {
    case 'kern':
      kuppel(st, pos.x + 0.2, pos.y + 0.2, bw - 0.4, bt - 0.4, h, wand, dach);
      if (abend) {
        const f = punkt(pos.x + bw / 2, pos.y + bt / 2);
        st.kreis(f.x, f.y - h * 0.4, 4, licht);
      }
      break;
    case 'werkstatt':
    case 'wissen':
      kuppel(st, pos.x + 0.15, pos.y + 0.15, bw - 0.3, bt - 0.3, h * 0.85, wand, '#8ec4d4');
      break;
    case 'turm': {
      const m = punkt(pos.x + 0.5, pos.y + 0.5);
      st.rechteck(m.x - 4 * S, m.y - 36 * S, 8 * S, 36 * S, wand);
      st.kreis(m.x, m.y - 40 * S, 8 * S, licht);
      break;
    }
    case 'eingang':
      kuppel(st, pos.x + 0.2, pos.y + 0.25, bw - 0.4, bt - 0.5, h * 0.6, wand, dach);
      break;
    case 'einfassung':
      for (let i = 0; i < 3; i++) {
        const p = punkt(pos.x + 0.2 + i * 0.3, pos.y + 0.45);
        st.flaeche([p.x, p.y, p.x - 4 * S, p.y - 10 * S, p.x + 4 * S, p.y - 10 * S], '#c06070');
      }
      break;
    case 'ursprung': {
      const m = punkt(pos.x + 0.5, pos.y + 0.5);
      st.ellipse(m.x, m.y, 8 * S, 4 * S, '#4a5560');
      st.flaeche([m.x - 2 * S, m.y, m.x, m.y - 14 * S, m.x + 2 * S, m.y], '#6a7580');
      break;
    }
    case 'zeichen': {
      const m = punkt(pos.x + 0.5, pos.y + 0.5);
      st.kreis(m.x, m.y - 8 * S, 6 * S, akzent ?? '#3dbea5');
      st.kreis(m.x, m.y - 8 * S, 3 * S, '#1a3040');
      break;
    }
    case 'flaeche':
      for (const [sx, sy] of [
        [0.3, 0.3],
        [0.6, 0.45],
        [0.4, 0.7],
      ] as const) {
        const p = punkt(pos.x + bw * sx, pos.y + bt * sy);
        st.ellipse(p.x, p.y, 5 * S, 3 * S, '#2d6a4c');
      }
      break;
    case 'denkmal': {
      const m = punkt(pos.x + 0.5, pos.y + 0.5);
      st.ellipse(m.x, m.y - 4 * S, 8 * S, 6 * S, akzent ?? '#d4a574');
      break;
    }
  }
}
