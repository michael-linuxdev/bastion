// Bilder für das Thema Garten (GRAFIK §7).
// Wiese, Teich, Gebäude im Gartenstil und ein paar bewegte Dinge: Gras, Blumen
// und Baumkronen im Wind, Glanz auf dem Wasser, Schmetterlinge, Zwerge.
// Ohne PixiJS, wie die Dorfbilder. Zufall gibt es nicht: dieselbe Stelle
// ergibt immer dasselbe Bild. Was der Fortschritt freischaltet, steht in
// `freischalten.ts`. Die Zwerge laufen nur über freie Kacheln.
import { BAUPLATZ, KATALOG, type GebaeudeTyp, type Position } from '../../../core/bastion/katalog';
import { LEERE_EINGABE, gartenFreigabe, type GartenEingabe, type ZwergTat } from './freischalten';
import { hash01, schattieren, type Stift } from './dorf';
import { punkt } from './iso';

/** Welche Rolle welches Gartenbild bekommt. */
export const GARTEN_BILD = {
  kern: 'baumhaus',
  werkstatt: 'geraeteschuppen',
  wissen: 'gewaechshaus',
  turm: 'aussichtsbaum',
  eingang: 'gartentor',
  einfassung: 'hecke',
  ursprung: 'gartenbank',
  zeichen: 'wimpel',
  flaeche: 'blumenbeet',
  denkmal: 'gartenzwerg',
} as const satisfies Record<GebaeudeTyp, string>;

export interface GartenBau {
  readonly typ: GebaeudeTyp;
  readonly stufe: number;
  readonly pos: Position;
  readonly akzent?: string;
  readonly auswahl: boolean;
}

/** Teich, fest in der Ecke. Belegt, solange kein Gebäude darauf steht. */
export const TEICH: readonly Position[] = [
  { x: 1, y: 1 },
  { x: 2, y: 1 },
  { x: 1, y: 2 },
  { x: 2, y: 2 },
];

/** Kiesweg. Liegt ein Gebäude darauf, bleibt die Kachel zu. */
const PFAD: readonly Position[] = [
  { x: 3, y: 2 },
  { x: 3, y: 3 },
  { x: 3, y: 4 },
  { x: 3, y: 5 },
  { x: 4, y: 6 },
  { x: 4, y: 7 },
  { x: 5, y: 7 },
  { x: 7, y: 7 },
  { x: 8, y: 6 },
  { x: 8, y: 5 },
];

const BAEUME: readonly { x: number; y: number; s: number }[] = [
  { x: -0.45, y: 1.5, s: 1 },
  { x: -0.55, y: 6.1, s: 1.15 },
  { x: -0.35, y: 10.2, s: 0.9 },
  { x: 2.4, y: -0.5, s: 1.05 },
  { x: 7.4, y: -0.55, s: 1.1 },
  { x: 11.3, y: 2.2, s: 0.95 },
  { x: 12.15, y: 6.8, s: 1 },
  { x: 6.4, y: 12.35, s: 0.9 },
];

const HUT = ['#c0392b', '#2e86c1', '#1e8c4a'] as const;
const TUNIKA = ['#3d6b4f', '#3d5c8a', '#8d4a3a'] as const;
const BLUETE = ['#e07a4f', '#f2d06b', '#f4a4c0', '#f7f1e6'] as const;
const FALTER_FARBE = ['#e07a4f', '#f2d06b', '#f4a4c0'] as const;

/** Ein Schritt dauert so lange. Ruhig, nicht hektisch. */
const GEH_SEK = 3.2;
const STEH_SEK = 2.2;
const ARBEIT_SEK = 5;

const key = (f: Position) => `${f.x},${f.y}`;

function imFeld(f: Position): boolean {
  return f.x >= 0 && f.y >= 0 && f.x < BAUPLATZ.breite && f.y < BAUPLATZ.tiefe;
}

function nachbarn(f: Position): Position[] {
  return [
    { x: f.x + 1, y: f.y },
    { x: f.x - 1, y: f.y },
    { x: f.x, y: f.y + 1 },
    { x: f.x, y: f.y - 1 },
  ];
}

function belegt(blocker: readonly { typ: GebaeudeTyp; pos: Position }[]): Set<string> {
  const menge = new Set<string>();
  for (const b of blocker) {
    const [w, t] = KATALOG[b.typ].groesse;
    for (let dy = 0; dy < t; dy++)
      for (let dx = 0; dx < w; dx++) {
        const feld = { x: b.pos.x + dx, y: b.pos.y + dy };
        if (imFeld(feld)) menge.add(key(feld));
      }
  }
  for (const f of TEICH) if (!menge.has(key(f))) menge.add(key(f));
  return menge;
}

