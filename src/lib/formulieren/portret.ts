/**
 * Portretaanvraag (/portretfotos, sectie Aanvraagformulier): velden, Zod-schema en mailteksten.
 *
 * - `velden` is de configuratie waaruit LandingFormulier.astro het formulier rendert (volgorde van boven naar beneden).
 * - `schema` valideert altijd op de server (src/pages/api/aanvraag.ts); de browservalidatie is alleen een extra.
 * - De opties van het veld "pakket" komen uit de pakkettendata (src/data/landing/portret-pakketten.ts): waarde is de
 *   slug, het label bevat de prijs zodra die bestaat, anders alleen de naam. Daarna "Zakelijk of LinkedIn" en "Weet ik
 *   nog niet".
 * - Mails zijn platte tekst. Alles wat in een onderwerp komt, gaat door `eenRegel()` (geen regeleinden).
 * - Gedeelde onderdelen (e-mail, telefoon, mailhulpen) staan in gedeeld.ts.
 */
import { z } from 'zod';
import { pakketten } from '../../data/landing/portret-pakketten';
import { euro } from '../prijs';
import {
  bevestigingsMail,
  eenRegel,
  emailSchema,
  emailVeld,
  enkeleRegel,
  keuze,
  meerdereRegels,
  optieLabel,
  optioneel,
  regels,
  telefoonSchema,
  telefoonVeld,
  veldLabel,
  verstuurdVia,
} from './gedeeld';
import type { VeldConfig, VeldOptie } from './types';

export const type = 'portret' as const;

// ---------------------------------------------------------------------------
// Meldingen (één bron voor het schema en de browservalidatie)
// ---------------------------------------------------------------------------

const MELDING = {
  naamLeeg: 'Vul je naam in.',
  naamLang: 'Gebruik maximaal 120 tekens.',
  pakket: 'Kies wat voor portret je wilt.',
  locatieLang: 'Gebruik maximaal 160 tekens.',
  berichtLang: 'Gebruik maximaal 2000 tekens.',
} as const;

// ---------------------------------------------------------------------------
// Opties
// ---------------------------------------------------------------------------

/** Label van een pakketoptie: de naam, met de prijs erachter zodra die bestaat ("Portret (vanaf €350)"). */
function pakketLabel(pakket: (typeof pakketten.items)[number]): string {
  if (pakket.prijs === undefined) return pakket.naam;
  return `${pakket.naam} (${pakket.prijsLabel ? `${pakket.prijsLabel} ` : ''}${euro(pakket.prijs)})`;
}

export const PAKKETTEN: VeldOptie[] = [
  ...pakketten.items.map((pakket) => ({ waarde: pakket.cta.pakket, label: pakketLabel(pakket) })),
  { waarde: 'zakelijk', label: 'Zakelijk of LinkedIn' },
  { waarde: 'onbekend', label: 'Weet ik nog niet' },
];

export const PERSONEN: VeldOptie[] = [
  { waarde: '1', label: '1' },
  { waarde: '2', label: '2' },
  { waarde: '3-5', label: '3 tot 5' },
  { waarde: '6-of-meer', label: '6 of meer' },
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
    naam: 'pakket',
    label: 'Wat voor portret wil je?',
    verplicht: true,
    opties: PAKKETTEN,
    meldingen: { leeg: MELDING.pakket, ongeldig: MELDING.pakket },
  },
  {
    type: 'text',
    naam: 'locatie',
    label: 'Waar wil je dat ik kom?',
    verplicht: false,
    hulptekst: 'Een plaats, of bijvoorbeeld thuis, op je werk of buiten.',
    maxlength: 160,
    meldingen: { ongeldig: MELDING.locatieLang },
  },
  { type: 'select', naam: 'personen', label: 'Aantal personen', verplicht: false, opties: PERSONEN },
  {
    type: 'textarea',
    naam: 'bericht',
    label: 'Vertel me wat je in gedachten hebt',
    verplicht: false,
    maxlength: 2000,
    rijen: 5,
    meldingen: { ongeldig: MELDING.berichtLang },
  },
];

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const schema = z.object({
  naam: enkeleRegel(120, MELDING.naamLeeg, MELDING.naamLang),
  email: emailSchema,
  telefoon: telefoonSchema,
  pakket: keuze(PAKKETTEN, MELDING.pakket),
  locatie: optioneel(enkeleRegel(160, MELDING.locatieLang, MELDING.locatieLang)),
  personen: optioneel(keuze(PERSONEN)),
  bericht: optioneel(meerdereRegels(2000, MELDING.berichtLang)),
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
    [label('pakket'), optieLabel(PAKKETTEN, data.pakket)],
    [label('locatie'), data.locatie],
    [label('personen'), optieLabel(PERSONEN, data.personen)],
    [label('bericht'), data.bericht],
  ];
}

export function onderwerp(data: Aanvraag): string {
  return eenRegel(`Nieuwe portretaanvraag: ${data.naam}, ${optieLabel(PAKKETTEN, data.pakket)}`);
}

// TODO(paul): mailteksten laten goedkeuren (ik-vorm, toon, termijn van 3 werkdagen).
export function tekst(data: Aanvraag): string {
  const alles = waarden(data).map(([naam, waarde]): [string, string] => [naam, waarde ?? 'niet ingevuld']);
  return `${regels(alles)}\n\n${verstuurdVia('/portretfotos')}\n`;
}

export function bevestiging(data: Aanvraag): { onderwerp: string; tekst: string } {
  const ingevuld = waarden(data).filter((paar): paar is [string, string] => paar[1] !== undefined);
  return {
    onderwerp: 'Bedankt voor je aanvraag, ik reageer binnen 3 werkdagen',
    tekst: bevestigingsMail({
      aanhef: `Hoi ${data.naam},`,
      opening: 'Bedankt voor je aanvraag. Ik heb hem ontvangen en reageer binnen 3 werkdagen.',
      ingevuld: regels(ingevuld),
    }),
  };
}

/** De drie stappen op /bedankt ("Wat gebeurt er nu?"). */
// TODO(paul): bevestig dat dit proces klopt (drie stappen).
export const stappen = [
  'Ik lees je aanvraag.',
  'Ik stuur je een voorstel voor een moment en een plek.',
  'Daarna maken we de afspraken definitief.',
];
