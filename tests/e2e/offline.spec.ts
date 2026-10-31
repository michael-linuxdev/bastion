import { expect, test, type Page } from '@playwright/test';

/** „Mehr“ in der Leiste unten öffnen: Sicherung, Über mich, Klassenarbeit, Für Eltern */
async function mehr(seite: Page) {
  await seite.getByRole('navigation').getByRole('button', { name: 'Mehr' }).click();
}

// Kritischer Weg „erster Start offline“ (ARCHITEKTUR §13):
// einmal online laden, dann ohne Netz neu laden – die App muss starten.
test('startet nach dem ersten Laden auch ohne Netz', async ({ page, context, baseURL }) => {
  const fremdeAnfragen: string[] = [];
  const eigenerUrsprung = new URL(baseURL ?? '').origin;
  page.on('request', (anfrage) => {
    if (new URL(anfrage.url()).origin !== eigenerUrsprung) fremdeAnfragen.push(anfrage.url());
  });

  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1, name: 'Bastion' })).toBeVisible();

  // Warten, bis der Service Worker die App-Hülle gespeichert hat.
  await mehr(page);
  await expect(page.getByText('funktioniert jetzt auch ohne Internet')).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready);

  await context.setOffline(true);
  await page.reload();

  await expect(page.getByRole('heading', { level: 1, name: 'Bastion' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');

  // Datenschutz (A2): keine einzige Anfrage an fremde Adressen.
  expect(fremdeAnfragen).toEqual([]);
});

test('liefert ein gültiges Web-App-Manifest aus', async ({ request }) => {
  const antwort = await request.get('manifest.webmanifest');
  expect(antwort.ok()).toBe(true);
  const manifest = (await antwort.json()) as { name: string; icons: unknown[] };
  expect(manifest.name).toBe('Bastion');
  expect(manifest.icons.length).toBeGreaterThan(0);
});

// Grafik der Bastion (Schritt 2.12): nicht vorab geladen, aber nach dem ersten Öffnen offline da.
test('Grafik der Bastion: erst beim Öffnen geladen, danach auch ohne Netz', async ({
  page,
  context,
}) => {
  const grafik: string[] = [];
  page.on('request', (anfrage) => {
    if (/grafik-buehne-[^/]*\.js$/.test(anfrage.url())) grafik.push(anfrage.url());
  });
  await page.goto('./');
  await mehr(page);
  await expect(page.getByText('funktioniert jetzt auch ohne Internet')).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready);
  // Startseite und Vorab-Speicher laden die Grafik nicht (R7, A3)
  expect(grafik).toEqual([]);

  await page.getByRole('navigation').getByRole('button', { name: 'Start' }).click();
  await page.getByRole('main').getByRole('button', { name: 'Bastion' }).click();
  await expect(page.locator('.bauplatz canvas').first()).toBeVisible({ timeout: 30_000 });
  expect(grafik.length).toBeGreaterThan(0);

  await context.setOffline(true);
  await page.reload();
  await page.getByRole('main').getByRole('button', { name: 'Bastion' }).click();
  // .first(): kurzzeitig können zwei Canvas existieren, bis der Effekt aufräumt
  await expect(page.locator('.bauplatz canvas').first()).toBeVisible({ timeout: 30_000 });
});
