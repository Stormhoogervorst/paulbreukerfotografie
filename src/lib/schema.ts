/**
 * Typed JSON-LD helpers (schema.org).
 *
 * Regels (zie .cursor/rules/paulbreuker-regels.mdc):
 * - Geen AggregateRating of Review voor Pauls eigen bedrijf.
 * - Verzin geen feiten: ontbrekende velden zijn optioneel en worden weggelaten.
 * - Person en LocalBusiness verwijzen naar elkaar via @id.
 */
import { BUSINESS_ID, PERSON_ID, SITE_NAME, SITE_URL, WEBSITE_ID } from '../data/site';

/** Verwijzing naar een ander node via @id. */
export interface IdRef {
  '@id': string;
}

/** Basis van elk JSON-LD-object dat we uitvoeren. */
export interface JsonLdNode {
  '@context': 'https://schema.org';
  '@type': string;
  '@id'?: string;
}

/** Maakt een pad ("/series") of URL absoluut op basis van SITE_URL. */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${path}`;
}

// ---------------------------------------------------------------------------
// WebSite
// ---------------------------------------------------------------------------

export interface WebSiteSchema extends JsonLdNode {
  '@type': 'WebSite';
  name: string;
  url: string;
  inLanguage: 'nl-NL';
  publisher?: IdRef;
}

export function webSite(options: { name?: string; publisherId?: string } = {}): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: options.name ?? SITE_NAME,
    url: SITE_URL,
    inLanguage: 'nl-NL',
    ...(options.publisherId ? { publisher: { '@id': options.publisherId } } : {}),
  };
}

// ---------------------------------------------------------------------------
// BreadcrumbList
// ---------------------------------------------------------------------------

export interface BreadcrumbItem {
  name: string;
  /** Pad ("/series") of volledige URL. */
  path: string;
}

export interface BreadcrumbListSchema extends JsonLdNode {
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
}

export function breadcrumbList(items: BreadcrumbItem[]): BreadcrumbListSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

// ---------------------------------------------------------------------------
// Person
// ---------------------------------------------------------------------------

/** Vakgebieden van Paul (zie de "over paul"-tekst op de homepage). */
export const PERSON_KNOWS_ABOUT: string[] = ['schilderkunst', 'fotografie'];

export interface PersonSchema extends JsonLdNode {
  '@type': 'Person';
  name: string;
  url?: string;
  jobTitle?: string;
  image?: string;
  sameAs?: string[];
  knowsAbout: string[];
  worksFor?: IdRef;
}

export interface PersonInput {
  name: string;
  url?: string;
  jobTitle?: string;
  /** Pad of URL van een eigen foto van/door Paul. */
  image?: string;
  sameAs?: string[];
  knowsAbout?: string[];
  /** Standaard verwijst Person naar het LocalBusiness via @id. */
  worksForId?: string;
}

export function person(input: PersonInput): PersonSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_ID,
    name: input.name,
    ...(input.url ? { url: absoluteUrl(input.url) } : {}),
    ...(input.jobTitle ? { jobTitle: input.jobTitle } : {}),
    ...(input.image ? { image: absoluteUrl(input.image) } : {}),
    ...(input.sameAs?.length ? { sameAs: input.sameAs } : {}),
    knowsAbout: input.knowsAbout?.length ? input.knowsAbout : PERSON_KNOWS_ABOUT,
    worksFor: { '@id': input.worksForId ?? BUSINESS_ID },
  };
}

// ---------------------------------------------------------------------------
// LocalBusiness (ProfessionalService)
// ---------------------------------------------------------------------------

export interface PostalAddressSchema {
  '@type': 'PostalAddress';
  streetAddress?: string;
  postalCode?: string;
  addressLocality: string;
  addressCountry: string;
}

export interface LocalBusinessSchema extends JsonLdNode {
  '@type': 'ProfessionalService' | 'LocalBusiness';
  name: string;
  url: string;
  founder: IdRef;
  telephone?: string;
  email?: string;
  image?: string;
  address?: PostalAddressSchema;
  areaServed?: string[];
  sameAs?: string[];
  priceRange?: string;
}

export interface LocalBusinessInput {
  name?: string;
  type?: 'ProfessionalService' | 'LocalBusiness';
  /** E.164, bijvoorbeeld "+31651475406". */
  telephone?: string;
  email?: string;
  image?: string;
  address?: Omit<PostalAddressSchema, '@type'>;
  /** Plaatsnamen of regio's, bijvoorbeeld ["Nijmegen", "Arnhem"]. */
  areaServed?: string[];
  sameAs?: string[];
  priceRange?: string;
  /** Standaard het Person-node van Paul. */
  founderId?: string;
}

export function localBusiness(input: LocalBusinessInput = {}): LocalBusinessSchema {
  return {
    '@context': 'https://schema.org',
    '@type': input.type ?? 'ProfessionalService',
    '@id': BUSINESS_ID,
    name: input.name ?? SITE_NAME,
    url: SITE_URL,
    founder: { '@id': input.founderId ?? PERSON_ID },
    ...(input.telephone ? { telephone: input.telephone } : {}),
    ...(input.email ? { email: input.email } : {}),
    ...(input.image ? { image: absoluteUrl(input.image) } : {}),
    ...(input.address ? { address: { '@type': 'PostalAddress', ...input.address } } : {}),
    ...(input.areaServed?.length ? { areaServed: input.areaServed } : {}),
    ...(input.sameAs?.length ? { sameAs: input.sameAs } : {}),
    ...(input.priceRange ? { priceRange: input.priceRange } : {}),
  };
}

// ---------------------------------------------------------------------------
// Service + Offer
// ---------------------------------------------------------------------------

export interface OfferSchema {
  '@type': 'Offer';
  url?: string;
  priceCurrency: 'EUR';
  priceSpecification: {
    '@type': 'PriceSpecification';
    /** Vanaf-prijs. */
    minPrice: number;
    priceCurrency: 'EUR';
  };
}

/** Eén pakket als Offer in de OfferCatalog van een Service. */
export interface CatalogOfferSchema {
  '@type': 'Offer';
  name: string;
  description: string;
  url: string;
  price: number;
  priceCurrency: 'EUR';
}

export interface OfferCatalogSchema {
  '@type': 'OfferCatalog';
  name: string;
  itemListElement: CatalogOfferSchema[];
}

export interface ServiceSchema extends JsonLdNode {
  '@type': 'Service';
  name: string;
  description: string;
  url: string;
  provider: IdRef;
  serviceType?: string;
  areaServed?: string[];
  /** Ontbreekt zonder vanaf-prijs: geen Offer verzinnen. */
  offers?: OfferSchema;
  /** Alleen pakketten met een echte prijs. */
  hasOfferCatalog?: OfferCatalogSchema;
}

/** Een pakket met een prijs, voor de OfferCatalog. Pakketten zonder prijs horen hier niet in. */
export interface ServicePackageInput {
  name: string;
  description: string;
  /** Prijs in euro's. */
  price: number;
}

export interface ServiceInput {
  name: string;
  description: string;
  /** Pad of URL van de pagina waarop de dienst staat. */
  path: string;
  /** Vanaf-prijs in euro's. Nooit verzinnen: komt van Paul. Zonder prijs geen `offers`. */
  priceFrom?: number;
  /** Pakketten met prijs; worden een `Offer` in `hasOfferCatalog`. Zonder pakketten geen catalogus. */
  packages?: ServicePackageInput[];
  /** Naam van de OfferCatalog (standaard "Pakketten"). */
  catalogName?: string;
  serviceType?: string;
  areaServed?: string[];
  providerId?: string;
}

export function service(input: ServiceInput): ServiceSchema {
  const url = absoluteUrl(input.path);
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    url,
    provider: { '@id': input.providerId ?? BUSINESS_ID },
    ...(input.serviceType ? { serviceType: input.serviceType } : {}),
    ...(input.areaServed?.length ? { areaServed: input.areaServed } : {}),
    ...(input.packages?.length
      ? {
          hasOfferCatalog: {
            '@type': 'OfferCatalog' as const,
            name: input.catalogName ?? 'Pakketten',
            itemListElement: input.packages.map((pakket) => ({
              '@type': 'Offer' as const,
              name: pakket.name,
              description: pakket.description,
              url: `${url}#pakketten`,
              price: pakket.price,
              priceCurrency: 'EUR' as const,
            })),
          },
        }
      : {}),
    ...(input.priceFrom !== undefined
      ? {
          offers: {
            '@type': 'Offer' as const,
            url,
            priceCurrency: 'EUR' as const,
            priceSpecification: {
              '@type': 'PriceSpecification' as const,
              minPrice: input.priceFrom,
              priceCurrency: 'EUR' as const,
            },
          },
        }
      : {}),
  };
}

