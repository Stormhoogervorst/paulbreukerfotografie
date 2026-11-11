/**
 * Of de blog geïndexeerd mag worden, gelezen van de bestanden op schijf.
 *
 * astro.config.mjs kan `astro:content` niet importeren. De sitemap-filter gebruikt daarom deze telling.
 * Dezelfde regel als src/lib/blog.ts: een post is een draft als de frontmatter `draft: true` bevat.
 * Ontbreekt het veld, dan is de post gepubliceerd (het schema zet de standaard op false).
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BLOG_DIR = join(process.cwd(), 'src/content/blog');

export interface BlogBestand {
  slug: string;
  draft: boolean;
  /** `updatedDate` uit de frontmatter, anders `pubDate` (ISO 8601). Ontbreekt bij een onleesbare datum. */
  gewijzigd?: string;
}

/** Leest een datumveld (`pubDate: 2026-10-08`, met of zonder aanhalingstekens) uit de frontmatter. */
function frontmatterDatum(frontmatter: string, veld: string): Date | undefined {
  const waarde = frontmatter.match(new RegExp(`^${veld}:\\s*['"]?([^'"\\r\\n]+)`, 'm'))?.[1]?.trim();
  if (!waarde) return undefined;
  const datum = new Date(waarde);
  return Number.isNaN(datum.getTime()) ? undefined : datum;
}

export function leesBlogBestanden(): BlogBestand[] {
  if (!existsSync(BLOG_DIR)) return [];
  return readdirSync(BLOG_DIR)
    .filter((naam) => naam.endsWith('.mdx') || naam.endsWith('.md'))
    .map((naam) => {
      const tekst = readFileSync(join(BLOG_DIR, naam), 'utf8');
      const frontmatter = tekst.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
      return {
        slug: naam.replace(/\.(mdx|md)$/, ''),
        draft: /^draft:\s*true\b/im.test(frontmatter),
        gewijzigd: (
          frontmatterDatum(frontmatter, 'updatedDate') ?? frontmatterDatum(frontmatter, 'pubDate')
        )?.toISOString(),
      };
    });
}

/**
 * `lastmod` voor de sitemap. Een blogpost: zijn `updatedDate`, anders `pubDate` (dezelfde datum als `dateModified` in de
 * JSON-LD). /blog: de datum van de nieuwste gepubliceerde post. Elk ander pad: geen datum.
 */
export function blogLaatstGewijzigd(pad: string): string | undefined {
  const gepubliceerd = leesBlogBestanden().filter((bestand) => !bestand.draft);
  if (pad === '/blog') {
    return gepubliceerd
      .map((bestand) => bestand.gewijzigd)
      .filter((datum): datum is string => Boolean(datum))
      .sort()
      .at(-1);
  }
  if (!pad.startsWith('/blog/')) return undefined;
  const slug = pad.slice('/blog/'.length);
  return gepubliceerd.find((bestand) => bestand.slug === slug)?.gewijzigd;
}

export function gepubliceerdeBlogSlugs(): Set<string> {
  return new Set(leesBlogBestanden().filter((bestand) => !bestand.draft).map((bestand) => bestand.slug));
}

/** True zodra er minstens één gepubliceerde post is. Dan hoort /blog in de sitemap. */
export function blogIndexeerbaar(): boolean {
  return gepubliceerdeBlogSlugs().size > 0;
}
