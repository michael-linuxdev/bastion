// Farben zum Gestalten (Schritt 2.14): kräftig genug für hell und dunkel.
// Werte für Bild und Farbfelder an einem Ort; Namen in der Textdatei (farbe.<name>).
import type { Farbe } from '../../core/bastion/katalog';

export const FARBWERT: Readonly<Record<Farbe, string>> = {
  rot: '#c0392b',
  orange: '#e67e22',
  gelb: '#f1c40f',
  gruen: '#27ae60',
  blau: '#2e86c1',
  lila: '#8e44ad',
  weiss: '#f4f1ea',
  schwarz: '#2c2c2c',
};
