<script lang="ts">
  // Rückmeldung zur erkannten Fehlvorstellung (VERMITTLUNG §3.3): Titel + Schema
  // zuerst; langer Text einklappbar (§S98). Kurzform beim ersten Treffer.
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
  const schema = $derived(fv.erklaerung.lang.find((teil) => teil.bild)?.bild);
</script>

{#if lang}
  <section class="lang" aria-label={fv.name.de}>
    <h3 class="titel">{fv.name.de}</h3>
    <p class="einstieg">{t(zustand === 'wieder-da' ? 'fv.wieder-da' : 'fv.vermutet')}</p>
    {#if schema}
      {@const Bild = WERKZEUG_KOMPONENTEN[schema.werkzeug]}
      {#if Bild}
        <div class="bild"><Bild parameter={schema.parameter ?? {}} /></div>
      {/if}
    {/if}
    <details class="mehr">
      <summary>{t('fv.mehr-lesen')}</summary>
      {#each fv.erklaerung.lang as teil (teil.teil)}
        <div class="teil">
          <h4>{t(`fv.${teil.teil}`)}</h4>
          <p><Textteile teile={fuelle(teil.de, {})} /></p>
          {#if teil.bild && teil.bild !== schema}
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
    </details>
    {#if rueckweg}
      <button class="zweit" onclick={onrueckweg}
        >{t(rueckweg === 'grundlage' ? 'fv.grundlage' : 'fv.zur-erklaerung')}</button
      >
    {/if}
  </section>
{:else}
  <aside class="kurz" aria-label={fv.name.de}>
    <h3 class="titel">{fv.name.de}</h3>
    {#if schema}
      {@const Bild = WERKZEUG_KOMPONENTEN[schema.werkzeug]}
      {#if Bild}
        <div class="bild"><Bild parameter={schema.parameter ?? {}} /></div>
      {/if}
    {/if}
    <p><Textteile teile={fuelle(fv.erklaerung.kurz.de, {})} /></p>
  </aside>
{/if}

<style>
  .lang {
    display: grid;
    gap: var(--abstand-s);
    margin-block: var(--abstand-s);
    padding: var(--abstand-m);
    border-radius: var(--radius);
    border-inline-start: 4px solid var(--farbe-akzent);
    background: var(--farbe-flaeche-leise);
  }

  .lang p,
  .lang h3,
  .lang h4,
  .kurz h3 {
    margin-block: 0;
  }

  .titel {
    font-size: 1.05rem;
    font-weight: 800;
    color: var(--farbe-text);
  }

  h4 {
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
    max-inline-size: 28rem;
  }

  /* L2: Aufklappen mit Pfeil erkennbar */
  .mehr summary {
    cursor: pointer;
    font-weight: 700;
    min-block-size: var(--ziel);
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
    color: var(--farbe-text);
    list-style: none;
  }

  .mehr summary::-webkit-details-marker {
    display: none;
  }

  .mehr summary::before {
    content: '▸';
  }

  .mehr[open] summary::before {
    content: '▾';
  }

  .mehr[open] {
    display: grid;
    gap: var(--abstand-s);
  }

  .lang button {
    justify-self: start;
  }

  .leise {
    color: var(--farbe-text-leise);
  }

  .kurz {
    display: grid;
    gap: var(--abstand-s);
    margin-block: var(--abstand-s);
    padding-block: var(--abstand-s);
    padding-inline: var(--abstand-m);
    border-radius: var(--radius);
    border-inline-start: 3px solid var(--farbe-akzent);
    background: var(--farbe-flaeche-leise);
    color: var(--farbe-text);
  }

  .kurz p {
    margin-block: 0;
  }
</style>
