import { expect, test, type Page } from '@playwright/test';
import { BUEHNE_B, BUEHNE_H, punkt } from '../../src/ui/bastion/grafik/iso';

/** „Mehr“ vom Start-Hub: Sicherung, Themen, Über mich, … */
/**
 * Ein Thema zum Üben öffnen. Hat es eine Erstvermittlung, kommt beim ersten Mal das Angebot
 * „Erst erklären lassen?“ (U3d). Das wird hier übersprungen; Tests zum Angebot selbst klicken es.
 */
async function thema(seite: Page, name: RegExp) {
  // Entdeckungskarte (O83) einmalig wegwischen, falls sie den Weg versperrt
  const spaeter = seite.getByRole('button', { name: 'Später' });
  if (await spaeter.isVisible().catch(() => false)) await spaeter.click();
  await seite.getByRole('button', { name }).click();
  await angebotUeberspringen(seite);
}

/** Kommt das Angebot zur Erstvermittlung, „Ich kann das schon“ wählen; sonst nichts tun. */
async function angebotUeberspringen(seite: Page) {
  const nein = seite.getByRole('button', { name: 'Ich kann das schon' });
  const pruefen = seite.getByRole('button', { name: 'Prüfen' });
  await expect(nein.or(pruefen).first()).toBeVisible({ timeout: 15_000 });
  if (await nein.isVisible()) {
    await nein.click();
    await expect(pruefen).toBeVisible({ timeout: 15_000 });
  }
}

/** Start-Hub: Begrüßung, Willkommen oder erste Minute (noch keine Aufgabe). */
function startGruss(seite: Page) {
  return seite
    .getByText('Willkommen in Bastion.')
    .or(seite.getByText('Hallo. Schön, dass du da bist.'))
    .or(seite.getByText('Ein Ort zum Üben – und eine Bastion, die mitwächst.'))
    .or(seite.getByText('Willkommen zurück'));
}

/** Erste Minute öffnen: Kacheln/Bastion/Mehr wieder zeigen. */
async function hubVoll(seite: Page) {
  const entdecken = seite.getByRole('button', { name: 'Mehr entdecken' });
  // Der Knopf kann zwischen Prüfung und Klick verschwinden (Hub lädt nach) – dann ist nichts zu tun.
  if (await entdecken.isVisible().catch(() => false))
    await entdecken.click({ timeout: 2000 }).catch(() => {});
}

async function zurStartseite(seite: Page) {
  const gruss = startGruss(seite);
  if (
    await gruss
      .first()
      .isVisible()
      .catch(() => false)
  ) {
    await hubVoll(seite);
    return;
  }
  const home = seite.getByRole('button', { name: 'Zur Startseite' });
  if (await home.isVisible().catch(() => false)) {
    await home.click();
  } else {
    // App-Zurück (Eltern/Mehr/…) zuerst – aktualisiert z. B. den Testphase-Hinweis
    const zurueck = seite.getByRole('main').getByRole('button', { name: 'Zurück' }).first();
    if (await zurueck.isVisible().catch(() => false)) await zurueck.click();
  }
  if (
    !(await gruss
      .first()
      .isVisible()
      .catch(() => false))
  )
    await seite.goto('./');
  await expect(gruss.first()).toBeVisible();
  await hubVoll(seite);
}

async function mehr(seite: Page) {
  await zurStartseite(seite);
  await seite.getByRole('main').getByRole('button', { name: 'Mehr' }).click();
  await expect(seite.getByRole('heading', { name: 'Mehr' })).toBeVisible();
}

/** Themenübersicht (Klasse, Niveau) – unter Mehr, nicht unter Üben. */
async function themenWaehlen(seite: Page) {
  await mehr(seite);
  await seite.getByRole('main').getByRole('button', { name: 'Themen wählen' }).click();
  await expect(seite.getByRole('heading', { name: 'Was möchtest du üben?' })).toBeVisible();
}

/** Einen eingeklappten Bereich der Themenwahl aufklappen (L18). */
async function bereichOeffnen(seite: Page, name: string) {
  const bereich = seite.locator('details.bereich', {
    has: seite.getByRole('heading', { name, exact: true }),
  });
  if ((await bereich.getAttribute('open')) === null) await bereich.locator('summary').click();
  await expect(bereich).toHaveAttribute('open', '');
}

/** Bastion öffnen; standardmäßig Einstellungen (Listen/Vorrat/Bau). */
async function bastionOeffnen(seite: Page, einstellungen = true) {
  await zurStartseite(seite);
  await seite.getByRole('main').getByRole('button', { name: 'Bastion' }).click();
  await expect(seite.getByRole('button', { name: 'Bastion-Einstellungen' })).toBeVisible({
    timeout: 30_000,
  });
  if (einstellungen) {
    // Lage/Bild geladen: entweder Bauplatz oder (ohne Bild) schon Einstellungen
    if (!(await seite.getByRole('heading', { name: 'Bastion-Einstellungen' }).isVisible())) {
      await seite.getByRole('button', { name: 'Bastion-Einstellungen' }).click();
    }
    await expect(seite.getByRole('heading', { name: 'Bastion-Einstellungen' })).toBeVisible();
  }
}

/**
 * Ein Feld des Bauplatz-Bilds antippen (Spalte x, Reihe y ab 0).
 * Wartet, bis das Bild ruhig steht: Nach dem Öffnen der Bastion passt die Kamera
 * das Bild erst ein, wenn die gemerkte Kamera geladen ist, und der Atlas tauscht
 * das Canvas kurz aus. Wer davor misst, tippt daneben (wackeliger Test, 01.11.2026).
 */
async function feldTippen(seite: Page, x: number, y: number) {
  const bild = seite.locator('.bauplatz canvas');
  await expect(seite.locator('.fenster.sichtbar')).toHaveCount(1);
  let letzte = '';
  await expect
    .poll(
      async () => {
        if ((await bild.count()) !== 1) return false;
        const r = await bild.boundingBox();
        if (!r || r.width < 10) return false;
        const jetzt = [r.x, r.y, r.width, r.height].map((w) => w.toFixed(1)).join(',');
        const ruhig = jetzt === letzte;
        letzte = jetzt;
        return ruhig;
      },
      { intervals: [100], timeout: 15_000 },
    )
    .toBe(true);
  const r = await bild.boundingBox();
  if (!r) throw new Error('kein Bild');
  // Schräg von oben (GRAFIK §1): dieselbe Umrechnung wie in der App
  const p = punkt(x + 0.5, y + 0.5);
  await bild.click({
    position: { x: (p.x * r.width) / BUEHNE_B, y: (p.y * r.height) / BUEHNE_H },
  });
}

/**
 * Ein Gebäude auf dem Bauplatz-Bild auswählen: antippen, bis die Auswahl es nennt.
 * Die Bühne wird neu aufgebaut, wenn sich Abend, Wetter oder Thema nachträglich
 * ändern; ein Tipper genau in diesem Moment geht ins Leere. Darum bis zu vier Versuche.
 * Nur für Auswahl-Tipper – beim Versetzen würde ein zweiter Tipper das Gebäude bewegen.
 */
async function gebaeudeWaehlen(seite: Page, x: number, y: number, name: string) {
  const wahl = seite.locator('.wahl');
  for (let versuch = 1; ; versuch++) {
    await feldTippen(seite, x, y);
    try {
      await expect(wahl).toContainText(name, { timeout: 3_000 });
      return;
    } catch (fehler) {
      if (versuch >= 4) throw fehler;
    }
  }
}

/** Von der Bastion zur Startseite (Home-Piktogramm oder Einstellungen). */
async function bastionZurStartseite(seite: Page) {
  const home = seite.getByRole('button', { name: 'Zur Startseite' });
  if (await home.isVisible().catch(() => false)) {
    await home.click();
  } else {
    const zahnrad = seite.getByRole('button', { name: 'Bastion-Einstellungen' });
    if (await zahnrad.isVisible().catch(() => false)) await zahnrad.click();
    await expect(seite.getByRole('heading', { name: 'Bastion-Einstellungen' })).toBeVisible();
    await seite.getByRole('button', { name: 'Zur Startseite' }).click();
  }
  await expect(startGruss(seite).first()).toBeVisible();
  await hubVoll(seite);
}

// Kritischer Weg „Üben“: Inhaltspakete laden, Aufgabe beantworten, Rückmeldung
// und Lösungsweg sehen – auch ohne Netz, nach dem ersten Laden.
/** Aktueller Wert einer Einstellung aus IndexedDB (Projektion `einstellungen`). */
function einstellungImSpeicher(page: Page, schluessel: string) {
  return page.evaluate(
    (schluessel) =>
      new Promise<unknown>((fertig, fehler) => {
        const anfrage = indexedDB.open('bastion');
        anfrage.onerror = () => fehler(anfrage.error);
        anfrage.onsuccess = () => {
          const lesen = anfrage.result
            .transaction('einstellungen')
            .objectStore('einstellungen')
            .getAll();
          lesen.onsuccess = () => {
            anfrage.result.close();
            const e = (lesen.result as { schluessel: string; wert: unknown }[]).find(
              (x) => x.schluessel === schluessel,
            );
            fertig(e?.wert);
          };
        };
      }),
    schluessel,
  );
}

/** Zahl der gespeicherten Aufgaben-Ereignisse in IndexedDB. */
function aufgabenImSpeicher(page: Page) {
  return page.evaluate(
    () =>
      new Promise<number>((fertig, fehler) => {
        const anfrage = indexedDB.open('bastion');
        anfrage.onerror = () => fehler(anfrage.error);
        anfrage.onsuccess = () => {
          const zaehlen = anfrage.result.transaction('aufgaben').objectStore('aufgaben').count();
          zaehlen.onsuccess = () => {
            anfrage.result.close();
            fertig(zaehlen.result);
          };
        };
      }),
  );
}

/** Sitzungs-Ereignisse direkt aus IndexedDB lesen (nur die geprüften Felder). */
function sitzungenImSpeicher(page: Page) {
  return page.evaluate(
    () =>
      new Promise<unknown[]>((fertig, fehler) => {
        const anfrage = indexedDB.open('bastion');
        anfrage.onerror = () => fehler(anfrage.error);
        anfrage.onsuccess = () => {
          const lesen = anfrage.result.transaction('sitzungen').objectStore('sitzungen').getAll();
          lesen.onsuccess = () => {
            anfrage.result.close();
            fertig(
              (lesen.result as { abschluss: string; aufgaben: number; lerneinheit: boolean }[]).map(
                (s) => ({
                  abschluss: s.abschluss,
                  aufgaben: s.aufgaben,
                  lerneinheit: s.lerneinheit,
                }),
              ),
            );
          };
        };
      }),
  );
}

test('Üben funktioniert offline mit Rückmeldung und Lösungsweg', async ({
  page,
  context,
  baseURL,
}) => {
  const fremdeAnfragen: string[] = [];
  const eigenerUrsprung = new URL(baseURL ?? '').origin;
  page.on('request', (anfrage) => {
    if (new URL(anfrage.url()).origin !== eigenerUrsprung) fremdeAnfragen.push(anfrage.url());
  });

  await page.goto('./');
  await mehr(page);
  await expect(page.getByText('funktioniert jetzt auch ohne Internet')).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload();

  await themenWaehlen(page);
  await thema(page, /^Addieren und Subtrahieren/);

  // Eine sicher falsche Antwort
  await page.getByLabel('Deine Antwort').fill('0');
  await page.getByRole('button', { name: 'Prüfen' }).click();
  await expect(page.getByText('Noch nicht.')).toBeVisible();
  await expect(page.locator('summary', { hasText: 'Lösungsweg' })).toBeVisible();

  await page.getByRole('button', { name: 'Nächste Aufgabe' }).click();
  await expect(page.getByLabel('Deine Antwort')).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Prüfen' })).toBeVisible();

  // Datenschutz (A2): keine einzige Anfrage an fremde Adressen.
  expect(fremdeAnfragen).toEqual([]);
});

