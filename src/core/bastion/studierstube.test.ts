import { describe, expect, it } from 'vitest';
import type { BuchungEreignis } from '../ledger/buchung';
import { buecher } from './studierstube';

const buchung = (teil: Partial<BuchungEreignis>): BuchungEreignis => ({
  id: `X${Math.random()}`,
  art: 'buchung',
  v: 1,
  profil: 'P',
  ts: 0,
  tag: '2026-11-01',
  geraet: 'g',
  ressource: 'bauplan',
  menge: 1,
  grund: 'kompetenz-gefestigt',
  bezug: 'M.ZO.BR.ERWEITERN@G',
  aufschluesselung: {},
  regel: 1,
  ...teil,
});

describe('Studierstube (B-6)', () => {
  it('ein Buch je gefestigter Kompetenz und Niveau, ältestes zuerst', () => {
    expect(
      buecher([
        buchung({ bezug: 'M.GM.FL.DREIECK@M', tag: '2026-11-09' }),
        buchung({ bezug: 'M.ZO.BR.ERWEITERN@G', tag: '2026-11-01' }),
        buchung({ bezug: 'M.ZO.BR.ERWEITERN@M', tag: '2026-11-05' }),
      ]),
    ).toEqual([
      { kompetenz: 'M.ZO.BR.ERWEITERN', niveau: 'G', seit: '2026-11-01' },
      { kompetenz: 'M.ZO.BR.ERWEITERN', niveau: 'M', seit: '2026-11-05' },
      { kompetenz: 'M.GM.FL.DREIECK', niveau: 'M', seit: '2026-11-09' },
    ]);
  });

  it('kostenlos: ausgegebene Baupläne nehmen kein Buch weg; andere Buchungen zählen nicht', () => {
    const b = buecher([
      buchung({}),
      buchung({ menge: -1, grund: 'bau-beginn', bezug: 'bau-beginn.V1' }),
      buchung({ ressource: 'stein', menge: 12, grund: 'sitzung', bezug: 'S1' }),
      buchung({}), // dieselbe Buchung noch einmal (z. B. nach dem Zusammenführen)
    ]);
    expect(b).toHaveLength(1);
  });
});