/** Freie Kachel: im Raster, kein Gebäude, kein Teich. */
export function istBegehbar(
  blocker: readonly { typ: GebaeudeTyp; pos: Position }[],
  feld: Position,
): boolean {
  return imFeld(feld) && !belegt(blocker).has(key(feld));
}

function weg(
  von: Position,
  nach: Position,
  frei: (f: Position) => boolean,
): Position[] | undefined {
  if (!frei(von) || !frei(nach)) return undefined;
  if (von.x === nach.x && von.y === nach.y) return [von];
  const her = new Map<string, string | undefined>();
  const schlange: Position[] = [von];
  her.set(key(von), undefined);
  for (let i = 0; i < schlange.length; i++) {
    const aktuell = schlange[i];
    if (!aktuell) break;
    for (const n of nachbarn(aktuell)) {
      const k = key(n);
      if (her.has(k) || !frei(n)) continue;
      her.set(k, key(aktuell));
      if (n.x === nach.x && n.y === nach.y) {
        const pfad: Position[] = [n];
        let cursor: string | undefined = key(aktuell);
        while (cursor !== undefined) {
          const [xs, ys] = cursor.split(',');
          pfad.push({ x: Number(xs), y: Number(ys) });
          cursor = her.get(cursor);
        }
        pfad.reverse();
        return pfad;
      }
      schlange.push(n);
    }
  }
  return undefined;
}

function ufer(menge: Set<string>): Position[] {
  const liste: Position[] = [];
  const gesehen = new Set<string>();
  for (const teich of TEICH) {
    for (const n of nachbarn(teich)) {
      const k = key(n);
      if (gesehen.has(k) || !imFeld(n) || menge.has(k)) continue;
      gesehen.add(k);
      liste.push(n);
    }
  }
  return liste;
}

function beetPlaetze(
  blocker: readonly { typ: GebaeudeTyp; pos: Position }[],
  menge: Set<string>,
): Position[] {
  const liste: Position[] = [];
  const gesehen = new Set<string>();
  for (const b of blocker) {
    if (b.typ !== 'flaeche') continue;
    const [w, t] = KATALOG[b.typ].groesse;
    for (let dy = 0; dy < t; dy++)
      for (let dx = 0; dx < w; dx++)
        for (const n of nachbarn({ x: b.pos.x + dx, y: b.pos.y + dy })) {
          const k = key(n);
          if (gesehen.has(k) || !imFeld(n) || menge.has(k)) continue;
          gesehen.add(k);
          liste.push(n);
        }
  }
  return liste;
}

interface Schritt {
  readonly von: Position;
  readonly nach: Position;
  readonly dauer: number;
  readonly tat: ZwergTat;
}

function routeSchliessen(ziele: readonly Position[], frei: (f: Position) => boolean): Position[] {
  const start = ziele[0];
  if (!start) return [];
  const route = [start];
  let aktuell = start;
  for (let i = 1; i < ziele.length; i++) {
    const ziel = ziele[i];
    if (!ziel) continue;
    const stueck = weg(aktuell, ziel, frei);
    if (!stueck) continue;
    route.push(...stueck.slice(1));
    aktuell = ziel;
  }
  if (aktuell.x !== start.x || aktuell.y !== start.y) {
    const zurueck = weg(aktuell, start, frei);
    if (zurueck) route.push(...zurueck.slice(1));
  }
  return route;
}

function naechstes(von: Position, ziele: readonly Position[]): Position | undefined {
  let best: Position | undefined;
  let dist = Infinity;
  for (const z of ziele) {
    const d = Math.abs(z.x - von.x) + Math.abs(z.y - von.y);
    if (d > 0 && d < dist) {
      dist = d;
      best = z;
    }
  }
  return best;
}

function schritteAus(route: readonly Position[], beet: Set<string>, rand: Set<string>): Schritt[] {
  const start = route[0];
  if (!start) return [];
  const kStart = key(start);
  const erste: ZwergTat = beet.has(kStart) ? 'beet' : rand.has(kStart) ? 'teich' : 'stehen';
  const schritte: Schritt[] = [
    { von: start, nach: start, dauer: erste === 'stehen' ? STEH_SEK : ARBEIT_SEK, tat: erste },
  ];
  for (let i = 0; i < route.length - 1; i++) {
    const von = route[i];
    const nach = route[i + 1];
    if (!von || !nach || (von.x === nach.x && von.y === nach.y)) continue;
    schritte.push({ von, nach, dauer: GEH_SEK, tat: 'laufen' });
    const k = key(nach);
    if (beet.has(k)) schritte.push({ von: nach, nach, dauer: ARBEIT_SEK, tat: 'beet' });
    else if (rand.has(k)) schritte.push({ von: nach, nach, dauer: ARBEIT_SEK, tat: 'teich' });
    else if (i % 3 === 2) schritte.push({ von: nach, nach, dauer: STEH_SEK, tat: 'stehen' });
  }
  return schritte;
}

