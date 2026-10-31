// Darstellung anwenden (GRAFIK §2, §3): schreibt die Tokens der gewählten Fassung
// als CSS-Variablen an <html>. „System“ folgt der Einstellung des Geräts, auch
// wenn sie sich ändert, während die App offen ist. Kontrast (V110) verstärkt Text.
import type { Modus } from '../../core/policy/einstellung';
import { FASSUNGEN, STANDARD_FASSUNG, type FassungName } from './fassungen';

/** Was gerade gilt; das Bild der Bastion zeichnet sich neu, wenn `dunkel` wechselt. */
export const darstellung = $state<{
  modus: Modus;
  fassung: FassungName;
  dunkel: boolean;
  kontrast: boolean;
}>({
  modus: 'system',
  fassung: STANDARD_FASSUNG,
  dunkel: false,
  kontrast: false,
});

const systemDunkel = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;

function anwenden() {
  const fassung = FASSUNGEN[darstellung.fassung];
  const dunkel =
    darstellung.modus === 'dunkel' || (darstellung.modus === 'system' && systemDunkel());
  const wurzel = document.documentElement;
  for (const [rolle, wert] of Object.entries(dunkel ? fassung.dunkel : fassung.hell)) {
    wurzel.style.setProperty(`--${rolle}`, wert);
  }
  for (const [rolle, wert] of Object.entries(fassung.form)) {
    wurzel.style.setProperty(`--${rolle}`, wert);
  }
  // Kräftiger Text (V110): dunklere/hellere Textfarben, etwas stärkerer Kontrast
  if (darstellung.kontrast) {
    if (dunkel) {
      wurzel.style.setProperty('--farbe-text', '#fffaf2');
      wurzel.style.setProperty('--farbe-text-leise', '#e8dfd0');
      wurzel.style.setProperty('--farbe-rand', '#6a5f52');
    } else {
      wurzel.style.setProperty('--farbe-text', '#14110e');
      wurzel.style.setProperty('--farbe-text-leise', '#3a342c');
      wurzel.style.setProperty('--farbe-rand', '#b8ab97');
    }
  }
  wurzel.style.colorScheme = dunkel ? 'dark' : 'light';
  wurzel.dataset['modus'] = dunkel ? 'dunkel' : 'hell';
  wurzel.dataset['kontrast'] = darstellung.kontrast ? 'stark' : 'normal';
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', dunkel ? fassung.leiste.dunkel : fassung.leiste.hell);
  darstellung.dunkel = dunkel;
}

let beobachtet = false;

/** Beim Start und bei jeder Wahl unter „Über mich“. */
export function darstellungSetzen(modus: Modus, fassung: FassungName = darstellung.fassung) {
  darstellung.modus = modus;
  darstellung.fassung = fassung;
  if (!beobachtet) {
    beobachtet = true;
    window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (darstellung.modus === 'system') anwenden();
    });
  }
  anwenden();
}

/** Kräftiger Text ein/aus (V110). */
export function kontrastAnwenden(an: boolean) {
  darstellung.kontrast = an;
  anwenden();
}
