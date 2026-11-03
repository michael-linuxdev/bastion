<script lang="ts">
  // O14: Ruhiger Hinweis oben auf der Startseite, solange Bastion auf Handy oder Tablet
  // im Browser läuft. Führt zur Anleitung unter „Mehr“.
  import { t } from '../texte/texte';

  let { onclick }: { onclick: () => void } = $props();
</script>

<button type="button" class="leiste" {onclick}>
  <span>{t('installieren.leiste')}</span>
  <span class="los">{t('installieren.leiste-los')} ›</span>
</button>

<style>
  .leiste {
    font: inherit;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--abstand-s);
    inline-size: 100%;
    min-block-size: var(--ziel);
    margin-block-end: var(--abstand-s);
    padding-inline: var(--abstand-m);
    border: 2px solid var(--farbe-hinweis-rand);
    border-radius: var(--radius-karte);
    background: var(--farbe-hinweis-flaeche);
    color: var(--farbe-text);
    font-weight: 700;
    text-align: start;
    cursor: pointer;
  }
  .los {
    color: var(--farbe-akzent);
    white-space: nowrap;
  }
</style>
