/**
 * Categorieën van de blog. Een nieuwe categorie is één object in `BLOG_CATEGORIES`.
 * Het schema (src/content.config.ts), de filters, de categoriepagina's en de CTA's lezen alleen dit bestand.
 *
 * Een categoriepagina (/blog/categorie/[slug]) bestaat pas bij minstens drie gepubliceerde posts.
 * Tot die tijd linkt het categorielabel naar /blog#[slug].
 */

export type BlogGroep = 'bruiloft' | 'portret' | 'kunst' | 'algemeen';

export interface BlogCategorie {
  slug: string;
  label: string;
  /** Eén tot twee zinnen. Ook de meta description en de intro van de categoriepagina. */
  description: string;
  group: BlogGroep;
  /** Ontbreekt bij categorieën zonder kop boven de CTA. */
  ctaHeading?: string;
  /** Pad op deze site, begint met "/". */
  defaultCtaHref: string;
  /** Zichtbare linktekst, zonder afsluitende pijl. Die zet de component zelf, verborgen voor schermlezers. */
  defaultCtaLabel: string;
}

export const BLOG_CATEGORIES = [
  {
    slug: 'kosten-en-kiezen',
    label: 'Kosten en kiezen',
    description:
      'Wat een trouwfotograaf kost, en hoe je een keuze maakt die bij jullie dag past. Ik leg het uit vanuit mijn eigen werkwijze.',
    group: 'bruiloft',
    ctaHeading: 'Gaan jullie trouwen?',
    defaultCtaHref: '/fotograaf-bruiloft#pakketten',
    defaultCtaLabel: 'Bekijk de trouwpakketten',
  },
  {
    slug: 'stijl',
    label: 'Stijl en werkwijze',
    description:
      'Hoe ik een bruiloft fotografeer: de hele dag aanwezig, in het licht dat er is, zonder de dag te ensceneren.',
    group: 'bruiloft',
    ctaHeading: 'Gaan jullie trouwen?',
    defaultCtaHref: '/fotograaf-bruiloft',
    defaultCtaLabel: 'Meer over mijn trouwreportages',
  },
  {
    slug: 'trouwdag',
    label: 'De trouwdag',
    description:
      'Over de trouwdag zelf, van de ochtend tot het feest. Wat ik volg, wat ik laat en hoe de dag in beeld komt.',
    group: 'bruiloft',
    ctaHeading: 'Gaan jullie trouwen?',
    defaultCtaHref: '/fotograaf-bruiloft#pakketten',
    defaultCtaLabel: 'Bekijk de trouwpakketten',
  },
  {
    slug: 'trouwlocaties',
    label: 'Trouwlocaties',
    description: 'Over plekken waar mensen trouwen, en wat een locatie doet met het licht, de groep en de dag.',
    group: 'bruiloft',
    ctaHeading: 'Trouwen in de regio?',
    defaultCtaHref: '/fotograaf-bruiloft',
    defaultCtaLabel: 'Bekijk de mogelijkheden',
  },
  {
    slug: 'portret',
    label: 'Portretten',
    description: 'Over portretten bij je thuis, op het werk of buiten. Hoe een sessie verloopt en waar ik op let.',
    group: 'portret',
    ctaHeading: 'Zelf een portret laten maken?',
    defaultCtaHref: '/portretfotos',
    defaultCtaLabel: 'Een portret laten maken',
  },
  {
    slug: 'vrij-werk',
    label: 'Vrij werk en series',
    description: 'Over mijn series en vrij werk, naast de opdrachten. Langlopende projecten, boeken en exposities.',
    group: 'kunst',
    defaultCtaHref: '/series',
    defaultCtaLabel: 'Bekijk de series',
  },
  {
    slug: 'achter-de-schermen',
    label: 'Achter de schermen',
    description: 'Over hoe het werk tot stand komt: kijken, afdrukken en wat je op de foto niet ziet.',
    group: 'algemeen',
    defaultCtaHref: '/contact',
    defaultCtaLabel: 'Neem contact op',
  },
] as const satisfies readonly BlogCategorie[];

export type BlogCategorySlug = (typeof BLOG_CATEGORIES)[number]['slug'];

const PER_SLUG = new Map(BLOG_CATEGORIES.map((categorie) => [categorie.slug, categorie]));

export function blogCategorie(slug: BlogCategorySlug) {
  const categorie = PER_SLUG.get(slug);
  if (!categorie) throw new Error(`Onbekende blogcategorie "${slug}". Voeg hem toe in src/data/blog-categories.ts.`);
  return categorie;
}

/** Slugs als tupel, voor het Zod-schema. Afgeleid van de lijst hierboven. */
export function blogCategorieSlugs(): [BlogCategorySlug, ...BlogCategorySlug[]] {
  return BLOG_CATEGORIES.map((categorie) => categorie.slug) as [BlogCategorySlug, ...BlogCategorySlug[]];
}
