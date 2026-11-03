// Installation als App (O14): Läuft Bastion schon vom Startbildschirm? Bietet der Browser
// ein eigenes Installieren an (Chrome/Edge/Android: „beforeinstallprompt“)? Hat die Person
// „Ohne Installation weiter“ gewählt? Das Letzte gilt bis zum nächsten Öffnen der App
// (sessionStorage) – danach erscheint die Anleitung wieder, wie im Vorbild einbuergerung.
import { erkenneGeraet, sperreZeigen, type Geraet } from './geraet';

interface InstallAngebot extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const WEITER = 'bastion.ohne-installation';

function vomStartbildschirm(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    matchMedia('(display-mode: standalone)').matches ||
    matchMedia('(display-mode: fullscreen)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function weiterGewaehlt(): boolean {
  try {
    return sessionStorage.getItem(WEITER) === 'ja';
  } catch {
    return false;
  }
}

export const geraet: Geraet =
  typeof navigator === 'undefined'
    ? { system: 'desktop', browser: 'other' }
    : erkenneGeraet(navigator.userAgent, navigator.platform, navigator.maxTouchPoints);

export const installation = $state({
  installiert: vomStartbildschirm(),
  /** Der Browser bietet ein eigenes Installieren an */
  angebot: false,
  weiter: weiterGewaehlt(),
});

let angebot: InstallAngebot | undefined;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    angebot = e as InstallAngebot;
    installation.angebot = true;
  });
  window.addEventListener('appinstalled', () => {
    installation.installiert = true;
    installation.angebot = false;
  });
}

/** Soll die Startsperre mit Anleitung erscheinen? */
export const sperre = (): boolean =>
  sperreZeigen(geraet, installation.installiert, installation.weiter);

/** „Ohne Installation im Browser weiter“ – gilt bis zum nächsten Öffnen. */
export function ohneInstallationWeiter(): void {
  installation.weiter = true;
  try {
    sessionStorage.setItem(WEITER, 'ja');
  } catch {
    // Ohne sessionStorage gilt die Wahl nur bis zum Neuladen
  }
}

/** Das eigene Installieren des Browsers öffnen (nur wenn er es angeboten hat). */
export async function jetztInstallieren(): Promise<void> {
  if (!angebot) return;
  await angebot.prompt();
  const { outcome } = await angebot.userChoice;
  angebot = undefined;
  installation.angebot = false;
  if (outcome === 'accepted') installation.installiert = true;
}
