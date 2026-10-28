// @ts-check
import { defineConfig, envField } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';

// Niet-indexeerbare paden: houd deze lijst gelijk aan de pagina's met `noindex`.
const NOT_INDEXABLE = ['/bedankt', '/404'];

// https://astro.build/config
export default defineConfig({
  site: 'https://paulbreuker.nl',
  trailingSlash: 'never',
  // Statisch, behalve de API-route (src/pages/api/aanvraag.ts, `prerender = false`): die draait on-demand via de adapter.
  output: 'static',
  adapter: vercel(),
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
        const { pathname } = new URL(page);
        return !NOT_INDEXABLE.includes(pathname.replace(/\/$/, ''));
      },
    }),
    mdx(),
  ],
});
