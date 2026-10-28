/**
 * Register van formulieren. De API-route (src/pages/api/aanvraag.ts) kiest het formulier op basis van het veld `type`;
 * LandingFormulier.astro leest er de velden uit en bedankt.astro de stappen. Een nieuw formulier is een nieuw bestand in
 * deze map (met de onderdelen uit gedeeld.ts) en een regel hieronder.
 */
import * as bruiloft from './bruiloft';
import * as portret from './portret';
import type { Formulier } from './types';

// `satisfies` controleert bij het compileren dat elk bestand aan het formuliertype voldoet.
export const formulieren = { bruiloft, portret } satisfies Record<string, Formulier>;

export type FormulierType = keyof typeof formulieren;

/** Het formulier bij een `type` uit een verzoek, of `undefined` als het type onbekend is. */
export function kiesFormulier(type: unknown): Formulier | undefined {
  if (typeof type !== 'string' || !Object.hasOwn(formulieren, type)) return undefined;
  return formulieren[type as FormulierType];
}