test('merkt sich den Fortschritt auf dem Gerät, auch nach Neuladen', async ({ page }) => {
  await page.goto('./');
  await themenWaehlen(page);
  const thema = page.getByRole('button', { name: /^Addieren und Subtrahieren/ });
  await expect(thema).not.toContainText('in Arbeit');
  await thema.click();
  await angebotUeberspringen(page);
  await page.getByLabel('Deine Antwort').fill('0');
  await page.getByRole('button', { name: 'Prüfen' }).click();
  await expect(page.getByText('Noch nicht.')).toBeVisible();
  await page.getByRole('button', { name: /Zurück/ }).click();
  await expect(page.getByRole('button', { name: /^Addieren und Subtrahieren/ })).toContainText(
    'in Arbeit',
  );

  await page.reload();
  await themenWaehlen(page);
  await expect(page.getByRole('button', { name: /^Addieren und Subtrahieren/ })).toContainText(
    'in Arbeit',
  );
});

test('bietet geübte Aufgaben später zum Wiederholen an', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-02T10:00:00Z') });
  await page.goto('./');
  await hubVoll(page);
  // Noch nie geübt (Y121): die Kachel Wiederholen ist noch ausgeblendet
  await expect(page.getByRole('button', { name: 'Wiederholen' })).toHaveCount(0);

  await themenWaehlen(page);
  await thema(page, /^Addieren und Subtrahieren/);
  await page.getByLabel('Deine Antwort').fill('0');
  await page.getByRole('button', { name: 'Prüfen' }).click();
  await expect(page.getByText('Noch nicht.')).toBeVisible();
  // Erst weiter, wenn die Antwort gespeichert ist (Speichern läuft im Hintergrund)
  await page.getByRole('button', { name: /Zurück/ }).click();
  await expect(page.getByRole('button', { name: /^Addieren und Subtrahieren/ })).toContainText(
    'in Arbeit',
  );

  // Drei Tage später: die Aufgabe ist zum Wiederholen dran
  await page.clock.setSystemTime(new Date('2026-11-05T10:00:00Z'));
  await page.reload();
  await expect(page.getByText('1 Aufgabe ist zum Wiederholen dran.')).toBeVisible();
  await page.getByRole('button', { name: 'Wiederholen' }).click();
  // Regal: Thema wählen, dann üben
  await page.getByRole('button', { name: /Addieren und Subtrahieren/ }).click();
  await expect(page.getByText(/^Addieren und Subtrahieren · grundlegend/)).toBeVisible();
  await page.getByLabel('Deine Antwort').fill('0');
  await page.getByRole('button', { name: 'Prüfen' }).click();
  await page.getByRole('button', { name: 'Nächste Aufgabe' }).click();
  await expect(page.getByText(/Alles wiederholt, was heute dran war/)).toBeVisible();
});

test('Fehlerwerkstatt: genau die falsch gelöste Aufgabe noch einmal, dann erledigt', async ({
  page,
}) => {
  await page.goto('./');
  await themenWaehlen(page);
  await thema(page, /^Addieren und Subtrahieren/);
  // Erste Vorlage reihum ist das schriftliche Addieren: „Berechne schriftlich: a + b“
  const text = (await page.locator('.aufgabe .text').innerText()).replace(/[\s\u202f]/g, '');
  const summe = (/:([\d+]+)$/.exec(text)?.[1] ?? '').split('+').reduce((s, x) => s + Number(x), 0);
  await page.getByLabel('Deine Antwort').fill('0');
  await page.getByRole('button', { name: 'Prüfen' }).click();
  await page.getByRole('button', { name: /Zurück/ }).click();
  await page.reload();

  await expect(page.getByText('1 Fehler wartet in der Fehlerwerkstatt.')).toBeVisible();
  await page.getByRole('button', { name: 'Fehlerwerkstatt' }).click();
  await page.getByRole('button', { name: 'Aufarbeiten' }).click();
  await expect(page.locator('.paar .damals')).toContainText('0');
  await expect(page.getByText('Heute deine Chance')).toBeVisible();
  const nochmal = (await page.locator('.aufgabe .text').innerText()).replace(/[\s\u202f]/g, '');
  expect(nochmal).toBe(text);

  await page.getByLabel('Deine Antwort').fill(String(summe));
  await page.getByRole('button', { name: 'Prüfen' }).click();
  await expect(page.getByText('Stimmt.')).toBeVisible();
  await page.getByRole('button', { name: 'Nächste Aufgabe' }).click();
  await expect(page.getByText('Diese Fehler hast du aufgearbeitet.')).toBeVisible();
  await page.getByRole('button', { name: /Zurück/ }).click();
  await expect(page.getByText(/Keine offenen Fehler/)).toBeVisible();
});

test('Rückkehr nach einer Pause: Begrüßung ohne Vorwurf, kleine Auswahl', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-02T10:00:00Z') });
  await page.goto('./');
  await expect(page.getByText('Willkommen zurück')).toHaveCount(0);
  await themenWaehlen(page);
  await thema(page, /^Addieren und Subtrahieren/);
  await page.getByLabel('Deine Antwort').fill('0');
  await page.getByRole('button', { name: 'Prüfen' }).click();
  // Erst weiter, wenn die Antwort gespeichert ist (Speichern läuft im Hintergrund)
  await page.getByRole('button', { name: /Zurück/ }).click();
  await expect(page.getByRole('button', { name: /^Addieren und Subtrahieren/ })).toContainText(
    'in Arbeit',
  );

  await page.clock.setSystemTime(new Date('2026-11-12T10:00:00Z'));
  await page.reload();
  await expect(page.getByText('Willkommen zurück. Schön, dass du wieder da bist.')).toBeVisible();
  // Mit Basebau auch der Satz über die Bastion (BASEBAU §6.3)
  await expect(page.getByText(/Deine Bastion hat gewartet/)).toBeVisible();
  await expect(page.getByText(/kleine Auswahl zum Wiederholen/)).toBeVisible();
  // Keine Pausenlänge, kein Zähler verpasster Tage
  await expect(page.getByText(/Tage|Tagen|verpasst/)).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Wiederholen' })).toBeVisible();
});

test('Diagnose: ohne Punkte, mit Halbzeit, Ergebnis mit Empfehlung zum Üben', async ({ page }) => {
  await page.goto('./');
  await hubVoll(page);
  await page.getByRole('main').getByRole('button', { name: 'Wo stehe ich?' }).click();
  await expect(page.getByText(/keine Note und keine Punkte/)).toBeVisible();
  await page.getByRole('button', { name: "Los geht's" }).click();

  let halbzeit = 0;
  for (let i = 0; i < 40; i++) {
    if (await page.getByText('Hier stehst du – hier geht es weiter').isVisible()) break;
    if (await page.getByText(/^Halbzeit\./).isVisible()) {
      halbzeit += 1;
      await page.getByRole('button', { name: 'Weiter', exact: true }).click();
      continue;
    }
    // Während der Diagnose keine Wertung
    await expect(page.getByText('Noch nicht.')).toHaveCount(0);
    await page.getByRole('button', { name: 'Weiß ich nicht' }).click();
  }
  expect(halbzeit).toBe(1);
  await expect(page.getByText('Hier stehst du – hier geht es weiter')).toBeVisible();
  await expect(page.getByText(/Punkte|%/)).toHaveCount(0);

  // „Weiß ich nicht“ landet nicht in der Fehlerwerkstatt; Themenwahl ist robuster als Direkt-Üben
  await page.goto('./');
  await themenWaehlen(page);
  const spaeter = page.getByRole('button', { name: 'Später' });
  if (await spaeter.isVisible().catch(() => false)) await spaeter.click();
  await thema(page, /^Addieren und Subtrahieren/);
  await expect(page.getByRole('button', { name: 'Prüfen' })).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: /Zurück/ }).click();
  await page.goto('./');
  await hubVoll(page);
  // Diagnose allein zählt noch nicht als Üben (Y121): Werkstatt-Kachel noch ausgeblendet
  await expect(page.getByRole('button', { name: 'Fehlerwerkstatt' })).toHaveCount(0);
});

test('Mein Stand und Rückweg: nach drei Fehlern eine Voraussetzung vorschlagen', async ({
  page,
}) => {
  await page.goto('./');
  await hubVoll(page);
  await page.getByRole('main').getByRole('button', { name: 'Mein Stand' }).click();
  await expect(page.getByText(/Du hast noch nichts geübt/)).toBeVisible();
  await page.getByRole('button', { name: /Zurück/ }).click();

  await themenWaehlen(page);
  // Ohne Vorwissen ist eine Kompetenz ohne Voraussetzungen empfohlen
  await expect(page.getByRole('button', { name: /^Große Zahlen und Stellenwerte/ })).toContainText(
    'empfohlen',
  );
  await thema(page, /^Addieren und Subtrahieren/);
  for (let i = 0; i < 3; i++) {
    await expect(page.getByText('Kurz üben')).toHaveCount(0);
    await page.getByLabel('Deine Antwort').fill('0');
    await page.getByRole('button', { name: 'Prüfen' }).click();
    if (i < 2) await page.getByRole('button', { name: 'Nächste Aufgabe' }).click();
  }
  await expect(page.getByText(/worauf dieses Thema aufbaut/)).toContainText(
    'Große Zahlen und Stellenwerte',
  );
  await page.getByRole('button', { name: 'Kurz üben' }).click();
  await expect(page.getByRole('heading', { name: /^Große Zahlen und Stellenwerte/ })).toBeVisible();

  await page.getByRole('button', { name: /Zurück/ }).click();
  await page.goto('./');
  await hubVoll(page);
  await page.getByRole('main').getByRole('button', { name: 'Mein Stand' }).click();
  await expect(page.getByRole('heading', { name: 'In Arbeit (1)' })).toBeVisible();
});

test('Elternbereich: PIN, Wiederherstellungscode, beide Ansichten, Transparenz', async ({
  page,
}) => {
  await page.goto('./');
  // etwas üben, damit es etwas zu berichten gibt
  await themenWaehlen(page);
  await thema(page, /^Addieren und Subtrahieren/);
  await page.getByLabel('Deine Antwort').fill('0');
  await page.getByRole('button', { name: 'Prüfen' }).click();
  await page.getByRole('button', { name: /Zurück/ }).click();
  await expect(page.getByRole('button', { name: /^Addieren und Subtrahieren/ })).toContainText(
    'in Arbeit',
  );
  await page.goto('./');

  await mehr(page);
  await page.getByRole('button', { name: 'Für Eltern' }).click();
  await page.getByLabel('PIN', { exact: true }).fill('12');
  await page.getByLabel('PIN wiederholen').fill('12');
  await page.getByRole('button', { name: 'PIN festlegen' }).click();
  await expect(page.getByText(/4 bis 8 Ziffern bestehen/)).toBeVisible();
  await page.getByLabel('PIN', { exact: true }).fill('4711');
  await page.getByLabel('PIN wiederholen').fill('4711');
  await page.getByRole('button', { name: 'PIN festlegen' }).click();
  const code = (await page.locator('.code').innerText()).trim();
  expect(code.split(' ')).toHaveLength(4);
  await page.getByRole('button', { name: 'Ich habe den Code aufgeschrieben' }).click();
  // F2 (T-20): Die Werkstatt liefert Entwürfe aus, darum steht der Vermerk da
  await expect(page.locator('[data-entwurf]')).toContainText('noch nicht fachlich geprüft');
  // Auch Eltern können die Bastion ein- und ausschalten (B-13)
  await expect(page.getByRole('checkbox', { name: 'Bastion anzeigen' })).toBeChecked();

  // Brief ist Standard: Prosa, keine einzelnen Aufgaben
  await expect(page.getByText(/Liebe Eltern/)).toBeVisible();
  await expect(page.getByText(/Addieren und Subtrahieren/)).toBeVisible();
  await expect(page.getByText('Die letzten 100 Aufgaben')).toHaveCount(0);
  await page.getByRole('button', { name: 'Details' }).click();
  await expect(page.getByText('Die letzten 100 Aufgaben')).toBeVisible();
  await expect(page.getByRole('cell', { name: /noch nicht/ }).first()).toBeVisible();

  await page.getByRole('button', { name: 'Elternbereich schließen' }).click();
  await page.getByLabel('PIN', { exact: true }).fill('0000');
  await page.getByRole('button', { name: 'Öffnen' }).click();
  await expect(page.getByText('Die PIN stimmt nicht.')).toBeVisible();

  // PIN vergessen: mit dem Code eine neue festlegen
  await page.getByRole('button', { name: 'PIN vergessen?' }).click();
  await page.getByLabel(/Wiederherstellungscode/).fill('falsch falsch falsch falsch');
  await page.getByLabel('Neue PIN').fill('2468');
  await page.getByLabel('PIN wiederholen').fill('2468');
  await page.getByRole('button', { name: 'Neue PIN festlegen' }).click();
  await expect(page.getByText('Der Wiederherstellungscode stimmt nicht.')).toBeVisible();
  await page.getByLabel(/Wiederherstellungscode/).fill(code.toUpperCase());
  await page.getByRole('button', { name: 'Neue PIN festlegen' }).click();
  await page.getByRole('button', { name: 'Ich habe den Code aufgeschrieben' }).click();
  await page.getByRole('button', { name: 'Elternbereich schließen' }).click();
  await page.getByLabel('PIN', { exact: true }).fill('2468');
  await page.getByRole('button', { name: 'Öffnen' }).click();
  await expect(page.getByRole('button', { name: 'Details' })).toBeVisible();

  // Transparenz: Jugendliche sehen dasselbe unter „Mein Stand“
  await page.getByRole('button', { name: /Zurück/ }).click();
  await page.getByRole('main').getByRole('button', { name: 'Mein Stand' }).click();
  await page.getByText('Was meine Eltern sehen').click();
  await expect(page.getByText(/Liebe Eltern/)).toBeVisible();
  await expect(page.getByText(/Noch in Arbeit:.*Addieren und Subtrahieren/)).toBeVisible();
});

