// Verzeichnis der Bilder zu Zeichen-Anleitungen, angesprochen über "id@version"
// aus content/…/anleitungen/*.yaml (LEHRPLAN L-10).
import * as alle from './bilder';
import type { AnleitungsBilder } from './bilder';

const liste = Object.values(alle).filter(
  (x): x is AnleitungsBilder => typeof x === 'object' && x !== null && 'bilder' in x,
);

export const anleitungsBilder: ReadonlyMap<string, AnleitungsBilder> = new Map(
  liste.map((b) => [`${b.id}@${b.version}`, b]),
);
