import type { APIRoute } from 'astro';

// Alles toestaan, ook AI-crawlers (GPTBot, ClaudeBot, PerplexityBot e.d.) worden niet geblokkeerd.
export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://paulbreuker.nl');
  const sitemapIndex = new URL('/sitemap-index.xml', base).href;
  const sitemapImages = new URL('/sitemap-images.xml', base).href;

  const body = [
    'User-agent: *',
    'Allow: /',
    // De formulier-API is geen content. /bedankt blijft crawlbaar (met noindex), zodat de noindex gelezen wordt.
    'Disallow: /api/',
    '',
    `Sitemap: ${sitemapIndex}`,
    `Sitemap: ${sitemapImages}`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
