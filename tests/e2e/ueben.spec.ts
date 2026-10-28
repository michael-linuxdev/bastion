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

test('Rückkehr nach einer Pause: Begrüßung ohne Vorwurf, kleine Auswahl', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-02T10:00:00Z') });
  await page.goto('./');
  await expect(page.getByText('Willkommen zurück')).toHaveCount(0);
  await page.getByRole('button', { name: 'Üben' }).click();
  await page.getByRole('button', { name: /^Addieren und Subtrahieren/ }).click();
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
  await expect(page.getByText(/kleine Auswahl zum Wiederholen/)).toBeVisible();
  // Keine Pausenlänge, kein Zähler verpasster Tage
  await expect(page.getByText(/Tage|Tagen|verpasst/)).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Wiederholen' })).toBeVisible();
});

test('Diagnose: ohne Punkte, mit Halbzeit, Ergebnis mit Empfehlung zum Üben', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Wo stehe ich?' }).click();
  await expect(page.getByText(/keine Note und keine Punkte/)).toBeVisible();
  await page.getByRole('button', { name: "Los geht's" }).click();

  let halbzeit = 0;
  for (let i = 0; i < 40; i++) {
    if (await page.getByText('Hier stehst du – hier geht es weiter').isVisible()) break;
    if (await page.getByText(/^Halbzeit!/).isVisible()) {
      halbzeit += 1;
      await page.getByRole('button', { name: 'Weiter', exact: true }).click();
      continue;
    }
    // Während der Diagnose keine Wertung
    await expect(page.getByText('Das stimmt noch nicht.')).toHaveCount(0);
    await page.getByRole('button', { name: 'Weiß ich nicht' }).click();
  }
  expect(halbzeit).toBe(1);
  await expect(page.getByText('Hier stehst du – hier geht es weiter')).toBeVisible();
  await expect(page.getByText(/Punkte|%/)).toHaveCount(0);

  // „Weiß ich nicht“ landet nicht in der Fehlerwerkstatt
  await page.getByRole('button', { name: 'Üben' }).first().click();
  await expect(page.getByRole('button', { name: 'Prüfen' })).toBeVisible();
  await page.getByRole('button', { name: /Zurück/ }).click();
  await page.goto('./');
  await expect(page.getByRole('button', { name: 'Fehlerwerkstatt' })).toHaveCount(0);
});

test('Mein Stand und Rückweg: nach drei Fehlern eine Voraussetzung vorschlagen', async ({
  page,
}) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Mein Stand' }).click();
  await expect(page.getByText(/Du hast noch nichts geübt/)).toBeVisible();
  await page.getByRole('button', { name: /Zurück/ }).click();

  await page.getByRole('button', { name: 'Üben', exact: true }).click();
  // Ohne Vorwissen ist eine Kompetenz ohne Voraussetzungen empfohlen
  await expect(page.getByRole('button', { name: /^Große Zahlen und Stellenwerte/ })).toContainText(
    'empfohlen',
  );
  await page.getByRole('button', { name: /^Addieren und Subtrahieren/ }).click();
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
  await page.getByRole('button', { name: 'Mein Stand' }).click();
  await expect(page.getByRole('heading', { name: 'In Arbeit (1)' })).toBeVisible();
});

test('Elternbereich: PIN, Wiederherstellungscode, beide Ansichten, Transparenz', async ({
  page,
}) => {
  await page.goto('./');
  // etwas üben, damit es etwas zu berichten gibt
  await page.getByRole('button', { name: 'Üben', exact: true }).click();
  await page.getByRole('button', { name: /^Addieren und Subtrahieren/ }).click();
  await page.getByLabel('Deine Antwort').fill('0');
  await page.getByRole('button', { name: 'Prüfen' }).click();
  await page.getByRole('button', { name: /Zurück/ }).click();
  await expect(page.getByRole('button', { name: /^Addieren und Subtrahieren/ })).toContainText(
    'in Arbeit',
  );
  await page.goto('./');

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

  // Einfache Ansicht ist Standard: Themen und Wochen, keine einzelnen Aufgaben
  await expect(page.getByRole('cell', { name: 'Addieren und Subtrahieren' })).toBeVisible();
  await expect(page.getByText('Die letzten 100 Aufgaben')).toHaveCount(0);
  await page.getByRole('button', { name: 'Ausführliche Ansicht' }).click();
  await expect(page.getByText('Die letzten 100 Aufgaben')).toBeVisible();
  await expect(page.getByRole('cell', { name: /falsch/ }).first()).toBeVisible();

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
  await expect(page.getByRole('button', { name: 'Ausführliche Ansicht' })).toBeVisible();

  // Transparenz: Jugendliche sehen dasselbe unter „Mein Stand“
  await page.getByRole('button', { name: /Zurück/ }).click();
  await page.getByRole('button', { name: 'Mein Stand' }).click();
  await page.getByText('Was meine Eltern sehen').click();
  await expect(page.getByRole('cell', { name: 'Addieren und Subtrahieren' })).toBeVisible();
});

