/**
 * Centrale sitegegevens. Alles wat Paul nog moet bevestigen staat als TODO(paul).
 * Gebruik deze waarden overal (header, footer, JSON-LD) zodat ze op één plek wijzigen.
 */

export const SITE_URL = 'https://paulbreuker.nl';
export const SITE_NAME = 'Paul Breuker Fotografie';

export const BUSINESS_ID = `${SITE_URL}/#business`;
export const PERSON_ID = `${SITE_URL}/over-paul#paul-breuker`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const CONTACT = {
  // TODO(paul): bevestig dat dit nummer nog klopt (overgenomen van de oude site).
  phoneDisplay: '+31 6 51 47 54 06',
  phoneHref: 'tel:+31651475406',
  email: 'info@paulbreuker.nl',
} as const;

/** Naam in de headerbalk (desktop en mobiel). De H1 in de hero blijft alleen "Paul Breuker" (home.hero.h1). */
export const WORDMARK = 'Paul Breuker Fotografie';

/** Hoofdnavigatie (kleine letters, max. 6 items). Geen "home": het wordmark is de homelink. Geen /promoties. */
export const NAV = [
  // TODO(paul): placeholder-links; de echte pagina's volgen in een latere ronde.
  { label: 'bruiloft', href: '/fotograaf-bruiloft' },
  { label: 'portret', href: '/portretfotos' },
  { label: 'werk', href: '/werk' },
  { label: 'portfolio', href: '/portfolio' },
  { label: 'over paul', href: '/over-paul' },
  { label: 'contact', href: '/contact' },
] as const;

/** Profielen van Paul. Header en `sameAs` in JSON-LD gebruiken deze lijst. */
export const SOCIALS = [
  { label: 'instagram', href: 'https://www.instagram.com/paul_breuker/' },
  { label: 'linkedin', href: 'https://www.linkedin.com/in/paul-breuker-494b2b10/' },
  { label: 'facebook', href: 'https://www.facebook.com/paul.breuker.9' },
] as const;

/**
 * Voettekst: groot tekstblok. TODO(paul): tekst goedkeuren.
 * Desktop: vaste regelbreuk direct na `FOOTER_TEKST_BREUK_NA`; mobiel: natuurlijke afbreking.
 */
export const FOOTER_TEKST = 'Een bruiloft, een portret, een idee? Ik hoor het graag.';
export const FOOTER_TEKST_BREUK_NA = 'een portret,';

/** Voettekstnavigatie (zes links, met hoofdletter). Geen /promoties. */
export const FOOTER_NAV = [
  { label: 'Bruiloft', href: '/fotograaf-bruiloft' },
  { label: 'Portret', href: '/portretfotos' },
  { label: 'Werk', href: '/werk' },
  { label: 'Over Paul', href: '/over-paul' },
  { label: 'Exposities', href: '/exposities' },
  { label: 'Contact', href: '/contact' },
] as const;

/** Decoratief wordmark in de voettekst. */
export const FOOTER_WORDMARK = 'Paul Breuker';

/** TODO(paul): privacyverklaring schrijven; de pagina bestaat nog niet. */
export const PRIVACY = { label: 'Privacyverklaring', href: '/privacy' } as const;

/** Voor `sameAs` in JSON-LD. TODO(paul): Singulart-URL aanleveren. */
export const SAME_AS: string[] = SOCIALS.map((social) => social.href);

/** TODO(paul): standaard deelafbeelding (1200x630, eigen foto) aanleveren. */
export const DEFAULT_OG_IMAGE: string | undefined = undefined;
