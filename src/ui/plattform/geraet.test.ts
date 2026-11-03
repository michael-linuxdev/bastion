import { describe, expect, it } from 'vitest';
import de from '../texte/de.json';
import {
  ANLEITUNGEN,
  erkenneGeraet,
  schritte,
  sperreZeigen,
  variante,
  type Variante,
} from './geraet';

const UA = {
  iphoneSafari:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  iphoneChrome:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0 Mobile/15E148 Safari/604.1',
  ipadAlsMac:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  androidChrome:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36',
  samsung:
    'Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0 Mobile Safari/537.36',
  whatsapp:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0 Mobile Safari/537.36 WhatsApp/2.24',
  desktopChrome:
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  desktopEdge:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36 Edg/126.0',
};

describe('Gerät erkennen (O14)', () => {
  it('erkennt die häufigen Fälle', () => {
    expect(erkenneGeraet(UA.iphoneSafari)).toEqual({ system: 'ios', browser: 'safari' });
    expect(erkenneGeraet(UA.iphoneChrome)).toEqual({ system: 'ios', browser: 'chrome' });
    expect(erkenneGeraet(UA.androidChrome)).toEqual({ system: 'android', browser: 'chrome' });
    expect(erkenneGeraet(UA.samsung)).toEqual({ system: 'android', browser: 'samsung' });
    expect(erkenneGeraet(UA.whatsapp).browser).toBe('inapp');
    expect(erkenneGeraet(UA.desktopChrome)).toEqual({ system: 'desktop', browser: 'chrome' });
    expect(erkenneGeraet(UA.desktopEdge)).toEqual({ system: 'desktop', browser: 'edge' });
  });

  it('erkennt das iPad, das sich als Mac meldet, an den Berührpunkten', () => {
    expect(erkenneGeraet(UA.ipadAlsMac, 'MacIntel', 5).system).toBe('ios');
    expect(erkenneGeraet(UA.ipadAlsMac, 'MacIntel', 0).system).toBe('desktop');
  });

  it('wählt eine passende Anleitung, mit Rückfall', () => {
    expect(variante({ system: 'ios', browser: 'safari' })).toBe('ios-safari');
    expect(variante({ system: 'ios', browser: 'opera' })).toBe('ios-other');
    expect(variante({ system: 'android', browser: 'inapp' })).toBe('inapp');
    expect(variante({ system: 'desktop', browser: 'firefox' })).toBe('desktop-other');
  });

  it('hat für jeden Schritt jeder Anleitung einen Text', () => {
    const texte: Record<string, string> = de;
    for (const v of Object.keys(ANLEITUNGEN) as Variante[])
      for (const s of schritte(v)) expect(texte[s], s).toBeTruthy();
  });

  it('sperrt nur auf Handy und Tablet, nicht installiert, solange nicht „weiter“ gewählt', () => {
    const handy = { system: 'ios', browser: 'safari' } as const;
    expect(sperreZeigen(handy, false, false)).toBe(true);
    expect(sperreZeigen(handy, true, false)).toBe(false);
    expect(sperreZeigen(handy, false, true)).toBe(false);
    expect(sperreZeigen({ system: 'desktop', browser: 'chrome' }, false, false)).toBe(false);
  });
});
