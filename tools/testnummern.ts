// Gibt gültige Teilnehmer-Nummern für die Testphase aus (K-14, TESTS.md §3):
// pnpm testnummern [anzahl]. Die Nummern kommen auf Papier, nie ins Repository.
import { teilnehmerNummer } from '../src/core/testphase/teilnehmer.ts';

const anzahl = Math.min(99, Math.max(1, Number(process.argv[2] ?? 20) || 20));
for (let n = 1; n <= anzahl; n++) console.log(teilnehmerNummer(n));
