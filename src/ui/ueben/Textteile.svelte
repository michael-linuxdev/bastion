<script lang="ts">
  // Setzt gefüllte Vorlagentexte zusammen – nur Textknoten, nie HTML aus Inhalten.
  // Fachbegriffe sind antippbar und zeigen ihre Erklärung direkt dahinter (L-7).
  import type { Textteil } from '../../core/learning/text';
  import { t } from '../texte/texte';
  import { begriffeHolen } from './begriffe';

  let {
    teile,
    erklaeren = true,
  }: {
    teile: readonly Textteil[];
    /** false z. B. in der Diagnose: dort gibt es keine Hilfen (LEHRPLAN §7) */
    erklaeren?: boolean;
  } = $props();

  const begriffe = begriffeHolen();
  let offen = $state<number | undefined>(undefined);
</script>

{#each teile as teil, i (i)}
  {#if teil.art === 'text'}
    {#if teil.fett}<strong>{teil.text}</strong>{:else}{teil.text}{/if}
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
    <span class="bruch" role="math" aria-label="{teil.zaehler}/{teil.nenner}">
      <span class="zaehler">{teil.zaehler}</span><span class="nenner">{teil.nenner}</span>
    </span>
  {:else if teil.art === 'hoch'}
    <sup>{teil.text}</sup>
  {:else}
    <span class="wurzel" aria-label="{t('text.wurzel-aus')} {teil.text}"
      >√<span class="radikand">{teil.text}</span></span
    >
  {/if}
{/each}

<style>
  .begriff {
    font: inherit;
    color: inherit;
    background: none;
    border: none;
    padding: 0;
    cursor: help;
    text-decoration: underline dotted;
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

  .bruch {
    display: inline-flex;
    flex-direction: column;
    vertical-align: middle;
    text-align: center;
    margin-inline: 0.15em;
    line-height: 1.1;
  }

  .zaehler {
    border-block-end: 0.1em solid currentColor;
    padding-inline: 0.15em;
  }

  .radikand {
    border-block-start: 0.08em solid currentColor;
    padding-inline: 0.1em;
  }
</style>
