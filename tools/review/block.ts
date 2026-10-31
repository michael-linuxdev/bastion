// Review-Block in einer Inhaltsdatei setzen (INHALTSFORMAT §8). Rein: Text rein, Text raus.
// Ein vorhandener Block oben in der Datei (Schlüssel `review:` ohne Einrückung) wird
// ersetzt, sonst kommt der neue ans Ende. Der Rest der Datei bleibt Zeichen für Zeichen gleich.
import { stringify } from 'yaml';
import type { Review } from '../../src/core/learning/review';

export function setzeReviewBlock(text: string, review: Review): string {
  const zeilen = text.replace(/\n+$/, '').split('\n');
  const start = zeilen.findIndex((z) => /^review:/.test(z));
  if (start >= 0) {
    let ende = start + 1;
    while (ende < zeilen.length && /^(\s|$)/.test(zeilen[ende] ?? '')) ende++;
    zeilen.splice(start, ende - start);
  }
  const block = stringify({
    review: {
      stufe: review.stufe,
      datum: review.datum,
      pruefer: review.pruefer,
      hash: review.hash,
    },
  }).trimEnd();
  return `${zeilen.join('\n')}\n${block}\n`;
}