test('Sicherung: erstellen, auf einem neuen Gerät einspielen, PIN mit Vermerk (D-15)', async ({
  page,
  browser,
  baseURL,
}) => {
  await page.goto('./');
  await themenWaehlen(page);
  await thema(page, /^Addieren und Subtrahieren/);
  await page.getByLabel('Deine Antwort').fill('0');
  await page.getByRole('button', { name: 'Prüfen' }).click();
  await page.getByRole('button', { name: /Zurück/ }).click();
  await expect(page.getByRole('button', { name: /^Addieren und Subtrahieren/ })).toContainText(
    'in Arbeit',
  );
  await page.goto('./');
  await mehr(page);
  await page.getByRole('button', { name: 'Für Eltern' }).click();
  await page.getByLabel('PIN', { exact: true }).fill('4711');
  await page.getByLabel('PIN wiederholen').fill('4711');
  await page.getByRole('button', { name: 'PIN festlegen' }).click();
  await page.getByRole('button', { name: 'Ich habe den Code aufgeschrieben' }).click();
  await expect(page.getByText('Letzte Sicherung: noch keine.')).toBeVisible();
  await page.getByRole('button', { name: /Zurück/ }).click();

  // Sicherung / „Alles sicher“: sechs Wörter, Datei herunterladen
  await mehr(page);
  await page.getByRole('button', { name: 'Sicherung', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Alles sicher' })).toBeVisible();
  await page.getByRole('button', { name: 'Kopie anlegen' }).click();
  const code = (await page.getByTestId('sicherungscode').innerText()).trim();
  expect(code.split(' ')).toHaveLength(6);
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Satz notiert – Datei speichern' }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^bastion-sicherung-\d{4}-\d{2}-\d{2}\.bastion$/);
  const pfad = await download.path();

  // Neues Gerät: leerer Speicher
  const neu = await browser.newContext(baseURL ? { baseURL } : {});
  const seite = await neu.newPage();
  await seite.goto('./');
  await mehr(seite);
  await seite.getByRole('button', { name: 'Sicherung', exact: true }).click();
  await seite.getByLabel(/Sicherungsdatei/).setInputFiles(pfad);
  await seite.getByLabel(/Geheimer Satz/).fill('apfel apfel apfel apfel apfel apfel');
  await seite.getByRole('button', { name: 'Zurückholen' }).click();
  await expect(seite.getByText(/Der Satz passt nicht/)).toBeVisible();
  await seite.getByLabel(/Geheimer Satz/).fill(code.toUpperCase().replaceAll(' ', '-'));
  await seite.getByRole('button', { name: 'Zurückholen' }).click();
  // Aufgabe, ihre beim Neuladen nachgetragene Sitzung, PIN und Wiederherstellungscode
  await expect(seite.getByText(/Fertig\. Übernommen: 4 Einträge/)).toBeVisible();
  // Nochmal einspielen: nichts kommt doppelt (D-10)
  await seite.getByLabel(/Geheimer Satz/).fill(code);
  await seite.getByRole('button', { name: 'Zurückholen' }).click();
  await expect(seite.getByText(/Alles aus dieser Sicherung war schon da/)).toBeVisible();
  await seite.getByRole('button', { name: '← Zurück' }).click();

  await seite.getByRole('main').getByRole('button', { name: 'Mein Stand' }).click();
  await expect(seite.getByRole('heading', { name: 'In Arbeit (1)' })).toBeVisible();

  // Die alte PIN gilt hier nicht – neue PIN, dauerhafter Vermerk
  await seite.getByRole('button', { name: '← Zurück' }).click();
  await mehr(seite);
  await seite.getByRole('button', { name: 'Für Eltern' }).click();
  await expect(seite.getByText(/Die PIN von früher gilt hier nicht/)).toBeVisible();
  await seite.getByLabel('PIN', { exact: true }).fill('1357');
  await seite.getByLabel('PIN wiederholen').fill('1357');
  await seite.getByRole('button', { name: 'PIN festlegen' }).click();
  await seite.getByRole('button', { name: 'Ich habe den Code aufgeschrieben' }).click();
  const vermerk = /wurde die PIN auf diesem Gerät neu festgelegt, nachdem eine Sicherung/;
  await expect(seite.getByText(vermerk)).toBeVisible();
  // Erinnerung einstellbar und abschaltbar (D-O4)
  await expect(seite.getByLabel(/An eine Sicherung erinnern/)).toHaveValue('30');
  await seite.getByLabel(/An eine Sicherung erinnern/).selectOption({ label: 'nie' });
  await expect.poll(() => einstellungImSpeicher(seite, 'sicherung.erinnerung')).toBe(0);
  await seite.reload();
  await mehr(seite);
  await seite.getByRole('button', { name: 'Für Eltern' }).click();
  await seite.getByLabel('PIN', { exact: true }).fill('1357');
  await seite.getByRole('button', { name: 'Öffnen' }).click();
  await expect(seite.getByLabel(/An eine Sicherung erinnern/)).toHaveValue('0');
  await seite.reload();
  await seite.getByRole('main').getByRole('button', { name: 'Mein Stand' }).click();
  await seite.locator('summary', { hasText: 'Was meine Eltern sehen' }).click();
  await expect(seite.getByText(vermerk)).toBeVisible();
  await neu.close();
});

test('Fertig für heute: Abschluss zeigt, was heute geübt wurde', async ({ page }) => {
  await page.goto('./');
  await themenWaehlen(page);
  await thema(page, /^Addieren und Subtrahieren/);
  await expect(page.getByRole('button', { name: 'Fertig für heute' })).toHaveCount(0);
  await page.getByLabel('Deine Antwort').fill('0');
  await page.getByRole('button', { name: 'Prüfen' }).click();
  await page.getByRole('button', { name: 'Fertig für heute' }).click();
  await expect(page.getByRole('heading', { name: 'Was du heute gekonnt hast' })).toBeVisible();
  await expect(
    page.getByRole('listitem').filter({ hasText: /^Addieren und Subtrahieren · / }),
  ).toHaveCount(1);
  await expect(page.getByText('1 Aufgabe bearbeitet')).toBeVisible();
  // Die schnelle falsche Antwort gilt als geraten: keine Ressourcen, ein freundlicher Hinweis
  await expect(page.getByText(/Heute gab es noch nichts zum Bauen/)).toBeVisible();
  await expect(page.getByText(/Nimm dir ruhig etwas mehr Zeit/)).toBeVisible();
  await expect(page.getByText(/Für heute ist das gut/)).toBeVisible();
  await expect(page.getByText(/Schön, dass du heute geübt hast/)).toBeVisible();
  await page.getByRole('button', { name: 'Für heute schließen' }).click();
  await expect(
    page.getByRole('main').getByRole('button', { name: 'Üben', exact: true }),
  ).toBeVisible();
  // Die Sitzung ist regulär beendet und gespeichert (DATENMODELL §4.2). Die
  // schnelle falsche Antwort gilt als geraten und zählt nicht als ernsthaft.
  expect(await sitzungenImSpeicher(page)).toEqual([
    { abschluss: 'regulaer', aufgaben: 0, lerneinheit: false },
  ]);
});

test('Fertig für heute: Ressourcen unter dem Können, mit „woher“ (BASEBAU §6.1)', async ({
  page,
}) => {
  await page.goto('./');
  await themenWaehlen(page);
  await thema(page, /^Addieren und Subtrahieren/);
  // in Ruhe nachdenken: mehr als 5 Sekunden, dann zählt auch eine falsche Antwort
  await page.waitForTimeout(5_200);
  await page.getByLabel('Deine Antwort').fill('0');
  await page.getByRole('button', { name: 'Prüfen' }).click();
  await page.getByRole('button', { name: 'Fertig für heute' }).click();
  const gekonnt = page.getByRole('heading', { name: 'Was du heute gekonnt hast' });
  const ertrag = page.getByRole('heading', { name: 'Dafür hast du erarbeitet' });
  await expect(ertrag).toBeVisible();
  await expect(page.getByText('1 Stein – aus 1 bearbeiteten Aufgabe')).toBeVisible();
  // Erst das Können, dann die Ressourcen (§9 Punkt 2)
  const oben = async (l: typeof gekonnt) => (await l.boundingBox())?.y ?? 0;
  expect(await oben(gekonnt)).toBeLessThan(await oben(ertrag));
});

test('Basebau-Schalter: aus blendet Ressourcen aus, an zeigt alles Erarbeitete (R7)', async ({
  page,
}) => {
  const antworten = async (ruhig: boolean) => {
    await themenWaehlen(page);
    await thema(page, /^Addieren und Subtrahieren/);
    if (ruhig) await page.waitForTimeout(5_200);
    await page.getByLabel('Deine Antwort').fill('0');
    await page.getByRole('button', { name: 'Prüfen' }).click();
    await page.getByRole('button', { name: 'Fertig für heute' }).click();
  };
  await page.goto('./');
  await hubVoll(page);
  await page.getByRole('main').getByRole('button', { name: 'Mein Stand' }).click();
  const schalter = page.getByRole('checkbox', { name: 'Bastion anzeigen' });
  await expect(schalter).toBeChecked();
  await schalter.uncheck();
  // Speichern läuft im Hintergrund – erst neu laden, wenn es angekommen ist
  await expect.poll(() => einstellungImSpeicher(page, 'basebau.aktiv')).toBe(false);
  await page.reload();
  await hubVoll(page);
  await page.getByRole('main').getByRole('button', { name: 'Mein Stand' }).click();
  await expect(schalter).not.toBeChecked();
  await page.getByRole('button', { name: /Zurück/ }).click();

  // Ausgeschaltet: lernen wie immer, aber keine Ressourcen im Abschluss
  await antworten(true);
  await expect(page.getByRole('heading', { name: 'Was du heute gekonnt hast' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Dafür hast du erarbeitet' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Für heute schließen' }).click();

  // Wieder an: Der Stein von eben ist da (B-10)
  await page.getByRole('main').getByRole('button', { name: 'Mein Stand' }).click();
  await schalter.check();
  await page.getByRole('button', { name: /Zurück/ }).click();
  await antworten(false);
  await expect(page.getByText('1 Stein – aus 1 bearbeiteten Aufgabe')).toBeVisible();
});

/** Erarbeitete Ressourcen direkt in die Ablage schreiben (Buchungen und passendes Konto). */
async function vorratAnlegen(page: Page, stand: Record<string, number>, gefestigt?: string) {
  await page.evaluate(
    ({ stand, gefestigt }) =>
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
                id: `${profil}.${ressource}.TEST`,
                art: 'buchung',
                v: 1,
                profil,
                ts: Date.now() - 60_000,
                tag: '2026-01-01',
                geraet: 'test0001',
                ressource,
                menge,
                grund: 'sitzung',
                bezug: 'TEST',
                aufschluesselung: {},
                regel: 1,
              });
            // Ein gefestigtes Thema: Bauplan-Buchung wie in der App (B-6)
            if (gefestigt)
              tx.objectStore('buchungen').put({
                id: `${profil}.koennen.${gefestigt}`,
                art: 'buchung',
                v: 1,
                profil,
                ts: Date.now() - 60_000,
                tag: '2026-11-04',
                geraet: 'test0001',
                ressource: 'koennen',
                menge: 1,
                grund: 'kompetenz-gefestigt',
                bezug: gefestigt,
                aufschluesselung: {},
                regel: 1,
              });
            tx.objectStore('konto').put({ profil, stand, erworben: stand });
            // Projektion `bastion` neu berechnen lassen (beim nächsten Start)
            tx.objectStore('bastion').delete(profil);
          };
          tx.oncomplete = () => {
            db.close();
            fertig();
          };
          tx.onerror = () => fehler(tx.error);
        };
      }),
    { stand, gefestigt },
  );
}

