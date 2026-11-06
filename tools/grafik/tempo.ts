// Tempo der Bastion-Bühne in Chromium (GRAFIK §24, Q-G1): Bildrate, Takt des Pixi-Tickers,
// Auslastung von Hauptfaden und GPU-Prozess sowie Grafikspeicher der Ebenen, je in Ruhe,
// beim Zoomen und beim Schwenken. Ersetzt nicht die Messung am iPhone 13 (Q-G0), macht
// aber Veränderungen von PR zu PR sichtbar.
//
// Aufruf: pnpm build && pnpm tempo [--cpu 4] [--sekunden 6] [--thema bastion] [--ruhig] [--reich]
//        [--foto /tmp/…/bild.png] (Bildschirmfoto nach dem Öffnen, vor der Messung)
//
// Messung: Fenster 390 × 844 bei dreifacher Pixeldichte wie das iPhone 13, CPU gedrosselt
// (Standard vierfach, wirkt relativ zum Messrechner). Die Bühne wird über die Chrome-Ablaufverfolgung
// (Tracing) beobachtet: `DrawFrame` = gezeigtes Bild, `FireAnimationFrame` im Hauptfaden = ein
// Durchlauf des Tickers, `RunTask` = belegte Zeit des Hauptfadens, `GPUTask` = belegte Zeit im
// GPU-Prozess. Der Ebenenspeicher kommt wie in §24 aus `LayerTree` (Fläche × Maßstab² × Pixeldichte²,
// vier Byte je Bildpunkt).
import { chromium, type Browser, type CDPSession, type Page } from '@playwright/test';
import { spawn } from 'node:child_process';

const PORT = 4175;
const BASIS = process.env['BASE_PATH'] ?? '/';
const URL_START = `http://localhost:${PORT}${BASIS}`;
const BREITE = 390;
const HOEHE = 844;
const PIXELDICHTE = 3;

const argumente = process.argv.slice(2);
const option = (name: string, standard: string): string => {
  const i = argumente.indexOf(`--${name}`);
  return i >= 0 ? (argumente[i + 1] ?? standard) : standard;
};
const CPU = Number(option('cpu', '4'));
const SEKUNDEN = Number(option('sekunden', '6'));
const THEMA = option('thema', 'bastion');
/** `--ruhig`: Gerät meldet „Bewegung reduzieren“ → Bühne ohne Bewegung (GRAFIK §4.5) */
const RUHIG = argumente.includes('--ruhig');
/**
 * `--reich`: Vor der Messung eine gewachsene Bastion bauen (Bergfried Stufe 3, Banner,
 * Späherturm Stufe 2, Tor, Studierstube, Garten) – mit Fahnen, mehr Bewohnern und einer
 * Baustelle, wie sie ein Kind nach einigen Wochen hat (GRAFIK §34). Ohne die Option misst
 * das Werkzeug die frische Bastion wie in §29.
 */
const REICH = argumente.includes('--reich');
/** Bauaufträge für `--reich`, der Reihe nach über die Liste in den Bastion-Einstellungen */
const REICH_BAUEN = [
  /^Bergfried auf Stufe 2/,
  /^Banner/,
  /^Späherturm/,
  /^Tor/,
  /^Studierstube/,
  /^Garten/,
  /^Bergfried auf Stufe 3/,
  /^Späherturm auf Stufe 2/,
  /^Statue/,
];

interface Ereignis {
  name: string;
  cat: string;
  ph: string;
  ts: number;
  dur?: number;
  pid: number;
  tid: number;
  args?: { name?: string; data?: Record<string, unknown> };
}

interface Phase {
  name: string;
  start: number;
  ende: number;
}

