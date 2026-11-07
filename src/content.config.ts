/**
 * Content collection "blog". Nieuw stuk: een MDX-bestand in src/content/blog/.
 * De toegestane categorieën komen uit src/data/blog-categories.ts.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { blogCategorieSlugs } from './data/blog-categories';

const blog = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/blog',
    generateId: ({ entry }) => entry.replace(/\.(md|mdx)$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      /** Paginatitel, max. 60 tekens. Ontbreekt hij, dan wordt het `title | Paul Breuker`. */
      seoTitle: z.string().max(60).optional(),
      description: z.string().min(1).max(155),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image(),
      heroAlt: z.string().min(1),
      category: z.enum(blogCategorieSlugs()),
      tags: z.array(z.string()).optional(),
      /** Alleen intern, niet zichtbaar op de pagina. */
      primaryKeyword: z.string().optional(),
      /** Pad op deze site. Ontbreekt het, dan geldt de standaard van de categorie. */
      ctaHref: z
        .string()
        .regex(/^\//, 'ctaHref begint met /')
        .optional(),
      ctaLabel: z.string().optional(),
      /** Voor locatiereportages, bijvoorbeeld "Kasteel Doorwerth". */
      location: z.string().optional(),
      faq: z
        .array(
          z.object({
            question: z.string().min(1),
            answer: z.string().min(1),
          }),
        )
        .optional(),
      /** Drafts zijn in dev te openen, maar worden niet gebouwd en niet vermeld. */
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
