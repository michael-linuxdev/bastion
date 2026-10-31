// Orientierung merken und anwenden (Screen Orientation API; Hinweis bei Abweichung).
import type { Orientierung } from '../../core/policy/einstellung';

export const orientierungStand = $state<{
  wahl: Orientierung;
  /** Gerät weicht von der Wahl ab und Sperren ging nicht – Nutzer soll drehen */
  hinweis: boolean;
}>({ wahl: 'auto', hinweis: false });

function geraetQuer(): boolean {
  return window.matchMedia?.('(orientation: landscape)').matches ?? false;
}

function hinweisAktualisieren() {
  const w = orientierungStand.wahl;
  if (w === 'auto') {
    orientierungStand.hinweis = false;
    return;
  }
  const quer = geraetQuer();
  orientierungStand.hinweis = w === 'quer' ? !quer : quer;
}

function sperren(typ: 'portrait' | 'landscape'): boolean {
  const o = screen.orientation;
  if (!o || typeof o.lock !== 'function') return false;
  try {
    const ergebnis = o.lock(typ);
    if (ergebnis && typeof (ergebnis as Promise<void>).then === 'function') {
      void (ergebnis as Promise<void>).catch(() => undefined);
    }
    return true;
  } catch {
    return false;
  }
}

function entsperren() {
  try {
    screen.orientation?.unlock?.();
  } catch {
    /* Browser ohne unlock oder ohne vorheriges lock */
  }
}

/** Wahl setzen und versuchen, die Orientierung zu sperren (Nutzer-Geste). */
export function orientierungSetzen(wahl: Orientierung) {
  orientierungStand.wahl = wahl;
  document.documentElement.dataset['orientierung'] = wahl;
  if (wahl === 'auto') {
    entsperren();
    orientierungStand.hinweis = false;
    return;
  }
  const ok = sperren(wahl === 'quer' ? 'landscape' : 'portrait');
  if (!ok) hinweisAktualisieren();
  else orientierungStand.hinweis = false;
}

/** Beim Start: gespeicherte Wahl anzeigen, ohne aggressiv zu sperren. */
export function orientierungLaden(wahl: Orientierung) {
  orientierungStand.wahl = wahl;
  document.documentElement.dataset['orientierung'] = wahl;
  hinweisAktualisieren();
  if (!beobachtet) {
    beobachtet = true;
    window.matchMedia?.('(orientation: landscape)').addEventListener('change', () => {
      hinweisAktualisieren();
    });
  }
}

let beobachtet = false;
