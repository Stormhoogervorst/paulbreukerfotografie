import { getImage } from 'astro:assets';
import type { LandingPagina } from '../data/landing/types';
import type { ImageObjectInput } from './schema';

/**
 * Geoptimaliseerde afbeeldingen (WebP, bronbreedte) van de Impressie-foto's van een landingspagina, voor
 * JSON-LD (`ImageGallery`) en de afbeeldingensitemap. Beide gebruiken dezelfde `getImage`-parameters, dus dezelfde URL's.
 * Breedte: de grootste uit de srcset van de pagina, nooit boven het origineel.
 */
export const IMPRESSIE_CREDIT = 'Paul Breuker';
export const IMPRESSIE_COPYRIGHT = '© Paul Breuker';
/** Grootste breedte in de srcset van LandingImpressie (WIDTHS aldaar). */
const IMPRESSIE_MAX_BREEDTE = 1280;

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
      // Dezelfde variant als de grootste breedte op de pagina (LandingImpressie): geen extra bestand in de build.
      const breedte = Math.min(foto.afbeelding.width, IMPRESSIE_MAX_BREEDTE);
      const hoogte = Math.round((breedte * foto.afbeelding.height) / foto.afbeelding.width);
      const resultaat = await getImage({ src: foto.afbeelding, width: breedte, height: hoogte, format: 'webp' });
      return { src: resultaat.src, alt: foto.alt, width: breedte, height: hoogte };
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
