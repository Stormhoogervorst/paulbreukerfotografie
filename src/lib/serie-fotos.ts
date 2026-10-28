/**
 * Foto's en indeling van een projectpagina (src/pages/[project].astro).
 *
 * - Bron: src/assets/portfolio/<slug>/ (de mapnaam is hoofdletterongevoelig: "Asfalt" hoort bij /asfalt). Op bestandsnaam
 *   gesorteerd, met cijfers als getal ("2" vóór "10"), dus cijfervoorvoegsels als 01-, 02- bepalen de volgorde.
 * - Maten komen uit de bronbestanden (astro:assets), niet uit de data.
 * - Alt-tekst: `altTeksten[bestandsnaam]` in src/data/series.ts, anders een algemene tekst (en een waarschuwing).
 */
import type { ImageMetadata } from 'astro';
import type { Serie } from '../data/series';

export interface SerieFoto {
  /** Bestandsnaam met extensie; `null` voor de omslag als die niet in de map van het project staat. */
  bestand: string | null;
  image: ImageMetadata;
  width: number;
  height: number;
  /** Breedte gedeeld door hoogte van het bronbestand. */
  verhouding: number;
  alt: string;
}

export interface SerieRij {
  fotos: Array<SerieFoto & { sizes: string }>;
}

/** Bruikbare breedte van het raster op desktop: 100vw min twee gutters (11vw) min de ruimte tussen twee foto's (1.7vw). */
const RIJ_BREEDTE_VW = 87.3;
/** Eén losse foto aan het eind: ongeveer de breedte van een gemiddelde foto in de rijen. */
const ENKELE_FOTO_VW = 46;
/** Mobiel: één foto per rij tussen de gutters. */
const MOBIEL_VW = 89;

const modules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/portfolio/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}',
  { eager: true },
);

const ROOT = '../assets/portfolio/';

const vergelijk = new Intl.Collator('nl', { numeric: true, sensitivity: 'base' }).compare;

const verhoudingVan = (image: ImageMetadata): number => Math.round((image.width / image.height) * 10000) / 10000;

/** Alle foto's in de map van een project, op bestandsnaam gesorteerd. */
export function fotosVan(serie: Serie): SerieFoto[] {
  return Object.entries(modules)
    .flatMap(([pad, module]) => {
      const [map, ...rest] = pad.slice(ROOT.length).split('/');
      if (rest.length !== 1 || map.toLowerCase() !== serie.slug.toLowerCase()) return [];
      const bestand = rest[0];
      const image = module.default;
      const alt = serie.altTeksten?.[bestand]?.trim();
      if (!alt) console.warn(`[serie] ${serie.slug}: geen alt-tekst voor "${bestand}" (algemene tekst gebruikt).`);
      return [
        {
          bestand,
          image,
          width: image.width,
          height: image.height,
          verhouding: verhoudingVan(image),
          alt: alt || `Foto uit de serie ${serie.titel}`,
        },
      ];
    })
    .sort((a, b) => vergelijk(a.bestand ?? '', b.bestand ?? ''));
}

/**
 * Deelt de foto's in rijen van twee (volgorde van de lijst). Elke foto krijgt `sizes` uit zijn aandeel in de rij:
 * rijbreedte × zijn verhouding / som van de verhoudingen. Een losse foto aan het eind krijgt de enkele-fotobreedte.
 */
export function rijenVan(fotos: SerieFoto[]): SerieRij[] {
  const rijen: SerieRij[] = [];
  for (let i = 0; i < fotos.length; i += 2) {
    const paar = fotos.slice(i, i + 2);
    const som = paar.reduce((totaal, foto) => totaal + foto.verhouding, 0);
    rijen.push({
      fotos: paar.map((foto) => {
        const desktop = paar.length === 1 ? ENKELE_FOTO_VW : (RIJ_BREEDTE_VW * foto.verhouding) / som;
        return { ...foto, sizes: `(min-width: 700px) ${desktop.toFixed(1)}vw, ${MOBIEL_VW}vw` };
      }),
    });
  }
  return rijen;
}

/** Klasse voor de grootte van de H1, afhankelijk van de lengte van de titel (zodat hij op hooguit twee regels past). */
export function titelKlasse(titel: string): 'kort' | 'middel' | 'lang' {
  const lengte = [...titel].length;
  if (lengte <= 10) return 'kort';
  if (lengte <= 16) return 'middel';
  return 'lang';
}
