import type { APIRoute } from 'astro';
import { portfolio, type PortfolioPhoto } from '../data/portfolio';
import { bruiloften } from '../data/bruiloften';
import { portretten } from '../data/portretten';
import { getPortfolioImages } from '../lib/portfolio-images';
import { fotograafBruiloft } from '../data/landing/fotograaf-bruiloft';
import { trouwfotograafNijmegen } from '../data/landing/trouwfotograaf-nijmegen';
import { impressieAfbeeldingen } from '../lib/landing-impressie';
import { absoluteUrl } from '../lib/schema';

/**
 * Afbeeldingensitemap voor /portfolio, /portfolio/portretten, /portfolio/bruiloften en de Impressie van landingspagina's. Eén <url> met alle foto's; boven de 1000 afbeeldingen
 * (limiet per <url>) per serie gesplitst over meerdere <url>-elementen.
 */
const MAX_PER_URL = 1000;
const PAGE = '/portfolio';

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

function chunks(photos: PortfolioPhoto[]): PortfolioPhoto[][] {
  if (photos.length <= MAX_PER_URL) return [photos];
  const bySeries = new Map<string, PortfolioPhoto[]>();
  for (const photo of photos) {
    const key = photo.series ?? '';
    bySeries.set(key, [...(bySeries.get(key) ?? []), photo]);
  }
  const out: PortfolioPhoto[][] = [];
  for (const list of bySeries.values()) {
    for (let i = 0; i < list.length; i += MAX_PER_URL) out.push(list.slice(i, i + MAX_PER_URL));
  }
  return out;
}

/** Landingspagina's met een Impressie: hun foto's staan bij de eigen pagina-URL. Voeg nieuwe landingspagina's hier toe. */
const LANDINGSPAGINAS = [fotograafBruiloft, trouwfotograafNijmegen];

/** /portfolio/portretten: alle portretten, grote versie (zelfde varianten als op de pagina). */
async function portrettenUrl(): Promise<string> {
  if (portretten.length === 0) return '';
  const images = await Promise.all(
    portretten.map(async (photo) => {
      const { large } = await getPortfolioImages(photo);
      return [
        '    <image:image>',
        `      <image:loc>${escapeXml(absoluteUrl(large[large.length - 1].src))}</image:loc>`,
        `      <image:title>${escapeXml(photo.alt)}</image:title>`,
        '    </image:image>',
      ].join('\n');
    }),
  );
  return ['  <url>', `    <loc>${absoluteUrl('/portfolio/portretten')}</loc>`, ...images, '  </url>'].join('\n');
}

/** /portfolio/bruiloften: alle bruiloftfoto's, grote versie (zelfde varianten als op de pagina). */
async function bruiloftenUrl(): Promise<string> {
  if (bruiloften.length === 0) return '';
  const images = await Promise.all(
    bruiloften.map(async (photo) => {
      const { large } = await getPortfolioImages(photo);
      return [
        '    <image:image>',
        `      <image:loc>${escapeXml(absoluteUrl(large[large.length - 1].src))}</image:loc>`,
        `      <image:title>${escapeXml(photo.alt)}</image:title>`,
        '    </image:image>',
      ].join('\n');
    }),
  );
  return ['  <url>', `    <loc>${absoluteUrl('/portfolio/bruiloften')}</loc>`, ...images, '  </url>'].join('\n');
}

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
  const portrettenPagina = await portrettenUrl();
  const bruiloftenPagina = await bruiloftenUrl();
  const urls = await Promise.all(
    chunks(portfolio).map(async (group) => {
      const images = await Promise.all(
        group.map(async (photo) => {
          const { large } = await getPortfolioImages(photo);
          const loc = absoluteUrl(large[large.length - 1].src);
          return [
            '    <image:image>',
            `      <image:loc>${escapeXml(loc)}</image:loc>`,
            `      <image:title>${escapeXml(photo.alt)}</image:title>`,
            '    </image:image>',
          ].join('\n');
        }),
      );
      return ['  <url>', `    <loc>${absoluteUrl(PAGE)}</loc>`, ...images, '  </url>'].join('\n');
    }),
  );

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...landing,
    ...(portrettenPagina ? [portrettenPagina] : []),
    ...(bruiloftenPagina ? [bruiloftenPagina] : []),
    ...urls,
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
