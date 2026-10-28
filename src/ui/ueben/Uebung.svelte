<script lang="ts">
  // Eine Übungsrunde: Aufgabe zeigen, Antwort prüfen, gezielte Rückmeldung zum
  // Fehlerbild, Hilfen, Lösungsweg. Welche Aufgabe als Nächstes kommt, bestimmt
  // `auftrag` – reihum zu einer Kompetenz (Üben) oder aus der Liste fälliger
  // Karten (Wiederholen). Ohne Zeitdruck und ohne Punkte (R1, R2).
  import { auswerten, type Bruchform, type Ergebnis } from '../../core/learning/auswertung';
  import type { Instanz, Loesung } from '../../core/learning/generator';
  import { fuelle } from '../../core/learning/text';
  import { generatoren } from '../../generators';
  import type { Antwortdaten } from '../plattform/ablage';
  import { neuerSeed } from '../plattform/zufall';
  import { t } from '../texte/texte';
  import type { Auftrag } from './auftrag';
  import Eingabe from './Eingabe.svelte';
  import Textteile from './Textteile.svelte';

  let {
    ueberschrift,
    auftrag,
    modus,
    paketVon,
    onzurueck,
    onergebnis,
  }: {
    ueberschrift: string;
    /** Der n-te Auftrag dieser Runde; undefined = Runde zu Ende. */
    auftrag: (n: number) => Auftrag | undefined;
    modus: 'ueben' | 'wiederholen';
    paketVon: ReadonlyMap<string, string>;
    onzurueck: () => void;
    onergebnis: (daten: Antwortdaten) => void;
  } = $props();

  interface Aufgabe extends Auftrag {
    readonly instanz: Instanz;
    readonly seed: number;
    readonly nummer: number;
    /** Zeitpunkt, zu dem die Aufgabe erschien – nur für die Bearbeitungsdauer im Ereignis. */
    readonly beginn: number;
  }

  let nummer = $state(0);
  let ergebnis = $state<Ergebnis | undefined>(undefined);
  let kommaHinweis = $state(false);
  let hilfen = $state(0);
  let wegOffen = $state(false);

  function erzeuge(n: number): Aufgabe | undefined {
    const a = auftrag(n);
    const generator = a ? generatoren.get(a.vorlage.generator) : undefined;
    if (!a || !generator) return undefined;
    const seed = neuerSeed();
    return {
      ...a,
      instanz: generator.erzeuge(seed, a.vorlage.parameter[a.niveau]),
      seed,
      nummer: n,
      beginn: Date.now(),
    };
  }

  let aufgabe = $derived(erzeuge(nummer));

  function beantwortet(antwort: Loesung, hinweis?: 'punkt-statt-komma') {
    if (!aufgabe) return;
    const form = (aufgabe.vorlage.antwort?.['form'] ?? 'beliebig') as Bruchform;
    ergebnis = auswerten(aufgabe.instanz, antwort, form);
    kommaHinweis = hinweis === 'punkt-statt-komma';
    onergebnis({
      modus,
      kompetenz: aufgabe.kompetenz.id,
      vorlage: aufgabe.vorlage.id,
      niveau: aufgabe.niveau,
      generator: aufgabe.vorlage.generator,
      seed: aufgabe.seed,
      paket: paketVon.get(aufgabe.vorlage.id) ?? '',
      hilfen,
      dauerMs: Date.now() - aufgabe.beginn,
      platzhalter: aufgabe.instanz.platzhalter,
      loesung: aufgabe.instanz.loesung,
      antwort,
      ergebnis,
    });
    if (!ergebnis.richtig) wegOffen = true;
  }

  function weiter() {
    ergebnis = undefined;
    kommaHinweis = false;
    hilfen = 0;
    wegOffen = false;
    nummer += 1;
  }

  const rueckmeldung = $derived.by(() => {
    if (!ergebnis || ergebnis.richtig || !aufgabe) return undefined;
    if (ergebnis.fehlerbild) {
      const text = aufgabe.vorlage.fehlerbilder[ergebnis.fehlerbild];
      if (text) return fuelle(text.de, aufgabe.instanz.platzhalter);
    }
    if (ergebnis.hinweis) return fuelle(t(`uebung.${ergebnis.hinweis}`), {});
    return undefined;
  });
</script>

