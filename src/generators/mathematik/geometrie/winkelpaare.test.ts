import type { Instanz } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { BEZIEHUNGEN, winkelpaarBenennen, winkelpaarGroesse } from './winkelpaare';

// Unabhängig: die beiden Winkelbögen aus dem SVG lesen (zuerst α, dann β) und
// Scheitel, Größe und Startrichtung jedes Bogens geometrisch zurückrechnen.
interface Bogen {
  mx: number;
  my: number;
  groesse: number;
  start: number;
}
function boegen(i: Instanz): Bogen[] {
  return [
    ...(i.bild?.svg ?? '').matchAll(
      /d="M([-\d.]+) ([-\d.]+) A([\d.]+) [\d.]+ 0 0 0 ([-\d.]+) ([-\d.]+)"/g,
    ),
  ].map((m) => {
    // In mathematische Koordinaten (y nach oben) umrechnen.
    const [x1, y1, rad, x2, y2] = [
      Number(m[1]),
      -Number(m[2]),
      Number(m[3]),
      Number(m[4]),
      -Number(m[5]),
    ];
    const [dx, dy] = [x2 - x1, y2 - y1];
    const sehne = Math.hypot(dx, dy);
    const h = Math.sqrt(Math.max(rad * rad - (sehne / 2) ** 2, 0));
    // Gegen den Uhrzeigersinn → Mittelpunkt links der Sehne
    const mx = (x1 + x2) / 2 - (h * dy) / sehne;
    const my = (y1 + y2) / 2 + (h * dx) / sehne;
    const start = ((((Math.atan2(y1 - my, x1 - mx) * 180) / Math.PI) % 360) + 360) % 360;
    return {
      mx,
      my,
      groesse: (2 * Math.asin(Math.min(sehne / (2 * rad), 1)) * 180) / Math.PI,
      start,
    };
  });
}
const nah = (a: number, b: number) => Math.abs(a - b) < 0.5;

function beziehungAusBild(i: Instanz): string {
  const [a, b] = boegen(i) as [Bogen, Bogen];
  const selberPunkt = nah(a.mx, b.mx) && nah(a.my, b.my);
  const gegenueber = nah(Math.abs(a.start - b.start), 180);
  if (selberPunkt) return gegenueber ? 'Scheitelwinkel' : 'Nebenwinkel';
  return nah(a.start, b.start) ? 'Stufenwinkel' : gegenueber ? 'Wechselwinkel' : '?';
}

const G = { beziehungen: ['Scheitelwinkel', 'Nebenwinkel'] as const };
const M = { beziehungen: BEZIEHUNGEN };

pflichttests(winkelpaarGroesse, {
  niveaus: { G, M },
  unabhaengigeLoesung: (i) => ({ typ: 'zahl', wert: Math.round((boegen(i)[1] as Bogen).groesse) }),
  grenzverletzungen(i) {
    const alpha = Number(i.platzhalter['alpha']);
    const fehler = alpha >= 40 && alpha <= 80 ? [] : [`α = ${alpha}`];
    const name = (i.platzhalter['beziehung'] as { de: string }).de;
    if (beziehungAusBild(i) !== name)
      fehler.push(`Bild zeigt ${beziehungAusBild(i)}, Text sagt ${name}`);
    return fehler;
  },
  mindestensVerschieden: { G: 20, M: 35 }, // gemessen: G ≥ 24, M ≥ 39 (9 Winkel × Lagen)
});

pflichttests(winkelpaarBenennen, {
  niveaus: { G, M },
  unabhaengigeLoesung: (i) => ({
    typ: 'auswahl',
    wert: (i.optionen ?? []).findIndex((o) => o.text?.de === beziehungAusBild(i)),
  }),
  grenzverletzungen: (i, p) =>
    (i.optionen ?? []).length === p.beziehungen.length ? [] : ['falsche Zahl an Optionen'],
  mindestensVerschieden: { G: 20, M: 35 }, // gemessen: G ≥ 24, M ≥ 39 (9 Winkel × Lagen)
});
