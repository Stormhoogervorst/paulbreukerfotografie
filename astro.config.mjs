// @ts-check
import { defineConfig, envField } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';
import { blogLaatstGewijzigd, gepubliceerdeBlogSlugs } from './src/lib/blog-indexeerbaar.ts';

// Niet-indexeerbare paden: houd deze lijst gelijk aan de pagina's met `noindex`.
const NOT_INDEXABLE = ['/bedankt', '/404', '/portfolio', '/portfolio/portretten', '/portfolio/bruiloften', '/privacy'];

// https://astro.build/config
export default defineConfig({
  site: 'https://paulbreuker.nl',
  trailingSlash: 'never',
  // Statisch, behalve de API-route (src/pages/api/aanvraag.ts, `prerender = false`): die draait on-demand via de adapter.
  output: 'static',
  // Skew Protection uit: anders krijgt elk bestand in /_astro bij elke deploy een andere URL (`?dpl=dpl_...`), ook in
  // og:image, de afbeeldingensitemap en de JSON-LD. Google Afbeeldingen ziet dan na elke deploy nieuwe URL's. De site is
  // statisch (alleen het formulier draait on-demand), dus de bescherming tegen versieverschillen is hier niet nodig.
  adapter: vercel({ skewProtection: false }),
  // Afbeeldingen: alle varianten (AVIF/WebP, meerdere breedtes) worden bij de build gemaakt en staan als statische bestanden in
  // /_astro (geen runtime-optimalisatie, geen serverless function). De eigen service is de sharp-service van Astro met een
  // vaste kwaliteit per formaat (AVIF 70, WebP 76), zie src/lib/image-service.ts en src/lib/beeld.ts.
  // AVIF-inspanning 2 in plaats van sharp's standaard 4: gemeten ruim 5x sneller coderen (7,3 s tegen 1,4 s voor een 2200 px
  // brede foto) met ongeveer 5% grotere bestanden. Zonder dit duurde de koude build 44 minuten (de limiet op Vercel is 45).
  image: {
    service: { entrypoint: './src/lib/image-service.ts', config: { avif: { effort: 2 } } },
  },
  // Formulier en e-mail (Resend), zie README. Allemaal optioneel: zonder sleutel werkt de dev-modus (dry-run); in
  // productie geeft de route dan een 503. Geheimen worden pas op het moment van het verzoek gelezen (niet ingebakken).
  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      FORM_TO_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      FORM_FROM_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  integrations: [
    sitemap({
      filter: (page) => {
        const pad = new URL(page).pathname.replace(/\/$/, '') || '/';
        if (NOT_INDEXABLE.includes(pad)) return false;
        // /blog is noindex zolang er geen gepubliceerde post is. Drafts worden niet gebouwd; deze check is de vangnet.
        const gepubliceerd = gepubliceerdeBlogSlugs();
        if (pad === '/blog') return gepubliceerd.size > 0;
        if (pad.startsWith('/blog/') && !pad.startsWith('/blog/categorie/')) {
          const slug = pad.slice('/blog/'.length);
          if (!slug || slug.includes('/')) return false;
          return gepubliceerd.has(slug);
        }
        return true;
      },
      // `lastmod` alleen waar een echte datum bestaat: blogposts (updatedDate, anders pubDate) en /blog (de nieuwste
      // post). Andere pagina's hebben geen betrouwbare wijzigingsdatum en krijgen er dus geen.
      serialize: (item) => {
        const pad = new URL(item.url).pathname.replace(/\/$/, '') || '/';
        const lastmod = blogLaatstGewijzigd(pad);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
    mdx(),
  ],
});
