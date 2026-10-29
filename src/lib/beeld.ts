/**
 * Gedeelde instellingen voor afbeeldingen (astro:assets): formaten en breedtereeksen per soort plek.
 *
 * - Formaten: AVIF in een <source>, WebP in de <img> (die ook de fallback is). Geen derde (JPEG-)kopie: dat scheelt een
 *   derde van de buildtijd en browsers zonder AVIF krijgen WebP. In dev alleen WebP (AVIF coderen kost daar seconden per foto).
 * - Kwaliteit: AVIF 70 en WebP 76, ingesteld in src/lib/image-service.ts (de <Picture>-prop `quality` geldt voor alle formaten).
 * - Breedtes: astro:assets laat breedtes boven het bronbestand weg en voegt de bronbreedte toe, dus een kleine bron geeft
 *   automatisch een korte reeks. Houd de reeksen kort: elke breedte is een extra AVIF en WebP in de build.
 * - Eager (`loading="eager"`, `fetchpriority="high"`) is voor het LCP-beeld van de pagina; al het andere is lazy.
 */
export const FORMATEN: Array<'avif'> = import.meta.env.DEV ? [] : ['avif'];
export const FALLBACK_FORMAAT = 'webp' as const;

/**
 * Beelden van rand tot rand (hero-achtig: Panorama en LandingBeeld). 780 is de variant voor een telefoon: 390 px breed bij
 * DPR 2 vraagt 780 px, 412 px (Lighthouse, Moto G Power) bij DPR 1,75 vraagt 721 px. Een variant van 720 is voor beide net
 * te klein (de browser kiest dan de volgende, 1280); 780 past voor beide. Onder 800 px is de AVIF kwaliteit 62
 * (src/lib/image-service.ts).
 */
export const BREEDTES_HERO = [780, 1280, 1920, 2560];
/** Kaarten op /series (twee kolommen). */
export const BREEDTES_KAART = [480, 720, 1280];
/**
 * Foto's op projectpagina's (paren van twee en de losse laatste foto). 720 voor een telefoon (de `sizes` geeft onder 700 px
 * 89vw: 347 px bij 390 px breed en DPR 2 vraagt 694 px, 367 px bij 412 px en DPR 1,75 vraagt 642 px) en een laptop op 1x
 * (circa 620 px); 1280 voor een retinascherm en een brede monitor. 960 en 1440 zijn vervallen om onder de 1500 varianten en
 * 345 MB te blijven. Eerder: 480, 720, 960, 1280 en 1920.
 */
export const BREEDTES_FOTO = [720, 1280];
/** Foto van Paul bij "(over paul)". */
export const BREEDTES_PAUL = [200, 400];

/** Het deel van een reeks dat een plek nodig heeft: alle breedtes tot en met de eerste die minstens `maxBreedte` is. */
export function reeksTot(breedtes: number[], maxBreedte: number): number[] {
  const index = breedtes.findIndex((breedte) => breedte >= maxBreedte);
  return index === -1 ? breedtes : breedtes.slice(0, index + 1);
}