// ---------------------------------------------------------------------------
// ImageObject
// ---------------------------------------------------------------------------

export interface ImageObjectSchema extends JsonLdNode {
  '@type': 'ImageObject';
  contentUrl: string;
  creator: IdRef;
  creditText: string;
  copyrightNotice: string;
  name?: string;
  caption?: string;
  width?: number;
  height?: number;
  license?: string;
  acquireLicensePage?: string;
}

export interface ImageObjectInput {
  /** Pad of URL van de afbeelding. */
  url: string;
  name?: string;
  /** Nederlandse, beschrijvende bijschrift/alt-tekst. */
  caption?: string;
  width?: number;
  height?: number;
  /** Bijvoorbeeld "Paul Breuker". */
  creditText: string;
  /** Bijvoorbeeld "© 2026 Paul Breuker". */
  copyrightNotice: string;
  license?: string;
  acquireLicensePage?: string;
  creatorId?: string;
}

export function imageObject(input: ImageObjectInput): ImageObjectSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: absoluteUrl(input.url),
    creator: { '@id': input.creatorId ?? PERSON_ID },
    creditText: input.creditText,
    copyrightNotice: input.copyrightNotice,
    ...(input.name ? { name: input.name } : {}),
    ...(input.caption ? { caption: input.caption } : {}),
    ...(input.width ? { width: input.width } : {}),
    ...(input.height ? { height: input.height } : {}),
    ...(input.license ? { license: absoluteUrl(input.license) } : {}),
    ...(input.acquireLicensePage
      ? { acquireLicensePage: absoluteUrl(input.acquireLicensePage) }
      : {}),
  };
}

