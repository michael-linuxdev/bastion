// Gerät und Browser erkennen, um die passende Installationsanleitung zu zeigen (O14).
// Rein und ohne Browser-Zugriff testbar: Die Angaben aus `navigator` reicht der Aufrufer herein.
// Vorbild: michael-linuxdev/einbuergerung (app.js, platform()).

export type System = 'ios' | 'android' | 'desktop';
export type Browser =
  'safari' | 'chrome' | 'firefox' | 'edge' | 'samsung' | 'opera' | 'inapp' | 'other';

export interface Geraet {
  readonly system: System;
  readonly browser: Browser;
}

/**
 * @param ua `navigator.userAgent`
 * @param plattform `navigator.platform` (iPadOS meldet sich als „MacIntel“)
 * @param beruehrpunkte `navigator.maxTouchPoints`
 */
export function erkenneGeraet(ua: string, plattform = '', beruehrpunkte = 0): Geraet {
  const ios = /iPhone|iPad|iPod/.test(ua) || (plattform === 'MacIntel' && beruehrpunkte > 1);
  const android = /Android/.test(ua);
  const inapp = /Instagram|FBAN|FBAV|Line\/|Telegram|WhatsApp|TikTok|; wv\)/i.test(ua);
  const system: System = ios ? 'ios' : android ? 'android' : 'desktop';
  let browser: Browser;
  if (inapp) browser = 'inapp';
  else if (ios)
    browser = /CriOS/.test(ua)
      ? 'chrome'
      : /FxiOS/.test(ua)
        ? 'firefox'
        : /EdgiOS/.test(ua)
          ? 'edge'
          : /Safari/.test(ua)
            ? 'safari'
            : 'other';
  else if (android)
    browser = /SamsungBrowser/.test(ua)
      ? 'samsung'
      : /Firefox/.test(ua)
        ? 'firefox'
        : /EdgA/.test(ua)
          ? 'edge'
          : /OPR|Opera/.test(ua)
            ? 'opera'
            : /Chrome/.test(ua)
              ? 'chrome'
              : 'other';
  else
    browser = /Edg\//.test(ua)
      ? 'edge'
      : /Chrome/.test(ua)
        ? 'chrome'
        : /Firefox/.test(ua)
          ? 'firefox'
          : /Safari/.test(ua)
            ? 'safari'
            : 'other';
  return { system, browser };
}

/** Anleitungen, die es gibt; Schlüssel der Texte: `installieren.<variante>.<n>` */
export const ANLEITUNGEN = {
  'ios-safari': 3,
  'ios-chrome': 3,
  'ios-firefox': 3,
  'ios-edge': 3,
  'ios-other': 2,
  'android-chrome': 3,
  'android-samsung': 3,
  'android-firefox': 3,
  'android-edge': 3,
  'android-opera': 3,
  'android-other': 2,
  inapp: 3,
  'desktop-chrome': 2,
  'desktop-edge': 2,
  'desktop-safari': 1,
  'desktop-other': 1,
} as const satisfies Record<string, number>;

export type Variante = keyof typeof ANLEITUNGEN;

/** Welche Anleitung passt zum Gerät – mit Rückfall auf „<System>-other“. */
export function variante(g: Geraet): Variante {
  if (g.browser === 'inapp') return 'inapp';
  const genau = `${g.system}-${g.browser}`;
  if (genau in ANLEITUNGEN) return genau as Variante;
  return `${g.system}-other`;
}

/** Schlüssel der Schritte einer Anleitung, in Reihenfolge. */
export function schritte(v: Variante): readonly string[] {
  return Array.from({ length: ANLEITUNGEN[v] }, (_, i) => `installieren.${v}.${i + 1}`);
}

/** Auf Handy und Tablet zeigt die App vor dem ersten Schritt die Anleitung (wie im Vorbild). */
export function sperreZeigen(g: Geraet, installiert: boolean, weiterGewaehlt: boolean): boolean {
  return g.system !== 'desktop' && !installiert && !weiterGewaehlt;
}
