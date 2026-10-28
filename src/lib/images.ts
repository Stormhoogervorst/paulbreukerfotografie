import type { ImageMetadata } from 'astro';

/**
 * Zoekt afbeeldingen van de homepage op naam (bestandsnaam zonder extensie)
 * in src/assets/home/. Ontbreekt een bestand, dan geeft `getHomeImage`
 * `undefined` terug en toont de pagina een placeholder in plaats van te falen.
 */
const modules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/home/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

const byName = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(modules)) {
  const file = path.split('/').pop() ?? '';
  byName.set(file.replace(/\.[^.]+$/, ''), mod.default);
}

export function getHomeImage(name: string): ImageMetadata | undefined {
  return byName.get(name);
}
