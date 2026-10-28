<script lang="ts">
  // Sicherung erstellen und einspielen (DATENMODELL §7, D-9): Datei mit
  // Sechs-Wörter-Code, Einspielen führt zusammen – es geht nichts verloren.
  import {
    sicherungEinspielen,
    sicherungErstellen,
    sicherungGespeichert,
    type NeueSicherung,
  } from '../plattform/ablage';
  import { t, type TextSchluessel } from '../texte/texte';

  let { oneingespielt }: { oneingespielt: () => void } = $props();

  let neu = $state<NeueSicherung | undefined>(undefined);
  let gespeichert = $state(false);
  let datei = $state<FileList | undefined>(undefined);
  let code = $state('');
  let beschaeftigt = $state(false);
  let meldung = $state<{ text: string; fehler: boolean } | undefined>(undefined);

  async function erstellen() {
    beschaeftigt = true;
    gespeichert = false;
    neu = await sicherungErstellen().catch(() => undefined);
    beschaeftigt = false;
    if (!neu) meldung = { text: t('sicherung.fehler-speicher'), fehler: true };
  }

  async function speichern() {
    if (!neu) return;
    const url = URL.createObjectURL(
      new Blob([new Uint8Array(neu.datei)], { type: 'application/octet-stream' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = neu.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    await sicherungGespeichert();
    gespeichert = true;
  }

  async function einspielen(ereignis: SubmitEvent) {
    ereignis.preventDefault();
    const f = datei?.[0];
    if (!f) return;
    beschaeftigt = true;
    meldung = undefined;
    const r = await sicherungEinspielen(new Uint8Array(await f.arrayBuffer()), code);
    beschaeftigt = false;
    if (r.ok) {
      meldung = {
        text:
          r.neu === 0
            ? t('sicherung.nichts-neu')
            : `${t('sicherung.eingespielt')} ${r.neu} ${t('sicherung.eintraege')}`,
        fehler: false,
      };
      code = '';
      oneingespielt();
    } else {
      meldung = { text: t(`sicherung.fehler-${r.grund}` as TextSchluessel), fehler: true };
    }
  }
</script>

<section class="sicherung">
  <h2>{t('sicherung.ueberschrift')}</h2>
  <p>{t('sicherung.warum')}</p>

  <h3>{t('sicherung.erstellen-titel')}</h3>
  {#if !neu}
    <button class="haupt" disabled={beschaeftigt} onclick={() => void erstellen()}>
      {t('sicherung.erstellen')}
    </button>
  {:else}
    <p>{t('sicherung.code-text')}</p>
    <p class="code" data-testid="sicherungscode">{neu.code}</p>
    <p class="leise">{t('sicherung.ehrlich')}</p>
    <button class="haupt" onclick={() => void speichern()}>{t('sicherung.speichern')}</button>
    {#if gespeichert}
      <p role="status">{t('sicherung.gespeichert')} <strong>{neu.name}</strong></p>
      <p class="leise">{t('sicherung.aufbewahren')}</p>
    {/if}
  {/if}

  <h3>{t('sicherung.einspielen-titel')}</h3>
  <form onsubmit={einspielen}>
    <p class="leise">{t('sicherung.einspielen-text')}</p>
    <label>
      {t('sicherung.datei')}
      <input type="file" accept=".bastion" bind:files={datei} />
    </label>
    <label>
      {t('sicherung.code')}
      <input autocomplete="off" autocapitalize="none" spellcheck="false" bind:value={code} />
    </label>
    <button class="haupt" disabled={beschaeftigt || !datei?.length || !code.trim()}>
      {t('sicherung.einspielen')}
    </button>
  </form>
  {#if beschaeftigt}<p role="status">{t('sicherung.arbeitet')}</p>{/if}
  {#if meldung}
    <p class:fehler={meldung.fehler} role={meldung.fehler ? 'alert' : 'status'}>{meldung.text}</p>
  {/if}
</section>

<style>
  .sicherung {
    display: grid;
    gap: var(--abstand-s);
  }

  h3 {
    margin-block: var(--abstand-m) 0;
  }

  form {
    display: grid;
    gap: var(--abstand-s);
    max-inline-size: 26rem;
  }

  label {
    display: grid;
    gap: 0.2rem;
  }

  input {
    font: inherit;
    padding-block: var(--abstand-s);
    padding-inline: var(--abstand-s);
    border: 2px solid var(--farbe-rand);
    border-radius: var(--radius);
    background: var(--farbe-flaeche);
    color: var(--farbe-text);
  }

  button {
    font: inherit;
    min-block-size: 2.75rem;
    padding-inline: var(--abstand-m);
    border-radius: var(--radius);
    border: 2px solid var(--farbe-akzent);
    cursor: pointer;
    justify-self: start;
  }

  .haupt {
    background: var(--farbe-akzent);
    color: var(--farbe-hintergrund);
  }

  .haupt:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .code {
    font-size: 1.375rem;
    font-weight: bold;
    padding-block: var(--abstand-s);
    padding-inline: var(--abstand-m);
    border: 2px dashed var(--farbe-akzent);
    border-radius: var(--radius);
  }

  .leise {
    color: var(--farbe-text-leise);
  }

  .fehler {
    color: var(--farbe-akzent);
  }
</style>
