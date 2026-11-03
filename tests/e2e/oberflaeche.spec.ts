import { expect, test, type Page } from '@playwright/test';

// Strang Oberfläche (docs/session/OBERFLAECHE.md, O1–O12): sichert ab, was neu ist und
// sonst kein Test sieht – Banner, Plaketten, erreichbare ausgegraute Kacheln, Seitenkopf,
// Klappkarten und Sprungleiste im Elternbereich.

async function start(seite: Page) {
  await seite.goto('./');
  const spaeter = seite.getByRole('button', { name: 'Lieber später' });
  if (await spaeter.isVisible().catch(() => false)) await spaeter.click();
}

async function mehr(seite: Page) {
  await seite.getByRole('main').getByRole('button', { name: 'Mehr', exact: true }).click();
  await expect(seite.getByRole('heading', { name: 'Mehr', level: 2 })).toBeVisible();
}

/** Von „Mehr“ aus: PIN festlegen und den Elternbereich öffnen. */
async function elternOeffnen(seite: Page) {
  await seite.getByRole('button', { name: 'Für Eltern' }).click();
  await seite.getByLabel('PIN', { exact: true }).fill('4711');
  await seite.getByLabel('PIN wiederholen').fill('4711');
  await seite.getByRole('button', { name: 'PIN festlegen' }).click();
  await seite.getByRole('button', { name: 'Ich habe den Code aufgeschrieben' }).click();
  await expect(seite.locator('details.abschnitt').first()).toBeVisible();
}

test('Startseite: Banner öffnet die Bastion, Name nicht doppelt für Screenreader (O3, O7, O10)', async ({
  page,
}) => {
  await start(page);
  const haupt = page.getByRole('main');
  // Nur die (unsichtbare) h1 nennt „Bastion“; der Banner-Titel ist für Screenreader aus
  await expect(haupt.getByRole('heading', { name: 'Bastion', level: 1 })).toHaveCount(1);
  expect(await haupt.ariaSnapshot()).not.toContain('paragraph: Bastion');
  // Alle Türen und Kacheln sind da, auch ohne je geübt zu haben
  for (const name of ['Üben', 'Bastion', 'Mehr', 'Wiederholen', 'Fehlerwerkstatt'])
    await expect(haupt.getByRole('button', { name, exact: true })).toBeVisible();
  // Tipp auf das Bild: Abkürzung in die Bastion
  await page.locator('.banner .bild').click();
  await expect(page.getByRole('button', { name: 'Bastion-Einstellungen' })).toBeVisible({
    timeout: 30_000,
  });
});

test('Ausgegraute Kacheln bleiben mit der Tastatur erreichbar; Fehler zeigt eine Zahl (O7, O10)', async ({
  page,
}) => {
  await start(page);
  const haupt = page.getByRole('main');
  const werkstatt = haupt.getByRole('button', { name: 'Fehlerwerkstatt', exact: true });
  await expect(werkstatt).toBeDisabled();
  await expect(werkstatt).toHaveAccessibleDescription(/Noch keine offenen Fehler/);
  // aria-disabled statt disabled: fokussierbar, Klick tut nichts
  await werkstatt.focus();
  await expect(werkstatt).toBeFocused();
  await werkstatt.click({ force: true });
  await expect(haupt.getByRole('button', { name: 'Üben', exact: true })).toBeVisible();
  await expect(werkstatt.locator('.zahl')).toHaveCount(0);

  // Einen Fehler machen: danach steht auf der Kachel eine ruhige Zahl
  await mehr(page);
  await page.getByRole('main').getByRole('button', { name: 'Themen wählen' }).click();
  const spaeter = page.getByRole('button', { name: 'Später' });
  if (await spaeter.isVisible().catch(() => false)) await spaeter.click();
  await page.getByRole('button', { name: /^Addieren und Subtrahieren/ }).click();
  const nein = page.getByRole('button', { name: 'Ich kann das schon' });
  const pruefen = page.getByRole('button', { name: 'Prüfen' });
  await expect(nein.or(pruefen).first()).toBeVisible({ timeout: 15_000 });
  if (await nein.isVisible()) await nein.click();
  await page.getByLabel('Deine Antwort').fill('0');
  await pruefen.click();
  await expect(page.getByText('Noch nicht.')).toBeVisible();
  await page.getByRole('button', { name: 'Zurück', exact: true }).click();
  await expect(page.getByRole('button', { name: /^Addieren und Subtrahieren/ })).toContainText(
    'in Arbeit',
  );
  await page.goto('./');
  await expect(werkstatt).toBeEnabled();
  await expect(werkstatt.locator('.zahl')).toHaveText('1');
  await expect(werkstatt).toHaveAccessibleName('Fehlerwerkstatt');
});

test('Seitenkopf: Zurück aus Über mich und Sicherung führt nach „Mehr“ (O6)', async ({ page }) => {
  await start(page);
  await mehr(page);
  for (const [eintrag, titel] of [
    ['Über mich', 'Über mich'],
    ['Sicherung', 'Alles sicher'],
  ]) {
    await page.getByRole('main').getByRole('button', { name: eintrag, exact: true }).click();
    await expect(page.getByRole('heading', { name: titel, level: 2 })).toBeVisible();
    await page.getByRole('button', { name: 'Zurück', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Mehr', level: 2 })).toBeVisible();
  }
});

test('Elternbereich: nur der Bericht offen, Sprungleiste klappt auf, Zurück nach „Mehr“ (O8)', async ({
  page,
}) => {
  await start(page);
  await mehr(page);
  await page.getByRole('button', { name: 'Für Eltern' }).click();
  // PIN-Feld: höchstens 8 Ziffern, Regel am Feld
  const pin = page.getByLabel('PIN', { exact: true });
  await expect(pin).toHaveAttribute('maxlength', '8');
  await expect(pin).toHaveAccessibleDescription('4 bis 8 Ziffern');
  await page.getByRole('button', { name: 'Zurück', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Mehr', level: 2 })).toBeVisible();

  await elternOeffnen(page);
  await expect(page.locator('details.abschnitt[open]')).toHaveCount(1);
  await expect(page.locator('#abschnitt-bericht')).toHaveAttribute('open', '');
  await expect(page.getByLabel('Teilnehmer-Nummer')).toBeHidden();

  await page
    .getByRole('navigation', { name: 'Springen zu' })
    .getByRole('link', { name: 'Testphase' })
    .click();
  await expect(page.locator('#abschnitt-test')).toHaveAttribute('open', '');
  await expect(page.getByLabel('Teilnehmer-Nummer')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Nach oben' })).toBeVisible();

  // Bericht-Umschalter: ein Name für Screenreader, Segmente in einer Zeile
  await expect(page.getByRole('group', { name: 'Ansicht des Berichts' })).toBeVisible();

  await page.getByRole('button', { name: 'Zurück', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Mehr', level: 2 })).toBeVisible();
});