function skript(
  index: number,
  menge: Set<string>,
  uferListe: readonly Position[],
  beetListe: readonly Position[],
): Schritt[] {
  const frei = (f: Position) => imFeld(f) && !menge.has(key(f));
  const pfad = PFAD.filter((f) => frei(f));
  const amWeg = uferListe.filter((f) => pfad.some((p) => p.x === f.x && p.y === f.y));
  const rest = uferListe.filter((f) => !amWeg.some((p) => p.x === f.x && p.y === f.y));
  const startQuelle = amWeg.length + rest.length > 0 ? [...amWeg, ...rest] : pfad;
  const start = startQuelle[index % Math.max(1, startQuelle.length)];
  if (!start || !frei(start)) return [];
  const ziele: Position[] = [start];
  const beet = naechstes(start, beetListe);
  if (beet) ziele.push(beet);
  const weit = pfad[(index + 4) % Math.max(1, pfad.length)];
  if (weit && pfad.length > 0) ziele.push(weit);
  const route = routeSchliessen(ziele, frei);
  const beetKeys = new Set(beetListe.map(key));
  const uferKeys = new Set(uferListe.map(key));
  const schritte = schritteAus(route, beetKeys, uferKeys);
  if (schritte.length > 0) return schritte;
  const tat: ZwergTat = uferKeys.has(key(start)) ? 'teich' : 'stehen';
  return [
    { von: start, nach: start, dauer: STEH_SEK, tat: 'stehen' },
    { von: start, nach: start, dauer: ARBEIT_SEK, tat },
  ];
}

export interface ZwergPose {
  readonly index: number;
  readonly x: number;
  readonly y: number;
  readonly feld: Position;
  readonly tat: ZwergTat;
  readonly phase: number;
}

type MitStufe = { typ: GebaeudeTyp; stufe: number };
type MitOrt = { typ: GebaeudeTyp; pos: Position };

/** Wege einmal berechnen, nicht in jedem Bild. */
function plaene(blocker: readonly MitOrt[], bauwerke: readonly MitStufe[], eingabe: GartenEingabe) {
  const menge = belegt(blocker);
  const uferListe = ufer(menge);
  const beetListe = beetPlaetze(blocker, menge);
  const anzahl = gartenFreigabe(eingabe, bauwerke).zwerge;
  const alle: Schritt[][] = [];
  for (let index = 0; index < anzahl; index++)
    alle.push(skript(index, menge, uferListe, beetListe));
  return alle;
}

function poseVon(
  schritte: readonly Schritt[],
  index: number,
  t: number,
  ruhig: boolean,
): ZwergPose | undefined {
  const erste = schritte[0];
  if (!erste) return undefined;
  const summe = schritte.reduce((s, x) => s + x.dauer, 0);
  const zeit = ruhig || summe <= 0 ? 0 : (t + index * 9) % summe;
  let rest = zeit;
  let schritt = erste;
  for (const s of schritte) {
    if (rest <= s.dauer) {
      schritt = s;
      break;
    }
    rest -= s.dauer;
  }
  const anteil = schritt.tat === 'laufen' && schritt.dauer > 0 ? rest / schritt.dauer : 0;
  const gx = schritt.von.x + (schritt.nach.x - schritt.von.x) * anteil;
  const gy = schritt.von.y + (schritt.nach.y - schritt.von.y) * anteil;
  const ort = punkt(gx + 0.5, gy + 0.5);
  return {
    index,
    x: ort.x,
    y: ort.y - 2,
    feld: anteil < 0.5 ? schritt.von : schritt.nach,
    tat: schritt.tat,
    phase: schritt.tat === 'laufen' ? anteil : ruhig ? 0 : rest,
  };
}

/** Zwerge zur Zeit t (Sekunden). `ruhig`: sie stehen am Anfang ihres Weges. */
export function zwergPosen(
  blocker: readonly MitOrt[],
  bauwerke: readonly MitStufe[],
  eingabe: GartenEingabe,
  t: number,
  ruhig: boolean,
): ZwergPose[] {
  const posen: ZwergPose[] = [];
  for (const [index, schritte] of plaene(blocker, bauwerke, eingabe).entries()) {
    const pose = poseVon(schritte, index, t, ruhig);
    if (pose) posen.push(pose);
  }
  return posen;
}

