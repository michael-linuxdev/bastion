// Fassungen der Grafik (GRAFIK §3, B-27): Alles Aussehen hängt an diesen Tokens.
// Komponenten fragen nur nach Rollen (`var(--farbe-akzent)`), nie nach festen
// Farben. Eine neue Grafik kommt als weitere Fassung dazu; Daten ändern sich dabei nicht.

/** Rollen, die jede Fassung füllen muss – in hell und dunkel. */
export const FARB_ROLLEN = [
  'farbe-hintergrund',
  'farbe-flaeche',
  /** Zweite Fläche, z. B. für Knöpfe zweiter Wahl (Flächen statt Rahmen) */
  'farbe-flaeche-leise',
  'farbe-text',
  'farbe-text-leise',
  'farbe-akzent',
  /** Schrift auf dem Akzent (Hauptknopf) */
  'farbe-auf-akzent',
  /** Nur für Flächen und Bilder (Dächer, Fehlerwerkstatt), nicht für Text */
  'farbe-akzent-warm',
  'farbe-akzent-warm-hell',
  'farbe-rand',
  /** „Sitzt“, richtig gelöst */
  'farbe-erfolg',
  'farbe-himmel',
  /** Sonne bei Tag, erleuchtete Fenster am Abend */
  'farbe-licht',
  'farbe-hinweis-flaeche',
  'farbe-hinweis-rand',
  'farbe-schatten',
  // Bauplatz (BASEBAU B-12): eine Farbe je Gebäudefamilie
  'bastion-boden',
  'bastion-raster',
  'bastion-linie',
  'bastion-kern',
  'bastion-wissen',
  'bastion-verteidigung',
  'bastion-bau',
  'bastion-zierde',
  'hinterhof-g',
  'hinterhof-m',
] as const;
export type FarbRolle = (typeof FARB_ROLLEN)[number];
export type Farben = Readonly<Record<FarbRolle, string>>;

/** Formen und Schrift: für hell und dunkel gleich. */
export const FORM_ROLLEN = [
  /** Ruhige Text-Schrift (Aufgaben, Fließtext) */
  'schrift',
  /** Display für Ortsnamen und Marke (gleiche Familie, andere Optik) */
  'schrift-display',
  'abstand-s',
  'abstand-m',
  'abstand-l',
  /** Knöpfe und kleine Flächen */
  'radius',
  /** Karten */
  'radius-karte',
  /** Mindestgröße für Touch-Ziele */
  'ziel',
] as const;
export type FormRolle = (typeof FORM_ROLLEN)[number];

export interface Fassung {
  readonly hell: Farben;
  readonly dunkel: Farben;
  readonly form: Readonly<Record<FormRolle, string>>;
  /** Für `theme-color` (Leiste des Browsers) */
  readonly leiste: { readonly hell: string; readonly dunkel: string };
}

/** Richtung A „Tag, warm“ (GRAFIK §1); dunkel als Abendstimmung (§2). */
const TAG_WARM: Fassung = {
  hell: {
    'farbe-hintergrund': '#f6f1e7',
    'farbe-flaeche': '#ffffff',
    'farbe-flaeche-leise': '#efe7d9',
    'farbe-text': '#2b2620',
    'farbe-text-leise': '#5e564b',
    'farbe-akzent': '#1f7a72',
    'farbe-auf-akzent': '#ffffff',
    'farbe-akzent-warm': '#c4603a',
    'farbe-akzent-warm-hell': '#e07a4f',
    'farbe-rand': '#e4dacb',
    'farbe-erfolg': '#2e7a32',
    'farbe-himmel': '#d6ecf3',
    'farbe-licht': '#f5c451',
    'farbe-hinweis-flaeche': '#fff4d9',
    'farbe-hinweis-rand': '#c49a3c',
    'farbe-schatten': 'rgb(60 45 25 / 0.08)',
    'bastion-boden': '#b8d48e',
    'bastion-raster': '#a5c47a',
    'bastion-linie': '#4a3a26',
    'bastion-kern': '#c9b9a0',
    'bastion-wissen': '#2f6f8f',
    'bastion-verteidigung': '#77706a',
    'bastion-bau': '#b07a3e',
    'bastion-zierde': '#3f7d3a',
    'hinterhof-g': '#a8682f',
    'hinterhof-m': '#8d949c',
  },
  dunkel: {
    'farbe-hintergrund': '#1e1b17',
    'farbe-flaeche': '#2a251f',
    'farbe-flaeche-leise': '#352f27',
    'farbe-text': '#f3ece0',
    'farbe-text-leise': '#c4b9a7',
    'farbe-akzent': '#5fc4b8',
    'farbe-auf-akzent': '#1e1b17',
    'farbe-akzent-warm': '#e07a4f',
    'farbe-akzent-warm-hell': '#ee8a5e',
    'farbe-rand': '#463e33',
    'farbe-erfolg': '#8ccb7e',
    'farbe-himmel': '#1a2342',
    'farbe-licht': '#ffc85a',
    'farbe-hinweis-flaeche': '#3b3222',
    'farbe-hinweis-rand': '#c49a3c',
    'farbe-schatten': 'rgb(0 0 0 / 0.3)',
    'bastion-boden': '#33422e',
    'bastion-raster': '#42533b',
    'bastion-linie': '#f1ece4',
    'bastion-kern': '#a39580',
    'bastion-wissen': '#72b5d4',
    'bastion-verteidigung': '#b3aca4',
    'bastion-bau': '#d1a06a',
    'bastion-zierde': '#86c278',
    'hinterhof-g': '#d39a5d',
    'hinterhof-m': '#c9d0d8',
  },
  form: {
    // Mitgeliefert (schrift.css), nie aus dem Netz; sonst die Systemschrift.
    // Display und Text teilen Nunito (T-16); zweite Display-Datei bräuchte ARCHITEKTUR.
    schrift: "'Nunito Variable', system-ui, sans-serif",
    'schrift-display': "'Nunito Variable', system-ui, sans-serif",
    'abstand-s': '0.5rem',
    'abstand-m': '1rem',
    'abstand-l': '2rem',
    radius: '0.875rem',
    'radius-karte': '1.25rem',
    ziel: '2.75rem',
  },
  leiste: { hell: '#f6f1e7', dunkel: '#1e1b17' },
};

export const FASSUNGEN = { 'tag-warm': TAG_WARM } as const;
export type FassungName = keyof typeof FASSUNGEN;
export const STANDARD_FASSUNG: FassungName = 'tag-warm';
