import { getImage } from 'astro:assets';
import type { LandingPagina } from '../data/landing/types';
import type { ImageObjectInput } from './schema';

/**
 * Geoptimaliseerde afbeeldingen (WebP, bronbreedte) van de Impressie-foto's van een landingspagina, voor
 * JSON-LD (`ImageGallery`) en de afbeeldingensitemap. Beide gebruiken dezelfde `getImage`-parameters, dus dezelfde URL's.
 * Breedtes boven het origineel worden niet opgeschaald.
 */
export const IMPRESSIE_CREDIT = 'Paul Breuker';
export const IMPRESSIE_COPYRIGHT = '© Paul Breuker';

export interface ImpressieAfbeelding {
  /** Pad van de geoptimaliseerde afbeelding ("/_astro/…"). */
  src: string;
  alt: string;
  width: number;
  height: number;
}

export async function impressieAfbeeldingen(pagina: LandingPagina): Promise<ImpressieAfbeelding[]> {
  if (!pagina.impressie) return [];
  return Promise.all(
    pagina.impressie.fotos.map(async (foto) => {
      const { width, height } = foto.afbeelding;
      const resultaat = await getImage({ src: foto.afbeelding, width, height, format: 'webp', quality: 80 });
      return { src: resultaat.src, alt: foto.alt, width, height };
    }),
  );
}

/** Invoer voor `imageGallery()` in src/lib/schema.ts. */
export function impressieSchemaAfbeeldingen(afbeeldingen: ImpressieAfbeelding[]): ImageObjectInput[] {
  return afbeeldingen.map((afbeelding) => ({
    url: afbeelding.src,
    caption: afbeelding.alt,
    width: afbeelding.width,
    height: afbeelding.height,
    creditText: IMPRESSIE_CREDIT,
    copyrightNotice: IMPRESSIE_COPYRIGHT,
  }));
}
