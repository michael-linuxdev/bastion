<script lang="ts">
  // „Als PDF speichern“ (ARCHITEKTUR T-23): erzeugt die PDF-Datei auf dem Gerät aus dem
  // gezeigten Blatt. Geht auch in der auf dem iPhone installierten App, die nicht drucken kann.
  import { t } from '../texte/texte';
  import { blattAlsPdf, type PdfErgebnis } from './pdf';

  let {
    blatt,
    dateiname,
    haupt = false,
  }: {
    /** Das Element mit dem Blatt ([data-druckblatt]) */
    blatt: () => HTMLElement | null | undefined;
    dateiname: string;
    haupt?: boolean;
  } = $props();

  let zustand = $state<'bereit' | 'laeuft' | PdfErgebnis | 'fehler'>('bereit');

  async function erzeugen() {
    const el = blatt();
    if (!el || zustand === 'laeuft') return;
    zustand = 'laeuft';
    try {
      zustand = await blattAlsPdf(el, dateiname);
    } catch {
      zustand = 'fehler';
    }
  }
</script>

<button
  type="button"
  class={haupt ? 'haupt pdf' : 'zweit pdf'}
  disabled={zustand === 'laeuft'}
  onclick={() => void erzeugen()}
  >{zustand === 'laeuft' ? t('blatt.pdf-laeuft') : t('blatt.pdf')}</button
>
{#if zustand === 'geladen'}
  <p class="meldung" role="status">{t('blatt.pdf-geladen')}</p>
{:else if zustand === 'fehler'}
  <p class="meldung" role="alert">{t('blatt.pdf-fehler')}</p>
{/if}

<style>
  .meldung {
    margin: 0;
  }
  @media print {
    .pdf,
    .meldung {
      display: none;
    }
  }
</style>
