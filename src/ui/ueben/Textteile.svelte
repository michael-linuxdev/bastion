<script lang="ts">
  // Setzt gefüllte Vorlagentexte zusammen – nur Textknoten, nie HTML aus Inhalten. Ausnahme:
  // Formeln ab Klasse 9 setzt KaTeX (Formel.svelte, T-22).
  // Fachbegriffe sind antippbar und zeigen ihre Erklärung direkt dahinter (L-7).
  import type { Textteil } from '../../core/learning/text';
  import { t } from '../texte/texte';
  import { begriffeHolen } from './begriffe';
  import Formel from './Formel.svelte';

  let {
    teile,
    erklaeren = true,
  }: {
    teile: readonly Textteil[];
    /** false z. B. in der Diagnose: dort gibt es keine Hilfen (LEHRPLAN §7) */
    erklaeren?: boolean;
  } = $props();

  const begriffe = begriffeHolen();

  /**
   * L15: Rechenzeichen nicht vom Nachbarn trennen. Die Leerzeichen um + − · × : = < >
   * werden geschützt, damit „3/4 + 1/4“ oder „900 + 6171“ nicht mitten im Term umbricht.
   */
  const gebunden = (text: string) => text.replace(/ ([+−·×:=<>≈]) /g, '\u00a0$1\u00a0');
  let offen = $state<number | undefined>(undefined);
</script>

{#each teile as teil, i (i)}
  {#if teil.art === 'text'}
    {#if teil.fett}<strong>{gebunden(teil.text)}</strong>{:else}{gebunden(teil.text)}{/if}
  {:else if teil.art === 'begriff'}
    {@const b = erklaeren ? begriffe?.karte?.get(teil.text) : undefined}
    {#if b}
      <button
        class="begriff"
        class:fett={teil.fett}
        aria-expanded={offen === i}
        title={t('begriff.antippen')}
        onclick={() => (offen = offen === i ? undefined : i)}>{teil.text}</button
      >{#if offen === i}<span class="erklaerung" role="note"
          ><strong>{b.wort.de}:</strong> {b.erklaerung.de}</span
        >{/if}
    {:else if teil.fett}<strong>{teil.text}</strong>{:else}{teil.text}{/if}
  {:else if teil.art === 'bruch'}
    <!-- Brüche einheitlich mit KaTeX (PV, 02.11.2026) -->
    <Formel tex={`\\frac{${teil.zaehler}}{${teil.nenner}}`} />
  {:else if teil.art === 'hoch'}
    <sup>{teil.text}</sup>
  {:else if teil.art === 'formel'}
    <Formel tex={teil.tex} />
  {:else}
    <span class="wurzel" aria-label="{t('text.wurzel-aus')} {teil.text}"
      >√<span class="radikand">{teil.text}</span></span
    >
  {/if}
{/each}

<style>
  /* C5 (Q-O1): Tippfläche mindestens 44 px hoch über padding-block; der negative Rand hält
     die Zeile ruhig, damit der Text nicht springt. Der helle Grund zeigt: antippbar (L-7). */
  .begriff {
    font: inherit;
    color: inherit;
    vertical-align: baseline;
    min-block-size: 2.75rem;
    padding-block: 0.45rem;
    margin-block: -0.45rem;
    padding-inline: 0.15em;
    margin-inline: -0.05em;
    border: none;
    border-radius: 0.3em;
    background: color-mix(in srgb, var(--farbe-akzent) 12%, transparent);
    background-clip: content-box;
    cursor: pointer;
    text-decoration: underline dotted;
    text-decoration-color: var(--farbe-akzent);
    text-decoration-thickness: 0.1em;
    text-underline-offset: 0.2em;
  }

  .begriff.fett {
    font-weight: bold;
  }

  .begriff:focus-visible {
    outline: 2px solid var(--farbe-akzent);
    outline-offset: 2px;
  }

  .erklaerung {
    display: block;
    margin-block: var(--abstand-s);
    padding-block: var(--abstand-s);
    padding-inline: var(--abstand-m);
    border-inline-start: 4px solid var(--farbe-akzent);
    background: var(--farbe-flaeche);
    font-size: 1rem;
    font-weight: normal;
  }

  .radikand {
    border-block-start: 0.08em solid currentColor;
    padding-inline: 0.1em;
  }
</style>
