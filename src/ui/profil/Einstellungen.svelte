<script lang="ts">
  // O19: alle Einstellungen für Lernende an einem Ort – Schrift, Bastion an/aus, Abend in der
  // Bastion, Ton, Bildschirm. Vorher verteilt auf „Über mich“, „Mein Stand“ und die Bastion.
  // Was nur die Bastion betrifft (Wetter, Kamera, Bewegung), bleibt in der Bastion selbst.
  import { SCHRIFT_STUFEN, type SchriftStufe } from '../../core/policy/einstellung';
  import BasebauSchalter from '../bastion/BasebauSchalter.svelte';
  import { tt } from '../bastion/thema.svelte';
  import OrientierungWahl from '../grafik/OrientierungWahl.svelte';
  import { schriftSetzen } from '../plattform/ablage';
  import Seitenkopf from '../start/Seitenkopf.svelte';
  import { t } from '../texte/texte';
  import ModusWahl from './ModusWahl.svelte';
  import { schrift, schriftAnwenden } from './schrift.svelte';

  let {
    basebau = $bindable(true),
    onzurueck,
  }: {
    basebau?: boolean;
    onzurueck: () => void;
  } = $props();

  function schriftWaehlen(s: SchriftStufe) {
    schriftAnwenden(s);
    void schriftSetzen(s).catch(() => undefined);
  }
</script>

<section class="einstellungen-seite">
  <Seitenkopf titel={t('einstellungen.ueberschrift')} {onzurueck}>
    <p>{t('einstellungen.einleitung')}</p>
  </Seitenkopf>

  <div class="karte">
    <fieldset class="schrift">
      <legend>{t('einstellungen.schrift')}</legend>
      {#each SCHRIFT_STUFEN as s (s)}
        <label class="stufe {s}"
          ><input
            type="radio"
            name="schrift"
            value={s}
            checked={schrift.stufe === s}
            onchange={() => schriftWaehlen(s)}
          />
          {t(`einstellungen.schrift-${s}`)}</label
        >
      {/each}
    </fieldset>
  </div>

  <div class="karte">
    <h3>{tt('basebau.ueberschrift')}</h3>
    <BasebauSchalter bind:an={basebau} durch="jugendlich" />
    {#if basebau}<p class="leise">{t('einstellungen.bastion-mehr')}</p>{/if}
  </div>

  <div class="karte"><ModusWahl /></div>
  <div class="karte"><OrientierungWahl /></div>
</section>

<style>
  .einstellungen-seite {
    display: grid;
    gap: var(--abstand-m);
  }
  .karte {
    display: grid;
    gap: var(--abstand-s);
    padding: var(--abstand-m);
    border-radius: var(--radius-karte);
    background: var(--farbe-flaeche);
    box-shadow: 0 2px 10px var(--farbe-schatten);
  }
  .karte :global(fieldset) {
    margin-block: 0;
  }
  h3 {
    margin: 0;
    font-size: 1.1rem;
  }
  .leise {
    margin: 0;
    color: var(--farbe-text-leise);
  }
  .schrift {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s) var(--abstand-m);
    border: none;
    padding: 0;
  }
  .schrift legend {
    font-weight: 700;
    margin-block-end: var(--abstand-s);
  }
  .schrift label {
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
    min-block-size: var(--ziel);
  }
  /* Jede Stufe zeigt sich in ihrer eigenen Größe */
  .stufe.gross {
    font-size: 1.125em;
  }
  .stufe.sehr-gross {
    font-size: 1.25em;
  }
</style>
