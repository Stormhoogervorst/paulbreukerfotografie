/**
 * Lightbox op de projectpagina's (src/pages/[project].astro): koppelt de foto's van de pagina aan de gedeelde lightbox
 * (src/scripts/lightbox.ts, markup en stijl in src/components/Lightbox.astro).
 *
 * Wordt pas geladen bij de eerste klik (dynamische import vanuit [project].astro) en leest dan de links
 * `a[data-lightbox]` in de volgorde van het document. Elke link heeft de grote versie als `href`, met de afmetingen van de
 * foto (`data-breedte`, `data-hoogte`) en het gemiddelde kleurvlak (`data-kleur`); de alt-tekst komt uit de <img> erin.
 * De tijdelijke weergave is de miniatuur die de pagina al geladen heeft (`currentSrc`); is een foto nog niet geladen
 * (lazy), dan toont de lightbox het kleurvlak tot de grote versie binnen is.
 */
import { createLightbox, type Lightbox, type LightboxItem } from './lightbox';

const SELECTOR = 'a[data-lightbox]';

let links: HTMLAnchorElement[] = [];
let lightbox: Lightbox | null = null;

function itemVan(link: HTMLAnchorElement): LightboxItem {
  const img = link.querySelector('img');
  return {
    width: Number(link.dataset.breedte) || 3,
    height: Number(link.dataset.hoogte) || 2,
    alt: img?.alt ?? '',
    color: link.dataset.kleur ?? '#e6e6e6',
    get thumbSrc() {
      return img && img.complete && img.naturalWidth > 0 ? img.currentSrc : '';
    },
    largeSrc: link.href,
  };
}

export function openSerieLightbox(link: HTMLAnchorElement) {
  if (!lightbox) {
    const dialog = document.querySelector<HTMLDialogElement>('dialog.lightbox');
    if (!dialog) {
      window.location.assign(link.href);
      return;
    }
    links = [...document.querySelectorAll<HTMLAnchorElement>(SELECTOR)];
    lightbox = createLightbox(dialog, links.map(itemVan), { wrap: false, focusSluiten: true, swipe: true });
  }
  const index = links.indexOf(link);
  if (index >= 0) lightbox.open(index, link);
}
