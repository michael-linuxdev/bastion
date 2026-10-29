<script lang="ts">
  // Hell, dunkel oder wie das Gerät (GRAFIK §2). Gilt sofort und wird gemerkt.
  import { MODI } from '../../core/policy/einstellung';
  import { darstellung, darstellungSetzen } from '../grafik/darstellung.svelte';
  import { modusSetzen } from '../plattform/ablage';
  import { t } from '../texte/texte';
</script>

<fieldset class="modus">
  <legend>{t('darstellung.ueberschrift')}</legend>
  {#each MODI as m (m)}
    <label
      ><input
        type="radio"
        name="modus"
        value={m}
        checked={darstellung.modus === m}
        onchange={() => {
          darstellungSetzen(m);
          void modusSetzen(m).catch(() => undefined);
        }}
      />
      {t(`darstellung.${m}`)}</label
    >
  {/each}
</fieldset>

<style>
  .modus {
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
  label {
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
    min-block-size: var(--ziel);
  }
</style>
