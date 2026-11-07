/**
 * Foto's in een blogpost, zonder import in de MDX.
 * `pad` is relatief aan `src/assets`, bijvoorbeeld `portfolio/bruiloften recent/DSC01556.jpg`.
 * Alleen bestanden die een post echt gebruikt, gaan door astro:assets.
 */
import type { ImageMetadata } from 'astro';

const laders = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
);

export function blogFotoSleutel(pad: string): string {
  const schoon = pad
    .trim()
    .replace(/^\/+/, '')
    .replace(/^src\/assets\//, '')
    .replace(/^\.\.\/assets\//, '')
    .replace(/^assets\//, '');
  return `../assets/${schoon}`;
}

export async function blogFoto(pad: string): Promise<ImageMetadata> {
  const sleutel = blogFotoSleutel(pad);
  const laad = laders[sleutel];
  if (!laad) {
    throw new Error(
      `Blogfoto niet gevonden: "${pad}" (gezocht als ${sleutel}). Het pad is relatief aan src/assets en moet exact kloppen, inclusief spaties en hoofdletters.`,
    );
  }
  return (await laad()).default;
}

export async function blogFotos(
  fotos: Array<{ src: string | ImageMetadata; alt: string }>,
): Promise<Array<{ src: ImageMetadata; alt: string }>> {
  return Promise.all(
    fotos.map(async (foto) => ({
      alt: foto.alt,
      src: typeof foto.src === 'string' ? await blogFoto(foto.src) : foto.src,
    })),
  );
}
