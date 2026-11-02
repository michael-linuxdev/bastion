<script lang="ts">
  // Text aus einem Generator (Lösungsweg, Antwort, Antwortmöglichkeit): Rechenausdrücke wie
  // „3/4 + 1/4“ oder „√25“ erscheinen als Formel mit KaTeX (PV, 02.11.2026), der Rest als Text.
  import type { Wert } from '../../core/learning/generator';
  import { alsFormeln } from '../../core/learning/rechenausdruck';
  import { fuelle } from '../../core/learning/text';
  import Textteile from './Textteile.svelte';

  let {
    text,
    platzhalter = {},
    erklaeren = true,
  }: {
    text: string;
    platzhalter?: Readonly<Record<string, Wert>>;
    erklaeren?: boolean;
  } = $props();
</script>

<Textteile teile={fuelle(alsFormeln(text), platzhalter)} {erklaeren} />