/** Höhe fürs Antippen. Baumhaus und Aussichtsbaum wachsen mit der Stufe. */
export function gartenHoehe(typ: GebaeudeTyp, stufe: number): number {
  const grund: Record<GebaeudeTyp, number> = {
    kern: 78,
    werkstatt: 40,
    wissen: 44,
    turm: 70,
    eingang: 36,
    einfassung: 26,
    ursprung: 22,
    zeichen: 40,
    flaeche: 24,
    denkmal: 42,
  };
  const wuchs = typ === 'kern' || typ === 'turm' ? (stufe - 1) * 8 : 0;
  return grund[typ] + wuchs;
}

/** Farbe einer Wiesenraute. Am Abend dunkler, außen ein Rand. */
export function rasenFarbe(abend: boolean, x: number, y: number, aussen: boolean): string {
  if (aussen) return abend ? '#142018' : '#23402c';
  const hell = hash01(x + 1, y + 4) > 0.86;
  const schach = (x + y) % 2 === 0;
  if (abend) return hell ? '#24382c' : schach ? '#1c3026' : '#18281f';
  if (hell) return '#93c465';
  return schach ? '#6fa34a' : '#5e9440';
}

const flach = (p: readonly { x: number; y: number }[]) => p.flatMap((q) => [q.x, q.y]);
const hoch = (p: { x: number; y: number }, h: number) => ({ x: p.x, y: p.y - h });

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
  st.ellipse((s.x + we.x) / 2, s.y + 3, 16, 5, '#000000', 0.14);
  st.flaeche(flach([we, s, oben.s, oben.w]), schattieren(wand, -28));
  st.flaeche(flach([s, o, oben.o, oben.s]), schattieren(wand, -10));
  const dachPunkte = flach([oben.n, oben.o, oben.s, oben.w]);
  st.flaeche(dachPunkte, dach);
  st.kontur(dachPunkte, 'rgba(43, 38, 32, 0.25)', 1);
}

function fenster(
  st: Stift,
  x: number,
  y: number,
  w: number,
  t: number,
  h: number,
  farbe: string,
): void {
  for (const [a, b] of [
    [punkt(x, y + t), punkt(x + w, y + t)],
    [punkt(x + w, y + t), punkt(x + w, y)],
  ] as const) {
    const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - h * 0.45 };
    st.rechteck(m.x - 3, m.y - 4, 6, 8, farbe);
  }
}

function rahmen(st: Stift, pos: Position, w: number, t: number, farbe: string): void {
  const n = punkt(pos.x - 0.06, pos.y - 0.06);
  const o = punkt(pos.x + w + 0.06, pos.y - 0.06);
  const s = punkt(pos.x + w + 0.06, pos.y + t + 0.06);
  const we = punkt(pos.x - 0.06, pos.y + t + 0.06);
  st.kontur(flach([n, o, s, we]), farbe, 3);
}

function stufePunkte(st: Stift, pos: Position, w: number, t: number, stufe: number): void {
  if (stufe <= 1) return;
  const v = punkt(pos.x + w, pos.y + t);
  for (let i = 0; i < stufe; i++) st.kreis(v.x - 4 - i * 7, v.y - 8, 2.4, '#f0c14a');
}

/** Die Wiese mit Weg, Teich und kleinen Unterschieden je Kachel. */
export function gartenBoden(st: Stift, abend: boolean): void {
  const { breite, tiefe } = BAUPLATZ;
  const teich = new Set(TEICH.map(key));
  const pfad = new Set(PFAD.map(key));
  for (let y = -1; y <= tiefe; y++) {
    for (let x = -1; x <= breite; x++) {
      const aussen = x < 0 || y < 0 || x >= breite || y >= tiefe;
      const k = key({ x, y });
      const n = punkt(x, y);
      const o = punkt(x + 1, y);
      const s = punkt(x + 1, y + 1);
      const w = punkt(x, y + 1);
      const ecken = flach([n, o, s, w]);
      const wasser = teich.has(k);
      const kies = pfad.has(k);
      const farbe = wasser
        ? abend
          ? '#1a4556'
          : '#3d8eb4'
        : kies
          ? abend
            ? '#3a3428'
            : '#d9c4a0'
          : rasenFarbe(abend, x, y, aussen);
      st.flaeche(ecken, farbe);
      st.kontur(ecken, wasser ? 'rgba(18, 50, 64, 0.35)' : 'rgba(28, 48, 24, 0.14)', 1);
      if (wasser && x === 2 && y === 2) {
        const p = punkt(x + 0.35, y + 0.4);
        st.ellipse(p.x, p.y, 8, 3.5, abend ? '#1e5a3a' : '#3e8c4a');
      }
      if (!aussen && !wasser && !kies && hash01(x + 2, y + 6) > 0.94) {
        const p = punkt(x + 0.62, y + 0.4);
        st.kreis(p.x, p.y, 2, hash01(x, y) > 0.5 ? '#f2d06b' : '#fff8ea');
      }
    }
  }
}

