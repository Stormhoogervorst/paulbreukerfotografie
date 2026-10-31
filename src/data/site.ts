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

/**
 * WhatsApp-nummer voor aanvragen. Leeg: dan verschijnt er geen WhatsApp-regel op /contact (src/data/contact.ts).
 * TODO(paul): bevestigen of Paul WhatsApp gebruikt voor aanvragen. Zo ja: vul `display` (zoals getoond, bijvoorbeeld
 * "+31 6 51 47 54 06") en `href` ("https://wa.me/31651475406", alleen cijfers) in.
 */
export const WHATSAPP: { display: string; href: string } | undefined = undefined;

/** Naam in de headerbalk (desktop en mobiel). De H1 in de hero blijft alleen "Paul Breuker" (home.hero.h1). */
export const WORDMARK = 'Paul Breuker Fotografie';

/** Hoofdnavigatie (kleine letters, max. 6 items). Geen "home": het wordmark is de homelink. Geen /promoties. */
export const NAV = [
  // TODO(paul): placeholder-links; de echte pagina's volgen in een latere ronde.
  { label: 'bruiloft', href: '/fotograaf-bruiloft' },
  { label: 'portret', href: '/portretfotos' },
  { label: 'series', href: '/series' },
  { label: 'portfolio', href: '/portfolio' },
  { label: 'contact', href: '/contact' },
] as const;

/** Profielen van Paul. Header en `sameAs` in JSON-LD gebruiken deze lijst. */
export const SOCIALS = [
  { label: 'instagram', href: 'https://www.instagram.com/paul_breuker/' },
  { label: 'linkedin', href: 'https://www.linkedin.com/in/paul-breuker-494b2b10/' },
  { label: 'facebook', href: 'https://www.facebook.com/paul.breuker.9' },
] as const;

/** Profielen in de voettekst: zonder Instagram (dat blijft wel in SOCIALS en dus in `sameAs` van de JSON-LD). */
export const FOOTER_SOCIALS = SOCIALS.filter((social) => social.label !== 'instagram');

/**
 * Voettekst: groot tekstblok. TODO(paul): tekst goedkeuren.
 * Desktop: vaste regelbreuk direct na `FOOTER_TEKST_BREUK_NA`; mobiel: natuurlijke afbreking.
 */
export const FOOTER_TEKST = 'Een bruiloft, een portret, een idee? Ik hoor het graag.';
export const FOOTER_TEKST_BREUK_NA = 'een portret,';

/** Voettekstnavigatie (vier links, met hoofdletter). Geen /promoties en geen /exposities. */
export const FOOTER_NAV = [
  { label: 'Bruiloft', href: '/fotograaf-bruiloft' },
  { label: 'Portret', href: '/portretfotos' },
  { label: 'Series', href: '/series' },
  { label: 'Contact', href: '/contact' },
] as const;

/**
 * Commerciële landingspagina's in de voettekst (donkergrijs, naast de vier witte links).
 * Alleen bestaande pagina's. Er is geen pagina /zakelijke-portretfoto.
 */
export const FOOTER_LANDING = [
  { label: 'Fotograaf bruiloft', href: '/fotograaf-bruiloft' },
  { label: 'Trouwfotograaf Nijmegen', href: '/trouwfotograaf-nijmegen' },
  { label: 'Trouwfotograaf Arnhem', href: '/trouwfotograaf-arnhem' },
  { label: 'Trouwfotograaf Utrecht', href: '/trouwfotograaf-utrecht' },
  { label: 'Trouwfotograaf Amsterdam', href: '/trouwfotograaf-amsterdam' },
  { label: 'Trouwfotograaf Rotterdam', href: '/trouwfotograaf-rotterdam' },
  { label: 'Portretfoto laten maken', href: '/portretfotos' },
] as const;

/** Decoratief wordmark in de voettekst. */
export const FOOTER_WORDMARK = 'Paul Breuker';

/**
 * Bedrijfsgegevens voor de privacyverklaring (src/data/privacy.ts).
 * - `kvk`: KvK-nummer. Niet gezet: dan toont /privacy de regel met het KvK-nummer niet.
 *   TODO(paul): KvK-nummer invullen (cijfers, bijvoorbeeld "12345678").
 * - `vestigingsplaats`: plaats van vestiging. TODO(paul): bevestigen dat dit Nijmegen is.
 */
export const BEDRIJF: { kvk?: string; vestigingsplaats: string } = {
  kvk: undefined,
  vestigingsplaats: 'Nijmegen',
};

/** Privacyverklaring: pagina /privacy (src/pages/privacy.astro, tekst in src/data/privacy.ts). */
export const PRIVACY = { label: 'Privacyverklaring', href: '/privacy' } as const;

/** Voor `sameAs` in JSON-LD. TODO(paul): Singulart-URL aanleveren. */
export const SAME_AS: string[] = SOCIALS.map((social) => social.href);

/**
 * TODO(paul): standaard deelafbeelding (1200x630, eigen foto) aanleveren.
 * Zolang dit leeg is, vallen pagina's zonder eigen og:image terug op het beeld van /portfolio/bruiloften
 * (src/lib/og-beeld.ts, dezelfde variant van 1200 px breed).
 */
export const DEFAULT_OG_IMAGE: string | undefined = undefined;
