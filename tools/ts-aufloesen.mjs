// Lässt Node Werkzeug-Skripte in TypeScript direkt ausführen: Importe ohne
// Endung (wie im Projekt üblich) werden auf „.ts“ aufgelöst.
import { register } from 'node:module';

const haken = `export async function resolve(ziel, kontext, weiter) {
  try {
    return await weiter(ziel, kontext);
  } catch (fehler) {
    if (ziel.startsWith('.') && !ziel.endsWith('.ts')) return weiter(ziel + '.ts', kontext);
    throw fehler;
  }
}`;
register(`data:text/javascript,${encodeURIComponent(haken)}`);
