<script lang="ts">
  // Testprotokoll der Testphase im Elternbereich (K-14, DATENMODELL §4.8, D-18):
  // mit der Teilnehmer-Nummer einschalten, Inhalt lesbar ansehen, als Datei
  // speichern, ausschalten, Nutzungsprotokoll löschen. Die App sendet nichts.
  import { zusammenfassung, type Testprotokoll } from '../../core/testphase/protokoll';
  import {
    nutzungLoeschen,
    testAusschalten,
    testEinschalten,
    testprotokollErstellen,
    testStand,
    type TestStand,
  } from '../plattform/ablage';
  import { t, type TextSchluessel } from '../texte/texte';

  let stand = $state<TestStand>({ aktiv: false });
  let eingabe = $state('');
  let fehler = $state(false);
  let protokoll = $state.raw<Testprotokoll | undefined>(undefined);
  let loeschenFragen = $state(false);
  let meldung = $state<TextSchluessel | undefined>(undefined);

  async function laden() {
    stand = await testStand();
  }
  void laden();

  async function einschalten(e: SubmitEvent) {
    e.preventDefault();
    fehler = !(await testEinschalten(eingabe));
    if (!fehler) eingabe = '';
    await laden();
  }

  async function ansehen() {
    protokoll = await testprotokollErstellen();
  }

  function speichern() {
    if (!protokoll) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(protokoll, null, 2)], { type: 'application/json' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = `bastion-testprotokoll-${protokoll.teilnehmer}-${protokoll.erstellt}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }

  async function loeschen() {
    if (!loeschenFragen) return void (loeschenFragen = true);
    await nutzungLoeschen();
    loeschenFragen = false;
    meldung = 'test.geloescht';
    if (protokoll) await ansehen();
  }

  const datum = (ts: number) =>
    new Date(ts).toLocaleString('de-DE', {
      day: 'numeric',
      month: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  const z = $derived(protokoll ? zusammenfassung(protokoll) : undefined);
  const ARTEN = ['aufgabe', 'sitzung', 'vermittlung', 'nutzung', 'einstellung'] as const;

  /** Eine Zeile je Eintrag, ohne Inhalte freier Eingaben */
  function zeile(e: Testprotokoll['ereignisse'][number]): string {
    const r = e as unknown as Record<string, unknown>;
    const teile = [
      datum(e.ts),
      t(`test.art.${e.art}`),
      r['was'],
      r['ziel'],
      r['kompetenz'],
      r['vorlage'],
      r['schritt'],
      r['ergebnis'],
      r['schluessel'],
    ];
    return teile.filter((x) => typeof x === 'string' && x !== '').join(' · ');
  }
</script>

<section class="testphase">
  <h3>{t('test.titel')}</h3>
  <p class="leise">{t('test.erklaerung')}</p>
  {#if stand.aktiv}
    <p>
      <strong>{t('test.an')}</strong>
      {stand.teilnehmer}{#if stand.seit}, {t('test.seit')} {datum(stand.seit)}{/if}
    </p>
    <div class="knoepfe">
      <button onclick={ansehen}>{t('test.ansehen')}</button>
      <button
        onclick={async () => {
          await testAusschalten();
          await laden();
        }}>{t('test.ausschalten')}</button
      >
    </div>
  {:else}
    <p>{t('test.aus')}</p>
    <form onsubmit={einschalten}>
      <label
        >{t('test.teilnehmer')}
        <input bind:value={eingabe} autocomplete="off" placeholder="T-07-4" /></label
      >
      {#if fehler}<p role="alert">{t('test.nummer-falsch')}</p>{/if}
      <button type="submit">{t('test.einschalten')}</button>
    </form>
    {#if stand.teilnehmer}
      <button onclick={ansehen}>{t('test.ansehen')}</button>
    {/if}
  {/if}

  {#if protokoll && z}
    <div class="vorschau" role="region" aria-label={t('test.ansehen')}>
      <p><strong>{protokoll.teilnehmer}</strong></p>
      {#if z.von && z.bis}
        <p>{t('test.zeitraum')} {z.von} {t('test.bis')} {z.bis}</p>
      {/if}
      <p>{t('test.eintraege')}</p>
      <ul>
        {#each ARTEN as art (art)}
          <li>{t(`test.art.${art}`)}: {z.jeArt[art] ?? 0}</li>
        {/each}
      </ul>
      <p>{t('test.unbekannt')} {protokoll.unbekannteFehler.length}</p>
      <details>
        <summary>{t('test.liste')}</summary>
        {#if protokoll.ereignisse.length === 0}
          <p>{t('test.leer')}</p>
        {:else}
          <ol class="liste">
            {#each protokoll.ereignisse as e (e.id)}
              <li>{zeile(e)}</li>
            {/each}
          </ol>
        {/if}
      </details>
      <div class="knoepfe">
        <button class="haupt" onclick={speichern}>{t('test.speichern')}</button>
        <button onclick={loeschen}
          >{loeschenFragen ? t('test.loeschen-sicher') : t('test.loeschen')}</button
        >
      </div>
    </div>
  {/if}
  {#if meldung}<p role="status">{t(meldung)}</p>{/if}
</section>

<style>
  .testphase {
    display: grid;
    gap: var(--abstand-s);
  }

  .testphase p {
    margin-block: 0;
  }

  .leise {
    color: var(--farbe-text-leise);
  }

  form {
    display: grid;
    gap: var(--abstand-s);
    max-inline-size: 22rem;
  }

  label {
    display: grid;
    gap: 0.2rem;
  }

  .knoepfe {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
  }

  .vorschau {
    display: grid;
    gap: var(--abstand-s);
    padding: var(--abstand-m);
    border-radius: var(--radius);
    background: var(--farbe-flaeche-leise);
  }

  .liste {
    max-block-size: 20rem;
    overflow-y: auto;
    font-size: 0.875rem;
  }
</style>
