import { describe, expect, it } from 'vitest';
import { begriffskarte } from '../../src/core/learning/begriffe';
import { markiereDeZeilen } from './begriffe-zeilen';

const karte = begriffskarte([
  { id: 'anteil', formen: ['Anteil'], erklaerung: { de: 'Teil vom Ganzen' } },
]);

describe('Begriffe in de-Zeilen markieren (pnpm inhalte:begriffe)', () => {
  it('markiert einfache Zeilen und setzt sie in Anführungszeichen', () => {
    expect(markiereDeZeilen('    de: Der Anteil zählt.\n', karte)).toBe(
      "    de: 'Der [[Anteil]] zählt.'\n",
    );
  });

  it('lässt das Komma hinter dem Wert stehen (mehrzeilige Kurzform)', () => {
    const zeile = "                de: 'Nein, der Anteil zählt.',\n";
    expect(markiereDeZeilen(zeile, karte)).toBe(
      "                de: 'Nein, der [[Anteil]] zählt.',\n",
    );
  });

  it('ändert nichts ohne Begriff und verdoppelt Apostrophe richtig', () => {
    expect(markiereDeZeilen("de: 'Kein Begriff.',\n", karte)).toBe("de: 'Kein Begriff.',\n");
    expect(markiereDeZeilen("de: 'Tom''s Anteil'\n", karte)).toBe("de: 'Tom''s [[Anteil]]'\n");
  });
});