test('Bastion als Liste: bauen, Fortschritt, abbrechen, versetzen (BASEBAU §4.2)', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.goto('./');
  await hubVoll(page);
  await expect(page.getByRole('main').getByRole('button', { name: 'Bastion' })).toBeVisible();
  await vorratAnlegen(page, { fleiss: 200, behalten: 50, koennen: 2, schritt: 3 });
  await page.reload();
  await bastionOeffnen(page);
  await expect(page.getByRole('listitem').filter({ hasText: /^200 Stein$/ })).toBeVisible();
  await expect(
    page.getByRole('listitem').filter({ hasText: /^3 Bauschritte im Vorrat$/ }),
  ).toBeVisible();
  // Ziel der aktuellen Epoche (§5.4 / G9): erworbene Baupläne zählen
  await expect(page.getByRole('heading', { name: 'Ziel der Epoche 1: Außenposten' })).toBeVisible();
  await expect(page.getByText(/2\s+von\s+15\s+Baupläne erworben/)).toBeVisible();

  // Banner: kostet einen Bauschritt aus dem Vorrat und steht sofort (B-14)
  await page
    .getByRole('listitem')
    .filter({ hasText: /^Banner/ })
    .getByRole('button', { name: 'Bauen' })
    .click();
  await expect(page.getByRole('listitem').filter({ hasText: /^190 Stein$/ })).toBeVisible();
  await expect(page.getByText(/^Banner – fertig am/)).toBeVisible();

  // Späherturm: nimmt die übrigen zwei Bauschritte, braucht sechs
  await page
    .getByRole('listitem')
    .filter({ hasText: /^Späherturm/ })
    .getByRole('button', { name: 'Bauen' })
    .click();
  await expect(page.getByRole('heading', { name: 'Im Bau' })).toBeVisible();
  await expect(page.getByText(/Bauschritte:\s+2\s+von\s+6/)).toBeVisible();
  // Nur ein Vorhaben gleichzeitig: Tor geht gerade nicht
  await expect(
    page.getByRole('listitem').filter({ hasText: /^Tor/ }).getByRole('button', { name: 'Bauen' }),
  ).toBeDisabled();

  // Abbrechen gibt alles zurück
  await page.getByRole('button', { name: 'Abbrechen' }).click();
  await expect(page.getByRole('heading', { name: 'Im Bau' })).toHaveCount(0);
  await expect(page.getByRole('listitem').filter({ hasText: /^190 Stein$/ })).toBeVisible();
  await expect(
    page.getByRole('listitem').filter({ hasText: /^2 Bauschritte im Vorrat$/ }),
  ).toBeVisible();

  // Versetzen kostet nichts
  const feuer = page.getByRole('listitem').filter({ hasText: /^Feuerstelle/ });
  await feuer.getByRole('button', { name: 'Versetzen' }).click();
  await feuer.getByLabel('Spalte').selectOption({ label: '12' });
  await feuer.getByLabel('Reihe').selectOption({ label: '12' });
  await feuer.getByRole('button', { name: 'Hierhin' }).click();
  await expect(feuer).toContainText('Spalte 12, Reihe 12');

  // Gestalten (2.14): Farbe des Banners wählen – kostenlos, bleibt gespeichert
  const bannerZeile = page.getByRole('listitem').filter({ hasText: /^Banner\s+Feld/ });
  await bannerZeile.getByRole('radio', { name: 'Blau' }).check();
  await expect(bannerZeile.getByRole('radio', { name: 'Blau' })).toBeChecked();
  await expect(page.getByRole('listitem').filter({ hasText: /^190 Stein$/ })).toBeVisible();

  // Zierde einlagern und wieder aufstellen (B-21)
  const banner = page.getByRole('listitem').filter({ hasText: /^Banner\s+Feld/ });
  await banner.getByRole('button', { name: 'Einlagern' }).click();
  await expect(page.getByRole('heading', { name: 'Im Lager' })).toBeVisible();
  await page
    .getByRole('listitem')
    .filter({ hasText: /^Banner\s+Aufstellen/ })
    .getByRole('button', { name: 'Aufstellen' })
    .click();
  await expect(page.getByRole('heading', { name: 'Im Lager' })).toHaveCount(0);
  await expect(banner).toContainText('Spalte 1, Reihe 1');
  await expect(page.getByRole('listitem').filter({ hasText: /^190 Stein$/ })).toBeVisible();

  // Bleibt nach dem Neuladen, wie es ist
  // (auch die Farbe des Banners)
  await page.reload();
  await bastionOeffnen(page);
  await expect(page.getByText(/^Banner – fertig am/)).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: /^Feuerstelle/ })).toContainText(
    'Spalte 12, Reihe 12',
  );
  await expect(
    page
      .getByRole('listitem')
      .filter({ hasText: /^Banner\s+Feld/ })
      .getByRole('radio', { name: 'Blau' }),
  ).toBeChecked();

  // Ziel vormerken (B-20): zeigt, was noch fehlt – auch nach dem Neuladen
  await page
    .getByRole('listitem')
    .filter({ hasText: /^Bergfried\s+auf Stufe 2/ })
    .getByRole('button', { name: 'Vormerken' })
    .click();
  const ziel = page.getByRole('region', { name: /Dein Ziel: Bergfried, Stufe 2/ });
  await expect(ziel).toContainText('Dafür fehlt noch: 60 Stein, 30 Erz');
  await expect.poll(() => einstellungImSpeicher(page, 'basebau.ziel')).toContain('"kern"');
  await page.reload();
  await bastionOeffnen(page);
  await expect(ziel).toBeVisible();
  await ziel.getByRole('button', { name: 'Nicht mehr vormerken' }).click();
  await expect(ziel).toHaveCount(0);

  // Ausgeschaltet: kein Bastion-Knopf auf der Startseite (R7)
  // Frisch laden: nach langer Bastion-Sitzung ist die Start-Kachel sonst hinter der Leiste
  await page.goto('./');
  await hubVoll(page);
  await page.getByRole('main').getByRole('button', { name: 'Mein Stand' }).click();
  await page.getByRole('checkbox', { name: 'Bastion anzeigen' }).uncheck();
  await expect.poll(() => einstellungImSpeicher(page, 'basebau.aktiv')).toBe(false);
  await page.getByRole('button', { name: /Zurück/ }).click();
  await page.reload();
  await hubVoll(page);
  await expect(page.getByRole('main').getByRole('button', { name: /Üben/ }).first()).toBeVisible();
  await expect(page.getByRole('main').getByRole('button', { name: 'Bastion' })).toHaveCount(0);
});

test('Studierstube: ein Buch je gefestigtem Thema, kostenlos (B-6)', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('./');
  await bastionOeffnen(page);
  await expect(page.getByText(/Noch ist hier nichts/)).toBeVisible();
  await bastionZurStartseite(page);
  await vorratAnlegen(page, { fleiss: 0, behalten: 0, koennen: 1, schritt: 0 }, 'M.ZO.NZ.RUNDEN@G');
  await page.reload();
  await bastionOeffnen(page);
  await expect(
    page
      .getByRole('listitem')
      .filter({ hasText: /Ich kann Zahlen runden[\s\S]*grundlegend,\s+seit\s+4\.\s+November/ }),
  ).toBeVisible();
  await expect(page.getByText(/Mit dem Gebäude „Studierstube“/)).toBeVisible();
});

test('Thema wechseln: gleiche Bastion, andere Wörter (B-17)', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('./');
  await vorratAnlegen(page, { fleiss: 200, behalten: 50, koennen: 2, schritt: 3 });
  await page.reload();
  await bastionOeffnen(page);
  await page.getByRole('radio', { name: 'Garten' }).check();
  await expect(page.getByRole('heading', { name: 'Dein Garten' })).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: /^200 Samen$/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ziel der Epoche 1: Wildgarten' })).toBeVisible();
  await expect(page.getByText(/^Baumhaus\s+Stufe 1/)).toBeVisible();
  await page
    .getByRole('listitem')
    .filter({ hasText: /^Wimpel/ })
    .getByRole('button', { name: 'Bauen' })
    .click();
  await expect(page.getByText(/^Wimpel – fertig am/)).toBeVisible();

  // Nach dem Neuladen bleibt das Thema; der Start-Hub-Knopf heißt wie das Thema
  await expect.poll(() => einstellungImSpeicher(page, 'basebau.thema')).toBe('garten');
  await page.reload();
  await hubVoll(page);
  // Hub-Tür heißt immer „Bastion“ (Ortsname); die Vorschau zeigt den Themennamen
  await page.getByRole('main').getByRole('button', { name: 'Bastion' }).click();
  await expect(page.getByRole('button', { name: 'Bastion-Einstellungen' })).toBeVisible({
    timeout: 30_000,
  });
  await page.getByRole('button', { name: 'Bastion-Einstellungen' }).click();
  await expect(page.getByRole('heading', { name: 'Bastion-Einstellungen' })).toBeVisible();
  await page.getByRole('radio', { name: 'Unterwasserstadt' }).check();
  await expect(page.getByRole('heading', { name: 'Deine Unterwasserstadt' })).toBeVisible();
  // Was gebaut ist, bleibt – es heißt nur anders
  await expect(page.getByText(/^Boje – fertig am/)).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: /^190 Sand$/ })).toBeVisible();
});

test('Sitzung ohne „Fertig für heute“ wird beim nächsten Start nachgetragen (D-3)', async ({
  page,
}) => {
  await page.goto('./');
  await themenWaehlen(page);
  await thema(page, /^Addieren und Subtrahieren/);
  await page.getByLabel('Deine Antwort').fill('0');
  await page.getByRole('button', { name: 'Prüfen' }).click();
  await expect(page.getByRole('button', { name: 'Fertig für heute' })).toBeVisible();
  // Erst neu laden, wenn die Antwort gespeichert ist: Nachgetragen wird aus den Aufgaben
  await expect.poll(() => aufgabenImSpeicher(page)).toBe(1);
  expect(await sitzungenImSpeicher(page)).toEqual([]);
  await page.reload();
  await expect(
    page.getByRole('main').getByRole('button', { name: 'Üben', exact: true }),
  ).toBeVisible();
  await expect
    .poll(() => sitzungenImSpeicher(page))
    .toEqual([{ abschluss: 'nachgetragen', aufgaben: 0, lerneinheit: false }]);
});

