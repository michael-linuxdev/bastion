/**
 * Optionaler Bastion-Sound (GRAFIK §4.6, T-18): Standard aus, ohne Bibliothek,
 * nur Bastion/Hinterhof. Bevorzugt CC0-Dateien unter `/sound/` (Manifest);
 * sonst prozedurale Web-Audio-Töne. Kein CDN.
 */

export type SoundTipp = 'bauen' | 'wesen' | 'aufstellen';

export interface SoundSteuerung {
  /** Ob der Nutzer Sound eingeschaltet hat (Einstellung) */
  readonly an: boolean;
  /** Ruhig / System-Ruhe: Ambient aus, Tipps bleiben wenn `an` */
  readonly ruhig: boolean;
}

interface SoundManifest {
  readonly format: number;
  readonly dateien: Readonly<Record<string, { readonly datei: string; readonly loop?: boolean }>>;
}

const SOUND_BASIS = `${import.meta.env.BASE_URL}sound/`;
const MANIFEST_URL = `${SOUND_BASIS}manifest.json`;

let ctx: AudioContext | undefined;
let ambientKnoten: { stop: () => void } | undefined;
let steuern: SoundSteuerung = { an: false, ruhig: false };
let manifest: SoundManifest | null | undefined;
let tipPuffer: Partial<Record<SoundTipp, AudioBuffer>> = {};
let ambientPuffer: AudioBuffer | undefined;
let dateienGeladen = false;
let ladenPromise: Promise<void> | undefined;

function kontext(): AudioContext | undefined {
  if (typeof globalThis.AudioContext === 'undefined') return undefined;
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

async function holeManifest(): Promise<SoundManifest | null> {
  if (manifest !== undefined) return manifest;
  try {
    const r = await fetch(MANIFEST_URL);
    if (!r.ok) {
      manifest = null;
      return null;
    }
    const roh = (await r.json()) as SoundManifest;
    if (roh.format !== 1 || !roh.dateien) {
      manifest = null;
      return null;
    }
    manifest = roh;
    return roh;
  } catch {
    manifest = null;
    return null;
  }
}

async function decodeDatei(c: AudioContext, name: string): Promise<AudioBuffer | undefined> {
  try {
    const r = await fetch(`${SOUND_BASIS}${name}`);
    if (!r.ok) return undefined;
    const ab = await r.arrayBuffer();
    // slice: detach für decodeAudioData in älteren Engines
    return await c.decodeAudioData(ab.slice(0));
  } catch {
    return undefined;
  }
}

/** CC0-Dateien einmalig laden; bei Fehler bleibt der prozedurale Fallback. */
export async function soundDateienLaden(): Promise<void> {
  if (dateienGeladen) return;
  if (ladenPromise) return ladenPromise;
  ladenPromise = (async () => {
    const c = kontext();
    if (!c) return;
    const m = await holeManifest();
    if (!m) {
      dateienGeladen = true;
      return;
    }
    const tipps: SoundTipp[] = ['bauen', 'wesen', 'aufstellen'];
    await Promise.all(
      tipps.map(async (art) => {
        const eintrag = m.dateien[art];
        if (!eintrag) return;
        const puffer = await decodeDatei(c, eintrag.datei);
        if (puffer) tipPuffer[art] = puffer;
      }),
    );
    const ambient = m.dateien['ambient'];
    if (ambient) {
      const puffer = await decodeDatei(c, ambient.datei);
      if (puffer) ambientPuffer = puffer;
    }
    dateienGeladen = true;
  })();
  try {
    await ladenPromise;
  } finally {
    ladenPromise = undefined;
  }
}

/** Steuerung aktualisieren – Ambient startet/stoppt automatisch. */
export function soundSteuern(s: SoundSteuerung): void {
  steuern = s;
  if (!s.an || s.ruhig) ambientStoppen();
  else {
    void soundDateienLaden().then(() => {
      if (steuern.an && !steuern.ruhig) void ambientStarten();
    });
  }
}

export function soundIstAn(): boolean {
  return steuern.an && !steuern.ruhig;
}

function tipProzedural(c: AudioContext, art: SoundTipp): void {
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

function tipAusDatei(c: AudioContext, puffer: AudioBuffer): void {
  const quelle = c.createBufferSource();
  quelle.buffer = puffer;
  const g = c.createGain();
  // Kenney-WAVs sind lauter als der Oszillator – bewusst leise halten
  g.gain.value = 0.12;
  quelle.connect(g);
  g.connect(c.destination);
  quelle.start();
}

/** Kurzer Tipp-Ton (bauen / Wesen / aufstellen). */
export function soundTipp(art: SoundTipp): void {
  if (!steuern.an) return;
  const c = kontext();
  if (!c) return;
  void c.resume();
  const puffer = tipPuffer[art];
  if (puffer) tipAusDatei(c, puffer);
  else tipProzedural(c, art);
  if (!dateienGeladen) void soundDateienLaden();
}

function ambientProzedural(c: AudioContext): { stop: () => void } {
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
  return {
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

function ambientAusDatei(c: AudioContext, puffer: AudioBuffer): { stop: () => void } {
  const quelle = c.createBufferSource();
  quelle.buffer = puffer;
  quelle.loop = true;
  const g = c.createGain();
  g.gain.value = 0.05;
  quelle.connect(g);
  g.connect(c.destination);
  quelle.start();
  return {
    stop: () => {
      try {
        quelle.stop();
      } catch {
        /* schon gestoppt */
      }
      quelle.disconnect();
      g.disconnect();
    },
  };
}

/** Sanftes Ambient (Wind) – Datei wenn geladen, sonst prozedural, kein Netz. */
export async function ambientStarten(): Promise<void> {
  if (!steuern.an || steuern.ruhig || ambientKnoten) return;
  const c = kontext();
  if (!c) return;
  await c.resume();
  await soundDateienLaden();
  if (!steuern.an || steuern.ruhig || ambientKnoten) return;
  ambientKnoten = ambientPuffer ? ambientAusDatei(c, ambientPuffer) : ambientProzedural(c);
}

export function ambientStoppen(): void {
  ambientKnoten?.stop();
  ambientKnoten = undefined;
}

/** Nur für Tests: internen Zustand zurücksetzen. */
export function soundZuruecksetzen(): void {
  ambientStoppen();
  steuern = { an: false, ruhig: false };
  tipPuffer = {};
  ambientPuffer = undefined;
  dateienGeladen = false;
  ladenPromise = undefined;
  manifest = undefined;
  if (ctx) {
    void ctx.close().catch(() => undefined);
    ctx = undefined;
  }
}
