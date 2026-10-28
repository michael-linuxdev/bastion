<script lang="ts">
  // Elternbericht (DATENMODELL §5.2, D-14): einfache Ansicht (Themen und Wochen)
  // als Standard, ausführliche Ansicht mit einzelnen Aufgaben auf Wunsch.
  // Dieselbe Komponente sehen Jugendliche unter „Was meine Eltern sehen“.
  import { nachGraph, type Kompetenz, type Niveau } from '../../core/competence/kompetenz';
  import { einzelne, wochen } from '../../core/learning/bericht';
  import type { AufgabeEreignis } from '../../core/learning/ereignis';
  import type { GeneratorVorlage } from '../../core/learning/vorlage';
  import type { Zustand } from '../plattform/ablage';
  import { t, type TextSchluessel } from '../texte/texte';
  import { nachBereich } from '../ueben/reihenfolge';
  import { statusVon } from '../ueben/stand';

  let {
    kompetenzen,
    vorlagen,
    zustand,
    aufgaben,
  }: {
    kompetenzen: readonly Kompetenz[];
    vorlagen: readonly GeneratorVorlage[];
    zustand: Zustand;
    aufgaben: readonly AufgabeEreignis[];
  } = $props();

  let ausfuehrlich = $state(false);
  const jetzt = Date.now();
  const NIVEAUS: readonly Niveau[] = ['G', 'M'];

  const titel = $derived(new Map(kompetenzen.map((k) => [k.id, k.titel.de])));
  const geuebt = $derived(
    nachGraph(nachBereich(kompetenzen)).filter((k) =>
      NIVEAUS.some((n) => statusVon(zustand, k.id, n, jetzt) !== 'neu'),
    ),
  );
  const woche = $derived(wochen(aufgaben).slice(0, 8));
  const liste = $derived(einzelne(aufgaben).slice(0, 100));

  const datum = (tag: string) =>
    new Date(`${tag}T12:00:00`).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
  const zeit = (ms: number) =>
    new Date(ms).toLocaleString('de-DE', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  const dauer = (ms: number) => {
    const s = Math.round(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };
  const fehlertext = (e: AufgabeEreignis) =>
    e.fehlerbild
      ? vorlagen.find((v) => v.id === e.vorlage)?.fehlerbilder[e.fehlerbild]?.de
      : undefined;
</script>

<div class="bericht">
  <div class="umschalter" role="group">
    <button aria-pressed={!ausfuehrlich} onclick={() => (ausfuehrlich = false)}>
      {t('bericht.einfach')}
    </button>
    <button aria-pressed={ausfuehrlich} onclick={() => (ausfuehrlich = true)}>
      {t('bericht.ausfuehrlich')}
    </button>
  </div>

  {#if aufgaben.length === 0}
    <p>{t('bericht.keine-aufgaben')}</p>
  {:else if !ausfuehrlich}
    <h4>{t('bericht.kompetenzen')}</h4>
    <table>
      <thead>
        <tr>
          <th>{t('bericht.thema')}</th>
          <th>{t('niveau.G')}</th>
          <th>{t('niveau.M')}</th>
        </tr>
      </thead>
      <tbody>
        {#each geuebt as k (k.id)}
          <tr>
            <td>{k.titel.de}</td>
            {#each NIVEAUS as n (n)}
              {@const s = statusVon(zustand, k.id, n, jetzt)}
              <td>{s === 'neu' ? '–' : t(`status.${s}` as TextSchluessel)}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>

    <h4>{t('bericht.wochen')}</h4>
    <table>
      <thead>
        <tr>
          <th>{t('bericht.woche-ab')}</th>
          <th>{t('bericht.lerntage')}</th>
          <th>{t('bericht.aufgaben')}</th>
        </tr>
      </thead>
      <tbody>
        {#each woche as w (w.woche)}
          <tr>
            <td>{datum(w.montag)}</td>
            <td>{w.lerntage}</td>
            <td>{w.aufgaben}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <h4>{t('bericht.letzte')}</h4>
    <div class="breit">
      <table>
        <thead>
          <tr>
            <th>{t('bericht.zeit')}</th>
            <th>{t('bericht.thema')}</th>
            <th>{t('bericht.ergebnis')}</th>
            <th>{t('bericht.hilfen')}</th>
            <th>{t('bericht.dauer')}</th>
          </tr>
        </thead>
        <tbody>
          {#each liste as e (e.id)}
            {@const f = fehlertext(e)}
            <tr>
              <td>{zeit(e.ts)}</td>
              <td>
                {titel.get(e.kompetenz) ?? e.kompetenz} ·
                {t(e.niveau === 'G' ? 'niveau.G' : 'niveau.M')}
                <small>{t(`modus.${e.modus}` as TextSchluessel)}</small>
              </td>
              <td>
                {e.ergebnis === 'richtig' ? t('bericht.richtig') : t('bericht.falsch')}
                {#if f}<small>{t('bericht.fehlerbild')}: {f}</small>{/if}
              </td>
              <td>{e.hilfen}</td>
              <td>{dauer(e.dauerMs)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .bericht {
    display: grid;
    gap: var(--abstand-s);
  }

  .umschalter {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
  }

  .umschalter button {
    font: inherit;
    min-block-size: 2.75rem;
    padding-inline: var(--abstand-m);
    border-radius: var(--radius);
    border: 2px solid var(--farbe-akzent);
    background: transparent;
    color: var(--farbe-text);
    cursor: pointer;
  }

  .umschalter button[aria-pressed='true'] {
    background: var(--farbe-akzent);
    color: var(--farbe-hintergrund);
  }

  h4 {
    margin-block: var(--abstand-m) 0;
  }

  .breit {
    overflow-x: auto;
  }

  table {
    border-collapse: collapse;
    inline-size: 100%;
    font-size: 1rem;
  }

  th,
  td {
    text-align: start;
    vertical-align: top;
    padding-block: 0.3rem;
    padding-inline: 0.4rem;
    border-block-end: 1px solid var(--farbe-rand);
  }

  small {
    display: block;
    color: var(--farbe-text-leise);
  }
</style>
