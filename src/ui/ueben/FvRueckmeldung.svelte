<script lang="ts">
  // Rückmeldung zur erkannten Fehlvorstellung (VERMITTLUNG §3.3): Überschrift „Dein Denkfehler“,
  // Name, Schema; langer Text einklappbar (§S98). Kurzform beim ersten Treffer.
  // B2 (Q-O1): kein eigener Kasten mehr, der Kurzsatz nur, wenn die Ursache ihn nicht schon sagt.
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
    kurzZeigen = true,
    onrueckweg,
  }: {
    fv: Fehlvorstellung;
    zustand: FvZustand | undefined;
    /** Beschriftung des Rückwegs, falls es einen gibt */
    rueckweg: 'erklaerung' | 'grundlage' | undefined;
    /** Kurzerklärung zeigen (false, wenn das Urteil die Ursache schon nennt) */
    kurzZeigen?: boolean;
    onrueckweg: () => void;
  } = $props();

  const lang = $derived(zustand === 'vermutet' || zustand === 'wieder-da');
  const schema = $derived(fv.erklaerung.lang.find((teil) => teil.bild)?.bild);
</script>

<section class="denkfehler" class:lang aria-label={fv.name.de}>
  <p class="label">{t('fv.titel')}</p>
  <h3 class="titel">{fv.name.de}</h3>
  {#if lang}
    <p class="einstieg">{t(zustand === 'wieder-da' ? 'fv.wieder-da' : 'fv.vermutet')}</p>
  {/if}
  {#if schema}
    {@const Bild = WERKZEUG_KOMPONENTEN[schema.werkzeug]}
    {#if Bild}
      <div class="bild"><Bild parameter={schema.parameter ?? {}} /></div>
    {/if}
  {/if}
  {#if lang}
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
  {:else if kurzZeigen}
    <p><Textteile teile={fuelle(fv.erklaerung.kurz.de, {})} /></p>
  {/if}
</section>

<style>
  .denkfehler {
    display: grid;
    gap: var(--abstand-s);
    padding-block-start: var(--abstand-s);
    border-block-start: 1px solid var(--farbe-rand);
    color: var(--farbe-text);
  }

  .denkfehler p,
  .denkfehler h3,
  .denkfehler h4 {
    margin-block: 0;
  }

  .label {
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--farbe-akzent);
  }

  .titel {
    font-size: 1.0625rem;
    font-weight: 700;
  }

  .einstieg {
    font-weight: 600;
  }

  .teil {
    display: grid;
    gap: 0.25rem;
  }

  h4 {
    font-size: 1rem;
    color: var(--farbe-akzent);
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
    color: var(--farbe-akzent);
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

  .denkfehler button {
    justify-self: start;
  }

  .leise {
    color: var(--farbe-text-leise);
  }
</style>