export interface Lage {
  readonly x: number;
  readonly y: number;
  readonly drehung: number;
  readonly alpha: number;
  readonly tiefe: number;
  readonly sx: number;
}

/** Ein Bildteil. `einmal`: nur beim Aufbau zeichnen, danach nur noch schieben. */
export interface Bild {
  readonly einmal: boolean;
  readonly male: (st: Stift, t: number, ruhig: boolean) => void;
  readonly lage: (t: number, ruhig: boolean) => Lage;
}

const ruhe = (drehung: number, t: number, ruhig: boolean, staerke: number, phase: number) =>
  ruhig ? 0 : drehung + Math.sin(t * 0.9 + phase) * staerke;

function still(x: number, y: number, tiefe: number): Lage {
  return { x, y, drehung: 0, alpha: 1, tiefe, sx: 1 };
}

function zwergZeichnen(
  st: Stift,
  tat: ZwergTat,
  phase: number,
  hut: string,
  tunika: string,
  ox: number,
  oy: number,
): void {
  const schritt = tat === 'laufen' ? Math.sin(phase * Math.PI * 2) * 3 : 0;
  const arbeit = tat === 'beet' || tat === 'teich' ? Math.sin(phase * 1.6) : 0;
  st.ellipse(ox, oy + 2, 7, 2.6, '#000000', 0.16);
  st.linie(ox - 2.4, oy - 1, ox - 2.4 + schritt, oy + 4, '#5c4033', 2.2);
  st.linie(ox + 2.4, oy - 1, ox + 2.4 - schritt, oy + 4, '#5c4033', 2.2);
  st.ellipse(ox, oy - 8, 5.4, 5.6, tunika);
  if (tat === 'beet') {
    st.linie(ox + 4, oy - 8, ox + 11, oy - 3 + arbeit, '#f3c7a1', 2);
    st.linie(ox + 10, oy - 3 + arbeit, ox + 16, oy - 1, '#6d4a2e', 2);
    st.linie(ox + 14, oy - 5 + arbeit, ox + 14, oy + 2, '#8d6e4a', 1.5);
  } else if (tat === 'teich') {
    st.linie(ox + 3, oy - 9, ox + 15, oy - 18, '#6d4a2e', 1.6);
    st.linie(ox + 15, oy - 18, ox + 15 + arbeit, oy - 2, '#d5e4ea', 1);
  } else {
    st.linie(ox + 4, oy - 8, ox + 8 + schritt * 0.4, oy - 3, '#f3c7a1', 2);
  }
  st.ellipse(ox, oy - 11, 3.8, 2.8, '#f7f1e6');
  st.kreis(ox, oy - 15, 4.1, '#f3c7a1');
  st.kreis(ox - 1.4, oy - 15.4, 0.55, '#2b2620');
  st.kreis(ox + 1.4, oy - 15.4, 0.55, '#2b2620');
  st.kreis(ox, oy - 13.6, 1, '#e7b08a');
  st.ellipse(ox, oy - 17.2, 5.6, 1.8, hut);
  st.flaeche([ox - 5, oy - 17, ox, oy - 28, ox + 5, oy - 17], hut);
}

