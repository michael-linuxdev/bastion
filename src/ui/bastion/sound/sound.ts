/**
 * Optionaler Bastion-Sound (GRAFIK §4.6, T-18): Standard aus, ohne Bibliothek,
 * nur Bastion/Hinterhof. Prozedurale Töne über Web Audio; optional Dateien unter
 * `/sound/` (CC0), wenn vorhanden.
 */

export type SoundTipp = 'bauen' | 'wesen' | 'aufstellen';

export interface SoundSteuerung {
  /** Ob der Nutzer Sound eingeschaltet hat (Einstellung) */
  readonly an: boolean;
  /** Ruhig / System-Ruhe: Ambient aus, Tipps bleiben wenn `an` */
  readonly ruhig: boolean;
}

let ctx: AudioContext | undefined;
let ambientKnoten: { stop: () => void } | undefined;
let steuern: SoundSteuerung = { an: false, ruhig: false };

function kontext(): AudioContext | undefined {
  if (typeof globalThis.AudioContext === 'undefined') return undefined;
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

/** Steuerung aktualisieren – Ambient startet/stoppt automatisch. */
export function soundSteuern(s: SoundSteuerung): void {
  steuern = s;
  if (!s.an || s.ruhig) ambientStoppen();
  else void ambientStarten();
}

export function soundIstAn(): boolean {
  return steuern.an && !steuern.ruhig;
}

/** Kurzer Tipp-Ton (bauen / Wesen / aufstellen). */
export function soundTipp(art: SoundTipp): void {
  if (!steuern.an) return;
  const c = kontext();
  if (!c) return;
  void c.resume();
  const jetzt = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'sine';
  const f = art === 'wesen' ? 660 : art === 'aufstellen' ? 520 : 440;
  o.frequency.setValueAtTime(f, jetzt);
  o.frequency.exponentialRampToValueAtTime(f * 0.7, jetzt + 0.12);
  g.gain.setValueAtTime(0.0001, jetzt);
  g.gain.exponentialRampToValueAtTime(0.08, jetzt + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, jetzt + 0.18);
  o.connect(g);
  g.connect(c.destination);
  o.start(jetzt);
  o.stop(jetzt + 0.2);
}

/** Sanftes Ambient (Wind) – prozedural, kein Netz. */
export async function ambientStarten(): Promise<void> {
  if (!steuern.an || steuern.ruhig || ambientKnoten) return;
  const c = kontext();
  if (!c) return;
  await c.resume();
  const dauer = 2;
  const puffer = c.createBuffer(1, c.sampleRate * dauer, c.sampleRate);
  const daten = puffer.getChannelData(0);
  // Deterministisches Rauschen (kein Math.random) – reine Textur, kein Spielzustand
  let samen = 0xba57_10;
  let vor = 0;
  for (let i = 0; i < daten.length; i++) {
    samen = (Math.imul(samen, 1664525) + 1013904223) >>> 0;
    const weiss = (samen / 0xffffffff) * 2 - 1;
    vor = (vor + 0.02 * weiss) / 1.02;
    daten[i] = vor * 0.35;
  }
  const quelle = c.createBufferSource();
  quelle.buffer = puffer;
  quelle.loop = true;
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400;
  const g = c.createGain();
  g.gain.value = 0.04;
  quelle.connect(filter);
  filter.connect(g);
  g.connect(c.destination);
  quelle.start();
  ambientKnoten = {
    stop: () => {
      try {
        quelle.stop();
      } catch {
        /* schon gestoppt */
      }
      quelle.disconnect();
      filter.disconnect();
      g.disconnect();
    },
  };
}

export function ambientStoppen(): void {
  ambientKnoten?.stop();
  ambientKnoten = undefined;
}

/** Nur für Tests: internen Zustand zurücksetzen. */
export function soundZuruecksetzen(): void {
  ambientStoppen();
  steuern = { an: false, ruhig: false };
  if (ctx) {
    void ctx.close().catch(() => undefined);
    ctx = undefined;
  }
}
