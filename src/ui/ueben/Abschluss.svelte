<script lang="ts">
  // Abschlussbildschirm (KONZEPT §2, BASEBAU §6.1): Was habe ich heute gekonnt?
  // Zuerst das Können, ohne Punkte und Prozente; darunter die Ressourcen mit
  // „woher“ (§3.5, §9 Punkt 2: erst das Können, dann die Ressourcen);
  // zuletzt ein Vorschlag zur Pause (R5).
  import type { Kompetenz } from '../../core/competence/kompetenz';
  import type { AufgabeEreignis } from '../../core/learning/ereignis';
  import { tagesbilanz, type Thema } from '../../core/learning/heute';
  import type { BuchungEreignis } from '../../core/ledger/buchung';
  import { tagesertrag } from '../../core/ledger/heute';
  import { lerntag } from '../../core/policy/lerntag';
  import type { Zustand } from '../plattform/ablage';
  import { menge, tt } from '../bastion/thema.svelte';

  let {
    kompetenzen,
    zustand,
    aufgaben,
    buchungen,
    basebau = true,
    onstart,
  }: {
    kompetenzen: readonly Kompetenz[];
    zustand: Zustand;
    aufgaben: readonly AufgabeEreignis[];
    buchungen: readonly BuchungEreignis[];
    /** Basebau aus (R7): keine Ressourcen zeigen – gebucht wird trotzdem (B-10) */
    basebau?: boolean;
    onstart: () => void;
  } = $props();

  // Einmal beim Öffnen – kein laufender Timer (R2)
  const jetzt = Date.now();
  const tag = lerntag(jetzt, -new Date(jetzt).getTimezoneOffset());
  const bilanz = $derived(tagesbilanz(aufgaben, [...zustand.staende.values()], tag));
  const titel = $derived(new Map(kompetenzen.map((k) => [k.id, k.titel.de])));
  const name = (th: Thema) =>
    `${titel.get(th.kompetenz) ?? th.kompetenz} · ${tt(th.niveau === 'G' ? 'niveau.G' : 'niveau.M')}`;
  const anzahl = (n: number, eins: string, mehrere: string) => (n === 1 ? eins : `${n} ${mehrere}`);
  const ertrag = $derived(tagesertrag(buchungen, aufgaben, tag));
  /** „1 Lerneinheit“, „2 Lerneinheiten“ */
  const mit = (n: number, eins: string, mehrere: string) => `${n} ${n === 1 ? eins : mehrere}`;
  const erzWoher = $derived(
    [
      ertrag.wiederholungen > 0
        ? mit(
            ertrag.wiederholungen,
            tt('abschluss.wiederholung-eine'),
            tt('abschluss.wiederholungen'),
          )
        : '',
      ertrag.korrekturen > 0
        ? mit(ertrag.korrekturen, tt('abschluss.fehler-einer'), tt('abschluss.fehler'))
        : '',
    ]
      .filter(Boolean)
      .join(` ${tt('abschluss.und')} `),
  );
</script>

