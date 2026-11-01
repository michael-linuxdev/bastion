<script lang="ts">
  // Profil (LEHRPLAN L-15): freiwilliges Geburtsdatum und „Ich bin erwachsen“.
  // Bleibt auf dem Gerät. Ab 18 – oder als Erwachsene – ohne Elternbereich.
  // Design-Ideen K46: kindgerecht, kein Formular-Feeling.
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
  <p class="freundlich">{t('profil.freundlich')}</p>
  <p class="leise">{t('profil.erklaerung')}</p>
  <form
    class="karte"
    onsubmit={(e) => {
      e.preventDefault();
      onspeichern({ geburtsdatum: datum === '' ? undefined : datum, erwachsen });
    }}
  >
    <label
      >{t('profil.geburtsdatum-kind')}
      <input type="date" bind:value={datum} min="1900-01-01" max={heute} /></label
    >
    <label class="haken"
      ><input type="checkbox" bind:checked={erwachsen} /> {t('profil.erwachsen-kind')}</label
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
    display: grid;
    gap: var(--abstand-s);
    margin-block: var(--abstand-m);
  }

  h3 {
    margin: 0;
    font-size: 1.5rem;
  }

  .freundlich {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 700;
  }

  .leise {
    margin: 0;
    color: var(--farbe-text-leise);
  }

  .karte {
    display: grid;
    gap: var(--abstand-m);
    max-inline-size: 26rem;
    padding: var(--abstand-m);
    border: none;
    border-radius: var(--radius-karte);
    background: var(--farbe-flaeche);
    box-shadow: 0 2px 10px var(--farbe-schatten);
  }

  label {
    display: grid;
    gap: 0.35rem;
    font-weight: 600;
  }

  .haken {
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
    min-block-size: 2.75rem;
    font-weight: 500;
  }

  .knoepfe {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
    margin: 0;
  }
</style>
