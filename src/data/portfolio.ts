/**
 * Manifest van alle foto's voor /portfolio.
 *
 * Bron: src/assets/portfolio/<serie>/<bestand>. De mapnaam is de serie (zie portfolio-series.ts),
 * bestanden direct in src/assets/portfolio/ hebben geen serie.
 *
 * De weergave (pagina, canvas, sitemap) gebruikt alleen `portfolio` en het type `PortfolioPhoto`.
 * Wil je later een andere bron (bijvoorbeeld externe opslag), vervang dan `localSource()` door een
 * functie die dezelfde `PortfolioSourceItem[]` oplevert; voor externe URL's moet het domein dan in
 * `image.domains` van astro.config.mjs staan.
 */
import type { ImageMetadata } from 'astro';
import altOverrides from './portfolio-alt.json';
import { getSeries } from './portfolio-series';

/** Externe afbeelding met bekende afmetingen. */
export interface RemoteImage {
  src: string;
  width: number;
  height: number;
}

export interface PortfolioSourceItem {
  /** Serie-slug (mapnaam) of `null`. */
  series: string | null;
  /** Bestandsnaam met extensie. */
  file: string;
  image: ImageMetadata | RemoteImage;
}

export interface PortfolioPhoto {
  /** Uniek, alleen a-z, 0-9 en koppeltekens. */
  id: string;
  series: string | null;
  seriesTitle: string | null;
  /** Seriepagina, of `null` als die onbekend is. */
  seriesHref: string | null;
  file: string;
  width: number;
  height: number;
  alt: string;
  image: ImageMetadata | RemoteImage;
}

const ROOT = '../assets/portfolio/';

function localSource(): PortfolioSourceItem[] {
  const modules = import.meta.glob<{ default: ImageMetadata }>(
    '../assets/portfolio/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}',
    { eager: true },
  );
  return Object.entries(modules).map(([path, mod]) => {
    const parts = path.slice(ROOT.length).split('/');
    const file = parts.pop() ?? '';
    return { series: parts.length ? parts.join('/') : null, file, image: mod.default };
  });
}

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const overrides = altOverrides as Record<string, string>;

export function buildManifest(items: PortfolioSourceItem[]): PortfolioPhoto[] {
  const seen = new Set<string>();
  return items
    .map((item): PortfolioPhoto => {
      const series = item.series ? getSeries(item.series) : null;
      const base = slugify(item.file.replace(/\.[^.]+$/, '')) || 'foto';
      const stem = series ? `${slugify(series.slug)}-${base}` : base;
      let id = stem;
      for (let n = 2; seen.has(id); n += 1) id = `${stem}-${n}`;
      seen.add(id);

      const key = item.series ? `${item.series}/${item.file}` : item.file;
      const alt =
        overrides[key]?.trim() ||
        (series ? `Foto uit de serie ${series.title}` : 'Foto van Paul Breuker');

      return {
        id,
        series: series?.slug ?? null,
        seriesTitle: series?.title ?? null,
        seriesHref: series?.href ?? null,
        file: item.file,
        width: item.image.width,
        height: item.image.height,
        alt,
        image: item.image,
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

export const portfolio: PortfolioPhoto[] = buildManifest(localSource());
