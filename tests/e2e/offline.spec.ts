import { expect, test } from '@playwright/test';

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
  await expect(page.getByText('funktioniert jetzt auch ohne Internet')).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready);
  // Startseite und Vorab-Speicher laden die Grafik nicht (R7, A3)
  expect(grafik).toEqual([]);

  await page.getByRole('main').getByRole('button', { name: 'Bastion' }).click();
  await expect(page.locator('.bauplatz canvas')).toBeVisible();
  expect(grafik.length).toBeGreaterThan(0);

  await context.setOffline(true);
  await page.reload();
  await page.getByRole('main').getByRole('button', { name: 'Bastion' }).click();
  await expect(page.locator('.bauplatz canvas')).toBeVisible();
});
