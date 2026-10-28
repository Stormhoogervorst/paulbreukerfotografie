/**
 * Bruiloftaanvraag (/fotograaf-bruiloft, sectie Aanvraagformulier): velden, Zod-schema en mailteksten.
 *
 * - `velden` is de configuratie waaruit LandingFormulier.astro het formulier rendert (volgorde van boven naar beneden).
 * - `schema` valideert altijd op de server (src/pages/api/aanvraag.ts); de browservalidatie is alleen een extra.
 * - Mails zijn platte tekst. Alles wat in een onderwerp komt, gaat door `eenRegel()` (geen regeleinden).
 */
import { z } from 'zod';
import { CONTACT, SITE_URL } from '../../data/site';
import type { VeldConfig, VeldOptie } from './types';

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
  email: 'Vul een geldig e-mailadres in.',
  telefoon: 'Vul een geldig telefoonnummer in (cijfers, spaties, + en -).',
  keuze: 'Kies een van de opties.',
} as const;

// ---------------------------------------------------------------------------
// Opties
// ---------------------------------------------------------------------------

export const KANALEN: VeldOptie[] = [
  { waarde: 'google', label: 'Google' },
  { waarde: 'instagram', label: 'Instagram' },
  { waarde: 'aanbeveling', label: 'Aanbeveling' },
  { waarde: 'tentoonstelling-of-publicatie', label: 'Tentoonstelling of publicatie' },
  { waarde: 'anders', label: 'Anders' },
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
  {
    type: 'email',
    naam: 'email',
    label: 'E-mailadres',
    verplicht: true,
    autocomplete: 'email',
    inputmode: 'email',
    maxlength: 254,
    meldingen: { leeg: MELDING.email, ongeldig: MELDING.email },
  },
  {
    type: 'tel',
    naam: 'telefoon',
    label: 'Telefoonnummer',
    verplicht: false,
    autocomplete: 'tel',
    inputmode: 'tel',
    maxlength: 30,
    // Gelijk aan het schema. Haakjes en streepje zijn escaped: het patroon wordt door de browser met de v-vlag gecompileerd.
    pattern: '[0-9 +\\-\\(\\)]*',
    meldingen: { ongeldig: MELDING.telefoon },
  },
  { type: 'select', naam: 'kanaal', label: 'Hoe ken je mij?', verplicht: false, opties: KANALEN },
];

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

/** Eén regel: stuurtekens en regeleinden worden spaties, dubbele spaties vallen weg. */
export function eenRegel(tekst: string): string {
  return tekst
    .replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function enkeleRegel(max: number, leeg: string, teLang: string) {
  return z
    .string({ error: leeg })
    .trim()
    .min(1, leeg)
    .max(max, teLang)
    .transform(eenRegel);
}

/** Leeg of ontbrekend telt als niet ingevuld; anders gaat de waarde door het schema. */
function optioneel<T extends z.ZodType>(schema: T) {
  return z.preprocess((waarde) => (waarde == null || (typeof waarde === 'string' && waarde.trim() === '') ? undefined : waarde), schema.optional());
}

function keuze(opties: VeldOptie[]) {
  return z.enum(opties.map((optie) => optie.waarde) as [string, ...string[]], { error: MELDING.keuze });
}

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
const TELEFOON = /^[0-9 +\-()]+$/;

const basis = z.object({
  datum: optioneel(z.string()),
  // Een checkbox stuurt "on" (formulier) of true (JSON); alles anders telt als niet aangevinkt.
  geenDatum: z.preprocess((waarde) => waarde === true || waarde === 'on' || waarde === 'true' || waarde === '1', z.boolean()),
  locatie: enkeleRegel(160, MELDING.locatieLeeg, MELDING.locatieLang),
  namen: enkeleRegel(120, MELDING.namenLeeg, MELDING.namenLang),
  email: z.string({ error: MELDING.email }).trim().max(254, MELDING.email).pipe(z.email({ error: MELDING.email })),
  telefoon: optioneel(
    z.string().trim().max(30, MELDING.telefoon).regex(TELEFOON, MELDING.telefoon).transform(eenRegel),
  ),
  kanaal: optioneel(keuze(KANALEN)),
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

const label = (naam: string): string => velden.find((veld) => veld.naam === naam)?.label ?? naam;
const optieLabel = (opties: VeldOptie[], waarde: string | undefined): string | undefined =>
  waarde === undefined ? undefined : (opties.find((optie) => optie.waarde === waarde)?.label ?? waarde);

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
    [label('kanaal'), optieLabel(KANALEN, data.kanaal)],
  ];
}

/** "Label: waarde" per regel. */
function regels(paren: Array<[string, string | undefined]>): string {
  return paren
    .map(([naam, waarde]) => `${naam}: ${waarde}`)
    .join('\n');
}

export function onderwerp(data: Aanvraag): string {
  const datum = data.datum ? datumTekst(data.datum, false) : 'datum nog niet vast';
  return eenRegel(`Nieuwe bruiloftaanvraag: ${data.namen}, ${datum}`);
}

// TODO(paul): mailteksten laten goedkeuren (ik-vorm, toon, termijn van 24 uur).
export function tekst(data: Aanvraag): string {
  const alles = waarden(data).map(([naam, waarde]): [string, string] => [naam, waarde ?? 'niet ingevuld']);
  const bron = `${SITE_URL.replace(/^https?:\/\//, '')}/fotograaf-bruiloft`;
  return `${regels(alles)}\n\nVerstuurd via ${bron}\n`;
}

export function bevestiging(data: Aanvraag): { onderwerp: string; tekst: string } {
  const ingevuld = waarden(data).filter((paar): paar is [string, string] => paar[1] !== undefined);
  return {
    onderwerp: 'Bedankt voor je aanvraag, ik reageer binnen 24 uur',
    tekst: [
      `Hoi ${data.namen},`,
      '',
      'Bedankt voor jullie aanvraag. Ik heb hem ontvangen en reageer binnen 24 uur.',
      '',
      'Dit heb ik genoteerd:',
      regels(ingevuld),
      '',
      'Heb je in de tussentijd iets toe te voegen? Beantwoord dan gewoon deze mail.',
      '',
      'Groet,',
      'Paul Breuker',
      `${CONTACT.phoneDisplay} | ${CONTACT.email}`,
      SITE_URL,
      '',
    ].join('\n'),
  };
}