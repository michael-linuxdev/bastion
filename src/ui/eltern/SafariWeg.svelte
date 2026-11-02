<script lang="ts">
  // Ausweg für die auf iPhone/iPad installierte App (Home-Bildschirm): Dort wirkt window.print()
  // nicht, und iOS hält Links auf dieselbe Adresse in der App fest (vom PV am iPhone bestätigt,
  // 02.11.2026). Zwei Wege nach Safari: „x-safari-https://…“ bittet iOS, Safari zu öffnen
  // (inoffiziell, nicht überall), und „Link kopieren“ zum Einfügen in Safari (geht immer).
  import { t } from '../texte/texte';

  let { adresse }: { adresse: string } = $props();

  let kopiert = $state<'ja' | 'nein' | undefined>(undefined);
  async function linkKopieren() {
    try {
      await navigator.clipboard.writeText(adresse);
      kopiert = 'ja';
    } catch {
      kopiert = 'nein';
    }
  }
</script>

<div class="safari">
  <p>{t('blatt.im-browser-hinweis')}</p>
  <a class="haupt" href={`x-safari-${adresse}`}>{t('blatt.in-safari')}</a>
  <button type="button" class="zweit" onclick={() => void linkKopieren()}
    >{t('blatt.link-kopieren')}</button
  >
  {#if kopiert === 'ja'}
    <p role="status">{t('blatt.link-kopiert')}</p>
  {:else if kopiert === 'nein'}
    <p role="status">{t('blatt.link-selbst')}</p>
  {/if}
  <label class="link"
    >{t('blatt.link')}
    <input type="text" readonly value={adresse} onfocus={(e) => e.currentTarget.select()} /></label
  >
</div>

<style>
  .safari {
    display: grid;
    gap: var(--abstand-s);
  }
  .safari p {
    margin: 0;
  }
  a.haupt {
    display: grid;
    place-items: center;
    text-align: center;
    text-decoration: none;
  }
  .link {
    display: grid;
    gap: 0.25rem;
  }
  .link input {
    font-size: 0.8rem;
  }
  @media print {
    .safari {
      display: none;
    }
  }
</style>
