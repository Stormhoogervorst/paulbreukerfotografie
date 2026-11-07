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
      };
    });
}

export function gepubliceerdeBlogSlugs(): Set<string> {
  return new Set(leesBlogBestanden().filter((bestand) => !bestand.draft).map((bestand) => bestand.slug));
}

/** True zodra er minstens één gepubliceerde post is. Dan hoort /blog in de sitemap. */
export function blogIndexeerbaar(): boolean {
  return gepubliceerdeBlogSlugs().size > 0;
}