interface Ergebnis {
  phase: string;
  sekunden: number;
  bilderJeSekunde: number;
  taktJeSekunde: number;
  /** mittlere Dauer eines Ticker-Durchlaufs im Hauptfaden (ms, gedrosselte Zeit) */
  msJeTakt: number;
  hauptfadenProzent: number;
  gpuProzent: number;
  haenger: number;
  ebenenMPx: number;
  ebenenMB: number;
  ebenen: number;
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

const pause = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/**
 * Vorrat anlegen wie der Browser-Test „Bastion als Liste“ (`vorratAnlegen` in
 * `tests/e2e/ueben.spec.ts`): Buchungen und Kontostand ins lokale Speichern der Seite.
 */
async function vorratAnlegen(seite: Page, stand: Record<string, number>): Promise<void> {
  await seite.evaluate(
    (stand) =>
      new Promise<void>((fertig, fehler) => {
        const anfrage = indexedDB.open('bastion');
        anfrage.onerror = () => fehler(anfrage.error);
        anfrage.onsuccess = () => {
          const db = anfrage.result;
          const tx = db.transaction(['profile', 'buchungen', 'konto', 'bastion'], 'readwrite');
          const profile = tx.objectStore('profile').getAll();
          profile.onsuccess = () => {
            const profil = (profile.result[0] as { id: string }).id;
            for (const [ressource, menge] of Object.entries(stand))
              tx.objectStore('buchungen').put({
                id: `${profil}.${ressource}.TEMPO`,
                art: 'buchung',
                v: 1,
                profil,
                ts: Date.now() - 60_000,
                tag: '2026-01-01',
                geraet: 'tempo001',
                ressource,
                menge,
                grund: 'sitzung',
                bezug: 'TEMPO',
                aufschluesselung: {},
                regel: 1,
              });
            tx.objectStore('konto').put({ profil, stand, erworben: stand });
            tx.objectStore('bastion').delete(profil);
          };
          tx.oncomplete = () => {
            db.close();
            fertig();
          };
          tx.onerror = () => fehler(tx.error);
        };
      }),
    stand,
  );
}

/** Für `--reich`: Vorrat anlegen und über die Liste der Einstellungen bauen. */
async function reichBauen(seite: Page): Promise<void> {
  await seite.getByRole('main').getByRole('button', { name: 'Bastion' }).waitFor();
  await vorratAnlegen(seite, { fleiss: 9000, behalten: 900, koennen: 30, schritt: 400 });
  await seite.reload();
  const entdecken = seite.getByRole('button', { name: 'Mehr entdecken' });
  if (await entdecken.isVisible().catch(() => false))
    await entdecken.click({ timeout: 2000 }).catch(() => {});
  await seite.getByRole('main').getByRole('button', { name: 'Bastion' }).click();
  await seite.getByRole('button', { name: 'Bastion-Einstellungen' }).waitFor({ timeout: 30_000 });
  await pause(1500);
  if (!(await seite.getByRole('heading', { name: 'Bastion-Einstellungen' }).isVisible()))
    await seite.getByRole('button', { name: 'Bastion-Einstellungen' }).click();
  for (const name of REICH_BAUEN) {
    const knopf = seite
      .getByRole('listitem')
      .filter({ hasText: name })
      .getByRole('button', { name: 'Bauen' })
      .first();
    if (await knopf.isEnabled({ timeout: 3000 }).catch(() => false)) {
      await knopf.click();
      await pause(600);
    } else console.log(`(--reich: ${String(name)} nicht baubar)`);
  }
  await seite.getByRole('button', { name: '← Zur Bastion' }).click();
}

/** Bastion öffnen wie der Browser-Test „Bauplatz als Bild“ und warten, bis das Bild steht. */
async function bastionOeffnen(seite: Page): Promise<void> {
  await seite.goto(URL_START);
  const entdecken = seite.getByRole('button', { name: 'Mehr entdecken' });
  if (await entdecken.isVisible().catch(() => false))
    await entdecken.click({ timeout: 2000 }).catch(() => {});
  if (REICH) await reichBauen(seite);
  else await seite.getByRole('main').getByRole('button', { name: 'Bastion' }).click();
  await seite.getByRole('button', { name: 'Bastion-Einstellungen' }).waitFor({ timeout: 30_000 });
  if (THEMA !== 'bastion') {
    await seite.getByRole('button', { name: 'Bastion-Einstellungen' }).click();
    await seite.getByRole('radio', { name: new RegExp(`^${THEMA}`, 'i') }).check();
    await seite.getByRole('button', { name: '← Zur Bastion' }).click();
  }
  const bild = seite.locator('.bauplatz canvas');
  for (let i = 0; i < 300 && (await bild.count()) !== 1; i++) await pause(100);
  await seite.locator('.fenster.sichtbar').waitFor({ timeout: 30_000 });
  // Scharfe Bilder nachladen, Kamera einpassen – erst dann messen
  await pause(4000);
}

/** Ebenenspeicher wie GRAFIK §24: Fläche jeder Ebene mal wirksamer Maßstab². */
function ebenenSpeicher(ebenen: LayerTreeEbene[]): { mpx: number; mb: number; anzahl: number } {
  const perId = new Map(ebenen.map((e) => [e.layerId, e]));
  const massstab = (e: LayerTreeEbene): number => {
    let s = 1;
    let aktuell: LayerTreeEbene | undefined = e;
    let tiefe = 0;
    while (aktuell && tiefe++ < 64) {
      const m = aktuell.transform;
      if (m && m.length === 16) s *= Math.hypot(m[0] ?? 1, m[1] ?? 0);
      aktuell = aktuell.parentLayerId ? perId.get(aktuell.parentLayerId) : undefined;
    }
    return s;
  };
  let px = 0;
  let anzahl = 0;
  for (const e of ebenen) {
    if (!e.drawsContent) continue;
    const s = massstab(e);
    px += e.width * e.height * s * s * PIXELDICHTE * PIXELDICHTE;
    anzahl++;
  }
  return { mpx: px / 1e6, mb: (px * 4) / 1024 / 1024, anzahl };
}

interface LayerTreeEbene {
  layerId: string;
  parentLayerId?: string;
  width: number;
  height: number;
  drawsContent: boolean;
  transform?: number[];
}

async function phaseMessen(
  seite: Page,
  cdp: CDPSession,
  name: string,
  ablauf: () => Promise<void>,
  ebenenLesen: () => LayerTreeEbene[],
): Promise<Phase & { ebenen: ReturnType<typeof ebenenSpeicher> }> {
  await seite.evaluate((n) => performance.mark(`tempo:${n}:start`), name);
  const start = Date.now();
  await ablauf();
  const ende = Date.now();
  await seite.evaluate((n) => performance.mark(`tempo:${n}:ende`), name);
  await pause(300);
  const ebenen = ebenenSpeicher(ebenenLesen());
  void cdp;
  return { name, start, ende, ebenen };
}

function auswerten(
  ereignisse: Ereignis[],
  phasen: (Phase & { ebenen: ReturnType<typeof ebenenSpeicher> })[],
): Ergebnis[] {
  // Hauptfaden der Seite: der Renderer-Thread mit den Marken
  const marken = ereignisse.filter((e) => e.cat.includes('blink.user_timing'));
  const markeZeit = (n: string) => marken.find((e) => e.name === n)?.ts;
  const hauptfaden = marken[0];
  const ergebnisse: Ergebnis[] = [];
  for (const p of phasen) {
    const t0 = markeZeit(`tempo:${p.name}:start`);
    const t1 = markeZeit(`tempo:${p.name}:ende`);
    if (t0 === undefined || t1 === undefined || !hauptfaden) continue;
    const dauer = (t1 - t0) / 1e6;
    const drin = (e: Ereignis) => e.ts >= t0 && e.ts < t1;
    const bilder = ereignisse.filter((e) => e.name === 'DrawFrame' && drin(e));
    const takte = ereignisse.filter(
      (e) =>
        e.name === 'FireAnimationFrame' &&
        e.pid === hauptfaden.pid &&
        e.tid === hauptfaden.tid &&
        drin(e),
    );
    const belegt = (filter: (e: Ereignis) => boolean) =>
      ereignisse
        .filter((e) => filter(e) && e.ph === 'X' && e.dur !== undefined && drin(e))
        .reduce((s, e) => s + Math.min(e.dur ?? 0, t1 - e.ts), 0) / 1e6;
    const haupt = belegt(
      (e) => e.name === 'RunTask' && e.pid === hauptfaden.pid && e.tid === hauptfaden.tid,
    );
    const gpu = belegt((e) => e.name === 'GPUTask');
    // Hänger: länger als 100 ms kein gezeigtes Bild
    let haenger = 0;
    const zeiten = bilder.map((e) => e.ts).sort((a, b) => a - b);
    for (let i = 1; i < zeiten.length; i++)
      if ((zeiten[i] ?? 0) - (zeiten[i - 1] ?? 0) > 100_000) haenger++;
    const taktDauer =
      takte.reduce((s, e) => s + (e.dur ?? 0), 0) / 1000 / Math.max(1, takte.length);
    ergebnisse.push({
      phase: p.name,
      sekunden: dauer,
      bilderJeSekunde: bilder.length / dauer,
      taktJeSekunde: takte.length / dauer,
      msJeTakt: taktDauer,
      hauptfadenProzent: (haupt / dauer) * 100,
      gpuProzent: (gpu / dauer) * 100,
      haenger,
      ebenenMPx: p.ebenen.mpx,
      ebenenMB: p.ebenen.mb,
      ebenen: p.ebenen.anzahl,
    });
  }
  return ergebnisse;
}

async function messen(browser: Browser): Promise<Ergebnis[]> {
  const kontext = await browser.newContext({
    viewport: { width: BREITE, height: HOEHE },
    deviceScaleFactor: PIXELDICHTE,
    reducedMotion: RUHIG ? 'reduce' : 'no-preference',
  });
  const seite = await kontext.newPage();
  const cdp = await kontext.newCDPSession(seite);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
  let ebenen: LayerTreeEbene[] = [];
  cdp.on('LayerTree.layerTreeDidChange', (e: { layers?: LayerTreeEbene[] }) => {
    if (e.layers) ebenen = e.layers;
  });
  await bastionOeffnen(seite);
  const foto = option('foto', '');
  if (foto) await seite.screenshot({ path: foto });
  // Erst jetzt einschalten: Die erste Meldung bringt den ganzen Ebenenbaum der Bühne
  await cdp.send('LayerTree.enable');
  await pause(500);

  await browser.startTracing(seite, {
    categories: [
      'devtools.timeline',
      'disabled-by-default-devtools.timeline',
      'disabled-by-default-devtools.timeline.frame',
      'blink.user_timing',
      'toplevel',
      '__metadata',
    ],
  });
  const mitte = { x: BREITE / 2, y: HOEHE / 2 };
  const phasen = [];
  phasen.push(
    await phaseMessen(
      seite,
      cdp,
      'ruhe',
      () => pause(SEKUNDEN * 1000),
      () => ebenen,
    ),
  );
  phasen.push(
    await phaseMessen(
      seite,
      cdp,
      'zoomen',
      async () => {
        // Rad auf die Mitte, abwechselnd heran und heraus, wie zwei Finger
        const bis = Date.now() + SEKUNDEN * 1000;
        let richtung = -1;
        let schritt = 0;
        await seite.mouse.move(mitte.x, mitte.y);
        while (Date.now() < bis) {
          await seite.mouse.wheel(0, richtung * 120);
          if (++schritt % 6 === 0) richtung = -richtung;
          await pause(60);
        }
      },
      () => ebenen,
    ),
  );
  phasen.push(
    await phaseMessen(
      seite,
      cdp,
      'schwenken',
      async () => {
        const bis = Date.now() + SEKUNDEN * 1000;
        while (Date.now() < bis) {
          await seite.mouse.move(mitte.x, mitte.y);
          await seite.mouse.down();
          for (let i = 1; i <= 20 && Date.now() < bis; i++) {
            const w = (i / 20) * Math.PI * 2;
            await seite.mouse.move(mitte.x + Math.cos(w) * 80, mitte.y + Math.sin(w) * 80);
            await pause(30);
          }
          await seite.mouse.up();
        }
      },
      () => ebenen,
    ),
  );
  phasen.push(
    await phaseMessen(
      seite,
      cdp,
      'herangezoomt',
      async () => {
        // Ganz heran (Grenze 240 %), dann Ruhe – so maß §24 den Speicher
        await seite.mouse.move(mitte.x, mitte.y);
        for (let i = 0; i < 12; i++) {
          await seite.mouse.wheel(0, -120);
          await pause(40);
        }
        await pause(SEKUNDEN * 1000);
      },
      () => ebenen,
    ),
  );
  const puffer = await browser.stopTracing();
  const ereignisse = (JSON.parse(puffer.toString()) as { traceEvents: Ereignis[] }).traceEvents;
  const ablage = option('ablage', '');
  if (ablage) (await import('node:fs/promises')).writeFile(ablage, puffer);
  if (argumente.includes('--namen')) {
    const zaehler = new Map<string, number>();
    for (const e of ereignisse) zaehler.set(e.name, (zaehler.get(e.name) ?? 0) + 1);
    console.log([...zaehler].sort((a, b) => b[1] - a[1]).slice(0, 60));
  }
  await kontext.close();
  return auswerten(ereignisse, phasen);
}

const server = spawn('pnpm', ['preview', '--port', String(PORT), '--strictPort'], {
  stdio: 'ignore',
});

try {
  await warteAufServer();
  const browser = await chromium.launch();
  const ergebnisse = await messen(browser);
  await browser.close();
  console.log(
    `Tempo der Bühne · Thema ${THEMA} · ${BREITE} × ${HOEHE} bei Pixeldichte ${PIXELDICHTE} · CPU ÷${CPU} · je Phase ${SEKUNDEN} s${RUHIG ? ' · Bewegung reduzieren' : ''}${REICH ? ' · gewachsene Bastion' : ''}`,
  );
  console.log(
    '| Phase | Bilder/s | Takt/s | ms je Takt | Hauptfaden | GPU | Hänger | Ebenen | Ebenenspeicher |',
  );
  console.log('|---|---|---|---|---|---|---|---|---|');
  for (const e of ergebnisse) {
    console.log(
      `| ${e.phase} | ${e.bilderJeSekunde.toFixed(1)} | ${e.taktJeSekunde.toFixed(1)} | ${e.msJeTakt.toFixed(1)} | ${e.hauptfadenProzent.toFixed(0)} % | ${e.gpuProzent.toFixed(0)} % | ${e.haenger} | ${e.ebenen} | ${e.ebenenMPx.toFixed(0)} MPx ≈ ${e.ebenenMB.toFixed(0)} MB |`,
    );
  }
} finally {
  server.kill();
}