function gebaeudeMalen(
  st: Stift,
  bau: GartenBau,
  abend: boolean,
  licht: string,
  auswahlFarbe: string,
): void {
  const { typ, stufe, pos } = bau;
  const [w, t] = KATALOG[typ].groesse;
  const akzent = bau.akzent ?? '#e07a4f';
  const fensterFarbe = abend ? licht : '#f4e2a8';
  switch (typ) {
    case 'kern': {
      const c = punkt(pos.x + w / 2, pos.y + t / 2);
      const extra = (stufe - 1) * 8;
      st.ellipse(c.x, c.y + 4, 26, 9, '#000000', 0.16);
      st.rechteck(c.x - 5, c.y - 30 - extra, 10, 34 + extra, '#6d4a2e');
      st.rechteck(c.x - 6, c.y - 30 - extra, 3, 34 + extra, '#8a6240');
      st.kreis(c.x, c.y - 40 - extra, 24, '#2f6b3a');
      st.kreis(c.x - 12, c.y - 34 - extra, 14, '#3f8748');
      st.kreis(c.x + 12, c.y - 36 - extra, 13, '#4e9a56');
      const haus = c.y - 44 - extra;
      st.flaeche(
        [c.x - 16, haus + 12, c.x + 16, haus + 12, c.x + 12, haus, c.x - 12, haus],
        '#c4a574',
      );
      st.flaeche([c.x - 18, haus, c.x, haus - 12, c.x + 18, haus], '#c4603a');
      st.rechteck(c.x - 4, haus + 2, 8, 7, fensterFarbe);
      st.linie(c.x + 16, c.y - 2, c.x + 10, haus + 12, '#a67c52', 2);
      break;
    }
    case 'werkstatt': {
      kasten(st, pos.x, pos.y, w, t, 30, '#8d6e4a', '#a67c52');
      fenster(st, pos.x, pos.y, w, t, 30, fensterFarbe);
      const v = punkt(pos.x + 0.3, pos.y + t - 0.2);
      st.linie(v.x, v.y - 8, v.x - 8, v.y - 28, '#6d4a2e', 2);
      st.linie(v.x - 12, v.y - 26, v.x - 4, v.y - 26, '#8d6e4a', 2);
      break;
    }
    case 'wissen': {
      kasten(st, pos.x, pos.y, w, t, 28, '#d5eef5', '#c5e4ef');
      fenster(st, pos.x, pos.y, w, t, 28, abend ? licht : '#eef8fb');
      const c = punkt(pos.x + 1, pos.y + 1);
      st.kreis(c.x, c.y - 34, 3, '#3e8c4a');
      st.kreis(c.x + 6, c.y - 32, 2.4, '#e07a4f');
      break;
    }
    case 'turm': {
      const c = punkt(pos.x + 0.5, pos.y + 0.5);
      const extra = (stufe - 1) * 8;
      st.ellipse(c.x, c.y + 2, 12, 4, '#000000', 0.16);
      st.rechteck(c.x - 3, c.y - 34 - extra, 6, 36 + extra, '#6d4a2e');
      st.ellipse(c.x, c.y - 36 - extra, 14, 5, '#c4a574');
      st.linie(c.x - 12, c.y - 40 - extra, c.x + 12, c.y - 40 - extra, '#f4efe4', 1.6);
      st.kreis(c.x, c.y - 50 - extra, 11, '#2f6b3a');
      st.kreis(c.x - 5, c.y - 46 - extra, 7, '#4e9a56');
      break;
    }
    case 'eingang': {
      const c = punkt(pos.x + 0.5, pos.y + 0.5);
      st.ellipse(c.x, c.y + 2, 14, 4, '#000000', 0.14);
      st.rechteck(c.x - 12, c.y - 22, 4, 24, '#6d4a2e');
      st.rechteck(c.x + 8, c.y - 22, 4, 24, '#6d4a2e');
      st.flaeche([c.x - 14, c.y - 22, c.x, c.y - 32, c.x + 14, c.y - 22], '#c4603a');
      st.linie(c.x - 6, c.y - 2, c.x - 6, c.y - 14, '#a67c52', 2);
      break;
    }
    case 'einfassung': {
      const c = punkt(pos.x + 0.5, pos.y + 0.5);
      st.ellipse(c.x, c.y + 2, 16, 6, '#000000', 0.14);
      st.ellipse(c.x, c.y - 8, 16, 10, '#2f6b3a');
      st.ellipse(c.x - 4, c.y - 12, 9, 6, '#4e9a56');
      break;
    }
    case 'ursprung': {
      const c = punkt(pos.x + 0.5, pos.y + 0.5);
      st.ellipse(c.x, c.y + 2, 12, 4, '#000000', 0.14);
      st.linie(c.x - 10, c.y, c.x - 10, c.y - 6, '#6d4a2e', 2);
      st.linie(c.x + 10, c.y, c.x + 10, c.y - 6, '#6d4a2e', 2);
      st.linie(c.x - 12, c.y - 6, c.x + 12, c.y - 6, '#a67c52', 3);
      st.linie(c.x - 10, c.y - 6, c.x - 10, c.y - 16, '#6d4a2e', 2);
      st.linie(c.x + 10, c.y - 6, c.x + 10, c.y - 16, '#6d4a2e', 2);
      st.linie(c.x - 12, c.y - 14, c.x + 12, c.y - 14, '#c4a574', 3);
      break;
    }
    case 'zeichen': {
      const c = punkt(pos.x + 0.5, pos.y + 0.5);
      st.linie(c.x, c.y + 2, c.x, c.y - 28, '#6d4a2e', 2.4);
      st.flaeche([c.x, c.y - 26, c.x + 14, c.y - 21, c.x, c.y - 16], akzent);
      break;
    }
    case 'flaeche': {
      const n = punkt(pos.x, pos.y);
      const o = punkt(pos.x + w, pos.y);
      const s = punkt(pos.x + w, pos.y + t);
      const we = punkt(pos.x, pos.y + t);
      st.flaeche(flach([n, o, s, we]), '#a67c52');
      const farben = [akzent, ...BLUETE];
      let i = 0;
      for (let gy = 0.45; gy < t; gy += 0.7)
        for (let gx = 0.45; gx < w; gx += 0.7) {
          const p = punkt(pos.x + gx, pos.y + gy);
          st.linie(p.x, p.y, p.x, p.y - 6, '#2f6b3a', 1.4);
          st.kreis(p.x, p.y - 8, 3, farben[i % farben.length] ?? akzent);
          i++;
        }
      break;
    }
    case 'denkmal': {
      const c = punkt(pos.x + 0.5, pos.y + 0.5);
      st.ellipse(c.x, c.y + 1, 10, 4, '#8a7e72');
      zwergZeichnen(st, 'stehen', 0, akzent, '#3d6b4f', c.x, c.y - 2);
      break;
    }
  }
  stufePunkte(st, pos, w, t, stufe);
  if (bau.auswahl) rahmen(st, pos, w, t, auswahlFarbe);
}

