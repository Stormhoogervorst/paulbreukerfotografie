/**
 * Alle portretten van Paul voor /portfolio/portretten (src/pages/portfolio/portretten.astro).
 *
 * Bron: src/assets/portfolio/portretten/ (alle afbeeldingen in die map, nu 78), op bestandsnaam gesorteerd (cijfers
 * numeriek en vóór letters, hoofdletters genegeerd: een voorvoegsel als 01-, 02- bepaalt dus de volgorde). Breedte en hoogte komen uit het
 * bronbestand (EXIF-oriëntatie meegenomen). Het canvas gebruikt alleen `portretten` en het type `Portret`.
 *
 * `.tif` wordt door Astro niet als afbeelding herkend (alleen `.tiff`): van 2m.tif, 3.tif, 45.tif en oma en 52.tif zijn daarom
 * JPEG-versies (kwaliteit 92, zelfde afmetingen) naast de originelen gezet. De .tif-bestanden zelf staan niet meer in src/assets:
 * ze zijn verplaatst naar _originelen/ (zelfde mappenstructuur, in .gitignore en .vercelignore).
 *
 * Dezelfde foto's staan (ontdubbeld) ook op /portfolio (src/data/portfolio.ts); /portfolio/portretten toont de hele map.
 *
 * Alt-teksten: src/data/alt-teksten.ts (op pad, "portretten/<bestand>"; beschreven naar wat op de foto te zien is; geen
 * namen). Een foto zonder alt-tekst of twee gelijke alt-teksten laat de productiebuild falen (in dev een waarschuwing).
 *
 * TODO(paul): alle alt-teksten laten controleren. In src/data/alt-teksten.ts staan TODO(paul)'s bij foto's waar ik twijfel
 * over wat er te zien is of waar iets anders nagekeken moet worden (herkomst, credit, resolutie).
 */
import type { ImageMetadata } from 'astro';
import { altVoor } from './alt-teksten';

export interface Portret {
  /** Uniek, alleen a-z, 0-9 en koppeltekens (afgeleid van de bestandsnaam). */
  id: string;
  /** Bestandsnaam met extensie, relatief aan src/assets/portfolio/portretten/. */
  file: string;
  width: number;
  height: number;
  alt: string;
  image: ImageMetadata;
  /** Geen serie: dit zijn losse portretten (het canvas toont dan geen bijschrift). */
  series: null;
  seriesTitle: null;
  seriesHref: null;
}

const ROOT = '../assets/portfolio/portretten/';

export function slugify(value: string): string {
  return (
    value
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'foto'
  );
}

/**
 * Natuurlijke volgorde op bestandsnaam: hoofdletters genegeerd, cijfers als getal (2 vóór 10), cijfers vóór letters
 * (en dus 01- vóór _MG_ vóór a001).
 */
export function natuurlijk(a: string, b: string): number {
  const stukjes = (value: string) => value.toLowerCase().match(/\d+|\D+/g) ?? [];
  const x = stukjes(a);
  const y = stukjes(b);
  for (let i = 0; i < Math.min(x.length, y.length); i += 1) {
    if (x[i] === y[i]) continue;
    const getallen = /^\d/.test(x[i]) && /^\d/.test(y[i]);
    if (getallen) {
      const verschil = Number(x[i]) - Number(y[i]);
      if (verschil !== 0) return verschil;
    } else {
      return x[i] < y[i] ? -1 : 1;
    }
  }
  return x.length - y.length;
}

function build(): Portret[] {
  const modules = import.meta.glob<{ default: ImageMetadata }>(
    '../assets/portfolio/portretten/*.{jpg,jpeg,png,webp,avif,tiff,JPG,JPEG,PNG,TIFF}',
    { eager: true },
  );
  const entries = Object.entries(modules)
    .map(([path, mod]) => ({ file: path.slice(ROOT.length), image: mod.default }))
    .sort((a, b) => natuurlijk(a.file, b.file));

  const problems: string[] = [];
  const seen = new Map<string, string>();
  for (const { file } of entries) {
    const alt = altVoor('portretten', file);
    if (!alt) {
      problems.push(`geen alt-tekst voor "${file}"`);
      continue;
    }
    const other = seen.get(alt);
    if (other) problems.push(`"${file}" en "${other}" hebben dezelfde alt-tekst`);
    seen.set(alt, file);
  }
  if (problems.length > 0) {
    const message = `src/data/portretten.ts:\n- ${problems.join('\n- ')}`;
    if (import.meta.env.PROD) throw new Error(message);
    console.warn(`[portretten] ${message}`);
  }

  const used = new Set<string>();
  return entries.map(({ file, image }): Portret => {
    const stem = slugify(file.replace(/\.[^.]+$/, ''));
    let id = stem;
    for (let n = 2; used.has(id); n += 1) id = `${stem}-${n}`;
    used.add(id);
    return {
      id,
      file,
      width: image.width,
      height: image.height,
      alt: altVoor('portretten', file) ?? 'Portret door Paul Breuker',
      image,
      series: null,
      seriesTitle: null,
      seriesHref: null,
    };
  });
}

export const portretten: Portret[] = build();
