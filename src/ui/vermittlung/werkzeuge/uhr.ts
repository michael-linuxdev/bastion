// Uhr (VERMITTLUNG §2.3, Werkzeug uhr@1): eine Zeigeruhr, mit `bis` zwei Uhren für Anfang und
// Ende. Mit `etappen` steht darunter eine Zeitleiste: erst bis zur vollen Stunde, dann volle
// Stunden, dann die restlichen Minuten (so wird die Zeitspanne in M.GM.GR.ZEIT gerechnet).
// Interaktiv stellen Knöpfe die Uhr (das Ende) in Minuten- und Stundenschritten vor und zurück.
// Reine Logik; die Darstellung ist Uhr.svelte.
import type { Bild } from '../../../core/learning/generator';
import { bild, kreis, linie, text } from '../../../generators/svg';
import { t } from '../../texte/texte';

export interface UhrParameter {
  /** Uhrzeit 'H:MM' (Standard 9:40); mit `bis` der Anfang */
  readonly von?: unknown;
  /** Ende 'H:MM', nicht vor `von`, am selben Tag */
  readonly bis?: unknown;
  /** true: Zeitleiste in Etappen über die vollen Stunden (nur mit `bis`) */
  readonly etappen?: unknown;
  /** Minuten je Knopfdruck: 1, 5, 10 oder 15 (Standard 5) */
  readonly schritt?: unknown;
}

export interface Uhr {
  /** Minuten seit Mitternacht */
  readonly von: number;
  readonly bis?: number;
  readonly etappen: boolean;
  readonly schritt: number;
}

export interface Etappe {
  readonly von: number;
  readonly bis: number;
}

const TAG = 24 * 60;

/** 'H:MM' oder 'HH:MM' → Minuten seit Mitternacht; undefined bei Unsinn. */
export function minutenAus(x: unknown): number | undefined {
  if (typeof x !== 'string') return undefined;
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(x);
  return m ? Number(m[1]) * 60 + Number(m[2]) : undefined;
}

/** Minuten seit Mitternacht → „9:40“. */
export const uhrzeit = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;

/** Dauer in Minuten → „20 min“, „1 h“, „1 h 35 min“. */
export function dauerText(min: number): string {
  const h = Math.floor(min / 60);
  const rest = min % 60;
  if (h === 0) return `${rest} min`;
  return rest === 0 ? `${h} h` : `${h} h ${rest} min`;
}

export function uhrAus(p: UhrParameter): Uhr {
  const von = minutenAus(p.von) ?? 9 * 60 + 40;
  const bisRoh = minutenAus(p.bis);
  const bis = bisRoh !== undefined && bisRoh >= von ? bisRoh : undefined;
  const schritt = [1, 5, 10, 15].includes(p.schritt as number) ? (p.schritt as number) : 5;
  return {
    von,
    ...(bis !== undefined ? { bis } : {}),
    etappen: bis !== undefined && p.etappen === true,
    schritt,
  };
}

/** Uhr (das Ende, ohne Ende die Uhrzeit) um `minuten` vor- oder zurückstellen; bleibt am Tag. */
export function gestellt(z: Uhr, minuten: number): Uhr {
  if (z.bis === undefined) return { ...z, von: Math.min(TAG - 1, Math.max(0, z.von + minuten)) };
  return { ...z, bis: Math.min(TAG - 1, Math.max(z.von, z.bis + minuten)) };
}

/** Etappen von `von` bis `bis`: bis zur vollen Stunde, volle Stunden, Rest. */
export function etappen(von: number, bis: number): Etappe[] {
  if (bis <= von) return [];
  const ersteVolle = Math.ceil(von / 60) * 60;
  const letzteVolle = Math.floor(bis / 60) * 60;
  if (ersteVolle > letzteVolle) return [{ von, bis }];
  const e: Etappe[] = [];
  if (von < ersteVolle) e.push({ von, bis: ersteVolle });
  if (letzteVolle > ersteVolle) e.push({ von: ersteVolle, bis: letzteVolle });
  if (bis > letzteVolle) e.push({ von: letzteVolle, bis });
  return e;
}

const uhrText = (m: number) => `${uhrzeit(m)} ${t('werkzeug.uhr.uhr')}`;

/** Statuszeile und Kern der Beschreibung: „Von 9:40 Uhr bis 10:00 Uhr: 20 min“. */
export function standText(z: Uhr): string {
  if (z.bis === undefined) return uhrText(z.von);
  return `${t('werkzeug.uhr.von')} ${uhrText(z.von)} ${t('werkzeug.uhr.bis')} ${uhrText(z.bis)}: ${dauerText(z.bis - z.von)}`;
}

