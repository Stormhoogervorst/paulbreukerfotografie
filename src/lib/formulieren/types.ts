/**
 * Types voor formulieren (aanvragen). Een formulier is één bestand in deze map (bruiloft.ts, portret.ts; gedeelde onderdelen staan in gedeeld.ts) met:
 * de velden (configuratie voor het renderen), het Zod-schema (de enige bron van waarheid voor validatie, altijd op de
 * server), de mailteksten, de bedankstappen en het type. De API-route (src/pages/api/aanvraag.ts) kiest het formulier uit het register
 * in index.ts.
 */
import type { z } from 'zod';

export type VeldType = 'text' | 'email' | 'tel' | 'date' | 'select' | 'radio' | 'textarea' | 'checkbox';

export interface VeldOptie {
  /** Waarde in het formulier en in het Zod-schema. */
  waarde: string;
  /** Tekst voor de bezoeker en in de mails. */
  label: string;
}

export interface VeldConfig {
  type: VeldType;
  /** `name` van het veld in het formulier; ook de sleutel in het schema. */
  naam: string;
  label: string;
  verplicht: boolean;
  /** Voor `select` en `radio`. */
  opties?: VeldOptie[];
  hulptekst?: string;
  autocomplete?: string;
  inputmode?: 'text' | 'email' | 'tel' | 'numeric' | 'decimal' | 'search' | 'url' | 'none';
  maxlength?: number;
  /** HTML-patroon voor de browservalidatie (zie ook het schema, dat altijd leidend is). */
  pattern?: string;
  /** Aantal rijen van een `textarea`. */
  rijen?: number;
  /** Foutmeldingen voor de browservalidatie; dezelfde teksten als in het schema. */
  meldingen?: {
    /** Veld is verplicht en leeg. */
    leeg?: string;
    /** Veld is ingevuld maar ongeldig (formaat, te lang, in het verleden). */
    ongeldig?: string;
  };
  /**
   * `naam` van een checkbox die dit veld uitschakelt en niet-verplicht maakt (bijvoorbeeld "we hebben nog geen datum").
   * Het veld krijgt dan geen `required` in de HTML; het script zet dat om; de server controleert dit altijd.
   */
  nietVerplichtAls?: string;
}

/** Wat elke aanvraag minimaal heeft: het e-mailadres van de aanvrager (voor de bevestiging en de reply-to). */
export interface AanvraagBasis {
  email: string;
}

export interface Formulier<T extends AanvraagBasis = AanvraagBasis> {
  /** Waarde van het verborgen veld `type`. */
  type: string;
  velden: VeldConfig[];
  schema: z.ZodType<T>;
  /** Onderwerp van de mail naar Paul (één regel). */
  onderwerp(data: T): string;
  /** Platte tekst van de mail naar Paul. */
  tekst(data: T): string;
  /** Bevestigingsmail naar de aanvrager (onderwerp en platte tekst). */
  bevestiging(data: T): { onderwerp: string; tekst: string };
  /** De stappen onder "Wat gebeurt er nu?" op /bedankt (src/pages/bedankt.astro), in volgorde. */
  stappen: string[];
}
