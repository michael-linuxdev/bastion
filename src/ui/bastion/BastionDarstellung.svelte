<script lang="ts">
  // Darstellungsschalter der Bastion (GRAFIK §4.5–§4.6, 2.13): Bild, ruhig, leicht, Sound,
  // Ganzes Bild – nur in den Bastion-Einstellungen, nicht auf dem Reiter.
  import { SOUND_STUFEN, type SoundStufe } from '../../core/policy/einstellung';
  import {
    bastionLeicht,
    bastionRuhig,
    soundStufe,
    bildSetzen,
    bildZeigen,
    leichtSetzen,
    ruhigSetzen,
    soundSetzen,
    kameraZuruecksetzen,
  } from '../plattform/ablage';
  import { tt } from './thema.svelte';
  import { t } from '../texte/texte';

  let {
    onBildAus,
  }: {
    /** Bild aus → Liste bleibt in den Einstellungen */
    onBildAus?: () => void;
  } = $props();

  let zeigen = $state(true);
  let ruhig = $state(false);
  let leicht = $state(false);
  let systemRuhe = $state(false);
  let cue = $state<SoundStufe>('aus');

  void bildZeigen().then((z) => (zeigen = z));
  void bastionRuhig().then((z) => (ruhig = z));
  void bastionLeicht().then((z) => (leicht = z));
  void soundStufe().then((z) => (cue = z));

  $effect(() => {
    if (typeof matchMedia !== 'function') return;
    const m = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => (systemRuhe = m.matches);
    sync();
    m.addEventListener('change', sync);
    return () => m.removeEventListener('change', sync);
  });
</script>

<div class="darstellung" role="group" aria-label={tt('bastion.darstellung')}>
  <label>
    <input
      type="checkbox"
      checked={zeigen}
      onchange={() => {
        zeigen = !zeigen;
        void bildSetzen(zeigen);
        if (!zeigen) onBildAus?.();
      }}
    />
    {zeigen ? tt('bastion.bild-aus') : tt('bastion.bild-an')}
  </label>
  <label>
    <input
      type="checkbox"
      checked={ruhig}
      onchange={() => {
        ruhig = !ruhig;
        void ruhigSetzen(ruhig);
      }}
    />
    {tt('bastion.ruhig')}
  </label>
  <label>
    <input
      type="checkbox"
      checked={leicht}
      disabled={ruhig || systemRuhe}
      onchange={() => {
        leicht = !leicht;
        void leichtSetzen(leicht);
      }}
    />
    {tt('bastion.leicht')}
  </label>
  <fieldset class="sound">
    <legend>{t('sound.ueberschrift')}</legend>
    <p class="leise">{t('sound.erklaerung')}</p>
    {#each SOUND_STUFEN as s (s)}
      <label>
        <input
          type="radio"
          name="sound-stufe"
          value={s}
          checked={cue === s}
          onchange={() => {
            cue = s;
            void soundSetzen(s);
          }}
        />
        {t(`sound.${s}`)}
      </label>
    {/each}
  </fieldset>
  <button
    type="button"
    class="passen"
    onclick={() => void kameraZuruecksetzen()}
    aria-label={tt('bastion.zoom-passen')}
  >
    {tt('bastion.zoom-passen')}
  </button>
  <p class="leise"><strong>{tt('bastion.geste-sprache')}</strong></p>
  <p class="leise">{tt('bastion.bedienung')}</p>
  <p class="leise">{tt('bastion.bewohner.erklaerung')}</p>
  <ul class="bewohner-frei">
    <li>{tt('bastion.bewohner.frei.zwerg')}</li>
    <li>{tt('bastion.bewohner.frei.gaertner')}</li>
    <li>{tt('bastion.bewohner.frei.bibliothek')}</li>
    <li>{tt('bastion.bewohner.frei.torhueter')}</li>
    <li>{tt('bastion.bewohner.frei.handwerk')}</li>
    <li>{tt('bastion.bewohner.frei.imker')}</li>
  </ul>
</div>

<style>
  .darstellung {
    display: grid;
    gap: var(--abstand-s);
    margin-block: var(--abstand-s) 0;
  }

  label {
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
    min-block-size: var(--ziel, 2.75rem);
    color: var(--farbe-text);
  }

  .sound {
    display: grid;
    gap: var(--abstand-s);
    border: none;
    padding: 0;
    margin: 0;
  }

  .sound legend {
    font-weight: 700;
    margin-block-end: var(--abstand-s);
  }

  .passen {
    font: inherit;
    justify-self: start;
    min-block-size: var(--ziel);
    padding-inline: var(--abstand-m);
    border-radius: var(--radius);
    border: 2px solid var(--farbe-akzent);
    background: var(--farbe-hintergrund);
    color: inherit;
    cursor: pointer;
  }

  .leise {
    color: var(--farbe-text-leise);
    margin-block: 0;
    font-size: 0.95rem;
  }

  .bewohner-frei {
    margin-block: 0;
    padding-inline-start: 1.2rem;
    color: var(--farbe-text-leise);
    font-size: 0.9rem;
  }
</style>
