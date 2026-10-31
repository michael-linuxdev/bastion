<script lang="ts">
  // Echtes Wetter (T-15, GRAFIK §4.3): Ort Freitext, nur Eltern bzw. ab 18 selbst.
  // Standard aus. Cache dauerhaft bis Ort/Schalter geändert. Bei Fehler still.
  import { t, type TextSchluessel } from '../texte/texte';
  import {
    wetterEcht,
    wetterEchtSetzen,
    wetterKoord,
    wetterKoordSetzen,
    wetterOrtSetzen,
    wetterOrtText,
  } from '../plattform/ablage';
  import { ortSuchen, wetterCacheLeeren } from './grafik/wetter-abruf';

  let { durch }: { durch: 'jugendlich' | 'eltern' } = $props();

  let an = $state(false);
  let ort = $state('');
  let status = $state<TextSchluessel | undefined>(undefined);
  let beschaeftigt = $state(false);

  void (async () => {
    an = await wetterEcht();
    const k = await wetterKoord();
    ort = k?.name ?? (await wetterOrtText());
  })();

  async function speichernAn(wert: boolean) {
    an = wert;
    await wetterEchtSetzen(wert, durch);
    if (!wert) wetterCacheLeeren();
  }

  async function ortUebernehmen() {
    status = undefined;
    const text = ort.trim();
    await wetterOrtSetzen(text, durch);
    if (!an || text.length < 2) {
      await wetterKoordSetzen(undefined, durch);
      wetterCacheLeeren();
      return;
    }
    beschaeftigt = true;
    try {
      const gefunden = await ortSuchen(text);
      if (!gefunden) {
        status = 'wetter.ort-unbekannt';
        return;
      }
      ort = gefunden.name;
      await wetterKoordSetzen(gefunden, durch);
      await wetterOrtSetzen(gefunden.name, durch);
      wetterCacheLeeren();
      status = 'wetter.ort-ok';
    } catch {
      status = 'wetter.ort-unbekannt';
    } finally {
      beschaeftigt = false;
    }
  }
</script>

<section class="wetter" aria-labelledby="wetter-titel">
  <h3 id="wetter-titel">{t('wetter.titel')}</h3>
  <p class="leise">{t('wetter.erklaerung')}</p>
  <label>
    <input
      type="checkbox"
      checked={an}
      onchange={(e) => void speichernAn(e.currentTarget.checked)}
    />
    {t('wetter.an')}
  </label>
  {#if an}
    <label>
      {t('wetter.ort')}
      <input
        type="text"
        autocomplete="address-level2"
        bind:value={ort}
        placeholder={t('wetter.ort-beispiel')}
      />
    </label>
    <button class="zweit" disabled={beschaeftigt} onclick={() => void ortUebernehmen()}
      >{t('wetter.ort-suchen')}</button
    >
    {#if status}
      <p class="leise" role="status">{t(status)}</p>
    {/if}
  {/if}
</section>

<style>
  .wetter {
    display: grid;
    gap: var(--abstand-s);
  }
  label {
    display: grid;
    gap: 0.35rem;
  }
  label:has(input[type='checkbox']) {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    min-block-size: 44px;
  }
</style>
