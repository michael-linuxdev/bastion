// Darstellung anwenden (GRAFIK §2, §3): schreibt die Tokens der gewählten Fassung
// als CSS-Variablen an <html>. „System“ folgt der Einstellung des Geräts, auch
// wenn sie sich ändert, während die App offen ist.
// Design L61: Lernflächen bleiben hell; Abend/Nacht nur in der Bastion-Szene
// (`szeneAbend` liest weiter `darstellung.modus` / `darstellung.dunkel`).
import type { Modus } from '../../core/policy/einstellung';
import { FASSUNGEN, STANDARD_FASSUNG, type FassungName } from './fassungen';

/** Was gerade gilt; das Bild der Bastion zeichnet sich neu, wenn `dunkel` wechselt. */
export const darstellung = $state<{ modus: Modus; fassung: FassungName; dunkel: boolean }>({
  modus: 'system',
  fassung: STANDARD_FASSUNG,
  dunkel: false,
});

const systemDunkel = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;

function anwenden() {
  const fassung = FASSUNGEN[darstellung.fassung];
  const dunkel =
    darstellung.modus === 'dunkel' || (darstellung.modus === 'system' && systemDunkel());
  const wurzel = document.documentElement;
  for (const [rolle, wert] of Object.entries(fassung.hell)) {
    wurzel.style.setProperty(`--${rolle}`, wert);
  }
  for (const [rolle, wert] of Object.entries(fassung.form)) {
    wurzel.style.setProperty(`--${rolle}`, wert);
  }
  wurzel.style.colorScheme = 'light';
  wurzel.dataset['modus'] = 'hell';
  wurzel.dataset['bastionAbend'] = dunkel ? 'ja' : 'nein';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', fassung.leiste.hell);
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
