// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';

// Niet-indexeerbare paden: houd deze lijst gelijk aan de pagina's met `noindex`.
const NOT_INDEXABLE = ['/bedankt', '/404'];

// https://astro.build/config
export default defineConfig({
  site: 'https://paulbreuker.nl',
  trailingSlash: 'never',
  output: 'static',
  adapter: vercel(),
  integrations: [
    sitemap({
      filter: (page) => {
        const { pathname } = new URL(page);
        return !NOT_INDEXABLE.includes(pathname.replace(/\/$/, ''));
      },
    }),
    mdx(),
  ],
});
