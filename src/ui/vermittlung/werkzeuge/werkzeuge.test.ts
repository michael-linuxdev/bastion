import { describe, expect, it } from 'vitest';
import { WERKZEUGE } from '../../../core/learning/vermittlung';
import {
  anzahlGefaerbt,
  breiten,
  geteilt,
  startzustand,
  umgeschaltet,
  verfeinert,
} from './bruchstreifen';
import { stelle, striche } from './zahlenstrahl';
import { WERKZEUG_NAMEN } from './index';

describe('Bruchstreifen (bruchstreifen@1)', () => {
  it('startet mit den ersten Teilen gefärbt', () => {
    const z = startzustand({ teile: 4, gefaerbt: 3 });
    expect(z.gefaerbt).toEqual([true, true, true, false]);
  });

  it('verträgt fehlende und unsinnige Parameter', () => {
    expect(startzustand({})).toEqual({ teile: 1, gefaerbt: [false] });
    expect(startzustand({ teile: 3, gefaerbt: 9 }).gefaerbt).toEqual([true, true, true]);
    expect(startzustand({ teile: 500 }).teile).toBe(24);
  });

  it('verfeinern verdoppelt Teile und gefärbte Teile – der Anteil bleibt (Erweitern)', () => {
    const z = verfeinert(startzustand({ teile: 3, gefaerbt: 2 }));
    expect(z.teile).toBe(6);
    expect(anzahlGefaerbt(z)).toBe(4);
    expect(anzahlGefaerbt(z) / z.teile).toBeCloseTo(2 / 3);
  });

  it('färben und neu teilen', () => {
    let z = startzustand({ teile: 1 });
    z = geteilt(z, 4);
    z = umgeschaltet(umgeschaltet(umgeschaltet(z, 0), 1), 2);
    expect(anzahlGefaerbt(z)).toBe(3);
    expect(anzahlGefaerbt(umgeschaltet(z, 1))).toBe(2);
    expect(geteilt(z, 2).gefaerbt).toEqual([true, true]);
  });

  it('gleiche Teile summieren sich zu 1; ungleiche haben ein großes erstes Teil', () => {
    expect(breiten(4).reduce((a, b) => a + b)).toBeCloseTo(1);
    const u = breiten(4, true);
    expect(u.reduce((a, b) => a + b)).toBeCloseTo(1);
    expect(u[0]).toBeGreaterThan(u[1] ?? 1);
  });
});

describe('Zahlenstrahl (zahlenstrahl@1)', () => {
  it('teilt jede Einheit in gleiche Teile und beschriftet ganze Zahlen', () => {
    const s = striche({ von: 0, bis: 2, einteilung: 4 });
    expect(s).toHaveLength(9);
    expect(s.filter((x) => x.ganz).map((x) => x.zaehler)).toEqual([0, 4, 8]);
    expect(s[3]?.lage).toBeCloseTo(3 / 8);
  });

  it('schreibt Stellen als ganze Zahl oder Bruch', () => {
    expect(stelle(3, 4)).toBe('3/4');
    expect(stelle(8, 4)).toBe('2');
  });
});

describe('Werkzeuge', () => {
  it('jedes Werkzeug aus dem Kern hat eine Darstellung in der Oberfläche', () => {
    expect([...WERKZEUG_NAMEN].sort()).toEqual([...WERKZEUGE].sort());
  });
});
