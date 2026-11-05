import { expect, test, type Page } from '@playwright/test';

// Strang Oberfläche (docs/session/OBERFLAECHE.md, O1–O22): sichert ab, was neu ist und
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
  const seiten: readonly (readonly [string, string])[] = [
    ['Über mich', 'Über mich'],
    ['Sicherung', 'Alles sicher'],
  ];
  for (const [eintrag, titel] of seiten) {
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

test('Handy im Browser: zuerst die Installationsanleitung, dann Leiste und Seite unter „Mehr“ (O14)', async ({
  browser,
  baseURL,
}) => {
  const iphone =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
  const kontext = await browser.newContext({
    ...(baseURL ? { baseURL } : {}),
    userAgent: iphone,
    viewport: { width: 390, height: 844 },
  });
  const seite = await kontext.newPage();
  await seite.goto('./');
  const sperre = seite.getByRole('dialog', { name: 'Zuerst Bastion installieren' });
  await expect(sperre).toBeVisible();
  await expect(sperre.getByText('Erkannt: iPhone / iPad · Safari')).toBeVisible();
  await expect(sperre.getByText('„Zum Home-Bildschirm“')).toBeVisible();
  await expect(sperre.getByText(/Wichtig auf iPhone und iPad/)).toBeVisible();
  await sperre.getByRole('button', { name: 'Ohne Installation im Browser weiter' }).click();
  await expect(sperre).toHaveCount(0);
  // Bis zum nächsten Öffnen nicht noch einmal – auch nicht nach Neuladen im selben Tab
  await seite.reload();
  await expect(
    seite.getByRole('main').getByRole('button', { name: 'Üben', exact: true }),
  ).toBeVisible();
  await expect(sperre).toHaveCount(0);
  // Ruhige Leiste oben führt zur Anleitung
  await seite.getByRole('button', { name: /App nicht installiert/ }).click();
  await expect(
    seite.getByRole('heading', { name: 'Als App installieren', level: 2 }),
  ).toBeVisible();
  await seite.getByText('Android · Chrome').click();
  await expect(seite.getByText('Mit „Installieren“ bestätigen.')).toBeVisible();
  await seite.getByRole('button', { name: 'Zurück', exact: true }).click();
  await expect(
    seite.getByRole('main').getByRole('button', { name: 'Als App installieren' }),
  ).toBeVisible();
  await kontext.close();
});

test('Computer: keine Sperre und keine Leiste, Anleitung nur unter „Mehr“ (O14)', async ({
  page,
}) => {
  await start(page);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /App nicht installiert/ })).toHaveCount(0);
  await mehr(page);
  await page.getByRole('main').getByRole('button', { name: 'Als App installieren' }).click();
  await expect(page.getByText(/Erkannt: Computer/)).toBeVisible();
});

test('Zurück-Taste des Geräts führt Seite für Seite zurück; Titel und Fokus folgen (O15)', async ({
  page,
}) => {
  await start(page);
  await mehr(page);
  await expect(page).toHaveTitle('Mehr – Bastion');
  await expect(page.getByRole('heading', { name: 'Mehr', level: 2 })).toBeFocused();
  await page.getByRole('main').getByRole('button', { name: 'Sicherung', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Alles sicher', level: 2 })).toBeVisible();
  // Zurück wie mit dem Zurück-Knopf der Seite – nicht aus der App heraus
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Mehr', level: 2 })).toBeVisible();
  await page.goBack();
  await expect(
    page.getByRole('main').getByRole('button', { name: 'Üben', exact: true }),
  ).toBeVisible();
  await expect(page).toHaveTitle('Bastion');
  // Zurück per Knopf in der App lässt keinen leeren Schritt im Verlauf
  await mehr(page);
  await page.getByRole('button', { name: 'Zurück', exact: true }).click();
  await expect(
    page.getByRole('main').getByRole('button', { name: 'Üben', exact: true }),
  ).toBeVisible();
  await mehr(page);
  await page.goBack();
  await expect(
    page.getByRole('main').getByRole('button', { name: 'Üben', exact: true }),
  ).toBeVisible();
});

test('Einstellungen: Schriftgröße wirkt sofort und bleibt; große Schrift ohne Seitwärts-Wischen (O16, O19)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await start(page);
  await mehr(page);
  await page.getByRole('main').getByRole('button', { name: 'Einstellungen', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Einstellungen', level: 2 })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Bastion anzeigen' })).toBeChecked();
  await page.getByLabel('Sehr groß').check();
  const wurzel = page.locator('html');
  await expect(wurzel).toHaveCSS('font-size', '20px');
  await page.reload();
  await expect(wurzel).toHaveCSS('font-size', '20px');
  // Doppelte Schrift (Einstellung am Gerät): die Startseite bleibt so breit wie der Bildschirm
  await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(390);
});

