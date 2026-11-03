<script lang="ts">
  // O14: „Als App installieren“ unter „Mehr“ – Anleitung für dieses Gerät und für andere.
  import type { Geraet } from '../plattform/geraet';
  import { geraet, installation } from '../plattform/installation.svelte';
  import { t } from '../texte/texte';
  import InstallSchritte from './InstallSchritte.svelte';
  import Seitenkopf from './Seitenkopf.svelte';

  let { onzurueck }: { onzurueck: () => void } = $props();

  const ANDERE: readonly Geraet[] = [
    { system: 'ios', browser: 'safari' },
    { system: 'ios', browser: 'chrome' },
    { system: 'android', browser: 'chrome' },
    { system: 'android', browser: 'samsung' },
    { system: 'android', browser: 'firefox' },
    { system: 'desktop', browser: 'chrome' },
  ];
  const andere = ANDERE.filter((g) => g.system !== geraet.system || g.browser !== geraet.browser);
</script>

<section class="install">
  <Seitenkopf titel={t('installieren.titel')} {onzurueck}>
    <p>{t('installieren.seite-text')}</p>
  </Seitenkopf>
  {#if installation.installiert}
    <p class="schon" role="status">{t('installieren.schon')}</p>
  {/if}
  <section class="karte" aria-labelledby="install-dein">
    <h3 id="install-dein">{t('installieren.dein-geraet')}</h3>
    <InstallSchritte {geraet} erkannt />
    <p class="danach">{t('installieren.danach')}</p>
  </section>
  <h3>{t('installieren.andere')}</h3>
  {#each andere as g (`${g.system}-${g.browser}`)}
    <details class="karte">
      <summary
        >{t(`installieren.system.${g.system}`)} · {t(`installieren.browser.${g.browser}`)}</summary
      >
      <InstallSchritte geraet={g} angebot={false} />
    </details>
  {/each}
</section>

<style>
  .install {
    display: grid;
    gap: var(--abstand-m);
  }
  h3 {
    margin: 0;
    font-size: 1.1rem;
  }
  .karte {
    display: grid;
    gap: var(--abstand-s);
    padding: var(--abstand-m);
    border-radius: var(--radius-karte);
    background: var(--farbe-flaeche);
    box-shadow: 0 2px 10px var(--farbe-schatten);
  }
  details.karte {
    display: block;
    padding-block: 0.25rem;
  }
  details.karte[open] {
    padding-block-end: var(--abstand-m);
  }
  .danach {
    margin: 0;
    color: var(--farbe-text-leise);
    font-size: 0.95rem;
  }
  summary {
    min-block-size: var(--ziel);
    display: flex;
    align-items: center;
    font-weight: 700;
    cursor: pointer;
  }
  details[open] summary {
    margin-block-end: var(--abstand-s);
  }
  .schon {
    margin: 0;
    padding: var(--abstand-s) var(--abstand-m);
    border-inline-start: 4px solid var(--farbe-erfolg);
    border-radius: var(--radius-karte);
    background: color-mix(in srgb, var(--farbe-erfolg) 14%, var(--farbe-flaeche));
  }
</style>
