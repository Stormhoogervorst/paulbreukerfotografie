/**
 * Serie-informatie voor /portfolio: mapnaam (slug) naar titel en seriepagina.
 * Onbekende mapnamen krijgen een titel afgeleid uit de mapnaam en geen link.
 * Geen /promoties: die URL is een redirect naar de Radboud-site (zie vercel.json).
 */

export interface PortfolioSeries {
  slug: string;
  title: string;
  /** Seriepagina op deze site; `null` als er (nog) geen pagina is. */
  href: string | null;
}

const KNOWN_SERIES: Record<string, { title: string; href: string }> = {
  'love-marriage': { title: 'Love & Marriage', href: '/love-marriage' },
  'asty-mwaka': { title: 'Asty Mwaka', href: '/asty-mwaka' },
  'groeten-uit-lent': { title: 'Groeten uit Lent', href: '/groeten-uit-lent' },
  'take-me-to-the-river': { title: 'Take me to the river', href: '/take-me-to-the-river' },
  'de-gaarkeuken': { title: 'De Gaarkeuken', href: '/de-gaarkeuken' },
  asfalt: { title: 'Asfalt', href: '/asfalt' },
  panoramas: { title: "Panorama's", href: '/panoramas' },
  portretten: { title: 'Portretten', href: '/portretten' },
  'het-gezicht-van-nijmegen': { title: 'Het Gezicht van Nijmegen', href: '/het-gezicht-van-nijmegen' },
};

/** Onbekende mapnaam, bijvoorbeeld "huiskamers", wordt "Huiskamers". */
function titleFromSlug(slug: string): string {
  const words = slug.replace(/[-_]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function getSeries(slug: string): PortfolioSeries {
  const known = KNOWN_SERIES[slug];
  if (known) return { slug, title: known.title, href: known.href };
  return { slug, title: titleFromSlug(slug), href: null };
}
