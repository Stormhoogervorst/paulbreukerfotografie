/**
 * Bruiloftaanvraag (/fotograaf-bruiloft, sectie Aanvraagformulier): velden, Zod-schema en mailteksten.
 *
 * - `velden` is de configuratie waaruit LandingFormulier.astro het formulier rendert (volgorde van boven naar beneden).
 * - `schema` valideert altijd op de server (src/pages/api/aanvraag.ts); de browservalidatie is alleen een extra.
 * - Het veld "pakket" (gewenst pakket) heeft de opties Digitaal (digitaal), Volledig analoog (analoog), Combinatie
 *   (combinatie) en Nog niet zeker (onbekend). De eerste twee komen uit de pakkettendata (src/data/landing/bruiloft-pakketten.ts;
 *   waarde is de slug van de cta, label de naam). De cta's op de pakketkaarten (data-pakket) en de link "op aanvraag" in de
 *   noot onder de pakketten (data-pakket="combinatie") vullen het veld vooraf in (src/scripts/formulier.ts).
 * - Mails zijn platte tekst. Alles wat in een onderwerp komt, gaat door `eenRegel()` (geen regeleinden).
 */
import { z } from 'zod';
import { pakketten } from '../../data/landing/bruiloft-pakketten';
import {
  bevestigingsMail,
  eenRegel,
  emailSchema,
  emailVeld,
  enkeleRegel,
  kanaalSchema,
  keuze,
  kanaalVeld,
  optieLabel,
  optioneel,
  regels,
  telefoonSchema,
  telefoonVeld,
  veldLabel,
  verstuurdVia,
  KANALEN,
} from './gedeeld';
import type { VeldConfig, VeldOptie } from './types';

export { eenRegel, KANALEN };

export const type = 'bruiloft' as const;

// ---------------------------------------------------------------------------
// Meldingen (één bron voor het schema en de browservalidatie)
// ---------------------------------------------------------------------------

const MELDING = {
  datumLeeg: 'Kies een trouwdatum of vink “We hebben nog geen datum” aan.',
  datumFormaat: 'Vul een geldige datum in.',
  datumVerleden: 'Kies een datum vanaf vandaag.',
  locatieLeeg: 'Vul de locatie van de bruiloft in.',
  locatieLang: 'Gebruik maximaal 160 tekens.',
  namenLeeg: 'Vul jullie namen in.',
  namenLang: 'Gebruik maximaal 120 tekens.',
  pakket: 'Kies een optie.',
} as const;

// ---------------------------------------------------------------------------
// Opties
// ---------------------------------------------------------------------------

export const PAKKETTEN: VeldOptie[] = [
  ...pakketten.items.map((pakket) => ({ waarde: pakket.cta.pakket, label: pakket.naam })),
  { waarde: 'combinatie', label: 'Combinatie' },
  { waarde: 'onbekend', label: 'Nog niet zeker' },
];

// ---------------------------------------------------------------------------
// Velden (configuratie voor het renderen)
// ---------------------------------------------------------------------------

export const velden: VeldConfig[] = [
  {
    type: 'date',
    naam: 'datum',
    label: 'Trouwdatum',
    verplicht: true,
    nietVerplichtAls: 'geenDatum',
    meldingen: { leeg: MELDING.datumLeeg, ongeldig: MELDING.datumVerleden },
  },
  { type: 'checkbox', naam: 'geenDatum', label: 'We hebben nog geen datum', verplicht: false },
  {
    type: 'text',
    naam: 'locatie',
    label: 'Locatie van de bruiloft',
    verplicht: true,
    hulptekst: 'Plaats of locatie, ook als nog niet zeker is',
    maxlength: 160,
    meldingen: { leeg: MELDING.locatieLeeg, ongeldig: MELDING.locatieLang },
  },
  {
    type: 'text',
    naam: 'namen',
    label: 'Jullie namen',
    verplicht: true,
    autocomplete: 'name',
    maxlength: 120,
    meldingen: { leeg: MELDING.namenLeeg, ongeldig: MELDING.namenLang },
  },
  emailVeld(),
  telefoonVeld(),
  {
    type: 'select',
    naam: 'pakket',
    label: 'Gewenst pakket',
    verplicht: true,
    opties: PAKKETTEN,
    meldingen: { leeg: MELDING.pakket, ongeldig: MELDING.pakket },
  },
  kanaalVeld(),
];

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

/** Vandaag in Nederland als YYYY-MM-DD (de server draait in UTC). */
function vandaag(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Amsterdam' }).format(new Date());
}

