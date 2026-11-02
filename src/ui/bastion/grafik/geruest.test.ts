import { describe, expect, it } from 'vitest';
import { geruestEbenen } from './geruest';

describe('Gerüst in Abschnitten (G4)', () => {
  it('eine Ebene je Bauschritt, 2 bis 6 Ebenen', () => {
    expect(geruestEbenen(1, 0)).toEqual({ ebenen: 2, fertig: 0 });
    expect(geruestEbenen(3, 0)).toEqual({ ebenen: 3, fertig: 0 });
    expect(geruestEbenen(12, 0).ebenen).toBe(6);
  });

  it('wächst mit dem Fortschritt und ist am Ende voll', () => {
    expect(geruestEbenen(3, 1)).toEqual({ ebenen: 3, fertig: 1 });
    expect(geruestEbenen(3, 2)).toEqual({ ebenen: 3, fertig: 2 });
    expect(geruestEbenen(3, 3)).toEqual({ ebenen: 3, fertig: 3 });
    expect(geruestEbenen(12, 6)).toEqual({ ebenen: 6, fertig: 3 });
    // ein Bauschritt von vielen: schon eine Ebene sichtbar
    expect(geruestEbenen(12, 1)).toEqual({ ebenen: 6, fertig: 1 });
  });

  it('bleibt in den Grenzen bei ungewöhnlichen Werten', () => {
    expect(geruestEbenen(0, 0)).toEqual({ ebenen: 2, fertig: 0 });
    expect(geruestEbenen(2, 5)).toEqual({ ebenen: 2, fertig: 2 });
    expect(geruestEbenen(2, -1)).toEqual({ ebenen: 2, fertig: 0 });
  });
});
