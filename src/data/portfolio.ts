/**
 * Manifest van alle foto's voor /portfolio.
 *
 * Bron: src/assets/portfolio/<map>/<bestand> (recursief, alle mappen). De mapnaam is de serie (zie portfolio-series.ts),
 * bestanden direct in src/assets/portfolio/ hebben geen serie. Volgorde: gesorteerd op id (serie + bestandsnaam), zoals altijd;
 * alt-teksten: src/data/alt-teksten.ts.
 *
 * De weergave (pagina, canvas, sitemap) gebruikt alleen `portfolio` en het type `PortfolioPhoto`.
 * Wil je later een andere bron (bijvoorbeeld externe opslag), vervang dan `localSource()` door een
 * functie die dezelfde `PortfolioSourceItem[]` oplevert; voor externe URL's moet het domein dan in
 * `image.domains` van astro.config.mjs staan.
 */
import type { ImageMetadata } from 'astro';
import { altVoor } from './alt-teksten';
import dubbelen from './portfolio-dubbelen.json';
import { getSeries } from './portfolio-series';

/** Externe afbeelding met bekende afmetingen. */
export interface RemoteImage {
  src: string;
  width: number;
  height: number;
}

export interface PortfolioSourceItem {
  /** Serie-slug (mapnaam als slug) of `null`. */
  series: string | null;
  /** Mapnaam zoals die op schijf heet (voor het pad naar de alt-tekst); leeg voor bestanden direct in portfolio/. */
  folder?: string;
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

/** Bestanden die Paul.* of paul.* heten zijn zijn eigen portret (OverPaul) en horen niet in het portfolio. */
const PAUL_BESTAND = /^paul[^/]*$/i;
/** Dezelfde foto die in meer dan één map staat (scripts/foto-mapping.mjs): de kopie in de projectmap blijft. */
const DUBBEL = new Set<string>(dubbelen);

/**
 * Alle afbeeldingen uit alle mappen onder src/assets/portfolio (recursief), ook nieuwe mappen en de portretmap. Een nieuwe map
 * wordt NIET automatisch een project: series.ts bepaalt welke projecten bestaan (zie het commentaar daar). De mapnaam geeft
 * hier alleen de serienaam in de lightbox (onbekende mapnamen krijgen een titel uit de mapnaam en geen link).
 * `.tif` wordt door Astro niet herkend (zie scripts/portfolio-inventaris.md); daarvoor staat een .jpg naast het bestand.
 */
function localSource(): PortfolioSourceItem[] {
  const modules = import.meta.glob<{ default: ImageMetadata }>(
    [
      '../assets/portfolio/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}',
      // Uitgesloten dubbelen (zie DUBBEL) die een eigen, kleinere bestandsinhoud hebben: Vite zou ze anders als origineel
      // in /_astro zetten (importeren is genoeg), terwijl ze nergens getoond worden. Houd gelijk met portfolio-dubbelen.json.
      '!../assets/portfolio/bruiloften portfolio/006.jpg',
      '!../assets/portfolio/experimenteel/047a.jpg',
    ],
    { eager: true },
  );
  return Object.entries(modules).flatMap(([path, mod]) => {
    const relatief = path.slice(ROOT.length);
    const parts = relatief.split('/');
    const file = parts.pop() ?? '';
    if (PAUL_BESTAND.test(file) || DUBBEL.has(relatief)) return [];
    const folder = parts.join('/');
    return [{ series: folder ? slugify(folder) : null, folder, file, image: mod.default }];
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

      const alt = altVoor(item.folder ?? item.series ?? '', item.file);
      if (!alt) console.warn(`[portfolio] geen alt-tekst voor "${item.folder ? `${item.folder}/` : ''}${item.file}" (src/data/alt-teksten.ts); terugvaltekst gebruikt.`);

      return {
        id,
        series: series?.slug ?? null,
        seriesTitle: series?.title ?? null,
        seriesHref: series?.href ?? null,
        file: item.file,
        width: item.image.width,
        height: item.image.height,
        alt: alt ?? (series ? `Foto uit de serie ${series.title}` : 'Foto van Paul Breuker'),
        image: item.image,
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

export const portfolio: PortfolioPhoto[] = buildManifest(localSource());

/** Geen twee gelijke alt-teksten op /portfolio (productiebuild faalt, dev waarschuwt). */
{
  const seen = new Map<string, string>();
  const dubbeleAlt: string[] = [];
  for (const photo of portfolio) {
    const other = seen.get(photo.alt);
    if (other) dubbeleAlt.push(`"${photo.id}" en "${other}" hebben dezelfde alt-tekst`);
    seen.set(photo.alt, photo.id);
  }
  if (dubbeleAlt.length > 0) {
    const message = `src/data/portfolio.ts:\n- ${dubbeleAlt.join('\n- ')}`;
    if (import.meta.env.PROD) throw new Error(message);
    console.warn(`[portfolio] ${message}`);
  }
}
