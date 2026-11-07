/**
 * Gepubliceerde posts, leestijd, gerelateerde stukken en de selectie voor "Uit de blog".
 * Drafts (`draft: true`) zitten hier nooit bij: niet op /blog, niet in een categorie, niet in de RSS.
 * In productie bouwt de blogroute ze ook niet (zie src/pages/blog/[...slug].astro).
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import {
  BLOG_CATEGORIES,
  blogCategorie,
  type BlogCategorySlug,
  type BlogCategorie,
  type BlogGroep,
} from '../data/blog-categories';

export type BlogPost = CollectionEntry<'blog'>;

export const BLOG_TITEL = 'Blog | Paul Breuker, fotograaf en kunstenaar uit Nijmegen';
export const BLOG_BESCHRIJVING =
  'Verhalen, tips en achtergronden van fotograaf en kunstenaar Paul Breuker uit Nijmegen: over bruiloften, portretten en zijn vrije werk.';

/** Een categoriepagina bestaat pas vanaf dit aantal gepubliceerde posts. */
export const CATEGORIE_DREMPEL = 3;

export const UIT_DE_BLOG_AANTAL = 3;

const RSS_PAD = '/blog/rss.xml';

export function rssPad(): string {
  return RSS_PAD;
}

export function postPad(id: string): string {
  return `/blog/${id}`;
}

export function categoriePad(slug: string): string {
  return `/blog/categorie/${slug}`;
}

/** Label zonder eigen pagina wijst naar het anker op /blog. Het anker is de slug. */
export function categorieHref(slug: string, aantalGepubliceerd: number): string {
  return aantalGepubliceerd >= CATEGORIE_DREMPEL ? categoriePad(slug) : `/blog#${slug}`;
}

export function documentTitel(title: string, seoTitle?: string): string {
  const eigen = seoTitle?.trim();
  return eigen ? eigen : `${title} | Paul Breuker`;
}

export function datumNl(datum: Date): string {
  return new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }).format(datum);
}

/** Ongeveer 200 woorden per minuut, minstens 1. */
export function leestijdMinuten(body: string | undefined): number {
  const woorden = body?.trim() ? body.trim().split(/\s+/).length : 0;
  return Math.max(1, Math.round(woorden / 200));
}

/** Haalt een afsluitende pijl uit de linktekst; de component zet die zelf, verborgen voor schermlezers. */
export function labelZonderPijl(label: string): string {
  return label.replace(/\s*→\s*$/u, '').trim();
}

export function padZonderHash(href: string): string {
  const zonder = href.split('#')[0]?.split('?')[0] ?? '';
  return zonder.length > 1 && zonder.endsWith('/') ? zonder.slice(0, -1) : zonder;
}

/** Nieuwste eerst. Drafts blijven achterwege, ook in dev. */
export async function gepubliceerdePosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog', ({ data }) => data.draft !== true);
  return posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

export async function aantalGepubliceerdePosts(): Promise<number> {
  return (await gepubliceerdePosts()).length;
}

/**
 * Routes voor /blog/[...slug]. In productie geen drafts: @astrojs/sitemap neemt elke gegenereerde route mee.
 * In dev zijn drafts wel te openen op hun eigen URL.
 */
export async function postsVoorRoutes(): Promise<BlogPost[]> {
  const posts = await getCollection('blog');
  return import.meta.env.PROD ? posts.filter((post) => post.data.draft !== true) : posts;
}

export function aantalPerCategorie(posts: BlogPost[]): Map<BlogCategorySlug, number> {
  const aantallen = new Map<BlogCategorySlug, number>();
  for (const post of posts) {
    aantallen.set(post.data.category, (aantallen.get(post.data.category) ?? 0) + 1);
  }
  return aantallen;
}

export function categorieenMetPagina(posts: BlogPost[]): BlogCategorie[] {
  const aantallen = aantalPerCategorie(posts);
  return BLOG_CATEGORIES.filter((categorie) => (aantallen.get(categorie.slug) ?? 0) >= CATEGORIE_DREMPEL);
}

export interface BlogCta {
  href: string;
  label: string;
  heading?: string;
}

/** CTA van de post, of de standaard van de categorie als de post geen eigen link heeft. */
export function ctaVanPost(post: BlogPost): BlogCta {
  const categorie = blogCategorie(post.data.category);
  return {
    href: post.data.ctaHref ?? categorie.defaultCtaHref,
    label: post.data.ctaLabel ?? categorie.defaultCtaLabel,
    heading: categorie.ctaHeading,
  };
}

