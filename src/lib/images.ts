import type { ImageMetadata } from 'astro';

/**
 * Zoekt afbeeldingen van de homepage op naam (bestandsnaam zonder extensie)
 * in src/assets/home/. Twee foto's komen uit het portfolio (zelfde bron, geen kopie):
 * `Gaarkeuken 05-min.jpg` (uitgelicht op de homepage) en `experimenteel/018.jpg` (hero, rechtsonder).
 * Ontbreekt een bestand, dan geeft `getHomeImage` `undefined` terug en toont de pagina een placeholder in plaats van te falen.
 */
const modules = import.meta.glob<{ default: ImageMetadata }>(
  [
    '../assets/home/*.{jpg,jpeg,png,webp,avif}',
    '../assets/portfolio/de-gaarkeuken/Gaarkeuken 05-min.jpg',
    '../assets/portfolio/experimenteel/018.jpg',
    // Niet gebruikt op de site (zie src/data/home.ts). Importeren is genoeg om het origineel in /_astro te zetten, dus
    // staan ze hier uitgesloten. Wil je er een weer gebruiken: haal de regel hieronder weg.
    '!../assets/home/gaarkeuken-3.jpg',
    '!../assets/home/project-het-gezicht-van-nijmegen.jpg',
  ],
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
