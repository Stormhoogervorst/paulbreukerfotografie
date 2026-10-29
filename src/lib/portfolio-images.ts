import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { gemiddeldeKleur } from './gemiddelde-kleur';

/**
 * Beeldvarianten voor het foto-canvas (/portfolio, /portfolio/portretten en /portfolio/bruiloften), bij de build gemaakt door
 * astro:assets (sharp). Alle drie de pagina's gebruiken dezelfde varianten, dus elke foto heeft één URL per variant en de
 * pagina's, de JSON-LD en de afbeeldingensitemap wijzen naar dezelfde bestanden.
 *
 * - Alleen AVIF, geen WebP-variant: elke extra variant telt mee in de buildgrootte en de buildtijd, en deze pagina's zijn
 *   beleving (lage SEO-prioriteit), geen plek waar een fallback voor oude browsers de moeite waard is. De <img> heeft de
 *   AVIF als `src` en `srcset`.
 * - Miniaturen voor het canvas: 480 en 800 px breed, AVIF kwaliteit 58. De `sizes` van een tegel is zijn eigen breedte
 *   in px (hooguit circa 270 px op desktop en circa 190 px op mobiel): een telefoon (tegel circa 130 tot 190 px, DPR 2 tot
 *   3) en een desktop op 1x kiezen 480, een desktop op 2x kiest 800. Tegels zijn klein en korrelig; 58 is op die maat niet
 *   van 70 te onderscheiden en scheelt ongeveer een derde in bytes.
 * - Grote versie voor de lightbox: één variant van 2200 px breed. Laadt pas na een klik (en daarna alleen de vorige en
 *   volgende foto).
 * - Kwaliteit: miniaturen 58, lightbox 75 (de standaard van de beeldservice is 70, zie src/lib/image-service.ts).
 * - Breedtes boven het origineel worden niet opgeschaald: dan valt de variant samen met het origineel.
 * - Kleur: het gemiddelde kleurvlak van de foto (sharp stats), als achtergrond tijdens het laden.
 * - In dev (de server codeert op aanvraag; AVIF kost daar seconden per foto) is het formaat WebP.
 */
export const THUMB_WIDTHS = [480, 800] as const;
export const LARGE_WIDTHS = [2200] as const;
export const THUMB_QUALITY = 58;
export const LARGE_QUALITY = 75;
const FORMAT = import.meta.env.DEV ? 'webp' : 'avif';

export interface ImageVariant {
  src: string;
  width: number;
}

export interface PortfolioImageSet {
  /** Miniaturen (AVIF; WebP in dev), de kleinste eerst. */
  thumbs: ImageVariant[];
  /** Grote versie voor de lightbox (AVIF; WebP in dev): maximaal 2200 px breed. */
  large: ImageVariant[];
  /** Gemiddelde kleur als `#rrggbb`. */
  color: string;
}

/** Het minimum dat de beeldfuncties van een foto nodig hebben (structureel gelijk aan `PortfolioPhoto`). */
export interface ImagePhoto {
  id: string;
  width: number;
  height: number;
  image: ImageMetadata | { src: string; width: number; height: number };
}

const cache = new Map<string, Promise<PortfolioImageSet>>();

async function variants(photo: ImagePhoto, widths: readonly number[], quality: number): Promise<ImageVariant[]> {
  const unique = [...new Set(widths.map((width) => Math.min(width, photo.width)))];
  const src = 'format' in photo.image ? photo.image : photo.image.src;
  return Promise.all(
    unique.map(async (width) => {
      const height = Math.round((width * photo.height) / photo.width);
      const result = await getImage({ src, width, height, format: FORMAT, quality });
      return { src: result.src, width };
    }),
  );
}

export function getPortfolioImages(photo: ImagePhoto): Promise<PortfolioImageSet> {
  const key = `${photo.id}|${photo.width}x${photo.height}`;
  let entry = cache.get(key);
  if (!entry) {
    entry = Promise.all([
      variants(photo, THUMB_WIDTHS, THUMB_QUALITY),
      variants(photo, LARGE_WIDTHS, LARGE_QUALITY),
      gemiddeldeKleur(photo.image),
    ]).then(([thumbs, large, color]) => ({ thumbs, large, color }));
    cache.set(key, entry);
  }
  return entry;
}

export function toSrcset(list: ImageVariant[]): string {
  return list.map((variant) => `${variant.src} ${variant.width}w`).join(', ');
}