/** Bestaat deze kalenderdatum echt (geen 2027-02-31)? */
function bestaandeDatum(iso: string): boolean {
  const datum = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(datum.getTime()) && datum.toISOString().slice(0, 10) === iso;
}

const ISO_DATUM = /^\d{4}-\d{2}-\d{2}$/;

const basis = z.object({
  datum: optioneel(z.string()),
  // Een checkbox stuurt "on" (formulier) of true (JSON); alles anders telt als niet aangevinkt.
  geenDatum: z.preprocess((waarde) => waarde === true || waarde === 'on' || waarde === 'true' || waarde === '1', z.boolean()),
  locatie: enkeleRegel(160, MELDING.locatieLeeg, MELDING.locatieLang),
  namen: enkeleRegel(120, MELDING.namenLeeg, MELDING.namenLang),
  email: emailSchema,
  telefoon: telefoonSchema,
  pakket: keuze(PAKKETTEN, MELDING.pakket),
  kanaal: kanaalSchema,
});

/** Foutmelding voor de datum, of `null` als die klopt of niet nodig is. */
function datumFout(data: { datum?: string; geenDatum: boolean }): string | null {
  if (data.geenDatum) return null;
  if (data.datum === undefined) return MELDING.datumLeeg;
  if (!ISO_DATUM.test(data.datum) || !bestaandeDatum(data.datum)) return MELDING.datumFormaat;
  if (data.datum < vandaag()) return MELDING.datumVerleden;
  return null;
}

export const schema = basis
  .refine((data) => datumFout(data) === null, {
    path: ['datum'],
    error: (probleem) => datumFout(probleem.input as { datum?: string; geenDatum: boolean }) ?? MELDING.datumFormaat,
    // Ook controleren als een ander veld ongeldig is, zodat alle fouten in één keer terugkomen.
    when: () => true,
  })
  // Zonder datum ("nog geen datum") bewaren we er geen.
  .transform((data) => ({ ...data, datum: data.geenDatum ? undefined : data.datum }));

export type Aanvraag = z.output<typeof schema>;

// ---------------------------------------------------------------------------
// Mails
// ---------------------------------------------------------------------------

const label = (naam: string): string => veldLabel(velden, naam);

function datumTekst(datum: string, metWeekdag: boolean): string {
  return new Intl.DateTimeFormat('nl-NL', {
    weekday: metWeekdag ? 'long' : undefined,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${datum}T00:00:00Z`));
}

/** Alle velden als [label, waarde]; `undefined` = niet ingevuld. */
function waarden(data: Aanvraag): Array<[string, string | undefined]> {
  return [
    [label('datum'), data.datum ? datumTekst(data.datum, true) : 'Nog niet bekend'],
    [label('locatie'), data.locatie],
    [label('namen'), data.namen],
    [label('email'), data.email],
    [label('telefoon'), data.telefoon],
    [label('pakket'), optieLabel(PAKKETTEN, data.pakket)],
    [label('kanaal'), optieLabel(KANALEN, data.kanaal)],
  ];
}

export function onderwerp(data: Aanvraag): string {
  const datum = data.datum ? datumTekst(data.datum, false) : 'datum nog niet vast';
  return eenRegel(`Nieuwe bruiloftaanvraag: ${data.namen}, ${datum}`);
}

// TODO(paul): mailteksten laten goedkeuren (ik-vorm, toon, termijn van 24 uur).
export function tekst(data: Aanvraag): string {
  const alles = waarden(data).map(([naam, waarde]): [string, string] => [naam, waarde ?? 'niet ingevuld']);
  return `${regels(alles)}\n\n${verstuurdVia('/fotograaf-bruiloft')}\n`;
}

export function bevestiging(data: Aanvraag): { onderwerp: string; tekst: string } {
  const ingevuld = waarden(data).filter((paar): paar is [string, string] => paar[1] !== undefined);
  return {
    onderwerp: 'Bedankt voor je aanvraag, ik reageer binnen 24 uur',
    tekst: bevestigingsMail({
      aanhef: `Hoi ${data.namen},`,
      opening: 'Bedankt voor jullie aanvraag. Ik heb hem ontvangen en reageer binnen 24 uur.',
      ingevuld: regels(ingevuld),
    }),
  };
}

/** De drie stappen op /bedankt ("Wat gebeurt er nu?"). */
// TODO(paul): bevestig dat dit proces klopt (drie stappen).
export const stappen = [
  'Ik lees jullie aanvraag en kijk of de datum nog vrij is.',
  'Ik stuur je een bericht met een voorstel voor een kennismaking.',
  'Na de kennismaking maken we de afspraken definitief.',
];
