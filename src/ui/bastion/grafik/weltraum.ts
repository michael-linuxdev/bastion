/**
 * Thema Weltraum / Raumstation (GRAFIK G6): Plattform statt Insel, Module, Antennen.
 */
import { BAUPLATZ, KATALOG, type GebaeudeTyp, type Position } from '../../../core/bastion/katalog';
import { RAUTE_B, punkt } from './iso';
import { hash01, schattieren, type Stift } from './dorf';

const S = RAUTE_B / 64;

export interface WeltraumBau {
  readonly typ: GebaeudeTyp;
  readonly stufe: number;
  readonly pos: Position;
  readonly akzent?: string;
  readonly auswahl: boolean;
}

function plattformFarbe(abend: boolean, x: number, y: number, aussen: boolean): string {
  if (aussen) return abend ? '#060810' : '#0a1020';
  const hell = hash01(x, y) > 0.9;
  const schach = (x + y) % 2 === 0;
  if (abend) return hell ? '#1a2238' : schach ? '#141c30' : '#101828';
  return hell ? '#4a5670' : schach ? '#3a465c' : '#323c50';
}

export function weltraumHoehe(typ: GebaeudeTyp, stufe: number): number {
  const grund: Record<GebaeudeTyp, number> = {
    kern: 54,
    werkstatt: 36,
    wissen: 44,
    turm: 66,
    eingang: 28,
    einfassung: 16,
    ursprung: 14,
    zeichen: 38,
    flaeche: 10,
    denkmal: 32,
  };
  return grund[typ] + (typ === 'kern' || typ === 'turm' ? (stufe - 1) * 8 : 0);
}

const flach = (p: readonly { x: number; y: number }[]) => p.flatMap((q) => [q.x, q.y]);
const hoch = (p: { x: number; y: number }, h: number) => ({ x: p.x, y: p.y - h });

export function weltraumBoden(st: Stift, abend: boolean): void {
  const { breite, tiefe } = BAUPLATZ;
  // Sterne im „Himmel“ der Bühne zeichnet gestirn; hier nur die Plattform
  for (let y = -1; y <= tiefe; y++) {
    for (let x = -1; x <= breite; x++) {
      const aussen = x < 0 || y < 0 || x >= breite || y >= tiefe;
      const ecken = flach([punkt(x, y), punkt(x + 1, y), punkt(x + 1, y + 1), punkt(x, y + 1)]);
      st.flaeche(ecken, plattformFarbe(abend, x, y, aussen));
      st.kontur(ecken, 'rgba(80,100,140,0.2)', 1);
    }
  }
}

export function weltraumSzene(
  st: Stift,
  bauten: readonly WeltraumBau[],
  abend: boolean,
  licht: string,
  auswahlRahmen: (pos: Position, typ: GebaeudeTyp) => void,
): void {
  const teile = bauten.map((bau) => {
    const [w, t] = KATALOG[bau.typ].groesse;
    return {
      tiefe: bau.pos.x + bau.pos.y + (w + t) / 2,
      mal: () => {
        gebaeude(st, bau, abend, licht);
        if (bau.auswahl) auswahlRahmen(bau.pos, bau.typ);
      },
    };
  });
  teile.sort((a, b) => a.tiefe - b.tiefe);
  for (const t of teile) t.mal();
}

function modul(
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
  st.flaeche(flach([we, s, oben.s, oben.w]), schattieren(wand, -25));
  st.flaeche(flach([s, o, oben.o, oben.s]), schattieren(wand, -8));
  st.flaeche(flach([oben.n, oben.o, oben.s, oben.w]), dach);
}

function gebaeude(st: Stift, bau: WeltraumBau, abend: boolean, licht: string): void {
  const { typ, pos, stufe, akzent } = bau;
  const [bw, bt] = KATALOG[typ].groesse;
  const h = weltraumHoehe(typ, stufe) * 0.5;
  const metall = '#8a96a8';
  const dach = akzent ?? '#5ec4d4';
  switch (typ) {
    case 'kern':
      modul(st, pos.x + 0.15, pos.y + 0.15, bw - 0.3, bt - 0.3, h, metall, dach);
      {
        const m = punkt(pos.x + bw / 2, pos.y + bt / 2);
        st.kreis(m.x, m.y - h - 6, 6, licht);
      }
      break;
    case 'werkstatt':
      modul(st, pos.x + 0.1, pos.y + 0.1, bw - 0.2, bt - 0.2, h * 0.8, metall, '#6a7888');
      break;
    case 'wissen':
      modul(st, pos.x + 0.1, pos.y + 0.1, bw - 0.2, bt - 0.2, h, metall, '#a0b8e0');
      {
        const m = punkt(pos.x + bw / 2, pos.y + bt / 2);
        st.kreis(m.x, m.y - h * 0.5, 5, '#c8d8f0');
      }
      break;
    case 'turm': {
      const m = punkt(pos.x + 0.5, pos.y + 0.5);
      st.rechteck(m.x - 2 * S, m.y - 40 * S, 4 * S, 40 * S, metall);
      st.linie(m.x, m.y - 40 * S, m.x + 12 * S, m.y - 48 * S, dach, 2);
      st.linie(m.x, m.y - 40 * S, m.x - 12 * S, m.y - 48 * S, dach, 2);
      break;
    }
    case 'eingang':
      modul(st, pos.x + 0.2, pos.y + 0.25, bw - 0.4, bt - 0.5, h * 0.7, metall, dach);
      break;
    case 'einfassung':
      for (let i = 0; i < 3; i++) {
        const p = punkt(pos.x + 0.2 + i * 0.3, pos.y + 0.4);
        st.rechteck(p.x - 2 * S, p.y - 12 * S, 4 * S, 12 * S, '#5a6880');
      }
      break;
    case 'ursprung': {
      const m = punkt(pos.x + 0.5, pos.y + 0.5);
      st.ellipse(m.x, m.y, 10 * S, 5 * S, '#4a5568');
      st.kreis(m.x, m.y - 2 * S, 4 * S, licht);
      break;
    }
    case 'zeichen': {
      const m = punkt(pos.x + 0.5, pos.y + 0.5);
      st.linie(m.x, m.y, m.x, m.y - 26 * S, '#d0d8e0', 2);
      st.flaeche(
        [m.x, m.y - 26 * S, m.x + 12 * S, m.y - 20 * S, m.x, m.y - 14 * S],
        akzent ?? '#5ec4d4',
      );
      break;
    }
    case 'flaeche':
      for (const [sx, sy] of [
        [0.35, 0.35],
        [0.65, 0.4],
        [0.5, 0.7],
      ] as const) {
        const p = punkt(pos.x + bw * sx, pos.y + bt * sy);
        st.kreis(p.x, p.y - 3, 3, akzent ?? '#7aecd4');
      }
      break;
    case 'denkmal': {
      const m = punkt(pos.x + 0.5, pos.y + 0.5);
      st.ellipse(m.x, m.y - 8 * S, 7 * S, 10 * S, akzent ?? '#a0b0c0');
      st.kreis(m.x, m.y - 8 * S, 3 * S, licht);
      break;
    }
  }
  void abend;
}