/** Text für den Bildschirmleser: Uhrzeiten, bei Etappen jede Etappe und die Summe. */
export function beschreibung(z: Uhr): string {
  if (z.bis === undefined) return `${t('werkzeug.uhr.eine')} ${uhrText(z.von)}.`;
  const saetze = [
    `${t('werkzeug.uhr.zwei')} ${t('werkzeug.uhr.anfang')} ${uhrText(z.von)}, ${t('werkzeug.uhr.ende')} ${uhrText(z.bis)}.`,
  ];
  if (z.etappen) {
    const e = etappen(z.von, z.bis);
    saetze.push(
      `${t('werkzeug.uhr.leiste')} ${e
        .map(
          (x) =>
            `${t('werkzeug.uhr.von')} ${uhrzeit(x.von)} ${t('werkzeug.uhr.bis')} ${uhrzeit(x.bis)}: ${dauerText(x.bis - x.von)}`,
        )
        .join('; ')}. ${t('werkzeug.uhr.zusammen')} ${zusammenText(z.bis - z.von)}.`,
    );
  }
  return saetze.join(' ');
}

/** „95 min = 1 h 35 min“ oder „20 min“. */
const zusammenText = (min: number) =>
  min >= 60 ? `${min} min = ${dauerText(min)}` : dauerText(min);

function zifferblatt(cx: number, cy: number, r: number, m: number): string[] {
  const p = (grad: number, l: number): [number, number] => [
    cx + l * Math.sin((grad * Math.PI) / 180),
    cy - l * Math.cos((grad * Math.PI) / 180),
  ];
  const teile = [kreis(cx, cy, r)];
  for (let i = 0; i < 60; i++) {
    const voll = i % 5 === 0;
    const [x1, y1] = p(i * 6, r - (voll ? 8 : 4));
    const [x2, y2] = p(i * 6, r);
    teile.push(linie(x1, y1, x2, y2, voll ? 2 : 0.75));
  }
  for (let h = 1; h <= 12; h++) {
    const [x, y] = p(h * 30, r - 18);
    teile.push(text(x, y + 4.5, String(h), 12));
  }
  const stunde = ((Math.floor(m / 60) % 12) + (m % 60) / 60) * 30;
  const [hx, hy] = p(stunde, r * 0.5);
  const [mx, my] = p((m % 60) * 6, r * 0.8);
  teile.push(linie(cx, cy, hx, hy, 5), linie(cx, cy, mx, my, 2.5), kreis(cx, cy, 3.5, true));
  return teile;
}

const BREITE = 340;

export function uhrBild(z: Uhr): Bild {
  const r = 58;
  const yUhr = 8 + r;
  const teile: string[] = [];
  if (z.bis === undefined) {
    teile.push(...zifferblatt(BREITE / 2, yUhr, r, z.von));
    teile.push(text(BREITE / 2, yUhr + r + 24, uhrText(z.von), 15));
    return bild(BREITE, yUhr + r + 34, teile, { de: beschreibung(z) });
  }
  teile.push(
    ...zifferblatt(85, yUhr, r, z.von),
    ...zifferblatt(255, yUhr, r, z.bis),
    text(85, yUhr + r + 22, `${t('werkzeug.uhr.anfang')} ${uhrText(z.von)}`, 14),
    text(255, yUhr + r + 22, `${t('werkzeug.uhr.ende')} ${uhrText(z.bis)}`, 14),
  );
  let hoehe = yUhr + r + 34;
  if (z.etappen) {
    const e = etappen(z.von, z.bis);
    const gesamt = z.bis - z.von;
    // Jede Etappe bekommt Platz für ihre Beschriftung, sonst wächst sie mit der Dauer.
    const gewicht = e.map((x) => Math.max(x.bis - x.von, gesamt * 0.28));
    const summe = gewicht.reduce((a, b) => a + b, 0);
    const [xa, xb] = [24, BREITE - 24];
    const yL = hoehe + 50;
    let x = xa;
    teile.push(linie(xa, yL, xb, yL, 2));
    teile.push(linie(xa, yL - 7, xa, yL + 7, 2), text(xa, yL + 24, uhrzeit(z.von), 12));
    e.forEach((s, i) => {
      const w = ((gewicht[i] ?? 0) / summe) * (xb - xa);
      const x2 = x + w;
      const mitte = (x + x2) / 2;
      teile.push(
        `<path d="M${x + 3} ${yL - 6} Q${mitte} ${yL - 36} ${x2 - 3} ${yL - 6}" stroke-width="1.5"/>`,
        text(mitte, yL - 30, dauerText(s.bis - s.von), 13),
        linie(x2, yL - 7, x2, yL + 7, 2),
        text(x2, yL + 24, uhrzeit(s.bis), 12),
      );
      x = x2;
    });
    teile.push(
      text(BREITE / 2, yL + 50, `${t('werkzeug.uhr.zusammen')} ${zusammenText(gesamt)}`, 15),
    );
    hoehe = yL + 60;
  }
  return bild(BREITE, hoehe, teile, { de: beschreibung(z) });
}
