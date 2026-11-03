<script lang="ts">
  // Profil (LEHRPLAN L-15): freiwilliges Geburtsdatum und „Ich bin erwachsen“.
  // Bleibt auf dem Gerät. Ab 18 – oder als Erwachsene – ohne Elternbereich.
  // Design-Ideen K46: kindgerecht, kein Formular-Feeling.
  import type { Profil } from '../../core/policy/alter';
  import { t } from '../texte/texte';

  let {
    profil,
    onspeichern,
  }: {
    profil: Profil;
    onspeichern: (p: Profil) => void;
  } = $props();

  let datum = $state('');
  let erwachsen = $state(false);
  $effect.pre(() => {
    datum = profil.geburtsdatum ?? '';
    erwachsen = profil.erwachsen;
  });
  const heute = new Date().toISOString().slice(0, 10);
</script>

<section class="profil" aria-label={t('profil.ueberschrift')}>
  <p class="leise">{t('profil.erklaerung')}</p>
  <form
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
    </p>
  </form>
</section>

<style>
  .profil {
    display: grid;
    gap: var(--abstand-m);
  }

  .leise {
    margin: 0;
    color: var(--farbe-text-leise);
  }

  form {
    display: grid;
    gap: var(--abstand-m);
    max-inline-size: 26rem;
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
