// Simulator ausführen: pnpm sim – Bericht zu BASEBAU §8 auf der Konsole.
import { auswerten, PROFILE, simuliere } from './simulator.ts';

const monate = (tag?: number) => (tag === undefined ? '–' : (tag / 30.4).toFixed(1));
for (const p of PROFILE) {
  const a = auswerten(simuliere(p));
  console.log(
    [
      `${p.id} ${p.name}`,
      `  Epoche 1 nach ${monate(a.epocheTag)} Monaten · erstes Gebäude an Tag ${a.erstesGebaeude ?? '–'} · Lerntage ${a.lerntage} · Aufgaben ${a.aufgaben}`,
      `  Jahr 1 erworben: ${a.jahr1.fleiss} Fleiß, ${a.jahr1.behalten} Behalten, ${a.jahr1.koennen} Können, ${a.jahr1.schritt} Schritte`,
      `  Jahr 1 fertig: ${a.fertigJahr1} Gebäude (${a.zierdeJahr1} Zierde) · größte Lücke ${a.lueckeJahr1} Tage (ohne Zierde ${a.lueckeOhneZierdeJahr1})`,
      `  Wochen mit Lernen ohne Fortschritt: ${a.wochenOhneFortschritt} · Belegung nach 12 Mon.: ${a.belegung12} %, nach 24: ${a.belegung} % · Einfassung ${a.einfassung}`,
    ].join('\n'),
  );
}
