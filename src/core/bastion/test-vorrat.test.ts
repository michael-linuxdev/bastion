import { describe, expect, it } from 'vitest';
import { bastionAus } from './bauen';
import { anzeigeKonto, anzeigeVorrat, probeBeginnen, TEST_MENGE, testKonto } from './test-vorrat';

describe('test-vorrat', () => {
  it('liefert ein virtuelles Konto mit großem Stand', () => {
    const k = testKonto('x');
    expect(k.stand.fleiss).toBe(TEST_MENGE);
    expect(k.erworben.koennen).toBe(TEST_MENGE);
  });

  it('Anzeige wechselt zwischen echt und Test', () => {
    const echt = testKonto('a');
    const klein = { ...echt, stand: { ...echt.stand, fleiss: 3 }, erworben: echt.erworben };
    expect(anzeigeKonto(klein, false).stand.fleiss).toBe(3);
    expect(anzeigeKonto(klein, true).stand.fleiss).toBe(TEST_MENGE);
    expect(anzeigeVorrat(2, true)).toBe(TEST_MENGE);
    expect(anzeigeVorrat(2, false)).toBe(2);
  });

  it('Probe-Bau ändert nur die Kopie, ohne Ledger', () => {
    const start = bastionAus([], []);
    const k = testKonto();
    const r = probeBeginnen(start, k, 'zeichen', {});
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.bastion.bauwerke.some((b) => b.typ === 'zeichen')).toBe(true);
    expect(start.bauwerke.some((b) => b.typ === 'zeichen')).toBe(false);
  });
});
