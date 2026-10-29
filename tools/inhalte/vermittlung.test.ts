// Erstvermittlung und Fehlerkatalog im Zusammenspiel mit den echten Inhalten
// (INHALTSFORMAT §15, §16): eine Kopie von content/ mit einer Beispiel-Sequenz.
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { stringify } from 'yaml';
import { generatoren } from '../../src/generators/alle';
import { anleitungsBilder } from '../../src/generators/anleitungen';
import { pruefeInhalte } from './pruefen';

const ordner = mkdtempSync(join(tmpdir(), 'bastion-inhalte-'));
cpSync('content', ordner, { recursive: true });
afterAll(() => rmSync(ordner, { recursive: true, force: true }));

const ERWEITERN = join(
  ordner,
  'mathematik/zahl-und-operation/brueche-und-dezimalzahlen/M.ZO.BR.ERWEITERN',
);
const t = (de: string) => ({ de });

const sequenz = {
  id: 'M.ZO.BR.ERWEITERN',
  kompetenz: 'M.ZO.BR.ERWEITERN',
  niveau: 'G',
  dauer_min: 10,
  herkunft: 'ki-entwurf',
  version: 1,
  schritte: [
    {
      id: 'ziel',
      typ: 'ziel',
      text: t('Danach kannst du gleich große Anteile anders schreiben.'),
      weiter: 'erklaeren-erweitern',
    },
    {
      id: 'erklaeren-erweitern',
      typ: 'erklaeren',
      text: t('Feiner teilen ändert nicht, wie viel gefärbt ist.'),
      weiter: 'erklaeren-kuerzen',
    },
    {
      id: 'erklaeren-kuerzen',
      typ: 'erklaeren',
      text: t('Rückwärts geht es auch: gröber teilen.'),
      weiter: 'beispiel',
    },
    {
      id: 'beispiel',
      typ: 'beispiel',
      text: t('Aus 2 von 3 werden 4 von 6.'),
      weiter: 'ergaenzen',
    },
    {
      id: 'ergaenzen',
      typ: 'ergaenzen',
      text: t('Aus 1 von 2 werden wie viele von 4?'),
      antwort: { eingabe: { art: 'zahl', loesung: '2' } },
      weiter: 'gegenbeispiel',
    },
    {
      id: 'gegenbeispiel',
      typ: 'gegenbeispiel',
      text: t('Tim macht aus 1 von 2 einfach 2 von 3. Stimmt das?'),
      antwort: {
        optionen: [
          { wert: t('Nein'), richtig: true },
          { wert: t('Ja'), fv: 'FV.BR.ADDIERT' },
        ],
      },
      weiter: 'merksatz',
    },
    {
      id: 'merksatz',
      typ: 'merksatz',
      text: t('Oben und unten mit derselben Zahl malnehmen.'),
      weiter: 'pruefen',
    },
    {
      id: 'pruefen',
      typ: 'pruefen',
      text: t('Was ist genauso viel wie 3 von 4?'),
      antwort: {
        optionen: [
          { wert: t('6 von 8'), richtig: true },
          { wert: t('4 von 5'), fv: 'FV.BR.ADDIERT' },
        ],
      },
      weiter: 'uebergang',
      bei: { 'FV.BR.ADDIERT': 'erklaeren-erweitern' },
    },
    {
      id: 'uebergang',
      typ: 'uebergang',
      text: t('Jetzt du.'),
      vorlagen: ['M.ZO.BR.ERWEITERN.ZIELNENNER'],
      anzahl: 3,
    },
  ],
};

const fehlvorstellung = {
  id: 'FV.BR.ADDIERT',
  name: t('Addiert statt malzunehmen'),
  art: 'falsche-regel',
  beschreibung: t('Überträgt das Plusrechnen auf oben und unten.'),
  kompetenzen: ['M.ZO.BR.ERWEITERN'],
  erklaerung: {
    kurz: t('Hier wird malgenommen, nicht addiert.'),
    lang: [
      { teil: 'so-denkst-du', de: 'Du hast oben und unten dieselbe Zahl addiert.' },
      { teil: 'warum-nicht', de: 'Dann ändert sich, wie viel gefärbt ist.' },
      { teil: 'so-stimmt-es', de: 'Nimm oben und unten mit derselben Zahl mal.' },
    ],
  },
  gegenbeispiel: t('1 von 2 ist die Hälfte, 2 von 3 ist mehr.'),
  rueckweg: { vermittlung: 'M.ZO.BR.ERWEITERN#erklaeren-erweitern' },
  kontrast: ['M.ZO.BR.ERWEITERN.ZIELNENNER'],
  herkunft: 'ki-entwurf',
  version: 1,
};

function pruefen() {
  return pruefeInhalte(
    ordner,
    generatoren,
    new Map([...anleitungsBilder].map(([id, a]) => [id, a.bilder().length])),
  );
}

describe('Erstvermittlung und Fehlerkatalog in den Inhalten', () => {
  it('eine gültige Sequenz mit Fehlvorstellung wird gefunden und angenommen', () => {
    writeFileSync(join(ERWEITERN, 'vermittlung.yaml'), stringify(sequenz));
    mkdirSync(join(ordner, 'mathematik/fehlvorstellungen'), { recursive: true });
    writeFileSync(
      join(ordner, 'mathematik/fehlvorstellungen/FV.BR.ADDIERT.yaml'),
      stringify(fehlvorstellung),
    );
    const bericht = pruefen();
    expect(bericht.fehler).toEqual([]);
    expect(bericht.vermittlungen.map((v) => v.id)).toContain('M.ZO.BR.ERWEITERN');
    expect(bericht.fehlvorstellungen.map((f) => f.id)).toContain('FV.BR.ADDIERT');
  });

  it('meldet einen Rückweg auf einen fehlenden Schritt und ein Fehlerbild mit unbekannter fv', () => {
    writeFileSync(
      join(ordner, 'mathematik/fehlvorstellungen/FV.BR.ADDIERT.yaml'),
      stringify({ ...fehlvorstellung, rueckweg: { vermittlung: 'M.ZO.BR.ERWEITERN#weg' } }),
    );
    const vorlage = join(ERWEITERN, 'vorlagen/zielnenner.yaml');
    writeFileSync(
      vorlage,
      readFileSync(vorlage, 'utf8').replace('fv: FV.BR.ADDITIV', 'fv: FV.BR.GIBTS-NICHT'),
    );
    const fehler = pruefen().fehler.join('\n');
    expect(fehler).toContain('Schritt weg fehlt in der Erstvermittlung von M.ZO.BR.ERWEITERN');
    expect(fehler).toContain('verweist auf unbekannte Fehlvorstellung FV.BR.GIBTS-NICHT');
  });
});