test('Fachbegriffe: antippen zeigt die Erklärung (L-7)', async ({ page }) => {
  await page.goto('./');
  await themenWaehlen(page);
  await thema(page, /^Teilbarkeitsregeln/);
  const begriff = page.getByRole('button', { name: 'teilbar', exact: true });
  await expect(begriff).toHaveAttribute('aria-expanded', 'false');
  await begriff.click();
  await expect(begriff).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('note')).toContainText('weil beim Teilen kein Rest bleibt');
  await begriff.click();
  await expect(page.getByRole('note')).toHaveCount(0);
});

test('Zeichen-Anleitung: Schritt für Schritt, Prüfliste ohne Bewertung (L-10)', async ({
  page,
}) => {
  await page.goto('./');
  await themenWaehlen(page);
  // Seit L18 ist der Bereich eingeklappt: erst aufklappen
  await bereichOeffnen(page, 'Raum und Form');
  await page
    .getByRole('button', { name: /^Winkel\b/ })
    .first()
    .click();
  await angebotUeberspringen(page);
  await page.getByRole('button', { name: 'Einen Winkel von 50° zeichnen' }).click();
  await expect(page.getByText('Schritt 1 von 5')).toBeVisible();
  await expect(page.getByRole('img', { name: /Schenkel nach rechts/ })).toBeVisible();
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Weiter' }).click();
  await expect(page.getByText('Schritt 5 von 5')).toBeVisible();
  await page.getByRole('button', { name: 'Schritt zurück' }).click();
  await expect(page.getByText('Schritt 4 von 5')).toBeVisible();
  await page.getByRole('button', { name: 'Weiter' }).click();
  await page.getByRole('button', { name: 'Fertig gezeichnet' }).click();
  await expect(page.getByRole('heading', { name: 'Prüfe deine Zeichnung' })).toBeVisible();
  await expect(page.getByText(/nicht gespeichert und nicht bewertet/)).toBeVisible();
  await page.getByRole('button', { name: 'Zurück zum Üben' }).click();
  await expect(page.getByRole('button', { name: 'Prüfen' })).toBeVisible();
});

test('Klasse 6 wählen und Brüche addieren üben', async ({ page }) => {
  await page.goto('./');
  await themenWaehlen(page);
  await page.getByRole('radio', { name: 'Klasse 6' }).check();
  await expect(page.getByRole('heading', { name: 'Klasse 6' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Addieren und Subtrahieren/ })).toHaveCount(0);
  await page.getByRole('button', { name: /^Brüche addieren und subtrahieren/ }).click();
  // Neu und mit Erstvermittlung: erst das Angebot, überspringbar (U3d)
  await expect(page.getByText('Das ist neu für dich.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Ich kann das schon' }).click();
  await expect(page.getByText(/Berechne/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Prüfen' })).toBeVisible();
});

test('Mein Stand und Diagnose für Klasse 6', async ({ page }) => {
  await page.goto('./');
  await hubVoll(page);
  await page.getByRole('main').getByRole('button', { name: 'Mein Stand' }).click();
  await expect(page.getByText(/^41\s+Themen insgesamt/)).toBeVisible();
  await page.getByRole('radio', { name: 'Klasse 6' }).check();
  await expect(page.getByText(/^28\s+Themen insgesamt/)).toBeVisible();
  await page.getByRole('button', { name: /Zurück/ }).click();

  // Die Diagnose übernimmt die gewählte Klasse
  await hubVoll(page);
  await page.getByRole('main').getByRole('button', { name: 'Wo stehe ich?' }).click();
  await expect(page.getByRole('radio', { name: 'Klasse 6' })).toBeChecked();
  await page.getByRole('button', { name: "Los geht's" }).click();
  await expect(page.getByRole('button', { name: 'Weiß ich nicht' })).toBeVisible();
});

test('Bauplatz als Bild: antippen, versetzen, zoomen, Bild ausblenden (BASEBAU 2.13)', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.goto('./');
  await bastionOeffnen(page, false);
  const bild = page.locator('.bauplatz canvas');
  // Warten bis Atlas-Tausch fertig ist (kurzzeitig 2 Canvas möglich)
  await expect.poll(() => bild.count(), { timeout: 30_000 }).toBe(1);
  /** Feld antippen (Spalte x, Reihe y ab 0) – relativ zum aktuellen Canvas */
  const tippe = (x: number, y: number) => feldTippen(page, x, y);
  // Die Feuerstelle steht am Start auf Spalte 7, Reihe 9 (Feld 6/8)
  const wahl = page.locator('.wahl');
  await gebaeudeWaehlen(page, 6, 8, 'Feuerstelle');
  await wahl.getByRole('button', { name: 'Ziehen zum Versetzen' }).click();
  await expect(wahl).toContainText('Ziehe das Gebäude an die neue Stelle');
  // Auf den Bergfried geht es nicht …
  await tippe(6, 5);
  await expect(wahl).toContainText('Dort ist kein Platz frei');
  // … auf ein freies Feld schon
  await tippe(0, 11);
  await page.getByRole('button', { name: 'Bastion-Einstellungen' }).click();
  await expect(page.getByRole('listitem').filter({ hasText: /^Feuerstelle/ })).toContainText(
    'Spalte 1, Reihe 12',
  );
  await page.getByRole('button', { name: '← Zur Bastion' }).click();

  // Zoom per Mausrad auf den Zeiger (Knöpfe −/+ sind vom Reiter weg)
  const breite = async () => (await bild.boundingBox())?.width ?? 0;
  const vorher = await breite();
  const fenster = page.locator('.fenster');
  const box = await fenster.boundingBox();
  if (!box) throw new Error('kein Fenster');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, -120);
  await expect.poll(breite).toBeGreaterThan(vorher * 1.05);
  const kameraZoom = async () => {
    const w = await einstellungImSpeicher(page, 'basebau.kamera');
    if (typeof w !== 'string' || w === '') return undefined;
    const z = Number(w.split(',')[0]);
    return Number.isFinite(z) ? z : undefined;
  };
  await expect.poll(kameraZoom).toBeGreaterThan(0.35);
  const groesser = await kameraZoom();
  await gebaeudeWaehlen(page, 0, 11, 'Feuerstelle');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, 120);
  await expect.poll(kameraZoom).toBeLessThan(groesser as number);
  // „Ganzes Bild“ in den Bastion-Einstellungen setzt die Kamera zurück
  await page.getByRole('button', { name: 'Bastion-Einstellungen' }).click();
  await page.getByRole('button', { name: 'Ganzes Bild' }).click();
  await expect.poll(() => einstellungImSpeicher(page, 'basebau.kamera')).toBe('');
  await page.getByRole('button', { name: '← Zur Bastion' }).click();
  await gebaeudeWaehlen(page, 0, 11, 'Feuerstelle');

  // Bild ausblenden: nur noch in den Einstellungen – auch nach dem Neuladen
  await page.getByRole('button', { name: 'Bastion-Einstellungen' }).click();
  await page.getByRole('checkbox', { name: /Bild ausblenden/ }).click();
  await expect(bild).toHaveCount(0);
  await expect.poll(() => einstellungImSpeicher(page, 'basebau.bild')).toBe(false);
  await expect(page.getByRole('heading', { name: 'Bastion-Einstellungen' })).toBeVisible();
  await page.reload();
  // Ohne Bild öffnen die Einstellungen (Liste)
  await bastionOeffnen(page, true);
  await expect(page.getByRole('checkbox', { name: /Bild zeigen/ })).toBeVisible();
  await expect(bild).toHaveCount(0);
});

test('Ausbauen beim Antippen: zwei Tipper, sonst steht da, was fehlt (FOKUS G5)', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.goto('./');
  await hubVoll(page);
  await expect(page.getByRole('main').getByRole('button', { name: 'Bastion' })).toBeVisible();
  await vorratAnlegen(page, { fleiss: 120, behalten: 20, koennen: 2, schritt: 1 });
  await page.reload();
  await bastionOeffnen(page, false);
  const bild = page.locator('.bauplatz canvas');
  await expect.poll(() => bild.count(), { timeout: 30_000 }).toBe(1);
  const wahl = page.locator('.wahl');
  // Zu wenig: Der Knopf ist nicht grau, er erklärt, was fehlt und woher es kommt
  await gebaeudeWaehlen(page, 6, 5, 'Bergfried');
  await wahl.getByRole('button', { name: /Ausbauen – was fehlt\?/ }).click();
  const blatt = page.getByRole('dialog');
  await expect(blatt.getByRole('heading', { name: 'Ausbauen', level: 3 })).toBeVisible();
  await expect(blatt).toContainText('Noch 130 Stein.');
  await expect(blatt).toContainText('Jede geübte Aufgabe bringt Stein.');
  await expect(blatt).toContainText('Noch 60 Erz.');
  await expect(blatt.getByRole('button', { name: 'Ausbauen' })).toHaveCount(0);
  await blatt.getByRole('button', { name: 'Schließen' }).click();

  // Genug da: Gebäude antippen, „Ausbauen“ – fertig
  await vorratAnlegen(page, { fleiss: 2000, behalten: 500, koennen: 6, schritt: 20 });
  await page.reload();
  await bastionOeffnen(page, false);
  await expect.poll(() => bild.count(), { timeout: 30_000 }).toBe(1);
  await gebaeudeWaehlen(page, 6, 5, 'Bergfried');
  await wahl.getByRole('button', { name: /^Ausbauen auf Stufe 2$/ }).click();
  await expect(wahl).toContainText('Stufe 2');
  await expect(wahl.getByRole('button', { name: /^Ausbauen auf Stufe 3$/ })).toBeVisible();
});

