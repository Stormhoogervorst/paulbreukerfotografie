/**
 * Contactformulier (/contact, sectie "Stuur een bericht"): velden, Zod-schema en mailteksten.
 *
 * - `velden` is de configuratie waaruit LandingFormulier.astro het formulier rendert (volgorde van boven naar beneden).
 * - `schema` valideert altijd op de server (src/pages/api/aanvraag.ts); de browservalidatie is alleen een extra.
 * - Mails zijn platte tekst. Alles wat in een onderwerp komt, gaat door `eenRegel()` (geen regeleinden). De mail naar
 *   Paul heeft als reply-to het e-mailadres van de afzender (zie aanvraag.ts).
 * - Gedeelde onderdelen (e-mail, telefoon, mailhulpen) staan in gedeeld.ts.
 */
import { z } from 'zod';
import {
  bevestigingsMail,
  eenRegel,
  emailSchema,
  emailVeld,
  enkeleRegel,
  keuze,
  meerdereRegelsTekst,
  optieLabel,
  regels,
  telefoonSchema,
  telefoonVeld,
  veldLabel,
  verstuurdVia,
} from './gedeeld';
import type { VeldConfig, VeldOptie } from './types';

export const type = 'contact' as const;

/** Pagina met het formulier (voor "Terug naar het formulier" op de foutpagina zonder JavaScript). */
export const terug = '/contact#formulier';

// ---------------------------------------------------------------------------
// Meldingen (één bron voor het schema en de browservalidatie)
// ---------------------------------------------------------------------------

const MELDING = {
  naamLeeg: 'Vul je naam in.',
  naamLang: 'Gebruik maximaal 120 tekens.',
  onderwerp: 'Kies waar het over gaat.',
  berichtLeeg: 'Schrijf een bericht.',
  berichtKort: 'Schrijf minimaal 10 tekens.',
  berichtLang: 'Gebruik maximaal 2000 tekens.',
} as const;

const BERICHT_MIN = 10;
const BERICHT_MAX = 2000;

// ---------------------------------------------------------------------------
// Opties
// ---------------------------------------------------------------------------

export const ONDERWERPEN: VeldOptie[] = [
  { waarde: 'bruiloft', label: 'Een bruiloft' },
  { waarde: 'portret', label: 'Een portretfoto' },
  { waarde: 'zakelijk', label: 'Zakelijk of LinkedIn' },
  { waarde: 'boek', label: 'Een boek of magazine bestellen' },
  { waarde: 'pers', label: 'Exposities of pers' },
  { waarde: 'anders', label: 'Iets anders' },
];

// ---------------------------------------------------------------------------
// Velden (configuratie voor het renderen)
// ---------------------------------------------------------------------------

export const velden: VeldConfig[] = [
  {
    type: 'text',
    naam: 'naam',
    label: 'Jouw naam',
    verplicht: true,
    autocomplete: 'name',
    maxlength: 120,
    meldingen: { leeg: MELDING.naamLeeg, ongeldig: MELDING.naamLang },
  },
  emailVeld(),
  telefoonVeld(),
  {
    type: 'select',
    naam: 'onderwerp',
    label: 'Waar gaat het over?',
    verplicht: true,
    opties: ONDERWERPEN,
    meldingen: { leeg: MELDING.onderwerp, ongeldig: MELDING.onderwerp },
  },
  {
    type: 'textarea',
    naam: 'bericht',
    label: 'Vertel me waar ik je mee kan helpen',
    verplicht: true,
    rijen: 5,
    minlength: BERICHT_MIN,
    maxlength: BERICHT_MAX,
    // De browser kan alleen "te kort" melden (maxlength houdt het typen bij 2000 tekens tegen).
    meldingen: { leeg: MELDING.berichtLeeg, ongeldig: MELDING.berichtKort },
  },
];

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const schema = z.object({
  naam: enkeleRegel(120, MELDING.naamLeeg, MELDING.naamLang),
  email: emailSchema,
  telefoon: telefoonSchema,
  onderwerp: keuze(ONDERWERPEN, MELDING.onderwerp),
  bericht: z
    .string({ error: MELDING.berichtLeeg })
    .trim()
    .min(1, MELDING.berichtLeeg)
    .min(BERICHT_MIN, MELDING.berichtKort)
    .max(BERICHT_MAX, MELDING.berichtLang)
    .transform(meerdereRegelsTekst),
});

export type Aanvraag = z.output<typeof schema>;

// ---------------------------------------------------------------------------
// Mails
// ---------------------------------------------------------------------------

const label = (naam: string): string => veldLabel(velden, naam);

/** Alle velden als [label, waarde], in de volgorde van het formulier; `undefined` = niet ingevuld. */
function waarden(data: Aanvraag): Array<[string, string | undefined]> {
  return [
    [label('naam'), data.naam],
    [label('email'), data.email],
    [label('telefoon'), data.telefoon],
    [label('onderwerp'), optieLabel(ONDERWERPEN, data.onderwerp)],
    [label('bericht'), data.bericht],
  ];
}

export function onderwerp(data: Aanvraag): string {
  return eenRegel(`Nieuw bericht via contactformulier: ${data.naam}, ${optieLabel(ONDERWERPEN, data.onderwerp)}`);
}

// TODO(paul): mailteksten laten goedkeuren (ik-vorm, toon, termijn van 3 werkdagen).
export function tekst(data: Aanvraag): string {
  const alles = waarden(data).map(([naam, waarde]): [string, string] => [naam, waarde ?? 'niet ingevuld']);
  return `${regels(alles)}\n\n${verstuurdVia('/contact')}\n`;
}

export function bevestiging(data: Aanvraag): { onderwerp: string; tekst: string } {
  const ingevuld = waarden(data).filter((paar): paar is [string, string] => paar[1] !== undefined);
  return {
    onderwerp: 'Bedankt voor je bericht, ik reageer binnen 3 werkdagen',
    tekst: bevestigingsMail({
      aanhef: `Hoi ${data.naam},`,
      opening: 'Bedankt voor je bericht. Ik heb het ontvangen en reageer binnen 3 werkdagen.',
      ingevuld: regels(ingevuld),
    }),
  };
}

/** De drie stappen op /bedankt ("Wat gebeurt er nu?"). */
// TODO(paul): bevestig dat dit proces klopt (drie stappen).
export const stappen = [
  'Ik lees je bericht.',
  'Ik antwoord je binnen 3 werkdagen per e-mail.',
  'Wil je iets toevoegen? Beantwoord dan de bevestigingsmail.',
];
