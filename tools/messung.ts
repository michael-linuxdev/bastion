// Leistungsmessung der gebauten App auf einem nachgeahmten schwachen Gerät
// (ARCHITEKTUR §9, Aufgabe 0.10). Ersetzt nicht die Messung auf echten
// Referenzgeräten, macht aber Veränderungen von Version zu Version sichtbar.
//
// Aufruf: pnpm build && pnpm messen
import { chromium, type Page } from '@playwright/test';
import { spawn } from 'node:child_process';

const PORT = 4174;
const URL_START = `http://localhost:${PORT}/`;
const DURCHLAEUFE = 5;

// Profile nach Chrome-DevTools-Vorbild. Die CPU-Drosselung wirkt relativ zum
// Messrechner – Werte verschiedener Rechner sind daher nicht direkt vergleichbar.
const PROFILE = [
  { name: 'Desktop, ungedrosselt', cpu: 1, netz: null },
  {
    name: 'Altgerät (CPU ÷6, langsames 4G)',
    cpu: 6,
    netz: { latenzMs: 150, downKbit: 1600, upKbit: 750 },
  },
] as const;

type Netz = (typeof PROFILE)[number]['netz'];

interface Messwert {
  ersteDarstellungMs: number;
  nutzbarMs: number;
  uebertragenKb: number;
}

async function drosseln(seite: Page, cpu: number, netz: Netz): Promise<void> {
  const cdp = await seite.context().newCDPSession(seite);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
  if (netz) {
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: netz.latenzMs,
      downloadThroughput: (netz.downKbit * 1024) / 8,
      uploadThroughput: (netz.upKbit * 1024) / 8,
    });
  }
}

async function messeLaden(seite: Page): Promise<Messwert> {
  const start = Date.now();
  await seite.goto(URL_START);
  await seite.getByRole('heading', { level: 1 }).waitFor();
  const nutzbarMs = Date.now() - start;
  const werte = await seite.evaluate(() => {
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? NaN;
    const ressourcen = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const navigation = performance.getEntriesByType('navigation')[0] as
      PerformanceNavigationTiming | undefined;
    const bytes =
      ressourcen.reduce((s, r) => s + r.transferSize, 0) + (navigation?.transferSize ?? 0);
    return { fcp, bytes };
  });
  return { ersteDarstellungMs: werte.fcp, nutzbarMs, uebertragenKb: werte.bytes / 1024 };
}

// Fehlende Werte (der Browser meldet nicht immer eine erste Darstellung) zählen nicht mit.
function median(zahlen: number[]): number {
  const s = zahlen.filter(Number.isFinite).sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? (s[m] ?? NaN) : ((s[m - 1] ?? NaN) + (s[m] ?? NaN)) / 2;
}

async function warteAufServer(): Promise<void> {
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(URL_START)).ok) return;
    } catch {
      // Server startet noch.
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('Vorschau-Server startet nicht – vorher pnpm build ausführen.');
}

const server = spawn('pnpm', ['preview', '--port', String(PORT), '--strictPort'], {
  stdio: 'ignore',
});

try {
  await warteAufServer();
  const browser = await chromium.launch();

  for (const profil of PROFILE) {
    const ersterStart: Messwert[] = [];
    const offlineStart: Messwert[] = [];

    for (let i = 0; i < DURCHLAEUFE; i++) {
      // Jeder Durchlauf mit leerem Browserprofil = echter erster Besuch.
      const kontext = await browser.newContext();
      const seite = await kontext.newPage();
      await drosseln(seite, profil.cpu, profil.netz);

      ersterStart.push(await messeLaden(seite));
      await seite.evaluate(() => navigator.serviceWorker.ready);
      await seite.getByText('funktioniert jetzt auch ohne Internet').waitFor();

      await kontext.setOffline(true);
      offlineStart.push(await messeLaden(seite));
      await kontext.close();
    }

    const zeile = (titel: string, w: Messwert[]) =>
      `  ${titel.padEnd(22)} erste Darstellung ${median(w.map((x) => x.ersteDarstellungMs))
        .toFixed(0)
        .padStart(5)} ms · ` +
      `nutzbar ${median(w.map((x) => x.nutzbarMs))
        .toFixed(0)
        .padStart(5)} ms · ` +
      `übertragen ${median(w.map((x) => x.uebertragenKb))
        .toFixed(1)
        .padStart(6)} KB`;

    console.log(`${profil.name} (Median aus ${DURCHLAEUFE} Durchläufen)`);
    console.log(zeile('erster Besuch online', ersterStart));
    console.log(zeile('Neustart offline', offlineStart));
  }

  await browser.close();
} finally {
  server.kill();
}
