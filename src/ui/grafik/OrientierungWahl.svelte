<script lang="ts">
  // Bildschirm drehen: auto / hoch / quer – für Bastion und Lernen.
  import { ORIENTIERUNGEN, type Orientierung } from '../../core/policy/einstellung';
  import { orientierungMerken } from '../plattform/ablage';
  import { t } from '../texte/texte';
  import { orientierungSetzen, orientierungStand } from './orientierung.svelte';

  let { kompakt = false }: { /** Weniger Text (z. B. Zahnrad in der Übung) */ kompakt?: boolean } =
    $props();

  function waehlen(o: Orientierung) {
    orientierungSetzen(o);
    void orientierungMerken(o).catch(() => undefined);
  }
</script>

<fieldset class="orientierung">
  <legend>{t('orientierung.ueberschrift')}</legend>
  {#if !kompakt}
    <p class="leise">{t('orientierung.erklaerung')}</p>
  {/if}
  {#each ORIENTIERUNGEN as o (o)}
    <label
      ><input
        type="radio"
        name="orientierung"
        value={o}
        checked={orientierungStand.wahl === o}
        onchange={() => waehlen(o)}
      />
      {t(`orientierung.${o}`)}</label
    >
  {/each}
  {#if orientierungStand.hinweis}
    <p class="hinweis" role="status">{t('orientierung.hinweis')}</p>
  {/if}
</fieldset>

<style>
  .orientierung {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s) var(--abstand-m);
    border: none;
    padding: 0;
    margin-block: var(--abstand-m);
  }
  legend {
    font-weight: 700;
    margin-block-end: var(--abstand-s);
  }
  .leise {
    flex: 1 0 100%;
    color: var(--farbe-text-leise);
    margin: 0;
    font-size: 0.95rem;
  }
  label {
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
    min-block-size: var(--ziel);
  }
  .hinweis {
    flex: 1 0 100%;
    margin: 0;
    border-inline-start: 4px solid var(--farbe-akzent);
    padding-inline-start: var(--abstand-m);
    color: var(--farbe-text-leise);
  }
</style>
