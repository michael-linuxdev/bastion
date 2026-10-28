<script lang="ts">
  // Setzt gefüllte Vorlagentexte zusammen – nur Textknoten, nie HTML aus Inhalten.
  import type { Textteil } from '../../core/learning/text';
  import { t } from '../texte/texte';

  let { teile }: { teile: readonly Textteil[] } = $props();
</script>

{#each teile as teil, i (i)}
  {#if teil.art === 'text'}
    {#if teil.fett}<strong>{teil.text}</strong>{:else}{teil.text}{/if}
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