function baumBilder(): Bild[] {
  const bilder: Bild[] = [];
  for (const baum of BAEUME) {
    const p = punkt(baum.x, baum.y);
    const s = baum.s;
    const phase = hash01(Math.round(baum.x * 10), Math.round(baum.y * 10)) * 6;
    const tiefe = (baum.x + baum.y) * 10;
    bilder.push({
      einmal: true,
      male(st) {
        st.ellipse(0, 3, 10 * s, 3.5 * s, '#000000', 0.16);
        st.rechteck(-2.2 * s, -15 * s, 4.4 * s, 16 * s, '#6d4a2e');
      },
      lage: () => still(p.x, p.y, tiefe),
    });
    bilder.push({
      einmal: true,
      male(st) {
        st.kreis(0, -8 * s, 12 * s, '#2f6b3a');
        st.kreis(-6 * s, -3 * s, 8 * s, '#3f8748');
        st.kreis(6 * s, -4 * s, 7 * s, '#4e9a56');
      },
      lage: (t, ruhig) => ({
        x: p.x,
        y: p.y - 16 * s,
        drehung: ruhe(0, t, ruhig, 0.045, phase),
        alpha: 1,
        tiefe: tiefe + 1,
        sx: 1,
      }),
    });
  }
  return bilder;
}

function schmuckBilder(menge: Set<string>): Bild[] {
  const bilder: Bild[] = [];
  let gras = 0;
  let blumen = 0;
  for (let y = 0; y < BAUPLATZ.tiefe; y++) {
    for (let x = 0; x < BAUPLATZ.breite; x++) {
      if (menge.has(key({ x, y }))) continue;
      const h = hash01(x + 3, y + 8);
      const p = punkt(x + 0.55, y + 0.42);
      const tiefe = (x + y) * 10;
      if (h > 0.78 && gras < 14) {
        gras++;
        const hoehe = 12 + hash01(x, y) * 8;
        const farbe = h > 0.9 ? '#3f8748' : '#2f6b3a';
        const phase = h * 6;
        bilder.push({
          einmal: true,
          male(st) {
            st.linie(0, 0, -3, -hoehe, farbe, 1.5);
            st.linie(0, 0, 0.4, -hoehe - 3, farbe, 1.5);
            st.linie(0, 0, 3, -hoehe + 1, farbe, 1.5);
          },
          lage: (t, ruhig) => ({
            x: p.x,
            y: p.y,
            drehung: ruhe(0, t, ruhig, 0.12, phase),
            alpha: 1,
            tiefe,
            sx: 1,
          }),
        });
      } else if (h > 0.62 && blumen < 8) {
        blumen++;
        const farbe = BLUETE[blumen % BLUETE.length] ?? '#f2d06b';
        const phase = h * 5;
        bilder.push({
          einmal: true,
          male(st) {
            st.linie(0, 0, 0, -12, '#2f6b3a', 1.4);
            st.kreis(0, -14, 3.2, farbe);
            st.kreis(0, -14, 1.2, '#fff4c2');
          },
          lage: (t, ruhig) => ({
            x: p.x,
            y: p.y,
            drehung: ruhe(0, t, ruhig, 0.08, phase),
            alpha: 1,
            tiefe: tiefe + 0.5,
            sx: 1,
          }),
        });
      }
    }
  }
  return bilder;
}

