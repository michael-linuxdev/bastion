<script lang="ts">
  // Elternbericht (DATENMODELL §5.2, D-14): einfache Ansicht als Brief (Design L62),
  // ausführliche Ansicht mit einzelnen Aufgaben auf Wunsch.
  // Dieselbe Komponente sehen Jugendliche unter „Was meine Eltern sehen“.
  import { nachGraph, type Kompetenz, type Niveau } from '../../core/competence/kompetenz';
  import { einzelne, lehrkraftBericht, wochen } from '../../core/learning/bericht';
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
    klasse = 5,
  }: {
    kompetenzen: readonly Kompetenz[];
    vorlagen: readonly GeneratorVorlage[];
    zustand: Zustand;
    aufgaben: readonly AufgabeEreignis[];
    /** gewählte Klasse – Maßstab im Bericht für die Lehrkraft (L-13) */
    klasse?: number;
  } = $props();

  let ansicht = $state<'einfach' | 'ausfuehrlich' | 'lehrkraft'>('einfach');
  const jetzt = Date.now();
  const lehrkraft = $derived(lehrkraftBericht(kompetenzen, [...zustand.staende.values()], klasse));
  const feldName = (f: string) => t(`feld.${f}` as TextSchluessel);
  const namen = (ids: readonly string[]) =>
    ids.map((id) => titel.get(id) ?? t('paket.fehlt')).join(', ');
  /** Der Bericht als einfacher Text – zum Speichern, Ausdrucken oder Zeigen */
  const lehrkraftText = $derived(
    [
      `${t('bericht.lehrkraft-titel')} – ${t('klasse.name')} ${klasse}`,
      new Date(jetzt).toLocaleDateString('de-DE'),
      '',
      ...lehrkraft.flatMap((f) => [
        `${feldName(f.feld)}: ${f.gekonnt} ${t('bericht.von')} ${f.bisKlasse} ${t('bericht.lk-gekonnt')}, ${f.gefestigt} ${t('bericht.lk-gefestigt')}`,
        ...(f.offen.length > 0 ? [`  ${t('bericht.lk-offen')}: ${namen(f.offen)}`] : []),
        ...(f.voraus.length > 0 ? [`  ${t('bericht.lk-voraus')}: ${namen(f.voraus)}`] : []),
      ]),
      '',
      t('bericht.lk-hinweis'),
    ].join('\n'),
  );
  let dateiLink = $state<string | undefined>(undefined);
  function speichern() {
    if (dateiLink) URL.revokeObjectURL(dateiLink);
    dateiLink = URL.createObjectURL(
      new Blob([lehrkraftText], { type: 'text/plain;charset=utf-8' }),
    );
  }
  const NIVEAUS: readonly Niveau[] = ['G', 'M'];

  const titel = $derived(new Map(kompetenzen.map((k) => [k.id, k.titel.de])));
  const geuebt = $derived(
    nachGraph(nachBereich(kompetenzen)).filter((k) =>
      NIVEAUS.some((n) => statusVon(zustand, k.id, n, jetzt) !== 'neu'),
    ),
  );
  const woche = $derived(wochen(aufgaben).slice(0, 8));
  const liste = $derived(einzelne(aufgaben).slice(0, 100));
  const gekonntThemen = $derived(
    geuebt.filter((k) =>
      NIVEAUS.some((n) => {
        const s = statusVon(zustand, k.id, n, jetzt);
        return s === 'gekonnt' || s === 'gefestigt';
      }),
    ),
  );
  const inArbeitThemen = $derived(
    geuebt.filter((k) => NIVEAUS.some((n) => statusVon(zustand, k.id, n, jetzt) === 'in-arbeit')),
  );
  const letzteWoche = $derived(woche[0]);

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
    <button aria-pressed={ansicht === 'einfach'} onclick={() => (ansicht = 'einfach')}>
      {t('bericht.einfach')}
    </button>
    <button aria-pressed={ansicht === 'ausfuehrlich'} onclick={() => (ansicht = 'ausfuehrlich')}>
      {t('bericht.ausfuehrlich')}
    </button>
    <button aria-pressed={ansicht === 'lehrkraft'} onclick={() => (ansicht = 'lehrkraft')}>
      {t('bericht.lehrkraft')}
    </button>
  </div>

  {#if aufgaben.length === 0}
    <p>{t('bericht.keine-aufgaben')}</p>
  {:else if ansicht === 'lehrkraft'}
    <h4>{t('bericht.lehrkraft-titel')} – {t('klasse.name')} {klasse}</h4>
    <p class="leise">{t('bericht.lk-erklaerung')}</p>
    <ul class="lk">
      {#each lehrkraft as f (f.feld)}
        <li>
          <strong>{feldName(f.feld)}</strong>:
          {f.gekonnt}
          {t('bericht.von')}
          {f.bisKlasse}
          {t('bericht.lk-gekonnt')}, {f.gefestigt}
          {t('bericht.lk-gefestigt')}
          {#if f.offen.length > 0}<small>{t('bericht.lk-offen')}: {namen(f.offen)}</small>{/if}
          {#if f.voraus.length > 0}<small>{t('bericht.lk-voraus')}: {namen(f.voraus)}</small>{/if}
        </li>
      {/each}
    </ul>
    <p class="leise">{t('bericht.lk-hinweis')}</p>
    <p>
      <button class="zweit" onclick={speichern}>{t('bericht.lk-speichern')}</button>
      {#if dateiLink}<a href={dateiLink} download="bastion-bericht-klasse-{klasse}.txt"
          >{t('bericht.lk-herunterladen')}</a
        >{/if}
    </p>
  {:else if ansicht === 'einfach'}
    <article class="brief">
      <p class="anrede">{t('bericht.brief-anrede')}</p>
      <p>
        {t('bericht.brief-einleitung')}
        {geuebt.length}
        {t('bericht.brief-themen')}.
      </p>
      {#if gekonntThemen.length > 0}
        <p>
          <strong>{t('bericht.brief-gekonnt')}</strong>
          {gekonntThemen
            .slice(0, 5)
            .map((k) => k.titel.de)
            .join(', ')}{#if gekonntThemen.length > 5}{t('bericht.brief-und-mehr')}{/if}.
        </p>
      {/if}
      {#if inArbeitThemen.length > 0}
        <p>
          <strong>{t('bericht.brief-arbeit')}</strong>
          {inArbeitThemen
            .slice(0, 5)
            .map((k) => k.titel.de)
            .join(', ')}{#if inArbeitThemen.length > 5}{t('bericht.brief-und-mehr')}{/if}.
        </p>
      {/if}
      {#if letzteWoche}
        <p>
          {t('bericht.brief-woche')}
          {datum(letzteWoche.montag)}:
          {letzteWoche.lerntage}
          {t('bericht.lerntage')},
          {letzteWoche.aufgaben}
          {t('bericht.aufgaben')}.
        </p>
      {/if}
      <p class="gruss">{t('bericht.brief-gruss')}</p>
    </article>
  {:else}
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
                {titel.get(e.kompetenz) ?? t('paket.fehlt')} ·
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
  /* §U107: druckfreundlich – helle Fläche, wenig Farbe */
  .bericht {
    display: grid;
    gap: var(--abstand-s);
    padding: var(--abstand-m);
    border-radius: var(--radius);
    background: #fff;
    color: #1a1a1a;
    border: 1px solid var(--farbe-rand);
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
    border: 2px solid var(--farbe-rand);
    background: #fff;
    color: #1a1a1a;
    cursor: pointer;
  }

  .umschalter button[aria-pressed='true'] {
    background: var(--farbe-flaeche-leise);
    border-color: var(--farbe-text);
    color: #1a1a1a;
  }

  h4 {
    margin-block: var(--abstand-m) 0;
  }

  .brief {
    padding: var(--abstand-m);
    border-radius: var(--radius-karte);
    background: var(--farbe-flaeche);
    box-shadow: 0 2px 10px var(--farbe-schatten);
    display: grid;
    gap: var(--abstand-s);
    line-height: 1.55;
  }

  .brief p {
    margin-block: 0;
  }

  .anrede,
  .gruss {
    font-weight: 700;
  }

  .breit {
    overflow-x: auto;
  }

  table {
    border-collapse: collapse;
    inline-size: 100%;
    font-size: 1rem;
    background: #fff;
  }

  th,
  td {
    text-align: start;
    vertical-align: top;
    padding-block: 0.3rem;
    padding-inline: 0.4rem;
    border-block-end: 1px solid #ccc;
  }

  .lk {
    display: grid;
    gap: var(--abstand-s);
    padding-inline-start: var(--abstand-m);
  }

  small {
    display: block;
    color: #555;
  }

  .leise {
    color: #555;
  }

  @media print {
    .bericht {
      border: none;
      padding: 0;
      box-shadow: none;
      background: #fff;
      color: #000;
    }

    .umschalter {
      display: none;
    }

    th,
    td {
      border-block-end-color: #999;
    }
  }

  .leise {
    color: var(--farbe-text-leise);
  }
</style>