test('Neubau: die App schlägt einen freien Platz vor, „Hier bauen“ (FOKUS G5)', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.goto('./');
  await hubVoll(page);
  await expect(page.getByRole('main').getByRole('button', { name: 'Bastion' })).toBeVisible();
  await vorratAnlegen(page, { fleiss: 500, behalten: 100, koennen: 4, schritt: 20 });
  await page.reload();
  await bastionOeffnen(page, false);
  const bild = page.locator('.bauplatz canvas');
  await expect.poll(() => bild.count(), { timeout: 30_000 }).toBe(1);
  // Tipp 1 und 2: „Bauen“ → Studierstube; das Blatt geht zu, der Platz ist markiert
  await page.getByRole('main').getByRole('button', { name: 'Bauen', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Studierstube', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const leiste = page.getByRole('region', { name: 'Hier bauen' });
  await expect(leiste).toContainText('Studierstube');
  // Vorschlag neben dem Bergfried (Feld 5/4, 3×3), nicht mehr oben links
  await expect(leiste).toContainText('Spalte 4, Reihe 6');
  await expect(leiste).toContainText('Steht sofort.');
  // „Anderes Gebäude“ führt zurück ins Blatt, ohne zu bauen
  await leiste.getByRole('button', { name: 'Anderes Gebäude' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Studierstube', exact: true }).click();
  // Tipp 3: „Hier bauen“ – das Gebäude steht auf dem vorgeschlagenen Feld
  await leiste.getByRole('button', { name: 'Hier bauen' }).click();
  await expect(leiste).toHaveCount(0);
  // Gebaut: Als Neubau gibt es keine zweite Studierstube mehr, nur ihren Ausbau
  await page.getByRole('main').getByRole('button', { name: 'Bauen', exact: true }).click();
  const blatt = page.getByRole('dialog');
  await expect(blatt.getByRole('button', { name: 'Studierstube', exact: true })).toHaveCount(0);
  await expect(blatt.getByRole('button', { name: 'Studierstube Stufe 2' })).toBeVisible();
});

test('Eigene Tastatur: Minus nur bei negativen Zahlen, Bruchstrich bei Brüchen (INHALTSFORMAT §5.2)', async ({
  page,
}) => {
  await page.goto('./');
  await themenWaehlen(page);
  await page.getByRole('radio', { name: 'Klasse 7' }).check();
  await expect(page.getByRole('heading', { name: 'Klasse 7' })).toBeVisible();
  await thema(page, /^Negative Zahlen/);
  const tastatur = page.getByRole('group', { name: 'Tastatur' });
  const feld = page.getByRole('textbox', { name: 'Deine Antwort' });
  await expect(feld).toHaveAttribute('inputmode', 'none');
  await tastatur.getByRole('button', { name: 'Minus' }).click();
  await tastatur.getByRole('button', { name: '1', exact: true }).click();
  await tastatur.getByRole('button', { name: '2', exact: true }).click();
  await tastatur.getByRole('button', { name: '5', exact: true }).click();
  await expect(feld).toHaveValue('−125');
  await tastatur.getByRole('button', { name: 'Löschen' }).click();
  await expect(feld).toHaveValue('−12');
  // Mit der echten Tastatur geht es weiter wie bisher
  await feld.fill('7');
  await expect(feld).toHaveValue('7');
  await expect(tastatur.getByRole('button', { name: 'Bruchstrich' })).toHaveCount(0);

  // Brüche in Klasse 6: eigene Felder für Zähler und Nenner, darum kein „/“ und kein Minus (L13)
  await page.getByRole('button', { name: '← Zurück' }).click();
  await page.getByRole('radio', { name: 'Klasse 6' }).check();
  await page.getByRole('button', { name: /^Brüche addieren und subtrahieren/ }).click();
  await page.getByRole('button', { name: 'Ich kann das schon' }).click();
  const aufgabe = page.locator('form#antwort');
  const tasten = aufgabe.getByRole('group', { name: 'Tastatur' });
  await expect(tasten.getByRole('button', { name: 'Minus' })).toHaveCount(0);
  await aufgabe.getByLabel('Zähler').click();
  await tasten.getByRole('button', { name: '3', exact: true }).click();
  await expect(tasten.getByRole('button', { name: 'Bruchstrich' })).toHaveCount(0);
  await aufgabe.getByLabel('Nenner').click();
  await tasten.getByRole('button', { name: '4', exact: true }).click();
  await expect(aufgabe.getByLabel('Zähler')).toHaveValue('3');
  await expect(aufgabe.getByLabel('Nenner')).toHaveValue('4');
});

test('Hinterhof: Lernfelder mit offenen Plätzen, privat (B-25)', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('./');
  await bastionOeffnen(page);
  await expect(
    page.getByRole('heading', { name: 'Dein Hinterhof: was du sicher kannst' }),
  ).toBeVisible({ timeout: 30_000 });
  const feld = page.locator('.hinterhof summary').filter({ hasText: 'Natürliche Zahlen' });
  await expect(feld).toContainText(/0\/\d+/);
  await feld.click();
  await expect(
    page
      .locator('.hinterhof li')
      .filter({ hasText: /noch offen/ })
      .first(),
  ).toBeVisible();
  await expect(page.getByText(/Das gehört nur dir/)).toBeVisible();
});

test('Bastion-Sound: Standard aus, Stufen speichern (G8 / W113)', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('./');
  // Sound-Stufen in den Bastion-Einstellungen (Design W113)
  await bastionOeffnen(page, true);
  const aus = page.getByRole('radio', { name: 'Aus', exact: true });
  const bastionUi = page.getByRole('radio', { name: 'Bastion und UI' });
  await expect(aus).toBeVisible();
  await expect(aus).toBeChecked();
  await bastionUi.check();
  await expect.poll(() => einstellungImSpeicher(page, 'basebau.sound')).toBe('bastion');
  await page.reload();
  await bastionOeffnen(page, true);
  await expect(page.getByRole('radio', { name: 'Bastion und UI' })).toBeChecked();
});

test('Bewährungsprobe: startet als Probe ohne Note (G11 / BASEBAU §5.6)', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('./');
  await bastionOeffnen(page);
  await expect(page.getByRole('heading', { name: 'Belagerung' })).toBeVisible();
  await expect(page.getByRole('radio', { name: /Üben \(mit Joker/ })).toBeChecked();
  await page.getByRole('button', { name: 'Bewährungsprobe starten' }).click();
  await expect(page.getByRole('heading', { name: 'Probe-Klassenarbeit' })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByText(/ohne Hilfen und ohne Note|ohne Hilfen/)).toBeVisible();
});

test('Bewährungsprobe Ernstfall: kein Joker in der Probe (G11)', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('./');
  await bastionOeffnen(page);
  await page.getByRole('radio', { name: /Ernstfall/ }).check();
  await page.getByRole('button', { name: 'Bewährungsprobe starten' }).click();
  await expect(page.getByRole('heading', { name: 'Probe-Klassenarbeit' })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByText(/Hinweis-Joker/)).toHaveCount(0);
  await page.getByRole('button', { name: "Los geht's" }).click();
  await expect(page.getByRole('button', { name: 'Weiß ich nicht' })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByRole('button', { name: 'Joker nutzen (zählt als richtig)' })).toHaveCount(
    0,
  );
});

test('Wechsel begleiten: übersprungene Klassen und Schulartwechsel (L-12)', async ({ page }) => {
  await page.goto('./');
  await themenWaehlen(page);
  await page.getByRole('radio', { name: 'Klasse 8' }).check();
  await expect(page.getByRole('heading', { name: 'Neue Klasse – willkommen.' })).toBeVisible();
  await expect(page.getByText(/Aus Klasse 5: \d+ Themen offen/)).toBeVisible();
  await expect(page.getByText(/Aus Klasse 7: \d+ Themen offen/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Lücken gezielt prüfen' })).toBeVisible();
  // Zurückstellen ist neutral: kein Hinweis
  await page.getByRole('radio', { name: 'Klasse 7' }).check();
  await expect(page.getByRole('heading', { name: 'Neue Klasse – willkommen.' })).toHaveCount(0);
  // Die Wahl bleibt nach dem Neuladen (erst neu laden, wenn gespeichert)
  await expect.poll(() => einstellungImSpeicher(page, 'lernen.klasse')).toBe(7);
  await page.reload();
  await themenWaehlen(page);
  await expect(page.getByRole('radio', { name: 'Klasse 7' })).toBeChecked();
  // Schulartwechsel zeigt Themen, die die neue Schulart früher hat
  await page.getByRole('radio', { name: 'Klasse 5' }).check();
  await page.getByRole('radio', { name: 'Oberschule' }).check();
  await expect(page.getByRole('heading', { name: 'Neue Schulart' })).toHaveCount(0);
  await page.getByRole('radio', { name: 'Gymnasium' }).check();
  await expect(page.getByRole('heading', { name: 'Neue Schulart' })).toBeVisible();
  await page.getByRole('button', { name: 'Kurz prüfen', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Wo stehe ich?' })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Klasse 5' })).toHaveCount(0);
});

test('Übersprungene Klasse: gezielte Diagnose der Lücken daraus (L-12)', async ({ page }) => {
  await page.goto('./');
  await themenWaehlen(page);
  await page.getByRole('radio', { name: 'Klasse 6' }).check();
  await expect.poll(() => einstellungImSpeicher(page, 'lernen.klasse')).toBe(6);
  await page.reload();
  await themenWaehlen(page);
  // Klasse 7 übersprungen: nur ihre Themen werden geprüft
  await page.getByRole('radio', { name: 'Klasse 8' }).check();
  await expect(page.getByText(/Aus Klasse 7: \d+ Themen offen/)).toBeVisible();
  await expect(page.getByText(/Aus Klasse 6:/)).toHaveCount(0);
  await page.getByRole('button', { name: 'Lücken gezielt prüfen' }).click();
  await expect(page.getByRole('heading', { name: 'Wo stehe ich?' })).toBeVisible();
  await page.getByRole('button', { name: "Los geht's" }).click();
  for (let i = 0; i < 40; i++) {
    if (await page.getByText('Hier stehst du – hier geht es weiter').isVisible()) break;
    if (await page.getByText(/^Halbzeit\./).isVisible()) {
      await page.getByRole('button', { name: 'Weiter', exact: true }).click();
      continue;
    }
    await page.getByRole('button', { name: 'Weiß ich nicht' }).click();
  }
  await expect(page.getByText('Diese Lücken lohnt es sich zu schließen:')).toBeVisible();
});

test('Bericht für die Lehrkraft: je Lernfeld, als Datei (L-13)', async ({ page }) => {
  await page.goto('./');
  await themenWaehlen(page);
  await thema(page, /^Addieren und Subtrahieren/);
  await page.getByLabel('Deine Antwort').fill('0');
  await page.getByRole('button', { name: 'Prüfen' }).click();
  await page.getByRole('button', { name: 'Fertig für heute' }).click();
  await page.getByRole('button', { name: 'Für heute schließen' }).click();
  await page.getByRole('main').getByRole('button', { name: 'Mein Stand' }).click();
  await page.getByText('Was meine Eltern sehen').click();
  await page.getByRole('button', { name: 'Für die Lehrkraft' }).click();
  await expect(
    page.getByRole('heading', { name: 'Bericht für die Lehrkraft – Klasse 5' }),
  ).toBeVisible();
  await expect(page.locator('.lk li').filter({ hasText: 'Natürliche Zahlen' })).toContainText(
    /0\s+von\s+10\s+Themen gekonnt/,
  );
  await page.getByRole('button', { name: 'Als Textdatei vorbereiten' }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Datei speichern' }).click();
  expect((await download).suggestedFilename()).toBe('bastion-bericht-klasse-5.txt');
});

test('Profil: freiwillig, ab 18 ohne Elternbereich (L-15)', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Über mich' })).toBeVisible();
  await page.getByRole('button', { name: 'Lieber später' }).click();
  await expect(page.getByRole('heading', { name: 'Über mich' })).toHaveCount(0);
  await mehr(page);
  await expect(page.getByRole('button', { name: 'Für Eltern' })).toBeVisible();
  await expect.poll(() => einstellungImSpeicher(page, 'profil.gefragt')).toBe(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Über mich' })).toHaveCount(0);
  // Später doch angeben: erwachsen
  await mehr(page);
  await page.getByRole('button', { name: 'Über mich' }).click();
  await page.getByLabel(/Wann hast du Geburtstag/).fill('1985-04-12');
  await page.getByRole('button', { name: 'So speichern' }).click();
  await mehr(page);
  await expect(page.getByRole('button', { name: 'Für Eltern' })).toHaveCount(0);
  await expect.poll(() => einstellungImSpeicher(page, 'profil.geburtsdatum')).toBe('1985-04-12');
  await page.reload();
  await mehr(page);
  await expect(page.getByRole('button', { name: 'Für Eltern' })).toHaveCount(0);
  await page.getByRole('main').getByRole('button', { name: 'Mein Stand' }).click();
  await expect(page.getByText('Mein Bericht (auch zum Zeigen für Lehrkräfte)')).toBeVisible();
});

test('Schuljahreswechsel: einmal nach der Klasse fragen (L-17)', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-07-20T10:00:00') });
  await page.goto('./');
  await themenWaehlen(page);
  await page.getByRole('radio', { name: 'Klasse 6' }).check();
  await expect(page.getByRole('radio', { name: 'Klasse 6' })).toBeChecked();
  await expect.poll(() => einstellungImSpeicher(page, 'lernen.schuljahr')).toBe(2025);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Neues Schuljahr' })).toHaveCount(0);
  await page.clock.setSystemTime(new Date('2026-08-03T10:00:00'));
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Neues Schuljahr' })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Klasse 7' })).toBeChecked();
  // Sitzenbleiben: dieselbe Klasse, ohne Kommentar
  await page.getByRole('radio', { name: 'Klasse 6' }).check();
  await page.getByRole('button', { name: 'Passt so' }).click();
  await expect(page.getByRole('heading', { name: 'Neues Schuljahr' })).toHaveCount(0);
  await expect.poll(() => einstellungImSpeicher(page, 'lernen.schuljahr')).toBe(2026);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Neues Schuljahr' })).toHaveCount(0);
  await themenWaehlen(page);
  await expect(page.getByRole('radio', { name: 'Klasse 6' })).toBeChecked();
});

