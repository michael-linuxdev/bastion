<script lang="ts">
  // Dauerhafter Vermerk (D-15): PIN nach dem Einspielen einer Sicherung neu
  // festgelegt. Sichtbar im Elternbereich und für Jugendliche unter „Mein Stand“.
  import { t } from '../texte/texte';

  let { vermerke }: { vermerke: readonly string[] } = $props();

  const datum = (tag: string) =>
    new Date(`${tag}T12:00:00`).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
</script>

{#each vermerke as tag, i (i)}
  <p class="vermerk">{t('eltern.vermerk').replace('{tag}', datum(tag))}</p>
{/each}

<style>
  .vermerk {
    border-inline-start: 4px solid var(--farbe-akzent);
    padding-inline-start: var(--abstand-m);
  }
</style>