test('Sicherung: erstellen, auf einem neuen Gerät einspielen, PIN mit Vermerk (D-15)', async ({
  page,
  browser,
  baseURL,
}) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Üben', exact: true }).click();
  await page.getByRole('button', { name: /^Addieren und Subtrahieren/ }).click();
  await page.getByLabel('Deine Antwort').fill('0');
  await page.getByRole('button', { name: 'Prüfen' }).click();
  await page.getByRole('button', { name: /Zurück/ }).click();
  await expect(page.getByRole('button', { name: /^Addieren und Subtrahieren/ })).toContainText(
    'in Arbeit',
  );
  await page.goto('./');
  await page.getByRole('button', { name: 'Für Eltern' }).click();
  await page.getByLabel('PIN', { exact: true }).fill('4711');
  await page.getByLabel('PIN wiederholen').fill('4711');
  await page.getByRole('button', { name: 'PIN festlegen' }).click();
  await page.getByRole('button', { name: 'Ich habe den Code aufgeschrieben' }).click();
  await expect(page.getByText('Letzte Sicherung: noch keine.')).toBeVisible();
  await page.getByRole('button', { name: /Zurück/ }).click();

  // Sicherung erstellen: sechs Wörter, Datei herunterladen
  await page.getByRole('button', { name: 'Sicherung', exact: true }).click();
  await page.getByRole('button', { name: 'Sicherung erstellen' }).click();
  const code = (await page.getByTestId('sicherungscode').innerText()).trim();
  expect(code.split(' ')).toHaveLength(6);
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Code notiert – Datei speichern' }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^bastion-sicherung-\d{4}-\d{2}-\d{2}\.bastion$/);
  const pfad = await download.path();

  // Neues Gerät: leerer Speicher
  const neu = await browser.newContext(baseURL ? { baseURL } : {});
  const seite = await neu.newPage();
  await seite.goto('./');
  await seite.getByRole('button', { name: 'Sicherung', exact: true }).click();
  await seite.getByLabel(/Sicherungsdatei/).setInputFiles(pfad);
  await seite.getByLabel(/Sicherungscode/).fill('apfel apfel apfel apfel apfel apfel');
  await seite.getByRole('button', { name: 'Einspielen' }).click();
  await expect(seite.getByText(/Der Code passt nicht/)).toBeVisible();
  await seite.getByLabel(/Sicherungscode/).fill(code.toUpperCase().replaceAll(' ', '-'));
  await seite.getByRole('button', { name: 'Einspielen' }).click();
  await expect(seite.getByText(/Fertig\. Übernommen: 3 Einträge/)).toBeVisible();
  // Nochmal einspielen: nichts kommt doppelt (D-10)
  await seite.getByLabel(/Sicherungscode/).fill(code);
  await seite.getByRole('button', { name: 'Einspielen' }).click();
  await expect(seite.getByText(/Alles aus dieser Sicherung war schon da/)).toBeVisible();
  await seite.getByRole('button', { name: /Zurück/ }).click();

  await seite.getByRole('button', { name: 'Mein Stand' }).click();
  await expect(seite.getByRole('heading', { name: 'In Arbeit (1)' })).toBeVisible();

  // Die alte PIN gilt hier nicht – neue PIN, dauerhafter Vermerk
  await seite.getByRole('button', { name: /Zurück/ }).click();
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
  await seite.reload();
  await seite.getByRole('button', { name: 'Für Eltern' }).click();
  await seite.getByLabel('PIN', { exact: true }).fill('1357');
  await seite.getByRole('button', { name: 'Öffnen' }).click();
  await expect(seite.getByLabel(/An eine Sicherung erinnern/)).toHaveValue('0');
  await seite.reload();
  await seite.getByRole('button', { name: 'Mein Stand' }).click();
  await seite.locator('summary', { hasText: 'Was meine Eltern sehen' }).click();
  await expect(seite.getByText(vermerk)).toBeVisible();
  await neu.close();
});

test('Fertig für heute: Abschluss zeigt, was heute geübt wurde', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Üben', exact: true }).click();
  await page.getByRole('button', { name: /^Addieren und Subtrahieren/ }).click();
  await expect(page.getByRole('button', { name: 'Fertig für heute' })).toHaveCount(0);
  await page.getByLabel('Deine Antwort').fill('0');
  await page.getByRole('button', { name: 'Prüfen' }).click();
  await page.getByRole('button', { name: 'Fertig für heute' }).click();
  await expect(page.getByRole('heading', { name: 'Was du heute gekonnt hast' })).toBeVisible();
  await expect(
    page.getByRole('listitem').filter({ hasText: /^Addieren und Subtrahieren · / }),
  ).toHaveCount(1);
  await expect(page.getByText('1 Aufgabe bearbeitet')).toBeVisible();
  await expect(page.getByText(/Für heute ist das gut/)).toBeVisible();
  await page.getByRole('button', { name: 'Zur Startseite' }).click();
  await expect(page.getByRole('button', { name: 'Üben', exact: true })).toBeVisible();
});