test('Gerade dran: Lernbereich wählen, Themen stehen oben (L-18)', async ({ page }) => {
  await page.goto('./');
  await themenWaehlen(page);
  await page.getByRole('radio', { name: 'Oberschule' }).check();
  await page.getByText('Was ist gerade in der Schule dran? Wählen').click();
  const lb = page.locator('.dran .feld').first();
  await lb.locator('.feld-kopf input').check();
  await expect(page.getByRole('heading', { name: 'Gerade in der Schule dran' })).toBeVisible();
  const anzahl = await page.locator('.dran > .steine li').count();
  expect(anzahl).toBeGreaterThan(0);
  // ein Thema wieder abwählen
  await lb.locator('label.stein.wahl input').first().uncheck();
  await expect(page.locator('.dran > .steine li')).toHaveCount(anzahl - 1);
  await expect
    .poll(
      async () => String(await einstellungImSpeicher(page, 'lernen.gerade-dran')).split(',').length,
    )
    .toBe(anzahl - 1);
  await page.reload();
  await themenWaehlen(page);
  await expect(page.locator('.dran > .steine li')).toHaveCount(anzahl - 1);
});

test('Wiedereinstieg: Diagnose über alle Klassen mit Stand als Klasse (L-16)', async ({ page }) => {
  await page.goto('./');
  await hubVoll(page);
  await page.getByRole('main').getByRole('button', { name: 'Wo stehe ich?' }).click();
  await page.getByRole('radio', { name: /Alles ab Klasse 5/ }).check();
  await expect(page.getByRole('radio', { name: 'Klasse 6' })).toHaveCount(0);
  await page.getByRole('button', { name: "Los geht's" }).click();
  for (let i = 0; i < 40; i++) {
    if (await page.getByText('Hier stehst du – hier geht es weiter').isVisible()) break;
    if (await page.getByText(/^Halbzeit\./).isVisible()) {
      await page.getByRole('button', { name: 'Weiter', exact: true }).click();
      continue;
    }
    await page.getByRole('button', { name: 'Weiß ich nicht' }).click();
  }
  await expect(page.getByText(/Am besten fängst du bei Klasse 5 an/)).toBeVisible();
  await page.getByRole('button', { name: 'Themen zeigen: Klasse 5' }).click();
  await expect(page.getByRole('heading', { name: 'Was möchtest du üben?' })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Klasse 5' })).toBeChecked();
});

test('Klassenarbeit: Termin und Themen, Probe ohne Note (L-19)', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-02T10:00:00') });
  await page.goto('./');
  await mehr(page);
  await page.getByRole('button', { name: 'Klassenarbeit', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Klassenarbeit vorbereiten' })).toBeVisible();
  await page.getByLabel('Termin').fill('2026-11-10');
  await page.locator('.klassenarbeit input[type="checkbox"]').nth(0).check();
  await page.locator('.klassenarbeit input[type="checkbox"]').nth(1).check();
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page.getByText('Klassenarbeit am Dienstag, 10. November')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Das solltest du noch üben' })).toBeVisible();
  await expect(page.locator('.klassenarbeit .liste li')).toHaveCount(2);
  // Probe: gemischt, ohne Hilfen, danach „Das noch üben“
  await page.getByRole('button', { name: 'Probe-Klassenarbeit' }).click();
  await expect(page.getByRole('heading', { name: 'Probe-Klassenarbeit' })).toBeVisible();
  await page.getByRole('button', { name: "Los geht's" }).click();
  for (let i = 0; i < 20; i++) {
    if (await page.getByText('Hier stehst du – hier geht es weiter').isVisible()) break;
    await page.getByRole('button', { name: 'Weiß ich nicht' }).click();
  }
  await expect(page.getByText('Das noch üben:')).toBeVisible();
  // Auf der Startseite steht das Datum, kein Countdown – auch nach dem Neuladen
  await expect
    .poll(async () => String(await einstellungImSpeicher(page, 'lernen.klassenarbeit')))
    .toContain('2026-11-10');
  await page.reload();
  await hubVoll(page);
  await expect(page.getByText('Klassenarbeit am Dienstag, 10. November')).toBeVisible();
  // Nach dem Termin ist sie vorbei
  await page.clock.setSystemTime(new Date('2026-11-11T10:00:00'));
  await page.reload();
  await hubVoll(page);
  await expect(page.getByText(/Klassenarbeit am/)).toHaveCount(0);
});

test('Aussehen: hell, dunkel oder wie das Gerät (GRAFIK §2)', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('./');
  const wurzel = page.locator('html');
  // Lernflächen bleiben hell; Abend nur als Bastion-Flag (Design L61)
  await expect(wurzel).toHaveAttribute('data-modus', 'hell');
  await expect(wurzel).toHaveAttribute('data-bastion-abend', 'ja');
  await page.getByRole('button', { name: 'Lieber später' }).click();
  await mehr(page);
  await page.getByRole('button', { name: 'Über mich' }).click();
  await page.getByLabel('Bastion bei Tag').check();
  await expect(wurzel).toHaveAttribute('data-modus', 'hell');
  await expect(wurzel).toHaveAttribute('data-bastion-abend', 'nein');
  await expect.poll(() => einstellungImSpeicher(page, 'darstellung.modus')).toBe('hell');
  await page.reload();
  await expect(wurzel).toHaveAttribute('data-modus', 'hell');
  await expect(wurzel).toHaveAttribute('data-bastion-abend', 'nein');
  await mehr(page);
  await page.getByRole('button', { name: 'Über mich' }).click();
  await page
    .getByRole('group', { name: 'Abend in der Bastion' })
    .getByLabel('Wie draußen (Sonnenstand)')
    .check();
  await expect(wurzel).toHaveAttribute('data-bastion-abend', 'ja');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(wurzel).toHaveAttribute('data-bastion-abend', 'nein');
  await expect(wurzel).toHaveAttribute('data-modus', 'hell');
});

test('Start-Hub: Üben, Bastion, Mehr ohne Reiterleiste', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  await page.getByRole('button', { name: 'Lieber später' }).click();
  await expect(page.getByRole('navigation', { name: 'Bereiche' })).toHaveCount(0);
  await expect(page.getByText('Ein Ort zum Üben – und eine Bastion, die mitwächst.')).toBeVisible();
  await expect(page.getByRole('group', { name: 'Wohin möchtest du?' })).toBeVisible();
  await page.getByRole('main').getByRole('button', { name: 'Mit Üben starten' }).click();
  await expect(
    page
      .getByRole('button', { name: 'Prüfen' })
      .or(page.getByRole('button', { name: 'Ich kann das schon' }))
      .first(),
  ).toBeVisible({
    timeout: 30_000,
  });
  await page.goto('./');
  await hubVoll(page);
  await page.getByRole('main').getByRole('button', { name: 'Mehr' }).click();
  await expect(page.getByText('Keine Werbung. Keine Käufe.')).toBeVisible();
  await page.getByRole('button', { name: 'Zurück' }).click();
  await hubVoll(page);
  await page.getByRole('main').getByRole('button', { name: 'Bastion' }).click();
  await expect(page.getByRole('button', { name: 'Bastion-Einstellungen' })).toBeVisible({
    timeout: 30_000,
  });
  await bastionZurStartseite(page);
});

test('Üben: Punkte zeigen den Fortschritt im Fünferblock, ohne Zeit (GRAFIK §5)', async ({
  page,
}) => {
  await page.goto('./');
  await themenWaehlen(page);
  await thema(page, /^Addieren und Subtrahieren/);
  await expect(page.getByRole('img', { name: '0 von 5 Aufgaben erledigt' })).toBeVisible();
  await page.getByLabel('Deine Antwort').fill('0');
  await page.getByRole('button', { name: 'Prüfen' }).click();
  await expect(page.getByRole('img', { name: '1 von 5 Aufgaben erledigt' })).toBeVisible();
});

test('Erstvermittlung: Schritt für Schritt, Rückmeldung zur Fehlvorstellung, dann üben (U3c)', async ({
  page,
}) => {
  await page.goto('./');
  await themenWaehlen(page);
  await page.getByRole('button', { name: /^Brüche als Anteile/ }).click();
  await page.getByRole('button', { name: 'Erklär es mir' }).click();

  await expect(page.getByText('Dein Ziel')).toBeVisible();
  // L6: die Fortschrittsleiste zählt die Schritte mit
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  await page.getByRole('button', { name: 'Weiter' }).click();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
  // Vorwissen: 12 Gummibärchen für 4 Kinder
  await page.getByLabel('Deine Antwort').fill('3');
  await page.getByRole('button', { name: 'Prüfen' }).click();
  await expect(page.getByText('Stimmt.')).toBeVisible();
  await page.getByRole('button', { name: 'Weiter' }).click();
  // Entdecken: falsche Wahl zeigt die kurze Erklärung der Fehlvorstellung
  await page.getByRole('radio', { name: '3', exact: true }).check();
  await page.getByRole('button', { name: 'Prüfen' }).click();
  await expect(page.getByText('Noch nicht ganz.')).toBeVisible();
  await expect(page.getByText('So ist es richtig: 4')).toBeVisible();
  await page.getByRole('button', { name: 'Weiter' }).click();
  await expect(page.getByText('So geht es')).toBeVisible();

  // Gespeichert: zwei Antworten als Ereignis „vermittlung“
  const gespeichert = await page.evaluate(
    () =>
      new Promise<{ schritt: string; richtig: boolean; fv?: string }[]>((fertig) => {
        const anfrage = indexedDB.open('bastion');
        anfrage.onsuccess = () => {
          const lesen = anfrage.result
            .transaction('vermittlungen')
            .objectStore('vermittlungen')
            .getAll();
          lesen.onsuccess = () => {
            anfrage.result.close();
            fertig(lesen.result as { schritt: string; richtig: boolean; fv?: string }[]);
          };
        };
      }),
  );
  expect(gespeichert.map((e) => [e.schritt, e.richtig, e.fv])).toEqual([
    ['vorwissen', true, undefined],
    ['entdecken', false, 'FV.BR.TEIL-ZU-REST'],
  ]);

  await page.getByRole('button', { name: /Zurück/ }).click();
  await expect(page.getByRole('button', { name: 'Prüfen' })).toBeVisible();
});

test('Erstvermittlung bis zum Ende: Bauschritt, „erklärt“, kein Angebot mehr, Kurzfassung (U3d)', async ({
  page,
}) => {
  await page.goto('./');
  await themenWaehlen(page);
  await page.getByRole('button', { name: /^Brüche als Anteile/ }).click();
  await page.getByRole('button', { name: 'Erklär es mir' }).click();
  // Alles richtig beantworten bis zum Übergang
  const richtig: Record<string, () => Promise<void>> = {
    'Was du schon weißt': () => page.getByLabel('Deine Antwort').fill('3'),
    'Probier es aus': () => page.getByRole('radio', { name: '4', exact: true }).check(),
    'Jetzt du': async () => {
      await page.getByLabel('Zähler').fill('2');
      await page.getByLabel('Nenner').fill('6');
    },
    'Stimmt das?': () => page.getByRole('radio', { name: /^Nein/ }).check(),
    'Prüfe dich': () => page.getByRole('radio', { name: '3/5', exact: true }).check(),
  };
  for (let i = 0; i < 20; i++) {
    if (await page.getByRole('button', { name: 'Jetzt üben' }).isVisible()) break;
    const typ = (await page.locator('.typ').first().textContent())?.trim() ?? '';
    const antwort = Object.entries(richtig).find(([k]) => k.toUpperCase() === typ.toUpperCase());
    if (antwort) {
      await antwort[1]();
      await page.getByRole('button', { name: 'Prüfen' }).click();
      await expect(page.getByText('Stimmt.')).toBeVisible();
    }
    await page.getByRole('button', { name: 'Weiter' }).click();
  }
  await page.getByRole('button', { name: 'Jetzt üben' }).click();
  await expect(page.getByRole('button', { name: 'Prüfen' })).toBeVisible();

  // Zurück zur Übersicht: „erklärt“, und beim nächsten Mal kein Angebot mehr
  await page.getByRole('button', { name: /Zurück/ }).click();
  await expect(page.getByRole('button', { name: /^Brüche als Anteile erklärt/ })).toBeVisible();
  await page.getByRole('button', { name: /^Brüche als Anteile/ }).click();
  await expect(page.getByRole('button', { name: 'Erklär es mir' })).toHaveCount(0);

  // Kurzfassung: nur Beispiele und Merksätze
  await page.getByRole('main').getByRole('button', { name: 'Erklärung' }).click();
  await page.getByRole('button', { name: 'Nur Kurzfassung' }).click();
  await expect(page.getByText('Merke dir')).toBeVisible();
  await expect(page.getByText('Dein Ziel')).toHaveCount(0);

  // Der Abschluss brachte einen Bauschritt (D-16, ergänzt)
  const gruende = await page.evaluate(
    () =>
      new Promise<string[]>((fertig) => {
        const anfrage = indexedDB.open('bastion');
        anfrage.onsuccess = () => {
          const lesen = anfrage.result.transaction('buchungen').objectStore('buchungen').getAll();
          lesen.onsuccess = () => {
            anfrage.result.close();
            fertig((lesen.result as { bezug: string }[]).map((b) => b.bezug));
          };
        };
      }),
  );
  expect(gruende).toContain('vermittlung:M.ZO.BR.BEGRIFF');
});

