/**
 * Data voor /contact (src/pages/contact.astro): SEO, de contactregels en de formuliersectie.
 *
 * Vaste opbouw van de pagina (verandert nooit): header, H1 "Contact", formuliersectie, contactregels, footer.
 *
 * Eén bron: telefoon, e-mail en LinkedIn komen uit `src/data/site.ts` (CONTACT, SOCIALS, WHATSAPP). Hier staan alleen de
 * weergave (labels) en de volgorde. Instagram en Facebook staan bewust niet als regel op /contact (wel in de footer en
 * in `sameAs` van de JSON-LD). Geen adres op deze pagina (Pauls adres is nog niet bevestigd).
 */
import { CONTACT, PRIVACY, SOCIALS, WHATSAPP } from './site';
import { linkSegmenten } from '../lib/segmenten';
import type { LandingFormulier } from './landing/types';

export const seo = {
  title: 'Contact | Paul Breuker, fotograaf in Nijmegen',
  description:
    'Neem contact op met fotograaf Paul Breuker in Nijmegen voor een bruiloft, portret of boek. Bel, mail of stuur een bericht; ik reageer binnen 24 uur.',
};

/** Laatste kruimel (Home > Contact) in de BreadcrumbList. */
export const breadcrumb = 'Contact';

/** Waarde van `data-conversie` op elke regel: aanknopingspunt voor conversiemeting (er is hier nog geen analytics). */
export type ConversieSoort = 'telefoon' | 'email' | 'whatsapp' | 'linkedin';

export interface ContactRegel {
  /** Klein label links (kleine letters). */
  label: string;
  /** De grote waarde zoals getoond. */
  waarde: string;
  /** `tel:`, `mailto:` of een profiel-URL. */
  href: string;
  conversie: ConversieSoort;
  /** Opent in een nieuw tabblad (`target="_blank"`, `rel="noopener me"`) en krijgt een `aria-label` met die mededeling. */
  extern: boolean;
}

function social(label: (typeof SOCIALS)[number]['label']): string {
  const gevonden = SOCIALS.find((profiel) => profiel.label === label);
  if (!gevonden) throw new Error(`contact: profiel "${label}" ontbreekt in SOCIALS (src/data/site.ts).`);
  return gevonden.href;
}

/**
 * Regels, in volgorde. WhatsApp verschijnt alleen als `WHATSAPP` in site.ts is ingevuld.
 * TODO(paul): bevestigen of Paul WhatsApp gebruikt voor aanvragen (zie `WHATSAPP` in src/data/site.ts).
 */
export const regels: ContactRegel[] = [
  { label: 'telefoon', waarde: CONTACT.phoneDisplay, href: CONTACT.phoneHref, conversie: 'telefoon', extern: false },
  { label: 'e-mail', waarde: CONTACT.email, href: `mailto:${CONTACT.email}`, conversie: 'email', extern: false },
  ...(WHATSAPP
    ? [{ label: 'whatsapp', waarde: WHATSAPP.display, href: WHATSAPP.href, conversie: 'whatsapp', extern: true } satisfies ContactRegel]
    : []),
  { label: 'linkedin', waarde: 'Paul Breuker', href: social('linkedin'), conversie: 'linkedin', extern: true },
];

/**
 * Formuliersectie: dezelfde component als op de landingspagina's (LandingFormulier.astro), met anker `#formulier`, zonder
 * bewegende titel (`titel` is de visueel verborgen H2) en zonder het blok "Liever bellen of mailen?" (de regels direct
 * onder het formulier tonen die gegevens al). Velden, validatie en mails: src/lib/formulieren/contact.ts.
 */
// TODO(paul): intro en privacytekst laten goedkeuren; de privacytekst moet kloppen met de privacyverklaring (/privacy) die nog geschreven moet worden.
export const formulier: LandingFormulier = {
  type: 'contact',
  titel: 'Stuur een bericht',
  intro: [
    ['Een vraag, een idee of een boek bestellen? Stuur me een bericht. Ik reageer binnen 24 uur.'],
    linkSegmenten(
      'Wil je een bruiloft of een portret aanvragen? Gebruik dan het aanvraagformulier op fotograaf bruiloft of portretfoto laten maken. Daar vraag ik meteen de gegevens die ik nodig heb.',
      [
        { tekst: 'fotograaf bruiloft', href: '/fotograaf-bruiloft#aanvragen' },
        { tekst: 'portretfoto laten maken', href: '/portretfotos#aanvragen' },
      ],
    ),
  ],
  verzendLabel: 'Bericht versturen',
  privacy: [
    'Ik gebruik je gegevens alleen om te reageren op je bericht. Lees de ',
    { tekst: 'privacyverklaring', href: PRIVACY.href },
    '.',
  ],
};