function wasserBilder(abend: boolean): Bild[] {
  const glanz = abend ? '#9ec4d4' : '#e7f6ff';
  return [0, 1, 2].map((i) => {
    const basis = punkt(1.35 + i * 0.35, 1.4 + (i % 2) * 0.35);
    const phase = i * 1.7;
    return {
      einmal: true,
      male(st: Stift) {
        st.ellipse(0, 0, 7, 2.4, glanz);
      },
      lage: (t: number, ruhig: boolean): Lage => ({
        x: basis.x + (ruhig ? 0 : Math.sin(t * 0.7 + phase) * 4),
        y: basis.y + (ruhig ? 0 : Math.cos(t * 0.5 + phase) * 1.2),
        drehung: 0,
        alpha: ruhig ? 0.4 : 0.22 + (Math.sin(t * 1.3 + phase) * 0.5 + 0.5) * 0.4,
        tiefe: 6,
        sx: 1,
      }),
    };
  });
}

function falterBilder(): Bild[] {
  const mitte = punkt(6, 5);
  const bahn = [
    { dx: -50, dy: -56, rx: 34, ry: 14, tempo: 0.32 },
    { dx: 36, dy: -74, rx: 26, ry: 12, tempo: 0.28 },
    { dx: 8, dy: -36, rx: 40, ry: 11, tempo: 0.24 },
  ];
  return bahn.map((b, i) => {
    const farbe = FALTER_FARBE[i] ?? '#e07a4f';
    const phase = i * 2.1;
    return {
      einmal: false,
      male(st: Stift, t: number, ruhig: boolean) {
        const flugel = ruhig ? 0.65 : 0.3 + Math.abs(Math.sin(t * 2.1 + phase)) * 0.7;
        st.flaeche([0, 0, -9, -5 * flugel, -8, 4 * flugel], farbe, 0.92);
        st.flaeche([0, 0, 9, -5 * flugel, 8, 4 * flugel], farbe, 0.92);
        st.ellipse(0, 0, 1.6, 5, '#5c4033');
      },
      lage: (t: number, ruhig: boolean): Lage => ({
        x: mitte.x + b.dx + (ruhig ? 0 : Math.sin(t * b.tempo + phase) * b.rx),
        y: mitte.y + b.dy + (ruhig ? 0 : Math.cos(t * b.tempo * 0.8 + phase) * b.ry),
        drehung: 0,
        alpha: 1,
        tiefe: 420,
        sx: 1,
      }),
    };
  });
}

function zwergBilder(
  blocker: readonly MitOrt[],
  bauwerke: readonly MitStufe[],
  eingabe: GartenEingabe,
): Bild[] {
  return plaene(blocker, bauwerke, eingabe).flatMap((schritte, index) => {
    const hut = HUT[index] ?? '#c0392b';
    const tunika = TUNIKA[index] ?? '#3d6b4f';
    if (schritte.length === 0) return [];
    return [
      {
        einmal: false,
        male(st: Stift, t: number, ruhig: boolean) {
          const pose = poseVon(schritte, index, t, ruhig);
          if (!pose) return;
          zwergZeichnen(st, pose.tat, pose.phase, hut, tunika, 0, 0);
        },
        lage(t: number, ruhig: boolean): Lage {
          const pose = poseVon(schritte, index, t, ruhig);
          if (!pose) return still(0, 0, 0);
          return still(pose.x, pose.y, (pose.feld.x + pose.feld.y) * 10 + 6);
        },
      },
    ];
  });
}

/** Alle bewegten und stehenden Teile über der Wiese, von hinten nach vorn über `tiefe`. */
export function gartenBilder(
  bauten: readonly GartenBau[],
  blocker: readonly { typ: GebaeudeTyp; pos: Position }[],
  eingabe: GartenEingabe = LEERE_EINGABE,
  abend = false,
  licht = '#ffc85a',
  auswahlFarbe = '#1f7a72',
): Bild[] {
  const menge = belegt(blocker);
  const bilder: Bild[] = [
    ...baumBilder(),
    ...schmuckBilder(menge),
    ...wasserBilder(abend),
    ...falterBilder(),
  ];
  for (const bau of bauten) {
    const [w, t] = KATALOG[bau.typ].groesse;
    const tiefe = (bau.pos.x + bau.pos.y + (w + t) / 2) * 10;
    bilder.push({
      einmal: true,
      male(st) {
        gebaeudeMalen(st, bau, abend, licht, auswahlFarbe);
      },
      lage: () => still(0, 0, tiefe),
    });
  }
  bilder.push(...zwergBilder(blocker, bauten, eingabe));
  return bilder;
}
