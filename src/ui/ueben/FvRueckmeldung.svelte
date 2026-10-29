<script lang="ts">
  // Rückmeldung zur erkannten Fehlvorstellung (VERMITTLUNG §3.3): beim ersten Mal
  // die kurze Erklärung; bei „vermutet“ und „wieder da“ die lange in drei Teilen,
  // ein Gegenbeispiel und der Rückweg.
  import type { Fehlvorstellung } from '../../core/learning/fehlvorstellung';
  import type { FvZustand } from '../../core/learning/fv-diagnose';
  import { fuelle } from '../../core/learning/text';
  import { t } from '../texte/texte';
  import { WERKZEUG_KOMPONENTEN } from '../vermittlung/werkzeuge';
  import Textteile from './Textteile.svelte';

  let {
    fv,
    zustand,
    rueckweg,
    onrueckweg,
  }: {
    fv: Fehlvorstellung;
    zustand: FvZustand | undefined;
    /** Beschriftung des Rückwegs, falls es einen gibt */
    rueckweg: 'erklaerung' | 'grundlage' | undefined;
    onrueckweg: () => void;
  } = $props();

  const lang = $derived(zustand === 'vermutet' || zustand === 'wieder-da');
</script>

{#if lang}
  <section class="lang" aria-label={fv.name.de}>
    <p class="einstieg">{t(zustand === 'wieder-da' ? 'fv.wieder-da' : 'fv.vermutet')}</p>
    {#each fv.erklaerung.lang as teil (teil.teil)}
      <div class="teil">
        <h3>{t(`fv.${teil.teil}`)}</h3>
        <p><Textteile teile={fuelle(teil.de, {})} /></p>
        {#if teil.bild}
          {@const Bild = WERKZEUG_KOMPONENTEN[teil.bild.werkzeug]}
          {#if Bild}<div class="bild"><Bild parameter={teil.bild.parameter ?? {}} /></div>{/if}
        {/if}
      </div>
    {/each}
    <p>
      <strong>{t('fv.gegenbeispiel')}</strong>
      <Textteile teile={fuelle(fv.gegenbeispiel.de, {})} />
    </p>
    {#if fv.kontrast.length > 0}<p class="leise">{t('fv.kontrast')}</p>{/if}
    {#if rueckweg}
      <button class="zweit" onclick={onrueckweg}
        >{t(rueckweg === 'grundlage' ? 'fv.grundlage' : 'fv.zur-erklaerung')}</button
      >
    {/if}
  </section>
{:else}
  <p class="kurz"><Textteile teile={fuelle(fv.erklaerung.kurz.de, {})} /></p>
{/if}

<style>
  .lang {
    display: grid;
    gap: var(--abstand-s);
    margin-block: var(--abstand-m);
    padding: var(--abstand-m);
    border-radius: var(--radius);
    border-inline-start: 6px solid var(--farbe-akzent);
    background: var(--farbe-flaeche-leise);
  }

  .lang p,
  .lang h3 {
    margin-block: 0;
  }

  h3 {
    font-size: 1rem;
    color: var(--farbe-akzent);
  }

  .einstieg {
    font-weight: 700;
  }

  .teil {
    display: grid;
    gap: 0.25rem;
  }

  .bild {
    max-inline-size: 26rem;
  }

  .lang button {
    justify-self: start;
  }

  .leise {
    color: var(--farbe-text-leise);
  }

  .kurz {
    color: var(--farbe-text-leise);
  }
</style>
