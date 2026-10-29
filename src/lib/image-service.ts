/**
 * Beeldservice voor astro:assets: de standaard sharp-service van Astro, met een vaste kwaliteit per uitvoerformaat voor
 * afbeeldingen die zelf geen `quality` meegeven: AVIF 70 en WebP 76. (De `quality`-prop van <Picture> geldt voor alle
 * formaten tegelijk, en dat past hier niet.) JPEG blijft op 80 voor de Open Graph-afbeeldingen.
 *
 * Smalle AVIF's (onder 800 px breed, de variant die een telefoon laadt) gaan op kwaliteit 62: op die maat is het verschil
 * met 70 niet te zien en scheelt het ongeveer 15% in bytes, precies waar het LCP-beeld op mobiel van afhangt.
 *
 * Alles wordt bij de build gemaakt (statische output); er is geen runtime-optimalisatie.
 * Ingesteld in astro.config.mjs (`image.service.entrypoint`).
 */
import sharpService from 'astro/assets/services/sharp';
import type { LocalImageService } from 'astro';

export const KWALITEIT_PER_FORMAAT = { avif: 70, webp: 76, jpg: 80, jpeg: 80 } as const;
export const KWALITEIT_AVIF_SMAL = 62;
export const SMAL_ONDER = 800;

const service: LocalImageService = {
  ...sharpService,
  async transform(inputBuffer, transform, config, logger) {
    const formaat = transform.format as keyof typeof KWALITEIT_PER_FORMAAT | undefined;
    const smal = formaat === 'avif' && typeof transform.width === 'number' && transform.width < SMAL_ONDER;
    const quality = transform.quality ?? (smal ? KWALITEIT_AVIF_SMAL : formaat ? KWALITEIT_PER_FORMAAT[formaat] : undefined);
    return sharpService.transform!(inputBuffer, { ...transform, quality }, config, logger);
  },
};

export default service;