/**
 * Drie gerelateerde posts: eerst dezelfde categorie, dan dezelfde groep, dan gedeelde tags, dan de nieuwste.
 * `posts` hoort nieuwste-eerst te zijn. De huidige post valt erbuiten.
 */
export function gerelateerdePosts(huidige: BlogPost, posts: BlogPost[], limit = 3): BlogPost[] {
  const rest = posts.filter((post) => post.id !== huidige.id);
  const categorie = huidige.data.category;
  const groep = blogCategorie(categorie).group;
  const tags = new Set(huidige.data.tags ?? []);
  const deeltTag = (post: BlogPost) => (post.data.tags ?? []).some((tag) => tags.has(tag));
  const andereGroep = (post: BlogPost) => blogCategorie(post.data.category).group !== groep;

  const bakken = [
    rest.filter((post) => post.data.category === categorie),
    rest.filter((post) => post.data.category !== categorie && blogCategorie(post.data.category).group === groep),
    rest.filter((post) => post.data.category !== categorie && andereGroep(post) && deeltTag(post)),
    rest.filter((post) => post.data.category !== categorie && andereGroep(post) && !deeltTag(post)),
  ];

  const gekozen: BlogPost[] = [];
  const ids = new Set<string>();
  for (const bak of bakken) {
    for (const post of bak) {
      if (gekozen.length >= limit) return gekozen;
      if (ids.has(post.id)) continue;
      ids.add(post.id);
      gekozen.push(post);
    }
  }
  return gekozen;
}

export function postsInGroep(posts: BlogPost[], groep: BlogGroep, limit = UIT_DE_BLOG_AANTAL): BlogPost[] {
  return posts.filter((post) => blogCategorie(post.data.category).group === groep).slice(0, limit);
}

/**
 * Stadspagina: eerst posts waarvan ctaHref of location bij die stad hoort, daarna de nieuwste posts
 * uit de groep bruiloft, tot `limit`. `posts` is nieuwste eerst; die volgorde blijft in beide delen.
 */
export function postsVoorStad(posts: BlogPost[], stad: string, limit = UIT_DE_BLOG_AANTAL): BlogPost[] {
  const naam = stad.trim().toLowerCase();
  const doel = `/trouwfotograaf-${naam}`;
  const pastBijStad = (post: BlogPost) => {
    if (post.data.ctaHref && padZonderHash(post.data.ctaHref) === doel) return true;
    return (post.data.location ?? '').toLowerCase().includes(naam);
  };
  const voorkeur = posts.filter(pastBijStad);
  const gekozen = new Set(voorkeur.map((post) => post.id));
  const aanvulling = posts.filter(
    (post) => !gekozen.has(post.id) && blogCategorie(post.data.category).group === 'bruiloft',
  );
  return [...voorkeur, ...aanvulling].slice(0, limit);
}

/**
 * "Uit de blog" onderaan een bestaande pagina. Leeg als er niets past: de aanroeper toont dan geen sectie.
 * Stadspagina's (trouwfotograaf-…) gebruiken de stadsselectie; de andere pagina's de groep.
 */
export async function postsOnderaan(slug: string): Promise<BlogPost[]> {
  const posts = await gepubliceerdePosts();
  if (slug === 'fotograaf-bruiloft') return postsInGroep(posts, 'bruiloft');
  if (slug === 'portretfotos') return postsInGroep(posts, 'portret');
  if (slug === 'series') return postsInGroep(posts, 'kunst');
  if (slug.startsWith('trouwfotograaf-')) return postsVoorStad(posts, slug.slice('trouwfotograaf-'.length));
  return [];
}

/** Zet "blog" in een navigatielijst, direct na het item met `naHref`. */
export function voegBlogToe<T extends { href: string }>(items: readonly T[], blog: T, naHref: string): T[] {
  const index = items.findIndex((item) => item.href === naHref);
  const plek = index === -1 ? items.length : index + 1;
  return [...items.slice(0, plek), blog, ...items.slice(plek)];
}

/** /blog en alles daaronder horen bij het navigatie-item Blog. Andere paden blijven een exacte vergelijking. */
export function isHuidigePagina(href: string, pad: string): boolean {
  if (href === '/blog') return pad === '/blog' || pad.startsWith('/blog/');
  return pad === href;
}
