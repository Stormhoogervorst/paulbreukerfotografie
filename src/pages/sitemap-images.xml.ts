import type { APIRoute } from 'astro';
import { fotograafBruiloft } from '../data/landing/fotograaf-bruiloft';
import { trouwfotograafNijmegen } from '../data/landing/trouwfotograaf-nijmegen';
import { trouwfotograafArnhem } from '../data/landing/trouwfotograaf-arnhem';
import { trouwfotograafUtrecht } from '../data/landing/trouwfotograaf-utrecht';
import { trouwfotograafAmsterdam } from '../data/landing/trouwfotograaf-amsterdam';
import { trouwfotograafRotterdam } from '../data/landing/trouwfotograaf-rotterdam';
import { impressieAfbeeldingen } from '../lib/landing-impressie';
import { absoluteUrl } from '../lib/schema';

/**
 * Afbeeldingensitemap voor de Impressie van landingspagina's. De portfolio-pagina's (/portfolio, /portfolio/portretten,
 * /portfolio/bruiloften) staan hier niet in: ze zijn `noindex`, en een sitemap bevat alleen indexeerbare URL's.
 */

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/** Landingspagina's met een Impressie: hun foto's staan bij de eigen pagina-URL. Voeg nieuwe landingspagina's hier toe. */
const LANDINGSPAGINAS = [
  fotograafBruiloft,
  trouwfotograafNijmegen,
  trouwfotograafArnhem,
  trouwfotograafUtrecht,
  trouwfotograafAmsterdam,
  trouwfotograafRotterdam,
];

async function landingUrls(): Promise<string[]> {
  const urls = await Promise.all(
    LANDINGSPAGINAS.map(async (pagina) => {
      const fotos = await impressieAfbeeldingen(pagina);
      if (fotos.length === 0) return '';
      const images = fotos.map((foto) =>
        [
          '    <image:image>',
          `      <image:loc>${escapeXml(absoluteUrl(foto.src))}</image:loc>`,
          `      <image:title>${escapeXml(foto.alt)}</image:title>`,
          '    </image:image>',
        ].join('\n'),
      );
      return ['  <url>', `    <loc>${absoluteUrl(`/${pagina.slug}`)}</loc>`, ...images, '  </url>'].join('\n');
    }),
  );
  return urls.filter(Boolean);
}

export const GET: APIRoute = async () => {
  const landing = await landingUrls();

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...landing,
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
