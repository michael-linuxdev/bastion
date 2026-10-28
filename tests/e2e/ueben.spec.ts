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

test('merkt sich den Fortschritt auf dem Gerät, auch nach Neuladen', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Üben' }).click();
  const thema = page.getByRole('button', { name: /^Addieren und Subtrahieren/ });
  await expect(thema).not.toContainText('in Arbeit');
  await thema.click();
  await page.getByLabel('Deine Antwort').fill('0');
  await page.getByRole('button', { name: 'Prüfen' }).click();
  await expect(page.getByText('Das stimmt noch nicht.')).toBeVisible();
  await page.getByRole('button', { name: /Zurück/ }).click();
  await expect(page.getByRole('button', { name: /^Addieren und Subtrahieren/ })).toContainText(
    'in Arbeit',
  );

  await page.reload();
  await page.getByRole('button', { name: 'Üben' }).click();
  await expect(page.getByRole('button', { name: /^Addieren und Subtrahieren/ })).toContainText(
    'in Arbeit',
  );
});

test('bietet geübte Aufgaben später zum Wiederholen an', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-02T10:00:00Z') });
  await page.goto('./');
  await expect(page.getByRole('button', { name: 'Wiederholen' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Üben' }).click();
  await page.getByRole('button', { name: /^Addieren und Subtrahieren/ }).click();
  await page.getByLabel('Deine Antwort').fill('0');
  await page.getByRole('button', { name: 'Prüfen' }).click();
  await expect(page.getByText('Das stimmt noch nicht.')).toBeVisible();
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
  await page.getByRole('button', { name: 'Üben' }).click();
  await page.getByRole('button', { name: /^Addieren und Subtrahieren/ }).click();
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
  await expect(page.getByText('Deine Antwort damals:')).toContainText('0');
  const nochmal = (await page.locator('.aufgabe .text').innerText()).replace(/[\s\u202f]/g, '');
  expect(nochmal).toBe(text);

  await page.getByLabel('Deine Antwort').fill(String(summe));
  await page.getByRole('button', { name: 'Prüfen' }).click();
  await expect(page.getByText('Richtig!')).toBeVisible();
  await page.getByRole('button', { name: 'Nächste Aufgabe' }).click();
  await expect(page.getByText('Diese Fehler hast du aufgearbeitet.')).toBeVisible();
  await page.getByRole('button', { name: /Zurück/ }).click();
  await expect(page.getByText(/Keine offenen Fehler/)).toBeVisible();
});
