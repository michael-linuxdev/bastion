<script lang="ts">
  // Hell, dunkel oder wie das Gerät (GRAFIK §2). Gilt sofort und wird gemerkt.
  // Plus kräftiger Text (V110) und Sound-Stufen (W113).
  import { MODI, SOUND_STUFEN, type SoundStufe } from '../../core/policy/einstellung';
  import { darstellung, darstellungSetzen, kontrastAnwenden } from '../grafik/darstellung.svelte';
  import {
    kontrastSetzen,
    kontrastWahl,
    modusSetzen,
    soundSetzen,
    soundStufe,
  } from '../plattform/ablage';
  import { soundSteuern } from '../bastion/sound/sound';
  import { t } from '../texte/texte';

  let cue = $state<SoundStufe>('aus');
  void kontrastWahl().then((an) => kontrastAnwenden(an));
  void soundStufe().then((z) => {
    cue = z;
    soundSteuern({ stufe: z, ruhig: false });
  });
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

<label class="kontrast">
  <input
    type="checkbox"
    checked={darstellung.kontrast}
    onchange={() => {
      const an = !darstellung.kontrast;
      kontrastAnwenden(an);
      void kontrastSetzen(an).catch(() => undefined);
    }}
  />
  {t('darstellung.kontrast')}
</label>
<p class="leise">{t('darstellung.kontrast-info')}</p>

<fieldset class="sound">
  <legend>{t('sound.ueberschrift')}</legend>
  <p class="leise">{t('sound.erklaerung')}</p>
  {#each SOUND_STUFEN as s (s)}
    <label>
      <input
        type="radio"
        name="sound-stufe-profil"
        value={s}
        checked={cue === s}
        onchange={() => {
          cue = s;
          soundSteuern({ stufe: s, ruhig: false });
          void soundSetzen(s).catch(() => undefined);
        }}
      />
      {t(`sound.${s}`)}
    </label>
  {/each}
</fieldset>

<style>
  .modus,
  .sound {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s) var(--abstand-m);
    border: none;
    padding: 0;
    margin-block: var(--abstand-m);
  }
  .sound {
    flex-direction: column;
    gap: var(--abstand-s);
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
  .kontrast {
    margin-block-start: var(--abstand-s);
  }
  .leise {
    color: var(--farbe-text-leise);
    margin-block: 0 var(--abstand-s);
    font-size: 0.95rem;
  }
</style>