<section class="abschluss">
  <h2>{tt('abschluss.ueberschrift')}</h2>

  {#if bilanz.aufgaben === 0}
    <p>{tt('abschluss.nichts')}</p>
  {:else}
    {#if bilanz.gefestigt.length > 0}
      <h3>{tt('abschluss.gefestigt')}</h3>
      <ul class="erfolg">
        {#each bilanz.gefestigt as th (`${th.kompetenz}|${th.niveau}`)}<li>✓ {name(th)}</li>{/each}
      </ul>
    {/if}
    {#if bilanz.gekonnt.length > 0}
      <h3>{tt('abschluss.gekonnt')}</h3>
      <ul class="erfolg">
        {#each bilanz.gekonnt as th (`${th.kompetenz}|${th.niveau}`)}<li>✓ {name(th)}</li>{/each}
      </ul>
    {/if}

    <h3>{tt('abschluss.geuebt')}</h3>
    <ul>
      {#each bilanz.themen as th (`${th.kompetenz}|${th.niveau}`)}<li>{name(th)}</li>{/each}
    </ul>

    <ul class="zahlen">
      <li>
        {anzahl(bilanz.aufgaben, tt('abschluss.aufgabe-eine'), tt('abschluss.aufgaben'))}
      </li>
      {#if bilanz.wiederholt > 0}
        <li>
          {anzahl(bilanz.wiederholt, tt('abschluss.wiederholt-eine'), tt('abschluss.wiederholt'))}
        </li>
      {/if}
      {#if bilanz.aufgearbeitet > 0}
        <li>
          {anzahl(
            bilanz.aufgearbeitet,
            tt('abschluss.aufgearbeitet-einer'),
            tt('abschluss.aufgearbeitet'),
          )}
        </li>
      {/if}
    </ul>
    {#if basebau}
      <h3>{tt('abschluss.ertrag')}</h3>
      {#if ertrag.menge.fleiss + ertrag.menge.behalten + ertrag.menge.schritt + ertrag.menge.koennen + ertrag.startpaket.kompetenzen === 0}
        <p class="leise">{tt('abschluss.ertrag-nichts')}</p>
      {:else}
        <ul class="ertrag">
          {#if ertrag.menge.fleiss > 0}
            <li>
              <strong>{menge('fleiss', ertrag.menge.fleiss)}</strong> – {tt('abschluss.aus')}
              {mit(
                ertrag.fleissAufgaben,
                tt('abschluss.aufgabe-bearbeitet-eine'),
                tt('abschluss.aufgaben-bearbeitet'),
              )}
            </li>
          {/if}
          {#if ertrag.menge.behalten > 0}
            <li>
              <strong>{menge('behalten', ertrag.menge.behalten)}</strong> – {tt('abschluss.aus')}
              {erzWoher}
            </li>
          {/if}
          {#if ertrag.menge.schritt > 0}
            <li>
              <strong>{menge('schritt', ertrag.menge.schritt)}</strong>
              – {tt('abschluss.aus')}
              {mit(
                ertrag.menge.schritt,
                tt('abschluss.lerneinheit-eine'),
                tt('abschluss.lerneinheiten'),
              )}
            </li>
          {/if}
          {#if ertrag.menge.koennen > 0}
            <li>
              <strong>{menge('koennen', ertrag.menge.koennen)}</strong>
              – {tt('abschluss.weil')}
              {ertrag.bauplaene.map(name).join(', ')}
            </li>
          {/if}
          {#if ertrag.startpaket.kompetenzen > 0}
            <li>
              <strong
                >{menge('fleiss', ertrag.startpaket.fleiss)}
                {tt('abschluss.und')}
                {menge('schritt', ertrag.startpaket.schritt)}</strong
              >
              – {tt('abschluss.startpaket')}
              {mit(
                ertrag.startpaket.kompetenzen,
                tt('abschluss.startpaket-thema'),
                tt('abschluss.startpaket-themen'),
              )}
            </li>
          {/if}
        </ul>
      {/if}
      {#if ertrag.geraten > 0}<p class="leise">{tt('abschluss.geraten')}</p>{/if}
      {#if ertrag.weniger}<p class="leise">{tt('abschluss.weniger')}</p>{/if}
      {#if ertrag.gekappt > 0}<p class="leise">{tt('abschluss.gekappt')}</p>{/if}
      {#if ertrag.schritteVoll}<p class="leise">{tt('abschluss.schritte-voll')}</p>{/if}
    {/if}

    <p class="pause">{tt('abschluss.pause')}</p>
  {/if}

  <button class="haupt" onclick={onstart}>{tt('abschluss.startseite')}</button>
</section>

<style>
  .abschluss {
    display: grid;
    gap: var(--abstand-s);
  }

  h3 {
    margin-block: var(--abstand-m) 0;
  }

  ul {
    margin-block: 0;
    padding-inline-start: var(--abstand-l);
  }

  .erfolg {
    list-style: none;
    padding-inline-start: 0;
    color: #3f7d3a;
    font-weight: bold;
  }

  .zahlen {
    list-style: none;
    padding-inline-start: 0;
    margin-block-start: var(--abstand-m);
    color: var(--farbe-text-leise);
  }

  .ertrag {
    list-style: none;
    padding-inline-start: 0;
    display: grid;
    gap: var(--abstand-s);
  }

  .leise {
    color: var(--farbe-text-leise);
    margin-block: 0;
  }

  .pause {
    border-inline-start: 4px solid var(--farbe-akzent);
    padding-inline-start: var(--abstand-m);
  }

  button {
    font: inherit;
    justify-self: start;
    min-block-size: 2.75rem;
    padding-inline: var(--abstand-m);
    border-radius: var(--radius);
    border: 2px solid var(--farbe-akzent);
    cursor: pointer;
  }

  .haupt {
    background: var(--farbe-akzent);
    color: var(--farbe-hintergrund);
  }
</style>