// ---------------------------------------------------------------------------
// ImageGallery
// ---------------------------------------------------------------------------

export interface ImageGallerySchema extends JsonLdNode {
  '@type': 'ImageGallery';
  name: string;
  url: string;
  /** De foto's als ImageObject (zonder eigen @context: die staat op de galerij). */
  hasPart: Array<Omit<ImageObjectSchema, '@context'>>;
}

export interface ImageGalleryInput {
  name: string;
  /** Pad of URL van de pagina (of het anker) waarop de galerij staat. */
  path: string;
  /** Eén item per foto; `url` is de geoptimaliseerde afbeelding, `caption` de alt-tekst. */
  images: ImageObjectInput[];
}

export function imageGallery(input: ImageGalleryInput): ImageGallerySchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: input.name,
    url: absoluteUrl(input.path),
    hasPart: input.images.map((image) => {
      const { '@context': _context, ...node } = imageObject(image);
      return node;
    }),
  };
}

// ---------------------------------------------------------------------------
// FAQPage
// ---------------------------------------------------------------------------

export interface QuestionSchema {
  '@type': 'Question';
  name: string;
  acceptedAnswer: {
    '@type': 'Answer';
    text: string;
  };
}

export interface FaqPageSchema extends JsonLdNode {
  '@type': 'FAQPage';
  url: string;
  inLanguage: 'nl-NL';
  mainEntity: QuestionSchema[];
}

export interface FaqPageInput {
  /** Pad of URL van de pagina (of het anker) waarop de vragen staan. */
  path: string;
  /** `antwoord` is de platte tekst, letterlijk gelijk aan wat zichtbaar op de pagina staat. */
  vragen: Array<{ vraag: string; antwoord: string }>;
}

/**
 * FAQPage uit zichtbare vragen en antwoorden. Geldige markup, maar zonder rich result in Google (sinds 2023 beperkt tot
 * een paar overheids- en gezondheidssites); de Q&A-structuur helpt wel zoekmachines en AI-antwoorden.
 */
export function faqPage(input: FaqPageInput): FaqPageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url: absoluteUrl(input.path),
    inLanguage: 'nl-NL',
    mainEntity: input.vragen.map((item) => ({
      '@type': 'Question',
      name: item.vraag,
      acceptedAnswer: { '@type': 'Answer', text: item.antwoord },
    })),
  };
}

// ---------------------------------------------------------------------------
// CollectionPage + ItemList
// ---------------------------------------------------------------------------

export interface CollectionPageSchema extends JsonLdNode {
  '@type': 'CollectionPage';
  name: string;
  description: string;
  url: string;
  inLanguage: 'nl-NL';
  isPartOf: IdRef;
  mainEntity: {
    '@type': 'ItemList';
    numberOfItems: number;
    itemListElement: Array<{
      '@type': 'ListItem';
      position: number;
      name: string;
      url: string;
    }>;
  };
}

export interface CollectionPageInput {
  name: string;
  description: string;
  /** Pad of URL van de overzichtspagina. */
  path: string;
  /** Items in de volgorde van de pagina; `path` is het pad of de URL van het item. */
  items: Array<{ name: string; path: string }>;
}

/** Overzichtspagina (bijvoorbeeld /series) met een ItemList van de items. Geen AggregateRating of Review. */
export function collectionPage(input: CollectionPageInput): CollectionPageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    inLanguage: 'nl-NL',
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: input.items.length,
      itemListElement: input.items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: absoluteUrl(item.path),
      })),
    },
  };
}

/** Alle JSON-LD-nodes die deze module kan opleveren. */
export type AnySchema =
  | WebSiteSchema
  | BreadcrumbListSchema
  | PersonSchema
  | LocalBusinessSchema
  | ServiceSchema
  | ImageObjectSchema
  | ImageGallerySchema
  | FaqPageSchema
  | CollectionPageSchema;