test('Erststart Android: „Im Browser weiter“ merkt sich das Gerät (O17)', async ({
  browser,
  baseURL,
}) => {
  const android =
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36';
  const kontext = await browser.newContext({
    ...(baseURL ? { baseURL } : {}),
    userAgent: android,
    viewport: { width: 412, height: 915 },
  });
  const seite = await kontext.newPage();
  await seite.goto('./');
  const sperre = seite.getByRole('dialog', { name: 'Zuerst Bastion installieren' });
  await sperre.getByRole('button', { name: 'Ohne Installation im Browser weiter' }).click();
  await expect(sperre).toHaveCount(0);
  // Neues Öffnen (neuer Tab): keine Anleitung mehr, nur die ruhige Leiste
  const zweite = await kontext.newPage();
  await zweite.goto('./');
  await expect(
    zweite.getByRole('main').getByRole('button', { name: 'Üben', exact: true }),
  ).toBeVisible();
  await expect(zweite.getByRole('dialog')).toHaveCount(0);
  // Beim allerersten Start noch keine Karte „Über mich“
  await expect(zweite.getByRole('button', { name: 'Lieber später' })).toHaveCount(0);
  await kontext.close();
});

test('Mein Stand: Einstieg oben, Klasse als Segmente, Bereiche als Klappkarten (O18)', async ({
  page,
}) => {
  await start(page);
  await page.getByRole('main').getByRole('button', { name: 'Mein Stand', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Mein Stand', level: 2 })).toBeVisible();
  const weiter = page.getByRole('button', { name: /^Weiter mit:/ });
  await expect(weiter).toBeVisible();
  // Nur ein Bereich offen, die anderen zu; Namen ungekürzt
  await expect(page.locator('.landkarte details[open]')).toHaveCount(1);
  expect(await page.locator('.landkarte details').count()).toBeGreaterThan(1);
  await expect(page.locator('.landkarte .name').first()).toHaveCSS('white-space', 'normal');
  // Segmente: das Feld heißt weiter „Klasse 6“
  await page.getByLabel('Klasse 6').check();
  await expect(page.getByLabel('Klasse 6')).toBeChecked();
  // Kein Bastion-Schalter mehr hier (steht unter Einstellungen)
  await expect(page.getByRole('checkbox', { name: 'Bastion anzeigen' })).toHaveCount(0);
});

test('PIN: Rückmeldung schon beim Tippen (O20)', async ({ page }) => {
  await start(page);
  await mehr(page);
  await page.getByRole('button', { name: 'Für Eltern' }).click();
  await page.getByLabel('PIN', { exact: true }).fill('4711');
  await page.getByLabel('PIN wiederholen').fill('4712');
  await expect(page.getByText('Die beiden Eingaben stimmen nicht überein.')).toBeVisible();
  await page.getByLabel('PIN wiederholen').fill('4711');
  await expect(page.getByText('Beide Eingaben stimmen überein.')).toBeVisible();
});
