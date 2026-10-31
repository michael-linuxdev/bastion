<script lang="ts">
  // Sicherung erstellen und einspielen (DATENMODELL §7, D-9): Datei mit
  // Sechs-Wörter-Code, Einspielen führt zusammen – es geht nichts verloren.
  // Design-Ideen K45: „Alles sicher“ statt Technikjargon.
  import {
    letzteSicherungAm,
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
  let letzte = $state<number | undefined>(undefined);

  void letzteSicherungAm().then((ts) => (letzte = ts));

  const datum = (ms: number) =>
    new Date(ms).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

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
    letzte = Date.now();
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
  {#if letzte !== undefined && !neu}
    <p class="status" role="status">
      <strong>{t('sicherung.alles-sicher')}</strong>
      {t('sicherung.alles-sicher-text')}
      <span class="leise">({datum(letzte)})</span>
    </p>
  {:else if letzte === undefined && !neu}
    <p class="status offen" role="status">{t('sicherung.status-offen')}</p>
  {/if}
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

  .status {
    margin: 0;
    padding: var(--abstand-s) var(--abstand-m);
    border-radius: var(--radius-karte);
    background: color-mix(in srgb, var(--farbe-erfolg) 14%, var(--farbe-flaeche));
    border-inline-start: 4px solid var(--farbe-erfolg);
  }

  .status.offen {
    background: var(--farbe-hinweis-flaeche);
    border-inline-start-color: var(--farbe-hinweis-rand);
  }

  form {
    display: grid;
    gap: var(--abstand-s);
  }

  label {
    display: grid;
    gap: 0.25rem;
  }

  .code {
    font-family: ui-monospace, monospace;
    font-size: 1.125rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    padding: var(--abstand-s) var(--abstand-m);
    border-radius: var(--radius);
    border: 2px dashed var(--farbe-akzent);
    background: var(--farbe-flaeche);
  }

  .leise {
    color: var(--farbe-text-leise);
    margin-block: 0;
  }

  .fehler {
    color: var(--farbe-akzent-warm);
  }
</style>