<section class="uebung">
  <button class="zurueck" onclick={onzurueck}>← {t('uebung.zurueck')}</button>
  <h2>{ueberschrift}</h2>

  {#if !aufgabe}
    <p>
      {modus === 'wiederholen' && nummer > 0 ? t('wiederholen.fertig') : t('uebung.keine-aufgaben')}
    </p>
  {:else}
    {#key aufgabe}
      <article class="aufgabe" aria-live="polite">
        {#if modus === 'wiederholen'}
          <p class="herkunft">
            {aufgabe.kompetenz.titel.de} · {t(`niveau.${aufgabe.niveau === 'G' ? 'G' : 'M'}`)}
          </p>
        {/if}
        <p class="text">
          <Textteile teile={fuelle(aufgabe.vorlage.text.aufgabe.de, aufgabe.instanz.platzhalter)} />
        </p>
        {#if aufgabe.instanz.bild}
          <figure class="bild" role="img" aria-label={aufgabe.instanz.bild.beschreibung.de}>
            <!-- SVG stammt aus unseren Generatoren (Code, kein Paketinhalt);
                 die Pflicht-Tests schließen Skripte und Verweise aus. -->
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html aufgabe.instanz.bild.svg}
          </figure>
        {/if}

        <Eingabe
          instanz={aufgabe.instanz}
          typ={aufgabe.vorlage.typ}
          gesperrt={ergebnis !== undefined}
          onantwort={beantwortet}
        />

        <div class="knoepfe">
          {#if ergebnis === undefined}
            <button type="submit" form="antwort" class="haupt">{t('uebung.pruefen')}</button>
            {#if hilfen < aufgabe.vorlage.hilfen.length}
              <button onclick={() => (hilfen += 1)}>
                {hilfen === 0 ? t('uebung.hilfe') : t('uebung.weitere-hilfe')}
              </button>
            {/if}
          {/if}
        </div>

        {#if hilfen > 0 && ergebnis === undefined}
          <ul class="hilfen">
            {#each aufgabe.vorlage.hilfen.slice(0, hilfen) as hilfe, i (i)}
              <li><Textteile teile={fuelle(hilfe.de, aufgabe.instanz.platzhalter)} /></li>
            {/each}
          </ul>
        {/if}

        {#if ergebnis}
          <div class="rueckmeldung" class:richtig={ergebnis.richtig} role="status">
            <p class="urteil">{ergebnis.richtig ? t('uebung.richtig') : t('uebung.falsch')}</p>
            {#if rueckmeldung}<p><Textteile teile={rueckmeldung} /></p>{/if}
            {#if kommaHinweis}<p>{t('uebung.punkt-statt-komma')}</p>{/if}
          </div>
          <details class="weg" bind:open={wegOffen}>
            <summary>{t('uebung.loesungsweg')}</summary>
            <ol>
              {#each aufgabe.instanz.loesungsweg as schritt, i (i)}
                <li>{schritt.de}</li>
              {/each}
            </ol>
          </details>
          <div class="knoepfe">
            <button class="haupt" onclick={weiter}>{t('uebung.weiter')}</button>
          </div>
        {/if}
      </article>
    {/key}
  {/if}
</section>

<style>
  .uebung {
    display: grid;
    gap: var(--abstand-m);
  }

  h2 {
    margin-block: 0;
  }

  .aufgabe {
    background: var(--farbe-flaeche);
    border: 1px solid var(--farbe-rand);
    border-radius: var(--radius);
    padding-block: var(--abstand-m);
    padding-inline: var(--abstand-m);
  }

  .herkunft {
    color: var(--farbe-text-leise);
    font-size: 1rem;
    margin-block-start: 0;
  }

  .text {
    font-size: 1.25rem;
    margin-block-start: 0;
  }

  .bild {
    margin-inline: 0;
    max-inline-size: 26rem;
  }

  .bild :global(svg) {
    inline-size: 100%;
    block-size: auto;
  }

  .knoepfe {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
  }

  button {
    font: inherit;
    min-block-size: 2.75rem;
    padding-inline: var(--abstand-m);
    border-radius: var(--radius);
    border: 2px solid var(--farbe-akzent);
    background: transparent;
    color: var(--farbe-text);
    cursor: pointer;
  }

  .haupt {
    background: var(--farbe-akzent);
    color: var(--farbe-hintergrund);
  }

  .zurueck {
    justify-self: start;
    border-color: transparent;
    padding-inline: 0;
  }

  .hilfen {
    color: var(--farbe-text-leise);
  }

  .rueckmeldung {
    margin-block-start: var(--abstand-m);
    border-inline-start: 4px solid var(--farbe-akzent);
    padding-inline-start: var(--abstand-m);
  }

  .rueckmeldung.richtig {
    border-inline-start-color: #3f7d3a;
  }

  .urteil {
    font-weight: bold;
    font-size: 1.25rem;
  }

  .weg summary {
    cursor: pointer;
    font-weight: bold;
  }
</style>
