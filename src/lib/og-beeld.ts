/**
 * Open Graph-beeld van /portfolio/bruiloften. Pagina's zonder eigen og:image gebruiken hetzelfde bestand
 * (BaseLayout). Geen nieuw bronbestand: dezelfde bron en dezelfde getImage-opties als die pagina.
 */
import { getImage } from 'astro:assets';
import { bruiloften } from '../data/bruiloften';

let belofte: Promise<string | undefined> | undefined;

/** JPEG van 1200 × 630, dezelfde variant als de og:image van /portfolio/bruiloften. */
export function bruiloftenDeelafbeelding(): Promise<string | undefined> {
  belofte ??= (async () => {
    const foto = bruiloften.find((item) => item.width > item.height) ?? bruiloften[0];
    if (!foto) return undefined;
    const beeld = await getImage({
      src: foto.image,
      width: 1200,
      height: 630,
      fit: 'cover',
      format: 'jpg',
      quality: 80,
    });
    return beeld.src;
  })();
  return belofte;
}
