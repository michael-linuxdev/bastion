<script lang="ts">
  // Profil (LEHRPLAN L-15): freiwilliges Geburtsdatum und „Ich bin erwachsen“.
  // Bleibt auf dem Gerät. Ab 18 – oder als Erwachsene – ohne Elternbereich.
  import type { Profil } from '../../core/policy/alter';
  import { t } from '../texte/texte';

  let {
    profil,
    erstesMal = false,
    onspeichern,
    onueberspringen,
  }: {
    profil: Profil;
    /** Beim ersten Start: mit „Überspringen“ */
    erstesMal?: boolean;
    onspeichern: (p: Profil) => void;
    onueberspringen?: () => void;
  } = $props();

  let datum = $state('');
  let erwachsen = $state(false);
  $effect.pre(() => {
    datum = profil.geburtsdatum ?? '';
    erwachsen = profil.erwachsen;
  });
  const heute = new Date().toISOString().slice(0, 10);
</script>

<section class="profil" aria-labelledby="profil-titel">
  <h3 id="profil-titel">{t('profil.ueberschrift')}</h3>
  <p class="leise">{t('profil.erklaerung')}</p>
  <form
    onsubmit={(e) => {
      e.preventDefault();
      onspeichern({ geburtsdatum: datum === '' ? undefined : datum, erwachsen });
    }}
  >
    <label
      >{t('profil.geburtsdatum')}
      <input type="date" bind:value={datum} min="1900-01-01" max={heute} /></label
    >
    <label class="haken"
      ><input type="checkbox" bind:checked={erwachsen} /> {t('profil.erwachsen')}</label
    >
    <p class="knoepfe">
      <button class="haupt" type="submit">{t('profil.speichern')}</button>
      {#if erstesMal && onueberspringen}
        <button type="button" class="zweit" onclick={onueberspringen}
          >{t('profil.ueberspringen')}</button
        >
      {/if}
    </p>
  </form>
</section>

<style>
  .profil {
    border: 1px solid var(--farbe-rand);
    border-radius: var(--radius);
    padding: var(--abstand-m);
    margin-block: var(--abstand-m);
    background: var(--farbe-flaeche);
  }
  form {
    display: grid;
    gap: var(--abstand-s);
    max-inline-size: 22rem;
  }
  label {
    display: grid;
    gap: 0.25rem;
  }
  .haken {
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
    min-block-size: 2.75rem;
  }
  .knoepfe {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
  }
</style>