test('Zwischenschritte: nach falschem Ergebnis den Weg zeigen, zwei Versuche je Schritt (U3h)', async ({
  page,
}) => {
  await page.goto('./');
  await themenWaehlen(page);
  await page.getByRole('radio', { name: 'Klasse 6' }).check();
  await page.getByRole('button', { name: /^Brüche erweitern und kürzen/ }).click();
  await page.getByRole('button', { name: 'Ich kann das schon' }).click();

  // Absichtlich falsch: 1/1 ist hier nie richtig
  const aufgabe = page.locator('form#antwort');
  await aufgabe.getByLabel('Zähler').fill('1');
  await aufgabe.getByLabel('Nenner').fill('1');
  await page.getByRole('button', { name: 'Prüfen', exact: true }).click();
  await expect(page.getByText('Zeig mir deinen Weg')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Nächste Aufgabe' })).toHaveCount(0);

  const schritt = page.locator('form.aktuell');
  // Schritt 1 (Zahl): zweimal falsch → Bastion zeigt den Schritt
  for (let i = 0; i < 2; i++) {
    await schritt.getByLabel('Deine Eingabe').fill('0');
    await schritt.getByRole('button', { name: 'Prüfen' }).click();
  }
  await expect(page.getByText(/So geht es:/)).toBeVisible();
  // Schritt 2 (Bruch): zweimal falsch
  for (let i = 0; i < 2; i++) {
    await schritt.getByLabel('Zähler').fill('1');
    await schritt.getByLabel('Nenner').fill('1');
    await schritt.getByRole('button', { name: 'Prüfen' }).click();
  }
  await expect(page.getByText('Dein Fehler lag hier:')).toBeVisible();
  await page.getByRole('button', { name: 'Nächste Aufgabe' }).click();

  // Gespeichert: das Ereignis mit beiden Schritten
  const lies = () =>
    page.evaluate(
      () =>
        new Promise<unknown[]>((fertig) => {
          const anfrage = indexedDB.open('bastion');
          anfrage.onsuccess = () => {
            const lesen = anfrage.result.transaction('aufgaben').objectStore('aufgaben').getAll();
            lesen.onsuccess = () => {
              anfrage.result.close();
              const e = (lesen.result as { schritte?: unknown[] }[]).at(-1);
              fertig(e?.schritte ?? []);
            };
          };
        }),
    );
  await expect.poll(async () => (await lies()).length).toBe(2);
  const schritte = await lies();
  expect(schritte).toMatchObject([
    { versuche: 2, richtig: false },
    { versuche: 2, richtig: false },
  ]);

  // „Weiter ohne Weg“: Ergebnis wie bisher, Lösungsweg offen
  await aufgabe.getByLabel('Zähler').fill('1');
  await aufgabe.getByLabel('Nenner').fill('1');
  await page.getByRole('button', { name: 'Prüfen', exact: true }).click();
  await page.getByRole('button', { name: 'Weiter ohne Weg' }).click();
  await expect(page.getByRole('button', { name: 'Nächste Aufgabe' })).toBeVisible();
  // L4: ohne Weg verschwinden Schrittfelder und Tastatur
  await expect(page.locator('form.aktuell')).toHaveCount(0);
});

test('Diagnose: derselbe Denkfehler zweimal → lange Erklärung und Rückweg (U3i)', async ({
  page,
}) => {
  await page.goto('./');
  await themenWaehlen(page);
  await page.getByRole('radio', { name: 'Klasse 6' }).check();
  await page.getByRole('button', { name: /^Brüche erweitern und kürzen/ }).click();
  await page.getByRole('button', { name: 'Ich kann das schon' }).click();

  const ggt = (a: number, b: number): number => (b === 0 ? a : ggt(b, a % b));
  // Zweimal „nur den Nenner verändert“ (FV.BR.NUR-NENNER) – bei Kürzen und bei Erweitern
  for (let runde = 0; runde < 2; runde++) {
    const text = (await page.locator('.aufgabe .text').textContent()) ?? '';
    const z = Number(await page.locator('.aufgabe .text .zaehler').first().textContent());
    const n = Number(await page.locator('.aufgabe .text .nenner').first().textContent());
    const ziel = /Nenner\s*(\d+)\s*ist/.exec(text);
    const falsch = ziel ? [z, Number(ziel[1])] : [z, n / ggt(z, n)];
    const form = page.locator('form#antwort');
    await form.getByLabel('Zähler').fill(String(falsch[0]));
    await form.getByLabel('Nenner').fill(String(falsch[1]));
    await page.getByRole('button', { name: 'Prüfen', exact: true }).click();
    await page.getByRole('button', { name: 'Weiter ohne Weg' }).click();
    if (runde === 0) await page.getByRole('button', { name: 'Nächste Aufgabe' }).click();
  }
  await expect(page.getByText('Dieser Denkfehler ist dir schon öfter passiert.')).toBeVisible();
  // Lange Erklärung steckt hinter „Erklärung lesen“ (§S98)
  await page.getByRole('main').locator('summary', { hasText: 'Erklärung lesen' }).click();
  await expect(page.getByRole('heading', { name: 'So denkst du gerade' })).toBeVisible();
  await page.getByRole('button', { name: 'Zurück zur Erklärung' }).click();
  // Rückweg: mitten in die Erstvermittlung, nicht an den Anfang
  await expect(page.getByText('Dein Ziel')).toHaveCount(0);
  await expect(page.locator('.vermittlung .karte')).toBeVisible();
});

test('Fehlerwerkstatt nach Ursachen: ein Denkfehler aus Kürzen und Erweitern ist eine Gruppe (U3j)', async ({
  page,
}) => {
  await page.goto('./');
  await themenWaehlen(page);
  await page.getByRole('radio', { name: 'Klasse 6' }).check();
  await page.getByRole('button', { name: /^Brüche erweitern und kürzen/ }).click();
  await page.getByRole('button', { name: 'Ich kann das schon' }).click();
  const ggt = (a: number, b: number): number => (b === 0 ? a : ggt(b, a % b));
  for (let runde = 0; runde < 2; runde++) {
    const text = (await page.locator('.aufgabe .text').textContent()) ?? '';
    const z = Number(await page.locator('.aufgabe .text .zaehler').first().textContent());
    const n = Number(await page.locator('.aufgabe .text .nenner').first().textContent());
    const ziel = /Nenner\s*(\d+)\s*ist/.exec(text);
    const falsch = ziel ? [z, Number(ziel[1])] : [z, n / ggt(z, n)];
    const form = page.locator('form#antwort');
    await form.getByLabel('Zähler').fill(String(falsch[0]));
    await form.getByLabel('Nenner').fill(String(falsch[1]));
    await page.getByRole('button', { name: 'Prüfen', exact: true }).click();
    await page.getByRole('button', { name: 'Weiter ohne Weg' }).click();
    await page.getByRole('button', { name: 'Nächste Aufgabe' }).click();
  }
  await page.goto('./');
  await page
    .getByRole('main')
    .getByRole('button', { name: /Fehlerwerkstatt/ })
    .click();
  const gruppen = page.locator('.gruppe');
  await expect(gruppen).toHaveCount(1);
  await expect(gruppen.first()).toContainText('Denkfehler: Verändert nur den Nenner');
  await expect(gruppen.first()).toContainText('2');
});

test('Testprotokoll: mit Teilnehmer-Nummer einschalten, Hinweis, Vorschau, Datei, löschen (U4a)', async ({
  page,
}) => {
  await page.goto('./');
  await mehr(page);
  await page.getByRole('button', { name: 'Für Eltern' }).click();
  await page.getByLabel('PIN', { exact: true }).fill('4711');
  await page.getByLabel('PIN wiederholen').fill('4711');
  await page.getByRole('button', { name: 'PIN festlegen' }).click();
  await page.getByRole('button', { name: 'Ich habe den Code aufgeschrieben' }).click();

  await expect(page.getByText('Das Testprotokoll ist ausgeschaltet.')).toBeVisible();
  await page.getByLabel('Teilnehmer-Nummer').fill('T-01-9');
  await page.getByRole('button', { name: 'Einschalten' }).click();
  await expect(page.getByText(/Diese Nummer stimmt nicht/)).toBeVisible();
  await page.getByLabel('Teilnehmer-Nummer').fill('t 01 8');
  await page.getByRole('button', { name: 'Einschalten' }).click();
  await expect(page.getByText('Das Testprotokoll ist eingeschaltet.')).toBeVisible();

  // Neu laden: Startseite liest den Testphase-Stand frisch (wie nach Leiste-Start früher)
  await page.goto('./');
  const skip = page.getByRole('button', { name: 'Lieber später' });
  if (await skip.isVisible().catch(() => false)) await skip.click();
  await expect(
    page.getByText('Testphase: Die Nutzung wird auf diesem Gerät protokolliert.'),
  ).toBeVisible({ timeout: 15_000 });
  await themenWaehlen(page);
  await thema(page, /^Addieren und Subtrahieren/);
  await page.getByLabel('Deine Antwort').fill('0');
  await page.getByRole('button', { name: 'Prüfen' }).click();

  // Vorschau und Datei
  await mehr(page);
  await page.getByRole('button', { name: 'Für Eltern' }).click();
  await page.getByLabel('PIN', { exact: true }).fill('4711');
  await page.getByRole('button', { name: 'Öffnen' }).click();
  await page.getByRole('button', { name: 'Protokoll ansehen' }).click();
  await expect(page.getByText('T-01-8', { exact: true })).toBeVisible();
  await expect(page.getByText(/Nutzung: [1-9]/)).toBeVisible();
  await expect(page.getByText(/Aufgaben: 1/)).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Als Datei speichern' }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(
    /^bastion-testprotokoll-T-01-8-\d{4}-\d{2}-\d{2}\.json$/,
  );
  const inhalt = JSON.parse(
    await (await download.createReadStream()).toArray().then((t) => Buffer.concat(t).toString()),
  ) as { teilnehmer: string; ereignisse: { art: string }[] };
  expect(inhalt.teilnehmer).toBe('T-01-8');
  expect(JSON.stringify(inhalt)).not.toContain('"profil"');
  expect(inhalt.ereignisse.some((e) => e.art === 'nutzung')).toBe(true);

  // Löschen mit Rückfrage: Nutzung weg, Aufgaben bleiben
  await page.getByRole('button', { name: 'Nutzungsprotokoll löschen' }).click();
  await page.getByRole('button', { name: /Wirklich löschen/ }).click();
  await expect(page.getByText('Das Nutzungsprotokoll ist gelöscht.')).toBeVisible();
  await expect(page.getByText(/Aufgaben: 1/)).toBeVisible();
});
