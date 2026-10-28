// Fachbegriffe für alle Texte bereitstellen (LEHRPLAN L-7): Die App legt das
// Wörterbuch in den Kontext, Textteile holt es sich dort.
import { getContext, setContext } from 'svelte';
import type { Begriffskarte } from '../../core/learning/begriffe';

const SCHLUESSEL = Symbol('begriffe');

export interface BegriffeQuelle {
  readonly karte: Begriffskarte | undefined;
}

export const begriffeBereitstellen = (quelle: BegriffeQuelle) => setContext(SCHLUESSEL, quelle);
export const begriffeHolen = () => getContext<BegriffeQuelle | undefined>(SCHLUESSEL);
