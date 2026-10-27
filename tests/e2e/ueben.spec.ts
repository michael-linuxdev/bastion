import { expect, test } from '@playwright/test';

// Kritischer Weg „Üben“: Inhaltspakete laden, Aufgabe beantworten, Rückmeldung
// und Lösungsweg sehen – auch ohne Netz, nach dem ersten Laden.
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
  await expect(page.getByText('funktioniert jetzt auch ohne Internet')).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload();

  await page.getByRole('button', { name: 'Üben' }).click();
  await expect(page.getByRole('heading', { name: 'Was möchtest du üben?' })).toBeVisible();
  await page.getByRole('button', { name: /^Addieren und Subtrahieren/ }).click();

  // Eine sicher falsche Antwort
  await page.getByLabel('Deine Antwort').fill('0');
  await page.getByRole('button', { name: 'Prüfen' }).click();
  await expect(page.getByText('Das stimmt noch nicht.')).toBeVisible();
  await expect(page.locator('summary', { hasText: 'Lösungsweg' })).toBeVisible();

  await page.getByRole('button', { name: 'Nächste Aufgabe' }).click();
  await expect(page.getByLabel('Deine Antwort')).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Prüfen' })).toBeVisible();

  // Datenschutz (A2): keine einzige Anfrage an fremde Adressen.
  expect(fremdeAnfragen).toEqual([]);
});
