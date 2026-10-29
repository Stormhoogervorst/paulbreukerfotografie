/**
 * Alle bruiloftfoto's van Paul voor /portfolio/bruiloften (src/pages/portfolio/bruiloften.astro).
 *
 * Bron: src/assets/portfolio/bruiloften portfolio/ (alle afbeeldingen in die map), op bestandsnaam gesorteerd (cijfers
 * numeriek en vóór letters, hoofdletters genegeerd). Breedte en hoogte komen uit het bronbestand. Het canvas gebruikt
 * alleen `bruiloften` en het type `Bruiloftfoto`. Liggend en staand door elkaar, dus de standaardcellen van het canvas.
 *
 * `bruiloft1a.tif` wordt door Astro niet herkend (alleen `.tiff`) en staat er als `bruiloft1a.jpg` naast.
 * `006.jpg` is een kleine kopie (1024 px) van `7.jpg` en wordt overgeslagen (zie UITGESLOTEN).
 *
 * Alt-teksten: src/data/alt-teksten.ts (op pad, "bruiloften portfolio/<bestand>"). Een foto zonder alt-tekst of twee
 * gelijke alt-teksten laat de productiebuild falen (in dev een waarschuwing).
 *
 * TODO(paul): alle alt-teksten laten controleren (namen en plaatsen zijn niet bekend en dus niet vermeld).
 */
import type { ImageMetadata } from 'astro';
import { altVoor } from './alt-teksten';
import { natuurlijk, slugify } from './portretten';

const MAP = 'bruiloften portfolio';
const ROOT = `../assets/portfolio/${MAP}/`;

/** Dubbelen binnen de map: dezelfde foto in lage resolutie. */
const UITGESLOTEN = new Set<string>(['006.jpg']);

export interface Bruiloftfoto {
  /** Uniek, alleen a-z, 0-9 en koppeltekens (afgeleid van de bestandsnaam). */
  id: string;
  /** Bestandsnaam met extensie, relatief aan src/assets/portfolio/bruiloften portfolio/. */
  file: string;
  width: number;
  height: number;
  alt: string;
  image: ImageMetadata;
  /** Geen serie: het canvas toont dan geen bijschrift. */
  series: null;
  seriesTitle: null;
  seriesHref: null;
}

function build(): Bruiloftfoto[] {
  const modules = import.meta.glob<{ default: ImageMetadata }>(
    [
      '../assets/portfolio/bruiloften portfolio/*.{jpg,jpeg,png,webp,avif,tiff,JPG,JPEG,PNG,TIFF}',
      // UITGESLOTEN (006.jpg) niet importeren: anders staat het origineel in /_astro.
      '!../assets/portfolio/bruiloften portfolio/006.jpg',
    ],
    { eager: true },
  );
  const entries = Object.entries(modules)
    .map(([path, mod]) => ({ file: path.slice(ROOT.length), image: mod.default }))
    .filter(({ file }) => !UITGESLOTEN.has(file))
    .sort((a, b) => natuurlijk(a.file, b.file));

  const problems: string[] = [];
  const seen = new Map<string, string>();
  for (const { file } of entries) {
    const alt = altVoor(MAP, file);
    if (!alt) {
      problems.push(`geen alt-tekst voor "${file}"`);
      continue;
    }
    const other = seen.get(alt);
    if (other) problems.push(`"${file}" en "${other}" hebben dezelfde alt-tekst`);
    seen.set(alt, file);
  }
  if (problems.length > 0) {
    const message = `src/data/bruiloften.ts:\n- ${problems.join('\n- ')}`;
    if (import.meta.env.PROD) throw new Error(message);
    console.warn(`[bruiloften] ${message}`);
  }

  const used = new Set<string>();
  return entries.map(({ file, image }): Bruiloftfoto => {
    const stem = `bruiloft-${slugify(file.replace(/\.[^.]+$/, ''))}`;
    let id = stem;
    for (let n = 2; used.has(id); n += 1) id = `${stem}-${n}`;
    used.add(id);
    return {
      id,
      file,
      width: image.width,
      height: image.height,
      alt: altVoor(MAP, file) ?? 'Bruiloftfoto door Paul Breuker',
      image,
      series: null,
      seriesTitle: null,
      seriesHref: null,
    };
  });
}

export const bruiloften: Bruiloftfoto[] = build();
