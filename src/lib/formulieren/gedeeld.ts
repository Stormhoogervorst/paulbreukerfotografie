/**
 * Gedeelde bouwstenen van de aanvraagformulieren (bruiloft.ts, portret.ts): validatiehulpen, de velden die in elk
 * formulier hetzelfde zijn (e-mail, telefoon, "Hoe ken je mij?") en de hulpfuncties voor de mails.
 *
 * Wijzig hier niets zonder beide formulieren te controleren: het gedrag van het bruiloftformulier mag niet veranderen.
 */
import { z } from 'zod';
import { CONTACT, SITE_URL } from '../../data/site';
import type { VeldConfig, VeldOptie } from './types';

// ---------------------------------------------------------------------------
// Meldingen
// ---------------------------------------------------------------------------

export const MELDING_GEDEELD = {
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
// Velden die in elk formulier hetzelfde zijn
// ---------------------------------------------------------------------------

export function emailVeld(): VeldConfig {
  return {
    type: 'email',
    naam: 'email',
    label: 'E-mailadres',
    verplicht: true,
    autocomplete: 'email',
    inputmode: 'email',
    maxlength: 254,
    meldingen: { leeg: MELDING_GEDEELD.email, ongeldig: MELDING_GEDEELD.email },
  };
}

export function telefoonVeld(): VeldConfig {
  return {
    type: 'tel',
    naam: 'telefoon',
    label: 'Telefoonnummer',
    verplicht: false,
    autocomplete: 'tel',
    inputmode: 'tel',
    maxlength: 30,
    // Gelijk aan het schema. Haakjes en streepje zijn escaped: het patroon wordt door de browser met de v-vlag gecompileerd.
    pattern: '[0-9 +\\-\\(\\)]*',
    meldingen: { ongeldig: MELDING_GEDEELD.telefoon },
  };
}

export function kanaalVeld(): VeldConfig {
  return { type: 'select', naam: 'kanaal', label: 'Hoe ken je mij?', verplicht: false, opties: KANALEN };
}

// ---------------------------------------------------------------------------
// Schema-bouwstenen
// ---------------------------------------------------------------------------

/** Eén regel: stuurtekens en regeleinden worden spaties, dubbele spaties vallen weg. */
export function eenRegel(tekst: string): string {
  return tekst
    .replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function enkeleRegel(max: number, leeg: string, teLang: string) {
  return z
    .string({ error: leeg })
    .trim()
    .min(1, leeg)
    .max(max, teLang)
    .transform(eenRegel);
}

/** Leeg of ontbrekend telt als niet ingevuld; anders gaat de waarde door het schema. */
export function optioneel<T extends z.ZodType>(schema: T) {
  return z.preprocess(
    (waarde) => (waarde == null || (typeof waarde === 'string' && waarde.trim() === '') ? undefined : waarde),
    schema.optional(),
  );
}

export function keuze(opties: VeldOptie[], melding: string = MELDING_GEDEELD.keuze) {
  return z.enum(opties.map((optie) => optie.waarde) as [string, ...string[]], { error: melding });
}

const TELEFOON = /^[0-9 +\-()]+$/;

export const emailSchema = z
  .string({ error: MELDING_GEDEELD.email })
  .trim()
  .max(254, MELDING_GEDEELD.email)
  .pipe(z.email({ error: MELDING_GEDEELD.email }));

export const telefoonSchema = optioneel(
  z.string().trim().max(30, MELDING_GEDEELD.telefoon).regex(TELEFOON, MELDING_GEDEELD.telefoon).transform(eenRegel),
);

export const kanaalSchema = optioneel(keuze(KANALEN));

// ---------------------------------------------------------------------------
// Mails
// ---------------------------------------------------------------------------

/** Label van een veld in een lijst velden (valt terug op de naam). */
export function veldLabel(velden: VeldConfig[], naam: string): string {
  return velden.find((veld) => veld.naam === naam)?.label ?? naam;
}

/** Label van een optie bij een waarde (valt terug op de waarde zelf). */
export function optieLabel(opties: VeldOptie[], waarde: string | undefined): string | undefined {
  return waarde === undefined ? undefined : (opties.find((optie) => optie.waarde === waarde)?.label ?? waarde);
}

/** "Label: waarde" per regel. */
export function regels(paren: Array<[string, string | undefined]>): string {
  return paren.map(([naam, waarde]) => `${naam}: ${waarde}`).join('\n');
}

/**
 * Bevestigingsmail naar de aanvrager: aanhef, een eigen openingszin, de ingevulde velden en de vaste afsluiting
 * (naam, telefoon, e-mail en website van Paul).
 */
export function bevestigingsMail(opties: { aanhef: string; opening: string; ingevuld: string }): string {
  return [
    opties.aanhef,
    '',
    opties.opening,
    '',
    'Dit heb ik genoteerd:',
    opties.ingevuld,
    '',
    'Heb je in de tussentijd iets toe te voegen? Beantwoord dan gewoon deze mail.',
    '',
    'Groet,',
    'Paul Breuker',
    `${CONTACT.phoneDisplay} | ${CONTACT.email}`,
    SITE_URL,
    '',
  ].join('\n');
}

/** Regel onderaan de mail naar Paul, bijvoorbeeld "Verstuurd via paulbreuker.nl/portretfotos". */
export function verstuurdVia(pad: string): string {
  return `Verstuurd via ${SITE_URL.replace(/^https?:\/\//, '')}${pad}`;
}
