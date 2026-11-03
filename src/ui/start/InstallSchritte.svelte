<script lang="ts">
  // O14: Schritte zum Installieren für ein Gerät – nummeriert, mit Teilen-Symbol im Text.
  // Bietet der Browser ein eigenes Installieren an, steht „Jetzt installieren“ darüber.
  import { schritte, variante, type Geraet } from '../plattform/geraet';
  import { installation, jetztInstallieren } from '../plattform/installation.svelte';
  import { t, type TextSchluessel } from '../texte/texte';

  let {
    geraet,
    erkannt = false,
    angebot = true,
  }: {
    geraet: Geraet;
    /** „Erkannt: iPhone / iPad · Safari“ darüber zeigen */
    erkannt?: boolean;
    /** „Jetzt installieren“ zeigen, wenn der Browser es anbietet */
    angebot?: boolean;
  } = $props();

  const teile = (s: string) => t(s as TextSchluessel).split('{teilen}');
  const name = $derived(
    `${t(`installieren.system.${geraet.system}`)} · ${t(`installieren.browser.${geraet.browser}`)}`,
  );
</script>

{#if erkannt}
  <p class="erkannt">{t('installieren.erkannt').replace('{geraet}', name)}</p>
{/if}
{#if angebot && installation.angebot}
  <button type="button" class="haupt jetzt" onclick={() => void jetztInstallieren()}
    >{t('installieren.jetzt')}</button
  >
{/if}
<ol class="schritte">
  {#each schritte(variante(geraet)) as s (s)}
    <li>
      {#each teile(s) as stueck, i (i)}{#if i > 0}<svg
            class="teilen"
            viewBox="0 0 24 24"
            role="img"
            aria-label={t('installieren.teilen-symbol')}
            ><path d="M12 3v12M8 7l4-4 4 4M5 12v8h14v-8" /></svg
          >{/if}{stueck}{/each}
    </li>
  {/each}
</ol>

<style>
  .erkannt {
    margin: 0;
    font-size: 0.85rem;
    color: var(--farbe-text-leise);
  }
  .jetzt {
    justify-self: start;
  }
  .schritte {
    counter-reset: s;
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--abstand-s);
  }
  .schritte li {
    position: relative;
    min-block-size: 2rem;
    padding-inline-start: 2.75rem;
    line-height: 1.45;
  }
  .schritte li::before {
    counter-increment: s;
    content: counter(s);
    position: absolute;
    inset-inline-start: 0;
    inset-block-start: -0.1rem;
    inline-size: 2rem;
    block-size: 2rem;
    display: grid;
    place-items: center;
    border-radius: 999px;
    background: var(--farbe-akzent);
    color: var(--farbe-auf-akzent);
    font-weight: 800;
  }
  .teilen {
    display: inline-block;
    inline-size: 1.1em;
    block-size: 1.1em;
    vertical-align: -0.2em;
    margin-inline: 0.15em;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
</style>
