import { describe, expect, it } from 'vitest';
import { oeffnen, verschluesseln } from './sicherung';

const inhalt = {
  format: 1,
  profile: [{ id: 'P', erstellt: 1 }],
  ereignisse: [
    { id: 'E', art: 'aufgabe', v: 1, profil: 'P', ts: 5, tag: '2026-10-28', geraet: 'G' },
  ],
} as never;
const CODE = 'apfel baum hund kuh tisch wal';

describe('Sicherungsdatei', () => {
  it('öffnet sich mit dem richtigen Code – auch anders geschrieben', async () => {
    const datei = await verschluesseln(inhalt, CODE, '2026-10-28');
    expect(new TextDecoder().decode(datei.subarray(0, 7))).toBe('BASTION');
    expect(await oeffnen(datei, CODE)).toEqual(inhalt);
    expect(await oeffnen(datei, ' Apfel-Baum Hund KUH tisch, wal ')).toEqual(inhalt);
  });
  it('bleibt ohne den Code zu', async () => {
    const datei = await verschluesseln(inhalt, CODE, '2026-10-28');
    expect(await oeffnen(datei, 'apfel baum hund kuh tisch ast')).toBe('falscher-code');
    // Inhalt steht nicht im Klartext in der Datei
    expect(new TextDecoder().decode(datei)).not.toContain('aufgabe');
  });
  it('erkennt veränderte und fremde Dateien', async () => {
    const datei = await verschluesseln(inhalt, CODE, '2026-10-28');
    const kopfVeraendert = datei.slice();
    kopfVeraendert[9] = 0x39; // Erstellt-Tag im offenen Kopf
    expect(await oeffnen(kopfVeraendert, CODE)).toBe('falscher-code');
    expect(await oeffnen(new TextEncoder().encode('{"format":1}'), CODE)).toBe('keine-sicherung');
  });
});
