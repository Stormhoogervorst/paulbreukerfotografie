import { getImage } from 'astro:assets';
import type { PortfolioPhoto } from '../data/portfolio';

/**
 * Beeldvarianten voor /portfolio, bij de build gemaakt door astro:assets (sharp).
 * Miniaturen voor het canvas (AVIF, in dev WebP) en grote versies voor de dialog (WebP).
 * Breedtes boven het origineel worden niet opgeschaald: dan valt de variant samen met het origineel.
 * Pagina en afbeeldingensitemap gebruiken deze functie, zodat elke foto één URL per variant heeft.
 */
export const THUMB_WIDTHS = [360, 720] as const;
export const LARGE_WIDTHS = [1600, 2400] as const;
/** De dev-server codeert op aanvraag; AVIF kost daar seconden per foto, WebP een fractie. */
const THUMB_FORMAT = import.meta.env.DEV ? 'webp' : 'avif';

export interface ImageVariant {
  src: string;
  width: number;
}

export interface PortfolioImageSet {
  thumbs: ImageVariant[];
  large: ImageVariant[];
}

const cache = new Map<string, Promise<PortfolioImageSet>>();

async function variants(
  photo: PortfolioPhoto,
  widths: readonly number[],
  format: 'avif' | 'webp',
  quality: number,
): Promise<ImageVariant[]> {
  const unique = [...new Set(widths.map((width) => Math.min(width, photo.width)))];
  const src = 'format' in photo.image ? photo.image : photo.image.src;
  return Promise.all(
    unique.map(async (width) => {
      const height = Math.round((width * photo.height) / photo.width);
      const result = await getImage({ src, width, height, format, quality });
      return { src: result.src, width };
    }),
  );
}

export function getPortfolioImages(photo: PortfolioPhoto): Promise<PortfolioImageSet> {
  let entry = cache.get(photo.id);
  if (!entry) {
    entry = Promise.all([
      variants(photo, THUMB_WIDTHS, THUMB_FORMAT, 55),
      variants(photo, LARGE_WIDTHS, 'webp', 80),
    ]).then(([thumbs, large]) => ({ thumbs, large }));
    cache.set(photo.id, entry);
  }
  return entry;
}

export function toSrcset(list: ImageVariant[]): string {
  return list.map((variant) => `${variant.src} ${variant.width}w`).join(', ');
}
