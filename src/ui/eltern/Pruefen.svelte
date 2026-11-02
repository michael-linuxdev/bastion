<script lang="ts">
  // Für Lehrkräfte: Inhalte prüfen (FOKUS F3, PV 02.11.2026: Prüfseite in der App statt als
  // Artefakt). Der Bogen kommt als Daten aus dem Kern (src/core/learning/pruefbogen.ts), wie
  // beim Druckbogen `pnpm pruefbogen`. Urteile bleiben auf dem Gerät (Einstellung `pruefen.*`)
  // und gehen als Datei zurück („Ergebnis herunterladen“), ohne Netzwerk. Die Datei liest
  // `pnpm pruefbogen einlesen`.
  import type { Kompetenz } from '../../core/competence/kompetenz';
  import { loesungAlsText, optionsBuchstabe } from '../../core/learning/arbeitsblatt';
  import type { Begriff } from '../../core/learning/begriffe';
  import type { Fehlvorstellung } from '../../core/learning/fehlvorstellung';
  import type { Generator, Wert } from '../../core/learning/generator';
  import {
    abschnitte,
    beurteilt,
    exportDokumente,
    KOPF,
    pruefbogenModell,
    SCHRITT_URTEILE,
    setze,
    type AntwortZeile,
    type Bewertung,
    type Verweis,
    type Werte,
  } from '../../core/learning/pruefbogen';
  import { fuelle } from '../../core/learning/text';
  import type { Vermittlung } from '../../core/learning/vermittlung';
  import type { GeneratorVorlage } from '../../core/learning/vorlage';
  import { generatoren } from '../../generators';
  import { pruefAbschnittSpeichern, pruefBewertungLaden } from '../plattform/ablage';
  import Textteile from '../ueben/Textteile.svelte';
  import { KLASSEN } from '../ueben/klassen';
  import { WERKZEUG_KOMPONENTEN } from '../vermittlung/werkzeuge';
  import { t, type TextSchluessel } from '../texte/texte';
  import PruefUrteil from './PruefUrteil.svelte';

  let {
    kompetenzen,
    vorlagen,
    vermittlungen,
    fehlvorstellungen,
    begriffe,
    klasse,
  }: {
    kompetenzen: readonly Kompetenz[];
    vorlagen: readonly GeneratorVorlage[];
    vermittlungen: ReadonlyMap<string, Vermittlung>;
    fehlvorstellungen: ReadonlyMap<string, Fehlvorstellung>;
    begriffe: readonly Begriff[];
    klasse: number;
  } = $props();

  let offen = $state(false);
  // Startwert aus der Klasse des Kindes; danach unabhängig davon
  // svelte-ignore state_referenced_locally
  let filterKlasse = $state(klasse);
  let filterBereich = $state('');
  let gewaehlt = $state<string[]>([]);
  let bewertung = $state<Bewertung>({});
  let stand = $state<Record<string, string>>({});
  let status = $state<'' | 'speichert' | 'gespeichert' | 'fehler'>('');
  let geladen = false;

  const gens = generatoren as ReadonlyMap<string, Generator<unknown>>;
  const pruefbar = $derived(
    kompetenzen.filter(
      (k) => vermittlungen.has(k.id) || vorlagen.some((v) => v.kompetenz === k.id),
    ),
  );
  const bereiche = $derived([...new Set(pruefbar.map((k) => k.bereich))]);
  const angeboten = $derived(
    pruefbar.filter(
      (k) =>
        k.klassenstufe_typisch.includes(filterKlasse) &&
        (filterBereich === '' || k.bereich === filterBereich),
    ),
  );
  const bogen = $derived(
    pruefbogenModell({
      // in der Reihenfolge des Lehrplans, nicht der Klicks
      kompetenzen: pruefbar.filter((k) => gewaehlt.includes(k.id)),
      alleKompetenzen: new Map(kompetenzen.map((k) => [k.id, k])),
      vermittlungen,
      vorlagen,
      fehlvorstellungen,
      begriffe,
      generatoren: gens,
    }),
  );
  const ids = $derived(abschnitte(bogen).map((a) => a.id));
  const fertig = $derived(beurteilt(bewertung, ids));

  async function oeffnen() {
    offen = !offen;
    if (!offen || geladen) return;
    geladen = true;
    try {
      const alt = await pruefBewertungLaden();
      // Eingaben, die vor dem Laden schon gemacht wurden, gewinnen
      bewertung = { ...alt.bewertung, ...bewertung };
      stand = { ...alt.stand, ...stand };
      const gewaehltFrueher = Object.keys(alt.bewertung)
        .filter((id) => id.startsWith('A-'))
        .map((id) => id.slice(2))
        .filter((id) => pruefbar.some((k) => k.id === id));
      if (gewaehlt.length === 0) gewaehlt = gewaehltFrueher;
    } catch {
      status = 'fehler';
    }
  }

  function umschalten(id: string, an: boolean) {
    gewaehlt = an ? [...gewaehlt, id] : gewaehlt.filter((x) => x !== id);
  }

  // Speichern je Abschnitt, Text erst nach einer kurzen Pause (ein Ereignis statt eines je Taste)
  // Kein Zustand der Oberfläche, nur Zeitgeber: darum ein einfaches Objekt
  const warten: Record<string, ReturnType<typeof setTimeout> | undefined> = {};
  const wartend = () => Object.values(warten).some((z) => z !== undefined);
  async function speichern(abschnitt: string) {
    warten[abschnitt] = undefined;
    try {
      await pruefAbschnittSpeichern(abschnitt, bewertung[abschnitt] ?? {});
      if (!wartend() && status !== 'fehler') status = 'gespeichert';
    } catch {
      status = 'fehler';
    }
  }
  function feld(abschnitt: string, f: string, wert: string | boolean) {
    bewertung = setze(bewertung, abschnitt, f, wert);
    stand = { ...stand, [abschnitt]: new Date().toISOString() };
    if (status !== 'fehler') status = 'speichert';
    clearTimeout(warten[abschnitt]);
    warten[abschnitt] = setTimeout(
      () => void speichern(abschnitt),
      typeof wert === 'string' ? 700 : 0,
    );
  }
  // Beim Verlassen nichts verlieren
  $effect(() => () => {
    for (const [abschnitt, zeit] of Object.entries(warten)) {
      if (zeit === undefined) continue;
      clearTimeout(zeit);
      void speichern(abschnitt);
    }
  });

  const werte = (abschnitt: string): Werte => bewertung[abschnitt] ?? {};
  const text = (w: Werte, f: string) => (typeof w[f] === 'string' ? (w[f] as string) : '');

  function herunterladen() {
    const datei = JSON.stringify(exportDokumente(bewertung, stand), null, 2);
    const url = URL.createObjectURL(new Blob([datei], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `bastion-pruefung-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }

  // Platzhalter ohne Wert (Rückmeldungen ohne konkrete Aufgabe) bleiben als ‹name› stehen,
  // wie im Druckbogen (tools/pruefbogen/satz.ts)
  const teile = (s: string, platzhalter: Readonly<Record<string, Wert>> = {}) =>
    fuelle(
      s.replace(/\{([a-z_]+)\}/g, (m, name: string) => (name in platzhalter ? m : `‹${name}›`)),
      platzhalter,
    );
  const kompetenzTitel = (id: string) => kompetenzen.find((k) => k.id === id)?.titel.de ?? id;
  const fvName = (id: string) => fehlvorstellungen.get(id)?.name.de ?? id;
  function ziel(z: Verweis | undefined): string {
    if (!z || z.art === 'weiter') return t('pruefen.weiter');
    if (z.art === 'schritt') return `${t('pruefen.schritt')} ${z.nr}`;
    if (z.art === 'erstvermittlung')
      return `${t('pruefen.erklaerung')} „${z.titel}“, ${t('pruefen.schritt')} ${z.nr ?? z.schritt}`;
    if (z.art === 'voraussetzung') return `${t('pruefen.voraussetzung')} „${z.titel}“`;
    return z.text;
  }
  const antwortWert = (a: AntwortZeile) =>
    a.eingabe ? [{ art: 'text' as const, text: a.wert, fett: false }] : teile(a.wert);
</script>

<section class="werkstatt-block lehrkraft" aria-labelledby="eltern-pruefen">
  <h3 id="eltern-pruefen">{t('pruefen.titel')}</h3>
  <p class="leise">{t('pruefen.text')}</p>
  <button type="button" aria-expanded={offen} onclick={oeffnen}
    >{offen ? t('pruefen.zuklappen') : t('pruefen.oeffnen')}</button
  >

  {#if offen}
    <div class="felder">
      <label
        >{t('pruefen.name')}
        <input
          type="text"
          autocomplete="name"
          maxlength="120"
          value={text(werte(KOPF), 'name')}
          oninput={(e) => feld(KOPF, 'name', e.currentTarget.value)}
        /></label
      >
      <label
        >{t('pruefen.schule')}
        <input
          type="text"
          maxlength="200"
          value={text(werte(KOPF), 'schule')}
          oninput={(e) => feld(KOPF, 'schule', e.currentTarget.value)}
        /></label
      >
    </div>

    <fieldset>
      <legend>{t('pruefen.themen')}</legend>
      <div class="felder">
        <label
          >{t('pruefen.klasse')}
          <select bind:value={filterKlasse}>
            {#each KLASSEN as k (k)}<option value={k}>{k}</option>{/each}
          </select></label
        >
        <label
          >{t('blatt.bereich')}
          <select bind:value={filterBereich}>
            <option value="">{t('blatt.alle-bereiche')}</option>
            {#each bereiche as b (b)}<option value={b}>{t(`bereich.${b}` as TextSchluessel)}</option
              >{/each}
          </select></label
        >
      </div>
      <ul class="themen">
        {#each angeboten as k (k.id)}
          <li>
            <label class="haken"
              ><input
                type="checkbox"
                checked={gewaehlt.includes(k.id)}
                onchange={(e) => umschalten(k.id, e.currentTarget.checked)}
              />
              {k.titel.de}</label
            >
          </li>
        {:else}
          <li class="leise">{t('blatt.keine-themen')}</li>
        {/each}
      </ul>
      {#if gewaehlt.length > 0}
        <p class="leise" data-gewaehlt>
          {t('blatt.gewaehlt')}
          {gewaehlt.map(kompetenzTitel).join(' · ')}
        </p>
      {/if}
    </fieldset>

    {#if gewaehlt.length === 0}
      <p class="leise" role="status">{t('pruefen.erst-waehlen')}</p>
    {:else}
      <div class="leiste">
        <nav aria-label={t('pruefen.teile')}>
          <a href="#pruefen-a">{t('pruefen.sprung-a')}</a>
          <a href="#pruefen-b">{t('pruefen.sprung-b')}</a>
          <a href="#pruefen-c">{t('pruefen.sprung-c')}</a>
          <a href="#pruefen-d">{t('pruefen.sprung-d')}</a>
          <a href="#pruefen-ende">{t('pruefen.sprung-ende')}</a>
        </nav>
        <p class="stand" data-fortschritt>
          {fertig}
          {t('pruefen.von')}
          {ids.length}
          {t('pruefen.beurteilt')}
        </p>
        <p class="leise" role="status" data-speicher>
          {status ? t(`pruefen.status-${status}` as TextSchluessel) : ''}
        </p>
      </div>
      <p class="hinweis">{t('pruefen.anleitung')}</p>

      <h4 class="teil" id="pruefen-a">{t('pruefen.teil-a')}</h4>
      {#each bogen.a as a, i (a.id)}
        <section class="abschnitt" data-abschnitt={a.id}>
          <h5>A{i + 1} {a.kompetenz.titel.de}</h5>
          <p>
            {a.kompetenz.kann_satz.de}
            <span class="leise"
              >({a.kompetenz.id}, {t('pruefen.klasse')}
              {a.kompetenz.klassenstufe_typisch.join('/')})</span
            >
          </p>
          {#if a.vermittlung}
            <p class="leise">
              {t('pruefen.etwa')}
              {a.vermittlung.dauer_min}
              {t('pruefen.minuten')} · {t('pruefen.niveau')}
              {a.vermittlung.niveau}
            </p>
            <ol class="schritte">
              {#each a.schritte as z (z.nr)}
                {@const s = z.schritt}
                {@const w = werte(a.id)}
                <li class="schritt" data-schritt={z.nr}>
                  <p class="art">
                    <span class="nr">{z.nr}</span>
                    {t(`vermittlung.typ.${s.typ}` as TextSchluessel)}
                  </p>
                  <p><Textteile teile={teile(s.text.de)} /></p>
                  {#if s.bild && WERKZEUG_KOMPONENTEN[s.bild.werkzeug]}
                    {@const W = WERKZEUG_KOMPONENTEN[s.bild.werkzeug]}
                    <div class="werkzeug"><W parameter={s.bild.parameter ?? {}} /></div>
                  {/if}
                  {#if s.werkzeug && WERKZEUG_KOMPONENTEN[s.werkzeug.id]}
                    {@const W = WERKZEUG_KOMPONENTEN[s.werkzeug.id]}
                    <p class="leise">{t('pruefen.zum-ausprobieren')}</p>
                    <div class="werkzeug"><W parameter={s.werkzeug.parameter ?? {}} /></div>
                  {/if}
                  {#if s.antwort}
                    <ul class="antworten">
                      {#each z.antworten as an, n (n)}
                        <li class:richtig={an.richtig}>
                          {an.richtig ? '✓' : '✗'}
                          {#if an.richtig && an.eingabe}{t('pruefen.eingabe')}{/if}
                          <Textteile teile={antwortWert(an)} erklaeren={false} />
                          {#if an.fv}
                            · {t('pruefen.fehler')}
                            {fvName(an.fv)} → {ziel(an.ziel)}
                          {/if}
                        </li>
                      {/each}
                      {#if z.sonst}<li>{t('pruefen.sonst')} → {ziel(z.sonst)}</li>{/if}
                    </ul>
                  {/if}
                  {#if s.vorlagen}
                    <p class="leise">{t('pruefen.danach')} {s.vorlagen.join(', ')}</p>
                  {/if}
                  <div
                    class="schritt-urteil"
                    role="group"
                    aria-label="{t('pruefen.urteil-schritt')} {z.nr}"
                  >
                    {#each SCHRITT_URTEILE as u (u)}
                      <label class="wahl"
                        ><input
                          type="radio"
                          name="{a.id}--s{z.nr}"
                          value={u}
                          checked={w[`s${z.nr}`] === u}
                          onchange={() => feld(a.id, `s${z.nr}`, u)}
                        />
                        {u === 'passt' ? t('pruefen.passt') : t('pruefen.passt-nicht')}</label
                      >
                    {/each}
                  </div>
                  <details class="kommentar" open={text(w, `k${z.nr}`) !== ''}>
                    <summary>{t('pruefen.kommentar')}</summary>
                    <textarea
                      rows="2"
                      maxlength="20000"
                      aria-label="{t('pruefen.kommentar-zu')} {z.nr}"
                      placeholder={t('pruefen.kommentar-hilfe')}
                      value={text(w, `k${z.nr}`)}
                      oninput={(e) => feld(a.id, `k${z.nr}`, e.currentTarget.value)}></textarea>
                  </details>
                </li>
              {/each}
            </ol>
          {:else}
            <p class="leise">{t('pruefen.keine-vermittlung')}</p>
          {/if}
          <PruefUrteil
            abschnitt={a.id}
            teil="A"
            werte={werte(a.id)}
            onfeld={(f, v) => feld(a.id, f, v)}
          />
        </section>
      {/each}

      <h4 class="teil" id="pruefen-b">{t('pruefen.teil-b')}</h4>
      {#each bogen.b as b (b.id)}
        {@const fv = b.fv}
        <section class="abschnitt" data-abschnitt={b.id}>
          <h5>{fv.name.de}</h5>
          <p class="leise">
            {fv.id} · {t('pruefen.art')}
            {fv.art} · {t('pruefen.gehoert-zu')}
            {fv.kompetenzen.map(kompetenzTitel).join(', ')}
          </p>
          <p><i>{t('pruefen.fuer-pruefende')}</i> {fv.beschreibung.de}</p>
          <dl>
            <dt>{t('pruefen.kurz')}</dt>
            <dd><Textteile teile={teile(fv.erklaerung.kurz.de)} /></dd>
            {#each fv.erklaerung.lang as teil (teil.teil)}
              <dt>{t(`fv.${teil.teil}` as TextSchluessel)}</dt>
              <dd>
                <Textteile teile={teile(teil.de)} />
                {#if teil.bild && WERKZEUG_KOMPONENTEN[teil.bild.werkzeug]}
                  {@const W = WERKZEUG_KOMPONENTEN[teil.bild.werkzeug]}
                  <div class="werkzeug"><W parameter={teil.bild.parameter ?? {}} /></div>
                {/if}
              </dd>
            {/each}
            <dt>{t('pruefen.gegenbeispiel')}</dt>
            <dd><Textteile teile={teile(fv.gegenbeispiel.de)} /></dd>
            <dt>{t('pruefen.rueckweg')}</dt>
            <dd>
              {ziel(b.rueckweg.erklaerung)}
              {#if b.rueckweg.voraussetzung}<br />{ziel(b.rueckweg.voraussetzung)}{/if}
            </dd>
            <dt>{t('pruefen.kontrast')}</dt>
            <dd>{fv.kontrast.join(', ')}</dd>
          </dl>
          {#if b.rueckmeldungen.length > 0}
            <p><b>{t('pruefen.rueckmeldungen')}</b></p>
            <ul class="rueckmeldungen">
              {#each b.rueckmeldungen as r, n (n)}
                <li>
                  <span class="quelle"
                    >{[
                      r.vorlage,
                      r.schritt ? `${t('pruefen.schritt')} ${r.schritt}` : '',
                      r.fehlerbild,
                    ]
                      .filter(Boolean)
                      .join(' · ')}</span
                  ><br /><Textteile teile={teile(r.text)} />
                </li>
              {/each}
            </ul>
          {/if}
          <PruefUrteil
            abschnitt={b.id}
            teil="B"
            werte={werte(b.id)}
            onfeld={(f, v) => feld(b.id, f, v)}
          />
        </section>
      {:else}
        <p class="leise">{t('pruefen.keine-fehler')}</p>
      {/each}

      <h4 class="teil" id="pruefen-c">{t('pruefen.teil-c')}</h4>
      {#each bogen.c as c (c.id)}
        {@const v = c.vorlage}
        {@const w = werte(c.id)}
        <section class="abschnitt" data-abschnitt={c.id}>
          <h5><Textteile teile={teile(v.text.aufgabe.de.replace(/\{[a-z_]+\}/g, '…'))} /></h5>
          <p class="leise">{v.id} · {t('pruefen.niveau')} {v.niveaus.join(', ')}</p>
          <p><b>{t('pruefen.hilfen')}</b></p>
          <ol>
            {#each v.hilfen as h, n (n)}<li><Textteile teile={teile(h.de)} /></li>{/each}
          </ol>
          <p><b>{t('pruefen.vorlage-rueckmeldungen')}</b></p>
          <ul class="rueckmeldungen">
            {#each Object.entries(v.fehlerbilder) as [id, f] (id)}
              <li><span class="quelle">{id}</span> <Textteile teile={teile(f.de)} /></li>
            {/each}
          </ul>
          {#if c.generatorFehlt}
            <p class="leise">{t('pruefen.generator-fehlt')}</p>
          {/if}
          {#each c.niveaus as n (n.niveau)}
            <h6>
              {t('pruefen.niveau')}
              {n.niveau}: {n.aufgaben.length}
              {t('pruefen.beispielaufgaben')}
            </h6>
            <ol class="aufgaben">
              {#each n.aufgaben as i, k (k)}
                {@const nr = k + 1}
                <li class="aufgabe" data-aufgabe>
                  <label class="stimmt"
                    ><input
                      type="checkbox"
                      aria-label="{t('pruefen.zeile-stimmt')} {n.niveau}{nr}"
                      checked={w[`${n.niveau}${nr}`] === true}
                      onchange={(e) => feld(c.id, `${n.niveau}${nr}`, e.currentTarget.checked)}
                    />
                    {t('pruefen.stimmt')}</label
                  >
                  <p>
                    <span class="nr">{nr}</span>
                    <Textteile teile={teile(v.text.aufgabe.de, i.platzhalter)} erklaeren={false} />
                  </p>
                  {#if i.bild}
                    <figure class="bild" role="img" aria-label={i.bild.beschreibung.de}>
                      <!-- SVG stammt aus unseren Generatoren (Code, kein Paketinhalt);
                           die Pflicht-Tests schließen Skripte und Verweise aus. -->
                      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                      {@html i.bild.svg}
                    </figure>
                  {/if}
                  {#if i.optionen}
                    <div class="optionen">
                      {#each i.optionen as o, m (m)}
                        <span class="option"
                          ><b>{optionsBuchstabe(m)}</b>
                          {#if o.text}<Textteile teile={teile(o.text.de)} erklaeren={false} />{/if}
                          {#if o.bild}
                            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                            {@html o.bild.svg}
                          {/if}</span
                        >
                      {/each}
                    </div>
                  {/if}
                  <p>
                    {t('pruefen.loesung')}: <b>{loesungAlsText(i.loesung, i.optionen)}</b>
                  </p>
                  {#if i.fehlerbilder.length > 0}
                    <p class="leise">
                      {t('pruefen.erkannt')}:
                      {i.fehlerbilder
                        .map((f) => `${loesungAlsText(f.antwort, i.optionen)} (${f.id})`)
                        .join(' · ')}
                    </p>
                  {/if}
                </li>
              {/each}
            </ol>
            {#if n.weg}
              <p>
                <b>{t('pruefen.zwischenschritte')}</b>
                <Textteile
                  teile={teile(v.text.aufgabe.de, n.weg.beispiel.platzhalter)}
                  erklaeren={false}
                />
              </p>
              <ol class="weg">
                {#each n.weg.zeilen as z (z.id)}
                  <li>
                    {#if z.frage}<Textteile
                        teile={teile(z.frage, z.platzhalter)}
                        erklaeren={false}
                      />{:else}{z.id}{/if}
                    → <b>{loesungAlsText(z.loesung)}</b>
                    {#if z.falsch.length > 0}
                      · {t('pruefen.falsch-erkannt')}
                      {z.falsch.map((f) => `${loesungAlsText(f.antwort)} (${f.id})`).join(', ')}
                    {/if}
                  </li>
                {/each}
              </ol>
            {/if}
          {/each}
          <PruefUrteil abschnitt={c.id} teil="C" werte={w} onfeld={(f, x) => feld(c.id, f, x)} />
        </section>
      {:else}
        <p class="leise">{t('pruefen.keine-vorlagen')}</p>
      {/each}

      <h4 class="teil" id="pruefen-d">{t('pruefen.teil-d')}</h4>
      <section class="abschnitt" data-abschnitt={bogen.d.id}>
        {#if bogen.d.begriffe.length === 0}
          <p class="leise">{t('pruefen.keine-begriffe')}</p>
        {/if}
        <ul class="begriffe">
          {#each bogen.d.begriffe as b, n (b.id)}
            {@const w = werte(bogen.d.id)}
            <li>
              <label class="stimmt"
                ><input
                  type="checkbox"
                  aria-label="{t('pruefen.zeile-stimmt')} {b.wort.de}"
                  checked={w[`b${n + 1}`] === true}
                  onchange={(e) => feld(bogen.d.id, `b${n + 1}`, e.currentTarget.checked)}
                />
                {t('pruefen.stimmt')}</label
              >
              <b>{b.wort.de}</b>: <Textteile teile={teile(b.erklaerung.de)} erklaeren={false} />
            </li>
          {/each}
        </ul>
        <PruefUrteil
          abschnitt={bogen.d.id}
          teil="D"
          werte={werte(bogen.d.id)}
          onfeld={(f, v) => feld(bogen.d.id, f, v)}
        />
      </section>

      <section class="ende" id="pruefen-ende">
        <h4>{t('pruefen.gesamt-titel')}</h4>
        <label class="notiz"
          >{t('pruefen.gesamt')}
          <textarea
            rows="4"
            maxlength="20000"
            value={text(werte(KOPF), 'gesamt')}
            oninput={(e) => feld(KOPF, 'gesamt', e.currentTarget.value)}></textarea></label
        >
        <button type="button" class="haupt" onclick={herunterladen}
          >{t('pruefen.herunterladen')}</button
        >
        <p class="leise">{t('pruefen.herunterladen-hinweis')}</p>
      </section>
    {/if}
  {/if}
</section>

<style>
  .lehrkraft {
    display: grid;
    gap: var(--abstand-s);
    min-inline-size: 0;
  }
  fieldset {
    border: 1px solid var(--farbe-rand);
    border-radius: var(--radius);
    padding: var(--abstand-s);
    margin: 0;
    min-inline-size: 0;
  }
  .felder {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
    align-items: end;
  }
  .felder label {
    display: grid;
    gap: 0.25rem;
    flex: 1 1 12rem;
    min-inline-size: 0;
  }
  .themen {
    list-style: none;
    padding: 0;
    margin-block: var(--abstand-s) 0;
    display: grid;
    gap: 0.25rem;
    max-block-size: 16rem;
    overflow-y: auto;
  }
  .haken,
  .stimmt {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    min-block-size: 2.75rem;
  }
  .leiste {
    position: sticky;
    inset-block-start: 0;
    z-index: 2;
    background: var(--farbe-flaeche-leise);
    border-block-end: 1px solid var(--farbe-rand);
    padding-block: 0.4rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem var(--abstand-s);
    align-items: center;
  }
  .leiste nav {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  .leiste a {
    color: var(--farbe-akzent);
    padding: 0.3rem 0.5rem;
    font-weight: 700;
    font-size: 0.9rem;
  }
  .leiste p {
    margin: 0;
    font-size: 0.9rem;
  }
  .hinweis {
    margin: 0;
  }
  h4.teil {
    margin-block: var(--abstand-m) 0;
    padding-block-end: 0.25rem;
    border-block-end: 2px solid var(--farbe-text);
    scroll-margin-block-start: 4rem;
  }
  .abschnitt {
    display: grid;
    /* lange Kennungen ohne Leerzeichen dürfen die Spalte nicht verbreitern */
    grid-template-columns: minmax(0, 1fr);
    gap: 0.4rem;
    min-inline-size: 0;
    overflow-wrap: anywhere;
  }
  .abschnitt h5,
  .abschnitt h6 {
    margin-block: var(--abstand-s) 0;
  }
  .abschnitt p,
  dl {
    margin: 0;
  }
  dd {
    margin-inline-start: 1rem;
  }
  dt {
    font-weight: 700;
    margin-block-start: 0.4rem;
  }
  .schritte,
  .aufgaben {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: var(--abstand-s);
  }
  .schritt,
  .aufgabe {
    border: 1px solid var(--farbe-rand);
    border-radius: var(--radius);
    padding: var(--abstand-s);
    display: grid;
    gap: 0.4rem;
    min-inline-size: 0;
    overflow-wrap: anywhere;
  }
  .art {
    font-weight: 700;
  }
  .nr {
    display: inline-block;
    min-inline-size: 1.6rem;
    color: var(--farbe-text-leise);
    font-variant-numeric: tabular-nums;
  }
  .werkzeug {
    max-inline-size: 100%;
    overflow-x: auto;
  }
  .antworten {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 0.15rem;
  }
  .antworten .richtig {
    font-weight: 700;
    color: var(--farbe-erfolg);
  }
  .schritt-urteil {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .wahl {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-block-size: 2.75rem;
    padding-inline: 0.8rem;
    border: 1px solid var(--farbe-rand);
    border-radius: 2rem;
    font-weight: 700;
  }
  .wahl:has(input:checked) {
    border-color: var(--farbe-text);
    background: var(--farbe-flaeche);
  }
  .kommentar summary {
    cursor: pointer;
    font-weight: 700;
    min-block-size: 2.75rem;
    display: flex;
    align-items: center;
    color: var(--farbe-akzent);
  }
  textarea,
  input[type='text'] {
    font: inherit;
    inline-size: 100%;
    box-sizing: border-box;
  }
  .rueckmeldungen,
  .begriffe {
    display: grid;
    gap: 0.4rem;
    padding-inline-start: 1rem;
    margin: 0;
  }
  .begriffe {
    list-style: none;
    padding: 0;
  }
  .quelle {
    font-size: 0.8rem;
    color: var(--farbe-text-leise);
    overflow-wrap: anywhere;
  }
  .bild :global(svg),
  .option :global(svg) {
    max-inline-size: 9rem;
    max-block-size: 5rem;
    block-size: auto;
    background: #fff;
    border-radius: 0.25rem;
  }
  .optionen {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .option {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
  .bild {
    margin: 0;
  }
  .ende {
    display: grid;
    gap: var(--abstand-s);
    margin-block-start: var(--abstand-m);
    padding: var(--abstand-s);
    border: 2px solid var(--farbe-akzent);
    border-radius: var(--radius);
  }
  .ende h4 {
    margin: 0;
  }
  .notiz {
    display: grid;
    gap: 0.25rem;
    font-weight: 700;
  }
  .weg {
    margin: 0;
  }
</style>
